const mongoose = require('mongoose');

// Dashboard Schema for Client-Level Business Intelligence
const dashboardSchema = new mongoose.Schema({
  clientId: { type: String, required: true, unique: true },
  clientName: String,
  totalShipments: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  totalCost: { type: Number, default: 0 },
  profitMargin: { type: Number, default: 0 },
  activeRoutes: { type: Number, default: 0 },
  fleetUtilization: { type: Number, default: 0 },
  onTimeDeliveryRate: { type: Number, default: 0 },
  averageDeliveryTime: { type: Number, default: 0 },
  complianceScore: { type: Number, default: 0 },
  kpis: [{
    name: String,
    value: Number,
    trend: { type: String, enum: ['up', 'down', 'stable'], default: 'stable' },
    target: Number
  }],
  monthlyMetrics: [{
    month: String,
    shipments: Number,
    revenue: Number,
    cost: Number,
    efficiency: Number
  }],
  recentShipments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Shipment', limit: 10 }],
  alerts: [{
    type: String,
    severity: { type: String, enum: ['critical', 'warning', 'info'], default: 'info' },
    message: String,
    timestamp: { type: Date, default: Date.now }
  }],
  lastUpdated: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

// Capacity Management Schema
const capacitySchema = new mongoose.Schema({
  shipmentId: { type: String, required: true },
  vehicleId: { type: String, required: true },
  vehicleType: { type: String, enum: ['LCV', 'HCV', 'TRUCK', 'CONTAINER'], required: true },
  totalCapacity: { type: Number, required: true }, // in kg or cbm
  utilizedCapacity: { type: Number, default: 0 },
  utilizationPercentage: { type: Number, default: 0 },
  itemsLoaded: [{
    itemId: String,
    weight: Number,
    volume: Number,
    category: String
  }],
  weightUtilization: { type: Number, default: 0 },
  volumeUtilization: { type: Number, default: 0 },
  costPerKg: { type: Number, default: 0 },
  costPerCbm: { type: Number, default: 0 },
  status: { type: String, enum: ['empty', 'loading', 'full', 'in-transit', 'delivered'], default: 'empty' },
  optimizationScore: { type: Number, default: 0 }, // 0-100
  recommendations: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = {
  Dashboard: mongoose.model('Dashboard', dashboardSchema),
  Capacity: mongoose.model('Capacity', capacitySchema)
};
