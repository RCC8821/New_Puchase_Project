

// const express = require('express');
// const { sheets, spreadsheetId } = require('../config/googleSheet');
// const router = express.Router();

// // ─── GET /api/account-names ──────────────────────────────

// router.get('/account-names', async (req, res) => {
//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Project_Data!AB:AB',
//     });

//     const rows = response.data.values || [];

//     const accountNames = rows
//       .slice(1)
//       .map(row => (row[0] || "").toString().trim())
//       .filter(name => name !== "");

//     const uniqueAccounts = [...new Set(accountNames)];

//     console.log(`[Account Names] Fetched: ${uniqueAccounts.length}`);

//     res.json({
//       success: true,
//       count: uniqueAccounts.length,
//       data: uniqueAccounts,
//     });

//   } catch (error) {
//     console.error('Error in /account-names:', error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// });



// router.post("/Update-Payment-15", async (req, res) => {
//   try {
//     const paymentDataArray = req.body;

//     if (!Array.isArray(paymentDataArray) || paymentDataArray.length === 0) {
//       return res.status(400).json({ success: false, error: "Empty array." });
//     }

//     const normalize = (str) =>
//       (str || "").toString().trim().toLowerCase().replace(/\s+/g, " ");

//     const findRowRes = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Billing_FMS!A8:DL',
//     });

//     const sheetRows = findRowRes.data.values || [];
//     const rowMap = new Map();
//     const missingBills = [];

//     for (const item of paymentDataArray) {
//       const billNo = (item.billNo || "").toString().trim();
//       const vendorFromFE = normalize(item.vendorFirmName16);

//       if (!billNo || !vendorFromFE) {
//         missingBills.push({ billNo: billNo || "missing", vendor: vendorFromFE || "missing" });
//         continue;
//       }

//       let foundRowNumber = null;

//       for (let i = 0; i < sheetRows.length; i++) {
//         const row = sheetRows[i];
//         const sheetVendorRaw = row[33] ? String(row[33]).trim() : '';
//         const sheetVendor = normalize(sheetVendorRaw);
//         const sheetBillNo = (row[59] || "").toString().trim();

//         if (sheetBillNo === billNo && sheetVendor === vendorFromFE) {
//           foundRowNumber = 8 + i;
//           console.log(`MATCH -> Row ${foundRowNumber} | Bill: ${billNo} | Vendor: ${sheetVendorRaw}`);
//         }
//       }

//       if (foundRowNumber) {
//         rowMap.set(billNo, foundRowNumber);
//       } else {
//         missingBills.push({ billNo, vendor: item.vendorFirmName16, reason: "Not found" });
//       }
//     }

//     console.log(`Matches: ${rowMap.size} / ${paymentDataArray.length}`);

//     const fmsUpdates = [];
//     const newPaymentRows = [];

//     const now = new Date().toLocaleString('en-IN', {
//       timeZone: 'Asia/Kolkata',
//       day: '2-digit', month: '2-digit', year: 'numeric',
//       hour: '2-digit', minute: '2-digit', second: '2-digit',
//       hour12: false,
//     }).replace(',', '');

//     for (const item of paymentDataArray) {
//       const {
//         timestamp = now,
//         planned15 = "",
//         siteName = "",
//         vendorFirmName16 = "",
//         billNo = "",
//         billDate16 = "",
//         netAmount16 = "",
//         currentPaid = "",
//         paidAmount17 = "",
//         balanceAmount17 = "",
//         bankDetails17 = "",
//         paymentMode17 = "",
//         paymentDetails17 = "",
//         paymentDate18 = "",
//         grandTotal = "",
//         advanceAmount = "0",
//         isAdvanceBill = false,
//       } = item;

//       const targetRow = rowMap.get(billNo.trim());

//       if (targetRow) {
//         if (isAdvanceBill) {
//           // ✅ ADVANCE BILL → DG = paidAmount17, DH = 0
//           fmsUpdates.push(
//             { range: `Billing_FMS!DD${targetRow}`, values: [["Done"]] },
//             { range: `Billing_FMS!DG${targetRow}`, values: [[paidAmount17]] },
//             { range: `Billing_FMS!DH${targetRow}`, values: [["0"]] },
//             { range: `Billing_FMS!DI${targetRow}`, values: [[bankDetails17]] },
//             { range: `Billing_FMS!DJ${targetRow}`, values: [[paymentMode17]] },
//             { range: `Billing_FMS!DK${targetRow}`, values: [[paymentDetails17]] },
//             { range: `Billing_FMS!DL${targetRow}`, values: [[paymentDate18]] }
//           );
//         } else {
//           // ✅ NORMAL BILL → Same as before
//           fmsUpdates.push(
//             { range: `Billing_FMS!DD${targetRow}`, values: [["Done"]] },
//             { range: `Billing_FMS!DG${targetRow}`, values: [[paidAmount17]] },
//             { range: `Billing_FMS!DH${targetRow}`, values: [[balanceAmount17]] },
//             { range: `Billing_FMS!DI${targetRow}`, values: [[bankDetails17]] },
//             { range: `Billing_FMS!DJ${targetRow}`, values: [[paymentMode17]] },
//             { range: `Billing_FMS!DK${targetRow}`, values: [[paymentDetails17]] },
//             { range: `Billing_FMS!DL${targetRow}`, values: [[paymentDate18]] }
//           );
//         }
//       }

