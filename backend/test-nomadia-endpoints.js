const http = require('http');

const BASE_URL = 'http://localhost:5000';
const TEST_COMPANY_ID = 'comp-001';
const TEST_TOKEN = 'test-token-comp-001-1776519716947';

// Helper function to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'X-Company-ID': TEST_COMPANY_ID
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            data: parsed,
            headers: res.headers
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: responseData,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

function formatJSON(obj, indent = 2) {
  return JSON.stringify(obj, null, indent);
}

function printTest(testNum, endpoint, method) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`TEST ${testNum}: ${method} ${endpoint}`);
  console.log('='.repeat(60));
}

function printResult(success, message, data = null) {
  const icon = success ? '✅' : '❌';
  console.log(`${icon} ${message}`);
  if (data) {
    console.log('\nResponse:');
    console.log(formatJSON(data));
  }
}

async function runTests() {
  console.log('\n🧪 FREIGHTFLOW NOMADIA FEATURES - API TEST SUITE\n');
  console.log(`Server: ${BASE_URL}`);
  console.log(`Company ID: ${TEST_COMPANY_ID}`);
  console.log(`Status: Testing real data endpoints...\n`);

  let passed = 0;
  let failed = 0;

  try {
    // TEST 1: GPS Real-Time Tracking
    printTest(1, '/api/shipments/tracking', 'GET');
    try {
      const trackingResponse = await makeRequest('GET', '/api/shipments/tracking');
      
      if (trackingResponse.status === 200 && trackingResponse.data.success) {
        const shipments = trackingResponse.data.shipments || [];
        console.log(`✅ GPS Tracking endpoint works`);
        console.log(`📦 Found ${shipments.length} shipments in transit`);
        
        if (shipments.length > 0) {
          console.log('\nSample tracking data:');
          console.log(formatJSON(shipments[0]));
          console.log(`\n📍 Shipments in transit: ${shipments.filter(s => s.status === 'in-transit').length}`);
          console.log(`🚚 Ready for dispatch: ${shipments.filter(s => s.status === 'ready-for-dispatch').length}`);
          console.log(`📍 Out for delivery: ${shipments.filter(s => s.status === 'out-for-delivery').length}`);
          passed++;
        } else {
          console.log('⚠️  No shipments found - ensure test data is inserted');
          failed++;
        }
      } else {
        throw new Error(`Status ${trackingResponse.status}`);
      }
    } catch (err) {
      printResult(false, `GPS Tracking failed: ${err.message}`);
      failed++;
    }

    // TEST 2: Proof of Delivery Submit
    printTest(2, '/api/shipments/pod/submit', 'POST');
    try {
      const podData = {
        shipmentId: 'ship-003',
        driverId: 'driver-003',
        receiverName: 'Mr. Raj Kumar',
        receiverPhone: '9876543210',
        notes: 'Delivered successfully at gate',
        paymentMethod: 'cash',
        amountCollected: 0
      };

      const podResponse = await makeRequest('POST', '/api/shipments/pod/submit', podData);
      
      if (podResponse.status === 200 && podResponse.data.success) {
        console.log(`✅ POD Submit endpoint works`);
        console.log(`📋 POD ID: ${podResponse.data.podId}`);
        console.log(`✓ Delivered to: ${podData.receiverName}`);
        console.log(`✓ Contact: ${podData.receiverPhone}`);
        console.log('\nPOD Response:');
        console.log(formatJSON(podResponse.data));
        passed++;
      } else {
        throw new Error(`Status ${podResponse.status}`);
      }
    } catch (err) {
      printResult(false, `POD Submit failed: ${err.message}`);
      failed++;
    }

    // TEST 3: Route Optimization
    printTest(3, '/api/routes/optimize', 'POST');
    try {
      const routeData = {
        filters: {
          status: ['pending', 'ready-for-dispatch'],
          priority: null
        }
      };

      const routeResponse = await makeRequest('POST', '/api/routes/optimize', routeData);
      
      if (routeResponse.status === 200 && routeResponse.data.success) {
        const routes = routeResponse.data.routes || [];
        console.log(`✅ Route Optimization endpoint works`);
        console.log(`🛣️  Optimized routes: ${routes.length}`);
        
        if (routes.length > 0) {
          console.log('\nOptimization Results:');
          routes.forEach((route, idx) => {
            console.log(`\nRoute ${idx + 1}: ${route.destination}`);
            console.log(`  • Shipments: ${route.shipmentCount}`);
            console.log(`  • Total Weight: ${route.totalWeight} kg`);
            console.log(`  • Est. Distance: ${route.estimatedDistance} km`);
            console.log(`  • Est. Cost: ₹${route.estimatedCost}`);
          });
          passed++;
        } else {
          console.log('⚠️  No routes optimized - check shipment status in database');
          passed++;
        }
      } else {
        throw new Error(`Status ${routeResponse.status}`);
      }
    } catch (err) {
      printResult(false, `Route Optimization failed: ${err.message}`);
      failed++;
    }

    // TEST 4: Driver Delivery Assignments
    printTest(4, '/api/drivers/assignments', 'GET');
    try {
      const assignmentResponse = await makeRequest('GET', '/api/drivers/assignments');
      
      if (assignmentResponse.status === 200 && assignmentResponse.data.success) {
        const drivers = assignmentResponse.data.drivers || [];
        console.log(`✅ Driver Assignments endpoint works`);
        console.log(`👨‍💼 Active drivers: ${drivers.length}`);
        
        if (drivers.length > 0) {
          console.log('\nDriver Assignment Summary:');
          drivers.forEach(driver => {
            console.log(`\nDriver ID: ${driver.driverId}`);
            console.log(`  • Active Shipments: ${driver.assignedShipments || 0}`);
            console.log(`  • Total Weight Assigned: ${driver.totalWeight || 0} kg`);
            console.log(`  • Capacity Utilization: ${((driver.totalWeight || 0) / 3000 * 100).toFixed(1)}%`);
          });
          passed++;
        } else {
          console.log('⚠️  No drivers with active assignments');
          passed++;
        }
      } else {
        throw new Error(`Status ${assignmentResponse.status}`);
      }
    } catch (err) {
      printResult(false, `Driver Assignments failed: ${err.message}`);
      failed++;
    }

  } catch (err) {
    console.error(`\n❌ Test error: ${err.message}`);
  }

  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%\n`);

  if (failed === 0) {
    console.log('🎉 ALL TESTS PASSED! Real data integration is working.\n');
    console.log('Next steps:');
    console.log('  1. Open http://localhost:5000/');
    console.log('  2. Login with test credentials');
    console.log('  3. Navigate to Nomadia features pages');
    console.log('  4. Verify real shipment data displays\n');
  } else {
    console.log('⚠️  Some tests failed. Check MongoDB connection and backend.\n');
  }
}

// Run tests
runTests().catch(console.error);
