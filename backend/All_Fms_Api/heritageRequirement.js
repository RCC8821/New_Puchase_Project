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

//     // Project → Engineer
//     const projectToEngineer = {};
//     projectData.forEach(d => {
//       if (d.projectName && d.engineerName) {
//         const key = d.projectName.toLowerCase();
//         if (!projectToEngineer[key]) {
//           projectToEngineer[key] = d.engineerName;
//         }
//       }
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

//     res.json({
//       data: projectData,
//       total: projectData.length,
//       uniqueValues,
//       maps: {
//         projectToEngineer,
//         typeToNames,
//         nameToSizes,
//         nameToSpecs,
//         nameAndSizeToSKU,
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

//     // ✅ Sirf Project aur Engineer required (Contractor + Remark OPTIONAL)
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
//         now,                       // A: Timestamp
//         uidForThisItem,            // B: UID (S0001, S0002...)
//         reqNo,                     // C: ReqNo (sig0001)
//         projectName,               // D: Project Name
//         engineerName,              // E: Engineer Name
//         item.materialType,         // F: Material Type
//         item.materialName,         // G: Material Name
//         item.materialSize,         // H: Material Size
//         item.specification,        // I: Specification
//         item.skuCode,              // J: SKU Code
//         item.quantity,             // K: Quantity
//         item.unit,                 // L: Unit
//         item.description,          // M: Description
//         item.reqDays.toString(),   // N: Req Days
//         contractor || '',          // O: Contractor (optional - empty if not provided)
//         remark || '',              // P: Remark (optional - empty if not provided)
//       ];
//     });

//     await sheets.spreadsheets.values.append({
//       spreadsheetId: SignatureProjectSheetId,
//       range: 'Requriemt_Form!A:P',
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
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SignatureProjectSheetId,
      range: 'Project_Data!A2:I',
    });

    const rows = response.data.values || [];

    const projectData = rows
      .filter(row => row.some(cell => cell && cell.trim()))
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
      }));

    const uniqueValues = {
      projectNames:  [...new Set(projectData.map(d => d.projectName).filter(Boolean))].sort(),
      unitNames:     [...new Set(projectData.map(d => d.unitName).filter(Boolean))].sort(),
      materialTypes: [...new Set(projectData.map(d => d.materialType).filter(Boolean))].sort(),
    };

    // ═══════════════════════════════════════════════
    // ✅ NEW - Project → Engineers (ARRAY - multiple)
    // ═══════════════════════════════════════════════
    const projectToEngineers = {};
    projectData.forEach(d => {
      if (d.projectName && d.engineerName) {
        const key = d.projectName.toLowerCase();
        if (!projectToEngineers[key]) {
          projectToEngineers[key] = new Set();
        }
        projectToEngineers[key].add(d.engineerName);
      }
    });
    // Convert Sets to sorted arrays
    Object.keys(projectToEngineers).forEach(k => {
      projectToEngineers[k] = [...projectToEngineers[k]].sort();
    });

    // ═══════════════════════════════════════════════
    // Material Type → Names
    // ═══════════════════════════════════════════════
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
      if (!nameAndSizeToSKU[key] && d.skuCode) {
        nameAndSizeToSKU[key] = d.skuCode;
      }
    });

    res.json({
      data: projectData,
      total: projectData.length,
      uniqueValues,
      maps: {
        projectToEngineers,  // ✅ NEW - Multiple engineers per project
        typeToNames,
        nameToSizes,
        nameToSpecs,
        nameAndSizeToSKU,
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
    const { projectName, engineerName, contractor, remark, items } = req.body;

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
          !item.unit || !item.description ||
          (item.reqDays === '' || item.reqDays === undefined || item.reqDays === null)) {
        throw new Error(`Item ${i + 1}: All fields are required`);
      }

      const uidForThisItem = `S${String(currentUIDNum + i).padStart(4, '0')}`;

      return [
        now,                       // A: Timestamp
        uidForThisItem,            // B: UID (S0001, S0002...)
        reqNo,                     // C: ReqNo (sig0001)
        projectName,               // D: Project Name
        engineerName,              // E: Engineer Name
        item.materialType,         // F: Material Type
        item.materialName,         // G: Material Name
        item.materialSize,         // H: Material Size
        item.specification,        // I: Specification
        item.skuCode,              // J: SKU Code
        item.quantity,             // K: Quantity
        item.unit,                 // L: Unit
        item.description,          // M: Description
        item.reqDays.toString(),   // N: Req Days
        contractor || '',          // O: Contractor
        remark || '',              // P: Remark
      ];
    });

    await sheets.spreadsheets.values.append({
      spreadsheetId: SignatureProjectSheetId,
      range: 'Requriemt_Form!A:P',
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