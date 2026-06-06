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
    if (filters.account === 'self') params.append('account', 'self');
    if (filters.includeComparison) params.append('includeComparison', 'true');

    const response = await api.get(`/analytics/dashboard?${params.toString()}`);
    return response.data;
  },

  /**
   * Get chart data
   */
  getCharts: async (type, chartType, filters = {}) => {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    params.append('chartType', chartType);
    if (filters.month) params.append('month', filters.month);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    if (filters.account === 'self') params.append('account', 'self');
    if (filters.months) params.append('months', String(filters.months));

    const response = await api.get(`/analytics/charts?${params.toString()}`);
    return response.data;
  },

  /**
   * Expense breakdown by sub-category for a month
   */
  getExpenseSubCategorySplit: async (month) => {
    return analyticsService.getCharts('expense', 'subCategorySplit', { month });
  },

  /**
   * Daily expense trend for a month (line chart)
   */
  getExpenseMonthlyTrend: async (month) => {
    return analyticsService.getCharts('expense', 'monthlyTrend', { month });
  }
};

