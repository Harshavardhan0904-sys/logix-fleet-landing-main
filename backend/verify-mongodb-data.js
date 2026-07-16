require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/freightflow';

async function verifyMongoDBData() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Define schemas
    const ShipmentSchema = new mongoose.Schema({}, { strict: false });
    const VehicleSchema = new mongoose.Schema({}, { strict: false });
    const UserSchema = new mongoose.Schema({}, { strict: false });

    const Shipment = mongoose.model('ff_shipments', ShipmentSchema, 'ff_shipments');
    const Vehicle = mongoose.model('ff_vehicles', VehicleSchema, 'ff_vehicles');
    const User = mongoose.model('ff_users', UserSchema, 'ff_users');

    // Verify Shipments for comp-001
    console.log('📦 SHIPMENTS VERIFICATION');
    console.log('═'.repeat(60));
    
    const shipments = await Shipment.find({ company_id: 'comp-001' }).lean();
    console.log(`Total shipments for comp-001: ${shipments.length}\n`);

    if (shipments.length > 0) {
      // Group by status
      const byStatus = {};
      shipments.forEach(s => {
        byStatus[s.status] = (byStatus[s.status] || 0) + 1;
      });

      console.log('Shipments by Status:');
      Object.entries(byStatus).forEach(([status, count]) => {
        console.log(`  • ${status}: ${count}`);
      });

      console.log('\nSample Shipments:');
      shipments.slice(0, 3).forEach((s, idx) => {
        console.log(`\n  Shipment ${s.id}:`);
        console.log(`    • Tracking: ${s.tracking_number}`);
        console.log(`    • From: ${s.origin}`);
        console.log(`    • To: ${s.destination}`);
        console.log(`    • Status: ${s.status}`);
        console.log(`    • Weight: ${s.weight} kg`);
        console.log(`    • Value: ₹${s.value}`);
        console.log(`    • Cargo: ${s.cargo_type}`);
      });
    }

    // Verify Vehicles for comp-001
    console.log('\n\n🚗 VEHICLES VERIFICATION');
    console.log('═'.repeat(60));
    
    const vehicles = await Vehicle.find({ company_id: 'comp-001' }).lean();
    console.log(`Total vehicles for comp-001: ${vehicles.length}\n`);

    if (vehicles.length > 0) {
      // Group by status
      const byStatus = {};
      vehicles.forEach(v => {
        byStatus[v.status] = (byStatus[v.status] || 0) + 1;
      });

      console.log('Vehicles by Status:');
      Object.entries(byStatus).forEach(([status, count]) => {
        console.log(`  • ${status}: ${count}`);
      });

      console.log('\nSample Vehicles:');
      vehicles.slice(0, 3).forEach((v, idx) => {
        console.log(`\n  Vehicle ${v.id}:`);
        console.log(`    • Registration: ${v.registration_number}`);
        console.log(`    • Type: ${v.vehicle_type}`);
        console.log(`    • Capacity (Weight): ${v.capacity_weight} kg`);
        console.log(`    • Status: ${v.status}`);
        console.log(`    • GPS Enabled: ${v.gps_enabled ? '✅' : '❌'}`);
        console.log(`    • Last Maintenance: ${v.last_maintenance ? new Date(v.last_maintenance).toLocaleDateString() : 'N/A'}`);
      });
    }

    // Verify User
    console.log('\n\n👤 USER VERIFICATION');
    console.log('═'.repeat(60));
    
    const user = await User.findOne({ id: 'user-001' }).lean();
    if (user) {
      console.log('✅ Test user for comp-001 exists\n');
      console.log(`  • ID: ${user.id}`);
      console.log(`  • Email: ${user.email}`);
      console.log(`  • Company: ${user.company}`);
      console.log(`  • Company ID: ${user.company_id}`);
      console.log(`  • Role: ${user.role}`);
      console.log(`  • Token: ${user.token.substring(0, 20)}...`);
    } else {
      console.log('❌ Test user for comp-001 not found');
    }

    // Database Summary
    console.log('\n\n📊 DATABASE SUMMARY');
    console.log('═'.repeat(60));
    
    const totalShipments = await Shipment.countDocuments();
    const totalVehicles = await Vehicle.countDocuments();
    const totalUsers = await User.countDocuments();

    console.log(`Total Shipments in DB: ${totalShipments}`);
    console.log(`Total Vehicles in DB: ${totalVehicles}`);
    console.log(`Total Users in DB: ${totalUsers}`);

    console.log('\n✅ MongoDB Verification Complete!');
    await mongoose.connection.close();
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

verifyMongoDBData();
