const CARD_ROLES = new Set(['credit', 'debit']);
const ALLOWED_STRING_KEYS = new Set([
  'last4',
  'cardRole',
  'network',
  'networkLogoUrl',
  'bankName',
  'bankLogoUrl',
  'bankDomain',
  'identifier'
]);

/**
 * Sanitize payment method metadata from client input.
 * @param {unknown} raw
 * @param {string} [type]
 * @returns {object|null}
 */
function sanitizePaymentMethodMetadata(raw, type) {
  if (raw === null || raw === undefined) return null;
  if (typeof raw !== 'object' || Array.isArray(raw)) {
    return null;
  }

  const out = {};

  for (const key of ALLOWED_STRING_KEYS) {
    if (raw[key] === undefined || raw[key] === null) continue;
    if (typeof raw[key] !== 'string') continue;
    const trimmed = raw[key].trim();
    if (!trimmed) continue;
    out[key] = trimmed.slice(0, 500);
  }

  if (out.last4) {
    const digits = out.last4.replace(/\D/g, '');
    if (digits.length === 4) {
      out.last4 = digits;
    } else {
      delete out.last4;
    }
  }

  if (out.cardRole && !CARD_ROLES.has(out.cardRole)) {
    delete out.cardRole;
  }

  if (type === 'card') {
    delete out.identifier;
  }

  if (type === 'cash') {
    delete out.bankName;
    delete out.bankLogoUrl;
    delete out.bankDomain;
    delete out.identifier;
  }

  return Object.keys(out).length > 0 ? out : null;
}

module.exports = {
  sanitizePaymentMethodMetadata
};
