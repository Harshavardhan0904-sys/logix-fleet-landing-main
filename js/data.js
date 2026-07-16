// ============================================================
// Aetra — Mock Data (Realistic Indian Logistics Data)
// ============================================================

const FF_DATA = {
  user: {
    name: "Rajesh Kumar",
    company: "Mahindra Logistics Pvt Ltd",
    email: "rajesh@mahindralogistics.in",
    gst: "27AABCM1234F1ZX",
    pan: "AABCM1234F",
    phone: "+91 98765 43210",
    role: "Finance Manager",
    plan: "Growth",
    avatar: "RK"
  },

  vendors: [
    { id: "V001", name: "Delhivery Ltd", gstin: "07AABCD1234E1ZK", category: "Courier", city: "Gurugram", onTime: 92, accuracy: 96, disputes: 2, score: 94, rating: "A", invoices: 48, totalPaid: 18650000, outstanding: 450000, trend: [88,90,91,93,92,94,93,94] },
    { id: "V002", name: "BlueDart Express", gstin: "33AABCE5678F1ZM", category: "Air Courier", city: "Chennai", onTime: 97, accuracy: 98, disputes: 1, score: 97, rating: "A+", invoices: 32, totalPaid: 22300000, outstanding: 320000, trend: [94,95,96,97,97,97,96,97] },
    { id: "V003", name: "DTDC Ltd", gstin: "29AABCF9012G1ZP", category: "Surface Courier", city: "Bangalore", onTime: 78, accuracy: 82, disputes: 8, score: 74, rating: "C", invoices: 64, totalPaid: 9850000, outstanding: 780000, trend: [80,79,77,78,76,75,74,74] },
    { id: "V004", name: "Gati Logistics", gstin: "36AABCG3456H1ZQ", category: "Road Freight", city: "Hyderabad", onTime: 85, accuracy: 88, disputes: 4, score: 85, rating: "B", invoices: 52, totalPaid: 14500000, outstanding: 620000, trend: [82,83,85,84,85,86,85,85] },
    { id: "V005", name: "VRL Logistics", gstin: "29AABCH7890I1ZR", category: "Road Freight", city: "Hubli", onTime: 89, accuracy: 91, disputes: 3, score: 89, rating: "B+", invoices: 38, totalPaid: 11200000, outstanding: 290000, trend: [86,87,88,89,89,90,89,89] },
    { id: "V006", name: "TCI Express", gstin: "06AABCI2345J1ZS", category: "Express Freight", city: "Gurugram", onTime: 94, accuracy: 95, disputes: 2, score: 93, rating: "A", invoices: 41, totalPaid: 16800000, outstanding: 510000, trend: [90,91,92,93,94,93,93,93] },
    { id: "V007", name: "XpressBees", gstin: "27AABCJ6789K1ZT", category: "E-commerce Courier", city: "Pune", onTime: 81, accuracy: 84, disputes: 6, score: 79, rating: "C+", invoices: 29, totalPaid: 7650000, outstanding: 380000, trend: [79,80,78,80,81,79,80,79] },
    { id: "V008", name: "Ecom Express", gstin: "07AABCK1234L1ZU", category: "E-commerce", city: "Delhi", onTime: 76, accuracy: 79, disputes: 9, score: 71, rating: "D", invoices: 22, totalPaid: 5420000, outstanding: 640000, trend: [75,74,73,72,71,72,71,71] }
  ],

  invoices: [
    { id: "INV-2024-0847", vendor: "Delhivery Ltd", vendorId: "V001", date: "2024-03-01", dueDate: "2024-03-31", amount: 285000, gst: 51300, total: 336300, status: "paid", hsn: "9965", route: "Mumbai → Delhi", weight: "2.4 MT", mode: "Road", reconciled: "matched" },
    { id: "INV-2024-0848", vendor: "BlueDart Express", vendorId: "V002", date: "2024-03-02", dueDate: "2024-04-01", amount: 125000, gst: 22500, total: 147500, status: "pending", hsn: "9967", route: "Chennai → Bangalore", weight: "320 KG", mode: "Air", reconciled: "matched" },
    { id: "INV-2024-0849", vendor: "DTDC Ltd", vendorId: "V003", date: "2024-03-03", dueDate: "2024-03-18", amount: 48500, gst: 8730, total: 57230, status: "overdue", hsn: "9965", route: "Hyderabad → Pune", weight: "850 KG", mode: "Road", reconciled: "mismatched" },
    { id: "INV-2024-0850", vendor: "Gati Logistics", vendorId: "V004", date: "2024-03-05", dueDate: "2024-04-04", amount: 192000, gst: 34560, total: 226560, status: "pending", hsn: "9965", route: "Delhi → Kolkata", weight: "1.8 MT", mode: "Road", reconciled: "pending" },
    { id: "INV-2024-0851", vendor: "VRL Logistics", vendorId: "V005", date: "2024-03-06", dueDate: "2024-04-05", amount: 76000, gst: 13680, total: 89680, status: "pending", hsn: "9967", route: "Bangalore → Chennai", weight: "540 KG", mode: "Surface", reconciled: "matched" },
    { id: "INV-2024-0852", vendor: "TCI Express", vendorId: "V006", date: "2024-03-07", dueDate: "2024-03-22", amount: 340000, gst: 61200, total: 401200, status: "overdue", hsn: "9965", route: "Mumbai → Bangalore", weight: "3.2 MT", mode: "Express", reconciled: "mismatched" },
    { id: "INV-2024-0853", vendor: "Delhivery Ltd", vendorId: "V001", date: "2024-03-08", dueDate: "2024-04-07", amount: 95000, gst: 17100, total: 112100, status: "paid", hsn: "9965", route: "Kolkata → Mumbai", weight: "760 KG", mode: "Road", reconciled: "matched" },
    { id: "INV-2024-0854", vendor: "XpressBees", vendorId: "V007", date: "2024-03-09", dueDate: "2024-03-24", amount: 28000, gst: 5040, total: 33040, status: "disputed", hsn: "9968", route: "Pune → Hyderabad", weight: "210 KG", mode: "Road", reconciled: "missing" },
    { id: "INV-2024-0855", vendor: "BlueDart Express", vendorId: "V002", date: "2024-03-10", dueDate: "2024-04-09", amount: 185000, gst: 33300, total: 218300, status: "paid", hsn: "9967", route: "Delhi → Chennai", weight: "1.1 MT", mode: "Air", reconciled: "matched" },
    { id: "INV-2024-0856", vendor: "Gati Logistics", vendorId: "V004", date: "2024-03-11", dueDate: "2024-04-10", amount: 67000, gst: 12060, total: 79060, status: "pending", hsn: "9965", route: "Mumbai → Hyderabad", weight: "480 KG", mode: "Road", reconciled: "pending" },
    { id: "INV-2024-0857", vendor: "VRL Logistics", vendorId: "V005", date: "2024-03-12", dueDate: "2024-04-11", amount: 142000, gst: 25560, total: 167560, status: "paid", hsn: "9967", route: "Hyderabad → Kolkata", weight: "980 KG", mode: "Surface", reconciled: "matched" },
    { id: "INV-2024-0858", vendor: "Ecom Express", vendorId: "V008", date: "2024-03-13", dueDate: "2024-03-13", amount: 35000, gst: 6300, total: 41300, status: "overdue", hsn: "9968", route: "Delhi → Jaipur", weight: "180 KG", mode: "Road", reconciled: "mismatched" },
    { id: "INV-2024-0859", vendor: "DTDC Ltd", vendorId: "V003", date: "2024-03-14", dueDate: "2024-03-29", amount: 88000, gst: 15840, total: 103840, status: "overdue", hsn: "9965", route: "Chennai → Coimbatore", weight: "720 KG", mode: "Road", reconciled: "missing" },
    { id: "INV-2024-0860", vendor: "TCI Express", vendorId: "V006", date: "2024-03-15", dueDate: "2024-04-14", amount: 450000, gst: 81000, total: 531000, status: "pending", hsn: "9965", route: "Mumbai → Ahmedabad", weight: "4.5 MT", mode: "Express", reconciled: "matched" },
    { id: "INV-2024-0861", vendor: "Delhivery Ltd", vendorId: "V001", date: "2024-03-16", dueDate: "2024-04-15", amount: 78000, gst: 14040, total: 92040, status: "pending", hsn: "9967", route: "Bangalore → Mumbai", weight: "580 KG", mode: "Road", reconciled: "pending" },
    { id: "INV-2024-0862", vendor: "BlueDart Express", vendorId: "V002", date: "2024-03-17", dueDate: "2024-04-16", amount: 265000, gst: 47700, total: 312700, status: "paid", hsn: "9967", route: "Hyderabad → Delhi", weight: "1.6 MT", mode: "Air", reconciled: "matched" },
    { id: "INV-2024-0863", vendor: "XpressBees", vendorId: "V007", date: "2024-03-18", dueDate: "2024-03-03", amount: 42000, gst: 7560, total: 49560, status: "disputed", hsn: "9968", route: "Kolkata → Bhubaneswar", weight: "290 KG", mode: "Road", reconciled: "missing" },
    { id: "INV-2024-0864", vendor: "Gati Logistics", vendorId: "V004", date: "2024-03-19", dueDate: "2024-04-18", amount: 156000, gst: 28080, total: 184080, status: "pending", hsn: "9965", route: "Delhi → Amritsar", weight: "1.2 MT", mode: "Road", reconciled: "matched" },
    { id: "INV-2024-0865", vendor: "VRL Logistics", vendorId: "V005", date: "2024-03-20", dueDate: "2024-04-19", amount: 98000, gst: 17640, total: 115640, status: "paid", hsn: "9967", route: "Mumbai → Surat", weight: "820 KG", mode: "Surface", reconciled: "matched" },
    { id: "INV-2024-0866", vendor: "Ecom Express", vendorId: "V008", date: "2024-03-21", dueDate: "2024-02-20", amount: 62000, gst: 11160, total: 73160, status: "overdue", hsn: "9968", route: "Bangalore → Mysore", weight: "390 KG", mode: "Road", reconciled: "mismatched" }
  ],

  monthlySpend: [
    { month: "Oct '23", freight: 2450000, revenue: 8200000 },
    { month: "Nov '23", freight: 2680000, revenue: 9100000 },
    { month: "Dec '23", freight: 3150000, revenue: 11200000 },
    { month: "Jan '24", freight: 2890000, revenue: 9800000 },
    { month: "Feb '24", freight: 2720000, revenue: 9400000 },
    { month: "Mar '24", freight: 3240000, revenue: 11800000 }
  ],

  agingData: [
    { bucket: "Current", amount: 4850000, count: 12, color: "#10b981" },
    { bucket: "1-30 Days", amount: 2340000, count: 8, color: "#f59e0b" },
    { bucket: "31-60 Days", amount: 1280000, count: 5, color: "#f97316" },
    { bucket: "61-90 Days", amount: 680000, count: 3, color: "#ef4444" },
    { bucket: "90+ Days", amount: 320000, count: 2, color: "#991b1b" }
  ],

  gstData: {
    score: 87,
    summary: {
      eligible: 5840000,
      blocked: 720000,
      pending: 1120000
    },
    items: [
      { gstin: "07AABCD1234E1ZK", vendor: "Delhivery Ltd", invoiceAmt: 336300, itc: 51300, status: "matched", hsn: "9965" },
      { gstin: "33AABCE5678F1ZM", vendor: "BlueDart Express", invoiceAmt: 218300, itc: 33300, status: "matched", hsn: "9967" },
      { gstin: "29AABCF9012G1ZP", vendor: "DTDC Ltd", invoiceAmt: 57230, itc: 8730, status: "mismatched", hsn: "9965" },
      { gstin: "36AABCG3456H1ZQ", vendor: "Gati Logistics", invoiceAmt: 226560, itc: 34560, status: "pending", hsn: "9965" },
      { gstin: "29AABCH7890I1ZR", vendor: "VRL Logistics", invoiceAmt: 89680, itc: 13680, status: "matched", hsn: "9967" },
      { gstin: "06AABCI2345J1ZS", vendor: "TCI Express", invoiceAmt: 401200, itc: 61200, status: "mismatched", hsn: "9965" },
      { gstin: "27AABCJ6789K1ZT", vendor: "XpressBees", invoiceAmt: 33040, itc: 5040, status: "missing", hsn: "9968" },
      { gstin: "07AABCK1234L1ZU", vendor: "Ecom Express", invoiceAmt: 41300, itc: 6300, status: "missing", hsn: "9968" }
    ]
  },

  activities: [
    { type: "invoice", text: "Invoice INV-2024-0860 submitted by TCI Express (₹5.31L)", time: "2 minutes ago", color: "#3b82f6" },
    { type: "payment", text: "Payment of ₹2.18L processed for BlueDart Express", time: "18 minutes ago", color: "#10b981" },
    { type: "gst", text: "GST reconciliation completed — 3 mismatches found", time: "1 hour ago", color: "#f97316" },
    { type: "vendor", text: "Vendor scorecard updated — DTDC score dropped to 74", time: "2 hours ago", color: "#ef4444" },
    { type: "invoice", text: "Bulk approval: 5 invoices approved (₹12.4L)", time: "3 hours ago", color: "#8b5cf6" },
    { type: "report", text: "Monthly freight report for February exported", time: "4 hours ago", color: "#6366f1" },
    { type: "alert", text: "2 invoices approaching due date — action required", time: "5 hours ago", color: "#f59e0b" },
    { type: "payment", text: "₹3.36L payment received from reconciliation — Delhivery", time: "Yesterday", color: "#10b981" }
  ],

  payments: [
    { id: "PAY-0234", vendor: "Delhivery Ltd", invoiceId: "INV-2024-0847", amount: 336300, dueDate: "2024-03-31", status: "scheduled", mode: "NEFT", utr: "HDFC2024033100456" },
    { id: "PAY-0235", vendor: "BlueDart Express", invoiceId: "INV-2024-0855", amount: 218300, dueDate: "2024-04-09", status: "processed", mode: "RTGS", utr: "ICICI2024030900789" },
    { id: "PAY-0236", vendor: "DTDC Ltd", invoiceId: "INV-2024-0849", amount: 57230, dueDate: "2024-03-18", status: "overdue", mode: "NEFT", utr: null },
    { id: "PAY-0237", vendor: "TCI Express", invoiceId: "INV-2024-0852", amount: 401200, dueDate: "2024-03-22", status: "overdue", mode: "RTGS", utr: null },
    { id: "PAY-0238", vendor: "Gati Logistics", invoiceId: "INV-2024-0850", amount: 226560, dueDate: "2024-04-04", status: "pending", mode: "NEFT", utr: null },
    { id: "PAY-0239", vendor: "VRL Logistics", invoiceId: "INV-2024-0851", amount: 89680, dueDate: "2024-04-05", status: "pending", mode: "Cheque", utr: null }
  ],

  vendorSpend: [
    { name: "Delhivery", value: 31 },
    { name: "BlueDart", value: 24 },
    { name: "TCI Express", value: 19 },
    { name: "Gati", value: 14 },
    { name: "Others", value: 12 }
  ],

  delayAnalysis: [
    { route: "Mumbai→Delhi", avgDelay: 0.8, frequency: 48 },
    { route: "Chennai→Bangalore", avgDelay: 1.2, frequency: 32 },
    { route: "Delhi→Kolkata", avgDelay: 2.1, frequency: 28 },
    { route: "Hyderabad→Pune", avgDelay: 1.8, frequency: 24 },
    { route: "Bangalore→Mumbai", avgDelay: 1.5, frequency: 36 }
  ]
};

