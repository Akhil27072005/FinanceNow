import React from 'react';
import { Link } from 'react-router-dom';
import DashboardSectionCard from './DashboardSectionCard';
import { useUserFormatters } from '../../hooks/useUserFormatters';

const InvestmentsCard = ({ items = [], loading = false }) => {
  const { formatCurrency } = useUserFormatters();

  if (loading) {
    return (
      <DashboardSectionCard title="Investments" seeAllTo="/investments">
        <div className="dashboard-list-card__loading">
          {[0, 1, 2].map((i) => (
            <div key={i} className="dashboard-list-card__skeleton-row" />
          ))}
        </div>
      </DashboardSectionCard>
    );
  }

  if (!items.length) {
    return (
      <DashboardSectionCard title="Investments" seeAllTo="/investments">
        <p className="dashboard-list-card__empty">
          No holdings yet.{' '}
          <Link to="/investments">Add investments</Link>
        </p>
      </DashboardSectionCard>
    );
  }

  return (
    <DashboardSectionCard title="Investments" seeAllTo="/investments">
      <div className="dashboard-list-card__rows">
        {items.map((item) => {
          const initial = (item.displayName || '?').charAt(0).toUpperCase();

          return (
            <div
              key={item.id || item.displayName}
              className="dashboard-list-card__row dashboard-list-card__row--investment dashboard-list-card__row--static"
            >
              <div
                className="dashboard-list-card__row-icon dashboard-list-card__row-icon--letter"
                aria-hidden
              >
                {initial}
              </div>
              <div className="dashboard-list-card__row-main">
                <p className="dashboard-list-card__row-name">{item.displayName}</p>
              </div>
              <span className="dashboard-list-card__row-amount">
                {formatCurrency(item.totalCostBasis ?? item.totalInvested ?? 0)}
              </span>
            </div>
          );
        })}
      </div>
    </DashboardSectionCard>
  );
};

export default InvestmentsCard;
