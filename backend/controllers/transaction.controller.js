const Transaction = require('../src/models/Transaction');
const Category = require('../src/models/Category');
const SubCategory = require('../src/models/SubCategory');
const Tag = require('../src/models/Tag');
const PaymentMethod = require('../src/models/PaymentMethod');
const mongoose = require('mongoose');
const cache = require('../utils/cache');

/**
 * Create a new transaction
 * POST /api/transactions
 */
const createTransaction = async (req, res, next) => {
  try {
    const {
      type,
      amount,
      date,
      categoryId,
      subCategoryId,
      tags,
      paymentMethod,
      account,
      notes
    } = req.body;

    // Validation: Required fields
    if (!type || !amount || !date) {
      return res.status(400).json({
        success: false,
        error: 'Type, amount, and date are required'
      });
    }

    // Validation: Amount must be positive
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be greater than 0'
      });
    }

    // Validation: Type must be valid enum
    if (!['expense', 'income', 'savings', 'investment'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Type must be one of: expense, income, savings, investment'
      });
    }

    // Validation: Date must be valid
    const transactionDate = new Date(date);
    if (isNaN(transactionDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format'
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

    // Validation: subCategoryId must belong to user if provided
    if (subCategoryId) {
      if (!mongoose.Types.ObjectId.isValid(subCategoryId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid subCategoryId format'
        });
      }

      const subCategory = await SubCategory.findOne({
        _id: subCategoryId,
        userId: req.user._id
      });

      if (!subCategory) {
        return res.status(404).json({
          success: false,
          error: 'SubCategory not found or does not belong to you'
        });
      }

      // If both categoryId and subCategoryId are provided, validate they match
      if (categoryId && subCategory.categoryId.toString() !== categoryId.toString()) {
        return res.status(400).json({
          success: false,
          error: 'SubCategory does not belong to the specified category'
        });
      }
    }

    // Validation: tags must belong to user if provided
    if (tags && Array.isArray(tags) && tags.length > 0) {
      // Validate all tag IDs are valid ObjectIds
      const invalidTags = tags.filter(tagId => !mongoose.Types.ObjectId.isValid(tagId));
      if (invalidTags.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid tag ID format'
        });
      }

      // Verify all tags belong to user
      const userTags = await Tag.find({
        _id: { $in: tags },
        userId: req.user._id
      });

      if (userTags.length !== tags.length) {
        return res.status(404).json({
          success: false,
          error: 'One or more tags not found or do not belong to you'
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

    // Create transaction
    const transaction = new Transaction({
      userId: req.user._id,
      type,
      amount,
      date: transactionDate,
      categoryId: categoryId || null,
      subCategoryId: subCategoryId || null,
      tags: tags || [],
      paymentMethodId: paymentMethodId || null,
      paymentMethodDetail: paymentMethodDetail || null,
      paymentMethod: paymentMethod || null, // Keep for backward compatibility
      account: account || 'self',
      notes: notes || null
    });

    await transaction.save();

    // Populate references for response
    await transaction.populate('categoryId subCategoryId tags paymentMethodId');

    // Invalidate analytics cache (transaction changes affect all analytics)
    await cache.invalidateAnalyticsCache(req.user._id.toString());
    
    // Invalidate transaction cache (first page cache)
    // Try to delete common transaction cache keys
    const userIdStr = req.user._id.toString();
    const commonCacheKeys = [
      `transactions:${userIdStr}:page1`,
      `transactions:${userIdStr}:page1:type:expense`,
      `transactions:${userIdStr}:page1:type:income`,
      `transactions:${userIdStr}:page1:type:savings`,
      `transactions:${userIdStr}:page1:type:investment`
    ];
    
    // Delete common cache keys (ignore errors for non-existent keys)
    for (const key of commonCacheKeys) {
      await cache.del(key);
    }

    res.status(201).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all transactions with filtering and pagination
 * GET /api/transactions
 */
const getTransactions = async (req, res, next) => {
  try {
    const {
      type,
      startDate,
      endDate,
      categoryId,
      tag,
      limit = 20,
      page = 1
    } = req.query;

    // Build filter object (always include userId for security)
    const filter = {
      userId: req.user._id
    };

    // Filter by type
    if (type) {
      if (!['expense', 'income', 'savings', 'investment'].includes(type)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid type. Must be one of: expense, income, savings, investment'
        });
      }
      filter.type = type;
    }

    // Filter by date range
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        const start = new Date(startDate);
        if (isNaN(start.getTime())) {
          return res.status(400).json({
            success: false,
            error: 'Invalid startDate format'
          });
        }
        filter.date.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        if (isNaN(end.getTime())) {
          return res.status(400).json({
            success: false,
            error: 'Invalid endDate format'
          });
        }
        // Set end date to end of day
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    // Filter by category
    if (categoryId) {
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid categoryId format'
        });
      }
      filter.categoryId = categoryId;
    }

    // Filter by tag
    if (tag) {
      if (!mongoose.Types.ObjectId.isValid(tag)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid tag ID format'
        });
      }
      filter.tags = tag;
    }

    // Pagination
    const limitNum = parseInt(limit, 10);
    const pageNum = parseInt(page, 10);

    if (limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        error: 'Limit must be between 1 and 100'
      });
    }

    if (pageNum < 1) {
      return res.status(400).json({
        success: false,
        error: 'Page must be greater than 0'
      });
    }

    const skip = (pageNum - 1) * limitNum;

    // Only cache first page (page = 1) with default limit (20)
    const shouldCache = pageNum === 1 && limitNum === 20;
    const userIdStr = req.user._id.toString();

    if (shouldCache) {
      // Generate cache key based on filters
      const cacheKeyParts = [`transactions:${userIdStr}:page1`];
      if (type) cacheKeyParts.push(`type:${type}`);
      if (startDate) cacheKeyParts.push(`start:${startDate}`);
      if (endDate) cacheKeyParts.push(`end:${endDate}`);
      if (categoryId) cacheKeyParts.push(`cat:${categoryId}`);
      if (tag) cacheKeyParts.push(`tag:${tag}`);
      const cacheKey = cacheKeyParts.join(':');

      // Try to get from cache first
      const cachedData = await cache.get(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }

      // Execute query
      const transactions = await Transaction.find(filter)
        .populate('categoryId subCategoryId tags paymentMethodId')
        .sort({ date: -1 }) // Sort by date descending
        .skip(skip)
        .limit(limitNum);

      // Get total count for pagination metadata
      const total = await Transaction.countDocuments(filter);

      const response = {
        success: true,
        data: transactions,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      };

      // Cache for 5 minutes (300 seconds) - first page only
      await cache.set(cacheKey, response, 300);

      return res.json(response);
    }

    // Execute query (for non-cached pages)
    const transactions = await Transaction.find(filter)
      .populate('categoryId subCategoryId tags paymentMethodId')
      .sort({ date: -1 }) // Sort by date descending
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination metadata
    const total = await Transaction.countDocuments(filter);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single transaction by ID
 * GET /api/transactions/:id
 */
const getTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid transaction ID format'
      });
    }

    // Find transaction (must belong to user)
    const transaction = await Transaction.findOne({
      _id: id,
      userId: req.user._id
    }).populate('categoryId subCategoryId tags paymentMethodId');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a transaction
 * PUT /api/transactions/:id
 */
const updateTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      type,
      amount,
      date,
      categoryId,
      subCategoryId,
      tags,
      paymentMethodId,
      paymentMethodDetail,
      paymentMethod, // Keep for backward compatibility
      account,
      notes
    } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid transaction ID format'
      });
    }

    // Find transaction (must belong to user)
    const transaction = await Transaction.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    // Prevent userId override
    if (req.body.userId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot modify userId'
      });
    }

    // Validation: Amount must be positive if provided
    if (amount !== undefined) {
      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Amount must be greater than 0'
        });
      }
      transaction.amount = amount;
    }

    // Validation: Type must be valid enum if provided
    if (type !== undefined) {
      if (!['expense', 'income', 'savings', 'investment'].includes(type)) {
        return res.status(400).json({
          success: false,
          error: 'Type must be one of: expense, income, savings, investment'
        });
      }
      transaction.type = type;
    }

    // Validation: Date must be valid if provided
    if (date !== undefined) {
      const transactionDate = new Date(date);
      if (isNaN(transactionDate.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid date format'
        });
      }
      transaction.date = transactionDate;
    }

    // Validation: categoryId must belong to user if provided
    if (categoryId !== undefined) {
      if (categoryId === null) {
        transaction.categoryId = null;
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
        transaction.categoryId = categoryId;
      }
    }

    // Validation: subCategoryId must belong to user if provided
    if (subCategoryId !== undefined) {
      if (subCategoryId === null) {
        transaction.subCategoryId = null;
      } else {
        if (!mongoose.Types.ObjectId.isValid(subCategoryId)) {
          return res.status(400).json({
            success: false,
            error: 'Invalid subCategoryId format'
          });
        }

        const subCategory = await SubCategory.findOne({
          _id: subCategoryId,
          userId: req.user._id
        });

        if (!subCategory) {
          return res.status(404).json({
            success: false,
            error: 'SubCategory not found or does not belong to you'
          });
        }

        // If categoryId is set, validate subCategory belongs to it
        if (transaction.categoryId && subCategory.categoryId.toString() !== transaction.categoryId.toString()) {
          return res.status(400).json({
            success: false,
            error: 'SubCategory does not belong to the specified category'
          });
        }
        transaction.subCategoryId = subCategoryId;
      }
    }

    // Validation: tags must belong to user if provided
    if (tags !== undefined) {
      if (Array.isArray(tags)) {
        if (tags.length > 0) {
          // Validate all tag IDs are valid ObjectIds
          const invalidTags = tags.filter(tagId => !mongoose.Types.ObjectId.isValid(tagId));
          if (invalidTags.length > 0) {
            return res.status(400).json({
              success: false,
              error: 'Invalid tag ID format'
            });
          }

          // Verify all tags belong to user
          const userTags = await Tag.find({
            _id: { $in: tags },
            userId: req.user._id
          });

          if (userTags.length !== tags.length) {
            return res.status(404).json({
              success: false,
              error: 'One or more tags not found or do not belong to you'
            });
          }
        }
        transaction.tags = tags;
      } else {
        return res.status(400).json({
          success: false,
          error: 'Tags must be an array'
        });
      }
    }

    // Validation: paymentMethodId must belong to user if provided
    if (paymentMethodId !== undefined) {
      if (paymentMethodId === null) {
        transaction.paymentMethodId = null;
        transaction.paymentMethodDetail = null;
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
        transaction.paymentMethodId = paymentMethodId;
      }
    }

    if (paymentMethodDetail !== undefined) {
      transaction.paymentMethodDetail = paymentMethodDetail || null;
    }

    // Update optional fields (keep for backward compatibility)
    if (paymentMethod !== undefined) {
      transaction.paymentMethod = paymentMethod || null;
    }
    if (account !== undefined) {
      if (!['self', 'family'].includes(account)) {
        return res.status(400).json({
          success: false,
          error: 'Account must be either "self" or "family"'
        });
      }
      transaction.account = account;
    }
    if (notes !== undefined) {
      transaction.notes = notes || null;
    }

    await transaction.save();

    // Populate references for response
    await transaction.populate('categoryId subCategoryId tags paymentMethodId');

    // Invalidate analytics cache (transaction changes affect all analytics)
    await cache.invalidateAnalyticsCache(req.user._id.toString());
    
    // Invalidate transaction cache (first page cache)
    const userIdStr = req.user._id.toString();
    await cache.delPattern(`transactions:${userIdStr}:*`);

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a transaction
 * DELETE /api/transactions/:id
 */
const deleteTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid transaction ID format'
      });
    }

    // Find and delete transaction (must belong to user)
    const transaction = await Transaction.findOneAndDelete({
      _id: id,
      userId: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    // Invalidate analytics cache (transaction changes affect all analytics)
    await cache.invalidateAnalyticsCache(req.user._id.toString());
    
    // Invalidate transaction cache (first page cache)
    const userIdStr = req.user._id.toString();
    const commonCacheKeys = [
      `transactions:${userIdStr}:page1`,
      `transactions:${userIdStr}:page1:type:expense`,
      `transactions:${userIdStr}:page1:type:income`,
      `transactions:${userIdStr}:page1:type:savings`,
      `transactions:${userIdStr}:page1:type:investment`
    ];
    
    // Delete common cache keys (ignore errors for non-existent keys)
    for (const key of commonCacheKeys) {
      await cache.del(key);
    }

    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction
};

