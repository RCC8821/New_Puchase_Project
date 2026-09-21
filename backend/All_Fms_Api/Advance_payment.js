

// const express = require('express');
// const { sheets, spreadsheetId,AdvanceSheetContractorId ,AdvanceSalarySheetId } = require('../config/googleSheet');
// const router = express.Router();

// // ==========================================
// // HELPER - Get Next Empty Row
// // ==========================================
// const getNextEmptyRow = async (sheetName) => {
//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: `${sheetName}!A:A`,
//     });

//     const rows = response.data.values;

//     if (!rows || rows.length === 0) {
//       return 1;
//     }

//     return rows.length + 1;

//   } catch (error) {
//     console.error('Error finding next empty row:', error);
//     throw new Error(`Failed to get next empty row: ${error.message}`);
//   }
// };

// // ==========================================
// // GET API - Dropdown Data
// // ==========================================
// router.get('/dropdown-data', async (req, res) => {
//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Advance_Dropdown_Data!A:C',
//     });

//     const rows = response.data.values;

//     if (!rows || rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'No data found in Advance_Dropdown_Data sheet',
//       });
//     }

//     const siteNames = [];
//     const vendorFirms = [];
//     const Banks = [];

//     rows.forEach((row, index) => {
//       if (index === 0) return;

//       if (row[0] && row[0].trim() !== '') {
//         siteNames.push(row[0].trim());
//       }
//       if (row[1] && row[1].trim() !== '') {
//         vendorFirms.push(row[1].trim());
//       }
//       if (row[2] && row[2].trim() !== '') {
//         Banks.push(row[2].trim());
//       }
//     });

//     return res.status(200).json({
//       success: true,
//       message: 'Dropdown data fetched successfully',
//       data: {
//         siteNames,
//         vendorFirms,
//         Banks,
//       },
//     });

//   } catch (error) {
//     console.error('Error fetching dropdown data:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal Server Error',
//       error: error.message,
//     });
//   }
// });

// // ==========================================
// // ✅ SINGLE POST API - expHead se decide hoga
// // Purchase → Payment_Sheet
// // Contractor → Advance_Payment_Sheet
// // ==========================================



// router.post('/submit-payment', async (req, res) => {
//   try {
//     const {
//       siteName,
//       vendorFirmName,
//       paidAmount,
//       bankDetails,
//       paymentMode,
//       paymentDetails,
//       paymentDate,
//       expHead,
//     } = req.body;

//     // ---- Validate ----
//     if (
//       !siteName ||
//       !vendorFirmName ||
//       !paidAmount ||
//       !bankDetails ||
//       !paymentMode ||
//       !paymentDetails ||
//       !paymentDate ||
//       !expHead
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: 'All fields are required',
//       });
//     }

//     // ---- Timestamp ----
//     const generateTimestamp = () => {
//       const now = new Date();
//       const day = String(now.getDate()).padStart(2, '0');
//       const month = String(now.getMonth() + 1).padStart(2, '0');
//       const year = now.getFullYear();
//       const hours = String(now.getHours()).padStart(2, '0');
//       const minutes = String(now.getMinutes()).padStart(2, '0');
//       const seconds = String(now.getSeconds()).padStart(2, '0');
//       return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
//     };

//     const timestamp = generateTimestamp();

//     // ═══════════════════════════════════════════════════════════
//     // ✅ Helper - Get Next Empty Row (specific sheet ID ke liye)
//     // ═══════════════════════════════════════════════════════════
//     const getNextEmptyRowInSheet = async (sheetId, sheetName) => {
//       try {
//         const response = await sheets.spreadsheets.values.get({
//           spreadsheetId: sheetId,
//           range: `${sheetName}!A:A`,
//         });

//         const rows = response.data.values || [];

//         // Find first empty row starting from row 1
//         for (let i = 0; i < rows.length; i++) {
//           if (!rows[i] || !rows[i][0] || String(rows[i][0]).trim() === '') {
//             return i + 1; // Row numbers are 1-indexed
//           }
//         }

