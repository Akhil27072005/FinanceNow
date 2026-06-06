const mongoose = require('mongoose');

const portfolioActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  holdingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PortfolioHolding',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['set_position', 'add_contribution'],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  amount: {
    type: Number,
    default: null,
    min: 0
  },
  quantity: {
    type: Number,
    default: null,
    min: 0
  },
  priceAtActivity: {
    type: Number,
    default: null,
    min: 0
  },
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PortfolioActivity', portfolioActivitySchema);
