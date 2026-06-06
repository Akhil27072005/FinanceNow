const mongoose = require('mongoose');

const portfolioHoldingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  assetKey: {
    type: String,
    required: true,
    trim: true
  },
  /** @deprecated legacy field — use assetKey */
  finnhubSymbol: {
    type: String,
    trim: true
  },
  assetType: {
    type: String,
    enum: ['stock_etf', 'etf', 'mutual_fund'],
    default: 'stock_etf'
  },
  dataProvider: {
    type: String,
    enum: ['manual', 'twelve_data', 'finapi', 'eodhd'],
    default: 'manual'
  },
  exchange: {
    type: String,
    trim: true,
    default: null
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  logoUrl: {
    type: String,
    trim: true,
    default: null
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  quoteCurrency: {
    type: String,
    default: 'INR',
    trim: true
  },
  totalQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  totalCostBasis: {
    type: Number,
    default: 0,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

portfolioHoldingSchema.index({ userId: 1, dataProvider: 1, assetKey: 1 }, { unique: true });

portfolioHoldingSchema.pre('save', function setUpdatedAt(next) {
  if (!this.assetKey && this.finnhubSymbol) {
    this.assetKey = this.finnhubSymbol;
  }
  if (!this.finnhubSymbol && this.assetKey) {
    this.finnhubSymbol = this.assetKey;
  }
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('PortfolioHolding', portfolioHoldingSchema);
