import React from 'react';
import Sidebar from './Sidebar';
import { SidebarProvider, useSidebar } from '../../contexts/SidebarContext';

const MainLayoutContent = ({ children }) => {
  const { sidebarWidth } = useSidebar();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <Sidebar />
      <div
        style={{
          marginLeft: `${sidebarWidth}px`,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          transition: 'margin-left 0.25s ease'
        }}
      >
        <main style={{ flex: 1, padding: '24px', overflow: 'auto', backgroundColor: '#f8f9fa' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

/**
 * Main Layout Component
 * Wraps all authenticated pages with sidebar
 */
const MainLayout = ({ children }) => (
  <SidebarProvider>
    <MainLayoutContent>{children}</MainLayoutContent>
  </SidebarProvider>
);

export default MainLayout;
