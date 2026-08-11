

// const express = require('express');
// const { sheets, SiteExpeseSheetId,CompanyLabourSheetId ,drive } = require('../config/googleSheet');
// const { Readable } = require('stream');
// const sharp = require('sharp'); // npm install sharp

// const router = express.Router();

// // ============================================================
// // HELPER: Current timestamp
// // ============================================================
// const getTimestamp = () => {
//   const now = new Date();
//   const options = {
//     timeZone: 'Asia/Kolkata',
//     year: 'numeric', month: '2-digit', day: '2-digit',
//     hour: '2-digit', minute: '2-digit', second: '2-digit',
//     hour12: false
//   };
//   const formatter = new Intl.DateTimeFormat('en-IN', options);
//   const parts = formatter.formatToParts(now);
//   const dd   = parts.find(p => p.type === 'day').value;
//   const mm   = parts.find(p => p.type === 'month').value;
//   const yyyy = parts.find(p => p.type === 'year').value;
//   const hh   = parts.find(p => p.type === 'hour').value;
//   const min  = parts.find(p => p.type === 'minute').value;
//   const ss   = parts.find(p => p.type === 'second').value;
//   return `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`;
// };

// // ============================================================
// // HELPER: Find next empty row starting from row 7
// // ============================================================
// const getNextEmptyRow = async (sheetName) => {
//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId: SiteExpeseSheetId,
//       range: `${sheetName}!A7:P10000`,
//       majorDimension: 'ROWS',
//     });
//     const allRows = response.data.values || [];
//     let lastUsedRow = 6;
//     for (let i = 0; i < allRows.length; i++) {
//       const row = allRows[i];
//       if (row && row.some(cell => cell !== '' && cell !== null && cell !== undefined)) {
//         lastUsedRow = 7 + i;
//       }
//     }
//     return Math.max(lastUsedRow + 1, 7);
//   } catch (err) {
//     console.error(`Error finding next row in ${sheetName}:`, err);
//     throw err;
//   }
// };

// // ============================================================
// // HELPER: Generate next unique UID
// // ============================================================
// const generateUID = async (sheetName, prefix = '') => {
//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId: SiteExpeseSheetId,
//       range: `${sheetName}!B7:B10000`,
//     });
//     const existing = (response.data.values || []).flat().filter(Boolean);
//     let count = 1;
//     let newUID;
//     do {
//       newUID = prefix + String(count).padStart(4, '0');
//       count++;
//     } while (existing.includes(newUID));
//     return newUID;
//   } catch (err) {
//     console.error(`Error generating UID for ${sheetName}:`, err);
//     throw err;
//   }
// };

// // ============================================================
// // HELPER: Generate next RCC Bill No
// // ============================================================
// const generateRccBillNo = async () => {
//   try {
//     const year = new Date().getFullYear();
//     const prefix = `RCC/${year}/`;
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId: SiteExpeseSheetId,
//       range: `Site_Exp_FMS!C7:C10000`,
//     });
//     const existing = (response.data.values || [])
//       .flat()
//       .filter(v => v && v.startsWith(prefix));
//     let count = 1;
//     let newBillNo;
//     do {
//       newBillNo = prefix + String(count).padStart(4, '0');
//       count++;
//     } while (existing.includes(newBillNo));
//     return newBillNo;
//   } catch (err) {
//     console.error('Error generating RCC Bill No:', err);
//     throw err;
//   }
// };

// // ============================================================
// // HELPER: Compress image using Sharp (server side)
// // ============================================================
// const compressImageBuffer = async (buffer, mimeType) => {
//   try {
//     // PDF compress nahi karte
//     if (mimeType === 'application/pdf') {
//       console.log('[COMPRESS] PDF - skipping compression');
//       return buffer;
//     }

//     const originalSize = buffer.length;

//     // Sharp se compress karo - max 1200px, quality 70
//     const compressed = await sharp(buffer)
//       .resize(1200, 1200, {
//         fit: 'inside',        // Aspect ratio maintain karo
//         withoutEnlargement: true, // Choti image ko bada mat karo
//       })
//       .jpeg({ quality: 70, progressive: true })
//       .toBuffer();

