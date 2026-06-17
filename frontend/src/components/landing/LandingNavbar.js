import React from 'react';
import { Link } from 'react-router-dom';
import MarketingAuthLink from './MarketingAuthLink';

const NAV_LINKS = ['Features', 'Pricing', 'About', 'Blog', 'Contact'];

const LandingNavbar = () => {
  return (
    <header className="landing-header">
      <div className="landing-container">
        <nav className="landing-nav" aria-label="Main navigation">
          <Link to="/" className="landing-nav__brand" aria-label="FinanceNow home">
            <img
              src={`${process.env.PUBLIC_URL}/FinanceNow_logo1.svg`}
              alt="FinanceNow"
              className="landing-nav__logo"
            />
          </Link>

          <div className="landing-nav__links">
            {NAV_LINKS.map((label) => (
              <button key={label} type="button" className="landing-nav__link">
                {label}
              </button>
            ))}
          </div>

          <div className="landing-nav__actions">
            <MarketingAuthLink to="/login" className="landing-nav__btn landing-nav__btn--login">
              Login
            </MarketingAuthLink>
            <MarketingAuthLink to="/register" className="landing-nav__btn landing-nav__btn--signup">
              Sign Up
            </MarketingAuthLink>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default LandingNavbar;
