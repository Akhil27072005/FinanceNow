const express = require('express');
const router = express.Router();
const authenticateUser = require('../middlewares/auth.middleware');
const {
  createTransaction,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction
} = require('../controllers/transaction.controller');

/**
 * Transaction routes
 * All routes are protected and require authentication
 * Base path: /api/transactions
 */

// Create a new transaction
router.post('/', authenticateUser, createTransaction);

// Get all transactions (with filtering and pagination)
router.get('/', authenticateUser, getTransactions);

// Get a single transaction by ID
router.get('/:id', authenticateUser, getTransaction);

// Update a transaction
router.put('/:id', authenticateUser, updateTransaction);

// Delete a transaction
router.delete('/:id', authenticateUser, deleteTransaction);

module.exports = router;

