/**
 * Normalize payment method search input before Brandfetch lookup.
 * Collapses spacing variants and strips non-alphanumeric characters.
 *
 * Examples:
 *   "g pay"      -> "gpay"
 *   "Google Pay" -> "googlepay"
 *   "g-pay"      -> "gpay"
 *
 * @param {string} input - Raw user input
 * @returns {string} Normalized query (empty string if invalid)
 */
function normalizePaymentQuery(input) {
  if (input == null || typeof input !== 'string') {
    return '';
  }

  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '');
}

module.exports = {
  normalizePaymentQuery
};
