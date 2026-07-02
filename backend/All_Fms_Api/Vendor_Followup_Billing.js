

// const express = require('express');
// const { sheets, spreadsheetId } = require('../config/googleSheet');
// const router = express.Router();

// router.get('/vendor-FollowUp-Billing', async (req, res) => {
//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Billing_FMS!A9:CE',
//     });

//     let data = response.data.values || [];
//     console.log('Total data rows:', data.length);

//     let totalMatches = 0;

//     const filteredData = data
//       .map((row, idx) => {
//         const padded = Array(32).fill('');
//         row.forEach((cell, i) => {
//           if (i < 32) padded[i] = cell || '';
//         });

//         const planned12 = String(padded[27] || '').trim();     // CF → index 27
//         const status12 = String(padded[29] || '').trim();      // CH → index 29 (STATUS 12)

//         return { row: padded, planned12, status12, originalIndex: idx + 9 };
//       })
//       .filter(item => {
//         const { planned12, status12 } = item;

//         const hasPlanned = planned12 !== '';
//         const notReceived = !status12.toLowerCase().includes('received');

//         const match = hasPlanned && notReceived;

//         if (match) {
//           totalMatches++;
//           console.log(`MATCH #${totalMatches} (Row ${item.originalIndex}): PLANNED12="${item.planned12}", STATUS12="${item.status12}"`);
//         }

//         return match;
//       })
//       .map(item => ({
//         UID: item.row[1] || '',
//         siteName: item.row[3] || '',
//         supervisorName: item.row[4] || '',
//         materialName: item.row[7] || '',
//         revisedQuantity: item.row[25] || '',
//         finalReceivedQuantity: item.row[26] || '',
//         unitName: item.row[9] || '',
//         vendorFirmName: item.row[23] || '',
//         poNumber: item.row[16] || '',
//         planned12: item.planned12,
//         status12: item.status12,           // SIRF YEHI DIKHEGA
//         followUpCount12: item.row[30] || '',
//         remark12: item.row[32] || '',
//         vendorContact: item.row[24] || '',
//       }));

//     console.log('TOTAL MATCHES:', totalMatches);

//     res.json({
//       success: true,
//       data: filteredData
//     });
//   } catch (error) {
//     console.error('Error:', error.message);
//     res.status(500).json({
//       success: false,
//       error: 'Failed',
//       details: error.message
//     });
//   }
// });




// router.post('/update-followup-Billing', async (req, res) => {
//   try {
//     const data = req.body;
//     if (!Array.isArray(data) || data.length === 0)
//       return res.status(400).json({ error: 'Invalid data: Expected non-empty array' });

//     // ---- VALIDATE ----
//     const invalid = data.filter(i => !i.UID?.trim() || !i.status12?.trim() || !i.remark12?.trim());
//     if (invalid.length)
//       return res.status(400).json({ error: 'UID, status12, remark12 required' });

//     // ---- READ SHEET ----
//     const resp = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Billing_FMS!A8:CK',   // keep wide enough to read the count column
//     });
//     const values = resp.data.values || [];

//     const updates = [];
//     let updatedCount = 0;

//     // ---- CONFIG ----
//     const COL_STATUS = 'AD';   // <-- adjust
//     const COL_COUNT  = 'AE';   // <-- adjust
//     const COL_REMARK = 'AG';   // <-- adjust

//     for (const item of data) {
//       const { UID, status12, remark12 } = item;
//       const rowIdx = values.findIndex(r => r[1] === UID);
//       if (rowIdx === -1) continue;

//       const sheetRow = 8 + rowIdx;
//       const curCount = parseInt(values[rowIdx][30] || '0', 10); // AE = index 30
//       const newCount = curCount + 1;

//       updates.push(
//         { range: `Billing_FMS!${COL_STATUS}${sheetRow}`, values: [[status12]] },
//         { range: `Billing_FMS!${COL_COUNT}${sheetRow}`,  values: [[newCount]] },
//         { range: `Billing_FMS!${COL_REMARK}${sheetRow}`, values: [[remark12]] }
//       );
//       updatedCount++;
//     }

//     if (!updates.length)
//       return res.status(400).json({ error: 'No rows to update' });

//     await sheets.spreadsheets.values.batchUpdate({
//       spreadsheetId,
//       requestBody: { valueInputOption: 'RAW', data: updates },
//     });

//     res.json({ success: true, updatedRows: updatedCount });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Failed to update: ' + err.message });
//   }
// });

// module.exports=router








const express = require('express');
const { sheets, spreadsheetId } = require('../config/googleSheet');
const router = express.Router();

