const express = require('express');
const router = express.Router();
const socialAuthController = require('../controller/socialAuth.controller');

// Google OAuth for admin
router.get('/google', socialAuthController.googleAuth);
const passport = require('../passport');
router.get('/google/callback',
	passport.authenticate('google', { failureRedirect: '/auth/login', session: true }),
	socialAuthController.googleAuthCallback
);

module.exports = router;
