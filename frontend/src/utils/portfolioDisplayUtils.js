/**
 * Format portfolio return percent for display.
 */
export const formatReturnPercent = (value) => {
  if (value == null || !Number.isFinite(value)) return '—';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
};

export const returnPercentClass = (value) => {
  if (value == null || !Number.isFinite(value)) return '';
  if (value > 0) return 'investments-pct--up';
  if (value < 0) return 'investments-pct--down';
  return '';
};
