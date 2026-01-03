const Subscription = require('../src/models/Subscription');
const Category = require('../src/models/Category');
const PaymentMethod = require('../src/models/PaymentMethod');
const mongoose = require('mongoose');
const cache = require('../utils/cache');

/**
 * Create a new subscription
 * POST /api/subscriptions
 */
const createSubscription = async (req, res, next) => {
  try {
    const {
      name,
      amount,
      categoryId,
      billingCycle,
      nextPaymentDate,
      paymentMethod,
      paymentMethodId,
      paymentMethodDetail,
      isActive,
      autoRenew
    } = req.body;

    // Validation: Required fields
    if (!name || !amount || !billingCycle || !nextPaymentDate) {
      return res.status(400).json({
        success: false,
        error: 'Name, amount, billingCycle, and nextPaymentDate are required'
      });
    }

    // Validation: Name must not be empty after trim
    const trimmedName = name.trim();
    if (!trimmedName) {
      return res.status(400).json({
        success: false,
        error: 'Subscription name cannot be empty'
      });
    }

    // Validation: Amount must be positive
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be greater than 0'
      });
    }

    // Validation: Billing cycle must be valid enum
    if (!['monthly', 'yearly'].includes(billingCycle)) {
      return res.status(400).json({
        success: false,
        error: 'Billing cycle must be either "monthly" or "yearly"'
      });
    }

    // Validation: nextPaymentDate must be valid date
    const paymentDate = new Date(nextPaymentDate);
    if (isNaN(paymentDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid nextPaymentDate format'
      });
    }

    // Validation: categoryId must belong to user if provided
    if (categoryId) {
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid categoryId format'
        });
      }

      const category = await Category.findOne({
        _id: categoryId,
        userId: req.user._id
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          error: 'Category not found or does not belong to you'
        });
      }
    }

    // Validation: paymentMethodId must belong to user if provided
    if (paymentMethodId) {
      if (!mongoose.Types.ObjectId.isValid(paymentMethodId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid paymentMethodId format'
        });
      }

      const paymentMethodObj = await PaymentMethod.findOne({
        _id: paymentMethodId,
        userId: req.user._id
      });

      if (!paymentMethodObj) {
        return res.status(404).json({
          success: false,
          error: 'Payment method not found or does not belong to you'
        });
      }
    }

    // Create subscription
    const subscription = new Subscription({
      userId: req.user._id,
      name: trimmedName,
      amount,
      categoryId: categoryId || null,
      billingCycle,
      nextPaymentDate: paymentDate,
      paymentMethod: paymentMethod ? paymentMethod.trim() : null, // Keep for backward compatibility
      paymentMethodId: paymentMethodId || null,
      paymentMethodDetail: paymentMethodDetail || null,
      isActive: isActive !== undefined ? isActive : true,
      autoRenew: autoRenew !== undefined ? autoRenew : true
    });

    await subscription.save();

    // Populate references for response
    await subscription.populate('categoryId paymentMethodId');

    // Invalidate subscription alerts cache
    const userIdStr = req.user._id.toString();
    await cache.del(`subscriptions:${userIdStr}:alerts:7`); // Default 7 days

    res.status(201).json({
      success: true,
      data: subscription
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all subscriptions for the logged-in user
 * GET /api/subscriptions
 */
const getSubscriptions = async (req, res, next) => {
  try {
    const { isActive } = req.query;

    // Build filter (always include userId for security)
    const filter = {
      userId: req.user._id
    };

    // Filter by active status if provided
    if (isActive !== undefined) {
      if (isActive === 'true' || isActive === true) {
        filter.isActive = true;
      } else if (isActive === 'false' || isActive === false) {
        filter.isActive = false;
      } else {
        return res.status(400).json({
          success: false,
          error: 'isActive must be a boolean value'
        });
      }
    }

    // Get subscriptions sorted by nextPaymentDate ascending
    const subscriptions = await Subscription.find(filter)
      .populate('categoryId paymentMethodId')
      .sort({ nextPaymentDate: 1 });

    res.json({
      success: true,
      data: subscriptions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single subscription by ID
 * GET /api/subscriptions/:id
 */
const getSubscription = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid subscription ID format'
      });
    }

    // Find subscription (must belong to user)
    const subscription = await Subscription.findOne({
      _id: id,
      userId: req.user._id
    }).populate('categoryId paymentMethodId');

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found'
      });
    }

    res.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a subscription
 * PUT /api/subscriptions/:id
 */
