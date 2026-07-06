

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Loader2, AlertCircle, CheckCircle, X, ChevronDown,
  RotateCcw, Package, FileText, ExternalLink,
  Phone, Search, ArrowDown, Share2
} from "lucide-react";

const T = {
  navy: '#1e293b', navyLight: '#334155', navyDark: '#0f172a',
  gold: '#f59e0b', goldLight: '#fbbf24', goldDark: '#d97706',
  card: '#ffffff', text: '#1e293b',
  textLight: '#64748b', textMuted: '#94a3b8',
  border: '#e2e8f0', borderLight: '#f1f5f9',
  success: '#10b981', successBg: '#ecfdf5', successBorder: '#a7f3d0',
  danger: '#ef4444', dangerBg: '#fef2f2', dangerBorder: '#fecaca',
  purple: '#7c3aed',
  warning: '#f59e0b', warningBg: '#fffbeb',
};

const inputBase = {
  width: '100%', padding: '10px 12px', fontSize: 14,
  border: `1.5px solid ${T.border}`, borderRadius: 8,
  outline: 'none', color: T.text, background: T.borderLight,
  transition: 'all 0.2s', boxSizing: 'border-box',
};
const focusGold = (e) => {
  e.target.style.borderColor = T.gold;
  e.target.style.boxShadow = `0 0 0 3px ${T.gold}15`;
  e.target.style.background = T.card;
};
const blurNormal = (e) => {
  e.target.style.borderColor = T.border;
  e.target.style.boxShadow = 'none';
  e.target.style.background = T.borderLight;
};

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
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/Payment_15`);
      if (response.data.success) {
        const processedData = response.data.data.map((item) => {
          const parseAmount = (value) => {
            if (!value) return 0;
            const cleaned = value.toString().replace(/,/g, "").trim();
            return cleaned === "" ? 0 : Number(cleaned);
          };
          const netAmount     = parseAmount(item.netAmount16 || item.netAmount17 || 0);
          const latestPaid    = parseAmount(item.latestPaidAmount || 0);
          const advanceAmount = parseAmount(item.advanceAmount || 0);
          return {
            ...item,
            netAmount16:         netAmount,
            latestPaidAmount:    latestPaid,
            advanceAmount:       advanceAmount,
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
    const currentVendor = vendorSearchRef.current?.trim();
    const currentSite = siteSearchRef.current?.trim();
    if (!currentVendor) return alert("Please select a vendor");
    const sourceData = freshData || allData;

    const results = sourceData.filter((item) => {
      const vendorMatch = item.vendorFirmName?.trim().toLowerCase() === currentVendor.toLowerCase();
      
      // ✅ Site match - only if site is entered AND not empty
      const siteMatch = (currentSite && currentSite !== "")
        ? item.siteName?.trim().toLowerCase() === currentSite.toLowerCase()
        : true;  // No site filter = show all sites for this vendor
      
      return vendorMatch && siteMatch;
    });

    // ✅ If no results with site filter, try without site
    if (results.length === 0 && currentSite) {
      const vendorOnlyResults = sourceData.filter(
        item => item.vendorFirmName?.trim().toLowerCase() === currentVendor.toLowerCase()
      );
      
      if (vendorOnlyResults.length > 0) {
        // Get sites where this vendor has data
        const vendorSites = [...new Set(vendorOnlyResults.map(i => i.siteName))];
        alert(`"${currentVendor}" ka data "${currentSite}" site pe nahi hai.\n\nYe vendor in sites pe hai:\n${vendorSites.join('\n')}\n\nSab sites ka data dikha raha hu.`);
        
        setFilteredData(vendorOnlyResults);
        setShowData(true);
        setSelectedBills([]);
        setPaidAmounts({});
        setRoundups({});
        return;
      }
    }

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
      alert(`Cannot pay more than balance (Rs.${currentBalance.toLocaleString("en-IN")})`);
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
    return Number(bill.netAmount16 || 0) - Number(bill.latestPaidAmount || 0) - Number(bill.advanceAmount || 0);
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
    if (selectedBills.length === 0) { alert("Select at least one bill"); return; }
    if (!bankDetails || !paymentMode || !paymentDetails.trim() || !paymentDate) {
      alert("Fill all payment details"); return;
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

  // ✅ Loading Screen with Navy+Gold theme
  if (loading) return (
    <div style={{
      display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
      minHeight: '60vh', fontFamily: 'sans-serif',
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 14,
        background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 20, boxShadow: `0 0 0 3px ${T.gold}30`,
      }}>
        <Loader2 size={28} color={T.gold} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
      <p style={{ fontSize: 15, fontWeight: 600, color: T.navy, marginBottom: 4 }}>Loading Payment Data...</p>
      <p style={{ fontSize: 13, color: T.textMuted }}>Fetching latest records</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 8px' }}>

      {/* ── Header ─────────────────────────────────────── */}
      <div style={{
        background: T.card, borderRadius: 10, border: `1px solid ${T.border}`,
        padding: '14px 18px', marginBottom: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Package size={18} color={T.gold} />
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: T.navy, margin: 0 }}>Payment — Step 15</h2>
            <p style={{ fontSize: 12, color: T.textMuted, margin: 0 }}>
              {allData.length} pending bills
            </p>
          </div>
        </div>
        <button onClick={() => fetchInitialData()} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8,
          border: `1.5px solid ${T.border}`, background: T.card,
          color: T.textLight, fontSize: 13, cursor: 'pointer',
        }}>
          <RotateCcw size={14} /> Refresh
        </button>
      </div>

      {/* ── Filter Card ────────────────────────────────── */}
      <div style={{
        background: T.card, borderRadius: 10, border: `1px solid ${T.border}`,
        padding: '16px 18px', marginBottom: 16,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${T.border}`,
        }}>
          <Search size={16} color={T.gold} />
          <span style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>Filter Bills</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, alignItems: 'end' }}>
          {/* Vendor Search */}
          <div style={{ position: 'relative' }} ref={vendorRef}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>Vendor</label>
            <div style={{ position: 'relative' }}>
              <input type="text" placeholder="Search Vendor..." value={vendorSearch}
                onFocus={() => setShowVendorList(true)} onChange={(e) => setVendorSearch(e.target.value)}
                style={inputBase} onBlur={blurNormal} />
              <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: T.textMuted, pointerEvents: 'none' }} />
            </div>
            {showVendorList && (
              <ul style={{
                position: 'absolute', top: '100%', left: 0, right: 0,
                background: T.card, border: `1px solid ${T.border}`, borderRadius: 8,
                marginTop: 4, maxHeight: 200, overflowY: 'auto', zIndex: 100,
                listStyle: 'none', padding: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}>
                {vendors.filter(v => v.vendorFirmName.toLowerCase().includes(vendorSearch.toLowerCase())).map((v, i) => (
                  <li key={i} onClick={() => { setVendorSearch(v.vendorFirmName); setShowVendorList(false); }}
                    style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: `1px solid ${T.borderLight}`, fontSize: 13 }}
                    onMouseOver={e => e.target.style.background = `${T.gold}10`}
                    onMouseOut={e => e.target.style.background = 'transparent'}>
                    {v.vendorFirmName}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Site Search */}
          <div style={{ position: 'relative' }} ref={siteRef}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>Site Name</label>
            <div style={{ position: 'relative' }}>
              <input type="text" placeholder="Search Site..." value={siteSearch}
                onFocus={() => setShowSiteList(true)} onChange={(e) => setSiteSearch(e.target.value)}
                style={inputBase} onBlur={blurNormal} />
              <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: T.textMuted, pointerEvents: 'none' }} />
            </div>
            {showSiteList && (
              <ul style={{
                position: 'absolute', top: '100%', left: 0, right: 0,
                background: T.card, border: `1px solid ${T.border}`, borderRadius: 8,
                marginTop: 4, maxHeight: 200, overflowY: 'auto', zIndex: 100,
                listStyle: 'none', padding: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}>
                {sites.filter(s => s.siteName.toLowerCase().includes(siteSearch.toLowerCase())).map((s, i) => (
                  <li key={i} onClick={() => { setSiteSearch(s.siteName); setShowSiteList(false); }}
                    style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: `1px solid ${T.borderLight}`, fontSize: 13 }}
                    onMouseOver={e => e.target.style.background = `${T.gold}10`}
                    onMouseOut={e => e.target.style.background = 'transparent'}>
                    {s.siteName}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Filter Button */}
          <button onClick={() => handleFilter()} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '10px 24px', borderRadius: 8, border: 'none',
            background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
            color: T.navyDark, fontSize: 13, fontWeight: 700,
            cursor: 'pointer', height: 42,
            boxShadow: `0 2px 8px ${T.gold}40`,
          }}>
            <Search size={14} /> Filter
          </button>
        </div>
      </div>

      {/* ── Bills Display ──────────────────────────────── */}
      {showData && (
        <div>
          {/* Vendor Header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 16, padding: '10px 16px',
            background: T.card, borderRadius: 8, border: `1px solid ${T.border}`,
          }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: T.navy }}>
              {vendorSearch}
              <span style={{ color: T.textMuted, fontWeight: 400, marginLeft: 8 }}>| {siteSearch || "All Sites"}</span>
            </div>
            <button onClick={() => { setShowData(false); setSelectedBills([]); setPaidAmounts({}); setRoundups({}); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 6, border: `1px solid ${T.danger}40`,
                background: T.dangerBg, color: T.danger, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}>
              <X size={12} /> Change
            </button>
          </div>

          {filteredData.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: T.card, borderRadius: 10, border: `1px solid ${T.border}` }}>
              <Package size={40} color={T.border} style={{ marginBottom: 12 }} />
              <p style={{ fontSize: 15, color: T.textLight }}>No bills found</p>
            </div>
          )}

          {/* Bill Cards */}
          {filteredData.map((item) => {
            const summary = getPaymentSummary(item);
            const isSelected = selectedBills.includes(item.UID);

            return (
              <div key={item.UID} style={{
                background: T.card, borderRadius: 10, padding: '20px',
                marginBottom: 16, border: `1px solid ${T.border}`,
                borderLeft: isSelected ? `6px solid ${T.success}` : `1px solid ${T.border}`,
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              }}>
                {/* Card Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    <div onClick={() => toggleBillSelection(item.UID)} style={{
                      border: `2px solid ${isSelected ? T.success : T.border}`,
                      borderRadius: 8, padding: '8px 14px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 8,
                      background: isSelected ? T.successBg : T.card,
                    }}>
                      <input type="checkbox" checked={isSelected} readOnly />
                      <span style={{ fontWeight: 600, fontSize: 13 }}>Select</span>
                    </div>
                    <div>
                      <h3 style={{ margin: 0, color: T.navy, fontSize: 16 }}>{item.siteName}</h3>
                      <div style={{ fontSize: 13, color: T.textLight, marginTop: 4 }}>
                        Invoice: <span style={{ background: `${T.navy}10`, color: T.navy, padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>{item.invoice13 || '—'}</span>
                        {item.UID && <span style={{ marginLeft: 8 }}>UID: <strong>{item.UID}</strong></span>}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: T.success }}>
                      Rs.{summary.netAmount.toLocaleString("en-IN")}
                    </div>
                    <div style={{ fontSize: 11, color: T.textMuted }}>Planned: {item.planned15}</div>
                  </div>
                </div>

                {/* Details Grid */}
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 14, borderTop: `1px solid ${T.border}`, paddingTop: 14,
                }}>
                  <DetailItem label="MATERIAL TYPE" value={item.materialType} />
                  <DetailItem label="VENDOR" value={item.vendorFirmName} />
                  <DetailItem label="INVOICE NO" value={item.invoice13} color={T.navy} />
                  <DetailItem label="BILL DATE" value={item.billDate} color={T.navy} />
                  <DetailItem label="PO NUMBER" value={item.poNumber} />
                  <DetailItem label="MRN NO" value={item.mrnNo} />
                  <DetailItem label="PLANNED 15" value={item.planned15} />
                  <DetailItem label="NET AMOUNT" value={`Rs.${summary.netAmount.toLocaleString("en-IN")}`} />
                  <DetailItem label="Previous Paid" value={`Rs.${summary.previousPaid.toLocaleString("en-IN")}`} color={T.success} />
                  {summary.advanceAmount > 0 && <DetailItem label="Advance" value={`Rs.${summary.advanceAmount.toLocaleString("en-IN")}`} color="#e65100" />}
                  <DetailItem label="Balance" value={`Rs.${summary.currentBalance.toLocaleString("en-IN")}`} color={summary.currentBalance <= 0 ? T.danger : T.success} />
                </div>

                {/* Advance Banner */}
                {summary.advanceAmount > 0 && (
                  <div style={{ marginTop: 12, padding: '10px 14px', background: T.warningBg, borderRadius: 8, borderLeft: `3px solid ${T.warning}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16 }}>⚡</span>
                    <span style={{ color: '#92400e', fontWeight: 600, fontSize: 13 }}>
                      Advance Rs.{summary.advanceAmount.toLocaleString("en-IN")} adjusted
                    </span>
                  </div>
                )}

                {/* PDFs */}
                <div style={{ marginTop: 14, display: 'flex', gap: 10, borderTop: `1px solid ${T.border}`, paddingTop: 12, flexWrap: 'wrap' }}>
                  {item.finalIndentPDF && <DocLink label="Indent" url={item.finalIndentPDF} />}
                  {item.poPDF && <DocLink label="PO" url={item.poPDF} />}
                  {item.mrnPDF && <DocLink label="MRN" url={item.mrnPDF} />}
                  {item.invoicePhoto && <DocLink label="Invoice" url={item.invoicePhoto} />}
                </div>

                {/* Payment Input */}
                {isSelected && (
                  <div style={{ marginTop: 20, padding: 16, background: T.successBg, borderRadius: 10, border: `1px solid ${T.successBorder}` }}>
                    <h4 style={{ margin: '0 0 14px', color: '#065f46', fontSize: 14 }}>
                      Payment — <strong>{item.invoice13}</strong> (UID: {item.UID})
                    </h4>

                    {/* Summary */}
                    <div style={{ marginBottom: 14, padding: 12, background: `${T.navy}08`, borderRadius: 8, borderLeft: `3px solid ${T.navy}` }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, fontSize: 13 }}>
                        <div><span style={{ color: T.textLight }}>Net Amount:</span> <strong style={{ color: T.navy }}>Rs.{summary.netAmount.toLocaleString("en-IN")}</strong></div>
                        <div><span style={{ color: T.textLight }}>Previously Paid:</span> <strong style={{ color: T.success }}>Rs.{summary.previousPaid.toLocaleString("en-IN")}</strong></div>
                        {summary.advanceAmount > 0 && <div><span style={{ color: T.textLight }}>Advance:</span> <strong style={{ color: '#e65100' }}>Rs.{summary.advanceAmount.toLocaleString("en-IN")}</strong></div>}
                        <div><span style={{ color: T.textLight }}>Balance:</span> <strong style={{ color: T.danger }}>Rs.{summary.currentBalance.toLocaleString("en-IN")}</strong></div>
                        <div><span style={{ color: T.textLight }}>New Balance:</span> <strong style={{ color: summary.newBalance === 0 ? T.success : T.danger }}>Rs.{summary.newBalance.toLocaleString("en-IN")}</strong></div>
                      </div>
                    </div>

                    {/* Inputs */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: T.navyLight, display: 'block', marginBottom: 4 }}>PAID AMOUNT</label>
                        <input type="number" step="0.01" value={paidAmounts[item.UID] || ""}
                          onChange={(e) => handlePaidAmountChange(item.UID, e.target.value)}
                          placeholder="0" min="0" max={summary.currentBalance}
                          style={{ ...inputBase, border: `1.5px solid ${T.success}` }} />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: T.navyLight, display: 'block', marginBottom: 4 }}>ROUND OFF (+/-)</label>
                        <input type="number" step="0.01" value={roundups[item.UID] || ""}
                          onChange={(e) => handleRoundupChange(item.UID, e.target.value)}
                          placeholder="0" min="-9" max="9"
                          style={{ ...inputBase, border: `1.5px solid ${T.gold}` }} />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: T.navyLight, display: 'block', marginBottom: 4 }}>NEW BALANCE</label>
                        <input type="number" value={summary.newBalance} readOnly
                          style={{ ...inputBase, background: T.dangerBg, border: `1.5px solid ${T.danger}`, fontWeight: 700, cursor: 'not-allowed' }} />
                      </div>
                    </div>

                    {/* Progress */}
                    <div style={{ marginTop: 12, height: 6, background: T.border, borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: T.success, width: `${Math.min((summary.totalPaidAfter / summary.netAmount) * 100, 100)}%`, transition: 'width 0.3s' }} />
                    </div>

                    <button onClick={scrollToPaymentSection} style={{
                      marginTop: 12, padding: '8px 18px', background: T.navy, color: T.gold,
                      border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 12,
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                      <ArrowDown size={13} /> Go to Payment Section
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Grand Total */}
          {selectedBills.length > 0 && (
            <div style={{
              background: T.successBg, padding: 16, borderRadius: 10, marginTop: 20,
              border: `2px solid ${T.success}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <h3 style={{ margin: 0, color: '#065f46', fontSize: 16 }}>Grand Total</h3>
              <span style={{ fontSize: 24, fontWeight: 800, color: T.success }}>
                Rs.{grandTotal.toLocaleString("en-IN")}
              </span>
            </div>
          )}

          {/* Global Payment */}
          {selectedBills.length > 0 && (
            <div ref={paymentSectionRef} style={{
              background: T.card, padding: 20, borderRadius: 10, marginTop: 20,
              border: `1px solid ${T.border}`,
            }}>
              <h3 style={{ marginBottom: 16, color: T.navy, fontSize: 16 }}>
                Payment Details ({selectedBills.length} Bill{selectedBills.length > 1 ? 's' : ''})
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: T.navyLight, display: 'block', marginBottom: 4 }}>BANK</label>
                  <select value={bankDetails} onChange={(e) => setBankDetails(e.target.value)}
                    style={{ ...inputBase, appearance: 'none', cursor: 'pointer' }}>
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
                  <label style={{ fontSize: 12, fontWeight: 600, color: T.navyLight, display: 'block', marginBottom: 4 }}>MODE</label>
                  <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}
                    style={{ ...inputBase, appearance: 'none', cursor: 'pointer' }}>
                    <option value="">-- Select --</option>
                    <option value="Cheque">Cheque</option>
                    <option value="NEFT">NEFT</option>
                    <option value="RTGS">RTGS</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: T.navyLight, display: 'block', marginBottom: 4 }}>{paymentDetailsLabel}</label>
                  <input type="text" placeholder={paymentMode === "Cheque" ? "Cheque Number" : "Details"}
                    value={paymentDetails} onChange={(e) => setPaymentDetails(e.target.value)}
                    style={inputBase} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: T.navyLight, display: 'block', marginBottom: 4 }}>PAYMENT DATE</label>
                  <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)}
                    style={inputBase} />
                </div>
              </div>

              <div style={{ padding: 12, background: T.warningBg, borderRadius: 8, border: `1px solid ${T.gold}40`, marginBottom: 16, fontSize: 12, color: '#92400e' }}>
                <strong>⚠️ Note:</strong> H = Current Paid • P = Advance • I = Balance
              </div>

              <button disabled={submitting} onClick={handleSubmit} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '14px 40px', borderRadius: 8, border: 'none',
                background: submitting ? T.border : `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
                color: submitting ? T.textMuted : T.navyDark,
                fontSize: 16, fontWeight: 700,
                cursor: submitting ? 'not-allowed' : 'pointer',
                boxShadow: submitting ? 'none' : `0 2px 8px ${T.gold}40`,
              }}>
                {submitting ? (
                  <><Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> Submitting...</>
                ) : (
                  <><CheckCircle size={16} /> SUBMIT ALL PAYMENT DATA</>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// ── Helper Components ──────────────────────────────────────
const DetailItem = ({ label, value, color = '#333' }) => (
  <div>
    <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, marginBottom: 3 }}>{label}</div>
    <div style={{ fontSize: 13, fontWeight: 600, color }}>{value || '—'}</div>
  </div>
);

const DocLink = ({ label, url }) => (
  <a href={url} target="_blank" rel="noopener noreferrer" style={{
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '4px 10px', borderRadius: 5,
    background: '#1e293b', color: '#fbbf24',
    fontSize: 11, fontWeight: 700, textDecoration: 'none',
  }}>
    <FileText size={11} /> {label}
  </a>
);

export default Payment15;