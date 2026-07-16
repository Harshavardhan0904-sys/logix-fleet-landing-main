// ============================================================================
// RATE_CARD_ROUTES.js - API Endpoints for Rate Card Feature (Phase 2)
// ============================================================================
// Place this in: backend/routes/rateCardRoutes.js
// In server.js, add: const rateCardRoutes = require('./routes/rateCardRoutes');
//                     app.use('/api/rate-cards', rateCardRoutes);

const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');

let RateCard, RateTableEntry, Quote, RateCardVersion;

// Try to load models, handle if MongoDB is not connected
try {
  const models = require('../models/rateCardModels');
  RateCard = models.RateCard;
  RateTableEntry = models.RateTableEntry;
  Quote = models.Quote;
  RateCardVersion = models.RateCardVersion;
} catch (err) {
  console.warn('⚠️ Rate card models not available yet, will be initialized later');
}

// Function to initialize models after they're created (for memory mode)
router.initializeModels = function(models) {
  RateCard = models.RateCard;
  RateTableEntry = models.RateTableEntry;
  Quote = models.Quote;
  RateCardVersion = models.RateCardVersion;
  console.log('✅ Rate card models initialized in rate card routes');
};

// ============================================================================
// HEALTH CHECK
// ============================================================================
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    models_initialized: !!RateCard,
    timestamp: new Date().toISOString()
  });
});

// ============================================================================
// PART 1: RATE CARD MANAGEMENT ENDPOINTS
// ============================================================================

/**
 * GET /api/rate-cards
 * Get all rate cards for the user's company
 */