//         // If no empty row found, return next row after last data
//         return rows.length + 1;
//       } catch (error) {
//         console.error(`Error finding empty row in ${sheetName}:`, error);
//         throw new Error(`Failed to get next empty row: ${error.message}`);
//       }
//     };

//     // ══════════════════════════════════════════════
//     // ✅ CONTRACTOR → Sirf Contractor Sheet mein
//     // ══════════════════════════════════════════════
//     if (expHead === 'Contractor') {

//       // Column Mapping (Contractor Sheet → Payment_Sheet):
//       // A = Timestamp
//       // B = Khaali (Planned_8)
//       // C = Project_Name (siteName)
//       // D = Contractor_Name_5 (vendorFirmName)
//       // E-J = Khaali
//       // K = PAID_AMOUNT_8 (paidAmount)
//       // L = BALANCE_AMOUNT_8 (paidAmount same)
//       // M = BANK_DETAILS_8 (bankDetails)
//       // N = PAYMENT_MODE_8 (paymentMode)
//       // O = PAYMENT_DETAILS_8 (paymentDetails)
//       // P = PAYMENT DATE_8 (paymentDate)
//       // Q = Khaali (GRAND_TOTAL)
//       // R = Exp._Head ("Advance")

//       const paymentRowData = [
//         timestamp,        // A
//         '',               // B - Khaali
//         siteName,         // C - Project Name
//         vendorFirmName,   // D - Contractor Name
//         '',               // E - Khaali
//         '',               // F - Khaali
//         '',               // G - Khaali
//         '',               // H - Khaali
//         '',               // I - Khaali
//         '',               // J - Khaali
//         paidAmount,       // K - Paid Amount
//         paidAmount,       // L - Balance (same)
//         bankDetails,      // M - Bank Details
//         paymentMode,      // N - Payment Mode
//         paymentDetails,   // O - Payment Details
//         paymentDate,      // P - Payment Date
//         '',               // Q - Khaali (Grand Total)
//         'Advance',        // R - Exp. Head
//       ];

//       // ✅ Get first empty row in Contractor sheet
//       const nextRow = await getNextEmptyRowInSheet(AdvanceSheetContractorId, 'Payment_Sheet');
//       const range = `Payment_Sheet!A${nextRow}:R${nextRow}`;

//       console.log(`Contractor → Payment_Sheet (Contractor Sheet) → Row ${nextRow}`);

//       const response = await sheets.spreadsheets.values.update({
//         spreadsheetId: AdvanceSheetContractorId,  // ✅ Contractor Sheet
//         range,
//         valueInputOption: 'USER_ENTERED',
//         requestBody: {
//           values: [paymentRowData],
//         },
//       });

//       return res.status(201).json({
//         success: true,
//         message: `Contractor data submitted at row ${nextRow}`,
//         insertedAt: `Row ${nextRow}`,
//         sheet: 'Payment_Sheet (Contractor Sheet)',
//         data: {
//           timestamp, siteName, vendorFirmName, paidAmount,
//           bankDetails, paymentMode, paymentDetails, paymentDate, expHead,
//         },
//         sheetsResponse: {
//           updatedRange: response.data.updatedRange,
//           updatedRows: response.data.updatedRows,
//         },
//       });

//     }

//     // ══════════════════════════════════════════════
//     // ✅ PURCHASE → Sirf Purchase Sheet mein
//     // ══════════════════════════════════════════════
//     else if (expHead === 'Purchase') {

//       const rowData = [
//         timestamp,        // A
//         '',               // B - Khaali
//         siteName,         // C
//         vendorFirmName,   // D
//         '',               // E - Khaali
//         '',               // F - Khaali
//         '',               // G - Khaali
//         paidAmount,       // H
//         paidAmount,       // I (same as paid)
//         bankDetails,      // J
//         paymentMode,      // K
//         paymentDetails,   // L
//         paymentDate,      // M
//         '',               // N - Khaali
//         'Advance',        // O
//       ];

