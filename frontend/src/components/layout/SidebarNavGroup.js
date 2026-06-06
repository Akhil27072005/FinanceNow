import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useSidebar } from '../../contexts/SidebarContext';
import SidebarNavItem from './SidebarNavItem';

/**
 * Expandable sidebar group with chevron, child tree line, and collapsed-mode behavior.
 */
const SidebarNavGroup = ({
  label,
  icon: Icon,
  childItems = [],
  defaultOpen = false
}) => {
  const { collapsed } = useSidebar();
  const navigate = useNavigate();
  const [open, setOpen] = useState(defaultOpen);

  const hasActiveChild = childItems.some((c) => c.isActive);

  useEffect(() => {
    if (hasActiveChild && !collapsed) {
      setOpen(true);
    }
  }, [hasActiveChild, collapsed]);

  const handleTriggerClick = () => {
    if (collapsed) {
      const first = childItems[0];
      if (first?.to) {
        navigate(first.to);
      }
      return;
    }
    setOpen((prev) => !prev);
  };

  return (
    <div className="sidebar-nav-group">
      <button
        type="button"
        className="sidebar-nav-item sidebar-nav-group__trigger"
        onClick={handleTriggerClick}
        data-tooltip={collapsed ? label : undefined}
        aria-expanded={!collapsed ? open : undefined}
      >
        <span className="sidebar-nav-item__icon" aria-hidden>
          <Icon size={20} strokeWidth={hasActiveChild ? 2.25 : 2} />
        </span>
        <span className="sidebar-nav-item__label">{label}</span>
        {!collapsed && (
          <ChevronDown
            size={16}
            className={`sidebar-nav-group__chevron ${open ? 'sidebar-nav-group__chevron--open' : ''}`}
            aria-hidden
          />
        )}
      </button>

      {!collapsed && (
        <div
          className={`expand-section sidebar-nav-group__expand ${
            open ? 'expand-section--open' : ''
          }`}
        >
          <div className="expand-section__inner">
            <div className="sidebar-nav-group__children">
              {childItems.map((child) => (
                <div key={child.to} className="sidebar-nav-group__child">
                  <SidebarNavItem
                    to={child.to}
                    label={child.label}
                    icon={child.icon}
                    isActive={child.isActive}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SidebarNavGroup;
