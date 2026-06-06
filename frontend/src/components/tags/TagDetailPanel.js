import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Receipt } from 'lucide-react';
import { formatTagCurrency, getMutedTagColor } from '../../utils/tagStatsUtils';
import { useAuth } from '../../contexts/AuthContext';
import { useUserFormatters } from '../../hooks/useUserFormatters';

const TagDetailPanel = ({
  tag,
  stats,
  recentTransactions = [],
  loadingDetail,
  monthLabel,
  taggedSpendTotal = 0
}) => {
  const { user } = useAuth();
  const { formatCurrency, formatDateShort } = useUserFormatters();

  if (!tag) {
    return (
      <div className="tag-detail glass-panel">
        <div className="tag-detail__empty">
          <p>Select a tag to see spending insights and recent transactions.</p>
        </div>
      </div>
    );
  }

  const sharePercent =
    taggedSpendTotal > 0 && stats?.amount
      ? ((stats.amount / taggedSpendTotal) * 100).toFixed(1)
      : null;

  return (
    <div className="tag-detail glass-panel">
      <header className="tag-detail__header">
        <span
          className="tag-detail__pill"
          style={{
            color: tag.color || '#374151',
            backgroundColor: getMutedTagColor(tag.color),
            borderColor: tag.color ? `${tag.color}55` : 'rgba(255,255,255,0.5)'
          }}
        >
          {tag.name}
        </span>
        <p className="tag-detail__period">{monthLabel} · expense tags</p>
      </header>

      {loadingDetail ? (
        <div className="tag-detail__loading">Loading insights…</div>
      ) : (
        <>
          <div className="tag-detail__stats">
            <div className="tag-detail__stat">
              <span className="tag-detail__stat-label">Total spend</span>
              <span className="tag-detail__stat-value">
                {formatTagCurrency(stats?.amount, user?.preferences)}
              </span>
            </div>
            <div className="tag-detail__stat">
              <span className="tag-detail__stat-label">Transactions</span>
              <span className="tag-detail__stat-value">{stats?.count ?? 0}</span>
            </div>
            <div className="tag-detail__stat">
              <span className="tag-detail__stat-label">Share of tagged spend</span>
              <span className="tag-detail__stat-value">
                {sharePercent != null ? `${sharePercent}%` : '—'}
              </span>
            </div>
          </div>

          {sharePercent != null && (
            <div className="tag-detail__bar-wrap">
              <div
                className="tag-detail__bar"
                style={{
                  width: `${Math.min(100, parseFloat(sharePercent))}%`,
                  backgroundColor: tag.color || '#5b21b6'
                }}
              />
            </div>
          )}

          <div className="tag-detail__section">
            <div className="tag-detail__section-head">
              <h3 className="tag-detail__section-title">Recent transactions</h3>
              <Link
                to={`/transactions?tag=${tag._id}`}
                className="tag-detail__link"
              >
                View all
                <ArrowRight size={14} strokeWidth={2} aria-hidden />
              </Link>
            </div>

            {recentTransactions.length === 0 ? (
              <p className="tag-detail__list-empty">No transactions with this tag this month.</p>
            ) : (
              <ul className="tag-detail__txn-list">
                {recentTransactions.map((txn) => (
                  <li key={txn._id} className="tag-detail__txn">
                    <span className="tag-detail__txn-icon" aria-hidden>
                      <Receipt size={16} strokeWidth={1.75} />
                    </span>
                    <span className="tag-detail__txn-body">
                      <span className="tag-detail__txn-label">
                        {txn.notes?.trim() ||
                          txn.subCategoryId?.name ||
                          txn.categoryId?.name ||
                          'Transaction'}
                      </span>
                      <span className="tag-detail__txn-meta">
                        {formatDateShort(txn.date)}
                        {txn.categoryId?.name ? ` · ${txn.categoryId.name}` : ''}
                      </span>
                    </span>
                    <span className="tag-detail__txn-amount">
                      {formatCurrency(txn.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default TagDetailPanel;
