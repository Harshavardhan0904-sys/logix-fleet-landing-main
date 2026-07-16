require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/freightflow';

const UserSchema = new mongoose.Schema({
  id: String,
  email: String,
  password_hash: String,
  name: String,
  company: String,
  company_id: String,
  token: String,
  roles: [String],
  role: String,
  avatar: String,
  phone: String,
  gstin: String,
  pan: String,
  city: String,
  state: String,
  address: String,
  onboarded: Boolean,
  plan: String,
  plan_expires: Date,
  invoice_count: Number
});

const User = mongoose.model('ff_users', UserSchema, 'ff_users');

async function createTestUser() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Hash password using bcrypt
    const hashedPassword = await bcrypt.hash('test123', 10);

    // Create a test user for comp-001
    const testUser = new User({
      id: 'user-001',
      email: 'test@comp-001.com',
      password_hash: hashedPassword,
      name: 'Test User',
      company: 'Test Company',
      company_id: 'comp-001',
      token: 'test-token-comp-001-' + Date.now(),
      roles: ['admin'],
      role: 'admin',
      avatar: 'TU',
      phone: '9876543210',
      gstin: '',
      pan: '',
      city: 'Mumbai',
      state: 'Maharashtra',
      address: 'Test Address',
      onboarded: true,
      plan: 'enterprise',
      plan_expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      invoice_count: 0
    });

    // Check if user already exists
    const existing = await User.findOne({ id: 'user-001' });
    if (existing) {
      console.log('✅ Test user already exists');
      console.log('📋 User Details:');
      console.log(`   ID: ${existing.id}`);
      console.log(`   Email: ${existing.email}`);
      console.log(`   Company ID: ${existing.company_id}`);
      console.log(`   Token: ${existing.token}`);
    } else {
      await testUser.save();
      console.log('✅ Test user created successfully');
      console.log('📋 User Details:');
      console.log(`   ID: ${testUser.id}`);
      console.log(`   Email: ${testUser.email}`);
      console.log(`   Company ID: ${testUser.company_id}`);
      console.log(`   Token: ${testUser.token}`);
    }

    await mongoose.connection.close();
    console.log('✅ Connection closed');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

createTestUser();
