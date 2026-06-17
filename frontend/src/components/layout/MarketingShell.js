import React from 'react';
import { Outlet } from 'react-router-dom';
import MarketingBackground from '../shared/MarketingBackground';

/**
 * Persistent marketing backdrop for landing and auth routes.
 */
const MarketingShell = () => (
  <div className="marketing-shell">
    <MarketingBackground />
    <Outlet />
  </div>
);

export default MarketingShell;
