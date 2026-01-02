import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Alert, Table } from 'react-bootstrap';
import { analyticsService } from '../services/analyticsService';
import { exportService } from '../services/exportService';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { cardStyle } from '../styles/cardStyles';
import { BarChart3, Folder, FolderTree, Download } from 'lucide-react';
import DatePicker from '../components/ui/DatePicker';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';

const Reports = () => {
  const [chartData, setChartData] = useState({});
  const [topCategories, setTopCategories] = useState([]);
  const [topSubcategories, setTopSubcategories] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    type: 'expense',
    chartType: 'monthlyTrend',
    month: new Date().toISOString().slice(0, 7),
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    loadChartData();
    loadTopSpending();
    loadPaymentMethodData();
  }, [filters.type, filters.chartType, filters.month, filters.startDate, filters.endDate]);

  const loadChartData = async () => {
    try {
      setLoading(true);
      setError('');

      // Ensure we have required filters
      if (!filters.month && (!filters.startDate || !filters.endDate)) {
        // Default to current month if no date range provided
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        setFilters(prev => ({ ...prev, month: currentMonth }));
        setLoading(false);
        return;
      }

      const chartFilters = filters.month
        ? { month: filters.month }
        : { startDate: filters.startDate, endDate: filters.endDate };

      const response = await analyticsService.getCharts(filters.type, filters.chartType, chartFilters);
      
      if (response.success && response.data) {
        setChartData({
          chartType: response.chartType || filters.chartType,
          data: response.data || []
        });
      } else {
        setChartData({ chartType: filters.chartType, data: [] });
      }
      setLoading(false);
    } catch (err) {
      console.error('Chart data error:', err);
      setError(err.response?.data?.error || 'Failed to load chart data');
      setChartData({ chartType: filters.chartType, data: [] });
      setLoading(false);
    }
  };

  const loadTopSpending = async () => {
    try {
      const chartFilters = filters.month
        ? { month: filters.month }
        : { startDate: filters.startDate, endDate: filters.endDate };

      // Load top categories and subcategories for expense type
      const [categoriesRes, subcategoriesRes] = await Promise.all([
        analyticsService.getCharts('expense', 'categorySplit', chartFilters),
        analyticsService.getCharts('expense', 'subCategorySplit', chartFilters)
      ]);

      if (categoriesRes.success && categoriesRes.data) {
        const total = categoriesRes.data.reduce((sum, item) => sum + (item.amount || 0), 0);
        setTopCategories(
          categoriesRes.data.map(item => ({
            ...item,
            percentage: total > 0 ? ((item.amount / total) * 100).toFixed(1) : 0
          }))
        );
      } else {
        setTopCategories([]);
      }

      if (subcategoriesRes.success && subcategoriesRes.data) {
        const total = subcategoriesRes.data.reduce((sum, item) => sum + (item.amount || 0), 0);
        setTopSubcategories(
          subcategoriesRes.data.map(item => ({
            ...item,
            percentage: total > 0 ? ((item.amount / total) * 100).toFixed(1) : 0
          }))
        );
      } else {
        setTopSubcategories([]);
      }
    } catch (err) {
      console.error('Top spending error:', err);
      setTopCategories([]);
      setTopSubcategories([]);
    }
  };

  const loadPaymentMethodData = async () => {
    try {
      const chartFilters = filters.month
        ? { month: filters.month }
        : { startDate: filters.startDate, endDate: filters.endDate };

      const response = await analyticsService.getCharts('expense', 'paymentMethodSplit', chartFilters);

      if (response.success && response.data) {
        const total = response.data.reduce((sum, item) => sum + (item.amount || 0), 0);
        setPaymentMethods(
          response.data.map(item => ({
            ...item,
            percentage: total > 0 ? ((item.amount / total) * 100).toFixed(1) : 0
          }))
        );
      } else {
        setPaymentMethods([]);
      }
    } catch (err) {
      console.error('Payment method data error:', err);
      setPaymentMethods([]);
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

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  const handleExportTransactions = async () => {
    try {
      const exportFilters = {};
      if (filters.type) exportFilters.type = filters.type;
      if (filters.startDate) exportFilters.startDate = filters.startDate;
      if (filters.endDate) exportFilters.endDate = filters.endDate;
      await exportService.exportTransactions(exportFilters);
    } catch (err) {
      setError('Failed to export transactions');
    }
  };

  const handleExportSubscriptions = async () => {
    try {
      await exportService.exportSubscriptions();
    } catch (err) {
      setError('Failed to export subscriptions');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4" style={{ marginBottom: '24px' }}>
        <h2 style={{ 
          fontWeight: 600, 
          margin: 0,
          fontSize: '24px',
          color: '#111827',
          letterSpacing: '-0.02em'
        }}>
          Reports
        </h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button 
            variant="secondary" 
            onClick={handleExportTransactions}
          >
            <Download size={16} />
            Export Transactions
          </Button>
          <Button 
            variant="secondary" 
            onClick={handleExportSubscriptions}
          >
            <Download size={16} />
            Export Subscriptions
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

      {/* Filters */}
      <Card className="mb-4" style={{ ...cardStyle, marginBottom: '24px' }}>
        <Card.Body style={{ padding: '20px' }}>
          <Row>
            <Col md={3}>
              <Select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                options={[
                  { value: 'expense', label: 'Expense' },
                  { value: 'income', label: 'Income' },
                  { value: 'savings', label: 'Savings' },
                  { value: 'investment', label: 'Investment' }
                ]}
              />
            </Col>
            <Col md={3}>
              <Select
                value={filters.chartType}
                onChange={(e) => setFilters({ ...filters, chartType: e.target.value })}
                options={[
                  { value: 'monthlyTrend', label: 'Monthly Trend' },
                  { value: 'categorySplit', label: 'Category Split' },
                  { value: 'subCategorySplit', label: 'SubCategory Split' },
                  { value: 'tagBased', label: 'Tag-Based' },
                  { value: 'paymentMethodSplit', label: 'Payment Method Split' }
                ]}
              />
            </Col>
            <Col md={3}>
              <DatePicker
                selected={filters.month}
                onChange={(date) => setFilters({ ...filters, month: date, startDate: '', endDate: '' })}
                placeholder="Select month"
                showMonthYearPicker
              />
            </Col>
            <Col md={3}>
              <div className="text-muted small">Or use date range below</div>
            </Col>
          </Row>
          <Row className="mt-2">
            <Col md={3}>
              <DatePicker
                selected={filters.startDate}
                onChange={(date) => setFilters({ ...filters, startDate: date, month: '' })}
                placeholder="Start Date"
              />
            </Col>
            <Col md={3}>
              <DatePicker
                selected={filters.endDate}
                onChange={(date) => setFilters({ ...filters, endDate: date, month: '' })}
                placeholder="End Date"
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Chart Display */}
      <Card style={{ ...cardStyle, padding: '0' }}>
        <Card.Body style={{ padding: '28px' }}>
          <h5 style={{ 
            marginBottom: '24px', 
            fontWeight: 600,
            fontSize: '18px',
            color: '#111827',
            letterSpacing: '-0.01em'
          }}>
            {chartData.chartType || 'Chart'}
          </h5>
        {loading ? (
          <div className="text-center" style={{ padding: '40px', color: '#9ca3af', fontSize: '13px' }}>Loading...</div>
        ) : chartData.data && Array.isArray(chartData.data) && chartData.data.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            {filters.chartType === 'monthlyTrend' ? (
              <LineChart data={chartData.data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: '11px', fill: '#6b7280' }}
                  tickLine={{ stroke: '#d1d5db' }}
                />
                <YAxis 
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
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#2563eb" 
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            ) : filters.chartType === 'categorySplit' || filters.chartType === 'subCategorySplit' || filters.chartType === 'paymentMethodSplit' ? (
              <BarChart 
                data={chartData.data} 
                margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="2 2" stroke="#e5e7eb" />
                <XAxis 
                  dataKey={
                    filters.chartType === 'categorySplit' ? 'category' : 
                    filters.chartType === 'subCategorySplit' ? 'subCategory' : 
                    'paymentMethod'
                  } 
                  tick={{ fontSize: '11px', fill: '#6b7280' }}
                  tickLine={{ stroke: '#d1d5db' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
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
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar 
                  dataKey="amount" 
                  fill="#2563eb"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            ) : (
              <PieChart>
                <Pie
                  data={chartData.data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ tag, amount }) => {
                    const total = chartData.data.reduce((sum, item) => sum + (item.amount || 0), 0);
                    const percent = total > 0 ? ((amount / total) * 100).toFixed(0) : 0;
                    return `${tag} ${percent}%`;
                  }}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {chartData.data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => {
                    const total = chartData.data.reduce((sum, item) => sum + (item.amount || 0), 0);
                    const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                    return [`${formatCurrency(value)} (${percent}%)`, props.payload.tag];
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
            )}
          </ResponsiveContainer>
        ) : (
          <div style={{ 
            padding: '80px 20px', 
            textAlign: 'center',
            color: '#9ca3af',
            fontSize: '13px'
          }}>
            <BarChart3 size={32} style={{ marginBottom: '8px', opacity: 0.5, margin: '0 auto' }} />
            <p style={{ margin: 0 }}>No data for this period yet</p>
          </div>
        )}
        </Card.Body>
      </Card>

      {/* Top Spending Tables */}
      <Row style={{ gap: '12px 0', marginTop: '24px' }}>
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
              Top Categories
            </Card.Header>
            <Card.Body style={{ padding: '0' }}>
              {topCategories.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ 
                    width: '100%', 
                    borderCollapse: 'collapse',
                    fontSize: '14px'
                  }}>
                    <thead>
                      <tr style={{ 
                        backgroundColor: '#F9FAFB',
                        borderBottom: '1px solid #E5E7EB'
                      }}>
                        <th style={{ 
                          padding: '12px 16px', 
                          textAlign: 'left',
                          fontWeight: 500,
                          color: '#374151',
                          fontSize: '12px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          Category
                        </th>
                        <th style={{ 
                          padding: '12px 16px', 
                          textAlign: 'right',
                          fontWeight: 500,
                          color: '#374151',
                          fontSize: '12px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          Amount
                        </th>
                        <th style={{ 
                          padding: '12px 16px', 
                          textAlign: 'right',
                          fontWeight: 500,
                          color: '#374151',
                          fontSize: '12px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          %
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {topCategories.map((item, index) => (
                        <tr 
                          key={index}
                          style={{ 
                            borderBottom: '1px solid #E5E7EB',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <td style={{ padding: '16px', color: '#111827', fontSize: '14px' }}>
                            {item.category || 'Uncategorized'}
                          </td>
                          <td style={{ padding: '16px', color: '#111827', fontSize: '14px', textAlign: 'right', fontWeight: 500 }}>
                            {formatCurrency(item.amount)}
                          </td>
                          <td style={{ padding: '16px', color: '#6B7280', fontSize: '14px', textAlign: 'right' }}>
                            {item.percentage}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ 
                  padding: '40px 20px', 
                  textAlign: 'center',
                  color: '#9ca3af',
                  fontSize: '13px'
                }}>
                  <Folder size={24} style={{ marginBottom: '6px', opacity: 0.5, margin: '0 auto' }} />
                  <p style={{ margin: 0 }}>No category data for this period</p>
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
              Top Subcategories
            </Card.Header>
            <Card.Body style={{ padding: '0' }}>
              {topSubcategories.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ 
                    width: '100%', 
                    borderCollapse: 'collapse',
                    fontSize: '14px'
                  }}>
                    <thead>
                      <tr style={{ 
                        backgroundColor: '#F9FAFB',
                        borderBottom: '1px solid #E5E7EB'
                      }}>
                        <th style={{ 
                          padding: '12px 16px', 
                          textAlign: 'left',
                          fontWeight: 500,
                          color: '#374151',
                          fontSize: '12px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          Subcategory
                        </th>
                        <th style={{ 
                          padding: '12px 16px', 
                          textAlign: 'right',
                          fontWeight: 500,
                          color: '#374151',
                          fontSize: '12px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          Amount
                        </th>
                        <th style={{ 
                          padding: '12px 16px', 
                          textAlign: 'right',
                          fontWeight: 500,
                          color: '#374151',
                          fontSize: '12px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          %
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {topSubcategories.map((item, index) => (
                        <tr 
                          key={index}
                          style={{ 
                            borderBottom: '1px solid #E5E7EB',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <td style={{ padding: '16px', color: '#111827', fontSize: '14px' }}>
                            {item.subCategory || 'Uncategorized'}
                          </td>
                          <td style={{ padding: '16px', color: '#111827', fontSize: '14px', textAlign: 'right', fontWeight: 500 }}>
                            {formatCurrency(item.amount)}
                          </td>
                          <td style={{ padding: '16px', color: '#6B7280', fontSize: '14px', textAlign: 'right' }}>
                            {item.percentage}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ 
                  padding: '40px 20px', 
                  textAlign: 'center',
                  color: '#9ca3af',
                  fontSize: '13px'
                }}>
                  <FolderTree size={24} style={{ marginBottom: '6px', opacity: 0.5, margin: '0 auto' }} />
                  <p style={{ margin: 0 }}>No subcategory data for this period</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Payment Methods Table */}
      {paymentMethods.length > 0 && (
        <Row style={{ marginTop: '24px' }}>
          <Col md={12} style={{ padding: '0 6px' }}>
            <Card style={cardStyle}>
              <Card.Header style={{ 
                backgroundColor: '#ffffff', 
                borderBottom: '1px solid #e5e7eb', 
                fontWeight: 600,
                padding: '16px 20px',
                fontSize: '14px',
                color: '#111827'
              }}>
                Spending by Payment Method
              </Card.Header>
              <Card.Body style={{ padding: '0' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ 
                    width: '100%', 
                    borderCollapse: 'collapse',
                    fontSize: '14px'
                  }}>
                    <thead>
                      <tr style={{ 
                        backgroundColor: '#F9FAFB',
                        borderBottom: '1px solid #E5E7EB'
                      }}>
                        <th style={{ 
                          padding: '12px 16px', 
                          textAlign: 'left',
                          fontWeight: 500,
                          color: '#374151',
                          fontSize: '12px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          Payment Method
                        </th>
                        <th style={{ 
                          padding: '12px 16px', 
                          textAlign: 'right',
                          fontWeight: 500,
                          color: '#374151',
                          fontSize: '12px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          Amount
                        </th>
                        <th style={{ 
                          padding: '12px 16px', 
                          textAlign: 'right',
                          fontWeight: 500,
                          color: '#374151',
                          fontSize: '12px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          %
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentMethods.map((item, index) => (
                        <tr 
                          key={index}
                          style={{ 
                            borderBottom: '1px solid #E5E7EB',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <td style={{ padding: '16px', color: '#111827', fontSize: '14px' }}>
                            {item.paymentMethod || 'Unknown'}
                          </td>
                          <td style={{ padding: '16px', color: '#111827', fontSize: '14px', textAlign: 'right', fontWeight: 500 }}>
                            {formatCurrency(item.amount)}
                          </td>
                          <td style={{ padding: '16px', color: '#6B7280', fontSize: '14px', textAlign: 'right' }}>
                            {item.percentage}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default Reports;

