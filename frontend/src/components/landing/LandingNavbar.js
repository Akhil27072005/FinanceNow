import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import MarketingAuthLink from './MarketingAuthLink';
import { MARKETING_NAV_LINKS } from '../../constants/marketingContent';

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
            {MARKETING_NAV_LINKS.map((item) =>
              item.available ? (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={({ isActive }) =>
                    `landing-nav__link${isActive ? ' landing-nav__link--active' : ''}`
                  }
                >
                  {item.label}
                </NavLink>
              ) : (
                <span
                  key={item.label}
                  className="landing-nav__link landing-nav__link--disabled"
                  aria-disabled="true"
                >
                  {item.label}
                </span>
              )
            )}
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
