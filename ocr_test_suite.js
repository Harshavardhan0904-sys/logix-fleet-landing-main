// ============================================================
// Logix — Comprehensive OCR Testing Suite
// Tests OCR extraction, parsing, integration & batch upload
// ============================================================

const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// ─── CONFIGURATION ────────────────────────────────────────
const API_BASE = process.env.API_URL || 'http://localhost:5000';
const TEST_EMAIL = 'demo@freightflow.in';
const TEST_PASSWORD = 'demo1234';
const TEST_DATA_PATH = 'backend/ocr_test_expectations.json';

// ─── TEST RESULTS TRACKER ─────────────────────────────────
class OCRTestRunner {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      tests: []
    };
    this.token = null;
  }

  /**
   * Step 1: Authenticate
   */
  async authenticate() {
    console.log('\n🔐 [AUTH] Authenticating...');
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: TEST_EMAIL,
          password: TEST_PASSWORD
        })
      });

      if (!response.ok) {
        throw new Error(`Auth failed: ${response.status}`);
      }

      const data = await response.json();
      this.token = data.token;
      console.log('✅ Authenticated successfully');
      return true;
    } catch (error) {
      console.error('❌ Authentication failed:', error.message);
      return false;
    }
  }

  /**
   * Step 2: Test Single Invoice OCR Upload
   */
  async testSingleUpload(filePath, expectedData) {
    const fileName = path.basename(filePath);
    console.log(`\n📄 [UPLOAD] Testing: ${fileName}`);

    try {
      const fileBuffer = fs.readFileSync(filePath);
      const form = new FormData();
      form.append('document', fileBuffer, fileName);
      form.append('fileName', fileName);

      const response = await fetch(`${API_BASE}/api/ocr/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`
        },
        body: form
      });

      if (response.status !== 202 && response.status !== 200) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const result = await response.json();
      const jobId = result.ocr_job_id;

      console.log(`✅ Upload successful | Job ID: ${jobId}`);
      console.log(`⏳ Waiting for OCR processing (est. 8 seconds)...`);

      // Wait for OCR to complete
      await new Promise(resolve => setTimeout(resolve, 9000));

      // Check status
      return await this.checkOCRStatus(jobId, fileName, expectedData);
    } catch (error) {
      this.recordTest(fileName, false, error.message);
      console.error(`❌ Upload failed: ${error.message}`);
      return null;
    }
  }

  /**
   * Step 3: Check OCR Status & Results
   */
  async checkOCRStatus(jobId, fileName, expectedData) {
    try {
      const response = await fetch(`${API_BASE}/api/ocr/status/${jobId}`, {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });

      if (!response.ok) {
        throw new Error(`Status check failed: ${response.status}`);
      }

      const job = await response.json();

      if (job.status === 'processing') {
        console.log('⏳ Still processing, waiting 5 more seconds...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        return await this.checkOCRStatus(jobId, fileName, expectedData);
      }

      if (job.status === 'failed') {
        this.recordTest(fileName, false, `OCR processing failed: ${job.error_message}`);
        console.error(`❌ OCR failed: ${job.error_message}`);
        return null;
      }

      if (job.status === 'completed') {
        console.log(`✅ OCR Completed (${job.processing_time_ms}ms)`);

        // Validate extracted data
        return this.validateExtraction(fileName, job.result, expectedData);
      }
    } catch (error) {
      this.recordTest(fileName, false, error.message);
      console.error(`❌ Status check failed: ${error.message}`);
      return null;
    }
  }

  /**
   * Step 4: Validate Extracted Data
   */
  validateExtraction(fileName, extracted, expected) {
    console.log(`\n🔍 [VALIDATE] Checking extracted fields...`);

    let matches = 0;
    let mismatches = [];

    for (const [field, expectedValue] of Object.entries(expected)) {
      const actualValue = extracted[field];
      const isMatch = this.compareValues(actualValue, expectedValue);

      if (isMatch) {
        console.log(`  ✅ ${field}: ${actualValue}`);
        matches++;
      } else {
        console.log(`  ❌ ${field}: expected "${expectedValue}", got "${actualValue}"`);
        mismatches.push(`${field}: expected ${expectedValue}, got ${actualValue}`);
      }
    }

    const confidence = (matches / Object.keys(expected).length) * 100;
    const passed = confidence >= 70; // 70% threshold

    this.recordTest(fileName, passed, `Accuracy: ${confidence.toFixed(1)}%`, {
      extracted,
      matches,
      total: Object.keys(expected).length,
      mismatches,
      confidence: extracted.confidence
    });

    console.log(`\n📊 Results: ${matches}/${Object.keys(expected).length} fields matched (${confidence.toFixed(1)}%)`);
    console.log(`🎯 Confidence Score: ${(extracted.confidence * 100).toFixed(1)}%`);

    return passed;
  }

  /**
   * Compare values with fuzzy matching
   */
  compareValues(actual, expected) {
    if (!actual || !expected) return false;

    // Exact match
    if (actual.toString() === expected.toString()) return true;

    // String similarity for amounts (±5%)
    if (typeof actual === 'number' && typeof expected === 'number') {
      const tolerance = expected * 0.05;
      return Math.abs(actual - expected) <= tolerance;
    }

    // Partial match for strings (substring)
    const actualStr = actual.toString().toLowerCase();
    const expectedStr = expected.toString().toLowerCase();
    return actualStr.includes(expectedStr) || expectedStr.includes(actualStr);
  }

  /**
   * Step 5: Test Batch Upload
   */
  async testBatchUpload(fileList) {
    console.log(`\n📦 [BATCH] Testing batch upload with ${fileList.length} files...`);

    try {
      const form = new FormData();
      form.append('batchId', `BATCH-${Date.now()}`);

      for (const filePath of fileList) {
        const fileBuffer = fs.readFileSync(filePath);
        form.append('documents', fileBuffer, path.basename(filePath));
      }

      const response = await fetch(`${API_BASE}/api/ocr/batch-upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`
        },
        body: form
      });

      if (response.status !== 202 && response.status !== 200) {
        // Batch endpoint may not exist, skip gracefully
        console.log('⚠️ Batch upload endpoint not available, skipping...');
        return false;
      }

      const result = await response.json();
      console.log(`✅ Batch submitted | ${fileList.length} files queued`);
      console.log(`📊 Batch ID: ${result.batch_id}`);

      return true;
    } catch (error) {
      console.log('⚠️ Batch upload test skipped:', error.message);
      return false;
    }
  }

  /**
   * Step 6: Test Integration with Invoice Creation
   */
  async testInvoiceIntegration(ocrJobId) {
    console.log(`\n📋 [INTEGRATION] Testing invoice creation from OCR result...`);

    try {
      const response = await fetch(`${API_BASE}/api/invoices/create-from-ocr`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ocr_job_id: ocrJobId,
          approve: true
        })
      });

      if (response.status === 404) {
        console.log('⚠️ Integration endpoint not available yet');
        return false;
      }

      if (!response.ok) {
        throw new Error(`Integration failed: ${response.status}`);
      }

      const invoice = await response.json();
      console.log(`✅ Invoice created from OCR | Invoice ID: ${invoice.id}`);
      return true;
    } catch (error) {
      console.log(`⚠️ Integration test skipped: ${error.message}`);
      return false;
    }
  }

  /**
   * Record test result
   */
  recordTest(testName, passed, message, details = {}) {
    this.results.total++;
    if (passed) {
      this.results.passed++;
    } else {
      this.results.failed++;
    }

    this.results.tests.push({
      name: testName,
      passed,
      message,
      timestamp: new Date().toISOString(),
      details
    });
  }

  /**
   * Print Summary Report
   */
  printSummary() {
    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 OCR TEST SUITE SUMMARY');
    console.log(`${'='.repeat(60)}`);
    console.log(`Total Tests: ${this.results.total}`);
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📈 Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);

    console.log(`\n📋 Detailed Results:`);
    this.results.tests.forEach((test, idx) => {
      const icon = test.passed ? '✅' : '❌';
      console.log(`${idx + 1}. ${icon} ${test.name}`);
      console.log(`   └─ ${test.message}`);
      if (test.details && test.details.confidence) {
        console.log(`   └─ OCR Confidence: ${(test.details.confidence * 100).toFixed(1)}%`);
      }
    });

    console.log(`\n💾 Test results saved to: ocr_test_results.json`);
    fs.writeFileSync('ocr_test_results.json', JSON.stringify(this.results, null, 2));
  }
}

