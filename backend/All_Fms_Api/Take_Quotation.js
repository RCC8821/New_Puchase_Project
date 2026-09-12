
// const express = require('express');
// const { sheets, spreadsheetId } = require('../config/googleSheet');
// const router = express.Router();

// // ─── GET VENDORS ──────────────────────────────────────────
// router.get('/vendors', async (req, res) => {
//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Vendor_Master!A2:D',
//     });

//     const rows = response.data.values;
//     if (!rows || rows.length === 0) {
//       return res.status(404).json({ error: 'No data found in sheet' });
//     }

//     const vendorData = rows
//       .map(row => ({
//         vendorFirm: (row[0] || '').trim(),
//         gstNumber: (row[1] || '').trim(),
//         contactNo: (row[2] || '').trim(),
//         vendorName: (row[3] || '').trim(),
//       }))
//       .filter(v => v.vendorFirm || v.vendorName);

//     res.json(vendorData);
//   } catch (error) {
//     console.error('Error fetching vendors:', error);
//     res.status(500).json({ error: 'Failed to fetch vendor data' });
//   }
// });

// // ─── GET TAKE QUOTATION DATA ──────────────────────────────
// router.get('/get-take-Quotation', async (req, res) => {
//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Purchase_FMS!A8:BZ',
//     });

//     const rows = response.data.values || [];
//     console.log('Total rows fetched:', rows.length);

//     if (!rows.length) {
//       return res.status(404).json({ error: 'No data found' });
//     }

//     const PLANNED_4_IDX = 42;
//     const ACTUAL_4_IDX = 43;
//     const STATUS_4_IDX = 44;
//     const INDENT_NO_IDX = 36;

//     const formData = rows
//       .map((row, index) => {
//         if (!row || row.every(c => !c || c.trim() === '')) return null;

//         const planned4 = (row[PLANNED_4_IDX] || '').trim();
//         const actual4 = (row[ACTUAL_4_IDX] || '').trim();
//         const status4 = (row[STATUS_4_IDX] || '').trim();

//         console.log(`Row ${index + 8}: UID="${(row[1] || '').trim()}" PLANNED_4="${planned4}" STATUS_4="${status4}"`);

//         if (!planned4 || actual4 || status4) return null;

//         const indentNo = (row[INDENT_NO_IDX] || '').trim();
//         if (!indentNo) return null;

//         return {
//           UID: (row[1] || '').trim(),
//           Req_No: (row[2] || '').trim(),
//           Project_Name: (row[3] || '').trim(),
//           Engineer_Name: (row[4] || '').trim(),
//           Material_Type: (row[5] || '').trim(),
//           Material_Name: (row[6] || '').trim(),
//           Material_Size: (row[7] || '').trim(),
//           Specification: (row[8] || '').trim(),
//           Brand_Name: (row[9] || '').trim(),
//           SKU_Code: (row[10] || '').trim(),
//           Quantity: (row[11] || '').trim(),
//           Unit_Name: (row[12] || '').trim(),
//           Description: (row[13] || '').trim(),
//           Require_Days: (row[14] || '').trim(),
//           Contractor: (row[15] || '').trim(),
//           Remark: (row[16] || '').trim(),
//           REVISED_QUANTITY_2: (row[24] || '').trim(),
//           DECIDED_BRAND_2: (row[25] || '').trim(),
//           'DECIDED_BRAND/COMPANY_NAME_2': (row[25] || '').trim(),
//           STATUS_3: (row[34] || '').trim(),
//           REMARK_3: (row[35] || '').trim(),
//           INDENT_NUMBER_3: indentNo,
//           PDF_URL_3: (row[37] || '').trim(),
//           PLANNED_4: planned4,
//           _rowIndex: index + 8,
//         };
//       })
//       .filter(Boolean);

//     console.log(`Valid rows found: ${formData.length}`);

//     if (!formData.length) {
//       return res.status(404).json({ error: 'No pending quotation data found' });
//     }

//     return res.json({ data: formData });

//   } catch (error) {
//     console.error('Error fetching take quotation data:', error);
//     return res.status(500).json({ error: 'Failed to fetch data', details: error.message });
//   }
// });


// router.post('/save-take-Quotation', async (req, res) => {
//   const { entries } = req.body;

//   if (!entries || !Array.isArray(entries) || entries.length === 0) {
//     return res.status(400).json({ error: 'Entries array is required' });
//   }

//   const num = (val) => {
//     if (val === null || val === undefined || val === '') return 0;
//     const cleaned = String(val).replace(/[₹,\s'\"]/g, '').trim();
//     const n = parseFloat(cleaned);
//     return isNaN(n) ? 0 : n;
//   };

