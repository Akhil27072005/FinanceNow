import React, { useState, useEffect, useMemo } from 'react';
import { Alert } from 'react-bootstrap';
import { paymentMethodService } from '../services/paymentMethodService';
import Modal from '../components/ui/Modal';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import Button from '../components/ui/Button';
import CardPaymentMethodRow from '../components/payment-methods/CardPaymentMethodRow';
import CardPaymentMethodForm from '../components/payment-methods/CardPaymentMethodForm';
import OtherPaymentMethodRow from '../components/payment-methods/OtherPaymentMethodRow';
import OtherPaymentMethodForm from '../components/payment-methods/OtherPaymentMethodForm';
import '../styles/payment-methods.css';
import '../styles/modal-glass.css';

const OTHER_QUICK_ADD = [
  { label: 'Add GPay', preset: { name: 'Google Pay', type: 'digital_wallet', icon: 'logos:google-pay' } },
  { label: 'Add UPI', preset: { name: 'UPI', type: 'digital_wallet', icon: 'mdi:bank-transfer' } },
  { label: 'Add PhonePe', preset: { name: 'PhonePe', type: 'digital_wallet', icon: 'mdi:cellphone' } },
  { label: 'Add cash', preset: { name: 'Cash', type: 'cash', icon: 'mdi:cash' } },
  { label: 'Add bank transfer', preset: { name: 'Bank transfer', type: 'bank', icon: 'mdi:bank-transfer' } }
];

const OTHER_GROUP_ORDER = [
  { key: 'digital_wallet', label: 'Digital wallets' },
  { key: 'bank', label: 'Bank & transfers' },
  { key: 'cash', label: 'Cash' },
  { key: 'other', label: 'Other' }
];

const PaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCardModal, setShowCardModal] = useState(false);
  const [showOtherModal, setShowOtherModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingCard, setEditingCard] = useState(null);
  const [editingOther, setEditingOther] = useState(null);
  const [otherPreset, setOtherPreset] = useState(null);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await paymentMethodService.getPaymentMethods();
      setPaymentMethods(response.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const cards = useMemo(
    () => paymentMethods.filter((m) => m.type === 'card'),
    [paymentMethods]
  );

  const otherMethods = useMemo(
    () => paymentMethods.filter((m) => m.type !== 'card'),
    [paymentMethods]
  );

  const otherByGroup = useMemo(() => {
    const map = { digital_wallet: [], bank: [], cash: [], other: [] };
    otherMethods.forEach((m) => {
      const key = map[m.type] ? m.type : 'other';
      map[key].push(m);
    });
    return map;
  }, [otherMethods]);

  const saveMethod = async (payload, editing) => {
    try {
      if (editing) {
        await paymentMethodService.updatePaymentMethod(editing._id, payload);
      } else {
        await paymentMethodService.createPaymentMethod(payload);
      }
      await loadPaymentMethods();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save payment method');
      throw err;
    }
  };

  const handleCardSubmit = async (payload) => {
    try {
      await saveMethod(payload, editingCard);
      setShowCardModal(false);
      setEditingCard(null);
    } catch {
      /* error set */
    }
  };

  const handleOtherSubmit = async (payload) => {
    try {
      await saveMethod(payload, editingOther);
      setShowOtherModal(false);
      setEditingOther(null);
      setOtherPreset(null);
    } catch {
      /* error set */
    }
  };

  const handleDelete = (id) => {
    setDeletingId(id);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    try {
      await paymentMethodService.deletePaymentMethod(deletingId);
      await loadPaymentMethods();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete payment method');
    } finally {
      setDeletingId(null);
    }
  };

  const openAddCard = () => {
    setEditingCard(null);
    setShowCardModal(true);
  };

  const openEditCard = (method) => {
    setEditingCard(method);
    setShowCardModal(true);
  };

  const openAddOther = (preset = null) => {
    setEditingOther(null);
    setOtherPreset(preset);
    setShowOtherModal(true);
  };

  const openEditOther = (method) => {
    setEditingOther(method);
    setOtherPreset(null);
    setShowOtherModal(true);
  };

  const renderOtherTable = (methods) => (
    <div className="payment-methods-table-wrap">
      <table className="payment-methods-table">
        <thead>
          <tr>
            <th>Method</th>
            <th>Identifier</th>
            <th>Linked bank</th>
            <th>Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {methods.map((method) => (
            <OtherPaymentMethodRow
              key={method._id}
              method={method}
              onEdit={openEditOther}
              onDelete={handleDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="payment-methods-page">
      <div className="payment-methods-page__header">
        <h1 className="payment-methods-page__title">Payment methods</h1>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible className="mb-3">
          {error}
        </Alert>
      )}

      <section className="glass-panel payment-methods-section">
        <div className="payment-methods-section__head">
          <h2 className="payment-methods-section__title">Cards</h2>
          <Button variant="primary" glass onClick={openAddCard}>
            + Add card
          </Button>
        </div>

        {loading ? (
          <div className="payment-methods-empty">Loading…</div>
        ) : cards.length === 0 ? (
          <div className="payment-methods-empty">
            No cards yet. Add a card to see network and bank logos.
          </div>
        ) : (
          <div className="payment-methods-table-wrap">
            <table className="payment-methods-table">
              <thead>
                <tr>
                  <th>Card</th>
                  <th>Type</th>
                  <th>Bank</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cards.map((method) => (
                  <CardPaymentMethodRow
                    key={method._id}
                    method={method}
                    onEdit={openEditCard}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="glass-panel payment-methods-section">
        <div className="payment-methods-section__head">
          <h2 className="payment-methods-section__title">Other methods</h2>
          <Button variant="primary" glass onClick={() => openAddOther(null)}>
            + Add method
          </Button>
        </div>

        <div className="payment-methods-quick">
          {OTHER_QUICK_ADD.map((item) => (
            <button
              key={item.label}
              type="button"
              className="payment-methods-quick__chip"
              onClick={() => openAddOther(item.preset)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="payment-methods-empty">Loading…</div>
        ) : otherMethods.length === 0 ? (
          <div className="payment-methods-empty">
            No wallets, bank transfers, or cash methods yet.
          </div>
        ) : (
          OTHER_GROUP_ORDER.map(({ key, label }) => {
            const group = otherByGroup[key];
            if (!group?.length) return null;
            return (
              <div key={key} className="payment-methods-group">
                <p className="payment-methods-group__label">{label}</p>
                {renderOtherTable(group)}
              </div>
            );
          })
        )}
      </section>

      <Modal
        isOpen={showCardModal}
        onClose={() => {
          setShowCardModal(false);
          setEditingCard(null);
        }}
        title={editingCard ? 'Edit card' : 'Add card'}
        size="md"
      >
        <CardPaymentMethodForm
          editing={Boolean(editingCard)}
          initial={editingCard}
          onSubmit={handleCardSubmit}
          onCancel={() => {
            setShowCardModal(false);
            setEditingCard(null);
          }}
        />
      </Modal>

      <Modal
        isOpen={showOtherModal}
        onClose={() => {
          setShowOtherModal(false);
          setEditingOther(null);
          setOtherPreset(null);
        }}
        title={editingOther ? 'Edit payment method' : 'Add payment method'}
        size="md"
      >
        <OtherPaymentMethodForm
          editing={Boolean(editingOther)}
          initial={editingOther}
          preset={otherPreset}
          onSubmit={handleOtherSubmit}
          onCancel={() => {
            setShowOtherModal(false);
            setEditingOther(null);
            setOtherPreset(null);
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
        title="Delete payment method"
        message="Are you sure you want to delete this payment method? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default PaymentMethods;
