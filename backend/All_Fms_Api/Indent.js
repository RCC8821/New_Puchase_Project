// const express = require('express');
// const { sheets, spreadsheetId , drive} = require('../config/googleSheet');
// const { Readable } = require("stream");
// const router = express.Router();
// require('dotenv').config();

// // Load jsPDF and jspdf-autotable
// const { jsPDF } = require('jspdf');

// // Apply jspdf-autotable using the same robust method as indentRoutes.js
// try {
//   require('jspdf-autotable');
//   console.log('jspdf-autotable loaded successfully (Method 1)');
// } catch (err) {
//   console.log('Method 1 failed, trying method 2:', err.message);
//   try {
//     const autoTable = require('jspdf-autotable').default;
//     autoTable(jsPDF);
//     console.log('jspdf-autotable loaded successfully (Method 2)');
//   } catch (err2) {
//     console.log('Method 2 failed, trying method 3:', err2.message);
//     try {
//       const jspdfAutoTable = require('jspdf-autotable');
//       jspdfAutoTable.default(jsPDF);
//       console.log('jspdf-autotable loaded successfully (Method 3)');
//     } catch (err3) {
//       console.error('Failed to load jspdf-autotable:', err3.message, err3.stack);
//       throw new Error('jspdf-autotable dependency could not be loaded');
//     }
//   }
// }

// // Test jsPDF and autoTable to ensure functionality
// try {
//   const doc = new jsPDF();
//   if (!doc.autoTable) {
//     throw new Error('jspdf-autotable plugin not applied');
//   }
//   doc.autoTable({ head: [['Test']], body: [['Sample']] });
//   console.log('jsPDF and autoTable test successful');
// } catch (err) {
//   console.error('jsPDF autoTable test failed:', err.message, err.stack);
//   throw new Error('jsPDF instance initialization with autoTable failed');
// }


// // GET: Fetch get-indent-data
// // ─── GET INDENT DATA ─────────────────────────────────────
// router.get("/get-indent-data", async (req, res) => {
//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Purchase_FMS!A8:AM',
//     });

//     const rows = response.data.values || [];

//     if (!rows.length) {
//       return res.status(404).json({ error: 'No data found' });
//     }

//     // Column mapping (0-based):
//     // A=0   B=1   C=2   D=3   E=4   F=5   G=6   H=7   I=8
//     // J=9   K=10  L=11  M=12  N=13  O=14  P=15  Q=16
//     // R=17  S=18  T=19  U=20  V=21  W=22
//     // X=23  Y=24  Z=25  AA=26 AB=27
//     // AC=28 AD=29 AE=30 AF=31 AG=32 AH=33
//     // AI=34 AJ=35 AK=36 AL=37

//     const formData = rows
//       .map((row, index) => {
//         if (!row || row.every(cell => !cell || cell.trim() === '')) return null;

//         const planned3 = (row[32] || '').trim(); // V: PLANNED 3
//         const actual3  = (row[33] || '').trim(); // W: ACTUAL 3

//         // Filter: PLANNED_3 filled + ACTUAL_3 empty
//         if (!planned3 || actual3) return null;

//         // Must be approved in step 2 (X column has STATUS)
//         const status2 = (row[23] || '').trim(); // X: STATUS from step 2
//         if (!status2 || status2 !== 'APPROVED') return null;

//         // Skip if already processed in step 3 (AI has STATUS_3)
//         const status3 = (row[34] || '').trim(); // AI: STATUS 3
//         if (status3) return null;

