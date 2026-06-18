import React, { useState } from 'react';
import AppLoadingScreen from '../../components/ui/AppLoadingScreen';
import MarketingBackground from '../../components/shared/MarketingBackground';
import '../../styles/loading-screen-dev.css';

/**
 * Dev-only page to preview AppLoadingScreen variants (load is too fast locally otherwise).
 * Visit: /dev/loading
 */
const LoadingScreenDev = () => {
  const [variant, setVariant] = useState('app');

  return (
    <div className={`loading-screen-dev loading-screen-dev--${variant}`}>
      <div className="loading-screen-dev__toolbar">
        <span className="loading-screen-dev__label">Loading screen preview</span>
        <div className="loading-screen-dev__tabs" role="tablist" aria-label="Loading variant">
          <button
            type="button"
            role="tab"
            aria-selected={variant === 'marketing'}
            className={`loading-screen-dev__tab${variant === 'marketing' ? ' loading-screen-dev__tab--active' : ''}`}
            onClick={() => setVariant('marketing')}
          >
            Marketing
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={variant === 'app'}
            className={`loading-screen-dev__tab${variant === 'app' ? ' loading-screen-dev__tab--active' : ''}`}
            onClick={() => setVariant('app')}
          >
            App
          </button>
        </div>
      </div>

      {variant === 'marketing' ? <MarketingBackground /> : null}
      <AppLoadingScreen variant={variant} label="Preview loading…" />
    </div>
  );
};

export default LoadingScreenDev;
