const PaymentMethod = require('../src/models/PaymentMethod');
const Transaction = require('../src/models/Transaction');
const mongoose = require('mongoose');

/**
 * Create a new payment method
 * POST /api/payment-methods
 */
const createPaymentMethod = async (req, res, next) => {
  try {
    const { name, icon, type, detailLabel } = req.body;

    // Validation: Required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Name is required'
      });
    }

    if (!icon) {
      return res.status(400).json({
        success: false,
        error: 'Icon is required'
      });
    }

    // Validation: Name must not be empty after trim
    const trimmedName = name.trim();
    if (!trimmedName) {
      return res.status(400).json({
        success: false,
        error: 'Payment method name cannot be empty'
      });
    }

    // Create payment method (uniqueness is enforced by schema index)
    const paymentMethod = new PaymentMethod({
      userId: req.user._id,
      name: trimmedName,
      icon: icon.trim(),
      type: type || 'other',
      detailLabel: detailLabel ? detailLabel.trim() : null
    });

    try {
      await paymentMethod.save();
    } catch (error) {
      // Handle duplicate key error (uniqueness constraint)
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          error: `Payment method "${trimmedName}" already exists`
        });
      }
      throw error;
    }

    res.status(201).json({
      success: true,
      data: paymentMethod
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all payment methods for the logged-in user
 * GET /api/payment-methods
 */
const getPaymentMethods = async (req, res, next) => {
  try {
    // Get all payment methods for user (always scoped to userId for security)
    const paymentMethods = await PaymentMethod.find({
      userId: req.user._id
    }).sort({ name: 1 });

    res.json({
      success: true,
      data: paymentMethods
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a payment method
 * PUT /api/payment-methods/:id
 */
const updatePaymentMethod = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, icon, type, detailLabel } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment method ID format'
      });
    }

    // Find payment method (must belong to user)
    const paymentMethod = await PaymentMethod.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        error: 'Payment method not found'
      });
    }

    // Prevent userId override
    if (req.body.userId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot modify userId'
      });
    }

    // Update fields if provided
    if (name !== undefined) {
      const trimmedName = name.trim();
      if (!trimmedName) {
        return res.status(400).json({
          success: false,
          error: 'Payment method name cannot be empty'
        });
      }
      paymentMethod.name = trimmedName;
    }

    if (icon !== undefined) {
      paymentMethod.icon = icon.trim();
    }

    if (type !== undefined) {
      paymentMethod.type = type;
    }

    if (detailLabel !== undefined) {
      paymentMethod.detailLabel = detailLabel ? detailLabel.trim() : null;
    }

    // Save (uniqueness is enforced by schema index)
    try {
      await paymentMethod.save();
    } catch (error) {
      // Handle duplicate key error (uniqueness constraint)
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          error: `Payment method "${paymentMethod.name}" already exists`
        });
      }
      throw error;
    }

    res.json({
      success: true,
      data: paymentMethod
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a payment method
 * DELETE /api/payment-methods/:id
 */
const deletePaymentMethod = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment method ID format'
      });
    }

    // Find payment method (must belong to user)
    const paymentMethod = await PaymentMethod.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        error: 'Payment method not found'
      });
    }

    // Check if payment method is used in any transactions
    const transactionCount = await Transaction.countDocuments({
      userId: req.user._id,
      paymentMethodId: id
    });

    if (transactionCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete payment method. It is used in ${transactionCount} transaction(s). Please remove or update those transactions first.`
      });
    }

    // Delete payment method
    await PaymentMethod.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Payment method deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPaymentMethod,
  getPaymentMethods,
  updatePaymentMethod,
  deletePaymentMethod
};

