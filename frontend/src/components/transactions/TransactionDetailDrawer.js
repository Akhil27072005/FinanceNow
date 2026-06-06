import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, X } from 'lucide-react';
import { budgetService } from '../../services/budgetService';
import TransactionCategoryIcon from './TransactionCategoryIcon';
import PaymentMethodLogo from '../payment-methods/PaymentMethodLogo';
import Button from '../ui/Button';
import { useUserFormatters } from '../../hooks/useUserFormatters';
import {
  getCategorySubcategoryLine,
  formatTransactionAmountDisplay,
  findBudgetForTransaction,
  getTransactionMonthKey,
  getPaymentMethodDisplayName,
  getTransactionPaymentDrawerInfo,
  getTypeTone,
  mergeTransactionPaymentMethod
} from '../../utils/transactionDisplayUtils';
import { burnRateForMonth, getBudgetStatus } from '../../utils/budgetBurnRate';
import { getMutedTagColor } from '../../utils/tagStatsUtils';

const TransactionDetailDrawer = ({
  transaction,
  paymentMethods = [],
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onDuplicate
}) => {
  const { formatCurrency, formatDate } = useUserFormatters();
  const [budgetSummary, setBudgetSummary] = useState(null);
  const [budgetLoading, setBudgetLoading] = useState(false);

  const monthKey = useMemo(
    () => (transaction ? getTransactionMonthKey(transaction) : null),
    [transaction]
  );

  const transactionId = transaction?._id;
  const transactionType = transaction?.type;

  useEffect(() => {
    if (!isOpen || !transactionId || transactionType !== 'expense' || !monthKey) {
      setBudgetSummary(null);
      return undefined;
    }

    let cancelled = false;
    (async () => {
      try {
        setBudgetLoading(true);
        const res = await budgetService.getBudgetSummary(monthKey);
        if (!cancelled) setBudgetSummary(res);
      } catch {
        if (!cancelled) setBudgetSummary(null);
      } finally {
        if (!cancelled) setBudgetLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, transactionId, transactionType, monthKey]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const displayTransaction = useMemo(
    () => (transaction ? mergeTransactionPaymentMethod(transaction, paymentMethods) : null),
    [transaction, paymentMethods]
  );

  const budget = useMemo(() => {
    if (!transaction || !budgetSummary?.budgets) return null;
    return findBudgetForTransaction(transaction, budgetSummary.budgets);
  }, [transaction, budgetSummary]);

  const spent = budget
    ? budgetSummary?.spentByBudgetId?.[budget._id] ?? 0
    : 0;
  const budgetAmount = budget ? Number(budget.amount) || 0 : 0;
  const remaining = budgetAmount - spent;
  const progressPct =
    budgetAmount > 0 ? Math.min(100, Math.round((spent / budgetAmount) * 100)) : 0;
  const status = getBudgetStatus(spent, budgetAmount);
  const burn = budget && monthKey
    ? burnRateForMonth({ monthKey, budgetAmount, spent })
    : null;

  const filterLink = useMemo(() => {
    if (!transaction) return '/transactions';
    const params = new URLSearchParams();
    if (monthKey) {
      params.set('startDate', `${monthKey}-01`);
      const [y, m] = monthKey.split('-').map(Number);
      const last = new Date(y, m, 0).getDate();
      params.set('endDate', `${monthKey}-${String(last).padStart(2, '0')}`);
    }
    params.set('type', transaction.type || 'expense');
    if (transaction.categoryId?._id) params.set('categoryId', transaction.categoryId._id);
    if (transaction.subCategoryId?._id) params.set('subCategoryId', transaction.subCategoryId._id);
    return `/transactions?${params.toString()}`;
  }, [transaction, monthKey]);

  const paymentInfo = useMemo(
    () => (displayTransaction ? getTransactionPaymentDrawerInfo(displayTransaction) : null),
    [displayTransaction]
  );

  if (!transaction) return null;

  const amount = formatTransactionAmountDisplay(transaction, formatCurrency);
  const pm = displayTransaction?.paymentMethodId;
  const typeTone = getTypeTone(transaction.type);

  return (
    <div
      className={`txn-detail-drawer ${isOpen ? 'txn-detail-drawer--open' : ''}`}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        className="txn-detail-drawer__backdrop"
        aria-label="Close details"
        onClick={onClose}
      />
      <aside className="txn-detail-drawer__panel" role="dialog" aria-labelledby="txn-detail-title">
        <div className="txn-detail-drawer__head">
          <div>
            <h2 id="txn-detail-title" className="txn-detail-drawer__title">
              Transaction
            </h2>
            <p className={`txn-detail-drawer__amount ${amount.className}`}>{amount.text}</p>
            <p className="txn-detail-drawer__date">{formatDate(transaction.date)}</p>
            <span className={`txn-detail-drawer__type txn-detail-drawer__type--${typeTone}`}>
              {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
            </span>
          </div>
          <button type="button" className="txn-detail-drawer__close" onClick={onClose} aria-label="Close">
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <div className="txn-detail-drawer__body">
          <section className="txn-detail-drawer__segment">
            <h3 className="txn-detail-drawer__segment-title">Classification</h3>
            <div className="txn-detail-drawer__class-row">
              <TransactionCategoryIcon transaction={transaction} size={22} variant="lg" />
              <div>
                <p className="txn-detail-drawer__class-line">
                  {getCategorySubcategoryLine(transaction)}
                </p>
                <Link to={filterLink} className="txn-detail-drawer__link">
                  View similar transactions
                </Link>
              </div>
            </div>
          </section>

          <section className="txn-detail-drawer__segment">
            <h3 className="txn-detail-drawer__segment-title">Payment method</h3>
            {pm ? (
              <div className="txn-detail-drawer__payment-card">
                <span className="txn-detail-drawer__payment-logo">
                  <PaymentMethodLogo icon={pm.icon} size={28} />
                </span>
                <div className="txn-detail-drawer__payment-body">
                  <p className="txn-detail-drawer__payment-name">
                    {getPaymentMethodDisplayName(transaction)}
                  </p>
                  {paymentInfo?.identifierLine ? (
                    <p className="txn-detail-drawer__payment-identifier">
                      {paymentInfo.identifierLine}
                    </p>
                  ) : null}
                  {paymentInfo?.bankName ? (
                    <div className="txn-detail-drawer__bank-chip">
                      <PaymentMethodLogo
                        icon={paymentInfo.bankLogoUrl || 'mdi:bank-outline'}
                        fallbackIcon="mdi:bank-outline"
                        size={18}
                      />
                      <span>{paymentInfo.bankName}</span>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <p className="txn-detail-drawer__muted">No payment method</p>
            )}
          </section>

          <section className="txn-detail-drawer__segment">
            <h3 className="txn-detail-drawer__segment-title">Tags</h3>
            {transaction.tags?.length ? (
              <div className="txn-detail-drawer__tags">
                {transaction.tags.map((tag, i) => (
                  <span
                    key={tag._id || i}
                    className="txn-detail-drawer__tag"
                    style={{
                      color: tag.color || '#5b21b6',
                      backgroundColor: getMutedTagColor(tag.color),
                      borderColor: tag.color ? `${tag.color}44` : 'rgba(255,255,255,0.5)'
                    }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="txn-detail-drawer__muted">No tags</p>
            )}
          </section>

          <section className="txn-detail-drawer__segment">
            <h3 className="txn-detail-drawer__segment-title">Account & notes</h3>
            <dl className="txn-detail-drawer__dl">
              <div>
                <dt>Account</dt>
                <dd>{transaction.account === 'family' ? 'Family' : 'Self'}</dd>
              </div>
              <div>
                <dt>Notes</dt>
                <dd className="txn-detail-drawer__notes">
                  {transaction.notes?.trim() || '—'}
                </dd>
              </div>
            </dl>
          </section>

          {transaction.type === 'expense' ? (
            <section className="txn-detail-drawer__segment">
              <h3 className="txn-detail-drawer__segment-title">Budget</h3>
              {budgetLoading ? (
                <p className="txn-detail-drawer__muted">Loading budget…</p>
              ) : budget ? (
                <>
                  <div className="txn-detail-drawer__budget-head">
                    <span className={`txn-detail-drawer__budget-status txn-detail-drawer__budget-status--${status.tone}`}>
                      {status.label}
                    </span>
                    <span className="txn-detail-drawer__budget-pct">{progressPct}%</span>
                  </div>
                  <div className="txn-detail-drawer__bar-wrap">
                    <div
                      className={`txn-detail-drawer__bar txn-detail-drawer__bar--${status.tone}`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <div className="txn-detail-drawer__budget-metrics">
                    <div>
                      <span className="txn-detail-drawer__metric-label">Spent</span>
                      <span className="txn-detail-drawer__metric-value">{formatCurrency(spent)}</span>
                    </div>
                    <div>
                      <span className="txn-detail-drawer__metric-label">Budget</span>
                      <span className="txn-detail-drawer__metric-value">{formatCurrency(budgetAmount)}</span>
                    </div>
                    <div>
                      <span className="txn-detail-drawer__metric-label">Remaining</span>
                      <span
                        className={`txn-detail-drawer__metric-value ${
                          remaining < 0 ? 'txn-detail-drawer__metric-value--bad' : ''
                        }`}
                      >
                        {formatCurrency(remaining)}
                      </span>
                    </div>
                  </div>
                  {burn?.kind === 'current' ? (
                    <div className="txn-detail-drawer__burn">
                      <div>
                        <span className="txn-detail-drawer__metric-label">Expected by today</span>
                        <span className="txn-detail-drawer__metric-value">{formatCurrency(burn.expected)}</span>
                      </div>
                      <div>
                        <span className="txn-detail-drawer__metric-label">Pace</span>
                        <span
                          className={`txn-detail-drawer__metric-value ${
                            burn.delta > 0 ? 'txn-detail-drawer__metric-value--bad' : 'txn-detail-drawer__metric-value--good'
                          }`}
                        >
                          {formatCurrency(Math.abs(burn.delta))}{' '}
                          {burn.delta > 0 ? 'ahead' : 'under'}
                        </span>
                      </div>
                      <div>
                        <span className="txn-detail-drawer__metric-label">Safe daily</span>
                        <span className="txn-detail-drawer__metric-value">{formatCurrency(burn.safeDaily)}</span>
                      </div>
                    </div>
                  ) : burn?.kind === 'not_current' ? (
                    <p className="txn-detail-drawer__muted txn-detail-drawer__burn-note">
                      Burn rate applies to the current month only.
                    </p>
                  ) : null}
                  {monthKey ? (
                    <Link to={`/budgets`} className="txn-detail-drawer__link">
                      Open budgets for {monthKey}
                    </Link>
                  ) : null}
                </>
              ) : (
                <p className="txn-detail-drawer__muted">No budget for this category this month.</p>
              )}
            </section>
          ) : null}
        </div>

        <div className="txn-detail-drawer__foot">
          <Button variant="secondary" glass onClick={() => onDuplicate?.(transaction)}>
            <Copy size={16} strokeWidth={2} />
            Duplicate
          </Button>
          <Button variant="secondary" glass onClick={() => onEdit?.(transaction)}>
            Edit
          </Button>
          <Button variant="danger" glass onClick={() => onDelete?.(transaction._id)}>
            Delete
          </Button>
        </div>
      </aside>
    </div>
  );
};

export default TransactionDetailDrawer;