const updateSubscription = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      amount,
      categoryId,
      billingCycle,
      nextPaymentDate,
      paymentMethod,
      paymentMethodId,
      paymentMethodDetail,
      isActive,
      autoRenew
    } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid subscription ID format'
      });
    }

    // Find subscription (must belong to user)
    const subscription = await Subscription.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found'
      });
    }

    // Prevent userId override
    if (req.body.userId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot modify userId'
      });
    }

    // Update name if provided
    if (name !== undefined) {
      const trimmedName = name.trim();
      if (!trimmedName) {
        return res.status(400).json({
          success: false,
          error: 'Subscription name cannot be empty'
        });
      }
      subscription.name = trimmedName;
    }

    // Update amount if provided
    if (amount !== undefined) {
      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Amount must be greater than 0'
        });
      }
      subscription.amount = amount;
    }

    // Update categoryId if provided
    if (categoryId !== undefined) {
      if (categoryId === null) {
        subscription.categoryId = null;
      } else {
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
          return res.status(400).json({
            success: false,
            error: 'Invalid categoryId format'
          });
        }

        const category = await Category.findOne({
          _id: categoryId,
          userId: req.user._id
        });

        if (!category) {
          return res.status(404).json({
            success: false,
            error: 'Category not found or does not belong to you'
          });
        }
        subscription.categoryId = categoryId;
      }
    }

    // Update billingCycle if provided
    if (billingCycle !== undefined) {
      if (!['monthly', 'yearly'].includes(billingCycle)) {
        return res.status(400).json({
          success: false,
          error: 'Billing cycle must be either "monthly" or "yearly"'
        });
      }
      subscription.billingCycle = billingCycle;
    }

    // Update nextPaymentDate if provided
    if (nextPaymentDate !== undefined) {
      const paymentDate = new Date(nextPaymentDate);
      if (isNaN(paymentDate.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid nextPaymentDate format'
        });
      }
      subscription.nextPaymentDate = paymentDate;
    }

    // Update paymentMethodId if provided
    if (paymentMethodId !== undefined) {
      if (paymentMethodId === null) {
        subscription.paymentMethodId = null;
        subscription.paymentMethodDetail = null;
      } else {
        if (!mongoose.Types.ObjectId.isValid(paymentMethodId)) {
          return res.status(400).json({
            success: false,
            error: 'Invalid paymentMethodId format'
          });
        }

        const paymentMethodObj = await PaymentMethod.findOne({
          _id: paymentMethodId,
          userId: req.user._id
        });

        if (!paymentMethodObj) {
          return res.status(404).json({
            success: false,
            error: 'Payment method not found or does not belong to you'
          });
        }
        subscription.paymentMethodId = paymentMethodId;
      }
    }

    if (paymentMethodDetail !== undefined) {
      subscription.paymentMethodDetail = paymentMethodDetail || null;
    }

    // Update paymentMethod if provided (keep for backward compatibility)
    if (paymentMethod !== undefined) {
      subscription.paymentMethod = paymentMethod ? paymentMethod.trim() : null;
    }

    // Update isActive if provided
    if (isActive !== undefined) {
      if (typeof isActive !== 'boolean') {
        return res.status(400).json({
          success: false,
          error: 'isActive must be a boolean value'
        });
      }
      subscription.isActive = isActive;
    }

    // Update autoRenew if provided
    if (autoRenew !== undefined) {
      if (typeof autoRenew !== 'boolean') {
        return res.status(400).json({
          success: false,
          error: 'autoRenew must be a boolean value'
        });
      }
      subscription.autoRenew = autoRenew;
    }

    await subscription.save();

    // Populate references for response
    await subscription.populate('categoryId paymentMethodId');

    // Invalidate subscription alerts cache
    const userIdStr = req.user._id.toString();
    await cache.del(`subscriptions:${userIdStr}:alerts:7`); // Default 7 days

    res.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a subscription
 * DELETE /api/subscriptions/:id
 */
