// server/src/service/verify.js

/**
 * Returns a modern, production-ready HTML email template for email verification
 * @param {string} verifyUrl - Email verification URL
 * @param {string} [userName] - Optional user name
 * @param {string} [otpCode] - Optional OTP code
 * @returns {string} HTML email
 */
function getVerificationEmailTemplate(verifyUrl, userName = '', otpCode = '') {
  const year = new Date().getFullYear();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Email Verification</title>
</head>

<body style="margin:0; padding:0; background-color:#f4f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding:24px 0;">
    <tr>
      <td align="center">

        <!-- Main container -->
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background:#2563eb; padding:24px; text-align:center;">
              <h1 style="margin:0; font-size:22px; color:#ffffff;">AfriMart</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:32px;">
              <p style="font-size:16px; color:#111827; margin:0 0 16px;">
                ${userName ? `Hello <strong>${userName}</strong>,` : 'Hello,'}
              </p>

              <p style="font-size:15px; color:#374151; line-height:1.6; margin:0 0 20px;">
                Thank you for creating an AfriMart account. To finish setting up your account, please verify your email address using the OTP below or by clicking the verification button.
              </p>

              <!-- OTP -->
              ${
                otpCode
                  ? `
              <div style="text-align:center; margin:24px 0;">
                <div style="font-size:13px; color:#6b7280; margin-bottom:8px;">
                  Your One-Time Password (OTP)
                </div>
                <div style="display:inline-block; padding:14px 28px; border-radius:8px; background:#f1f5f9; font-size:28px; letter-spacing:6px; font-weight:700; color:#111827;">
                  ${otpCode}
                </div>
              </div>
              `
                  : ''
              }


              <!-- No button: OTP only -->

              <!-- Info -->
              <p style="font-size:13px; color:#6b7280; line-height:1.5; margin:0 0 12px;">
                This verification link and OTP will expire in <strong>30 minutes</strong>.  
                Only the most recent code will be accepted.
              </p>

              <p style="font-size:13px; color:#6b7280; line-height:1.5; margin:0;">
                If you did not create an AfriMart account, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
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

module.exports = { getVerificationEmailTemplate };
