

const express = require('express');
const { sheets, drive, spreadsheetId } = require('../config/googleSheet');
const { Readable } = require('stream');
const router = express.Router();

// ─── GET DROPDOWNS ────────────────────────────────────────
router.get('/dropdowns', async (req, res) => {
  try {
    const ranges = [
      'Project_Data!D3:D',
      'Project_Data!A3:A',
    ];

    const response = await sheets.spreadsheets.values.batchGet({
      spreadsheetId,
      ranges,
    });

    const [siteNamesRaw, supervisorNamesRaw] = response.data.valueRanges.map(
      range => range.values?.flat() || []
    );

    const rows = [];
    for (let i = 0; i < siteNamesRaw.length; i++) {
      const site = (siteNamesRaw[i] || '').trim();
      const supervisor = (supervisorNamesRaw[i] || '').trim();
      if (site && supervisor) rows.push({ site, supervisor });
    }

    const siteNames = [...new Set(rows.map(r => r.site))].sort();
    const siteToSupervisors = {};

    rows.forEach(({ site, supervisor }) => {
      const normSite = site.toLowerCase();
      if (!siteToSupervisors[normSite]) {
        siteToSupervisors[normSite] = new Set();
      }
      siteToSupervisors[normSite].add(supervisor);
    });

    const siteSupervisorMap = {};
    Object.keys(siteToSupervisors).forEach(key => {
      siteSupervisorMap[key] = [...siteToSupervisors[key]].sort();
    });

    res.json({ siteNames, siteSupervisorMap });
  } catch (error) {
    console.error('Error fetching dropdowns:', error);
    res.status(500).json({ error: 'Failed to load dropdown data' });
  }
});

// ─── GET MATERIAL RECEIVED FILTER DATA ────────────────────
router.get('/get-material-received-filter-data', async (req, res) => {
  try {
    const { siteName, supervisorName } = req.query;
    console.log('Query parameters:', { siteName, supervisorName });

    const purchaseResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Purchase_FMS!A2:DF',
    });

    let data = purchaseResponse.data.values || [];
    console.log(`Fetched ${data.length} rows from Purchase_FMS`);

    const PLANNED_8_IDX = 101;
    const ACTUAL_8_IDX = 102;
    const STATUS_8_IDX = 103;

    let validCount = 0;

    data = data.filter((row, idx) => {
      if (!row || row.length === 0) return false;

      const rowSite = (row[3] || '').trim();
      const rowSupervisor = (row[4] || '').trim();
      const planned8 = (row[PLANNED_8_IDX] || '').trim();
      const actual8 = (row[ACTUAL_8_IDX] || '').trim();
      const status8 = (row[STATUS_8_IDX] || '').trim();

      const matchesSite = siteName ? rowSite === siteName : true;
      const matchesSupervisor = supervisorName ? rowSupervisor === supervisorName : true;

      const hasPlanned = !!planned8;
      const isPending = !actual8 || status8.toLowerCase() === 'partition';

      const isValid = matchesSite && matchesSupervisor && hasPlanned && isPending;
      if (isValid) validCount++;

      return isValid;
    });

    console.log(`Valid filtered rows: ${validCount}`);

    // Material_Received range extended to T
    const materialReceivedResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Material_Received!A2:T',
    });
    const materialReceivedData = materialReceivedResponse.data.values || [];

    const receivedQtyMap = new Map();
    materialReceivedData.forEach(row => {
      const uid = (row[1] || '').trim();
      const qty = parseFloat(row[9]) || 0;  // J column = Received_Qty
      if (uid) {
        receivedQtyMap.set(uid, (receivedQtyMap.get(uid) || 0) + qty);
      }
    });

    // ✅ Purchase_FMS mapping - SKU is at K column (index 10)
    const filteredData = data.map(row => {
      const uid = (row[1] || '').trim();
      const skuCode = (row[10] || '').trim();  // ✅ K column

      // Debug for SKU issue
      if (!skuCode) {
        console.log(`⚠️ UID ${uid} has NO SKU CODE in Purchase_FMS K column`);
      }

      return {
        uid,
        reqNo: (row[2] || '').trim(),
        siteName: (row[3] || '').trim(),
        supervisorName: (row[4] || '').trim(),
        materialType: (row[5] || '').trim(),
        materialName: (row[6] || '').trim(),
        materialSize: (row[7] || '').trim(),
        materialSpecification: (row[8] || '').trim(),
        skuCode: skuCode,  // ✅ Explicitly set
        orderQty: (row[11] || '').trim(),
        unitName: (row[12] || '').trim(),
        revisedQty: (row[24] || '').trim(),
        brandName: (row[25] || '').trim(),
        indentNo: (row[36] || '').trim(),
        pdfIndent: (row[37] || '').trim(),
        quotationNo: (row[55] || '').trim(),
        vendorName: (row[57] || '').trim(),
        vendorContact: (row[59] || '').trim(),
        pdfQuotation: (row[73] || '').trim(),
        poNumber: (row[82] || '').trim(),
        pdfPO: (row[83] || '').trim(),
        plannedDate: (row[PLANNED_8_IDX] || '').trim(),
        status8: (row[STATUS_8_IDX] || '').trim(),
        receivedQty: receivedQtyMap.get(uid) || 0,
      };
    });

    console.log(`Returning ${filteredData.length} items`);

    return res.json({
      success: true,
      data: filteredData,
    });
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch data', details: error.message });
  }
});

