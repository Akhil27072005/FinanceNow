const express = require('express');
const router = express.Router();
const { submitContact } = require('../controllers/contact.controller');

/**
 * Public contact / feedback routes
 * POST /api/contact
 */
router.post('/', submitContact);

module.exports = router;
