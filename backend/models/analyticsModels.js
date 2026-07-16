const mongoose = require('mongoose');

// Cost Analytics Schema
const costAnalyticsSchema = new mongoose.Schema({
  shipmentId: { type: String, required: true, unique: true },
  clientId: String,
  routeId: String,
  costBreakdown: {
    baseCost: Number,
    fuelCost: Number,
    tolls: Number,
    permits: Number,
    laborCost: Number,
    warehousingCost: Number,
    insuranceCost: Number,
    overheadAllocation: Number,
    totalCost: Number
  },
  revenue: Number,
  profitMargin: Number,
  costPerKg: Number,
  costPerKm: Number,
  costPerDay: Number,
  efficiency: {
    weightPerDay: Number,
    volumePerDay: Number,
    revenuePerKg: Number,
    revenuePerKm: Number
  },
  comparativeAnalysis: {
    industryAverage: Number,
    clientAverage: Number,
    variance: Number,
    optimization: String
  },
  historicalTrend: [{
    date: Date,
    cost: Number,
    revenue: Number,
    efficiency: Number
  }],
  createdAt: { type: Date, default: Date.now }
});

// Compliance Tracking Schema
const complianceSchema = new mongoose.Schema({
  shipmentId: String,
  driverId: String,
  clientId: String,
  complianceChecks: {
    documentationComplete: { status: Boolean, lastChecked: Date },
    licenseValid: { status: Boolean, expiryDate: Date },
    insuranceValid: { status: Boolean, expiryDate: Date },
    certifications: [{ name: String, status: Boolean, expiryDate: Date }],
    vehicleInspection: { status: Boolean, lastInspected: Date },
    gstCompliance: { status: Boolean, lastVerified: Date },
    hazmatCertification: { status: Boolean, expiryDate: Date }
  },
  documents: [{
    type: String, // invoice, bill, receipt, pod, inspection
    fileName: String,
    uploadDate: Date,
    verified: Boolean,
    verifiedBy: String
  }],
  issues: [{
    type: String,
    severity: { type: String, enum: ['critical', 'warning', 'info'], default: 'info' },
    description: String,
    raisedDate: Date,
    resolvedDate: Date,
    status: { type: String, enum: ['open', 'in-progress', 'resolved'], default: 'open' }
  }],
  complianceScore: { type: Number, min: 0, max: 100 },
  auditTrail: [{
    action: String,
    performedBy: String,
    timestamp: Date,
    details: String
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = {
  CostAnalytics: mongoose.model('CostAnalytics', costAnalyticsSchema),
  Compliance: mongoose.model('Compliance', complianceSchema)
};
