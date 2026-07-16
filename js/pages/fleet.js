// ============================================================
// Aetra — Enterprise Fleet Management
// GPS Tracking, Maintenance, Fuel Management
// ============================================================

Pages.fleet = async function(container) {
  const user = Session.get();
  if (!user) return Router.navigate('login');

  container.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:400px;flex-direction:column;gap:16px">
    <div style="width:44px;height:44px;border:4px solid #e2e8f0;border-top-color:var(--primary);border-radius:50%;animation:spin .8s linear infinite"></div>
    <div style="font-size:14px;color:var(--text-muted)">Loading fleet management...</div>
  </div>`;

  try {
    // Fetch fleet data
    const response = await fetch('/api/fleet/vehicles', {
      headers: { 'Authorization': `Bearer ${Session.getToken()}` }
    });
    const fleet = await response.json();

    container.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px">
      <div>
        <h1 style="font-size:28px;font-weight:800;margin:0">🚚 Enterprise Fleet</h1>
        <p style="color:var(--text-muted);margin:4px 0 0">GPS tracking, maintenance scheduling & fuel management</p>
      </div>
      <button class="btn btn-primary" onclick="openNewVehicleModal()">
        <span style="margin-right:8px">+</span> Add Vehicle
      </button>
    </div>

    <!-- FLEET STATS -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:24px">
      <div class="card" style="text-align:center;padding:20px">
        <div style="font-size:32px;margin-bottom:8px">🚛</div>
        <div style="font-size:24px;font-weight:800;color:#10b981">${fleet.data?.length || 0}</div>
        <div style="font-size:12px;color:var(--text-muted)">Total Vehicles</div>
      </div>
      <div class="card" style="text-align:center;padding:20px">
        <div style="font-size:32px;margin-bottom:8px">🟢</div>
        <div style="font-size:24px;font-weight:800;color:#3b82f6">${fleet.data?.filter(v => v.status === 'active').length || 0}</div>
        <div style="font-size:12px;color:var(--text-muted)">Active Vehicles</div>
      </div>
      <div class="card" style="text-align:center;padding:20px">
        <div style="font-size:32px;margin-bottom:8px">🔧</div>
        <div style="font-size:24px;font-weight:800;color:#f59e0b">${fleet.data?.filter(v => v.status === 'maintenance').length || 0}</div>
        <div style="font-size:12px;color:var(--text-muted)">Under Maintenance</div>
      </div>
      <div class="card" style="text-align:center;padding:20px">
        <div style="font-size:32px;margin-bottom:8px">📍</div>
        <div style="font-size:24px;font-weight:800;color:#ef4444">${fleet.data?.filter(v => v.gps_enabled).length || 0}</div>
        <div style="font-size:12px;color:var(--text-muted)">GPS Enabled</div>
      </div>
    </div>

    <!-- FLEET TABLE -->
    <div class="card">
      <div style="padding:20px;border-bottom:1px solid var(--border)">
        <h3 style="margin:0;font-size:18px;font-weight:700">Fleet Overview</h3>
      </div>
      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr style="background:#f8fafc;border-bottom:1px solid var(--border)">
              <th style="padding:12px;text-align:left;font-weight:600;font-size:12px;color:var(--text-muted)">REGISTRATION</th>
              <th style="padding:12px;text-align:left;font-weight:600;font-size:12px;color:var(--text-muted)">TYPE</th>
              <th style="padding:12px;text-align:left;font-weight:600;font-size:12px;color:var(--text-muted)">CAPACITY</th>
              <th style="padding:12px;text-align:left;font-weight:600;font-size:12px;color:var(--text-muted)">STATUS</th>
              <th style="padding:12px;text-align:left;font-weight:600;font-size:12px;color:var(--text-muted)">FUEL</th>
              <th style="padding:12px;text-align:left;font-weight:600;font-size:12px;color:var(--text-muted)">GPS</th>
              <th style="padding:12px;text-align:left;font-weight:600;font-size:12px;color:var(--text-muted)">LOCATION</th>
              <th style="padding:12px;text-align:left;font-weight:600;font-size:12px;color:var(--text-muted)">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            ${fleet.data?.map(vehicle => `
              <tr style="border-bottom:1px solid var(--border-light)">
                <td style="padding:12px;font-weight:600;font-family:monospace">${vehicle.registration_number}</td>
                <td style="padding:12px">
                  <span style="background:#f3f4f6;color:#374151;padding:4px 8px;border-radius:6px;font-size:11px;font-weight:600">
                    ${vehicle.vehicle_type?.toUpperCase()}
                  </span>
                </td>
                <td style="padding:12px">${vehicle.capacity_weight}kg / ${vehicle.capacity_volume}m³</td>
                <td style="padding:12px">
                  <span style="background:${vehicle.status === 'active' ? '#dcfce7' : vehicle.status === 'maintenance' ? '#fef3c7' : '#fee2e2'};color:${vehicle.status === 'active' ? '#166534' : vehicle.status === 'maintenance' ? '#b45309' : '#dc2626'};padding:4px 8px;border-radius:6px;font-size:11px;font-weight:600">
                    ${vehicle.status?.toUpperCase()}
                  </span>
                </td>
                <td style="padding:12px">
                  <div style="display:flex;align-items:center;gap:4px">
                    <div style="width:60px;height:6px;background:#e5e7eb;border-radius:3px;overflow:hidden">
                      <div style="width:${vehicle.fuel_level}%;height:100%;background:${vehicle.fuel_level > 25 ? '#10b981' : '#ef4444'};border-radius:3px"></div>
                    </div>
                    <span style="font-size:11px;color:var(--text-muted)">${vehicle.fuel_level}%</span>
                  </div>
                </td>
                <td style="padding:12px">
                  ${vehicle.gps_enabled ? '📍' : '❌'}
                </td>
                <td style="padding:12px">
                  ${vehicle.location ? `${vehicle.location.lat.toFixed(2)}, ${vehicle.location.lng.toFixed(2)}` : 'N/A'}
                </td>
                <td style="padding:12px">
                  <button class="btn btn-sm" onclick="viewVehicle('${vehicle.id}')">👁️ View</button>
                  <button class="btn btn-sm btn-secondary" onclick="trackVehicle('${vehicle.id}')">📍 Track</button>
                </td>
              </tr>
            `).join('') || '<tr><td colspan="8" style="padding:40px;text-align:center;color:var(--text-muted)">No vehicles in fleet. Add your first vehicle!</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>

    <!-- AI INSIGHTS -->
    <div class="card" style="margin-top:24px">
      <div style="padding:20px;border-bottom:1px solid var(--border)">
        <h3 style="margin:0;font-size:18px;font-weight:700">🤖 AI Fleet Insights</h3>
      </div>
      <div style="padding:20px">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px">
          <div>
            <h4 style="margin:0 0 8px;font-size:14px;color:var(--text-muted)">FUEL EFFICIENCY</h4>
            <div style="font-size:24px;font-weight:800;color:#10b981">12.5 km/L</div>
            <div style="font-size:12px;color:#059669">↑ 8% from last month</div>
          </div>
          <div>
            <h4 style="margin:0 0 8px;font-size:14px;color:var(--text-muted)">MAINTENANCE PREDICTION</h4>
            <div style="font-size:24px;font-weight:800;color:#f59e0b">2 vehicles</div>
            <div style="font-size:12px;color:#b45309">Due within 30 days</div>
          </div>
          <div>
            <h4 style="margin:0 0 8px;font-size:14px;color:var(--text-muted)">ROUTE OPTIMIZATION</h4>
            <div style="font-size:24px;font-weight:800;color:#3b82f6">₹45,000</div>
            <div style="font-size:12px;color:#1e40af">Monthly savings potential</div>
          </div>
        </div>
      </div>
    </div>
    `;
  } catch (error) {
    console.error('Error loading fleet:', error);
    container.innerHTML = `
    <div style="text-align:center;padding:60px">
      <div style="font-size:48px;margin-bottom:16px">🚚</div>
      <h2 style="margin:0 0 8px">Enterprise Fleet</h2>
      <p style="color:var(--text-muted);margin-bottom:24px">GPS tracking & maintenance management</p>
      <button class="btn btn-primary" onclick="openNewVehicleModal()">Add First Vehicle</button>
    </div>
    `;
  }
};

