require('dotenv').config();
const mongoose = require('mongoose');

// MongoDB Connection - Read from .env
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/freightflow';

async function connectMongo() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000
    });
    
    console.log('✅ MongoDB Connected at ' + MONGO_URI);
    return true;
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.log('⚠️  MongoDB not running. Please start MongoDB:');
    console.log('   • Windows: mongod --dbpath "C:\\data\\db"');
    console.log('   • Or use MongoDB Atlas connection string in .env');
    return false;
  }
}

// Define Schemas
const ShipmentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  company_id: String,
  user_id: String,
  customer_id: String,
  origin: String,
  destination: String,
  cargo_type: String,
  weight: Number,
  dimensions: Object,
  transport_mode: String,
  priority: String,
  status: String,
  tracking_number: String,
  estimated_delivery: Date,
  value: Number,
  insurance_required: Boolean,
  pricing: Object,
  created_at: { type: Date, default: Date.now },
  updated_at: Date
});

const VehicleSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  company_id: String,
  registration_number: String,
  vehicle_type: String,
  capacity_weight: Number,
  capacity_volume: Number,
  fuel_type: String,
  gps_enabled: Boolean,
  driver_id: String,
  status: String,
  location: Object,
  fuel_level: Number,
  mileage: Number,
  last_maintenance: Date,
  next_maintenance: Date,
  created_at: { type: Date, default: Date.now }
});

// Models
const Shipment = mongoose.model('ff_shipments', ShipmentSchema, 'ff_shipments');
const Vehicle = mongoose.model('ff_vehicles', VehicleSchema, 'ff_vehicles');

// Test Data
const TEST_COMPANY_ID = 'comp-001';
const TEST_USER_ID = 'user-001';

