import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, TrendingUp } from 'lucide-react';
import Modal from '../ui/Modal';
import { portfolioService } from '../../services/portfolioService';
import { useUserFormatters } from '../../hooks/useUserFormatters';
import {
  activityTypeLabel,
  enrichActivitiesWithRunningTotal,
  summarizeHoldingActivities
} from '../../utils/investmentActivityUtils';

const InvestmentsHoldingHistoryModal = ({
  holding,
  isOpen,
  onClose,
  refreshKey = 0
}) => {
  const { formatCurrency, formatDate, formatDateShort } = useUserFormatters();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || !holding?.id) {
      setActivities([]);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError('');
        const res = await portfolioService.getHoldingActivities(holding.id);
        if (!cancelled) setActivities(res?.data || []);
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.error || 'Failed to load history');
          setActivities([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, holding?.id, refreshKey]);

  const enriched = useMemo(
    () => enrichActivitiesWithRunningTotal(activities),
    [activities]
  );

  const displayRows = useMemo(
    () =>
      [...enriched].sort(
        (a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime() ||
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [enriched]
  );

  const stats = useMemo(
    () =>
      summarizeHoldingActivities(
        activities,
        holding?.totalCostBasis ?? holding?.totalInvested ?? 0
      ),
    [activities, holding]
  );

  if (!holding) return null;

  const initial = (holding.displayName || '?').charAt(0).toUpperCase();
  const symbol = holding.assetKey || holding.finnhubSymbol;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Investment history"
      size="lg"
    >
      <div className="investments-history-modal">
        <div className="investments-history-modal__hero">
          <div
            className="investments-history-modal__avatar"
            aria-hidden
          >
            {initial}
          </div>
          <div className="investments-history-modal__hero-text">
            <h4 className="investments-history-modal__name">{holding.displayName}</h4>
            {symbol && symbol !== holding.displayName ? (
              <p className="investments-history-modal__symbol">{symbol}</p>
            ) : null}
            <p className="investments-history-modal__total">
              Total invested{' '}
              <strong>
                {formatCurrency(holding.totalCostBasis ?? holding.totalInvested ?? 0)}
              </strong>
            </p>
          </div>
        </div>

        <div className="investments-history-modal__stats">
          <div className="investments-history-modal__stat">
            <span className="investments-history-modal__stat-label">Amounts added</span>
            <span className="investments-history-modal__stat-value">
              {stats.contributionCount}
            </span>
            <span className="investments-history-modal__stat-meta">
              {formatCurrency(stats.contributionTotal)} via adds
            </span>
          </div>
          <div className="investments-history-modal__stat">
            <span className="investments-history-modal__stat-label">Total resets</span>
            <span className="investments-history-modal__stat-value">{stats.setCount}</span>
            <span className="investments-history-modal__stat-meta">
              Manual total corrections
            </span>
          </div>
          <div className="investments-history-modal__stat">
            <span className="investments-history-modal__stat-label">Last activity</span>
            <span className="investments-history-modal__stat-value">
              {stats.latestDate ? formatDateShort(stats.latestDate) : '—'}
            </span>
            <span className="investments-history-modal__stat-meta">
              {stats.latestType ? activityTypeLabel(stats.latestType) : 'No activity yet'}
            </span>
          </div>
        </div>

        {error ? (
          <p className="investments-history-modal__error" role="alert">
            {error}
          </p>
        ) : null}

        {loading ? (
          <p className="investments-history-modal__loading">Loading activity…</p>
        ) : displayRows.length === 0 ? (
          <p className="investments-history-modal__empty">
            No activity recorded yet. Use <strong>Add amount</strong> on the Investments
            page to log contributions.
          </p>
        ) : (
          <div className="investments-history-modal__table-wrap">
            <table className="investments-history-modal__table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Total after</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {displayRows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <span className="investments-history-modal__date-primary">
                        {formatDate(row.date)}
                      </span>
                      <span className="investments-history-modal__date-sub">
                        Recorded {formatDateShort(row.createdAt)}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`investments-history-modal__badge investments-history-modal__badge--${row.type}`}
                      >
                        {activityTypeLabel(row.type)}
                      </span>
                    </td>
                    <td className="investments-history-modal__amount">
                      {row.type === 'add_contribution' ? '+' : ''}
                      {formatCurrency(row.amount ?? 0)}
                    </td>
                    <td className="investments-history-modal__running">
                      {formatCurrency(row.runningTotal ?? 0)}
                    </td>
                    <td className="investments-history-modal__details">
                      {row.type === 'add_contribution' ? (
                        <>
                          <span>Investment transaction (self account)</span>
                          {row.transactionId ? (
                            <Link
                              to="/transactions?type=investment"
                              className="investments-history-modal__txn-link"
                            >
                              View in Transactions
                              <ExternalLink size={14} aria-hidden />
                            </Link>
                          ) : null}
                        </>
                      ) : (
                        <span>Replaced invested total — no transaction created</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="investments-history-modal__footer">
          <TrendingUp size={16} aria-hidden />
          <p>
            Running totals are reconstructed from your activity log in chronological order.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default InvestmentsHoldingHistoryModal;
