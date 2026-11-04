


// const express = require('express');
// const { sheets, spreadsheetId, drive } = require('../config/googleSheet');
// const router = express.Router();
// require('dotenv').config();
// const retry = require('async-retry');
// const { jsPDF } = require('jspdf');

// try { require('jspdf-autotable'); } catch (err) {
//   try { require('jspdf-autotable').default(jsPDF); } catch (err2) {
//     try { require('jspdf-autotable').default(jsPDF); } catch (err3) {
//       console.error('Failed to load jspdf-autotable');
//     }
//   }
// }

// // ═══════════════════════════════════════════════════════════
// //  COMPANY CONFIGURATION (RCC / VRN)
// // ═══════════════════════════════════════════════════════════
// const COMPANIES = {
//   RCC: {
//     name: "R.C.C Infrastructures",
//     address: "310 Saket Nagar, 9B Near Sagar Public School, Bhopal, 462026",
//     contact: "Contact: 9753432126 | Email: mayank@rcinfrastructure.com",
//     gst: "GST: 23AARPC4273A2Z4",
//     footer: "@ 2025 R.C.C Infrastructures."
//   },
//   VRN: {
//     name: "VRN INC",
//     address: "PLOT NO 18-19 Kolar Castle , Kolar Road Signature Group, Bhopal Madhya Pradesh , 462016",
//     contact: "Contact: 7869962504 | Email: vrnsystem902@gmail.com",
//     gst: "GST: 23BNUPC2040J1Z6",
//     footer: "@ 2025 VRN INC."
//   }
// };

// // ─── GET MRN DATA ─────────────────────────────────────────
// router.get('/get-MRN-Data', async (req, res) => {
//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Purchase_FMS!A8:DQ',
//     });

//     const rows = response.data.values || [];
//     console.log('Total rows:', rows.length);

//     if (!rows.length) {
//       return res.status(404).json({ error: 'No data found' });
//     }

//     if (rows[0]) {
//       console.log('Row length:', rows[0].length);
//       console.log('DJ(113):', rows[0][113]);
//       console.log('DK(114):', rows[0][114]);
//     }

//     const PLANNED_9_IDX = 113;
//     const ACTUAL_9_IDX = 114;

//     const filteredData = rows
//       .filter(row => {
//         if (!row || row.every(c => !c || c.trim() === '')) return false;
//         const planned9 = (row[PLANNED_9_IDX] || '').trim();
//         const actual9 = (row[ACTUAL_9_IDX] || '').trim();
//         return planned9 && !actual9;
//       })
//       .map(row => ({
//         UID: (row[1] || '').trim(),
//         reqNo: (row[2] || '').trim(),
//         siteName: (row[3] || '').trim(),
//         supervisorName: (row[4] || '').trim(),
//         materialType: (row[5] || '').trim(),
//         materialName: (row[6] || '').trim(),
//         materialSize: (row[7] || '').trim(),
//         materialSpecification: (row[8] || '').trim(),
//         skuCode: (row[10] || '').trim(),
//         unitName: (row[12] || '').trim(),
//         companyName: (row[17] || '').trim(), // Added Company Name (Col R)
//         revisedQuantity: (row[24] || '').trim(),
//         brandName: (row[25] || '').trim(),
//         contractorName: (row[15] || '').trim(),
//         indentNumber3: (row[36] || '').trim(),
//         pdfUrl3: (row[37] || '').trim(),
//         quotationNo: (row[55] || '').trim(),
//         vendorFirmName5: (row[57] || '').trim(),
//         pdfUrl5: (row[73] || '').trim(),
//         poNumber: (row[82] || '').trim(),
//         pdfUrl6: (row[83] || '').trim(),
//         deliveryDate: (row[84] || '').trim(),
//         finalReceivedQty: (row[105] || '').trim(),
//         planned9: (row[PLANNED_9_IDX] || '').trim(),
//       }));

//     console.log(`Filtered rows: ${filteredData.length}`);

//     res.json({ success: true, data: filteredData });
//   } catch (error) {
//     console.error('Error:', error.message);
//     res.status(500).json({ error: 'Failed to fetch data' });
//   }
// });

// // ─── GENERATE MRN NUMBER ──────────────────────────────────
// async function generateMRNNumber() {
//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Purchase_FMS!DM:DM',
//     });
//     const rows = response.data.values || [];
//     let maxNum = 0;
//     rows.forEach(row => {
//       if (row[0] && row[0].startsWith('MRN_')) {
//         const num = parseInt(row[0].substring(4), 10);
//         if (!isNaN(num) && num > maxNum) maxNum = num;
//       }
//     });
//     return `MRN_${String(maxNum + 1).padStart(3, '0')}`;
//   } catch (error) {
//     console.error('Error generating MRN number:', error);
//     throw error;
//   }
// }

