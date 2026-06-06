import React, { useState, useMemo, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { isLogoUrl } from '../../utils/paymentMethodDisplay';
import { brandfetchLogoCandidates } from '../../utils/brandfetchLogoUrl';

const PaymentMethodLogo = ({
  icon,
  fallbackIcon = 'mdi:credit-card-outline',
  size = 20,
  className = '',
  alt = '',
  /** When true, logo sits on a dark/colored surface (e.g. mini card gradient) */
  onDarkBackground = false
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const src = typeof icon === 'string' ? icon.trim() : '';

  const logoSize = Math.max(32, Math.round(size * 2));

  const candidates = useMemo(() => {
    if (!isLogoUrl(src)) return [];
    return brandfetchLogoCandidates(src, {
      onDark: onDarkBackground,
      size: logoSize
    });
  }, [src, onDarkBackground, logoSize]);

  useEffect(() => {
    setCandidateIndex(0);
    setImgFailed(false);
  }, [src, onDarkBackground, logoSize]);

  const imgSrc = candidates[candidateIndex] || '';
  const showImg = Boolean(imgSrc) && !imgFailed;

  const handleImgError = () => {
    if (candidateIndex < candidates.length - 1) {
      setCandidateIndex((i) => i + 1);
      return;
    }
    setImgFailed(true);
  };

  if (showImg) {
    const blendClass = onDarkBackground
      ? 'pm-brandfetch-img pm-brandfetch-img--on-dark'
      : 'pm-brandfetch-img pm-brandfetch-img--on-light';

    return (
      <img
        key={imgSrc}
        src={imgSrc}
        alt={alt || 'Payment method'}
        width={size}
        height={size}
        className={[blendClass, className].filter(Boolean).join(' ')}
        style={{ objectFit: 'contain', display: 'block', background: 'transparent' }}
        onError={handleImgError}
      />
    );
  }

  const iconId = src && !isLogoUrl(src) ? src : fallbackIcon;

  return (
    <Icon
      icon={iconId}
      width={size}
      height={size}
      className={className}
      style={{ color: onDarkBackground ? '#fff' : undefined }}
      aria-hidden={!alt}
    />
  );
};

export default PaymentMethodLogo;
