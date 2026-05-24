const mongoose = require('mongoose');

/**
 * Records a completed subscription billing cycle (auto-renew or mark-paid).
 * Kept separate from transactions so expense charts stay manual-spend only.
 */
const subscriptionPaymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: [0.01, 'Amount must be greater than 0']
  },
  billingDueDate: {
    type: Date,
    required: true
  },
  source: {
    type: String,
    enum: ['auto-renew', 'mark-paid'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

subscriptionPaymentSchema.index(
  { userId: 1, subscriptionId: 1, billingDueDate: 1 },
  { unique: true }
);

subscriptionPaymentSchema.index({ userId: 1, billingDueDate: 1 });

module.exports = mongoose.model('SubscriptionPayment', subscriptionPaymentSchema);
