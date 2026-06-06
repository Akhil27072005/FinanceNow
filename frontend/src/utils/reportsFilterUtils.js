/** Current month as YYYY-MM (default reports filter). */
export const getDefaultReportsMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

/** True when the user picked a non-default month or a custom date range. */
export const hasReportsDateFilter = ({ month, startDate, endDate }) => {
  if (startDate && endDate) return true;
  if (month && month !== getDefaultReportsMonth()) return true;
  return false;
};

/**
 * Format active reports filter range for display (e.g. "22 Jan – 22 Feb 2025").
 */
export const formatReportsDateRangeLabel = ({ month, startDate, endDate }) => {
  const fmt = (iso) => {
    if (!iso) return '';
    const d = new Date(iso.includes('T') ? iso : `${iso}T12:00:00`);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (startDate && endDate) {
    return `${fmt(startDate)} – ${fmt(endDate)}`;
  }

  if (month) {
    const [y, m] = month.split('-').map(Number);
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0);
    return `${fmt(start.toISOString().slice(0, 10))} – ${fmt(end.toISOString().slice(0, 10))}`;
  }

  return 'Current month';
};

export const buildReportsChartFilters = (filters) => {
  const base = { account: filters.account === 'self' ? 'self' : undefined };
  if (filters.month) {
    return { ...base, month: filters.month };
  }
  if (filters.startDate && filters.endDate) {
    return { ...base, startDate: filters.startDate, endDate: filters.endDate };
  }
  return { ...base, month: getDefaultReportsMonth() };
};

/** Cash flow chart: trailing 6 months unless a date filter is active. */
export const buildCashFlowChartFilters = (filters) => {
  const accountOpt = filters.account === 'self' ? { account: 'self' } : undefined;
  if (!hasReportsDateFilter(filters)) {
    return { account: accountOpt, months: 6 };
  }
  return { ...buildReportsChartFilters(filters), account: accountOpt, months: 12 };
};

export const formatCashFlowPeriodLabel = (filters) => {
  if (!hasReportsDateFilter(filters)) {
    return 'Last 6 months';
  }
  return formatReportsDateRangeLabel(filters);
};

export const buildTransactionsLinkSearch = (filters) => {
  const params = new URLSearchParams();
  if (filters.startDate) params.set('startDate', filters.startDate);
  if (filters.endDate) params.set('endDate', filters.endDate);
  if (filters.type) params.set('type', filters.type);
  if (filters.categoryId) params.set('categoryId', filters.categoryId);
  const q = params.toString();
  return q ? `/transactions?${q}` : '/transactions';
};
