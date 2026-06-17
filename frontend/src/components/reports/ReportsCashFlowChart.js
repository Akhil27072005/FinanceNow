import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { useUserFormatters } from '../../hooks/useUserFormatters';
import { REPORTS_INCOME_COLOR } from '../../constants/reportsChartColors';
import { useThemeChartColors } from '../../hooks/useThemeChartColors';
import { buildTransactionsLinkSearch } from '../../utils/reportsFilterUtils';

const formatAxis = (v) => {
  if (v >= 1000) return `${Math.round(v / 1000)}k`;
  return String(v);
};

const ReportsCashFlowChart = ({
  data = [],
  netAmount = 0,
  netChangePercent = 0,
  periodLabel = '',
  filters = {},
  loading = false,
  chartLoading = false
}) => {
  const { formatCurrency } = useUserFormatters();
  const { expenseColor } = useThemeChartColors();

  const chartData = useMemo(
    () =>
      (data || []).map((row) => ({
        label: row.monthLabel || row.month,
        income: row.income || 0,
        expense: row.expense || 0
      })),
    [data]
  );

  const yMax = useMemo(() => {
    const max = Math.max(
      ...chartData.flatMap((d) => [d.income, d.expense]),
      0
    );
    if (max === 0) return 100;
    const step = Math.pow(10, Math.floor(Math.log10(max)));
    return Math.ceil((max * 1.15) / step) * step;
  }, [chartData]);

  if (loading) {
    return (
      <div className="reports-cashflow glass-panel">
        <div className="reports-cashflow__skeleton-title" />
        <div className="reports-cashflow__skeleton-chart" />
      </div>
    );
  }

  const netPositive = netChangePercent >= 0;

  return (
    <div className="reports-cashflow glass-panel">
      <div className="reports-cashflow__header">
        <div>
          <h2 className="reports-cashflow__title">Cash flow overview</h2>
          {periodLabel ? <p className="reports-cashflow__period">{periodLabel}</p> : null}
        </div>
        <Link
          to={buildTransactionsLinkSearch(filters)}
          className="reports-cashflow__link"
        >
          View transactions
        </Link>
      </div>

      <div className="reports-cashflow__summary">
        <div>
          <p className="reports-cashflow__summary-label">Net savings for period</p>
          <p className="reports-cashflow__summary-value">{formatCurrency(netAmount)}</p>
        </div>
        <span
          className={`reports-cashflow__summary-pill ${
            netPositive ? 'reports-cashflow__summary-pill--up' : 'reports-cashflow__summary-pill--down'
          }`}
        >
          {netPositive ? '+' : ''}
          {netChangePercent}% vs last period
        </span>
      </div>

      {!chartData.length ? (
        chartLoading ? (
          <div className="reports-cashflow__skeleton-chart" />
        ) : (
          <p className="reports-cashflow__empty">No cash flow data yet.</p>
        )
      ) : (
        <div className="reports-cashflow__chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 4 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--app-accent-ring)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={formatAxis}
                domain={[0, yMax]}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                width={36}
              />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="income" name="Income" fill={REPORTS_INCOME_COLOR} radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Expense" fill={expenseColor} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default ReportsCashFlowChart;
