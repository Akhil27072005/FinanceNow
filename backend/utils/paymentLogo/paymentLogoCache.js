const redisCache = require('../cache');

const MEMORY_CACHE = new Map();
const CACHE_PREFIX = 'paymentLogo:';

/** Successful resolves are cached longer than negative (not found) results. */
const POSITIVE_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days
const NEGATIVE_TTL_SECONDS = 60 * 60; // 1 hour

/**
 * In-memory + optional Redis cache for payment logo resolution.
 * Key = normalized user input, value = resolved payload or negative sentinel.
 */

/**
 * @param {string} normalizedKey
 * @returns {Promise<object|null|undefined>} undefined = cache miss
 */
async function get(normalizedKey) {
  if (!normalizedKey) return undefined;

  if (MEMORY_CACHE.has(normalizedKey)) {
    return MEMORY_CACHE.get(normalizedKey);
  }

  const redisKey = `${CACHE_PREFIX}${normalizedKey}`;
  const cached = await redisCache.get(redisKey);

  if (cached !== null && cached !== undefined) {
    MEMORY_CACHE.set(normalizedKey, cached);
    return cached;
  }

  return undefined;
}

/**
 * @param {string} normalizedKey
 * @param {object} value - Resolved result (recognized true/false)
 * @param {{ negative?: boolean }} [options]
 * @returns {Promise<void>}
 */
async function set(normalizedKey, value, options = {}) {
  if (!normalizedKey) return;

  MEMORY_CACHE.set(normalizedKey, value);

  const ttl = options.negative ? NEGATIVE_TTL_SECONDS : POSITIVE_TTL_SECONDS;
  const redisKey = `${CACHE_PREFIX}${normalizedKey}`;
  await redisCache.set(redisKey, value, ttl);
}

/**
 * Clear in-memory cache (useful in tests).
 */
function clearMemoryCache() {
  MEMORY_CACHE.clear();
}

module.exports = {
  get,
  set,
  clearMemoryCache,
  CACHE_PREFIX,
  POSITIVE_TTL_SECONDS,
  NEGATIVE_TTL_SECONDS
};
