

// const express = require('express');
// const { sheets, spreadsheetId } = require('../config/googleSheet');
// const router = express.Router();

// const cleanValue = (val) => {
//   if (val === null || val === undefined) return '';
//   return String(val).replace(/^'+|'+$/g, '').trim();
// };

// // ─── GET /api/Bill_Tally_14 ────────────────────────────────
// router.get('/Bill_Tally_14', async (req, res) => {
//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Billing_FMS!A8:DA',
//     });

//     const data = response.data.values || [];

//     console.log('=== BILL TALLY 14 DEBUG ===');
//     console.log('Total rows:', data.length);
//     if (data.length > 0) {
//       console.log('Row[79] CF (PLANNED_14):', data[0][79]);
//       console.log('Row[80] CG (ACTUAL_14):', data[0][80]);
//     }

    

//     const PLANNED_14 = 79;
//     const ACTUAL_14  = 80;

//     let matchCount = 0;

//     const filteredData = data
//       .filter((row, idx) => {
//         if (!row || row.length === 0) return false;
//         const planned14 = row[PLANNED_14] ? String(row[PLANNED_14]).trim() : '';
//         const actual14  = row[ACTUAL_14]  ? String(row[ACTUAL_14]).trim()  : '';

//         const isValid = planned14 && !actual14;
//         if (isValid) {
//           matchCount++;
//           console.log(`Match Row ${idx + 8}: UID=${row[1]} PLANNED="${planned14}"`);
//         }
//         return isValid;
//       })
//       .map(row => ({
//         planned14:             row[PLANNED_14] ? String(row[PLANNED_14]).trim() : '',

//         UID:                   row[1]  ? String(row[1]).trim()  : '',
//         siteName:              row[3]  ? String(row[3]).trim()  : '',
//         materialType:          row[5]  ? String(row[5]).trim()  : '',
//         materialName:          row[6]  ? String(row[6]).trim()  : '',
//         materialSize:          row[7]  ? String(row[7]).trim()  : '',
//         specification:         row[8]  ? String(row[8]).trim()  : '',
//         brandName:             row[9]  ? String(row[9]).trim()  : '',
//         skuCode:               row[10] ? String(row[10]).trim() : '',
//         unitName:              row[12] ? String(row[12]).trim() : '',
//         finalIndentNo:         row[21] ? String(row[21]).trim() : '',
//         finalIndentPDF:        row[22] ? String(row[22]).trim() : '',
//         approvalQuotationNo:   row[23] ? String(row[23]).trim() : '',
//         approvalQuotationPDF:  row[24] ? String(row[24]).trim() : '',
//         poDate:                row[25] ? String(row[25]).trim() : '',
//         poNumber:              row[26] ? String(row[26]).trim() : '',
//         poPDF:                 row[27] ? String(row[27]).trim() : '',
//         mrnNo:                 row[28] ? String(row[28]).trim() : '',
//         mrnPDF:                row[29] ? String(row[29]).trim() : '',
//         vendorFirmName:        row[33] ? String(row[33]).trim() : '',
//         vendorContact:         row[34] ? String(row[34]).trim() : '',
//         revisedQuantity:       row[35] ? String(row[35]).trim() : '',
//         finalReceivedQuantity: row[36] ? String(row[36]).trim() : '',
//         invoice11:             row[59] ? String(row[59]).trim() : '',
//         invoicePhoto11:        row[60] ? String(row[60]).trim() : '',
//       }));

//     console.log(`✅ Total matches: ${matchCount}`);
//     console.log('=========================');

//     res.json({ success: true, data: filteredData });

//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).json({ error: 'Failed to fetch data' });
//   }
// });

// // ─── POST /api/bill_tally_entry_14 ─────────────────────────
// router.post('/bill_tally_entry_14', async (req, res) => {
//   const data = req.body;

//   if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
//     return res.status(400).json({ success: false, message: 'Invalid or empty items array' });
//   }

