

// const express = require('express');
// const { sheets, spreadsheetId, drive } = require('../config/googleSheet');
// require('dotenv').config();
// const router = express.Router();
// const { jsPDF } = require('jspdf');

// try {
//   require('jspdf-autotable');
//   console.log('jspdf-autotable loaded');
// } catch (err) {
//   try {
//     const autoTable = require('jspdf-autotable').default;
//     autoTable(jsPDF);
//   } catch (err2) {
//     try {
//       const jspdfAutoTable = require('jspdf-autotable');
//       jspdfAutoTable.default(jsPDF);
//     } catch (err3) {
//       console.error('Failed to load jspdf-autotable:', err3.message);
//       throw new Error('jspdf-autotable could not be loaded');
//     }
//   }
// }

// // ─── HELPERS ─────────────────────────────────────────────
// const cleanKey = (v = '') =>
//   v.toString().trim().toLowerCase().replace(/[\s_.\/()-]/g, '');

// const buildColMap = (headers = []) => {
//   const map = {};
//   headers.forEach((h, i) => {
//     map[cleanKey(h)] = i;
//   });
//   return map;
// };

// const getHeaderIndex = (colMap, possibleKeys = []) => {
//   for (const key of possibleKeys) {
//     const idx = colMap[cleanKey(key)];
//     if (idx !== undefined) return idx;
//   }
//   return -1;
// };

// const getValue = (row, colMap, possibleKeys = []) => {
//   const idx = getHeaderIndex(colMap, possibleKeys);
//   return idx !== -1 ? (row[idx] || '').toString().trim() : '';
// };

// const getColLetter = (idx) => {
//   let letter = '';
//   let num = idx;
//   while (num >= 0) {
//     letter = String.fromCharCode(65 + (num % 26)) + letter;
//     num = Math.floor(num / 26) - 1;
//   }
//   return letter;
// };

// // ─── CACHE ──────────────────────────────────────────────
// let quotationCache = { ts: 0, headers: [], rows: [] };
// const CACHE_TTL = 30 * 1000;

// const invalidateQuotationCache = () => {
//   quotationCache = { ts: 0, headers: [], rows: [] };
// };

// const getQuotationMasterSheet = async (force = false) => {
//   const now = Date.now();
//   if (!force && quotationCache.rows.length && now - quotationCache.ts < CACHE_TTL) {
//     return quotationCache;
//   }
//   const response = await sheets.spreadsheets.values.get({
//     spreadsheetId,
//     range: 'Quotation_Master!A1:AK',  // ✅ AK (Column 37) is correctly fetched
//   });
//   const allRows = response.data.values || [];
//   quotationCache = {
//     ts: now,
//     headers: allRows[0] || [],
//     rows: allRows.slice(1),
//   };
//   return quotationCache;
// };

// const mapQuotationRow = (row, colMap) => {
//   if (!row || row.every((c) => !c || c.toString().trim() === '')) return null;

//   const approvalStatus = getValue(row, colMap, ['approvalstatus']);
//   if (['approved', 'rejected'].includes(approvalStatus.toLowerCase())) {
//     return null;
//   }

//   // 🆕 Safe lookup for Final_Remark (Column AK / Index 36)
//   const finalRemarkIdx = getHeaderIndex(colMap, ['finalremark', 'final_remark', 'remark']);
//   const finalRemarkVal = finalRemarkIdx !== -1 
//     ? (row[finalRemarkIdx] || '').toString().trim() 
//     : (row[36] || '').toString().trim(); // Fallback to Index 36 (AK) if header map fails

//   return {
//     Time_Stamp: getValue(row, colMap, ['timestamp']),
//     Req_No: getValue(row, colMap, ['reqno']),
//     UID: getValue(row, colMap, ['uid']),
//     site_name: getValue(row, colMap, ['sitename', 'site_name']),
//     Indent_No: getValue(row, colMap, ['indentno', 'indent_no']),
//     Material_name: getValue(row, colMap, ['materialname', 'material_name']),
//     Material_Size: getValue(row, colMap, ['materialsize', 'material_size']),
//     Material_Specification: getValue(row, colMap, ['materialspecification']),
//     Vendor_Name: getValue(row, colMap, ['vendorname']),
//     Vendor_Ferm_Name: getValue(row, colMap, ['vendorfirmname', 'vendorfermname']),
//     Vendor_Address: getValue(row, colMap, ['vendoraddress']),
//     Contact_Number: getValue(row, colMap, ['contactnumber']),
//     Vendor_GST_No: getValue(row, colMap, ['vendorgstno']),
//     RATE: getValue(row, colMap, ['rate']),
//     Discount: getValue(row, colMap, ['discount']),
//     CGST: getValue(row, colMap, ['cgst']),
//     SGST: getValue(row, colMap, ['sgst']),
//     IGST: getValue(row, colMap, ['igst']),
//     Final_Rate: getValue(row, colMap, ['finalrate']),
//     Delivery_Expected_Date: getValue(row, colMap, ['deliveryexpecteddate']),
//     Payment_Terms_Condition_Advance_Credit: getValue(row, colMap, [
//       'paymenttermscondistionadvacnecredit',
//       'paymenttermsconditionadvancecredit',
//     ]),
//     Credit_in_Days: getValue(row, colMap, ['creditinday', 'creditindays']),
//     Bill_Type: getValue(row, colMap, ['billtype']),
//     IS_TRANSPORT_REQUIRED: getValue(row, colMap, ['istransportrequired']),
//     EXPECTED_TRANSPORT_CHARGES: getValue(row, colMap, ['expectedtransportcharges']),
//     FRIGHET_CHARGES: getValue(row, colMap, ['frighetcharges', 'freightcharges']),
//     EXPECTED_FRIGHET_CHARGES: getValue(row, colMap, ['expectedfrighetcharges']),
//     Status: getValue(row, colMap, ['status']),
//     No_Of_Quotation_4: getValue(row, colMap, ['noofquotation4']),
//     Remark_4: getValue(row, colMap, ['brandname4', 'remark4']),
//     Quotation_No: getValue(row, colMap, ['quotationno']),
//     Total_Quantity: getValue(row, colMap, ['totalquantity']),
//     Total_Value: getValue(row, colMap, ['totalvalue']),
//     Approval_Status: approvalStatus,
//     Final_Remark: finalRemarkVal, // ✅ Added to exposure payload
//   };
// };

// const getMappedQuotationRows = async (indentNo = '', force = false) => {
//   const { headers, rows } = await getQuotationMasterSheet(force);
//   const colMap = buildColMap(headers);

//   return rows
//     .map((row) => mapQuotationRow(row, colMap))
//     .filter(Boolean)
//     .filter((item) => (indentNo ? item.Indent_No === indentNo : true))
//     .sort((a, b) => {
//       const uidSort = (a.UID || '').localeCompare(b.UID || '');
//       if (uidSort !== 0) return uidSort;
//       const rateA = parseFloat(a.Final_Rate) || Infinity;
//       const rateB = parseFloat(b.Final_Rate) || Infinity;
//       if (rateA !== rateB) return rateA - rateB;
//       return (a.Vendor_Ferm_Name || '').localeCompare(b.Vendor_Ferm_Name || '');
//     });
// };


// // ─── GET APPROVAL QUOTATION (Purchase_FMS) ──────────────
// router.get('/get-approval-Quotation', async (req, res) => {
//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Purchase_FMS!A2:BZ',
//     });

//     const rows = response.data.values || [];
//     console.log('Purchase_FMS rows:', rows.length);

//     if (!rows.length) {
//       return res.json({ data: [] });
//     }

//     const STATUS_4_IDX = 44;   // AS - Status 4
//     const PLANNED_5_IDX = 51;  // AZ - Planned 5
//     const ACTUAL_5_IDX = 52;   // BA - Actual 5
//     const STATUS_5_IDX = 53;   // BB - Status 5

//     let skipped = {
//       empty: 0,
//       noStatus4: 0,
//       hasStatus5: 0,
//       hasActual5: 0,
//     };

//     const formData = rows
//       .map((row, index) => {
//         if (!row || row.every((c) => !c || c.trim() === '')) {
//           skipped.empty++;
//           return null;
//         }

