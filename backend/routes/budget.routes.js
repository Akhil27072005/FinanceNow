const express = require('express');
const router = express.Router();
const authenticateUser = require('../middlewares/auth.middleware');
const {
  createBudget,
  getBudgets,
  updateBudget,
  deleteBudget
} = require('../controllers/budget.controller');

/**
 * Budget routes
 * All routes are protected and require authentication
 * Base path: /api/budgets
 */

// Create a new budget
router.post('/', authenticateUser, createBudget);

// Get budgets (optionally filtered by month, categoryId, or subCategoryId)
router.get('/', authenticateUser, getBudgets);

// Update a budget
router.put('/:id', authenticateUser, updateBudget);

// Delete a budget
router.delete('/:id', authenticateUser, deleteBudget);

module.exports = router;