const deleteSubscription = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid subscription ID format'
      });
    }

    // Find and delete subscription (must belong to user)
    const subscription = await Subscription.findOneAndDelete({
      _id: id,
      userId: req.user._id
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found'
      });
    }

    // Invalidate subscription alerts cache
    const userIdStr = req.user._id.toString();
    await cache.del(`subscriptions:${userIdStr}:alerts:7`); // Default 7 days

    res.json({
      success: true,
      message: 'Subscription deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get subscription alerts (upcoming and overdue)
 * GET /api/subscriptions/alerts
 */
const getSubscriptionAlerts = async (req, res, next) => {
  try {
    const { days = 7 } = req.query;
    const userId = req.user._id;
    const userIdStr = userId.toString();

    // Validate days parameter
    const daysNum = parseInt(days, 10);
    if (isNaN(daysNum) || daysNum < 1) {
      return res.status(400).json({
        success: false,
        error: 'Days must be a positive number'
      });
    }

    // Generate cache key
    const cacheKey = `subscriptions:${userIdStr}:alerts:${daysNum}`;

    // Try to get from cache first
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    // Get today's date (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate end date (today + days, end of day)
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + daysNum);
    endDate.setHours(23, 59, 59, 999);

    // Format dates for response (YYYY-MM-DD)
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // Get current month start and end for monthly subscription load
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // OPTIMIZE: Run all 3 queries in parallel instead of sequentially
    const [upcomingSubscriptions, overdueSubscriptions, monthlySubscriptions] = await Promise.all([
      // Query for upcoming subscriptions
      Subscription.find({
        userId: userId,
        isActive: true,
        nextPaymentDate: {
          $gte: today,
          $lte: endDate
        }
      })
        .select('_id name amount billingCycle nextPaymentDate')
        .sort({ nextPaymentDate: 1 }), // Sort by nearest date first

      // Query for overdue subscriptions
      Subscription.find({
        userId: userId,
        isActive: true,
        nextPaymentDate: {
          $lt: today
        }
      })
        .select('_id name amount billingCycle nextPaymentDate')
        .sort({ nextPaymentDate: 1 }), // Sort by oldest first

      // Calculate monthly subscription load
      Subscription.find({
        userId: userId,
        isActive: true,
        nextPaymentDate: {
          $gte: currentMonthStart,
          $lte: currentMonthEnd
        }
      })
        .select('amount billingCycle')
    ]);

    // Calculate total monthly spend (normalize yearly to monthly)
    let monthlySubscriptionSpend = 0;
    monthlySubscriptions.forEach(sub => {
      if (sub.billingCycle === 'yearly') {
        monthlySubscriptionSpend += sub.amount / 12;
      } else {
        monthlySubscriptionSpend += sub.amount;
      }
    });

    // Format subscription data for response
    const formatSubscription = (sub) => ({
      id: sub._id.toString(),
      name: sub.name,
      amount: Math.round(sub.amount * 100) / 100,
      billingCycle: sub.billingCycle,
      nextPaymentDate: formatDate(sub.nextPaymentDate)
    });

    // Build response
    const response = {
      success: true,
      range: {
        from: formatDate(today),
        to: formatDate(endDate)
      },
      summary: {
        upcomingCount: upcomingSubscriptions.length,
        overdueCount: overdueSubscriptions.length,
        monthlySubscriptionSpend: Math.round(monthlySubscriptionSpend * 100) / 100
      },
      upcoming: upcomingSubscriptions.map(formatSubscription),
      overdue: overdueSubscriptions.map(formatSubscription)
    };

    // Cache for 5 minutes (300 seconds)
    await cache.set(cacheKey, response, 300);

    res.json(response);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSubscription,
  getSubscriptions,
  getSubscription,
  updateSubscription,
  deleteSubscription,
  getSubscriptionAlerts
};

