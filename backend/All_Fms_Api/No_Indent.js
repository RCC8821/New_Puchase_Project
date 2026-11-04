const express = require('express');
const { sheets, spreadsheetId } = require('../config/googleSheet');
const router = express.Router();

const cleanUID = (val) => {
  if (val === null || val === undefined) return '';
  return String(val).replace(/,/g, '').trim();
};

// ─── GET NO INDENT DATA ──────────────────────────────────
// router.get('/get-no-indent', async (req, res) => {
//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId: process.env.SPREADSHEET_ID || spreadsheetId,
//       range: 'No_Indent!A7:Z',   // A to Z (includes U-Z action columns)
//     });

//     const rows = response.data.values || [];
//     if (!rows.length) return res.json({ success: true, data: [] });

//     const filteredData = rows
//       .map((row, idx) => ({
//         _rowIndex: idx + 7,  // Actual sheet row number (7, 8, 9...)
//         timestamp:            (row[0]  || '').toString().trim(),
//         uid:                  (row[1]  || '').toString().trim(),
//         reqNo:                (row[2]  || '').toString().trim(),
//         projectName:          (row[3]  || '').toString().trim(),
//         projectEngineer:      (row[4]  || '').toString().trim(),
//         materialType:         (row[5]  || '').toString().trim(),
//         materialName:         (row[6]  || '').toString().trim(),
//         materialSize:         (row[7]  || '').toString().trim(),
//         materialSpecification:(row[8]  || '').toString().trim(),
//         materialBrand:        (row[9]  || '').toString().trim(),
//         skuCode:              (row[10] || '').toString().trim(),
//         quantity:             (row[11] || '').toString().trim(),
//         unitName:             (row[12] || '').toString().trim(),
//         descriptionOfWork:    (row[13] || '').toString().trim(),
//         requireDays:          (row[14] || '').toString().trim(),
//         contractorFirm:       (row[15] || '').toString().trim(),
//         remark:               (row[16] || '').toString().trim(),
//         planned5:             (row[18] || '').toString().trim(),
//         // Action Columns (U-Z)
//         status5:              (row[20] || '').toString().trim(),
//         deliveryByVendor:     (row[22] || '').toString().trim(),
//         vendorFirmName5:      (row[23] || '').toString().trim(),
//         siteEngineerInform:   (row[24] || '').toString().trim(),
//         actionRemark:         (row[25] || '').toString().trim(),
//       }))
//       .filter((item) => {
//         // ✅ S (planned5) me data ho AND T (actual5) empty ho
//         const planned5 = item.planned5;
//         const actual5 = (rows[item._rowIndex - 7][19] || '').toString().trim();
//         return planned5 !== '' && actual5 === '';
//       });

//     return res.json({
//       success: true,
//       totalRows: filteredData.length,
//       data: filteredData,
//     });

//   } catch (error) {
//     console.error('No_Indent GET Error:', error.message);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch No Indent data',
//       error: error.message,
//     });
//   }
// });


