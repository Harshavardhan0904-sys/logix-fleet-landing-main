/**
 * Database Models/Schemas for Nomadia-Inspired Features
 * Add these fields to existing models and create new models
 * 
 * Usage: Import these models in server.js and use them with mongoose
 */

// ─────────────────────────────────────────────────────────
// 1. EXTEND SHIPMENT MODEL (Add these fields)
// ─────────────────────────────────────────────────────────
const ShipmentSchema = {
  // Existing fields...
  
  // GPS Tracking Fields
  location: String,        // e.g., "Bandra, Mumbai"
  latitude: Number,        // GPS coordinate
  longitude: Number,       // GPS coordinate
  speed: Number,          // Current speed in km/h
  eta: Date,              // Estimated time of arrival
  trackingStatus: {
    type: String,
    enum: ['pending', 'in-transit', 'out-for-delivery', 'delivered', 'delayed', 'failed'],
    default: 'pending'
  },
  lastLocationUpdate: Date,
  
  // Proof of Delivery Fields
  pod: {
    status: {
      type: String,
      enum: ['pending', 'submitted', 'verified'],
      default: 'pending'
    },
    submittedAt: Date,
    receiverName: String,
    receiverPhone: String,
    receiverEmail: String,
    photoUrl: String,        // S3 or local path
    signatureUrl: String,    // Binary signature data
    notes: String,           // Delivery notes/condition
    packageCondition: {
      type: String,
      enum: ['good', 'damaged', 'partial'],
      default: 'good'
    },
    paymentStatus: {
      type: String,
      enum: ['cash-on-delivery', 'prepaid', 'partial'],
      default: 'prepaid'
    },
    amountCollected: Number, // For COD shipments
    timestamp: Date,
    photoMetadata: {
      uploadedBy: String,     // Driver ID
      uploadedAt: Date,
      fileSize: Number,
      mimeType: String
    }
  },
  
  // Route & Optimization Fields
  routeId: String,         // Reference to Route document
  assignedRoute: {
    type: String,
    ref: 'Route'
  },
  originalDistance: Number, // km
  optimizedDistance: Number, // km after optimization
  distanceSaved: Number,    // km saved
  originalTime: Number,     // minutes
  optimizedTime: Number,    // minutes after optimization
  timeSaved: Number,        // minutes saved
  co2Emissions: Number,     // kg
  co2Reduced: Number,       // kg saved
  fuelCost: Number,         // Original cost
  optimizedFuelCost: Number, // After optimization
  fuelSaved: Number,        // Amount saved
  
  // Driver Assignment
  assignedDriver: {
    type: String,
    ref: 'Driver'
  },
  driverId: String,
  territory: {
    type: String,
    ref: 'Territory'
  }
};

// ─────────────────────────────────────────────────────────
// 2. NEW ROUTE MODEL (Route Optimization)
// ─────────────────────────────────────────────────────────
const RouteSchema = {
  id: { type: String, unique: true },
  name: String,              // e.g., "Daily Delhi-NCR Loop"
  type: {
    type: String,
    enum: ['single-delivery', 'multi-stop', 'round-trip', 'recurring'],
    default: 'multi-stop'
  },
  
  // Route Details
  origin: {
    address: String,
    latitude: Number,
    longitude: Number
  },
  
  stops: [{
    stopId: String,
    shipmentId: String,
    address: String,
    latitude: Number,
    longitude: Number,
    sequence: Number,        // Order in optimized route
    arrivalTime: Date,
    departureTime: Date
  }],
  
  // Optimization
  optimization: {
    priority: {
      type: String,
      enum: ['fastest', 'cheapest', 'eco-friendly', 'balanced'],
      default: 'balanced'
    },
    method: {
      type: String,
      enum: ['tsp', 'nearest-neighbor', 'genetic', 'ml-based'],
      default: 'nearest-neighbor'
    },
    constraints: {
      timeWindows: Boolean,
      vehicleCapacity: Number,
      avoidTolls: Boolean,
      avoidHighways: Boolean
    }
  },
  
  // Vehicle Info
  vehicleType: {
    type: String,
    enum: ['bike', 'car', 'van', 'truck', 'auto'],
    default: 'car'
  },
  vehicleCapacity: Number,    // kg or units
  
  // Metrics
  metrics: {
    totalDistance: Number,    // km
    totalTime: Number,        // minutes
    totalCost: Number,        // calculat ed fuel cost
    co2Emissions: Number,     // kg
    stopCount: Number,
    averageSpeed: Number
  },
  
  // Alternatives
  alternatives: [{
    routeId: String,
    distance: Number,
    time: Number,
    cost: Number,
    description: String,
    selected: Boolean
  }],
  
  // Traffic & Real-time
  trafficData: {
    congestionLevel: String, // low, medium, high
    updatedAt: Date,
    predictedDelay: Number    // minutes
  },
  
  // Status
  status: {
    type: String,
    enum: ['planning', 'optimized', 'assigned', 'in-progress', 'completed'],
    default: 'planning'
  },
  
  // Templates
  isTemplate: Boolean,       // Save as template for reuse
  templateName: String,
  createdAt: Date,
  updatedAt: Date,
  createdBy: String         // User ID
};

