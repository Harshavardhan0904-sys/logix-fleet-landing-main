// ============================================================
// Aetra — Export Engine (CSV, Excel, PDF)
// ============================================================

const Exporter = {
  // ─── CSV EXPORT ───────────────────────────────────────────
  toCSV(data, filename, columns) {
    const headers = columns.map(c => c.label).join(',');
    const rows = data.map(row =>
      columns.map(c => {
        const val = c.key.split('.').reduce((o, k) => o && o[k], row);
        const str = String(val ?? '').replace(/"/g, '""');
        return str.includes(',') || str.includes('\n') ? `"${str}"` : str;
      }).join(',')
    );
    const csv = [headers, ...rows].join('\n');
    this._download(csv, filename + '.csv', 'text/csv;charset=utf-8;');
    showToast(`✅ ${filename}.csv exported (${data.length} rows)`);
  },

  invoicesCSV(invoices) {
    this.toCSV(invoices, 'freightflow_invoices', [
      { label: 'Invoice #', key: 'inv_number' },
      { label: 'Vendor', key: 'vendor' },
      { label: 'Date', key: 'date' },
      { label: 'Due Date', key: 'due_date' },
      { label: 'Amount (₹)', key: 'amount' },
      { label: 'GST (₹)', key: 'gst' },
      { label: 'Total (₹)', key: 'total' },
      { label: 'Status', key: 'status' },
      { label: 'HSN', key: 'hsn' },
      { label: 'Route', key: 'route' },
      { label: 'Mode', key: 'mode' },
      { label: 'Reconcile', key: 'reconciled' },
      { label: 'Month', key: 'month_year' }
    ]);
  },

  vendorsCSV(vendors) {
    this.toCSV(vendors, 'vendor_scorecard', [
      { label: 'Vendor', key: 'name' },
      { label: 'City', key: 'city' },
      { label: 'Category', key: 'category' },
      { label: 'On-Time %', key: 'on_time_pct' },
      { label: 'Accuracy %', key: 'accuracy_pct' },
      { label: 'Disputes', key: 'dispute_count' },
      { label: 'Score', key: 'score' },
      { label: 'Rating', key: 'rating' },
      { label: 'Outstanding (₹)', key: 'outstanding' },
      { label: 'Total Paid (₹)', key: 'total_paid' }
    ]);
  },

  agingCSV(payments) {
    this.toCSV(payments, 'aging_report', [
      { label: 'Payment ID', key: 'id' },
      { label: 'Vendor', key: 'vendor' },
      { label: 'Amount (₹)', key: 'amount' },
      { label: 'Due Date', key: 'due_date' },
      { label: 'Aging Bucket', key: 'aging_bucket' },
      { label: 'Status', key: 'status' },
      { label: 'Mode', key: 'mode' },
      { label: 'UTR', key: 'utr' }
    ]);
  },

  gstCSV(invoices) {
    this.toCSV(invoices, 'gstr2b_reconciliation', [
      { label: 'Vendor GSTIN', key: 'vendor_gstin' },
      { label: 'Vendor Name', key: 'vendor' },
      { label: 'Invoice #', key: 'inv_number' },
      { label: 'Invoice Date', key: 'date' },
      { label: 'Invoice Amount (₹)', key: 'total' },
      { label: 'ITC Amount (₹)', key: 'gst' },
      { label: 'HSN Code', key: 'hsn' },
      { label: 'Status', key: 'reconciled' },
      { label: 'Month', key: 'month_year' }
    ]);
  },

  analyticsCSV(analytics) {
    this.toCSV(analytics, 'freight_analytics', [
      { label: 'Month', key: 'month_year' },
      { label: 'Freight Spend (₹)', key: 'freight_spend' },
      { label: 'Revenue (₹)', key: 'revenue' },
      { label: 'Invoice Count', key: 'invoice_count' },
      { label: 'Paid Count', key: 'paid_count' },
      { label: 'Overdue Count', key: 'overdue_count' },
      { label: 'ITC Eligible (₹)', key: 'itc_eligible' },
      { label: 'ITC Claimed (₹)', key: 'itc_claimed' },
      { label: 'Avg Processing Hrs', key: 'avg_processing_hrs' }
    ]);
  },

  // ─── EXCEL (HTML table trick) ─────────────────────────────
  toExcel(data, filename, columns) {
    const headers = columns.map(c => `<th style="background:#1e3a5f;color:#fff;padding:8px">${c.label}</th>`).join('');
    const rows = data.map((row, i) =>
      `<tr style="background:${i % 2 ? '#f8fafc' : '#fff'}">${
        columns.map(c => {
          const val = c.key.split('.').reduce((o, k) => o && o[k], row);
          return `<td style="padding:8px;border:1px solid #e2e8f0">${val ?? ''}</td>`;
        }).join('')
      }</tr>`
    ).join('');

    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
      <head><meta charset="UTF-8">
        <style>
          table { border-collapse: collapse; font-family: Arial; font-size: 12px; }
          th { font-weight: bold; }
        </style>
      </head>
      <body>
        <h2 style="color:#1e3a5f">Aetra — ${filename}</h2>
        <p style="color:#666">Generated: ${new Date().toLocaleDateString('en-IN')} | Company: ${Session.get()?.company || 'Aetra'}</p>
        <table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>
      </body></html>`;

    this._download(html, filename + '.xls', 'application/vnd.ms-excel');
    showToast(`✅ ${filename}.xls exported`);
  },

  // ─── PDF (Print-based) ────────────────────────────────────
  toPDF(title, sections) {
    const user = Session.get() || {};
    const html = `<!DOCTYPE html><html>
    <head>
      <meta charset="UTF-8">
      <title>Aetra Report — ${title}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 12px; color: #1e293b; }
        .header { background: #1e3a5f; color: white; padding: 24px 32px; display: flex; justify-content: space-between; align-items: center; }
        .header h1 { font-size: 22px; font-weight: 900; }
        .header p { font-size: 12px; opacity: 0.7; margin-top: 4px; }
        .header-right { text-align: right; font-size: 12px; }
        .header-right .date { font-size: 14px; font-weight: 700; color: #f97316; }
        .content { padding: 24px 32px; }
        .section { margin-bottom: 28px; }
        .section h2 { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #1e3a5f; border-bottom: 2px solid #1e3a5f; padding-bottom: 6px; margin-bottom: 14px; }
        .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
        .kpi-card { padding: 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
        .kpi-card .val { font-size: 20px; font-weight: 800; color: #1e3a5f; }
        .kpi-card .lbl { font-size: 10px; color: #64748b; margin-top: 2px; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; }
        th { background: #1e3a5f; color: white; padding: 8px; text-align: left; font-size: 10px; text-transform: uppercase; }
        td { padding: 7px 8px; border-bottom: 1px solid #f1f5f9; }
        tr:nth-child(even) td { background: #f8fafc; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 700; }
        .paid { background: #dcfce7; color: #166534; }
        .pending { background: #fef9c3; color: #854d0e; }
        .overdue { background: #fee2e2; color: #991b1b; }
        .disputed { background: #ede9fe; color: #5b21b6; }
        .footer { background: #f8fafc; padding: 16px 32px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; }
        .ai-section { background: linear-gradient(135deg, #1e3a5f, #2d5a9e); color: white; padding: 16px; border-radius: 8px; margin-bottom: 20px; }
        .ai-section h3 { font-size: 13px; font-weight: 700; margin-bottom: 8px; }
        .ai-item { display: flex; align-items: center; gap: 8px; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 11px; }
        @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1>🚛 Aetra</h1>
          <p>Freight Invoice Automation Platform</p>
          <p style="margin-top:8px;font-size:14px;font-weight:700">${title}</p>
        </div>
        <div class="header-right">
          <div class="date">${new Date().toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}</div>
          <div style="margin-top:4px">${user.company || 'Company'}</div>
          <div style="margin-top:2px">GSTIN: ${user.gstin || 'N/A'}</div>
        </div>
      </div>
      <div class="content">
        ${sections.map(s => s.html).join('')}
      </div>
      <div class="footer">
        <span>Generated by Aetra SaaS Platform • freightflow.in</span>
        <span>${user.company || ''} • ${new Date().toLocaleString('en-IN')}</span>
        <span>Confidential — Internal Use Only</span>
      </div>
    </body></html>`;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
      setTimeout(() => { win.print(); win.close(); }, 800);
      showToast('📄 PDF report opened for printing/saving');
    } else {
      showToast('⚠️ Allow popups to export PDF', 'warning');
    }
  },

  invoicesPDF(invoices, kpis) {
    const rows = invoices.slice(0, 50).map(inv =>
      `<tr>
        <td style="font-weight:600">${inv.inv_number}</td>
        <td>${inv.vendor}</td>
        <td>${inv.date}</td>
        <td>₹${Number(inv.amount).toLocaleString('en-IN')}</td>
        <td>₹${Number(inv.gst).toLocaleString('en-IN')}</td>
        <td>₹${Number(inv.total).toLocaleString('en-IN')}</td>
        <td><span class="badge ${inv.status}">${inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}</span></td>
        <td>${inv.route || ''}</td>
      </tr>`
    ).join('');

    this.toPDF('Invoice Management Report', [{
      html: `
        <div class="kpi-grid">
          <div class="kpi-card"><div class="val">${invoices.length}</div><div class="lbl">Total Invoices</div></div>
          <div class="kpi-card"><div class="val">₹${Number(invoices.reduce((s,i)=>s+i.total,0)/100000).toFixed(1)}L</div><div class="lbl">Total Value</div></div>
          <div class="kpi-card"><div class="val">${invoices.filter(i=>i.status==='paid').length}</div><div class="lbl">Paid</div></div>
          <div class="kpi-card"><div class="val">${invoices.filter(i=>i.status==='overdue').length}</div><div class="lbl">Overdue</div></div>
        </div>
        <div class="section">
          <h2>Invoice List</h2>
          <table>
            <thead><tr><th>Invoice #</th><th>Vendor</th><th>Date</th><th>Amount</th><th>GST</th><th>Total</th><th>Status</th><th>Route</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>`
    }]);
  },

  analyticsPDF(analytics, aiInsights) {
    const rows = analytics.map(a =>
      `<tr>
        <td>${a.month_year}</td>
        <td>₹${Number(a.freight_spend/100000).toFixed(1)}L</td>
        <td>₹${Number(a.revenue/100000).toFixed(1)}L</td>
        <td>${Math.round(a.freight_spend/a.revenue*100)}%</td>
        <td>${a.invoice_count}</td>
        <td>₹${Number(a.itc_eligible/100000).toFixed(1)}L</td>
      </tr>`
    ).join('');

    this.toPDF('Analytics & Business Intelligence Report', [{
      html: `
        <div class="ai-section">
          <h3>🤖 AI Insights & Recommendations</h3>
          ${(aiInsights || []).slice(0, 3).map(s =>
            `<div class="ai-item"><span>${s.icon}</span><span>${s.title} — Save ${API._fmt(s.saving)}</span></div>`
          ).join('')}
        </div>
        <div class="section">
          <h2>Monthly Freight Analytics</h2>
          <table>
            <thead><tr><th>Month</th><th>Freight Spend</th><th>Revenue</th><th>Ratio %</th><th>Invoices</th><th>ITC Eligible</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>`
    }]);
  },

  // ─── INTERNAL ─────────────────────────────────────────────
  _download(content, filename, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
};
