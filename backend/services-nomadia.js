/**
 * Business Logic & Services for Nomadia-Inspired Features
 * 
 * Contains helper functions, algorithms, and service classes for:
 * - Route Optimization (TSP solver)
 * - Territory Rebalancing
 * - Analytics Calculations
 * - Notification Service
 * - Photo Upload handling
 */

// ─────────────────────────────────────────────────────────
// 1. ROUTE OPTIMIZATION SERVICE
// ─────────────────────────────────────────────────────────

class RouteOptimizationService {
  /**
   * Calculate distance between two coordinates
   * Uses Haversine formula for Earth's surface
   */
  static calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Nearest Neighbor Algorithm for TSP
   * Simple but effective for quick route optimization
   */
  static nearestNeighbor(stops) {
    if (stops.length === 0) return [];
    
    const unvisited = new Set(stops.map((_, i) => i));
    const optimized = [0]; // Start at first stop
    unvisited.delete(0);
    
    while (unvisited.size > 0) {
      const current = stops[optimized[optimized.length - 1]];
      let nearest = -1;
      let minDistance = Infinity;
      
      for (const idx of unvisited) {
        const stop = stops[idx];
        const dist = this.calculateDistance(
          current.latitude, current.longitude,
          stop.latitude, stop.longitude
        );
        
        if (dist < minDistance) {
          minDistance = dist;
          nearest = idx;
        }
      }
      
      if (nearest !== -1) {
        optimized.push(nearest);
        unvisited.delete(nearest);
      }
    }
    
    return optimized;
  }

  /**
   * Calculate total distance for a route
   */
  static calculateTotalDistance(stops, order) {
    let total = 0;
    for (let i = 0; i < order.length - 1; i++) {
      const curr = stops[order[i]];
      const next = stops[order[i + 1]];
      total += this.calculateDistance(
        curr.latitude, curr.longitude,
        next.latitude, next.longitude
      );
    }
    return parseFloat(total.toFixed(2));
  }

  /**
   * Estimate travel time based on distance and vehicle type
   */
  static estimateTravelTime(distance, vehicleType = 'car') {
    const avgSpeeds = {
      bike: 30,      // km/h
      car: 40,
      van: 35,
      truck: 30,
      auto: 25
    };
    
    const speed = avgSpeeds[vehicleType] || 40;
    const timeMinutes = (distance / speed) * 60;
    
    // Add buffer for traffic (assumes 20% average traffic impact)
    return Math.ceil(timeMinutes * 1.2);
  }

  /**
   * Calculate fuel cost based on distance and fuel consumption
   */
  static calculateFuelCost(distance, vehicleType = 'car', fuelPricePerLiter = 100) {
    const fuelConsumption = {
      bike: 40,      // km/liter
      car: 15,
      van: 12,
      truck: 8,
      auto: 20
    };
    
    const consumption = fuelConsumption[vehicleType] || 15;
    const litersNeeded = distance / consumption;
    return parseFloat((litersNeeded * fuelPricePerLiter).toFixed(2));
  }

  /**
   * Calculate CO2 emissions based on distance and fuel
   */
  static calculateCO2Emissions(distance, vehicleType = 'car') {
    // Average CO2 emissions per km for different vehicles (grams)
    const emissionFactors = {
      bike: 50,      // g/km
      car: 205,
      van: 250,
      truck: 300,
      auto: 120
    };
    
    const factor = emissionFactors[vehicleType] || 205;
    const kgCO2 = (distance * factor) / 1000;
    return parseFloat(kgCO2.toFixed(2));
  }

