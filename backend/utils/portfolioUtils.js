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

  return {
    id: holding._id.toString(),
    assetKey,
    finnhubSymbol: assetKey,
    displayName: holding.displayName,
    assetType: holding.assetType || 'stock_etf',
    totalCostBasis: invested,
    totalInvested: invested
  };
}

module.exports = {
  parseActivityDate,
  buildHoldingRow
};
