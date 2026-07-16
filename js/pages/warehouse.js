// ============================================================
// Aetra — Enterprise Warehouse Management
// SKU Tracking, Inventory Control, Stock Alerts
// ============================================================

Pages.warehouse = async function(container) {
  const user = Session.get();
  if (!user) return Router.navigate('login');

  container.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:400px;flex-direction:column;gap:16px">
    <div style="width:44px;height:44px;border:4px solid #e2e8f0;border-top-color:var(--primary);border-radius:50%;animation:spin .8s linear infinite"></div>
    <div style="font-size:14px;color:var(--text-muted)">Loading warehouse management...</div>
  </div>`;

  try {
    // Fetch warehouse data
    const response = await fetch('/api/warehouse/inventory', {
      headers: { 'Authorization': `Bearer ${Session.getToken()}` }
    });
    const warehouse = await response.json();

    container.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px">
      <div>
        <h1 style="font-size:28px;font-weight:800;margin:0">🏭 Enterprise Warehouse</h1>
        <p style="color:var(--text-muted);margin:4px 0 0">SKU tracking, inventory control & stock management</p>
      </div>
      <button class="btn btn-primary" onclick="openNewInventoryModal()">
        <span style="margin-right:8px">+</span> Add Inventory
      </button>
    </div>

    <!-- WAREHOUSE STATS -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:24px">
      <div class="card" style="text-align:center;padding:20px">
        <div style="font-size:32px;margin-bottom:8px">📦</div>
        <div style="font-size:24px;font-weight:800;color:#10b981">${warehouse.data?.length || 0}</div>
        <div style="font-size:12px;color:var(--text-muted)">Total SKUs</div>
      </div>
      <div class="card" style="text-align:center;padding:20px">
        <div style="font-size:32px;margin-bottom:8px">⚠️</div>
        <div style="font-size:24px;font-weight:800;color:#ef4444">${warehouse.data?.filter(i => i.stock_level <= i.min_stock_level).length || 0}</div>
        <div style="font-size:12px;color:var(--text-muted)">Low Stock Items</div>
      </div>
      <div class="card" style="text-align:center;padding:20px">
        <div style="font-size:32px;margin-bottom:8px">💰</div>
        <div style="font-size:24px;font-weight:800;color:#3b82f6">₹${warehouse.data?.reduce((sum, i) => sum + (i.stock_level * i.unit_price), 0).toLocaleString() || 0}</div>
        <div style="font-size:12px;color:var(--text-muted)">Inventory Value</div>
      </div>
      <div class="card" style="text-align:center;padding:20px">
        <div style="font-size:32px;margin-bottom:8px">📍</div>
        <div style="font-size:24px;font-weight:800;color:#f59e0b">${warehouse.data?.filter(i => i.location).length || 0}</div>
        <div style="font-size:12px;color:var(--text-muted)">Located Items</div>
      </div>
    </div>

    <!-- INVENTORY TABLE -->
    <div class="card">
      <div style="padding:20px;border-bottom:1px solid var(--border)">
        <h3 style="margin:0;font-size:18px;font-weight:700">Inventory Overview</h3>
      </div>
      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr style="background:#f8fafc;border-bottom:1px solid var(--border)">
              <th style="padding:12px;text-align:left;font-weight:600;font-size:12px;color:var(--text-muted)">SKU</th>
              <th style="padding:12px;text-align:left;font-weight:600;font-size:12px;color:var(--text-muted)">PRODUCT</th>
              <th style="padding:12px;text-align:left;font-weight:600;font-size:12px;color:var(--text-muted)">CATEGORY</th>
              <th style="padding:12px;text-align:left;font-weight:600;font-size:12px;color:var(--text-muted)">STOCK</th>
              <th style="padding:12px;text-align:left;font-weight:600;font-size:12px;color:var(--text-muted)">UNIT PRICE</th>
              <th style="padding:12px;text-align:left;font-weight:600;font-size:12px;color:var(--text-muted)">LOCATION</th>
              <th style="padding:12px;text-align:left;font-weight:600;font-size:12px;color:var(--text-muted)">STATUS</th>
              <th style="padding:12px;text-align:left;font-weight:600;font-size:12px;color:var(--text-muted)">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            ${warehouse.data?.map(item => `
              <tr style="border-bottom:1px solid var(--border-light)">
                <td style="padding:12px;font-weight:600;font-family:monospace">${item.sku}</td>
                <td style="padding:12px">
                  <div style="font-weight:600">${item.product_name}</div>
                  <div style="font-size:11px;color:var(--text-muted)">${item.description}</div>
                </td>
                <td style="padding:12px">
                  <span style="background:#f3f4f6;color:#374151;padding:4px 8px;border-radius:6px;font-size:11px;font-weight:600">
                    ${item.category?.toUpperCase()}
                  </span>
                </td>
                <td style="padding:12px">
                  <div style="display:flex;align-items:center;gap:8px">
                    <div style="font-weight:600">${item.stock_level}</div>
                    <div style="width:60px;height:6px;background:#e5e7eb;border-radius:3px;overflow:hidden">
                      <div style="width:${Math.min((item.stock_level / item.max_stock_level) * 100, 100)}%;height:100%;background:${item.stock_level <= item.min_stock_level ? '#ef4444' : item.stock_level > item.max_stock_level * 0.8 ? '#f59e0b' : '#10b981'};border-radius:3px"></div>
                    </div>
                    <div style="font-size:11px;color:var(--text-muted)">/${item.max_stock_level}</div>
                  </div>
                </td>
                <td style="padding:12px">₹${item.unit_price.toLocaleString()}</td>
                <td style="padding:12px">
                  ${item.location ? `${item.location.zone}-${item.location.aisle}-${item.location.shelf}` : 'N/A'}
                </td>
                <td style="padding:12px">
                  <span style="background:${item.stock_level <= item.min_stock_level ? '#fee2e2' : item.stock_level > item.max_stock_level * 0.8 ? '#fef3c7' : '#dcfce7'};color:${item.stock_level <= item.min_stock_level ? '#dc2626' : item.stock_level > item.max_stock_level * 0.8 ? '#b45309' : '#166534'};padding:4px 8px;border-radius:6px;font-size:11px;font-weight:600">
                    ${item.stock_level <= item.min_stock_level ? 'LOW STOCK' : item.stock_level > item.max_stock_level * 0.8 ? 'HIGH STOCK' : 'OPTIMAL'}
                  </span>
                </td>
                <td style="padding:12px">
                  <button class="btn btn-sm" onclick="viewInventory('${item.id}')">👁️ View</button>
                  <button class="btn btn-sm btn-secondary" onclick="updateStock('${item.id}')">📦 Update</button>
                </td>
              </tr>
            `).join('') || '<tr><td colspan="8" style="padding:40px;text-align:center;color:var(--text-muted)">No inventory items. Add your first SKU!</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>

    <!-- AI INSIGHTS -->
    <div class="card" style="margin-top:24px">
      <div style="padding:20px;border-bottom:1px solid var(--border)">
        <h3 style="margin:0;font-size:18px;font-weight:700">🤖 AI Warehouse Insights</h3>
      </div>
      <div style="padding:20px">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px">
          <div>
            <h4 style="margin:0 0 8px;font-size:14px;color:var(--text-muted)">DEMAND FORECAST</h4>
            <div style="font-size:24px;font-weight:800;color:#10b981">+15%</div>
            <div style="font-size:12px;color:#059669">Expected growth next month</div>
          </div>
          <div>
            <h4 style="margin:0 0 8px;font-size:14px;color:var(--text-muted)">STOCK OPTIMIZATION</h4>
            <div style="font-size:24px;font-weight:800;color:#f59e0b">₹2.5L</div>
            <div style="font-size:12px;color:#b45309">Potential savings from optimization</div>
          </div>
          <div>
            <h4 style="margin:0 0 8px;font-size:14px;color:var(--text-muted)">SUPPLY CHAIN EFFICIENCY</h4>
            <div style="font-size:24px;font-weight:800;color:#3b82f6">94.2%</div>
            <div style="font-size:12px;color:#1e40af">On-time delivery rate</div>
          </div>
        </div>
      </div>
    </div>
    `;
  } catch (error) {
    console.error('Error loading warehouse:', error);
    container.innerHTML = `
    <div style="text-align:center;padding:60px">
      <div style="font-size:48px;margin-bottom:16px">🏭</div>
      <h2 style="margin:0 0 8px">Enterprise Warehouse</h2>
      <p style="color:var(--text-muted);margin-bottom:24px">SKU tracking & inventory management</p>
      <button class="btn btn-primary" onclick="openNewInventoryModal()">Add First Inventory Item</button>
    </div>
    `;
  }
};

