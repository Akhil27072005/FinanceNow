import React, { useState, useEffect, useCallback, useRef, Suspense, lazy } from 'react';
import { categoryService } from '../services/categoryService';
import { subcategoryService } from '../services/subcategoryService';
import { exportService } from '../services/exportService';
import GlassAlert from '../components/ui/GlassAlert';
import ReportsFilters from '../components/reports/ReportsFilters';
import ReportsFinancialTable from '../components/reports/ReportsFinancialTable';
import ReportsInsightsCard from '../components/reports/ReportsInsightsCard';
import { useReportsData } from '../hooks/useReportsData';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import {
  formatCashFlowPeriodLabel,
  getDefaultReportsMonth
} from '../utils/reportsFilterUtils';
import '../styles/reports.css';

const ReportsCashFlowChart = lazy(() => import('../components/reports/ReportsCashFlowChart'));
const ReportsKpiCard = lazy(() => import('../components/reports/ReportsKpiCard'));
const ReportsPaymentMethodList = lazy(() => import('../components/reports/ReportsPaymentMethodList'));
const ReportsCategoryDonut = lazy(() => import('../components/reports/ReportsCategoryDonut'));

const ChartFallback = () => (
  <div className="glass-panel reports-cashflow">
    <div className="reports-cashflow__skeleton-title" />
    <div className="reports-cashflow__skeleton-chart" />
  </div>
);

