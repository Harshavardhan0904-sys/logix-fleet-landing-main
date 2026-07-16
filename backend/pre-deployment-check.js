#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('\n🚀 PRE-DEPLOYMENT CHECKLIST\n');
console.log('═══════════════════════════════════════════════════════\n');

let checksPass = 0;
let checksFail = 0;

function check(name, condition, details = '') {
  if (condition) {
    console.log(`✅ ${name}`);
    if (details) console.log(`   └─ ${details}`);
    checksPass++;
  } else {
    console.log(`❌ ${name}`);
    if (details) console.log(`   └─ ${details}`);
    checksFail++;
  }
}

// Get paths
const basePath = path.join(__dirname, '..');
const backendPath = path.join(basePath, 'backend');
const frontendPath = path.join(basePath);

// Check 1: Backend files exist
check(
  'Backend structure',
  fs.existsSync(path.join(backendPath, 'server.js')) &&
  fs.existsSync(path.join(backendPath, 'package.json')) &&
  fs.existsSync(path.join(backendPath, 'emailService.js')),
  'server.js, package.json, emailService.js present'
);

// Check 2: Frontend files exist
check(
  'Frontend structure',
  fs.existsSync(path.join(frontendPath, 'index.html')) &&
  fs.existsSync(path.join(frontendPath, 'js')),
  'index.html and js/ directory present'
);

// Check 3: Environment config
const envPath = path.join(backendPath, '.env');
const envExamplePath = path.join(backendPath, '.env.example');
check(
  'Environment files',
  fs.existsSync(envPath) || fs.existsSync(envExamplePath),
  '.env or .env.example configured'
);

// Check 4: Dependencies
const packageJsonPath = path.join(backendPath, 'package.json');
let hasDeps = false;
if (fs.existsSync(packageJsonPath)) {
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  hasDeps = pkg.dependencies && Object.keys(pkg.dependencies).length > 0;
}
check(
  'Package dependencies',
  hasDeps,
  'package.json has required dependencies'
);

// Check 5: Git repository
check(
  'Git repository',
  fs.existsSync(path.join(basePath, '.git')),
  'Project initialized with git'
);

// Check 6: README exists
check(
  'Documentation',
  fs.existsSync(path.join(basePath, 'README.md')) ||
  fs.existsSync(path.join(basePath, 'DEPLOYMENT_STEPS_RENDER_NETLIFY.md')),
  'Deployment guide present'
);

// Check 7: API configuration
let apiConfigured = false;
try {
  const settingsPath = path.join(frontendPath, 'js', 'pages', 'settings.js');
  if (fs.existsSync(settingsPath)) {
    const content = fs.readFileSync(settingsPath, 'utf8');
    apiConfigured = content.includes('API_URL') || content.includes('fetch');
  }
} catch (e) {}
check(
  'API endpoints configured',
  apiConfigured,
  'Frontend has API integration'
);

// Check 8: Email service
let emailConfigured = false;
try {
  const emailPath = path.join(backendPath, 'emailService.js');
  if (fs.existsSync(emailPath)) {
    const content = fs.readFileSync(emailPath, 'utf8');
    emailConfigured = content.includes('sendInviteEmail');
  }
} catch (e) {}
check(
  'Email service implemented',
  emailConfigured,
  'sendInviteEmail() function present'
);

// Check 9: Authentication
let authConfigured = false;
try {
  const serverPath = path.join(backendPath, 'server.js');
  if (fs.existsSync(serverPath)) {
    const content = fs.readFileSync(serverPath, 'utf8');
    authConfigured = content.includes('/auth/') && (content.includes('authenticateToken') || content.includes('token'));
  }
} catch (e) {}
check(
  'Authentication implemented',
  authConfigured,
  'Auth routes and token handling present'
);

// Check 10: Database connection
let dbConfigured = false;
try {
  const serverPath = path.join(backendPath, 'server.js');
  if (fs.existsSync(serverPath)) {
    const content = fs.readFileSync(serverPath, 'utf8');
    dbConfigured = content.includes('mongodb') || content.includes('mongoose');
  }
} catch (e) {}
check(
  'Database configured',
  dbConfigured,
  'MongoDB/Mongoose connection present'
);

console.log('\n═══════════════════════════════════════════════════════\n');
console.log(`📊 SUMMARY: ${checksPass} passed, ${checksFail} failed\n`);

if (checksFail === 0) {
  console.log('✅ ✅ ✅ ALL CHECKS PASSED - READY FOR DEPLOYMENT ✅ ✅ ✅\n');
  process.exit(0);
} else {
  console.log(`⚠️  ${checksFail} check(s) failed - review above\n`);
  process.exit(1);
}
