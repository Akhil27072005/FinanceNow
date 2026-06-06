import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Form, Alert } from 'react-bootstrap';
import { subcategoryService } from '../services/subcategoryService';
import { categoryService } from '../services/categoryService';
import {
  SUGGESTED_ICON_BY_TYPE,
  FALLBACK_CATEGORY_ICON
} from '../constants/categoryIcons';
import Modal from '../components/ui/Modal';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import CategoryNav from '../components/subcategories/CategoryNav';
import SubcategoryTileGrid from '../components/subcategories/SubcategoryTileGrid';
import SubcategoryIconPicker from '../components/subcategories/SubcategoryIconPicker';
import '../styles/subcategories.css';
import '../styles/categories.css';

const getCategoryId = (value) => {
  if (!value) return '';
  if (typeof value === 'object' && value._id) return value._id;
  return String(value);
};

const defaultIconForCategory = (category) => {
  if (!category) return FALLBACK_CATEGORY_ICON;
  return category.icon || SUGGESTED_ICON_BY_TYPE[category.type] || FALLBACK_CATEGORY_ICON;
};

const emptyForm = (categoryId = '', categories = []) => {
  const parent = categories.find((c) => c._id === categoryId);
  return {
    name: '',
    categoryId,
    icon: defaultIconForCategory(parent)
  };
};

const Subcategories = () => {
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeType, setActiveType] = useState('expense');
  const [activeCategoryId, setActiveCategoryId] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [formData, setFormData] = useState(() => emptyForm());

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [subcategoriesRes, categoriesRes] = await Promise.all([
        subcategoryService.getSubCategories(),
        categoryService.getCategories()
      ]);
      setSubcategories(subcategoriesRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const countsByCategory = useMemo(() => {
    const counts = {};
    subcategories.forEach((s) => {
      const id = getCategoryId(s.categoryId);
      if (id) counts[id] = (counts[id] || 0) + 1;
    });
    return counts;
  }, [subcategories]);

  const activeCategory = useMemo(
    () => categories.find((c) => c._id === activeCategoryId) || null,
    [categories, activeCategoryId]
  );

  const modalPickerCategoryType = useMemo(() => {
    const parent = categories.find((c) => c._id === formData.categoryId);
    return parent?.type || activeType;
  }, [categories, formData.categoryId, activeType]);

  const filteredSubcategories = useMemo(() => {
    if (!activeCategoryId) return [];
    return subcategories
      .filter((s) => getCategoryId(s.categoryId) === activeCategoryId)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [subcategories, activeCategoryId]);

  const ensureSelection = useCallback(
    (cats, type, currentCategoryId) => {
      const inType = cats.filter((c) => c.type === type).sort((a, b) => a.name.localeCompare(b.name));
      if (inType.length === 0) {
        const firstTypeWithCats = ['expense', 'income', 'savings', 'investment'].find(
          (t) => cats.some((c) => c.type === t)
        );
        if (firstTypeWithCats) {
          const fallback = cats
            .filter((c) => c.type === firstTypeWithCats)
            .sort((a, b) => a.name.localeCompare(b.name))[0];
          return { type: firstTypeWithCats, categoryId: fallback?._id || '' };
        }
        return { type, categoryId: '' };
      }
      const stillValid = inType.some((c) => c._id === currentCategoryId);
      return {
        type,
        categoryId: stillValid ? currentCategoryId : inType[0]._id
      };
    },
    []
  );

  useEffect(() => {
    if (loading || categories.length === 0) return;
    const { type, categoryId } = ensureSelection(categories, activeType, activeCategoryId);
    if (type !== activeType) setActiveType(type);
    if (categoryId !== activeCategoryId) setActiveCategoryId(categoryId);
  }, [loading, categories, activeType, activeCategoryId, ensureSelection]);

  const handleTypeChange = (type) => {
    setActiveType(type);
    const inType = categories
      .filter((c) => c.type === type)
      .sort((a, b) => a.name.localeCompare(b.name));
    if (inType.length > 0) {
      setActiveCategoryId(inType[0]._id);
    } else {
      setActiveCategoryId('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name.trim(),
        categoryId: formData.categoryId,
        icon: formData.icon
      };
      if (editingSubcategory) {
        await subcategoryService.updateSubCategory(editingSubcategory._id, payload);
      } else {
        await subcategoryService.createSubCategory(payload);
      }
      setShowModal(false);
      setFormData(emptyForm(activeCategoryId, categories));
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

  const openCreate = () => {
    setEditingSubcategory(null);
    setFormData(emptyForm(activeCategoryId, categories));
    setShowModal(true);
  };

  const handleEdit = (subcategory) => {
    setEditingSubcategory(subcategory);
    setFormData({
      name: subcategory.name,
      categoryId: getCategoryId(subcategory.categoryId),
      icon: subcategory.icon || defaultIconForCategory(
        categories.find((c) => c._id === getCategoryId(subcategory.categoryId))
      )
    });
    setShowModal(true);
  };

  const handleCategoryChange = (categoryId) => {
    const parent = categories.find((c) => c._id === categoryId);
    setFormData((prev) => ({
      ...prev,
      categoryId,
      icon: editingSubcategory ? prev.icon : defaultIconForCategory(parent)
    }));
  };

  const categorySelectOptions = useMemo(
    () =>
      [...categories]
        .sort((a, b) => {
          if (a.type !== b.type) return a.type.localeCompare(b.type);
          return a.name.localeCompare(b.name);
        })
        .map((cat) => ({
          value: cat._id,
          label: `${cat.name} (${cat.type})`
        })),
    [categories]
  );

  return (
    <div className="subcategories-page">
      <div className="subcategories-page__header">
        <h1 className="subcategories-page__title">Subcategories</h1>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible className="mb-3">
          {error}
        </Alert>
      )}

      <div className="subcategories-page__layout">
        <CategoryNav
          categories={categories}
          activeType={activeType}
          onTypeChange={handleTypeChange}
          activeCategoryId={activeCategoryId}
          onCategoryChange={setActiveCategoryId}
          countsByCategory={countsByCategory}
        />
        <SubcategoryTileGrid
          subcategories={filteredSubcategories}
          activeCategory={activeCategory}
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
          setEditingSubcategory(null);
        }}
        title={editingSubcategory ? 'Edit subcategory' : 'Add subcategory'}
      >
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Category *</Form.Label>
            <Select
              value={formData.categoryId}
              onChange={(e) => handleCategoryChange(e.target.value)}
              options={categorySelectOptions}
              placeholder="Select category"
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
          <SubcategoryIconPicker
            value={formData.icon}
            onChange={(icon) => setFormData({ ...formData, icon })}
            categoryType={modalPickerCategoryType}
          />
          <div className="modal-glass__actions">
            <Button
              variant="secondary"
              type="button"
              onClick={() => {
                setShowModal(false);
                setEditingSubcategory(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingSubcategory ? 'Update' : 'Create'}
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
