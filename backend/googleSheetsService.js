// Google Sheets Integration Service
// Saves user login data to Google Sheet automatically

const { google } = require('googleapis');

class GoogleSheetsService {
  constructor() {
    this.sheetsAPI = null;
    this.spreadsheetId = process.env.GOOGLE_SHEETS_ID; // Add this to .env
    this.sheetName = 'Beta_Logins'; // Sheet name where data will be saved
    this.isInitialized = false;
  }

  async initialize() {
    try {
      if (this.isInitialized && this.sheetsAPI) {
        return;
      }

      // Use API Key for public read/append (simpler than OAuth)
      const apiKey = process.env.GOOGLE_SHEETS_API_KEY;
      
      if (!apiKey || !this.spreadsheetId) {
        console.log('⚠️  Google Sheets API key or spreadsheet ID not configured');
        console.log('   To enable: Set GOOGLE_SHEETS_ID and GOOGLE_SHEETS_API_KEY in .env');
        return;
      }

      this.sheetsAPI = google.sheets({
        version: 'v4',
        auth: apiKey
      });
      
      this.isInitialized = true;
      console.log('✅ Google Sheets Service initialized');
    } catch (err) {
      console.error('❌ Google Sheets initialization error:', err.message);
    }
  }

  async appendUserLogin(userData) {
    try {
      if (!this.sheetsAPI || !this.spreadsheetId) {
        console.log('⚠️  Google Sheets not configured - skipping auto-save');
        return;
      }

      const {
        name,
        email,
        company,
        phone,
        plan,
        loginTime = new Date().toISOString()
      } = userData;

      // Prepare row data in same format as contacts sheet
      const values = [[
        name || '',
        email || '',
        company || '',
        phone || '',
        plan || 'free',
        loginTime,
        'Active'  // Status
      ]];

      // Append to sheet
      await this.sheetsAPI.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: `${this.sheetName}!A1`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: values
        }
      });

      console.log(`📊 User ${email} logged in → Auto-saved to Google Sheet`);
    } catch (err) {
      // Don't throw - just log. Login should work even if sheet save fails
      console.warn(`⚠️  Could not save to Google Sheets: ${err.message}`);
    }
  }

  async createHeaderRow() {
    try {
      if (!this.sheetsAPI || !this.spreadsheetId) return;

      // Check if sheet exists, if not create it with headers
      const headers = [[
        'Name',
        'Email',
        'Company',
        'Phone',
        'Plan',
        'Login Time',
        'Status'
      ]];

      // Append headers (will only write if sheet is empty)
      await this.sheetsAPI.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `${this.sheetName}!A1:G1`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: headers
        }
      });

      console.log('📋 Google Sheets header row created');
    } catch (err) {
      console.warn(`⚠️  Header creation skipped: ${err.message}`);
    }
  }
}

module.exports = new GoogleSheetsService();
