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

const DRAWER_TRANSITION_MS = 420;

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
  const [panelTransaction, setPanelTransaction] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);

  useEffect(() => {
    if (transaction) {
      setPanelTransaction(transaction);
    }
  }, [transaction]);

  useEffect(() => {
    if (!panelTransaction) {
      setDrawerVisible(false);
      return undefined;
    }

    if (isOpen) {
      let timeoutId;
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          timeoutId = window.setTimeout(() => setDrawerVisible(true), 16);
        });
      });
      return () => {
        cancelAnimationFrame(frame);
        window.clearTimeout(timeoutId);
      };
    }

    setDrawerVisible(false);
    return undefined;
  }, [isOpen, panelTransaction]);

  useEffect(() => {
    if (!isOpen && !drawerVisible && panelTransaction) {
      const timeoutId = window.setTimeout(() => setPanelTransaction(null), DRAWER_TRANSITION_MS);
      return () => window.clearTimeout(timeoutId);
    }
    return undefined;
  }, [isOpen, drawerVisible, panelTransaction]);

  const monthKey = useMemo(
    () => (panelTransaction ? getTransactionMonthKey(panelTransaction) : null),
    [panelTransaction]
  );

  const transactionId = panelTransaction?._id;
  const transactionType = panelTransaction?.type;

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
    if (!drawerVisible) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [drawerVisible, onClose]);

  const displayTransaction = useMemo(
    () =>
      panelTransaction
        ? mergeTransactionPaymentMethod(panelTransaction, paymentMethods)
        : null,
    [panelTransaction, paymentMethods]
  );

  const budget = useMemo(() => {
    if (!panelTransaction || !budgetSummary?.budgets) return null;
    return findBudgetForTransaction(panelTransaction, budgetSummary.budgets);
  }, [panelTransaction, budgetSummary]);

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
    if (!panelTransaction) return '/transactions';
    const params = new URLSearchParams();
    if (monthKey) {
      params.set('startDate', `${monthKey}-01`);
      const [y, m] = monthKey.split('-').map(Number);
      const last = new Date(y, m, 0).getDate();
      params.set('endDate', `${monthKey}-${String(last).padStart(2, '0')}`);
    }
    params.set('type', panelTransaction.type || 'expense');
    if (panelTransaction.categoryId?._id) {
      params.set('categoryId', panelTransaction.categoryId._id);
    }
    if (panelTransaction.subCategoryId?._id) {
      params.set('subCategoryId', panelTransaction.subCategoryId._id);
    }
    return `/transactions?${params.toString()}`;
  }, [panelTransaction, monthKey]);

  const paymentInfo = useMemo(
    () => (displayTransaction ? getTransactionPaymentDrawerInfo(displayTransaction) : null),
    [displayTransaction]
  );

  if (!panelTransaction) return null;

  const amount = formatTransactionAmountDisplay(panelTransaction, formatCurrency);
  const pm = displayTransaction?.paymentMethodId;
  const typeTone = getTypeTone(panelTransaction.type);

  return (
    <div
      className={`txn-detail-drawer ${drawerVisible ? 'txn-detail-drawer--open' : ''}`}
      aria-hidden={!drawerVisible}
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
            <p className="txn-detail-drawer__date">{formatDate(panelTransaction.date)}</p>
            <span className={`txn-detail-drawer__type txn-detail-drawer__type--${typeTone}`}>
              {panelTransaction.type.charAt(0).toUpperCase() + panelTransaction.type.slice(1)}
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
              <TransactionCategoryIcon transaction={panelTransaction} size={22} variant="lg" />
              <div>
                <p className="txn-detail-drawer__class-line">
                  {getCategorySubcategoryLine(panelTransaction)}
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
                    {getPaymentMethodDisplayName(panelTransaction)}
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
            {panelTransaction.tags?.length ? (
              <div className="txn-detail-drawer__tags">
                {panelTransaction.tags.map((tag, i) => (
                  <span
                    key={tag._id || i}
                    className="txn-detail-drawer__tag"
                    style={{
                      color: tag.color || 'var(--accent-text)',
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
                <dd>{panelTransaction.account === 'family' ? 'Family' : 'Self'}</dd>
              </div>
              <div>
                <dt>Notes</dt>
                <dd className="txn-detail-drawer__notes">
                  {panelTransaction.notes?.trim() || '—'}
                </dd>
              </div>
            </dl>
          </section>

          {panelTransaction.type === 'expense' ? (
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
                      style={{ '--bar-width': `${progressPct}%` }}
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
          <Button variant="secondary" glass onClick={() => onDuplicate?.(panelTransaction)}>
            <Copy size={16} strokeWidth={2} />
            Duplicate
          </Button>
          <Button variant="secondary" glass onClick={() => onEdit?.(panelTransaction)}>
            Edit
          </Button>
          <Button variant="danger" glass onClick={() => onDelete?.(panelTransaction._id)}>
            Delete
          </Button>
        </div>
      </aside>
    </div>
  );
};

export default TransactionDetailDrawer;
