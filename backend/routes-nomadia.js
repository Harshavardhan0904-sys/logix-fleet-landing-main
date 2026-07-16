/**
 * API Routes for Nomadia-Inspired Features
 * 
 * This module exports a function that creates and returns an Express router
 * with all Nomadia feature routes. The router is configured to use the
 * authenticateToken middleware passed from the main server.
 * 
 * Routes include:
 * - GPS Tracking & Real-time Location
 * - Proof of Delivery Management
 * - Route Optimization
 * - Driver Management & Mobile App
 * - Delivery Analytics
 * - Territory Management
 */

const express = require('express');

/**
 * Create and configure Nomadia routes router
 * @param {Function} authenticateToken - Middleware function to authenticate API requests
 * @returns {Express.Router} Configured router with all Nomadia routes
 */
module.exports = function(authenticateToken) {
  const router = express.Router();

// ─────────────────────────────────────────────────────────
// 1. GPS TRACKING & REAL-TIME LOCATION ROUTES
// ─────────────────────────────────────────────────────────

/**
 * GET /api/shipments/tracking
 * Fetch real-time fleet tracking - ENTERPRISE LOGISTICS
 * Shows active bulk shipments, trucks, and regional operations
 */
  router.get('/shipments/tracking', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const companyId = user.company_id || user.id;
    const { status, priority, region } = req.query;
    
    // Initialize enterprise-scale fleet data per client
    if (!global.enterpriseFleetData) global.enterpriseFleetData = {};
    if (!global.enterpriseFleetData[companyId]) {
      global.enterpriseFleetData[companyId] = [
        {
          // FTL Shipment - Full Truck Load
          shipmentId: `BULK-${companyId}-FTL-001`,
          trackingNumber: 'TRK-LX-2024-001',
          shipmentType: 'FTL',
          status: 'in-transit',
          priority: 'high',
          clientName: 'TCS Supply Chain',
          clientId: 'CLIENT-TSC-001',
          
          // Route Details
          origin: { hub: 'Mumbai Distribution Center', city: 'Mumbai', state: 'MH', lat: 19.0760, lng: 72.8777 },
          destination: { hub: 'Delhi Regional Hub', city: 'Delhi', state: 'DL', lat: 28.7041, lng: 77.1025 },
          currentLocation: 'Highway NH-48 (Madhya Pradesh)',
          latitude: 22.5726,
          longitude: 75.8330,
          
          // Truck & Driver
          truck: { id: 'TRK-MH-4521', registration: 'MH-02-AB-1234', model: 'TataSinotruk', capacity: '25 tons', utilization: 95 },
          driver: { id: 'DRV-MH-001', name: 'Rajesh Kumar', license: 'DL-0011-2020', experience: '12 years', rating: 4.8 },
          assistant: { id: 'AST-MH-001', name: 'Vikram Singh' },
          
          // Cargo & Cost
          cargo: { weight: '23.5 tons', pallets: 280, items: 1520, description: 'Electronic Components & Spares' },
          rate: { ratePerKm: 45, ratePerTon: 1200, fuelSurcharge: 8, totalCost: 52840 },
          
          // Progress
          progress: 62,
          speed: 65,
          eta: new Date(Date.now() + 12 * 60 * 60000).toISOString(),
          distanceCovered: 680,
          distanceRemaining: 420,
          fuelLevel: 72,
          
          // Performance
          onTimePercentage: 96,
          temperature: 28,
          humidity: 45,
          cargoCondition: 'excellent',
          
          // Compliance
          documentStatus: 'verified',
          insuranceStatus: 'active',
          permits: ['GSTR', 'e-way bill verified'],
          
          company_id: companyId,
          timestamp: new Date().toISOString()
        },
        {
          // LTL Shipment - Less Than Truck Load
          shipmentId: `BULK-${companyId}-LTL-002`,
          trackingNumber: 'TRK-LX-2024-002',
          shipmentType: 'LTL',
          status: 'out-for-delivery',
          priority: 'medium',
          clientName: 'Amazon Logistics Network',
          clientId: 'CLIENT-AMZ-001',
          
          origin: { hub: 'Bangalore Fulfillment Center', city: 'Bangalore', state: 'KA', lat: 12.9716, lng: 77.5946 },
          destination: { hub: 'Chennai Distribution', city: 'Chennai', state: 'TN', lat: 13.0827, lng: 80.2707 },
          currentLocation: 'Bangalore-Chennai Highway (Near Chikballapur)',
          latitude: 13.2353,
          longitude: 79.1288,
          
          truck: { id: 'TRK-KA-5803', registration: 'KA-01-CD-5678', model: 'Eicher ProPack', capacity: '12 tons', utilization: 78 },
          driver: { id: 'DRV-KA-002', name: 'Priya Nair', license: 'DL-0022-2021', experience: '8 years', rating: 4.9 },
          assistant: { id: 'AST-KA-002', name: 'Anita Reddy' },
          
          cargo: { weight: '9.2 tons', pallets: 115, items: 680, description: 'Consumer Electronics & Home Goods' },
          rate: { ratePerKm: 50, ratePerTon: 1400, fuelSurcharge: 8, totalCost: 38920 },
          
          progress: 88,
          speed: 58,
          eta: new Date(Date.now() + 2 * 60 * 60000).toISOString(),
          distanceCovered: 210,
          distanceRemaining: 30,
          fuelLevel: 45,
          
          onTimePercentage: 94,
          temperature: 30,
          humidity: 62,
          cargoCondition: 'good',
          
          documentStatus: 'verified',
          insuranceStatus: 'active',
          permits: ['GSTR', 'e-way bill verified'],
          
          company_id: companyId,
          timestamp: new Date().toISOString()
        },
        {
          // Container Service
          shipmentId: `BULK-${companyId}-CONT-003`,
          trackingNumber: 'TRK-LX-2024-003',
          shipmentType: 'Container',
          status: 'in-transit',
          priority: 'high',
          clientName: 'Maruti Suzuki Manufacturing',
          clientId: 'CLIENT-MSM-001',
          
          origin: { hub: 'Gurgaon Auto Hub', city: 'Gurgaon', state: 'HR', lat: 28.4595, lng: 77.0266 },
          destination: { hub: 'Chennai Port Interchange', city: 'Chennai', state: 'TN', lat: 13.0827, lng: 80.2707 },
          currentLocation: 'NH-16 (Andhra Pradesh)',
          latitude: 15.5527,
          longitude: 79.7804,
          
          truck: { id: 'TRK-HR-2104', registration: 'HR-26-AB-9012', model: 'Volvo FH', capacity: '35 tons', utilization: 100 },
          driver: { id: 'DRV-HR-003', name: 'Ahmed Khan', license: 'DL-0033-2019', experience: '15 years', rating: 4.7 },
          assistant: { id: 'AST-HR-003', name: 'Suresh Patel' },
          
          cargo: { weight: '34.8 tons', containerType: '40ft', items: 2400, description: 'Auto Components & Parts' },
          rate: { ratePerKm: 65, ratePerTon: 1800, fuelSurcharge: 10, totalCost: 89640 },
          
          progress: 45,
          speed: 70,
          eta: new Date(Date.now() + 18 * 60 * 60000).toISOString(),
          distanceCovered: 380,
          distanceRemaining: 460,
          fuelLevel: 88,
          
          onTimePercentage: 98,
          temperature: 26,
          humidity: 35,
          cargoCondition: 'excellent',
          
          documentStatus: 'verified',
          insuranceStatus: 'active',
          permits: ['GSTR', 'e-way bill verified', 'Port clearance'],
          
          company_id: companyId,
          timestamp: new Date().toISOString()
        }
      ];
    }
    
    // Get company fleet and apply filters
    let fleet = global.enterpriseFleetData[companyId] || [];
    
    if (status) fleet = fleet.filter(s => s.status === status);
    if (priority) fleet = fleet.filter(s => s.priority === priority);
    if (region) fleet = fleet.filter(s => s.origin.state === region);
    
    // Calculate ENTERPRISE metrics
    const totalWeight = fleet.reduce((sum, s) => {
      const weight = parseFloat(s.cargo.weight);
      return sum + (isNaN(weight) ? 0 : weight);
    }, 0);
    
    const totalCost = fleet.reduce((sum, s) => sum + (s.rate?.totalCost || 0), 0);
    const avgUtilization = fleet.length > 0 
      ? Math.round(fleet.reduce((sum, s) => sum + (s.truck?.utilization || 0), 0) / fleet.length)
      : 0;
    
    const stats = {
      activeShipments: fleet.length,
      totalWeight: totalWeight.toFixed(1) + ' tons',
      totalValue: '₹' + totalCost.toLocaleString('en-IN'),
      avgCapacityUtilization: avgUtilization + '%',
      onTimePerformance: fleet.length > 0 
        ? Math.round(fleet.reduce((sum, s) => sum + (s.onTimePercentage || 0), 0) / fleet.length) + '%'
        : '0%',
      activeRegions: [...new Set(fleet.map(s => s.origin.state))].length,
      documentCompliance: '100%',
      fleetHealth: '95%'
    };
    
    // Format response
    const response = {
      success: true,
      shipments: fleet,
      activeShipments: fleet.slice(0, 5).map(s => ({
        shipmentId: s.shipmentId,
        type: s.shipmentType,
        client: s.clientName,
        location: s.currentLocation,
        status: s.status,
        driver: s.driver.name,
        truck: s.truck.id,
        capacity: s.truck.capacity,
        utilization: s.truck.utilization + '%'
      })),
      stats: stats,
      company_id: companyId,
      timestamp: new Date().toISOString()
    };
    
    console.log(`✅ Enterprise fleet tracking for ${companyId}:`, {
      activeShipments: fleet.length,
      totalWeight: stats.totalWeight,
      totalCost: stats.totalValue
    });
    res.json(response);
    
  } catch (error) {
    console.error('Tracking error:', error);
    res.status(500).json({ error: 'Failed to fetch tracking data', details: error.message });
  }
});

