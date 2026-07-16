// ============================================================
// Aetra — Real API Layer (RESTful Table API)
// All data persisted via tables/*, fully multi-tenant
// ============================================================

const API = {
  // ─── AUTH ─────────────────────────────────────────────────
  async signup(data) {
    return await this._post('auth/signup', {
      name: data.name,
      company: data.company,
      email: data.email,
      password: data.password,
      gstin: data.gstin || '',
      phone: data.phone || ''
    });
  },

  async login(email, password) {
    const demo = this._demoLogin(email, password);
    if (demo) return demo;
    return await this._post('auth/login', { email, password });
  },

  async getMe() {
    const session = Session.get();
    if (session?.email === 'demo@freightflow.in') {
      return { ...session, name: session.name || 'Demo User', company: session.company || 'Aetra Labs' };
    }
    return await this._get('auth/me');
  },

  async updateProfile(userId, data) {
    return await this._patch(`tables/ff_users/${userId}`, data);
  },

  // ─── INVOICES ─────────────────────────────────────────────
  async getInvoices(userId, opts = {}) {
    let url = `tables/ff_invoices?limit=100&sort=date`;
    if (opts.status) url += `&search=${opts.status}`;
    const res = await this._get(url);
    if (!res.data) return { data: [], total: 0 };
    // Filter by user (multi-tenant)
    const filtered = res.data.filter(inv => inv.user_id === userId || inv.company_id === userId);
    return { data: filtered, total: filtered.length };
  },

  async createInvoice(userId, companyId, data) {
    const inv = await this._post('tables/ff_invoices', {
      id: this._uuid(),
      inv_number: `INV-${new Date().getFullYear()}-${Math.floor(Math.random()*9000+1000)}`,
      user_id: userId,
      company_id: companyId,
      ...data,
      gst: Math.round(data.amount * (data.gst_rate || 18) / 100),
      total: Math.round(data.amount * (1 + (data.gst_rate || 18) / 100)),
      month_year: this._monthYear(data.date || new Date()),
      reconciled: 'pending',
      status: 'pending'
    });
    // Log activity
    await this.logActivity(userId, companyId, 'invoice',
      `New invoice ${inv.inv_number} from ${data.vendor} (${this._fmt(inv.total)})`, '#3b82f6', '🧾', inv.id);
    return inv;
  },

  async approveInvoice(invoiceId, approverName) {
    return await this._patch(`tables/ff_invoices/${invoiceId}`, {
      status: 'paid',
      approved_by: approverName,
      approved_at: new Date().toISOString()
    });
  },

  async updateInvoice(invoiceId, data) {
    return await this._patch(`tables/ff_invoices/${invoiceId}`, data);
  },

  async deleteInvoice(invoiceId) {
    return await this._delete(`tables/ff_invoices/${invoiceId}`);
  },

  // ─── VENDORS ──────────────────────────────────────────────
  async getVendors(userId) {
    const res = await this._get('tables/ff_vendors?limit=50');
    if (!res.data) return { data: [] };
    return { data: res.data.filter(v => v.user_id === userId || v.company_id === userId) };
  },

  async createVendor(userId, companyId, data) {
    return await this._post('tables/ff_vendors', {
      id: this._uuid(),
      user_id: userId,
      company_id: companyId,
      ...data,
      score: Math.round((data.on_time_pct * 0.4 + data.accuracy_pct * 0.4 + (10 - data.dispute_count) * 2) / 1),
      trend: [data.score || 80]
    });
  },

  async updateVendor(vendorId, data) {
    return await this._patch(`tables/ff_vendors/${vendorId}`, data);
  },

  async getDrivers(userId) {
    // Sample driver registry for admin assignment and demo driver login
    return [
      { id: 'demo-driver', name: 'Demo Driver', code: 'DRV-DEMO', truck: 'TRK-MH-0001', status: 'Active', route: 'Mumbai → Delhi', eta: '08:30', capacity: '25T' },
      { id: 'drv-001', name: 'Rajesh Kumar', code: 'DRV-001', truck: 'TRK-MH-4521', status: 'Active', route: 'Mumbai → Delhi', eta: '08:30', capacity: '25T' },
      { id: 'drv-002', name: 'Priya Singh', code: 'DRV-002', truck: 'TRK-MH-4015', status: 'Active', route: 'Bangalore → Chennai', eta: '15:45', capacity: '12T' },
      { id: 'drv-003', name: 'Anil Verma', code: 'DRV-003', truck: 'TRK-MH-3892', status: 'Idle', route: 'Unassigned', eta: '—', capacity: '8T' }
    ];
  },

  async getDriverAssignments(userId, opts = {}) {
    const assignments = this._getStoredDriverAssignments();
    if (!assignments.length) {
      const sample = [
        {
          id: 'assign-001',
          driverId: 'drv-001',
          driverName: 'Rajesh Kumar',
          client: 'TCS Supply',
          type: 'FTL',
          route: 'Mumbai → Delhi',
          weight: '23.5 T',
          eta: '08:30',
          status: 'In Transit',
          fuelSaved: 16,
          timeSaved: 42,
          createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
          notes: 'Use north expressway for fastest route.'
        },
        {
          id: 'assign-002',
          driverId: 'drv-002',
          driverName: 'Priya Singh',
          client: 'Amazon Logistics',
          type: 'LTL',
          route: 'Bangalore → Chennai',
          weight: '9.2 T',
          eta: '15:45',
          status: 'In Transit',
          fuelSaved: 10,
          timeSaved: 24,
          createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
          notes: 'Follow smart route via Hosur bypass.'
        },
        {
          id: 'assign-003',
          driverId: 'demo-driver',
          driverName: 'Demo Driver',
          client: 'Flipkart',
          type: 'LTL',
          route: 'Pune → Mumbai',
          weight: '8.0 T',
          eta: '12:15',
          status: 'Assigned',
          fuelSaved: 8,
          timeSaved: 18,
          createdAt: new Date(Date.now() - 1 * 3600000).toISOString(),
          notes: 'Start from Wakad depot and use NH48 for smooth transit.'
        }
      ];
      this._saveStoredDriverAssignments(sample);
      return this.getDriverAssignments(userId, opts);
    }

    let filtered = assignments;
    if (opts.driverId) {
      filtered = filtered.filter(a => a.driverId === opts.driverId);
    }
    if (opts.status) {
      filtered = filtered.filter(a => a.status === opts.status);
    }
    return filtered;
  },

  async assignDriverOrder(userId, data) {
    const assignments = this._getStoredDriverAssignments();
    const order = {
      id: `assign-${Math.floor(Math.random() * 900000 + 100000)}`,
      driverId: data.driverId,
      driverName: data.driverName,
      client: data.client,
      type: data.type,
      route: data.route,
      weight: data.weight,
      eta: data.eta,
      status: 'Assigned',
      fuelSaved: data.fuelSaved || Math.max(5, Math.round(Math.random() * 20)),
      timeSaved: data.timeSaved || Math.max(10, Math.round(Math.random() * 35)),
      createdAt: new Date().toISOString(),
      notes: data.notes || ''
    };
    assignments.unshift(order);
    this._saveStoredDriverAssignments(assignments);
    return order;
  },

  async updateDriverAssignment(id, updates) {
    const assignments = this._getStoredDriverAssignments();
    const assignment = assignments.find(a => a.id === id);
    if (!assignment) return null;
    Object.assign(assignment, updates);
    if (updates.status === 'Accepted' && !assignment.acceptedAt) {
      assignment.acceptedAt = new Date().toISOString();
    }
    if (updates.status === 'Delivered' && !assignment.deliveredAt) {
      assignment.deliveredAt = new Date().toISOString();
    }
    this._saveStoredDriverAssignments(assignments);
    return assignment;
  },

  _getStoredDriverAssignments() {
    try {
      return JSON.parse(localStorage.getItem('ff_driver_assignments') || '[]');
    } catch (e) {
      return [];
    }
  },

  _saveStoredDriverAssignments(list) {
    localStorage.setItem('ff_driver_assignments', JSON.stringify(list));
  },

  // ─── ANALYTICS ────────────────────────────────────────────
  async getAnalytics(userId) {
    const res = await this._get('tables/ff_analytics?limit=24&sort=month_year');
    if (!res.data) return { data: [] };
    return { data: res.data.filter(a => a.user_id === userId || a.company_id === userId) };
  },

  async getSummary(userId) {
    const [invRes, vendRes, analyticsRes, actRes] = await Promise.all([
      this.getInvoices(userId),
      this.getVendors(userId),
      this.getAnalytics(userId),
      this.getActivity(userId)
    ]);
    const invoices = invRes.data || [];
    const vendors = vendRes.data || [];
    const analytics = analyticsRes.data || [];
    const activity = actRes.data || [];

    const paid = invoices.filter(i => i.status === 'paid');
    const pending = invoices.filter(i => i.status === 'pending');
    const overdue = invoices.filter(i => i.status === 'overdue');
    const disputed = invoices.filter(i => i.status === 'disputed');

    const totalSpend = invoices.reduce((s, i) => s + (i.total || 0), 0);
    const overdueAmt = overdue.reduce((s, i) => s + (i.total || 0), 0);
    const itcEligible = invoices.filter(i => i.reconciled === 'matched').reduce((s, i) => s + (i.gst || 0), 0);

    const latestAnalytics = analytics[analytics.length - 1] || {};
    const prevAnalytics = analytics[analytics.length - 2] || {};

    return {
      invoices, vendors, analytics, activity,
      kpis: {
        totalInvoices: invoices.length,
        pendingCount: pending.length,
        overdueAmount: overdueAmt,
        itcEligible,
        totalSpend,
        paidCount: paid.length,
        disputedCount: disputed.length,
        activeVendors: vendors.length,
        avgVendorScore: vendors.length ? Math.round(vendors.reduce((s, v) => s + (v.score || 0), 0) / vendors.length) : 0
      },
      monthly: analytics.map(a => ({
        label: this._shortMonth(a.month_year),
        bar: a.freight_spend,
        line: a.revenue,
        month_year: a.month_year
      })),
      invoiceStatus: [
        { label: 'Paid', value: paid.length, name: 'Paid' },
        { label: 'Pending', value: pending.length, name: 'Pending' },
        { label: 'Overdue', value: overdue.length, name: 'Overdue' },
        { label: 'Disputed', value: disputed.length, name: 'Disputed' }
      ],
      vendorSpend: this._calcVendorSpend(invoices)
    };
  },

  // ─── PAYMENTS ─────────────────────────────────────────────
  async getPayments(userId) {
    const res = await this._get('tables/ff_payments?limit=100');
    if (!res.data) return { data: [] };
    return { data: res.data.filter(p => p.user_id === userId || p.company_id === userId) };
  },

  async updatePayment(paymentId, data) {
    return await this._patch(`tables/ff_payments/${paymentId}`, data);
  },

  async processPayment(paymentId, mode, bank) {
    const utr = `${(bank || 'HDFC').replace(/\s/g, '').toUpperCase()}${Date.now()}`;
    const updated = await this._patch(`tables/ff_payments/${paymentId}`, {
      status: 'processed',
      paid_date: new Date().toISOString().split('T')[0],
      utr,
      mode: mode || 'NEFT',
      bank: bank || 'HDFC Bank'
    });
    return updated;
  },

  // ─── ACTIVITY ─────────────────────────────────────────────
  async getActivity(userId) {
    const res = await this._get('tables/ff_activity?limit=20');
    if (!res.data) return { data: [] };
    return { data: res.data.filter(a => a.user_id === userId || a.company_id === userId) };
  },

  async logActivity(userId, companyId, type, text, color, icon, refId) {
    return await this._post('tables/ff_activity', {
      id: this._uuid(),
      user_id: userId,
      company_id: companyId,
      type, text, color, icon: icon || '📋',
      ref_id: refId || ''
    });
  },

  // ─── AI ENGINE ────────────────────────────────────────────
  async getAIPrediction(analytics) {
    // Linear regression on last 3-6 months of freight spend
    const data = analytics.slice(-6).map(a => a.freight_spend || a.bar || 0).filter(Boolean);
    if (data.length < 2) return { predicted: 0, growth: 0, confidence: 'low' };

    const n = data.length;
    const growthRates = data.slice(1).map((v, i) => (v - data[i]) / data[i]);
    const avgGrowth = growthRates.reduce((s, v) => s + v, 0) / growthRates.length;
    const predicted = Math.round(data[data.length - 1] * (1 + avgGrowth));
    const trend = avgGrowth > 0.05 ? 'rising' : avgGrowth < -0.05 ? 'falling' : 'stable';

    return {
      predicted,
      growth: Math.round(avgGrowth * 100),
      confidence: n >= 4 ? 'high' : 'medium',
      trend,
      insight: this._genPredictionInsight(predicted, avgGrowth, data)
    };
  },

  async getAISavings(invoices, vendors) {
    const savings = [];

    // 1. Identify expensive vendor per route
    const routeVendorMap = {};
    invoices.forEach(inv => {
      if (!inv.route) return;
      const key = inv.route;
      if (!routeVendorMap[key]) routeVendorMap[key] = [];
      routeVendorMap[key].push({ vendor: inv.vendor, total: inv.total, vendorId: inv.vendor_id });
    });

    Object.entries(routeVendorMap).forEach(([route, invs]) => {
      if (invs.length < 2) return;
      const vendors_ = {};
      invs.forEach(i => {
        vendors_[i.vendor] = (vendors_[i.vendor] || 0) + i.total;
      });
      const sorted = Object.entries(vendors_).sort((a, b) => b[1] - a[1]);
      if (sorted.length >= 2) {
        const diff = sorted[0][1] - sorted[1][1];
        if (diff > 30000) {
          savings.push({
            type: 'vendor_switch',
            icon: '🔄',
            title: `Switch vendor on ${route}`,
            desc: `${sorted[0][0]} charges ${this._fmt(sorted[0][1])} vs ${sorted[1][0]} at ${this._fmt(sorted[1][1])}`,
            saving: Math.round(diff * 0.7),
            priority: diff > 200000 ? 'high' : 'medium'
          });
        }
      }
    });

    // 2. Consolidation opportunities (repeated routes)
    const routeCounts = {};
    invoices.forEach(inv => {
      if (!inv.route) return;
      routeCounts[inv.route] = (routeCounts[inv.route] || 0) + 1;
    });
    Object.entries(routeCounts).forEach(([route, count]) => {
      if (count >= 4) {
        savings.push({
          type: 'consolidation',
          icon: '📦',
          title: `Consolidate shipments on ${route}`,
          desc: `${count} separate shipments detected. Bulk shipments can reduce per-unit cost by 18-25%`,
          saving: Math.round(count * 45000 * 0.2),
          priority: count >= 6 ? 'high' : 'medium'
        });
      }
    });

    // 3. Overdue interest savings
    const overdue = invoices.filter(i => i.status === 'overdue');
    if (overdue.length > 0) {
      const overdueAmt = overdue.reduce((s, i) => s + (i.total || 0), 0);
      savings.push({
        type: 'payment',
        icon: '⏰',
        title: 'Clear overdue invoices to avoid interest',
        desc: `${overdue.length} overdue invoices worth ${this._fmt(overdueAmt)} accumulating 1.5% monthly interest`,
        saving: Math.round(overdueAmt * 0.015),
        priority: 'high'
      });
    }

    // 4. Low score vendor cost
    const riskVendors = vendors.filter(v => v.score < 75);
    riskVendors.forEach(v => {
      savings.push({
        type: 'vendor_risk',
        icon: '⭐',
        title: `Replace underperforming vendor: ${v.name}`,
        desc: `Score ${v.score}/100 — disputes & delays cost extra operational overhead`,
        saving: Math.round((v.outstanding || 200000) * 0.12),
        priority: v.score < 70 ? 'high' : 'medium'
      });
    });

    return savings.sort((a, b) => b.saving - a.saving).slice(0, 6);
  },

  getRouteOptimization(invoices) {
    const routes = {};
    invoices.forEach(inv => {
      if (!inv.route) return;
      if (!routes[inv.route]) routes[inv.route] = { count: 0, total: 0, vendors: new Set() };
      routes[inv.route].count++;
      routes[inv.route].total += inv.total || 0;
      routes[inv.route].vendors.add(inv.vendor);
    });

    return Object.entries(routes)
      .map(([route, data]) => ({
        route,
        count: data.count,
        total: data.total,
        avg: Math.round(data.total / data.count),
        vendors: data.vendors.size,
        optimization: data.count >= 3 ? `Consolidate → save ~${this._fmt(Math.round(data.total * 0.18))}` : null
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  },

  // ─── DEMO DATA GENERATOR ──────────────────────────────────
  async generateDemoData(userId, companyId) {
    const vendors = ['Delhivery Ltd', 'BlueDart Express', 'DTDC Ltd', 'Gati Logistics', 'VRL Logistics', 'TCI Express'];
    const vendorIds = ['V001', 'V002', 'V003', 'V004', 'V005', 'V006'];
    const routes = ['Mumbai → Delhi', 'Chennai → Bangalore', 'Delhi → Kolkata', 'Hyderabad → Pune', 'Bangalore → Mumbai', 'Mumbai → Ahmedabad', 'Delhi → Amritsar', 'Kolkata → Bhubaneswar'];
    const modes = ['Road', 'Air', 'Surface', 'Express'];
    const hsns = ['9965', '9967', '9968'];
    const statuses = ['paid', 'paid', 'paid', 'pending', 'overdue', 'disputed'];
    const reconciled = ['matched', 'matched', 'pending', 'mismatched', 'missing'];

    const invoices = [];
    const now = new Date();
    for (let i = 0; i < 50; i++) {
      const daysAgo = Math.floor(Math.random() * 180);
      const date = new Date(now - daysAgo * 86400000);
      const dueDate = new Date(date.getTime() + 30 * 86400000);
      const amount = Math.floor(Math.random() * 480000 + 25000);
      const gstAmt = Math.round(amount * 0.18);
      const vIdx = Math.floor(Math.random() * vendors.length);
      invoices.push({
        id: this._uuid(),
        inv_number: `INV-${date.getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`,
        user_id: userId,
        company_id: companyId,
        vendor: vendors[vIdx],
        vendor_id: vendorIds[vIdx],
        date: date.toISOString().split('T')[0],
        due_date: dueDate.toISOString().split('T')[0],
        amount,
        gst: gstAmt,
        total: amount + gstAmt,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        hsn: hsns[Math.floor(Math.random() * hsns.length)],
        route: routes[Math.floor(Math.random() * routes.length)],
        weight: `${(Math.random() * 4 + 0.2).toFixed(1)} MT`,
        mode: modes[Math.floor(Math.random() * modes.length)],
        reconciled: reconciled[Math.floor(Math.random() * reconciled.length)],
        gst_rate: 18,
        month_year: `${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`
      });
    }

    // Batch insert
    let added = 0;
    for (let i = 0; i < invoices.length; i += 10) {
      const batch = invoices.slice(i, i + 10);
      try {
        await Promise.all(batch.map(inv => this._post('tables/ff_invoices', inv)));
        added += batch.length;
      } catch (e) { /* continue */ }
    }
    await this.logActivity(userId, companyId, 'system', `Demo data generated: ${added} invoices added`, '#8b5cf6', '🤖', '');
    return { added, total: invoices.length };
  },

  // ─── BILLING ──────────────────────────────────────────────
  async upgradePlan(userId, plan) {
    const expires = this._addDays(plan === 'growth' ? 30 : plan === 'enterprise' ? 365 : 14);
    return await this._patch(`tables/ff_users/${userId}`, { plan, plan_expires: expires });
  },

  // ─── HTTP HELPERS ─────────────────────────────────────────
  _baseUrl: 'https://freightflow-pkf5.onrender.com/',

  _demoLogin(email, password) {
    if (email?.toLowerCase() === 'demo@freightflow.in' && password === 'demo1234') {
      return {
        id: 'demo-user',
        email: 'demo@freightflow.in',
        name: 'Demo User',
        company: 'Aetra Labs',
        plan: 'growth',
        avatar: '',
        token: 'demo-token',
        gstin: '27AAAAA0000A1Z5',
        onboarded: true,
        role: 'admin'
      };
    }
    return null;
  },

  _authHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const session = Session.get();
    if (session?.token) {
      headers.Authorization = `Bearer ${session.token}`;
    }
    return headers;
  },

  async _get(url) {
    try {
      const fullUrl = this._baseUrl + url;
      if (window.DEBUG_MODE && url.includes('tables/')) {
        console.log(`📋 DATA ACCESS: GET ${url}`);
      }
      const res = await fetch(fullUrl, { headers: this._authHeaders() });
      
      // Handle non-JSON responses
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        if (!res.ok) {
          console.error(`❌ HTTP ERROR GET ${url}: ${res.status}`);
          return { error: `HTTP ${res.status}: ${res.statusText}`, data: [] };
        }
        console.error(`❌ NON-JSON RESPONSE: GET ${url}`);
        return { error: 'Non-JSON response from server', data: [] };
      }
      
      const data = await res.json();
      if (!res.ok && !data.error) {
        data.error = `HTTP ${res.status}`;
      }
      
      if (window.DEBUG_MODE && url.includes('tables/') && data.accessed_company) {
        console.log(`✅ DATA RETRIEVED: Company=${data.accessed_company}, Records=${data.data?.length || 0}`);
      }
      return data;
    } catch (e) { 
      console.error(`❌ DATA ACCESS ERROR: GET ${url} - ${e.message}`);
      return { error: e.message, data: [] }; 
    }
  },

  async _post(url, body) {
    try {
      const fullUrl = this._baseUrl + url;
      // **OPTION C: Frontend Audit Logging**
      if (url.includes('tables/')) {
        console.log(`📋 DATA CREATE: POST ${url}`, { company_id: body.company_id, user_id: body.user_id });
      }
      const res = await fetch(fullUrl, {
        method: 'POST',
        headers: this._authHeaders(),
        body: JSON.stringify(body)
      });
      
      // Handle non-JSON responses
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        if (!res.ok) {
          console.error(`❌ HTTP ERROR POST ${url}: ${res.status}`);
          return { error: `HTTP ${res.status}: ${res.statusText}` };
        }
        console.error(`❌ NON-JSON RESPONSE: POST ${url}`);
        return { error: 'Non-JSON response from server' };
      }
      
      const data = await res.json();
      if (!res.ok && !data.error) {
        data.error = `HTTP ${res.status}`;
      }
      
      if (url.includes('tables/') && !data.error) {
        console.log(`✅ DATA CREATED: ID=${data.id || 'new'}, Company=${body.company_id}`);
      } else if (url.includes('tables/') && data.error) {
        console.warn(`🚫 DATA CREATE FAILED: ${data.error}`);
      }
      return data;
    } catch (e) { 
      console.error(`❌ DATA ACCESS ERROR: POST ${url} - ${e.message}`);
      return { error: e.message }; 
    }
  },

  async _patch(url, body) {
    try {
      const fullUrl = this._baseUrl + url;
      // **OPTION C: Frontend Audit Logging**
      if (url.includes('tables/')) {
        console.log(`📋 DATA UPDATE: PATCH ${url}`, { company_id: body.company_id });
      }
      const res = await fetch(fullUrl, {
        method: 'PATCH',
        headers: this._authHeaders(),
        body: JSON.stringify(body)
      });
      
      // Handle non-JSON responses
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        if (!res.ok) {
          console.error(`❌ HTTP ERROR PATCH ${url}: ${res.status}`);
          return { error: `HTTP ${res.status}: ${res.statusText}` };
        }
        console.error(`❌ NON-JSON RESPONSE: PATCH ${url}`);
        return { error: 'Non-JSON response from server' };
      }
      
      const data = await res.json();
      if (!res.ok && !data.error) {
        data.error = `HTTP ${res.status}`;
      }
      
      if (url.includes('tables/') && !data.error) {
        console.log(`✅ DATA UPDATED: Company=${body.company_id || data.company_id}`);
      } else if (url.includes('tables/') && data.error) {
        console.warn(`🚫 DATA UPDATE FAILED: ${data.error}`);
      }
      return data;
    } catch (e) { 
      console.error(`❌ DATA ACCESS ERROR: PATCH ${url} - ${e.message}`);
      return { error: e.message }; 
    }
  },

  async _delete(url) {
    try {
      const fullUrl = this._baseUrl + url;
      // **OPTION C: Frontend Audit Logging**
      if (url.includes('tables/')) {
        console.log(`📋 DATA DELETE: DELETE ${url}`);
      }
      const res = await fetch(fullUrl, {
        method: 'DELETE',
        headers: this._authHeaders()
      });
      
      // Handle 204 No Content
      if (res.status === 204) {
        if (url.includes('tables/')) {
          console.log(`✅ DATA DELETED: ${url}`);
        }
        return { success: true };
      }
      
      // Handle non-JSON responses
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        if (!res.ok) {
          console.error(`❌ HTTP ERROR DELETE ${url}: ${res.status}`);
          return { error: `HTTP ${res.status}: ${res.statusText}` };
        }
        console.error(`❌ NON-JSON RESPONSE: DELETE ${url}`);
        return { error: 'Non-JSON response from server' };
      }
      
      const data = await res.json();
      if (!res.ok && !data.error) {
        data.error = `HTTP ${res.status}`;
      }
      
      if (url.includes('tables/') && data.success) {
        console.log(`✅ DATA DELETED: ${url}`);
      } else if (url.includes('tables/') && data.error) {
        console.warn(`🚫 DATA DELETE FAILED: ${data.error}`);
      }
      return data;
    } catch (e) { 
      console.error(`❌ DATA ACCESS ERROR: DELETE ${url} - ${e.message}`);
      return { error: e.message }; 
    }
  },

  // ─── UTILS ────────────────────────────────────────────────
  _uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  },
  _addDays(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  },
  _monthYear(dateStr) {
    const d = new Date(dateStr);
    return `${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
  },
  _shortMonth(my) {
    if (!my) return '';
    const [m, y] = my.split('-');
    const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[parseInt(m)]} '${y.slice(2)}`;
  },
  _fmt(n) {
    if (!n) return '₹0';
    if (n >= 10000000) return '₹' + (n / 10000000).toFixed(1) + ' Cr';
    if (n >= 100000) return '₹' + (n / 100000).toFixed(1) + 'L';
    if (n >= 1000) return '₹' + (n / 1000).toFixed(0) + 'K';
    return '₹' + n.toLocaleString('en-IN');
  },
  _calcVendorSpend(invoices) {
    const map = {};
    invoices.forEach(i => { map[i.vendor] = (map[i.vendor] || 0) + (i.total || 0); });
    const total = Object.values(map).reduce((s, v) => s + v, 0) || 1;
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, val]) => ({ name: name.split(' ')[0], value: Math.round(val / total * 100) }));
  },
  _genPredictionInsight(predicted, growth, data) {
    const last = data[data.length - 1];
    if (growth > 0.1) return `Freight costs rising fast (+${Math.round(growth * 100)}%). Budget ${this._fmt(predicted)} for next month.`;
    if (growth < -0.05) return `Freight costs declining (${Math.round(growth * 100)}%). Projected savings: ${this._fmt(last - predicted)}.`;
    return `Freight spend stable. Next month forecast: ${this._fmt(predicted)} (±5% confidence).`;
  }
};