//       // ✅ Get first empty row in Purchase sheet
//       const nextRow = await getNextEmptyRowInSheet(spreadsheetId, 'Payment_Sheet');
//       const range = `Payment_Sheet!A${nextRow}:O${nextRow}`;

//       console.log(`Purchase → Payment_Sheet → Row ${nextRow}`);

//       const response = await sheets.spreadsheets.values.update({
//         spreadsheetId,  // ✅ Purchase Sheet
//         range,
//         valueInputOption: 'USER_ENTERED',
//         requestBody: {
//           values: [rowData],
//         },
//       });

//       return res.status(201).json({
//         success: true,
//         message: `Purchase data submitted at row ${nextRow}`,
//         insertedAt: `Row ${nextRow}`,
//         sheet: 'Payment_Sheet',
//         data: {
//           timestamp, siteName, vendorFirmName, paidAmount,
//           bankDetails, paymentMode, paymentDetails, paymentDate, expHead,
//         },
//         sheetsResponse: {
//           updatedRange: response.data.updatedRange,
//           updatedRows: response.data.updatedRows,
//         },
//       });

//     }

//     // ══════════════════════════════════════════════
//     // ✅ Invalid expHead
//     // ══════════════════════════════════════════════
//     else {
//       return res.status(400).json({
//         success: false,
//         message: `Invalid Exp. Head: "${expHead}". Must be "Purchase" or "Contractor"`,
//       });
//     }

//   } catch (error) {
//     console.error('Error submitting payment data:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal Server Error',
//       error: error.message,
//     });
//   }
// });

// module.exports = router;









const express = require('express');
const { sheets, spreadsheetId, AdvanceSheetContractorId, AdvanceSalarySheetId } = require('../config/googleSheet');
const router = express.Router();

