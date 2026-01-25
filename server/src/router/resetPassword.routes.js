const express = require('express');
const router = express.Router();
const resetPasswordController = require('../controller/resetPassword.controller');

// Route to request password reset (send email)
router.post('/request', resetPasswordController.requestPasswordReset);

// Route to reset password (with token)
router.post('/reset', resetPasswordController.resetPassword);

module.exports = router;
