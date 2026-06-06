const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

export const monthKeyToRange = (monthKey) => {
  const [y, m] = String(monthKey).split('-').map(Number);
  if (!y || !m) return null;
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 0);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

export const burnRateForMonth = ({ monthKey, budgetAmount, spent }) => {
  const range = monthKeyToRange(monthKey);
  if (!range || !Number.isFinite(budgetAmount) || budgetAmount <= 0) return null;

  const now = new Date();
  const isCurrentMonth =
    now.getFullYear() === range.start.getFullYear() &&
    now.getMonth() === range.start.getMonth();

  if (!isCurrentMonth) return { kind: 'not_current' };

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dayIndex = clamp(now.getDate(), 1, daysInMonth);
  const remainingDays = Math.max(0, daysInMonth - dayIndex);

  const expected = budgetAmount * (dayIndex / daysInMonth);
  const delta = spent - expected;
  const safeDaily =
    remainingDays <= 0
      ? Math.max(0, budgetAmount - spent)
      : Math.max(0, (budgetAmount - spent) / remainingDays);

  return {
    kind: 'current',
    remainingDays,
    expected,
    delta,
    safeDaily
  };
};

export const getBudgetStatus = (spent, budget) => {
  if (!budget || budget <= 0) return { tone: 'neutral', label: '—' };
  const pct = (spent / budget) * 100;
  if (pct >= 100) return { tone: 'danger', label: 'Exceeded' };
  if (pct >= 80) return { tone: 'warning', label: 'Warning' };
  return { tone: 'good', label: 'On track' };
};