router.get('/', async (req, res) => {
  try {
    console.log('📥 GET /api/rate-cards - Request received');
    console.log('   req.user:', req.user ? { id: req.user.id, company_id: req.user.company_id } : 'undefined');
    
    // Check if RateCard model is initialized
    if (!RateCard) {
      console.warn('⚠️ RateCard model not initialized, returning empty array');
      return res.json({ 
        success: true, 
        data: [],
        warning: 'Models not yet initialized'
      });
    }
    
    // Get company_id from authenticated user or use demo company
    const company_id = req.user?.company_id || req.user?.id || 'demo-company-001';
    console.log('   company_id resolved to:', company_id);
    
    const cards = await RateCard.find({ company_id })
      .sort({ created_at: -1 })
      .lean();
    
    console.log(`✅ Retrieved ${cards.length} rate cards for company ${company_id}`);
    res.json({ success: true, data: cards || [] });
  } catch (error) {
    console.error('❌ Error in GET /api/rate-cards:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Return meaningful error instead of 500
    if (error.name === 'MongooseError' || error.name === 'MongoServerError') {
      return res.status(503).json({ 
        error: 'Database connection issue', 
        message: 'Please try again later',
        type: error.name 
      });
    }
    
    res.status(500).json({ error: error.message, type: error.name });
  }
});

/**
 * POST /api/rate-cards
 * Create a new rate card
 */
router.post('/', async (req, res) => {
  try {
    // Check if RateCard model is initialized
    if (!RateCard) {
      console.warn('⚠️ RateCard model not initialized for POST');
      return res.status(503).json({ 
        error: 'Service not yet ready', 
        message: 'Rate card service is initializing. Please try again in a moment.'
      });
    }
    
    const company_id = req.user?.company_id || req.user?.id || 'demo-company-001';
    const { name, description, is_default } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Rate card name is required' });
    }
    
    const newCard = new RateCard({
      company_id,
      name,
      description,
      is_default,
      created_by: req.user?.id || 'demo-user-001',
      status: 'draft'
    });
    
    await newCard.save();
    
    console.log(`✅ Rate card created: ${newCard.card_id} for company ${company_id}`);
    res.status(201).json({ success: true, data: newCard });
  } catch (error) {
    console.error('❌ Error creating rate card:', error);
    
    if (error.name === 'MongooseError' || error.name === 'MongoServerError') {
      return res.status(503).json({ 
        error: 'Database connection issue', 
        message: 'Please try again later'
      });
    }
    
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/rate-cards/:cardId
 * Get single rate card with all entries
 */
router.get('/:cardId', async (req, res) => {
  try {
    const { cardId } = req.params;
    const company_id = req.user?.company_id || req.user?.id || 'demo-company-001';
    
    const card = await RateCard.findOne({ card_id: cardId, company_id }).lean();
    if (!card) {
      return res.status(404).json({ error: 'Rate card not found' });
    }
    
    const entries = await RateTableEntry.find({ card_id: cardId, company_id })
      .sort({ created_at: -1 })
      .lean();
    
    console.log(`✅ Retrieved rate card ${cardId} with ${entries.length} entries`);
    res.json({ success: true, data: { ...card, entries } });
  } catch (error) {
    console.error('❌ Error fetching rate card:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/rate-cards/:cardId
 * Update rate card (name, status, description)
 */
router.put('/:cardId', async (req, res) => {
  try {
    const { cardId } = req.params;
    const company_id = req.user?.company_id || req.user?.id || 'demo-company-001';
    const { name, description, status, is_default } = req.body;
    
    const updated = await RateCard.findOneAndUpdate(
      { card_id: cardId, company_id },
      { 
        name, 
        description, 
        status,
        is_default,
        updated_at: new Date(),
        updated_by: req.user?.id || 'demo-user-001'
      },
      { new: true }
    );
    
    if (!updated) {
      return res.status(404).json({ error: 'Rate card not found' });
    }
    
    console.log(`✅ Rate card updated: ${cardId}`);
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('❌ Error updating rate card:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/rate-cards/:cardId
 * Archive (soft delete) rate card
 */
router.delete('/:cardId', async (req, res) => {
  try {
    const { cardId } = req.params;
    const company_id = req.user?.company_id || req.user?.id || 'demo-company-001';
    
    const archived = await RateCard.findOneAndUpdate(
      { card_id: cardId, company_id },
      { status: 'archived', updated_at: new Date() },
      { new: true }
    );
    
    if (!archived) {
      return res.status(404).json({ error: 'Rate card not found' });
    }
    
    console.log(`✅ Rate card archived: ${cardId}`);
    res.json({ success: true, message: 'Rate card archived', data: archived });
  } catch (error) {
    console.error('❌ Error archiving rate card:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// PART 2: RATE TABLE ENTRY MANAGEMENT
// ============================================================================

/**
 * POST /api/rate-cards/:cardId/entries
 * Add rate entries (bulk)
 * Body: { entries: [ { origin, destination, transport_mode, ... }, ... ] }
 */
router.post('/:cardId/entries', async (req, res) => {
  try {
    const { cardId } = req.params;
    const company_id = req.user?.company_id || req.user?.id || 'demo-company-001';
    const { entries } = req.body;
    
    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ error: 'Entries array is required' });
    }
    
    // Verify card exists
    const card = await RateCard.findOne({ card_id: cardId, company_id });
    if (!card) {
      return res.status(404).json({ error: 'Rate card not found' });
    }
    
    // Insert entries
    const entriesWithMetadata = entries.map(entry => ({
      ...entry,
      card_id: cardId,
      company_id,
      created_by: req.user.id,
      created_at: new Date()
    }));
    
    const inserted = await RateTableEntry.insertMany(entriesWithMetadata);
    
    console.log(`✅ Added ${inserted.length} rate entries to card ${cardId}`);
    res.status(201).json({ success: true, count: inserted.length, data: inserted });
  } catch (error) {
    console.error('❌ Error adding rate entries:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/rate-cards/:cardId/entries/:entryId
 * Update single rate entry
 */
router.put('/:cardId/entries/:entryId', async (req, res) => {
  try {
    const { cardId, entryId } = req.params;
    const company_id = req.user?.company_id || req.user?.id || 'demo-company-001';
    
    const updated = await RateTableEntry.findOneAndUpdate(
      { entry_id: entryId, card_id: cardId, company_id },
      { ...req.body, updated_at: new Date(), updated_by: req.user?.id || 'demo-user-001' },
      { new: true }
    );
    
    if (!updated) {
      return res.status(404).json({ error: 'Rate entry not found' });
    }
    
    console.log(`✅ Rate entry updated: ${entryId}`);
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('❌ Error updating rate entry:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/rate-cards/:cardId/entries/:entryId
 * Delete single rate entry
 */
router.delete('/:cardId/entries/:entryId', async (req, res) => {
  try {
    const { cardId, entryId } = req.params;
    const company_id = req.user?.company_id || req.user?.id || 'demo-company-001';
    
    const deleted = await RateTableEntry.findOneAndDelete(
      { entry_id: entryId, card_id: cardId, company_id }
    );
    
    if (!deleted) {
      return res.status(404).json({ error: 'Rate entry not found' });
    }
    
    console.log(`✅ Rate entry deleted: ${entryId}`);
    res.json({ success: true, message: 'Rate entry deleted' });
  } catch (error) {
    console.error('❌ Error deleting rate entry:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// PART 3: QUOTE GENERATION & CALCULATION
// ============================================================================

/**
 * POST /api/rate-cards/quotes/generate
 * Calculate quote using rate card
 * 
 * Body: {
 *   card_id: "CARD-xxx",
 *   origin: "Mumbai",
 *   destination: "Delhi",
 *   weight: 2000,
 *   transport_mode: "road",
 *   commodity_type: "General",
 *   urgency: "standard" (or "express")
 * }
 */
router.post('/quotes/generate', async (req, res) => {
  try {
    const company_id = req.user?.company_id || req.user?.id || 'demo-company-001';
    const { card_id, origin, destination, weight, transport_mode, commodity_type, urgency } = req.body;
    
    if (!card_id || !origin || !destination || !weight) {
      return res.status(400).json({ error: 'Missing required fields: card_id, origin, destination, weight' });
    }
    
    // Find matching rate entry
    const rateEntry = await RateTableEntry.findOne({
      card_id,
      company_id,
      origin: { $regex: `^${origin}`, $options: 'i' },
      destination: { $regex: `^${destination}`, $options: 'i' },
      transport_mode,
      commodity_type: commodity_type || 'General',
      min_weight: { $lte: weight },
      max_weight: { $gte: weight },
      active: true
    }).lean();
    
    if (!rateEntry) {
      return res.status(404).json({ error: 'No matching rate found for this shipment' });
    }
    
    // Calculate quote
    const baseRate = rateEntry.base_rate;
    const weightCharge = (weight * rateEntry.rate_per_kg) || 0;
    const subtotal = baseRate + weightCharge;
    
    // Apply urgency surcharge if "express"
    const urgencySurcharge = urgency === 'express' ? rateEntry.urgency_surcharge : 1.0;
    const subtotalWithUrgency = subtotal * urgencySurcharge;
    
    // Calculate GST
    const gstAmount = (subtotalWithUrgency * rateEntry.gst_percentage) / 100;
    const totalQuoted = subtotalWithUrgency + gstAmount;
    
    // Create quote record for analytics
    const quote = new Quote({
      company_id,
      card_id,
      shipment_details: {
        origin,
        destination,
        weight,
        transport_mode,
        commodity: commodity_type
      },
      quote_breakdown: {
        base_rate: baseRate,
        weight_charge: weightCharge,
        subtotal,
        gst_amount: gstAmount,
        urgency_surcharge: urgencySurcharge,
        total_quoted: totalQuoted
      },
      created_by: req.user.id
    });
    
    await quote.save();
    
    console.log(`✅ Quote generated: ${quote.quote_id} for ${origin}-${destination}, ₹${totalQuoted}`);
    
    res.json({
      success: true,
      quote_id: quote.quote_id,
      quote_breakdown: {
        base_rate: baseRate,
        weight_charge: weightCharge,
        subtotal,
        gst_percentage: rateEntry.gst_percentage,
        gst_amount: gstAmount,
        urgency_surcharge: urgencySurcharge,
        total_quoted: totalQuoted
      }
    });
  } catch (error) {
    console.error('❌ Error generating quote:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/rate-cards/quotes/analytics
 * Get quote analytics: conversion rates, most quoted routes, profitability
 */
router.get('/quotes/analytics', async (req, res) => {
  try {
    const company_id = req.user?.company_id || req.user?.id || 'demo-company-001';
    
    const totalQuotes = await Quote.countDocuments({ company_id });
    const acceptedQuotes = await Quote.countDocuments({ company_id, accepted: true });
    const convertedShipments = await Quote.countDocuments({ company_id, converted_to_shipment: true });
    
    const acceptanceRate = totalQuotes ? (acceptedQuotes / totalQuotes * 100).toFixed(2) : 0;
    const conversionRate = acceptedQuotes ? (convertedShipments / acceptedQuotes * 100).toFixed(2) : 0;
    
    // Most quoted routes
    const mostQuotedRoutes = await Quote.aggregate([
      { $match: { company_id } },
      { $group: { _id: "$shipment_details.origin-$shipment_details.destination", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    console.log(`✅ Analytics retrieved for company ${company_id}`);
    
    res.json({
      success: true,
      analytics: {
        total_quotes: totalQuotes,
        accepted_quotes: acceptedQuotes,
        converted_shipments: convertedShipments,
        acceptance_rate: `${acceptanceRate}%`,
        conversion_rate: `${conversionRate}%`,
        most_quoted_routes: mostQuotedRoutes
      }
    });
  } catch (error) {
    console.error('❌ Error fetching analytics:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// PART 4: IMPORT/EXPORT
// ============================================================================

/**
 * POST /api/rate-cards/:cardId/import
 * Bulk import rate entries from CSV
 * Expects file upload with CSV columns: origin, destination, mode, commodity, min_weight, max_weight, base_rate, rate_per_kg, gst_percentage
 */
router.post('/:cardId/import', async (req, res) => {
  // TODO: Implement CSV parsing and bulk insert
  res.json({ message: 'Import endpoint - to be implemented' });
});

/**
 * GET /api/rate-cards/:cardId/export
 * Export rate card as CSV
 */
router.get('/:cardId/export', async (req, res) => {
  // TODO: Implement CSV export
  res.json({ message: 'Export endpoint - to be implemented' });
});

module.exports = router;
