/**
 * Manual test runner for payment logo detection.
 *
 * Usage (from backend/):
 *   node scripts/testPaymentLogoDetection.js
 *   node scripts/testPaymentLogoDetection.js "gpay" "phonepe" "upi"
 *
 * Requires BRANDFETCH_CLIENT_ID in .env
 */

require('dotenv').config();

const paymentLogoService = require('../services/paymentLogo.service');
const { normalizePaymentQuery } = require('../utils/paymentLogo/normalizeInput');
const {
  clearMemoryCache,
  CACHE_PREFIX
} = require('../utils/paymentLogo/paymentLogoCache');
const redisCache = require('../utils/cache');

const DEFAULT_QUERIES = [
  'google pay',
  'gpay',
  'g pay',
  'g-pay',
  'googlepay',
  'phonepe',
  'paytm',
  'visa',
  'mastercard',
  'paypal',
  'upi',
  'credit card',
  'wallet'
];

async function runQuery(query) {
  const normalized = normalizePaymentQuery(query);
  const started = Date.now();

  try {
    const result = await paymentLogoService.resolvePaymentLogo(query);
    const ms = Date.now() - started;

    if (result.recognized) {
      console.log(`✓ "${query}" -> ${result.brandName} (${result.domain})`);
      console.log(`  normalized: ${normalized} | confidence: ${result.confidence} | ${ms}ms | cached: ${result.cached}`);
      console.log(`  logo: ${result.logoUrl}`);
    } else {
      console.log(`✗ "${query}" -> not recognized (${result.errorCode || result.message})`);
      console.log(`  normalized: ${normalized} | ${ms}ms | cached: ${result.cached}`);
    }
  } catch (error) {
    console.error(`! "${query}" -> error: ${error.message}`);
  }

  console.log('');
}

async function main() {
  const queries = process.argv.slice(2);
  const toRun = queries.length > 0 ? queries : DEFAULT_QUERIES;

  if (!process.env.BRANDFETCH_CLIENT_ID) {
    console.error('Missing BRANDFETCH_CLIENT_ID in environment (.env)');
    process.exit(1);
  }

  console.log('Payment logo detection test\n');
  clearMemoryCache();

  for (const query of toRun) {
    const key = `${CACHE_PREFIX}${require('../utils/paymentLogo/normalizeInput').normalizePaymentQuery(query)}`;
    await redisCache.del(key);
  }

  for (const query of toRun) {
    await runQuery(query);
  }

  console.log('Re-running first query to verify cache...');
  if (toRun[0]) {
    await runQuery(toRun[0]);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
