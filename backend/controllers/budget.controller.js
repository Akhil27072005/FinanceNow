const Budget = require('../src/models/Budget');
const Category = require('../src/models/Category');
const SubCategory = require('../src/models/SubCategory');
const Transaction = require('../src/models/Transaction');
const mongoose = require('mongoose');
const cache = require('../utils/cache');

const isValidMonthKey = (month) => /^\d{4}-\d{2}$/.test(month);

const getMonthRange = (monthKey) => {
  const [yStr, mStr] = String(monthKey).split('-');
  const year = parseInt(yStr, 10);
  const month = parseInt(mStr, 10);
  if (!year || !month) return null;

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

/**
 * Create a new budget
 * POST /api/budgets
 */
const createBudget = async (req, res, next) => {
  try {
    const { categoryId, subCategoryId, amount, month } = req.body;

    // Validation: Required fields
    if (!amount || !month) {
      return res.status(400).json({
        success: false,
        error: 'Amount and month are required'
      });
    }

    // Validation: Either categoryId or subCategoryId must be provided
    if (!categoryId && !subCategoryId) {
      return res.status(400).json({
        success: false,
        error: 'Either categoryId or subCategoryId must be provided'
      });
    }

    // Validation: Cannot provide both categoryId and subCategoryId
    if (categoryId && subCategoryId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot provide both categoryId and subCategoryId. Provide only one.'
      });
    }

    // Validation: Amount must be positive
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be greater than 0'
      });
    }

    // Validation: Month format must be YYYY-MM
    const monthRegex = /^\d{4}-\d{2}$/;
    if (!monthRegex.test(month)) {
      return res.status(400).json({
        success: false,
        error: 'Month must be in YYYY-MM format (e.g., 2024-01)'
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
    }

    // Create budget (uniqueness is enforced by schema index)
    const budget = new Budget({
      userId: req.user._id,
      categoryId: categoryId || null,
      subCategoryId: subCategoryId || null,
      amount,
      month
    });

    try {
      await budget.save();
    } catch (error) {
      // Handle duplicate key error (uniqueness constraint)
      if (error.code === 11000) {
        const entity = categoryId ? 'category' : 'subcategory';
        return res.status(400).json({
          success: false,
          error: `Budget already exists for this ${entity} in ${month}`
        });
      }
      throw error;
    }

    // Populate references for response
    if (budget.categoryId) {
      await budget.populate('categoryId');
    }
    if (budget.subCategoryId) {
      await budget.populate('subCategoryId');
    }

    // Invalidate cache for this month
    const userId = req.user._id.toString();
    await cache.del(`budgets:${userId}:${budget.month}`);
    await cache.del(`budgets:${userId}`); // Also invalidate general cache
    await cache.del(`budgetsSummary:${userId}:${budget.month}`);

    res.status(201).json({
      success: true,
      data: budget
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get budgets by month
 * GET /api/budgets
 */
const getBudgets = async (req, res, next) => {
  try {
    const { month, categoryId, subCategoryId } = req.query;
    const userId = req.user._id.toString();

    // Generate cache key
    const cacheKeyParts = [`budgets:${userId}`];
    if (month) cacheKeyParts.push(month);
    if (categoryId) cacheKeyParts.push(`cat:${categoryId}`);
    if (subCategoryId) cacheKeyParts.push(`subcat:${subCategoryId}`);
    const cacheKey = cacheKeyParts.join(':');

    // Try to get from cache first
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    // Build filter (always include userId for security)
    const filter = {
      userId: req.user._id
    };

    // Filter by month if provided
    if (month) {
      // Validation: Month format must be YYYY-MM
      const monthRegex = /^\d{4}-\d{2}$/;
      if (!monthRegex.test(month)) {
        return res.status(400).json({
          success: false,
          error: 'Month must be in YYYY-MM format (e.g., 2024-01)'
        });
      }
      filter.month = month;
    }

    // Filter by categoryId if provided
    if (categoryId) {
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid categoryId format'
        });
      }

      // Verify category belongs to user
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

      filter.categoryId = categoryId;
    }

    // Filter by subCategoryId if provided
    if (subCategoryId) {
      if (!mongoose.Types.ObjectId.isValid(subCategoryId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid subCategoryId format'
        });
      }

      // Verify subcategory belongs to user
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

      filter.subCategoryId = subCategoryId;
    }

    // Get budgets sorted by month descending, then by category/subcategory name
    const budgets = await Budget.find(filter)
      .populate('categoryId subCategoryId')
      .sort({ month: -1, createdAt: -1 });

    const response = {
      success: true,
      data: budgets
    };

    // Cache for 30 minutes (1800 seconds)
    await cache.set(cacheKey, response, 1800);

    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Get budget summary for a month (budgets + spent + totals)
 * GET /api/budgets/summary?month=YYYY-MM
 */
const getBudgetSummary = async (req, res, next) => {
  try {
    const { month } = req.query;
    const userId = req.user._id.toString();

    if (!month || !isValidMonthKey(month)) {
      return res.status(400).json({
        success: false,
        error: 'Month must be in YYYY-MM format (e.g., 2024-01)'
      });
    }

    const cacheKey = `budgetsSummary:${userId}:${month}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const range = getMonthRange(month);
    if (!range) {
      return res.status(400).json({
        success: false,
        error: 'Invalid month value'
      });
    }

    const budgets = await Budget.find({ userId: req.user._id, month })
      .populate('categoryId subCategoryId')
      .sort({ createdAt: -1 });

    // Aggregate expense transactions for the month, grouped by category + subcategory
    const agg = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          type: 'expense',
          date: { $gte: range.start, $lte: range.end }
        }
      },
      {
        $group: {
          _id: { categoryId: '$categoryId', subCategoryId: '$subCategoryId' },
          amount: { $sum: '$amount' }
        }
      }
    ]);

    const spentByCategoryId = {};
    const spentBySubCategoryId = {};
    agg.forEach((row) => {
      const amount = Number(row.amount) || 0;
      const catId = row?._id?.categoryId ? String(row._id.categoryId) : null;
      const subId = row?._id?.subCategoryId ? String(row._id.subCategoryId) : null;
      if (catId) spentByCategoryId[catId] = (spentByCategoryId[catId] || 0) + amount;
      if (subId) spentBySubCategoryId[subId] = (spentBySubCategoryId[subId] || 0) + amount;
    });

    const spentByBudgetId = {};
    let totalBudgeted = 0;
    let totalSpent = 0;
    let exceededCount = 0;

    budgets.forEach((b) => {
      const budgetAmount = Number(b.amount) || 0;
      totalBudgeted += budgetAmount;

      let spent = 0;
      if (b.categoryId?._id) {
        spent = spentByCategoryId[String(b.categoryId._id)] || 0;
      } else if (b.subCategoryId?._id) {
        spent = spentBySubCategoryId[String(b.subCategoryId._id)] || 0;
      }
      spentByBudgetId[String(b._id)] = spent;
      totalSpent += spent;
      if (budgetAmount > 0 && spent >= budgetAmount) exceededCount += 1;
    });

    const response = {
      success: true,
      month,
      budgets,
      spentByBudgetId,
      totals: {
        totalBudgeted,
        totalSpent,
        totalRemaining: totalBudgeted - totalSpent,
        exceededCount
      }
    };

    await cache.set(cacheKey, response, 1800);
    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Auto-create budgets from one month into another
 * POST /api/budgets/auto-create
 * body: { fromMonth: 'YYYY-MM', toMonth: 'YYYY-MM' }
 */
const autoCreateBudgets = async (req, res, next) => {
  try {
    const { fromMonth, toMonth } = req.body || {};
    const userId = req.user._id.toString();

    if (!fromMonth || !isValidMonthKey(fromMonth) || !toMonth || !isValidMonthKey(toMonth)) {
      return res.status(400).json({
        success: false,
        error: 'fromMonth and toMonth are required and must be in YYYY-MM format (e.g., 2024-01)'
      });
    }

    if (fromMonth === toMonth) {
      return res.status(400).json({
        success: false,
        error: 'fromMonth and toMonth must be different'
      });
    }

    const sourceBudgets = await Budget.find({ userId: req.user._id, month: fromMonth })
      .select('categoryId subCategoryId amount')
      .lean();

    if (!sourceBudgets.length) {
      return res.json({
        success: true,
        fromMonth,
        toMonth,
        createdCount: 0,
        skippedCount: 0,
        createdBudgets: []
      });
    }

    // Precompute which budgets already exist in target month to compute skippedCount
    const existing = await Budget.find({ userId: req.user._id, month: toMonth })
      .select('categoryId subCategoryId')
      .lean();
    const existingKeySet = new Set(
      existing.map((b) =>
        b.categoryId
          ? `cat:${String(b.categoryId)}`
          : `sub:${String(b.subCategoryId)}`
      )
    );

    const docs = sourceBudgets.map((b) => ({
      userId: req.user._id,
      month: toMonth,
      amount: b.amount,
      categoryId: b.categoryId || null,
      subCategoryId: b.subCategoryId || null
    }));

    const skippedCount = docs.reduce((count, d) => {
      const key = d.categoryId ? `cat:${String(d.categoryId)}` : `sub:${String(d.subCategoryId)}`;
      return count + (existingKeySet.has(key) ? 1 : 0);
    }, 0);

    let inserted = [];
    try {
      inserted = await Budget.insertMany(docs, { ordered: false });
    } catch (err) {
      // insertMany ordered:false throws on dupes; still includes inserted docs on err.insertedDocs in newer mongoose
      inserted = err?.insertedDocs || [];
      // If it's not a duplicate-key situation, rethrow
      if (!err || (err.code !== 11000 && !String(err.message || '').includes('E11000'))) {
        throw err;
      }
    }

    // Populate for response
    const createdBudgets = await Budget.find({ _id: { $in: inserted.map((d) => d._id) } })
      .populate('categoryId subCategoryId')
      .sort({ createdAt: -1 });

    // Invalidate caches for both months (budgets + summary)
    await cache.del(`budgets:${userId}:${fromMonth}`);
    await cache.del(`budgets:${userId}:${toMonth}`);
    await cache.del(`budgets:${userId}`);
    await cache.del(`budgetsSummary:${userId}:${fromMonth}`);
    await cache.del(`budgetsSummary:${userId}:${toMonth}`);

    res.json({
      success: true,
      fromMonth,
      toMonth,
      createdCount: createdBudgets.length,
      skippedCount,
      createdBudgets
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a budget
 * PUT /api/budgets/:id
 */
const updateBudget = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, month, categoryId, subCategoryId } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid budget ID format'
      });
    }

    // Find budget (must belong to user)
    const budget = await Budget.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        error: 'Budget not found'
      });
    }

    // Prevent userId override
    if (req.body.userId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot modify userId'
      });
    }

    // Update amount if provided
    if (amount !== undefined) {
      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Amount must be greater than 0'
        });
      }
      budget.amount = amount;
    }

    // Update month if provided
    if (month !== undefined) {
      // Validation: Month format must be YYYY-MM
      const monthRegex = /^\d{4}-\d{2}$/;
      if (!monthRegex.test(month)) {
        return res.status(400).json({
          success: false,
          error: 'Month must be in YYYY-MM format (e.g., 2024-01)'
        });
      }
      budget.month = month;
    }

    // Update categoryId if provided
    if (categoryId !== undefined) {
      if (categoryId === null) {
        // If setting to null, must have subCategoryId
        if (!budget.subCategoryId && !subCategoryId) {
          return res.status(400).json({
            success: false,
            error: 'Cannot remove categoryId without subCategoryId. Either categoryId or subCategoryId must exist.'
          });
        }
        budget.categoryId = null;
      } else {
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
          return res.status(400).json({
            success: false,
            error: 'Invalid categoryId format'
          });
        }

        // Cannot have both categoryId and subCategoryId
        if (budget.subCategoryId || subCategoryId) {
          return res.status(400).json({
            success: false,
            error: 'Cannot set categoryId when subCategoryId exists. Remove subCategoryId first.'
          });
        }

        // Verify category belongs to user
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
        budget.categoryId = categoryId;
      }
    }

    // Update subCategoryId if provided
    if (subCategoryId !== undefined) {
      if (subCategoryId === null) {
        // If setting to null, must have categoryId
        if (!budget.categoryId && !categoryId) {
          return res.status(400).json({
            success: false,
            error: 'Cannot remove subCategoryId without categoryId. Either categoryId or subCategoryId must exist.'
          });
        }
        budget.subCategoryId = null;
      } else {
        if (!mongoose.Types.ObjectId.isValid(subCategoryId)) {
          return res.status(400).json({
            success: false,
            error: 'Invalid subCategoryId format'
          });
        }

        // Cannot have both categoryId and subCategoryId
        if (budget.categoryId || categoryId) {
          return res.status(400).json({
            success: false,
            error: 'Cannot set subCategoryId when categoryId exists. Remove categoryId first.'
          });
        }

        // Verify subcategory belongs to user
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
        budget.subCategoryId = subCategoryId;
      }
    }

    // Save (uniqueness is enforced by schema index)
    try {
      await budget.save();
    } catch (error) {
      // Handle duplicate key error (uniqueness constraint)
      if (error.code === 11000) {
        const entity = budget.categoryId ? 'category' : 'subcategory';
        return res.status(400).json({
          success: false,
          error: `Budget already exists for this ${entity} in ${budget.month}`
        });
      }
      throw error;
    }

    // Populate references for response
    if (budget.categoryId) {
      await budget.populate('categoryId');
    }
    if (budget.subCategoryId) {
      await budget.populate('subCategoryId');
    }

    // Invalidate cache for this month (and old month if changed)
    const userId = req.user._id.toString();
    await cache.del(`budgets:${userId}:${budget.month}`);
    await cache.del(`budgets:${userId}`); // Also invalidate general cache
    await cache.del(`budgetsSummary:${userId}:${budget.month}`);

    res.json({
      success: true,
      data: budget
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a budget
 * DELETE /api/budgets/:id
 */
const deleteBudget = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid budget ID format'
      });
    }

    // Find and delete budget (must belong to user)
    const budget = await Budget.findOneAndDelete({
      _id: id,
      userId: req.user._id
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        error: 'Budget not found'
      });
    }

    // Invalidate cache for this month
    const userId = req.user._id.toString();
    await cache.del(`budgets:${userId}:${budget.month}`);
    await cache.del(`budgets:${userId}`); // Also invalidate general cache
    await cache.del(`budgetsSummary:${userId}:${budget.month}`);

    res.json({
      success: true,
      message: 'Budget deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBudget,
  getBudgets,
  getBudgetSummary,
  autoCreateBudgets,
  updateBudget,
  deleteBudget
};

