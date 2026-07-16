// ============================================================
// Aetra — Router, App Shell & Auth Controller
// Full Session-API integration, multi-tenant, responsive
// ============================================================

function getUserRole(user) {
  const role = String(user?.role || user?.userRole || user?.type || user?.accessRole || '').toLowerCase();
  if (role.includes('driver')) return 'driver';
  if (role.includes('field') || role.includes('executive')) return 'field';
  if (role.includes('admin')) return 'admin';
  const email = String(user?.email || '').toLowerCase();
  if (email.includes('driver')) return 'driver';
  if (email.includes('field') || email.includes('executive')) return 'field';
  return 'admin';
}

function getRoleLabel(role) {
  if (role === 'driver') return 'Driver';
  if (role === 'field') return 'Field Executive';
  return 'Admin';
}

const Router = {
  currentPage: null,
  isLoggedIn: false,
  publicPages: ['landing', 'login', 'register', 'forgot'],

  _normalizePage(page) {
    const normalized = String(page || '').trim().toLowerCase();
    if (!normalized) return this.isLoggedIn ? 'dashboard' : 'landing';
    return normalized;
  },

  _isPrivatePage(page) {
    return !this.publicPages.includes(page);
  },

  async init() {
    if (window.DEBUG_MODE) console.log('🔐 Router.init started');
    this.isLoggedIn = Session.isLoggedIn();
    if (window.DEBUG_MODE) console.log('isLoggedIn:', this.isLoggedIn);

    if (this.isLoggedIn) {
      const valid = await AppAuth.validateSession();
      if (window.DEBUG_MODE) console.log('Session valid:', valid);
      if (!valid) {
        if (window.DEBUG_MODE) console.warn('Invalid session, clearing stale session');
        Session.clear();
        this.isLoggedIn = false;
      }
    }

    let page = this._normalizePage(window.location.hash.slice(1));
    if (!this.isLoggedIn && this._isPrivatePage(page)) {
      page = 'login';
    } else if (this.isLoggedIn && this.publicPages.includes(page) && page !== 'landing') {
      page = 'dashboard';
    }

    if (window.DEBUG_MODE) console.log('Initial page hash:', page);
    this.navigate(page, { replaceHash: true });

    window.addEventListener('hashchange', () => {
      const nextPage = this._normalizePage(window.location.hash.slice(1));
      if (window.DEBUG_MODE) console.log('Hash changed to:', nextPage);
      this.navigate(nextPage);
    });
  },

  navigate(page, options = {}) {
    const opts = { replaceHash: false, ...options };
    page = this._normalizePage(page);
    if (window.DEBUG_MODE) console.log('🔀 Navigating to:', page);
    this.isLoggedIn = Session.isLoggedIn();

    if (!this.isLoggedIn && this._isPrivatePage(page)) {
      if (window.DEBUG_MODE) console.warn('Redirecting unauthenticated user to login');
      page = 'login';
    } else if (this.isLoggedIn && this.publicPages.includes(page) && page !== 'landing') {
      if (window.DEBUG_MODE) console.warn('Redirecting authenticated user away from public page', page);
      page = 'dashboard';
    }

    if (page === this.currentPage && !opts.replaceHash) {
      if (window.DEBUG_MODE) console.log('Already on page:', page);
      this.render(page);
      this.updateNav(page);
      window.scrollTo(0, 0);
      return;
    }

    this.currentPage = page;
    if (window.location.hash.slice(1) !== page) {
      if (opts.replaceHash) window.location.replace(`#${page}`);
      else window.location.hash = page;
    }
    this.render(page);
    this.updateNav(page);
    window.scrollTo(0, 0);
  },

  render(page) {
    if (window.DEBUG_MODE) console.log('🎨 Rendering app layout for page:', page);
    const app = document.getElementById('app');
    if (!app) {
      console.error('❌ app element not found!');
      return;
    }

    const isPublic = ['landing', 'login', 'register', 'forgot'].includes(page);

    if (isPublic) {
      app.innerHTML = '';
      if (page === 'landing') { Pages.landing(app); return; }
      if (page === 'login') { Pages.login(app); return; }
      if (page === 'register') { Pages.register(app); return; }
      if (page === 'forgot') { Pages.forgot(app); return; }
    }

    const user = Session.get() || {};
    const role = getUserRole(user);
    const planColors = { free: '#64748b', growth: '#f97316', enterprise: '#8b5cf6', starter: '#3b82f6' };
    const planColor = planColors[user.plan] || '#64748b';
    const planLabel = user.plan ? user.plan.charAt(0).toUpperCase() + user.plan.slice(1) : 'Free';
    const roleLabel = getRoleLabel(role);

    app.innerHTML = `
      <div class="app-layout" id="appLayout">
        <!-- SIDEBAR -->
        <aside class="sidebar" id="sidebar">
          <div class="sidebar-logo" onclick="Router.navigate('dashboard')" style="cursor:pointer">
            <div class="logo-icon">🚛</div>
            <div class="logo-text">
              <h2>Aetra</h2>
              <p>Invoice Automation</p>
            </div>
          </div>

          <nav class="sidebar-nav">
            <div class="nav-section-title">Main</div>
            <a class="nav-item" data-page="dashboard" onclick="Router.navigate('dashboard');return false;" href="#">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
              Dashboard
            </a>
            <a class="nav-item" data-page="invoices" onclick="Router.navigate('invoices');return false;" href="#">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              Invoices
              <span class="nav-badge" id="pendingBadge">…</span>
            </a>
            <a class="nav-item" data-page="gst" onclick="Router.navigate('gst');return false;" href="#">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              GST Compliance
            </a>

            <div class="nav-section-title" style="margin-top:8px">Finance</div>
            <a class="nav-item" data-page="payments" onclick="Router.navigate('payments');return false;" href="#">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              Payments & Aging
            </a>
            <a class="nav-item" data-page="vendors" onclick="Router.navigate('vendors');return false;" href="#">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              Vendor Scores
            </a>
            <a class="nav-item" data-page="ratecards" onclick="Router.navigate('ratecards');return false;" href="#">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="7" y1="15" x2="7" y2="15.01"/><line x1="11" y1="15" x2="11" y2="15.01"/></svg>
              💰 Rate Cards
              <span style="font-size:9px;background:#10b981;color:#fff;padding:1px 5px;border-radius:4px;font-weight:700;margin-left:4px">NEW</span>
            </a>
            <a class="nav-item" data-page="reports" onclick="Router.navigate('reports');return false;" href="#">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              Reports & Analytics
            </a>

            <div class="nav-section-title" style="margin-top:8px">Logistics & Operations</div>
            <a class="nav-item" data-page="tracking" onclick="Router.navigate('tracking');return false;" href="#">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
              Shipment Tracking
            </a>
            <a class="nav-item" data-page="gps-tracking" onclick="Router.navigate('gps-tracking');return false;" href="#">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              Real-Time GPS Tracking
              <span style="font-size:9px;background:#10b981;color:#fff;padding:1px 5px;border-radius:4px;font-weight:700;margin-left:4px">NEW</span>
            </a>
            <a class="nav-item" data-page="proof-of-delivery" onclick="Router.navigate('proof-of-delivery');return false;" href="#">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/></svg>
              Proof of Delivery
              <span style="font-size:9px;background:#10b981;color:#fff;padding:1px 5px;border-radius:4px;font-weight:700;margin-left:4px">NEW</span>
            </a>
            <a class="nav-item" data-page="route-optimization" onclick="Router.navigate('route-optimization');return false;" href="#">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l6-6L20 7M7 21h10a2 2 0 0 0 2-2V9.414a2 2 0 0 0-.586-1.414l-6.828-6.828A2 2 0 0 0 12.414 1H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2z"/></svg>
              Route Optimization
              <span style="font-size:9px;background:#10b981;color:#fff;padding:1px 5px;border-radius:4px;font-weight:700;margin-left:4px">NEW</span>
            </a>
            <a class="nav-item" data-page="driver-mobile" onclick="Router.navigate('driver-mobile');return false;" href="#">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
              Driver Mobile App
              <span style="font-size:9px;background:#10b981;color:#fff;padding:1px 5px;border-radius:4px;font-weight:700;margin-left:4px">NEW</span>
            </a>
            <a class="nav-item" data-page="delivery-analytics" onclick="Router.navigate('delivery-analytics');return false;" href="#">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              Delivery Analytics
              <span style="font-size:9px;background:#10b981;color:#fff;padding:1px 5px;border-radius:4px;font-weight:700;margin-left:4px">NEW</span>
            </a>
            <a class="nav-item" data-page="territory-management" onclick="Router.navigate('territory-management');return false;" href="#">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="1" fill="currentColor"/></svg>
              Territory Management
              <span style="font-size:9px;background:#10b981;color:#fff;padding:1px 5px;border-radius:4px;font-weight:700;margin-left:4px">NEW</span>
            </a>
            <a class="nav-item" data-page="ocr" onclick="Router.navigate('ocr');return false;" href="#">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 16v-5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v5m-8-8h0"/></svg>
              📸 OCR Invoices
              <span style="font-size:9px;background:#10b981;color:#fff;padding:1px 5px;border-radius:4px;font-weight:700;margin-left:4px">NEW</span>
            </a>

            <div class="nav-section-title" style="margin-top:8px">Administration</div>
            ${role === 'driver' ? `
            <div class="nav-section-title" style="margin-top:8px">Driver Console</div>
            <a class="nav-item" data-page="driver-mobile" onclick="Router.navigate('driver-mobile');return false;" href="#">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
              Driver Mobile
            </a>
            <a class="nav-item" data-page="route-optimization" onclick="Router.navigate('route-optimization');return false;" href="#">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l6-6L20 7M7 21h10a2 2 0 0 0 2-2V9.414a2 2 0 0 0-.586-1.414l-6.828-6.828A2 2 0 0 0 12.414 1H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2z"/></svg>
              Assigned Route
            </a>
            ` : ''}
            ${role === 'field' ? `
            <div class="nav-section-title" style="margin-top:8px">Field Operations</div>
            <a class="nav-item" data-page="proof-of-delivery" onclick="Router.navigate('proof-of-delivery');return false;" href="#">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/></svg>
              Field Orders
            </a>
            <a class="nav-item" data-page="gps-tracking" onclick="Router.navigate('gps-tracking');return false;" href="#">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              Live Tracking
            </a>
            ` : ''}
            <a class="nav-item" data-page="admin" onclick="Router.navigate('admin');return false;" href="#">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>
              ${role === 'admin' ? 'Admin Panel' : role === 'field' ? 'Operations Desk' : 'Fleet Desk'}
            </a>

            <div class="nav-section-title" style="margin-top:8px">Account</div>
            <a class="nav-item" data-page="settings" onclick="Router.navigate('settings');return false;" href="#">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41M21 12h-2M5 12H3M12 21v-2M12 5V3"/></svg>
              Settings
            </a>
          </nav>

          <div class="sidebar-footer">
            <div class="plan-badge" style="background:${planColor}22;border:1px solid ${planColor}44;color:${planColor};font-size:11px;font-weight:700;padding:5px 10px;border-radius:6px;text-align:center;margin-bottom:10px;text-transform:uppercase;letter-spacing:.5px">
              ${planLabel} • ${roleLabel}
            </div>
            <div class="sidebar-user" onclick="Router.navigate('settings')" style="cursor:pointer">
              <div class="user-avatar">${user.avatar || '??'}</div>
              <div class="user-info">
                <div class="user-name">${user.name || 'User'}</div>
                <div class="user-company" style="max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${user.company || ''}</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left:auto;opacity:.4"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>
        </aside>

        <!-- MAIN CONTENT -->
        <div class="main-content" id="mainContent">
          <header class="topbar" id="topbar">
            <div class="topbar-left" style="display:flex;align-items:center;gap:12px">
              <button class="btn btn-ghost btn-icon" id="menuToggle" onclick="toggleSidebar()" title="Toggle Menu">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              </button>
              <div>
                <div class="page-title" id="pageTitle">Dashboard</div>
                <div class="breadcrumb" id="pageBreadcrumb">Aetra / Dashboard</div>
              </div>
            </div>

            <div class="topbar-right">
              <div class="topbar-search" onclick="openGlobalSearch()" title="Search (Ctrl+K)">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <span>Search... ⌘K</span>
              </div>

              <button class="btn btn-ghost btn-icon notification-btn" onclick="openNotifications()" title="Notifications" style="position:relative">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                <span class="notif-dot" id="notifDot"></span>
              </button>

              <div style="display:flex;align-items:center;gap:8px;padding:6px 12px;background:var(--bg);border:1px solid var(--border);border-radius:8px;cursor:pointer" onclick="Router.navigate('settings')" title="Account">
                <div style="width:28px;height:28px;border-radius:7px;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700">${user.avatar || '??'}</div>
                <span style="font-size:13px;font-weight:600;color:var(--text)">${(user.name || '').split(' ')[0]}</span>
              </div>

              <button class="btn btn-outline btn-sm" onclick="AppAuth.logout()" title="Logout">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Logout
              </button>
            </div>
          </header>

          <main class="page-content" id="pageContent"></main>
        </div>
      </div>
    `;

    this.updateNav(page);
    this.setPageTitle(page);
    this.renderPage(page);
    this._loadPendingBadge();
  },

  async _loadPendingBadge() {
    const user = Session.get();
    if (!user) return;
    try {
      const res = await API.getInvoices(user.id);
      const pending = (res.data || []).filter(i => i.status === 'pending').length;
      const badge = document.getElementById('pendingBadge');
      if (badge) badge.textContent = pending > 0 ? pending : '';
    } catch (e) { /* silent */ }
  },

  renderPage(page) {
    const content = document.getElementById('pageContent');
    if (!content) {
      console.error('pageContent element not found');
      return;
    }
    if (window.DEBUG_MODE) console.log('Rendering page:', page);
    const pageMap = {
      dashboard: Pages.dashboard,
      admin: Pages.admin,
      invoices: Pages.invoices,
      gst: Pages.gst,
      payments: Pages.payments,
      vendors: Pages.vendors,
      ratecards: Pages.ratecards,
      reports: Pages.reports,
      settings: Pages.settings,
      tracking: Pages.tracking,
      shipments: Pages.shipments,
      fleet: Pages.fleet,
      warehouse: Pages.warehouse,
      ocr: Pages.ocr_capture,
      'gps-tracking': () => { 
        document.getElementById('pageContent').innerHTML = GPSTracking.render(); 
        GPSTracking.init(); 
      },
      'proof-of-delivery': () => { 
        document.getElementById('pageContent').innerHTML = ProofOfDelivery.render(); 
        ProofOfDelivery.init(); 
      },
      'route-optimization': () => { 
        document.getElementById('pageContent').innerHTML = RouteOptimization.render(); 
        RouteOptimization.init(); 
      },
      'driver-mobile': () => { 
        document.getElementById('pageContent').innerHTML = DriverMobileApp.render(); 
        DriverMobileApp.init(); 
      },
      'delivery-analytics': () => { 
        document.getElementById('pageContent').innerHTML = DeliveryAnalytics.render(); 
        DeliveryAnalytics.init(); 
      },
      'territory-management': () => { 
        document.getElementById('pageContent').innerHTML = TerritoryManagement.render(); 
        TerritoryManagement.init(); 
      }
    };
    if (pageMap[page]) {
      try {
        const result = pageMap[page](content);
        // If it's a promise, await it
        if (result && typeof result.then === 'function') {
          result.catch(e => {
            console.error('Error rendering page:', page, e);
            content.innerHTML = `<div style="padding:20px;color:red"><strong>Error loading ${page}:</strong> ${e.message}</div>`;
          });
        }
      } catch (e) {
        console.error('Error rendering page:', page, e);
        content.innerHTML = `<div style="padding:20px;color:red"><strong>Error loading ${page}:</strong> ${e.message}</div>`;
      }
    } else {
      console.warn('Page not found:', page);
    }
  },

  updateNav(page) {
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.getAttribute('data-page') === page);
    });
  },

  setPageTitle(page) {
    const titles = {
      dashboard: ['Dashboard', 'Freight operations overview'],
      invoices: ['Invoice Management', 'Manage & reconcile freight invoices'],
      gst: ['GST Compliance', 'GSTR-2B reconciliation & ITC tracking'],
      payments: ['Payments & Aging', 'Payment tracking & outstanding analysis'],
      vendors: ['Vendor Performance', 'Scorecard & performance analytics'],
      ratecards: ['Rate Card Management', 'Manage vendor pricing and volume slabs'],
      reports: ['Reports & Analytics', 'Business intelligence & AI insights'],
      settings: ['Settings', 'Company profile & system configuration'],
      tracking: ['Shipment Tracking', 'Live shipment status & delivery tracking'],
      'gps-tracking': ['Real-Time GPS Tracking', 'Live vehicle and shipment locations'],
      'proof-of-delivery': ['Proof of Delivery', 'Capture delivery confirmations with photos and signatures'],
      'route-optimization': ['Route Optimization', 'AI-powered route planning to reduce time and costs'],
      'driver-mobile': ['Driver Mobile App', 'Manage drivers and monitor field operations'],
      'delivery-analytics': ['Delivery Analytics', 'Real-time performance metrics and insights'],
      'territory-management': ['Territory Management', 'Assign zones and balance driver workload']
    };
    const t = titles[page] || ['Aetra', ''];
    const el = document.getElementById('pageTitle');
    const bc = document.getElementById('pageBreadcrumb');
    if (el) el.textContent = t[0];
    if (bc) bc.innerHTML = `<span style="color:var(--text-muted)">Aetra</span> <span style="opacity:.4;margin:0 4px">/</span> ${t[0]}`;
  }
};

