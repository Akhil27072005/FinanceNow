import React, { useState, useEffect, useMemo } from 'react';
import { Form, Alert } from 'react-bootstrap';
import { categoryService } from '../services/categoryService';
import {
  SUGGESTED_ICON_BY_TYPE,
  FALLBACK_CATEGORY_ICON
} from '../constants/categoryIcons';
import Modal from '../components/ui/Modal';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import CategoryTypeNav from '../components/categories/CategoryTypeNav';
import CategoryTileGrid from '../components/categories/CategoryTileGrid';
import CategoryIconPicker from '../components/categories/CategoryIconPicker';
import '../styles/categories.css';

const emptyForm = (type = 'expense') => ({
  name: '',
  type,
  icon: SUGGESTED_ICON_BY_TYPE[type] || FALLBACK_CATEGORY_ICON
});

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeType, setActiveType] = useState('expense');
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState(() => emptyForm('expense'));

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getCategories();
      setCategories(response.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const countsByType = useMemo(() => {
    const counts = { expense: 0, income: 0, savings: 0, investment: 0 };
    categories.forEach((c) => {
      if (counts[c.type] !== undefined) counts[c.type] += 1;
    });
    return counts;
  }, [categories]);

  const filteredCategories = useMemo(
    () =>
      categories
        .filter((c) => c.type === activeType)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [categories, activeType]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name.trim(),
        type: formData.type,
        icon: formData.icon
      };
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory._id, payload);
      } else {
        await categoryService.createCategory(payload);
      }
      setShowModal(false);
      setFormData(emptyForm(activeType));
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

  const openCreate = () => {
    setEditingCategory(null);
    setFormData(emptyForm(activeType));
    setShowModal(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      icon: category.icon || FALLBACK_CATEGORY_ICON
    });
    setShowModal(true);
  };

  const handleTypeChange = (type) => {
    setFormData((prev) => ({
      ...prev,
      type,
      icon: editingCategory ? prev.icon : SUGGESTED_ICON_BY_TYPE[type] || FALLBACK_CATEGORY_ICON
    }));
  };

  return (
    <div className="categories-page">
      <div className="categories-page__header">
        <h1 className="categories-page__title">Categories</h1>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible className="mb-3">
          {error}
        </Alert>
      )}

      <div className="categories-page__layout">
        <CategoryTypeNav
          activeType={activeType}
          onChange={setActiveType}
          counts={countsByType}
        />
        <CategoryTileGrid
          categories={filteredCategories}
          activeType={activeType}
          loading={loading}
          onAdd={openCreate}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingCategory(null);
        }}
        title={editingCategory ? 'Edit category' : 'Add category'}
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
              onChange={(e) => handleTypeChange(e.target.value)}
              options={[
                { value: 'expense', label: 'Expense' },
                { value: 'income', label: 'Income' },
                { value: 'savings', label: 'Savings' },
                { value: 'investment', label: 'Investment' }
              ]}
              required
            />
          </Form.Group>
          <CategoryIconPicker
            value={formData.icon}
            onChange={(icon) => setFormData({ ...formData, icon })}
            categoryType={formData.type}
          />
          <div className="modal-glass__actions">
            <Button
              variant="secondary"
              type="button"
              onClick={() => {
                setShowModal(false);
                setEditingCategory(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingCategory ? 'Update' : 'Create'}
            </Button>
          </div>
        </Form>
      </Modal>

      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setDeletingId(null);
        }}
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
