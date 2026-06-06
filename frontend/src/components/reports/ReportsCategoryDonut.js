import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useUserFormatters } from '../../hooks/useUserFormatters';
import { REPORTS_CHART_COLORS } from '../../constants/reportsChartColors';
import { buildTransactionsLinkSearch } from '../../utils/reportsFilterUtils';

const ReportsCategoryDonut = ({
  data = [],
  filters = {},
  loading = false
}) => {
  const { formatCurrency } = useUserFormatters();

  const { chartRows, total } = useMemo(() => {
    const rows = (data || []).map((item) => ({
      name: item.category || 'Uncategorized',
      value: item.amount || 0
    }));
    const sum = rows.reduce((s, r) => s + r.value, 0);
    return { chartRows: rows, total: sum };
  }, [data]);

  if (loading) {
    return (
      <div className="reports-donut glass-panel">
        <div className="reports-donut__skeleton-title" />
        <div className="reports-donut__skeleton-chart" />
      </div>
    );
  }

  return (
    <div className="reports-donut glass-panel">
      <div className="reports-donut__header">
        <h2 className="reports-donut__title">Expense by category</h2>
        <Link to={buildTransactionsLinkSearch({ ...filters, type: 'expense' })} className="reports-donut__link">
          View detail
        </Link>
      </div>

      {!chartRows.length ? (
        <p className="reports-donut__empty">No expense categories for this period.</p>
      ) : (
        <div className="reports-donut__body">
          <ul className="reports-donut__legend">
            {chartRows.slice(0, 6).map((row, i) => (
              <li key={row.name}>
                <span
                  className="reports-donut__dot"
                  style={{ background: REPORTS_CHART_COLORS[i % REPORTS_CHART_COLORS.length] }}
                  aria-hidden
                />
                <span className="reports-donut__legend-name">{row.name}</span>
              </li>
            ))}
          </ul>
          <div className="reports-donut__chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartRows}
                  cx="50%"
                  cy="50%"
                  innerRadius="58%"
                  outerRadius="82%"
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartRows.map((_, index) => (
                    <Cell
                      key={index}
                      fill={REPORTS_CHART_COLORS[index % REPORTS_CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="reports-donut__center" aria-hidden>
              <span className="reports-donut__center-label">Total spent</span>
              <span className="reports-donut__center-value">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsCategoryDonut;
