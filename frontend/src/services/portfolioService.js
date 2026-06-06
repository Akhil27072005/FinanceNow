import api from './api';

export const portfolioService = {
  getSummary: async () => {
    const response = await api.get('/portfolio/summary');
    return response.data;
  },

  getHoldings: async () => {
    const response = await api.get('/portfolio/holdings');
    return response.data;
  },

  createHolding: async (payload) => {
    const response = await api.post('/portfolio/holdings', payload);
    return response.data;
  },

  deleteHolding: async (id) => {
    const response = await api.delete(`/portfolio/holdings/${id}`);
    return response.data;
  },

  getHoldingActivities: async (holdingId) => {
    const response = await api.get(`/portfolio/holdings/${holdingId}/activities`);
    return response.data;
  },

  getRecentActivities: async (limit = 12) => {
    const response = await api.get('/portfolio/activities/recent', {
      params: { limit }
    });
    return response.data;
  },

  createActivity: async (payload) => {
    const response = await api.post('/portfolio/activities', payload);
    return response.data;
  }
};