//     const compressedSize = compressed.length;
//     console.log(
//       `[COMPRESS] ${(originalSize / 1024).toFixed(0)}KB → ` +
//       `${(compressedSize / 1024).toFixed(0)}KB ` +
//       `(${Math.round((1 - compressedSize / originalSize) * 100)}% saved)`
//     );

//     return compressed;
//   } catch (err) {
//     console.warn('[COMPRESS] Sharp failed, using original:', err.message);
//     return buffer; // Fail hone par original use karo
//   }
// };

// // ============================================================
// // HELPER: Upload to Google Drive with retry + compression
// // ============================================================
// const uploadToGoogleDrive = async (base64Data, fileName, retries = 2) => {
//   console.log(`[DRIVE UPLOAD START] ${fileName}`);

//   if (!base64Data || typeof base64Data !== 'string') {
//     console.warn(`[DRIVE FAILED] No base64 data`);
//     return '';
//   }

//   // MimeType detect karo
//   let mimeType = 'image/jpeg';
//   let base64Content = base64Data;

//   const match = base64Data.match(/^data:([a-zA-Z0-9\/\-\+\.]+);base64,(.+)$/);
//   if (match) {
//     mimeType      = match[1];
//     base64Content = match[2];
//   } else {
//     // Plain base64 - signature se detect karo
//     const sample  = base64Data.substring(0, 16);
//     const decoded = Buffer.from(sample, 'base64').toString('hex');
//     if (decoded.startsWith('ffd8ff'))    { mimeType = 'image/jpeg'; }
//     else if (decoded.startsWith('89504e47')) { mimeType = 'image/png';  }
//     else if (decoded.startsWith('25504446')) { mimeType = 'application/pdf'; }
//     else if (decoded.startsWith('52494646')) { mimeType = 'image/webp'; }
//   }

//   // Extension map
//   const mimeToExt = {
//     'image/jpeg'       : 'jpg',
//     'image/jpg'        : 'jpg',
//     'image/png'        : 'png',
//     'image/gif'        : 'gif',
//     'image/webp'       : 'webp',
//     'image/bmp'        : 'bmp',
//     'image/heic'       : 'jpg', // HEIC ko JPEG me convert
//     'image/heif'       : 'jpg',
//     'application/pdf'  : 'pdf',
//   };

//   const fileExtension = mimeToExt[mimeType] || 'jpg';
//   const baseName      = fileName.replace(/\.[^/.]+$/, '');

//   // Retry loop
//   for (let attempt = 1; attempt <= retries + 1; attempt++) {
//     try {
//       console.log(`[DRIVE] Attempt ${attempt}/${retries + 1}`);

//       // Original buffer
//       let buffer = Buffer.from(base64Content, 'base64');

//       // ✅ Compress karo (image only)
//       let finalMimeType = mimeType;
//       let finalExt      = fileExtension;

//       if (mimeType.startsWith('image/')) {
//         buffer        = await compressImageBuffer(buffer, mimeType);
//         finalMimeType = 'image/jpeg'; // Sharp hamesha JPEG output deta hai
//         finalExt      = 'jpg';
//       }

//       const finalFileName = `${baseName}.${finalExt}`;
//       console.log(`[DRIVE] Uploading: ${finalFileName} (${(buffer.length / 1024).toFixed(0)}KB)`);

//       // Stream banao
//       const fileStream = new Readable();
//       fileStream.push(buffer);
//       fileStream.push(null);

//       // Drive pe upload
//       const res = await drive.files.create({
//         resource: {
//           name   : finalFileName,
//           parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
//         },
//         media: {
//           mimeType: finalMimeType,
//           body    : fileStream,
//         },
//         fields          : 'id',
//         supportsAllDrives: true,
//         timeout         : 60000, // 60 second timeout
//       });

//       const fileId = res.data.id;

//       // Public access do
//       await drive.permissions.create({
//         fileId,
//         requestBody     : { role: 'reader', type: 'anyone' },
//         supportsAllDrives: true,
//         timeout         : 15000,
//       });

//       const viewUrl = `https://drive.google.com/file/d/${fileId}/view?usp=drivesdk`;
//       console.log(`[DRIVE SUCCESS] Attempt ${attempt}: ${viewUrl}`);
//       return viewUrl;

//     } catch (error) {
//       console.error(`[DRIVE ERROR] Attempt ${attempt}:`, error.message);

