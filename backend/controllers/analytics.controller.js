const Transaction = require('../src/models/Transaction');
const Subscription = require('../src/models/Subscription');
const { getSubscriptionSpendInRange } = require('../utils/subscriptionPayments');
const mongoose = require('mongoose');
const cache = require('../utils/cache');

const resolveAnalyticsCacheKey = async (userId, baseKey) =>
  cache.getVersionedKey(baseKey, userId.toString(), 'analytics');

/**
 * Utility function to determine date range from query parameters
 * Returns { dateStart, dateEnd } or throws error
 */
const getDateRange = (month, startDate, endDate) => {
  let dateStart, dateEnd;

  if (month && month.trim() !== '') {
    const monthRegex = /^\d{4}-\d{2}$/;
    if (!monthRegex.test(month)) {
      throw new Error('Month must be in YYYY-MM format (e.g., 2024-01)');
    }

    const [year, monthNum] = month.split('-').map(Number);
    dateStart = new Date(year, monthNum - 1, 1);
    dateEnd = new Date(year, monthNum, 0, 23, 59, 59, 999);

    if (isNaN(dateStart.getTime()) || isNaN(dateEnd.getTime())) {
      throw new Error('Invalid month provided');
    }
  } else if (startDate && endDate && startDate.trim() !== '' && endDate.trim() !== '') {
    const startParts = startDate.split('-').map(Number);
    const endParts = endDate.split('-').map(Number);

    if (startParts.length !== 3 || endParts.length !== 3) {
      throw new Error('Invalid date format. Use ISO 8601 format (e.g., 2024-01-15)');
    }

    dateStart = new Date(startParts[0], startParts[1] - 1, startParts[2]);
    dateEnd = new Date(endParts[0], endParts[1] - 1, endParts[2]);

    if (isNaN(dateStart.getTime()) || isNaN(dateEnd.getTime())) {
      throw new Error('Invalid date format. Use ISO 8601 format (e.g., 2024-01-15)');
    }

    dateStart.setHours(0, 0, 0, 0);
    dateEnd.setHours(23, 59, 59, 999);

    if (dateStart > dateEnd) {
      throw new Error('startDate must be before or equal to endDate');
    }
  } else {
    const now = new Date();
    const year = now.getFullYear();
    const monthNum = now.getMonth();
    dateStart = new Date(year, monthNum, 1);
    dateEnd = new Date(year, monthNum + 1, 0, 23, 59, 59, 999);
  }

  return { dateStart, dateEnd };
};

const normalizeAccount = (account) => {
  if (!account || account === 'all') return null;
  if (account === 'self') return 'self';
  return null;
};

const buildTransactionMatch = (userId, dateStart, dateEnd, options = {}) => {
  const match = {
    userId,
    date: {
      $gte: dateStart,
      $lte: dateEnd
    }
  };

  if (options.type) {
    match.type = options.type;
  }

  const account = normalizeAccount(options.account);
  if (account === 'self') {
    match.account = 'self';
  }

  if (options.categoryId) {
    if (!mongoose.Types.ObjectId.isValid(options.categoryId)) {
      throw new Error('Invalid categoryId format');
    }
    match.categoryId = new mongoose.Types.ObjectId(options.categoryId);
  }

  if (options.subCategoryId) {
    if (!mongoose.Types.ObjectId.isValid(options.subCategoryId)) {
      throw new Error('Invalid subCategoryId format');
    }
    match.subCategoryId = new mongoose.Types.ObjectId(options.subCategoryId);
  }

  if (options.paymentMethodRequired) {
    match.paymentMethodId = { $ne: null };
  }

  if (!options.categoryId && options.categoryRequired) {
    match.categoryId = { $ne: null };
  }

  if (!options.subCategoryId && options.subCategoryRequired) {
    match.subCategoryId = { $ne: null };
  }

  if (options.tagsRequired) {
    match.tags = { $exists: true, $ne: [] };
  }

  return match;
};

const getPriorDateRange = (dateStart, dateEnd) => {
  const durationMs = dateEnd.getTime() - dateStart.getTime();
  const priorEnd = new Date(dateStart.getTime() - 1);
  priorEnd.setHours(23, 59, 59, 999);
  const priorStart = new Date(priorEnd.getTime() - durationMs);
  priorStart.setHours(0, 0, 0, 0);
  return { priorStart, priorEnd };
};

const pctChange = (current, prior) => {
  if (prior === 0 || prior == null) {
    return current > 0 ? 100 : 0;
  }
  return Math.round(((current - prior) / prior) * 1000) / 10;
};

