const jwt = require('jsonwebtoken');

/**
 * Generates a short-lived JWT access token
 * @param {string} userId - MongoDB user ID
 * @returns {string} - JWT access token
 */
const generateAccessToken = (userId) => {
  const payload = {
    userId: userId.toString()
  };

  const options = {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m'
  };

  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, options);
};

module.exports = generateAccessToken;

