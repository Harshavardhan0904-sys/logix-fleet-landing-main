/**
 * ⚡ RESPONSE CACHING MIDDLEWARE
 * Purpose: Cache read-only endpoint responses for 60-80% faster repeat requests
 * Cost: $0 (in-memory, no Redis required)
 * 
 * Features:
 * - In-memory cache with TTL
 * - Automatic cache invalidation on data changes
 * - Different cache durations for different endpoints
 * - Cache statistics and monitoring
 */

const logger = require('./logger');
const { trackCacheOperation } = require('./middleware/cache-monitor');

/**
 * In-memory cache store
 * Format: { key: { data, timestamp, ttl } }
 */
const cacheStore = {};

/**
 * Cache statistics
 */
const cacheStats = {
  hits: 0,
  misses: 0,
  sets: 0,
  deletes: 0
};

/**
 * Clean up expired entries (runs every 1 minute)
 */
setInterval(() => {
  const now = Date.now();
  let expired = 0;

  for (const key in cacheStore) {
    const entry = cacheStore[key];
    if (entry.expiresAt < now) {
      delete cacheStore[key];
      expired++;
    }
  }

  if (expired > 0) {
    logger.info('Cache cleanup', { expired_entries: expired, total_cache_entries: Object.keys(cacheStore).length });
  }
}, 60000); // 1 minute

/**
 * Generate cache key from request
 */
function getCacheKey(req) {
  const userId = req.user?.id || 'anon';
  const companyId = req.user?.company_id || req.body?.company_id || 'all';
  const path = req.path;
  const queryString = Object.keys(req.query)
    .sort()
    .map(k => `${k}=${req.query[k]}`)
    .join('&');

  return `cache:${userId}:${companyId}:${path}:${queryString}`;
}

/**
 * Set cache value
 */
function setCache(key, data, ttlSeconds = 300) {
  const now = Date.now();
  cacheStore[key] = {
    data,
    createdAt: now,
    expiresAt: now + (ttlSeconds * 1000),
    ttl: ttlSeconds
  };

  cacheStats.sets++;

  logger.debug('Cache SET', {
    key: key.substring(0, 50) + '...',
    ttl: ttlSeconds,
    cache_size: Object.keys(cacheStore).length
  });
}

/**
 * Get cache value
 */
function getCache(key) {
  if (!cacheStore[key]) {
    cacheStats.misses++;
    trackCacheOperation(false);  // CACHE MISS
    return null;
  }

  const entry = cacheStore[key];
  const now = Date.now();

  // Check if expired
  if (entry.expiresAt < now) {
    delete cacheStore[key];
    cacheStats.misses++;
    trackCacheOperation(false);  // CACHE MISS (expired)
    return null;
  }

  cacheStats.hits++;
  trackCacheOperation(true);  // CACHE HIT
  logger.debug('Cache HIT', {
    key: key.substring(0, 50) + '...',
    age_ms: now - entry.createdAt
  });

  return entry.data;
}

/**
 * Delete cache entry
 */
function deleteCache(key) {
  if (cacheStore[key]) {
    delete cacheStore[key];
    cacheStats.deletes++;
  }
}

/**
 * Clear cache matching pattern
 */
function clearCachePattern(pattern) {
  let cleared = 0;
  const regex = new RegExp(pattern);

  for (const key in cacheStore) {
    if (regex.test(key)) {
      delete cacheStore[key];
      cleared++;
    }
  }

  cacheStats.deletes += cleared;
  logger.info('Cache clear pattern', { pattern, cleared });

  return cleared;
}

/**
 * Clear all cache (MAINTENANCE)
 */
function clearAllCache() {
  const count = Object.keys(cacheStore).length;
  for (const key in cacheStore) {
    delete cacheStore[key];
  }
  logger.info('Cache cleared', { entries_cleared: count });
  return count;
}

/**
 * MIDDLEWARE: Cache GET requests
 */
