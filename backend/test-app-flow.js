// Test: Simulate app sending invitation to understand email issue
const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('=== SIMULATING APP INVITATION FLOW ===\n');

// Step 1: Verify Gmail service
console.log('Step 1: Verifying Gmail configuration...');
console.log(`  EMAIL_PROVIDER: ${process.env.EMAIL_PROVIDER}`);
console.log(`  EMAIL_USER: ${process.env.EMAIL_USER}`);
console.log(`  EMAIL_FROM: ${process.env.EMAIL_FROM}\n`);

// Step 2: Create transporter (like emailService does)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Step 3: Prepare email like the app does
const inviteData = {
  email: 'rit15092022@gmail.com', // The email you tested with
  name: 'Test User',
  role: 'Finance Manager',
  inviteToken: 'test123456789abcdef'
};

const inviteLink = `http://localhost:5500/index.html#accept-invite?token=${inviteData.inviteToken}`;

const mailOptions = {
  from: process.env.EMAIL_FROM,
  to: inviteData.email,
  subject: '🚛 FreightFlow - You\'re Invited to Join Your Team',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; border-radius: 8px;">
      <div style="background: linear-gradient(135deg, #1e3a5f, #3b82f6); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">🚛 FreightFlow</h1>
        <p style="margin: 10px 0 0 0; font-size: 14px;">Enterprise Freight Invoice Automation</p>
      </div>
      <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px;">
        <p style="color: #333; font-size: 16px; margin-bottom: 10px;">Hello ${inviteData.name},</p>
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
      </div>
    </div>
  `
};

console.log('Step 2: Email configuration prepared');
console.log(`  To: ${mailOptions.to}`);
console.log(`  From: ${mailOptions.from}`);
console.log(`  Subject: ${mailOptions.subject}\n`);

// Step 3: Send email
console.log('Step 3: Sending email...\n');
transporter.sendMail(mailOptions, (err, info) => {
  if (err) {
    console.error('❌ SEND FAILED:');
    console.error(`  Error: ${err.message}`);
    console.error(`  Code: ${err.code}`);
    console.error(`  Full error:`, err);
    console.log('\n📋 TROUBLESHOOTING:');
    console.log('  1. Check Gmail Account Security Settings');
    console.log('     - Go to: https://myaccount.google.com/security');
    console.log('     - Check if "Less secure app access" is enabled');
    console.log('  2. Verify App Password is correct');
    console.log('  3. Check if Gmail account is locked or needs verification');
  } else {
    console.log('✅ EMAIL SENT SUCCESSFULLY!');
    console.log(`  Message ID: ${info.messageId}`);
    console.log(`  Response: ${info.response}`);
    console.log('\n📋 NEXT STEPS:');
    console.log(`  1. Check ${inviteData.email} inbox`);
    console.log('  2. Look for subject: "🚛 FreightFlow - You\'re Invited to Join Your Team"');
    console.log('  3. Check SPAM folder if not in Inbox');
    console.log('  4. Wait 5+ minutes for delivery if not immediate');
  }
  process.exit(err ? 1 : 0);
});
