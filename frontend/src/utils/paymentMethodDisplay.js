const NETWORK_GRADIENTS = {
  visa: 'linear-gradient(135deg, #1a1f71 0%, #2d4bb8 55%, #f7b600 100%)',
  mastercard: 'linear-gradient(135deg, #eb001b 0%, #f79e1b 50%, #ff5f00 100%)',
  'american express': 'linear-gradient(135deg, #006fcf 0%, #00a1e4 100%)',
  discover: 'linear-gradient(135deg, #ff6000 0%, #f9a825 100%)',
  rupay: 'linear-gradient(135deg, #097969 0%, #1cb5a3 100%)',
  jcb: 'linear-gradient(135deg, #0b4ea2 0%, #00a651 55%, #e41b13 100%)',
  'diners club': 'linear-gradient(135deg, #0079be 0%, #00457c 100%)'
};

const TYPE_LABELS = {
  card: 'Card',
  digital_wallet: 'Digital wallet',
  cash: 'Cash',
  bank: 'Bank & transfer',
  other: 'Other'
};

export function isLogoUrl(icon) {
  return typeof icon === 'string' && /^https?:\/\//i.test(icon.trim());
}

export function getCardGradient(network) {
  if (!network) {
    if (typeof document !== 'undefined') {
      const root = getComputedStyle(document.documentElement);
      const accent = root.getPropertyValue('--info').trim();
      const bright = root.getPropertyValue('--accent-bright').trim();
      if (accent && bright) {
        return `linear-gradient(135deg, ${accent} 0%, ${bright} 55%, ${bright}cc 100%)`;
      }
    }
    return 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #a78bfa 100%)';
  }
  const key = String(network).toLowerCase();
  return NETWORK_GRADIENTS[key] || NETWORK_GRADIENTS.visa;
}

export function formatCardLast4(last4) {
  if (!last4) return '•••• ••••';
  const digits = String(last4).replace(/\D/g, '').slice(-4);
  return digits.length === 4 ? `•••• ${digits}` : '•••• ••••';
}

export function getCardDisplayTitle(method) {
  if (!method) return '';
  return method.name || 'Card';
}

export function getPaymentMethodTypeLabel(type) {
  return TYPE_LABELS[type] || type || 'Other';
}

export function getOtherIdentifierLabel(type) {
  switch (type) {
    case 'digital_wallet':
      return 'UPI ID / wallet ID';
    case 'bank':
      return 'Account reference';
    case 'cash':
      return '';
    default:
      return 'Reference';
  }
}

export function getOtherDetailLabel(type, customName) {
  const lower = (customName || '').toLowerCase();
  if (type === 'cash') return '';
  if (lower.includes('paypal')) return 'PayPal email';
  if (lower.includes('gpay') || lower.includes('google pay')) return 'GPay ID';
  if (lower.includes('phonepe')) return 'PhonePe number';
  if (lower.includes('paytm')) return 'Paytm number';
  if (lower.includes('upi')) return 'UPI ID';
  if (type === 'bank') return 'Account reference';
  if (type === 'digital_wallet') return 'Wallet ID';
  return 'Identifier';
}

export function buildCardDetailLabel(last4) {
  const digits = String(last4 || '').replace(/\D/g, '').slice(-4);
  return digits.length === 4 ? `Ends in ${digits}` : 'Ends in xxxx';
}

/**
 * Card last4 (•••• 3782) or wallet ID / email (testuser@gpay.com) for this transaction.
 */
const last4FromDetailLabel = (detailLabel) => {
  if (!detailLabel) return null;
  const endsIn = String(detailLabel).match(/ends?\s+in\s+(\d{4})/i);
  if (endsIn) return formatCardLast4(endsIn[1]);
  const digits = String(detailLabel).replace(/\D/g, '').slice(-4);
  if (digits.length === 4 && /^\d{4}$/.test(digits)) return formatCardLast4(digits);
  return null;
};

