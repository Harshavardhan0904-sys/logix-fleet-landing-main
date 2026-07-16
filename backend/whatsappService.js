// WhatsApp Integration Service - Multi-Provider Support
// Supports: Twilio, Gupshup (FREE), Mock Mode
// Usage: whatsappService.sendInvite(phone, message)
//
// ⚠️  NOTE: System is configured for EMAIL-ONLY invitations as of May 2026
// WhatsApp provider is set to MOCK MODE
// To send invitations, use the email service instead
//
const fetch = require('node-fetch');

// Detect which provider is configured
const PROVIDER = process.env.WHATSAPP_PROVIDER || 'mock';

// GUPSHUP CONFIG (FREE ALTERNATIVE)
const GUPSHUP_API_KEY = process.env.GUPSHUP_API_KEY || '';
const GUPSHUP_PHONE_NUMBER = process.env.GUPSHUP_PHONE_NUMBER || '';
const GUPSHUP_SOURCE_NAME = process.env.GUPSHUP_SOURCE_NAME || 'FreightFlow';

// TWILIO CONFIG
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || '';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || '';

let client = null;
let whatsappStatus = 'not_initialized';
let activeProvider = null;

function initializeWhatsApp() {
  console.log(`\n🔍 WhatsApp Provider Configuration:`);
  console.log(`   Configured Provider: ${PROVIDER}`);

  if (PROVIDER === 'gupshup') {
    initializeGupshup();
  } else {
    initializeTwilio();
  }
}

function initializeGupshup() {
  if (GUPSHUP_API_KEY && GUPSHUP_PHONE_NUMBER) {
    console.log('🔍 Gupshup Configuration:');
    console.log(`   API Key: ${GUPSHUP_API_KEY.substring(0, 10)}***`);
    console.log(`   Phone: ${GUPSHUP_PHONE_NUMBER}`);
    console.log(`   Source: ${GUPSHUP_SOURCE_NAME}`);
    
    whatsappStatus = 'active';
    activeProvider = 'gupshup';
    client = { isGupshup: true };
    console.log('✅ WhatsApp Service: Gupshup configured and ready');
    console.log(`   Phone: ${GUPSHUP_PHONE_NUMBER}`);
    console.log(`   💰 Tier: FREE (1000+ messages/month)`);
    return true;
  } else {
    whatsappStatus = 'mock';
    activeProvider = 'mock';
    console.log('⚠️  WhatsApp Service: Mock mode (Gupshup credentials not set)');
    return false;
  }
}

function initializeTwilio() {
  if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_WHATSAPP_NUMBER) {
    try {
      const twilio = require('twilio');
      client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
      
      console.log('🔍 Twilio Configuration:');
      console.log(`   Account SID: ${TWILIO_ACCOUNT_SID.substring(0, 5)}***`);
      console.log(`   Auth Token: ${TWILIO_AUTH_TOKEN.substring(0, 5)}***`);
      console.log(`   WhatsApp Number: ${TWILIO_WHATSAPP_NUMBER}`);
      
      whatsappStatus = 'active';
      activeProvider = 'twilio';
      console.log('✅ WhatsApp Service: Twilio configured and ready');
      console.log(`   Phone: ${TWILIO_WHATSAPP_NUMBER}`);
      return true;
    } catch (err) {
      whatsappStatus = 'error';
      console.error('❌ Twilio initialization failed:', err.message);
      console.log('⚠️  Falling back to mock mode');
      client = null;
      return false;
    }
  } else {
    whatsappStatus = 'mock';
    activeProvider = 'mock';
    console.log('⚠️  WhatsApp Service: Mock mode (Twilio credentials not set)');
    return false;
  }
}

function getWhatsAppStatus() {
  return {
    status: whatsappStatus,
    isActive: whatsappStatus === 'active',
    provider: activeProvider || 'none',
    phone: activeProvider === 'twilio' ? TWILIO_WHATSAPP_NUMBER : 
           activeProvider === 'gupshup' ? GUPSHUP_PHONE_NUMBER : 'not configured',
    cost: activeProvider === 'gupshup' ? 'FREE' : activeProvider === 'twilio' ? 'Paid' : 'N/A'
  };
}