// // ─── CLEAN TEXT ───────────────────────────────────────────
// const cleanText = (text, isSiteName = false) => {
//   if (!text || text === '') return '-';
//   let cleaned = text.toString().trim();
//   if (isSiteName) {
//     cleaned = cleaned.replace(/[^a-zA-Z0-9\s.,-]/g, '');
//   }
//   return cleaned || '-';
// };

// // ─── PDF GENERATION ───────────────────────────────────────
// const generateMRNPDF = (rowDatas, mrnNo, poNumber, indentNo, deliveryDate, companyKey = 'RCC') => {
//   const doc = new jsPDF();
//   if (typeof doc.autoTable !== 'function') throw new Error('autoTable not loaded');

//   const pageWidth = doc.internal.pageSize.getWidth();
//   const pageHeight = doc.internal.pageSize.getHeight();
//   const margin = 15;
//   const bottomMargin = 35;

//   const company = COMPANIES[companyKey] || COMPANIES.RCC; // Dynamic Company Select

//   // ── Header ──
//   doc.setTextColor(0, 0, 0);
//   doc.setFontSize(18);
//   doc.setFont('helvetica', 'bold');
//   doc.text(company.name, pageWidth / 2, 15, { align: 'center' }); // Dynamic Name

//   doc.setFontSize(10);
//   doc.setFont('helvetica', 'normal');
//   doc.text(company.address, pageWidth / 2, 22, { align: 'center' }); // Dynamic Address
//   doc.text(company.contact, pageWidth / 2, 28, { align: 'center' }); // Dynamic Contact
//   doc.text(company.gst, pageWidth / 2, 34, { align: 'center' }); // Dynamic GST

//   doc.setFontSize(16);
//   doc.setFont('helvetica', 'bold');
//   doc.text('Material Receipt Note', pageWidth / 2, 45, { align: 'center' });

//   doc.setDrawColor(220, 53, 69);
//   doc.setLineWidth(1);
//   doc.line(margin, 48, pageWidth - margin, 48);

//   // ── Info Section ──
//   doc.setFontSize(10);
//   const infoY = 55;
//   const currentDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');

//   const vendorName = cleanText(rowDatas[0]?.vendorName || '-');
//   const siteName = cleanText(rowDatas[0]?.siteName || '-', true);
//   const contractorName = cleanText(rowDatas[0]?.contractorName || '-');

//   doc.setFont('helvetica', 'bold');
//   doc.text('MRN Number:', margin, infoY);
//   doc.setFont('helvetica', 'normal');
//   doc.text(cleanText(mrnNo), margin + 35, infoY);

//   doc.setFont('helvetica', 'bold');
//   doc.text('MRN Date:', pageWidth / 2 + 15, infoY);
//   doc.setFont('helvetica', 'normal');
//   doc.text(currentDate, pageWidth / 2 + 50, infoY);

//   doc.setFont('helvetica', 'bold');
//   doc.text('PO No:', margin, infoY + 7);
//   doc.setFont('helvetica', 'normal');
//   doc.text(cleanText(poNumber), margin + 35, infoY + 7);

//   doc.setFont('helvetica', 'bold');
//   doc.text('Indent No:', pageWidth / 2 + 15, infoY + 7);
//   doc.setFont('helvetica', 'normal');
//   doc.text(cleanText(indentNo), pageWidth / 2 + 50, infoY + 7);

//   doc.setFont('helvetica', 'bold');
//   doc.text('Vendor Name:', margin, infoY + 14);
//   doc.setFont('helvetica', 'normal');
//   doc.text(vendorName, margin + 35, infoY + 14);

//   doc.setFont('helvetica', 'bold');
//   doc.text('Site Name:', pageWidth / 2 + 15, infoY + 14);
//   doc.setFont('helvetica', 'normal');
//   doc.text(siteName, pageWidth / 2 + 50, infoY + 14);

//   doc.setFont('helvetica', 'bold');
//   doc.text('Delivery Date:', margin, infoY + 21);
//   doc.setFont('helvetica', 'normal');
//   doc.text(cleanText(deliveryDate || '-'), margin + 35, infoY + 21);

//   doc.setFont('helvetica', 'bold');
//   doc.text('Contractor:', pageWidth / 2 + 15, infoY + 21);
//   doc.setFont('helvetica', 'normal');
//   doc.text(contractorName, pageWidth / 2 + 50, infoY + 21);

//   const materialDetailsY = infoY + 30;
//   doc.setFontSize(12);
//   doc.setFont('helvetica', 'bold');
//   doc.setTextColor(220, 53, 69);
//   doc.text('Material Details', margin, materialDetailsY);

