import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { subscriptionService } from '../../services/subscriptionService';
import { formatSubscriptionCurrency } from '../../utils/subscriptionDisplayUtils';
import { useAuth } from '../../contexts/AuthContext';
import { useUserFormatters } from '../../hooks/useUserFormatters';

const SubscriptionHistoryDrawer = ({ subscription, isOpen, onClose }) => {
  const { user } = useAuth();
  const { formatDate } = useUserFormatters();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || !subscription?._id) {
      setPayments([]);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const res = await subscriptionService.getPayments(subscription._id);
        if (!cancelled) {
          setPayments(res.data || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.error || 'Failed to load payment history');
          setPayments([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, subscription?._id]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const name = subscription?.name || 'Subscription';

  return (
    <div
      className={`subscription-history-drawer ${isOpen ? 'subscription-history-drawer--open' : ''}`}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        className="subscription-history-drawer__backdrop"
        aria-label="Close history"
        onClick={onClose}
      />
      <aside className="subscription-history-drawer__panel" role="dialog" aria-labelledby="sub-history-title">
        <div className="subscription-history-drawer__head">
          <div>
            <h2 id="sub-history-title" className="subscription-history-drawer__title">
              Payment history
            </h2>
            <p className="subscription-history-drawer__sub">{name}</p>
          </div>
          <button
            type="button"
            className="subscription-history-drawer__close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <p style={{ color: '#be123c', fontSize: 13, marginBottom: 12 }}>{error}</p>
        )}

        {loading ? (
          <p className="subscription-history-drawer__empty">Loading…</p>
        ) : payments.length === 0 ? (
          <p className="subscription-history-drawer__empty">No recorded payments yet.</p>
        ) : (
          <ul className="subscription-history-drawer__list">
            {payments.map((p) => (
              <li key={p.id} className="subscription-history-drawer__item">
                <div>
                  <div className="subscription-history-drawer__item-date">
                    {formatDate(p.billingDueDate)}
                  </div>
                  <div className="subscription-history-drawer__item-source">{p.source}</div>
                </div>
                <span className="subscription-history-drawer__item-amount">
                  {formatSubscriptionCurrency(p.amount, user?.preferences)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
};

export default SubscriptionHistoryDrawer;
