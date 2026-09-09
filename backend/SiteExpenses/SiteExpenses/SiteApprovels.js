const express = require("express");
const { sheets, SiteExpeseSheetId } = require("../../config/googleSheet");

const router = express.Router();

router.get("/Site-Approvel-1", async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SiteExpeseSheetId,
      range: "Site_Exp_FMS!A7:V", // starts from row 7
    });

    const rows = response.data.values || [];

  
    const dataRows = rows.slice(1); 
    const pendingApprovals = dataRows
      .filter((row) => {
        // Make sure row has at least 15 columns (A to O)
        if (row.length < 15) return false;

        const planned = (row[20] || "").toString().trim();
        const actual = (row[21] || "").toString().trim();

        return planned !== "" && actual === "";
      })
      .map((row) => ({
        timestamp: row[0] || "",
        uid: row[1] || "",
        RccBillNo: row[2] || "",
        payeeName: row[3] || "",
        projectName: row[4] || "",
        projectEngineerName: row[5] || "",
        headType: row[6] || "",
        detailsOfWork: row[7] || "",
        costAmount: row[8] || "",
        BillNO: row[9] || "",
        BillDate: row[10] || "",
        billPhoto: row[11] || "",
        EXPHead: row[12] || "",
        ContractorName: row[13] || "",
        ContractorFirmName: row[14] || "",
        remark: row[15] || "",
        planned2: row[20] || "",
        actual2: row[21] || "",
      }));

    res.json({
      success: true,
      count: pendingApprovals.length,
      data: pendingApprovals,
    });
  } catch (error) {
    console.error("Error in /Site-Approvel-1:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch pending site approvals",
    });
  }
});


router.post("/Post-Site-Approvel-1", async (req, res) => {
  const { 
    uid, 
    status, 
    Approve_Amount, 
    Confirm_Head, 
    Name_Of_Contractor,      // ✅ NEW - Column Z
    Contractor_Firm_Name,    // ✅ NEW - Column AA
    remark                   // ✅ MOVED - Column AC (was AA)
  } = req.body;

  if (!uid) {
    return res.status(400).json({
      success: false,
      message: "UID is required",
    });
  }

  // Optional: require at least one field
  if (
    status === undefined &&
    Approve_Amount === undefined &&
    Confirm_Head === undefined &&
    Name_Of_Contractor === undefined &&
    Contractor_Firm_Name === undefined &&
    remark === undefined
  ) {
    return res.status(400).json({
      success: false,
      message: "Provide at least one field to update (status, Approve_Amount, Confirm_Head, Name_Of_Contractor, Contractor_Firm_Name, remark)",
    });
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SiteExpeseSheetId,
      range: "Site_Exp_FMS!A7:AC",  // ✅ Extended range to include AC column
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No data found in sheet",
      });
    }

    const rowIndex = rows.findIndex(
      (row) => row[1] && String(row[1]).trim() === String(uid).trim()
    );

    if (rowIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `UID not found: ${uid}`,
      });
    }

    const sheetRowNumber = 7 + rowIndex;

    console.log(
      `Found UID ${uid} at array index ${rowIndex} → sheet row ${sheetRowNumber}`
    );

    const batchData = [];

    // Column W - Status
    if (status !== undefined && String(status).trim() !== "") {
      batchData.push({
        range: `Site_Exp_FMS!W${sheetRowNumber}`,
        values: [[status]],
      });
    }

    // Column X - Approve Amount
    if (Approve_Amount !== undefined && String(Approve_Amount).trim() !== "") {
      batchData.push({
        range: `Site_Exp_FMS!X${sheetRowNumber}`,
        values: [[Approve_Amount]],
      });
    }

    // Column Y - Confirm Head
    if (Confirm_Head !== undefined && String(Confirm_Head).trim() !== "") {
      batchData.push({
        range: `Site_Exp_FMS!Y${sheetRowNumber}`,
        values: [[Confirm_Head]],
      });
    }

    // ✅ Column Z - Name of Contractor (NEW)
    if (Name_Of_Contractor !== undefined && String(Name_Of_Contractor).trim() !== "") {
      batchData.push({
        range: `Site_Exp_FMS!Z${sheetRowNumber}`,
        values: [[Name_Of_Contractor]],
      });
    }

    // ✅ Column AA - Contractor Firm Name (NEW)
    if (Contractor_Firm_Name !== undefined && String(Contractor_Firm_Name).trim() !== "") {
      batchData.push({
        range: `Site_Exp_FMS!AA${sheetRowNumber}`,
        values: [[Contractor_Firm_Name]],
      });
    }

    // ✅ Column AC - Remark (MOVED from AA to AC)
    if (remark !== undefined && String(remark).trim() !== "") {
      batchData.push({
        range: `Site_Exp_FMS!AC${sheetRowNumber}`,
        values: [[remark]],
      });
    }

    if (batchData.length === 0) {
      return res.json({
        success: true,
        message: "No non-empty values to update",
      });
    }

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SiteExpeseSheetId,
      resource: {
        valueInputOption: "USER_ENTERED",
        data: batchData,
      },
    });

    return res.json({
      success: true,
      message: "Row updated successfully",
      rowNumber: sheetRowNumber,
      updatedColumns: batchData.map((d) => d.range.match(/!([A-Z]+)/)?.[1]),
    });
  } catch (error) {
    console.error("Update error:", error);
    return res.status(500).json({
      success: false,
      message: "Update failed",
      error: error.message,
    });
  }
});




