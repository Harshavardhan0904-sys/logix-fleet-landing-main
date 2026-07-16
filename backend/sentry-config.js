// ─────────────────────────────────────────────────────────────
// Sentry Error Tracking Configuration
// Captures and reports application errors in real-time
// ─────────────────────────────────────────────────────────────

let Sentry;
try {
  Sentry = require("@sentry/node");
} catch (err) {
  console.warn("⚠️  Sentry not available, error tracking disabled");
  Sentry = null;
}

// Initialize Sentry
function initSentry(app) {
  // Skip if Sentry not available or no DSN configured
  if (!Sentry || !process.env.SENTRY_DSN) {
    console.log("ℹ️  Sentry disabled (no DSN configured)");
    return { init: () => {} };
  }

  try {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || "development",
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Sentry.Integrations.OnUncaughtException(),
        new Sentry.Integrations.OnUnhandledRejection()
      ],
      tracesSampleRate: process.env.NODE_ENV === "production" ? 0.5 : 1.0,
      maxBreadcrumbs: 50,
      attachStacktrace: true,
      maxValueLength: 1024,
      beforeSend(event, hint) {
        // Filter out spam or internal errors
        if (event.exception) {
          const error = hint.originalException;
          
          // Skip Health check errors
          if (error?.message?.includes("health")) {
            return null;
          }
          
          // Skip ECONNREFUSED for now (common in dev)
          if (error?.code === "ECONNREFUSED" && process.env.NODE_ENV === "development") {
            return null;
          }
        }
        return event;
      }
    });

    // Request handler must be the first middleware
    app.use(Sentry.Handlers.requestHandler());
    
    // Tracing middleware
    app.use(Sentry.Handlers.tracingHandler());

    console.log("✅ Sentry initialized");
    return Sentry;
  } catch (err) {
    console.warn("⚠️  Failed to initialize Sentry:", err.message);
    return null;
  }
}

// Setup error handler (should be last middleware)
function setupErrorHandler(app) {
  if (Sentry && Sentry.Handlers) {
    app.use(Sentry.Handlers.errorHandler());
  }
}

// Capture exception with context
function captureException(error, context = {}) {
  if (Sentry && Sentry.captureException) {
    Sentry.captureException(error, {
      contexts: {
        operation: context
      }
    });
  }
}

// Capture message for non-exception events
function captureMessage(message, level = "info", context = {}) {
  if (Sentry && Sentry.captureMessage) {
    Sentry.captureMessage(message, {
      level: level,
      contexts: {
        operation: context
      }
    });
  }
}

// Add breadcrumb for tracking user actions
function addBreadcrumb(category, message, data = {}, level = "info") {
  if (Sentry && Sentry.addBreadcrumb) {
    Sentry.addBreadcrumb({
      category: category,
      message: message,
      data: data,
      level: level,
      timestamp: Date.now() / 1000
    });
  }
}

// Set user context
function setUserContext(userId, email = "", username = "") {
  if (Sentry && Sentry.setUser) {
    Sentry.setUser({
      id: userId,
      email: email,
      username: username
    });
  }
}

// Clear user context
function clearUserContext() {
  if (Sentry && Sentry.setUser) {
    Sentry.setUser(null);
  }
}

// Set custom tags
function setTag(key, value) {
  if (Sentry && Sentry.setTag) {
    Sentry.setTag(key, value);
  }
}

// Set multiple tags
function setTags(tags) {
  if (Sentry && Sentry.setTag) {
    Object.entries(tags).forEach(([key, value]) => {
      Sentry.setTag(key, value);
    });
  }
}

// For OCR-specific errors
function logOCRError(invoiceId, error, details = {}) {
  if (Sentry && Sentry.captureException) {
    Sentry.captureException(error, {
      tags: {
        section: 'ocr_processing',
        invoiceId: invoiceId
      },
      contexts: {
        ocr: {
          ...details
        }
      }
    });
  }
}

// For database errors
function logDatabaseError(operation, error, query = "") {
  Sentry.captureException(error, {
    tags: {
      section: 'database',
      operation: operation
    },
    contexts: {
      database: {
        operation: operation,
        query: query.substring(0, 500) // Limit query length
      }
    }
  });
}

// For API errors
function logAPIError(method, path, status, error) {
  Sentry.captureException(error, {
    tags: {
      section: 'api',
      method: method,
      status: status,
      path: path
    }
  });
}

module.exports = {
  initSentry,
  setupErrorHandler,
  captureException,
  captureMessage,
  addBreadcrumb,
  setUserContext,
  clearUserContext,
  setTag,
  setTags,
  logOCRError,
  logDatabaseError,
  logAPIError,
  Sentry
};
