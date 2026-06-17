const { getRedis, isRedisAvailable } = require('../config/redis');

/**
 * Cache utility functions for Redis
 * Provides graceful degradation if Redis is unavailable
 */

/**
 * Get value from cache
 * @param {string} key - Cache key
 * @returns {Promise<any|null>} Cached value or null if not found/unavailable
 */
const get = async (key) => {
  if (!isRedisAvailable()) {
    return null;
  }

  try {
    const redis = getRedis();
    const value = await redis.get(key);
    
    if (value === null) {
      return null;
    }

    // Parse JSON if value is a string
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (e) {
        // If parsing fails, return the string as-is
        return value;
      }
    }

    return value;
  } catch (error) {
    console.error(`Cache get error for key "${key}":`, error.message);
    return null; // Graceful degradation
  }
};

/**
 * Set value in cache with TTL
 * @param {string} key - Cache key
 * @param {any} value - Value to cache (will be JSON stringified)
 * @param {number} ttlSeconds - Time to live in seconds
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
const set = async (key, value, ttlSeconds = 3600) => {
  if (!isRedisAvailable()) {
    return false;
  }

  try {
    const redis = getRedis();
    const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
    
    await redis.setex(key, ttlSeconds, serializedValue);
    return true;
  } catch (error) {
    console.error(`Cache set error for key "${key}":`, error.message);
    return false; // Graceful degradation
  }
};

/**
 * Delete a single key from cache
 * @param {string} key - Cache key to delete
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
const del = async (key) => {
  if (!isRedisAvailable()) {
    return false;
  }

  try {
    const redis = getRedis();
    await redis.del(key);
    return true;
  } catch (error) {
    console.error(`Cache delete error for key "${key}":`, error.message);
    return false; // Graceful degradation
  }
};

/**
 * Delete all keys matching a pattern
 * Note: Upstash Redis REST API doesn't support SCAN, so we'll use a workaround
 * For patterns like "analytics:userId:*", we'll need to track keys or use a different approach
 * @param {string} pattern - Pattern to match (supports * wildcard)
 * @returns {Promise<number>} Number of keys deleted
 */
const delPattern = async (pattern) => {
  if (!isRedisAvailable()) {
    return 0;
  }

  try {
    const redis = getRedis();
    
    // Upstash REST API doesn't support SCAN, so we use a workaround
    // For common patterns, we can use a more specific approach
    // This is a simplified version - for production, consider tracking keys in a set
    
    // If pattern ends with :*, we can use a more targeted approach
    if (pattern.endsWith(':*')) {
      const prefix = pattern.slice(0, -2);
      // For now, we'll return 0 and log a warning
      // In production, you might want to maintain a set of keys per prefix
      console.warn(`Pattern deletion "${pattern}" not fully supported. Consider using specific keys.`);
      return 0;
    }

    // For exact matches or simple patterns, use del
    await redis.del(pattern);
    return 1;
  } catch (error) {
    console.error(`Cache delete pattern error for "${pattern}":`, error.message);
    return 0;
  }
};

/**
 * Bump cache namespace version for a user.
 * Used to invalidate a group of keys without wildcard deletes (Upstash REST has no SCAN).
 * @param {string} userId
 * @param {string} namespace - e.g. "analytics", "transactions"
 * @returns {Promise<string|null>} new version string or null if unavailable
 */
const bumpVersion = async (userId, namespace) => {
  if (!isRedisAvailable()) {
    return null;
  }

  try {
    const redis = getRedis();
    const versionKey = `cache:version:${userId}:${namespace}`;
    const newVersion = Date.now().toString();
    await redis.set(versionKey, newVersion);
    return newVersion;
  } catch (error) {
    console.error(`Cache bumpVersion error for user "${userId}" namespace "${namespace}":`, error.message);
    return null;
  }
};

