import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo
} from 'react';
import { useLocation } from 'react-router-dom';
import { useBreakpoint } from '../hooks/useBreakpoint';

const STORAGE_KEY = 'sidebarCollapsed';

const SidebarContext = createContext(null);

export const EXPANDED_WIDTH = 260;
export const COLLAPSED_WIDTH = 72;

export const SidebarProvider = ({ children }) => {
  const { pathname } = useLocation();
  const { isMobile } = useBreakpoint();
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(collapsed));
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMobile) {
      setMobileOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    const className = 'sidebar-mobile-open';
    if (isMobile && mobileOpen) {
      document.body.classList.add(className);
    } else {
      document.body.classList.remove(className);
    }
    return () => document.body.classList.remove(className);
  }, [isMobile, mobileOpen]);

  useEffect(() => {
    if (!isMobile || !mobileOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMobile, mobileOpen]);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  const openMobile = useCallback(() => setMobileOpen(true), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const toggleMobile = useCallback(() => setMobileOpen((prev) => !prev), []);

  const desktopWidth = collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;
  const sidebarWidth = isMobile ? 0 : desktopWidth;

  const value = useMemo(
    () => ({
      collapsed,
      toggleCollapsed,
      sidebarWidth,
      expandedWidth: EXPANDED_WIDTH,
      collapsedWidth: COLLAPSED_WIDTH,
      isMobile,
      mobileOpen,
      openMobile,
      closeMobile,
      toggleMobile
    }),
    [
      collapsed,
      toggleCollapsed,
      sidebarWidth,
      isMobile,
      mobileOpen,
      openMobile,
      closeMobile,
      toggleMobile
    ]
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
};

export const useSidebar = () => {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }
  return ctx;
};

export default SidebarContext;
