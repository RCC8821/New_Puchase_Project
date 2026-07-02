

// const express = require('express');
// const { sheets, spreadsheetId, drive } = require('../config/googleSheet');
// const router = express.Router();
// require('dotenv').config();

// const { jsPDF } = require('jspdf');

// try { require('jspdf-autotable'); } catch (err) {
//   try { require('jspdf-autotable').default(jsPDF); } catch (err2) {
//     try { require('jspdf-autotable').default(jsPDF); } catch (err3) {
//       console.error('Failed to load jspdf-autotable');
//     }
//   }
// }

// // ─── GET SUPERVISORS ──────────────────────────────────────
// router.get('/get-othersheet-data', async (req, res) => {
//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Project_Data!A3:E',
//     });
//     const rows = response.data.values || [];
//     if (!rows.length) return res.status(404).json({ error: 'No data found' });

//     const data = rows.map(row => ({
//       Supervisor:    row[0] || null,
//       Contact_No:    row[1] || null,
//       Site_Name:     row[3] || null,
//       Site_Location: row[4] || null,
//     }));

//     return res.status(200).json(data);
//   } catch (error) {
//     console.error('Error:', error.message);
//     return res.status(500).json({ error: 'Failed to fetch data' });
//   }
// });

// // ─── GET PO DATA ──────────────────────────────────────────
// router.get('/get-po-data', async (req, res) => {
//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Purchase_FMS!A2:CH',
//     });

//     const rows = response.data.values || [];
//     console.log('Total rows:', rows.length);

//     if (!rows.length) {
//       return res.status(404).json({ error: 'No data found' });
//     }

//     const PLANNED_6_IDX = 78;  // CA
//     const ACTUAL_6_IDX  = 79;  // CB
//     const STATUS_6_IDX  = 80;  // CC

//     const formData = rows
//       .map((row, index) => {
//         if (!row || row.every(c => !c || c.trim() === '')) return null;

//         const planned6 = (row[PLANNED_6_IDX] || '').trim();
//         const actual6  = (row[ACTUAL_6_IDX]  || '').trim();
//         const status6  = (row[STATUS_6_IDX]  || '').trim();

//         if (!planned6 || actual6 || status6) return null;

//         const status5 = (row[53] || '').trim();
//         if (!status5) return null;

//         return {
//           UID:              (row[1]  || '').trim(),
//           Req_No:           (row[2]  || '').trim(),
//           Site_Name:        (row[3]  || '').trim(),
//           Site_Location:    (row[4]  || '').trim(),
//           Material_Type:    (row[5]  || '').trim(),
//           Material_Name:    (row[6]  || '').trim(),
//           Material_Size:    (row[7]  || '').trim(),   // ✅ H column
//           SKU_Code:         (row[10] || '').trim(),
//           Quantity:         (row[11] || '').trim(),
//           Unit_Name:        (row[12] || '').trim(),
//           Require_Date:     (row[14] || '').trim(),
//           REVISED_QUANTITY_2: (row[24] || '').trim(),
//           'DECIDED_BRAND/COMPANY_NAME_2': (row[25] || '').trim(),
//           INDENT_NUMBER_3:  (row[36] || '').trim(),
//           PDF_URL_3:        (row[37] || '').trim(),
//           QUOTATION_NO_5:   (row[55] || '').trim(),
//           Vendor_Name_5:    (row[56] || '').trim(),
//           Vendor_Firm_Name_5: (row[57] || '').trim(),
//           Vendor_Address_5: (row[58] || '').trim(),
//           Vendor_Contact_5: (row[59] || '').trim(),
//           Vendor_GST_No_5:  (row[60] || '').trim(),
//           Rate_5:           (row[61] || '').trim(),
//           DISCOUNT_5:       (row[62] || '').trim(),
//           CGST_5:           (row[63] || '').trim(),
//           SGST_5:           (row[64] || '').trim(),
//           IGST_5:           (row[65] || '').trim(),
//           FINAL_RATE_5:     (row[66] || '').trim(),
//           TOTAL_VALUE_5:    (row[67] || '').trim(),
//           APPROVAL_5:       (row[68] || '').trim(),
//           IS_TRANSPORT_REQUIRED:      (row[69] || '').trim(),
//           EXPECTED_TRANSPORT_CHARGES: (row[70] || '').trim(),
//           FREIGHT_CHARGES:            (row[71] || '').trim(),
//           EXPECTED_FREIGHT_CHARGES:   (row[72] || '').trim(),
//           PDF_URL_5:        (row[73] || '').trim(),
//           Remark5:          (row[74] || '').trim(),
//           PLANNED_6:        planned6,
//           _rowIndex:        index + 2,
//         };
//       })
//       .filter(Boolean);

//     console.log(`Valid rows: ${formData.length}`);

//     if (!formData.length) {
//       return res.status(404).json({ error: 'No PO data found' });
//     }

//     return res.json({ data: formData });
//   } catch (error) {
//     console.error('Error:', error.message);
//     return res.status(500).json({ error: 'Failed to fetch data', details: error.message });
//   }
// });

// // ─── GENERATE PO NUMBER ──────────────────────────────────
// async function generatePONumber() {
//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Purchase_FMS!CE:CE',
//     });
//     const rows = response.data.values || [];
//     let maxPONumber = 0;
//     rows.forEach((row) => {
//       const value = row[0];
//       if (value && value.startsWith('PO_')) {
//         const num = parseInt(value.replace('PO_', ''), 10) || 0;
//         if (num > maxPONumber) maxPONumber = num;
//       }
//     });
//     const newPONumber = `PO_${String(maxPONumber + 1).padStart(3, '0')}`;
//     console.log(`Generated PO: ${newPONumber}`);
//     return newPONumber;
//   } catch (error) {
//     throw new Error('Failed to generate PO number');
//   }
// }

// // ─── GENERATE PDF ─────────────────────────────────────────
// const generatePODocument = (
//   approvedItems, quotationNo, indentNo, expectedDeliveryDate,
//   poNumber, siteName, siteLocation, supervisorName, supervisorContact,
//   vendorName, vendorAddress, vendorGST, vendorContact,
//   companyLogoBase64 = null
// ) => {
//   console.log(`Generating PDF: PO ${poNumber}, Items: ${approvedItems.length}`);

//   const doc = new jsPDF();

//   if (typeof doc.autoTable !== 'function') {
//     throw new Error('autoTable plugin not loaded');
//   }

//   doc.setFont('helvetica', 'normal');

//   const pageWidth    = doc.internal.pageSize.getWidth();
//   const pageHeight   = doc.internal.pageSize.getHeight();
//   const bottomMargin = 30;

//   // ── Helpers ──
//   const extractEnglish = (text) => {
//     if (!text) return 'N/A';
//     let str = String(text).trim();
//     str = str.replace(/[\p{Script=Devanagari}]+/gu, ' ');
//     str = str.replace(/\s+/g, ' ').trim();
//     return str || 'N/A';
//   };

//   const checkPageBreak = (currentY, requiredSpace) => {
//     if (currentY + requiredSpace > pageHeight - bottomMargin) {
//       doc.addPage();
//       return 20;
//     }
//     return currentY;
//   };

//   const headerY = 15;

//   // ── Logo ──
//   if (companyLogoBase64) {
//     try {
//       doc.addImage(companyLogoBase64, 'PNG', 15, headerY, 35, 25);
//     } catch (error) {
//       doc.setFillColor(245, 222, 179);
//       doc.rect(15, headerY, 35, 25, 'F');
//       doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(139, 69, 19);
//       doc.text('RCC', 25, headerY + 10);
//       doc.setFontSize(7);
//       doc.text('INFRASTRUCTURES', 18, headerY + 15);
//     }
//   } else {
//     doc.setFillColor(245, 222, 179);
//     doc.rect(15, headerY, 35, 25, 'F');
//     doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(139, 69, 19);
//     doc.text('RCC', 25, headerY + 10);
//     doc.setFontSize(7);
//     doc.text('INFRASTRUCTURES', 18, headerY + 15);
//   }

//   // ── Address ──
//   const addressStartY = headerY + 8;
//   doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(0, 0, 0);
//   doc.text('R. C. C. Infrastructures', pageWidth - 15, addressStartY, { align: 'right' });
//   doc.setFontSize(7); doc.setFont('helvetica', 'normal');
//   doc.text('310 Saket Nagar, 9B Near Sagar Public School, Bhopal, 462026', pageWidth - 15, addressStartY + 4,  { align: 'right' });
//   doc.text('Contact: 7869962504',                     pageWidth - 15, addressStartY + 8,  { align: 'right' });
//   doc.text('Email: mayank@rccinfrastructure.com',     pageWidth - 15, addressStartY + 12, { align: 'right' });
//   doc.text('GST: 23ABHFR3130L1ZA',                   pageWidth - 15, addressStartY + 16, { align: 'right' });