// Export to global scope
if (typeof window !== 'undefined') window.Router = Router;

// ── Sidebar Toggle ──────────────────────────────────────────
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const layout = document.getElementById('appLayout');
  if (sidebar) {
    sidebar.classList.toggle('open');
    sidebar.classList.toggle('collapsed');
    if (layout) layout.classList.toggle('sidebar-collapsed');
  }
}

// ── Global Search ───────────────────────────────────────────
function openGlobalSearch() {
  openModal(`
    <div class="modal" style="max-width:520px;border-radius:16px">
      <div style="padding:16px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input id="globalSearch" class="form-input" style="border:none;padding:0;font-size:15px;box-shadow:none" placeholder="Search invoices, vendors, routes..." autofocus oninput="runGlobalSearch(this.value)">
        <button onclick="closeModal()" style="background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:18px">✕</button>
      </div>
      <div id="searchResults" style="padding:12px;max-height:360px;overflow-y:auto">
        <div style="text-align:center;padding:32px;color:var(--text-muted)">
          <div style="font-size:32px;margin-bottom:8px">🔍</div>
          <div>Type to search invoices, vendors, routes...</div>
        </div>
      </div>
    </div>`);
  document.getElementById('globalSearch')?.focus();

  window.runGlobalSearch = async (q) => {
    if (!q || q.length < 2) return;
    const user = Session.get();
    if (!user) return;
    const [invRes, vendRes] = await Promise.all([API.getInvoices(user.id), API.getVendors(user.id)]);
    const invoices = (invRes.data || []).filter(i =>
      (i.inv_number||'').toLowerCase().includes(q.toLowerCase()) ||
      (i.vendor||'').toLowerCase().includes(q.toLowerCase()) ||
      (i.route||'').toLowerCase().includes(q.toLowerCase())
    ).slice(0, 5);
    const vendors = (vendRes.data || []).filter(v =>
      (v.name||'').toLowerCase().includes(q.toLowerCase())
    ).slice(0, 3);
    const el = document.getElementById('searchResults');
    if (!el) return;
    el.innerHTML = `
      ${invoices.length ? `<div style="font-size:11px;font-weight:700;text-transform:uppercase;color:var(--text-muted);padding:4px 8px;margin-bottom:4px">Invoices</div>` : ''}
      ${invoices.map(i => `<div style="padding:10px 12px;border-radius:8px;cursor:pointer;display:flex;align-items:center;gap:10px" onmouseover="this.style.background='var(--bg)'" onmouseout="this.style.background=''" onclick="closeModal();Router.navigate('invoices')">
        <span style="font-size:18px">🧾</span>
        <div>
          <div style="font-size:13px;font-weight:600">${i.inv_number || i.id?.slice(0,8)}</div>
          <div style="font-size:12px;color:var(--text-muted)">${i.vendor} • ${i.route||''} • ${API._fmt(i.total)}</div>
        </div>
        <span style="margin-left:auto">${getStatusBadge(i.status)}</span>
      </div>`).join('')}
      ${vendors.length ? `<div style="font-size:11px;font-weight:700;text-transform:uppercase;color:var(--text-muted);padding:4px 8px;margin:4px 0">Vendors</div>` : ''}
      ${vendors.map(v => `<div style="padding:10px 12px;border-radius:8px;cursor:pointer;display:flex;align-items:center;gap:10px" onmouseover="this.style.background='var(--bg)'" onmouseout="this.style.background=''" onclick="closeModal();Router.navigate('vendors')">
        <div style="width:28px;height:28px;border-radius:6px;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700">${(v.name||'').slice(0,2).toUpperCase()}</div>
        <div>
          <div style="font-size:13px;font-weight:600">${v.name}</div>
          <div style="font-size:12px;color:var(--text-muted)">Score: ${v.score}/100</div>
        </div>
      </div>`).join('')}
      ${!invoices.length && !vendors.length ? `<div style="text-align:center;padding:24px;color:var(--text-muted)">No results found for "<strong>${q}</strong>"</div>` : ''}
    `;
  };
}

