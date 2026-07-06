

import React, { useState, useEffect } from 'react';
import {
  Loader2, AlertCircle, CheckCircle, X, ChevronDown,
  RotateCcw, Package, FileText, ArrowLeft, ArrowRight,
  Check, Plus, ExternalLink, Share2, Search,
  Calendar, ShoppingCart, Edit2
} from 'lucide-react';

const T = {
  navy: '#1e293b', navyLight: '#334155', navyDark: '#0f172a',
  gold: '#f59e0b', goldLight: '#fbbf24', goldDark: '#d97706',
  bg: '#f8fafc', card: '#ffffff', text: '#1e293b',
  textLight: '#64748b', textMuted: '#94a3b8',
  border: '#e2e8f0', borderLight: '#f1f5f9',
  success: '#10b981', successBg: '#ecfdf5', successBorder: '#a7f3d0',
  danger: '#ef4444', dangerBg: '#fef2f2', dangerBorder: '#fecaca',
  purple: '#7c3aed', purpleBg: '#f5f3ff',
  warning: '#f59e0b', warningBg: '#fffbeb',
};

const labelStyle = {
  display: 'block', fontSize: 12, fontWeight: 600,
  color: T.navyLight, marginBottom: 6, letterSpacing: 0.3,
};
const inputBase = {
  width: '100%', padding: '9px 12px', fontSize: 13,
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

const LoadingScreen = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px' }}>
    <div style={{
      width: 56, height: 56, borderRadius: 14,
      background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: 20, boxShadow: `0 0 0 3px ${T.gold}30`,
    }}>
      <Loader2 size={28} color={T.gold} style={{ animation: 'spin 1s linear infinite' }} />
    </div>
    <p style={{ fontSize: 15, fontWeight: 600, color: T.navy, marginBottom: 4 }}>Loading PO Data...</p>
    <p style={{ fontSize: 13, color: T.textMuted }}>Fetching pending purchase orders</p>
    <div style={{ width: 180, height: 3, borderRadius: 3, background: T.border, marginTop: 20, overflow: 'hidden' }}>
      <div style={{
        width: '40%', height: '100%', borderRadius: 3,
        background: `linear-gradient(90deg, ${T.gold}, ${T.goldLight})`,
        animation: 'loadingBar 1.5s ease-in-out infinite',
      }} />
    </div>
    <style>{`
      @keyframes spin{to{transform:rotate(360deg)}}
      @keyframes loadingBar{0%{transform:translateX(-100%)}50%{transform:translateX(150%)}100%{transform:translateX(350%)}}
    `}</style>
  </div>
);

const Td = ({ children, right, maxW, center }) => (
  <td style={{
    padding: '10px 14px', fontSize: 13, color: T.text,
    borderBottom: `1px solid ${T.border}`, whiteSpace: 'nowrap',
    textAlign: right ? 'right' : center ? 'center' : 'left',
  }}>
    {maxW ? (
      <span title={typeof children === 'string' ? children : ''} style={{
        display: 'block', maxWidth: maxW, overflow: 'hidden', textOverflow: 'ellipsis',
      }}>{children || <span style={{ color: T.textMuted }}>—</span>}</span>
    ) : (children || <span style={{ color: T.textMuted }}>—</span>)}
  </td>
);

// ✅ Helper - GST combined value calculate karo
const getGSTDisplay = (item) => {
  const cgst = parseFloat(item.CGST_5 || item.cgst || 0) || 0;
  const sgst = parseFloat(item.SGST_5 || item.sgst || 0) || 0;
  const igst = parseFloat(item.IGST_5 || item.igst || 0) || 0;

  if (igst > 0) return `${igst}%`;
  if (cgst > 0) return `${(cgst + sgst).toFixed(0)}%`;
  return '0%';
};