//       if (isAdvanceBill) {
//         // ✅ ADVANCE BILL → Payment_Sheet
//         // G = netAmount (bill amount)
//         // H = empty (no paid)
//         // I = newBalance (0 for fully paid)
//         newPaymentRows.push([
//           timestamp,          // A
//           planned15,          // B
//           siteName,           // C
//           vendorFirmName16,   // D
//           billNo,             // E
//           billDate16,         // F
//           netAmount16,        // G ✅ Bill ka net amount
//           "",                 // H ✅ Empty (advance se paid hua)
//           balanceAmount17,    // I ✅ New Balance (0)
//           bankDetails17,      // J
//           paymentMode17,      // K
//           paymentDetails17,   // L
//           paymentDate18,      // M
//           grandTotal,         // N
//           advanceAmount       // O (for column P)
//         ]);
//       } else {
//         // ✅ NORMAL BILL → Payment_Sheet (same as before)
//         newPaymentRows.push([
//           timestamp,
//           planned15,
//           siteName,
//           vendorFirmName16,
//           billNo,
//           billDate16,
//           netAmount16,
//           currentPaid,        // H = current paid
//           balanceAmount17,    // I = balance
//           bankDetails17,
//           paymentMode17,
//           paymentDetails17,
//           paymentDate18,
//           grandTotal,
//           advanceAmount       // O (for column P)
//         ]);
//       }
//     }

//     if (fmsUpdates.length > 0) {
//       const batchResult = await sheets.spreadsheets.values.batchUpdate({
//         spreadsheetId,
//         resource: { valueInputOption: 'USER_ENTERED', data: fmsUpdates }
//       });
//       console.log("Billing_FMS updated. Cells:", batchResult.data.totalUpdatedCells || 0);
//     }

//     if (newPaymentRows.length > 0) {
//       const existingRes = await sheets.spreadsheets.values.get({
//         spreadsheetId,
//         range: 'Payment_Sheet!A:A',
//       });

//       const columnA = existingRes.data.values || [];
//       let firstEmptyRow = 2;

//       for (let i = 1; i < columnA.length; i++) {
//         if (!columnA[i] || !columnA[i][0] || String(columnA[i][0]).trim() === "") {
//           firstEmptyRow = i + 1;
//           break;
//         }
//       }

//       if (firstEmptyRow === 2 && columnA.length > 1 && columnA[columnA.length - 1][0]) {
//         firstEmptyRow = columnA.length + 1;
//       }

//       // ✅ A to N = first 14 columns
//       const aNData = newPaymentRows.map(row => row.slice(0, 14));
//       // ✅ P = column 15 (advanceAmount)
//       const pData = newPaymentRows.map(row => [row[14]]);

//       await sheets.spreadsheets.values.batchUpdate({
//         spreadsheetId,
//         resource: {
//           valueInputOption: 'USER_ENTERED',
//           data: [
//             {
//               range: `Payment_Sheet!A${firstEmptyRow}:N${firstEmptyRow + newPaymentRows.length - 1}`,
//               values: aNData
//             },
//             {
//               range: `Payment_Sheet!P${firstEmptyRow}:P${firstEmptyRow + newPaymentRows.length - 1}`,
//               values: pData
//             }
//           ]
//         }
//       });

//       console.log(`Added ${newPaymentRows.length} rows to Payment_Sheet`);
//     }

//     res.json({
//       success: true,
//       updatedInFMS: Math.floor(fmsUpdates.length / 7),
//       addedToPaymentSheet: newPaymentRows.length,
//       missingBills: missingBills.length > 0 ? missingBills : undefined
//     });

//   } catch (error) {
//     console.error('Error in /Update-Payment-15:', error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// });



// router.get('/Payment_15', async (req, res) => {
//   try {
//     const [billingResponse, paymentSheetResponse] = await Promise.all([
//       sheets.spreadsheets.values.get({
//         spreadsheetId,
//         range: 'Billing_FMS!A8:DL',
//       }),
//       sheets.spreadsheets.values.get({
//         spreadsheetId,
//         range: "Payment_Sheet!A:P",
//       })
//     ]);

