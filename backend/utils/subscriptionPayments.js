const Subscription = require('../src/models/Subscription');
const SubscriptionPayment = require('../src/models/SubscriptionPayment');

const normalizeDateAtMidnight = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const addBillingCycle = (date, billingCycle) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  if (billingCycle === 'monthly') {
    next.setMonth(next.getMonth() + 1);
  } else if (billingCycle === 'yearly') {
    next.setFullYear(next.getFullYear() + 1);
  }
  return next;
};

const computeAdvancedNextPaymentDate = (nextPaymentDate, billingCycle, today = new Date()) => {
  let nextDate = normalizeDateAtMidnight(nextPaymentDate);
  const todayNorm = normalizeDateAtMidnight(today);

  while (nextDate < todayNorm) {
    nextDate = addBillingCycle(nextDate, billingCycle);
  }

  return nextDate;
};

/**
 * Record a subscription billing cycle payment (idempotent per sub + due date).
 */
const recordSubscriptionPayment = async (subscription, billingDueDate, source) => {
  const due = normalizeDateAtMidnight(billingDueDate);

  const existing = await SubscriptionPayment.findOne({
    userId: subscription.userId,
    subscriptionId: subscription._id,
    billingDueDate: due
  });

  if (existing) {
    return { created: false, payment: existing };
  }

  const payment = new SubscriptionPayment({
    userId: subscription.userId,
    subscriptionId: subscription._id,
    amount: subscription.amount,
    billingDueDate: due,
    source
  });

  try {
    await payment.save();
    return { created: true, payment };
  } catch (error) {
    if (error.code === 11000) {
      const duplicate = await SubscriptionPayment.findOne({
        userId: subscription.userId,
        subscriptionId: subscription._id,
        billingDueDate: due
      });
      return { created: false, payment: duplicate };
    }
    throw error;
  }
};

const processAutoRenewSubscription = async (subscription, today = new Date()) => {
  const todayNorm = normalizeDateAtMidnight(today);
  let due = normalizeDateAtMidnight(subscription.nextPaymentDate);
  const originalDue = due.getTime();
  let paymentsCreated = 0;

  while (due < todayNorm) {
    const { created } = await recordSubscriptionPayment(subscription, due, 'auto-renew');
    if (created) {
      paymentsCreated += 1;
    }
    due = addBillingCycle(due, subscription.billingCycle);
  }

  if (due.getTime() === originalDue) {
    return { updated: false, paymentsCreated };
  }

  subscription.nextPaymentDate = due;
  await subscription.save();
  return { updated: true, paymentsCreated };
};

const advanceAutoRenewSubscriptions = async (userId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdueAutoRenew = await Subscription.find({
    userId,
    isActive: true,
    autoRenew: true,
    nextPaymentDate: { $lt: today }
  });

  let subscriptionsUpdated = 0;
  let paymentsCreated = 0;

  for (const sub of overdueAutoRenew) {
    const result = await processAutoRenewSubscription(sub, today);
    if (result.updated) {
      subscriptionsUpdated += 1;
    }
    paymentsCreated += result.paymentsCreated;
  }

  return {
    subscriptionsUpdated,
    paymentsCreated,
    changed: subscriptionsUpdated > 0 || paymentsCreated > 0
  };
};

const recordManualSubscriptionPayment = async (subscription) => {
  const due = normalizeDateAtMidnight(subscription.nextPaymentDate);
  const { created, payment } = await recordSubscriptionPayment(subscription, due, 'mark-paid');

  subscription.nextPaymentDate = addBillingCycle(due, subscription.billingCycle);
  await subscription.save();

  return { created, payment, billingDueDate: due };
};

/**
 * Sum subscription payments with billingDueDate in [dateStart, dateEnd].
 */
const getSubscriptionSpendInRange = async (userId, dateStart, dateEnd) => {
  const result = await SubscriptionPayment.aggregate([
    {
      $match: {
        userId,
        billingDueDate: {
          $gte: dateStart,
          $lte: dateEnd
        }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);

  const row = result[0] || { total: 0, count: 0 };
  return {
    total: Math.round(row.total * 100) / 100,
    paymentCount: row.count
  };
};

module.exports = {
  normalizeDateAtMidnight,
  addBillingCycle,
  computeAdvancedNextPaymentDate,
  recordSubscriptionPayment,
  processAutoRenewSubscription,
  advanceAutoRenewSubscriptions,
  recordManualSubscriptionPayment,
  getSubscriptionSpendInRange
};
