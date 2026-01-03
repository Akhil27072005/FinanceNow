const Transaction = require('../src/models/Transaction');
const Subscription = require('../src/models/Subscription');
const Category = require('../src/models/Category');
const SubCategory = require('../src/models/SubCategory');
const Tag = require('../src/models/Tag');
const mongoose = require('mongoose');
const cache = require('../utils/cache');

/**
 * Utility function to determine date range from query parameters
 * Returns { dateStart, dateEnd } or throws error
 */
const getDateRange = (month, startDate, endDate) => {
  let dateStart, dateEnd;

  if (month) {
    // Validate month format (YYYY-MM)
    const monthRegex = /^\d{4}-\d{2}$/;
    if (!monthRegex.test(month)) {
      throw new Error('Month must be in YYYY-MM format (e.g., 2024-01)');
    }

    // Set start and end of month
    const [year, monthNum] = month.split('-').map(Number);
    dateStart = new Date(year, monthNum - 1, 1);
    dateEnd = new Date(year, monthNum, 0, 23, 59, 59, 999); // Last day of month
  } else if (startDate && endDate) {
    // Validate date range
    dateStart = new Date(startDate);
    dateEnd = new Date(endDate);

    if (isNaN(dateStart.getTime()) || isNaN(dateEnd.getTime())) {
      throw new Error('Invalid date format. Use ISO 8601 format (e.g., 2024-01-15)');
    }

    // Set end date to end of day
    dateEnd.setHours(23, 59, 59, 999);

    if (dateStart > dateEnd) {
      throw new Error('startDate must be before or equal to endDate');
    }
  } else {
    // Default to current month
    const now = new Date();
    const year = now.getFullYear();
    const monthNum = now.getMonth();
    dateStart = new Date(year, monthNum, 1);
    dateEnd = new Date(year, monthNum + 1, 0, 23, 59, 59, 999);
  }

  return { dateStart, dateEnd };
};

/**
 * Get dashboard analytics KPIs
 * GET /api/analytics/dashboard
 */
