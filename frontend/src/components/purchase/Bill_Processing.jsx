
import React, { useState, useEffect } from "react";
import {
  Loader2, AlertCircle, CheckCircle, X, ChevronDown,
  RotateCcw, Package, FileText, Edit3, ExternalLink,
  Phone, ArrowRight
} from "lucide-react";

// ── Theme (Same as Step 10) ────────────────────────────────
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

// ── Td helper ──────────────────────────────────────────────
const Td = ({ children, right, maxW, center, bold }) => (
  <td style={{
    padding: '10px 14px', fontSize: 13, color: T.text,
    borderBottom: `1px solid ${T.border}`, whiteSpace: 'nowrap',
    textAlign: right ? 'right' : center ? 'center' : 'left',
    fontWeight: bold ? 600 : 400,
  }}>
    {maxW ? (
      <span
        title={typeof children === 'string' ? children : ''}
        style={{ display: 'block', maxWidth: maxW, overflow: 'hidden', textOverflow: 'ellipsis' }}
      >
        {children || <span style={{ color: T.textMuted }}>—</span>}
      </span>
    ) : (
      children || <span style={{ color: T.textMuted }}>—</span>
    )}
  </td>
);

// ════════════════════════════════════════════════════════════
const Bill_Processing_11 = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const [selectedPONumber, setSelectedPONumber] = useState('');
  const [poDetails, setPoDetails] = useState(null);
  const [poNumbers, setPoNumbers] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceFile, setInvoiceFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [status, setStatus] = useState('Done');
  const [remark, setRemark] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // ── Fetch ────────────────────────────────────────────────
  const fetchRequests = async () => {
    try {
      setLoading(true); setError(null);
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/bill-processing-11`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setRequests(data.data);
        setPoNumbers([
          ...new Set(data.data.map(r => r.poNumber).filter(Boolean))
        ]);
      } else {
        throw new Error('Invalid API response');
      }
    } catch (err) {
      setError(err.message);
      setRequests([]);
      setPoNumbers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  // ── PO → Items ───────────────────────────────────────────
  const handleFetchPODetails = () => {
    if (!selectedPONumber) return;
    const details = requests.filter(r => r.poNumber === selectedPONumber);
    if (details.length > 0) {
      setPoDetails(details);
      setSelectedItems(details.map(i => i.UID));
      setIsModalOpen(false);
      setItemModalOpen(true);
    } else {
      setError('No items found for this PO');
    }
  };

  const handleSelectAll = (e) => {
    setSelectedItems(e.target.checked ? poDetails.map(i => i.UID) : []);
  };

  const handleItemSelect = (uid) => {
    setSelectedItems(prev =>
      prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]
    );
  };

  // ── File ─────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError('File too large! Max 10MB.');
      return;
    }
    setInvoiceFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
  };

  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
    });

  // ── Submit ───────────────────────────────────────────────
  const handleSubmitBill = async (e) => {
    e.preventDefault();
    setError(null);

    if (!invoiceNumber || !invoiceFile || !status || !remark || selectedItems.length === 0) {
      setError('All fields required & at least one item must be selected');
      return;
    }

    setUploading(true);
    try {
      const imageBase64 = await getBase64(invoiceFile);
      const payload = { uids: selectedItems, invoiceNumber, status, remark, image: imageBase64 };

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/submit-bill-11`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');

      setSaveSuccess(true);
      setTimeout(() => { closeAllModals(); fetchRequests(); }, 1500);
    } catch (err) {
      setError(err.message || 'Submission failed.');
    } finally {
      setUploading(false);
    }
  };

  // ── Reset ────────────────────────────────────────────────
  const closeAllModals = () => {
    setDetailsModalOpen(false); setItemModalOpen(false); setIsModalOpen(false);
    setSelectedPONumber(''); setPoDetails(null); setSelectedItems([]);
    setInvoiceFile(null); setPreviewUrl(null); setInvoiceNumber('');
    setRemark(''); setStatus('Done'); setSaveSuccess(false); setError(null);
  };

  // ── Table Columns ────────────────────────────────────────
  const tableCols = [
    { label: '#', w: 50 },
    { label: 'Planned 11', w: 110 },
    { label: 'UID', w: 70 },
    { label: 'Project', w: 130 },
    { label: 'Material', w: 160 },
    { label: 'Size', w: 80 },
    { label: 'Rev Qty', w: 80 },
    { label: 'Received', w: 80 },
    { label: 'Unit', w: 60 },
    { label: 'Vendor', w: 140 },
    { label: 'Contact', w: 110 },
    { label: 'PO No', w: 100 },
    { label: 'PO PDF', w: 80 },
    { label: 'MRN No', w: 90 },
    { label: 'MRN PDF', w: 80 },
    // { label: 'Status 11', w: 100 },
    // { label: 'Invoice No', w: 110 },
    // { label: 'Invoice File', w: 90 },
    { label: 'Remark', w: 130 },
  ];

  // ════════════════════════════════════════════════════════
  return (
    <div style={{ width: '100%' }}>

      {/* ── Header ─────────────────────────────────────── */}
      <div style={{
        background: T.card, borderRadius: 10, border: `1px solid ${T.border}`,
        padding: '16px 20px', marginBottom: 16,
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
            <h2 style={{ fontSize: 16, fontWeight: 700, color: T.navy, margin: 0 }}>
              Bill Processing — Step 11
            </h2>
            <p style={{ fontSize: 12, color: T.textMuted, margin: 0 }}>
              {requests.length} pending bills
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={fetchRequests} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 8,
            border: `1.5px solid ${T.border}`, background: T.card,
            color: T.textLight, fontSize: 13, cursor: 'pointer',
          }}>
            <RotateCcw size={14} /> Refresh
          </button>
          <button onClick={() => setIsModalOpen(true)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 18px', borderRadius: 8, border: 'none',
            background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
            color: T.navyDark, fontSize: 13, fontWeight: 700, cursor: 'pointer',
            boxShadow: `0 2px 8px ${T.gold}40`,
          }}>
            <Edit3 size={15} /> Start Bill Processing
          </button>
        </div>
      </div>

      {/* ── Main Table ─────────────────────────────────── */}
      <div style={{
        background: T.card, borderRadius: 10,
        border: `1px solid ${T.border}`, overflow: 'hidden',
      }}>
        {loading && !requests.length ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <Loader2 size={28} color={T.gold}
              style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ color: T.textMuted }}>Loading...</p>
          </div>
        ) : requests.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <Package size={40} color={T.border} style={{ marginBottom: 12 }} />
            <p style={{ color: T.textLight }}>No pending bills</p>
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
                {requests.map((r, idx) => (
                  <tr
                    key={r.UID + idx}
                    style={{ background: idx % 2 === 0 ? T.card : T.borderLight }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${T.gold}08`; }}
                    onMouseLeave={e => { e.currentTarget.style.background = idx % 2 === 0 ? T.card : T.borderLight; }}
                  >
                    {/* # */}
                    <Td>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 26, height: 26, borderRadius: 6,
                        background: T.borderLight, fontSize: 12, fontWeight: 600, color: T.textLight,
                      }}>{idx + 1}</span>
                    </Td>

                    {/* Planned 11 */}
                    <Td>{r.planned11}</Td>

                    {/* UID */}
                    <Td>
                      <span style={{
                        background: `${T.navy}15`, color: T.navy,
                        padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700,
                      }}>{r.UID}</span>
                    </Td>

                    {/* Project Name */}
                    <Td maxW={130}>{r.projectName}</Td>

                    {/* Material Name */}
                    <Td maxW={150} bold>{r.materialName}</Td>

                    {/* Size */}
                    <Td>
                      {r.materialSize && (
                        <span style={{
                          background: `${T.gold}15`, color: T.goldDark,
                          padding: '2px 7px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                        }}>{r.materialSize}</span>
                      )}
                    </Td>

                    {/* Rev Qty */}
                    <Td right>{r.revisedQuantity}</Td>

                    {/* Received */}
                    <Td right>
                      <span style={{
                        background: r.finalReceivedQty ? `${T.success}15` : T.borderLight,
                        color: r.finalReceivedQty ? T.success : T.textMuted,
                        padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700,
                      }}>{r.finalReceivedQty || '—'}</span>
                    </Td>

                    {/* Unit */}
                    <Td>{r.unitName}</Td>

                    {/* Vendor */}
                    <Td maxW={130} bold>{r.vendorFirmName}</Td>

                    {/* Contact */}
                    <Td>
                      {r.vendorContact && (
                        <a href={`tel:${r.vendorContact}`} style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          color: T.navy, fontSize: 12, fontWeight: 600, textDecoration: 'none',
                        }}>
                          <Phone size={11} /> {r.vendorContact}
                        </a>
                      )}
                    </Td>

                    {/* PO No */}
                    <Td>
                      {r.poNumber && (
                        <span style={{
                          background: T.navy, color: T.gold,
                          padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                        }}>{r.poNumber}</span>
                      )}
                    </Td>

                    {/* PO PDF */}
                    <Td center>
                      {r.poPdf && (
                        <a href={r.poPdf} target="_blank" rel="noopener noreferrer"
                          style={{ color: T.navy, fontSize: 12 }}>
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </Td>

                    {/* MRN No */}
                    <Td>
                      {r.mrnNo && (
                        <span style={{
                          background: `${T.purple}15`, color: T.purple,
                          padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                        }}>{r.mrnNo}</span>
                      )}
                    </Td>

                    {/* MRN PDF */}
                    <Td center>
                      {r.mrnPdf && (
                        <a href={r.mrnPdf} target="_blank" rel="noopener noreferrer"
                          style={{ color: T.navy, fontSize: 12 }}>
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </Td>

                    {/* Status 11 */}
                    {/* <Td>
                      {r.status11 ? (
                        <span style={{
                          background: r.status11 === 'Done' ? `${T.success}15`
                            : r.status11 === 'Hold' ? `${T.danger}15` : T.borderLight,
                          color: r.status11 === 'Done' ? T.success
                            : r.status11 === 'Hold' ? T.danger : T.text,
                          padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                        }}>{r.status11}</span>
                      ) : (
                        <span style={{ color: T.textMuted }}>Pending</span>
                      )}
                    </Td> */}

                    {/* Invoice No */}
                    {/* <Td>{r.invoice11}</Td>

                    {/* Invoice Photo */}
                    {/* <Td center>
                      {r.invoicePhoto11 && (
                        <a href={r.invoicePhoto11} target="_blank" rel="noopener noreferrer"
                          style={{ color: T.navy }}>
                          <ExternalLink size={14} />
                        </a>
                      )} */}
                    {/* </Td>  */}

                    {/* Remark */}
                    <Td maxW={120}>{r.remark11}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ════ MODAL 1: PO Selection ════════════════════════ */}
      {isModalOpen && (
        <>
          <div onClick={() => setIsModalOpen(false)} style={{
            position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)',
            backdropFilter: 'blur(2px)', zIndex: 100,
          }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '95%', maxWidth: 420,
            background: T.card, borderRadius: 14,
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            zIndex: 101, overflow: 'hidden',
          }}>
            <div style={{
              background: T.navy, padding: '14px 20px',
              borderBottom: `2px solid ${T.gold}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'white', margin: 0 }}>
                Select PO Number
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{
                width: 28, height: 28, borderRadius: 6, border: 'none',
                background: 'rgba(255,255,255,0.1)', color: 'white',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><X size={14} /></button>
            </div>
            <div style={{ padding: '20px' }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>
                PO Number <span style={{ color: T.danger }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <select value={selectedPONumber}
                  onChange={e => setSelectedPONumber(e.target.value)}
                  style={{ ...inputBase, paddingRight: 32, appearance: 'none', cursor: 'pointer' }}
                  onFocus={focusGold} onBlur={blurNormal}
                >
                  <option value="">-- Select PO --</option>
                  {poNumbers.map(po => (<option key={po} value={po}>{po}</option>))}
                </select>
                <ChevronDown size={14} style={{
                  position: 'absolute', right: 10, top: '50%',
                  transform: 'translateY(-50%)', color: T.textMuted, pointerEvents: 'none',
                }} />
              </div>
            </div>
            <div style={{
              padding: '14px 20px', borderTop: `1px solid ${T.border}`,
              display: 'flex', justifyContent: 'flex-end', gap: 10,
            }}>
              <button onClick={() => setIsModalOpen(false)} style={{
                padding: '8px 16px', borderRadius: 8,
                border: `1.5px solid ${T.border}`, background: T.card,
                color: T.textLight, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>Cancel</button>
              <button onClick={handleFetchPODetails} disabled={!selectedPONumber} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '8px 20px', borderRadius: 8, border: 'none',
                background: selectedPONumber
                  ? `linear-gradient(135deg, ${T.gold}, ${T.goldDark})` : T.border,
                color: selectedPONumber ? T.navyDark : T.textMuted,
                fontSize: 13, fontWeight: 700,
                cursor: selectedPONumber ? 'pointer' : 'not-allowed',
              }}>
                Next <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </>
      )}

      {/* ════ MODAL 2: Item Selection ══════════════════════ */}
      {itemModalOpen && poDetails && (
        <>
          <div onClick={closeAllModals} style={{
            position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)',
            backdropFilter: 'blur(2px)', zIndex: 100,
          }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '95%', maxWidth: 800,
            background: T.card, borderRadius: 14,
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            zIndex: 101, display: 'flex', flexDirection: 'column',
            maxHeight: '85vh',
          }}>
            <div style={{
              background: T.navy, padding: '14px 20px',
              borderBottom: `2px solid ${T.gold}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderRadius: '14px 14px 0 0',
            }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'white', margin: 0 }}>
                  Select Items — PO: <span style={{ color: T.gold }}>{selectedPONumber}</span>
                </h3>
                <p style={{ fontSize: 11, color: T.textMuted, margin: 0 }}>
                  {selectedItems.length} / {poDetails.length} selected
                </p>
              </div>
              <button onClick={closeAllModals} style={{
                width: 30, height: 30, borderRadius: 6, border: 'none',
                background: 'rgba(255,255,255,0.1)', color: 'white',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><X size={16} /></button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: T.borderLight }}>
                      <th style={{ padding: '10px 12px' }}>
                        <input type="checkbox" onChange={handleSelectAll}
                          checked={selectedItems.length === poDetails.length} />
                      </th>
                      {['UID', 'Site', 'Material', 'Vendor', 'Unit', 'Rev Qty', 'Rec Qty'].map(h => (
                        <th key={h} style={{
                          padding: '10px 12px', textAlign: 'left',
                          fontSize: 12, fontWeight: 700, color: T.navy,
                          borderBottom: `2px solid ${T.border}`,
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {poDetails.map((item, i) => (
                      <tr key={item.UID}
                        style={{ background: i % 2 === 0 ? T.card : T.borderLight }}
                        onMouseEnter={e => { e.currentTarget.style.background = `${T.gold}08`; }}
                        onMouseLeave={e => { e.currentTarget.style.background = i % 2 === 0 ? T.card : T.borderLight; }}
                      >
                        <td style={{ padding: '10px 12px' }}>
                          <input type="checkbox"
                            checked={selectedItems.includes(item.UID)}
                            onChange={() => handleItemSelect(item.UID)} />
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{
                            background: `${T.navy}15`, color: T.navy,
                            padding: '2px 7px', borderRadius: 5, fontWeight: 700, fontSize: 12,
                          }}>{item.UID}</span>
                        </td>
                        <td style={{ padding: '10px 12px' }}>{item.projectName}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 600 }}>{item.materialName}</td>
                        <td style={{ padding: '10px 12px' }}>{item.vendorFirmName}</td>
                        <td style={{ padding: '10px 12px' }}>{item.unitName}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>{item.revisedQuantity}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>{item.finalReceivedQty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {error && (
                <div style={{
                  marginTop: 12, padding: '10px 14px',
                  background: T.dangerBg, border: `1px solid ${T.dangerBorder}`,
                  borderRadius: 8, fontSize: 13, color: T.danger,
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <AlertCircle size={15} /> {error}
                </div>
              )}
            </div>

            <div style={{
              padding: '14px 20px', borderTop: `1px solid ${T.border}`,
              background: T.borderLight,
              display: 'flex', justifyContent: 'space-between', gap: 10,
              borderRadius: '0 0 14px 14px',
            }}>
              <button onClick={() => { setItemModalOpen(false); setIsModalOpen(true); }} style={{
                padding: '8px 20px', borderRadius: 8,
                border: `1.5px solid ${T.border}`, background: T.card,
                color: T.textLight, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>← Previous</button>
              <button onClick={() => {
                if (selectedItems.length > 0) {
                  setError(null); setItemModalOpen(false); setDetailsModalOpen(true);
                } else { setError('Select at least one item'); }
              }} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '8px 20px', borderRadius: 8, border: 'none',
                background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
                color: T.navyDark, fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}>
                Next <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </>
      )}

      {/* ════ MODAL 3: Invoice Details ═════════════════════ */}
      {detailsModalOpen && (
        <>
          <div onClick={closeAllModals} style={{
            position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)',
            backdropFilter: 'blur(2px)', zIndex: 100,
          }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '95%', maxWidth: 560,
            background: T.card, borderRadius: 14,
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            zIndex: 101, display: 'flex', flexDirection: 'column',
            maxHeight: '90vh',
          }}>
            <div style={{
              background: T.navy, padding: '14px 20px',
              borderBottom: `2px solid ${T.gold}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderRadius: '14px 14px 0 0',
            }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'white', margin: 0 }}>
                  Invoice Details — Step 11
                </h3>
                <p style={{ fontSize: 11, color: T.textMuted, margin: 0 }}>
                  {selectedItems.length} items selected
                </p>
              </div>
              <button onClick={closeAllModals} style={{
                width: 30, height: 30, borderRadius: 6, border: 'none',
                background: 'rgba(255,255,255,0.1)', color: 'white',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><X size={16} /></button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>

              {saveSuccess && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 14px', background: T.successBg,
                  border: `1px solid ${T.successBorder}`, borderRadius: 8,
                  marginBottom: 16, fontSize: 13, color: '#065f46',
                }}>
                  <CheckCircle size={16} color={T.success} /> Submitted successfully!
                </div>
              )}

              {error && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 14px', background: T.dangerBg,
                  border: `1px solid ${T.dangerBorder}`, borderRadius: 8,
                  marginBottom: 16, fontSize: 13, color: T.danger,
                }}>
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <form onSubmit={handleSubmitBill}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                  {/* Invoice Number → BH */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>
                      Invoice Number <span style={{ color: T.danger }}>*</span>
                      <span style={{ marginLeft: 8, fontSize: 10, color: T.textMuted, background: T.borderLight, padding: '2px 6px', borderRadius: 4 }}>→ Column BH</span>
                    </label>
                    <input type="text" value={invoiceNumber}
                      onChange={e => setInvoiceNumber(e.target.value)}
                      placeholder="Enter invoice number..."
                      style={inputBase} onFocus={focusGold} onBlur={blurNormal} required />
                  </div>

                  {/* File Upload → BI */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 8 }}>
                      Invoice File (PDF/Image) <span style={{ color: T.danger }}>*</span>
                      <span style={{ marginLeft: 8, fontSize: 10, color: T.textMuted, background: T.borderLight, padding: '2px 6px', borderRadius: 4 }}>→ Column BI</span>
                    </label>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <input type="file" accept="image/*,.pdf" onChange={handleFileChange}
                        id="upload-file-11" style={{ display: 'none' }} />
                      <label htmlFor="upload-file-11" style={{
                        padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
                        background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`,
                        color: 'white', fontSize: 13, fontWeight: 600,
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                      }}>
                        <FileText size={14} /> Upload File
                      </label>

                      <input type="file" accept="image/*" capture="environment"
                        onChange={handleFileChange} id="capture-photo-11" style={{ display: 'none' }} />
                      <label htmlFor="capture-photo-11" style={{
                        padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
                        background: `linear-gradient(135deg, ${T.success}, #059669)`,
                        color: 'white', fontSize: 13, fontWeight: 600,
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                      }}>
                        📷 Camera
                      </label>
                    </div>

                    {invoiceFile && (
                      <p style={{ marginTop: 8, fontSize: 12, color: T.textLight }}>
                        ✅ Selected: {invoiceFile.name}
                      </p>
                    )}

                    {previewUrl && (
                      <div style={{
                        marginTop: 12, padding: 12,
                        border: `1px solid ${T.border}`, borderRadius: 8,
                        background: T.borderLight, maxHeight: 260, overflow: 'auto',
                      }}>
                        {invoiceFile?.type === 'application/pdf' ? (
                          <iframe src={previewUrl} title="PDF Preview"
                            style={{ width: '100%', height: 220, border: 'none' }} />
                        ) : (
                          <img src={previewUrl} alt="Preview"
                            style={{ maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto' }} />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Status → BG */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>
                      Status <span style={{ color: T.danger }}>*</span>
                      <span style={{ marginLeft: 8, fontSize: 10, color: T.textMuted, background: T.borderLight, padding: '2px 6px', borderRadius: 4 }}>→ Column BG</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <select value={status} onChange={e => setStatus(e.target.value)}
                        style={{ ...inputBase, paddingRight: 32, appearance: 'none', cursor: 'pointer' }}
                        onFocus={focusGold} onBlur={blurNormal}>
                        <option value="Done">✅ Done</option>
                        <option value="Hold">⏸️ Hold</option>
                      </select>
                      <ChevronDown size={14} style={{
                        position: 'absolute', right: 10, top: '50%',
                        transform: 'translateY(-50%)', color: T.textMuted, pointerEvents: 'none',
                      }} />
                    </div>
                  </div>

                  {/* Remark → BK */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>
                      Remark <span style={{ color: T.danger }}>*</span>
                      <span style={{ marginLeft: 8, fontSize: 10, color: T.textMuted, background: T.borderLight, padding: '2px 6px', borderRadius: 4 }}>→ Column BK</span>
                    </label>
                    <textarea value={remark} onChange={e => setRemark(e.target.value)}
                      placeholder="Enter remark..."
                      rows={3}
                      style={{ ...inputBase, resize: 'vertical', minHeight: 80 }}
                      onFocus={focusGold} onBlur={blurNormal} required />
                  </div>

                  {/* Buttons */}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    paddingTop: 16, borderTop: `1px solid ${T.border}`,
                  }}>
                    <button type="button"
                      onClick={() => { setDetailsModalOpen(false); setItemModalOpen(true); }}
                      style={{
                        padding: '10px 20px', borderRadius: 8,
                        border: `1.5px solid ${T.border}`, background: T.card,
                        color: T.textLight, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      }}>← Previous</button>

                    <button type="submit" disabled={uploading || saveSuccess}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '10px 24px', borderRadius: 8, border: 'none',
                        background: saveSuccess ? T.success
                          : uploading ? T.border
                          : `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
                        color: saveSuccess ? 'white' : uploading ? T.textMuted : T.navyDark,
                        fontSize: 13, fontWeight: 700,
                        cursor: uploading || saveSuccess ? 'not-allowed' : 'pointer',
                      }}>
                      {uploading ? (
                        <><Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> Uploading...</>
                      ) : saveSuccess ? (
                        <><CheckCircle size={15} /> Done!</>
                      ) : (
                        <><CheckCircle size={15} /> Submit Bill</>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Bill_Processing_11;