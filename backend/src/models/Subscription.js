const mongoose = require('mongoose');

/**
 * Subscription Model
 * 
 * Purpose: Represents recurring payments like Netflix, Spotify, gym memberships, etc.
 * Tracks subscription details and payment schedules.
 */
const subscriptionSchema = new mongoose.Schema({
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
  amount: {
    type: Number,
    required: true,
    min: [0.01, 'Amount must be greater than 0']
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly'],
    required: true
  },
  nextPaymentDate: {
    type: Date,
    required: true
  },
  paymentMethod: {
    type: String,
    trim: true,
    default: null
  },
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
  isActive: {
    type: Boolean,
    default: true
  },
  autoRenew: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound indexes for efficient queries
// Active subscriptions query
subscriptionSchema.index({ userId: 1, isActive: 1 });

// Upcoming payments query
subscriptionSchema.index({ userId: 1, nextPaymentDate: 1 });

// Overdue subscriptions query
subscriptionSchema.index({ userId: 1, isActive: 1, nextPaymentDate: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);

