#!/usr/bin/env node
/**
 * MONITORING DEPLOYMENT VERIFICATION
 * Run this before deploying to production
 * 
 * Usage: node backend/monitoring/pre-deploy-check.js
 */

const fs = require('fs');
const path = require('path');

const CHECKS = {
  PASS: '✅',
  FAIL: '❌',
  WARN: '⚠️'
};

class DeploymentChecker {
  constructor() {
    this.results = [];
    this.passed = 0;
    this.failed = 0;
    this.warnings = 0;
  }
  
  check(name, condition, details = '') {
    const result = {
      name,
      passed: condition,
      details
    };
    this.results.push(result);
    
    if (condition) {
      this.passed++;
      console.log(`${CHECKS.PASS} ${name}`);
    } else {
      this.failed++;
      console.log(`${CHECKS.FAIL} ${name}`);
      if (details) console.log(`    ${details}`);
    }
  }
  
  warn(name, details = '') {
    this.warnings++;
    console.log(`${CHECKS.WARN} ${name}`);
    if (details) console.log(`    ${details}`);
  }
  
  fileExists(filePath, name) {
    const exists = fs.existsSync(filePath);
    this.check(
      `File exists: ${name}`,
      exists,
      !exists ? `Expected at: ${filePath}` : ''
    );
    return exists;
  }
  
  directoryExists(dirPath, name) {
    const exists = fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
    this.check(
      `Directory exists: ${name}`,
      exists,
      !exists ? `Expected at: ${dirPath}` : ''
    );
    return exists;
  }
  
  fileContains(filePath, searchString, name) {
    if (!fs.existsSync(filePath)) {
      this.check(`${name} (file check)`, false, `File not found: ${filePath}`);
      return false;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const contains = content.includes(searchString);
    this.check(
      `${name}`,
      contains,
      !contains ? `Expected to find: "${searchString}"` : ''
    );
    return contains;
  }
  
  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('DEPLOYMENT VERIFICATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${this.passed}`);
    console.log(`❌ Failed: ${this.failed}`);
    console.log(`⚠️  Warnings: ${this.warnings}`);
    console.log('='.repeat(60));
    
    if (this.failed === 0) {
      console.log('\n🟢 READY FOR DEPLOYMENT\n');
      return true;
    } else {
      console.log('\n🔴 NOT READY FOR DEPLOYMENT - Fix issues above\n');
      return false;
    }
  }
}

// ─────────────────────────────────────────────────────────
// RUN ALL CHECKS
// ─────────────────────────────────────────────────────────

async function runDeploymentChecks() {
  const checker = new DeploymentChecker();
  const backendDir = path.join(__dirname, '..');
  
  console.log('\n' + '='.repeat(60));
  console.log('MONITORING DEPLOYMENT VERIFICATION');
  console.log('='.repeat(60) + '\n');
  
  // ─── MONITORING FILES   ───
  console.log('📁 Monitoring Files:');
  checker.fileExists(path.join(backendDir, 'middleware/cache-monitor.js'), 'cache-monitor.js');
  checker.fileExists(path.join(backendDir, 'middleware/performance-monitor.js'), 'performance-monitor.js');
  checker.fileExists(path.join(backendDir, 'monitoring/alerts.js'), 'alerts.js');
  checker.fileExists(path.join(backendDir, 'monitoring/service-monitoring.js'), 'service-monitoring.js');
  checker.fileExists(path.join(backendDir, 'monitoring/config.json'), 'config.json');
  checker.fileExists(path.join(backendDir, 'monitoring/integration-setup.js'), 'integration-setup.js');
  
  // ─── SERVER.JS INTEGRATION ───
  console.log('\n🔗 Server Integration:');
  const serverPath = path.join(backendDir, 'server.js');
  if (fs.existsSync(serverPath)) {
    checker.fileContains(serverPath, 'performanceMiddleware', 'performanceMiddleware imported');
    checker.fileContains(serverPath, 'AlertEngine', 'AlertEngine imported');
    checker.fileContains(serverPath, 'app.use(performanceMiddleware)', 'performanceMiddleware registered');
    checker.fileContains(serverPath, '/api/monitoring/performance', 'performance endpoint defined');
    checker.fileContains(serverPath, '/api/monitoring/cache', 'cache endpoint defined');
    checker.fileContains(serverPath, '/api/monitoring/alerts', 'alerts endpoint defined');
  }
  
  // ─── CACHE TRACKING ───
  console.log('\n📊 Cache Integration:');
  const filesWithCache = [
    path.join(backendDir, 'response-cache.js'),
    path.join(backendDir, 'routes/invoices.js'),
    path.join(backendDir, 'routes/auth.js')
  ];
  
  let cacheTracked = false;
  for (const file of filesWithCache) {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('trackCacheOperation')) {
        cacheTracked = true;
        break;
      }
    }
  }
  checker.check('Cache operations tracked', cacheTracked, 'Add trackCacheOperation() calls around cache.get()');
  
  // ─── DEPENDENCIES ───
  console.log('\n📦 Dependencies:');
  const packagePath = path.join(backendDir, 'package.json');
  if (fs.existsSync(packagePath)) {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    checker.check('Express installed', pkg.dependencies.express !== undefined);
    checker.check('Dotenv installed', pkg.dependencies.dotenv !== undefined);
    checker.check('Mongoose installed', pkg.dependencies.mongoose !== undefined);
  }
  
  // ─── ENVIRONMENT ───
  console.log('\n🔐 Environment Configuration:');
  const envPath = path.join(backendDir, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    checker.check('.env file exists', true);
    checker.warn('MONITORING_ENABLED', 'Set MONITORING_ENABLED=true in production');
  } else {
    checker.warn('.env file', 'Create .env file with environment variables');
  }
  
  // ─── ALERT CONFIGURATION ───
  console.log('\n🚨 Alert Configuration:');
  const configPath = path.join(backendDir, 'monitoring/config.json');
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    checker.check('Monitoring enabled', config.monitoring?.cache?.enabled);
    checker.check('Alerts configured', config.alerts !== undefined);
    
    if (!config.alerts?.channels || config.alerts.channels.length === 0) {
      checker.warn('Alert channels', 'No alert channels configured. Add: email, slack, or sentry');
    }
  }
  
  // ─── PRODUCTION READINESS ───
  console.log('\n🚀 Production Readiness:');
  checker.warn('Rate limiting', 'Verify rate limits in production match your SLA');
  checker.warn('Alert thresholds', 'Test alert thresholds with realistic load');
  checker.warn('Notification channels', 'Verify Slack/Email/Sentry configured');
  
  // ─── PRINT SUMMARY ───
  const ready = checker.printSummary();
  
  return ready ? 0 : 1;
}

