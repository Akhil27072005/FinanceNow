import React from 'react';
import MiniCardVisual from './MiniCardVisual';
import PaymentMethodLogo from './PaymentMethodLogo';
import IconButton from '../ui/IconButton';
import {
  formatCardLast4,
  getCardDisplayTitle
} from '../../utils/paymentMethodDisplay';
import { getCardNetworkIconifyIcon } from '../../utils/cardNetworkFromPrefix';

const CardPaymentMethodRow = ({ method, onEdit, onDelete }) => {
  const meta = method.metadata || {};
  const cardRole = meta.cardRole || 'credit';
  const networkFallbackIcon =
    getCardNetworkIconifyIcon(meta.network) || 'mdi:credit-card-outline';

  return (
    <tr>
      <td>
        <div className="card-row__main">
          <MiniCardVisual
            network={meta.network}
            networkFallbackIcon={networkFallbackIcon}
            bankLogoUrl={meta.bankLogoUrl}
          />
          <div className="card-row__text">
            <div className="card-row__title">{getCardDisplayTitle(method)}</div>
            <div className="card-row__sub">{formatCardLast4(meta.last4)}</div>
          </div>
        </div>
      </td>
      <td>
        <span className={`pm-pill pm-pill--${cardRole}`}>{cardRole}</span>
      </td>
      <td>
        {meta.bankName ? (
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
        <div className="payment-methods-actions">
          <IconButton glass type="edit" onClick={() => onEdit(method)} />
          <IconButton glass type="delete" onClick={() => onDelete(method._id)} />
        </div>
      </td>
    </tr>
  );
};

export default CardPaymentMethodRow;
