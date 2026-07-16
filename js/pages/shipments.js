// ============================================================
// Aetra — Enterprise Shipments Management
// Multi-Modal Transport: Road, Rail, Air, Sea
// ============================================================

Pages.shipments = async function(container) {
  const user = Session.get();
  if (!user) return Router.navigate('login');

  container.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:400px;flex-direction:column;gap:16px">
    <div style="width:44px;height:44px;border:4px solid #e2e8f0;border-top-color:var(--primary);border-radius:50%;animation:spin .8s linear infinite"></div>
    <div style="font-size:14px;color:var(--text-muted)">Loading enterprise shipments...</div>
  </div>`;

  try {
    // Fetch shipments data
    const response = await fetch('/api/shipments', {
      headers: { 'Authorization': `Bearer ${Session.getToken()}` }
    });
    const shipments = await response.json();

    container.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px">
      <div>
        <h1 style="font-size:28px;font-weight:800;margin:0">🚛 Enterprise Shipments</h1>
        <p style="color:var(--text-muted);margin:4px 0 0">Multi-modal transport management across road, rail, air & sea</p>
      </div>
      <button class="btn btn-primary" onclick="openNewShipmentModal()">
        <span style="margin-right:8px">+</span> New Shipment
      </button>
    </div>

    <!-- SHIPMENT STATS -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:24px">
      <div class="card" style="text-align:center;padding:20px">
        <div style="font-size:32px;margin-bottom:8px">📦</div>
        <div style="font-size:24px;font-weight:800;color:#10b981">${shipments.data?.length || 0}</div>
        <div style="font-size:12px;color:var(--text-muted)">Total Shipments</div>
      </div>
      <div class="card" style="text-align:center;padding:20px">
        <div style="font-size:32px;margin-bottom:8px">🚚</div>
        <div style="font-size:24px;font-weight:800;color:#3b82f6">${shipments.data?.filter(s => s.transport_mode === 'road').length || 0}</div>
        <div style="font-size:12px;color:var(--text-muted)">Road Transport</div>
      </div>
      <div class="card" style="text-align:center;padding:20px">
        <div style="font-size:32px;margin-bottom:8px">🚄</div>
        <div style="font-size:24px;font-weight:800;color:#f59e0b">${shipments.data?.filter(s => s.transport_mode === 'rail').length || 0}</div>
        <div style="font-size:12px;color:var(--text-muted)">Rail Transport</div>
      </div>
      <div class="card" style="text-align:center;padding:20px">
        <div style="font-size:32px;margin-bottom:8px">✈️</div>
        <div style="font-size:24px;font-weight:800;color:#ef4444">${shipments.data?.filter(s => s.transport_mode === 'air').length || 0}</div>
        <div style="font-size:12px;color:var(--text-muted)">Air Transport</div>
      </div>
    </div>

    <!-- SHIPMENTS TABLE -->
    <div class="card">
      <div style="padding:20px;border-bottom:1px solid var(--border)">
        <h3 style="margin:0;font-size:18px;font-weight:700">Recent Shipments</h3>
      </div>
      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr style="background:#f8fafc;border-bottom:1px solid var(--border)">
              <th style="padding:12px;text-align:left;font-weight:600;font-size:12px;color:var(--text-muted)">SHIPMENT ID</th>
              <th style="padding:12px;text-align:left;font-weight:600;font-size:12px;color:var(--text-muted)">ROUTE</th>
              <th style="padding:12px;text-align:left;font-weight:600;font-size:12px;color:var(--text-muted)">MODE</th>
              <th style="padding:12px;text-align:left;font-weight:600;font-size:12px;color:var(--text-muted)">STATUS</th>
              <th style="padding:12px;text-align:left;font-weight:600;font-size:12px;color:var(--text-muted)">TRACKING</th>
              <th style="padding:12px;text-align:left;font-weight:600;font-size:12px;color:var(--text-muted)">VALUE</th>
              <th style="padding:12px;text-align:left;font-weight:600;font-size:12px;color:var(--text-muted)">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            ${shipments.data?.slice(0, 10).map(shipment => `
              <tr style="border-bottom:1px solid var(--border-light)">
                <td style="padding:12px;font-weight:600">${shipment.id}</td>
                <td style="padding:12px">${shipment.origin} → ${shipment.destination}</td>
                <td style="padding:12px">
                  <span style="background:${shipment.transport_mode === 'road' ? '#dbeafe' : shipment.transport_mode === 'rail' ? '#fef3c7' : shipment.transport_mode === 'air' ? '#fee2e2' : '#f3e8ff'};color:${shipment.transport_mode === 'road' ? '#1e40af' : shipment.transport_mode === 'rail' ? '#b45309' : shipment.transport_mode === 'air' ? '#dc2626' : '#7c3aed'};padding:4px 8px;border-radius:6px;font-size:11px;font-weight:600">
                    ${shipment.transport_mode?.toUpperCase()}
                  </span>
                </td>
                <td style="padding:12px">
                  <span style="background:${shipment.status === 'delivered' ? '#dcfce7' : shipment.status === 'in_transit' ? '#dbeafe' : shipment.status === 'booked' ? '#fef3c7' : '#fee2e2'};color:${shipment.status === 'delivered' ? '#166534' : shipment.status === 'in_transit' ? '#1e40af' : shipment.status === 'booked' ? '#b45309' : '#dc2626'};padding:4px 8px;border-radius:6px;font-size:11px;font-weight:600">
                    ${shipment.status?.replace('_', ' ').toUpperCase()}
                  </span>
                </td>
                <td style="padding:12px;font-family:monospace;font-size:12px">${shipment.tracking_number}</td>
                <td style="padding:12px;font-weight:600">₹${shipment.pricing?.grand_total?.toLocaleString() || 'N/A'}</td>
                <td style="padding:12px">
                  <button class="btn btn-sm" onclick="viewShipment('${shipment.id}')">👁️ View</button>
                </td>
              </tr>
            `).join('') || '<tr><td colspan="7" style="padding:40px;text-align:center;color:var(--text-muted)">No shipments found. Create your first shipment!</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
    `;
  } catch (error) {
    console.error('Error loading shipments:', error);
    container.innerHTML = `
    <div style="text-align:center;padding:60px">
      <div style="font-size:48px;margin-bottom:16px">🚛</div>
      <h2 style="margin:0 0 8px">Enterprise Shipments</h2>
      <p style="color:var(--text-muted);margin-bottom:24px">Multi-modal transport management system</p>
      <button class="btn btn-primary" onclick="openNewShipmentModal()">Create First Shipment</button>
    </div>
    `;
  }
};

