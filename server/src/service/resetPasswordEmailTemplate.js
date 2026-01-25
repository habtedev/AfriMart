/**
 * Returns a modern, production-ready HTML email template for password reset
 * @param {string} resetUrl - Password reset URL
 * @param {string} [userName] - Optional user name
 * @returns {string} HTML email
 */
function getResetPasswordEmailTemplate(resetUrl, userName = '') {
  const year = new Date().getFullYear();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reset Your Password</title>
</head>

<body style="margin:0; padding:0; background-color:#f4f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding:24px 0;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#2563eb; padding:24px; text-align:center;">
              <h1 style="margin:0; font-size:22px; color:#ffffff;">AfriMart</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="font-size:16px; color:#111827; margin:0 0 16px;">
                ${userName ? `Hello <strong>${userName}</strong>,` : 'Hello,'}
              </p>
              <p style="font-size:15px; color:#374151; line-height:1.6; margin:0 0 20px;">
                We received a request to reset your AfriMart account password. Click the button below to set a new password. If you did not request this, you can safely ignore this email.
              </p>
              <div style="text-align:center; margin:32px 0;">
                <a href="${resetUrl}" style="display:inline-block; padding:14px 32px; background:#2563eb; color:#fff; border-radius:8px; font-size:16px; font-weight:600; text-decoration:none;">Reset Password</a>
              </div>
              <p style="font-size:13px; color:#6b7280; line-height:1.5; margin:0 0 12px;">
                This link will expire in <strong>1 hour</strong> for your security.
              </p>
              <p style="font-size:13px; color:#6b7280; line-height:1.5; margin:0;">
                If you have any questions, please contact our support team.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb; padding:20px; text-align:center;">
              <p style="margin:0; font-size:12px; color:#9ca3af;">
                © ${year} AfriMart. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

module.exports = { getResetPasswordEmailTemplate };
