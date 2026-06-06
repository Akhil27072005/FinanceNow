import React, { useState, useEffect } from 'react';
import { categoryService } from '../services/categoryService';
import { subcategoryService } from '../services/subcategoryService';
import { exportService } from '../services/exportService';
import GlassAlert from '../components/ui/GlassAlert';
import ReportsFilters from '../components/reports/ReportsFilters';
import ReportsCashFlowChart from '../components/reports/ReportsCashFlowChart';
import ReportsKpiCard from '../components/reports/ReportsKpiCard';
import ReportsPaymentMethodList from '../components/reports/ReportsPaymentMethodList';
import ReportsFinancialTable from '../components/reports/ReportsFinancialTable';
import ReportsInsightsCard from '../components/reports/ReportsInsightsCard';
import ReportsCategoryDonut from '../components/reports/ReportsCategoryDonut';
import { useReportsData } from '../hooks/useReportsData';
import {
  formatCashFlowPeriodLabel,
  getDefaultReportsMonth
} from '../utils/reportsFilterUtils';
import '../styles/reports.css';

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
  const [exportError, setExportError] = useState('');

  const [dismissedError, setDismissedError] = useState(false);

  const {
    loading,
    error: loadError,
    dashboard,
    incomeTrend,
    expenseTrend,
    categorySplit,
    paymentMethods,
    monthlyComparison,
    topCategory
  } = useReportsData(filters);

  useEffect(() => {
    setDismissedError(false);
  }, [filters.month, filters.startDate, filters.endDate, filters.account]);

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [catRes, subRes] = await Promise.all([
          categoryService.getCategories(),
          subcategoryService.getSubCategories()
        ]);
        setCategories(catRes?.data || []);
        setSubcategories(subRes?.data || []);
      } catch {
        setCategories([]);
        setSubcategories([]);
      }
    };
    loadMeta();
  }, []);

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
  const cashFlowPeriodLabel = formatCashFlowPeriodLabel(filters);

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
        hasAdvancedFilters={hasAdvancedFilters}
        hasAnyFilters={hasAnyFilters}
        onClearAll={clearAllFilters}
        onExportTransactions={handleExportTransactions}
        onExportSubscriptions={handleExportSubscriptions}
      />

      <div className="reports-grid">
        <div className="reports-grid__left">
          <ReportsCashFlowChart
            data={monthlyComparison}
            netAmount={kpis.netSavings ?? 0}
            netChangePercent={changes.netSavings ?? 0}
            periodLabel={cashFlowPeriodLabel}
            filters={filters}
            loading={loading}
          />

          <div className="reports-grid__kpi-row">
            <ReportsKpiCard
              variant="income"
              amount={kpis.totalIncome ?? 0}
              changePercent={changes.totalIncome ?? 0}
              trendData={incomeTrend}
              loading={loading}
            />
            <ReportsKpiCard
              variant="expense"
              amount={kpis.totalExpenses ?? 0}
              changePercent={changes.totalExpenses ?? 0}
              trendData={expenseTrend}
              loading={loading}
            />
          </div>

          <ReportsPaymentMethodList
            data={paymentMethods}
            filters={filters}
            loading={loading}
          />
        </div>

        <div className="reports-grid__right">
          <ReportsFinancialTable kpis={kpis} changes={changes} loading={loading} />

          <ReportsInsightsCard kpis={kpis} topCategory={topCategory} loading={loading} />

          <ReportsCategoryDonut
            data={categorySplit}
            filters={filters}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default Reports;
