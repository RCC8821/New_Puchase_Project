import React, { useState, useEffect } from 'react';
import {
  Loader2, AlertCircle, CheckCircle, X,
  Edit3, ChevronDown, RotateCcw, Package
} from 'lucide-react';

// ─── THEME ───────────────────────────────────────────────
const T = {
  navy: '#1e293b', navyLight: '#334155', navyDark: '#0f172a',
  gold: '#f59e0b', goldLight: '#fbbf24', goldDark: '#d97706',
  bg: '#f8fafc', card: '#ffffff', text: '#1e293b',
  textLight: '#64748b', textMuted: '#94a3b8',
  border: '#e2e8f0', borderLight: '#f1f5f9',
  success: '#10b981', successBg: '#ecfdf5', successBorder: '#a7f3d0',
  danger: '#ef4444', dangerBg: '#fef2f2', dangerBorder: '#fecaca',
};

// ─── STYLES ──────────────────────────────────────────────
const labelStyle = {
  display: 'block', fontSize: 12, fontWeight: 600,
  color: T.navyLight, marginBottom: 6, letterSpacing: 0.3,
};

const inputStyle = {
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

// ─── LOADING ─────────────────────────────────────────────
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
    <p style={{ fontSize: 15, fontWeight: 600, color: T.navy, marginBottom: 4 }}>
      Loading Approvals...
    </p>
    <p style={{ fontSize: 13, color: T.textMuted }}>Fetching pending requests</p>
    <div style={{
      width: 180, height: 3, borderRadius: 3,
      background: T.border, marginTop: 20, overflow: 'hidden',
    }}>
      <div style={{
        width: '40%', height: '100%', borderRadius: 3,
        background: `linear-gradient(90deg, ${T.gold}, ${T.goldLight})`,
        animation: 'loadingBar 1.5s ease-in-out infinite',
      }} />
    </div>
    <style>{`
      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes loadingBar {
        0%{transform:translateX(-100%)}
        50%{transform:translateX(150%)}
        100%{transform:translateX(350%)}
      }
    `}</style>
  </div>
);

