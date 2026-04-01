const { Redis } = require('@upstash/redis');

/**
 * Redis client configuration for Upstash
 * Uses REST API for serverless compatibility
 */
let redis = null;

/**
 * Initialize Redis connection
 * @returns {Redis|null} Redis client instance or null if configuration is missing
 */
const initRedis = () => {
  try {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      console.warn('⚠️  Redis configuration missing. Caching will be disabled.');
      console.warn('   Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env');
      return null;
    }

    redis = new Redis({
      url: url,
      token: token
    });

    console.log('✅ Redis connected successfully');
    return redis;
  } catch (error) {
    console.error('❌ Redis connection error:', error.message);
    return null;
  }
};

/**
 * Get Redis client instance
 * @returns {Redis|null} Redis client or null if not initialized
 */
const getRedis = () => {
  if (!redis) {
    redis = initRedis();
  }
  return redis;
};

/**
 * Check if Redis is available
 * @returns {boolean} True if Redis is configured and available
 */
const isRedisAvailable = () => {
  return getRedis() !== null;
};

module.exports = {
  initRedis,
  getRedis,
  isRedisAvailable
};

