const express = require('express');
const { sheets, SiteExpeseSheetId, CompanyLabourSheetId } = require('../../config/googleSheet');

const router = express.Router();


// ============================================================
// GET /get-project-dropdown
// ============================================================
router.get('/get-project-dropdown', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SiteExpeseSheetId,
      range: 'Project_Data!A3:U5000',
    });

    const rows = response.data.values || [];
    console.log('Raw rows fetched from API:', rows.length);

    const fullRows = rows.map(row => {
      const padded = [...row];
      while (padded.length < 21) padded.push('');
      return padded;
    });

    const result = [];

    fullRows.forEach((row, index) => {
      const projectName        = (row[0]  || '').trim();
      const engineer           = (row[1]  || '').trim();
      const contractorName     = (row[2]  || '').trim();
      const contractorFirmName = (row[3]  || '').trim();
      const expenseWorkType    = (row[8]  || '').trim();
      const labourWorkType     = (row[14] || '').trim();
      const labourCategory     = (row[15] || '').trim();
      const bankName           = (row[20] || '').trim();

      if (!projectName && !contractorName && !contractorFirmName) return;

      const entry = {
        id: index + 3,
        projectName: projectName || '(No Project Name)',
        engineer,
        contractorName,
        contractorFirmName,
        expenseWorkType,
        labourWorkType,
        labourCategory,
        bankName,
        label: projectName
          ? `${projectName}${engineer ? ` - ${engineer}` : ''}`.trim()
          : `${contractorName || contractorFirmName || 'Unknown'} (No Project)`,
        value: projectName || contractorName || contractorFirmName || 'unknown',
      };

      result.push(entry);
    });

    console.log('Total entries returned:', result.length);

    const uniqueContractors = [...new Set(
      result.map(r => r.contractorName).filter(Boolean)
    )];
    console.log('Unique contractors:', uniqueContractors.length);

    res.json({
      success: true,
      count: result.length,
      data: result,
      debug: {
        rawRowsFromApi:    rows.length,
        totalEntries:      result.length,
        uniqueContractors: uniqueContractors.length,
      }
    });

  } catch (error) {
    console.error('Error fetching dropdown:', error);
    res.status(500).json({ success: false, message: 'Failed', error: error.message });
  }
});


// ============================================================
// GET /get-Labour-Approve
// ============================================================
router.get('/get-Labour-Approve', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SiteExpeseSheetId,
      range: 'Labour_FMS!A7:V',
    });

    const rows = response.data.values || [];

    const pendingLabour = rows
      .filter(row => {
        const planned2 = row[20] || '';
        const actual2  = row[21] || '';
        return planned2 && !actual2;
      })
      .map((row) => ({
        timestamp:          row[0]  || '',
        uid:                row[1]  || '',
        projectName:        row[2]  || '',
        projectEngineer:    row[3]  || '',
        workType:           row[4]  || '',
        workDescription:    row[5]  || '',
        labourCategory1:    row[6]  || '',
        numberOfLabour1:    row[7]  || '',
        labourCategory2:    row[8]  || '',
        numberOfLabour2:    row[9]  || '',
        totalLabour:        row[10] || '',
        dateRequired:       row[11] || '',
        headOfContractor:   row[12] || '',
        nameOfContractor:   row[13] || '',
        contractorFirmName: row[14] || '',
        remark:             row[15] || '',
        planned2:           row[20] || '',
        actual2:            row[21] || '',
      }));

    res.json({
      success: true,
      count: pendingLabour.length,
      data: pendingLabour
    });
  } catch (error) {
    console.error('Error fetching pending labour approvals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending labour approvals',
      error: error.message
    });
  }
});


