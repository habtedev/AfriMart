const { sendMail } = require('./email.service');
const { getResetPasswordEmailTemplate } = require('./resetPasswordEmailTemplate');

/**
 * Send a password reset email
 * @param {string} to - Recipient email address
 * @param {string} resetUrl - Password reset URL
 * @param {string} [userName] - Optional user name
 */
async function sendResetPasswordEmail(to, resetUrl, userName = '') {
  const html = getResetPasswordEmailTemplate(resetUrl, userName);
  const subject = 'Reset Your AfriMart Password';
  await sendMail({ to, subject, html });
}

module.exports = { sendResetPasswordEmail };