// Export API to global scope for access in other modules
if (typeof window !== 'undefined') window.API = API;

// ─── SESSION STORE (Auth State) ───────────────────────────
const Session = {
  KEY: 'ff_session_v2',
  REFRESH_KEY: 'ff_refresh_time',
  ACTIVITY_KEY: 'ff_last_activity',
  TIMEOUT_KEY: 'ff_timeout_warned',
  
  // Timeout configuration (in milliseconds)
  TIMEOUT_MS: 30 * 60 * 1000,      // 30 minutes
  WARNING_MS: 28 * 60 * 1000,      // 28 minutes (2 min warning)

  save(user) {
    localStorage.setItem(this.KEY, JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      company: user.company,
      plan: user.plan,
      avatar: user.avatar,
      role: user.role,
      token: user.token,
      gstin: user.gstin,
      onboarded: user.onboarded,
      savedAt: Date.now()
    }));
    localStorage.setItem(this.REFRESH_KEY, Date.now());
    this.resetActivity();
  },

  get() {
    try {
      const d = JSON.parse(localStorage.getItem(this.KEY) || 'null');
      if (!d) return null;
      // 24-hour session expiry
      if (Date.now() - d.savedAt > 86400000) { this.clear(); return null; }
      return d;
    } catch { return null; }
  },

  clear() { 
    localStorage.removeItem(this.KEY); 
    localStorage.removeItem(this.REFRESH_KEY);
    localStorage.removeItem(this.ACTIVITY_KEY);
    localStorage.removeItem(this.TIMEOUT_KEY);
  },

  isLoggedIn() { return !!this.get(); },

  getToken() {
    const user = this.get();
    return user && user.token ? user.token : null;
  },

  // ─── SESSION TIMEOUT ──────────────────────────────────────
  // Track user activity to determine inactivity
  recordActivity() {
    if (!this.isLoggedIn()) return;
    localStorage.setItem(this.ACTIVITY_KEY, Date.now());
  },

  resetActivity() {
    localStorage.setItem(this.ACTIVITY_KEY, Date.now());
    localStorage.removeItem(this.TIMEOUT_KEY); // Clear warning flag on activity
  },

  getLastActivityTime() {
    const lastActivity = localStorage.getItem(this.ACTIVITY_KEY);
    return lastActivity ? parseInt(lastActivity) : null;
  },

  getInactivityTime() {
    const lastActivity = this.getLastActivityTime();
    if (!lastActivity) return 0;
    return Date.now() - lastActivity;
  },

  isInactivityWarning() {
    const inactivityTime = this.getInactivityTime();
    return inactivityTime > this.WARNING_MS && inactivityTime < this.TIMEOUT_MS;
  },

  hasTimedOut() {
    return this.getInactivityTime() > this.TIMEOUT_MS;
  },

  wasWarned() {
    return localStorage.getItem(this.TIMEOUT_KEY) === 'true';
  },

  setWarned() {
    localStorage.setItem(this.TIMEOUT_KEY, 'true');
  },

  getTimeRemaining() {
    const remaining = this.TIMEOUT_MS - this.getInactivityTime();
    return Math.max(0, remaining);
  },

  getWarningRemaining() {
    const timeUntilLogout = this.getTimeRemaining();
    return Math.max(0, timeUntilLogout);
  },

  // Auto-refresh token when it expires
  async refreshToken() {
    try {
      const user = this.get();
      if (!user || !user.token) {
        console.warn('⚠️ Cannot refresh: No session found');
        return false;
      }
      
      const response = await fetch('https://freightflow-pkf5.onrender.com/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ email: user.email })
      });

      if (!response.ok) {
        console.error('❌ Token refresh failed:', response.status);
        if (response.status === 401) {
          this.clear();
          window.location.href = '/login.html';
        }
        return false;
      }

      const data = await response.json();
      if (data.token) {
        user.token = data.token;
        this.save(user);
        console.log('✅ Token refreshed successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Token refresh error:', error);
      return false;
    }
  }
};