// ============================================================
// POST /Post-labour-Approvel-1
// ============================================================
router.post('/Post-labour-Approvel-1', async (req, res) => {
  const {
    uid,
    Status_2,
    Approved_Head_2,
    Name_Of_Contractor_2,
    Contractor_Firm_Name_2,
    Remark_2
  } = req.body;

  if (!uid) {
    return res.status(400).json({ success: false, message: 'UID is required' });
  }

  if (
    Status_2 === undefined &&
    Approved_Head_2 === undefined &&
    Name_Of_Contractor_2 === undefined &&
    Contractor_Firm_Name_2 === undefined &&
    Remark_2 === undefined
  ) {
    return res.status(400).json({
      success: false,
      message: 'Provide at least one field to update'
    });
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SiteExpeseSheetId,
      range: 'Labour_FMS!A7:AB',
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No data found in sheet' });
    }

    const rowIndex = rows.findIndex(row =>
      row[1] && String(row[1]).trim() === String(uid).trim()
    );

    if (rowIndex === -1) {
      return res.status(404).json({ success: false, message: `UID not found: ${uid}` });
    }

    const sheetRowNumber = 7 + rowIndex;
    console.log(`Found UID ${uid} at array index ${rowIndex} → sheet row ${sheetRowNumber}`);

    const batchData = [];

    if (Status_2 !== undefined && String(Status_2).trim() !== '') {
      batchData.push({ range: `Labour_FMS!W${sheetRowNumber}`, values: [[Status_2]] });
    }
    if (Approved_Head_2 !== undefined && String(Approved_Head_2).trim() !== '') {
      batchData.push({ range: `Labour_FMS!Y${sheetRowNumber}`, values: [[Approved_Head_2]] });
    }
    if (Name_Of_Contractor_2 !== undefined && String(Name_Of_Contractor_2).trim() !== '') {
      batchData.push({ range: `Labour_FMS!Z${sheetRowNumber}`, values: [[Name_Of_Contractor_2]] });
    }
    if (Contractor_Firm_Name_2 !== undefined && String(Contractor_Firm_Name_2).trim() !== '') {
      batchData.push({ range: `Labour_FMS!AA${sheetRowNumber}`, values: [[Contractor_Firm_Name_2]] });
    }
    if (Remark_2 !== undefined && String(Remark_2).trim() !== '') {
      batchData.push({ range: `Labour_FMS!AB${sheetRowNumber}`, values: [[Remark_2]] });
    }

    if (batchData.length === 0) {
      return res.json({ success: true, message: 'No non-empty values to update' });
    }

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SiteExpeseSheetId,
      resource: { valueInputOption: 'USER_ENTERED', data: batchData },
    });

    return res.json({
      success: true,
      message: 'Labour approval updated successfully (W to AB)',
      rowNumber: sheetRowNumber,
      updatedColumns: batchData.map(d => d.range.match(/!([A-Z]+)/)?.[1]),
      updatedCount: batchData.length
    });

  } catch (error) {
    console.error('Update error:', error);
    return res.status(500).json({ success: false, message: 'Update failed', error: error.message });
  }
});


// ============================================================
// ✅ GET /get-Labour-management (Clean & Single Unified Version)
// Merges Labour_FMS with Labour_Requirement (W-AL)
// ============================================================
router.get('/get-Labour-management', async (req, res) => {
  try {
    const [fmsResponse, reqResponse] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId: SiteExpeseSheetId,
        range: 'Labour_FMS!A7:AD',
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: SiteExpeseSheetId,
        range: 'Labour_Requirement!A2:AL10000',
      })
    ]);

    const fmsRows = fmsResponse.data.values || [];
    const reqRows = reqResponse.data.values || [];

    const cleanUid = (str) => {
      if (!str) return '';
      const s = String(str).trim().toUpperCase();
      const match = s.match(/^([A-Z]+)0*(\d+)$/);
      return match ? `${match[1]}${match[2]}` : s;
    };

    const reqMap = {};
    reqRows.forEach(row => {
      const rawUid = (row[1] || '').toString().trim();
      if (!rawUid) return;

      const key = cleanUid(rawUid);
      const paddedRow = [...row];
      while (paddedRow.length < 38) paddedRow.push('');

      reqMap[key] = {
        Status_3:                  paddedRow[22] || '',  // W
        Time_Delay_3:              paddedRow[23] || '',  // X
        Labouar_Contractor_Name_3: paddedRow[24] || '',  // Y
        Labour_Category_1_3:       paddedRow[25] || '',  // Z
        Number_Of_Labour_1_3:      paddedRow[26] || '',  // AA
        Labour_Rate_1_3:           paddedRow[27] || '',  // AB
        Labour_Category_2_3:       paddedRow[28] || '',  // AC
        Number_Of_Labour_2_3:      paddedRow[29] || '',  // AD
        Labour_Rate_2_3:           paddedRow[30] || '',  // AE
        Total_Wages_3:             paddedRow[31] || '',  // AF
        Conveyanance_3:            paddedRow[32] || '',  // AG
        Contractor_Commission:     paddedRow[33] || '',  // AH
        Total_Paid_Amount_3:       paddedRow[34] || '',  // AI
        Company_Head_Amount_3:     paddedRow[35] || '',  // AJ
        Contractor_Head_Amount_3:  paddedRow[36] || '',  // AK
        Remark_3:                  paddedRow[37] || '',  // AL
      };
    });

    console.log(`[LABOUR MGMT] Mapped ${Object.keys(reqMap).length} UIDs from Labour_Requirement`);

    const pendingLabour = fmsRows
      .filter(row => {
        if (row.length < 18) return false;
        const planned3 = (row[28] || '').toString().trim();
        const actual3  = (row[29] || '').toString().trim();
        return planned3 !== '' && actual3 === '';
      })
      .map(row => {
        const rawUid = (row[1] || '').toString().trim();
        const key = cleanUid(rawUid);
        const reqData = reqMap[key] || {};

        return {
          timestamp:             row[0]  || '',
          uid:                   rawUid,
          projectName:           row[2]  || '',
          projectEngineer:       row[3]  || '',
          workType:              row[4]  || '',
          workDescription:       row[5]  || '',
          labourCategory1:       row[6]  || '',
          numberOfLabour1:       row[7]  || '',
          labourCategory2:       row[8]  || '',
          numberOfLabour2:       row[9]  || '',
          totalLabour:           row[10] || '',
          dateRequired:          row[11] || '',
          headOfContractor:      row[12] || '',
          nameOfContractor:      row[13] || '',
          contractorFirmName:    row[14] || '',
          Approved_Head_2:       row[24] || '',
          Name_Of_Contractor_2:  row[25] || '',
          Contractor_Firm_Name_2:row[26] || '',
          remark:                row[27] || '',
          planned3:              row[28] || '',
          actual3:               row[29] || '',
          reqAutofill: reqData,
        };
      });

    res.json({
      success: true,
      count: pendingLabour.length,
      data: pendingLabour
    });
  } catch (error) {
    console.error('Error fetching pending labour approvals:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch pending labour approvals' });
  }
});


