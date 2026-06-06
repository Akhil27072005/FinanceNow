import { formatCurrency } from './userPreferencesFormat';

const toDateOnly = (value) => {
  const d = new Date(value);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const formatSubscriptionCurrency = (amount, preferences) =>
  formatCurrency(amount, preferences);

export const formatBillingCycle = (cycle) => {
  if (!cycle) return '';
  return cycle.charAt(0).toUpperCase() + cycle.slice(1);
};

export const getSubscriptionLogoUrl = (subscription) =>
  subscription?.metadata?.logoUrl || null;

export const isSubscriptionOverdue = (subscription, today = new Date()) => {
  if (!subscription?.isActive || !subscription?.nextPaymentDate) return false;
  return toDateOnly(subscription.nextPaymentDate) < toDateOnly(today);
};

export const isSubscriptionDueSoon = (subscription, days = 7, today = new Date()) => {
  if (!subscription?.isActive || !subscription?.nextPaymentDate) return false;
  const due = toDateOnly(subscription.nextPaymentDate);
  const t = toDateOnly(today);
  if (due < t) return false;
  const limit = new Date(t);
  limit.setDate(limit.getDate() + days);
  return due <= limit;
};

export const getSubscriptionReminderDays = (user) => {
  const days = Number(user?.preferences?.subscriptionReminderDays);
  if (Number.isFinite(days) && days >= 1 && days <= 30) {
    return Math.round(days);
  }
  return 7;
};

/**
 * @returns {'overdue'|'due_soon'|null}
 */
export const getSubscriptionStatusBadge = (subscription, options = {}) => {
  const {
    reminderDays = 7,
    showOverdue = true
  } = options;

  if (!subscription?.isActive) return null;
  if (showOverdue && isSubscriptionOverdue(subscription)) return 'overdue';
  if (isSubscriptionDueSoon(subscription, reminderDays)) return 'due_soon';
  return null;
};

export const canMarkSubscriptionPaid = (subscription, options = {}) => {
  const { reminderDays = 7 } = options;
  if (!subscription?.isActive) return false;
  if (subscription.autoRenew) return false;
  return (
    isSubscriptionOverdue(subscription) || isSubscriptionDueSoon(subscription, reminderDays)
  );
};

export const sortActiveSubscriptions = (list) => {
  const today = toDateOnly(new Date());
  return [...list].sort((a, b) => {
    const aDue = toDateOnly(a.nextPaymentDate);
    const bDue = toDateOnly(b.nextPaymentDate);
    const aOver = aDue < today ? 0 : 1;
    const bOver = bDue < today ? 0 : 1;
    if (aOver !== bOver) return aOver - bOver;
    return aDue - bDue;
  });
};

export const sortInactiveSubscriptions = (list) =>
  [...list].sort((a, b) => a.name.localeCompare(b.name));