router.get("/Site-Paid-Step", async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SiteExpeseSheetId,
      range: "Site_Exp_Payment_FMS!A7:V",
    });

    const rows = response.data.values || [];
    const dataRows = rows.slice(1);

    const pendingApprovals = dataRows
      .filter((row) => {
        if (row.length < 15) return false;
        const planned = (row[20] || "").toString().trim();
        const actual = (row[21] || "").toString().trim();
        return planned !== "" && actual === "";
      })
      .map((row) => {
        const costAmount = parseFloat(row[8] || "0") || 0;
        return {
          timestamp: row[0] || "",
          uid: row[1] || "",
          RccBillNo: row[2] || "",
          payeeName: row[3] || "",
          projectName: row[4] || "",
          projectEngineerName: row[5] || "",
          headType: row[6] || "",
          detailsOfWork: row[7] || "",
          costAmount: row[8] || "",
          costAmountNumeric: costAmount,
          BillNO: row[9] || "",
          BillDate: row[10] || "",
          billPhoto: row[11] || "",
          EXPHead: row[12] || "",
          ContractorName: row[13] || "",
          ContractorFirmName: row[14] || "",
          remark: row[15] || "",
          planned2: row[20] || "",
          actual2: row[21] || "",
        };
      });

    res.json({
      success: true,
      count: pendingApprovals.length,
      data: pendingApprovals,
    });
  } catch (error) {
    console.error("Error in /Site-Paid-Step:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch pending site approvals",
    });
  }
});





