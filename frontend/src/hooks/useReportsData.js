import { useState, useEffect, useMemo } from 'react';
import { analyticsService } from '../services/analyticsService';
import {
  buildReportsChartFilters,
  buildCashFlowChartFilters
} from '../utils/reportsFilterUtils';

const defaultDashboard = {
  kpis: {},
  changes: {},
  priorKpis: {}
};

/**
 * Load analytics for the reports page with staged fetching:
 * dashboard KPIs first, then chart datasets in parallel.
 */
export function useReportsData(filters) {
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboard, setDashboard] = useState(defaultDashboard);
  const [incomeTrend, setIncomeTrend] = useState([]);
  const [expenseTrend, setExpenseTrend] = useState([]);
  const [categorySplit, setCategorySplit] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [monthlyComparison, setMonthlyComparison] = useState([]);

  const chartFilters = useMemo(
    () => buildReportsChartFilters(filters),
    [filters.month, filters.startDate, filters.endDate, filters.account]
  );
  const cashFlowFilters = useMemo(
    () => buildCashFlowChartFilters(filters),
    [filters.month, filters.startDate, filters.endDate, filters.account]
  );

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setError('');
        setDashboardLoading(true);
        setChartsLoading(true);

        const accountOpt = filters.account === 'self' ? { account: 'self' } : {};

        const dashRes = await analyticsService.getDashboard({
          ...chartFilters,
          ...accountOpt,
          includeComparison: true
        });

        if (cancelled) return;

        setDashboard({
          kpis: dashRes?.kpis || {},
          changes: dashRes?.changes || {},
          priorKpis: dashRes?.priorKpis || {},
          range: dashRes?.range
        });
        setDashboardLoading(false);

        const [incomeRes, expenseRes, categoryRes, pmRes, comparisonRes] = await Promise.all([
          analyticsService.getCharts('income', 'monthlyTrend', chartFilters),
          analyticsService.getCharts('expense', 'monthlyTrend', chartFilters),
          analyticsService.getCharts('expense', 'categorySplit', chartFilters),
          analyticsService.getCharts('expense', 'paymentMethodSplit', chartFilters),
          analyticsService.getCharts(null, 'monthlyComparison', cashFlowFilters)
        ]);

        if (cancelled) return;

        setIncomeTrend(incomeRes?.data || []);
        setExpenseTrend(expenseRes?.data || []);
        setCategorySplit(categoryRes?.data || []);
        setPaymentMethods(pmRes?.data || []);
        setMonthlyComparison(comparisonRes?.data || []);
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.error || 'Failed to load reports');
        }
      } finally {
        if (!cancelled) {
          setDashboardLoading(false);
          setChartsLoading(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [chartFilters, cashFlowFilters, filters.account]);

  const topCategory = useMemo(() => {
    if (!categorySplit.length) return null;
    const total = categorySplit.reduce((s, r) => s + (r.amount || 0), 0);
    const top = categorySplit[0];
    const pct = total > 0 ? Math.round((top.amount / total) * 100) : 0;
    return { name: top.category, percent: pct };
  }, [categorySplit]);

  return {
    dashboardLoading,
    chartsLoading,
    loading: dashboardLoading || chartsLoading,
    error,
    dashboard,
    incomeTrend,
    expenseTrend,
    categorySplit,
    paymentMethods,
    monthlyComparison,
    topCategory,
    chartFilters,
    cashFlowFilters
  };
}
