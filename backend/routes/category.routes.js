const express = require('express');
const router = express.Router();
const authenticateUser = require('../middlewares/auth.middleware');
const {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory
} = require('../controllers/category.controller');

/**
 * Category routes
 * All routes are protected and require authentication
 * Base path: /api/categories
 */

// Create a new category
router.post('/', authenticateUser, createCategory);

// Get all categories (optionally filtered by type)
router.get('/', authenticateUser, getCategories);

// Update a category
router.put('/:id', authenticateUser, updateCategory);

// Delete a category
router.delete('/:id', authenticateUser, deleteCategory);

module.exports = router;

