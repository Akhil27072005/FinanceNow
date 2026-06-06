import React from 'react';
import { formatSubscriptionCurrency } from '../../utils/subscriptionDisplayUtils';
import { useAuth } from '../../contexts/AuthContext';

const SubscriptionKpiStrip = ({ summary, loading }) => {
  const { user } = useAuth();
  if (loading) {
    return (
      <div className="subscriptions-kpi">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="glass-panel subscriptions-kpi__tile">
            <div style={{ height: 12, width: '60%', background: 'rgba(0,0,0,0.06)', borderRadius: 4 }} />
            <div style={{ height: 24, width: '40%', background: 'rgba(0,0,0,0.08)', borderRadius: 6, marginTop: 8 }} />
          </div>
        ))}
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="subscriptions-kpi">
      <div className="glass-panel subscriptions-kpi__tile">
        <p className="subscriptions-kpi__label">Active</p>
        <p className="subscriptions-kpi__value subscriptions-kpi__value--count">
          {summary.activeCount ?? 0}
        </p>
      </div>
      <div className="glass-panel subscriptions-kpi__tile">
        <p className="subscriptions-kpi__label">Paid this month</p>
        <p className="subscriptions-kpi__value subscriptions-kpi__value--paid">
          {formatSubscriptionCurrency(summary.paidThisMonth, user?.preferences)}
        </p>
        <p className="subscriptions-kpi__hint">Recorded billing cycles</p>
      </div>
      <div className="glass-panel subscriptions-kpi__tile">
        <p className="subscriptions-kpi__label">Scheduled this month</p>
        <p className="subscriptions-kpi__value subscriptions-kpi__value--scheduled">
          {formatSubscriptionCurrency(summary.scheduledThisMonth, user?.preferences)}
        </p>
        <p className="subscriptions-kpi__hint">Due dates in month</p>
      </div>
      <div className="glass-panel subscriptions-kpi__tile">
        <p className="subscriptions-kpi__label">Remaining</p>
        <p className="subscriptions-kpi__value subscriptions-kpi__value--count">
          {formatSubscriptionCurrency(summary.remainingThisMonth, user?.preferences)}
        </p>
        <p className="subscriptions-kpi__hint">Scheduled − paid</p>
      </div>
    </div>
  );
};

export default SubscriptionKpiStrip;
