import { useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  normalizeUserPreferences,
  formatCurrency as formatCurrencyAmount,
  formatUserDate,
  formatUserDateShort
} from '../utils/userPreferencesFormat';

/**
 * User regional formatters (currency, dates) from saved preferences.
 */
export const useUserFormatters = () => {
  const { user } = useAuth();
  const preferences = useMemo(
    () => normalizeUserPreferences(user?.preferences),
    [user?.preferences]
  );

  const formatCurrency = useCallback(
    (amount) => formatCurrencyAmount(amount, preferences),
    [preferences]
  );

  const formatDate = useCallback(
    (date) => formatUserDate(date, preferences),
    [preferences]
  );

  const formatDateShort = useCallback(
    (date) => formatUserDateShort(date, preferences),
    [preferences]
  );

  return {
    preferences,
    formatCurrency,
    formatDate,
    formatDateShort
  };
};