export function getTransactionPaymentIdentifier(transaction) {
  const pm = transaction?.paymentMethodId;
  if (!pm || typeof pm !== 'object') return null;

  const meta = pm.metadata || {};
  const txnDetail = transaction?.paymentMethodDetail?.trim() || '';
  const savedLast4 = meta.last4 ? String(meta.last4).replace(/\D/g, '').slice(-4) : '';
  const savedId = meta.identifier?.trim() || '';

  const formatLast4FromDetail = (detail) => {
    const raw = String(detail).trim();
    if (/^\d{4}$/.test(raw)) return formatCardLast4(raw);
    const digits = raw.replace(/\D/g, '').slice(-4);
    if (digits.length === 4) return formatCardLast4(digits);
    return null;
  };

  if (pm.type === 'card') {
    const fromTxn = txnDetail ? formatLast4FromDetail(txnDetail) : null;
    if (fromTxn) return fromTxn;
    if (savedLast4.length === 4) return formatCardLast4(savedLast4);
    const fromLabel = last4FromDetailLabel(pm.detailLabel);
    if (fromLabel) return fromLabel;
    return txnDetail || null;
  }

  if (pm.type === 'cash') return null;

  if (txnDetail) return txnDetail;
  if (savedId) return savedId;
  if (savedLast4.length === 4) return formatCardLast4(savedLast4);

  return null;
}

/** Merge full payment method (from settings list) onto a transaction row. */
export function mergeTransactionPaymentMethod(transaction, paymentMethods = []) {
  if (!transaction?.paymentMethodId || !paymentMethods?.length) return transaction;

  const pm = transaction.paymentMethodId;
  const id = typeof pm === 'object' ? pm._id || pm.id : pm;
  if (!id) return transaction;

  const full = paymentMethods.find((p) => String(p._id) === String(id));
  if (!full) return transaction;

  return {
    ...transaction,
    paymentMethodId: {
      ...full,
      ...(typeof pm === 'object' ? pm : {}),
      metadata: { ...(full.metadata || {}), ...(pm.metadata || {}) }
    }
  };
}

/** Identifier from saved payment method only (no per-transaction override). */
export function getPaymentMethodIdentifier(method) {
  if (!method) return null;
  return getTransactionPaymentIdentifier({
    paymentMethodId: method,
    paymentMethodDetail: ''
  });
}

/** Read-only preview for forms: identifier, bank, type. */
export function getPaymentMethodPreviewInfo(method) {
  if (!method) {
    return { identifierLine: null, bankName: null, bankLogoUrl: null, typeLabel: null };
  }
  const meta = method.metadata || {};
  return {
    identifierLine: getPaymentMethodIdentifier(method),
    bankName: meta.bankName?.trim() || null,
    bankLogoUrl: meta.bankLogoUrl || null,
    typeLabel: getPaymentMethodTypeLabel(method.type)
  };
}

/** Payment block for transaction drawer: identifier line + bank. */
export function getTransactionPaymentDrawerInfo(transaction) {
  const pm = transaction?.paymentMethodId;
  if (!pm) {
    return { identifierLine: null, bankName: null, bankLogoUrl: null };
  }
  const meta = pm.metadata || {};
  return {
    identifierLine: getTransactionPaymentIdentifier(transaction),
    bankName: meta.bankName?.trim() || null,
    bankLogoUrl: meta.bankLogoUrl || null
  };
}

export function buildCardDisplayName({ nickname, networkLabel, cardRole }) {
  const parts = [];
  if (nickname?.trim()) parts.push(nickname.trim());
  if (networkLabel) {
    parts.push(parts.length ? networkLabel : networkLabel);
  }
  if (!parts.length && cardRole) {
    parts.push(cardRole === 'credit' ? 'Credit card' : 'Debit card');
  }
  return parts.join(' · ') || 'Card';
}
