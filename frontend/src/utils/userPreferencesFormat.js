/**
 * Regional display preferences — shared formatting for currency and dates.
 */

export const DEFAULT_USER_PREFERENCES = {
  currency: 'INR',
  dateFormat: 'DD/MM/YYYY',
  timezone: 'Asia/Kolkata',
  subscriptionReminderDays: 7,
  emailReminders: false,
  overdueAlerts: true
};

const CURRENCY_LOCALES = {
  INR: 'en-IN',
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB'
};

export const normalizeUserPreferences = (preferences) => {
  const p = preferences || {};
  const currency = ['INR', 'USD', 'EUR', 'GBP'].includes(p.currency)
    ? p.currency
    : DEFAULT_USER_PREFERENCES.currency;
  const dateFormat = ['DD/MM/YYYY', 'MM/DD/YYYY'].includes(p.dateFormat)
    ? p.dateFormat
    : DEFAULT_USER_PREFERENCES.dateFormat;
  const reminderDays = Number(p.subscriptionReminderDays);
  return {
    currency,
    dateFormat,
    timezone: p.timezone || DEFAULT_USER_PREFERENCES.timezone,
    subscriptionReminderDays:
      Number.isFinite(reminderDays) && reminderDays >= 1 && reminderDays <= 30
        ? Math.round(reminderDays)
        : DEFAULT_USER_PREFERENCES.subscriptionReminderDays,
    emailReminders: Boolean(p.emailReminders),
    overdueAlerts: p.overdueAlerts !== false
  };
};

export const getLocaleForCurrency = (currency) =>
  CURRENCY_LOCALES[currency] || CURRENCY_LOCALES.INR;

const toDate = (date) => {
  if (!date) return null;
  const dateObj = date instanceof Date ? date : new Date(date);
  return Number.isNaN(dateObj.getTime()) ? null : dateObj;
};

/**
 * @param {number} amount
 * @param {object} [preferences]
 */
export const formatCurrency = (amount, preferences) => {
  const { currency } = normalizeUserPreferences(preferences);
  const locale = getLocaleForCurrency(currency);
  const value = Number(amount);
  if (!Number.isFinite(value)) return '—';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Full date per user date format preference.
 */
export const formatUserDate = (date, preferences) => {
  const dateObj = toDate(date);
  if (!dateObj) return '';

  const { dateFormat } = normalizeUserPreferences(preferences);
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();

  if (dateFormat === 'MM/DD/YYYY') {
    return `${month}/${day}/${year}`;
  }
  return `${day}/${month}/${year}`;
};

const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/**
 * Compact date (e.g. "11 Jul") — month order follows preference.
 */
export const formatUserDateShort = (date, preferences) => {
  const dateObj = toDate(date);
  if (!dateObj) return '';

  const { dateFormat } = normalizeUserPreferences(preferences);
  const day = dateObj.getDate();
  const month = MONTHS_SHORT[dateObj.getMonth()];

  if (dateFormat === 'MM/DD/YYYY') {
    return `${month} ${day}`;
  }
  return `${day} ${month}`;
};