//   for (let i = 0; i < entries.length; i++) {
//     const e = entries[i];
//     if (!e.UID) return res.status(400).json({ error: `UID missing in entry ${i + 1}` });
//     if (!e.Indent_No) return res.status(400).json({ error: `Indent_No missing in entry ${i + 1}` });
//     if (num(e.Final_Rate) <= 0) {
//       return res.status(400).json({ error: `Invalid Final_Rate in entry ${i + 1}` });
//     }
//   }

//   try {
//     const quoDataRes = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Quotation_Master!AE2:AE',
//     });

//     const quoValues = (quoDataRes.data.values || [])
//       .map(r => r[0])
//       .filter(v => v && v.startsWith('QUO_'))
//       .map(v => parseInt(v.replace('QUO_', '')))
//       .filter(n => !isNaN(n));

//     const nextQuoNum = quoValues.length > 0 ? Math.max(...quoValues) + 1 : 1;
//     const newQuoNumber = `QUO_${nextQuoNum.toString().padStart(3, '0')}`;
//     console.log('Generated:', newQuoNumber);

//     const existingQMRows = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Quotation_Master!A2:A',
//     });
//     let nextQMRow = 2 + (existingQMRows.data.values?.length || 0);

//     // 🆕 Range extends to AW to ensure write boundaries are clear
//     const purchaseRes = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Purchase_FMS!A2:AW',
//     });
//     const purchaseRows = purchaseRes.data.values || [];
//     const uidToRowMap = new Map();
//     purchaseRows.forEach((row, i) => {
//       const uid = (row[1] || '').trim();
//       if (uid) uidToRowMap.set(uid, i + 2);
//     });

//     const indentNo = entries[0].Indent_No;
//     for (const entry of entries) {
//       if (entry.Indent_No !== indentNo) {
//         return res.status(400).json({ error: 'All entries must have same Indent_No' });
//       }
//       if (!uidToRowMap.has(String(entry.UID))) {
//         return res.status(400).json({ error: `UID "${entry.UID}" not found` });
//       }
//     }

//     const getTimestamp = () => {
//       const now = new Date();
//       const ist = new Intl.DateTimeFormat('en-IN', {
//         timeZone: 'Asia/Kolkata',
//         year: 'numeric', month: '2-digit', day: '2-digit',
//         hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
//       }).formatToParts(now);
//       const p = {};
//       ist.forEach(part => { p[part.type] = part.value; });
//       return `${p.day}/${p.month}/${p.year} ${p.hour}:${p.minute}:${p.second}`;
//     };

//     const quotationUpdates = [];

//     for (const entry of entries) {
//       const rate = num(entry.RATE);
//       const discount = num(entry.Discount);
//       const cgst = num(entry.CGST);
//       const sgst = num(entry.SGST);
//       const igst = num(entry.IGST);
//       const finalRate = num(entry.Final_Rate);
//       const revisedQty = num(entry.REVISED_QUANTITY_2);
//       const totalValue = num(entry.Total_Value) || (revisedQty * finalRate);
//       const transportCharges = num(entry.EXPECTED_TRANSPORT_CHARGES);
//       const freightCharges = num(entry.EXPECTED_FRIGHET_CHARGES || entry.EXPECTED_FRIGHET_CHARGES);
//       const expectedFreight = num(entry.EXPECTED_FREIGHT_CHARGES || entry.EXPECTED_FRIGHET_CHARGES);
//       const creditDays = parseInt(String(entry.Credit_in_Days).replace(/[^0-9]/g, '')) || 0;

//       console.log(`UID ${entry.UID}: Rate=${rate}, Disc=${discount}, CGST=${cgst}, SGST=${sgst}, IGST=${igst}, Final=${finalRate}, Total=${totalValue}, Transport=${transportCharges}, Freight=${freightCharges}`);

