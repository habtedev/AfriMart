
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
    console.log('Register attempt:', { name, email });
    const existing = await User.findOne({ email });
    console.log('Existing user found:', existing);
    if (existing) {
      console.log('Email already registered:', email);
      return res.status(409).json({ message: 'Email already registered.' });
    }
    const user = await User.create({ name, email, password });
    console.log('User created:', user);
    res.status(201).json({ message: 'User registered successfully.' });
  } catch (err) {
    console.log('Register error:', err);
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { error } = validateLogin(req.body);
    if (error) {
      console.log('Validation error:', error.details[0].message);
      return res.status(400).json({ message: error.details[0].message });
    }
    const { email, password } = req.body;
    console.log('Login attempt:', { email, password });
    const user = await User.findOne({ email });
    console.log('User found:', user);
    if (!user) {
      console.log('No user found for email:', email);
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const isMatch = await user.comparePassword(password);
    console.log('Password match result:', isMatch);
    if (!isMatch) {
      console.log('Password does not match for user:', email);
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });
    console.log('JWT token generated:', token);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.log('Login error:', err);
    next(err);
  }
};
