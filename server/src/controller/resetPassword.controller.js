const User = require('../model/user.model');
const crypto = require('crypto');
const sendResetPasswordEmail = require('../service/sendResetPasswordEmail');

// Request password reset: send email with token
exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Construct reset URL based on user type
    let frontendUrl;
    if (req.originalUrl.includes('/admin/')) {
      frontendUrl = process.env.FRONTEND_URL_ADMIN || 'http://localhost:3001';
    } else {
      frontendUrl = process.env.FRONTEND_URL_CUSTOMER || 'http://localhost:3000';
    }
    const resetUrl = `${frontendUrl}/auth/reset-password?token=${token}`;
    await sendResetPasswordEmail(user.email, resetUrl, user.name);
    res.json({ message: 'Reset email sent' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Reset password: verify token and update password
exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    user.password = password; // hash in model pre-save hook
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
