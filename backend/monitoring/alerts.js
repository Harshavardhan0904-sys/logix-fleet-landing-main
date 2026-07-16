// backend/monitoring/alerts.js
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
