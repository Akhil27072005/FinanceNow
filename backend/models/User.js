const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

/**
 * User Schema
 * Supports both local (email/password) and Google OAuth authentication
 */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  password: {
    type: String,
    // Password is optional (required only for local auth)
    required: function() {
      return this.authProvider === 'local';
    },
    minlength: 6
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    required: true,
    default: 'local'
  },
  googleId: {
    type: String,
    sparse: true, // Allows multiple nulls but enforces uniqueness when present
    unique: true
  },
  refreshTokens: {
    type: [String],
    default: []
  },
  passwordResetToken: {
    type: String,
    default: null
  },
  passwordResetExpires: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Hash password before saving (only for local auth users)
 */
userSchema.pre('save', async function(next) {
  // Only hash password if it's modified and user is local auth
  if (!this.isModified('password') || this.authProvider !== 'local') {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Instance method to compare password
 * @param {string} plainPassword - The plain text password to compare
 * @returns {Promise<boolean>} - True if password matches
 */
userSchema.methods.comparePassword = async function(plainPassword) {
  if (!this.password) {
    return false;
  }
  return await bcrypt.compare(plainPassword, this.password);
};

/**
 * Instance method to add refresh token
 * @param {string} refreshToken - The refresh token to add
 */
userSchema.methods.addRefreshToken = function(refreshToken) {
  if (!this.refreshTokens.includes(refreshToken)) {
    this.refreshTokens.push(refreshToken);
  }
};

/**
 * Instance method to remove refresh token
 * @param {string} refreshToken - The refresh token to remove
 */
userSchema.methods.removeRefreshToken = function(refreshToken) {
  this.refreshTokens = this.refreshTokens.filter(token => token !== refreshToken);
};

module.exports = mongoose.model('User', userSchema);

