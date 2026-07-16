// ============================================================
// FreightFlow — OCR Invoice Capture Backend
// 100% FREE: Tesseract.js (Open-Source, No API Costs)
// ============================================================

const express = require('express');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');

// ─── CONFIGURATION ────────────────────────────────────────
const upload = multer({ dest: 'uploads/', storage: multer.memoryStorage() });

// ─── OCR MODELS ──────────────────────────────────────────
const OCRJobSchema = {
  id: String,
  company_id: String,
  user_id: String,
  file_name: String,
  file_path: String,
  upload_date: Date,
  status: String, // 'uploading' | 'processing' | 'completed' | 'failed'
  ocr_result: {
    extracted_text: String,
    confidence: Number,
    vendor_name: String,
    invoice_number: String,
    invoice_date: String,
    amount: Number,
    currency: String,
    hsn_code: String,
    gst_amount: Number,
    vehicle_number: String,
    route: String,
    transport_mode: String,
    raw_extraction: Object
  },
  user_corrections: Object, // Fields user corrected manually
  final_result: Object, // After user review
  processing_time_ms: Number,
  error_message: String
};

// ─── OCR EXTRACTION ENGINE ───────────────────────────────
class OCRExtractor {
  /**
   * Extract invoice data using Tesseract.js (100% FREE)
   * NO API COSTS - Open-source OCR engine
   */
  static async extractInvoice(imageBuffer, fileName) {
    const startTime = Date.now();
    
    try {
      console.log(`📸 Processing invoice: ${fileName} (Tesseract.js - FREE OCR)`);
      
      // Use Tesseract.js with English + Hindi support
      const { data: { text } } = await Tesseract.recognize(imageBuffer, ['eng', 'hin']);

      if (!text || text.trim().length === 0) {
        throw new Error('No text detected in invoice');
      }

      // Step 2: Parse extracted text using regex patterns (India-specific)
      const extractedData = this.parseInvoiceText(text);
      
      // Step 3: Confidence scoring based on field extraction
      const confidence = this.calculateConfidence(extractedData, text);

      console.log(`✅ OCR extraction completed in ${Date.now() - startTime}ms (using Tesseract.js - FREE)`);
      console.log(`📊 Confidence: ${(confidence * 100).toFixed(1)}% | Vendor: ${extractedData.vendor_name || 'N/A'} | Amount: ₹${extractedData.amount || 'N/A'}`);
      
      return {
        success: true,
        raw_text: text,
        extracted: extractedData,
        confidence,
        processing_time_ms: Date.now() - startTime,
        engine: 'tesseract.js (free)',
        cost: '₹0'
      };

    } catch (error) {
      console.error(`❌ OCR extraction failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
        processing_time_ms: Date.now() - startTime,
        cost: '₹0'
      };
    }
  }

  /**
   * Parse invoice text using regex patterns (India-specific)
   */
  static parseInvoiceText(text) {
    // Debug: Log first 500 chars to understand what Tesseract extracted
    console.log(`🔍 OCR Raw Text (first 500 chars):\n${text.substring(0, 500)}`);
    
    const lines = text.split('\n');
    
    const result = {
      vendor_name: null,
      invoice_number: null,
      invoice_date: null,
      amount: null,
      currency: 'INR',
      hsn_code: null,
      gst_amount: null,
      vehicle_number: null,
      route: null,
      transport_mode: null,
      confidence_scores: {}
    };

    // ─── Pattern Matching for Indian Invoices ───────────
    
    // Invoice Number (e.g., "INV-001234" or "TCI/2026/001234")
    const invPattern = /(?:INV|Invoice|Bill|TCI|Allcargo|Blue\s?Dart)[#:\s-]*([A-Za-z0-9\/-]+)/gi;
    const invMatch = text.match(invPattern);
    if (invMatch) {
      result.invoice_number = invMatch[0].replace(/^[^0-9A-Za-z]/, '').trim();
      result.confidence_scores.invoice_number = 0.95;
    }

    // Invoice Date (DD/MM/YYYY or DD-MM-YYYY format)
    const datePattern = /(?:Date|Dated)[:\s]*([0-3]?[0-9][\/\-\.][0-1]?[0-9][\/\-\.][12][0-9]{3})/i;
    const dateMatch = text.match(datePattern);
    if (dateMatch) {
      result.invoice_date = dateMatch[1];
      result.confidence_scores.invoice_date = 0.92;
    }

    // Amount (₹ 10,000.00 or Rs. 10000 format)
    // Strategy: Look for TOTAL/GRAND TOTAL first, prioritize larger amounts, filter out line items
    let finalAmount = null;
    
    // Strategy 1: Look for explicit TOTAL or GRAND TOTAL with flexible currency recognition
    // Handles: ₹, Rs, Rs., Rs:, R, $ (OCR errors)
    // Prioritize amounts > ₹5,000 (typical invoice total threshold)
    const totalPatterns = [
      /(?:TOTAL|GRAND\s*TOTAL|Total\s*Amount|Grand\s*Total|Final\s*Amount|Net\s*Total|Sub[T-]?Total)[:\s]*(?:₹|Rs\.?|R\s|[$])\s*([0-9,]+(?:\.[0-9]{2})?)/gi,
      /([0-9]{2,3}(?:[,][0-9]{3})+)[:\s]*(?=(?:Total|Grand|Amount))/gi  // Amount before Total keyword
    ];
    
    for (const pattern of totalPatterns) {
      let match;
      const matches = [];
      while ((match = pattern.exec(text)) !== null) {
        const amountStr = match[1].replace(/,/g, '');
        const amount = parseFloat(amountStr);
        // Filter: Amount should be between ₹1,000 and ₹10,000,000 (typical invoice range)
        // Exclude line items (< ₹5,000) and unrealistic values
        if (amount >= 1000 && amount <= 10000000) {
          matches.push(amount);
        }
      }
      if (matches.length > 0) {
        // Prefer larger amounts (likely to be total, not line item)
        finalAmount = Math.max(...matches);
        result.confidence_scores.amount = 0.96;
        break;
      }
    }
    
    // Strategy 2: If no TOTAL found, look for amounts with currency, prioritize larger ones
    if (finalAmount === null) {
      const currencyPattern = /(?:₹|Rs\.?|Rs:|R\s|[$])\s*([0-9]{1,3}(?:[,][0-9]{3})+(?:\.[0-9]{2})?)/g;
      const allAmounts = [];
      while ((match = currencyPattern.exec(text)) !== null) {
        const amount = parseFloat(match[1].replace(/,/g, ''));
        // Only include realistic invoice amounts, filter out line items and small charges
        if (amount >= 1000 && amount <= 10000000) {
          allAmounts.push(amount);
        }
      }
      
      if (allAmounts.length > 0) {
        // Take the maximum (highest amount is likely the total, not a line item)
        finalAmount = Math.max(...allAmounts);
        result.confidence_scores.amount = 0.88;
      }
    }
    
    // Strategy 3: Last resort - look for any 5+ digit number (larger than 4-digit line items)
    if (finalAmount === null) {
      const anyNumberPattern = /([0-9]{5,6})/g;
      const allNumbers = [];
      while ((match = anyNumberPattern.exec(text)) !== null) {
        const num = parseFloat(match[1]);
        if (num >= 1000 && num <= 10000000) {
          allNumbers.push(num);
        }
      }
      if (allNumbers.length > 0) {
        finalAmount = Math.max(...allNumbers);
        result.confidence_scores.amount = 0.75; // Lower confidence
      }
    }
    
    if (finalAmount !== null) {
      result.amount = finalAmount;
      console.log(`💰 Amount Extraction: Found ₹${finalAmount} (Confidence: ${result.confidence_scores.amount})`);
    } else {
      console.log('⚠️ Amount: Could not extract any valid amount from invoice');
    }

    // GST Amount (GST: ₹ 1000 or SGST/CGST)
    const gstPattern = /(?:GST|SGST|CGST|Tax)[:\s]*(?:₹|Rs\.?)?([0-9]{1,3}(?:[,][0-9]{3})*(?:\.[0-9]{2})?)/i;
    const gstMatch = text.match(gstPattern);
    if (gstMatch) {
      result.gst_amount = parseFloat(gstMatch[1].replace(/,/g, ''));
      result.confidence_scores.gst_amount = 0.88;
    }

    // HSN Code (4-digit code, e.g., "4911")
    const hsnPattern = /(?:HSN|HSN Code)[:\s]*([0-9]{4,8})/i;
    const hsnMatch = text.match(hsnPattern);
    if (hsnMatch) {
      result.hsn_code = hsnMatch[1];
      result.confidence_scores.hsn_code = 0.93;
    }

    // Vehicle Number (e.g., "MH12AB1234")
    const vehiclePattern = /(?:Vehicle|Truck|Fleet)[#:\s]*([A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4})/i;
    const vehicleMatch = text.match(vehiclePattern);
    if (vehicleMatch) {
      result.vehicle_number = vehicleMatch[1];
      result.confidence_scores.vehicle_number = 0.91;
    }

    // Route (e.g., "Kolkata -> Mumbai" or "Delhi to Bangalore")
    const routePattern = /(?:Route|From|To)[:\s]*([A-Za-z\s]+(?:->|-|to)[A-Za-z\s]+)/i;
    const routeMatch = text.match(routePattern);
    if (routeMatch) {
      result.route = routeMatch[1].trim();
      result.confidence_scores.route = 0.85;
    }

    // Transport Mode (Road/Rail/Air/Sea)
    const modePattern = /(?:Mode|Transport)[:\s]*(Road|Rail|Air|Sea|Truck|Train|Flight|Ship)/i;
    const modeMatch = text.match(modePattern);
    if (modeMatch) {
      result.transport_mode = modeMatch[1].toLowerCase();
      result.confidence_scores.transport_mode = 0.89;
    }

    // Vendor Name - Extract from known vendors or first meaningful line
    let vendorName = null;
    
    // Strategy 1: Look for known logistics company names (simple pattern matching)
    const knownVendors = [
      'TCI Express', 'TCI EXPRESS', 'Allcargo', 'Allcargo Gati', 
      'Blue Dart', 'Blue Dart Express', 'Blue Dart Logistics',
      'Delhivery', 'Locus', 'Locus Logistics', 'FedEx',
      'Bangalore Logistics', 'FreightFlow', 'FreightFlow Analytics',
      'Express Logistics', 'FastFreight', 'TruckHub'
    ];
    
    for (const vendor of knownVendors) {
      if (text.toUpperCase().includes(vendor.toUpperCase())) {
        vendorName = vendor;
        break;
      }
    }
    
    // Strategy 2: Extract from first lines (skip common headers)
    if (!vendorName) {
      const firstLines = lines
        .filter(l => l.trim().length > 2)
        .slice(0, 5)
        .map(l => l.trim());
      
      // Look for non-empty line that's not a header keyword
      for (const line of firstLines) {
        if (!/^(invoice|bill|receipt|total|amount|date|from|to|route|vehicle|hsn|gst|phone|email)/i.test(line) &&
            line.length > 3 && 
            line.length < 60) {
          vendorName = line;
          break;
        }
      }
    }
    
    if (vendorName) {
      result.vendor_name = vendorName.trim();
      result.confidence_scores.vendor_name = vendorName.length > 5 ? 0.90 : 0.70;
    }

    return result;
  }

  /**
   * Calculate overall confidence score (0-1)
   */
  static calculateConfidence(extracted, fullText) {
    const scores = Object.values(extracted.confidence_scores || {}).filter(s => typeof s === 'number' && !isNaN(s));
    if (scores.length === 0) return 0.5;
    
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    return Math.min(1, Math.max(0, average)); // Ensure between 0-1
  }
}

// ─── API ENDPOINTS ───────────────────────────────────────

/**
 * POST /api/ocr/upload
 * Upload invoice document and process with OCR
 */
router.post('/api/ocr/upload', authenticateToken, upload.single('document'), async (req, res) => {
  try {
    const { fileName, batchId } = req.body;
    const userCompanyId = req.user.company_id || req.user.id;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Step 1: Create OCR job record
    const ocrJobId = `OCR-${Date.now()}`;
    const ocrJob = {
      id: ocrJobId,
      company_id: userCompanyId,
      user_id: req.user.id,
      file_name: fileName || req.file.originalname,
      upload_date: new Date(),
      status: 'processing',
      batch_id: batchId
    };

    const OCRJob = models.ff_ocr_jobs || createFakeModel('ff_ocr_jobs');
    await OCRJob.create(ocrJob);

    // Step 2: Process with OCR in background
    setImmediate(async () => {
      try {
        const result = await OCRExtractor.extractInvoice(req.file.buffer, req.file.originalname);
        
        if (result.success) {
          // Update OCR job with results
          ocrJob.status = 'completed';
          ocrJob.ocr_result = result.extracted;
          ocrJob.ocr_result.raw_extraction = result.raw_text;
          ocrJob.ocr_result.confidence = result.confidence;
          ocrJob.processing_time_ms = result.processing_time_ms;

          console.log(`✅ OCR completed: ${ocrJobId}`);
          console.log(`📊 Extracted: Vendor=${result.extracted.vendor_name}, Amount=${result.extracted.amount}, Confidence=${result.confidence.toFixed(2)}`);
        } else {
          ocrJob.status = 'failed';
          ocrJob.error_message = result.error;
        }

        await OCRJob.updateOne({ id: ocrJobId }, ocrJob);
      } catch (error) {
        console.error(`❌ OCR processing failed: ${error.message}`);
        await OCRJob.updateOne({ id: ocrJobId }, {
          status: 'failed',
          error_message: error.message
        });
      }
    });

    res.status(202).json({
      ocr_job_id: ocrJobId,
      status: 'processing',
      message: 'Invoice processing started. Check status using GET /api/ocr/status/{job_id}',
      estimate_time_ms: 8000,  // Tesseract takes 5-10 seconds
      cost: '₹0 - Using free Tesseract.js OCR engine',
      note: 'No API costs, no monthly billing'
    });

  } catch (error) {
    console.error('❌ Error POST /api/ocr/upload', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/ocr/status/:jobId
 * Check OCR processing status
 */
router.get('/api/ocr/status/:jobId', authenticateToken, async (req, res) => {
  try {
    const { jobId } = req.params;
    const OCRJob = models.ff_ocr_jobs || createFakeModel('ff_ocr_jobs');
    const job = await OCRJob.findOne({ id: jobId }).lean();

    if (!job) {
      return res.status(404).json({ error: 'OCR job not found' });
    }

    if (job.status === 'completed') {
      console.log(`🔍 Status response for ${jobId}:`, {
        status: job.status,
        has_ocr_result: !!job.ocr_result,
        confidence: job.ocr_result?.confidence,
        vendor: job.ocr_result?.vendor_name
      });
    }

    res.json({
      ocr_job_id: job.id,
      status: job.status,
      file_name: job.file_name,
      upload_time: job.upload_date,
      processing_time_ms: job.processing_time_ms,
      ...(job.status === 'completed' && {
        result: job.ocr_result,
        extracted_fields: {
          vendor_name: job.ocr_result?.vendor_name,
          invoice_number: job.ocr_result?.invoice_number,
          invoice_date: job.ocr_result?.invoice_date,
          amount: job.ocr_result?.amount,
          hsn_code: job.ocr_result?.hsn_code,
          gst_amount: job.ocr_result?.gst_amount,
          vehicle_number: job.ocr_result?.vehicle_number,
          route: job.ocr_result?.route,
          transport_mode: job.ocr_result?.transport_mode
        },
        confidence: job.ocr_result?.confidence
      }),
      ...(job.status === 'failed' && { error: job.error_message })
    });
  } catch (error) {
    console.error('❌ Error GET /api/ocr/status', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/ocr/correct/:jobId
 * User submits corrections to OCR-extracted data
 */
router.post('/api/ocr/correct/:jobId', authenticateToken, async (req, res) => {
  try {
    const { jobId } = req.params;
    const corrections = req.body; // { vendor_name: "Corrected Name", amount: 50000, ... }

    const OCRJob = models.ff_ocr_jobs || createFakeModel('ff_ocr_jobs');
    const job = await OCRJob.findOne({ id: jobId }).lean();

    if (!job) {
      return res.status(404).json({ error: 'OCR job not found' });
    }

    // Apply corrections
    const finalResult = {
      ...job.ocr_result,
      ...corrections,
      user_corrections: corrections,
      corrected_at: new Date()
    };

    await OCRJob.updateOne({ id: jobId }, {
      final_result: finalResult,
      user_corrections: corrections,
      status: 'verified'
    });

    console.log(`✅ Corrections applied to OCR job: ${jobId}`);

    res.json({
      ocr_job_id: jobId,
      status: 'verified',
      final_result: finalResult,
      message: 'OCR data verified and ready for invoice creation'
    });

  } catch (error) {
    console.error('❌ Error POST /api/ocr/correct', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/ocr/batch-upload
 * Bulk upload multiple invoices
 */
router.post('/api/ocr/batch-upload', authenticateToken, upload.array('documents', 50), async (req, res) => {
  try {
    const userCompanyId = req.user.company_id || req.user.id;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const batchId = `BATCH-${Date.now()}`;
    const OCRJob = models.ff_ocr_jobs || createFakeModel('ff_ocr_jobs');
    
    const jobIds = [];

    // Process each file
    for (const file of req.files) {
      const ocrJobId = `OCR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const ocrJob = {
        id: ocrJobId,
        company_id: userCompanyId,
        user_id: req.user.id,
        file_name: file.originalname,
        upload_date: new Date(),
        status: 'processing',
        batch_id: batchId
      };

      await OCRJob.create(ocrJob);
      jobIds.push(ocrJobId);

      // Process in background
      setImmediate(async () => {
        try {
          const result = await OCRExtractor.extractInvoice(file.buffer, file.originalname);
          
          if (result.success) {
            await OCRJob.updateOne({ id: ocrJobId }, {
              status: 'completed',
              ocr_result: result.extracted,
              processing_time_ms: result.processing_time_ms
            });
          } else {
            await OCRJob.updateOne({ id: ocrJobId }, {
              status: 'failed',
              error_message: result.error
            });
          }
        } catch (error) {
          await OCRJob.updateOne({ id: ocrJobId }, {
            status: 'failed',
            error_message: error.message
          });
        }
      });
    }

    console.log(`✅ AUDIT: Batch OCR upload initiated with ${jobIds.length} files by ${req.user.id}`);

    res.status(202).json({
      batch_id: batchId,
      total_files: req.files.length,
      job_ids: jobIds,
      status: 'processing',
      message: 'Batch processing started. Monitor individual job status via GET /api/ocr/status/{job_id}',
      cost: '₹0 - Using free Tesseract.js OCR for all files',
      estimated_total_time_ms: req.files.length * 8000  // 8 seconds per file
    });

  } catch (error) {
    console.error('❌ Error POST /api/ocr/batch-upload', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/ocr/batch-status/:batchId
 * Check status of entire batch
 */
router.get('/api/ocr/batch-status/:batchId', authenticateToken, async (req, res) => {
  try {
    const { batchId } = req.params;
    const OCRJob = models.ff_ocr_jobs || createFakeModel('ff_ocr_jobs');
    
    const jobs = (await OCRJob.find({ batch_id: batchId }).lean()) || [];

    const summary = {
      batch_id: batchId,
      total_jobs: jobs.length,
      completed: jobs.filter(j => j.status === 'completed').length,
      processing: jobs.filter(j => j.status === 'processing').length,
      failed: jobs.filter(j => j.status === 'failed').length,
      verified: jobs.filter(j => j.status === 'verified').length,
      jobs: jobs.map(j => ({
        job_id: j.id,
        file_name: j.file_name,
        status: j.status,
        ...(j.status === 'completed' && {
          vendor: j.ocr_result?.vendor_name,
          amount: j.ocr_result?.amount,
          confidence: j.ocr_result?.confidence
        })
      }))
    };

    res.json(summary);
  } catch (error) {
    console.error('❌ Error GET /api/ocr/batch-status', error);
    res.status(500).json({ error: error.message });
  }
});

// Export for use in server.js
module.exports = { OCRExtractor };