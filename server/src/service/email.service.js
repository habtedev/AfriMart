const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS,
  },
});

/**
 * Send an email using Brevo SMTP
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} [options.text] - Plain text content
 * @param {string} [options.html] - HTML content
 * @returns {Promise}
 */
async function sendMail({ to, subject, text, html }) {
  return transporter.sendMail({
    from: `"AfriMart" <${process.env.BREVO_USER}>`,
    to,
    subject,
    text,
    html,
  });
}

module.exports = { sendMail };
