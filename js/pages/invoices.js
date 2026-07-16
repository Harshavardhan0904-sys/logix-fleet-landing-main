// ============================================================
// Aetra — Invoice Management (Full API CRUD)
// ============================================================

// Helper: Convert OCR date formats to YYYY-MM-DD format
function convertOCRDate(dateStr) {
  if (!dateStr) return null;
  
  // Remove extra spaces
  dateStr = dateStr.replace(/\s+/g, '').trim();
  
  // Try multiple date patterns: DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY, YYYY-MM-DD
  const patterns = [
    { regex: /^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/, groups: [1, 2, 3], isDDMMYYYY: true },  // DD/MM/YYYY
    { regex: /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/, groups: [1, 2, 3], isDDMMYYYY: false },    // YYYY-MM-DD
  ];
  
  for (let pattern of patterns) {
    const match = dateStr.match(pattern.regex);
    if (match) {
      let day, month, year;
      
      if (pattern.isDDMMYYYY) {
        day = match[1].padStart(2, '0');
        month = match[2].padStart(2, '0');
        year = match[3];
      } else {
        year = match[1];
        month = match[2].padStart(2, '0');
        day = match[3].padStart(2, '0');
      }
      
      // Validate date
      if (parseInt(day) > 0 && parseInt(day) <= 31 && 
          parseInt(month) > 0 && parseInt(month) <= 12 &&
          parseInt(year) >= 2000 && parseInt(year) <= 2099) {
        return `${year}-${month}-${day}`;
      }
    }
  }
  
  return null;
}