/**
 * GET /api/shipments/track/:shipmentId
 * Get detailed tracking for a specific enterprise shipment
 */
  router.get('/shipments/track/:shipmentId', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const companyId = user.company_id || user.id;
    const { shipmentId } = req.params;
    
    // Get from company fleet cache
    const fleet = global.enterpriseFleetData[companyId] || [];
    const shipment = fleet.find(s => s.shipmentId === shipmentId);
    
    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }
    
    res.json({
      success: true,
      shipment: shipment,
      company_id: companyId
    });
  } catch (error) {
    console.error('Tracking detail error:', error);
    res.status(500).json({ error: 'Failed to fetch shipment details' });
  }
});

/**
 * GET /api/shipments/:id/tracking
 * Get detailed tracking info for single shipment
 */
  router.get('/shipments/:id/tracking', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Mock data - replace with real database
    const shipment = {
      id: id,
      trackingNumber: `TRK-2024-${id.slice(-3)}`,
      status: 'in-transit',
      location: 'Bandra, Mumbai',
      latitude: 19.0596,
      longitude: 72.8295,
      speed: 42,
      eta: new Date(Date.now() + 45 * 60000),
      lastUpdate: new Date(),
      driver: { id: 'DRV001', name: 'Raj Kumar', phone: '+919876543210', rating: 4.8 },
      from: 'Warehouse, Mumbai',
      to: '123 Marine Drive, Mumbai',
      progress: 65,
      timeline: [
        { status: 'picked-up', timestamp: new Date(Date.now() - 90 * 60000), location: 'Warehouse, Mumbai' },
        { status: 'in-transit', timestamp: new Date(Date.now() - 60 * 60000), location: 'Central Mumbai' },
        { status: 'out-for-delivery', timestamp: new Date(Date.now() - 30 * 60000), location: 'Bandra' },
        { status: 'delivered', timestamp: new Date(Date.now() + 45 * 60000), location: '123 Marine Drive' }
      ],
      distance: 12.5,
      distanceRemaining: 4.5,
      expectedDeliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      attempts: 1,
      notes: 'Customer called for delay, rerouted via faster route'
    };
    
    res.json({ success: true, shipment });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shipment tracking' });
  }
});