async function sendViaGupshup(phone, message) {
  const normalizedPhone = phone.replace(/[^0-9+]/g, '');
  
  try {
    console.log(`📱 ═══════════════════════════════════════════════════`);
    console.log(`   [GUPSHUP] Sending WhatsApp message`);
    console.log(`   To: ${normalizedPhone}`);
    console.log(`   Provider: Gupshup (FREE)`);
    console.log(`   API Key: ${GUPSHUP_API_KEY.substring(0, 10)}***`);
    console.log(`   Source Phone: ${GUPSHUP_PHONE_NUMBER}`);
    
    const url = 'https://api.gupshup.io/wa/api/v1/msg';
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'apikey': GUPSHUP_API_KEY
      },
      body: new URLSearchParams({
        'source': GUPSHUP_PHONE_NUMBER.replace(/[^0-9]/g, ''),
        'destination': normalizedPhone.replace(/[^0-9]/g, ''),
        'message': message,
        'messageType': 'TEXT',
        'appName': 'FreightFlow-WhatsApp'
      }).toString()
    });

    const data = await response.json();

    console.log(`   Response Status: ${response.status}`);
    console.log(`   Response Data:`, JSON.stringify(data, null, 2));

    if (response.ok && (data.status === 'submitted' || data.response === 'ok')) {
      console.log(`✅ Gupshup: Message queued successfully`);
      console.log(`   ID: ${data.messageId || data.message || 'queued'}`);
      console.log(`📱 ═══════════════════════════════════════════════════\n`);
      
      return {
        status: 'sent',
        phone: normalizedPhone,
        messageId: data.messageId || 'queued',
        message: 'WhatsApp message sent via Gupshup',
        provider: 'gupshup',
        isMocked: false
      };
    } else {
      console.log(`📋 Gupshup Error Response Status: ${response.status}`);
      console.log(`📋 Full Error Data:`, JSON.stringify(data, null, 2));
      throw new Error(`Gupshup API error: ${data.message || data.error || response.status}`);
    }
  } catch (err) {
    console.error(`\n❌ Gupshup Error:`);
    console.error(`   Message: ${err.message}`);
    console.error(`📱 ═══════════════════════════════════════════════════\n`);
    
    return {
      status: 'error',
      phone: normalizedPhone,
      error: err.message,
      provider: 'gupshup',
      isMocked: false
    };
  }
}

async function sendViaTwilio(phone, message) {
  const normalizedPhone = phone.startsWith('+') ? phone : '+' + phone;
  
  try {
    console.log(`\n📱 ═══════════════════════════════════════════════════`);
    console.log(`   [TWILIO] Sending WhatsApp message`);
    console.log(`   To: ${normalizedPhone}`);
    
    const response = await client.messages.create({
      from: `whatsapp:${TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${normalizedPhone}`,
      body: message
    });

    console.log(`✅ Twilio: Message sent successfully`);
    console.log(`   SID: ${response.sid}`);
    console.log(`   Status: ${response.status}`);
    console.log(`📱 ═══════════════════════════════════════════════════\n`);
    
    return {
      status: 'sent',
      phone: normalizedPhone,
      sid: response.sid,
      message: 'WhatsApp message sent via Twilio',
      provider: 'twilio',
      isMocked: false
    };
  } catch (err) {
    console.error(`\n❌ Twilio Error:`);
    console.error(`   Message: ${err.message}`);
    console.error(`📱 ═══════════════════════════════════════════════════\n`);
    
    return {
      status: 'error',
      phone: normalizedPhone,
      error: err.message,
      provider: 'twilio',
      isMocked: false
    };
  }
}

function sendViaMockMode(phone, message) {
  const normalizedPhone = phone.startsWith('+') ? phone : '+' + phone;
  
  console.log(`\n📱 ═══════════════════════════════════════════════════`);
  console.log(`   [MOCK MODE] WhatsApp message`);
  console.log(`   To: ${normalizedPhone}`);
  console.log(`   Message: ${message.substring(0, 100)}...`);
  console.log(`📱 ═══════════════════════════════════════════════════\n`);
  
  return {
    status: 'mock',
    phone: normalizedPhone,
    message: 'WhatsApp message (MOCK MODE - No actual delivery)',
    provider: 'mock',
    isMocked: true
  };
}

async function sendInvite(phone, message) {
  if (activeProvider === 'gupshup') {
    return await sendViaGupshup(phone, message);
  } else if (activeProvider === 'twilio' && client) {
    return await sendViaTwilio(phone, message);
  } else {
    return sendViaMockMode(phone, message);
  }
}

// ════════════════════════════════════════════════════════════
// INVOICE NOTIFICATION TEMPLATES
// ════════════════════════════════════════════════════════════

