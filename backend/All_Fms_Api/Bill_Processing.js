
// const express = require('express');
// const { sheets, drive, spreadsheetId } = require('../config/googleSheet'); // Make sure 'drive' is exported
// const { Readable } = require('stream');
// const router = express.Router();

// // === UPLOAD TO GOOGLE DRIVE (Supports Images & PDFs) ===
// async function uploadToGoogleDrive(base64Data, fileName) {
//   console.log(`[DRIVE UPLOAD START] ${fileName}`);

//   if (!base64Data || typeof base64Data !== 'string') {
//     console.warn(`[DRIVE FAILED] ${fileName} → No base64 data provided`);
//     return '';
//   }

//   // Match data URI: data:mime/type;base64,content
//   const match = base64Data.match(/^data:([a-zA-Z0-9\/\-\+\.]+);base64,(.+)$/);
//   if (!match) {
//     console.warn(`[DRIVE FAILED] ${fileName} → Invalid data URI format`);
//     return '';
//   }

//   const mimeType = match[1]; // e.g., image/jpeg, image/png, application/pdf
//   const base64Content = match[2];

//   try {
//     const buffer = Buffer.from(base64Content, 'base64');

//     const fileStream = new Readable();
//     fileStream.push(buffer);
//     fileStream.push(null); // End stream

//     const fileMetadata = {
//       name: fileName,
//       parents: [process.env.GOOGLE_DRIVE_FOLDER_ID], // Ensure this env var is set
//     };

//     const media = {
//       mimeType,
//       body: fileStream,
//     };

//     const res = await drive.files.create({
//       resource: fileMetadata,
//       media: media,
//       fields: 'id, webViewLink',
//       supportsAllDrives: true,
//       // Optional: if using shared drive
//       // driveId: process.env.GOOGLE_DRIVE_FOLDER_ID,
//       // corpora: 'drive'
//     });

//     const fileId = res.data.id;

//     // Make file publicly viewable
//     await drive.permissions.create({
//       fileId: fileId,
//       requestBody: {
//         role: 'reader',
//         type: 'anyone',
//       },
//       supportsAllDrives: true,
//     });

//     const viewUrl = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;

//     console.log(`[DRIVE SUCCESS] ${fileName} → ${viewUrl}`);
//     return viewUrl;
//   } catch (error) {
//     console.error(`[DRIVE ERROR] ${fileName}:`, error.message);
//     if (error.response?.data) console.error(error.response.data);
//     return '';
//   }
// }

// // GET /api/BILL-PROCESSING (unchanged)
// router.get('/BILL-PROCESSING', async (req, res) => {
//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Billing_FMS!A8:CK',
//     });

//     let data = response.data.values || [];

//     const filteredData = data
//       .filter(row => {
//         const planned13 = row[33] || '';
//         const actual13 = row[34] || '';
//         return planned13 && !actual13;
//       })
//       .map(row => ({
//         planned13: row[33] || '',
//         UID: row[1] || '',
//         siteName: row[3] || '',
//         materialType: row[5] || '',
//         skuCode: row[6] || '',
//         materialName: row[7] || '',
//         revisedQuantity: row[25] || '',
//         finalReceivedQuantity: row[26] || '',
//         unitName: row[9] || '',
//         finalIndentNo: row[12] || '',
//         finalIndent: row[13] || '',
//         approvalQuotationNo: row[14] || '',
//         approvalQuotation: row[15] || '',
//         poNumber: row[16] || '',
//         PODate: row[88] || '',
//         poPDF: row[17] || '',
//         mrnNo: row[18] || '',
//         mrnPDF: row[19] || '',
//         vendorFerm: row[23] || '',
//         vendorContact: row[24] || '',
//       }));

//     res.json({
//       success: true,
//       data: filteredData
//     });
//   } catch (error) {
//     console.error('Error fetching BILL-PROCESSING data:', error);
//     res.status(500).json({ error: 'Failed to fetch BILL-PROCESSING data' });
//   }
// });

// // POST /submit-bill → Now uploads invoice image to Google Drive
// router.post('/submit-bill', async (req, res) => {
//   try {
//     const { uids, invoiceNumber, status, remark, image } = req.body;

//     // Detailed validation
//     let missing = [];
//     if (!uids || !Array.isArray(uids) || uids.length === 0) missing.push('uids (non-empty array)');
//     if (!invoiceNumber) missing.push('invoiceNumber');
//     if (!status) missing.push('status');
//     if (!remark) missing.push('remark');
//     if (!image) missing.push('image');

//     if (missing.length > 0) {
//       return res.status(400).json({ error: 'Missing required fields', details: missing });
//     }

//     // Upload invoice image to Google Drive
//     let imageUrl = '';
//     if (image) {
//       const fileName = `invoice_${invoiceNumber}_${Date.now()}.jpg`; // You can make extension dynamic if needed
//       imageUrl = await uploadToGoogleDrive(image, fileName);

//       if (!imageUrl) {
//         return res.status(500).json({
//           success: false,
//           error: 'Failed to upload invoice image to Google Drive'
//         });
//       }
//     }

