const express = require('express');
const { Readable } = require('stream');
const {
  sheets,
  drive,
  spreadsheetId,
  AdvanceSheetContractorId,
  AdvanceSalarySheetId,
  AdvancePettyCashExpensesId,
} = require('../config/googleSheet');
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
      if (!rows[i] || rows[i].length === 0 || !rows[i][0] || String(rows[i][0]).trim() === '') {
        return i + 1; // 1-indexed row number
      }
    }

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
    const employees = [];

    rows.forEach((row, index) => {
      if (index === 0) return; // Header row skip

      if (row[0] && row[0].trim() !== '') siteNames.push(row[0].trim());
      if (row[1] && row[1].trim() !== '') vendorFirms.push(row[1].trim());
      if (row[2] && row[2].trim() !== '') Banks.push(row[2].trim());
      if (row[3] && row[3].trim() !== '') employees.push(row[3].trim());
    });

    return res.status(200).json({
      success: true,
      message: 'Dropdown data fetched successfully',
      data: { siteNames, vendorFirms, Banks, employees },
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
      vendorFirmName, // Vendor ya Employee (expHead ke hisaab se)
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

      const salaryRowData = [
        timestamp,        // B - Timestamp
        siteName,         // C - Site Name
        vendorFirmName,   // D - Employee_Name
        paidAmount,       // E - Advance_Amount
        bankDetails,      // F - BANK_DETAILS_17
        paymentMode,      // G - PAYMENT_MODE_17
        paymentDetails,   // H - PAYMENT_DETAILS_17
        paymentDate,      // I - PAYMENT DATE_18
      ];

      const nextRow = await getNextEmptyRowInSheet(AdvanceSalarySheetId, 'Advance_Salary', 'B');
      const range = `Advance_Salary!B${nextRow}:I${nextRow}`;

      console.log(`Advnce Salary → Advance_Salary → Row ${nextRow} (Range: ${range})`);

      const response = await sheets.spreadsheets.values.update({
        spreadsheetId: AdvanceSalarySheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [salaryRowData] },
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

      const nextRow = await getNextEmptyRowInSheet(AdvanceSheetContractorId, 'Payment_Sheet', 'A');
      const range = `Payment_Sheet!A${nextRow}:R${nextRow}`;

      console.log(`Contractor → Payment_Sheet → Row ${nextRow}`);

      const response = await sheets.spreadsheets.values.update({
        spreadsheetId: AdvanceSheetContractorId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [paymentRowData] },
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

      const nextRow = await getNextEmptyRowInSheet(spreadsheetId, 'Payment_Sheet', 'A');
      const range = `Payment_Sheet!A${nextRow}:O${nextRow}`;

      console.log(`Purchase → Payment_Sheet → Row ${nextRow}`);

      const response = await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [rowData] },
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
    // 4️⃣ ADVANCE PETTY CASH → AdvancePettyCashExpensesId (Sheet: Advance, A to P)
    // ══════════════════════════════════════════════════════════════════
    else if (expHead === 'Advance Petty Cash') {

      if (!AdvancePettyCashExpensesId) {
        return res.status(500).json({
          success: false,
          message: 'AdvancePettyCashExpensesId is not configured in .env',
        });
      }

      const pettyRowData = [
        timestamp,        // A - Timestamp
        '',               // B - Planned_17
        siteName,         // C - Site Name
        vendorFirmName,   // D - VENDOR FIRM NAME
        '',               // E - BILL NO. 16
        '',               // F - BILL DATE 16
        '',               // G - NET_Amount_16
        paidAmount,       // H - PAID_AMOUNT_17
        paidAmount,       // I - BALANCE_AMOUNT_17
        bankDetails,      // J - BANK_DETAILS_17
        paymentMode,      // K - PAYMENT_MODE_17
        paymentDetails,   // L - PAYMENT_DETAILS_17
        paymentDate,      // M - PAYMENT DATE_18
        '',               // N - GRAND_TOTAL
        'Advance',        // O - Exp._Head
        expHead,          // P - "Advance Petty Cash"
      ];

      const nextRow = await getNextEmptyRowInSheet(AdvancePettyCashExpensesId, 'Advance', 'A');
      const range = `Advance!A${nextRow}:P${nextRow}`;

      console.log(`Advance Petty Cash → Advance → Row ${nextRow} (Range: ${range})`);

      const response = await sheets.spreadsheets.values.update({
        spreadsheetId: AdvancePettyCashExpensesId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [pettyRowData] },
      });

      return res.status(201).json({
        success: true,
        message: `Advance Petty Cash data submitted at row ${nextRow}`,
        insertedAt: `Row ${nextRow}`,
        sheet: 'Advance (Petty Cash Sheet)',
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
    // 5️⃣ Invalid Exp Head
    // ══════════════════════════════════════════════════════════════════
    else {
      return res.status(400).json({
        success: false,
        message: `Invalid Exp. Head: "${expHead}". Must be "Purchase", "Contractor", "Advnce Salary" or "Advance Petty Cash"`,
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
        uid,
        timestamp,
        siteName,
        employeeName,
        advanceAmount: cleanNumber(row[4]),
        bankDetails: row[5] || '',
        paymentMode: row[6] || '',
        paymentDetails: row[7] || '',
        paymentDate: row[8] || '',
      });
    }

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
          uid,
          deductAmount: cleanNumber(row[4]),
        });
      }
    } catch (e) {
      console.log('Dedcut_Salary sheet is empty or not yet created');
    }

    const recordsWithBalance = records.map((rec) => {
      const matchingDeductions = deductions.filter(
        (d) => d.uid.toLowerCase() === rec.uid.toLowerCase()
      );
      const totalDeducted = matchingDeductions.reduce((sum, d) => sum + d.deductAmount, 0);
      const balance = Math.max(rec.advanceAmount - totalDeducted, 0);

      return {
        ...rec,
        totalDeducted,
        balanceAmount: balance,
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
    const { uid, siteName, employeeName, deductAmount, month, remark } = req.body;

    if (!uid || !siteName || !employeeName || !deductAmount || !month) {
      return res.status(400).json({
        success: false,
        message: 'UID, Site Name, Employee Name, Deduct Amount and Month are required',
      });
    }

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

    // A = UID, B = Timestamp, C = Site Name, D = Employee_Name
    // E = Deduct_Amount, F = Month, G = Remark
    const deductRowData = [
      uid,
      timestamp,
      siteName,
      employeeName,
      deductAmount,
      month,
      remark || '',
    ];

    const nextRow = await getNextEmptyRowInSheet(AdvanceSalarySheetId, 'Dedcut_Salary', 'A');
    const range = `Dedcut_Salary!A${nextRow}:G${nextRow}`;

    console.log(`Salary Deduction → Dedcut_Salary → Row ${nextRow}`);

    const response = await sheets.spreadsheets.values.update({
      spreadsheetId: AdvanceSalarySheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [deductRowData] },
    });

    return res.status(201).json({
      success: true,
      message: `Deduction saved at row ${nextRow}`,
      insertedAt: `Row ${nextRow}`,
      data: { uid, timestamp, siteName, employeeName, deductAmount, month, remark },
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

// =========================================================================
// 🧾 ADVANCE PETTY CASH
// -------------------------------------------------------------------------
// Advance sheet : D = Person, H = Amount, P = "Advance Petty Cash"
// Bill_Entry    : A TimeStamp | B UID | C Site Name | D VENDOR FIRM NAME (Person)
//                 E BILL NO. | F BILL DATE | G NET_Amount | H Work Description
//                 I Material Photo | J Bill Photo | K Remarks | N Status
// Balance       : Total Advance − (Bills jinka Status "Reject" nahi hai)
// =========================================================================
const PETTY_CASH_HEAD = 'Advance Petty Cash';
const PC_STATUS_OPTIONS = ['Done', 'Reject'];
const PC_DRIVE_FOLDER_ID = process.env.PETTY_CASH_DRIVE_FOLDER_ID || process.env.GOOGLE_DRIVE_FOLDER_ID;

const pcNorm = (v) => String(v || '').trim().toLowerCase();

const pcCleanNumber = (val) => {
  if (val === null || val === undefined || val === '') return 0;
  const num = parseFloat(String(val).replace(/[^0-9.-]/g, ''));
  return isNaN(num) ? 0 : num;
};

const pcTimestamp = () => {
  const now = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${p(now.getDate())}/${p(now.getMonth() + 1)}/${now.getFullYear()} ${p(now.getHours())}:${p(now.getMinutes())}:${p(now.getSeconds())}`;
};

const pcConfigError = (res) =>
  res.status(500).json({ success: false, message: 'AdvancePettyCashExpensesId is not configured in .env' });

// ── Advance sheet se sirf "Advance Petty Cash" wali rows ─────────────────
const readPettyAdvances = async () => {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: AdvancePettyCashExpensesId,
    range: 'Advance!A:P',
  });
  const rows = response.data.values || [];
  const out = [];

  rows.forEach((row, i) => {
    if (i === 0 || !row) return;
    if (pcNorm(row[15]) !== pcNorm(PETTY_CASH_HEAD)) return;
    if (!row[3] || String(row[3]).trim() === '') return;

    out.push({
      rowNumber: i + 1,
      timestamp: row[0] || '',
      siteName: row[2] || '',
      personName: String(row[3]).trim(),  // D
      amount: pcCleanNumber(row[7]),      // H - PAID_AMOUNT_17
      bankDetails: row[9] || '',          // J
      paymentMode: row[10] || '',         // K
      paymentDetails: row[11] || '',      // L
      paymentDate: row[12] || '',         // M
    });
  });

  return out;
};

// ── Bill_Entry sheet ki saari rows (A:N) ─────────────────────────────────
const readPettyBills = async () => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: AdvancePettyCashExpensesId,
      range: 'Bill_Entry!A2:N',
    });
    const rows = response.data.values || [];
    const out = [];

    rows.forEach((row, i) => {
      if (i === 0 || !row || !row[0]) return;

      out.push({
        rowNumber: i + 1,
        timestamp: row[0] || '',                           // A
        uid: row[1] || '',                                 // B
        siteName: row[2] || '',                            // C
        personName: String(row[3] || '').trim(),           // D
        billNo: row[4] || '',                              // E
        billDate: row[5] || '',                            // F
        netAmount: pcCleanNumber(row[6]),                  // G
        workDescription: row[7] || '',                     // H
        materialPhoto: row[8] || '',                       // I
        billPhoto: row[9] || '',                           // J
        remarks: row[10] || '',                            // K
        status: String(row[13] || '').trim() || 'Pending', // N
      });
    });

    return out;
  } catch (e) {
    console.log('Bill_Entry sheet is empty or not yet created');
    return [];
  }
};

const pcIsRejected = (b) => pcNorm(b.status) === 'reject';

const pcSummarize = (advances, bills) => {
  const totalAdvance = advances.reduce((s, a) => s + a.amount, 0);
  const totalBills = bills.filter((b) => !pcIsRejected(b)).reduce((s, b) => s + b.netAmount, 0);
  return {
    totalAdvance,
    totalBills,
    balance: totalAdvance - totalBills,
    billCount: bills.length,
    pendingCount: bills.filter((b) => pcNorm(b.status) === 'pending').length,
    rejectedAmount: bills.filter(pcIsRejected).reduce((s, b) => s + b.netAmount, 0),
  };
};

// ── Photo (base64) → Google Drive → link ─────────────────────────────────
const uploadImageToDrive = async (dataUrl, baseName) => {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(String(dataUrl || ''));
  if (!match) throw new Error('Invalid image format');

  const mimeType = match[1];
  const buffer = Buffer.from(match[2], 'base64');
  if (buffer.length > 5 * 1024 * 1024) throw new Error('Photo 5MB se badi hai');

  const ext = mimeType.split('/')[1].replace('jpeg', 'jpg');
  const bufferStream = new Readable();
  bufferStream.push(buffer);
  bufferStream.push(null);

  const response = await drive.files.create({
    supportsAllDrives: true,
    requestBody: {
      name: `${baseName}.${ext}`,
      mimeType,
      parents: [PC_DRIVE_FOLDER_ID],
    },
    media: { mimeType, body: bufferStream },
    fields: 'id, webViewLink',
  });

  await drive.permissions.create({
    fileId: response.data.id,
    supportsAllDrives: true,
    requestBody: { role: 'reader', type: 'anyone' },
  });

  return response.data.webViewLink;
};

// =========================================================================
// GET - Petty Cash Persons (Admin dropdown ke liye)
// =========================================================================
router.get('/petty-cash/persons', async (req, res) => {
  try {
    if (!AdvancePettyCashExpensesId) return pcConfigError(res);

    const advances = await readPettyAdvances();
    const map = new Map();
    advances.forEach((a) => {
      const k = pcNorm(a.personName);
      if (!map.has(k)) map.set(k, a.personName);
    });

    return res.status(200).json({
      success: true,
      message: 'Petty cash persons fetched successfully',
      data: Array.from(map.values()).sort((a, b) => a.localeCompare(b)),
    });
  } catch (error) {
    console.error('Error fetching petty cash persons:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
});

// =========================================================================
// GET - Ek Person ka Ledger (Advances + Bills + Balance)
// =========================================================================
router.get('/petty-cash/ledger', async (req, res) => {
  try {
    const name = String(req.query.name || '').trim();
    if (!name) return res.status(400).json({ success: false, message: 'Person name (name) is required' });
    if (!AdvancePettyCashExpensesId) return pcConfigError(res);

    const [advances, bills] = await Promise.all([readPettyAdvances(), readPettyBills()]);
    const myAdvances = advances.filter((a) => pcNorm(a.personName) === pcNorm(name));
    const myBills = bills.filter((b) => pcNorm(b.personName) === pcNorm(name));

    return res.status(200).json({
      success: true,
      message: 'Petty cash ledger fetched successfully',
      data: {
        personName: name,
        ...pcSummarize(myAdvances, myBills),
        advances: myAdvances.reverse(),
        bills: myBills.reverse(),
      },
    });
  } catch (error) {
    console.error('Error fetching petty cash ledger:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
});

// =========================================================================
// GET - Sabka Data (Senior / Ramprasad Sir ke liye)
// =========================================================================
router.get('/petty-cash/all', async (req, res) => {
  try {
    if (!AdvancePettyCashExpensesId) return pcConfigError(res);

    const [advances, bills] = await Promise.all([readPettyAdvances(), readPettyBills()]);

    const names = new Map();
    [...advances, ...bills].forEach((x) => {
      const k = pcNorm(x.personName);
      if (k && !names.has(k)) names.set(k, x.personName);
    });

    const persons = Array.from(names.entries())
      .map(([k, display]) => ({
        personName: display,
        ...pcSummarize(
          advances.filter((a) => pcNorm(a.personName) === k),
          bills.filter((b) => pcNorm(b.personName) === k)
        ),
      }))
      .sort((a, b) => a.personName.localeCompare(b.personName));

    return res.status(200).json({
      success: true,
      message: 'Petty cash data fetched successfully',
      data: {
        overall: pcSummarize(advances, bills),
        persons,
        bills: bills.slice().reverse(), // latest pehle
      },
    });
  } catch (error) {
    console.error('Error fetching all petty cash data:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
});

// =========================================================================
// POST - Bill Entry (Bill_Entry A to K) + Photos Drive par
// =========================================================================
router.post('/petty-cash/bill-entry', async (req, res) => {
  try {
    const {
      personName,       // Login person → Column D
      siteName,
      billNo,
      billDate,
      netAmount,
      workDescription,
      remarks,
      materialPhoto,    // base64 (optional)
      billPhoto,        // base64 (required)
    } = req.body;

    if (!personName || !siteName || !billNo || !billDate || !netAmount || !workDescription || !billPhoto) {
      return res.status(400).json({
        success: false,
        message: 'Site Name, Bill No, Bill Date, Net Amount, Work Description aur Bill Photo required hain',
      });
    }
    if (pcCleanNumber(netAmount) <= 0) {
      return res.status(400).json({ success: false, message: 'Net Amount 0 se zyada hona chahiye' });
    }
    if (!AdvancePettyCashExpensesId) return pcConfigError(res);
    if (!PC_DRIVE_FOLDER_ID) {
      return res.status(500).json({ success: false, message: 'GOOGLE_DRIVE_FOLDER_ID is not configured in .env' });
    }

    // ---- Photos upload ----
    const safeBillNo = String(billNo).replace(/[^a-zA-Z0-9_-]/g, '_');
    const stamp = Date.now();

    const [billPhotoUrl, materialPhotoUrl] = await Promise.all([
      uploadImageToDrive(billPhoto, `PettyCash_Bill_${safeBillNo}_${stamp}`),
      materialPhoto
        ? uploadImageToDrive(materialPhoto, `PettyCash_Material_${safeBillNo}_${stamp}`)
        : Promise.resolve(''),
    ]);

    // ---- Sheet write ----
    const timestamp = pcTimestamp();
    const nextRow = await getNextEmptyRowInSheet(AdvancePettyCashExpensesId, 'Bill_Entry', 'A');
    const uid = `PCB-${String(nextRow - 1).padStart(4, '0')}`;

    const billRowData = [
      timestamp,          // A - TimeStamp
      uid,                // B - UID
      siteName,           // C - Site Name
      personName,         // D - VENDOR FIRM NAME (login person)
      billNo,             // E - BILL NO.
      billDate,           // F - BILL DATE
      netAmount,          // G - NET_Amount
      workDescription,    // H - Work Description
      materialPhotoUrl,   // I - Material Photo
      billPhotoUrl,       // J - Bill Photo
      remarks || '',      // K - Remarks
    ];

    const range = `Bill_Entry!A${nextRow}:K${nextRow}`;
    console.log(`Petty Cash Bill → Bill_Entry → Row ${nextRow} (UID: ${uid}, Person: ${personName})`);

    await sheets.spreadsheets.values.update({
      spreadsheetId: AdvancePettyCashExpensesId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [billRowData] },
    });

    return res.status(201).json({
      success: true,
      message: `Bill saved successfully (UID: ${uid})`,
      insertedAt: `Row ${nextRow}`,
      data: { uid, timestamp, personName, siteName, billNo, billDate, netAmount, billPhotoUrl, materialPhotoUrl },
    });
  } catch (error) {
    console.error('Error saving petty cash bill:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
});

// =========================================================================
// POST - Status Update (Done / Reject → Column N)
// =========================================================================
router.post('/petty-cash/update-status', async (req, res) => {
  try {
    const { rowNumber, uid, status } = req.body;
    const row = parseInt(rowNumber, 10);

    if (!row || row < 2 || !uid || !status) {
      return res.status(400).json({ success: false, message: 'rowNumber, uid aur status required hain' });
    }
    if (!PC_STATUS_OPTIONS.includes(status)) {
      return res.status(400).json({ success: false, message: 'Status sirf "Done" ya "Reject" ho sakta hai' });
    }
    if (!AdvancePettyCashExpensesId) return pcConfigError(res);

    // Safety: same row par wahi UID hai ya nahi
    const check = await sheets.spreadsheets.values.get({
      spreadsheetId: AdvancePettyCashExpensesId,
      range: `Bill_Entry!B${row}`,
    });
    const sheetUid = String(check.data.values?.[0]?.[0] || '').trim();
    if (sheetUid !== String(uid).trim()) {
      return res.status(409).json({ success: false, message: 'Sheet me row badal gayi hai, page refresh karke dobara try karo' });
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId: AdvancePettyCashExpensesId,
      range: `Bill_Entry!N${row}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[status]] },
    });

    return res.status(200).json({
      success: true,
      message: `${uid} → Status "${status}" update ho gaya`,
      data: { uid, rowNumber: row, status },
    });
  } catch (error) {
    console.error('Error updating petty cash status:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
});

module.exports = router;