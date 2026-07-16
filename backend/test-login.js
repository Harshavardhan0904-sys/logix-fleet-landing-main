#!/usr/bin/env node

/**
 * Quick login test - get valid token for testing
 */

const fetch = require('node-fetch');

const API_URL = 'http://localhost:5000';

async function testLogin() {
  console.log('🔐 Testing login...\n');

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'demo@freightflow.in',
        password: 'demo1234'
      })
    });

    const data = await response.json();

    if (response.status === 200) {
      console.log('✅ Login Successful!\n');
      console.log('Token:', data.token);
      console.log('\nUser Details:');
      console.log('  Email:', data.email);
      console.log('  Name:', data.name);
      console.log('  Role:', data.role);
      console.log('  Company:', data.company);
      console.log('\n✅ Use this token for all API requests:');
      console.log(`   -H "Authorization: Bearer ${data.token}"`);
      return data.token;
    } else {
      console.log('❌ Login Failed');
      console.log('Status:', response.status);
      console.log('Response:', data);
      return null;
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
    return null;
  }
}

testLogin();
