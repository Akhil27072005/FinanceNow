import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Folder, 
  FolderTree, 
  Tag, 
  CreditCard,
  Wallet, 
  BarChart3, 
  Settings,
  Receipt
} from 'lucide-react';

/**
 * Sidebar Navigation Component
 * Fixed left sidebar with navigation links
 */
const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
    { path: '/categories', label: 'Categories', icon: Folder },
    { path: '/subcategories', label: 'Subcategories', icon: FolderTree },
    { path: '/tags', label: 'Tags', icon: Tag },
    { path: '/payment-methods', label: 'Payment Methods', icon: Receipt },
    { path: '/subscriptions', label: 'Subscriptions', icon: CreditCard },
    { path: '/budgets', label: 'Budgets', icon: Wallet },
    { path: '/reports', label: 'Reports', icon: BarChart3 },
    { path: '/settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div
      style={{
        width: '240px',
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e5e7eb',
        padding: '20px 12px',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1000,
        boxShadow: '1px 0 3px rgba(0,0,0,0.04)'
      }}
    >
      <div style={{ padding: '0 8px', marginBottom: '28px' }}>
        <h4 style={{ 
          margin: 0, 
          fontWeight: 600, 
          color: '#111827',
          fontSize: '16px',
          letterSpacing: '-0.02em'
        }}>
          Finance Tracker
        </h4>
      </div>
      <Nav className="flex-column" style={{ padding: '0 4px', gap: '2px' }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Nav.Link
              key={item.path}
              as={Link}
              to={item.path}
              style={{
                padding: '8px 12px',
                margin: '1px 0',
                borderRadius: '8px',
                color: isActive ? '#2563eb' : '#4b5563',
                backgroundColor: isActive ? '#eff6ff' : 'transparent',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontWeight: isActive ? 600 : 500,
                fontSize: '14px',
                transition: 'all 0.15s ease',
                border: 'none'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <item.icon size={20} style={{ width: '24px', flexShrink: 0 }} />
              <span>{item.label}</span>
            </Nav.Link>
          );
        })}
      </Nav>
    </div>
  );
};

export default Sidebar;

