import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, Wand2 } from 'lucide-react';
import Button from '../ui/Button';

const MONTHS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const monthKeyToLabel = (monthKey) => {
  const [y, m] = String(monthKey).split('-').map(Number);
  if (!y || !m) return monthKey;
  return `${MONTHS_LONG[m - 1]} ${y}`;
};

const addMonths = (monthKey, delta) => {
  const [y, m] = String(monthKey).split('-').map(Number);
  if (!y || !m) return monthKey;
  const d = new Date(y, m - 1 + delta, 1);
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${yy}-${mm}`;
};

const BudgetMonthHeader = ({
  month,
  onChangeMonth,
  onAddBudget,
  onAutoCreate,
  autoCreating = false
}) => {
  const monthLabel = useMemo(() => monthKeyToLabel(month), [month]);

  return (
    <div className="budgets-header">
      <div className="budgets-header__title-wrap">
        <h2 className="budgets-header__title">Budgets</h2>
        <p className="budgets-header__subtitle">Set targets and track your spending pace</p>
      </div>

      <div className="budgets-header__controls">
        <div className="budgets-month">
          <button
            type="button"
            className="budgets-month__nav"
            onClick={() => onChangeMonth?.(addMonths(month, -1), -1)}
            aria-label="Previous month"
          >
            <ChevronLeft size={18} strokeWidth={2} />
          </button>
          <span className="budgets-month__label">{monthLabel}</span>
          <button
            type="button"
            className="budgets-month__nav"
            onClick={() => onChangeMonth?.(addMonths(month, 1), 1)}
            aria-label="Next month"
          >
            <ChevronRight size={18} strokeWidth={2} />
          </button>
        </div>

        <div className="budgets-header__actions">
          <Button
            variant="secondary"
            glass
            onClick={onAutoCreate}
            loading={autoCreating}
            type="button"
          >
            <Wand2 size={16} strokeWidth={2} />
            Auto-create
          </Button>
          <Button variant="primary" glass onClick={onAddBudget} type="button">
            + Add budget
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BudgetMonthHeader;

