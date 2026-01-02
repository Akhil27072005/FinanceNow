const mongoose = require('mongoose');

/**
 * PaymentMethod Model
 * 
 * Purpose: Store payment methods with icons and detail labels.
 * Each payment method has an icon (from iconify) and a label for the detail field
 * (e.g., "Last 4 digits" for cards, "GPay ID" for GPay, etc.)
 * 
 * Rules:
 * - Payment method names must be unique per user
 * - Icons are iconify icon names (e.g., "logos:visa", "mdi:cash")
 * - Detail label describes what detail is needed (e.g., "Last 4 digits", "GPay ID")
 */
const paymentMethodSchema = new mongoose.Schema({
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
  icon: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['card', 'digital_wallet', 'cash', 'bank', 'other'],
    default: 'other'
  },
  detailLabel: {
    type: String,
    trim: true,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Unique index: payment method name must be unique per user
paymentMethodSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('PaymentMethod', paymentMethodSchema);

