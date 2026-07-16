const express = require('express');
const router = express.Router();

let Dashboard, Capacity;

// Try to load models, handle if MongoDB is not connected
try {
  const models = require('../models/dashboardModels');
  Dashboard = models.Dashboard;
  Capacity = models.Capacity;
} catch (err) {
  console.warn('⚠️ Dashboard models not available yet, will be initialized later');
}

// Function to initialize models after they're created (for memory mode)
router.initializeModels = function(models) {
  Dashboard = models.Dashboard;
  Capacity = models.Capacity;
  console.log('✅ Dashboard models initialized');
};

// Helper: Authenticate token (mock implementation)
const authenticateToken = (req, res, next) => {
  next();
};

// ═══════════════════════════════════════════════════════════
// CLIENT-LEVEL DASHBOARD ENDPOINTS
// ═══════════════════════════════════════════════════════════

// Get Dashboard for a Client
router.get('/:clientId', authenticateToken, async (req, res) => {
  try {
    if (!Dashboard) {
      console.warn('⚠️ Dashboard model not initialized');
      return res.status(503).json({ 
        error: 'Service not yet ready', 
        message: 'Dashboard service is initializing. Please try again in a moment.'
      });
    }

    const { clientId } = req.params;
    let dashboard = await Dashboard.findOne({ clientId }).populate('recentShipments');
    
    if (!dashboard) {
      // Create new dashboard if not exists
      dashboard = new Dashboard({
        clientId,
        clientName: `Client-${clientId}`,
        totalShipments: 0,
        totalRevenue: 0,
        totalCost: 0
      });
      await dashboard.save();
    }
    
    res.json(dashboard);
  } catch (error) {
    console.error('❌ Dashboard fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update Dashboard KPIs
router.post('/:clientId/kpis', authenticateToken, async (req, res) => {
  try {
    const { clientId } = req.params;
    const { kpi, value } = req.body;
    
    const dashboard = await Dashboard.findOneAndUpdate(
      { clientId },
      {
        $push: { kpis: { name: kpi, value, trend: 'stable', target: value * 1.1 } },
        lastUpdated: new Date()
      },
      { new: true }
    );
    
    res.json({ message: 'KPI updated', dashboard });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Monthly Performance Metrics
router.get('/:clientId/monthly-metrics', authenticateToken, async (req, res) => {
  try {
    const { clientId } = req.params;
    const dashboard = await Dashboard.findOne({ clientId });
    
    if (!dashboard) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }
    
    res.json({ 
      metrics: dashboard.monthlyMetrics,
      summary: {
        totalShipments: dashboard.totalShipments,
        totalRevenue: dashboard.totalRevenue,
        totalCost: dashboard.totalCost,
        profitMargin: dashboard.profitMargin
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add Dashboard Alert
router.post('/:clientId/alerts', authenticateToken, async (req, res) => {
  try {
    const { clientId } = req.params;
    const { type, severity, message } = req.body;
    
    const dashboard = await Dashboard.findOneAndUpdate(
      { clientId },
      {
        $push: {
          alerts: {
            type,
            severity,
            message,
            timestamp: new Date()
          }
        }
      },
      { new: true }
    );
    
    res.json({ message: 'Alert added', alerts: dashboard.alerts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════
// CAPACITY MANAGEMENT ENDPOINTS
// ═══════════════════════════════════════════════════════════

// Get Capacity for a Shipment
router.get('/capacity/:shipmentId', authenticateToken, async (req, res) => {
  try {
    const { shipmentId } = req.params;
    const capacity = await Capacity.findOne({ shipmentId });
    
    if (!capacity) {
      return res.status(404).json({ error: 'Capacity data not found' });
    }
    
    res.json(capacity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create/Update Capacity Record
router.post('/capacity', authenticateToken, async (req, res) => {
  try {
    const {
      shipmentId, vehicleId, vehicleType, totalCapacity, utilizedCapacity, itemsLoaded
    } = req.body;
    
    const utilizationPercentage = (utilizedCapacity / totalCapacity) * 100;
    
    // Calculate optimization score
    const optimizationScore = Math.min(100, Math.max(0, utilizationPercentage));
    
    const capacity = await Capacity.findOneAndUpdate(
      { shipmentId },
      {
        shipmentId,
        vehicleId,
        vehicleType,
        totalCapacity,
        utilizedCapacity,
        utilizationPercentage,
        itemsLoaded,
        optimizationScore,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );
    
    res.json({ message: 'Capacity updated', capacity });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Fleet-wide Capacity Report
router.get('/report/fleet', authenticateToken, async (req, res) => {
  try {
    const capacities = await Capacity.find({ status: { $in: ['loading', 'full', 'in-transit'] } });
    
    const report = {
      totalVehicles: capacities.length,
      averageUtilization: capacities.reduce((sum, c) => sum + c.utilizationPercentage, 0) / capacities.length || 0,
      fullVehicles: capacities.filter(c => c.status === 'full').length,
      underUtilized: capacities.filter(c => c.utilizationPercentage < 50).length,
      recommendations: []
    };
    
    // Generate recommendations
    if (report.underUtilized > 0) {
      report.recommendations.push('Consolidate shipments to improve utilization');
    }
    
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Optimization Recommendations
router.get('/:shipmentId/optimize', authenticateToken, async (req, res) => {
  try {
    const { shipmentId } = req.params;
    const capacity = await Capacity.findOne({ shipmentId });
    
    if (!capacity) {
      return res.status(404).json({ error: 'Capacity data not found' });
    }
    
    const recommendations = [];
    
    if (capacity.utilizationPercentage < 50) {
      recommendations.push('Consider consolidating with other shipments');
    }
    
    if (capacity.utilizationPercentage > 90) {
      recommendations.push('Shipment is at safe capacity limit');
    }
    
    if (capacity.itemsLoaded.length === 0) {
      recommendations.push('No items loaded yet');
    }
    
    res.json({
      currentUtilization: capacity.utilizationPercentage,
      potentialSavings: Math.max(0, 100 - capacity.utilizationPercentage) * capacity.costPerKg,
      recommendations
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