// ─── GET VENDOR FOLLOW-UP BILLING ─────────────────────────
router.get('/vendor-FollowUp-Billing', async (req, res) => {
  try {
    // Row 7 = header, Row 8 se data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Billing_FMS!A8:BB',
    });

    const rows = response.data.values || [];
    console.log('Total rows:', rows.length);

    if (!rows.length) {
      return res.json({ success: true, data: [] });
    }

    // Column indices (0-based from A):
    // B=1 UID, D=3 Project, E=4 Engineer
    // G=6 Material_Name, H=7 Size
    // M=12 Unit, AA=26 PO Number
    // AH=33 Vendor Firm, AI=34 Vendor Contact
    // AJ=35 Revised Qty, AK=36 Final Received Qty
    // AW=48 PLANNED_10, AX=49 ACTUAL_10
    // AY=50 STATUS_10, AZ=51 FOLLOW-UP COUNT_10
    // BA=52 TIME DELAY_10, BB=53 REMARK_10

    const PLANNED_IDX = 48;   // AW
    const ACTUAL_IDX = 49;    // AX
    const STATUS_IDX = 50;    // AY
    const COUNT_IDX = 51;     // AZ
    const REMARK_IDX = 53;    // BB

    let matchCount = 0;

    const filteredData = rows
      .map((row, idx) => {
        if (!row || row.every(c => !c || c.trim() === '')) return null;

        const planned = (row[PLANNED_IDX] || '').trim();
        const actual = (row[ACTUAL_IDX] || '').trim();
        const status = (row[STATUS_IDX] || '').trim();

        // Filter: PLANNED filled + STATUS not "Received"
        const hasPlanned = !!planned;
        const notReceived = !status.toLowerCase().includes('received');

        if (!hasPlanned || !notReceived) return null;

        matchCount++;
        console.log(`Match #${matchCount} Row ${idx + 8}: UID=${(row[1] || '').trim()} PLANNED="${planned}" STATUS="${status}"`);

        return {
          UID: (row[1] || '').trim(),
          reqNo: (row[2] || '').trim(),
          projectName: (row[3] || '').trim(),
          engineerName: (row[4] || '').trim(),
          materialType: (row[5] || '').trim(),
          materialName: (row[6] || '').trim(),
          materialSize: (row[7] || '').trim(),
          specification: (row[8] || '').trim(),
          brandName: (row[9] || '').trim(),
          skuCode: (row[10] || '').trim(),
          quantity: (row[11] || '').trim(),
          unitName: (row[12] || '').trim(),
          description: (row[13] || '').trim(),
          contractor: (row[15] || '').trim(),
          indentNo: (row[21] || '').trim(),
          indentPdf: (row[22] || '').trim(),
          quotationNo: (row[23] || '').trim(),
          quotationPdf: (row[24] || '').trim(),
          poDate: (row[25] || '').trim(),
          poNumber: (row[26] || '').trim(),
          poPdf: (row[27] || '').trim(),
          mrnNo: (row[28] || '').trim(),
          mrnPdf: (row[29] || '').trim(),
          transportCharges: (row[30] || '').trim(),
          freightCharges: (row[31] || '').trim(),
          vendorBrand: (row[32] || '').trim(),
          vendorFirmName: (row[33] || '').trim(),
          vendorContact: (row[34] || '').trim(),
          revisedQuantity: (row[35] || '').trim(),
          finalReceivedQty: (row[36] || '').trim(),
          planned10: planned,
          actual10: actual,
          status10: status,
          followUpCount10: (row[COUNT_IDX] || '').trim(),
          remark10: (row[REMARK_IDX] || '').trim(),
          _rowIndex: idx + 8,
        };
      })
      .filter(Boolean);

    console.log('Total matches:', matchCount);

    res.json({ success: true, data: filteredData });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ success: false, error: 'Failed', details: error.message });
  }
});

// ─── UPDATE FOLLOW-UP BILLING ─────────────────────────────
router.post('/update-followup-Billing', async (req, res) => {
  try {
    const data = req.body;
    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ error: 'Invalid data' });
    }

    const invalid = data.filter(i => !i.UID?.trim() || !i.status10?.trim() || !i.remark10?.trim());
    if (invalid.length) {
      return res.status(400).json({ error: 'UID, status10, remark10 required' });
    }

    // Read sheet to find rows
    const resp = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Billing_FMS!A8:BB',
    });
    const values = resp.data.values || [];

    const updates = [];
    let updatedCount = 0;

    // Column positions:
    // AY = STATUS_10 (index 50)
    // AZ = FOLLOW-UP COUNT_10 (index 51)
    // BB = REMARK_10 (index 53)

    for (const item of data) {
      const { UID, status10, remark10 } = item;

      // Find row by UID (column B = index 1)
      const rowIdx = values.findIndex(r => (r[1] || '').trim() === UID.trim());
      if (rowIdx === -1) {
        console.warn(`UID ${UID} not found`);
        continue;
      }

      const sheetRow = 8 + rowIdx;
      const currentCount = parseInt(values[rowIdx][51] || '0', 10); // AZ = index 51
      const newCount = currentCount + 1;

      updates.push(
        { range: `Billing_FMS!AY${sheetRow}`, values: [[status10]] },      // STATUS_10
        { range: `Billing_FMS!AZ${sheetRow}`, values: [[newCount]] },       // FOLLOW-UP COUNT_10
        { range: `Billing_FMS!BB${sheetRow}`, values: [[remark10]] },       // REMARK_10
      );
      updatedCount++;

      console.log(`UID ${UID} → Row ${sheetRow}: AY=${status10}, AZ=${newCount}, BB=${remark10}`);
    }

    if (!updates.length) {
      return res.status(400).json({ error: 'No rows to update' });
    }

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: { valueInputOption: 'USER_ENTERED', data: updates },
    });

    console.log(`✅ Updated ${updatedCount} rows`);
    res.json({ success: true, updatedRows: updatedCount });

  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'Failed: ' + err.message });
  }
});

module.exports = router;