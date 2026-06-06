const { normalizePaymentQuery } = require('./normalizeInput');

/**
 * Common tokens used to split concatenated payment names for additional Brandfetch searches.
 * Not a brand-to-domain map — only helps form spaced queries (e.g. googlepay -> "google pay").
 */
const PAYMENT_NAME_TOKENS = [
  'google',
  'apple',
  'amazon',
  'samsung',
  'phone',
  'master',
  'visa',
  'paypal',
  'paytm',
  'phonepe',
  'mastercard',
  'pay',
  'pal',
  'card',
  'bank',
  'cash',
  'pe',
  'tm'
].sort((a, b) => a.length - b.length);

/** Expand 1–2 letter prefixes for common payment abbreviations (search queries only). */
const ABBREVIATION_PREFIX_EXPANSIONS = {
  g: 'google'
};

/**
 * Split a normalized string into known tokens from left to right.
 *
 * @param {string} normalized
 * @returns {string[]|null}
 */
function tokenizePaymentName(normalized) {
  if (!normalized) return null;

  const tokens = [];
  let remaining = normalized;

  while (remaining.length > 0) {
    const match = PAYMENT_NAME_TOKENS.find((token) => remaining.startsWith(token));
    if (!match) {
      return tokens.length >= 2 ? tokens : null;
    }
    tokens.push(match);
    remaining = remaining.slice(match.length);
  }

  if (tokens.length >= 2 && remaining.length === 0) {
    return tokens;
  }

  return null;
}

/**
 * Expand short abbreviations like "gpay" into additional search phrases (e.g. "google pay").
 *
 * @param {string} normalized
 * @returns {string[]}
 */
function buildAbbreviationSearchQueries(normalized) {
  const match = normalized.match(/^([a-z]{1,2})(pay|pe|tm|pal)$/);
  if (!match) return [];

  const [, prefix, suffix] = match;
  const expandedPrefix = ABBREVIATION_PREFIX_EXPANSIONS[prefix];
  if (!expandedPrefix) return [];

  const spaced = `${expandedPrefix} ${suffix}`;
  return [spaced, toTitleCaseWords(spaced)];
}

/**
 * @param {string} value
 * @returns {string}
 */
function toTitleCaseWords(value) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Build unique Brandfetch search queries from raw + normalized input.
 *
 * @param {string} rawQuery
 * @param {string} normalizedQuery
 * @returns {string[]}
 */
function buildSearchQueries(rawQuery, normalizedQuery) {
  const queries = new Set();
  const trimmed = typeof rawQuery === 'string' ? rawQuery.trim() : '';

  if (normalizedQuery) {
    queries.add(normalizedQuery);
  }

  if (trimmed && normalizePaymentQuery(trimmed) !== trimmed.toLowerCase()) {
    queries.add(trimmed);
  }

  if (trimmed && /\s/.test(trimmed)) {
    queries.add(trimmed.replace(/\s+/g, ' ').toLowerCase());
    queries.add(toTitleCaseWords(trimmed.replace(/\s+/g, ' ')));
  }

  const tokenParts = tokenizePaymentName(normalizedQuery);
  if (tokenParts) {
    const spaced = tokenParts.join(' ');
    queries.add(spaced);
    queries.add(toTitleCaseWords(spaced));
  }

  for (const abbreviationQuery of buildAbbreviationSearchQueries(normalizedQuery)) {
    queries.add(abbreviationQuery);
  }

  return [...queries].filter(Boolean);
}

module.exports = {
  buildSearchQueries,
  buildAbbreviationSearchQueries,
  tokenizePaymentName,
  toTitleCaseWords,
  PAYMENT_NAME_TOKENS
};
