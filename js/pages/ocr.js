// ============================================================
// Aetra — OCR Invoice Capture Frontend Component
// Dashboard Module
// ============================================================

/**
 * Pages.ocr_capture()
 * Invoice document upload and OCR processing interface
 */
Pages.ocr_capture = async function() {
  return `
    <div class="ocr-container" style="max-width: 1200px; margin: 0 auto; padding: 20px;">
      
      <!-- Header -->
      <div style="border-bottom: 2px solid #e0e0e0; padding-bottom: 15px; margin-bottom: 25px;">
        <h1 style="color: #1a1a1a; margin: 0 0 5px 0; font-size: 28px;">📄 Invoice OCR Capture</h1>
        <p style="color: #666; margin: 0; font-size: 14px;">Upload invoices for automated data extraction with 95%+ accuracy</p>
      </div>

      <!-- Stats Row -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px;">
        <div style="background: #f0f7ff; padding: 20px; border-radius: 8px; border-left: 4px solid #2196F3;">
          <div style="font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Invoices Processed</div>
          <div style="font-size: 24px; font-weight: bold; color: #2196F3; margin-top: 8px;">284</div>
          <div style="font-size: 12px; color: #999; margin-top: 5px;">This month</div>
        </div>
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981;">
          <div style="font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Accuracy Rate</div>
          <div style="font-size: 24px; font-weight: bold; color: #10b981; margin-top: 8px;">97.2%</div>
          <div style="font-size: 12px; color: #999; margin-top: 5px;">AI Confidence</div>
        </div>
        <div style="background: #fefce8; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;">
          <div style="font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Manual Corrections</div>
          <div style="font-size: 24px; font-weight: bold; color: #f59e0b; margin-top: 8px;">1.8%</div>
          <div style="font-size: 12px; color: #999; margin-top: 5px;">Avg. correction rate</div>
        </div>
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #ef4444;">
          <div style="font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Time Saved</div>
          <div style="font-size: 24px; font-weight: bold; color: #ef4444; margin-top: 8px;">₹2.8L</div>
          <div style="font-size: 12px; color: #999; margin-top: 5px;">Data entry cost</div>
        </div>
      </div>

      <!-- Upload Section -->
      <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-bottom: 30px;">
        
        <h2 style="margin-top: 0; color: #1a1a1a; font-size: 18px;">📤 Upload Invoices</h2>
        
        <!-- Single Upload -->
        <div style="margin-bottom: 25px;">
          <h3 style="color: #666; font-size: 14px; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">Single Invoice</h3>
          <div id="dropzone" style="border: 2px dashed #2196F3; border-radius: 8px; padding: 40px; text-align: center; background: #f0f7ff; cursor: pointer; transition: all 0.3s;">
            <div style="font-size: 40px; margin-bottom: 10px;">📁</div>
            <div style="font-size: 16px; color: #1a1a1a; font-weight: 500; margin-bottom: 5px;">Drop invoice here or click to browse</div>
            <div style="font-size: 12px; color: #999;">Supports PDF, PNG, JPG (max 50MB)</div>
            <input type="file" id="invoiceFile" style="display: none;" accept=".pdf,.png,.jpg,.jpeg" />
          </div>
          <button id="uploadButton" style="margin-top: 12px; padding: 10px 24px; background: #2196F3; color: white; border: none; border-radius: 6px; font-size: 14px; cursor: pointer; font-weight: 500;">Upload & Process</button>
        </div>

        <!-- Batch Upload -->
        <div>
          <h3 style="color: #666; font-size: 14px; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">Batch Upload (Multiple)</h3>
          <div id="batchDropzone" style="border: 2px dashed #10b981; border-radius: 8px; padding: 40px; text-align: center; background: #f0fdf4; cursor: pointer; transition: all 0.3s;">
            <div style="font-size: 40px; margin-bottom: 10px;">📦</div>
            <div style="font-size: 16px; color: #1a1a1a; font-weight: 500; margin-bottom: 5px;">Drop multiple invoices here or click to browse</div>
            <div style="font-size: 12px; color: #999;">Upload up to 50 files at once</div>
            <input type="file" id="batchFiles" style="display: none;" accept=".pdf,.png,.jpg,.jpeg" multiple />
          </div>
          <button id="batchUploadButton" style="margin-top: 12px; padding: 10px 24px; background: #10b981; color: white; border: none; border-radius: 6px; font-size: 14px; cursor: pointer; font-weight: 500;">Upload Batch</button>
        </div>
      </div>

      <!-- Processing Results -->
      <div id="resultsContainer" style="display: none;">
        <div style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <h2 style="margin-top: 0; color: #1a1a1a; font-size: 18px;">🔍 OCR Results</h2>
          
          <div id="processingStatus" style="padding: 15px; background: #fffbea; border-left: 4px solid #f59e0b; border-radius: 4px; margin-bottom: 20px; display: none;">
            <div style="font-size: 14px; color: #92400e;">
              ⏳ Processing... <span id="processingTime">0s</span> — Extracting invoice data
            </div>
          </div>

          <div id="extractedFields" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 20px;"></div>

          <div style="display: flex; gap: 10px; margin-top: 20px;">
            <button id="confirmButton" style="padding: 10px 24px; background: #10b981; color: white; border: none; border-radius: 6px; font-size: 14px; cursor: pointer; font-weight: 500; display: none;">✅ Confirm & Create Invoice</button>
            <button id="editButton" style="padding: 10px 24px; background: #2196F3; color: white; border: none; border-radius: 6px; font-size: 14px; cursor: pointer; font-weight: 500; display: none;">✏️ Edit Fields</button>
            <button id="downloadButton" style="padding: 10px 24px; background: #6366f1; color: white; border: none; border-radius: 6px; font-size: 14px; cursor: pointer; font-weight: 500; display: none;">⬇️ Download CSV</button>
          </div>
        </div>
      </div>

      <!-- Recent Uploads Table -->
      <div style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-top: 30px;">
        <h2 style="margin-top: 0; color: #1a1a1a; font-size: 18px;">📋 Recent Uploads</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 2px solid #e0e0e0;">
              <th style="text-align: left; padding: 12px; color: #666; font-weight: 600; font-size: 12px; text-transform: uppercase;">File Name</th>
              <th style="text-align: left; padding: 12px; color: #666; font-weight: 600; font-size: 12px; text-transform: uppercase;">Status</th>
              <th style="text-align: left; padding: 12px; color: #666; font-weight: 600; font-size: 12px; text-transform: uppercase;">Amount</th>
              <th style="text-align: left; padding: 12px; color: #666; font-weight: 600; font-size: 12px; text-transform: uppercase;">Confidence</th>
              <th style="text-align: left; padding: 12px; color: #666; font-weight: 600; font-size: 12px; text-transform: uppercase;">Date</th>
              <th style="text-align: left; padding: 12px; color: #666; font-weight: 600; font-size: 12px; text-transform: uppercase;">Action</th>
            </tr>
          </thead>
          <tbody id="recentUploadsBody">
            <tr style="border-bottom: 1px solid #e0e0e0;">
              <td colspan="6" style="text-align: center; padding: 20px; color: #999;">Loading...</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <style>
      #dropzone:hover, #batchDropzone:hover {
        background: #e3f2fd !important;
        border-color: #1976d2 !important;
      }
      
      .field-edit {
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
      }
      
      .confidence-high { color: #10b981; font-weight: 600; }
      .confidence-medium { color: #f59e0b; font-weight: 600; }
      .confidence-low { color: #ef4444; font-weight: 600; }
    </style>
  `;
};

