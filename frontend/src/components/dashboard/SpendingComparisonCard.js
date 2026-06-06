import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { useUserFormatters } from '../../hooks/useUserFormatters';

const FOCUS_COLOR = '#F97316';
const BENCHMARK_COLOR = '#9CA3AF';

const formatAxisAmount = (value) => {
  if (value >= 1000) return `${Math.round(value / 1000)}k`;
  return String(value);
};

const SpendingTooltip = ({ active, payload, focusLabel, benchmarkLabel, formatCurrency }) => {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;

  return (
    <div className="spending-chart-card__tooltip">
      {row.focusAmount > 0 && (
        <p>
          <strong>{focusLabel}</strong> ({row.focusDate}): {formatCurrency(row.focusAmount)}
        </p>
      )}
      {row.benchmarkAmount > 0 && (
        <p>
          <strong>{benchmarkLabel}</strong> ({row.benchmarkDate}):{' '}
          {formatCurrency(row.benchmarkAmount)}
        </p>
      )}
    </div>
  );
};

/**
 * Fundwise-style spending line chart with focus vs benchmark month.
 */
const SpendingComparisonCard = ({
  title,
  comparisonLabel,
  focusLabel,
  benchmarkLabel,
  totalExpenses = 0,
  chartData = [],
  loading = false,
  hasData = true
}) => {
  const { formatCurrency } = useUserFormatters();

  const yMax = useMemo(() => {
    const max = Math.max(
      ...chartData.map((d) => Math.max(d.focusAmount, d.benchmarkAmount)),
      0
    );
    if (max === 0) return 100;
    const step = Math.pow(10, Math.floor(Math.log10(max)));
    return Math.ceil((max * 1.15) / step) * step;
  }, [chartData]);

  if (loading) {
    return (
      <div className="spending-chart-card glass-panel">
        <div className="spending-chart-card__skeleton spending-chart-card__skeleton--title" />
        <div className="spending-chart-card__skeleton spending-chart-card__skeleton--total" />
        <div className="spending-chart-card__skeleton spending-chart-card__skeleton--chart" />
      </div>
    );
  }

  return (
    <div className="spending-chart-card glass-panel">
      <div className="spending-chart-card__header">
        <div>
          <p className="spending-chart-card__title">{title}</p>
          <p className="spending-chart-card__total">{formatCurrency(totalExpenses)}</p>
        </div>
        <span className="spending-chart-card__info-pill" title={comparisonLabel}>
          {comparisonLabel}
        </span>
      </div>

      <div className="spending-chart-card__legend">
        <span className="spending-chart-card__legend-item">
          <span
            className="spending-chart-card__legend-dot spending-chart-card__legend-dot--focus"
            aria-hidden
          />
          {focusLabel}
        </span>
        <span className="spending-chart-card__legend-item">
          <span
            className="spending-chart-card__legend-dot spending-chart-card__legend-dot--benchmark"
            aria-hidden
          />
          {benchmarkLabel}
        </span>
      </div>

      {!hasData ? (
        <p className="spending-chart-card__empty">No spending data for this period.</p>
      ) : (
        <div className="spending-chart-card__chart-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 12, right: 8, left: 0, bottom: 4 }}>
              <defs>
                <linearGradient id="focusAreaFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={FOCUS_COLOR} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={FOCUS_COLOR} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={24}
              />
              <YAxis
                tickFormatter={formatAxisAmount}
                domain={[0, yMax]}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip
                content={
                  <SpendingTooltip
                    focusLabel={focusLabel}
                    benchmarkLabel={benchmarkLabel}
                    formatCurrency={formatCurrency}
                  />
                }
              />
              <Area
                type="linear"
                dataKey="focusAmount"
                stroke={FOCUS_COLOR}
                strokeWidth={2.5}
                fill="url(#focusAreaFill)"
                dot={{ r: 3, fill: FOCUS_COLOR, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: FOCUS_COLOR }}
              />
              <Line
                type="linear"
                dataKey="benchmarkAmount"
                stroke={BENCHMARK_COLOR}
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={false}
                activeDot={{ r: 4, fill: BENCHMARK_COLOR }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default SpendingComparisonCard;
