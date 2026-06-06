import React from 'react';
import PaymentMethodLogo from './PaymentMethodLogo';
import { getCardGradient } from '../../utils/paymentMethodDisplay';
import { getCardNetworkIconifyIcon } from '../../utils/cardNetworkFromPrefix';

const MiniCardVisual = ({
  network,
  networkFallbackIcon = 'mdi:credit-card-outline',
  bankLogoUrl,
  bankFallbackIcon = 'mdi:bank-outline'
}) => {
  const gradient = getCardGradient(network);
  /** Brandfetch card-network icons often include a white tile; Iconify marks do not. */
  const networkMiniIcon =
    getCardNetworkIconifyIcon(network) || networkFallbackIcon;

  return (
    <div className="mini-card" style={{ background: gradient }} aria-hidden>
      <div className="mini-card__shine" />
      {(bankLogoUrl || bankFallbackIcon) && (
        <div className="mini-card__bank-logo">
          <PaymentMethodLogo
            icon={bankLogoUrl || bankFallbackIcon}
            fallbackIcon={bankFallbackIcon}
            size={22}
            onDarkBackground
          />
        </div>
      )}
      <div className="mini-card__network-logo">
        <PaymentMethodLogo
          icon={networkMiniIcon}
          fallbackIcon={networkFallbackIcon}
          size={32}
          onDarkBackground
        />
      </div>
    </div>
  );
};

export default MiniCardVisual;