  /**
   * Score a route based on multiple factors and priority
   */
  static scoreRoute(distance, time, cost, co2, priority = 'balanced') {
    let score = 0;
    
    switch (priority) {
      case 'fastest':
        score = (100 - (time / 200 * 100)) * 0.5 +
                (100 - (distance / 50 * 100)) * 0.3 +
                (100 - (cost / 1000 * 100)) * 0.2;
        break;
      case 'cheapest':
        score = (100 - (cost / 1000 * 100)) * 0.5 +
                (100 - (distance / 50 * 100)) * 0.3 +
                (100 - (time / 200 * 100)) * 0.2;
        break;
      case 'eco-friendly':
        score = (100 - (co2 / 20 * 100)) * 0.5 +
                (100 - (distance / 50 * 100)) * 0.3 +
                (100 - (time / 200 * 100)) * 0.2;
        break;
      case 'balanced':
      default:
        score = (100 - (time / 200 * 100)) * 0.35 +
                (100 - (distance / 50 * 100)) * 0.35 +
                (100 - (cost / 1000 * 100)) * 0.3;
    }
    
    return Math.max(0, Math.min(100, score)).toFixed(1);
  }

  /**
   * Optimize a route and generate alternatives
   */
  static optimizeRoute(stops, origin, vehicleType = 'car', priority = 'balanced') {
    if (!stops || stops.length === 0) {
      throw new Error('No stops provided for optimization');
    }
    
    // Add origin as first stop if not already
    const allStops = [origin, ...stops];
    
    // Primary optimization using nearest neighbor
    const optimizedOrder = this.nearestNeighbor(stops);
    const optimizedStops = optimizedOrder.map(i => stops[i]);
    
    // Calculate metrics
    const distance = this.calculateTotalDistance(stops, optimizedOrder);
    const time = this.estimateTravelTime(distance, vehicleType);
    const cost = this.calculateFuelCost(distance, vehicleType);
    const co2 = this.calculateCO2Emissions(distance, vehicleType);
    const score = this.scoreRoute(distance, time, cost, co2, priority);
    
    // Generate alternatives (simple variations)
    const alternatives = [
      {
        name: 'Via Highway',
        timeBoost: -0.2,
        distanceBoost: 0.05,
        costBoost: 0.15
      },
      {
        name: 'Fastest Route',
        timeBoost: -0.15,
        distanceBoost: 0.10,
        costBoost: 0.05
      }
    ].map(alt => {
      const altTime = Math.ceil(time * (1 + alt.timeBoost));
      const altDistance = parseFloat((distance * (1 + alt.distanceBoost)).toFixed(2));
      const altCost = parseFloat((cost * (1 + alt.costBoost)).toFixed(2));
      const altCO2 = this.calculateCO2Emissions(altDistance, vehicleType);
      
      return {
        name: alt.name,
        distance: altDistance,
        time: altTime,
        cost: altCost,
        co2: altCO2,
        score: this.scoreRoute(altDistance, altTime, altCost, altCO2, priority)
      };
    });
    
    return {
      optimizedRoute: optimizedStops,
      primaryMetrics: {
        distance,
        time,
        cost,
        co2,
        score
      },
      alternatives,
      recommendation: `Route optimized for ${priority} with ${stops.length} stops`
    };
  }
}

// ─────────────────────────────────────────────────────────
// 2. TERRITORY MANAGEMENT SERVICE
// ─────────────────────────────────────────────────────────

class TerritoryService {
  /**
   * Calculate workload utilization percentage
   */
  static calculateUtilization(currentDeliveries, capacity) {
    if (capacity === 0) return 0;
    return Math.min(100, Math.round((currentDeliveries / capacity) * 100));
  }

