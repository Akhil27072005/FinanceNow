import React from 'react';
import { Link } from 'react-router-dom';
import { useUserFormatters } from '../../hooks/useUserFormatters';

const ReportsInsightsCard = ({
  kpis = {},
  topCategory = null,
  loading = false
}) => {
  const { formatCurrency } = useUserFormatters();

  if (loading) {
    return (
      <div className="reports-insights glass-panel">
        <div className="reports-insights__skeleton-title" />
        <div className="reports-insights__skeleton-body" />
      </div>
    );
  }

  const savingsRate = kpis.savingsRate != null ? `${kpis.savingsRate}%` : '—';
  const avgDaily = formatCurrency(kpis.avgDailyExpense ?? 0);
  const subSpend = formatCurrency(kpis.monthlySubscriptionSpend ?? 0);

  const ctaTo =
    (kpis.monthlySubscriptionSpend ?? 0) > (kpis.avgDailyExpense ?? 0) * 7
      ? '/subscriptions'
      : '/budgets';
  const ctaLabel = ctaTo === '/subscriptions' ? 'Manage subscriptions' : 'View budgets';

  return (
    <div className="reports-insights glass-panel">
      <h2 className="reports-insights__title">Insights & actions</h2>
      <ul className="reports-insights__list">
        <li>
          <span className="reports-insights__bullet" aria-hidden />
          Savings rate: <strong>{savingsRate}</strong> of income this period
        </li>
        <li>
          <span className="reports-insights__bullet" aria-hidden />
          Average daily expense: <strong>{avgDaily}</strong>
        </li>
        <li>
          <span className="reports-insights__bullet" aria-hidden />
          Subscription spend in period: <strong>{subSpend}</strong>
        </li>
        {topCategory ? (
          <li>
            <span className="reports-insights__bullet" aria-hidden />
            Largest expense: <strong>{topCategory.name}</strong> · {topCategory.percent}%
          </li>
        ) : null}
      </ul>
      <Link to={ctaTo} className="reports-insights__cta">
        {ctaLabel}
      </Link>
    </div>
  );
};

export default ReportsInsightsCard;
