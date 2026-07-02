const express = require('express');
const { sheets, spreadsheetId } = require('../config/googleSheet');
const router = express.Router();

// ── Helper ────────────────────────────────────────────────
const cleanValue = (val) => {
  if (val === null || val === undefined) return '';
  return String(val).replace(/^'+|'+$/g, '').trim();
};

// ─── GET /api/Bill_Tally_14 ────────────────────────────────
router.get('/Bill_Tally_14', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Billing_FMS!A8:DA',
    });

    const data = response.data.values || [];

    // ✅ FIXED: CF=83, CG=84
    const filteredData = data
      .filter(row => {
        const planned14 = row[83] ? String(row[83]).trim() : '';  // CF
        const actual14  = row[84] ? String(row[84]).trim() : '';  // CG
        return planned14 && !actual14;
      })
      .map(row => ({
        planned14:             row[83] ? String(row[83]).trim() : '',  // CF

        // Same mapping
        UID:                   row[1]  ? String(row[1]).trim()  : '',
        siteName:              row[3]  ? String(row[3]).trim()  : '',
        materialType:          row[5]  ? String(row[5]).trim()  : '',
        materialName:          row[6]  ? String(row[6]).trim()  : '',
        materialSize:          row[7]  ? String(row[7]).trim()  : '',
        specification:         row[8]  ? String(row[8]).trim()  : '',
        brandName:             row[9]  ? String(row[9]).trim()  : '',
        skuCode:               row[10] ? String(row[10]).trim() : '',
        unitName:              row[12] ? String(row[12]).trim() : '',
        finalIndentNo:         row[21] ? String(row[21]).trim() : '',
        finalIndentPDF:        row[22] ? String(row[22]).trim() : '',
        approvalQuotationNo:   row[23] ? String(row[23]).trim() : '',
        approvalQuotationPDF:  row[24] ? String(row[24]).trim() : '',
        poDate:                row[25] ? String(row[25]).trim() : '',
        poNumber:              row[26] ? String(row[26]).trim() : '',
        poPDF:                 row[27] ? String(row[27]).trim() : '',
        mrnNo:                 row[28] ? String(row[28]).trim() : '',
        mrnPDF:                row[29] ? String(row[29]).trim() : '',
        vendorFirmName:        row[33] ? String(row[33]).trim() : '',
        vendorContact:         row[34] ? String(row[34]).trim() : '',
        revisedQuantity:       row[35] ? String(row[35]).trim() : '',
        finalReceivedQuantity: row[36] ? String(row[36]).trim() : '',
        invoice11:             row[59] ? String(row[59]).trim() : '',
        invoicePhoto11:        row[60] ? String(row[60]).trim() : '',
      }))
      .filter(row => row.planned14);

    res.json({ success: true, data: filteredData });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// ─── POST /api/bill_tally_entry_14 ─────────────────────────
