import React from 'react';
import { Link } from 'react-router-dom';
import { useSidebar } from '../../contexts/SidebarContext';

/**
 * Flat sidebar navigation link with pill active state.
 */
const SidebarNavItem = ({ to, label, icon: Icon, isActive, className = '', onNavigate }) => {
  const { collapsed, isMobile } = useSidebar();
  const showCollapsed = !isMobile && collapsed;

  return (
    <Link
      to={to}
      className={`sidebar-nav-item ${isActive ? 'sidebar-nav-item--active' : ''} ${className}`.trim()}
      data-tooltip={showCollapsed ? label : undefined}
      aria-current={isActive ? 'page' : undefined}
      onClick={onNavigate}
    >
      <span className="sidebar-nav-item__icon" aria-hidden>
        <Icon size={20} strokeWidth={isActive ? 2.25 : 2} />
      </span>
      <span className="sidebar-nav-item__label">{label}</span>
    </Link>
  );
};

export default SidebarNavItem;
