import React from 'react';
import Sidebar from './Sidebar';

/**
 * Main Layout Component
 * Wraps all authenticated pages with sidebar
 */
const MainLayout = ({ children }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <Sidebar />
      <div style={{ marginLeft: '240px', flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <main style={{ flex: 1, padding: '24px', overflow: 'auto', backgroundColor: '#f8f9fa' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;