//       const rowData = [
//         getTimestamp(),                              // A
//         entry.Req_No || '',                          // B
//         String(entry.UID),                           // C
//         entry.Project_Name || entry.site_name || '', // D
//         entry.Indent_No,                             // E
//         entry.Material_name || '',                   // F
//         entry.Material_Size || '',                   // G
//         entry.Material_Specification || '',          // H
//         entry.Vendor_Name || '',                     // I
//         entry.Vendor_Firm_Name || entry.Vendor_Ferm_Name || '', // J
//         entry.Vendor_Address || '',                  // K
//         entry.Contact_Number || '',                  // L
//         entry.Vendor_GST_No || '',                   // M
//         rate,                                        // N
//         discount,                                    // O
//         cgst,                                        // P
//         sgst,                                        // Q
//         igst,                                        // R
//         finalRate,                                   // S
//         entry.Delivery_Expected_Date || '',          // T
//         entry.Payment_Terms || entry.Payment_Terms_Condistion_Advacne_Credit || '', // U
//         creditDays,                                  // V
//         entry.Bill_Type || '',                       // W
//         entry.IS_TRANSPORT_REQUIRED || '',           // X
//         transportCharges,                            // Y
//         expectedFreight,                              // Z
//         expectedFreight,                             // AA
//         entry.PLANNED_4 || '',                       // AB
//         entry.NO_OF_QUOTATION_4 || '',               // AC
//         entry.REMARK_4 || '',                        // AD (Brand Name)
//         newQuoNumber,                                // AE
//         revisedQty,                                  // AF
//         totalValue,                                  // AG
//       ];

//       quotationUpdates.push({
//         range: `Quotation_Master!A${nextQMRow}:AG${nextQMRow}`,
//         values: [rowData],
//       });
//       nextQMRow++;
//     }

//     if (quotationUpdates.length > 0) {
//       await sheets.spreadsheets.values.batchUpdate({
//         spreadsheetId,
//         resource: { valueInputOption: 'USER_ENTERED', data: quotationUpdates },
//       });
//       console.log('✅ Quotation_Master:', quotationUpdates.length, 'rows');
//     }

//     // ─── Update Purchase_FMS ───
//     // 📝 AV is restored to original REMARK_4 (Brand Name)
//     // 🆕 AW gets the brand new Step 5 Final Remark
//     const purchaseUpdates = [];
//     for (const entry of entries) {
//       const sheetRow = uidToRowMap.get(String(entry.UID));
//       if (!sheetRow) continue;
//       purchaseUpdates.push(
//         { range: `Purchase_FMS!AS${sheetRow}`, values: [['Done']] },
//         { range: `Purchase_FMS!AU${sheetRow}`, values: [[entry.NO_OF_QUOTATION_4 || '']] },
//         { range: `Purchase_FMS!AV${sheetRow}`, values: [[entry.REMARK_4 || '']] },       // ✅ original restored
//         { range: `Purchase_FMS!AW${sheetRow}`, values: [[entry.Final_Remark || '']] }    // 🆕 New AW column
//       );
//     }

//     if (purchaseUpdates.length > 0) {
//       await sheets.spreadsheets.values.batchUpdate({
//         spreadsheetId,
//         resource: { valueInputOption: 'USER_ENTERED', data: purchaseUpdates },
//       });
//       console.log('✅ Purchase_FMS updated');
//     }

//     return res.json({
//       success: true,
//       message: 'Data saved successfully',
//       quotationNumber: newQuoNumber,
//     });

//   } catch (error) {
//     console.error('❌ Error:', error.message);
//     return res.status(500).json({ error: 'Server error', details: error.message });
//   }
// });


// module.exports = router;




const express = require('express');
const { sheets, spreadsheetId } = require('../config/googleSheet');
const router = express.Router();

// ─── GET VENDORS ──────────────────────────────────────────
router.get('/vendors', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Vendor_Master!A2:D',
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'No data found in sheet' });
    }

    const vendorData = rows
      .map(row => ({
        vendorFirm: (row[0] || '').trim(),
        gstNumber: (row[1] || '').trim(),
        contactNo: (row[2] || '').trim(),
        vendorName: (row[3] || '').trim(),
      }))
      .filter(v => v.vendorFirm || v.vendorName);

    res.json(vendorData);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ error: 'Failed to fetch vendor data' });
  }
});