// ─── TABLE CELL ──────────────────────────────────────────
const Td = ({ children, center, right, maxW }) => (
  <td style={{
    padding: '10px 14px', fontSize: 13, color: T.text,
    borderBottom: `1px solid ${T.border}`, whiteSpace: 'nowrap',
    textAlign: center ? 'center' : right ? 'right' : 'left',
  }}>
    {maxW ? (
      <span title={typeof children === 'string' ? children : ''} style={{
        display: 'block', maxWidth: maxW,
        overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {children || <span style={{ color: T.textMuted }}>—</span>}
      </span>
    ) : (
      children || <span style={{ color: T.textMuted }}>—</span>
    )}
  </td>
);

// ════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ════════════════════════════════════════════════════════
const ApproveRequired = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [status, setStatus] = useState('APPROVED');
  const [revisedQty, setRevisedQty] = useState('');
  const [decidedBrand, setDecidedBrand] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // ── Fetch ──
  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/get-approve-Requied`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setRequests(data.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  // ── Modal ──
  const openModal = (req) => {
    setSelectedRequest(req);
    setStatus('APPROVED');
    setRevisedQty('');
    setDecidedBrand('');
    setRemarks('');
    setSaveSuccess(false);
    setSaveError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
    setSaveSuccess(false);
    setSaveError('');
    setIsSaving(false);
  };

  // ── Save ──
  const handleSave = async () => {
    if (!selectedRequest || !status || !decidedBrand.trim()) return;
    setIsSaving(true);
    setSaveError('');

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/approve-Requied-save`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            UID: selectedRequest.UID,
            STATUS: status,
            REVISED_QUANTITY: revisedQty,
            DECIDED_BRAND: decidedBrand,
            REMARKS: remarks,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Save failed');

      setSaveSuccess(true);

      if (status === 'APPROVED') {
        setRequests(prev => prev.filter(r => r.UID !== selectedRequest.UID));
      }

      setTimeout(() => closeModal(), 1500);

    } catch (err) {
      console.error('Save error:', err);
      setSaveError(err.message || 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Can Save Check ──
  const canSave = !isSaving && !saveSuccess && decidedBrand.trim();

  // ── Table columns ──
  const columns = [
    { label: '#', w: 50 },
    { label: 'Planned Date', w: 110 },
    { label: 'UID', w: 60 },
    { label: 'Req No', w: 90 },
    { label: 'Project', w: 150 },
    { label: 'Engineer', w: 130 },
    { label: 'Material Type', w: 120 },
    { label: 'Material Name', w: 160 },
    { label: 'Size', w: 90 },
    { label: 'Specification', w: 130 },
    // { label: 'Brand', w: 110 },
    { label: 'SKU', w: 100 },
    { label: 'Qty', w: 70 },
    { label: 'Unit', w: 70 },
    { label: 'Description', w: 140 },
    { label: 'Days', w: 70 },
    { label: 'Contractor', w: 130 },
    { label: 'Remark', w: 120 },
    { label: 'Action', w: 80 },
  ];

  // ── Loading State ──
  if (loading) return <LoadingScreen />;

  // ── Main Render ──
  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>

      {/* ══════ HEADER ══════ */}
      <div style={{
        background: T.card, borderRadius: 10,
        border: `1px solid ${T.border}`, padding: '16px 20px',
        marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <CheckCircle size={18} color={T.gold} />
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: T.navy, margin: 0 }}>
              Approve Required
            </h2>
            <p style={{ fontSize: 12, color: T.textMuted, margin: 0 }}>
              {requests.length} pending request{requests.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <button
          onClick={fetchRequests}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 8,
            border: `1.5px solid ${T.border}`, background: T.card,
            color: T.textLight, fontSize: 13, fontWeight: 500, cursor: 'pointer',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.gold; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.border; }}
        >
          <RotateCcw size={14} /> Refresh
        </button>
      </div>

      {/* ══════ ERROR ══════ */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px', background: T.dangerBg,
          border: `1px solid ${T.dangerBorder}`, borderRadius: 10,
          marginBottom: 16, fontSize: 13, color: T.danger,
        }}>
          <AlertCircle size={16} /> {error}
          <button onClick={fetchRequests} style={{
            marginLeft: 'auto', padding: '4px 12px', borderRadius: 6,
            border: `1px solid ${T.danger}`, background: 'transparent',
            color: T.danger, fontSize: 12, cursor: 'pointer',
          }}>Retry</button>
        </div>
      )}

      {/* ══════ TABLE ══════ */}
      <div style={{
        background: T.card, borderRadius: 10,
        border: `1px solid ${T.border}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)', overflow: 'hidden',
      }}>
        {requests.length === 0 && !error ? (
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '60px 20px', color: T.textMuted,
          }}>
            <Package size={40} style={{ color: T.border, marginBottom: 12 }} />
            <p style={{ fontSize: 15, fontWeight: 500, color: T.textLight }}>
              No pending approvals
            </p>
            <p style={{ fontSize: 13 }}>All requests have been processed</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', maxHeight: '65vh', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>

              {/* Table Header */}
              <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                <tr style={{ background: T.navy }}>
                  {columns.map((col, i) => (
                    <th key={i} style={{
                      padding: '12px 14px',
                      textAlign: col.label === 'Qty' ? 'right'
                        : col.label === 'Action' ? 'center' : 'left',
                      color: T.goldLight, fontSize: 11, fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: 0.5,
                      whiteSpace: 'nowrap', minWidth: col.w,
                      borderBottom: `2px solid ${T.gold}`,
                    }}>
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {requests.map((req, idx) => (
                  <tr
                    key={req.UID || idx}
                    style={{ background: idx % 2 === 0 ? T.card : T.borderLight }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = `${T.gold}08`; }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = idx % 2 === 0 ? T.card : T.borderLight;
                    }}
                  >
                    {/* # */}
                    <Td>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 26, height: 26, borderRadius: 6,
                        background: T.borderLight, fontSize: 12,
                        fontWeight: 600, color: T.textLight,
                      }}>{idx + 1}</span>
                    </Td>

                    {/* Planned Date */}
                    <Td>{req.PLANNED_2}</Td>

                    {/* UID */}
                    <Td>
                      <span style={{
                        background: `${T.navy}15`, color: T.navy,
                        padding: '3px 8px', borderRadius: 6,
                        fontSize: 12, fontWeight: 600,
                      }}>{req.UID}</span>
                    </Td>

                    {/* Req No */}
                    <Td>
                      <span style={{
                        background: `${T.gold}15`, color: T.goldDark,
                        padding: '3px 8px', borderRadius: 6,
                        fontSize: 12, fontWeight: 600,
                      }}>{req.Req_No}</span>
                    </Td>

                    {/* Project */}
                    <Td maxW={140}>{req.Project_Name}</Td>

                    {/* Engineer */}
                    <Td>{req.Engineer_Name}</Td>

                    {/* Material Type */}
                    <Td>{req.Material_Type}</Td>

                    {/* Material Name */}
                    <Td maxW={150}>{req.Material_Name}</Td>

                    {/* Size */}
                    <Td>{req.Material_Size}</Td>

                    {/* Specification */}
                    <Td maxW={120}>{req.Specification}</Td>

                    {/* Brand */}
                    {/* <Td>{req.Brand_Name}</Td> */}

                    {/* SKU */}
                    <Td>{req.SKU_Code}</Td>

                    {/* Quantity */}
                    <td style={{
                      padding: '10px 14px', fontSize: 13,
                      color: T.text, borderBottom: `1px solid ${T.border}`,
                      textAlign: 'right', whiteSpace: 'nowrap', fontWeight: 600,
                    }}>
                      {req.Quantity || <span style={{ color: T.textMuted }}>—</span>}
                    </td>

                    {/* Unit */}
                    <Td>{req.Unit_Name}</Td>

                    {/* Description */}
                    <Td maxW={130}>{req.Description}</Td>

                    {/* Require Days */}
                    <Td>
                      {req.Require_Days ? (
                        <span style={{
                          background: req.Require_Days === '0' ? `${T.danger}15` : `${T.gold}15`,
                          color: req.Require_Days === '0' ? T.danger : T.goldDark,
                          padding: '3px 8px', borderRadius: 6,
                          fontSize: 12, fontWeight: 600,
                        }}>
                          {req.Require_Days === '0' ? 'Urgent' : `${req.Require_Days}d`}
                        </span>
                      ) : '—'}
                    </Td>

                    {/* Contractor */}
                    <Td maxW={120}>{req.Contractor}</Td>

                    {/* Remark */}
                    <Td maxW={110}>{req.Remark}</Td>

                    {/* Action */}
                    <td style={{
                      padding: '10px 14px', textAlign: 'center',
                      borderBottom: `1px solid ${T.border}`,
                    }}>
                      <button
                        onClick={() => openModal(req)}
                        title="Approve / Update"
                        style={{
                          width: 34, height: 34, borderRadius: 8,
                          border: `1.5px solid ${T.gold}40`,
                          background: `${T.gold}10`,
                          color: T.goldDark, cursor: 'pointer',
                          display: 'inline-flex', alignItems: 'center',
                          justifyContent: 'center', transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = T.gold;
                          e.currentTarget.style.color = T.navyDark;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = `${T.gold}10`;
                          e.currentTarget.style.color = T.goldDark;
                        }}
                      >
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

      {/* ══════════════════════════════════════════════════ */}
      {/*                    MODAL                          */}
      {/* ══════════════════════════════════════════════════ */}
      {isModalOpen && selectedRequest && (
        <>
          {/* Overlay */}
          <div
            onClick={closeModal}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(15,23,42,0.5)',
              backdropFilter: 'blur(2px)', zIndex: 100,
            }}
          />

          {/* Modal Container */}
          <div style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100%', maxWidth: 520,
            background: T.card, borderRadius: 14,
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            zIndex: 101, overflow: 'hidden',
            maxHeight: '90vh', display: 'flex', flexDirection: 'column',
          }}>

            {/* ── Modal Header ── */}
            <div style={{
              background: T.navy, padding: '16px 20px',
              borderBottom: `2px solid ${T.gold}`,
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: `${T.gold}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Edit3 size={16} color={T.gold} />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: 'white', margin: 0 }}>
                    Update Approval
                  </h3>
                  <p style={{ fontSize: 12, color: T.textMuted, margin: 0 }}>
                    UID: {selectedRequest.UID} | {selectedRequest.Req_No}
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                disabled={isSaving}
                style={{
                  width: 30, height: 30, borderRadius: 6, border: 'none',
                  background: 'rgba(255,255,255,0.1)', color: 'white',
                  cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* ── Scrollable Content ── */}
            <div style={{ overflowY: 'auto', flex: 1 }}>

              {/* Request Summary */}
              <div style={{
                margin: '16px 20px 0', padding: '12px 14px',
                background: T.borderLight, borderRadius: 8,
                border: `1px solid ${T.border}`,
              }}>
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr',
                  gap: '6px 16px', fontSize: 12,
                }}>
                  {[
                    ['Project', selectedRequest.Project_Name],
                    ['Engineer', selectedRequest.Engineer_Name],
                    ['Material', selectedRequest.Material_Name],
                    ['Size', selectedRequest.Material_Size],
                    ['Quantity', `${selectedRequest.Quantity} ${selectedRequest.Unit_Name}`],
                    ['SKU Code', selectedRequest.SKU_Code],
                    ['Contractor', selectedRequest.Contractor],
                    ['Brand_Name', selectedRequest.Brand_Name],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <span style={{ color: T.textMuted }}>{label}: </span>
                      <span style={{ color: T.navy, fontWeight: 600 }}>
                        {value || '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Form Fields ── */}
              <div style={{
                padding: '16px 20px',
                display: 'flex', flexDirection: 'column', gap: 14,
              }}>

                {/* Success Message */}
                {saveSuccess && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 14px', background: T.successBg,
                    border: `1px solid ${T.successBorder}`, borderRadius: 8,
                    fontSize: 13, color: '#065f46',
                  }}>
                    <CheckCircle size={16} color={T.success} />
                    Updated successfully!
                  </div>
                )}

                {/* Save Error */}
                {saveError && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 14px', background: T.dangerBg,
                    border: `1px solid ${T.dangerBorder}`, borderRadius: 8,
                    fontSize: 13, color: T.danger,
                  }}>
                    <AlertCircle size={16} /> {saveError}
                  </div>
                )}

                {/* STATUS → Column X */}
                <div>
                  <label style={labelStyle}>
                    Status <span style={{ color: T.danger }}>*</span>
                    <span style={{
                      marginLeft: 8, fontSize: 10, color: T.textMuted,
                      background: T.borderLight, padding: '2px 6px', borderRadius: 4,
                    }}>→ Column X</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      disabled={isSaving}
                      style={{
                        ...inputStyle, paddingRight: 32,
                        appearance: 'none', cursor: 'pointer',
                      }}
                      onFocus={focusGold}
                      onBlur={blurNormal}
                    >
                      <option value="APPROVED">✅ APPROVED</option>
                      <option value="PENDING">⏳ PENDING</option>
                      <option value="REJECTED">❌ REJECTED</option>
                    </select>
                    <ChevronDown size={14} style={{
                      position: 'absolute', right: 10, top: '50%',
                      transform: 'translateY(-50%)', color: T.textMuted,
                      pointerEvents: 'none',
                    }} />
                  </div>
                </div>

                {/* REVISED QUANTITY → Column Y */}
                <div>
                  <label style={labelStyle}>
                    Revised Quantity
                    <span style={{
                      marginLeft: 8, fontSize: 10, color: T.textMuted,
                      background: T.borderLight, padding: '2px 6px', borderRadius: 4,
                    }}>→ Column Y</span>
                  </label>
                  <input
                    type="number"
                    value={revisedQty}
                    onChange={(e) => setRevisedQty(e.target.value)}
                    disabled={isSaving}
                    placeholder="Enter revised quantity (optional)"
                    style={inputStyle}
                    onFocus={focusGold}
                    onBlur={blurNormal}
                  />
                </div>

                {/* DECIDED BRAND/COMPANY NAME → Column Z (REQUIRED) */}
                <div>
                  <label style={labelStyle}>
                    Decided Brand / Company Name
                    <span style={{ color: T.danger, marginLeft: 2 }}>*</span>
                    <span style={{
                      marginLeft: 8, fontSize: 10, color: T.textMuted,
                      background: T.borderLight, padding: '2px 6px', borderRadius: 4,
                    }}>→ Column Z</span>
                  </label>
                  <input
                    type="text"
                    value={decidedBrand}
                    onChange={(e) => setDecidedBrand(e.target.value)}
                    disabled={isSaving}
                    placeholder="Enter brand or company name (required)"
                    style={{
                      ...inputStyle,
                      borderColor: decidedBrand === '' ? T.border
                        : decidedBrand.trim() ? T.success : T.danger,
                    }}
                    onFocus={focusGold}
                    onBlur={(e) => {
                      if (!decidedBrand.trim()) {
                        e.target.style.borderColor = T.danger;
                        e.target.style.boxShadow = 'none';
                        e.target.style.background = T.borderLight;
                      } else {
                        blurNormal(e);
                      }
                    }}
                  />
                  {/* Required hint */}
                  {!decidedBrand.trim() && (
                    <p style={{
                      fontSize: 11, color: T.danger,
                      margin: '4px 0 0',
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      <AlertCircle size={12} />
                      This field is required to save
                    </p>
                  )}
                </div>

                {/* REMARKS → Column AB */}
                <div>
                  <label style={labelStyle}>
                    Remarks
                    <span style={{
                      marginLeft: 8, fontSize: 10, color: T.textMuted,
                      background: T.borderLight, padding: '2px 6px', borderRadius: 4,
                    }}>→ Column AB</span>
                  </label>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    disabled={isSaving}
                    placeholder="Enter remarks (optional)"
                    rows={3}
                    style={{
                      ...inputStyle, resize: 'vertical', minHeight: 70,
                    }}
                    onFocus={focusGold}
                    onBlur={blurNormal}
                  />
                </div>
              </div>
            </div>

            {/* ── Modal Footer ── */}
            <div style={{
              padding: '14px 20px',
              borderTop: `1px solid ${T.border}`,
              background: T.borderLight,
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10, flexShrink: 0,
            }}>
              {/* Left side - validation hint */}
              <div>
                {!decidedBrand.trim() && !saveSuccess && (
                  <p style={{
                    fontSize: 12, color: T.danger,
                    display: 'flex', alignItems: 'center', gap: 4, margin: 0,
                  }}>
                    <AlertCircle size={14} />
                    Fill Brand/Company to enable save
                  </p>
                )}
                {decidedBrand.trim() && !saveSuccess && (
                  <p style={{
                    fontSize: 12, color: T.success,
                    display: 'flex', alignItems: 'center', gap: 4, margin: 0,
                  }}>
                    <CheckCircle size={14} />
                    Ready to save
                  </p>
                )}
              </div>

              {/* Right side - buttons */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={closeModal}
                  disabled={isSaving}
                  style={{
                    padding: '10px 20px', borderRadius: 8,
                    border: `1.5px solid ${T.border}`, background: T.card,
                    color: T.textLight, fontSize: 13, fontWeight: 600,
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                  }}
                >
                  Cancel
                </button>

                <button
                  onClick={handleSave}
                  disabled={!canSave}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '10px 24px', borderRadius: 8, border: 'none',
                    background: saveSuccess
                      ? T.success
                      : canSave
                        ? `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`
                        : T.border,
                    color: saveSuccess
                      ? 'white'
                      : canSave
                        ? T.navyDark
                        : T.textMuted,
                    fontSize: 13, fontWeight: 700,
                    cursor: canSave ? 'pointer' : 'not-allowed',
                    boxShadow: canSave ? `0 2px 8px ${T.gold}40` : 'none',
                    opacity: canSave || saveSuccess ? 1 : 0.6,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (canSave) {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = `0 4px 14px ${T.gold}50`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    if (canSave) {
                      e.currentTarget.style.boxShadow = `0 2px 8px ${T.gold}40`;
                    }
                  }}
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} />
                      Saving...
                    </>
                  ) : saveSuccess ? (
                    <>
                      <CheckCircle size={15} /> Saved!
                    </>
                  ) : (
                    <>
                      <CheckCircle size={15} /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default ApproveRequired;