//   // ✅ Table with Received Date column at end
//   const tableBody = rowDatas.map((rowData, index) => [
//     index + 1,
//     cleanText(rowData.uid),
//     cleanText(rowData.materialName),
//     cleanText(rowData.materialSize),
//     cleanText(rowData.materialSpecification),
//     cleanText(rowData.unit),
//     cleanText(rowData.finalReceivedQuantity),
//     cleanText(rowData.challanNo),
//     cleanText(rowData.vehicleNo),
//     cleanText(rowData.receivedDate),  // ✅ NEW - Received Date
//   ]);

//   doc.autoTable({
//     head: [['Sr No.', 'UID', 'Material Name', 'Size', 'Specification', 'Unit', 'Final Qty', 'Challan No.', 'Vehicle No.', 'Received Date']],
//     body: tableBody,
//     startY: materialDetailsY + 4,
//     theme: 'grid',
//     tableWidth: 'auto',
//     styles: {
//       fontSize: 8.5,
//       cellPadding: 2.5,
//       font: 'helvetica',
//       textColor: [0, 0, 0],
//       lineColor: [0, 0, 0],
//       lineWidth: 0.3,
//       overflow: 'linebreak',
//       valign: 'top',
//     },
//     bodyStyles: {
//       fontStyle: 'bold',
//       textColor: [15, 15, 15],
//     },
//     headStyles: {
//       fillColor: [235, 235, 235],
//       textColor: [0, 0, 0],
//       fontStyle: 'bold',
//       fontSize: 8.5,
//       halign: 'center',
//       cellPadding: 2.5,
//       lineWidth: 0.4,
//     },
//     // ✅ Total = 182mm (page 210 - margin 28)
//     columnStyles: {
//       0: { cellWidth: 12, halign: 'center' },   // Sr No
//       1: { cellWidth: 14, halign: 'center' },   // UID
//       2: { cellWidth: 32, halign: 'left' },     // Material Name
//       3: { cellWidth: 20, halign: 'center' },   // Size
//       4: { cellWidth: 26, halign: 'left' },     // Specification
//       5: { cellWidth: 12, halign: 'center' },   // Unit
//       6: { cellWidth: 14, halign: 'right' },    // Final Qty
//       7: { cellWidth: 18, halign: 'center' },   // Challan No
//       8: { cellWidth: 14, halign: 'center' },   // Vehicle No
//       9: { cellWidth: 20, halign: 'center' },   // ✅ Received Date
//     },
//     alternateRowStyles: { fillColor: [250, 250, 250] },
//     margin: { left: margin, right: margin, bottom: bottomMargin },
//     pageBreak: 'auto',
//     showHead: 'everyPage',
//     rowPageBreak: 'avoid',
//     didDrawPage: (data) => {
//       doc.setFontSize(10);
//       doc.setFont('helvetica', 'bold');
//       doc.setTextColor(0, 0, 0);
//       doc.text('Authorized Signature', pageWidth - 50, pageHeight - 25);
//       doc.setDrawColor(0, 0, 0);
//       doc.setLineWidth(0.5);
//       doc.line(pageWidth - 60, pageHeight - 20, pageWidth - 20, pageHeight - 20);

//       doc.setFontSize(8);
//       doc.setTextColor(100, 100, 100);
//       doc.text('Auto-generated document. No signature required.', margin, pageHeight - 15);
//       doc.text(company.footer, pageWidth / 2, pageHeight - 8, { align: 'center' }); // Dynamic Footer
//     },
//   });

//   // Page Numbers
//   const totalPages = doc.internal.getNumberOfPages();
//   for (let i = 1; i <= totalPages; i++) {
//     doc.setPage(i);
//     doc.setFillColor(0, 0, 0);
//     doc.roundedRect(pageWidth / 2 - 25, pageHeight - 5, 50, 4, 2, 2, 'F');
//     doc.setTextColor(255, 255, 255);
//     doc.setFontSize(7);
//     doc.setFont('helvetica', 'normal');
//     doc.text(`Page ${i} / ${totalPages}`, pageWidth / 2, pageHeight - 2, { align: 'center' });
//   }

//   const pdfBuffer = doc.output('arraybuffer');
//   return `data:application/pdf;base64,${Buffer.from(pdfBuffer).toString('base64')}`;
// };

// // ─── SAVE MRN DATA ────────────────────────────────────────
// router.post('/save-MRN-data', async (req, res) => {
//   console.log('=== SAVE MRN START ===');
//   const { poNumber, finalReceivedQuantities = [], vehicleNo, deliveryDate, purchaseFmsUIDs = [] } = req.body;

//   try {
//     if (!purchaseFmsUIDs.length) throw new Error('purchaseFmsUIDs required');
//     if (finalReceivedQuantities.length !== purchaseFmsUIDs.length) throw new Error('Quantities mismatch');

