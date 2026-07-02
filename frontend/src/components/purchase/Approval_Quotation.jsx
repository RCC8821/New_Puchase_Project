

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  ChevronDown,
  RotateCcw,
  Package,
  FileText,
  ArrowLeft,
  ArrowRight,
  Check,
  ExternalLink,
  Edit3,
  Search,
  Lock,
  Building2,
} from "lucide-react";

// ─── THEME ───────────────────────────────────────────────
const T = {
  navy: "#1e293b",
  navyLight: "#334155",
  navyDark: "#0f172a",
  gold: "#f59e0b",
  goldLight: "#fbbf24",
  goldDark: "#d97706",
  bg: "#f8fafc",
  card: "#ffffff",
  text: "#1e293b",
  textLight: "#64748b",
  textMuted: "#94a3b8",
  border: "#e2e8f0",
  borderLight: "#f1f5f9",
  success: "#10b981",
  successBg: "#ecfdf5",
  successBorder: "#a7f3d0",
  danger: "#ef4444",
  dangerBg: "#fef2f2",
  dangerBorder: "#fecaca",
  purple: "#7c3aed",
  purpleBg: "#f5f3ff",
};

const labelStyle = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: T.navyLight,
  marginBottom: 6,
  letterSpacing: 0.3,
};

const inputBase = {
  width: "100%",
  padding: "9px 12px",
  fontSize: 13,
  border: `1.5px solid ${T.border}`,
  borderRadius: 8,
  outline: "none",
  color: T.text,
  background: T.borderLight,
  transition: "all 0.2s",
  boxSizing: "border-box",
};

const focusGold = (e) => {
  e.target.style.borderColor = T.gold;
  e.target.style.boxShadow = `0 0 0 3px ${T.gold}15`;
  e.target.style.background = T.card;
};

const blurNormal = (e) => {
  e.target.style.borderColor = T.border;
  e.target.style.boxShadow = "none";
  e.target.style.background = T.borderLight;
};

const LoadingScreen = ({ text = "Loading...", subText = "Fetching data" }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "80px 20px",
    }}
  >
    <div
      style={{
        width: 56,
        height: 56,
        borderRadius: 14,
        background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
        boxShadow: `0 0 0 3px ${T.gold}30`,
      }}
    >
      <Loader2
        size={28}
        color={T.gold}
        style={{ animation: "spin 1s linear infinite" }}
      />
    </div>
    <p style={{ fontSize: 15, fontWeight: 600, color: T.navy, marginBottom: 4 }}>
      {text}
    </p>
    <p style={{ fontSize: 13, color: T.textMuted }}>{subText}</p>
    <div
      style={{
        width: 180,
        height: 3,
        borderRadius: 3,
        background: T.border,
        marginTop: 20,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "40%",
          height: "100%",
          borderRadius: 3,
          background: `linear-gradient(90deg, ${T.gold}, ${T.goldLight})`,
          animation: "loadingBar 1.5s ease-in-out infinite",
        }}
      />
    </div>
    <style>{`
      @keyframes spin{to{transform:rotate(360deg)}}
      @keyframes loadingBar{0%{transform:translateX(-100%)}50%{transform:translateX(150%)}100%{transform:translateX(350%)}}
    `}</style>
  </div>
);

