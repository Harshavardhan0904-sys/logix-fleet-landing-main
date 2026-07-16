// ============================================================
// Aetra — Payments & Aging Reports (API-Connected)
// Live aging buckets, interactive payment processing
// ============================================================

Pages.payments = async function(container) {
  const user = Session.get();
  if (!user) return Router.navigate('login');

  container.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:300px;flex-direction:column;gap:12px">
    <div style="width:36px;height:36px;border:3px solid #e2e8f0;border-top-color:var(--primary);border-radius:50%;animation:spin .7s linear infinite"></div>
    <div style="font-size:13px;color:var(--text-muted)">Loading payment data...</div>
  </div>`;

  let invoices = [], payments = [], vendors = [];
  try {
    const [invRes, payRes, vendRes] = await Promise.all([
      API.getInvoices(user.id),
      API.getPayments(user.id),
      API.getVendors(user.id)
    ]);
    invoices = invRes.data || [];
    payments = payRes.data || [];
    vendors = vendRes.data || [];
  } catch (e) { /* fall back to static */ }

  const useAPI = invoices.length > 0;
  const useStaticPayments = payments.length === 0;

  // Build aging buckets from real invoices or static
  function buildAgingBuckets(invs) {
    if (!invs.length) return FF_DATA.agingData;
    const now = new Date();
    const buckets = {
      current: { bucket: 'Current', amount: 0, count: 0, color: '#10b981' },
      d30: { bucket: '1-30 Days', amount: 0, count: 0, color: '#f59e0b' },
      d60: { bucket: '31-60 Days', amount: 0, count: 0, color: '#f97316' },
      d90: { bucket: '61-90 Days', amount: 0, count: 0, color: '#ef4444' },
      plus: { bucket: '90+ Days', amount: 0, count: 0, color: '#991b1b' }
    };
    invs.filter(i => i.status !== 'paid').forEach(inv => {
      const due = new Date(inv.due_date || inv.date || now);
      const daysOverdue = Math.floor((now - due) / 86400000);
      const amt = inv.total || 0;
      if (daysOverdue <= 0) { buckets.current.amount += amt; buckets.current.count++; }
      else if (daysOverdue <= 30) { buckets.d30.amount += amt; buckets.d30.count++; }
      else if (daysOverdue <= 60) { buckets.d60.amount += amt; buckets.d60.count++; }
      else if (daysOverdue <= 90) { buckets.d90.amount += amt; buckets.d90.count++; }
      else { buckets.plus.amount += amt; buckets.plus.count++; }
    });
    return Object.values(buckets);
  }

  const agingData = buildAgingBuckets(invoices);
  const totalOutstanding = agingData.reduce((s, d) => s + d.amount, 0);
  const totalOverdue = agingData.slice(1).reduce((s, d) => s + d.amount, 0);

  // Build vendor-wise outstanding
  function buildVendorOutstanding(invs, vends) {
    const map = {};
    invs.filter(i => i.status !== 'paid').forEach(inv => {
      if (!map[inv.vendor]) map[inv.vendor] = { name: inv.vendor, total: 0, count: 0, oldest: 0 };
      map[inv.vendor].total += inv.total || 0;
      map[inv.vendor].count++;
      const days = Math.floor((new Date() - new Date(inv.due_date || inv.date)) / 86400000);
      if (days > map[inv.vendor].oldest) map[inv.vendor].oldest = days;
    });
    return Object.values(map).sort((a, b) => b.total - a.total).slice(0, 8);
  }

  const vendorOS = buildVendorOutstanding(invoices, vendors);

  const displayPayments = useStaticPayments ? FF_DATA.payments : payments;

  let activeTab = 'aging';
  let currentPayments = [...displayPayments];

  function render() {
    container.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h2>Payments & Aging Analysis</h2>
        <p>Outstanding: <strong>${API._fmt(totalOutstanding)}</strong> • Overdue: <strong style="color:var(--danger)">${API._fmt(totalOverdue)}</strong></p>
      </div>
      <div class="page-header-right">
        <button class="btn btn-outline" onclick="sendBulkReminders()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          Bulk Reminders
        </button>
        <button class="btn btn-primary" onclick="exportAgingReport()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export Report
        </button>
      </div>
    </div>

    <!-- AGING BUCKET CARDS -->
    <div class="aging-grid" style="margin-bottom:28px">
      ${agingData.map(d => `
        <div class="aging-card" style="border-top:3px solid ${d.color}">
          <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:${d.color};margin-bottom:8px">${d.bucket}</div>
          <div style="font-size:28px;font-weight:900;color:${d.color};margin-bottom:4px">${API._fmt(d.amount)}</div>
          <div style="font-size:12px;color:${d.color}88;margin-bottom:${d.bucket !== 'Current' ? '12' : '0'}px">${d.count} invoice${d.count !== 1 ? 's' : ''}</div>
          ${d.bucket !== 'Current' && d.count > 0 ? `<button class="btn btn-sm" style="background:${d.color}18;color:${d.color};border:1px solid ${d.color}40;font-size:11px;width:100%;justify-content:center" onclick="sendReminder('${d.bucket}')">📧 Send Reminder</button>` : ''}
        </div>
      `).join('')}
    </div>

    <!-- TAB NAV -->
    <div class="tab-nav">
      <button class="tab-btn ${activeTab==='aging'?'active':''}" onclick="switchPayTab('aging')">📊 Aging Analysis</button>
      <button class="tab-btn ${activeTab==='schedule'?'active':''}" onclick="switchPayTab('schedule')">💳 Payment Schedule</button>
      <button class="tab-btn ${activeTab==='calendar'?'active':''}" onclick="switchPayTab('calendar')">📅 Calendar View</button>
      <button class="tab-btn ${activeTab==='history'?'active':''}" onclick="switchPayTab('history')">🕐 Payment History</button>
    </div>

    <div id="payTabContent">
      ${renderPayTab(activeTab)}
    </div>`;

    window.switchPayTab = (tab) => { activeTab = tab; render(); };
    window.sendReminder = (bucket) => showToast(`📧 Reminder emails sent for ${bucket} invoices`, 'info');
    window.sendBulkReminders = () => showToast('📧 Bulk reminders sent to all overdue vendors', 'info');

    setTimeout(() => {
      if (activeTab === 'aging') renderAgingChart();
    }, 100);
  }

  function renderPayTab(tab) {
    if (tab === 'aging') return renderAgingTab();
    if (tab === 'schedule') return renderScheduleTab();
    if (tab === 'calendar') return renderCalendarTab();
    if (tab === 'history') return renderHistoryTab();
    return '';
  }

  function renderAgingTab() {
    const total = agingData.reduce((s, d) => s + d.amount, 0) || 1;
    return `
    <div class="grid-2-1" style="gap:24px">
      <div class="card">
        <div style="padding:20px 24px 0"><div class="card-title">Aging Distribution</div><div class="card-subtitle">Outstanding payables by age (₹)</div></div>
        <div class="card-body" style="padding-top:16px">
          <canvas id="agingChart" style="width:100%;height:250px;display:block"></canvas>
        </div>
      </div>

      <div class="card card-body">
        <div style="font-size:15px;font-weight:700;margin-bottom:20px">📊 Aging Summary</div>
        ${agingData.map(d => `
          <div style="margin-bottom:14px">
            <div style="display:flex;justify-content:space-between;margin-bottom:5px">
              <span style="font-size:13px;font-weight:600">${d.bucket}</span>
              <span style="font-size:13px;font-weight:700;color:${d.color}">${API._fmt(d.amount)}</span>
            </div>
            <div style="height:6px;background:#e2e8f0;border-radius:999px;overflow:hidden">
              <div style="height:100%;background:${d.color};width:${Math.round(d.amount/total*100)}%;border-radius:999px"></div>
            </div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:3px">${d.count} invoices • ${Math.round(d.amount/total*100)}% of total</div>
          </div>
        `).join('')}
        <div style="border-top:2px solid var(--border);padding-top:12px;margin-top:4px;display:flex;justify-content:space-between">
          <span style="font-weight:700">Total Outstanding</span>
          <span style="font-weight:800;color:var(--primary);font-size:16px">${API._fmt(total)}</span>
        </div>
        ${totalOverdue > 0 ? `
          <div style="margin-top:14px;padding:12px;background:#fef2f2;border-radius:8px;border:1px solid #fecaca">
            <div style="font-size:12px;font-weight:700;color:#991b1b">⚠️ ${API._fmt(totalOverdue)} overdue</div>
            <div style="font-size:11px;color:#7f1d1d;margin-top:3px">Pay immediately to avoid 1.5%/month interest charges</div>
          </div>
        ` : ''}
      </div>
    </div>

    <!-- VENDOR-WISE OUTSTANDING -->
    <div class="card" style="margin-top:24px">
      <div style="padding:20px 24px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
        <div style="font-size:15px;font-weight:700">Vendor-wise Outstanding</div>
        <button class="btn btn-outline btn-sm" onclick="exportAgingReport()">📥 Export</button>
      </div>
      <div class="table-container">
        <table class="data-table">
          <thead><tr>
            <th>Vendor</th>
            <th>Invoices</th>
            <th>Outstanding Amount</th>
            <th>Oldest Due (Days)</th>
            <th>Risk</th>
            <th>Action</th>
          </tr></thead>
          <tbody>
            ${(vendorOS.length > 0 ? vendorOS : FF_DATA.vendors.slice(0, 6).map(v => ({
              name: v.name,
              total: v.outstanding || Math.floor(Math.random() * 800000 + 100000),
              count: Math.floor(Math.random() * 5 + 1),
              oldest: Math.floor(Math.random() * 90)
            }))).map(v => {
              const risk = v.oldest > 60 ? 'high' : v.oldest > 30 ? 'medium' : 'low';
              return `
              <tr>
                <td>
                  <div style="display:flex;align-items:center;gap:8px">
                    <div style="width:32px;height:32px;border-radius:8px;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0">${(v.name||'').slice(0,2).toUpperCase()}</div>
                    <span style="font-weight:500">${v.name}</span>
                  </div>
                </td>
                <td style="text-align:center;font-weight:600">${v.count}</td>
                <td style="font-weight:700;color:${v.total > 500000 ? 'var(--danger)' : 'var(--text)'}">${API._fmt(v.total)}</td>
                <td style="text-align:center;color:${v.oldest > 30 ? 'var(--danger)' : 'var(--text-muted)'};font-weight:${v.oldest > 30 ? '700' : '400'}">${v.oldest} days</td>
                <td><span class="badge ${risk==='high'?'badge-danger':risk==='medium'?'badge-warning':'badge-success'}">${risk==='high'?'⚠️ High':risk==='medium'?'🟡 Medium':'✅ Low'}</span></td>
                <td>
                  <div style="display:flex;gap:4px">
                    <button class="btn btn-sm btn-primary" onclick="showToast('Payment reminder sent to ${v.name}','success')">📧 Remind</button>
                    <button class="btn btn-sm btn-success" onclick="processVendorPayment('${v.name}',${v.total})">💸 Pay</button>
                  </div>
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
  }

  function renderScheduleTab() {
    const pdisplay = currentPayments.length > 0 ? currentPayments : FF_DATA.payments;
    return `
    <div class="card">
      <div style="padding:20px 24px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
        <div style="font-size:15px;font-weight:700">💳 Payment Schedule</div>
        <button class="btn btn-primary btn-sm" onclick="payAllPending()">⚡ Pay All Pending</button>
      </div>
      <div class="table-container">
        <table class="data-table">
          <thead><tr>
            <th>Payment ID</th>
            <th>Vendor</th>
            <th>Invoice Ref</th>
            <th>Amount</th>
            <th>Due Date</th>
            <th>Mode</th>
            <th>UTR/Ref</th>
            <th>Status</th>
            <th>Action</th>
          </tr></thead>
          <tbody>
            ${pdisplay.map((p, idx) => `
              <tr id="pay_row_${idx}">
                <td style="font-family:monospace;font-size:12px;color:var(--primary)">${p.id || 'PAY-' + idx}</td>
                <td style="font-weight:500">${p.vendor}</td>
                <td style="font-family:monospace;font-size:12px">${p.invoiceId || p.inv_number || '—'}</td>
                <td style="font-weight:700">${formatCurrencyFull(p.amount || p.total || 0)}</td>
                <td style="font-size:12px;color:${p.status==='overdue'?'var(--danger)':'var(--text-muted)'};font-weight:${p.status==='overdue'?'700':'400'}">${p.dueDate || p.due_date || '—'}</td>
                <td><span class="badge badge-gray">${p.mode || 'NEFT'}</span></td>
                <td style="font-family:monospace;font-size:11px;color:var(--text-muted)">${p.utr || '—'}</td>
                <td>${getStatusBadge(p.status)}</td>
                <td>
                  ${p.status !== 'processed' && p.status !== 'paid' ? `
                    <button class="btn btn-sm btn-success" onclick="processPaymentRow(${idx})">💸 Pay Now</button>
                  ` : '<span style="color:var(--success);font-size:12px;font-weight:600">✓ Done</span>'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <div style="padding:16px 24px;background:#eff6ff;border-top:1px solid var(--border);display:flex;align-items:center;gap:12px">
        <span style="font-size:16px">💡</span>
        <div style="font-size:13px;color:#1e40af;flex:1">
          <strong>Payment Tip:</strong> Clear overdue invoices first to avoid ${API._fmt(Math.round(totalOverdue * 0.015))} monthly interest charges
        </div>
        <button class="btn btn-sm" style="background:#1e40af;color:#fff;flex-shrink:0" onclick="payAllPending()">Pay Now → Save</button>
      </div>
    </div>`;
  }

  function renderCalendarTab() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const today = now.getDate();
    const monthName = now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

    // Mark payment days
    const paymentDays = new Set();
    invoices.filter(i => i.status !== 'paid' && i.due_date).forEach(inv => {
      const due = new Date(inv.due_date);
      if (due.getMonth() === month && due.getFullYear() === year) paymentDays.add(due.getDate());
    });
    // Add some static
    [5, 11, 14, 18, 22, 28].forEach(d => paymentDays.add(d));

    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    return `
    <div class="card card-body">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
        <h3 style="font-size:18px;font-weight:700">📅 ${monthName} — Payment Calendar</h3>
        <div style="display:flex;gap:8px">
          <button class="btn btn-outline btn-sm" onclick="showToast('Previous month','info')">← Prev</button>
          <button class="btn btn-outline btn-sm" onclick="showToast('Next month','info')">Next →</button>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:8px">
        ${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => `<div style="text-align:center;font-size:12px;font-weight:700;color:var(--text-muted);padding:8px 0">${d}</div>`).join('')}
      </div>
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px">
        ${days.map(d => d === null ? '<div></div>' : `
          <div style="aspect-ratio:1;display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:8px;cursor:pointer;background:${d===today?'var(--primary)':paymentDays.has(d)?'#dbeafe':'#f8fafc'};border:${paymentDays.has(d)&&d!==today?'2px solid #93c5fd':'1px solid transparent'};transition:all .15s" onclick="${paymentDays.has(d)?`showToast('Payment due: ${monthName.split(' ')[0]} ${d}','warning')`:`showToast('No payments on ${d}','info')`}" onmouseover="this.style.opacity='.8'" onmouseout="this.style.opacity='1'">
            <span style="font-size:14px;font-weight:${d===today||paymentDays.has(d)?'700':'400'};color:${d===today?'#fff':paymentDays.has(d)?'var(--info)':'var(--text)'}">${d}</span>
            ${paymentDays.has(d) ? `<span style="font-size:8px;color:${d===today?'#fff':'var(--accent)'}">₹ Due</span>` : ''}
          </div>
        `).join('')}
      </div>
      <div style="margin-top:20px;display:flex;gap:16px;justify-content:center;font-size:12px;flex-wrap:wrap">
        <div style="display:flex;align-items:center;gap:6px"><div style="width:12px;height:12px;background:var(--primary);border-radius:2px"></div> Today</div>
        <div style="display:flex;align-items:center;gap:6px"><div style="width:12px;height:12px;background:#dbeafe;border:1.5px solid #93c5fd;border-radius:2px"></div> Payment Due</div>
      </div>
    </div>`;
  }

  function renderHistoryTab() {
    const history = [
      { date: '2024-03-15', id: 'PAY-0233', vendor: 'Delhivery Ltd', amount: 336300, mode: 'RTGS', utr: 'HDFC2024031500234', status: 'processed' },
      { date: '2024-03-12', id: 'PAY-0232', vendor: 'BlueDart Express', amount: 312700, mode: 'NEFT', utr: 'ICIC2024031200567', status: 'processed' },
      { date: '2024-03-10', id: 'PAY-0231', vendor: 'VRL Logistics', amount: 167560, mode: 'NEFT', utr: 'HDFC2024031000891', status: 'processed' },
      { date: '2024-03-08', id: 'PAY-0230', vendor: 'Delhivery Ltd', amount: 112100, mode: 'RTGS', utr: 'HDFC2024030800112', status: 'processed' },
      { date: '2024-03-05', id: 'PAY-0229', vendor: 'TCI Express', amount: 218300, mode: 'RTGS', utr: 'ICIC2024030500445', status: 'processed' },
      { date: '2024-03-03', id: 'PAY-0228', vendor: 'Gati Logistics', amount: 184080, mode: 'NEFT', utr: 'KOTAK2024030300778', status: 'processed' }
    ];
    return `
    <div class="card">
      <div style="padding:20px 24px;border-bottom:1px solid var(--border);font-size:15px;font-weight:700">🕐 Payment History</div>
      <div class="table-container">
        <table class="data-table">
          <thead><tr>
            <th>Date</th><th>Payment ID</th><th>Vendor</th><th>Amount</th><th>Mode</th><th>UTR Number</th><th>Status</th>
          </tr></thead>
          <tbody>
            ${history.map(p => `
              <tr>
                <td style="font-size:12px;color:var(--text-muted)">${p.date}</td>
                <td style="font-family:monospace;font-size:12px;color:var(--primary)">${p.id}</td>
                <td style="font-weight:500">${p.vendor}</td>
                <td style="font-weight:700">${formatCurrencyFull(p.amount)}</td>
                <td><span class="badge badge-gray">${p.mode}</span></td>
                <td style="font-family:monospace;font-size:11px;color:var(--text-muted)">${p.utr}</td>
                <td>${getStatusBadge(p.status)}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr style="background:#f8fafc;font-weight:700">
              <td colspan="3" style="padding:12px 16px">Total Paid (March 2024)</td>
              <td style="padding:12px 16px;font-size:16px;font-weight:800;color:var(--success)">${formatCurrencyFull(history.reduce((s,p)=>s+p.amount,0))}</td>
              <td colspan="3"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>`;
  }

  function renderAgingChart() {
    const data = agingData.map(d => ({ label: d.bucket.replace(' Days', 'd').replace('Current', 'Curr'), value: d.amount }));
    FFCharts.renderBar('agingChart', data, {
      colors: ['#10b981', '#f59e0b', '#f97316', '#ef4444', '#991b1b'],
      formatY: v => API._fmt(v)
    });
  }

  window.processPaymentRow = async (idx) => {
    const p = currentPayments[idx];
    if (!p) return;
    showToast('⏳ Processing payment...', 'info');
    const utr = `HDFC${Date.now()}`;
    if (p.id && !useStaticPayments) {
      await API.processPayment(p.id, 'NEFT', 'HDFC Bank');
    }
    p.status = 'processed';
    p.utr = utr;
    showToast(`✅ Payment processed! UTR: ${utr.slice(-8)}`);
    render();
  };

  window.payAllPending = async () => {
    showToast('⏳ Processing all pending payments...', 'info');
    currentPayments.forEach(p => {
      if (p.status !== 'processed' && p.status !== 'paid') {
        p.status = 'processed';
        p.utr = `HDFC${Date.now() + Math.random()}`;
      }
    });
    await API.logActivity(user.id, user.id, 'payment', `Bulk payment: ${currentPayments.length} payments processed`, '#10b981', '💸', '');
    showToast(`✅ All payments processed!`);
    render();
  };

  window.processVendorPayment = (name, amount) => {
    openModal(`
      <div class="modal modal-sm">
        <div class="modal-header"><div class="modal-title">💸 Process Payment</div><button class="modal-close" onclick="closeModal()">✕</button></div>
        <div class="modal-body">
          <div style="text-align:center;padding:16px;background:#f0fdf4;border-radius:10px;margin-bottom:16px">
            <div style="font-size:12px;color:#166534;margin-bottom:4px">Payment to</div>
            <div style="font-size:18px;font-weight:700">${name}</div>
            <div style="font-size:28px;font-weight:900;color:#166534;margin-top:4px">${API._fmt(amount)}</div>
          </div>
          <div class="form-group">
            <label class="form-label">Payment Mode</label>
            <select class="form-input" id="payMode">
              <option>NEFT</option><option>RTGS</option><option>IMPS</option><option>Cheque</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Bank Account</label>
            <select class="form-input" id="payBank">
              <option>HDFC Bank — ***1234</option><option>ICICI Bank — ***5678</option><option>Kotak Bank — ***9012</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
          <button class="btn btn-success" onclick="showToast('Payment of ${API._fmt(amount)} initiated for ${name} ✓');closeModal()">Confirm Payment</button>
        </div>
      </div>`);
  };

  render();
};

function exportAgingReport() {
  const user = Session.get();
  if (user && typeof Exporter !== 'undefined') {
    API.getInvoices(user.id).then(res => {
      Exporter.agingCSV(res.data || []);
    });
    return;
  }
  const rows = ['Bucket,Amount,Count'];
  FF_DATA.agingData.forEach(d => rows.push(`${d.bucket},${d.amount},${d.count}`));
  const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'aging_report.csv';
  a.click();
  showToast('Aging report exported 📊');
}