//       if (attempt <= retries) {
//         const waitMs = attempt * 3000; // 3s, 6s
//         console.log(`[DRIVE] Retrying in ${waitMs / 1000}s...`);
//         await new Promise(r => setTimeout(r, waitMs));
//       } else {
//         console.error('[DRIVE] All attempts failed');
//         return ''; // Empty return - form submit hone do
//       }
//     }
//   }

//   return '';
// };






// // ============================================================
// // POST /api/site-expense  — COLUMN ORDER FIXED (original jaisa)
// // ============================================================
// router.post('/site-expense', async (req, res) => {
//   const contentLength = parseInt(req.headers['content-length'] || '0');
//   console.log(`\n[REQUEST] Size: ${(contentLength / 1024 / 1024).toFixed(2)}MB`);

//   try {
//     const { items = [], ...common } = req.body;

//     if (!Array.isArray(items) || items.length === 0) {
//       return res.status(400).json({ success: false, message: 'Items array bhejna zaroori hai' });
//     }

//     const validItems = items.filter(item => item.Exp_Head_1 && item.Amount_1);
//     if (validItems.length === 0) {
//       return res.status(400).json({ success: false, message: 'Koi valid item nahi mila' });
//     }

//     // Parallel calls — fast
//     const [Rcc_Bill_No_1, startRow] = await Promise.all([
//       generateRccBillNo(),
//       getNextEmptyRow('Site_Exp_FMS'),
//     ]);

//     const timestamp = getTimestamp();
//     console.log(`[INFO] Bill: ${Rcc_Bill_No_1}, Start Row: ${startRow}`);

//     // Photo upload + UIDs parallel
//     const [billPhotoUrl, ...uids] = await Promise.all([
//       common.Bill_Photo_1
//         ? uploadToGoogleDrive(
//             common.Bill_Photo_1,
//             `Bill_${Rcc_Bill_No_1}_${Date.now()}.jpg`
//           )
//         : Promise.resolve(''),
//       ...validItems.map(() => generateUID('Site_Exp_FMS', 'SITE')),
//     ]);

//     console.log(`[PHOTO URL] ${billPhotoUrl || 'No photo'}`);

//     const saved = [];

//     for (let i = 0; i < validItems.length; i++) {
//       const { Exp_Head_1 = '', Details_of_Work_1 = '', Amount_1 = '' } = validItems[i];
//       const currentRow = startRow + i;
//       const UID = uids[i];

//       // ✅ ORIGINAL COLUMN ORDER — exactly jaisa pehle tha
//       const rowValues = [[
//         timestamp,                                  // A - Timestamp
//         UID,                                        // B - UID
//         Rcc_Bill_No_1,                              // C - Rcc_Bill_No._1
//         common.Vendor_Payee_Name_1     || '',       // D - Vendor/Payee_Name_1
//         common.Project_Name_1          || '',       // E - Project_Name_1
//         common.Project_Engineer_Name_1 || '',       // F - Project_Engineer_Name_1
//         Exp_Head_1,                                 // G - Exp_Head_1
//         Details_of_Work_1,                          // H - Details_of_Work_1
//         Amount_1,                                   // I - Amount_1
//         common.Bill_No_1               || '',       // J - Bill_No._1
//         common.Bill_Date_1             || '',       // K - Bill_Date_1
//         billPhotoUrl,                               // L - Bill_Photo_1 (Drive URL)
//         common.Head_Type_1             || '',       // M - Head_Type_1
//         common.Contractor_Name_1       || '',       // N - Contractor_Name_1
//         common.Contractor_Firm_Name_1  || '',       // O - Contractor_Firm_Name_1
//         common.Remark_1                || '',       // P - Remark_1
//       ]];

//       await sheets.spreadsheets.values.update({
//         spreadsheetId: SiteExpeseSheetId,
//         range: `Site_Exp_FMS!A${currentRow}`,
//         valueInputOption: 'USER_ENTERED',
//         requestBody: { values: rowValues },
//       });

//       saved.push({ uid: UID, row: currentRow });
//       console.log(`[SAVED] Row ${currentRow} | UID: ${UID}`);
//     }

//     return res.status(200).json({
//       success: true,
//       message: `${validItems.length} item(s) save ho gaye`,
//       billNo: Rcc_Bill_No_1,
//       billPhotoUrl: billPhotoUrl || '',
//       saved,
//     });

