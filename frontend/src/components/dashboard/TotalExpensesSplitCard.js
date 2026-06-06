import React, { useMemo } from 'react';
import {
  ShoppingBag,
  Utensils,
  Car,
  Home,
  Heart,
  Zap,
  Briefcase,
  Tag,
  ChevronDown,
  Wallet
} from 'lucide-react';
import { buildSplitRows, formatSplitPercent } from '../../utils/expenseSplitUtils';
import { useUserFormatters } from '../../hooks/useUserFormatters';

const ICON_MAP = [
  ShoppingBag,
  Utensils,
  Car,
  Home,
  Heart,
  Zap,
  Briefcase,
  Tag
];

const pickIcon = (name, index) => {
  const Icon = ICON_MAP[index % ICON_MAP.length];
  return <Icon size={22} strokeWidth={2} aria-hidden />;
};

/**
 * Fundwise-style total expenses card with sub-category allocation.
 */
const TotalExpensesSplitCard = ({
  totalExpenses = 0,
  splitData = [],
  loading = false,
  error = ''
}) => {
  const { formatCurrency } = useUserFormatters();

  const rows = useMemo(
    () => buildSplitRows(splitData, totalExpenses),
    [splitData, totalExpenses]
  );

  const hasData = totalExpenses > 0 || rows.length > 0;

  if (loading) {
    return (
      <div className="expense-split-card glass-panel">
        <div className="expense-split-card__skeleton expense-split-card__skeleton--title" />
        <div className="expense-split-card__skeleton expense-split-card__skeleton--total" />
        <div className="expense-split-card__skeleton expense-split-card__skeleton--bar" />
        <div className="expense-split-card__loading">Loading expense breakdown…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="expense-split-card glass-panel">
        <p className="expense-split-card__empty" style={{ color: '#dc2626' }}>
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="expense-split-card glass-panel">
      <div className="expense-split-card__header">
        <div>
          <p className="expense-split-card__title">Total expenses</p>
          <p className="expense-split-card__total">{formatCurrency(totalExpenses)}</p>
        </div>
        <span className="expense-split-card__filter" aria-label="Expense type filter">
          Expenses
          <ChevronDown size={14} strokeWidth={2.5} aria-hidden />
        </span>
      </div>

      <p className="expense-split-card__allocation-label">Allocation</p>

      <div
        className={`expense-split-card__bar ${!hasData ? 'expense-split-card__bar--empty' : ''}`}
        role="img"
        aria-label="Expense allocation by sub-category"
      >
        {hasData ? (
          rows.map((row) => (
            <div
              key={row.id}
              className="expense-split-card__bar-segment"
              style={{
                flexGrow: row.percent,
                flexBasis: 0,
                backgroundColor: row.color
              }}
              title={`${row.subCategory}: ${formatSplitPercent(row.percent)}`}
            />
          ))
        ) : (
          <div className="expense-split-card__bar-segment" />
        )}
      </div>

      {!hasData ? (
        <p className="expense-split-card__empty">No expense data for this month.</p>
      ) : (
        <div className="expense-split-card__list">
          {rows.map((row, index) => (
            <div key={row.id} className="expense-split-card__row">
              <div className="expense-split-card__row-icon">
                {row.isUncategorized ? (
                  <Wallet size={22} strokeWidth={2} aria-hidden />
                ) : (
                  pickIcon(row.subCategory, index)
                )}
              </div>
              <div
                className="expense-split-card__row-accent"
                style={{ backgroundColor: row.color }}
                aria-hidden
              />
              <div className="expense-split-card__row-main">
                <p className="expense-split-card__row-name">{row.subCategory}</p>
                <p className="expense-split-card__row-spent">
                  -{formatCurrency(row.amount)} spent
                </p>
              </div>
              <div className="expense-split-card__row-stats">
                <p className="expense-split-card__row-amount">
                  {formatCurrency(row.amount)}{' '}
                  <span className="expense-split-card__row-pct">
                    ({formatSplitPercent(row.percent)})
                  </span>
                </p>
                <p className="expense-split-card__row-category">
                  {row.category || (row.isUncategorized ? 'No sub-category' : '—')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TotalExpensesSplitCard;
