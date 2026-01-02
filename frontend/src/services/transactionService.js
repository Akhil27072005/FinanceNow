import api from './api';

/**
 * Transaction service
 * Handles all transaction-related API calls
 */
export const transactionService = {
  /**
   * Get all transactions with optional filters
   */
  getTransactions: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.type) params.append('type', filters.type);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    if (filters.tag) params.append('tag', filters.tag);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.page) params.append('page', filters.page);

    const response = await api.get(`/transactions?${params.toString()}`);
    return response.data;
  },

  /**
   * Get a single transaction by ID
   */
  getTransaction: async (id) => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  /**
   * Create a new transaction
   */
  createTransaction: async (transactionData) => {
    const response = await api.post('/transactions', transactionData);
    return response.data;
  },

  /**
   * Update a transaction
   */
  updateTransaction: async (id, transactionData) => {
    const response = await api.put(`/transactions/${id}`, transactionData);
    return response.data;
  },

  /**
   * Delete a transaction
   */
  deleteTransaction: async (id) => {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  }
};