//   doc.setDrawColor(220, 53, 69); doc.setLineWidth(0.5);
//   doc.line(15, headerY + 27, pageWidth - 15, headerY + 27);

//   doc.setFontSize(16); doc.setFont('helvetica', 'bold'); doc.setTextColor(220, 53, 69);
//   doc.text('Purchase Order', 15, headerY + 35);

//   doc.setDrawColor(255, 193, 7); doc.setLineWidth(0.5);
//   doc.line(15, headerY + 37, pageWidth - 15, headerY + 37);

//   // ── Info Section ──
//   const infoY       = headerY + 43;
//   const currentDate = new Date()
//     .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
//     .replace(/ /g, '-');

//   const firstItem = approvedItems?.[0] || {};

//   const finalVendorName      = extractEnglish(vendorName      || firstItem.vendorFirm      || 'N/A');
//   const finalVendorGST       = extractEnglish(vendorGST       || 'N/A');
//   const finalVendorAddress   = extractEnglish(vendorAddress   || 'N/A');
//   const finalVendorContact   = extractEnglish(vendorContact   || 'N/A');
//   const finalSiteName        = extractEnglish(siteName        || firstItem.Site_Name       || 'N/A');
//   const finalSiteLocation    = extractEnglish(siteLocation    || 'N/A');
//   const finalSupervisorName  = extractEnglish(supervisorName  || 'N/A');
//   const finalSupervisorContact = extractEnglish(supervisorContact || 'N/A');

//   const keyLeft   = 15;
//   const keyRight  = pageWidth / 2 + 10;
//   const gap       = 4;
//   const lineHeight = 5;
//   let currentY    = infoY;

//   doc.setTextColor(0, 0, 0); doc.setFontSize(9);

//   const infoRow = (label1, val1, label2, val2) => {
//     doc.setFont('helvetica', 'bold');
//     doc.text(label1, keyLeft, currentY);
//     doc.setFont('helvetica', 'normal');
//     doc.text(val1, keyLeft + doc.getTextWidth(label1) + gap, currentY);
//     if (label2) {
//       doc.setFont('helvetica', 'bold');
//       doc.text(label2, keyRight, currentY);
//       doc.setFont('helvetica', 'normal');
//       doc.text(val2 || '', keyRight + doc.getTextWidth(label2) + gap, currentY);
//     }
//     currentY += lineHeight;
//   };

//   infoRow('PO Number:', extractEnglish(poNumber),    'PO Date:',       currentDate);
//   infoRow('Indent No:', extractEnglish(indentNo),    'Quotation No:',  extractEnglish(quotationNo));
//   infoRow('Vendor:',    finalVendorName,              'GST No:',        finalVendorGST);

//   doc.setFont('helvetica', 'bold'); doc.text('Vendor Address:', keyLeft, currentY);
//   doc.setFont('helvetica', 'normal');
//   const addressLines = doc.splitTextToSize(finalVendorAddress, pageWidth / 2 - 30);
//   doc.text(addressLines, keyLeft + doc.getTextWidth('Vendor Address:') + gap, currentY);
//   doc.setFont('helvetica', 'bold'); doc.text('Vendor Contact:', keyRight, currentY);
//   doc.setFont('helvetica', 'normal');
//   doc.text(finalVendorContact, keyRight + doc.getTextWidth('Vendor Contact:') + gap, currentY);
//   currentY += lineHeight;

//   doc.setFont('helvetica', 'bold'); doc.text('Site Name:', keyLeft, currentY);
//   doc.setFont('helvetica', 'normal');
//   doc.text(finalSiteName, keyLeft + doc.getTextWidth('Site Name:') + gap, currentY);
//   doc.setFont('helvetica', 'bold'); doc.text('Site Location:', keyRight, currentY);
//   doc.setFont('helvetica', 'normal');
//   const locationLines = doc.splitTextToSize(finalSiteLocation, pageWidth / 2 - 30);
//   doc.text(locationLines, keyRight + doc.getTextWidth('Site Location:') + gap, currentY);
//   currentY += lineHeight;

//   infoRow('Supervisor:', finalSupervisorName, 'Supervisor Contact:', finalSupervisorContact);

//   doc.setFont('helvetica', 'bold'); doc.text('Expected Delivery:', keyLeft, currentY);
//   doc.setFont('helvetica', 'normal');
//   doc.text(extractEnglish(expectedDeliveryDate), keyLeft + doc.getTextWidth('Expected Delivery:') + gap, currentY);
//   currentY += lineHeight + 1;

//   doc.setDrawColor(255, 193, 7);
//   doc.line(15, currentY, pageWidth - 15, currentY);
//   currentY += 7;

//   doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(220, 53, 69);
//   doc.text('Order Details', 15, currentY);
//   currentY += 5;

//   // ══════════════════════════════════════════════════════
//   // ✅ TABLE - Discount column हटाया, Size Material Name के बाद
//   // Columns: No | UID | Material Name | Size | Qty | Unit | Rate | CGST | SGST | IGST | Final Rate | Total Value
//   // ══════════════════════════════════════════════════════
//   const tableBody = approvedItems.map((item, index) => {
//     const materialName = extractEnglish(item.Material_Name || item.materialName || 'N/A');

//     // Remark (below material name)
//     let remarkText = '';
//     const rawRemark = item.remark || item.Remark5;
//     if (rawRemark !== undefined && rawRemark !== null && rawRemark !== '') {
//       let r = String(rawRemark).trim().replace(/\[object\s+Object\]/gi, '').trim();
//       if (r.length > 80) r = r.substring(0, 77) + '...';
//       if (r) remarkText = '\n(' + r + ')';
//     }

//     return [
//       index + 1,                                                                          // No
//       extractEnglish(item.UID || item.uid || ''),                                        // UID
//       materialName + remarkText,                                                          // Material Name
//       extractEnglish(item.Material_Size || ''),                                          // ✅ Size
//       extractEnglish(item.REVISED_QUANTITY_2 || item.quantity || ''),                   // Qty
//       extractEnglish(item.Unit_Name || item.unit || ''),                                // Unit
//       extractEnglish(item.Rate_5 || item.rate || ''),                                   // Rate
//       // ✅ Discount column हटाया
//       extractEnglish(item.CGST_5 || item.cgst || ''),                                  // CGST
//       extractEnglish(item.SGST_5 || item.sgst || ''),                                  // SGST
//       extractEnglish(item.IGST_5 || item.igst || ''),                                  // IGST
//       extractEnglish(item.FINAL_RATE_5 || item.finalRate || ''),                       // Final Rate
//       extractEnglish(item.TOTAL_VALUE_5 || item.totalValue || ''),                     // Total Value
//     ];
//   });

//   const grandTotal = approvedItems.reduce((acc, item) => {
//     const val = parseFloat(String(item.TOTAL_VALUE_5 || item.totalValue || '0').replace(/[₹,\s]/g, ''));
//     return acc + (isNaN(val) ? 0 : val);
//   }, 0);

//   doc.autoTable({
//     head: [[
//       'No', 'UID', 'Material Name',
//       'Size',       // ✅ Material Name के बाद
//       'Quantity', 'Unit', 'Rate',
//       // ✅ Discount column हटाया
//       'CGST', 'SGST', 'IGST', 'Final Rate', 'Total Value',
//     ]],
//     body: tableBody,
//     startY: currentY,
//     theme: 'grid',
//     styles: {
//       fontSize: 8.5,
//       cellPadding: 2,
//       font: 'helvetica',
//       lineColor: [0, 0, 0],
//       lineWidth: 0.35,
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
//       fontSize: 8,
//       halign: 'center',
//       cellPadding: 2,
//       lineWidth: 0.4,
//     },
//     columnStyles: {
//       0:  { cellWidth: 8,  halign: 'center' },   // No
//       1:  { cellWidth: 14, halign: 'center' },   // UID
//       2:  { cellWidth: 32, halign: 'left', valign: 'top' }, // Material Name
//       3:  { cellWidth: 16, halign: 'center' },   // ✅ Size
//       4:  { cellWidth: 13, halign: 'center' },   // Qty
//       5:  { cellWidth: 11, halign: 'center' },   // Unit
//       6:  { cellWidth: 15, halign: 'right'  },   // Rate
//       // ✅ Discount हटाया - index 7 से आगे shift हुए
//       7:  { cellWidth: 11, halign: 'center' },   // CGST
//       8:  { cellWidth: 11, halign: 'center' },   // SGST
//       9:  { cellWidth: 11, halign: 'center' },   // IGST
//       10: { cellWidth: 16, halign: 'right'  },   // Final Rate
//       11: { cellWidth: 19, halign: 'right', fontStyle: 'bold' }, // Total Value
//     },
//     alternateRowStyles: { fillColor: [250, 250, 250] },
//     margin: { left: 14, right: 14, bottom: 30 },
//     pageBreak: 'auto',
//     showHead: 'everyPage',
//     rowPageBreak: 'avoid',
//   });