//         const status4 = (row[STATUS_4_IDX] || '').trim();
//         const planned5 = (row[PLANNED_5_IDX] || '').trim();
//         const actual5 = (row[ACTUAL_5_IDX] || '').trim();
//         const status5 = (row[STATUS_5_IDX] || '').trim();

//         if (!status4) { skipped.noStatus4++; return null; }
//         if (status5) { skipped.hasStatus5++; return null; }
//         if (actual5) { skipped.hasActual5++; return null; }
      

//         return {
//           UID: (row[1] || '').trim(),
//           Req_No: (row[2] || '').trim(),
//           Site_Name: (row[3] || '').trim(),
//           Supervisor_Name: (row[4] || '').trim(),
//           Material_Type: (row[5] || '').trim(),
//           Material_Name: (row[6] || '').trim(),
//           Material_Size: (row[7] || '').trim(),
//           Specification: (row[8] || '').trim(),
//           SKU_Code: (row[10] || '').trim(),
//           Quantity: (row[11] || '').trim(),
//           Unit_Name: (row[12] || '').trim(),
//           Purpose: (row[13] || '').trim(),
//           Require_Date: (row[14] || '').trim(),
//           REVISED_QUANTITY_2: (row[24] || '').trim(),
//           'DECIDED_BRAND/COMPANY_NAME_2': (row[25] || '').trim(),
//           INDENT_NUMBER_3: (row[36] || '').trim(),
//           PDF_URL_3: (row[37] || '').trim(),
//           No_Of_Quotation_4: (row[46] || '').trim(),
//           REMARK_4: (row[47] || '').trim(),
//           PLANNED_5: planned5,
//           _rowIndex: index + 2,
//         };
//       })
//       .filter(Boolean);

//     console.log('=== FILTER SUMMARY ===');
//     console.log('Total rows:', rows.length);
//     console.log('Empty:', skipped.empty);
//     console.log('No Status 4:', skipped.noStatus4);
//     console.log('Has Status 5:', skipped.hasStatus5);
//     console.log('Has Actual 5:', skipped.hasActual5);
//     console.log('✅ Pending approvals:', formData.length);

//     return res.json({ data: formData });
//   } catch (error) {
//     console.error('❌ Error:', error.message);
//     return res.status(500).json({
//       error: 'Failed to fetch data',
//       details: error.message,
//     });
//   }
// });

// // ─── INDENT LIST ─────────────────────────────────────────
// router.get('/get-quotation-indents', async (req, res) => {
//   try {
//     const data = await getMappedQuotationRows();
//     const indentNumbers = [...new Set(data.map((item) => item.Indent_No).filter(Boolean))];
//     return res.json({ data: indentNumbers });
//   } catch (error) {
//     console.error('Indent error:', error.message);
//     return res.status(500).json({ error: 'Failed to fetch indent numbers', details: error.message });
//   }
// });

// // ─── ONE INDENT DATA ─────────────────────────────────────
// router.get('/get-quotation-by-indent', async (req, res) => {
//   try {
//     const { indentNo } = req.query;
//     if (!indentNo) return res.status(400).json({ error: 'indentNo is required' });
//     const data = await getMappedQuotationRows(indentNo);
//     return res.json({ data });
//   } catch (error) {
//     console.error('Indent detail error:', error.message);
//     return res.status(500).json({ error: 'Failed to fetch quotation data', details: error.message });
//   }
// });

// // ─── OLD ROUTE (COMPATIBILITY) ───────────────────────────
// router.get('/get-Quotation-create', async (req, res) => {
//   try {
//     const data = await getMappedQuotationRows();
//     return res.json({ data });
//   } catch (error) {
//     console.error('Error:', error.message);
//     return res.status(500).json({ error: 'Failed to fetch data', details: error.message });
//   }
// });

// // ─── GENERATE PDF ────────────────────────────────────────
// const generateQuotationPDF = async (approvedItems, quotationNo, indentNo, qmHeaders = []) => {
//   console.log(`\n📄 Generating PDF: Quotation ${quotationNo}, Indent ${indentNo}, Items: ${approvedItems.length}`);

//   try {
//     const qmColMap = buildColMap(qmHeaders);

//     const unitMap = new Map();
//     const fmsRes = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Purchase_FMS!A2:M',
//     });

//     const fmsRows = fmsRes.data.values || [];
//     fmsRows.forEach((row) => {
//       const uid = (row[1] || '').trim();
//       const unit = (row[12] || '').trim();
//       if (uid) unitMap.set(uid, unit);
//     });

//     const doc = new jsPDF();
//     if (typeof doc.autoTable !== 'function') {
//       throw new Error('autoTable not loaded');
//     }

//     const pageWidth = doc.internal.pageSize.getWidth();
//     const pageHeight = doc.internal.pageSize.getHeight();

//     const safe = (text) =>
//       (text || 'N/A')
//         .toString()
//         .trim()
//         .replace(/[^a-zA-Z0-9\s\-\/.,:%()&]/g, '');

//     doc.setTextColor(0, 0, 0);
//     doc.setFontSize(18);
//     doc.setFont('helvetica', 'bold');
//     doc.text('R.C.C Infrastructures', pageWidth / 2, 15, { align: 'center' });

//     doc.setFontSize(10);
//     doc.setFont('helvetica', 'normal');
//     doc.text('310 Saket Nagar, 9B Near Sagar Public School, Bhopal, 462026', pageWidth / 2, 22, { align: 'center' });
//     doc.text('Contact: 9753432126 | Email: mayank@rcinfrastructure.com', pageWidth / 2, 28, { align: 'center' });
//     doc.text('GST: 23ABHFR3130L1ZA', pageWidth / 2, 34, { align: 'center' });

//     doc.setFontSize(16);
//     doc.setFont('helvetica', 'bold');
//     doc.setTextColor(220, 53, 69);
//     doc.text('APPROVED QUOTATION', pageWidth / 2, 60, { align: 'center' });
//     doc.setDrawColor(220, 53, 69);
//     doc.setLineWidth(1);
//     doc.line(60, 63, pageWidth - 60, 63);
//     doc.setTextColor(0, 0, 0);

//     const currentDate = new Date()
//       .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
//       .replace(/ /g, '-');

//     const firstItem = approvedItems[0];
//     const firstRow = firstItem?.rowData || [];

//     const vendorFirm = safe(
//       firstItem?.vendor_firm_name ||
//       getValue(firstRow, qmColMap, ['vendorfirmname', 'vendorfermname']) ||
//       firstRow[9] ||
//       ''
//     );
//     const vendorAddress = safe(
//       getValue(firstRow, qmColMap, ['vendoraddress']) ||
//       firstRow[10] ||
//       ''
//     );
//     const vendorGST = safe(
//       getValue(firstRow, qmColMap, ['vendorgstno']) ||
//       firstRow[12] ||
//       ''
//     );

//     doc.setFontSize(10);
//     doc.setFont('helvetica', 'bold');
//     doc.text('Quotation No:', 15, 80);
//     doc.setFont('helvetica', 'normal');
//     doc.text(safe(quotationNo), 42, 80);

//     doc.setFont('helvetica', 'bold');
//     doc.text('Indent No:', 15, 88);
//     doc.setFont('helvetica', 'normal');
//     doc.text(safe(indentNo), 42, 88);

//     doc.setFont('helvetica', 'bold');
//     doc.text('Date:', 15, 96);
//     doc.setFont('helvetica', 'normal');
//     doc.text(currentDate, 42, 96);

//     doc.setFont('helvetica', 'bold');
//     doc.text('Vendor:', 120, 80);
//     doc.setFont('helvetica', 'normal');
//     doc.text(vendorFirm, 145, 80);

//     doc.setFont('helvetica', 'bold');
//     doc.text('Address:', 120, 88);
//     doc.setFont('helvetica', 'normal');
//     const addressLines = doc.splitTextToSize(vendorAddress, 55);
//     doc.text(addressLines, 145, 88);

//     doc.setFont('helvetica', 'bold');
//     doc.text('GST No:', 120, 96);
//     doc.setFont('helvetica', 'normal');
//     doc.text(vendorGST, 145, 96);

//     doc.setFontSize(12);
//     doc.setFont('helvetica', 'bold');
//     doc.setTextColor(220, 53, 69);
//     doc.text('Order Details', 15, 110);

