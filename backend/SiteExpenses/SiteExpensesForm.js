
const express = require('express');
const { sheets, SiteExpeseSheetId, CompanyLabourSheetId, drive } = require('../config/googleSheet');
const { Readable } = require('stream');
const sharp = require('sharp');

const router = express.Router();

// ============================================================
// HELPER: Current timestamp (IST) — SHARED
// ============================================================
const getTimestamp = () => {
  const now = new Date();
  const options = {
    timeZone: 'Asia/Kolkata',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
  };
  const formatter = new Intl.DateTimeFormat('en-IN', options);
  const parts = formatter.formatToParts(now);
  const dd   = parts.find(p => p.type === 'day').value;
  const mm   = parts.find(p => p.type === 'month').value;
  const yyyy = parts.find(p => p.type === 'year').value;
  const hh   = parts.find(p => p.type === 'hour').value;
  const min  = parts.find(p => p.type === 'minute').value;
  const ss   = parts.find(p => p.type === 'second').value;
  return `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`;
};

// ============================================================
// HELPER: Next empty row (SiteExpeseSheetId) — Row 7 se check
// ============================================================
const getNextEmptyRow = async (sheetName) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SiteExpeseSheetId,
      range: `${sheetName}!A7:P10000`,
      majorDimension: 'ROWS',
    });
    const allRows = response.data.values || [];
    let lastUsedRow = 6;
    for (let i = 0; i < allRows.length; i++) {
      const row = allRows[i];
      if (row && row.some(cell => cell !== '' && cell !== null && cell !== undefined)) {
        lastUsedRow = 7 + i;
      }
    }
    return Math.max(lastUsedRow + 1, 7);
  } catch (err) {
    console.error(`Error finding next row in ${sheetName}:`, err);
    throw err;
  }
};

// ============================================================
// HELPER: Generate UID (SiteExpeseSheetId) — B7 se check
// ============================================================
const generateUID = async (sheetName, prefix = '') => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SiteExpeseSheetId,
      range: `${sheetName}!B7:B10000`,
    });
    const existing = (response.data.values || []).flat().filter(Boolean);
    let count = 1;
    let newUID;
    do {
      newUID = prefix + String(count).padStart(4, '0');
      count++;
    } while (existing.includes(newUID));
    return newUID;
  } catch (err) {
    console.error(`Error generating UID for ${sheetName}:`, err);
    throw err;
  }
};

// ============================================================
// ✅ NEW HELPER: Next empty row (A2 se check) — Labour Requirement
// ============================================================
const getNextEmptyRowFromA2 = async (sheetName) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SiteExpeseSheetId,
      range: `${sheetName}!A2:P10000`,
      majorDimension: 'ROWS',
    });
    const allRows = response.data.values || [];
    let lastUsedRow = 1;  // Row 1 = headers, data starts from row 2

    for (let i = 0; i < allRows.length; i++) {
      const row = allRows[i];
      if (row && row.some(cell => cell !== '' && cell !== null && cell !== undefined)) {
        lastUsedRow = 2 + i;
      }
    }
    return Math.max(lastUsedRow + 1, 2);
  } catch (err) {
    console.error(`Error finding next row in ${sheetName}:`, err);
    throw err;
  }
};

// ============================================================
// ✅ NEW HELPER: Generate UID (B2 se check) — Labour Requirement
// ============================================================
// ============================================================
// ✅ FIXED HELPER: Generate UID (B2 se check) — Highest + 1 logic
// Ab agar LAB0896 last hai, toh next LAB0897 dega
// ============================================================
const generateUIDFromB2 = async (sheetName, prefix = 'LAB') => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SiteExpeseSheetId,
      range: `${sheetName}!B2:B10000`,
    });
    
    const existing = (response.data.values || []).flat().filter(Boolean);
    
    // ✅ Highest number nikaalo existing UIDs se
    let maxNumber = 0;
    existing.forEach(uid => {
      const uidStr = String(uid).trim();
      if (uidStr.startsWith(prefix)) {
        const numPart = uidStr.replace(prefix, '');
        const num = parseInt(numPart, 10);
        if (!isNaN(num) && num > maxNumber) {
          maxNumber = num;
        }
      }
    });
    
    // ✅ Next UID = Highest + 1
    const nextNumber = maxNumber + 1;
    const newUID = prefix + String(nextNumber).padStart(4, '0');
    
    console.log(`[UID GEN] Existing UIDs: ${existing.length} | Max: ${prefix}${String(maxNumber).padStart(4, '0')} | Next: ${newUID}`);
    
    return newUID;
  } catch (err) {
    console.error(`Error generating UID for ${sheetName}:`, err);
    throw err;
  }
};

