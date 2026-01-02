import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Header Component
 * Top header bar with user info
 */
const Header = () => {
  const { user } = useAuth();

  return (
    <div
      style={{
        height: '56px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 999,
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
      }}
    >
      <div>
      </div>
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ 
            color: '#6b7280', 
            fontSize: '13px',
            fontWeight: 400
          }}>
            {user.name || user.email}
          </span>
        </div>
      )}
    </div>
  );
};

export default Header;