// Export Session to global scope
if (typeof window !== 'undefined') window.Session = Session;

// --- Sample API call for sending an invite (email or WhatsApp) ---
// Usage: callInviteUser({ email, name, role, phone, channel: 'whatsapp' })
async function callInviteUser({ email, name, role, phone, channel = 'email' }) {
  const res = await fetch("https://freightflow-pkf5.onrender.com/auth/invite", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: Session.getToken() ? `Bearer ${Session.getToken()}` : undefined
    },
    body: JSON.stringify({ email, name, role, phone, channel })
  });
  const data = await res.json();
  if (data.invite_token) {
    let message = `✅ Invite sent successfully!\n\nName: ${name}\nRole: ${role}\nChannel: ${channel.toUpperCase()}\nInvite Token: ${data.invite_token}`;
    
    // Add email status information
    if (channel === 'email' && data.email) {
      if (data.email.status === 'sent') {
        message += `\n\n📧 Email Status: DELIVERED`;
      } else if (data.email.status === 'mock') {
        message += `\n\n⚠️  Email Status: MOCK MODE (Configure .env for production)`;
      } else if (data.email.status === 'error') {
        message += `\n\n❌ Email Status: FAILED\nError: ${data.email.error}`;
      }
    }
    
    // Add WhatsApp status
    if (channel === 'whatsapp' && data.whatsapp) {
      if (data.whatsapp.status === 'sent') {
        message += `\n\n📱 WhatsApp Status: SENT\nMessage ID: ${data.whatsapp.messageId || 'N/A'}`;
      } else if (data.whatsapp.status === 'mock') {
        message += `\n\n⚠️  WhatsApp Status: MOCK MODE`;
      } else if (data.whatsapp.status === 'error') {
        message += `\n\n❌ WhatsApp Status: FAILED\nError: ${data.whatsapp.error}`;
      }
    }
    
    alert(message);
    return { ...data, success: true };
  } else {
    let errorMsg = data.error || JSON.stringify(data);
    
    // Provide helpful error messages
    if (res.status === 409) {
      errorMsg = `User with email "${email}" already exists. Please use a different email address.`;
    } else if (res.status === 403) {
      errorMsg = "You don't have permission to send invitations. Admin role required.";
    } else if (res.status === 401) {
      errorMsg = "Your session has expired. Please login again.";
    } else if (res.status === 400) {
      errorMsg = "Invalid invitation data. Please check all required fields.";
    }
    
    alert(`❌ Invite failed:\n${errorMsg}`);
    return { ...data, success: false, error: errorMsg };
  }
}