/**
 * POST /api/shipments/:id/location/update
 * Update real-time GPS location (called by driver mobile app)
 */
  router.post('/shipments/:id/location/update', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { latitude, longitude, speed, accuracy } = req.body;
    
    // Validate coordinates
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }
    
    // Update database (mock)
    // await Shipment.findByIdAndUpdate(id, {
    //   latitude, longitude, speed,
    //   lastLocationUpdate: new Date()
    // });
    
    console.log(`Shipment ${id} location updated: ${latitude}, ${longitude}, speed: ${speed}km/h`);
    
    res.json({ success: true, message: 'Location updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update location' });
  }
});

// ─────────────────────────────────────────────────────────
// 2. PROOF OF DELIVERY ROUTES
// ─────────────────────────────────────────────────────────

/**
 * GET /api/shipments/pod/pending
 * Get list of deliveries pending proof of delivery
 */
  router.get('/shipments/pod/pending', authenticateToken, async (req, res) => {
  try {
    const { driverId } = req.query;
    
    // Mock data
    const pendingPOD = [
      {
        id: 'SHP001',
        trackingNumber: 'TRK-2024-001',
        recipientName: 'John Doe',
        recipientPhone: '+919876543210',
        address: '123 Marine Drive, Mumbai',
        shipmentType: 'Electronics',
        value: 5000,
        paymentType: 'prepaid',
        amountToCollect: 0,
        priority: 'high',
        attemptNumber: 1
      },
      {
        id: 'SHP002',
        trackingNumber: 'TRK-2024-002',
        recipientName: 'Jane Smith',
        recipientPhone: '+919876543211',
        address: '456 Lakeside Avenue, Mumbai',
        shipmentType: 'Clothing',
        value: 2000,
        paymentType: 'cash-on-delivery',
        amountToCollect: 2000,
        priority: 'medium',
        attemptNumber: 1
      },
      {
        id: 'SHP003',
        trackingNumber: 'TRK-2024-003',
        recipientName: 'Ali Khan',
        recipientPhone: '+919876543212',
        address: '789 Business District, Mumbai',
        shipmentType: 'Documents',
        value: 500,
        paymentType: 'prepaid',
        amountToCollect: 0,
        priority: 'low',
        attemptNumber: 2
      }
    ];
    
    res.json({
      success: true,
      podPending: pendingPOD,
      count: pendingPOD.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pending POD' });
  }
});

/**
 * POST /api/shipments/pod/submit
 * Submit proof of delivery with photo and signature
 */
  router.post('/shipments/pod/submit', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const {
      shipmentId,
      driverId,
      receiverName,
      receiverPhone,
      photoUrl,
      signatureData,
      packageCondition,
      notes,
      paymentMethod,
      amountCollected,
      location
    } = req.body;
    
    // Validation - make fields flexible for MVP
    if (!shipmentId || !receiverName) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['shipmentId', 'receiverName']
      });
    }
    
    // Save POD record - with company context
    const podRecord = {
      id: `POD-${Date.now()}`,
      company_id: user.company_id || user.id,
      shipmentId,
      driverId: driverId || user.id,
      receiverName,
      receiverPhone: receiverPhone || '',
      photoUrl: photoUrl || 'default-pod-photo.jpg',
      signatureUrl: signatureData || null,
      packageCondition: packageCondition || 'good',
      notes: notes || '',
      paymentMethod: paymentMethod || 'pending',
      amountCollected: amountCollected || 0,
      location: location || '',
      submittedAt: new Date(),
      status: 'submitted'
    };
    
    // Store in memory cache keyed by company
    if (!global.podRecords) global.podRecords = {};
    if (!global.podRecords[podRecord.company_id]) global.podRecords[podRecord.company_id] = [];
    global.podRecords[podRecord.company_id].push(podRecord);
    
    console.log(`✅ POD submitted for company ${podRecord.company_id}:`, podRecord);
    
    res.json({
      success: true,
      message: 'Proof of delivery submitted successfully',
      podId: podRecord.id,
      status: 'submitted',
      data: podRecord
    });
  } catch (error) {
    console.error('POD submission error:', error);
    res.status(500).json({ error: 'Failed to submit proof of delivery', details: error.message });
  }
});

