const express = require('express');
const { sheets, spreadsheetId } = require('../config/googleSheet');
const router = express.Router();

// ─── GET /api/Bill_Checked_Step13 ──────────────────────────
router.get('/Bill_Checked_Step13', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Billing_FMS!A8:CK',
    });

    let data = response.data.values || [];

    // Step 13: BY(76)=PLANNED, BZ(77)=ACTUAL
    const filteredData = data
      .filter(row => {
        const planned13 = row[76] || '';
        const actual13  = row[77] || '';
        return planned13 && !actual13;
      })
      .map(row => ({
        // Step 13 specific
        planned13:             row[76] || '',

        // ── SAME row mapping as Bill_Checked_18Step ──
        UID:                   row[1]  || '',
        siteName:              row[3]  || '',
        engineerName:          row[4]  || '',
        materialType:          row[5]  || '',
        materialName:          row[6]  || '',
        materialSize:          row[7]  || '',
        specification:         row[8]  || '',
        brandName:             row[9]  || '',
        skuCode:               row[10] || '',
        quantity:              row[11] || '',
        unitName:              row[12] || '',
        description:           row[13] || '',
        contractor:            row[15] || '',
        finalIndentNo:         row[21] || '',
        finalIndentPDF:        row[22] || '',
        approvalQuotationNo:   row[23] || '',
        approvalQuotationPDF:  row[24] || '',
        poDate:                row[25] || '',
        poNumber:              row[26] || '',
        poPDF:                 row[27] || '',
        mrnNo:                 row[28] || '',
        mrnPDF:                row[29] || '',
        vendorFirmName:        row[33] || '',
        vendorContact:         row[34] || '',
        revisedQuantity:       row[35] || '',
        finalReceivedQuantity: row[36] || '',
        invoice11:             row[59] || '',
        invoicePhoto11:        row[60] || '',
       
        // Step 13 columns
        status13:              row[78] || '',
        timeDelay13:           row[79] || '',
        remark13:              row[80] || '',
      }));

    res.json({ success: true, data: filteredData });

  } catch (error) {
    console.error('Error fetching Bill_Checked_Step13:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// ─── POST /api/bill_checked_status_Step13 ──────────────────
router.post('/bill_checked_status_Step13', async (req, res) => {
  const { updates } = req.body;

  if (!Array.isArray(updates) || updates.length === 0) {
    return res.status(400).json({ success: false, message: 'Invalid or empty updates array' });
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Billing_FMS!A8:CK',
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No data found in sheet' });
    }

    const requests = [];

    updates.forEach(({ uid, STATUS_13, REMARK_13 }) => {
      const rowIndex = rows.findIndex(row => row[1] && String(row[1]).trim() === String(uid).trim());
      if (rowIndex !== -1) {
        const rowNumber = 8 + rowIndex;

        // CA(78) = STATUS_13
        if (STATUS_13 !== undefined) {
          requests.push({
            range: `Billing_FMS!CA${rowNumber}`,
            values: [[STATUS_13]],
          });
        }
        // CC(80) = REMARK_13
        if (REMARK_13 !== undefined) {
          requests.push({
            range: `Billing_FMS!CC${rowNumber}`,
            values: [[REMARK_13]],
          });
        }
      } else {
        console.warn(`UID ${uid} not found in sheet.`);
      }
    });

    if (requests.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        resource: {
          valueInputOption: 'RAW',
          data: requests,
        },
      });
    }

    res.json({ success: true, message: 'STATUS_13 and REMARK_13 updated successfully' });

  } catch (error) {
    console.error('Error updating:', error);
    res.status(500).json({ success: false, message: 'Failed to update' });
  }
});

module.exports = router;