Pages.invoices = async function(container) {
  const user = Session.get();
  if (!user) return Router.navigate('login');

  container.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:300px;flex-direction:column;gap:12px">
    <div style="width:36px;height:36px;border:3px solid #e2e8f0;border-top-color:var(--primary);border-radius:50%;animation:spin .7s linear infinite"></div>
    <div style="font-size:13px;color:var(--text-muted)">Loading invoices from database...</div>
  </div>`;

  const [invRes, vendRes] = await Promise.all([
    API.getInvoices(user.id),
    API.getVendors(user.id)
  ]);

  let allInvoices = invRes.data || [];
  const vendors = vendRes.data || [];

  let selected = new Set();
  let sortCol = 'date';
  let sortDir = 'desc';
  let filterStatus = 'all';
  let filterVendor = 'all';
  let searchText = '';

  function getFiltered() {
    return [...allInvoices].filter(inv => {
      const matchStatus = filterStatus === 'all' || inv.status === filterStatus;
      const matchVendor = filterVendor === 'all' || inv.vendor_id === filterVendor;
      const matchSearch = !searchText || (inv.inv_number||'').toLowerCase().includes(searchText.toLowerCase()) ||
        (inv.vendor||'').toLowerCase().includes(searchText.toLowerCase()) ||
        (inv.route||'').toLowerCase().includes(searchText.toLowerCase());
      return matchStatus && matchVendor && matchSearch;
    }).sort((a, b) => {
      let av = a[sortCol] ?? '', bv = b[sortCol] ?? '';
      if (typeof av === 'string') av = av.toLowerCase(), bv = bv.toLowerCase();
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
  }

  function render() {
    const filtered = getFiltered();
    const allSel = filtered.length > 0 && filtered.every(i => selected.has(i.id));
    const selCount = filtered.filter(i => selected.has(i.id)).length;
    const selTotal = filtered.filter(i => selected.has(i.id)).reduce((s,i) => s+(i.total||0), 0);
    const totalFiltered = filtered.reduce((s,i) => s+(i.total||0), 0);

    const paid = allInvoices.filter(i=>i.status==='paid');
    const pending = allInvoices.filter(i=>i.status==='pending');
    const overdue = allInvoices.filter(i=>i.status==='overdue');
    const disputed = allInvoices.filter(i=>i.status==='disputed');

    container.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h2>Invoice Management</h2>
        <p>${allInvoices.length} invoices • ${API._fmt(allInvoices.reduce((s,i)=>s+(i.total||0),0))} total value</p>
      </div>
      <div class="page-header-right">
        <button class="btn btn-outline" onclick="openUploadModal()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          New Invoice
        </button>
        <button class="btn btn-primary" onclick="openExportInvModal()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export
        </button>
      </div>
    </div>

    <!-- STATUS SUMMARY -->
    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:14px;margin-bottom:24px">
      ${[
        { label:'All', count:allInvoices.length, amt:allInvoices.reduce((s,i)=>s+(i.total||0),0), c:'var(--primary)', bg:'#eff6ff', key:'all' },
        { label:'Paid', count:paid.length, amt:paid.reduce((s,i)=>s+(i.total||0),0), c:'var(--success)', bg:'#f0fdf4', key:'paid' },
        { label:'Pending', count:pending.length, amt:pending.reduce((s,i)=>s+(i.total||0),0), c:'var(--warning)', bg:'#fffbeb', key:'pending' },
        { label:'Overdue', count:overdue.length, amt:overdue.reduce((s,i)=>s+(i.total||0),0), c:'var(--danger)', bg:'#fef2f2', key:'overdue' },
        { label:'Disputed', count:disputed.length, amt:disputed.reduce((s,i)=>s+(i.total||0),0), c:'var(--purple)', bg:'#faf5ff', key:'disputed' }
      ].map(s => `
        <div style="padding:14px;background:${s.bg};border-radius:12px;cursor:pointer;border:2px solid ${filterStatus===s.key?s.c:'transparent'};transition:all .15s" onclick="setInvFilter('${s.key}')">
          <div style="font-size:22px;font-weight:800;color:${s.c}">${s.count}</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:2px">${s.label}</div>
          <div style="font-size:11px;color:var(--text-light);margin-top:2px">${API._fmt(s.amt)}</div>
        </div>
      `).join('')}
    </div>

    <!-- FILTERS -->
    <div class="filters-bar">
      <div style="position:relative;flex:1;max-width:300px">
        <input class="filter-input w-full" style="padding-left:36px" type="text" placeholder="Search invoice, vendor, route..." id="invSearch" value="${searchText}" oninput="updateInvSearch(this.value)">
        <svg style="position:absolute;left:10px;top:50%;transform:translateY(-50%)" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      </div>
      <select class="filter-select" onchange="updateInvVendor(this.value)">
        <option value="all">All Vendors</option>
        ${vendors.map(v => `<option value="${v.id}" ${filterVendor===v.id?'selected':''}>${v.name}</option>`).join('')}
      </select>
      <select class="filter-select" onchange="updateInvStatus(this.value)">
        ${['all','paid','pending','overdue','disputed'].map(s => `<option value="${s}" ${filterStatus===s?'selected':''}>${s==='all'?'All Status':s.charAt(0).toUpperCase()+s.slice(1)}</option>`).join('')}
      </select>
      <button class="btn btn-ghost btn-sm" onclick="clearInvFilters()">✕ Clear</button>
    </div>

    ${selCount > 0 ? `
    <div class="bulk-action-bar">
      <span>${selCount} selected (${API._fmt(selTotal)})</span>
      <button class="btn btn-success btn-sm" onclick="bulkApproveInv()">✓ Approve All</button>
      <button class="btn btn-sm" style="background:#22c55e;color:#fff" onclick="bulkPayInv()">💸 Mark Paid</button>
      <button class="btn btn-sm" style="background:#3b82f6;color:#fff" onclick="Exporter.invoicesCSV([...allInvoices].filter(i=>selected.has(i.id)))">📤 Export Selected</button>
      <button class="btn btn-danger btn-sm" onclick="clearInvSelection()">✕ Clear</button>
    </div>` : ''}

    <!-- TABLE -->
    <div class="card">
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th class="checkbox-col"><input type="checkbox" ${allSel?'checked':''} onchange="toggleAllInv(this.checked)" style="width:15px;height:15px;cursor:pointer"></th>
              <th onclick="sortInvBy('inv_number')" style="cursor:pointer">Invoice # ↕</th>
              <th onclick="sortInvBy('vendor')" style="cursor:pointer">Vendor ↕</th>
              <th onclick="sortInvBy('date')" style="cursor:pointer">Date ↕</th>
              <th onclick="sortInvBy('amount')" style="cursor:pointer">Amount ↕</th>
              <th>GST</th>
              <th onclick="sortInvBy('total')" style="cursor:pointer">Total ↕</th>
              <th>HSN</th>
              <th>Route</th>
              <th>Reconcile</th>
              <th onclick="sortInvBy('status')" style="cursor:pointer">Status ↕</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.length === 0 ? `<tr><td colspan="12" style="text-align:center;padding:48px;color:var(--text-muted)">
              <div style="font-size:36px;margin-bottom:8px">🔍</div>
              <div style="font-weight:600">No invoices found</div>
              <div style="font-size:13px;margin-top:4px">Try adjusting your filters or <a href="#" onclick="setInvFilter('all');return false">clear filters</a></div>
            </td></tr>` :
            filtered.map(inv => `
              <tr class="${selected.has(inv.id)?'selected':''}">
                <td><input type="checkbox" ${selected.has(inv.id)?'checked':''} onchange="toggleInvSelect('${inv.id}',this.checked)" style="width:15px;height:15px;cursor:pointer"></td>
                <td><span style="font-family:monospace;font-weight:600;color:var(--primary);font-size:12px">${inv.inv_number||inv.id?.slice(0,8)}</span></td>
                <td>
                  <div style="display:flex;align-items:center;gap:8px">
                    <div style="width:26px;height:26px;border-radius:6px;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;flex-shrink:0">${(inv.vendor||'?').slice(0,2).toUpperCase()}</div>
                    <span style="font-size:13px;font-weight:500">${inv.vendor||'Unknown'}</span>
                  </div>
                </td>
                <td style="font-size:12px;color:var(--text-muted)">${inv.date||''}</td>
                <td style="font-weight:600">₹${Number(inv.amount||0).toLocaleString('en-IN')}</td>
                <td style="color:var(--text-muted);font-size:13px">₹${Number(inv.gst||0).toLocaleString('en-IN')}</td>
                <td style="font-weight:700;color:var(--primary)">₹${Number(inv.total||0).toLocaleString('en-IN')}</td>
                <td><span style="font-family:monospace;font-size:12px;background:#f1f5f9;padding:2px 6px;border-radius:4px">${inv.hsn||'9965'}</span></td>
                <td style="font-size:12px;color:var(--text-muted);max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${inv.route||''}">${inv.route||'—'}</td>
                <td>${getReconcileBadge(inv.reconciled||'pending')}</td>
                <td>${getStatusBadge(inv.status||'pending')}</td>
                <td>
                  <div style="display:flex;gap:3px">
                    <button class="btn btn-sm btn-outline" onclick="viewInvoiceDetail('${inv.id}')" title="View">👁</button>
                    ${inv.status !== 'paid' ? `<button class="btn btn-sm btn-success" style="padding:5px 8px;font-size:11px" onclick="approveOneInv('${inv.id}')">✓</button>` : ''}
                    <button class="btn btn-sm btn-outline" onclick="deleteOneInv('${inv.id}')" title="Delete" style="color:var(--danger)">🗑</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 20px;border-top:1px solid var(--border);font-size:13px;color:var(--text-muted)">
        <span>Showing <strong style="color:var(--text)">${filtered.length}</strong> of ${allInvoices.length} invoices • Total: <strong style="color:var(--primary)">${API._fmt(totalFiltered)}</strong></span>
        <div style="display:flex;gap:4px;align-items:center">
          <span style="font-size:12px">Sort: ${sortCol} ${sortDir==='asc'?'↑':'↓'}</span>
        </div>
      </div>
    </div>`;

    wireInvoiceHandlers();
  }

  function wireInvoiceHandlers() {
    window.toggleInvSelect = (id, v) => { v ? selected.add(id) : selected.delete(id); render(); };
    window.toggleAllInv = (v) => { getFiltered().forEach(i => v ? selected.add(i.id) : selected.delete(i.id)); render(); };
    window.clearInvSelection = () => { selected.clear(); render(); };
    window.sortInvBy = (col) => { sortDir = sortCol===col&&sortDir==='asc'?'desc':'asc'; sortCol=col; render(); };
    window.setInvFilter = (s) => { filterStatus=s; render(); };
    window.updateInvStatus = (v) => { filterStatus=v; render(); };
    window.updateInvVendor = (v) => { filterVendor=v; render(); };
    window.updateInvSearch = (v) => { searchText=v; render(); };
    window.clearInvFilters = () => { filterStatus='all'; filterVendor='all'; searchText=''; render(); };

    window.approveOneInv = async (id) => {
      await API.approveInvoice(id, user.name);
      await API.logActivity(user.id, user.id, 'invoice', `Invoice approved by ${user.name}`, '#10b981', '✅', id);
      const inv = allInvoices.find(i=>i.id===id);
      if (inv) inv.status = 'paid';
      showToast(`Invoice approved ✓`);
      render();
    };

    window.deleteOneInv = async (id) => {
      if (!confirm('Delete this invoice permanently?')) return;
      await API.deleteInvoice(id);
      allInvoices = allInvoices.filter(i=>i.id!==id);
      selected.delete(id);
      showToast('Invoice deleted', 'warning');
      render();
    };

    window.bulkApproveInv = async () => {
      const ids = [...selected];
      for (const id of ids) {
        await API.approveInvoice(id, user.name);
        const inv = allInvoices.find(i=>i.id===id);
        if (inv) inv.status = 'paid';
      }
      await API.logActivity(user.id, user.id, 'invoice', `Bulk approved ${ids.length} invoices`, '#10b981', '✅', '');
      showToast(`${ids.length} invoices approved ✓`);
      selected.clear(); render();
    };

    window.bulkPayInv = async () => {
      const ids = [...selected];
      for (const id of ids) {
        const inv = allInvoices.find(i=>i.id===id);
        if (inv) inv.status = 'paid';
        await API.updateInvoice(id, { status: 'paid' });
      }
      showToast(`${ids.length} invoices marked paid`);
      selected.clear(); render();
    };

    window.viewInvoiceDetail = (id) => {
      const inv = allInvoices.find(i=>i.id===id);
      if (!inv) return;
      openModal(`
        <div class="modal modal-lg">
          <div class="modal-header">
            <div><div class="modal-title">${inv.inv_number||'Invoice'}</div>
            <div style="font-size:13px;color:var(--text-muted);margin-top:2px">${inv.vendor||''} • ${inv.date||''}</div></div>
            <button class="modal-close" onclick="closeModal()">✕</button>
          </div>
          <div class="modal-body">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px">
              ${[
                { lbl:'Vendor', val: inv.vendor||'—', sub: `GSTIN: ${inv.vendor_gstin||'N/A'}` },
                { lbl:'Status', val: getStatusBadge(inv.status)+' '+getReconcileBadge(inv.reconciled), sub:'' },
                { lbl:'Route', val: inv.route||'—', sub: `${inv.mode||''} • ${inv.weight||''}` },
                { lbl:'Due Date', val: inv.due_date||'—', sub: '' }
              ].map(f=>`<div><div style="font-size:11px;text-transform:uppercase;letter-spacing:.8px;color:var(--text-muted);margin-bottom:4px">${f.lbl}</div><div style="font-weight:700;font-size:14px">${f.val}</div>${f.sub?`<div style="font-size:12px;color:var(--text-muted);margin-top:2px">${f.sub}</div>`:''}</div>`).join('')}
            </div>
            <div style="background:var(--bg);border-radius:12px;padding:20px;margin-bottom:20px">
              <div style="font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.8px;margin-bottom:14px">Invoice Line Items</div>
              <table style="width:100%;font-size:13px">
                <thead><tr style="border-bottom:1px solid var(--border)">
                  <th style="text-align:left;padding:8px;color:var(--text-muted)">Description</th>
                  <th style="text-align:right;padding:8px;color:var(--text-muted)">HSN</th>
                  <th style="text-align:right;padding:8px;color:var(--text-muted)">Amount</th>
                </tr></thead>
                <tbody>
                  <tr><td style="padding:10px 8px">Freight Charges — ${inv.route||''}</td><td style="text-align:right;padding:8px;font-family:monospace">${inv.hsn||'9965'}</td><td style="text-align:right;padding:8px;font-weight:600">₹${Number(inv.amount||0).toLocaleString('en-IN')}</td></tr>
                  <tr><td style="padding:8px;color:var(--text-muted)">CGST @ 9%</td><td></td><td style="text-align:right;padding:8px;color:var(--text-muted)">₹${Number(Math.round((inv.gst||0)/2)).toLocaleString('en-IN')}</td></tr>
                  <tr><td style="padding:8px;color:var(--text-muted)">SGST @ 9%</td><td></td><td style="text-align:right;padding:8px;color:var(--text-muted)">₹${Number(Math.round((inv.gst||0)/2)).toLocaleString('en-IN')}</td></tr>
                </tbody>
                <tfoot><tr style="border-top:2px solid var(--border)"><td colspan="2" style="padding:12px 8px;font-weight:700">Total</td><td style="text-align:right;padding:12px 8px;font-weight:800;font-size:16px;color:var(--primary)">₹${Number(inv.total||0).toLocaleString('en-IN')}</td></tr></tfoot>
              </table>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
              <div style="padding:14px;background:#f0fdf4;border-radius:10px"><div style="font-size:12px;color:#166534;font-weight:600">ITC Eligible</div><div style="font-size:20px;font-weight:800;color:#166534">₹${Number(inv.gst||0).toLocaleString('en-IN')}</div></div>
              <div style="padding:14px;background:#eff6ff;border-radius:10px"><div style="font-size:12px;color:#1e40af;font-weight:600">Month-Year</div><div style="font-size:16px;font-weight:700;color:#1e40af;margin-top:4px">${inv.month_year||'—'}</div></div>
            </div>
            ${inv.notes ? `<div style="margin-top:14px;padding:12px;background:var(--bg);border-radius:8px;font-size:13px;color:var(--text-muted)">📝 ${inv.notes}</div>` : ''}
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" onclick="closeModal()">Close</button>
            ${inv.status!=='paid'?`<button class="btn btn-success" onclick="approveOneInv('${inv.id}');closeModal()">✓ Approve</button>`:''}
            <button class="btn btn-primary" onclick="showToast('Payment initiated for ₹${Number(inv.total||0).toLocaleString('en-IN')}','success');closeModal()">💸 Pay Now</button>
          </div>
        </div>`);
    };

    window.openUploadModal = () => openAddInvoiceModal(user, vendors, allInvoices, render);
    window.openExportInvModal = () => {
      openModal(`<div class="modal modal-sm">
        <div class="modal-header"><div class="modal-title">📤 Export Invoices</div><button class="modal-close" onclick="closeModal()">✕</button></div>
        <div class="modal-body" style="display:grid;gap:8px">
          <button class="btn btn-outline w-full" style="justify-content:flex-start;gap:12px" onclick="Exporter.invoicesCSV(allInvoices);closeModal()"><span style="font-size:18px">📊</span>Export All as CSV</button>
          <button class="btn btn-outline w-full" style="justify-content:flex-start;gap:12px" onclick="Exporter.toExcel(allInvoices,'invoices',[{label:'Invoice #',key:'inv_number'},{label:'Vendor',key:'vendor'},{label:'Date',key:'date'},{label:'Total ₹',key:'total'},{label:'Status',key:'status'},{label:'Route',key:'route'}]);closeModal()"><span style="font-size:18px">📗</span>Export All as Excel</button>
          <button class="btn btn-outline w-full" style="justify-content:flex-start;gap:12px" onclick="Exporter.invoicesPDF(allInvoices);closeModal()"><span style="font-size:18px">📄</span>Export PDF Report</button>
          <button class="btn btn-outline w-full" style="justify-content:flex-start;gap:12px" onclick="Exporter.gstCSV(allInvoices);closeModal()"><span style="font-size:18px">📋</span>GSTR-2B CSV</button>
        </div>
        <div class="modal-footer"><button class="btn btn-outline" onclick="closeModal()">Cancel</button></div>
      </div>`);
    };
  }

  render();
};

// ============================================================
// OCR INVOICE IMPORT - Auto-fill form from uploaded invoice
// ============================================================
window.importFromOCR = async () => {
  // First, open the invoice form modal
  const user = Session.get();
  const vendors = await API.getVendors(user.id).then(r => r.data || []);
  
  // Open the modal with the form first
  openAddInvoiceModal(user, vendors, window.allInvoices || [], () => {});
  
  // Now create the file input for OCR
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*,application/pdf';
  fileInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    showToast('📸 Uploading invoice...', 'info');
    
    const formData = new FormData();
    formData.append('document', file);
    
    try {
      // Get token from session
      const token = Session.getToken();
      if (!token) {
        showToast('❌ Authentication failed - please login again', 'error');
        return;
      }
      
      // Debug: Log token info
      console.log('🔐 OCR Upload - Token:', token.substring(0, 20) + '...', 'Length:', token.length);
      
      // Upload to OCR
      // IMPORTANT: Do NOT set Content-Type when using FormData - let browser set it with boundary
      const uploadRes = await fetch('https://freightflow-pkf5.onrender.com/api/ocr/upload', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      console.log('📤 OCR Response Status:', uploadRes.status, uploadRes.statusText);
      
      if (!uploadRes.ok) {
        const errText = await uploadRes.text();
        console.error('❌ OCR Error Response:', errText);
        
        // Try to parse as JSON
        let errData;
        try {
          errData = JSON.parse(errText);
        } catch (e) {
          errData = { error: errText || 'Upload failed' };
        }
        throw new Error(errData.error || `Upload failed: ${uploadRes.status} ${uploadRes.statusText}`);
      }
      
      const uploadData = await uploadRes.json();
      console.log('📥 Upload Response Data:', uploadData);
      
      const jobId = uploadData.ocr_job_id;
      if (!jobId) {
        throw new Error('No job ID returned from upload: ' + JSON.stringify(uploadData));
      }
      console.log('🔍 Job ID:', jobId);
      
      showToast('🔄 Processing invoice with OCR...', 'info');
      
      // Poll for completion (timeout: 60 attempts * 1000ms = 60 seconds, allowing time for Tesseract.js)
      let status = null;
      for (let i = 0; i < 60; i++) {
        console.log(`⏳ Polling status attempt ${i + 1}/60 for job ${jobId}...`);
        let currentToken = Session.getToken();
        
        let statusRes = await fetch(`https://freightflow-pkf5.onrender.com/api/ocr/status/${jobId}`, {
          headers: { 'Authorization': `Bearer ${currentToken}` }
        });

        // If 401, refresh token and retry once
        if (statusRes.status === 401) {
          console.log('🔄 Status check: 401 received, attempting token refresh...');
          const refreshed = await Session.refreshToken();
          if (refreshed) {
            currentToken = Session.getToken();
            statusRes = await fetch(`https://freightflow-pkf5.onrender.com/api/ocr/status/${jobId}`, {
              headers: { 'Authorization': `Bearer ${currentToken}` }
            });
          } else {
            console.error('❌ Token refresh failed');
            showToast('Session expired. Please log in again.', 'error');
            window.location.href = '/login.html';
            return;
          }
        }
        
        if (!statusRes.ok) {
          const errText = await statusRes.text();
          console.error('❌ Status Check Error:', statusRes.status, errText);
          await new Promise(r => setTimeout(r, 1000));
          continue;
        }
        
        status = await statusRes.json();
        console.log('📋 Status Data:', status);
        
        if (status.status === 'completed') {
          console.log('✅ OCR Completed! Result:', status.result);
          showToast('✅ Invoice extracted! Filling form...', 'success');
          autoFillInvoiceForm(status.result, status.confidence);
          break;
        } else if (status.status === 'failed') {
          console.error('❌ OCR Failed:', status.error);
          showToast('❌ OCR failed: ' + status.error, 'error');
          return;
        }
        
        console.log('⏳ Still processing... status:', status.status);
        
        // Wait 1000ms (1 second) before retry - increased from 500ms
        await new Promise(r => setTimeout(r, 1000));
      }
      
      if (!status || status.status !== 'completed') {
        console.error('⏱️ OCR Polling Timeout after 60 attempts');
        showToast('⏱️ OCR processing timeout', 'warn');
      }
      
    } catch (error) {
      showToast('❌ Error: ' + error.message, 'error');
    }
  };
  
  fileInput.click();
};

