const User = require('../models/User');
const generateAccessToken = require('../utils/generateAccessToken');
const generateRefreshToken = require('../utils/generateRefreshToken');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');
const { sendPasswordResetEmail } = require('../utils/emailService');

/**
 * Register a new user with email and password
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Create user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      authProvider: 'local'
    });

    await user.save();

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Store refresh token in user document
    user.addRefreshToken(refreshToken);
    await user.save();

    // Return response (exclude password and refreshTokens array from response)
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      authProvider: user.authProvider,
      createdAt: user.createdAt
    };

    res.status(201).json({
      success: true,
      accessToken,
      refreshToken,
      user: userResponse
    });
  } catch (error) {
    // Handle duplicate key error (email uniqueness)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }
    next(error);
  }
};

/**
 * Login with email and password
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Check if user is local auth
    if (user.authProvider !== 'local') {
      return res.status(401).json({
        success: false,
        error: 'This email is registered with Google. Please use Google login.'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Generate new tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Store refresh token in user document
    user.addRefreshToken(refreshToken);
    await user.save();

    // Return response
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      authProvider: user.authProvider,
      createdAt: user.createdAt
    };

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: userResponse
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Google OAuth login (Legacy - using google-auth-library)
 * POST /api/auth/google
 * Body: { idToken: "<google-id-token>" }
 * 
 * Note: This endpoint is kept for backward compatibility.
 * The new Passport.js OAuth flow uses GET /api/auth/google and GET /api/auth/google/callback
 */
const googleLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        error: 'Google ID token is required'
      });
    }

    // Verify Google ID token
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    let ticket;
    
    try {
      ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Invalid Google ID token'
      });
    }

    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email not provided by Google'
      });
    }

    // Find or create user
    let user = await User.findOne({ 
      $or: [
        { email: email.toLowerCase() },
        { googleId }
      ]
    });

    if (user) {
      // User exists - update if needed
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = 'google';
        if (!user.name) {
          user.name = name;
        }
      }
    } else {
      // Create new user
      user = new User({
        name: name || 'Google User',
        email: email.toLowerCase(),
        authProvider: 'google',
        googleId
      });
    }

    await user.save();

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Store refresh token
    user.addRefreshToken(refreshToken);
    await user.save();

    // Return response
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      authProvider: user.authProvider,
      createdAt: user.createdAt
    };

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: userResponse
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Google OAuth callback handler
 * GET /api/auth/google/callback
 * 
 * This is called by Google after user authentication
 * Handles token generation and redirect to frontend
 */
const googleCallback = async (req, res, next) => {
  try {
    const user = req.user; // Set by Passport after successful authentication

    console.log('Google OAuth callback - req.user:', user ? 'User found' : 'No user');
    
    if (!user) {
      console.error('Google OAuth callback - No user found in req.user');
      // Authentication failed - redirect to frontend with error
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(`${frontendUrl}/login?error=authentication_failed`);
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Store refresh token in user document
    user.addRefreshToken(refreshToken);
    await user.save();

    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days (matches refresh token expiry)
    });

    console.log('Google OAuth callback - Success, redirecting to frontend');
    console.log('Access token generated:', accessToken ? 'Yes' : 'No');
    
    // Redirect to frontend with access token as query parameter
    // Note: In production, consider using a more secure method (e.g., one-time token)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const redirectUrl = `${frontendUrl}/auth/callback?token=${encodeURIComponent(accessToken)}`;
    console.log('Redirecting to:', redirectUrl.replace(accessToken, 'TOKEN_HIDDEN'));
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Google OAuth callback - Error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/login?error=authentication_failed`);
  }
};

/**
 * Refresh access token
 * POST /api/auth/refresh
 * Body: { refreshToken: "<refresh-token>" }
 * 
 * Note: This endpoint does NOT rotate the refresh token
 * It only issues a new access token
 */
const refreshToken = async (req, res, next) => {
  try {
    // Try to get refresh token from cookie first, then from body
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required'
      });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Refresh token expired'
        });
      } else if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          error: 'Invalid refresh token'
        });
      }
      throw error;
    }

    // Find user and verify token is in their refreshTokens array
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if refresh token exists in user's refreshTokens array
    if (!user.refreshTokens.includes(refreshToken)) {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token'
      });
    }

    // Generate new access token (DO NOT rotate refresh token)
    const newAccessToken = generateAccessToken(user._id);

    res.json({
      success: true,
      accessToken: newAccessToken
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout - Remove refresh token from user document
 * POST /api/auth/logout
 * Body: { refreshToken: "<refresh-token>" }
 */
const logout = async (req, res, next) => {
  try {
    // Try to get refresh token from cookie first, then from body
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required'
      });
    }

    // Verify refresh token to get userId
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (error) {
      // Even if token is invalid/expired, we can still return success
      // (token is already invalid, so logout is effectively done)
      // Clear cookie if it exists
      res.clearCookie('refreshToken');
      return res.json({
        success: true,
        message: 'Logged out successfully'
      });
    }

    // Find user and remove refresh token
    const user = await User.findById(decoded.userId);
    
    if (user) {
      user.removeRefreshToken(refreshToken);
      await user.save();
    }

    // Clear refresh token cookie
    res.clearCookie('refreshToken');

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 * GET /api/auth/me
 * Requires authentication middleware
 */
const getMe = async (req, res, next) => {
  try {
    // User is already attached to req by authenticateUser middleware
    const user = req.user;
    
    // Return user data (password and refreshTokens already excluded by middleware)
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      authProvider: user.authProvider,
      createdAt: user.createdAt
    };

    res.json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Forgot password - Send reset link to email
 * POST /api/auth/forgot-password
 * Body: { email: "<email>" }
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    // Don't reveal if user exists or not (security best practice)
    // Always return success message
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // Check if user has local auth (has password)
    if (user.authProvider !== 'local' || !user.password) {
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Save reset token and expiry (1 hour from now)
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    // Send reset email
    try {
      await sendPasswordResetEmail(user.email, resetToken);
    } catch (emailError) {
      // If email fails, clear the reset token
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      await user.save();
      
      return res.status(500).json({
        success: false,
        error: 'Failed to send password reset email. Please try again later.'
      });
    }

    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password using token
 * POST /api/auth/reset-password
 * Body: { token: "<reset-token>", password: "<new-password>" }
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        error: 'Token and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      });
    }

    // Hash the token to compare with stored token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid reset token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() } // Token not expired
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired password reset token'
      });
    }

    // Update password
    user.password = password;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    res.json({
      success: true,
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  googleLogin,
  googleCallback,
  refreshToken,
  logout,
  getMe,
  forgotPassword,
  resetPassword
};