// Helpers
function formatCurrency(val) {
  if (val >= 10000000) return '₹' + (val / 10000000).toFixed(2) + ' Cr';
  if (val >= 100000) return '₹' + (val / 100000).toFixed(1) + 'L';
  if (val >= 1000) return '₹' + (val / 1000).toFixed(0) + 'K';
  return '₹' + val.toLocaleString('en-IN');
}

function formatCurrencyFull(val) {
  return '₹' + val.toLocaleString('en-IN');
}

function getStatusBadge(status) {
  const map = {
    paid: '<span class="badge badge-success">✓ Paid</span>',
    pending: '<span class="badge badge-warning">⏳ Pending</span>',
    overdue: '<span class="badge badge-danger">⚠ Overdue</span>',
    disputed: '<span class="badge badge-purple">⚡ Disputed</span>',
    scheduled: '<span class="badge badge-info">📅 Scheduled</span>',
    processed: '<span class="badge badge-success">✓ Processed</span>'
  };
  return map[status] || `<span class="badge badge-gray">${status}</span>`;
}

function getReconcileBadge(status) {
  const map = {
    matched: '<span class="badge badge-success">✓ Matched</span>',
    mismatched: '<span class="badge badge-danger">✗ Mismatch</span>',
    missing: '<span class="badge badge-warning">! Missing</span>',
    pending: '<span class="badge badge-gray">⏳ Pending</span>'
  };
  return map[status] || `<span class="badge badge-gray">${status}</span>`;
}

function getScoreClass(score) {
  if (score >= 90) return 'score-green';
  if (score >= 70) return 'score-yellow';
  return 'score-red';
}

function getScoreRating(score) {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 80) return 'B+';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  return 'D';
}

function showToast(msg, type = 'success') {
  const iconMap = { success: '✓', error: '✗', warning: '⚠', info: 'ℹ' };
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.innerHTML = `<span style="font-size:16px">${iconMap[type]}</span><span class="toast-message">${msg}</span>`;
  container.appendChild(t);
  setTimeout(() => { if (t.parentNode) t.parentNode.removeChild(t); }, 3500);
}

function closeModal() {
  const m = document.querySelector('.modal-overlay');
  if (m) m.remove();
}

function openModal(html) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = html;
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
  document.body.appendChild(overlay);
}
