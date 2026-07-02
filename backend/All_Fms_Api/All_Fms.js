const express = require('express');
const { sheets, spreadsheetId } = require('../config/googleSheet');
const router = express.Router();

// ─── GET APPROVE REQUIRED DATA ───────────────────────────
router.get('/get-approve-Requied', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Purchase_FMS!A8:W',
    });

    const rows = response.data.values || [];

    if (!rows.length) {
      return res.status(404).json({ error: 'No data found' });
    }

    const formData = rows
      .map((row, index) => {
        // Skip empty rows
        if (!row || row.every(cell => !cell || cell.trim() === '')) return null;

        // Column index (0-based):
        // A=0  B=1  C=2  D=3  E=4  F=5  G=6  H=7  I=8
        // J=9  K=10 L=11 M=12 N=13 O=14 P=15 Q=16
        // R=17 S=18 T=19 U=20 V=21 W=22

        const planned2 = (row[21] || '').trim(); // V: PLANNED 2
        const actual2  = (row[22] || '').trim(); // W: ACTUAL 2

        // Show only: PLANNED 2 filled + ACTUAL 2 empty
        if (!planned2 || actual2) return null;

        return {
          UID:           (row[1]  || '').trim(), // B
          Req_No:        (row[2]  || '').trim(), // C
          Project_Name:  (row[3]  || '').trim(), // D
          Engineer_Name: (row[4]  || '').trim(), // E
          Material_Type: (row[5]  || '').trim(), // F
          Material_Name: (row[6]  || '').trim(), // G
          Material_Size: (row[7]  || '').trim(), // H
          Specification: (row[8]  || '').trim(), // I
          Brand_Name:    (row[9]  || '').trim(), // J
          SKU_Code:      (row[10] || '').trim(), // K
          Quantity:      (row[11] || '').trim(), // L
          Unit_Name:     (row[12] || '').trim(), // M
          Description:   (row[13] || '').trim(), // N
          Require_Days:  (row[14] || '').trim(), // O
          Contractor:    (row[15] || '').trim(), // P
          Remark:        (row[16] || '').trim(), // Q
          PLANNED_2:     planned2,               // V
        };
      })
      .filter(Boolean);

    if (!formData.length) {
      return res.status(404).json({ error: 'No pending approvals found' });
    }

    return res.json({ data: formData });

  } catch (error) {
    console.error('Error fetching data:', error);
    return res.status(500).json({ error: 'Failed to fetch data', details: error.message });
  }
});


// ─── SAVE APPROVAL → Purchase_FMS (X, Y, Z, AB columns) ─
router.post('/approve-Requied-save', async (req, res) => {
  try {
    const { 
      UID, 
      STATUS,              // → X column
      REVISED_QUANTITY,    // → Y column
      DECIDED_BRAND,      // → Z column
      REMARKS,            // → AB column
    } = req.body;

    console.log('Received:', { UID, STATUS, REVISED_QUANTITY, DECIDED_BRAND, REMARKS });

    if (!UID && UID !== 0) {
      return res.status(400).json({ error: 'UID is required' });
    }
    if (!STATUS) {
      return res.status(400).json({ error: 'Status is required' });
    }

    // Find UID row in column B
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Purchase_FMS!B:B',
    });

    const allValues = response.data.values || [];
    let sheetRow = -1;

    for (let i = 0; i < allValues.length; i++) {
      const cellValue = String(allValues[i]?.[0] || '').trim();
      const searchUID = String(UID).trim();
      if (cellValue === searchUID) {
        sheetRow = i + 1;
        break;
      }
    }

    console.log('Found UID at row:', sheetRow);

    if (sheetRow === -1) {
      return res.status(404).json({
        error: `UID "${UID}" not found in sheet`,
      });
    }

    // Update X, Y, Z, AB columns
    const updates = [
      {
        range: `Purchase_FMS!X${sheetRow}`,  // STATUS
        values: [[STATUS]],
      },
      {
        range: `Purchase_FMS!Y${sheetRow}`,  // REVISED QUANTITY
        values: [[REVISED_QUANTITY || '']],
      },
      {
        range: `Purchase_FMS!Z${sheetRow}`,  // DECIDED BRAND/COMPANY NAME
        values: [[DECIDED_BRAND || '']],
      },
      {
        range: `Purchase_FMS!AB${sheetRow}`, // REMARKS
        values: [[REMARKS || '']],
      },
    ];

    console.log('Updating:', updates.map(u => `${u.range} = ${u.values[0][0]}`));

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      resource: {
        valueInputOption: 'USER_ENTERED',
        data: updates,
      },
    });

    console.log(`✅ Row ${sheetRow} updated successfully`);

    return res.json({
      success: true,
      message: 'Updated successfully',
      UID,
      sheetRow,
    });

  } catch (error) {
    console.error('❌ Save error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});


module.exports = router;