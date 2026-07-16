// ============================================================
// Aetra — Shipment Tracking (New Feature)
// Multi-carrier tracking with live status, timeline, maps
// ============================================================

Pages.tracking = function(container) {
  const user = Session.get();
  console.log('Tracking page loaded, user:', user);
  if (!user) {
    console.warn('No user session, redirecting to login');
    return Router.navigate('login');
  }

  const trackingData = generateTrackingData();
  let selectedShipment = trackingData[0];
  let filterCarrier = 'all';
  let filterStatus = 'all';
  let searchLR = '';

  function generateTrackingData() {
    const carriers = ['Delhivery Ltd', 'BlueDart Express', 'DTDC Ltd', 'Gati Logistics', 'VRL Logistics', 'TCI Express'];
    const routes = [
      { from: 'Mumbai', to: 'Delhi', distance: 1400, days: 2 },
      { from: 'Chennai', to: 'Bangalore', distance: 350, days: 1 },
      { from: 'Delhi', to: 'Kolkata', distance: 1500, days: 3 },
      { from: 'Hyderabad', to: 'Pune', distance: 560, days: 2 },
      { from: 'Bangalore', to: 'Mumbai', distance: 980, days: 2 },
      { from: 'Mumbai', to: 'Ahmedabad', distance: 530, days: 1 }
    ];
    const statuses = ['in-transit', 'in-transit', 'in-transit', 'delivered', 'out-for-delivery', 'delayed'];
    const now = new Date();

    return Array.from({ length: 12 }, (_, i) => {
      const route = routes[i % routes.length];
      const carrier = carriers[i % carriers.length];
      const status = statuses[i % statuses.length];
      const dispDate = new Date(now.getTime() - (i + 1) * 86400000 * 0.5);
      const eta = new Date(dispDate.getTime() + route.days * 86400000);
      const progress = status === 'delivered' ? 100 : status === 'out-for-delivery' ? 85 : Math.floor(Math.random() * 50 + 30);
      const weight = (Math.random() * 4 + 0.2).toFixed(1);
      const value = Math.floor(Math.random() * 400000 + 25000);

      return {
        id: `SH-2024-${String(i + 847).padStart(4, '0')}`,
        lr: `LR${Math.floor(Math.random() * 900000000 + 100000000)}`,
        carrier,
        from: route.from,
        to: route.to,
        status,
        progress,
        dispDate: dispDate.toISOString().split('T')[0],
        eta: eta.toISOString().split('T')[0],
        weight: weight + ' MT',
        value,
        distance: route.distance,
        mode: carrier === 'BlueDart Express' ? 'Air' : i % 3 === 0 ? 'Express' : 'Road',
        checkpoints: generateCheckpoints(route.from, route.to, status, dispDate)
      };
    });
  }

  function generateCheckpoints(from, to, status, startDate) {
    const cities = getCitiesOnRoute(from, to);
    const now = new Date();
    return cities.map((city, i) => {
      const d = new Date(startDate.getTime() + i * 12 * 3600000);
      const done = d <= now && (status !== 'delayed' || i < cities.length - 1);
      return {
        city,
        time: d.toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        event: getCheckpointEvent(city, i, cities.length),
        done,
        current: done && i === cities.filter((_, idx) => {
          const dd = new Date(startDate.getTime() + idx * 12 * 3600000);
          return dd <= now;
        }).length - 1
      };
    });
  }

  function getCitiesOnRoute(from, to) {
    const routes_map = {
      'Mumbai-Delhi': ['Mumbai', 'Surat', 'Vadodara', 'Ahmedabad', 'Jaipur', 'Delhi'],
      'Chennai-Bangalore': ['Chennai', 'Vellore', 'Bangalore'],
      'Delhi-Kolkata': ['Delhi', 'Agra', 'Varanasi', 'Patna', 'Kolkata'],
      'Hyderabad-Pune': ['Hyderabad', 'Solapur', 'Pune'],
      'Bangalore-Mumbai': ['Bangalore', 'Pune', 'Mumbai'],
      'Mumbai-Ahmedabad': ['Mumbai', 'Surat', 'Ahmedabad']
    };
    return routes_map[`${from}-${to}`] || [from, to];
  }

  function getRouteNodes(from, to) {
    const routeNodes = {
      'Mumbai-Delhi': [
        { city: 'Mumbai', x: 40, y: 70 },
        { city: 'Surat', x: 90, y: 68 },
        { city: 'Vadodara', x: 135, y: 62 },
        { city: 'Ahmedabad', x: 180, y: 53 },
        { city: 'Jaipur', x: 220, y: 35 },
        { city: 'Delhi', x: 270, y: 25 }
      ],
      'Chennai-Bangalore': [
        { city: 'Chennai', x: 60, y: 85 },
        { city: 'Vellore', x: 110, y: 70 },
        { city: 'Bangalore', x: 160, y: 55 }
      ],
      'Delhi-Kolkata': [
        { city: 'Delhi', x: 265, y: 25 },
        { city: 'Agra', x: 235, y: 40 },
        { city: 'Varanasi', x: 280, y: 58 },
        { city: 'Patna', x: 305, y: 46 },
        { city: 'Kolkata', x: 325, y: 88 }
      ],
      'Hyderabad-Pune': [
        { city: 'Hyderabad', x: 180, y: 90 },
        { city: 'Solapur', x: 205, y: 78 },
        { city: 'Pune', x: 230, y: 65 }
      ],
      'Bangalore-Mumbai': [
        { city: 'Bangalore', x: 160, y: 55 },
        { city: 'Pune', x: 230, y: 65 },
        { city: 'Mumbai', x: 40, y: 70 }
      ],
      'Mumbai-Ahmedabad': [
        { city: 'Mumbai', x: 40, y: 70 },
        { city: 'Surat', x: 90, y: 68 },
        { city: 'Ahmedabad', x: 180, y: 53 }
      ]
    };
    return routeNodes[`${from}-${to}`] || [{ city: from, x: 40, y: 70 }, { city: to, x: 260, y: 40 }];
  }

  const CITY_COORDINATES = {
    Mumbai: [19.0760, 72.8777],
    Surat: [21.1702, 72.8311],
    Vadodara: [22.3072, 73.1812],
    Ahmedabad: [23.0225, 72.5714],
    Jaipur: [26.9124, 75.7873],
    Delhi: [28.7041, 77.1025],
    Chennai: [13.0827, 80.2707],
    Vellore: [12.9165, 79.1325],
    Bangalore: [12.9716, 77.5946],
    Kolkata: [22.5726, 88.3639],
    Agra: [27.1767, 78.0081],
    Varanasi: [25.3176, 82.9739],
    Patna: [25.5941, 85.1376],
    Hyderabad: [17.3850, 78.4867],
    Solapur: [17.6599, 75.9064],
    Pune: [18.5204, 73.8567]
  };

  function getRouteCoordinates(from, to) {
    return getCitiesOnRoute(from, to)
      .map(city => CITY_COORDINATES[city])
      .filter(coord => coord && coord.length === 2);
  }

  function createLeafletRouteMap(el, shipment, options = {}) {
    if (!el || typeof L === 'undefined') return;
    try {
      if (el._leafletMap) {
        el._leafletMap.remove();
        el._leafletMap = null;
      }

      const coords = getRouteCoordinates(shipment.from, shipment.to);
      if (coords.length === 0) return;

      const map = L.map(el, {
        zoomControl: !options.mini,
        attributionControl: !options.mini,
        dragging: true,
        scrollWheelZoom: options.interactive || false,
        trackResize: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      const path = L.polyline(coords, { color: '#2563eb', weight: 4, opacity: 0.9 }).addTo(map);
      coords.forEach((coord, index) => {
        const cities = getCitiesOnRoute(shipment.from, shipment.to);
        const city = cities[index];
        L.circleMarker(coord, {
          radius: index === 0 || index === coords.length - 1 ? 6 : 4,
          color: index === 0 || index === coords.length - 1 ? '#f97316' : '#1d4ed8',
          fillColor: '#fff',
          fillOpacity: 1,
          weight: 2
        }).addTo(map).bindPopup(`<strong>${city}</strong><br>${index === 0 ? 'Origin' : index === coords.length - 1 ? 'Destination' : 'Hub'}`);
      });

      map.fitBounds(path.getBounds(), { padding: [20, 20] });
      el._leafletMap = map;
      setTimeout(() => { if (el._leafletMap) el._leafletMap.invalidateSize(); }, 100);
    } catch (e) {
      console.error('Map init error:', e);
    }
  }

  function initMiniRouteMaps() {
    if (typeof L === 'undefined') return;
    try {
      document.querySelectorAll('.tracking-mini-map').forEach((el) => {
        if (el.dataset.leafletInited === 'true') return;
        const id = el.dataset.shipment;
        const shipment = trackingData.find((s) => s.id === id);
        if (shipment && el.offsetParent !== null) {
          createLeafletRouteMap(el, shipment, { mini: true, interactive: false });
          el.dataset.leafletInited = 'true';
        }
      });
    } catch (e) {
      console.error('Mini maps init error:', e);
    }
  }

  function getRoutePoint(nodes, progress) {
    if (!nodes || nodes.length === 0) return { x: 0, y: 0 };
    const totalSegments = nodes.length - 1;
    if (totalSegments <= 0) return nodes[0];
    const totalProgress = progress / 100;
    const segmentIndex = Math.min(totalSegments - 1, Math.floor(totalProgress * totalSegments));
    const localProgress = (totalProgress * totalSegments) - segmentIndex;
    const start = nodes[segmentIndex];
    const end = nodes[segmentIndex + 1];
    return {
      x: start.x + (end.x - start.x) * localProgress,
      y: start.y + (end.y - start.y) * localProgress
    };
  }

  function renderRouteMap(s) {
    const mapTitle = `${s.from} → ${s.to}`;

    return `
      <div style="display:grid;gap:14px">
        <div class="tracking-mini-map" id="trackingRouteMap_${s.id}" data-shipment="${s.id}" style="height:220px;border-radius:16px;overflow:hidden;background:#f8fafc;border:1px solid rgba(15,23,42,.06);"></div>
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px">
          <div>
            <div style="font-size:13px;font-weight:700;color:#0f172a">${mapTitle}</div>
            <div style="font-size:11px;color:#64748b">Interactive map powered by OpenStreetMap tiles</div>
          </div>
          <button class="btn btn-outline btn-sm" onclick="openFullRouteMap('${s.id}')">Full Map</button>
        </div>
      </div>
    `;
  }

  function getCheckpointEvent(city, idx, total) {
    if (idx === 0) return 'Picked up from warehouse';
    if (idx === total - 1) return 'Out for delivery';
    return ['In transit via hub', 'Departed from facility', 'Arrived at hub', 'Customs cleared'][idx % 4];
  }

  function render() {
    try {
      const filtered = trackingData.filter(s => {
        const matchCarrier = filterCarrier === 'all' || s.carrier === filterCarrier;
        const matchStatus = filterStatus === 'all' || s.status === filterStatus;
        const matchSearch = !searchLR || s.lr.toLowerCase().includes(searchLR.toLowerCase()) ||
          s.id.toLowerCase().includes(searchLR.toLowerCase()) ||
          s.from.toLowerCase().includes(searchLR.toLowerCase()) ||
          s.to.toLowerCase().includes(searchLR.toLowerCase());
        return matchCarrier && matchStatus && matchSearch;
      });

      const stats = {
        total: trackingData.length,
        inTransit: trackingData.filter(s => s.status === 'in-transit').length,
        delivered: trackingData.filter(s => s.status === 'delivered').length,
        delayed: trackingData.filter(s => s.status === 'delayed').length
      };

      if (!container) {
        console.error('Container not found');
        return;
      }

      container.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h2>Shipment Tracking</h2>
        <p>Live status across ${stats.total} active shipments • Multi-carrier tracking</p>
      </div>
      <div class="page-header-right">
        <button class="btn btn-outline" onclick="openTrackByLR()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          Track by LR#
        </button>
        <button class="btn btn-primary" onclick="showToast('Shipment tracking report exported','success')">📥 Export</button>
      </div>
    </div>

    <!-- STATS -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-bottom:28px">
      ${[
        { icon:'🚛', label:'Total Shipments', val:stats.total, sub:'Active this month', c:'var(--primary)', bg:'#eff6ff' },
        { icon:'✈️', label:'In Transit', val:stats.inTransit, sub:'Currently moving', c:'#3b82f6', bg:'#dbeafe' },
        { icon:'✅', label:'Delivered', val:stats.delivered, sub:'Successfully delivered', c:'var(--success)', bg:'#f0fdf4' },
        { icon:'⚠️', label:'Delayed', val:stats.delayed, sub:'Need attention', c:'var(--danger)', bg:'#fef2f2' }
      ].map(k => `
        <div class="card" style="padding:20px;transition:all .15s;cursor:pointer" onclick="setTrackFilter('status','${k.label.toLowerCase().replace(' ','')}')" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 24px rgba(0,0,0,.08)'" onmouseout="this.style.transform='';this.style.boxShadow=''">
          <div style="display:flex;align-items:center;gap:12px">
            <div style="width:44px;height:44px;border-radius:10px;background:${k.bg};display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">${k.icon}</div>
            <div>
              <div style="font-size:26px;font-weight:800;color:${k.c}">${k.val}</div>
              <div style="font-size:12px;color:var(--text-muted)">${k.label}</div>
              <div style="font-size:11px;color:var(--text-light);margin-top:1px">${k.sub}</div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>

    <!-- LAYOUT: LIST + DETAIL -->
    <div style="display:grid;grid-template-columns:400px 1fr;gap:24px;align-items:start">
      <!-- SHIPMENT LIST -->
      <div>
        <!-- Filters -->
        <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:14px">
          <div style="position:relative">
            <input class="filter-input w-full" style="padding-left:32px" type="text" placeholder="Search LR#, route..." id="lrSearch" value="${searchLR}" oninput="updateLRSearch(this.value)">
            <svg style="position:absolute;left:10px;top:50%;transform:translateY(-50%)" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <div style="display:flex;gap:8px">
            <select class="filter-select" style="flex:1" onchange="setTrackFilter('carrier',this.value)">
              <option value="all">All Carriers</option>
              ${['Delhivery Ltd','BlueDart Express','DTDC Ltd','Gati Logistics','VRL Logistics','TCI Express'].map(c=>`<option value="${c}" ${filterCarrier===c?'selected':''}>${c}</option>`).join('')}
            </select>
            <select class="filter-select" style="flex:1" onchange="setTrackFilter('status',this.value)">
              <option value="all">All Status</option>
              ${['in-transit','delivered','out-for-delivery','delayed'].map(s=>`<option value="${s}" ${filterStatus===s?'selected':''}>${s.replace('-',' ')}</option>`).join('')}
            </select>
          </div>
        </div>

        <!-- List -->
        <div style="display:flex;flex-direction:column;gap:8px;max-height:580px;overflow-y:auto;padding-right:2px">
          ${filtered.map(s => `
            <div style="padding:14px;border-radius:12px;border:2px solid ${selectedShipment && selectedShipment.id===s.id?'var(--primary)':'var(--border)'};background:${selectedShipment && selectedShipment.id===s.id?'#eff6ff':'#fff'};cursor:pointer;transition:all .15s" onclick="selectShipment('${s.id}')" onmouseover="this.style.borderColor='#94a3b8'" onmouseout="this.style.borderColor='${selectedShipment && selectedShipment.id===s.id?'var(--primary)':'var(--border)'}'">
              <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px">
                <div>
                  <div style="font-size:13px;font-weight:700;color:var(--primary)">${s.id}</div>
                  <div style="font-size:11px;color:var(--text-muted);margin-top:1px">LR: ${s.lr}</div>
                </div>
                ${getTrackStatusBadge(s.status)}
              </div>
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
                <span style="font-size:12px;font-weight:600">${s.from}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                <span style="font-size:12px;font-weight:600">${s.to}</span>
                <span style="font-size:11px;color:var(--text-muted);margin-left:4px">• ${s.distance} km</span>
              </div>
              <div style="height:5px;background:#e2e8f0;border-radius:999px;overflow:hidden;margin-bottom:6px">
                <div style="height:100%;width:${s.progress}%;background:${s.status==='delayed'?'#ef4444':s.status==='delivered'?'#10b981':'#3b82f6'};border-radius:999px;transition:width 1s ease"></div>
              </div>
              <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-muted)">
                <span>${s.carrier.split(' ')[0]} • ${s.mode}</span>
                <span>ETA: ${s.eta}</span>
              </div>
            </div>
          `).join('')}
          ${filtered.length === 0 ? `<div style="text-align:center;padding:40px;color:var(--text-muted)"><div style="font-size:32px;margin-bottom:8px">🔍</div><div>No shipments found</div></div>` : ''}
        </div>
      </div>

      <!-- SHIPMENT DETAIL -->
      <div id="shipmentDetail">
        ${renderShipmentDetail(selectedShipment)}
      </div>
    </div>`;

    setTimeout(() => { 
      try {
        initMiniRouteMaps();
      } catch (e) {
        console.error('Error initializing mini maps:', e);
      }
    }, 200);

    // Wire handlers
    window.selectShipment = (id) => {
      selectedShipment = trackingData.find(s => s.id === id);
      render();
    };
    window.setTrackFilter = (type, val) => {
      if (type === 'carrier') filterCarrier = val;
      if (type === 'status') filterStatus = val;
      render();
    };
    window.updateLRSearch = (v) => { searchLR = v; render(); };
    window.openTrackByLR = () => openTrackByLRModal();
    } catch (e) {
      console.error('Render error:', e);
      container.innerHTML = `<div style="padding:20px;color:red"><strong>Error loading tracking page:</strong> ${e.message}</div>`;
    }
  }

  function getTrackStatusBadge(status) {
    const map = {
      'in-transit': '<span class="badge badge-info">🚛 In Transit</span>',
      'delivered': '<span class="badge badge-success">✅ Delivered</span>',
      'out-for-delivery': '<span class="badge badge-warning">🏃 Out for Delivery</span>',
      'delayed': '<span class="badge badge-danger">⚠️ Delayed</span>'
    };
    return map[status] || `<span class="badge badge-gray">${status}</span>`;
  }

  function renderShipmentDetail(s) {
    if (!s) return `<div class="card card-body" style="text-align:center;padding:60px"><div style="font-size:48px;margin-bottom:16px">🚛</div><div style="font-size:15px;font-weight:600;margin-bottom:8px">Select a shipment</div><div style="font-size:13px;color:var(--text-muted)">Click any shipment from the list to view details and live tracking</div></div>`;

    const doneCP = s.checkpoints.filter(c => c.done).length;
    const totalCP = s.checkpoints.length;

    return `
    <div style="display:flex;flex-direction:column;gap:20px">
      <!-- Header Card -->
      <div class="card" style="overflow:hidden">
        <div style="padding:0">
          <div style="background:linear-gradient(135deg,#0f1f33,#1e3a5f);padding:20px 24px;position:relative">
            <div style="position:absolute;right:-20px;top:-20px;width:120px;height:120px;border-radius:50%;background:rgba(249,115,22,.08)"></div>
            <div style="display:flex;justify-content:space-between;align-items:start;flex-wrap:wrap;gap:12px;position:relative;z-index:1">
              <div>
                <div style="font-size:11px;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Shipment ID</div>
                <div style="font-size:20px;font-weight:800;color:#fff;margin-bottom:4px">${s.id}</div>
                <div style="font-size:13px;color:rgba(255,255,255,.6)">LR: <strong style="color:#fff">${s.lr}</strong></div>
              </div>
              <div style="text-align:right">
                ${getTrackStatusBadge(s.status)}
                <div style="font-size:22px;font-weight:800;color:#f97316;margin-top:8px">${s.progress}%</div>
                <div style="font-size:11px;color:rgba(255,255,255,.5)">Journey complete</div>
              </div>
            </div>
            <!-- Route Bar -->
            <div style="margin-top:16px;position:relative;z-index:1">
              <div style="display:flex;justify-content:space-between;margin-bottom:8px">
                <div>
                  <div style="font-size:18px;font-weight:800;color:#fff">${s.from}</div>
                  <div style="font-size:11px;color:rgba(255,255,255,.5)">Origin</div>
                </div>
                <div style="text-align:center;color:rgba(255,255,255,.4);font-size:12px">
                  <div>──── ${s.distance} km ────</div>
                  <div style="font-size:11px;margin-top:4px">${s.mode}</div>
                </div>
                <div style="text-align:right">
                  <div style="font-size:18px;font-weight:800;color:#fff">${s.to}</div>
                  <div style="font-size:11px;color:rgba(255,255,255,.5)">Destination</div>
                </div>
              </div>
              <div style="height:6px;background:rgba(255,255,255,.1);border-radius:999px;overflow:hidden">
                <div style="height:100%;width:${s.progress}%;background:linear-gradient(90deg,#f97316,#fbbf24);border-radius:999px;transition:width 1.2s ease"></div>
              </div>
              <div style="display:flex;justify-content:space-between;margin-top:6px;font-size:11px;color:rgba(255,255,255,.4)">
                <span>Dispatched: ${s.dispDate}</span>
                <span>ETA: ${s.eta}</span>
              </div>
            </div>
          </div>
          <!-- Info Row -->
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:0;border-top:1px solid var(--border)">
            ${[
              { label:'Carrier', val: s.carrier.split(' ')[0] },
              { label:'Weight', val: s.weight },
              { label:'Value', val: API._fmt(s.value) },
              { label:'Mode', val: s.mode }
            ].map(f => `
              <div style="padding:14px 16px;border-right:1px solid var(--border);text-align:center">
                <div style="font-size:14px;font-weight:700">${f.val}</div>
                <div style="font-size:11px;color:var(--text-muted);margin-top:2px">${f.label}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Route Map -->
      <div class="card" style="overflow:hidden">
        <div style="padding:16px 20px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
          <div style="font-size:14px;font-weight:700">🗺️ Route Map — ${s.from} to ${s.to}</div>
          <button class="btn btn-outline btn-sm" onclick="openFullRouteMap('${s.id}')">View Full Route</button>
        </div>
        <div style="padding:16px 18px">
          ${renderRouteMap(s)}
        </div>
      </div>

      <!-- Tracking Timeline -->
      <div class="card card-body">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
          <div>
            <div style="font-size:15px;font-weight:700">📍 Tracking Timeline</div>
            <div style="font-size:13px;color:var(--text-muted);margin-top:2px">${doneCP} of ${totalCP} checkpoints completed</div>
          </div>
          <span class="badge badge-success" style="font-size:12px">${s.progress}% Complete</span>
        </div>
        <div style="position:relative;padding-left:28px">
          <!-- Line -->
          <div style="position:absolute;left:10px;top:0;bottom:0;width:2px;background:linear-gradient(to bottom,var(--primary) ${s.progress}%,#e2e8f0 ${s.progress}%)"></div>
          ${s.checkpoints.map((cp, idx) => `
            <div style="position:relative;margin-bottom:${idx < s.checkpoints.length-1 ? '20' : '0'}px">
              <div style="position:absolute;left:-24px;width:18px;height:18px;border-radius:50%;background:${cp.done?'var(--primary)':'#e2e8f0'};border:3px solid ${cp.done?'#fff':'#e2e8f0'};box-shadow:${cp.done?'0 0 0 2px var(--primary)':'none'};display:flex;align-items:center;justify-content:center;top:2px">
                ${cp.done ? `<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>` : ''}
              </div>
              <div style="background:${cp.done?'#f0fdf4':'#f8fafc'};padding:12px 14px;border-radius:8px;border-left:3px solid ${cp.done?'var(--primary)':'#e2e8f0'}">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
                  <div>
                    <div style="font-size:13px;font-weight:700;color:${cp.done?'var(--text)':'var(--text-muted)'}">${cp.city}</div>
                    <div style="font-size:12px;color:var(--text-muted);margin-top:2px">${cp.event}</div>
                  </div>
                  <div style="font-size:11px;color:var(--text-muted);text-align:right">
                    <div>${cp.time}</div>
                    ${cp.done ? '<span style="color:var(--success);font-weight:600">✓ Done</span>' : '<span style="color:var(--text-muted)">Upcoming</span>'}
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
        <div style="margin-top:20px;display:flex;gap:10px">
          <button class="btn btn-outline" style="flex:1;justify-content:center" onclick="showToast('Tracking link copied to clipboard','success')">🔗 Share Tracking</button>
          <button class="btn btn-primary" style="flex:1;justify-content:center" onclick="showToast('POD document downloaded','success')">📄 Download POD</button>
        </div>
      </div>
    </div>`;
  }

  function openTrackByLRModal() {
    openModal(`
      <div class="modal modal-sm">
        <div class="modal-header"><div class="modal-title">🔍 Track Shipment by LR#</div><button class="modal-close" onclick="closeModal()">✕</button></div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">LR Number / AWB / Reference</label>
            <input class="form-input" id="trackLRInput" placeholder="e.g. LR123456789" oninput="this.value=this.value.toUpperCase()">
            <div class="form-hint">Enter the LR number from your invoice</div>
          </div>
          <div class="form-group">
            <label class="form-label">Carrier (Optional)</label>
            <select class="form-input" id="trackCarrierSel">
              <option value="">Auto-detect</option>
              ${['Delhivery Ltd','BlueDart Express','DTDC Ltd','Gati Logistics','VRL Logistics','TCI Express'].map(c=>`<option>${c}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
          <button class="btn btn-primary" onclick="trackByLR()">🔍 Track Now</button>
        </div>
      </div>`);

    window.trackByLR = () => {
      const lr = document.getElementById('trackLRInput')?.value?.trim();
      if (!lr) { showToast('Enter LR number', 'error'); return; }
      const found = trackingData.find(s => s.lr === lr || s.id === lr);
      if (found) {
        selectedShipment = found;
        closeModal();
        render();
        showToast(`Found: ${found.id} — ${found.from} → ${found.to}`);
      } else {
        showToast(`Tracking info for ${lr} will be available soon`, 'info');
        closeModal();
      }
    };
  }

  window.openFullRouteMap = (id) => {
    const shipment = trackingData.find(s => s.id === id);
    if (!shipment) return;
    openModal(`
      <div class="modal modal-lg" style="max-width:900px;">
        <div class="modal-header"><div class="modal-title">📍 Full Route Map — ${shipment.from} to ${shipment.to}</div><button class="modal-close" onclick="closeModal()">✕</button></div>
        <div class="modal-body" style="padding:0;">
          <div id="routeMapModal_${id}" style="height:420px;border-radius:16px;overflow:hidden;background:#f8fafc;border:1px solid rgba(15,23,42,.06);"></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:18px;">
            <div style="background:#fff;padding:16px;border-radius:12px;box-shadow:0 8px 24px rgba(15,23,42,.06);">
              <div style="font-size:13px;font-weight:700;margin-bottom:8px">Route Summary</div>
              <div style="font-size:12px;color:#475569;line-height:1.6">
                Shortest path across ${shipment.from} → ${shipment.to} with ${getCitiesOnRoute(shipment.from, shipment.to).length} stops.
                Estimated transit ${shipment.mode === 'Air' ? 'flight' : 'road'} time based on ${shipment.distance} km distance.
              </div>
            </div>
            <div style="background:#fff;padding:16px;border-radius:12px;box-shadow:0 8px 24px rgba(15,23,42,.06);">
              <div style="font-size:13px;font-weight:700;margin-bottom:8px">Current Delivery</div>
              <div style="font-size:12px;color:#475569;line-height:1.6">
                <strong>Status:</strong> ${shipment.status.replace(/-/g, ' ')}<br>
                <strong>ETA:</strong> ${shipment.eta}<br>
                <strong>Progress:</strong> ${shipment.progress}%<br>
                <strong>LR#:</strong> ${shipment.lr}
              </div>
            </div>
          </div>
        </div>
      </div>`);

    setTimeout(() => {
      try {
        const modalMap = document.getElementById(`routeMapModal_${id}`);
        if (modalMap) createLeafletRouteMap(modalMap, shipment, { mini: false, interactive: true });
      } catch (e) {
        console.error('Full map init error:', e);
      }
    }, 100);
  }

  render();
};