// ─────────────────────────────────────────────────────────
// 3. NEW DRIVER MODEL (Extended for Mobile App)
// ─────────────────────────────────────────────────────────
const DriverSchema = {
  id: { type: String, unique: true },
  name: String,
  email: String,
  phone: String,
  avatar: String,
  
  // Status & Location
  status: {
    type: String,
    enum: ['offline', 'online', 'idle', 'on-delivery', 'on-break'],
    default: 'offline'
  },
  currentLocation: {
    latitude: Number,
    longitude: Number,
    address: String,
    lastUpdateTime: Date
  },
  
  // Mobile App
  mobileApp: {
    version: String,        // e.g., "2.4.1"
    lastActiveAt: Date,
    deviceId: String,
    osType: String,         // iOS, Android, Web
    batteryLevel: Number,   // 0-100
    networkQuality: String, // excellent, good, fair, poor
    appHealth: {
      crashes: Number,
      errors: [String]
    }
  },
  
  // Assignment
  assignedTerritory: {
    type: String,
    ref: 'Territory'
  },
  activeTasks: [{
    shipmentId: String,
    status: String,
    priority: String
  }],
  
  // Performance Metrics
  performance: {
    totalDeliveries: Number,
    completedDeliveries: Number,
    failedDeliveries: Number,
    successRate: Number,    // percentage
    averageRating: Number,  // 1-5 stars
    averageDeliveryTime: Number, // minutes
    totalDistance: Number   // km
  },
  
  // Earnings & Incentives
  earnings: {
    baseSalary: Number,
    bonusEarned: Number,
    incentiveEarned: Number,
    totalEarnings: Number,
    paymentStatus: String,  // paid, pending
    lastPaymentDate: Date
  },
  
  // Compliance
  documents: {
    licenseNumber: String,
    licenseExpiry: Date,
    insuranceNumber: String,
    insuranceExpiry: Date,
    backgroundCheckStatus: String
  },
  
  // Preferences
  preferences: {
    workingHours: {
      startTime: String,
      endTime: String
    },
    taskPreferences: [String], // Task types they prefer
    language: String,
    notificationSettings: Object
  },
  
  createdAt: Date,
  updatedAt: Date
};

// ─────────────────────────────────────────────────────────
// 4. NEW TERRITORY MODEL (Zone Management)
// ─────────────────────────────────────────────────────────
const TerritorySchema = {
  id: { type: String, unique: true },
  name: String,              // e.g., "North Delhi Zone"
  description: String,
  
  // Geographic Boundaries
  boundaries: {
    type: {
      type: String,
      enum: ['Polygon'],
      default: 'Polygon'
    },
    coordinates: [[[Number]]] // GeoJSON format: [[[lat, lng], ...]]
  },
  
  // Areas & Postal Codes
  areas: [String],          // Locality names
  postalCodes: [String],    // PIN codes or postal codes
  
  // Assignment
  assignedDriver: {
    type: String,
    ref: 'Driver'
  },
  previousAssignments: [{
    driverId: String,
    assignedFrom: Date,
    assignedTo: Date
  }],
  
  // Workload
  workload: {
    expectedDailyDeliveries: Number,
    currentDeliveries: Number,
    utilizationPercentage: Number,  // 0-100
    capacity: Number                // Max deliveries possible
  },
  
  // Metrics
  metrics: {
    totalDeliveries: Number,
    successRate: Number,
    averageDeliveryTime: Number,
    averageCostPerDelivery: Number
  },
  
  // Status & Optimization
  status: {
    type: String,
    enum: ['active', 'under-assignment', 'optimizing', 'inactive'],
    default: 'active'
  },
  optimizationNotes: String, // Suggestions for rebalancing
  
  createdAt: Date,
  updatedAt: Date
};

