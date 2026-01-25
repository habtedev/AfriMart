// server/src/router/socialAuth.routes.js
const express = require('express');
const passport = require('passport');
const router = express.Router();
const socialAuthController = require('../controller/socialAuth.controller');

// Google Auth
router.get('/google', socialAuthController.googleAuth);
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), socialAuthController.googleAuthCallback);


module.exports = router;
