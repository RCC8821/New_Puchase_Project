
const express = require('express');
const { sheets, SignatureSheetId } = require('../config/googleSheet');

const router = express.Router();

// ─── GET PROJECT DATA (For Form Dropdowns) ───────────────
router.get('/project-data', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SignatureSheetId,
      range: 'Project_Data!A2:K',
    });

    const rows = response.data.values || [];

    const projectData = rows
      .filter(row => row.some(cell => cell && String(cell).trim()))
      .map((row, index) => ({
        id: index + 1,
        projectName:   (row[0] || '').trim(),
        engineerName:  (row[1] || '').trim(),
        cluster:       (row[2] || '').trim(),
        location:      (row[3] || '').trim(),
        activity:      (row[4] || '').trim(),
        materialType:  (row[5] || '').trim(),
        materialName:  (row[6] || '').trim(),
        materialSize:  (row[7] || '').trim(),
        specification: (row[8] || '').trim(),
        skuCode:       (row[9] || '').trim(),
        unitName:      (row[10] || '').trim(),
      }));

    const uniqueValues = {
      projectNames:  [...new Set(projectData.map(d => d.projectName).filter(Boolean))].sort(),
      engineerNames: [...new Set(projectData.map(d => d.engineerName).filter(Boolean))].sort(),
      clusters:      [...new Set(projectData.map(d => d.cluster).filter(Boolean))].sort(),
      locations:     [...new Set(projectData.map(d => d.location).filter(Boolean))].sort(),
      activities:    [...new Set(projectData.map(d => d.activity).filter(Boolean))].sort(),
      materialTypes: [...new Set(projectData.map(d => d.materialType).filter(Boolean))].sort(),
      unitNames:     [...new Set(projectData.map(d => d.unitName).filter(Boolean))].sort(),
    };

    // Project → Engineers
    const projectToEngineers = {};
    projectData.forEach(d => {
      if (!d.projectName || !d.engineerName) return;
      const key = d.projectName.toLowerCase();
      if (!projectToEngineers[key]) projectToEngineers[key] = new Set();
      projectToEngineers[key].add(d.engineerName);
    });
    Object.keys(projectToEngineers).forEach(k => {
      projectToEngineers[k] = [...projectToEngineers[k]].sort();
    });

    // MaterialType → Names
    const typeToNames = {};
    projectData.forEach(d => {
      if (!d.materialType || !d.materialName) return;
      const key = d.materialType.toLowerCase();
      if (!typeToNames[key]) typeToNames[key] = new Set();
      typeToNames[key].add(d.materialName);
    });
    Object.keys(typeToNames).forEach(k => {
      typeToNames[k] = [...typeToNames[k]].sort();
    });

    // Name → Sizes
    const nameToSizes = {};
    projectData.forEach(d => {
      if (!d.materialName || !d.materialSize) return;
      const key = d.materialName.toLowerCase();
      if (!nameToSizes[key]) nameToSizes[key] = new Set();
      nameToSizes[key].add(d.materialSize);
    });
    Object.keys(nameToSizes).forEach(k => {
      nameToSizes[k] = [...nameToSizes[k]].sort();
    });

    // Name → Specs
    const nameToSpecs = {};
    projectData.forEach(d => {
      if (!d.materialName || !d.specification) return;
      const key = d.materialName.toLowerCase();
      if (!nameToSpecs[key]) nameToSpecs[key] = new Set();
      nameToSpecs[key].add(d.specification);
    });
    Object.keys(nameToSpecs).forEach(k => {
      nameToSpecs[k] = [...nameToSpecs[k]].sort();
    });

    // Name + Size → SKU
    const nameAndSizeToSKU = {};
    projectData.forEach(d => {
      if (!d.materialName || !d.materialSize) return;
      const key = `${d.materialName.toLowerCase()}|||${d.materialSize.toLowerCase()}`;
      if (!nameAndSizeToSKU[key] && d.skuCode) nameAndSizeToSKU[key] = d.skuCode;
    });

    // ✅ NEW - Cluster → Locations