//         return {
//           UID:              (row[1]  || '').trim(), // B
//           Req_No:           (row[2]  || '').trim(), // C
//           Project_Name:     (row[3]  || '').trim(), // D
//           Engineer_Name:    (row[4]  || '').trim(), // E
//           Material_Type:    (row[5]  || '').trim(), // F
//           Material_Name:    (row[6]  || '').trim(), // G
//           Material_Size:    (row[7]  || '').trim(), // H
//           Specification:    (row[8]  || '').trim(), // I
//           Brand_Name:       (row[9]  || '').trim(), // J
//           SKU_Code:         (row[10] || '').trim(), // K
//           Quantity:         (row[11] || '').trim(), // L
//           Unit_Name:        (row[12] || '').trim(), // M
//           Description:      (row[13] || '').trim(), // N
//           Require_Days:     (row[14] || '').trim(), // O
//           Contractor:       (row[15] || '').trim(), // P
//           Remark:           (row[16] || '').trim(), // Q
//           PLANNED_3:        planned3,               // V
//           // Step 2 data
//           STATUS_2:         status2,                // X
//           REVISED_QTY_2:    (row[24] || '').trim(), // Y
//           DECIDED_BRAND_2:  (row[25] || '').trim(), // Z
//           REMARKS_2:        (row[27] || '').trim(), // AB
//           // Row number for update
//           _rowIndex:        index + 2,              // Actual sheet row (1-based + header)
//         };
//       })
//       .filter(Boolean);

//     if (!formData.length) {
//       return res.status(404).json({ error: 'No pending indent data found' });
//     }

//     return res.json({ data: formData });

//   } catch (error) {
//     console.error('Error fetching indent data:', error);
//     return res.status(500).json({ error: 'Failed to fetch data', details: error.message });
//   }
// });

// // ─── UPDATE INDENT DATA ──────────────────────────────────
// router.post("/update-indent-data", async (req, res) => {
//   const { UIDs, STATUS_3, REMARK_3 } = req.body;

//   // Validation
//   if (!UIDs || !Array.isArray(UIDs) || UIDs.length === 0) {
//     return res.status(400).json({ error: 'UIDs array is required' });
//   }
//   if (!STATUS_3 || !STATUS_3.trim()) {
//     return res.status(400).json({ error: 'STATUS_3 is required' });
//   }

//   let pdfUrl = "";
//   let generatedIndentNumber = "";

//   try {
//     // ── Step 1: Fetch sheet data ──
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Purchase_FMS!A2:AL',
//     });

//     const rows = response.data.values || [];
//     if (!rows.length) {
//       return res.status(404).json({ error: 'No data found in sheet' });
//     }

//     // ── Step 2: Find rows by UID ──
//     const selectedItems = [];
//     const rowNumbers = [];

//     for (const uid of UIDs) {
//       let found = false;
//       for (let i = 0; i < rows.length; i++) {
//         const rowUID = String(rows[i][1] || '').trim(); // B column = UID
//         if (rowUID === String(uid).trim()) {
//           rowNumbers.push(i + 2); // Sheet row (1-based + header offset)

//           selectedItems.push({
//             UID:              rowUID,
//             Req_No:           (rows[i][2]  || '').trim(), // C
//             Project_Name:     (rows[i][3]  || '').trim(), // D
//             Engineer_Name:    (rows[i][4]  || '').trim(), // E
//             Material_Type:    (rows[i][5]  || '').trim(), // F
//             Material_Name:    (rows[i][6]  || '').trim(), // G
//             Material_Size:    (rows[i][7]  || '').trim(), // H
//             Specification:    (rows[i][8]  || '').trim(), // I
//             Brand_Name:       (rows[i][9]  || '').trim(), // J
//             SKU_Code:         (rows[i][10] || '').trim(), // K
//             Quantity:         (rows[i][11] || '').trim(), // L
//             Unit_Name:        (rows[i][12] || '').trim(), // M
//             Description:      (rows[i][13] || '').trim(), // N
//             Require_Days:     (rows[i][14] || '').trim(), // O
//             Contractor:       (rows[i][15] || '').trim(), // P
//             REVISED_QTY:      (rows[i][24] || '').trim(), // Y
//             DECIDED_BRAND:    (rows[i][25] || '').trim(), // Z
//           });

//           found = true;
//           break;
//         }
//       }
//       if (!found) {
//         return res.status(404).json({ error: `UID "${uid}" not found` });
//       }
//     }

//     console.log(`Found ${selectedItems.length} items for UIDs:`, UIDs);

//     // ── Step 3: Generate Indent Number ──
//     // Check existing indent numbers in AK column (index 36)
//     const existingIndents = rows
//       .map(row => (row[36] || '').trim()) // AK column
//       .filter(val => val && val.startsWith('IND-'))
//       .map(val => parseInt(val.replace('IND-', ''), 10))
//       .filter(num => !isNaN(num));

