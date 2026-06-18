import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Landing from '../pages/Landing';
import AppLoadingScreen from './ui/AppLoadingScreen';

/**
 * Root route: landing for guests, dashboard for authenticated users.
 */
const LandingRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <AppLoadingScreen variant="marketing" />;
  }

  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Landing />;
};

export default LandingRoute;