// ============================================================
// POST /Post-labour-management
// ============================================================
router.post('/Post-labour-management', async (req, res) => {
  try {
    const {
      uid, Status_3, Labouar_Contractor_Name_3, Labour_Category_1_3,
      Number_Of_Labour_1_3, Labour_Rate_1_3, Labour_Category_2_3,
      Number_Of_Labour_2_3, Labour_Rate_2_3, Total_Wages_3, Conveyanance_3,
      Contractor_Commission, Total_Paid_Amount_3, Company_Head_Amount_3,
      Contractor_Head_Amount_3, Remark_3
    } = req.body;

    if (!uid) {
      return res.status(400).json({ success: false, message: 'UID is required' });
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SiteExpeseSheetId,
      range: 'Labour_FMS!A7:AT',
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No data found in Labour_FMS sheet' });
    }

    const rowIndex = rows.findIndex(row =>
      row[1] && String(row[1]).trim() === String(uid).trim()
    );

    if (rowIndex === -1) {
      return res.status(404).json({ success: false, message: `UID not found: ${uid}` });
    }

    const sheetRowNumber = 7 + rowIndex;
    const batchData = [];

    const addIfValid = (colLetter, value) => {
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        batchData.push({
          range: `Labour_FMS!${colLetter}${sheetRowNumber}`,
          values: [[value]]
        });
      }
    };

    if (Status_3 !== undefined && String(Status_3).trim() !== '') addIfValid('AE', Status_3);
    if (Labouar_Contractor_Name_3 !== undefined && String(Labouar_Contractor_Name_3).trim() !== '') addIfValid('AG', Labouar_Contractor_Name_3);
    if (Labour_Category_1_3 !== undefined && String(Labour_Category_1_3).trim() !== '') addIfValid('AH', Labour_Category_1_3);
    if (Number_Of_Labour_1_3 !== undefined && String(Number_Of_Labour_1_3).trim() !== '') addIfValid('AI', Number_Of_Labour_1_3);
    if (Labour_Rate_1_3 !== undefined && String(Labour_Rate_1_3).trim() !== '') addIfValid('AJ', Labour_Rate_1_3);
    if (Labour_Category_2_3 !== undefined && String(Labour_Category_2_3).trim() !== '') addIfValid('AK', Labour_Category_2_3);
    if (Number_Of_Labour_2_3 !== undefined && String(Number_Of_Labour_2_3).trim() !== '') addIfValid('AL', Number_Of_Labour_2_3);
    if (Labour_Rate_2_3 !== undefined && String(Labour_Rate_2_3).trim() !== '') addIfValid('AM', Labour_Rate_2_3);
    if (Total_Wages_3 !== undefined && String(Total_Wages_3).trim() !== '') addIfValid('AN', Total_Wages_3);
    if (Conveyanance_3 !== undefined && String(Conveyanance_3).trim() !== '') addIfValid('AO', Conveyanance_3);

    if (Contractor_Commission !== undefined && Contractor_Commission !== null && String(Contractor_Commission).trim() !== '') {
      batchData.push({ range: `Labour_FMS!AP${sheetRowNumber}`, values: [[String(Contractor_Commission).trim()]] });
    }
    if (Total_Paid_Amount_3 !== undefined && Total_Paid_Amount_3 !== null && String(Total_Paid_Amount_3).trim() !== '') {
      batchData.push({ range: `Labour_FMS!AQ${sheetRowNumber}`, values: [[String(Total_Paid_Amount_3).trim()]] });
    }
    if (Company_Head_Amount_3 !== undefined && Company_Head_Amount_3 !== null && String(Company_Head_Amount_3).trim() !== '') {
      batchData.push({ range: `Labour_FMS!AR${sheetRowNumber}`, values: [[String(Company_Head_Amount_3).trim()]] });
    }
    if (Contractor_Head_Amount_3 !== undefined && Contractor_Head_Amount_3 !== null && String(Contractor_Head_Amount_3).trim() !== '') {
      batchData.push({ range: `Labour_FMS!AS${sheetRowNumber}`, values: [[String(Contractor_Head_Amount_3).trim()]] });
    }
    if (Remark_3 !== undefined && Remark_3 !== null && String(Remark_3).trim() !== '') {
      batchData.push({ range: `Labour_FMS!AT${sheetRowNumber}`, values: [[String(Remark_3).trim()]] });
    }

    if (batchData.length === 0) {
      return res.json({
        success: true,
        message: 'No valid/non-empty fields to update',
        rowNumber: sheetRowNumber,
        updatedColumns: [],
        updatedCount: 0
      });
    }

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SiteExpeseSheetId,
      resource: { valueInputOption: 'USER_ENTERED', data: batchData },
    });

    const updatedColumns = batchData.map(update => {
      const colMatch = update.range.split('!')[1]?.match(/^[A-Z]+/);
      return colMatch ? colMatch[0] : 'unknown';
    });

    return res.json({
      success: true,
      message: 'Labour_FMS payment/management fields updated successfully',
      rowNumber: sheetRowNumber,
      updatedColumns,
      updatedCount: batchData.length
    });

  } catch (error) {
    console.error('=== BACKEND ERROR ===', error);
    return res.status(500).json({
      success: false,
      message: 'Update failed',
      error: error.message || 'Unknown error'
    });
  }
});