//     const tableBody = approvedItems.map((item, index) => {
//       const row = item.rowData;
//       const uid = getValue(row, qmColMap, ['uid']);

//       const materialName = getValue(row, qmColMap, ['materialname', 'material_name']);
//       const materialSize = getValue(row, qmColMap, ['materialsize', 'material_size']);
//       const totalQty = getValue(row, qmColMap, ['totalquantity', 'total_quantity']);
//       const rate = getValue(row, qmColMap, ['rate']);
//       const cgst = getValue(row, qmColMap, ['cgst']);
//       const sgst = getValue(row, qmColMap, ['sgst']);
//       const igst = getValue(row, qmColMap, ['igst']);
//       const finalRate = getValue(row, qmColMap, ['finalrate', 'final_rate']);
//       const totalValue = getValue(row, qmColMap, ['totalvalue', 'total_value']);
//       const unit = unitMap.get(uid) || '';

//       return [
//         index + 1,
//         safe(materialName),
//         safe(materialSize),
//         safe(totalQty),
//         safe(unit),
//         safe(rate),
//         safe(cgst),
//         safe(sgst),
//         safe(igst),
//         safe(finalRate),
//         safe(totalValue),
//       ];
//     });

//     const totalItems = tableBody.length;
//     let tableFontSize = 8, headerFontSize = 9, cellPadding = 3;
//     if (totalItems > 15) { tableFontSize = 7; headerFontSize = 8; cellPadding = 2; }
//     else if (totalItems > 10) { tableFontSize = 7.5; headerFontSize = 8.5; cellPadding = 2.5; }

//     doc.autoTable({
//       head: [['Sr.', 'Material', 'Size', 'Qty', 'Unit', 'Rate', 'CGST', 'SGST', 'IGST', 'Final Rate', 'Total Value']],
//       body: tableBody,
//       startY: 115,
//       theme: 'grid',
//       styles: {
//         fontSize: tableFontSize, cellPadding, font: 'helvetica',
//         textColor: [0, 0, 0], lineColor: [200, 200, 200], lineWidth: 0.1,
//         overflow: 'linebreak', cellWidth: 'wrap',
//       },
//       headStyles: {
//         fillColor: [255, 255, 255], textColor: [0, 0, 0],
//         fontStyle: 'bold', fontSize: headerFontSize, halign: 'center',
//         cellPadding: cellPadding + 1,
//       },
//       columnStyles: {
//         0: { halign: 'center', cellWidth: 10 },
//         1: { cellWidth: 30 },
//         2: { halign: 'center', cellWidth: 15 },
//         3: { halign: 'center', cellWidth: 12 },
//         4: { halign: 'center', cellWidth: 12 },
//         5: { halign: 'right', cellWidth: 18 },
//         6: { halign: 'center', cellWidth: 13 },
//         7: { halign: 'center', cellWidth: 13 },
//         8: { halign: 'center', cellWidth: 13 },
//         9: { halign: 'right', cellWidth: 18 },
//         10: { halign: 'right', cellWidth: 22 },
//       },
//       alternateRowStyles: { fillColor: [245, 245, 245] },
//       margin: { top: 115, left: 15, right: 15 },
//       pageBreak: 'auto',
//       showHead: 'everyPage',
//     });

//     const tableEndY = doc.lastAutoTable?.finalY || 150;
//     const termsY = Math.max(tableEndY + 10, 200);

//     doc.setFontSize(12);
//     doc.setFont('helvetica', 'bold');
//     doc.setTextColor(220, 53, 69);
//     doc.text('Terms & Conditions', 15, termsY);

//     doc.setFontSize(10);
//     doc.setFont('helvetica', 'normal');
//     doc.setTextColor(0, 0, 0);

//     const paymentTerms = getValue(firstRow, qmColMap, [
//       'paymenttermscondistionadvacnecredit',
//       'paymenttermsconditionadvancecredit',
//     ]) || 'Credit (30 days)';

//     const transport = getValue(firstRow, qmColMap, ['istransportrequired']) || 'No';

//     doc.text(`Payment Terms: ${safe(paymentTerms)}`, 15, termsY + 10);
//     doc.text('Delivery: At site', 15, termsY + 18);
//     doc.text(`Transport: ${safe(transport)}`, 15, termsY + 26);

//     const footerY = Math.max(termsY + 40, pageHeight - 60);
//     doc.setFontSize(10);
//     doc.setFont('helvetica', 'bold');
//     doc.setTextColor(0, 0, 0);
//     doc.text('Authorized Signature', 15, footerY);
//     doc.setDrawColor(0, 0, 0);
//     doc.setLineWidth(0.5);
//     doc.line(15, footerY + 15, 80, footerY + 15);
//     doc.setFont('helvetica', 'normal');
//     doc.setFontSize(8);
//     doc.setTextColor(100, 100, 100);
//     doc.text(`Generated on: ${new Date().toLocaleString()}`, 15, footerY + 25);

//     doc.setDrawColor(41, 128, 185);
//     doc.setLineWidth(2);
//     doc.rect(5, 5, pageWidth - 10, pageHeight - 10);

//     const pdfBuffer = doc.output('arraybuffer');
//     const base64Data = Buffer.from(pdfBuffer).toString('base64');
//     return `data:application/pdf;base64,${base64Data}`;
//   } catch (pdfError) {
//     console.error('❌ PDF error:', pdfError.message);
//     throw new Error(`PDF generation failed: ${pdfError.message}`);
//   }
// };

// // ─── UPDATE APPROVAL ─────────────────────────────────────
// router.post('/update-approval', async (req, res) => {
//   console.log('\n========== UPDATE APPROVAL START ==========');
//   const { approvals, status, autoRejectOthers, selectedVendor } = req.body;

//   if (!approvals || !Array.isArray(approvals) || approvals.length === 0) {
//     return res.status(400).json({ error: 'No approvals provided' });
//   }

//   if (!status) {
//     return res.status(400).json({ error: 'Status is required' });
//   }

//   const normalizedStatus = status.toString().trim().toLowerCase();
//   if (!['approved', 'rejected'].includes(normalizedStatus)) {
//     return res.status(400).json({ error: 'Status must be approved or rejected' });
//   }

//   try {
//     const isApproved = normalizedStatus === 'approved';

//     if (isApproved) {
//       if (!drive || !drive.files) throw new Error('Google Drive not initialized');
//       if (!process.env.GOOGLE_DRIVE_FOLDER_ID) throw new Error('GOOGLE_DRIVE_FOLDER_ID not set');
//     }

//     const qmRes = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Quotation_Master!A1:AK',
//     });

//     const allRows = qmRes.data.values || [];
//     if (!allRows.length) {
//       return res.status(404).json({ error: 'Quotation_Master empty' });
//     }

//     const headers = allRows[0] || [];
//     const qmRows = allRows.slice(1);
//     const colMap = buildColMap(headers);

//     const UID_COL = getHeaderIndex(colMap, ['uid']);
//     const INDENT_COL = getHeaderIndex(colMap, ['indentno', 'indent_no']);
//     const VENDOR_COL = getHeaderIndex(colMap, ['vendorfirmname', 'vendorfermname']);
//     const APPROVAL_COL = getHeaderIndex(colMap, ['approvalstatus']);
//     const APPROVED_QUO_COL = getHeaderIndex(colMap, ['approvedquotation', 'approvedquotationno']);
//     const PDF_COL_FROM_HEADER = getHeaderIndex(colMap, ['pdf5', 'pdfurl', 'pdfurl5']);
//     const FINAL_PDF_COL = PDF_COL_FROM_HEADER !== -1 ? PDF_COL_FROM_HEADER : 35;

//     if (UID_COL === -1 || INDENT_COL === -1 || VENDOR_COL === -1 || APPROVAL_COL === -1) {
//       return res.status(500).json({
//         error: 'Required columns not found',
//         debug: { UID_COL, INDENT_COL, VENDOR_COL, APPROVAL_COL }
//       });
//     }

