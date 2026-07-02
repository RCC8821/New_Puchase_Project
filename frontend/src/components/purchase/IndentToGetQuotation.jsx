import React, { useState, useEffect } from 'react';
import {
  Loader2, AlertCircle, CheckCircle, X, ChevronDown,
  RotateCcw, Package, FileText, ArrowLeft, ArrowRight,
  Check, Plus
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
      Loading Indent Data...
    </p>
    <p style={{ fontSize: 13, color: T.textMuted }}>Fetching pending indents</p>
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
const IndentToGetQuotation = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedReqNo, setSelectedReqNo] = useState(null);
  const [selectedUIDs, setSelectedUIDs] = useState([]);
  const [status3, setStatus3] = useState('');
  const [remark3, setRemark3] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // ── Fetch ──
  const fetchRequests = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/get-indent-data`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data && Array.isArray(data.data)) {
        setRequests(data.data);
      } else {
        setRequests([]);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load data.');
      setRequests([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchRequests(); }, []);

  // ── Unique Req Numbers ──
  const uniqueReqNos = [...new Set(requests.map(r => r.Req_No))].sort();

  // ── Items for selected Req No ──
  const filteredItems = selectedReqNo
    ? requests.filter(r => r.Req_No === selectedReqNo)
    : [];

  // ── Modal Controls ──
  const openModal = () => {
    setCurrentStep(1);
    setSelectedReqNo(null);
    setSelectedUIDs([]);
    setStatus3('');
    setRemark3('');
    setSaveSuccess(false);
    setSaveError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentStep(1);
    setSelectedReqNo(null);
    setSelectedUIDs([]);
    setIsSaving(false);
    setSaveSuccess(false);
    setSaveError('');
  };

  const canGoNext = selectedReqNo && selectedUIDs.length > 0;
  const canSave = status3 && !isSaving && !saveSuccess;

  // ── Save ──
  const handleSave = async () => {
    if (!canSave || selectedUIDs.length === 0) return;
    setIsSaving(true);
    setSaveError('');

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/update-indent-data`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            UIDs: selectedUIDs,
            STATUS_3: status3,
            REMARK_3: remark3 || '',
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');

      setSaveSuccess(true);
      setRequests(prev => prev.filter(r => !selectedUIDs.includes(r.UID)));
      setTimeout(() => closeModal(), 1500);

    } catch (err) {
      console.error(err);
      setSaveError(err.message || 'Failed to save');
    } finally { setIsSaving(false); }
  };

  // ── Table Columns ──
  const columns = [
    { label: '#', w: 50 },
    { label: 'Planned', w: 100 },
    { label: 'UID', w: 60 },
    { label: 'Req No', w: 90 },
    { label: 'Project', w: 150 },
    { label: 'Engineer', w: 130 },
    { label: 'Material Type', w: 120 },
    { label: 'Material Name', w: 160 },
    { label: 'Size', w: 90 },
    { label: 'SKU', w: 100 },
    { label: 'Qty', w: 70 },
    { label: 'Unit', w: 70 },
    { label: 'Revised Qty', w: 90 },
    { label: 'Decided Brand', w: 140 },
    { label: 'Days', w: 70 },
    { label: 'Contractor', w: 130 },
    { label: 'Remark', w: 120 },
   
  ];

  if (loading) return <LoadingScreen />;

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
            <FileText size={18} color={T.gold} />
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: T.navy, margin: 0 }}>
              Indent To Get Quotation
            </h2>
            <p style={{ fontSize: 12, color: T.textMuted, margin: 0 }}>
              {requests.length} pending item{requests.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={fetchRequests} style={{
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

          <button onClick={openModal} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 18px', borderRadius: 8, border: 'none',
            background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
            color: T.navyDark, fontSize: 13, fontWeight: 700, cursor: 'pointer',
            boxShadow: `0 2px 8px ${T.gold}40`, transition: 'all 0.2s',
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = `0 4px 14px ${T.gold}50`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = `0 2px 8px ${T.gold}40`;
            }}
          >
            <Plus size={15} /> Create Indent
          </button>
        </div>
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
            <p style={{ fontSize: 15, fontWeight: 500, color: T.textLight }}>No pending indents</p>
            <p style={{ fontSize: 13 }}>All items have been processed</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', maxHeight: '65vh', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                <tr style={{ background: T.navy }}>
                  {columns.map((col, i) => (
                    <th key={i} style={{
                      padding: '12px 14px',
                      textAlign: col.label === 'Qty' || col.label === 'Revised Qty' ? 'right'
                        : 'left',
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
                  <tr key={req.UID || idx}
                    style={{ background: idx % 2 === 0 ? T.card : T.borderLight }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = `${T.gold}08`; }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = idx % 2 === 0 ? T.card : T.borderLight;
                    }}
                  >
                    <Td>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 26, height: 26, borderRadius: 6,
                        background: T.borderLight, fontSize: 12,
                        fontWeight: 600, color: T.textLight,
                      }}>{idx + 1}</span>
                    </Td>
                    <Td>{req.PLANNED_3}</Td>
                    <Td>
                      <span style={{
                        background: `${T.navy}15`, color: T.navy,
                        padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                      }}>{req.UID}</span>
                    </Td>
                    <Td>
                      <span style={{
                        background: `${T.gold}15`, color: T.goldDark,
                        padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                      }}>{req.Req_No}</span>
                    </Td>
                    <Td maxW={140}>{req.Project_Name}</Td>
                    <Td>{req.Engineer_Name}</Td>
                    <Td>{req.Material_Type}</Td>
                    <Td maxW={150}>{req.Material_Name}</Td>
                    <Td>{req.Material_Size}</Td>
                    <Td>{req.SKU_Code}</Td>
                    <Td right>{req.Quantity}</Td>
                    <Td>{req.Unit_Name}</Td>
                    <Td right>{req.REVISED_QTY_2}</Td>
                    <Td maxW={130}>{req.DECIDED_BRAND_2}</Td>
                    <Td>
                      {req.Require_Days ? (
                        <span style={{
                          background: req.Require_Days === '0' ? `${T.danger}15` : `${T.gold}15`,
                          color: req.Require_Days === '0' ? T.danger : T.goldDark,
                          padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                        }}>{req.Require_Days === '0' ? 'Urgent' : `${req.Require_Days}d`}</span>
                      ) : '—'}
                    </Td>
                    <Td maxW={120}>{req.Contractor}</Td>
                    <Td maxW={110}>{req.Remark}</Td>
                    
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
      {isModalOpen && (
        <>
          <div onClick={closeModal} style={{
            position: 'fixed', inset: 0,
            background: 'rgba(15,23,42,0.5)',
            backdropFilter: 'blur(2px)', zIndex: 100,
          }} />

          <div style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100%', maxWidth: 540,
            background: T.card, borderRadius: 14,
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            zIndex: 101, overflow: 'hidden',
            maxHeight: '90vh', display: 'flex', flexDirection: 'column',
          }}>

            {/* Header */}
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
                  <FileText size={16} color={T.gold} />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: 'white', margin: 0 }}>
                    {currentStep === 1 ? 'Select Items for Indent' : 'Confirm & Save'}
                  </h3>
                  <p style={{ fontSize: 12, color: T.textMuted, margin: 0 }}>
                    Step {currentStep} of 2
                  </p>
                </div>
              </div>
              <button onClick={closeModal} disabled={isSaving} style={{
                width: 30, height: 30, borderRadius: 6, border: 'none',
                background: 'rgba(255,255,255,0.1)', color: 'white',
                cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}><X size={16} /></button>
            </div>

            {/* Step Indicator */}
            <div style={{
              padding: '14px 20px', background: T.borderLight,
              borderBottom: `1px solid ${T.border}`,
              display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
            }}>
              {[1, 2].map(step => (
                <React.Fragment key={step}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: currentStep >= step
                      ? `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`
                      : T.border,
                    color: currentStep >= step ? T.navyDark : T.textMuted,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700,
                  }}>
                    {currentStep > step ? <Check size={14} /> : step}
                  </div>
                  <span style={{
                    fontSize: 12, fontWeight: currentStep === step ? 600 : 400,
                    color: currentStep === step ? T.navy : T.textMuted,
                  }}>
                    {step === 1 ? 'Select Items' : 'Confirm'}
                  </span>
                  {step < 2 && (
                    <div style={{
                      flex: 1, height: 2,
                      background: currentStep > 1 ? T.gold : T.border,
                      borderRadius: 2,
                    }} />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Scrollable Content */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '16px 20px' }}>

              {/* Messages */}
              {saveSuccess && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 14px', background: T.successBg,
                  border: `1px solid ${T.successBorder}`, borderRadius: 8,
                  marginBottom: 14, fontSize: 13, color: '#065f46',
                }}>
                  <CheckCircle size={16} color={T.success} />
                  Indent created successfully!
                </div>
              )}
              {saveError && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 14px', background: T.dangerBg,
                  border: `1px solid ${T.dangerBorder}`, borderRadius: 8,
                  marginBottom: 14, fontSize: 13, color: T.danger,
                }}>
                  <AlertCircle size={16} /> {saveError}
                </div>
              )}

              {/* ── STEP 1 ── */}
              {currentStep === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                  {/* Select Req No */}
                  <div>
                    <label style={labelStyle}>
                      Select Request Number <span style={{ color: T.danger }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <select
                        value={selectedReqNo || ''}
                        onChange={(e) => {
                          setSelectedReqNo(e.target.value);
                          setSelectedUIDs([]);
                        }}
                        style={{ ...inputStyle, paddingRight: 32, appearance: 'none', cursor: 'pointer' }}
                        onFocus={focusGold} onBlur={blurNormal}
                      >
                        <option value="">-- Select Request Number --</option>
                        {uniqueReqNos.map(no => (
                          <option key={no} value={no}>{no}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} style={{
                        position: 'absolute', right: 10, top: '50%',
                        transform: 'translateY(-50%)', color: T.textMuted, pointerEvents: 'none',
                      }} />
                    </div>
                  </div>

                  {/* Select UIDs */}
                  {selectedReqNo && filteredItems.length > 0 && (
                    <div>
                      <label style={labelStyle}>
                        Select Items (UIDs) <span style={{ color: T.danger }}>*</span>
                        <span style={{
                          marginLeft: 8, fontSize: 11, color: T.textMuted,
                          background: T.borderLight, padding: '2px 8px', borderRadius: 10,
                        }}>
                          {selectedUIDs.length} / {filteredItems.length} selected
                        </span>
                      </label>

                      {/* Select All */}
                      <div
                        onClick={() => {
                          if (selectedUIDs.length === filteredItems.length) {
                            setSelectedUIDs([]);
                          } else {
                            setSelectedUIDs(filteredItems.map(i => i.UID));
                          }
                        }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '8px 12px', marginBottom: 8,
                          background: T.borderLight, borderRadius: 8,
                          cursor: 'pointer', fontSize: 13, fontWeight: 600, color: T.navy,
                          border: `1px solid ${T.border}`,
                        }}
                      >
                        <div style={{
                          width: 18, height: 18, borderRadius: 4,
                          border: `2px solid ${selectedUIDs.length === filteredItems.length ? T.gold : T.border}`,
                          background: selectedUIDs.length === filteredItems.length ? T.gold : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {selectedUIDs.length === filteredItems.length && (
                            <Check size={12} color={T.navyDark} strokeWidth={3} />
                          )}
                        </div>
                        Select All
                      </div>

                      {/* Items List */}
                      <div style={{
                        maxHeight: 250, overflowY: 'auto',
                        border: `1px solid ${T.border}`, borderRadius: 8,
                      }}>
                        {filteredItems.map((item, idx) => {
                          const isSelected = selectedUIDs.includes(item.UID);
                          return (
                            <div
                              key={item.UID}
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedUIDs(prev => prev.filter(id => id !== item.UID));
                                } else {
                                  setSelectedUIDs(prev => [...prev, item.UID]);
                                }
                              }}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: '10px 12px',
                                background: isSelected ? `${T.gold}08` : idx % 2 === 0 ? T.card : T.borderLight,
                                borderBottom: idx < filteredItems.length - 1 ? `1px solid ${T.border}` : 'none',
                                cursor: 'pointer', transition: 'background 0.15s',
                              }}
                            >
                              <div style={{
                                width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                                border: `2px solid ${isSelected ? T.gold : T.border}`,
                                background: isSelected ? T.gold : 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.15s',
                              }}>
                                {isSelected && <Check size={12} color={T.navyDark} strokeWidth={3} />}
                              </div>

                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                                  <span style={{
                                    background: `${T.navy}15`, color: T.navy,
                                    padding: '1px 6px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                                  }}>UID: {item.UID}</span>
                                  <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>
                                    {item.Material_Name}
                                  </span>
                                </div>
                                <div style={{ fontSize: 11, color: T.textMuted }}>
                                  {item.Material_Type} • Qty: {item.REVISED_QTY_2 || item.Quantity} {item.Unit_Name}
                                  {item.DECIDED_BRAND_2 && ` • ${item.DECIDED_BRAND_2}`}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── STEP 2 ── */}
              {currentStep === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                  {/* Selected Summary */}
                  <div style={{
                    padding: '12px 14px', background: T.borderLight,
                    borderRadius: 8, border: `1px solid ${T.border}`,
                  }}>
                    <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 6 }}>
                      Selected Items
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {selectedUIDs.map(uid => {
                        const item = requests.find(r => r.UID === uid);
                        return (
                          <span key={uid} style={{
                            background: `${T.gold}15`, color: T.goldDark,
                            padding: '4px 10px', borderRadius: 6,
                            fontSize: 12, fontWeight: 600,
                          }}>
                            {uid} - {item?.Material_Name || ''}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label style={labelStyle}>
                      Status <span style={{ color: T.danger }}>*</span>
                      <span style={{
                        marginLeft: 8, fontSize: 10, color: T.textMuted,
                        background: T.borderLight, padding: '2px 6px', borderRadius: 4,
                      }}>→ Column AI</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <select value={status3}
                        onChange={(e) => setStatus3(e.target.value)}
                        disabled={isSaving}
                        style={{ ...inputStyle, paddingRight: 32, appearance: 'none', cursor: 'pointer' }}
                        onFocus={focusGold} onBlur={blurNormal}
                      >
                        <option value="">-- Select Status --</option>
                        <option value="Indent">📋 Indent</option>
                        <option value="No Indent">🚫 No Indent</option>
                        <option value="Shifting">🔄 Shifting</option>
                        <option value="PPE">🦺 PPE</option>
                      </select>
                      <ChevronDown size={14} style={{
                        position: 'absolute', right: 10, top: '50%',
                        transform: 'translateY(-50%)', color: T.textMuted, pointerEvents: 'none',
                      }} />
                    </div>
                  </div>

                  {/* Remark */}
                  <div>
                    <label style={labelStyle}>
                      Remark
                      <span style={{
                        marginLeft: 8, fontSize: 10, color: T.textMuted,
                        background: T.borderLight, padding: '2px 6px', borderRadius: 4,
                      }}>→ Column AJ</span>
                    </label>
                    <textarea value={remark3}
                      onChange={(e) => setRemark3(e.target.value)}
                      disabled={isSaving}
                      placeholder="Enter remark (optional)"
                      rows={3}
                      style={{ ...inputStyle, resize: 'vertical', minHeight: 70 }}
                      onFocus={focusGold} onBlur={blurNormal}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{
              padding: '14px 20px', borderTop: `1px solid ${T.border}`,
              background: T.borderLight,
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', gap: 10, flexShrink: 0,
            }}>
              {/* Hint */}
              <div>
                {currentStep === 1 && !canGoNext && (
                  <p style={{ fontSize: 12, color: T.textMuted, margin: 0 }}>
                    Select request & items to continue
                  </p>
                )}
                {currentStep === 2 && !status3 && (
                  <p style={{ fontSize: 12, color: T.danger, display: 'flex', alignItems: 'center', gap: 4, margin: 0 }}>
                    <AlertCircle size={14} /> Select status to save
                  </p>
                )}
                {currentStep === 2 && status3 && !saveSuccess && (
                  <p style={{ fontSize: 12, color: T.success, display: 'flex', alignItems: 'center', gap: 4, margin: 0 }}>
                    <CheckCircle size={14} /> Ready to save
                  </p>
                )}
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: 10 }}>
                {currentStep === 2 && (
                  <button onClick={() => setCurrentStep(1)} disabled={isSaving} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '10px 18px', borderRadius: 8,
                    border: `1.5px solid ${T.border}`, background: T.card,
                    color: T.textLight, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}>
                    <ArrowLeft size={14} /> Back
                  </button>
                )}

                <button onClick={closeModal} disabled={isSaving} style={{
                  padding: '10px 18px', borderRadius: 8,
                  border: `1.5px solid ${T.border}`, background: T.card,
                  color: T.textLight, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}>Cancel</button>

                {currentStep === 1 ? (
                  <button onClick={() => setCurrentStep(2)}
                    disabled={!canGoNext}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '10px 20px', borderRadius: 8, border: 'none',
                      background: canGoNext
                        ? `linear-gradient(135deg, ${T.gold}, ${T.goldDark})` : T.border,
                      color: canGoNext ? T.navyDark : T.textMuted,
                      fontSize: 13, fontWeight: 700,
                      cursor: canGoNext ? 'pointer' : 'not-allowed',
                      boxShadow: canGoNext ? `0 2px 8px ${T.gold}40` : 'none',
                      opacity: canGoNext ? 1 : 0.6,
                    }}
                  >
                    Next <ArrowRight size={14} />
                  </button>
                ) : (
                  <button onClick={handleSave} disabled={!canSave}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '10px 24px', borderRadius: 8, border: 'none',
                      background: saveSuccess ? T.success
                        : canSave ? `linear-gradient(135deg, ${T.gold}, ${T.goldDark})` : T.border,
                      color: saveSuccess ? 'white'
                        : canSave ? T.navyDark : T.textMuted,
                      fontSize: 13, fontWeight: 700,
                      cursor: canSave ? 'pointer' : 'not-allowed',
                      boxShadow: canSave ? `0 2px 8px ${T.gold}40` : 'none',
                      opacity: canSave || saveSuccess ? 1 : 0.6,
                      transition: 'all 0.2s',
                    }}
                  >
                    {isSaving ? (
                      <><Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> Saving...</>
                    ) : saveSuccess ? (
                      <><CheckCircle size={15} /> Saved!</>
                    ) : (
                      <><Check size={15} /> Save & Create Indent</>
                    )}
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

export default IndentToGetQuotation;