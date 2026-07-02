

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
    // Header row 7, data row 8 se
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Purchase_FMS!A8:BZ',
    });

    const rows = response.data.values || [];
    console.log('Total rows fetched:', rows.length);

    if (!rows.length) {
      return res.status(404).json({ error: 'No data found' });
    }

    // Column indices (0-based from A):
    // B=1   C=2   D=3   E=4   F=5   G=6   H=7   I=8  J=9
    // K=10  L=11  M=12  N=13  O=14  P=15  Q=16
    // Y=24  Z=25  AB=27
    // AK=36 AL=37
    // AQ=42 AR=43 AS=44 AT=45 AU=46 AV=47

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
          Material_Size: (row[7] || '').trim(),       // H column
          Specification: (row[8] || '').trim(),       // I column
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

// ─── SAVE TAKE QUOTATION ──────────────────────────────────
// router.post('/save-take-Quotation', async (req, res) => {
//   const { entries } = req.body;

//   console.log('Received entries count:', entries?.length);

//   if (!entries || !Array.isArray(entries) || entries.length === 0) {
//     return res.status(400).json({ error: 'Entries array is required' });
//   }

//   for (let i = 0; i < entries.length; i++) {
//     const e = entries[i];
//     if (!e.UID) return res.status(400).json({ error: `UID missing in entry ${i + 1}` });
//     if (!e.REVISED_QUANTITY_2 || isNaN(parseFloat(e.REVISED_QUANTITY_2))) {
//       return res.status(400).json({ error: `Invalid REVISED_QUANTITY_2 in entry ${i + 1}` });
//     }
//     if (!e.Indent_No) return res.status(400).json({ error: `Indent_No missing in entry ${i + 1}` });
//     if (!e.Final_Rate || isNaN(parseFloat(e.Final_Rate))) {
//       return res.status(400).json({ error: `Invalid Final_Rate in entry ${i + 1}` });
//     }
//   }

//   try {
//     // ── Step 1: Generate Quotation Number ──
//     // AC column is now AE because of 2 new columns added
//     // OLD: AC = Quotation_No
//     // NEW: AE = Quotation_No (2 columns shifted)
//     const quoDataRes = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Quotation_Master!AE2:AE',  // Changed from AC to AE
//     });

//     const quoValues = (quoDataRes.data.values || [])
//       .map(r => r[0])
//       .filter(v => v && v.startsWith('QUO_'))
//       .map(v => parseInt(v.replace('QUO_', '')))
//       .filter(n => !isNaN(n));

//     const nextQuoNum = quoValues.length > 0 ? Math.max(...quoValues) + 1 : 1;
//     const newQuoNumber = `QUO_${nextQuoNum.toString().padStart(3, '0')}`;
//     console.log('Generated quotation number:', newQuoNumber);

//     // ── Step 2: Find next row in Quotation_Master ──
//     const existingQMRows = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Quotation_Master!A2:A',
//     });
//     let nextQMRow = 2 + (existingQMRows.data.values?.length || 0);

//     // ── Step 3: Find UIDs in Purchase_FMS ──
//     const purchaseRes = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Purchase_FMS!A2:AV',
//     });

//     const purchaseRows = purchaseRes.data.values || [];

//     const uidToRowMap = new Map();
//     purchaseRows.forEach((row, i) => {
//       const uid = (row[1] || '').trim();
//       if (uid) uidToRowMap.set(uid, i + 2);
//     });

//     console.log('UID to row map size:', uidToRowMap.size);

//     const indentNo = entries[0].Indent_No;
//     for (const entry of entries) {
//       if (entry.Indent_No !== indentNo) {
//         return res.status(400).json({ error: 'All entries must have same Indent_No' });
//       }
//       if (!uidToRowMap.has(String(entry.UID))) {
//         return res.status(400).json({ error: `UID "${entry.UID}" not found` });
//       }
//     }

//     // ── Step 4: Timestamp ──
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

