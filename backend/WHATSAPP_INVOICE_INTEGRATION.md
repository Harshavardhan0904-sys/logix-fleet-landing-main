# WhatsApp Invoice Notifications Integration Guide

**Status:** Ready to use | **Last Updated:** May 17, 2026

---

## 🎯 Overview

WhatsApp invoice notifications enable automated delivery of invoice alerts, reminders, approval notifications, and payment confirmations directly to vendors and customers.

**Features:**
- ✅ Single invoice notifications
- ✅ Bulk recipient notifications
- ✅ Automatic notifications on invoice creation
- ✅ Multiple notification types (created, reminder, approved, rejected, paid, draft)
- ✅ Notification history tracking
- ✅ Gupshup + Twilio support (free & paid)
- ✅ Mock mode for development/testing

---

## 🔧 Environment Setup

### 1. Gupshup Configuration (FREE)

```bash
# Add to .env
WHATSAPP_PROVIDER=gupshup
GUPSHUP_API_KEY=your_gupshup_api_key
GUPSHUP_PHONE_NUMBER=91XXXXXXXXXX
GUPSHUP_SOURCE_NAME=FreightFlow
```

**Get Gupshup API Key:**
1. Go to https://www.gupshup.io/
2. Sign up for free account
3. Navigate to WhatsApp → App Settings → API Keys
4. Copy API Key and Phone Number
5. Add to `.env`

### 2. Twilio Configuration (PAID)

```bash
# Add to .env (optional - alternative to Gupshup)
WHATSAPP_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=+1XXXXXXXXXX
```

### 3. Environment Setup

```bash
# Restart backend after adding credentials
cd backend
npm start
```

Check service status:
```bash
curl http://localhost:5000/api/whatsapp/status
```

**Expected response:**
```json
{
  "status": "active",
  "isActive": true,
  "provider": "gupshup",
  "phone": "91XXXXXXXXXX",
  "message": "WhatsApp service is active"
}
```

---

## 📱 API Endpoints

### 1. Send Invoice Notification (Single)

**Endpoint:** `POST /api/invoices/{invoiceId}/notify/whatsapp`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "phone": "+919876543210",
  "type": "created"
}
```

**Notification Types:**
- `created` - New invoice notification
- `reminder` - Payment reminder
- `approved` - Invoice approved
- `rejected` - Invoice needs correction
- `paid` - Payment received confirmation
- `draft` - Draft review notification

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/invoices/inv-12345/notify/whatsapp \
  -H "Authorization: Bearer your_token" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+919876543210",
    "type": "created"
  }'
```

**Response:**
```json
{
  "success": true,
  "result": {
    "status": "sent",
    "phone": "+919876543210",
    "messageId": "gupshup_msg_id_123",
    "provider": "gupshup",
    "invoiceNumber": "INV-2024-0001",
    "notificationType": "created"
  },
  "invoice": {
    "id": "inv-12345",
    "inv_number": "INV-2024-0001",
    "total": 50000,
    "status": "pending"
  }
}
```

### 2. Send Bulk Notifications

**Endpoint:** `POST /api/invoices/{invoiceId}/notify/whatsapp/bulk`

**Request Body:**
```json
{
  "recipients": [
    { "phone": "+919876543210", "name": "Vendor 1" },
    { "phone": "+919876543211", "name": "Vendor 2" },
    { "phone": "+919876543212", "name": "Customer" }
  ],
  "type": "created"
}
```

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/invoices/inv-12345/notify/whatsapp/bulk \
  -H "Authorization: Bearer your_token" \
  -H "Content-Type: application/json" \
  -d '{
    "recipients": [
      { "phone": "+919876543210", "name": "Vendor 1" },
      { "phone": "+919876543211", "name": "Vendor 2" }
    ],
    "type": "reminder"
  }'