const aggregateTransactionTotals = async (userId, dateStart, dateEnd, account) => {
  const pipeline = [
    {
      $match: buildTransactionMatch(userId, dateStart, dateEnd, { account })
    },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' }
      }
    }
  ];

  const results = await Transaction.aggregate(pipeline);
  const totals = {};
  results.forEach((row) => {
    totals[row._id] = row.total;
  });
  return totals;
};

const buildKpisFromTotals = (totals, daysInRange, subscriptionSpend, activeSubscriptionCount) => {
  const totalIncome = totals.income || 0;
  const totalExpenses = totals.expense || 0;
  const totalSavings = totals.savings || 0;
  const totalInvestments = totals.investment || 0;
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : null;
  const avgDailyExpense = daysInRange > 0 ? totalExpenses / daysInRange : 0;

  return {
    totalIncome,
    totalExpenses,
    netSavings,
    savingsRate: savingsRate !== null ? Math.round(savingsRate * 100) / 100 : null,
    totalSavings,
    totalInvestments,
    avgDailyExpense: Math.round(avgDailyExpense * 100) / 100,
    activeSubscriptions: activeSubscriptionCount,
    monthlySubscriptionSpend: subscriptionSpend.total,
    subscriptionPaymentCount: subscriptionSpend.paymentCount
  };
};

/**
 * Get dashboard analytics KPIs
 * GET /api/analytics/dashboard
 */
const getDashboardAnalytics = async (req, res, next) => {
  try {
    const { month, startDate, endDate, account, includeComparison } = req.query;
    const userId = req.user._id;
    const userIdStr = userId.toString();
    const accountScope = normalizeAccount(account) || 'all';

    const { dateStart, dateEnd } = getDateRange(month, startDate, endDate);

    const cacheKey = month
      ? `analytics:${userIdStr}:dashboard:${month}:${accountScope}:${includeComparison === 'true' ? 'cmp' : 'base'}`
      : `analytics:${userIdStr}:dashboard:${startDate}:${endDate}:${accountScope}:${includeComparison === 'true' ? 'cmp' : 'base'}`;

    const versionedCacheKey = await resolveAnalyticsCacheKey(userId, cacheKey);
    const cachedData = await cache.get(versionedCacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    const daysInRange = Math.ceil((dateEnd - dateStart) / (1000 * 60 * 60 * 24)) + 1;

    const totals = await aggregateTransactionTotals(userId, dateStart, dateEnd, account);
    const activeSubscriptionCount = await Subscription.countDocuments({
      userId,
      isActive: true
    });
    const subscriptionSpend = await getSubscriptionSpendInRange(userId, dateStart, dateEnd);

    const kpis = buildKpisFromTotals(totals, daysInRange, subscriptionSpend, activeSubscriptionCount);

    const response = {
      success: true,
      range: {
        startDate: dateStart.toISOString(),
        endDate: dateEnd.toISOString()
      },
      account: accountScope,
      kpis
    };

    if (includeComparison === 'true') {
      const { priorStart, priorEnd } = getPriorDateRange(dateStart, dateEnd);
      const priorTotals = await aggregateTransactionTotals(userId, priorStart, priorEnd, account);
      const priorDays = Math.ceil((priorEnd - priorStart) / (1000 * 60 * 60 * 24)) + 1;
      const priorSubscriptionSpend = await getSubscriptionSpendInRange(userId, priorStart, priorEnd);
      const priorKpis = buildKpisFromTotals(
        priorTotals,
        priorDays,
        priorSubscriptionSpend,
        activeSubscriptionCount
      );

      response.priorRange = {
        startDate: priorStart.toISOString(),
        endDate: priorEnd.toISOString()
      };
      response.priorKpis = priorKpis;
      response.changes = {
        totalIncome: pctChange(kpis.totalIncome, priorKpis.totalIncome),
        totalExpenses: pctChange(kpis.totalExpenses, priorKpis.totalExpenses),
        netSavings: pctChange(kpis.netSavings, priorKpis.netSavings),
        totalSavings: pctChange(kpis.totalSavings, priorKpis.totalSavings),
        totalInvestments: pctChange(kpis.totalInvestments, priorKpis.totalInvestments),
        avgDailyExpense: pctChange(kpis.avgDailyExpense, priorKpis.avgDailyExpense)
      };
    }

    await cache.set(versionedCacheKey, response, 600);
    res.json(response);
  } catch (error) {
    next(error);
  }
};

const getMonthlyTrend = async (userId, type, dateStart, dateEnd, account) => {
  const pipeline = [
    {
      $match: buildTransactionMatch(userId, dateStart, dateEnd, { type, account })
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$date' }
        },
        amount: { $sum: '$amount' }
      }
    },
    {
      $project: {
        _id: 0,
        date: '$_id',
        amount: { $round: ['$amount', 2] }
      }
    },
    { $sort: { date: 1 } }
  ];

  return Transaction.aggregate(pipeline);
};