const Td = ({ children, right, maxW, center }) => (
  <td
    style={{
      padding: "10px 14px",
      fontSize: 13,
      color: T.text,
      borderBottom: `1px solid ${T.border}`,
      whiteSpace: "nowrap",
      textAlign: right ? "right" : center ? "center" : "left",
    }}
  >
    {maxW ? (
      <span
        title={typeof children === "string" ? children : ""}
        style={{
          display: "block",
          maxWidth: maxW,
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {children || <span style={{ color: T.textMuted }}>—</span>}
      </span>
    ) : (
      children || <span style={{ color: T.textMuted }}>—</span>
    )}
  </td>
);

const Approval_Quotation = () => {
  const [requests, setRequests] = useState([]);
  const [indentNumbers, setIndentNumbers] = useState([]);
  const [selectedIndent, setSelectedIndent] = useState("");
  const [currentStep, setCurrentStep] = useState(0);

  const [loading, setLoading] = useState(true);
  const [indentLoading, setIndentLoading] = useState(false);
  const [step2Loading, setStep2Loading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [selectedUIDData, setSelectedUIDData] = useState([]);
  const [indentCache, setIndentCache] = useState({});
  const [compareText, setCompareText] = useState("");

  // ═══ NEW STATES FOR VENDOR-FIRST SELECTION ═══
  const [selectedVendor, setSelectedVendor] = useState(""); // Single vendor name
  const [selectedUIDs, setSelectedUIDs] = useState(new Set()); // UIDs selected from that vendor

  const tableCols = [
    // { label: "#", w: 50 },
    { label: "Planned 5", w: 100 },
    { label: "UID", w: 60 },
    { label: "Req No", w: 90 },
    { label: "Project", w: 150 },
    { label: "Material Type", w: 120 },
    { label: "Material Name", w: 160 },
    { label: "Size", w: 90 },
    { label: "Specification", w: 130 },
    { label: "SKU", w: 100 },
    { label: "Qty", w: 70 },
    { label: "Unit", w: 70 },
    { label: "Rev Qty", w: 80 },
    { label: "Decided Brand", w: 140 },
    { label: "Indent No", w: 110 },
    { label: "PDF", w: 80 },
    { label: "No. of Quotations", w: 130 },
    { label: "Remark 4", w: 120 },
  ];

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/get-approval-Quotation`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();

      if (data && Array.isArray(data.data)) {
        setRequests(
          data.data.map((item) => ({
            UID: item.UID || "",
            Req_No: item.Req_No || "",
            Site_Name: item.Site_Name || "",
            Supervisor_Name: item.Supervisor_Name || "",
            Material_Type: item.Material_Type || "",
            SKU_Code: item.SKU_Code || "",
            Material_Name: item.Material_Name || "",
            Material_Size: item.Material_Size || "",
            Specification: item.Specification || "",
            Quantity: item.Quantity || "",
            Unit_Name: item.Unit_Name || "",
            Purpose: item.Purpose || "",
            Require_Date: item.Require_Date || "",
            REVISED_QUANTITY_2: item.REVISED_QUANTITY_2 || "",
            "DECIDED_BRAND/COMPANY_NAME_2":
              item["DECIDED_BRAND/COMPANY_NAME_2"] || "",
            INDENT_NUMBER_3: item.INDENT_NUMBER_3 || "",
            PDF_URL_3: item.PDF_URL_3 || "",
            PLANNED_5: item.PLANNED_5 || "",
            No_Of_Quotation_4:
              item.No_Of_Quotation_4 || item["No._Of_Quotation_4"] || "",
            REMARK_4: item.REMARK_4 || "",
          }))
        );
      } else {
        throw new Error("Invalid data format");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load data.");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchIndentNumbers = useCallback(async () => {
    try {
      setIndentLoading(true);
      setErrorMsg("");

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/get-quotation-indents`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      setIndentNumbers(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load indent numbers.");
      setIndentNumbers([]);
    } finally {
      setIndentLoading(false);
    }
  }, []);

  const fetchIndentDetails = useCallback(
    async (indentNo, force = false) => {
      if (!indentNo) return [];

      if (!force && indentCache[indentNo]) {
        return indentCache[indentNo];
      }

      try {
        setStep2Loading(true);
        setErrorMsg("");

        const res = await fetch(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/get-quotation-by-indent?indentNo=${encodeURIComponent(indentNo)}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        const rows = Array.isArray(data.data) ? data.data : [];

        setIndentCache((prev) => ({
          ...prev,
          [indentNo]: rows,
        }));

        return rows;
      } catch (err) {
        console.error(err);
        setErrorMsg("Failed to load vendor comparison data.");
        return [];
      } finally {
        setStep2Loading(false);
      }
    },
    [indentCache]
  );

  useEffect(() => {
    fetchRequests();
    fetchIndentNumbers();
  }, [fetchRequests, fetchIndentNumbers]);

  useEffect(() => {
    if (currentStep === 0) {
      fetchRequests();
    }
  }, [currentStep, fetchRequests]);

  const handleCreateApproval = () => {
    setCurrentStep(1);
    if (!indentNumbers.length) fetchIndentNumbers();
  };

  const handleNextStep = async () => {
    if (!selectedIndent) {
      setErrorMsg("Please select an indent number.");
      return;
    }

    let rows = indentCache[selectedIndent];
    if (!rows) {
      rows = await fetchIndentDetails(selectedIndent);
    }

    setSelectedUIDData(rows || []);
    setSelectedVendor("");
    setSelectedUIDs(new Set());
    setCompareText("");
    setCurrentStep(2);
  };

  // ═══ Vendor + Material Selection Logic ═══
  
  // Click on vendor card header → Toggle vendor selection
  const handleVendorClick = (vendorName, vendorItems) => {
    if (selectedVendor === vendorName) {
      // Deselect this vendor
      setSelectedVendor("");
      setSelectedUIDs(new Set());
    } else {
      // Select this vendor and ALL its materials by default
      setSelectedVendor(vendorName);
      const allUIDs = new Set(vendorItems.map((item) => item.UID));
      setSelectedUIDs(allUIDs);
    }
  };

  // Click on individual material checkbox
  const handleMaterialToggle = (uid, vendorName) => {
    // Only allow toggle if this vendor is currently selected
    if (selectedVendor !== vendorName) return;

    setSelectedUIDs((prev) => {
      const next = new Set(prev);
      if (next.has(uid)) {
        next.delete(uid);
      } else {
        next.add(uid);
      }
      return next;
    });
  };

  // Select All / Deselect All within a vendor
  const handleSelectAllForVendor = (vendorName, vendorItems) => {
    if (selectedVendor !== vendorName) {
      // First select this vendor
      setSelectedVendor(vendorName);
      setSelectedUIDs(new Set(vendorItems.map((item) => item.UID)));
    } else {
      // Toggle: if all selected, deselect all
      const allUIDs = vendorItems.map((item) => item.UID);
      const allSelected = allUIDs.every((uid) => selectedUIDs.has(uid));

      if (allSelected) {
        setSelectedUIDs(new Set());
        setSelectedVendor("");
      } else {
        setSelectedUIDs(new Set(allUIDs));
      }
    }
  };

  const callUpdateAPI = async (payload) => {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/update-approval`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Update failed");
    return data;
  };

  // ═══ NEW SAVE LOGIC ═══
  const handleSave = async () => {
    if (!selectedVendor) {
      setErrorMsg("Please select a vendor first");
      return;
    }
    if (selectedUIDs.size === 0) {
      setErrorMsg("Please select at least one material");
      return;
    }

    setActionLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      // Build approval payload
      // selected UIDs → from selected vendor → APPROVED
      // same UIDs from other vendors → AUTO REJECTED (backend handles)
      
      const approvedItems = [];
      const selectedUIDsArray = Array.from(selectedUIDs);

      selectedUIDsArray.forEach((uid) => {
        approvedItems.push({
          uid: uid,
          vendor_firm_name: selectedVendor,
        });
      });

      console.log("Sending approval:", {
        approvedItems,
        selectedVendor,
        selectedUIDs: selectedUIDsArray,
      });

      await callUpdateAPI({
        approvals: approvedItems,
        status: "Approved",
        autoRejectOthers: true, // Backend will reject same UIDs from other vendors
        selectedVendor: selectedVendor,
      });

      setSuccessMsg(
        `✅ Approved ${selectedUIDs.size} material(s) from ${selectedVendor}. Same materials from other vendors auto-rejected.`
      );

      const freshRows = await fetchIndentDetails(selectedIndent, true);
      setSelectedUIDData(freshRows);
      setSelectedVendor("");
      setSelectedUIDs(new Set());

      fetchRequests();
      fetchIndentNumbers();

      if (!freshRows.length) {
        setTimeout(() => {
          resetToStep0();
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Error updating status");
    } finally {
      setActionLoading(false);
    }
  };

  const resetToStep0 = () => {
    setCurrentStep(0);
    setSelectedIndent("");
    setSelectedUIDData([]);
    setSelectedVendor("");
    setSelectedUIDs(new Set());
    setCompareText("");
    setErrorMsg("");
    setSuccessMsg("");
  };

  // ═══ Group by VENDOR (not by material) ═══
const vendorGroups = useMemo(() => {
  const map = new Map();

  (selectedUIDData || []).forEach((item) => {
    const vendorName = item.Vendor_Ferm_Name || "Unknown Vendor";
    if (!map.has(vendorName)) {
      map.set(vendorName, {
        vendorName,
        vendorPersonName: item.Vendor_Name || "",
        vendorAddress: item.Vendor_Address || "",
        vendorContact: item.Contact_Number || "",
        vendorGST: item.Vendor_GST_No || "",
        // ═══ NEW FIELDS ═══
        transportRequired: item.IS_TRANSPORT_REQUIRED || "",
        transportCharges: parseFloat(item.EXPECTED_TRANSPORT_CHARGES) || 0,
        freightCharges: parseFloat(item.EXPECTED_FRIGHET_CHARGES) || 0,
        paymentTerms: item.Payment_Terms_Condition_Advance_Credit || "",
        items: [],
      });
    }
    map.get(vendorName).items.push(item);
  });

  return Array.from(map.values()).map((vendor) => {
    vendor.items.sort((a, b) => {
      const uidA = parseInt(a.UID) || 0;
      const uidB = parseInt(b.UID) || 0;
      return uidA - uidB;
    });

    const totalValue = vendor.items.reduce(
      (sum, item) => sum + (parseFloat(item.Total_Value) || 0),
      0
    );

    return {
      ...vendor,
      totalItems: vendor.items.length,
      totalValue,
    };
  });
}, [selectedUIDData]);

  // Calculate lowest rate per UID across all vendors (for "best price" badge)
  const lowestRatePerUID = useMemo(() => {
    const map = {};
    (selectedUIDData || []).forEach((item) => {
      const rate = parseFloat(item.Final_Rate) || Infinity;
      if (!map[item.UID] || rate < map[item.UID]) {
        map[item.UID] = rate;
      }
    });
    return map;
  }, [selectedUIDData]);

  const filteredVendorGroups = useMemo(() => {
    const q = compareText.trim().toLowerCase();
    if (!q) return vendorGroups;

    return vendorGroups.filter((vendor) => {
      const materialNames = vendor.items
        .map((i) => `${i.Material_name} ${i.UID}`)
        .join(" ");
      const haystack = `${vendor.vendorName} ${vendor.vendorPersonName} ${materialNames}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [vendorGroups, compareText]);

  const selectedTotalValue = useMemo(() => {
    if (!selectedVendor) return 0;
    const vendor = vendorGroups.find((v) => v.vendorName === selectedVendor);
    if (!vendor) return 0;

    return vendor.items
      .filter((item) => selectedUIDs.has(item.UID))
      .reduce((sum, item) => sum + (parseFloat(item.Total_Value) || 0), 0);
  }, [selectedVendor, selectedUIDs, vendorGroups]);

  if (loading && currentStep === 0) {
    return <LoadingScreen text="Loading..." subText="Fetching approvals" />;
  }

  return (
    <>
      {/* STEP 0 + STEP 1 - same as before */}
      {currentStep !== 2 && (
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          {currentStep === 0 && (
            <>
              <div
                style={{
                  background: T.card,
                  borderRadius: 10,
                  border: `1px solid ${T.border}`,
                  padding: "16px 20px",
                  marginBottom: 16,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FileText size={18} color={T.gold} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: T.navy, margin: 0 }}>
                      Approval Quotation
                    </h2>
                    <p style={{ fontSize: 12, color: T.textMuted, margin: 0 }}>
                      {requests.length} pending item{requests.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={fetchRequests}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 14px",
                      borderRadius: 8,
                      border: `1.5px solid ${T.border}`,
                      background: T.card,
                      color: T.textLight,
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    <RotateCcw size={14} /> Refresh
                  </button>

                  <button
                    onClick={handleCreateApproval}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 18px",
                      borderRadius: 8,
                      border: "none",
                      background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
                      color: T.navyDark,
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                      boxShadow: `0 2px 8px ${T.gold}40`,
                    }}
                  >
                    <Edit3 size={15} /> Create Approval
                  </button>
                </div>
              </div>

              {error && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "12px 16px", background: T.dangerBg,
                  border: `1px solid ${T.dangerBorder}`, borderRadius: 10,
                  marginBottom: 16, fontSize: 13, color: T.danger,
                }}>
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <div style={{
                background: T.card, borderRadius: 10,
                border: `1px solid ${T.border}`,
                boxShadow: "0 1px 3px rgba(0,0,0,0.03)", overflow: "hidden",
              }}>
                {requests.length === 0 ? (
                  <div style={{
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    padding: "60px 20px",
                  }}>
                    <Package size={40} style={{ color: T.border, marginBottom: 12 }} />
                    <p style={{ fontSize: 15, fontWeight: 500, color: T.textLight }}>
                      No pending approvals
                    </p>
                  </div>
                ) : (
                  <div style={{ overflowX: "auto", maxHeight: "65vh", overflowY: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                      <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
                        <tr style={{ background: T.navy }}>
                          {tableCols.map((col, i) => (
                            <th key={i} style={{
                              padding: "12px 14px", textAlign: "left",
                              color: T.goldLight, fontSize: 11, fontWeight: 700,
                              textTransform: "uppercase", letterSpacing: 0.5,
                              whiteSpace: "nowrap", minWidth: col.w,
                              borderBottom: `2px solid ${T.gold}`,
                            }}>
                              {col.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {requests.map((req, idx) => (
                          <tr key={req.UID + idx} style={{
                            background: idx % 2 === 0 ? T.card : T.borderLight,
                          }}>
                            {/* <Td>
                              <span style={{
                                display: "inline-flex", alignItems: "center", justifyContent: "center",
                                width: 26, height: 26, borderRadius: 6, background: T.borderLight,
                                fontSize: 12, fontWeight: 600, color: T.textLight,
                              }}>{idx + 1}</span>
                            </Td> */}
                            <Td>{req.PLANNED_5}</Td>
                            <Td>
                              <span style={{
                                background: `${T.navy}15`, color: T.navy,
                                padding: "3px 8px", borderRadius: 6,
                                fontSize: 12, fontWeight: 600,
                              }}>{req.UID}</span>
                            </Td>
                            <Td>
                              <span style={{
                                background: `${T.gold}15`, color: T.goldDark,
                                padding: "3px 8px", borderRadius: 6,
                                fontSize: 12, fontWeight: 600,
                              }}>{req.Req_No}</span>
                            </Td>
                            <Td maxW={140}>{req.Site_Name}</Td>
                            <Td>{req.Material_Type}</Td>
                            <Td maxW={150}>{req.Material_Name}</Td>
                            <Td>{req.Material_Size}</Td>
                            <Td maxW={120}>{req.Specification}</Td>
                            <Td>{req.SKU_Code}</Td>
                            <Td right>{req.Quantity}</Td>
                            <Td>{req.Unit_Name}</Td>
                            <Td right>{req.REVISED_QUANTITY_2}</Td>
                            <Td maxW={130}>{req["DECIDED_BRAND/COMPANY_NAME_2"]}</Td>
                            <Td>
                              <span style={{
                                background: `${T.purple}15`, color: T.purple,
                                padding: "3px 8px", borderRadius: 6,
                                fontSize: 12, fontWeight: 600,
                              }}>{req.INDENT_NUMBER_3}</span>
                            </Td>
                            <td style={{ padding: "10px 14px", borderBottom: `1px solid ${T.border}` }}>
                              {req.PDF_URL_3 ? (
                                <a href={req.PDF_URL_3} target="_blank" rel="noopener noreferrer"
                                  style={{
                                    display: "inline-flex", alignItems: "center", gap: 4,
                                    color: T.gold, fontSize: 12, fontWeight: 600, textDecoration: "none",
                                  }}>
                                  <ExternalLink size={12} /> PDF
                                </a>
                              ) : <span style={{ color: T.textMuted }}>—</span>}
                            </td>
                            <Td center>
                              <span style={{
                                background: `${T.success}15`, color: T.success,
                                padding: "3px 8px", borderRadius: 6,
                                fontSize: 12, fontWeight: 600,
                              }}>{req.No_Of_Quotation_4}</span>
                            </Td>
                            <Td maxW={110}>{req.REMARK_4}</Td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {currentStep === 1 && (
            <div style={{ maxWidth: 560 }}>
              <div style={{
                background: T.card, borderRadius: 10,
                border: `1px solid ${T.border}`, padding: "16px 20px",
                marginBottom: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <FileText size={18} color={T.gold} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: T.navy, margin: 0 }}>
                      Create Approval Quotation
                    </h2>
                    <p style={{ fontSize: 12, color: T.textMuted, margin: 0 }}>Step 1: Select Indent</p>
                  </div>
                </div>
                <button onClick={resetToStep0} style={{
                  width: 32, height: 32, borderRadius: 8, border: "none",
                  background: T.dangerBg, color: T.danger, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <X size={16} />
                </button>
              </div>

              <div style={{
                background: T.card, borderRadius: 10, border: `1px solid ${T.border}`,
                padding: "20px 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
              }}>
                {errorMsg && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
                    background: T.dangerBg, border: `1px solid ${T.dangerBorder}`,
                    borderRadius: 8, marginBottom: 16, fontSize: 13, color: T.danger,
                  }}>
                    <AlertCircle size={16} /> {errorMsg}
                  </div>
                )}

                <label style={labelStyle}>
                  Indent Number <span style={{ color: T.danger }}>*</span>
                </label>

                <div style={{ position: "relative", marginBottom: 20 }}>
                  <select
                    value={selectedIndent}
                    onChange={(e) => {
                      const indent = e.target.value;
                      setSelectedIndent(indent);
                      setErrorMsg("");
                      if (indent) fetchIndentDetails(indent);
                    }}
                    disabled={indentLoading}
                    style={{
                      ...inputBase, paddingRight: 32,
                      appearance: "none", cursor: "pointer",
                    }}
                    onFocus={focusGold}
                    onBlur={blurNormal}
                  >
                    <option value="">-- Select Indent Number --</option>
                    {indentNumbers.map((indent, i) => (
                      <option key={i} value={indent}>{indent}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} style={{
                    position: "absolute", right: 10, top: "50%",
                    transform: "translateY(-50%)", color: T.textMuted, pointerEvents: "none",
                  }} />
                </div>

                {(indentLoading || (selectedIndent && step2Loading)) && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    fontSize: 13, color: T.textMuted, marginBottom: 16,
                  }}>
                    <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                    {indentLoading ? "Loading..." : "Preloading vendor data..."}
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                  <button onClick={resetToStep0} style={{
                    padding: "10px 20px", borderRadius: 8,
                    border: `1.5px solid ${T.border}`, background: T.card,
                    color: T.textLight, fontSize: 13, fontWeight: 600, cursor: "pointer",
                  }}>Cancel</button>

                  <button
                    onClick={handleNextStep}
                    disabled={!selectedIndent || indentLoading || step2Loading}
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "10px 24px", borderRadius: 8, border: "none",
                      background: selectedIndent && !indentLoading
                        ? `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`
                        : T.border,
                      color: selectedIndent && !indentLoading ? T.navyDark : T.textMuted,
                      fontSize: 13, fontWeight: 700,
                      cursor: selectedIndent && !indentLoading ? "pointer" : "not-allowed",
                      opacity: selectedIndent ? 1 : 0.6,
                      boxShadow: selectedIndent ? `0 2px 8px ${T.gold}40` : "none",
                    }}
                  >
                    Next <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ STEP 2 - NEW VENDOR-FIRST VIEW ═══ */}
      {currentStep === 2 && (
        <div style={{
          position: "fixed", inset: 0,
          width: "100vw", height: "100vh",
          background: T.bg, zIndex: 9999,
          display: "flex", flexDirection: "column",
        }}>
          {/* Header */}
          <div style={{
            background: T.navy, padding: "10px 20px",
            borderBottom: `2px solid ${T.gold}`,
            display: "flex", alignItems: "center",
            justifyContent: "space-between", flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button onClick={() => {
                setCurrentStep(1);
                setSelectedUIDData([]);
                setSelectedVendor("");
                setSelectedUIDs(new Set());
              }} style={{
                width: 32, height: 32, borderRadius: 8, border: "none",
                background: "rgba(255,255,255,0.1)", color: "white",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <ArrowLeft size={16} />
              </button>

              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "white", margin: 0 }}>
                  Vendor-wise Approval — <span style={{ color: T.gold }}>{selectedIndent}</span>
                </h3>
                <p style={{ fontSize: 11, color: "#cbd5e1", margin: 0 }}>
                  Select ONE vendor and choose materials to approve
                </p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {selectedVendor && selectedUIDs.size > 0 && (
                <button onClick={handleSave} disabled={actionLoading} style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "7px 16px", borderRadius: 8, border: "none",
                  background: `linear-gradient(135deg, ${T.success}, #059669)`,
                  color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer",
                }}>
                  {actionLoading ? (
                    <>
                      <Loader2 size={13} style={{ animation: "spin 0.8s linear infinite" }} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={13} />
                      Approve ({selectedUIDs.size})
                    </>
                  )}
                </button>
              )}

              <button onClick={resetToStep0} style={{
                width: 32, height: 32, borderRadius: 8, border: "none",
                background: "rgba(239,68,68,0.15)", color: "#fca5a5",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div style={{
            padding: "10px 20px", background: T.card,
            borderBottom: `1px solid ${T.border}`,
            display: "flex", alignItems: "center", gap: 10,
            flexShrink: 0, flexWrap: "wrap",
          }}>
            <div style={{ position: "relative", minWidth: 280, flex: 1 }}>
              <Search size={14} style={{
                position: "absolute", left: 10, top: "50%",
                transform: "translateY(-50%)", color: T.textMuted,
              }} />
              <input
                value={compareText}
                onChange={(e) => setCompareText(e.target.value)}
                placeholder="Search by vendor name or material..."
                style={{ ...inputBase, background: "white", paddingLeft: 32 }}
                onFocus={focusGold}
                onBlur={blurNormal}
              />
            </div>

            {selectedVendor && (
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 12px", borderRadius: 6,
                background: `${T.success}15`,
                color: T.success, fontSize: 12, fontWeight: 700,
              }}>
                <CheckCircle size={13} />
                Vendor Locked: {selectedVendor}
                <button onClick={() => {
                  setSelectedVendor("");
                  setSelectedUIDs(new Set());
                }} style={{
                  marginLeft: 4, background: "transparent",
                  border: "none", color: T.success,
                  cursor: "pointer", padding: 0,
                  display: "flex", alignItems: "center",
                }}>
                  <X size={13} />
                </button>
              </div>
            )}
          </div>

          {/* Messages */}
          {(successMsg || errorMsg) && (
            <div style={{ padding: "8px 20px", flexShrink: 0 }}>
              {successMsg && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 14px", background: T.successBg,
                  border: `1px solid ${T.successBorder}`, borderRadius: 6,
                  fontSize: 12, color: "#065f46",
                  marginBottom: errorMsg ? 8 : 0,
                }}>
                  <CheckCircle size={14} color={T.success} /> {successMsg}
                </div>
              )}
              {errorMsg && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 14px", background: T.dangerBg,
                  border: `1px solid ${T.dangerBorder}`, borderRadius: 6,
                  fontSize: 12, color: T.danger,
                }}>
                  <AlertCircle size={14} /> {errorMsg}
                </div>
              )}
            </div>
          )}

          {/* Main Content - VENDOR CARDS */}
          <div style={{
            flex: 1, overflow: "auto", padding: "16px 20px",
            width: "100%", boxSizing: "border-box",
          }}>
            {step2Loading && (!selectedUIDData || selectedUIDData.length === 0) ? (
              <LoadingScreen text="Loading..." subText="Preparing vendor view" />
            ) : !selectedUIDData || selectedUIDData.length === 0 ? (
              <div style={{
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", height: "100%",
              }}>
                <Package size={40} style={{ color: T.border, marginBottom: 12 }} />
                <p style={{ fontSize: 15, fontWeight: 500, color: T.textLight }}>
                  No quotations found
                </p>
              </div>
            ) : (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
                gap: 16, width: "100%",
              }}>
                {filteredVendorGroups.map((vendor, vIdx) => {
                  const isThisVendorSelected = selectedVendor === vendor.vendorName;
                  const isDisabled = selectedVendor && !isThisVendorSelected;
                  const allUIDsForVendor = vendor.items.map((i) => i.UID);
                  const allSelected = allUIDsForVendor.every((uid) => selectedUIDs.has(uid));
                  const someSelected = allUIDsForVendor.some((uid) => selectedUIDs.has(uid));

                  return (
                    <div
                      key={vendor.vendorName + vIdx}
                      style={{
                        background: T.card,
                        borderRadius: 12,
                        border: isThisVendorSelected
                          ? `3px solid ${T.gold}`
                          : isDisabled
                          ? `2px solid ${T.border}`
                          : `2px solid ${T.border}`,
                        overflow: "hidden",
                        opacity: isDisabled ? 0.5 : 1,
                        transition: "all 0.3s ease",
                        boxShadow: isThisVendorSelected
                          ? `0 4px 16px ${T.gold}30`
                          : "0 1px 4px rgba(0,0,0,0.04)",
                        position: "relative",
                      }}
                    >
                      {/* Disabled Overlay */}
                      {isDisabled && (
                        <div style={{
                          position: "absolute", inset: 0,
                          background: "rgba(255,255,255,0.5)",
                          zIndex: 2,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexDirection: "column", gap: 8,
                          backdropFilter: "blur(2px)",
                          pointerEvents: "none",
                        }}>
                          <Lock size={28} color={T.textMuted} />
                          <span style={{
                            fontSize: 12, color: T.textLight, fontWeight: 700,
                            background: T.card, padding: "6px 12px",
                            borderRadius: 6, border: `1px solid ${T.border}`,
                          }}>
                            Other vendor selected
                          </span>
                        </div>
                      )}

                      {/* Vendor Header - Clickable */}
                     {/* Vendor Header - Clickable */}
<div
  onClick={() => !isDisabled && handleVendorClick(vendor.vendorName, vendor.items)}
  style={{
    padding: "16px 18px",
    background: isThisVendorSelected
      ? `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`
      : `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`,
    color: isThisVendorSelected ? T.navyDark : "white",
    cursor: isDisabled ? "not-allowed" : "pointer",
    borderBottom: `2px solid ${isThisVendorSelected ? T.goldDark : T.gold}`,
  }}
>
  {/* Top Row: Vendor Name + Select All */}
  <div style={{
    display: "flex", alignItems: "center",
    justifyContent: "space-between", gap: 10, marginBottom: 12,
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, overflow: "hidden" }}>
      <div style={{
        width: 42, height: 42, borderRadius: 8,
        background: isThisVendorSelected ? T.navyDark : T.gold,
        color: isThisVendorSelected ? T.gold : T.navyDark,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Building2 size={22} />
      </div>
      <div style={{ flex: 1, overflow: "hidden" }}>
        <div style={{
          fontSize: 16, fontWeight: 800,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {vendor.vendorName}
        </div>
        <div style={{
          fontSize: 11, opacity: 0.85,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          👤 {vendor.vendorPersonName || "—"} | 📞 {vendor.vendorContact || "—"}
        </div>
      </div>
    </div>

    {/* Select All Button */}
    <button
      onClick={(e) => {
        e.stopPropagation();
        if (!isDisabled) {
          handleSelectAllForVendor(vendor.vendorName, vendor.items);
        }
      }}
      disabled={isDisabled}
      style={{
        padding: "7px 14px",
        borderRadius: 6,
        border: "none",
        background: isThisVendorSelected && allSelected
          ? T.danger
          : isThisVendorSelected
          ? T.navyDark
          : "rgba(255,255,255,0.2)",
        color: "white",
        fontSize: 11,
        fontWeight: 700,
        cursor: isDisabled ? "not-allowed" : "pointer",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      {isThisVendorSelected && allSelected
        ? "❌ Deselect All"
        : "✓ Select All"}
    </button>
  </div>

  {/* ═══ BIG TOTAL AMOUNT DISPLAY ═══ */}
  {/* <div style={{
    background: isThisVendorSelected
      ? "rgba(0,0,0,0.15)"
      : "rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: "12px 14px",
    marginBottom: 10,
    border: isThisVendorSelected
      ? "2px solid rgba(0,0,0,0.2)"
      : "2px solid rgba(245,158,11,0.3)",
  }}>
    <div style={{
      display: "flex", alignItems: "center",
      justifyContent: "space-between", flexWrap: "wrap", gap: 8,
    }}>
      <div>
        <div style={{
          fontSize: 10,
          opacity: 0.85,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          marginBottom: 2,
        }}>
          💰 Grand Total (All Materials + Transport)
        </div>
        <div style={{
          fontSize: 24,
          fontWeight: 900,
          lineHeight: 1.1,
          color: isThisVendorSelected ? T.navyDark : T.goldLight,
        }}>
          ₹{(vendor.totalValue + (vendor.transportCharges || 0)).toLocaleString("en-IN")}
        </div>
      </div>

      <div style={{
        display: "flex", flexDirection: "column",
        alignItems: "flex-end", gap: 2, fontSize: 11,
      }}>
        <div style={{ opacity: 0.85 }}>
          Materials: <strong>₹{vendor.totalValue.toLocaleString("en-IN")}</strong>
        </div>
        {vendor.transportCharges > 0 && (
          <div style={{ opacity: 0.85 }}>
            🚚 Transport: <strong>₹{vendor.transportCharges.toLocaleString("en-IN")}</strong>
          </div>
        )}
        {vendor.freightCharges > 0 && (
          <div style={{ opacity: 0.85 }}>
            📦 Freight: <strong>₹{vendor.freightCharges.toLocaleString("en-IN")}</strong>
          </div>
        )}
      </div>
    </div>
  </div> */}



{/* ═══ GRAND TOTAL = Only Materials (Qty × Rate sum) ═══ */}
{(() => {
  // Calculate proper total from qty × finalRate for each item
  const materialTotal = vendor.items.reduce((sum, item) => {
    const qty = parseFloat(item.Total_Quantity) || 0;
    const rate = parseFloat(item.Final_Rate) || 0;
    const itemTotal = qty * rate;
    return sum + (itemTotal > 0 ? itemTotal : (parseFloat(item.Total_Value) || 0));
  }, 0);

  return (
    <div style={{
      background: isThisVendorSelected
        ? "rgba(0,0,0,0.15)"
        : "rgba(255,255,255,0.1)",
      borderRadius: 10,
      padding: "12px 14px",
      marginBottom: 10,
      border: isThisVendorSelected
        ? "2px solid rgba(0,0,0,0.2)"
        : "2px solid rgba(245,158,11,0.3)",
    }}>
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between", flexWrap: "wrap", gap: 8,
      }}>
        {/* Left: Grand Total (Materials Only) */}
        <div>
          <div style={{
            fontSize: 10, opacity: 0.85, fontWeight: 600,
            textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2,
          }}>
            💰 Grand Total (All Materials)
          </div>
          <div style={{
            fontSize: 26, fontWeight: 900, lineHeight: 1.1,
            color: isThisVendorSelected ? T.navyDark : T.goldLight,
          }}>
            ₹{materialTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Right: Breakdown */}
        <div style={{
          display: "flex", flexDirection: "column",
          alignItems: "flex-end", gap: 3, fontSize: 11,
        }}>
          <div style={{ opacity: 0.85 }}>
            📦 {vendor.totalItems} Material{vendor.totalItems !== 1 ? 's' : ''}
          </div>
          {vendor.transportCharges > 0 && (
            <div style={{
              opacity: 0.9, background: "rgba(239,68,68,0.15)",
              padding: "2px 8px", borderRadius: 4,
            }}>
              🚚 Transport: <strong>₹{vendor.transportCharges.toLocaleString("en-IN")}</strong>
              <span style={{ fontSize: 9, opacity: 0.7 }}> (separate)</span>
            </div>
          )}
          {vendor.freightCharges > 0 && (
            <div style={{
              opacity: 0.9, background: "rgba(139,92,246,0.15)",
              padding: "2px 8px", borderRadius: 4,
            }}>
              📦 Freight: <strong>₹{vendor.freightCharges.toLocaleString("en-IN")}</strong>
              <span style={{ fontSize: 9, opacity: 0.7 }}> (separate)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
})()}

  {/* Bottom Stats Row */}
  <div style={{
    display: "flex", alignItems: "center",
    gap: 8, fontSize: 11, flexWrap: "wrap",
  }}>
    <span style={{
      background: isThisVendorSelected ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.15)",
      padding: "4px 10px", borderRadius: 4, fontWeight: 700,
    }}>
      📦 {vendor.totalItems} Material{vendor.totalItems !== 1 ? "s" : ""}
    </span>

    {vendor.transportRequired === "Yes" && (
      <span style={{
        background: isThisVendorSelected ? "rgba(239,68,68,0.2)" : "rgba(239,68,68,0.3)",
        color: isThisVendorSelected ? T.danger : "#fecaca",
        padding: "4px 10px", borderRadius: 4, fontWeight: 700,
      }}>
        🚚 Transport Required
      </span>
    )}

    {vendor.transportRequired === "No" && (
      <span style={{
        background: isThisVendorSelected ? "rgba(16,185,129,0.2)" : "rgba(16,185,129,0.3)",
        color: isThisVendorSelected ? T.success : "#a7f3d0",
        padding: "4px 10px", borderRadius: 4, fontWeight: 700,
      }}>
        ✓ Free Delivery
      </span>
    )}

    {vendor.paymentTerms && (
      <span style={{
        background: isThisVendorSelected ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.15)",
        padding: "4px 10px", borderRadius: 4, fontWeight: 600,
      }}>
        💳 {vendor.paymentTerms}
      </span>
    )}

    {isThisVendorSelected && (
      <span style={{
        background: T.success, color: "white",
        padding: "4px 10px", borderRadius: 4, fontWeight: 700,
        marginLeft: "auto",
      }}>
        ✓ {selectedUIDs.size}/{vendor.totalItems} Selected
      </span>
    )}
  </div>
</div>

                      {/* Materials List */}
                      <div style={{ padding: "10px 12px" }}>
                        <div style={{
                          fontSize: 10, fontWeight: 700,
                          color: T.textMuted, marginBottom: 8,
                          textTransform: "uppercase", letterSpacing: 0.5,
                        }}>
                          Materials Provided ({vendor.items.length})
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {vendor.items.map((item, iIdx) => {
                            const isItemSelected = selectedUIDs.has(item.UID);
                            const finalRate = parseFloat(item.Final_Rate) || 0;
                            const lowestRate = lowestRatePerUID[item.UID] || 0;
                            const isLowest = finalRate > 0 && finalRate === lowestRate;
                            const canInteract = !isDisabled && isThisVendorSelected;

                            return (
                              <div
                                key={item.UID + iIdx}
                                onClick={() => canInteract && handleMaterialToggle(item.UID, vendor.vendorName)}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                  padding: "8px 10px",
                                  borderRadius: 6,
                                  background: isItemSelected && isThisVendorSelected
                                    ? `${T.gold}15`
                                    : isLowest && !isDisabled
                                    ? `${T.success}08`
                                    : T.borderLight,
                                  border: `1.5px solid ${
                                    isItemSelected && isThisVendorSelected
                                      ? T.gold
                                      : isLowest && !isDisabled
                                      ? T.success
                                      : "transparent"
                                  }`,
                                  cursor: canInteract ? "pointer" : "default",
                                  transition: "all 0.15s ease",
                                }}
                              >
                                {/* Checkbox */}
                                <div style={{
                                  width: 18, height: 18, borderRadius: 4,
                                  flexShrink: 0,
                                  border: `2px solid ${isItemSelected && isThisVendorSelected ? T.gold : "#d1d5db"}`,
                                  background: isItemSelected && isThisVendorSelected ? T.gold : "white",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                }}>
                                  {isItemSelected && isThisVendorSelected && (
                                    <Check size={11} color={T.navyDark} strokeWidth={3} />
                                  )}
                                </div>

                                {/* UID Badge */}
                                <span style={{
                                  background: T.navy, color: T.gold,
                                  padding: "2px 6px", borderRadius: 4,
                                  fontSize: 10, fontWeight: 700,
                                  flexShrink: 0,
                                }}>
                                  {item.UID}
                                </span>

                                {/* Material Info */}
                                <div style={{ flex: 1, overflow: "hidden" }}>
                                  <div style={{
                                    fontSize: 12, fontWeight: 700, color: T.navy,
                                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                                  }}>
                                    {item.Material_name}
                                  </div>
                                  <div style={{
                                    fontSize: 10, color: T.textMuted, display: "flex",
                                    gap: 6, marginTop: 2, flexWrap: "wrap",
                                  }}>
                                    {item.Material_Size && (
                                      <span>📏 {item.Material_Size}</span>
                                    )}
                                    {item.Total_Quantity && (
                                      <span>📦 Qty: {item.Total_Quantity}</span>
                                    )}
                                  </div>
                                </div>

                                {/* Rate */}
                              {/* Rate + Qty × Rate = Total */}
{(() => {
  const qty = parseFloat(item.Total_Quantity) || 0;
  const totalVal = parseFloat(item.Total_Value) || 0;
  // Agar Total_Value galat hai to manually calculate
  const calculatedTotal = qty > 0 && finalRate > 0 ? qty * finalRate : totalVal;
  const displayTotal = calculatedTotal > 0 ? calculatedTotal : totalVal;

  return (
    <div style={{
      textAlign: "right", flexShrink: 0,
      display: "flex", flexDirection: "column", gap: 2,
      minWidth: 130,
    }}>
      <div style={{
        fontSize: 14, fontWeight: 800,
        color: isLowest ? T.success : T.navy,
        lineHeight: 1,
      }}>
        ₹{finalRate.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
        <span style={{ fontSize: 9, fontWeight: 500, color: T.textMuted }}> /unit</span>
      </div>
      <div style={{ fontSize: 10, color: T.textLight, marginTop: 2 }}>
        {qty || '—'} × ₹{finalRate.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
      </div>
      <div style={{
        fontSize: 13, fontWeight: 800, color: T.navy,
        background: isLowest ? `${T.success}15` : T.borderLight,
        padding: '3px 8px', borderRadius: 5, marginTop: 2,
        border: isLowest ? `1px solid ${T.success}40` : 'none',
      }}>
        = ₹{displayTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
      {isLowest && (
        <div style={{
          background: T.success, color: "white",
          fontSize: 8, fontWeight: 700,
          padding: "2px 6px", borderRadius: 8,
          marginTop: 2, textAlign: "center",
        }}>
          ★ BEST PRICE
        </div>
      )}
    </div>
  );
})()}
                              </div>
                            );
                          })}
                        </div>

                        {/* Vendor Footer */}
                        <div style={{
                          marginTop: 10, paddingTop: 10,
                          borderTop: `1px dashed ${T.border}`,
                          fontSize: 10, color: T.textMuted,
                          display: "flex", justifyContent: "space-between", gap: 8,
                        }}>
                          <span>🆔 GST: {vendor.vendorGST || "—"}</span>
                          <span>📞 {vendor.vendorContact || "—"}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: "12px 20px", borderTop: "2px solid #e5e7eb",
            background: T.card, flexShrink: 0,
            display: "flex", alignItems: "center",
            justifyContent: "space-between", gap: 12, flexWrap: "wrap",
          }}>
            <div style={{ fontSize: 12 }}>
              {selectedVendor && selectedUIDs.size > 0 ? (
                <div style={{ color: T.navy }}>
                  <strong style={{ color: T.success, fontSize: 14 }}>
                    ✓ {selectedUIDs.size}
                  </strong>{" "}
                  material(s) from{" "}
                  <strong style={{ color: T.gold }}>{selectedVendor}</strong>
                  <span style={{ color: T.textMuted }}> | Total: </span>
                  <strong style={{ color: T.success }}>
                    ₹{selectedTotalValue.toLocaleString("en-IN")}
                  </strong>
                  <div style={{ fontSize: 10, color: T.danger, marginTop: 4 }}>
                    ⚠️ Same materials from other vendors will be auto-rejected
                  </div>
                </div>
              ) : (
                <span style={{ color: T.textMuted }}>
                  Select a vendor and choose materials to approve
                </span>
              )}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => {
                setCurrentStep(1);
                setSelectedUIDData([]);
                setSelectedVendor("");
                setSelectedUIDs(new Set());
              }} style={{
                padding: "9px 18px", borderRadius: 8,
                border: "1.5px solid #e5e7eb", background: "white",
                color: "#374151", fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}>← Back</button>

              <button
                onClick={handleSave}
                disabled={!selectedVendor || selectedUIDs.size === 0 || actionLoading}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "9px 24px", borderRadius: 8, border: "none",
                  background: selectedVendor && selectedUIDs.size > 0
                    ? `linear-gradient(135deg, ${T.success}, #059669)`
                    : "#e5e7eb",
                  color: selectedVendor && selectedUIDs.size > 0 ? "white" : "#9ca3af",
                  fontSize: 13, fontWeight: 700,
                  cursor: selectedVendor && selectedUIDs.size > 0 ? "pointer" : "not-allowed",
                  boxShadow: selectedVendor && selectedUIDs.size > 0
                    ? "0 2px 8px rgba(16,185,129,0.3)" : "none",
                }}
              >
                {actionLoading ? (
                  <>
                    <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle size={14} />
                    Approve {selectedUIDs.size > 0 ? `(${selectedUIDs.size})` : ""}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
};

export default Approval_Quotation;