const clusterToLocations = {};
projectData.forEach(d => {
  if (!d.cluster || !d.location) return;
  const key = d.cluster.toLowerCase();
  if (!clusterToLocations[key]) clusterToLocations[key] = new Set();
  clusterToLocations[key].add(d.location);
});
Object.keys(clusterToLocations).forEach(k => {
  clusterToLocations[k] = [...clusterToLocations[k]].sort();
});

    // ═══════════════════════════════════════════════
    // ✅ NEW - SKU Code → Unit Name
    // ═══════════════════════════════════════════════
    const skuCodeToUnit = {};
    projectData.forEach(d => {
      if (!d.skuCode || !d.unitName) return;
      const key = d.skuCode.toLowerCase();
      if (!skuCodeToUnit[key]) {
        skuCodeToUnit[key] = d.unitName;
      }
    });

    res.json({
      data: projectData,
      total: projectData.length,
      uniqueValues,
      maps: {
        projectToEngineers,
        typeToNames,
        nameToSizes,
        nameToSpecs,
        nameAndSizeToSKU,
        skuCodeToUnit,  //  // ✅ NEW
        clusterToLocations,
      },
    });
  } catch (error) {
    console.error('Signature project data error:', error);
    res.status(500).json({ error: 'Failed to load project data' });
  }
});

// ─── GET NEXT UID (Format: S0001) ────────────────────────
async function getNextUID() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SignatureSheetId,
      range: 'Out_Data!B:B',
    });

    const uids = response.data.values?.flat() || [];

    const numbers = uids
      .map(uid => {
        const value = String(uid || '').trim();
        const match = value.match(/^S(\d{4})$/i);
        return match ? parseInt(match[1], 10) : null;
      })
      .filter(n => n !== null && !isNaN(n));

    const next = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
    return `S${String(next).padStart(4, '0')}`;
  } catch (err) {
    console.error("UID error:", err);
    throw new Error('Failed to generate UID');
  }
}

// ─── GET NEXT REQ NO (Format: sig0001) ───────────────────
async function getNextReqNo() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SignatureSheetId,
      range: 'Out_Data!C:C',
    });

    const reqNos = response.data.values?.flat() || [];

    const numbers = reqNos
      .map(no => {
        const value = String(no || '').trim();
        const match = value.match(/^sig(\d{4})$/i);
        return match ? parseInt(match[1], 10) : null;
      })
      .filter(n => n !== null && !isNaN(n));

    const next = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
    return `sig${String(next).padStart(4, '0')}`;
  } catch (err) {
    console.error("ReqNo error:", err);
    throw new Error('Failed to generate req_no');
  }
}


// ─── SUBMIT REQUIREMENT (Signature Form) ─────────────────


// router.post('/submit-requirement', async (req, res) => {
//   try {
//     const {
//       projectName,
//       engineerName,
//       cluster,
//       activity,
//       remark,
//       items,
//     } = req.body;

//     if (!projectName) throw new Error('Project Name is required');
//     if (!engineerName) throw new Error('Engineer Name is required');
//     if (!cluster) throw new Error('Cluster is required');
//     if (!activity) throw new Error('Activity is required');
//     if (!remark) throw new Error('Remark is required');

//     if (!Array.isArray(items) || items.length === 0) {
//       throw new Error('At least one item is required');
//     }

//     const reqNo = await getNextReqNo();
//     const firstUID = await getNextUID();
//     const startUIDNumber = parseInt(firstUID.replace(/^S/i, ''), 10);

//     const now = new Date().toLocaleString('en-IN', {
//       timeZone: 'Asia/Kolkata',
//       day: '2-digit', month: '2-digit', year: 'numeric',
//       hour: '2-digit', minute: '2-digit', second: '2-digit',
//       hour12: false,
//     }).replace(',', '');

//     const values = items.map((item, i) => {
//       if (!item.location) throw new Error(`Item ${i + 1}: Location is required`);
//       if (!item.materialType || !item.materialName ||
//           !item.materialSize || !item.specification ||
//           !item.skuCode || !item.quantity || !item.unit ||
//           !item.description) {
//         throw new Error(`Item ${i + 1}: All fields are required`);
//       }

//       const uid = `S${String(startUIDNumber + i).padStart(4, '0')}`;

//       return [
//         now,                    // A: Timestamp
//         uid,                    // B: UID
//         reqNo,                  // C: ReqNo
//         projectName,            // D: Project Name
//         engineerName,           // E: Engineer Name
//         cluster,                // F: Cluster
//         item.location,          // G: Location
//         activity,               // H: Activity
//         item.materialType,      // I: Material Type
//         item.materialName,      // J: Material Name
//         item.materialSize,      // K: Material Size
//         item.specification,     // L: Specification
//         item.skuCode,           // M: SKU
//         item.quantity,          // N: Qty
//         item.unit,              // O: Unit
//         item.description,       // P: Description
//         remark,                 // Q: Remark
//       ];
//     });

