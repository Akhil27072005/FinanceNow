/**
 * Date utility functions
 * Formats dates consistently across the application
 */

/**
 * Format date as DD-MM-YYYY
 * @param {Date|string} date - Date object or date string
 * @returns {string} Formatted date string (DD-MM-YYYY)
 */
export const formatDateDDMMYYYY = (date) => {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  
  return `${day}-${month}-${year}`;
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

