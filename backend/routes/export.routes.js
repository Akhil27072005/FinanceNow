const express = require('express');
const router = express.Router();
const authenticateUser = require('../middlewares/auth.middleware');
const {
  exportTransactions,
  exportSubscriptions
} = require('../controllers/export.controller');

/**
 * Export routes
 * All routes are protected and require authentication
 * Base path: /api/export
 */

// Export transactions as CSV
router.get('/transactions', authenticateUser, exportTransactions);

// Export subscriptions as CSV
router.get('/subscriptions', authenticateUser, exportSubscriptions);

module.exports = router;

