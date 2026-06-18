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
  defaultOpen = false,
  forceExpanded = false
}) => {
  const { collapsed, isMobile } = useSidebar();
  const navigate = useNavigate();
  const [open, setOpen] = useState(defaultOpen || forceExpanded);
  const showCollapsed = !isMobile && collapsed;

  const hasActiveChild = childItems.some((c) => c.isActive);

  useEffect(() => {
    if (forceExpanded || (hasActiveChild && !showCollapsed)) {
      setOpen(true);
    }
  }, [hasActiveChild, showCollapsed, forceExpanded]);

  const handleTriggerClick = () => {
    if (showCollapsed) {
      const first = childItems[0];
      if (first?.to) {
        navigate(first.to);
      }
      return;
    }
    setOpen((prev) => !prev);
  };

  const isExpanded = forceExpanded || !showCollapsed;

  return (
    <div className="sidebar-nav-group">
      <button
        type="button"
        className="sidebar-nav-item sidebar-nav-group__trigger"
        onClick={handleTriggerClick}
        data-tooltip={showCollapsed ? label : undefined}
        aria-expanded={isExpanded ? open : undefined}
      >
        <span className="sidebar-nav-item__icon" aria-hidden>
          <Icon size={20} strokeWidth={hasActiveChild ? 2.25 : 2} />
        </span>
        <span className="sidebar-nav-item__label">{label}</span>
        {isExpanded && !forceExpanded ? (
          <ChevronDown
            size={16}
            className={`sidebar-nav-group__chevron ${open ? 'sidebar-nav-group__chevron--open' : ''}`}
            aria-hidden
          />
        ) : null}
      </button>

      {isExpanded && (
        <div
          className={`expand-section sidebar-nav-group__expand ${
            open || forceExpanded ? 'expand-section--open' : ''
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
                    onNavigate={child.onNavigate}
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
