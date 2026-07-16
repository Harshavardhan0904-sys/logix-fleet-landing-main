/**
 * GPS Real-Time Tracking Page
 * Live tracking of shipments and vehicles on interactive map
 * Feature: Real-time location updates, route visualization, delivery status
 */

const GPSTracking = {
  render: () => {
    const user = Session.get();
    if (!user) {
      return Router.navigate('login');
    }

    return `
      <div class="page-container">
        <div class="page-header">
          <h1>🗺️ Real-Time GPS Tracking</h1>
          <p>Live tracking of all shipments and field personnel</p>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 350px; gap:16px;">
          <!-- Map Section -->
          <div style="border: 2px solid #ddd; border-radius:8px; background:#f5f5f5; display:flex; flex-direction:column;">
            <div style="padding:12px; border-bottom:1px solid #ddd;">
              <input type="text" id="trackingSearch" placeholder="Search shipment, vehicle, or location..." 
                style="width:100%; padding:8px; border-radius:4px; border:1px solid #ccc;">
            </div>
            <div id="mapContainer" style="flex:1; min-height:500px; background:#e0e0e0; display:flex; align-items:center; justify-content:center; position:relative;">
              <div style="text-align:center; color:#999;">
                <p>📍 Map view (Leaflet integration)</p>
                <p style="font-size:12px;">Showing live vehicle & shipment locations</p>
              </div>
            </div>
          </div>

          <!-- Sidebar: Active Shipments -->
          <div>
            <div style="background:white; border-radius:8px; padding:12px; border:1px solid #ddd; margin-bottom:12px;">
              <h3 style="margin:0 0 12px 0; font-size:14px;">📦 Active Shipments</h3>
              <div id="activeShipments" style="max-height:400px; overflow-y:auto;">
                <div style="text-align:center; padding:20px; color:#999;">Loading...</div>
              </div>
            </div>

            <!-- Live Stats -->
            <div style="background:white; border-radius:8px; padding:12px; border:1px solid #ddd;">
              <h3 style="margin:0 0 12px 0; font-size:14px;">📊 Live Stats</h3>
              <div style="font-size:12px; line-height:1.6;">
                <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid #eee;">
                  <span>Active Deliveries:</span>
                  <strong id="activeCount">-</strong>
                </div>
                <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid #eee;">
                  <span>On-Time Rate:</span>
                  <strong id="onTimeRate">-</strong>
                </div>
                <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid #eee;">
                  <span>Avg Delivery Time:</span>
                  <strong id="avgTime">-</strong>
                </div>
                <div style="display:flex; justify-content:space-between; padding:6px 0;">
                  <span>Total Distance:</span>
                  <strong id="totalDistance">-</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Filters & Controls -->
        <div style="margin-top:20px; display:grid; grid-template-columns: repeat(4, 1fr); gap:12px;">
          <div style="background:white; padding:12px; border-radius:8px; border:1px solid #ddd;">
            <label style="display:block; font-size:12px; margin-bottom:6px; font-weight:500;">Status Filter</label>
            <select id="statusFilter" style="width:100%; padding:6px; border-radius:4px; border:1px solid #ccc;">
              <option value="">All Shipments</option>
              <option value="in-transit">In Transit</option>
              <option value="out-for-delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="delayed">Delayed</option>
            </select>
          </div>

          <div style="background:white; padding:12px; border-radius:8px; border:1px solid #ddd;">
            <label style="display:block; font-size:12px; margin-bottom:6px; font-weight:500;">Priority</label>
            <select id="priorityFilter" style="width:100%; padding:6px; border-radius:4px; border:1px solid #ccc;">
              <option value="">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>

          <div style="background:white; padding:12px; border-radius:8px; border:1px solid #ddd;">
            <label style="display:block; font-size:12px; margin-bottom:6px; font-weight:500;">Time Range</label>
            <select id="timeFilter" style="width:100%; padding:6px; border-radius:4px; border:1px solid #ccc;">
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div style="background:white; padding:12px; border-radius:8px; border:1px solid #ddd; display:flex; align-items:flex-end;">
            <button class="btn btn-primary" style="width:100%; margin:0;" onclick="GPSTracking.refreshData()">
              🔄 Refresh
            </button>
          </div>
        </div>

        <!-- Delivery Analytics Table -->
        <div style="margin-top:20px; background:white; border-radius:8px; border:1px solid #ddd; padding:16px;">
          <h3 style="margin:0 0 12px 0;">📈 Delivery Details</h3>
          <table style="width:100%; font-size:12px; border-collapse:collapse;">
            <thead style="background:#f5f5f5;">
              <tr style="border-bottom:1px solid #ddd;">
                <th style="padding:8px; text-align:left;">Shipment ID</th>
                <th style="padding:8px; text-align:left;">Status</th>
                <th style="padding:8px; text-align:left;">Current Location</th>
                <th style="padding:8px; text-align:center;">Speed (km/h)</th>
                <th style="padding:8px; text-align:center;">ETA</th>
                <th style="padding:8px; text-align:center;">Distance Remaining</th>
              </tr>
            </thead>
            <tbody id="trackingTable">
              <tr>
                <td colspan="6" style="text-align:center; padding:20px; color:#999;">
                  No active shipments. Data will appear here when deliveries are in progress.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Map Legend -->
        <div style="margin-top:20px; background:white; border-radius:8px; border:1px solid #ddd; padding:12px;">
          <h4 style="margin:0 0 8px 0; font-size:12px;">📍 Map Legend</h4>
          <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:12px; font-size:12px;">
            <div style="display:flex; align-items:center; gap:6px;">
              <div style="width:16px; height:16px; background:#FF6B6B; border-radius:50%;"></div>
              <span>High Priority</span>
            </div>
            <div style="display:flex; align-items:center; gap:6px;">
              <div style="width:16px; height:16px; background:#FFA500; border-radius:50%;"></div>
              <span>Medium Priority</span>
            </div>
            <div style="display:flex; align-items:center; gap:6px;">
              <div style="width:16px; height:16px; background:#4CAF50; border-radius:50%;"></div>
              <span>Low Priority</span>
            </div>
            <div style="display:flex; align-items:center; gap:6px;">
              <div style="width:16px; height:16px; background:#2196F3; border-radius:50%;"></div>
              <span>Completed</span>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  init: async () => {
    console.log('📍 GPS Tracking Page Initialized');
    
    // Add event listeners
    document.getElementById('statusFilter')?.addEventListener('change', GPSTracking.filterData);
    document.getElementById('priorityFilter')?.addEventListener('change', GPSTracking.filterData);
    document.getElementById('timeFilter')?.addEventListener('change', GPSTracking.filterData);
    document.getElementById('trackingSearch')?.addEventListener('input', GPSTracking.searchShipments);

    // Load initial data
    await GPSTracking.loadTrackingData();
    
    // Real-time updates - refresh every 5 seconds
    setInterval(GPSTracking.refreshData, 5000);
  },

  loadTrackingData: async () => {
    try {
      const response = await fetch('https://freightflow-pkf5.onrender.com/api/shipments/tracking', {
        headers: { 'Authorization': `Bearer ${Session.getToken()}` }
      });
      const data = await response.json();
      GPSTracking.displayTrackingData(data);
    } catch (err) {
      console.error('Error loading tracking data:', err);
    }
  },

  displayTrackingData: (data) => {
    // Display active shipments in sidebar
    const activeShipmentsDiv = document.getElementById('activeShipments');
    if (activeShipmentsDiv && data.activeShipments) {
      activeShipmentsDiv.innerHTML = data.activeShipments.map(s => `
        <div style="padding:8px; border:1px solid #eee; border-radius:4px; margin-bottom:8px; cursor:pointer; font-size:12px;">
          <div style="font-weight:600; color:#333;">${s.shipmentId}</div>
          <div style="color:#666; margin:4px 0;">📍 ${s.location}</div>
          <div style="color:#999; font-size:10px;">${s.status} | Driver: ${s.driver}</div>
        </div>
      `).join('');
    }

    // Update stats - with null checks
    if (data.stats) {
      const activeCountEl = document.getElementById('activeCount');
      const onTimeRateEl = document.getElementById('onTimeRate');
      const avgTimeEl = document.getElementById('avgTime');
      const totalDistanceEl = document.getElementById('totalDistance');
      
      if (activeCountEl) activeCountEl.textContent = data.stats.activeCount || '-';
      if (onTimeRateEl) onTimeRateEl.textContent = data.stats.onTimeRate || '-';
      if (avgTimeEl) avgTimeEl.textContent = data.stats.avgDeliveryTime || '-';
      if (totalDistanceEl) totalDistanceEl.textContent = data.stats.totalDistance || '-';
    }

    // Populate detailed tracking table
    const table = document.getElementById('trackingTable');
    if (table && data.shipments?.length > 0) {
      table.innerHTML = data.shipments.map(s => `
        <tr style="border-bottom:1px solid #eee;">
          <td style="padding:8px;"><strong>${s.shipmentId}</strong></td>
          <td style="padding:8px;">
            <span style="background:${s.status === 'in-transit' ? '#FF6B6B' : '#4CAF50'}; padding:2px 6px; border-radius:3px; color:white; font-size:11px;">
              ${s.status}
            </span>
          </td>
          <td style="padding:8px;">${s.location || s.origin}</td>
          <td style="padding:8px; text-align:center;">${s.speed || '-'} km/h</td>
          <td style="padding:8px; text-align:center;">${s.eta ? new Date(s.eta).getHours() + ':' + String(new Date(s.eta).getMinutes()).padStart(2, '0') : '-'}</td>
          <td style="padding:8px; text-align:center;">${s.distanceRemaining || '-'} km</td>
        </tr>
      `).join('');
    }
  },

  filterData: () => {
    const status = document.getElementById('statusFilter').value;
    const priority = document.getElementById('priorityFilter').value;
    const timeRange = document.getElementById('timeFilter').value;
    
    console.log('Filtering:', { status, priority, timeRange });
    GPSTracking.loadTrackingData();
  },

  searchShipments: (e) => {
    const query = e.target.value.toLowerCase();
    console.log('Searching:', query);
    // Filter visible rows based on search
  },

  refreshData: () => {
    GPSTracking.loadTrackingData();
  }
};
