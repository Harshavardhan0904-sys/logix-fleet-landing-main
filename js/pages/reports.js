// ============================================================
// Aetra — Reports & Analytics (API-Connected)
// Live charts, AI predictions, industry benchmarks
// ============================================================

Pages.reports = async function(container) {
  const user = Session.get();
  if (!user) return Router.navigate('login');

  container.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:300px;flex-direction:column;gap:12px">
    <div style="width:36px;height:36px;border:3px solid #e2e8f0;border-top-color:var(--primary);border-radius:50%;animation:spin .7s linear infinite"></div>
    <div style="font-size:13px;color:var(--text-muted)">Loading analytics & AI insights...</div>
  </div>`;

  let summary = { invoices: [], vendors: [], monthly: [], analytics: [], kpis: {}, vendorSpend: [] };
  try {
    summary = await API.getSummary(user.id);
  } catch (e) { /* use static */ }

  const useAPI = summary.invoices?.length > 0 || summary.analytics?.length > 0;
  const monthly = useAPI && summary.monthly?.length > 0 ? summary.monthly : FF_DATA.monthlySpend.map(m => ({
    label: m.month, bar: m.freight, line: m.revenue, month_year: m.month
  }));
  const vendorSpend = useAPI && summary.vendorSpend?.length > 0 ? summary.vendorSpend : FF_DATA.vendorSpend.map(v => ({ name: v.name, value: v.value, label: v.name }));

  const [prediction, savings] = await Promise.all([
    API.getAIPrediction(monthly),
    API.getAISavings(summary.invoices || [], summary.vendors || [])
  ]);

  const totalSpend = monthly.reduce((s, m) => s + (m.bar || m.freight || 0), 0);
  const totalRevenue = monthly.reduce((s, m) => s + (m.line || m.revenue || 0), 0);
  const freightRatio = totalRevenue > 0 ? (totalSpend / totalRevenue * 100).toFixed(1) : '0';
  const invoiceCount = summary.kpis?.totalInvoices || summary.invoices?.length || 284;
  const totalSavings = savings.reduce((s, i) => s + (i.saving || 0), 0);

  let dateFrom = new Date(); dateFrom.setMonth(dateFrom.getMonth() - 6);
  let dateTo = new Date();
  let activeTab = 'overview';

  function render() {
    container.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h2>Reports & Analytics</h2>
        <p>Business intelligence & AI-powered freight insights${useAPI ? ' — Live Data' : ' — Demo Data'}</p>
      </div>
      <div class="page-header-right">
        <div style="display:flex;align-items:center;gap:8px">
          <input class="filter-input" type="date" value="${dateFrom.toISOString().split('T')[0]}" onchange="dateFrom=new Date(this.value)">
          <span style="color:var(--text-muted);font-size:12px">to</span>
          <input class="filter-input" type="date" value="${dateTo.toISOString().split('T')[0]}" onchange="dateTo=new Date(this.value)">
        </div>
        <div class="dropdown" id="exportDropdown">
          <button class="btn btn-primary" id="exportRepBtn" onclick="toggleRepExportMenu()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export ▾
          </button>
          <div class="dropdown-menu hidden" id="repExportMenu">
            <div class="dropdown-item" onclick="doRepExport('csv')">📊 Export as CSV</div>
            <div class="dropdown-item" onclick="doRepExport('pdf')">📄 Export as PDF</div>
            <div class="dropdown-item" onclick="doRepExport('excel')">📗 Export as Excel</div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-item" onclick="showToast('Report scheduled for email delivery','success')">📧 Schedule Email Report</div>
          </div>
        </div>
      </div>
    </div>

    <!-- AI PREDICTION BANNER -->
    <div style="padding:24px 28px;background:linear-gradient(135deg,#0f1f33,#1e3a5f 55%,#1d4ed8);border-radius:var(--radius);margin-bottom:24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;position:relative;overflow:hidden">
      <div style="position:absolute;right:-20px;top:-20px;width:180px;height:180px;border-radius:50%;background:rgba(249,115,22,.06);pointer-events:none"></div>
      <div style="display:flex;align-items:center;gap:16px;position:relative;z-index:1">
        <div style="font-size:36px">🤖</div>
        <div>
          <div style="font-size:11px;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">AI Predictive Engine</div>
          <div style="font-size:16px;font-weight:700;color:#fff;margin-bottom:4px">
            ${prediction.predicted > 0 ? `Next month forecast: <span style="color:#fbbf24">${API._fmt(prediction.predicted)}</span>` : 'Add more invoice data for AI predictions'}
          </div>
          <div style="font-size:13px;color:rgba(255,255,255,.65)">
            ${prediction.insight || '💡 AI engine learns from your invoice patterns to predict future costs'}
          </div>
          ${totalSavings > 0 ? `<div style="font-size:12px;color:rgba(255,255,255,.6);margin-top:4px">💡 <strong style="color:#34d399">${savings.length} savings opportunities</strong> found — <strong style="color:#fbbf24">${API._fmt(totalSavings)}/month</strong> potential</div>` : ''}
        </div>
      </div>
      <div style="display:flex;gap:10px;flex-shrink:0;position:relative;z-index:1">
        ${prediction.predicted > 0 ? `
          <div style="text-align:center;padding:12px 20px;background:rgba(255,255,255,.08);border-radius:10px;border:1px solid rgba(255,255,255,.1)">
            <div style="font-size:22px;font-weight:900;color:${(prediction.growth||0)>0?'#f87171':'#34d399'}">${(prediction.growth||0)>0?'↑':'↓'} ${Math.abs(prediction.growth||0)}%</div>
            <div style="font-size:11px;color:rgba(255,255,255,.5)">MoM Change</div>
          </div>
        ` : ''}
        <button class="btn btn-accent btn-sm" onclick="openAIModal()">View Full AI Report →</button>
      </div>
    </div>

    <!-- KPI SUMMARY -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-bottom:28px">
      ${[
        { icon:'💰', label:'Total Freight Spend (6M)', val: API._fmt(totalSpend), sub:'All periods combined', bg:'#eff6ff', c:'var(--primary)' },
        { icon:'📈', label:'Total Revenue (6M)', val: API._fmt(totalRevenue), sub:`${freightRatio}% freight-to-revenue`, bg:'#f0fdf4', c:'var(--success)' },
        { icon:'🚛', label:'Invoices Processed', val: invoiceCount, sub: useAPI ? `${summary.kpis?.paidCount||0} paid, ${summary.kpis?.pendingCount||0} pending` : '98.7% reconciled', bg:'#fff7ed', c:'var(--accent)' },
        { icon:'⏱️', label:'Avg Processing Time', val: '4.2 hrs', sub:'Down from 48 hrs manually', bg:'#fdf4ff', c:'var(--purple)' }
      ].map(k => `
        <div class="card" style="padding:20px;transition:all .15s" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 20px rgba(0,0,0,.07)'" onmouseout="this.style.transform='';this.style.boxShadow=''">
          <div style="display:flex;align-items:center;gap:12px">
            <div style="width:44px;height:44px;border-radius:10px;background:${k.bg};display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">${k.icon}</div>
            <div>
              <div style="font-size:20px;font-weight:800;color:${k.c}">${k.val}</div>
              <div style="font-size:12px;color:var(--text-muted)">${k.label}</div>
              <div style="font-size:11px;color:var(--text-light);margin-top:2px">${k.sub}</div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>

    <!-- TAB NAV -->
    <div class="tab-nav">
      <button class="tab-btn ${activeTab==='overview'?'active':''}" onclick="switchRepTab('overview')">📊 Overview Charts</button>
      <button class="tab-btn ${activeTab==='routes'?'active':''}" onclick="switchRepTab('routes')">🗺️ Route Analysis</button>
      <button class="tab-btn ${activeTab==='trends'?'active':''}" onclick="switchRepTab('trends')">📈 Trend Analysis</button>
      <button class="tab-btn ${activeTab==='benchmark'?'active':''}" onclick="switchRepTab('benchmark')">🏆 Industry Benchmarks</button>
      ${savings.length > 0 ? `<button class="tab-btn ${activeTab==='savings'?'active':''}" onclick="switchRepTab('savings')">💰 AI Savings (${savings.length})</button>` : ''}
    </div>

    <div id="repTabContent">
      ${renderRepTab(activeTab)}
    </div>`;

    window.switchRepTab = (tab) => { activeTab = tab; render(); };
    window.toggleRepExportMenu = () => { document.getElementById('repExportMenu')?.classList.toggle('hidden'); };
    window.doRepExport = (type) => {
      document.getElementById('repExportMenu')?.classList.add('hidden');
      if (type === 'csv') {
        if (typeof Exporter !== 'undefined') Exporter.analyticsCSV(monthly);
        else exportReportsCSV();
      } else if (type === 'pdf') {
        if (typeof Exporter !== 'undefined') Exporter.analyticsPDF(monthly, savings);
        else showToast('PDF report generating...', 'info');
      } else {
        if (typeof Exporter !== 'undefined') Exporter.toExcel(monthly, 'analytics', [
          {label:'Month',key:'label'},{label:'Freight Spend',key:'bar'},{label:'Revenue',key:'line'}
        ]);
        else showToast('Excel export ready', 'info');
      }
    };

    setTimeout(() => renderRepCharts(activeTab), 100);
  }

  function renderRepTab(tab) {
    if (tab === 'overview') return renderOverview();
    if (tab === 'routes') return renderRoutes();
    if (tab === 'trends') return renderTrends();
    if (tab === 'benchmark') return renderBenchmarks();
    if (tab === 'savings') return renderSavingsTab();
    return '';
  }

  function renderOverview() {
    return `
    <div class="grid-2-1" style="gap:24px;margin-bottom:24px">
      <div class="card">
        <div style="padding:20px 24px 0"><div class="card-title">Monthly Freight Spend vs Revenue</div><div class="card-subtitle">${monthly.length} months • Live data${useAPI?'':' (demo)'}</div></div>
        <div class="card-body" style="padding-top:16px">
          ${monthly.length === 0 ? `<div style="text-align:center;padding:60px 20px;color:var(--text-muted)">
            <div style="font-size:36px;margin-bottom:12px">📊</div>
            <div style="font-weight:600;margin-bottom:8px">No analytics data yet</div>
            <div style="font-size:13px;margin-bottom:16px">Generate demo invoices to see charts</div>
            <button class="btn btn-primary btn-sm" onclick="Router.navigate('dashboard')">← Go to Dashboard</button>
          </div>` : `<canvas id="repComboChart" style="width:100%;height:260px;display:block"></canvas>`}
        </div>
      </div>
      <div class="card">
        <div style="padding:20px 24px 0"><div class="card-title">Vendor Distribution</div><div class="card-subtitle">By freight spend share</div></div>
        <div class="card-body" style="padding-top:16px"><canvas id="repDonutChart" style="width:100%;height:240px;display:block"></canvas></div>
      </div>
    </div>

    <div class="card">
      <div style="padding:20px 24px 0"><div class="card-title">Average Delay by Route (Days)</div><div class="card-subtitle">Top busiest routes</div></div>
      <div class="card-body" style="padding-top:16px"><canvas id="delayChart" style="width:100%;height:180px;display:block"></canvas></div>
    </div>`;
  }

  function renderRoutes() {
    const routeData = API.getRouteOptimization(summary.invoices || []);
    const hasLiveRoutes = routeData.length > 0;
    const staticRoutes = [
      { route:'Mumbai → Delhi', shipments:48, avgCost:285000, transit:2, delay:0.8, carrier:'Delhivery', costKg:118 },
      { route:'Chennai → Bangalore', shipments:32, avgCost:125000, transit:1, delay:1.2, carrier:'BlueDart', costKg:390 },
      { route:'Delhi → Kolkata', shipments:28, avgCost:192000, transit:3, delay:2.1, carrier:'Gati', costKg:160 },
      { route:'Hyderabad → Pune', shipments:24, avgCost:67000, transit:2, delay:1.8, carrier:'DTDC', costKg:78 },
      { route:'Bangalore → Mumbai', shipments:36, avgCost:340000, transit:2, delay:1.5, carrier:'TCI Express', costKg:106 },
      { route:'Mumbai → Ahmedabad', shipments:19, avgCost:450000, transit:1, delay:0.3, carrier:'TCI Express', costKg:100 }
    ];
    const displayRoutes = hasLiveRoutes ? routeData.slice(0,8) : staticRoutes;

    return `
    <div class="card">
      <div style="padding:20px 24px;border-bottom:1px solid var(--border);font-size:15px;font-weight:700">🗺️ Route Performance Analysis${hasLiveRoutes ? ' — Live Data' : ' — Demo'}</div>
      <div class="table-container">
        <table class="data-table">
          <thead><tr>
            <th>Route</th>
            <th>Shipments</th>
            <th>Avg Cost</th>
            ${hasLiveRoutes ? '<th>Total Spend</th><th>Avg/Trip</th><th>AI Optimization</th>' : '<th>Transit Days</th><th>Avg Delay</th><th>Top Carrier</th><th>Cost/KG</th>'}
          </tr></thead>
          <tbody>
            ${displayRoutes.map(r => `
              <tr>
                <td style="font-weight:600">${r.route}</td>
                <td style="text-align:center">${r.shipments||r.count||0}</td>
                <td style="font-weight:600">${API._fmt(r.avgCost||r.avg||0)}</td>
                ${hasLiveRoutes ? `
                  <td style="font-weight:700;color:var(--primary)">${API._fmt(r.total||0)}</td>
                  <td>${API._fmt(r.avg||0)}</td>
                  <td>${r.optimization ? `<span style="color:var(--success);font-size:12px;font-weight:600">${r.optimization}</span>` : '<span style="color:var(--text-muted)">—</span>'}</td>
                ` : `
                  <td style="text-align:center">${r.transit} days</td>
                  <td style="text-align:center"><span style="color:${r.delay<=1?'var(--success)':r.delay<=1.5?'var(--warning)':'var(--danger)'};font-weight:700">${r.delay}d</span></td>
                  <td>${r.carrier||'—'}</td>
                  <td style="font-family:monospace">₹${r.costKg||0}/kg</td>
                `}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
  }

  function renderTrends() {
    return `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px">
      <div class="card">
        <div style="padding:20px 24px 0"><div class="card-title">Freight-to-Revenue Ratio (%)</div><div class="card-subtitle">Monthly trend (ideal: &lt;30%)</div></div>
        <div class="card-body" style="padding-top:16px"><canvas id="trendChart1" style="width:100%;height:220px;display:block"></canvas></div>
      </div>
      <div class="card">
        <div style="padding:20px 24px 0"><div class="card-title">Invoice Processing Efficiency</div><div class="card-subtitle">Avg hours to reconcile</div></div>
        <div class="card-body" style="padding-top:16px"><canvas id="trendChart2" style="width:100%;height:220px;display:block"></canvas></div>
      </div>
    </div>
    <div class="card" style="margin-top:24px">
      <div style="padding:20px 24px;border-bottom:1px solid var(--border);font-size:15px;font-weight:700">📋 Key Trend Insights</div>
      <div style="padding:20px 24px;display:grid;grid-template-columns:repeat(3,1fr);gap:20px">
        ${[
          { icon:'📉', title:'Freight Cost Trend', insight:'Freight costs increased 12.3% in Q4 due to diesel price surge. March shows a 3.2% stabilization.', color:'var(--accent)' },
          { icon:'⚡', title:'Processing Speed', insight:'Invoice processing time reduced from 48 hours to 4.2 hours with Aetra automation.', color:'var(--success)' },
          { icon:'💰', title:'ITC Recovery Rate', insight:'ITC recovery improved from 67% to 94% with auto-reconciliation. ₹42L recovered in 6 months.', color:'var(--primary)' }
        ].map(i => `
          <div style="padding:20px;background:var(--bg);border-radius:12px;border-left:4px solid ${i.color}">
            <div style="font-size:24px;margin-bottom:10px">${i.icon}</div>
            <div style="font-size:14px;font-weight:700;margin-bottom:8px">${i.title}</div>
            <div style="font-size:13px;color:var(--text-muted);line-height:1.7">${i.insight}</div>
          </div>
        `).join('')}
      </div>
    </div>`;
  }

  function renderBenchmarks() {
    const yours_freight = freightRatio;
    const yours_ontime = summary.vendors?.length ? Math.round(summary.vendors.reduce((s,v)=>s+(v.on_time_pct||v.onTime||85),0)/summary.vendors.length) : 68;

    return `
    <div class="card card-body">
      <div style="font-size:15px;font-weight:700;margin-bottom:20px">🏆 Industry Benchmarks — Indian Logistics SMEs</div>
      <div style="overflow-x:auto">
        <table style="width:100%;font-size:13px;border-collapse:collapse">
          <thead><tr style="background:var(--bg);border-bottom:2px solid var(--border)">
            <th style="padding:12px 16px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;color:var(--text-muted)">Metric</th>
            <th style="padding:12px 16px;text-align:center;font-size:11px;font-weight:700;text-transform:uppercase;color:var(--text-muted)">Industry Avg</th>
            <th style="padding:12px 16px;text-align:center;font-size:11px;font-weight:700;text-transform:uppercase;color:var(--primary)">Your Company</th>
            <th style="padding:12px 16px;text-align:center;font-size:11px;font-weight:700;text-transform:uppercase;color:var(--text-muted)">Best in Class</th>
            <th style="padding:12px 16px;text-align:left">Assessment</th>
          </tr></thead>
          <tbody>
            ${[
              { metric:'Freight-to-Revenue Ratio', industry:'28-35%', yours:`${yours_freight}%`, best:'<22%', status: parseFloat(yours_freight)<30?'good':'warning', note:'Below industry average — good performance' },
              { metric:'Invoice Reconciliation Time', industry:'2-5 days', yours:'4.2 hours', best:'<2 hours', status:'excellent', note:'10× faster than industry average with automation' },
              { metric:'ITC Utilization Rate', industry:'72-80%', yours:'94%', best:'>95%', status:'excellent', note:'Excellent ITC capture — near best-in-class' },
              { metric:'On-Time Payment Rate', industry:'65-75%', yours:`${yours_ontime}%`, best:'>90%', status: yours_ontime>75?'good':'warning', note:yours_ontime>75?'Good performance':'Room for improvement' },
              { metric:'Vendor Dispute Rate', industry:'8-12%', yours:'4.3%', best:'<3%', status:'good', note:'Below industry average — vendor management is strong' },
              { metric:'Invoice Accuracy Rate', industry:'82-88%', yours:'91.2%', best:'>96%', status:'good', note:'Target 95%+ with stricter vendor KPIs' },
              { metric:'Avg Delivery Delay', industry:'1.8-2.5 days', yours:'1.48 days', best:'<0.5 days', status:'good', note:'Below industry average — route optimization helping' }
            ].map(b => `
              <tr style="border-bottom:1px solid #f1f5f9">
                <td style="padding:14px 16px;font-weight:600">${b.metric}</td>
                <td style="padding:14px;text-align:center;color:var(--text-muted)">${b.industry}</td>
                <td style="padding:14px;text-align:center;font-weight:700;color:${b.status==='excellent'?'var(--success)':b.status==='good'?'var(--info)':'var(--warning)'}">${b.yours}</td>
                <td style="padding:14px;text-align:center;color:var(--text-light)">${b.best}</td>
                <td style="padding:14px">
                  <span class="badge ${b.status==='excellent'?'badge-success':b.status==='good'?'badge-info':'badge-warning'}" style="margin-bottom:4px;display:inline-block">${b.status==='excellent'?'✅ Excellent':b.status==='good'?'👍 Good':'⚠️ Improve'}</span>
                  <div style="font-size:11px;color:var(--text-muted);margin-top:3px">${b.note}</div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
  }

  function renderSavingsTab() {
    return `
    <div style="display:flex;flex-direction:column;gap:16px">
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:8px">
        ${[
          { label:'Total Savings Found', val: API._fmt(totalSavings), icon:'💰', bg:'#f0fdf4', c:'#166534' },
          { label:'Opportunities', val: savings.length, icon:'💡', bg:'#eff6ff', c:'#1e40af' },
          { label:'Confidence', val: prediction.confidence || 'medium', icon:'🎯', bg:'#fffbeb', c:'#92400e' }
        ].map(k => `
          <div class="card" style="padding:16px">
            <div style="display:flex;align-items:center;gap:10px">
              <div style="width:36px;height:36px;border-radius:8px;background:${k.bg};display:flex;align-items:center;justify-content:center;font-size:18px">${k.icon}</div>
              <div>
                <div style="font-size:20px;font-weight:800;color:${k.c}">${k.val}</div>
                <div style="font-size:12px;color:var(--text-muted)">${k.label}</div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
      ${savings.map(s => `
        <div style="padding:18px;border-radius:12px;background:${s.priority==='high'?'#fef2f2':'#fffbeb'};border:1px solid ${s.priority==='high'?'#fecaca':'#fde68a'};display:flex;align-items:start;gap:14px">
          <span style="font-size:24px;flex-shrink:0">${s.icon}</span>
          <div style="flex:1">
            <div style="font-size:14px;font-weight:700;margin-bottom:4px">${s.title}</div>
            <div style="font-size:13px;color:var(--text-muted);margin-bottom:8px">${s.desc}</div>
            <span class="badge ${s.priority==='high'?'badge-danger':'badge-warning'}">${s.priority} priority</span>
          </div>
          <div style="text-align:right;flex-shrink:0">
            <div style="font-size:22px;font-weight:900;color:var(--success)">+${API._fmt(s.saving)}</div>
            <div style="font-size:11px;color:var(--text-muted)">/month</div>
          </div>
        </div>
      `).join('')}
    </div>`;
  }

  function renderRepCharts(tab) {
    if (tab === 'overview') {
      if (monthly.length > 0) {
        FFCharts.renderCombo('repComboChart', monthly, { barLabel: 'Freight Cost', lineLabel: 'Revenue' });
      }
      FFCharts.renderDonut('repDonutChart', vendorSpend.map(v => ({ label: v.name, value: v.value || v.totalPaid || 0, name: v.name })), {
        colors: ['#1e3a5f', '#f97316', '#10b981', '#3b82f6', '#8b5cf6'],
        centerText: '₹', centerSubtext: 'Spend'
      });
      const delayData = (useAPI && summary.invoices?.length ? API.getRouteOptimization(summary.invoices) : FF_DATA.delayAnalysis)
        .slice(0, 5).map(d => ({ label: d.route?.replace(/ → /g, '→') || '', value: d.avgDelay || d.avg || 0 }));
      FFCharts.renderHBar('delayChart', delayData, {
        colors: ['#ef4444', '#f97316', '#f59e0b', '#3b82f6', '#10b981'],
        formatVal: v => v + ' days'
      });
    }
    if (tab === 'trends') {
      const months_labels = monthly.map(m => (m.label || m.month_year || '').slice(0, 3));
      const ratioData = monthly.map(m => Math.round((m.bar || m.freight || 0) / ((m.line || m.revenue || 1)) * 100));
      FFCharts.renderLine('trendChart1', [{ data: ratioData, color: '#f97316', label: 'Freight Ratio %' }], months_labels);
      FFCharts.renderLine('trendChart2', [{ data: [48, 32, 18, 10, 6, 4.2], color: '#10b981', label: 'Processing Hours' }], ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']);
    }
  }

  // Close export menu on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#exportDropdown')) {
      document.getElementById('repExportMenu')?.classList.add('hidden');
    }
  });

  render();
};

function exportReportsCSV() {
  const rows = ['Month,Freight Spend,Revenue,Ratio%'];
  FF_DATA.monthlySpend.forEach(m => rows.push(`${m.month},${m.freight},${m.revenue},${(m.freight/m.revenue*100).toFixed(1)}`));
  const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'freight_analytics_report.csv';
  a.click();
  showToast('Analytics report exported 📊');
}