//     let approvalCounter = 0;
//     try {
//       let maxNum = 0;
//       qmRows.forEach((row) => {
//         row.forEach((cell) => {
//           const match = (cell || '').toString().match(/FQUOT_(\d+)/i);
//           if (match) {
//             const num = parseInt(match[1], 10);
//             if (num > maxNum) maxNum = num;
//           }
//         });
//       });
//       approvalCounter = maxNum;
//     } catch (err) {
//       approvalCounter = 0;
//     }

//     const padNum = (n, size) => n.toString().padStart(size, '0');
//     const genApprovalNo = (counter) => `FQUOT_${padNum(counter, 2)}`;

//     const indentNoMap = new Map();
//     const matchedRows = [];

//     qmRows.forEach((row, index) => {
//       const uid = (row[UID_COL] || '').toString().trim();
//       const vendorFirm = (row[VENDOR_COL] || '').toString().trim();
//       const indentNo = (row[INDENT_COL] || '').toString().trim();
//       const approvalStatus = (row[APPROVAL_COL] || '').toString().trim().toLowerCase();

//       if (['approved', 'rejected'].includes(approvalStatus)) return;

//       const match = approvals.some(
//         (a) =>
//           (a.uid || '').toString().trim() === uid &&
//           (a.vendor_firm_name || '').toString().trim() === vendorFirm
//       );

//       if (!match) return;

//       let quotationNo = '';
//       if (isApproved) {
//         if (!indentNoMap.has(indentNo)) {
//           approvalCounter += 1;
//           indentNoMap.set(indentNo, genApprovalNo(approvalCounter));
//         }
//         quotationNo = indentNoMap.get(indentNo);
//       }

//       matchedRows.push({
//         uid,
//         vendor_firm_name: vendorFirm,
//         indentNo,
//         quotationNo,
//         rowData: row,
//         rowIndex: index + 2,
//       });
//     });

//     if (!matchedRows.length) {
//       return res.status(404).json({
//         error: 'No matching quotations found',
//         details: 'None of the selected combinations exist in pending rows',
//       });
//     }

//     const autoRejectRows = [];
//     if (isApproved && autoRejectOthers && selectedVendor) {
//       const approvedUIDs = new Set(matchedRows.map((m) => m.uid));
//       const matchedIndent = matchedRows[0]?.indentNo;

//       qmRows.forEach((row, index) => {
//         const uid = (row[UID_COL] || '').toString().trim();
//         const vendorFirm = (row[VENDOR_COL] || '').toString().trim();
//         const indentNo = (row[INDENT_COL] || '').toString().trim();
//         const approvalStatus = (row[APPROVAL_COL] || '').toString().trim().toLowerCase();

//         if (['approved', 'rejected'].includes(approvalStatus)) return;
//         if (indentNo !== matchedIndent) return;

//         if (approvedUIDs.has(uid) && vendorFirm !== selectedVendor) {
//           autoRejectRows.push({
//             uid,
//             vendor_firm_name: vendorFirm,
//             indentNo,
//             rowIndex: index + 2,
//           });
//         }
//       });
//     }

//     const pdfUrlsByIndent = {};
//     const pdfErrors = [];

//     if (isApproved) {
//       const indentGroups = {};
//       matchedRows.forEach((item) => {
//         if (!indentGroups[item.indentNo]) indentGroups[item.indentNo] = [];
//         indentGroups[item.indentNo].push(item);
//       });

//       for (const [indentNo, group] of Object.entries(indentGroups)) {
//         try {
//           const quotationNo = indentNoMap.get(indentNo);
//           const pdfDataUri = await generateQuotationPDF(group, quotationNo, indentNo, headers);

//           const base64Data = pdfDataUri.replace('data:application/pdf;base64,', '');
//           const pdfBuffer = Buffer.from(base64Data, 'base64');
//           const { Readable } = require('stream');

//           const fileName = `quotation_${quotationNo}_${indentNo}_${Date.now()}.pdf`;

//           const file = await drive.files.create({
//             resource: {
//               name: fileName,
//               parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
//               mimeType: 'application/pdf',
//             },
//             media: {
//               mimeType: 'application/pdf',
//               body: Readable.from(pdfBuffer),
//             },
//             fields: 'id, webViewLink',
//             supportsAllDrives: true,
//           });

//           await drive.permissions.create({
//             fileId: file.data.id,
//             requestBody: { role: 'reader', type: 'anyone' },
//             supportsAllDrives: true,
//           });

//           pdfUrlsByIndent[indentNo] = file.data.webViewLink;
//         } catch (err) {
//           console.error(`❌ PDF error for ${indentNo}:`, err.message);
//           pdfErrors.push({ indentNo, error: err.message });
//         }
//       }
//     }

//     const approvalColLetter = getColLetter(APPROVAL_COL);
//     const approvedQuoColLetter = APPROVED_QUO_COL >= 0 ? getColLetter(APPROVED_QUO_COL) : null;
//     const pdfColLetter = getColLetter(FINAL_PDF_COL);

//     const qmUpdates = [];

//     for (const item of matchedRows) {
//       const sheetRow = item.rowIndex;
//       const pdfUrl = isApproved ? (pdfUrlsByIndent[item.indentNo] || '') : '';

//       qmUpdates.push({
//         range: `Quotation_Master!${approvalColLetter}${sheetRow}`,
//         values: [[isApproved ? 'Approved' : 'Rejected']],
//       });

//       if (approvedQuoColLetter) {
//         qmUpdates.push({
//           range: `Quotation_Master!${approvedQuoColLetter}${sheetRow}`,
//           values: [[isApproved ? item.quotationNo : '']],
//         });
//       }

//       if (isApproved) {
//         qmUpdates.push({
//           range: `Quotation_Master!${pdfColLetter}${sheetRow}`,
//           values: [[pdfUrl]],
//         });
//       }
//     }

//     for (const item of autoRejectRows) {
//       qmUpdates.push({
//         range: `Quotation_Master!${approvalColLetter}${item.rowIndex}`,
//         values: [['Rejected']],
//       });
//     }

//     if (qmUpdates.length > 0) {
//       await sheets.spreadsheets.values.batchUpdate({
//         spreadsheetId,
//         requestBody: {
//           data: qmUpdates,
//           valueInputOption: 'USER_ENTERED',
//         },
//       });
//     }

//     let purchaseUpdatedCount = 0;

//     if (isApproved) {
//       const pfRes = await sheets.spreadsheets.values.get({
//         spreadsheetId,
//         range: 'Purchase_FMS!A2:B',
//       });

//       const pfRows = pfRes.data.values || [];
//       const uidToRowMap = new Map();
//       pfRows.forEach((row, i) => {
//         const uid = (row[1] || '').trim();
//         if (uid) uidToRowMap.set(uid, i + 2);
//       });

//       const pfUpdates = [];

//       for (const item of matchedRows) {
//         const sheetRow = uidToRowMap.get(item.uid);
//         if (!sheetRow) continue;

//         const r = item.rowData;

//         const vendorName = getValue(r, colMap, ['vendorname']);
//         const vendorFirm = getValue(r, colMap, ['vendorfirmname', 'vendorfermname']);
//         const vendorAddr = getValue(r, colMap, ['vendoraddress']);
//         const contact = getValue(r, colMap, ['contactnumber']);
//         const gst = getValue(r, colMap, ['vendorgstno']);
//         const rate = getValue(r, colMap, ['rate']);
//         const discount = getValue(r, colMap, ['discount']);
//         const cgst = getValue(r, colMap, ['cgst']);
//         const sgst = getValue(r, colMap, ['sgst']);
//         const igst = getValue(r, colMap, ['igst']);
//         const finalRate = getValue(r, colMap, ['finalrate']);
//         const totalValue = getValue(r, colMap, ['totalvalue']);
//         const transport = getValue(r, colMap, ['istransportrequired']);
//         const transportCharges = getValue(r, colMap, ['expectedtransportcharges']);
//         const freight = getValue(r, colMap, ['frighetcharges']);
//         const expFreight = getValue(r, colMap, ['expectedfrighetcharges']);
//         const brandName = getValue(r, colMap, ['brandname4', 'remark4']);
//         const pdfUrl = pdfUrlsByIndent[item.indentNo] || '';

