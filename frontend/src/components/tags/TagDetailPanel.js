import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Receipt } from 'lucide-react';
import { formatTagCurrency, getMutedTagColor } from '../../utils/tagStatsUtils';
import { useAuth } from '../../contexts/AuthContext';
import { useUserFormatters } from '../../hooks/useUserFormatters';

const TagDetailPanel = ({
  tag,
  stats,
  recentTransactions = [],
  loading = false,
  loadingDetail = false,
  monthLabel,
  taggedSpendTotal = 0
}) => {
  const { user } = useAuth();
  const { formatCurrency, formatDateShort } = useUserFormatters();
  const [isReady, setIsReady] = useState(false);

  const isLoading = loading || loadingDetail;

  const sharePercent =
    tag && taggedSpendTotal > 0 && stats?.amount
      ? ((stats.amount / taggedSpendTotal) * 100).toFixed(1)
      : null;

  const barWidth =
    sharePercent != null ? Math.min(100, parseFloat(sharePercent)) : 0;

  useEffect(() => {
    if (!tag || isLoading) {
      setIsReady(false);
      return undefined;
    }

    let timeoutId;
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        timeoutId = window.setTimeout(() => setIsReady(true), 70);
      });
    });

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timeoutId);
    };
  }, [tag, isLoading, stats?.amount, stats?.count, sharePercent, recentTransactions]);

  if (!tag) {
    return (
      <div className="tag-detail glass-panel">
        <div className="tag-detail__empty">
          <p>Select a tag to see spending insights and recent transactions.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`tag-detail glass-panel ${isReady ? 'tag-detail--ready' : ''} ${
        isLoading ? 'tag-detail--loading-state' : ''
      }`}
    >
      <header className="tag-detail__header">
        <span
          className="tag-detail__pill"
          style={{
            color: tag.color || '#374151',
            backgroundColor: getMutedTagColor(tag.color),
            borderColor: tag.color ? `${tag.color}55` : 'rgba(255, 255, 255, 0.5)'
          }}
        >
          {tag.name}
        </span>
        <p className="tag-detail__period">{monthLabel} · expense tags</p>
      </header>

      {isLoading ? (
        <>
          <div className="tag-detail__stats tag-detail__stats--skeleton">
            {[0, 1, 2].map((i) => (
              <div key={i} className="tag-detail__stat tag-detail__stat--skeleton">
                <div className="tag-detail__skeleton tag-detail__skeleton--label" />
                <div className="tag-detail__skeleton tag-detail__skeleton--value" />
              </div>
            ))}
          </div>
          <div className="tag-detail__bar-wrap">
            <div className="tag-detail__skeleton tag-detail__skeleton--bar" />
          </div>
          <div className="tag-detail__skeleton-rows">
            {[0, 1, 2].map((i) => (
              <div key={i} className="tag-detail__skeleton-row">
                <div className="tag-detail__skeleton tag-detail__skeleton--icon" />
                <div className="tag-detail__skeleton tag-detail__skeleton--line" />
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="tag-detail__stats">
            <div className="tag-detail__stat" style={{ '--stat-i': 0 }}>
              <span className="tag-detail__stat-label">Total spend</span>
              <span className="tag-detail__stat-value">
                {formatTagCurrency(stats?.amount, user?.preferences)}
              </span>
            </div>
            <div className="tag-detail__stat" style={{ '--stat-i': 1 }}>
              <span className="tag-detail__stat-label">Transactions</span>
              <span className="tag-detail__stat-value">{stats?.count ?? 0}</span>
            </div>
            <div className="tag-detail__stat" style={{ '--stat-i': 2 }}>
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
                  '--bar-width': `${barWidth}%`,
                  backgroundColor: tag.color || 'var(--accent-text)'
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
                {recentTransactions.map((txn, index) => (
                  <li
                    key={txn._id}
                    className="tag-detail__txn"
                    style={{ '--txn-i': index }}
                  >
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
