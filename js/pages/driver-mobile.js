/**
 * Enterprise Driver Fleet Management
 * Manage driver assignments, shipment acceptance, and route progress
 */

const DriverMobileApp = {
  driverId: null,
  assignments: [],

  render: () => {
    const user = Session.get() || {};
    const isDriver = user.role === 'driver';
    const heading = isDriver ? '🚛 My Deliveries' : '🚛 Driver Operations';
    const subtitle = isDriver
      ? 'Accept shipments, optimize your route, and track your earnings.'
      : 'Manage field drivers, assign shipments, and monitor delivery progress.';

    if (isDriver) {
      // Driver-focused view: simplified, delivery-centric
      return `
        <div class="page-container">
          <div class="page-header">
            <h1>${heading}</h1>
            <p>${subtitle}</p>
            <div style="margin-top:16px;padding:12px 16px;background:#ecfdf5;border-radius:10px;border-left:4px solid #10b981;font-size:13px;color:#065f46">
              👋 Welcome, <strong>${user.name || 'Driver'}</strong>! Accept your assigned shipments below and use Smart Route for fuel savings.
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 300px;gap:20px;align-items:start">
            <div>
              <div class="card" style="margin-bottom:20px;">
                <div style="margin-bottom:16px">
                  <div style="font-size:16px;font-weight:700;margin-bottom:4px">📦 My Assigned Shipments</div>
                  <div style="font-size:12px;color:var(--text-muted)">Accept jobs and mark deliveries complete</div>
                </div>
                <div id="driverAssignmentList">Loading your assignments...</div>
              </div>
            </div>

            <div>
              <div class="card" style="margin-bottom:20px;background:linear-gradient(135deg,#dbeafe,#e0f2fe);border:1px solid #7dd3fc">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
                  <div style="font-size:24px">⚡</div>
                  <div>
                    <div style="font-size:13px;font-weight:700;color:#0369a1">Smart Route</div>
                    <div style="font-size:11px;color:#06b6d4">Optimize your deliveries</div>
                  </div>
                </div>
                <button class="btn btn-primary btn-sm" onclick="DriverMobileApp.openRouteSupport()" style="width:100%;justify-content:center">Start Smart Route</button>
              </div>

              <div class="card" style="margin-bottom:20px;">
                <div style="font-size:14px;font-weight:700;margin-bottom:12px">📊 Your Performance</div>
                <div id="driverEfficiencySummary" style="display:grid;gap:10px"></div>
              </div>

              <div class="card">
                <div style="font-size:14px;font-weight:700;margin-bottom:12px">📋 Profile</div>
                <div style="display:grid;gap:8px;font-size:12px;color:var(--text-muted)">
                  <div><strong>Name:</strong> ${user.name || 'Driver'}</div>
                  <div><strong>Truck:</strong> TRK-MH-0001</div>
                  <div><strong>On-Time Rate:</strong> 97.2%</div>
                  <div><strong>Fuel Efficiency:</strong> 18 km/l</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // Admin/Manager view: fleet management
    return `
      <div class="page-container">
        <div class="page-header">
          <h1>${heading}</h1>
          <p>${subtitle}</p>
        </div>

        <div style="display:grid;grid-template-columns:1fr 320px;gap:20px;align-items:start">
          <div>
            <div class="card" style="margin-bottom:20px;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
                <div>
                  <div style="font-size:15px;font-weight:700">Current Assignments</div>
                  <div style="font-size:12px;color:var(--text-muted);margin-top:4px">Assign shipments and track driver deliveries</div>
                </div>
                <button class="btn btn-primary btn-sm" onclick="DriverMobileApp.openAssignModal()">Assign Shipment</button>
              </div>
              <div id="driverAssignmentList">Loading assignments...</div>
            </div>

            <div class="card">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
                <div>
                  <div style="font-size:15px;font-weight:700">Fleet Route Efficiency</div>
                  <div style="font-size:12px;color:var(--text-muted);margin-top:4px">Overall fuel and time savings across your fleet</div>
                </div>
              </div>
              <div id="driverEfficiencySummary" style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px"></div>
            </div>
          </div>

          <div>
            <div class="card" style="margin-bottom:20px;">
              <h4 style="margin:0 0 12px 0;font-size:15px;font-weight:700">Fleet Status</h4>
              <div style="display:grid;gap:10px;font-size:13px;color:var(--text-muted)">
                <div><strong>Active Drivers:</strong> 3</div>
                <div><strong>Assignments Today:</strong> 5</div>
                <div><strong>On-Time Rate:</strong> 97.2%</div>
                <div><strong>Fleet Efficiency:</strong> 18 km/l</div>
              </div>
            </div>

            <div class="card">
              <h4 style="margin:0 0 12px 0;font-size:15px;font-weight:700">Quick Actions</h4>
              <div style="display:grid;gap:10px">
                <button class="btn btn-primary btn-sm" onclick="DriverMobileApp.openAssignModal()" style="justify-content:center">New Assignment</button>
                <button class="btn btn-outline btn-sm" onclick="Router.navigate('route-optimization')" style="justify-content:center">View Routes</button>
                <button class="btn btn-outline btn-sm" onclick="Router.navigate('gps-tracking')" style="justify-content:center">Live GPS</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  init() {
    const user = Session.get() || {};
    const isDriver = user.role === 'driver';
    this.driverId = isDriver ? (user.driverId || 'demo-driver') : null;
    this.loadAssignments();
  },

  loadAssignments() {
    const user = Session.get() || {};
    const isDriver = user.role === 'driver';
    const filter = isDriver ? { driverId: this.driverId } : {};
    Promise.resolve(API.getDriverAssignments(user.id, filter)).then(assignments => {
      this.assignments = assignments || [];
      this.updateAssignmentList();
      this.updateEfficiencySummary();
    });
  },

  updateAssignmentList() {
    const container = document.getElementById('driverAssignmentList');
    if (!container) return;
    if (!this.assignments.length) {
      container.innerHTML = `<div style="padding:24px;text-align:center;color:var(--text-muted)">No shipments assigned yet. Refresh after dispatch.</div>`;
      return;
    }
    container.innerHTML = this.assignments.map(a => `
      <div style="border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:12px;background:#fff;">
        <div style="display:flex;justify-content:space-between;gap:12px;align-items:start;margin-bottom:10px">
          <div>
            <div style="font-size:14px;font-weight:700;color:var(--text)">${a.client}</div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:4px">${a.route} • ${a.weight} • ${a.type}</div>
          </div>
          <div style="text-align:right;font-size:11px;color:var(--text-muted)">${new Date(a.createdAt).toLocaleString('en-IN')}</div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-bottom:14px">
          <div style="background:#f8fafc;border-radius:10px;padding:10px;text-align:center;">
            <div style="font-size:12px;color:var(--text-muted);margin-bottom:4px">ETA</div>
            <div style="font-size:15px;font-weight:700">${a.eta}</div>
          </div>
          <div style="background:#fef2f2;border-radius:10px;padding:10px;text-align:center;">
            <div style="font-size:12px;color:var(--text-muted);margin-bottom:4px">Fuel Saved</div>
            <div style="font-size:15px;font-weight:700">${a.fuelSaved}L</div>
          </div>
          <div style="background:#ecfdf5;border-radius:10px;padding:10px;text-align:center;">
            <div style="font-size:12px;color:var(--text-muted);margin-bottom:4px">Time Saved</div>
            <div style="font-size:15px;font-weight:700">${a.timeSaved}m</div>
          </div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
          <span style="padding:6px 10px;border-radius:999px;background:${a.status === 'Delivered' ? '#dcfce7' : a.status === 'Accepted' ? '#e0f2fe' : '#fef3c7'};color:${a.status === 'Delivered' ? '#166534' : '#0f172a'};font-size:12px;">${a.status}</span>
          ${a.status === 'Assigned' ? `<button class="btn btn-primary btn-sm" onclick="DriverMobileApp.acceptAssignment('${a.id}')">Accept</button>` : ''}
          ${a.status === 'Accepted' ? `<button class="btn btn-primary btn-sm" onclick="DriverMobileApp.markDelivered('${a.id}')">Mark Delivered</button>` : ''}
          <button class="btn btn-outline btn-sm" onclick="DriverMobileApp.openRouteSupport('${a.route}')">Smart Route</button>
        </div>
      </div>
    `).join('');
  },

  updateEfficiencySummary() {
    const container = document.getElementById('driverEfficiencySummary');
    if (!container) return;
    const totalFuel = this.assignments.reduce((sum, item) => sum + (item.fuelSaved || 0), 0);
    const totalTime = this.assignments.reduce((sum, item) => sum + (item.timeSaved || 0), 0);
    const delivered = this.assignments.filter(item => item.status === 'Delivered').length;
    container.innerHTML = `
      <div style="background:#f8fafc;border-radius:12px;padding:16px;text-align:center;">
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:6px">Fuel Saved</div>
        <div style="font-size:22px;font-weight:800">${totalFuel}L</div>
      </div>
      <div style="background:#ecfdf5;border-radius:12px;padding:16px;text-align:center;">
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:6px">Time Saved</div>
        <div style="font-size:22px;font-weight:800">${totalTime}m</div>
      </div>
      <div style="background:#fff7ed;border-radius:12px;padding:16px;text-align:center;">
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:6px">Delivered</div>
        <div style="font-size:22px;font-weight:800">${delivered}</div>
      </div>
    `;
  },

  acceptAssignment(id) {
    API.updateDriverAssignment(id, { status: 'Accepted' }).then(() => {
      showToast('✅ Shipment accepted! Start your smart route.', 'success');
      DriverMobileApp.loadAssignments();
    });
  },

  markDelivered(id) {
    API.updateDriverAssignment(id, { status: 'Delivered' }).then(() => {
      showToast('✅ Delivery marked complete. Great work!', 'success');
      DriverMobileApp.loadAssignments();
    });
  },

  openRouteSupport(route = '') {
    const user = Session.get() || {};
    if (user.role === 'driver') {
      showToast('🗺️ Opening Smart Route — tap to see optimal path, fuel savings, and ETA', 'info');
    }
    Router.navigate('route-optimization');
  },

  openProofOfDelivery() {
    Router.navigate('proof-of-delivery');
  },

  openAssignModal() {
    const user = Session.get() || {};
    if (user.role === 'driver') {
      showToast('Only managers can assign shipments.', 'warning');
      return;
    }
    API.getDrivers(Session.get().id).then(drivers => {
      const options = drivers.map(d => `<option value="${d.id}">${d.name} — ${d.code}</option>`).join('');
      openModal(`
        <div class="modal" style="max-width:520px;">
          <div class="modal-header">
            <div class="modal-title">Assign Shipment to Driver</div>
            <button class="modal-close" onclick="closeModal()">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Select Driver</label>
              <select class="form-input" id="assignModalDriver">${options}</select>
            </div>
            <div class="form-group">
              <label class="form-label">Client Name</label>
              <input class="form-input" id="assignModalClient" placeholder="e.g., TCS Supply Chain" />
            </div>
            <div class="form-row">
              <div class="form-group" style="flex:1">
                <label class="form-label">Route</label>
                <input class="form-input" id="assignModalRoute" placeholder="e.g., Mumbai → Delhi" />
              </div>
              <div class="form-group" style="flex:1">
                <label class="form-label">Weight</label>
                <input class="form-input" id="assignModalWeight" placeholder="e.g., 12.5 T" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group" style="flex:1">
                <label class="form-label">ETA (time)</label>
                <input class="form-input" id="assignModalEta" placeholder="e.g., 13:45" />
              </div>
              <div class="form-group" style="flex:1">
                <label class="form-label">Shipment Type</label>
                <select class="form-input" id="assignModalType"><option>FTL</option><option>LTL</option><option>Express</option></select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Special Instructions</label>
              <textarea class="form-input" id="assignModalNotes" rows="3" placeholder="Route notes, pickup instructions, etc."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
            <button class="btn btn-primary" onclick="DriverMobileApp.saveAssignmentFromModal()">Assign Now</button>
          </div>
        </div>
      `);
    });
  },

  saveAssignmentFromModal() {
    const user = Session.get() || {};
    if (user.role === 'driver') {
      showToast('Only managers can assign shipments.', 'warning');
      return;
    }
    const driverId = document.getElementById('assignModalDriver')?.value;
    const client = document.getElementById('assignModalClient')?.value.trim();
    const route = document.getElementById('assignModalRoute')?.value.trim();
    const weight = document.getElementById('assignModalWeight')?.value.trim();
    const eta = document.getElementById('assignModalEta')?.value.trim();
    const type = document.getElementById('assignModalType')?.value;
    const notes = document.getElementById('assignModalNotes')?.value.trim();
    
    API.getDrivers(user.id).then(drivers => {
      const driver = drivers.find(d => d.id === driverId);
      if (!driver || !client || !route || !weight || !eta) {
        showToast('❌ Please fill all assignment fields', 'error');
        return;
      }
      API.assignDriverOrder(user.id, {
        driverId,
        driverName: driver.name,
        client,
        type,
        route,
        weight,
        eta,
        notes,
        fuelSaved: Math.max(6, Math.round(Math.random() * 18)),
        timeSaved: Math.max(12, Math.round(Math.random() * 28))
      }).then(() => {
        closeModal();
        showToast(`✅ Shipment assigned to ${driver.name}. Smart route ready.`, 'success');
        DriverMobileApp.loadAssignments();
      });
    });
  },

  switchTab(tab) {
    const tabs = ['drivers', 'certifications', 'performance', 'assignments'];
    tabs.forEach(t => {
      const content = document.getElementById(t + 'Content');
      const tabBtn = document.getElementById(t + 'Tab');
      if (content) content.style.display = t === tab ? 'block' : 'none';
      if (tabBtn) {
        tabBtn.style.borderBottomColor = t === tab ? '#2196F3' : 'transparent';
        tabBtn.style.color = t === tab ? '#000' : '#666';
      }
    });
  }
};

// Export to global scope
if (typeof window !== 'undefined') window.DriverMobileApp = DriverMobileApp;

