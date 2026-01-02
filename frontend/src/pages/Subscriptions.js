import React, { useState, useEffect } from 'react';
import { Card, Table, Form, Alert, Badge, Row, Col } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import { subscriptionService } from '../services/subscriptionService';
import { formatDateDDMMYYYY } from '../utils/dateUtils';
import { categoryService } from '../services/categoryService';
import { analyticsService } from '../services/analyticsService';
import { paymentMethodService } from '../services/paymentMethodService';
import { cardStyle } from '../styles/cardStyles';
import Modal from '../components/ui/Modal';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import DatePicker from '../components/ui/DatePicker';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import IconButton from '../components/ui/IconButton';

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    categoryId: '',
    billingCycle: 'monthly',
    nextPaymentDate: '',
    paymentMethod: '',
    paymentMethodId: '',
    paymentMethodDetail: '',
    isActive: true,
    autoRenew: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      
      const [subscriptionsRes, categoriesRes, paymentMethodsRes, dashboardRes] = await Promise.all([
        subscriptionService.getSubscriptions(),
        categoryService.getCategories(),
        paymentMethodService.getPaymentMethods(),
        analyticsService.getDashboard({ month: currentMonth })
      ]);
      setSubscriptions(subscriptionsRes.data || []);
      setCategories(categoriesRes.data || []);
      setPaymentMethods(paymentMethodsRes.data || []);
      setDashboardData(dashboardRes);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load data');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        amount: parseFloat(formData.amount),
        isActive: formData.isActive === true || formData.isActive === 'true',
        autoRenew: formData.autoRenew === true || formData.autoRenew === 'true'
      };
      if (editingSubscription) {
        await subscriptionService.updateSubscription(editingSubscription._id, data);
      } else {
        await subscriptionService.createSubscription(data);
      }
      setShowModal(false);
      resetForm();
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save subscription');
    }
  };

  const handleDelete = (id) => {
    setDeletingId(id);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    try {
      await subscriptionService.deleteSubscription(deletingId);
      loadData();
      setDeletingId(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete subscription');
      setDeletingId(null);
    }
  };

  const handleEdit = (subscription) => {
    setEditingSubscription(subscription);
    setFormData({
      name: subscription.name,
      amount: subscription.amount,
      categoryId: subscription.categoryId?._id || subscription.categoryId || '',
      billingCycle: subscription.billingCycle,
      nextPaymentDate: new Date(subscription.nextPaymentDate).toISOString().split('T')[0],
      paymentMethod: subscription.paymentMethod || '',
      paymentMethodId: subscription.paymentMethodId?._id || subscription.paymentMethodId || '',
      paymentMethodDetail: subscription.paymentMethodDetail || '',
      isActive: subscription.isActive,
      autoRenew: subscription.autoRenew
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingSubscription(null);
    setFormData({
      name: '',
      amount: '',
      categoryId: '',
      billingCycle: 'monthly',
      nextPaymentDate: '',
      paymentMethod: '',
      paymentMethodId: '',
      paymentMethodDetail: '',
      isActive: true,
      autoRenew: true
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
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
          Subscriptions
        </h2>
        <Button 
          variant="primary"
          onClick={() => { resetForm(); setShowModal(true); }}
        >
          + Add Subscription
        </Button>
      </div>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

      {/* Mini Analytics KPI Cards */}
      {dashboardData && dashboardData.kpis && (
        <Row style={{ marginBottom: '20px', gap: '12px 0' }}>
          <Col md={6} style={{ padding: '0 6px' }}>
            <Card style={cardStyle}>
              <Card.Body style={{ padding: '20px' }}>
                <div style={{ 
                  color: '#6b7280', 
                  fontSize: '12px', 
                  marginBottom: '8px',
                  fontWeight: 500,
                  letterSpacing: '0.3px'
                }}>
                  Active Subscriptions
                </div>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: 700, 
                  color: '#2563eb',
                  letterSpacing: '-0.02em',
                  lineHeight: '1.1'
                }}>
                  {dashboardData.kpis.activeSubscriptions || 0}
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} style={{ padding: '0 6px' }}>
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
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <Card style={cardStyle}>
        <Card.Body style={{ padding: '24px' }}>
          {loading ? (
            <div className="text-center" style={{ padding: '40px' }}>Loading...</div>
          ) : subscriptions.length === 0 ? (
            <div className="text-center text-muted" style={{ padding: '40px' }}>No subscriptions found</div>
          ) : (
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
                      Name
                    </th>
                    <th style={{ 
                      padding: '12px 16px', 
                      textAlign: 'left',
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
                      textAlign: 'left',
                      fontWeight: 500,
                      color: '#374151',
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Billing Cycle
                    </th>
                    <th style={{ 
                      padding: '12px 16px', 
                      textAlign: 'left',
                      fontWeight: 500,
                      color: '#374151',
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Next Payment
                    </th>
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
                      textAlign: 'left',
                      fontWeight: 500,
                      color: '#374151',
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Status
                    </th>
                    <th style={{ 
                      padding: '12px 16px', 
                      textAlign: 'left',
                      fontWeight: 500,
                      color: '#374151',
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((subscription) => (
                    <tr 
                      key={subscription._id}
                      style={{ 
                        borderBottom: '1px solid #E5E7EB',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '16px', color: '#111827', fontSize: '14px' }}>
                        {subscription.name}
                      </td>
                      <td style={{ padding: '16px', fontWeight: 500, color: '#111827', fontSize: '14px' }}>
                        {formatCurrency(subscription.amount)}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ 
                          fontSize: '12px',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontWeight: 500,
                          display: 'inline-block',
                          backgroundColor: '#DBEAFE',
                          color: '#1E40AF'
                        }}>
                          {subscription.billingCycle}
                        </span>
                      </td>
                      <td style={{ padding: '16px', color: '#6B7280', fontSize: '14px' }}>
                        {formatDateDDMMYYYY(subscription.nextPaymentDate)}
                      </td>
                      <td style={{ padding: '16px' }}>
                        {subscription.paymentMethodId ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              width: '36px',
                              height: '36px',
                              borderRadius: '8px',
                              backgroundColor: '#FFFFFF',
                              border: '1px solid #E5E7EB',
                              flexShrink: 0
                            }}>
                              <Icon 
                                icon={subscription.paymentMethodId.icon} 
                                style={{ fontSize: '20px' }} 
                              />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                              <span style={{ color: '#111827', fontSize: '14px', fontWeight: 500, lineHeight: '1.2' }}>
                                {subscription.paymentMethodId.detailLabel || subscription.paymentMethodId.name}
                              </span>
                              {subscription.paymentMethodDetail && (
                                <span style={{ color: '#6B7280', fontSize: '12px', lineHeight: '1.2' }}>
                                  {subscription.paymentMethodId.type === 'card' && /^\d{4}$/.test(subscription.paymentMethodDetail.trim())
                                    ? `**** ${subscription.paymentMethodDetail.trim()}`
                                    : subscription.paymentMethodDetail}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: '#6B7280', fontSize: '14px' }}>-</span>
                        )}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ 
                          fontSize: '12px',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontWeight: 500,
                          display: 'inline-block',
                          backgroundColor: subscription.isActive ? '#D1FAE5' : '#F3F4F6',
                          color: subscription.isActive ? '#065F46' : '#374151'
                        }}>
                          {subscription.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button
                            onClick={() => handleEdit(subscription)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '4px',
                              transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <Icon icon="mdi:pencil" style={{ fontSize: '18px', color: '#6B7280' }} />
                          </button>
                          <button
                            onClick={() => handleDelete(subscription._id)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '4px',
                              transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEE2E2'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <Icon icon="mdi:trash-can-outline" style={{ fontSize: '18px', color: '#EF4444' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); resetForm(); }}
        title={editingSubscription ? 'Edit Subscription' : 'Add Subscription'}
        size="lg"
      >
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Name *</Form.Label>
            <Form.Control
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </Form.Group>
          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Amount *</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Billing Cycle *</Form.Label>
                <Select
                  value={formData.billingCycle}
                  onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                  options={[
                    { value: 'monthly', label: 'Monthly' },
                    { value: 'yearly', label: 'Yearly' }
                  ]}
                  required
                />
              </Form.Group>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Next Payment Date *</Form.Label>
                <DatePicker
                  selected={formData.nextPaymentDate}
                  onChange={(date) => setFormData({ ...formData, nextPaymentDate: date })}
                  placeholder="Select date"
                  required
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <Select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  options={[
                    { value: '', label: 'Select Category' },
                    ...categories.map(cat => ({ value: cat._id, label: cat.name }))
                  ]}
                />
              </Form.Group>
            </div>
          </div>
          <Form.Group className="mb-3">
            <Form.Label>Payment Method</Form.Label>
            <Select
              value={formData.paymentMethodId}
              onChange={(e) => {
                setFormData({ 
                  ...formData, 
                  paymentMethodId: e.target.value
                });
              }}
              options={[
                { value: '', label: 'Select Payment Method' },
                ...paymentMethods.map(pm => ({
                  value: pm._id,
                  label: pm.name
                }))
              ]}
            />
          </Form.Group>
          <div className="row">
            <div className="col-md-6">
              <Form.Check
                type="switch"
                label="Active"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
            </div>
            <div className="col-md-6">
              <Form.Check
                type="switch"
                label="Auto Renew"
                checked={formData.autoRenew}
                onChange={(e) => setFormData({ ...formData, autoRenew: e.target.checked })}
              />
            </div>
          </div>
          <div className="d-flex justify-content-end gap-2 mt-4" style={{ gap: '8px' }}>
            <Button variant="secondary" onClick={() => { setShowModal(false); resetForm(); }}>Cancel</Button>
            <Button variant="primary" type="submit">{editingSubscription ? 'Update' : 'Create'}</Button>
          </div>
        </Form>
      </Modal>

      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => { setShowConfirmModal(false); setDeletingId(null); }}
        onConfirm={confirmDelete}
        title="Delete Subscription"
        message="Are you sure you want to delete this subscription? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default Subscriptions;

