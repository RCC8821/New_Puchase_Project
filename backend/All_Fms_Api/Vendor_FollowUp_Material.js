
const express = require('express');
const { sheets, spreadsheetId, drive } = require('../config/googleSheet');
const router = express.Router();
require('dotenv').config();

// ─── GET VENDOR FOLLOW-UP DATA ────────────────────────────
router.get('/get-vendor-follow-up-material', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Purchase_FMS!A2:CT',
    });

    const rows = response.data.values || [];
    console.log('Total rows:', rows.length);

    if (!rows.length) {
      return res.status(404).json({ error: 'No data found' });
    }

    // Debug
    if (rows[0]) {
      console.log('First row length:', rows[0].length);
      console.log('CM(90):', rows[0][90]);
      console.log('CN(91):', rows[0][91]);
      console.log('CO(92):', rows[0][92]);
    }

    // Step 7 Column indices (0-based from A):
    const PLANNED_7_IDX = 90;       // CM
    const ACTUAL_7_IDX = 91;        // CN
    const STATUS_7_IDX = 92;        // CO
    const FOLLOW_UP_COUNT_IDX = 93; // CP
    const EXP_DELIVERY_IDX = 94;    // CQ
    const REMARK_VENDOR_IDX = 95;   // CR

    const formData = rows
      .map((row, index) => {
        if (!row || row.every(c => !c || c.trim() === '')) return null;

        const planned7 = (row[PLANNED_7_IDX] || '').trim();
        const actual7 = (row[ACTUAL_7_IDX] || '').trim();
        const status7 = (row[STATUS_7_IDX] || '').trim();

        console.log(`Row ${index + 2}: UID="${(row[1] || '').trim()}" PLANNED_7="${planned7}" ACTUAL_7="${actual7}" STATUS_7="${status7}"`);

        // Show if: (ACTUAL_7 empty + PLANNED_7 filled) OR STATUS_7 = "Partition"
        const isNotDispatched = !actual7 && planned7;
        const isPartition = status7.toLowerCase() === 'partition';

        if (!isNotDispatched && !isPartition) return null;

        // Must have PO Number (step 6 done) - CE column
        const poNumber = (row[82] || '').trim(); // CE
        if (!poNumber) return null;

        return {
          UID: (row[1] || '').trim(),
          Req_No: (row[2] || '').trim(),
          Site_Name: (row[3] || '').trim(),
          Supervisor_Name: (row[4] || '').trim(),
          Material_Type: (row[5] || '').trim(),
          Material_Name: (row[6] || '').trim(),
          Material_Size: (row[7] || '').trim(),
          SKU_Code: (row[10] || '').trim(),
          Quantity: (row[11] || '').trim(),
          Unit_Name: (row[12] || '').trim(),
          Purpose: (row[13] || '').trim(),
          Require_Date: (row[14] || '').trim(),
          REVISED_QUANTITY_2: (row[24] || '').trim(),
          'DECIDED_BRAND/COMPANY_NAME_2': (row[25] || '').trim(),
          INDENT_NUMBER_3: (row[36] || '').trim(),
          PDF_URL_3: (row[37] || '').trim(),
          REMARK_3: (row[35] || '').trim(),
          // Step 5 (Quotation):
          QUOTATION_NO_5: (row[55] || '').trim(),
          Vendor_Firm_Name_5: (row[57] || '').trim(),
          Vendor_Contact: (row[59] || '').trim(),
          PDF_URL_5: (row[73] || '').trim(),
          // Step 6 (PO):
          PO_NUMBER_6: poNumber,
          PDF_URL_6: (row[83] || '').trim(), // CF
          EXPECTED_DELIVERY_DATE_6: (row[84] || '').trim(), // CG
          // Step 7 (Follow-up):
          PLANNED_7: planned7,
          ACTUAL_7: actual7,
          STATUS_7: status7,
          FOLLOW_UP_COUNT_7: (row[FOLLOW_UP_COUNT_IDX] || '').trim(),
          EXPECTED_DELIVERY_DATE_7: (row[EXP_DELIVERY_IDX] || '').trim(),
          REMARK_RECEIVED_VENDOR_7: (row[REMARK_VENDOR_IDX] || '').trim(),
        };
      })
      .filter(Boolean);

    console.log('Valid rows:', formData.length);

    if (!formData.length) {
      return res.status(404).json({ error: 'No vendor follow-up data found' });
    }

    return res.json({ data: formData });
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch data', details: error.message });
  }
});

// ─── UPDATE VENDOR FOLLOW-UP ──────────────────────────────
router.post('/update-vendor-follow-up-material', async (req, res) => {
  try {
    const { uid, status, expected_delivery_date, remark, follow_up_count } = req.body;

    if (!uid || !status || !expected_delivery_date || !remark || follow_up_count === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: uid, status, expected_delivery_date, remark, follow_up_count'
      });
    }

    // Fetch UIDs to find row
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Purchase_FMS!A2:B',
    });

    const rows = response.data.values || [];

    let sheetRow = -1;
    for (let i = 0; i < rows.length; i++) {
      const rowUID = (rows[i][1] || '').trim(); // B column
      if (rowUID === String(uid).trim()) {
        sheetRow = i + 2;
        break;
      }
    }

    if (sheetRow === -1) {
      return res.status(404).json({ error: `UID "${uid}" not found` });
    }

    console.log(`Found UID "${uid}" at row ${sheetRow}`);

    // Update Step 7 columns (CO, CP, CQ, CR)
    // CO = STATUS 7
    // CP = FOLLOW-UP COUNT 7
    // CQ = EXPECTED DELIVERY DATE 7
    // CR = REMARK RECEIVED VENDOR 7

    const newFollowUpCount = parseInt(follow_up_count, 10);
    if (isNaN(newFollowUpCount) || newFollowUpCount < 0) {
      return res.status(400).json({ error: 'Invalid follow_up_count' });
    }

    const updateData = [
      {
        range: `Purchase_FMS!CO${sheetRow}`,
        values: [[status]],
      },
      {
        range: `Purchase_FMS!CP${sheetRow}`,
        values: [[newFollowUpCount]],
      },
      {
        range: `Purchase_FMS!CQ${sheetRow}`,
        values: [[expected_delivery_date]],
      },
      {
        range: `Purchase_FMS!CR${sheetRow}`,
        values: [[remark]],
      },
    ];

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      resource: {
        valueInputOption: 'USER_ENTERED',
        data: updateData,
      },
    });

    console.log(`✅ Updated row ${sheetRow}: CO=${status}, CP=${newFollowUpCount}, CQ=${expected_delivery_date}`);

    return res.json({
      success: true,
      message: 'Vendor follow-up updated successfully',
      followUpCount: newFollowUpCount,
    });
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: 'Failed to update', details: error.message });
  }
});

module.exports = router;