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
 * Load all analytics payloads for the reports page.
 */
export function useReportsData(filters) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboard, setDashboard] = useState(defaultDashboard);
  const [incomeTrend, setIncomeTrend] = useState([]);
  const [expenseTrend, setExpenseTrend] = useState([]);
  const [categorySplit, setCategorySplit] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [monthlyComparison, setMonthlyComparison] = useState([]);

  const chartFilters = useMemo(() => buildReportsChartFilters(filters), [filters]);
  const cashFlowFilters = useMemo(() => buildCashFlowChartFilters(filters), [filters]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError('');

        const accountOpt = filters.account === 'self' ? { account: 'self' } : {};

        const [
          dashRes,
          incomeRes,
          expenseRes,
          categoryRes,
          pmRes,
          comparisonRes
        ] = await Promise.all([
          analyticsService.getDashboard({
            ...chartFilters,
            ...accountOpt,
            includeComparison: true
          }),
          analyticsService.getCharts('income', 'monthlyTrend', chartFilters),
          analyticsService.getCharts('expense', 'monthlyTrend', chartFilters),
          analyticsService.getCharts('expense', 'categorySplit', chartFilters),
          analyticsService.getCharts('expense', 'paymentMethodSplit', chartFilters),
          analyticsService.getCharts(null, 'monthlyComparison', cashFlowFilters)
        ]);

        if (cancelled) return;

        setDashboard({
          kpis: dashRes?.kpis || {},
          changes: dashRes?.changes || {},
          priorKpis: dashRes?.priorKpis || {},
          range: dashRes?.range
        });
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
        if (!cancelled) setLoading(false);
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
    loading,
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
