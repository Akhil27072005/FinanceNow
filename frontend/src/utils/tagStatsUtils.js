import { getMonthDateRange } from './dateUtils';
import { formatCurrency } from './userPreferencesFormat';

export const getCurrentMonthKey = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

export const formatTagCurrency = (amount, preferences) =>
  formatCurrency(amount, preferences);

export const getMutedTagColor = (hex) => {
  if (!hex) return '#F3F4F6';
  return `${hex}22`;
};

/**
 * Aggregate transaction counts and amounts per tag id from expense rows.
 */
export const aggregateTagUsageFromTransactions = (transactions = []) => {
  const counts = {};
  const amounts = {};

  transactions.forEach((txn) => {
    const tags = txn.tags || [];
    if (!tags.length) return;
    tags.forEach((tag) => {
      const id = tag._id || tag;
      if (!id) return;
      counts[id] = (counts[id] || 0) + 1;
      amounts[id] = (amounts[id] || 0) + (txn.amount || 0);
    });
  });

  return { counts, amounts };
};

/**
 * Fetch expense transactions for a month (up to maxPages) for tag aggregation.
 */
export const fetchMonthExpenseTransactions = async (transactionService, monthKey, maxPages = 5) => {
  const { startDate, endDate } = getMonthDateRange(monthKey);
  const all = [];
  let page = 1;
  let pages = 1;

  while (page <= pages && page <= maxPages) {
    const res = await transactionService.getTransactions({
      type: 'expense',
      startDate,
      endDate,
      limit: 100,
      page
    });
    all.push(...(res.data || []));
    pages = res.pagination?.pages || 1;
    page += 1;
  }

  return all;
};

export const mergeTagChartAmounts = (chartData = []) => {
  const map = {};
  chartData.forEach((row) => {
    if (row.tagId) map[row.tagId] = row.amount || 0;
  });
  return map;
};
