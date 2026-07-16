const nodemailer = require('nodemailer');
require('dotenv').config();

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

async function testEmail() {
  try {
    console.log('Testing Gmail SMTP connection...');
    console.log('Email User:', process.env.EMAIL_USER);
    console.log('Password length:', process.env.EMAIL_PASSWORD?.length || 0);
    
    // Verify connection
    await transporter.verify();
    console.log('✅ Gmail connection verified!');
    
    // Send test email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: 'test@example.com',
      subject: 'Test Email from FreightFlow',
      text: 'This is a test email from FreightFlow',
      html: '<h1>Test Email</h1><p>This is a test email from FreightFlow</p>'
    });
    
    console.log('✅ Test email sent!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error('Full error:', err);
  }
  
  process.exit(0);
}

testEmail();
