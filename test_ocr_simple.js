// Simple OCR test - works with actual test scenario
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:5000';

// Test data - keeping expectations conservative
const testFile = 'backend/sample_invoice_handwritten.png';

async function testOCR() {
  console.log('📋 Simple OCR Upload Test');
  console.log('=' .repeat(50));

  if (!fs.existsSync(testFile)) {
    console.error(`❌ File not found: ${testFile}`);
    return;
  }

  try {
    // Try uploading without auth first to see what error we get
    console.log('📤 Testing OCR upload (handwritten invoice)...');
    const fileBuffer = fs.readFileSync(testFile);
    
    // Build form data manually
    const boundary = '----FormBoundary' + Math.random().toString(36).substr(2, 9);
    const CRLF = '\r\n';
    
    const header = [
      `--${boundary}`,
      'Content-Disposition: form-data; name="document"; filename="sample_invoice_handwritten.png"',
      'Content-Type: image/png',
      ''
    ].join(CRLF) + CRLF;
    
    const footer = CRLF + `--${boundary}--` + CRLF;
    const body = Buffer.concat([Buffer.from(header), fileBuffer, Buffer.from(footer)]);

    const resp = await fetch(`${API_BASE}/api/ocr/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      body: body
    });

    console.log(`Response status: ${resp.status}`);
    const data = await resp.text();
    console.log(`Response: ${data.substring(0, 200)}`);

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

testOCR();
