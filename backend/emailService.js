// Email Service - Real Implementation with Nodemailer
// Supports Gmail, Outlook, SendGrid, or custom SMTP

const nodemailer = require('nodemailer');

let emailTransporter = null;
let emailServiceStatus = 'not_initialized';

async function initializeEmailService() {
  const emailProvider = process.env.EMAIL_PROVIDER || 'gmail';
  const emailUser = process.env.EMAIL_USER || '';
  const emailPass = process.env.EMAIL_PASSWORD || '';
  const emailHost = process.env.EMAIL_HOST || '';
  const emailPort = process.env.EMAIL_PORT || 587;
  const emailFrom = process.env.EMAIL_FROM || emailUser;

  try {
    if (emailProvider === 'gmail' && emailUser && emailPass) {
      // Gmail OAuth2 setup
      emailTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPass  // Use App Password if 2FA enabled
        },
        tls: {
          rejectUnauthorized: false  // Handle SSL certificate issues
        }
      });

      // Test the connection
      await emailTransporter.verify();
      emailServiceStatus = 'active_gmail';
      console.log('✅ Email Service: Gmail configured and verified');
    } else if (emailProvider === 'custom' && emailHost && emailPort && emailUser && emailPass) {
      // Custom SMTP (Outlook, SendGrid, AWS SES, etc.)
      emailTransporter = nodemailer.createTransport({
        host: emailHost,
        port: parseInt(emailPort),
        secure: emailPort === 465,
        auth: {
          user: emailUser,
          pass: emailPass
        },
        tls: {
          rejectUnauthorized: false  // Handle SSL certificate issues
        }
      });

      // Test the connection
      await emailTransporter.verify();
      emailServiceStatus = 'active_custom';
      console.log('✅ Email Service: Custom SMTP configured and verified');
    } else {
      // Mock mode
      emailServiceStatus = 'mock_mode';
      console.log('⚠️  Email Service: Mock mode enabled');
      console.log('   To enable real emails, set EMAIL_PROVIDER and credentials in .env');
      emailTransporter = null;
    }
  } catch (err) {
    emailServiceStatus = 'error';
    console.error('🚨 Email Service Initialization Error:', err.message);
    console.error('   Falling back to mock mode');
    emailTransporter = null;
  }
}

function getEmailServiceStatus() {
  return {
    status: emailServiceStatus,
    isActive: emailServiceStatus.startsWith('active_'),
    provider: emailServiceStatus.includes('gmail') ? 'gmail' : 
              emailServiceStatus.includes('custom') ? 'custom' : 'none'
  };
}

