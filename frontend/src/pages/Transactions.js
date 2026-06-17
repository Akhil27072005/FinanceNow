import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Plus } from 'lucide-react';
import { mapTransactionToFormData } from '../utils/transactionDisplayUtils';
import { transactionService } from '../services/transactionService';
import { useUserFormatters } from '../hooks/useUserFormatters';
import { categoryService } from '../services/categoryService';
import { subcategoryService } from '../services/subcategoryService';
import { tagService } from '../services/tagService';
import { paymentMethodService } from '../services/paymentMethodService';
import Modal from '../components/ui/Modal';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import DatePicker from '../components/ui/DatePicker';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import GlassAlert from '../components/ui/GlassAlert';
import TransactionRow from '../components/transactions/TransactionRow';
import TransactionDetailDrawer from '../components/transactions/TransactionDetailDrawer';
import TransactionForm from '../components/transactions/TransactionForm';
import '../styles/transactions.css';
import '../styles/transactions-modal.css';
import '../styles/payment-methods.css';
import '../styles/modal-glass.css';

const TYPE_TABS = [
  { value: '', label: 'All' },
  { value: 'expense', label: 'Expense' },
  { value: 'income', label: 'Income' },
  { value: 'savings', label: 'Savings' },
  { value: 'investment', label: 'Investment' }
];

/**
 * Transactions Page
 * Full CRUD for transactions
 */
