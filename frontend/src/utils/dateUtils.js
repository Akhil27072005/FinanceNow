import { formatUserDate, formatUserDateShort as formatUserDateShortPref } from './userPreferencesFormat';

/**
 * Date utility functions
 * Formats dates consistently across the application
 */

/**
 * Format date for display (uses preferences when provided).
 * @param {Date|string} date
 * @param {object} [preferences] - user.preferences; defaults to DD/MM/YYYY with slashes
 */
export const formatDateDDMMYYYY = (date, preferences) => {
  if (preferences) {
    return formatUserDate(date, preferences);
  }
  if (!date) return '';

  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return '';

  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();

  return `${day}/${month}/${year}`;
};

/**
 * Format date for input fields (YYYY-MM-DD)
 * @param {Date|string} date - Date object or date string
 * @returns {string} Formatted date string (YYYY-MM-DD)
 */
export const formatDateForInput = (date) => {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/**
 * Format date as "11 Jul" for compact list displays
 * @param {Date|string} date - Date object or date string
 * @returns {string}
 */
export const formatDateShort = (date, preferences) => {
  if (preferences) {
    return formatUserDateShortPref(date, preferences);
  }
  if (!date) return '';

  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return '';

  return `${dateObj.getDate()} ${MONTHS_SHORT[dateObj.getMonth()]}`;
};

/**
 * First and last day of a month (YYYY-MM) as YYYY-MM-DD strings
 * @param {string} monthKey - e.g. "2025-07"
 */
export const getMonthDateRange = (monthKey) => {
  if (!monthKey) return { startDate: '', endDate: '' };

  const [yearStr, monthStr] = monthKey.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  if (!year || !month) return { startDate: '', endDate: '' };

  const lastDay = new Date(year, month, 0).getDate();
  const mm = String(month).padStart(2, '0');
  return {
    startDate: `${year}-${mm}-01`,
    endDate: `${year}-${mm}-${String(lastDay).padStart(2, '0')}`
  };
};