//     const mrnNo = await generateMRNNumber();
//     console.log(`MRN: ${mrnNo}`);

//     const sheetResponse = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Purchase_FMS!A2:DQ',
//     });
//     const rows = sheetResponse.data.values || [];

//     // ✅ Range A:R (R column = Received Date)
//     const materialResponse = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Material_Received!A2:U',
//     });
//     const materialRows = materialResponse.data.values || [];

//     const uidToChallanMap = new Map();
//     const uidToDateMap = new Map();  // ✅ NEW

//     materialRows.forEach(row => {
//       const uid = (row[1] || '').trim();
//       const challan = (row[18] || '').trim();  // ✅ S column = index 18 (Challan Number)
//       const receivedDate = (row[14] || '').trim(); // ✅ R column = index 17

//       if (uid && challan) {
//         if (!uidToChallanMap.has(uid)) uidToChallanMap.set(uid, new Set());
//         uidToChallanMap.get(uid).add(challan);
//       }

//       // ✅ Date map
//       if (uid && receivedDate) {
//         if (!uidToDateMap.has(uid)) uidToDateMap.set(uid, new Set());
//         uidToDateMap.get(uid).add(receivedDate);
//       }
//     });

//     const rowIndices = [];
//     const rowDatas = [];
//     let indentNo = '-';
//     let commonDeliveryDate = deliveryDate || '-';
//     let companyKey = 'RCC'; // Variable to store company name

//     for (let i = 0; i < purchaseFmsUIDs.length; i++) {
//       const uid = purchaseFmsUIDs[i];
//       const finalQty = finalReceivedQuantities[i];

//       let rowIndex = -1;
//       for (let j = 0; j < rows.length; j++) {
//         const rowUID = (rows[j][1] || '').trim();
//         const rowPO = (rows[j][82] || '').trim();
//         if (rowUID === String(uid).trim() && rowPO === String(poNumber).trim()) {
//           rowIndex = j;
//           break;
//         }
//       }

//       if (rowIndex === -1) {
//         return res.status(400).json({ error: `UID ${uid} with PO ${poNumber} not found` });
//       }

//       rowIndices.push(rowIndex + 2);

//       const row = rows[rowIndex];
//       const challanSet = uidToChallanMap.get(String(uid).trim()) || new Set();
//       const challanNos = Array.from(challanSet).join(', ');

//       // ✅ Get received dates for this UID
//       const dateSet = uidToDateMap.get(String(uid).trim()) || new Set();
//       const receivedDates = Array.from(dateSet).join(', ');

//       rowDatas.push({
//         uid: (row[1] || '').trim(),
//         siteName: (row[3] || '').trim(),
//         vendorName: (row[57] || '').trim(),
//         contractorName: (row[15] || '').trim(),
//         materialType: (row[5] || '').trim(),
//         skuCode: (row[10] || '').trim(),
//         materialName: (row[6] || '').trim(),
//         materialSize: (row[7] || '').trim(),
//         materialSpecification: (row[8] || '').trim(),
//         unit: (row[12] || '').trim(),
//         brand: (row[25] || '').trim(),
//         finalReceivedQuantity: finalQty || (row[105] || '').trim(),
//         challanNo: challanNos || '-',
//         vehicleNo: vehicleNo || '-',
//         receivedDate: receivedDates || '-',  // ✅ NEW
//         deliveryDate: (row[84] || deliveryDate || '').trim(),
//       });

//       // Picking Company Info from the first iteration
//       if (i === 0) {
//         indentNo = (row[36] || '').trim();
//         commonDeliveryDate = (row[84] || deliveryDate || '').trim();
//         companyKey = (row[17] || 'RCC').trim().toUpperCase(); // Column R index 17
//       }
//     }

//     // PDF ab company key receive karega aur usi basis par Header set karega
//     const pdfDataUri = generateMRNPDF(rowDatas, mrnNo, poNumber, indentNo, commonDeliveryDate, companyKey);
//     const base64Data = pdfDataUri.replace('data:application/pdf;base64,', '');
//     const pdfBuffer = Buffer.from(base64Data, 'base64');

//     const { Readable } = require('stream');
//     const file = await drive.files.create({
//       resource: {
//         name: `mrn_${companyKey}_${mrnNo}_${Date.now()}.pdf`,
//         parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
//         mimeType: 'application/pdf',
//       },
//       media: { mimeType: 'application/pdf', body: Readable.from(pdfBuffer) },
//       fields: 'id, webViewLink',
//       supportsAllDrives: true,
//     });
//     const pdfUrl = file.data.webViewLink;

