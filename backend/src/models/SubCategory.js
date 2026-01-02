const mongoose = require('mongoose');

/**
 * SubCategory Model
 * 
 * Purpose: Represents detailed breakdowns under a category.
 * Provides granular classification within a parent category.
 * 
 * Example: Category "Food" → SubCategories ["Groceries", "Restaurants", "Fast Food"]
 * 
 * Rules:
 * - Sub-category names must be unique per category per user
 */
const subCategorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound unique index: sub-category name must be unique per category per user
subCategorySchema.index({ userId: 1, categoryId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('SubCategory', subCategorySchema);

