import React from 'react';
import { useUserFormatters } from '../../hooks/useUserFormatters';

const InvestmentsKpiStrip = ({
  totalInvested = 0,
  holdingCount = 0,
  topHolding = null,
  loading = false
}) => {
  const { formatCurrency } = useUserFormatters();

  if (loading) {
    return (
      <div className="investments-kpi">
        {[0, 1, 2].map((i) => (
          <div key={i} className="investments-kpi__tile glass-panel">
            <div style={{ height: 48, opacity: 0.3 }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="investments-kpi">
      <div className="investments-kpi__tile glass-panel">
        <p className="investments-kpi__label">Total invested</p>
        <p className="investments-kpi__value investments-kpi__value--primary">
          {formatCurrency(totalInvested)}
        </p>
      </div>
      <div className="investments-kpi__tile glass-panel">
        <p className="investments-kpi__label">Holdings</p>
        <p className="investments-kpi__value">{holdingCount}</p>
      </div>
      <div className="investments-kpi__tile glass-panel">
        <p className="investments-kpi__label">Largest position</p>
        {topHolding ? (
          <>
            <p className="investments-kpi__value investments-kpi__value--name">
              {topHolding.displayName}
            </p>
            <p className="investments-kpi__hint">
              {formatCurrency(topHolding.totalCostBasis ?? topHolding.totalInvested ?? 0)}
            </p>
          </>
        ) : (
          <p className="investments-kpi__value">—</p>
        )}
      </div>
    </div>
  );
};

export default InvestmentsKpiStrip;
