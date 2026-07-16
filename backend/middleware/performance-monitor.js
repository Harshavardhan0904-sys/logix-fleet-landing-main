// backend/middleware/performance-monitor.js
const PERFORMANCE_THRESHOLDS = {
  P50: 100,   // ms
  P95: 300,   // ms
  P99: 1000,  // ms
};

let performanceStats = {
  responseTimes: [],
  byEndpoint: {},
  byMethod: {},
  errors: 0,
  lastReset: new Date()
};

const performanceMiddleware = (req, res, next) => {
  const startTime = Date.now();
  
  // Override res.end to capture response
  const originalEnd = res.end;
  res.end = function(...args) {
    const duration = Date.now() - startTime;
    
    // Record metric
    recordPerformanceMetric({
      method: req.method,
      endpoint: req.route?.path || req.path,
      duration,
      statusCode: res.statusCode,
      timestamp: new Date().toISOString()
    });
    
    // Call original end
    originalEnd.apply(res, args);
  };
  
  next();
};

const recordPerformanceMetric = (metric) => {
  performanceStats.responseTimes.push(metric.duration);
  
  // Track by endpoint
  const endpoint = metric.endpoint;
  if (!performanceStats.byEndpoint[endpoint]) {
    performanceStats.byEndpoint[endpoint] = [];
  }
  performanceStats.byEndpoint[endpoint].push(metric.duration);
  
  // Alert on slow response
  if (metric.duration > PERFORMANCE_THRESHOLDS.P95) {
    console.warn(`[SLOW RESPONSE] ${metric.method} ${endpoint}: ${metric.duration}ms`);
  }
};

const getPercentile = (arr, p) => {
  if (arr.length === 0) return 0;
  const sorted = arr.sort((a, b) => a - b);
  const index = Math.ceil(sorted.length * p) - 1;
  return sorted[Math.max(0, index)];
};

const getPerformanceMetrics = () => {
  const times = performanceStats.responseTimes;
  return {
    avg: times.length > 0 ? (times.reduce((a, b) => a + b) / times.length).toFixed(2) : 0,
    p50: getPercentile([...times], 0.5),
    p95: getPercentile([...times], 0.95),
    p99: getPercentile([...times], 0.99),
    min: Math.min(...times),
    max: Math.max(...times),
    sampleCount: times.length,
    topSlowEndpoints: getTopSlowEndpoints()
  };
};

const getTopSlowEndpoints = () => {
  return Object.entries(performanceStats.byEndpoint)
    .map(([endpoint, times]) => ({
      endpoint,
      avg: (times.reduce((a, b) => a + b) / times.length).toFixed(2),
      max: Math.max(...times),
      count: times.length
    }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 5);
};

module.exports = {
  performanceMiddleware,
  getPerformanceMetrics,
  PERFORMANCE_THRESHOLDS
};
