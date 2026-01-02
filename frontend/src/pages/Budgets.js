import React, { useState, useEffect } from 'react';
import { Card, Table, Form, Alert, Badge, Row, Col } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import { budgetService } from '../services/budgetService';
import { categoryService } from '../services/categoryService';
import { subcategoryService } from '../services/subcategoryService';
import { transactionService } from '../services/transactionService';
import { cardStyle } from '../styles/cardStyles';
import Modal from '../components/ui/Modal';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import DatePicker from '../components/ui/DatePicker';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import IconButton from '../components/ui/IconButton';

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingBudget, setEditingBudget] = useState(null);
  const [formData, setFormData] = useState({
    categoryId: '',
    subCategoryId: '',
    amount: '',
    month: new Date().toISOString().slice(0, 7)
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [budgetsRes, categoriesRes, subcategoriesRes, transactionsRes] = await Promise.all([
        budgetService.getBudgets(),
        categoryService.getCategories('expense'),
        subcategoryService.getSubCategories(),
        transactionService.getTransactions({ type: 'expense' })
      ]);

      setBudgets(budgetsRes.data || []);
      setCategories(categoriesRes.data || []);
      setSubcategories(subcategoriesRes.data || []);
      setTransactions(transactionsRes.data || []);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load data');
      setLoading(false);
    }
  };

  const calculateSpent = (budget) => {
    const monthStart = new Date(budget.month + '-01');
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
    
    const relevantTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      if (tDate < monthStart || tDate > monthEnd) return false;
      
      if (budget.categoryId) {
        return t.categoryId?._id === budget.categoryId?._id || t.categoryId === budget.categoryId?._id;
      }
      if (budget.subCategoryId) {
        return t.subCategoryId?._id === budget.subCategoryId?._id || t.subCategoryId === budget.subCategoryId?._id;
      }
      return false;
    });

    return relevantTransactions.reduce((sum, t) => sum + t.amount, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        amount: parseFloat(formData.amount),
        categoryId: formData.categoryId || null,
        subCategoryId: formData.subCategoryId || null
      };
      if (editingBudget) {
        await budgetService.updateBudget(editingBudget._id, data);
      } else {
        await budgetService.createBudget(data);
      }
      setShowModal(false);
      resetForm();
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save budget');
    }
  };

  const handleDelete = (id) => {
    setDeletingId(id);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    try {
      await budgetService.deleteBudget(deletingId);
      loadData();
      setDeletingId(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete budget');
      setDeletingId(null);
    }
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setFormData({
      categoryId: budget.categoryId?._id || budget.categoryId || '',
      subCategoryId: budget.subCategoryId?._id || budget.subCategoryId || '',
      amount: budget.amount,
      month: budget.month
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingBudget(null);
    setFormData({
      categoryId: '',
      subCategoryId: '',
      amount: '',
      month: new Date().toISOString().slice(0, 7)
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

  const getBudgetStatus = (budget) => {
    const spent = calculateSpent(budget);
    const percentage = (spent / budget.amount) * 100;
    if (percentage >= 100) return { color: 'danger', text: 'Exceeded' };
    if (percentage >= 80) return { color: 'warning', text: 'Warning' };
    return { color: 'success', text: 'On Track' };
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
          Budgets
        </h2>
        <Button 
          variant="primary"
          onClick={() => { resetForm(); setShowModal(true); }}
        >
          + Add Budget
        </Button>
      </div>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

      <Card style={cardStyle}>
        <Card.Body style={{ padding: '24px' }}>
          {loading ? (
            <div className="text-center" style={{ padding: '40px' }}>Loading...</div>
          ) : budgets.length === 0 ? (
            <div className="text-center text-muted" style={{ padding: '40px' }}>No budgets found</div>
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
                      Month
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
                      Category/SubCategory
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
                      Budget
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
                      Spent
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
                      Remaining
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
                  {budgets.map((budget) => {
                    const spent = calculateSpent(budget);
                    const remaining = budget.amount - spent;
                    const status = getBudgetStatus(budget);
                    const getStatusStyle = (statusColor) => {
                      const styles = {
                        danger: { backgroundColor: '#FEE2E2', color: '#991B1B' },
                        warning: { backgroundColor: '#FEF3C7', color: '#92400E' },
                        success: { backgroundColor: '#D1FAE5', color: '#065F46' }
                      };
                      return styles[statusColor] || { backgroundColor: '#F3F4F6', color: '#374151' };
                    };
                    return (
                      <tr 
                        key={budget._id}
                        style={{ 
                          borderBottom: '1px solid #E5E7EB',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <td style={{ padding: '16px', color: '#111827', fontSize: '14px' }}>
                          {budget.month}
                        </td>
                        <td style={{ padding: '16px', color: '#6B7280', fontSize: '14px' }}>
                          {budget.categoryId?.name || budget.subCategoryId?.name || '-'}
                          {budget.subCategoryId && ` (${budget.subCategoryId.name})`}
                        </td>
                        <td style={{ padding: '16px', fontWeight: 500, color: '#111827', fontSize: '14px' }}>
                          {formatCurrency(budget.amount)}
                        </td>
                        <td style={{ padding: '16px', color: '#6B7280', fontSize: '14px' }}>
                          {formatCurrency(spent)}
                        </td>
                        <td style={{ 
                          padding: '16px', 
                          color: remaining < 0 ? '#DC2626' : '#059669', 
                          fontWeight: 500,
                          fontSize: '14px'
                        }}>
                          {formatCurrency(remaining)}
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{ 
                            fontSize: '12px',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontWeight: 500,
                            display: 'inline-block',
                            ...getStatusStyle(status.color)
                          }}>
                            {status.text}
                          </span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button
                              onClick={() => handleEdit(budget)}
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
                              onClick={() => handleDelete(budget._id)}
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
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); resetForm(); }}
        title={editingBudget ? 'Edit Budget' : 'Add Budget'}
      >
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Month *</Form.Label>
            <DatePicker
              selected={formData.month}
              onChange={(date) => setFormData({ ...formData, month: date })}
              placeholder="Select month"
              showMonthYearPicker
              required
            />
          </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value, subCategoryId: '' })}
                options={[
                  { value: '', label: 'Select Category' },
                  ...categories.map(cat => ({ value: cat._id, label: cat.name }))
                ]}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>SubCategory</Form.Label>
              <Select
                value={formData.subCategoryId}
                onChange={(e) => setFormData({ ...formData, subCategoryId: e.target.value, categoryId: '' })}
                disabled={!!formData.categoryId}
                options={[
                  { value: '', label: 'Select SubCategory' },
                  ...subcategories
                    .filter(sc => !formData.categoryId || sc.categoryId?._id === formData.categoryId || sc.categoryId === formData.categoryId)
                    .map(subcat => ({ value: subcat._id, label: subcat.name }))
                ]}
              />
              <Form.Text className="text-muted">Either Category or SubCategory must be selected</Form.Text>
            </Form.Group>
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
          <div className="d-flex justify-content-end gap-2 mt-4" style={{ gap: '8px' }}>
            <Button variant="secondary" onClick={() => { setShowModal(false); resetForm(); }}>Cancel</Button>
            <Button variant="primary" type="submit">{editingBudget ? 'Update' : 'Create'}</Button>
          </div>
        </Form>
      </Modal>

      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => { setShowConfirmModal(false); setDeletingId(null); }}
        onConfirm={confirmDelete}
        title="Delete Budget"
        message="Are you sure you want to delete this budget? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default Budgets;

