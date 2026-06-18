import React from 'react';
import AuthLoader from './AuthLoader';
import '../../styles/loading-screen.css';

/**
 * Full-viewport loading shell — glass card + themed background.
 * @param {'marketing' | 'app'} variant — marketing orbs (public) vs app shell gradient (authenticated)
 */
const AppLoadingScreen = ({ variant = 'app', label = 'Loading…', size = 96 }) => {
  const cardClass =
    variant === 'marketing'
      ? 'loading-screen__card loading-screen__card--marketing'
      : 'loading-screen__card loading-screen__card--app glass-panel';

  return (
    <div className={`loading-screen loading-screen--${variant}`} aria-busy="true">
      {variant === 'app' ? <div className="loading-screen__backdrop" aria-hidden /> : null}
      <div className={cardClass}>
        <AuthLoader size={size} label={label} />
      </div>
    </div>
  );
};

export default AppLoadingScreen;
