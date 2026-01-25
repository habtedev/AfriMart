// server/src/controller/socialAuth.controller.js
// Social login controller for Google and Facebook
const passport = require('passport');

// This file assumes you will configure passport strategies in a separate file (e.g., passport.js)
// and initialize passport in your main app.js

exports.googleAuth = passport.authenticate('google', { scope: ['profile', 'email'] });

const jwt = require('jsonwebtoken');
const { setAuthCookie } = require('../middleware/auth.middleware');
exports.googleAuthCallback = (req, res) => {
  if (req.user) {
    req.session.user = {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    };
    // Set JWT as HTTP-only cookie for frontend authentication
    const token = jwt.sign({ id: req.user._id, email: req.user.email, role: req.user.role }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });
    setAuthCookie(res, token);
  } else {
    console.warn('[socialAuth.controller] No req.user in callback');
  }
  res.redirect('http://localhost:3000/');
};


// You may want to add JWT/token generation here for your frontend