// =========================================================================
// HELPER - Get Next Empty Row (Row 1 Header ko chhodkar Row 2 se check karega)
// =========================================================================
const getNextEmptyRowInSheet = async (sheetId, sheetName, checkColumn = 'A') => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${sheetName}!${checkColumn}:${checkColumn}`,
    });

    const rows = response.data.values || [];

    // Agar sheet bilkul khali hai ya sirf 1 row (Header) hai, toh minimum Row 2 return karega
    if (rows.length <= 1) {
      return 2;
    }

    // Row 1 Header hai (index 0), isliye Row 2 (index 1) se check karenge
    for (let i = 1; i < rows.length; i++) {
      // Agar row khali hai ya cell blank/whitespace hai
      if (!rows[i] || rows[i].length === 0 || !rows[i][0] || String(rows[i][0]).trim() === '') {
        return i + 1; // 1-indexed row number
      }
    }

    // Agar Row 2 se end tak saari rows bhari hain, toh next available empty row
    return rows.length + 1;

  } catch (error) {
    console.error(`Error finding empty row in ${sheetName} (col ${checkColumn}):`, error);
    throw new Error(`Failed to get next empty row: ${error.message}`);
  }
};

// =========================================================================
// GET API - Dropdown Data (Sites, Vendors, Banks & Employees from Column D)
// =========================================================================
router.get('/dropdown-data', async (req, res) => {
  try {
    // Range ko A:D kiya taaki Column D (Employees) bhi fetch ho sake
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Advance_Dropdown_Data!A:D',
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
    const employees = []; // New array for Column D

    rows.forEach((row, index) => {
      if (index === 0) return; // Header row skip

      if (row[0] && row[0].trim() !== '') {
        siteNames.push(row[0].trim());
      }
      if (row[1] && row[1].trim() !== '') {
        vendorFirms.push(row[1].trim());
      }
      if (row[2] && row[2].trim() !== '') {
        Banks.push(row[2].trim());
      }
      if (row[3] && row[3].trim() !== '') {
        employees.push(row[3].trim()); // Column D
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Dropdown data fetched successfully',
      data: {
        siteNames,
        vendorFirms,
        Banks,
        employees, // Return employees list
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

// =========================================================================
// ✅ SINGLE POST API - expHead Routing
// =========================================================================
router.post('/submit-payment', async (req, res) => {
  try {
    const {
      siteName,
      vendorFirmName, // Internally used for Vendor or Employee based on expHead
      paidAmount,
      bankDetails,
      paymentMode,
      paymentDetails,
      paymentDate,
      expHead,
    } = req.body;

    // ---- Validation ----
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

    // ---- Timestamp Generator ----
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

    // ══════════════════════════════════════════════════════════════════
    // 1️⃣ ADVANCE SALARY → AdvanceSalarySheetId (Columns B to I only)
    // ══════════════════════════════════════════════════════════════════
    if (expHead === 'Advnce Salary') {

      // Sirf B se I tak ka data (Column A bilkul touch nahi hoga):
      // B = Timestamp
      // C = Site Name
      // D = Employee_Name
      // E = Advance_Amount
      // F = BANK_DETAILS_17
      // G = PAYMENT_MODE_17
      // H = PAYMENT_DETAILS_17
      // I = PAYMENT DATE_18

      const salaryRowData = [
        timestamp,        // B
        siteName,         // C
        vendorFirmName,   // D
        paidAmount,       // E
        bankDetails,      // F
        paymentMode,      // G
        paymentDetails,   // H
        paymentDate,      // I
      ];

      // Column B check karke Row 2 se agla empty row dhoondega
      const nextRow = await getNextEmptyRowInSheet(AdvanceSalarySheetId, 'Advance_Salary', 'B');
      const range = `Advance_Salary!B${nextRow}:I${nextRow}`;

      console.log(`Advnce Salary → Advance_Salary → Row ${nextRow} (Range: B${nextRow}:I${nextRow})`);

      const response = await sheets.spreadsheets.values.update({
        spreadsheetId: AdvanceSalarySheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [salaryRowData],
        },
      });

      return res.status(201).json({
        success: true,
        message: `Advance Salary data submitted at row ${nextRow}`,
        insertedAt: `Row ${nextRow}`,
        sheet: 'Advance_Salary',
        data: {
          timestamp, siteName, vendorFirmName, paidAmount,
          bankDetails, paymentMode, paymentDetails, paymentDate, expHead,
        },
        sheetsResponse: {
          updatedRange: response.data.updatedRange,
          updatedRows: response.data.updatedRows,
        },
      });

    }

    // ══════════════════════════════════════════════════════════════════
    // 2️⃣ CONTRACTOR → AdvanceSheetContractorId (Payment_Sheet)
    // ══════════════════════════════════════════════════════════════════
    else if (expHead === 'Contractor') {

      const paymentRowData = [
        timestamp,        // A
        '',               // B
        siteName,         // C
        vendorFirmName,   // D
        '',               // E
        '',               // F
        '',               // G
        '',               // H
        '',               // I
        '',               // J
        paidAmount,       // K
        paidAmount,       // L
        bankDetails,      // M
        paymentMode,      // N
        paymentDetails,   // O
        paymentDate,      // P
        '',               // Q
        'Advance',        // R
      ];

      // Column A check karke Row 2 se agla empty row dhoondega
      const nextRow = await getNextEmptyRowInSheet(AdvanceSheetContractorId, 'Payment_Sheet', 'A');
      const range = `Payment_Sheet!A${nextRow}:R${nextRow}`;

      console.log(`Contractor → Payment_Sheet → Row ${nextRow}`);

      const response = await sheets.spreadsheets.values.update({
        spreadsheetId: AdvanceSheetContractorId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [paymentRowData],
        },
      });

      return res.status(201).json({
        success: true,
        message: `Contractor data submitted at row ${nextRow}`,
        insertedAt: `Row ${nextRow}`,
        sheet: 'Payment_Sheet (Contractor Sheet)',
        data: {
          timestamp, siteName, vendorFirmName, paidAmount,
          bankDetails, paymentMode, paymentDetails, paymentDate, expHead,
        },
        sheetsResponse: {
          updatedRange: response.data.updatedRange,
          updatedRows: response.data.updatedRows,
        },
      });

    }

    // ══════════════════════════════════════════════════════════════════
    // 3️⃣ PURCHASE → spreadsheetId (Payment_Sheet)
    // ══════════════════════════════════════════════════════════════════
    else if (expHead === 'Purchase') {

      const rowData = [
        timestamp,        // A
        '',               // B
        siteName,         // C
        vendorFirmName,   // D
        '',               // E
        '',               // F
        '',               // G
        paidAmount,       // H
        paidAmount,       // I
        bankDetails,      // J
        paymentMode,      // K
        paymentDetails,   // L
        paymentDate,      // M
        '',               // N
        'Advance',        // O
      ];

      // Column A check karke Row 2 se agla empty row dhoondega
      const nextRow = await getNextEmptyRowInSheet(spreadsheetId, 'Payment_Sheet', 'A');
      const range = `Payment_Sheet!A${nextRow}:O${nextRow}`;

      console.log(`Purchase → Payment_Sheet → Row ${nextRow}`);

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
        message: `Purchase data submitted at row ${nextRow}`,
        insertedAt: `Row ${nextRow}`,
        sheet: 'Payment_Sheet',
        data: {
          timestamp, siteName, vendorFirmName, paidAmount,
          bankDetails, paymentMode, paymentDetails, paymentDate, expHead,
        },
        sheetsResponse: {
          updatedRange: response.data.updatedRange,
          updatedRows: response.data.updatedRows,
        },
      });

    }

    // ══════════════════════════════════════════════════════════════════
    // 4️⃣ Invalid Exp Head
    // ══════════════════════════════════════════════════════════════════
    else {
      return res.status(400).json({
        success: false,
        message: `Invalid Exp. Head: "${expHead}". Must be "Purchase", "Contractor" or "Advnce Salary"`,
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


// =========================================================================
// GET API - Fetch Advance Salary Records (A to I from Advance_Salary sheet)
// =========================================================================
// =========================================================================
// GET API - Fetch Advance Salary Records (Full Cleaned Amounts & Balance)
// =========================================================================
router.get('/advance-salary-list', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: AdvanceSalarySheetId,
      range: 'Advance_Salary!A:I',
    });

    const rows = response.data.values || [];

    if (rows.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No advance salary records found',
        data: [],
      });
    }

    // ✅ Universal Number Cleaner (Commas, ₹ symbols, spaces sab saaf kar dega)
    const cleanNumber = (val) => {
      if (val === null || val === undefined || val === '') return 0;
      const str = String(val).replace(/[^0-9.-]/g, '').trim();
      const num = parseFloat(str);
      return isNaN(num) ? 0 : num;
    };

    const records = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;

      const uid = String(row[0] || '').trim();
      const timestamp = String(row[1] || '').trim();
      const siteName = String(row[2] || '').trim();
      const employeeName = String(row[3] || '').trim();

      // Skip empty rows & Header Row
      if (!timestamp) continue;
      if (
        uid.toLowerCase() === 'uid' ||
        timestamp.toLowerCase() === 'timestamp' ||
        employeeName.toLowerCase() === 'employee_name' ||
        siteName.toLowerCase() === 'site name'
      ) {
        continue;
      }

      records.push({
        rowNumber: i + 1,
        uid: uid,
        timestamp: timestamp,
        siteName: siteName,
        employeeName: employeeName,
        advanceAmount: cleanNumber(row[4]), // ✅ Full cleaned Advance
        bankDetails: row[5] || '',
        paymentMode: row[6] || '',
        paymentDetails: row[7] || '',
        paymentDate: row[8] || '',
      });
    }

    // ✅ ALSO fetch deductions from Dedcut_Salary sheet
    let deductions = [];
    try {
      const dedResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: AdvanceSalarySheetId,
        range: 'Dedcut_Salary!A:G',
      });
      const dedRows = dedResponse.data.values || [];
      for (let i = 0; i < dedRows.length; i++) {
        const row = dedRows[i];
        if (!row || !row[0]) continue;
        const uid = String(row[0]).trim();
        if (uid.toLowerCase() === 'uid' || uid.toLowerCase() === 'timestamp') continue;

        deductions.push({
          uid: uid,
          deductAmount: cleanNumber(row[4]), // ✅ Full cleaned Deducted Amount
        });
      }
    } catch (e) {
      console.log('Dedcut_Salary sheet is empty or not yet created');
    }

    // ✅ Calculate total deducted & balance for each UID
    const recordsWithBalance = records.map((rec) => {
      const matchingDeductions = deductions.filter(
        (d) => d.uid.toLowerCase() === rec.uid.toLowerCase()
      );

      const totalDeducted = matchingDeductions.reduce(
        (sum, d) => sum + d.deductAmount, 0
      );

      const advance = rec.advanceAmount;
      const balance = Math.max(advance - totalDeducted, 0);

      return {
        ...rec,
        totalDeducted: totalDeducted,   // ✅ Full Deducted Sum
        balanceAmount: balance,         // ✅ Full Balance Calculation
      };
    });

    return res.status(200).json({
      success: true,
      message: 'Advance salary records fetched successfully',
      count: recordsWithBalance.length,
      data: recordsWithBalance,
    });

  } catch (error) {
    console.error('Error fetching advance salary records:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
});
// =========================================================================
// GET API - Fetch All Salary Deductions
// =========================================================================
router.get('/salary-deductions', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: AdvanceSalarySheetId,
      range: 'Dedcut_Salary!A:G',
    });

    const rows = response.data.values || [];

    if (rows.length <= 1) {
      return res.status(200).json({
        success: true,
        message: 'No deductions found',
        data: [],
      });
    }

    const deductions = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row[0] || String(row[0]).trim() === '') continue;

      deductions.push({
        rowNumber: i + 1,
        uid: row[0] || '',
        timestamp: row[1] || '',
        siteName: row[2] || '',
        employeeName: row[3] || '',
        deductAmount: row[4] || '0',
        month: row[5] || '',
        remark: row[6] || '',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Deductions fetched successfully',
      count: deductions.length,
      data: deductions,
    });

  } catch (error) {
    console.error('Error fetching deductions:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
});

// =========================================================================
// POST API - Save Salary Deduction
// =========================================================================
router.post('/deduct-salary', async (req, res) => {
  try {
    const {
      uid,
      siteName,
      employeeName,
      deductAmount,
      month,
      remark,
    } = req.body;

    // ---- Validation ----
    if (!uid || !siteName || !employeeName || !deductAmount || !month) {
      return res.status(400).json({
        success: false,
        message: 'UID, Site Name, Employee Name, Deduct Amount and Month are required',
      });
    }

    // ---- Timestamp Generator ----
    const generateTimestamp = () => {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const mo = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      return `${day}/${mo}/${year} ${hours}:${minutes}:${seconds}`;
    };

    const timestamp = generateTimestamp();

    // Column mapping (Dedcut_Salary Sheet):
    // A = UID
    // B = Timestamp
    // C = Site Name
    // D = Employee_Name
    // E = Deduct_Amount
    // F = Month
    // G = Remark

    const deductRowData = [
      uid,
      timestamp,
      siteName,
      employeeName,
      deductAmount,
      month,
      remark || '',
    ];

    // Get next empty row (checking A column)
    const nextRow = await getNextEmptyRowInSheet(AdvanceSalarySheetId, 'Dedcut_Salary', 'A');
    const range = `Dedcut_Salary!A${nextRow}:G${nextRow}`;

    console.log(`Salary Deduction → Dedcut_Salary → Row ${nextRow}`);

    const response = await sheets.spreadsheets.values.update({
      spreadsheetId: AdvanceSalarySheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [deductRowData],
      },
    });

    return res.status(201).json({
      success: true,
      message: `Deduction saved at row ${nextRow}`,
      insertedAt: `Row ${nextRow}`,
      data: {
        uid, timestamp, siteName, employeeName,
        deductAmount, month, remark,
      },
      sheetsResponse: {
        updatedRange: response.data.updatedRange,
        updatedRows: response.data.updatedRows,
      },
    });

  } catch (error) {
    console.error('Error saving deduction:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
});

module.exports = router;