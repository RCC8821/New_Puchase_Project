
// const express = require('express');
// const { sheets, spreadsheetId } = require('../config/googleSheet');
// const router = express.Router();

// const cleanUID = (val) => {
//   if (val === null || val === undefined) return '';
//   return String(val).replace(/,/g, '').trim();
// };

// router.get('/get-Final-material-received', async (req, res) => {
//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId: process.env.SPREADSHEET_ID || spreadsheetId,
//       range: 'Purchase_FMS!A2:DF',
//     });

//     const rows = response.data.values || [];
//     if (!rows.length) return res.json({ success: true, data: [] });

//     const purchaseDataMap = new Map();

//     rows.forEach((row) => {
//       const uid      = cleanUID(row[1]);
//       const planned8 = row[101]?.toString().trim() || '';
//       const actual8  = row[102]?.toString().trim() || '';
//       const status8  = row[103]?.toString().trim() || '';

//       if (!uid) return;

//       if (planned8 && !actual8) {
//         purchaseDataMap.set(uid, {
//           UID: uid,
//           reqNo:                  row[2]?.toString().trim()  || '',
//           siteName:               row[3]?.toString().trim()  || '',
//           supervisorName:         row[4]?.toString().trim()  || '',
//           materialType:           row[5]?.toString().trim()  || '',
//           materialName:           row[6]?.toString().trim()  || '',
//           materialSize:           row[7]?.toString().trim()  || '',
//           materialSpecification:  row[8]?.toString().trim()  || '',  // ✅ NEW
//           skuCode:                row[10]?.toString().trim() || '',
//           orderQty:               row[11]?.toString().trim() || '',
//           unitName:               row[12]?.toString().trim() || '',
//           revisedQuantity:        row[24]?.toString().trim() || '',
//           brandName:              row[25]?.toString().trim() || '',
//           indentNumber3:          row[36]?.toString().trim() || '',
//           pdfUrl3:                row[37]?.toString().trim() || '',
//           quotationNo:            row[55]?.toString().trim() || '',
//           vendorFirmName5:        row[57]?.toString().trim() || '',
//           vendorContact:          row[59]?.toString().trim() || '',
//           pdfUrl5:                row[73]?.toString().trim() || '',
//           poNumber:               row[82]?.toString().trim() || '',
//           pdfUrl6:                row[83]?.toString().trim() || '',
//           deliveryDate:           row[84]?.toString().trim() || '',
//           planned8:               planned8,
//           actual8:                actual8,
//           status8:                status8,
//           finalReceivedQuantity8: row[105]?.toString().trim() || '',
//         });
//       }
//     });

//     if (purchaseDataMap.size === 0) {
//       return res.json({ success: true, data: [] });
//     }

//     const materialResponse = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Material_Received!A2:Q',
//     });

//     const materialData = materialResponse.data.values || [];
//     if (!materialData.length) return res.json({ success: true, data: [] });

//     const filteredData = materialData
//       .map(row => {
//         const uid = cleanUID(row[1]);
//         if (!uid) return null;

//         const purchaseData = purchaseDataMap.get(uid);
//         if (!purchaseData) return null;

//         return {
//           Timestamp:              row[0]?.toString().trim()  || '',
//           uid:                    uid,
//           reqNo:                  row[2]?.toString().trim()  || '',
//           siteName:               row[3]?.toString().trim()  || '',
//           supervisorName:         row[4]?.toString().trim()  || '',
//           vendorName:             purchaseData.vendorFirmName5 || '',
//           materialType:           row[5]?.toString().trim()  || '',
//           skuCode:                row[6]?.toString().trim()  || '',
//           materialName:           row[7]?.toString().trim()  || '',
//           materialSize:           purchaseData.materialSize || '',
//           materialSpecification:  purchaseData.materialSpecification || '',  // ✅ NEW
//           brandName:              purchaseData.brandName || '',
//           unitName:               row[8]?.toString().trim()  || '',
//           totalReceivedQuantity:  row[9]?.toString().trim()  || '',
//           status:                 row[10]?.toString().trim() || '',
//           Challan_url:            row[11]?.toString().trim() || '',
//           challanNo:              row[15]?.toString().trim() || '',
//           qualityApproved:        row[16]?.toString().trim() || '',
//           revisedQuantity:        purchaseData.revisedQuantity || '',
//           orderQty:               purchaseData.orderQty || '',
//           planned8:               purchaseData.planned8 || '',
//           actual8:                purchaseData.actual8 || '',
//           status8:                purchaseData.status8 || '',
//           pdfUrl3:                purchaseData.pdfUrl3 || '',
//           pdfUrl5:                purchaseData.pdfUrl5 || '',
//           pdfUrl6:                purchaseData.pdfUrl6 || '',
//           finalReceivedQuantity8: purchaseData.finalReceivedQuantity8 || '',
//           indentNumber3:          purchaseData.indentNumber3 || '',
//           quotationNo:            purchaseData.quotationNo || '',
//           poNumber:               purchaseData.poNumber || '',
//           deliveryDate:           purchaseData.deliveryDate || '',
//         };
//       })
//       .filter(Boolean);

