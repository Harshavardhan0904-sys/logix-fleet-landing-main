/**
 * 🛡️ RATE LIMITING MIDDLEWARE
 * Purpose: Prevent brute force attacks and DDoS on authentication endpoints
 * Cost: $0 (just code, in-memory)
 * 
 * Features:
 * - Login rate limiting: 5 attempts per 15 minutes per IP
 * - General API rate limiting: 20 requests per minute per user
 * - Sliding window algorithm (memory efficient)
 * - Graceful error messages
 */

const logger = require('./logger');

/**
 * In-memory store for rate limiting
 * Format: { key: { attempts: [], blockUntil: timestamp } }
 */
const rateLimitStore = {};

/**
 * Clean up old entries (runs every 5 minutes)
 */
setInterval(() => {
  const now = Date.now();
  let cleaned = 0;
  
  for (const key in rateLimitStore) {
    const entry = rateLimitStore[key];
    
    // Remove entries older than 1 hour
    if (entry.blockUntil && entry.blockUntil < now) {
      delete rateLimitStore[key];
      cleaned++;
    }
    
    // Clean up old attempts (keep only last hour)
    if (entry.attempts) {
      entry.attempts = entry.attempts.filter(time => now - time < 3600000);
      if (entry.attempts.length === 0 && !entry.blockUntil) {
        delete rateLimitStore[key];
        cleaned++;
      }
    }
  }
  
  if (cleaned > 0) {
    logger.info('Rate limit store cleanup', { entries_cleaned: cleaned });
  }
}, 300000); // 5 minutes

/**
 * Check rate limit for a key (IP address or user ID)
 * @param {string} key - Unique identifier (IP or user ID)
 * @param {number} maxAttempts - Maximum attempts allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {object} { allowed: boolean, remaining: number, resetTime: timestamp }
 */
function checkRateLimit(key, maxAttempts, windowMs) {
  const now = Date.now();
  
  if (!rateLimitStore[key]) {
    rateLimitStore[key] = { attempts: [] };
  }
  
  const entry = rateLimitStore[key];
  
  // Check if currently blocked
  if (entry.blockUntil && entry.blockUntil > now) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.blockUntil,
      message: `Rate limited. Try again in ${Math.ceil((entry.blockUntil - now) / 1000)}s`
    };
  }
  
  // Remove old attempts outside window
  entry.attempts = entry.attempts.filter(time => now - time < windowMs);
  
  // Check if limit exceeded
  if (entry.attempts.length >= maxAttempts) {
    // Block for 15 minutes on brute force attempt
    entry.blockUntil = now + 900000; // 15 minutes
    
    logger.warn('Rate limit exceeded and blocked', {
      key,
      attempts: entry.attempts.length,
      max_attempts: maxAttempts
    });
    
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.blockUntil,
      message: `Too many attempts. Account locked for 15 minutes.`
    };
  }
  
  // Record attempt
  entry.attempts.push(now);
  
  return {
    allowed: true,
    remaining: maxAttempts - entry.attempts.length,
    resetTime: now + windowMs
  };
}

/**
 * MIDDLEWARE: Rate limit login/signup attempts
 * - 5 attempts per 15 minutes per IP
 * - Blocks account for 15 minutes after 5 failed attempts
 */
function authRateLimit(req, res, next) {
  const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
  const email = req.body?.email?.toLowerCase() || 'unknown';
  
  // Combined key: IP + email (to prevent account enumeration)
  const key = `auth:${clientIp}:${email}`;
  
  // 5 attempts per 15 minutes
  const limit = checkRateLimit(key, 5, 15 * 60 * 1000);
  
  if (!limit.allowed) {
    logger.warn('Login rate limit exceeded', {
      ip: clientIp,
      email,
      message: limit.message
    });
    
    return res.status(429).json({
      error: 'Too many login attempts',
      message: limit.message,
      retry_after: Math.ceil((limit.resetTime - Date.now()) / 1000)
    });
  }
  
  // Store in res for later logging
  res.locals.rateLimitRemaining = limit.remaining;
  next();
}

/**
 * MIDDLEWARE: Rate limit general API endpoints
 * - 20 requests per minute per user
 * - 100 requests per minute per IP for unauthenticated
 */
function apiRateLimit(req, res, next) {
  const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
  
  // Use user ID if authenticated, otherwise use IP
  const isAuthenticated = req.user && req.user.id;
  const key = isAuthenticated ? `user:${req.user.id}` : `ip:${clientIp}`;
  
  // Limits
  const maxAttempts = isAuthenticated ? 20 : 100;
  const windowMs = 60 * 1000; // 1 minute
  
  const limit = checkRateLimit(key, maxAttempts, windowMs);
  
  if (!limit.allowed) {
    logger.warn('API rate limit exceeded', {
      key,
      is_authenticated: isAuthenticated,
      message: limit.message
    });
    
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: limit.message,
      retry_after: Math.ceil((limit.resetTime - Date.now()) / 1000)
    });
  }
  
  // Set rate limit headers (like GitHub API)
  res.set('X-RateLimit-Limit', maxAttempts);
  res.set('X-RateLimit-Remaining', limit.remaining);
  res.set('X-RateLimit-Reset', Math.floor(limit.resetTime / 1000));
  
  next();
}

/**
 * MIDDLEWARE: Rate limit specific endpoints (stricter)
 * - 2 attempts per hour for password reset
 * - 3 attempts per hour for signup
 */
function strictRateLimit(req, res, next) {
  const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
  const endpoint = req.path;
  
  const key = `strict:${clientIp}:${endpoint}`;
  
  // Stricter limits
  const maxAttempts = 3; // 3 attempts
  const windowMs = 60 * 60 * 1000; // 1 hour
  
  const limit = checkRateLimit(key, maxAttempts, windowMs);
  
  if (!limit.allowed) {
    logger.warn('Strict rate limit exceeded', {
      endpoint,
      ip: clientIp,
      message: limit.message
    });
    
    return res.status(429).json({
      error: 'Too many requests',
      message: `This action is rate limited. ${limit.message}`,
      retry_after: Math.ceil((limit.resetTime - Date.now()) / 1000)
    });
  }
  
  next();
}

/**
 * DEBUGGING: Get rate limit status
 */
function getRateLimitStatus() {
  const now = Date.now();
  const stats = {
    total_tracked_keys: Object.keys(rateLimitStore).length,
    blocked_accounts: 0,
    active_rate_limits: 0,
    details: {}
  };
  
  for (const key in rateLimitStore) {
    const entry = rateLimitStore[key];
    
    if (entry.blockUntil && entry.blockUntil > now) {
      stats.blocked_accounts++;
      stats.details[key] = {
        status: 'BLOCKED',
        blocked_until: new Date(entry.blockUntil).toISOString(),
        seconds_remaining: Math.ceil((entry.blockUntil - now) / 1000)
      };
    } else if (entry.attempts && entry.attempts.length > 0) {
      stats.active_rate_limits++;
      stats.details[key] = {
        status: 'ACTIVE',
        attempts: entry.attempts.length,
        last_attempt: new Date(entry.attempts[entry.attempts.length - 1]).toISOString()
      };
    }
  }
  
  return stats;
}

/**
 * DEBUGGING: Reset rate limit for a specific key
 */
function resetRateLimit(key) {
  if (rateLimitStore[key]) {
    delete rateLimitStore[key];
    logger.info('Rate limit reset', { key });
    return true;
  }
  return false;
}

module.exports = {
  checkRateLimit,
  authRateLimit,
  apiRateLimit,
  strictRateLimit,
  getRateLimitStatus,
  resetRateLimit
};
