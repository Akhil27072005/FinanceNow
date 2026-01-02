const Budget = require('../src/models/Budget');
const Category = require('../src/models/Category');
const SubCategory = require('../src/models/SubCategory');
const mongoose = require('mongoose');

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

    res.json({
      success: true,
      data: budgets
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
  updateBudget,
  deleteBudget
};

