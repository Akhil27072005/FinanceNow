const { normalizePaymentQuery } = require('./normalizeInput');

/** Minimum confidence to accept a brand match (non-generic queries). */
const DEFAULT_CONFIDENCE_THRESHOLD = 0.55;

/** Stricter threshold for vague/generic payment terms (upi, wallet, etc.). */
const GENERIC_CONFIDENCE_THRESHOLD = 0.82;

/**
 * Terms that are too generic to trust a weak Brandfetch match.
 * Normalized form (no spaces) is used for lookup.
 */
const GENERIC_PAYMENT_TERMS = new Set([
  'upi',
  'wallet',
  'wallets',
  'creditcard',
  'credit',
  'card',
  'debitcard',
  'debit',
  'cash',
  'bank',
  'banking',
  'payment',
  'pay',
  'money',
  'transfer',
  'netbanking',
  'banktransfer'
]);

/**
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
function levenshteinDistance(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const matrix = Array.from({ length: a.length + 1 }, () =>
    new Array(b.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[a.length][b.length];
}

/**
 * @param {string} a
 * @param {string} b
 * @returns {number} Similarity ratio between 0 and 1
 */
function levenshteinSimilarity(a, b) {
  if (!a || !b) return 0;
  if (a === b) return 1;

  const distance = levenshteinDistance(a, b);
  const maxLen = Math.max(a.length, b.length);
  return 1 - distance / maxLen;
}

/**
 * True when all characters of `short` appear in order within `long` (abbreviation).
 * e.g. "gpay" is a subsequence of "googlepay"
 *
 * @param {string} short
 * @param {string} long
 * @returns {boolean}
 */
function isSubsequence(short, long) {
  if (!short || !long || short.length > long.length) return false;

  let shortIndex = 0;
  for (let i = 0; i < long.length && shortIndex < short.length; i++) {
    if (long[i] === short[shortIndex]) {
      shortIndex += 1;
    }
  }

  return shortIndex === short.length;
}

/**
 * Extract a comparable slug from a domain (pay.google.com -> paygooglecom segments).
 *
 * @param {string} domain
 * @returns {string}
 */
function domainToComparableSlug(domain) {
  if (!domain || typeof domain !== 'string') return '';

  const host = domain
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .split('/')[0]
    .toLowerCase();

  return normalizePaymentQuery(host.replace(/\./g, ''));
}

const SUSPICIOUS_NAME_PATTERN =
  /casino|gambling|betting|recharge|cpa|blogspot|africa|replica|fake/i;

const PREFERRED_TLDS = new Set(['com', 'net', 'io', 'google', 'apple', 'in']);

/**
 * Penalize low-quality or misleading brand candidates.
 *
 * @param {number} score
 * @param {string} normalizedInput
 * @param {{ name?: string, domain?: string }} brand
 * @returns {number}
 */
function applyBrandPenalties(score, normalizedInput, brand) {
  let adjusted = score;
  const name = brand.name || '';
  const domain = (brand.domain || '').toLowerCase();
  const tld = domain.split('.').pop() || '';

  if (SUSPICIOUS_NAME_PATTERN.test(name)) {
    adjusted -= 0.35;
  }

  const inputWords = normalizedInput.length >= 6 ? 1 : 0;
  const brandWords = name.trim().split(/\s+/).length;
  if (brandWords > Math.max(2, inputWords + 1)) {
    adjusted -= 0.12 * (brandWords - 2);
  }

  if (
    normalizedInput === normalizePaymentQuery(name) &&
    normalizedInput.length <= 5 &&
    !PREFERRED_TLDS.has(tld)
  ) {
    adjusted -= 0.2;
  }

  if (PREFERRED_TLDS.has(tld) || domain.endsWith('.com')) {
    adjusted += 0.03;
  }

  if (domain.includes('google') && /pay/i.test(name)) {
    adjusted += 0.08;
  }

  return Math.max(0, Math.min(1, adjusted));
}

/**
 * Score how well a Brandfetch candidate matches normalized user input.
 *
 * @param {string} normalizedInput
 * @param {{ name?: string, domain?: string }} brand
 * @returns {number} Confidence between 0 and 1
 */
function scoreBrandMatch(normalizedInput, brand) {
  if (!normalizedInput || !brand) return 0;

  const normalizedName = normalizePaymentQuery(brand.name || '');
  const domainSlug = domainToComparableSlug(brand.domain || '');

  const rawScores = [
    normalizedInput === normalizedName ? 1 : 0,
    normalizedName.includes(normalizedInput) || normalizedInput.includes(normalizedName)
      ? 0.88
      : 0,
    levenshteinSimilarity(normalizedInput, normalizedName),
    isSubsequence(normalizedInput, normalizedName) ? 0.86 : 0,
    isSubsequence(normalizedName, normalizedInput) ? 0.82 : 0,
    levenshteinSimilarity(normalizedInput, domainSlug),
    domainSlug.includes(normalizedInput) ? 0.72 : 0
  ];

  const base = Math.max(...rawScores);
  return applyBrandPenalties(base, normalizedInput, brand);
}

/**
 * Pick the best candidate from search results using confidence scoring.
 *
 * @param {string} normalizedInput
 * @param {Array<{ name?: string, domain?: string }>} candidates
 * @returns {{ brand: object, confidence: number } | null}
 */
function findBestBrandMatch(normalizedInput, candidates) {
  if (!normalizedInput || !Array.isArray(candidates) || candidates.length === 0) {
    return null;
  }

  if (GENERIC_PAYMENT_TERMS.has(normalizedInput)) {
    return null;
  }

  const threshold = DEFAULT_CONFIDENCE_THRESHOLD;

  let best = null;

  for (const candidate of candidates) {
    if (!candidate?.domain) continue;

    const confidence = scoreBrandMatch(normalizedInput, candidate);
    if (confidence >= threshold && (!best || confidence > best.confidence)) {
      best = { brand: candidate, confidence };
    }
  }

  return best;
}

/**
 * @param {string} normalizedInput
 * @returns {boolean}
 */
function isGenericPaymentTerm(normalizedInput) {
  return GENERIC_PAYMENT_TERMS.has(normalizedInput);
}

module.exports = {
  DEFAULT_CONFIDENCE_THRESHOLD,
  GENERIC_CONFIDENCE_THRESHOLD,
  GENERIC_PAYMENT_TERMS,
  scoreBrandMatch,
  findBestBrandMatch,
  isGenericPaymentTerm,
  levenshteinSimilarity,
  isSubsequence
};