// ─── GET TAKE QUOTATION DATA ──────────────────────────────
router.get('/get-take-Quotation', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Purchase_FMS!A8:BZ',
    });

    const rows = response.data.values || [];
    console.log('Total rows fetched:', rows.length);

    if (!rows.length) {
      return res.status(404).json({ error: 'No data found' });
    }

    const PLANNED_4_IDX = 42;
    const ACTUAL_4_IDX = 43;
    const STATUS_4_IDX = 44;
    const INDENT_NO_IDX = 36;

    const formData = rows
      .map((row, index) => {
        if (!row || row.every(c => !c || c.trim() === '')) return null;

        const planned4 = (row[PLANNED_4_IDX] || '').trim();
        const actual4 = (row[ACTUAL_4_IDX] || '').trim();
        const status4 = (row[STATUS_4_IDX] || '').trim();

        console.log(`Row ${index + 8}: UID="${(row[1] || '').trim()}" PLANNED_4="${planned4}" STATUS_4="${status4}"`);

        if (!planned4 || actual4 || status4) return null;

        const indentNo = (row[INDENT_NO_IDX] || '').trim();
        if (!indentNo) return null;

        return {
          UID: (row[1] || '').trim(),
          Req_No: (row[2] || '').trim(),
          Project_Name: (row[3] || '').trim(),
          Engineer_Name: (row[4] || '').trim(),
          Material_Type: (row[5] || '').trim(),
          Material_Name: (row[6] || '').trim(),
          Material_Size: (row[7] || '').trim(),
          Specification: (row[8] || '').trim(),
          Brand_Name: (row[9] || '').trim(),
          SKU_Code: (row[10] || '').trim(),
          Quantity: (row[11] || '').trim(),
          Unit_Name: (row[12] || '').trim(),
          Description: (row[13] || '').trim(),
          Require_Days: (row[14] || '').trim(),
          Contractor: (row[15] || '').trim(),
          Remark: (row[16] || '').trim(),
          REVISED_QUANTITY_2: (row[24] || '').trim(),
          DECIDED_BRAND_2: (row[25] || '').trim(),
          'DECIDED_BRAND/COMPANY_NAME_2': (row[25] || '').trim(),
          STATUS_3: (row[34] || '').trim(),
          REMARK_3: (row[35] || '').trim(),
          INDENT_NUMBER_3: indentNo,
          PDF_URL_3: (row[37] || '').trim(),
          PLANNED_4: planned4,
          _rowIndex: index + 8,
        };
      })
      .filter(Boolean);

    console.log(`Valid rows found: ${formData.length}`);

    if (!formData.length) {
      return res.status(404).json({ error: 'No pending quotation data found' });
    }

    return res.json({ data: formData });

  } catch (error) {
    console.error('Error fetching take quotation data:', error);
    return res.status(500).json({ error: 'Failed to fetch data', details: error.message });
  }
});


