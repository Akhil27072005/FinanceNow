const Tag = require('../src/models/Tag');
const Transaction = require('../src/models/Transaction');
const mongoose = require('mongoose');

/**
 * Create a new tag
 * POST /api/tags
 */
const createTag = async (req, res, next) => {
  try {
    const { name, color } = req.body;

    // Validation: Required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Name is required'
      });
    }

    // Validation: Name must not be empty after trim
    const trimmedName = name.trim();
    if (!trimmedName) {
      return res.status(400).json({
        success: false,
        error: 'Tag name cannot be empty'
      });
    }

    // Create tag (uniqueness is enforced by schema index)
    const tag = new Tag({
      userId: req.user._id,
      name: trimmedName,
      color: color ? color.trim() : null
    });

    try {
      await tag.save();
    } catch (error) {
      // Handle duplicate key error (uniqueness constraint)
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          error: `Tag "${trimmedName}" already exists`
        });
      }
      throw error;
    }

    res.status(201).json({
      success: true,
      data: tag
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all tags for the logged-in user
 * GET /api/tags
 */
const getTags = async (req, res, next) => {
  try {
    // Get all tags for user (always scoped to userId for security)
    const tags = await Tag.find({
      userId: req.user._id
    }).sort({ name: 1 });

    res.json({
      success: true,
      data: tags
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a tag
 * PUT /api/tags/:id
 */
const updateTag = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid tag ID format'
      });
    }

    // Find tag (must belong to user)
    const tag = await Tag.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!tag) {
      return res.status(404).json({
        success: false,
        error: 'Tag not found'
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
          error: 'Tag name cannot be empty'
        });
      }
      tag.name = trimmedName;
    }

    // Update color if provided
    if (color !== undefined) {
      tag.color = color ? color.trim() : null;
    }

    // Save (uniqueness is enforced by schema index)
    try {
      await tag.save();
    } catch (error) {
      // Handle duplicate key error (uniqueness constraint)
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          error: `Tag "${tag.name}" already exists`
        });
      }
      throw error;
    }

    res.json({
      success: true,
      data: tag
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a tag
 * DELETE /api/tags/:id
 */
const deleteTag = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid tag ID format'
      });
    }

    // Find tag (must belong to user)
    const tag = await Tag.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!tag) {
      return res.status(404).json({
        success: false,
        error: 'Tag not found'
      });
    }

    // Check if tag is used in any transactions
    const transactionCount = await Transaction.countDocuments({
      userId: req.user._id,
      tags: id
    });

    if (transactionCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete tag. It is used in ${transactionCount} transaction(s). Please remove or update those transactions first.`
      });
    }

    // Delete tag
    await Tag.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Tag deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTag,
  getTags,
  updateTag,
  deleteTag
};

