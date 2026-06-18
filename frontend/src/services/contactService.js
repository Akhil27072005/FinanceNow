import api from './api';

export const contactService = {
  submitFeedback: async (payload) => {
    const response = await api.post('/contact', payload);
    return response.data;
  }
};