// ============================================================
// ✅ NEW - POST /update-labour-requirement (Jiski Wajah Se 404 Aa Raha Tha)
// Updates the "Labour_Requirement" sheet based on UID
// ============================================================
router.post('/update-labour-requirement', async (req, res) => {
  const {
    uid, Status_3, Time_Delay_3, Labouar_Contractor_Name_3, Labour_Category_1_3,
    Number_Of_Labour_1_3, Labour_Rate_1_3, Labour_Category_2_3,
    Number_Of_Labour_2_3, Labour_Rate_2_3, Total_Wages_3, Conveyanance_3,
    Contractor_Commission, Total_Paid_Amount_3, Company_Head_Amount_3,
    Contractor_Head_Amount_3, Remark_3
  } = req.body;

  if (!uid) {
    return res.status(400).json({ success: false, message: 'UID is required' });
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SiteExpeseSheetId,
      range: 'Labour_Requirement!A2:AL10000',
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No data found in Labour_Requirement sheet' });
    }

    const rowIndex = rows.findIndex(row =>
      row[1] && String(row[1]).trim().toUpperCase() === String(uid).trim().toUpperCase()
    );

    if (rowIndex === -1) {
      return res.status(404).json({ success: false, message: `UID not found in Labour_Requirement: ${uid}` });
    }

    const sheetRowNumber = 2 + rowIndex; // Starting range A2 so index 0 is row 2
    const batchData = [];

    const addIfValid = (colLetter, value) => {
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        batchData.push({
          range: `Labour_Requirement!${colLetter}${sheetRowNumber}`,
          values: [[value]]
        });
      }
    };

    // Columns mapping from W to AL
    addIfValid('W', Status_3);
    addIfValid('X', Time_Delay_3);
    addIfValid('Y', Labouar_Contractor_Name_3);
    addIfValid('Z', Labour_Category_1_3);
    addIfValid('AA', Number_Of_Labour_1_3);
    addIfValid('AB', Labour_Rate_1_3);
    addIfValid('AC', Labour_Category_2_3);
    addIfValid('AD', Number_Of_Labour_2_3);
    addIfValid('AE', Labour_Rate_2_3);
    addIfValid('AF', Total_Wages_3);
    addIfValid('AG', Conveyanance_3);
    addIfValid('AH', Contractor_Commission);
    addIfValid('AI', Total_Paid_Amount_3);
    addIfValid('AJ', Company_Head_Amount_3);
    addIfValid('AK', Contractor_Head_Amount_3);
    addIfValid('AL', Remark_3);

    if (batchData.length === 0) {
      return res.json({ success: true, message: 'No non-empty fields to update' });
    }

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SiteExpeseSheetId,
      resource: { valueInputOption: 'USER_ENTERED', data: batchData },
    });

    return res.json({
      success: true,
      message: 'Labour_Requirement updated successfully',
      rowNumber: sheetRowNumber,
      updatedCount: batchData.length
    });

  } catch (error) {
    console.error('Error updating Labour_Requirement:', error);
    return res.status(500).json({ success: false, message: 'Update failed', error: error.message });
  }
});