// ============================================================
// HELPER: Next empty row (CompanyLabourSheetId) — DIFFERENT NAME
// ============================================================
const getNextEmptyRowCompany = async (sheetName) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: CompanyLabourSheetId,
      range: `${sheetName}!A7:O10000`,
      majorDimension: 'ROWS',
    });
    const allRows = response.data.values || [];
    let lastUsedRow = 6;
    for (let i = 0; i < allRows.length; i++) {
      const row = allRows[i];
      if (row && row.some(cell => cell !== '' && cell !== null && cell !== undefined)) {
        lastUsedRow = 7 + i;
      }
    }
    return Math.max(lastUsedRow + 1, 7);
  } catch (err) {
    console.error(`Error finding next row in ${sheetName}:`, err);
    throw err;
  }
};

// ============================================================
// HELPER: Generate UID (CompanyLabourSheetId) — DIFFERENT NAME
// ============================================================
const generateUIDCompany = async (sheetName, prefix = 'LATT') => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: CompanyLabourSheetId,
      range: `${sheetName}!B7:B10000`,
    });
    const existing = (response.data.values || []).flat().filter(Boolean);
    let count = 1;
    let newUID;
    do {
      newUID = prefix + String(count).padStart(4, '0');
      count++;
    } while (existing.includes(newUID));
    return newUID;
  } catch (err) {
    console.error(`Error generating UID:`, err);
    throw err;
  }
};

// ============================================================
// HELPER: Generate next RCC Bill No
// ============================================================
const generateRccBillNo = async () => {
  try {
    const year = new Date().getFullYear();
    const prefix = `RCC/${year}/`;
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SiteExpeseSheetId,
      range: `Site_Exp_FMS!C7:C10000`,
    });
    const existing = (response.data.values || [])
      .flat()
      .filter(v => v && v.startsWith(prefix));
    let count = 1;
    let newBillNo;
    do {
      newBillNo = prefix + String(count).padStart(4, '0');
      count++;
    } while (existing.includes(newBillNo));
    return newBillNo;
  } catch (err) {
    console.error('Error generating RCC Bill No:', err);
    throw err;
  }
};

// ============================================================
// HELPER: Compress image using Sharp
// ============================================================
const compressImageBuffer = async (buffer, mimeType) => {
  try {
    if (mimeType === 'application/pdf') {
      console.log('[COMPRESS] PDF - skipping compression');
      return buffer;
    }
    const originalSize = buffer.length;
    const compressed = await sharp(buffer)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 70, progressive: true })
      .toBuffer();
    const compressedSize = compressed.length;
    console.log(
      `[COMPRESS] ${(originalSize / 1024).toFixed(0)}KB → ` +
      `${(compressedSize / 1024).toFixed(0)}KB ` +
      `(${Math.round((1 - compressedSize / originalSize) * 100)}% saved)`
    );
    return compressed;
  } catch (err) {
    console.warn('[COMPRESS] Sharp failed, using original:', err.message);
    return buffer;
  }
};

// ============================================================
// HELPER: Upload to Google Drive
// ============================================================
const uploadToGoogleDrive = async (base64Data, fileName, retries = 2) => {
  console.log(`[DRIVE UPLOAD START] ${fileName}`);
  if (!base64Data || typeof base64Data !== 'string') {
    console.warn(`[DRIVE FAILED] No base64 data`);
    return '';
  }

  let mimeType = 'image/jpeg';
  let base64Content = base64Data;

  const match = base64Data.match(/^data:([a-zA-Z0-9\/\-\+\.]+);base64,(.+)$/);
  if (match) {
    mimeType      = match[1];
    base64Content = match[2];
  } else {
    const sample  = base64Data.substring(0, 16);
    const decoded = Buffer.from(sample, 'base64').toString('hex');
    if (decoded.startsWith('ffd8ff'))        { mimeType = 'image/jpeg'; }
    else if (decoded.startsWith('89504e47')) { mimeType = 'image/png';  }
    else if (decoded.startsWith('25504446')) { mimeType = 'application/pdf'; }
    else if (decoded.startsWith('52494646')) { mimeType = 'image/webp'; }
  }

  const mimeToExt = {
    'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/png': 'png',
    'image/gif': 'gif', 'image/webp': 'webp', 'image/bmp': 'bmp',
    'image/heic': 'jpg', 'image/heif': 'jpg', 'application/pdf': 'pdf',
  };

  const fileExtension = mimeToExt[mimeType] || 'jpg';
  const baseName      = fileName.replace(/\.[^/.]+$/, '');

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      console.log(`[DRIVE] Attempt ${attempt}/${retries + 1}`);
      let buffer = Buffer.from(base64Content, 'base64');
      let finalMimeType = mimeType;
      let finalExt      = fileExtension;

      if (mimeType.startsWith('image/')) {
        buffer        = await compressImageBuffer(buffer, mimeType);
        finalMimeType = 'image/jpeg';
        finalExt      = 'jpg';
      }

      const finalFileName = `${baseName}.${finalExt}`;
      console.log(`[DRIVE] Uploading: ${finalFileName} (${(buffer.length / 1024).toFixed(0)}KB)`);

      const fileStream = new Readable();
      fileStream.push(buffer);
      fileStream.push(null);

      const res = await drive.files.create({
        resource: {
          name   : finalFileName,
          parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
        },
        media: { mimeType: finalMimeType, body: fileStream },
        fields          : 'id',
        supportsAllDrives: true,
        timeout         : 60000,
      });

      const fileId = res.data.id;
      await drive.permissions.create({
        fileId,
        requestBody     : { role: 'reader', type: 'anyone' },
        supportsAllDrives: true,
        timeout         : 15000,
      });

      const viewUrl = `https://drive.google.com/file/d/${fileId}/view?usp=drivesdk`;
      console.log(`[DRIVE SUCCESS] Attempt ${attempt}: ${viewUrl}`);
      return viewUrl;
    } catch (error) {
      console.error(`[DRIVE ERROR] Attempt ${attempt}:`, error.message);
      if (attempt <= retries) {
        const waitMs = attempt * 3000;
        console.log(`[DRIVE] Retrying in ${waitMs / 1000}s...`);
        await new Promise(r => setTimeout(r, waitMs));
      } else {
        console.error('[DRIVE] All attempts failed');
        return '';
      }
    }
  }
  return '';
};