router.post("/Post-Site-Paid-Step", async (req, res) => {
  const {
    records,           // [{ UID, costAmount }] ya [{ RccBillNo, costAmount }]
    TDS_AMOUNT,        // Z → last row only
    STATUS_3,          // W → every row
    PAYMENT_MODE_3,    // AB → every row
    BANK_DETAILS_3,    // AC → every row
    PAYMENT_DETAILS_3, // AD → every row
    PAYMENT_DATE_3,    // AE → every row
    Receiver_Name,     // AF → every row
    Remark,            // AH → every row
  } = req.body;

  // ── Validation ──────────────────────────────────────────
  if (!records || !Array.isArray(records) || records.length === 0) {
    return res.status(400).json({
      success: false,
      message: "records array is required and must not be empty",
    });
  }

  // UID ya RccBillNo dono accept karo
  const missingIDs = records.filter((r) => !r.UID && !r.RccBillNo);
  if (missingIDs.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Each record must have a UID or RccBillNo",
    });
  }

  if (!STATUS_3) {
    return res.status(400).json({
      success: false,
      message: "STATUS_3 is required",
    });
  }

  const tdsValue = Number(String(TDS_AMOUNT || 0).replace(/,/g, "").trim()) || 0;

  // Helper function - amount normalize
  const normalizeAmount = (val) => {
    if (val === null || val === undefined || val === "") return null;
    const cleaned = String(val).replace(/₹/g, "").replace(/,/g, "").trim();
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : null;
  };

  // Helper function - UID normalize
  const normalizeUID = (val) => String(val || "").trim();

  try {
    // ── Fetch sheet data ─────────────────────────────────
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SiteExpeseSheetId,
      range: "Site_Exp_Payment_FMS!A7:AH",
    });

    const rows = response.data.values || [];

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No data found in sheet",
      });
    }

    // ✅ B column (index 1) se UID map banao
    const uidRowMap = new Map();

    rows.forEach((row, index) => {
      const uid = normalizeUID(row[1]); // ✅ B column = index 1
      if (!uid) return;

      const actualRowNumber = 7 + index;

      if (!uidRowMap.has(uid)) {
        uidRowMap.set(uid, []);
      }
      uidRowMap.get(uid).push(actualRowNumber);
    });

    console.log("UID Row Map (first 10):", [...uidRowMap.entries()].slice(0, 10));

    const batchData = [];
    const results = [];
    const notFound = [];
    const invalidAmounts = [];

    // ── Process each record ──────────────────────────────
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const isLastRecord = i === records.length - 1;

      // UID ya RccBillNo jo bhi ho use karo
      const itemUID = record.UID || record.RccBillNo;

      // Amount get karo
      const paidAmount = normalizeAmount(
        record.costAmount ?? record.amount ?? record.Amount
      );

      if (paidAmount === null) {
        invalidAmounts.push({
          UID: itemUID,
          receivedAmount: record.costAmount ?? record.amount ?? record.Amount,
        });
        continue;
      }

      // ✅ B column se matching
      const uid = normalizeUID(itemUID);
      const rowQueue = uidRowMap.get(uid);

      if (!rowQueue || rowQueue.length === 0) {
        notFound.push(itemUID);
        continue;
      }

      const sheetRowNumber = rowQueue.shift(); // Next available row

      console.log(
        `[${i + 1}/${records.length}] UID: ${itemUID} | Row: ${sheetRowNumber} | Amount: ${paidAmount}`
      );

      // ── W → STATUS_3 (every row) ────────────────────────
      if (STATUS_3 && String(STATUS_3).trim() !== "") {
        batchData.push({
          range: `Site_Exp_Payment_FMS!W${sheetRowNumber}`,
          values: [[STATUS_3]],
        });
      }

      // ── Z → TDS_AMOUNT (last row only) ──────────────────
      if (isLastRecord && tdsValue > 0) {
        batchData.push({
          range: `Site_Exp_Payment_FMS!Z${sheetRowNumber}`,
          values: [[tdsValue]],
        });
      }

      // ── AA → Amount (every row - apna apna amount) ──────
      batchData.push({
        range: `Site_Exp_Payment_FMS!AA${sheetRowNumber}`,
        values: [[paidAmount]],
      });

      // ── AB → PAYMENT_MODE_3 (every row) ─────────────────
      if (PAYMENT_MODE_3 && String(PAYMENT_MODE_3).trim() !== "") {
        batchData.push({
          range: `Site_Exp_Payment_FMS!AB${sheetRowNumber}`,
          values: [[PAYMENT_MODE_3]],
        });
      }

      // ── AC → BANK_DETAILS_3 (every row) ─────────────────
      if (BANK_DETAILS_3 && String(BANK_DETAILS_3).trim() !== "") {
        batchData.push({
          range: `Site_Exp_Payment_FMS!AC${sheetRowNumber}`,
          values: [[BANK_DETAILS_3]],
        });
      }

      // ── AD → PAYMENT_DETAILS_3 (every row) ──────────────
      if (PAYMENT_DETAILS_3 && String(PAYMENT_DETAILS_3).trim() !== "") {
        batchData.push({
          range: `Site_Exp_Payment_FMS!AD${sheetRowNumber}`,
          values: [[PAYMENT_DETAILS_3]],
        });
      }

      // ── AE → PAYMENT_DATE_3 (every row) ─────────────────
      if (PAYMENT_DATE_3 && String(PAYMENT_DATE_3).trim() !== "") {
        batchData.push({
          range: `Site_Exp_Payment_FMS!AE${sheetRowNumber}`,
          values: [[PAYMENT_DATE_3]],
        });
      }

      // ── AF → Receiver_Name (every row) ──────────────────
      if (Receiver_Name && String(Receiver_Name).trim() !== "") {
        batchData.push({
          range: `Site_Exp_Payment_FMS!AF${sheetRowNumber}`,
          values: [[Receiver_Name]],
        });
      }

      // ── AH → Remark (every row) ─────────────────────────
      if (Remark && String(Remark).trim() !== "") {
        batchData.push({
          range: `Site_Exp_Payment_FMS!AH${sheetRowNumber}`,
          values: [[Remark]],
        });
      }

      results.push({
        UID: itemUID,
        sheetRowNumber,
        paidAmount,
        tdsApplied: isLastRecord ? tdsValue : 0,
        isLastRecord,
      });
    }

    // ── Handle not found ─────────────────────────────────
    if (notFound.length > 0) {
      return res.status(404).json({
        success: false,
        message: `UID(s) not found in sheet: ${notFound.join(", ")}`,
        notFound,
      });
    }

    // ── Handle invalid amounts ───────────────────────────
    if (invalidAmounts.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Some records have invalid/missing amount",
        invalidAmounts,
      });
    }

    if (batchData.length === 0) {
      return res.json({
        success: true,
        message: "No valid fields to update",
      });
    }

    // ── Log AA updates ───────────────────────────────────
    console.log(
      "AA column updates:",
      batchData.filter((item) => item.range.includes("!AA"))
    );

    // ── Batch Update ─────────────────────────────────────
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SiteExpeseSheetId,
      resource: {
        valueInputOption: "RAW",
        data: batchData,
      },
    });

    console.log(`✅ Updated ${results.length} records, ${batchData.length} cells`);

    return res.json({
      success: true,
      message: `Payment updated for ${results.length} record(s)`,
      totalRecords: records.length,
      updatedCount: batchData.length,
      tdsValue,
      summary: results,
    });

  } catch (error) {
    console.error("❌ Site paid bulk update error:", error);
    return res.status(500).json({
      success: false,
      message: "Bulk update failed",
      error: error.message,
    });
  }
});



module.exports = router;
