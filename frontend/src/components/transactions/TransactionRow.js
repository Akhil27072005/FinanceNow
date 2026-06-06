import React from 'react';
import TransactionCategoryIcon from './TransactionCategoryIcon';
import PaymentMethodLogo from '../payment-methods/PaymentMethodLogo';
import IconButton from '../ui/IconButton';
import {
  getCategorySubcategoryLine,
  formatTransactionAmountDisplay,
  getPaymentMethodDisplayName
} from '../../utils/transactionDisplayUtils';
import { getMutedTagColor } from '../../utils/tagStatsUtils';

const MAX_TAGS = 3;

const TransactionRow = ({
  transaction,
  isSelected,
  formatCurrency,
  formatDate,
  onSelect,
  onEdit,
  onDelete,
  onDuplicate
}) => {
  const amount = formatTransactionAmountDisplay(transaction, formatCurrency);
  const paymentName = getPaymentMethodDisplayName(transaction);
  const tags = transaction.tags || [];
  const visibleTags = tags.slice(0, MAX_TAGS);
  const overflow = tags.length - MAX_TAGS;

  const handleRowClick = () => onSelect?.(transaction);

  const stop = (e) => e.stopPropagation();

  return (
    <article
      className={`txn-row ${isSelected ? 'txn-row--selected' : ''}`}
      onClick={handleRowClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleRowClick();
        }
      }}
    >
      <div className="txn-row__identity">
        <TransactionCategoryIcon
          transaction={transaction}
          size={18}
          variant="sm"
          className="txn-row__icon"
        />
        <div className="txn-row__text">
          <p className="txn-row__category-line">
            {getCategorySubcategoryLine(transaction)}
          </p>
          {visibleTags.length > 0 ? (
            <div className="txn-row__tags">
              {visibleTags.map((tag, index) => (
                <span
                  key={tag._id || index}
                  className="txn-row__tag"
                  style={{
                    color: tag.color || 'var(--accent-text)',
                    backgroundColor: getMutedTagColor(tag.color),
                    borderColor: tag.color ? `${tag.color}44` : 'rgba(255,255,255,0.5)'
                  }}
                >
                  {tag.name}
                </span>
              ))}
              {overflow > 0 ? (
                <span className="txn-row__tag txn-row__tag--more">+{overflow}</span>
              ) : null}
            </div>
          ) : (
            <p className="txn-row__tags-empty">No tags</p>
          )}
        </div>
      </div>

      <div className="txn-row__meta">
        <div className="txn-row__date">{formatDate(transaction.date)}</div>
        <div className={`txn-row__amount ${amount.className}`}>{amount.text}</div>
        <div className="txn-row__payment">
          {transaction.paymentMethodId ? (
            <>
              <span className="txn-row__payment-logo">
                <PaymentMethodLogo icon={transaction.paymentMethodId.icon} size={20} />
              </span>
              <span className="txn-row__payment-name">{paymentName}</span>
            </>
          ) : (
            <span className="txn-row__payment-name txn-row__payment-name--empty">—</span>
          )}
        </div>
      </div>

      <div className="txn-row__actions" onClick={stop}>
        <IconButton glass type="duplicate" onClick={() => onDuplicate?.(transaction)} />
        <IconButton glass type="edit" onClick={() => onEdit?.(transaction)} />
        <IconButton glass type="delete" onClick={() => onDelete?.(transaction._id)} />
      </div>
    </article>
  );
};

export default TransactionRow;
