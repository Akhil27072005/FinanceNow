const axios = require('axios');

const SEARCH_BASE_URL = 'https://api.brandfetch.io/v2/search';
const LOGO_CDN_BASE_URL = 'https://cdn.brandfetch.io';

/**
 * Brandfetch API client.
 * Search API authenticates via clientId query param (`c`).
 * Optional Bearer token is sent when BRANDFETCH_API_KEY is configured.
 */

/**
 * @returns {{ clientId: string, apiKey: string|undefined }}
 */
function getBrandfetchConfig() {
  const clientId = (process.env.BRANDFETCH_CLIENT_ID || '').trim();
  const apiKey = (process.env.BRANDFETCH_API_KEY || '').trim() || undefined;

  if (!clientId) {
    const error = new Error(
      'BRANDFETCH_CLIENT_ID is not configured. Add it to your .env file.'
    );
    error.code = 'BRANDFETCH_CONFIG_MISSING';
    throw error;
  }

  return { clientId, apiKey };
}

/**
 * @param {string} domain
 * @returns {boolean}
 */
function isValidDomain(domain) {
  if (!domain || typeof domain !== 'string') return false;

  const host = domain
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .split('/')[0]
    .trim()
    .toLowerCase();

  return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(
    host
  );
}

/**
 * Normalize domain from Brandfetch search result.
 *
 * @param {string} domain
 * @returns {string|null}
 */
function sanitizeDomain(domain) {
  if (!domain) return null;

  const cleaned = domain
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .split('/')[0]
    .trim()
    .toLowerCase();

  return isValidDomain(cleaned) ? cleaned : null;
}

/**
 * Search Brandfetch for brand candidates by name.
 *
 * @param {string} query - Search term (will be URL-encoded)
 * @returns {Promise<Array<{ name: string, domain: string, icon?: string, brandId?: string }>>}
 */
async function searchBrands(query) {
  const { clientId, apiKey } = getBrandfetchConfig();

  const encodedQuery = encodeURIComponent(query);
  const url = `${SEARCH_BASE_URL}/${encodedQuery}`;

  const headers = {
    Accept: 'application/json'
  };

  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  const response = await axios.get(url, {
    params: { c: clientId },
    headers,
    timeout: 10000,
    validateStatus: (status) => status < 500
  });

  if (response.status === 401 || response.status === 403) {
    const error = new Error('Brandfetch API authentication failed');
    error.code = 'BRANDFETCH_AUTH_ERROR';
    error.status = response.status;
    throw error;
  }

  if (response.status !== 200) {
    const error = new Error(
      `Brandfetch search failed with status ${response.status}`
    );
    error.code = 'BRANDFETCH_SEARCH_ERROR';
    error.status = response.status;
    throw error;
  }

  return Array.isArray(response.data) ? response.data : [];
}

/**
 * Build Brandfetch Logo CDN URL (themed icon — visible asset, not transparent placeholder).
 *
 * @param {string} domain
 * @param {string} [clientIdOverride]
 * @param {{ onDark?: boolean, width?: number, height?: number }} [options]
 * @returns {string}
 */
function buildLogoUrl(domain, clientIdOverride, options = {}) {
  const { clientId } = getBrandfetchConfig();
  const id = clientIdOverride || clientId;
  const host = sanitizeDomain(domain) || domain;
  const safeDomain = encodeURIComponent(host);
  const { onDark = false, width = 128, height = 128 } = options;
  const theme = onDark ? 'light' : 'dark';

  return `${LOGO_CDN_BASE_URL}/${safeDomain}/w/${width}/h/${height}/theme/${theme}/type/icon?c=${encodeURIComponent(id)}`;
}

module.exports = {
  getBrandfetchConfig,
  searchBrands,
  buildLogoUrl,
  sanitizeDomain,
  isValidDomain,
  SEARCH_BASE_URL,
  LOGO_CDN_BASE_URL
};
