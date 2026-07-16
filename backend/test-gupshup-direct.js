// Direct Gupshup API Test
require('dotenv').config();
const fetch = require('node-fetch');

const GUPSHUP_API_KEY = process.env.GUPSHUP_API_KEY;
const GUPSHUP_PHONE_NUMBER = process.env.GUPSHUP_PHONE_NUMBER;

console.log('\n🧪 DIRECT GUPSHUP API TEST');
console.log('═══════════════════════════════════════════════════════');
console.log(`API Key: ${GUPSHUP_API_KEY.substring(0, 10)}***`);
console.log(`Source Phone: ${GUPSHUP_PHONE_NUMBER}`);
console.log(`Destination: +917834811114 (same as source for sandbox testing)`);

// Try different phone formats
const phoneNoPlus = GUPSHUP_PHONE_NUMBER.replace('+', '');
console.log(`\nTrying phone formats:`);
console.log(`  - With +: ${GUPSHUP_PHONE_NUMBER}`);
console.log(`  - Without +: ${phoneNoPlus}`);

async function testGupshupAPI() {
  try {
    console.log('\n📱 Sending test message...\n');

    const bodyParams = {
      'channel': 'whatsapp',
      'source': phoneNoPlus,
      'destination': '917834811114',
      'message': 'Test message from FreightFlow',
      'messageType': 'TEXT',
      'appName': 'FreightFlow-WhatsApp',
      'app': 'FreightFlow-WhatsApp'
    };

    console.log('📋 Request Parameters:');
    console.log(JSON.stringify(bodyParams, null, 2));

    const urlParams = new URLSearchParams(bodyParams);
    console.log('📋 URL Encoded Body:');
    console.log(urlParams.toString());

    const response = await fetch('https://api.gupshup.io/wa/api/v1/msg', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'apikey': GUPSHUP_API_KEY
      },
      body: urlParams.toString()
    });

    const data = await response.json();

    console.log('✅ API Response Received:');
    console.log(`   Status Code: ${response.status}`);
    console.log(`   Response Data:`);
    console.log(JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('\n✅ SUCCESS: Message sent to Gupshup');
    } else {
      console.log('\n❌ ERROR: Gupshup API returned error');
      console.log(`   Status: ${response.status}`);
      console.log(`   Message: ${data.message || data.error || 'Unknown error'}`);
    }
  } catch (err) {
    console.error('\n❌ Network Error:', err.message);
  }
}

testGupshupAPI();
