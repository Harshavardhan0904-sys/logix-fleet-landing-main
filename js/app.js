// ============================================================
// Aetra — App Bootstrap, Loading Screen & UX Utilities
// ============================================================

(function() {
  'use strict';

  // ── Loading Animation ──────────────────────────────────────
  let loadPct = 0;
  const loadSteps = [
    { pct: 20, text: 'Loading Aetra...', delay: 100 },
    { pct: 40, text: 'Connecting to API...', delay: 300 },
    { pct: 60, text: 'Verifying session...', delay: 500 },
    { pct: 80, text: 'Loading modules...', delay: 700 },
    { pct: 100, text: 'Ready!', delay: 900 }
  ];

  function animateLoader() {
    const bar = document.getElementById('loadBar');
    const text = document.getElementById('loadText');
    if (!bar) return;
    loadSteps.forEach(step => {
      setTimeout(() => {
        if (bar) bar.style.width = step.pct + '%';
        if (text) text.textContent = step.text;
      }, step.delay);
    });
    setTimeout(() => {
      const loader = document.getElementById('initLoader');
      if (loader) {
        loader.style.opacity = '0';
        loader.style.transition = 'opacity .4s ease';
        setTimeout(() => { if (loader.parentNode) loader.parentNode.removeChild(loader); }, 400);
      }
    }, 1100);
  }

  // ── DOM Ready ──────────────────────────────────────────────
  let initializeAttempts = 0;
  const createAppShellFallback = () => {
    const body = document.body || document.documentElement;
    if (!body) {
      console.error('❌ CRITICAL: document.body unavailable');
      return null;
    }

    if (window.DEBUG_MODE) console.log('🔧 Creating app shell fallback');

    const fallback = document.createElement('div');
    fallback.id = 'app';
    fallback.innerHTML = `
      <div id="initLoader" style="position:fixed;inset:0;background:linear-gradient(135deg,#0f1f33,#1e3a5f);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999">
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:32px">
          <div style="width:56px;height:56px;background:rgba(249,115,22,.15);border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:32px;border:1px solid rgba(249,115,22,.3)">🚛</div>
          <div>
            <div style="font-size:28px;font-weight:800;color:#fff;letter-spacing:-0.5px">Aetra</div>
            <div style="font-size:13px;color:rgba(255,255,255,.5);margin-top:2px">Enterprise Invoice Automation</div>
          </div>
        </div>
        <div style="width:200px;height:3px;background:rgba(255,255,255,.1);border-radius:999px;overflow:hidden;margin-bottom:16px">
          <div id="loadBar" style="height:100%;background:linear-gradient(90deg,#f97316,#fb923c);border-radius:999px;width:0%;transition:width .3s ease"></div>
        </div>
        <div id="loadText" style="font-size:13px;color:rgba(255,255,255,.4)">Initializing...</div>
      </div>
    `;
    body.appendChild(fallback);
    if (window.DEBUG_MODE) console.log('🔧 App shell appended to', body.tagName);
    return fallback;
  };

  const initializeApp = () => {
    initializeAttempts += 1;
    if (window.DEBUG_MODE) console.log('🔧 App init attempt #', initializeAttempts);
    let appEl = document.getElementById('app');
    if (!appEl) {
      if (window.DEBUG_MODE) console.log('📋 Creating fallback app shell...');
      appEl = createAppShellFallback();
    }

    if (!appEl) {
      console.error('❌ CRITICAL: Unable to acquire or create #app root');
      if (initializeAttempts < 20) {
        setTimeout(initializeApp, 100);
      } else {
        console.error('💥 Failed to initialize app after 20 retries');
      }
      return;
    }

    if (window.DEBUG_MODE) console.log('✅ #app ready');
    animateLoader();

    setTimeout(() => {
      console.log('📍 Initializing router...');
      try {
        Router.init();
        
        // Wrap Router.navigate to auto-log page navigation (after Router loads)
        if (typeof Audit !== 'undefined') {
          const origRouterNavigate = Router.navigate.bind(Router);
          Router.navigate = function(page) {
            Audit.logNavigation(page);
            return origRouterNavigate(page);
          };
        }
      } catch (e) {
        console.error('💥 Router init failed:', e);
      }
    }, 200);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
  } else {
    initializeApp();
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl+K — Global search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      if (Session.isLoggedIn()) openGlobalSearch();
    }
    // Escape — Close modal
    if (e.key === 'Escape') closeModal();
    // Ctrl+1-7 — Navigate
    if ((e.ctrlKey || e.metaKey) && !isNaN(parseInt(e.key))) {
      const pages = ['dashboard','invoices','gst','payments','vendors','reports','settings'];
      const page = pages[parseInt(e.key) - 1];
      if (page && Session.isLoggedIn()) {
        e.preventDefault();
        Router.navigate(page);
      }
    }
  });

  // Resize handler — re-render charts
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const page = Router.currentPage;
      if (page && Pages[page] && Session.isLoggedIn()) {
        const content = document.getElementById('pageContent');
        if (content) Pages[page](content);
      }
      // Handle mobile sidebar
      if (window.innerWidth > 900) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) { sidebar.classList.remove('open'); }
      }
    }, 350);
  });

  // Close dropdowns & mobile sidebar on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#exportDropdown')) {
      document.getElementById('exportMenu')?.classList.add('hidden');
      document.getElementById('repExportMenu')?.classList.add('hidden');
    }
    // Close mobile sidebar on outside click
    const sidebar = document.getElementById('sidebar');
    if (sidebar?.classList.contains('open') && !e.target.closest('#sidebar') && !e.target.closest('#menuToggle')) {
      sidebar.classList.remove('open');
    }
  });

  // Touch gestures for sidebar on mobile
  let touchStartX = 0;
  document.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', (e) => {
    const delta = e.changedTouches[0].clientX - touchStartX;
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    if (delta > 60 && touchStartX < 30) sidebar.classList.add('open');
    if (delta < -60 && sidebar.classList.contains('open')) sidebar.classList.remove('open');
  }, { passive: true });

  // ── Real-time Updates ──────────────────────────────────────
  // Pulse notifications every 60s
  let notifInterval = null;
  function startNotifPulse() {
    if (notifInterval) return;
    notifInterval = setInterval(() => {
      const dot = document.getElementById('notifDot');
      if (dot) {
        dot.style.display = 'block';
        dot.style.animation = 'pulse 1s ease-in-out 3';
      }
    }, 60000);
  }

  // Watch for login state changes
  setInterval(() => {
    if (Session.isLoggedIn() && !notifInterval) startNotifPulse();
    else if (!Session.isLoggedIn() && notifInterval) {
      clearInterval(notifInterval);
      notifInterval = null;
    }
  }, 5000);

  // ── Debounce Utility ────────────────────────────────────────
  window.debounce = function(fn, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };

  // ── Format Helpers (global) ─────────────────────────────────
  window.fmtINR = (n) => {
    if (!n) return '₹0';
    if (n >= 10000000) return '₹' + (n / 10000000).toFixed(1) + ' Cr';
    if (n >= 100000) return '₹' + (n / 100000).toFixed(1) + 'L';
    if (n >= 1000) return '₹' + (n / 1000).toFixed(0) + 'K';
    return '₹' + Math.round(n).toLocaleString('en-IN');
  };

  // ── Network Status ──────────────────────────────────────────
  window.addEventListener('offline', () => {
    showToast('⚠️ You are offline — some features may not work', 'warning');
  });
  window.addEventListener('online', () => {
    showToast('✅ Back online — data will sync automatically', 'success');
  });

  // ── Onboarding Tooltip (first login) ───────────────────────
  function showOnboarding() {
    const user = Session.get();
    if (!user || user.onboarded) return;
    setTimeout(() => {
      openModal(`
        <div class="modal" style="max-width:480px">
          <div class="modal-header" style="background:linear-gradient(135deg,#0f1f33,#1e3a5f);border-radius:16px 16px 0 0">
            <div>
              <div class="modal-title" style="color:#fff;font-size:18px">🚀 Welcome to Aetra!</div>
              <div style="font-size:13px;color:rgba(255,255,255,.5);margin-top:2px">Let's set up your workspace</div>
            </div>
            <button class="modal-close" onclick="closeOnboarding()" style="background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.2);color:#fff">✕</button>
          </div>
          <div class="modal-body">
            <div style="text-align:center;margin-bottom:20px">
              <div style="font-size:48px;margin-bottom:10px">👋</div>
              <div style="font-size:16px;font-weight:700">Hi ${user.name?.split(' ')[0] || 'there'}! Ready to automate your freight invoices?</div>
            </div>
            <div style="display:grid;gap:12px;margin-bottom:20px">
              ${[
                { icon:'📥', step:'1', title:'Upload your first invoice', desc:'Go to Invoices and upload or manually add freight invoices', action:"Router.navigate('invoices')" },
                { icon:'🤖', step:'2', title:'Generate demo data', desc:'Click "Generate 50 Invoices" on the Dashboard to see Aetra in action', action:"Router.navigate('dashboard')" },
                { icon:'📊', step:'3', title:'Explore the Dashboard', desc:'See real-time KPIs, AI insights, and charts powered by your data', action:"Router.navigate('dashboard')" }
              ].map(s => `
                <div style="display:flex;gap:12px;padding:14px;background:var(--bg);border-radius:10px;cursor:pointer" onclick="${s.action};closeOnboarding()">
                  <div style="width:36px;height:36px;border-radius:10px;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;font-weight:700">${s.step}</div>
                  <div>
                    <div style="font-size:13px;font-weight:700">${s.icon} ${s.title}</div>
                    <div style="font-size:12px;color:var(--text-muted);margin-top:2px">${s.desc}</div>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" style="margin-left:auto;flex-shrink:0;margin-top:4px"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              `).join('')}
            </div>
            <div style="padding:14px;background:#f0fdf4;border-radius:10px;border:1px solid #86efac;text-align:center">
              <div style="font-size:13px;color:#166534;font-weight:600">💡 Demo credentials available</div>
              <div style="font-size:12px;color:#166534;margin-top:4px">Use demo@freightflow.in / demo1234 for instant access to sample data</div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" onclick="closeOnboarding()">Skip Tour</button>
            <button class="btn btn-primary" onclick="Router.navigate('dashboard');closeOnboarding()">🚀 Go to Dashboard</button>
          </div>
        </div>`);

      window.closeOnboarding = async () => {
        const u = Session.get();
        if (u && u.id && u.id !== 'demo-user-001') {
          await API.updateProfile(u.id, { onboarded: true });
        }
        u && Object.assign(u, { onboarded: true }) && Session.save(u);
        closeModal();
      };
    }, 1500);
  }

  // Hook into router to show onboarding after first dashboard load
  const origRenderPage = Router.renderPage.bind(Router);
  Router.renderPage = function(page) {
    origRenderPage(page);
    if (page === 'dashboard') {
      const user = Session.get();
      if (user && !user.onboarded) showOnboarding();
    }
  };

  // ─── SESSION TIMEOUT & TOKEN REFRESH ──────────────────────
  
  // Show timeout warning modal
  function showTimeoutWarning() {
    const timeRemaining = Session.getWarningRemaining();
    const minutesLeft = Math.ceil(timeRemaining / 60000);
    
    openModal(`
      <div class="modal" style="max-width:480px;background:#fff9f0;border:2px solid #ff7f00">
        <div class="modal-header" style="background:linear-gradient(135deg,#ff7f00,#ff6b35);border-radius:16px 16px 0 0">
          <div>
            <div class="modal-title" style="color:#fff;font-size:18px">⏱️ Session Inactivity Warning</div>
            <div style="font-size:13px;color:rgba(255,255,255,.7);margin-top:2px">Your session will expire in ${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''}</div>
          </div>
          <button class="modal-close" onclick="closeTimeoutWarning()" style="background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.2);color:#fff">✕</button>
        </div>
        <div class="modal-body">
          <div style="text-align:center;margin-bottom:20px">
            <div style="font-size:48px;margin-bottom:10px">⏳</div>
            <div style="font-size:16px;font-weight:700;color:#ff7f00">Your session is about to expire</div>
            <div style="font-size:13px;color:var(--text-muted);margin-top:8px">
              You have been inactive for a while. To protect your data, your session will automatically close in <strong>${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''}</strong>.
            </div>
          </div>
          
          <div style="padding:14px;background:#fff0e6;border-radius:10px;border:1px solid #ffc9a3;margin-bottom:20px">
            <div style="font-size:12px;color:#ff7f00;text-align:center;font-weight:600">
              💡 Tip: Your session will extend automatically when you perform any action
            </div>
          </div>

          <div style="display:grid;gap:12px;margin-bottom:20px">
            <div style="padding:10px;background:var(--bg);border-radius:8px;border:1px solid var(--border)">
              <div style="font-size:12px;font-weight:600;color:var(--text-muted)">Actions that extend your session:</div>
              <ul style="font-size:12px;color:var(--text-muted);margin:6px 0 0 16px;list-style:disc">
                <li>Navigating pages</li>
                <li>Clicking buttons</li>
                <li>Moving your mouse</li>
                <li>Typing anywhere</li>
              </ul>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" onclick="Session.clear();Router.navigate('login');closeTimeoutWarning()">🚪 Logout Now</button>
          <button class="btn btn-primary" onclick="Session.resetActivity();showToast('✅ Session extended for 30 minutes', 'success');closeTimeoutWarning()">⏱️ Stay Logged In</button>
        </div>
      </div>`);

    window.closeTimeoutWarning = () => closeModal();
  }

  // Auto-logout handler
  function performSessionTimeout() {
    Session.clear();
    showToast('⏱️ Your session has expired. Please login again.', 'warning');
    setTimeout(() => {
      Router.navigate('login');
    }, 1500);
  }

  // Session timeout checker — runs every 30 seconds
  let timeoutCheckInterval = null;
  let timeoutWarningShown = false;

  function startTimeoutMonitoring() {
    if (timeoutCheckInterval) return; // Already running
    
    timeoutCheckInterval = setInterval(() => {
      if (!Session.isLoggedIn()) {
        // Stop monitoring if logged out
        clearInterval(timeoutCheckInterval);
        timeoutCheckInterval = null;
        timeoutWarningShown = false;
        return;
      }

      // Check if session has timed out
      if (Session.hasTimedOut()) {
        clearInterval(timeoutCheckInterval);
        timeoutCheckInterval = null;
        performSessionTimeout();
        return;
      }

      // Check if inactivity warning threshold reached
      if (Session.isInactivityWarning() && !Session.wasWarned()) {
        Session.setWarned();
        if (!timeoutWarningShown) {
          timeoutWarningShown = true;
          showTimeoutWarning();
        }
      }

      // Reset warning flag if user becomes active again before timeout
      if (!Session.isInactivityWarning() && Session.wasWarned()) {
        localStorage.removeItem('ff_timeout_warned');
      }
    }, 30000); // Check every 30 seconds
  }

  function stopTimeoutMonitoring() {
    if (timeoutCheckInterval) {
      clearInterval(timeoutCheckInterval);
      timeoutCheckInterval = null;
      timeoutWarningShown = false;
    }
  }

  // Activity tracking — resets inactivity timer
  const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
  
  function onUserActivity() {
    if (!Session.isLoggedIn()) return;
    
    // Only record activity if we've been inactive for a while (avoid constant updates)
    const lastActivity = Session.getLastActivityTime();
    if (!lastActivity || Date.now() - lastActivity > 60000) { // At least 1 minute since last record
      Session.recordActivity();
      timeoutWarningShown = false; // Reset warning flag on activity
    }
  }

  // Attach activity listeners
  activityEvents.forEach(event => {
    document.addEventListener(event, onUserActivity, { passive: true });
  });

  // Hook into router to manage timeout monitoring
  const origNavigate = Router.navigate.bind(Router);
  Router.navigate = function(page) {
    if (Session.isLoggedIn()) {
      onUserActivity(); // Record activity on navigation
    }
    return origNavigate(page);
  };

  // Start/stop monitoring based on login state
  setInterval(() => {
    if (Session.isLoggedIn() && !timeoutCheckInterval) {
      startTimeoutMonitoring();
    } else if (!Session.isLoggedIn() && timeoutCheckInterval) {
      stopTimeoutMonitoring();
    }
  }, 5000);

})();
