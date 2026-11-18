
// const express = require('express');
// const { sheets, SignatureProjectSheetId } = require('../config/googleSheet');

// const router = express.Router();

// // ═══════════════════════════════════════════════════════════
// // GET PROJECT DATA - Dropdown Source (Project_Data tab)
// // ═══════════════════════════════════════════════════════════
// router.get('/project-data', async (req, res) => {
//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId: SignatureProjectSheetId,
//       range: 'Project_Data!A3:I',
//     });

//     const rows = response.data.values || [];

//     const projectData = rows
//       .filter(row => row.some(cell => cell && cell.trim()))
//       .map((row, index) => ({
//         id: index + 1,
//         projectName:   (row[0] || '').trim(),  // A
//         engineerName:  (row[1] || '').trim(),  // B
//         materialType:  (row[3] || '').trim(),  // D
//         materialName:  (row[4] || '').trim(),  // E
//         materialSize:  (row[5] || '').trim(),  // F
//         specification: (row[6] || '').trim(),  // G
//         skuCode:       (row[7] || '').trim(),  // H
//         unitName:      (row[8] || '').trim(),  // I
//       }));

//     const uniqueValues = {
//       projectNames:  [...new Set(projectData.map(d => d.projectName).filter(Boolean))].sort(),
//       unitNames:     [...new Set(projectData.map(d => d.unitName).filter(Boolean))].sort(),
//       materialTypes: [...new Set(projectData.map(d => d.materialType).filter(Boolean))].sort(),
//     };

//     // Project → Engineers (Array)
//     const projectToEngineers = {};
//     projectData.forEach(d => {
//       if (d.projectName && d.engineerName) {
//         const key = d.projectName.toLowerCase();
//         if (!projectToEngineers[key]) {
//           projectToEngineers[key] = new Set();
//         }
//         projectToEngineers[key].add(d.engineerName);
//       }
//     });
//     Object.keys(projectToEngineers).forEach(k => {
//       projectToEngineers[k] = [...projectToEngineers[k]].sort();
//     });

//     // Material Type → Names
//     const typeToNames = {};
//     projectData.forEach(d => {
//       if (!d.materialType || !d.materialName) return;
//       const key = d.materialType.toLowerCase();
//       if (!typeToNames[key]) typeToNames[key] = new Set();
//       typeToNames[key].add(d.materialName);
//     });
//     Object.keys(typeToNames).forEach(k => {
//       typeToNames[k] = [...typeToNames[k]].sort();
//     });

//     // Name → Sizes
//     const nameToSizes = {};
//     projectData.forEach(d => {
//       if (!d.materialName || !d.materialSize) return;
//       const key = d.materialName.toLowerCase();
//       if (!nameToSizes[key]) nameToSizes[key] = new Set();
//       nameToSizes[key].add(d.materialSize);
//     });
//     Object.keys(nameToSizes).forEach(k => {
//       nameToSizes[k] = [...nameToSizes[k]].sort();
//     });

//     // Name → Specs
//     const nameToSpecs = {};
//     projectData.forEach(d => {
//       if (!d.materialName || !d.specification) return;
//       const key = d.materialName.toLowerCase();
//       if (!nameToSpecs[key]) nameToSpecs[key] = new Set();
//       nameToSpecs[key].add(d.specification);
//     });
//     Object.keys(nameToSpecs).forEach(k => {
//       nameToSpecs[k] = [...nameToSpecs[k]].sort();
//     });

//     // Name + Size → SKU
//     const nameAndSizeToSKU = {};
//     projectData.forEach(d => {
//       if (!d.materialName || !d.materialSize) return;
//       const key = `${d.materialName.toLowerCase()}|||${d.materialSize.toLowerCase()}`;
//       if (!nameAndSizeToSKU[key] && d.skuCode) {
//         nameAndSizeToSKU[key] = d.skuCode;
//       }
//     });

//     // ═══════════════════════════════════════════════
//     // ✅ NEW - SKU Code → Unit Name
//     // ═══════════════════════════════════════════════
//     const skuCodeToUnit = {};
//     projectData.forEach(d => {
//       if (!d.skuCode || !d.unitName) return;
//       const key = d.skuCode.toLowerCase();
//       if (!skuCodeToUnit[key]) {
//         skuCodeToUnit[key] = d.unitName;
//       }
//     });

