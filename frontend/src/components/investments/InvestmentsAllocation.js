import React, { useMemo } from 'react';
import { useUserFormatters } from '../../hooks/useUserFormatters';

const InvestmentsAllocation = ({ holdings = [], loading = false }) => {
  const { formatCurrency } = useUserFormatters();

  const rows = useMemo(() => {
    const total = holdings.reduce(
      (sum, h) => sum + (Number(h.totalCostBasis ?? h.totalInvested) || 0),
      0
    );
    if (!total || holdings.length < 2) return [];

    return [...holdings]
      .map((h) => {
        const amount = Number(h.totalCostBasis ?? h.totalInvested) || 0;
        return {
          id: h.id,
          name: h.displayName,
          amount,
          pct: (amount / total) * 100
        };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [holdings]);

  if (loading || rows.length === 0) return null;

  return (
    <section className="investments-allocation glass-panel" aria-label="Portfolio allocation">
      <header className="investments-section__head">
        <h2 className="investments-section__title">Allocation</h2>
      </header>
      <ul className="investments-allocation__list">
        {rows.map((row) => (
          <li key={row.id} className="investments-allocation__item">
            <span className="investments-allocation__name">{row.name}</span>
            <span className="investments-allocation__bar-wrap" aria-hidden>
              <span
                className="investments-allocation__bar"
                style={{ width: `${Math.min(row.pct, 100)}%` }}
              />
            </span>
            <span className="investments-allocation__pct">{row.pct.toFixed(0)}%</span>
            <span className="investments-allocation__amount">{formatCurrency(row.amount)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default InvestmentsAllocation;