// ─────────────────────────────────────────────────────────
// QUICK INTEGRATION CHECKLIST
// ─────────────────────────────────────────────────────────

function printIntegrationChecklist() {
  console.log('\n📋 QUICK INTEGRATION CHECKLIST');
  console.log('='.repeat(60));
  console.log(`
If deployment check failed, complete these steps:

1. ADD IMPORTS to backend/server.js:
   [ ] performanceMiddleware
   [ ] AlertEngine
   [ ] initServiceMonitoring

2. ADD MIDDLEWARE:
   [ ] app.use(performanceMiddleware) - FIRST middleware
   [ ] initServiceMonitoring() - After rate limiting

3. ADD ENDPOINTS:
   [ ] GET /api/monitoring/performance
   [ ] GET /api/monitoring/cache
   [ ] GET /api/monitoring/alerts
   [ ] GET /api/monitoring/services

4. WRAP CACHE CALLS:
   [ ] trackCacheOperation(true/false) in cache.get() wrappers
   [ ] Test at least 5 cache operations

5. TEST LOCALLY:
   [ ] npm start
   [ ] curl http://localhost:5000/api/monitoring/performance
   [ ] Verify metrics return JSON

6. DEPLOY:
   [ ] Commit to git
   [ ] Push to main
   [ ] Verify endpoints work in production
   [ ] Check dashboard loads

Run this check again after fixing issues!
`);
}

// ─────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────

if (require.main === module) {
  runDeploymentChecks().then(exitCode => {
    printIntegrationChecklist();
    process.exit(exitCode);
  }).catch(error => {
    console.error('Error running deployment check:', error);
    process.exit(1);
  });
}

module.exports = { DeploymentChecker, runDeploymentChecks };