//     res.json({
//       data: projectData,
//       total: projectData.length,
//       uniqueValues,
//       maps: {
//         projectToEngineers,
//         typeToNames,
//         nameToSizes,
//         nameToSpecs,
//         nameAndSizeToSKU,
//         skuCodeToUnit,  // ✅ NEW
//       },
//     });

//   } catch (error) {
//     console.error('Error fetching project data:', error);
//     res.status(500).json({ error: 'Failed to load project data' });
//   }
// });

// // ═══════════════════════════════════════════════════════════
// // GET NEXT UID (S0001, S0002...)
// // ═══════════════════════════════════════════════════════════
// async function getNextUID() {
//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId: SignatureProjectSheetId,
//       range: 'Requriemt_Form!B:B',
//     });

//     const uids = response.data.values?.flat() || [];

//     const numbers = uids
//       .map(uid => {
//         const value = String(uid || '').trim();
//         const match = value.match(/^S(\d+)$/i);
//         return match ? parseInt(match[1], 10) : null;
//       })
//       .filter(n => n !== null && !isNaN(n));

//     const next = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
//     return `S${String(next).padStart(4, '0')}`;
//   } catch (err) {
//     console.error('UID error:', err);
//     throw new Error('Failed to generate UID');
//   }
// }

// // ═══════════════════════════════════════════════════════════
// // GET NEXT REQ NO (sig0001, sig0002...)
// // ═══════════════════════════════════════════════════════════
// async function getNextReqNo() {
//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId: SignatureProjectSheetId,
//       range: 'Requriemt_Form!C:C',
//     });

//     const reqNos = response.data.values?.flat() || [];

//     const numbers = reqNos
//       .map(no => {
//         const value = String(no || '').trim();
//         const match = value.match(/^sig(\d+)$/i);
//         return match ? parseInt(match[1], 10) : null;
//       })
//       .filter(n => n !== null && !isNaN(n));

//     const next = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
//     return `sig${String(next).padStart(4, '0')}`;
//   } catch (err) {
//     console.error('ReqNo error:', err);
//     throw new Error('Failed to generate req_no');
//   }
// }

// // ═══════════════════════════════════════════════════════════
// // SUBMIT REQUIREMENT → Requriemt_Form tab
// // ═══════════════════════════════════════════════════════════



// router.post('/submit', async (req, res) => {
//   try {
//     const { projectName, engineerName, contractor, remark, items } = req.body;

//     if (!projectName || !engineerName) {
//       throw new Error('Project Name and Engineer Name are required');
//     }
//     if (!Array.isArray(items) || items.length === 0) {
//       throw new Error('At least one item is required');
//     }

//     const reqNo = await getNextReqNo();
//     let currentUIDStr = await getNextUID();
//     let currentUIDNum = parseInt(currentUIDStr.replace(/^S/i, ''), 10);

//     const now = new Date().toLocaleString('en-IN', {
//       timeZone: 'Asia/Kolkata',
//       day: '2-digit', month: '2-digit', year: 'numeric',
//       hour: '2-digit', minute: '2-digit', second: '2-digit',
//       hour12: false,
//     }).replace(',', '');

//     const values = items.map((item, i) => {
//       if (!item.materialType || !item.materialName || !item.materialSize ||
//           !item.specification || !item.skuCode || !item.quantity ||
//           !item.unit || !item.description ||
//           (item.reqDays === '' || item.reqDays === undefined || item.reqDays === null)) {
//         throw new Error(`Item ${i + 1}: All fields are required`);
//       }

//       const uidForThisItem = `S${String(currentUIDNum + i).padStart(4, '0')}`;

//       return [
//         now,                        // A
//         uidForThisItem,             // B
//         reqNo,                      // C
//         projectName,                // D
//         engineerName,               // E
//         item.materialType,          // F
//         item.materialName,          // G
//         item.materialSize,          // H
//         item.specification,         // I
//         item.brand || '',           // J ✅ Brand
//         item.skuCode,               // K
//         item.quantity,              // L
//         item.unit,                  // M
//         item.description,           // N
//         item.reqDays?.toString() || '', // O
//         contractor || '',           // P
//         remark || '',               // Q
//       ];
//     });

//     await sheets.spreadsheets.values.append({
//       spreadsheetId: SignatureProjectSheetId,
//       range: 'Requriemt_Form!A:Q',
//       valueInputOption: 'USER_ENTERED',
//       resource: { values },
//     });

