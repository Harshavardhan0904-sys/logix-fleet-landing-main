// OCR Upload Test Script
const http = require('http');
const fs = require('fs');
const path = require('path');

async function testOCR() {
  try {
    // Step 1: Get token
    console.log('\n🔐 Logging in...');
    const loginResponse = await new Promise((resolve, reject) => {
      const postData = JSON.stringify({
        email: 'demo@freightflow.in',
        password: 'demo1234'
      });

      const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Failed to parse login response: ${data}`));
          }
        });
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });

    const token = loginResponse.token;
    console.log('✅ Logged in. Token:', token.substring(0, 40) + '...');

    // Step 2: Upload file using multipart/form-data
    console.log('\n📤 Uploading image...');
    const imagePath = 'C:\\temp\\test_invoice_valid.png';
    const imageBuffer = fs.readFileSync(imagePath);
    
    const boundary = '----FormBoundary' + Math.random().toString(36).substr(2, 9);
    const CRLF = '\r\n';
    
    // Build multipart body
    const parts = [];
    parts.push(`--${boundary}`);
    parts.push('Content-Disposition: form-data; name="document"; filename="test_invoice.png"');
    parts.push('Content-Type: image/png');
    parts.push('');
    
    const header = parts.join(CRLF) + CRLF;
    const footer = CRLF + `--${boundary}--` + CRLF;
    
    const body = Buffer.concat([
      Buffer.from(header),
      imageBuffer,
      Buffer.from(footer)
    ]);
    
    await new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/ocr/upload',
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': body.length,
          'Authorization': `Bearer ${token}`
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            console.log('Response status:', res.statusCode);
            console.log('Raw response:', data.substring(0, 500));
            const result = JSON.parse(data);
            console.log('✅ Upload successful!');
            console.log('   Job ID:', result.ocr_job_id);
            console.log('   Status:', result.status);
            console.log('   Cost:', result.cost);
            
            // Step 3: Wait and check status
            setTimeout(() => {
              checkStatus(token, result.ocr_job_id);
            }, 8000);
            
            resolve();
          } catch (e) {
            reject(new Error(`Failed to parse upload response: ${data}`));
          }
        });
      });

      req.on('error', reject);
      req.write(body);
      req.end();
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function checkStatus(token, jobId) {
  try {
    console.log('\n⏳ Checking OCR status...');
    const response = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 5000,
        path: `/api/ocr/status/${jobId}`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            resolve(result);
          } catch (e) {
            reject(new Error(`Failed to parse status response: ${data}`));
          }
        });
      });

      req.on('error', reject);
      req.end();
    });

    console.log('✅ OCR Results:');
    console.log('   Status:', response.status);
    if (response.extracted_fields) {
      console.log('   Vendor:', response.extracted_fields.vendor_name || 'N/A');
      console.log('   Invoice #:', response.extracted_fields.invoice_number || 'N/A');
      console.log('   Amount:', response.extracted_fields.amount || 'N/A');
    }
    if (response.confidence !== undefined) {
      console.log('   Confidence:', Math.round(response.confidence * 100) + '%');
    }
  } catch (error) {
    console.error('❌ Error checking status:', error.message);
  }
}

testOCR();
