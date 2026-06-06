import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import PaymentMethodLogo from '../payment-methods/PaymentMethodLogo';
import DashboardSectionCard from './DashboardSectionCard';
import { useUserFormatters } from '../../hooks/useUserFormatters';

const formatBillingCycle = (cycle) => {
  if (!cycle) return 'Recurring';
  return cycle.charAt(0).toUpperCase() + cycle.slice(1);
};

const RecurringCard = ({ items = [], loading = false }) => {
  const { formatCurrency, formatDateShort } = useUserFormatters();

  if (loading) {
    return (
      <DashboardSectionCard title="Recurring" seeAllTo="/subscriptions">
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
      <DashboardSectionCard title="Recurring" seeAllTo="/subscriptions">
        <p className="dashboard-list-card__empty">No upcoming subscriptions</p>
      </DashboardSectionCard>
    );
  }

  return (
    <DashboardSectionCard title="Recurring" seeAllTo="/subscriptions">
      <div className="dashboard-list-card__rows">
        {items.map((item) => {
          const initial = (item.name || '?').charAt(0).toUpperCase();
          const hasLogo = Boolean(item.logoUrl);

          return (
            <Link
              key={item.id}
              to="/subscriptions"
              className="dashboard-list-card__row"
            >
              <div
                className={`dashboard-list-card__row-icon ${
                  hasLogo ? 'dashboard-list-card__row-icon--logo' : 'dashboard-list-card__row-icon--letter'
                }`}
                aria-hidden
              >
                {hasLogo ? (
                  <PaymentMethodLogo icon={item.logoUrl} size={22} />
                ) : (
                  initial
                )}
              </div>
              <div className="dashboard-list-card__row-main">
                <p className="dashboard-list-card__row-name">{item.name}</p>
              </div>
              {item.isOverdue ? (
                <span className="dashboard-list-card__row-pill dashboard-list-card__row-pill--overdue">
                  Overdue
                </span>
              ) : (
                <span className="dashboard-list-card__row-pill">
                  {formatBillingCycle(item.billingCycle)}
                </span>
              )}
              <span className="dashboard-list-card__row-amount">
                {formatCurrency(item.amount)}
              </span>
              <span className="dashboard-list-card__row-date">
                {formatDateShort(item.nextPaymentDate)}
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

export default RecurringCard;
