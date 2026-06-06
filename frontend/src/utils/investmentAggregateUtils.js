/**
 * Aggregate investment transactions by category for dashboard display.
 */
export const aggregateInvestmentsByCategory = (transactions = []) => {
  const totals = new Map();

  transactions.forEach((txn) => {
    const key = txn.categoryId?.name || 'Other';
    const prev = totals.get(key) || 0;
    totals.set(key, prev + (txn.amount || 0));
  });

  return Array.from(totals.entries())
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);
};