function openNewVehicleModal() {
  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:1000';
  modal.innerHTML = `
  <div style="background:#fff;border-radius:12px;padding:24px;width:90%;max-width:600px;max-height:90vh;overflow-y:auto">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
      <h3 style="margin:0;font-size:20px">🚛 Add New Vehicle</h3>
      <button onclick="this.closest('div').parentElement.remove()" style="background:none;border:none;font-size:24px;cursor:pointer">&times;</button>
    </div>
    <form onsubmit="createVehicle(event)">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
        <div>
          <label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px">Registration Number</label>
          <input name="registration_number" required style="width:100%;padding:8px;border:1px solid var(--border);border-radius:6px">
        </div>
        <div>
          <label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px">Vehicle Type</label>
          <select name="vehicle_type" required style="width:100%;padding:8px;border:1px solid var(--border);border-radius:6px">
            <option value="truck">Truck</option>
            <option value="tempo">Tempo</option>
            <option value="container">Container</option>
            <option value="pickup">Pickup</option>
          </select>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:16px">
        <div>
          <label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px">Weight Capacity (kg)</label>
          <input name="capacity_weight" type="number" required style="width:100%;padding:8px;border:1px solid var(--border);border-radius:6px">
        </div>
        <div>
          <label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px">Volume Capacity (m³)</label>
          <input name="capacity_volume" type="number" required style="width:100%;padding:8px;border:1px solid var(--border);border-radius:6px">
        </div>
        <div>
          <label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px">Fuel Type</label>
          <select name="fuel_type" required style="width:100%;padding:8px;border:1px solid var(--border);border-radius:6px">
            <option value="diesel">Diesel</option>
            <option value="petrol">Petrol</option>
            <option value="cng">CNG</option>
            <option value="electric">Electric</option>
          </select>
        </div>
      </div>
      <div style="margin-bottom:16px">
        <label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px">GPS Tracking Enabled</label>
        <select name="gps_enabled" style="width:100%;padding:8px;border:1px solid var(--border);border-radius:6px">
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </div>
      <div style="display:flex;gap:12px;justify-content:end">
        <button type="button" onclick="this.closest('div').parentElement.remove()" class="btn btn-secondary">Cancel</button>
        <button type="submit" class="btn btn-primary">🚛 Add Vehicle</button>
      </div>
    </form>
  </div>
  `;
  document.body.appendChild(modal);
}

async function createVehicle(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const vehicleData = Object.fromEntries(formData);

  try {
    const response = await fetch('/api/fleet/vehicles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Session.getToken()}`
      },
      body: JSON.stringify(vehicleData)
    });

    if (response.ok) {
      event.target.closest('div').parentElement.remove();
      Router.navigate('fleet'); // Refresh the page
    } else {
      alert('Error adding vehicle');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error adding vehicle');
  }
}

function viewVehicle(vehicleId) {
  alert(`Viewing vehicle: ${vehicleId}`);
}

function trackVehicle(vehicleId) {
  alert(`Tracking vehicle: ${vehicleId} - GPS integration coming soon!`);
}