#!/usr/bin/env python3
"""
Monitoring Setup & Automation Script for Logix System
Usage: python setup_monitoring.py [--setup-cache] [--setup-response-time] [--setup-alerts] [--all]
"""

import json
import os
from datetime import datetime
from pathlib import Path

class MonitoringSetup:
    def __init__(self):
        self.project_root = Path(__file__).parent
        self.backend_dir = self.project_root / "backend"
        self.monitoring_dir = self.project_root / "monitoring"
        self.monitoring_dir.mkdir(exist_ok=True)
        
    def setup_cache_monitor(self):
        """Create cache monitoring middleware"""
        cache_monitor_code = '''// backend/middleware/cache-monitor.js
const redis = require('redis');

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
'''
        
        output_path = self.backend_dir / "middleware" / "cache-monitor.js"
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, 'w') as f:
            f.write(cache_monitor_code)
        print(f"✓ Created: {output_path}")
        
    def setup_response_time_monitor(self):
        """Create response time monitoring middleware"""
        response_time_code = '''// backend/middleware/performance-monitor.js
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
'''
        
        output_path = self.backend_dir / "middleware" / "performance-monitor.js"
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, 'w') as f:
            f.write(response_time_code)
        print(f"✓ Created: {output_path}")
        
    def setup_alert_engine(self):
        """Create alert rule engine"""
        alert_code = '''// backend/monitoring/alerts.js
const ALERT_RULES = {
  CACHE_DEGRADATION: {
    threshold: 50,
    metric: 'cacheHitRate',
    severity: 'CRITICAL',
    action: 'CHECK_EVICTION_POLICY'
  },
  SLOW_RESPONSE: {
    threshold: 2000, // ms
    metric: 'responseTimeP95',
    severity: 'WARNING',
    action: 'SCALE_API'
  },
  HIGH_ERROR_RATE: {
    threshold: 5, // percent
    metric: 'errorRate',
    severity: 'CRITICAL',
    action: 'INVESTIGATE_LOGS'
  },
  RATE_LIMIT_SPIKE: {
    threshold: 500, // events/hour
    metric: 'rateLimitEvents',
    severity: 'WARNING',
    action: 'CHECK_DDOS'
  }
};

class AlertEngine {
  constructor() {
    this.alerts = [];
    this.subscriptions = new Map();
    this.alertHistory = [];
  }
  
  evaluateMetric(metricName, value) {
    for (const [ruleName, rule] of Object.entries(ALERT_RULES)) {
      if (rule.metric === metricName && value >= rule.threshold) {
        this.triggerAlert(ruleName, rule, value);
      }
    }
  }
  
  triggerAlert(ruleName, rule, value) {
    const alert = {
      id: `${ruleName}-${Date.now()}`,
      rule: ruleName,
      severity: rule.severity,
      threshold: rule.threshold,
      actualValue: value,
      timestamp: new Date().toISOString(),
      action: rule.action,
      status: 'ACTIVE'
    };
    
    this.alerts.push(alert);
    this.alertHistory.push(alert);
    
    // Notify subscribers
    const subscribers = this.subscriptions.get(rule.severity) || [];
    subscribers.forEach(fn => fn(alert));
    
    console.log(`[ALERT] ${alert.severity}: ${ruleName} - Value: ${value}`);
  }
  
  subscribe(severity, callback) {
    if (!this.subscriptions.has(severity)) {
      this.subscriptions.set(severity, []);
    }
    this.subscriptions.get(severity).push(callback);
  }
  
  getActiveAlerts() {
    return this.alerts.filter(a => a.status === 'ACTIVE');
  }
  
  resolveAlert(alertId) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.status = 'RESOLVED';
      alert.resolvedAt = new Date().toISOString();
    }
  }
}

module.exports = {
  AlertEngine,
  ALERT_RULES
};
'''
        
        output_path = self.backend_dir / "monitoring" / "alerts.js"
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, 'w') as f:
            f.write(alert_code)
        print(f"✓ Created: {output_path}")
        
    def setup_monitoring_config(self):
        """Create monitoring configuration"""
        config = {
            "version": "1.0",
            "createdAt": datetime.now().isoformat(),
            "monitoring": {
                "cache": {
                    "enabled": True,
                    "sampleInterval": 10,
                    "thresholds": {
                        "critical": 50,
                        "warning": 75,
                        "healthy": 85
                    },
                    "alerting": True
                },
                "performance": {
                    "enabled": True,
                    "trackByEndpoint": True,
                    "percentiles": [50, 95, 99],
                    "thresholds": {
                        "p95": 300,
                        "p99": 1000
                    }
                },
                "rateLimit": {
                    "enabled": True,
                    "trackingGranularity": "endpoint",
                    "alertThreshold": 500  # events per hour
                },
                "database": {
                    "enabled": True,
                    "slowQueryThreshold": 100,  # ms
                    "logAllQueries": False
                }
            },
            "alerts": {
                "channels": ["console", "email", "slack"],
                "severityLevels": ["INFO", "WARNING", "CRITICAL"],
                "retentionDays": 30
            },
            "reporting": {
                "dailyReports": True,
                "weeklyAnalysis": True,
                "recipients": []
            }
        }
        
        config_path = self.monitoring_dir / "config.json"
        with open(config_path, 'w') as f:
            json.dump(config, f, indent=2)
        print(f"✓ Created: {config_path}")
        
    def setup_all(self):
        """Run all setup tasks"""
        print("\\n" + "="*60)
        print("LOGIX MONITORING SYSTEM SETUP")
        print("="*60 + "\\n")
        
        print("Setting up monitoring components...\\n")
        self.setup_cache_monitor()
        self.setup_response_time_monitor()
        self.setup_alert_engine()
        self.setup_monitoring_config()
        
        print("\\n" + "="*60)
        print("✓ SETUP COMPLETE")
        print("="*60)
        print("""
Next Steps:
1. Review created files in backend/middleware/ and backend/monitoring/
2. Integrate middleware into your Express app:
   - app.use(performanceMiddleware)
   - Wrap cache calls with trackCacheOperation()
3. Subscribe to alerts:
   - alertEngine.subscribe('CRITICAL', handleCriticalAlert)
4. Configure alert destinations (email, Slack, PagerDuty)
5. Deploy and test with: npm test
        """)

if __name__ == "__main__":
    setup = MonitoringSetup()
    setup.setup_all()