// ─── SAVE MATERIAL RECEIPT ────────────────────────────────
router.post('/save-material-receipt', async (req, res) => {
  try {
    // ✅ Get everything from body
    const body = req.body;

    // ✅ DEBUG - Log everything
    console.log('=== INCOMING PAYLOAD ===');
    console.log('UID:', body.uid);
    console.log('SKU Code:', body.skuCode);
    console.log('Material Name:', body.materialName);
    console.log('Material Size:', body.materialSize);
    console.log('Material Specification:', body.materialSpecification);
    console.log('Received Qty:', body.receivedQty);
    console.log('Received Date:', body.receivedDate);
    console.log('========================');

    const {
      uid, reqNo, siteName, supervisorName, materialType, skuCode,
      materialName, materialSize, materialSpecification,
      unitName, receivedQty, status, challanNo,
      qualityApproved, truckDelivery, googleFormCompleted, photo, vendorName,
      receivedDate,
    } = body;

    if (!uid || !reqNo || !siteName || !materialType || !materialName ||
      !unitName || !receivedQty || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const receivedQtyNum = parseFloat(receivedQty);
    if (isNaN(receivedQtyNum)) {
      return res.status(400).json({ error: 'Invalid receivedQty' });
    }

    let challanUrl = '';

    // Upload photo to Drive
    if (photo) {
      if (!photo.startsWith('data:image/')) {
        return res.status(400).json({ error: 'Invalid image format' });
      }

      const base64Data = photo.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const bufferStream = new Readable();
      bufferStream.push(buffer);
      bufferStream.push(null);

      const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || '1vma3YPHosdy4SGCI5_sORVCElk85Wflz';

      try {
        const file = await drive.files.create({
          resource: {
            name: `challan_${uid}_${Date.now()}.jpg`,
            parents: [folderId],
          },
          media: { mimeType: 'image/jpeg', body: bufferStream },
          fields: 'id, webViewLink',
          supportsAllDrives: true,
        });

        await drive.permissions.create({
          fileId: file.data.id,
          requestBody: { role: 'reader', type: 'anyone' },
          supportsAllDrives: true,
        });

        challanUrl = file.data.webViewLink;
        console.log('✅ Photo uploaded:', challanUrl);
      } catch (uploadError) {
        console.error('Upload error:', uploadError.message);
        return res.status(500).json({ error: 'Failed to upload photo' });
      }
    }

    // Timestamp
    const now = new Date();
    const timestamp = now.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
    }).replace(/, /g, ' ');

    const cleanUid = String(uid).replace(/,/g, '').trim();

    // ✅ NEW COLUMN STRUCTURE (A to T):
    const values = [
      timestamp,                                    // A: Timestamp
      cleanUid,                                     // B: UID
      String(reqNo || ''),                          // C: Req No
      String(siteName || ''),                       // D: Project_Name_1
      String(supervisorName || ''),                 // E: Project_Engineer_Name_1
      String(materialType || ''),                   // F: Material_Type_1
      String(materialName || ''),                   // G: Material_Name_1
      String(materialSize || ''),                   // H: Material_Size_1
      String(materialSpecification || ''),          // I: Material_Specification_1
      receivedQtyNum,                               // J: Received_Qty
      String(unitName || ''),                       // K: Unit_Name
      String(skuCode || ''),                        // ✅ L: SKU Code
      String(status || ''),                         // M: Status
      String(challanUrl || ''),                     // N: Challan_NO. (Photo URL)
      String(receivedDate || ''),                   // O: Challan/Material_Received_Date
      String(vendorName || ''),                     // P: Vendor Name
      String(truckDelivery || ''),                  // Q: IF THE TRUCK DELIVERS
      String(googleFormCompleted || ''),            // R: Google Form
      String(challanNo || ''),                      // S: Challan_No (Number)
      String(qualityApproved || ''),                // T: Quality_appoved
    ];

    // ✅ Debug values array
    console.log('=== VALUES ARRAY ===');
    console.log('Position 11 (L - SKU):', values[11]);
    console.log('====================');

    // Find next empty row
    const sheetData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Material_Received!A:A',
    });

    const lastRow = (sheetData.data.values?.length || 0) + 1;

    // ✅ Save with range A to T
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Material_Received!A${lastRow}:T${lastRow}`,
      valueInputOption: 'RAW',
      resource: { values: [values] },
    });

    console.log(`✅ Saved to Material_Received row ${lastRow}, UID: ${cleanUid}, SKU: ${skuCode}, Date: ${receivedDate}`);

    return res.json({
      success: true,
      message: 'Receipt saved successfully',
      challanUrl,
    });
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: 'Failed to save', details: error.message });
  }
});

module.exports = router;