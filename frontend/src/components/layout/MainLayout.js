import React from 'react';
import Sidebar from './Sidebar';
import { SidebarProvider, useSidebar } from '../../contexts/SidebarContext';
import '../../styles/content-glass.css';

const MainLayoutContent = ({ children }) => {
  const { sidebarWidth } = useSidebar();

  return (
    <div className="app-shell" style={{ display: 'flex', minHeight: '100vh' }}>
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
        <main className="app-content">
          <div className="app-content__backdrop" aria-hidden />
          <div className="app-content__inner">{children}</div>
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