// ─── EVENT HANDLERS & LOGIC ─────────────────────────────

document.addEventListener('DOMContentLoaded', function() {
  
  // Dropzone drag & drop
  const dropzone = document.getElementById('dropzone');
  const invoiceFile = document.getElementById('invoiceFile');
  const uploadButton = document.getElementById('uploadButton');

  if (dropzone && invoiceFile) {
    dropzone.addEventListener('click', () => invoiceFile.click());
    
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.style.background = '#1E88E5';
      dropzone.style.color = 'white';
    });
    
    dropzone.addEventListener('dragleave', () => {
      dropzone.style.background = '#f0f7ff';
      dropzone.style.color = 'black';
    });
    
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      invoiceFile.files = e.dataTransfer.files;
      dropzone.style.background = '#f0f7ff';
    });

    invoiceFile.addEventListener('change', () => {
      if (invoiceFile.files.length > 0) {
        const fileName = invoiceFile.files[0].name;
        dropzone.innerHTML = `✅ Ready: ${fileName}`;
      }
    });

    uploadButton.addEventListener('click', async () => {
      if (!invoiceFile.files.length) {
        alert('Please select a file first');
        return;
      }

      await uploadInvoice(invoiceFile.files[0]);
    });
  }

  // Batch upload dropzone
  const batchDropzone = document.getElementById('batchDropzone');
  const batchFiles = document.getElementById('batchFiles');
  const batchUploadButton = document.getElementById('batchUploadButton');

  if (batchDropzone && batchFiles) {
    batchDropzone.addEventListener('click', () => batchFiles.click());
    
    batchDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      batchDropzone.style.background = '#059669';
      batchDropzone.style.color = 'white';
    });
    
    batchDropzone.addEventListener('dragleave', () => {
      batchDropzone.style.background = '#f0fdf4';
      batchDropzone.style.color = 'black';
    });
    
    batchDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      batchFiles.files = e.dataTransfer.files;
      batchDropzone.style.background = '#f0fdf4';
    });

    batchFiles.addEventListener('change', () => {
      if (batchFiles.files.length > 0) {
        batchDropzone.innerHTML = `✅ Ready: ${batchFiles.files.length} files selected`;
      }
    });

    batchUploadButton.addEventListener('click', async () => {
      if (!batchFiles.files.length) {
        alert('Please select files first');
        return;
      }
      
      await uploadBatch(batchFiles.files);
    });
  }

  loadRecentUploads();
});

