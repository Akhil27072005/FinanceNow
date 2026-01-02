const Category = require('../src/models/Category');
const Transaction = require('../src/models/Transaction');
const mongoose = require('mongoose');

/**
 * Create a new category
 * POST /api/categories
 */
const createCategory = async (req, res, next) => {
  try {
    const { name, type } = req.body;

    // Validation: Required fields
    if (!name || !type) {
      return res.status(400).json({
        success: false,
        error: 'Name and type are required'
      });
    }

    // Validation: Type must be valid enum
    if (!['expense', 'income'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Type must be either "expense" or "income"'
      });
    }

    // Validation: Name must not be empty after trim
    const trimmedName = name.trim();
    if (!trimmedName) {
      return res.status(400).json({
        success: false,
        error: 'Category name cannot be empty'
      });
    }

    // Create category (uniqueness is enforced by schema index)
    const category = new Category({
      userId: req.user._id,
      name: trimmedName,
      type
    });

    try {
      await category.save();
    } catch (error) {
      // Handle duplicate key error (uniqueness constraint)
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          error: `Category "${trimmedName}" already exists for type "${type}"`
        });
      }
      throw error;
    }

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all categories for the logged-in user
 * GET /api/categories
 */
const getCategories = async (req, res, next) => {
  try {
    const { type } = req.query;

    // Build filter (always include userId for security)
    const filter = {
      userId: req.user._id
    };

    // Filter by type if provided
    if (type) {
      if (!['expense', 'income'].includes(type)) {
        return res.status(400).json({
          success: false,
          error: 'Type must be either "expense" or "income"'
        });
      }
      filter.type = type;
    }

    // Get categories sorted by name
    const categories = await Category.find(filter).sort({ name: 1 });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a category
 * PUT /api/categories/:id
 */
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, type } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category ID format'
      });
    }

    // Find category (must belong to user)
    const category = await Category.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
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
          error: 'Category name cannot be empty'
        });
      }
      category.name = trimmedName;
    }

    // Update type if provided
    if (type !== undefined) {
      if (!['expense', 'income'].includes(type)) {
        return res.status(400).json({
          success: false,
          error: 'Type must be either "expense" or "income"'
        });
      }
      category.type = type;
    }

    // Save (uniqueness is enforced by schema index)
    try {
      await category.save();
    } catch (error) {
      // Handle duplicate key error (uniqueness constraint)
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          error: `Category "${category.name}" already exists for type "${category.type}"`
        });
      }
      throw error;
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a category
 * DELETE /api/categories/:id
 */
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category ID format'
      });
    }

    // Find category (must belong to user)
    const category = await Category.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Check if category is used in any transactions
    const transactionCount = await Transaction.countDocuments({
      userId: req.user._id,
      categoryId: id
    });

    if (transactionCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete category. It is used in ${transactionCount} transaction(s). Please remove or update those transactions first.`
      });
    }

    // Check if category has subcategories
    const SubCategory = require('../src/models/SubCategory');
    const subCategoryCount = await SubCategory.countDocuments({
      userId: req.user._id,
      categoryId: id
    });

    if (subCategoryCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete category. It has ${subCategoryCount} subcategory(ies). Please delete those subcategories first.`
      });
    }

    // Delete category
    await Category.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory
};