router.post('/save-take-Quotation', async (req, res) => {
  const { entries } = req.body;

  if (!entries || !Array.isArray(entries) || entries.length === 0) {
    return res.status(400).json({ error: 'Entries array is required' });
  }

  const num = (val) => {
    if (val === null || val === undefined || val === '') return 0;
    const cleaned = String(val).replace(/[₹,\s'\"]/g, '').trim();
    const n = parseFloat(cleaned);
    return isNaN(n) ? 0 : n;
  };

  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    if (!e.UID) return res.status(400).json({ error: `UID missing in entry ${i + 1}` });
    if (!e.Indent_No) return res.status(400).json({ error: `Indent_No missing in entry ${i + 1}` });
    if (num(e.Final_Rate) <= 0) {
      return res.status(400).json({ error: `Invalid Final_Rate in entry ${i + 1}` });
    }
  }

  try {
    const quoDataRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Quotation_Master!AE2:AE',
    });

    const quoValues = (quoDataRes.data.values || [])
      .map(r => r[0])
      .filter(v => v && v.startsWith('QUO_'))
      .map(v => parseInt(v.replace('QUO_', '')))
      .filter(n => !isNaN(n));

    const nextQuoNum = quoValues.length > 0 ? Math.max(...quoValues) + 1 : 1;
    const newQuoNumber = `QUO_${nextQuoNum.toString().padStart(3, '0')}`;
    console.log('Generated:', newQuoNumber);

    const existingQMRows = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Quotation_Master!A2:A',
    });
    let nextQMRow = 2 + (existingQMRows.data.values?.length || 0);

    const purchaseRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Purchase_FMS!A2:AW',
    });
    const purchaseRows = purchaseRes.data.values || [];
    const uidToRowMap = new Map();
    purchaseRows.forEach((row, i) => {
      const uid = (row[1] || '').trim();
      if (uid) uidToRowMap.set(uid, i + 2);
    });

    const indentNo = entries[0].Indent_No;
    for (const entry of entries) {
      if (entry.Indent_No !== indentNo) {
        return res.status(400).json({ error: 'All entries must have same Indent_No' });
      }
      if (!uidToRowMap.has(String(entry.UID))) {
        return res.status(400).json({ error: `UID "${entry.UID}" not found` });
      }
    }

    const getTimestamp = () => {
      const now = new Date();
      const ist = new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
      }).formatToParts(now);
      const p = {};
      ist.forEach(part => { p[part.type] = part.value; });
      return `${p.day}/${p.month}/${p.year} ${p.hour}:${p.minute}:${p.second}`;
    };

    const quotationUpdates = [];

    for (const entry of entries) {
      const rate = num(entry.RATE);
      const discount = num(entry.Discount);
      const cgst = num(entry.CGST);
      const sgst = num(entry.SGST);
      const igst = num(entry.IGST);
      const finalRate = num(entry.Final_Rate);
      const revisedQty = num(entry.REVISED_QUANTITY_2);
      const totalValue = num(entry.Total_Value) || (revisedQty * finalRate);
      const transportCharges = num(entry.EXPECTED_TRANSPORT_CHARGES);
      const expectedFreight = num(entry.EXPECTED_FREIGHT_CHARGES || entry.EXPECTED_FRIGHET_CHARGES);
      const creditDays = parseInt(String(entry.Credit_in_Days).replace(/[^0-9]/g, '')) || 0;

      console.log(`UID ${entry.UID}: Rate=${rate}, Disc=${discount}, CGST=${cgst}, SGST=${sgst}, IGST=${igst}, Final=${finalRate}, Total=${totalValue}, Transport=${transportCharges}, FreightAmount=${expectedFreight}`);

      const rowData = [
        getTimestamp(),                              // A
        entry.Req_No || '',                          // B
        String(entry.UID),                           // C
        entry.Project_Name || entry.site_name || '', // D
        entry.Indent_No,                             // E
        entry.Material_name || '',                   // F
        entry.Material_Size || '',                   // G
        entry.Material_Specification || '',          // H
        entry.Vendor_Name || '',                     // I
        entry.Vendor_Firm_Name || entry.Vendor_Ferm_Name || '', // J
        entry.Vendor_Address || '',                  // K
        entry.Contact_Number || '',                  // L
        entry.Vendor_GST_No || '',                   // M
        rate,                                        // N
        discount,                                    // O
        cgst,                                        // P
        sgst,                                        // Q
        igst,                                        // R
        finalRate,                                   // S
        entry.Delivery_Expected_Date || '',          // T
        entry.Payment_Terms || entry.Payment_Terms_Condistion_Advacne_Credit || '', // U
        creditDays,                                  // V
        entry.Bill_Type || '',                       // W
        entry.IS_TRANSPORT_REQUIRED || '',           // X
        transportCharges,                            // Y (pure number)
        expectedFreight,                             // Z ✅ SWAPPED - Freight Charges Amount now goes to Column Z
        entry.FREIGHT_CHARGES || entry.FRIGHET_CHARGES || '', // AA ✅ SWAPPED - Freight Status (Yes/No) now goes to Column AA
        entry.PLANNED_4 || '',                       // AB
        entry.NO_OF_QUOTATION_4 || '',               // AC
        entry.REMARK_4 || '',                        // AD (Brand Name)
        newQuoNumber,                                // AE
        revisedQty,                                  // AF
        totalValue,                                  // AG
        '',                                          // AH
        '',                                          // AI
        '',                                          // AJ
        entry.Final_Remark || '',                    // AK
      ];

      quotationUpdates.push({
        range: `Quotation_Master!A${nextQMRow}:AK${nextQMRow}`,
        values: [rowData],
      });
      nextQMRow++;
    }

    if (quotationUpdates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        resource: { valueInputOption: 'USER_ENTERED', data: quotationUpdates },
      });
      console.log('✅ Quotation_Master:', quotationUpdates.length, 'rows');
    }

    // ─── Update Purchase_FMS ───
    const purchaseUpdates = [];
    for (const entry of entries) {
      const sheetRow = uidToRowMap.get(String(entry.UID));
      if (!sheetRow) continue;
      purchaseUpdates.push(
        { range: `Purchase_FMS!AS${sheetRow}`, values: [['Done']] },
        { range: `Purchase_FMS!AU${sheetRow}`, values: [[entry.NO_OF_QUOTATION_4 || '']] },
        { range: `Purchase_FMS!AV${sheetRow}`, values: [[entry.REMARK_4 || '']] },       // AV: Brand Name
        { range: `Purchase_FMS!AW${sheetRow}`, values: [[entry.Final_Remark || '']] }    // AW: Step 5 Remark
      );
    }

    if (purchaseUpdates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        resource: { valueInputOption: 'USER_ENTERED', data: purchaseUpdates },
      });
      console.log('✅ Purchase_FMS updated');
    }

    return res.json({
      success: true,
      message: 'Data saved successfully',
      quotationNumber: newQuoNumber,
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
});

module.exports = router;


