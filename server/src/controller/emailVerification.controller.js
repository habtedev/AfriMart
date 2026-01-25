// Endpoint to get current verification token for a user (for debugging/support)
exports.getCurrentVerificationToken = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.isEmailVerified) {
      return res.status(400).json({ error: 'Email already verified' });
    }
    if (!user.emailVerificationToken || !user.emailVerificationExpires) {
      return res.status(400).json({ error: 'No verification token set. Please request a new verification email.' });
    }
    return res.json({ token: user.emailVerificationToken, expires: user.emailVerificationExpires });
  } catch (error) {
    console.error('[getCurrentVerificationToken] Error:', error);
    res.status(500).json({ error: 'Failed to get verification token' });
  }
};
// server/src/controller/emailVerification.controller.js
const { sendMail } = require('../utils/mailer');
const { getVerificationEmailTemplate } = require('../service/verify');
const crypto = require('crypto');
const User = require('../model/user.model');
const { getShortUrl } = require('../utils/urlShortener');

// Send verification email to user
exports.sendVerificationEmail = async (req, res) => {
  try {

    let { email } = req.body;
    if (!email) {
      console.warn('[EmailVerification] No email provided in request body');
      return res.status(400).json({ error: 'Email is required' });
    }
    // Normalize email (trim and lowercase)
    email = email.trim().toLowerCase();

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.warn(`[EmailVerification] User not found for email: ${email}`);
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.isEmailVerified) {
      return res.status(400).json({ error: 'Account already verified. No verification email sent.' });
    }


    // Only generate OTP for verification
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.emailVerificationOtp = otpCode;
    user.emailVerificationOtpExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save();
    console.log(`[DEBUG] Generated OTP for ${email}:`, otpCode);

    // Use the shared HTML template from service/verify.js (pass OTP only)
    const userName = user.name || user.fullName || user.username || '';
    const html = getVerificationEmailTemplate(undefined, userName, otpCode);

    try {
      await sendMail({
        to: user.email,
        subject: 'Your AfriMart OTP',
        html
      });
      console.log(`[EmailVerification] OTP email sent to ${email}`);
      res.json({ message: 'OTP email sent' });
    } catch (mailErr) {
      console.error('[EmailVerification] Failed to send OTP email:', mailErr);
      res.status(500).json({ error: 'Failed to send OTP email' });
    }
  } catch (error) {
    console.error('[EmailVerification] Unexpected error:', error);
    res.status(500).json({ error: 'Failed to process verification request' });
  }
};

// Remove token verification endpoint (OTP only)

// Add OTP verification endpoint
exports.verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required.' });
    }
    const user = await User.findOne({
      email,
      emailVerificationOtp: otp,
      emailVerificationOtpExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }
    if (user.isEmailVerified) {
      return res.status(400).json({ error: 'Email already verified.' });
    }
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    user.emailVerificationOtp = undefined;
    user.emailVerificationOtpExpires = undefined;
    await user.save();
    res.json({ message: 'Email verified successfully.' });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ error: 'Verification failed.' });
  }
};