const PO = () => {
  const [requests, setRequests]                 = useState([]);
  const [supervisors, setSupervisors]           = useState([]);
  const [loading, setLoading]                   = useState(true);
  const [error, setError]                       = useState(null);
  const [showModal, setShowModal]               = useState(false);
  const [step, setStep]                         = useState(1);
  const [selectedQuotation, setSelectedQuotation] = useState('');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [selectedItems, setSelectedItems]       = useState([]);
  const [generateLoading, setGenerateLoading]   = useState(false);
  const [pdfUrl, setPdfUrl]                     = useState(null);
  const [showSuccessBox, setShowSuccessBox]     = useState(false);

  const [activeTab, setActiveTab]   = useState('create');
  const [isAdmin, setIsAdmin]       = useState(() => sessionStorage.getItem('userType') === 'admin');
  const [adminGrouped, setAdminGrouped] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(null);
  const [poSearch, setPoSearch]     = useState('');

  // ── Fetch ──
  const fetchRequests = async () => {
    try {
      setLoading(true); setError(null);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/get-po-data`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setRequests(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error(err); setError('Data not available'); setRequests([]);
    } finally { setLoading(false); }
  };

  const fetchSupervisors = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/get-othersheet-data`);
      if (response.ok) setSupervisors(await response.json());
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchRequests(); fetchSupervisors(); }, []);

  const fetchAdminPOs = async () => {
    setAdminLoading(true); setUpdateSuccess(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/get-po-data-admin`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setAdminGrouped(data.grouped || []);
    } catch (err) {
      console.error(err); setAdminGrouped([]);
    } finally { setAdminLoading(false); }
  };

  useEffect(() => {
    if (activeTab === 'edit' && isAdmin) fetchAdminPOs();
  }, [activeTab, isAdmin]);

  const handleUpdatePO = async (poNumber) => {
    if (!confirm(`Update "${poNumber}" PDF?\nMake sure rates are updated in sheet first.`)) return;
    setUpdateLoading(true); setUpdateSuccess(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/update-po-pdf`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poNumber }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      setUpdateSuccess({ poNumber, newPdfUrl: result.newPdfUrl, message: result.message });
      await fetchAdminPOs();
    } catch (err) {
      alert('Failed: ' + err.message);
    } finally { setUpdateLoading(false); }
  };

  const uniqueQuotations = [...new Set(requests.map(r => r.QUOTATION_NO_5).filter(Boolean))];

  const handleNext = () => {
    if (selectedQuotation) {
      const items = requests.filter(r => r.QUOTATION_NO_5 === selectedQuotation);
      setSelectedItems(items);
      setStep(2);
    }
  };

  // ✅ handleGeneratePO - Material_Specification add kiya
  const handleGeneratePO = async () => {
    if (!expectedDeliveryDate || !selectedItems.length) {
      alert('Fill all required fields'); return;
    }
    setGenerateLoading(true);

    const siteName = selectedItems[0]?.Site_Name || 'N/A';
    const matchedSupervisor = supervisors.find(s =>
      String(s.Site_Name || '').trim() === String(siteName).trim()
    );

    const poData = {
      quotationNo: selectedQuotation,
      expectedDeliveryDate,
      items: selectedItems.map(item => ({
        uid:           item.UID,
        UID:           item.UID,
        Material_Name: item.Material_Name,
        materialName:  item.Material_Name,
        Material_Size: item.Material_Size || '',
        materialSize:  item.Material_Size || '',
        // ✅ NEW - Specification
        Material_Specification: item.Material_Specification || '',
        materialSpecification:  item.Material_Specification || '',
        remark:        item.Remark5 ? String(item.Remark5).trim() : '',
        Remark5:       item.Remark5 || '',
        vendorFirm:    item.Vendor_Firm_Name_5 || 'N/A',
        rate:          item.Rate_5,
        Rate_5:        item.Rate_5,
        discount:      item.DISCOUNT_5 || '0',
        DISCOUNT_5:    item.DISCOUNT_5 || '0',
        cgst:          item.CGST_5,
        CGST_5:        item.CGST_5,
        sgst:          item.SGST_5,
        SGST_5:        item.SGST_5,
        igst:          item.IGST_5,
        IGST_5:        item.IGST_5,
        finalRate:     item.FINAL_RATE_5,
        FINAL_RATE_5:  item.FINAL_RATE_5,
        quantity:      item.REVISED_QUANTITY_2,
        REVISED_QUANTITY_2: item.REVISED_QUANTITY_2,
        unit:          item.Unit_Name,
        Unit_Name:     item.Unit_Name,
        totalValue:    item.TOTAL_VALUE_5,
        TOTAL_VALUE_5: item.TOTAL_VALUE_5,
        indentNo:      item.INDENT_NUMBER_3,
        IS_TRANSPORT_REQUIRED:      item.IS_TRANSPORT_REQUIRED || '',
        EXPECTED_TRANSPORT_CHARGES: item.EXPECTED_TRANSPORT_CHARGES || '',
        FREIGHT_CHARGES:            item.FREIGHT_CHARGES || '',
      })),
      siteName,
      siteLocation:      matchedSupervisor?.Site_Location || 'N/A',
      supervisorName:    matchedSupervisor?.Supervisor    || 'N/A',
      supervisorContact: matchedSupervisor?.Contact_No   || '-',
      vendorName:        selectedItems[0]?.Vendor_Firm_Name_5 || 'N/A',
      vendorAddress:     selectedItems[0]?.Vendor_Address_5   || 'N/A',
      vendorGST:         selectedItems[0]?.Vendor_GST_No_5    || 'N/A',
      vendorContact:     selectedItems[0]?.Vendor_Contact_5   || 'N/A',
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/create-po`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(poData),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      if (result.pdfUrl) {
        setPdfUrl(result.pdfUrl);
        setShowModal(false);
        setSelectedQuotation(''); setExpectedDeliveryDate(''); setSelectedItems([]);
        setShowSuccessBox(true);
        await fetchRequests();
      }
    } catch (err) {
      alert('Failed: ' + err.message);
    } finally { setGenerateLoading(false); }
  };

  const handleShare = async (url) => {
    if (!url) return;
    if (navigator.share) {
      try { await navigator.share({ title: 'PO PDF', url }); return; } catch (err) { }
    }
    try { await navigator.clipboard.writeText(url); alert('URL copied!'); } catch (err) { }
  };

  // ✅ Table columns - Size ke baad Specification add kiya
  const tableCols = [
    { label: '#', w: 50 }, { label: 'Planned', w: 100 },
    { label: 'UID', w: 60 }, { label: 'Req No', w: 90 },
    { label: 'Site', w: 130 }, { label: 'Material', w: 160 },
    { label: 'Size', w: 90 },
    { label: 'Specification', w: 140 },  // ✅ NEW
    { label: 'Qty', w: 70 }, { label: 'Unit', w: 70 },
    { label: 'Quotation', w: 110 }, { label: 'Vendor', w: 140 },
    { label: 'Final Rate', w: 100 }, { label: 'Total', w: 110 },
  ];

  const grandTotal = selectedItems.reduce((sum, item) => {
    const v = parseFloat(String(item.TOTAL_VALUE_5 || '0').replace(/[₹,\s]/g, '')) || 0;
    return sum + v;
  }, 0);

  if (loading && activeTab === 'create') return <LoadingScreen />;

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>

      {/* ── Header ── */}
      <div style={{
        background: T.card, borderRadius: 10, border: `1px solid ${T.border}`,
        padding: '16px 20px', marginBottom: 16,
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ShoppingCart size={18} color={T.gold} />
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: T.navy, margin: 0 }}>Purchase Order</h2>
            <p style={{ fontSize: 12, color: T.textMuted, margin: 0 }}>
              {activeTab === 'create' ? `${requests.length} pending items` : `${adminGrouped.length} POs`}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {isAdmin && (
            <div style={{ display: 'flex', gap: 4, background: T.borderLight, padding: 4, borderRadius: 8 }}>
              <button onClick={() => setActiveTab('create')} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '7px 14px', borderRadius: 6, border: 'none',
                background: activeTab === 'create' ? T.card : 'transparent',
                color: activeTab === 'create' ? T.navy : T.textLight,
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                boxShadow: activeTab === 'create' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}><Plus size={13} /> Create PO</button>
              <button onClick={() => setActiveTab('edit')} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '7px 14px', borderRadius: 6, border: 'none',
                background: activeTab === 'edit' ? T.card : 'transparent',
                color: activeTab === 'edit' ? T.navy : T.textLight,
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                boxShadow: activeTab === 'edit' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}><Edit2 size={13} /> Edit PO</button>
            </div>
          )}

          {activeTab === 'create' && (
            <>
              <button onClick={fetchRequests} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 8,
                border: `1.5px solid ${T.border}`, background: T.card,
                color: T.textLight, fontSize: 13, fontWeight: 500, cursor: 'pointer',
              }}><RotateCcw size={14} /> Refresh</button>
              <button onClick={() => {
                setShowModal(true); setStep(1);
                setSelectedQuotation(''); setExpectedDeliveryDate('');
                setSelectedItems([]); setPdfUrl(null); setShowSuccessBox(false);
              }} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 18px', borderRadius: 8, border: 'none',
                background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
                color: T.navyDark, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                boxShadow: `0 2px 8px ${T.gold}40`,
              }}><Plus size={15} /> Create PO</button>
            </>
          )}
        </div>
      </div>

      {/* ── Success Box ── */}
      {showSuccessBox && pdfUrl && (
        <div style={{
          background: T.successBg, border: `1px solid ${T.successBorder}`,
          borderRadius: 10, padding: '14px 18px', marginBottom: 16,
          borderLeft: `3px solid ${T.success}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CheckCircle size={20} color={T.success} />
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#065f46', margin: 0 }}>PO Generated Successfully!</p>
              <p style={{ fontSize: 12, color: T.textLight, margin: 0 }}>PDF is ready to view and share</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '7px 14px', borderRadius: 8,
              background: T.navy, color: T.gold, fontSize: 12, fontWeight: 600,
              textDecoration: 'none',
            }}><ExternalLink size={13} /> View PDF</a>
            <button onClick={() => handleShare(pdfUrl)} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '7px 14px', borderRadius: 8, border: 'none',
              background: T.success, color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}><Share2 size={13} /> Share</button>
            <button onClick={() => setShowSuccessBox(false)} style={{
              padding: '7px 10px', borderRadius: 8, border: 'none',
              background: 'transparent', color: T.textMuted, cursor: 'pointer',
            }}><X size={14} /></button>
          </div>
        </div>
      )}

      {/* ── CREATE TAB ── */}
      {activeTab === 'create' && (
        <div style={{
          background: T.card, borderRadius: 10, border: `1px solid ${T.border}`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)', overflow: 'hidden',
        }}>
          {error ? (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <AlertCircle size={40} color={T.danger} style={{ marginBottom: 12 }} />
              <p style={{ fontSize: 14, color: T.danger }}>{error}</p>
            </div>
          ) : requests.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
              <Package size={40} color={T.border} style={{ marginBottom: 12 }} />
              <p style={{ fontSize: 15, color: T.textLight }}>No pending POs</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto', maxHeight: '65vh', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                  <tr style={{ background: T.navy }}>
                    {tableCols.map((col, i) => (
                      <th key={i} style={{
                        padding: '12px 14px', textAlign: 'left',
                        color: T.goldLight, fontSize: 11, fontWeight: 700,
                        textTransform: 'uppercase', letterSpacing: 0.5,
                        whiteSpace: 'nowrap', minWidth: col.w,
                        borderBottom: `2px solid ${T.gold}`,
                      }}>{col.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req, idx) => (
                    <tr key={req.UID + idx}
                      style={{ background: idx % 2 === 0 ? T.card : T.borderLight }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = `${T.gold}08`; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = idx % 2 === 0 ? T.card : T.borderLight; }}
                    >
                      <Td><span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 26, height: 26, borderRadius: 6, background: T.borderLight,
                        fontSize: 12, fontWeight: 600, color: T.textLight,
                      }}>{idx + 1}</span></Td>
                      <Td>{req.PLANNED_6}</Td>
                      <Td><span style={{ background: `${T.navy}15`, color: T.navy, padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>{req.UID}</span></Td>
                      <Td><span style={{ background: `${T.gold}15`, color: T.goldDark, padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>{req.Req_No}</span></Td>
                      <Td maxW={130}>{req.Site_Name}</Td>
                      <Td maxW={150}>{req.Material_Name}</Td>
                      <Td>
                        {req.Material_Size ? (
                          <span style={{ background: `${T.gold}15`, color: T.goldDark, padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
                            📏 {req.Material_Size}
                          </span>
                        ) : '—'}
                      </Td>
                      {/* ✅ NEW Specification column */}
                      <Td maxW={130}>
                        {req.Material_Specification ? (
                          <span style={{ background: `${T.purple}15`, color: T.purple, padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
                            📋 {req.Material_Specification}
                          </span>
                        ) : '—'}
                      </Td>
                      <Td right>{req.REVISED_QUANTITY_2}</Td>
                      <Td>{req.Unit_Name}</Td>
                      <Td><span style={{ background: `${T.purple}15`, color: T.purple, padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>{req.QUOTATION_NO_5}</span></Td>
                      <Td maxW={130}>{req.Vendor_Firm_Name_5}</Td>
                      <Td right>₹{req.FINAL_RATE_5}</Td>
                      <Td right><strong>₹{req.TOTAL_VALUE_5}</strong></Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── EDIT TAB (ADMIN) ── */}
      {activeTab === 'edit' && isAdmin && (
        <div>
          {updateSuccess && (
            <div style={{
              background: T.successBg, border: `1px solid ${T.successBorder}`,
              borderRadius: 10, padding: '14px 18px', marginBottom: 16,
              borderLeft: `3px solid ${T.success}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#065f46', margin: 0 }}>
                    {updateSuccess.poNumber} - PDF Updated!
                  </p>
                  <p style={{ fontSize: 12, color: T.textLight, margin: '2px 0 0' }}>{updateSuccess.message}</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <a href={updateSuccess.newPdfUrl} target="_blank" rel="noopener noreferrer" style={{
                    padding: '6px 14px', borderRadius: 6, background: T.navy,
                    color: T.gold, fontSize: 12, fontWeight: 600, textDecoration: 'none',
                  }}>View PDF</a>
                  <button onClick={() => setUpdateSuccess(null)} style={{
                    padding: '6px 10px', borderRadius: 6, border: 'none',
                    background: 'transparent', color: T.textMuted, cursor: 'pointer',
                  }}><X size={14} /></button>
                </div>
              </div>
            </div>
          )}

          <div style={{
            background: T.card, borderRadius: 10, border: `1px solid ${T.border}`,
            padding: '14px 18px', marginBottom: 16,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
              <Search size={14} style={{
                position: 'absolute', left: 12, top: '50%',
                transform: 'translateY(-50%)', color: T.textMuted,
              }} />
              <input type="text" placeholder="Search PO Number..."
                value={poSearch} onChange={(e) => setPoSearch(e.target.value)}
                style={{ ...inputBase, paddingLeft: 36 }}
                onFocus={focusGold} onBlur={blurNormal}
              />
            </div>
            <button onClick={fetchAdminPOs} disabled={adminLoading} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 8,
              border: `1.5px solid ${T.border}`, background: T.card,
              color: T.textLight, fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}>
              <RotateCcw size={14} /> {adminLoading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {adminLoading ? <LoadingScreen /> :
            adminGrouped.filter(po => po.poNumber.toLowerCase().includes(poSearch.toLowerCase())).length === 0 ? (
              <div style={{
                background: T.card, borderRadius: 10, border: `1px solid ${T.border}`,
                padding: '60px 20px', textAlign: 'center',
              }}>
                <Package size={40} color={T.border} style={{ marginBottom: 12 }} />
                <p style={{ fontSize: 15, color: T.textLight }}>
                  {poSearch ? `No PO found for "${poSearch}"` : 'No POs found'}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {adminGrouped
                  .filter(po => po.poNumber.toLowerCase().includes(poSearch.toLowerCase()))
                  .map((po, idx) => (
                    <div key={idx} style={{
                      background: T.card, borderRadius: 10,
                      border: `1px solid ${T.border}`, overflow: 'hidden',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                    }}>
                      <div onClick={() => setSelectedPO(selectedPO === po.poNumber ? null : po.poNumber)}
                        style={{
                          padding: '14px 18px',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          cursor: 'pointer', flexWrap: 'wrap', gap: 10,
                          background: selectedPO === po.poNumber ? T.borderLight : 'transparent',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                          <span style={{
                            background: T.navy, color: T.gold,
                            padding: '4px 12px', borderRadius: 6,
                            fontSize: 14, fontWeight: 700,
                          }}>{po.poNumber}</span>
                          <span style={{
                            background: T.borderLight, color: T.text,
                            padding: '3px 10px', borderRadius: 5, fontSize: 12,
                          }}>{po.quotationNo}</span>
                          <span style={{ fontSize: 13, color: T.text, fontWeight: 500 }}>{po.siteName}</span>
                          <span style={{ fontSize: 12, color: T.textMuted }}>| {po.vendorName}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {po.pdfUrl && (
                            <a href={po.pdfUrl} target="_blank" rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 4,
                                padding: '6px 12px', borderRadius: 6,
                                background: `${T.navy}15`, color: T.navy,
                                fontSize: 12, fontWeight: 600, textDecoration: 'none',
                              }}>
                              <ExternalLink size={12} /> View
                            </a>
                          )}
                          <button onClick={(e) => { e.stopPropagation(); handleUpdatePO(po.poNumber); }}
                            disabled={updateLoading}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 4,
                              padding: '6px 12px', borderRadius: 6, border: 'none',
                              background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
                              color: T.navyDark, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                            }}>
                            <RotateCcw size={12} /> {updateLoading ? 'Updating...' : 'Update PDF'}
                          </button>
                          <ChevronDown size={16} style={{
                            color: T.textMuted,
                            transform: selectedPO === po.poNumber ? 'rotate(180deg)' : 'rotate(0)',
                            transition: 'transform 0.2s',
                          }} />
                        </div>
                      </div>

                      {selectedPO === po.poNumber && (
                        <div style={{
                          borderTop: `1px solid ${T.border}`,
                          padding: '14px 18px', background: T.bg,
                        }}>
                          <div style={{
                            display: 'flex', gap: 16, marginBottom: 12,
                            fontSize: 12, color: T.textLight, flexWrap: 'wrap',
                          }}>
                            <span><strong style={{ color: T.navy }}>Items:</strong> {po.items.length}</span>
                            <span><strong style={{ color: T.navy }}>Delivery:</strong> {po.deliveryDate || 'N/A'}</span>
                            <span><strong style={{ color: T.navy }}>Vendor:</strong> {po.vendorName}</span>
                          </div>

                          <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                              <thead>
                                <tr style={{ background: T.navy }}>
                                  {/* ✅ Size ke baad Specification, CGST/SGST/IGST → GST */}
                                  {['#', 'UID', 'Material', 'Size', 'Specification', 'Qty', 'Unit', 'Rate', 'GST', 'Final', 'Total'].map((h, i) => (
                                    <th key={i} style={{
                                      padding: '8px 10px', color: T.gold,
                                      fontSize: 10, fontWeight: 700, textAlign: 'left',
                                    }}>{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {po.items.map((item, i) => (
                                  <tr key={i} style={{ background: i % 2 === 0 ? T.card : T.borderLight }}>
                                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>{i + 1}</td>
                                    <td style={{ padding: '8px 10px' }}>{item.UID}</td>
                                    <td style={{ padding: '8px 10px' }}>
                                      {item.Material_Name}
                                      {item.Remark5 && (
                                        <div style={{ fontSize: 10, color: T.textMuted, fontStyle: 'italic' }}>
                                          ({item.Remark5})
                                        </div>
                                      )}
                                    </td>
                                    <td style={{ padding: '8px 10px' }}>
                                      {item.Material_Size ? (
                                        <span style={{
                                          background: `${T.gold}15`, color: T.goldDark,
                                          padding: '2px 6px', borderRadius: 4,
                                          fontSize: 11, fontWeight: 600,
                                        }}>{item.Material_Size}</span>
                                      ) : '—'}
                                    </td>
                                    {/* ✅ NEW Specification column */}
                                    <td style={{ padding: '8px 10px' }}>
                                      {item.Material_Specification ? (
                                        <span style={{
                                          background: `${T.purple}15`, color: T.purple,
                                          padding: '2px 6px', borderRadius: 4,
                                          fontSize: 11, fontWeight: 600,
                                        }}>{item.Material_Specification}</span>
                                      ) : '—'}
                                    </td>
                                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>{item.REVISED_QUANTITY_2}</td>
                                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>{item.Unit_Name}</td>
                                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600, color: T.navy }}>
                                      ₹{item.Rate_5}
                                    </td>
                                    {/* ✅ Single GST column */}
                                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                                      <span style={{
                                        background: `${T.gold}15`, color: T.goldDark,
                                        padding: '2px 8px', borderRadius: 4,
                                        fontSize: 11, fontWeight: 700,
                                      }}>{getGSTDisplay(item)}</span>
                                    </td>
                                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>₹{item.FINAL_RATE_5}</td>
                                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700 }}>₹{item.TOTAL_VALUE_5}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          <div style={{
                            marginTop: 12, padding: '10px 14px',
                            background: T.warningBg, border: `1px solid ${T.warning}40`,
                            borderRadius: 8, fontSize: 12, color: '#92400e',
                            borderLeft: `3px solid ${T.warning}`,
                          }}>
                            <strong>📌 Note:</strong> First update rates/prices in Google Sheet, then click "Update PDF". New PDF with same PO number ({po.poNumber}) will be generated.
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )
          }
        </div>
      )}

      {/* ── MODAL ── */}
      {showModal && (
        <>
          <div onClick={() => setShowModal(false)} style={{
            position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)',
            backdropFilter: 'blur(2px)', zIndex: 100,
          }} />

          <div style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '95%', maxWidth: 1200,
            background: T.card, borderRadius: 14,
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
            zIndex: 101, display: 'flex', flexDirection: 'column',
            maxHeight: '92vh',
          }}>
            {/* Modal Header */}
            <div style={{
              background: T.navy, padding: '14px 24px',
              borderBottom: `2px solid ${T.gold}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexShrink: 0, borderRadius: '14px 14px 0 0',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 8,
                  background: `${T.gold}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <FileText size={18} color={T.gold} />
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'white', margin: 0 }}>Create Purchase Order</h3>
                  <p style={{ fontSize: 11, color: T.textMuted, margin: 0 }}>Step {step} of 2</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} style={{
                width: 32, height: 32, borderRadius: 8, border: 'none',
                background: 'rgba(255,255,255,0.1)', color: 'white',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><X size={16} /></button>
            </div>

            {/* Step Indicator */}
            <div style={{
              padding: '12px 24px', background: T.borderLight,
              borderBottom: `1px solid ${T.border}`, flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, maxWidth: 500 }}>
                {[1, 2].map(s => (
                  <React.Fragment key={s}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: step >= s ? `linear-gradient(135deg, ${T.gold}, ${T.goldDark})` : T.border,
                        color: step >= s ? T.navyDark : T.textMuted,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 700,
                      }}>
                        {step > s ? <Check size={13} /> : s}
                      </div>
                      <span style={{
                        fontSize: 12, fontWeight: step === s ? 600 : 400,
                        color: step === s ? T.navy : T.textMuted,
                      }}>
                        {s === 1 ? 'Select Quotation' : 'Confirm Details'}
                      </span>
                    </div>
                    {s < 2 && (
                      <div style={{
                        flex: 1, height: 2,
                        background: step > s ? T.gold : T.border, borderRadius: 2,
                      }} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>

              {/* ── STEP 1 ── */}
              {step === 1 && (
                <div style={{ maxWidth: 600, margin: '0 auto' }}>
                  <div style={{
                    background: `${T.gold}10`, border: `1px solid ${T.gold}30`,
                    borderRadius: 10, padding: '14px 18px', marginBottom: 20,
                    borderLeft: `3px solid ${T.gold}`,
                  }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: T.goldDark, margin: '0 0 4px' }}>
                      Step 1: Select Quotation
                    </p>
                    <p style={{ fontSize: 13, color: T.textLight, margin: 0 }}>
                      Choose approved quotation to create Purchase Order
                    </p>
                  </div>

                  <label style={labelStyle}>
                    Quotation Number <span style={{ color: T.danger }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select value={selectedQuotation}
                      onChange={(e) => setSelectedQuotation(e.target.value)}
                      style={{ ...inputBase, paddingRight: 32, appearance: 'none', cursor: 'pointer' }}
                      onFocus={focusGold} onBlur={blurNormal}
                    >
                      <option value="">-- Select Quotation Number --</option>
                      {uniqueQuotations.map((q, i) => (
                        <option key={i} value={q}>{q}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} style={{
                      position: 'absolute', right: 10, top: '50%',
                      transform: 'translateY(-50%)', color: T.textMuted, pointerEvents: 'none',
                    }} />
                  </div>
                </div>
              )}

              {/* ── STEP 2 ── */}
              {step === 2 && (
                <div>
                  <div style={{
                    background: T.successBg, border: `1px solid ${T.successBorder}`,
                    borderRadius: 10, padding: '14px 18px', marginBottom: 20,
                    borderLeft: `3px solid ${T.success}`,
                  }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#065f46', margin: '0 0 4px' }}>
                      Step 2: Purchase Order Details
                    </p>
                    <p style={{ fontSize: 13, color: T.textLight, margin: 0 }}>
                      Quotation: <strong>{selectedQuotation}</strong> | {selectedItems.length} items
                    </p>
                  </div>

                  {/* Delivery Date */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>
                      <Calendar size={12} style={{ display: 'inline', marginRight: 4 }} />
                      Expected Delivery Date <span style={{ color: T.danger }}>*</span>
                    </label>
                    <input type="date" value={expectedDeliveryDate}
                      onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                      style={{ ...inputBase, borderColor: !expectedDeliveryDate ? T.danger : T.border }}
                      onFocus={focusGold} onBlur={blurNormal}
                    />
                  </div>

                  {/* Material Cards */}
                  {selectedItems.length > 0 ? selectedItems.map((item, index) => {
                    const itemTotal = parseFloat(String(item.TOTAL_VALUE_5 || '0').replace(/[₹,\s]/g, '')) || 0;
                    const itemRate  = parseFloat(String(item.Rate_5 || '0').replace(/[₹,\s]/g, '')) || 0;
                    const itemFinal = parseFloat(String(item.FINAL_RATE_5 || '0').replace(/[₹,\s]/g, '')) || 0;
                    const itemQty   = parseFloat(String(item.REVISED_QUANTITY_2 || '0').replace(/[,\s]/g, '')) || 0;

                    return (
                      <div key={index} style={{
                        marginBottom: 16, background: `${T.gold}08`,
                        padding: '16px', borderRadius: 10,
                        border: `1px solid ${T.gold}40`,
                      }}>
                        <h3 style={{
                          fontSize: 14, fontWeight: 700, color: T.navy,
                          margin: '0 0 8px',
                          display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
                        }}>
                          <span style={{
                            background: T.navy, color: T.gold,
                            padding: '3px 10px', borderRadius: 5,
                            fontSize: 12, fontWeight: 700,
                          }}>UID: {item.UID}</span>
                          <span>Material: {item.Material_Name}</span>
                          {item.Material_Size && (
                            <span style={{
                              background: `${T.gold}20`, color: T.goldDark,
                              padding: '2px 8px', borderRadius: 4,
                              fontSize: 11, fontWeight: 600,
                            }}>📏 {item.Material_Size}</span>
                          )}
                          {/* ✅ NEW Specification badge */}
                          {item.Material_Specification && (
                            <span style={{
                              background: `${T.purple}15`, color: T.purple,
                              padding: '2px 8px', borderRadius: 4,
                              fontSize: 11, fontWeight: 600,
                            }}>📋 {item.Material_Specification}</span>
                          )}
                        </h3>

                        {item.Remark5 && (
                          <div style={{
                            fontSize: 11, color: T.textMuted, fontStyle: 'italic',
                            background: T.borderLight, padding: '6px 10px',
                            borderRadius: 5, marginBottom: 12,
                            borderLeft: `2px solid ${T.gold}`,
                          }}>
                            📝 Remark: {item.Remark5}
                          </div>
                        )}

                        <div style={{
                          overflowX: 'auto', border: `1px solid ${T.border}`,
                          borderRadius: 8, background: T.card,
                        }}>
                          <table style={{
                            width: '100%', borderCollapse: 'collapse',
                            fontSize: 12, minWidth: 700,
                          }}>
                            <thead>
                              <tr style={{ background: T.navy }}>
                                {/* ✅ CGST/SGST/IGST → Single GST column */}
                                {['VENDOR FIRM', 'RATE', 'GST', 'FINAL RATE', 'QTY', 'UNIT', 'TOTAL VALUE', 'TRANSPORT'].map((h, i) => (
                                  <th key={i} style={{
                                    padding: '10px 12px', color: T.gold,
                                    fontSize: 10, fontWeight: 700,
                                    textTransform: 'uppercase', letterSpacing: 0.5,
                                    textAlign: 'left', whiteSpace: 'nowrap',
                                    borderBottom: `2px solid ${T.gold}`,
                                  }}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              <tr style={{ background: T.card }}>
                                <td style={{ padding: '10px 12px', fontSize: 12, color: T.navy, fontWeight: 600, borderBottom: `1px solid ${T.border}` }}>
                                  {item.Vendor_Firm_Name_5}
                                </td>
                                <td style={{ padding: '10px 12px', fontSize: 12, borderBottom: `1px solid ${T.border}` }}>
                                  ₹{itemRate.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                </td>
                                {/* ✅ Combined GST */}
                                <td style={{ padding: '10px 12px', fontSize: 12, borderBottom: `1px solid ${T.border}` }}>
                                  <span style={{
                                    background: `${T.gold}15`, color: T.goldDark,
                                    padding: '3px 10px', borderRadius: 5,
                                    fontWeight: 700, fontSize: 12,
                                  }}>
                                    {getGSTDisplay(item)}
                                  </span>
                                </td>
                                <td style={{ padding: '10px 12px', fontSize: 12, color: T.success, fontWeight: 700, borderBottom: `1px solid ${T.border}` }}>
                                  ₹{itemFinal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                </td>
                                <td style={{ padding: '10px 12px', fontSize: 12, fontWeight: 600, borderBottom: `1px solid ${T.border}` }}>
                                  {itemQty.toLocaleString('en-IN')}
                                </td>
                                <td style={{ padding: '10px 12px', fontSize: 12, borderBottom: `1px solid ${T.border}` }}>
                                  {item.Unit_Name}
                                </td>
                                <td style={{ padding: '10px 12px', fontSize: 13, color: T.navy, fontWeight: 800, borderBottom: `1px solid ${T.border}` }}>
                                  ₹{itemTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                </td>
                                <td style={{ padding: '10px 12px', fontSize: 12, borderBottom: `1px solid ${T.border}` }}>
                                  {item.IS_TRANSPORT_REQUIRED === 'Yes' ? (
                                    <span style={{
                                      background: `${T.warning}20`, color: '#92400e',
                                      padding: '2px 8px', borderRadius: 4,
                                      fontSize: 11, fontWeight: 600,
                                    }}>₹{item.EXPECTED_TRANSPORT_CHARGES || '0'}</span>
                                  ) : (
                                    <span style={{
                                      background: `${T.success}15`, color: T.success,
                                      padding: '2px 8px', borderRadius: 4,
                                      fontSize: 11, fontWeight: 600,
                                    }}>Not Required</span>
                                  )}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  }) : (
                    <p style={{ textAlign: 'center', color: T.textMuted, padding: '40px 20px', fontSize: 14 }}>
                      No details available.
                    </p>
                  )}

                  {/* Grand Total */}
                  {selectedItems.length > 0 && (() => {
                    const gTotal = selectedItems.reduce((sum, item) => {
                      const v = parseFloat(String(item.TOTAL_VALUE_5 || '0').replace(/[₹,\s]/g, '')) || 0;
                      return sum + v;
                    }, 0);
                    const totalQty = selectedItems.reduce((sum, item) => {
                      const q = parseFloat(String(item.REVISED_QUANTITY_2 || '0').replace(/[,\s]/g, '')) || 0;
                      return sum + q;
                    }, 0);

                    return (
                      <div style={{
                        background: `linear-gradient(135deg, ${T.success}15, ${T.success}08)`,
                        border: `2px solid ${T.success}40`,
                        borderRadius: 10, padding: '16px 20px', marginTop: 16,
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
                      }}>
                        <div>
                          <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 4 }}>
                            Total Items: <strong style={{ color: T.navy }}>{selectedItems.length}</strong>
                            {' | '}
                            Total Qty: <strong style={{ color: T.navy }}>{totalQty.toLocaleString('en-IN')}</strong>
                          </div>
                          <div style={{ fontSize: 11, color: T.textMuted }}>
                            Vendor: <strong style={{ color: T.navy }}>{selectedItems[0]?.Vendor_Firm_Name_5}</strong>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, marginBottom: 2 }}>
                            GRAND TOTAL
                          </div>
                          <div style={{ fontSize: 26, fontWeight: 800, color: T.success, lineHeight: 1.1 }}>
                            ₹{gTotal.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '14px 24px', borderTop: `1px solid ${T.border}`,
              background: T.card, flexShrink: 0,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderRadius: '0 0 14px 14px',
            }}>
              <div style={{ fontSize: 12, color: T.textMuted }}>
                {step === 2 && (
                  <>Total: <strong style={{ color: T.success, fontSize: 14 }}>
                    ₹{grandTotal.toLocaleString('en-IN')}
                  </strong></>
                )}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                {step === 2 && (
                  <button onClick={() => setStep(1)} style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '10px 18px', borderRadius: 8,
                    border: `1.5px solid ${T.border}`, background: T.card,
                    color: T.textLight, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}><ArrowLeft size={14} /> Back</button>
                )}
                <button onClick={() => setShowModal(false)} style={{
                  padding: '10px 18px', borderRadius: 8,
                  border: `1.5px solid ${T.border}`, background: T.card,
                  color: T.textLight, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}>Cancel</button>

                {step === 1 ? (
                  <button onClick={handleNext} disabled={!selectedQuotation} style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '10px 24px', borderRadius: 8, border: 'none',
                    background: selectedQuotation
                      ? `linear-gradient(135deg, ${T.gold}, ${T.goldDark})` : T.border,
                    color: selectedQuotation ? T.navyDark : T.textMuted,
                    fontSize: 13, fontWeight: 700,
                    cursor: selectedQuotation ? 'pointer' : 'not-allowed',
                    opacity: selectedQuotation ? 1 : 0.6,
                  }}>Next <ArrowRight size={14} /></button>
                ) : (
                  <button onClick={handleGeneratePO}
                    disabled={generateLoading || !expectedDeliveryDate}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '10px 24px', borderRadius: 8, border: 'none',
                      background: expectedDeliveryDate && !generateLoading
                        ? `linear-gradient(135deg, ${T.success}, #059669)` : T.border,
                      color: expectedDeliveryDate && !generateLoading ? 'white' : T.textMuted,
                      fontSize: 13, fontWeight: 700,
                      cursor: expectedDeliveryDate && !generateLoading ? 'pointer' : 'not-allowed',
                    }}>
                    {generateLoading
                      ? <><Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Generating...</>
                      : <><CheckCircle size={14} /> Generate PO</>
                    }
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default PO;