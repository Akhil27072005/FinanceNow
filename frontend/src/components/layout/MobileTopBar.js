import React from 'react';
import { Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import FinanceNowLogo from '../brand/FinanceNowLogo';
import { useSidebar } from '../../contexts/SidebarContext';
import '../../styles/mobile-top-bar.css';

const MobileTopBar = () => {
  const { isMobile, toggleMobile } = useSidebar();

  if (!isMobile) {
    return null;
  }

  return (
    <header className="mobile-top-bar">
      <button
        type="button"
        className="mobile-top-bar__menu-btn"
        onClick={toggleMobile}
        aria-label="Open navigation menu"
      >
        <Menu size={22} strokeWidth={2} aria-hidden />
      </button>

      <Link to="/dashboard" className="mobile-top-bar__brand" aria-label="FinanceNow home">
        <FinanceNowLogo className="mobile-top-bar__logo" />
      </Link>
    </header>
  );
};

export default MobileTopBar;