//     await drive.permissions.create({
//       fileId: file.data.id,
//       requestBody: { role: 'reader', type: 'anyone' },
//       supportsAllDrives: true,
//     });

//     console.log(`✅ PDF: ${pdfUrl}`);

//     const today = new Date().toLocaleDateString('en-IN', {
//       timeZone: 'Asia/Kolkata',
//       day: '2-digit', month: '2-digit', year: 'numeric',
//     });

//     const batchData = [];
//     for (let i = 0; i < rowIndices.length; i++) {
//       const sheetRow = rowIndices[i];
//       const finalQty = finalReceivedQuantities[i] || rowDatas[i].finalReceivedQuantity;

//       batchData.push(
//         // { range: `Purchase_FMS!DK${sheetRow}`, values: [[today]] },
//         { range: `Purchase_FMS!DL${sheetRow}`, values: [['Done']] },
//         { range: `Purchase_FMS!DM${sheetRow}`, values: [[mrnNo]] },
//         { range: `Purchase_FMS!DN${sheetRow}`, values: [[pdfUrl]] },
//         { range: `Purchase_FMS!DP${sheetRow}`, values: [[finalQty]] },
//       );
//     }

//     await sheets.spreadsheets.values.batchUpdate({
//       spreadsheetId,
//       resource: { valueInputOption: 'USER_ENTERED', data: batchData },
//     });

//     console.log(`✅ Updated rows: ${rowIndices.join(', ')}`);

//     res.status(200).json({
//       message: 'MRN saved successfully',
//       mrnNo,
//       pdfUrl,
//     });
//   } catch (error) {
//     console.error('Error:', error.message);
//     res.status(500).json({ error: error.message });
//   }
// });

// module.exports = router;







const express = require('express');
const { sheets, spreadsheetId, drive } = require('../config/googleSheet');
const router = express.Router();
require('dotenv').config();
const retry = require('async-retry');
const { jsPDF } = require('jspdf');

try { require('jspdf-autotable'); } catch (err) {
  try { require('jspdf-autotable').default(jsPDF); } catch (err2) {
    try { require('jspdf-autotable').default(jsPDF); } catch (err3) {
      console.error('Failed to load jspdf-autotable');
    }
  }
}

// ═══════════════════════════════════════════════════════════
//  COMPANY CONFIGURATION (RCC / VRN)
// ═══════════════════════════════════════════════════════════
const COMPANIES = {
  RCC: {
    name: "R.C.C Infrastructures",
    address: "310 Saket Nagar, 9B Near Sagar Public School, Bhopal, 462026",
    contact: "Contact: 9753432126 | Email: mayank@rcinfrastructure.com",
    gst: "GST: 23AARPC4273A2Z4",
    footer: "@ 2025 R.C.C Infrastructures."
  },
  VRN: {
    name: "VRN INC",
    address: "PLOT NO 18-19 Kolar Castle , Kolar Road Signature Group, Bhopal Madhya Pradesh , 462016",
    contact: "Contact: 7869962504 | Email: vrnsystem902@gmail.com",
    gst: "GST: 23BNUPC2040J1Z6",
    footer: "@ 2025 VRN INC."
  }
};

// ─── GET MRN DATA ─────────────────────────────────────────
router.get('/get-MRN-Data', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Purchase_FMS!A8:DQ',
    });

    const rows = response.data.values || [];
    console.log('Total rows:', rows.length);

    if (!rows.length) {
      return res.status(404).json({ error: 'No data found' });
    }

    const PLANNED_9_IDX = 113;
    const ACTUAL_9_IDX = 114;

    const filteredData = rows
      .filter(row => {
        if (!row || row.every(c => !c || c.trim() === '')) return false;
        const planned9 = (row[PLANNED_9_IDX] || '').trim();
        const actual9 = (row[ACTUAL_9_IDX] || '').trim();
        return planned9 && !actual9;
      })
      .map(row => ({
        UID: (row[1] || '').trim(),
        reqNo: (row[2] || '').trim(),
        siteName: (row[3] || '').trim(),
        supervisorName: (row[4] || '').trim(),
        materialType: (row[5] || '').trim(),
        materialName: (row[6] || '').trim(),
        materialSize: (row[7] || '').trim(),
        materialSpecification: (row[8] || '').trim(),
        skuCode: (row[10] || '').trim(),
        unitName: (row[12] || '').trim(),
        companyName: (row[17] || '').trim(), 
        revisedQuantity: (row[24] || '').trim(),
        brandName: (row[25] || '').trim(),
        contractorName: (row[15] || '').trim(),
        indentNumber3: (row[36] || '').trim(),
        pdfUrl3: (row[37] || '').trim(),
        quotationNo: (row[55] || '').trim(),
        vendorFirmName5: (row[57] || '').trim(),
        pdfUrl5: (row[73] || '').trim(),
        poNumber: (row[82] || '').trim(),
        pdfUrl6: (row[83] || '').trim(),
        deliveryDate: (row[84] || '').trim(),
        finalReceivedQty: (row[105] || '').trim(),
        planned9: (row[PLANNED_9_IDX] || '').trim(),
      }));

    res.json({ success: true, data: filteredData });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// ─── GENERATE MRN NUMBER ──────────────────────────────────
