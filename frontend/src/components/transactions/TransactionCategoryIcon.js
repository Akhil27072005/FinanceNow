import React from 'react';
import CategoryIconDisplay from '../categories/CategoryIconDisplay';
import { CATEGORY_TYPE_ACCENTS } from '../../constants/categoryIcons';
import { getTransactionIconMeta } from '../../utils/transactionDisplayUtils';

/**
 * Circular icon badge for a transaction (subcategory icon preferred over category).
 */
const TransactionCategoryIcon = ({
  transaction,
  size = 20,
  variant = 'md',
  className = ''
}) => {
  const { icon, categoryType } = getTransactionIconMeta(transaction);
  const accent = CATEGORY_TYPE_ACCENTS[categoryType] || CATEGORY_TYPE_ACCENTS.expense;

  const dimension = variant === 'sm' ? 32 : variant === 'lg' ? 40 : 36;

  return (
    <span
      className={`txn-category-icon txn-category-icon--${variant} ${className}`.trim()}
      style={{
        '--txn-icon-accent-bg': accent.bg,
        '--txn-icon-accent-border': accent.border,
        width: dimension,
        height: dimension
      }}
      aria-hidden
    >
      <CategoryIconDisplay icon={icon} size={size} categoryType={categoryType} />
    </span>
  );
};

export default TransactionCategoryIcon;