//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Billing_FMS!A8:DA',
//     });

//     const rows = response.data.values || [];
//     if (rows.length === 0) {
//       return res.status(404).json({ success: false, message: 'No data found in sheet' });
//     }

//     const requests = [];

//     // ✅ CF=83 base - so:
//     // CH (STATUS_14) = index 85
//     // CJ (VENDOR)    = index 87
//     // CK (BILL_NO)   = index 88
//     // etc.
//     const COL = {
//       STATUS_14:          'CH',
//       VENDOR_FIRM:        'CJ',
//       BILL_NO:            'CK',
//       BILL_DATE:          'CL',
//       AMOUNT:             'CM',
//       GST_PERCENT:        'CN',
//       IGST_PERCENT:       'CO',
//       CGST:               'CP',
//       SGST:               'CQ',
//       IGST:               'CR',
//       TOTAL:              'CS',
//       TOTAL_BILL_AMOUNT:  'CT',
//       CGST_TOTAL:         'CU',
//       SGST_TOTAL:         'CV',
//       IGST_TOTAL:         'CW',
//       TRANSPORT_WO_GST:   'CX',
//       NET_TRANSPORT:      'CY',
//       GRAND_TOTAL:        'CZ',
//       REMARK:             'DA',
//     };

//     const transportBase    = parseFloat(cleanValue(data.transportWOGST)) || 0;
//     const gstRate          = parseFloat(cleanValue(data.gstRate)) || 0;
//     const transportGstOnly = (transportBase * (gstRate / 100)).toFixed(2);
//     const grandTotal       = cleanValue(data.netAmount) || '0.00';

//     const totalBillAmount = cleanValue(data.totalBillAmount) || '0.00';
//     const totalCGST       = cleanValue(data.totalCGST)       || '0.00';
//     const totalSGST       = cleanValue(data.totalSGST)       || '0.00';
//     const totalIGST       = cleanValue(data.totalIGST)       || '0.00';

//     const itemRows = [];

//     const addUpdate = (colLetter, value, targetRow) => {
//       if (value !== undefined && value !== null && value !== '' && targetRow !== null) {
//         requests.push({
//           range: `Billing_FMS!${colLetter}${targetRow}`,
//           values: [[value]],
//         });
//       }
//     };

//     data.items.forEach((item) => {
//       const isTotalRow = item.uid === 'TOTAL';

//       let rowIndex = -1;
//       if (!isTotalRow) {
//         rowIndex = rows.findIndex(
//           row => row[1] && String(row[1]).trim() === String(item.uid).trim()
//         );
//       }

//       if (rowIndex !== -1 || isTotalRow) {
//         const rowNumber = isTotalRow ? null : 8 + rowIndex;
//         itemRows.push({ item, rowNumber, isTotalRow });

//         if (!isTotalRow) {
//           addUpdate(COL.STATUS_14,    cleanValue(data.status16),      rowNumber);
//           addUpdate(COL.VENDOR_FIRM,  cleanValue(data.vendorFirmName), rowNumber);
//           addUpdate(COL.BILL_NO,      cleanValue(data.billNo),         rowNumber);
//           addUpdate(COL.BILL_DATE,    cleanValue(data.billDate),       rowNumber);
//           addUpdate(COL.AMOUNT,       cleanValue(item.amount),         rowNumber);
//           addUpdate(COL.TOTAL,        cleanValue(item.total),          rowNumber);
//           addUpdate(COL.REMARK,       cleanValue(data.remark),         rowNumber);
//           addUpdate(COL.GST_PERCENT,  cleanValue(item.gstPercent),     rowNumber);
//           addUpdate(COL.IGST_PERCENT, cleanValue(item.igst !== '0' ? item.igst : '0'), rowNumber);
//           addUpdate(COL.CGST,         cleanValue(item.cgstAmt),        rowNumber);
//           addUpdate(COL.SGST,         cleanValue(item.sgstAmt),        rowNumber);
//           addUpdate(COL.IGST,         cleanValue(item.igstAmt),        rowNumber);
//         }
//       }
//     });

