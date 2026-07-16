// ============================================================
// Aetra — Charts (Canvas-based, no external dependency)
// ============================================================

const FFCharts = {
  colors: ['#1e3a5f', '#f97316', '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'],

  // ─── LINE / BAR COMBO CHART ──────────────────────────────
  renderCombo(canvasId, data, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight || 260;
    ctx.clearRect(0, 0, W, H);

    const pad = { top: 20, right: 20, bottom: 50, left: 70 };
    const chartW = W - pad.left - pad.right;
    const chartH = H - pad.top - pad.bottom;
    const n = data.length;

    const maxVal = Math.max(...data.map(d => Math.max(d.bar || 0, d.line || 0))) * 1.15;
    const step = chartW / (n - 1 || 1);
    const barW = Math.min(step * 0.4, 40);

    // Grid lines
    ctx.strokeStyle = '#f1f5f9'; ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (chartH * i / 4);
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + chartW, y); ctx.stroke();
      ctx.fillStyle = '#94a3b8'; ctx.font = '11px Inter, sans-serif'; ctx.textAlign = 'right';
      const val = maxVal * (4 - i) / 4;
      ctx.fillText(FFCharts._shortNum(val), pad.left - 8, y + 4);
    }

    // Bars
    data.forEach((d, i) => {
      const x = pad.left + i * step;
      const barH = (d.bar / maxVal) * chartH;
      const y = pad.top + chartH - barH;
      const grad = ctx.createLinearGradient(0, y, 0, pad.top + chartH);
      grad.addColorStop(0, 'rgba(30,58,95,0.85)');
      grad.addColorStop(1, 'rgba(30,58,95,0.2)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(x - barW / 2, y, barW, barH, [4, 4, 0, 0]) : ctx.rect(x - barW / 2, y, barW, barH);
      ctx.fill();
    });

    // Line
    ctx.strokeStyle = '#f97316'; ctx.lineWidth = 2.5; ctx.lineJoin = 'round';
    ctx.beginPath();
    data.forEach((d, i) => {
      const x = pad.left + i * step;
      const y = pad.top + chartH - (d.line / maxVal) * chartH;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Dots on line
    data.forEach((d, i) => {
      const x = pad.left + i * step;
      const y = pad.top + chartH - (d.line / maxVal) * chartH;
      ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#f97316'; ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
    });

    // X labels
    ctx.fillStyle = '#64748b'; ctx.font = '11px Inter, sans-serif'; ctx.textAlign = 'center';
    data.forEach((d, i) => {
      const x = pad.left + i * step;
      ctx.fillText(d.label, x, H - 10);
    });

    // Legend
    FFCharts._drawLegend(ctx, W - 160, 8, [
      { color: '#1e3a5f', label: options.barLabel || 'Freight Cost' },
      { color: '#f97316', label: options.lineLabel || 'Revenue' }
    ]);

    FFCharts._addHover(canvas, data, pad, chartW, chartH, step, maxVal, n);
  },

  // ─── DONUT CHART ─────────────────────────────────────────
  renderDonut(canvasId, data, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight || 220;
    ctx.clearRect(0, 0, W, H);

    const chartSize = Math.min(W * 0.55, H - 20);
    const cx = chartSize / 2 + 10;
    const cy = H / 2;
    const outerR = chartSize / 2 - 10;
    const innerR = outerR * 0.62;
    const total = data.reduce((s, d) => s + d.value, 0);
    let angle = -Math.PI / 2;
    const colors = options.colors || FFCharts.colors;

    data.forEach((d, i) => {
      const slice = (d.value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, outerR, angle, angle + slice);
      ctx.closePath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5; ctx.stroke();
      angle += slice;
    });

    // Inner circle
    ctx.beginPath(); ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
    ctx.fillStyle = '#fff'; ctx.fill();

    // Center text
    if (options.centerText) {
      ctx.fillStyle = '#1e293b'; ctx.font = 'bold 18px Inter, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(options.centerText, cx, cy - 2);
      if (options.centerSubtext) {
        ctx.fillStyle = '#64748b'; ctx.font = '11px Inter, sans-serif';
        ctx.fillText(options.centerSubtext, cx, cy + 15);
      }
    }

    // Legend
    const legendX = chartSize + 20;
    let legendY = cy - (data.length * 22) / 2 + 10;
    data.forEach((d, i) => {
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(legendX, legendY - 8, 12, 12);
      ctx.fillStyle = '#374151'; ctx.font = '12px Inter, sans-serif'; ctx.textAlign = 'left';
      ctx.fillText(d.label || d.name, legendX + 18, legendY + 2);
      ctx.fillStyle = '#1e293b'; ctx.font = 'bold 12px Inter, sans-serif';
      ctx.fillText(d.count ? `${d.count}` : `${Math.round(d.value / total * 100)}%`, legendX + 120, legendY + 2);
      legendY += 24;
    });
  },

  // ─── BAR CHART ───────────────────────────────────────────
  renderBar(canvasId, data, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight || 220;
    ctx.clearRect(0, 0, W, H);

    const pad = { top: 20, right: 20, bottom: 50, left: 80 };
    const chartW = W - pad.left - pad.right;
    const chartH = H - pad.top - pad.bottom;
    const n = data.length;
    const maxVal = Math.max(...data.map(d => d.value)) * 1.15 || 1;
    const barW = Math.min(chartW / n * 0.55, 60);
    const step = chartW / n;

    // Grid
    ctx.strokeStyle = '#f1f5f9'; ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + chartH * i / 4;
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
      ctx.fillStyle = '#94a3b8'; ctx.font = '11px Inter, sans-serif'; ctx.textAlign = 'right';
      ctx.fillText(options.formatY ? options.formatY(maxVal * (4 - i) / 4) : FFCharts._shortNum(maxVal * (4 - i) / 4), pad.left - 8, y + 4);
    }

    const colorArr = options.colors || FFCharts.colors;
    data.forEach((d, i) => {
      const x = pad.left + i * step + (step - barW) / 2;
      const barH = Math.max((d.value / maxVal) * chartH, 2);
      const y = pad.top + chartH - barH;
      const grad = ctx.createLinearGradient(0, y, 0, pad.top + chartH);
      const c = colorArr[i % colorArr.length];
      grad.addColorStop(0, c);
      grad.addColorStop(1, c + '55');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(x, y, barW, barH, [4, 4, 0, 0]) : ctx.rect(x, y, barW, barH);
      ctx.fill();

      // Value label
      ctx.fillStyle = '#374151'; ctx.font = 'bold 11px Inter, sans-serif'; ctx.textAlign = 'center';
      const label = options.formatY ? options.formatY(d.value) : FFCharts._shortNum(d.value);
      ctx.fillText(label, x + barW / 2, y - 6);

      // X label
      ctx.fillStyle = '#64748b'; ctx.font = '11px Inter, sans-serif';
      ctx.fillText(d.label, x + barW / 2, H - 10);
    });
  },

  // ─── HORIZONTAL BAR ──────────────────────────────────────
  renderHBar(canvasId, data, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight || Math.max(data.length * 48 + 20, 200);
    canvas.height = H;
    ctx.clearRect(0, 0, W, H);

    const pad = { top: 10, right: 80, bottom: 10, left: 130 };
    const chartW = W - pad.left - pad.right;
    const barH = Math.min(24, (H - pad.top - pad.bottom) / data.length - 10);
    const maxVal = Math.max(...data.map(d => d.value)) * 1.1 || 1;
    const colors = options.colors || FFCharts.colors;

    data.forEach((d, i) => {
      const y = pad.top + i * ((H - pad.top - pad.bottom) / data.length) + 6;
      const w = (d.value / maxVal) * chartW;
      const c = colors[i % colors.length];

      // Label
      ctx.fillStyle = '#374151'; ctx.font = '12px Inter, sans-serif'; ctx.textAlign = 'right';
      ctx.fillText(d.label, pad.left - 8, y + barH / 2 + 4);

      // Bar bg
      ctx.fillStyle = '#f1f5f9';
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(pad.left, y, chartW, barH, 4) : ctx.rect(pad.left, y, chartW, barH);
      ctx.fill();

      // Bar fill
      const grad = ctx.createLinearGradient(pad.left, 0, pad.left + w, 0);
      grad.addColorStop(0, c); grad.addColorStop(1, c + 'bb');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(pad.left, y, Math.max(w, 4), barH, 4) : ctx.rect(pad.left, y, Math.max(w, 4), barH);
      ctx.fill();

      // Value
      ctx.fillStyle = '#374151'; ctx.font = 'bold 11px Inter, sans-serif'; ctx.textAlign = 'left';
      const val = options.formatVal ? options.formatVal(d.value) : FFCharts._shortNum(d.value);
      ctx.fillText(val, pad.left + w + 8, y + barH / 2 + 4);
    });
  },

  // ─── SPARKLINE ───────────────────────────────────────────
  renderSparkline(canvasId, values, color = '#10b981') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth || 80;
    const H = canvas.height = canvas.offsetHeight || 28;
    ctx.clearRect(0, 0, W, H);

    if (!values || values.length < 2) return;
    const min = Math.min(...values) * 0.95;
    const max = Math.max(...values) * 1.05;
    const range = max - min || 1;
    const step = W / (values.length - 1);

    ctx.strokeStyle = color; ctx.lineWidth = 1.8; ctx.lineJoin = 'round';
    ctx.beginPath();
    values.forEach((v, i) => {
      const x = i * step;
      const y = H - ((v - min) / range) * (H - 4) - 2;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
  },

  // ─── GAUGE / METER ────────────────────────────────────────
  renderGauge(canvasId, value, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth || 200;
    const H = canvas.height = 120;
    ctx.clearRect(0, 0, W, H);

    const cx = W / 2; const cy = H - 10;
    const r = Math.min(cx, cy) - 20;
    const startAngle = Math.PI; const endAngle = 0;
    const pct = Math.min(value / 100, 1);

    // BG arc
    ctx.beginPath(); ctx.arc(cx, cy, r, startAngle, endAngle, false);
    ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.stroke();

    // Value arc
    const color = value >= 80 ? '#10b981' : value >= 60 ? '#f59e0b' : '#ef4444';
    const angle = startAngle + pct * Math.PI;
    ctx.beginPath(); ctx.arc(cx, cy, r, startAngle, angle, false);
    ctx.strokeStyle = color; ctx.lineWidth = 14; ctx.stroke();

    // Center text
    ctx.fillStyle = '#1e293b'; ctx.font = 'bold 28px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(value + '%', cx, cy - 8);
    ctx.fillStyle = '#64748b'; ctx.font = '12px Inter, sans-serif';
    ctx.fillText(options.label || 'Score', cx, cy + 10);
  },

  // ─── LINE CHART ──────────────────────────────────────────
  renderLine(canvasId, datasets, labels, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight || 220;
    ctx.clearRect(0, 0, W, H);

    const pad = { top: 20, right: 20, bottom: 50, left: 70 };
    const chartW = W - pad.left - pad.right;
    const chartH = H - pad.top - pad.bottom;
    const n = labels.length;

    const allVals = datasets.flatMap(ds => ds.data);
    const maxVal = Math.max(...allVals) * 1.15 || 1;
    const step = chartW / (n - 1 || 1);

    // Grid
    ctx.strokeStyle = '#f1f5f9'; ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + chartH * i / 4;
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
      ctx.fillStyle = '#94a3b8'; ctx.font = '11px Inter, sans-serif'; ctx.textAlign = 'right';
      ctx.fillText(FFCharts._shortNum(maxVal * (4 - i) / 4), pad.left - 8, y + 4);
    }

    // X labels
    ctx.fillStyle = '#64748b'; ctx.font = '11px Inter, sans-serif'; ctx.textAlign = 'center';
    labels.forEach((l, i) => ctx.fillText(l, pad.left + i * step, H - 10));

    datasets.forEach((ds, di) => {
      const color = ds.color || FFCharts.colors[di];
      ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.lineJoin = 'round';

      // Fill
      ctx.beginPath();
      ds.data.forEach((v, i) => {
        const x = pad.left + i * step;
        const y = pad.top + chartH - (v / maxVal) * chartH;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Dots
      ds.data.forEach((v, i) => {
        const x = pad.left + i * step;
        const y = pad.top + chartH - (v / maxVal) * chartH;
        ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = color; ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
      });
    });

    // Legend
    if (datasets.length > 1) {
      datasets.forEach((ds, i) => {
        FFCharts._drawLegend(ctx, W - (datasets.length - i) * 110, 6, [
          { color: ds.color || FFCharts.colors[i], label: ds.label }
        ]);
      });
    }
  },

  _shortNum(n) {
    if (n >= 10000000) return '₹' + (n / 10000000).toFixed(1) + 'Cr';
    if (n >= 100000) return '₹' + (n / 100000).toFixed(1) + 'L';
    if (n >= 1000) return '₹' + (n / 1000).toFixed(0) + 'K';
    return n % 1 === 0 ? n.toString() : n.toFixed(1);
  },

  _drawLegend(ctx, x, y, items) {
    items.forEach((item, i) => {
      ctx.fillStyle = item.color;
      ctx.fillRect(x + i * 110, y, 10, 10);
      ctx.fillStyle = '#64748b'; ctx.font = '11px Inter, sans-serif'; ctx.textAlign = 'left';
      ctx.fillText(item.label, x + i * 110 + 14, y + 9);
    });
  },

  _addHover(canvas, data, pad, chartW, chartH, step, maxVal, n) {
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const idx = Math.round((mx - pad.left) / step);
      if (idx < 0 || idx >= n) return;
      const d = data[idx];
      canvas.title = `${d.label}: Freight ${FFCharts._shortNum(d.bar)}, Revenue ${FFCharts._shortNum(d.line)}`;
    });
  }
};

// Make canvas responsive
window.addEventListener('resize', () => {
  document.querySelectorAll('canvas[data-chart]').forEach(c => {
    const fn = c.getAttribute('data-chart');
    if (window[fn]) window[fn]();
  });
});
