// backend/monitoring/service-monitoring.js
/**
 * SERVICE-SPECIFIC MONITORING
 * Monitors health and performance of:
 * - WhatsApp API
 * - OCR Processing
 * - Email Delivery
 * - Google Sheets Integration
 */

class ServiceMonitor {
  constructor(serviceName, options = {}) {
    this.name = serviceName;
    this.logger = options.logger;
    this.alertEngine = options.alertEngine;
    
    this.metrics = {
      calls: 0,
      success: 0,
      failures: 0,
      avgResponseTime: 0,
      lastError: null,
      lastErrorTime: null,
      status: 'HEALTHY'
    };
    
    this.responseTimes = [];
    this.maxSamples = 100;
  }
  
  recordCall(success, duration, error = null) {
    this.metrics.calls++;
    
    if (success) {
      this.metrics.success++;
    } else {
      this.metrics.failures++;
      this.metrics.lastError = error?.message || 'Unknown error';
      this.metrics.lastErrorTime = new Date().toISOString();
      
      // Trigger alert on repeated failures
      const errorRate = (this.metrics.failures / this.metrics.calls) * 100;
      if (errorRate > 10) {
        const alert = {
          severity: errorRate > 25 ? 'CRITICAL' : 'WARNING',
          message: `${this.name} error rate high: ${errorRate.toFixed(1)}%`,
          errorRate,
          recentErrors: this.metrics.failures
        };
        this.alertEngine?.evaluateMetric(`${this.name}_error_rate`, errorRate);
      }
    }
    
    // Track response time
    if (duration > 0) {
      this.responseTimes.push(duration);
      if (this.responseTimes.length > this.maxSamples) {
        this.responseTimes.shift();
      }
      this.metrics.avgResponseTime = 
        this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;
    }
    
    // Update status
    this.updateStatus();
  }
  
  updateStatus() {
    const errorRate = (this.metrics.failures / Math.max(this.metrics.calls, 1)) * 100;
    
    if (errorRate > 25) {
      this.metrics.status = 'CRITICAL';
    } else if (errorRate > 10) {
      this.metrics.status = 'WARNING';
    } else if (this.metrics.calls === 0) {
      this.metrics.status = 'IDLE';
    } else {
      this.metrics.status = 'HEALTHY';
    }
  }
  
  getMetrics() {
    return {
      ...this.metrics,
      errorRate: ((this.metrics.failures / Math.max(this.metrics.calls, 1)) * 100).toFixed(2),
      successRate: ((this.metrics.success / Math.max(this.metrics.calls, 1)) * 100).toFixed(2),
      p95ResponseTime: this.getPercentile(95),
      p99ResponseTime: this.getPercentile(99)
    };
  }
  
  getPercentile(p) {
    if (this.responseTimes.length === 0) return 0;
    const sorted = [...this.responseTimes].sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * (p / 100)) - 1;
    return sorted[Math.max(0, index)];
  }
}

// ─────────────────────────────────────────────────────────
// SERVICE-SPECIFIC WRAPPERS
// ─────────────────────────────────────────────────────────

const initServiceMonitoring = ({ whatsappService, emailService, googleSheetsService, logger, alertEngine }) => {
  
  // Initialize monitors
  const monitors = {
    whatsapp: new ServiceMonitor('WhatsApp', { logger, alertEngine }),
    email: new ServiceMonitor('Email', { logger, alertEngine }),
    googleSheets: new ServiceMonitor('GoogleSheets', { logger, alertEngine }),
    ocr: new ServiceMonitor('OCR', { logger, alertEngine })
  };
  
  // ─── WhatsApp Monitoring ───
  if (whatsappService && whatsappService.sendMessage) {
    const originalSendMessage = whatsappService.sendMessage;
    whatsappService.sendMessage = async function(...args) {
      const startTime = Date.now();
      try {
        const result = await originalSendMessage.apply(this, args);
        monitors.whatsapp.recordCall(true, Date.now() - startTime);
        return result;
      } catch (error) {
        monitors.whatsapp.recordCall(false, Date.now() - startTime, error);
        throw error;
      }
    };
  }
  
  // ─── Email Monitoring ───
  if (emailService && emailService.sendEmail) {
    const originalSendEmail = emailService.sendEmail;
    emailService.sendEmail = async function(...args) {
      const startTime = Date.now();
      try {
        const result = await originalSendEmail.apply(this, args);
        monitors.email.recordCall(true, Date.now() - startTime);
        return result;
      } catch (error) {
        monitors.email.recordCall(false, Date.now() - startTime, error);
        throw error;
      }
    };
  }
  
  // ─── Google Sheets Monitoring ───
  if (googleSheetsService) {
    // Monitor appendRow
    if (googleSheetsService.appendRow) {
      const originalAppendRow = googleSheetsService.appendRow;
      googleSheetsService.appendRow = async function(...args) {
        const startTime = Date.now();
        try {
          const result = await originalAppendRow.apply(this, args);
          monitors.googleSheets.recordCall(true, Date.now() - startTime);
          return result;
        } catch (error) {
          monitors.googleSheets.recordCall(false, Date.now() - startTime, error);
          throw error;
        }
      };
    }
  }
  
  logger?.info('Service monitoring initialized', {
    services: Object.keys(monitors)
  });
  
  return {
    monitors,
    getServiceMetrics: (serviceName) => {
      const monitor = monitors[serviceName.toLowerCase()];
      return monitor ? monitor.getMetrics() : null;
    },
    getAllServiceMetrics: () => {
      const result = {};
      for (const [name, monitor] of Object.entries(monitors)) {
        result[name] = monitor.getMetrics();
      }
      return result;
    },
    whatsappStatus: () => monitors.whatsapp.getMetrics(),
    emailStatus: () => monitors.email.getMetrics(),
    googleSheetsStatus: () => monitors.googleSheets.getMetrics(),
    ocrStatus: () => monitors.ocr.getMetrics()
  };
};

// ─────────────────────────────────────────────────────────
// MONITORING DASHBOARD DATA
// ─────────────────────────────────────────────────────────

const getServiceMonitoringData = (monitoring) => {
  return {
    timestamp: new Date().toISOString(),
    services: monitoring.getAllServiceMetrics(),
    summary: {
      allHealthy: Object.values(monitoring.monitors).every(m => m.metrics.status === 'HEALTHY' || m.metrics.status === 'IDLE'),
      criticalServices: Object.entries(monitoring.monitors)
        .filter(([_, m]) => m.metrics.status === 'CRITICAL')
        .map(([name, m]) => ({
          service: name,
          status: m.metrics.status,
          errorRate: ((m.metrics.failures / Math.max(m.metrics.calls, 1)) * 100).toFixed(2)
        }))
    }
  };
};

module.exports = {
  ServiceMonitor,
  initServiceMonitoring,
  getServiceMonitoringData
};
