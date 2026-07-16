// Test all 5 invoice variants one by one
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:5000';

// First, get a valid token via login
async function getAuthToken() {
  try {
    const resp = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'demo@logix.com',
        password: 'Demo@123456'
      })
    });
    
    if (resp.ok) {
      const data = await resp.json();
      return data.token;
    }
  } catch (err) {
    console.warn('⚠️  Login attempt failed, continuing without token...');
  }
  return null;
}

const invoices = [
  {
    file: 'backend/sample_invoice_standard.png',
    name: 'Standard FTL',
    expected: { vendor: 'FREIGHTFLOW LOGISTICS', amount: 54300, mode: 'FTL' }
  },
  {
    file: 'backend/sample_invoice_ltl.png',
    name: 'Blue Dart LTL',
    expected: { vendor: 'BLUE DART EXPRESS', amount: 34810, mode: 'LTL' }
  },
  {
    file: 'backend/sample_invoice_handwritten.png',
    name: 'Handwritten (Allcargo)',
    expected: { vendor: 'ALLCARGO GATI', amount: 78500, mode: 'Road' }
  },
  {
    file: 'backend/sample_invoice_lowquality.png',
    name: 'Low Quality (Locus)',
    expected: { vendor: 'LOCUS LOGISTICS', amount: 42100, mode: 'Road' }
  },
  {
    file: 'backend/sample_invoice_multiitem.png',
    name: 'Multi-Item',
    expected: { vendor: 'FREIGHTFLOW ANALYTICS', amount: 43318, mode: 'Road' }
  }
];

// Build multipart form data manually
function buildFormData(fileBuffer, fileName) {
  const boundary = '----FormBoundary' + Math.random().toString(36).substr(2, 9);
  const CRLF = '\r\n';
  
  const parts = [];
  parts.push(`--${boundary}`);
  parts.push('Content-Disposition: form-data; name="document"; filename="' + fileName + '"');
  parts.push('Content-Type: image/png');
  parts.push('');
  
  const header = parts.join(CRLF) + CRLF;
  const footer = CRLF + `--${boundary}--` + CRLF;
  
  const body = Buffer.concat([
    Buffer.from(header),
    fileBuffer,
    Buffer.from(footer)
  ]);
  
  return { body, boundary };
}

async function testInvoice(invoice, index, token) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`[${index + 1}/${invoices.length}] 📄 ${invoice.name}`);
  console.log(`${'='.repeat(60)}`);

  if (!fs.existsSync(invoice.file)) {
    console.error(`❌ File not found: ${invoice.file}`);
    return false;
  }

  try {
    // Upload
    console.log(`📤 Uploading...`);
    const fileBuffer = fs.readFileSync(invoice.file);
    const { body, boundary } = buildFormData(fileBuffer, path.basename(invoice.file));

    const uploadResp = await fetch(`${API_BASE}/api/ocr/upload`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      body: body
    });

    if (uploadResp.status === 401) {
      throw new Error(`Unauthorized (401) - Invalid or missing auth token`);
    }
    if (uploadResp.status !== 202 && uploadResp.status !== 200) {
      throw new Error(`Upload failed: ${uploadResp.status}`);
    }

    const uploadData = await uploadResp.json();
    const jobId = uploadData.ocr_job_id;
    console.log(`✅ Upload successful | Job: ${jobId}`);

    // Wait for processing
    console.log(`⏳ Processing... (waiting 10 seconds)`);
    await new Promise(r => setTimeout(r, 10000));

    // Check status
    let attempt = 0;
    let ocrResult = null;
    while (attempt < 10) {
      attempt++;
      const statusResp = await fetch(`${API_BASE}/api/ocr/status/${jobId}`, {
        headers: { 'Authorization': `Bearer ${TEST_TOKEN}` }
      });

      const statusData = await statusResp.json();
      
      if (statusData.status === 'completed') {
        ocrResult = statusData.result;
        console.log(`✅ OCR Complete (${statusData.processing_time_ms}ms)`);
        break;
      } else if (statusData.status === 'failed') {
        console.error(`❌ OCR Failed: ${statusData.error_message}`);
        return false;
      }

      console.log(`⏳ Still processing... (attempt ${attempt}/10)`);
      await new Promise(r => setTimeout(r, 1000));
    }

    if (!ocrResult) {
      console.error(`❌ Processing timeout`);
      return false;
    }

    // Validate
    console.log(`\n📊 Extracted Data:`);
    console.log(`  Vendor: ${ocrResult.vendor_name} (confidence: ${ocrResult.confidence})`);
    console.log(`  Amount: ₹${ocrResult.amount}`);
    console.log(`  Mode: ${ocrResult.transport_mode}`);
    console.log(`  Invoice#: ${ocrResult.invoice_number}`);

    // Check expectations
    let passed = true;
    if (invoice.expected.vendor && !ocrResult.vendor_name?.includes(invoice.expected.vendor.split(' ')[0])) {
      console.warn(`⚠️ Vendor mismatch: expected "${invoice.expected.vendor}", got "${ocrResult.vendor_name}"`);
      passed = false;
    }
    if (invoice.expected.amount && Math.abs(ocrResult.amount - invoice.expected.amount) > 100) {
      console.warn(`⚠️ Amount mismatch: expected ₹${invoice.expected.amount}, got ₹${ocrResult.amount}`);
      passed = false;
    }

    console.log(`\n${passed ? '✅ PASSED' : '⚠️ REVIEW NEEDED'}`);
    return passed;
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║         📋 INVOICE VARIANT TEST - All 5 Files              ║
║           Testing: Standard, LTL, Handwritten,             ║
║           Low Quality, Multi-Item                          ║
╚════════════════════════════════════════════════════════════╝
  `);

  // Get auth token
  console.log(`🔐 Authenticating...`);
  const token = await getAuthToken();
  if (!token) {
    console.error('❌ Could not obtain auth token. Make sure backend is running.');
    process.exit(1);
  }
  console.log(`✅ Auth successful`);

  const results = [];
  for (let i = 0; i < invoices.length; i++) {
    const passed = await testInvoice(invoices[i], i, token);
    results.push({ invoice: invoices[i].name, passed });
  }

  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 TEST SUMMARY`);
  console.log(`${'='.repeat(60)}`);
  const passCount = results.filter(r => r.passed).length;
  console.log(`Passed: ${passCount}/${results.length}`);
  results.forEach(r => {
    console.log(`${r.passed ? '✅' : '⚠️'} ${r.invoice}`);
  });
}

runAllTests().catch(console.error);

runAllTests().catch(console.error);
