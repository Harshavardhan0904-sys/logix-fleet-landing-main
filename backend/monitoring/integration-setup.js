// backend/monitoring/integration-setup.js
/**
 * MONITORING INTEGRATION HELPER
 * Use this to integrate monitoring into server.js
 * 
 * Copy the code blocks below into your server.js at the specified locations
 */

// ============================================================
// SECTION 1: ADD AFTER EXISTING MIDDLEWARE IMPORTS
// Location: Around line 15, after existing requires
// ============================================================

const codeSection1 = `
// MONITORING MIDDLEWARE (Add this with other monitoring imports)
const { performanceMiddleware } = require('./middleware/performance-monitor');
const { AlertEngine, ALERT_RULES } = require('./monitoring/alerts');
const { initServiceMonitoring } = require('./monitoring/service-monitoring');
`;

// ============================================================
// SECTION 2: ADD AFTER SENTRY INITIALIZATION
// Location: Around line 40, after sentryConfig.initSentry()
// ============================================================

const codeSection2 = `
// ─── INITIALIZE PERFORMANCE MONITORING ──────────────────
const alertEngine = new AlertEngine();

// Subscribe to critical alerts
alertEngine.subscribe('CRITICAL', (alert) => {
  logger.error(\`[CRITICAL ALERT] \${alert.rule}\`, {
    value: alert.actualValue,
    threshold: alert.threshold,
    action: alert.action
  });
  sentryConfig.captureException(new Error(\`Alert: \${alert.rule}\`));
});

// Subscribe to warnings
alertEngine.subscribe('WARNING', (alert) => {
  logger.warn(\`[WARNING ALERT] \${alert.rule}\`, {
    value: alert.actualValue,
    threshold: alert.threshold
  });
});

// Store alert engine for later use
app.locals.alertEngine = alertEngine;
logger.info('Alert engine initialized');
`;

// ============================================================
// SECTION 3: ADD PERFORMANCE MIDDLEWARE
// Location: Around line 42, after app.use(express.urlencoded)
// Add BEFORE all other middleware
// ============================================================

const codeSection3 = `
// ─── PERFORMANCE MONITORING (must come FIRST) ──────────────
app.use(performanceMiddleware);
`;

// ============================================================
// SECTION 4: ADD SERVICE MONITORING
// Location: Around line 50, after rate limiting setup
// ============================================================

const codeSection4 = `
// ─── SERVICE-SPECIFIC MONITORING ──────────────────────────
initServiceMonitoring({
  whatsappService,
  emailService,
  googleSheetsService,
  logger,
  alertEngine
});
logger.info('Service monitoring initialized');
`;

// ============================================================
// SECTION 5: ADD MONITORING ENDPOINTS
// Location: At the end of server.js, before app.listen()
// ============================================================

const codeSection5 = `
// ────────────────────────────────────────────────────────
// MONITORING ENDPOINTS
// ────────────────────────────────────────────────────────

const { getPerformanceMetrics } = require('./middleware/performance-monitor');
const { getCacheMetrics } = require('./middleware/cache-monitor');

// Performance metrics endpoint
app.get('/api/monitoring/performance', (req, res) => {
  res.json(getPerformanceMetrics());
});

// Cache metrics endpoint
app.get('/api/monitoring/cache', (req, res) => {
  res.json(getCacheMetrics());
});

// Alert status endpoint
app.get('/api/monitoring/alerts', (req, res) => {
  res.json({
    active: req.app.locals.alertEngine.getActiveAlerts(),
    rules: ALERT_RULES
  });
});

// Service health endpoint
app.get('/api/monitoring/services', (req, res) => {
  const services = req.app.locals.serviceMonitoring || {};
  res.json({
    timestamp: new Date().toISOString(),
    services: {
      whatsapp: services.whatsappStatus,
      email: services.emailStatus,
      googleSheets: services.googleSheetsStatus,
      ocr: services.ocrStatus
    }
  });
});
`;

// ============================================================
// INTEGRATION SUMMARY
// ============================================================

const integrationSteps = {
  step1: {
    description: "Add monitoring imports",
    location: "After line 15 (after existing monitoring imports)",
    code: codeSection1,
    difficulty: "EASY"
  },
  step2: {
    description: "Initialize alert engine",
    location: "After line 38 (after sentryConfig.initSentry)",
    code: codeSection2,
    difficulty: "EASY"
  },
  step3: {
    description: "Add performance middleware",
    location: "After line 42 (before cache middleware)",
    code: codeSection3,
    difficulty: "EASY"
  },
  step4: {
    description: "Initialize service monitoring",
    location: "After line 50 (after rate limiting)",
    code: codeSection4,
    difficulty: "EASY"
  },
  step5: {
    description: "Add monitoring endpoints",
    location: "Before app.listen() at bottom",
    code: codeSection5,
    difficulty: "EASY"
  }
};

module.exports = {
  integrationSteps,
  codeSection1,
  codeSection2,
  codeSection3,
  codeSection4,
  codeSection5,
  alertEngine: 'Provided via app.locals.alertEngine',
  endpoints: [
    'GET /api/monitoring/performance',
    'GET /api/monitoring/cache',
    'GET /api/monitoring/alerts',
    'GET /api/monitoring/services'
  ]
};