//     const billingRows = billingResponse.data.values || [];
//     const paymentRows = paymentSheetResponse.data.values || [];

//     // ==========================================
//     // ✅ ADVANCE MAP - Sirf Column O = "Advance"
//     // ==========================================
//     const advanceMap = new Map();

//     for (let i = 1; i < paymentRows.length; i++) {
//       const pRow = paymentRows[i];
//       if (!pRow || pRow.length < 15) continue;

//       const colO = (pRow[14] || "").toString().trim();
//       if (colO !== 'Advance') continue;

//       const aSite = (pRow[2] || "").toString().trim();      // Column C
//       const aVendor = (pRow[3] || "").toString().trim();    // Column D
//       const aAmountH = parseFloat((pRow[7] || "0").toString().replace(/,/g, "").trim()) || 0;
//       const aAmountI = (pRow[8] || "").toString().replace(/,/g, "").trim();

//       let advanceRemaining = 0;
//       if (aAmountI !== "" && !isNaN(parseFloat(aAmountI))) {
//         advanceRemaining = parseFloat(aAmountI);
//       } else {
//         advanceRemaining = aAmountH;
//       }

//       if (!aSite || !aVendor) continue;

//       const key = `${aSite.toLowerCase()}|||${aVendor.toLowerCase()}`;
//       if (advanceRemaining > 0) {
//         advanceMap.set(key, (advanceMap.get(key) || 0) + advanceRemaining);
//       }
//     }

//     console.log(`[Advance Map] Total Entries: ${advanceMap.size}`);

//     const PLANNED_15 = 105;
//     const NET_AMOUNT_15 = 109;
//     const BALANCE_15 = 111;

//     const processedData = billingRows
//       .filter(row => {
//         const planned15 = (row[PLANNED_15] || "").toString().trim();
//         if (!planned15) return false;
//         const netAmount15 = (row[NET_AMOUNT_15] || "").toString().trim();
//         if (!netAmount15 || netAmount15 === '-' || netAmount15 === '') return false;
//         const balanceStr = (row[BALANCE_15] || "").toString().trim();
//         if (balanceStr !== '') {
//           const balanceNum = parseFloat(balanceStr);
//           if (!isNaN(balanceNum) && balanceNum === 0) return false;
//         }
//         return true;
//       })
//       .map(row => {
//         const currentInvoiceNo = (row[59] || "").toString().trim();
//         const currentVendor = row[33] ? String(row[33]).trim() : '';
//         const currentSite = row[3] ? String(row[3]).trim() : '';

//         let latestPaidAmount = "0";
//         let latestBalanceAmount = "0";

//         // ==========================================
//         // ✅ Previous Paid/Balance - SIRF non-Advance rows
//         // ✅ Fix: Column E (index 4) = Bill No, Column D (index 3) = Vendor
//         // ==========================================
//         if (currentInvoiceNo && paymentRows.length > 0) {
//           for (let i = paymentRows.length - 1; i >= 0; i--) {
//             const pRow = paymentRows[i];
//             if (!pRow || pRow.length < 15) continue;

//             // ✅ Skip Advance rows
//             const colO = (pRow[14] || "").toString().trim();
//             if (colO === 'Advance') continue;

//             // ✅ FIXED - Bill No = Column E (index 4), Vendor = Column D (index 3)
//             const pInvoiceNo = (pRow[4] || "").toString().trim();  // Column E
//             const pVendor = (pRow[3] || "").toString().trim();     // Column D ✅ FIXED

//             if (pInvoiceNo === currentInvoiceNo && pVendor === currentVendor) {
//               latestPaidAmount = (pRow[7] || "0").toString().trim();      // Column H
//               latestBalanceAmount = (pRow[8] || "0").toString().trim();   // Column I
//               console.log(`[MATCH] Bill: ${currentInvoiceNo} | Vendor: ${currentVendor} | Paid: ${latestPaidAmount} | Balance: ${latestBalanceAmount}`);
//               break;
//             }
//           }
//         }

//         const advanceKey = `${currentSite.toLowerCase()}|||${currentVendor.toLowerCase()}`;
//         const advanceAmount = advanceMap.get(advanceKey) || 0;

