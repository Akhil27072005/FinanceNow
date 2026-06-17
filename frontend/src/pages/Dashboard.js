import React, { useState, useEffect, useMemo } from 'react';
import { Alert } from 'react-bootstrap';
import { analyticsService } from '../services/analyticsService';
import { transactionService } from '../services/transactionService';
import { subscriptionService } from '../services/subscriptionService';
import {
  resolveSpendingComparison,
  mergeDailyTrends,
  chartHasSpendingData
} from '../utils/spendingChartUtils';
import { getMonthDateRange } from '../utils/dateUtils';
import { portfolioService } from '../services/portfolioService';
import DatePicker from '../components/ui/DatePicker';
import TotalExpensesSplitCard from '../components/dashboard/TotalExpensesSplitCard';
import SpendingComparisonCard from '../components/dashboard/SpendingComparisonCard';
import RecentTransactionsCard from '../components/dashboard/RecentTransactionsCard';
import RecurringCard from '../components/dashboard/RecurringCard';
import InvestmentsCard from '../components/dashboard/InvestmentsCard';
import '../styles/dashboard.css';

const toDateOnly = (value) => {
  const d = new Date(value);
  d.setHours(0, 0, 0, 0);
  return d;
};

const buildRecurringItems = (subscriptions = []) => {
  const today = toDateOnly(new Date());

  const mapped = subscriptions.map((sub) => {
    const due = toDateOnly(sub.nextPaymentDate);
    return {
      id: sub._id?.toString?.() ?? sub._id ?? sub.id,
      name: sub.name,
      amount: sub.amount,
      billingCycle: sub.billingCycle,
      nextPaymentDate: sub.nextPaymentDate,
      logoUrl: sub.metadata?.logoUrl || null,
      isOverdue: due < today
    };
  });

  const overdue = mapped
    .filter((item) => item.isOverdue)
    .sort((a, b) => toDateOnly(a.nextPaymentDate) - toDateOnly(b.nextPaymentDate));
  const upcoming = mapped
    .filter((item) => !item.isOverdue)
    .sort((a, b) => toDateOnly(a.nextPaymentDate) - toDateOnly(b.nextPaymentDate));

  return [...overdue, ...upcoming].slice(0, 3);
};

/**
 * Dashboard Page — expenses split, spending chart, transactions, recurring, investments
 */
const Dashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [splitData, setSplitData] = useState([]);
  const [splitLoading, setSplitLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [chartsLoading, setChartsLoading] = useState(true);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [txnLoading, setTxnLoading] = useState(true);
  const [recurringItems, setRecurringItems] = useState([]);
  const [recurringLoading, setRecurringLoading] = useState(true);
  const [investmentItems, setInvestmentItems] = useState([]);
  const [investmentsLoading, setInvestmentsLoading] = useState(true);
  const [error, setError] = useState('');

  const comparison = useMemo(
    () => resolveSpendingComparison(selectedMonth),
    [selectedMonth]
  );

  const chartHasData = useMemo(() => chartHasSpendingData(chartData), [chartData]);

  useEffect(() => {
    let cancelled = false;

    const loadSplit = async () => {
      try {
        setSplitLoading(true);
        setError('');

        const [dashboardResponse, splitResponse] = await Promise.all([
          analyticsService.getDashboard({ month: selectedMonth }),
          analyticsService.getExpenseSubCategorySplit(selectedMonth)
        ]);

        if (cancelled) return;

        setTotalExpenses(dashboardResponse?.kpis?.totalExpenses ?? 0);
        setSplitData(splitResponse?.data ?? []);
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.error || 'Failed to load dashboard data');
          setTotalExpenses(0);
          setSplitData([]);
        }
      } finally {
        if (!cancelled) {
          setSplitLoading(false);
        }
      }
    };

    loadSplit();
    return () => {
      cancelled = true;
    };
  }, [selectedMonth]);

  useEffect(() => {
    let cancelled = false;
    const { focusMonth, benchmarkMonth } = resolveSpendingComparison(selectedMonth);

    const loadChart = async () => {
      try {
        setChartsLoading(true);

        const [focusRes, benchmarkRes] = await Promise.all([
          analyticsService.getExpenseMonthlyTrend(focusMonth),
          analyticsService.getExpenseMonthlyTrend(benchmarkMonth)
        ]);

        if (cancelled) return;

        const merged = mergeDailyTrends(
          focusRes?.data ?? [],
          benchmarkRes?.data ?? [],
          focusMonth,
          benchmarkMonth
        );
        setChartData(merged);
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to load spending chart:', err);
          setChartData([]);
        }
      } finally {
        if (!cancelled) {
          setChartsLoading(false);
        }
      }
    };

    loadChart();
    return () => {
      cancelled = true;
    };
  }, [selectedMonth]);

  useEffect(() => {
    let cancelled = false;

    const loadRecentTransactions = async () => {
      try {
        setTxnLoading(true);
        const response = await transactionService.getTransactions({ limit: 3, page: 1 });
        if (cancelled) return;
        setRecentTransactions((response?.data ?? []).slice(0, 3));
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to load recent transactions:', err);
          setRecentTransactions([]);
        }
      } finally {
        if (!cancelled) {
          setTxnLoading(false);
        }
      }
    };

    loadRecentTransactions();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadRecurring = async () => {
      try {
        setRecurringLoading(true);
        const response = await subscriptionService.getSubscriptions(true);
        if (cancelled) return;
        setRecurringItems(buildRecurringItems(response?.data ?? []));
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to load recurring subscriptions:', err);
          setRecurringItems([]);
        }
      } finally {
        if (!cancelled) {
          setRecurringLoading(false);
        }
      }
    };

    loadRecurring();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadInvestments = async () => {
      try {
        setInvestmentsLoading(true);
        const response = await portfolioService.getSummary();
        if (cancelled) return;
        setInvestmentItems(response?.data?.topHoldings ?? []);
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to load investments:', err);
          setInvestmentItems([]);
        }
      } finally {
        if (!cancelled) {
          setInvestmentsLoading(false);
        }
      }
    };

    loadInvestments();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="dashboard-page dashboard-page--fit">
      <div className="dashboard-page__header">
        <div className="dashboard-page__intro">
          <h1 className="dashboard-page__title">Welcome back — here&apos;s your month at a glance</h1>
        </div>
        <div className="dashboard-page__month">
          <DatePicker
            selected={selectedMonth}
            onChange={(date) => setSelectedMonth(date)}
            placeholder="Select month"
            showMonthYearPicker
            calendarClassName="dashboard-month-picker__calendar"
          />
        </div>
      </div>

      {error && !splitLoading && (
        <Alert variant="danger" className="mb-2 py-2" style={{ flexShrink: 0 }}>
          {error}
        </Alert>
      )}

      <div className="dashboard-page__grid">
        <div className="dashboard-page__area dashboard-page__area-split">
          <TotalExpensesSplitCard
            totalExpenses={totalExpenses}
            splitData={splitData}
            loading={splitLoading}
          />
        </div>
        <div className="dashboard-page__area dashboard-page__area-chart">
          <SpendingComparisonCard
            title={comparison.title}
            comparisonLabel={comparison.comparisonLabel}
            focusLabel={comparison.focusLabel}
            benchmarkLabel={comparison.benchmarkLabel}
            totalExpenses={totalExpenses}
            chartData={chartData}
            loading={chartsLoading}
            hasData={chartHasData}
          />
        </div>
        <div className="dashboard-page__area dashboard-page__area-txn">
          <RecentTransactionsCard transactions={recentTransactions} loading={txnLoading} />
        </div>
        <div className="dashboard-page__area dashboard-page__area-inv">
          <InvestmentsCard items={investmentItems} loading={investmentsLoading} />
        </div>
        <div className="dashboard-page__area dashboard-page__area-recur">
          <RecurringCard items={recurringItems} loading={recurringLoading} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
