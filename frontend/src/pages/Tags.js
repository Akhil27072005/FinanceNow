import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Form, Alert } from 'react-bootstrap';
import { tagService } from '../services/tagService';
import { transactionService } from '../services/transactionService';
import { analyticsService } from '../services/analyticsService';
import { TAG_COLOR_PRESETS, DEFAULT_TAG_COLOR } from '../constants/tagColors';
import {
  getCurrentMonthKey,
  formatTagCurrency,
  aggregateTagUsageFromTransactions,
  fetchMonthExpenseTransactions,
  mergeTagChartAmounts
} from '../utils/tagStatsUtils';
import { getMonthDateRange } from '../utils/dateUtils';
import Modal from '../components/ui/Modal';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import Button from '../components/ui/Button';
import DatePicker from '../components/ui/DatePicker';
import TagNavList from '../components/tags/TagNavList';
import TagDetailPanel from '../components/tags/TagDetailPanel';
import { useAuth } from '../contexts/AuthContext';
import '../styles/tags.css';
import '../styles/modal-glass.css';

const MONTHS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const emptyForm = () => ({ name: '', color: DEFAULT_TAG_COLOR });

const Tags = () => {
  const { user } = useAuth();
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState('');
  const [monthKey, setMonthKey] = useState(getCurrentMonthKey);
  const [activeTagId, setActiveTagId] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('amount');
  const [countsByTag, setCountsByTag] = useState({});
  const [amountsByTag, setAmountsByTag] = useState({});
  const [taggedSpendTotal, setTaggedSpendTotal] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingTag, setEditingTag] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const monthLabel = useMemo(() => {
    const [y, m] = monthKey.split('-').map(Number);
    if (!y || !m) return monthKey;
    return `${MONTHS_LONG[m - 1]} ${y}`;
  }, [monthKey]);

  const loadTagsAndStats = useCallback(async () => {
    try {
      setLoading(true);
      const [tagsRes, chartRes, expenseTxns] = await Promise.all([
        tagService.getTags(),
        analyticsService.getCharts('expense', 'tagBased', { month: monthKey }),
        fetchMonthExpenseTransactions(transactionService, monthKey)
      ]);

      const tagList = tagsRes.data || [];
      setTags(tagList);

      const chartRows = chartRes.success ? chartRes.data || [] : [];
      const chartAmounts = mergeTagChartAmounts(chartRows);
      const { counts, amounts } = aggregateTagUsageFromTransactions(expenseTxns);

      const mergedAmounts = { ...amounts };
      Object.entries(chartAmounts).forEach(([id, amt]) => {
        mergedAmounts[id] = amt;
      });

      const totalTagged = Object.values(mergedAmounts).reduce((s, v) => s + v, 0);
      setCountsByTag(counts);
      setAmountsByTag(mergedAmounts);
      setTaggedSpendTotal(totalTagged);

      if (tagList.length > 0) {
        setActiveTagId((prev) =>
          tagList.some((t) => t._id === prev) ? prev : tagList[0]._id
        );
      } else {
        setActiveTagId('');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load tags');
    } finally {
      setLoading(false);
    }
  }, [monthKey]);

  useEffect(() => {
    loadTagsAndStats();
  }, [loadTagsAndStats]);

  const activeTag = useMemo(
    () => tags.find((t) => t._id === activeTagId) || null,
    [tags, activeTagId]
  );

  const statsByTagId = useMemo(() => {
    const map = {};
    tags.forEach((tag) => {
      const amount = amountsByTag[tag._id] ?? 0;
      const count = countsByTag[tag._id] ?? 0;
      map[tag._id] = {
        amount,
        count,
        amountLabel: amount > 0 ? formatTagCurrency(amount) : '—'
      };
    });
    return map;
  }, [tags, amountsByTag, countsByTag, user?.preferences]);

  const filteredSortedTags = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = tags;
    if (q) {
      list = list.filter((t) => t.name.toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'count') {
        return (countsByTag[b._id] || 0) - (countsByTag[a._id] || 0);
      }
      return (amountsByTag[b._id] || 0) - (amountsByTag[a._id] || 0);
    });
  }, [tags, search, sortBy, countsByTag, amountsByTag]);

  const loadTagDetail = useCallback(async (tagId) => {
    if (!tagId) {
      setRecentTransactions([]);
      return;
    }
    try {
      setLoadingDetail(true);
      const { startDate, endDate } = getMonthDateRange(monthKey);
      const res = await transactionService.getTransactions({
        tag: tagId,
        type: 'expense',
        limit: 5,
        page: 1,
        startDate,
        endDate
      });
      setRecentTransactions(res.data || []);
    } catch {
      setRecentTransactions([]);
    } finally {
      setLoadingDetail(false);
    }
  }, [monthKey]);

  useEffect(() => {
    loadTagDetail(activeTagId);
  }, [activeTagId, loadTagDetail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name.trim(),
        color: formData.color || null
      };
      if (editingTag) {
        await tagService.updateTag(editingTag._id, payload);
      } else {
        await tagService.createTag(payload);
      }
      setShowModal(false);
      setFormData(emptyForm());
      setEditingTag(null);
      loadTagsAndStats();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save tag');
    }
  };

  const handleDelete = (id) => {
    setDeletingId(id);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    try {
      await tagService.deleteTag(deletingId);
      if (activeTagId === deletingId) setActiveTagId('');
      loadTagsAndStats();
      setDeletingId(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete tag');
      setDeletingId(null);
    }
  };

  const openCreate = () => {
    setEditingTag(null);
    setFormData(emptyForm());
    setShowModal(true);
  };

  const handleEdit = (tag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      color: tag.color || DEFAULT_TAG_COLOR
    });
    setShowModal(true);
  };

  const activeStats = activeTag
    ? {
        amount: amountsByTag[activeTag._id] ?? 0,
        count: countsByTag[activeTag._id] ?? 0
      }
    : null;

  return (
    <div className="tags-page">
      <div className="tags-page__header">
        <h1 className="tags-page__title">Tags</h1>
        <div className="tags-page__month">
          <p className="tags-page__month-label">Insights period</p>
          <DatePicker
            selected={monthKey}
            onChange={setMonthKey}
            showMonthYearPicker
            placeholder="Select month"
            calendarClassName="tags-month-picker__calendar"
          />
        </div>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible className="mb-3">
          {error}
        </Alert>
      )}

      <div className="tags-page__layout">
        <TagNavList
          tags={filteredSortedTags}
          activeTagId={activeTagId}
          onSelect={setActiveTagId}
          onAdd={openCreate}
          onEdit={handleEdit}
          onDelete={handleDelete}
          search={search}
          onSearchChange={setSearch}
          sortBy={sortBy}
          onSortChange={setSortBy}
          statsByTagId={statsByTagId}
          loading={loading}
        />
        <TagDetailPanel
          tag={activeTag}
          stats={activeStats}
          recentTransactions={recentTransactions}
          loading={loading}
          loadingDetail={loadingDetail}
          monthLabel={monthLabel}
          taggedSpendTotal={taggedSpendTotal}
        />
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingTag(null);
        }}
        title={editingTag ? 'Edit tag' : 'Add tag'}
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
            <Form.Label>Color</Form.Label>
            <Form.Control
              type="color"
              value={formData.color || DEFAULT_TAG_COLOR}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            />
            <div className="tag-color-presets" role="group" aria-label="Color presets">
              {TAG_COLOR_PRESETS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`tag-color-presets__btn ${
                    formData.color === color ? 'tag-color-presets__btn--selected' : ''
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData({ ...formData, color })}
                  aria-label={`Color ${color}`}
                />
              ))}
            </div>
          </Form.Group>
          <div className="modal-glass__actions">
            <Button
              variant="secondary"
              type="button"
              onClick={() => {
                setShowModal(false);
                setEditingTag(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingTag ? 'Update' : 'Create'}
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
        title="Delete Tag"
        message="Are you sure you want to delete this tag? It will be removed from transactions that use it."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default Tags;
