const express = require('express');
const router = express.Router();
const authenticateUser = require('../middlewares/auth.middleware');
const {
  createPaymentMethod,
  getPaymentMethods,
  updatePaymentMethod,
  deletePaymentMethod
} = require('../controllers/paymentMethod.controller');

/**
 * PaymentMethod routes
 * All routes are protected and require authentication
 * Base path: /api/payment-methods
 */

// Create a new payment method
router.post('/', authenticateUser, createPaymentMethod);

// Get all payment methods
router.get('/', authenticateUser, getPaymentMethods);

// Update a payment method
router.put('/:id', authenticateUser, updatePaymentMethod);

// Delete a payment method
router.delete('/:id', authenticateUser, deletePaymentMethod);

module.exports = router;