//     const nextNum = existingIndents.length > 0 ? Math.max(...existingIndents) + 1 : 1;
//     generatedIndentNumber = `IND-${nextNum.toString().padStart(3, '0')}`;
//     console.log('Generated Indent Number:', generatedIndentNumber);

//     const REMARK_3_final = REMARK_3 || '';

//     // ── Step 4: Generate PDF ──
//     console.log('Generating PDF...');

//     const generatePDF = () => {
//       try {
//         const doc = new jsPDF();
//         const pageWidth = doc.internal.pageSize.getWidth();
//         const pageHeight = doc.internal.pageSize.getHeight();

//         // Header
//         doc.setTextColor(0, 0, 0);
//         doc.setFontSize(18);
//         doc.setFont("helvetica", "bold");
//         doc.text("R.C.C Infrastructures", pageWidth / 2, 15, { align: "center" });

//         doc.setFontSize(10);
//         doc.setFont("helvetica", "normal");
//         doc.text("310 Saket Nagar, 9B Near Sagar Public School, Bhopal, 462026", pageWidth / 2, 22, { align: "center" });
//         doc.text("Contact: 7869962504 | Email: mayank@rcinfrastructure.com", pageWidth / 2, 28, { align: "center" });
//         doc.text("GST: 23ABHFR3130L1ZA", pageWidth / 2, 34, { align: "center" });

//         // Title
//         doc.setFontSize(16);
//         doc.setFont("helvetica", "bold");
//         doc.setTextColor(220, 53, 69);
//         doc.text("MATERIAL INDENT REPORT", pageWidth / 2, 60, { align: "center" });
//         doc.setDrawColor(220, 53, 69);
//         doc.setLineWidth(1);
//         doc.line(60, 63, pageWidth - 60, 63);

//         doc.setTextColor(0, 0, 0);

//         const cleanText = (text) => {
//           return (text || "N/A").toString().trim().replace(/[^a-zA-Z0-9\s\-\/.,]/g, "");
//         };

//         const { Project_Name, Engineer_Name, Require_Days, Req_No } = selectedItems[0];
//         const indentDate = new Date()
//           .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
//           .replace(/ /g, "-");

//         // Left info
//         doc.setFontSize(10);
//         doc.setFont("helvetica", "bold");
//         doc.text("Project:", 15, 80);
//         doc.setFont("helvetica", "normal");
//         doc.text(cleanText(Project_Name), 40, 80);

//         doc.setFont("helvetica", "bold");
//         doc.text("Engineer:", 15, 88);
//         doc.setFont("helvetica", "normal");
//         doc.text(cleanText(Engineer_Name), 40, 88);

//         doc.setFont("helvetica", "bold");
//         doc.text("Indent Date:", 15, 96);
//         doc.setFont("helvetica", "normal");
//         doc.text(indentDate, 40, 96);

//         // Right info
//         doc.setFont("helvetica", "bold");
//         doc.text("Request No:", 120, 80);
//         doc.setFont("helvetica", "normal");
//         doc.text(cleanText(Req_No), 150, 80);

//         doc.setFont("helvetica", "bold");
//         doc.text("Req Days:", 120, 88);
//         doc.setFont("helvetica", "normal");
//         doc.text(cleanText(Require_Days), 150, 88);

//         doc.setFont("helvetica", "bold");
//         doc.text("Indent No:", 120, 96);
//         doc.setFont("helvetica", "normal");
//         doc.text(generatedIndentNumber, 150, 96);

//         // Table
//         doc.setFontSize(12);
//         doc.setFont("helvetica", "bold");
//         doc.setTextColor(220, 53, 69);
//         doc.text("Indent Details", 15, 110);

//         const tableBody = selectedItems.map((item, index) => [
//           index + 1,
//           cleanText(item.UID),
//           cleanText(item.Material_Type),
//           cleanText(item.SKU_Code),
//           cleanText(item.Material_Name),
//           cleanText(item.Material_Size),
//           cleanText(item.REVISED_QTY || item.Quantity),
//           cleanText(item.Unit_Name),
//           cleanText(item.DECIDED_BRAND),
//         ]);