const getCategorySplit = async (userId, type, dateStart, dateEnd, account) => {
  const pipeline = [
    {
      $match: buildTransactionMatch(userId, dateStart, dateEnd, {
        type,
        account,
        categoryRequired: true
      })
    },
    {
      $group: {
        _id: '$categoryId',
        amount: { $sum: '$amount' }
      }
    },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'category'
      }
    },
    {
      $unwind: {
        path: '$category',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        _id: 0,
        categoryId: '$_id',
        category: { $ifNull: ['$category.name', 'Uncategorized'] },
        amount: { $round: ['$amount', 2] }
      }
    },
    { $sort: { amount: -1 } }
  ];

  return Transaction.aggregate(pipeline);
};

const getPaymentMethodSplit = async (userId, type, dateStart, dateEnd, account) => {
  const pipeline = [
    {
      $match: buildTransactionMatch(userId, dateStart, dateEnd, {
        type,
        account,
        paymentMethodRequired: true
      })
    },
    {
      $group: {
        _id: '$paymentMethodId',
        amount: { $sum: '$amount' }
      }
    },
    {
      $lookup: {
        from: 'paymentmethods',
        localField: '_id',
        foreignField: '_id',
        as: 'paymentMethod'
      }
    },
    {
      $unwind: {
        path: '$paymentMethod',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        _id: 0,
        paymentMethodId: '$_id',
        paymentMethod: { $ifNull: ['$paymentMethod.name', 'Unknown'] },
        icon: '$paymentMethod.icon',
        amount: { $round: ['$amount', 2] }
      }
    },
    { $sort: { amount: -1 } }
  ];

  return Transaction.aggregate(pipeline);
};

const getSubCategorySplit = async (userId, type, dateStart, dateEnd, categoryId, account) => {
  const matchOptions = {
    type,
    account,
    subCategoryRequired: true
  };
  if (categoryId) {
    matchOptions.categoryId = categoryId;
  }

  const pipeline = [
    {
      $match: buildTransactionMatch(userId, dateStart, dateEnd, matchOptions)
    },
    {
      $group: {
        _id: '$subCategoryId',
        amount: { $sum: '$amount' }
      }
    },
    {
      $lookup: {
        from: 'subcategories',
        localField: '_id',
        foreignField: '_id',
        as: 'subcategory'
      }
    },
    {
      $unwind: {
        path: '$subcategory',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'subcategory.categoryId',
        foreignField: '_id',
        as: 'category'
      }
    },
    {
      $unwind: {
        path: '$category',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        _id: 0,
        subCategoryId: '$_id',
        subCategory: { $ifNull: ['$subcategory.name', 'Uncategorized'] },
        subCategoryIcon: '$subcategory.icon',
        categoryId: '$subcategory.categoryId',
        category: { $ifNull: ['$category.name', null] },
        categoryIcon: '$category.icon',
        categoryType: { $ifNull: ['$category.type', 'expense'] },
        amount: { $round: ['$amount', 2] }
      }
    },
    { $sort: { amount: -1 } }
  ];

  return Transaction.aggregate(pipeline);
};

const getTagBasedSpending = async (userId, type, dateStart, dateEnd, account) => {
  const pipeline = [
    {
      $match: buildTransactionMatch(userId, dateStart, dateEnd, {
        type,
        account,
        tagsRequired: true
      })
    },
    { $unwind: '$tags' },
    {
      $group: {
        _id: '$tags',
        amount: { $sum: '$amount' }
      }
    },
    {
      $lookup: {
        from: 'tags',
        localField: '_id',
        foreignField: '_id',
        as: 'tag'
      }
    },
    {
      $unwind: {
        path: '$tag',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        _id: 0,
        tagId: '$_id',
        tag: { $ifNull: ['$tag.name', 'Unknown Tag'] },
        amount: { $round: ['$amount', 2] }
      }
    },
    { $sort: { amount: -1 } }
  ];

  return Transaction.aggregate(pipeline);
};

/**
 * Income vs expense per calendar month within the active filter range.
 * Partial first/last months only include days inside rangeStart–rangeEnd.
 */
