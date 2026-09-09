
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  useGetPaidStepQuery, usePostLabourPaidMutation, useGetProjectDropdownQuery
} from '../../redux/Labour/LabourSlice';
import {
  Loader2, RefreshCw, User, Calendar, Users, FileText, Building, AlertCircle,
  Search, Filter, X, Wrench, Clock, Hash, ChevronDown, IndianRupee, Building2,
  HardHat, MessageSquare, CreditCard, Receipt, BadgeCheck, CircleDollarSign,
  ListChecks, Check, ChevronUp, XCircle, ExternalLink, Tag, BadgeDollarSign,
  RotateCcw, Package
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
const focusGold = e => { e.target.style.borderColor = T.gold; e.target.style.boxShadow = `0 0 0 3px ${T.gold}15`; e.target.style.background = T.card; };
const blurNormal = e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = 'none'; e.target.style.background = T.borderLight; };

const formatAmount = (value) => {
  if (value == null || value === '') return '0';
  const num = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
  return isNaN(num) ? '0' : num.toLocaleString('en-IN', { maximumFractionDigits: 0 });
};

// ── Searchable Dropdown ──
const SearchableDropdown = ({ label, icon: Icon, options = [], value, onChange, placeholder, required, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearch] = useState('');
  const ref = useRef(null);
  const filtered = useMemo(() => options.filter(o => typeof o === 'string' && o.toLowerCase().includes(searchTerm.toLowerCase())), [options, searchTerm]);

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) { setIsOpen(false); setSearch(''); } };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  if (disabled) return (
    <div>
      {label && <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.textMuted, marginBottom: 6 }}>{Icon && <Icon size={14} style={{ display: 'inline', marginRight: 6 }} />}{label}</label>}
      <div style={{ ...inputBase, background: T.borderLight, color: T.textMuted, cursor: 'not-allowed' }}>{placeholder}</div>
    </div>
  );

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {label && <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
        {Icon && <Icon size={14} />}{label}{required && <span style={{ color: T.danger }}>*</span>}
      </label>}
      <div onClick={() => !disabled && setIsOpen(o => !o)} style={{
        ...inputBase, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
        borderColor: isOpen ? T.gold : T.border, background: value ? `${T.gold}10` : T.borderLight,
      }}>
        {value ? <span style={{ fontSize: 13, fontWeight: 600, color: T.goldDark, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
          : <input value={searchTerm} onChange={e => { setSearch(e.target.value); setIsOpen(true); }}
              onClick={e => { e.stopPropagation(); setIsOpen(true); }} placeholder={placeholder}
              style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: T.text }} />}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          {value && <button onClick={e => { e.stopPropagation(); onChange(''); setSearch(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}><X size={14} color={T.textMuted} /></button>}
          {isOpen ? <ChevronUp size={14} color={T.textMuted} /> : <ChevronDown size={14} color={T.textMuted} />}
        </div>
      </div>
      {isOpen && (
        <div style={{ position: 'absolute', zIndex: 50, width: '100%', marginTop: 4, background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          {value && <div style={{ padding: 8, borderBottom: `1px solid ${T.border}` }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: T.textMuted }} />
              <input autoFocus value={searchTerm} onChange={e => setSearch(e.target.value)} placeholder="Search..."
                style={{ ...inputBase, paddingLeft: 30, fontSize: 12 }} />
            </div>
          </div>}
          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
            <button onClick={() => { onChange(''); setIsOpen(false); setSearch(''); }}
              style={{ width: '100%', padding: '10px 14px', textAlign: 'left', fontSize: 13, border: 'none', background: !value ? `${T.gold}15` : 'transparent', cursor: 'pointer', color: T.textMuted }}>-- Select --</button>
            {filtered.length > 0 ? filtered.map((opt, i) => (
              <button key={`${opt}-${i}`} onClick={() => { onChange(opt); setIsOpen(false); setSearch(''); }}
                style={{ width: '100%', padding: '10px 14px', textAlign: 'left', fontSize: 13, border: 'none', background: value === opt ? `${T.gold}15` : 'transparent', cursor: 'pointer', color: T.text, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                onMouseEnter={e => { if (value !== opt) e.currentTarget.style.background = `${T.gold}08`; }}
                onMouseLeave={e => { if (value !== opt) e.currentTarget.style.background = 'transparent'; }}>
                <span>{opt}</span>{value === opt && <Check size={14} color={T.goldDark} />}
              </button>
            )) : <div style={{ padding: '12px 14px', fontSize: 13, color: T.textMuted, textAlign: 'center' }}>No results</div>}
          </div>
        </div>
      )}
    </div>
  );
};

const VIEW_MODE = { LIST: 'list', BILL: 'bill' };

// ── Item Card ──
const ItemCard = ({ item, index, isLast, onClick }) => (
  <div style={{
    position: 'relative', background: T.card, borderRadius: 14, border: `2px solid ${isLast ? T.success : T.gold}40`,
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)', overflow: 'hidden',
  }} onClick={onClick}>
    {/* Badge */}
    <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
      {isLast ? (
        <span style={{ fontSize: 10, background: T.success, color: 'white', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>📌 Payment Here</span>
      ) : (
        <span style={{ fontSize: 10, background: T.textMuted, color: 'white', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>Done + "-"</span>
      )}
    </div>

    {/* Header */}
    <div style={{ padding: '12px 14px', background: isLast ? T.successBg : `${T.gold}10` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap', paddingRight: 100 }}>
        <span style={{ background: `${T.navy}15`, color: T.navy, padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>{item.uid}</span>
      </div>
      <p style={{ fontSize: 14, fontWeight: 600, color: T.navy, margin: 0 }}>{item.projectName || 'N/A'}</p>
      <p style={{ fontSize: 11, color: T.textMuted, margin: '2px 0 0' }}>Planned: {item.planned5 || 'N/A'}</p>
    </div>

    {/* Body */}
    <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12 }}>
        <div><span style={{ color: T.textMuted }}>Engineer:</span> <strong>{item.projectEngineer || 'N/A'}</strong></div>
        <div><span style={{ color: T.textMuted }}>Contractor:</span> <strong>{item.Labouar_Contractor_Name_3 || 'N/A'}</strong></div>
        <div><span style={{ color: T.textMuted }}>Work:</span> <strong>{item.workType || 'N/A'}</strong></div>
        <div><span style={{ color: T.textMuted }}>Labour:</span> <strong>{item.totalLabour || '0'}</strong></div>
      </div>

      {item.Paid_Name && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: `${T.navy}08`, borderRadius: 6, padding: '6px 10px', fontSize: 12 }}>
          <User size={12} color={T.navy} /><span style={{ color: T.textMuted }}>Paid:</span> <strong style={{ color: T.navy }}>{item.Paid_Name}</strong>
        </div>
      )}

      {item.Bill_No && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: `${T.gold}10`, borderRadius: 6, padding: '6px 10px', fontSize: 12 }}>
          <Receipt size={12} color={T.goldDark} /><span style={{ color: T.textMuted }}>Bill:</span> <strong style={{ color: T.goldDark }}>{item.Bill_No}</strong>
        </div>
      )}

      <div style={{ background: `${T.purple}10`, borderRadius: 6, padding: '6px 10px' }}>
        <p style={{ fontSize: 10, color: T.purple }}>🏢 Paid Amount</p>
        <p style={{ fontSize: 14, fontWeight: 800, color: T.purple, margin: 0 }}>₹{formatAmount(item.Revised_Company_Head_Amount_4)}</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: T.textMuted, background: T.borderLight, borderRadius: 6, padding: '4px 10px' }}>
        <span>Cat1: {item.Deployed_Category_1_Labour_No_4 || '0'}</span>
        <span>Cat2: {item.Deployed_Category_2_Labour_No_4 || '0'}</span>
      </div>
    </div>

    <div style={{ height: 3, background: isLast ? T.success : T.gold }} />
  </div>
);