  /**
   * Analyze territory workload and suggest optimizations
   */
  static analyzeTerritoryWorkload(territories) {
    const analysis = {
      totalCapacity: 0,
      totalUtilization: 0,
      balanceScore: 0,
      overloadedTerritories: [],
      underutilizedTerritories: [],
      unassignedTerritories: [],
      suggestions: []
    };

    territories.forEach(territory => {
      analysis.totalCapacity += territory.workload.capacity;
      analysis.totalUtilization += territory.workload.currentDeliveries;
      
      const utilization = this.calculateUtilization(
        territory.workload.currentDeliveries,
        territory.workload.capacity
      );

      if (!territory.assignedDriver) {
        analysis.unassignedTerritories.push(territory.id);
      } else if (utilization > 80) {
        analysis.overloadedTerritories.push({
          id: territory.id,
          utilization,
          excess: territory.workload.currentDeliveries - (territory.workload.capacity * 0.8)
        });
      } else if (utilization < 40) {
        analysis.underutilizedTerritories.push({
          id: territory.id,
          utilization,
          available: (territory.workload.capacity * 0.8) - territory.workload.currentDeliveries
        });
      }
    });

    // Calculate overall balance score (0-100, 50 is perfect balance)
    const avgUtilization = (analysis.totalUtilization / analysis.totalCapacity) * 100;
    analysis.balanceScore = Math.round(100 - Math.abs(50 - avgUtilization));

    // Generate optimization suggestions
    if (analysis.overloadedTerritories.length > 0 && analysis.underutilizedTerritories.length > 0) {
      analysis.suggestions.push({
        type: 'rebalance',
        action: 'Move deliveries from overloaded to underutilized territories',
        impact: 'Improve overall balance by ' + Math.round(avgUtilization - 50) + '%'
      });
    }

    if (analysis.unassignedTerritories.length > 0) {
      analysis.suggestions.push({
        type: 'hire',
        action: `Assign drivers to ${analysis.unassignedTerritories.length} unassigned territories`,
        impact: `Increase coverage and reduce delivery times`
      });
    }

    if (analysis.overloadedTerritories.length > 0) {
      analysis.suggestions.push({
        type: 'split',
        action: 'Divide overloaded territories into smaller zones',
        impact: 'Reduce driver workload and improve quality of service'
      });
    }

    return analysis;
  }

  /**
   * Suggest optimal territory assignments for drivers
   */
  static suggestAssignments(drivers, territories) {
    const suggestions = [];

    for (let i = 0; i < territories.length; i++) {
      const territory = territories[i];
      
      if (!territory.assignedDriver && drivers.length > suggestions.length) {
        const bestDriver = drivers[suggestions.length];
        
        suggestions.push({
          territoryId: territory.id,
          driverId: bestDriver.id,
          reason: `Territory ${territory.name} needs coverage. Driver ${bestDriver.name} has capacity.`,
          expectedUtilization: territory.workload.expectedDaily / territory.workload.capacity
        });
      }
    }

    return suggestions;
  }
}

// ─────────────────────────────────────────────────────────
// 3. ANALYTICS SERVICE
// ─────────────────────────────────────────────────────────

class AnalyticsService {
  /**
   * Calculate key performance indicators
   */
  static calculateKPIs(shipments) {
    const delivered = shipments.filter(s => s.status === 'delivered').length;
    const failed = shipments.filter(s => s.status === 'failed').length;
    const inTransit = shipments.filter(s => s.status === 'in-transit').length;
    
    const totalCost = shipments.reduce((sum, s) => sum + (s.cost || 0), 0);
    const totalRevenue = shipments.reduce((sum, s) => sum + (s.revenue || 0), 0);
    
    return {
      totalDeliveries: shipments.length,
      successfulDeliveries: delivered,
      failedDeliveries: failed,
      pendingDeliveries: inTransit,
      successRate: shipments.length > 0 ? ((delivered / shipments.length) * 100).toFixed(1) : 0,
      totalRevenue: totalRevenue.toFixed(2),
      totalCost: totalCost.toFixed(2),
      profit: (totalRevenue - totalCost).toFixed(2)
    };
  }

  /**
   * Calculate the distribution of deliveries by status
   */
  static statusBreakdown(shipments) {
    const breakdown = {
      inTransit: 0,
      outForDelivery: 0,
      delivered: 0,
      delayed: 0,
      failed: 0
    };

    shipments.forEach(shipment => {
      const status = shipment.status || 'pending';
      if (breakdown.hasOwnProperty(status)) {
        breakdown[status]++;
      }
    });

    return breakdown;
  }

