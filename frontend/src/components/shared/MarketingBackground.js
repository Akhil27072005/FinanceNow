import React, { useId } from 'react';
import '../../styles/marketing-background.css';

/**
 * Soft glowing orbs — shared inline SVG background for landing and auth.
 */
const MarketingBackground = () => {
  const id = useId().replace(/:/g, '');
  const orangeId = `marketing-orb-orange-${id}`;
  const purpleId = `marketing-orb-purple-${id}`;

  return (
    <div className="marketing-bg" aria-hidden="true">
      <svg
        className="marketing-bg__orb marketing-bg__orb--orange"
        viewBox="0 0 520 520"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="260" cy="260" r="260" fill={`url(#${orangeId})`} />
        <defs>
          <radialGradient
            id={orangeId}
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(260 260) rotate(90) scale(260)"
          >
            <stop stopColor="#FF8A5C" stopOpacity="0.85" />
            <stop offset="0.45" stopColor="#FF6B35" stopOpacity="0.35" />
            <stop offset="1" stopColor="#FF6B35" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>

      <svg
        className="marketing-bg__orb marketing-bg__orb--purple"
        viewBox="0 0 560 560"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="280" cy="280" r="280" fill={`url(#${purpleId})`} />
        <defs>
          <radialGradient
            id={purpleId}
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(280 280) rotate(90) scale(280)"
          >
            <stop stopColor="#B264FF" stopOpacity="0.9" />
            <stop offset="0.5" stopColor="#500CB0" stopOpacity="0.4" />
            <stop offset="1" stopColor="#500CB0" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
};

export default MarketingBackground;
