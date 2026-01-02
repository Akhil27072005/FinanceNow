import React, { useState, useEffect } from 'react';
import { Card, Table, Form, Alert, Badge } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import { paymentMethodService } from '../services/paymentMethodService';
import { cardStyle } from '../styles/cardStyles';
import Modal from '../components/ui/Modal';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import IconButton from '../components/ui/IconButton';

const PaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    icon: '', 
    type: 'other',
    detailLabel: '' 
  });

  // Common payment method presets
  const commonPaymentMethods = [
    { name: 'Cash', icon: 'mdi:cash', type: 'cash', detailLabel: '' },
    { name: 'Credit Card', icon: 'mdi:credit-card', type: 'card', detailLabel: 'Last 4 digits' },
    { name: 'Debit Card', icon: 'mdi:credit-card-outline', type: 'card', detailLabel: 'Last 4 digits' },
    { name: 'VISA', icon: 'logos:visa', type: 'card', detailLabel: 'Last 4 digits' },
    { name: 'Mastercard', icon: 'logos:mastercard', type: 'card', detailLabel: 'Last 4 digits' },
    { name: 'American Express', icon: 'logos:american-express', type: 'card', detailLabel: 'Last 4 digits' },
    { name: 'GPay', icon: 'logos:google-pay', type: 'digital_wallet', detailLabel: 'GPay ID' },
    { name: 'PayPal', icon: 'logos:paypal', type: 'digital_wallet', detailLabel: 'PayPal Email' },
    { name: 'UPI', icon: 'mdi:bank-transfer', type: 'digital_wallet', detailLabel: 'UPI ID' },
    { name: 'PhonePe', icon: 'mdi:cellphone', type: 'digital_wallet', detailLabel: 'PhonePe Number' },
    { name: 'Paytm', icon: 'mdi:wallet', type: 'digital_wallet', detailLabel: 'Paytm Number' },
    { name: 'Bank Transfer', icon: 'mdi:bank-transfer', type: 'bank', detailLabel: 'Account Number' },
    { name: 'Net Banking', icon: 'mdi:bank', type: 'bank', detailLabel: 'Bank Name' },
    { name: 'Cheque', icon: 'mdi:file-document-outline', type: 'other', detailLabel: 'Cheque Number' }
  ];

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await paymentMethodService.getPaymentMethods();
      setPaymentMethods(response.data || []);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load payment methods');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPaymentMethod) {
        await paymentMethodService.updatePaymentMethod(editingPaymentMethod._id, formData);
      } else {
        await paymentMethodService.createPaymentMethod(formData);
      }
      setShowModal(false);
      setFormData({ name: '', icon: '', type: 'other', detailLabel: '' });
      setEditingPaymentMethod(null);
      loadPaymentMethods();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save payment method');
    }
  };

  const handleDelete = (id) => {
    setDeletingId(id);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    try {
      await paymentMethodService.deletePaymentMethod(deletingId);
      loadPaymentMethods();
      setDeletingId(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete payment method');
      setDeletingId(null);
    }
  };

  const handleEdit = (paymentMethod) => {
    setEditingPaymentMethod(paymentMethod);
    setFormData({ 
      name: paymentMethod.name, 
      icon: paymentMethod.icon,
      type: paymentMethod.type || 'other',
      detailLabel: paymentMethod.detailLabel || ''
    });
    setShowModal(true);
  };

  const handleQuickAdd = (preset) => {
    setFormData({
      name: preset.name,
      icon: preset.icon,
      type: preset.type,
      detailLabel: preset.detailLabel
    });
    setEditingPaymentMethod(null);
    setShowModal(true);
  };

  const getTypeColor = (type) => {
    const colors = {
      card: 'primary',
      digital_wallet: 'info',
      cash: 'success',
      bank: 'warning',
      other: 'secondary'
    };
    return colors[type] || 'secondary';
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
          Payment Methods
        </h2>
        <Button 
          variant="primary"
          onClick={() => { 
            setFormData({ name: '', icon: '', type: 'other', detailLabel: '' }); 
            setEditingPaymentMethod(null); 
            setShowModal(true); 
          }}
        >
          + Add Payment Method
        </Button>
      </div>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

      {/* Quick Add Common Payment Methods */}
      <Card className="mb-4" style={{ ...cardStyle, marginBottom: '24px' }}>
        <Card.Body style={{ padding: '20px' }}>
          <h5 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>Quick Add Common Payment Methods</h5>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {commonPaymentMethods.map((preset, index) => (
              <button
                key={index}
                onClick={() => handleQuickAdd(preset)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  backgroundColor: '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '14px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F9FAFB';
                  e.currentTarget.style.borderColor = '#3B82F6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.borderColor = '#E5E7EB';
                }}
              >
                <Icon icon={preset.icon} style={{ fontSize: '18px' }} />
                <span>{preset.name}</span>
              </button>
            ))}
          </div>
        </Card.Body>
      </Card>

      <Card style={cardStyle}>
        <Card.Body style={{ padding: '24px' }}>
          {loading ? (
            <div className="text-center" style={{ padding: '40px' }}>Loading...</div>
          ) : paymentMethods.length === 0 ? (
            <div className="text-center text-muted" style={{ padding: '40px' }}>No payment methods found</div>
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
                      Icon
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
                      Type
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
                      Detail Label
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
                  {paymentMethods.map((paymentMethod) => (
                    <tr 
                      key={paymentMethod._id}
                      style={{ 
                        borderBottom: '1px solid #E5E7EB',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '16px' }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #E5E7EB'
                        }}>
                          <Icon 
                            icon={paymentMethod.icon} 
                            style={{ fontSize: '20px' }} 
                          />
                        </div>
                      </td>
                      <td style={{ padding: '16px', color: '#111827', fontSize: '14px' }}>
                        {paymentMethod.name}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ 
                          fontSize: '12px',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontWeight: 500,
                          display: 'inline-block',
                          backgroundColor: getTypeColor(paymentMethod.type) === 'primary' ? '#DBEAFE' :
                                         getTypeColor(paymentMethod.type) === 'info' ? '#DBEAFE' :
                                         getTypeColor(paymentMethod.type) === 'success' ? '#D1FAE5' :
                                         getTypeColor(paymentMethod.type) === 'warning' ? '#FEF3C7' :
                                         '#F3F4F6',
                          color: getTypeColor(paymentMethod.type) === 'primary' ? '#1E40AF' :
                                getTypeColor(paymentMethod.type) === 'info' ? '#1E40AF' :
                                getTypeColor(paymentMethod.type) === 'success' ? '#065F46' :
                                getTypeColor(paymentMethod.type) === 'warning' ? '#92400E' :
                                '#374151'
                        }}>
                          {paymentMethod.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '16px', color: '#6B7280', fontSize: '14px' }}>
                        {paymentMethod.detailLabel || '-'}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <IconButton type="edit" onClick={() => handleEdit(paymentMethod)} />
                          <IconButton type="delete" onClick={() => handleDelete(paymentMethod._id)} />
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
        onClose={() => { setShowModal(false); setEditingPaymentMethod(null); }}
        title={editingPaymentMethod ? 'Edit Payment Method' : 'Add Payment Method'}
        size="md"
      >
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Name *</Form.Label>
            <Form.Control
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., VISA, GPay, Cash"
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Icon (Iconify Icon Name) *</Form.Label>
            <Form.Control
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="e.g., logos:visa, mdi:cash, logos:google-pay"
              required
            />
            <Form.Text className="text-muted">
              Use iconify icon names. Preview: {formData.icon && (
                <Icon icon={formData.icon} style={{ fontSize: '20px', marginLeft: '8px' }} />
              )}
            </Form.Text>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Type *</Form.Label>
            <Select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              options={[
                { value: 'card', label: 'Card' },
                { value: 'digital_wallet', label: 'Digital Wallet' },
                { value: 'cash', label: 'Cash' },
                { value: 'bank', label: 'Bank' },
                { value: 'other', label: 'Other' }
              ]}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Detail Label</Form.Label>
            <Form.Control
              type="text"
              value={formData.detailLabel}
              onChange={(e) => setFormData({ ...formData, detailLabel: e.target.value })}
              placeholder="e.g., Last 4 digits, GPay ID, Account Number"
            />
            <Form.Text className="text-muted">
              This label will appear when users enter details for this payment method in transactions
            </Form.Text>
          </Form.Group>
          <div className="d-flex justify-content-end gap-2 mt-4" style={{ gap: '8px' }}>
            <Button variant="secondary" onClick={() => { setShowModal(false); setEditingPaymentMethod(null); }}>Cancel</Button>
            <Button variant="primary" type="submit">{editingPaymentMethod ? 'Update' : 'Create'}</Button>
          </div>
        </Form>
      </Modal>

      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => { setShowConfirmModal(false); setDeletingId(null); }}
        onConfirm={confirmDelete}
        title="Delete Payment Method"
        message="Are you sure you want to delete this payment method? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default PaymentMethods;