  /**
   * Calculate performance metrics for all vendors
   */
  static vendorPerformance(shipments) {
    const vendorMap = {};

    shipments.forEach(shipment => {
      const vendorId = shipment.vendorId || 'unknown';
      
      if (!vendorMap[vendorId]) {
        vendorMap[vendorId] = {
          vendorId,
          deliveries: 0,
          successful: 0,
          totalTime: 0,
          ratings: []
        };
      }

      vendorMap[vendorId].deliveries++;
      if (shipment.status === 'delivered') {
        vendorMap[vendorId].successful++;
      }
      if (shipment.deliveryTime) {
        vendorMap[vendorId].totalTime += shipment.deliveryTime;
      }
      if (shipment.rating) {
        vendorMap[vendorId].ratings.push(shipment.rating);
      }
    });

    return Object.values(vendorMap).map(vendor => ({
      vendorId: vendor.vendorId,
      deliveries: vendor.deliveries,
      successRate: ((vendor.successful / vendor.deliveries) * 100).toFixed(1),
      averageTime: vendor.totalTime > 0 ? Math.round(vendor.totalTime / vendor.deliveries) : 0,
      avgRating: vendor.ratings.length > 0 
        ? (vendor.ratings.reduce((a, b) => a + b) / vendor.ratings.length).toFixed(1) 
        : 0
    }));
  }

  /**
   * Generate hourly breakdown of deliveries
   */
  static hourlyBreakdown(shipments) {
    const breakdown = {};

    for (let i = 0; i < 24; i++) {
      breakdown[i] = 0;
    }

    shipments.forEach(shipment => {
      if (shipment.deliveredAt) {
        const hour = new Date(shipment.deliveredAt).getHours();
        breakdown[hour]++;
      }
    });

    return Object.entries(breakdown).map(([hour, count]) => ({
      hour: parseInt(hour),
      deliveries: count
    }));
  }

  /**
   * Calculate cost breakdown by category
   */
  static costBreakdown(shipments) {
    const costs = {
      fuelCost: 0,
      driverSalary: 0,
      vehicleMaintenance: 0,
      miscellaneous: 0
    };

    shipments.forEach(shipment => {
      costs.fuelCost += shipment.fuelCost || 0;
      costs.driverSalary += shipment.driverCost || 0;
      costs.vehicleMaintenance += shipment.maintenanceCost || 0;
      costs.miscellaneous += shipment.otherCost || 0;
    });

    const totalCost = Object.values(costs).reduce((a, b) => a + b, 0);

    return {
      ...costs,
      totalCost,
      percentage: {
        fuel: totalCost > 0 ? ((costs.fuelCost / totalCost) * 100).toFixed(1) : 0,
        driver: totalCost > 0 ? ((costs.driverSalary / totalCost) * 100).toFixed(1) : 0,
        maintenance: totalCost > 0 ? ((costs.vehicleMaintenance / totalCost) * 100).toFixed(1) : 0,
        misc: totalCost > 0 ? ((costs.miscellaneous / totalCost) * 100).toFixed(1) : 0
      }
    };
  }

  /**
   * Calculate environmental impact metrics
   */
  static environmentalMetrics(shipments) {
    let totalCO2 = 0;
    let totalFuelSaved = 0;
    let totalDistance = 0;

    shipments.forEach(shipment => {
      totalCO2 += shipment.co2Emissions || 0;
      totalFuelSaved += shipment.fuelSaved || 0;
      totalDistance += shipment.distance || 0;
    });

    return {
      totalCO2Emissions: (totalCO2 / 1000).toFixed(2), // Convert to kg
      totalFuelSaved: totalFuelSaved.toFixed(2),
      totalDistance: totalDistance.toFixed(2),
      averageEmissionsPerKm: totalDistance > 0 ? (totalCO2 / totalDistance).toFixed(2) : 0
    };
  }
}

// ─────────────────────────────────────────────────────────
// 4. NOTIFICATION SERVICE
// ─────────────────────────────────────────────────────────