//   } catch (error) {
//     console.error('❌ Site Expense Error:', error);
//     return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
//   }
// });



// // ============================================================
// // POST /api/labour-request
// // ============================================================
// router.post('/labour-request', async (req, res) => {
//   try {
//     const {
//       Project_Name_1, Project_Engineer_1, Work_Type_1,
//       Work_Description_1, Labour_Category_1, Number_Of_Labour_1,
//       Labour_Category_2, Number_Of_Labour_2, Total_Labour_1,
//       Date_Of_Required_1, Head_Of_Contractor_Company_1,
//       Name_Of_Contractor_1, Contractor_Firm_Name_1, Remark_1,
//     } = req.body;

//     if (!Project_Name_1 || !Work_Type_1) {
//       return res.status(400).json({ success: false, message: 'Project Name aur Work Type required hain' });
//     }

//     const [nextRow, UID] = await Promise.all([
//       getNextEmptyRow('Labour_FMS'),
//       generateUID('Labour_FMS', 'LAB'),
//     ]);

//     const values = [[
//       getTimestamp(),
//       UID,
//       Project_Name_1              || '',
//       Project_Engineer_1          || '',
//       Work_Type_1                 || '',
//       Work_Description_1          || '',
//       Labour_Category_1           || '',
//       Number_Of_Labour_1          || '',
//       Labour_Category_2           || '',
//       Number_Of_Labour_2          || '',
//       Total_Labour_1              || '',
//       Date_Of_Required_1          || '',
//       Head_Of_Contractor_Company_1|| '',
//       Name_Of_Contractor_1        || '',
//       Contractor_Firm_Name_1      || '',
//       Remark_1                    || '',
//     ]];

//     await sheets.spreadsheets.values.update({
//       spreadsheetId   : SiteExpeseSheetId,
//       range           : `Labour_FMS!A${nextRow}`,
//       valueInputOption: 'USER_ENTERED',
//       requestBody     : { values },
//     });

//     return res.status(200).json({
//       success: true,
//       message: 'Labour Request successfully save ho gaya!',
//       uid    : UID,
//       row    : nextRow,
//     });
//   } catch (error) {
//     console.error('❌ Labour Request Error:', error);
//     return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
//   }
// });

// // ============================================================
// // POST /api/contractor-debit
// // ============================================================
// router.post('/contractor-debit', async (req, res) => {
//   try {
//     const {
//       Project_Name_1, Project_Engineer_1, Contractor_Name_1,
//       Contractor_Firm_Name_1, Work_Type_1, Work_Date_1,
//       Work_Description_1, Particular_1, Qty_1, Rate_Wages_1, Amount_1,
//     } = req.body;

//     if (!Project_Name_1 || !Contractor_Name_1 || !Amount_1) {
//       return res.status(400).json({
//         success: false,
//         message: 'Project Name, Contractor Name aur Amount required hain',
//       });
//     }

//     const [nextRow, UID] = await Promise.all([
//       getNextEmptyRow('Contractor_Debit_FMS'),
//       generateUID('Contractor_Debit_FMS', 'DEBIT'),
//     ]);

//     const values = [[
//       getTimestamp(),
//       UID,
//       Project_Name_1        || '',
//       Project_Engineer_1    || '',
//       Contractor_Name_1     || '',
//       Contractor_Firm_Name_1|| '',
//       Work_Type_1           || '',
//       Work_Date_1           || '',
//       Work_Description_1    || '',
//       Particular_1          || '',
//       Qty_1                 || '',
//       Rate_Wages_1          || '',
//       Amount_1              || '',
//     ]];

//     await sheets.spreadsheets.values.update({
//       spreadsheetId   : SiteExpeseSheetId,
//       range           : `Contractor_Debit_FMS!A${nextRow}`,
//       valueInputOption: 'USER_ENTERED',
//       requestBody     : { values },
//     });

//     return res.status(200).json({
//       success: true,
//       message: 'Contractor debit entry successfully save ho gayi!',
//       uid    : UID,
//       row    : nextRow,
//     });
//   } catch (error) {
//     console.error('❌ Contractor Debit Error:', error);
//     return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
//   }
// });