const Transactions = () => {
  const { formatCurrency, formatDate } = useUserFormatters();
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('categoryId') || '';
  const subCategoryFromUrl = searchParams.get('subCategoryId') || '';
  const startDateFromUrl = searchParams.get('startDate') || '';
  const endDateFromUrl = searchParams.get('endDate') || '';
  const typeFromUrl = searchParams.get('type') || '';

  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [filtersExpanded, setFiltersExpanded] = useState(
    Boolean(startDateFromUrl || endDateFromUrl || categoryFromUrl || subCategoryFromUrl)
  );
  const moreFiltersRef = useRef(null);
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
  const [isDuplicate, setIsDuplicate] = useState(false);
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
    type: typeFromUrl,
    startDate: startDateFromUrl,
    endDate: endDateFromUrl,
    categoryId: categoryFromUrl,
    subCategoryId: subCategoryFromUrl
  });
  const typeTabsRef = useRef(null);
  const typeTabRefs = useRef({});
  const [typeTabIndicator, setTypeTabIndicator] = useState({ left: 0, width: 0, ready: false });

  const updateTypeTabIndicator = useCallback(() => {
    const container = typeTabsRef.current;
    const activeKey = filters.type || 'all';
    const activeTab = typeTabRefs.current[activeKey];
    if (!container || !activeTab) return;

    const containerRect = container.getBoundingClientRect();
    const tabRect = activeTab.getBoundingClientRect();
    setTypeTabIndicator({
      left: tabRect.left - containerRect.left + container.scrollLeft,
      width: tabRect.width,
      ready: true
    });
  }, [filters.type]);

  useLayoutEffect(() => {
    updateTypeTabIndicator();
  }, [updateTypeTabIndicator]);

  useEffect(() => {
    window.addEventListener('resize', updateTypeTabIndicator);
    return () => window.removeEventListener('resize', updateTypeTabIndicator);
  }, [updateTypeTabIndicator]);

  useEffect(() => {
    const container = typeTabsRef.current;
    if (!container) return undefined;

    const observer = new ResizeObserver(updateTypeTabIndicator);
    observer.observe(container);
    return () => observer.disconnect();
  }, [updateTypeTabIndicator]);

  useEffect(() => {
    setFilters((prev) => {
      const next = {
        ...prev,
        categoryId: categoryFromUrl,
        subCategoryId: subCategoryFromUrl,
        startDate: startDateFromUrl,
        endDate: endDateFromUrl,
        type: typeFromUrl
      };
      if (
        prev.categoryId === next.categoryId &&
        prev.subCategoryId === next.subCategoryId &&
        prev.startDate === next.startDate &&
        prev.endDate === next.endDate &&
        prev.type === next.type
      ) {
        return prev;
      }
      return next;
    });
    setCurrentPage(1);
  }, [categoryFromUrl, subCategoryFromUrl, startDateFromUrl, endDateFromUrl, typeFromUrl]);

  useEffect(() => {
    if (!filtersExpanded) return undefined;
    const handlePointerDown = (e) => {
      const target = e.target;
      if (moreFiltersRef.current?.contains(target)) return;
      if (target.closest?.('.react-datepicker-popper')) return;
      if (target.closest?.('[role="menu"]')) return;
      setFiltersExpanded(false);
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [filtersExpanded]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [revealedCount, setRevealedCount] = useState(0);
  const [useStreamAnimation, setUseStreamAnimation] = useState(false);
  const streamRevealRef = useRef(true);
  const revealTimerRef = useRef(null);

  const clearRevealTimer = useCallback(() => {
    if (revealTimerRef.current) {
      window.clearTimeout(revealTimerRef.current);
      revealTimerRef.current = null;
    }
  }, []);

  const startStreamReveal = useCallback(
    (total) => {
      clearRevealTimer();
      if (total <= 0) {
        setRevealedCount(0);
        return;
      }
      if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setRevealedCount(total);
        setUseStreamAnimation(false);
        return;
      }
      setUseStreamAnimation(true);
      let count = 0;
      const step = () => {
        count += 1;
        setRevealedCount(count);
        if (count < total) {
          revealTimerRef.current = window.setTimeout(step, 18);
        } else {
          revealTimerRef.current = window.setTimeout(() => setUseStreamAnimation(false), 280);
        }
      };
      step();
    },
    [clearRevealTimer]
  );

  useEffect(() => () => clearRevealTimer(), [clearRevealTimer]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const transactionsRes = await transactionService.getTransactions({
        ...filters,
        page: currentPage,
        limit: itemsPerPage
      });

      const [categoriesRes, subcategoriesRes, tagsRes, paymentMethodsRes] = await Promise.all([
        categoryService.getCategories(),
        subcategoryService.getSubCategories(),
        tagService.getTags(),
        paymentMethodService.getPaymentMethods()
      ]);

      setTransactions(transactionsRes.data || []);
      setTotalTransactions(transactionsRes.pagination?.total || transactionsRes.data?.length || 0);
      setCategories(categoriesRes.data || []);
      setSubcategories(subcategoriesRes.data || []);
      setTags(tagsRes.data || []);
      setPaymentMethods(paymentMethodsRes.data || []);

      const total = transactionsRes.data?.length || 0;
      if (streamRevealRef.current) {
        streamRevealRef.current = false;
        startStreamReveal(total);
      } else {
        setRevealedCount(total);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load data');
      setRevealedCount(0);
      setUseStreamAnimation(false);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, itemsPerPage, startStreamReveal]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
      setSelectedTransaction(null);
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save transaction');
    }
  };

  const handleDelete = (id) => {
    setSelectedTransaction(null);
    setDeletingId(id);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    try {
      await transactionService.deleteTransaction(deletingId);
      if (selectedTransaction?._id === deletingId) setSelectedTransaction(null);
      loadData();
      setDeletingId(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete transaction');
      setDeletingId(null);
    }
  };

  const handleEdit = (transaction) => {
    setIsDuplicate(false);
    setEditingTransaction(transaction);
    setFormData(mapTransactionToFormData(transaction));
    setShowModal(true);
  };

  const openAdd = () => {
    resetForm();
    setIsDuplicate(false);
    setShowModal(true);
  };

  const handleDuplicate = (transaction) => {
    setSelectedTransaction(null);
    setEditingTransaction(null);
    setIsDuplicate(true);
    setFormData(mapTransactionToFormData(transaction, { useTodayDate: true }));
    setShowModal(true);
  };

  const handleDrawerDuplicate = (transaction) => {
    setSelectedTransaction(null);
    handleDuplicate(transaction);
  };

  const resetForm = () => {
    setEditingTransaction(null);
    setIsDuplicate(false);
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

  const hasAdvancedFilters =
    filters.startDate || filters.endDate || filters.categoryId || filters.subCategoryId;

  const hasAnyFilters = Boolean(filters.type || hasAdvancedFilters);

  const clearAllFilters = () => {
    setFilters({
      type: '',
      startDate: '',
      endDate: '',
      categoryId: '',
      subCategoryId: ''
    });
    setFiltersExpanded(false);
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  useEffect(() => {
    streamRevealRef.current = true;
    setRevealedCount(0);
    setUseStreamAnimation(false);
    clearRevealTimer();
  }, [filters, currentPage, clearRevealTimer]);

  // Calculate total pages from total transactions count (server-side pagination)
  const totalPages = Math.ceil(totalTransactions / itemsPerPage);
  // Use transactions directly (already paginated from server)
  const paginatedTransactions = transactions;
  const visibleTransactions = paginatedTransactions.slice(0, revealedCount);

  const buildPaginationPages = () => {
    const pages = [];
    if (totalPages <= 8) {
      for (let i = 1; i <= totalPages; i += 1) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('ellipsis-start');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i += 1) {
        if (i !== 1 && i !== totalPages) pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('ellipsis-end');
      if (totalPages > 1) pages.push(totalPages);
    }
    return pages;
  };

  const handleDrawerEdit = (transaction) => {
    setSelectedTransaction(null);
    handleEdit(transaction);
  };

  return (
    <div className="transactions-page">
      <header className="transactions-page__header">
        <h1 className="transactions-page__title">Transactions</h1>
        <div className="transactions-page__header-actions">
          <Button variant="primary" glass onClick={openAdd} type="button" className="transactions-page__add-btn">
            <Plus size={18} strokeWidth={2.5} />
            New transaction
          </Button>
        </div>
      </header>

      {error && (
        <GlassAlert variant="danger" onClose={() => setError('')} dismissible className="mb-3">
          {error}
        </GlassAlert>
      )}

      <div className="glass-panel transactions-filters">
        <div className="transactions-filters__bar">
          <div
            className="transactions-filters__tabs"
            ref={typeTabsRef}
            role="tablist"
            aria-label="Transaction type"
          >
            <span
              className={`transactions-filters__tab-indicator ${
                typeTabIndicator.ready ? 'transactions-filters__tab-indicator--ready' : ''
              }`}
              style={{
                width: typeTabIndicator.width,
                transform: `translateX(${typeTabIndicator.left}px)`
              }}
              aria-hidden
            />
            {TYPE_TABS.map((tab) => {
              const tabKey = tab.value || 'all';
              return (
                <button
                  key={tabKey}
                  ref={(el) => {
                    typeTabRefs.current[tabKey] = el;
                  }}
                  type="button"
                  role="tab"
                  aria-selected={filters.type === tab.value}
                  className={`transactions-filters__tab ${
                    filters.type === tab.value ? 'transactions-filters__tab--active' : ''
                  }`}
                  onClick={() =>
                    setFilters({ ...filters, type: tab.value, categoryId: '', subCategoryId: '' })
                  }
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="transactions-filters__bar-end">
            {hasAnyFilters ? (
              <button type="button" className="transactions-filters__clear" onClick={clearAllFilters}>
                Clear all
              </button>
            ) : null}

            <div className="transactions-filters__more-wrap" ref={moreFiltersRef}>
              <button
                type="button"
                className={`transactions-filters__more-toggle ${
                  filtersExpanded ? 'transactions-filters__more-toggle--open' : ''
                } ${hasAdvancedFilters ? 'transactions-filters__more-toggle--active' : ''}`}
                onClick={() => setFiltersExpanded((v) => !v)}
                aria-expanded={filtersExpanded}
                aria-haspopup="true"
              >
                {filtersExpanded ? (
                  <>
                    Filters <ChevronUp size={14} strokeWidth={2} />
                  </>
                ) : (
                  <>
                    More filters
                    {hasAdvancedFilters ? ' · On' : ''}
                    <ChevronDown size={14} strokeWidth={2} />
                  </>
                )}
              </button>

              <div
                className={`transactions-filters__popover popover-reveal ${
                  filtersExpanded ? 'popover-reveal--open' : ''
                }`}
                role="dialog"
                aria-label="More filters"
                aria-hidden={!filtersExpanded}
              >
                  <p className="transactions-filters__popover-title">Filter transactions</p>
                  <div className="transactions-filters__popover-grid">
                    <label className="transactions-filters__field">
                      <span className="transactions-filters__label">Start date</span>
                      <DatePicker
                        glass
                        selected={filters.startDate}
                        onChange={(date) => setFilters({ ...filters, startDate: date })}
                        placeholder="Start date"
                        wrapperClassName="transactions-filters__datepicker"
                      />
                    </label>
                    <label className="transactions-filters__field">
                      <span className="transactions-filters__label">End date</span>
                      <DatePicker
                        glass
                        selected={filters.endDate}
                        onChange={(date) => setFilters({ ...filters, endDate: date })}
                        placeholder="End date"
                        wrapperClassName="transactions-filters__datepicker"
                      />
                    </label>
                    <label className="transactions-filters__field transactions-filters__field--wide">
                      <span className="transactions-filters__label">Category</span>
                      <Select
                        glass
                        value={filters.categoryId}
                        onChange={(e) =>
                          setFilters({ ...filters, categoryId: e.target.value, subCategoryId: '' })
                        }
                        options={[
                          { value: '', label: 'All categories' },
                          ...categories
                            .filter((c) => !filters.type || c.type === filters.type)
                            .map((cat) => ({ value: cat._id, label: cat.name }))
                        ]}
                      />
                    </label>
                    <label className="transactions-filters__field transactions-filters__field--wide">
                      <span className="transactions-filters__label">Subcategory</span>
                      <Select
                        glass
                        value={filters.subCategoryId || ''}
                        onChange={(e) => setFilters({ ...filters, subCategoryId: e.target.value })}
                        disabled={!filters.categoryId}
                        options={[
                          { value: '', label: 'All subcategories' },
                          ...subcategories
                            .filter(
                              (sc) =>
                                sc.categoryId?._id === filters.categoryId ||
                                sc.categoryId === filters.categoryId
                            )
                            .map((sub) => ({ value: sub._id, label: sub.name }))
                        ]}
                      />
                    </label>
                  </div>
                  <div className="transactions-filters__popover-foot">
                    <button
                      type="button"
                      className="transactions-filters__clear transactions-filters__clear--inline"
                      onClick={clearAllFilters}
                    >
                      Clear all filters
                    </button>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel transactions-list">
        {loading ? (
          <p className="transactions-loading">Loading transactions…</p>
        ) : transactions.length === 0 ? (
          <p className="transactions-empty">No transactions found</p>
        ) : (
          <div className="transactions-list__grid">
            <div className="transactions-list__header">
              <span>Category</span>
              <div className="txn-row__meta txn-row__meta--header">
                <span className="txn-row__date">Date</span>
                <span className="txn-row__amount">Amount</span>
                <span className="txn-row__payment">
                  <span className="txn-row__payment-name">Payment</span>
                </span>
              </div>
              <span />
            </div>
            {visibleTransactions.map((transaction) => (
              <TransactionRow
                key={transaction._id}
                transaction={transaction}
                streamIn={useStreamAnimation}
                isSelected={selectedTransaction?._id === transaction._id}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
                onSelect={setSelectedTransaction}
                onEdit={handleDrawerEdit}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
              />
            ))}
          </div>
        )}

        {!loading && transactions.length > 0 && (
          <nav className="transactions-pagination" aria-label="Transactions pagination">
            <button
              type="button"
              className="transactions-pagination__btn"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              <ChevronLeft size={18} strokeWidth={2} />
            </button>
            {buildPaginationPages().map((page, idx) => {
              if (page === 'ellipsis-start' || page === 'ellipsis-end') {
                return (
                  <span key={`ellipsis-${idx}`} className="transactions-pagination__ellipsis">
                    …
                  </span>
                );
              }
              return (
                <button
                  key={page}
                  type="button"
                  className={`transactions-pagination__btn ${
                    currentPage === page ? 'transactions-pagination__btn--active' : ''
                  }`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              );
            })}
            <button
              type="button"
              className="transactions-pagination__btn"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              <ChevronRight size={18} strokeWidth={2} />
            </button>
          </nav>
        )}
      </div>

      <TransactionDetailDrawer
        transaction={selectedTransaction}
        paymentMethods={paymentMethods}
        isOpen={Boolean(selectedTransaction)}
        onClose={() => setSelectedTransaction(null)}
        onEdit={handleDrawerEdit}
        onDelete={handleDelete}
        onDuplicate={handleDrawerDuplicate}
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); resetForm(); }}
        title={
          editingTransaction
            ? 'Edit transaction'
            : isDuplicate
              ? 'Duplicate transaction'
              : 'New transaction'
        }
        size="lg"
      >
        <TransactionForm
          formData={formData}
          setFormData={setFormData}
          categories={categories}
          subcategories={subcategories}
          tags={tags}
          paymentMethods={paymentMethods}
          isDuplicate={isDuplicate}
          editing={Boolean(editingTransaction)}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowModal(false);
            resetForm();
          }}
        />
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