const getMonthlyComparison = async (userId, account, rangeStart, rangeEnd, maxMonths = 12) => {
  const rows = [];
  const monthStarts = [];

  let cursor = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1);
  const endMonthStart = new Date(rangeEnd.getFullYear(), rangeEnd.getMonth(), 1);

  while (cursor <= endMonthStart) {
    monthStarts.push(new Date(cursor));
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
  }

  const capped =
    monthStarts.length > maxMonths ? monthStarts.slice(monthStarts.length - maxMonths) : monthStarts;

  for (const monthStart of capped) {
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0, 23, 59, 59, 999);
    const dateStart = monthStart < rangeStart ? rangeStart : monthStart;
    const dateEnd = monthEnd > rangeEnd ? rangeEnd : monthEnd;

    const totals = await aggregateTransactionTotals(userId, dateStart, dateEnd, account);
    const monthKey = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = monthStart.toLocaleString('en-US', { month: 'short', year: '2-digit' });

    rows.push({
      month: monthKey,
      monthLabel,
      income: Math.round((totals.income || 0) * 100) / 100,
      expense: Math.round((totals.expense || 0) * 100) / 100
    });
  }

  return rows;
};

/**
 * Get chart data for analytics
 * GET /api/analytics/charts
 */
const getChartData = async (req, res, next) => {
  try {
    const { type, month, startDate, endDate, chartType, categoryId, account, months } = req.query;
    const userId = req.user._id;
    const userIdStr = userId.toString();
    const accountScope = normalizeAccount(account) || 'all';

    const chart = chartType || 'monthlyTrend';

    if (chart !== 'monthlyComparison') {
      if (!type) {
        return res.status(400).json({
          success: false,
          error: 'Type is required. Must be one of: expense, income, savings, investment'
        });
      }

      if (!['expense', 'income', 'savings', 'investment'].includes(type)) {
        return res.status(400).json({
          success: false,
          error: 'Type must be one of: expense, income, savings, investment'
        });
      }
    }

    const explicitMonth = month && String(month).trim() !== '';
    const explicitRange =
      startDate &&
      endDate &&
      String(startDate).trim() !== '' &&
      String(endDate).trim() !== '';
    const useTrailingMonths =
      chart === 'monthlyComparison' && !explicitMonth && !explicitRange;

    let dateStart;
    let dateEnd;
    try {
      if (useTrailingMonths) {
        const maxMonths = Math.min(Math.max(parseInt(months, 10) || 6, 1), 12);
        const now = new Date();
        dateEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        dateStart = new Date(now.getFullYear(), now.getMonth() - (maxMonths - 1), 1);
        dateStart.setHours(0, 0, 0, 0);
      } else {
        const dateRange = getDateRange(month, startDate, endDate);
        dateStart = dateRange.dateStart;
        dateEnd = dateRange.dateEnd;
      }
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    const cacheKeyParts = [
      `analytics:${userIdStr}:charts`,
      type || 'multi',
      chart,
      useTrailingMonths ? `trailing:${months || 6}` : month || `${startDate}:${endDate}`,
      categoryId || 'all',
      accountScope,
      months || '6'
    ];
    const cacheKey = cacheKeyParts.join(':');

    const versionedCacheKey = await resolveAnalyticsCacheKey(userId, cacheKey);
    const cachedData = await cache.get(versionedCacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    let data;
    let chartName;

    switch (chart) {
      case 'monthlyTrend':
        chartName = 'Monthly Trend';
        data = await getMonthlyTrend(userId, type, dateStart, dateEnd, account);
        break;

      case 'categorySplit':
        chartName = 'Category Split';
        data = await getCategorySplit(userId, type, dateStart, dateEnd, account);
        break;

      case 'subCategorySplit':
        chartName = 'Sub-Category Split';
        data = await getSubCategorySplit(userId, type, dateStart, dateEnd, categoryId, account);
        break;

      case 'tagBased':
        chartName = 'Tag-Based Spending';
        data = await getTagBasedSpending(userId, type, dateStart, dateEnd, account);
        break;

      case 'paymentMethodSplit':
        chartName = 'Payment Method Split';
        data = await getPaymentMethodSplit(userId, type, dateStart, dateEnd, account);
        break;

      case 'monthlyComparison': {
        chartName = 'Monthly Comparison';
        const maxMonths = Math.min(Math.max(parseInt(months, 10) || 12, 1), 12);
        data = await getMonthlyComparison(userId, account, dateStart, dateEnd, maxMonths);
        break;
      }

      default:
        return res.status(400).json({
          success: false,
          error:
            'Invalid chartType. Must be one of: monthlyTrend, categorySplit, subCategorySplit, tagBased, paymentMethodSplit, monthlyComparison'
        });
    }

    const response = {
      success: true,
      chartType: chartName,
      type: type || null,
      account: accountScope,
      range: {
        startDate: dateStart.toISOString(),
        endDate: dateEnd.toISOString()
      },
      data
    };

    await cache.set(versionedCacheKey, response, 600);
    res.json(response);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardAnalytics,
  getChartData
};