//     // ════════════════════════════════════════════════════
//     // ── Step 5: Quotation_Master rows (A to AG = 33 cols) ──
//     // ════════════════════════════════════════════════════
//     // NEW STRUCTURE:
//     // A=0  Timestamp
//     // B=1  Req_No
//     // C=2  UID
//     // D=3  Project_Name (site_name)
//     // E=4  Indent_No
//     // F=5  Material_name
//     // G=6  Material_Size       ← NEW
//     // H=7  Material_Specification ← NEW
//     // I=8  Vendor_Name (shifted)
//     // J=9  Vendor_Firm_Name
//     // K=10 Vendor_Address
//     // L=11 Contact_Number
//     // M=12 Vendor_GST_No
//     // N=13 RATE
//     // O=14 Discount
//     // P=15 CGST
//     // Q=16 SGST
//     // R=17 IGST
//     // S=18 Final_Rate
//     // T=19 Delivery_Date
//     // U=20 Payment_Terms
//     // V=21 Credit_Days
//     // W=22 Bill_Type
//     // X=23 IS_TRANSPORT_REQUIRED
//     // Y=24 EXPECTED_TRANSPORT_CHARGES
//     // Z=25 FREIGHT_CHARGES
//     // AA=26 EXPECTED_FREIGHT_CHARGES
//     // AB=27 PLANNED_4
//     // AC=28 NO_OF_QUOTATION_4
//     // AD=29 REMARK_4
//     // AE=30 Quotation_No (was AC)
//     // AF=31 Total_Quantity (was AD)
//     // AG=32 Total_Value (was AE)

//     const quotationUpdates = [];

//     for (const entry of entries) {
//       const revisedQty = parseFloat(entry.REVISED_QUANTITY_2);
//       const finalRate = parseFloat(entry.Final_Rate);
//       const totalValue = (revisedQty * finalRate).toFixed(2);

//       const rowData = [
//         getTimestamp(),                                                          // A: Timestamp
//         entry.Req_No || '',                                                      // B: Req No
//         String(entry.UID),                                                       // C: UID
//         entry.Project_Name || entry.site_name || '',                             // D: Project
//         entry.Indent_No,                                                         // E: Indent No
//         entry.Material_name || '',                                               // F: Material Name
//         entry.Material_Size || '',                                               // G: Material Size 🆕
//         entry.Material_Specification || entry.Specification || '',               // H: Specification 🆕
//         entry.Vendor_Name || '',                                                 // I: Vendor Name
//         entry.Vendor_Firm_Name || entry.Vendor_Ferm_Name || '',                  // J: Vendor Firm
//         entry.Vendor_Address || '',                                              // K: Address
//         entry.Contact_Number || '',                                              // L: Contact
//         entry.Vendor_GST_No || '',                                               // M: GST
//         parseFloat(entry.RATE) || 0,                                             // N: Rate
//         parseFloat(entry.Discount) || 0,                                         // O: Discount
//         parseFloat(entry.CGST) || 0,                                             // P: CGST
//         parseFloat(entry.SGST) || 0,                                             // Q: SGST
//         parseFloat(entry.IGST) || 0,                                             // R: IGST
//         finalRate,                                                               // S: Final Rate
//         entry.Delivery_Expected_Date || '',                                      // T: Delivery
//         entry.Payment_Terms || entry.Payment_Terms_Condistion_Advacne_Credit || '', // U: Payment
//         parseInt(entry.Credit_in_Days) || 0,                                     // V: Credit Days
//         entry.Bill_Type || '',                                                   // W: Bill Type
//         entry.IS_TRANSPORT_REQUIRED || '',                                       // X: Transport
//         parseFloat(entry.EXPECTED_TRANSPORT_CHARGES) || 0,                      // Y: Transport Charges
//         parseFloat(entry.FREIGHT_CHARGES || entry.FRIGHET_CHARGES) || 0,        // Z: Freight
//         parseFloat(entry.EXPECTED_FREIGHT_CHARGES || entry.EXPECTED_FRIGHET_CHARGES) || 0, // AA
//         entry.PLANNED_4 || '',                                                   // AB: Planned 4
//         entry.NO_OF_QUOTATION_4 || '',                                           // AC: No of Quotation
//         entry.REMARK_4 || '',                                                    // AD: Remark 4
//         newQuoNumber,                                                            // AE: Quotation No
//         revisedQty.toFixed(2),                                                   // AF: Total Quantity
//         totalValue,                                                              // AG: Total Value
//       ];