// ── Notifications ───────────────────────────────────────────
function openNotifications() {
  openModal(`
    <div class="modal" style="max-width:420px">
      <div class="modal-header">
        <div class="modal-title">🔔 Notifications</div>
        <button class="modal-close" onclick="closeModal()">✕</button>
      </div>
      <div class="modal-body" style="padding:0">
        ${[
          { icon:'⚠️', title:'3 invoices overdue', desc:'Immediate payment action required', time:'5 min ago', color:'#fef2f2', border:'#fecaca', c:'#991b1b' },
          { icon:'📊', title:'GST mismatch detected', desc:'1 GSTR-2B mismatch for DTDC Ltd', time:'1 hr ago', color:'#fffbeb', border:'#fde68a', c:'#92400e' },
          { icon:'✅', title:'5 invoices reconciled', desc:'Auto-reconciliation completed successfully', time:'2 hrs ago', color:'#f0fdf4', border:'#86efac', c:'#166534' },
          { icon:'💡', title:'AI found ₹2.1L savings', desc:'3 route consolidation opportunities found', time:'3 hrs ago', color:'#eff6ff', border:'#bfdbfe', c:'#1e40af' },
          { icon:'📅', title:'GSTR-3B due in 5 days', desc:'March 2024 return — prepare now', time:'Today', color:'#fdf4ff', border:'#e9d5ff', c:'#6b21a8' }
        ].map(n => `
          <div style="display:flex;gap:12px;padding:14px 20px;border-bottom:1px solid var(--border);cursor:pointer" onmouseover="this.style.background='${n.color}'" onmouseout="this.style.background=''">
            <div style="width:38px;height:38px;border-radius:10px;background:${n.color};border:1px solid ${n.border};display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">${n.icon}</div>
            <div style="flex:1">
              <div style="font-size:13px;font-weight:700;color:${n.c}">${n.title}</div>
              <div style="font-size:12px;color:var(--text-muted);margin-top:2px">${n.desc}</div>
            </div>
            <div style="font-size:11px;color:var(--text-light);flex-shrink:0;margin-top:2px">${n.time}</div>
          </div>
        `).join('')}
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="closeModal()">Dismiss All</button>
        <button class="btn btn-primary" onclick="closeModal();Router.navigate('invoices')">View Invoices</button>
      </div>
    </div>`);
}

