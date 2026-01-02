const express = require('express');
const router = express.Router();
const authenticateUser = require('../middlewares/auth.middleware');
const {
  createSubCategory,
  getSubCategories,
  updateSubCategory,
  deleteSubCategory
} = require('../controllers/subcategory.controller');

/**
 * SubCategory routes
 * All routes are protected and require authentication
 * Base path: /api/subcategories
 */

// Create a new subcategory
router.post('/', authenticateUser, createSubCategory);

// Get all subcategories (optionally filtered by categoryId)
router.get('/', authenticateUser, getSubCategories);

// Update a subcategory
router.put('/:id', authenticateUser, updateSubCategory);

// Delete a subcategory
router.delete('/:id', authenticateUser, deleteSubCategory);

module.exports = router;

