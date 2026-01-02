const mongoose = require('mongoose');

/**
 * Budget Model
 * 
 * Purpose: Stores optional planned spending rules for categories or sub-categories.
 * Allows users to set monthly budget limits and track spending against them.
 * 
 * Rules:
 * - Either categoryId OR subCategoryId must be present (not both required)
 * - One budget per user per category/sub-category per month
 */
const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  subCategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubCategory',
    default: null
  },
  amount: {
    type: Number,
    required: true,
    min: [0.01, 'Amount must be greater than 0']
  },
  month: {
    type: String,
    required: true,
    // Format: YYYY-MM (e.g., "2024-01")
    match: [/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Validation: Either categoryId or subCategoryId must be present, but not both
budgetSchema.pre('validate', function(next) {
  if (!this.categoryId && !this.subCategoryId) {
    return next(new Error('Either categoryId or subCategoryId must be provided'));
  }
  if (this.categoryId && this.subCategoryId) {
    return next(new Error('Cannot set both categoryId and subCategoryId. Provide only one.'));
  }
  next();
});

// Compound unique index: one budget per user per category/sub-category per month
// This ensures a user can only have one budget per category/sub-category per month
budgetSchema.index({ userId: 1, categoryId: 1, month: 1 }, { 
  unique: true, 
  partialFilterExpression: { categoryId: { $ne: null } }
});

budgetSchema.index({ userId: 1, subCategoryId: 1, month: 1 }, { 
  unique: true, 
  partialFilterExpression: { subCategoryId: { $ne: null } }
});

module.exports = mongoose.model('Budget', budgetSchema);

