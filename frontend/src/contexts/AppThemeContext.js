import React, { useEffect } from 'react';
import { useAuth } from './AuthContext';
import { applyAppTheme, resetAppTheme } from '../utils/appTheme';

/**
 * Centralized app theme — reads user.preferences and applies CSS variables globally.
 */
export const AppThemeProvider = ({ children }) => {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (user?.preferences) {
      applyAppTheme(user.preferences);
      return;
    }

    resetAppTheme();
  }, [
    loading,
    user,
    user?.preferences?.themePresetId,
    user?.preferences?.glassIntensity
  ]);

  return children;
};

export default AppThemeProvider;
