import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  LineChart,
  TrendingUp,
  FileBarChart,
  Layers,
  Shapes,
  ListTree,
  Tags,
  Landmark,
  Repeat,
  PiggyBank,
  Settings,
  PanelLeftClose,
  PanelLeft,
  X
} from 'lucide-react';
import FinanceNowLogo from '../brand/FinanceNowLogo';
import { useSidebar } from '../../contexts/SidebarContext';
import SidebarNavItem from './SidebarNavItem';
import SidebarNavGroup from './SidebarNavGroup';

const CATALOG_PATHS = ['/categories', '/subcategories', '/tags', '/payment-methods'];
const INSIGHTS_PATHS = ['/reports', '/budgets', '/investments'];

const Sidebar = () => {
  const location = useLocation();
  const { collapsed, toggleCollapsed, isMobile, mobileOpen, closeMobile, sidebarWidth } =
    useSidebar();
  const pathname = location.pathname;
  const showCollapsed = !isMobile && collapsed;

  const isActive = (path) => pathname === path;

  const catalogChildren = useMemo(
    () => [
      { path: '/categories', label: 'Categories', icon: Shapes },
      { path: '/subcategories', label: 'Subcategories', icon: ListTree },
      { path: '/tags', label: 'Tags', icon: Tags },
      { path: '/payment-methods', label: 'Payment Methods', icon: Landmark }
    ],
    []
  );

  const insightsChildren = useMemo(
    () => [
      { path: '/reports', label: 'Reports', icon: FileBarChart },
      { path: '/budgets', label: 'Budgets', icon: PiggyBank },
      { path: '/investments', label: 'Investments', icon: TrendingUp }
    ],
    []
  );

  const sidebarClass = [
    'sidebar',
    showCollapsed ? 'sidebar--collapsed' : '',
    isMobile && mobileOpen ? 'sidebar--mobile-open' : ''
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      {isMobile && mobileOpen ? (
        <button
          type="button"
          className="sidebar__backdrop"
          onClick={closeMobile}
          aria-label="Close navigation menu"
        />
      ) : null}

      <aside
        className={sidebarClass}
        style={!isMobile ? { '--sidebar-width': `${sidebarWidth}px` } : undefined}
        aria-hidden={isMobile && !mobileOpen}
      >
        <div
          className="sidebar__shell"
          style={!isMobile ? { width: `${sidebarWidth}px` } : undefined}
        >
          {isMobile ? (
            <div className="sidebar__mobile-head">
              <Link to="/dashboard" className="sidebar__logo-link" onClick={closeMobile}>
                <FinanceNowLogo className="sidebar__logo-mark" />
              </Link>
              <button
                type="button"
                className="sidebar__mobile-close"
                onClick={closeMobile}
                aria-label="Close navigation menu"
              >
                <X size={20} strokeWidth={2} aria-hidden />
              </button>
            </div>
          ) : (
            <div className="sidebar__logo">
              <Link to="/dashboard" className="sidebar__logo-link">
                <FinanceNowLogo className="sidebar__logo-mark" />
              </Link>
            </div>
          )}

          <div className="sidebar__scroll">
            <section className="sidebar__section" aria-label="Main menu">
              {!showCollapsed && <h2 className="sidebar__section-label">Main menu</h2>}
              <nav className="sidebar__nav">
                <SidebarNavItem
                  to="/dashboard"
                  label="Dashboard"
                  icon={LayoutDashboard}
                  isActive={isActive('/dashboard')}
                  onNavigate={isMobile ? closeMobile : undefined}
                />
                <SidebarNavItem
                  to="/transactions"
                  label="Transactions"
                  icon={ArrowLeftRight}
                  isActive={isActive('/transactions')}
                  onNavigate={isMobile ? closeMobile : undefined}
                />
                <SidebarNavGroup
                  label="Insights"
                  icon={LineChart}
                  defaultOpen={INSIGHTS_PATHS.some((p) => pathname.startsWith(p))}
                  forceExpanded={isMobile}
                  childItems={insightsChildren.map((c) => ({
                    ...c,
                    to: c.path,
                    isActive: isActive(c.path),
                    onNavigate: isMobile ? closeMobile : undefined
                  }))}
                />
                <SidebarNavGroup
                  label="Catalog"
                  icon={Layers}
                  defaultOpen={CATALOG_PATHS.some((p) => pathname.startsWith(p))}
                  forceExpanded={isMobile}
                  childItems={catalogChildren.map((c) => ({
                    ...c,
                    to: c.path,
                    isActive: isActive(c.path),
                    onNavigate: isMobile ? closeMobile : undefined
                  }))}
                />
                <SidebarNavItem
                  to="/subscriptions"
                  label="Subscriptions"
                  icon={Repeat}
                  isActive={isActive('/subscriptions')}
                  onNavigate={isMobile ? closeMobile : undefined}
                />
              </nav>
            </section>

            <section className="sidebar__section" aria-label="Settings">
              {!showCollapsed && <h2 className="sidebar__section-label">Settings</h2>}
              <nav className="sidebar__nav">
                <SidebarNavItem
                  to="/settings"
                  label="Settings"
                  icon={Settings}
                  isActive={isActive('/settings')}
                  onNavigate={isMobile ? closeMobile : undefined}
                />
              </nav>
            </section>
          </div>

          {!isMobile ? (
            <div className="sidebar__footer">
              <button
                type="button"
                className="sidebar__collapse-btn"
                onClick={toggleCollapsed}
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {collapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
                <span className="sidebar__collapse-btn__label">
                  {collapsed ? 'Expand' : 'Collapse'}
                </span>
              </button>
            </div>
          ) : null}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