function openNewShipmentModal() {
  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:1000';
  modal.innerHTML = `
  <div style="background:#fff;border-radius:12px;padding:24px;width:90%;max-width:600px;max-height:90vh;overflow-y:auto">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
      <h3 style="margin:0;font-size:20px">🚛 Create New Shipment</h3>
      <button onclick="this.closest('div').parentElement.remove()" style="background:none;border:none;font-size:24px;cursor:pointer">&times;</button>
    </div>
    <form onsubmit="createShipment(event)">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
        <div>
          <label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px">Origin</label>
          <input name="origin" required style="width:100%;padding:8px;border:1px solid var(--border);border-radius:6px">
        </div>
        <div>
          <label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px">Destination</label>
          <input name="destination" required style="width:100%;padding:8px;border:1px solid var(--border);border-radius:6px">
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:16px">
        <div>
          <label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px">Transport Mode</label>
          <select name="transport_mode" required style="width:100%;padding:8px;border:1px solid var(--border);border-radius:6px">
            <option value="road">🚛 Road</option>
            <option value="rail">🚄 Rail</option>
            <option value="air">✈️ Air</option>
            <option value="sea">🚢 Sea</option>
          </select>
        </div>
        <div>
          <label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px">Priority</label>
          <select name="priority" required style="width:100%;padding:8px;border:1px solid var(--border);border-radius:6px">
            <option value="standard">📦 Standard</option>
            <option value="express">⚡ Express</option>
            <option value="premium">💎 Premium</option>
          </select>
        </div>
        <div>
          <label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px">Weight (kg)</label>
          <input name="weight" type="number" required style="width:100%;padding:8px;border:1px solid var(--border);border-radius:6px">
        </div>
      </div>
      <div style="margin-bottom:16px">
        <label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px">Cargo Type</label>
        <input name="cargo_type" required style="width:100%;padding:8px;border:1px solid var(--border);border-radius:6px">
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
        <div>
          <label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px">Value (₹)</label>
          <input name="value" type="number" required style="width:100%;padding:8px;border:1px solid var(--border);border-radius:6px">
        </div>
        <div>
          <label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px">Insurance Required</label>
          <select name="insurance_required" style="width:100%;padding:8px;border:1px solid var(--border);border-radius:6px">
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </div>
      </div>
      <div style="display:flex;gap:12px;justify-content:end">
        <button type="button" onclick="this.closest('div').parentElement.remove()" class="btn btn-secondary">Cancel</button>
        <button type="submit" class="btn btn-primary">🚛 Create Shipment</button>
      </div>
    </form>
  </div>
  `;
  document.body.appendChild(modal);
}

async function createShipment(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const shipmentData = Object.fromEntries(formData);

  try {
    const response = await fetch('/api/shipments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Session.getToken()}`
      },
      body: JSON.stringify(shipmentData)
    });

    if (response.ok) {
      event.target.closest('div').parentElement.remove();
      Router.navigate('shipments'); // Refresh the page
    } else {
      alert('Error creating shipment');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error creating shipment');
  }
}

