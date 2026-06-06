const express = require('express');
const router = express.Router();
const authenticateUser = require('../middlewares/auth.middleware');
const {
  getPortfolioSummary,
  getHoldings,
  getHoldingActivities,
  getRecentActivities,
  createHolding,
  updateHolding,
  deleteHolding,
  createActivity
} = require('../controllers/portfolio.controller');

router.get('/summary', authenticateUser, getPortfolioSummary);
router.get('/holdings', authenticateUser, getHoldings);
router.get('/holdings/:id/activities', authenticateUser, getHoldingActivities);
router.get('/activities/recent', authenticateUser, getRecentActivities);
router.post('/holdings', authenticateUser, createHolding);
router.patch('/holdings/:id', authenticateUser, updateHolding);
router.delete('/holdings/:id', authenticateUser, deleteHolding);
router.post('/activities', authenticateUser, createActivity);

module.exports = router;
