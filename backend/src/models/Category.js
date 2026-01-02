const mongoose = require('mongoose');

/**
 * Category Model
 * 
 * Purpose: Represents high-level groupings for transactions (e.g., Food, Transport, Income).
 * Categories are user-specific and organized by type (expense or income).
 * 
 * Rules:
 * - Category names must be unique per user per type
 * - Same name allowed across different users
 */
const categorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['expense', 'income'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound unique index: category name must be unique per user per type
// This allows same category name for different users, and same name for expense/income types
categorySchema.index({ userId: 1, name: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);