// --- Sample API call for notification history ---
// Usage: callGetNotifications()
async function callGetNotifications() {
  const res = await fetch("https://freightflow-pkf5.onrender.com/api/notifications", {
    headers: {
      Authorization: Session.getToken() ? `Bearer ${Session.getToken()}` : undefined
    }
  });
  const data = await res.json();
  console.log("Notifications:", data.data);
  return data.data;
}

// --- Sample API call for billing plan upgrade ---
// Usage: callUpgradePlan({ plan: 'growth', duration: 365 })
async function callUpgradePlan({ plan, duration }) {
  const res = await fetch("https://freightflow-pkf5.onrender.com/api/billing/upgrade", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: Session.getToken() ? `Bearer ${Session.getToken()}` : undefined
    },
    body: JSON.stringify({ plan, duration })
  });
  const data = await res.json();
  alert("Plan upgraded: " + JSON.stringify(data));
  return data;
}

// --- Sample API call for integration connect ---
// Usage: callIntegrationConnect('whatsapp', { apiKey: 'xxx' })
async function callIntegrationConnect(provider, config) {
  const res = await fetch(`https://freightflow-pkf5.onrender.com/api/integrations/${provider}/connect`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: Session.getToken() ? `Bearer ${Session.getToken()}` : undefined
    },
    body: JSON.stringify(config)
  });
  const data = await res.json();
  alert(provider + " integration: " + JSON.stringify(data));
  return data;
}