// ── Auth Controller ─────────────────────────────────────────
const AppAuth = {
  async validateSession() {
    const session = Session.get();
    if (!session?.token) return false;

    const result = await API.getMe();
    if (result.error) {
      Session.clear();
      return false;
    }
    Session.save(result);
    return true;
  },

  async login(email, password, roleOverride = null) {
    if (!email || !password) { showToast('Enter email and password', 'error'); return false; }

    const result = await API.login(email, password);
    if (result.error) { showToast(result.error, 'error'); return false; }
    const role = roleOverride || getUserRole(result);
    const sessionUser = {
      ...result,
      role,
      driverId: role === 'driver' ? (result.driverId || 'demo-driver') : result.driverId || null
    };
    Session.save(sessionUser);
    Router.isLoggedIn = true;
    showToast(`Welcome back, ${sessionUser.name || email} (${getRoleLabel(role)}) 👋`);
    setTimeout(() => Router.navigate('dashboard'), 800);
    return true;
  },

  async register(data) {
    if (!data.name || !data.email || !data.password) {
      showToast('Please fill all required fields', 'error'); return false;
    }
    const result = await API.signup(data);
    if (result.error) { showToast(result.error, 'error'); return false; }
    Session.save({ ...result, role: data.role || 'admin' });
    Router.isLoggedIn = true;
    showToast('Account created! Welcome to Aetra 🚛');
    setTimeout(() => Router.navigate('dashboard'), 800);
    return true;
  },

  logout() {
    Session.clear();
    Router.isLoggedIn = false;
    showToast('Logged out successfully', 'info');
    setTimeout(() => Router.navigate('login'), 400);
  }
};

// ── Pages Registry (defined in components.js before page scripts) ──
