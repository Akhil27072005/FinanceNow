import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import PaymentMethodLogo from '../payment-methods/PaymentMethodLogo';
import { useUserFormatters } from '../../hooks/useUserFormatters';
import { buildTransactionsLinkSearch } from '../../utils/reportsFilterUtils';

const ReportsPaymentMethodList = ({ data = [], filters = {}, loading = false }) => {
  const { formatCurrency } = useUserFormatters();

  const rows = useMemo(() => {
    const total = (data || []).reduce((s, r) => s + (r.amount || 0), 0);
    return (data || []).map((item) => ({
      ...item,
      percent: total > 0 ? Math.round((item.amount / total) * 100) : 0
    }));
  }, [data]);

  if (loading) {
    return (
      <div className="reports-pm-list glass-panel">
        <div className="reports-pm-list__skeleton-title" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="reports-pm-list__skeleton-row" />
        ))}
      </div>
    );
  }

  return (
    <div className="reports-pm-list glass-panel">
      <div className="reports-pm-list__header">
        <h2 className="reports-pm-list__title">Spending by payment method</h2>
        <div className="reports-pm-list__actions">
          <Link to="/payment-methods" className="reports-pm-list__link">
            Manage
          </Link>
          <Link
            to={buildTransactionsLinkSearch({ ...filters, type: 'expense' })}
            className="reports-pm-list__link"
          >
            View transactions
          </Link>
        </div>
      </div>

      {!rows.length ? (
        <p className="reports-pm-list__empty">No payment method spending in this period.</p>
      ) : (
        <ul className="reports-pm-list__rows">
          {rows.map((row) => (
            <li key={row.paymentMethodId || row.paymentMethod} className="reports-pm-list__row">
              <span className="reports-pm-list__logo">
                <PaymentMethodLogo icon={row.icon} size={22} />
              </span>
              <div className="reports-pm-list__meta">
                <span className="reports-pm-list__name">{row.paymentMethod}</span>
                <div className="reports-pm-list__bar-track">
                  <span
                    className="reports-pm-list__bar-fill"
                    style={{ width: `${Math.min(row.percent, 100)}%` }}
                  />
                </div>
              </div>
              <div className="reports-pm-list__amounts">
                <span className="reports-pm-list__amount">{formatCurrency(row.amount)}</span>
                <span className="reports-pm-list__pct">{row.percent}%</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ReportsPaymentMethodList;
