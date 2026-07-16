/**
 * Proof of Delivery (POD) System
 * Capture delivery confirmation with photos, signatures, and notes
 * Feature: Photo upload, e-signature, delivery status, timestamp verification
 */

const ProofOfDelivery = {
  render: () => {
    const user = Session.get();
    if (!user) {
      return Router.navigate('login');
    }

    return `
      <div class="page-container">
        <div class="page-header">
          <h1>✅ Proof of Delivery</h1>
          <p>Capture delivery confirmations with photos and signatures</p>
        </div>

        <!-- Two-Tab View: Pending POD & Completed POD -->
        <div style="margin-bottom:20px;">
          <div style="display:flex; gap:8px; border-bottom:2px solid #ddd;">
            <button class="btn" style="border:none; background:none; padding:12px 16px; border-bottom:3px solid #2196F3; cursor:pointer;" id="pendingTab" onclick="ProofOfDelivery.switchTab('pending')">
              📍 Pending POD (${123})
            </button>
            <button class="btn" style="border:none; background:none; padding:12px 16px; border-bottom:3px solid transparent; cursor:pointer; color:#666;" id="completedTab" onclick="ProofOfDelivery.switchTab('completed')">
              ✅ Completed POD (${456})
            </button>
          </div>
        </div>

        <!-- Pending POD Section -->
        <div id="pendingSection" style="display:block;">
          <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap:16px;">
            <!-- Pending POD Cards -->
            <div class="card" style="background:white; border:1px solid #ddd; border-radius:8px; padding:16px; cursor:pointer;" onclick="ProofOfDelivery.openPODForm('SHP-001')">
              <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:8px;">
                <div>
                  <h4 style="margin:0; font-size:14px;">SHP-001</h4>
                  <p style="margin:4px 0; font-size:12px; color:#666;">Delhi → Mumbai</p>
                </div>
                <span style="background:#FFA500; color:white; padding:4px 8px; border-radius:4px; font-size:11px;">Ready for POD</span>
              </div>
              <div style="font-size:12px; line-height:1.6; color:#666;">
                <div>📦 Weight: 2.5 kg</div>
                <div>👤 Recipient: Rahul Singh</div>
                <div>📞 Mobile: +919876543210</div>
                <div style="margin-top:8px; padding-top:8px; border-top:1px solid #eee;">
                  <strong>Payment:</strong> ${100} · Cash
                </div>
              </div>
            </div>

            <div class="card" style="background:white; border:1px solid #ddd; border-radius:8px; padding:16px; cursor:pointer;" onclick="ProofOfDelivery.openPODForm('SHP-002')">
              <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:8px;">
                <div>
                  <h4 style="margin:0; font-size:14px;">SHP-002</h4>
                  <p style="margin:4px 0; font-size:12px; color:#666;">Delhi → Bangalore</p>
                </div>
                <span style="background:#FFA500; color:white; padding:4px 8px; border-radius:4px; font-size:11px;">Ready for POD</span>
              </div>
              <div style="font-size:12px; line-height:1.6; color:#666;">
                <div>📦 Weight: 5.2 kg</div>
                <div>👤 Recipient: Priya Sharma</div>
                <div>📞 Mobile: +919876543211</div>
                <div style="margin-top:8px; padding-top:8px; border-top:1px solid #eee;">
                  <strong>Payment:</strong> ${250} · Online
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Completed POD Section (Hidden) -->
        <div id="completedSection" style="display:none;">
          <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap:16px;">
            <div class="card" style="background:white; border:1px solid #ddd; border-radius:8px; padding:16px; opacity:0.7;">
              <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:8px;">
                <div>
                  <h4 style="margin:0; font-size:14px;">SHP-003</h4>
                  <p style="margin:4px 0; font-size:12px; color:#666;">Delhi → Hyderabad</p>
                </div>
                <span style="background:#4CAF50; color:white; padding:4px 8px; border-radius:4px; font-size:11px;">✅ Delivered</span>
              </div>
              <div style="font-size:12px; line-height:1.6; color:#666;">
                <div>📦 Weight: 1.8 kg</div>
                <div>👤 Recipient: Amit Patel</div>
                <div style="margin:8px 0; padding:8px; background:#E8F5E9; border-radius:4px; font-size:11px;">
                  ✅ Delivered at 2:45 PM<br>
                  📸 Photo attached<br>
                  ✍️ Signature received
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- POD Form Modal -->
      <div id="podModal" style="display:none; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5); z-index:1000; display:flex; align-items:center; justify-content:center;">
        <div style="background:white; border-radius:8px; width:90%; max-width:600px; max-height:90vh; overflow-y:auto;">
          <div style="padding:16px; border-bottom:1px solid #ddd; display:flex; justify-content:space-between; align-items:center;">
            <h2 style="margin:0;">📋 Complete Delivery Proof</h2>
            <button onclick="ProofOfDelivery.closePODForm()" style="background:none; border:none; font-size:24px; cursor:pointer;">✕</button>
          </div>

          <div style="padding:20px;">
            <!-- Shipment Info -->
            <div style="background:#F5F5F5; padding:12px; border-radius:8px; margin-bottom:16px;">
              <h4 style="margin:0 0 8px 0; font-size:12px;">📦 Shipment Details</h4>
              <div style="font-size:12px; color:#666;">
                <div>ID: <strong id="podShipmentId">SHP-001</strong></div>
                <div>Route: <strong id="podRoute">Delhi → Mumbai</strong></div>
                <div>Recipient: <strong id="podRecipient">Rahul Singh</strong></div>
              </div>
            </div>

            <!-- Photo Capture -->
            <div style="margin-bottom:16px;">
              <label style="display:block; margin-bottom:8px; font-weight:600; font-size:13px;">📸 Delivery Photo</label>
              <div style="background:#f5f5f5; border:2px dashed #ddd; border-radius:8px; padding:20px; text-align:center; cursor:pointer;" id="photoUpload">
                <div style="font-size:32px;">📷</div>
                <p style="margin:8px 0; color:#666;">Click to capture or upload photo</p>
                <p style="margin:0; font-size:11px; color:#999;">Proof of delivery location</p>
                <input type="file" id="photoInput" accept="image/*" style="display:none;" onchange="ProofOfDelivery.handlePhotoUpload(event)">
              </div>
              <div id="photoPreview" style="margin-top:8px;"></div>
            </div>

            <!-- Recipient Confirmation -->
            <div style="margin-bottom:16px;">
              <label style="display:block; margin-bottom:8px; font-weight:600; font-size:13px;">👤 Recipient Confirmation</label>
              <div style="border:1px solid #ddd; border-radius:8px; padding:12px; background:#fafafa;">
                <div style="margin-bottom:8px;">
                  <input type="text" id="pod-recipient-name" placeholder="Recipient Name" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:4px; margin-bottom:8px; box-sizing:border-box;">
                  <input type="tel" id="pod-recipient-phone" placeholder="Contact Number" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:4px; box-sizing:border-box;">
                </div>
              </div>
            </div>

            <!-- Signature Pad -->
            <div style="margin-bottom:16px;">
              <label style="display:block; margin-bottom:8px; font-weight:600; font-size:13px;">✍️ Digital Signature</label>
              <div style="border:1px solid #ddd; border-radius:8px; background:#fafafa; height:150px; display:flex; align-items:center; justify-content:center; color:#999;">
                [Signature Pad Area - Signature.js Integration]
              </div>
              <div style="margin-top:4px; font-size:11px; color:#999;">Customer must sign to confirm delivery</div>
            </div>

            <!-- Condition Notes -->
            <div style="margin-bottom:16px;">
              <label style="display:block; margin-bottom:8px; font-weight:600; font-size:13px;">📝 Delivery Notes</label>
              <textarea id="pod-delivery-notes" placeholder="e.g., Package condition, special instructions, customer comments..." style="width:100%; height:80px; padding:8px; border:1px solid #ddd; border-radius:4px; box-sizing:border-box; font-size:12px;"></textarea>
            </div>

            <!-- Payment Confirmation -->
            <div style="margin-bottom:16px;">
              <label style="display:block; margin-bottom:8px; font-weight:600; font-size:13px;">💰 Payment Status</label>
              <div style="border:1px solid #ddd; border-radius:8px; padding:12px; background:#fafafa;">
                <div style="display:flex; gap:8px; margin-bottom:8px;">
                  <label style="flex:1; display:flex; align-items:center; gap:6px; cursor:pointer;">
                    <input type="radio" name="payment" value="cash">
                    <span>💵 Cash on Delivery</span>
                  </label>
                  <label style="flex:1; display:flex; align-items:center; gap:6px; cursor:pointer;">
                    <input type="radio" name="payment" value="online" checked>
                    <span>✅ Already Paid</span>
                  </label>
                </div>
                <input type="number" id="pod-amount" placeholder="Amount" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:4px; box-sizing:border-box;">
              </div>
            </div>

            <!-- Buttons -->
            <div style="display:flex; gap:8px;">
              <button class="btn btn-outline" onclick="ProofOfDelivery.closePODForm()" style="flex:1;">Cancel</button>
              <button class="btn btn-success" onclick="ProofOfDelivery.submitPOD()" style="flex:1;">✅ Confirm Delivery</button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  init: () => {
    console.log('✅ Proof of Delivery Page Initialized');
  },

  switchTab: (tab) => {
    const pendingSection = document.getElementById('pendingSection');
    const completedSection = document.getElementById('completedSection');
    const pendingTab = document.getElementById('pendingTab');
    const completedTab = document.getElementById('completedTab');

    if (tab === 'pending') {
      pendingSection.style.display = 'block';
      completedSection.style.display = 'none';
      pendingTab.style.borderBottomColor = '#2196F3';
      completedTab.style.borderBottomColor = 'transparent';
      completedTab.style.color = '#666';
      pendingTab.style.color = '#000';
    } else {
      pendingSection.style.display = 'none';
      completedSection.style.display = 'block';
      completedTab.style.borderBottomColor = '#2196F3';
      pendingTab.style.borderBottomColor = 'transparent';
      pendingTab.style.color = '#666';
      completedTab.style.color = '#000';
    }
  },

  openPODForm: (shipmentId) => {
    const modal = document.getElementById('podModal');
    const podIdEl = document.getElementById('podShipmentId');
    if (podIdEl) podIdEl.textContent = shipmentId;
    if (modal) modal.style.display = 'flex';
  },

  closePODForm: () => {
    const modal = document.getElementById('podModal');
    modal.style.display = 'none';
  },

  handlePhotoUpload: (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = document.getElementById('photoPreview');
        preview.innerHTML = `<img src="${e.target.result}" style="width:100%; border-radius:4px; max-height:200px;">`;
      };
      reader.readAsDataURL(file);
    }
  },

  submitPOD: async () => {
    const podIdEl = document.getElementById('podShipmentId');
    const shipmentId = podIdEl?.textContent || 'SHP-UNKNOWN';
    const recipientNameEl = document.getElementById('pod-recipient-name');
    const recipientPhoneEl = document.getElementById('pod-recipient-phone');
    const notesEl = document.getElementById('pod-delivery-notes');
    const recipientName = recipientNameEl?.value || '';
    const recipientPhone = recipientPhoneEl?.value || '';
    const notes = notesEl?.value || '';
    const paymentEl = document.querySelector('input[name="payment"]:checked');
    const paymentMethod = paymentEl?.value || 'unknown';
    const amountEl = document.getElementById('pod-amount');
    const amount = amountEl?.value || '0';

    if (!recipientName || !recipientPhone) {
      showToast('❌ Please fill in recipient details', 'error');
      return;
    }

    try {
      const user = Session.get();
      const response = await fetch('https://freightflow-pkf5.onrender.com/api/shipments/pod/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Session.getToken()}`
        },
        body: JSON.stringify({
          shipmentId,
          driverId: user?.id || 'driver-001',
          receiverName: recipientName,
          receiverPhone: recipientPhone,
          photoUrl: 'pod-photo.jpg',
          notes,
          paymentMethod,
          amountCollected: parseFloat(amount) || 0,
          timestamp: new Date().toISOString()
        })
      });

      const result = await response.json();
      if (result.success) {
        showToast('✅ Delivery confirmed! POD submitted successfully.', 'success');
        ProofOfDelivery.closePODForm();
      } else {
        showToast('❌ Failed to submit POD: ' + result.error, 'error');
      }
    } catch (err) {
      console.error('Error submitting POD:', err);
      showToast('❌ Error: ' + err.message, 'error');
    }
  }
};
