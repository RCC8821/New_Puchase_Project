const express = require('express');
const { sheets, spreadsheetId } = require('../config/googleSheet');
const router = express.Router();

// ─── GET /api/Bill_Checked_12 ──────────────────────────────
router.get('/Bill_Checked_12', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Billing_FMS!A8:CK',
    });

    const rows = response.data.values || [];

    if (!rows.length) {
      return res.json({ success: true, data: [] });
    }

    // Step 12 columns (0-based)
    const PLANNED_12 = 67; // BP
    const ACTUAL_12  = 68; // BQ
    const STATUS_12  = 69; // BR
    const DELAY_12   = 70; // BS
    const REMARK_12  = 71; // BT

    const filteredData = rows
      .filter(row => {
        const planned = row[PLANNED_12] || '';
        const actual  = row[ACTUAL_12]  || '';
        return planned && !actual;
      })
      .map(row => ({
        // ── EXACT Sheet Header Mapping ──
        // A(0)=Timestamp, B(1)=UID, C(2)=ReqNo, D(3)=Project, E(4)=Engineer
        // F(5)=MaterialType, G(6)=MaterialName, H(7)=MaterialSize
        // I(8)=Specification, J(9)=BrandName, K(10)=SKU, L(11)=Qty
        // M(12)=Unit, N(13)=Description, O(14)=RequireDays, P(15)=Contractor
        // V(21)=IndentNo, W(22)=IndentPDF, X(23)=QuotationNo, Y(24)=QuotationPDF
        // Z(25)=PODate, AA(26)=PONumber, AB(27)=POPDF
        // AC(28)=MRNNo, AD(29)=MRNPDF
        // AH(33)=VendorFirm, AI(34)=VendorContact
        // AJ(35)=RevisedQty, AK(36)=FinalReceivedQty

        planned12:             row[PLANNED_12] || '',
        UID:                   row[1]  || '',
        reqNo:                 row[2]  || '',
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
        transportCharges:      row[30] || '',
        freightCharges:        row[31] || '',
        vendorBrand:           row[32] || '',
        vendorFirmName:        row[33] || '',
        vendorContact:         row[34] || '',
        revisedQuantity:       row[35] || '',
        finalReceivedQuantity: row[36] || '',

        // Previous step invoice
        invoice11:             row[59] || '',
        invoicePhoto11:        row[60] || '',

        // Step 12 specific (BP-BT)
        status12:              row[STATUS_12] || '',
        timeDelay12:           row[DELAY_12]  || '',
        remark12:              row[REMARK_12] || '',
      }));

    res.json({ success: true, data: filteredData });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// ─── POST /api/bill_checked_status_12 ─────────────────────
router.post('/bill_checked_status_12', async (req, res) => {
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
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'No data found' });
    }

    const requests = [];

    updates.forEach(({ uid, STATUS_12, REMARK_12 }) => {
      const rowIndex = rows.findIndex(
        row => row[1] && String(row[1]).trim() === String(uid).trim()
      );

      if (rowIndex !== -1) {
        const rowNumber = 8 + rowIndex;

        if (STATUS_12 !== undefined) {
          requests.push({
            range: `Billing_FMS!BR${rowNumber}`,
            values: [[STATUS_12]],
          });
        }
        if (REMARK_12 !== undefined) {
          requests.push({
            range: `Billing_FMS!BT${rowNumber}`,
            values: [[REMARK_12]],
          });
        }
      }
    });

    if (requests.length === 0) {
      return res.status(400).json({ success: false, message: 'No matching UIDs found' });
    }

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      resource: { valueInputOption: 'RAW', data: requests },
    });

    res.json({ success: true, message: 'STATUS_12 and REMARK_12 updated successfully' });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update' });
  }
});

module.exports = router;