import React from 'react';
import LandingHeroMockup from './LandingHeroMockup';
import MarketingAuthLink from './MarketingAuthLink';

const SocialAvatars = () => (
  <div className="landing-hero__avatars" aria-hidden="true">
    {[0, 1, 2, 3].map((seed) => (
      <svg key={seed} width="36" height="36" viewBox="0 0 36 36" className="landing-hero__avatar">
        <defs>
          <linearGradient id={`social-avatar-${seed}`} x1="0" y1="0" x2="36" y2="36">
            <stop stopColor={['#FF8A5C', '#60A5FA', '#B264FF', '#4ADE80'][seed]} />
            <stop offset="1" stopColor={['#B264FF', '#818CF8', '#500CB0', '#22C55E'][seed]} />
          </linearGradient>
        </defs>
        <circle cx="18" cy="18" r="18" fill={`url(#social-avatar-${seed})`} />
        <circle cx="18" cy="14" r="5.5" fill="rgba(255,255,255,0.9)" />
        <ellipse cx="18" cy="27" rx="8.5" ry="6" fill="rgba(255,255,255,0.82)" />
      </svg>
    ))}
  </div>
);

const LandingHero = () => {
  return (
    <div className="landing-hero-grid">
      <div className="landing-hero__content">
        <h1 className="landing-hero__title">
          All your finances, 
          <br />
          In one place
        </h1>

        <p className="landing-hero__subtitle">
          Track transactions, manage budgets and subscriptions, and see where your money goes — month by month.
        </p>

        <MarketingAuthLink to="/register" className="landing-hero__cta landing-hero__cta--primary">
          Get Started
        </MarketingAuthLink>

        <div className="landing-hero__social">
          <SocialAvatars />
          <p className="landing-hero__social-text">Used by 10k people around the globe</p>
        </div>
      </div>

      <div className="landing-hero__visual">
        <LandingHeroMockup />
      </div>
    </div>
  );
};

export default LandingHero;