const testShipments = [
  {
    id: 'ship-001',
    company_id: TEST_COMPANY_ID,
    user_id: TEST_USER_ID,
    customer_id: 'cust-101',
    origin: 'Mumbai, Maharashtra',
    destination: 'Delhi, Delhi',
    cargo_type: 'Electronics',
    weight: 45.5,
    dimensions: { length: 60, width: 40, height: 30 },
    transport_mode: 'Road',
    priority: 'High',
    status: 'in-transit',
    tracking_number: 'FF-2026-001',
    estimated_delivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    value: 125000,
    insurance_required: true,
    pricing: { base_cost: 5000, tax: 900, total: 5900 },
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'ship-002',
    company_id: TEST_COMPANY_ID,
    user_id: TEST_USER_ID,
    customer_id: 'cust-102',
    origin: 'Bangalore, Karnataka',
    destination: 'Hyderabad, Telangana',
    cargo_type: 'Textiles',
    weight: 120,
    dimensions: { length: 100, width: 80, height: 60 },
    transport_mode: 'Road',
    priority: 'Medium',
    status: 'in-transit',
    tracking_number: 'FF-2026-002',
    estimated_delivery: new Date(Date.now() + 1.5 * 24 * 60 * 60 * 1000),
    value: 85000,
    insurance_required: true,
    pricing: { base_cost: 3500, tax: 630, total: 4130 },
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'ship-003',
    company_id: TEST_COMPANY_ID,
    user_id: TEST_USER_ID,
    customer_id: 'cust-103',
    origin: 'Chennai, Tamil Nadu',
    destination: 'Pune, Maharashtra',
    cargo_type: 'Pharmaceuticals',
    weight: 22.3,
    dimensions: { length: 50, width: 35, height: 25 },
    transport_mode: 'Road',
    priority: 'Critical',
    status: 'out-for-delivery',
    tracking_number: 'FF-2026-003',
    estimated_delivery: new Date(Date.now() + 8 * 60 * 60 * 1000),
    value: 250000,
    insurance_required: true,
    pricing: { base_cost: 8500, tax: 1530, total: 10030 },
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'ship-004',
    company_id: TEST_COMPANY_ID,
    user_id: TEST_USER_ID,
    customer_id: 'cust-104',
    origin: 'Kolkata, West Bengal',
    destination: 'Ahmedabad, Gujarat',
    cargo_type: 'Machinery',
    weight: 350,
    dimensions: { length: 200, width: 150, height: 120 },
    transport_mode: 'Road',
    priority: 'Medium',
    status: 'pending',
    tracking_number: 'FF-2026-004',
    estimated_delivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    value: 450000,
    insurance_required: true,
    pricing: { base_cost: 12000, tax: 2160, total: 14160 },
    created_at: new Date()
  },
  {
    id: 'ship-005',
    company_id: TEST_COMPANY_ID,
    user_id: TEST_USER_ID,
    customer_id: 'cust-105',
    origin: 'Jaipur, Rajasthan',
    destination: 'Lucknow, Uttar Pradesh',
    cargo_type: 'Retail Goods',
    weight: 85,
    dimensions: { length: 80, width: 70, height: 50 },
    transport_mode: 'Road',
    priority: 'Low',
    status: 'ready-for-dispatch',
    tracking_number: 'FF-2026-005',
    estimated_delivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    value: 95000,
    insurance_required: false,
    pricing: { base_cost: 3200, tax: 576, total: 3776 },
    created_at: new Date()
  },
  {
    id: 'ship-006',
    company_id: TEST_COMPANY_ID,
    user_id: TEST_USER_ID,
    customer_id: 'cust-106',
    origin: 'Surat, Gujarat',
    destination: 'Indore, Madhya Pradesh',
    cargo_type: 'Diamonds & Jewelry',
    weight: 5.5,
    dimensions: { length: 30, width: 25, height: 20 },
    transport_mode: 'Road',
    priority: 'Critical',
    status: 'in-transit',
    tracking_number: 'FF-2026-006',
    estimated_delivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    value: 1500000,
    insurance_required: true,
    pricing: { base_cost: 15000, tax: 2700, total: 17700 },
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000)
  },
  {
    id: 'ship-007',
    company_id: TEST_COMPANY_ID,
    user_id: TEST_USER_ID,
    customer_id: 'cust-107',
    origin: 'Nagpur, Maharashtra',
    destination: 'Vadodara, Gujarat',
    cargo_type: 'Food & Beverages',
    weight: 150,
    dimensions: { length: 120, width: 90, height: 80 },
    transport_mode: 'Road',
    priority: 'High',
    status: 'in-transit',
    tracking_number: 'FF-2026-007',
    estimated_delivery: new Date(Date.now() + 2.5 * 24 * 60 * 60 * 1000),
    value: 75000,
    insurance_required: false,
    pricing: { base_cost: 2800, tax: 504, total: 3304 },
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000)
  },
  {
    id: 'ship-008',
    company_id: TEST_COMPANY_ID,
    user_id: TEST_USER_ID,
    customer_id: 'cust-108',
    origin: 'Goa, Goa',
    destination: 'Kochi, Kerala',
    cargo_type: 'Spices & Condiments',
    weight: 180,
    dimensions: { length: 110, width: 85, height: 70 },
    transport_mode: 'Road',
    priority: 'Medium',
    status: 'delivered',
    tracking_number: 'FF-2026-008',
    estimated_delivery: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    value: 55000,
    insurance_required: false,
    pricing: { base_cost: 2200, tax: 396, total: 2596 },
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
  }
];