//         const step5Values = [
//           'Done',             // BB
//           '',                 // BC
//           item.quotationNo,   // BD
//           vendorName,         // BE
//           vendorFirm,         // BF
//           vendorAddr,         // BG
//           contact,            // BH
//           gst,                // BI
//           rate,               // BJ
//           discount,           // BK
//           cgst,               // BL
//           sgst,               // BM
//           igst,               // BN
//           finalRate,          // BO
//           totalValue,         // BP
//           'Approved',         // BQ
//           transport,          // BR
//           transportCharges,   // BS
//           freight,            // BT
//           expFreight,         // BU
//           pdfUrl,             // BV
//           brandName,          // BW
//         ];

//         pfUpdates.push({
//           range: `Purchase_FMS!BB${sheetRow}:BW${sheetRow}`,
//           values: [step5Values],
//         });

//         purchaseUpdatedCount += 1;
//       }

//       if (pfUpdates.length) {
//         await sheets.spreadsheets.values.batchUpdate({
//           spreadsheetId,
//           requestBody: { data: pfUpdates, valueInputOption: 'USER_ENTERED' },
//         });
//       }
//     }

//     invalidateQuotationCache();

//     return res.json({
//       success: true,
//       message: `Approved ${matchedRows.length} item(s). Auto-rejected ${autoRejectRows.length} duplicate(s) from other vendors.`,
//       details: {
//         totalSelections: approvals.length,
//         matched: matchedRows.length,
//         autoRejected: autoRejectRows.length,
//         pdfsGenerated: Object.keys(pdfUrlsByIndent).length,
//         purchaseFmsUpdated: purchaseUpdatedCount,
//         indents: Array.from(indentNoMap.keys()),
//         approvedItems: matchedRows.map((item) => ({
//           uid: item.uid,
//           vendor: item.vendor_firm_name,
//           indent: item.indentNo,
//           quotationNo: item.quotationNo,
//           pdfUrl: pdfUrlsByIndent[item.indentNo] || '',
//         })),
//         rejectedItems: autoRejectRows.map((item) => ({
//           uid: item.uid,
//           vendor: item.vendor_firm_name,
//         })),
//       },
//       pdfUrls: pdfUrlsByIndent,
//       errors: pdfErrors.length ? pdfErrors : undefined,
//     });
//   } catch (error) {
//     console.error('\n❌ ERROR:', error.message);
//     return res.status(500).json({ error: 'Failed: ' + error.message });
//   }
// });

// module.exports = router;





const express = require('express');
const { sheets, spreadsheetId, drive } = require('../config/googleSheet');
require('dotenv').config();
const router = express.Router();
const { jsPDF } = require('jspdf');

try {
  require('jspdf-autotable');
  console.log('jspdf-autotable loaded');
} catch (err) {
  try {
    const autoTable = require('jspdf-autotable').default;
    autoTable(jsPDF);
  } catch (err2) {
    try {
      const jspdfAutoTable = require('jspdf-autotable');
      jspdfAutoTable.default(jsPDF);
    } catch (err3) {
      console.error('Failed to load jspdf-autotable:', err3.message);
      throw new Error('jspdf-autotable could not be loaded');
    }
  }
}

// ─── HELPERS ─────────────────────────────────────────────
const cleanKey = (v = '') =>
  v.toString().trim().toLowerCase().replace(/[\s_.\/()-]/g, '');

const buildColMap = (headers = []) => {
  const map = {};
  headers.forEach((h, i) => {
    map[cleanKey(h)] = i;
  });
  return map;
};

const getHeaderIndex = (colMap, possibleKeys = []) => {
  for (const key of possibleKeys) {
    const idx = colMap[cleanKey(key)];
    if (idx !== undefined) return idx;
  }
  return -1;
};

const getValue = (row, colMap, possibleKeys = []) => {
  const idx = getHeaderIndex(colMap, possibleKeys);
  return idx !== -1 ? (row[idx] || '').toString().trim() : '';
};

const getColLetter = (idx) => {
  let letter = '';
  let num = idx;
  while (num >= 0) {
    letter = String.fromCharCode(65 + (num % 26)) + letter;
    num = Math.floor(num / 26) - 1;
  }
  return letter;
};

// ─── CACHE ──────────────────────────────────────────────
let quotationCache = { ts: 0, headers: [], rows: [] };
const CACHE_TTL = 30 * 1000;

const invalidateQuotationCache = () => {
  quotationCache = { ts: 0, headers: [], rows: [] };
};

const getQuotationMasterSheet = async (force = false) => {
  const now = Date.now();
  if (!force && quotationCache.rows.length && now - quotationCache.ts < CACHE_TTL) {
    return quotationCache;
  }
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Quotation_Master!A1:AL',  // 🆕 Updated range to AL to include Vendor_Remark
  });
  const allRows = response.data.values || [];
  quotationCache = {
    ts: now,
    headers: allRows[0] || [],
    rows: allRows.slice(1),
  };
  return quotationCache;
};

const mapQuotationRow = (row, colMap) => {
  if (!row || row.every((c) => !c || c.toString().trim() === '')) return null;

  const approvalStatus = getValue(row, colMap, ['approvalstatus']);
  if (['approved', 'rejected'].includes(approvalStatus.toLowerCase())) {
    return null;
  }

  const finalRemarkIdx = getHeaderIndex(colMap, ['finalremark', 'final_remark', 'remark']);
  const finalRemarkVal = finalRemarkIdx !== -1 
    ? (row[finalRemarkIdx] || '').toString().trim() 
    : (row[36] || '').toString().trim(); // Fallback to Index 36 (AK)

  return {
    Time_Stamp: getValue(row, colMap, ['timestamp']),
    Req_No: getValue(row, colMap, ['reqno']),
    UID: getValue(row, colMap, ['uid']),
    site_name: getValue(row, colMap, ['sitename', 'site_name']),
    Indent_No: getValue(row, colMap, ['indentno', 'indent_no']),
    Material_name: getValue(row, colMap, ['materialname', 'material_name']),
    Material_Size: getValue(row, colMap, ['materialsize', 'material_size']),
    Material_Specification: getValue(row, colMap, ['materialspecification']),
    Vendor_Name: getValue(row, colMap, ['vendorname']),
    Vendor_Ferm_Name: getValue(row, colMap, ['vendorfirmname', 'vendorfermname']),
    Vendor_Address: getValue(row, colMap, ['vendoraddress']),
    Contact_Number: getValue(row, colMap, ['contactnumber']),
    Vendor_GST_No: getValue(row, colMap, ['vendorgstno']),
    RATE: getValue(row, colMap, ['rate']),
    Discount: getValue(row, colMap, ['discount']),
    CGST: getValue(row, colMap, ['cgst']),
    SGST: getValue(row, colMap, ['sgst']),
    IGST: getValue(row, colMap, ['igst']),
    Final_Rate: getValue(row, colMap, ['finalrate']),
    Delivery_Expected_Date: getValue(row, colMap, ['deliveryexpecteddate']),
    Payment_Terms_Condition_Advance_Credit: getValue(row, colMap, [
      'paymenttermscondistionadvacnecredit',
      'paymenttermsconditionadvancecredit',
    ]),
    Credit_in_Days: getValue(row, colMap, ['creditinday', 'creditindays']),
    Bill_Type: getValue(row, colMap, ['billtype']),
    IS_TRANSPORT_REQUIRED: getValue(row, colMap, ['istransportrequired']),
    EXPECTED_TRANSPORT_CHARGES: getValue(row, colMap, ['expectedtransportcharges']),
    FRIGHET_CHARGES: getValue(row, colMap, ['frighetcharges', 'freightcharges']),
    EXPECTED_FRIGHET_CHARGES: getValue(row, colMap, ['expectedfrighetcharges']),
    Status: getValue(row, colMap, ['status']),
    No_Of_Quotation_4: getValue(row, colMap, ['noofquotation4']),
    Remark_4: getValue(row, colMap, ['brandname4', 'remark4']),
    Quotation_No: getValue(row, colMap, ['quotationno']),
    Total_Quantity: getValue(row, colMap, ['totalquantity']),
    Total_Value: getValue(row, colMap, ['totalvalue']),
    Approval_Status: approvalStatus,
    Final_Remark: finalRemarkVal, 
    Vendor_Remark: getValue(row, colMap, ['vendorremark']) || (row[37] || '').toString().trim(), // 🆕 Extracting Vendor Remark from AL (index 37)
  };
};