/**
 * Invalidate all analytics caches for a user
 * Since Upstash REST API doesn't support SCAN, we use a version-based approach
 * or delete specific keys we can construct. For immediate invalidation, we'll
 * update a version timestamp that can be checked, and also try to delete
 * common cache keys for recent months.
 * @param {string} userId - User ID
 * @returns {Promise<number>} Number of keys invalidated
 */
const invalidateAnalyticsCache = async (userId) => {
  if (!isRedisAvailable()) {
    return 0;
  }

  try {
    const newVersion = await bumpVersion(userId, 'analytics');
    if (newVersion) {
      console.log(`Invalidated analytics cache for user ${userId} (version: ${newVersion})`);
      return 1;
    }
    return 0;
  } catch (error) {
    console.error(`Cache invalidation error for user "${userId}":`, error.message);
    return 0;
  }
};

/**
 * Invalidate user-specific cache by patterns
 * @param {string} userId - User ID
 * @param {string[]} patterns - Array of cache key patterns to invalidate
 * @returns {Promise<number>} Number of keys invalidated
 */
const invalidateUserCache = async (userId, patterns = []) => {
  if (!isRedisAvailable()) {
    return 0;
  }

  let totalDeleted = 0;

  for (const pattern of patterns) {
    // Replace ${userId} placeholder if present
    const key = pattern.replace('${userId}', userId);
    const deleted = await delPattern(key);
    totalDeleted += deleted;
  }

  return totalDeleted;
};

/**
 * Generate cache key with version support
 * @param {string} baseKey - Base cache key
 * @param {string} userId - User ID for version lookup
 * @returns {Promise<string>} Cache key with version
 */
const getVersionedKey = async (baseKey, userId, namespace = 'analytics') => {
  if (!isRedisAvailable()) {
    return baseKey;
  }

  try {
    const redis = getRedis();
    const versionKey = `cache:version:${userId}:${namespace}`;
    const version = await redis.get(versionKey);
    
    if (version) {
      return `${baseKey}:v${version}`;
    }
    
    return baseKey;
  } catch (error) {
    return baseKey; // Fallback to base key
  }
};

/**
 * Invalidate transactions list caches for a user (version-based).
 * @param {string} userId
 * @returns {Promise<string|null>} new version string or null if unavailable
 */
const invalidateTransactionsCache = async (userId) => {
  return await bumpVersion(userId, 'transactions');
};

/**
 * Invalidate subscription alerts cache for a user
 * Deletes common cache keys for subscription alerts (different day values)
 * @param {string} userId - User ID
 * @returns {Promise<number>} Number of keys invalidated
 */
/**
 * Invalidate subscription summary cache for a user (version-based).
 * @param {string} userId
 * @returns {Promise<string|null>}
 */
const invalidateSubscriptionSummaryCache = async (userId) => {
  return await bumpVersion(userId, 'subscriptions-summary');
};

const invalidateSubscriptionAlertsCache = async (userId) => {
  if (!isRedisAvailable()) {
    return 0;
  }

  try {
    const redis = getRedis();
    let deletedCount = 0;

    // Common day values used for subscription alerts (7 is default, but users might use others)
    const commonDays = [1, 3, 7, 14, 30, 60, 90];
    
    // Delete cache keys for common day values
    for (const days of commonDays) {
      const cacheKey = `subscriptions:${userId}:alerts:${days}`;
      try {
        const result = await redis.del(cacheKey);
        if (result === 1) deletedCount++;
      } catch (error) {
        // Ignore errors for keys that don't exist
      }
    }

    return deletedCount;
  } catch (error) {
    console.error(`Cache invalidation error for subscription alerts (user "${userId}"):`, error.message);
    return 0;
  }
};

module.exports = {
  get,
  set,
  del,
  delPattern,
  bumpVersion,
  invalidateAnalyticsCache,
  invalidateTransactionsCache,
  invalidateUserCache,
  getVersionedKey,
  invalidateSubscriptionAlertsCache,
  invalidateSubscriptionSummaryCache
};