async function generateMRNNumber(companyKey, rows = []) {
  try {
    let maxNum = 0;

    rows.forEach(row => {
      const rowCompany = (row[17] || 'RCC').trim().toUpperCase(); // Column R index 17
      const rowMRN = (row[116] || '').trim();                     // Column DM index 116

      if (companyKey === 'VRN') {
        // VRN Format check: MRN/VRN/0001 or MRN/
        if (rowCompany === 'VRN' && rowMRN.startsWith('MRN/')) {
          const parts = rowMRN.split('/');
          const lastNumStr = parts[parts.length - 1];
          const num = parseInt(lastNumStr, 10);
          if (!isNaN(num) && num > maxNum) maxNum = num;
        }
      } else {
        // RCC Format check: MRN_001
        if (rowCompany !== 'VRN' && rowMRN.startsWith('MRN_')) {
          const num = parseInt(rowMRN.replace('MRN_', ''), 10);
          if (!isNaN(num) && num > maxNum) maxNum = num;
        }
      }
    });

    if (companyKey === 'VRN') {
      return `MRN/VRN/${String(maxNum + 1).padStart(4, '0')}`;
    } else {
      return `MRN_${String(maxNum + 1).padStart(3, '0')}`;
    }
  } catch (error) {
    console.error('Error generating MRN number:', error);
    throw error;
  }
}

// ─── CLEAN TEXT ───────────────────────────────────────────
const cleanText = (text, isSiteName = false) => {
  if (!text || text === '') return '-';
  let cleaned = text.toString().trim();
  if (isSiteName) {
    cleaned = cleaned.replace(/[^a-zA-Z0-9\s.,-]/g, '');
  }
  return cleaned || '-';
};