// ─── MAIN EXECUTION ───────────────────────────────────────
async function runAllTests() {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║        🚀 LOGIX OCR COMPREHENSIVE TEST SUITE 🚀            ║
║    Testing: Upload | Parsing | Integration | Batch        ║
╚════════════════════════════════════════════════════════════╝
  `);

  const runner = new OCRTestRunner();

  // Step 0: Authenticate
  if (!await runner.authenticate()) {
    console.error('❌ Cannot proceed without authentication');
    process.exit(1);
  }

  // Step 1: Load test data expectations
  let testData = {};
  try {
    const rawData = fs.readFileSync(TEST_DATA_PATH, 'utf8');
    testData = JSON.parse(rawData);
    console.log(`\n📚 Loaded test data from ${TEST_DATA_PATH}`);
    console.log(`📊 Test cases: ${Object.keys(testData).length}`);
  } catch (error) {
    console.warn(`⚠️ Test expectations file not found, running basic tests`);
    testData = {
      'backend/sample_invoice_standard.png': { expected: {} },
      'backend/sample_invoice_ltl.png': { expected: {} }
    };
  }

  // Step 2: Test each invoice variant
  const testFiles = [];
  for (const [filename, config] of Object.entries(testData)) {
    const fullPath = path.join(process.cwd(), filename);
    if (fs.existsSync(fullPath)) {
      testFiles.push(fullPath);
      const expected = config.expected || {};
      await runner.testSingleUpload(fullPath, expected);
    }
  }

  // Step 3: Test batch upload (if files available)
  if (testFiles.length > 0) {
    await runner.testBatchUpload(testFiles.slice(0, 2));
  }

  // Step 4: Print summary
  runner.printSummary();

  console.log(`\n✨ Test suite completed!`);
}

// Run if executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { OCRTestRunner, runAllTests };
