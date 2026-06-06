import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import CategoryIconDisplay from '../categories/CategoryIconDisplay';
import { FALLBACK_CATEGORY_ICON } from '../../constants/categoryIcons';
import IconButton from '../ui/IconButton';
import { burnRateForMonth, getBudgetStatus } from '../../utils/budgetBurnRate';

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

const getBudgetIconMeta = (budget) => {
  const categoryType = budget?.categoryId?.type || 'expense';
  if (budget?.subCategoryId?.icon) {
    return { icon: budget.subCategoryId.icon, categoryType };
  }
  if (budget?.categoryId?.icon) {
    return { icon: budget.categoryId.icon, categoryType };
  }
  return { icon: FALLBACK_CATEGORY_ICON, categoryType };
};

const getEntityLabel = (budget) => {
  if (budget?.subCategoryId?.name) {
    const parent = budget?.categoryId?.name;
    return parent ? `${budget.subCategoryId.name}` : budget.subCategoryId.name;
  }
  return budget?.categoryId?.name || 'Budget';
};

const BudgetCard = ({
  budget,
  spent = 0,
  month,
  formatCurrency,
  onEdit,
  onDelete,
  burnRate
}) => {
  const amount = Number(budget?.amount) || 0;
  const remaining = amount - spent;
  const progressPct = amount > 0 ? clamp((spent / amount) * 100, 0, 100) : 0;
  const status = useMemo(() => getBudgetStatus(spent, amount), [spent, amount]);
  const label = getEntityLabel(budget);
  const iconMeta = useMemo(() => getBudgetIconMeta(budget), [budget]);
  const burn = useMemo(
    () => (burnRate ? burnRateForMonth({ monthKey: month, budgetAmount: amount, spent }) : null),
    [burnRate, month, amount, spent]
  );

  const txnLink = useMemo(() => {
    const params = new URLSearchParams();
    if (month) {
      params.set('startDate', `${month}-01`);
      const [y, m] = month.split('-').map(Number);
      const last = new Date(y, m, 0).getDate();
      params.set('endDate', `${month}-${String(last).padStart(2, '0')}`);
    }
    params.set('type', 'expense');
    if (budget?.categoryId?._id) params.set('categoryId', budget.categoryId._id);
    if (budget?.subCategoryId?._id) params.set('subCategoryId', budget.subCategoryId._id);
    return `/transactions?${params.toString()}`;
  }, [budget?.categoryId?._id, budget?.subCategoryId?._id, month]);

  return (
    <div className="glass-panel budget-card">
      <div className="budget-card__head">
        <div className="budget-card__title-wrap">
          <span className="budget-card__icon" aria-hidden>
            <CategoryIconDisplay
              icon={iconMeta.icon}
              size={18}
              categoryType={iconMeta.categoryType}
            />
          </span>
          <div className="budget-card__title-text">
            <p className="budget-card__title">{label}</p>
            {budget?.categoryId?.name && budget?.subCategoryId?.name ? (
              <p className="budget-card__subtitle">{budget.categoryId.name}</p>
            ) : null}
          </div>
          <span className={`budget-card__status budget-card__status--${status.tone}`}>
            {status.label}
          </span>
        </div>
        <div className="budget-card__actions">
          <IconButton glass type="edit" onClick={() => onEdit?.(budget)} />
          <IconButton glass type="delete" onClick={() => onDelete?.(budget)} />
        </div>
      </div>

      <div className="budget-card__bar">
        <div className="budget-card__bar-row">
          <div className="budget-card__bar-wrap" aria-hidden>
            <div
              className={`budget-card__bar-fill budget-card__bar-fill--${status.tone}`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className={`budget-card__pct budget-card__pct--${status.tone}`}>
            {amount > 0 ? `${Math.round((spent / amount) * 100)}%` : '—'}
          </span>
        </div>
        <div className="budget-card__bar-meta">
          <span>{formatCurrency(spent)} spent</span>
          <span>{formatCurrency(amount)} budget</span>
        </div>
      </div>

      <div className="budget-card__numbers">
        <div className="budget-card__metric">
          <span className="budget-card__metric-label">Remaining</span>
          <span
            className={`budget-card__metric-value ${
              remaining < 0 ? 'budget-card__metric-value--bad' : 'budget-card__metric-value--good'
            }`}
          >
            {formatCurrency(remaining)}
          </span>
        </div>
        <div className="budget-card__metric">
          <span className="budget-card__metric-label">Progress</span>
          <span className="budget-card__metric-value">
            {amount > 0 ? `${Math.round((spent / amount) * 100)}%` : '—'}
          </span>
        </div>
      </div>

      {burnRate ? (
        <div className="budget-card__burn">
          {burn?.kind === 'not_current' ? (
            <p className="budget-card__burn-note">
              Burn rate is shown for the current month only.
            </p>
          ) : burn?.kind === 'current' ? (
            <div className="budget-card__burn-grid">
              <div className="budget-card__burn-metric">
                <span className="budget-card__burn-label">Expected by today</span>
                <span className="budget-card__burn-value">{formatCurrency(burn.expected)}</span>
              </div>
              <div className="budget-card__burn-metric">
                <span className="budget-card__burn-label">
                  {burn.delta > 0 ? 'Overspending pace' : 'Under budget pace'}
                </span>
                <span
                  className={`budget-card__burn-value ${
                    burn.delta > 0
                      ? 'budget-card__burn-value--bad'
                      : 'budget-card__burn-value--good'
                  }`}
                >
                  {formatCurrency(Math.abs(burn.delta))}
                </span>
              </div>
              <div className="budget-card__burn-metric budget-card__burn-metric--wide">
                <span className="budget-card__burn-label">Safe daily spend</span>
                <span className="budget-card__burn-value">{formatCurrency(burn.safeDaily)}</span>
                <span className="budget-card__burn-hint">
                  {burn.remainingDays > 0
                    ? `${burn.remainingDays} day(s) remaining`
                    : 'End of month'}
                </span>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="budget-card__foot">
        <Link to={txnLink} className="budget-card__link">
          View transactions
        </Link>
      </div>
    </div>
  );
};

export default BudgetCard;