// ============================================================
// POST /api/site-expense
// ============================================================
router.post('/site-expense', async (req, res) => {
  const contentLength = parseInt(req.headers['content-length'] || '0');
  console.log(`\n[REQUEST] Size: ${(contentLength / 1024 / 1024).toFixed(2)}MB`);

  try {
    const { items = [], ...common } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Items array bhejna zaroori hai' });
    }

    const validItems = items.filter(item => item.Exp_Head_1 && item.Amount_1);
    if (validItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Koi valid item nahi mila' });
    }

    const [Rcc_Bill_No_1, startRow] = await Promise.all([
      generateRccBillNo(),
      getNextEmptyRow('Site_Exp_FMS'),
    ]);

    const timestamp = getTimestamp();
    console.log(`[INFO] Bill: ${Rcc_Bill_No_1}, Start Row: ${startRow}`);

    const [billPhotoUrl, ...uids] = await Promise.all([
      common.Bill_Photo_1
        ? uploadToGoogleDrive(common.Bill_Photo_1, `Bill_${Rcc_Bill_No_1}_${Date.now()}.jpg`)
        : Promise.resolve(''),
      ...validItems.map(() => generateUID('Site_Exp_FMS', 'SITE')),
    ]);

    console.log(`[PHOTO URL] ${billPhotoUrl || 'No photo'}`);
    const saved = [];

    for (let i = 0; i < validItems.length; i++) {
      const { Exp_Head_1 = '', Details_of_Work_1 = '', Amount_1 = '' } = validItems[i];
      const currentRow = startRow + i;
      const UID = uids[i];

      const rowValues = [[
        timestamp, UID, Rcc_Bill_No_1,
        common.Vendor_Payee_Name_1     || '',
        common.Project_Name_1          || '',
        common.Project_Engineer_Name_1 || '',
        Exp_Head_1, Details_of_Work_1, Amount_1,
        common.Bill_No_1               || '',
        common.Bill_Date_1             || '',
        billPhotoUrl,
        common.Head_Type_1             || '',
        common.Contractor_Name_1       || '',
        common.Contractor_Firm_Name_1  || '',
        common.Remark_1                || '',
      ]];

      await sheets.spreadsheets.values.update({
        spreadsheetId: SiteExpeseSheetId,
        range: `Site_Exp_FMS!A${currentRow}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: rowValues },
      });

      saved.push({ uid: UID, row: currentRow });
      console.log(`[SAVED] Row ${currentRow} | UID: ${UID}`);
    }

    return res.status(200).json({
      success: true,
      message: `${validItems.length} item(s) save ho gaye`,
      billNo: Rcc_Bill_No_1,
      billPhotoUrl: billPhotoUrl || '',
      saved,
    });
  } catch (error) {
    console.error('❌ Site Expense Error:', error);
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

// ============================================================
// POST /api/labour-request → Labour_Requirement sheet
// ✅ FIXED - Row 2 se data check, UID B2 se check (LAB0001 se start)
// ============================================================
router.post('/labour-request', async (req, res) => {
  try {
    const {
      Project_Name_1, Project_Engineer_1, Work_Type_1,
      Work_Description_1, Labour_Category_1, Number_Of_Labour_1,
      Labour_Category_2, Number_Of_Labour_2, Total_Labour_1,
      Date_Of_Required_1, Head_Of_Contractor_Company_1,
      Name_Of_Contractor_1, Contractor_Firm_Name_1, Remark_1,
    } = req.body;

    if (!Project_Name_1 || !Work_Type_1) {
      return res.status(400).json({ success: false, message: 'Project Name aur Work Type required hain' });
    }

    // ✅ A2/B2 wale naye helpers use karo
    const [nextRow, UID] = await Promise.all([
      getNextEmptyRowFromA2('Labour_Requirement'),
      generateUIDFromB2('Labour_Requirement', 'LAB'),
    ]);

    console.log(`[LABOUR REQUEST] Next Row: ${nextRow} | UID: ${UID}`);

    const values = [[
      getTimestamp(), 
      UID,
      Project_Name_1              || '',
      Project_Engineer_1          || '',
      Work_Type_1                 || '',
      Work_Description_1          || '',
      Labour_Category_1           || '',
      Number_Of_Labour_1          || '',
      Labour_Category_2           || '',
      Number_Of_Labour_2          || '',
      Total_Labour_1              || '',
      Date_Of_Required_1          || '',
      Head_Of_Contractor_Company_1|| '',
      Name_Of_Contractor_1        || '',
      Contractor_Firm_Name_1      || '',
      Remark_1                    || '',
    ]];

    await sheets.spreadsheets.values.update({
      spreadsheetId   : SiteExpeseSheetId,
      range           : `Labour_Requirement!A${nextRow}`,
      valueInputOption: 'USER_ENTERED',
      requestBody     : { values },
    });

    console.log(`[LABOUR REQUEST SAVED] Row ${nextRow} | UID: ${UID}`);

    return res.status(200).json({
      success: true,
      message: 'Labour Request successfully save ho gaya!',
      uid: UID, row: nextRow,
    });
  } catch (error) {
    console.error('❌ Labour Request Error:', error);
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

// ============================================================
// POST /api/contractor-debit
// ============================================================
router.post('/contractor-debit', async (req, res) => {
  try {
    const {
      Project_Name_1, Project_Engineer_1, Contractor_Name_1,
      Contractor_Firm_Name_1, Work_Type_1, Work_Date_1,
      Work_Description_1, Particular_1, Qty_1, Rate_Wages_1, Amount_1,
    } = req.body;

    if (!Project_Name_1 || !Contractor_Name_1 || !Amount_1) {
      return res.status(400).json({
        success: false,
        message: 'Project Name, Contractor Name aur Amount required hain',
      });
    }

    const [nextRow, UID] = await Promise.all([
      getNextEmptyRow('Contractor_Debit_FMS'),
      generateUID('Contractor_Debit_FMS', 'DEBIT'),
    ]);

    const values = [[
      getTimestamp(), UID,
      Project_Name_1        || '',
      Project_Engineer_1    || '',
      Contractor_Name_1     || '',
      Contractor_Firm_Name_1|| '',
      Work_Type_1           || '',
      Work_Date_1           || '',
      Work_Description_1    || '',
      Particular_1          || '',
      Qty_1                 || '',
      Rate_Wages_1          || '',
      Amount_1              || '',
    ]];

    await sheets.spreadsheets.values.update({
      spreadsheetId   : SiteExpeseSheetId,
      range           : `Contractor_Debit_FMS!A${nextRow}`,
      valueInputOption: 'USER_ENTERED',
      requestBody     : { values },
    });

    return res.status(200).json({
      success: true,
      message: 'Contractor debit entry successfully save ho gayi!',
      uid: UID, row: nextRow,
    });
  } catch (error) {
    console.error('❌ Contractor Debit Error:', error);
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

// ============================================================
// GET /api/Company-labour-dropdowns
// ============================================================
router.get('/Company-labour-dropdowns', async (req, res) => {
  try {
    console.log('[DROPDOWN] Fetching Project_Data...');

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: CompanyLabourSheetId,
      range: 'Project_Data!A3:I10000',
      majorDimension: 'ROWS',
    });

    const rows = response.data.values || [];
    console.log(`[DROPDOWN] Total rows: ${rows.length}`);
    console.log('[DROPDOWN] First row sample:', rows[0]);

    const projectNames        = new Set();
    const projectEngineers    = new Set();
    const labourNames         = new Set();
    const workTypes           = new Set();
    const contractorNames     = new Set();
    const contractorFirmNames = new Set();

    const projectEngineerMap = {};
    const contractorFirmMap  = {};

    rows.forEach((row) => {
      const projectName    = (row[0] || '').trim();
      const engineer       = (row[1] || '').trim();
      const labourName     = (row[3] || '').trim();
      const workType       = (row[5] || '').trim();
      const contractorName = (row[7] || '').trim();
      const contractorFirm = (row[8] || '').trim();

      if (projectName)    projectNames.add(projectName);
      if (engineer)       projectEngineers.add(engineer);
      if (labourName)     labourNames.add(labourName);
      if (workType)       workTypes.add(workType);
      if (contractorName) contractorNames.add(contractorName);
      if (contractorFirm) contractorFirmNames.add(contractorFirm);

      if (projectName && engineer) {
        projectEngineerMap[projectName] = engineer;
      }
      if (contractorName && contractorFirm) {
        contractorFirmMap[contractorName] = contractorFirm;
        console.log(`[MAP] "${contractorName}" → "${contractorFirm}"`);
      }
    });

    console.log('[DROPDOWN] Contractor Firm Map:', contractorFirmMap);

    return res.status(200).json({
      success: true,
      data: {
        projectNames        : Array.from(projectNames),
        projectEngineers    : Array.from(projectEngineers),
        labourNames         : Array.from(labourNames),
        workTypes           : Array.from(workTypes),
        contractorNames     : Array.from(contractorNames),
        contractorFirmNames : Array.from(contractorFirmNames),
        projectEngineerMap,
        contractorFirmMap,
      },
    });
  } catch (error) {
    console.error('❌ Dropdown Fetch Error:', error);
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

// ============================================================
// POST /api/Company-labour — Labour Attendance save
// ============================================================
router.post('/Company-labour', async (req, res) => {
  try {
    const {
      Work_Date_1,
      Project_Name_1,
      Project_Engineer_1,
      Labour_Name_1,
      Day_Night_1,
      Day_Attendance_1,
      Work_Type_1,
      Work_Description_1,
      Head_Of_Contractor_Company_1,
      Name_Of_Contractor_1,
      Contractor_Firm_Name_1,
      Remark_1,
    } = req.body;

    if (!Project_Name_1 || !Labour_Name_1 || !Work_Date_1) {
      return res.status(400).json({
        success: false,
        message: 'Project Name, Labour Name aur Work Date required hain',
      });
    }

    const [nextRow, UID] = await Promise.all([
      getNextEmptyRowCompany('Labour_Attedace_FMS'),
      generateUIDCompany('Labour_Attedace_FMS', 'LATT'),
    ]);

    const values = [[
      getTimestamp(),                       // A
      UID,                                  // B
      Work_Date_1                  || '',   // C
      Project_Name_1               || '',   // D
      Project_Engineer_1           || '',   // E
      '',                                   // F - Blank
      Labour_Name_1                || '',   // G
      Day_Night_1                  || '',   // H
      Day_Attendance_1             || '',   // I
      Work_Type_1                  || '',   // J
      Work_Description_1           || '',   // K
      Head_Of_Contractor_Company_1 || '',   // L
      Name_Of_Contractor_1         || '',   // M
      Contractor_Firm_Name_1       || '',   // N
      Remark_1                     || '',   // O
    ]];

    await sheets.spreadsheets.values.update({
      spreadsheetId   : CompanyLabourSheetId,
      range           : `Labour_Attedace_FMS!A${nextRow}`,
      valueInputOption: 'USER_ENTERED',
      requestBody     : { values },
    });

    console.log(`[LABOUR ATT SAVED] Row ${nextRow} | UID: ${UID}`);

    return res.status(200).json({
      success: true,
      message: 'Labour Attendance successfully save ho gayi!',
      uid: UID, row: nextRow,
    });
  } catch (error) {
    console.error('❌ Labour Attendance Error:', error);
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

// ============================================================
// ✅ NEW - POST /api/office-labour-request
// Office access only — data goes to Office_Labour_FMS sheet
// ✅ FIXED - Row 2 se check karega (A2), UID B2 se check
// ============================================================

router.post('/office-labour-request', async (req, res) => {
  try {
    const {
      Project_Name_1, Project_Engineer_1, Work_Type_1,
      Work_Description_1, Labour_Category_1, Number_Of_Labour_1,
      Labour_Category_2, Number_Of_Labour_2, Total_Labour_1,
      Date_Of_Required_1, Head_Of_Contractor_Company_1,
      Name_Of_Contractor_1, Contractor_Firm_Name_1, Remark_1,
    } = req.body;

    if (!Project_Name_1 || !Work_Type_1) {
      return res.status(400).json({
        success: false,
        message: 'Project Name aur Work Type required hain'
      });
    }

    // ✅ Default helpers use karo (A7 se check)
    const [nextRow, UID] = await Promise.all([
      getNextEmptyRow('Labour_FMS'),
      generateUID('Labour_FMS', 'LAB'),
    ]);

    console.log(`[OFFICE LABOUR] Next Row: ${nextRow} | UID: ${UID}`);

    const values = [[
      getTimestamp(), UID,
      Project_Name_1               || '',
      Project_Engineer_1           || '',
      Work_Type_1                  || '',
      Work_Description_1           || '',
      Labour_Category_1            || '',
      Number_Of_Labour_1           || '',
      Labour_Category_2            || '',
      Number_Of_Labour_2           || '',
      Total_Labour_1               || '',
      Date_Of_Required_1           || '',
      Head_Of_Contractor_Company_1 || '',
      Name_Of_Contractor_1         || '',
      Contractor_Firm_Name_1       || '',
      Remark_1                     || '',
    ]];

    await sheets.spreadsheets.values.update({
      spreadsheetId   : SiteExpeseSheetId,
      range           : `Labour_FMS!A${nextRow}`,
      valueInputOption: 'USER_ENTERED',
      requestBody     : { values },
    });

    console.log(`[OFFICE LABOUR SAVED] Row ${nextRow} | UID: ${UID}`);

    return res.status(200).json({
      success: true,
      message: 'Office Labour Request successfully save ho gaya!',
      uid: UID,
      row: nextRow,
    });
  } catch (error) {
    console.error('❌ Office Labour Request Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
});






// ============================================================
// ✅ NEW - POST /api/submit-to-labour-fms
// Row copy karo Labour_Requirement → Labour_FMS
// + Original row me Q column = "Done" mark karo
// ============================================================
router.post('/submit-to-labour-fms', async (req, res) => {
  const { uid } = req.body;

  if (!uid) {
    return res.status(400).json({
      success: false,
      message: 'UID is required',
    });
  }

  try {
    // 1. Labour_Requirement se row fetch karo
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SiteExpeseSheetId,
      range: 'Labour_Requirement!A2:Q10000',
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(row =>
      row[1] && String(row[1]).trim() === String(uid).trim()
    );

    if (rowIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `UID not found: ${uid}`,
      });
    }

    const sourceRow      = rows[rowIndex];
    const sheetRowNumber = 2 + rowIndex;

    // Check already Done ya nahi
    const currentStatus = (sourceRow[16] || '').toString().trim();
    if (currentStatus === 'Done') {
      return res.status(400).json({
        success: false,
        message: `UID ${uid} already submitted (Status: Done)`,
      });
    }

    console.log(`[SUBMIT] UID ${uid} at row ${sheetRowNumber}`);

    // 2. Labour_FMS me next empty row nikaalo
    const nextRow = await getNextEmptyRow('Labour_FMS');
    console.log(`[SUBMIT] Labour_FMS next row: ${nextRow}`);

    // 3. Data prepare karo (A-P columns, Q skip)
    const values = [[
      sourceRow[0]  || '',   // A - Timestamp
      sourceRow[1]  || '',   // B - UID
      sourceRow[2]  || '',   // C - Project_Name
      sourceRow[3]  || '',   // D - Project_Engineer
      sourceRow[4]  || '',   // E - Work_Type
      sourceRow[5]  || '',   // F - Work_Description
      sourceRow[6]  || '',   // G - Labour_Category_1
      sourceRow[7]  || '',   // H - Number_Of_Labour_1
      sourceRow[8]  || '',   // I - Labour_Category_2
      sourceRow[9]  || '',   // J - Number_Of_Labour_2
      sourceRow[10] || '',   // K - Total_Labour
      sourceRow[11] || '',   // L - Date_Of_Required
      sourceRow[12] || '',   // M - Head_Of_Contractor
      sourceRow[13] || '',   // N - Name_Of_Contractor
      sourceRow[14] || '',   // O - Contractor_Firm_Name
      sourceRow[15] || '',   // P - Remark
    ]];

    // 4. Labour_FMS me save
    await sheets.spreadsheets.values.update({
      spreadsheetId   : SiteExpeseSheetId,
      range           : `Labour_FMS!A${nextRow}`,
      valueInputOption: 'USER_ENTERED',
      requestBody     : { values },
    });

    // 5. Labour_Requirement ke Q column me "Done" mark karo
    await sheets.spreadsheets.values.update({
      spreadsheetId   : SiteExpeseSheetId,
      range           : `Labour_Requirement!Q${sheetRowNumber}`,
      valueInputOption: 'USER_ENTERED',
      requestBody     : { values: [['Done']] },
    });

    console.log(`[SUBMIT SUCCESS] UID ${uid} → Labour_FMS row ${nextRow} + Status = Done`);

    return res.json({
      success        : true,
      message        : 'Successfully submitted to Labour_FMS!',
      uid            : uid,
      labourFmsRow   : nextRow,
      requirementRow : sheetRowNumber,
    });
  } catch (error) {
    console.error('❌ Submit to Labour_FMS Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Submit failed',
      error  : error.message,
    });
  }
});




///////////////. vinod step form new /////////////




// ============================================================
// ✅ GUARANTEED COLUMN W (INDEX 22) FILTER
// ============================================================
// router.get('/get-labour-requirements', async (req, res) => {
//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId: SiteExpeseSheetId,
//       range: 'Labour_Requirement!A4:AL10000',
//       majorDimension: 'ROWS',
//     });

//     const rawRows = response.data.values || [];
//     const pendingData = [];

//     rawRows.forEach((row, index) => {
//       const uid = (row[1] || '').toString().trim();
//       if (!uid) return; // UID empty hai to skip

//       // ✅ Column W is Index 22 (A=0, B=1, ... Q=16, ... W=22)
//       // Agar row ki length kam hai to row[22] undefined hoga (khaali)
//       const statusColW = (row[16] || '').toString().trim().toLowerCase();

//       // Agar Column W me 'done' likha hai (Done, done, DONE), toh SKIP karo
//       if (statusColW === 'done') {
//         return;
//       }

//       pendingData.push({
//         rowNumber:                    2 + index,
//         timestamp:                    row[0]  || '',
//         uid:                          uid,
//         Project_Name_1:               row[2]  || '',
//         Project_Engineer_1:           row[3]  || '',
//         Work_Type_1:                  row[4]  || '',
//         Work_Description_1:           row[5]  || '',
//         Labour_Category_1:            row[6]  || '',
//         Number_Of_Labour_1:           row[7]  || '',
//         Labour_Category_2:            row[8]  || '',
//         Number_Of_Labour_2:           row[9]  || '',
//         Total_Labour_1:               row[10] || '',
//         Date_Of_Required_1:           row[11] || '',
//         Head_Of_Contractor_Company_1: row[12] || '',
//         Name_Of_Contractor_1:         row[13] || '',
//         Contractor_Firm_Name_1:       row[14] || '',
//         Remark_1:                     row[15] || '',
//         Status:                       row[22] || '', // Column W Status
//       });
//     });

//     pendingData.reverse();

//     // ✅ Naya log message
//     console.log(`[COL-W FILTER SUCCESS] Total: ${rawRows.length} | Pending (Col W != Done): ${pendingData.length}`);

//     res.json({
//       success: true,
//       count: pendingData.length,
//       data: pendingData,
//     });
//   } catch (error) {
//     console.error('❌ Error:', error);
//     res.status(500).json({ success: false, message: 'Error', error: error.message });
//   }
// });




// ============================================================
// ✅ POST /api/update-labour-req-management
// Saves Modal Data to Col W-AK and sets Col Q to 'Done'
// ============================================================

// router.post('/update-labour-req-management', async (req, res) => {
//   try {
//     const {
//       uid, Status_3, Labouar_Contractor_Name_3, Labour_Category_1_3,
//       Number_Of_Labour_1_3, Labour_Rate_1_3, Labour_Category_2_3,
//       Number_Of_Labour_2_3, Labour_Rate_2_3, Total_Wages_3, Conveyanance_3,
//       Contractor_Commission, Total_Paid_Amount_3, Company_Head_Amount_3,
//       Contractor_Head_Amount_3, Remark_3
//     } = req.body;

//     if (!uid) return res.status(400).json({ success: false, message: 'UID is required' });

//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId: SiteExpeseSheetId,
//       range: 'Labour_Requirement!A2:B10000',
//     });

//     const rows = response.data.values || [];
//     const rowIndex = rows.findIndex(row => row[1] && String(row[1]).trim() === String(uid).trim());

//     if (rowIndex === -1) {
//       return res.status(404).json({ success: false, message: `UID not found: ${uid}` });
//     }

//     const sheetRowNumber = 2 + rowIndex;
//     const batchData = [];

//     const addIfValid = (colLetter, value) => {
//       if (value !== undefined && value !== null) {
//         batchData.push({ 
//           range: `Labour_Requirement!${colLetter}${sheetRowNumber}`, 
//           values: [[String(value).trim()]] 
//         });
//       }
//     };

//     // ✅ EXACT COLUMN MAPPING MATCHED WITH SHEET:
//     addIfValid('W', Status_3 || 'Done');        // W  = Status_3
//     // Column X (Time_Delay_3) is auto/skipped
//     addIfValid('Y', Labouar_Contractor_Name_3); // Y  = Labouar_Contractor_Name_3
//     addIfValid('Z', Labour_Category_1_3);       // Z  = Labour_Category_1_3
//     addIfValid('AA', Number_Of_Labour_1_3);     // AA = Number_Of_Labour_1_3
//     addIfValid('AB', Labour_Rate_1_3);          // AB = Labour_Rate_1_3
//     addIfValid('AC', Labour_Category_2_3);       // AC = Labour_Category_2_3
//     addIfValid('AD', Number_Of_Labour_2_3);     // AD = Number_Of_Labour_2_3
//     addIfValid('AE', Labour_Rate_2_3);          // AE = Labour_Rate_2_3
//     addIfValid('AF', Total_Wages_3);            // AF = Total_Wages_3
//     addIfValid('AG', Conveyanance_3);           // AG = Conveyanance_3
//     addIfValid('AH', Contractor_Commission);    // AH = Contractor_Commission
//     addIfValid('AI', Total_Paid_Amount_3);      // AI = Total_Paid_Amount_3
//     addIfValid('AJ', Company_Head_Amount_3);    // AJ = Company_Head_Amount_3
//     addIfValid('AK', Contractor_Head_Amount_3); // AK = Contractor_Head_Amount_3
//     addIfValid('AL', Remark_3);                  // AL = Remark_3

//     if (batchData.length > 0) {
//       await sheets.spreadsheets.values.batchUpdate({
//         spreadsheetId: SiteExpeseSheetId,
//         resource: { valueInputOption: 'USER_ENTERED', data: batchData },
//       });
//     }

//     res.json({
//       success: true,
//       message: 'Management details saved correctly & Status marked as Done!',
//       rowNumber: sheetRowNumber
//     });

//   } catch (error) {
//     console.error('❌ Update Labour Req Management Error:', error);
//     res.status(500).json({ success: false, message: 'Update failed', error: error.message });
//   }
// });





////////// try ///////////


// ============================================================
// ✅ GET /api/get-labour-requirements
// Saara data bhejega. Frontend apne aap Q ya W se filter karega!
// ============================================================
router.get('/get-labour-requirements', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SiteExpeseSheetId,
      range: 'Labour_Requirement!A4:AL10000',
      majorDimension: 'ROWS',
    });

    const rawRows = response.data.values || [];
    const pendingData = [];

    rawRows.forEach((row, index) => {
      const uid = (row[1] || '').toString().trim();
      if (!uid || uid.toUpperCase() === 'UID' || uid.toLowerCase() === 'timestamp') return;

      const padded = [...row];
      // Pad till index 22 (Column W)
      while (padded.length < 23) {
        padded.push('');
      }

      pendingData.push({
        rowNumber:                    4 + index,
        timestamp:                    padded[0]  || '',
        uid:                          uid,
        Project_Name_1:               padded[2]  || '',
        Project_Engineer_1:           padded[3]  || '',
        Work_Type_1:                  padded[4]  || '',
        Work_Description_1:           padded[5]  || '',
        Labour_Category_1:            padded[6]  || '',
        Number_Of_Labour_1:           padded[7]  || '',
        Labour_Category_2:            padded[8]  || '',
        Number_Of_Labour_2:           padded[9]  || '',
        Total_Labour_1:               padded[10] || '',
        Date_Of_Required_1:           padded[11] || '',
        Head_Of_Contractor_Company_1: padded[12] || '',
        Name_Of_Contractor_1:         padded[13] || '',
        Contractor_Firm_Name_1:       padded[14] || '',
        Remark_1:                     padded[15] || '',
        Status:                       padded[16] || '', // Column Q
        Status_3:                     padded[22] || '', // Column W
      });
    });

    pendingData.reverse(); // Latest on top

    console.log(`[GET LABOUR REQ] Total Data: ${pendingData.length} rows sent to frontend`);

    res.json({
      success: true,
      count: pendingData.length,
      data: pendingData,
    });
  } catch (error) {
    console.error('❌ Get Labour Requirements Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch requirements', error: error.message });
  }
});

// ============================================================
// ✅ POST /api/update-labour-req-management
// Modal ka data W-AL me save karega (Vinod form ke liye)
// ============================================================
router.post('/update-labour-req-management', async (req, res) => {
  try {
    const {
      uid, Status_3, Labouar_Contractor_Name_3, Labour_Category_1_3,
      Number_Of_Labour_1_3, Labour_Rate_1_3, Labour_Category_2_3,
      Number_Of_Labour_2_3, Labour_Rate_2_3, Total_Wages_3, Conveyanance_3,
      Contractor_Commission, Total_Paid_Amount_3, Company_Head_Amount_3,
      Contractor_Head_Amount_3, Remark_3
    } = req.body;

    if (!uid) return res.status(400).json({ success: false, message: 'UID is required' });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SiteExpeseSheetId,
      range: 'Labour_Requirement!A4:B10000',
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(row => row[1] && String(row[1]).trim() === String(uid).trim());

    if (rowIndex === -1) {
      return res.status(404).json({ success: false, message: `UID not found: ${uid}` });
    }

    const sheetRowNumber = 4 + rowIndex; // Range starts at A4
    const batchData = [];

    const addIfValid = (colLetter, value) => {
      if (value !== undefined && value !== null) {
        batchData.push({ 
          range: `Labour_Requirement!${colLetter}${sheetRowNumber}`, 
          values: [[String(value).trim()]] 
        });
      }
    };

    // W - AL columns update (Vinod)
    addIfValid('W', Status_3 || 'Done');        // W
    addIfValid('Y', Labouar_Contractor_Name_3); // Y
    addIfValid('Z', Labour_Category_1_3);       // Z
    addIfValid('AA', Number_Of_Labour_1_3);     // AA
    addIfValid('AB', Labour_Rate_1_3);          // AB
    addIfValid('AC', Labour_Category_2_3);      // AC
    addIfValid('AD', Number_Of_Labour_2_3);     // AD
    addIfValid('AE', Labour_Rate_2_3);          // AE
    addIfValid('AF', Total_Wages_3);            // AF
    addIfValid('AG', Conveyanance_3);           // AG
    addIfValid('AH', Contractor_Commission);    // AH
    addIfValid('AI', Total_Paid_Amount_3);      // AI
    addIfValid('AJ', Company_Head_Amount_3);    // AJ
    addIfValid('AK', Contractor_Head_Amount_3); // AK
    addIfValid('AL', Remark_3);                 // AL

    if (batchData.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SiteExpeseSheetId,
        resource: { valueInputOption: 'USER_ENTERED', data: batchData },
      });
    }

    res.json({
      success: true,
      message: 'Management details saved correctly & Status marked as Done!',
      rowNumber: sheetRowNumber
    });

  } catch (error) {
    console.error('❌ Update Labour Req Management Error:', error);
    res.status(500).json({ success: false, message: 'Update failed', error: error.message });
  }
});

module.exports = router;