// ============================================================
// Aetra — Admin Dashboard (Company Management)
// Team management, onboarding wizard, audit logs, company settings
// ============================================================

Pages.admin = async function(container) {
  const user = Session.get();
  if (!user || (user.role !== 'admin' && !user.roles?.includes('admin'))) {
    showToast('Admin access required', 'error');
    return Router.navigate('dashboard');
  }

  let activeTab = 'overview';
  let adminData = { users: [], audit: [], departments: [], company: {}, drivers: [], assignments: [] };

  // Fetch admin data
  try {
    const [res, drivers, assignments] = await Promise.all([
      API.getAdminData?.(user.id) || {},
      API.getDrivers(user.id),
      API.getDriverAssignments(user.id)
    ]);
    Object.assign(adminData, res);
    adminData.drivers = drivers || [];
    adminData.assignments = assignments || [];
  } catch (e) {
    console.error('Error loading admin data:', e);
  }

  function render() {
    container.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h2>Admin Dashboard</h2>
        <p>Company management, team oversight & system administration</p>
      </div>
      <div class="page-header-right" style="display:flex;gap:12px">
        <button class="btn btn-outline btn-sm" onclick="switchAdminTab('activity')" style="gap:6px">
          📊 Activity Log
        </button>
        <button class="btn btn-primary btn-sm" onclick="openOnboardingWizard()" style="gap:6px">
          🚀 Start Onboarding
        </button>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:220px 1fr;gap:24px;align-items:start">
      <!-- Admin Sidebar -->
      <div class="card" style="position:sticky;top:88px;height:fit-content">
        <div style="padding:8px">
          ${[
            { id:'overview', icon:'📊', label:'Overview' },
            { id:'team', icon:'👥', label:'Team Management' },
            { id:'departments', icon:'🏢', label:'Departments' },
            { id:'driver-ops', icon:'🚛', label:'Driver Operations' },
            { id:'onboarding', icon:'🚀', label:'Onboarding' },
            { id:'activity', icon:'📜', label:'Activity Log' },
            { id:'settings', icon:'⚙️', label:'Company Settings' }
          ].map(t => `
            <div style="display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:8px;cursor:pointer;transition:all .15s;${activeTab===t.id?'background:var(--primary);color:#fff;':'color:var(--text-muted);'}" onclick="switchAdminTab('${t.id}')" onmouseover="if('${activeTab}'!=='${t.id}') this.style.background='var(--bg)'" onmouseout="if('${activeTab}'!=='${t.id}') this.style.background=''">
              <span style="font-size:16px">${t.icon}</span>
              <span style="font-size:13px;font-weight:${activeTab===t.id?'700':'500'}">${t.label}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Admin Content -->
      <div id="adminContent">
        ${renderAdminTab(activeTab)}
      </div>
    </div>`;

    window.switchAdminTab = (tab) => { activeTab = tab; render(); };
  }

  function renderAdminTab(tab) {
    if (tab === 'overview') return renderOverview();
    if (tab === 'team') return renderTeamManagement();
    if (tab === 'departments') return renderDepartments();
    if (tab === 'driver-ops') return renderDriverOperations();
    if (tab === 'onboarding') return renderOnboarding();
    if (tab === 'activity') return renderActivityLog();
    if (tab === 'settings') return renderCompanySettings();
    return '';
  }

  function renderOverview() {
    const stats = [
      { label:'Active Users', value: adminData.users?.filter(u => u.status === 'active').length || 4, icon:'👥', color:'#3b82f6', trend:'+2 this month' },
      { label:'Pending Invites', value: adminData.users?.filter(u => u.status === 'invited').length || 1, icon:'📨', color:'#f97316', trend:'1 awaiting response' },
      { label:'Departments', value: adminData.departments?.length || 3, icon:'🏢', color:'#10b981', trend:'Sales, Ops, Finance' },
      { label:'API Keys Active', value: 3, icon:'🔑', color:'#8b5cf6', trend:'Prod, Dev, Webhook' }
    ];

    return `
    <div style="display:flex;flex-direction:column;gap:24px">
      <!-- Quick Stats -->
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px">
        ${stats.map(s => `
          <div class="card" style="padding:20px">
            <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:12px">
              <span style="font-size:28px">${s.icon}</span>
              <span style="font-size:11px;color:${s.color};font-weight:700">${s.trend}</span>
            </div>
            <div style="font-size:32px;font-weight:900;margin-bottom:4px">${s.value}</div>
            <div style="font-size:13px;color:var(--text-muted)">${s.label}</div>
          </div>
        `).join('')}
      </div>

      <!-- Company Health & Onboarding Progress -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px">
        <div class="card">
          <div style="padding:20px;border-bottom:1px solid var(--border)">
            <div style="font-size:16px;font-weight:700;margin-bottom:2px">🏥 Company Health</div>
            <div style="font-size:12px;color:var(--text-muted)">Setup completion status</div>
          </div>
          <div style="padding:24px">
            ${[
              { name:'Profile Setup', complete:100, status:'✓ Complete' },
              { name:'Team Onboarded', complete:60, status:'2 of 5 users' },
              { name:'Integrations', complete:80, status:'4 of 5 connected' },
              { name:'API Keys Generated', complete:100, status:'✓ Ready' }
            ].map(item => `
              <div style="margin-bottom:20px;last-child:margin-bottom:0">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                  <div style="font-size:13px;font-weight:600">${item.name}</div>
                  <div style="font-size:12px;color:${item.complete===100?'var(--success)':'var(--text-muted)'}">${item.status}</div>
                </div>
                <div style="width:100%;height:6px;background:#e2e8f0;border-radius:999px;overflow:hidden">
                  <div style="width:${item.complete}%;height:100%;background:linear-gradient(90deg,var(--primary),var(--accent));transition:width .3s"></div>
                </div>
              </div>
            `).join('')}
            <button class="btn btn-primary btn-sm" onclick="openOnboardingWizard()" style="margin-top:20px;width:100%;justify-content:center">📋 Complete Setup</button>
          </div>
        </div>

        <div class="card">
          <div style="padding:20px;border-bottom:1px solid var(--border)">
            <div style="font-size:16px;font-weight:700;margin-bottom:2px">⚡ Quick Actions</div>
            <div style="font-size:12px;color:var(--text-muted)">Common admin tasks</div>
          </div>
          <div style="padding:24px;display:flex;flex-direction:column;gap:12px">
            <button class="btn btn-outline" style="justify-content:flex-start;gap:10px" onclick="switchAdminTab('team')">
              <span style="font-size:18px">👥</span>
              <span>Invite New Team Member</span>
              <span style="margin-left:auto;font-size:11px;opacity:.5">→</span>
            </button>
            <button class="btn btn-outline" style="justify-content:flex-start;gap:10px" onclick="switchAdminTab('departments')">
              <span style="font-size:18px">🏢</span>
              <span>Create Department</span>
              <span style="margin-left:auto;font-size:11px;opacity:.5">→</span>
            </button>
            <button class="btn btn-outline" style="justify-content:flex-start;gap:10px" onclick="switchAdminTab('settings')">
              <span style="font-size:18px">⚙️</span>
              <span>Company Settings</span>
              <span style="margin-left:auto;font-size:11px;opacity:.5">→</span>
            </button>
            <button class="btn btn-outline" style="justify-content:flex-start;gap:10px" onclick="showToast('Audit log opened','info')">
              <span style="font-size:18px">📜</span>
              <span>View Audit Log</span>
              <span style="margin-left:auto;font-size:11px;opacity:.5">→</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="card">
        <div style="padding:20px;border-bottom:1px solid var(--border)">
          <div style="font-size:16px;font-weight:700">📝 Recent Activity</div>
        </div>
        <div style="padding:0">
          ${(adminData.audit || []).slice(0, 5).map((log, i) => `
            <div style="padding:16px 24px;border-bottom:${i < 4 ? '1px solid #f1f5f9' : 'none'};display:flex;align-items:center;gap:12px">
              <div style="width:40px;height:40px;border-radius:50%;background:var(--bg);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">
                ${log.icon || '📌'}
              </div>
              <div style="flex:1;min-width:0">
                <div style="font-size:13px;font-weight:600">${log.action || 'User created'}</div>
                <div style="font-size:12px;color:var(--text-muted)">${log.user || 'Admin'} • ${log.time || 'Just now'}</div>
              </div>
              <div style="font-size:11px;color:var(--text-muted);text-align:right;flex-shrink:0">${log.timestamp || '2 hours ago'}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>`;
  }

  function renderDriverOperations() {
    const drivers = adminData.drivers || [];
    const assignments = adminData.assignments || [];
    const totalFuelSaved = assignments.reduce((sum, a) => sum + (a.fuelSaved || 0), 0);
    const totalTimeSaved = assignments.reduce((sum, a) => sum + (a.timeSaved || 0), 0);

    return `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px">
      <div class="card">
        <div style="padding:20px 24px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-size:17px;font-weight:700">🚛 Driver Operations</div>
            <div style="font-size:13px;color:var(--text-muted);margin-top:2px">Assign shipments, monitor route status, and track field performance.</div>
          </div>
          <button class="btn btn-primary btn-sm" onclick="openAssignDriverModal()">Assign Shipment</button>
        </div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;padding:20px">
          <div style="background:#f8fafc;border-radius:12px;padding:16px;">
            <div style="font-size:13px;color:var(--text-muted);margin-bottom:6px">Active Drivers</div>
            <div style="font-size:28px;font-weight:800">${drivers.length}</div>
          </div>
          <div style="background:#fef2f2;border-radius:12px;padding:16px;">
            <div style="font-size:13px;color:var(--text-muted);margin-bottom:6px">Fuel Saved</div>
            <div style="font-size:28px;font-weight:800">${API._fmt(totalFuelSaved)}L</div>
          </div>
          <div style="background:#ecfdf5;border-radius:12px;padding:16px;">
            <div style="font-size:13px;color:var(--text-muted);margin-bottom:6px">Time Saved</div>
            <div style="font-size:28px;font-weight:800">${totalTimeSaved} mins</div>
          </div>
        </div>

        <div style="padding:0 20px 20px 20px">
          <div style="font-size:14px;font-weight:700;margin-bottom:12px">Driver Roster</div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px">
            ${drivers.map(d => `
              <div style="background:#fff;border:1px solid var(--border);border-radius:10px;padding:14px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
                  <div>
                    <div style="font-size:13px;font-weight:700">${d.name}</div>
                    <div style="font-size:11px;color:var(--text-muted);margin-top:2px">${d.code}</div>
                  </div>
                  <span style="font-size:12px;padding:4px 8px;border-radius:999px;background:${d.status === 'Active' ? '#dcfce7' : '#fef3c7'};color:${d.status === 'Active' ? '#166534' : '#92400e'}">${d.status}</span>
                </div>
                <div style="font-size:11px;color:var(--text-muted);line-height:1.6">
                  Truck: <strong>${d.truck}</strong><br>
                  Route: <strong>${d.route}</strong><br>
                  ETA: <strong>${d.eta}</strong>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <div class="card">
        <div style="padding:20px 24px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-size:17px;font-weight:700">📦 Latest Assignments</div>
            <div style="font-size:13px;color:var(--text-muted);margin-top:2px">Monitor delivery status and smart routing efficiency.</div>
          </div>
        </div>
        <div style="padding:20px;overflow:auto">
          <table style="width:100%;font-size:12px;border-collapse:collapse">
            <thead>
              <tr style="color:var(--text-muted);border-bottom:1px solid var(--border);">
                <th style="padding:10px 8px;text-align:left">Driver</th>
                <th style="padding:10px 8px;text-align:center">Route</th>
                <th style="padding:10px 8px;text-align:center">Client</th>
                <th style="padding:10px 8px;text-align:center">Status</th>
                <th style="padding:10px 8px;text-align:center">Fuel</th>
                <th style="padding:10px 8px;text-align:center">ETA</th>
              </tr>
            </thead>
            <tbody>
              ${assignments.map(a => `
                <tr style="border-bottom:1px solid #f3f4f6;">
                  <td style="padding:10px 8px">${a.driverName}</td>
                  <td style="padding:10px 8px;text-align:center">${a.route}</td>
                  <td style="padding:10px 8px;text-align:center">${a.client}</td>
                  <td style="padding:10px 8px;text-align:center">${a.status}</td>
                  <td style="padding:10px 8px;text-align:center">${a.fuelSaved}L</td>
                  <td style="padding:10px 8px;text-align:center">${a.eta}</td>
                </tr>
              `).join('') || '<tr><td colspan="6" style="padding:16px;text-align:center;color:var(--text-muted)">No assignments yet. Create one to start driver dispatch.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
  }

  function renderTeamManagement() {
    const users = adminData.users || [
      { id:'1', name: user.name||'Admin User', email: user.email||'admin@company.in', role:'Admin', status:'active', lastActive:'just now', joined:'March 1, 2024' },
      { id:'2', name:'Priya Sharma', email:'priya@company.in', role:'Finance Manager', status:'active', lastActive:'2 hours ago', joined:'March 5, 2024' },
      { id:'3', name:'Amit Singh', email:'amit@company.in', role:'Operations Head', status:'active', lastActive:'Yesterday', joined:'March 8, 2024' },
      { id:'4', name:'Deepa Nair', email:'deepa@company.in', role:'Viewer', status:'invited', lastActive:'—', joined:'Pending' }
    ];

    return `
    <div style="display:flex;flex-direction:column;gap:24px">
      <div class="card">
        <div style="padding:20px 24px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-size:17px;font-weight:700">👥 Team Members</div>
            <div style="font-size:13px;color:var(--text-muted);margin-top:2px">${users.filter(u => u.status === 'active').length} active • ${users.filter(u => u.status === 'invited').length} invited</div>
          </div>
          <button class="btn btn-primary btn-sm" onclick="showTeamInviteModal()">+ Invite Member</button>
        </div>
        
        <div style="padding:0">
          <table style="width:100%;font-size:13px">
            <thead>
              <tr style="border-bottom:1px solid var(--border);background:var(--bg)">
                <th style="text-align:left;padding:16px 24px;font-weight:700;color:var(--text-muted)">Member</th>
                <th style="text-align:left;padding:16px 24px;font-weight:700;color:var(--text-muted)">Role</th>
                <th style="text-align:center;padding:16px 24px;font-weight:700;color:var(--text-muted)">Status</th>
                <th style="text-align:left;padding:16px 24px;font-weight:700;color:var(--text-muted)">Last Active</th>
                <th style="text-align:center;padding:16px 24px;font-weight:700;color:var(--text-muted)">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${users.map(u => `
                <tr style="border-bottom:1px solid #f1f5f9;hover:background:var(--bg)">
                  <td style="padding:16px 24px">
                    <div style="display:flex;align-items:center;gap:10px">
                      <div style="width:36px;height:36px;border-radius:50%;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0">${u.name.split(' ').map(n => n[0]).join('')}</div>
                      <div>
                        <div style="font-weight:600">${u.name}</div>
                        <div style="font-size:12px;color:var(--text-muted)">${u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style="padding:16px 24px">
                    <select style="padding:6px 10px;border:1px solid var(--border);border-radius:6px;font-size:12px;background:#fff" onchange="updateUserRole('${u.id}',this.value)">
                      ${['Admin','Finance Manager','Operations Head','Viewer'].map(r => `<option ${r === u.role ? 'selected' : ''}>${r}</option>`).join('')}
                    </select>
                  </td>
                  <td style="padding:16px 24px;text-align:center">
                    <span class="badge ${u.status === 'active' ? 'badge-success' : 'badge-warning'}">${u.status === 'active' ? '✓ Active' : '📨 Invited'}</span>
                  </td>
                  <td style="padding:16px 24px">
                    <span style="color:var(--text-muted)">${u.lastActive}</span>
                  </td>
                  <td style="padding:16px 24px;text-align:center">
                    <div style="display:flex;gap:6px;justify-content:center">
                      <button class="btn btn-ghost btn-sm" onclick="showUserDetails('${u.id}')" title="View">👁️</button>
                      <button class="btn btn-ghost btn-sm" onclick="resendInvite('${u.id}')" title="Resend Invite">🔄</button>
                      <button class="btn btn-ghost btn-sm" onclick="removeUser('${u.id}')" title="Remove">✕</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Permission Matrix -->
      <div class="card">
        <div style="padding:20px 24px;border-bottom:1px solid var(--border)">
          <div style="font-size:16px;font-weight:700;margin-bottom:4px">🔐 Role Permission Matrix</div>
          <div style="font-size:12px;color:var(--text-muted)">Define what each role can do in Aetra</div>
        </div>
        <div style="padding:24px;overflow-x:auto">
          <table style="width:100%;font-size:12px;min-width:600px">
            <thead>
              <tr style="border-bottom:2px solid var(--border)">
                <th style="text-align:left;padding:12px;font-weight:700">Permission</th>
                <th style="text-align:center;padding:12px">Admin</th>
                <th style="text-align:center;padding:12px">Finance Mgr</th>
                <th style="text-align:center;padding:12px">Operations</th>
                <th style="text-align:center;padding:12px">Viewer</th>
              </tr>
            </thead>
            <tbody>
              ${[
                { perm:'View Invoices', admin:true, finance:true, ops:true, viewer:true },
                { perm:'Create Invoices', admin:true, finance:true, ops:false, viewer:false },
                { perm:'Edit Invoices', admin:true, finance:true, ops:false, viewer:false },
                { perm:'Approve Payments', admin:true, finance:true, ops:false, viewer:false },
                { perm:'View Reports', admin:true, finance:true, ops:true, viewer:true },
                { perm:'Manage Users', admin:true, finance:false, ops:false, viewer:false },
                { perm:'Access API', admin:true, finance:false, ops:true, viewer:false },
                { perm:'View Audit Log', admin:true, finance:true, ops:false, viewer:false }
              ].map(p => `
                <tr style="border-bottom:1px solid #f1f5f9">
                  <td style="padding:12px;font-weight:600">${p.perm}</td>
                  <td style="text-align:center;padding:12px">${p.admin ? '✅' : '❌'}</td>
                  <td style="text-align:center;padding:12px">${p.finance ? '✅' : '❌'}</td>
                  <td style="text-align:center;padding:12px">${p.ops ? '✅' : '❌'}</td>
                  <td style="text-align:center;padding:12px">${p.viewer ? '✅' : '❌'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
  }

  function renderDepartments() {
    const depts = adminData.departments || [
      { name:'Sales', head:'Rajesh Kumar', members:4, icon:'📈' },
      { name:'Operations', head:'Amit Singh', members:6, icon:'⚙️' },
      { name:'Finance', head:'Priya Sharma', members:3, icon:'💰' }
    ];

    return `
    <div style="display:flex;flex-direction:column;gap:24px">
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px">
        ${depts.map(d => `
          <div class="card" style="padding:24px;cursor:pointer;transition:all .2s" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform=''">
            <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:12px">
              <div style="font-size:32px">${d.icon}</div>
              <button class="btn btn-ghost btn-sm" onclick="removeDepartment('${d.name}')">✕</button>
            </div>
            <div style="font-size:16px;font-weight:700;margin-bottom:4px">${d.name}</div>
            <div style="font-size:13px;color:var(--text-muted);margin-bottom:16px">Head: ${d.head}</div>
            <div style="display:flex;align-items:center;gap:10px">
              <span style="font-size:20px;font-weight:900">${d.members}</span>
              <span style="font-size:12px;color:var(--text-muted)">team members</span>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="card">
        <div style="padding:20px 24px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
          <div style="font-size:16px;font-weight:700">+ Create New Department</div>
          <button class="btn btn-primary btn-sm" onclick="showCreateDeptModal()">Add Department</button>
        </div>
        <div style="padding:24px">
          <div class="form-group">
            <label class="form-label">Department Name</label>
            <input class="form-input" id="deptName" placeholder="e.g., Logistics, IT, HR" />
          </div>
          <div class="form-group">
            <label class="form-label">Department Head</label>
            <select class="form-input" id="deptHead">
              <option>Select a team member...</option>
              ${[
                { name:'Rajesh Kumar', email:'rajesh@company.in' },
                { name:'Priya Sharma', email:'priya@company.in' },
                { name:'Amit Singh', email:'amit@company.in' }
              ].map(m => `<option>${m.name}</option>`).join('')}
            </select>
          </div>
          <button class="btn btn-primary" onclick="createDepartment()" style="width:100%;justify-content:center">Create Department</button>
        </div>
      </div>
    </div>`;
  }

  function renderOnboarding() {
    return `
    <div class="card">
      <div style="padding:20px 24px;border-bottom:1px solid var(--border)">
        <div style="font-size:17px;font-weight:700;margin-bottom:4px">🚀 Company Onboarding Wizard</div>
        <div style="font-size:13px;color:var(--text-muted)">Set up your company for success with our guided wizard</div>
      </div>
      <div style="padding:0">
        ${[
          { step:1, title:'Company Profile', desc:'Basic company info, GST, registration details', icon:'🏢', status:'✓ Complete' },
          { step:2, title:'Team Setup', desc:'Add team members and assign roles', icon:'👥', status:'⏳ In Progress' },
          { step:3, title:'Integrations', desc:'Connect ERP, banks, email & GST portal', icon:'🔗', status:'⏳ Pending' },
          { step:4, title:'Workflows', desc:'Configure approval workflows and document rules', icon:'⚙️', status:'⏳ Pending' },
          { step:5, title:'Training', desc:'Walkthrough, tutorials & best practices', icon:'📚', status:'⏳ Pending' }
        ].map((s, i) => `
          <div style="padding:24px;border-bottom:${i < 4 ? '1px solid #f1f5f9' : 'none'};display:flex;align-items:start;gap:20px">
            <div style="display:flex;flex-direction:column;align-items:center;gap:12px">
              <div style="width:50px;height:50px;border-radius:50%;background:${s.status.includes('Complete')?'var(--success)':s.status.includes('Progress')?'var(--primary)':'var(--border)'};color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700">${s.icon}</div>
              ${i < 4 ? '<div style="width:2px;height:60px;background:var(--border)"></div>' : ''}
            </div>
            <div style="flex:1">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                <div>
                  <div style="font-size:15px;font-weight:700">Step ${s.step}: ${s.title}</div>
                  <div style="font-size:13px;color:var(--text-muted);margin-top:2px">${s.desc}</div>
                </div>
                <span class="badge ${s.status.includes('Complete')?'badge-success':s.status.includes('Progress')?'badge-primary':'badge-gray'}">${s.status}</span>
              </div>
              ${s.step === 2 ? `<button class="btn btn-primary btn-sm" onclick="switchAdminTab('team')">Continue →</button>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </div>`;
  }

  async function renderActivityLog() {
    // Sample audit logs showing system events
    const logs = [
      { timestamp: new Date().toLocaleString('en-IN'), user: 'Demo User', action: 'Login', target: 'demo@freightflow.in', icon: '🔐', endpoint: '/auth/login', method: 'POST' },
      { timestamp: new Date(Date.now() - 3600000).toLocaleString('en-IN'), user: 'Rajesh Kumar', action: 'User created', target: 'priya@company.in', icon: '👤', endpoint: '/auth/invite', method: 'POST' },
      { timestamp: new Date(Date.now() - 7200000).toLocaleString('en-IN'), user: 'Admin', action: 'Invoice processed', target: 'INV-12345', icon: '📄', endpoint: '/api/invoices/update', method: 'PUT' },
      { timestamp: new Date(Date.now() - 10800000).toLocaleString('en-IN'), user: 'Priya Sharma', action: 'Payment approved', target: '₹1,50,000', icon: '✓', endpoint: '/api/payments/approve', method: 'POST' },
      { timestamp: new Date(Date.now() - 14400000).toLocaleString('en-IN'), user: 'Amit Singh', action: 'GST reconciliation', target: 'GSTR-1 March', icon: '📊', endpoint: '/api/analytics/compliance', method: 'GET' }
    ];

    return `
    <div class="card">
      <div style="padding:20px 24px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-size:17px;font-weight:700">📜 Audit Log</div>
          <div style="font-size:13px;color:var(--text-muted);margin-top:2px">All system activities and user actions (${logs.length} entries)</div>
        </div>
        <input class="form-input" type="text" id="auditSearch" placeholder="Search activities..." style="width:200px;padding:8px 12px" onkeyup="filterAuditLogs(this.value)" />
      </div>
      <div style="padding:0" id="auditLogList">
        ${logs.map((log, i) => `
          <div style="padding:20px 24px;border-bottom:${i < logs.length - 1 ? '1px solid #f1f5f9' : 'none'};display:flex;align-items:center;gap:16px;cursor:pointer" onmouseover="this.style.background='var(--bg)'" onmouseout="this.style.background='transparent'" data-search="${log.action.toLowerCase()} ${log.user.toLowerCase()} ${log.target.toLowerCase()}">
            <div style="font-size:24px">${log.icon}</div>
            <div style="flex:1;min-width:0">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
                <div style="font-weight:600;font-size:14px">${log.action}</div>
                <div style="font-size:12px;color:var(--text-muted)">${log.timestamp}</div>
              </div>
              <div style="font-size:13px;color:var(--text-muted)">${log.user} • <strong>${log.target}</strong></div>
            </div>
            <button class="btn btn-ghost btn-sm" onclick="showToast('Action: ${log.action} | Endpoint: ${log.endpoint} (${log.method})','info')">→</button>
          </div>
        `).join('')}
      </div>
    </div>

    <script>
      function filterAuditLogs(query) {
        const items = document.querySelectorAll('#auditLogList > div');
        const q = query.toLowerCase();
        items.forEach(item => {
          const text = item.getAttribute('data-search') || '';
          item.style.display = text.includes(q) ? 'flex' : 'none';
        });
      }
    </script>`;
  }

  function renderCompanySettings() {
    return `
    <div style="display:flex;flex-direction:column;gap:24px">
      <div class="card card-body">
        <div style="font-size:17px;font-weight:700;margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid var(--border)">🏢 Company Information</div>
        
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Company Name *</label>
            <input class="form-input" value="Mahindra Logistics Pvt Ltd" readonly />
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input class="form-input" value="support@company.in" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">GSTIN *</label>
            <input class="form-input" value="27AABCM1234F1ZX" />
          </div>
          <div class="form-group">
            <label class="form-label">PAN *</label>
            <input class="form-input" value="AABCD0001P" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Office Address</label>
          <textarea class="form-input" style="resize:vertical" rows="3">456 Demo Street, Mumbai, Maharashtra 400001, India</textarea>
        </div>

        <button class="btn btn-primary" onclick="saveCompanySettings()">💾 Save Settings</button>
      </div>

      <div class="card" style="border:2px solid #fecaca">
        <div style="padding:20px 24px;border-bottom:1px solid var(--border)">
          <div style="font-size:16px;font-weight:700;color:#991b1b;margin-bottom:4px">⚠️ Danger Zone</div>
          <div style="font-size:13px;color:#7f1d1d">Irreversible actions — proceed with caution</div>
        </div>
        <div style="padding:24px;display:flex;flex-direction:column;gap:12px">
          <button class="btn btn-danger" onclick="showToast('Archive company initiated','warning')">📦 Archive Company</button>
          <button class="btn btn-danger" onclick="showToast('Deletion request sent to support','warning')">🗑️ Delete Company & All Data</button>
        </div>
      </div>
    </div>`;
  }

  // Global handlers
  window.showTeamInviteModal = () => {
    openModal(`
      <div class="modal">
        <div class="modal-header">
          <div class="modal-title">👥 Invite Team Member</div>
          <button class="modal-close" onclick="closeModal()">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Full Name *</label>
            <input class="form-input" id="inviteName" placeholder="John Doe" />
          </div>
          <div class="form-group">
            <label class="form-label">Email Address *</label>
            <input class="form-input" id="inviteEmail" type="email" placeholder="colleague@company.in" />
          </div>
          <div class="form-group">
            <label class="form-label">Role *</label>
            <select class="form-input" id="inviteRole">
              <option>Admin</option>
              <option>Finance Manager</option>
              <option>Operations Head</option>
              <option>Viewer</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Department</label>
            <select class="form-input" id="inviteDept">
              <option>Sales</option>
              <option>Operations</option>
              <option>Finance</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
          <button class="btn btn-primary" onclick="sendTeamInvite()">Send Invite</button>
        </div>
      </div>
    `);
  };

  window.sendTeamInvite = () => {
    const name = document.getElementById('inviteName')?.value;
    const email = document.getElementById('inviteEmail')?.value;
    const role = document.getElementById('inviteRole')?.value;
    if (!name || !email) { showToast('Name and email required', 'error'); return; }
    showToast(`Invite sent to ${email} as ${role} ✓`, 'success');
    closeModal();
    render();
  };

  window.updateUserRole = (userId, role) => {
    showToast(`User role updated to ${role} ✓`, 'success');
  };

  window.removeUser = (userId) => {
    if (confirm('Remove this user from the team?')) {
      showToast('User removed from team ✓', 'success');
      render();
    }
  };

  window.resendInvite = (userId) => {
    showToast('Invite resent ✓', 'success');
  };

  window.removeDepartment = (dept) => {
    if (confirm(`Remove ${dept} department?`)) {
      showToast(`${dept} department removed ✓`, 'success');
      render();
    }
  };

  window.showCreateDeptModal = () => {
    showToast('Department creation form ready', 'info');
  };

  window.createDepartment = () => {
    const name = document.getElementById('deptName')?.value;
    if (!name) { showToast('Department name required', 'error'); return; }
    showToast(`${name} department created ✓`, 'success');
    render();
  };

  window.saveCompanySettings = () => {
    showToast('Company settings saved ✓', 'success');
  };

  window.openOnboardingWizard = () => {
    switchAdminTab('onboarding');
  };

  window.openAssignDriverModal = async () => {
    const drivers = adminData.drivers || [];
    const driverOptions = drivers.map(d => `<option value="${d.id}">${d.name} — ${d.code}</option>`).join('');
    openModal(`
      <div class="modal" style="max-width:520px;">
        <div class="modal-header">
          <div class="modal-title">🚛 Assign New Driver Shipment</div>
          <button class="modal-close" onclick="closeModal()">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Driver</label>
            <select class="form-input" id="assignDriverSelect">${driverOptions}</select>
          </div>
          <div class="form-group">
            <label class="form-label">Client</label>
            <input class="form-input" id="assignClient" placeholder="Client name, e.g. TCS Supply" />
          </div>
          <div class="form-row">
            <div class="form-group" style="flex:1">
              <label class="form-label">Shipment Type</label>
              <select class="form-input" id="assignType"><option>FTL</option><option>LTL</option><option>Express</option></select>
            </div>
            <div class="form-group" style="flex:1">
              <label class="form-label">Route</label>
              <input class="form-input" id="assignRoute" placeholder="Mumbai → Delhi" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group" style="flex:1">
              <label class="form-label">Weight</label>
              <input class="form-input" id="assignWeight" placeholder="e.g. 12.5 T" />
            </div>
            <div class="form-group" style="flex:1">
              <label class="form-label">ETA</label>
              <input class="form-input" id="assignEta" placeholder="e.g. 13:45" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Notes</label>
            <textarea class="form-input" id="assignNotes" rows="3" placeholder="Route advice, hazards, loading details"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
          <button class="btn btn-primary" onclick="createDriverAssignment()">Assign Shipment</button>
        </div>
      </div>
    `);
  };

  window.createDriverAssignment = async () => {
    const driverId = document.getElementById('assignDriverSelect')?.value;
    const client = document.getElementById('assignClient')?.value.trim();
    const type = document.getElementById('assignType')?.value;
    const route = document.getElementById('assignRoute')?.value.trim();
    const weight = document.getElementById('assignWeight')?.value.trim();
    const eta = document.getElementById('assignEta')?.value.trim();
    const notes = document.getElementById('assignNotes')?.value.trim();
    const driver = (adminData.drivers || []).find(d => d.id === driverId);
    if (!driver || !client || !route || !weight || !eta) {
      showToast('Please complete all assignment details', 'error');
      return;
    }
    const order = await API.assignDriverOrder(user.id, {
      driverId,
      driverName: driver.name,
      client,
      type,
      route,
      weight,
      eta,
      notes,
      fuelSaved: Math.max(8, Math.round(Math.random() * 20)),
      timeSaved: Math.max(10, Math.round(Math.random() * 30))
    });
    adminData.assignments = await API.getDriverAssignments(user.id);
    showToast(`Shipment assigned to ${driver.name} ✓`, 'success');
    closeModal();
    render();
  };

  window.showUserDetails = (userId) => {
    showToast('User details panel opened', 'info');
  };

  render();
};