//     return res.json({ success: true, data: filteredData });

//   } catch (error) {
//     console.error('Error:', error.message);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to fetch data',
//       details: error.message
//     });
//   }
// });

// router.post('/save-final-receipt', async (req, res) => {
//   try {
//     const {
//       uid, totalReceivedQuantity, status,
//       challan_urls, challanNo, qualityApproved
//     } = req.body;

//     if (!uid || totalReceivedQuantity === undefined || !status) {
//       return res.status(400).json({ success: false, message: 'Missing required fields' });
//     }

//     const spreadsheetIdFinal = process.env.SPREADSHEET_ID || spreadsheetId;

//     const uidResponse = await sheets.spreadsheets.values.get({
//       spreadsheetId: spreadsheetIdFinal,
//       range: 'Purchase_FMS!B2:B',
//     });

//     const uids = uidResponse.data.values || [];
//     const cleanedTarget = cleanUID(uid);
//     const rowIndex = uids.findIndex(row => cleanUID(row[0]) === cleanedTarget);

//     if (rowIndex === -1) {
//       return res.status(404).json({ success: false, message: `UID ${uid} not found` });
//     }

//     const sheetRowNumber = rowIndex + 2;

//     const challanUrls = Array.isArray(challan_urls) ? challan_urls : [challan_urls];
//     const challanUrlsString = challanUrls.filter(Boolean).join(', ');

//     const updates = [
//       { range: `Purchase_FMS!CZ${sheetRowNumber}`, values: [[status]] },
//       { range: `Purchase_FMS!DB${sheetRowNumber}`, values: [[totalReceivedQuantity]] },
//       { range: `Purchase_FMS!DC${sheetRowNumber}`, values: [[challanNo || '']] },
//       { range: `Purchase_FMS!DD${sheetRowNumber}`, values: [[challanUrlsString]] },
//     ];

//     await sheets.spreadsheets.values.batchUpdate({
//       spreadsheetId: spreadsheetIdFinal,
//       resource: { valueInputOption: 'USER_ENTERED', data: updates },
//     });

//     res.json({ success: true, message: 'Saved', updatedRow: sheetRowNumber, uid: cleanedTarget });

//   } catch (error) {
//     console.error('Save error:', error.message);
//     res.status(500).json({ success: false, message: 'Error', error: error.message });
//   }
// });

// module.exports = router;






const express = require('express');
const { sheets, spreadsheetId } = require('../config/googleSheet');
const router = express.Router();

const cleanUID = (val) => {
  if (val === null || val === undefined) return '';
  return String(val).replace(/,/g, '').trim();
};

