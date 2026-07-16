const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('=== GMAIL EMAIL TEST ===\n');
console.log('Configuration:');
console.log(`  EMAIL_PROVIDER: ${process.env.EMAIL_PROVIDER}`);
console.log(`  EMAIL_USER: ${process.env.EMAIL_USER}`);
console.log(`  EMAIL_PASSWORD length: ${process.env.EMAIL_PASSWORD?.length}`);
console.log(`  EMAIL_FROM: ${process.env.EMAIL_FROM}\n`);

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

async function runTest() {
  try {
    console.log('Step 1: Verifying SMTP connection...');
    const verified = await transporter.verify();
    console.log('Result:', verified ? '✅ Connection verified' : '❌ Connection failed');
    
    if (!verified) {
      console.log('\n❌ SMTP verification failed. Stopping test.');
      process.exit(1);
    }

    console.log('\nStep 2: Sending test email to testinbox@10minutemail.com...');
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: 'testinbox@10minutemail.com',
      subject: 'FreightFlow Email Test - ' + new Date().toISOString(),
      text: 'This is a test from FreightFlow email system.',
      html: '<h1>FreightFlow Test</h1><p>Email sending test from your server.</p>'
    });

    console.log('Result: ✅ Email sent successfully!');
    console.log(`  Message ID: ${info.messageId}`);
    console.log(`  Response: ${info.response}`);
    console.log('\n✅ YOUR EMAIL SYSTEM IS WORKING!');
    console.log('\nIf recipient still doesn\'t see email:');
    console.log('  1. Check SPAM folder');
    console.log('  2. Check recipient email is correct');
    console.log('  3. Wait 5+ minutes for delivery');
    
  } catch (err) {
    console.error('\n❌ Error occurred:');
    console.error(`  Message: ${err.message}`);
    console.error(`  Code: ${err.code}`);
    if (err.response) console.error(`  Response: ${err.response}`);
    console.error('\n📋 Troubleshooting:');
    console.error('  1. Verify Gmail App Password is correct');
    console.error('  2. Check if Gmail security allows 3rd party apps');
    console.error('  3. Try resetting the App Password in Gmail settings');
  }

  process.exit(0);
}

runTest();
