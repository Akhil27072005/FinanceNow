/** Segment colors for allocation bar and row accents (cycles by index). */
export const SPLIT_COLORS = [
  '#500CB0',
  '#22C55E',
  '#F97316',
  '#EAB308',
  '#3B82F6',
  '#EC4899',
  '#14B8A6',
  '#8B5CF6'
];

/**
 * Build display rows from API subcategory split + dashboard total expenses.
 * Appends Uncategorized when KPI total exceeds summed subcategory amounts.
 */
export const buildSplitRows = (splitData = [], totalExpenses = 0) => {
  const items = (splitData || [])
    .filter((item) => item && (item.amount || 0) > 0)
    .map((item, index) => ({
      id: item.subCategoryId || `sub-${index}`,
      subCategory: item.subCategory || item.name || 'Uncategorized',
      category: item.category || null,
      amount: Number(item.amount) || 0,
      color: SPLIT_COLORS[index % SPLIT_COLORS.length],
      isUncategorized: false
    }));

  const categorizedTotal = items.reduce((sum, row) => sum + row.amount, 0);
  const gap = Math.round((totalExpenses - categorizedTotal) * 100) / 100;

  if (gap > 0.005) {
    items.push({
      id: 'uncategorized',
      subCategory: 'Uncategorized',
      category: null,
      amount: gap,
      color: '#9CA3AF',
      isUncategorized: true
    });
  }

  const baseTotal = totalExpenses > 0 ? totalExpenses : items.reduce((s, r) => s + r.amount, 0);

  return items.map((row) => ({
    ...row,
    percent: baseTotal > 0 ? (row.amount / baseTotal) * 100 : 0
  }));
};

export const formatSplitPercent = (value) => {
  if (value == null || Number.isNaN(value)) return '0%';
  return `${value.toFixed(1)}%`;
};