async function sendInviteEmail(toEmail, userName, inviteLink, inviteToken) {
  if (!emailTransporter) {
    // Mock mode
    console.log(`\n📧 ═══════════════════════════════════════════════════`);
    console.log(`   [MOCK EMAIL - ${emailServiceStatus.toUpperCase()}] Invite sent to ${toEmail}`);
    console.log(`   Invite Link: ${inviteLink}`);
    console.log(`   Token: ${inviteToken}`);
    console.log(`   User: ${userName}`);
    console.log(`📧 ═══════════════════════════════════════════════════\n`);
    return { 
      status: 'mock', 
      email: toEmail, 
      message: 'Email sent (MOCK MODE)',
      isMocked: true
    };
  }

  const emailFrom = process.env.EMAIL_FROM || process.env.EMAIL_USER;
  
  const mailOptions = {
    from: emailFrom,
    to: toEmail,
    subject: '🚛 FreightFlow - You\'re Invited to Join Your Team',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; border-radius: 8px;">
        <div style="background: linear-gradient(135deg, #1e3a5f, #3b82f6); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">🚛 FreightFlow</h1>
          <p style="margin: 10px 0 0 0; font-size: 14px;">Enterprise Freight Invoice Automation</p>
        </div>

        <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px;">
          <p style="color: #333; font-size: 16px; margin-bottom: 10px;">Hello ${userName},</p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            You've been invited to join FreightFlow! Click the button below to accept the invitation and set up your account.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteLink}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 32px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px;">
              Accept Invitation
            </a>
          </div>

          <p style="color: #999; font-size: 13px; margin: 20px 0;">
            Or copy this link: <a href="${inviteLink}" style="color: #3b82f6; text-decoration: none;">${inviteLink}</a>
          </p>

          <div style="background: #f0f4f8; padding: 15px; border-radius: 4px; margin-top: 30px;">
            <p style="color: #666; font-size: 13px; margin: 0;">
              <strong>Invite Token:</strong><br>
              <code style="background: #e0e7ff; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${inviteToken}</code>
            </p>
          </div>

          <p style="color: #999; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
            This invitation will expire in 7 days. If you didn't expect this invitation, please contact your administrator.
          </p>
        </div>

        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
          <p>© 2026 FreightFlow. All rights reserved.</p>
        </div>
      </div>
    `
  };

  try {
    console.log(`\n📧 ═══════════════════════════════════════════════════`);
    console.log(`   Attempting to send invite email to: ${toEmail}`);
    console.log(`   User: ${userName}`);
    
    const info = await emailTransporter.sendMail(mailOptions);
    
    console.log(`✅ INVITE EMAIL DELIVERED`);
    console.log(`   To: ${toEmail}`);
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Response: ${info.response}`);
    console.log(`📧 ═══════════════════════════════════════════════════\n`);
    
    return { 
      status: 'sent', 
      email: toEmail, 
      messageId: info.messageId,
      message: `Email sent successfully to ${toEmail}`,
      isMocked: false
    };
  } catch (err) {
    console.error(`\n❌ ═══════════════════════════════════════════════════`);
    console.error(`   FAILED TO SEND EMAIL TO: ${toEmail}`);
    console.error(`   Error: ${err.message}`);
    console.error(`   Code: ${err.code}`);
    console.error(`   Stack: ${err.stack}`);
    console.error(`❌ ═══════════════════════════════════════════════════\n`);
    
    return { 
      status: 'error', 
      email: toEmail, 
      error: err.message,
      code: err.code,
      message: `Failed to send email: ${err.message}`,
      isMocked: false
    };
  }
}

async function sendPasswordResetEmail(toEmail, userName, resetLink, resetToken) {
  if (!emailTransporter) {
    console.log(`\n📧 [MOCK EMAIL - ${emailServiceStatus.toUpperCase()}] Password reset sent to ${toEmail}`);
    console.log(`   Reset Link: ${resetLink}`);
    console.log(`   Token: ${resetToken}\n`);
    return { 
      status: 'mock', 
      email: toEmail,
      message: 'Password reset email (MOCK MODE)',
      isMocked: true
    };
  }

  const emailFrom = process.env.EMAIL_FROM || process.env.EMAIL_USER;
  
  const mailOptions = {
    from: emailFrom,
    to: toEmail,
    subject: '🔐 FreightFlow - Reset Your Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; border-radius: 8px;">
        <div style="background: linear-gradient(135deg, #1e3a5f, #3b82f6); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">🔐 Password Reset</h1>
          <p style="margin: 10px 0 0 0; font-size: 14px;">FreightFlow Security</p>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px;">
          <p style="color: #333; font-size: 16px; margin-bottom: 10px;">Hello ${userName},</p>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            We received a request to reset your password. Click the button below to set a new password:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 32px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px;">
              Reset Password
            </a>
          </div>
          <p style="color: #999; font-size: 13px; margin: 20px 0;">
            Or copy this link: <a href="${resetLink}" style="color: #3b82f6; text-decoration: none;">${resetLink}</a>
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
            This link will expire in 1 hour. If you didn't request this, please ignore this email and your password will remain unchanged.
          </p>
        </div>
        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
          <p>© 2026 FreightFlow. All rights reserved.</p>
        </div>
      </div>
    `
  };

  try {
    console.log(`\n📧 Attempting to send password reset email to: ${toEmail}`);
    const info = await emailTransporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${toEmail}`);
    console.log(`   Message ID: ${info.messageId}\n`);
    return { 
      status: 'sent', 
      email: toEmail, 
      messageId: info.messageId,
      message: `Password reset email sent to ${toEmail}`,
      isMocked: false
    };
  } catch (err) {
    console.error(`\n❌ Error sending password reset email to ${toEmail}`);
    console.error(`   Error: ${err.message}\n`);
    return { 
      status: 'error', 
      email: toEmail, 
      error: err.message,
      message: `Failed to send reset email: ${err.message}`,
      isMocked: false
    };
  }
}

module.exports = {
  initializeEmailService,
  getEmailServiceStatus,
  sendInviteEmail,
  sendPasswordResetEmail
};
