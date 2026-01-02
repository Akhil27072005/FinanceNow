import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in and fetch user data
    const checkAuth = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        try {
          // Fetch user data from backend
          // The API interceptor will automatically refresh the token if it's expired
          const response = await authService.getMe();
          if (response.success && response.user) {
            setUser({ ...response.user, authenticated: true });
          } else {
            // If fetch fails, clear tokens
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setUser(null);
          }
        } catch (error) {
          // If error is 401 and refresh also failed, the interceptor will redirect to login
          // If it's a different error, we'll just set user to null
          // The interceptor handles token refresh automatically
          if (error.response?.status === 401) {
            // Token refresh might have failed, user will be redirected by interceptor
            // Just set user to null here
            setUser(null);
          } else {
            // Other error, just set user to null
            setUser(null);
          }
        }
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      setUser({ ...data.user, authenticated: true });
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const data = await authService.register(name, email, password);
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      setUser({ ...data.user, authenticated: true });
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed'
      };
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const fetchUser = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setUser(null);
        return;
      }
      const response = await authService.getMe();
      if (response.success && response.user) {
        setUser({ ...response.user, authenticated: true });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setUser(null);
    }
  };

  const isAuthenticated = () => {
    return !!localStorage.getItem('accessToken');
  };

  const value = {
    user,
    login,
    register,
    logout,
    fetchUser,
    isAuthenticated,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