const getMappedQuotationRows = async (indentNo = '', force = false) => {
  const { headers, rows } = await getQuotationMasterSheet(force);
  const colMap = buildColMap(headers);

  return rows
    .map((row) => mapQuotationRow(row, colMap))
    .filter(Boolean)
    .filter((item) => (indentNo ? item.Indent_No === indentNo : true))
    .sort((a, b) => {
      const uidSort = (a.UID || '').localeCompare(b.UID || '');
      if (uidSort !== 0) return uidSort;
      const rateA = parseFloat(a.Final_Rate) || Infinity;
      const rateB = parseFloat(b.Final_Rate) || Infinity;
      if (rateA !== rateB) return rateA - rateB;
      return (a.Vendor_Ferm_Name || '').localeCompare(b.Vendor_Ferm_Name || '');
    });
};


// ─── GET APPROVAL QUOTATION (Purchase_FMS) ──────────────
router.get('/get-approval-Quotation', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Purchase_FMS!A2:BZ',
    });

    const rows = response.data.values || [];
    console.log('Purchase_FMS rows:', rows.length);

    if (!rows.length) {
      return res.json({ data: [] });
    }

    const STATUS_4_IDX = 44;   // AS - Status 4
    const PLANNED_5_IDX = 51;  // AZ - Planned 5
    const ACTUAL_5_IDX = 52;   // BA - Actual 5
    const STATUS_5_IDX = 53;   // BB - Status 5

    let skipped = {
      empty: 0,
      noStatus4: 0,
      hasStatus5: 0,
      hasActual5: 0,
    };

    const formData = rows
      .map((row, index) => {
        if (!row || row.every((c) => !c || c.trim() === '')) {
          skipped.empty++;
          return null;
        }

        const status4 = (row[STATUS_4_IDX] || '').trim();
        const planned5 = (row[PLANNED_5_IDX] || '').trim();
        const actual5 = (row[ACTUAL_5_IDX] || '').trim();
        const status5 = (row[STATUS_5_IDX] || '').trim();

        if (!status4) { skipped.noStatus4++; return null; }
        if (status5) { skipped.hasStatus5++; return null; }
        if (actual5) { skipped.hasActual5++; return null; }
      

        return {
          UID: (row[1] || '').trim(),
          Req_No: (row[2] || '').trim(),
          Site_Name: (row[3] || '').trim(),
          Supervisor_Name: (row[4] || '').trim(),
          Material_Type: (row[5] || '').trim(),
          Material_Name: (row[6] || '').trim(),
          Material_Size: (row[7] || '').trim(),
          Specification: (row[8] || '').trim(),
          SKU_Code: (row[10] || '').trim(),
          Quantity: (row[11] || '').trim(),
          Unit_Name: (row[12] || '').trim(),
          Purpose: (row[13] || '').trim(),
          Require_Date: (row[14] || '').trim(),
          REVISED_QUANTITY_2: (row[24] || '').trim(),
          'DECIDED_BRAND/COMPANY_NAME_2': (row[25] || '').trim(),
          INDENT_NUMBER_3: (row[36] || '').trim(),
          PDF_URL_3: (row[37] || '').trim(),
          No_Of_Quotation_4: (row[46] || '').trim(),
          REMARK_4: (row[47] || '').trim(),
          PLANNED_5: planned5,
          _rowIndex: index + 2,
        };
      })
      .filter(Boolean);

    console.log('=== FILTER SUMMARY ===');
    console.log('Total rows:', rows.length);
    console.log('Empty:', skipped.empty);
    console.log('No Status 4:', skipped.noStatus4);
    console.log('Has Status 5:', skipped.hasStatus5);
    console.log('Has Actual 5:', skipped.hasActual5);
    console.log('✅ Pending approvals:', formData.length);

    return res.json({ data: formData });
  } catch (error) {
    console.error('❌ Error:', error.message);
    return res.status(500).json({
      error: 'Failed to fetch data',
      details: error.message,
    });
  }
});

// ─── INDENT LIST ─────────────────────────────────────────
router.get('/get-quotation-indents', async (req, res) => {
  try {
    const data = await getMappedQuotationRows();
    const indentNumbers = [...new Set(data.map((item) => item.Indent_No).filter(Boolean))];
    return res.json({ data: indentNumbers });
  } catch (error) {
    console.error('Indent error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch indent numbers', details: error.message });
  }
});

// ─── ONE INDENT DATA ─────────────────────────────────────
router.get('/get-quotation-by-indent', async (req, res) => {
  try {
    const { indentNo } = req.query;
    if (!indentNo) return res.status(400).json({ error: 'indentNo is required' });
    const data = await getMappedQuotationRows(indentNo);
    return res.json({ data });
  } catch (error) {
    console.error('Indent detail error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch quotation data', details: error.message });
  }
});

