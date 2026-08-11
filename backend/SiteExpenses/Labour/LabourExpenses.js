
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
    const seenContractors = new Set();

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
// GET /get-Labour-management
// ============================================================
router.get('/get-Labour-management', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SiteExpeseSheetId,
      range: 'Labour_FMS!A7:AD',
    });

    const rows = response.data.values || [];

    const pendingLabour = rows
      .filter(row => {
        if (row.length < 18) return false;
        const planned3 = (row[28] || '').toString().trim();
        const actual3  = (row[29] || '').toString().trim();
        return planned3 !== '' && actual3 === '';
      })
      .map(row => ({
        timestamp:             row[0]  || '',
        uid:                   row[1]  || '',
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
      }));

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

    console.log('=== INCOMING PAYLOAD ===');
    console.log('Contractor_Commission:', Contractor_Commission);
    console.log('Total_Paid_Amount_3:', Total_Paid_Amount_3);
    console.log('========================');

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

    console.log('=== BATCH DATA TO WRITE ===');
    batchData.forEach(item => console.log(`${item.range} → ${item.values[0][0]}`));
    console.log('===========================');

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
      message: 'Update failed - see server logs for details',
      error: error.message || 'Unknown error'
    });
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
    console.log(`Found UID ${uid} at array index ${rowIndex} → sheet row ${sheetRowNumber}`);

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
    console.log(`Found UID ${uid} at sheet row ${sheetRowNumber} | isLastUID: ${isLastUID}`);

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
      message: isLastUID
        ? (Status_5 === 'Reject'
          ? 'Last UID rejected - BN=Reject, BP-BV="-", BW=Remark'
          : 'Last UID - All payment details saved (BN,BP-BW)')
        : 'Non-last UID - BN=Done, BP-BW="-"',
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


// ═══════════════════════════════════════════════════════════════════
// ✅ LABOUR ATTENDANCE APIs (Company Labour Sheet)
// ═══════════════════════════════════════════════════════════════════

// ============================================================
// GET /get-Labour-Attendance
// CompanyLabourSheetId → Labour_Attedace_FMS!A7 se saara data
// ✅ UPDATED - Ab T to W columns bhi fetch karta hai (approval fields)
// ============================================================
router.get('/get-Labour-Attendance', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: CompanyLabourSheetId,
      range: 'Labour_Attedace_FMS!A7:W10000',
      majorDimension: 'ROWS',
    });

    const rows = response.data.values || [];
    console.log(`[LABOUR ATTENDANCE] Total rows fetched: ${rows.length}`);

    const attendanceData = rows
      .filter(row => {
        // UID (col B) mandatory
        if (!row || !row[1] || String(row[1]).trim() === '') return false;

        // ✅ FILTER LOGIC:
        // Planned_2 (P - row[15]) me data hona chahiye
        // Actual_2  (Q - row[16]) me data NAHI hona chahiye
        const planned2 = (row[19] || '').toString().trim();
        const actual2  = (row[20] || '').toString().trim();

        return planned2 !== '' && actual2 === '';
      })
      .map((row, index) => ({
        rowNumber:               7 + index,       // Actual sheet row (approximate)
        timestamp:               row[0]  || '',   // A - Timestamp
        uid:                     row[1]  || '',   // B - UID
        workDate:                row[2]  || '',   // C - Work_Date_1
        projectName:             row[3]  || '',   // D - Project_Name_1
        projectEngineer:         row[4]  || '',   // E - Project_Engineer_1
        // F (row[5]) - Blank (skip)
        labourName:              row[6]  || '',   // G - Labour_Name_1
        dayNight:                row[7]  || '',   // H - Day_Night_1
        dayAttendance:           row[8]  || '',   // I - Day Attendance
        workType:                row[9]  || '',   // J - Work_Type_1
        workDescription:         row[10] || '',   // K - Work_Description_1
        headOfContractorCompany: row[11] || '',   // L - Head Of Contractor/Company_1
        nameOfContractor:        row[12] || '',   // M - Name_Of_Contractor_1
        contractorFirmName:      row[13] || '',   // N - Contractor_Firm_Name_1
        remark:                  row[14] || '',   // O - Remark_1

        // Approval Fields (P to W)
        planned2:                row[15] || '',   // P - Planned_2
        actual2:                 row[16] || '',   // Q - Actual_2
        status2:                 row[17] || '',   // R - Status_2
        timeDelay2:              row[18] || '',   // S - Time_Delay_2
        approvedHead2:           row[19] || '',   // T - Approved_Head_2
        nameOfContractor2:       row[20] || '',   // U - Name_Of_Contractor_2
        contractorFirmName2:     row[21] || '',   // V - Contractor_Firm_Name_2
        remark2:                 row[22] || '',   // W - Remark_2
      }));

    // Latest entries pehle dikhao
    attendanceData.reverse();

    // Stats
    const stats = {
      totalEntries:   attendanceData.length,
      uniqueLabours:  [...new Set(attendanceData.map(d => d.labourName).filter(Boolean))].length,
      uniqueProjects: [...new Set(attendanceData.map(d => d.projectName).filter(Boolean))].length,
      dayCount:       attendanceData.filter(d => d.dayNight === 'Day').length,
      nightCount:     attendanceData.filter(d => d.dayNight === 'Night').length,
      fullDayCount:   attendanceData.filter(d => d.dayAttendance === 'Full Day').length,
      halfDayCount:   attendanceData.filter(d => d.dayAttendance === 'Half Day').length,
      absentCount:    attendanceData.filter(d => d.dayAttendance === 'Absent').length,
      pendingCount:   attendanceData.filter(d => !d.status2).length,
      approvedCount:  attendanceData.filter(d => d.status2 === 'Approved').length,
      rejectedCount:  attendanceData.filter(d => d.status2 === 'Reject').length,
    };

    console.log(`[LABOUR ATTENDANCE] Filtered (Planned_2 ✅ + Actual_2 ❌): ${attendanceData.length} rows`);
    console.log('[LABOUR ATTENDANCE] Stats:', stats);

    res.json({
      success: true,
      count:   attendanceData.length,
      stats,
      data:    attendanceData,
    });
  } catch (error) {
    console.error('❌ Error fetching Labour Attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch labour attendance',
      error:   error.message,
    });
  }
});

