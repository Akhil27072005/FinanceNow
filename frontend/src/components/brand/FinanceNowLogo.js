import React, { useId } from 'react';
import financeNowSymbol from '../../assets/finance-now-symbol.png';

/**
 * FinanceNow wordmark — inline SVG themed via CSS variables.
 */
const FinanceNowLogo = ({ className = '', title = 'FinanceNow', ...props }) => {
  const symbolMaskId = `finance-now-symbol-${useId().replace(/:/g, '')}`;

  return (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="165 275 680 155"
    role="img"
    aria-label={title}
    className={`finance-now-logo ${className}`.trim()}
    {...props}
  >
    <title>{title}</title>
    <g transform="matrix(1.0374 0 0 1.0374 512 384)" id="glyphGroup_textPair_1779375464405_0.5681076337814499">
<g>
		<g transform="matrix(1 0 0 1 -299.6115 -6.0441)">
<g>
		<g transform="matrix(1 0 0 1 0 0)">
<path className="finance-now-logo__wordmark" transform="translate(-100, -100)" d="M 91.2319 64.0006 L 124.752 64.0006 L 124.752 77.8537 L 91.2319 77.8537 L 91.2319 93.2934 L 119.1846 93.2934 L 119.1846 107.1464 L 91.2319 107.1464 L 91.2319 136 L 75.248 136 L 75.248 64 L 91.2319 64 L 91.2319 64.0006 Z" strokeLinecap="round"/>
</g>
</g>
</g>
		<g transform="matrix(1 0 0 1 -257.4936 -8.8937)">
<g>
		<g transform="matrix(1 0 0 1 0 10.8287)">
<path className="finance-now-logo__wordmark" transform="translate(-100, -109.5898)" d="M 93.2238 83.1981 L 106.7761 83.1981 L 106.7761 135.9815 L 93.2238 135.9815 L 93.2238 83.1981 Z" strokeLinecap="round"/>
</g>
		<g transform="matrix(1 0 0 1 0 -28.8806)">
<path className="finance-now-logo__mark" transform="translate(-100, -69.8805)" d="M 100.0002 78.2202 C 104.6062 78.2202 108.3396 74.4864 108.3396 69.8805 C 108.3396 65.2746 104.6062 61.5408 100.0002 61.5408 C 95.3942 61.5408 91.6604 65.2746 91.6604 69.8805 C 91.6604 74.4864 95.3942 78.2202 100.0002 78.2202 Z" strokeLinecap="round"/>
</g>
</g>
</g>
		<g transform="matrix(1 0 0 1 -211.3502 2.8451)">
<g>
		<g transform="matrix(1 0 0 1 0 0)">
<path className="finance-now-logo__wordmark" transform="translate(-100, -108.9227)" d="M 127.0591 108.9223 L 127.0586 135.9815 L 113.209 135.9815 L 113.209 108.9126 C 113.2036 101.6334 107.2803 95.7136 99.9998 95.7136 C 92.7158 95.7136 86.791 101.6386 86.791 108.9223 L 86.7905 108.9223 L 86.7905 135.9815 L 72.9409 135.9815 L 72.9414 108.9223 C 72.9414 94.0022 85.0796 81.864 99.9998 81.864 C 114.9199 81.864 127.0591 94.0022 127.0591 108.9223 Z" strokeLinecap="round"/>
</g>
</g>
</g>
		<g transform="matrix(1 0 0 1 -146.6495 3.1048)">
<g>
		<g transform="matrix(1 0 0 1 0 0)">
<path className="finance-now-logo__wordmark" transform="translate(-100, -109.1533)" d="M 127.3184 109.1528 C 127.3184 94.0898 115.0635 81.8348 100.0005 81.8348 C 84.9366 81.8348 72.6817 94.0898 72.6817 109.1528 C 72.6817 124.2169 84.9366 136.4719 100.0005 136.4719 C 104.9527 136.4719 109.5967 135.1407 113.606 132.8273 L 113.606 135.9815 L 127.3184 135.9815 L 127.3184 109.4081 L 127.312 109.4081 C 127.313 109.3227 127.3184 109.2384 127.3184 109.1528 Z M 100.0005 122.7593 C 92.4986 122.7593 86.3941 116.6549 86.3941 109.1528 C 86.3941 101.6507 92.4986 95.5474 100.0005 95.5474 C 107.5025 95.5474 113.606 101.6507 113.606 109.1528 C 113.606 116.655 107.5025 122.7593 100.0005 122.7593 Z" strokeLinecap="round"/>
</g>
</g>
</g>
		<g transform="matrix(1 0 0 1 -80.1416 2.8451)">
<g>
		<g transform="matrix(1 0 0 1 0 0)">
<path className="finance-now-logo__wordmark" transform="translate(-100, -108.9227)" d="M 127.0591 108.9223 L 127.0586 135.9815 L 113.209 135.9815 L 113.209 108.9126 C 113.2036 101.6334 107.2803 95.7136 99.9998 95.7136 C 92.7158 95.7136 86.791 101.6386 86.791 108.9223 L 86.7905 108.9223 L 86.7905 135.9815 L 72.9409 135.9815 L 72.9414 108.9223 C 72.9414 94.0022 85.0796 81.864 99.9998 81.864 C 114.9199 81.864 127.0591 94.0022 127.0591 108.9223 Z" strokeLinecap="round"/>
</g>
</g>
</g>
		<g transform="matrix(1 0 0 1 -15.7055 3.3455)">
<g>
		<g transform="matrix(1 0 0 1 0 0)">
<path className="finance-now-logo__wordmark" transform="translate(-99.9998, -109.4871)" d="M 112.0721 116.8611 L 127.0535 116.8611 C 123.8299 128.4912 113.1463 137.0463 100.5057 137.0463 C 85.3109 137.0463 72.9461 124.6819 72.9461 109.4872 C 72.9461 94.2924 85.3109 81.9279 100.5057 81.9279 C 113.1463 81.9279 123.8299 90.483 127.0535 102.1133 L 112.0721 102.1133 C 109.6351 98.2933 105.3577 95.7607 100.5057 95.7607 C 92.9398 95.7607 86.7791 101.9217 86.7791 109.4872 C 86.7791 117.0525 92.9398 123.2135 100.5057 123.2135 C 105.3577 123.2135 109.6351 120.6811 112.0721 116.8611 Z" strokeLinecap="round"/>
</g>
</g>
</g>
		<g transform="matrix(0.1699 0 0 0.1699 57.3752 3.1234)">
<mask
  id={symbolMaskId}
  maskUnits="userSpaceOnUse"
  maskContentUnits="userSpaceOnUse"
  x="-256"
  y="-256"
  width="512"
  height="512"
  maskType="alpha"
>
  <image
    href={financeNowSymbol}
    x="-256"
    y="-256"
    width="512"
    height="512"
    preserveAspectRatio="xMidYMid meet"
  />
</mask>
<rect
  className="finance-now-logo__mark"
  x="-256"
  y="-256"
  width="512"
  height="512"
  mask={`url(#${symbolMaskId})`}
/>
</g>
		<g transform="matrix(1 0 0 1 141.0928 -6.0441)">
<g>
		<g transform="matrix(1 0 0 1 25.6143 -0.0019)">
<path className="finance-now-logo__wordmark" transform="translate(-125.6141, -99.9981)" d="M 117.6225 64 L 133.6058 64 L 133.6058 135.9962 L 117.6225 122.679 L 117.6225 64 Z" strokeLinecap="round"/>
</g>
		<g transform="matrix(1 0 0 1 25.6143 -0.0019)">
<path className="finance-now-logo__mark-shadow" transform="translate(-125.6141, -99.9981)" d="M 117.6225 64 L 133.6058 64 L 133.6058 135.9962 L 117.6225 122.679 L 117.6225 64 Z" strokeLinecap="round"/>
</g>
		<g transform="matrix(1 0 0 1 0 0)">
<path className="finance-now-logo__mark" transform="translate(-99.9998, -100)" d="M 133.6058 136 L 82.3773 94.9286 L 82.3773 135.9962 L 66.3939 135.9962 L 66.3939 64 L 66.3939 64.0001 L 66.3939 64 L 133.6058 117.8856 L 133.6058 136 Z" strokeLinecap="round"/>
</g>
</g>
</g>
		<g transform="matrix(1 0 0 1 214.4812 3.222)">
<g>
		<g transform="matrix(1 0 0 1 0 0)">
<path className="finance-now-logo__wordmark" transform="translate(-100, -109.6105)" d="M 99.9995 137.0463 C 84.8718 137.0463 72.5642 124.7387 72.5642 109.6111 C 72.5642 94.4824 84.8718 82.1748 99.9995 82.1748 C 115.1282 82.1748 127.4358 94.4824 127.4358 109.6111 C 127.4358 124.7387 115.1282 137.0463 99.9995 137.0463 Z M 99.9995 95.9462 C 92.4651 95.9462 86.3357 102.0767 86.3357 109.611 C 86.3357 117.1454 92.4651 123.2749 99.9995 123.2749 C 107.5338 123.2749 113.6643 117.1454 113.6643 109.611 C 113.6643 102.0767 107.5338 95.9462 99.9995 95.9462 Z" strokeLinecap="round"/>
</g>
</g>
</g>
		<g transform="matrix(1 0 0 1 285.1635 2.9283)">
<g>
		<g transform="matrix(1 0 0 1 0 0)">
<path className="finance-now-logo__wordmark" transform="translate(-100, -109.7117)" d="M 139.2001 83.4419 L 119.9783 120.9506 L 112.2791 135.9815 L 112.2786 135.9815 L 112.2266 135.9815 L 112.2261 135.9815 L 104.2223 120.9506 L 99.9998 113.0204 L 95.7774 120.9506 L 87.7735 135.9815 L 87.721 135.9815 L 80.0218 120.9506 L 60.8 83.4419 L 76.5554 83.4419 L 88.0467 105.878 L 92.1221 98.2312 L 99.9998 83.4419 L 107.8776 98.2312 L 111.953 105.878 L 111.9533 105.8784 L 111.9534 105.878 L 123.4446 83.4419 L 139.2001 83.4419 Z" strokeLinecap="round"/>
</g>
</g>
</g>
</g>
</g>
  </svg>
  );
};

export default FinanceNowLogo;