//       quotationUpdates.push({
//         range: `Quotation_Master!A${nextQMRow}:AG${nextQMRow}`,
//         values: [rowData],
//       });
//       nextQMRow++;
//     }

//     // ── Step 6: Save Quotation_Master ──
//     if (quotationUpdates.length > 0) {
//       await sheets.spreadsheets.values.batchUpdate({
//         spreadsheetId,
//         resource: { valueInputOption: 'RAW', data: quotationUpdates },
//       });
//       console.log('✅ Quotation_Master updated:', quotationUpdates.length, 'rows');
//     }

//     // ── Step 7: Update Purchase_FMS (AS, AU, AV columns) ──
//     const purchaseUpdates = [];

//     for (const entry of entries) {
//       const sheetRow = uidToRowMap.get(String(entry.UID));
//       if (!sheetRow) {
//         console.warn(`No row for UID: ${entry.UID}`);
//         continue;
//       }

//       purchaseUpdates.push(
//         {
//           range: `Purchase_FMS!AS${sheetRow}`,
//           values: [['Done']],
//         },
//         {
//           range: `Purchase_FMS!AU${sheetRow}`,
//           values: [[entry.NO_OF_QUOTATION_4 || '']],
//         },
//         {
//           range: `Purchase_FMS!AV${sheetRow}`,
//           values: [[entry.REMARK_4 || '']],
//         }
//       );

//       console.log(`UID ${entry.UID} → Row ${sheetRow}: AS=Done, AU=${entry.NO_OF_QUOTATION_4}, AV=${entry.REMARK_4}`);
//     }

//     if (purchaseUpdates.length > 0) {
//       const result = await sheets.spreadsheets.values.batchUpdate({
//         spreadsheetId,
//         resource: { valueInputOption: 'USER_ENTERED', data: purchaseUpdates },
//       });
//       console.log('✅ Purchase_FMS updated. Cells:', result.data.totalUpdatedCells);
//     }

//     return res.json({
//       success: true,
//       message: 'Data appended to Google Sheet successfully',
//       quotationNumber: newQuoNumber,
//       totalQuantity: entries.reduce((sum, e) => sum + parseFloat(e.REVISED_QUANTITY_2 || 0), 0),
//       totalValue: entries.reduce((sum, e) =>
//         sum + (parseFloat(e.REVISED_QUANTITY_2 || 0) * parseFloat(e.Final_Rate || 0)), 0
//       ).toFixed(2),
//     });

//   } catch (error) {
//     console.error('❌ Error:', error.message, error.stack);
//     return res.status(500).json({ error: 'Server error', details: error.message });
//   }
// });


