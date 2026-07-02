import React, { useState, useEffect } from 'react';
import {
  Loader2, AlertCircle, CheckCircle, X,
  ChevronDown, RotateCcw, Package, Edit3,
  ExternalLink, Phone, ArrowRight
} from 'lucide-react';

const T = {
  navy: '#1e293b', navyLight: '#334155', navyDark: '#0f172a',
  gold: '#f59e0b', goldLight: '#fbbf24', goldDark: '#d97706',
  card: '#ffffff', text: '#1e293b',
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

const focusGold = e => {
  e.target.style.borderColor = T.gold;
  e.target.style.boxShadow = `0 0 0 3px ${T.gold}15`;
  e.target.style.background = T.card;
};
const blurNormal = e => {
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
      <span title={typeof children === 'string' ? children : ''}
        style={{ display: 'block', maxWidth: maxW, overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {children || <span style={{ color: T.textMuted }}>—</span>}
      </span>
    ) : (children || <span style={{ color: T.textMuted }}>—</span>)}
  </td>
);

const BillCheckedData12 = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isItemsModalOpen, setIsItemsModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const [selectedInvoice, setSelectedInvoice] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('');
  const [vendorOptions, setVendorOptions] = useState([]);
  const [invoiceNumbers, setInvoiceNumbers] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedUIDs, setSelectedUIDs] = useState([]);

  const [formData, setFormData] = useState({ STATUS_12: '', REMARK_12: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true); setError(null);
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/Bill_Checked_12`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();

      if (result.success && Array.isArray(result.data)) {
        setData(result.data);
        setInvoiceNumbers([
          ...new Set(result.data.map(i => i.invoice11).filter(Boolean))
        ]);
      } else {
        throw new Error('Invalid data format');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleOpenFilterModal = () => {
    setSelectedInvoice(''); setSelectedVendor('');
    setVendorOptions([]); setSelectedUIDs([]);
    setFilteredItems([]); setIsFilterModalOpen(true);
  };

  const handleInvoiceSelect = e => {
    const invoice = e.target.value;
    setSelectedInvoice(invoice);
    setSelectedVendor(''); setVendorOptions([]);
    if (invoice) {
      const vendors = [...new Set(
        data.filter(item => item.invoice11 === invoice)
          .map(item => item.vendorFirmName).filter(Boolean)
      )];
      setVendorOptions(vendors);
      if (vendors.length === 1) setSelectedVendor(vendors[0]);
    }
  };

  const handleNextToItems = () => {
    if (selectedInvoice && selectedVendor) {
      const filtered = data.filter(
        item => item.invoice11 === selectedInvoice && item.vendorFirmName === selectedVendor
      );
      setFilteredItems(filtered);
      setSelectedUIDs(filtered.map(i => i.UID));
      setIsFilterModalOpen(false);
      setIsItemsModalOpen(true);
    }
  };

  const handleSelectAll = e => {
    setSelectedUIDs(e.target.checked ? filteredItems.map(i => i.UID) : []);
  };

  const handleUIDSelect = uid => {
    setSelectedUIDs(prev =>
      prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]
    );
  };

  const handleNextToStatus = () => {
    if (selectedUIDs.length > 0) {
      setIsItemsModalOpen(false);
      setIsStatusModalOpen(true);
    } else {
      setError('Select at least one material.');
    }
  };

  const handleStatusSubmit = async () => {
    if (!formData.STATUS_12 || !formData.REMARK_12) {
      setError('Status and Remark required'); return;
    }
    setIsSubmitting(true); setError(null);
    try {
      const payload = {
        updates: selectedUIDs.map(uid => ({
          uid: String(uid).trim(),
          STATUS_12: formData.STATUS_12,
          REMARK_12: formData.REMARK_12,
        })),
      };
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/bill_checked_status_12`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed');
      setSaveSuccess(true);
      setTimeout(() => { handleCancel(); fetchData(); }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsFilterModalOpen(false); setIsItemsModalOpen(false); setIsStatusModalOpen(false);
    setSelectedInvoice(''); setSelectedVendor(''); setVendorOptions([]);
    setFilteredItems([]); setSelectedUIDs([]);
    setFormData({ STATUS_12: '', REMARK_12: '' });
    setSaveSuccess(false); setError(null);
  };

  // ── Table Columns - ALL FIELDS INCLUDING NEW ONES ────────
  const tableCols = [
    { label: '#', w: 50 },
    { label: 'Planned 12', w: 110 },
    { label: 'UID', w: 70 },
    { label: 'Site Name', w: 130 },
    { label: 'Engineer', w: 120 },
    { label: 'Material Type', w: 120 },
    { label: 'Material Name', w: 160 },
    { label: 'Material Size', w: 110 },
    { label: 'Specification', w: 140 },
    { label: 'Brand Name', w: 120 },
    { label: 'SKU Code', w: 100 },
    { label: 'Revised Qty', w: 90 },
    { label: 'Received Qty', w: 90 },
    { label: 'Unit', w: 60 },
    { label: 'Indent No', w: 100 },
    { label: 'Indent PDF', w: 80 },
    { label: 'Quotation No', w: 110 },
    { label: 'Quotation PDF', w: 90 },
    { label: 'PO Number', w: 100 },
    { label: 'PO PDF', w: 80 },
    { label: 'MRN No', w: 90 },
    { label: 'MRN PDF', w: 80 },
    { label: 'Vendor', w: 140 },
    { label: 'Contact', w: 110 },
    { label: 'Invoice 11', w: 110 },
    { label: 'Invoice File', w: 90 },
    { label: 'Status 12', w: 100 },
    { label: 'Remark 12', w: 130 },
    { label: 'Action', w: 80 },
  ];

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
            <Edit3 size={18} color={T.gold} />
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: T.navy, margin: 0 }}>
              Bill Checked — Step 12
            </h2>
            <p style={{ fontSize: 12, color: T.textMuted, margin: 0 }}>{data.length} pending</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={fetchData} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 8,
            border: `1.5px solid ${T.border}`, background: T.card,
            color: T.textLight, fontSize: 13, cursor: 'pointer',
          }}><RotateCcw size={14} /> Refresh</button>
          <button onClick={handleOpenFilterModal} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 18px', borderRadius: 8, border: 'none',
            background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
            color: T.navyDark, fontSize: 13, fontWeight: 700, cursor: 'pointer',
            boxShadow: `0 2px 8px ${T.gold}40`,
          }}><Edit3 size={15} /> Update Status</button>
        </div>
      </div>

      {/* ── Main Table ─────────────────────────────────── */}
      <div style={{
        background: T.card, borderRadius: 10,
        border: `1px solid ${T.border}`, overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <Loader2 size={28} color={T.gold}
              style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ color: T.textMuted }}>Loading...</p>
          </div>
        ) : data.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <Package size={40} color={T.border} style={{ marginBottom: 12 }} />
            <p style={{ color: T.textLight }}>No pending records</p>
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
                {data.map((r, idx) => (
                  <tr key={r.UID + idx}
                    style={{ background: idx % 2 === 0 ? T.card : T.borderLight }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${T.gold}08`; }}
                    onMouseLeave={e => { e.currentTarget.style.background = idx % 2 === 0 ? T.card : T.borderLight; }}
                  >
                    {/* # */}
                    <Td><span style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 26, height: 26, borderRadius: 6,
                      background: T.borderLight, fontSize: 12, fontWeight: 600, color: T.textLight,
                    }}>{idx + 1}</span></Td>

                    {/* Planned 12 */}
                    <Td>{r.planned12}</Td>

                    {/* UID */}
                    <Td><span style={{
                      background: `${T.navy}15`, color: T.navy,
                      padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700,
                    }}>{r.UID}</span></Td>

                    {/* Site Name */}
                    <Td maxW={130}>{r.siteName}</Td>

                    {/* Engineer */}
                    <Td maxW={120}>{r.engineerName}</Td>

                    {/* Material Type */}
                    <Td maxW={120}>{r.materialType}</Td>

                    {/* Material Name */}
                    <Td maxW={150} bold>{r.materialName}</Td>

                    {/* Material Size - NEW */}
                    <Td>
                      {r.materialSize && (
                        <span style={{
                          background: `${T.gold}15`, color: T.goldDark,
                          padding: '2px 7px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                        }}>{r.materialSize}</span>
                      )}
                    </Td>

                    {/* Specification - NEW */}
                    <Td maxW={130}>{r.specification}</Td>

                    {/* Brand Name - NEW */}
                    <Td maxW={110}>{r.brandName}</Td>

                    {/* SKU Code */}
                    <Td>{r.skuCode}</Td>

                    {/* Revised Qty */}
                    <Td right>{r.revisedQuantity}</Td>

                    {/* Received Qty */}
                    <Td right>
                      <span style={{
                        background: r.finalReceivedQuantity ? `${T.success}15` : T.borderLight,
                        color: r.finalReceivedQuantity ? T.success : T.textMuted,
                        padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700,
                      }}>{r.finalReceivedQuantity || '—'}</span>
                    </Td>

                    {/* Unit */}
                    <Td>{r.unitName}</Td>

                    {/* Indent No */}
                    <Td>{r.finalIndentNo}</Td>

                    {/* Indent PDF */}
                    <Td center>
                      {r.finalIndentPDF ? (
                        <a href={r.finalIndentPDF} target="_blank" rel="noopener noreferrer"
                          style={{ color: T.navy }}><ExternalLink size={14} /></a>
                      ) : '—'}
                    </Td>

                    {/* Quotation No */}
                    <Td>{r.approvalQuotationNo}</Td>

                    {/* Quotation PDF */}
                    <Td center>
                      {r.approvalQuotationPDF ? (
                        <a href={r.approvalQuotationPDF} target="_blank" rel="noopener noreferrer"
                          style={{ color: T.navy }}><ExternalLink size={14} /></a>
                      ) : '—'}
                    </Td>

                    {/* PO Number */}
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
                      {r.poPDF ? (
                        <a href={r.poPDF} target="_blank" rel="noopener noreferrer"
                          style={{ color: T.navy }}><ExternalLink size={14} /></a>
                      ) : '—'}
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
                      {r.mrnPDF ? (
                        <a href={r.mrnPDF} target="_blank" rel="noopener noreferrer"
                          style={{ color: T.navy }}><ExternalLink size={14} /></a>
                      ) : '—'}
                    </Td>

                    {/* Vendor */}
                    <Td maxW={130} bold>{r.vendorFirmName}</Td>

                    {/* Contact */}
                    <Td>
                      {r.vendorContact && (
                        <a href={`tel:${r.vendorContact}`} style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          color: T.navy, fontSize: 12, fontWeight: 600, textDecoration: 'none',
                        }}><Phone size={11} /> {r.vendorContact}</a>
                      )}
                    </Td>

                    {/* Invoice 11 */}
                    <Td>{r.invoice11}</Td>

                    {/* Invoice Photo 11 */}
                    <Td center>
                      {r.invoicePhoto11 ? (
                        <a href={r.invoicePhoto11} target="_blank" rel="noopener noreferrer"
                          style={{ color: T.navy }}><ExternalLink size={14} /></a>
                      ) : '—'}
                    </Td>

                    {/* Status 12 */}
                    <Td>
                      {r.status12 ? (
                        <span style={{
                          background: r.status12 === 'Done' ? `${T.success}15`
                            : r.status12 === 'Pending' ? `${T.danger}15` : T.borderLight,
                          color: r.status12 === 'Done' ? T.success
                            : r.status12 === 'Pending' ? T.danger : T.text,
                          padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                        }}>{r.status12}</span>
                      ) : <span style={{ color: T.textMuted }}>—</span>}
                    </Td>

                    {/* Remark 12 */}
                    <Td maxW={120}>{r.remark12}</Td>

                    {/* Action */}
                    <Td center>
                      <button onClick={handleOpenFilterModal} style={{
                        padding: '5px 10px', borderRadius: 6, border: 'none',
                        background: `${T.gold}20`, color: T.goldDark,
                        fontSize: 13, cursor: 'pointer', fontWeight: 600,
                      }}>✏️</button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ════ MODAL 1: Filter ══════════════════════════════ */}
      {isFilterModalOpen && (
        <>
          <div onClick={handleCancel} style={{
            position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)',
            backdropFilter: 'blur(2px)', zIndex: 100,
          }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '95%', maxWidth: 460,
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
                Select Invoice & Vendor
              </h3>
              <button onClick={handleCancel} style={{
                width: 28, height: 28, borderRadius: 6, border: 'none',
                background: 'rgba(255,255,255,0.1)', color: 'white',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><X size={14} /></button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>
                  Invoice 11 <span style={{ color: T.danger }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <select value={selectedInvoice} onChange={handleInvoiceSelect}
                    style={{ ...inputBase, paddingRight: 32, appearance: 'none', cursor: 'pointer' }}
                    onFocus={focusGold} onBlur={blurNormal}>
                    <option value="">-- Select Invoice --</option>
                    {invoiceNumbers.map((inv, i) => (
                      <option key={i} value={inv}>{inv}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} style={{
                    position: 'absolute', right: 10, top: '50%',
                    transform: 'translateY(-50%)', color: T.textMuted, pointerEvents: 'none',
                  }} />
                </div>
              </div>

              {selectedInvoice && (
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>
                    Vendor Firm Name <span style={{ color: T.danger }}>*</span>
                  </label>
                  {vendorOptions.length === 1 ? (
                    <input type="text" value={selectedVendor} readOnly
                      style={{ ...inputBase, background: T.borderLight, cursor: 'not-allowed' }} />
                  ) : (
                    <div style={{ position: 'relative' }}>
                      <select value={selectedVendor}
                        onChange={e => setSelectedVendor(e.target.value)}
                        style={{ ...inputBase, paddingRight: 32, appearance: 'none', cursor: 'pointer' }}
                        onFocus={focusGold} onBlur={blurNormal}>
                        <option value="">-- Select Vendor --</option>
                        {vendorOptions.map((v, i) => (
                          <option key={i} value={v}>{v}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} style={{
                        position: 'absolute', right: 10, top: '50%',
                        transform: 'translateY(-50%)', color: T.textMuted, pointerEvents: 'none',
                      }} />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{
              padding: '14px 20px', borderTop: `1px solid ${T.border}`,
              display: 'flex', justifyContent: 'flex-end', gap: 10,
            }}>
              <button onClick={handleCancel} style={{
                padding: '8px 16px', borderRadius: 8,
                border: `1.5px solid ${T.border}`, background: T.card,
                color: T.textLight, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>Cancel</button>
              <button onClick={handleNextToItems}
                disabled={!selectedInvoice || !selectedVendor}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '8px 20px', borderRadius: 8, border: 'none',
                  background: (selectedInvoice && selectedVendor)
                    ? `linear-gradient(135deg, ${T.gold}, ${T.goldDark})` : T.border,
                  color: (selectedInvoice && selectedVendor) ? T.navyDark : T.textMuted,
                  fontSize: 13, fontWeight: 700,
                  cursor: (selectedInvoice && selectedVendor) ? 'pointer' : 'not-allowed',
                }}>Next <ArrowRight size={14} /></button>
            </div>
          </div>
        </>
      )}

      {/* ════ MODAL 2: Item Selection ══════════════════════ */}
      {isItemsModalOpen && (
        <>
          <div onClick={handleCancel} style={{
            position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)',
            backdropFilter: 'blur(2px)', zIndex: 100,
          }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '95%', maxWidth: 820,
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
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'white', margin: 0 }}>Select Materials</h3>
                <p style={{ fontSize: 11, color: T.textMuted, margin: 0 }}>
                  {selectedUIDs.length} / {filteredItems.length} selected
                </p>
              </div>
              <button onClick={handleCancel} style={{
                width: 30, height: 30, borderRadius: 6, border: 'none',
                background: 'rgba(255,255,255,0.1)', color: 'white',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><X size={16} /></button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
              {filteredItems.length === 0 ? (
                <p style={{ color: T.textMuted, textAlign: 'center', padding: 40 }}>No materials found.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: T.borderLight }}>
                        <th style={{ padding: '10px 12px' }}>
                          <input type="checkbox" onChange={handleSelectAll}
                            checked={selectedUIDs.length === filteredItems.length && filteredItems.length > 0} />
                        </th>
                        {['UID', 'Site', 'Material', 'Size', 'Received Qty', 'PO No', 'Quotation No', 'MRN No'].map(h => (
                          <th key={h} style={{
                            padding: '10px 12px', textAlign: 'left',
                            fontSize: 12, fontWeight: 700, color: T.navy,
                            borderBottom: `2px solid ${T.border}`,
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map((item, i) => (
                        <tr key={item.UID}
                          style={{ background: i % 2 === 0 ? T.card : T.borderLight }}
                          onMouseEnter={e => { e.currentTarget.style.background = `${T.gold}08`; }}
                          onMouseLeave={e => { e.currentTarget.style.background = i % 2 === 0 ? T.card : T.borderLight; }}>
                          <td style={{ padding: '10px 12px' }}>
                            <input type="checkbox" checked={selectedUIDs.includes(item.UID)}
                              onChange={() => handleUIDSelect(item.UID)} />
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{
                              background: `${T.navy}15`, color: T.navy,
                              padding: '2px 7px', borderRadius: 5, fontWeight: 700, fontSize: 12,
                            }}>{item.UID}</span>
                          </td>
                          <td style={{ padding: '10px 12px' }}>{item.siteName}</td>
                          <td style={{ padding: '10px 12px', fontWeight: 600 }}>{item.materialName}</td>
                          <td style={{ padding: '10px 12px' }}>{item.materialSize}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'right' }}>{item.finalReceivedQuantity}</td>
                          <td style={{ padding: '10px 12px' }}>{item.poNumber}</td>
                          <td style={{ padding: '10px 12px' }}>{item.approvalQuotationNo}</td>
                          <td style={{ padding: '10px 12px' }}>{item.mrnNo}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {error && (
                <div style={{
                  marginTop: 12, padding: '10px 14px',
                  background: T.dangerBg, border: `1px solid ${T.dangerBorder}`,
                  borderRadius: 8, fontSize: 13, color: T.danger,
                  display: 'flex', alignItems: 'center', gap: 8,
                }}><AlertCircle size={15} /> {error}</div>
              )}
            </div>

            <div style={{
              padding: '14px 20px', borderTop: `1px solid ${T.border}`,
              background: T.borderLight,
              display: 'flex', justifyContent: 'space-between',
              borderRadius: '0 0 14px 14px',
            }}>
              <button onClick={() => { setIsItemsModalOpen(false); setIsFilterModalOpen(true); }} style={{
                padding: '8px 20px', borderRadius: 8,
                border: `1.5px solid ${T.border}`, background: T.card,
                color: T.textLight, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>← Previous</button>
              <button onClick={handleNextToStatus} disabled={selectedUIDs.length === 0}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '8px 20px', borderRadius: 8, border: 'none',
                  background: selectedUIDs.length > 0
                    ? `linear-gradient(135deg, ${T.gold}, ${T.goldDark})` : T.border,
                  color: selectedUIDs.length > 0 ? T.navyDark : T.textMuted,
                  fontSize: 13, fontWeight: 700,
                  cursor: selectedUIDs.length > 0 ? 'pointer' : 'not-allowed',
                }}>Next <ArrowRight size={14} /></button>
            </div>
          </div>
        </>
      )}

      {/* ════ MODAL 3: Status ══════════════════════════════ */}
      {isStatusModalOpen && (
        <>
          <div onClick={handleCancel} style={{
            position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)',
            backdropFilter: 'blur(2px)', zIndex: 100,
          }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '95%', maxWidth: 480,
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
                  Update Status — Step 12
                </h3>
                <p style={{ fontSize: 11, color: T.textMuted, margin: 0 }}>{selectedUIDs.length} items</p>
              </div>
              <button onClick={handleCancel} style={{
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
                }}><CheckCircle size={16} color={T.success} /> Updated!</div>
              )}

              {error && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 14px', background: T.dangerBg,
                  border: `1px solid ${T.dangerBorder}`, borderRadius: 8,
                  marginBottom: 16, fontSize: 13, color: T.danger,
                }}><AlertCircle size={16} /> {error}</div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>
                    Status 12 <span style={{ color: T.danger }}>*</span>
                    <span style={{ marginLeft: 8, fontSize: 10, color: T.textMuted, background: T.borderLight, padding: '2px 6px', borderRadius: 4 }}>→ BR</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select value={formData.STATUS_12}
                      onChange={e => setFormData(p => ({ ...p, STATUS_12: e.target.value }))}
                      disabled={isSubmitting}
                      style={{ ...inputBase, paddingRight: 32, appearance: 'none', cursor: 'pointer' }}
                      onFocus={focusGold} onBlur={blurNormal}>
                      <option value="">-- Select --</option>
                      <option value="Done">✅ Done</option>
                      <option value="Pending">⏳ Pending</option>
                    </select>
                    <ChevronDown size={14} style={{
                      position: 'absolute', right: 10, top: '50%',
                      transform: 'translateY(-50%)', color: T.textMuted, pointerEvents: 'none',
                    }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>
                    Remark 12 <span style={{ color: T.danger }}>*</span>
                    <span style={{ marginLeft: 8, fontSize: 10, color: T.textMuted, background: T.borderLight, padding: '2px 6px', borderRadius: 4 }}>→ BT</span>
                  </label>
                  <textarea value={formData.REMARK_12}
                    onChange={e => setFormData(p => ({ ...p, REMARK_12: e.target.value }))}
                    disabled={isSubmitting} placeholder="Enter remark..." rows={3}
                    style={{ ...inputBase, resize: 'vertical', minHeight: 80 }}
                    onFocus={focusGold} onBlur={blurNormal} />
                </div>
              </div>
            </div>

            <div style={{
              padding: '14px 20px', borderTop: `1px solid ${T.border}`,
              background: T.borderLight,
              display: 'flex', justifyContent: 'space-between',
              borderRadius: '0 0 14px 14px',
            }}>
              <button onClick={() => { setIsStatusModalOpen(false); setIsItemsModalOpen(true); }}
                disabled={isSubmitting} style={{
                  padding: '10px 20px', borderRadius: 8,
                  border: `1.5px solid ${T.border}`, background: T.card,
                  color: T.textLight, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}>← Previous</button>

              <button onClick={handleStatusSubmit}
                disabled={isSubmitting || !formData.STATUS_12 || !formData.REMARK_12 || saveSuccess}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '10px 24px', borderRadius: 8, border: 'none',
                  background: saveSuccess ? T.success
                    : (formData.STATUS_12 && formData.REMARK_12 && !isSubmitting)
                      ? `linear-gradient(135deg, ${T.gold}, ${T.goldDark})` : T.border,
                  color: saveSuccess ? 'white'
                    : (formData.STATUS_12 && formData.REMARK_12 && !isSubmitting) ? T.navyDark : T.textMuted,
                  fontSize: 13, fontWeight: 700,
                  cursor: (formData.STATUS_12 && formData.REMARK_12 && !isSubmitting) ? 'pointer' : 'not-allowed',
                }}>
                {isSubmitting ? (
                  <><Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> Saving...</>
                ) : saveSuccess ? (
                  <><CheckCircle size={15} /> Done!</>
                ) : (
                  <><CheckCircle size={15} /> Save</>
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

export default BillCheckedData12;