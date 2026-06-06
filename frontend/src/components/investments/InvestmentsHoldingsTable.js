import React from 'react';
import { useUserFormatters } from '../../hooks/useUserFormatters';

const InvestmentsHoldingsTable = ({
  holdings = [],
  loading = false,
  selectedId,
  onSelect,
  onDelete,
  onViewHistory
}) => {
  const { formatCurrency } = useUserFormatters();

  if (loading) {
    return (
      <section className="investments-section glass-panel">
        <p className="investments-section__loading">Loading holdings…</p>
      </section>
    );
  }

  if (!holdings.length) {
    return (
      <section className="investments-section glass-panel">
        <header className="investments-section__head">
          <h2 className="investments-section__title">Holdings</h2>
        </header>
        <p className="investments-section__empty">
          No holdings yet. Add one in the panel on the right.
        </p>
      </section>
    );
  }

  return (
    <section className="investments-section glass-panel">
      <header className="investments-section__head">
        <h2 className="investments-section__title">
          Holdings
          <span className="investments-section__count">{holdings.length}</span>
        </h2>
      </header>

      <div className="investments-holdings-list">
        {holdings.map((row) => {
          const isSelected = String(selectedId) === String(row.id);
          const initial = (row.displayName || '?').charAt(0).toUpperCase();
          const symbol = row.assetKey || row.finnhubSymbol;

          return (
            <div
              key={row.id}
              className={`investments-holding-row ${isSelected ? 'investments-holding-row--selected' : ''}`}
              onClick={() => onSelect?.(row.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect?.(row.id);
                }
              }}
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
            >
              <div className="investments-holding-row__brand">
                <div className="investments-holding-row__logo" aria-hidden>
                  <span className="investments-holding-row__logo-letter">{initial}</span>
                </div>
                <div className="investments-holding-row__name-wrap">
                  <p className="investments-holding-row__name">{row.displayName}</p>
                  <p className="investments-holding-row__symbol">
                    {symbol && symbol !== row.displayName ? symbol : '\u00a0'}
                  </p>
                </div>
              </div>

              <span className="investments-holding-row__amount">
                {formatCurrency(row.totalCostBasis ?? row.totalInvested ?? 0)}
              </span>

              <div className="investments-holding-row__actions">
                <button
                  type="button"
                  className="investments-holding-row__history"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewHistory?.(row);
                  }}
                >
                  History
                </button>
                <button
                  type="button"
                  className="investments-holding-row__remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(row.id);
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default InvestmentsHoldingsTable;
