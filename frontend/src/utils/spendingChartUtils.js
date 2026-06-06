const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/**
 * Current calendar month as YYYY-MM.
 */
export const getCurrentMonthKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

/**
 * Add delta months to a YYYY-MM string.
 */
export const addMonths = (yyyyMm, delta) => {
  const [year, month] = yyyyMm.split('-').map(Number);
  const date = new Date(year, month - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

/**
 * Human label for a month key, e.g. "Mar 2025".
 */
export const formatMonthLabel = (yyyyMm) => {
  const [year, month] = yyyyMm.split('-').map(Number);
  return `${MONTH_NAMES[month - 1]} ${year}`;
};

/**
 * Resolve focus vs benchmark months and display labels for the spending chart.
 */
export const resolveSpendingComparison = (selectedMonth) => {
  const currentMonth = getCurrentMonthKey();
  const isCurrentMonth = selectedMonth === currentMonth;

  if (isCurrentMonth) {
    const benchmarkMonth = addMonths(selectedMonth, -1);
    return {
      focusMonth: selectedMonth,
      benchmarkMonth,
      title: 'Spending this month',
      focusLabel: 'This month',
      benchmarkLabel: 'Last month',
      comparisonLabel: 'This month vs last month'
    };
  }

  return {
    focusMonth: selectedMonth,
    benchmarkMonth: currentMonth,
    title: `Spending in ${formatMonthLabel(selectedMonth)}`,
    focusLabel: formatMonthLabel(selectedMonth),
    benchmarkLabel: 'This month',
    comparisonLabel: `${formatMonthLabel(selectedMonth)} vs this month`
  };
};

const dayFromDateString = (dateStr) => {
  if (!dateStr) return null;
  const parts = dateStr.split('-');
  if (parts.length >= 3) return parseInt(parts[2], 10);
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? null : d.getDate();
};

const daysInMonth = (yyyyMm) => {
  const [year, month] = yyyyMm.split('-').map(Number);
  return new Date(year, month, 0).getDate();
};

/**
 * Last day to show on the chart x-axis (focus month).
 * Current month: today only; past months: full calendar month.
 */
export const getChartMaxDay = (focusMonth) => {
  const monthLength = daysInMonth(focusMonth);
  if (focusMonth === getCurrentMonthKey()) {
    return Math.min(monthLength, new Date().getDate());
  }
  return monthLength;
};

/**
 * Map API trend rows [{ date, amount }] to day -> amount.
 */
const trendByDay = (trendData = []) => {
  const map = new Map();
  trendData.forEach((row) => {
    const day = dayFromDateString(row.date);
    if (day != null) {
      map.set(day, (map.get(day) || 0) + (Number(row.amount) || 0));
    }
  });
  return map;
};

const formatDayLabel = (day, monthIndex) => `${day} ${MONTH_NAMES[monthIndex - 1]}`;

/**
 * Merge focus and benchmark daily trends.
 * X-axis only includes days where at least one series has spending (within chart range).
 */
export const mergeDailyTrends = (focusData = [], benchmarkData = [], focusMonth, benchmarkMonth) => {
  const focusMap = trendByDay(focusData);
  const benchmarkMap = trendByDay(benchmarkData);
  const maxDay = getChartMaxDay(focusMonth);

  if (maxDay < 1) return [];

  const [fYear, fMonth] = focusMonth.split('-').map(Number);
  const [bYear, bMonth] = benchmarkMonth.split('-').map(Number);

  const rows = [];
  for (let day = 1; day <= maxDay; day += 1) {
    const focusAmount = focusMap.get(day) ?? 0;
    const benchmarkAmount = benchmarkMap.get(day) ?? 0;
    if (focusAmount <= 0 && benchmarkAmount <= 0) continue;

    rows.push({
      day,
      label: formatDayLabel(day, fMonth),
      focusAmount,
      benchmarkAmount,
      focusDate: `${fYear}-${String(fMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      benchmarkDate: `${bYear}-${String(bMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    });
  }

  return rows;
};

export const chartHasSpendingData = (chartData) => chartData.length > 0;
