



const express = require('express');
const { sheets, spreadsheetId } = require('../config/googleSheet');

const router = express.Router();

// ─── GET PROJECT DATA from Form_Material (A to L) ────────
router.get('/project-data', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Form_Material!A2:L',  // ✅ A to L (contractor now in L)
    });

    const rows = response.data.values || [];

    const projectData = rows
      .filter(row => row.some(cell => cell && cell.trim()))
      .map((row, index) => ({
        id: index + 1,
        engineerName:  (row[0] || '').trim(),    // A
        projectName:   (row[1] || '').trim(),    // B
        // C column skipped (old contractor)
        materialType:  (row[3] || '').trim(),    // D
        materialName:  (row[4] || '').trim(),    // E
        materialSize:  (row[5] || '').trim(),    // F
        specification: (row[6] || '').trim(),    // G
        skuCode:       (row[7] || '').trim(),    // H
        unitName:      (row[8] || '').trim(),    // I
        // J skipped (old brand)
        // K skipped
        contractor:    (row[11] || '').trim(),   // ✅ L column - NEW contractor
      }));

    // ══════════════════════════════════════════════
    //  UNIQUE VALUES
    // ══════════════════════════════════════════════
    const uniqueValues = {
      projectNames:  [...new Set(projectData.map(d => d.projectName).filter(Boolean))].sort(),
      contractors:   [...new Set(projectData.map(d => d.contractor).filter(Boolean))].sort(), // ✅ from L
      unitNames:     [...new Set(projectData.map(d => d.unitName).filter(Boolean))].sort(),
      materialTypes: [...new Set(projectData.map(d => d.materialType).filter(Boolean))].sort(),
    };

    // ══════════════════════════════════════════════
    //  MAPS
    // ══════════════════════════════════════════════

    // 1. Project → Engineer
    const projectToEngineer = {};
    projectData.forEach(d => {
      if (d.projectName && d.engineerName) {
        const key = d.projectName.toLowerCase();
        if (!projectToEngineer[key]) {
          projectToEngineer[key] = d.engineerName;
        }
      }
    });

    // 2. MaterialType → MaterialNames
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

    // 3. MaterialName → Sizes
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

    // 4. MaterialName → ALL Specifications
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

    // 5. MaterialName + Size → SKU Code
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
        projectToEngineer,
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

// ─── GET NEXT UID ────────────────────────────────────────
async function getNextUID() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Purchase_FMS!B2:B',
    });
    const existing = response.data.values?.flat().map(Number).filter(n => !isNaN(n)) || [];
    return existing.length > 0 ? Math.max(...existing) + 1 : 1;
  } catch (err) {
    throw new Error('Failed to generate UID');
  }
}

// ─── GET NEXT REQ NO ─────────────────────────────────────
async function getNextReqNo() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Purchase_FMS!C2:C',
    });
    const reqNos = response.data.values?.flat() || [];
    const numbers = reqNos
      .map(no => no.match(/^req_(\d+)$/)?.[1])
      .filter(Boolean)
      .map(Number);
    const next = numbers.length ? Math.max(...numbers) + 1 : 1;
    return `req_${String(next).padStart(2, '0')}`;
  } catch (err) {
    throw new Error('Failed to generate req_no');
  }
}

// ─── SUBMIT → Purchase_FMS (A to Q = 17 columns) ────────
router.post('/submit-requirement', async (req, res) => {
  try {
    const { projectName, engineerName, contractor, remark, items } = req.body;

    // ✅ All project fields required
    if (!projectName || !engineerName || !contractor || !remark) {
      throw new Error('All project fields are required (Project, Engineer, Contractor, Remark)');
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
      // ✅ All item fields required
      if (!item.materialType || !item.materialName || !item.materialSize ||
          !item.specification || !item.skuCode || !item.quantity ||
          !item.unit || !item.description ||
          (item.reqDays === '' || item.reqDays === undefined || item.reqDays === null)) {
        throw new Error(`Item ${i + 1}: All fields are required`);
      }

      return [
        now,                      // A: Timestamp
        currentUID + i,           // B: UID
        reqNo,                    // C: Req No
        projectName,              // D: Project_Name
        engineerName,             // E: Engineer_Name
        item.materialType,        // F: Material_Type
        item.materialName,        // G: Material_Name
        item.materialSize,        // H: Material_Size
        item.specification,       // I: Specification
        '',                       // J: Brand_Name (empty)
        item.skuCode,             // K: SKU Code
        item.quantity,            // L: Quantity
        item.unit,                // M: Unit Name
        item.description,         // N: Description
        item.reqDays.toString(),  // O: Require_Days
        contractor,               // P: Contractor/Firm
        remark,                   // Q: Remark
      ];
    });

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Purchase_FMS!A:Q',
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