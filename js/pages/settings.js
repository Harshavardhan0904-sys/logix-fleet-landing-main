// ============================================================
// Aetra — Settings Page (API-Connected)
// Live company profile, user management, billing/plan
// ============================================================

Pages.settings = async function(container) {
  const user = Session.get();
  if (!user) return Router.navigate('login');

  container.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:200px;flex-direction:column;gap:12px">
    <div style="width:36px;height:36px;border:3px solid #e2e8f0;border-top-color:var(--primary);border-radius:50%;animation:spin .7s linear infinite"></div>
    <div style="font-size:13px;color:var(--text-muted)">Loading settings...</div>
  </div>`;

  // Fetch fresh user data from API
  let profile = user;
  try {
    if (user.id && user.id !== 'demo-user-001') {
      const fresh = await API.getMe(user.id);
      if (fresh && !fresh.error) { profile = { ...user, ...fresh }; Session.save(profile); }
    }
  } catch (e) { /* use cached */ }

  let activeTab = 'company';

  function render() {
    const planColors = { free: '#64748b', growth: '#f97316', enterprise: '#8b5cf6', starter: '#3b82f6' };
    const planColor = planColors[profile.plan] || '#64748b';
    const planLabel = profile.plan ? profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1) : 'Free';

    container.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h2>Settings</h2>
        <p>Company profile, users, integrations & preferences</p>
      </div>
      <div class="page-header-right">
        <span class="badge" style="font-size:13px;padding:6px 14px;background:${planColor}22;color:${planColor};border:1px solid ${planColor}44">
          ✅ ${planLabel} Plan Active
        </span>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:220px 1fr;gap:24px;align-items:start">
      <!-- Settings Sidebar -->
      <div class="card" style="position:sticky;top:88px">
        <div style="padding:8px">
          ${[
            { id:'company', icon:'🏢', label:'Company Profile' },
            { id:'users', icon:'👥', label:'User Management' },
            { id:'notifications', icon:'🔔', label:'Notifications' },
            { id:'integrations', icon:'🔗', label:'Integrations' },
            { id:'api', icon:'⚡', label:'API Keys' },
            { id:'billing', icon:'💳', label:'Billing & Plan' },
            { id:'security', icon:'🔐', label:'Security' }
          ].map(t => `
            <div style="display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:8px;cursor:pointer;transition:all .15s;${activeTab===t.id?'background:var(--primary);color:#fff;':'color:var(--text-muted);'}" onclick="switchSettingsTab('${t.id}')" onmouseover="if('${activeTab}'!=='${t.id}') this.style.background='var(--bg)'" onmouseout="if('${activeTab}'!=='${t.id}') this.style.background=''">
              <span style="font-size:16px">${t.icon}</span>
              <span style="font-size:13px;font-weight:${activeTab===t.id?'700':'500'}">${t.label}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Settings Content -->
      <div id="settingsContent">
        ${renderSettingsTab(activeTab)}
      </div>
    </div>`;

    window.switchSettingsTab = (tab) => { activeTab = tab; render(); };
  }

  function renderSettingsTab(tab) {
    if (tab === 'company') return renderCompanyProfile();
    if (tab === 'users') return renderUsers();
    if (tab === 'notifications') return renderNotifications();
    if (tab === 'integrations') return renderIntegrations();
    if (tab === 'api') return renderAPI();
    if (tab === 'billing') return renderBilling();
    if (tab === 'security') return renderSecurity();
    return '';
  }

  function renderCompanyProfile() {
    return `
    <div class="card card-body">
      <div style="font-size:17px;font-weight:700;margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid var(--border)">🏢 Company Profile</div>

      <div style="display:flex;align-items:center;gap:16px;margin-bottom:28px;padding:20px;background:var(--bg);border-radius:12px">
        <div style="width:72px;height:72px;border-radius:16px;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700">${profile.avatar||'??'}</div>
        <div>
          <div style="font-size:18px;font-weight:700">${profile.company||'Company Name'}</div>
          <div style="font-size:14px;color:var(--text-muted);margin-top:2px">GSTIN: ${profile.gstin||'Not set'}</div>
          <div style="font-size:13px;color:var(--text-muted);margin-top:1px">Email: ${profile.email}</div>
          <button class="btn btn-outline btn-sm" style="margin-top:10px" onclick="showToast('Company logo upload — coming soon','info')">📷 Update Logo</button>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Company Name</label>
          <input class="form-input" id="cpCompany" value="${profile.company||''}">
        </div>
        <div class="form-group">
          <label class="form-label">Industry</label>
          <select class="form-input" id="cpIndustry">
            ${['3PL / Freight Forwarding','E-commerce Logistics','Cold Chain Logistics','Express Courier','Last-Mile Delivery'].map(o=>`<option ${profile.industry===o?'selected':''}>${o}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">GSTIN</label>
          <input class="form-input" id="cpGstin" value="${profile.gstin||''}" style="font-family:monospace" oninput="this.value=this.value.toUpperCase()">
          <div class="form-hint">${profile.gstin ? '✅ GSTIN verified' : '⚠️ Add GSTIN for GST compliance'}</div>
        </div>
        <div class="form-group">
          <label class="form-label">PAN Number</label>
          <input class="form-input" id="cpPan" value="${profile.pan||''}" style="font-family:monospace" oninput="this.value=this.value.toUpperCase()">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Registered Address</label>
          <input class="form-input" id="cpAddress" value="${profile.address||'Plot 42, MIDC Industrial Area, Andheri East, Mumbai - 400069'}">
        </div>
        <div class="form-group">
          <label class="form-label">State</label>
          <select class="form-input" id="cpState">
            ${['Maharashtra','Tamil Nadu','Karnataka','Delhi','Telangana','Gujarat','Rajasthan','West Bengal'].map(s=>`<option ${profile.state===s?'selected':''}>${s}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Contact Email</label>
          <input class="form-input" type="email" id="cpEmail" value="${profile.email||''}">
        </div>
        <div class="form-group">
          <label class="form-label">Phone</label>
          <input class="form-input" id="cpPhone" value="${profile.phone||''}">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Invoice Payment Terms</label>
        <select class="form-input" style="max-width:240px">
          <option>Net 30 days</option>
          <option selected>Net 45 days</option>
          <option>Net 60 days</option>
          <option>Immediate</option>
        </select>
      </div>
      <div style="display:flex;gap:12px;padding-top:8px">
        <button class="btn btn-primary" id="saveProfileBtn" onclick="saveCompanyProfile()">💾 Save Changes</button>
        <button class="btn btn-outline" onclick="render()">✕ Cancel</button>
      </div>
    </div>`;
  }

  function renderUsers() {
    const users = [
      { name: profile.name||'Admin User', email: profile.email||'admin@company.in', role: 'Admin', status: 'active', lastActive: 'just now' },
      { name:'Priya Sharma', email:'priya@company.in', role:'Finance Manager', status:'active', lastActive:'2 hours ago' },
      { name:'Amit Singh', email:'amit@company.in', role:'Operations', status:'active', lastActive:'Yesterday' },
      { name:'Deepa Nair', email:'deepa@company.in', role:'Viewer', status:'invited', lastActive:'—' }
    ];
    return `
    <div class="card">
      <div style="padding:20px 24px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
        <div style="font-size:17px;font-weight:700">👥 User Management</div>
        <button class="btn btn-primary btn-sm" onclick="showInviteModal()">+ Invite User</button>
      </div>
      <div style="padding:20px 24px">
        ${users.map(u => `
          <div style="display:flex;align-items:center;gap:14px;padding:14px 0;border-bottom:1px solid #f1f5f9">
            <div style="width:40px;height:40px;border-radius:50%;background:${u.status==='invited'?'#e2e8f0':'var(--primary)'};color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;flex-shrink:0">${u.name.split(' ').map(n=>n[0]).join('')}</div>
            <div style="flex:1">
              <div style="font-size:14px;font-weight:600">${u.name}</div>
              <div style="font-size:12px;color:var(--text-muted)">${u.email} • Last active: ${u.lastActive}</div>
            </div>
            <select style="padding:6px 10px;border:1px solid var(--border);border-radius:6px;font-size:13px;background:#fff" onchange="showToast('Role updated for ${u.name}','success')">
              ${['Admin','Finance Manager','Operations','Viewer'].map(r=>`<option ${r===u.role?'selected':''}>${r}</option>`).join('')}
            </select>
            <span class="badge ${u.status==='active'?'badge-success':'badge-warning'}">${u.status}</span>
            <button class="btn btn-ghost btn-sm" onclick="showToast('Removed ${u.name} from team','warning')" title="Remove">✕</button>
          </div>
        `).join('')}
      </div>
      <div style="padding:14px 24px;background:#eff6ff;border-top:1px solid var(--border);font-size:13px;color:#1e40af">
        <strong>Growth Plan:</strong> 5 user seats • ${users.filter(u=>u.status==='active').length} used • ${5 - users.filter(u=>u.status==='active').length} available —
        <a href="#" style="color:var(--primary);font-weight:600" onclick="switchSettingsTab('billing');return false">Upgrade for unlimited users →</a>
      </div>
    </div>`;
  }

  function renderNotifications() {
    return `
    <div class="card card-body">
      <div style="font-size:17px;font-weight:700;margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid var(--border)">🔔 Notification Preferences</div>
      ${[
        { section:'Invoice Alerts', items:[
          { label:'Invoice uploaded', desc:'New invoice added to the system', email:true, whatsapp:true, sms:false },
          { label:'Reconciliation complete', desc:'Auto-reconciliation finished', email:true, whatsapp:false, sms:false },
          { label:'Mismatch detected', desc:'GST or amount mismatch found', email:true, whatsapp:true, sms:true }
        ]},
        { section:'Payment Alerts', items:[
          { label:'Payment due reminder', desc:'3 days before payment due date', email:true, whatsapp:true, sms:true },
          { label:'Invoice overdue', desc:'Payment past due date', email:true, whatsapp:true, sms:true },
          { label:'Payment processed', desc:'Payment successfully made', email:true, whatsapp:false, sms:false }
        ]},
        { section:'GST Alerts', items:[
          { label:'Filing deadline reminder', desc:'7 days before GST filing due', email:true, whatsapp:true, sms:false },
          { label:'GSTR-2B available', desc:'GSTR-2B published on portal', email:true, whatsapp:false, sms:false }
        ]}
      ].map(section => `
        <div style="margin-bottom:28px">
          <div style="font-size:14px;font-weight:700;color:var(--primary);margin-bottom:14px">${section.section}</div>
          <table style="width:100%;font-size:13px">
            <thead><tr style="color:var(--text-muted)">
              <th style="text-align:left;padding:8px 0;min-width:200px">Alert Type</th>
              <th style="text-align:center;padding:8px 20px">Email</th>
              <th style="text-align:center;padding:8px 20px">WhatsApp</th>
              <th style="text-align:center;padding:8px 20px">SMS</th>
            </tr></thead>
            <tbody>
              ${section.items.map(item => `
                <tr style="border-bottom:1px solid #f1f5f9">
                  <td style="padding:12px 0">
                    <div style="font-weight:500">${item.label}</div>
                    <div style="font-size:12px;color:var(--text-muted)">${item.desc}</div>
                  </td>
                  ${['email','whatsapp','sms'].map(ch => `
                    <td style="text-align:center;padding:12px 20px">
                      <input type="checkbox" ${item[ch]?'checked':''} onchange="showToast('Notification saved','success')" style="width:16px;height:16px;cursor:pointer;accent-color:var(--primary)">
                    </td>
                  `).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `).join('')}
      <button class="btn btn-primary" onclick="showToast('Notification preferences saved ✓')">💾 Save Preferences</button>
    </div>`;
  }

  function renderIntegrations() {
    const integrations = [
      { name:'Tally Prime', icon:'📊', desc:'Sync invoices, payments & ledger entries bidirectionally', status:'connected', category:'ERP', color:'#3b82f6' },
      { name:'Zoho Books', icon:'📚', desc:'Two-way sync of invoices and vendor master data', status:'available', category:'ERP', color:'#94a3b8' },
      { name:'SAP Business One', icon:'⚙️', desc:'Enterprise ERP integration via SAP B1 API connector', status:'available', category:'ERP', color:'#94a3b8' },
      { name:'WhatsApp Business', icon:'💬', desc:'Send payment reminders & alerts via WhatsApp', status:'connected', category:'Communication', color:'#10b981' },
      { name:'Gmail / G Suite', icon:'📧', desc:'Auto-extract invoices from email attachments', status:'connected', category:'Communication', color:'#ef4444' },
      { name:'GSTN Portal', icon:'🇮🇳', desc:'Auto-sync GSTR-2B data from government portal', status:'connected', category:'GST', color:'#f97316' },
      { name:'ICICI NetBanking', icon:'🏦', desc:'Initiate NEFT/RTGS payments directly from Aetra', status:'available', category:'Banking', color:'#94a3b8' },
      { name:'HDFC Bank API', icon:'🏦', desc:'Account statement sync and payment initiation', status:'available', category:'Banking', color:'#94a3b8' }
    ];
    return `
    <div class="card">
      <div style="padding:20px 24px;border-bottom:1px solid var(--border)">
        <div style="font-size:17px;font-weight:700">🔗 Integrations</div>
        <div style="font-size:13px;color:var(--text-muted);margin-top:4px">${integrations.filter(i=>i.status==='connected').length} connected • ${integrations.filter(i=>i.status==='available').length} available</div>
      </div>
      <div style="padding:20px 24px;display:grid;grid-template-columns:1fr 1fr;gap:16px">
        ${integrations.map(i => `
          <div style="padding:18px;border:1.5px solid ${i.status==='connected'?i.color:'var(--border)'};border-radius:12px;transition:all .2s;cursor:pointer;background:${i.status==='connected'?i.color+'08':'#fff'}" onmouseover="this.style.transform='translateY(-2px)';this.style.borderColor='var(--primary)'" onmouseout="this.style.transform='';this.style.borderColor='${i.status==='connected'?i.color:'var(--border)'}'">
            <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:10px">
              <div style="display:flex;align-items:center;gap:10px">
                <span style="font-size:28px">${i.icon}</span>
                <div>
                  <div style="font-size:14px;font-weight:700">${i.name}</div>
                  <span style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:var(--text-muted)">${i.category}</span>
                </div>
              </div>
              <span class="badge ${i.status==='connected'?'badge-success':'badge-gray'}">${i.status==='connected'?'✓ Connected':'Available'}</span>
            </div>
            <div style="font-size:12px;color:var(--text-muted);margin-bottom:12px">${i.desc}</div>
            <button class="btn btn-sm ${i.status==='connected'?'btn-outline':'btn-primary'}" onclick="showToast('${i.status==='connected'?`${i.name} settings opened`:`Connecting to ${i.name}...`}','info')">
              ${i.status === 'connected' ? '⚙️ Configure' : '+ Connect'}
            </button>
          </div>
        `).join('')}
      </div>
    </div>`;
  }

  function renderAPI() {
    const apiKeys = [
      { name:'Production API Key', key:`ff_prod_${(profile.token || '8f4j2k9m').slice(0,8)}...${Math.random().toString(36).slice(-4)}`, created:'March 1, 2024', lastUsed:'2 minutes ago', status:'active' },
      { name:'Development API Key', key:`ff_dev_${Math.random().toString(36).slice(2,10)}...m4s`, created:'January 15, 2024', lastUsed:'2 days ago', status:'active' },
      { name:'Webhook Secret', key:`ff_wh_${Math.random().toString(36).slice(2,10)}...v9w`, created:'February 10, 2024', lastUsed:'1 hour ago', status:'active' }
    ];
    return `
    <div class="card card-body">
      <div style="font-size:17px;font-weight:700;margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid var(--border)">⚡ API Key Management</div>
      <div style="padding:14px 16px;background:#fffbeb;border-radius:10px;border:1px solid #fde68a;margin-bottom:24px;display:flex;gap:10px;align-items:start">
        <span style="font-size:18px">🔐</span>
        <div>
          <div style="font-size:13px;font-weight:700;color:#92400e">Security Notice</div>
          <div style="font-size:12px;color:#78350f;margin-top:2px">Keep your API keys secure. Never share them publicly or commit to version control. Rotate keys every 90 days.</div>
        </div>
      </div>
      ${apiKeys.map((k, idx) => `
        <div style="padding:18px;background:var(--bg);border-radius:12px;margin-bottom:16px;border:1px solid var(--border)">
          <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:12px">
            <div>
              <div style="font-size:14px;font-weight:700">${k.name}</div>
              <div style="font-size:12px;color:var(--text-muted);margin-top:2px">Created: ${k.created} • Last used: ${k.lastUsed}</div>
            </div>
            <span class="badge badge-success">${k.status}</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <code id="apikey_${idx}" style="flex:1;padding:10px 14px;background:#1e293b;color:#7dd3fc;border-radius:8px;font-size:12px;font-family:monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${k.key}</code>
            <button class="btn btn-outline btn-sm" onclick="navigator.clipboard&&navigator.clipboard.writeText('${k.key}').then(()=>showToast('API key copied ✓'))">📋</button>
            <button class="btn btn-outline btn-sm" onclick="showToast('API key rotated — update your integrations','warning')">🔄</button>
          </div>
        </div>
      `).join('')}
      <div style="display:flex;gap:8px">
        <button class="btn btn-primary" onclick="showToast('New API key generated ✓','success')">+ Generate API Key</button>
        <button class="btn btn-outline" onclick="showToast('API documentation opened','info')">📖 View Docs</button>
      </div>
    </div>`;
  }

  function renderBilling() {
    const plans = [
      { name:'Starter', price:'₹4,999', period:'/month', features:['100 invoices/month','2 user seats','Email support','Basic reconciliation','CSV export'], popular:false, current: profile.plan==='starter' },
      { name:'Growth', price:'₹12,999', period:'/month', features:['Unlimited invoices','5 user seats','Priority support','AI insights','All export formats','WhatsApp alerts','Tally integration'], popular:true, current: profile.plan==='growth' || profile.plan==='free' },
      { name:'Enterprise', price:'Custom', period:'pricing', features:['Unlimited everything','Unlimited users','Dedicated CSM','Custom integrations','SLA guarantee','API access','White-label option'], popular:false, current: profile.plan==='enterprise' }
    ];

    return `
    <div style="display:flex;flex-direction:column;gap:24px">
      <!-- Current Plan -->
      <div class="card card-body">
        <div style="font-size:17px;font-weight:700;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid var(--border)">💳 Current Plan</div>
        <div style="padding:24px;background:linear-gradient(135deg,#0f1f33,#1e3a5f);border-radius:14px;color:#fff;margin-bottom:24px;position:relative;overflow:hidden">
          <div style="position:absolute;right:-20px;top:-20px;width:150px;height:150px;border-radius:50%;background:rgba(249,115,22,.1)"></div>
          <div style="display:flex;justify-content:space-between;align-items:start;flex-wrap:wrap;gap:16px;position:relative;z-index:1">
            <div>
              <div style="font-size:12px;opacity:.6;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Active Plan</div>
              <div style="font-size:28px;font-weight:800;margin-bottom:4px">${profile.plan==='enterprise'?'Enterprise':profile.plan==='growth'?'Growth':'Free / Trial'} Plan</div>
              <div style="font-size:15px;opacity:.8">${profile.plan==='enterprise'?'Custom pricing':profile.plan==='growth'?'₹12,999/month':'14-day trial'}</div>
              <div style="font-size:13px;opacity:.6;margin-top:6px">Next billing: April 1, 2024</div>
            </div>
            <div style="text-align:right">
              <div style="font-size:11px;opacity:.6;margin-bottom:4px">Trial days remaining</div>
              <div style="font-size:42px;font-weight:900;color:#f97316">8</div>
              <button class="btn btn-accent btn-sm" onclick="showToast('Upgraded to annual plan! Save ₹31,188/year','success')">Upgrade to Annual (Save 20%)</button>
            </div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:20px">
          ${[
            { label:'Invoices This Month', val:`${summary?.kpis?.totalInvoices || 0} / Unlimited`, icon:'🧾' },
            { label:'Vendor Profiles', val:`${summary?.kpis?.activeVendors || 0} / Unlimited`, icon:'🤝' },
            { label:'Team Members', val:'4 / 5', icon:'👥' }
          ].map(u => `
            <div style="padding:16px;background:var(--bg);border-radius:10px">
              <div style="font-size:20px;margin-bottom:6px">${u.icon}</div>
              <div style="font-size:15px;font-weight:700">${u.val}</div>
              <div style="font-size:12px;color:var(--text-muted)">${u.label}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Plan Comparison -->
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px">
        ${plans.map(p => `
          <div style="padding:24px;border-radius:14px;border:2px solid ${p.current?'var(--primary)':p.popular?'var(--accent)':'var(--border)'};background:${p.current?'#eff6ff':p.popular?'#fff7ed':'#fff'};position:relative;transition:all .2s" onmouseover="if(!${p.current}) this.style.transform='translateY(-4px)'" onmouseout="this.style.transform=''">
            ${p.popular && !p.current ? '<div style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:var(--accent);color:#fff;font-size:11px;font-weight:700;padding:4px 12px;border-radius:999px;text-transform:uppercase;letter-spacing:.5px">Most Popular</div>' : ''}
            ${p.current ? '<div style="position:absolute;top:-12px;right:16px;background:var(--primary);color:#fff;font-size:11px;font-weight:700;padding:4px 12px;border-radius:999px">Current Plan</div>' : ''}
            <div style="font-size:16px;font-weight:700;margin-bottom:8px">${p.name}</div>
            <div style="font-size:28px;font-weight:900;color:${p.current?'var(--primary)':p.popular?'var(--accent)':'var(--text)'}">${p.price}</div>
            <div style="font-size:13px;color:var(--text-muted);margin-bottom:20px">${p.period}</div>
            <ul style="list-style:none;margin-bottom:20px;display:flex;flex-direction:column;gap:8px">
              ${p.features.map(f => `<li style="font-size:13px;display:flex;align-items:center;gap:6px"><span style="color:var(--success)">✓</span>${f}</li>`).join('')}
            </ul>
            ${p.current
              ? `<button class="btn btn-outline w-full" style="justify-content:center" onclick="showToast('You are already on this plan','info')">Current Plan ✓</button>`
              : p.name === 'Enterprise'
                ? `<button class="btn btn-primary w-full" style="justify-content:center" onclick="showToast('Enterprise sales team will contact you within 24hrs','success')">Contact Sales</button>`
                : `<button class="btn btn-accent w-full" style="justify-content:center" onclick="upgradePlan('${p.name.toLowerCase()}')">Upgrade to ${p.name}</button>`
            }
          </div>
        `).join('')}
      </div>
    </div>`;
  }

  function renderSecurity() {
    return `
    <div class="card card-body">
      <div style="font-size:17px;font-weight:700;margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid var(--border)">🔐 Security Settings</div>
      ${[
        { title:'Two-Factor Authentication (2FA)', desc:'Add an extra layer of security with OTP via SMS or authenticator app', enabled:true, action:'Configure 2FA' },
        { title:'Session Timeout', desc:'Automatically log out after 30 minutes of inactivity', enabled:true, action:'Change Timeout' },
        { title:'Login Notifications', desc:'Get email alerts when a new device logs into your account', enabled:true, action:'Configure' },
        { title:'IP Whitelist', desc:'Restrict access to Aetra from specific IP addresses only', enabled:false, action:'Set IPs' },
        { title:'Audit Log', desc:'Track all user actions and system changes for SOC 2 compliance', enabled:true, action:'View Log' },
        { title:'Data Encryption', desc:'All data encrypted at rest (AES-256) and in transit (TLS 1.3)', enabled:true, action:'View Details' }
      ].map(s => `
        <div style="display:flex;align-items:center;gap:16px;padding:16px 0;border-bottom:1px solid #f1f5f9">
          <div style="flex:1">
            <div style="font-size:14px;font-weight:600">${s.title}</div>
            <div style="font-size:13px;color:var(--text-muted);margin-top:3px">${s.desc}</div>
          </div>
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
            <div style="width:40px;height:22px;border-radius:999px;background:${s.enabled?'var(--success)':'#cbd5e1'};position:relative;transition:background .2s;cursor:pointer" onclick="this.style.background=this.style.background==='rgb(16, 185, 129)'?'#cbd5e1':'rgb(16, 185, 129)';showToast('Security setting updated')">
              <div style="width:18px;height:18px;border-radius:50%;background:#fff;position:absolute;top:2px;${s.enabled?'left:19px':'left:2px'};transition:left .2s;box-shadow:0 1px 3px rgba(0,0,0,.2)"></div>
            </div>
            <span style="font-size:13px;color:var(--text-muted)">${s.enabled?'On':'Off'}</span>
          </label>
          <button class="btn btn-outline btn-sm" onclick="showToast('${s.action} opened','info')">${s.action}</button>
        </div>
      `).join('')}
      <div style="margin-top:24px;padding:16px;background:#fef2f2;border-radius:10px;border:1px solid #fecaca">
        <div style="font-size:14px;font-weight:700;color:#991b1b;margin-bottom:10px">⚠️ Danger Zone</div>
        <div style="display:flex;gap:12px">
          <button class="btn btn-danger btn-sm" onclick="showToast('Password reset email sent to ${profile.email}','info')">Change Password</button>
          <button class="btn btn-danger btn-sm" onclick="if(confirm('Sign out of all devices?')) { AppAuth.logout(); }">Sign Out All Devices</button>
          <button class="btn btn-sm" style="background:#7f1d1d;color:#fff" onclick="showToast('Account deletion request — contact support@freightflow.in','warning')">Delete Account</button>
        </div>
      </div>
    </div>`;
  }

  // Wire global handlers
  window.saveCompanyProfile = async () => {
    const btn = document.getElementById('saveProfileBtn');
    if (btn) { btn.innerHTML = '⏳ Saving...'; btn.disabled = true; }
    const updates = {
      company: document.getElementById('cpCompany')?.value,
      gstin: document.getElementById('cpGstin')?.value,
      pan: document.getElementById('cpPan')?.value,
      address: document.getElementById('cpAddress')?.value,
      state: document.getElementById('cpState')?.value,
      email: document.getElementById('cpEmail')?.value,
      phone: document.getElementById('cpPhone')?.value
    };
    if (user.id !== 'demo-user-001') {
      await API.updateProfile(user.id, updates);
    }
    Object.assign(profile, updates);
    Session.save(profile);
    showToast('Company profile saved ✓');
    if (btn) { btn.innerHTML = '💾 Save Changes'; btn.disabled = false; }
  };

  window.upgradePlan = async (plan) => {
    showToast(`⏳ Upgrading to ${plan} plan...`, 'info');
    if (user.id !== 'demo-user-001') {
      await API.upgradePlan(user.id, plan);
    }
    profile.plan = plan;
    Session.save(profile);
    showToast(`✅ Upgraded to ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan!`);
    // Update sidebar badge
    const sidebar = document.querySelector('.plan-badge');
    if (sidebar) {
      const colors = { free:'#64748b', growth:'#f97316', enterprise:'#8b5cf6', starter:'#3b82f6' };
      const c = colors[plan] || '#64748b';
      sidebar.textContent = plan.charAt(0).toUpperCase() + plan.slice(1) + ' Plan';
      sidebar.style.background = c + '22'; sidebar.style.color = c; sidebar.style.borderColor = c + '44';
    }
    render();
  };

  // Store reference for billing tab
  let summary = { kpis: {} };
  try {
    const res = await API.getSummary(user.id);
    summary = res;
  } catch (e) {}

  render();
};

function showInviteModal() {
  openModal(`
    <div class="modal modal-sm">
      <div class="modal-header">
        <div class="modal-title">👥 Invite Team Member</div>
        <button class="modal-close" onclick="closeModal()">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Full Name *</label>
          <input class="form-input" type="text" id="inviteName" placeholder="John Doe">
        </div>
        
        <div class="form-group">
          <label class="form-label">Email Address *</label>
          <input class="form-input" type="email" id="inviteEmail" placeholder="colleague@yourcompany.in">
        </div>
        
        <div class="form-group">
          <label class="form-label">Role</label>
          <select class="form-input" id="inviteRole">
            <option>Finance Manager</option>
            <option>Operations</option>
            <option>Viewer</option>
            <option>Admin</option>
          </select>
        </div>
        
        <p style="color:#666;font-size:13px;margin-top:16px">
          💡 <strong>Invitation will be sent via email.</strong> The team member will receive a professional email with a link to accept and set up their account.
        </p>
      </div>
      <div class="modal-footer">
        <div style="display:flex;gap:8px;width:100%;justify-content:space-between">
          <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
          <button class="btn btn-primary" style="flex:1" onclick="window.prepareAndSendInvite('email')">📧 Send Invitation</button>
        </div>
      </div>
    </div>`);

  window.prepareAndSendInvite = async (channel = 'email') => {
    const name = document.getElementById('inviteName')?.value?.trim();
    let email = document.getElementById('inviteEmail')?.value?.trim();
    const role = document.getElementById('inviteRole')?.value;
    
    // Validation - Name is always required
    if (!name) { 
      showToast('❌ Full name is required', 'error'); 
      return; 
    }
    
    // Email is required (only channel now)
    if (!email) { 
      showToast('❌ Email address is required', 'error'); 
      return; 
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast('❌ Invalid email address', 'error');
      return;
    }
    
    try {
      // Send invitation via email
      const inviteData = {
        name: name, 
        role: role, 
        channel: 'email',
        email: email
      } else if (channel === 'whatsapp') {
      };
      
      const res = await fetch('https://freightflow-pkf5.onrender.com/auth/invite', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: Session.getToken() ? `Bearer ${Session.getToken()}` : undefined 
        },
        body: JSON.stringify(inviteData)
      });
      const result = await res.json();

      if (result && result.invite_token) {
        const emailStatus = result.email?.status || 'unknown';
        let statusMsg = '✅ Invitation sent to ' + email + '\n   Name: ' + name + '\n   Role: ' + role;
        
        if (emailStatus === 'mock') {
          statusMsg += '\n\n⚠️ Email in MOCK MODE (check server logs)';
        } else if (emailStatus === 'error') {
          statusMsg += '\n❌ ' + (result.email?.error || 'Email delivery failed');
        } else {
          statusMsg += '\n\n💌 They will receive an email with a link to accept the invitation.';
        }
        
        showToast(statusMsg, result.email?.error ? 'warning' : 'success');
        closeModal();
      } else if (result && result.error) {
        showToast('❌ ' + (result.error || 'Failed to send invite'), 'error');
      } else {
        showToast('❌ Failed to send invite', 'error');
      }
    } catch (err) {
      console.error('Error sending invite:', err);
      showToast('❌ Error: ' + err.message, 'error');
    }
  };

  // Show/hide fields based on user interaction with buttons
  setTimeout(() => {
    // Find buttons by their onclick handler content
    const allButtons = document.querySelectorAll('button');
    let emailBtn = null;
    let whatsappBtn = null;
    
    allButtons.forEach(btn => {
      const onclick = btn.getAttribute('onclick');
      if (onclick && onclick.includes("'email'")) {
        emailBtn = btn;
      } else if (onclick && onclick.includes("'whatsapp'")) {
        whatsappBtn = btn;
      }
    });
    
    if (emailBtn && whatsappBtn) {
      // Add click handlers to show/hide fields when buttons are clicked
      emailBtn.addEventListener('click', () => {
        const emailContainer = document.getElementById('emailFieldsContainer');
        const waContainer = document.getElementById('whatsappFieldsContainer');
        if (emailContainer) emailContainer.style.display = 'block';
        if (waContainer) waContainer.style.display = 'none';
      });
      
      whatsappBtn.addEventListener('click', () => {
        const waContainer = document.getElementById('whatsappFieldsContainer');
        const emailContainer = document.getElementById('emailFieldsContainer');
        if (waContainer) waContainer.style.display = 'block';
        if (emailContainer) emailContainer.style.display = 'none';
      });
    }
  }, 100);
}
