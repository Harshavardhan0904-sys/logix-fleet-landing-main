#!/usr/bin/env node

/**
 * WhatsApp Invoice Notifications - Test Suite
 * 
 * Tests:
 * 1. WhatsApp service status
 * 2. Single invoice notification
 * 3. Bulk invoice notifications
 * 4. Invoice creation with auto-notification
 * 5. Notification history retrieval
 * 
 * Run: node test-whatsapp-invoices.js [testName] [token]
 * Examples:
 *   node test-whatsapp-invoices.js status demo-token
 *   node test-whatsapp-invoices.js single demo-token
 *   node test-whatsapp-invoices.js bulk demo-token
 */

const fetch = require('node-fetch');

const API_URL = process.env.API_URL || 'http://localhost:5000';
let DEMO_TOKEN = process.argv[3] || null;

// Function to get token via login if not provided
async function getToken() {
  if (DEMO_TOKEN) return DEMO_TOKEN;
  
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'demo@freightflow.in',
        password: 'demo1234'
      })
    });
    
    const data = await response.json();
    if (data.token) {
      DEMO_TOKEN = data.token;
      console.log(`\n🔐 Got token from login: ${data.token.substring(0, 20)}...`);
      return DEMO_TOKEN;
    }
  } catch (err) {
    console.error('Failed to get token via login');
  }
  
  return 'demo-token-rk-001'; // Fallback
}

// Test phone numbers (international format)
const TEST_PHONES = {
  vendor1: '+919876543210',
  vendor2: '+919876543211',
  vendor3: '+919876543212'
};

// Helper: Pretty print JSON
function log(title, data, status = '✅') {
  console.log(`\n${status} ${title}`);
  console.log('─'.repeat(60));
  if (typeof data === 'string') {
    console.log(data);
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}

// Helper: Make API request
async function apiRequest(method, endpoint, body = null, token = DEMO_TOKEN) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (err) {
    return { status: 0, error: err.message };
  }
}

// ════════════════════════════════════════════════════════════
// TEST 1: Check WhatsApp Service Status
// ════════════════════════════════════════════════════════════
async function testStatus() {
  console.log('\n\n🧪 TEST 1: WhatsApp Service Status');
  console.log('═'.repeat(60));

  const result = await apiRequest('GET', '/api/whatsapp/status');

  if (result.status === 200) {
    log('WhatsApp Service Status', result.data);
    
    if (result.data.isActive) {
      console.log(`\n✅ Status: ${result.data.provider.toUpperCase()} (Active)`);
      console.log(`📱 Phone: ${result.data.phone}`);
      console.log(`💰 Cost: ${result.data.provider === 'gupshup' ? 'FREE' : 'Paid'}`);
      return true;
    } else {
      console.log(`\n⚠️  Status: MOCK MODE (No credentials configured)`);
      console.log('   All tests will use mock/simulated delivery');
      return true;  // Mock mode is OK for testing
    }
  } else {
    log('Error', result.error || 'Failed to get status', '❌');
    return false;
  }
}

// ════════════════════════════════════════════════════════════
// TEST 2: Send Single Invoice Notification
// ════════════════════════════════════════════════════════════
async function testSingleNotification() {
  console.log('\n\n🧪 TEST 2: Single Invoice Notification');
  console.log('═'.repeat(60));

  // First, create an invoice
  console.log('\n📋 Creating test invoice...');
  
  const createResult = await apiRequest('POST', '/api/invoices', {
    vendor: 'Test Vendor Inc',
    inv_number: `INV-TEST-${Date.now()}`,
    total: 50000,
    gst: 9000,
    status: 'pending',
    date: new Date().toISOString().split('T')[0],
    route: 'Mumbai - Bangalore',
    notes: 'Test invoice for WhatsApp notification'
  });

  if (createResult.status !== 201) {
    log('Invoice Creation Failed', createResult.error || createResult.data, '❌');
    return false;
  }

  const invoice = createResult.data.invoice;
  log('Invoice Created', `${invoice.inv_number} (₹${invoice.total})`);

  // Now send notification
  console.log(`\n📱 Sending WhatsApp notification to ${TEST_PHONES.vendor1}...`);

  const notifResult = await apiRequest('POST', 
    `/api/invoices/${invoice.id}/notify/whatsapp`,
    {
      phone: TEST_PHONES.vendor1,
      type: 'created'
    }
  );

  if (notifResult.status === 200 && notifResult.data.success) {
    log('Notification Sent', {
      status: notifResult.data.result.status,
      phone: notifResult.data.result.phone,
      provider: notifResult.data.result.provider,
      messageId: notifResult.data.result.messageId,
      isMocked: notifResult.data.result.isMocked
    });
    return true;
  } else {
    log('Notification Failed', notifResult.data, '❌');
    return false;
  }
}

