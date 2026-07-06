

import React, { useState, useEffect } from 'react';
import {
  Loader2, AlertCircle, CheckCircle, X, ChevronDown,
  RotateCcw, Package, FileText, ExternalLink, Check,
  Plus, ArrowLeft, ArrowRight, Share2
} from 'lucide-react';

const T = {
  navy: '#1e293b', navyLight: '#334155', navyDark: '#0f172a',
  gold: '#f59e0b', goldLight: '#fbbf24', goldDark: '#d97706',
  bg: '#f8fafc', card: '#ffffff', text: '#1e293b',
  textLight: '#64748b', textMuted: '#94a3b8',
  border: '#e2e8f0', borderLight: '#f1f5f9',
  success: '#10b981', successBg: '#ecfdf5', successBorder: '#a7f3d0',
  danger: '#ef4444', dangerBg: '#fef2f2', dangerBorder: '#fecaca',
  purple: '#7c3aed',
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

const MRN = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedPONumber, setSelectedPONumber] = useState('');
  const [selectedUIDs, setSelectedUIDs] = useState([]);
  const [selectedDetails, setSelectedDetails] = useState([]);
  const [poNumbers, setPoNumbers] = useState([]);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [showSuccessBox, setShowSuccessBox] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true); setError(null);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/get-MRN-Data`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setRequests(data.data);
        const poMap = data.data.reduce((acc, r) => {
          if (r.poNumber) {
            if (!acc[r.poNumber]) acc[r.poNumber] = [];
            if (r.UID && !acc[r.poNumber].includes(r.UID)) acc[r.poNumber].push(r.UID);
          }
          return acc;
        }, {});
        setPoNumbers(Object.keys(poMap).map(po => ({ poNumber: po, uids: poMap[po] })));
      }
    } catch (err) {
      console.error(err); setError('Failed to load data');
      setRequests([]); setPoNumbers([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleViewDetails = () => {
    if (selectedPONumber && selectedUIDs.length > 0) {
      const details = requests.filter(r => r.poNumber === selectedPONumber && selectedUIDs.includes(r.UID));
      if (details.length > 0) {
        setSelectedDetails(details);
        setIsModalOpen(false);
        setDetailsModalOpen(true);
      } else {
        setError('No details found for selection');
      }
    }
  };

  const toggleAll = (materials) => {
    if (selectedUIDs.length === materials.length) {
      setSelectedUIDs([]);
    } else {
      setSelectedUIDs(materials.map(r => r.UID).filter(Boolean));
    }
  };

  const toggleUID = (uid) => {
    setSelectedUIDs(prev => prev.includes(uid) ? prev.filter(u => u !== uid) : [...prev, uid]);
  };

  const handleShare = async (url) => {
    if (!url) return;
    if (navigator.share) {
      try { await navigator.share({ title: 'MRN PDF', url }); return; } catch (err) { }
    }
    try { await navigator.clipboard.writeText(url); alert('URL copied!'); } catch (err) { }
  };

  const handleCreatePDF = async () => {
    setIsSaving(true); setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/save-MRN-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          poNumber: selectedPONumber,
          purchaseFmsUIDs: selectedDetails.map(d => d.UID),
          finalReceivedQuantities: selectedDetails.map(d => d.finalReceivedQty || ''),
          vehicleNo: '-',
          deliveryDate: selectedDetails[0]?.deliveryDate || '',
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed');
      if (data.pdfUrl) {
        setPdfUrl(data.pdfUrl);
        setShowSuccessBox(true);
        setDetailsModalOpen(false);
        setSelectedDetails([]);
        setSelectedPONumber('');
        setSelectedUIDs([]);
        await fetchRequests();
      }
    } catch (err) {
      setError(err.message || 'Failed to create MRN');
    } finally { setIsSaving(false); }
  };

  // ✅ Table columns - Specification added
  const tableCols = [
    { label: '#', w: 50 }, { label: 'UID', w: 60 },
    { label: 'Req No', w: 90 }, { label: 'Site', w: 130 },
    { label: 'Supervisor', w: 120 }, { label: 'Material Type', w: 110 },
    { label: 'Material Name', w: 160 }, { label: 'Size', w: 90 },
    { label: 'Specification', w: 140 },  // ✅ NEW
    { label: 'SKU', w: 90 }, { label: 'Brand', w: 120 },
    { label: 'Rev Qty', w: 90 }, { label: 'Final Qty', w: 90 },
    { label: 'Unit', w: 60 }, { label: 'Indent No', w: 100 },
    { label: 'PO No', w: 90 }, { label: 'PDF', w: 70 },
    { label: 'Vendor', w: 140 },
  ];

  return (
    <div style={{ width: '100%' }}>

      {/* Header */}
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
            <FileText size={18} color={T.gold} />
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: T.navy, margin: 0 }}>MRN - Material Receipt Note</h2>
            <p style={{ fontSize: 12, color: T.textMuted, margin: 0 }}>{requests.length} pending items</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={fetchRequests} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 8,
            border: `1.5px solid ${T.border}`, background: T.card,
            color: T.textLight, fontSize: 13, fontWeight: 500, cursor: 'pointer',
          }}>
            <RotateCcw size={14} /> Refresh
          </button>
          <button onClick={() => { setIsModalOpen(true); setShowSuccessBox(false); setPdfUrl(null); }} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 18px', borderRadius: 8, border: 'none',
            background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
            color: T.navyDark, fontSize: 13, fontWeight: 700, cursor: 'pointer',
            boxShadow: `0 2px 8px ${T.gold}40`,
          }}>
            <Plus size={15} /> Create MRN
          </button>
        </div>
      </div>

      {/* Success Box */}
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
              <p style={{ fontSize: 14, fontWeight: 700, color: '#065f46', margin: 0 }}>MRN Generated!</p>
              <p style={{ fontSize: 12, color: T.textLight, margin: 0 }}>PDF ready</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '7px 14px', borderRadius: 8,
              background: T.navy, color: T.gold, fontSize: 12, fontWeight: 600, textDecoration: 'none',
            }}><ExternalLink size={13} /> View PDF</a>
            <button onClick={() => handleShare(pdfUrl)} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '7px 14px', borderRadius: 8, border: 'none',
              background: T.success, color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}><Share2 size={13} /> Share</button>
            <button onClick={() => setShowSuccessBox(false)} style={{
              padding: '7px', borderRadius: 8, border: 'none',
              background: 'transparent', color: T.textMuted, cursor: 'pointer',
            }}><X size={14} /></button>
          </div>
        </div>
      )}

      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px', background: T.dangerBg,
          border: `1px solid ${T.dangerBorder}`, borderRadius: 10,
          marginBottom: 16, fontSize: 13, color: T.danger,
        }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Table */}
      <div style={{
        background: T.card, borderRadius: 10, border: `1px solid ${T.border}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)', overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <Loader2 size={28} color={T.gold} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ fontSize: 13, color: T.textMuted }}>Loading...</p>
          </div>
        ) : requests.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <Package size={40} color={T.border} style={{ marginBottom: 12 }} />
            <p style={{ fontSize: 15, fontWeight: 500, color: T.textLight }}>No pending MRN items</p>
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
                    <Td><span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: 6, background: T.borderLight, fontSize: 12, fontWeight: 600, color: T.textLight }}>{idx + 1}</span></Td>
                    <Td><span style={{ background: `${T.navy}15`, color: T.navy, padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>{req.UID}</span></Td>
                    <Td><span style={{ background: `${T.gold}15`, color: T.goldDark, padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>{req.reqNo}</span></Td>
                    <Td maxW={130}>{req.siteName}</Td>
                    <Td maxW={110}>{req.supervisorName}</Td>
                    <Td>{req.materialType}</Td>
                    <Td maxW={150} bold>{req.materialName}</Td>
                    <Td>{req.materialSize && <span style={{ background: `${T.gold}15`, color: T.goldDark, padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>📏 {req.materialSize}</span>}</Td>
                    {/* ✅ NEW Specification column */}
                    <Td maxW={140}>
                      {req.materialSpecification ? (
                        <span style={{ background: `${T.purple}15`, color: T.purple, padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
                          📋 {req.materialSpecification}
                        </span>
                      ) : '—'}
                    </Td>
                    <Td>{req.skuCode && <span style={{ fontFamily: 'monospace', fontSize: 11, background: T.borderLight, padding: '2px 6px', borderRadius: 4 }}>{req.skuCode}</span>}</Td>
                    <Td maxW={110}>{req.brandName && <span style={{ background: `${T.purple}15`, color: T.purple, padding: '3px 8px', borderRadius: 5, fontSize: 11, fontWeight: 600 }}>{req.brandName}</span>}</Td>
                    <Td right>{req.revisedQuantity}</Td>
                    <Td right><span style={{ background: `${T.success}15`, color: T.success, padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>{req.finalReceivedQty || '—'}</span></Td>
                    <Td>{req.unitName}</Td>
                    <Td>{req.indentNumber3 && <span style={{ background: `${T.purple}15`, color: T.purple, padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{req.indentNumber3}</span>}</Td>
                    <Td>{req.poNumber && <span style={{ background: T.navy, color: T.gold, padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>{req.poNumber}</span>}</Td>
                    <td style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}`, textAlign: 'center' }}>
                      {req.pdfUrl6 ? (
                        <a href={req.pdfUrl6} target="_blank" rel="noopener noreferrer" style={{
                          display: 'inline-flex', alignItems: 'center', gap: 3,
                          padding: '4px 8px', borderRadius: 5,
                          background: T.navy, color: T.gold, fontSize: 11, fontWeight: 700, textDecoration: 'none',
                        }}><FileText size={11} /> PO</a>
                      ) : '—'}
                    </td>
                    <Td maxW={130}>{req.vendorFirmName5}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ═══ PO Selection Modal ═══ */}
      {isModalOpen && (
        <>
          <div onClick={() => { setIsModalOpen(false); setSelectedPONumber(''); setSelectedUIDs([]); }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(2px)', zIndex: 100 }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '95%', maxWidth: 500,
            background: T.card, borderRadius: 14,
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            zIndex: 101, display: 'flex', flexDirection: 'column',
            maxHeight: '80vh',
          }}>
            <div style={{
              background: T.navy, padding: '14px 20px',
              borderBottom: `2px solid ${T.gold}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderRadius: '14px 14px 0 0',
            }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'white', margin: 0 }}>Create MRN</h3>
              <button onClick={() => { setIsModalOpen(false); setSelectedPONumber(''); setSelectedUIDs([]); }}
                style={{ width: 30, height: 30, borderRadius: 6, border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>
                  PO Number <span style={{ color: T.danger }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <select value={selectedPONumber}
                    onChange={(e) => { setSelectedPONumber(e.target.value); setSelectedUIDs([]); }}
                    style={{ ...inputBase, paddingRight: 32, appearance: 'none', cursor: 'pointer' }}
                    onFocus={focusGold} onBlur={blurNormal}
                  >
                    <option value="">-- Select PO Number --</option>
                    {poNumbers.map(po => (
                      <option key={po.poNumber} value={po.poNumber}>{po.poNumber}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: T.textMuted, pointerEvents: 'none' }} />
                </div>
              </div>

              {selectedPONumber && (() => {
                const materials = requests.filter(r => r.poNumber === selectedPONumber);
                const allSelected = materials.length > 0 && selectedUIDs.length === materials.length;
                return (
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 8 }}>
                      Select Materials <span style={{ color: T.danger }}>*</span>
                      <span style={{ marginLeft: 8, fontSize: 11, color: T.textMuted, fontWeight: 500 }}>
                        ({selectedUIDs.length}/{materials.length})
                      </span>
                    </label>

                    <div onClick={() => toggleAll(materials)} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '8px 12px', marginBottom: 8,
                      background: T.borderLight, borderRadius: 8,
                      cursor: 'pointer', fontSize: 13, fontWeight: 600, color: T.navy,
                      border: `1px solid ${T.border}`,
                    }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: 4,
                        border: `2px solid ${allSelected ? T.gold : T.border}`,
                        background: allSelected ? T.gold : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {allSelected && <Check size={12} color={T.navyDark} strokeWidth={3} />}
                      </div>
                      Select All
                    </div>

                    <div style={{
                      maxHeight: 250, overflowY: 'auto',
                      border: `1px solid ${T.border}`, borderRadius: 8,
                    }}>
                      {materials.map((r, i) => {
                        const isSelected = selectedUIDs.includes(r.UID);
                        return (
                          <div key={r.UID}
                            onClick={() => toggleUID(r.UID)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 10,
                              padding: '10px 12px', cursor: 'pointer',
                              background: isSelected ? `${T.gold}08` : i % 2 === 0 ? T.card : T.borderLight,
                              borderBottom: i < materials.length - 1 ? `1px solid ${T.border}` : 'none',
                            }}
                          >
                            <div style={{
                              width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                              border: `2px solid ${isSelected ? T.gold : T.border}`,
                              background: isSelected ? T.gold : 'transparent',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              {isSelected && <Check size={12} color={T.navyDark} strokeWidth={3} />}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 12, fontWeight: 600, color: T.navy, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                {r.materialName}
                                {r.materialSize && <span style={{ fontSize: 10, background: `${T.gold}15`, color: T.goldDark, padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>📏 {r.materialSize}</span>}
                                {/* ✅ Specification badge */}
                                {r.materialSpecification && <span style={{ fontSize: 10, background: `${T.purple}15`, color: T.purple, padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>📋 {r.materialSpecification}</span>}
                              </div>
                              <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>
                                UID: {r.UID} | SKU: {r.skuCode} | Qty: {r.finalReceivedQty}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>

            <div style={{
              padding: '14px 20px', borderTop: `1px solid ${T.border}`,
              display: 'flex', justifyContent: 'flex-end', gap: 10,
              borderRadius: '0 0 14px 14px',
            }}>
              <button onClick={() => { setIsModalOpen(false); setSelectedPONumber(''); setSelectedUIDs([]); }}
                style={{ padding: '10px 20px', borderRadius: 8, border: `1.5px solid ${T.border}`, background: T.card, color: T.textLight, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleViewDetails}
                disabled={!selectedPONumber || selectedUIDs.length === 0}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '10px 24px', borderRadius: 8, border: 'none',
                  background: selectedPONumber && selectedUIDs.length > 0
                    ? `linear-gradient(135deg, ${T.gold}, ${T.goldDark})` : T.border,
                  color: selectedPONumber && selectedUIDs.length > 0 ? T.navyDark : T.textMuted,
                  fontSize: 13, fontWeight: 700,
                  cursor: selectedPONumber && selectedUIDs.length > 0 ? 'pointer' : 'not-allowed',
                }}>
                View Details <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </>
      )}

      {/* ═══ Details Modal ═══ */}
      {detailsModalOpen && (
        <>
          <div onClick={() => { setDetailsModalOpen(false); setSelectedDetails([]); }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(2px)', zIndex: 100 }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '95%', maxWidth: 1200,
            background: T.card, borderRadius: 14,
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            zIndex: 101, display: 'flex', flexDirection: 'column',
            maxHeight: '92vh',
          }}>
            <div style={{
              background: T.navy, padding: '14px 20px',
              borderBottom: `2px solid ${T.gold}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderRadius: '14px 14px 0 0',
            }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'white', margin: 0 }}>
                  Create MRN — PO: <span style={{ color: T.gold }}>{selectedPONumber}</span>
                </h3>
                <p style={{ fontSize: 11, color: T.textMuted, margin: 0 }}>
                  {selectedDetails.length} materials selected
                </p>
              </div>
              <button onClick={() => { setDetailsModalOpen(false); setSelectedDetails([]); }}
                style={{ width: 30, height: 30, borderRadius: 6, border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: T.navy }}>
                      {/* ✅ Specification column added */}
                      {['UID', 'Req No', 'Site', 'Supervisor', 'Material', 'Size', 'Specification', 'SKU', 'Rev Qty', 'Final Qty', 'Unit', 'Indent No', 'Vendor'].map((h, i) => (
                        <th key={i} style={{ padding: '10px 12px', color: T.gold, fontSize: 10, fontWeight: 700, textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedDetails.map((d, i) => (
                      <tr key={d.UID} style={{ background: i % 2 === 0 ? T.card : T.borderLight }}>
                        <td style={{ padding: '8px 12px', fontWeight: 700 }}>{d.UID}</td>
                        <td style={{ padding: '8px 12px' }}>{d.reqNo}</td>
                        <td style={{ padding: '8px 12px' }}>{d.siteName}</td>
                        <td style={{ padding: '8px 12px' }}>{d.supervisorName}</td>
                        <td style={{ padding: '8px 12px', fontWeight: 600 }}>{d.materialName}</td>
                        <td style={{ padding: '8px 12px' }}>{d.materialSize && <span style={{ background: `${T.gold}15`, color: T.goldDark, padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600 }}>{d.materialSize}</span>}</td>
                        {/* ✅ NEW Specification column */}
                        <td style={{ padding: '8px 12px' }}>{d.materialSpecification && <span style={{ background: `${T.purple}15`, color: T.purple, padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600 }}>{d.materialSpecification}</span>}</td>
                        <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: 11 }}>{d.skuCode}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right' }}>{d.revisedQuantity}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: T.success }}>{d.finalReceivedQty}</td>
                        <td style={{ padding: '8px 12px' }}>{d.unitName}</td>
                        <td style={{ padding: '8px 12px' }}>{d.indentNumber3}</td>
                        <td style={{ padding: '8px 12px' }}>{d.vendorFirmName5}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{
              padding: '14px 20px', borderTop: `1px solid ${T.border}`,
              display: 'flex', justifyContent: 'flex-end', gap: 10,
              borderRadius: '0 0 14px 14px',
            }}>
              <button onClick={() => { setDetailsModalOpen(false); setSelectedDetails([]); setSelectedPONumber(''); setSelectedUIDs([]); }}
                style={{ padding: '10px 20px', borderRadius: 8, border: `1.5px solid ${T.border}`, background: T.card, color: T.textLight, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleCreatePDF} disabled={isSaving || selectedDetails.length === 0}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '10px 24px', borderRadius: 8, border: 'none',
                  background: isSaving ? T.border : `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
                  color: isSaving ? T.textMuted : T.navyDark,
                  fontSize: 13, fontWeight: 700,
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  boxShadow: isSaving ? 'none' : `0 2px 8px ${T.gold}40`,
                }}>
                {isSaving ? (
                  <><Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> Creating MRN...</>
                ) : (
                  <><CheckCircle size={15} /> Create MRN & PDF</>
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

export default MRN;