```

**Response:**
```json
{
  "success": true,
  "summary": {
    "total": 2,
    "successful": 2,
    "failed": 0
  },
  "invoice": {
    "id": "inv-12345",
    "inv_number": "INV-2024-0001",
    "total": 50000
  },
  "results": [
    {
      "phone": "+919876543210",
      "name": "Vendor 1",
      "status": "sent",
      "isMocked": false
    },
    {
      "phone": "+919876543211",
      "name": "Vendor 2",
      "status": "sent",
      "isMocked": false
    }
  ]
}
```

### 3. Create Invoice with Auto-Notification

**Endpoint:** `POST /api/invoices`

**Request Body:**
```json
{
  "vendor": "Express Logistics",
  "inv_number": "INV-2024-0001",
  "total": 50000,
  "gst": 9000,
  "status": "pending",
  "date": "2026-05-17",
  "route": "Mumbai - Delhi",
  "notes": "Freight invoice for shipment",
  "notifyWhatsapp": true,
  "notifyPhone": "+919876543210"
}
```

**Response:**
```json
{
  "success": true,
  "invoice": {
    "id": "inv-12345",
    "inv_number": "INV-2024-0001",
    "total": 50000,
    "status": "pending"
  },
  "notification": {
    "status": "sent",
    "phone": "+919876543210"
  }
}
```

### 4. Get Notification History

**Endpoint:** `GET /api/invoices/{invoiceId}/notifications`

**Example:**
```bash
curl http://localhost:5000/api/invoices/inv-12345/notifications \
  -H "Authorization: Bearer your_token"
```

**Response:**
```json
{
  "invoice": {
    "id": "inv-12345",
    "inv_number": "INV-2024-0001",
    "status": "pending"
  },
  "notifications": [
    {
      "id": "notif-123",
      "type": "invoice_created",
      "recipient": "+919876543210",
      "channels": ["whatsapp"],
      "status": "sent",
      "sent_at": "2026-05-17T10:30:45Z",
      "delivery_status": {
        "provider": "gupshup",
        "messageId": "msg_id_123",
        "isMocked": false
      }
    }
  ]
}
```

### 5. Get WhatsApp Service Status

**Endpoint:** `GET /api/whatsapp/status`

```bash
curl http://localhost:5000/api/whatsapp/status
```

**Response:**
```json
{
  "status": "active",
  "isActive": true,
  "provider": "gupshup",
  "phone": "91XXXXXXXXXX",
  "message": "WhatsApp service is active"
}
```

---

## 📋 Notification Templates

### Invoice Created
```
*FreightFlow Invoice Notification*

New invoice created:

📄 Invoice #INV-2024-0001
💰 Amount: ₹50,000.00
📅 Date: 17/05/2026
📝 Status: Pending

Reply YES to confirm receipt or visit: https://app.freightflow.in/invoices/INV-2024-0001
```

### Payment Reminder
```
*FreightFlow Invoice Reminder*

Payment due:

📄 Invoice #INV-2024-0001
💰 Amount: ₹50,000.00
⏰ Status: Pending

Please process payment at your earliest convenience.
🔗 Pay now: https://app.freightflow.in/payments/INV-2024-0001
```

### Invoice Approved
```
*FreightFlow Invoice Approved*

✅ Your invoice has been approved:

📄 Invoice #INV-2024-0001
💰 Amount: ₹50,000.00
✔️ Approved by: Admin
📅 Date: 17/05/2026

Proceed with payment processing.
```

### Payment Received
```
*FreightFlow Payment Confirmed*

💳 Payment received:

📄 Invoice #INV-2024-0001
💰 Amount: ₹50,000.00
✔️ Payment Status: PAID
🧾 Thank you for your business!

Invoice receipt: https://app.freightflow.in/receipts/INV-2024-0001
```

---

## 🧪 Testing

### Test 1: Send Test Message

```bash
curl -X POST http://localhost:5000/api/whatsapp/test \
  -H "Authorization: Bearer your_token" \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210"}'
```

### Test 2: Create Invoice with Notification

```bash
curl -X POST http://localhost:5000/api/invoices \
  -H "Authorization: Bearer your_token" \
  -H "Content-Type: application/json" \
  -d '{
    "vendor": "Test Vendor",
    "inv_number": "TEST-001",
    "total": 10000,
    "gst": 1800,
    "status": "pending",
    "notifyWhatsapp": true,
    "notifyPhone": "+919876543210"
  }'