function formatInvoiceNotification(invoice, type = 'created') {
  const invoiceNumber = invoice.inv_number || invoice._id;
  const amount = invoice.total || 0;
  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);

  const templates = {
    created: `*FreightFlow Invoice Notification*\n\nNew invoice created:\n\n📄 Invoice #${invoiceNumber}\n💰 Amount: ${formattedAmount}\n📅 Date: ${new Date(invoice.date || Date.now()).toLocaleDateString('en-IN')}\n📝 Status: ${invoice.status || 'Pending'}\n\nReply YES to confirm receipt or visit: https://app.freightflow.in/invoices/${invoiceNumber}`,
    
    reminder: `*FreightFlow Invoice Reminder*\n\nPayment due:\n\n📄 Invoice #${invoiceNumber}\n💰 Amount: ${formattedAmount}\n⏰ Status: ${invoice.status || 'Pending'}\n\nPlease process payment at your earliest convenience.\n🔗 Pay now: https://app.freightflow.in/payments/${invoiceNumber}`,
    
    approved: `*FreightFlow Invoice Approved*\n\n✅ Your invoice has been approved:\n\n📄 Invoice #${invoiceNumber}\n💰 Amount: ${formattedAmount}\n✔️ Approved by: ${invoice.approved_by || 'Admin'}\n📅 Date: ${new Date(invoice.approved_at || Date.now()).toLocaleDateString('en-IN')}\n\nProceed with payment processing.`,
    
    rejected: `*FreightFlow Invoice Alert*\n\n❌ Your invoice needs attention:\n\n📄 Invoice #${invoiceNumber}\n💰 Amount: ${formattedAmount}\n⚠️ Status: Rejected\n\n📧 Please check your email for details or contact support.`,
    
    paid: `*FreightFlow Payment Confirmed*\n\n💳 Payment received:\n\n📄 Invoice #${invoiceNumber}\n💰 Amount: ${formattedAmount}\n✔️ Payment Status: PAID\n🧾 Thank you for your business!\n\nInvoice receipt: https://app.freightflow.in/receipts/${invoiceNumber}`,
    
    draft: `*FreightFlow Invoice Draft*\n\nDraft invoice ready for review:\n\n📄 Invoice #${invoiceNumber}\n💰 Estimated Amount: ${formattedAmount}\n📝 Status: Draft\n\nReview and approve: https://app.freightflow.in/invoices/${invoiceNumber}/review`
  };

  return templates[type] || templates.created;
}

async function sendInvoiceNotification(phone, invoice, type = 'created', options = {}) {
  const message = formatInvoiceNotification(invoice, type);
  
  console.log(`\n📋 ═══════════════════════════════════════════════════`);
  console.log(`   INVOICE NOTIFICATION: ${type.toUpperCase()}`);
  console.log(`   Invoice: ${invoice.inv_number || invoice._id}`);
  console.log(`   Phone: ${phone}`);
  console.log(`   Provider: ${activeProvider}`);
  
  try {
    const result = await sendInvite(phone, message);
    
    // Log to database if notification logger provided
    if (options.logNotification) {
      const notification = {
        id: require('crypto').randomUUID(),
        company_id: invoice.company_id,
        type: `invoice_${type}`,
        recipient: phone,
        subject: `Invoice ${invoice.inv_number || invoice._id} - ${type}`,
        message: message,
        channels: ['whatsapp'],
        status: result.status === 'sent' || result.status === 'mock' ? 'sent' : 'failed',
        sent_at: new Date(),
        delivery_status: {
          provider: result.provider,
          messageId: result.messageId || result.sid,
          isMocked: result.isMocked
        }
      };
      
      if (options.logNotification) {
        options.logNotification(notification);
      }
    }
    
    console.log(`✅ Invoice notification sent successfully`);
    console.log(`   Message ID: ${result.messageId || result.sid || 'queued'}`);
    console.log(`📋 ═══════════════════════════════════════════════════\n`);
    
    return {
      ...result,
      invoiceNumber: invoice.inv_number,
      notificationType: type
    };
  } catch (err) {
    console.error(`❌ Invoice notification failed:`);
    console.error(`   Error: ${err.message}`);
    console.log(`📋 ═══════════════════════════════════════════════════\n`);
    
    return {
      status: 'error',
      error: err.message,
      invoiceNumber: invoice.inv_number,
      notificationType: type,
      provider: activeProvider
    };
  }
}

// Bulk send invoices notifications
async function sendBulkInvoiceNotifications(recipients, invoice, type = 'created', options = {}) {
  console.log(`\n📋 BULK INVOICE NOTIFICATION`);
  console.log(`   Invoice: ${invoice.inv_number}`);
  console.log(`   Recipients: ${recipients.length}`);
  console.log(`   Type: ${type}`);
  
  const results = [];
  
  for (const recipient of recipients) {
    const result = await sendInvoiceNotification(recipient.phone, invoice, type, options);
    results.push({
      phone: recipient.phone,
      name: recipient.name,
      ...result
    });
    
    // Rate limiting - 500ms between messages
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  const successful = results.filter(r => r.status === 'sent' || r.status === 'mock').length;
  
  console.log(`\n✅ Bulk notification complete:`);
  console.log(`   Successful: ${successful}/${recipients.length}`);
  
  return {
    total: recipients.length,
    successful,
    failed: recipients.length - successful,
    results
  };
}

module.exports = { 
  sendInvite,
  initializeWhatsApp,
  getWhatsAppStatus,
  sendInvoiceNotification,
  sendBulkInvoiceNotifications,
  formatInvoiceNotification
};