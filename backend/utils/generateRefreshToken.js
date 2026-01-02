const jwt = require('jsonwebtoken');

/**
 * Generates a long-lived JWT refresh token
 * @param {string} userId - MongoDB user ID
 * @returns {string} - JWT refresh token
 */
const generateRefreshToken = (userId) => {
  const payload = {
    userId: userId.toString()
  };

  const options = {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d'
  };

  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, options);
};

module.exports = generateRefreshToken;