```

### Test 3: Send Bulk Notifications

```bash
curl -X POST http://localhost:5000/api/invoices/inv-12345/notify/whatsapp/bulk \
  -H "Authorization: Bearer your_token" \
  -H "Content-Type: application/json" \
  -d '{
    "recipients": [
      { "phone": "+919876543210", "name": "Vendor A" },
      { "phone": "+919876543211", "name": "Vendor B" },
      { "phone": "+919876543212", "name": "Vendor C" }
    ],
    "type": "created"
  }'
```

### Test 4: Check Notification History

```bash
curl http://localhost:5000/api/invoices/inv-12345/notifications \
  -H "Authorization: Bearer your_token"
```

---

## 📊 Mock Mode Testing

If WhatsApp credentials are not configured, the system runs in **mock mode**:

```bash
curl http://localhost:5000/api/whatsapp/status
```

**Mock Response:**
```json
{
  "status": "mock",
  "isActive": false,
  "provider": "mock",
  "phone": "not configured",
  "message": "WhatsApp service is in mock mode"
}
```

**Mock Behavior:**
- ✅ All API calls succeed
- ✅ Messages logged to console
- ✅ No actual WhatsApp delivery
- ✅ Perfect for development/testing
- ✅ isMocked=true in responses

---

## 🔒 Rate Limiting

**Gupshup Free Tier:**
- 1000+ messages/month free
- 500 requests/sec limit
- Bulk notifications: 500ms delay between messages

**Twilio:**
- Pay-as-you-go pricing
- No rate limits for authenticated requests

**Backend Implementation:**
- 500ms delay between bulk messages
- Automatic retry on failure
- Audit logging of all notifications

---

## 📝 Audit Logging

All WhatsApp notifications are logged to the audit trail:

```json
{
  "action": "invoice_whatsapp_notification",
  "invoiceId": "inv-12345",
  "invoice_number": "INV-2024-0001",
  "notification_type": "created",
  "phone": "+919876543210",
  "status": "sent",
  "timestamp": "2026-05-17T10:30:45Z"
}
```

View audit logs:
```bash
curl http://localhost:5000/tables/ff_audit_logs \
  -H "Authorization: Bearer your_token"
```

---

## 🛠️ Troubleshooting

### Issue: "WhatsApp service not active"

**Solution:**
1. Check `.env` file for credentials
2. Verify `WHATSAPP_PROVIDER` is set
3. Restart backend: `npm start`
4. Check status: `curl http://localhost:5000/api/whatsapp/status`

### Issue: "Invalid phone format"

**Solution:**
Use international format:
```
✅ +919876543210 (India)
✅ +1-555-123-4567 (USA)
❌ 9876543210 (missing country code)
❌ 919876543210 (missing +)
```

### Issue: "Message not delivered"

**Possible causes:**
- Invalid phone number
- Incorrect Gupshup API key
- Network connectivity
- Recipient not in contacts (sandbox mode)

**Check logs:**
```bash
# View application logs
tail -f backend.log

# Check Gupshup API response
curl -X POST https://api.gupshup.io/wa/api/v1/msg \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d "source=91XXXXXXXXXX&destination=919876543210&message=Test&messageType=TEXT"
```

### Issue: Mock mode when credentials configured

**Solution:**
- Verify credentials in `.env` are correct
- No spaces or quotes in values
- Restart backend
- Check `npm start` output for initialization errors

---

## 📚 Files Modified

- `backend/whatsappService.js` - Enhanced with invoice templates
- `backend/server.js` - Added invoice notification endpoints
- `.env` - WhatsApp credentials

---

## 🚀 Production Checklist

- [ ] WhatsApp provider configured (Gupshup or Twilio)
- [ ] API credentials in `.env`
- [ ] Tested single notification
- [ ] Tested bulk notifications
- [ ] Audit logging verified
- [ ] Notification history accessible
- [ ] Team trained on endpoints
- [ ] Monitoring configured for failures
- [ ] Backup notification channel (email) available

---

**Owner:** Ganesh Kumar  
**Phase:** 3.7 (Optimization)  
**Status:** Ready for Production  
**Last Updated:** May 17, 2026