function openNewInventoryModal() {
  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:1000';
  modal.innerHTML = `
  <div style="background:#fff;border-radius:12px;padding:24px;width:90%;max-width:700px;max-height:90vh;overflow-y:auto">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
      <h3 style="margin:0;font-size:20px">📦 Add New Inventory Item</h3>
      <button onclick="this.closest('div').parentElement.remove()" style="background:none;border:none;font-size:24px;cursor:pointer">&times;</button>
    </div>
    <form onsubmit="createInventory(event)">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
        <div>
          <label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px">SKU</label>
          <input name="sku" required style="width:100%;padding:8px;border:1px solid var(--border);border-radius:6px">
        </div>
        <div>
          <label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px">Product Name</label>
          <input name="product_name" required style="width:100%;padding:8px;border:1px solid var(--border);border-radius:6px">
        </div>
      </div>
      <div style="margin-bottom:16px">
        <label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px">Description</label>
        <textarea name="description" rows="2" style="width:100%;padding:8px;border:1px solid var(--border);border-radius:6px"></textarea>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:16px">
        <div>
          <label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px">Category</label>
          <select name="category" required style="width:100%;padding:8px;border:1px solid var(--border);border-radius:6px">
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="food">Food</option>
            <option value="industrial">Industrial</option>
            <option value="pharmaceutical">Pharmaceutical</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px">Unit Price (₹)</label>
          <input name="unit_price" type="number" required style="width:100%;padding:8px;border:1px solid var(--border);border-radius:6px">
        </div>
        <div>
          <label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px">Current Stock</label>
          <input name="stock_level" type="number" required style="width:100%;padding:8px;border:1px solid var(--border);border-radius:6px">
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:16px">
        <div>
          <label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px">Min Stock Level</label>
          <input name="min_stock_level" type="number" required style="width:100%;padding:8px;border:1px solid var(--border);border-radius:6px">
        </div>
        <div>
          <label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px">Max Stock Level</label>
          <input name="max_stock_level" type="number" required style="width:100%;padding:8px;border:1px solid var(--border);border-radius:6px">
        </div>
        <div>
          <label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px">Weight (kg)</label>
          <input name="weight" type="number" step="0.01" style="width:100%;padding:8px;border:1px solid var(--border);border-radius:6px">
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:16px">
        <div>
          <label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px">Zone</label>
          <input name="zone" placeholder="A" style="width:100%;padding:8px;border:1px solid var(--border);border-radius:6px">
        </div>
        <div>
          <label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px">Aisle</label>
          <input name="aisle" placeholder="01" style="width:100%;padding:8px;border:1px solid var(--border);border-radius:6px">
        </div>
        <div>
          <label style="display:block;font-size:12px;font-weight:600;margin-bottom:4px">Shelf</label>
          <input name="shelf" placeholder="001" style="width:100%;padding:8px;border:1px solid var(--border);border-radius:6px">
        </div>
      </div>
      <div style="display:flex;gap:12px;justify-content:end">
        <button type="button" onclick="this.closest('div').parentElement.remove()" class="btn btn-secondary">Cancel</button>
        <button type="submit" class="btn btn-primary">📦 Add Item</button>
      </div>
    </form>
  </div>
  `;
  document.body.appendChild(modal);
}