// ============================================================
// GET /get-Approvel-ashokSir
// ============================================================
router.get('/get-Approvel-ashokSir', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SiteExpeseSheetId,
      range: 'Labour_FMS!A7:BT',
    });

    const rows = response.data.values || [];

    const pendingLabour = rows
      .filter(row => {
        if (row.length < 18) return false;
        const planned4 = (row[49] || '').toString().trim();
        const actual4  = (row[50] || '').toString().trim();
        return planned4 !== '' && actual4 === '';
      })
      .map(row => ({
        timestamp:                 row[0]  || '',
        uid:                       row[1]  || '',
        projectName:               row[2]  || '',
        projectEngineer:           row[3]  || '',
        workType:                  row[4]  || '',
        workDescription:           row[5]  || '',
        labourCategory1:           row[6]  || '',
        numberOfLabour1:           row[7]  || '',
        labourCategory2:           row[8]  || '',
        numberOfLabour2:           row[9]  || '',
        totalLabour:               row[10] || '',
        dateRequired:              row[11] || '',
        headOfContractor:          row[12] || '',
        nameOfContractor:          row[25] || '',
        contractorFirmName:        row[26] || '',
        Approved_Head_2:           row[24] || '',
        Labouar_Contractor_Name_3: row[32] || '',
        Labour_Category_1_3:       row[33] || '',
        Number_Of_Labour_1_3:      row[34] || '',
        Labour_Rate_1_3:           row[35] || '',
        Labour_Category_2_3:       row[36] || '',
        Number_Of_Labour_2_3:      row[37] || '',
        Labour_Rate_2_3:           row[38] || '',
        Total_Wages_3:             row[39] || '',
        Conveyanance_3:            row[40] || '',
        Contractor_Commission_3:   row[41] || '',
        Total_Paid_Amount_3:       row[42] || '',
        Company_Head_Amount_3:     row[43] || '',
        Contractor_Head_Amount_3:  row[44] || '',
        remark3:                   row[45] || '',
        planned4:                  row[49] || '',
        actual4:                   row[50] || '',
      }));

    res.json({ success: true, count: pendingLabour.length, data: pendingLabour });
  } catch (error) {
    console.error('Error fetching pending labour approvals:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch pending labour approvals' });
  }
});


// ============================================================
// POST /Post-labour-Approvel-AshokSir
// ============================================================
router.post('/Post-labour-Approvel-AshokSir', async (req, res) => {
  const {
    uid, status,
    Deployed_Category_1_Labour_No_4,
    Deployed_Category_2_Labour_No_4,
    Revised_Company_Head_Amount_4,
    Revised_Contractor_Head_Amount_4,
  } = req.body;

  if (!uid) {
    return res.status(400).json({ success: false, message: 'UID is required' });
  }

  if (
    status === undefined &&
    Deployed_Category_1_Labour_No_4 === undefined &&
    Deployed_Category_2_Labour_No_4 === undefined &&
    Revised_Company_Head_Amount_4 === undefined &&
    Revised_Contractor_Head_Amount_4 === undefined
  ) {
    return res.status(400).json({ success: false, message: 'Provide at least one field to update' });
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SiteExpeseSheetId,
      range: 'Labour_FMS!A7:BF',
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No data found in sheet' });
    }

    const rowIndex = rows.findIndex(row =>
      row[1] && String(row[1]).trim() === String(uid).trim()
    );

    if (rowIndex === -1) {
      return res.status(404).json({ success: false, message: `UID not found: ${uid}` });
    }

    const sheetRowNumber = 7 + rowIndex;
    const batchData = [];

    if (status !== undefined && String(status).trim() !== '')
      batchData.push({ range: `Labour_FMS!AZ${sheetRowNumber}`, values: [[status]] });
    if (Deployed_Category_1_Labour_No_4 !== undefined && String(Deployed_Category_1_Labour_No_4).trim() !== '')
      batchData.push({ range: `Labour_FMS!BB${sheetRowNumber}`, values: [[Deployed_Category_1_Labour_No_4]] });
    if (Deployed_Category_2_Labour_No_4 !== undefined && String(Deployed_Category_2_Labour_No_4).trim() !== '')
      batchData.push({ range: `Labour_FMS!BC${sheetRowNumber}`, values: [[Deployed_Category_2_Labour_No_4]] });
    if (Revised_Company_Head_Amount_4 !== undefined && String(Revised_Company_Head_Amount_4).trim() !== '')
      batchData.push({ range: `Labour_FMS!BD${sheetRowNumber}`, values: [[Revised_Company_Head_Amount_4]] });
    if (Revised_Contractor_Head_Amount_4 !== undefined && String(Revised_Contractor_Head_Amount_4).trim() !== '')
      batchData.push({ range: `Labour_FMS!BE${sheetRowNumber}`, values: [[Revised_Contractor_Head_Amount_4]] });

    if (batchData.length === 0) {
      return res.json({ success: true, message: 'No non-empty values to update' });
    }

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SiteExpeseSheetId,
      resource: { valueInputOption: 'USER_ENTERED', data: batchData },
    });

    return res.json({
      success: true,
      message: 'Row updated successfully',
      rowNumber: sheetRowNumber,
      updatedColumns: batchData.map(d => d.range.match(/!([A-Z]+)/)?.[1]),
    });

  } catch (error) {
    console.error('Update error:', error);
    return res.status(500).json({ success: false, message: 'Update failed', error: error.message });
  }
});


