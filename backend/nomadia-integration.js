/**
 * Nomadia Features - Integration Setup & Configuration
 * 
 * This file contains:
 * - Third-party library setup instructions
 * - Environment variable configuration
 * - Database migration scripts
 * - Integration initialization code
 */

// ─────────────────────────────────────────────────────────
// 1. REQUIRED NPM PACKAGES
// ─────────────────────────────────────────────────────────

/**
 * Install these packages:
 * 
 * npm install chart.js
 * npm install multer
 * npm install aws-sdk
 * npm install pdfkit
 * npm install papaparse
 * npm install signature_pad
 * npm install axios
 * 
 * Optional but recommended:
 * npm install redis
 * npm install socket.io
 * npm install node-schedule
 */

// ─────────────────────────────────────────────────────────
// 2. ENVIRONMENT VARIABLES (.env file)
// ─────────────────────────────────────────────────────────

const exampleEnvConfig = `
# GPS TRACKING
GPS_UPDATE_INTERVAL=5000         # milliseconds between GPS updates
TRACK_HISTORY_RETENTION=30       # days to keep location history

# PHOTO STORAGE
PHOTO_STORAGE_TYPE=local         # 'local', 's3', or 'azure'
PHOTO_MAX_SIZE=52428800          # 50MB in bytes
PHOTO_UPLOAD_PATH=./uploads      # Local upload path
PHOTO_QUALITY=0.85               # Compression quality (0-1)

# AWS S3 Configuration (if using S3)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=ap-south-1
AWS_S3_BUCKET=freightflow-photos
AWS_S3_FOLDER=deliveries

# ROUTE OPTIMIZATION
OSRM_API_URL=http://router.project-osrm.org
GOOGLE_MAPS_API_KEY=your_api_key
ROUTE_OPTIMIZATION_ENGINE=osrm   # 'osrm' or 'google_maps'

# ANALYTICS
ANALYTICS_CALCULATION_INTERVAL=3600000    # milliseconds
ANALYTICS_CACHE_TTL=1800                  # seconds

# NOTIFICATIONS
NOTIFICATION_QUEUE_ENABLED=true
FCM_SERVER_KEY=your_fcm_key              # Firebase Cloud Messaging
TWILIO_ACCOUNT_SID=your_sid              # For SMS notifications
TWILIO_AUTH_TOKEN=your_token

# DATABASE
MONGODB_URI=mongodb://localhost:27017/freightflow
DB_BACKUP_INTERVAL=86400000              # milliseconds

# TERRITORIES & WORKLOAD
TERRITORY_BALANCE_CHECK_INTERVAL=3600000 # Check hourly
WORKLOAD_DISTRIBUTION_THRESHOLD=80       # percentage

# FEATURE FLAGS
ENABLE_GPS_TRACKING=true
ENABLE_POD_CAPTURE=true
ENABLE_ROUTE_OPTIMIZATION=true
ENABLE_DRIVER_MOBILE_APP=true
ENABLE_ANALYTICS=true
ENABLE_TERRITORY_MANAGEMENT=true
`;

// ─────────────────────────────────────────────────────────
// 3. DATABASE SCHEMA MIGRATIONS
// ─────────────────────────────────────────────────────────

const migrationScript = `
// Migration 1: Add GPS Tracking fields to Shipment
db.shipments.updateMany(
  {},
  {
    $set: {
      location: null,
      latitude: null,
      longitude: null,
      speed: null,
      eta: null,
      trackingStatus: 'pending',
      lastLocationUpdate: new Date(),
      pod: {
        status: 'pending',
        submittedAt: null,
        receiverName: null,
        receiverPhone: null,
        photoUrl: null,
        signatureUrl: null,
        notes: null,
        packageCondition: 'good',
        paymentStatus: 'prepaid',
        amountCollected: null,
        timestamp: null
      },
      routeId: null,
      originalDistance: null,
      optimizedDistance: null,
      assignedDriver: null,
      territory: null
    }
  }
)

// Migration 2: Create indexes for performance
db.shipments.createIndex({ trackingStatus: 1, lastLocationUpdate: -1 })
db.shipments.createIndex({ latitude: 1, longitude: 1 })
db.shipments.createIndex({ assignedDriver: 1 })
db.shipments.createIndex({ territory: 1 })

// Migration 3: Create Route collection
db.createCollection('routes', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'origin', 'stops', 'vehicleType'],
      properties: {
        name: { bsonType: 'string' },
        origin: { bsonType: 'object' },
        stops: { bsonType: 'array' },
        vehicleType: { bsonType: 'string' },
        metrics: { bsonType: 'object' },
        status: { bsonType: 'string' }
      }
    }
  }
})

// Migration 4: Create Driver collection
db.createCollection('drivers', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'email', 'phone'],
      properties: {
        name: { bsonType: 'string' },
        phone: { bsonType: 'string' },
        status: { bsonType: 'string' },
        currentLocation: { bsonType: 'object' },
        performance: { bsonType: 'object' },
        territory: { bsonType: 'string' }
      }
    }
  }
})

// Migration 5: Create Territory collection
db.createCollection('territories', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'areas', 'workload'],
      properties: {
        name: { bsonType: 'string' },
        areas: { bsonType: 'array' },
        postalCodes: { bsonType: 'array' },
        assignedDriver: { bsonType: 'string' },
        workload: { bsonType: 'object' }
      }
    }
  }
})

// Migration 6: Create Analytics collection
db.createCollection('analytics', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['date', 'period', 'kpis'],
      properties: {
        date: { bsonType: 'date' },
        period: { bsonType: 'string' },
        kpis: { bsonType: 'object' }
      }
    }
  }
})

// Migration 7: Create ProofOfDelivery collection
db.createCollection('proofofdeliveries', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['shipmentId', 'submittedBy'],
      properties: {
        shipmentId: { bsonType: 'string' },
        submittedBy: { bsonType: 'object' },
        photo: { bsonType: 'object' },
        signature: { bsonType: 'object' },
        status: { bsonType: 'string' }
      }
    }
  }
})

// Create indexes for faster queries
db.routes.createIndex({ status: 1, createdAt: -1 })
db.drivers.createIndex({ status: 1 })
db.drivers.createIndex({ territory: 1 })
db.territories.createIndex({ assignedDriver: 1 })
db.analytics.createIndex({ date: -1, period: 1 })
`;

