const mongoose = require('mongoose');

/**
 * Tag Model
 * 
 * Purpose: Flexible labels for transactions (e.g., "friends", "college", "travel").
 * Tags are optional, reusable, and can be applied to multiple transactions.
 * 
 * Rules:
 * - Tag names must be unique per user
 * - Tags are reusable across transactions
 */
const tagSchema = new mongoose.Schema({
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
  color: {
    type: String,
    trim: true,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Unique index: tag name must be unique per user
tagSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Tag', tagSchema);

