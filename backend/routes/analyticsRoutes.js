const express = require('express');
const router = express.Router();

let CostAnalytics, Compliance;

// Try to load models, handle if MongoDB is not connected
try {
  const models = require('../models/analyticsModels');
  CostAnalytics = models.CostAnalytics;
  Compliance = models.Compliance;
} catch (err) {
  console.warn('⚠️ Analytics models not available yet, will be initialized later');
}

// Function to initialize models after they're created (for memory mode)
router.initializeModels = function(models) {
  CostAnalytics = models.CostAnalytics;
  Compliance = models.Compliance;
  console.log('✅ Analytics models initialized');
};

const authenticateToken = (req, res, next) => {
  next();
};

// ═══════════════════════════════════════════════════════════
// COST ANALYTICS ENDPOINTS
// ═══════════════════════════════════════════════════════════

// Create Cost Analysis for Shipment
router.post('/cost', authenticateToken, async (req, res) => {
  try {
    if (!CostAnalytics) {
      console.warn('⚠️ CostAnalytics model not initialized');
      return res.status(503).json({ 
        error: 'Service not yet ready', 
        message: 'Analytics service is initializing. Please try again in a moment.'
      });
    }

    const {
      shipmentId, clientId, routeId, costBreakdown, revenue
    } = req.body;
    
    const totalCost = costBreakdown.totalCost || Object.values(costBreakdown).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0);
    const profitMargin = revenue ? ((revenue - totalCost) / revenue) * 100 : 0;
    
    const analytics = new CostAnalytics({
      shipmentId,
      clientId,
      routeId,
      costBreakdown: { ...costBreakdown, totalCost },
      revenue,
      profitMargin,
      createdAt: new Date()
    });
    
    await analytics.save();
    res.json({ message: 'Cost analysis saved', analytics });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Cost Analysis for Shipment
router.get('/cost/:shipmentId', authenticateToken, async (req, res) => {
  try {
    const { shipmentId } = req.params;
    const analytics = await CostAnalytics.findOne({ shipmentId });
    
    if (!analytics) {
      return res.status(404).json({ error: 'Cost analysis not found' });
    }
    
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Cost Analysis by Route
router.get('/cost/route/:routeId', authenticateToken, async (req, res) => {
  try {
    const { routeId } = req.params;
    const analytics = await CostAnalytics.find({ routeId });
    
    const summary = {
      shipmentCount: analytics.length,
      totalCost: analytics.reduce((sum, a) => sum + a.costBreakdown.totalCost, 0),
      totalRevenue: analytics.reduce((sum, a) => sum + a.revenue, 0),
      averageProfitMargin: analytics.reduce((sum, a) => sum + a.profitMargin, 0) / analytics.length || 0,
      breakdown: {}
    };
    
    // Aggregate cost breakdown
    analytics.forEach(a => {
      Object.keys(a.costBreakdown).forEach(key => {
        summary.breakdown[key] = (summary.breakdown[key] || 0) + (a.costBreakdown[key] || 0);
      });
    });
    
    res.json({ analytics, summary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Cost Analysis by Client
router.get('/cost/client/:clientId', authenticateToken, async (req, res) => {
  try {
    const { clientId } = req.params;
    const analytics = await CostAnalytics.find({ clientId }).sort({ createdAt: -1 }).limit(100);
    
    const summary = {
      shipmentCount: analytics.length,
      totalCost: analytics.reduce((sum, a) => sum + a.costBreakdown.totalCost, 0),
      totalRevenue: analytics.reduce((sum, a) => sum + a.revenue, 0),
      averageProfitMargin: analytics.reduce((sum, a) => sum + a.profitMargin, 0) / analytics.length || 0,
      costTrend: calculateTrend(analytics.map(a => ({ date: a.createdAt, cost: a.costBreakdown.totalCost })))
    };
    
    res.json({ analytics, summary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Comparative Analysis
router.get('/cost/:shipmentId/compare', authenticateToken, async (req, res) => {
  try {
    const { shipmentId } = req.params;
    const analytics = await CostAnalytics.findOne({ shipmentId });
    
    if (!analytics) {
      return res.status(404).json({ error: 'Analysis not found' });
    }
    
    // Get industry average (mock data)
    const industryAverage = 5000; // Per shipment
    const clientAverage = 4800;
    
    const comparison = {
      current: analytics.costBreakdown.totalCost,
      industryAverage,
      clientAverage,
      variance: analytics.costBreakdown.totalCost - clientAverage,
      percentageVariance: ((analytics.costBreakdown.totalCost - clientAverage) / clientAverage) * 100,
      optimization: analytics.costBreakdown.totalCost < clientAverage ? 'Better than average' : 'Above average'
    };
    
    res.json(comparison);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════
// COMPLIANCE TRACKING ENDPOINTS
// ═══════════════════════════════════════════════════════════

// Create Compliance Record
router.post('/compliance', authenticateToken, async (req, res) => {
  try {
    const { shipmentId, driverId, clientId, complianceChecks } = req.body;
    
    const compliance = new Compliance({
      shipmentId,
      driverId,
      clientId,
      complianceChecks
    });
    
    await compliance.save();
    res.json({ message: 'Compliance record created', compliance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Compliance Record
router.get('/compliance/:shipmentId', authenticateToken, async (req, res) => {
  try {
    const { shipmentId } = req.params;
    const compliance = await Compliance.findOne({ shipmentId });
    
    if (!compliance) {
      return res.status(404).json({ error: 'Compliance record not found' });
    }
    
    res.json(compliance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Compliance Check Status
router.put('/compliance/:shipmentId/checks', authenticateToken, async (req, res) => {
  try {
    const { shipmentId } = req.params;
    const { checkType, status, expiryDate } = req.body;
    
    const compliance = await Compliance.findOneAndUpdate(
      { shipmentId },
      {
        $set: {
          [`complianceChecks.${checkType}.status`]: status,
          [`complianceChecks.${checkType}.lastChecked`]: new Date(),
          ...(expiryDate && { [`complianceChecks.${checkType}.expiryDate`]: expiryDate }),
          updatedAt: new Date()
        }
      },
      { new: true }
    );
    
    res.json({ message: 'Compliance check updated', compliance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add Issue to Compliance Record
router.post('/compliance/:shipmentId/issues', authenticateToken, async (req, res) => {
  try {
    const { shipmentId } = req.params;
    const { type, severity, description } = req.body;
    
    const compliance = await Compliance.findOneAndUpdate(
      { shipmentId },
      {
        $push: {
          issues: {
            type,
            severity,
            description,
            raisedDate: new Date(),
            status: 'open'
          }
        },
        updatedAt: new Date()
      },
      { new: true }
    );
    
    res.json({ message: 'Issue added', compliance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload Document
router.post('/compliance/:shipmentId/documents', authenticateToken, async (req, res) => {
  try {
    const { shipmentId } = req.params;
    const { docType, fileName } = req.body;
    
    const compliance = await Compliance.findOneAndUpdate(
      { shipmentId },
      {
        $push: {
          documents: {
            type: docType,
            fileName,
            uploadDate: new Date(),
            verified: false
          }
        },
        updatedAt: new Date()
      },
      { new: true }
    );
    
    res.json({ message: 'Document uploaded', compliance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Compliance Score
router.get('/compliance/:shipmentId/score', authenticateToken, async (req, res) => {
  try {
    const { shipmentId } = req.params;
    const compliance = await Compliance.findOne({ shipmentId });
    
    if (!compliance) {
      return res.status(404).json({ error: 'Compliance record not found' });
    }
    
    // Calculate compliance score
    const checks = compliance.complianceChecks;
    let score = 0;
    let totalChecks = 0;
    
    Object.values(checks).forEach(check => {
      if (typeof check.status === 'boolean') {
        score += check.status ? 10 : 0;
        totalChecks += 10;
      }
    });
    
    // Deduct for issues
    score -= compliance.issues.filter(i => i.status === 'open').length * 5;
    
    const finalScore = Math.max(0, Math.min(100, score));
    
    res.json({
      complianceScore: finalScore,
      openIssues: compliance.issues.filter(i => i.status === 'open').length,
      documentsVerified: compliance.documents.filter(d => d.verified).length,
      totalDocuments: compliance.documents.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function
function calculateTrend(data) {
  if (data.length < 2) return [];
  return data.map((d, i) => ({
    date: d.date,
    value: d.cost,
    trend: i === 0 ? 'stable' : d.cost < data[i - 1].cost ? 'down' : 'up'
  }));
}

module.exports = router;
