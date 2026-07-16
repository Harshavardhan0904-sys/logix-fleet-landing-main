// ─────────────────────────────────────────────────────────────
// Health Check Endpoint & Monitoring Utilities
// Provides real-time system health status
// ─────────────────────────────────────────────────────────────

const mongoose = require('mongoose');

// Get system health status
async function getHealthStatus() {
  const memUsage = process.memoryUsage();
  const uptime = process.uptime();
  
  let dbHealth = {
    connected: false,
    responseTime: 0,
    error: null
  };
  
  // Check database connection
  if (mongoose.connection.readyState === 1) {
    const start = Date.now();
    try {
      await mongoose.connection.collection('system.indexes').findOne({});
      const responseTime = Date.now() - start;
      dbHealth = {
        connected: true,
        responseTime: responseTime,
        error: null
      };
    } catch (error) {
      dbHealth = {
        connected: false,
        responseTime: Date.now() - start,
        error: error.message
      };
    }
  } else {
    dbHealth = {
      connected: false,
      responseTime: 0,
      error: 'MongoDB not connected'
    };
  }
  
  // Determine overall health status
  const isHealthy = dbHealth.connected && memUsage.heapUsed < memUsage.heapTotal * 0.9;
  
  return {
    status: isHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(uptime),
    memory: {
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024),
      rss: Math.round(memUsage.rss / 1024 / 1024)
    },
    database: dbHealth,
    environment: process.env.NODE_ENV || 'development',
    version: process.env.API_VERSION || '1.0.0'
  };
}

// Track metrics for monitoring
class MetricsTracker {
  constructor() {
    this.metrics = {
      requests: 0,
      errors: 0,
      avgResponseTime: 0,
      p95ResponseTime: [],
      p99ResponseTime: [],
      endpoints: {}
    };
  }
  
  recordRequest(method, path, duration, status) {
    this.metrics.requests++;
    
    // Track endpoint metrics
    const endpoint = `${method} ${path}`;
    if (!this.metrics.endpoints[endpoint]) {
      this.metrics.endpoints[endpoint] = {
        count: 0,
        totalTime: 0,
        errors: 0,
        avgTime: 0
      };
    }
    
    const ep = this.metrics.endpoints[endpoint];
    ep.count++;
    ep.totalTime += duration;
    ep.avgTime = ep.totalTime / ep.count;
    
    if (status >= 400) {
      ep.errors++;
      this.metrics.errors++;
    }
    
    // Track response times for percentiles
    this.metrics.p95ResponseTime.push(duration);
    this.metrics.p99ResponseTime.push(duration);
    
    // Keep only last 1000 for memory efficiency
    if (this.metrics.p95ResponseTime.length > 1000) {
      this.metrics.p95ResponseTime.shift();
      this.metrics.p99ResponseTime.shift();
    }
    
    // Update average
    this.metrics.avgResponseTime = 
      (this.metrics.avgResponseTime * (this.metrics.requests - 1) + duration) / 
      this.metrics.requests;
  }
  
  getMetrics() {
    const sorted95 = [...this.metrics.p95ResponseTime].sort((a, b) => a - b);
    const sorted99 = [...this.metrics.p99ResponseTime].sort((a, b) => a - b);
    
    const p95Index = Math.floor(sorted95.length * 0.95);
    const p99Index = Math.floor(sorted99.length * 0.99);
    
    return {
      ...this.metrics,
      p95ResponseTime: sorted95[p95Index] || 0,
      p99ResponseTime: sorted99[p99Index] || 0,
      errorRate: ((this.metrics.errors / this.metrics.requests) * 100).toFixed(2) + '%'
    };
  }
  
  reset() {
    this.metrics = {
      requests: 0,
      errors: 0,
      avgResponseTime: 0,
      p95ResponseTime: [],
      p99ResponseTime: [],
      endpoints: {}
    };
  }
}

module.exports = {
  getHealthStatus,
  MetricsTracker
};
