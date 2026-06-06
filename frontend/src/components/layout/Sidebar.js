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
  PanelLeft
} from 'lucide-react';
import { useSidebar } from '../../contexts/SidebarContext';
import SidebarNavItem from './SidebarNavItem';
import SidebarNavGroup from './SidebarNavGroup';

const CATALOG_PATHS = ['/categories', '/subcategories', '/tags', '/payment-methods'];
const INSIGHTS_PATHS = ['/reports', '/budgets', '/investments'];

const Sidebar = () => {
  const location = useLocation();
  const { collapsed, toggleCollapsed, sidebarWidth } = useSidebar();
  const pathname = location.pathname;

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

  return (
    <aside
      className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}
      style={{ '--sidebar-width': `${sidebarWidth}px` }}
    >
      <div className="sidebar__shell">
        <div className="sidebar__logo">
          <Link to="/dashboard" className="sidebar__logo-link">
            <img
              src={`${process.env.PUBLIC_URL}/FinanceNow_logo1.svg`}
              alt="FinanceNow"
              className="sidebar__logo-img"
            />
          </Link>
        </div>

        <div className="sidebar__scroll">
          <section className="sidebar__section" aria-label="Main menu">
            {!collapsed && <h2 className="sidebar__section-label">Main menu</h2>}
            <nav className="sidebar__nav">
              <SidebarNavItem
                to="/dashboard"
                label="Dashboard"
                icon={LayoutDashboard}
                isActive={isActive('/dashboard')}
              />
              <SidebarNavItem
                to="/transactions"
                label="Transactions"
                icon={ArrowLeftRight}
                isActive={isActive('/transactions')}
              />
              <SidebarNavGroup
                label="Insights"
                icon={LineChart}
                defaultOpen={INSIGHTS_PATHS.some((p) => pathname.startsWith(p))}
                childItems={insightsChildren.map((c) => ({
                  ...c,
                  to: c.path,
                  isActive: isActive(c.path)
                }))}
              />
              <SidebarNavGroup
                label="Catalog"
                icon={Layers}
                defaultOpen={CATALOG_PATHS.some((p) => pathname.startsWith(p))}
                childItems={catalogChildren.map((c) => ({
                  ...c,
                  to: c.path,
                  isActive: isActive(c.path)
                }))}
              />
              <SidebarNavItem
                to="/subscriptions"
                label="Subscriptions"
                icon={Repeat}
                isActive={isActive('/subscriptions')}
              />
            </nav>
          </section>

          <section className="sidebar__section" aria-label="Settings">
            {!collapsed && <h2 className="sidebar__section-label">Settings</h2>}
            <nav className="sidebar__nav">
              <SidebarNavItem
                to="/settings"
                label="Settings"
                icon={Settings}
                isActive={isActive('/settings')}
              />
            </nav>
          </section>
        </div>

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
      </div>
    </aside>
  );
};

export default Sidebar;
