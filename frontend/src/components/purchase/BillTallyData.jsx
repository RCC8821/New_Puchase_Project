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

const BillTallyData14 = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [invoiceNumbers, setInvoiceNumbers] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState('');
  const [vendorOptions, setVendorOptions] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [formData, setFormData] = useState({
    status16: '', vendorFirmName: '', billNo: '', billDate: '',
    items: [], transportWOGST: '0', gstRate: '0',
    adjustmentAmount: '0', netAmount: '0.00', remark: '',
  });

  const [errors, setErrors] = useState({});

  // ── Fetch ──────────────────────────────────────────────
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/Bill_Tally_14`);
      if (!response.ok) throw new Error('Failed to fetch data');
      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        setData(result.data);
        setInvoiceNumbers([
          ...new Set(result.data.map(item => item.invoice11).filter(Boolean)),
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

  // ── Modal Handlers ─────────────────────────────────────
  const handleInvoiceSelect = (e) => {
    const invoice = e.target.value;
    setSelectedInvoice(invoice);
    setSelectedVendor(''); setVendorOptions([]);
    setErrors(prev => ({ ...prev, invoice: '' }));

    if (invoice) {
      const vendors = [...new Set(
        data.filter(item => item.invoice11 === invoice)
          .map(item => item.vendorFirmName).filter(Boolean)
      )];
      setVendorOptions(vendors);
      if (vendors.length === 1) setSelectedVendor(vendors[0]);
    }
  };

  const handleNext = () => {
    const newErrors = {};
    if (!selectedInvoice) newErrors.invoice = 'Invoice is required';
    if (!selectedVendor) newErrors.vendor = 'Vendor is required';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    if (step === 1 && selectedInvoice && selectedVendor) {
      const selectedItems = data.filter(
        item => item.invoice11 === selectedInvoice && item.vendorFirmName === selectedVendor
      );
      const initialItems = selectedItems.map((item, index) => ({
        materialName: item.materialName || 'N/A',
        uid: item.UID || `N/A-${index}`,
        amount: '', cgst: 'None', sgst: 'None', igst: 'None',
        cgstAmt: '0', sgstAmt: '0', igstAmt: '0', total: '0',
      }));
      setFormData(prev => ({ ...prev, vendorFirmName: selectedVendor, items: initialItems }));
      setStep(2); setErrors({});
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...formData.items];
    if (name === 'cgst') {
      newItems[index].cgst = value; newItems[index].sgst = value; newItems[index].igst = 'None';
    } else if (name === 'igst') {
      newItems[index].igst = value; newItems[index].cgst = 'None'; newItems[index].sgst = 'None';
    } else { newItems[index][name] = value; }
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  // ── Tax Calc ───────────────────────────────────────────
  useEffect(() => {
    if (formData.items.length === 0) return;
    const updatedItems = formData.items.map(item => {
      const amount = parseFloat(item.amount) || 0;
      let cgstAmt = 0, sgstAmt = 0, igstAmt = 0;
      if (item.cgst !== 'None') { const rate = parseFloat(item.cgst) || 0; cgstAmt = amount * (rate / 200); sgstAmt = cgstAmt; }
      else if (item.igst !== 'None') { const rate = parseFloat(item.igst) || 0; igstAmt = amount * (rate / 100); }
      const total = amount + cgstAmt + sgstAmt + igstAmt;
      return { ...item, cgstAmt: cgstAmt.toFixed(2), sgstAmt: sgstAmt.toFixed(2), igstAmt: igstAmt.toFixed(2), total: total.toFixed(2) };
    });
    const itemsTotal = updatedItems.reduce((sum, i) => sum + parseFloat(i.total || 0), 0);
    const transport = parseFloat(formData.transportWOGST || 0);
    const gstRate = parseFloat(formData.gstRate || 0);
    const transportGstOnly = (transport * (gstRate / 100)).toFixed(2);
    const adjustment = parseFloat(formData.adjustmentAmount || 0);
    const netAmount = (itemsTotal + transport + parseFloat(transportGstOnly) + adjustment).toFixed(2);
    setFormData(prev => ({ ...prev, items: updatedItems, netAmount }));
  }, [
    formData.items.map(i => `${i.amount || 0}-${i.cgst}-${i.igst}`).join(','),
    formData.transportWOGST, formData.gstRate, formData.adjustmentAmount,
  ]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.status16) newErrors.status16 = 'Status is required';
    if (!formData.billNo) newErrors.billNo = 'Bill No is required';
    if (!formData.billDate) newErrors.billDate = 'Bill Date is required';
    if (!formData.items.some(i => parseFloat(i.amount) > 0)) newErrors.items = 'At least one item must have amount';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit ─────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validateForm() || isSubmitting) return;
    setIsSubmitting(true); setError(null);

    try {
      const totalAmount = formData.items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0).toFixed(2);
      const totalCGSTAmt = formData.items.reduce((s, i) => s + (parseFloat(i.cgstAmt) || 0), 0).toFixed(2);
      const totalSGSTAmt = formData.items.reduce((s, i) => s + (parseFloat(i.sgstAmt) || 0), 0).toFixed(2);
      const totalIGSTAmt = formData.items.reduce((s, i) => s + (parseFloat(i.igstAmt) || 0), 0).toFixed(2);
      const itemsTotal = formData.items.reduce((s, i) => s + parseFloat(i.total || 0), 0);
      const transport = parseFloat(formData.transportWOGST || 0);
      const gstRate = parseFloat(formData.gstRate || 0);
      const transportGstOnly = (transport * (gstRate / 100)).toFixed(2);
      const adjustment = parseFloat(formData.adjustmentAmount || 0);
      const netAmount = (itemsTotal + transport + parseFloat(transportGstOnly) + adjustment).toFixed(2);

      const itemsWithData = formData.items.map(item => ({
        uid: item.uid, materialName: item.materialName, amount: item.amount || '0',
        cgst: item.cgst !== 'None' ? item.cgst : '0', sgst: item.cgst !== 'None' ? item.cgst : '0',
        igst: item.igst !== 'None' ? item.igst : '0', cgstAmt: item.cgstAmt, sgstAmt: item.sgstAmt,
        igstAmt: item.igstAmt, total: item.total,
        gstPercent: item.cgst !== 'None' ? item.cgst : item.igst !== 'None' ? item.igst : '0',
      }));

      const totalRow = {
        uid: 'TOTAL', materialName: 'Total', amount: totalAmount, cgst: '-', sgst: '-', igst: '-',
        cgstAmt: totalCGSTAmt, sgstAmt: totalSGSTAmt, igstAmt: totalIGSTAmt,
        total: itemsTotal.toFixed(2), gstPercent: '-',
      };

      const submitData = {
        status16: formData.status16, vendorFirmName: formData.vendorFirmName,
        billNo: formData.billNo, billDate: formData.billDate,
        transportWOGST: formData.transportWOGST || '0', gstRate: formData.gstRate || '0',
        adjustmentAmount: formData.adjustmentAmount || '0', netAmount,
        remark: formData.remark || '', items: [...itemsWithData, totalRow],
        totalBillAmount: totalAmount, totalCGST: totalCGSTAmt, totalSGST: totalSGSTAmt,
        totalIGST: totalIGSTAmt, transportGstOnly,
      };

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/bill_tally_entry_14`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });
      if (!response.ok) throw new Error('Failed to submit');

      setSaveSuccess(true);
      setTimeout(async () => { handleCancel(); setIsSubmitting(false); await fetchData(); }, 1500);
    } catch (err) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false); setStep(1); setSelectedInvoice(''); setSelectedVendor('');
    setVendorOptions([]); setErrors({}); setSaveSuccess(false); setError(null);
    setFormData({
      status16: '', vendorFirmName: '', billNo: '', billDate: '', items: [],
      transportWOGST: '0', gstRate: '0', adjustmentAmount: '0', netAmount: '0.00', remark: '',
    });
  };

  const isSubmitDisabled = isSubmitting || !formData.status16 || !formData.billNo || !formData.billDate ||
    formData.items.every(i => !parseFloat(i.amount || 0));

  // ── Table Columns ──────────────────────────────────────
  const tableCols = [
    { label: '#', w: 50 }, { label: 'Planned 14', w: 110 },
    { label: 'UID', w: 70 }, { label: 'Site Name', w: 130 },
    { label: 'Material Type', w: 120 }, { label: 'Material Name', w: 160 },
    { label: 'Material Size', w: 110 }, { label: 'Specification', w: 140 },
    { label: 'Brand Name', w: 120 }, { label: 'SKU Code', w: 100 },
    { label: 'Revised Qty', w: 90 }, { label: 'Received Qty', w: 90 },
    { label: 'Unit', w: 60 }, { label: 'Indent No', w: 100 },
    { label: 'Indent PDF', w: 80 }, { label: 'Quotation No', w: 110 },
    { label: 'Quotation PDF', w: 90 }, { label: 'PO Number', w: 100 },
    { label: 'PO PDF', w: 80 }, { label: 'MRN No', w: 90 },
    { label: 'MRN PDF', w: 80 }, { label: 'Vendor', w: 140 },
    { label: 'Contact', w: 110 }, { label: 'Invoice 11', w: 110 },
  ];

  // ══════════════════════════════════════════════════════
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
              Bill Tally — Step 14
            </h2>
            <p style={{ fontSize: 12, color: T.textMuted, margin: 0 }}>{data.length} pending</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={fetchData} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8,
            border: `1.5px solid ${T.border}`, background: T.card,
            color: T.textLight, fontSize: 13, cursor: 'pointer',
          }}><RotateCcw size={14} /> Refresh</button>
          <button onClick={() => { setIsModalOpen(true); setStep(1); setErrors({}); }} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 8, border: 'none',
            background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
            color: T.navyDark, fontSize: 13, fontWeight: 700, cursor: 'pointer',
            boxShadow: `0 2px 8px ${T.gold}40`,
          }}><Edit3 size={15} /> Bill Tally Entry</button>
        </div>
      </div>

      {/* ── Main Table (Navy+Gold) ─────────────────────── */}
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
                    onMouseLeave={e => { e.currentTarget.style.background = idx % 2 === 0 ? T.card : T.borderLight; }}>
                    <Td><span style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 26, height: 26, borderRadius: 6,
                      background: T.borderLight, fontSize: 12, fontWeight: 600, color: T.textLight,
                    }}>{idx + 1}</span></Td>
                    <Td>{r.planned14}</Td>
                    <Td><span style={{ background: `${T.navy}15`, color: T.navy, padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>{r.UID}</span></Td>
                    <Td maxW={130}>{r.siteName}</Td>
                    <Td maxW={120}>{r.materialType}</Td>
                    <Td maxW={150} bold>{r.materialName}</Td>
                    <Td>{r.materialSize && <span style={{ background: `${T.gold}15`, color: T.goldDark, padding: '2px 7px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>{r.materialSize}</span>}</Td>
                    <Td maxW={130}>{r.specification}</Td>
                    <Td maxW={110}>{r.brandName}</Td>
                    <Td>{r.skuCode}</Td>
                    <Td right>{r.revisedQuantity}</Td>
                    <Td right><span style={{ background: r.finalReceivedQuantity ? `${T.success}15` : T.borderLight, color: r.finalReceivedQuantity ? T.success : T.textMuted, padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>{r.finalReceivedQuantity || '—'}</span></Td>
                    <Td>{r.unitName}</Td>
                    <Td>{r.finalIndentNo}</Td>
                    <Td center>{r.finalIndentPDF ? <a href={r.finalIndentPDF} target="_blank" rel="noopener noreferrer" style={{ color: T.navy }}><ExternalLink size={14} /></a> : '—'}</Td>
                    <Td>{r.approvalQuotationNo}</Td>
                    <Td center>{r.approvalQuotationPDF ? <a href={r.approvalQuotationPDF} target="_blank" rel="noopener noreferrer" style={{ color: T.navy }}><ExternalLink size={14} /></a> : '—'}</Td>
                    <Td>{r.poNumber && <span style={{ background: T.navy, color: T.gold, padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>{r.poNumber}</span>}</Td>
                    <Td center>{r.poPDF ? <a href={r.poPDF} target="_blank" rel="noopener noreferrer" style={{ color: T.navy }}><ExternalLink size={14} /></a> : '—'}</Td>
                    <Td>{r.mrnNo && <span style={{ background: `${T.purple}15`, color: T.purple, padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{r.mrnNo}</span>}</Td>
                    <Td center>{r.mrnPDF ? <a href={r.mrnPDF} target="_blank" rel="noopener noreferrer" style={{ color: T.navy }}><ExternalLink size={14} /></a> : '—'}</Td>
                    <Td maxW={130} bold>{r.vendorFirmName}</Td>
                    <Td>{r.vendorContact && <a href={`tel:${r.vendorContact}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: T.navy, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}><Phone size={11} /> {r.vendorContact}</a>}</Td>
                    <Td>{r.invoice11}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ════ MODAL ════════════════════════════════════════ */}
      {isModalOpen && (
        <>
          <div onClick={handleCancel} style={{
            position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)',
            backdropFilter: 'blur(2px)', zIndex: 100,
          }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '95%', maxWidth: step === 1 ? 460 : 1100,
            background: T.card, borderRadius: 14,
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            zIndex: 101, display: 'flex', flexDirection: 'column',
            maxHeight: '90vh',
          }}>
            {/* Header */}
            <div style={{
              background: T.navy, padding: '14px 20px',
              borderBottom: `2px solid ${T.gold}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderRadius: '14px 14px 0 0',
            }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'white', margin: 0 }}>
                {step === 1 ? 'Select Invoice & Vendor' : 'Bill Tally Entry — Step 14'}
              </h3>
              <button onClick={handleCancel} style={{
                width: 30, height: 30, borderRadius: 6, border: 'none',
                background: 'rgba(255,255,255,0.1)', color: 'white',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><X size={16} /></button>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>

              {saveSuccess && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
                  background: T.successBg, border: `1px solid ${T.successBorder}`,
                  borderRadius: 8, marginBottom: 16, fontSize: 13, color: '#065f46',
                }}><CheckCircle size={16} color={T.success} /> Submitted successfully!</div>
              )}

              {error && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
                  background: T.dangerBg, border: `1px solid ${T.dangerBorder}`,
                  borderRadius: 8, marginBottom: 16, fontSize: 13, color: T.danger,
                }}><AlertCircle size={16} /> {error}</div>
              )}

              {/* ── Step 1 ─────────────────────────────── */}
              {step === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>
                      Invoice 11 <span style={{ color: T.danger }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <select value={selectedInvoice} onChange={handleInvoiceSelect}
                        style={{ ...inputBase, paddingRight: 32, appearance: 'none', cursor: 'pointer' }}
                        onFocus={focusGold} onBlur={blurNormal}>
                        <option value="">-- Select Invoice --</option>
                        {invoiceNumbers.map((inv, i) => <option key={i} value={inv}>{inv}</option>)}
                      </select>
                      <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: T.textMuted, pointerEvents: 'none' }} />
                    </div>
                    {errors.invoice && <p style={{ color: T.danger, fontSize: 11, marginTop: 4 }}>{errors.invoice}</p>}
                  </div>

                  {selectedInvoice && (
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>
                        Vendor Firm Name <span style={{ color: T.danger }}>*</span>
                      </label>
                      {vendorOptions.length === 1 ? (
                        <input type="text" value={selectedVendor} readOnly style={{ ...inputBase, background: T.borderLight, cursor: 'not-allowed' }} />
                      ) : (
                        <div style={{ position: 'relative' }}>
                          <select value={selectedVendor} onChange={e => { setSelectedVendor(e.target.value); setErrors(p => ({ ...p, vendor: '' })); }}
                            style={{ ...inputBase, paddingRight: 32, appearance: 'none', cursor: 'pointer' }}
                            onFocus={focusGold} onBlur={blurNormal}>
                            <option value="">-- Select Vendor --</option>
                            {vendorOptions.map((v, i) => <option key={i} value={v}>{v}</option>)}
                          </select>
                          <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: T.textMuted, pointerEvents: 'none' }} />
                        </div>
                      )}
                      {errors.vendor && <p style={{ color: T.danger, fontSize: 11, marginTop: 4 }}>{errors.vendor}</p>}
                    </div>
                  )}
                </div>
              )}

              {/* ── Step 2 ─────────────────────────────── */}
              {step === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Header Fields */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>Status 14 *</label>
                      <select name="status16" value={formData.status16} onChange={handleInputChange}
                        style={{ ...inputBase, appearance: 'none', cursor: 'pointer' }} onFocus={focusGold} onBlur={blurNormal}>
                        <option value="">-- Select --</option>
                        <option value="Done">Done</option>
                        <option value="Hold">Hold</option>
                      </select>
                      {errors.status16 && <p style={{ color: T.danger, fontSize: 11, marginTop: 4 }}>{errors.status16}</p>}
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>Vendor</label>
                      <input type="text" value={formData.vendorFirmName} readOnly style={{ ...inputBase, background: T.borderLight, cursor: 'not-allowed' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>Bill No. *</label>
                      <input type="text" name="billNo" value={formData.billNo} onChange={handleInputChange}
                        style={inputBase} onFocus={focusGold} onBlur={blurNormal} />
                      {errors.billNo && <p style={{ color: T.danger, fontSize: 11, marginTop: 4 }}>{errors.billNo}</p>}
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>Bill Date *</label>
                      <input type="date" name="billDate" value={formData.billDate} onChange={handleInputChange}
                        style={inputBase} onFocus={focusGold} onBlur={blurNormal} />
                      {errors.billDate && <p style={{ color: T.danger, fontSize: 11, marginTop: 4 }}>{errors.billDate}</p>}
                    </div>
                  </div>

                  {/* Item Table */}
                  <div style={{ overflowX: 'auto', border: `1px solid ${T.border}`, borderRadius: 8 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: T.navy }}>
                          {['UID', 'Material', 'Amount *', 'CGST', 'IGST', 'CGST Amt', 'SGST Amt', 'IGST Amt', 'Total'].map(h => (
                            <th key={h} style={{ padding: '10px 12px', color: T.goldLight, fontSize: 11, fontWeight: 700, textAlign: 'center', borderBottom: `2px solid ${T.gold}` }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {formData.items.map((item, index) => (
                          <tr key={`${item.uid}-${index}`} style={{ background: index % 2 === 0 ? T.card : T.borderLight }}>
                            <td style={{ padding: '8px 10px', textAlign: 'center', fontSize: 12, fontWeight: 700 }}>{item.uid}</td>
                            <td style={{ padding: '8px 10px', fontSize: 12 }}>{item.materialName}</td>
                            <td style={{ padding: '8px 10px' }}>
                              <input type="number" name="amount" value={item.amount}
                                onChange={e => handleItemChange(index, e)}
                                style={{ width: '100%', textAlign: 'center', border: `1px solid ${T.border}`, borderRadius: 6, padding: '4px 6px', fontSize: 12 }}
                                placeholder="0" step="0.01" />
                            </td>
                            <td style={{ padding: '8px 6px' }}>
                              <select name="cgst" value={item.cgst} onChange={e => handleItemChange(index, e)}
                                disabled={item.igst !== 'None'}
                                style={{ width: '100%', textAlign: 'center', border: `1px solid ${T.border}`, borderRadius: 6, padding: '3px 4px', fontSize: 11 }}>
                                <option value="None">None</option>
                                <option value="5">5%</option><option value="12">12%</option>
                                <option value="18">18%</option><option value="28">28%</option>
                              </select>
                            </td>
                            <td style={{ padding: '8px 6px' }}>
                              <select name="igst" value={item.igst} onChange={e => handleItemChange(index, e)}
                                disabled={item.cgst !== 'None'}
                                style={{ width: '100%', textAlign: 'center', border: `1px solid ${T.border}`, borderRadius: 6, padding: '3px 4px', fontSize: 11 }}>
                                <option value="None">None</option>
                                <option value="5">5%</option><option value="12">12%</option>
                                <option value="18">18%</option><option value="28">28%</option>
                              </select>
                            </td>
                            <td style={{ padding: '8px 10px', textAlign: 'center', fontSize: 12 }}>{item.cgstAmt}</td>
                            <td style={{ padding: '8px 10px', textAlign: 'center', fontSize: 12 }}>{item.sgstAmt}</td>
                            <td style={{ padding: '8px 10px', textAlign: 'center', fontSize: 12 }}>{item.igstAmt}</td>
                            <td style={{ padding: '8px 10px', textAlign: 'center', fontSize: 12, fontWeight: 700 }}>{item.total}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr style={{ background: T.borderLight, fontWeight: 700 }}>
                          <td colSpan="2" style={{ padding: '10px 12px', textAlign: 'right', fontSize: 12 }}>Total</td>
                          <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: 12 }}>{formData.items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0).toFixed(2)}</td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>-</td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>-</td>
                          <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: 12 }}>{formData.items.reduce((s, i) => s + (parseFloat(i.cgstAmt) || 0), 0).toFixed(2)}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: 12 }}>{formData.items.reduce((s, i) => s + (parseFloat(i.sgstAmt) || 0), 0).toFixed(2)}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: 12 }}>{formData.items.reduce((s, i) => s + (parseFloat(i.igstAmt) || 0), 0).toFixed(2)}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: 12, fontWeight: 700 }}>{formData.items.reduce((s, i) => s + (parseFloat(i.total) || 0), 0).toFixed(2)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  {errors.items && <p style={{ color: T.danger, fontSize: 11 }}>{errors.items}</p>}

                  {/* Transport Section */}
                  <div style={{ background: T.borderLight, padding: 16, borderRadius: 10, border: `1px solid ${T.border}` }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>Transport (w/o GST)</label>
                        <input type="number" name="transportWOGST" value={formData.transportWOGST}
                          onChange={handleInputChange} style={inputBase} onFocus={focusGold} onBlur={blurNormal}
                          placeholder="0.00" step="0.01" />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>GST %</label>
                        <select name="gstRate" value={formData.gstRate} onChange={handleInputChange}
                          style={{ ...inputBase, appearance: 'none', cursor: 'pointer' }} onFocus={focusGold} onBlur={blurNormal}>
                          <option value="0">0%</option><option value="5">5%</option>
                          <option value="12">12%</option><option value="18">18%</option><option value="28">28%</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.success, marginBottom: 6 }}>GST on Transport</label>
                        <input type="text"
                          value={((parseFloat(formData.transportWOGST) || 0) * (parseFloat(formData.gstRate) || 0) / 100).toFixed(2)}
                          readOnly style={{ ...inputBase, background: T.successBg, border: `2px solid ${T.success}`, fontWeight: 700, color: '#065f46' }} />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>Adjustment Amount</label>
                        <input type="number" name="adjustmentAmount" value={formData.adjustmentAmount}
                          onChange={handleInputChange} style={inputBase} onFocus={focusGold} onBlur={blurNormal}
                          placeholder="(+/-) 0.00" step="0.01" />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 14, fontWeight: 800, color: T.purple, marginBottom: 6 }}>Grand Total</label>
                        <input type="text" value={formData.netAmount} readOnly
                          style={{ ...inputBase, background: `${T.purple}15`, border: `2px solid ${T.purple}`, fontWeight: 900, color: T.purple, fontSize: 18 }} />
                      </div>
                    </div>
                  </div>

                  {/* Remark */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>Remark</label>
                    <textarea name="remark" value={formData.remark} onChange={handleInputChange}
                      placeholder="Optional remark..." rows={3}
                      style={{ ...inputBase, resize: 'vertical', minHeight: 70 }}
                      onFocus={focusGold} onBlur={blurNormal} />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{
              padding: '14px 20px', borderTop: `1px solid ${T.border}`,
              background: T.borderLight,
              display: 'flex', justifyContent: step === 1 ? 'flex-end' : 'space-between', gap: 10,
              borderRadius: '0 0 14px 14px',
            }}>
              {step === 1 ? (
                <>
                  <button onClick={handleCancel} style={{
                    padding: '8px 16px', borderRadius: 8,
                    border: `1.5px solid ${T.border}`, background: T.card,
                    color: T.textLight, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}>Cancel</button>
                  <button onClick={handleNext} disabled={!selectedInvoice || !selectedVendor}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '8px 20px', borderRadius: 8, border: 'none',
                      background: (selectedInvoice && selectedVendor)
                        ? `linear-gradient(135deg, ${T.gold}, ${T.goldDark})` : T.border,
                      color: (selectedInvoice && selectedVendor) ? T.navyDark : T.textMuted,
                      fontSize: 13, fontWeight: 700,
                      cursor: (selectedInvoice && selectedVendor) ? 'pointer' : 'not-allowed',
                    }}>Next <ArrowRight size={14} /></button>
                </>
              ) : (
                <>
                  <button onClick={() => { setStep(1); setErrors({}); }} style={{
                    padding: '10px 20px', borderRadius: 8,
                    border: `1.5px solid ${T.border}`, background: T.card,
                    color: T.textLight, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}>← Previous</button>
                  <button onClick={handleSubmit} disabled={isSubmitDisabled || saveSuccess}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '10px 24px', borderRadius: 8, border: 'none',
                      background: saveSuccess ? T.success
                        : !isSubmitDisabled ? `linear-gradient(135deg, ${T.gold}, ${T.goldDark})` : T.border,
                      color: saveSuccess ? 'white' : !isSubmitDisabled ? T.navyDark : T.textMuted,
                      fontSize: 13, fontWeight: 700,
                      cursor: !isSubmitDisabled && !saveSuccess ? 'pointer' : 'not-allowed',
                    }}>
                    {isSubmitting ? (
                      <><Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> Submitting...</>
                    ) : saveSuccess ? (
                      <><CheckCircle size={15} /> Done!</>
                    ) : (
                      <><CheckCircle size={15} /> Submit</>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default BillTallyData14;