// ─── PDF GENERATION ───────────────────────────────────────
const generateMRNPDF = (rowDatas, mrnNo, poNumber, indentNo, deliveryDate, companyKey = 'RCC') => {
  const doc = new jsPDF();
  if (typeof doc.autoTable !== 'function') throw new Error('autoTable not loaded');

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const bottomMargin = 35;

  const company = COMPANIES[companyKey] || COMPANIES.RCC; 

  // ── Header ──
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(company.name, pageWidth / 2, 15, { align: 'center' }); 

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(company.address, pageWidth / 2, 22, { align: 'center' }); 
  doc.text(company.contact, pageWidth / 2, 28, { align: 'center' }); 
  doc.text(company.gst, pageWidth / 2, 34, { align: 'center' }); 

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Material Receipt Note', pageWidth / 2, 45, { align: 'center' });

  doc.setDrawColor(220, 53, 69);
  doc.setLineWidth(1);
  doc.line(margin, 48, pageWidth - margin, 48);

  // ── Info Section ──
  doc.setFontSize(10);
  const infoY = 55;
  const currentDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');

  const vendorName = cleanText(rowDatas[0]?.vendorName || '-');
  const siteName = cleanText(rowDatas[0]?.siteName || '-', true);
  const contractorName = cleanText(rowDatas[0]?.contractorName || '-');

  doc.setFont('helvetica', 'bold');
  doc.text('MRN Number:', margin, infoY);
  doc.setFont('helvetica', 'normal');
  doc.text(cleanText(mrnNo), margin + 35, infoY);

  doc.setFont('helvetica', 'bold');
  doc.text('MRN Date:', pageWidth / 2 + 15, infoY);
  doc.setFont('helvetica', 'normal');
  doc.text(currentDate, pageWidth / 2 + 50, infoY);

  doc.setFont('helvetica', 'bold');
  doc.text('PO No:', margin, infoY + 7);
  doc.setFont('helvetica', 'normal');
  doc.text(cleanText(poNumber), margin + 35, infoY + 7);

  doc.setFont('helvetica', 'bold');
  doc.text('Indent No:', pageWidth / 2 + 15, infoY + 7);
  doc.setFont('helvetica', 'normal');
  doc.text(cleanText(indentNo), pageWidth / 2 + 50, infoY + 7);

  doc.setFont('helvetica', 'bold');
  doc.text('Vendor Name:', margin, infoY + 14);
  doc.setFont('helvetica', 'normal');
  doc.text(vendorName, margin + 35, infoY + 14);

  doc.setFont('helvetica', 'bold');
  doc.text('Site Name:', pageWidth / 2 + 15, infoY + 14);
  doc.setFont('helvetica', 'normal');
  doc.text(siteName, pageWidth / 2 + 50, infoY + 14);

  doc.setFont('helvetica', 'bold');
  doc.text('Delivery Date:', margin, infoY + 21);
  doc.setFont('helvetica', 'normal');
  doc.text(cleanText(deliveryDate || '-'), margin + 35, infoY + 21);

  doc.setFont('helvetica', 'bold');
  doc.text('Contractor:', pageWidth / 2 + 15, infoY + 21);
  doc.setFont('helvetica', 'normal');
  doc.text(contractorName, pageWidth / 2 + 50, infoY + 21);

  const materialDetailsY = infoY + 30;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 53, 69);
  doc.text('Material Details', margin, materialDetailsY);

  const tableBody = rowDatas.map((rowData, index) => [
    index + 1,
    cleanText(rowData.uid),
    cleanText(rowData.materialName),
    cleanText(rowData.materialSize),
    cleanText(rowData.materialSpecification),
    cleanText(rowData.unit),
    cleanText(rowData.finalReceivedQuantity),
    cleanText(rowData.challanNo),
    cleanText(rowData.vehicleNo),
    cleanText(rowData.receivedDate),  
  ]);

  doc.autoTable({
    head: [['Sr No.', 'UID', 'Material Name', 'Size', 'Specification', 'Unit', 'Final Qty', 'Challan No.', 'Vehicle No.', 'Received Date']],
    body: tableBody,
    startY: materialDetailsY + 4,
    theme: 'grid',
    tableWidth: 'auto',
    styles: {
      fontSize: 8.5,
      cellPadding: 2.5,
      font: 'helvetica',
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 0.3,
      overflow: 'linebreak',
      valign: 'top',
    },
    bodyStyles: {
      fontStyle: 'bold',
      textColor: [15, 15, 15],
    },
    headStyles: {
      fillColor: [235, 235, 235],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'center',
      cellPadding: 2.5,
      lineWidth: 0.4,
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },   
      1: { cellWidth: 14, halign: 'center' },   
      2: { cellWidth: 32, halign: 'left' },     
      3: { cellWidth: 20, halign: 'center' },   
      4: { cellWidth: 26, halign: 'left' },     
      5: { cellWidth: 12, halign: 'center' },   
      6: { cellWidth: 14, halign: 'right' },    
      7: { cellWidth: 18, halign: 'center' },   
      8: { cellWidth: 14, halign: 'center' },   
      9: { cellWidth: 20, halign: 'center' },   
    },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    margin: { left: margin, right: margin, bottom: bottomMargin },
    pageBreak: 'auto',
    showHead: 'everyPage',
    rowPageBreak: 'avoid',
    didDrawPage: (data) => {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Authorized Signature', pageWidth - 50, pageHeight - 25);
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.line(pageWidth - 60, pageHeight - 20, pageWidth - 20, pageHeight - 20);

      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('Auto-generated document. No signature required.', margin, pageHeight - 15);
      doc.text(company.footer, pageWidth / 2, pageHeight - 8, { align: 'center' }); 
    },
  });

  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFillColor(0, 0, 0);
    doc.roundedRect(pageWidth / 2 - 25, pageHeight - 5, 50, 4, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(`Page ${i} / ${totalPages}`, pageWidth / 2, pageHeight - 2, { align: 'center' });
  }

  const pdfBuffer = doc.output('arraybuffer');
  return `data:application/pdf;base64,${Buffer.from(pdfBuffer).toString('base64')}`;
};

