import api from './api';

/**
 * Subscription service
 */
export const subscriptionService = {
  getSubscriptions: async (isActive = null) => {
    const params = isActive !== null ? `?isActive=${isActive}` : '';
    const response = await api.get(`/subscriptions${params}`);
    return response.data;
  },

  getSubscription: async (id) => {
    const response = await api.get(`/subscriptions/${id}`);
    return response.data;
  },

  createSubscription: async (subscriptionData) => {
    const response = await api.post('/subscriptions', subscriptionData);
    return response.data;
  },

  updateSubscription: async (id, subscriptionData) => {
    const response = await api.put(`/subscriptions/${id}`, subscriptionData);
    return response.data;
  },

  deleteSubscription: async (id) => {
    const response = await api.delete(`/subscriptions/${id}`);
    return response.data;
  },

  getAlerts: async (days = 7) => {
    const response = await api.get(`/subscriptions/alerts?days=${days}`);
    return response.data;
  }
};