//   let tableEndY = doc.lastAutoTable.finalY || currentY + 20;
//   tableEndY = checkPageBreak(tableEndY, 15);

//   // ── Grand Total ──
//   doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(0, 0, 0);
//   doc.text(`Grand Total: ${grandTotal.toFixed(2)}`, pageWidth - 15, tableEndY + 7, { align: 'right' });

//   doc.setDrawColor(255, 193, 7);
//   doc.line(15, tableEndY + 11, pageWidth - 15, tableEndY + 11);

//   // ── Transport Details ──
//   let transportY = tableEndY + 17;
//   transportY = checkPageBreak(transportY, 25);

//   doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(220, 53, 69);
//   doc.text('Transport Details', 15, transportY);

//   doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(0, 0, 0);
//   let transY = transportY + 5;

//   doc.setFont('helvetica', 'bold');
//   doc.text('Transport Required:', keyLeft, transY);
//   doc.setFont('helvetica', 'normal');
//   doc.text(extractEnglish(firstItem.transportRequired || firstItem.IS_TRANSPORT_REQUIRED || ''), keyLeft + doc.getTextWidth('Transport Required:') + gap, transY);

//   doc.setFont('helvetica', 'bold');
//   doc.text('Expected Transport Charges:', keyRight, transY);
//   doc.setFont('helvetica', 'normal');
//   doc.text(extractEnglish(firstItem.expectedTransport || firstItem.EXPECTED_TRANSPORT_CHARGES || ''), keyRight + doc.getTextWidth('Expected Transport Charges:') + gap, transY);

//   transY += lineHeight;

//   doc.setFont('helvetica', 'bold');
//   doc.text('Freight Charges:', keyLeft, transY);
//   doc.setFont('helvetica', 'normal');
//   doc.text(extractEnglish(firstItem.FREIGHT_CHARGES || ''), keyLeft + doc.getTextWidth('Freight Charges:') + gap, transY);

//   transY += 5;
//   doc.setDrawColor(255, 193, 7);
//   doc.line(15, transY, pageWidth - 15, transY);

//   // ── Payment Details ──
//   let paymentY = transY + 7;
//   paymentY = checkPageBreak(paymentY, 25);

//   doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(220, 53, 69);
//   doc.text('Payment Details', 15, paymentY);

//   doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(0, 0, 0);
//   let payY = paymentY + 5;

//   doc.setFont('helvetica', 'bold');
//   doc.text('Payment Terms:', keyLeft, payY);
//   doc.setFont('helvetica', 'normal');
//   doc.text('Credit', keyLeft + doc.getTextWidth('Payment Terms:') + gap, payY);

//   doc.setFont('helvetica', 'bold');
//   doc.text('Credit Days:', keyRight, payY);
//   doc.setFont('helvetica', 'normal');
//   doc.text('30', keyRight + doc.getTextWidth('Credit Days:') + gap, payY);

//   payY += lineHeight;

//   doc.setFont('helvetica', 'bold');
//   doc.text('Bill Type:', keyLeft, payY);
//   doc.setFont('helvetica', 'normal');
//   doc.text('Invoice', keyLeft + doc.getTextWidth('Bill Type:') + gap, payY);

//   payY += 5;
//   doc.setDrawColor(255, 193, 7);
//   doc.line(15, payY, pageWidth - 15, payY);

//   // ── Signature ──
//   let signatureY = payY + 15;
//   signatureY = checkPageBreak(signatureY, 20);

//   doc.setTextColor(0, 0, 0); doc.setFontSize(9); doc.setFont('helvetica', 'normal');
//   doc.text('Authorized Signature', pageWidth - 60, signatureY, { align: 'center' });
//   doc.setDrawColor(0, 0, 0); doc.setLineWidth(0.2); doc.setLineDash([1, 1], 0);
//   doc.line(pageWidth - 90, signatureY + 5, pageWidth - 30, signatureY + 5);
//   doc.setLineDash();

//   // ── Page Numbers ──
//   const totalPages = doc.internal.getNumberOfPages();
//   for (let i = 1; i <= totalPages; i++) {
//     doc.setPage(i);
//     doc.setFillColor(0, 0, 0);
//     doc.roundedRect(pageWidth / 2 - 25, pageHeight - 15, 50, 10, 5, 5, 'F');
//     doc.setTextColor(255, 255, 255); doc.setFontSize(9); doc.setFont('helvetica', 'normal');
//     doc.text(`Page ${i} / ${totalPages}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
//   }

//   const pdfBuffer  = doc.output('arraybuffer');
//   const base64Data = Buffer.from(pdfBuffer).toString('base64');
//   return `data:application/pdf;base64,${base64Data}`;
// };

// // ─── CREATE PO ────────────────────────────────────────────
// router.post('/create-po', async (req, res) => {
//   const {
//     quotationNo, expectedDeliveryDate, items,
//     siteName, siteLocation, supervisorName, supervisorContact,
//     vendorName, vendorAddress, vendorGST, vendorContact,
//   } = req.body;

//   if (!quotationNo || !expectedDeliveryDate || !items?.length) {
//     return res.status(400).json({ error: 'Required fields missing' });
//   }

//   try {
//     const poNumber = await generatePONumber();
//     console.log(`✅ PO: ${poNumber}`);

//     // Supervisor lookup
//     const supervisorResponse = await sheets.spreadsheets.values.get({
//       spreadsheetId, range: 'Project_Data!A3:E',
//     });
//     const supervisors = (supervisorResponse.data.values || []).map(row => ({
//       Supervisor: row[0] || null, Contact_No: row[1] || null,
//       Site_Name: row[3] || null,  Site_Location: row[4] || null,
//     }));

//     const matchedSite = supervisors.find(s => s.Site_Name === siteName);
//     const finalSiteLocation      = matchedSite?.Site_Location || siteLocation || 'N/A';
//     const finalSupervisorName    = matchedSite?.Supervisor    || supervisorName    || 'N/A';
//     const finalSupervisorContact = matchedSite?.Contact_No   || supervisorContact || 'N/A';

//     const allIndents = [...new Set(items.map(item => item.indentNo))].join(', ');

//     const pdfDataUri = generatePODocument(
//       items, quotationNo, allIndents, expectedDeliveryDate, poNumber,
//       siteName, finalSiteLocation, finalSupervisorName, finalSupervisorContact,
//       vendorName, vendorAddress, vendorGST, vendorContact
//     );

//     const base64Data = pdfDataUri.replace('data:application/pdf;base64,', '');
//     const pdfBuffer  = Buffer.from(base64Data, 'base64');

//     const { Readable } = require('stream');
//     const file = await drive.files.create({
//       resource: {
//         name: `${poNumber}_${quotationNo}_${Date.now()}.pdf`,
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

//     // Update Purchase_FMS rows matching quotation number
//     const sheetResponse = await sheets.spreadsheets.values.get({
//       spreadsheetId, range: 'Purchase_FMS!A2:CH',
//     });
//     const rows = sheetResponse.data.values || [];

//     const QUOTATION_COL = 55; // BD

//     let updatedCount = 0;
//     for (let i = 0; i < rows.length; i++) {
//       const row = rows[i];
//       if (row && (row[QUOTATION_COL] || '').trim() === quotationNo.trim()) {
//         const sheetRow = i + 2;
//         await sheets.spreadsheets.values.batchUpdate({
//           spreadsheetId,
//           resource: {
//             valueInputOption: 'USER_ENTERED',
//             data: [
//               { range: `Purchase_FMS!CC${sheetRow}`, values: [['Done']]             },  // STATUS 6
//               { range: `Purchase_FMS!CE${sheetRow}`, values: [[poNumber]]            },  // PO NUMBER
//               { range: `Purchase_FMS!CF${sheetRow}`, values: [[pdfUrl]]              },  // PDF URL
//               { range: `Purchase_FMS!CG${sheetRow}`, values: [[expectedDeliveryDate]] }, // DELIVERY DATE
//             ],
//           },
//         });
//         console.log(`✅ Updated row ${sheetRow}: PO=${poNumber}`);
//         updatedCount++;
//       }
//     }

//     res.status(200).json({
//       message: `PO generated successfully, ${updatedCount} rows updated`,
//       poNumber,
//       pdfUrl,
//     });

//   } catch (error) {
//     console.error('Error:', error.message);
//     res.status(500).json({ error: 'Failed to create PO: ' + error.message });
//   }
// });

// // ─── ADMIN: GET PO DATA ───────────────────────────────────
// router.get('/get-po-data-admin', async (req, res) => {
//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Purchase_FMS!A2:CH',
//     });
//     const rows = response.data.values || [];
//     console.log('=== ADMIN PO DATA ===');
//     console.log('Total rows:', rows.length);

//     if (!rows.length) return res.status(404).json({ error: 'No data found' });

//     const PO_COL       = 82;  // CE
//     const PDF_COL      = 83;  // CF
//     const DELIVERY_COL = 84;  // CG