//     await sheets.spreadsheets.values.append({
//       spreadsheetId: SignatureSheetId,
//       range: 'Out_Data!A:Q',
//       valueInputOption: 'USER_ENTERED',
//       resource: { values },
//     });

//     res.json({
//       message: 'Requirement submitted successfully!',
//       reqNo,
//       itemCount: items.length,
//     });

//   } catch (error) {
//     console.error('Signature submit error:', error);
//     res.status(400).json({ error: error.message });
//   }
// });



// ─── SUBMIT REQUIREMENT (Signature Form) ─────────────────
router.post('/submit-requirement', async (req, res) => {
  try {
    const {
      projectName,
      engineerName,
      cluster,
      activity,
      remark,
      items,
    } = req.body;

    if (!projectName) throw new Error('Project Name is required');
    if (!engineerName) throw new Error('Engineer Name is required');
    if (!cluster) throw new Error('Cluster is required');
    if (!activity) throw new Error('Activity is required');
    if (!remark) throw new Error('Remark is required');

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('At least one item is required');
    }

    const reqNo = await getNextReqNo();
    const firstUID = await getNextUID();
    const startUIDNumber = parseInt(firstUID.replace(/^S/i, ''), 10);

    const now = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
    }).replace(',', '');

    const values = items.map((item, i) => {
      if (!item.location) throw new Error(`Item ${i + 1}: Location is required`);
      if (!item.materialType || !item.materialName ||
          !item.materialSize || !item.specification ||
          !item.skuCode || !item.quantity || !item.unit ||
          !item.description) {
        throw new Error(`Item ${i + 1}: All fields are required`);
      }

      const uid = `S${String(startUIDNumber + i).padStart(4, '0')}`;

      return [
        now, uid, reqNo, projectName, engineerName, cluster,
        item.location, activity, item.materialType, item.materialName,
        item.materialSize, item.specification, item.skuCode,
        item.quantity, item.unit, item.description, remark,
      ];
    });

    // ✅ Step 1: Save to FORM_DATA
    await sheets.spreadsheets.values.append({
      spreadsheetId: SignatureSheetId,
      range: 'Out_Data!A:Q',
      valueInputOption: 'USER_ENTERED',
      resource: { values },
    });


    // ✅ Step 2: Update BOQ_Qty Balance
    let boqUpdatedCount = 0;
    let notFoundItems = [];


    try {
      const boqResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: SignatureSheetId,
        range: 'BOQ_Qty!A2:K',
      });

      const boqRows = boqResponse.data.values || [];
      const boqUpdates = [];

      const norm = (str) => (str || '').toString().trim().toLowerCase();

      for (const item of items) {
        let matchFound = false;

        for (let i = 0; i < boqRows.length; i++) {
          const row = boqRows[i];
          if (!row || row.length < 8) continue;

          const matches =
            norm(row[0]) === norm(cluster) &&
            norm(row[1]) === norm(item.location) &&
            norm(row[2]) === norm(activity) &&
            norm(row[3]) === norm(item.materialType) &&
            norm(row[4]) === norm(item.materialName) &&
            norm(row[5]) === norm(item.materialSize) &&
            norm(row[6]) === norm(item.specification) &&
            norm(row[7]) === norm(item.skuCode);

          if (matches) {
            // ✅ Priority Logic: K (Balance) > J (Revise BOQ) > I (Out Qty)
            const outQty = parseFloat(row[8]) || 0;         // I
            const reviseBOQ = parseFloat(row[9]) || 0;      // J - NEW
            const currentBalance = row[10];                 // K

            let availableQty;
            let source;

            if (currentBalance !== undefined && currentBalance !== '' && !isNaN(parseFloat(currentBalance))) {
              availableQty = parseFloat(currentBalance);
              source = 'K (Previous Balance)';
            } else if (reviseBOQ > 0) {
              availableQty = reviseBOQ;
              source = 'J (Revise BOQ)';
            } else {
              availableQty = outQty;
              source = 'I (Out Qty)';
            }

            const userOutQty = parseFloat(item.quantity) || 0;
            const newBalance = availableQty - userOutQty;

            const rowNumber = i + 2;

            boqUpdates.push({
              range: `BOQ_Qty!K${rowNumber}`,
              values: [[newBalance]],
            });

            console.log(
              `✅ BOQ Match: Row ${rowNumber} | ${item.materialName} | ` +
              `Available: ${availableQty} (from ${source}) - ${userOutQty} = ${newBalance}`
            );

            matchFound = true;
            break;
          }
        }

        if (!matchFound) {
          notFoundItems.push({
            materialName: item.materialName,
            skuCode: item.skuCode,
            location: item.location,
          });
          console.log(`⚠️ BOQ No Match: ${item.materialName} (${item.skuCode})`);
        }
      }

      if (boqUpdates.length > 0) {
        await sheets.spreadsheets.values.batchUpdate({
          spreadsheetId: SignatureSheetId,
          resource: {
            valueInputOption: 'USER_ENTERED',
            data: boqUpdates,
          },
        });
        boqUpdatedCount = boqUpdates.length;
        console.log(`✅ BOQ updated: ${boqUpdatedCount} rows`);
      }
    } catch (boqError) {
      console.error('⚠️ BOQ update error (data still saved):', boqError);
    }

    res.json({
      message: 'Requirement submitted successfully!',
      reqNo,
      itemCount: items.length,
      boqUpdated: boqUpdatedCount,
      notFoundInBOQ: notFoundItems.length,
      notFoundItems: notFoundItems.length > 0 ? notFoundItems : undefined,
    });

  } catch (error) {
    console.error('Signature submit error:', error);
    res.status(400).json({ error: error.message });
  }
});




