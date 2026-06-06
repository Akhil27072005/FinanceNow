import React, { useEffect, useMemo, useState } from 'react';
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

  const [isReady, setIsReady] = useState(false);

  const rows = useMemo(
    () => buildSplitRows(splitData, totalExpenses),
    [splitData, totalExpenses]
  );

  const hasData = totalExpenses > 0 || rows.length > 0;

  useEffect(() => {
    if (loading) {
      setIsReady(false);
      return undefined;
    }

    let timeoutId;
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        timeoutId = window.setTimeout(() => setIsReady(true), 70);
      });
    });

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timeoutId);
    };
  }, [loading, splitData, totalExpenses]);

  if (loading) {
    return (
      <div className="expense-split-card glass-panel expense-split-card--loading-state">
        <div className="expense-split-card__skeleton expense-split-card__skeleton--title" />
        <div className="expense-split-card__skeleton expense-split-card__skeleton--total" />
        <p className="expense-split-card__allocation-label expense-split-card__allocation-label--skeleton">
          Allocation
        </p>
        <div className="expense-split-card__skeleton expense-split-card__skeleton--bar" />
        <div className="expense-split-card__skeleton-rows">
          {[0, 1, 2].map((i) => (
            <div key={i} className="expense-split-card__skeleton-row">
              <div className="expense-split-card__skeleton expense-split-card__skeleton--icon" />
              <div className="expense-split-card__skeleton expense-split-card__skeleton--line" />
            </div>
          ))}
        </div>
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
    <div
      className={`expense-split-card glass-panel ${isReady ? 'expense-split-card--ready' : ''}`}
    >
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
          rows.map((row, index) => (
            <div
              key={row.id}
              className="expense-split-card__bar-segment"
              style={{
                '--segment-grow': row.percent,
                '--segment-i': index,
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
            <div
              key={row.id}
              className="expense-split-card__row"
              style={{ '--row-i': index }}
            >
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