//     const formData = rows
//       .map((row) => {
//         if (!row || row.every(c => !c || c.trim() === '')) return null;
//         const poNum = (row[PO_COL] || '').trim();
//         if (!poNum || !poNum.startsWith('PO_')) return null;

//         return {
//           UID:              (row[1]  || '').trim(),
//           Req_No:           (row[2]  || '').trim(),
//           Site_Name:        (row[3]  || '').trim(),
//           Site_Location:    (row[4]  || '').trim(),
//           Material_Type:    (row[5]  || '').trim(),
//           Material_Name:    (row[6]  || '').trim(),
//           Material_Size:    (row[7]  || '').trim(),   // ✅ H column
//           SKU_Code:         (row[10] || '').trim(),
//           Quantity:         (row[11] || '').trim(),
//           Unit_Name:        (row[12] || '').trim(),
//           Require_Date:     (row[14] || '').trim(),
//           REVISED_QUANTITY_2: (row[24] || '').trim(),
//           'DECIDED_BRAND/COMPANY_NAME_2': (row[25] || '').trim(),
//           INDENT_NUMBER_3:  (row[36] || '').trim(),
//           PDF_URL_3:        (row[37] || '').trim(),
//           QUOTATION_NO_5:   (row[55] || '').trim(),
//           Vendor_Name_5:    (row[56] || '').trim(),
//           Vendor_Firm_Name_5: (row[57] || '').trim(),
//           Vendor_Address_5: (row[58] || '').trim(),
//           Vendor_Contact_5: (row[59] || '').trim(),
//           Vendor_GST_No_5:  (row[60] || '').trim(),
//           Rate_5:           (row[61] || '').trim(),
//           DISCOUNT_5:       (row[62] || '').trim(),
//           CGST_5:           (row[63] || '').trim(),
//           SGST_5:           (row[64] || '').trim(),
//           IGST_5:           (row[65] || '').trim(),
//           FINAL_RATE_5:     (row[66] || '').trim(),
//           TOTAL_VALUE_5:    (row[67] || '').trim(),
//           APPROVAL_5:       (row[68] || '').trim(),
//           IS_TRANSPORT_REQUIRED:      (row[69] || '').trim(),
//           EXPECTED_TRANSPORT_CHARGES: (row[70] || '').trim(),
//           FREIGHT_CHARGES:            (row[71] || '').trim(),
//           EXPECTED_FREIGHT_CHARGES:   (row[72] || '').trim(),
//           PDF_URL_5:        (row[73] || '').trim(),
//           Remark5:          (row[74] || '').trim(),
//           PLANNED_6:        (row[78] || '').trim(),
//           ACTUAL_6:         (row[79] || '').trim(),
//           STATUS_6:         (row[80] || '').trim(),
//           PO_NUMBER:        poNum,
//           PO_PDF_URL:       (row[PDF_COL]      || '').trim(),
//           DELIVERY_DATE:    (row[DELIVERY_COL] || '').trim(),
//         };
//       })
//       .filter(Boolean);

//     console.log(`Total PO rows: ${formData.length}`);

//     if (!formData.length) {
//       return res.status(404).json({
//         error: 'No PO data found',
//         hint: 'Create at least one PO first',
//       });
//     }

//     // Group by PO number
//     const grouped = {};
//     formData.forEach(item => {
//       const po = item.PO_NUMBER;
//       if (!grouped[po]) {
//         grouped[po] = {
//           poNumber:    po,
//           pdfUrl:      item.PO_PDF_URL,
//           quotationNo: item.QUOTATION_NO_5,
//           siteName:    item.Site_Name,
//           vendorName:  item.Vendor_Firm_Name_5,
//           deliveryDate: item.DELIVERY_DATE,
//           items: [],
//         };
//       }
//       grouped[po].items.push(item);
//     });

//     console.log(`Unique POs: ${Object.keys(grouped).length}`);

//     return res.json({
//       grouped: Object.values(grouped),
//       totalPOs: Object.keys(grouped).length,
//     });
//   } catch (error) {
//     console.error('Error:', error.message);
//     return res.status(500).json({ error: 'Failed to fetch data', details: error.message });
//   }
// });

// // ─── UPDATE PO PDF (Admin) ────────────────────────────────
// router.put('/update-po-pdf', async (req, res) => {
//   console.log('=== UPDATE PO PDF START ===');
//   const { poNumber } = req.body;
//   if (!poNumber) return res.status(400).json({ error: 'PO Number required' });

//   try {
//     const sheetResponse = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Purchase_FMS!A2:CH',
//     });
//     const rows = sheetResponse.data.values || [];

//     const PO_COL       = 82;  // CE
//     const DELIVERY_COL = 84;  // CG

//     const matchedRows       = [];
//     const matchedRowNumbers = [];
//     rows.forEach((row, i) => {
//       if ((row[PO_COL] || '').trim() === poNumber.trim()) {
//         matchedRows.push(row);
//         matchedRowNumbers.push(i + 2);
//       }
//     });

//     console.log(`Found ${matchedRows.length} rows for ${poNumber}`);
//     if (!matchedRows.length) return res.status(404).json({ error: `PO ${poNumber} not found` });

//     const items = matchedRows.map(row => ({
//       UID:                        (row[1]  || '').trim(),
//       Site_Name:                  (row[3]  || '').trim(),
//       Site_Location:              (row[4]  || '').trim(),
//       Material_Name:              (row[6]  || '').trim(),
//       Material_Size:              (row[7]  || '').trim(),   // ✅ H column
//       Unit_Name:                  (row[12] || '').trim(),
//       REVISED_QUANTITY_2:         (row[24] || '').trim(),
//       INDENT_NUMBER_3:            (row[36] || '').trim(),
//       QUOTATION_NO_5:             (row[55] || '').trim(),
//       Vendor_Name_5:              (row[56] || '').trim(),
//       Vendor_Firm_Name_5:         (row[57] || '').trim(),
//       Vendor_Address_5:           (row[58] || '').trim(),
//       Vendor_Contact_5:           (row[59] || '').trim(),
//       Vendor_GST_No_5:            (row[60] || '').trim(),
//       Rate_5:                     (row[61] || '').trim(),
//       DISCOUNT_5:                 (row[62] || '').trim(),
//       CGST_5:                     (row[63] || '').trim(),
//       SGST_5:                     (row[64] || '').trim(),
//       IGST_5:                     (row[65] || '').trim(),
//       FINAL_RATE_5:               (row[66] || '').trim(),
//       TOTAL_VALUE_5:              (row[67] || '').trim(),
//       IS_TRANSPORT_REQUIRED:      (row[69] || '').trim(),
//       EXPECTED_TRANSPORT_CHARGES: (row[70] || '').trim(),
//       FREIGHT_CHARGES:            (row[71] || '').trim(),
//       Remark5:                    (row[74] || '').trim(),
//     }));

//     const firstItem          = items[0];
//     const quotationNo        = firstItem.QUOTATION_NO_5;
//     const allIndents         = [...new Set(items.map(i => i.INDENT_NUMBER_3))].join(', ');
//     const expectedDeliveryDate = matchedRows[0][DELIVERY_COL] || 'N/A';

//     // Supervisor lookup
//     const supervisorResponse = await sheets.spreadsheets.values.get({
//       spreadsheetId, range: 'Project_Data!A3:E',
//     });
//     const supervisors = (supervisorResponse.data.values || []).map(row => ({
//       Supervisor: row[0], Contact_No: row[1], Site_Name: row[3], Site_Location: row[4],
//     }));
//     const matched = supervisors.find(s => {
//       if (!s.Site_Name || !firstItem.Site_Name) return false;
//       return s.Site_Name === firstItem.Site_Name ||
//         s.Site_Name.split('/')[0].trim() === firstItem.Site_Name.split('/')[0].trim();
//     });

//     const pdfDataUri = generatePODocument(
//       items, quotationNo, allIndents, expectedDeliveryDate, poNumber,
//       firstItem.Site_Name,
//       matched?.Site_Location || firstItem.Site_Location || 'N/A',
//       matched?.Supervisor    || 'N/A',
//       matched?.Contact_No   || 'N/A',
//       firstItem.Vendor_Firm_Name_5 || firstItem.Vendor_Name_5 || 'N/A',
//       firstItem.Vendor_Address_5   || 'N/A',
//       firstItem.Vendor_GST_No_5    || 'N/A',
//       firstItem.Vendor_Contact_5   || 'N/A'
//     );

//     const base64Data = pdfDataUri.replace('data:application/pdf;base64,', '');
//     const pdfBuffer  = Buffer.from(base64Data, 'base64');
//     const { Readable } = require('stream');

//     const file = await drive.files.create({
//       resource: {
//         name: `${poNumber}_UPDATED_${Date.now()}.pdf`,
//         parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
//         mimeType: 'application/pdf',
//       },
//       media: { mimeType: 'application/pdf', body: Readable.from(pdfBuffer) },
//       fields: 'id, webViewLink',
//       supportsAllDrives: true,
//     });
//     const newPdfUrl = file.data.webViewLink;

