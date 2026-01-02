import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * OAuth Callback Handler
 * Extracts access token from URL query parameter and stores it
 */
const AuthCallback = () => {
  const navigate = useNavigate();
  const { fetchUser } = useAuth();

  useEffect(() => {
    // Extract access token from URL query parameter or hash
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromQuery = urlParams.get('token');
    
    // Also check hash for backward compatibility
    const hash = window.location.hash;
    const match = hash.match(/accessToken=([^&]+)/);
    const tokenFromHash = match ? decodeURIComponent(match[1]) : null;
    
    const accessToken = tokenFromQuery || tokenFromHash;
    
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
      // Refresh token is in HTTP-only cookie, no need to extract
      // Clear the token from URL for security
      window.history.replaceState({}, document.title, '/auth/callback');
      
      // Fetch user data to populate auth context
      fetchUser().then(() => {
        navigate('/dashboard');
      }).catch((error) => {
        console.error('Error fetching user:', error);
        navigate('/dashboard'); // Still navigate even if user fetch fails
      });
    } else {
      // No token found, redirect to login
      navigate('/login?error=authentication_failed');
    }
  }, [navigate, fetchUser]);

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Completing authentication...</span>
      </div>
    </div>
  );
};

export default AuthCallback;

