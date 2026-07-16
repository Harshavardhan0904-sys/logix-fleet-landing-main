// Test single OCR to debug extraction
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:5000';

async function getToken() {
  const resp = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `debug_${Date.now()}@test.com`,
      password: 'Test@12345',
      name: 'Debug',
      phone: '9999999999',
      company: 'Test'
    })
  });
  if (resp.ok) {
    const data = await resp.json();
    return data.token;
  }
  return null;
}

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

async function testSingleInvoice() {
  const token = await getToken();
  const testFile = 'backend/sample_invoice_standard.png';
  
  console.log('📄 Testing: Standard FTL');
  console.log('🔐 Token:', token?.substring(0, 10) + '...');
  
  const fileBuffer = fs.readFileSync(testFile);
  const { body, boundary } = buildFormData(fileBuffer, path.basename(testFile));
  
  const uploadResp = await fetch(`${API_BASE}/api/ocr/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': `multipart/form-data; boundary=${boundary}`
    },
    body: body
  });
  
  const uploadData = await uploadResp.json();
  const jobId = uploadData.ocr_job_id;
  console.log(`📤 Upload: ${jobId}`);
  
  // Poll
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 1000));
    const statusResp = await fetch(`${API_BASE}/api/ocr/status/${jobId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const statusData = await statusResp.json();
    
    if (statusData.status === 'completed') {
      console.log('\n✅ Completed');
      console.log(`Vendor: ${statusData.result.vendor_name}`);
      console.log(`Amount: ₹${statusData.result.amount}`);
      console.log(`Confidence: ${(statusData.confidence * 100).toFixed(0)}%`);
      break;
    }
  }
}

testSingleInvoice().catch(console.error);