const Reports = () => {
  const [filters, setFilters] = useState({
    month: getDefaultReportsMonth(),
    startDate: '',
    endDate: '',
    account: 'all',
    type: '',
    categoryId: '',
    subCategoryId: ''
  });
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [subcategoriesLoading, setSubcategoriesLoading] = useState(false);
  const [exportError, setExportError] = useState('');
  const [dismissedError, setDismissedError] = useState(false);

  const categoriesLoadedRef = useRef(false);
  const debouncedFilters = useDebouncedValue(filters, 300);

  const {
    dashboardLoading,
    chartsLoading,
    error: loadError,
    dashboard,
    incomeTrend,
    expenseTrend,
    categorySplit,
    paymentMethods,
    monthlyComparison,
    topCategory
  } = useReportsData(debouncedFilters);

  const loadCategories = useCallback(async () => {
    if (categoriesLoadedRef.current) return;
    try {
      setCategoriesLoading(true);
      const catRes = await categoryService.getCategories();
      setCategories(catRes?.data || []);
      categoriesLoadedRef.current = true;
    } catch {
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    if (!filters.categoryId) {
      setSubcategories([]);
      setSubcategoriesLoading(false);
      return undefined;
    }

    let cancelled = false;

    const loadSubcategories = async () => {
      try {
        setSubcategoriesLoading(true);
        const subRes = await subcategoryService.getSubCategories(filters.categoryId);
        if (!cancelled) {
          setSubcategories(subRes?.data || []);
        }
      } catch {
        if (!cancelled) setSubcategories([]);
      } finally {
        if (!cancelled) setSubcategoriesLoading(false);
      }
    };

    loadSubcategories();
    return () => {
      cancelled = true;
    };
  }, [filters.categoryId]);

  useEffect(() => {
    setDismissedError(false);
  }, [
    debouncedFilters.month,
    debouncedFilters.startDate,
    debouncedFilters.endDate,
    debouncedFilters.account
  ]);

  const hasAdvancedFilters = Boolean(
    filters.startDate ||
      filters.endDate ||
      filters.type ||
      filters.categoryId ||
      filters.subCategoryId ||
      (filters.month && filters.month !== getDefaultReportsMonth())
  );

  const hasAnyFilters = hasAdvancedFilters || filters.account === 'self';

  const clearAllFilters = () => {
    setFilters({
      month: getDefaultReportsMonth(),
      startDate: '',
      endDate: '',
      account: 'all',
      type: '',
      categoryId: '',
      subCategoryId: ''
    });
    setSubcategories([]);
    setFiltersExpanded(false);
  };

  const handleExportTransactions = async () => {
    try {
      setExportError('');
      const exportFilters = {};
      if (filters.type) exportFilters.type = filters.type;
      if (filters.startDate) exportFilters.startDate = filters.startDate;
      if (filters.endDate) exportFilters.endDate = filters.endDate;
      if (filters.month && !filters.startDate) {
        const [y, m] = filters.month.split('-').map(Number);
        const start = new Date(y, m - 1, 1);
        const end = new Date(y, m, 0);
        exportFilters.startDate = start.toISOString().slice(0, 10);
        exportFilters.endDate = end.toISOString().slice(0, 10);
      }
      if (filters.account === 'self') exportFilters.account = 'self';
      await exportService.exportTransactions(exportFilters);
    } catch {
      setExportError('Failed to export transactions');
    }
  };

  const handleExportSubscriptions = async () => {
    try {
      setExportError('');
      await exportService.exportSubscriptions();
    } catch {
      setExportError('Failed to export subscriptions');
    }
  };

  const { kpis, changes } = dashboard;
  const cashFlowPeriodLabel = formatCashFlowPeriodLabel(debouncedFilters);

  return (
    <div className="reports-page">
      {loadError && !dismissedError ? (
        <GlassAlert variant="danger" onClose={() => setDismissedError(true)} className="mb-3">
          {loadError}
        </GlassAlert>
      ) : null}
      {exportError ? (
        <GlassAlert variant="danger" onClose={() => setExportError('')} className="mb-3">
          {exportError}
        </GlassAlert>
      ) : null}

      <ReportsFilters
        filters={filters}
        setFilters={setFilters}
        filtersExpanded={filtersExpanded}
        setFiltersExpanded={setFiltersExpanded}
        categories={categories}
        subcategories={subcategories}
        categoriesLoading={categoriesLoading}
        subcategoriesLoading={subcategoriesLoading}
        hasAdvancedFilters={hasAdvancedFilters}
        hasAnyFilters={hasAnyFilters}
        onClearAll={clearAllFilters}
        onExportTransactions={handleExportTransactions}
        onExportSubscriptions={handleExportSubscriptions}
      />

      <div className="reports-grid">
        <div className="reports-grid__left">
          <Suspense fallback={<ChartFallback />}>
            <ReportsCashFlowChart
              data={monthlyComparison}
              netAmount={kpis.netSavings ?? 0}
              netChangePercent={changes.netSavings ?? 0}
              periodLabel={cashFlowPeriodLabel}
              filters={debouncedFilters}
              loading={dashboardLoading}
              chartLoading={chartsLoading}
            />
          </Suspense>

          <div className="reports-grid__kpi-row">
            <Suspense fallback={<ChartFallback />}>
              <ReportsKpiCard
                variant="income"
                amount={kpis.totalIncome ?? 0}
                changePercent={changes.totalIncome ?? 0}
                trendData={incomeTrend}
                loading={dashboardLoading}
                sparkLoading={chartsLoading}
              />
              <ReportsKpiCard
                variant="expense"
                amount={kpis.totalExpenses ?? 0}
                changePercent={changes.totalExpenses ?? 0}
                trendData={expenseTrend}
                loading={dashboardLoading}
                sparkLoading={chartsLoading}
              />
            </Suspense>
          </div>

          <Suspense fallback={<ChartFallback />}>
            <ReportsPaymentMethodList
              data={paymentMethods}
              filters={debouncedFilters}
              loading={chartsLoading}
            />
          </Suspense>
        </div>

        <div className="reports-grid__right">
          <ReportsFinancialTable kpis={kpis} changes={changes} loading={dashboardLoading} />

          <ReportsInsightsCard
            kpis={kpis}
            topCategory={topCategory}
            loading={dashboardLoading}
          />

          <Suspense fallback={<ChartFallback />}>
            <ReportsCategoryDonut
              data={categorySplit}
              filters={debouncedFilters}
              loading={chartsLoading}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default Reports;
