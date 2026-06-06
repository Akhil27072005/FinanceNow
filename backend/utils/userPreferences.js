const ALLOWED_CURRENCIES = ['INR', 'USD', 'EUR', 'GBP'];
const ALLOWED_DATE_FORMATS = ['DD/MM/YYYY', 'MM/DD/YYYY'];
const ALLOWED_TIMEZONES = [
  'Asia/Kolkata',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'UTC'
];

const DEFAULT_PREFERENCES = {
  currency: 'INR',
  dateFormat: 'DD/MM/YYYY',
  timezone: 'Asia/Kolkata',
  subscriptionReminderDays: 7,
  emailReminders: false,
  overdueAlerts: true
};

const serializePreferences = (preferences) => {
  const p = preferences || {};
  const reminderDays = Number(p.subscriptionReminderDays);
  return {
    currency: ALLOWED_CURRENCIES.includes(p.currency) ? p.currency : DEFAULT_PREFERENCES.currency,
    dateFormat: ALLOWED_DATE_FORMATS.includes(p.dateFormat)
      ? p.dateFormat
      : DEFAULT_PREFERENCES.dateFormat,
    timezone: ALLOWED_TIMEZONES.includes(p.timezone) ? p.timezone : DEFAULT_PREFERENCES.timezone,
    subscriptionReminderDays:
      Number.isFinite(reminderDays) && reminderDays >= 1 && reminderDays <= 30
        ? Math.round(reminderDays)
        : DEFAULT_PREFERENCES.subscriptionReminderDays,
    emailReminders: Boolean(p.emailReminders),
    overdueAlerts: p.overdueAlerts !== false
  };
};

const parseRegionalPreferencesBody = (body) => {
  const updates = {};
  const errors = [];

  if (body.currency !== undefined) {
    if (!ALLOWED_CURRENCIES.includes(body.currency)) {
      errors.push('Invalid currency');
    } else {
      updates.currency = body.currency;
    }
  }

  if (body.dateFormat !== undefined) {
    if (!ALLOWED_DATE_FORMATS.includes(body.dateFormat)) {
      errors.push('Invalid date format');
    } else {
      updates.dateFormat = body.dateFormat;
    }
  }

  if (body.timezone !== undefined) {
    if (!ALLOWED_TIMEZONES.includes(body.timezone)) {
      errors.push('Invalid timezone');
    } else {
      updates.timezone = body.timezone;
    }
  }

  if (errors.length > 0) {
    return { error: errors.join('. ') };
  }

  return { updates };
};

const parseNotificationPreferencesBody = (body) => {
  const updates = {};
  const errors = [];

  if (body.subscriptionReminderDays !== undefined) {
    const days = Number(body.subscriptionReminderDays);
    if (!Number.isFinite(days) || days < 1 || days > 30) {
      errors.push('Reminder window must be between 1 and 30 days');
    } else {
      updates.subscriptionReminderDays = Math.round(days);
    }
  }

  if (body.emailReminders !== undefined) {
    updates.emailReminders = Boolean(body.emailReminders);
  }

  if (body.overdueAlerts !== undefined) {
    updates.overdueAlerts = Boolean(body.overdueAlerts);
  }

  if (errors.length > 0) {
    return { error: errors.join('. ') };
  }

  return { updates };
};

/**
 * Merge regional + notification preference updates from request body.
 */
const parsePreferencesBody = (body) => {
  const regional = parseRegionalPreferencesBody(body);
  if (regional.error) {
    return regional;
  }

  const notifications = parseNotificationPreferencesBody(body);
  if (notifications.error) {
    return notifications;
  }

  const updates = {
    ...regional.updates,
    ...notifications.updates
  };

  if (Object.keys(updates).length === 0) {
    return { error: 'No valid preference fields provided' };
  }

  return { updates };
};

module.exports = {
  ALLOWED_CURRENCIES,
  ALLOWED_DATE_FORMATS,
  ALLOWED_TIMEZONES,
  DEFAULT_PREFERENCES,
  serializePreferences,
  parseRegionalPreferencesBody,
  parseNotificationPreferencesBody,
  parsePreferencesBody
};
