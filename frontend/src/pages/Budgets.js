import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Form } from 'react-bootstrap';
import { budgetService } from '../services/budgetService';
import { categoryService } from '../services/categoryService';
import { subcategoryService } from '../services/subcategoryService';
import Modal from '../components/ui/Modal';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import DatePicker from '../components/ui/DatePicker';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import { useUserFormatters } from '../hooks/useUserFormatters';
import GlassAlert from '../components/ui/GlassAlert';
import BudgetMonthHeader from '../components/budgets/BudgetMonthHeader';
import BudgetKpiStrip from '../components/budgets/BudgetKpiStrip';
import BudgetCardGrid from '../components/budgets/BudgetCardGrid';
import '../styles/budgets.css';

const Budgets = () => {
  const { formatCurrency } = useUserFormatters();
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const monthRef = useRef(month);
  monthRef.current = month;
  const [slideDirection, setSlideDirection] = useState(0);
  const [budgets, setBudgets] = useState([]);
  const [spentByBudgetId, setSpentByBudgetId] = useState({});
  const [totals, setTotals] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingBudget, setEditingBudget] = useState(null);
  const [autoCreating, setAutoCreating] = useState(false);
  const [formData, setFormData] = useState({
    categoryId: '',
    subCategoryId: '',
    amount: '',
    month: new Date().toISOString().slice(0, 7)
  });

  useEffect(() => {
    (async () => {
      try {
        const [categoriesRes, subcategoriesRes] = await Promise.all([
          categoryService.getCategories('expense'),
          subcategoryService.getSubCategories()
        ]);
        setCategories(categoriesRes.data || []);
        setSubcategories(subcategoriesRes.data || []);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load categories');
      }
    })();
  }, []);

  const handleChangeMonth = useCallback((newMonth, direction) => {
    if (newMonth === month) return;
    setSlideDirection(direction ?? (newMonth > month ? 1 : -1));
    setMonth(newMonth);
    setTotals(null);
    setSuccess('');
    setError('');
  }, [month]);

  const loadSummary = useCallback(async () => {
    const targetMonth = month;
    try {
      setLoading(true);
      setError('');
      setBudgets([]);
      setSpentByBudgetId({});
      setTotals(null);

      const res = await budgetService.getBudgetSummary(targetMonth);
      if (targetMonth !== monthRef.current) return;

      setBudgets(res?.budgets || []);
      setSpentByBudgetId(res?.spentByBudgetId || {});
      setTotals(res?.totals || null);
    } catch (err) {
      if (targetMonth === monthRef.current) {
        setError(err.response?.data?.error || 'Failed to load data');
      }
    } finally {
      if (targetMonth === monthRef.current) {
        setLoading(false);
      }
    }
  }, [month]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const prevMonth = useMemo(() => {
    const [y, m] = month.split('-').map(Number);
    if (!y || !m) return month;
    const d = new Date(y, m - 2, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }, [month]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      const data = {
        ...formData,
        amount: parseFloat(formData.amount),
        categoryId: formData.categoryId || null,
        subCategoryId: formData.subCategoryId || null,
        month: formData.month
      };
      if (editingBudget) {
        await budgetService.updateBudget(editingBudget._id, data);
      } else {
        await budgetService.createBudget(data);
      }
      setShowModal(false);
      resetForm();
      await loadSummary();
      setSuccess(editingBudget ? 'Budget updated.' : 'Budget created.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save budget');
    }
  };

  const handleDelete = (budget) => {
    setDeletingId(budget?._id);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    try {
      await budgetService.deleteBudget(deletingId);
      await loadSummary();
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

  const handleAutoCreate = async () => {
    try {
      setAutoCreating(true);
      setError('');
      setSuccess('');
      const res = await budgetService.autoCreateBudgets({ fromMonth: prevMonth, toMonth: month });
      await loadSummary();
      setSuccess(`Auto-created ${res.createdCount || 0} budget(s). Skipped ${res.skippedCount || 0}.`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to auto-create budgets');
    } finally {
      setAutoCreating(false);
    }
  };

  const resetForm = () => {
    setEditingBudget(null);
    setFormData({
      categoryId: '',
      subCategoryId: '',
      amount: '',
      month
    });
  };

  return (
    <div className="budgets-page">
      <BudgetMonthHeader
        month={month}
        onChangeMonth={handleChangeMonth}
        onAddBudget={() => {
          resetForm();
          setShowModal(true);
        }}
        onAutoCreate={handleAutoCreate}
        autoCreating={autoCreating}
      />

      {error ? (
        <GlassAlert variant="danger" onClose={() => setError('')} className="mb-0">
          {error}
        </GlassAlert>
      ) : null}

      {success ? (
        <GlassAlert variant="success" onClose={() => setSuccess('')} className="mb-0">
          {success}
        </GlassAlert>
      ) : null}

      <BudgetKpiStrip totals={totals} formatCurrency={formatCurrency} loading={loading} />

      <div className="budgets-cards-viewport">
        <div
          key={month}
          className={`budgets-cards-panel ${
            slideDirection > 0
              ? 'budgets-cards-panel--from-next'
              : slideDirection < 0
                ? 'budgets-cards-panel--from-prev'
                : ''
          }`.trim()}
        >
          <BudgetCardGrid
            budgets={budgets}
            month={month}
            spentByBudgetId={spentByBudgetId}
            formatCurrency={formatCurrency}
            loading={loading}
            onAddBudget={() => {
              resetForm();
              setShowModal(true);
            }}
            onEditBudget={handleEdit}
            onDeleteBudget={handleDelete}
          />
        </div>
      </div>

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
          <div className="modal-glass__actions modal-glass__actions--right">
            <Button glass variant="secondary" type="button" onClick={() => { setShowModal(false); resetForm(); }}>
              Cancel
            </Button>
            <Button glass variant="primary" type="submit">
              {editingBudget ? 'Update' : 'Create'}
            </Button>
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

