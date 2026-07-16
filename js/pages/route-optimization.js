/**
 * Route Optimization Page
 * AI-powered route planning to minimize distance, time, and fuel costs
 * Feature: Auto-optimize routes, manually adjust, compare alternatives, CO2 tracking
 */

const RouteOptimization = {
  render: () => {
    const user = Session.get();
    if (!user) {
      return Router.navigate('login');
    }

    return `
      <div class="page-container">
        <div class="page-header">
          <h1>🛣️ Route Optimization</h1>
          <p>AI-powered route planning to reduce time, distance, and costs</p>
        </div>

        <!-- Quick Stats -->
        <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:12px; margin-bottom:20px;">
          <div style="background:white; border-radius:8px; padding:16px; border:1px solid #ddd; text-align:center;">
            <div style="font-size:28px; font-weight:600; color:#2196F3;">42</div>
            <div style="font-size:12px; color:#666; margin-top:4px;">Active Routes Today</div>
          </div>
          <div style="background:white; border-radius:8px; padding:16px; border:1px solid #ddd; text-align:center;">
            <div style="font-size:28px; font-weight:600; color:#4CAF50;">38.5%</div>
            <div style="font-size:12px; color:#666; margin-top:4px;">Avg Distance Saved</div>
          </div>
          <div style="background:white; border-radius:8px; padding:16px; border:1px solid #ddd; text-align:center;">
            <div style="font-size:28px; font-weight:600; color:#FF9800;">₹24,500</div>
            <div style="font-size:12px; color:#666; margin-top:4px;">Fuel Cost Saved (Month)</div>
          </div>
          <div style="background:white; border-radius:8px; padding:16px; border:1px solid #ddd; text-align:center;">
            <div style="font-size:28px; font-weight:600; color:#9C27B0;">2.4T</div>
            <div style="font-size:12px; color:#666; margin-top:4px;">CO₂ Emissions Reduced</div>
          </div>
        </div>

        <!-- Route Planning Controls -->
        <div style="background:white; border-radius:8px; border:1px solid #ddd; padding:16px; margin-bottom:20px;">
          <h3 style="margin:0 0 16px 0;">📍 Create New Optimized Route</h3>
          
          <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:12px; margin-bottom:16px;">
            <div>
              <label style="display:block; margin-bottom:6px; font-weight:600; font-size:13px;">Starting Location</label>
              <input type="text" id="routeStart" placeholder="e.g., Delhi Hub" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:4px;">
            </div>
            <div>
              <label style="display:block; margin-bottom:6px; font-weight:600; font-size:13px;">Vehicle Type</label>
              <select id="vehicleType" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:4px;">
                <option>2-Wheeler (Bike)</option>
                <option selected>4-Wheeler (Car)</option>
                <option>Van (500kg)</option>
                <option>Truck (3T)</option>
              </select>
            </div>
            <div>
              <label style="display:block; margin-bottom:6px; font-weight:600; font-size:13px;">Optimization Priority</label>
              <select id="optimizationPriority" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:4px;">
                <option>⏱️ Fastest Route</option>
                <option selected>💰 Cost Effective</option>
                <option>🌱 Eco Friendly</option>
                <option>⚖️ Balanced</option>
              </select>
            </div>
          </div>

          <div style="margin-bottom:16px;">
            <label style="display:block; margin-bottom:8px; font-weight:600; font-size:13px;">📦 Delivery Stops</label>
            <div style="background:#f9f9f9; border:1px solid #ddd; border-radius:4px; padding:12px; max-height:200px; overflow-y:auto;">
              <div style="display:flex; gap:8px; margin-bottom:8px; align-items:center; padding:8px; background:white; border-radius:4px;">
                <span style="flex:1; font-size:12px;">🏢 Stop 1: Mumbai Main Office</span>
                <span style="font-size:11px; color:#666;">5 packages</span>
                <button onclick="RouteOptimization.removeStop(1)" style="background:none; border:none; color:#d32f2f; cursor:pointer;">✕</button>
              </div>
              <div style="display:flex; gap:8px; margin-bottom:8px; align-items:center; padding:8px; background:white; border-radius:4px;">
                <span style="flex:1; font-size:12px;">🏪 Stop 2: Bandra Branch</span>
                <span style="font-size:11px; color:#666;">3 packages</span>
                <button onclick="RouteOptimization.removeStop(2)" style="background:none; border:none; color:#d32f2f; cursor:pointer;">✕</button>
              </div>
              <div style="display:flex; gap:8px; align-items:center; padding:8px; background:white; border-radius:4px;">
                <input type="text" placeholder="Add new stop..." style="flex:1; padding:6px; border:1px solid #ddd; border-radius:3px; font-size:12px;">
                <button class="btn btn-sm" style="background:#2196F3; color:white; border:none; padding:6px 12px; cursor:pointer;">+</button>
              </div>
            </div>
          </div>

          <div style="display:flex; gap:8px;">
            <button class="btn btn-primary" onclick="RouteOptimization.optimizeRoute()" style="flex:1;">
              🚀 Optimize Route
            </button>
            <button class="btn btn-outline" style="flex:1;" onclick="RouteOptimization.clearForm()">Clear</button>
          </div>
        </div>

        <!-- Optimized Routes Results -->
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
          <!-- Original vs Optimized Comparison -->
          <div style="background:white; border-radius:8px; border:1px solid #ddd; padding:16px;">
            <h3 style="margin:0 0 12px 0; font-size:14px;">📊 Route Comparison</h3>
            <table style="width:100%; font-size:12px;">
              <thead style="border-bottom:2px solid #ddd;">
                <tr>
                  <th style="padding:8px; text-align:left;">Metric</th>
                  <th style="padding:8px; text-align:center;">Original</th>
                  <th style="padding:8px; text-align:center;">Optimized</th>
                  <th style="padding:8px; text-align:center;">Saved</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom:1px solid #eee;">
                  <td style="padding:8px;">Distance</td>
                  <td style="padding:8px; text-align:center;">45.2 km</td>
                  <td style="padding:8px; text-align:center;">28.1 km</td>
                  <td style="padding:8px; text-align:center; color:#4CAF50; font-weight:600;">37.8%</td>
                </tr>
                <tr style="border-bottom:1px solid #eee;">
                  <td style="padding:8px;">Time</td>
                  <td style="padding:8px; text-align:center;">2h 15min</td>
                  <td style="padding:8px; text-align:center;">1h 32min</td>
                  <td style="padding:8px; text-align:center; color:#4CAF50; font-weight:600;">32.1%</td>
                </tr>
                <tr style="border-bottom:1px solid #eee;">
                  <td style="padding:8px;">Fuel Cost</td>
                  <td style="padding:8px; text-align:center;">₹540</td>
                  <td style="padding:8px; text-align:center;">₹337</td>
                  <td style="padding:8px; text-align:center; color:#4CAF50; font-weight:600;">37.6%</td>
                </tr>
                <tr>
                  <td style="padding:8px;">CO₂ Emissions</td>
                  <td style="padding:8px; text-align:center;">10.2 kg</td>
                  <td style="padding:8px; text-align:center;">6.4 kg</td>
                  <td style="padding:8px; text-align:center; color:#4CAF50; font-weight:600;">37.3%</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Route Alternatives -->
          <div style="background:white; border-radius:8px; border:1px solid #ddd; padding:16px;">
            <h3 style="margin:0 0 12px 0; font-size:14px;">🛣️ Alternative Routes</h3>
            <div style="font-size:12px; color:#666;">
              <div style="padding:8px; border:1px solid #ddd; border-radius:4px; margin-bottom:8px; cursor:pointer; background:#E3F2FD;">
                <div style="font-weight:600; color:#1976D2;">Route A: Fastest</div>
                <div style="margin:4px 0;">⏱️ 1h 28min | 📍 27.3 km | 💰 ₹327</div>
                <div style="font-size:10px; color:#888;">Via Western Express Highway</div>
              </div>
              <div style="padding:8px; border:1px solid #ddd; border-radius:4px; margin-bottom:8px; cursor:pointer;">
                <div style="font-weight:600; color:#333;">Route B: Cheapest</div>
                <div style="margin:4px 0;">⏱️ 1h 52min | 📍 26.8 km | 💰 ₹321</div>
                <div style="font-size:10px; color:#888;">Via Eastern Express Highway</div>
              </div>
              <div style="padding:8px; border:1px solid #ddd; border-radius:4px; cursor:pointer;">
                <div style="font-weight:600; color:#333;">Route C: Eco-friendly</div>
                <div style="margin:4px 0;">⏱️ 1h 35min | 📍 24.5 km | 💰 ₹294</div>
                <div style="font-size:10px; color:#888;">Via arterial roads (least traffic)</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Saved Routes History -->
        <div style="background:white; border-radius:8px; border:1px solid #ddd; padding:16px; margin-top:20px;">
          <h3 style="margin:0 0 12px 0;">📚 Saved Route Templates</h3>
          <table style="width:100%; font-size:12px;">
            <thead style="background:#f5f5f5; border-bottom:1px solid #ddd;">
              <tr>
                <th style="padding:8px; text-align:left;">Route Name</th>
                <th style="padding:8px; text-align:left;">Stops</th>
                <th style="padding:8px; text-align:center;">Distance</th>
                <th style="padding:8px; text-align:center;">Time</th>
                <th style="padding:8px; text-align:center;">Fuel Cost</th>
                <th style="padding:8px; text-align:center;">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom:1px solid #eee;">
                <td style="padding:8px;">Daily Delhi-NCR Loop</td>
                <td style="padding:8px;">8 stops</td>
                <td style="padding:8px; text-align:center;">124.5 km</td>
                <td style="padding:8px; text-align:center;">5h 30m</td>
                <td style="padding:8px; text-align:center;">₹1,494</td>
                <td style="padding:8px; text-align:center;"><button class="btn btn-sm" onclick="alert('Route loaded!')">Load</button></td>
              </tr>
              <tr style="border-bottom:1px solid #eee;">
                <td style="padding:8px;">Weekend Mumbai Express</td>
                <td style="padding:8px;">5 stops</td>
                <td style="padding:8px; text-align:center;">62.3 km</td>
                <td style="padding:8px; text-align:center;">2h 45m</td>
                <td style="padding:8px; text-align:center;">₹747</td>
                <td style="padding:8px; text-align:center;"><button class="btn btn-sm" onclick="alert('Route loaded!')">Load</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  init: () => {
    console.log('🛣️ Route Optimization Page Initialized');
  },

  optimizeRoute: async () => {
    const startEl = document.getElementById('routeStart');
    const vehicleEl = document.getElementById('vehicleType');
    const priorityEl = document.getElementById('optimizationPriority');
    
    const startLocation = startEl?.value || '';
    const vehicleType = vehicleEl?.value || 'auto';
    const priority = priorityEl?.value || 'balanced';

    if (!startLocation) {
      showToast('❌ Please enter starting location', 'error');
      return;
    }

    showToast('🔄 Optimizing route... Please wait', 'info');

    try {
      const response = await fetch('https://freightflow-pkf5.onrender.com/api/routes/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Session.getToken()}`
        },
        body: JSON.stringify({
          startLocation,
          vehicleType,
          priority,
          timestamp: new Date().toISOString()
        })
      });

      const result = await response.json();
      if (result.success) {
        showToast('✅ Route optimized successfully!', 'success');
      } else {
        showToast('❌ Optimization failed: ' + result.error, 'error');
      }
    } catch (err) {
      console.error('Error optimizing route:', err);
      showToast('❌ Error: ' + err.message, 'error');
    }
  },

  removeStop: (stopId) => {
    showToast(`Stop ${stopId} removed`, 'info');
  },

  clearForm: () => {
    const startEl = document.getElementById('routeStart');
    const vehicleEl = document.getElementById('vehicleType');
    if (startEl) startEl.value = '';
    if (vehicleEl) vehicleEl.value = '';
  }
};