// Auto-fill the invoice form with OCR extracted data
window.autoFillInvoiceForm = (ocrData, confidence) => {
  const conf = Math.round((confidence || 0.7) * 100);
  
  console.log('🔄 Auto-filling form with OCR data:', { ocrData, confidence: conf });
  
  // Safety: Wait for form to be ready after modal renders
  // Increased timeout to ensure modal is fully rendered
  setTimeout(() => {
    try {
      // Ensure modal is visible
      const modal = document.querySelector('.modal');
      if (!modal) {
        console.error('❌ Modal not found! Retrying in 500ms...');
        setTimeout(() => window.autoFillInvoiceForm(ocrData, confidence), 500);
        return;
      }
      // Vendor - Try to match if name exists and has reasonable confidence
      if (ocrData?.vendor_name && ocrData.vendor_name.trim().length > 2 && conf >= 30) {
        const vendorSelect = document.getElementById('newVendor');
        if (vendorSelect && vendorSelect.options.length > 0) {
          const searchName = ocrData.vendor_name.toLowerCase().trim();
          console.log(`🔍 Vendor Matching Debug: OCR vendor="${ocrData.vendor_name}", searchName="${searchName}"`);
          
          // Vendor aliases/mappings for OCR variations → System vendors
          const vendorAliases = {
            'bangalore logistics': 'Express Logistics',
            'bangalore': 'Express Logistics',
            'allcargo': 'Express Logistics',
            'allcargo gati': 'Express Logistics',
            'locus': 'FastFreight Inc',
            'locus logistics': 'FastFreight Inc',
            'blue dart': 'TruckHub Services',
            'blue dart express': 'TruckHub Services',
            'blue dart logistics': 'TruckHub Services',
            'tci express': 'TruckHub Services',
            'tci express limited': 'TruckHub Services',
            'tci': 'TruckHub Services',
            'freightflow': 'Express Logistics',
            'freightflow analytics': 'Express Logistics',
            'freightflow logistics': 'Express Logistics',
            'delhivery': 'Express Logistics'
          };
          
          let targetVendor = null;
          let matchReason = null;
          
          // Step 1: Try substring matching with aliases
          for (const [aliasKey, systemVendor] of Object.entries(vendorAliases)) {
            if (searchName.includes(aliasKey.toLowerCase())) {
              targetVendor = systemVendor;
              matchReason = `alias "${aliasKey}"`;
              console.log(`✅ Alias match found: "${searchName}" includes "${aliasKey}"`);
              break;
            }
          }
          
          // Step 2: If no alias match, try exact match with dropdown options
          if (!targetVendor) {
            for (let option of vendorSelect.options) {
              const optionLower = option.textContent.toLowerCase().trim();
              if (optionLower === searchName || searchName === optionLower) {
                targetVendor = option.textContent;
                matchReason = 'exact dropdown match';
                console.log(`✅ Exact match found: "${searchName}" = "${optionLower}"`);
                break;
              }
            }
          }
          
          // Step 3: Set the value in dropdown
          if (targetVendor) {
            let foundOption = false;
            for (let option of vendorSelect.options) {
              if (option.textContent === targetVendor) {
                vendorSelect.value = option.value;
                vendorSelect.dispatchEvent(new Event('change', { bubbles: true }));
                console.log(`✅ VENDOR AUTO-MAPPED: "${ocrData.vendor_name}" → "${targetVendor}" (${matchReason})`);
                foundOption = true;
                break;
              }
            }
            if (!foundOption) {
              console.error(`❌ Target vendor "${targetVendor}" not found in dropdown options`);
            }
          } else {
            // No match found
            console.warn(`⚠️ Vendor "${ocrData.vendor_name}" not auto-mapped (${conf}% confidence)`);
            console.log(`   Tried aliases:`, Object.keys(vendorAliases));
            console.log(`   Available in dropdown:`, Array.from(vendorSelect.options).map(o => o.textContent));
          }
        }
      } else if (!ocrData?.vendor_name) {
        console.log('ℹ️ No vendor name extracted. Select manually.');
      }
      
      
      // Invoice Number
      if (ocrData?.invoice_number && ocrData.invoice_number.trim().length > 0) {
        const invInput = document.getElementById('newInvNumber');
        if (invInput) {
          invInput.value = ocrData.invoice_number.trim();
          invInput.dispatchEvent(new Event('input', { bubbles: true }));
          console.log(`📄 Invoice#: ${ocrData.invoice_number}`);
        }
      }
      
      // Invoice Date
      if (ocrData?.invoice_date) {
        const dateInput = document.getElementById('newDate');
        if (dateInput) {
          // Convert OCR date format to YYYY-MM-DD format expected by input[type=date]
          const convertedDate = convertOCRDate(ocrData.invoice_date);
          dateInput.value = convertedDate || ocrData.invoice_date;
          dateInput.dispatchEvent(new Event('change', { bubbles: true }));
          console.log(`📅 Date: ${ocrData.invoice_date} → ${convertedDate}`);
        }
      }
      
      // Amount - Only fill if value is reasonable (> 0)
      if (ocrData?.amount && !isNaN(ocrData.amount) && ocrData.amount > 0) {
        const amountInput = document.getElementById('newAmount');
        if (amountInput) {
          amountInput.value = ocrData.amount;
          amountInput.dispatchEvent(new Event('input', { bubbles: true }));
          console.log(`💰 Amount: ₹${ocrData.amount}`);
          // Trigger GST calculation
          window.calcNewGST && window.calcNewGST();
        }
      } else {
        console.log(`⚠️ Amount invalid or missing: ${ocrData?.amount}`);
      }
      
      // GST Rate (if detected)
      if (ocrData?.gst_rate) {
        const gstSelect = document.getElementById('newGSTRate');
        if (gstSelect) {
          gstSelect.value = parseInt(ocrData.gst_rate);
          gstSelect.dispatchEvent(new Event('change', { bubbles: true }));
          console.log(`📊 GST Rate: ${ocrData.gst_rate}%`);
        }
      }
      
      // Route
      if (ocrData?.route) {
        const routeSelect = document.getElementById('newRoute');
        if (routeSelect) {
          for (let option of routeSelect.options) {
            if (option.textContent.toLowerCase().includes(ocrData.route.toLowerCase())) {
              routeSelect.value = option.value;
              routeSelect.dispatchEvent(new Event('change', { bubbles: true }));
              console.log(`🛣️ Route: ${ocrData.route}`);
              break;
            }
          }
        }
      }
      
      // Transport Mode
      if (ocrData?.transport_mode) {
        const modeSelect = document.getElementById('newMode');
        if (modeSelect) {
          for (let option of modeSelect.options) {
            if (option.textContent.toLowerCase() === ocrData.transport_mode.toLowerCase() ||
                option.textContent.toLowerCase().includes(ocrData.transport_mode.toLowerCase())) {
              modeSelect.value = option.value;
              modeSelect.dispatchEvent(new Event('change', { bubbles: true }));
              console.log(`🚚 Mode: ${ocrData.transport_mode}`);
              break;
            }
          }
        }
      }
      
      // HSN Code
      if (ocrData?.hsn_code) {
        const hsnSelect = document.getElementById('newHSN');
        if (hsnSelect) {
          for (let option of hsnSelect.options) {
            if (option.value === ocrData.hsn_code || option.textContent.includes(ocrData.hsn_code)) {
              hsnSelect.value = option.value;
              hsnSelect.dispatchEvent(new Event('change', { bubbles: true }));
              console.log(`📦 HSN: ${ocrData.hsn_code}`);
              break;
            }
          }
        }
      }
      
      // Weight
      if (ocrData?.weight) {
        const weightInput = document.getElementById('newWeight');
        if (weightInput) {
          weightInput.value = ocrData.weight;
          weightInput.dispatchEvent(new Event('change', { bubbles: true }));
          console.log(`⚖️ Weight: ${ocrData.weight} kg`);
        }
      }
      
      // Notes - add invoice number and LR with confidence
      let noteText = `OCR Extracted (${conf}% confidence)`;
      if (ocrData?.invoice_number) noteText += ` | Invoice: ${ocrData.invoice_number}`;
      if (ocrData?.lr_number) noteText += ` | LR: ${ocrData.lr_number}`;
      
      const notesTextarea = document.getElementById('newNotes');
      if (notesTextarea) {
        notesTextarea.value = noteText;
        notesTextarea.dispatchEvent(new Event('input', { bubbles: true }));
        console.log(`📝 Notes: ${noteText}`);
      }
      
      console.log('✨ Form auto-fill complete - Review and save');
      
    } catch (error) {
      console.error('Error filling invoice form:', error.message);
      console.error(error.stack);
    }
  }, 200); // Wait for modal to fully render
};

