/**
 * Portfolio helpers (manual tracking only — no market APIs).
 */

function parseActivityDate(raw) {
  if (raw instanceof Date && !Number.isNaN(raw.getTime())) {
    return raw;
  }
  if (typeof raw === 'string' && raw.trim()) {
    const d = new Date(raw.trim());
    if (!Number.isNaN(d.getTime())) return d;
  }
  return new Date();
}

function buildHoldingRow(holding) {
  const assetKey = (holding.assetKey || holding.finnhubSymbol || '').trim();
  const invested = Number(holding.totalCostBasis) || 0;

  const category = holding.categoryId;
  const categoryId =
    category && typeof category === 'object' && category._id
      ? category._id.toString()
      : category
        ? category.toString()
        : null;

  return {
    id: holding._id.toString(),
    assetKey,
    finnhubSymbol: assetKey,
    displayName: holding.displayName,
    assetType: holding.assetType || 'stock_etf',
    categoryId,
    categoryName:
      category && typeof category === 'object' && category.name ? category.name : null,
    totalCostBasis: invested,
    totalInvested: invested
  };
}

module.exports = {
  parseActivityDate,
  buildHoldingRow
};
