const paymentLogoService = require('../services/paymentLogo.service');

/**
 * Detect payment brand logo from a user-typed name.
 * GET /api/payment-logo/detect?q=google%20pay
 *
 * Debouncing (400ms) should be applied on the frontend before calling this endpoint.
 */
const detectPaymentLogo = async (req, res, next) => {
  try {
    const query = req.query.q ?? req.query.query ?? req.body?.query ?? '';

    const result = await paymentLogoService.resolvePaymentLogo(query);

    if (result.success === false) {
      return res.status(502).json({
        success: false,
        error: result.message,
        data: result
      });
    }

    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    if (error.code === 'BRANDFETCH_CONFIG_MISSING') {
      return res.status(503).json({
        success: false,
        error: error.message
      });
    }
    next(error);
  }
};

module.exports = {
  detectPaymentLogo
};