// ─── GET SITE ENGINEER DATA (Admin sees all) ─────────────
router.get('/site-engineer-data/:engineerName', async (req, res) => {
  try {
    const { engineerName } = req.params;

    if (!engineerName) {
      return res.status(400).json({ error: 'Engineer name is required' });
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SignatureSheetId,
      range: 'Out_Data!A2:W',
    });

    const rows = response.data.values || [];

    const isAdmin = engineerName.toLowerCase() === 'admin';

    const filteredData = rows
      .map((row, index) => ({
        rowNumber: index + 2,
        uid: (row[1] || '').trim(),
        reqNo: (row[2] || '').trim(),
        projectName: (row[3] || '').trim(),
        engineerName: (row[4] || '').trim(),
        cluster: (row[5] || '').trim(),
        location: (row[6] || '').trim(),
        activity: (row[7] || '').trim(),
        materialType: (row[8] || '').trim(),
        materialName: (row[9] || '').trim(),
        materialSize: (row[10] || '').trim(),
        specification: (row[11] || '').trim(),
        skuCode: (row[12] || '').trim(),
        qty: (row[13] || '').trim(),
        unit: (row[14] || '').trim(),
        description: (row[15] || '').trim(),
        remark: (row[16] || '').trim(),
        plannedDate: (row[18] || '').trim(),
        sColumn: (row[18] || '').trim(),
        tColumn: (row[19] || '').trim(),
        existingStatus: (row[20] || '').trim(),
        existingQuantity: (row[21] || '').trim(),
        existingRemarks: (row[22] || '').trim(),
      }))
      .filter(item => {
        if (item.sColumn === '' || item.tColumn !== '') return false;
        if (isAdmin) return true;
        return item.engineerName.toLowerCase() === engineerName.toLowerCase();
      });

    res.json({
      success: true,
      data: filteredData,
      total: filteredData.length,
      isAdmin,
    });

  } catch (error) {
    console.error('Site Engineer data error:', error);
    res.status(500).json({ error: 'Failed to load data' });
  }
});

// ─── UPDATE SITE ENGINEER DATA (U, V, W columns) ─────────
router.post('/site-engineer-update', async (req, res) => {
  try {
    const { rowNumber, status, quantity, remarks } = req.body;

    if (!rowNumber) {
      throw new Error('Row number is required');
    }
    if (!status) {
      throw new Error('Status is required');
    }
    if (!quantity && quantity !== 0) {
      throw new Error('Quantity is required');
    }
    if (!remarks) {
      throw new Error('Remarks is required');
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId: SignatureSheetId,
      range: `Out_Data!U${rowNumber}:W${rowNumber}`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[status, quantity, remarks]],
      },
    });

    res.json({
      success: true,
      message: 'Updated successfully!',
      rowNumber,
    });

  } catch (error) {
    console.error('Site Engineer update error:', error);
    res.status(400).json({ error: error.message });
  }
});



