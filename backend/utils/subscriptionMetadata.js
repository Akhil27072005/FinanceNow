const ALLOWED_STRING_KEYS = new Set(['logoUrl', 'brandName', 'brandDomain']);

/**
 * Sanitize subscription metadata from client input.
 * @param {unknown} raw
 * @returns {object|null}
 */
function sanitizeSubscriptionMetadata(raw) {
  if (raw === null || raw === undefined) return null;
  if (typeof raw !== 'object' || Array.isArray(raw)) return null;

  const out = {};
  for (const key of ALLOWED_STRING_KEYS) {
    if (raw[key] === undefined || raw[key] === null) continue;
    if (typeof raw[key] !== 'string') continue;
    const trimmed = raw[key].trim();
    if (!trimmed) continue;
    out[key] = trimmed.slice(0, 500);
  }

  return Object.keys(out).length > 0 ? out : null;
}

module.exports = { sanitizeSubscriptionMetadata };