// ─── SAVE MRN DATA ────────────────────────────────────────
router.post('/save-MRN-data', async (req, res) => {
  console.log('=== SAVE MRN START ===');
  const { poNumber, finalReceivedQuantities = [], vehicleNo, deliveryDate, purchaseFmsUIDs = [] } = req.body;

  try {
    if (!purchaseFmsUIDs.length) throw new Error('purchaseFmsUIDs required');
    if (finalReceivedQuantities.length !== purchaseFmsUIDs.length) throw new Error('Quantities mismatch');

    const sheetResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Purchase_FMS!A2:DQ',
    });
    const rows = sheetResponse.data.values || [];

    // FIND COMPANY KEY FIRST
    let companyKey = 'RCC';
    const firstUID = purchaseFmsUIDs[0];
    const matchedFirstRow = rows.find(r => (r[1] || '').trim() === String(firstUID).trim());
    if (matchedFirstRow) {
      companyKey = (matchedFirstRow[17] || 'RCC').trim().toUpperCase();
    }

    const mrnNo = await generateMRNNumber(companyKey, rows);
    console.log(`MRN: ${mrnNo} (${companyKey})`);

    const materialResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Material_Received!A2:U',
    });
    const materialRows = materialResponse.data.values || [];

    const uidToChallanMap = new Map();
    const uidToDateMap = new Map();  

    materialRows.forEach(row => {
      const uid = (row[1] || '').trim();
      const challan = (row[18] || '').trim();  
      const receivedDate = (row[14] || '').trim(); 

      if (uid && challan) {
        if (!uidToChallanMap.has(uid)) uidToChallanMap.set(uid, new Set());
        uidToChallanMap.get(uid).add(challan);
      }
      if (uid && receivedDate) {
        if (!uidToDateMap.has(uid)) uidToDateMap.set(uid, new Set());
        uidToDateMap.get(uid).add(receivedDate);
      }
    });

    const rowIndices = [];
    const rowDatas = [];
    let indentNo = '-';
    let commonDeliveryDate = deliveryDate || '-';

    for (let i = 0; i < purchaseFmsUIDs.length; i++) {
      const uid = purchaseFmsUIDs[i];
      const finalQty = finalReceivedQuantities[i];

      let rowIndex = -1;
      for (let j = 0; j < rows.length; j++) {
        const rowUID = (rows[j][1] || '').trim();
        const rowPO = (rows[j][82] || '').trim();
        if (rowUID === String(uid).trim() && rowPO === String(poNumber).trim()) {
          rowIndex = j;
          break;
        }
      }

      if (rowIndex === -1) {
        return res.status(400).json({ error: `UID ${uid} with PO ${poNumber} not found` });
      }

      rowIndices.push(rowIndex + 2);

      const row = rows[rowIndex];
      const challanSet = uidToChallanMap.get(String(uid).trim()) || new Set();
      const challanNos = Array.from(challanSet).join(', ');

      const dateSet = uidToDateMap.get(String(uid).trim()) || new Set();
      const receivedDates = Array.from(dateSet).join(', ');

      rowDatas.push({
        uid: (row[1] || '').trim(),
        siteName: (row[3] || '').trim(),
        vendorName: (row[57] || '').trim(),
        contractorName: (row[15] || '').trim(),
        materialType: (row[5] || '').trim(),
        skuCode: (row[10] || '').trim(),
        materialName: (row[6] || '').trim(),
        materialSize: (row[7] || '').trim(),
        materialSpecification: (row[8] || '').trim(),
        unit: (row[12] || '').trim(),
        brand: (row[25] || '').trim(),
        finalReceivedQuantity: finalQty || (row[105] || '').trim(),
        challanNo: challanNos || '-',
        vehicleNo: vehicleNo || '-',
        receivedDate: receivedDates || '-',  
        deliveryDate: (row[84] || deliveryDate || '').trim(),
      });

      if (i === 0) {
        indentNo = (row[36] || '').trim();
        commonDeliveryDate = (row[84] || deliveryDate || '').trim();
      }
    }

    const pdfDataUri = generateMRNPDF(rowDatas, mrnNo, poNumber, indentNo, commonDeliveryDate, companyKey);
    const base64Data = pdfDataUri.replace('data:application/pdf;base64,', '');
    const pdfBuffer = Buffer.from(base64Data, 'base64');

    const { Readable } = require('stream');
    const file = await drive.files.create({
      resource: {
        name: `mrn_${companyKey}_${mrnNo.replace(/\//g, '_')}_${Date.now()}.pdf`,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
        mimeType: 'application/pdf',
      },
      media: { mimeType: 'application/pdf', body: Readable.from(pdfBuffer) },
      fields: 'id, webViewLink',
      supportsAllDrives: true,
    });
    const pdfUrl = file.data.webViewLink;

    await drive.permissions.create({
      fileId: file.data.id,
      requestBody: { role: 'reader', type: 'anyone' },
      supportsAllDrives: true,
    });

    const batchData = [];
    for (let i = 0; i < rowIndices.length; i++) {
      const sheetRow = rowIndices[i];
      const finalQty = finalReceivedQuantities[i] || rowDatas[i].finalReceivedQuantity;
      batchData.push(
        { range: `Purchase_FMS!DL${sheetRow}`, values: [['Done']] },
        { range: `Purchase_FMS!DM${sheetRow}`, values: [[mrnNo]] },
        { range: `Purchase_FMS!DN${sheetRow}`, values: [[pdfUrl]] },
        { range: `Purchase_FMS!DP${sheetRow}`, values: [[finalQty]] },
      );
    }

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      resource: { valueInputOption: 'USER_ENTERED', data: batchData },
    });

    res.status(200).json({
      message: 'MRN saved successfully',
      mrnNo,
      pdfUrl,
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;