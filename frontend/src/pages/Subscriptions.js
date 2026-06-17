import React, { useState, useEffect, useMemo, useCallback, useRef, Suspense, lazy } from 'react';
import { Alert } from 'react-bootstrap';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { subscriptionService } from '../services/subscriptionService';
import { categoryService } from '../services/categoryService';
import { paymentMethodService } from '../services/paymentMethodService';
import Modal from '../components/ui/Modal';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import Button from '../components/ui/Button';
import DatePicker from '../components/ui/DatePicker';
import SubscriptionKpiStrip from '../components/subscriptions/SubscriptionKpiStrip';
import SubscriptionRow from '../components/subscriptions/SubscriptionRow';
import {
  sortActiveSubscriptions,
  sortInactiveSubscriptions
} from '../utils/subscriptionDisplayUtils';
import '../styles/subscriptions.css';
import '../styles/modal-glass.css';

const SubscriptionForm = lazy(() => import('../components/subscriptions/SubscriptionForm'));
const SubscriptionHistoryDrawer = lazy(
  () => import('../components/subscriptions/SubscriptionHistoryDrawer')
);

const Subscriptions = () => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [subscriptions, setSubscriptions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [animateIn, setAnimateIn] = useState(false);
  const hasAnimatedRef = useRef(false);
  const isInitialLoad = useRef(true);
  const [modalDataLoading, setModalDataLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [historySubscription, setHistorySubscription] = useState(null);
  const [inactiveCollapsed, setInactiveCollapsed] = useState(false);
  const [markingPaidId, setMarkingPaidId] = useState(null);

  const modalDataLoadedRef = useRef(false);
  const isInitialMonthRef = useRef(true);
  const selectedMonthRef = useRef(selectedMonth);
  selectedMonthRef.current = selectedMonth;

  const refreshSummary = useCallback(async (month = selectedMonthRef.current) => {
    try {
      setSummaryLoading(true);
      const summaryRes = await subscriptionService.getSummary(month, { skipAdvance: true });
      setSummary(summaryRes.summary || null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load subscription summary');
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  const refreshSubscriptions = useCallback(async () => {
    try {
      const subsRes = await subscriptionService.getSubscriptions(null, { skipAdvance: true });
      setSubscriptions(subsRes.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load subscriptions');
    }
  }, []);

  const loadPage = useCallback(async () => {
    try {
      if (isInitialLoad.current) {
        setLoading(true);
        setSummaryLoading(true);
      }
      setError('');

      const pageRes = await subscriptionService.getPage(selectedMonthRef.current);
      setSubscriptions(pageRes.data || []);
      setSummary(pageRes.summary || null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load subscriptions');
    } finally {
      setLoading(false);
      setSummaryLoading(false);
      if (!hasAnimatedRef.current) {
        hasAnimatedRef.current = true;
        setAnimateIn(true);
      }
      isInitialLoad.current = false;
    }
  }, []);

  const loadModalData = useCallback(async () => {
    if (modalDataLoadedRef.current) return;
    try {
      setModalDataLoading(true);
      const [categoriesRes, paymentMethodsRes] = await Promise.all([
        categoryService.getCategories('expense'),
        paymentMethodService.getPaymentMethods()
      ]);
      setCategories(categoriesRes.data || []);
      setPaymentMethods(paymentMethodsRes.data || []);
      modalDataLoadedRef.current = true;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load form options');
    } finally {
      setModalDataLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  useEffect(() => {
    loadModalData();
  }, [loadModalData]);

  useEffect(() => {
    if (isInitialMonthRef.current) {
      isInitialMonthRef.current = false;
      return;
    }
    refreshSummary(selectedMonth);
  }, [selectedMonth, refreshSummary]);

  const activeSubscriptions = useMemo(
    () => sortActiveSubscriptions(subscriptions.filter((s) => s.isActive)),
    [subscriptions]
  );

  const inactiveSubscriptions = useMemo(
    () => sortInactiveSubscriptions(subscriptions.filter((s) => !s.isActive)),
    [subscriptions]
  );

  const upsertSubscription = useCallback((updated) => {
    if (!updated?._id) return;
    setSubscriptions((prev) => {
      const idx = prev.findIndex((s) => s._id === updated._id);
      if (idx === -1) return [...prev, updated];
      const next = [...prev];
      next[idx] = updated;
      return next;
    });
  }, []);

  const handleSubmit = async (payload) => {
    try {
      if (editingSubscription) {
        const res = await subscriptionService.updateSubscription(editingSubscription._id, payload);
        upsertSubscription(res.data);
      } else {
        const res = await subscriptionService.createSubscription(payload);
        upsertSubscription(res.data);
      }
      setShowModal(false);
      setEditingSubscription(null);
      await refreshSummary();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save subscription');
      throw err;
    }
  };

  const handleDelete = (id) => {
    setDeletingId(id);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    try {
      await subscriptionService.deleteSubscription(deletingId);
      setSubscriptions((prev) => prev.filter((s) => s._id !== deletingId));
      await refreshSummary();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete subscription');
    } finally {
      setDeletingId(null);
    }
  };

  const openModal = (subscription = null) => {
    setEditingSubscription(subscription);
    setShowModal(true);
  };

  const handleMarkPaid = async (subscription) => {
    try {
      setMarkingPaidId(subscription._id);
      const res = await subscriptionService.markAsPaid(subscription._id);
      if (res.subscription) {
        upsertSubscription(res.subscription);
      } else {
        await refreshSubscriptions();
      }
      await refreshSummary();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to mark as paid');
    } finally {
      setMarkingPaidId(null);
    }
  };

  const handleToggleActive = async (subscription) => {
    try {
      const res = await subscriptionService.updateSubscription(subscription._id, {
        isActive: !subscription.isActive
      });
      upsertSubscription(res.data);
      await refreshSummary();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update subscription');
    }
  };

  const contentLoadedClass =
    animateIn && !loading ? 'subscriptions-section__content--loaded' : '';

  return (
    <div className="subscriptions-page">
      <div className="subscriptions-page__header">
        <h1 className="subscriptions-page__title">Subscriptions</h1>
        <div className="subscriptions-page__month">
          <DatePicker
            selected={selectedMonth}
            onChange={setSelectedMonth}
            showMonthYearPicker
            placeholder="Month"
            calendarClassName="subscriptions-month-picker__calendar"
          />
        </div>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible className="mb-3">
          {error}
        </Alert>
      )}

      <SubscriptionKpiStrip summary={summary} loading={summaryLoading} />

      <section className="glass-panel subscriptions-section">
        <div className="subscriptions-section__head">
          <h2 className="subscriptions-section__title">
            Active subscriptions
            <span className="subscriptions-section__count">({activeSubscriptions.length})</span>
          </h2>
          <Button variant="primary" glass onClick={() => openModal()}>
            + Add subscription
          </Button>
        </div>

        <div className={`subscriptions-section__content ${contentLoadedClass}`.trim()}>
        {loading ? (
          <div className="subscriptions-empty">Loading…</div>
        ) : activeSubscriptions.length === 0 ? (
          <div className="subscriptions-empty">
            No active subscriptions. Add one to track recurring spend.
          </div>
        ) : (
          <div className="subscriptions-list">
            {activeSubscriptions.map((sub, index) => (
              <SubscriptionRow
                key={sub._id}
                subscription={sub}
                rowIndex={index}
                onEdit={openModal}
                onDelete={handleDelete}
                onMarkPaid={handleMarkPaid}
                onToggleActive={handleToggleActive}
                onOpenHistory={setHistorySubscription}
                markingPaidId={markingPaidId}
              />
            ))}
          </div>
        )}
        </div>
      </section>

      {(inactiveSubscriptions.length > 0 || !loading) && (
        <section className="glass-panel subscriptions-section">
          <div className="subscriptions-section__head">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 className="subscriptions-section__title">
                Inactive subscriptions
                <span className="subscriptions-section__count">
                  ({inactiveSubscriptions.length})
                </span>
              </h2>
              {inactiveSubscriptions.length > 0 && (
                <button
                  type="button"
                  className="subscriptions-section__collapse"
                  onClick={() => setInactiveCollapsed((c) => !c)}
                  aria-expanded={!inactiveCollapsed}
                >
                  {inactiveCollapsed ? (
                    <>
                      Show <ChevronDown size={16} />
                    </>
                  ) : (
                    <>
                      Hide <ChevronUp size={16} />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          <div
            className={`expand-section subscriptions-section__expand ${
              !inactiveCollapsed ? 'expand-section--open' : ''
            }`}
          >
            <div className="expand-section__inner">
              <div className={`subscriptions-section__content ${contentLoadedClass}`.trim()}>
              {loading ? (
                <div className="subscriptions-empty">Loading…</div>
              ) : inactiveSubscriptions.length === 0 ? (
                <div className="subscriptions-empty">No inactive subscriptions.</div>
              ) : (
                <div className="subscriptions-list">
                  {inactiveSubscriptions.map((sub, index) => (
                    <SubscriptionRow
                      key={sub._id}
                      inactive
                      subscription={sub}
                      rowIndex={index}
                      onEdit={openModal}
                      onDelete={handleDelete}
                      onMarkPaid={handleMarkPaid}
                      onToggleActive={handleToggleActive}
                      onOpenHistory={setHistorySubscription}
                      markingPaidId={markingPaidId}
                    />
                  ))}
                </div>
              )}
              </div>
            </div>
          </div>
        </section>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingSubscription(null);
        }}
        title={editingSubscription ? 'Edit subscription' : 'Add subscription'}
        size="lg"
      >
        {showModal && modalDataLoading ? (
          <div className="subscriptions-empty">Loading form…</div>
        ) : (
          <Suspense fallback={<div className="subscriptions-empty">Loading form…</div>}>
            <SubscriptionForm
              editing={Boolean(editingSubscription)}
              initial={editingSubscription}
              categories={categories}
              paymentMethods={paymentMethods}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowModal(false);
                setEditingSubscription(null);
              }}
            />
          </Suspense>
        )}
      </Modal>

      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setDeletingId(null);
        }}
        onConfirm={confirmDelete}
        title="Delete subscription"
        message="Are you sure you want to delete this subscription? Payment history for this subscription will remain unless removed separately."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      <Suspense fallback={null}>
        <SubscriptionHistoryDrawer
          subscription={historySubscription}
          isOpen={Boolean(historySubscription)}
          onClose={() => setHistorySubscription(null)}
        />
      </Suspense>
    </div>
  );
};

export default Subscriptions;