router.post('/bill_tally_entry_14', async (req, res) => {
  const data = req.body;

  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    return res.status(400).json({ success: false, message: 'Invalid or empty items array' });
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Billing_FMS!A8:DA',
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No data found in sheet' });
    }

    const requests = [];

    // CF to DA column mapping
    const COL = {
      STATUS_14:          'CH', // 87
      VENDOR_FIRM:        'CJ', // 89
      BILL_NO:            'CK', // 90
      BILL_DATE:          'CL', // 91
      AMOUNT:             'CM', // 92
      GST_PERCENT:        'CN', // 93
      IGST_PERCENT:       'CO', // 94
      CGST:               'CP', // 95
      SGST:               'CQ', // 96
      IGST:               'CR', // 97
      TOTAL:              'CS', // 98
      TOTAL_BILL_AMOUNT:  'CT', // 99
      CGST_TOTAL:         'CU', // 100
      SGST_TOTAL:         'CV', // 101
      IGST_TOTAL:         'CW', // 102
      TRANSPORT_WO_GST:   'CX', // 103
      NET_TRANSPORT:      'CY', // 104
      GRAND_TOTAL:        'CZ', // 105
      REMARK:             'DA', // 106
    };

    const transportBase   = parseFloat(cleanValue(data.transportWOGST)) || 0;
    const gstRate         = parseFloat(cleanValue(data.gstRate)) || 0;
    const transportGstOnly = (transportBase * (gstRate / 100)).toFixed(2);
    const grandTotal       = cleanValue(data.netAmount) || '0.00';

    const totalBillAmount = cleanValue(data.totalBillAmount) || '0.00';
    const totalCGST       = cleanValue(data.totalCGST)       || '0.00';
    const totalSGST       = cleanValue(data.totalSGST)       || '0.00';
    const totalIGST       = cleanValue(data.totalIGST)       || '0.00';

    const itemRows = [];

    const addUpdate = (colLetter, value, targetRow) => {
      if (value !== undefined && value !== null && value !== '' && targetRow !== null) {
        requests.push({
          range: `Billing_FMS!${colLetter}${targetRow}`,
          values: [[value]],
        });
      }
    };

    // Process items
    data.items.forEach((item) => {
      const isTotalRow = item.uid === 'TOTAL';

      let rowIndex = -1;
      if (!isTotalRow) {
        rowIndex = rows.findIndex(
          row => row[1] && String(row[1]).trim() === String(item.uid).trim()
        );
      }

      if (rowIndex !== -1 || isTotalRow) {
        const rowNumber = isTotalRow ? null : 8 + rowIndex;
        itemRows.push({ item, rowNumber, isTotalRow });

        if (!isTotalRow) {
          addUpdate(COL.STATUS_14,    cleanValue(data.status16),      rowNumber);
          addUpdate(COL.VENDOR_FIRM,  cleanValue(data.vendorFirmName), rowNumber);
          addUpdate(COL.BILL_NO,      cleanValue(data.billNo),         rowNumber);
          addUpdate(COL.BILL_DATE,    cleanValue(data.billDate),       rowNumber);
          addUpdate(COL.AMOUNT,       cleanValue(item.amount),         rowNumber);
          addUpdate(COL.TOTAL,        cleanValue(item.total),          rowNumber);
          addUpdate(COL.REMARK,       cleanValue(data.remark),         rowNumber);
          addUpdate(COL.GST_PERCENT,  cleanValue(item.gstPercent),     rowNumber);
          addUpdate(COL.IGST_PERCENT, cleanValue(item.igst !== '0' ? item.igst : '0'), rowNumber);
          addUpdate(COL.CGST,         cleanValue(item.cgstAmt),        rowNumber);
          addUpdate(COL.SGST,         cleanValue(item.sgstAmt),        rowNumber);
          addUpdate(COL.IGST,         cleanValue(item.igstAmt),        rowNumber);
        }
      }
    });

    if (itemRows.length === 0) {
      return res.status(400).json({ success: false, message: 'No matching UIDs found' });
    }

    const validRows    = itemRows.filter(r => !r.isTotalRow);
    const lastValidRow = validRows.length > 0
      ? validRows.reduce((max, curr) => curr.rowNumber > max.rowNumber ? curr : max)
      : null;

    // Total columns - last valid row
    const totalTargetRows = [];
    if (lastValidRow) totalTargetRows.push(lastValidRow.rowNumber);
    const totalRowEntry = itemRows.find(r => r.isTotalRow);
    if (totalRowEntry && totalRowEntry.rowNumber) totalTargetRows.push(totalRowEntry.rowNumber);

    totalTargetRows.forEach(rowNum => {
      requests.push({ range: `Billing_FMS!${COL.TOTAL_BILL_AMOUNT}${rowNum}`, values: [[totalBillAmount]] });
      requests.push({ range: `Billing_FMS!${COL.CGST_TOTAL}${rowNum}`,       values: [[totalCGST]] });
      requests.push({ range: `Billing_FMS!${COL.SGST_TOTAL}${rowNum}`,       values: [[totalSGST]] });
      requests.push({ range: `Billing_FMS!${COL.IGST_TOTAL}${rowNum}`,       values: [[totalIGST]] });
    });

    // Transport & Grand Total - last row
    if (lastValidRow) {
      const row = lastValidRow.rowNumber;
      requests.push({ range: `Billing_FMS!${COL.TRANSPORT_WO_GST}${row}`, values: [[cleanValue(data.transportWOGST)]] });
      requests.push({ range: `Billing_FMS!${COL.NET_TRANSPORT}${row}`,    values: [[transportGstOnly]] });
      requests.push({ range: `Billing_FMS!${COL.GRAND_TOTAL}${row}`,      values: [[grandTotal]] });
    }

    // Other rows ko '-' de do
    validRows.forEach(({ rowNumber }) => {
      const isLast = lastValidRow && rowNumber === lastValidRow.rowNumber;
      if (!isLast) {
        ['CT', 'CU', 'CV', 'CW', 'CX', 'CY', 'CZ'].forEach(col => {
          requests.push({ range: `Billing_FMS!${col}${rowNumber}`, values: [['-']] });
        });
      }
    });

    if (requests.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        resource: {
          valueInputOption: 'USER_ENTERED',
          data: requests,
        },
      });
    }

    res.json({ success: true, message: 'Bill tally entry 14 updated successfully' });

  } catch (error) {
    console.error('Error updating bill tally entry 14:', error);
    res.status(500).json({ success: false, message: 'Failed to update bill tally entry 14' });
  }
});

module.exports = router;