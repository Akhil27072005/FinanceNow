import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Receipt } from 'lucide-react';
import TransactionCategoryIcon from '../transactions/TransactionCategoryIcon';
import DashboardSectionCard from './DashboardSectionCard';
import { useUserFormatters } from '../../hooks/useUserFormatters';
import { getTransactionLabel } from '../../utils/transactionDisplayUtils';

const getCategoryPill = (txn) => txn.categoryId?.name || txn.type || 'Other';

const RecentTransactionsCard = ({ transactions = [], loading = false }) => {
  const { formatCurrency, formatDateShort } = useUserFormatters();

  const formatAmount = (txn) => {
    const value = formatCurrency(txn.amount);
    if (txn.type === 'income') {
      return { text: `+${value}`, className: 'dashboard-list-card__row-amount--positive' };
    }
    return { text: `-${value}`, className: 'dashboard-list-card__row-amount--negative' };
  };

  if (loading) {
    return (
      <DashboardSectionCard title="Transactions" seeAllTo="/transactions">
        <div className="dashboard-list-card__loading">
          {[0, 1, 2].map((i) => (
            <div key={i} className="dashboard-list-card__skeleton-row" />
          ))}
        </div>
      </DashboardSectionCard>
    );
  }

  if (!transactions.length) {
    return (
      <DashboardSectionCard title="Transactions" seeAllTo="/transactions">
        <p className="dashboard-list-card__empty">No recent transactions</p>
      </DashboardSectionCard>
    );
  }

  return (
    <DashboardSectionCard title="Transactions" seeAllTo="/transactions">
      <div className="dashboard-list-card__rows">
        {transactions.slice(0, 3).map((txn) => {
          const amount = formatAmount(txn);
          const label = getTransactionLabel(txn);
          const initial = label.charAt(0).toUpperCase();
          const rowKey = txn._id ?? txn.id;
          const hasClassification = txn.categoryId || txn.subCategoryId;

          return (
            <Link
              key={rowKey}
              to="/transactions"
              className="dashboard-list-card__row"
            >
              {hasClassification ? (
                <TransactionCategoryIcon
                  transaction={txn}
                  size={20}
                  variant="lg"
                  className="dashboard-list-card__row-icon"
                />
              ) : (
                <div
                  className="dashboard-list-card__row-icon dashboard-list-card__row-icon--letter"
                  aria-hidden
                >
                  {initial || <Receipt size={18} strokeWidth={2} />}
                </div>
              )}
              <div className="dashboard-list-card__row-main">
                <p className="dashboard-list-card__row-name">{label}</p>
              </div>
              <span className="dashboard-list-card__row-pill">{getCategoryPill(txn)}</span>
              <span className={`dashboard-list-card__row-amount ${amount.className}`}>
                {amount.text}
              </span>
              <span className="dashboard-list-card__row-date">
                {formatDateShort(txn.date)}
              </span>
              <ChevronRight
                size={18}
                strokeWidth={2}
                className="dashboard-list-card__row-chevron"
                aria-hidden
              />
            </Link>
          );
        })}
      </div>
    </DashboardSectionCard>
  );
};

export default RecentTransactionsCard;