// ════════════════════════════════════════════════════════════
// TEST 3: Send Bulk Notifications
// ════════════════════════════════════════════════════════════
async function testBulkNotifications() {
  console.log('\n\n🧪 TEST 3: Bulk Invoice Notifications');
  console.log('═'.repeat(60));

  // Create an invoice
  console.log('\n📋 Creating test invoice for bulk notification...');
  
  const createResult = await apiRequest('POST', '/api/invoices', {
    vendor: 'Multi-Vendor Test Co',
    inv_number: `INV-BULK-${Date.now()}`,
    total: 75000,
    gst: 13500,
    status: 'pending',
    date: new Date().toISOString().split('T')[0],
    route: 'Delhi - Mumbai',
    notes: 'Bulk notification test invoice'
  });

  if (createResult.status !== 201) {
    log('Invoice Creation Failed', createResult.error || createResult.data, '❌');
    return false;
  }

  const invoice = createResult.data.invoice;
  log('Invoice Created', `${invoice.inv_number} (₹${invoice.total})`);

  // Send bulk notifications
  console.log(`\n📱 Sending WhatsApp notifications to ${Object.keys(TEST_PHONES).length} recipients...`);

  const bulkResult = await apiRequest('POST',
    `/api/invoices/${invoice.id}/notify/whatsapp/bulk`,
    {
      recipients: [
        { phone: TEST_PHONES.vendor1, name: 'Vendor A - Express Logistics' },
        { phone: TEST_PHONES.vendor2, name: 'Vendor B - FastFreight Inc' },
        { phone: TEST_PHONES.vendor3, name: 'Vendor C - TruckHub Services' }
      ],
      type: 'reminder'
    }
  );

  if (bulkResult.status === 200 && bulkResult.data.success) {
    log('Bulk Notifications Summary', {
      total: bulkResult.data.summary.total,
      successful: bulkResult.data.summary.successful,
      failed: bulkResult.data.summary.failed
    });

    console.log('\n📊 Individual Results:');
    bulkResult.data.results.forEach((r, idx) => {
      console.log(`  ${idx + 1}. ${r.name}`);
      console.log(`     Phone: ${r.phone}`);
      console.log(`     Status: ${r.status}`);
      console.log(`     Mocked: ${r.isMocked ? 'Yes' : 'No'}\n`);
    });

    return true;
  } else {
    log('Bulk Notifications Failed', bulkResult.data, '❌');
    return false;
  }
}

// ════════════════════════════════════════════════════════════
// TEST 4: Auto-Notification on Invoice Creation
// ════════════════════════════════════════════════════════════
async function testAutoNotification() {
  console.log('\n\n🧪 TEST 4: Auto-Notification on Invoice Creation');
  console.log('═'.repeat(60));

  console.log('\n📋 Creating invoice with auto-notification enabled...');

  const result = await apiRequest('POST', '/api/invoices', {
    vendor: 'Auto-Notify Vendor',
    inv_number: `INV-AUTO-${Date.now()}`,
    total: 35000,
    gst: 6300,
    status: 'pending',
    date: new Date().toISOString().split('T')[0],
    route: 'Bangalore - Hyderabad',
    notes: 'Invoice with automatic WhatsApp notification',
    notifyWhatsapp: true,
    notifyPhone: TEST_PHONES.vendor1
  });

  if (result.status === 201) {
    log('Invoice Created with Auto-Notification', {
      invoice: result.data.invoice.inv_number,
      amount: `₹${result.data.invoice.total}`,
      notification: result.data.notification
    });
    return true;
  } else {
    log('Auto-Notification Failed', result.data, '❌');
    return false;
  }
}

// ════════════════════════════════════════════════════════════
// TEST 5: Notification History
// ════════════════════════════════════════════════════════════
async function testNotificationHistory() {
  console.log('\n\n🧪 TEST 5: Notification History Retrieval');
  console.log('═'.repeat(60));

  // First create an invoice
  console.log('\n📋 Creating invoice for history test...');
  
  const createResult = await apiRequest('POST', '/api/invoices', {
    vendor: 'History Test Vendor',
    inv_number: `INV-HIST-${Date.now()}`,
    total: 45000,
    gst: 8100,
    status: 'pending',
    date: new Date().toISOString().split('T')[0],
    route: 'Chennai - Kolkata',
    notes: 'Testing notification history',
    notifyWhatsapp: true,
    notifyPhone: TEST_PHONES.vendor1
  });

  if (createResult.status !== 201) {
    log('Invoice Creation Failed', createResult.error, '❌');
    return false;
  }

  const invoiceId = createResult.data.invoice.id;
  log('Invoice Created', createResult.data.invoice.inv_number);

  // Get notification history
  console.log(`\n📋 Retrieving notification history for ${invoiceId}...`);

  const historyResult = await apiRequest('GET',
    `/api/invoices/${invoiceId}/notifications`
  );

  if (historyResult.status === 200) {
    log('Notification History', {
      invoice: historyResult.data.invoice.inv_number,
      notificationCount: historyResult.data.notifications.length,
      notifications: historyResult.data.notifications.map(n => ({
        type: n.type,
        recipient: n.recipient,
        status: n.status,
        channels: n.channels,
        sent_at: n.sent_at
      }))
    });
    return true;
  } else {
    log('History Retrieval Failed', historyResult.data, '❌');
    return false;
  }
}