/**
 * GET /api/shipments/pod/completed
 * Get list of deliveries with completed POD
 */
  router.get('/shipments/pod/completed', authenticateToken, async (req, res) => {
  try {
    const completedPOD = [
      {
        id: 'SHP101',
        trackingNumber: 'TRK-2024-101',
        recipientName: 'Priya Patel',
        deliveryDate: new Date(Date.now() - 2 * 86400000),
        photoUrl: '/uploads/pod-101.jpg',
        signaturePresent: true,
        packageCondition: 'good',
        attempts: 1
      },
      {
        id: 'SHP102',
        trackingNumber: 'TRK-2024-102',
        recipientName: 'Arjun Desai',
        deliveryDate: new Date(Date.now() - 1 * 86400000),
        photoUrl: '/uploads/pod-102.jpg',
        signaturePresent: true,
        packageCondition: 'good',
        attempts: 1
      },
      {
        id: 'SHP103',
        trackingNumber: 'TRK-2024-103',
        recipientName: 'Meera Kumar',
        deliveryDate: new Date(Date.now() - 1 * 86400000),
        photoUrl: '/uploads/pod-103.jpg',
        signaturePresent: false,
        packageCondition: 'damaged',
        attempts: 2
      },
      {
        id: 'SHP104',
        trackingNumber: 'TRK-2024-104',
        recipientName: 'Rohan Sharma',
        deliveryDate: new Date(Date.now() - 3 * 86400000),
        photoUrl: '/uploads/pod-104.jpg',
        signaturePresent: true,
        packageCondition: 'good',
        attempts: 1
      }
    ];
    
    res.json({
      success: true,
      completedPOD,
      count: completedPOD.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch completed POD' });
  }
});

// ─────────────────────────────────────────────────────────
// 3. ROUTE OPTIMIZATION ROUTES
// ─────────────────────────────────────────────────────────

/**
 * POST /api/routes/optimize
 * Generate optimized route based on shipments and constraints
 */
  router.post('/routes/optimize', authenticateToken, async (req, res) => {
  try {
    const {
      origin,
      shipmentIds,
      vehicleType,
      priority,
      constraints
    } = req.body;
    
    if (!origin || !shipmentIds || !Array.isArray(shipmentIds)) {
      return res.status(400).json({ error: 'Invalid route optimization parameters' });
    }
    
    // Mock TSP solution
    const mockOptimizedRoute = {
      id: `ROUTE-${Date.now()}`,
      origin: origin || 'Warehouse, Mumbai',
      stops: [
        { sequence: 1, shipmentId: shipmentIds[0], address: '123 Marine Drive, Mumbai', eta: new Date(Date.now() + 30 * 60000) },
        { sequence: 2, shipmentId: shipmentIds[1], address: '456 Lakeside Avenue, Mumbai', eta: new Date(Date.now() + 50 * 60000) },
        { sequence: 3, shipmentId: shipmentIds[2], address: '789 Business District, Mumbai', eta: new Date(Date.now() + 70 * 60000) }
      ],
      metrics: {
        totalDistance: 28.1,
        totalTime: 92,
        estimatedCost: 337,
        co2Emissions: 6.4,
        stopCount: shipmentIds.length
      },
      alternatives: [
        {
          routeId: 'ALT-1',
          distance: 35.2,
          time: 115,
          cost: 420,
          description: 'Via Toll Road (Fastest)'
        },
        {
          routeId: 'ALT-2',
          distance: 42.1,
          time: 98,
          cost: 504,
          description: 'Highway Route (Cheapest)'
        }
      ],
      vehicleType,
      priority,
      optimizationMethod: 'nearest-neighbor',
      savedDistance: 17.1,
      savedCost: 203,
      createdAt: new Date(),
      status: 'optimized'
    };
    
    // TODO: Implement real TSP solver
    // const osrmResponse = await fetch(OSRM_API);
    // Parse and optimize
    
    res.json({
      success: true,
      route: mockOptimizedRoute,
      message: `Route optimized with ${mockOptimizedRoute.metrics.stopCount} stops`
    });
  } catch (error) {
    console.error('Route optimization error:', error);
    res.status(500).json({ error: 'Failed to optimize route' });
  }
});

/**
 * GET /api/routes/:id
 * Get route details
 */
  router.get('/routes/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const route = {
      id,
      origin: 'Warehouse, Mumbai',
      status: 'in-progress',
      progress: 65,
      stops: [
        { sequence: 1, completed: true, completedAt: new Date(Date.now() - 60 * 60000) },
        { sequence: 2, completed: true, completedAt: new Date(Date.now() - 30 * 60000) },
        { sequence: 3, completed: false, eta: new Date(Date.now() + 15 * 60000) }
      ],
      metrics: {
        totalDistance: 28.1,
        distanceCovered: 18.3,
        distanceRemaining: 9.8,
        averageSpeed: 42,
        estimatedCompletion: new Date(Date.now() + 15 * 60000)
      }
    };
    
    res.json({ success: true, route });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch route' });
  }
});

