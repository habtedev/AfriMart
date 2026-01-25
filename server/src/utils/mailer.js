const nodemailer = require('nodemailer');


// Debug: print which Gmail SMTP env vars are being used (do not print secrets)
console.log('[Gmail SMTP] Using sender:', process.env.GMAIL_USER);
console.log('[Gmail SMTP] App password starts with:', process.env.GMAIL_PASS ? process.env.GMAIL_PASS.slice(0, 4) + '...' : 'undefined');


const smtpOptions = {
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER, // e.g. your Gmail address
    pass: process.env.GMAIL_PASS, // Gmail password or App Password
  },
};
console.log('[Gmail SMTP] Connection options:', {
  host: smtpOptions.host,
  port: smtpOptions.port,
  secure: smtpOptions.secure,
  user: smtpOptions.auth.user,
  pass: smtpOptions.auth.pass ? smtpOptions.auth.pass.slice(0, 4) + '...' : 'undefined',
});

const transporter = nodemailer.createTransport(smtpOptions);

// Verify SMTP connection on startup
transporter.verify(function(error, success) {
  if (error) {
    console.error('[Mailer] SMTP connection failed:', error);
  } else {
    console.log('[Mailer] SMTP server is ready to take messages');
  }
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

async function sendMail({ to, subject, html, text }) {
  console.log('[Mailer] Preparing to send email:', { to, subject });
  try {
    console.log('[Mailer] Attempting to send email...');
    const info = await transporter.sendMail({
      from: `"AfriMart" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
      text,
    });
    console.log('[Mailer] Email sent:', info);
    if (info.rejected && info.rejected.length > 0) {
      console.error('[Mailer] Email rejected for:', info.rejected);
    }
    return info;
  } catch (err) {
    if (err.response) {
      console.error('[Mailer] SMTP response error:', err.response);
    }
    if (err.code) {
      console.error('[Mailer] SMTP error code:', err.code);
    }
    if (err.command) {
      console.error('[Mailer] SMTP error command:', err.command);
    }
    console.error('[Mailer] sendMail error:', err && err.stack ? err.stack : err);
    throw err;
  }
}

module.exports = { sendMail };
