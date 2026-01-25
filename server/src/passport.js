// server/src/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./model/user.model');

// Replace with your actual client IDs and secrets
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'GOOGLE_CLIENT_ID';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'GOOGLE_CLIENT_SECRET';

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/social-auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.debug('[passport.js] Google profile:', profile);
    // Find user by email (not by admin)
    let user = await User.findOne({ email: profile.emails[0].value });
    console.debug('[passport.js] User found by email:', user);
    if (!user) {
      // Not registered, deny login
      console.warn('[passport.js] No user found for email:', profile.emails[0].value);
      return done(null, false, { message: 'User email not found.' });
    }
    // Link googleId if not set
    let updated = false;
    if (!user.googleId) {
      user.googleId = profile.id;
      updated = true;
      console.debug('[passport.js] Linked googleId to user:', user.googleId);
    }
    // Mark email as verified if not already
    if (!user.isEmailVerified) {
      user.isEmailVerified = true;
      updated = true;
      console.debug('[passport.js] Set isEmailVerified=true for social login');
    }
    if (updated) {
      await user.save();
    }
    return done(null, user);
  } catch (err) {
    console.error('[passport.js] Error in GoogleStrategy:', err);
    return done(err, null);
  }
}));


module.exports = passport;
