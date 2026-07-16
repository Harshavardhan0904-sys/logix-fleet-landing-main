/**
 * Territory & Zone Management
 * Assign delivery territories to drivers and vendors
 * Feature: Territory mapping, workload balancing, allocation optimization
 */

const TerritoryManagement = {
  render: () => {
    const user = Session.get();
    if (!user) {
      return Router.navigate('login');
    }

    return `
      <div class="page-container">
        <div class="page-header">
          <h1>🗺️ Territory & Zone Management</h1>
          <p>Assign delivery zones and balance workload across drivers</p>
        </div>

        <!-- Territory Map View -->
        <div style="display:grid; grid-template-columns: 1fr 300px; gap:16px; margin-bottom:20px;">
          <!-- Map -->
          <div style="background:white; border-radius:8px; border:1px solid #ddd; padding:12px; min-height:500px;">
            <div style="width:100%; height:500px; background:#e0e0e0; border-radius:8px; display:flex; align-items:center; justify-content:center; color:#999;">
              📍 Territory Map View (Leaflet Integration)<br>
              <small>Showing assigned zones and driver coverage areas</small>
            </div>
          </div>

          <!-- Territory List Sidebar -->
          <div style="background:white; border-radius:8px; border:1px solid #ddd; padding:12px; max-height:550px; overflow-y:auto;">
            <h3 style="margin:0 0 12px 0; font-size:13px; font-weight:600;">🏘️ Active Territories</h3>
            
            <div style="margin-bottom:12px; padding:8px; background:#f0f7ff; border:1px solid #61dafb; border-radius:4px; cursor:pointer;">
              <div style="font-weight:600; font-size:12px;">North Delhi Zone</div>
              <div style="font-size:10px; color:#666; margin:2px 0;">
                👤 Rajesh Kumar | 12 areas | 45% loaded
              </div>
            </div>

            <div style="margin-bottom:12px; padding:8px; background:#f0f7ff; border:1px solid #61dafb; border-radius:4px; cursor:pointer;">
              <div style="font-weight:600; font-size:12px;">South Delhi Zone</div>
              <div style="font-size:10px; color:#666; margin:2px 0;">
                👤 Priya Singh | 14 areas | 65% loaded
              </div>
            </div>

            <div style="margin-bottom:12px; padding:8px; background:#f0f7ff; border:1px solid #61dafb; border-radius:4px; cursor:pointer;">
              <div style="font-weight:600; font-size:12px;">East Delhi Zone</div>
              <div style="font-size:10px; color:#666; margin:2px 0;">
                👤 Anil Verma | 10 areas | 38% loaded
              </div>
            </div>

            <div style="margin-bottom:12px; padding:8px; background:#fff3e0; border:1px solid #ffb74d; border-radius:4px; cursor:pointer;">
              <div style="font-weight:600; font-size:12px;">South Mumbai Zone</div>
              <div style="font-size:10px; color:#666; margin:2px 0;">
                👤 Unassigned | 8 areas | Pending
              </div>
            </div>

            <button class="btn btn-primary" style="width:100%;" onclick="TerritoryManagement.addNewTerritory()">
              ➕ New Territory
            </button>
          </div>
        </div>

        <!-- Workload Balancing -->
        <div style="background:white; border-radius:8px; border:1px solid #ddd; padding:16px; margin-bottom:20px;">
          <h3 style="margin:0 0 12px 0; font-size:13px; font-weight:600;">⚖️ Workload Distribution</h3>
          
          <table style="width:100%; font-size:11px;">
            <thead style="background:#f5f5f5;">
              <tr style="border-bottom:1px solid #ddd;">
                <th style="padding:8px; text-align:left;">Driver</th>
                <th style="padding:8px; text-align:center;">Territory</th>
                <th style="padding:8px; text-align:center;">Areas Assigned</th>
                <th style="padding:8px; text-align:center;">Daily Deliveries</th>
                <th style="padding:8px; text-align:center;">Workload</th>
                <th style="padding:8px; text-align:center;">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom:1px solid #eee;">
                <td style="padding:8px;">Rajesh Kumar</td>
                <td style="padding:8px; text-align:center;">North Delhi</td>
                <td style="padding:8px; text-align:center;">12</td>
                <td style="padding:8px; text-align:center;">35-40</td>
                <td style="padding:8px; text-align:center;">
                  <div style="background:#e3f2fd; height:6px; border-radius:3px; position:relative; overflow:hidden;">
                    <div style="background:#2196F3; height:100%; width:45%; border-radius:3px;"></div>
                  </div>
                  <small>45%</small>
                </td>
                <td style="padding:8px; text-align:center;">
                  <button class="btn btn-sm" onclick="TerritoryManagement.editTerritory('north-delhi')">Edit</button>
                </td>
              </tr>

              <tr style="border-bottom:1px solid #eee;">
                <td style="padding:8px;">Priya Singh</td>
                <td style="padding:8px; text-align:center;">South Delhi</td>
                <td style="padding:8px; text-align:center;">14</td>
                <td style="padding:8px; text-align:center;">48-52</td>
                <td style="padding:8px; text-align:center;">
                  <div style="background:#fff3e0; height:6px; border-radius:3px; position:relative; overflow:hidden;">
                    <div style="background:#FF9800; height:100%; width:65%; border-radius:3px;"></div>
                  </div>
                  <small>65%</small>
                </td>
                <td style="padding:8px; text-align:center;">
                  <button class="btn btn-sm" onclick="TerritoryManagement.editTerritory('south-delhi')">Edit</button>
                </td>
              </tr>

              <tr style="border-bottom:1px solid #eee;">
                <td style="padding:8px;">Anil Verma</td>
                <td style="padding:8px; text-align:center;">East Delhi</td>
                <td style="padding:8px; text-align:center;">10</td>
                <td style="padding:8px; text-align:center;">25-30</td>
                <td style="padding:8px; text-align:center;">
                  <div style="background:#e8f5e9; height:6px; border-radius:3px; position:relative; overflow:hidden;">
                    <div style="background:#4CAF50; height:100%; width:38%; border-radius:3px;"></div>
                  </div>
                  <small>38%</small>
                </td>
                <td style="padding:8px; text-align:center;">
                  <button class="btn btn-sm" onclick="TerritoryManagement.editTerritory('east-delhi')">Edit</button>
                </td>
              </tr>

              <tr>
                <td style="padding:8px;">Unassigned</td>
                <td style="padding:8px; text-align:center;">South Mumbai</td>
                <td style="padding:8px; text-align:center;">8</td>
                <td style="padding:8px; text-align:center;">-</td>
                <td style="padding:8px; text-align:center;">
                  <span style="background:#ffebee; color:#c62828; padding:2px 6px; border-radius:3px; font-size:10px;">Needs Assignment</span>
                </td>
                <td style="padding:8px; text-align:center;">
                  <button class="btn btn-sm btn-primary" onclick="TerritoryManagement.assignTerritory('south-mumbai')">Assign</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Territory Details Modal -->
        <div id="territoryModal" style="display:none; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5); z-index:1000; display:flex; align-items:center; justify-content:center;">
          <div style="background:white; border-radius:8px; width:90%; max-width:700px; padding:20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
              <h2 style="margin:0; font-size:16px;">Assign Territory to Driver</h2>
              <button onclick="TerritoryManagement.closeTerritoryModal()" style="background:none; border:none; font-size:24px; cursor:pointer;">✕</button>
            </div>

            <div style="margin-bottom:16px;">
              <label style="display:block; margin-bottom:6px; font-weight:600; font-size:12px;">Territory</label>
              <div style="padding:12px; background:#f5f5f5; border-radius:4px; font-size:12px;" id="territoryName"></div>
            </div>

            <div style="margin-bottom:16px;">
              <label style="display:block; margin-bottom:6px; font-weight:600; font-size:12px;">Assign to Driver</label>
              <select id="driverSelect" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:4px;">
                <option value="">-- Select Driver --</option>
                <option value="drv-001">Rajesh Kumar</option>
                <option value="drv-002">Priya Singh</option>
                <option value="drv-003">Anil Verma</option>
              </select>
            </div>

            <div style="margin-bottom:16px;">
              <label style="display:block; margin-bottom:6px; font-weight:600; font-size:12px;">Included Areas/Postal Codes</label>
              <textarea id="areasText" placeholder="List areas/postal codes separated by commas..." style="width:100%; height:100px; padding:8px; border:1px solid #ddd; border-radius:4px; font-size:11px;" readonly></textarea>
            </div>

            <div style="margin-bottom:16px;">
              <label style="display:block; margin-bottom:6px; font-weight:600; font-size:12px;">📊 Expected Daily Deliveries</label>
              <input type="number" id="expectedDeliveries" placeholder="e.g., 40" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:4px;">
            </div>

            <div style="display:flex; gap:8px;">
              <button class="btn btn-outline" onclick="TerritoryManagement.closeTerritoryModal()" style="flex:1;">Cancel</button>
              <button class="btn btn-primary" onclick="TerritoryManagement.saveTerritory()" style="flex:1;">✅ Save Assignment</button>
            </div>
          </div>
        </div>

        <!-- Optimization Suggestions -->
        <div style="background:#FFF8E1; border:1px solid #FFB300; border-radius:8px; padding:16px;">
          <h3 style="margin:0 0 12px 0; font-size:13px; font-weight:600;">💡 Optimization Suggestions</h3>
          <div style="font-size:12px; line-height:1.6;">
            <div style="margin-bottom:8px;">
              1. <strong>Rebalance South Delhi Zone:</strong> Priya Singh's territory is overloaded at 65%. Consider reassigning 3-4 areas to Anil Verma (currently at 38%).
            </div>
            <div style="margin-bottom:8px;">
              2. <strong>Assign South Mumbai:</strong> 8 unassigned areas in South Mumbai could be assigned to new driver or distributed among existing team.
            </div>
            <div>
              3. <strong>Add New Driver:</strong> Current capacity utilization shows need for 1 additional driver to handle peak loads efficiently.
            </div>
          </div>
        </div>
      </div>
    `;
  },

  init: () => {
    console.log('🗺️ Territory Management Page Initialized');
  },

  addNewTerritory: () => {
    showToast('🗺️ Opening new territory creation dialog...', 'info');
  },

  editTerritory: (territoryId) => {
    const modal = document.getElementById('territoryModal');
    const nameEl = document.getElementById('territoryName');
    if (nameEl) nameEl.textContent = territoryId;
    if (modal) modal.style.display = 'flex';
  },

  assignTerritory: (territoryId) => {
    const modal = document.getElementById('territoryModal');
    const nameEl = document.getElementById('territoryName');
    if (nameEl) nameEl.textContent = territoryId;
    if (modal) modal.style.display = 'flex';
  },

  closeTerritoryModal: () => {
    const modal = document.getElementById('territoryModal');
    if (modal) modal.style.display = 'none';
  },

  saveTerritory: () => {
    const driverEl = document.getElementById('driverSelect');
    const deliveriesEl = document.getElementById('expectedDeliveries');
    const driver = driverEl?.value || '';
    const deliveries = deliveriesEl?.value || '0';

    if (!driver) {
      showToast('❌ Please select a driver', 'error');
      return;
    }

    showToast('✅ Territory assigned successfully!', 'success');
    TerritoryManagement.closeTerritoryModal();
  }
};