// ─── GET STORE INVENTORY (Store_Balance sheet) ────────────
router.get('/store-inventory', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SignatureSheetId,
      range: 'Store_Balance!A3:J',  // Row 3 se start (header row 2 hai)
    });

    const rows = response.data.values || [];

    const inventory = rows
      .filter(row => row.some(cell => cell && String(cell).trim()))
      .map((row, index) => {
        const openingStock = parseFloat((row[6] || '0').toString().replace(/,/g, '')) || 0;
        const outData = parseFloat((row[7] || '0').toString().replace(/,/g, '')) || 0;
        const stockBalance = parseFloat((row[8] || '0').toString().replace(/,/g, '')) || 0;

        return {
          id: index + 1,
          skuCode:              (row[0] || '').trim(),  // A
          materialType:         (row[1] || '').trim(),  // B
          materialName:         (row[2] || '').trim(),  // C
          materialSize:         (row[3] || '').trim(),  // D
          materialSpecification:(row[4] || '').trim(),  // E
          unit:                 (row[5] || '').trim(),  // F
          openingStock:         openingStock,           // G
          outData:              outData,                // H
          stockBalance:         stockBalance,           // I
          availablePercent:     (row[9] || '').trim(),  // J
        };
      });

    // ✅ Unique values for filters
    const uniqueValues = {
      materialTypes: [...new Set(inventory.map(d => d.materialType).filter(Boolean))].sort(),
      units:         [...new Set(inventory.map(d => d.unit).filter(Boolean))].sort(),
    };

    // ✅ Stats
    const stats = {
      total: inventory.length,
      inStock: inventory.filter(d => d.stockBalance > 0).length,
      outOfStock: inventory.filter(d => d.stockBalance === 0).length,
      totalOpeningStock: inventory.reduce((sum, d) => sum + d.openingStock, 0),
      totalOutData: inventory.reduce((sum, d) => sum + d.outData, 0),
      totalStockBalance: inventory.reduce((sum, d) => sum + d.stockBalance, 0),
    };

    res.json({
      success: true,
      data: inventory,
      total: inventory.length,
      uniqueValues,
      stats,
    });
  } catch (error) {
    console.error('Store inventory error:', error);
    res.status(500).json({ success: false, error: 'Failed to load store inventory' });
  }
});





// ─── GET BOQ_Qty DATA (BOQ Quantity) ─────────────────────
router.get('/boq-qty', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SignatureSheetId,
      range: 'BOQ_Qty!A2:K',
    });

    const rows = response.data.values || [];

    const boqData = rows
      .filter(row => row.some(cell => cell && String(cell).trim()))
      .map((row, index) => {
        const outQty = parseFloat(row[8]) || 0;         // I
        const reviseBOQ = parseFloat(row[9]) || 0;      // J
        const balance = row[10] !== undefined && row[10] !== '' && !isNaN(parseFloat(row[10]))
          ? parseFloat(row[10])
          : (reviseBOQ > 0 ? reviseBOQ : outQty);

        return {
          id: index + 1,
          rowNumber:            index + 2,
          cluster:              (row[0] || '').trim(),   // A
          location:             (row[1] || '').trim(),   // B
          activity:             (row[2] || '').trim(),   // C
          materialType:         (row[3] || '').trim(),   // D
          materialName:         (row[4] || '').trim(),   // E
          materialSize:         (row[5] || '').trim(),   // F
          materialSpecification:(row[6] || '').trim(),   // G
          skuCode:              (row[7] || '').trim(),   // H
          outQty:               outQty,                  // I
          reviseBOQ:            reviseBOQ,               // J
          balance:              balance,                 // K
        };
      });

    // Unique values for filters
    const uniqueValues = {
      clusters:      [...new Set(boqData.map(d => d.cluster).filter(Boolean))].sort(),
      locations:     [...new Set(boqData.map(d => d.location).filter(Boolean))].sort(),
      activities:    [...new Set(boqData.map(d => d.activity).filter(Boolean))].sort(),
      materialTypes: [...new Set(boqData.map(d => d.materialType).filter(Boolean))].sort(),
    };

    // Stats
    const stats = {
      total: boqData.length,
      totalOutQty: boqData.reduce((sum, d) => sum + d.outQty, 0),
      totalReviseBOQ: boqData.reduce((sum, d) => sum + d.reviseBOQ, 0),
      totalBalance: boqData.reduce((sum, d) => sum + d.balance, 0),
      available: boqData.filter(d => d.balance > 0).length,
      exhausted: boqData.filter(d => d.balance <= 0).length,
    };

    res.json({
      success: true,
      data: boqData,
      total: boqData.length,
      uniqueValues,
      stats,
    });
  } catch (error) {
    console.error('BOQ_Qty fetch error:', error);
    res.status(500).json({ success: false, error: 'Failed to load BOQ data' });
  }
});

module.exports = router;