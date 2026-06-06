import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { portfolioService } from '../../services/portfolioService';
import { useUserFormatters } from '../../hooks/useUserFormatters';
import { activityTypeLabel } from '../../utils/investmentActivityUtils';

const InvestmentsRecentActivity = ({ refreshKey = 0, onViewHoldingHistory }) => {
  const { formatCurrency, formatDateShort } = useUserFormatters();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const res = await portfolioService.getRecentActivities(8);
        if (!cancelled) setItems(res?.data || []);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return (
    <section className="investments-section glass-panel" aria-label="Recent investment activity">
      <header className="investments-section__head">
        <h2 className="investments-section__title">Recent activity</h2>
        <Link to="/transactions?type=investment" className="investments-section__link">
          View transactions
        </Link>
      </header>

      {loading ? (
        <p className="investments-section__empty">Loading…</p>
      ) : items.length === 0 ? (
        <p className="investments-section__empty">
          Activity appears when you add amounts or update totals.
        </p>
      ) : (
        <ul className="investments-activity-list">
          {items.map((item) => (
            <li key={item.id} className="investments-activity-row">
              <button
                type="button"
                className="investments-activity-row__name"
                onClick={() =>
                  onViewHoldingHistory?.({
                    id: item.holdingId,
                    displayName: item.holdingName,
                    assetKey: item.holdingSymbol,
                    totalCostBasis: null
                  })
                }
              >
                {item.holdingName}
              </button>
              <span className="investments-activity-row__type">
                {activityTypeLabel(item.type)}
              </span>
              <span className="investments-activity-row__date">
                {formatDateShort(item.date)}
              </span>
              <span className="investments-activity-row__amount">
                {item.type === 'add_contribution' ? '+' : ''}
                {formatCurrency(item.amount ?? 0)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default InvestmentsRecentActivity;
