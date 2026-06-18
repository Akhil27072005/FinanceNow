import React, { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import MarketingAuthLink from './MarketingAuthLink';
import { MARKETING_NAV_LINKS } from '../../constants/marketingContent';

const renderNavLink = (item, onNavigate, className = 'landing-nav__link') => {
  if (item.available) {
    return (
      <NavLink
        key={item.label}
        to={item.to}
        className={({ isActive }) =>
          `${className}${isActive ? ` ${className}--active` : ''}`
        }
        onClick={onNavigate}
      >
        {item.label}
      </NavLink>
    );
  }

  return (
    <span
      key={item.label}
      className={`${className} ${className}--disabled`}
      aria-disabled="true"
    >
      {item.label}
    </span>
  );
};

const LandingNavbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const className = 'marketing-menu-open';
    if (menuOpen) {
      document.body.classList.add(className);
    } else {
      document.body.classList.remove(className);
    }
    return () => document.body.classList.remove(className);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

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
            {MARKETING_NAV_LINKS.map((item) => renderNavLink(item))}
          </div>

          <div className="landing-nav__actions">
            <button
              type="button"
              className="landing-nav__menu-btn"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
            </button>
            <MarketingAuthLink to="/login" className="landing-nav__btn landing-nav__btn--login">
              Login
            </MarketingAuthLink>
            <MarketingAuthLink to="/register" className="landing-nav__btn landing-nav__btn--signup">
              Sign Up
            </MarketingAuthLink>
          </div>
        </nav>
      </div>

      {menuOpen ? (
        <button
          type="button"
          className="landing-nav__menu-backdrop"
          onClick={closeMenu}
          aria-label="Close menu"
        />
      ) : null}

      <div className={`landing-nav__mobile-menu${menuOpen ? ' landing-nav__mobile-menu--open' : ''}`}>
        <div className="landing-container">
          <div className="landing-nav__mobile-links">
            {MARKETING_NAV_LINKS.map((item) =>
              renderNavLink(item, closeMenu, 'landing-nav__mobile-link')
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default LandingNavbar;
