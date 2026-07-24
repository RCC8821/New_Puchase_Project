
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
        now,                    // A: Timestamp
        uid,                    // B: UID
        reqNo,                  // C: ReqNo
        projectName,            // D: Project Name
        engineerName,           // E: Engineer Name
        cluster,                // F: Cluster
        item.location,          // G: Location
        activity,               // H: Activity
        item.materialType,      // I: Material Type
        item.materialName,      // J: Material Name
        item.materialSize,      // K: Material Size
        item.specification,     // L: Specification
        item.skuCode,           // M: SKU
        item.quantity,          // N: Qty
        item.unit,              // O: Unit
        item.description,       // P: Description
        remark,                 // Q: Remark
      ];
    });

    await sheets.spreadsheets.values.append({
      spreadsheetId: SignatureSheetId,
      range: 'Out_Data!A:Q',
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

module.exports = router;