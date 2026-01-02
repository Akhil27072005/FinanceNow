const Transaction = require('../src/models/Transaction');
const Subscription = require('../src/models/Subscription');
const Category = require('../src/models/Category');
const SubCategory = require('../src/models/SubCategory');
const Tag = require('../src/models/Tag');
const { Parser } = require('json2csv');
const mongoose = require('mongoose');

/**
 * Export transactions as CSV
 * GET /api/export/transactions
 */
const exportTransactions = async (req, res, next) => {
  try {
    const { type, startDate, endDate } = req.query;
    const userId = req.user._id;

    // Build filter (always include userId for security)
    const filter = {
      userId: userId
    };

    // Filter by type if provided
    if (type) {
      if (!['expense', 'income', 'savings', 'investment'].includes(type)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid type. Must be one of: expense, income, savings, investment'
        });
      }
      filter.type = type;
    }

    // Filter by date range if provided
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        const start = new Date(startDate);
        if (isNaN(start.getTime())) {
          return res.status(400).json({
            success: false,
            error: 'Invalid startDate format. Use ISO 8601 format (e.g., 2024-01-15)'
          });
        }
        filter.date.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        if (isNaN(end.getTime())) {
          return res.status(400).json({
            success: false,
            error: 'Invalid endDate format. Use ISO 8601 format (e.g., 2024-01-15)'
          });
        }
        // Set end date to end of day
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    // Fetch transactions with populated references
    // Sort by date ascending for CSV export
    const transactions = await Transaction.find(filter)
      .populate('categoryId', 'name')
      .populate('subCategoryId', 'name')
      .populate('tags', 'name')
      .sort({ date: 1 })
      .lean(); // Use lean() for better performance with large datasets

    // Transform transactions for CSV
    const csvData = transactions.map(transaction => {
      // Format date as YYYY-MM-DD
      const date = new Date(transaction.date);
      const formattedDate = date.toISOString().split('T')[0];

      // Get category name or empty string
      const category = transaction.categoryId ? transaction.categoryId.name : '';

      // Get subcategory name or empty string
      const subCategory = transaction.subCategoryId ? transaction.subCategoryId.name : '';

      // Join tag names with comma
      const tags = transaction.tags && transaction.tags.length > 0
        ? transaction.tags.map(tag => tag.name).join(', ')
        : '';

      return {
        Date: formattedDate,
        Type: transaction.type,
        Amount: transaction.amount,
        Category: category,
        SubCategory: subCategory,
        Tags: tags,
        'Payment Method': transaction.paymentMethod || '',
        Account: transaction.account,
        Notes: transaction.notes || ''
      };
    });

    // Define CSV fields
    const fields = [
      'Date',
      'Type',
      'Amount',
      'Category',
      'SubCategory',
      'Tags',
      'Payment Method',
      'Account',
      'Notes'
    ];

    // Create CSV parser
    const parser = new Parser({ fields });
    const csv = parser.parse(csvData);

    // Set response headers for CSV download
    const filename = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Send CSV as response
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

/**
 * Export subscriptions as CSV
 * GET /api/export/subscriptions
 */
const exportSubscriptions = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Fetch all subscriptions for user
    const subscriptions = await Subscription.find({ userId: userId })
      .sort({ name: 1 })
      .lean(); // Use lean() for better performance

    // Transform subscriptions for CSV
    const csvData = subscriptions.map(subscription => {
      // Format nextPaymentDate as YYYY-MM-DD
      const date = new Date(subscription.nextPaymentDate);
      const formattedDate = date.toISOString().split('T')[0];

      return {
        Name: subscription.name,
        Amount: subscription.amount,
        'Billing Cycle': subscription.billingCycle,
        'Next Payment Date': formattedDate,
        'Payment Method': subscription.paymentMethod || '',
        Active: subscription.isActive ? 'Yes' : 'No',
        'Auto Renew': subscription.autoRenew ? 'Yes' : 'No'
      };
    });

    // Define CSV fields
    const fields = [
      'Name',
      'Amount',
      'Billing Cycle',
      'Next Payment Date',
      'Payment Method',
      'Active',
      'Auto Renew'
    ];

    // Create CSV parser
    const parser = new Parser({ fields });
    const csv = parser.parse(csvData);

    // Set response headers for CSV download
    const filename = `subscriptions_${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Send CSV as response
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  exportTransactions,
  exportSubscriptions
};

