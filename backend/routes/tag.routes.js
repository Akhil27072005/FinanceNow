const express = require('express');
const router = express.Router();
const authenticateUser = require('../middlewares/auth.middleware');
const {
  createTag,
  getTags,
  updateTag,
  deleteTag
} = require('../controllers/tag.controller');

/**
 * Tag routes
 * All routes are protected and require authentication
 * Base path: /api/tags
 */

// Create a new tag
router.post('/', authenticateUser, createTag);

// Get all tags
router.get('/', authenticateUser, getTags);

// Update a tag
router.put('/:id', authenticateUser, updateTag);

// Delete a tag
router.delete('/:id', authenticateUser, deleteTag);

module.exports = router;

