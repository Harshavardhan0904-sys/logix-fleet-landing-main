// ============================================================
// Aetra — Shared Components & Global Registries
// ============================================================

// ── Pages Registry (must be declared before page files load) ─
const Pages = {};

const Components = {
  kpiCard(icon, label, value, trend, trendDir, color, iconBg) {
    return `
    <div class="kpi-card kpi-${color}">
      <div class="kpi-header">
        <div class="kpi-icon" style="background:${iconBg}">${icon}</div>
        <span class="kpi-trend ${trendDir}">${trendDir === 'up' ? '↑' : '↓'} ${trend}</span>
      </div>
      <div class="kpi-value">${value}</div>
      <div class="kpi-label">${label}</div>
    </div>`;
  },

  activityFeed(activities) {
    return activities.map(a => `
    <div class="activity-item">
      <div class="activity-dot" style="background:${a.color}"></div>
      <div class="activity-content">
        <div class="activity-text">${a.text}</div>
        <div class="activity-time">${a.time}</div>
      </div>
    </div>`).join('');
  },

  vendorScoreCell(score) {
    const cls = getScoreClass(score);
    return `<div class="vendor-score ${cls}">${score}</div>`;
  },

  progressBar(pct, color) {
    return `<div class="progress-bar"><div class="progress-fill ${color}" style="width:${pct}%"></div></div>`;
  },

  sparkCanvas(id, values, color) {
    return `<canvas id="${id}" style="width:80px;height:28px;display:block"></canvas>`;
  }
};