router.post('/save-take-Quotation', async (req, res) => {
  const { entries } = req.body;

  if (!entries || !Array.isArray(entries) || entries.length === 0) {
    return res.status(400).json({ error: 'Entries array is required' });
  }

  // 🆕 Clean number helper - removes ₹, commas, quotes, spaces
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
      range: 'Purchase_FMS!A2:AV',
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
      // 🆕 All numbers properly cleaned
      const rate = num(entry.RATE);
      const discount = num(entry.Discount);
      const cgst = num(entry.CGST);
      const sgst = num(entry.SGST);
      const igst = num(entry.IGST);
      const finalRate = num(entry.Final_Rate);
      const revisedQty = num(entry.REVISED_QUANTITY_2);
      const totalValue = num(entry.Total_Value) || (revisedQty * finalRate);
      const transportCharges = num(entry.EXPECTED_TRANSPORT_CHARGES);
      const freightCharges = num(entry.FREIGHT_CHARGES || entry.FRIGHET_CHARGES);
      const expectedFreight = num(entry.EXPECTED_FREIGHT_CHARGES || entry.EXPECTED_FRIGHET_CHARGES);
      const creditDays = parseInt(String(entry.Credit_in_Days).replace(/[^0-9]/g, '')) || 0;

      console.log(`UID ${entry.UID}: Rate=${rate}, Disc=${discount}, CGST=${cgst}, SGST=${sgst}, IGST=${igst}, Final=${finalRate}, Total=${totalValue}, Transport=${transportCharges}, Freight=${freightCharges}`);

      // A to AG = 33 columns
      const rowData = [
        getTimestamp(),                              // A: Timestamp
        entry.Req_No || '',                          // B: Req No
        String(entry.UID),                           // C: UID
        entry.Project_Name || entry.site_name || '', // D: Project
        entry.Indent_No,                             // E: Indent No
        entry.Material_name || '',                   // F: Material Name
        entry.Material_Size || '',                   // G: Material Size
        entry.Material_Specification || '',          // H: Specification
        entry.Vendor_Name || '',                     // I: Vendor Name
        entry.Vendor_Firm_Name || entry.Vendor_Ferm_Name || '', // J: Vendor Firm
        entry.Vendor_Address || '',                  // K: Address
        entry.Contact_Number || '',                  // L: Contact
        entry.Vendor_GST_No || '',                   // M: GST
        rate,                                        // N: Rate (pure number)
        discount,                                    // O: Discount (pure number)
        cgst,                                        // P: CGST (pure number)
        sgst,                                        // Q: SGST (pure number)
        igst,                                        // R: IGST (pure number)
        finalRate,                                   // S: Final Rate (pure number)
        entry.Delivery_Expected_Date || '',          // T: Delivery Date
        entry.Payment_Terms || entry.Payment_Terms_Condistion_Advacne_Credit || '', // U: Payment
        creditDays,                                  // V: Credit Days (pure number)
        entry.Bill_Type || '',                       // W: Bill Type
        entry.IS_TRANSPORT_REQUIRED || '',           // X: Transport Required
        transportCharges,                            // Y: Transport Charges (pure number)
        freightCharges,                              // Z: Freight Charges (pure number)
        expectedFreight,                             // AA: Expected Freight (pure number)
        entry.PLANNED_4 || '',                       // AB: Status
        entry.NO_OF_QUOTATION_4 || '',               // AC: No of Quotation
        entry.REMARK_4 || '',                        // AD: Brand Name 4
        newQuoNumber,                                // AE: Quotation No
        revisedQty,                                  // AF: Total Quantity (pure number)
        totalValue,                                  // AG: Total Value (pure number)
      ];

      quotationUpdates.push({
        range: `Quotation_Master!A${nextQMRow}:AG${nextQMRow}`,
        values: [rowData],
      });
      nextQMRow++;
    }

    // 🆕 KEY FIX: USER_ENTERED prevents ' prefix on numbers
    if (quotationUpdates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        resource: { valueInputOption: 'USER_ENTERED', data: quotationUpdates },
      });
      console.log('✅ Quotation_Master:', quotationUpdates.length, 'rows');
    }

    // Update Purchase_FMS
    const purchaseUpdates = [];
    for (const entry of entries) {
      const sheetRow = uidToRowMap.get(String(entry.UID));
      if (!sheetRow) continue;
      purchaseUpdates.push(
        { range: `Purchase_FMS!AS${sheetRow}`, values: [['Done']] },
        { range: `Purchase_FMS!AU${sheetRow}`, values: [[entry.NO_OF_QUOTATION_4 || '']] },
        { range: `Purchase_FMS!AV${sheetRow}`, values: [[entry.REMARK_4 || '']] }
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