// Sample UI for all major features (invite, notifications, billing, integrations)
// Add this file to your js/pages/ directory and link it in your router for testing/demo

function renderSampleEnterpriseDemo() {
  return `
    <div class="card" style="max-width:700px;margin:32px auto;padding:32px 40px">
      <h2>Enterprise Feature Demo</h2>
      <hr style="margin:18px 0">
      <h3>Invite User</h3>
      <form id="inviteForm" style="margin-bottom:24px">
        <input type="email" id="inviteEmail" placeholder="Email" required style="margin-right:8px">
        <input type="text" id="inviteName" placeholder="Name" required style="margin-right:8px">
        <input type="tel" id="invitePhone" placeholder="WhatsApp Phone (with country code)" style="margin-right:8px" pattern="[0-9\+]{10,15}">
        <select id="inviteRole" style="margin-right:8px">
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="operator">Operator</option>
          <option value="viewer">Viewer</option>
        </select>
        <button type="submit">Invite</button>
      </form>
      <div id="inviteTokenResult"></div>

      <h3>Notification History</h3>
      <button onclick="loadNotificationsDemo()">Load Notifications</button>
      <ul id="notificationsList"></ul>

      <h3>Billing Plan Upgrade</h3>
      <form id="billingForm" style="margin-bottom:24px">
        <select id="planType">
          <option value="growth">Growth</option>
          <option value="enterprise">Enterprise</option>
        </select>
        <input type="number" id="planDuration" value="365" min="1" style="width:80px"> days
        <button type="submit">Upgrade</button>
      </form>
      <div id="billingResult"></div>

      <h3>Integrations</h3>
      <div style="display:flex;flex-wrap:wrap;gap:12px">
        ${["whatsapp","gmail","gstn","icici","hdfc","tally","zoho","sap"].map(p=>`
          <button onclick="connectIntegrationDemo('${p}')">Connect ${p.charAt(0).toUpperCase()+p.slice(1)}</button>
        `).join('')}
      </div>
      <div id="integrationResult" style="margin-top:16px"></div>
    </div>
  `;
}

// Wire up events after rendering
window.renderSampleEnterpriseDemo = renderSampleEnterpriseDemo;

document.addEventListener('DOMContentLoaded', () => {
  if (window.location.hash === '#enterprise-demo') {
    document.getElementById('app').innerHTML = renderSampleEnterpriseDemo();
    bindEnterpriseDemoEvents();
  }
});

function bindEnterpriseDemoEvents() {
  // Invite
  document.getElementById('inviteForm').onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('inviteEmail').value;
    const name = document.getElementById('inviteName').value;
    const role = document.getElementById('inviteRole').value;
    const phone = document.getElementById('invitePhone').value;
    const data = await callInviteUser({ email, name, role, phone });
    document.getElementById('inviteTokenResult').innerText = data.invite_token
      ? `Invite Token: ${data.invite_token}${data.whatsapp && data.whatsapp.status === 'mock' ? ' (WhatsApp MOCK)' : ''}`
      : (data.error || JSON.stringify(data));
  };
  // Billing
  document.getElementById('billingForm').onsubmit = async (e) => {
    e.preventDefault();
    const plan = document.getElementById('planType').value;
    const duration = document.getElementById('planDuration').value;
    const data = await callUpgradePlan({ plan, duration });
    document.getElementById('billingResult').innerText = JSON.stringify(data);
  };
}

// Notifications
window.loadNotificationsDemo = async function() {
  const list = document.getElementById('notificationsList');
  list.innerHTML = 'Loading...';
  const data = await callGetNotifications();
  list.innerHTML = '';
  if (!data || !data.length) {
    list.innerHTML = '<li>No notifications found.</li>';
    return;
  }
  data.forEach(n => {
    const li = document.createElement('li');
    li.textContent = `${n.subject || n.type}: ${n.message || ''}`;
    list.appendChild(li);
  });
};

// Integrations
window.connectIntegrationDemo = async function(provider) {
  const resultDiv = document.getElementById('integrationResult');
  resultDiv.innerText = 'Connecting...';
  const data = await callIntegrationConnect(provider, { demo: true });
  resultDiv.innerText = JSON.stringify(data);
};
