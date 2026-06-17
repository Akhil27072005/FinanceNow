import React from 'react';
import PaymentMethodLogo from '../payment-methods/PaymentMethodLogo';
import IconButton from '../ui/IconButton';
import { useAuth } from '../../contexts/AuthContext';
import { useUserFormatters } from '../../hooks/useUserFormatters';
import {
  formatSubscriptionCurrency,
  formatBillingCycle,
  getSubscriptionLogoUrl,
  getSubscriptionStatusBadge,
  canMarkSubscriptionPaid,
  getSubscriptionReminderDays
} from '../../utils/subscriptionDisplayUtils';

const SubscriptionRow = ({
  subscription,
  inactive = false,
  rowIndex = 0,
  onEdit,
  onDelete,
  onMarkPaid,
  onToggleActive,
  onOpenHistory,
  markingPaidId
}) => {
  const { user } = useAuth();
  const { formatDate } = useUserFormatters();
  const reminderDays = getSubscriptionReminderDays(user);
  const showOverdue = user?.preferences?.overdueAlerts !== false;
  const badgeOptions = { reminderDays, showOverdue };

  const logoUrl = getSubscriptionLogoUrl(subscription);
  const badge = getSubscriptionStatusBadge(subscription, badgeOptions);
  const showMarkPaid = canMarkSubscriptionPaid(subscription, badgeOptions);
  const isMarking = markingPaidId === subscription._id;

  const initial = (subscription.name || '?').charAt(0).toUpperCase();

  return (
    <div
      className={`subscription-row ${inactive ? 'subscription-row--inactive' : ''}`}
      style={{ '--row-i': rowIndex }}
    >
      <div className="subscription-row__brand">
        <div className="subscription-row__logo">
          {logoUrl ? (
            <PaymentMethodLogo icon={logoUrl} size={28} />
          ) : (
            <span className="subscription-row__logo--letter">{initial}</span>
          )}
        </div>
        <div className="subscription-row__name-wrap">
          <p className="subscription-row__name">{subscription.name}</p>
          <p className="subscription-row__category">
            {subscription.categoryId?.name || '\u00a0'}
          </p>
        </div>
      </div>

      <div className="subscription-row__amount">
        {formatSubscriptionCurrency(subscription.amount, user?.preferences)}
      </div>

      <div className="subscription-row__meta">
        <div className="subscription-row__badges">
          <span className="subscription-row__badge-slot subscription-row__badge-slot--cycle">
            <span className="subscription-row__pill subscription-row__pill--cycle">
              {formatBillingCycle(subscription.billingCycle)}
            </span>
          </span>
          <span className="subscription-row__badge-slot subscription-row__badge-slot--auto">
            {subscription.autoRenew && !inactive ? (
              <span className="subscription-row__pill subscription-row__pill--auto">Auto-renew</span>
            ) : null}
          </span>
          <span className="subscription-row__badge-slot subscription-row__badge-slot--status">
            {badge === 'overdue' ? (
              <span className="subscription-row__pill subscription-row__pill--overdue">Overdue</span>
            ) : badge === 'due_soon' ? (
              <span className="subscription-row__pill subscription-row__pill--soon">Due soon</span>
            ) : null}
          </span>
        </div>
        <span className="subscription-row__date">
          Next: {formatDate(subscription.nextPaymentDate)}
        </span>
      </div>

      <div className="subscription-row__payment">
        {subscription.paymentMethodId ? (
          <div className="subscription-row__payment-inner">
            <PaymentMethodLogo icon={subscription.paymentMethodId.icon} size={18} />
            <span className="subscription-row__payment-name">
              {subscription.paymentMethodId.name}
            </span>
          </div>
        ) : (
          <span className="subscription-row__payment-name subscription-row__payment-name--empty">—</span>
        )}
      </div>

      <div className="subscription-row__actions">
        {!inactive && (
          <button
            type="button"
            className={`subscription-row__mark-paid${showMarkPaid ? '' : ' subscription-row__mark-paid--reserved'}`}
            disabled={!showMarkPaid || isMarking}
            tabIndex={showMarkPaid ? 0 : -1}
            aria-hidden={!showMarkPaid}
            onClick={() => showMarkPaid && onMarkPaid(subscription)}
          >
            {isMarking ? 'Saving…' : 'Mark paid'}
          </button>
        )}
        {!inactive && (
          <button
            type="button"
            className="subscription-row__toggle"
            onClick={() => onToggleActive(subscription)}
          >
            Deactivate
          </button>
        )}
        {inactive && (
          <button
            type="button"
            className="subscription-row__toggle"
            onClick={() => onToggleActive(subscription)}
          >
            Activate
          </button>
        )}
        <button
          type="button"
          className="subscription-row__history"
          onClick={() => onOpenHistory(subscription)}
        >
          History
        </button>
        <IconButton glass type="edit" onClick={() => onEdit(subscription)} />
        <IconButton glass type="delete" onClick={() => onDelete(subscription._id)} />
      </div>
    </div>
  );
};

export default SubscriptionRow;
