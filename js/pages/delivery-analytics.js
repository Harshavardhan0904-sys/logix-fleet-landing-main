/**
 * Enterprise Logistics Analytics Dashboard
 * Comprehensive analytics on fleet operations, costs, utilization, compliance
 * Feature: Real-time KPIs, regional trends, client performance, predictive insights
 */

const DeliveryAnalytics = {
  render: () => {
    const user = Session.get();
    if (!user) {
      return Router.navigate('login');
    }

    return `
      <div class="page-container">
        <div class="page-header">
          <h1>📊 Enterprise Fleet Analytics</h1>
          <p>Real-time logistics intelligence, cost analysis, fleet optimization</p>
        </div>

        <!-- Date Range Selector -->
        <div style="background:white; border-radius:8px; border:1px solid #ddd; padding:12px; margin-bottom:20px; display:flex; gap:12px; align-items:center;">
          <label style="font-size:12px; font-weight:600;">📅 Date Range:</label>
          <input type="date" id="startDate" style="padding:6px; border:1px solid #ddd; border-radius:4px; font-size:12px;">
          <span>to</span>
          <input type="date" id="endDate" style="padding:6px; border:1px solid #ddd; border-radius:4px; font-size:12px;">
          <select id="analyticsQuickFilter" style="padding:6px; border:1px solid #ddd; border-radius:4px; font-size:12px; margin-left:auto;">
            <option>This Week</option>
            <option>This Month</option>
            <option>Last Quarter</option>
            <option>This Year</option>
            <option>Custom</option>
          </select>
          <button class="btn btn-primary" onclick="DeliveryAnalytics.updateAnalytics()">🔄 Refresh</button>
        </div>

        <!-- ENTERPRISE KPIs -->
        <div style="display:grid; grid-template-columns: repeat(8, 1fr); gap:10px; margin-bottom:20px;">
          <div style="background:white; border-radius:8px; padding:12px; border:1px solid #ddd; text-align:center;">
            <div style="font-size:22px; font-weight:600; color:#2196F3;">247</div>
            <div style="font-size:10px; color:#666; margin-top:4px;">Active Shipments</div>
          </div>
          <div style="background:white; border-radius:8px; padding:12px; border:1px solid #ddd; text-align:center;">
            <div style="font-size:22px; font-weight:600; color:#4CAF50;">89%</div>
            <div style="font-size:10px; color:#666; margin-top:4px;">Fleet Utilization</div>
          </div>
          <div style="background:white; border-radius:8px; padding:12px; border:1px solid #ddd; text-align:center;">
            <div style="font-size:22px; font-weight:600; color:#FF9800;">4,847 T</div>
            <div style="font-size:10px; color:#666; margin-top:4px;">Tonnage This Month</div>
          </div>
          <div style="background:white; border-radius:8px; padding:12px; border:1px solid #ddd; text-align:center;">
            <div style="font-size:22px; font-weight:600; color:#9C27B0;">₹2.34 Cr</div>
            <div style="font-size:10px; color:#666; margin-top:4px;">Total Revenue</div>
          </div>
          <div style="background:white; border-radius:8px; padding:12px; border:1px solid #ddd; text-align:center;">
            <div style="font-size:22px; font-weight:600; color:#E91E63;">₹1.89 Cr</div>
            <div style="font-size:10px; color:#666; margin-top:4px;">Operating Costs</div>
          </div>
          <div style="background:white; border-radius:8px; padding:12px; border:1px solid #ddd; text-align:center;">
            <div style="font-size:22px; font-weight:600; color:#00BCD4;">96.8%</div>
            <div style="font-size:10px; color:#666; margin-top:4px;">On-Time Rate</div>
          </div>
          <div style="background:white; border-radius:8px; padding:12px; border:1px solid #ddd; text-align:center;">
            <div style="font-size:22px; font-weight:600; color:#795548;">₹389/T</div>
            <div style="font-size:10px; color:#666; margin-top:4px;">Cost per Ton</div>
          </div>
          <div style="background:white; border-radius:8px; padding:12px; border:1px solid #ddd; text-align:center;">
            <div style="font-size:22px; font-weight:600; color:#689F38;">100%</div>
            <div style="font-size:10px; color:#666; margin-top:4px;">Compliance Rate</div>
          </div>
        </div>

        <!-- Charts Section -->
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-bottom:20px;">
          <!-- Fleet Utilization Breakdown -->
          <div style="background:white; border-radius:8px; border:1px solid #ddd; padding:16px;">
            <h3 style="margin:0 0 12px 0; font-size:13px; font-weight:600;">🚛 Fleet Utilization</h3>
            <div style="height:300px; background:#f9f9f9; border-radius:8px; display:flex; align-items:center; justify-content:center; color:#999; font-size:12px;">
              [Pie Chart: Utilized 89% | Idle 8% | Maintenance 3%]
            </div>
          </div>

          <!-- Revenue Trend -->
          <div style="background:white; border-radius:8px; border:1px solid #ddd; padding:16px;">
            <h3 style="margin:0 0 12px 0; font-size:13px; font-weight:600;">📈 Revenue Trend (Last 30 Days)</h3>
            <div style="height:300px; background:#f9f9f9; border-radius:8px; display:flex; align-items:flex-end; justify-content:space-around; padding:20px 10px; gap:4px;">
              ${Array(30).fill(0).map((_, i) => `<div style="flex:1; height:${40 + Math.random()*200}px; background:#4CAF50; border-radius:2px;"></div>`).join('')}
            </div>
          </div>

          <!-- Cost Breakdown by Category -->
          <div style="background:white; border-radius:8px; border:1px solid #ddd; padding:16px;">
            <h3 style="margin:0 0 12px 0; font-size:13px; font-weight:600;">💰 Operating Costs Breakdown</h3>
            <div style="font-size:12px; line-height:2;">
              <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #eee;">
                <span>Fuel & Maintenance</span>
                <strong>₹74,50,000 (39%)</strong>
              </div>
                <span>Driver Payroll</span>
                <strong>₹62,30,000 (33%)</strong>
              </div>
              <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #eee;">
                <span>Insurance & Permits</span>
                <strong>₹28,90,000 (15%)</strong>
              </div>
              <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #eee;">
                <span>Vehicle Maintenance</span>
                <strong>₹18,50,000 (10%)</strong>
              </div>
              <div style="display:flex; justify-content:space-between; padding:8px 0;">
                <span>Administrative</span>
                <strong>₹5,40,000 (3%)</strong>
              </div>
            </div>
          </div>

          <!-- Regional Performance -->
          <div style="background:white; border-radius:8px; border:1px solid #ddd; padding:16px;">
            <h3 style="margin:0 0 12px 0; font-size:13px; font-weight:600;">🌏 Regional Performance</h3>
            <div style="font-size:12px; line-height:2;">
              <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #eee;">
                <span>Mumbai Hub</span>
                <div style="flex:1; margin:0 12px; height:8px; background:#f0f0f0; border-radius:4px; overflow:hidden;">
                  <div style="height:100%; width:92%; background:#4CAF50;"></div>
                </div>
                <span style="font-weight:600;">92%</span>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #eee;">
                <span>Delhi Hub</span>
                <div style="flex:1; margin:0 12px; height:8px; background:#f0f0f0; border-radius:4px; overflow:hidden;">
                  <div style="height:100%; width:85%; background:#2196F3;"></div>
                </div>
                <span style="font-weight:600;">85%</span>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #eee;">
                <span>Bangalore Hub</span>
                <div style="flex:1; margin:0 12px; height:8px; background:#f0f0f0; border-radius:4px; overflow:hidden;">
                  <div style="height:100%; width:88%; background:#FF9800;"></div>
                </div>
                <span style="font-weight:600;">88%</span>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0;">
                <span>Chennai Hub</span>
                <div style="flex:1; margin:0 12px; height:8px; background:#f0f0f0; border-radius:4px; overflow:hidden;">
                  <div style="height:100%; width:78%; background:#9C27B0;"></div>
                </div>
                <span style="font-weight:600;">78%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Client Performance -->
        <div style="background:white; border-radius:8px; border:1px solid #ddd; padding:16px; margin-bottom:20px;">
          <h3 style="margin:0 0 12px 0; font-size:13px; font-weight:600;">🏢 Top Enterprise Clients</h3>
          <table style="width:100%; border-collapse:collapse; font-size:12px;">
            <thead>
              <tr style="background:#f9f9f9; border-bottom:1px solid #ddd;">
                <th style="padding:8px; text-align:left;">Client Name</th>
                <th style="padding:8px; text-align:center;">Shipments</th>
                <th style="padding:8px; text-align:center;">Weight (Tons)</th>
                <th style="padding:8px; text-align:center;">Revenue (₹)</th>
                <th style="padding:8px; text-align:center;">On-Time %</th>
                <th style="padding:8px; text-align:center;">Avg Cost/Ton</th>
                <th style="padding:8px; text-align:center;">Rating</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom:1px solid #eee;">
                <td style="padding:8px;">TCS Supply Chain</td>
                <td style="padding:8px; text-align:center;">145</td>
                <td style="padding:8px; text-align:center;">2,150 T</td>
                <td style="padding:8px; text-align:center;">₹83,85,000</td>
                <td style="padding:8px; text-align:center;"><span style="background:#c8e6c9; padding:2px 6px; border-radius:3px; font-weight:600;">98%</span></td>
                <td style="padding:8px; text-align:center;">₹390</td>
                <td style="padding:8px; text-align:center;">⭐⭐⭐⭐⭐</td>
              </tr>
              <tr style="border-bottom:1px solid #eee;">
                <td style="padding:8px;">Maruti Suzuki Manufacturing</td>
                <td style="padding:8px; text-align:center;">98</td>
                <td style="padding:8px; text-align:center;">1,840 T</td>
                <td style="padding:8px; text-align:center;">₹71,50,000</td>
                <td style="padding:8px; text-align:center;"><span style="background:#c8e6c9; padding:2px 6px; border-radius:3px; font-weight:600;">97%</span></td>
                <td style="padding:8px; text-align:center;">₹388</td>
                <td style="padding:8px; text-align:center;">⭐⭐⭐⭐⭐</td>
              </tr>
              <tr style="border-bottom:1px solid #eee;">
                <td style="padding:8px;">Amazon Logistics India</td>
                <td style="padding:8px; text-align:center;">124</td>
                <td style="padding:8px; text-align:center;">890 T</td>
                <td style="padding:8px; text-align:center;">₹34,67,000</td>
                <td style="padding:8px; text-align:center;"><span style="background:#fff9c4; padding:2px 6px; border-radius:3px; font-weight:600;">94%</span></td>
                <td style="padding:8px; text-align:center;">₹390</td>
                <td style="padding:8px; text-align:center;">⭐⭐⭐⭐</td>
              </tr>
              <tr style="border-bottom:1px solid #eee;">
                <td style="padding:8px;">ITC Limited Supply</td>
                <td style="padding:8px; text-align:center;">67</td>
                <td style="padding:8px; text-align:center;">1,230 T</td>
                <td style="padding:8px; text-align:center;">₹47,98,000</td>
                <td style="padding:8px; text-align:center;"><span style="background:#c8e6c9; padding:2px 6px; border-radius:3px; font-weight:600;">96%</span></td>
                <td style="padding:8px; text-align:center;">₹390</td>
                <td style="padding:8px; text-align:center;">⭐⭐⭐⭐</td>
              </tr>
              <tr>
                <td style="padding:8px;">Hindustan Logistics</td>
                <td style="padding:8px; text-align:center;">89</td>
                <td style="padding:8px; text-align:center;">747 T</td>
                <td style="padding:8px; text-align:center;">₹29,03,000</td>
                <td style="padding:8px; text-align:center;"><span style="background:#ffccbc; padding:2px 6px; border-radius:3px; font-weight:600;">89%</span></td>
                <td style="padding:8px; text-align:center;">₹388</td>
                <td style="padding:8px; text-align:center;">⭐⭐⭐</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Fleet Health & Maintenance -->
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-bottom:20px;">
          <div style="background:white; border-radius:8px; border:1px solid #ddd; padding:16px;">
            <h3 style="margin:0 0 12px 0; font-size:13px; font-weight:600;">🚚 Fleet Health Status</h3>
            <div style="font-size:12px; line-height:2.2;">
              <div style="display:flex; justify-content:space-between; padding:6px 0;">
                <span>🟢 Excellent (On Time)</span>
                <strong>68 vehicles</strong>
              </div>
              <div style="display:flex; justify-content:space-between; padding:6px 0; color:#FF9800;">
                <span>🟡 Good (Minor Issues)</span>
                <strong>22 vehicles</strong>
              </div>
              <div style="display:flex; justify-content:space-between; padding:6px 0; color:#E91E63;">
                <span>🔴 In Maintenance</span>
                <strong>8 vehicles</strong>
              </div>
              <div style="display:flex; justify-content:space-between; padding:6px 0; color:#9C27B0;">
                <span>⚫ Unscheduled Downtime</span>
                <strong>2 vehicles</strong>
              </div>
              <hr style="margin:8px 0; border:none; border-top:1px solid #eee;">
              <div style="display:flex; justify-content:space-between; padding:6px 0; font-weight:600;">
                <span>Total Fleet</span>
                <strong>100 vehicles</strong>
              </div>
            </div>
          </div>

          <div style="background:white; border-radius:8px; border:1px solid #ddd; padding:16px;">
            <h3 style="margin:0 0 12px 0; font-size:13px; font-weight:600;">📋 Compliance Status</h3>
            <div style="font-size:12px; line-height:2.2;">
              <div style="display:flex; justify-content:space-between; align-items:center; padding:6px 0;">
                <span>GSTR Compliance</span>
                <span style="background:#c8e6c9; padding:2px 8px; border-radius:3px; font-size:11px; font-weight:600;">100%</span>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; padding:6px 0;">
                <span>E-Way Bill Filed</span>
                <span style="background:#c8e6c9; padding:2px 8px; border-radius:3px; font-size:11px; font-weight:600;">100%</span>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; padding:6px 0;">
                <span>Insurance Valid</span>
                <span style="background:#c8e6c9; padding:2px 8px; border-radius:3px; font-size:11px; font-weight:600;">98%</span>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; padding:6px 0;">
                <span>Pollution Certificates</span>
                <span style="background:#fff9c4; padding:2px 8px; border-radius:3px; font-size:11px; font-weight:600;">94%</span>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; padding:6px 0;">
                <span>Driver License Valid</span>
                <span style="background:#c8e6c9; padding:2px 8px; border-radius:3px; font-size:11px; font-weight:600;">100%</span>
              </div>
              <hr style="margin:8px 0; border:none; border-top:1px solid #eee;">
              <div style="display:flex; justify-content:space-between; font-weight:600;">
                <span>Overall Compliance</span>
                <strong style="color:#4CAF50;">98.4%</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- Efficiency Metrics -->
        <div style="background:white; border-radius:8px; border:1px solid #ddd; padding:16px; margin-bottom:20px;">
          <h3 style="margin:0 0 12px 0; font-size:13px; font-weight:600;">⚡ Operational Efficiency</h3>
          <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:12px; font-size:12px;">
            <div style="padding:12px; background:#f0f7ff; border-radius:6px; border-left:4px solid #2196F3;">
              <div style="font-size:11px; color:#666;">Avg Load Factor</div>
              <div style="font-size:18px; font-weight:600; margin-top:4px; color:#2196F3;">89%</div>
              <div style="font-size:10px; color:#999; margin-top:4px;">Target: 85%</div>
            </div>
            <div style="padding:12px; background:#f0fff4; border-radius:6px; border-left:4px solid #4CAF50;">
              <div style="font-size:11px; color:#666;">Avg Transit Time (hrs)</div>
              <div style="font-size:18px; font-weight:600; margin-top:4px; color:#4CAF50;">36.2</div>
              <div style="font-size:10px; color:#999; margin-top:4px;">SLA: 40 hrs</div>
            </div>
            <div style="padding:12px; background:#fff3e0; border-radius:6px; border-left:4px solid #FF9800;">
              <div style="font-size:11px; color:#666;">Fuel Efficiency (km/L)</div>
              <div style="font-size:18px; font-weight:600; margin-top:4px; color:#FF9800;">5.8</div>
              <div style="font-size:10px; color:#999; margin-top:4px;">Avg for fleet</div>
            </div>
            <div style="padding:12px; background:#f3e5f5; border-radius:6px; border-left:4px solid #9C27B0;">
              <div style="font-size:11px; color:#666;">Cost per Km-Ton</div>
              <div style="font-size:18px; font-weight:600; margin-top:4px; color:#9C27B0;">₹6.72</div>
              <div style="font-size:10px; color:#999; margin-top:4px;">Industry avg: ₹7.5</div>
            </div>
          </div>
        </div>

        <!-- Predictive Insights -->
        <div style="background:white; border-radius:8px; border:1px solid #ddd; padding:16px;">
          <h3 style="margin:0 0 12px 0; font-size:13px; font-weight:600;">🔮 Predictive Insights</h3>
          <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:12px; font-size:12px;">
            <div style="padding:12px; background:#e8f5e9; border-radius:6px;">
              <h4 style="margin:0 0 8px 0; font-weight:600; color:#2e7d32;">Next Week Outlook</h4>
              <p style="margin:0; color:#555; line-height:1.5;">Expected <strong style="color:#2e7d32;">+15% shipment volume</strong> due to festive season demand. Recommend increasing fleet deployment in Mumbai and Delhi corridors.</p>
              <button class="btn btn-sm btn-primary" style="margin-top:8px; padding:4px 8px; font-size:10px;" onclick="UI.showNotification('Detailed outlook updated', 'info')">View Details →</button>
            </div>
            <div style="padding:12px; background:#fff3e0; border-radius:6px;">
              <h4 style="margin:0 0 8px 0; font-weight:600; color:#e65100;">Maintenance Alert</h4>
              <p style="margin:0; color:#555; line-height:1.5;">5 vehicles approaching scheduled maintenance. <strong style="color:#ff6f00;">Proactive scheduling recommended</strong> to avoid operational disruption.</p>
              <button class="btn btn-sm btn-warning" style="margin-top:8px; padding:4px 8px; font-size:10px;" onclick="UI.showNotification('Maintenance scheduled', 'success')">Schedule Maintenance →</button>
            </div>
            <div style="padding:12px; background:#e3f2fd; border-radius:6px;">
              <h4 style="margin:0 0 8px 0; font-weight:600; color:#1565c0;">Cost Optimization</h4>
              <p style="margin:0; color:#555; line-height:1.5;">Identified opportunity to <strong style="color:#1976d2;">reduce cost per ton by 8%</strong> through route consolidation and bulk loading optimization.</p>
              <button class="btn btn-sm btn-info" style="margin-top:8px; padding:4px 8px; font-size:10px;" onclick="UI.showNotification('Optimization analysis opened', 'info')">View Analysis →</button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  init: () => {
    console.log('📊 Enterprise Fleet Analytics Initialized');
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    const startEl = document.getElementById('startDate');
    const endEl = document.getElementById('endDate');
    if (startEl) startEl.valueAsDate = lastMonth;
    if (endEl) endEl.valueAsDate = today;
  },

  updateAnalytics: function() {
    const startDate = document.getElementById('startDate')?.value;
    const endDate = document.getElementById('endDate')?.value;
    const quickFilter = document.getElementById('analyticsQuickFilter')?.value;
    
    if (!startDate && !endDate && quickFilter) {
      console.log('Loading analytics for:', quickFilter);
    } else if (startDate && endDate) {
      console.log('Loading analytics from', startDate, 'to', endDate);
    }
    
    UI.showNotification('Analytics updated for selected period', 'success');
  },

  exportPDF: () => {
    UI.showNotification('📄 Exporting fleet analytics as PDF...', 'success');
  },

  exportCSV: () => {
    UI.showNotification('📊 Exporting data as CSV...', 'success');
  },

  scheduleReport: () => {
    UI.showNotification('📧 Schedule report dialog opened...', 'info');
  }
};
