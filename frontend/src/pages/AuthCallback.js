import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import AppLoadingScreen from '../components/ui/AppLoadingScreen';

/**
 * OAuth Callback Handler
 * Extracts access token from URL query parameter and stores it
 */
const AuthCallback = () => {
  const navigate = useNavigate();
  const { fetchUser } = useAuth();

  useEffect(() => {
    const completeLogin = (accessToken) => {
      localStorage.setItem('accessToken', accessToken);
      window.history.replaceState({}, document.title, '/auth/callback');
      fetchUser()
        .then(() => navigate('/dashboard'))
        .catch((err) => {
          console.error('Error fetching user:', err);
          navigate('/dashboard');
        });
    };

    // Extract access token from URL query parameter or hash
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromQuery = urlParams.get('token');
    const hash = window.location.hash;
    const match = hash.match(/accessToken=([^&]+)/);
    const tokenFromHash = match ? decodeURIComponent(match[1]) : null;
    const accessToken = tokenFromQuery || tokenFromHash;

    if (accessToken) {
      completeLogin(accessToken);
      return;
    }

    // Token missing from URL (e.g. stripped by host redirect). Try refresh using HTTP-only cookie set by backend.
    authService
      .refreshWithCookie()
      .then((data) => {
        if (data.accessToken) completeLogin(data.accessToken);
        else navigate('/login?error=authentication_failed');
      })
      .catch(() => {
        navigate('/login?error=authentication_failed');
      });
  }, [navigate, fetchUser]);

  return <AppLoadingScreen variant="app" label="Completing authentication…" />;
};

export default AuthCallback;

