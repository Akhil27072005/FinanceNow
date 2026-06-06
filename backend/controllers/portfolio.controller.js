const mongoose = require('mongoose');
const PortfolioHolding = require('../src/models/PortfolioHolding');
const PortfolioActivity = require('../src/models/PortfolioActivity');
const Transaction = require('../src/models/Transaction');
const Category = require('../src/models/Category');
const { parseActivityDate, buildHoldingRow } = require('../utils/portfolioUtils');
const cache = require('../utils/cache');

async function getOrCreatePrimaryInvestmentCategory(userId) {
  const named = await Category.findOne({
    userId,
    type: 'investment',
    name: { $in: ['Investments', 'Investment'] }
  }).sort({ createdAt: 1 });

  if (named) return named;

  const anyInvestment = await Category.findOne({
    userId,
    type: 'investment'
  }).sort({ createdAt: 1 });

  if (anyInvestment) return anyInvestment;

  return Category.create({
    userId,
    name: 'Investments',
    type: 'investment',
    icon: 'lucide:trending-up'
  });
}

async function validateInvestmentCategory(userId, categoryId) {
  if (categoryId === undefined || categoryId === null || categoryId === '') {
    return { ok: true, category: null };
  }

  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    return { ok: false, error: 'Invalid category id' };
  }

  const category = await Category.findOne({
    _id: categoryId,
    userId,
    type: 'investment'
  });

  if (!category) {
    return { ok: false, error: 'Investment category not found' };
  }

  return { ok: true, category };
}

const getPortfolioSummary = async (req, res, next) => {
  try {
    const holdings = await PortfolioHolding.find({ userId: req.user._id })
      .populate('categoryId', 'name icon type')
      .sort({ updatedAt: -1 });

    const rows = holdings.map((h) => buildHoldingRow(h));
    const totalInvested = rows.reduce((s, r) => s + r.totalCostBasis, 0);

    const topHoldings = [...rows]
      .sort((a, b) => b.totalCostBasis - a.totalCostBasis)
      .slice(0, 3);

    res.json({
      success: true,
      data: {
        totalInvested,
        holdingCount: rows.length,
        holdings: rows,
        topHoldings
      }
    });
  } catch (error) {
    next(error);
  }
};

const getHoldings = async (req, res, next) => {
  try {
    const holdings = await PortfolioHolding.find({ userId: req.user._id }).sort({
      displayName: 1
    });

    res.json({ success: true, data: holdings });
  } catch (error) {
    next(error);
  }
};

const createHolding = async (req, res, next) => {
  try {
    const { assetKey: bodyAssetKey, symbol, displayName, assetType, categoryId } = req.body;

    const assetKey = (bodyAssetKey || symbol || '').trim();
    const name = (displayName || assetKey).trim();

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Holding name is required'
      });
    }

    const existing = await PortfolioHolding.findOne({
      userId: req.user._id,
      displayName: name
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'A holding with this name already exists'
      });
    }

    const categoryResult = await validateInvestmentCategory(req.user._id, categoryId);
    if (!categoryResult.ok) {
      return res.status(400).json({ success: false, error: categoryResult.error });
    }

    const category =
      categoryResult.category || (await getOrCreatePrimaryInvestmentCategory(req.user._id));

    const holding = await PortfolioHolding.create({
      userId: req.user._id,
      assetKey: assetKey || name,
      finnhubSymbol: assetKey || name,
      assetType: assetType || 'stock_etf',
      dataProvider: 'manual',
      exchange: null,
      displayName: name,
      logoUrl: null,
      categoryId: category._id,
      quoteCurrency: 'INR',
      totalQuantity: 0,
      totalCostBasis: 0
    });

    await holding.populate('categoryId', 'name icon type');

    res.status(201).json({ success: true, data: buildHoldingRow(holding) });
  } catch (error) {
    next(error);
  }
};

const getHoldingActivities = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid holding id' });
    }

    const holding = await PortfolioHolding.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!holding) {
      return res.status(404).json({ success: false, error: 'Holding not found' });
    }

    const activities = await PortfolioActivity.find({
      holdingId: holding._id,
      userId: req.user._id
    })
      .sort({ date: -1, createdAt: -1 })
      .limit(100)
      .lean();

    res.json({
      success: true,
      data: activities.map((a) => ({
        id: a._id.toString(),
        type: a.type,
        date: a.date,
        amount: a.amount,
        transactionId: a.transactionId ? a.transactionId.toString() : null,
        createdAt: a.createdAt
      }))
    });
  } catch (error) {
    next(error);
  }
};