// ============================================================
// POST /Update-Labour-Attendance
// UID se existing attendance entry update karo (form re-edit)
// ============================================================
router.post('/Update-Labour-Attendance', async (req, res) => {
  const {
    uid,
    Work_Date_1,
    Project_Name_1,
    Project_Engineer_1,
    Labour_Name_1,
    Day_Night_1,
    Day_Attendance_1,
    Work_Type_1,
    Work_Description_1,
    Head_Of_Contractor_Company_1,
    Name_Of_Contractor_1,
    Contractor_Firm_Name_1,
    Remark_1,
  } = req.body;

  if (!uid) {
    return res.status(400).json({
      success: false,
      message: 'UID is required',
    });
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: CompanyLabourSheetId,
      range: 'Labour_Attedace_FMS!A7:AA10000',
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No data found in Labour_Attedace_FMS sheet',
      });
    }

    const rowIndex = rows.findIndex(row =>
      row[1] && String(row[1]).trim() === String(uid).trim()
    );

    if (rowIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `UID not found: ${uid}`,
      });
    }

    const sheetRowNumber = 7 + rowIndex;
    console.log(`[UPDATE] Found UID ${uid} at row ${sheetRowNumber}`);

    const batchData = [];

    const addIfValid = (colLetter, value) => {
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        batchData.push({
          range:  `Labour_Attedace_FMS!${colLetter}${sheetRowNumber}`,
          values: [[value]],
        });
      }
    };

    // Column mapping (F blank column skip)
    addIfValid('C', Work_Date_1);
    addIfValid('D', Project_Name_1);
    addIfValid('E', Project_Engineer_1);
    // F - BLANK (skip)
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
      return res.json({
        success: true,
        message: 'No valid fields to update',
      });
    }

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: CompanyLabourSheetId,
      resource: {
        valueInputOption: 'USER_ENTERED',
        data:             batchData,
      },
    });

    const updatedColumns = batchData.map(d => d.range.match(/!([A-Z]+)/)?.[1]);

    console.log(`[UPDATE SUCCESS] Row ${sheetRowNumber} | Columns: ${updatedColumns.join(', ')}`);

    return res.json({
      success:        true,
      message:        'Labour Attendance updated successfully',
      rowNumber:      sheetRowNumber,
      updatedColumns,
      updatedCount:   batchData.length,
    });
  } catch (error) {
    console.error('❌ Update error:', error);
    return res.status(500).json({
      success: false,
      message: 'Update failed',
      error:   error.message,
    });
  }
});