//     res.json({
//       message: 'Requirement submitted successfully!',
//       reqNo,
//       itemCount: items.length,
//     });

//   } catch (error) {
//     console.error('Submit error:', error);
//     res.status(400).json({ error: error.message });
//   }
// });


// module.exports = router;







const express = require('express');
const { sheets, SignatureProjectSheetId } = require('../config/googleSheet');

const router = express.Router();

// ═══════════════════════════════════════════════════════════
// GET PROJECT DATA - Dropdown Source (Project_Data tab)
// ═══════════════════════════════════════════════════════════
router.get('/project-data', async (req, res) => {
  try {
    // ✅ Range expanded to A3:P to read Cluster, Location, Activity, Contractor
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SignatureProjectSheetId,
      range: 'Project_Data!A3:P',
    });

    const rows = response.data.values || [];

    const projectData = rows
      .filter(row => row.some(cell => cell && String(cell).trim()))
      .map((row, index) => ({
        id: index + 1,
        projectName:   (row[0] || '').trim(),  // A
        engineerName:  (row[1] || '').trim(),  // B
        materialType:  (row[3] || '').trim(),  // D
        materialName:  (row[4] || '').trim(),  // E
        materialSize:  (row[5] || '').trim(),  // F
        specification: (row[6] || '').trim(),  // G
        skuCode:       (row[7] || '').trim(),  // H
        unitName:      (row[8] || '').trim(),  // I
        cluster:       (row[9] || '').trim(),  // J - Cluster
        location:      (row[10] || '').trim(), // K - Location
        activity:      (row[11] || '').trim(), // L - Activity
        contractor:    (row[14] || row[13] || '').trim(), // O/N - Contractor
      }));

    // ── Unique Values ──
    const uniqueValues = {
      projectNames:  [...new Set(projectData.map(d => d.projectName).filter(Boolean))].sort(),
      unitNames:     [...new Set(projectData.map(d => d.unitName).filter(Boolean))].sort(),
      materialTypes: [...new Set(projectData.map(d => d.materialType).filter(Boolean))].sort(),
      clusters:      [...new Set(projectData.map(d => d.cluster).filter(Boolean))].sort(),
      locations:     [...new Set(projectData.map(d => d.location).filter(Boolean))].sort(),
      activities:    [...new Set(projectData.map(d => d.activity).filter(Boolean))].sort(),
      contractors:   [...new Set(projectData.map(d => d.contractor).filter(Boolean))].sort(),
    };

    // 1. Project → Engineers
    const projectToEngineers = {};
    projectData.forEach(d => {
      if (d.projectName && d.engineerName) {
        const key = d.projectName.toLowerCase();
        if (!projectToEngineers[key]) projectToEngineers[key] = new Set();
        projectToEngineers[key].add(d.engineerName);
      }
    });
    Object.keys(projectToEngineers).forEach(k => {
      projectToEngineers[k] = [...projectToEngineers[k]].sort();
    });

    // 2. ✅ Cluster → Locations
    const clusterToLocations = {};
    projectData.forEach(d => {
      if (d.cluster && d.location) {
        const key = d.cluster.toLowerCase();
        if (!clusterToLocations[key]) clusterToLocations[key] = new Set();
        clusterToLocations[key].add(d.location);
      }
    });
    Object.keys(clusterToLocations).forEach(k => {
      clusterToLocations[k] = [...clusterToLocations[k]].sort();
    });

    // 3. ✅ NEW: Location → Activities (Location के हिसाब से Activity फ़िल्टर)
    const locationToActivities = {};
    projectData.forEach(d => {
      if (d.location && d.activity) {
        const key = d.location.toLowerCase();
        if (!locationToActivities[key]) locationToActivities[key] = new Set();
        locationToActivities[key].add(d.activity);
      }
    });
    Object.keys(locationToActivities).forEach(k => {
      locationToActivities[k] = [...locationToActivities[k]].sort();
    });

    // 4. Material Type → Names
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

    // 5. Name → Sizes
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

    // 6. Name → Specs
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

    // 7. Name + Size → SKU
    const nameAndSizeToSKU = {};
    projectData.forEach(d => {
      if (!d.materialName || !d.materialSize) return;
      const key = `${d.materialName.toLowerCase()}|||${d.materialSize.toLowerCase()}`;
      if (!nameAndSizeToSKU[key] && d.skuCode) {
        nameAndSizeToSKU[key] = d.skuCode;
      }
    });

    // 8. SKU Code → Unit Name
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
        clusterToLocations,
        locationToActivities, // ✅ NEW: Location to Activity Map
        typeToNames,
        nameToSizes,
        nameToSpecs,
        nameAndSizeToSKU,
        skuCodeToUnit,
      },
    });

  } catch (error) {
    console.error('Error fetching project data:', error);
    res.status(500).json({ error: 'Failed to load project data' });
  }
});