/**
 * Upload single invoice and display results
 */
async function uploadInvoice(file) {
  const formData = new FormData();
  formData.append('document', file);
  formData.append('fileName', file.name);

  try {
    const uploadResponse = await API.request('POST', '/api/ocr/upload', formData, {
      'Content-Type': 'multipart/form-data'
    });

    const ocrJobId = uploadResponse.ocr_job_id;
    console.log(`📤 Upload initiated: ${ocrJobId}`);

    // Show processing status
    document.getElementById('processingStatus').style.display = 'block';
    document.getElementById('resultsContainer').style.display = 'block';
    
    let elapsed = 0;
    const timer = setInterval(() => {
      elapsed++;
      document.getElementById('processingTime').textContent = elapsed + 's';
    }, 1000);

    // Poll for results
    const maxAttempts = 60; // 60 seconds timeout
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      const statusResponse = await API.request('GET', `/api/ocr/status/${ocrJobId}`);
      
      if (statusResponse.status === 'completed' || statusResponse.status === 'verified') {
        clearInterval(timer);
        displayOCRResults(statusResponse, ocrJobId);
        break;
      }
      
      if (statusResponse.status === 'failed') {
        clearInterval(timer);
        alert('❌ OCR processing failed: ' + statusResponse.error);
        document.getElementById('processingStatus').style.display = 'none';
        break;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }

    if (attempts >= maxAttempts) {
      clearInterval(timer);
      alert('Processing timeout. Try again later.');
    }

  } catch (error) {
    console.error('Error uploading invoice:', error);
    alert('Upload failed: ' + error.message);
  }
}

/**
 * Upload batch of invoices
 */
async function uploadBatch(files) {
  const formData = new FormData();
  
  for (let file of files) {
    formData.append('documents', file);
  }

  try {
    const response = await API.request('POST', '/api/ocr/batch-upload', formData);
    const batchId = response.batch_id;
    
    alert(`✅ Batch upload initiated! ${response.total_files} files queued.`);
    alert(`Batch ID: ${batchId}\nMonitor progress using the batch status.`);
    
    // Clear file input
    document.getElementById('batchFiles').value = '';
    
  } catch (error) {
    console.error('Error uploading batch:', error);
    alert('Batch upload failed: ' + error.message);
  }
}

/**
 * Display extracted OCR results with editable fields
 */
