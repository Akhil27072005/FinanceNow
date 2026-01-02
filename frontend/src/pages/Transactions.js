import React, { useState, useEffect } from 'react';
import { Card, Table, Form, Alert, Badge, Row, Col } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import { transactionService } from '../services/transactionService';
import { formatDateDDMMYYYY } from '../utils/dateUtils';
import { categoryService } from '../services/categoryService';
import { subcategoryService } from '../services/subcategoryService';
import { tagService } from '../services/tagService';
import { paymentMethodService } from '../services/paymentMethodService';
import { cardStyle } from '../styles/cardStyles';
import Modal from '../components/ui/Modal';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import DatePicker from '../components/ui/DatePicker';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import IconButton from '../components/ui/IconButton';

/**
 * Transactions Page
 * Full CRUD for transactions
 */
const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    categoryId: '',
    subCategoryId: '',
    tags: [],
    paymentMethodId: '',
    paymentMethodDetail: '',
    account: 'self',
    notes: ''
  });
  const [filters, setFilters] = useState({
    type: '',
    startDate: '',
    endDate: '',
    categoryId: '',
    tag: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [transactionsRes, categoriesRes, subcategoriesRes, tagsRes, paymentMethodsRes] = await Promise.all([
        transactionService.getTransactions(filters),
        categoryService.getCategories(),
        subcategoryService.getSubCategories(),
        tagService.getTags(),
        paymentMethodService.getPaymentMethods()
      ]);

      setTransactions(transactionsRes.data || []);
      setCategories(categoriesRes.data || []);
      setSubcategories(subcategoriesRes.data || []);
      setTags(tagsRes.data || []);
      setPaymentMethods(paymentMethodsRes.data || []);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load data');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTransaction) {
        await transactionService.updateTransaction(editingTransaction._id, formData);
      } else {
        await transactionService.createTransaction(formData);
      }
      setShowModal(false);
      resetForm();
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save transaction');
    }
  };

  const handleDelete = (id) => {
    setDeletingId(id);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    try {
      await transactionService.deleteTransaction(deletingId);
      loadData();
      setDeletingId(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete transaction');
      setDeletingId(null);
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      type: transaction.type,
      amount: transaction.amount,
      date: new Date(transaction.date).toISOString().split('T')[0],
      categoryId: transaction.categoryId?._id || '',
      subCategoryId: transaction.subCategoryId?._id || '',
      tags: transaction.tags?.map(t => t._id) || [],
      paymentMethodId: transaction.paymentMethodId?._id || '',
      paymentMethodDetail: transaction.paymentMethodDetail || '',
      account: transaction.account || 'self',
      notes: transaction.notes || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingTransaction(null);
    setFormData({
      type: 'expense',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      categoryId: '',
      subCategoryId: '',
      tags: [],
      paymentMethodId: '',
      paymentMethodDetail: '',
      account: 'self',
      notes: ''
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

  const getTypeColor = (type) => {
    const colors = {
      income: 'success',
      expense: 'danger',
      savings: 'info',
      investment: 'primary'
    };
    return colors[type] || 'secondary';
  };

  const getTypeBadgeStyle = (type) => {
    const styles = {
      income: {
        backgroundColor: '#D1FAE5',
        color: '#065F46',
        border: 'none'
      },
      expense: {
        backgroundColor: '#FEE2E2',
        color: '#991B1B',
        border: 'none'
      },
      savings: {
        backgroundColor: '#DBEAFE',
        color: '#1E40AF',
        border: 'none'
      },
      investment: {
        backgroundColor: '#E0E7FF',
        color: '#3730A3',
        border: 'none'
      }
    };
    return styles[type] || {
      backgroundColor: '#F3F4F6',
      color: '#374151',
      border: 'none'
    };
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = transactions.slice(startIndex, endIndex);

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
          Transactions
        </h2>
        <Button 
          variant="primary"
          onClick={() => { resetForm(); setShowModal(true); }}
        >
          + Add Transaction
        </Button>
      </div>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

      {/* Filters */}
      <Card className="mb-4" style={{ ...cardStyle, marginBottom: '24px' }}>
        <Card.Body style={{ padding: '20px' }}>
          <Row>
            <Col md={2}>
              <Select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                options={[
                  { value: '', label: 'All Types' },
                  { value: 'expense', label: 'Expense' },
                  { value: 'income', label: 'Income' },
                  { value: 'savings', label: 'Savings' },
                  { value: 'investment', label: 'Investment' }
                ]}
              />
            </Col>
            <Col md={2}>
              <DatePicker
                selected={filters.startDate}
                onChange={(date) => setFilters({ ...filters, startDate: date })}
                placeholder="Start Date"
              />
            </Col>
            <Col md={2}>
              <DatePicker
                selected={filters.endDate}
                onChange={(date) => setFilters({ ...filters, endDate: date })}
                placeholder="End Date"
              />
            </Col>
            <Col md={3}>
              <Select
                value={filters.categoryId}
                onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
                options={[
                  { value: '', label: 'All Categories' },
                  ...categories.filter(c => c.type === 'expense' || c.type === filters.type || !filters.type).map(cat => ({
                    value: cat._id,
                    label: cat.name
                  }))
                ]}
              />
            </Col>
            <Col md={3}>
              <Select
                value={filters.tag}
                onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
                options={[
                  { value: '', label: 'All Tags' },
                  ...tags.map(tag => ({ value: tag._id, label: tag.name }))
                ]}
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Transactions Table */}
      <Card style={cardStyle}>
        <Card.Body style={{ padding: '24px' }}>
          {loading ? (
            <div className="text-center" style={{ padding: '40px' }}>Loading...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center text-muted" style={{ padding: '40px' }}>No transactions found</div>
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
                      padding: '14px 20px', 
                      textAlign: 'left',
                      fontWeight: 500,
                      color: '#374151',
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      minWidth: '110px',
                      whiteSpace: 'nowrap'
                    }}>
                      Date
                    </th>
                    <th style={{ 
                      padding: '14px 20px', 
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
                      padding: '14px 20px', 
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
                      padding: '14px 20px', 
                      textAlign: 'left',
                      fontWeight: 500,
                      color: '#374151',
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      SubCategory
                    </th>
                    <th style={{ 
                      padding: '14px 20px', 
                      textAlign: 'left',
                      fontWeight: 500,
                      color: '#374151',
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Tags
                    </th>
                    <th style={{ 
                      padding: '14px 20px', 
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
                      padding: '14px 20px', 
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
                      padding: '14px 20px', 
                      textAlign: 'left',
                      fontWeight: 500,
                      color: '#374151',
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Notes
                    </th>
                    <th style={{ 
                      padding: '14px 20px', 
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
                  {paginatedTransactions.map((transaction) => {
                    const formattedDate = formatDateDDMMYYYY(transaction.date);
                    
                    return (
                      <tr 
                        key={transaction._id}
                        style={{ 
                          borderBottom: '1px solid #E5E7EB',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <td style={{ padding: '16px 20px', color: '#111827', fontSize: '14px', fontWeight: 400, whiteSpace: 'nowrap' }}>
                          {formattedDate}
                        </td>
                        <td style={{ padding: '16px 20px', fontWeight: 400, color: '#111827', fontSize: '14px' }}>
                          {formatCurrency(transaction.amount)}
                        </td>
                        <td style={{ padding: '16px 20px', color: '#6B7280', fontSize: '14px', fontWeight: 400 }}>
                          {transaction.categoryId?.name || '-'}
                        </td>
                        <td style={{ padding: '16px 20px', color: '#6B7280', fontSize: '14px', fontWeight: 400 }}>
                          {transaction.subCategoryId?.name || '-'}
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          {transaction.tags && transaction.tags.length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {transaction.tags.map((tag, index) => {
                                // Convert hex color to rgba with opacity for less brightness
                                const getMutedColor = (hex) => {
                                  if (!hex) return null;
                                  // Remove # if present
                                  const cleanHex = hex.replace('#', '');
                                  // Convert to RGB
                                  const r = parseInt(cleanHex.substring(0, 2), 16);
                                  const g = parseInt(cleanHex.substring(2, 4), 16);
                                  const b = parseInt(cleanHex.substring(4, 6), 16);
                                  // Return with 0.15 opacity for very muted background
                                  return `rgba(${r}, ${g}, ${b}, 0.15)`;
                                };
                                
                                const textColor = tag.color ? tag.color : '#6B7280';
                                
                                return (
                                  <span
                                    key={tag._id || index}
                                    style={{
                                      fontSize: '12px',
                                      padding: '4px 10px',
                                      borderRadius: '12px',
                                      fontWeight: 400,
                                      display: 'inline-block',
                                      backgroundColor: tag.color ? getMutedColor(tag.color) : '#F3F4F6',
                                      color: textColor,
                                      border: tag.color ? `1px solid ${tag.color}40` : '1px solid #E5E7EB'
                                    }}
                                  >
                                    {tag.name}
                                  </span>
                                );
                              })}
                            </div>
                          ) : (
                            <span style={{ color: '#6B7280', fontSize: '14px', fontWeight: 400 }}>-</span>
                          )}
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          {transaction.paymentMethodId ? (
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
                                  icon={transaction.paymentMethodId.icon} 
                                  style={{ fontSize: '20px' }} 
                                />
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                                <span style={{ color: '#111827', fontSize: '14px', fontWeight: 400, lineHeight: '1.2' }}>
                                  {transaction.paymentMethodId.detailLabel || transaction.paymentMethodId.name}
                                </span>
                                {transaction.paymentMethodDetail && (
                                  <span style={{ color: '#6B7280', fontSize: '12px', lineHeight: '1.2', fontWeight: 400 }}>
                                    {transaction.paymentMethodId.type === 'card' && /^\d{4}$/.test(transaction.paymentMethodDetail.trim())
                                      ? `**** ${transaction.paymentMethodDetail.trim()}`
                                      : transaction.paymentMethodDetail}
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span style={{ color: '#6B7280', fontSize: '14px', fontWeight: 400 }}>-</span>
                          )}
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{ 
                            fontSize: '12px',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontWeight: 500,
                            display: 'inline-block',
                            ...getTypeBadgeStyle(transaction.type)
                          }}>
                            {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px', color: '#6B7280', fontSize: '14px', fontWeight: 400, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {transaction.notes || '-'}
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button
                              onClick={() => handleEdit(transaction)}
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
                              onClick={() => handleDelete(transaction._id)}
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
          
          {/* Pagination */}
          {!loading && transactions.length > 0 && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              gap: '8px',
              marginTop: '24px',
              paddingTop: '16px',
              borderTop: '1px solid #E5E7EB'
            }}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                style={{
                  background: 'transparent',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  color: currentPage === 1 ? '#9CA3AF' : '#374151',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Icon icon="mdi:chevron-left" style={{ fontSize: '18px' }} />
              </button>
              
              {(() => {
                const pages = [];
                if (totalPages <= 8) {
                  // Show all pages if 8 or fewer
                  for (let i = 1; i <= totalPages; i++) {
                    pages.push(i);
                  }
                } else {
                  // Always show first page
                  pages.push(1);
                  
                  if (currentPage > 3) {
                    pages.push('ellipsis-start');
                  }
                  
                  // Show pages around current page
                  const start = Math.max(2, currentPage - 1);
                  const end = Math.min(totalPages - 1, currentPage + 1);
                  
                  for (let i = start; i <= end; i++) {
                    if (i !== 1 && i !== totalPages) {
                      pages.push(i);
                    }
                  }
                  
                  if (currentPage < totalPages - 2) {
                    pages.push('ellipsis-end');
                  }
                  
                  // Always show last page
                  if (totalPages > 1) {
                    pages.push(totalPages);
                  }
                }
                
                return pages.map((page, idx) => {
                  if (page === 'ellipsis-start' || page === 'ellipsis-end') {
                    return (
                      <span key={`ellipsis-${idx}`} style={{ padding: '0 4px', color: '#6B7280' }}>
                        ...
                      </span>
                    );
                  }
                  
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      style={{
                        background: currentPage === page ? '#3B82F6' : 'transparent',
                        border: '1px solid #E5E7EB',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        cursor: 'pointer',
                        color: currentPage === page ? '#FFFFFF' : '#374151',
                        fontWeight: currentPage === page ? 500 : 400,
                        minWidth: '36px'
                      }}
                    >
                      {page}
                    </button>
                  );
                });
              })()}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                style={{
                  background: 'transparent',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  color: currentPage === totalPages ? '#9CA3AF' : '#374151',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Icon icon="mdi:chevron-right" style={{ fontSize: '18px' }} />
              </button>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); resetForm(); }}
        title={editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
        size="lg"
      >
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Type *</Form.Label>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  options={[
                    { value: 'expense', label: 'Expense' },
                    { value: 'income', label: 'Income' },
                    { value: 'savings', label: 'Savings' },
                    { value: 'investment', label: 'Investment' }
                  ]}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
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
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Date *</Form.Label>
                <DatePicker
                  selected={formData.date}
                  onChange={(date) => setFormData({ ...formData, date })}
                  placeholder="Select date"
                  required
                />
              </Form.Group>
            </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Account</Form.Label>
                  <Select
                    value={formData.account}
                    onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                    options={[
                      { value: 'self', label: 'Self' },
                      { value: 'family', label: 'Family' }
                    ]}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value, subCategoryId: '' })}
                    options={[
                      { value: '', label: 'Select Category' },
                      ...categories.filter(c => c.type === formData.type || formData.type === 'income').map(cat => ({
                        value: cat._id,
                        label: cat.name
                      }))
                    ]}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>SubCategory</Form.Label>
                  <Select
                    value={formData.subCategoryId}
                    onChange={(e) => setFormData({ ...formData, subCategoryId: e.target.value })}
                    disabled={!formData.categoryId}
                    options={[
                      { value: '', label: 'Select SubCategory' },
                      ...subcategories
                        .filter(sc => sc.categoryId?._id === formData.categoryId || sc.categoryId === formData.categoryId)
                        .map(subcat => ({
                          value: subcat._id,
                          label: subcat.name
                        }))
                    ]}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tags</Form.Label>
                  <Form.Select
                    multiple
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: Array.from(e.target.selectedOptions, option => option.value) })}
                  >
                    {tags.map(tag => (
                      <option key={tag._id} value={tag._id}>{tag.name}</option>
                    ))}
                  </Form.Select>
                  <Form.Text className="text-muted">Hold Ctrl/Cmd to select multiple</Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
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
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
              />
            </Form.Group>
          <div className="d-flex justify-content-end gap-2 mt-4" style={{ gap: '8px' }}>
            <Button variant="secondary" onClick={() => { setShowModal(false); resetForm(); }}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingTransaction ? 'Update' : 'Create'}
            </Button>
          </div>
        </Form>
      </Modal>

      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => { setShowConfirmModal(false); setDeletingId(null); }}
        onConfirm={confirmDelete}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default Transactions;

