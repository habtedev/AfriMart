const express = require('express');
const router = express.Router();
const emailVerificationController = require('../controller/emailVerification.controller');
const authController = require('../controller/auth.controller');
const resetPasswordController = require('../controller/resetPassword.controller');
// Validate OTP for password reset
router.post('/validate-reset-otp', (req, res, next) => authController.validateResetOtp(req, res, next));
// Endpoint to get current verification token for a user (for debugging/support)
router.get('/current-verification-token', emailVerificationController.getCurrentVerificationToken);
// Email verification
router.post('/resend-verification-email', emailVerificationController.sendVerificationEmail);
router.post('/send-verification-email', emailVerificationController.sendVerificationEmail); // for compatibility
// OTP verification endpoint (POST for security)
router.post('/verify-email-otp', emailVerificationController.verifyEmailOtp);



router.post('/register', (req, res, next) => authController.register(req, res, next));
router.post('/login', (req, res, next) => authController.login(req, res, next));
router.post('/admin-login', (req, res, next) => authController.adminLogin(req, res, next));


// Password reset request
router.post('/request-password-reset', (req, res, next) => resetPasswordController.requestPasswordReset(req, res, next));
// Password reset (set new password)
router.post('/reset-password', (req, res, next) => resetPasswordController.resetPassword(req, res, next));

// Admin password reset
router.post('/admin/request-password-reset', (req, res, next) => resetPasswordController.requestPasswordReset(req, res, next));
router.post('/admin/reset-password', (req, res, next) => resetPasswordController.resetPassword(req, res, next));

// Return current authenticated user (for social login callback)
const jwt = require('jsonwebtoken');
router.get('/me', (req, res) => {
  if (req.session && req.session.user) {
    // Social login (session-based)
    return res.json({ user: req.session.user });
  }
  const token = req.cookies && req.cookies.accessToken;
  if (!token) {
    return res.status(401).json({ user: null });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Return user info for both admin and customer
    res.json({ user: { id: decoded.id, email: decoded.email, role: decoded.role } });
  } catch (err) {
    return res.status(401).json({ user: null });
  }
});

module.exports = router;