function displayOCRResults(jobData, ocrJobId) {
  const result = jobData.extracted_fields || {};
  const confidence = jobData.result?.confidence || 0;
  
  const fieldsContainer = document.getElementById('extractedFields');
  fieldsContainer.innerHTML = '';

  const fields = [
    { label: 'Vendor Name', key: 'vendor_name', value: result.vendor_name },
    { label: 'Invoice Number', key: 'invoice_number', value: result.invoice_number },
    { label: 'Invoice Date', key: 'invoice_date', value: result.invoice_date },
    { label: 'Amount (₹)', key: 'amount', value: result.amount },
    { label: 'HSN Code', key: 'hsn_code', value: result.hsn_code },
    { label: 'GST Amount (₹)', key: 'gst_amount', value: result.gst_amount },
    { label: 'Vehicle Number', key: 'vehicle_number', value: result.vehicle_number },
    { label: 'Route', key: 'route', value: result.route },
    { label: 'Transport Mode', key: 'transport_mode', value: result.transport_mode }
  ];

  const confidenceClass = confidence > 0.9 ? 'confidence-high' : confidence > 0.7 ? 'confidence-medium' : 'confidence-low';
  
  fields.forEach(field => {
    const fieldDiv = document.createElement('div');
    fieldDiv.style.padding = '15px';
    fieldDiv.style.background = '#f9fafb';
    fieldDiv.style.borderRadius = '6px';
    fieldDiv.style.border = '1px solid #e5e7eb';
    
    fieldDiv.innerHTML = `
      <div style="font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">${field.label}</div>
      <input type="text" class="field-edit ocr-field" data-field="${field.key}" value="${field.value || ''}" style="width: 100%; box-sizing: border-box;" />
    `;
    
    fieldsContainer.appendChild(fieldDiv);
  });

  // Add confidence badge
  const confidenceBadge = document.createElement('div');
  confidenceBadge.style.padding = '12px';
  confidenceBadge.style.background = '#f0f7ff';
  confidenceBadge.style.borderRadius = '6px';
  confidenceBadge.style.marginBottom = '15px';
  confidenceBadge.style.fontSize = '14px';
  
  confidenceBadge.innerHTML = `
    AI Confidence: <span class="${confidenceClass}">${(confidence * 100).toFixed(1)}%</span>
  `;
  
  fieldsContainer.parentElement.insertBefore(confidenceBadge, fieldsContainer);

  // Show action buttons
  document.getElementById('processingStatus').style.display = 'none';
  document.getElementById('confirmButton').style.display = 'inline-block';
  document.getElementById('editButton').style.display = 'inline-block';
  document.getElementById('downloadButton').style.display = 'inline-block';

  // Confirm button handler
  document.getElementById('confirmButton').onclick = async () => {
    const corrections = {};
    document.querySelectorAll('.ocr-field').forEach(input => {
      const originalValue = fields.find(f => f.key === input.dataset.field)?.value;
      if (input.value !== originalValue) {
        corrections[input.dataset.field] = input.value;
      }
    });

    try {
      const response = await API.request('POST', `/api/ocr/correct/${ocrJobId}`, corrections);
      alert('✅ Invoice data verified and ready for creation!');
      
      // Could auto-create invoice here or navigate to invoice creation page
      window.location.hash = '#invoices';
    } catch (error) {
      alert('Error confirming: ' + error.message);
    }
  };

  // Download as CSV handler
  document.getElementById('downloadButton').onclick = () => {
    const csv = fields.map(f => `"${f.label}","${document.querySelector(`[data-field="${f.key}"]`).value}"`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invoice-data.csv';
    a.click();
  };
}

/**
 * Load recently processed invoices
 */
async function loadRecentUploads() {
  try {
    // This would connect to GET /api/ocr/batch-status or similar
    const tbody = document.getElementById('recentUploadsBody');
    if (!tbody) {
      if (window.DEBUG_MODE) console.warn('⚠️ OCR: recentUploadsBody not in DOM yet');
      return;
    }

    const mockData = [
      { fileName: 'TCI_Invoice_2026_001.pdf', status: 'verified', amount: 45000, confidence: 0.98, date: '2026-04-05' },
      { fileName: 'Delhivery_Consignment.pdf', status: 'completed', amount: 32500, confidence: 0.95, date: '2026-04-04' },
      { fileName: 'Blue_Dart_AWB.pdf', status: 'completed', amount: 18900, confidence: 0.91, date: '2026-04-03' }
    ];

    tbody.innerHTML = mockData.map(record => `
      <tr style="border-bottom: 1px solid #e0e0e0;">
        <td style="padding: 12px; font-size: 14px;">${record.fileName}</td>
        <td style="padding: 12px;">
          <span style="display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;
            background: ${record.status === 'verified' ? '#dcfce7' : '#fef3c7'}; 
            color: ${record.status === 'verified' ? '#166534' : '#92400e'};">
            ${record.status === 'verified' ? '✅ Verified' : '⏳ Pending'}
          </span>
        </td>
        <td style="padding: 12px; font-size: 14px; font-weight: 500;">₹${record.amount.toLocaleString()}</td>
        <td style="padding: 12px;">
          <span class="${record.confidence > 0.9 ? 'confidence-high' : 'confidence-medium'}">
            ${(record.confidence * 100).toFixed(1)}%
          </span>
        </td>
        <td style="padding: 12px; font-size: 14px; color: #666;">${record.date}</td>
        <td style="padding: 12px;">
          <button style="padding: 6px 12px; background: #e3f2fd; color: #1976d2; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">View</button>
        </td>
      </tr>
    `).join('');

  } catch (error) {
    console.error('Error loading uploads:', error);
  }
}