//     if (itemRows.length === 0) {
//       return res.status(400).json({ success: false, message: 'No matching UIDs found' });
//     }

//     const validRows    = itemRows.filter(r => !r.isTotalRow);
//     const lastValidRow = validRows.length > 0
//       ? validRows.reduce((max, curr) => curr.rowNumber > max.rowNumber ? curr : max)
//       : null;

//     const totalTargetRows = [];
//     if (lastValidRow) totalTargetRows.push(lastValidRow.rowNumber);
//     const totalRowEntry = itemRows.find(r => r.isTotalRow);
//     if (totalRowEntry && totalRowEntry.rowNumber) totalTargetRows.push(totalRowEntry.rowNumber);

//     totalTargetRows.forEach(rowNum => {
//       requests.push({ range: `Billing_FMS!${COL.TOTAL_BILL_AMOUNT}${rowNum}`, values: [[totalBillAmount]] });
//       requests.push({ range: `Billing_FMS!${COL.CGST_TOTAL}${rowNum}`,       values: [[totalCGST]] });
//       requests.push({ range: `Billing_FMS!${COL.SGST_TOTAL}${rowNum}`,       values: [[totalSGST]] });
//       requests.push({ range: `Billing_FMS!${COL.IGST_TOTAL}${rowNum}`,       values: [[totalIGST]] });
//     });

//     if (lastValidRow) {
//       const row = lastValidRow.rowNumber;
//       requests.push({ range: `Billing_FMS!${COL.TRANSPORT_WO_GST}${row}`, values: [[cleanValue(data.transportWOGST)]] });
//       requests.push({ range: `Billing_FMS!${COL.NET_TRANSPORT}${row}`,    values: [[transportGstOnly]] });
//       requests.push({ range: `Billing_FMS!${COL.GRAND_TOTAL}${row}`,      values: [[grandTotal]] });
//     }

//     validRows.forEach(({ rowNumber }) => {
//       const isLast = lastValidRow && rowNumber === lastValidRow.rowNumber;
//       if (!isLast) {
//         ['CT', 'CU', 'CV', 'CW', 'CX', 'CY', 'CZ'].forEach(col => {
//           requests.push({ range: `Billing_FMS!${col}${rowNumber}`, values: [['-']] });
//         });
//       }
//     });

//     if (requests.length > 0) {
//       await sheets.spreadsheets.values.batchUpdate({
//         spreadsheetId,
//         resource: { valueInputOption: 'USER_ENTERED', data: requests },
//       });
//     }

//     res.json({ success: true, message: 'Bill tally entry 14 updated successfully' });

//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).json({ success: false, message: 'Failed' });
//   }
// });

// module.exports = router;







