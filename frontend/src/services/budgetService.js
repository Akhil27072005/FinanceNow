import api from './api';

/**
 * Budget service
 */
export const budgetService = {
  getBudgets: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.month) params.append('month', filters.month);
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    if (filters.subCategoryId) params.append('subCategoryId', filters.subCategoryId);

    const response = await api.get(`/budgets?${params.toString()}`);
    return response.data;
  },

  getBudget: async (id) => {
    const response = await api.get(`/budgets/${id}`);
    return response.data;
  },

  createBudget: async (budgetData) => {
    const response = await api.post('/budgets', budgetData);
    return response.data;
  },

  updateBudget: async (id, budgetData) => {
    const response = await api.put(`/budgets/${id}`, budgetData);
    return response.data;
  },

  deleteBudget: async (id) => {
    const response = await api.delete(`/budgets/${id}`);
    return response.data;
  }
};