//         doc.autoTable({
//           head: [[
//             "Sr.", "UID", "Material Type", "SKU Code",
//             "Material Name", "Size", "Quantity", "Unit", "Brand",
//           ]],
//           body: tableBody,
//           startY: 115,
//           theme: "grid",
//           styles: {
//             fontSize: 8, cellPadding: 3,
//             font: "helvetica", textColor: [0, 0, 0],
//             lineColor: [200, 200, 200], lineWidth: 0.1,
//             overflow: 'linebreak', cellWidth: 'wrap',
//           },
//           headStyles: {
//             fillColor: [255, 255, 255], textColor: [0, 0, 0],
//             fontStyle: "bold", fontSize: 9, halign: "center",
//           },
//           columnStyles: {
//             0: { halign: "center", cellWidth: 12 },
//             1: { halign: "center", cellWidth: 16 },
//             2: { halign: "center", cellWidth: 28 },
//             3: { halign: "center", cellWidth: 20 },
//             4: { cellWidth: 35 },
//             5: { halign: "center", cellWidth: 18 },
//             6: { halign: "center", cellWidth: 18 },
//             7: { halign: "center", cellWidth: 14 },
//             8: { halign: "center", cellWidth: 28 },
//           },
//           alternateRowStyles: { fillColor: [245, 245, 245] },
//           margin: { top: 115, left: 15, right: 15 },
//           pageBreak: 'auto',
//           showHead: 'everyPage',
//         });

//         // Footer
//         const tableEndY = doc.lastAutoTable?.finalY || 150;
//         const footerY = Math.max(tableEndY + 30, pageHeight - 60);

//         doc.setFontSize(10);
//         doc.setFont("helvetica", "bold");
//         doc.setTextColor(0, 0, 0);
//         doc.text("Authorized Signature", 15, footerY);
//         doc.setDrawColor(0, 0, 0);
//         doc.setLineWidth(0.5);
//         doc.line(15, footerY + 15, 80, footerY + 15);

//         doc.setFont("helvetica", "normal");
//         doc.setFontSize(8);
//         doc.setTextColor(100, 100, 100);
//         doc.text(`Generated on: ${new Date().toLocaleString()}`, 15, footerY + 25);

//         doc.setDrawColor(41, 128, 185);
//         doc.setLineWidth(2);
//         doc.rect(5, 5, pageWidth - 10, pageHeight - 10);

//         return doc.output("datauristring");
//       } catch (pdfError) {
//         console.error("PDF generation error:", pdfError);
//         throw new Error(`Failed to generate PDF: ${pdfError.message}`);
//       }
//     };

//     const pdfDataUri = generatePDF();
//     const base64Data = pdfDataUri.replace(/^data:application\/pdf(?:;[^,]+)?;base64,/, "");

//     // ── Step 5: Upload PDF to Google Drive ──
//     console.log('Uploading PDF to Google Drive...');
//     let folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
//     let validFolderId = folderId;

//     if (folderId) {
//       try {
//         await drive.files.get({
//           fileId: folderId,
//           fields: "id",
//           supportsAllDrives: true,
//         });
//       } catch {
//         console.log('Folder not found, uploading to root');
//         validFolderId = null;
//       }
//     }

//     const pdfBuffer = Buffer.from(base64Data, "base64");
//     const file = await drive.files.create({
//       resource: {
//         name: `indent_${generatedIndentNumber}_${Date.now()}.pdf`,
//         parents: validFolderId ? [validFolderId] : [],
//         mimeType: "application/pdf",
//       },
//       media: {
//         mimeType: "application/pdf",
//         body: Readable.from(pdfBuffer),
//       },
//       fields: "id, webViewLink",
//       supportsAllDrives: true,
//     });

//     pdfUrl = file.data.webViewLink;

//     await drive.permissions.create({
//       fileId: file.data.id,
//       requestBody: { role: "reader", type: "anyone" },
//       supportsAllDrives: true,
//     });

//     console.log('PDF uploaded:', pdfUrl);

//     // ── Step 6: Update Sheet - Column numbers ──
//     // AI=34 (STATUS 3), AK=36 (INDENT NUMBER 3), AL=37 (PDF URL 3)
//     // AJ=35 (REMARK 3 - if needed)

