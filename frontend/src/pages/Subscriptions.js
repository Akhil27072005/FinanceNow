import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import SubscriptionForm from '../components/subscriptions/SubscriptionForm';
import SubscriptionHistoryDrawer from '../components/subscriptions/SubscriptionHistoryDrawer';
import {
  sortActiveSubscriptions,
  sortInactiveSubscriptions
} from '../utils/subscriptionDisplayUtils';
import '../styles/subscriptions.css';
import '../styles/modal-glass.css';

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
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [historySubscription, setHistorySubscription] = useState(null);
  const [inactiveCollapsed, setInactiveCollapsed] = useState(false);
  const [markingPaidId, setMarkingPaidId] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setSummaryLoading(true);
      setError('');

      const [subsRes, summaryRes, categoriesRes, paymentMethodsRes] = await Promise.all([
        subscriptionService.getSubscriptions(),
        subscriptionService.getSummary(selectedMonth),
        categoryService.getCategories('expense'),
        paymentMethodService.getPaymentMethods()
      ]);

      setSubscriptions(subsRes.data || []);
      setSummary(summaryRes.summary || null);
      setCategories(categoriesRes.data || []);
      setPaymentMethods(paymentMethodsRes.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load subscriptions');
    } finally {
      setLoading(false);
      setSummaryLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeSubscriptions = useMemo(
    () => sortActiveSubscriptions(subscriptions.filter((s) => s.isActive)),
    [subscriptions]
  );

  const inactiveSubscriptions = useMemo(
    () => sortInactiveSubscriptions(subscriptions.filter((s) => !s.isActive)),
    [subscriptions]
  );

  const handleSubmit = async (payload) => {
    try {
      if (editingSubscription) {
        await subscriptionService.updateSubscription(editingSubscription._id, payload);
      } else {
        await subscriptionService.createSubscription(payload);
      }
      setShowModal(false);
      setEditingSubscription(null);
      await loadData();
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
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete subscription');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (subscription) => {
    setEditingSubscription(subscription);
    setShowModal(true);
  };

  const openAdd = () => {
    setEditingSubscription(null);
    setShowModal(true);
  };

  const handleMarkPaid = async (subscription) => {
    try {
      setMarkingPaidId(subscription._id);
      await subscriptionService.markAsPaid(subscription._id);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to mark as paid');
    } finally {
      setMarkingPaidId(null);
    }
  };

  const handleToggleActive = async (subscription) => {
    try {
      await subscriptionService.updateSubscription(subscription._id, {
        isActive: !subscription.isActive
      });
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update subscription');
    }
  };

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
          <Button variant="primary" glass onClick={openAdd}>
            + Add subscription
          </Button>
        </div>

        {loading ? (
          <div className="subscriptions-empty">Loading…</div>
        ) : activeSubscriptions.length === 0 ? (
          <div className="subscriptions-empty">
            No active subscriptions. Add one to track recurring spend.
          </div>
        ) : (
          <div className="subscriptions-list">
            {activeSubscriptions.map((sub) => (
              <SubscriptionRow
                key={sub._id}
                subscription={sub}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onMarkPaid={handleMarkPaid}
                onToggleActive={handleToggleActive}
                onOpenHistory={setHistorySubscription}
                markingPaidId={markingPaidId}
              />
            ))}
          </div>
        )}
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

          {!inactiveCollapsed && (
            <>
              {loading ? (
                <div className="subscriptions-empty">Loading…</div>
              ) : inactiveSubscriptions.length === 0 ? (
                <div className="subscriptions-empty">No inactive subscriptions.</div>
              ) : (
                <div className="subscriptions-list">
                  {inactiveSubscriptions.map((sub) => (
                    <SubscriptionRow
                      key={sub._id}
                      inactive
                      subscription={sub}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onMarkPaid={handleMarkPaid}
                      onToggleActive={handleToggleActive}
                      onOpenHistory={setHistorySubscription}
                      markingPaidId={markingPaidId}
                    />
                  ))}
                </div>
              )}
            </>
          )}
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

      <SubscriptionHistoryDrawer
        subscription={historySubscription}
        isOpen={Boolean(historySubscription)}
        onClose={() => setHistorySubscription(null)}
      />
    </div>
  );
};

export default Subscriptions;
