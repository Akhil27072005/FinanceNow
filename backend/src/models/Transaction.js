const mongoose = require('mongoose');

/**
 * Transaction Model
 * 
 * Purpose: Single model that replaces expense, income, savings, and investment sheets.
 * This unified model handles all financial transactions regardless of type.
 * 
 * Supports:
 * - Expenses (money going out)
 * - Income (money coming in)
 * - Savings (money set aside)
 * - Investments (money invested)
 */
const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['expense', 'income', 'savings', 'investment'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: [0.01, 'Amount must be greater than 0']
  },
  date: {
    type: Date,
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
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag'
  }],
  paymentMethodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PaymentMethod',
    default: null
  },
  paymentMethodDetail: {
    type: String,
    trim: true,
    default: null
  },
  // Keep paymentMethod for backward compatibility (deprecated)
  paymentMethod: {
    type: String,
    trim: true,
    default: null
  },
  account: {
    type: String,
    enum: ['self', 'family'],
    default: 'self'
  },
  notes: {
    type: String,
    trim: true,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound indexes for efficient queries
// Primary query pattern: userId + date range
transactionSchema.index({ userId: 1, date: -1 });

// Analytics queries: userId + type + date
transactionSchema.index({ userId: 1, type: 1, date: -1 });

// Category-based analytics
transactionSchema.index({ userId: 1, categoryId: 1, date: -1 });

// Payment method analytics
transactionSchema.index({ userId: 1, paymentMethodId: 1, date: -1 });

// Tag-based queries
transactionSchema.index({ userId: 1, tags: 1, date: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);