//     await drive.permissions.create({
//       fileId: file.data.id,
//       requestBody: { role: 'reader', type: 'anyone' },
//       supportsAllDrives: true,
//     });

//     console.log(`✅ New PDF: ${newPdfUrl}`);

//     for (const rowNumber of matchedRowNumbers) {
//       await sheets.spreadsheets.values.update({
//         spreadsheetId,
//         range: `Purchase_FMS!CF${rowNumber}`,
//         valueInputOption: 'RAW',
//         resource: { values: [[newPdfUrl]] },
//       });
//       console.log(`✅ Updated row ${rowNumber}`);
//     }

//     res.status(200).json({
//       message: `PO PDF updated for ${poNumber}`,
//       poNumber,
//       newPdfUrl,
//       updatedRows: matchedRowNumbers.length,
//     });
//   } catch (error) {
//     console.error('Error:', error.message);
//     res.status(500).json({ error: 'Failed: ' + error.message });
//   }
// });

// module.exports = router;







const express = require('express');
const { sheets, spreadsheetId, drive } = require('../config/googleSheet');
const router = express.Router();
require('dotenv').config();

const { jsPDF } = require('jspdf');

try { require('jspdf-autotable'); } catch (err) {
  try { require('jspdf-autotable').default(jsPDF); } catch (err2) {
    try { require('jspdf-autotable').default(jsPDF); } catch (err3) {
      console.error('Failed to load jspdf-autotable');
    }
  }
}

// ─── GET SUPERVISORS ──────────────────────────────────────
router.get('/get-othersheet-data', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Project_Data!A3:E',
    });
    const rows = response.data.values || [];
    if (!rows.length) return res.status(404).json({ error: 'No data found' });

    const data = rows.map(row => ({
      Supervisor:    row[0] || null,
      Contact_No:    row[1] || null,
      Site_Name:     row[3] || null,
      Site_Location: row[4] || null,
    }));

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// ─── GET PO DATA ──────────────────────────────────────────
router.get('/get-po-data', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Purchase_FMS!A2:CH',
    });

    const rows = response.data.values || [];

    if (!rows.length) {
      return res.status(404).json({ error: 'No data found' });
    }

    const PLANNED_6_IDX = 78;
    const ACTUAL_6_IDX  = 79;
    const STATUS_6_IDX  = 80;

    const formData = rows
      .map((row, index) => {
        if (!row || row.every(c => !c || c.trim() === '')) return null;

        const planned6 = (row[PLANNED_6_IDX] || '').trim();
        const actual6  = (row[ACTUAL_6_IDX]  || '').trim();
        const status6  = (row[STATUS_6_IDX]  || '').trim();

        if (!planned6 || actual6 || status6) return null;

        const status5 = (row[53] || '').trim();
        if (!status5) return null;

        return {
          UID:              (row[1]  || '').trim(),
          Req_No:           (row[2]  || '').trim(),
          Site_Name:        (row[3]  || '').trim(),
          Site_Location:    (row[4]  || '').trim(),
          Material_Type:    (row[5]  || '').trim(),
          Material_Name:    (row[6]  || '').trim(),
          Material_Size:    (row[7]  || '').trim(),
          Material_Specification: (row[8] || '').trim(),  // ✅ NEW - I column
          SKU_Code:         (row[10] || '').trim(),
          Quantity:         (row[11] || '').trim(),
          Unit_Name:        (row[12] || '').trim(),
          Require_Date:     (row[14] || '').trim(),
          REVISED_QUANTITY_2: (row[24] || '').trim(),
          'DECIDED_BRAND/COMPANY_NAME_2': (row[25] || '').trim(),
          INDENT_NUMBER_3:  (row[36] || '').trim(),
          PDF_URL_3:        (row[37] || '').trim(),
          QUOTATION_NO_5:   (row[55] || '').trim(),
          Vendor_Name_5:    (row[56] || '').trim(),
          Vendor_Firm_Name_5: (row[57] || '').trim(),
          Vendor_Address_5: (row[58] || '').trim(),
          Vendor_Contact_5: (row[59] || '').trim(),
          Vendor_GST_No_5:  (row[60] || '').trim(),
          Rate_5:           (row[61] || '').trim(),
          DISCOUNT_5:       (row[62] || '').trim(),
          CGST_5:           (row[63] || '').trim(),
          SGST_5:           (row[64] || '').trim(),
          IGST_5:           (row[65] || '').trim(),
          FINAL_RATE_5:     (row[66] || '').trim(),
          TOTAL_VALUE_5:    (row[67] || '').trim(),
          APPROVAL_5:       (row[68] || '').trim(),
          IS_TRANSPORT_REQUIRED:      (row[69] || '').trim(),
          EXPECTED_TRANSPORT_CHARGES: (row[70] || '').trim(),
          FREIGHT_CHARGES:            (row[71] || '').trim(),
          EXPECTED_FREIGHT_CHARGES:   (row[72] || '').trim(),
          PDF_URL_5:        (row[73] || '').trim(),
          Remark5:          (row[74] || '').trim(),
          PLANNED_6:        planned6,
          _rowIndex:        index + 2,
        };
      })
      .filter(Boolean);

    if (!formData.length) {
      return res.status(404).json({ error: 'No PO data found' });
    }

    return res.json({ data: formData });
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch data', details: error.message });
  }
});

// ─── GENERATE PO NUMBER ──────────────────────────────────
async function generatePONumber() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Purchase_FMS!CE:CE',
    });
    const rows = response.data.values || [];
    let maxPONumber = 0;
    rows.forEach((row) => {
      const value = row[0];
      if (value && value.startsWith('PO_')) {
        const num = parseInt(value.replace('PO_', ''), 10) || 0;
        if (num > maxPONumber) maxPONumber = num;
      }
    });
    const newPONumber = `PO_${String(maxPONumber + 1).padStart(3, '0')}`;
    return newPONumber;
  } catch (error) {
    throw new Error('Failed to generate PO number');
  }
}

