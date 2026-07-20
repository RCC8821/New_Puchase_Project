

const express = require('express');
const { sheets, SignatureSheetId } = require('../config/googleSheet');

const router = express.Router();


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
        projectName:   (row[0] || '').trim(),   // A
        engineerName:  (row[1] || '').trim(),   // B
        cluster:       (row[2] || '').trim(),   // C  ✅ NEW
        location:      (row[3] || '').trim(),   // D (shifted)
        activity:      (row[4] || '').trim(),   // E (shifted)
        materialType:  (row[5] || '').trim(),   // F (shifted)
        materialName:  (row[6] || '').trim(),   // G (shifted)
        materialSize:  (row[7] || '').trim(),   // H (shifted)
        specification: (row[8] || '').trim(),   // I (shifted)
        skuCode:       (row[9] || '').trim(),   // J (shifted)
        unitName:      (row[10] || '').trim(),  // K (shifted)
      }));

    // ── UNIQUE VALUES ─────────────────────────────
    const uniqueValues = {
      projectNames:  [...new Set(projectData.map(d => d.projectName).filter(Boolean))].sort(),
      engineerNames: [...new Set(projectData.map(d => d.engineerName).filter(Boolean))].sort(),
      clusters:      [...new Set(projectData.map(d => d.cluster).filter(Boolean))].sort(),     // ✅ NEW
      locations:     [...new Set(projectData.map(d => d.location).filter(Boolean))].sort(),
      activities:    [...new Set(projectData.map(d => d.activity).filter(Boolean))].sort(),
      materialTypes: [...new Set(projectData.map(d => d.materialType).filter(Boolean))].sort(),
      unitNames:     [...new Set(projectData.map(d => d.unitName).filter(Boolean))].sort(),
    };

    // ── MAPS ──────────────────────────────────────

    // Project → Engineers (sirf same project wali rows)
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

    // Project → Clusters
    const projectToClusters = {};
    projectData.forEach(d => {
      if (!d.projectName || !d.cluster) return;
      const key = d.projectName.toLowerCase();
      if (!projectToClusters[key]) projectToClusters[key] = new Set();
      projectToClusters[key].add(d.cluster);
    });
    Object.keys(projectToClusters).forEach(k => {
      projectToClusters[k] = [...projectToClusters[k]].sort();
    });

    // Location → Activities (GLOBAL: activity filter by location)
    const locationToActivities = {};
    projectData.forEach(d => {
      if (!d.location || !d.activity) return;
      const key = d.location.toLowerCase();
      if (!locationToActivities[key]) locationToActivities[key] = new Set();
      locationToActivities[key].add(d.activity);
    });
    Object.keys(locationToActivities).forEach(k => {
      locationToActivities[k] = [...locationToActivities[k]].sort();
    });

    // MaterialType → MaterialNames
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

    // MaterialName → Sizes
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

    // MaterialName → Specs
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

    // MaterialName + Size → SKU
    const nameAndSizeToSKU = {};
    projectData.forEach(d => {
      if (!d.materialName || !d.materialSize) return;
      const key = `${d.materialName.toLowerCase()}|||${d.materialSize.toLowerCase()}`;
      if (!nameAndSizeToSKU[key] && d.skuCode) nameAndSizeToSKU[key] = d.skuCode;
    });

    res.json({
      data: projectData,
      total: projectData.length,
      uniqueValues,
      maps: {
        projectToEngineers,
        projectToClusters,
        locationToActivities,
        typeToNames,
        nameToSizes,
        nameToSpecs,
        nameAndSizeToSKU,
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
      range: 'FORM_DATA!B:B',
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
      range: 'FORM_DATA!C:C',
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


// ─── SUBMIT (FORM_DATA!A:R) ──────────────────────────────
// router.post('/submit-requirement', async (req, res) => {
//   try {
//     const { projectName, engineerName, cluster, location, activity, remark, items } = req.body;

//     // ✅ Validation
//     if (!projectName) throw new Error('Project Name is required');
//     if (!engineerName) throw new Error('Engineer Name is required');
//     if (!cluster) throw new Error('Cluster is required');
//     if (!location) throw new Error('Location is required');
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
//       if (!item.materialType || !item.materialName ||
//           !item.materialSize || !item.specification ||
//           !item.skuCode || !item.quantity || !item.unit ||
//           !item.description ||
//           item.reqDays === '' || item.reqDays === undefined ||
//           item.reqDays === null) {
//         throw new Error(`Item ${i + 1}: All fields are required`);
//       }

//       const uid = `S${String(startUIDNumber + i).padStart(4, '0')}`;

//       return [
//         now,                      // A Timestamp
//         uid,                      // B UID (S0001)
//         reqNo,                    // C Req (sig0001)
//         projectName,              // D
//         engineerName,             // E
//         cluster,                  // F  ✅ NEW
//         location,                 // G (shifted)
//         activity,                 // H (shifted)
//         item.materialType,        // I
//         item.materialName,        // J
//         item.materialSize,        // K
//         item.specification,       // L
//         item.skuCode,             // M
//         item.quantity,            // N
//         item.unit,                // O
//         item.description,         // P
//         item.reqDays.toString(),  // Q
//         remark,                   // R
//       ];
//     });

//     await sheets.spreadsheets.values.append({
//       spreadsheetId: SignatureSheetId,
//       range: 'FORM_DATA!A:R',
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

    // ✅ Validation (location per item)
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
      // ✅ Item validation includes location
      if (!item.location) throw new Error(`Item ${i + 1}: Location is required`);
      if (!item.materialType || !item.materialName ||
          !item.materialSize || !item.specification ||
          !item.skuCode || !item.quantity || !item.unit ||
          !item.description ||
          item.reqDays === '' || item.reqDays === undefined ||
          item.reqDays === null) {
        throw new Error(`Item ${i + 1}: All fields are required`);
      }

      const uid = `S${String(startUIDNumber + i).padStart(4, '0')}`;

      // ✅ FORM_DATA columns (A:R) example:
      // A Timestamp
      // B UID
      // C ReqNo
      // D ProjectName
      // E EngineerName
      // F Cluster
      // G Location   <-- per item
      // H Activity
      // I MaterialType
      // J MaterialName
      // K MaterialSize
      // L Specification
      // M SKU
      // N Qty
      // O Unit
      // P Description
      // Q ReqDays
      // R Remark
      return [
        now,                   // A
        uid,                   // B
        reqNo,                 // C
        projectName,           // D
        engineerName,          // E
        cluster,               // F
        item.location,         // G ✅ per item
        activity,              // H
        item.materialType,     // I
        item.materialName,     // J
        item.materialSize,     // K
        item.specification,    // L
        item.skuCode,          // M
        item.quantity,         // N
        item.unit,             // O
        item.description,      // P
        item.reqDays.toString(), // Q
        remark,                // R
      ];
    });

    await sheets.spreadsheets.values.append({
      spreadsheetId: SignatureSheetId,
      range: 'FORM_DATA!A:R',
      valueInputOption: 'USER_ENTERED',
      resource: { values },
    });

    res.json({
      message: 'Requirement submitted successfully!',
      reqNo,
      itemCount: items.length,
    });

  } catch (error) {
    console.error('Signature submit error:', error);
    res.status(400).json({ error: error.message });
  }
});



module.exports = router;




