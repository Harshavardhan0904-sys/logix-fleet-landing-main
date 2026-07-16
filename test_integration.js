// Frontend Integration Test - OCR Result Auto-Fill with Vendor Alias Mapping
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:5000';

// Vendor alias mapping (same as in js/pages/invoices.js)
const vendorAliases = {
  'bangalore logistics': 'Express Logistics',
  'allcargo': 'Express Logistics',
  'allcargo gati': 'Express Logistics',
  'locus': 'FastFreight Inc',
  'locus logistics': 'FastFreight Inc',
  'blue dart': 'TruckHub Services',
  'tci express': 'TruckHub Services',
  'tci': 'TruckHub Services',
  'freightflow': 'Express Logistics',
  'delhivery': 'Express Logistics'
};

// Simulate the frontend vendor matching logic
function matchVendor(ocrVendor) {
  if (!ocrVendor) return null;
  
  const lowerVendor = ocrVendor.toLowerCase();
  
  // Check aliases first
  for (const [alias, systemVendor] of Object.entries(vendorAliases)) {
    if (lowerVendor.includes(alias)) {
      return { matched: systemVendor, method: 'alias', confidence: 'high' };
    }
  }
  
  // Check direct substring match
  const systemVendors = ['Express Logistics', 'FastFreight Inc', 'TruckHub Services'];
  for (const vendor of systemVendors) {
    if (lowerVendor.includes(vendor.toLowerCase())) {
      return { matched: vendor, method: 'direct', confidence: 'high' };
    }
  }
  
  return { matched: ocrVendor, method: 'none', confidence: 'low' };
}

async function getToken() {
  const resp = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `integration_${Date.now()}@test.com`,
      password: 'Test@12345',
      name: 'Integration',
      phone: '9999999999',
      company: 'Test'
    })
  });
  if (resp.ok) return (await resp.json()).token;
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

async function testVendorMapping(invoiceFile, invoiceName) {
  const token = await getToken();
  if (!token) throw new Error('No token');
  
  console.log(`\n📄 ${invoiceName}`);
  
  if (!fs.existsSync(invoiceFile)) {
    console.log('  ❌ File not found');
    return false;
  }
  
  // Upload
  const fileBuffer = fs.readFileSync(invoiceFile);
  const { body, boundary } = buildFormData(fileBuffer, path.basename(invoiceFile));
  
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
  
  // Poll for result
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 1000));
    const statusResp = await fetch(`${API_BASE}/api/ocr/status/${jobId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const statusData = await statusResp.json();
    
    if (statusData.status === 'completed') {
      const ocrVendor = statusData.result.vendor_name;
      const mappingResult = ocrVendor ? matchVendor(ocrVendor) : { matched: 'NOT_FOUND', method: 'none', confidence: 'low' };
      
      console.log(`  OCR Vendor: ${ocrVendor || '(extraction failed)'}`);
      console.log(`  Amount: ₹${statusData.result.amount}`);
      console.log(`  Mapped To: ${mappingResult.matched} (${mappingResult.method})`);
      console.log(`  Confidence: ${(statusData.confidence * 100).toFixed(0)}%`);
      
      const isCorrect = mappingResult.confidence === 'high';
      console.log(`  ${isCorrect ? '✅ MAPPING OK' : '⚠️ MANUAL REVIEW NEEDED'}`);
      
      return isCorrect;
    }
  }
  
  console.log('  ⚠️ Timeout');
  return false;
}

async function runIntegrationTest() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║  🔗 OCR→Frontend Integration Test          ║');
  console.log('║     Vendor Alias Mapping Validation        ║');
  console.log('╚════════════════════════════════════════════╝');
  
  const tests = [
    { file: 'backend/sample_invoice_handwritten.png', name: 'Handwritten (Bangalore→Express)' },
    { file: 'backend/sample_invoice_ltl.png', name: 'Blue Dart LTL' },
    { file: 'backend/sample_invoice_lowquality.png', name: 'Low Quality (Locus)' },
    { file: 'backend/sample_invoice_standard.png', name: 'Standard (TCI)' },
    { file: 'backend/sample_invoice_multiitem.png', name: 'Multi-Item' }
  ];
  
  const results = [];
  for (const test of tests) {
    try {
      const passed = await testVendorMapping(test.file, test.name);
      results.push({ name: test.name, passed });
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
      results.push({ name: test.name, passed: false });
    }
  }
  
  // Summary
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║  📊 Integration Test Summary               ║');
  console.log('╚════════════════════════════════════════════╝');
  const passCount = results.filter(r => r.passed).length;
  console.log(`\n✅ Passed: ${passCount}/${results.length}`);
  results.forEach(r => console.log(`  ${r.passed ? '✅' : '⚠️'} ${r.name}`));
}

runIntegrationTest().catch(console.error);
