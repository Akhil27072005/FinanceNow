import api from './api';

/**
 * Authentication service
 * Handles all authentication-related API calls
 */
export const authService = {
  /**
   * Register a new user
   */
  register: async (name, email, password) => {
    const response = await api.post('/auth/register', {
      name,
      email,
      password
    });
    return response.data;
  },

  /**
   * Login with email and password
   */
  login: async (email, password) => {
    const response = await api.post('/auth/login', {
      email,
      password
    });
    return response.data;
  },

  /**
   * Login with Google (legacy - sends idToken)
   */
  loginWithGoogle: async (idToken) => {
    const response = await api.post('/auth/google', {
      idToken
    });
    return response.data;
  },

  /**
   * Refresh access token
   */
  refreshToken: async (refreshToken) => {
    const response = await api.post('/auth/refresh', {
      refreshToken
    });
    return response.data;
  },

  /**
   * Logout
   */
  logout: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await api.post('/auth/logout', { refreshToken });
      } catch (error) {
        // Continue with logout even if API call fails
        console.error('Logout API call failed:', error);
      }
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  /**
   * Get Google OAuth URL
   */
  getGoogleAuthUrl: () => {
    return `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/google`;
  },

  /**
   * Get current user profile
   */
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  /**
   * Request password reset
   */
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  /**
   * Reset password with token
   */
  resetPassword: async (token, password) => {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  }
};