/**
 * POST /api/routes/save-template
 * Save route as reusable template
 */
  router.post('/routes/save-template', authenticateToken, async (req, res) => {
  try {
    const { routeId, templateName, description } = req.body;
    
    const template = {
      id: `TEMPLATE-${Date.now()}`,
      routeId,
      templateName,
      description,
      createdAt: new Date()
    };
    
    res.json({
      success: true,
      template,
      message: 'Route saved as template'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save route template' });
  }
});

// ─────────────────────────────────────────────────────────
// 4. DRIVER MANAGEMENT & MOBILE APP ROUTES
// ─────────────────────────────────────────────────────────

/**
 * GET /api/drivers
 * Get list of all drivers with status
 */
  router.get('/drivers', authenticateToken, async (req, res) => {
  try {
    const { status } = req.query;
    
    const drivers = [
      {
        id: 'DRV001',
        name: 'Raj Kumar',
        phone: '+919876543210',
        status: 'online',
        location: { latitude: 19.0596, longitude: 72.8295, address: 'Bandra, Mumbai' },
        activeTasks: 3,
        completedToday: 8,
        successRate: 98,
        rating: 4.8,
        appVersion: '2.4.1',
        onlineSince: new Date(Date.now() - 120 * 60000),
        avatar: '/assets/driver-1.jpg'
      },
      {
        id: 'DRV002',
        name: 'Priya Singh',
        phone: '+919876543211',
        status: 'on-delivery',
        location: { latitude: 19.0176, longitude: 72.8194, address: 'Dadar, Mumbai' },
        activeTasks: 2,
        completedToday: 10,
        successRate: 95,
        rating: 4.6,
        appVersion: '2.4.1',
        onlineSince: new Date(Date.now() - 480 * 60000),
        avatar: '/assets/driver-2.jpg'
      },
      {
        id: 'DRV003',
        name: 'Ahmed Khan',
        phone: '+919876543212',
        status: 'idle',
        location: { latitude: 19.0144, longitude: 72.8171, address: 'Worli, Mumbai' },
        activeTasks: 0,
        completedToday: 12,
        successRate: 99,
        rating: 4.9,
        appVersion: '2.4.0',
        onlineSince: new Date(Date.now() - 300 * 60000),
        avatar: '/assets/driver-3.jpg'
      },
      {
        id: 'DRV004',
        name: 'Sneha Patel',
        phone: '+919876543213',
        status: 'offline',
        location: { latitude: null, longitude: null, address: 'Off-duty' },
        activeTasks: 0,
        completedToday: 0,
        successRate: 97,
        rating: 4.7,
        appVersion: '2.3.2',
        onlineSince: null,
        avatar: '/assets/driver-4.jpg'
      }
    ];
    
    const stats = {
      totalDrivers: 24,
      onlineDrivers: 15,
      onDeliveryDrivers: 8,
      idleDrivers: 5,
      offlineDrivers: 9,
      averageSuccessRate: 97.6
    };
    
    res.json({
      success: true,
      drivers: status ? drivers.filter(d => d.status === status) : drivers,
      stats,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch drivers' });
  }
});

/**
 * GET /api/drivers/:id/performance
 * Get driver performance metrics
 */
  router.get('/drivers/:id/performance', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const performance = {
      driverId: id,
      totalDeliveries: 1245,
      completedDeliveries: 1210,
      failedDeliveries: 35,
      successRate: 97.2,
      averageDeliveryTime: 28,
      averageRating: 4.8,
      totalDistance: 15420,
      onTimePercentage: 94,
      damageClaims: 2,
      earnedIncentive: 12500,
      monthlyBonus: 5000,
      totalEarnings: 65000,
      lastPaymentDate: new Date(Date.now() - 7 * 86400000)
    };
    
    res.json({ success: true, performance });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch driver performance' });
  }
});

/**
 * POST /api/drivers/:id/assign-task
 * Assign delivery task to driver
 */
  router.post('/drivers/:id/assign-task', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { shipmentIds } = req.body;
    
    const assignment = {
      driverId: id,
      assignedTasks: shipmentIds.length,
      assignedAt: new Date(),
      estimatedCompletion: new Date(Date.now() + 4 * 60 * 60 * 1000)
    };
    
    res.json({
      success: true,
      assignment,
      message: `${shipmentIds.length} tasks assigned to driver`
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to assign task' });
  }
});

/**
 * POST /api/drivers/:id/update-app-version
 * Force update driver mobile app
 */
  router.post('/drivers/:id/update-app-version', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { version, forceUpdate } = req.body;
    
    res.json({
      success: true,
      message: `Update triggered for driver ${id}`,
      version,
      forceUpdate
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to trigger app update' });
  }
});

/**
 * POST /api/drivers/broadcast-message
 * Send broadcast message to all drivers
 */
  router.post('/drivers/broadcast-message', authenticateToken, async (req, res) => {
  try {
    const { message, priority, targetDriverIds } = req.body;
    
    const broadcast = {
      id: `MSG-${Date.now()}`,
      message,
      priority,
      targetCount: targetDriverIds?.length || 24,
      sentAt: new Date(),
      deliveredCount: 0,
      readCount: 0
    };
    
    res.json({
      success: true,
      broadcast,
      message: 'Message queued for delivery'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send broadcast message' });
  }
});

// ─────────────────────────────────────────────────────────
// 5. DELIVERY ANALYTICS ROUTES
// ─────────────────────────────────────────────────────────

/**
 * GET /api/delivery-analytics/report
 * Get comprehensive delivery analytics report
 */
  router.get('/delivery-analytics/report', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, timeRange } = req.query;
    
    const report = {
      period: timeRange || 'week',
      startDate: startDate || new Date(Date.now() - 7 * 86400000),
      endDate: endDate || new Date(),
      kpis: {
        totalDeliveries: 1458,
        successfulDeliveries: 1432,
        failedDeliveries: 24,
        pendingDeliveries: 2,
        successRate: 98.3,
        averageDeliveryTime: 138,
        averageCostPerDelivery: 345,
        totalRevenue: 503210,
        totalCost: 287640,
        profit: 215570,
        co2Saved: 2.4, // Tons
        fuelSaved: 89500 // INR
      },
      statusBreakdown: {
        inTransit: 145,
        outForDelivery: 89,
        delivered: 1432,
        delayed: 18,
        failed: 24
      },
      hourlyBreakdown: [
        { hour: 0, deliveries: 0 },
        { hour: 6, deliveries: 23 },
        { hour: 9, deliveries: 142 },
        { hour: 12, deliveries: 198 },
        { hour: 15, deliveries: 256 },
        { hour: 18, deliveries: 189 },
        { hour: 21, deliveries: 45 },
        { hour: 24, deliveries: 5 }
      ],
      topVendors: [
        { vendorId: 'V001', name: 'TechWorld', deliveries: 245, successRate: 99.2, avgRating: 4.8 },
        { vendorId: 'V002', name: 'FashionHub', deliveries: 198, successRate: 98.5, avgRating: 4.6 },
        { vendorId: 'V003', name: 'HomeGoods', deliveries: 156, successRate: 97.4, avgRating: 4.5 }
      ],
      costBreakdown: {
        fuelCost: 125640,
        driverSalary: 95000,
        vehicleMaintenance: 32500,
        miscellaneous: 34500,
        totalCost: 287640
      },
      trends: {
        dayOverDayChange: 2.3, // percentage
        weekOverWeekChange: 5.1,
        costTrend: -1.5
      }
    };
    
    res.json({
      success: true,
      report,
      generatedAt: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate analytics report' });
  }
});

/**
 * GET /api/delivery-analytics/export
 * Export analytics in PDF/CSV format
 */
  router.get('/delivery-analytics/export', authenticateToken, async (req, res) => {
  try {
    const { format, dateRange } = req.query;
    
    const exportFile = {
      id: `EXPORT-${Date.now()}`,
      format: format || 'pdf',
      dateRange,
      status: 'queued',
      downloadUrl: `/exports/analytics-${dateRange}.${format || 'pdf'}`,
      createdAt: new Date()
    };
    
    res.json({
      success: true,
      export: exportFile,
      message: 'Export queued, you will receive email when ready'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to export analytics' });
  }
});

// ─────────────────────────────────────────────────────────
// 6. TERRITORY MANAGEMENT ROUTES
// ─────────────────────────────────────────────────────────

/**
 * GET /api/territories
 * Get all territories with workload info
 */
  router.get('/territories', authenticateToken, async (req, res) => {
  try {
    const territories = [
      {
        id: 'TER001',
        name: 'North Delhi',
        areas: ['Rohini', 'Dwarka', 'Najafgarh'],
        postalCodes: ['110085', '110086', '110087'],
        assignedDriver: { id: 'DRV001', name: 'Raj Kumar', phone: '+919876543210' },
        workload: {
          expectedDaily: 45,
          currentDeliveries: 28,
          utilizationPercentage: 62,
          capacity: 45
        },
        metrics: {
          totalDeliveries: 1245,
          successRate: 98.2,
          averageDeliveryTime: 32
        },
        status: 'active'
      },
      {
        id: 'TER002',
        name: 'South Mumbai',
        areas: ['Colaba', 'Fort', 'Girgaon'],
        postalCodes: ['400001', '400002', '400004'],
        assignedDriver: { id: 'DRV002', name: 'Priya Singh', phone: '+919876543211' },
        workload: {
          expectedDaily: 50,
          currentDeliveries: 32,
          utilizationPercentage: 64,
          capacity: 50
        },
        metrics: {
          totalDeliveries: 1456,
          successRate: 97.8,
          averageDeliveryTime: 28
        },
        status: 'active'
      },
      {
        id: 'TER003',
        name: 'West Mumbai',
        areas: ['Andheri', 'Bandra', 'Vile Parle'],
        postalCodes: ['400058', '400050', '400057'],
        assignedDriver: null,
        workload: {
          expectedDaily: 48,
          currentDeliveries: 0,
          utilizationPercentage: 0,
          capacity: 48
        },
        metrics: {
          totalDeliveries: 0,
          successRate: 0,
          averageDeliveryTime: 0
        },
        status: 'unassigned'
      }
    ];
    
    res.json({
      success: true,
      territories,
      count: territories.length,
      unassignedCount: territories.filter(t => !t.assignedDriver).length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch territories' });
  }
});

/**
 * POST /api/territories/:id/assign
 * Assign territory to driver
 */
  router.post('/territories/:id/assign', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { driverId } = req.body;
    
    const assignment = {
      territoryId: id,
      driverId,
      assignedAt: new Date(),
      status: 'active'
    };
    
    res.json({
      success: true,
      assignment,
      message: 'Territory assigned successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to assign territory' });
  }
});

/**
 * POST /api/territories/optimize
 * Get optimization suggestions for territory rebalancing
 */
  router.post('/territories/optimize', authenticateToken, async (req, res) => {
  try {
    const suggestions = [
      {
        action: 'reassign',
        from: 'TER001',
        to: 'TER003',
        reason: 'TER001 is overloaded (62%), TER003 is unassigned',
        estimatedImpact: 'Balanced utilization 50%-50%',
        recommendation: 'Reassign 12 deliveries from Raj Kumar to new driver'
      },
      {
        action: 'hire',
        territory: 'TER003',
        reason: 'High demand in West Mumbai requires dedicated driver',
        estimatedCost: 30000,
        estimatedROI: 2.1
      },
      {
        action: 'merge',
        territories: ['TER001', 'TER003'],
        reason: 'Low utilization in both territories',
        estimatedSavings: 15000,
        impact: 'Reduced management overhead'
      }
    ];
    
    res.json({
      success: true,
      suggestions,
      optimizationScore: 65,
      message: 'Optimization analysis complete'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate optimization suggestions' });
  }
});

/**
 * GET /api/territories/:id/workload
 * Get detailed workload analysis for territory
 */
  router.get('/territories/:id/workload', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const workload = {
      territoryId: id,
      date: new Date(),
      hourlyBreakdown: [
        { hour: 0, deliveries: 0, utilization: 0 },
        { hour: 6, deliveries: 3, utilization: 6 },
        { hour: 9, deliveries: 12, utilization: 26 },
        { hour: 12, deliveries: 18, utilization: 40 },
        { hour: 15, deliveries: 15, utilization: 33 },
        { hour: 18, deliveries: 8, utilization: 18 },
        { hour: 21, deliveries: 3, utilization: 6 },
        { hour: 24, deliveries: 0, utilization: 0 }
      ],
      peakHours: [12, 15],
      averageUtilization: 41,
      capacity: 45,
      recommendations: [
        'Peak demand at 12-15h, ensure driver availability',
        'Consider extending hours 9-18h for better distribution'
      ]
    };
    
    res.json({ success: true, workload });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch territory workload' });
  }
});

  // ─────────────────────────────────────────────────────────
  // Export router from module function
  // ─────────────────────────────────────────────────────────
  return router;
};

/**
 * Usage in server.js:
 * 
 * const nomadiaRoutesModule = require('./routes-nomadia');
 * const nomadiaRoutes = nomadiaRoutesModule(authenticateToken);
 * app.use('/api', nomadiaRoutes);
 */