// ═══════════════════════════════════════════════════════════
// GET NEXT UID (S0001, S0002...)
// ═══════════════════════════════════════════════════════════
async function getNextUID() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SignatureProjectSheetId,
      range: 'Requriemt_Form!B:B',
    });

    const uids = response.data.values?.flat() || [];

    const numbers = uids
      .map(uid => {
        const value = String(uid || '').trim();
        const match = value.match(/^S(\d+)$/i);
        return match ? parseInt(match[1], 10) : null;
      })
      .filter(n => n !== null && !isNaN(n));

    const next = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
    return `S${String(next).padStart(4, '0')}`;
  } catch (err) {
    console.error('UID error:', err);
    throw new Error('Failed to generate UID');
  }
}

// ═══════════════════════════════════════════════════════════
// GET NEXT REQ NO (sig0001, sig0002...)
// ═══════════════════════════════════════════════════════════
async function getNextReqNo() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SignatureProjectSheetId,
      range: 'Requriemt_Form!C:C',
    });

    const reqNos = response.data.values?.flat() || [];

    const numbers = reqNos
      .map(no => {
        const value = String(no || '').trim();
        const match = value.match(/^sig(\d+)$/i);
        return match ? parseInt(match[1], 10) : null;
      })
      .filter(n => n !== null && !isNaN(n));

    const next = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
    return `sig${String(next).padStart(4, '0')}`;
  } catch (err) {
    console.error('ReqNo error:', err);
    throw new Error('Failed to generate req_no');
  }
}

// ═══════════════════════════════════════════════════════════
// SUBMIT REQUIREMENT → Requriemt_Form tab
// ═══════════════════════════════════════════════════════════
router.post('/submit', async (req, res) => {
  try {
    const {
      projectName,
      engineerName,
      cluster,
      location,       // ✅ Location (From Top Form)
      remark,         // Slip No
      contractorName, // Contractor Name
      contractor,
      items,
    } = req.body;

    const actualContractor = contractorName || contractor || '';

    if (!projectName || !engineerName) {
      throw new Error('Project Name and Engineer Name are required');
    }
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('At least one item is required');
    }

    const reqNo = await getNextReqNo();
    let currentUIDStr = await getNextUID();
    let currentUIDNum = parseInt(currentUIDStr.replace(/^S/i, ''), 10);

    const now = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
    }).replace(',', '');

    const values = items.map((item, i) => {
      if (!item.materialType || !item.materialName || !item.materialSize ||
          !item.specification || !item.skuCode || !item.quantity ||
          !item.unit || !item.description) {
        throw new Error(`Item ${i + 1}: All required fields must be filled`);
      }

      const uidForThisItem = `S${String(currentUIDNum + i).padStart(4, '0')}`;

      return [
        now,                             // A - Timestamp
        uidForThisItem,                  // B - UID
        reqNo,                           // C - Req No
        projectName,                     // D - Project Name
        engineerName,                    // E - Engineer Name
        cluster || '',                   // F - Cluster
        location || item.location || '', // G - Location (From Top Form)
        item.activity || '',             // H - Activity (From Item)
        item.materialType,               // I - Material Type
        item.materialName,               // J - Material Name
        item.materialSize,               // K - Material Size
        item.specification,              // L - Specification
        item.skuCode,                    // M - SKU Code
        item.quantity,                   // N - Quantity
        item.unit,                       // O - Unit
        item.description,                // P - Description
        actualContractor,                // Q - Contractor
        remark || '',                    // R - Slip No / Remark
      ];
    });

    await sheets.spreadsheets.values.append({
      spreadsheetId: SignatureProjectSheetId,
      range: 'Requriemt_Form!A:R',
      valueInputOption: 'USER_ENTERED',
      resource: { values },
    });

    res.json({
      message: 'Requirement submitted successfully!',
      reqNo,
      itemCount: items.length,
    });

  } catch (error) {
    console.error('Submit error:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;