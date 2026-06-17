import React from 'react';
import PaymentMethodLogo from './PaymentMethodLogo';
import IconButton from '../ui/IconButton';
import { getPaymentMethodTypeLabel } from '../../utils/paymentMethodDisplay';

const OtherPaymentMethodRow = ({ method, rowIndex = 0, onEdit, onDelete }) => {
  const meta = method.metadata || {};
  const showBank = method.type !== 'cash';

  return (
    <tr className="payment-methods-table__row" style={{ '--row-i': rowIndex }}>
      <td>
        <div className="card-row__main">
          <div className="pm-logo-plain pm-logo-plain--lg">
            <PaymentMethodLogo
              icon={method.icon}
              fallbackIcon="mdi:wallet-outline"
              size={28}
            />
          </div>
          <div className="card-row__text">
            <div className="card-row__title">{method.name}</div>
          </div>
        </div>
      </td>
      <td style={{ color: '#6b7280' }}>
        {method.type === 'cash' ? '—' : meta.identifier || '—'}
      </td>
      <td>
        {showBank && meta.bankName ? (
          <div className="pm-bank-cell">
            <div className="pm-bank-cell__logo">
              <PaymentMethodLogo
                icon={meta.bankLogoUrl || 'mdi:bank-outline'}
                fallbackIcon="mdi:bank-outline"
                size={18}
              />
            </div>
            <span>{meta.bankName}</span>
          </div>
        ) : (
          <span style={{ color: '#9ca3af' }}>—</span>
        )}
      </td>
      <td>
        <span className="pm-type-badge">
          {getPaymentMethodTypeLabel(method.type)}
        </span>
      </td>
      <td>
        <div className="payment-methods-actions">
          <IconButton glass type="edit" onClick={() => onEdit(method)} />
          <IconButton glass type="delete" onClick={() => onDelete(method._id)} />
        </div>
      </td>
    </tr>
  );
};

export default OtherPaymentMethodRow;
