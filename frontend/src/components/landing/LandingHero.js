import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import LandingHeroMockup from './LandingHeroMockup';

const FinancialUnderline = () => (
  <svg
    className="landing-hero__underline"
    viewBox="0 0 200 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="none"
    aria-hidden
  >
    <path
      d="M2 8C40 2 80 10 120 6C150 4 175 8 198 5"
      stroke="#3B5BDB"
      strokeWidth="4"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * Landing hero — left copy + right mockup.
 */
const LandingHero = () => {
  return (
    <div className="landing-hero-grid">
      <div className="landing-hero__content">
        <span className="landing-hero__badge">Finance Solutions for You</span>

        <div className="landing-hero__title-wrap">
          <h1 className="landing-hero__title">
            <span className="landing-hero__title-line">
              Maximize Your
            </span>
            <span className="landing-hero__title-line">
              <span className="landing-hero__financial">
                Financial
                <FinancialUnderline />
              </span>
              Potential
              <span className="landing-hero__decor" aria-hidden>
                <span className="landing-hero__decor-black" />
                <span className="landing-hero__decor-lime">
                  <TrendingUp size={18} strokeWidth={3} />
                </span>
              </span>
            </span>
          </h1>
        </div>

        <p className="landing-hero__subtitle">
          Welcome to FinanceNow, where financial management meets simplicity and
          efficiency.
        </p>

        <Link to="/register" className="landing-btn-pill landing-btn-pill--lg">
          Get Started
        </Link>
      </div>

      <div className="landing-hero__visual">
        <LandingHeroMockup />
      </div>
    </div>
  );
};

export default LandingHero;