const testVehicles = [
  {
    id: 'veh-001',
    company_id: TEST_COMPANY_ID,
    registration_number: 'MH-02-AB-1234',
    vehicle_type: 'Truck',
    capacity_weight: 10000,
    capacity_volume: 45,
    fuel_type: 'Diesel',
    gps_enabled: true,
    driver_id: 'driver-001',
    status: 'active',
    location: {
      lat: 19.0760,
      lng: 72.8777,
      address: 'Near Gateway of India, Mumbai'
    },
    fuel_level: 85,
    mileage: 125000,
    last_maintenance: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    next_maintenance: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'veh-002',
    company_id: TEST_COMPANY_ID,
    registration_number: 'KA-05-CD-5678',
    vehicle_type: 'Truck',
    capacity_weight: 12000,
    capacity_volume: 55,
    fuel_type: 'Diesel',
    gps_enabled: true,
    driver_id: 'driver-002',
    status: 'active',
    location: {
      lat: 12.9394,
      lng: 77.6245,
      address: 'Electronics City, Bangalore'
    },
    fuel_level: 72,
    mileage: 98000,
    last_maintenance: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    next_maintenance: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'veh-003',
    company_id: TEST_COMPANY_ID,
    registration_number: 'TN-09-EF-9012',
    vehicle_type: 'Van',
    capacity_weight: 3000,
    capacity_volume: 15,
    fuel_type: 'Petrol',
    gps_enabled: true,
    driver_id: 'driver-003',
    status: 'active',
    location: {
      lat: 13.0827,
      lng: 80.2707,
      address: 'Anna Salai, Chennai'
    },
    fuel_level: 60,
    mileage: 45000,
    last_maintenance: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    next_maintenance: new Date(Date.now() + 80 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'veh-004',
    company_id: TEST_COMPANY_ID,
    registration_number: 'MH-01-GH-3456',
    vehicle_type: 'Truck',
    capacity_weight: 8000,
    capacity_volume: 35,
    fuel_type: 'Diesel',
    gps_enabled: true,
    driver_id: 'driver-004',
    status: 'inactive',
    location: {
      lat: 18.5204,
      lng: 73.8567,
      address: 'Depot, Pune'
    },
    fuel_level: 40,
    mileage: 156000,
    last_maintenance: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    next_maintenance: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'veh-005',
    company_id: TEST_COMPANY_ID,
    registration_number: 'GJ-04-IJ-7890',
    vehicle_type: 'Truck',
    capacity_weight: 9500,
    capacity_volume: 42,
    fuel_type: 'Diesel',
    gps_enabled: true,
    driver_id: 'driver-005',
    status: 'active',
    location: {
      lat: 23.0225,
      lng: 72.5714,
      address: 'CG Road, Ahmedabad'
    },
    fuel_level: 78,
    mileage: 112000,
    last_maintenance: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    next_maintenance: new Date(Date.now() + 65 * 24 * 60 * 60 * 1000)
  }
];

async function insertTestData() {
  console.log('\n📊 INSERTING TEST DATA...\n');
  
  try {
    // Delete existing test data
    console.log('🗑️  Clearing previous test data...');
    const deletedShipments = await Shipment.deleteMany({ company_id: TEST_COMPANY_ID });
    const deletedVehicles = await Vehicle.deleteMany({ company_id: TEST_COMPANY_ID });
    console.log(`  ✓ Deleted ${deletedShipments.deletedCount} old shipments`);
    console.log(`  ✓ Deleted ${deletedVehicles.deletedCount} old vehicles\n`);

    // Insert shipments
    console.log('📦 Inserting test shipments...');
    const insertedShipments = await Shipment.insertMany(testShipments);
    console.log(`  ✓ Inserted ${insertedShipments.length} shipments`);
    
    // Show shipment summary
    const shipmentsByStatus = {};
    insertedShipments.forEach(s => {
      shipmentsByStatus[s.status] = (shipmentsByStatus[s.status] || 0) + 1;
    });
    
    Object.entries(shipmentsByStatus).forEach(([status, count]) => {
      console.log(`    • ${status}: ${count}`);
    });

    // Insert vehicles
    console.log('\n🚗 Inserting test vehicles...');
    const insertedVehicles = await Vehicle.insertMany(testVehicles);
    console.log(`  ✓ Inserted ${insertedVehicles.length} vehicles`);
    
    // Show vehicle summary
    const vehiclesByStatus = {};
    insertedVehicles.forEach(v => {
      vehiclesByStatus[v.status] = (vehiclesByStatus[v.status] || 0) + 1;
    });
    
    Object.entries(vehiclesByStatus).forEach(([status, count]) => {
      console.log(`    • ${status}: ${count}`);
    });

    console.log('\n✅ TEST DATA INSERTION SUCCESSFUL\n');
    console.log('Ready to test:');
    console.log('  1. GPS Real-Time Tracking    → GET /api/shipments/tracking');
    console.log('  2. Proof of Delivery        → POST /api/shipments/pod/submit');
    console.log('  3. Route Optimization       → POST /api/routes/optimize');
    console.log('  4. Driver Delivery App      → GET /api/drivers/assignments\n');

    return true;
  } catch (error) {
    console.error('❌ Error inserting test data:', error.message);
    return false;
  }
}

async function main() {
  console.log('\n🚀 FREIGHTFLOW TEST DATA SETUP\n');
  console.log('Company ID: ' + TEST_COMPANY_ID);
  console.log('User ID:    ' + TEST_USER_ID);
  
  const connected = await connectMongo();
  
  if (connected) {
    const success = await insertTestData();
    
    if (success) {
      console.log('📋 TEST DATA REFERENCE:');
      console.log('  Company:  comp-001');
      console.log('  Shipments: ship-001 to ship-008');
      console.log('  Vehicles:  veh-001 to veh-005\n');
    }
    
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed\n');
  } else {
    console.log('\n❌ Please start MongoDB and try again:');
    console.log('   mongod --dbpath "C:\\data\\db"\n');
  }
}

main().catch(console.error);