// ============================================================
// GET /get-paid-step
// ============================================================
router.get('/get-paid-step', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SiteExpeseSheetId,
      range: 'Labour_FMS!A7:BM',
    });

    const rows = response.data.values || [];

    const pendingLabour = rows
      .filter(row => {
        if (row.length < 18) return false;
        const planned3 = (row[63] || '').toString().trim();
        const actual3  = (row[64] || '').toString().trim();
        return planned3 !== '' && actual3 === '';
      })
      .map(row => ({
        timestamp:                        row[0]  || '',
        uid:                              row[1]  || '',
        projectName:                      row[2]  || '',
        projectEngineer:                  row[3]  || '',
        workType:                         row[4]  || '',
        workDescription:                  row[5]  || '',
        labourCategory1:                  row[6]  || '',
        numberOfLabour1:                  row[7]  || '',
        labourCategory2:                  row[8]  || '',
        numberOfLabour2:                  row[9]  || '',
        totalLabour:                      row[10] || '',
        dateRequired:                     row[11] || '',
        headOfContractor:                 row[12] || '',
        nameOfContractor:                 row[13] || '',
        contractorFirmName:               row[14] || '',
        Approved_Head_2:                  row[24] || '',
        Labouar_Contractor_Name_3:        row[32] || '',
        Labour_Category_1_3:              row[33] || '',
        Number_Of_Labour_1_3:             row[34] || '',
        Labour_Rate_1_3:                  row[35] || '',
        Labour_Category_2_3:              row[36] || '',
        Number_Of_Labour_2_3:             row[37] || '',
        Labour_Rate_2_3:                  row[38] || '',
        Total_Wages_3:                    row[39] || '',
        Conveyanance_3:                   row[40] || '',
        Total_Paid_Amount_3:              row[42] || '',
        Deployed_Category_1_Labour_No_4:  row[51] || '',
        Deployed_Category_2_Labour_No_4:  row[52] || '',
        Revised_Company_Head_Amount_4:    row[55] || '',
        Revised_Contractor_Head_Amount_4: row[56] || '',
        Paid_Name:                        row[60] || '',
        Bill_No:                          row[61] || '',
        Bill_Url:                         row[62] || '',
        remark4:                          row[56] || '',
        planned5:                         row[63] || '',
        actua5:                           row[64] || '',
      }));

    res.json({ success: true, count: pendingLabour.length, data: pendingLabour });
  } catch (error) {
    console.error('Error fetching pending labour approvals:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch pending labour approvals' });
  }
});


