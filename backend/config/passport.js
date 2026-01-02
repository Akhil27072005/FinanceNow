const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

/**
 * Passport Google OAuth Strategy Configuration
 * Handles Google OAuth authentication flow
 * Only initializes if Google OAuth credentials are provided
 */
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`
      },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const { id: googleId, displayName: name, emails } = profile;
        const email = emails && emails[0] ? emails[0].value : null;

        if (!email) {
          return done(new Error('Email not provided by Google'), null);
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
          }
          if (!user.name) {
            user.name = name;
          }
          await user.save();
        } else {
          // Create new user
          user = new User({
            name: name || 'Google User',
            email: email.toLowerCase(),
            authProvider: 'google',
            googleId
          });
          await user.save();
        }

        console.log('Passport Google Strategy - User found/created:', user.email);
        return done(null, user);
      } catch (error) {
        console.error('Passport Google Strategy - Error:', error);
        return done(error, null);
      }
    }
  )
  );
} else {
  console.warn('⚠️  Google OAuth credentials not found. Google OAuth login will be disabled.');
  console.warn('   Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file to enable Google OAuth.');
}

/**
 * Serialize user for session (not used with JWT, but required by Passport)
 */
passport.serializeUser((user, done) => {
  done(null, user._id);
});

/**
 * Deserialize user from session (not used with JWT, but required by Passport)
 */
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;

