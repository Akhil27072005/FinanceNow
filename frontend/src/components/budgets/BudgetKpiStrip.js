import React from 'react';

const BudgetKpiStrip = ({ totals, formatCurrency, loading }) => {
  if (loading) {
    return (
      <div className="budgets-kpi">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="glass-panel budgets-kpi__tile">
            <div className="budgets-kpi__skeleton budgets-kpi__skeleton--label" />
            <div className="budgets-kpi__skeleton budgets-kpi__skeleton--value" />
          </div>
        ))}
      </div>
    );
  }

  const t = totals || {};
  const totalBudgeted = t.totalBudgeted ?? 0;
  const totalSpent = t.totalSpent ?? 0;
  const totalRemaining = t.totalRemaining ?? totalBudgeted - totalSpent;
  const exceededCount = t.exceededCount ?? 0;

  return (
    <div className="budgets-kpi">
      <div className="glass-panel budgets-kpi__tile">
        <p className="budgets-kpi__label">Budgeted</p>
        <p className="budgets-kpi__value">{formatCurrency(totalBudgeted)}</p>
      </div>
      <div className="glass-panel budgets-kpi__tile">
        <p className="budgets-kpi__label">Spent</p>
        <p className="budgets-kpi__value budgets-kpi__value--spent">
          {formatCurrency(totalSpent)}
        </p>
      </div>
      <div className="glass-panel budgets-kpi__tile">
        <p className="budgets-kpi__label">Remaining</p>
        <p
          className={`budgets-kpi__value ${
            totalRemaining < 0 ? 'budgets-kpi__value--bad' : 'budgets-kpi__value--good'
          }`}
        >
          {formatCurrency(totalRemaining)}
        </p>
      </div>
      <div className="glass-panel budgets-kpi__tile">
        <p className="budgets-kpi__label">Exceeded</p>
        <p className="budgets-kpi__value budgets-kpi__value--count">{exceededCount}</p>
      </div>
    </div>
  );
};

export default BudgetKpiStrip;