//         return {
//           planned15: row[PLANNED_15] ? String(row[PLANNED_15]).trim() : '',
//           UID: row[1] ? String(row[1]).trim() : '',
//           siteName: currentSite,
//           materialType: row[5] ? String(row[5]).trim() : '',
//           materialName: row[6] ? String(row[6]).trim() : '',
//           materialSize: row[7] ? String(row[7]).trim() : '',
//           specification: row[8] ? String(row[8]).trim() : '',
//           skuCode: row[10] ? String(row[10]).trim() : '',
//           unitName: row[12] ? String(row[12]).trim() : '',
//           finalIndentNo: row[21] ? String(row[21]).trim() : '',
//           finalIndentPDF: row[22] ? String(row[22]).trim() : '',
//           approvalQuotationNo: row[23] ? String(row[23]).trim() : '',
//           approvalQuotationPDF: row[24] ? String(row[24]).trim() : '',
//           poDate: row[25] ? String(row[25]).trim() : '',
//           poNumber: row[26] ? String(row[26]).trim() : '',
//           poPDF: row[27] ? String(row[27]).trim() : '',
//           mrnNo: row[28] ? String(row[28]).trim() : '',
//           mrnPDF: row[29] ? String(row[29]).trim() : '',
//           vendorFirmName: currentVendor,
//           vendorContact: row[34] ? String(row[34]).trim() : '',
//           revisedQuantity: row[35] ? String(row[35]).trim() : '',
//           finalReceivedQuantity: row[36] ? String(row[36]).trim() : '',
//           invoice13: currentInvoiceNo,
//           invoicePhoto: row[60] ? String(row[60]).trim() : '',
//           billDate: row[85] ? String(row[85]).trim() : '',
//           netAmount17: row[NET_AMOUNT_15] ? String(row[NET_AMOUNT_15]).trim() : '0',
//           netAmount16: row[NET_AMOUNT_15] ? String(row[NET_AMOUNT_15]).trim() : '0',
//           latestPaidAmount,
//           latestBalanceAmount,
//           advanceAmount,
//         };
//       });

//     const vendorSeen = new Set();
//     const siteSeen = new Set();
//     const uniqueVendors = [];
//     const uniqueSites = [];

//     processedData.forEach(item => {
//       if (item.vendorFirmName && !vendorSeen.has(item.vendorFirmName)) {
//         vendorSeen.add(item.vendorFirmName);
//         uniqueVendors.push({ vendorFirmName: item.vendorFirmName });
//       }
//       if (item.siteName && !siteSeen.has(item.siteName)) {
//         siteSeen.add(item.siteName);
//         uniqueSites.push({ siteName: item.siteName });
//       }
//     });

//     console.log(`[Payment_15] Records: ${processedData.length}`);

//     res.json({
//       success: true,
//       count: processedData.length,
//       data: processedData,
//       uniqueVendors,
//       uniqueSites
//     });

//   } catch (error) {
//     console.error('Error in /Payment_15:', error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// });





// module.exports = router;





const express = require('express');
const { sheets, spreadsheetId } = require('../config/googleSheet');
const router = express.Router();

// ─── Helpers ─────────────────────────────────────────────
const normalize = (str) =>
  (str || "").toString().trim().toLowerCase().replace(/\s+/g, " ");

const toNum = (v) => {
  const n = parseFloat((v ?? "").toString().replace(/,/g, "").trim());
  return isNaN(n) ? 0 : n;
};

const round2 = (n) => Math.round(n * 100) / 100;

// 0 -> A, 16 -> Q, 26 -> AA
const colLetter = (idx) => {
  let s = "";
  let n = idx + 1;
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
};

// Advance row me adjust columns: Q,R,S = slot 1 | T,U,V = slot 2 | W,X,Y = slot 3 ...
const ADJ_START_COL = 16;   // Q (0-based index)
const ADJ_MAX_SLOTS = 5;    // Q..AE tak (sheet me jitne slots banaye ho utna rakho)

