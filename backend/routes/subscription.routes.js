const express = require('express');
const router = express.Router();
const authenticateUser = require('../middlewares/auth.middleware');
const {
  createSubscription,
  getSubscriptions,
  getSubscription,
  updateSubscription,
  deleteSubscription,
  getSubscriptionAlerts
} = require('../controllers/subscription.controller');

/**
 * Subscription routes
 * All routes are protected and require authentication
 * Base path: /api/subscriptions
 */

// Create a new subscription
router.post('/', authenticateUser, createSubscription);

// Get subscription alerts (upcoming and overdue)
router.get('/alerts', authenticateUser, getSubscriptionAlerts);

// Get all subscriptions (optionally filtered by isActive)
router.get('/', authenticateUser, getSubscriptions);

// Get a single subscription by ID
router.get('/:id', authenticateUser, getSubscription);

// Update a subscription
router.put('/:id', authenticateUser, updateSubscription);

// Delete a subscription
router.delete('/:id', authenticateUser, deleteSubscription);

module.exports = router;

