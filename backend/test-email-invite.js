// Test Email Invitation System
require('dotenv').config();
const fetch = require('node-fetch');

const API_URL = 'http://localhost:5000';

// Demo user token (from environment or use the demo account)
const DEMO_TOKEN = process.env.DEMO_TOKEN || 'demo-token';

console.log('\n🧪 EMAIL INVITATION TEST');
console.log('═══════════════════════════════════════════════════════');

async function testEmailInvite() {
  try {
    // Step 1: Login as demo user to get token
    console.log('\n📝 Step 1: Getting authentication token...');
    
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'demo@freightflow.in',
        password: 'demo1234'
      })
    });

    const loginData = await loginRes.json();
    
    if (!loginData.token) {
      console.error('❌ Login failed:', loginData.error);
      return;
    }

    const token = loginData.token;
    console.log('✅ Got authentication token');

    // Step 2: Send email invitation
    console.log('\n📧 Step 2: Sending email invitation...');
    
    const inviteRes = await fetch(`${API_URL}/auth/invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        email: 'testuser@freightflow.in',
        name: 'Test User',
        role: 'manager',
        channel: 'email'
      })
    });

    const inviteData = await inviteRes.json();

    if (inviteData.success) {
      console.log('✅ Invitation created successfully!');
      console.log(`   Invite Token: ${inviteData.invite_token}`);
      
      if (inviteData.email) {
        console.log(`\n📧 Email Status: ${inviteData.email.status.toUpperCase()}`);
        console.log(`   Email: ${inviteData.email.email}`);
        console.log(`   Message: ${inviteData.email.message}`);
        console.log(`   Is Mocked: ${inviteData.email.isMocked}`);
        
        if (inviteData.email.status === 'sent') {
          console.log(`   Message ID: ${inviteData.email.messageId}`);
          console.log('\n✅ SUCCESS: Email invitation sent to testuser@freightflow.in');
        } else if (inviteData.email.status === 'mock') {
          console.log('\n⚠️  Email in MOCK MODE - check server logs for the email content');
        }
      }
    } else {
      console.error('❌ Invitation failed:', inviteData.error);
      return;
    }

    // Step 3: Check email service status
    console.log('\n📊 Step 3: Checking email service status...');
    
    const statusRes = await fetch(`${API_URL}/api/email/status`);
    const statusData = await statusRes.json();
    
    console.log(`✅ Email Service Status:`);
    console.log(`   Status: ${statusData.status}`);
    console.log(`   Active: ${statusData.isActive}`);
    console.log(`   Provider: ${statusData.provider}`);

  } catch (err) {
    console.error('\n❌ Error:', err.message);
  }
}

testEmailInvite();
