const { sendMail } = require('../utils/mailer');

async function sendWelcomeEmail({ to, name }) {
  const mailOptions = {
    from: process.env.BREVO_USER,
    to,
    subject: 'Welcome to AfriMart! 🎉',
    html: `
     <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to AfriMart</title>
  <style>
    /* Reset and base styles */
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background: #f9fafb; }
    
    /* Container */
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    
    /* Header */
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; }
    .logo { color: white; font-size: 28px; font-weight: bold; text-decoration: none; }
    
    /* Content */
    .content { padding: 40px 30px; }
    .greeting { font-size: 24px; color: #1f2937; margin-bottom: 20px; }
    .message { color: #6b7280; margin-bottom: 24px; }
    
    /* Button */
    .btn { display: inline-block; background: #4f46e5; color: white; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 16px; }
    .btn:hover { background: #4338ca; }
    
    /* Footer */
    .footer { background: #f3f4f6; padding: 30px; text-align: center; color: #9ca3af; font-size: 14px; }
    .social-links { margin-top: 20px; }
    .social-links a { margin: 0 10px; color: #6b7280; text-decoration: none; }
    
    /* Responsive */
    @media (max-width: 640px) {
      .header, .content { padding: 30px 20px; }
      .greeting { font-size: 20px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <a href="{{frontendUrl}}" class="logo">AfriMart</a>
    </div>
    
    <div class="content">
      <h1 class="greeting">Welcome, ${name}! 🎉</h1>
      
      <p class="message">Thank you for joining AfriMart, your gateway to Africa's finest products and services.</p>
      
      <p class="message">Your account has been successfully created. Here's what you can do next:</p>
      
      <ul style="color: #6b7280; margin-bottom: 24px; padding-left: 20px;">
        <li style="margin-bottom: 8px;">Complete your profile to get personalized recommendations</li>
        <li style="margin-bottom: 8px;">Browse thousands of authentic African products</li>
        <li style="margin-bottom: 8px;">Enjoy exclusive member discounts</li>
        <li>Start selling your own products</li>
      </ul>
      
      <a href="{{frontendUrl}}" class="btn">Start Shopping Now</a>
      
      <p style="margin-top: 32px; color: #6b7280; font-size: 14px;">
        If you didn't create this account, please ignore this email or contact our support team.
      </p>
    </div>
    
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} AfriMart. All rights reserved.</p>
      <p>This email was sent to you as a registered user of AfriMart.</p>
      
      <div class="social-links">
        <a href="https://twitter.com/afrimart">Twitter</a> | 
        <a href="https://facebook.com/afrimart">Facebook</a> | 
        <a href="https://instagram.com/afrimart">Instagram</a>
      </div>
      
      <p style="margin-top: 20px; font-size: 12px;">
        AfriMart Inc.<br>
        18 Maraki, Gondar, Ethiopia
      </p>
    </div>
  </div>
</body>
</html>
    `,
  };
  await sendMail(mailOptions);
}

module.exports = { sendWelcomeEmail };
