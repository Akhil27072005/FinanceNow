import api from './api';

/**
 * Detect payment brand logo via Brandfetch (backend proxy).
 * @param {string} query
 * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
 */
export async function detectPaymentLogo(query) {
  const q = typeof query === 'string' ? query.trim() : '';
  if (!q) {
    return { success: true, data: { recognized: false, message: 'Empty query' } };
  }

  try {
    const response = await api.get('/payment-logo/detect', { params: { q } });
    return response.data;
  } catch (err) {
    const message =
      err.response?.data?.error ||
      err.response?.data?.data?.message ||
      'Unable to detect logo';
    return { success: false, error: message, data: err.response?.data?.data };
  }
}