const getRecentActivities = async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 12, 1), 50);

    const activities = await PortfolioActivity.find({ userId: req.user._id })
      .sort({ date: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    const holdingIds = [
      ...new Set(activities.map((a) => a.holdingId?.toString()).filter(Boolean))
    ];

    const holdings = holdingIds.length
      ? await PortfolioHolding.find({
          _id: { $in: holdingIds },
          userId: req.user._id
        }).lean()
      : [];

    const holdingById = Object.fromEntries(
      holdings.map((h) => [h._id.toString(), h])
    );

    res.json({
      success: true,
      data: activities.map((a) => {
        const holding = holdingById[a.holdingId?.toString()];
        return {
          id: a._id.toString(),
          holdingId: a.holdingId.toString(),
          holdingName: holding?.displayName || 'Unknown',
          holdingSymbol: holding?.assetKey || holding?.finnhubSymbol || null,
          type: a.type,
          date: a.date,
          amount: a.amount,
          transactionId: a.transactionId ? a.transactionId.toString() : null,
          createdAt: a.createdAt
        };
      })
    });
  } catch (error) {
    next(error);
  }
};

const updateHolding = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { categoryId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid holding id' });
    }

    const holding = await PortfolioHolding.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!holding) {
      return res.status(404).json({ success: false, error: 'Holding not found' });
    }

    if (categoryId === undefined) {
      return res.status(400).json({
        success: false,
        error: 'categoryId is required (use null or empty string for default)'
      });
    }

    const categoryResult = await validateInvestmentCategory(req.user._id, categoryId);
    if (!categoryResult.ok) {
      return res.status(400).json({ success: false, error: categoryResult.error });
    }

    if (categoryResult.category) {
      holding.categoryId = categoryResult.category._id;
    } else {
      const category = await getOrCreatePrimaryInvestmentCategory(req.user._id);
      holding.categoryId = category._id;
    }

    await holding.save();
    await holding.populate('categoryId', 'name icon type');

    res.json({ success: true, data: buildHoldingRow(holding) });
  } catch (error) {
    next(error);
  }
};

const deleteHolding = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid holding id' });
    }

    const holding = await PortfolioHolding.findOneAndDelete({
      _id: id,
      userId: req.user._id
    });

    if (!holding) {
      return res.status(404).json({ success: false, error: 'Holding not found' });
    }

    await PortfolioActivity.deleteMany({ holdingId: holding._id });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

const createActivity = async (req, res, next) => {
  try {
    const { mode, holdingId, value, amount, date } = req.body;

    if (!['set_position', 'add_contribution'].includes(mode)) {
      return res.status(400).json({
        success: false,
        error: 'mode must be set_position or add_contribution'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(holdingId)) {
      return res.status(400).json({ success: false, error: 'Invalid holdingId' });
    }

    const holding = await PortfolioHolding.findOne({
      _id: holdingId,
      userId: req.user._id
    });

    if (!holding) {
      return res.status(404).json({ success: false, error: 'Holding not found' });
    }

    const activityDate = parseActivityDate(date);
    if (Number.isNaN(activityDate.getTime())) {
      return res.status(400).json({ success: false, error: 'Invalid date' });
    }

    let transactionId = null;

    if (mode === 'set_position') {
      const numValue = Number(value);
      if (!Number.isFinite(numValue) || numValue < 0) {
        return res.status(400).json({
          success: false,
          error: 'Invested amount must be a non-negative number'
        });
      }

      holding.totalCostBasis = numValue;
      await holding.save();

      await PortfolioActivity.create({
        userId: req.user._id,
        holdingId: holding._id,
        type: 'set_position',
        date: activityDate,
        amount: numValue,
        quantity: null,
        priceAtActivity: null
      });
    } else {
      const contribAmount = Number(amount);
      if (!Number.isFinite(contribAmount) || contribAmount <= 0) {
        return res.status(400).json({
          success: false,
          error: 'amount must be greater than 0'
        });
      }

      holding.totalCostBasis += contribAmount;
      await holding.save();

      if (!holding.categoryId) {
        const category = await getOrCreatePrimaryInvestmentCategory(req.user._id);
        holding.categoryId = category._id;
        await holding.save();
      }

      const transaction = new Transaction({
        userId: req.user._id,
        type: 'investment',
        amount: contribAmount,
        date: activityDate,
        categoryId: holding.categoryId,
        account: 'self',
        notes: `Portfolio: ${holding.displayName}`
      });

      await transaction.save();
      transactionId = transaction._id;

      await PortfolioActivity.create({
        userId: req.user._id,
        holdingId: holding._id,
        type: 'add_contribution',
        date: activityDate,
        amount: contribAmount,
        quantity: null,
        priceAtActivity: null,
        transactionId
      });

      await cache.invalidateAnalyticsCache(req.user._id.toString());
      await cache.invalidateTransactionsCache(req.user._id.toString());
    }

    await holding.populate('categoryId', 'name icon type');

    res.status(201).json({
      success: true,
      data: {
        holding: buildHoldingRow(holding),
        transactionId
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPortfolioSummary,
  getHoldings,
  getHoldingActivities,
  getRecentActivities,
  createHolding,
  updateHolding,
  deleteHolding,
  createActivity
};