// // ============================================================
// // HELPER: Current timestamp (IST)
// // ============================================================
// const getTimestamp = () => {
//   const now = new Date();
//   const options = {
//     timeZone: 'Asia/Kolkata',
//     year: 'numeric', month: '2-digit', day: '2-digit',
//     hour: '2-digit', minute: '2-digit', second: '2-digit',
//     hour12: false
//   };
//   const formatter = new Intl.DateTimeFormat('en-IN', options);
//   const parts = formatter.formatToParts(now);
//   const dd   = parts.find(p => p.type === 'day').value;
//   const mm   = parts.find(p => p.type === 'month').value;
//   const yyyy = parts.find(p => p.type === 'year').value;
//   const hh   = parts.find(p => p.type === 'hour').value;
//   const min  = parts.find(p => p.type === 'minute').value;
//   const ss   = parts.find(p => p.type === 'second').value;
//   return `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`;
// };

// // ============================================================
// // HELPER: Next empty row
// // ============================================================
// const getNextEmptyRow = async (sheetName) => {
//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId: CompanyLabourSheetId,
//       range: `${sheetName}!A7:O10000`,
//       majorDimension: 'ROWS',
//     });
//     const allRows = response.data.values || [];
//     let lastUsedRow = 6;
//     for (let i = 0; i < allRows.length; i++) {
//       const row = allRows[i];
//       if (row && row.some(cell => cell !== '' && cell !== null && cell !== undefined)) {
//         lastUsedRow = 7 + i;
//       }
//     }
//     return Math.max(lastUsedRow + 1, 7);
//   } catch (err) {
//     console.error(`Error finding next row in ${sheetName}:`, err);
//     throw err;
//   }
// };

// // ============================================================
// // HELPER: Generate UID
// // ============================================================
// const generateUID = async (sheetName, prefix = 'LATT') => {
//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId: CompanyLabourSheetId,
//       range: `${sheetName}!B7:B10000`,
//     });
//     const existing = (response.data.values || []).flat().filter(Boolean);
//     let count = 1;
//     let newUID;
//     do {
//       newUID = prefix + String(count).padStart(4, '0');
//       count++;
//     } while (existing.includes(newUID));
//     return newUID;
//   } catch (err) {
//     console.error(`Error generating UID:`, err);
//     throw err;
//   }
// };

// // ============================================================
// // GET /dropdowns — Project_Data sheet se dropdown data
// // ============================================================
// router.get('/Company-labour-dropdowns', async (req, res) => {
//   try {
//     console.log('[DROPDOWN] Fetching Project_Data...');

//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId: CompanyLabourSheetId,
//       range: 'Project_Data!A3:G10000',
//       majorDimension: 'ROWS',
//     });

//     const rows = response.data.values || [];

//     const projectNames        = new Set();
//     const projectEngineers    = new Set();
//     const labourNames         = new Set();
//     const workTypes           = new Set();
//     const contractorNames     = new Set();
//     const contractorFirmNames = new Set();

//     const projectEngineerMap = {};
//     const contractorFirmMap  = {};

//     rows.forEach(row => {
//       const projectName    = (row[0] || '').trim();
//       const engineer       = (row[1] || '').trim();
//       const labourName     = (row[3] || '').trim();
//       const workType       = (row[4] || '').trim();
//       const contractorName = (row[5] || '').trim();
//       const contractorFirm = (row[6] || '').trim();

//       if (projectName)    projectNames.add(projectName);
//       if (engineer)       projectEngineers.add(engineer);
//       if (labourName)     labourNames.add(labourName);
//       if (workType)       workTypes.add(workType);
//       if (contractorName) contractorNames.add(contractorName);
//       if (contractorFirm) contractorFirmNames.add(contractorFirm);

//       if (projectName && engineer)    projectEngineerMap[projectName]   = engineer;
//       if (contractorName && contractorFirm) contractorFirmMap[contractorName] = contractorFirm;
//     });

//     return res.status(200).json({
//       success: true,
//       data: {
//         projectNames        : Array.from(projectNames),
//         projectEngineers    : Array.from(projectEngineers),
//         labourNames         : Array.from(labourNames),
//         workTypes           : Array.from(workTypes),
//         contractorNames     : Array.from(contractorNames),
//         contractorFirmNames : Array.from(contractorFirmNames),
//         projectEngineerMap,
//         contractorFirmMap,
//       },
//     });
//   } catch (error) {
//     console.error('❌ Dropdown Fetch Error:', error);
//     return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
//   }
// });

