import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  getThemeChartColors,
  getThemeExpenseChartColor,
  getThemeExpenseChartGradient
} from '../utils/appTheme';

/** Theme-aware chart colors from saved appearance preferences */
export const useThemeChartColors = () => {
  const { user } = useAuth();
  const preferences = user?.preferences;

  return useMemo(
    () => ({
      palette: getThemeChartColors(preferences),
      expenseColor: getThemeExpenseChartColor(preferences),
      expenseGradient: getThemeExpenseChartGradient(preferences)
    }),
    [preferences?.themePresetId, preferences?.glassIntensity, preferences]
  );
};

export default useThemeChartColors;
