const SubCategory = require('../src/models/SubCategory');
const Category = require('../src/models/Category');
const Transaction = require('../src/models/Transaction');
const mongoose = require('mongoose');

/**
 * Create a new subcategory
 * POST /api/subcategories
 */
const createSubCategory = async (req, res, next) => {
  try {
    const { name, categoryId } = req.body;

    // Validation: Required fields
    if (!name || !categoryId) {
      return res.status(400).json({
        success: false,
        error: 'Name and categoryId are required'
      });
    }

    // Validation: categoryId must be valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid categoryId format'
      });
    }

    // Validation: Name must not be empty after trim
    const trimmedName = name.trim();
    if (!trimmedName) {
      return res.status(400).json({
        success: false,
        error: 'SubCategory name cannot be empty'
      });
    }

    // Validation: Category must exist and belong to user
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

    // Create subcategory (uniqueness is enforced by schema index)
    const subCategory = new SubCategory({
      userId: req.user._id,
      categoryId,
      name: trimmedName
    });

    try {
      await subCategory.save();
    } catch (error) {
      // Handle duplicate key error (uniqueness constraint)
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          error: `SubCategory "${trimmedName}" already exists for this category`
        });
      }
      throw error;
    }

    // Populate category for response
    await subCategory.populate('categoryId');

    res.status(201).json({
      success: true,
      data: subCategory
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get subcategories (optionally filtered by category)
 * GET /api/subcategories
 */
const getSubCategories = async (req, res, next) => {
  try {
    const { categoryId } = req.query;

    // Build filter (always include userId for security)
    const filter = {
      userId: req.user._id
    };

    // Filter by category if provided
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

    // Get subcategories sorted by name
    const subCategories = await SubCategory.find(filter)
      .populate('categoryId')
      .sort({ name: 1 });

    res.json({
      success: true,
      data: subCategories
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a subcategory
 * PUT /api/subcategories/:id
 */
const updateSubCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, categoryId } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid subcategory ID format'
      });
    }

    // Find subcategory (must belong to user)
    const subCategory = await SubCategory.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!subCategory) {
      return res.status(404).json({
        success: false,
        error: 'SubCategory not found'
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
          error: 'SubCategory name cannot be empty'
        });
      }
      subCategory.name = trimmedName;
    }

    // Update categoryId if provided
    if (categoryId !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid categoryId format'
        });
      }

      // Verify new category belongs to user
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

      subCategory.categoryId = categoryId;
    }

    // Save (uniqueness is enforced by schema index)
    try {
      await subCategory.save();
    } catch (error) {
      // Handle duplicate key error (uniqueness constraint)
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          error: `SubCategory "${subCategory.name}" already exists for this category`
        });
      }
      throw error;
    }

    // Populate category for response
    await subCategory.populate('categoryId');

    res.json({
      success: true,
      data: subCategory
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a subcategory
 * DELETE /api/subcategories/:id
 */
const deleteSubCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid subcategory ID format'
      });
    }

    // Find subcategory (must belong to user)
    const subCategory = await SubCategory.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!subCategory) {
      return res.status(404).json({
        success: false,
        error: 'SubCategory not found'
      });
    }

    // Check if subcategory is used in any transactions
    const transactionCount = await Transaction.countDocuments({
      userId: req.user._id,
      subCategoryId: id
    });

    if (transactionCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete subcategory. It is used in ${transactionCount} transaction(s). Please remove or update those transactions first.`
      });
    }

    // Delete subcategory
    await SubCategory.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'SubCategory deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSubCategory,
  getSubCategories,
  updateSubCategory,
  deleteSubCategory
};

