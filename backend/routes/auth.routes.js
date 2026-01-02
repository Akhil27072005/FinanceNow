const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const {
  register,
  login,
  googleLogin,
  googleCallback,
  refreshToken,
  logout,
  getMe,
  forgotPassword,
  resetPassword
} = require('../controllers/auth.controller');
const authenticateUser = require('../middlewares/auth.middleware');

/**
 * Authentication routes
 * All routes are prefixed with /api/auth
 */

// Register new user (email/password)
router.post('/register', register);

// Login (email/password)
router.post('/login', login);

// Google OAuth - Initiate OAuth flow
// GET /api/auth/google
router.get('/google', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(`${frontendUrl}/login?error=google_oauth_not_configured`);
  }
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })(req, res, next);
});

// Google OAuth - Callback handler
// GET /api/auth/google/callback
router.get('/google/callback',
  (req, res, next) => {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(`${frontendUrl}/login?error=google_oauth_not_configured`);
    }
    passport.authenticate('google', { 
      failureRedirect: '/api/auth/google/failure',
      session: true // Use session to persist user
    })(req, res, (err) => {
      if (err) {
        console.error('Passport authenticate error:', err);
        return next(err);
      }
      // User should be in req.user after successful authentication
      console.log('Passport authenticate success - req.user:', req.user ? 'User found' : 'No user');
      next();
    });
  },
  googleCallback
);

// Google OAuth - Failure redirect
router.get('/google/failure', (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  res.redirect(`${frontendUrl}/login?error=authentication_failed`);
});

// Google OAuth login (Legacy - using google-auth-library)
// POST /api/auth/google
// Kept for backward compatibility with frontend that sends idToken directly
router.post('/google', googleLogin);

// Refresh access token
router.post('/refresh', refreshToken);

// Logout
router.post('/logout', logout);

// Get current user profile (requires authentication)
router.get('/me', authenticateUser, getMe);

// Forgot password - Send reset link
router.post('/forgot-password', forgotPassword);

// Reset password with token
router.post('/reset-password', resetPassword);

module.exports = router;