router.get('/get-no-indent', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID || spreadsheetId,
      range: 'No_Indent!A7:AC',   // A to AC (includes U-Z action cols + AC Material_Received)
    });

    const rows = response.data.values || [];
    if (!rows.length) return res.json({ success: true, data: [] });

    const filteredData = rows
      .map((row, idx) => ({
        _rowIndex: idx + 7,  // Actual sheet row number (7, 8, 9...)
        timestamp:            (row[0]  || '').toString().trim(),
        uid:                  (row[1]  || '').toString().trim(),
        reqNo:                (row[2]  || '').toString().trim(),
        projectName:          (row[3]  || '').toString().trim(),
        projectEngineer:      (row[4]  || '').toString().trim(),
        materialType:         (row[5]  || '').toString().trim(),
        materialName:         (row[6]  || '').toString().trim(),
        materialSize:         (row[7]  || '').toString().trim(),
        materialSpecification:(row[8]  || '').toString().trim(),
        materialBrand:        (row[9]  || '').toString().trim(),
        skuCode:              (row[10] || '').toString().trim(),
        quantity:             (row[11] || '').toString().trim(),
        unitName:             (row[12] || '').toString().trim(),
        descriptionOfWork:    (row[13] || '').toString().trim(),
        requireDays:          (row[14] || '').toString().trim(),
        contractorFirm:       (row[15] || '').toString().trim(),
        remark:               (row[16] || '').toString().trim(),
        planned5:             (row[18] || '').toString().trim(),
        // Action Columns (U-Z)
        status5:              (row[20] || '').toString().trim(),
        deliveryByVendor:     (row[22] || '').toString().trim(),
        vendorFirmName5:      (row[23] || '').toString().trim(),
        siteEngineerInform:   (row[24] || '').toString().trim(),
        actionRemark:         (row[25] || '').toString().trim(),
        // AC - Material_Received
        materialReceived:     (row[28] || '').toString().trim(),
      }))
      .filter((item) => {
        // S (planned5) me data ho AND T (actual5) empty ho
        // AND AC (Material_Received) me "Yes" na ho
        const planned5 = item.planned5;
        const actual5 = (rows[item._rowIndex - 7][19] || '').toString().trim();
        const materialReceived = item.materialReceived;

        return (
          planned5 !== '' &&
          actual5 === '' &&
          materialReceived.toLowerCase() !== 'yes'
        );
      });

    return res.json({
      success: true,
      totalRows: filteredData.length,
      data: filteredData,
    });

  } catch (error) {
    console.error('No_Indent GET Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch No Indent data',
      error: error.message,
    });
  }
});


// ─── POST SAVE ACTION DATA ───────────────────────────────
router.post('/save-no-indent-action', async (req, res) => {
  try {
    const {
      uid,
      status5,
      deliveryByVendor,
      vendorFirmName5,
      siteEngineerInform,
      actionRemark,
    } = req.body;

    if (!uid || !status5 || !deliveryByVendor) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: uid, status5, deliveryByVendor',
      });
    }

    // Conditional validation
    if (deliveryByVendor === 'Yes' && !vendorFirmName5?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Vendor Firm Name is required when Delivery By Vendor is Yes',
      });
    }
    if (deliveryByVendor === 'No' && !siteEngineerInform?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Site Engineer Inform is required when Delivery By Vendor is No',
      });
    }

    const sid = process.env.SPREADSHEET_ID || spreadsheetId;

    // Find UID row in No_Indent sheet
    const uidResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: sid,
      range: 'No_Indent!B7:B',
    });

    const uids = uidResponse.data.values || [];
    const cleanedTarget = cleanUID(uid);
    const rowIndex = uids.findIndex(row => cleanUID(row[0]) === cleanedTarget);

    if (rowIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `UID ${uid} not found in No_Indent sheet`,
      });
    }

    const sheetRowNumber = rowIndex + 7; // Data starts at row 7

    // Build updates: U=status5, W=deliveryByVendor, X=vendorFirmName5, Y=siteEngineerInform, Z=actionRemark
    const updates = [
      { range: `No_Indent!U${sheetRowNumber}`, values: [[status5]] },
      { range: `No_Indent!W${sheetRowNumber}`, values: [[deliveryByVendor]] },
      { range: `No_Indent!X${sheetRowNumber}`, values: [[vendorFirmName5 || '']] },
      { range: `No_Indent!Y${sheetRowNumber}`, values: [[siteEngineerInform || '']] },
      { range: `No_Indent!Z${sheetRowNumber}`, values: [[actionRemark || '']] },
    ];

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: sid,
      resource: {
        valueInputOption: 'USER_ENTERED',
        data: updates,
      },
    });

    console.log(
      `✅ No_Indent UID ${cleanedTarget} → Row ${sheetRowNumber}: ` +
      `Status=${status5}, Delivery=${deliveryByVendor}`
    );

    res.json({
      success: true,
      message: 'Action saved successfully',
      updatedRow: sheetRowNumber,
      uid: cleanedTarget,
    });

  } catch (error) {
    console.error('No_Indent POST Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to save action',
      error: error.message,
    });
  }
});

module.exports = router;