// ─── GENERATE PDF ────────────────────────────────────────
const generateQuotationPDF = async (approvedItems, quotationNo, indentNo, qmHeaders = []) => {
  console.log(`\n📄 Generating PDF: Quotation ${quotationNo}, Indent ${indentNo}, Items: ${approvedItems.length}`);

  try {
    const qmColMap = buildColMap(qmHeaders);

    const unitMap = new Map();
    const fmsRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Purchase_FMS!A2:M',
    });

    const fmsRows = fmsRes.data.values || [];
    fmsRows.forEach((row) => {
      const uid = (row[1] || '').trim();
      const unit = (row[12] || '').trim();
      if (uid) unitMap.set(uid, unit);
    });

    const doc = new jsPDF();
    if (typeof doc.autoTable !== 'function') {
      throw new Error('autoTable not loaded');
    }

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const safe = (text) =>
      (text || 'N/A')
        .toString()
        .trim()
        .replace(/[^a-zA-Z0-9\s\-\/.,:%()&]/g, '');

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('R.C.C Infrastructures', pageWidth / 2, 15, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('310 Saket Nagar, 9B Near Sagar Public School, Bhopal, 462026', pageWidth / 2, 22, { align: 'center' });
    doc.text('Contact: 9753432126 | Email: mayank@rcinfrastructure.com', pageWidth / 2, 28, { align: 'center' });
    doc.text('GST: 23ABHFR3130L1ZA', pageWidth / 2, 34, { align: 'center' });

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 53, 69);
    doc.text('APPROVED QUOTATION', pageWidth / 2, 60, { align: 'center' });
    doc.setDrawColor(220, 53, 69);
    doc.setLineWidth(1);
    doc.line(60, 63, pageWidth - 60, 63);
    doc.setTextColor(0, 0, 0);

    const currentDate = new Date()
      .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      .replace(/ /g, '-');

    const firstItem = approvedItems[0];
    const firstRow = firstItem?.rowData || [];

    const vendorFirm = safe(
      firstItem?.vendor_firm_name ||
      getValue(firstRow, qmColMap, ['vendorfirmname', 'vendorfermname']) ||
      firstRow[9] ||
      ''
    );
    const vendorAddress = safe(
      getValue(firstRow, qmColMap, ['vendoraddress']) ||
      firstRow[10] ||
      ''
    );
    const vendorGST = safe(
      getValue(firstRow, qmColMap, ['vendorgstno']) ||
      firstRow[12] ||
      ''
    );

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Quotation No:', 15, 80);
    doc.setFont('helvetica', 'normal');
    doc.text(safe(quotationNo), 42, 80);

    doc.setFont('helvetica', 'bold');
    doc.text('Indent No:', 15, 88);
    doc.setFont('helvetica', 'normal');
    doc.text(safe(indentNo), 42, 88);

    doc.setFont('helvetica', 'bold');
    doc.text('Date:', 15, 96);
    doc.setFont('helvetica', 'normal');
    doc.text(currentDate, 42, 96);

    doc.setFont('helvetica', 'bold');
    doc.text('Vendor:', 120, 80);
    doc.setFont('helvetica', 'normal');
    doc.text(vendorFirm, 145, 80);

    doc.setFont('helvetica', 'bold');
    doc.text('Address:', 120, 88);
    doc.setFont('helvetica', 'normal');
    const addressLines = doc.splitTextToSize(vendorAddress, 55);
    doc.text(addressLines, 145, 88);

    doc.setFont('helvetica', 'bold');
    doc.text('GST No:', 120, 96);
    doc.setFont('helvetica', 'normal');
    doc.text(vendorGST, 145, 96);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 53, 69);
    doc.text('Order Details', 15, 110);

    const tableBody = approvedItems.map((item, index) => {
      const row = item.rowData;
      const uid = getValue(row, qmColMap, ['uid']);

      const materialName = getValue(row, qmColMap, ['materialname', 'material_name']);
      const materialSize = getValue(row, qmColMap, ['materialsize', 'material_size']);
      const totalQty = getValue(row, qmColMap, ['totalquantity', 'total_quantity']);
      const rate = getValue(row, qmColMap, ['rate']);
      const cgst = getValue(row, qmColMap, ['cgst']);
      const sgst = getValue(row, qmColMap, ['sgst']);
      const igst = getValue(row, qmColMap, ['igst']);
      const finalRate = getValue(row, qmColMap, ['finalrate', 'final_rate']);
      const totalValue = getValue(row, qmColMap, ['totalvalue', 'total_value']);
      const unit = unitMap.get(uid) || '';

      return [
        index + 1,
        safe(materialName),
        safe(materialSize),
        safe(totalQty),
        safe(unit),
        safe(rate),
        safe(cgst),
        safe(sgst),
        safe(igst),
        safe(finalRate),
        safe(totalValue),
      ];
    });

    const totalItems = tableBody.length;
    let tableFontSize = 8, headerFontSize = 9, cellPadding = 3;
    if (totalItems > 15) { tableFontSize = 7; headerFontSize = 8; cellPadding = 2; }
    else if (totalItems > 10) { tableFontSize = 7.5; headerFontSize = 8.5; cellPadding = 2.5; }

    doc.autoTable({
      head: [['Sr.', 'Material', 'Size', 'Qty', 'Unit', 'Rate', 'CGST', 'SGST', 'IGST', 'Final Rate', 'Total Value']],
      body: tableBody,
      startY: 115,
      theme: 'grid',
      styles: {
        fontSize: tableFontSize, cellPadding, font: 'helvetica',
        textColor: [0, 0, 0], lineColor: [200, 200, 200], lineWidth: 0.1,
        overflow: 'linebreak', cellWidth: 'wrap',
      },
      headStyles: {
        fillColor: [255, 255, 255], textColor: [0, 0, 0],
        fontStyle: 'bold', fontSize: headerFontSize, halign: 'center',
        cellPadding: cellPadding + 1,
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        1: { cellWidth: 30 },
        2: { halign: 'center', cellWidth: 15 },
        3: { halign: 'center', cellWidth: 12 },
        4: { halign: 'center', cellWidth: 12 },
        5: { halign: 'right', cellWidth: 18 },
        6: { halign: 'center', cellWidth: 13 },
        7: { halign: 'center', cellWidth: 13 },
        8: { halign: 'center', cellWidth: 13 },
        9: { halign: 'right', cellWidth: 18 },
        10: { halign: 'right', cellWidth: 22 },
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: 115, left: 15, right: 15 },
      pageBreak: 'auto',
      showHead: 'everyPage',
    });

    const tableEndY = doc.lastAutoTable?.finalY || 150;
    const termsY = Math.max(tableEndY + 10, 200);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 53, 69);
    doc.text('Terms & Conditions', 15, termsY);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);

    const paymentTerms = getValue(firstRow, qmColMap, [
      'paymenttermscondistionadvacnecredit',
      'paymenttermsconditionadvancecredit',
    ]) || 'Credit (30 days)';

    const transport = getValue(firstRow, qmColMap, ['istransportrequired']) || 'No';

    doc.text(`Payment Terms: ${safe(paymentTerms)}`, 15, termsY + 10);
    doc.text('Delivery: At site', 15, termsY + 18);
    doc.text(`Transport: ${safe(transport)}`, 15, termsY + 26);

    const footerY = Math.max(termsY + 40, pageHeight - 60);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Authorized Signature', 15, footerY);
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(15, footerY + 15, 80, footerY + 15);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 15, footerY + 25);

    doc.setDrawColor(41, 128, 185);
    doc.setLineWidth(2);
    doc.rect(5, 5, pageWidth - 10, pageHeight - 10);

    const pdfBuffer = doc.output('arraybuffer');
    const base64Data = Buffer.from(pdfBuffer).toString('base64');
    return `data:application/pdf;base64,${base64Data}`;
  } catch (pdfError) {
    console.error('❌ PDF error:', pdfError.message);
    throw new Error(`PDF generation failed: ${pdfError.message}`);
  }
};

