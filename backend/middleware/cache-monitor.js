// backend/middleware/cache-monitor.js
// Cache monitoring module - tracks hit/miss rates in memory

const CACHE_THRESHOLDS = {
  CRITICAL_MISS: 50,    // Below 50% = critical
  WARNING_MISS: 75,     // Below 75% = warning
  HEALTHY: 85,          // Above 85% = healthy
};

let cacheStats = {
  hits: 0,
  misses: 0,
  evictions: 0,
  lastReset: new Date(),
  samples: []
};

// Track cache operations
const trackCacheOperation = (isHit) => {
  if (isHit) {
    cacheStats.hits++;
  } else {
    cacheStats.misses++;
  }
  
  // Calculate hit rate every 10 operations
  const total = cacheStats.hits + cacheStats.misses;
  if (total % 10 === 0) {
    const hitRate = (cacheStats.hits / total) * 100;
    cacheStats.samples.push({
      timestamp: new Date().toISOString(),
      hitRate,
      total,
      status: getHealthStatus(hitRate)
    });
    
    // Log alert if degraded
    if (hitRate < CACHE_THRESHOLDS.CRITICAL_MISS) {
      console.warn(`[CACHE ALERT] Hit rate critical: ${hitRate.toFixed(2)}%`);
      notifyAlert('CACHE_DEGRADATION', hitRate);
    }
  }
};

const getHealthStatus = (hitRate) => {
  if (hitRate >= CACHE_THRESHOLDS.HEALTHY) return 'HEALTHY';
  if (hitRate >= CACHE_THRESHOLDS.WARNING_MISS) return 'WARNING';
  return 'CRITICAL';
};

const getCacheMetrics = () => {
  const total = cacheStats.hits + cacheStats.misses;
  return {
    hitRate: total > 0 ? ((cacheStats.hits / total) * 100).toFixed(2) : 0,
    totalOperations: total,
    hits: cacheStats.hits,
    misses: cacheStats.misses,
    evictions: cacheStats.evictions,
    uptime: new Date() - cacheStats.lastReset,
    recentSamples: cacheStats.samples.slice(-5)
  };
};

const notifyAlert = (alertType, value) => {
  // TODO: Integrate with alerting system (Sentry, PagerDuty, etc.)
  console.log(`[ALERT] ${alertType}: ${value}`);
};

module.exports = {
  trackCacheOperation,
  getCacheMetrics,
  CACHE_THRESHOLDS
};
