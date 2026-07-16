const mongoose = require('mongoose');

// Multi-Modal Routes Schema (Road/Rail/Air/Sea)
const multiModalRouteSchema = new mongoose.Schema({
  routeName: { type: String, required: true },
  shipmentId: String,
  clientId: String,
  origin: {
    location: String,
    latitude: Number,
    longitude: Number,
    pincode: String
  },
  destination: {
    location: String,
    latitude: Number,
    longitude: Number,
    pincode: String
  },
  segments: [{
    segmentId: String,
    mode: { type: String, enum: ['ROAD', 'RAIL', 'AIR', 'SEA'], required: true },
    provider: String,
    startPoint: String,
    endPoint: String,
    distance: Number, // in km
    estimatedDuration: Number, // in hours
    cost: Number,
    capacity: { weight: Number, volume: Number },
    schedule: {
      departureTime: Date,
      arrivalTime: Date,
      frequency: String // daily, weekly, etc.
    },
    constraints: {
      temperatureControl: Boolean,
      humid: Boolean,
      fragile: Boolean,
      hazmat: Boolean
    },
    status: { type: String, enum: ['scheduled', 'in-transit', 'delayed', 'completed'], default: 'scheduled' },
    tracking: {
      currentLocation: { lat: Number, lng: Number },
      lastUpdated: Date,
      eta: Date
    }
  }],
  totalCost: Number,
  totalDuration: Number,
  carbonFootprint: Number, // kg CO2
  costOptimization: {
    recommended: Number,
    actualUsed: Number,
    savings: Number,
    percentageSaved: Number
  },
  riskAssessment: {
    weatherRisk: String,
    congestionRisk: String,
    deliveryRisk: String,
    mitigation: [String]
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Advanced Shipment Workflow Schema
const shipmentWorkflowSchema = new mongoose.Schema({
  shipmentId: { type: String, required: true, unique: true },
  clientId: String,
  workflowType: { type: String, enum: ['standard', 'fragile', 'hazmat', 'temperature-controlled', 'custom'], default: 'standard' },
  currentState: {
    state: { type: String, enum: ['created', 'approved', 'picked', 'packed', 'dispatched', 'in-transit', 'out-for-delivery', 'delivered', 'returned', 'cancelled'], default: 'created' },
    timestamp: Date,
    performer: String,
    notes: String
  },
  approvalChain: [{
    level: Number,
    approver: String,
    approverRole: String,
    approvalDate: Date,
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    comments: String,
    requiresAction: Boolean
  }],
  stateTransitions: [{
    fromState: String,
    toState: String,
    performedBy: String,
    timestamp: Date,
    reason: String,
    conditions: [String],
    autoApproved: Boolean
  }],
  customFields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  notifications: [{
    recipient: String,
    type: { type: String, enum: ['email', 'sms', 'whatsapp', 'in-app'], default: 'email' },
    event: String,
    sentAt: Date,
    status: { type: String, enum: ['sent', 'failed', 'pending'], default: 'pending' }
  }],
  conditionalActions: [{
    trigger: String, // state_changed, time_elapsed, condition_met
    condition: String,
    action: String,
    enabled: Boolean,
    lastTriggered: Date
  }],
  rules: [{
    name: String,
    condition: String,
    action: String,
    priority: Number
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = {
  MultiModalRoute: mongoose.model('MultiModalRoute', multiModalRouteSchema),
  ShipmentWorkflow: mongoose.model('ShipmentWorkflow', shipmentWorkflowSchema)
};
