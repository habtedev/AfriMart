// Add resend verification email endpoint for Gmail verification
const { sendVerificationEmail } = require('../controller/emailVerification.controller');

// Usage: POST /api/auth/resend-verification-email
// Body: { email: string }
module.exports = (router) => {
  router.post('/resend-verification-email', sendVerificationEmail);
};
