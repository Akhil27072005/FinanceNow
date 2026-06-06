import React from 'react';
import BudgetCard from './BudgetCard';

const BudgetCardGrid = ({
  budgets = [],
  month,
  spentByBudgetId = {},
  formatCurrency,
  loading,
  onAddBudget,
  onEditBudget,
  onDeleteBudget
}) => {
  if (loading) {
    return (
      <div className="budgets-grid">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="glass-panel budget-card budget-card--skeleton" />
        ))}
      </div>
    );
  }

  if (!budgets.length) {
    return (
      <div className="glass-panel budgets-empty">
        <h3 className="budgets-empty__title">No budgets for this month</h3>
        <p className="budgets-empty__desc">
          Create a budget for a category or subcategory to track your spending.
        </p>
        <button type="button" className="budgets-empty__cta" onClick={onAddBudget}>
          + Add your first budget
        </button>
      </div>
    );
  }

  return (
    <div className="budgets-grid">
      {budgets.map((b) => (
        <BudgetCard
          key={b._id}
          budget={b}
          month={month}
          spent={spentByBudgetId?.[b._id] || 0}
          formatCurrency={formatCurrency}
          onEdit={onEditBudget}
          onDelete={onDeleteBudget}
          burnRate
        />
      ))}
    </div>
  );
};

export default BudgetCardGrid;