// // ============================================================
// // POST / — Labour Attendance save karo
// // ============================================================
// router.post('/Company-labour', async (req, res) => {
//   try {
//     const {
//       Work_Date_1,
//       Project_Name_1,
//       Project_Engineer_1,
//       Labour_Name_1,
//       Day_Night_1,
//       Day_Attendance_1,
//       Work_Type_1,
//       Work_Description_1,
//       Head_Of_Contractor_Company_1,
//       Name_Of_Contractor_1,
//       Contractor_Firm_Name_1,
//       Remark_1,
//     } = req.body;

//     if (!Project_Name_1 || !Labour_Name_1 || !Work_Date_1) {
//       return res.status(400).json({
//         success: false,
//         message: 'Project Name, Labour Name aur Work Date required hain',
//       });
//     }

//     const [nextRow, UID] = await Promise.all([
//       getNextEmptyRow('Labour_Attedace_FMS'),
//       generateUID('Labour_Attedace_FMS', 'LATT'),
//     ]);

//     // Column Order:
//     // A-Timestamp | B-UID | C-Work_Date | D-Project | E-Engineer
//     // F-Blank | G-Labour | H-Day/Night | I-Attendance | J-WorkType
//     // K-WorkDesc | L-HeadContractor | M-ContractorName | N-FirmName | O-Remark
//     const values = [[
//       getTimestamp(),                       // A
//       UID,                                  // B
//       Work_Date_1                  || '',   // C
//       Project_Name_1               || '',   // D
//       Project_Engineer_1           || '',   // E
//       '',                                   // F - Blank
//       Labour_Name_1                || '',   // G
//       Day_Night_1                  || '',   // H
//       Day_Attendance_1             || '',   // I
//       Work_Type_1                  || '',   // J
//       Work_Description_1           || '',   // K
//       Head_Of_Contractor_Company_1 || '',   // L
//       Name_Of_Contractor_1         || '',   // M
//       Contractor_Firm_Name_1       || '',   // N
//       Remark_1                     || '',   // O
//     ]];

//     await sheets.spreadsheets.values.update({
//       spreadsheetId   : CompanyLabourSheetId,
//       range           : `Labour_Attedace_FMS!A${nextRow}`,
//       valueInputOption: 'USER_ENTERED',
//       requestBody     : { values },
//     });

//     console.log(`[LABOUR ATT SAVED] Row ${nextRow} | UID: ${UID}`);

//     return res.status(200).json({
//       success: true,
//       message: 'Labour Attendance successfully save ho gayi!',
//       uid    : UID,
//       row    : nextRow,
//     });
//   } catch (error) {
//     console.error('❌ Labour Attendance Error:', error);
//     return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
//   }
// });

// module.exports = router;






//////////////////////////////////////





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
// HELPER: Next empty row (SiteExpeseSheetId)
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
// HELPER: Generate UID (SiteExpeseSheetId)
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
// POST /api/labour-request
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

    const [nextRow, UID] = await Promise.all([
      getNextEmptyRow('Labour_FMS'),
      generateUID('Labour_FMS', 'LAB'),
    ]);

    const values = [[
      getTimestamp(), UID,
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
      range           : `Labour_FMS!A${nextRow}`,
      valueInputOption: 'USER_ENTERED',
      requestBody     : { values },
    });

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
      range: 'Project_Data!A3:I10000',   // ✅ I tak fetch karo
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
      // ✅ SHEET COLUMNS (0-based index):
      // A(0) Project     | B(1) Engineer | C(2) blank
      // D(3) Labour Name | E(4) blank    | F(5) Work Type
      // G(6) blank       | H(7) Contractor | I(8) Firm Name
      const projectName    = (row[0] || '').trim();
      const engineer       = (row[1] || '').trim();
      const labourName     = (row[3] || '').trim();
      const workType       = (row[5] || '').trim();
      const contractorName = (row[7] || '').trim();   // ✅ H (index 7)
      const contractorFirm = (row[8] || '').trim();   // ✅ I (index 8)

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

    // Column Order:
    // A-Timestamp | B-UID | C-Work_Date | D-Project | E-Engineer
    // F-Blank | G-Labour | H-Day/Night | I-Attendance | J-WorkType
    // K-WorkDesc | L-HeadContractor | M-ContractorName | N-FirmName | O-Remark
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

module.exports = router;