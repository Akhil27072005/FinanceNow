import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Send cookies (e.g. refresh token) on cross-origin requests
});

// Request interceptor - Add access token to requests
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Never try to refresh when the refresh endpoint itself fails
    const originalUrl = originalRequest?.url || '';
    if (originalUrl.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token:
        // - Email/password login: refresh token is stored in localStorage
        // - Google OAuth: refresh token is stored as HTTP-only cookie (sent withCredentials)
        const refreshToken = localStorage.getItem('refreshToken');
        const refreshBody = refreshToken ? { refreshToken } : {};

        // Use plain axios with withCredentials so cookies are included cross-origin.
        // (Do not use the `api` instance here to avoid interceptor recursion.)
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, refreshBody, {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' }
        });

        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