// ─── GENERATE PDF ─────────────────────────────────────────
const generatePODocument = (
  approvedItems, quotationNo, indentNo, expectedDeliveryDate,
  poNumber, siteName, siteLocation, supervisorName, supervisorContact,
  vendorName, vendorAddress, vendorGST, vendorContact,
  companyLogoBase64 = null
) => {
  console.log(`Generating PDF: PO ${poNumber}, Items: ${approvedItems.length}`);

  const doc = new jsPDF();

  if (typeof doc.autoTable !== 'function') {
    throw new Error('autoTable plugin not loaded');
  }

  doc.setFont('helvetica', 'normal');

  const pageWidth    = doc.internal.pageSize.getWidth();
  const pageHeight   = doc.internal.pageSize.getHeight();
  const bottomMargin = 30;

  const extractEnglish = (text) => {
    if (!text) return 'N/A';
    let str = String(text).trim();
    str = str.replace(/[\p{Script=Devanagari}]+/gu, ' ');
    str = str.replace(/\s+/g, ' ').trim();
    return str || 'N/A';
  };

  const checkPageBreak = (currentY, requiredSpace) => {
    if (currentY + requiredSpace > pageHeight - bottomMargin) {
      doc.addPage();
      return 20;
    }
    return currentY;
  };

  const headerY = 15;

  // Logo
  if (companyLogoBase64) {
    try {
      doc.addImage(companyLogoBase64, 'PNG', 15, headerY, 35, 25);
    } catch (error) {
      doc.setFillColor(245, 222, 179);
      doc.rect(15, headerY, 35, 25, 'F');
      doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(139, 69, 19);
      doc.text('RCC', 25, headerY + 10);
      doc.setFontSize(7);
      doc.text('INFRASTRUCTURES', 18, headerY + 15);
    }
  } else {
    doc.setFillColor(245, 222, 179);
    doc.rect(15, headerY, 35, 25, 'F');
    doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(139, 69, 19);
    doc.text('RCC', 25, headerY + 10);
    doc.setFontSize(7);
    doc.text('INFRASTRUCTURES', 18, headerY + 15);
  }

  // Address
  const addressStartY = headerY + 8;
  doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(0, 0, 0);
  doc.text('R. C. C. Infrastructures', pageWidth - 15, addressStartY, { align: 'right' });
  doc.setFontSize(7); doc.setFont('helvetica', 'normal');
  doc.text('310 Saket Nagar, 9B Near Sagar Public School, Bhopal, 462026', pageWidth - 15, addressStartY + 4,  { align: 'right' });
  doc.text('Contact: 7869962504',                     pageWidth - 15, addressStartY + 8,  { align: 'right' });
  doc.text('Email: mayank@rccinfrastructure.com',     pageWidth - 15, addressStartY + 12, { align: 'right' });
  doc.text('GST: 23ABHFR3130L1ZA',                   pageWidth - 15, addressStartY + 16, { align: 'right' });

  doc.setDrawColor(220, 53, 69); doc.setLineWidth(0.5);
  doc.line(15, headerY + 27, pageWidth - 15, headerY + 27);

  doc.setFontSize(16); doc.setFont('helvetica', 'bold'); doc.setTextColor(220, 53, 69);
  doc.text('Purchase Order', 15, headerY + 35);

  doc.setDrawColor(255, 193, 7); doc.setLineWidth(0.5);
  doc.line(15, headerY + 37, pageWidth - 15, headerY + 37);

  // Info Section
  const infoY       = headerY + 43;
  const currentDate = new Date()
    .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    .replace(/ /g, '-');

  const firstItem = approvedItems?.[0] || {};

  const finalVendorName      = extractEnglish(vendorName      || firstItem.vendorFirm      || 'N/A');
  const finalVendorGST       = extractEnglish(vendorGST       || 'N/A');
  const finalVendorAddress   = extractEnglish(vendorAddress   || 'N/A');
  const finalVendorContact   = extractEnglish(vendorContact   || 'N/A');
  const finalSiteName        = extractEnglish(siteName        || firstItem.Site_Name       || 'N/A');
  const finalSiteLocation    = extractEnglish(siteLocation    || 'N/A');
  const finalSupervisorName  = extractEnglish(supervisorName  || 'N/A');
  const finalSupervisorContact = extractEnglish(supervisorContact || 'N/A');

  const keyLeft   = 15;
  const keyRight  = pageWidth / 2 + 10;
  const gap       = 4;
  const lineHeight = 5;
  let currentY    = infoY;

  doc.setTextColor(0, 0, 0); doc.setFontSize(9);

  const infoRow = (label1, val1, label2, val2) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label1, keyLeft, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(val1, keyLeft + doc.getTextWidth(label1) + gap, currentY);
    if (label2) {
      doc.setFont('helvetica', 'bold');
      doc.text(label2, keyRight, currentY);
      doc.setFont('helvetica', 'normal');
      doc.text(val2 || '', keyRight + doc.getTextWidth(label2) + gap, currentY);
    }
    currentY += lineHeight;
  };

  infoRow('PO Number:', extractEnglish(poNumber),    'PO Date:',       currentDate);
  infoRow('Indent No:', extractEnglish(indentNo),    'Quotation No:',  extractEnglish(quotationNo));
  infoRow('Vendor:',    finalVendorName,              'GST No:',        finalVendorGST);

  doc.setFont('helvetica', 'bold'); doc.text('Vendor Address:', keyLeft, currentY);
  doc.setFont('helvetica', 'normal');
  const addressLines = doc.splitTextToSize(finalVendorAddress, pageWidth / 2 - 30);
  doc.text(addressLines, keyLeft + doc.getTextWidth('Vendor Address:') + gap, currentY);
  doc.setFont('helvetica', 'bold'); doc.text('Vendor Contact:', keyRight, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(finalVendorContact, keyRight + doc.getTextWidth('Vendor Contact:') + gap, currentY);
  currentY += lineHeight;

  doc.setFont('helvetica', 'bold'); doc.text('Site Name:', keyLeft, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(finalSiteName, keyLeft + doc.getTextWidth('Site Name:') + gap, currentY);
  doc.setFont('helvetica', 'bold'); doc.text('Site Location:', keyRight, currentY);
  doc.setFont('helvetica', 'normal');
  const locationLines = doc.splitTextToSize(finalSiteLocation, pageWidth / 2 - 30);
  doc.text(locationLines, keyRight + doc.getTextWidth('Site Location:') + gap, currentY);
  currentY += lineHeight;

  infoRow('Supervisor:', finalSupervisorName, 'Supervisor Contact:', finalSupervisorContact);

  doc.setFont('helvetica', 'bold'); doc.text('Expected Delivery:', keyLeft, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(extractEnglish(expectedDeliveryDate), keyLeft + doc.getTextWidth('Expected Delivery:') + gap, currentY);
  currentY += lineHeight + 1;

  doc.setDrawColor(255, 193, 7);
  doc.line(15, currentY, pageWidth - 15, currentY);
  currentY += 7;

  doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(220, 53, 69);
  doc.text('Order Details', 15, currentY);
  currentY += 5;

  // ✅ NEW TABLE STRUCTURE:
  // No | UID | Material Name | Size | Specification | Qty | Unit | Rate | GST | Final Rate | Total Value
  const tableBody = approvedItems.map((item, index) => {
    const materialName = extractEnglish(item.Material_Name || item.materialName || 'N/A');

    let remarkText = '';
    const rawRemark = item.remark || item.Remark5;
    if (rawRemark !== undefined && rawRemark !== null && rawRemark !== '') {
      let r = String(rawRemark).trim().replace(/\[object\s+Object\]/gi, '').trim();
      if (r.length > 80) r = r.substring(0, 77) + '...';
      if (r) remarkText = '\n(' + r + ')';
    }

    // ✅ GST combined value
    let gstValue = '';
    const cgst = String(item.CGST_5 || item.cgst || '').trim();
    const sgst = String(item.SGST_5 || item.sgst || '').trim();
    const igst = String(item.IGST_5 || item.igst || '').trim();

    if (igst && parseFloat(igst) > 0) {
      // IGST hai
      gstValue = `${igst}%`;
    } else if (cgst && parseFloat(cgst) > 0) {
      // CGST + SGST hai → total dikhana hai
      const totalGst = parseFloat(cgst) + parseFloat(sgst || cgst);
      gstValue = `${totalGst}%`;
    } else {
      gstValue = '0%';
    }

    return [
      index + 1,
      extractEnglish(item.UID || item.uid || ''),
      materialName + remarkText,
      extractEnglish(item.Material_Size || item.materialSize || ''),
      extractEnglish(item.Material_Specification || item.materialSpecification || ''),  // ✅ NEW
      extractEnglish(item.REVISED_QUANTITY_2 || item.quantity || ''),
      extractEnglish(item.Unit_Name || item.unit || ''),
      extractEnglish(item.Rate_5 || item.rate || ''),
      gstValue,  // ✅ Combined GST
      extractEnglish(item.FINAL_RATE_5 || item.finalRate || ''),
      extractEnglish(item.TOTAL_VALUE_5 || item.totalValue || ''),
    ];
  });

  const grandTotal = approvedItems.reduce((acc, item) => {
    const val = parseFloat(String(item.TOTAL_VALUE_5 || item.totalValue || '0').replace(/[₹,\s]/g, ''));
    return acc + (isNaN(val) ? 0 : val);
  }, 0);

  // doc.autoTable({
  //   head: [[
  //     'No', 'UID', 'Material Name',
  //     'Size',
  //     'Specification',  // ✅ NEW
  //     'Quantity', 'Unit', 'Rate',
  //     'GST',            // ✅ Single GST
  //     'Final Rate', 'Total Value',
  //   ]],
  //   body: tableBody,
  //   startY: currentY,
  //   theme: 'grid',
  //   styles: {
  //     fontSize: 8.5,
  //     cellPadding: 2,
  //     font: 'helvetica',
  //     lineColor: [0, 0, 0],
  //     lineWidth: 0.35,
  //     overflow: 'linebreak',
  //     valign: 'top',
  //   },
  //   bodyStyles: {
  //     fontStyle: 'bold',
  //     textColor: [15, 15, 15],
  //   },
  //   headStyles: {
  //     fillColor: [235, 235, 235],
  //     textColor: [0, 0, 0],
  //     fontStyle: 'bold',
  //     fontSize: 8,
  //     halign: 'center',
  //     cellPadding: 2,
  //     lineWidth: 0.4,
  //   },
  //   columnStyles: {
  //     0:  { cellWidth: 8,  halign: 'center' },   // No
  //     1:  { cellWidth: 12, halign: 'center' },   // UID
  //     2:  { cellWidth: 28, halign: 'left', valign: 'top' }, // Material Name
  //     3:  { cellWidth: 14, halign: 'center' },   // Size
  //     4:  { cellWidth: 22, halign: 'left'   },   // ✅ Specification
  //     5:  { cellWidth: 12, halign: 'center' },   // Qty
  //     6:  { cellWidth: 10, halign: 'center' },   // Unit
  //     7:  { cellWidth: 14, halign: 'right'  },   // Rate
  //     8:  { cellWidth: 12, halign: 'center' },   // ✅ GST
  //     9:  { cellWidth: 15, halign: 'right'  },   // Final Rate
  //     10: { cellWidth: 18, halign: 'right', fontStyle: 'bold' }, // Total Value
  //   },
  //   alternateRowStyles: { fillColor: [250, 250, 250] },
  //   margin: { left: 14, right: 14, bottom: 30 },
  //   pageBreak: 'auto',
  //   showHead: 'everyPage',
  //   rowPageBreak: 'avoid',
  // });



doc.autoTable({
    head: [[
      'No', 'UID', 'Material Name',
      'Size',
      'Specification',
      'Quantity', 'Unit', 'Rate',
      'GST',
      'Final Rate', 'Total Value',
    ]],
    body: tableBody,
    startY: currentY,
    theme: 'grid',
    tableWidth: 'auto',  // ✅ ADD THIS - full width
    styles: {
      fontSize: 8.5,
      cellPadding: 2,
      font: 'helvetica',
      lineColor: [0, 0, 0],
      lineWidth: 0.35,
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
      fontSize: 8,
      halign: 'center',
      cellPadding: 2,
      lineWidth: 0.4,
    },
   columnStyles: {
  0:  { cellWidth: 9,  halign: 'center' },
  1:  { cellWidth: 13, halign: 'center' },
  2:  { cellWidth: 30, halign: 'left', valign: 'top' },
  3:  { cellWidth: 20, halign: 'center' },
  4:  { cellWidth: 26, halign: 'left' },
  5:  { cellWidth: 14, halign: 'center' },
  6:  { cellWidth: 11, halign: 'center' },
  7:  { cellWidth: 13, halign: 'right' },
  8:  { cellWidth: 11, halign: 'center' },
  9:  { cellWidth: 14, halign: 'right' },
  10: { cellWidth: 21, halign: 'right', fontStyle: 'bold' },
},
    alternateRowStyles: { fillColor: [250, 250, 250] },
    margin: { left: 14, right: 14, bottom: 30 },
    pageBreak: 'auto',
    showHead: 'everyPage',
    rowPageBreak: 'avoid',
  });

  let tableEndY = doc.lastAutoTable.finalY || currentY + 20;
  tableEndY = checkPageBreak(tableEndY, 15);

  // Grand Total
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(0, 0, 0);
  doc.text(`Grand Total: ${grandTotal.toFixed(2)}`, pageWidth - 15, tableEndY + 7, { align: 'right' });

  doc.setDrawColor(255, 193, 7);
  doc.line(15, tableEndY + 11, pageWidth - 15, tableEndY + 11);

  // Transport
  let transportY = tableEndY + 17;
  transportY = checkPageBreak(transportY, 25);

  doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(220, 53, 69);
  doc.text('Transport Details', 15, transportY);

  doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(0, 0, 0);
  let transY = transportY + 5;

  doc.setFont('helvetica', 'bold');
  doc.text('Transport Required:', keyLeft, transY);
  doc.setFont('helvetica', 'normal');
  doc.text(extractEnglish(firstItem.transportRequired || firstItem.IS_TRANSPORT_REQUIRED || ''), keyLeft + doc.getTextWidth('Transport Required:') + gap, transY);

  doc.setFont('helvetica', 'bold');
  doc.text('Expected Transport Charges:', keyRight, transY);
  doc.setFont('helvetica', 'normal');
  doc.text(extractEnglish(firstItem.expectedTransport || firstItem.EXPECTED_TRANSPORT_CHARGES || ''), keyRight + doc.getTextWidth('Expected Transport Charges:') + gap, transY);

  transY += lineHeight;

  doc.setFont('helvetica', 'bold');
  doc.text('Freight Charges:', keyLeft, transY);
  doc.setFont('helvetica', 'normal');
  doc.text(extractEnglish(firstItem.FREIGHT_CHARGES || ''), keyLeft + doc.getTextWidth('Freight Charges:') + gap, transY);

  transY += 5;
  doc.setDrawColor(255, 193, 7);
  doc.line(15, transY, pageWidth - 15, transY);

  // Payment
  let paymentY = transY + 7;
  paymentY = checkPageBreak(paymentY, 25);

  doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(220, 53, 69);
  doc.text('Payment Details', 15, paymentY);

  doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(0, 0, 0);
  let payY = paymentY + 5;

  doc.setFont('helvetica', 'bold');
  doc.text('Payment Terms:', keyLeft, payY);
  doc.setFont('helvetica', 'normal');
  doc.text('Credit', keyLeft + doc.getTextWidth('Payment Terms:') + gap, payY);

  doc.setFont('helvetica', 'bold');
  doc.text('Credit Days:', keyRight, payY);
  doc.setFont('helvetica', 'normal');
  doc.text('30', keyRight + doc.getTextWidth('Credit Days:') + gap, payY);

  payY += lineHeight;

  doc.setFont('helvetica', 'bold');
  doc.text('Bill Type:', keyLeft, payY);
  doc.setFont('helvetica', 'normal');
  doc.text('Invoice', keyLeft + doc.getTextWidth('Bill Type:') + gap, payY);

  payY += 5;
  doc.setDrawColor(255, 193, 7);
  doc.line(15, payY, pageWidth - 15, payY);

  // Signature
  let signatureY = payY + 15;
  signatureY = checkPageBreak(signatureY, 20);

  doc.setTextColor(0, 0, 0); doc.setFontSize(9); doc.setFont('helvetica', 'normal');
  doc.text('Authorized Signature', pageWidth - 60, signatureY, { align: 'center' });
  doc.setDrawColor(0, 0, 0); doc.setLineWidth(0.2); doc.setLineDash([1, 1], 0);
  doc.line(pageWidth - 90, signatureY + 5, pageWidth - 30, signatureY + 5);
  doc.setLineDash();

  // Page Numbers
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFillColor(0, 0, 0);
    doc.roundedRect(pageWidth / 2 - 25, pageHeight - 15, 50, 10, 5, 5, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(9); doc.setFont('helvetica', 'normal');
    doc.text(`Page ${i} / ${totalPages}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
  }

  const pdfBuffer  = doc.output('arraybuffer');
  const base64Data = Buffer.from(pdfBuffer).toString('base64');
  return `data:application/pdf;base64,${base64Data}`;
};

// ─── CREATE PO ────────────────────────────────────────────
router.post('/create-po', async (req, res) => {
  const {
    quotationNo, expectedDeliveryDate, items,
    siteName, siteLocation, supervisorName, supervisorContact,
    vendorName, vendorAddress, vendorGST, vendorContact,
  } = req.body;

  if (!quotationNo || !expectedDeliveryDate || !items?.length) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  try {
    const poNumber = await generatePONumber();

    const supervisorResponse = await sheets.spreadsheets.values.get({
      spreadsheetId, range: 'Project_Data!A3:E',
    });
    const supervisors = (supervisorResponse.data.values || []).map(row => ({
      Supervisor: row[0] || null, Contact_No: row[1] || null,
      Site_Name: row[3] || null,  Site_Location: row[4] || null,
    }));

    const matchedSite = supervisors.find(s => s.Site_Name === siteName);
    const finalSiteLocation      = matchedSite?.Site_Location || siteLocation || 'N/A';
    const finalSupervisorName    = matchedSite?.Supervisor    || supervisorName    || 'N/A';
    const finalSupervisorContact = matchedSite?.Contact_No   || supervisorContact || 'N/A';

    const allIndents = [...new Set(items.map(item => item.indentNo))].join(', ');

    const pdfDataUri = generatePODocument(
      items, quotationNo, allIndents, expectedDeliveryDate, poNumber,
      siteName, finalSiteLocation, finalSupervisorName, finalSupervisorContact,
      vendorName, vendorAddress, vendorGST, vendorContact
    );

    const base64Data = pdfDataUri.replace('data:application/pdf;base64,', '');
    const pdfBuffer  = Buffer.from(base64Data, 'base64');

    const { Readable } = require('stream');
    const file = await drive.files.create({
      resource: {
        name: `${poNumber}_${quotationNo}_${Date.now()}.pdf`,
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

    const sheetResponse = await sheets.spreadsheets.values.get({
      spreadsheetId, range: 'Purchase_FMS!A2:CH',
    });
    const rows = sheetResponse.data.values || [];

    const QUOTATION_COL = 55;

    let updatedCount = 0;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row && (row[QUOTATION_COL] || '').trim() === quotationNo.trim()) {
        const sheetRow = i + 2;
        await sheets.spreadsheets.values.batchUpdate({
          spreadsheetId,
          resource: {
            valueInputOption: 'USER_ENTERED',
            data: [
              { range: `Purchase_FMS!CC${sheetRow}`, values: [['Done']]             },
              { range: `Purchase_FMS!CE${sheetRow}`, values: [[poNumber]]            },
              { range: `Purchase_FMS!CF${sheetRow}`, values: [[pdfUrl]]              },
              { range: `Purchase_FMS!CG${sheetRow}`, values: [[expectedDeliveryDate]] },
            ],
          },
        });
        updatedCount++;
      }
    }

    res.status(200).json({
      message: `PO generated successfully, ${updatedCount} rows updated`,
      poNumber,
      pdfUrl,
    });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Failed to create PO: ' + error.message });
  }
});

// ─── ADMIN: GET PO DATA ───────────────────────────────────
router.get('/get-po-data-admin', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Purchase_FMS!A2:CH',
    });
    const rows = response.data.values || [];

    if (!rows.length) return res.status(404).json({ error: 'No data found' });

    const PO_COL       = 82;
    const PDF_COL      = 83;
    const DELIVERY_COL = 84;

    const formData = rows
      .map((row) => {
        if (!row || row.every(c => !c || c.trim() === '')) return null;
        const poNum = (row[PO_COL] || '').trim();
        if (!poNum || !poNum.startsWith('PO_')) return null;

        return {
          UID:              (row[1]  || '').trim(),
          Req_No:           (row[2]  || '').trim(),
          Site_Name:        (row[3]  || '').trim(),
          Site_Location:    (row[4]  || '').trim(),
          Material_Type:    (row[5]  || '').trim(),
          Material_Name:    (row[6]  || '').trim(),
          Material_Size:    (row[7]  || '').trim(),
          Material_Specification: (row[8] || '').trim(),  // ✅ NEW
          SKU_Code:         (row[10] || '').trim(),
          Quantity:         (row[11] || '').trim(),
          Unit_Name:        (row[12] || '').trim(),
          Require_Date:     (row[14] || '').trim(),
          REVISED_QUANTITY_2: (row[24] || '').trim(),
          'DECIDED_BRAND/COMPANY_NAME_2': (row[25] || '').trim(),
          INDENT_NUMBER_3:  (row[36] || '').trim(),
          PDF_URL_3:        (row[37] || '').trim(),
          QUOTATION_NO_5:   (row[55] || '').trim(),
          Vendor_Name_5:    (row[56] || '').trim(),
          Vendor_Firm_Name_5: (row[57] || '').trim(),
          Vendor_Address_5: (row[58] || '').trim(),
          Vendor_Contact_5: (row[59] || '').trim(),
          Vendor_GST_No_5:  (row[60] || '').trim(),
          Rate_5:           (row[61] || '').trim(),
          DISCOUNT_5:       (row[62] || '').trim(),
          CGST_5:           (row[63] || '').trim(),
          SGST_5:           (row[64] || '').trim(),
          IGST_5:           (row[65] || '').trim(),
          FINAL_RATE_5:     (row[66] || '').trim(),
          TOTAL_VALUE_5:    (row[67] || '').trim(),
          APPROVAL_5:       (row[68] || '').trim(),
          IS_TRANSPORT_REQUIRED:      (row[69] || '').trim(),
          EXPECTED_TRANSPORT_CHARGES: (row[70] || '').trim(),
          FREIGHT_CHARGES:            (row[71] || '').trim(),
          EXPECTED_FREIGHT_CHARGES:   (row[72] || '').trim(),
          PDF_URL_5:        (row[73] || '').trim(),
          Remark5:          (row[74] || '').trim(),
          PLANNED_6:        (row[78] || '').trim(),
          ACTUAL_6:         (row[79] || '').trim(),
          STATUS_6:         (row[80] || '').trim(),
          PO_NUMBER:        poNum,
          PO_PDF_URL:       (row[PDF_COL]      || '').trim(),
          DELIVERY_DATE:    (row[DELIVERY_COL] || '').trim(),
        };
      })
      .filter(Boolean);

    if (!formData.length) {
      return res.status(404).json({
        error: 'No PO data found',
        hint: 'Create at least one PO first',
      });
    }

    const grouped = {};
    formData.forEach(item => {
      const po = item.PO_NUMBER;
      if (!grouped[po]) {
        grouped[po] = {
          poNumber:    po,
          pdfUrl:      item.PO_PDF_URL,
          quotationNo: item.QUOTATION_NO_5,
          siteName:    item.Site_Name,
          vendorName:  item.Vendor_Firm_Name_5,
          deliveryDate: item.DELIVERY_DATE,
          items: [],
        };
      }
      grouped[po].items.push(item);
    });

    return res.json({
      grouped: Object.values(grouped),
      totalPOs: Object.keys(grouped).length,
    });
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch data', details: error.message });
  }
});

// ─── UPDATE PO PDF (Admin) ────────────────────────────────
router.put('/update-po-pdf', async (req, res) => {
  const { poNumber } = req.body;
  if (!poNumber) return res.status(400).json({ error: 'PO Number required' });

  try {
    const sheetResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Purchase_FMS!A2:CH',
    });
    const rows = sheetResponse.data.values || [];

    const PO_COL       = 82;
    const DELIVERY_COL = 84;

    const matchedRows       = [];
    const matchedRowNumbers = [];
    rows.forEach((row, i) => {
      if ((row[PO_COL] || '').trim() === poNumber.trim()) {
        matchedRows.push(row);
        matchedRowNumbers.push(i + 2);
      }
    });

    if (!matchedRows.length) return res.status(404).json({ error: `PO ${poNumber} not found` });

    const items = matchedRows.map(row => ({
      UID:                        (row[1]  || '').trim(),
      Site_Name:                  (row[3]  || '').trim(),
      Site_Location:              (row[4]  || '').trim(),
      Material_Name:              (row[6]  || '').trim(),
      Material_Size:              (row[7]  || '').trim(),
      Material_Specification:     (row[8]  || '').trim(),  // ✅ NEW
      Unit_Name:                  (row[12] || '').trim(),
      REVISED_QUANTITY_2:         (row[24] || '').trim(),
      INDENT_NUMBER_3:            (row[36] || '').trim(),
      QUOTATION_NO_5:             (row[55] || '').trim(),
      Vendor_Name_5:              (row[56] || '').trim(),
      Vendor_Firm_Name_5:         (row[57] || '').trim(),
      Vendor_Address_5:           (row[58] || '').trim(),
      Vendor_Contact_5:           (row[59] || '').trim(),
      Vendor_GST_No_5:            (row[60] || '').trim(),
      Rate_5:                     (row[61] || '').trim(),
      DISCOUNT_5:                 (row[62] || '').trim(),
      CGST_5:                     (row[63] || '').trim(),
      SGST_5:                     (row[64] || '').trim(),
      IGST_5:                     (row[65] || '').trim(),
      FINAL_RATE_5:               (row[66] || '').trim(),
      TOTAL_VALUE_5:              (row[67] || '').trim(),
      IS_TRANSPORT_REQUIRED:      (row[69] || '').trim(),
      EXPECTED_TRANSPORT_CHARGES: (row[70] || '').trim(),
      FREIGHT_CHARGES:            (row[71] || '').trim(),
      Remark5:                    (row[74] || '').trim(),
    }));

    const firstItem          = items[0];
    const quotationNo        = firstItem.QUOTATION_NO_5;
    const allIndents         = [...new Set(items.map(i => i.INDENT_NUMBER_3))].join(', ');
    const expectedDeliveryDate = matchedRows[0][DELIVERY_COL] || 'N/A';

    const supervisorResponse = await sheets.spreadsheets.values.get({
      spreadsheetId, range: 'Project_Data!A3:E',
    });
    const supervisors = (supervisorResponse.data.values || []).map(row => ({
      Supervisor: row[0], Contact_No: row[1], Site_Name: row[3], Site_Location: row[4],
    }));
    const matched = supervisors.find(s => {
      if (!s.Site_Name || !firstItem.Site_Name) return false;
      return s.Site_Name === firstItem.Site_Name ||
        s.Site_Name.split('/')[0].trim() === firstItem.Site_Name.split('/')[0].trim();
    });

    const pdfDataUri = generatePODocument(
      items, quotationNo, allIndents, expectedDeliveryDate, poNumber,
      firstItem.Site_Name,
      matched?.Site_Location || firstItem.Site_Location || 'N/A',
      matched?.Supervisor    || 'N/A',
      matched?.Contact_No   || 'N/A',
      firstItem.Vendor_Firm_Name_5 || firstItem.Vendor_Name_5 || 'N/A',
      firstItem.Vendor_Address_5   || 'N/A',
      firstItem.Vendor_GST_No_5    || 'N/A',
      firstItem.Vendor_Contact_5   || 'N/A'
    );

    const base64Data = pdfDataUri.replace('data:application/pdf;base64,', '');
    const pdfBuffer  = Buffer.from(base64Data, 'base64');
    const { Readable } = require('stream');

    const file = await drive.files.create({
      resource: {
        name: `${poNumber}_UPDATED_${Date.now()}.pdf`,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
        mimeType: 'application/pdf',
      },
      media: { mimeType: 'application/pdf', body: Readable.from(pdfBuffer) },
      fields: 'id, webViewLink',
      supportsAllDrives: true,
    });
    const newPdfUrl = file.data.webViewLink;

    await drive.permissions.create({
      fileId: file.data.id,
      requestBody: { role: 'reader', type: 'anyone' },
      supportsAllDrives: true,
    });

    for (const rowNumber of matchedRowNumbers) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Purchase_FMS!CF${rowNumber}`,
        valueInputOption: 'RAW',
        resource: { values: [[newPdfUrl]] },
      });
    }

    res.status(200).json({
      message: `PO PDF updated for ${poNumber}`,
      poNumber,
      newPdfUrl,
      updatedRows: matchedRowNumbers.length,
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Failed: ' + error.message });
  }
});

module.exports = router;