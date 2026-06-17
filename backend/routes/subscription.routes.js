const express = require('express');
const router = express.Router();
const authenticateUser = require('../middlewares/auth.middleware');
const {
  createSubscription,
  getSubscriptions,
  getSubscription,
  updateSubscription,
  deleteSubscription,
  getSubscriptionSummary,
  getSubscriptionPage,
  getSubscriptionPayments,
  getSubscriptionAlerts,
  markSubscriptionAsPaid
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

// Monthly paid vs scheduled summary
router.get('/summary', authenticateUser, getSubscriptionSummary);

// Combined list + summary for subscriptions page
router.get('/page', authenticateUser, getSubscriptionPage);

// Payment history — before generic /:id
router.get('/:id/payments', authenticateUser, getSubscriptionPayments);

// Mark subscription as paid (updates nextPaymentDate) - MUST come before /:id routes
router.post('/:id/mark-paid', authenticateUser, markSubscriptionAsPaid);

// Get all subscriptions (optionally filtered by isActive)
router.get('/', authenticateUser, getSubscriptions);

// Get a single subscription by ID
router.get('/:id', authenticateUser, getSubscription);

// Update a subscription
router.put('/:id', authenticateUser, updateSubscription);

// Delete a subscription
router.delete('/:id', authenticateUser, deleteSubscription);

module.exports = router;

