// User login handler

// Admin login handler
exports.adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    const user = await User.findOne({ email: email.trim().toLowerCase(), role: 'admin' });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password, or not an admin.' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    // Optionally, check if admin is disabled or banned here

    const payload = { id: user._id, email: user.email, role: user.role, isEmailVerified: user.isEmailVerified, name: user.name };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('accessToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({
      message: 'Admin login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (err) {
    next(err);
  }
};
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    // Check password (assume user model has comparePassword method)
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    // Optionally, check if user is disabled or banned here

    // Return user info and JWT (even if not verified, so frontend can redirect)
    const payload = { id: user._id, email: user.email, isEmailVerified: user.isEmailVerified, name: user.name };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('accessToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (err) {
    next(err);
  }
};
const crypto = require('crypto');
const { sendMail } = require('../utils/mailer');



const User = require('../model/user.model');
const jwt = require('jsonwebtoken');
const { validateRegister, validateLogin } = require('../utils/validator');

exports.register = async (req, res, next) => {
  try {
    const { error } = validateRegister(req.body);
    if (error) {
      console.log('Register validation error:', error.details[0].message);
      return res.status(400).json({ message: error.details[0].message });
    }
    const { name, email, password } = req.body;
    // Create the user first
    const user = new User({ name, email, password, isEmailVerified: false });
    await user.save();

    // Send OTP email immediately after registration
    try {
      // Import controller directly to avoid circular dependency
      const { sendVerificationEmail } = require('./emailVerification.controller');
      // Fake req/res for internal call
      const fakeReq = { body: { email: user.email } };
      const fakeRes = {
        json: (data) => console.log('[REGISTER][OTP SENT]', data),
        status: (code) => ({ json: (data) => console.log(`[REGISTER][OTP ERROR ${code}]`, data) })
      };
      await sendVerificationEmail(fakeReq, fakeRes);
    } catch (otpErr) {
      console.error('[REGISTER] Failed to send OTP after registration:', otpErr);
    }

    // Do NOT set JWT cookie here: user should verify email and then login
    res.status(201).json({ message: 'User registered successfully', user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    next(err);
  }
};
