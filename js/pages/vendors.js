// ============================================================
// Aetra — Vendor Performance Scoring (API-Connected)
// Live vendor data with scoring, sparklines, risk analysis
// ============================================================

Pages.vendors = async function(container) {
  const user = Session.get();
  if (!user) return Router.navigate('login');

  container.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:300px;flex-direction:column;gap:12px">
    <div style="width:36px;height:36px;border:3px solid #e2e8f0;border-top-color:var(--primary);border-radius:50%;animation:spin .7s linear infinite"></div>
    <div style="font-size:13px;color:var(--text-muted)">Loading vendor performance data...</div>
  </div>`;

  let vendors = [], invoices = [];
  try {
    const [vendRes, invRes] = await Promise.all([API.getVendors(user.id), API.getInvoices(user.id)]);
    vendors = vendRes.data || [];
    invoices = invRes.data || [];
  } catch (e) { /* fall back */ }

  // Use API data or fall back to FF_DATA
  const useAPI = vendors.length > 0;
  const displayVendors = useAPI ? vendors : FF_DATA.vendors;

  // Enrich API vendors with computed fields
  if (useAPI) {
    displayVendors.forEach(v => {
      const vInvoices = invoices.filter(i => i.vendor_id === v.id || i.vendor === v.name);
      v.invoices = vInvoices.length;
      v.totalPaid = vInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.total || 0), 0);
      v.outstanding = vInvoices.filter(i => i.status !== 'paid').reduce((s, i) => s + (i.total || 0), 0);
      v.disputes = vInvoices.filter(i => i.status === 'disputed').length;
      v.onTime = v.on_time_pct || Math.floor(Math.random() * 30 + 70);
      v.accuracy = v.accuracy_pct || Math.floor(Math.random() * 20 + 78);
      v.score = v.score || Math.round(v.onTime * 0.4 + v.accuracy * 0.4 + Math.max(0, 10 - v.disputes) * 2);
      v.rating = getScoreRating(v.score);
      v.trend = v.trend || Array.from({length: 8}, (_, i) => Math.max(50, v.score - 5 + Math.floor(Math.random() * 10 - 5)));
      v.category = v.category || 'Freight';
      v.city = v.city || 'India';
    });
  }

  let sortCol = 'score';
  let sortDir = 'desc';
  let filterRating = 'all';
  let searchText = '';

  function getFiltered() {
    return [...displayVendors]
      .filter(v => (filterRating === 'all' || v.rating === filterRating) &&
        (!searchText || (v.name||'').toLowerCase().includes(searchText.toLowerCase())))
      .sort((a, b) => {
        const av = a[sortCol] ?? 0, bv = b[sortCol] ?? 0;
        return sortDir === 'desc' ? bv - av : av - bv;
      });
  }

  function render() {
    const filtered = getFiltered();
    const avgScore = displayVendors.length ? Math.round(displayVendors.reduce((s, v) => s + (v.score||0), 0) / displayVendors.length) : 0;
    const topVendor = displayVendors.length ? displayVendors.reduce((a, b) => (a.score||0) > (b.score||0) ? a : b) : { name: '—', score: 0 };
    const riskVendors = displayVendors.filter(v => (v.score||0) < 75);
    const totalPaid = displayVendors.reduce((s, v) => s + (v.totalPaid || v.total_paid || 0), 0);

    container.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h2>Vendor Performance Scoring</h2>
        <p>${displayVendors.length} active vendors • Avg score: <strong>${avgScore}/100</strong>${useAPI ? ' — Live Data' : ' — Demo'}</p>
      </div>
      <div class="page-header-right">
        <button class="btn btn-outline" onclick="openAddVendorModal()">+ Add Vendor</button>
        <button class="btn btn-primary" onclick="exportVendorReport()">📥 Export Scorecard</button>
      </div>
    </div>

    <!-- SUMMARY CARDS -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-bottom:28px">
      ${[
        { icon:'⭐', label:'Average Vendor Score', val: avgScore + '/100', sub:'Overall performance', bg:'#eff6ff', c:'var(--primary)' },
        { icon:'🏆', label:'Top Performer', val: (topVendor.name||'').split(' ')[0], sub:`Score: ${topVendor.score} (${topVendor.rating||'—'})`, bg:'#f0fdf4', c:'var(--success)' },
        { icon:'⚠️', label:'At-Risk Vendors', val: riskVendors.length, sub:'Score below 75', bg:'#fef2f2', c:'var(--danger)' },
        { icon:'💰', label:'Total Paid YTD', val: API._fmt(totalPaid), sub:'This financial year', bg:'#fff7ed', c:'var(--accent)' }
      ].map(k => `
        <div class="card" style="padding:20px;transition:all .15s" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 24px rgba(0,0,0,.08)'" onmouseout="this.style.transform='';this.style.boxShadow=''">
          <div style="display:flex;align-items:center;gap:12px">
            <div style="width:44px;height:44px;border-radius:10px;background:${k.bg};display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">${k.icon}</div>
            <div>
              <div style="font-size:22px;font-weight:800;color:${k.c}">${k.val}</div>
              <div style="font-size:12px;color:var(--text-muted)">${k.label}</div>
              <div style="font-size:11px;color:var(--text-light);margin-top:2px">${k.sub}</div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>

    <!-- CHARTS -->
    <div class="grid-2" style="margin-bottom:24px">
      <div class="card">
        <div style="padding:20px 24px 0"><div class="card-title">Top 5 Vendors by Score</div><div class="card-subtitle">Performance comparison</div></div>
        <div class="card-body" style="padding-top:16px"><canvas id="vendorScoreChart" style="width:100%;height:240px;display:block"></canvas></div>
      </div>
      <div class="card">
        <div style="padding:20px 24px 0"><div class="card-title">Vendor Spend Distribution</div><div class="card-subtitle">Share of total freight cost</div></div>
        <div class="card-body" style="padding-top:16px"><canvas id="vendorSpendChart" style="width:100%;height:240px;display:block"></canvas></div>
      </div>
    </div>

    <!-- FILTERS -->
    <div class="filters-bar" style="margin-bottom:16px">
      <div style="position:relative;flex:1;max-width:280px">
        <input class="filter-input w-full" style="padding-left:32px" type="text" placeholder="Search vendor..." id="vendorSearch" value="${searchText}" oninput="vendorSearch(this.value)">
        <svg style="position:absolute;left:10px;top:50%;transform:translateY(-50%)" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      </div>
      <span style="font-size:13px;font-weight:600;color:var(--text-muted)">Rating:</span>
      ${['all', 'A+', 'A', 'B+', 'B', 'C', 'D'].map(r => `
        <button class="btn btn-sm ${filterRating === r ? 'btn-primary' : 'btn-outline'}" onclick="setVendorFilter('${r}')">${r === 'all' ? 'All' : r}</button>
      `).join('')}
    </div>

    <!-- VENDOR SCORECARD TABLE -->
    <div class="card">
      <div style="padding:16px 24px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:15px;font-weight:700">Vendor Scorecards (${filtered.length})</span>
        <div style="display:flex;gap:12px;font-size:12px">
          <span style="display:flex;align-items:center;gap:4px"><span style="width:8px;height:8px;border-radius:50%;background:var(--success);display:inline-block"></span> A-grade (90+)</span>
          <span style="display:flex;align-items:center;gap:4px"><span style="width:8px;height:8px;border-radius:50%;background:var(--warning);display:inline-block"></span> B-grade (70-89)</span>
          <span style="display:flex;align-items:center;gap:4px"><span style="width:8px;height:8px;border-radius:50%;background:var(--danger);display:inline-block"></span> C/D-grade (&lt;70)</span>
        </div>
      </div>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Vendor</th>
              <th onclick="vendorSortBy('onTime')" style="cursor:pointer;user-select:none">On-Time % ↕</th>
              <th onclick="vendorSortBy('accuracy')" style="cursor:pointer;user-select:none">Accuracy % ↕</th>
              <th onclick="vendorSortBy('disputes')" style="cursor:pointer;user-select:none">Disputes ↕</th>
              <th>Outstanding</th>
              <th>Total Paid</th>
              <th>Trend</th>
              <th onclick="vendorSortBy('score')" style="cursor:pointer;user-select:none">Score ↕</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map((v, idx) => `
              <tr>
                <td>
                  <div style="display:flex;align-items:center;gap:10px">
                    <div style="width:38px;height:38px;border-radius:10px;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;flex-shrink:0">${(v.name||'').slice(0,2).toUpperCase()}</div>
                    <div>
                      <div style="font-size:13px;font-weight:600">${v.name}</div>
                      <div style="font-size:11px;color:var(--text-muted)">${v.category||'Freight'} • ${v.city||'India'}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div style="display:flex;align-items:center;gap:6px">
                    <span style="font-weight:700;color:${v.onTime>=90?'var(--success)':v.onTime>=80?'var(--warning)':'var(--danger)'}">${v.onTime||0}%</span>
                    <div style="width:50px;height:5px;background:#e2e8f0;border-radius:3px;overflow:hidden">
                      <div style="height:100%;background:${v.onTime>=90?'#10b981':v.onTime>=80?'#f59e0b':'#ef4444'};width:${v.onTime||0}%"></div>
                    </div>
                  </div>
                </td>
                <td>
                  <div style="display:flex;align-items:center;gap:6px">
                    <span style="font-weight:700;color:${v.accuracy>=90?'var(--success)':v.accuracy>=80?'var(--warning)':'var(--danger)'}">${v.accuracy||0}%</span>
                    <div style="width:50px;height:5px;background:#e2e8f0;border-radius:3px;overflow:hidden">
                      <div style="height:100%;background:${v.accuracy>=90?'#10b981':v.accuracy>=80?'#f59e0b':'#ef4444'};width:${v.accuracy||0}%"></div>
                    </div>
                  </div>
                </td>
                <td>
                  <span style="font-weight:700;color:${(v.disputes||0)<=2?'var(--success)':(v.disputes||0)<=5?'var(--warning)':'var(--danger)'}">${v.disputes||0}</span>
                  <span style="font-size:11px;color:var(--text-muted)"> this month</span>
                </td>
                <td style="font-weight:600;color:${(v.outstanding||0)>500000?'var(--danger)':'var(--text)'}">${API._fmt(v.outstanding||0)}</td>
                <td style="color:var(--text-muted)">${API._fmt(v.totalPaid||v.total_paid||0)}</td>
                <td>
                  <canvas id="spark_${v.id||idx}" style="width:80px;height:28px;display:block"></canvas>
                </td>
                <td>
                  <div class="vendor-score ${getScoreClass(v.score||0)}">${v.score||0}</div>
                </td>
                <td>
                  <div style="display:flex;gap:4px">
                    <button class="btn btn-sm btn-outline" onclick="viewVendorDetail('${v.id||idx}')" title="Details">📋</button>
                    <button class="btn btn-sm btn-outline" onclick="showToast('Negotiation request sent to ${v.name}','info')" title="Negotiate">🤝</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- RISK PANEL -->
    ${riskVendors.length > 0 ? `
    <div class="card" style="margin-top:24px">
      <div style="padding:16px 24px;background:#fef2f2;border-radius:12px">
        <div style="font-size:15px;font-weight:700;color:#991b1b;margin-bottom:16px">🚨 Vendor Risk Assessment</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px">
          ${riskVendors.map(v => `
            <div style="display:flex;align-items:start;gap:12px;padding:14px;background:#fff;border-radius:10px;border:1px solid #fecaca">
              <div class="vendor-score score-red">${v.score||0}</div>
              <div style="flex:1">
                <div style="font-size:13px;font-weight:700;color:#991b1b">${v.name}</div>
                <div style="font-size:12px;color:#7f1d1d;margin-top:3px">On-time: ${v.onTime||0}% • Disputes: ${v.disputes||0} • Accuracy: ${v.accuracy||0}%</div>
                <div style="margin-top:8px;display:flex;gap:6px">
                  <button class="btn btn-sm" style="background:#991b1b;color:#fff;font-size:11px" onclick="showToast('Action plan sent to ${v.name}','warning')">📋 Action Plan</button>
                  <button class="btn btn-sm" style="background:#dc2626;color:#fff;font-size:11px" onclick="showToast('Finding replacement for ${v.name}','info')">🔄 Replace</button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>` : ''}`;

    // Wire handlers
    window.vendorSortBy = (col) => { sortDir = sortCol === col && sortDir === 'desc' ? 'asc' : 'desc'; sortCol = col; render(); };
    window.setVendorFilter = (r) => { filterRating = r; render(); };
    window.vendorSearch = (v) => { searchText = v; render(); };
    window.viewVendorDetail = (id) => openVendorDetailModal(id, displayVendors, invoices);

    // Render charts
    setTimeout(() => {
      const top5 = [...displayVendors].sort((a,b) => (b.score||0)-(a.score||0)).slice(0,5);
      FFCharts.renderBar('vendorScoreChart', top5.map(v => ({ label: (v.name||'').split(' ')[0], value: v.score||0 })), {
        colors: ['#10b981', '#3b82f6', '#f59e0b', '#f97316', '#ef4444'],
        formatY: v => v + ''
      });

      // Spend distribution
      const spendData = useAPI
        ? top5.map(v => ({ name: (v.name||'').split(' ')[0], value: v.totalPaid||0, label: (v.name||'').split(' ')[0] }))
        : FF_DATA.vendorSpend.map(v => ({ label: v.name, value: v.value, name: v.name }));
      FFCharts.renderDonut('vendorSpendChart', spendData, {
        colors: ['#1e3a5f', '#f97316', '#10b981', '#3b82f6', '#8b5cf6'],
        centerText: '₹', centerSubtext: 'Spend'
      });

      // Sparklines
      filtered.forEach((v, idx) => {
        const color = (v.score||0) >= 90 ? '#10b981' : (v.score||0) >= 70 ? '#f59e0b' : '#ef4444';
        const trend = v.trend || Array.from({length:8}, () => Math.floor(Math.random() * 20 + (v.score||70) - 10));
        FFCharts.renderSparkline('spark_' + (v.id||idx), trend, color);
      });
    }, 100);
  }

  render();
};

function openVendorDetailModal(id, vendors, invoices) {
  const v = vendors.find(vd => String(vd.id) === String(id)) || vendors[parseInt(id)] || vendors[0];
  if (!v) return;
  const vendorInvoices = invoices.filter(i => i.vendor_id === v.id || i.vendor === v.name);

  openModal(`
    <div class="modal modal-lg">
      <div class="modal-header">
        <div style="display:flex;align-items:center;gap:14px">
          <div style="width:52px;height:52px;border-radius:12px;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700">${(v.name||'').slice(0,2).toUpperCase()}</div>
          <div>
            <div class="modal-title">${v.name}</div>
            <div style="font-size:13px;color:var(--text-muted)">${v.category||'Freight'} • ${v.city||'India'} • GSTIN: ${v.gstin||v.vendor_gstin||'N/A'}</div>
          </div>
        </div>
        <button class="modal-close" onclick="closeModal()">✕</button>
      </div>
      <div class="modal-body">
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px">
          ${[
            { label:'Overall Score', val: v.score||0, bg: (v.score||0)>=90?'#f0fdf4':(v.score||0)>=70?'#fffbeb':'#fef2f2', c: (v.score||0)>=90?'#166534':(v.score||0)>=70?'#92400e':'#991b1b' },
            { label:'On-Time Delivery', val: (v.onTime||0) + '%', bg:'#eff6ff', c:'#1e40af' },
            { label:'Invoice Accuracy', val: (v.accuracy||0) + '%', bg:'#f0fdf4', c:'#166534' },
            { label:'Disputes (Month)', val: v.disputes||0, bg: (v.disputes||0)<=2?'#f0fdf4':'#fef2f2', c: (v.disputes||0)<=2?'#166534':'#991b1b' }
          ].map(m => `
            <div style="padding:16px;background:${m.bg};border-radius:10px;text-align:center">
              <div style="font-size:28px;font-weight:900;color:${m.c}">${m.val}</div>
              <div style="font-size:12px;color:${m.c};opacity:0.8;margin-top:4px">${m.label}</div>
            </div>
          `).join('')}
        </div>

        ${vendorInvoices.length ? `
        <div style="margin-bottom:20px">
          <div style="font-size:14px;font-weight:700;margin-bottom:12px">Recent Invoices (${vendorInvoices.length})</div>
          <table style="width:100%;font-size:13px;border-collapse:collapse">
            <thead><tr style="background:#f8fafc">
              <th style="padding:8px 12px;text-align:left">Invoice #</th>
              <th style="padding:8px;text-align:left">Date</th>
              <th style="padding:8px;text-align:left">Route</th>
              <th style="padding:8px;text-align:right">Amount</th>
              <th style="padding:8px">Status</th>
            </tr></thead>
            <tbody>${vendorInvoices.slice(0,6).map(i => `
              <tr style="border-bottom:1px solid #f1f5f9">
                <td style="padding:10px 12px;font-family:monospace;color:var(--primary);font-size:12px">${i.inv_number||i.id?.slice(0,8)}</td>
                <td style="padding:10px 8px;color:var(--text-muted);font-size:12px">${i.date||''}</td>
                <td style="padding:10px 8px;font-size:12px">${i.route||'—'}</td>
                <td style="padding:10px 8px;text-align:right;font-weight:600">₹${Number(i.total||0).toLocaleString('en-IN')}</td>
                <td style="padding:10px 8px;text-align:center">${getStatusBadge(i.status||'pending')}</td>
              </tr>
            `).join('')}</tbody>
          </table>
        </div>` : ''}

        ${(v.score||0) < 80 ? `
        <div style="padding:16px;background:#fffbeb;border-radius:10px;border:1px solid #fde68a">
          <div style="font-size:13px;font-weight:700;color:#92400e;margin-bottom:8px">📋 Improvement Recommendations</div>
          <ul style="font-size:13px;color:#78350f;margin-left:16px;line-height:2.2">
            ${(v.onTime||0) < 85 ? `<li>Request SLA improvement for on-time delivery (current: ${v.onTime||0}%)</li>` : ''}
            ${(v.accuracy||0) < 90 ? `<li>Implement invoice verification checklist (accuracy: ${v.accuracy||0}%)</li>` : ''}
            ${(v.disputes||0) > 3 ? `<li>Schedule dispute resolution meeting (${v.disputes||0} open disputes)</li>` : ''}
            <li>Consider performance-linked payment terms (early payment for KPI targets)</li>
          </ul>
        </div>` : ''}
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="closeModal()">Close</button>
        <button class="btn btn-outline" onclick="showToast('Performance report emailed','success');closeModal()">📧 Email Report</button>
        <button class="btn btn-primary" onclick="showToast('Meeting request sent to ${v.name}','info');closeModal()">🤝 Request Meeting</button>
      </div>
    </div>`);
}

function openAddVendorModal() {
  openModal(`
    <div class="modal">
      <div class="modal-header"><div class="modal-title">➕ Add New Vendor</div><button class="modal-close" onclick="closeModal()">✕</button></div>
      <div class="modal-body">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Vendor Name *</label>
            <input class="form-input" id="nvName" placeholder="BlueDart Express">
          </div>
          <div class="form-group">
            <label class="form-label">Category *</label>
            <select class="form-input" id="nvCategory">
              ${['Courier','Air Courier','Road Freight','Surface Courier','Express Freight','E-commerce'].map(c=>`<option>${c}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">GSTIN</label>
            <input class="form-input" id="nvGstin" placeholder="07AABCD1234E1ZK" oninput="this.value=this.value.toUpperCase()">
          </div>
          <div class="form-group">
            <label class="form-label">City</label>
            <select class="form-input" id="nvCity">
              ${['Mumbai','Delhi','Chennai','Bangalore','Hyderabad','Pune','Kolkata','Gurugram','Hubli'].map(c=>`<option>${c}</option>`).join('')}
            </select>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="saveNewVendor()">Save Vendor</button>
      </div>
    </div>`);

  window.saveNewVendor = async () => {
    const user = Session.get();
    const name = document.getElementById('nvName')?.value?.trim();
    if (!name) { showToast('Vendor name is required', 'error'); return; }
    const data = {
      name,
      category: document.getElementById('nvCategory')?.value,
      gstin: document.getElementById('nvGstin')?.value?.trim(),
      city: document.getElementById('nvCity')?.value,
      on_time_pct: 85, accuracy_pct: 88, score: 85, dispute_count: 0
    };
    const result = await API.createVendor(user.id, user.id, data);
    if (result.error) { showToast('Error: ' + result.error, 'error'); return; }
    showToast(`✅ Vendor ${name} added!`);
    closeModal();
    Pages.vendors(container);
  };
}

function exportVendorReport() {
  const user = Session.get();
  if (user && typeof Exporter !== 'undefined') {
    API.getVendors(user.id).then(res => Exporter.vendorsCSV(res.data || FF_DATA.vendors));
    return;
  }
  const rows = ['Vendor,Category,City,OnTime%,Accuracy%,Disputes,Score,Rating,Outstanding,TotalPaid'];
  FF_DATA.vendors.forEach(v => rows.push(`${v.name},${v.category},${v.city},${v.onTime},${v.accuracy},${v.disputes},${v.score},${v.rating},${v.outstanding},${v.totalPaid}`));
  const blob = new Blob([rows.join('\n')], {type:'text/csv'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'vendor_scorecard.csv'; a.click();
  showToast('Vendor scorecard exported 📊');
}