//     // Fetch current sheet data
//     const values = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Billing_FMS!A8:CE',
//     });
//     const rows = values.data.values || [];
//     const batchUpdates = [];

//     // Find rows and prepare updates
//     uids.forEach(uid => {
//       const rowIndex = rows.findIndex(row => row[1] === uid);
//       if (rowIndex !== -1) {
//         const sheetRow = rowIndex + 8; // Because data starts at row 8

//         batchUpdates.push(
//           { range: `Billing_FMS!AJ${sheetRow}`, values: [[status]] },           // Status → Column AJ
//           { range: `Billing_FMS!AK${sheetRow}`, values: [[invoiceNumber]] },     // Invoice No → AK
//           { range: `Billing_FMS!AL${sheetRow}`, values: [[imageUrl]] },         // Invoice Image URL → AL
//           { range: `Billing_FMS!AN${sheetRow}`, values: [[remark]] }            // Remark → AN
//         );
//       }
//     });

//     if (batchUpdates.length === 0) {
//       return res.status(400).json({ error: 'No matching UIDs found in the spreadsheet' });
//     }

//     // Perform batch update on Google Sheet
//     await sheets.spreadsheets.values.batchUpdate({
//       spreadsheetId,
//       resource: {
//         valueInputOption: 'RAW',
//         data: batchUpdates.map(update => ({
//           range: update.range,
//           majorDimension: 'ROWS',
//           values: update.values,
//         })),
//       },
//     });

//     res.json({
//       success: true,
//       message: 'Bill submitted successfully',
//       uploadedInvoiceUrl: imageUrl
//     });

//   } catch (error) {
//     console.error('Error submitting bill:', error);
//     res.status(500).json({
//       error: 'Failed to submit bill',
//       details: error.message
//     });
//   }
// });

// module.exports = router;









const express = require('express');
const { sheets, drive, spreadsheetId } = require('../config/googleSheet');
const { Readable } = require('stream');
const router = express.Router();

// === UPLOAD TO GOOGLE DRIVE ===
async function uploadToGoogleDrive(base64Data, fileName) {
  console.log(`[DRIVE UPLOAD START] ${fileName}`);

  if (!base64Data || typeof base64Data !== 'string') {
    console.warn(`[DRIVE FAILED] ${fileName} → No base64 data provided`);
    return '';
  }

  const match = base64Data.match(/^data:([a-zA-Z0-9\/\-\+\.]+);base64,(.+)$/);
  if (!match) {
    console.warn(`[DRIVE FAILED] ${fileName} → Invalid data URI format`);
    return '';
  }

  const mimeType = match[1];
  const base64Content = match[2];

  try {
    const buffer = Buffer.from(base64Content, 'base64');
    const fileStream = new Readable();
    fileStream.push(buffer);
    fileStream.push(null);

    const fileMetadata = {
      name: fileName,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
    };

    const media = { mimeType, body: fileStream };

    const res = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, webViewLink',
      supportsAllDrives: true,
    });

    const fileId = res.data.id;

    await drive.permissions.create({
      fileId: fileId,
      requestBody: { role: 'reader', type: 'anyone' },
      supportsAllDrives: true,
    });

    const viewUrl = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
    console.log(`[DRIVE SUCCESS] ${fileName} → ${viewUrl}`);
    return viewUrl;
  } catch (error) {
    console.error(`[DRIVE ERROR] ${fileName}:`, error.message);
    if (error.response?.data) console.error(error.response.data);
    return '';
  }
}

