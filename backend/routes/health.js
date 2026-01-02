const express = require('express');
const router = express.Router();

/**
 * Health check endpoint
 * Returns server status and basic information
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;

