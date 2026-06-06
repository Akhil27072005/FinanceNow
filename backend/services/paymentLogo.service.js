const { normalizePaymentQuery } = require('../utils/paymentLogo/normalizeInput');
const {
  findBestBrandMatch,
  isGenericPaymentTerm
} = require('../utils/paymentLogo/similarity');
const { buildSearchQueries } = require('../utils/paymentLogo/searchQueries');
const paymentLogoCache = require('../utils/paymentLogo/paymentLogoCache');
const brandfetchApi = require('../utils/paymentLogo/brandfetchApi');

const NOT_RECOGNIZED_MESSAGE = 'Payment method not recognized';

/**
 * Resolve a payment method name to a Brandfetch logo via Search API.
 * Uses in-memory + Redis cache; debouncing is handled on the client when integrated.
 *
 * @param {string} rawQuery - User-typed payment method name
 * @returns {Promise<object>}
 */
async function resolvePaymentLogo(rawQuery) {
  const query = typeof rawQuery === 'string' ? rawQuery.trim() : '';
  const normalizedQuery = normalizePaymentQuery(query);

  if (!normalizedQuery) {
    return {
      success: true,
      recognized: false,
      query,
      normalizedQuery: '',
      message: 'Payment method name is required',
      errorCode: 'EMPTY_INPUT'
    };
  }

  if (isGenericPaymentTerm(normalizedQuery)) {
    const genericPayload = buildNotRecognizedPayload(query, normalizedQuery, {
      reason: 'GENERIC_TERM'
    });
    await paymentLogoCache.set(normalizedQuery, genericPayload, { negative: true });
    return { ...genericPayload, cached: false };
  }

  const cached = await paymentLogoCache.get(normalizedQuery);
  if (cached !== undefined) {
    return {
      ...cached,
      cached: true
    };
  }

  let candidates;
  try {
    candidates = await fetchMergedBrandCandidates(query, normalizedQuery);
  } catch (error) {
    if (error.code === 'BRANDFETCH_CONFIG_MISSING') {
      throw error;
    }

    const failurePayload = {
      success: false,
      recognized: false,
      query,
      normalizedQuery,
      message: 'Unable to search payment brands at this time',
      errorCode: error.code || 'BRANDFETCH_API_FAILURE'
    };

    return failurePayload;
  }

  if (!candidates.length) {
    const notFoundPayload = buildNotRecognizedPayload(query, normalizedQuery, {
      reason: 'NO_RESULTS'
    });
    await paymentLogoCache.set(normalizedQuery, notFoundPayload, { negative: true });
    return { ...notFoundPayload, cached: false };
  }

  const match = findBestBrandMatch(normalizedQuery, candidates);

  if (!match) {
    const notFoundPayload = buildNotRecognizedPayload(query, normalizedQuery, {
      reason: 'LOW_CONFIDENCE',
      candidateCount: candidates.length
    });
    await paymentLogoCache.set(normalizedQuery, notFoundPayload, { negative: true });
    return { ...notFoundPayload, cached: false };
  }

  const domain = brandfetchApi.sanitizeDomain(match.brand.domain);

  if (!domain) {
    const notFoundPayload = buildNotRecognizedPayload(query, normalizedQuery, {
      reason: 'INVALID_DOMAIN'
    });
    await paymentLogoCache.set(normalizedQuery, notFoundPayload, { negative: true });
    return { ...notFoundPayload, cached: false };
  }

  const { clientId } = brandfetchApi.getBrandfetchConfig();
  const logoUrl = brandfetchApi.buildLogoUrl(domain, clientId);

  const successPayload = {
    success: true,
    recognized: true,
    query,
    normalizedQuery,
    brandName: match.brand.name || null,
    domain,
    logoUrl,
    confidence: Math.round(match.confidence * 100) / 100,
    brandId: match.brand.brandId || null
  };

  await paymentLogoCache.set(normalizedQuery, successPayload);
  return { ...successPayload, cached: false };
}

/**
 * @param {string} query
 * @param {string} normalizedQuery
 * @param {object} [meta]
 * @returns {object}
 */
function buildNotRecognizedPayload(query, normalizedQuery, meta = {}) {
  return {
    success: true,
    recognized: false,
    query,
    normalizedQuery,
    message: NOT_RECOGNIZED_MESSAGE,
    errorCode: meta.reason || 'NOT_RECOGNIZED',
    ...meta
  };
}

/**
 * Run multiple Brandfetch searches (normalized, spaced, title case) and merge unique domains.
 *
 * @param {string} rawQuery
 * @param {string} normalizedQuery
 * @returns {Promise<Array<{ name?: string, domain?: string }>>}
 */
async function fetchMergedBrandCandidates(rawQuery, normalizedQuery) {
  const searchQueries = buildSearchQueries(rawQuery, normalizedQuery);
  const seenDomains = new Set();
  const merged = [];

  for (const searchQuery of searchQueries) {
    const results = await brandfetchApi.searchBrands(searchQuery);

    for (const brand of results) {
      const domain = brandfetchApi.sanitizeDomain(brand?.domain);
      if (!domain || seenDomains.has(domain)) continue;

      seenDomains.add(domain);
      merged.push({ ...brand, domain });
    }
  }

  return merged;
}

module.exports = {
  resolvePaymentLogo,
  fetchMergedBrandCandidates,
  NOT_RECOGNIZED_MESSAGE
};
