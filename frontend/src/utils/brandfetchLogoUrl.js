const BRANDFETCH_HOST = 'cdn.brandfetch.io';

const PATH_SKIP = new Set([
  'w',
  'h',
  'theme',
  'fallback',
  'type',
  'light',
  'dark',
  'transparent',
  'icon',
  'logo',
  'symbol',
  'lettermark',
  'brandfetch',
  '404',
  'domain',
  'ticker',
  'isin',
  'crypto'
]);

/**
 * Extract brand identifier (usually domain) from a Brandfetch CDN path.
 * @param {string} pathname
 * @returns {string|null}
 */
export function extractBrandfetchDomain(pathname) {
  const parts = pathname.split('/').filter(Boolean);
  if (!parts.length) return null;

  if (['ticker', 'isin', 'crypto'].includes(parts[0])) return null;

  let i = parts[0] === 'domain' ? 1 : 0;

  for (; i < parts.length; i += 1) {
    const part = parts[i];
    if (part === 'w' || part === 'h') {
      i += 1;
      continue;
    }
    if (PATH_SKIP.has(part)) continue;
    if (/^\d+$/.test(part)) continue;
    if (/\.(svg|png|webp|jpe?g)$/i.test(part)) continue;

    try {
      const decoded = decodeURIComponent(part);
      if (decoded.includes('.') || decoded.startsWith('id_')) return decoded;
    } catch {
      if (part.includes('.') || part.startsWith('id_')) return part;
    }
  }

  return null;
}

export function isBrandfetchCdnUrl(url) {
  if (typeof url !== 'string' || !url.trim()) return false;
  try {
    return new URL(url.trim()).hostname === BRANDFETCH_HOST;
  } catch {
    return false;
  }
}

/**
 * Build a Brandfetch CDN URL that returns a visible icon (not transparent placeholder).
 *
 * @param {string} domain
 * @param {string} clientId
 * @param {{ onDark?: boolean, size?: number }} [options]
 */
export function buildBrandfetchLogoUrl(domain, clientId, options = {}) {
  const { onDark = false, size = 128 } = options;
  const theme = onDark ? 'light' : 'dark';
  const encDomain = encodeURIComponent(domain);
  const encClient = encodeURIComponent(clientId);

  return `https://${BRANDFETCH_HOST}/${encDomain}/w/${size}/h/${size}/theme/${theme}/type/icon?c=${encClient}`;
}

/**
 * Prefer themed icon URLs; fall back to the stored URL if rewrite is not possible.
 *
 * @param {string} url
 * @param {{ onDark?: boolean, size?: number }} [options]
 * @returns {string}
 */
export function optimizeBrandfetchLogoUrl(url, options = {}) {
  const { onDark = false, size = 128 } = options;
  if (!isBrandfetchCdnUrl(url)) return url;

  try {
    const parsed = new URL(url.trim());
    const domain = extractBrandfetchDomain(parsed.pathname);
    const clientId = parsed.searchParams.get('c');
    if (!domain || !clientId) return url;

    return buildBrandfetchLogoUrl(domain, clientId, { onDark, size });
  } catch {
    return url;
  }
}

/**
 * Candidate URLs to try in order (themed → legacy stored).
 * @param {string} url
 * @param {{ onDark?: boolean, size?: number }} [options]
 * @returns {string[]}
 */
function isBrokenPlaceholderUrl(url) {
  return /fallback\/transparent|\/type\/symbol/i.test(url);
}

export function brandfetchLogoCandidates(url, options = {}) {
  if (!isBrandfetchCdnUrl(url)) return [];

  const { onDark = false, size = 128 } = options;
  const optimized = optimizeBrandfetchLogoUrl(url, { onDark, size });
  const altTheme = optimizeBrandfetchLogoUrl(url, { onDark: !onDark, size });
  const original = url.trim();

  const list = [optimized];
  if (altTheme !== optimized) list.push(altTheme);
  if (
    !isBrokenPlaceholderUrl(original) &&
    original !== optimized &&
    original !== altTheme
  ) {
    list.push(original);
  }

  return [...new Set(list)];
}