// ─── GET /api/bill-processing-11 ───────────────────────────
router.get('/bill-processing-11', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Billing_FMS!A8:CK',
    });

    const rows = response.data.values || [];
    console.log('[BILL-11] Total rows fetched:', rows.length);

    if (!rows.length) {
      return res.json({ success: true, data: [] });
    }

    // Step 11 column indices (0-based)
    const PLANNED_11  = 56;  // BE
    const ACTUAL_11   = 57;  // BF
    const STATUS_11   = 58;  // BG
    const INVOICE_11  = 59;  // BH
    const PHOTO_11    = 60;  // BI
    const DELAY_11    = 61;  // BJ
    const REMARK_11   = 62;  // BK

    let matchCount = 0;

    const filteredData = rows
      .map((row, idx) => {
        if (!row || row.every(c => !c || c.trim() === '')) return null;

        const planned = (row[PLANNED_11] || '').trim();
        const actual  = (row[ACTUAL_11]  || '').trim();

        // Filter: PLANNED filled + ACTUAL empty
        if (!planned || actual) return null;

        matchCount++;
        console.log(`[BILL-11] Match #${matchCount} Row ${idx + 8}: UID=${(row[1] || '').trim()} PLANNED="${planned}"`);

        return {
          // ── Same as Vendor Follow-Up mapping ──
          UID:             (row[1]  || '').trim(),
          reqNo:           (row[2]  || '').trim(),
          projectName:     (row[3]  || '').trim(),
          engineerName:    (row[4]  || '').trim(),
          materialType:    (row[5]  || '').trim(),
          materialName:    (row[6]  || '').trim(),
          materialSize:    (row[7]  || '').trim(),
          specification:   (row[8]  || '').trim(),
          brandName:       (row[9]  || '').trim(),
          skuCode:         (row[10] || '').trim(),
          quantity:        (row[11] || '').trim(),
          unitName:        (row[12] || '').trim(),
          description:     (row[13] || '').trim(),
          contractor:      (row[15] || '').trim(),
          indentNo:        (row[21] || '').trim(),
          indentPdf:       (row[22] || '').trim(),
          quotationNo:     (row[23] || '').trim(),
          quotationPdf:    (row[24] || '').trim(),
          poDate:          (row[25] || '').trim(),
          poNumber:        (row[26] || '').trim(),
          poPdf:           (row[27] || '').trim(),
          mrnNo:           (row[28] || '').trim(),
          mrnPdf:          (row[29] || '').trim(),
          transportCharges:(row[30] || '').trim(),
          freightCharges:  (row[31] || '').trim(),
          vendorBrand:     (row[32] || '').trim(),
          vendorFirmName:  (row[33] || '').trim(),
          vendorContact:   (row[34] || '').trim(),
          revisedQuantity: (row[35] || '').trim(),
          finalReceivedQty:(row[36] || '').trim(),

          // ── Step 11 specific columns (BE-BK) ──
          planned11:      planned,
          actual11:       actual,
          status11:       (row[STATUS_11]  || '').trim(),
          invoice11:      (row[INVOICE_11] || '').trim(),
          invoicePhoto11: (row[PHOTO_11]   || '').trim(),
          timeDelay11:    (row[DELAY_11]   || '').trim(),
          remark11:       (row[REMARK_11]  || '').trim(),

          _rowIndex: idx + 8,
        };
      })
      .filter(Boolean);

    console.log(`[BILL-11] Total matches: ${matchCount}`);
    res.json({ success: true, data: filteredData });

  } catch (error) {
    console.error('[BILL-11] Error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch data',
      details: error.message,
    });
  }
});

// ─── POST /api/submit-bill-11 ──────────────────────────────
router.post('/submit-bill-11', async (req, res) => {
  try {
    const { uids, invoiceNumber, status, remark, image } = req.body;

    // Validation
    const missing = [];
    if (!uids || !Array.isArray(uids) || uids.length === 0) missing.push('uids');
    if (!invoiceNumber) missing.push('invoiceNumber');
    if (!status)        missing.push('status');
    if (!remark)        missing.push('remark');
    if (!image)         missing.push('image');

    if (missing.length > 0) {
      return res.status(400).json({ error: 'Missing required fields', details: missing });
    }

    // Upload to Google Drive
    const fileName = `invoice11_${invoiceNumber}_${Date.now()}.jpg`;
    const imageUrl = await uploadToGoogleDrive(image, fileName);

    if (!imageUrl) {
      return res.status(500).json({
        success: false,
        error: 'Failed to upload invoice image to Google Drive',
      });
    }

    // Fetch sheet data
    const values = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Billing_FMS!A8:CK',
    });
    const rows = values.data.values || [];
    const batchUpdates = [];

    uids.forEach(uid => {
      const rowIndex = rows.findIndex(row => (row[1] || '').trim() === uid.trim());
      if (rowIndex !== -1) {
        const sheetRow = rowIndex + 8;

        batchUpdates.push(
          // BG (col 58) = STATUS_11
          { range: `Billing_FMS!BG${sheetRow}`, values: [[status]] },
          // BH (col 59) = INVOICE_11 (Invoice Number)
          { range: `Billing_FMS!BH${sheetRow}`, values: [[invoiceNumber]] },
          // BI (col 60) = INVOICE_PHOTO_11 (Drive URL)
          { range: `Billing_FMS!BI${sheetRow}`, values: [[imageUrl]] },
          // BK (col 62) = REMARK_11
          { range: `Billing_FMS!BK${sheetRow}`, values: [[remark]] },
        );

        console.log(`[BILL-11] UID ${uid} → Row ${sheetRow}: BG=${status}, BH=${invoiceNumber}, BI=uploaded, BK=${remark}`);
      } else {
        console.warn(`[BILL-11] UID ${uid} NOT FOUND`);
      }
    });

    if (batchUpdates.length === 0) {
      return res.status(400).json({ error: 'No matching UIDs found' });
    }

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      resource: {
        valueInputOption: 'RAW',
        data: batchUpdates.map(u => ({
          range: u.range,
          majorDimension: 'ROWS',
          values: u.values,
        })),
      },
    });

    console.log(`[BILL-11] ✅ ${uids.length} UIDs updated successfully`);
    res.json({
      success: true,
      message: 'Bill-11 submitted successfully',
      uploadedInvoiceUrl: imageUrl,
    });

  } catch (error) {
    console.error('[BILL-11] Submit error:', error.message);
    res.status(500).json({
      error: 'Failed to submit bill-11',
      details: error.message,
    });
  }
});

module.exports = router;