const getDashboardAnalytics = async (req, res, next) => {
  try {
    const { month, startDate, endDate } = req.query;
    const userId = req.user._id.toString();

    // Determine date range
    const { dateStart, dateEnd } = getDateRange(month, startDate, endDate);

    // Generate cache key
    const cacheKey = month 
      ? `analytics:${userId}:dashboard:${month}`
      : `analytics:${userId}:dashboard:${startDate}:${endDate}`;

    // Try to get from cache first
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    // Calculate number of days in range for average daily expense
    const daysInRange = Math.ceil((dateEnd - dateStart) / (1000 * 60 * 60 * 24)) + 1;

    // Transaction aggregation pipeline
    // Groups by type and sums amounts for income, expense, savings, and investment
    const transactionPipeline = [
      {
        $match: {
          userId: userId,
          date: {
            $gte: dateStart,
            $lte: dateEnd
          }
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ];

    // Execute transaction aggregation
    const transactionResults = await Transaction.aggregate(transactionPipeline);

    // Convert aggregation results to object for easy lookup
    const transactionTotals = {};
    transactionResults.forEach(result => {
      transactionTotals[result._id] = result.total;
    });

    // Extract KPI values from transaction totals
    const totalIncome = transactionTotals.income || 0;
    const totalExpenses = transactionTotals.expense || 0;
    const totalSavings = transactionTotals.savings || 0;
    const totalInvestments = transactionTotals.investment || 0;

    // Calculate derived KPIs
    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : null;
    const avgDailyExpense = daysInRange > 0 ? totalExpenses / daysInRange : 0;

    // Subscription aggregation pipeline
    // Counts active subscriptions and sums their monthly-equivalent amounts
    const subscriptionPipeline = [
      {
        $match: {
          userId: userId,
          isActive: true
        }
      },
      {
        $project: {
          amount: 1,
          billingCycle: 1,
          // Calculate monthly equivalent: yearly subscriptions divided by 12
          monthlyAmount: {
            $cond: {
              if: { $eq: ['$billingCycle', 'yearly'] },
              then: { $divide: ['$amount', 12] },
              else: '$amount'
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalMonthlySpend: { $sum: '$monthlyAmount' }
        }
      }
    ];

    // Execute subscription aggregation
    const subscriptionResults = await Subscription.aggregate(subscriptionPipeline);
    const subscriptionData = subscriptionResults[0] || { count: 0, totalMonthlySpend: 0 };

    // Build response
    const response = {
      success: true,
      range: {
        startDate: dateStart.toISOString(),
        endDate: dateEnd.toISOString()
      },
      kpis: {
        totalIncome,
        totalExpenses,
        netSavings,
        savingsRate: savingsRate !== null ? Math.round(savingsRate * 100) / 100 : null, // Round to 2 decimal places
        totalSavings,
        totalInvestments: totalInvestments,
        avgDailyExpense: Math.round(avgDailyExpense * 100) / 100, // Round to 2 decimal places
        activeSubscriptions: subscriptionData.count,
        monthlySubscriptionSpend: Math.round(subscriptionData.totalMonthlySpend * 100) / 100 // Round to 2 decimal places
      }
    };

    // Cache the response for 10 minutes (600 seconds)
    await cache.set(cacheKey, response, 600);

    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Get monthly trend chart data (Line Chart)
 * Groups transactions by date and sums amounts per day
 */
const getMonthlyTrend = async (userId, type, dateStart, dateEnd) => {
  const pipeline = [
    {
      $match: {
        userId: userId,
        type: type,
        date: {
          $gte: dateStart,
          $lte: dateEnd
        }
      }
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
    {
      $sort: { date: 1 } // Sort ascending by date for line chart
    }
  ];

  return await Transaction.aggregate(pipeline);
};

/**
 * Get category split chart data (Pie/Bar Chart)
 * Groups transactions by category and sums amounts
 */
const getCategorySplit = async (userId, type, dateStart, dateEnd) => {
  const pipeline = [
    {
      $match: {
        userId: userId,
        type: type,
        date: {
          $gte: dateStart,
          $lte: dateEnd
        },
        categoryId: { $ne: null } // Only include transactions with categories
      }
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
        preserveNullAndEmptyArrays: true // Handle missing categories gracefully
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
    {
      $sort: { amount: -1 } // Sort descending by amount
    }
  ];

  return await Transaction.aggregate(pipeline);
};

/**
 * Get payment method split chart data (Bar Chart)
 * Groups transactions by payment method and sums amounts
 */
const getPaymentMethodSplit = async (userId, type, dateStart, dateEnd) => {
  const pipeline = [
    {
      $match: {
        userId: userId,
        type: type,
        date: {
          $gte: dateStart,
          $lte: dateEnd
        },
        paymentMethodId: { $ne: null } // Only include transactions with payment methods
      }
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
        preserveNullAndEmptyArrays: true // Handle missing payment methods gracefully
      }
    },
    {
      $project: {
        _id: 0,
        paymentMethodId: '$_id',
        paymentMethod: { $ifNull: ['$paymentMethod.name', 'Unknown'] },
        amount: { $round: ['$amount', 2] }
      }
    },
    {
      $sort: { amount: -1 } // Sort descending by amount
    }
  ];

  return await Transaction.aggregate(pipeline);
};

/**
 * Get sub-category split chart data
 * Groups transactions by subcategory, optionally filtered by categoryId
 */
const getSubCategorySplit = async (userId, type, dateStart, dateEnd, categoryId = null) => {
  const matchStage = {
    userId: userId,
    type: type,
    date: {
      $gte: dateStart,
      $lte: dateEnd
    },
    subCategoryId: { $ne: null } // Only include transactions with subcategories
  };

  // Filter by categoryId if provided
  if (categoryId) {
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      throw new Error('Invalid categoryId format');
    }
    matchStage.categoryId = new mongoose.Types.ObjectId(categoryId);
  }

  const pipeline = [
    {
      $match: matchStage
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
        preserveNullAndEmptyArrays: true // Handle missing subcategories gracefully
      }
    },
    {
      $project: {
        _id: 0,
        subCategoryId: '$_id',
        subCategory: { $ifNull: ['$subcategory.name', 'Uncategorized'] },
        amount: { $round: ['$amount', 2] }
      }
    },
    {
      $sort: { amount: -1 } // Sort descending by amount
    }
  ];

  return await Transaction.aggregate(pipeline);
};

/**
 * Get tag-based spending chart data
 * Unwinds tags and groups by tagId to sum amounts
 */
const getTagBasedSpending = async (userId, type, dateStart, dateEnd) => {
  const pipeline = [
    {
      $match: {
        userId: userId,
        type: type,
        date: {
          $gte: dateStart,
          $lte: dateEnd
        },
        tags: { $exists: true, $ne: [] } // Only include transactions with tags
      }
    },
    {
      $unwind: '$tags' // Create one document per tag
    },
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
        preserveNullAndEmptyArrays: true // Handle missing tags gracefully
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
    {
      $sort: { amount: -1 } // Sort descending by amount
    }
  ];

  return await Transaction.aggregate(pipeline);
};

/**
 * Get chart data for analytics
 * GET /api/analytics/charts
 */
const getChartData = async (req, res, next) => {
  try {
    const { type, month, startDate, endDate, chartType, categoryId } = req.query;
    const userId = req.user._id.toString();

    // Validation: type is required
    if (!type) {
      return res.status(400).json({
        success: false,
        error: 'Type is required. Must be one of: expense, income, savings, investment'
      });
    }

    // Validation: type must be valid enum
    if (!['expense', 'income', 'savings', 'investment'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Type must be one of: expense, income, savings, investment'
      });
    }

    // Determine date range
    let dateStart, dateEnd;
    try {
      const dateRange = getDateRange(month, startDate, endDate);
      dateStart = dateRange.dateStart;
      dateEnd = dateRange.dateEnd;
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    // Generate cache key
    const chart = chartType || 'monthlyTrend';
    const cacheKeyParts = [
      `analytics:${userId}:charts`,
      type,
      chart,
      month || `${startDate}:${endDate}`,
      categoryId || 'all'
    ];
    const cacheKey = cacheKeyParts.join(':');

    // Try to get from cache first
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    // Determine chart type (default to monthlyTrend if not specified)
    let data;
    let chartName;

    switch (chart) {
      case 'monthlyTrend':
        chartName = 'Monthly Trend';
        data = await getMonthlyTrend(userId, type, dateStart, dateEnd);
        break;

      case 'categorySplit':
        chartName = 'Category Split';
        data = await getCategorySplit(userId, type, dateStart, dateEnd);
        break;

      case 'subCategorySplit':
        chartName = 'Sub-Category Split';
        data = await getSubCategorySplit(userId, type, dateStart, dateEnd, categoryId);
        break;

      case 'tagBased':
        chartName = 'Tag-Based Spending';
        data = await getTagBasedSpending(userId, type, dateStart, dateEnd);
        break;

      case 'paymentMethodSplit':
        chartName = 'Payment Method Split';
        data = await getPaymentMethodSplit(userId, type, dateStart, dateEnd);
        break;

      default:
        return res.status(400).json({
          success: false,
          error: `Invalid chartType. Must be one of: monthlyTrend, categorySplit, subCategorySplit, tagBased, paymentMethodSplit`
        });
    }

    const response = {
      success: true,
      chartType: chartName,
      type: type,
      range: {
        startDate: dateStart.toISOString(),
        endDate: dateEnd.toISOString()
      },
      data: data
    };

    // Cache the response for 10 minutes (600 seconds)
    await cache.set(cacheKey, response, 600);

    res.json(response);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardAnalytics,
  getChartData
};
