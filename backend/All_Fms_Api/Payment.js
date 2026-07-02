const express = require('express');
const { sheets, spreadsheetId } = require('../config/googleSheet');
const router = express.Router();

// ─── GET /api/Payment_15 ──────────────────────────────────
router.get('/Payment_15', async (req, res) => {
  try {
    const [billingResponse, paymentSheetResponse] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Billing_FMS!A8:DP',
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "Payment_Sheet!A:P",
      })
    ]);

    let advanceRows = [];
    try {
      const advancePaymentResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "Advance_Payment_Sheet!A:I",
      });
      advanceRows = advancePaymentResponse.data.values || [];
    } catch (advErr) {
      console.warn("Advance_Payment_Sheet fetch failed:", advErr.message);
    }

    const billingRows = billingResponse.data.values || [];
    const paymentRows = paymentSheetResponse.data.values || [];

    // Advance Map
    const advanceMap = new Map();
    for (let i = 1; i < advanceRows.length; i++) {
      const aRow = advanceRows[i];
      if (!aRow || aRow.length < 4) continue;
      const aSite   = (aRow[1] || "").toString().trim();
      const aVendor = (aRow[2] || "").toString().trim();
      const aAmount = parseFloat((aRow[3] || "0").toString().replace(/,/g, "").trim()) || 0;
      if (!aSite || !aVendor || !aAmount) continue;
      const key = `${aSite.toLowerCase()}|||${aVendor.toLowerCase()}`;
      advanceMap.set(key, (advanceMap.get(key) || 0) + aAmount);
    }

    // Step 15 columns:
    // DF(109)=PLANNED_15, DJ(113)=NET_Amount_15, DL(115)=BALANCE_15

    const processedData = billingRows
      .filter(row => {
        // ✅ PLANNED_15 must exist
        const planned15 = (row[109] || "").toString().trim();
        if (!planned15) return false;

        // ✅ NET_Amount_15 must have value
        const netAmount15 = (row[113] || "").toString().trim();
        if (!netAmount15 || netAmount15 === '-' || netAmount15 === '') return false;

        // ✅ If balance is 0, skip
        const balanceStr = (row[115] || "").toString().trim();
        if (balanceStr !== '') {
          const balanceNum = parseFloat(balanceStr);
          if (!isNaN(balanceNum) && balanceNum === 0) return false;
        }

        return true;
      })
      .map(row => {
        // ✅ Invoice & Vendor - SAME as original Payment
        const currentInvoiceNo = (row[36] || "").toString().trim();
        const currentVendor    = row[33] ? String(row[33]).trim() : '';
        const currentSite      = row[3]  ? String(row[3]).trim()  : '';

        let latestPaidAmount    = "0";
        let latestBalanceAmount = "0";

        // Check Payment_Sheet for latest paid
        if (currentInvoiceNo && paymentRows.length > 0) {
          for (let i = paymentRows.length - 1; i >= 0; i--) {
            const pRow     = paymentRows[i];
            const pInvoice = (pRow[4] || "").toString().trim();
            const pVendor  = (pRow[3] || "").toString().trim();
            if (pInvoice === currentInvoiceNo && pVendor === currentVendor) {
              latestPaidAmount    = (pRow[7] || "0").toString().trim();
              latestBalanceAmount = (pRow[8] || "0").toString().trim();
              break;
            }
          }
        }

        const advanceKey    = `${currentSite.toLowerCase()}|||${currentVendor.toLowerCase()}`;
        const advanceAmount = advanceMap.get(advanceKey) || 0;

        return {
          // ✅ Step 15 specific
          planned15:              row[109] ? String(row[109]).trim() : '',
          netAmount15:            row[113] ? String(row[113]).trim() : '0',

          // ✅ Common fields - SAME as original Payment
          UID:                    row[1]   ? String(row[1]).trim()   : '',
          siteName:               currentSite,
          engineerName:           row[4]   ? String(row[4]).trim()   : '',
          materialType:           row[5]   ? String(row[5]).trim()   : '',
          materialName:           row[6]   ? String(row[6]).trim()   : '',
          materialSize:           row[7]   ? String(row[7]).trim()   : '',
          specification:          row[8]   ? String(row[8]).trim()   : '',
          brandName:              row[9]   ? String(row[9]).trim()   : '',
          skuCode:                row[10]  ? String(row[10]).trim()  : '',
          unitName:               row[12]  ? String(row[12]).trim()  : '',
          revisedQuantity:        row[35]  ? String(row[35]).trim()  : '',
          finalReceivedQuantity:  row[36]  ? String(row[36]).trim()  : '',
          finalIndentNo:          row[21]  ? String(row[21]).trim()  : '',
          finalIndentPDF:         row[22]  ? String(row[22]).trim()  : '',
          approvalQuotationNo:    row[23]  ? String(row[23]).trim()  : '',
          approvalQuotationPDF:   row[24]  ? String(row[24]).trim()  : '',
          poDate:                 row[25]  ? String(row[25]).trim()  : '',
          poNumber:               row[26]  ? String(row[26]).trim()  : '',
          poPDF:                  row[27]  ? String(row[27]).trim()  : '',
          mrnNo:                  row[28]  ? String(row[28]).trim()  : '',
          mrnPDF:                 row[29]  ? String(row[29]).trim()  : '',
          vendorFirmName:         currentVendor,
          vendorContact:          row[34]  ? String(row[34]).trim()  : '',

          // ✅ Invoice from AK(36)
          invoice13:               row[59] ? String(row[59]).trim() : '',
          invoicePhoto:           row[60]  ? String(row[60]).trim()  : '',
       

          // ✅ Bill date from PO Date
          billDate:               row[89]  ? String(row[89]).trim()  : '',

          // ✅ Net amount for display (use step 15 net amount)
          netAmount16:            row[113] ? String(row[113]).trim() : '0',

          // Payment tracking
          latestPaidAmount,
          latestBalanceAmount,
          advanceAmount,
        };
      });

    // Unique vendors & sites
    const vendorSeen = new Set();
    const siteSeen   = new Set();
    const uniqueVendors = [];
    const uniqueSites   = [];

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

    console.log(`[Payment_15] Total records: ${processedData.length}`);

    res.json({
      success: true,
      count: processedData.length,
      data: processedData,
      uniqueVendors,
      uniqueSites
    });

  } catch (error) {
    console.error('Error in /Payment_15 API:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── POST /api/Update-Payment-15 ──────────────────────────
router.post("/Update-Payment-15", async (req, res) => {
  try {
    const paymentDataArray = req.body;

    if (!Array.isArray(paymentDataArray) || paymentDataArray.length === 0) {
      return res.status(400).json({ success: false, error: "Empty array." });
    }

    const normalize = (str) =>
      (str || "").toString().trim().toLowerCase().replace(/\s+/g, " ");

    const findRowRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Billing_FMS!A8:DP',
    });

    const sheetRows    = findRowRes.data.values || [];
    const rowMap       = new Map();
    const missingBills = [];

    for (const item of paymentDataArray) {
      const billNo       = (item.billNo || "").toString().trim();
      const vendorFromFE = normalize(item.vendorFirmName16);

      if (!billNo || !vendorFromFE) {
        missingBills.push({ billNo: billNo || "missing", vendor: vendorFromFE || "missing" });
        continue;
      }

      let foundRowNumber = null;

      for (let i = 0; i < sheetRows.length; i++) {
        const row = sheetRows[i];

        // ✅ SAME as original Payment - row[51] first, fallback row[23]
        const sheetVendorRaw = row[51]
          ? String(row[51]).trim()
          : (row[23] ? String(row[23]).trim() : '');
        const sheetVendor = normalize(sheetVendorRaw);

        // ✅ SAME as original Payment - row[52] = invoice/bill no
        const sheetBillNo = (row[52] || "").toString().trim();

        if (sheetBillNo === billNo && sheetVendor === vendorFromFE) {
          foundRowNumber = 8 + i;
          console.log(`MATCH -> Row ${foundRowNumber} | Bill: ${billNo} | Vendor: ${sheetVendorRaw}`);
        }
      }

      if (foundRowNumber) {
        rowMap.set(billNo, foundRowNumber);
      } else {
        const billExists = sheetRows.find(r => (r[52] || "").toString().trim() === billNo);
        if (billExists) {
          const sv = billExists[51] ? String(billExists[51]).trim() : (billExists[23] ? String(billExists[23]).trim() : '');
          console.log(`NO MATCH - Bill found but vendor mismatch! Sheet: "${normalize(sv)}" vs Sent: "${vendorFromFE}"`);
        } else {
          console.log(`NO MATCH - Bill NOT found in sheet: ${billNo}`);
        }
        missingBills.push({ billNo, vendor: item.vendorFirmName16, reason: "Not found in Billing_FMS" });
      }
    }

    console.log(`Total matches: ${rowMap.size} / ${paymentDataArray.length}`);

    const fmsUpdates     = [];
    const newPaymentRows = [];

    const now = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
    }).replace(',', '');

    for (const item of paymentDataArray) {
      const {
        timestamp        = now,
        planned15        = "",
        siteName         = "",
        vendorFirmName16 = "",
        billNo           = "",
        billDate16       = "",
        netAmount16      = "",
        currentPaid      = "",
        paidAmount17     = "",
        balanceAmount17  = "",
        bankDetails17    = "",
        paymentMode17    = "",
        paymentDetails17 = "",
        paymentDate18    = "",
        grandTotal       = "",
        advanceAmount    = "0"
      } = item;

      const targetRow = rowMap.get(billNo.trim());

      if (targetRow) {
        // ✅ Step 15: DH-DP columns
        fmsUpdates.push(
          { range: `Billing_FMS!DH${targetRow}`, values: [["Done"]] },
          { range: `Billing_FMS!DK${targetRow}`, values: [[paidAmount17]] },
          { range: `Billing_FMS!DL${targetRow}`, values: [[balanceAmount17]] },
          { range: `Billing_FMS!DM${targetRow}`, values: [[bankDetails17]] },
          { range: `Billing_FMS!DN${targetRow}`, values: [[paymentMode17]] },
          { range: `Billing_FMS!DO${targetRow}`, values: [[paymentDetails17]] },
          { range: `Billing_FMS!DP${targetRow}`, values: [[paymentDate18]] }
        );
      }

      newPaymentRows.push([
        timestamp,
        planned15,
        siteName,
        vendorFirmName16,
        billNo,
        billDate16,
        netAmount16,
        currentPaid,
        balanceAmount17,
        bankDetails17,
        paymentMode17,
        paymentDetails17,
        paymentDate18,
        grandTotal,
        advanceAmount
      ]);
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
      const pData  = newPaymentRows.map(row => [row[14]]);

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

      console.log(`Added ${newPaymentRows.length} rows to Payment_Sheet at row ${firstEmptyRow}`);
    }

    res.json({
      success: true,
      updatedInFMS: Math.floor(fmsUpdates.length / 7),
      addedToPaymentSheet: newPaymentRows.length,
      missingBills: missingBills.length > 0 ? missingBills : undefined
    });

  } catch (error) {
    console.error('Error in /Update-Payment-15:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;