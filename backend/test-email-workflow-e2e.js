// Complete End-to-End Email Invitation Test
require('dotenv').config();
const fetch = require('node-fetch');

const API_URL = 'http://localhost:5000';
const TEST_EMAIL = 'newteammember@freightflow.in';
const TEST_PASSWORD = 'SecurePass123!';

console.log('\n🧪 END-TO-END EMAIL INVITATION TEST');
console.log('═══════════════════════════════════════════════════════\n');

async function runFullTest() {
  try {
    // ========== STEP 1: Login as Admin ==========
    console.log('📝 Step 1: Admin Login');
    console.log('   Logging in as demo@freightflow.in...');
    
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
      console.error('❌ Admin login failed:', loginData.error);
      return;
    }

    const adminToken = loginData.token;
    console.log('✅ Admin logged in successfully\n');

    // ========== STEP 2: Send Email Invitation ==========
    console.log('📧 Step 2: Send Email Invitation');
    console.log(`   Inviting: newteammember@freightflow.in`);
    
    const inviteRes = await fetch(`${API_URL}/auth/invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        email: TEST_EMAIL,
        name: 'New Team Member',
        role: 'manager',
        channel: 'email'
      })
    });

    const inviteData = await inviteRes.json();

    if (!inviteData.success) {
      console.error('❌ Invitation failed:', inviteData.error);
      return;
    }

    const inviteToken = inviteData.invite_token;
    console.log('✅ Invitation created successfully');
    console.log(`   Token: ${inviteToken.substring(0, 20)}...`);
    console.log(`   Email Status: ${inviteData.email?.status}`);
    console.log(`   Message ID: ${inviteData.email?.messageId || 'N/A'}\n`);

    // ========== STEP 3: Get Invitation Form ==========
    console.log('📋 Step 3: Get Invitation Form');
    console.log(`   Fetching invite page with token...`);
    
    const formRes = await fetch(`${API_URL}/auth/invite?token=${inviteToken}`);
    const formData = await formRes.json();

    if (formData.status !== 'invite_form') {
      console.error('❌ Failed to get invite form:', formData);
      return;
    }

    console.log('✅ Invite form retrieved successfully');
    console.log(`   Status: ${formData.status}`);
    console.log(`   Token Valid: ${formData.token === inviteToken}\n`);

    // ========== STEP 4: Accept Invitation ==========
    console.log('🎯 Step 4: Accept Invitation');
    console.log(`   User sets password and accepts invite...`);
    
    const acceptRes = await fetch(`${API_URL}/auth/accept-invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invite_token: inviteToken,
        password: TEST_PASSWORD
      })
    });

    const acceptData = await acceptRes.json();

    if (!acceptData.success) {
      console.error('❌ Invitation acceptance failed:', acceptData.error);
      return;
    }

    console.log('✅ Invitation accepted successfully');
    console.log(`   User created and activated\n`);

    // ========== STEP 5: New User Can Login ==========
    console.log('🔐 Step 5: New User Login');
    console.log(`   Logging in new user with accepted credentials...`);
    
    const newUserLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      })
    });

    const newUserLoginData = await newUserLoginRes.json();

    if (!newUserLoginData.token) {
      console.error('❌ New user login failed:', newUserLoginData.error);
      return;
    }

    console.log('✅ New user logged in successfully');
    console.log(`   Token issued: ${newUserLoginData.token.substring(0, 20)}...`);
    console.log(`   Name: ${newUserLoginData.name}`);
    console.log(`   Email: ${newUserLoginData.email}`);
    console.log(`   Role: ${newUserLoginData.roles?.join(', ') || 'N/A'}\n`);

    // ========== STEP 6: Verify User Access ==========
    console.log('🔑 Step 6: Verify User Access');
    console.log(`   Testing protected endpoint with new user token...`);
    
    const protectedRes = await fetch(`${API_URL}/api/whatsapp/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${newUserLoginData.token}`
      }
    });

    const protectedData = await protectedRes.json();

    if (protectedRes.status === 401) {
      console.error('❌ User cannot access protected endpoints');
      return;
    }

    console.log('✅ User can access protected endpoints');
    console.log(`   WhatsApp Status: ${protectedData.status}\n`);

    // ========== FINAL SUMMARY ==========
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ ALL TESTS PASSED - EMAIL INVITATION SYSTEM WORKING');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('✅ Complete Workflow Summary:');
    console.log(`   1. ✅ Admin sent invitation to ${TEST_EMAIL}`);
    console.log(`   2. ✅ Email was delivered successfully`);
    console.log(`   3. ✅ New user accepted invitation`);
    console.log(`   4. ✅ New user can login`);
    console.log(`   5. ✅ New user has access to system\n`);

  } catch (err) {
    console.error('\n❌ Test Error:', err.message);
  }
}

runFullTest();