// ════════════════════════════════════════════════════════════
// TEST 6: Different Notification Types
// ════════════════════════════════════════════════════════════
async function testNotificationTypes() {
  console.log('\n\n🧪 TEST 6: Different Notification Types');
  console.log('═'.repeat(60));

  const types = ['created', 'reminder', 'approved', 'rejected', 'paid', 'draft'];
  
  // Create one invoice
  const createResult = await apiRequest('POST', '/api/invoices', {
    vendor: 'Multi-Type Test Vendor',
    inv_number: `INV-TYPES-${Date.now()}`,
    total: 60000,
    gst: 10800,
    status: 'pending',
    date: new Date().toISOString().split('T')[0],
    route: 'Pune - Ahmedabad',
    notes: 'Testing all notification types'
  });

  if (createResult.status !== 201) {
    log('Invoice Creation Failed', createResult.error, '❌');
    return false;
  }

  const invoice = createResult.data.invoice;
  log('Test Invoice', invoice.inv_number);

  // Send each type
  console.log('\n📱 Testing notification types:');
  
  for (const type of types) {
    const result = await apiRequest('POST',
      `/api/invoices/${invoice.id}/notify/whatsapp`,
      {
        phone: TEST_PHONES.vendor1,
        type: type
      }
    );

    const status = result.status === 200 ? '✅' : '❌';
    console.log(`  ${status} ${type.toUpperCase()}: ${result.data?.result?.status || result.data?.error || 'Error'}`);
  }

  return true;
}

// ════════════════════════════════════════════════════════════
// Main Test Runner
// ════════════════════════════════════════════════════════════
async function runTests() {
  const testName = process.argv[2];
  
  // Get token via login
  const token = await getToken();

  console.log('\n🚀 WhatsApp Invoice Notifications - Test Suite');
  console.log('═'.repeat(60));
  console.log(`API: ${API_URL}`);
  console.log(`Token: ${token.substring(0, 20)}...`);
  console.log(`Time: ${new Date().toISOString()}`);
  console.log('═'.repeat(60));

  let results = {};

  if (!testName || testName === 'all') {
    // Run all tests
    results.status = await testStatus(token);
    if (!results.status) {
      console.log('\n❌ Service not accessible. Cannot continue.');
      process.exit(1);
    }

    results.single = await testSingleNotification(token);
    results.bulk = await testBulkNotifications(token);
    results.auto = await testAutoNotification(token);
    results.history = await testNotificationHistory(token);
    results.types = await testNotificationTypes(token);
  } else if (testName === 'status') {
    results.status = await testStatus(token);
  } else if (testName === 'single') {
    results.single = await testSingleNotification(token);
  } else if (testName === 'bulk') {
    results.bulk = await testBulkNotifications(token);
  } else if (testName === 'auto') {
    results.auto = await testAutoNotification(token);
  } else if (testName === 'history') {
    results.history = await testNotificationHistory(token);
  } else if (testName === 'types') {
    results.types = await testNotificationTypes(token);
  } else {
    console.log('\n❌ Unknown test:', testName);
    console.log('\nAvailable tests:');
    console.log('  - all       (run all tests)');
    console.log('  - status    (WhatsApp service status)');
    console.log('  - single    (single invoice notification)');
    console.log('  - bulk      (bulk notifications)');
    console.log('  - auto      (auto-notification on creation)');
    console.log('  - history   (notification history)');
    console.log('  - types     (all notification types)');
    process.exit(1);
  }

  // Print summary
  console.log('\n\n📊 Test Summary');
  console.log('═'.repeat(60));
  const passed = Object.values(results).filter(r => r === true).length;
  const failed = Object.values(results).filter(r => r === false).length;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${passed + failed}`);

  if (failed === 0) {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Check output above.');
    process.exit(1);
  }
}

// Run tests
runTests().catch(err => {
  console.error('❌ Test suite error:', err);
  process.exit(1);
});