function openAddInvoiceModal(user, vendors, allInvoices, rerender) {
  openModal(`
    <div class="modal">
      <div class="modal-header"><div class="modal-title">📥 Add New Invoice</div><button class="modal-close" onclick="closeModal()">✕</button></div>
      <div class="modal-body">
        <!-- OCR IMPORT SECTION -->
        <div style="background:#e3f2fd;border:1px dashed #2196F3;border-radius:8px;padding:12px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between">
          <div style="font-size:13px;color:#1565c0">
            <strong>📸 Quick Import:</strong> Upload invoice to auto-fill this form
          </div>
          <button type="button" class="btn btn-sm btn-primary" onclick="importFromOCR()" style="font-size:11px;padding:6px 12px">
            📸 Import OCR Data
          </button>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Vendor *</label>
            <select class="form-input" id="newVendor">
              <option value="">Select vendor...</option>
              ${vendors.map(v=>`<option value="${v.id}" data-name="${v.name}">${v.name}</option>`).join('')}
              <option value="custom">+ Add new vendor</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Invoice Date *</label>
            <input class="form-input" type="date" id="newDate" value="${new Date().toISOString().split('T')[0]}">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Base Amount (₹) *</label>
            <input class="form-input" type="number" id="newAmount" placeholder="250000" oninput="calcNewGST()">
          </div>
          <div class="form-group">
            <label class="form-label">GST Rate</label>
            <select class="form-input" id="newGSTRate" onchange="calcNewGST()">
              <option value="18" selected>18% (Standard)</option>
              <option value="5">5% (Certain transport)</option>
              <option value="12">12%</option>
              <option value="0">0% (Exempt)</option>
            </select>
          </div>
        </div>
        <div style="padding:12px;background:#f0fdf4;border-radius:8px;margin-bottom:16px;display:flex;justify-content:space-between">
          <span style="font-size:13px;color:#166534;font-weight:600">GST Amount: ₹<span id="gstPreview">0</span></span>
          <span style="font-size:13px;color:#166534;font-weight:700">Total: ₹<span id="totalPreview">0</span></span>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Route</label>
            <select class="form-input" id="newRoute">
              ${['Mumbai → Delhi','Chennai → Bangalore','Delhi → Kolkata','Hyderabad → Pune','Bangalore → Mumbai','Mumbai → Ahmedabad','Delhi → Amritsar'].map(r=>`<option>${r}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Transport Mode</label>
            <select class="form-input" id="newMode">
              ${['Road','Air','Surface','Express','Rail'].map(m=>`<option>${m}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">HSN Code</label>
            <select class="form-input" id="newHSN">
              <option value="9965">9965 — Transport of goods</option>
              <option value="9967">9967 — Supporting transport</option>
              <option value="9968">9968 — Postal/courier</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Weight</label>
            <input class="form-input" id="newWeight" placeholder="e.g. 2.4 MT">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Notes (optional)</label>
          <textarea class="form-input" id="newNotes" rows="2" placeholder="LR number, PO reference, special instructions..."></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" id="saveInvBtn" onclick="saveNewInvoice()">💾 Save Invoice</button>
      </div>
    </div>`);

  window.calcNewGST = () => {
    const amt = parseFloat(document.getElementById('newAmount')?.value)||0;
    const rate = parseFloat(document.getElementById('newGSTRate')?.value)||18;
    const gst = Math.round(amt * rate / 100);
    const el1 = document.getElementById('gstPreview'), el2 = document.getElementById('totalPreview');
    if (el1) el1.textContent = gst.toLocaleString('en-IN');
    if (el2) el2.textContent = (amt + gst).toLocaleString('en-IN');
  };

  window.saveNewInvoice = async () => {
    const btn = document.getElementById('saveInvBtn');
    const vendorSel = document.getElementById('newVendor');
    const vendorId = vendorSel?.value;
    const vendorName = vendorSel?.options[vendorSel.selectedIndex]?.dataset?.name || vendorId;
    const amount = parseFloat(document.getElementById('newAmount')?.value)||0;
    if (!vendorId || !amount) { showToast('Please fill Vendor and Amount', 'error'); return; }
    if (btn) { btn.innerHTML = '⏳ Saving...'; btn.disabled = true; }

    const date = document.getElementById('newDate')?.value;
    const gstRate = parseInt(document.getElementById('newGSTRate')?.value)||18;
    const newInv = await API.createInvoice(user.id, user.id, {
      vendor: vendorName, vendor_id: vendorId,
      date, amount,
      gst_rate: gstRate,
      route: document.getElementById('newRoute')?.value,
      mode: document.getElementById('newMode')?.value,
      hsn: document.getElementById('newHSN')?.value || '9965',
      weight: document.getElementById('newWeight')?.value,
      notes: document.getElementById('newNotes')?.value,
      due_date: new Date(new Date(date).getTime() + 30*86400000).toISOString().split('T')[0]
    });

    if (newInv.error) { showToast('Error saving: ' + newInv.error, 'error'); if (btn) { btn.innerHTML='💾 Save Invoice'; btn.disabled=false; } return; }
    allInvoices.unshift(newInv);
    showToast(`Invoice ${newInv.inv_number} created ✓`);
    closeModal();
    rerender();
  };
}
