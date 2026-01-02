import api from './api';

/**
 * Analytics service
 */
export const analyticsService = {
  /**
   * Get dashboard KPIs
   */
  getDashboard: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.month) params.append('month', filters.month);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const response = await api.get(`/analytics/dashboard?${params.toString()}`);
    return response.data;
  },

  /**
   * Get chart data
   */
  getCharts: async (type, chartType, filters = {}) => {
    const params = new URLSearchParams();
    params.append('type', type);
    params.append('chartType', chartType);
    if (filters.month) params.append('month', filters.month);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.categoryId) params.append('categoryId', filters.categoryId);

    const response = await api.get(`/analytics/charts?${params.toString()}`);
    return response.data;
  }
};