function viewShipment(shipmentId) {
  // Fetch shipment details from API or use mock
  API.request('GET', `/api/shipments/${shipmentId}`).then(shipment => {
    if (!shipment) {
      showToast('Shipment not found', 'error');
      return;
    }

    openModal(`
      <div class="modal modal-lg" style="max-width:900px">
        <div class="modal-header">
          <div class="modal-title">🚛 Shipment Details — ${shipment.id}</div>
          <button class="modal-close" onclick="closeModal()">✕</button>
        </div>
        <div class="modal-body" style="display:grid;gap:20px;padding:0">
          <div style="padding:24px;border-bottom:1px solid var(--border)">
            <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:16px">
              <div>
                <div style="font-size:24px;font-weight:800">${shipment.id}</div>
                <div style="font-size:12px;color:var(--text-muted)">Tracking: ${shipment.tracking_number || 'N/A'}</div>
              </div>
              <span style="background:#dbeafe;color:#1e40af;padding:4px 8px;border-radius:6px;font-size:11px;font-weight:600">
                ${shipment.status?.replace('_', ' ').toUpperCase() || 'In Transit'}
              </span>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;font-size:13px">
              <div><strong>Route:</strong> ${shipment.origin || 'N/A'} → ${shipment.destination || 'N/A'}</div>
              <div><strong>Mode:</strong> ${shipment.transport_mode?.toUpperCase() || 'Road'}</div>
              <div><strong>Cargo:</strong> ${shipment.cargo_type || 'General'}</div>
              <div><strong>Weight:</strong> ${shipment.weight || 'N/A'}</div>
              <div><strong>Value:</strong> ₹${shipment.value?.toLocaleString() || '0'}</div>
              <div><strong>ETA:</strong> ${shipment.estimated_delivery || 'TBD'}</div>
            </div>
            <div style="margin-top:16px;display:flex;gap:8px">
              ${shipment.pricing ? `
                <div style="background:#f0fdf4;padding:8px 12px;border-radius:6px;font-size:12px">
                  <strong>Total Cost:</strong> ₹${shipment.pricing.grand_total?.toLocaleString() || 'TBD'}
                </div>
              ` : ''}
              <button class="btn btn-primary btn-sm" onclick="trackShipment('${shipment.id}')">📍 Live Track</button>
              <button class="btn btn-outline btn-sm" onclick="printShipment('${shipment.id}')">🖨️ Print Label</button>
            </div>
          </div>
          <div style="padding:20px">
            <h4 style="margin:0 0 12px 0">📋 Timeline</h4>
            <div style="display:flex;flex-direction:column;gap:8px;font-size:12px">
              <div>📦 Created: ${shipment.created_at || 'Today'}</div>
              <div>🚚 Booked with carrier</div>
              <div>✈️ In transit</div>
              <div>✅ ${shipment.status === 'delivered' ? 'Delivered' : 'ETA pending'}</div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal()">Close</button>
          ${shipment.status === 'booked' ? `<button class="btn btn-primary" onclick="cancelShipment('${shipment.id}')">Cancel Shipment</button>` : ''}
        </div>
      </div>
    `);
  }).catch(e => {
    console.error('Shipment fetch error:', e);
    showToast('Demo view (start backend for live data)', 'info');
    // Demo modal
    openModal(`
      <div class="modal">
        <div class="modal-header">
          <div class="modal-title">🚛 Demo Shipment: ${shipmentId}</div>
          <button class="modal-close" onclick="closeModal()">✕</button>
        </div>
        <div class="modal-body">
          <div style="padding:20px">
            <div style="font-size:22px;font-weight:800;margin-bottom:12px">${shipmentId}</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;font-size:13px">
              <div><strong>Route:</strong> Mumbai → Delhi</div>
              <div><strong>Status:</strong> In Transit</div>
              <div><strong>Mode:</strong> Road</div>
              <div><strong>Weight:</strong> 1.8 MT</div>
            </div>
          </div>
        </div>
      </div>
    `);
  });
}

function trackShipment(id) {
  Router.navigate('tracking');
  showToast('Live tracking opened', 'success');
}

function printShipment(id) {
  window.print();
  showToast('Printing shipment label...', 'info');
}

function cancelShipment(id) {
  showToast('Shipment cancelled', 'warning');
  closeModal();
}


function trackShipment(id) {
  Router.navigate('tracking');
  showToast('Live tracking opened', 'success');
}

function printShipment(id) {
  window.print();
  showToast('Printing shipment label...', 'info');
}

function cancelShipment(id) {
  showToast('Shipment cancelled', 'warning');
  closeModal();
}