function cacheMiddleware(options = {}) {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Check cache
    const cacheKey = getCacheKey(req);
    const cached = getCache(cacheKey);

    if (cached) {
      logger.info('Serving from cache', {
        path: req.path,
        user: req.user?.id || 'anon'
      });

      return res.json(cached);
    }

    // Store original res.json to intercept it
    const originalJson = res.json.bind(res);

    res.json = function(data) {
      // Determine TTL based on endpoint
      let ttl = options.defaultTTL || 300; // 5 minutes default

      if (req.path.includes('/analytics')) ttl = 300; // 5 minutes
      if (req.path.includes('/invoice')) ttl = 600; // 10 minutes
      if (req.path.includes('/shipment')) ttl = 600; // 10 minutes
      if (req.path.includes('/vendor')) ttl = 900; // 15 minutes
      if (req.path.includes('/tables')) ttl = 600; // 10 minutes
      if (req.path.includes('/health')) ttl = 60; // 1 minute

      // Cache the response
      setCache(cacheKey, data, ttl);

      // Add cache headers
      res.set('X-Cache', 'MISS');
      res.set('Cache-Control', `max-age=${ttl}`);

      return originalJson(data);
    };

    next();
  };
}

/**
 * MIDDLEWARE: Invalidate cache on data write operations
 */
function invalidateCacheOnWrite(req, res, next) {
  // Only process POST, PUT, DELETE
  if (!['POST', 'PUT', 'DELETE'].includes(req.method)) {
    return next();
  }

  const originalJson = res.json.bind(res);

  res.json = function(data) {
    // Determine what to invalidate based on path
    if (req.path.includes('/invoice')) {
      clearCachePattern(`.*invoices.*`);
      clearCachePattern(`.*analytics.*`);
    }

    if (req.path.includes('/shipment')) {
      clearCachePattern(`.*shipments.*`);
      clearCachePattern(`.*analytics.*`);
    }

    if (req.path.includes('/vendor')) {
      clearCachePattern(`.*vendors.*`);
    }

    if (req.path.includes('/vehicle')) {
      clearCachePattern(`.*vehicles.*`);
      clearCachePattern(`.*fleet.*`);
    }

    if (req.path.includes('/inventory')) {
      clearCachePattern(`.*inventory.*`);
      clearCachePattern(`.*warehouse.*`);
    }

    logger.info('Cache invalidated on write', {
      method: req.method,
      path: req.path
    });

    return originalJson(data);
  };

  next();
}

/**
 * Get cache statistics
 */
function getCacheStats() {
  const total = cacheStats.hits + cacheStats.misses;
  const hitRate = total > 0 ? ((cacheStats.hits / total) * 100).toFixed(2) : 0;

  return {
    ...cacheStats,
    hit_rate: `${hitRate}%`,
    total_operations: total,
    current_entries: Object.keys(cacheStore).length,
    cache_size_bytes: JSON.stringify(cacheStore).length
  };
}

/**
 * Get detailed cache entries (for debugging)
 */
function getCacheEntries(limit = 10) {
  const entries = [];
  let count = 0;

  for (const key in cacheStore) {
    if (count >= limit) break;

    const entry = cacheStore[key];
    const now = Date.now();
    const ageSeconds = Math.floor((now - entry.createdAt) / 1000);
    const remainingSeconds = Math.floor((entry.expiresAt - now) / 1000);

    entries.push({
      key: key.substring(0, 60) + (key.length > 60 ? '...' : ''),
      created_at: new Date(entry.createdAt).toISOString(),
      age_seconds: ageSeconds,
      ttl: entry.ttl,
      remaining_seconds: remainingSeconds,
      expired: remainingSeconds <= 0
    });

    count++;
  }

  return entries;
}

module.exports = {
  cacheMiddleware,
  invalidateCacheOnWrite,
  getCacheKey,
  setCache,
  getCache,
  deleteCache,
  clearCachePattern,
  clearAllCache,
  getCacheStats,
  getCacheEntries
};