// ── Bill Payment Page ──
const BillPaymentPage = ({ billNo, billItems, onBack, postPaid, isSubmitting, refetch, uniqueBankNames, isBankLoading }) => {
  const [showModal, setShowModal] = useState(true);
  const lastItem = billItems[billItems.length - 1];

  const [formData, setFormData] = useState({
    Status_5: '', Paid_Amount_5: '', TDS_Amount_5: '', Net_Amount_5: '',
    PAYMENT_MODE_5: '', BANK_DETAILS_5: '', PAYMENT_DETAILS_5: '',
    Payment_Date_5: new Date().toISOString().split('T')[0], Remark_5: ''
  });

  const isRejected = formData.Status_5 === 'Reject';

  const getTotalAmount = () => billItems.reduce((s, i) => s + (parseFloat(String(i.Revised_Company_Head_Amount_4 || '0').replace(/[^0-9.-]/g, '')) || 0), 0);

  const handleFormChange = (field, value) => {
    setFormData(prev => {
      const n = { ...prev, [field]: value };
      if (field === 'TDS_Amount_5' || field === 'Paid_Amount_5') {
        const paid = parseFloat(field === 'Paid_Amount_5' ? value : n.Paid_Amount_5) || getTotalAmount();
        const tds = parseFloat(field === 'TDS_Amount_5' ? value : n.TDS_Amount_5) || 0;
        n.Net_Amount_5 = String(Math.max(0, paid - tds));
      }
      if (field === 'Status_5' && value === 'Reject') {
        n.PAYMENT_MODE_5 = ''; n.BANK_DETAILS_5 = ''; n.PAYMENT_DETAILS_5 = '';
        n.Paid_Amount_5 = ''; n.TDS_Amount_5 = ''; n.Net_Amount_5 = '';
        n.Payment_Date_5 = new Date().toISOString().split('T')[0];
      }
      return n;
    });
  };

  const isSubmitDisabled = () => {
    if (!formData.Status_5) return true;
    if (formData.Status_5 === 'Reject') return false;
    return !formData.Paid_Amount_5 || !formData.PAYMENT_MODE_5 || !formData.BANK_DETAILS_5 || !formData.PAYMENT_DETAILS_5.trim() || !formData.Payment_Date_5;
  };

  const handleSubmit = async () => {
    if (!formData.Status_5) return alert('Select Status');
    if (formData.Status_5 !== 'Reject' && (!formData.Paid_Amount_5 || !formData.PAYMENT_MODE_5 || !formData.BANK_DETAILS_5 || !formData.PAYMENT_DETAILS_5.trim() || !formData.Payment_Date_5)) return alert('Fill all required fields');

    let success = 0, failed = 0;
    for (let i = 0; i < billItems.length; i++) {
      const item = billItems[i]; const isLast = i === billItems.length - 1;
      try {
        let payload = { uid: item.uid, isLastUID: isLast, Status_5: isLast ? formData.Status_5 : 'Done' };
        if (isLast && formData.Status_5 !== 'Reject') {
          Object.assign(payload, {
            Paid_Amount_5: formData.Paid_Amount_5, TDS_Amount_5: formData.TDS_Amount_5,
            Net_Amount_5: formData.Net_Amount_5, PAYMENT_MODE_5: formData.PAYMENT_MODE_5,
            BANK_DETAILS_5: formData.BANK_DETAILS_5, PAYMENT_DETAILS_5: formData.PAYMENT_DETAILS_5,
            Payment_Date_5: formData.Payment_Date_5, Remark_5: formData.Remark_5 || ''
          });
        } else if (isLast) { payload.Remark_5 = formData.Remark_5 || ''; }
        const result = await postPaid(payload).unwrap();
        if (result?.success) success++; else failed++;
      } catch (err) {
        if (err?.status === 500 && err?.data?.error?.includes('null')) success++; else failed++;
      }
    }
    alert(success > 0 && failed === 0 ? `✅ Payment Successful! ${success} records` : `⚠️ ${success} success, ${failed} failed`);
    setShowModal(false); refetch(); onBack();
  };

  const paidNames = [...new Set(billItems.map(i => i.Paid_Name).filter(Boolean))];
  const billUrl = billItems.find(i => i.Bill_Url)?.Bill_Url || '';

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 8px' }}>

      {/* Header */}
      <div style={{ background: T.card, borderRadius: 10, border: `1px solid ${T.border}`, padding: '14px 18px', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${T.border}`, background: T.card, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronDown size={16} color={T.textLight} style={{ transform: 'rotate(90deg)' }} />
          </button>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: T.navy, margin: 0 }}>Bill Payment — <span style={{ color: T.gold }}>{billNo}</span></h2>
            <p style={{ fontSize: 12, color: T.textMuted, margin: 0 }}>{billItems.length} records{paidNames.length > 0 && ` • Paid To: ${paidNames.join(', ')}`}</p>
          </div>
        </div>
        {billUrl && <a href={billUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, background: T.navy, color: T.gold, fontSize: 12, fontWeight: 700, textDecoration: 'none' }}><ExternalLink size={14} /> View Bill</a>}
      </div>

      {/* Bill Info */}
      <div style={{ background: `${T.gold}08`, border: `1px solid ${T.gold}30`, borderRadius: 10, padding: 14, marginBottom: 12, display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        <div><p style={{ fontSize: 10, color: T.textMuted }}>Bill No</p><p style={{ fontSize: 16, fontWeight: 800, color: T.goldDark, margin: 0 }}>{billNo}</p></div>
        {paidNames.length > 0 && <div><p style={{ fontSize: 10, color: T.textMuted }}>Paid To</p><p style={{ fontSize: 13, fontWeight: 700, color: T.purple, margin: 0 }}>{paidNames.join(', ')}</p></div>}
        <div><p style={{ fontSize: 10, color: T.textMuted }}>Records</p><p style={{ fontSize: 13, fontWeight: 700, color: T.navy, margin: 0 }}>{billItems.length}</p></div>
        <div><p style={{ fontSize: 10, color: T.textMuted }}>Total Amount</p><p style={{ fontSize: 16, fontWeight: 800, color: T.success, margin: 0 }}>₹{formatAmount(getTotalAmount())}</p></div>
      </div>

      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12, marginBottom: 12 }}>
        {billItems.map((item, i) => <ItemCard key={item.uid || i} item={item} index={i} isLast={i === billItems.length - 1} />)}
      </div>

      {/* ── Payment Modal ── */}
      {showModal && (
        <>
          <div onClick={() => { setShowModal(false); onBack(); }} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(2px)', zIndex: 100 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '95%', maxWidth: 620, background: T.card, borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', zIndex: 101, display: 'flex', flexDirection: 'column', maxHeight: '92vh' }}>

            {/* Header */}
            <div style={{ background: T.navy, padding: '14px 20px', borderBottom: `2px solid ${T.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '14px 14px 0 0' }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}><CircleDollarSign size={16} color={T.gold} /> Payment Processing</h3>
                <p style={{ fontSize: 11, color: T.textMuted, margin: '2px 0 0' }}>Bill: <span style={{ color: T.gold }}>{billNo}</span> • {billItems.length} records • Last: <span style={{ color: T.success }}>{lastItem?.uid}</span></p>
              </div>
              <button onClick={() => { setShowModal(false); onBack(); }} style={{ width: 30, height: 30, borderRadius: 6, border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Summary */}
              <div style={{ background: T.borderLight, borderRadius: 10, padding: '12px 14px', border: `1px solid ${T.border}` }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxHeight: 50, overflowY: 'auto', marginBottom: 8 }}>
                  {billItems.map((item, i) => (
                    <span key={item.uid || i} style={{ padding: '2px 8px', background: i === billItems.length - 1 ? T.successBg : `${T.navy}10`, border: `1px solid ${i === billItems.length - 1 ? T.successBorder : T.border}`, color: i === billItems.length - 1 ? '#065f46' : T.navy, borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                      {item.uid}{i === billItems.length - 1 && ' 📌'}
                    </span>
                  ))}
                </div>
                <div style={{ textAlign: 'center', padding: 10, background: T.card, borderRadius: 8, border: `1px solid ${T.border}` }}>
                  <p style={{ fontSize: 10, color: T.textMuted }}>Total</p>
                  <p style={{ fontSize: 20, fontWeight: 800, color: T.gold, margin: '2px 0 0' }}>₹{formatAmount(getTotalAmount())}</p>
                </div>
              </div>

              {/* Status */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>Status <span style={{ color: T.danger }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <select value={formData.Status_5} onChange={e => handleFormChange('Status_5', e.target.value)}
                    style={{ ...inputBase, paddingRight: 32, appearance: 'none', cursor: 'pointer' }} onFocus={focusGold} onBlur={blurNormal}>
                    <option value="">-- Select --</option>
                    <option value="Done">✅ Done</option>
                    <option value="Reject">❌ Reject</option>
                  </select>
                  <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: T.textMuted, pointerEvents: 'none' }} />
                </div>
              </div>

              {isRejected && (
                <div style={{ padding: '12px 14px', background: T.dangerBg, border: `1px solid ${T.dangerBorder}`, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <XCircle size={18} color={T.danger} />
                  <div><p style={{ fontSize: 13, fontWeight: 600, color: T.danger, margin: 0 }}>Rejection Mode</p><p style={{ fontSize: 11, color: T.danger, margin: '2px 0 0' }}>Add remark and submit.</p></div>
                </div>
              )}

              {!isRejected && (
                <>
                  {/* Payment Mode */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>Payment Mode <span style={{ color: T.danger }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <select value={formData.PAYMENT_MODE_5} onChange={e => handleFormChange('PAYMENT_MODE_5', e.target.value)}
                        style={{ ...inputBase, paddingRight: 32, appearance: 'none', cursor: 'pointer' }} onFocus={focusGold} onBlur={blurNormal}>
                        <option value="">-- Select --</option>
                        <option value="Cheque">📄 Cheque</option>
                        <option value="Cash">💵 Cash</option>
                        <option value="NEFT">📱 NEFT</option>
                        <option value="RTGS">📋 RTGS</option>
                      </select>
                      <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: T.textMuted, pointerEvents: 'none' }} />
                    </div>
                  </div>

                  {/* Bank */}
                  <SearchableDropdown label="Bank Details" icon={Building2} options={uniqueBankNames}
                    value={formData.BANK_DETAILS_5} onChange={val => handleFormChange('BANK_DETAILS_5', val)}
                    placeholder={isBankLoading ? "Loading..." : "Select bank..."} required />

                  {/* Details + Date */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>Payment Details <span style={{ color: T.danger }}>*</span></label>
                      <input type="text" value={formData.PAYMENT_DETAILS_5} onChange={e => handleFormChange('PAYMENT_DETAILS_5', e.target.value)}
                        placeholder="Reference no..." style={{ ...inputBase, borderColor: !formData.PAYMENT_DETAILS_5.trim() ? T.danger : T.border }}
                        onFocus={focusGold} onBlur={blurNormal} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>Date <span style={{ color: T.danger }}>*</span></label>
                      <input type="date" value={formData.Payment_Date_5} onChange={e => handleFormChange('Payment_Date_5', e.target.value)}
                        style={inputBase} onFocus={focusGold} onBlur={blurNormal} />
                    </div>
                  </div>

                  {/* Amounts */}
                  <div style={{ padding: 14, background: T.successBg, borderRadius: 10, border: `1px solid ${T.successBorder}` }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#065f46', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}><IndianRupee size={14} /> Amount Details</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, color: T.navyLight, marginBottom: 4 }}>Paid Amt <span style={{ color: T.danger }}>*</span></label>
                        <input type="number" min="0" value={formData.Paid_Amount_5} onChange={e => handleFormChange('Paid_Amount_5', e.target.value)}
                          placeholder={formatAmount(getTotalAmount())}
                          style={{ ...inputBase, borderColor: !formData.Paid_Amount_5 ? T.danger : T.success }} onFocus={focusGold} onBlur={blurNormal} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, color: T.navyLight, marginBottom: 4 }}>TDS Amt</label>
                        <input type="number" min="0" value={formData.TDS_Amount_5} onChange={e => handleFormChange('TDS_Amount_5', e.target.value)}
                          placeholder="0" style={inputBase} onFocus={focusGold} onBlur={blurNormal} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, color: T.navyLight, marginBottom: 4 }}>Net Amt <span style={{ color: T.success }}>(Auto)</span></label>
                        <input type="number" value={formData.Net_Amount_5} onChange={e => handleFormChange('Net_Amount_5', e.target.value)}
                          style={{ ...inputBase, background: T.successBg }} onFocus={focusGold} onBlur={blurNormal} />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Remark */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>Remark <span style={{ fontSize: 10, color: T.textMuted }}>(Optional)</span></label>
                <textarea value={formData.Remark_5} onChange={e => handleFormChange('Remark_5', e.target.value)}
                  rows={3} placeholder={isRejected ? "Rejection reason..." : "Remarks..."}
                  style={{ ...inputBase, resize: 'vertical', minHeight: 70 }} onFocus={focusGold} onBlur={blurNormal} />
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '14px 20px', borderTop: `1px solid ${T.border}`, background: T.borderLight, display: 'flex', justifyContent: 'flex-end', gap: 10, borderRadius: '0 0 14px 14px' }}>
              <button onClick={() => { setShowModal(false); onBack(); }} style={{ padding: '10px 20px', borderRadius: 8, border: `1.5px solid ${T.border}`, background: T.card, color: T.textLight, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSubmit} disabled={isSubmitting || isSubmitDisabled()}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '10px 24px', borderRadius: 8, border: 'none',
                  background: isSubmitting || isSubmitDisabled() ? T.border : isRejected ? `linear-gradient(135deg, ${T.danger}, #dc2626)` : `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
                  color: isSubmitting || isSubmitDisabled() ? T.textMuted : isRejected ? 'white' : T.navyDark,
                  fontSize: 13, fontWeight: 700, cursor: isSubmitting || isSubmitDisabled() ? 'not-allowed' : 'pointer',
                }}>
                {isSubmitting ? <><Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> Processing...</>
                  : isRejected ? <><XCircle size={15} /> Reject ({billItems.length})</>
                  : <><BadgeCheck size={15} /> Confirm ({billItems.length})</>}
              </button>
            </div>
          </div>
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// ── Main Component ──
const PaidAmount = () => {
  const { data: rawPaidData, isLoading, isError, error, refetch, isFetching } = useGetPaidStepQuery();
  const paidData = useMemo(() => { if (!rawPaidData) return []; if (Array.isArray(rawPaidData)) return rawPaidData; if (Array.isArray(rawPaidData?.data)) return rawPaidData.data; return []; }, [rawPaidData]);
  const [postPaid, { isLoading: isSubmitting }] = usePostLabourPaidMutation();
  const { data: bankList = [], isLoading: isBankLoading } = useGetProjectDropdownQuery();

  const [viewMode, setViewMode] = useState(VIEW_MODE.LIST);
  const [activeBillNo, setActiveBillNo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedContractor, setSelectedContractor] = useState('');
  const [selectedBillNo, setSelectedBillNo] = useState('');
  const [selectedPaidName, setSelectedPaidName] = useState('');

  const uniqueProjectNames = useMemo(() => [...new Set(paidData.map(i => i.projectName).filter(Boolean))].sort(), [paidData]);
  const uniqueContractorNames = useMemo(() => [...new Set(paidData.map(i => i.Labouar_Contractor_Name_3).filter(Boolean))].sort(), [paidData]);
  const uniqueBillNumbers = useMemo(() => [...new Set(paidData.map(i => i.Bill_No).filter(Boolean))].sort(), [paidData]);
  const uniquePaidNames = useMemo(() => [...new Set(paidData.map(i => i.Paid_Name).filter(Boolean))].sort(), [paidData]);
  const uniqueBankNames = useMemo(() => {
    if (!bankList || !Array.isArray(bankList)) return [];
    return [...new Set(bankList.map(i => i.extraField || i.bankName || i.name || '').filter(Boolean))].sort();
  }, [bankList]);

  const filteredData = useMemo(() => paidData.filter(item => {
    const s = searchTerm.toLowerCase();
    const match = !s || [item.uid, item.projectName, item.Labouar_Contractor_Name_3, item.projectEngineer, item.workType, item.Bill_No, item.Paid_Name].some(v => (v || '').toLowerCase().includes(s));
    return match && (!selectedProject || item.projectName === selectedProject) && (!selectedContractor || item.Labouar_Contractor_Name_3 === selectedContractor) && (!selectedBillNo || item.Bill_No === selectedBillNo) && (!selectedPaidName || item.Paid_Name === selectedPaidName);
  }), [paidData, searchTerm, selectedProject, selectedContractor, selectedBillNo, selectedPaidName]);

  const clearAll = () => { setSearchTerm(''); setSelectedProject(''); setSelectedContractor(''); setSelectedBillNo(''); setSelectedPaidName(''); };
  const hasFilters = searchTerm || selectedProject || selectedContractor || selectedBillNo || selectedPaidName;

  const handleBillSelect = (billNo) => { setSelectedBillNo(billNo); if (billNo) { setActiveBillNo(billNo); setViewMode(VIEW_MODE.BILL); } };
  const handleBack = () => { setViewMode(VIEW_MODE.LIST); setActiveBillNo(''); setSelectedBillNo(''); };
  const billItems = useMemo(() => activeBillNo ? paidData.filter(i => i.Bill_No === activeBillNo) : [], [paidData, activeBillNo]);

  if (isLoading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px' }}>
      <div style={{ width: 56, height: 56, borderRadius: 14, background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, boxShadow: `0 0 0 3px ${T.gold}30` }}>
        <Loader2 size={28} color={T.gold} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
      <p style={{ fontSize: 15, fontWeight: 600, color: T.navy }}>Loading Payment Data...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (isError) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px' }}>
      <AlertCircle size={40} color={T.danger} style={{ marginBottom: 12 }} />
      <p style={{ fontSize: 15, fontWeight: 600, color: T.danger }}>Error Loading Data</p>
      <button onClick={refetch} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 8, border: 'none', background: T.danger, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 12 }}><RotateCcw size={14} /> Retry</button>
    </div>
  );

  if (viewMode === VIEW_MODE.BILL && activeBillNo) {
    return <BillPaymentPage billNo={activeBillNo} billItems={billItems} onBack={handleBack} postPaid={postPaid} isSubmitting={isSubmitting} refetch={refetch} uniqueBankNames={uniqueBankNames} isBankLoading={isBankLoading} />;
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 8px' }}>

      {/* Header */}
      <div style={{ background: T.card, borderRadius: 10, border: `1px solid ${T.border}`, padding: '14px 18px', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircleDollarSign size={18} color={T.gold} />
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: T.navy, margin: 0 }}>Payment Processing</h2>
            <p style={{ fontSize: 12, color: T.textMuted, margin: 0 }}>{paidData.length} records • Select Bill No to pay</p>
          </div>
        </div>
        <button onClick={refetch} disabled={isFetching} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: `1.5px solid ${T.border}`, background: T.card, color: T.textLight, fontSize: 13, cursor: isFetching ? 'not-allowed' : 'pointer' }}>
          <RotateCcw size={14} style={isFetching ? { animation: 'spin 0.8s linear infinite' } : {}} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div style={{ background: T.card, borderRadius: 10, border: `1px solid ${T.border}`, padding: '14px 16px', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${T.border}` }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: T.navy, display: 'flex', alignItems: 'center', gap: 6 }}><Filter size={14} color={T.gold} /> Filters</span>
          {hasFilters && <button onClick={clearAll} style={{ fontSize: 12, color: T.gold, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><X size={14} /> Clear</button>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}><Search size={14} /> Search</label>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.textMuted }} />
              <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search..."
                style={{ ...inputBase, paddingLeft: 34 }} onFocus={focusGold} onBlur={blurNormal} />
            </div>
          </div>
          <SearchableDropdown label="Project" icon={Building} options={uniqueProjectNames} value={selectedProject} onChange={setSelectedProject} placeholder="Select..." />
          <SearchableDropdown label="Contractor" icon={HardHat} options={uniqueContractorNames} value={selectedContractor} onChange={setSelectedContractor} placeholder="Select..." />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Receipt size={14} color={T.danger} /> Bill Number <span style={{ fontSize: 10, background: T.dangerBg, color: T.danger, padding: '2px 6px', borderRadius: 4 }}>Click to pay</span>
            </label>
            <SearchableDropdown icon={Receipt} options={uniqueBillNumbers} value={selectedBillNo} onChange={handleBillSelect} placeholder="Select bill to process..." />
          </div>
          <SearchableDropdown label="Paid Name" icon={User} options={uniquePaidNames} value={selectedPaidName} onChange={setSelectedPaidName} placeholder="Select..." />
        </div>

        {hasFilters && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.border}`, alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: T.textMuted }}>Active:</span>
            {searchTerm && <span style={{ background: `${T.gold}15`, color: T.goldDark, padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>🔍 "{searchTerm}" <button onClick={() => setSearchTerm('')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={10} /></button></span>}
            {selectedProject && <span style={{ background: `${T.purple}15`, color: T.purple, padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{selectedProject} <button onClick={() => setSelectedProject('')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={10} /></button></span>}
            {selectedContractor && <span style={{ background: `${T.success}15`, color: T.success, padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{selectedContractor} <button onClick={() => setSelectedContractor('')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={10} /></button></span>}
            {selectedBillNo && <span style={{ background: T.dangerBg, color: T.danger, padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>Bill: {selectedBillNo} <button onClick={() => setSelectedBillNo('')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={10} /></button></span>}
            {selectedPaidName && <span style={{ background: `${T.navy}10`, color: T.navy, padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{selectedPaidName} <button onClick={() => setSelectedPaidName('')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={10} /></button></span>}
          </div>
        )}
      </div>

      {/* Count */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 13, color: T.textLight }}>Showing: <strong style={{ color: T.gold }}>{filteredData.length}</strong> of {paidData.length}</span>
        <span style={{ fontSize: 11, color: T.textMuted }}>💡 Click <span style={{ color: T.danger, fontWeight: 600 }}>Bill No</span> to process</span>
      </div>

      {/* Cards */}
      {filteredData.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px', background: T.card, borderRadius: 10, border: `1px solid ${T.border}` }}>
          <Package size={40} color={T.border} style={{ marginBottom: 12 }} />
          <p style={{ fontSize: 15, color: T.textLight }}>No records found</p>
          {hasFilters && <button onClick={clearAll} style={{ marginTop: 12, padding: '8px 16px', background: `${T.gold}15`, color: T.goldDark, borderRadius: 8, border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Clear Filters</button>}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
          {filteredData.map((item, i) => (
            <div key={item.uid || i} style={{ background: T.card, borderRadius: 14, border: `1px solid ${T.border}`, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              {/* Card Header */}
              <div style={{ padding: '12px 14px', background: T.borderLight }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                  <span style={{ background: `${T.navy}15`, color: T.navy, padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>{item.uid}</span>
                  <span style={{ fontSize: 11, color: T.textMuted }}>Planned: {item.planned5 || 'N/A'}</span>
                </div>
                <p style={{ fontSize: 14, fontWeight: 600, color: T.navy, margin: 0 }}>{item.projectName || 'N/A'}</p>
              </div>

              {/* Card Body */}
              <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 12 }}>
                  <div><span style={{ color: T.textMuted }}>Engineer:</span> <strong>{item.projectEngineer || 'N/A'}</strong></div>
                  <div><span style={{ color: T.textMuted }}>Contractor:</span> <strong>{item.Labouar_Contractor_Name_3 || 'N/A'}</strong></div>
                  <div><span style={{ color: T.textMuted }}>Work:</span> <strong>{item.workType || 'N/A'}</strong></div>
                  <div><span style={{ color: T.textMuted }}>Labour:</span> <strong>{item.totalLabour || '0'}</strong></div>
                </div>

                {item.Paid_Name && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: `${T.navy}08`, borderRadius: 6, padding: '6px 10px', fontSize: 12 }}>
                    <User size={12} color={T.navy} /><strong style={{ color: T.navy }}>{item.Paid_Name}</strong>
                  </div>
                )}

                {item.Bill_No && (
                  <button onClick={() => handleBillSelect(item.Bill_No)} style={{
                    display: 'flex', alignItems: 'center', gap: 6, background: `${T.gold}10`, border: `1px solid ${T.gold}30`,
                    borderRadius: 6, padding: '6px 10px', fontSize: 12, cursor: 'pointer', width: '100%', textAlign: 'left',
                  }}>
                    <Receipt size={12} color={T.goldDark} /><strong style={{ color: T.goldDark }}>{item.Bill_No}</strong>
                  </button>
                )}

                {item.Bill_Url && (
                  <a href={item.Bill_Url} target="_blank" rel="noopener noreferrer" style={{
                    display: 'flex', alignItems: 'center', gap: 6, background: `${T.navy}08`, borderRadius: 6,
                    padding: '6px 10px', fontSize: 11, textDecoration: 'none', color: T.navy, fontWeight: 600,
                  }}><ExternalLink size={12} /> View Bill</a>
                )}

                <div style={{ background: `${T.purple}10`, borderRadius: 6, padding: '6px 10px' }}>
                  <p style={{ fontSize: 10, color: T.purple }}>🏢 Paid Amount</p>
                  <p style={{ fontSize: 14, fontWeight: 800, color: T.purple, margin: 0 }}>₹{formatAmount(item.Revised_Company_Head_Amount_4)}</p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: T.textMuted, background: T.borderLight, borderRadius: 6, padding: '4px 10px' }}>
                  <span>Cat1: {item.Deployed_Category_1_Labour_No_4 || '0'}</span>
                  <span>Cat2: {item.Deployed_Category_2_Labour_No_4 || '0'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default PaidAmount;