import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Alert, Badge } from 'react-bootstrap';
import { analyticsService } from '../services/analyticsService';
import { formatDateDDMMYYYY } from '../utils/dateUtils';
import { subscriptionService } from '../services/subscriptionService';
import { budgetService } from '../services/budgetService';
import { transactionService } from '../services/transactionService';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { cardStyle } from '../styles/cardStyles';
import { BarChart3, CreditCard, AlertTriangle, Bell } from 'lucide-react';
import DatePicker from '../components/ui/DatePicker';

/**
 * Dashboard Page
 * Displays KPIs, charts, and subscription reminders
 */
const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [chartData, setChartData] = useState({});
  const [subscriptionAlerts, setSubscriptionAlerts] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [budgetTransactions, setBudgetTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    loadDashboardData();
  }, [selectedMonth]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load dashboard KPIs
      const dashboardResponse = await analyticsService.getDashboard({ month: selectedMonth });
      setDashboardData(dashboardResponse);

      // Load chart data
      const [incomeTrend, expenseTrend, categorySplit] = await Promise.all([
        analyticsService.getCharts('income', 'monthlyTrend', { month: selectedMonth }),
        analyticsService.getCharts('expense', 'monthlyTrend', { month: selectedMonth }),
        analyticsService.getCharts('expense', 'categorySplit', { month: selectedMonth })
      ]);

      setChartData({
        incomeTrend: incomeTrend.data,
        expenseTrend: expenseTrend.data,
        categorySplit: categorySplit.data
      });

      // Load subscription alerts
      const alertsResponse = await subscriptionService.getAlerts(7);
      setSubscriptionAlerts(alertsResponse);

      // Load budgets and transactions for budget status
      const monthStart = `${selectedMonth}-01`;
      const monthEndDate = new Date(new Date(monthStart).getFullYear(), new Date(monthStart).getMonth() + 1, 0);
      const monthEnd = monthEndDate.toISOString().split('T')[0];

      const [budgetsRes, transactionsRes] = await Promise.all([
        budgetService.getBudgets({ month: selectedMonth }),
        transactionService.getTransactions({ 
          type: 'expense',
          startDate: monthStart,
          endDate: monthEnd
        })
      ]);

      setBudgets(budgetsRes.data || []);
      setBudgetTransactions(transactionsRes.data || []);

      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load dashboard data');
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatPercentage = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return `${value.toFixed(1)}%`;
  };

  // Combine income and expense trends for comparison chart
  const combinedTrendData = React.useMemo(() => {
    if (!chartData.incomeTrend || !chartData.expenseTrend) return [];
    
    const incomeMap = new Map(chartData.incomeTrend.map(item => [item.date, item.amount]));
    const expenseMap = new Map(chartData.expenseTrend.map(item => [item.date, item.amount]));
    
    const allDates = new Set([...incomeMap.keys(), ...expenseMap.keys()]);
    return Array.from(allDates).sort().map(date => ({
      date,
      income: incomeMap.get(date) || 0,
      expense: expenseMap.get(date) || 0
    }));
  }, [chartData.incomeTrend, chartData.expenseTrend]);

  // Calculate days until payment
  const getDaysUntil = (dateString) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const paymentDate = new Date(dateString);
    paymentDate.setHours(0, 0, 0, 0);
    const diffTime = paymentDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div style={{ maxWidth: '100%' }}>
      {/* Header with Month Selector */}
      <div className="d-flex justify-content-between align-items-center" style={{ marginBottom: '20px' }}>
        <h2 style={{ 
          fontWeight: 600, 
          margin: 0,
          fontSize: '26px',
          color: '#111827',
          letterSpacing: '-0.03em'
        }}>
          Dashboard
        </h2>
        <div style={{ width: '160px' }}>
          <DatePicker
            selected={selectedMonth}
            onChange={(date) => setSelectedMonth(date)}
            placeholder="Select month"
            showMonthYearPicker
          />
        </div>
      </div>

      {/* KPI Cards - Row 1: Core Financial Health */}
      {dashboardData && dashboardData.kpis && (
        <>
          <Row style={{ marginBottom: '12px', gap: '12px 0' }}>
            <Col md={3} style={{ padding: '0 6px' }}>
              <Card style={cardStyle}>
                <Card.Body style={{ padding: '20px' }}>
                  <div style={{ 
                    color: '#6b7280', 
                    fontSize: '12px', 
                    marginBottom: '8px',
                    fontWeight: 500,
                    letterSpacing: '0.3px'
                  }}>
                    Total Income
                  </div>
                  <div style={{ 
                    fontSize: '24px', 
                    fontWeight: 700, 
                    color: '#10b981',
                    letterSpacing: '-0.02em',
                    lineHeight: '1.1'
                  }}>
                    {formatCurrency(dashboardData.kpis.totalIncome)}
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} style={{ padding: '0 6px' }}>
              <Card style={cardStyle}>
                <Card.Body style={{ padding: '20px' }}>
                  <div style={{ 
                    color: '#6b7280', 
                    fontSize: '12px', 
                    marginBottom: '8px',
                    fontWeight: 500,
                    letterSpacing: '0.3px'
                  }}>
                    Total Expenses
                  </div>
                  <div style={{ 
                    fontSize: '24px', 
                    fontWeight: 700, 
                    color: '#ef4444',
                    letterSpacing: '-0.02em',
                    lineHeight: '1.1'
                  }}>
                    {formatCurrency(dashboardData.kpis.totalExpenses)}
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} style={{ padding: '0 6px' }}>
              <Card style={cardStyle}>
                <Card.Body style={{ padding: '20px' }}>
                  <div style={{ 
                    color: '#6b7280', 
                    fontSize: '12px', 
                    marginBottom: '8px',
                    fontWeight: 500,
                    letterSpacing: '0.3px'
                  }}>
                    Net Savings
                  </div>
                  <div style={{ 
                    fontSize: '24px', 
                    fontWeight: 700, 
                    color: dashboardData.kpis.netSavings >= 0 ? '#10b981' : '#ef4444',
                    letterSpacing: '-0.02em',
                    lineHeight: '1.1'
                  }}>
                    {formatCurrency(dashboardData.kpis.netSavings)}
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} style={{ padding: '0 6px' }}>
              <Card style={cardStyle}>
                <Card.Body style={{ padding: '20px' }}>
                  <div style={{ 
                    color: '#6b7280', 
                    fontSize: '12px', 
                    marginBottom: '8px',
                    fontWeight: 500,
                    letterSpacing: '0.3px'
                  }}>
                    Expense Rate
                  </div>
                  <div style={{ 
                    fontSize: '24px', 
                    fontWeight: 700, 
                    color: '#2563eb',
                    letterSpacing: '-0.02em',
                    lineHeight: '1.1'
                  }}>
                    {dashboardData.kpis.totalIncome > 0 
                      ? formatPercentage((dashboardData.kpis.totalExpenses / dashboardData.kpis.totalIncome) * 100)
                      : 'N/A'}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* KPI Cards - Row 2: Additional Metrics */}
          <Row style={{ marginBottom: '20px', gap: '12px 0' }}>
            <Col md={3} style={{ padding: '0 6px' }}>
              <Card style={cardStyle}>
                <Card.Body style={{ padding: '20px' }}>
                  <div style={{ 
                    color: '#6b7280', 
                    fontSize: '12px', 
                    marginBottom: '8px',
                    fontWeight: 500,
                    letterSpacing: '0.3px'
                  }}>
                    Total Savings
                  </div>
                  <div style={{ 
                    fontSize: '24px', 
                    fontWeight: 700, 
                    color: '#10b981',
                    letterSpacing: '-0.02em',
                    lineHeight: '1.1'
                  }}>
                    {formatCurrency(dashboardData.kpis.totalSavings || 0)}
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} style={{ padding: '0 6px' }}>
              <Card style={cardStyle}>
                <Card.Body style={{ padding: '20px' }}>
                  <div style={{ 
                    color: '#6b7280', 
                    fontSize: '12px', 
                    marginBottom: '8px',
                    fontWeight: 500,
                    letterSpacing: '0.3px'
                  }}>
                    Total Investments
                  </div>
                  <div style={{ 
                    fontSize: '24px', 
                    fontWeight: 700, 
                    color: '#2563eb',
                    letterSpacing: '-0.02em',
                    lineHeight: '1.1'
                  }}>
                    {formatCurrency(dashboardData.kpis.totalInvestments || 0)}
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} style={{ padding: '0 6px' }}>
              <Card style={cardStyle}>
                <Card.Body style={{ padding: '20px' }}>
                  <div style={{ 
                    color: '#6b7280', 
                    fontSize: '12px', 
                    marginBottom: '8px',
                    fontWeight: 500,
                    letterSpacing: '0.3px'
                  }}>
                    Avg Daily Expense
                  </div>
                  <div style={{ 
                    fontSize: '24px', 
                    fontWeight: 700, 
                    color: '#6b7280',
                    letterSpacing: '-0.02em',
                    lineHeight: '1.1'
                  }}>
                    {formatCurrency(dashboardData.kpis.avgDailyExpense || 0)}
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} style={{ padding: '0 6px' }}>
              <Card style={cardStyle}>
                <Card.Body style={{ padding: '20px' }}>
                  <div style={{ 
                    color: '#6b7280', 
                    fontSize: '12px', 
                    marginBottom: '8px',
                    fontWeight: 500,
                    letterSpacing: '0.3px'
                  }}>
                    Monthly Subscription Spend
                  </div>
                  <div style={{ 
                    fontSize: '24px', 
                    fontWeight: 700, 
                    color: '#f59e0b',
                    letterSpacing: '-0.02em',
                    lineHeight: '1.1'
                  }}>
                    {formatCurrency(dashboardData.kpis.monthlySubscriptionSpend || 0)}
                  </div>
                  <div style={{ 
                    fontSize: '11px', 
                    color: '#9ca3af',
                    marginTop: '4px'
                  }}>
                    {dashboardData.kpis.activeSubscriptions || 0} active
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}

      {/* Charts Row - Bento Style - Charts Dominate */}
      <Row style={{ marginBottom: '20px', gap: '12px 0' }}>
        <Col md={8} style={{ padding: '0 6px' }}>
          <Card style={cardStyle}>
            <Card.Body style={{ padding: '20px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '16px'
              }}>
                <h5 style={{ 
                  margin: 0, 
                  fontWeight: 600,
                  fontSize: '15px',
                  color: '#111827',
                  letterSpacing: '-0.01em'
                }}>
                  Income vs Expenses Trend
                </h5>
              </div>
              {combinedTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={380}>
                  <LineChart data={combinedTrendData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="2,2"/>
                      </pattern>
                    </defs>
                    <CartesianGrid strokeDasharray="2 2" stroke="#e5e7eb" fill="url(#grid)" opacity={0.3} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#9ca3af"
                      tick={{ fontSize: '11px', fill: '#6b7280' }}
                      tickLine={{ stroke: '#d1d5db' }}
                    />
                    <YAxis 
                      stroke="#9ca3af"
                      tick={{ fontSize: '11px', fill: '#6b7280' }}
                      tickLine={{ stroke: '#d1d5db' }}
                    />
                    <Tooltip 
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        fontSize: '12px',
                        padding: '8px 12px'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                      iconType="line"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="income" 
                      stroke="#10b981" 
                      strokeWidth={3} 
                      name="Income"
                      dot={false}
                      activeDot={{ r: 5, fill: '#10b981' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="expense" 
                      stroke="#ef4444" 
                      strokeWidth={3} 
                      name="Expenses"
                      dot={false}
                      activeDot={{ r: 5, fill: '#ef4444' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                  <div style={{ 
                    padding: '80px 20px', 
                    textAlign: 'center',
                    color: '#9ca3af',
                    fontSize: '13px'
                  }}>
                    <BarChart3 size={32} style={{ marginBottom: '8px', opacity: 0.5, margin: '0 auto' }} />
                    <p style={{ margin: 0 }}>No expense data for this month yet</p>
                  </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} style={{ padding: '0 6px' }}>
          <Card style={cardStyle}>
            <Card.Body style={{ padding: '20px' }}>
              <h5 style={{ 
                margin: 0,
                marginBottom: '16px',
                fontWeight: 600,
                fontSize: '15px',
                color: '#111827',
                letterSpacing: '-0.01em'
              }}>
                Expense by Category
              </h5>
              {(() => {
                // Process category split data - ensure correct field names and calculate total
                const processedData = chartData.categorySplit && chartData.categorySplit.length > 0
                  ? chartData.categorySplit.map(item => ({
                      name: item.category || item.name || 'Uncategorized',
                      amount: item.amount || 0
                    }))
                  : [];
                
                const totalExpenses = processedData.reduce((sum, item) => sum + item.amount, 0);
                
                return processedData.length > 0 && totalExpenses > 0 ? (
                  <ResponsiveContainer width="100%" height={380}>
                    <PieChart>
                      <Pie
                        data={processedData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, amount }) => {
                          const percent = totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(0) : 0;
                          return `${name} ${percent}%`;
                        }}
                        outerRadius={110}
                        fill="#8884d8"
                        dataKey="amount"
                      >
                        {processedData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name, props) => {
                          const percent = totalExpenses > 0 ? ((value / totalExpenses) * 100).toFixed(1) : 0;
                          return [`${formatCurrency(value)} (${percent}%)`, props.payload.name];
                        }}
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          fontSize: '12px',
                          padding: '8px 12px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ 
                    padding: '80px 20px', 
                    textAlign: 'center',
                    color: '#9ca3af',
                    fontSize: '13px'
                  }}>
                    <BarChart3 size={32} style={{ marginBottom: '8px', opacity: 0.5, margin: '0 auto' }} />
                    <p style={{ margin: 0 }}>No data for this month yet</p>
                  </div>
                );
              })()}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Budget Status Overview */}
      {budgets.length > 0 && (
        <Row style={{ gap: '12px 0', marginBottom: '20px' }}>
          {budgets.map((budget) => {
            const calculateSpent = (budget) => {
              const monthStart = new Date(selectedMonth + '-01');
              const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
              
              return budgetTransactions
                .filter(t => {
                  const tDate = new Date(t.date);
                  if (tDate < monthStart || tDate > monthEnd) return false;
                  
                  if (budget.categoryId) {
                    const budgetCatId = budget.categoryId?._id || budget.categoryId;
                    const tCatId = t.categoryId?._id || t.categoryId;
                    return tCatId && budgetCatId && tCatId.toString() === budgetCatId.toString();
                  }
                  if (budget.subCategoryId) {
                    const budgetSubCatId = budget.subCategoryId?._id || budget.subCategoryId;
                    const tSubCatId = t.subCategoryId?._id || t.subCategoryId;
                    return tSubCatId && budgetSubCatId && tSubCatId.toString() === budgetSubCatId.toString();
                  }
                  return false;
                })
                .reduce((sum, t) => sum + t.amount, 0);
            };

            const spent = calculateSpent(budget);
            const percentage = budget.amount > 0 ? Math.min((spent / budget.amount) * 100, 100) : 0;
            const isOverBudget = spent > budget.amount;
            const budgetName = budget.categoryId?.name || budget.subCategoryId?.name || 'Budget';

            return (
              <Col md={4} key={budget._id} style={{ padding: '0 6px' }}>
                <Card style={cardStyle}>
                  <Card.Body style={{ padding: '20px' }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      marginBottom: '12px'
                    }}>
                      <div>
                        <div style={{ 
                          fontWeight: 600, 
                          fontSize: '14px', 
                          color: '#111827',
                          marginBottom: '4px'
                        }}>
                          {budgetName}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          {formatCurrency(spent)} / {formatCurrency(budget.amount)}
                        </div>
                      </div>
                      <Badge 
                        bg={isOverBudget ? 'danger' : percentage >= 80 ? 'warning' : 'success'}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 500
                        }}
                      >
                        {isOverBudget ? 'Over Budget' : percentage >= 80 ? 'Warning' : 'On Track'}
                      </Badge>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '8px',
                      backgroundColor: '#e5e7eb',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      marginTop: '8px'
                    }}>
                      <div style={{
                        width: `${Math.min(percentage, 100)}%`,
                        height: '100%',
                        backgroundColor: isOverBudget ? '#ef4444' : percentage >= 80 ? '#f59e0b' : '#10b981',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                    <div style={{ 
                      fontSize: '11px', 
                      color: '#9ca3af', 
                      marginTop: '6px',
                      textAlign: 'right'
                    }}>
                      {percentage.toFixed(1)}% used
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Subscription Reminders Section */}
      <Row style={{ gap: '12px 0', marginBottom: '20px' }}>
          <Col md={6} style={{ padding: '0 6px' }}>
            <Card style={cardStyle}>
              <Card.Header style={{ 
                backgroundColor: '#ffffff', 
                borderBottom: '1px solid #e5e7eb', 
                fontWeight: 600,
                padding: '16px 20px',
                fontSize: '14px',
                color: '#111827'
              }}>
                Upcoming Subscriptions
              </Card.Header>
              <Card.Body style={{ padding: '16px 20px' }}>
                {subscriptionAlerts && subscriptionAlerts.upcoming && subscriptionAlerts.upcoming.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {subscriptionAlerts.upcoming.map((sub) => {
                      const daysUntil = getDaysUntil(sub.nextPaymentDate);
                      return (
                        <div
                          key={sub.id}
                          style={{
                            padding: '12px',
                            backgroundColor: '#f9fafb',
                            borderRadius: '8px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            border: '1px solid #e5e7eb'
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '14px', color: '#111827', marginBottom: '2px' }}>
                              {sub.name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                              {formatCurrency(sub.amount)} • {sub.billingCycle}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <Badge 
                              bg={daysUntil <= 3 ? 'danger' : daysUntil <= 7 ? 'warning' : 'info'}
                              style={{
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 500
                              }}
                            >
                              {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                            </Badge>
                            <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '4px' }}>
                              {formatDateDDMMYYYY(sub.nextPaymentDate)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ 
                    padding: '40px 20px', 
                    textAlign: 'center',
                    color: '#9ca3af',
                    fontSize: '13px'
                  }}>
                    <Bell size={24} style={{ marginBottom: '6px', opacity: 0.5, margin: '0 auto' }} />
                    <p style={{ margin: 0 }}>No upcoming subscriptions</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} style={{ padding: '0 6px' }}>
            <Card style={cardStyle}>
              <Card.Header style={{ 
                backgroundColor: '#ffffff', 
                borderBottom: '1px solid #e5e7eb', 
                fontWeight: 600,
                padding: '16px 20px',
                fontSize: '14px',
                color: '#111827'
              }}>
                Overdue Subscriptions
              </Card.Header>
              <Card.Body style={{ padding: '16px 20px' }}>
                {subscriptionAlerts && subscriptionAlerts.overdue && subscriptionAlerts.overdue.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {subscriptionAlerts.overdue.map((sub) => {
                      const daysOverdue = Math.abs(getDaysUntil(sub.nextPaymentDate));
                      return (
                        <div
                          key={sub.id}
                          style={{
                            padding: '12px',
                            backgroundColor: '#fef3c7',
                            borderRadius: '8px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            border: '1px solid #fde68a'
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '14px', color: '#111827', marginBottom: '2px' }}>
                              {sub.name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                              {formatCurrency(sub.amount)} • {sub.billingCycle}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <Badge 
                              bg="danger"
                              style={{
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 500
                              }}
                            >
                              {daysOverdue === 1 ? '1 day overdue' : `${daysOverdue} days overdue`}
                            </Badge>
                            <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '4px' }}>
                              {formatDateDDMMYYYY(sub.nextPaymentDate)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ 
                    padding: '40px 20px', 
                    textAlign: 'center',
                    color: '#9ca3af',
                    fontSize: '13px'
                  }}>
                    <AlertTriangle size={24} style={{ marginBottom: '6px', opacity: 0.5, margin: '0 auto' }} />
                    <p style={{ margin: 0 }}>No overdue subscriptions</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
    </div>
  );
};

export default Dashboard;

