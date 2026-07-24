

const express = require('express');
const { sheets, spreadsheetId } = require('../config/googleSheet');
const router = express.Router();

// ==========================================
// HELPER - Get Next Empty Row
// ==========================================
const getNextEmptyRow = async (sheetName) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:A`,
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return 1;
    }

    return rows.length + 1;

  } catch (error) {
    console.error('Error finding next empty row:', error);
    throw new Error(`Failed to get next empty row: ${error.message}`);
  }
};

// ==========================================
// GET API - Dropdown Data
// ==========================================
router.get('/dropdown-data', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Advance_Dropdown_Data!A:C',
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No data found in Advance_Dropdown_Data sheet',
      });
    }

    const siteNames = [];
    const vendorFirms = [];
    const Banks = [];

    rows.forEach((row, index) => {
      if (index === 0) return;

      if (row[0] && row[0].trim() !== '') {
        siteNames.push(row[0].trim());
      }
      if (row[1] && row[1].trim() !== '') {
        vendorFirms.push(row[1].trim());
      }
      if (row[2] && row[2].trim() !== '') {
        Banks.push(row[2].trim());
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Dropdown data fetched successfully',
      data: {
        siteNames,
        vendorFirms,
        Banks,
      },
    });

  } catch (error) {
    console.error('Error fetching dropdown data:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
});

// ==========================================
// ✅ SINGLE POST API - expHead se decide hoga
// Purchase → Payment_Sheet
// Contractor → Advance_Payment_Sheet
// ==========================================

router.post('/submit-payment', async (req, res) => {
  try {
    const {
      siteName,
      vendorFirmName,
      paidAmount,
      bankDetails,
      paymentMode,
      paymentDetails,
      paymentDate,
      expHead,
    } = req.body;

    // ---- Validate ----
    if (
      !siteName ||
      !vendorFirmName ||
      !paidAmount ||
      !bankDetails ||
      !paymentMode ||
      !paymentDetails ||
      !paymentDate ||
      !expHead
    ) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    // ---- Timestamp ----
    const generateTimestamp = () => {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    };

    const timestamp = generateTimestamp();

    let sheetName, range, rowData;

    // ==========================================
    // ✅ Check expHead → Decide Sheet
    // ==========================================

    if (expHead === 'Contractor') {
      // ✅ Contractor → Advance_Payment_Sheet (A to I)
      sheetName = 'Advance_Payment_Sheet';

      rowData = [
        timestamp,        // A - Timestamp
        siteName,         // B - Site Name
        vendorFirmName,   // C - VENDOR FIRM NAME
        paidAmount,       // D - PAID_AMOUNT
        bankDetails,      // E - BANK_DETAILS
        paymentMode,      // F - PAYMENT_MODE
        paymentDetails,   // G - PAYMENT_DETAILS
        paymentDate,      // H - PAYMENT DATE
        expHead,          // I - Exp._Head
      ];

      const nextRow = await getNextEmptyRow(sheetName);
      range = `${sheetName}!A${nextRow}:O${nextRow}`;

      console.log(`Contractor → ${sheetName} → Row ${nextRow}`);

      const response = await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [rowData],
        },
      });

      return res.status(201).json({
        success: true,
        message: `Contractor data submitted to ${sheetName} at row ${nextRow}`,
        insertedAt: `Row ${nextRow}`,
        sheet: sheetName,
        data: {
          timestamp, siteName, vendorFirmName, paidAmount,
          bankDetails, paymentMode, paymentDetails, paymentDate, expHead,
        },
        sheetsResponse: {
          updatedRange: response.data.updatedRange,
          updatedRows: response.data.updatedRows,
        },
      });

    } else if (expHead === 'Purchase') {
      // ✅ Purchase → Payment_Sheet (A to N)
      // A = Timestamp
      // B = Khaali
      // C = Site Name
      // D = Vendor Firm Name
      // E = Khaali
      // F = Khaali
      // G = Khaali
      // H = Paid Amount
      // I = Paid Amount (Balance = same)
      // J = Bank Details
      // K = Payment Mode
      // L = Payment Details
      // M = Payment Date
      // N = Khaali

      sheetName = 'Payment_Sheet';

      rowData = [
        timestamp,        // A
        '',               // B - Khaali
        siteName,         // C
        vendorFirmName,   // D
        '',               // E - Khaali
        '',               // F - Khaali
        '',               // G - Khaali
        paidAmount,       // H
        paidAmount,       // I (same as paid)
        bankDetails,      // J
        paymentMode,      // K
        paymentDetails,   // L
        paymentDate,      // M
        '',    
        'Advance',           // N - Khaali
      ];

      const nextRow = await getNextEmptyRow(sheetName);
      range = `${sheetName}!A${nextRow}:O${nextRow}`;

      console.log(`Purchase → ${sheetName} → Row ${nextRow}`);

      const response = await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [rowData],
        },
      });

      return res.status(201).json({
        success: true,
        message: `Purchase data submitted to ${sheetName} at row ${nextRow}`,
        insertedAt: `Row ${nextRow}`,
        sheet: sheetName,
        data: {
          timestamp, siteName, vendorFirmName, paidAmount,
          bankDetails, paymentMode, paymentDetails, paymentDate, expHead,
        },
        sheetsResponse: {
          updatedRange: response.data.updatedRange,
          updatedRows: response.data.updatedRows,
        },
      });

    } else {
      return res.status(400).json({
        success: false,
        message: `Invalid Exp. Head: "${expHead}". Must be "Purchase" or "Contractor"`,
      });
    }

  } catch (error) {
    console.error('Error submitting payment data:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
});

module.exports = router;