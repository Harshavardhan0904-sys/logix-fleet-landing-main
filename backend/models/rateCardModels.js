// ============================================================================
// RATE_CARD_MODELS.js - MongoDB Schemas for Rate Card Feature (Phase 2)
// ============================================================================
// Place this in: backend/models/

const mongoose = require('mongoose');

// ============================================================================
// 1. RATE CARD COLLECTION
// ============================================================================
const rateCardSchema = new mongoose.Schema(
  {
    card_id: {
      type: String,
      unique: true,
      default: () => `CARD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    },
    
    company_id: {
      type: String,
      required: true,
      index: true
    },
    
    name: {
      type: String,
      required: true,
      example: "Mumbai-Delhi Route Card"
    },
    
    description: {
      type: String,
      example: "Standard rates for North India corridor"
    },
    
    status: {
      type: String,
      enum: ["draft", "active", "archived"],
      default: "draft"
    },
    
    is_default: {
      type: Boolean,
      default: false
    },
    
    created_by: {
      type: String,
      required: true  // user_id
    },
    
    created_at: {
      type: Date,
      default: Date.now
    },
    
    updated_at: {
      type: Date,
      default: Date.now
    },
    
    updated_by: String,
    
    version: {
      type: Number,
      default: 1
    },
    
    tags: [String],  // e.g., ["seasonal", "express", "economy"]
    
    notes: String
  },
  { collection: 'ff_rate_cards' }
);

// ============================================================================
// 2. RATE TABLE ENTRIES COLLECTION
// ============================================================================
const rateTableEntrySchema = new mongoose.Schema(
  {
    entry_id: {
      type: String,
      unique: true,
      default: () => `ENTRY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    },
    
    card_id: {
      type: String,
      required: true,
      index: true
    },
    
    company_id: {
      type: String,
      required: true,
      index: true
    },
    
    // Route Information
    origin: {
      type: String,
      required: true,
      example: "Mumbai"
    },
    
    destination: {
      type: String,
      required: true,
      example: "Delhi"
    },
    
    // Shipment Details
    transport_mode: {
      type: String,
      enum: ["road", "rail", "air", "sea"],
      required: true
    },
    
    commodity_type: {
      type: String,
      example: "General",
      enum: ["General", "Electronics", "FMCG", "Pharma", "Hazmat", "Perishable", "Other"]
    },
    
    // Weight Range
    min_weight: {
      type: Number,
      example: 100,
      default: 0
    },
    
    max_weight: {
      type: Number,
      example: 5000
    },
    
    // Pricing Structure
    base_rate: {
      type: Number,
      required: true,
      example: 5000,
      description: "Base rate per shipment"
    },
    
    rate_per_kg: {
      type: Number,
      example: 2.5,
      description: "Additional rate per kg"
    },
    
    rate_per_km: {
      type: Number,
      example: 20,
      description: "Additional rate per km (if distance-based)"
    },
    
    // GST Configuration
    gst_percentage: {
      type: Number,
      default: 18,
      example: 18
    },
    
    // Urgency/Surcharge
    urgency_surcharge: {
      type: Number,
      default: 1.0,
      example: 1.1,
      description: "1.0 = standard, 1.1 = 10% premium for express"
    },
    
    // Status
    active: {
      type: Boolean,
      default: true
    },
    
    min_shipments_per_month: Number,
    volume_discount_percentage: Number,
    
    // Timestamps
    created_at: {
      type: Date,
      default: Date.now
    },
    
    updated_at: {
      type: Date,
      default: Date.now
    },
    
    effective_from: {
      type: Date,
      default: Date.now
    },
    
    effective_till: Date,
    
    // Audit
    created_by: String,
    updated_by: String
  },
  { collection: 'ff_rate_table_entries' }
);

// ============================================================================
// 3. QUOTES COLLECTION (for analytics & tracking)
// ============================================================================
const quoteSchema = new mongoose.Schema(
  {
    quote_id: {
      type: String,
      unique: true,
      default: () => `QUOTE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    },
    
    company_id: {
      type: String,
      required: true,
      index: true
    },
    
    card_id: {
      type: String,
      required: true,
      index: true
    },
    
    shipment_details: {
      shipper_name: String,
      shipper_id: String,
      receiver_name: String,
      origin: String,
      destination: String,
      weight: Number,
      volume: Number,
      commodity: String,
      transport_mode: String
    },
    
    quote_breakdown: {
      base_rate: Number,
      weight_charge: Number,
      km_charge: Number,
      subtotal: Number,
      gst_amount: Number,
      urgency_surcharge: Number,
      total_quoted: Number
    },
    
    status: {
      type: String,
      enum: ["quoted", "accepted", "rejected", "converted_to_shipment"],
      default: "quoted"
    },
    
    accepted: Boolean,
    converted_to_shipment: Boolean,
    shipment_id: String,  // If quote converted to actual shipment
    
    created_at: {
      type: Date,
      default: Date.now,
      index: true
    },
    
    accepted_at: Date,
    
    created_by: String
  },
  { collection: 'ff_quotes' }
);

// ============================================================================
// 4. RATE CARD VERSIONS (for versioning/history)
// ============================================================================
const rateCardVersionSchema = new mongoose.Schema(
  {
    version_id: {
      type: String,
      unique: true,
      default: () => `VER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    },
    
    card_id: {
      type: String,
      required: true,
      index: true
    },
    
    company_id: String,
    version_number: Number,
    
    rate_table_snapshot: [],  // Store entire rate table at this version
    
    changes: {
      type: String,
      example: "Added 5 new routes, updated base rates for Mumbai-Delhi"
    },
    
    created_by: String,
    created_at: {
      type: Date,
      default: Date.now
    }
  },
  { collection: 'ff_rate_card_versions' }
);

// Export models
module.exports = {
  RateCard: mongoose.model('RateCard', rateCardSchema),
  RateTableEntry: mongoose.model('RateTableEntry', rateTableEntrySchema),
  Quote: mongoose.model('Quote', quoteSchema),
  RateCardVersion: mongoose.model('RateCardVersion', rateCardVersionSchema)
};
