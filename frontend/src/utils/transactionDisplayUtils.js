import { FALLBACK_CATEGORY_ICON } from '../constants/categoryIcons';
import {
  getTransactionPaymentDrawerInfo,
  getTransactionPaymentIdentifier,
  mergeTransactionPaymentMethod
} from './paymentMethodDisplay';

export const getTransactionIconMeta = (transaction) => {
  const category = transaction?.categoryId;
  const subCategory = transaction?.subCategoryId;
  const categoryType = category?.type || transaction?.type || 'expense';

  if (subCategory?.icon) {
    return { icon: subCategory.icon, categoryType, source: 'subcategory' };
  }
  if (category?.icon) {
    return { icon: category.icon, categoryType, source: 'category' };
  }
  return { icon: FALLBACK_CATEGORY_ICON, categoryType, source: 'fallback' };
};

export const hasCustomTransactionIcon = (transaction) => {
  const sub = transaction?.subCategoryId;
  const cat = transaction?.categoryId;
  return Boolean(sub?.icon || cat?.icon);
};

export const getCategorySubcategoryLine = (transaction, separator = ' | ') => {
  const cat = transaction?.categoryId?.name;
  const sub = transaction?.subCategoryId?.name;
  if (cat && sub) return `${cat}${separator}${sub}`;
  if (sub) return sub;
  if (cat) return cat;
  return 'Uncategorized';
};

export const getTransactionLabel = (txn) => {
  if (txn.notes?.trim()) return txn.notes.trim();
  return getCategorySubcategoryLine(txn, ' · ');
};

export const formatTransactionAmountDisplay = (transaction, formatCurrency) => {
  const value = formatCurrency(transaction.amount);
  if (transaction.type === 'income') {
    return { text: `+${value}`, className: 'txn-row__amount--income' };
  }
  return { text: `-${value}`, className: 'txn-row__amount--expense' };
};

export const getTransactionMonthKey = (transaction) => {
  if (!transaction?.date) return null;
  const d = new Date(transaction.date);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export const findBudgetForTransaction = (transaction, budgets = []) => {
  if (!transaction || transaction.type !== 'expense') return null;
  const catId = transaction.categoryId?._id || transaction.categoryId;
  const subId = transaction.subCategoryId?._id || transaction.subCategoryId;
  const monthKey = getTransactionMonthKey(transaction);
  if (!monthKey || !catId) return null;

  const forMonth = budgets.filter((b) => b.month === monthKey);

  if (subId) {
    const subMatch = forMonth.find((b) => {
      const bSub = b.subCategoryId?._id || b.subCategoryId;
      return bSub && String(bSub) === String(subId);
    });
    if (subMatch) return subMatch;
  }

  return (
    forMonth.find((b) => {
      const bCat = b.categoryId?._id || b.categoryId;
      const bSub = b.subCategoryId?._id || b.subCategoryId;
      return bCat && String(bCat) === String(catId) && !bSub;
    }) || null
  );
};

export const getTypeTone = (type) => {
  const map = {
    income: 'income',
    expense: 'expense',
    savings: 'savings',
    investment: 'investment'
  };
  return map[type] || 'neutral';
};

export const formatPaymentMethodDetail = (transaction) =>
  getTransactionPaymentIdentifier(transaction);

/** Map API transaction to create/edit form shape */
export const mapTransactionToFormData = (transaction, { useTodayDate = false } = {}) => {
  const today = new Date().toISOString().split('T')[0];
  let date = today;
  if (!useTodayDate && transaction?.date) {
    date = new Date(transaction.date).toISOString().split('T')[0];
  }
  return {
    type: transaction?.type || 'expense',
    amount: transaction?.amount ?? '',
    date,
    categoryId: transaction?.categoryId?._id || transaction?.categoryId || '',
    subCategoryId: transaction?.subCategoryId?._id || transaction?.subCategoryId || '',
    tags: transaction?.tags?.map((t) => t._id || t) || [],
    paymentMethodId: transaction?.paymentMethodId?._id || transaction?.paymentMethodId || '',
    paymentMethodDetail: transaction?.paymentMethodDetail || '',
    account: transaction?.account || 'self',
    notes: transaction?.notes || ''
  };
};

export const getPaymentMethodDisplayName = (transaction) => {
  const pm = transaction?.paymentMethodId;
  if (!pm) return null;
  return pm.name || pm.detailLabel || 'Payment method';
};

export {
  getTransactionPaymentDrawerInfo,
  getTransactionPaymentIdentifier,
  mergeTransactionPaymentMethod
};