// ─── GET /api/account-names ──────────────────────────────
router.get('/account-names', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Project_Data!AB:AB',
    });

    const rows = response.data.values || [];
    const accountNames = rows
      .slice(1)
      .map(row => (row[0] || "").toString().trim())
      .filter(name => name !== "");

    const uniqueAccounts = [...new Set(accountNames)];
    console.log(`[Account Names] Fetched: ${uniqueAccounts.length}`);

    res.json({ success: true, count: uniqueAccounts.length, data: uniqueAccounts });
  } catch (error) {
    console.error('Error in /account-names:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── POST /api/Update-Payment-15 ─────────────────────────
router.post("/Update-Payment-15", async (req, res) => {
  try {
    const paymentDataArray = req.body;

    if (!Array.isArray(paymentDataArray) || paymentDataArray.length === 0) {
      return res.status(400).json({ success: false, error: "Empty array." });
    }

    const findRowRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Billing_FMS!A8:DL',
    });

    const sheetRows = findRowRes.data.values || [];
    const rowMap = new Map();
    const missingBills = [];

    for (const item of paymentDataArray) {
      const billNo = (item.billNo || "").toString().trim();
      const vendorFromFE = normalize(item.vendorFirmName16);

      if (!billNo || !vendorFromFE) {
        missingBills.push({ billNo: billNo || "missing", vendor: vendorFromFE || "missing" });
        continue;
      }

      let foundRowNumber = null;

      for (let i = 0; i < sheetRows.length; i++) {
        const row = sheetRows[i];
        const sheetVendorRaw = row[33] ? String(row[33]).trim() : '';
        const sheetVendor = normalize(sheetVendorRaw);
        const sheetBillNo = (row[59] || "").toString().trim();

        if (sheetBillNo === billNo && sheetVendor === vendorFromFE) {
          foundRowNumber = 8 + i;
          console.log(`MATCH -> Row ${foundRowNumber} | Bill: ${billNo} | Vendor: ${sheetVendorRaw}`);
        }
      }

      if (foundRowNumber) {
        rowMap.set(billNo, foundRowNumber);
      } else {
        missingBills.push({ billNo, vendor: item.vendorFirmName16, reason: "Not found" });
      }
    }

    console.log(`Matches: ${rowMap.size} / ${paymentDataArray.length}`);

    const fmsUpdates = [];
    const newPaymentRows = [];

    const now = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
    }).replace(',', '');

    for (const item of paymentDataArray) {
      const {
        timestamp = now,
        planned15 = "",
        siteName = "",
        vendorFirmName16 = "",
        billNo = "",
        billDate16 = "",
        netAmount16 = "",
        currentPaid = "",
        paidAmount17 = "",
        balanceAmount17 = "",
        bankDetails17 = "",
        paymentMode17 = "",
        paymentDetails17 = "",
        paymentDate18 = "",
        grandTotal = "",
        advanceAmount = "0",
        isAdvanceBill = false,
      } = item;

      const targetRow = rowMap.get(billNo.trim());

      if (targetRow) {
        if (isAdvanceBill) {
          fmsUpdates.push(
            { range: `Billing_FMS!DD${targetRow}`, values: [["Done"]] },
            { range: `Billing_FMS!DG${targetRow}`, values: [[paidAmount17]] },
            { range: `Billing_FMS!DH${targetRow}`, values: [["0"]] },
            { range: `Billing_FMS!DI${targetRow}`, values: [[bankDetails17]] },
            { range: `Billing_FMS!DJ${targetRow}`, values: [[paymentMode17]] },
            { range: `Billing_FMS!DK${targetRow}`, values: [[paymentDetails17]] },
            { range: `Billing_FMS!DL${targetRow}`, values: [[paymentDate18]] }
          );
        } else {
          fmsUpdates.push(
            { range: `Billing_FMS!DD${targetRow}`, values: [["Done"]] },
            { range: `Billing_FMS!DG${targetRow}`, values: [[paidAmount17]] },
            { range: `Billing_FMS!DH${targetRow}`, values: [[balanceAmount17]] },
            { range: `Billing_FMS!DI${targetRow}`, values: [[bankDetails17]] },
            { range: `Billing_FMS!DJ${targetRow}`, values: [[paymentMode17]] },
            { range: `Billing_FMS!DK${targetRow}`, values: [[paymentDetails17]] },
            { range: `Billing_FMS!DL${targetRow}`, values: [[paymentDate18]] }
          );
        }
      }

      if (isAdvanceBill) {
        newPaymentRows.push([
          timestamp, planned15, siteName, vendorFirmName16, billNo, billDate16,
          netAmount16,        // G
          "",                 // H (advance se paid hua)
          balanceAmount17,    // I (0)
          bankDetails17, paymentMode17, paymentDetails17, paymentDate18,
          grandTotal,
          advanceAmount       // -> column P
        ]);
      } else {
        newPaymentRows.push([
          timestamp, planned15, siteName, vendorFirmName16, billNo, billDate16,
          netAmount16,
          currentPaid,        // H
          balanceAmount17,    // I
          bankDetails17, paymentMode17, paymentDetails17, paymentDate18,
          grandTotal,
          advanceAmount       // -> column P
        ]);
      }
    }

    if (fmsUpdates.length > 0) {
      const batchResult = await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        resource: { valueInputOption: 'USER_ENTERED', data: fmsUpdates }
      });
      console.log("Billing_FMS updated. Cells:", batchResult.data.totalUpdatedCells || 0);
    }

    if (newPaymentRows.length > 0) {
      const existingRes = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Payment_Sheet!A:A',
      });

      const columnA = existingRes.data.values || [];
      let firstEmptyRow = 2;

      for (let i = 1; i < columnA.length; i++) {
        if (!columnA[i] || !columnA[i][0] || String(columnA[i][0]).trim() === "") {
          firstEmptyRow = i + 1;
          break;
        }
      }

      if (firstEmptyRow === 2 && columnA.length > 1 && columnA[columnA.length - 1][0]) {
        firstEmptyRow = columnA.length + 1;
      }

      const aNData = newPaymentRows.map(row => row.slice(0, 14));
      const pData = newPaymentRows.map(row => [row[14]]);

      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        resource: {
          valueInputOption: 'USER_ENTERED',
          data: [
            {
              range: `Payment_Sheet!A${firstEmptyRow}:N${firstEmptyRow + newPaymentRows.length - 1}`,
              values: aNData
            },
            {
              range: `Payment_Sheet!P${firstEmptyRow}:P${firstEmptyRow + newPaymentRows.length - 1}`,
              values: pData
            }
          ]
        }
      });

      console.log(`Added ${newPaymentRows.length} rows to Payment_Sheet`);
    }

    // ============================================================
    // ✅ ADVANCE ADJUSTMENT
    // Advance row (O = "Advance", same Site + Vendor) me:
    //   Q,R,S = Adjust Bill No / Date / Amount (agle slot me T,U,V ...)
    //   I     = remaining advance (pura use ho gaya to 0)
    // ============================================================
    const adjustWarnings = [];
    let advanceAdjustedCount = 0;

    const itemsUsingAdvance = paymentDataArray.filter(
      (it) => toNum(it.advanceUsedForThisBill) > 0.005
    );

    if (itemsUsingAdvance.length > 0) {
      const lastCol = colLetter(ADJ_START_COL + ADJ_MAX_SLOTS * 3 - 1);
      const psRes = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `Payment_Sheet!A:${lastCol}`,
      });
      const psRows = psRes.data.values || [];

      // Advance rows ki list (upar se neeche = purani advance pehle use hogi)
      const advRows = [];
      for (let i = 1; i < psRows.length; i++) {
        const r = psRows[i] || [];
        if ((r[14] || "").toString().trim() !== "Advance") continue;

        const iRaw = (r[8] ?? "").toString().replace(/,/g, "").trim();
        const remaining = (iRaw !== "" && !isNaN(parseFloat(iRaw)))
          ? parseFloat(iRaw)
          : toNum(r[7]);
        if (remaining <= 0.005) continue;

        // pehla khali slot dhundo
        let slot = 0;
        while (slot < ADJ_MAX_SLOTS) {
          const c = ADJ_START_COL + slot * 3;
          const used = [r[c], r[c + 1], r[c + 2]].some(
            (v) => (v ?? "").toString().trim() !== ""
          );
          if (!used) break;
          slot++;
        }

        advRows.push({
          rowNum: i + 1,
          site: normalize(r[2]),
          vendor: normalize(r[3]),
          remaining,
          slot,
          touched: false,
        });
      }

      const advUpdates = [];

      for (const item of itemsUsingAdvance) {
        const site = normalize(item.siteName);
        const vendor = normalize(item.vendorFirmName16);
        const billNo = (item.billNo || "").toString().trim();
        const billDate = item.billDate16 || "";
        let needed = round2(toNum(item.advanceUsedForThisBill));

        for (const adv of advRows) {
          if (needed <= 0.005) break;
          if (adv.site !== site || adv.vendor !== vendor) continue;
          if (adv.remaining <= 0.005) continue;

          if (adv.slot >= ADJ_MAX_SLOTS) {
            adjustWarnings.push({
              billNo,
              reason: `Advance row ${adv.rowNum} ke saare adjust slots bhar chuke hain`,
            });
            continue;
          }

          const take = round2(Math.min(adv.remaining, needed));
          const c = ADJ_START_COL + adv.slot * 3;

          advUpdates.push({
            range: `Payment_Sheet!${colLetter(c)}${adv.rowNum}:${colLetter(c + 2)}${adv.rowNum}`,
            values: [[billNo, billDate, take]],
          });

          adv.remaining = round2(adv.remaining - take);
          if (adv.remaining < 0.005) adv.remaining = 0;
          adv.slot++;
          adv.touched = true;
          needed = round2(needed - take);
          advanceAdjustedCount++;
        }

        if (needed > 0.005) {
          adjustWarnings.push({
            billNo,
            reason: `Advance rows me Rs.${needed} ka advance nahi mila (site/vendor match nahi hua ya advance kam hai)`,
          });
        }
      }

      // Har touched advance row ka final balance (I) ek hi baar likho
      for (const adv of advRows) {
        if (adv.touched) {
          advUpdates.push({
            range: `Payment_Sheet!I${adv.rowNum}`,
            values: [[adv.remaining]],
          });
        }
      }

      if (advUpdates.length > 0) {
        await sheets.spreadsheets.values.batchUpdate({
          spreadsheetId,
          resource: { valueInputOption: 'USER_ENTERED', data: advUpdates },
        });
        console.log(`Advance adjusted: ${advanceAdjustedCount} entries`);
      }
    }

    res.json({
      success: true,
      updatedInFMS: Math.floor(fmsUpdates.length / 7),
      addedToPaymentSheet: newPaymentRows.length,
      advanceAdjusted: advanceAdjustedCount,
      adjustWarnings: adjustWarnings.length > 0 ? adjustWarnings : undefined,
      missingBills: missingBills.length > 0 ? missingBills : undefined
    });

  } catch (error) {
    console.error('Error in /Update-Payment-15:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── GET /api/Payment_15 ─────────────────────────────────
router.get('/Payment_15', async (req, res) => {
  try {
    const [billingResponse, paymentSheetResponse] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'Billing_FMS!A8:DL' }),
      sheets.spreadsheets.values.get({ spreadsheetId, range: `Payment_Sheet!A:${colLetter(ADJ_START_COL + ADJ_MAX_SLOTS * 3 - 1)}` })
    ]);

    const billingRows = billingResponse.data.values || [];
    const paymentRows = paymentSheetResponse.data.values || [];

    // Advance map - sirf Column O = "Advance", remaining = I (khali ho to H)
    const advanceMap = new Map();

    for (let i = 1; i < paymentRows.length; i++) {
      const pRow = paymentRows[i];
      if (!pRow || pRow.length < 15) continue;

      const colO = (pRow[14] || "").toString().trim();
      if (colO !== 'Advance') continue;

      const aSite = (pRow[2] || "").toString().trim();
      const aVendor = (pRow[3] || "").toString().trim();
      const aAmountH = parseFloat((pRow[7] || "0").toString().replace(/,/g, "").trim()) || 0;
      const aAmountI = (pRow[8] || "").toString().replace(/,/g, "").trim();

      let advanceRemaining = 0;
      if (aAmountI !== "" && !isNaN(parseFloat(aAmountI))) {
        advanceRemaining = parseFloat(aAmountI);
      } else {
        advanceRemaining = aAmountH;
      }

      if (!aSite || !aVendor) continue;

      const key = `${aSite.toLowerCase()}|||${aVendor.toLowerCase()}`;
      if (advanceRemaining > 0) {
        advanceMap.set(key, (advanceMap.get(key) || 0) + advanceRemaining);
      }
    }

    console.log(`[Advance Map] Total Entries: ${advanceMap.size}`);

    // ✅ Adjust map: advance rows ke Q/R/S, T/U/V ... se
    // key = site|||vendor|||billNo  ->  [{ amount, date, advanceRow }]
    const adjustMap = new Map();
    for (let i = 1; i < paymentRows.length; i++) {
      const pRow = paymentRows[i];
      if (!pRow) continue;
      if ((pRow[14] || "").toString().trim() !== 'Advance') continue;

      const aSite = normalize(pRow[2]);
      const aVendor = normalize(pRow[3]);
      if (!aSite || !aVendor) continue;

      for (let slot = 0; slot < ADJ_MAX_SLOTS; slot++) {
        const c = ADJ_START_COL + slot * 3;
        const adjBillNo = normalize(pRow[c]);
        if (!adjBillNo) continue;
        const adjKey = `${aSite}|||${aVendor}|||${adjBillNo}`;
        if (!adjustMap.has(adjKey)) adjustMap.set(adjKey, []);
        adjustMap.get(adjKey).push({
          amount: toNum(pRow[c + 2]),
          date: (pRow[c + 1] || "").toString().trim(),
          advanceRow: i + 1,
        });
      }
    }

    const PLANNED_15 = 105;
    const NET_AMOUNT_15 = 109;
    const BALANCE_15 = 111;

    const processedData = billingRows
      .filter(row => {
        const planned15 = (row[PLANNED_15] || "").toString().trim();
        if (!planned15) return false;
        const netAmount15 = (row[NET_AMOUNT_15] || "").toString().trim();
        if (!netAmount15 || netAmount15 === '-' || netAmount15 === '') return false;
        const balanceStr = (row[BALANCE_15] || "").toString().trim();
        if (balanceStr !== '') {
          const balanceNum = parseFloat(balanceStr);
          if (!isNaN(balanceNum) && balanceNum === 0) return false;
        }
        return true;
      })
      .map(row => {
        const currentInvoiceNo = (row[59] || "").toString().trim();
        const currentVendor = row[33] ? String(row[33]).trim() : '';
        const currentSite = row[3] ? String(row[3]).trim() : '';

        let latestPaidAmount = "0";
        let latestBalanceAmount = "0";
        let hasPaymentBalance = false;

        if (currentInvoiceNo && paymentRows.length > 0) {
          for (let i = paymentRows.length - 1; i >= 0; i--) {
            const pRow = paymentRows[i];
            if (!pRow || pRow.length < 15) continue;

            const colO = (pRow[14] || "").toString().trim();
            if (colO === 'Advance') continue;

            const pInvoiceNo = (pRow[4] || "").toString().trim();  // E
            const pVendor = (pRow[3] || "").toString().trim();     // D

            if (pInvoiceNo === currentInvoiceNo && pVendor === currentVendor) {
              latestPaidAmount = (pRow[7] || "0").toString().trim();      // H
              const rawI = (pRow[8] ?? "").toString().trim();             // I (balance)
              if (rawI !== "") {
                latestBalanceAmount = rawI;
                hasPaymentBalance = true;
              }
              console.log(`[MATCH] Bill: ${currentInvoiceNo} | Vendor: ${currentVendor} | Paid: ${latestPaidAmount} | Balance: ${latestBalanceAmount}`);
              break;
            }
          }
        }

        const advanceKey = `${currentSite.toLowerCase()}|||${currentVendor.toLowerCase()}`;
        const advanceAmount = advanceMap.get(advanceKey) || 0;

        const adjList = adjustMap.get(
          `${normalize(currentSite)}|||${normalize(currentVendor)}|||${normalize(currentInvoiceNo)}`
        ) || [];
        const advanceAdjustedAmount = round2(adjList.reduce((sum, a) => sum + a.amount, 0));

        return {
          planned15: row[PLANNED_15] ? String(row[PLANNED_15]).trim() : '',
          UID: row[1] ? String(row[1]).trim() : '',
          siteName: currentSite,
          materialType: row[5] ? String(row[5]).trim() : '',
          materialName: row[6] ? String(row[6]).trim() : '',
          materialSize: row[7] ? String(row[7]).trim() : '',
          specification: row[8] ? String(row[8]).trim() : '',
          skuCode: row[10] ? String(row[10]).trim() : '',
          unitName: row[12] ? String(row[12]).trim() : '',
          finalIndentNo: row[21] ? String(row[21]).trim() : '',
          finalIndentPDF: row[22] ? String(row[22]).trim() : '',
          approvalQuotationNo: row[23] ? String(row[23]).trim() : '',
          approvalQuotationPDF: row[24] ? String(row[24]).trim() : '',
          poDate: row[25] ? String(row[25]).trim() : '',
          poNumber: row[26] ? String(row[26]).trim() : '',
          poPDF: row[27] ? String(row[27]).trim() : '',
          mrnNo: row[28] ? String(row[28]).trim() : '',
          mrnPDF: row[29] ? String(row[29]).trim() : '',
          vendorFirmName: currentVendor,
          vendorContact: row[34] ? String(row[34]).trim() : '',
          revisedQuantity: row[35] ? String(row[35]).trim() : '',
          finalReceivedQuantity: row[36] ? String(row[36]).trim() : '',
          invoice13: currentInvoiceNo,
          invoicePhoto: row[60] ? String(row[60]).trim() : '',
          billDate: row[85] ? String(row[85]).trim() : '',
          netAmount17: row[NET_AMOUNT_15] ? String(row[NET_AMOUNT_15]).trim() : '0',
          netAmount16: row[NET_AMOUNT_15] ? String(row[NET_AMOUNT_15]).trim() : '0',
          latestPaidAmount,
          latestBalanceAmount,
          hasPaymentBalance,
          advanceAmount,
          advanceAdjustedAmount,
          advanceAdjustments: adjList,
        };
      });

    const vendorSeen = new Set();
    const siteSeen = new Set();
    const uniqueVendors = [];
    const uniqueSites = [];

    processedData.forEach(item => {
      if (item.vendorFirmName && !vendorSeen.has(item.vendorFirmName)) {
        vendorSeen.add(item.vendorFirmName);
        uniqueVendors.push({ vendorFirmName: item.vendorFirmName });
      }
      if (item.siteName && !siteSeen.has(item.siteName)) {
        siteSeen.add(item.siteName);
        uniqueSites.push({ siteName: item.siteName });
      }
    });

    console.log(`[Payment_15] Records: ${processedData.length}`);

    res.json({
      success: true,
      count: processedData.length,
      data: processedData,
      uniqueVendors,
      uniqueSites
    });

  } catch (error) {
    console.error('Error in /Payment_15:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;