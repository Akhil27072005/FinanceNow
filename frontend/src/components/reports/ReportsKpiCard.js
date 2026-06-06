import React, { useMemo } from 'react';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip
} from 'recharts';
import { useUserFormatters } from '../../hooks/useUserFormatters';
import { REPORTS_INCOME_COLOR } from '../../constants/reportsChartColors';
import { useThemeChartColors } from '../../hooks/useThemeChartColors';

const formatSparkDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

const ReportsKpiCard = ({
  variant = 'income',
  amount = 0,
  changePercent = 0,
  trendData = [],
  loading = false
}) => {
  const { formatCurrency } = useUserFormatters();
  const { expenseColor } = useThemeChartColors();
  const isIncome = variant === 'income';
  const color = isIncome ? REPORTS_INCOME_COLOR : expenseColor;
  const gradientId = `reports-kpi-${variant}`;

  const sparkData = useMemo(
    () =>
      (trendData || []).map((row) => ({
        label: formatSparkDate(row.date),
        amount: row.amount || 0
      })),
    [trendData]
  );

  const positive = changePercent >= 0;
  const changeLabel = `${positive ? '+' : ''}${changePercent}% vs last period`;

  if (loading) {
    return (
      <div className="reports-kpi-card glass-panel reports-kpi-card--loading">
        <div className="reports-kpi-card__skeleton reports-kpi-card__skeleton--icon" />
        <div className="reports-kpi-card__skeleton reports-kpi-card__skeleton--amount" />
        <div className="reports-kpi-card__skeleton reports-kpi-card__skeleton--chart" />
      </div>
    );
  }

  return (
    <div className={`reports-kpi-card glass-panel reports-kpi-card--${variant}`}>
      <div className="reports-kpi-card__top">
        <span
          className={`reports-kpi-card__icon reports-kpi-card__icon--${variant}`}
          aria-hidden
        >
          {isIncome ? (
            <ArrowDownLeft size={20} strokeWidth={2.5} />
          ) : (
            <ArrowUpRight size={20} strokeWidth={2.5} />
          )}
        </span>
        <div>
          <p className="reports-kpi-card__label">
            {isIncome ? 'Total income' : 'Total expense'}
          </p>
          <p className="reports-kpi-card__amount">{formatCurrency(amount)}</p>
          <p
            className={`reports-kpi-card__change ${
              positive
                ? isIncome
                  ? 'reports-kpi-card__change--up'
                  : 'reports-kpi-card__change--warn'
                : 'reports-kpi-card__change--down'
            }`}
          >
            {changeLabel}
          </p>
        </div>
      </div>

      <div className="reports-kpi-card__spark">
        {sparkData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={color}
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="100%"
                    stopColor={color}
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>
              <Tooltip
                formatter={(v) => formatCurrency(v)}
                labelFormatter={(l) => l}
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: '1px solid var(--app-accent-ring)'
                }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke={color}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <p className="reports-kpi-card__spark-empty">No trend data</p>
        )}
      </div>
    </div>
  );
};

export default ReportsKpiCard;