//     const updateData = [];

//     for (let i = 0; i < rowNumbers.length; i++) {
//       const sheetRow = rowNumbers[i];

//       updateData.push(
//         {
//           range: `Purchase_FMS!AI${sheetRow}`,  // STATUS 3
//           values: [[STATUS_3]],
//         },
//         {
//           range: `Purchase_FMS!AM${sheetRow}`,  // REMARK 3
//           values: [[REMARK_3_final]],
//         },
//         {
//           range: `Purchase_FMS!AK${sheetRow}`,  // INDENT NUMBER 3
//           values: [[generatedIndentNumber]],
//         },
//         {
//           range: `Purchase_FMS!AL${sheetRow}`,  // PDF URL 3
//           values: [[pdfUrl]],
//         },
//       );
//     }

//     console.log('Updating columns:', updateData.map(u => u.range));

//     await sheets.spreadsheets.values.batchUpdate({
//       spreadsheetId,
//       resource: {
//         valueInputOption: 'USER_ENTERED',
//         data: updateData,
//       },
//     });

//     console.log('✅ Sheet updated successfully');

//     return res.json({
//       success: true,
//       message: 'Data updated successfully',
//       pdfUrl,
//       indentNumber: generatedIndentNumber,
//     });

//   } catch (error) {
//     console.error('❌ Error:', error.message);
//     return res.status(500).json({
//       error: 'Server error',
//       details: error.message,
//     });
//   }
// });

// module.exports = router;







const express = require('express');
const { sheets, spreadsheetId, drive } = require('../config/googleSheet');
const { Readable } = require("stream");
const router = express.Router();
require('dotenv').config();

const { jsPDF } = require('jspdf');

try {
  require('jspdf-autotable');
  console.log('jspdf-autotable loaded successfully (Method 1)');
} catch (err) {
  console.log('Method 1 failed, trying method 2:', err.message);
  try {
    const autoTable = require('jspdf-autotable').default;
    autoTable(jsPDF);
    console.log('jspdf-autotable loaded successfully (Method 2)');
  } catch (err2) {
    console.log('Method 2 failed, trying method 3:', err2.message);
    try {
      const jspdfAutoTable = require('jspdf-autotable');
      jspdfAutoTable.default(jsPDF);
      console.log('jspdf-autotable loaded successfully (Method 3)');
    } catch (err3) {
      console.error('Failed to load jspdf-autotable:', err3.message, err3.stack);
      throw new Error('jspdf-autotable dependency could not be loaded');
    }
  }
}

try {
  const doc = new jsPDF();
  if (!doc.autoTable) {
    throw new Error('jspdf-autotable plugin not applied');
  }
  doc.autoTable({ head: [['Test']], body: [['Sample']] });
  console.log('jsPDF and autoTable test successful');
} catch (err) {
  console.error('jsPDF autoTable test failed:', err.message, err.stack);
  throw new Error('jsPDF instance initialization with autoTable failed');
}

// ─── GET INDENT DATA ─────────────────────────────────────
router.get("/get-indent-data", async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Purchase_FMS!A8:AM',
    });

    const rows = response.data.values || [];

    if (!rows.length) {
      return res.status(404).json({ error: 'No data found' });
    }

    const formData = rows
      .map((row, index) => {
        if (!row || row.every(cell => !cell || cell.trim() === '')) return null;

        const planned3 = (row[32] || '').trim();
        const actual3  = (row[33] || '').trim();

        if (!planned3 || actual3) return null;

        const status2 = (row[23] || '').trim();
        if (!status2 || status2 !== 'APPROVED') return null;

        const status3 = (row[34] || '').trim();
        if (status3) return null;

        return {
          UID:             (row[1]  || '').trim(),
          Req_No:          (row[2]  || '').trim(),
          Project_Name:    (row[3]  || '').trim(),
          Engineer_Name:   (row[4]  || '').trim(),
          Material_Type:   (row[5]  || '').trim(),
          Material_Name:   (row[6]  || '').trim(),
          Material_Size:   (row[7]  || '').trim(),
          Specification:   (row[8]  || '').trim(),
          Brand_Name:      (row[9]  || '').trim(),
          SKU_Code:        (row[10] || '').trim(),
          Quantity:        (row[11] || '').trim(),
          Unit_Name:       (row[12] || '').trim(),
          Description:     (row[13] || '').trim(),
          Require_Days:    (row[14] || '').trim(),
          Contractor:      (row[15] || '').trim(),
          Remark:          (row[16] || '').trim(),
          PLANNED_3:       planned3,
          STATUS_2:        status2,
          REVISED_QTY_2:   (row[24] || '').trim(),
          DECIDED_BRAND_2: (row[25] || '').trim(),
          REMARKS_2:       (row[27] || '').trim(),
          _rowIndex:       index + 2,
        };
      })
      .filter(Boolean);

    if (!formData.length) {
      return res.status(404).json({ error: 'No pending indent data found' });
    }

    return res.json({ data: formData });

  } catch (error) {
    console.error('Error fetching indent data:', error);
    return res.status(500).json({ error: 'Failed to fetch data', details: error.message });
  }
});