// ─────────────────────────────────────────────────────────
// 5. NEW ANALYTICS MODEL (Delivery Analytics)
// ─────────────────────────────────────────────────────────
const AnalyticsSchema = {
  id: { type: String, unique: true },
  date: Date,                // Daily analytics
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    default: 'daily'
  },
  
  // KPIs
  kpis: {
    totalDeliveries: Number,
    successfulDeliveries: Number,
    failedDeliveries: Number,
    pendingDeliveries: Number,
    successRate: Number,     // percentage
    averageDeliveryTime: Number, // minutes
    averageCostPerDelivery: Number,
    totalRevenue: Number,
    totalCost: Number,
    profit: Number,
    co2EmissionsSaved: Number,
    fuelSaved: Number
  },
  
  // Breakdown by Status
  statusBreakdown: {
    inTransit: Number,
    outForDelivery: Number,
    delivered: Number,
    delayed: Number,
    failed: Number
  },
  
  // Breakdown by Vendor
  vendorPerformance: [{
    vendorId: String,
    vendorName: String,
    deliveries: Number,
    successRate: Number,
    averageTime: Number,
    avgRating: Number
  }],
  
  // Breakdown by Territory
  territoryPerformance: [{
    territoryId: String,
    territoryName: String,
    deliveries: Number,
    successRate: Number,
    utilizationPercentage: Number
  }],
  
  // Breakdown by Driver
  driverPerformance: [{
    driverId: String,
    driverName: String,
    deliveries: Number,
    successRate: Number,
    averageTime: Number,
    avgRating: Number
  }],
  
  // Cost Breakdown
  costBreakdown: {
    fuelCost: Number,
    driverSalary: Number,
    vehicleMaintenance: Number,
    miscellaneous: Number,
    totalCost: Number
  },
  
  // Trends
  trends: {
    previousPeriodComparison: {
      deliveryChange: Number,     // percentage
      costChange: Number,
      revenueChange: Number
    },
    hourlyBreakdown: [{
      hour: Number,
      deliveries: Number,
      cost: Number
    }]
  },
  
  // Date Range Metrics
  metrics: {
    startDate: Date,
    endDate: Date,
    dataPoints: Number        // Number of shipments analyzed
  }
};

// ─────────────────────────────────────────────────────────
// 6. PROOF OF DELIVERY - DETAILED SCHEMA
// ─────────────────────────────────────────────────────────
const ProofOfDeliverySchema = {
  id: { type: String, unique: true },
  shipmentId: {
    type: String,
    ref: 'Shipment',
    unique: true
  },
  
  // Submission Details
  submittedBy: {
    driverId: String,
    driverName: String,
    timestamp: Date
  },
  
  // Location Verification
  location: {
    latitude: Number,
    longitude: Number,
    address: String,
    accuracy: Number,       // meters
    gpsStatus: String       // verified, approximate
  },
  
  // Photo Evidence
  photo: {
    url: String,           // S3 or local path
    s3Key: String,
    fileSize: Number,
    mimeType: String,
    uploadedAt: Date,
    verified: Boolean
  },
  
  // Signature
  signature: {
    dataUrl: String,       // SVG or image data
    signedBy: String,      // Receiver name
    signedAt: Date,
    verified: Boolean
  },
  
  // Receiver Information
  receiver: {
    name: String,
    phone: String,
    email: String,
    notes: String          // Any special instructions
  },
  
  // Package Condition
  packageCondition: {
    status: {
      type: String,
      enum: ['good', 'damaged', 'tampered', 'partial'],
      default: 'good'
    },
    damageDescription: String,
    photosOfDamage: [String]
  },
  
  // Payment Collection
  payment: {
    method: String,        // cash, card, upi, prepaid
    amountRequired: Number,
    amountCollected: Number,
    changeGiven: Number,
    paymentProofUrl: String
  },
  
  // Status & Verification
  status: {
    type: String,
    enum: ['submitted', 'verified', 'disputed', 'resolved'],
    default: 'submitted'
  },
  verifiedBy: String,      // Admin/Manager who verified
  verifiedAt: Date,
  
  // Audit Trail
  auditTrail: [{
    action: String,
    timestamp: Date,
    performedBy: String,
    details: String
  }],
  
  createdAt: Date,
  updatedAt: Date
};

// ─────────────────────────────────────────────────────────
// 7. MODULE EXPORTS
// ─────────────────────────────────────────────────────────
module.exports = {
  ShipmentSchema,
  RouteSchema,
  DriverSchema,
  TerritorySchema,
  AnalyticsSchema,
  ProofOfDeliverySchema
};

/**
 * Implementation Instructions:
 * 
 * 1. In your server.js or models file, add these to existing schemas:
 * 
 *    const mongoose = require('mongoose');
 *    const { ShipmentSchema, RouteSchema, DriverSchema, TerritorySchema, AnalyticsSchema, ProofOfDeliverySchema } = require('./models');
 * 
 * 2. Create new models:
 * 
 *    const Route = mongoose.model('Route', RouteSchema);
 *    const Territory = mongoose.model('Territory', TerritorySchema);
 *    const Analytics = mongoose.model('Analytics', AnalyticsSchema);
 *    const ProofOfDelivery = mongoose.model('ProofOfDelivery', ProofOfDeliverySchema);
 * 
 * 3. Run migration to add fields to existing Shipment collection:
 * 
 *    db.shipments.updateMany({}, {
 *      $set: {
 *        location: null,
 *        latitude: null,
 *        longitude: null,
 *        speed: null,
 *        eta: null,
 *        trackingStatus: 'pending',
 *        pod: {},
 *        routeId: null
 *      }
 *    })
 */
