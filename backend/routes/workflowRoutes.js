const express = require('express');
const router = express.Router();

let MultiModalRoute, ShipmentWorkflow;

// Try to load models, handle if MongoDB is not connected
try {
  const models = require('../models/workflowModels');
  MultiModalRoute = models.MultiModalRoute;
  ShipmentWorkflow = models.ShipmentWorkflow;
} catch (err) {
  console.warn('⚠️ Workflow models not available yet, will be initialized later');
}

// Function to initialize models after they're created (for memory mode)
router.initializeModels = function(models) {
  MultiModalRoute = models.MultiModalRoute;
  ShipmentWorkflow = models.ShipmentWorkflow;
  console.log('✅ Workflow models initialized');
};

const authenticateToken = (req, res, next) => {
  next();
};

// ═══════════════════════════════════════════════════════════
// MULTI-MODAL ROUTES ENDPOINTS
// ═══════════════════════════════════════════════════════════

// Create Multi-Modal Route
router.post('/multi-modal', authenticateToken, async (req, res) => {
  try {
    if (!MultiModalRoute) {
      console.warn('⚠️ MultiModalRoute model not initialized');
      return res.status(503).json({ 
        error: 'Service not yet ready', 
        message: 'Workflow service is initializing. Please try again in a moment.'
      });
    }

    const {
      routeName, shipmentId, clientId, origin, destination, segments
    } = req.body;
    
    // Calculate total cost and duration
    let totalCost = 0;
    let totalDuration = 0;
    
    segments.forEach(segment => {
      totalCost += segment.cost || 0;
      totalDuration += segment.estimatedDuration || 0;
    });
    
    // Mock carbon footprint calculation
    const carbonFootprint = totalDuration * 0.5; // kg CO2
    
    const route = new MultiModalRoute({
      routeName,
      shipmentId,
      clientId,
      origin,
      destination,
      segments,
      totalCost,
      totalDuration,
      carbonFootprint
    });
    
    await route.save();
    res.json({ message: 'Multi-modal route created', route });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Multi-Modal Route
router.get('/multi-modal/:routeId', authenticateToken, async (req, res) => {
  try {
    const { routeId } = req.params;
    const route = await MultiModalRoute.findById(routeId);
    
    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }
    
    res.json(route);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Routes by Shipment
router.get('/shipment/:shipmentId', authenticateToken, async (req, res) => {
  try {
    const { shipmentId } = req.params;
    const routes = await MultiModalRoute.find({ shipmentId });
    
    res.json(routes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Optimized Route Recommendation
router.post('/optimize', authenticateToken, async (req, res) => {
  try {
    const { origin, destination, shipmentId, clientId, constraints } = req.body;
    
    // Mock optimization logic
    const recommendations = [];
    
    // Road route
    recommendations.push({
      name: 'Direct Road',
      segments: [{
        mode: 'ROAD',
        distance: 1000,
        estimatedDuration: 24,
        cost: 5000,
        provider: 'FedEx India'
      }],
      totalCost: 5000,
      totalDuration: 24,
      carbonFootprint: 12,
      score: 0.75
    });
    
    // Multi-modal route
    recommendations.push({
      name: 'Rail + Road',
      segments: [
        {
          mode: 'RAIL',
          distance: 800,
          estimatedDuration: 16,
          cost: 3000,
          provider: 'Indian Railways'
        },
        {
          mode: 'ROAD',
          distance: 200,
          estimatedDuration: 8,
          cost: 2000,
          provider: 'Local Carrier'
        }
      ],
      totalCost: 5000,
      totalDuration: 24,
      carbonFootprint: 8,
      score: 0.85
    });
    
    res.json({
      origin,
      destination,
      recommendations: recommendations.sort((a, b) => b.score - a.score)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Segment Status
router.put('/:routeId/segments/:segmentId/status', authenticateToken, async (req, res) => {
  try {
    const { routeId, segmentId } = req.params;
    const { status } = req.body;
    
    const route = await MultiModalRoute.findByIdAndUpdate(
      routeId,
      {
        $set: {
          'segments.$[elem].status': status,
          'segments.$[elem].tracking.lastUpdated': new Date()
        }
      },
      {
        arrayFilters: [{ 'elem.segmentId': segmentId }],
        new: true
      }
    );
    
    res.json({ message: 'Segment status updated', route });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════
// ADVANCED SHIPMENT WORKFLOW ENDPOINTS
// ═══════════════════════════════════════════════════════════

// Create Shipment Workflow
router.post('/shipment', authenticateToken, async (req, res) => {
  try {
    const { shipmentId, clientId, workflowType, approvalChain } = req.body;
    
    const workflow = new ShipmentWorkflow({
      shipmentId,
      clientId,
      workflowType,
      approvalChain: approvalChain || [],
      currentState: {
        state: 'created',
        timestamp: new Date(),
        performer: req.user?.id || 'system'
      }
    });
    
    await workflow.save();
    res.json({ message: 'Workflow created', workflow });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Workflow
router.get('/shipment/:shipmentId', authenticateToken, async (req, res) => {
  try {
    const { shipmentId } = req.params;
    const workflow = await ShipmentWorkflow.findOne({ shipmentId });
    
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    
    res.json(workflow);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Transition State
router.post('/shipment/:shipmentId/transition', authenticateToken, async (req, res) => {
  try {
    const { shipmentId } = req.params;
    const { toState, reason, performedBy } = req.body;
    
    const workflow = await ShipmentWorkflow.findOne({ shipmentId });
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    
    const fromState = workflow.currentState.state;
    
    // Check if transition is valid
    const validTransitions = {
      'created': ['approved', 'cancelled'],
      'approved': ['picked', 'cancelled'],
      'picked': ['packed', 'cancelled'],
      'packed': ['dispatched', 'cancelled'],
      'dispatched': ['in-transit', 'cancelled'],
      'in-transit': ['out-for-delivery', 'returned'],
      'out-for-delivery': ['delivered', 'returned'],
      'delivered': [],
      'returned': ['created'],
      'cancelled': []
    };
    
    if (!validTransitions[fromState]?.includes(toState)) {
      return res.status(400).json({ error: `Invalid transition from ${fromState} to ${toState}` });
    }
    
    // Add state transition
    workflow.stateTransitions.push({
      fromState,
      toState,
      performedBy: performedBy || req.user?.id || 'system',
      timestamp: new Date(),
      reason,
      autoApproved: !workflow.approvalChain || workflow.approvalChain.length === 0
    });
    
    // Update current state
    workflow.currentState = {
      state: toState,
      timestamp: new Date(),
      performer: performedBy || req.user?.id || 'system',
      notes: reason
    };
    
    await workflow.save();
    
    res.json({
      message: `Transitioned from ${fromState} to ${toState}`,
      workflow
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add Approval
router.post('/shipment/:shipmentId/approve', authenticateToken, async (req, res) => {
  try {
    const { shipmentId } = req.params;
    const { level, status, comments } = req.body;
    
    const workflow = await ShipmentWorkflow.findOne({ shipmentId });
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    
    const approval = workflow.approvalChain.find(a => a.level === level);
    if (!approval) {
      return res.status(404).json({ error: 'Approval level not found' });
    }
    
    approval.approvalDate = new Date();
    approval.status = status;
    approval.comments = comments;
    approval.requiresAction = false;
    
    // Check if all approvals are done
    const allApproved = workflow.approvalChain.every(a => a.status === 'approved');
    if (allApproved && workflow.currentState.state === 'created') {
      workflow.currentState = {
        state: 'approved',
        timestamp: new Date(),
        performer: req.user?.id || 'system',
        notes: 'Auto-transitioned after all approvals'
      };
    }
    
    await workflow.save();
    
    res.json({
      message: 'Approval recorded',
      workflow
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Workflow History
router.get('/shipment/:shipmentId/history', authenticateToken, async (req, res) => {
  try {
    const { shipmentId } = req.params;
    const workflow = await ShipmentWorkflow.findOne({ shipmentId });
    
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    
    res.json({
      currentState: workflow.currentState,
      stateTransitions: workflow.stateTransitions,
      approvals: workflow.approvalChain
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add Custom Field
router.put('/shipment/:shipmentId/custom-fields', authenticateToken, async (req, res) => {
  try {
    const { shipmentId } = req.params;
    const { customFields } = req.body;
    
    const workflow = await ShipmentWorkflow.findOneAndUpdate(
      { shipmentId },
      {
        $set: {
          customFields: new Map([...workflow.customFields || [], ...Object.entries(customFields)])
        }
      },
      { new: true }
    );
    
    res.json({ message: 'Custom fields updated', workflow });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
