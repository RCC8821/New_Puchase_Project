const express = require('express');
const { sheets, SignatureSheetId } = require('../config/googleSheet');

const router = express.Router();

// ─── GET PROJECT DATA ────────────────────────────────────
router.get('/project-data', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SignatureSheetId,
      range: 'Project_Data!A2:J',
    });

    const rows = response.data.values || [];

    const projectData = rows
      .filter(row => row.some(cell => cell && cell.trim()))
      .map((row, index) => ({
        id: index + 1,
        projectName:   (row[0] || '').trim(),  // A
        engineerName:  (row[1] || '').trim(),  // B
        location:      (row[2] || '').trim(),  // C
        activity:      (row[3] || '').trim(),  // D
        materialType:  (row[4] || '').trim(),  // E
        materialName:  (row[5] || '').trim(),  // F
        materialSize:  (row[6] || '').trim(),  // G
        specification: (row[7] || '').trim(),  // H
        skuCode:       (row[8] || '').trim(),  // I
        unitName:      (row[9] || '').trim(),  // J
      }));

    // ── Unique Values ──
    const uniqueValues = {
      projectNames:  [...new Set(projectData.map(d => d.projectName).filter(Boolean))].sort(),
      engineerNames: [...new Set(projectData.map(d => d.engineerName).filter(Boolean))].sort(),
      locations:     [...new Set(projectData.map(d => d.location).filter(Boolean))].sort(),
      activities:    [...new Set(projectData.map(d => d.activity).filter(Boolean))].sort(),
      materialTypes: [...new Set(projectData.map(d => d.materialType).filter(Boolean))].sort(),
      unitNames:     [...new Set(projectData.map(d => d.unitName).filter(Boolean))].sort(),
    };

    // ══════════════════════════════════════════════
    //  MAPS
    // ══════════════════════════════════════════════

    // ✅ 1. Project → Engineers (row-wise filter)
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

    // ✅ 2. Project → Locations (row-wise filter)
    const projectToLocations = {};
    projectData.forEach(d => {
      if (!d.projectName || !d.location) return;
      const key = d.projectName.toLowerCase();
      if (!projectToLocations[key]) projectToLocations[key] = new Set();
      projectToLocations[key].add(d.location);
    });
    Object.keys(projectToLocations).forEach(k => {
      projectToLocations[k] = [...projectToLocations[k]].sort();
    });

    // ✅ 3. Project + Location → Activities (NEW CASCADING)
    const projectLocationToActivities = {};
    projectData.forEach(d => {
      if (!d.projectName || !d.location || !d.activity) return;
      const key = `${d.projectName.toLowerCase()}|||${d.location.toLowerCase()}`;
      if (!projectLocationToActivities[key])
        projectLocationToActivities[key] = new Set();
      projectLocationToActivities[key].add(d.activity);
    });
    Object.keys(projectLocationToActivities).forEach(k => {
      projectLocationToActivities[k] = [...projectLocationToActivities[k]].sort();
    });

    // ✅ 4. Project → All Activities (fallback)
    const projectToActivities = {};
    projectData.forEach(d => {
      if (!d.projectName || !d.activity) return;
      const key = d.projectName.toLowerCase();
      if (!projectToActivities[key]) projectToActivities[key] = new Set();
      projectToActivities[key].add(d.activity);
    });
    Object.keys(projectToActivities).forEach(k => {
      projectToActivities[k] = [...projectToActivities[k]].sort();
    });

    // 5. MaterialType → MaterialNames
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

    // 6. MaterialName → Sizes
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

    // 7. MaterialName → Specifications
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

    // 8. MaterialName + Size → SKU
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
        projectToEngineers,
        projectToLocations,
        projectToActivities,
        projectLocationToActivities,  // ✅ NEW
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

// ─── GET NEXT UID ────────────────────────────────────────
async function getNextUID() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SignatureSheetId,
      range: 'FORM_DATA!B2:B',
    });
    const existing = response.data.values
      ?.flat().map(Number).filter(n => !isNaN(n)) || [];
    return existing.length > 0 ? Math.max(...existing) + 1 : 1;
  } catch (err) {
    throw new Error('Failed to generate UID');
  }
}

// ─── GET NEXT REQ NO ─────────────────────────────────────
async function getNextReqNo() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SignatureSheetId,
      range: 'FORM_DATA!C2:C',
    });
    const reqNos = response.data.values?.flat() || [];
    const numbers = reqNos
      .map(no => no.match(/^sig_(\d+)$/)?.[1])
      .filter(Boolean)
      .map(Number);
    const next = numbers.length ? Math.max(...numbers) + 1 : 1;
    return `sig_${String(next).padStart(2, '0')}`;
  } catch (err) {
    throw new Error('Failed to generate req_no');
  }
}

// ─── SUBMIT ──────────────────────────────────────────────
router.post('/submit-requirement', async (req, res) => {
  try {
    const {
      projectName, engineerName, location,
      activity, remark, items,
    } = req.body;

    if (!projectName || !engineerName) {
      throw new Error('Project Name and Engineer Name are required');
    }
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('At least one item is required');
    }

    const reqNo = await getNextReqNo();
    let currentUID = await getNextUID();

    const now = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
    }).replace(',', '');

    const values = items.map((item, i) => {
      if (!item.materialType || !item.materialName ||
          !item.materialSize || !item.specification ||
          !item.skuCode || !item.quantity || !item.unit ||
          !item.description ||
          item.reqDays === '' || item.reqDays === undefined ||
          item.reqDays === null) {
        throw new Error(`Item ${i + 1}: All fields are required`);
      }

      return [
        now,                      // A: Timestamp
        currentUID + i,           // B: UID
        reqNo,                    // C: Req No
        projectName,              // D: Project Name
        engineerName,             // E: Engineer Name
        location || '',           // F: Location
        activity || '',           // G: Activity
        item.materialType,        // H: Material Type
        item.materialName,        // I: Material Name
        item.materialSize,        // J: Material Size
        item.specification,       // K: Specification
        item.skuCode,             // L: SKU Code
        item.quantity,            // M: Quantity
        item.unit,                // N: Unit Name
        item.description,         // O: Description
        item.reqDays.toString(),  // P: Require Days
        remark || '',             // Q: Remark
      ];
    });

    await sheets.spreadsheets.values.append({
      spreadsheetId: SignatureSheetId,
      range: 'FORM_DATA!A:Q',
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