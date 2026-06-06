const express = require('express');
const router = express.Router();
const authenticateUser = require('../middlewares/auth.middleware');
const { detectPaymentLogo } = require('../controllers/paymentLogo.controller');

/**
 * Payment logo detection (Brandfetch Search + Logo CDN)
 * Base path: /api/payment-logo
 */

router.get('/detect', authenticateUser, detectPaymentLogo);

module.exports = router;