// ─── UPDATE APPROVAL ─────────────────────────────────────
router.post('/update-approval', async (req, res) => {
  console.log('\n========== UPDATE APPROVAL START ==========');
  // 🆕 ADDED approvalRemark in destructuring
  const { approvals, status, autoRejectOthers, selectedVendor, approvalRemark } = req.body; 

  if (!approvals || !Array.isArray(approvals) || approvals.length === 0) {
    return res.status(400).json({ error: 'No approvals provided' });
  }

  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  const normalizedStatus = status.toString().trim().toLowerCase();
  if (!['approved', 'rejected'].includes(normalizedStatus)) {
    return res.status(400).json({ error: 'Status must be approved or rejected' });
  }

  try {
    const isApproved = normalizedStatus === 'approved';

    if (isApproved) {
      if (!drive || !drive.files) throw new Error('Google Drive not initialized');
      if (!process.env.GOOGLE_DRIVE_FOLDER_ID) throw new Error('GOOGLE_DRIVE_FOLDER_ID not set');
    }

    const qmRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Quotation_Master!A1:AL', // Fetch up to AL
    });

    const allRows = qmRes.data.values || [];
    if (!allRows.length) {
      return res.status(404).json({ error: 'Quotation_Master empty' });
    }

    const headers = allRows[0] || [];
    const qmRows = allRows.slice(1);
    const colMap = buildColMap(headers);

    const UID_COL = getHeaderIndex(colMap, ['uid']);
    const INDENT_COL = getHeaderIndex(colMap, ['indentno', 'indent_no']);
    const VENDOR_COL = getHeaderIndex(colMap, ['vendorfirmname', 'vendorfermname']);
    const APPROVAL_COL = getHeaderIndex(colMap, ['approvalstatus']);
    const APPROVED_QUO_COL = getHeaderIndex(colMap, ['approvedquotation', 'approvedquotationno']);
    const PDF_COL_FROM_HEADER = getHeaderIndex(colMap, ['pdf5', 'pdfurl', 'pdfurl5']);
    const FINAL_PDF_COL = PDF_COL_FROM_HEADER !== -1 ? PDF_COL_FROM_HEADER : 35;

    if (UID_COL === -1 || INDENT_COL === -1 || VENDOR_COL === -1 || APPROVAL_COL === -1) {
      return res.status(500).json({
        error: 'Required columns not found',
        debug: { UID_COL, INDENT_COL, VENDOR_COL, APPROVAL_COL }
      });
    }

    let approvalCounter = 0;
    try {
      let maxNum = 0;
      qmRows.forEach((row) => {
        row.forEach((cell) => {
          const match = (cell || '').toString().match(/FQUOT_(\d+)/i);
          if (match) {
            const num = parseInt(match[1], 10);
            if (num > maxNum) maxNum = num;
          }
        });
      });
      approvalCounter = maxNum;
    } catch (err) {
      approvalCounter = 0;
    }

    const padNum = (n, size) => n.toString().padStart(size, '0');
    const genApprovalNo = (counter) => `FQUOT_${padNum(counter, 2)}`;

    const indentNoMap = new Map();
    const matchedRows = [];

    qmRows.forEach((row, index) => {
      const uid = (row[UID_COL] || '').toString().trim();
      const vendorFirm = (row[VENDOR_COL] || '').toString().trim();
      const indentNo = (row[INDENT_COL] || '').toString().trim();
      const approvalStatus = (row[APPROVAL_COL] || '').toString().trim().toLowerCase();

      if (['approved', 'rejected'].includes(approvalStatus)) return;

      const match = approvals.some(
        (a) =>
          (a.uid || '').toString().trim() === uid &&
          (a.vendor_firm_name || '').toString().trim() === vendorFirm
      );

      if (!match) return;

      let quotationNo = '';
      if (isApproved) {
        if (!indentNoMap.has(indentNo)) {
          approvalCounter += 1;
          indentNoMap.set(indentNo, genApprovalNo(approvalCounter));
        }
        quotationNo = indentNoMap.get(indentNo);
      }

      matchedRows.push({
        uid,
        vendor_firm_name: vendorFirm,
        indentNo,
        quotationNo,
        rowData: row,
        rowIndex: index + 2,
      });
    });

    if (!matchedRows.length) {
      return res.status(404).json({
        error: 'No matching quotations found',
        details: 'None of the selected combinations exist in pending rows',
      });
    }

    const autoRejectRows = [];
    if (isApproved && autoRejectOthers && selectedVendor) {
      const approvedUIDs = new Set(matchedRows.map((m) => m.uid));
      const matchedIndent = matchedRows[0]?.indentNo;

      qmRows.forEach((row, index) => {
        const uid = (row[UID_COL] || '').toString().trim();
        const vendorFirm = (row[VENDOR_COL] || '').toString().trim();
        const indentNo = (row[INDENT_COL] || '').toString().trim();
        const approvalStatus = (row[APPROVAL_COL] || '').toString().trim().toLowerCase();

        if (['approved', 'rejected'].includes(approvalStatus)) return;
        if (indentNo !== matchedIndent) return;

        if (approvedUIDs.has(uid) && vendorFirm !== selectedVendor) {
          autoRejectRows.push({
            uid,
            vendor_firm_name: vendorFirm,
            indentNo,
            rowIndex: index + 2,
          });
        }
      });
    }

    const pdfUrlsByIndent = {};
    const pdfErrors = [];

    if (isApproved) {
      const indentGroups = {};
      matchedRows.forEach((item) => {
        if (!indentGroups[item.indentNo]) indentGroups[item.indentNo] = [];
        indentGroups[item.indentNo].push(item);
      });

      for (const [indentNo, group] of Object.entries(indentGroups)) {
        try {
          const quotationNo = indentNoMap.get(indentNo);
          const pdfDataUri = await generateQuotationPDF(group, quotationNo, indentNo, headers);

          const base64Data = pdfDataUri.replace('data:application/pdf;base64,', '');
          const pdfBuffer = Buffer.from(base64Data, 'base64');
          const { Readable } = require('stream');

          const fileName = `quotation_${quotationNo}_${indentNo}_${Date.now()}.pdf`;

          const file = await drive.files.create({
            resource: {
              name: fileName,
              parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
              mimeType: 'application/pdf',
            },
            media: {
              mimeType: 'application/pdf',
              body: Readable.from(pdfBuffer),
            },
            fields: 'id, webViewLink',
            supportsAllDrives: true,
          });

          await drive.permissions.create({
            fileId: file.data.id,
            requestBody: { role: 'reader', type: 'anyone' },
            supportsAllDrives: true,
          });

          pdfUrlsByIndent[indentNo] = file.data.webViewLink;
        } catch (err) {
          console.error(`❌ PDF error for ${indentNo}:`, err.message);
          pdfErrors.push({ indentNo, error: err.message });
        }
      }
    }

    const approvalColLetter = getColLetter(APPROVAL_COL);
    const approvedQuoColLetter = APPROVED_QUO_COL >= 0 ? getColLetter(APPROVED_QUO_COL) : null;
    const pdfColLetter = getColLetter(FINAL_PDF_COL);

    const qmUpdates = [];

    for (const item of matchedRows) {
      const sheetRow = item.rowIndex;
      const pdfUrl = isApproved ? (pdfUrlsByIndent[item.indentNo] || '') : '';

      qmUpdates.push({
        range: `Quotation_Master!${approvalColLetter}${sheetRow}`,
        values: [[isApproved ? 'Approved' : 'Rejected']],
      });

      if (approvedQuoColLetter) {
        qmUpdates.push({
          range: `Quotation_Master!${approvedQuoColLetter}${sheetRow}`,
          values: [[isApproved ? item.quotationNo : '']],
        });
      }

      if (isApproved) {
        qmUpdates.push({
          range: `Quotation_Master!${pdfColLetter}${sheetRow}`,
          values: [[pdfUrl]],
        });
      }
    }

    for (const item of autoRejectRows) {
      qmUpdates.push({
        range: `Quotation_Master!${approvalColLetter}${item.rowIndex}`,
        values: [['Rejected']],
      });
    }

    if (qmUpdates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: {
          data: qmUpdates,
          valueInputOption: 'USER_ENTERED',
        },
      });
    }

    let purchaseUpdatedCount = 0;

    if (isApproved) {
      const pfRes = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Purchase_FMS!A2:B',
      });

      const pfRows = pfRes.data.values || [];
      const uidToRowMap = new Map();
      pfRows.forEach((row, i) => {
        const uid = (row[1] || '').trim();
        if (uid) uidToRowMap.set(uid, i + 2);
      });

      const pfUpdates = [];

      for (const item of matchedRows) {
        const sheetRow = uidToRowMap.get(item.uid);
        if (!sheetRow) continue;

        const r = item.rowData;

        const vendorName = getValue(r, colMap, ['vendorname']);
        const vendorFirm = getValue(r, colMap, ['vendorfirmname', 'vendorfermname']);
        const vendorAddr = getValue(r, colMap, ['vendoraddress']);
        const contact = getValue(r, colMap, ['contactnumber']);
        const gst = getValue(r, colMap, ['vendorgstno']);
        const rate = getValue(r, colMap, ['rate']);
        const discount = getValue(r, colMap, ['discount']);
        const cgst = getValue(r, colMap, ['cgst']);
        const sgst = getValue(r, colMap, ['sgst']);
        const igst = getValue(r, colMap, ['igst']);
        const finalRate = getValue(r, colMap, ['finalrate']);
        const totalValue = getValue(r, colMap, ['totalvalue']);
        const transport = getValue(r, colMap, ['istransportrequired']);
        const transportCharges = getValue(r, colMap, ['expectedtransportcharges']);
        const freight = getValue(r, colMap, ['frighetcharges']);
        const expFreight = getValue(r, colMap, ['expectedfrighetcharges']);
        const brandName = getValue(r, colMap, ['brandname4', 'remark4']);
        const pdfUrl = pdfUrlsByIndent[item.indentNo] || '';

        const step5Values = [
          'Done',             // BB
          '',                 // BC
          item.quotationNo,   // BD
          vendorName,         // BE
          vendorFirm,         // BF
          vendorAddr,         // BG
          contact,            // BH
          gst,                // BI
          rate,               // BJ
          discount,           // BK
          cgst,               // BL
          sgst,               // BM
          igst,               // BN
          finalRate,          // BO
          totalValue,         // BP
          'Approved',         // BQ
          transport,          // BR
          transportCharges,   // BS
          freight,            // BT
          expFreight,         // BU
          pdfUrl,             // BV
          brandName,          // BW
          approvalRemark || '', // 🆕 BX COLUMN (Approval Remark)
        ];

        pfUpdates.push({
          range: `Purchase_FMS!BB${sheetRow}:BX${sheetRow}`, // 🆕 RANGE EXPANDED TO BX
          values: [step5Values],
        });

        purchaseUpdatedCount += 1;
      }

      if (pfUpdates.length) {
        await sheets.spreadsheets.values.batchUpdate({
          spreadsheetId,
          requestBody: { data: pfUpdates, valueInputOption: 'USER_ENTERED' },
        });
      }
    }

    invalidateQuotationCache();

    return res.json({
      success: true,
      message: `Approved ${matchedRows.length} item(s). Auto-rejected ${autoRejectRows.length} duplicate(s) from other vendors.`,
      details: {
        totalSelections: approvals.length,
        matched: matchedRows.length,
        autoRejected: autoRejectRows.length,
        pdfsGenerated: Object.keys(pdfUrlsByIndent).length,
        purchaseFmsUpdated: purchaseUpdatedCount,
        indents: Array.from(indentNoMap.keys()),
      },
      pdfUrls: pdfUrlsByIndent,
      errors: pdfErrors.length ? pdfErrors : undefined,
    });
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    return res.status(500).json({ error: 'Failed: ' + error.message });
  }
});

module.exports = router;