// ============================================================
// POST /Post-labour-Paid
// ============================================================
router.post('/Post-labour-Paid', async (req, res) => {
  const {
    uid, isLastUID, Status_5, Paid_Amount_5, TDS_Amount_5, Net_Amount_5,
    PAYMENT_MODE_5, BANK_DETAILS_5, PAYMENT_DETAILS_5, Payment_Date_5, Remark_5
  } = req.body;

  if (!uid) {
    return res.status(400).json({ success: false, message: 'UID is required' });
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SiteExpeseSheetId,
      range: 'Labour_FMS!A7:BW',
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No data found in Labour_FMS sheet' });
    }

    const rowIndex = rows.findIndex(row =>
      row[1] && String(row[1]).trim() === String(uid).trim()
    );

    if (rowIndex === -1) {
      return res.status(404).json({ success: false, message: `UID not found: ${uid}` });
    }

    const sheetRowNumber = 7 + rowIndex;
    const batchData = [];

    if (isLastUID) {
      batchData.push({ range: `Labour_FMS!BN${sheetRowNumber}`, values: [[Status_5 || 'Done']] });

      if (Status_5 !== 'Reject') {
        if (Paid_Amount_5)      batchData.push({ range: `Labour_FMS!BP${sheetRowNumber}`, values: [[Paid_Amount_5]] });
        if (TDS_Amount_5)       batchData.push({ range: `Labour_FMS!BQ${sheetRowNumber}`, values: [[TDS_Amount_5]] });
        if (Net_Amount_5)       batchData.push({ range: `Labour_FMS!BR${sheetRowNumber}`, values: [[Net_Amount_5]] });
        if (PAYMENT_MODE_5)     batchData.push({ range: `Labour_FMS!BS${sheetRowNumber}`, values: [[PAYMENT_MODE_5]] });
        if (BANK_DETAILS_5)     batchData.push({ range: `Labour_FMS!BT${sheetRowNumber}`, values: [[BANK_DETAILS_5]] });
        if (PAYMENT_DETAILS_5)  batchData.push({ range: `Labour_FMS!BU${sheetRowNumber}`, values: [[PAYMENT_DETAILS_5]] });
        if (Payment_Date_5)     batchData.push({ range: `Labour_FMS!BV${sheetRowNumber}`, values: [[Payment_Date_5]] });
        if (Remark_5)           batchData.push({ range: `Labour_FMS!BW${sheetRowNumber}`, values: [[Remark_5]] });
      } else {
        ['BP', 'BQ', 'BR', 'BS', 'BT', 'BU', 'BV'].forEach(col => {
          batchData.push({ range: `Labour_FMS!${col}${sheetRowNumber}`, values: [['-']] });
        });
        batchData.push({ range: `Labour_FMS!BW${sheetRowNumber}`, values: [[Remark_5 || '-']] });
      }
    } else {
      batchData.push({ range: `Labour_FMS!BN${sheetRowNumber}`, values: [['Done']] });
      ['BP', 'BQ', 'BR', 'BS', 'BT', 'BU', 'BV', 'BW'].forEach(col => {
        batchData.push({ range: `Labour_FMS!${col}${sheetRowNumber}`, values: [['-']] });
      });
    }

    if (batchData.length === 0) {
      return res.json({ success: true, message: 'No fields to update' });
    }

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SiteExpeseSheetId,
      resource: { valueInputOption: 'USER_ENTERED', data: batchData },
    });

    const updatedColumns = batchData.map(d => d.range.match(/!([A-Z]+)/)?.[1] || 'Unknown');

    return res.json({
      success: true,
      message: isLastUID ? 'Last UID saved' : 'Non-last UID saved',
      rowNumber: sheetRowNumber,
      isLastUID,
      Status_5,
      updatedColumns,
      updatedCount: batchData.length
    });

  } catch (error) {
    console.error('Labour paid update error:', error);
    return res.status(500).json({ success: false, message: 'Update failed', error: error.message });
  }
});


// ============================================================
// GET /get-Labour-Attendance
// ============================================================
router.get('/get-Labour-Attendance', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: CompanyLabourSheetId,
      range: 'Labour_Attedace_FMS!A7:W10000',
      majorDimension: 'ROWS',
    });

    const rows = response.data.values || [];

    const attendanceData = rows
      .filter(row => {
        if (!row || !row[1] || String(row[1]).trim() === '') return false;
        const planned2 = (row[19] || '').toString().trim();
        const actual2  = (row[20] || '').toString().trim();
        return planned2 !== '' && actual2 === '';
      })
      .map((row, index) => ({
        rowNumber:               7 + index,
        timestamp:               row[0]  || '',
        uid:                     row[1]  || '',
        workDate:                row[2]  || '',
        projectName:             row[3]  || '',
        projectEngineer:         row[4]  || '',
        labourName:              row[6]  || '',
        dayNight:                row[7]  || '',
        dayAttendance:           row[8]  || '',
        workType:                row[9]  || '',
        workDescription:         row[10] || '',
        headOfContractorCompany: row[11] || '',
        nameOfContractor:        row[12] || '',
        contractorFirmName:      row[13] || '',
        remark:                  row[14] || '',
        planned2:                row[15] || '',
        actual2:                 row[16] || '',
        status2:                 row[17] || '',
        timeDelay2:              row[18] || '',
        approvedHead2:           row[19] || '',
        nameOfContractor2:       row[20] || '',
        contractorFirmName2:     row[21] || '',
        remark2:                 row[22] || '',
      }));

    attendanceData.reverse();

    res.json({
      success: true,
      count:   attendanceData.length,
      data:    attendanceData,
    });
  } catch (error) {
    console.error('Error fetching Labour Attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch labour attendance',
      error:   error.message,
    });
  }
});


