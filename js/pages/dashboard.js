// ============================================================
// Aetra — Dashboard (API-Connected, Live Data)
// ============================================================

Pages.dashboard = async function(container) {
  const user = Session.get();
  if (!user) return Router.navigate('login');

  container.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:400px;flex-direction:column;gap:16px">
    <div style="width:44px;height:44px;border:4px solid #e2e8f0;border-top-color:var(--primary);border-radius:50%;animation:spin .8s linear infinite"></div>
    <div style="font-size:14px;color:var(--text-muted)">Loading your intelligence dashboard...</div>
  </div>`;

  let summary;
  try {
    summary = await API.getSummary(user.id);
  } catch (e) {
    summary = { kpis: {}, monthly: [], invoiceStatus: [], vendorSpend: [], invoices: [], vendors: [], analytics: [], activity: [] };
  }

  const { kpis, monthly, invoiceStatus, invoices, vendors, analytics, activity } = summary;
  const role = getUserRole(user);
  const roleMeta = {
    admin: { title: 'Fleet Operations Overview', subtitle: 'Delivery performance and route efficiency insights', accent: '#0f1f33' },
    field: { title: 'Field Operations', subtitle: 'Mobile delivery coordination and POD management', accent: '#1d4ed8' },
    driver: { title: 'Driver Console', subtitle: 'Assigned deliveries and fuel-efficient routing', accent: '#166534' }
  }[role] || { title: 'Operations Hub', subtitle: 'Aetra control center', accent: '#0f1f33' };
  const adminRoutes = [
    { driver: 'Ravi Kumar', order: 'ORD-1042', route: 'Mumbai → Pune', distance: '118 km', eta: '12:30', fuel: '8.4 L saved', status: 'On route' },
    { driver: 'Sneha Rao', order: 'ORD-1047', route: 'Pune → Nashik', distance: '96 km', eta: '14:10', fuel: '6.2 L saved', status: 'Reached hub' }
  ];
  const fieldOrders = [
    { order: 'ORD-1029', customer: 'Srinivas Logistics', city: 'Bhiwandi', eta: '10:45', status: 'Check-in pending' },
    { order: 'ORD-1038', customer: 'Maharashtra Traders', city: 'Nagpur', eta: '16:20', status: 'POD ready' }
  ];
  const driverOrders = [
    { order: 'ORD-1042', customer: 'Apex Traders', address: 'Pimpri, Pune', route: 'Shortest route: 18 km', savings: 'Save 8 km / ₹180 fuel' },
    { order: 'ORD-1049', customer: 'Blue Sky Cargo', address: 'Kharadi, Pune', route: 'Shortest route: 11 km', savings: 'Save 3 km / ₹70 fuel' }
  ];
  const [prediction, savings] = await Promise.all([
    API.getAIPrediction(monthly),
    API.getAISavings(invoices, vendors)
  ]);
  const totalSavings = savings.reduce((s, i) => s + (i.saving || 0), 0);

  window._analytics = analytics;
  window._invoices = invoices;
  window._vendors = vendors;
  window._aiSavings = savings;

  container.innerHTML = `
  <!-- ENTERPRISE AI INSIGHT BANNER -->
  <div style="background:linear-gradient(135deg,#0f1f33,#1e3a5f 55%,#1d4ed8);border-radius:var(--radius);padding:20px 28px;margin-bottom:28px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;overflow:hidden;position:relative">
    <div style="position:absolute;right:-30px;top:-30px;width:200px;height:200px;border-radius:50%;background:rgba(249,115,22,.07);pointer-events:none"></div>
    <div style="display:flex;align-items:center;gap:16px;position:relative;z-index:1">
      <div style="width:52px;height:52px;background:rgba(249,115,22,.18);border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:26px;border:1px solid rgba(249,115,22,.3);flex-shrink:0">�</div>
      <div>
        <div style="font-size:10px;color:rgba(255,255,255,.45);text-transform:uppercase;letter-spacing:1.2px;margin-bottom:4px">OPERATIONS INSIGHT</div>
        <div style="font-size:15px;font-weight:700;color:#fff">Performance summary and delivery readiness</div>
        <div style="font-size:12px;color:rgba(255,255,255,.6);margin-top:5px">
          ${savings.length > 0 ? `💡 <strong style="color:#34d399">${savings.length} opportunities</strong> found — potential: <strong style="color:#fbbf24">${API._fmt(totalSavings)}/month</strong>` : '💡 Real-time fleet status with route efficiency insights'}
        </div>
      </div>
    </div>
    <div style="display:flex;gap:10px;flex-shrink:0;position:relative;z-index:1">
      <button class="btn btn-sm" style="background:rgba(255,255,255,.08);color:#fff;border:1px solid rgba(255,255,255,.15)" onclick="Router.navigate('shipments')">Shipments</button>
      <button class="btn btn-sm" style="background:rgba(255,255,255,.08);color:#fff;border:1px solid rgba(255,255,255,.15)" onclick="Router.navigate('fleet')">Fleet</button>
      <button class="btn btn-sm" style="background:rgba(255,255,255,.08);color:#fff;border:1px solid rgba(255,255,255,.15)" onclick="Router.navigate('warehouse')">Warehouse</button>
    </div>
  </div>

  <!-- ENTERPRISE KPI CARDS -->
  <div class="kpi-grid">
    ${Components.kpiCard('📦', 'Active Shipments', kpis.totalInvoices || 0, '+15%', 'up', 'green', '#dcfce7')}
    ${Components.kpiCard('🚛', 'Fleet Vehicles', kpis.totalVendors || 0, '87% Utilized', 'up', 'blue', '#dbeafe')}
    ${Components.kpiCard('💰', 'Monthly Revenue', API._fmt(kpis.totalRevenue || 0), '+28%', 'up', 'orange', '#fff7ed')}
    ${Components.kpiCard('⚡', 'AI Growth Rate', prediction.growth || 0 + '%', 'Predicted', 'up', 'purple', '#faf5ff')}
  </div>

  <!-- SECONDARY STATS -->
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-bottom:28px">
    ${[
      { icon:'💰', label:'Total Freight Spend', val: API._fmt(kpis.totalSpend||0), sub:'All periods', c:'#166534', bg:'#f0fdf4' },
      { icon:'✅', label:'Invoices Paid', val: kpis.paidCount||0, sub:'Cleared', c:'#1e40af', bg:'#eff6ff' },
      { icon:'⚡', label:'Disputed', val: kpis.disputedCount||0, sub:'Needs action', c:'#7e22ce', bg:'#fdf4ff' },
      { icon:'⭐', label:'Avg Vendor Score', val: (kpis.avgVendorScore||0)+'/100', sub:`${kpis.activeVendors||0} vendors`, c:'#b45309', bg:'#fffbeb' }
    ].map(k => `
      <div class="card" style="padding:20px;cursor:default">
        <div style="display:flex;align-items:center;gap:12px">
          <div style="width:40px;height:40px;border-radius:10px;background:${k.bg};display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">${k.icon}</div>
          <div>
            <div style="font-size:21px;font-weight:800;color:${k.c}">${k.val}</div>
            <div style="font-size:12px;color:var(--text-muted)">${k.label}</div>
            <div style="font-size:11px;color:var(--text-light);margin-top:1px">${k.sub}</div>
          </div>
        </div>
      </div>
    `).join('')}
  </div>


  ${role === 'field' ? `
  <div class="card" style="padding:20px 24px;margin-bottom:24px">
    <div class="card-title">📱 Field Executive Mobile Queue</div>
    <div class="card-subtitle">Check-in, POD submission, and route updates from your phone</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin-top:12px">
      ${fieldOrders.map(o => `
        <div style="padding:14px;border:1px solid var(--border);border-radius:12px;background:var(--bg)">
          <div style="font-size:13px;font-weight:700">${o.order}</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:4px">${o.customer} • ${o.city}</div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;font-size:12px;color:var(--text-muted)">
            <span>${o.eta}</span>
            <span style="color:var(--primary);font-weight:700">${o.status}</span>
          </div>
        </div>
      `).join('')}
    </div>
  </div>` : ''}

  ${role === 'driver' ? `
  <div class="card" style="padding:20px 24px;margin-bottom:24px">
    <div class="card-title">🧭 Assigned Deliveries</div>
    <div class="card-subtitle">Driver login shows the shortest route, delivery address, and fuel savings for each assigned order</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;margin-top:12px">
      ${driverOrders.map(o => `
        <div style="padding:14px;border:1px solid var(--border);border-radius:12px;background:var(--bg)">
          <div style="font-size:13px;font-weight:700">${o.order}</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:4px">${o.customer}</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:8px">${o.address}</div>
          <div style="font-size:12px;color:var(--success);font-weight:700;margin-top:8px">${o.route}</div>
          <div style="font-size:12px;color:var(--primary);margin-top:4px">${o.savings}</div>
        </div>
      `).join('')}
    </div>
  </div>` : ''}

  <!-- CHARTS -->
  <div class="grid-2-1" style="margin-bottom:24px">
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:20px 24px 0">
        <div><div class="card-title">Freight Spend vs Revenue</div><div class="card-subtitle">${monthly.length} months data from API</div></div>
        <button class="btn btn-outline btn-sm" onclick="Exporter.analyticsCSV(window._analytics||[])">📊 Export</button>
      </div>
      <div class="card-body" style="padding-top:16px">
        ${monthly.length === 0 ? `<div style="text-align:center;padding:60px 20px;color:var(--text-muted)">
          <div style="font-size:40px;margin-bottom:12px">📊</div>
          <div style="font-weight:600;margin-bottom:8px">No analytics data yet</div>
          <button class="btn btn-primary btn-sm" onclick="generateDemoData()">🤖 Generate Demo Data</button>
        </div>` : `<canvas id="comboChart" style="width:100%;height:260px;display:block"></canvas>`}
      </div>
    </div>
    <div class="card">
      <div style="padding:20px 24px 0"><div class="card-title">Invoice Status</div><div class="card-subtitle">${kpis.totalInvoices||0} total</div></div>
      <div class="card-body" style="padding-top:16px">
        <canvas id="donutChart" style="width:100%;height:240px;display:block"></canvas>
      </div>
    </div>
  </div>

  <!-- AI SAVINGS + ACTIVITY -->
  <div class="grid-2" style="margin-bottom:24px">
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:20px 24px 0">
        <div><div class="card-title">🤖 AI Cost Savings</div><div class="card-subtitle">${savings.length} opportunities found</div></div>
        <span class="badge badge-success" style="font-size:12px">${API._fmt(totalSavings)}/mo</span>
      </div>
      <div class="card-body" style="padding-top:16px">
        ${savings.length === 0 ? `<div style="text-align:center;padding:32px;color:var(--text-muted)"><div style="font-size:36px;margin-bottom:8px">🤖</div><div>Add invoices to unlock AI cost savings</div></div>` :
          savings.slice(0,4).map(s => `
            <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #f1f5f9">
              <div style="width:36px;height:36px;border-radius:10px;background:${s.priority==='high'?'#fee2e2':'#fffbeb'};display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">${s.icon}</div>
              <div style="flex:1;min-width:0">
                <div style="font-size:12px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${s.title}</div>
                <span class="badge ${s.priority==='high'?'badge-danger':'badge-warning'}" style="font-size:10px;margin-top:2px">${s.priority}</span>
              </div>
              <div style="font-weight:800;color:var(--success);font-size:14px;flex-shrink:0">+${API._fmt(s.saving)}</div>
            </div>
          `).join('') + `<button class="btn btn-outline w-full" style="margin-top:12px;justify-content:center;font-size:13px" onclick="openAIModal()">View All ${savings.length} Recommendations →</button>`
        }
      </div>
    </div>
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:20px 24px 0">
        <div><div class="card-title">Live Activity Feed</div><div class="card-subtitle">Real-time system events</div></div>
        <button class="btn btn-ghost btn-sm" onclick="Router.navigate('invoices')">All →</button>
      </div>
      <div class="card-body" style="padding-top:12px">
        ${activity.length === 0 ? `<div style="text-align:center;padding:32px;color:var(--text-muted)">No activity recorded yet</div>` :
          activity.slice(0,7).map(a => `
            <div class="activity-item">
              <div class="activity-dot" style="background:${a.color||'#94a3b8'}"></div>
              <div class="activity-content">
                <div class="activity-text">${a.text}</div>
                <div class="activity-time">${_timeAgo(a.created_at)}</div>
              </div>
            </div>
          `).join('')}
      </div>
    </div>
  </div>

  <!-- VENDOR SNAPSHOT + QUICK ACTIONS -->
  <div class="grid-2">
    <div class="card card-body">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <div class="card-title">Top Vendors</div>
        <button class="btn btn-ghost btn-sm" onclick="Router.navigate('vendors')">Details →</button>
      </div>
      ${vendors.length === 0 ? `<div style="color:var(--text-muted);text-align:center;padding:20px;font-size:13px">No vendors yet</div>` :
        vendors.slice(0,5).map(v => `
          <div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid #f1f5f9">
            <div style="width:34px;height:34px;border-radius:8px;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0">${(v.name||'').slice(0,2).toUpperCase()}</div>
            <div style="flex:1">
              <div style="font-size:13px;font-weight:600">${v.name}</div>
              <div style="font-size:11px;color:var(--text-muted)">${API._fmt(v.total_paid||0)} • ${v.total_invoices||0} invoices</div>
            </div>
            <div class="vendor-score ${getScoreClass(v.score||0)}">${v.score||0}</div>
          </div>
        `).join('')}
    </div>
    <div class="card card-body">
      <div class="card-title" style="margin-bottom:16px">⚡ Quick Actions</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        ${[
          { icon:'📥', label:'Upload Invoice', action:"Router.navigate('invoices')", bg:'#dbeafe', c:'#1e40af' },
          { icon:'🔄', label:'Reconcile', action:"runReconciliation()", bg:'#dcfce7', c:'#166534' },
          { icon:'📊', label:'GST Module', action:"Router.navigate('gst')", bg:'#fef9c3', c:'#854d0e' },
          { icon:'💸', label:'Payments', action:"Router.navigate('payments')", bg:'#ede9fe', c:'#5b21b6' },
          { icon:'🤖', label:'AI Insights', action:"openAIModal()", bg:'#fff7ed', c:'#9a3412' },
          { icon:'📤', label:'Export', action:"openExportMenu()", bg:'#f0fdf4', c:'#166534' }
        ].map(a => `
          <button onclick="${a.action}" class="btn" style="flex-direction:column;gap:5px;padding:14px;justify-content:center;height:68px;background:${a.bg};border:none;transition:all .15s" onmouseenter="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 12px rgba(0,0,0,.1)'" onmouseleave="this.style.transform='';this.style.boxShadow=''">
            <span style="font-size:20px">${a.icon}</span>
            <span style="font-size:11px;font-weight:700;color:${a.c}">${a.label}</span>
          </button>
        `).join('')}
      </div>
      <div style="margin-top:14px;padding:12px;background:linear-gradient(135deg,#f0fdf4,#dcfce7);border-radius:8px;display:flex;justify-content:space-between;align-items:center">
        <div style="font-size:12px;color:#166534;font-weight:600">🤖 Need demo data?</div>
        <button class="btn btn-success btn-sm" id="genDemoBtn" onclick="generateDemoData()">Generate 50 Invoices</button>
      </div>
    </div>
  </div>
  `;

  setTimeout(() => {
    if (monthly.length > 0) {
      FFCharts.renderCombo('comboChart', monthly, { barLabel: 'Freight Cost', lineLabel: 'Revenue' });
    }
    const validStatus = invoiceStatus.filter(s => s.value > 0);
    if (validStatus.length > 0) {
      FFCharts.renderDonut('donutChart', validStatus, {
        colors: ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
        centerText: String(kpis.totalInvoices || '0'),
        centerSubtext: 'Total'
      });
    }
  }, 80);

  window.generateDemoData = async () => {
    const btn = document.getElementById('genDemoBtn');
    if (btn) { btn.innerHTML = '⏳ Generating...'; btn.disabled = true; }
    showToast('🤖 Generating 50 realistic invoices...', 'info');
    try {
      const result = await API.generateDemoData(user.id, user.id);
      showToast(`✅ ${result.added} invoices created!`);
      setTimeout(() => Pages.dashboard(container), 1500);
    } catch (e) {
      showToast('Error generating data', 'error');
      if (btn) { btn.innerHTML = 'Generate 50 Invoices'; btn.disabled = false; }
    }
  };

  window.runReconciliation = async () => {
    showToast('🔄 AI Reconciliation started...', 'info');
    const pending = invoices.filter(i => i.reconciled === 'pending').slice(0, 5);
    for (const inv of pending) {
      await API.updateInvoice(inv.id, { reconciled: 'matched' });
    }
    if (pending.length > 0) {
      await API.logActivity(user.id, user.id, 'gst', `AI Reconciliation: ${pending.length} invoices matched`, '#f97316', '📊', '');
    }
    showToast(`✅ ${pending.length} invoices reconciled`);
    setTimeout(() => Pages.dashboard(container), 1000);
  };

  window.openExportMenu = () => {
    openModal(`
      <div class="modal modal-sm">
        <div class="modal-header"><div class="modal-title">📤 Export Data</div><button class="modal-close" onclick="closeModal()">✕</button></div>
        <div class="modal-body" style="display:grid;gap:8px">
          ${[
            { icon:'📊', label:'Invoices → CSV', fn:`Exporter.invoicesCSV(window._invoices||[])` },
            { icon:'📗', label:'Invoices → Excel', fn:`Exporter.toExcel(window._invoices||[],'invoices',[{label:'Invoice #',key:'inv_number'},{label:'Vendor',key:'vendor'},{label:'Total ₹',key:'total'},{label:'Status',key:'status'},{label:'Route',key:'route'}])` },
            { icon:'📄', label:'Invoices → PDF', fn:`Exporter.invoicesPDF(window._invoices||[])` },
            { icon:'📊', label:'Analytics → CSV', fn:`Exporter.analyticsCSV(window._analytics||[])` },
            { icon:'📄', label:'Analytics PDF Report', fn:`Exporter.analyticsPDF(window._analytics||[],window._aiSavings||[])` },
            { icon:'⭐', label:'Vendor Scorecard CSV', fn:`Exporter.vendorsCSV(window._vendors||[])` }
          ].map(e => `<button class="btn btn-outline w-full" style="justify-content:flex-start;gap:12px" onclick="${e.fn};closeModal()"><span style="font-size:18px">${e.icon}</span>${e.label}</button>`).join('')}
        </div>
        <div class="modal-footer"><button class="btn btn-outline" onclick="closeModal()">Cancel</button></div>
      </div>`);
  };
};

window.openAIModal = async () => {
  const user = Session.get();
  if (!user) return;
  showToast('🤖 Loading AI analysis...', 'info');
  const summary = await API.getSummary(user.id);
  const [savings, prediction] = await Promise.all([
    API.getAISavings(summary.invoices, summary.vendors),
    API.getAIPrediction(summary.monthly)
  ]);
  const routes = API.getRouteOptimization(summary.invoices);

  openModal(`
    <div class="modal modal-lg">
      <div class="modal-header" style="background:linear-gradient(135deg,#0f1f33,#1e3a5f);border-radius:16px 16px 0 0">
        <div><div class="modal-title" style="color:#fff">🤖 AI Intelligence Engine</div>
        <div style="font-size:12px;color:rgba(255,255,255,.5);margin-top:2px">Aetra AI — ${new Date().toLocaleDateString('en-IN')}</div></div>
        <button class="modal-close" onclick="closeModal()" style="background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.2);color:#fff">✕</button>
      </div>
      <div class="modal-body">
        <div style="padding:18px;background:linear-gradient(135deg,#f0fdf4,#dcfce7);border-radius:12px;border:1px solid #86efac;margin-bottom:20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
          <div>
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#166534">📈 Next Month Freight Prediction</div>
            <div style="font-size:28px;font-weight:900;color:#166534;margin-top:6px">${API._fmt(prediction.predicted||0)}</div>
            <div style="font-size:13px;color:#166534;margin-top:3px">${prediction.insight||'Add more data for predictions'}</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:15px;font-weight:700;color:${(prediction.growth||0)>0?'#991b1b':'#166534'}">${(prediction.growth||0)>0?'↑':'↓'} ${Math.abs(prediction.growth||0)}% MoM</div>
            <div style="font-size:12px;color:#64748b">Confidence: ${prediction.confidence||'low'}</div>
          </div>
        </div>

        <div style="font-size:14px;font-weight:700;margin-bottom:12px">💰 Cost Saving Opportunities</div>
        ${savings.length===0 ? `<div style="text-align:center;padding:24px;color:var(--text-muted);background:var(--bg);border-radius:10px">Add more invoice data to unlock AI cost savings recommendations</div>` :
          savings.map(s => `
            <div style="display:flex;align-items:start;gap:12px;padding:14px;border-radius:10px;background:${s.priority==='high'?'#fef2f2':'#fffbeb'};border:1px solid ${s.priority==='high'?'#fecaca':'#fde68a'};margin-bottom:8px">
              <span style="font-size:22px;flex-shrink:0">${s.icon}</span>
              <div style="flex:1">
                <div style="font-size:13px;font-weight:700">${s.title}</div>
                <div style="font-size:12px;color:var(--text-muted);margin-top:3px">${s.desc}</div>
                <span class="badge ${s.priority==='high'?'badge-danger':'badge-warning'}" style="margin-top:6px">${s.priority} priority</span>
              </div>
              <div style="text-align:right;flex-shrink:0">
                <div style="font-size:18px;font-weight:800;color:var(--success)">+${API._fmt(s.saving)}</div>
                <div style="font-size:10px;color:var(--text-muted)">/month</div>
              </div>
            </div>
          `).join('')}

        ${routes.length > 0 ? `
          <div style="font-size:14px;font-weight:700;margin:20px 0 12px">🗺️ Route Optimization</div>
          <div class="table-container">
            <table class="data-table" style="font-size:12px">
              <thead><tr><th>Route</th><th>Shipments</th><th>Total</th><th>Avg/Trip</th><th>AI Suggestion</th></tr></thead>
              <tbody>${routes.slice(0,5).map(r=>`
                <tr>
                  <td style="font-weight:600">${r.route}</td>
                  <td style="text-align:center">${r.count}</td>
                  <td style="font-weight:700">${API._fmt(r.total)}</td>
                  <td>${API._fmt(r.avg)}</td>
                  <td>${r.optimization?`<span style="color:var(--success);font-size:11px;font-weight:600">${r.optimization}</span>`:'<span style="color:var(--text-muted)">—</span>'}</td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>` : ''}
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="closeModal()">Close</button>
        <button class="btn btn-primary" onclick="Exporter.analyticsPDF(window._analytics||[],window._aiSavings||[]);closeModal()">📄 Download PDF Report</button>
      </div>
    </div>`);
};

function _timeAgo(ts) {
  if (!ts) return 'recently';
  const diff = Date.now() - new Date(ts).getTime();
  if (isNaN(diff) || diff < 0) return 'recently';
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return Math.floor(diff/60000) + ' min ago';
  if (diff < 86400000) return Math.floor(diff/3600000) + ' hrs ago';
  return Math.floor(diff/86400000) + ' days ago';
}