// ─── UPDATE INDENT DATA ──────────────────────────────────
router.post("/update-indent-data", async (req, res) => {
  const { UIDs, STATUS_3, REMARK_3 } = req.body;

  if (!UIDs || !Array.isArray(UIDs) || UIDs.length === 0) {
    return res.status(400).json({ error: 'UIDs array is required' });
  }
  if (!STATUS_3 || !STATUS_3.trim()) {
    return res.status(400).json({ error: 'STATUS_3 is required' });
  }

  let pdfUrl = "";
  let generatedIndentNumber = "";

  try {
    // ── Step 1: Fetch sheet data ──
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Purchase_FMS!A2:AL',
    });

    const rows = response.data.values || [];
    if (!rows.length) {
      return res.status(404).json({ error: 'No data found in sheet' });
    }

    // ── Step 2: Find rows by UID ──
    const selectedItems = [];
    const rowNumbers    = [];

    for (const uid of UIDs) {
      let found = false;
      for (let i = 0; i < rows.length; i++) {
        const rowUID = String(rows[i][1] || '').trim();
        if (rowUID === String(uid).trim()) {
          rowNumbers.push(i + 2);

          selectedItems.push({
            UID:           rowUID,
            Req_No:        (rows[i][2]  || '').trim(),  // C
            Project_Name:  (rows[i][3]  || '').trim(),  // D
            Engineer_Name: (rows[i][4]  || '').trim(),  // E
            Material_Type: (rows[i][5]  || '').trim(),  // F
            Material_Name: (rows[i][6]  || '').trim(),  // G
            Material_Size: (rows[i][7]  || '').trim(),  // H
            Specification: (rows[i][8]  || '').trim(),  // I
            Brand_Name:    (rows[i][9]  || '').trim(),  // J
            SKU_Code:      (rows[i][10] || '').trim(),  // K
            Quantity:      (rows[i][11] || '').trim(),  // L
            Unit_Name:     (rows[i][12] || '').trim(),  // M
            Description:   (rows[i][13] || '').trim(),  // N
            Require_Days:  (rows[i][14] || '').trim(),  // O
            Contractor:    (rows[i][15] || '').trim(),  // P
            REVISED_QTY:   (rows[i][24] || '').trim(),  // Y
            DECIDED_BRAND: (rows[i][25] || '').trim(),  // Z
          });

          found = true;
          break;
        }
      }
      if (!found) {
        return res.status(404).json({ error: `UID "${uid}" not found` });
      }
    }

    console.log(`Found ${selectedItems.length} items for UIDs:`, UIDs);

    // ── Step 3: Generate Indent Number ──
    const existingIndents = rows
      .map(row => (row[36] || '').trim())
      .filter(val => val && val.startsWith('IND-'))
      .map(val => parseInt(val.replace('IND-', ''), 10))
      .filter(num => !isNaN(num));

    const nextNum = existingIndents.length > 0
      ? Math.max(...existingIndents) + 1
      : 1;
    generatedIndentNumber = `IND-${nextNum.toString().padStart(3, '0')}`;
    console.log('Generated Indent Number:', generatedIndentNumber);

    const REMARK_3_final = REMARK_3 || '';

    // ── Step 4: Generate PDF ──
    console.log('Generating PDF...');

    const generatePDF = () => {
      try {
        const doc        = new jsPDF();
        const pageWidth  = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // ✅ cleanText - printable ASCII only
        const cleanText = (text) => {
          if (!text || text.toString().trim() === '') return 'N/A';
          return text.toString().trim().replace(/[^\x20-\x7E]/g, '');
        };

        // ── Header ──
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text("R.C.C Infrastructures", pageWidth / 2, 15, { align: "center" });

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(
          "310 Saket Nagar, 9B Near Sagar Public School, Bhopal, 462026",
          pageWidth / 2, 22, { align: "center" }
        );
        doc.text(
          "Contact: 7869962504 | Email: mayank@rcinfrastructure.com",
          pageWidth / 2, 28, { align: "center" }
        );
        doc.text("GST: 23ABHFR3130L1ZA", pageWidth / 2, 34, { align: "center" });

        // ── Title ──
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(220, 53, 69);
        doc.text("MATERIAL INDENT REPORT", pageWidth / 2, 60, { align: "center" });
        doc.setDrawColor(220, 53, 69);
        doc.setLineWidth(1);
        doc.line(60, 63, pageWidth - 60, 63);

        doc.setTextColor(0, 0, 0);

        const {
          Project_Name,
          Engineer_Name,
          Require_Days,
          Req_No,
        } = selectedItems[0];

        const indentDate = new Date()
          .toLocaleDateString("en-GB", {
            day: "2-digit", month: "short", year: "numeric",
          })
          .replace(/ /g, "-");

        // ── Left Info ──
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Project:", 15, 80);
        doc.setFont("helvetica", "normal");
        doc.text(cleanText(Project_Name), 40, 80);

        doc.setFont("helvetica", "bold");
        doc.text("Engineer:", 15, 88);
        doc.setFont("helvetica", "normal");
        doc.text(cleanText(Engineer_Name), 40, 88);

        doc.setFont("helvetica", "bold");
        doc.text("Indent Date:", 15, 96);
        doc.setFont("helvetica", "normal");
        doc.text(indentDate, 40, 96);

        // ── Right Info ──
        doc.setFont("helvetica", "bold");
        doc.text("Request No:", 120, 80);
        doc.setFont("helvetica", "normal");
        doc.text(cleanText(Req_No), 150, 80);

        doc.setFont("helvetica", "bold");
        doc.text("Req Days:", 120, 88);
        doc.setFont("helvetica", "normal");
        doc.text(cleanText(Require_Days), 150, 88);

        doc.setFont("helvetica", "bold");
        doc.text("Indent No:", 120, 96);
        doc.setFont("helvetica", "normal");
        doc.text(generatedIndentNumber, 150, 96);

        // ── Table Heading ──
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(220, 53, 69);
        doc.text("Indent Details", 15, 110);

        // ✅ Table body - SKU Code after Unit
        const tableBody = selectedItems.map((item, index) => [
          index + 1,
          cleanText(item.UID),
          cleanText(item.Material_Type),
          cleanText(item.Material_Name),
          cleanText(item.Material_Size),
          cleanText(item.REVISED_QTY || item.Quantity),
          cleanText(item.Unit_Name),
          cleanText(item.SKU_Code),              // ✅ SKU Code - Unit के बाद
          cleanText(item.DECIDED_BRAND),
        ]);

        doc.autoTable({
          head: [[
            "Sr.",
            "UID",
            "Material Type",
            "Material Name",
            "Size",
            "Quantity",
            "Unit",
            "SKU Code",                          // ✅ Unit के बाद
            "Brand",
          ]],
          body: tableBody,
          startY: 115,
          theme: "grid",
          styles: {
            fontSize: 8,
            cellPadding: 3,
            font: "helvetica",
            textColor: [0, 0, 0],
            lineColor: [200, 200, 200],
            lineWidth: 0.1,
            overflow: 'linebreak',
            cellWidth: 'wrap',
          },
          headStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            fontStyle: "bold",
            fontSize: 9,
            halign: "center",
          },
          columnStyles: {
            0: { halign: "center", cellWidth: 10 },  // Sr.
            1: { halign: "center", cellWidth: 14 },  // UID
            2: { halign: "center", cellWidth: 26 },  // Material Type
            3: { cellWidth: 32 },                    // Material Name
            4: { halign: "center", cellWidth: 18 },  // Size
            5: { halign: "center", cellWidth: 16 },  // Quantity
            6: { halign: "center", cellWidth: 14 },  // Unit
            7: { halign: "center", cellWidth: 20 },  // SKU Code ✅
            8: { halign: "center", cellWidth: 25 },  // Brand
          },
          alternateRowStyles: { fillColor: [245, 245, 245] },
          margin: { top: 115, left: 15, right: 15 },
          pageBreak: 'auto',
          showHead: 'everyPage',
        });

        // ── Footer ──
        const tableEndY = doc.lastAutoTable?.finalY || 150;
        const footerY   = Math.max(tableEndY + 30, pageHeight - 60);

        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text("Authorized Signature", 15, footerY);
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.line(15, footerY + 15, 80, footerY + 15);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(
          `Generated on: ${new Date().toLocaleString()}`,
          15, footerY + 25
        );

        // ── Border ──
        doc.setDrawColor(41, 128, 185);
        doc.setLineWidth(2);
        doc.rect(5, 5, pageWidth - 10, pageHeight - 10);

        return doc.output("datauristring");

      } catch (pdfError) {
        console.error("PDF generation error:", pdfError);
        throw new Error(`Failed to generate PDF: ${pdfError.message}`);
      }
    };

    const pdfDataUri = generatePDF();
    const base64Data = pdfDataUri.replace(
      /^data:application\/pdf(?:;[^,]+)?;base64,/, ""
    );

    // ── Step 5: Upload PDF to Google Drive ──
    console.log('Uploading PDF to Google Drive...');
    let folderId      = process.env.GOOGLE_DRIVE_FOLDER_ID;
    let validFolderId = folderId;

    if (folderId) {
      try {
        await drive.files.get({
          fileId: folderId,
          fields: "id",
          supportsAllDrives: true,
        });
      } catch {
        console.log('Folder not found, uploading to root');
        validFolderId = null;
      }
    }

    const pdfBuffer = Buffer.from(base64Data, "base64");

    const file = await drive.files.create({
      resource: {
        name: `indent_${generatedIndentNumber}_${Date.now()}.pdf`,
        parents: validFolderId ? [validFolderId] : [],
        mimeType: "application/pdf",
      },
      media: {
        mimeType: "application/pdf",
        body: Readable.from(pdfBuffer),
      },
      fields: "id, webViewLink",
      supportsAllDrives: true,
    });

    pdfUrl = file.data.webViewLink;

    await drive.permissions.create({
      fileId: file.data.id,
      requestBody: { role: "reader", type: "anyone" },
      supportsAllDrives: true,
    });

    console.log('PDF uploaded:', pdfUrl);

    // ── Step 6: Update Sheet ──
    const updateData = [];

    for (let i = 0; i < rowNumbers.length; i++) {
      const sheetRow = rowNumbers[i];
      updateData.push(
        {
          range:  `Purchase_FMS!AI${sheetRow}`,    // STATUS 3
          values: [[STATUS_3]],
        },
        {
          range:  `Purchase_FMS!AM${sheetRow}`,    // REMARK 3
          values: [[REMARK_3_final]],
        },
        {
          range:  `Purchase_FMS!AK${sheetRow}`,    // INDENT NUMBER 3
          values: [[generatedIndentNumber]],
        },
        {
          range:  `Purchase_FMS!AL${sheetRow}`,    // PDF URL 3
          values: [[pdfUrl]],
        },
      );
    }

    console.log('Updating columns:', updateData.map(u => u.range));

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      resource: {
        valueInputOption: 'USER_ENTERED',
        data: updateData,
      },
    });

    console.log('✅ Sheet updated successfully');

    return res.json({
      success: true,
      message: 'Data updated successfully',
      pdfUrl,
      indentNumber: generatedIndentNumber,
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    return res.status(500).json({
      error: 'Server error',
      details: error.message,
    });
  }
});

module.exports = router;