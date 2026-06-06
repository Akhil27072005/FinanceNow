import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

const PLACEHOLDER_NAV = ['Home', 'About Us', 'Blog'];

const PAGES_PLACEHOLDERS = ['Overview', 'Features', 'Contact'];

/**
 * Landing page top navigation.
 */
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
            {PLACEHOLDER_NAV.map((label) => (
              <button key={label} type="button" className="landing-nav__link">
                {label}
              </button>
            ))}

            <div className="landing-nav__dropdown">
              <button
                type="button"
                className="landing-nav__link landing-nav__dropdown-trigger"
                aria-haspopup="true"
              >
                Pages
                <ChevronDown size={14} strokeWidth={2} />
              </button>
              <div className="landing-nav__dropdown-menu" role="menu">
                {PAGES_PLACEHOLDERS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="landing-nav__dropdown-item"
                    role="menuitem"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <button type="button" className="landing-nav__link">
              Pricing
            </button>
          </div>

          <div className="landing-nav__actions">
            <Link to="/login" className="landing-nav__login">
              Log In
            </Link>
            <Link to="/register" className="landing-btn-pill">
              Get Started
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default LandingNavbar;