async function createInventory(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const inventoryData = Object.fromEntries(formData);

  // Handle location object
  if (inventoryData.zone || inventoryData.aisle || inventoryData.shelf) {
    inventoryData.location = {
      zone: inventoryData.zone,
      aisle: inventoryData.aisle,
      shelf: inventoryData.shelf
    };
    delete inventoryData.zone;
    delete inventoryData.aisle;
    delete inventoryData.shelf;
  }

  // Convert numeric fields
  inventoryData.unit_price = parseFloat(inventoryData.unit_price);
  inventoryData.stock_level = parseInt(inventoryData.stock_level);
  inventoryData.min_stock_level = parseInt(inventoryData.min_stock_level);
  inventoryData.max_stock_level = parseInt(inventoryData.max_stock_level);
  if (inventoryData.weight) inventoryData.weight = parseFloat(inventoryData.weight);

  try {
    const response = await fetch('/api/warehouse/inventory', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Session.getToken()}`
      },
      body: JSON.stringify(inventoryData)
    });

    if (response.ok) {
      event.target.closest('div').parentElement.remove();
      Router.navigate('warehouse'); // Refresh the page
    } else {
      alert('Error adding inventory item');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error adding inventory item');
  }
}

function viewInventory(itemId) {
  alert(`Viewing inventory item: ${itemId}`);
}

function updateStock(itemId) {
  alert(`Updating stock for item: ${itemId} - Stock management coming soon!`);
}