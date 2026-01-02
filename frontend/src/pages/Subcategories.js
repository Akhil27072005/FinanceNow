import React, { useState, useEffect } from 'react';
import { Card, Table, Form, Alert } from 'react-bootstrap';
import { subcategoryService } from '../services/subcategoryService';
import { categoryService } from '../services/categoryService';
import { cardStyle } from '../styles/cardStyles';
import Modal from '../components/ui/Modal';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import IconButton from '../components/ui/IconButton';

const Subcategories = () => {
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', categoryId: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subcategoriesRes, categoriesRes] = await Promise.all([
        subcategoryService.getSubCategories(),
        categoryService.getCategories()
      ]);
      setSubcategories(subcategoriesRes.data || []);
      setCategories(categoriesRes.data || []);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load data');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSubcategory) {
        await subcategoryService.updateSubCategory(editingSubcategory._id, formData);
      } else {
        await subcategoryService.createSubCategory(formData);
      }
      setShowModal(false);
      setFormData({ name: '', categoryId: '' });
      setEditingSubcategory(null);
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save subcategory');
    }
  };

  const handleDelete = (id) => {
    setDeletingId(id);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    try {
      await subcategoryService.deleteSubCategory(deletingId);
      loadData();
      setDeletingId(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete subcategory');
      setDeletingId(null);
    }
  };

  const handleEdit = (subcategory) => {
    setEditingSubcategory(subcategory);
    setFormData({ name: subcategory.name, categoryId: subcategory.categoryId?._id || subcategory.categoryId || '' });
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
          Subcategories
        </h2>
        <Button 
          variant="primary"
          onClick={() => { setFormData({ name: '', categoryId: '' }); setEditingSubcategory(null); setShowModal(true); }}
        >
          + Add Subcategory
        </Button>
      </div>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

      <Card style={cardStyle}>
        <Card.Body style={{ padding: '24px' }}>
          {loading ? (
            <div className="text-center" style={{ padding: '40px' }}>Loading...</div>
          ) : subcategories.length === 0 ? (
            <div className="text-center text-muted" style={{ padding: '40px' }}>No subcategories found</div>
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
                      Category
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
                  {subcategories.map((subcategory) => (
                    <tr 
                      key={subcategory._id}
                      style={{ 
                        borderBottom: '1px solid #E5E7EB',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '16px', color: '#111827', fontSize: '14px' }}>
                        {subcategory.name}
                      </td>
                      <td style={{ padding: '16px', color: '#6B7280', fontSize: '14px' }}>
                        {subcategory.categoryId?.name || '-'}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <IconButton type="edit" onClick={() => handleEdit(subcategory)} />
                          <IconButton type="delete" onClick={() => handleDelete(subcategory._id)} />
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
        onClose={() => { setShowModal(false); setEditingSubcategory(null); }}
        title={editingSubcategory ? 'Edit Subcategory' : 'Add Subcategory'}
      >
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Category *</Form.Label>
            <Select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              options={[
                { value: '', label: 'Select Category' },
                ...categories.map(cat => ({ value: cat._id, label: cat.name }))
              ]}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Name *</Form.Label>
            <Form.Control
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </Form.Group>
          <div className="d-flex justify-content-end gap-2 mt-4" style={{ gap: '8px' }}>
            <Button variant="secondary" onClick={() => { setShowModal(false); setEditingSubcategory(null); }}>Cancel</Button>
            <Button variant="primary" type="submit">{editingSubcategory ? 'Update' : 'Create'}</Button>
          </div>
        </Form>
      </Modal>

      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => { setShowConfirmModal(false); setDeletingId(null); }}
        onConfirm={confirmDelete}
        title="Delete Subcategory"
        message="Are you sure you want to delete this subcategory? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default Subcategories;

