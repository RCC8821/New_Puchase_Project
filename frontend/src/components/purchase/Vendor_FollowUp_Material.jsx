


import React, { useState, useEffect } from 'react';
import {
  Loader2, AlertCircle, CheckCircle, X, ChevronDown,
  RotateCcw, Package, FileText, Edit3, ExternalLink,
  Calendar, MessageCircle, Phone, ArrowRight
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
  width: '100%', padding: '10px 12px', fontSize: 13,
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
  <div style={{
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', padding: '80px 20px',
  }}>
    <div style={{
      width: 56, height: 56, borderRadius: 14,
      background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: 20, boxShadow: `0 0 0 3px ${T.gold}30`,
    }}>
      <Loader2 size={28} color={T.gold} style={{ animation: 'spin 1s linear infinite' }} />
    </div>
    <p style={{ fontSize: 15, fontWeight: 600, color: T.navy, marginBottom: 4 }}>Loading Follow-Up Data...</p>
    <p style={{ fontSize: 13, color: T.textMuted }}>Fetching vendor materials</p>
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

const Td = ({ children, right, maxW, center, bold }) => (
  <td style={{
    padding: '10px 14px', fontSize: 13, color: T.text,
    borderBottom: `1px solid ${T.border}`, whiteSpace: 'nowrap',
    textAlign: right ? 'right' : center ? 'center' : 'left',
    fontWeight: bold ? 600 : 400,
  }}>
    {maxW ? (
      <span title={typeof children === 'string' ? children : ''} style={{
        display: 'block', maxWidth: maxW, overflow: 'hidden', textOverflow: 'ellipsis',
      }}>{children || <span style={{ color: T.textMuted }}>—</span>}</span>
    ) : (children || <span style={{ color: T.textMuted }}>—</span>)}
  </td>
);

const Vendor_FollowUp_Material = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  // Req No based grouping
  const [selectedReqNo, setSelectedReqNo] = useState('');
  const [reqNoItems, setReqNoItems] = useState([]);
  const [selectedUIDs, setSelectedUIDs] = useState([]);

  // Form fields
  const [status, setStatus] = useState('');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [remark, setRemark] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  const fetchMaterials = async () => {
    try {
      setLoading(true); setError(null);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/get-vendor-follow-up-material`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setMaterials(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error(err); setError('Failed to load data');
      setMaterials([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchMaterials(); }, []);

  // ── Action Click → Group by Req No ─────────────────────
  const openItemModal = (material) => {
    if (!material?.Req_No) return;
    const reqNo = material.Req_No;
    setSelectedReqNo(reqNo);

    // Find all UIDs with same Req No
    const items = materials.filter(m => m.Req_No === reqNo);
    setReqNoItems(items);
    setSelectedUIDs(items.map(i => i.UID)); // Select all by default
    setIsItemModalOpen(true);
    setSaveSuccess(false);
    setSaveError('');
  };

  // ── Select/Deselect UIDs ────────────────────────────────
  const handleSelectAll = (e) => {
    setSelectedUIDs(e.target.checked ? reqNoItems.map(i => i.UID) : []);
  };

  const handleUIDSelect = (uid) => {
    setSelectedUIDs(prev =>
      prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]
    );
  };

  // ── Next → Form Modal ──────────────────────────────────
  const goToFormModal = () => {
    if (selectedUIDs.length === 0) {
      setSaveError('Select at least one UID');
      return;
    }
    setSaveError('');
    setIsItemModalOpen(false);
    setIsFormModalOpen(true);
    setStatus('');
    setExpectedDeliveryDate('');
    setRemark('');
  };

  // ── Submit → Update ALL selected UIDs ──────────────────
  const handleUpdate = async () => {
    if (!status || !expectedDeliveryDate || !remark) {
      setSaveError('All fields are required');
      return;
    }

    setIsSaving(true); setSaveError('');

    try {
      let successCount = 0;
      let failCount = 0;

      for (const uid of selectedUIDs) {
        const mat = materials.find(m => m.UID === uid);
        if (!mat) continue;

        const updatedFollowUpCount = (parseInt(mat.FOLLOW_UP_COUNT_7 || '0') + 1).toString();

        try {
          const response = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/update-vendor-follow-up-material`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                uid: uid,
                status,
                expected_delivery_date: expectedDeliveryDate,
                remark,
                follow_up_count: updatedFollowUpCount,
              }),
            }
          );

          const data = await response.json();
          if (!response.ok) throw new Error(data.error || 'Failed');
          successCount++;
        } catch (err) {
          console.error(`Failed for UID ${uid}:`, err);
          failCount++;
        }
      }

      if (successCount > 0) {
        setSaveSuccess(true);

        // Update local state
        setMaterials(prev => {
          return prev
            .map(m => {
              if (selectedUIDs.includes(m.UID)) {
                return {
                  ...m,
                  STATUS_7: status,
                  EXPECTED_DELIVERY_DATE_7: expectedDeliveryDate,
                  REMARK_RECEIVED_VENDOR_7: remark,
                  FOLLOW_UP_COUNT_7: (parseInt(m.FOLLOW_UP_COUNT_7 || '0') + 1).toString(),
                };
              }
              return m;
            })
            // ✅ Dispatched UIDs ko remove karo
            .filter(m => {
              if (selectedUIDs.includes(m.UID) && status === 'Dispatched') {
                return false; // Remove dispatched
              }
              return true;
            });
        });

        if (failCount > 0) {
          setSaveError(`${successCount} updated, ${failCount} failed`);
        }

        setTimeout(() => closeAllModals(), 1500);
      } else {
        setSaveError('All updates failed');
      }
    } catch (err) {
      setSaveError(err.message || 'Failed to update');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Close ──────────────────────────────────────────────
  const closeAllModals = () => {
    setIsItemModalOpen(false);
    setIsFormModalOpen(false);
    setSelectedReqNo('');
    setReqNoItems([]);
    setSelectedUIDs([]);
    setStatus('');
    setExpectedDeliveryDate('');
    setRemark('');
    setIsSaving(false);
    setSaveSuccess(false);
    setSaveError('');
  };

  // ── Table Columns ──────────────────────────────────────
  const tableCols = [
    { label: 'UID', w: 60 }, { label: 'Req No', w: 90 },
    { label: 'Site', w: 130 }, { label: 'Supervisor', w: 120 },
    { label: 'Material Type', w: 110 }, { label: 'Material Name', w: 160 },
    { label: 'Size', w: 90 }, { label: 'SKU', w: 90 },
    { label: 'Qty', w: 70 }, { label: 'Unit', w: 60 },
    { label: 'Brand', w: 130 }, { label: 'Indent No', w: 100 },
    { label: 'Indent PDF', w: 90 }, { label: 'Quotation', w: 100 },
    { label: 'Quote PDF', w: 90 }, { label: 'PO No', w: 90 },
    { label: 'PO PDF', w: 90 }, { label: 'Vendor Firm', w: 140 },
    { label: 'Contact', w: 110 }, { label: 'PO Delivery', w: 110 },
    { label: 'Planned 7', w: 100 }, { label: 'Status', w: 110 },
    { label: 'Follow-ups', w: 90 }, { label: 'New Exp Date', w: 110 },
    { label: 'Vendor Remark', w: 130 }, { label: 'Action', w: 80 },
  ];

  if (loading) return <LoadingScreen />;

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>

      {/* ── Header ─────────────────────────────────────── */}
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
            <MessageCircle size={18} color={T.gold} />
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: T.navy, margin: 0 }}>Vendor Follow-Up</h2>
            <p style={{ fontSize: 12, color: T.textMuted, margin: 0 }}>
              {materials.length} pending follow-up{materials.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <button onClick={fetchMaterials} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 14px', borderRadius: 8,
          border: `1.5px solid ${T.border}`, background: T.card,
          color: T.textLight, fontSize: 13, fontWeight: 500, cursor: 'pointer',
        }}>
          <RotateCcw size={14} /> Refresh
        </button>
      </div>

      {/* ── Error ──────────────────────────────────────── */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px', background: T.dangerBg,
          border: `1px solid ${T.dangerBorder}`, borderRadius: 10,
          marginBottom: 16, fontSize: 13, color: T.danger,
        }}>
          <AlertCircle size={16} /> {error}
          <button onClick={fetchMaterials} style={{
            marginLeft: 'auto', padding: '4px 12px', borderRadius: 6,
            border: `1px solid ${T.danger}`, background: 'transparent',
            color: T.danger, fontSize: 12, cursor: 'pointer',
          }}>Retry</button>
        </div>
      )}

      {/* ── Main Table ─────────────────────────────────── */}
      <div style={{
        background: T.card, borderRadius: 10, border: `1px solid ${T.border}`,
        overflow: 'hidden',
      }}>
        {materials.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px' }}>
            <Package size={40} color={T.border} style={{ marginBottom: 12 }} />
            <p style={{ fontSize: 15, fontWeight: 500, color: T.textLight }}>No materials for follow-up</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', maxHeight: '65vh', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                <tr style={{ background: T.navy }}>
                  {tableCols.map((col, i) => (
                    <th key={i} style={{
                      padding: '12px 14px',
                      textAlign: col.label === 'Qty' ? 'right' : col.label === 'Action' ? 'center' : 'left',
                      color: T.goldLight, fontSize: 11, fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: 0.5,
                      whiteSpace: 'nowrap', minWidth: col.w,
                      borderBottom: `2px solid ${T.gold}`,
                    }}>{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {materials.map((mat, idx) => (
                  <tr key={mat.UID + idx}
                    style={{ background: idx % 2 === 0 ? T.card : T.borderLight }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${T.gold}08`; }}
                    onMouseLeave={e => { e.currentTarget.style.background = idx % 2 === 0 ? T.card : T.borderLight; }}>

                    <Td><span style={{ background: `${T.navy}15`, color: T.navy, padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>{mat.UID}</span></Td>
                    <Td><span style={{ background: `${T.gold}15`, color: T.goldDark, padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>{mat.Req_No}</span></Td>
                    <Td maxW={130}>{mat.Site_Name}</Td>
                    <Td maxW={110}>{mat.Supervisor_Name}</Td>
                    <Td>{mat.Material_Type}</Td>
                    <Td maxW={150} bold>{mat.Material_Name}</Td>
                    <Td>{mat.Material_Size ? <span style={{ background: `${T.gold}15`, color: T.goldDark, padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>📏 {mat.Material_Size}</span> : '—'}</Td>
                    <Td>{mat.SKU_Code ? <span style={{ fontFamily: 'monospace', fontSize: 11, background: T.borderLight, padding: '2px 6px', borderRadius: 4, color: T.textLight }}>{mat.SKU_Code}</span> : '—'}</Td>
                    <Td right bold>{mat.REVISED_QUANTITY_2 || mat.Quantity}</Td>
                    <Td>{mat.Unit_Name}</Td>
                    <Td maxW={120}>{mat['DECIDED_BRAND/COMPANY_NAME_2'] ? <span style={{ background: `${T.purple}15`, color: T.purple, padding: '3px 8px', borderRadius: 5, fontSize: 11, fontWeight: 600 }}>{mat['DECIDED_BRAND/COMPANY_NAME_2']}</span> : '—'}</Td>
                    <Td>{mat.INDENT_NUMBER_3 ? <span style={{ background: `${T.purple}15`, color: T.purple, padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{mat.INDENT_NUMBER_3}</span> : '—'}</Td>
                    <td style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}`, textAlign: 'center' }}>
                      {mat.PDF_URL_3 ? <a href={mat.PDF_URL_3} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '4px 8px', borderRadius: 5, background: `${T.gold}15`, color: T.goldDark, fontSize: 11, fontWeight: 600, textDecoration: 'none' }}><FileText size={11} /> PDF</a> : <span style={{ color: T.textMuted }}>—</span>}
                    </td>
                    <Td>{mat.QUOTATION_NO_5 ? <span style={{ background: `${T.success}15`, color: T.success, padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{mat.QUOTATION_NO_5}</span> : '—'}</Td>
                    <td style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}`, textAlign: 'center' }}>
                      {mat.PDF_URL_5 ? <a href={mat.PDF_URL_5} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '4px 8px', borderRadius: 5, background: `${T.success}15`, color: T.success, fontSize: 11, fontWeight: 600, textDecoration: 'none' }}><FileText size={11} /> PDF</a> : <span style={{ color: T.textMuted }}>—</span>}
                    </td>
                    <Td>{mat.PO_NUMBER_6 ? <span style={{ background: T.navy, color: T.gold, padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>{mat.PO_NUMBER_6}</span> : '—'}</Td>
                    <td style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}`, textAlign: 'center' }}>
                      {mat.PDF_URL_6 ? <a href={mat.PDF_URL_6} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '4px 8px', borderRadius: 5, background: T.navy, color: T.gold, fontSize: 11, fontWeight: 700, textDecoration: 'none' }}><FileText size={11} /> PDF</a> : <span style={{ color: T.textMuted }}>—</span>}
                    </td>
                    <Td maxW={130} bold>{mat.Vendor_Firm_Name_5}</Td>
                    <Td>{mat.Vendor_Contact ? <a href={`tel:${mat.Vendor_Contact}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: T.navy, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}><Phone size={11} /> {mat.Vendor_Contact}</a> : '—'}</Td>
                    <Td>{mat.EXPECTED_DELIVERY_DATE_6}</Td>
                    <Td>{mat.PLANNED_7}</Td>
                    <Td>{mat.STATUS_7 ? <span style={{ background: mat.STATUS_7 === 'Dispatched' ? `${T.success}15` : mat.STATUS_7 === 'Partition' ? `${T.warning}20` : `${T.danger}15`, color: mat.STATUS_7 === 'Dispatched' ? T.success : mat.STATUS_7 === 'Partition' ? '#92400e' : T.danger, padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{mat.STATUS_7}</span> : <span style={{ color: T.textMuted, fontSize: 11, background: T.borderLight, padding: '3px 8px', borderRadius: 6, fontWeight: 500 }}>Pending</span>}</Td>
                    <Td center><span style={{ background: parseInt(mat.FOLLOW_UP_COUNT_7 || 0) > 3 ? `${T.danger}15` : `${T.gold}15`, color: parseInt(mat.FOLLOW_UP_COUNT_7 || 0) > 3 ? T.danger : T.goldDark, padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>{mat.FOLLOW_UP_COUNT_7 || '0'}</span></Td>
                    <Td>{mat.EXPECTED_DELIVERY_DATE_7}</Td>
                    <Td maxW={120}>{mat.REMARK_RECEIVED_VENDOR_7}</Td>

                    {/* ✅ Action - Opens Req No based modal */}
                    <td style={{ padding: '10px 14px', textAlign: 'center', borderBottom: `1px solid ${T.border}` }}>
                      <button onClick={() => openItemModal(mat)} title={`Follow-up Req: ${mat.Req_No}`}
                        style={{
                          width: 34, height: 34, borderRadius: 8,
                          border: `1.5px solid ${T.gold}40`, background: `${T.gold}10`,
                          color: T.goldDark, cursor: 'pointer',
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = T.gold; e.currentTarget.style.color = T.navyDark; }}
                        onMouseLeave={e => { e.currentTarget.style.background = `${T.gold}10`; e.currentTarget.style.color = T.goldDark; }}>
                        <Edit3 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ════ MODAL 1: Select UIDs (Grouped by Req No) ════ */}
      {isItemModalOpen && (
        <>
          <div onClick={closeAllModals} style={{
            position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)',
            backdropFilter: 'blur(2px)', zIndex: 100,
          }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '95%', maxWidth: 850,
            background: T.card, borderRadius: 14,
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            zIndex: 101, display: 'flex', flexDirection: 'column',
            maxHeight: '85vh',
          }}>
            {/* Header */}
            <div style={{
              background: T.navy, padding: '14px 20px',
              borderBottom: `2px solid ${T.gold}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderRadius: '14px 14px 0 0',
            }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'white', margin: 0 }}>
                  Select UIDs — Req No: <span style={{ color: T.gold }}>{selectedReqNo}</span>
                </h3>
                <p style={{ fontSize: 11, color: T.textMuted, margin: 0 }}>
                  {selectedUIDs.length} / {reqNoItems.length} selected
                </p>
              </div>
              <button onClick={closeAllModals} style={{
                width: 30, height: 30, borderRadius: 6, border: 'none',
                background: 'rgba(255,255,255,0.1)', color: 'white',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><X size={16} /></button>
            </div>

            {/* Items Table */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: T.borderLight }}>
                      <th style={{ padding: '10px 12px' }}>
                        <input type="checkbox" onChange={handleSelectAll}
                          checked={selectedUIDs.length === reqNoItems.length && reqNoItems.length > 0} />
                      </th>
                      {['UID', 'Material', 'Size', 'Qty', 'Unit', 'Vendor', 'PO No', 'Status', 'Follow-ups'].map(h => (
                        <th key={h} style={{
                          padding: '10px 12px', textAlign: 'left',
                          fontSize: 12, fontWeight: 700, color: T.navy,
                          borderBottom: `2px solid ${T.border}`,
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reqNoItems.map((item, i) => (
                      <tr key={item.UID}
                        style={{ background: i % 2 === 0 ? T.card : T.borderLight }}
                        onMouseEnter={e => { e.currentTarget.style.background = `${T.gold}08`; }}
                        onMouseLeave={e => { e.currentTarget.style.background = i % 2 === 0 ? T.card : T.borderLight; }}>
                        <td style={{ padding: '10px 12px' }}>
                          <input type="checkbox" checked={selectedUIDs.includes(item.UID)}
                            onChange={() => handleUIDSelect(item.UID)} />
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{ background: `${T.navy}15`, color: T.navy, padding: '2px 7px', borderRadius: 5, fontWeight: 700, fontSize: 12 }}>{item.UID}</span>
                        </td>
                        <td style={{ padding: '10px 12px', fontWeight: 600 }}>{item.Material_Name}</td>
                        <td style={{ padding: '10px 12px' }}>{item.Material_Size || '—'}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600 }}>{item.REVISED_QUANTITY_2 || item.Quantity}</td>
                        <td style={{ padding: '10px 12px' }}>{item.Unit_Name}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 600 }}>{item.Vendor_Firm_Name_5}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{ background: T.navy, color: T.gold, padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>{item.PO_NUMBER_6}</span>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          {item.STATUS_7 ? (
                            <span style={{
                              background: item.STATUS_7 === 'Dispatched' ? `${T.success}15` : item.STATUS_7 === 'Partition' ? `${T.warning}20` : `${T.danger}15`,
                              color: item.STATUS_7 === 'Dispatched' ? T.success : item.STATUS_7 === 'Partition' ? '#92400e' : T.danger,
                              padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                            }}>{item.STATUS_7}</span>
                          ) : <span style={{ color: T.textMuted }}>Pending</span>}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <span style={{ background: `${T.gold}15`, color: T.goldDark, padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
                            {item.FOLLOW_UP_COUNT_7 || '0'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {saveError && (
                <div style={{ marginTop: 12, padding: '10px 14px', background: T.dangerBg, border: `1px solid ${T.dangerBorder}`, borderRadius: 8, fontSize: 13, color: T.danger, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertCircle size={15} /> {saveError}
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{
              padding: '14px 20px', borderTop: `1px solid ${T.border}`,
              background: T.borderLight,
              display: 'flex', justifyContent: 'space-between', gap: 10,
              borderRadius: '0 0 14px 14px',
            }}>
              <button onClick={closeAllModals} style={{
                padding: '8px 20px', borderRadius: 8,
                border: `1.5px solid ${T.border}`, background: T.card,
                color: T.textLight, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>Cancel</button>
              <button onClick={goToFormModal} disabled={selectedUIDs.length === 0}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '8px 20px', borderRadius: 8, border: 'none',
                  background: selectedUIDs.length > 0 ? `linear-gradient(135deg, ${T.gold}, ${T.goldDark})` : T.border,
                  color: selectedUIDs.length > 0 ? T.navyDark : T.textMuted,
                  fontSize: 13, fontWeight: 700,
                  cursor: selectedUIDs.length > 0 ? 'pointer' : 'not-allowed',
                }}>
                Next ({selectedUIDs.length} selected) <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </>
      )}

      {/* ════ MODAL 2: Follow-Up Form ══════════════════════ */}
      {isFormModalOpen && (
        <>
          <div onClick={closeAllModals} style={{
            position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)',
            backdropFilter: 'blur(2px)', zIndex: 100,
          }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '95%', maxWidth: 550,
            background: T.card, borderRadius: 14,
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            zIndex: 101, display: 'flex', flexDirection: 'column',
            maxHeight: '85vh',
          }}>
            {/* Header */}
            <div style={{
              background: T.navy, padding: '14px 20px',
              borderBottom: `2px solid ${T.gold}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderRadius: '14px 14px 0 0',
            }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'white', margin: 0 }}>
                  Update Follow-Up — Req: <span style={{ color: T.gold }}>{selectedReqNo}</span>
                </h3>
                <p style={{ fontSize: 11, color: T.textMuted, margin: 0 }}>
                  {selectedUIDs.length} UIDs selected
                </p>
              </div>
              <button onClick={closeAllModals} style={{
                width: 30, height: 30, borderRadius: 6, border: 'none',
                background: 'rgba(255,255,255,0.1)', color: 'white',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><X size={16} /></button>
            </div>

            {/* Selected UIDs Summary */}
            <div style={{
              padding: '12px 20px', background: T.borderLight,
              borderBottom: `1px solid ${T.border}`, maxHeight: 120, overflowY: 'auto',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.navy, marginBottom: 6 }}>
                Selected UIDs ({selectedUIDs.length}):
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {selectedUIDs.map(uid => {
                  const mat = materials.find(m => m.UID === uid);
                  return (
                    <span key={uid} style={{
                      background: `${T.navy}10`, color: T.navy,
                      padding: '3px 8px', borderRadius: 6,
                      fontSize: 11, fontWeight: 600,
                    }}>
                      {uid} - {mat?.Material_Name || ''}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

              {saveSuccess && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: T.successBg, border: `1px solid ${T.successBorder}`, borderRadius: 8, fontSize: 13, color: '#065f46' }}>
                  <CheckCircle size={16} color={T.success} /> All {selectedUIDs.length} UIDs updated!
                </div>
              )}
              {saveError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: T.dangerBg, border: `1px solid ${T.dangerBorder}`, borderRadius: 8, fontSize: 13, color: T.danger }}>
                  <AlertCircle size={16} /> {saveError}
                </div>
              )}

              {/* Status */}
              <div>
                <label style={labelStyle}>
                  Status <span style={{ color: T.danger }}>*</span>
                  <span style={{ marginLeft: 8, fontSize: 10, color: T.textMuted, background: T.borderLight, padding: '2px 6px', borderRadius: 4 }}>→ Column CO</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <select value={status} onChange={e => setStatus(e.target.value)} disabled={isSaving}
                    style={{ ...inputBase, paddingRight: 32, appearance: 'none', cursor: 'pointer' }}
                    onFocus={focusGold} onBlur={blurNormal}>
                    <option value="">-- Select Status --</option>
                    <option value="Dispatched">✅ Dispatched (will hide from list)</option>
                    <option value="Not Dispatched">❌ Not Dispatched</option>
                    <option value="Partition">⚠️ Partition (will stay in list)</option>
                  </select>
                  <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: T.textMuted, pointerEvents: 'none' }} />
                </div>
                {status === 'Dispatched' && (
                  <p style={{ fontSize: 11, color: T.success, marginTop: 4, fontWeight: 600 }}>
                    ✅ Selected UIDs will be removed from follow-up list after update
                  </p>
                )}
                {status === 'Partition' && (
                  <p style={{ fontSize: 11, color: '#92400e', marginTop: 4, fontWeight: 600 }}>
                    ⚠️ Selected UIDs will remain in follow-up list for further tracking
                  </p>
                )}
              </div>

              {/* Expected Delivery Date */}
              <div>
                <label style={labelStyle}>
                  <Calendar size={12} style={{ display: 'inline', marginRight: 4 }} />
                  Expected Delivery Date <span style={{ color: T.danger }}>*</span>
                  <span style={{ marginLeft: 8, fontSize: 10, color: T.textMuted, background: T.borderLight, padding: '2px 6px', borderRadius: 4 }}>→ Column CQ</span>
                </label>
                <input type="date" value={expectedDeliveryDate}
                  onChange={e => setExpectedDeliveryDate(e.target.value)}
                  disabled={isSaving} style={inputBase}
                  onFocus={focusGold} onBlur={blurNormal} />
              </div>

              {/* Remark */}
              <div>
                <label style={labelStyle}>
                  Remark <span style={{ color: T.danger }}>*</span>
                  <span style={{ marginLeft: 8, fontSize: 10, color: T.textMuted, background: T.borderLight, padding: '2px 6px', borderRadius: 4 }}>→ Column CR</span>
                </label>
                <textarea value={remark} onChange={e => setRemark(e.target.value)}
                  disabled={isSaving} placeholder="Enter vendor follow-up remark..." rows={3}
                  style={{ ...inputBase, resize: 'vertical', minHeight: 70 }}
                  onFocus={focusGold} onBlur={blurNormal} />
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: '14px 20px', borderTop: `1px solid ${T.border}`,
              background: T.borderLight,
              display: 'flex', justifyContent: 'space-between', gap: 10,
              borderRadius: '0 0 14px 14px',
            }}>
              <button onClick={() => { setIsFormModalOpen(false); setIsItemModalOpen(true); }}
                disabled={isSaving} style={{
                  padding: '10px 20px', borderRadius: 8,
                  border: `1.5px solid ${T.border}`, background: T.card,
                  color: T.textLight, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}>← Previous</button>

              <button onClick={handleUpdate}
                disabled={isSaving || saveSuccess || !status || !expectedDeliveryDate || !remark}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '10px 24px', borderRadius: 8, border: 'none',
                  background: saveSuccess ? T.success
                    : (status && expectedDeliveryDate && remark && !isSaving)
                      ? `linear-gradient(135deg, ${T.gold}, ${T.goldDark})` : T.border,
                  color: saveSuccess ? 'white'
                    : (status && expectedDeliveryDate && remark && !isSaving)
                      ? T.navyDark : T.textMuted,
                  fontSize: 13, fontWeight: 700,
                  cursor: (status && expectedDeliveryDate && remark && !isSaving) ? 'pointer' : 'not-allowed',
                }}>
                {isSaving ? (
                  <><Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> Updating {selectedUIDs.length} UIDs...</>
                ) : saveSuccess ? (
                  <><CheckCircle size={15} /> All Updated!</>
                ) : (
                  <><CheckCircle size={15} /> Update All ({selectedUIDs.length})</>
                )}
              </button>
            </div>
          </div>
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Vendor_FollowUp_Material;