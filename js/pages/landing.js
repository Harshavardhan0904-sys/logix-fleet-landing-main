// ============================================================
// Aetra — Landing Page (Enterprise SaaS Quality)
// ============================================================

Pages.landing = function(container) {
  container.innerHTML = `
  <div class="landing">
    <!-- NAVBAR -->
    <nav class="landing-nav" id="landingNav">
      <a href="#" class="nav-logo" onclick="return false">
        <div class="nav-logo-icon">🚛</div>
        <span class="nav-logo-text">Aetra</span>
      </a>
      <div class="nav-links">
        <a href="#features" onclick="scrollToSection('features');return false">Features</a>
        <a href="#pricing" onclick="scrollToSection('pricing');return false">Pricing</a>
        <a href="#testimonials" onclick="scrollToSection('testimonials');return false">Customers</a>
        <a href="#integrations" onclick="scrollToSection('integrations');return false">Integrations</a>
      </div>
      <div class="nav-actions">
        <button class="btn btn-outline btn-sm" onclick="Router.navigate('login')">Sign In</button>
        <button class="btn btn-accent btn-sm" onclick="Router.navigate('register')">Start Free Trial →</button>
      </div>
    </nav>

    <!-- HERO SECTION -->
    <section class="hero" id="hero">
      <div class="hero-grid">
        <div>
          <div class="hero-eyebrow">
            <span>🇮🇳</span>
            <span>Built for Indian Logistics SMEs</span>
          </div>
          <h1>Stop Losing Money on <span>Invoice Errors</span> & GST Mismatches</h1>
          <p>Aetra automates freight invoice reconciliation, catches errors before they cost you, and recovers GST you'd otherwise miss. Used by 500+ logistics companies across India.</p>
          <div class="hero-actions">
            <button class="btn btn-accent btn-lg" onclick="Router.navigate('register')">
              🚀 Start Free 14-Day Trial
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
            <button class="btn btn-lg" style="background:rgba(255,255,255,.1);color:#fff;border:1px solid rgba(255,255,255,.25)" onclick="Router.navigate('login')">
              👁 Live Demo
            </button>
          </div>
          <div style="margin-top:24px;display:flex;align-items:center;gap:12px;flex-wrap:wrap">
            <div style="display:flex;align-items:center;gap:4px">
              ${['🟡','🟡','🟡','🟡','🟡'].join('')}
              <span style="font-size:13px;color:rgba(255,255,255,.6);margin-left:6px">4.9/5 from 200+ reviews</span>
            </div>
            <span style="color:rgba(255,255,255,.2)">•</span>
            <span style="font-size:13px;color:rgba(255,255,255,.6)">No credit card required</span>
            <span style="color:rgba(255,255,255,.2)">•</span>
            <span style="font-size:13px;color:rgba(255,255,255,.6)">Setup in 48 hours</span>
          </div>
        </div>

        <!-- HERO VISUAL — Dashboard Preview -->
        <div class="hero-visual">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px">
            <div style="width:10px;height:10px;border-radius:50%;background:#ef4444"></div>
            <div style="width:10px;height:10px;border-radius:50%;background:#f59e0b"></div>
            <div style="width:10px;height:10px;border-radius:50%;background:#10b981"></div>
            <span style="font-size:12px;color:rgba(255,255,255,.4);margin-left:8px">Aetra Dashboard</span>
          </div>

          <!-- KPI Mini Cards -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">
            ${[
              { label:'Total Invoices', val:'284', sub:'↑ 12% this month', c:'#60a5fa' },
              { label:'ITC Recovered', val:'₹58.4L', sub:'↑ 8.4% this month', c:'#34d399' },
              { label:'Overdue', val:'₹6.2L', sub:'3 vendors affected', c:'#f87171' },
              { label:'Avg Score', val:'87/100', sub:'Vendor health', c:'#fbbf24' }
            ].map(k => `
              <div class="hero-card">
                <div class="hc-label">${k.label}</div>
                <div class="hc-value" style="color:${k.c}">${k.val}</div>
                <div class="hc-change">${k.sub}</div>
              </div>
            `).join('')}
          </div>

          <!-- Mini Invoice List -->
          <div style="font-size:11px;color:rgba(255,255,255,.4);margin-bottom:8px;text-transform:uppercase;letter-spacing:.8px">Recent Invoices</div>
          ${[
            { vendor:'Delhivery Ltd', amount:'₹3.36L', status:'✓ Paid', c:'#34d399' },
            { vendor:'BlueDart Express', amount:'₹1.48L', status:'⏳ Pending', c:'#fbbf24' },
            { vendor:'TCI Express', amount:'₹4.01L', status:'⚠ Overdue', c:'#f87171' },
            { vendor:'Gati Logistics', amount:'₹2.27L', status:'✓ Matched', c:'#34d399' }
          ].map(i => `
            <div class="hero-invoice-row">
              <div style="width:24px;height:24px;border-radius:6px;background:rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:rgba(255,255,255,.6);flex-shrink:0">${i.vendor.slice(0,2)}</div>
              <div class="inv-vendor">${i.vendor}</div>
              <div class="inv-amount">${i.amount}</div>
              <span style="font-size:11px;color:${i.c};font-weight:600;flex-shrink:0">${i.status}</span>
            </div>
          `).join('')}

          <!-- Mini AI Banner -->
          <div style="margin-top:12px;padding:12px 14px;background:rgba(249,115,22,.1);border-radius:8px;border:1px solid rgba(249,115,22,.25);display:flex;align-items:center;gap:8px">
            <span style="font-size:16px">🤖</span>
            <div>
              <div style="font-size:11px;color:rgba(255,255,255,.5);margin-bottom:2px">AI Insight</div>
              <div style="font-size:12px;color:rgba(255,255,255,.85);font-weight:500">₹2.1L freight savings found — 3 route consolidations</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Hero Stats -->
      <div class="hero-stats" style="max-width:1200px;margin:48px auto 0">
        ${[
          { val:'₹2.3L Cr', label:'India logistics market (2024)' },
          { val:'60%', label:'SMEs still use manual reconciliation' },
          { val:'40%', label:'Invoices have errors causing ITC loss' }
        ].map(s => `
          <div class="hero-stat">
            <div class="stat-value">${s.val}</div>
            <div class="stat-label">${s.label}</div>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- STATS BAR -->
    <div class="stats-bar">
      <div class="stats-bar-grid">
        ${[
          { val:'500+', label:'Logistics companies' },
          { val:'₹42 Cr', label:'ITC recovered for clients' },
          { val:'94%', label:'Error reduction rate' },
          { val:'10×', label:'Faster reconciliation' }
        ].map(s => `
          <div class="stat-item">
            <div class="val">${s.val}</div>
            <div class="lbl">${s.label}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- PROBLEM SECTION -->
    <section style="padding:96px 5%;background:#fff" id="problem">
      <div style="max-width:1200px;margin:0 auto">
        <div style="text-align:center;margin-bottom:60px">
          <div class="section-tag">The Problem</div>
          <h2 class="section-title">Manual invoice processing is killing your margins</h2>
          <p class="section-subtitle" style="margin:14px auto 0">Indian logistics SMEs lose ₹8,000-₹50,000 every month to invoice errors, missed ITC, and payment delays.</p>
        </div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px">
          ${[
            { icon:'😤', title:'Manual reconciliation takes 2-5 days', desc:'Your finance team spends 3 days/month matching 200+ freight invoices against purchase orders and delivery receipts. Every error needs 2 hours of investigation.', pain:'₹15,000/month in wasted labor', c:'#fef2f2', border:'#fecaca', tc:'#991b1b' },
            { icon:'💸', title:'Missed ITC claims = direct cash loss', desc:'40% of freight invoices have GST mismatches. Without automated GSTR-2B reconciliation, you miss ITC claims worth ₹2-8L every quarter.', pain:'₹6L/quarter in missed ITC', c:'#fffbeb', border:'#fde68a', tc:'#92400e' },
            { icon:'⚠️', title:'Late payments damage vendor relationships', desc:'Without payment tracking and aging alerts, overdue invoices accumulate. Vendors penalize late payments at 1.5-2% monthly interest, adding up quickly.', pain:'₹8,200/month in interest', c:'#fdf4ff', border:'#e9d5ff', tc:'#6b21a8' }
          ].map(p => `
            <div style="padding:28px;border-radius:16px;background:${p.c};border:1.5px solid ${p.border}">
              <div style="font-size:36px;margin-bottom:14px">${p.icon}</div>
              <h3 style="font-size:17px;font-weight:700;color:var(--text);margin-bottom:10px">${p.title}</h3>
              <p style="font-size:14px;color:var(--text-muted);line-height:1.7;margin-bottom:16px">${p.desc}</p>
              <div style="padding:8px 12px;background:rgba(255,255,255,.6);border-radius:8px;font-size:13px;font-weight:700;color:${p.tc}">💸 True cost: ${p.pain}</div>
            </div>
          `).join('')}
        </div>
        <div style="text-align:center;margin-top:48px">
          <div style="font-size:18px;font-weight:700;color:var(--primary);margin-bottom:16px">👇 Aetra solves all three problems automatically</div>
          <button class="btn btn-primary btn-lg" onclick="scrollToSection('features')">See How It Works →</button>
        </div>
      </div>
    </section>

    <!-- FEATURES SECTION -->
    <section class="features-section" id="features">
      <div style="max-width:1200px;margin:0 auto">
        <div style="text-align:center;margin-bottom:12px">
          <div class="section-tag">Platform Features</div>
          <h2 class="section-title">Everything you need to automate freight finance</h2>
          <p class="section-subtitle" style="margin:14px auto 0">8 powerful modules designed specifically for Indian logistics SMEs. GST-native, ₹-first, and built for your workflow.</p>
        </div>
        <div class="features-grid" style="margin-top:56px">
          ${[
            { icon:'🧾', title:'Smart Invoice Management', desc:'Upload PDFs or CSVs. AI extracts data, matches against POs, flags discrepancies. Bulk approve or pay with one click.', tag:'Core', tagC:'#1e40af', tagBg:'#dbeafe' },
            { icon:'📊', title:'GSTR-2B Auto-Reconciliation', desc:'Connect to GSTN portal. Automatically match invoices against GSTR-2B, identify mismatches, and calculate exact ITC eligible for claim.', tag:'GST', tagC:'#166534', tagBg:'#dcfce7' },
            { icon:'💸', title:'Payment Tracking & Aging', desc:'5-bucket aging analysis (Current to 90+ days). One-click reminders, NEFT/RTGS initiation, UTR tracking. Never miss a due date.', tag:'Finance', tagC:'#92400e', tagBg:'#fef3c7' },
            { icon:'⭐', title:'Vendor Performance Scoring', desc:'Auto-calculate vendor scores from on-time %, accuracy %, and dispute rate. Color-coded A-D grades with sparkline trends.', tag:'Vendors', tagC:'#5b21b6', tagBg:'#ede9fe' },
            { icon:'🤖', title:'AI Cost Intelligence', desc:'Predict next month freight spend. Find route consolidation savings. Identify overpriced vendors and suggest alternatives.', tag:'AI/ML', tagC:'#9a3412', tagBg:'#fff7ed' },
            { icon:'📈', title:'Reports & Analytics', desc:'Monthly spend trends, freight-to-revenue ratio, route analysis, industry benchmarks. Export CSV, Excel, or PDF with one click.', tag:'Reports', tagC:'#1e40af', tagBg:'#dbeafe' },
            { icon:'🚛', title:'Shipment Tracking', desc:'Multi-carrier tracking from Delhivery to BlueDart. Visual route maps, checkpoint timeline, POD download, LR# search.', tag:'Tracking', tagC:'#166534', tagBg:'#dcfce7' },
            { icon:'🔗', title:'Integrations', desc:'Tally Prime, SAP B1, Zoho Books, WhatsApp Business, Gmail, GSTN portal, HDFC & ICICI NetBanking — all in one platform.', tag:'Connect', tagC:'#92400e', tagBg:'#fef3c7' },
            { icon:'🏢', title:'Multi-Tenant & Team', desc:'Role-based access (Admin, Finance, Ops, Viewer). Invite team members, manage permissions, full audit trail for compliance.', tag:'Enterprise', tagC:'#5b21b6', tagBg:'#ede9fe' }
          ].map(f => `
            <div class="feature-card">
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
                <div class="feature-icon" style="background:${f.tagBg}">${f.icon}</div>
                <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:${f.tagC};background:${f.tagBg};padding:3px 8px;border-radius:4px">${f.tag}</span>
              </div>
              <div class="feature-title">${f.title}</div>
              <div class="feature-desc">${f.desc}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- HOW IT WORKS -->
    <section style="padding:96px 5%;background:linear-gradient(180deg,#f8fafc,#fff)" id="how-it-works">
      <div style="max-width:1100px;margin:0 auto">
        <div style="text-align:center;margin-bottom:60px">
          <div class="section-tag">How It Works</div>
          <h2 class="section-title">From manual chaos to automated clarity in 48 hours</h2>
        </div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:32px;position:relative">
          <div style="position:absolute;top:40px;left:12%;right:12%;height:2px;background:linear-gradient(90deg,var(--accent),var(--primary));z-index:0"></div>
          ${[
            { step:'01', icon:'📥', title:'Upload Invoices', desc:'PDF, CSV or connect your ERP. AI extracts all data automatically.' },
            { step:'02', icon:'🤖', title:'AI Reconciles', desc:'Automatically matches against POs, GSTN, and payment records.' },
            { step:'03', icon:'⚠️', title:'Review Mismatches', desc:'Get instant alerts on errors and mismatches that need your attention.' },
            { step:'04', icon:'✅', title:'Approve & Pay', desc:'One-click bulk approve and pay with NEFT/RTGS directly from platform.' }
          ].map((s, i) => `
            <div style="text-align:center;position:relative;z-index:1">
              <div style="width:80px;height:80px;border-radius:20px;background:${i%2===0?'var(--primary)':'var(--accent)'};color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;margin:0 auto 20px;box-shadow:0 8px 24px ${i%2===0?'rgba(30,58,95,.3)':'rgba(249,115,22,.3)'}">
                <span style="font-size:24px">${s.icon}</span>
              </div>
              <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted);margin-bottom:6px">Step ${s.step}</div>
              <div style="font-size:16px;font-weight:700;color:var(--primary);margin-bottom:8px">${s.title}</div>
              <div style="font-size:14px;color:var(--text-muted);line-height:1.6">${s.desc}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- INTEGRATIONS -->
    <section style="padding:80px 5%;background:#fff" id="integrations">
      <div style="max-width:1200px;margin:0 auto;text-align:center">
        <div class="section-tag">Integrations</div>
        <h2 class="section-title">Works with tools you already use</h2>
        <div style="display:flex;flex-wrap:wrap;gap:16px;justify-content:center;margin-top:40px">
          ${[
            { icon:'📊', name:'Tally Prime', desc:'ERP' },
            { icon:'⚙️', name:'SAP B1', desc:'ERP' },
            { icon:'📚', name:'Zoho Books', desc:'Accounting' },
            { icon:'💬', name:'WhatsApp', desc:'Alerts' },
            { icon:'📧', name:'Gmail', desc:'Email' },
            { icon:'🇮🇳', name:'GSTN Portal', desc:'GST' },
            { icon:'🏦', name:'HDFC Bank', desc:'Banking' },
            { icon:'🏦', name:'ICICI Bank', desc:'Banking' },
            { icon:'🚛', name:'Delhivery API', desc:'Tracking' },
            { icon:'✈️', name:'BlueDart', desc:'Tracking' }
          ].map(i => `
            <div style="padding:16px 20px;border:1.5px solid var(--border);border-radius:12px;display:flex;align-items:center;gap:10px;background:#fff;transition:all .2s;cursor:default;min-width:130px" onmouseover="this.style.borderColor='var(--primary)';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='var(--border)';this.style.transform=''">
              <span style="font-size:24px">${i.icon}</span>
              <div>
                <div style="font-size:13px;font-weight:700">${i.name}</div>
                <div style="font-size:11px;color:var(--text-muted)">${i.desc}</div>
              </div>
            </div>
          `).join('')}
        </div>
        <div style="margin-top:24px;font-size:14px;color:var(--text-muted)">+ REST API for custom integrations • Webhooks • Zapier connector (Q3 2024)</div>
      </div>
    </section>

    <!-- PRICING SECTION -->
    <section class="pricing-section" id="pricing">
      <div style="max-width:1200px;margin:0 auto">
        <div style="text-align:center;margin-bottom:12px">
          <div class="section-tag">Transparent Pricing</div>
          <h2 class="section-title">Plans built for Indian logistics teams</h2>
          <p class="section-subtitle" style="margin:14px auto 0">All prices in INR. No hidden charges. GST invoice provided.</p>
          <div style="display:inline-flex;align-items:center;gap:12px;margin-top:20px;padding:6px;background:var(--bg);border-radius:10px;border:1px solid var(--border)">
            <button id="toggleMonthly" class="btn btn-sm btn-primary" style="padding:8px 20px">Monthly</button>
            <button id="toggleAnnual" class="btn btn-sm btn-outline" style="padding:8px 20px" onclick="switchBilling('annual')">Annual (Save 20%) 🏷️</button>
          </div>
        </div>
        <div class="pricing-grid">
          ${[
            {
              name:'Starter', price:'₹4,999', annual:'₹3,999', period:'/month', desc:'For small logistics teams getting started',
              features:['100 invoices/month','2 user seats','Email support','Basic reconciliation','CSV export','GST compliance basics','Basic reporting'],
              cta:'Start Free Trial', ctaClass:'btn-primary', popular:false
            },
            {
              name:'Growth', price:'₹12,999', annual:'₹10,399', period:'/month', desc:'Most popular for growing 3PLs and freight forwarders',
              features:['Unlimited invoices','5 user seats','Priority support (4hr SLA)','Full AI intelligence','All export formats (CSV/Excel/PDF)','WhatsApp + SMS alerts','Tally & Zoho integration','Advanced analytics & benchmarks','Shipment tracking'],
              cta:'Start Free Trial', ctaClass:'btn-accent', popular:true
            },
            {
              name:'Enterprise', price:'Custom', annual:'Custom', period:'pricing', desc:'For large logistics companies with custom needs',
              features:['Unlimited everything','Unlimited users','Dedicated CSM + SLA','SAP/Oracle ERP integration','White-label option','Custom AI models','API access & webhooks','99.9% uptime SLA','On-premise deployment'],
              cta:'Contact Sales', ctaClass:'btn-outline', popular:false
            }
          ].map(p => `
            <div class="pricing-card${p.popular?' popular':''}">
              ${p.popular ? '<div class="pricing-popular-badge">⭐ Most Popular</div>' : ''}
              <div class="pricing-plan">${p.name}</div>
              <div class="pricing-price">
                <span class="price" id="price_${p.name.toLowerCase()}">${p.price}</span>
                <span class="period">${p.period}</span>
              </div>
              <div style="font-size:12px;color:var(--text-muted);margin-top:4px" id="annual_${p.name.toLowerCase()}">Billed monthly</div>
              <div class="pricing-desc">${p.desc}</div>
              <ul class="pricing-features">
                ${p.features.map(f => `<li>${f}</li>`).join('')}
              </ul>
              <button class="btn ${p.ctaClass} w-full" style="justify-content:center" onclick="${p.name==='Enterprise'?`showToast('Enterprise sales team will reach out in 24hrs — call +91 98765 43210','info')`:`Router.navigate('register')`}">
                ${p.cta} →
              </button>
              ${p.popular ? '<div style="text-align:center;margin-top:12px;font-size:12px;color:var(--accent)">🎁 14 days free, no credit card needed</div>' : ''}
            </div>
          `).join('')}
        </div>

        <div style="text-align:center;margin-top:40px;padding:24px;background:var(--bg);border-radius:12px;border:1px solid var(--border)">
          <div style="font-size:15px;font-weight:600;margin-bottom:8px">🏢 All plans include</div>
          <div style="display:flex;flex-wrap:wrap;gap:16px;justify-content:center;font-size:13px;color:var(--text-muted)">
            ${['256-bit encryption','99.9% uptime SLA','GST invoice','Indian data residency','Free migration support','GSTN portal integration'].map(f=>`<span>✓ ${f}</span>`).join('')}
          </div>
        </div>
      </div>
    </section>

    <!-- TESTIMONIALS -->
    <section class="testimonials-section" id="testimonials">
      <div style="max-width:1200px;margin:0 auto">
        <div style="text-align:center;margin-bottom:12px">
          <div class="section-tag">Customer Stories</div>
          <h2 class="section-title">Trusted by logistics companies across India</h2>
          <p class="section-subtitle" style="margin:14px auto 0">Real results from real logistics teams — from Mumbai to Chennai, Delhi to Bangalore.</p>
        </div>
        <div class="testimonials-grid" style="margin-top:56px">
          ${[
            { text:'We were losing ₹4.5L per quarter in missed ITC claims. Aetra caught everything in 3 days. ROI in the very first month. My CA was impressed!', name:'Rajesh Mehta', role:'Finance Director', company:'Transworld Logistics, Mumbai', avatar:'RM', city:'Mumbai', saving:'₹18L/year saved' },
            { text:'GSTR-2B reconciliation used to take my team 4 days every month. Now it\'s done overnight automatically. We also found 3 overcharging vendors. Game changer!', name:'Priya Krishnamurthy', role:'CFO', company:'South Express Freight, Chennai', avatar:'PK', city:'Chennai', saving:'4 days → 2 hours' },
            { text:'Handling 500+ invoices from 8 vendors was a nightmare. Aetra automated everything and the AI insights identified ₹2.1L in savings every month through route optimization.', name:'Vikram Singh', role:'Operations Manager', company:'Northstar 3PL, Delhi NCR', avatar:'VS', city:'Delhi', saving:'₹25L/year saved' }
          ].map(t => `
            <div class="testimonial-card">
              <div class="stars">★★★★★</div>
              <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;background:#f0fdf4;border-radius:6px;font-size:12px;font-weight:700;color:#166534;margin-bottom:12px">
                💰 ${t.saving}
              </div>
              <p class="testimonial-text">${t.text}</p>
              <div class="testimonial-author">
                <div class="testimonial-avatar">${t.avatar}</div>
                <div>
                  <div class="testimonial-name">${t.name}</div>
                  <div class="testimonial-role">${t.role} • ${t.company}</div>
                  <div style="font-size:11px;color:var(--text-light);margin-top:2px">📍 ${t.city}</div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Company logos bar -->
        <div style="margin-top:60px;text-align:center">
          <div style="font-size:13px;color:var(--text-light);margin-bottom:24px;text-transform:uppercase;letter-spacing:1px">Trusted by 500+ companies including</div>
          <div style="display:flex;flex-wrap:wrap;gap:32px;justify-content:center;align-items:center">
            ${['🚛 Mahindra Logistics', '📦 Safexpress', '✈️ BlueDart', '🏭 TVS Supply Chain', '🌐 DHL India', '📮 Delhivery'].map(c=>`
              <div style="font-size:15px;font-weight:700;color:var(--text-muted);opacity:.6">${c}</div>
            `).join('')}
          </div>
        </div>
      </div>
    </section>

    <!-- CTA SECTION -->
    <section class="cta-section" id="cta">
      <div style="max-width:800px;margin:0 auto;position:relative;z-index:1">
        <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(249,115,22,.15);color:#fb923c;padding:6px 16px;border-radius:20px;font-size:13px;font-weight:600;margin-bottom:24px;border:1px solid rgba(249,115,22,.3)">
          🆓 14-Day Free Trial • No Credit Card
        </div>
        <h2>Ready to automate your freight finance?</h2>
        <p>Join 500+ logistics companies saving an average of ₹18L/year with Aetra. Set up in 48 hours with our dedicated onboarding team.</p>
        <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap">
          <button class="btn btn-accent btn-lg" onclick="Router.navigate('register')">
            🚀 Start Free Trial — No Credit Card
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
          <button class="btn btn-lg" style="background:rgba(255,255,255,.1);color:#fff;border:1px solid rgba(255,255,255,.25)" onclick="Router.navigate('login')">
            👁 Explore Demo
          </button>
        </div>
        <div style="margin-top:20px;font-size:13px;color:rgba(255,255,255,.5)">
          Questions? Call us: <strong style="color:rgba(255,255,255,.8)">+91 98765 43210</strong> or email <strong style="color:rgba(255,255,255,.8)">sales@freightflow.in</strong>
        </div>
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="footer">
      <div style="max-width:1200px;margin:0 auto">
        <div class="footer-grid">
          <div class="footer-logo">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
              <div style="width:40px;height:40px;background:var(--accent);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:22px">🚛</div>
              <h3>Aetra</h3>
            </div>
            <p>India's most trusted freight invoice automation platform for logistics SMEs. Automate reconciliation, recover ITC, track payments, and optimize vendor performance.</p>
            <div style="margin-top:20px;display:flex;gap:12px">
              ${['🐦 Twitter', '💼 LinkedIn', '📘 Facebook'].map(s=>`<button class="btn btn-sm" style="background:rgba(255,255,255,.08);color:rgba(255,255,255,.7);border:1px solid rgba(255,255,255,.15)" onclick="showToast('Opening ${s.split(' ')[1]}','info')">${s}</button>`).join('')}
            </div>
          </div>
          <div class="footer-col">
            <h4>Product</h4>
            <ul>
              ${['Invoice Management','GST Compliance','Payments & Aging','Vendor Scoring','AI Intelligence','Shipment Tracking','Reports'].map(l=>`<li><a href="#" onclick="Router.navigate('login');return false">${l}</a></li>`).join('')}
            </ul>
          </div>
          <div class="footer-col">
            <h4>Company</h4>
            <ul>
              ${['About Aetra','Pricing','Customer Stories','Blog & Insights','Careers','Press Kit','Contact Us'].map(l=>`<li><a href="#" onclick="return false">${l}</a></li>`).join('')}
            </ul>
          </div>
          <div class="footer-col">
            <h4>Support & Legal</h4>
            <ul>
              ${['Documentation','API Reference','System Status','Terms of Service','Privacy Policy','Refund Policy','Security'].map(l=>`<li><a href="#" onclick="return false">${l}</a></li>`).join('')}
            </ul>
            <div style="margin-top:20px;padding:12px;background:rgba(255,255,255,.05);border-radius:8px;font-size:12px;color:rgba(255,255,255,.5)">
              🇮🇳 Made in India<br>
              Data stored on Indian servers<br>
              GST Reg: 27AABCF1234G1ZX
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <p>© 2024 Aetra Technologies Pvt Ltd. All rights reserved. CIN: U74999MH2024PTC123456</p>
          <p style="color:rgba(255,255,255,.3)">🔒 SOC 2 Compliant • ISO 27001 Certified • RBI Compliant</p>
        </div>
      </div>
    </footer>
  </div>
  `;

  // Navbar scroll effect
  window.addEventListener('scroll', () => {
    const nav = document.getElementById('landingNav');
    if (nav) nav.style.boxShadow = window.scrollY > 20 ? 'var(--shadow-lg)' : 'none';
  });

  // Smooth scroll function
  window.scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Billing toggle
  window.switchBilling = (type) => {
    const monthly = document.getElementById('toggleMonthly');
    const annual = document.getElementById('toggleAnnual');
    if (type === 'annual') {
      if (monthly) { monthly.className = 'btn btn-sm btn-outline'; monthly.setAttribute('onclick','switchBilling(\'monthly\')'); }
      if (annual) { annual.className = 'btn btn-sm btn-primary'; }
      // Update prices
      [['starter','₹3,999'],['growth','₹10,399'],['enterprise','Custom']].forEach(([plan, price]) => {
        const el = document.getElementById('price_' + plan);
        const sub = document.getElementById('annual_' + plan);
        if (el) el.textContent = price;
        if (sub) sub.textContent = 'Billed annually — save 20%';
      });
    } else {
      if (annual) { annual.className = 'btn btn-sm btn-outline'; annual.setAttribute('onclick','switchBilling(\'annual\')'); }
      if (monthly) { monthly.className = 'btn btn-sm btn-primary'; }
      [['starter','₹4,999'],['growth','₹12,999'],['enterprise','Custom']].forEach(([plan, price]) => {
        const el = document.getElementById('price_' + plan);
        const sub = document.getElementById('annual_' + plan);
        if (el) el.textContent = price;
        if (sub) sub.textContent = 'Billed monthly';
      });
    }
  };
};