// ============================================================
// POST /Update-Labour-Attendance
// ============================================================
router.post('/Update-Labour-Attendance', async (req, res) => {
  const {
    uid, Work_Date_1, Project_Name_1, Project_Engineer_1, Labour_Name_1,
    Day_Night_1, Day_Attendance_1, Work_Type_1, Work_Description_1,
    Head_Of_Contractor_Company_1, Name_Of_Contractor_1, Contractor_Firm_Name_1, Remark_1
  } = req.body;

  if (!uid) {
    return res.status(400).json({ success: false, message: 'UID is required' });
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: CompanyLabourSheetId,
      range: 'Labour_Attedace_FMS!A7:AA10000',
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No data found' });
    }

    const rowIndex = rows.findIndex(row =>
      row[1] && String(row[1]).trim() === String(uid).trim()
    );

    if (rowIndex === -1) {
      return res.status(404).json({ success: false, message: `UID not found: ${uid}` });
    }

    const sheetRowNumber = 7 + rowIndex;
    const batchData = [];

    const addIfValid = (colLetter, value) => {
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        batchData.push({
          range:  `Labour_Attedace_FMS!${colLetter}${sheetRowNumber}`,
          values: [[value]],
        });
      }
    };

    addIfValid('C', Work_Date_1);
    addIfValid('D', Project_Name_1);
    addIfValid('E', Project_Engineer_1);
    addIfValid('G', Labour_Name_1);
    addIfValid('H', Day_Night_1);
    addIfValid('I', Day_Attendance_1);
    addIfValid('J', Work_Type_1);
    addIfValid('K', Work_Description_1);
    addIfValid('L', Head_Of_Contractor_Company_1);
    addIfValid('M', Name_Of_Contractor_1);
    addIfValid('N', Contractor_Firm_Name_1);
    addIfValid('O', Remark_1);

    if (batchData.length === 0) {
      return res.json({ success: true, message: 'No valid fields to update' });
    }

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: CompanyLabourSheetId,
      resource: { valueInputOption: 'USER_ENTERED', data: batchData },
    });

    return res.json({
      success:        true,
      message:        'Labour Attendance updated successfully',
      rowNumber:      sheetRowNumber,
      updatedCount:   batchData.length,
    });
  } catch (error) {
    console.error('Update error:', error);
    return res.status(500).json({ success: false, message: 'Update failed', error: error.message });
  }
});


// ============================================================
// POST /Update-Labour-Attendance-Approval
// ============================================================
router.post('/Update-Labour-Attendance-Approval', async (req, res) => {
  const {
    uid, Status_2, Approved_Head_2, Name_Of_Contractor_2, Contractor_Firm_Name_2, Remark_2
  } = req.body;

  if (!uid) {
    return res.status(400).json({ success: false, message: 'UID is required' });
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: CompanyLabourSheetId,
      range: 'Labour_Attedace_FMS!A7:AA10000',
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No data found' });
    }

    const rowIndex = rows.findIndex(row =>
      row[1] && String(row[1]).trim() === String(uid).trim()
    );

    if (rowIndex === -1) {
      return res.status(404).json({ success: false, message: `UID not found: ${uid}` });
    }

    const sheetRowNumber = 7 + rowIndex;
    const batchData = [];

    if (Status_2 !== undefined && String(Status_2).trim() !== '') {
      batchData.push({
        range: `Labour_Attedace_FMS!V${sheetRowNumber}`,
        values: [[Status_2]],
      });
    }

    if (Approved_Head_2 !== undefined) {
      batchData.push({
        range: `Labour_Attedace_FMS!X${sheetRowNumber}`,
        values: [[Approved_Head_2 || '']],
      });
    }

    if (Name_Of_Contractor_2 !== undefined) {
      batchData.push({
        range: `Labour_Attedace_FMS!Y${sheetRowNumber}`,
        values: [[Name_Of_Contractor_2 || '']],
      });
    }

    if (Contractor_Firm_Name_2 !== undefined) {
      batchData.push({
        range: `Labour_Attedace_FMS!Z${sheetRowNumber}`,
        values: [[Contractor_Firm_Name_2 || '']],
      });
    }

    if (Remark_2 !== undefined) {
      batchData.push({
        range: `Labour_Attedace_FMS!AA${sheetRowNumber}`,
        values: [[Remark_2 || '']],
      });
    }

    if (batchData.length === 0) {
      return res.json({ success: true, message: 'No fields to update' });
    }

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: CompanyLabourSheetId,
      resource: { valueInputOption: 'USER_ENTERED', data: batchData },
    });

    return res.json({
      success:        true,
      message:        'Attendance approval updated successfully',
      rowNumber:      sheetRowNumber,
      updatedCount:   batchData.length,
    });
  } catch (error) {
    console.error('Approval update error:', error);
    return res.status(500).json({ success: false, message: 'Update failed', error: error.message });
  }
});


module.exports = router;