// ============================================================
// ✅ NEW - POST /Update-Labour-Attendance-Approval
// Attendance approval (R to W columns): Status, Approved Head, 
// Contractor Name, Firm Name, Remark
// 
// COLUMN MAPPING:
//   P - Planned_2         → SKIP (auto)
//   Q - Actual_2          → SKIP (auto)
//   R - Status_2          ✅ Update
//   S - Time_Delay_2      → SKIP (auto)
//   T - Approved_Head_2   ✅ Update
//   U - Name_Of_Contractor_2   ✅ Update
//   V - Contractor_Firm_Name_2 ✅ Update
//   W - Remark_2          ✅ Update
// ============================================================
router.post('/Update-Labour-Attendance-Approval', async (req, res) => {
  const {
    uid,
    Status_2,
    Approved_Head_2,
    Name_Of_Contractor_2,
    Contractor_Firm_Name_2,
    Remark_2,
  } = req.body;

  if (!uid) {
    return res.status(400).json({
      success: false,
      message: 'UID is required',
    });
  }

  try {
    // Fetch all UIDs from column B
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: CompanyLabourSheetId,
      range: 'Labour_Attedace_FMS!A7:AA10000',
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No data found in Labour_Attedace_FMS sheet',
      });
    }

    // Find row by UID
    const rowIndex = rows.findIndex(row =>
      row[1] && String(row[1]).trim() === String(uid).trim()
    );

    if (rowIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `UID not found: ${uid}`,
      });
    }

    const sheetRowNumber = 7 + rowIndex;
    console.log(`[APPROVAL UPDATE] UID ${uid} → row ${sheetRowNumber}`);

    const batchData = [];

    // R - Status_2 (Approved / Reject)
    if (Status_2 !== undefined && String(Status_2).trim() !== '') {
      batchData.push({
        range: `Labour_Attedace_FMS!V${sheetRowNumber}`,
        values: [[Status_2]],
      });
    }

    // T - Approved_Head_2 (Company Head / Contractor Head)
    if (Approved_Head_2 !== undefined) {
      batchData.push({
        range: `Labour_Attedace_FMS!X${sheetRowNumber}`,
        values: [[Approved_Head_2 || '']],
      });
    }

    // U - Name_Of_Contractor_2
    if (Name_Of_Contractor_2 !== undefined) {
      batchData.push({
        range: `Labour_Attedace_FMS!Y${sheetRowNumber}`,
        values: [[Name_Of_Contractor_2 || '']],
      });
    }

    // V - Contractor_Firm_Name_2
    if (Contractor_Firm_Name_2 !== undefined) {
      batchData.push({
        range: `Labour_Attedace_FMS!Z${sheetRowNumber}`,
        values: [[Contractor_Firm_Name_2 || '']],
      });
    }

    // W - Remark_2
    if (Remark_2 !== undefined) {
      batchData.push({
        range: `Labour_Attedace_FMS!AA${sheetRowNumber}`,
        values: [[Remark_2 || '']],
      });
    }

    if (batchData.length === 0) {
      return res.json({
        success: true,
        message: 'No fields to update',
      });
    }

    console.log('[APPROVAL BATCH DATA]');
    batchData.forEach(item => console.log(`  ${item.range} → ${item.values[0][0]}`));

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: CompanyLabourSheetId,
      resource: {
        valueInputOption: 'USER_ENTERED',
        data: batchData,
      },
    });

    const updatedColumns = batchData.map(d => d.range.match(/!([A-Z]+)/)?.[1]);

    console.log(`[APPROVAL SUCCESS] Row ${sheetRowNumber} | Columns: ${updatedColumns.join(', ')}`);

    return res.json({
      success:        true,
      message:        'Attendance approval updated successfully',
      rowNumber:      sheetRowNumber,
      updatedColumns,
      updatedCount:   batchData.length,
    });
  } catch (error) {
    console.error('❌ Approval update error:', error);
    return res.status(500).json({
      success: false,
      message: 'Update failed',
      error:   error.message,
    });
  }
});


module.exports = router;