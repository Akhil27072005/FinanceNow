import React from 'react';
import Sidebar from './Sidebar';
import MobileTopBar from './MobileTopBar';
import { SidebarProvider, useSidebar } from '../../contexts/SidebarContext';
import '../../styles/content-glass.css';

const MainLayoutContent = ({ children }) => {
  const { sidebarWidth, isMobile } = useSidebar();

  return (
    <div className="app-shell">
      <MobileTopBar />
      <Sidebar />
      <div
        className={`app-shell__main${isMobile ? ' app-shell__main--mobile' : ''}`}
        style={{ '--sidebar-width': `${sidebarWidth}px` }}
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