// ═══════════════════════════════════════════════════════════════
// CLIENT-SIDE AUDIT LOGGING
// ═══════════════════════════════════════════════════════════════

// Frontend audit helper for logging user actions
const Audit = {
  // Log an action (called from frontend)
  async log(action, details = {}) {
    if (!Session.isLoggedIn()) return;
    
    const user = Session.get();
    const entry = {
      timestamp: new Date().toISOString(),
      user_id: user.id,
      email: user.email,
      action,
      details,
      page: window.location.hash || 'dashboard',
      userAgent: navigator.userAgent.substring(0, 100)
    };

    // Store locally for offline capability
    try {
      const existing = JSON.parse(localStorage.getItem('ff_audit_local') || '[]');
      existing.push(entry);
      localStorage.setItem('ff_audit_local', JSON.stringify(existing.slice(-50))); // Keep last 50
    } catch (e) {
      console.warn('Could not store local audit log');
    }

    console.log(`📝 Audit: ${action}`, details);
  },

  // Predefined audit events
  logNavigation(page) {
    this.log('navigate_page', { page });
  },

  logInvoiceCreated(invoiceId, amount) {
    this.log('invoice_created', { invoice_id: invoiceId, amount });
  },

  logInvoiceApproved(invoiceId) {
    this.log('invoice_approved', { invoice_id: invoiceId });
  },

  logInvoiceRejected(invoiceId, reason) {
    this.log('invoice_rejected', { invoice_id: invoiceId, reason });
  },

  logPaymentApproved(amount, method) {
    this.log('payment_approved', { amount, method });
  },

  logReportViewed(reportType) {
    this.log('report_viewed', { report_type: reportType });
  },

  logSettingsChanged(setting, oldValue, newValue) {
    this.log('settings_changed', { setting, old_value: oldValue, new_value: newValue });
  },

  logAdminAction(action, target) {
    this.log(`admin_${action}`, { target });
  }
};

// Auto-log page navigation (initialized in app.js after Router loads)