// ─── GET FINAL MATERIAL RECEIVED ──────────────────────────
router.get('/get-Final-material-received', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID || spreadsheetId,
      range: 'Purchase_FMS!A2:DF',
    });

    const rows = response.data.values || [];
    if (!rows.length) return res.json({ success: true, data: [] });

    const purchaseDataMap = new Map();

    rows.forEach((row) => {
      const uid      = cleanUID(row[1]);
      const planned8 = row[101]?.toString().trim() || '';
      const actual8  = row[102]?.toString().trim() || '';
      const status8  = row[103]?.toString().trim() || '';

      if (!uid) return;

      if (planned8 && !actual8) {
        purchaseDataMap.set(uid, {
          UID: uid,
          reqNo:                  row[2]?.toString().trim()  || '',
          siteName:               row[3]?.toString().trim()  || '',
          supervisorName:         row[4]?.toString().trim()  || '',
          materialType:           row[5]?.toString().trim()  || '',
          materialName:           row[6]?.toString().trim()  || '',
          materialSize:           row[7]?.toString().trim()  || '',
          materialSpecification:  row[8]?.toString().trim()  || '',
          skuCode:                row[10]?.toString().trim() || '',
          orderQty:               row[11]?.toString().trim() || '',
          unitName:               row[12]?.toString().trim() || '',
          revisedQuantity:        row[24]?.toString().trim() || '',
          brandName:              row[25]?.toString().trim() || '',
          indentNumber3:          row[36]?.toString().trim() || '',
          pdfUrl3:                row[37]?.toString().trim() || '',
          quotationNo:            row[55]?.toString().trim() || '',
          vendorFirmName5:        row[57]?.toString().trim() || '',
          vendorContact:          row[59]?.toString().trim() || '',
          pdfUrl5:                row[73]?.toString().trim() || '',
          poNumber:               row[82]?.toString().trim() || '',
          pdfUrl6:                row[83]?.toString().trim() || '',
          deliveryDate:           row[84]?.toString().trim() || '',
          planned8:               planned8,
          actual8:                actual8,
          status8:                status8,
          finalReceivedQuantity8: row[105]?.toString().trim() || '',
        });
      }
    });

    if (purchaseDataMap.size === 0) {
      return res.json({ success: true, data: [] });
    }

    const materialResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Material_Received!A2:Q',
    });

    const materialData = materialResponse.data.values || [];
    if (!materialData.length) return res.json({ success: true, data: [] });

  const filteredData = materialData
  .map(row => {
    const uid = cleanUID(row[1]);
    if (!uid) return null;

    const purchaseData = purchaseDataMap.get(uid);
    if (!purchaseData) return null;

    return {
      Timestamp:              row[0]?.toString().trim()  || '',
      uid:                    uid,
      reqNo:                  row[2]?.toString().trim()  || '',
      siteName:               row[3]?.toString().trim()  || '',
      supervisorName:         row[4]?.toString().trim()  || '',
      vendorName:             purchaseData.vendorFirmName5 || '',
      materialType:           row[5]?.toString().trim()  || '',
      skuCode:                row[6]?.toString().trim()  || '',
      materialName:           row[7]?.toString().trim()  || '',
      materialSize:           purchaseData.materialSize || '',
      materialSpecification:  purchaseData.materialSpecification || '',
      brandName:              purchaseData.brandName || '',
      unitName:               row[8]?.toString().trim()  || '',
      totalReceivedQuantity:  row[9]?.toString().trim()  || '',
      status:                 row[10]?.toString().trim() || '',
      Challan_url:            row[13]?.toString().trim() || '',   // ✅ N column (index 13)
      challanNo:              row[15]?.toString().trim() || '',
      qualityApproved:        row[16]?.toString().trim() || '',
      revisedQuantity:        purchaseData.revisedQuantity || '',
      orderQty:               purchaseData.orderQty || '',
      planned8:               purchaseData.planned8 || '',
      actual8:                purchaseData.actual8 || '',
      status8:                purchaseData.status8 || '',
      pdfUrl3:                purchaseData.pdfUrl3 || '',
      pdfUrl5:                purchaseData.pdfUrl5 || '',
      pdfUrl6:                purchaseData.pdfUrl6 || '',
      finalReceivedQuantity8: purchaseData.finalReceivedQuantity8 || '',
      indentNumber3:          purchaseData.indentNumber3 || '',
      quotationNo:            purchaseData.quotationNo || '',
      poNumber:               purchaseData.poNumber || '',
      deliveryDate:           purchaseData.deliveryDate || '',
    };
  })
  .filter(Boolean);

    return res.json({ success: true, data: filteredData });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch data',
      details: error.message
    });
  }
});

// ─── SAVE FINAL RECEIPT ───────────────────────────────────
router.post('/save-final-receipt', async (req, res) => {
  try {
    const {
      uid,
      totalReceivedQuantity,  // ✅ Already summed from frontend (same UID ka total)
      status,
      challan_urls,
      challanNo,
      qualityApproved
    } = req.body;

    if (!uid || totalReceivedQuantity === undefined || !status) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const spreadsheetIdFinal = process.env.SPREADSHEET_ID || spreadsheetId;

    // Find UID row in Purchase_FMS
    const uidResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetIdFinal,
      range: 'Purchase_FMS!B2:B',
    });

    const uids = uidResponse.data.values || [];
    const cleanedTarget = cleanUID(uid);
    const rowIndex = uids.findIndex(row => cleanUID(row[0]) === cleanedTarget);

    if (rowIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `UID ${uid} not found`
      });
    }

    const sheetRowNumber = rowIndex + 2;

    // Combine challan URLs
    const challanUrls = Array.isArray(challan_urls) ? challan_urls : [challan_urls];
    const challanUrlsString = challanUrls.filter(Boolean).join(', ');

    // ✅ Save to Purchase_FMS
    const updates = [
      { range: `Purchase_FMS!CZ${sheetRowNumber}`, values: [[status]] },
      { range: `Purchase_FMS!DB${sheetRowNumber}`, values: [[totalReceivedQuantity]] },
      { range: `Purchase_FMS!DC${sheetRowNumber}`, values: [[challanNo || '']] },
      { range: `Purchase_FMS!DD${sheetRowNumber}`, values: [[challanUrlsString]] },
    ];

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: spreadsheetIdFinal,
      resource: {
        valueInputOption: 'USER_ENTERED',
        data: updates
      },
    });

    console.log(
      `✅ UID ${cleanedTarget} → Row ${sheetRowNumber}: ` +
      `Qty=${totalReceivedQuantity}, Status=${status}`
    );

    res.json({
      success: true,
      message: 'Saved successfully',
      updatedRow: sheetRowNumber,
      uid: cleanedTarget,
      savedQty: totalReceivedQuantity
    });

  } catch (error) {
    console.error('Save error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error',
      error: error.message
    });
  }
});

module.exports = router;