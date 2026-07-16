// Complete OCR Test with Auth & Batch Testing
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:5000';

// Test invoices
const invoices = [
  { file: 'backend/sample_invoice_standard.png', name: 'Standard FTL' },
  { file: 'backend/sample_invoice_ltl.png', name: 'Blue Dart LTL' },
  { file: 'backend/sample_invoice_handwritten.png', name: 'Handwritten' },
  { file: 'backend/sample_invoice_lowquality.png', name: 'Low Quality' },
  { file: 'backend/sample_invoice_multiitem.png', name: 'Multi-Item' }
];

// Step 1: Get token by creating a test user or using existing
async function getOrCreateToken() {
  try {
    // Try to create a new user
    const testEmail = `test_${Date.now()}@test.com`;
    const signupResp = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'Test@12345',
        name: 'Test User',
        phone: '9999999999',
        company: 'Test Co'
      })
    });
    
    if (signupResp.ok) {
      const data = await signupResp.json();
      console.log('✅ User created:', testEmail);
      return data.token;
    }

    console.log('Signup failed, trying login...');
    // Try login with known credentials
    const loginResp = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'demo@logix.com',
        password: 'Demo@123456'
      })
    });
    
    if (loginResp.ok) {
      const data = await loginResp.json();
      console.log('✅ Login successful');
      return data.token;
    }

    return null;
  } catch (error) {
    console.error('⚠️ Auth error:', error.message);
    return null;
  }
}

// Step 2: Build multipart form data
function buildFormData(fileBuffer, fileName) {
  const boundary = '----FormBoundary' + Math.random().toString(36).substr(2, 9);
  const CRLF = '\r\n';
  
  const header = [
    `--${boundary}`,
    'Content-Disposition: form-data; name="document"; filename="' + fileName + '"',
    'Content-Type: image/png',
    ''
  ].join(CRLF) + CRLF;
  
  const footer = CRLF + `--${boundary}--` + CRLF;
  return {
    body: Buffer.concat([Buffer.from(header), fileBuffer, Buffer.from(footer)]),
    boundary
  };
}

// Step 3: Upload and poll for results
async function testInvoice(invoice, token) {
  console.log(`\n📄 ${invoice.name}`);
  
  if (!fs.existsSync(invoice.file)) {
    console.log('  ❌ File not found');
    return false;
  }

  try {
    // Upload
    const fileBuffer = fs.readFileSync(invoice.file);
    const { body, boundary } = buildFormData(fileBuffer, path.basename(invoice.file));

    console.log('  📤 Uploading...');
    const uploadResp = await fetch(`${API_BASE}/api/ocr/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      body: body
    });

    if (uploadResp.status === 401) {
      console.log('  ❌ Unauthorized');
      return false;
    }
    if (uploadResp.status !== 202 && uploadResp.status !== 200) {
      console.log(`  ❌ Upload failed: ${uploadResp.status}`);
      return false;
    }

    const uploadData = await uploadResp.json();
    const jobId = uploadData.ocr_job_id;
    console.log(`  ✅ Upload accepted | Job: ${jobId}`);

    // Poll for result
    let attempts = 0;
    const maxAttempts = 20;
    while (attempts < maxAttempts) {
      await new Promise(r => setTimeout(r, 1000)); // Wait 1s
      attempts++;

      const statusResp = await fetch(`${API_BASE}/api/ocr/status/${jobId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!statusResp.ok) {
        console.log(`  ⚠️ Status check failed: ${statusResp.status}`);
        continue;
      }

      const statusData = await statusResp.json();
      if (statusData.status === 'completed') {
        const result = statusData.result;
        console.log(`  ✅ OCR Complete (${attempts}s)`);
        console.log(`     Vendor: ${result.vendor_name}`);
        console.log(`     Amount: ₹${result.amount}`);
        
        // Fixed: Access confidence correctly
        const confidenceValue = statusData.confidence !== undefined ? statusData.confidence : result.confidence;
        const confidencePercent = (confidenceValue * 100).toFixed(0);
        console.log(`     Confidence: ${confidencePercent}%`);
        return true;
      } else if (statusData.status === 'failed') {
        console.log(`  ❌ OCR failed: ${statusData.error}`);
        return false;
      }
    }

    console.log(`  ⚠️ OCR timeout after ${maxAttempts}s`);
    return false;

  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return false;
  }
}

// Main
async function runTests() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║  📋 OCR Batch Testing - All 5 Invoices     ║');
  console.log('╚════════════════════════════════════════════╝');
  
  console.log('\n🔐 Authenticating...');
  const token = await getOrCreateToken();
  if (!token) {
    console.error('❌ Could not get auth token');
    process.exit(1);
  }
  console.log(`✅ Auth successful (token: ${token.substring(0, 10)}...)`);

  const results = [];
  for (const invoice of invoices) {
    const passed = await testInvoice(invoice, token);
    results.push({ name: invoice.name, passed });
  }

  // Summary
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║  📊 Test Summary                            ║');
  console.log('╚════════════════════════════════════════════╝');
  const passCount = results.filter(r => r.passed).length;
  console.log(`\n✅ Passed: ${passCount}/${results.length}`);
  results.forEach(r => console.log(`  ${r.passed ? '✅' : '❌'} ${r.name}`));
}

runTests().catch(console.error);