// ─────────────────────────────────────────────────────────
// 4. INTEGRATION INITIALIZATION CODE
// ─────────────────────────────────────────────────────────

class NomadiaIntegration {
  /**
   * Initialize all Nomadia services in Express app
   */
  static initializeServices(app) {
    console.log('Initializing Nomadia Features...');

    // Load environment variables
    require('dotenv').config();

    // Initialize database connections
    this.initializeDatabase();

    // Setup file upload middleware
    this.setupFileUpload(app);

    // Initialize real-time tracking (WebSocket)
    if (process.env.ENABLE_GPS_TRACKING === 'true') {
      this.initializeGPSTracking(app);
    }

    // Setup analytics calculation cron jobs
    if (process.env.ENABLE_ANALYTICS === 'true') {
      this.initializeAnalyticsCronJobs();
    }

    // Setup territory workload monitoring
    if (process.env.ENABLE_TERRITORY_MANAGEMENT === 'true') {
      this.initializeTerritoryMonitoring();
    }

    // Initialize push notifications
    this.initializeNotifications();

    // Setup caching layer (Redis)
    this.initializeCache();

    console.log('✓ Nomadia Features initialized successfully');
  }

  static initializeDatabase() {
    const mongoose = require('mongoose');
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/freightflow';

    mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10
    }).then(() => {
      console.log('✓ MongoDB connected');
    }).catch(err => {
      console.error('✗ MongoDB connection error:', err);
    });
  }

  static setupFileUpload(app) {
    const multer = require('multer');
    const fs = require('fs');
    const path = require('path');

    // Ensure upload directory exists
    const uploadPath = process.env.PHOTO_UPLOAD_PATH || './uploads';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    // Configure storage
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'photo-' + uniqueSuffix + path.extname(file.originalname));
      }
    });

    // File filter
    const fileFilter = (req, file, cb) => {
      const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type'), false);
      }
    };

    // Configure multer
    const upload = multer({
      storage,
      fileFilter,
      limits: {
        fileSize: parseInt(process.env.PHOTO_MAX_SIZE || 52428800)
      }
    });

    // Mount upload endpoint
    app.post('/api/upload/photo', upload.single('photo'), (req, res) => {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      res.json({
        success: true,
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size,
        url: `/uploads/${req.file.filename}`
      });
    });

    console.log('✓ File upload middleware configured');
  }

  static initializeGPSTracking(app) {
    const io = require('socket.io')(app, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    io.on('connection', (socket) => {
      console.log('GPS Tracking client connected:', socket.id);

      // Listen for location updates from driver app
      socket.on('location:update', (data) => {
        // Broadcast to all connected clients
        io.emit('shipment:location', data);
      });

      // Subscribe to specific shipment tracking
      socket.on('track:subscribe', (shipmentId) => {
        socket.join(`shipment:${shipmentId}`);
      });

      socket.on('disconnect', () => {
        console.log('GPS Tracking client disconnected');
      });
    });

    console.log('✓ GPS Tracking WebSocket initialized');
  }

  static initializeAnalyticsCronJobs() {
    const schedule = require('node-schedule');
    const interval = parseInt(process.env.ANALYTICS_CALCULATION_INTERVAL || 3600000);

    // Calculate analytics every hour
    schedule.scheduleJob('0 * * * *', async () => {
      console.log('Running hourly analytics calculation...');
      // TODO: Call analytics calculation service
    });

    console.log('✓ Analytics cron jobs configured');
  }

  static initializeTerritoryMonitoring() {
    const schedule = require('node-schedule');

    // Monitor territory workload hourly
    schedule.scheduleJob('0 * * * *', async () => {
      console.log('Checking territory workload balance...');
      // TODO: Call territory analysis service
    });

    console.log('✓ Territory monitoring initialized');
  }

  static initializeNotifications() {
    // Initialize Firebase Cloud Messaging
    try {
      const admin = require('firebase-admin');
      const serviceAccount = require('../config/firebase-service-account.json');

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DB_URL
      });

      console.log('✓ Firebase Cloud Messaging initialized');
    } catch (error) {
      console.warn('⚠ FCM not available:', error.message);
    }
  }

  static initializeCache() {
    try {
      const redis = require('redis');
      const client = redis.createClient({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379
      });

      client.on('error', (err) => {
        console.warn('⚠ Redis connection error:', err.message);
      });

      client.on('connect', () => {
        console.log('✓ Redis cache connected');
      });

      global.redisClient = client;
    } catch (error) {
      console.warn('⚠ Redis not available, using in-memory cache');
    }
  }
}

