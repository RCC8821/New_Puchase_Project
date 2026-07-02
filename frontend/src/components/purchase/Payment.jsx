import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  FaSearch, FaFilePdf, FaTimes, FaChevronDown, FaArrowDown,
} from "react-icons/fa";

const Payment15 = () => {
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showData, setShowData] = useState(false);
  const [vendorSearch, setVendorSearch] = useState("");
  const [siteSearch, setSiteSearch] = useState("");
  const [showVendorList, setShowVendorList] = useState(false);
  const [showSiteList, setShowSiteList] = useState(false);
  const [selectedBills, setSelectedBills] = useState([]);
  const [paidAmounts, setPaidAmounts] = useState({});
  const [roundups, setRoundups] = useState({});

  const [bankDetails, setBankDetails] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [paymentDetails, setPaymentDetails] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const vendorRef = useRef(null);
  const siteRef = useRef(null);
  const paymentSectionRef = useRef(null);
  const vendorSearchRef = useRef(vendorSearch);
  const siteSearchRef = useRef(siteSearch);

  useEffect(() => { vendorSearchRef.current = vendorSearch; }, [vendorSearch]);
  useEffect(() => { siteSearchRef.current = siteSearch; }, [siteSearch]);

  useEffect(() => {
    fetchInitialData();
    const handleClickOutside = (event) => {
      if (vendorRef.current && !vendorRef.current.contains(event.target)) setShowVendorList(false);
      if (siteRef.current && !siteRef.current.contains(event.target)) setShowSiteList(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchInitialData = async () => {
    try {
      // ✅ CHANGE: API URL
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/Payment_15`);
      if (response.data.success) {
        const processedData = response.data.data.map((item) => {
          const parseAmount = (value) => {
            if (!value) return 0;
            const cleaned = value.toString().replace(/,/g, "").trim();
            return cleaned === "" ? 0 : Number(cleaned);
          };
          // ✅ CHANGE: netAmount15
          const netAmount     = parseAmount(item.netAmount14 || item.netAmount15 || 0);
          const latestPaid    = parseAmount(item.latestPaidAmount || 0);
          const advanceAmount = parseAmount(item.advanceAmount || 0);
          return {
            ...item,
            netAmount16: netAmount,
            latestPaidAmount: latestPaid,
            advanceAmount: advanceAmount,
            latestBalanceAmount: netAmount - latestPaid - advanceAmount,
          };
        });
        setAllData(processedData);
        setVendors(response.data.uniqueVendors);
        setSites(response.data.uniqueSites);
        return processedData;
      }
      return null;
    } catch (error) {
      console.error(error);
      alert("Error loading data");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (freshData = null) => {
    const currentVendor = vendorSearchRef.current;
    const currentSite = siteSearchRef.current;
    if (!currentVendor) return alert("Please select a vendor");
    const sourceData = freshData || allData;
    const results = sourceData.filter(
      (item) =>
        item.vendorFirmName.toLowerCase() === currentVendor.toLowerCase() &&
        (currentSite ? item.siteName.toLowerCase() === currentSite.toLowerCase() : true)
    );
    setFilteredData(results);
    setShowData(true);
    setSelectedBills([]);
    setPaidAmounts({});
    setRoundups({});
  };

  const toggleBillSelection = (uid) => {
    setSelectedBills((prev) => {
      if (prev.includes(uid)) {
        setPaidAmounts((c) => { const n = { ...c }; delete n[uid]; return n; });
        setRoundups((c) => { const n = { ...c }; delete n[uid]; return n; });
        return prev.filter((id) => id !== uid);
      } else {
        setPaidAmounts((c) => ({ ...c, [uid]: 0 }));
        setRoundups((c) => ({ ...c, [uid]: 0 }));
        return [...prev, uid];
      }
    });
  };

  const handlePaidAmountChange = (uid, value) => {
    let numValue = value === "" ? 0 : Number(value);
    if (numValue < 0) numValue = 0;
    const bill = filteredData.find((b) => b.UID === uid);
    if (!bill) return;
    const currentBalance = calculateCurrentBalance(bill);
    if (numValue > currentBalance) {
      alert(`Cannot pay more than current balance (Rs.${currentBalance.toLocaleString("en-IN")})`);
      numValue = currentBalance;
    }
    setPaidAmounts((prev) => ({ ...prev, [uid]: numValue }));
  };

  const handleRoundupChange = (uid, value) => {
    let numValue = value === "" ? 0 : parseFloat(value);
    if (isNaN(numValue)) numValue = 0;
    if (numValue > 9) numValue = 9;
    if (numValue < -9) numValue = -9;
    setRoundups((prev) => ({ ...prev, [uid]: numValue }));
  };

  const calculateCurrentBalance = (bill) => {
    const netAmount = Number(bill.netAmount16 || 0);
    const previousPaid = Number(bill.latestPaidAmount || 0);
    const advanceAmount = Number(bill.advanceAmount || 0);
    return netAmount - previousPaid - advanceAmount;
  };

  const getPaymentSummary = (bill) => {
    const netAmount = Number(bill.netAmount16 || 0);
    const previousPaid = Number(bill.latestPaidAmount || 0);
    const advanceAmount = Number(bill.advanceAmount || 0);
    const currentBalance = calculateCurrentBalance(bill);
    const currentPaid = paidAmounts[bill.UID] || 0;
    const roundup = roundups[bill.UID] || 0;
    const effectivePaid = currentPaid + roundup;
    const totalDeducted = previousPaid + advanceAmount + effectivePaid;
    const newBalance = totalDeducted >= netAmount ? 0 : netAmount - totalDeducted;
    return { netAmount, previousPaid, advanceAmount, currentBalance, currentPaid, effectivePaid, newBalance, totalPaidAfter: totalDeducted };
  };

  const grandTotal = selectedBills.reduce((sum, uid) => sum + (paidAmounts[uid] || 0) + (roundups[uid] || 0), 0);
  const paymentDetailsLabel = paymentMode === "Cheque" ? "CHEQUE NUMBER" : "PAYMENT DETAILS";

  const handleSubmit = async () => {
    if (selectedBills.length === 0) { alert("Please select at least one bill"); return; }
    if (!bankDetails || !paymentMode || !paymentDetails.trim() || !paymentDate) {
      alert("Please fill all payment details"); return;
    }

    const emptyPaidBills = selectedBills.filter((uid) => {
      const paid = paidAmounts[uid]; const round = roundups[uid];
      return paid === undefined || paid === null || paid === "" || isNaN(paid) ||
        round === undefined || round === null || round === "" || isNaN(round);
    });
    if (emptyPaidBills.length > 0) { alert(`${emptyPaidBills.length} bill(s) mein Paid Amount ya Round Off khali hai.`); return; }

    const zeroPaidBills = selectedBills.filter((uid) => Number(paidAmounts[uid] || 0) + Number(roundups[uid] || 0) === 0);
    if (zeroPaidBills.length > 0) {
      if (!window.confirm(`${zeroPaidBills.length} bill(s) mein effective paid 0 hai. Submit?`)) return;
    }

    setSubmitting(true);
    try {
      const payload = selectedBills.map((uid) => {
        const bill = filteredData.find((item) => item.UID === uid);
        const summary = getPaymentSummary(bill);
        const hColumnValue = summary.effectivePaid;
        const paidAmount17 = summary.previousPaid + summary.effectivePaid;
        const totalDeducted = summary.previousPaid + summary.advanceAmount + summary.effectivePaid;
        const balanceAmount17 = totalDeducted >= summary.netAmount ? 0 : summary.netAmount - totalDeducted;

        return {
          UID: bill.UID,
          // ✅ CHANGE: planned15
          planned15: bill.planned15 || "",
          siteName: bill.siteName || "",
          vendorFirmName16: bill.vendorFirmName || "",
          billNo: bill.invoice13,
          billDate16: bill.billDate || "",
          netAmount16: summary.netAmount,
          currentPaid: hColumnValue,
          paidAmount17: paidAmount17,
          balanceAmount17: balanceAmount17,
          bankDetails17: bankDetails,
          paymentMode17: paymentMode,
          paymentDetails17: paymentDetails,
          paymentDate18: paymentDate,
          grandTotal: grandTotal,
          advanceAmount: summary.advanceAmount,
        };
      });

      // ✅ CHANGE: API URL
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/Update-Payment-15`, payload);

      if (response.data.success) {
        alert(`Success! ${response.data.addedToPaymentSheet} payments recorded.`);
        setSelectedBills([]); setPaidAmounts({}); setRoundups({});
        setBankDetails(""); setPaymentMode(""); setPaymentDetails(""); setPaymentDate("");
        const freshData = await fetchInitialData();
        if (freshData) handleFilter(freshData);
      } else {
        alert("Error: " + (response.data.error || "Something went wrong"));
      }
    } catch (error) {
      alert("Submit error: " + (error.response?.data?.error || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const scrollToPaymentSection = () => {
    if (paymentSectionRef.current) paymentSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (loading) return <div style={{ textAlign: "center", marginTop: "50px", fontSize: "18px" }}>Loading...</div>;

  return (
    <div style={{ padding: "20px", backgroundColor: "#f0f2f5", minHeight: "100vh", fontFamily: "sans-serif" }}>

      {/* Filter Area */}
      <div style={{ backgroundColor: "white", padding: "25px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", marginBottom: "25px" }}>
        <div style={{ display: "flex", gap: "20px", alignItems: "flex-end" }}>
          {/* Vendor */}
          <div style={{ flex: 1, position: "relative" }} ref={vendorRef}>
            <label style={{ fontSize: "13px", fontWeight: "bold", color: "#555", marginBottom: "8px", display: "block" }}>Viewing Bills for:</label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input type="text" placeholder="Search Vendor..." value={vendorSearch}
                onFocus={() => setShowVendorList(true)} onChange={(e) => setVendorSearch(e.target.value)}
                style={{ width: "100%", padding: "12px 15px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "16px", outline: "none" }} />
              <FaChevronDown style={{ position: "absolute", right: "15px", color: "#888" }} />
            </div>
            {showVendorList && (
              <ul style={{ position: "absolute", top: "100%", left: 0, right: 0, backgroundColor: "white", border: "1px solid #ddd", borderRadius: "8px", marginTop: "5px", maxHeight: "200px", overflowY: "auto", zIndex: 100, listStyle: "none", padding: 0, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                {vendors.filter((v) => v.vendorFirmName.toLowerCase().includes(vendorSearch.toLowerCase())).map((v, i) => (
                  <li key={i} onClick={() => { setVendorSearch(v.vendorFirmName); setShowVendorList(false); }}
                    style={{ padding: "10px 15px", cursor: "pointer", borderBottom: "1px solid #f0f0f0" }}
                    onMouseOver={(e) => (e.target.style.backgroundColor = "#f0f7ff")}
                    onMouseOut={(e) => (e.target.style.backgroundColor = "transparent")}>{v.vendorFirmName}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Site */}
          <div style={{ flex: 1, position: "relative" }} ref={siteRef}>
            <label style={{ fontSize: "13px", fontWeight: "bold", color: "#555", marginBottom: "8px", display: "block" }}>Site Name:</label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input type="text" placeholder="Search Site..." value={siteSearch}
                onFocus={() => setShowSiteList(true)} onChange={(e) => setSiteSearch(e.target.value)}
                style={{ width: "100%", padding: "12px 15px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "16px", outline: "none" }} />
              <FaChevronDown style={{ position: "absolute", right: "15px", color: "#888" }} />
            </div>
            {showSiteList && (
              <ul style={{ position: "absolute", top: "100%", left: 0, right: 0, backgroundColor: "white", border: "1px solid #ddd", borderRadius: "8px", marginTop: "5px", maxHeight: "200px", overflowY: "auto", zIndex: 100, listStyle: "none", padding: 0, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                {sites.filter((s) => s.siteName.toLowerCase().includes(siteSearch.toLowerCase())).map((s, i) => (
                  <li key={i} onClick={() => { setSiteSearch(s.siteName); setShowSiteList(false); }}
                    style={{ padding: "10px 15px", cursor: "pointer", borderBottom: "1px solid #f0f0f0" }}
                    onMouseOver={(e) => (e.target.style.backgroundColor = "#f0f7ff")}
                    onMouseOut={(e) => (e.target.style.backgroundColor = "transparent")}>{s.siteName}</li>
                ))}
              </ul>
            )}
          </div>

          <button onClick={() => handleFilter()}
            style={{ padding: "12px 35px", backgroundColor: "#d32f2f", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "16px" }}>
            <FaSearch style={{ marginRight: "8px" }} /> Filter
          </button>
        </div>
      </div>

      {showData && (
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div style={{ fontSize: "22px", fontWeight: "bold" }}>
              {vendorSearch} <span style={{ color: "#888", fontWeight: "normal" }}>| {siteSearch || "All Sites"}</span>
            </div>
            <div style={{ color: "#d32f2f", fontWeight: "bold", cursor: "pointer", fontSize: "16px" }}
              onClick={() => { setShowData(false); setSelectedBills([]); setPaidAmounts({}); setRoundups({}); }}>
              <FaTimes style={{ marginRight: "8px" }} /> Change Contractor
            </div>
          </div>

          {filteredData.map((item) => {
            const summary = getPaymentSummary(item);
            return (
              <div key={item.UID} style={{
                backgroundColor: "white", borderRadius: "12px", padding: "25px", marginBottom: "20px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                borderLeft: selectedBills.includes(item.UID) ? "10px solid #2e7d32" : "1px solid #eee",
              }}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                  <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                    <div onClick={() => toggleBillSelection(item.UID)}
                      style={{ border: "2px solid #ddd", borderRadius: "8px", padding: "10px 15px", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", backgroundColor: selectedBills.includes(item.UID) ? "#e8f5e9" : "white" }}>
                      <input type="checkbox" checked={selectedBills.includes(item.UID)} readOnly />
                      <span style={{ fontWeight: "bold" }}>Select Bill</span>
                    </div>
                    <div>
                      <h2 style={{ margin: 0, color: "#333" }}>{item.siteName}</h2>
                      <span style={{ fontSize: "14px", color: "#666" }}>
                        Invoice No: <b style={{ backgroundColor: "#f0f7ff", padding: "2px 6px", color: "#1a73e8" }}>{item.invoice13 || "-"}</b>
                        {item.UID && ` | UID: ${item.UID}`}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "26px", fontWeight: "bold", color: "#2e7d32" }}>
                      Rs.{summary.netAmount.toLocaleString("en-IN")}
                    </div>
                    {/* ✅ CHANGE: planned15 */}
                    <div style={{ fontSize: "12px", color: "#999" }}>Planned: {item.planned15}</div>
                  </div>
                </div>

                {/* Details */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", borderTop: "1px solid #f0f0f0", paddingTop: "20px" }}>
                  <DetailItem label="MATERIAL TYPE" value={item.materialType} />
                  <DetailItem label="VENDOR FIRM NAME" value={item.vendorFirmName} />
                  <DetailItem label="INVOICE NO" value={item.invoice13} color="#1a73e8" />
                  <DetailItem label="BILL DATE" value={item.billDate} color="#1a73e8" />
                  <DetailItem label="FINAL INDENT NO" value={item.finalIndentNo} />
                  <DetailItem label="PO NUMBER" value={item.poNumber} />
                  <DetailItem label="MRN NO" value={item.mrnNo} />
                  <DetailItem label="PLANNED 15" value={item.planned15} />
                  <DetailItem label="NET AMOUNT 15" value={`Rs.${summary.netAmount.toLocaleString("en-IN")}`} />
                  <DetailItem label="Previous Paid (H)" value={`Rs.${summary.previousPaid.toLocaleString("en-IN")}`} color="green" />
                  {summary.advanceAmount > 0 && <DetailItem label="Advance Adjusted (P)" value={`Rs.${summary.advanceAmount.toLocaleString("en-IN")}`} color="#e65100" />}
                  <DetailItem label="Remaining Balance" value={`Rs.${summary.currentBalance.toLocaleString("en-IN")}`} color={summary.currentBalance <= 0 ? "#d32f2f" : "green"} />
                </div>

                {summary.advanceAmount > 0 && (
                  <div style={{ marginTop: "15px", padding: "10px 15px", backgroundColor: "#fff3e0", borderRadius: "8px", borderLeft: "4px solid #e65100", display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "18px" }}>⚡</span>
                    <span style={{ color: "#e65100", fontWeight: "bold", fontSize: "14px" }}>
                      Advance Payment of Rs.{summary.advanceAmount.toLocaleString("en-IN")} already adjusted
                    </span>
                  </div>
                )}

                {/* PDFs */}
                <div style={{ marginTop: "20px", display: "flex", gap: "15px", borderTop: "1px solid #f0f0f0", paddingTop: "15px", flexWrap: "wrap" }}>
                  {item.finalIndentPDF && <DocLink icon={<FaFilePdf />} label="Indent PDF" url={item.finalIndentPDF} />}
                  {item.poPDF && <DocLink icon={<FaFilePdf />} label="PO PDF" url={item.poPDF} />}
                  {item.mrnPDF && <DocLink icon={<FaFilePdf />} label="MRN PDF" url={item.mrnPDF} />}
                  {item.invoicePhoto && <DocLink icon={<FaFilePdf />} label="Invoice Photo" url={item.invoicePhoto} />}
                </div>

                {/* Payment Input */}
                {selectedBills.includes(item.UID) && (
                  <div style={{ marginTop: "30px", padding: "20px", backgroundColor: "#f8fff8", borderRadius: "10px", border: "1px solid #c8e6c9" }}>
                    <h4 style={{ margin: "0 0 20px 0", color: "#2e7d32" }}>
                      Payment Details — Invoice: <strong>{item.invoice13}</strong> (UID: {item.UID})
                    </h4>
                    <div style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#e3f2fd", borderRadius: "8px", borderLeft: "4px solid #1976d2" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "15px", fontSize: "14px" }}>
                        <div><span style={{ color: "#555", fontWeight: "bold" }}>Net Amount:</span> <span style={{ marginLeft: "10px", fontWeight: "bold", color: "#1976d2", fontSize: "16px" }}>Rs.{summary.netAmount.toLocaleString("en-IN")}</span></div>
                        <div><span style={{ color: "#555", fontWeight: "bold" }}>Previously Paid (H):</span> <span style={{ marginLeft: "10px", fontWeight: "bold", color: "#388e3c", fontSize: "16px" }}>Rs.{summary.previousPaid.toLocaleString("en-IN")}</span></div>
                        {summary.advanceAmount > 0 && <div><span style={{ color: "#555", fontWeight: "bold" }}>Advance (P):</span> <span style={{ marginLeft: "10px", fontWeight: "bold", color: "#e65100", fontSize: "16px" }}>Rs.{summary.advanceAmount.toLocaleString("en-IN")}</span></div>}
                        <div><span style={{ color: "#555", fontWeight: "bold" }}>Current Balance:</span> <span style={{ marginLeft: "10px", fontWeight: "bold", color: "#d32f2f", fontSize: "16px" }}>Rs.{summary.currentBalance.toLocaleString("en-IN")}</span></div>
                        <div><span style={{ color: "#555", fontWeight: "bold" }}>New Balance (I):</span> <span style={{ marginLeft: "10px", fontWeight: "bold", color: summary.newBalance === 0 ? "#388e3c" : "#d32f2f", fontSize: "16px" }}>Rs.{summary.newBalance.toLocaleString("en-IN")}</span></div>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
                      <div>
                        <label style={{ fontSize: "13px", fontWeight: "bold", color: "#555", display: "block" }}>CURRENT PAID AMOUNT Rs. (H column)</label>
                        <input type="number" step="0.01" value={paidAmounts[item.UID] || ""}
                          onChange={(e) => handlePaidAmountChange(item.UID, e.target.value)}
                          placeholder="Enter amount" min="0" max={summary.currentBalance}
                          style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #4caf50", marginTop: "8px" }} />
                      </div>
                      <div>
                        <label style={{ fontSize: "13px", fontWeight: "bold", color: "#555", display: "block" }}>ROUND OFF Rs. (+/-)</label>
                        <input type="number" step="0.01" value={roundups[item.UID] || ""}
                          onChange={(e) => handleRoundupChange(item.UID, e.target.value)}
                          placeholder="Enter round off" min="-9" max="9"
                          style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ff9800", marginTop: "8px" }} />
                      </div>
                      <div>
                        <label style={{ fontSize: "13px", fontWeight: "bold", color: "#555", display: "block" }}>NEW BALANCE (I column)</label>
                        <input type="number" value={summary.newBalance} readOnly
                          style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #d32f2f", backgroundColor: "#ffebee", marginTop: "8px", fontWeight: "bold" }} />
                      </div>
                    </div>
                    <div style={{ marginTop: "20px" }}>
                      <div style={{ height: "8px", backgroundColor: "#e0e0e0", borderRadius: "4px", overflow: "hidden" }}>
                        <div style={{ height: "100%", backgroundColor: "#2196f3", width: `${Math.min((summary.totalPaidAfter / summary.netAmount) * 100, 100)}%`, transition: "width 0.3s ease" }} />
                      </div>
                    </div>
                    <button onClick={scrollToPaymentSection}
                      style={{ marginTop: "20px", padding: "12px 25px", backgroundColor: "#1976d2", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px" }}>
                      <FaArrowDown /> Go to Global Payment Section
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Grand Total */}
          {selectedBills.length > 0 && (
            <div style={{ backgroundColor: "#e8f5e9", padding: "20px", borderRadius: "12px", marginTop: "30px", border: "2px solid #4caf50" }}>
              <h3 style={{ margin: "0 0 10px 0", color: "#2e7d32" }}>
                Grand Total (Current Payment)
                <span style={{ float: "right", fontSize: "28px", fontWeight: "bold" }}>Rs.{grandTotal.toLocaleString("en-IN")}</span>
              </h3>
            </div>
          )}

          {/* Global Payment */}
          {selectedBills.length > 0 && (
            <div ref={paymentSectionRef} style={{ backgroundColor: "white", padding: "30px", borderRadius: "12px", marginTop: "30px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
              <h3 style={{ marginBottom: "25px", color: "#333" }}>
                Global Payment Details ({selectedBills.length} Bill{selectedBills.length > 1 ? "s" : ""} Selected)
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }}>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: "bold", color: "#555", display: "block" }}>BANK DETAILS</label>
                  <select value={bankDetails} onChange={(e) => setBankDetails(e.target.value)}
                    style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ddd", marginTop: "8px" }}>
                    <option value="">-- Select --</option>
                    <option value="SVC Main A/C(202)">SVC Main A/C(202)</option>
                    <option value="SVC VENDOR PAY A/C(328)">SVC VENDOR PAY A/C(328)</option>
                    <option value="HDFC Kabir Ahuja(341)">HDFC Kabir Ahuja(341)</option>
                    <option value="HDFC Rajeev Abott(313)">HDFC Rajeev Abott(313)</option>
                    <option value="HDFC Madhav Gupta (375)">HDFC Madhav Gupta (375)</option>
                    <option value="HDFC Scope Clg(215)">HDFC Scope Clg(215)</option>
                    <option value="ICICI RNTU(914)">ICICI RNTU(914)</option>
                    <option value="HDFC Alka Upadhyay(902)">HDFC Alka Upadhyay(902)</option>
                    <option value="SVC Udit Agrawal(696)">SVC Udit Agrawal(696)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: "bold", color: "#555", display: "block" }}>PAYMENT MODE</label>
                  <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}
                    style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ddd", marginTop: "8px" }}>
                    <option value="">-- Select --</option>
                    <option value="Cheque">Cheque</option>
                    <option value="NEFT">NEFT</option>
                    <option value="RTGS">RTGS</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: "bold", color: "#555", display: "block" }}>{paymentDetailsLabel}</label>
                  <input type="text" placeholder={paymentMode === "Cheque" ? "Enter Cheque Number" : "Enter detail"}
                    value={paymentDetails} onChange={(e) => setPaymentDetails(e.target.value)}
                    style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ddd", marginTop: "8px" }} />
                </div>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: "bold", color: "#555", display: "block" }}>PAYMENT DATE</label>
                  <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)}
                    style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ddd", marginTop: "8px" }} />
                </div>
              </div>

              <div style={{ marginTop: "20px", padding: "15px", backgroundColor: "#fff3cd", borderRadius: "8px", border: "1px solid #ffeaa7" }}>
                <span style={{ fontWeight: "bold", color: "#856404" }}>⚠️ Note: </span>
                <span style={{ color: "#856404" }}>H = Current Paid • P = Advance Amount • I = Balance</span>
              </div>

              <button disabled={submitting} onClick={handleSubmit}
                style={{ padding: "15px 40px", backgroundColor: submitting ? "#999" : "#2e7d32", color: "white", border: "none", borderRadius: "8px", cursor: submitting ? "not-allowed" : "pointer", fontWeight: "bold", fontSize: "18px", marginTop: "30px", opacity: submitting ? 0.7 : 1 }}>
                {submitting ? "Submitting..." : "SUBMIT ALL PAYMENT DATA"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const DetailItem = ({ label, value, color = "#333" }) => (
  <div>
    <div style={{ fontSize: "10px", color: "#aaa", fontWeight: "bold", marginBottom: "4px" }}>{label}</div>
    <div style={{ fontSize: "14px", fontWeight: "bold", color }}>{value || "-"}</div>
  </div>
);

const DocLink = ({ icon, label, url }) => (
  <a href={url} target="_blank" rel="noopener noreferrer"
    style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", padding: "6px 12px", borderRadius: "4px", border: "1px solid #1a73e8", color: "#1a73e8", fontWeight: "bold", backgroundColor: "#f0f7ff" }}>
    {icon} {label}
  </a>
);

export default Payment15;