const express = require('express');
const { sheets, spreadsheetId } = require('../config/googleSheet');
const router = express.Router();

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

    // ✅ Fetch Purchase_FMS - extend range to include Y column
    const purchaseResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Purchase_FMS!A2:DQ',
    });
    const purchaseRows = purchaseResponse.data.values || [];

    // ✅ Create TWO maps from Purchase_FMS
    const uidToPoAmountMap = new Map();  // BJ = index 61
    const uidToQtyMap = new Map();        // Y = index 119

    purchaseRows.forEach(row => {
      const uid = (row[1] || '').toString().trim();  // B column = UID
      const poAmount = (row[61] || '').toString().trim();  // BJ column = PO Amount
      const qty = (row[119] || '').toString().trim();        // ✅ Y column = Qty

      if (uid) {
        uidToPoAmountMap.set(uid, poAmount);
        uidToQtyMap.set(uid, qty);  // ✅ Store Qty
      }
    });

    console.log('=== BILL TALLY 14 DEBUG ===');
    console.log('Total Billing rows:', data.length);
    console.log('Total Purchase rows:', purchaseRows.length);
    console.log('PO Amount map size:', uidToPoAmountMap.size);
    console.log('Qty map size:', uidToQtyMap.size);

    const PLANNED_14 = 79;
    const ACTUAL_14 = 80;

    let matchCount = 0;

    const filteredData = data
      .filter((row) => {
        if (!row || row.length === 0) return false;
        const planned14 = row[PLANNED_14] ? String(row[PLANNED_14]).trim() : '';
        const actual14 = row[ACTUAL_14] ? String(row[ACTUAL_14]).trim() : '';
        const isValid = planned14 && !actual14;
        if (isValid) matchCount++;
        return isValid;
      })
      .map(row => {
        const uid = row[1] ? String(row[1]).trim() : '';
        const poAmount = uidToPoAmountMap.get(uid) || '';
        const qty = uidToQtyMap.get(uid) || '';  // ✅ Get Qty from Purchase_FMS

        return {
          planned14:             row[PLANNED_14] ? String(row[PLANNED_14]).trim() : '',
          UID:                   uid,
          siteName:              row[3]  ? String(row[3]).trim()  : '',
          materialType:          row[5]  ? String(row[5]).trim()  : '',
          materialName:          row[6]  ? String(row[6]).trim()  : '',
          materialSize:          row[7]  ? String(row[7]).trim()  : '',
          specification:         row[8]  ? String(row[8]).trim()  : '',
          brandName:             row[9]  ? String(row[9]).trim()  : '',
          skuCode:               row[10] ? String(row[10]).trim() : '',
          unitName:              row[12] ? String(row[12]).trim() : '',
          qty:                   qty,  // ✅ Now from Purchase_FMS Y column
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
          poAmount:              poAmount,
        };
      });

    console.log(`✅ Total matches: ${matchCount}`);
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

    const COL = {
      STATUS_14:          'CD',
      VENDOR_FIRM:        'CF',
      BILL_NO:            'CG',
      BILL_DATE:          'CH',
      AMOUNT:             'CI',
      GST_PERCENT:        'CJ',
      IGST_PERCENT:       'CK',
      CGST:               'CL',
      SGST:               'CM',
      IGST:               'CN',
      TOTAL:              'CO',
      TOTAL_BILL_AMOUNT:  'CP',
      CGST_TOTAL:         'CQ',
      SGST_TOTAL:         'CR',
      IGST_TOTAL:         'CS',
      TRANSPORT_WO_GST:   'CT',
      NET_TRANSPORT:      'CU',
      GRAND_TOTAL:        'CV',
      REMARK:             'DW',
    };

    const transportBase    = parseFloat(cleanValue(data.transportWOGST)) || 0;
    const gstRate          = parseFloat(cleanValue(data.gstRate)) || 0;
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
          addUpdate(COL.STATUS_14,    cleanValue(data.status16),       rowNumber);
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

    if (lastValidRow) {
      const row = lastValidRow.rowNumber;
      requests.push({ range: `Billing_FMS!${COL.TRANSPORT_WO_GST}${row}`, values: [[cleanValue(data.transportWOGST)]] });
      requests.push({ range: `Billing_FMS!${COL.NET_TRANSPORT}${row}`,    values: [[transportGstOnly]] });
      requests.push({ range: `Billing_FMS!${COL.GRAND_TOTAL}${row}`,      values: [[grandTotal]] });
    }

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
        resource: { valueInputOption: 'USER_ENTERED', data: requests },
      });
    }

    res.json({ success: true, message: 'Bill tally entry 14 updated successfully' });

  } catch (error) {
    console.error('Error updating bill tally entry 14:', error);
    res.status(500).json({ success: false, message: 'Failed to update bill tally entry 14' });
  }
});

module.exports = router;