// ─────────────────────────────────────────────────────────
// 5. EXAMPLE SERVER.JS INTEGRATION
// ─────────────────────────────────────────────────────────

const exampleServerIntegration = `
const express = require('express');
const app = express();

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Initialize Nomadia Features
const { NomadiaIntegration } = require('./config/nomadia-integration');
NomadiaIntegration.initializeServices(app);

// Import routes
const nomadiaRoutes = require('./routes-nomadia');

// Mount API routes
app.use('/api', nomadiaRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(\`Server running on http://localhost:\${PORT}\`);
});
`;

// ─────────────────────────────────────────────────────────
// 6. UTILITY FUNCTIONS
// ─────────────────────────────────────────────────────────

/**
 * Generate sample/test data for development
 */
function generateTestData() {
  return {
    shipments: [
      {
        id: 'SHP001',
        trackingNumber: 'TRK-2024-001',
        vendor: 'TechWorld',
        receiver: 'John Doe',
        from: 'Warehouse, Mumbai',
        to: '123 Marine Drive, Mumbai',
        status: 'in-transit',
        latitude: 19.0596,
        longitude: 72.8295,
        distance: 12.5,
        cost: 450,
        revenue: 500
      },
      {
        id: 'SHP002',
        trackingNumber: 'TRK-2024-002',
        vendor: 'FashionHub',
        receiver: 'Jane Smith',
        from: 'Warehouse, Mumbai',
        to: '456 Lakeside Avenue, Mumbai',
        status: 'out-for-delivery',
        latitude: 19.0176,
        longitude: 72.8194,
        distance: 8.2,
        cost: 350,
        revenue: 400
      }
    ],
    drivers: [
      {
        id: 'DRV001',
        name: 'Raj Kumar',
        phone: '+919876543210',
        email: 'raj.kumar@freightflow.in',
        status: 'online',
        latitude: 19.0596,
        longitude: 72.8295,
        territory: 'TER001'
      },
      {
        id: 'DRV002',
        name: 'Priya Singh',
        phone: '+919876543211',
        email: 'priya.singh@freightflow.in',
        status: 'on-delivery',
        latitude: 19.0176,
        longitude: 72.8194,
        territory: 'TER002'
      }
    ],
    territories: [
      {
        id: 'TER001',
        name: 'North Mumbai',
        areas: ['Dadshar', 'Borivali', 'Andheri'],
        postalCodes: ['400058', '400049', '400050'],
        assignedDriver: 'DRV001',
        capacity: 50
      },
      {
        id: 'TER002',
        name: 'South Mumbai',
        areas: ['Colaba', 'Fort', 'BKC'],
        postalCodes: ['400001', '400002', '400051'],
        assignedDriver: 'DRV002',
        capacity: 50
      },
      {
        id: 'TER003',
        name: 'East Mumbai',
        areas: ['Thane', 'Navi Mumbai', 'Kalyan'],
        postalCodes: ['400601', '400600', '421301'],
        assignedDriver: null,
        capacity: 50
      }
    ]
  };
}

// ─────────────────────────────────────────────────────────
// 7. EXPORTS
// ─────────────────────────────────────────────────────────

module.exports = {
  NomadiaIntegration,
  generateTestData,
  exampleEnvConfig,
  migrationScript,
  exampleServerIntegration
};

/**
 * SETUP CHECKLIST:
 * 
 * 1. ✅ Install all NPM packages listed above
 * 2. ✅ Copy exampleEnvConfig to .env file
 * 3. ✅ Run database migrations in MongoDB
 * 4. ✅ Create uploads directory: mkdir -p uploads
 * 5. ✅ Setup AWS S3 credentials (optional)
 * ✅ Initialize NomadiaIntegration in server.js
 * ✅ Test all endpoints with Postman or curl
 * ✅ Load test data using generateTestData()
 * ✅ Setup Firebase Cloud Messaging (optional)
 * ✅ Configure Redis for caching (optional)
 * ✅ Deploy and monitor
 */
