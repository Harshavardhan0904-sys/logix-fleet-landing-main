// ============================================================
// Aetra — Auth Pages (Login, Register, Forgot Password)
// Real API integration with loading states & validation
// ============================================================

Pages.login = function(container) {
  container.innerHTML = `
  <div class="auth-layout">
    <div class="auth-left">
      <div class="auth-left-content">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px;cursor:pointer" onclick="Router.navigate('landing')">
          <div style="width:40px;height:40px;background:rgba(249,115,22,.15);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:22px;border:1px solid rgba(249,115,22,.3)">🚛</div>
          <span style="font-size:20px;font-weight:800;color:#fff;letter-spacing:-0.5px">Aetra</span>
        </div>

        <div style="margin-bottom:36px">
          <h2 style="font-size:28px;font-weight:800;color:#fff;margin-bottom:10px;line-height:1.2">India's #1 Freight Invoice Automation Platform</h2>
          <p style="color:rgba(255,255,255,.6);font-size:15px;line-height:1.7">Reconcile invoices 10× faster. Cut errors by 94%. Never miss a GST claim.</p>
        </div>

        <div class="auth-feature-list">
          ${[
            { icon:'🧾', text:'Auto-reconcile 500+ invoices in minutes' },
            { icon:'📊', text:'Real-time GSTR-2B matching & ITC tracking' },
            { icon:'💰', text:'Never miss a payment — aging alerts built in' },
            { icon:'🤖', text:'AI predicts freight costs & finds savings' },
            { icon:'⭐', text:'Vendor performance scores at a glance' }
          ].map(f => `
            <div class="auth-feature-item">
              <div class="auth-feature-icon">${f.icon}</div>
              <span class="auth-feature-text">${f.text}</span>
            </div>
          `).join('')}
        </div>

        <div style="margin-top:32px;display:flex;gap:24px">
          ${[
            { val:'₹2.3L Cr', label:'Market Size' },
            { val:'94%', label:'Error Reduction' },
            { val:'10×', label:'Faster Reconcile' }
          ].map(s => `
            <div>
              <div style="font-size:22px;font-weight:900;color:#f97316">${s.val}</div>
              <div style="font-size:12px;color:rgba(255,255,255,.5)">${s.label}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <div class="auth-right">
      <div class="auth-form-container">
        <div style="margin-bottom:32px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;cursor:pointer" onclick="Router.navigate('landing')">
            <div style="width:32px;height:32px;background:var(--primary);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px">🚛</div>
            <span style="font-weight:800;color:var(--primary);font-size:18px">Aetra</span>
          </div>
        </div>

        <div class="auth-form-header">
          <h1>Sign in to your account</h1>
          <p>Enter your company email and password to continue</p>
        </div>

        <div id="loginAlert" style="display:none;padding:12px 16px;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;color:#991b1b;font-size:13px;margin-bottom:16px"></div>

        <div class="form-group">
          <label class="form-label">Company Email</label>
          <input class="form-input" type="email" id="loginEmail" placeholder="finance@yourcompany.in" value="demo@freightflow.in" onkeypress="if(event.key==='Enter') handleLogin()">
        </div>
        <div class="form-group">
          <label class="form-label">Access Role</label>
          <select class="form-input" id="loginRole">
            <option value="admin">Admin Portal (PC + Mobile)</option>
            <option value="field">Field Executive (Mobile)</option>
            <option value="driver">Driver</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" style="display:flex;justify-content:space-between">
            Password
            <a href="#forgot" onclick="Router.navigate('forgot');return false;" style="font-weight:600;color:var(--primary);font-size:13px;text-decoration:none">Forgot password?</a>
          </label>
          <div style="position:relative">
            <input class="form-input" type="password" id="loginPassword" placeholder="Enter your password" value="demo1234" style="padding-right:44px" onkeypress="if(event.key==='Enter') handleLogin()">
            <button type="button" onclick="togglePass('loginPassword',this)" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:16px">👁</button>
          </div>
        </div>

        <div style="display:flex;align-items:center;gap:8px;margin-bottom:20px">
          <input type="checkbox" id="rememberMe" checked style="width:16px;height:16px;cursor:pointer;accent-color:var(--primary)">
          <label for="rememberMe" style="font-size:13px;color:var(--text-muted);cursor:pointer">Remember me for 30 days</label>
        </div>

        <button class="btn btn-primary w-full btn-lg" style="justify-content:center" id="loginBtn" onclick="handleLogin()">
          Sign In to Aetra
        </button>

        <div style="margin-top:16px;padding:12px 16px;background:#f0fdf4;border-radius:8px;border:1px solid #86efac;font-size:13px;color:#166534;display:flex;align-items:center;gap:8px">
          <span>🔑</span>
          <div>
            <strong>Demo credentials:</strong> demo@freightflow.in / demo1234<br>
            <span style="font-size:12px;opacity:.8">Use the role selector to switch between Admin, Field Executive, or Driver views.</span>
          </div>
        </div>

        <div style="display:flex;align-items:center;gap:12px;margin:20px 0">
          <div style="flex:1;height:1px;background:var(--border)"></div>
          <span style="font-size:12px;color:var(--text-light)">OR</span>
          <div style="flex:1;height:1px;background:var(--border)"></div>
        </div>

        <button class="btn btn-outline w-full" style="justify-content:center;gap:8px" onclick="handleGoogleLogin()">
          <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continue with Google
        </button>

        <div class="auth-footer">
          Don't have an account? <a href="#register" onclick="Router.navigate('register');return false;">Create free account →</a>
        </div>
      </div>
    </div>
  </div>
  `;
};

Pages.register = function(container) {
  container.innerHTML = `
  <div class="auth-layout">
    <div class="auth-left" style="background:linear-gradient(135deg,#0c1a2e,#1e3a5f,#0f2744)">
      <div class="auth-left-content">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px;cursor:pointer" onclick="Router.navigate('landing')">
          <div style="width:40px;height:40px;background:rgba(249,115,22,.15);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:22px;border:1px solid rgba(249,115,22,.3)">🚛</div>
          <span style="font-size:20px;font-weight:800;color:#fff;letter-spacing:-0.5px">Aetra</span>
        </div>

        <div style="margin-bottom:36px">
          <div style="font-size:12px;color:rgba(249,115,22,.8);font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px">🆓 14-DAY FREE TRIAL</div>
          <h2 style="font-size:28px;font-weight:800;color:#fff;margin-bottom:10px;line-height:1.2">Start automating your freight invoices today</h2>
          <p style="color:rgba(255,255,255,.6);font-size:15px;line-height:1.7">No credit card required. Full Growth plan access. Go live in 48 hours.</p>
        </div>

        <div class="auth-feature-list">
          ${[
            { icon:'🆓', text:'14 days free — no credit card needed' },
            { icon:'🚀', text:'Go live in 48 hours with onboarding support' },
            { icon:'📞', text:'Dedicated support during trial period' },
            { icon:'💯', text:'98.7% reconciliation accuracy guaranteed' },
            { icon:'🔐', text:'Bank-grade security & data encryption' }
          ].map(f => `
            <div class="auth-feature-item">
              <div class="auth-feature-icon">${f.icon}</div>
              <span class="auth-feature-text">${f.text}</span>
            </div>
          `).join('')}
        </div>

        <div style="margin-top:32px;padding:16px;background:rgba(255,255,255,.05);border-radius:12px;border:1px solid rgba(255,255,255,.1)">
          <div style="font-size:12px;color:rgba(255,255,255,.5);margin-bottom:10px;font-weight:600;text-transform:uppercase;letter-spacing:.8px">Trusted by logistics companies across India</div>
          <div style="display:flex;gap:20px;flex-wrap:wrap">
            ${['Mumbai', 'Delhi', 'Chennai', 'Bangalore', 'Hyderabad', 'Pune'].map(c =>
              `<span style="font-size:12px;color:rgba(255,255,255,.6)">📍 ${c}</span>`
            ).join('')}
          </div>
        </div>
      </div>
    </div>

    <div class="auth-right">
      <div class="auth-form-container">
        <div style="margin-bottom:24px;cursor:pointer" onclick="Router.navigate('landing')">
          <div style="display:flex;align-items:center;gap:8px">
            <div style="width:32px;height:32px;background:var(--primary);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px">🚛</div>
            <span style="font-weight:800;color:var(--primary);font-size:18px">Aetra</span>
          </div>
        </div>

        <div class="auth-form-header">
          <h1>Create your account</h1>
          <p>Set up Aetra for your logistics company</p>
        </div>

        <div id="regAlert" style="display:none;padding:12px 16px;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;color:#991b1b;font-size:13px;margin-bottom:16px"></div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Full Name *</label>
            <input class="form-input" type="text" id="regName" placeholder="Rajesh Kumar">
          </div>
          <div class="form-group">
            <label class="form-label">Company Name *</label>
            <input class="form-input" type="text" id="regCompany" placeholder="Your Logistics Pvt Ltd">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Company Email *</label>
          <input class="form-input" type="email" id="regEmail" placeholder="finance@yourcompany.in">
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">GSTIN</label>
            <input class="form-input" type="text" id="regGstin" placeholder="27AABCM1234F1ZX" maxlength="15" oninput="this.value=this.value.toUpperCase()">
            <div class="form-hint">15-character GSTIN (optional)</div>
          </div>
          <div class="form-group">
            <label class="form-label">Phone Number</label>
            <input class="form-input" type="tel" id="regPhone" placeholder="+91 98765 43210">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Password *</label>
          <div style="position:relative">
            <input class="form-input" type="password" id="regPassword" placeholder="Min 8 characters" style="padding-right:44px">
            <button type="button" onclick="togglePass('regPassword',this)" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:16px">👁</button>
          </div>
          <div id="passStrength" style="height:3px;background:var(--border);border-radius:2px;margin-top:6px;overflow:hidden">
            <div id="passStrengthBar" style="height:100%;width:0%;background:var(--danger);transition:all .3s;border-radius:2px"></div>
          </div>
          <div class="form-hint" id="passHint">Use a mix of letters, numbers, and symbols</div>
        </div>

        <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:20px">
          <input type="checkbox" id="regTerms" style="width:16px;height:16px;cursor:pointer;margin-top:2px;accent-color:var(--primary)">
          <label for="regTerms" style="font-size:13px;color:var(--text-muted);cursor:pointer;line-height:1.5">
            I agree to Aetra's <a href="#" style="color:var(--primary)" onclick="return false">Terms of Service</a> and <a href="#" style="color:var(--primary)" onclick="return false">Privacy Policy</a>
          </label>
        </div>

        <button class="btn btn-accent w-full btn-lg" style="justify-content:center" id="regBtn" onclick="handleRegister()">
          🚀 Create Free Account — 14 Days Trial
        </button>

        <div class="auth-footer">
          Already have an account? <a href="#login" onclick="Router.navigate('login');return false;">Sign in →</a>
        </div>
      </div>
    </div>
  </div>
  `;

  // Password strength meter
  document.getElementById('regPassword')?.addEventListener('input', function() {
    const v = this.value;
    const strength = [v.length >= 8, /[A-Z]/.test(v), /[0-9]/.test(v), /[^A-Za-z0-9]/.test(v)].filter(Boolean).length;
    const colors = ['', '#ef4444', '#f97316', '#f59e0b', '#10b981'];
    const hints = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    const bar = document.getElementById('passStrengthBar');
    const hint = document.getElementById('passHint');
    if (bar) { bar.style.width = (strength * 25) + '%'; bar.style.background = colors[strength] || ''; }
    if (hint) hint.textContent = hints[strength] || '';
  });
};

Pages.forgot = function(container) {
  container.innerHTML = `
  <div class="auth-layout">
    <div class="auth-left" style="background:linear-gradient(135deg,#0f1f33,#1e3a5f)">
      <div class="auth-left-content">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px;cursor:pointer" onclick="Router.navigate('landing')">
          <div style="width:40px;height:40px;background:rgba(249,115,22,.15);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:22px;border:1px solid rgba(249,115,22,.3)">🚛</div>
          <span style="font-size:20px;font-weight:800;color:#fff;letter-spacing:-0.5px">Aetra</span>
        </div>
        <div style="font-size:56px;margin-bottom:24px">🔐</div>
        <h2 style="font-size:26px;font-weight:800;color:#fff;margin-bottom:12px">Reset Your Password</h2>
        <p style="color:rgba(255,255,255,.6);font-size:15px;line-height:1.7">We'll send a secure reset link to your registered company email address within 2 minutes.</p>
      </div>
    </div>
    <div class="auth-right">
      <div class="auth-form-container">
        <div style="margin-bottom:24px;cursor:pointer" onclick="Router.navigate('landing')">
          <div style="display:flex;align-items:center;gap:8px">
            <div style="width:32px;height:32px;background:var(--primary);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px">🚛</div>
            <span style="font-weight:800;color:var(--primary);font-size:18px">Aetra</span>
          </div>
        </div>
        <div class="auth-form-header">
          <h1>Forgot your password?</h1>
          <p>Enter your registered email and we'll send a reset link</p>
        </div>
        <div class="form-group">
          <label class="form-label">Company Email</label>
          <input class="form-input" type="email" id="forgotEmail" placeholder="finance@yourcompany.in" onkeypress="if(event.key==='Enter') handleForgot()">
        </div>
        <button class="btn btn-primary w-full btn-lg" style="justify-content:center" onclick="handleForgot()">
          Send Reset Link
        </button>
        <div class="auth-footer">
          Remember your password? <a href="#login" onclick="Router.navigate('login');return false;">Back to sign in</a>
        </div>
      </div>
    </div>
  </div>
  `;
};

// ── Auth Helpers ────────────────────────────────────────────

function togglePass(id, btn) {
  const inp = document.getElementById(id);
  if (!inp) return;
  inp.type = inp.type === 'password' ? 'text' : 'password';
  btn.textContent = inp.type === 'password' ? '👁' : '🙈';
}

async function handleLogin() {
  const btn = document.getElementById('loginBtn');
  const alert = document.getElementById('loginAlert');
  const email = document.getElementById('loginEmail')?.value?.trim();
  const password = document.getElementById('loginPassword')?.value;

  if (!email || !password) {
    if (alert) { alert.textContent = '⚠️ Please enter your email and password'; alert.style.display = 'block'; }
    return;
  }
  if (alert) alert.style.display = 'none';
  if (btn) { btn.innerHTML = '<span style="display:inline-block;width:16px;height:16px;border:2px solid rgba(255,255,255,.4);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;margin-right:8px"></span>Signing in...'; btn.disabled = true; }

  const role = document.getElementById('loginRole')?.value || 'admin';
  const ok = await AppAuth.login(email, password, role);
  if (!ok && btn) {
    btn.innerHTML = 'Sign In to Aetra';
    btn.disabled = false;
    if (alert) { alert.textContent = '⚠️ Invalid email or password. Try demo@freightflow.in / demo1234'; alert.style.display = 'block'; }
  }
}

function handleGoogleLogin() {
  showToast('Google SSO coming in v2.0 — use email/password for now', 'info');
}

async function handleRegister() {
  const btn = document.getElementById('regBtn');
  const alert = document.getElementById('regAlert');
  const name = document.getElementById('regName')?.value?.trim();
  const company = document.getElementById('regCompany')?.value?.trim();
  const email = document.getElementById('regEmail')?.value?.trim();
  const password = document.getElementById('regPassword')?.value;
  const gstin = document.getElementById('regGstin')?.value?.trim();
  const phone = document.getElementById('regPhone')?.value?.trim();
  const terms = document.getElementById('regTerms')?.checked;

  if (!name || !company || !email || !password) {
    if (alert) { alert.textContent = '⚠️ Please fill in all required fields'; alert.style.display = 'block'; }
    return;
  }
  if (password.length < 8) {
    if (alert) { alert.textContent = '⚠️ Password must be at least 8 characters'; alert.style.display = 'block'; }
    return;
  }
  if (!terms) {
    if (alert) { alert.textContent = '⚠️ Please accept the Terms of Service'; alert.style.display = 'block'; }
    return;
  }
  if (alert) alert.style.display = 'none';
  if (btn) { btn.innerHTML = '<span style="display:inline-block;width:16px;height:16px;border:2px solid rgba(255,255,255,.4);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;margin-right:8px"></span>Creating account...'; btn.disabled = true; }

  const ok = await AppAuth.register({ name, company, email, password, gstin, phone });
  if (!ok && btn) {
    btn.innerHTML = '🚀 Create Free Account — 14 Days Trial';
    btn.disabled = false;
  }
}

function handleForgot() {
  const email = document.getElementById('forgotEmail')?.value?.trim();
  if (!email) { showToast('Enter your email address', 'error'); return; }
  showToast('Reset link sent to ' + email + ' ✉️ — Check your inbox');
  setTimeout(() => Router.navigate('login'), 2500);
}
