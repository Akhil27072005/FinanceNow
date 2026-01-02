const express = require('express');
const router = express.Router();
const authenticateUser = require('../middlewares/auth.middleware');
const {
  getDashboardAnalytics,
  getChartData
} = require('../controllers/analytics.controller');

/**
 * Analytics routes
 * All routes are protected and require authentication
 * Base path: /api/analytics
 */

// Get dashboard analytics KPIs
router.get('/dashboard', authenticateUser, getDashboardAnalytics);

// Get chart data for analytics
router.get('/charts', authenticateUser, getChartData);

module.exports = router;