class NotificationService {
  /**
   * Send notification to driver about new task
   */
  static notifyDriverNewTask(driverId, shipments) {
    return {
      type: 'task_assigned',
      driverId,
      message: `You have ${shipments.length} new delivery task(s) assigned`,
      shipmentCount: shipments.length,
      priority: 'high',
      actionRequired: true
    };
  }

  /**
   * Notify about delivery delay
   */
  static notifyDeliveryDelay(shipmentId, delayMinutes) {
    return {
      type: 'delay_alert',
      shipmentId,
      message: `Delivery delayed by ${delayMinutes} minutes`,
      delayMinutes,
      priority: 'medium'
    };
  }

  /**
   * Notify about successful delivery
   */
  static notifyDeliverySuccess(shipmentId, recipientName) {
    return {
      type: 'delivery_success',
      shipmentId,
      message: `Delivery successful to ${recipientName}`,
      priority: 'low'
    };
  }

  /**
   * Notify customer about delivery
   */
  static notifyCustomer(shipmentId, message) {
    return {
      type: 'customer_notification',
      shipmentId,
      message,
      channel: ['email', 'sms', 'whatsapp'],
      priority: 'medium'
    };
  }

  /**
   * Broadcast message to all drivers
   */
  static broadcastToDrivers(message, priority = 'normal') {
    return {
      type: 'broadcast',
      message,
      priority,
      targetAudience: 'all_drivers',
      timestamp: new Date()
    };
  }
}

// ─────────────────────────────────────────────────────────
// 5. PHOTO UPLOAD SERVICE
// ─────────────────────────────────────────────────────────

class PhotoUploadService {
  /**
   * Validate photo file before upload
   */
  static validatePhoto(file) {
    const errors = [];
    
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      errors.push('Invalid file type. Only JPEG, PNG, and WebP allowed');
    }
    
    // Check file size (50MB limit)
    const maxSizeBytes = 50 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      errors.push('File size exceeds 50MB limit');
    }
    
    // Check dimensions (optional)
    if (file.size < 100 * 1024) {
      errors.push('File too small, likely corrupt');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate S3 key for photo storage
   */
  static generateS3Key(shipmentId, photoType = 'pod') {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    return `deliveries/${shipmentId}/${photoType}-${timestamp}-${randomString}.jpg`;
  }

  /**
   * Generate local file path for photo storage
   */
  static generateLocalPath(shipmentId, photoType = 'pod') {
    const timestamp = Date.now();
    return `uploads/shipments/${shipmentId}/${photoType}-${timestamp}.jpg`;
  }

  /**
   * Prepare metadata for photo storage
   */
  static prepareMetadata(file, uploadedBy) {
    return {
      originalName: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
      uploadedBy,
      uploadedAt: new Date(),
      checksum: this.generateChecksum(file.buffer)
    };
  }

  /**
   * Generate simple checksum for file integrity
   */
  static generateChecksum(buffer) {
    return require('crypto')
      .createHash('md5')
      .update(buffer)
      .digest('hex');
  }
}

// ─────────────────────────────────────────────────────────
// 6. MODULE EXPORTS
// ─────────────────────────────────────────────────────────

module.exports = {
  RouteOptimizationService,
  TerritoryService,
  AnalyticsService,
  NotificationService,
  PhotoUploadService
};

/**
 * Usage Examples:
 * 
 * // Route Optimization
 * const route = RouteOptimizationService.optimizeRoute(deliveryStops, origin, 'car', 'fastest');
 * 
 * // Territory Analysis
 * const analysis = TerritoryService.analyzeTerritoryWorkload(territories);
 * 
 * // Calculate KPIs
 * const kpis = AnalyticsService.calculateKPIs(shipments);
 * 
 * // Send notifications
 * const notification = NotificationService.notifyDriverNewTask(driverId, shipments);
 * 
 * // Photo Upload
 * const validation = PhotoUploadService.validatePhoto(file);
 */
