import React, { useState, useEffect } from 'react';
import { Card, Table, Form, Alert, Badge } from 'react-bootstrap';
import { categoryService } from '../services/categoryService';
import { cardStyle } from '../styles/cardStyles';
import Modal from '../components/ui/Modal';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import IconButton from '../components/ui/IconButton';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', type: 'expense' });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getCategories();
      setCategories(response.data || []);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load categories');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory._id, formData);
      } else {
        await categoryService.createCategory(formData);
      }
      setShowModal(false);
      setFormData({ name: '', type: 'expense' });
      setEditingCategory(null);
      loadCategories();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save category');
    }
  };

  const handleDelete = (id) => {
    setDeletingId(id);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    try {
      await categoryService.deleteCategory(deletingId);
      loadCategories();
      setDeletingId(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete category');
      setDeletingId(null);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, type: category.type });
    setShowModal(true);
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
          Categories
        </h2>
        <Button 
          variant="primary"
          onClick={() => { setFormData({ name: '', type: 'expense' }); setEditingCategory(null); setShowModal(true); }}
        >
          + Add Category
        </Button>
      </div>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

      <Card style={cardStyle}>
        <Card.Body style={{ padding: '24px' }}>
          {loading ? (
            <div className="text-center" style={{ padding: '40px' }}>Loading...</div>
          ) : categories.length === 0 ? (
            <div className="text-center text-muted" style={{ padding: '40px' }}>No categories found</div>
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
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr 
                      key={category._id}
                      style={{ 
                        borderBottom: '1px solid #E5E7EB',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '16px', color: '#111827', fontSize: '14px' }}>
                        {category.name}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ 
                          fontSize: '12px',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontWeight: 500,
                          display: 'inline-block',
                          backgroundColor: category.type === 'expense' ? '#FEE2E2' : '#D1FAE5',
                          color: category.type === 'expense' ? '#991B1B' : '#065F46'
                        }}>
                          {category.type.charAt(0).toUpperCase() + category.type.slice(1)}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <IconButton type="edit" onClick={() => handleEdit(category)} />
                          <IconButton type="delete" onClick={() => handleDelete(category._id)} />
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
        onClose={() => { setShowModal(false); setEditingCategory(null); }}
        title={editingCategory ? 'Edit Category' : 'Add Category'}
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
          <Form.Group className="mb-3">
            <Form.Label>Type *</Form.Label>
            <Select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              options={[
                { value: 'expense', label: 'Expense' },
                { value: 'income', label: 'Income' }
              ]}
              required
            />
          </Form.Group>
          <div className="d-flex justify-content-end gap-2 mt-4" style={{ gap: '8px' }}>
            <Button variant="secondary" onClick={() => { setShowModal(false); setEditingCategory(null); }}>Cancel</Button>
            <Button variant="primary" type="submit">{editingCategory ? 'Update' : 'Create'}</Button>
          </div>
        </Form>
      </Modal>

      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => { setShowConfirmModal(false); setDeletingId(null); }}
        onConfirm={confirmDelete}
        title="Delete Category"
        message="Are you sure you want to delete this category? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default Categories;

