
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Loader2, RefreshCw, Search, Filter, X, FileText,
  Building, HardHat, Hash, ChevronDown, ChevronUp,
  Users, Wrench, User, Clock, Check, CheckSquare,
  Square, ListChecks, CircleDollarSign, Receipt,
  AlertCircle, BadgeCheck, RotateCcw, Package
} from 'lucide-react';

const BASE_URL = 'https://new-puchase-project-silk.vercel.app/api/labour/pdf';

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
const focusGold = (e) => { e.target.style.borderColor = T.gold; e.target.style.boxShadow = `0 0 0 3px ${T.gold}15`; e.target.style.background = T.card; };
const blurNormal = (e) => { e.target.style.borderColor = T.border; e.target.style.boxShadow = 'none'; e.target.style.background = T.borderLight; };

const useGetPDFDataQuery = () => {
  const [state, setState] = useState({ data: null, isLoading: true, isError: false, isFetching: false });
  const refetch = async () => {
    setState(s => ({ ...s, isFetching: true }));
    try {
      const res = await fetch(`${BASE_URL}/Get-PDF-Data`);
      const json = await res.json();
      setState({ data: json.success ? json.data : null, isLoading: false, isError: !json.success, isFetching: false });
    } catch { setState({ data: null, isLoading: false, isError: true, isFetching: false }); }
  };
  useEffect(() => { refetch(); }, []);
  return { ...state, refetch };
};

const useGeneratePDFMutation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const mutate = async (payload) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/Generate-PDF`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const json = await res.json();
      setIsLoading(false);
      if (json.success) return json;
      throw new Error(json.error || 'Failed');
    } catch (e) { setIsLoading(false); throw e; }
  };
  return [mutate, { isLoading }];
};

const formatAmount = (value) => {
  if (value == null || value === '') return '0';
  const num = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
  return isNaN(num) ? '0' : num.toLocaleString('en-IN', { maximumFractionDigits: 0 });
};

const Td = ({ children, right, maxW, center, bold }) => (
  <td style={{ padding: '10px 14px', fontSize: 13, color: T.text, borderBottom: `1px solid ${T.border}`, whiteSpace: 'nowrap', textAlign: right ? 'right' : center ? 'center' : 'left', fontWeight: bold ? 600 : 400 }}>
    {maxW ? <span title={typeof children === 'string' ? children : ''} style={{ display: 'block', maxWidth: maxW, overflow: 'hidden', textOverflow: 'ellipsis' }}>{children || <span style={{ color: T.textMuted }}>—</span>}</span>
      : (children || <span style={{ color: T.textMuted }}>—</span>)}
  </td>
);

// ── SearchableDropdown ──
const SearchableDropdown = ({ label, icon: Icon, options = [], value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearch] = useState('');
  const ref = useRef(null);

  const filtered = useMemo(() => options.filter(o => typeof o === 'string' && o.toLowerCase().includes(searchTerm.toLowerCase())), [options, searchTerm]);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) { setIsOpen(false); setSearch(''); } };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {label && (
        <label style={{ fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
          {Icon && <Icon size={14} />}{label}
        </label>
      )}
      <div onClick={() => setIsOpen(o => !o)} style={{
        ...inputBase, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
        borderColor: isOpen ? T.gold : T.border, background: value ? `${T.gold}10` : T.borderLight,
      }}>
        {value ? (
          <span style={{ fontSize: 13, fontWeight: 600, color: T.goldDark, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
        ) : (
          <input value={searchTerm} onChange={e => { setSearch(e.target.value); setIsOpen(true); }}
            onClick={e => { e.stopPropagation(); setIsOpen(true); }}
            placeholder={placeholder} style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: T.text }} />
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          {value && <button onClick={e => { e.stopPropagation(); onChange(''); setSearch(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}><X size={14} color={T.textMuted} /></button>}
          {isOpen ? <ChevronUp size={14} color={T.textMuted} /> : <ChevronDown size={14} color={T.textMuted} />}
        </div>
      </div>
      {isOpen && (
        <div style={{ position: 'absolute', zIndex: 50, width: '100%', marginTop: 4, background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          {value && (
            <div style={{ padding: 8, borderBottom: `1px solid ${T.border}` }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: T.textMuted }} />
                <input autoFocus value={searchTerm} onChange={e => setSearch(e.target.value)} placeholder="Search..."
                  style={{ ...inputBase, paddingLeft: 30, fontSize: 12 }} />
              </div>
            </div>
          )}
          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
            <button onClick={() => { onChange(''); setIsOpen(false); setSearch(''); }}
              style={{ width: '100%', padding: '10px 14px', textAlign: 'left', fontSize: 13, border: 'none', background: !value ? `${T.gold}15` : 'transparent', cursor: 'pointer', color: T.textMuted }}>
              -- Select --
            </button>
            {filtered.length > 0 ? filtered.map((opt, i) => (
              <button key={`${opt}-${i}`} onClick={() => { onChange(opt); setIsOpen(false); setSearch(''); }}
                style={{ width: '100%', padding: '10px 14px', textAlign: 'left', fontSize: 13, border: 'none', background: value === opt ? `${T.gold}15` : 'transparent', cursor: 'pointer', color: T.text, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                onMouseEnter={e => { if (value !== opt) e.currentTarget.style.background = `${T.gold}08`; }}
                onMouseLeave={e => { if (value !== opt) e.currentTarget.style.background = 'transparent'; }}>
                <span>{opt}</span>
                {value === opt && <Check size={14} color={T.goldDark} />}
              </button>
            )) : <div style={{ padding: '12px 14px', fontSize: 13, color: T.textMuted, textAlign: 'center' }}>No results</div>}
          </div>
        </div>
      )}
    </div>
  );
};

// ── PDF Modal ──
const PDFModal = ({ open, onClose, onConfirm, isLoading, selectedItems }) => {
  const [paidName, setPaidName] = useState('');
  const [billNo, setBillNo] = useState('');
  const [billLoading, setBillLoad] = useState(false);
  const [billError, setBillError] = useState('');

  useEffect(() => {
    if (!open) return;
    setPaidName(''); setBillNo(''); setBillError('');
    const fetchBill = async () => {
      setBillLoad(true);
      try {
        const res = await fetch(`${BASE_URL}/Get-Next-BillNo`);
        const json = await res.json();
        if (json.success) setBillNo(json.billNo); else setBillError('Bill No. generate nahi hua');
      } catch { setBillError('Server error'); } finally { setBillLoad(false); }
    };
    fetchBill();
  }, [open]);

  if (!open) return null;

  const totalCompany = selectedItems.reduce((s, r) => s + (parseFloat(String(r.Revised_Company_Head_Amount_4 || '0').replace(/[^0-9.-]/g, '')) || 0), 0);
  const totalContractor = selectedItems.reduce((s, r) => s + (parseFloat(String(r.Revised_Contractor_Head_Amount_4 || '0').replace(/[^0-9.-]/g, '')) || 0), 0);
  const canSubmit = !isLoading && !billLoading && !!billNo && !!paidName && !billError;

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(2px)', zIndex: 100 }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '95%', maxWidth: 500, background: T.card, borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', zIndex: 101, display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
        <div style={{ background: T.navy, padding: '14px 20px', borderBottom: `2px solid ${T.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '14px 14px 0 0' }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}><FileText size={16} color={T.gold} /> Generate Labour PDF</h3>
            <p style={{ fontSize: 11, color: T.textMuted, margin: '2px 0 0' }}><span style={{ color: T.gold, fontWeight: 700 }}>{selectedItems.length}</span> records selected</p>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 6, border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* UIDs + Totals */}
          <div style={{ background: T.borderLight, borderRadius: 10, padding: '12px 14px', border: `1px solid ${T.border}` }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: T.navy, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><ListChecks size={14} /> Selected UIDs</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxHeight: 60, overflowY: 'auto', marginBottom: 10 }}>
              {selectedItems.map((item, i) => (
                <span key={item.uid || i} style={{ padding: '2px 8px', background: `${T.navy}10`, border: `1px solid ${T.navy}20`, color: T.navy, borderRadius: 6, fontSize: 11, fontWeight: 700 }}>{item.uid}</span>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div style={{ background: T.card, borderRadius: 8, padding: 10, textAlign: 'center', border: `1px solid ${T.border}` }}>
                <p style={{ fontSize: 10, color: T.textMuted }}>Company Head</p>
                <p style={{ fontSize: 16, fontWeight: 800, color: T.purple, margin: '2px 0 0' }}>₹{formatAmount(totalCompany)}</p>
              </div>
              <div style={{ background: T.card, borderRadius: 8, padding: 10, textAlign: 'center', border: `1px solid ${T.border}` }}>
                <p style={{ fontSize: 10, color: T.textMuted }}>Contractor Head</p>
                <p style={{ fontSize: 16, fontWeight: 800, color: T.success, margin: '2px 0 0' }}>₹{formatAmount(totalContractor)}</p>
              </div>
            </div>
          </div>

          {/* Bill No */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Hash size={14} /> Bill No.</span>
              <span style={{ fontSize: 10, color: T.gold, display: 'flex', alignItems: 'center', gap: 4 }}><BadgeCheck size={12} /> Auto</span>
            </label>
            <div style={{ ...inputBase, background: billError ? T.dangerBg : `${T.gold}10`, border: billError ? `2px solid ${T.dangerBorder}` : `2px solid ${T.gold}40`, fontWeight: 700, color: billError ? T.danger : T.goldDark, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {billLoading ? <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: T.textMuted, fontWeight: 400 }}><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Generating...</span>
                : billError ? <span style={{ fontSize: 12, fontWeight: 400 }}>{billError}</span>
                : <span>{billNo}</span>}
            </div>
          </div>

          {/* Paid By */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Receipt size={14} /> Paid By <span style={{ color: T.danger }}>*</span>
            </label>
            <input value={paidName} onChange={e => setPaidName(e.target.value)} placeholder="Enter payer name"
              style={inputBase} onFocus={focusGold} onBlur={blurNormal} />
          </div>

          <div style={{ padding: 10, background: `${T.gold}10`, borderRadius: 8, border: `1px solid ${T.gold}30`, fontSize: 12, color: T.goldDark }}>
            ℹ️ PDF Google Drive pe upload hogi aur sheet me <strong>{billNo || '...'}</strong> ke saath update hoga.
          </div>
        </div>

        <div style={{ padding: '14px 20px', borderTop: `1px solid ${T.border}`, background: T.borderLight, display: 'flex', justifyContent: 'flex-end', gap: 10, borderRadius: '0 0 14px 14px' }}>
          <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: 8, border: `1.5px solid ${T.border}`, background: T.card, color: T.textLight, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => onConfirm(paidName, billNo)} disabled={!canSubmit}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 24px', borderRadius: 8, border: 'none', background: canSubmit ? `linear-gradient(135deg, ${T.gold}, ${T.goldDark})` : T.border, color: canSubmit ? T.navyDark : T.textMuted, fontSize: 13, fontWeight: 700, cursor: canSubmit ? 'pointer' : 'not-allowed' }}>
            {isLoading ? <><Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> Generating...</> : <><FileText size={15} /> Generate PDF</>}
          </button>
        </div>
      </div>
    </>
  );
};

// ── Success Modal ──
const PDFSuccessModal = ({ open, billNo, pdfUrl, onClose }) => {
  if (!open) return null;
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 100 }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '95%', maxWidth: 380, background: T.card, borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', zIndex: 101, padding: 32, textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: T.successBg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Check size={32} color={T.success} />
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: T.navy, margin: '0 0 4px' }}>PDF Ready!</h3>
        <p style={{ fontSize: 13, color: T.textMuted, margin: '0 0 12px' }}>Labour PDF generated successfully</p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: `${T.gold}15`, border: `1px solid ${T.gold}30`, borderRadius: 8, marginBottom: 20 }}>
          <BadgeCheck size={14} color={T.goldDark} />
          <span style={{ fontSize: 13, fontWeight: 700, color: T.goldDark }}>{billNo}</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: 8, border: `1.5px solid ${T.border}`, background: T.card, color: T.textLight, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Close</button>
          <a href={pdfUrl} target="_blank" rel="noreferrer" onClick={onClose}
            style={{ flex: 1, padding: '12px', borderRadius: 8, border: 'none', background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`, color: T.navyDark, fontSize: 13, fontWeight: 700, cursor: 'pointer', textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <FileText size={14} /> View PDF
          </a>
        </div>
      </div>
    </>
  );
};

// ── Main Component ──
const LabourPDF = () => {
  const { data: apiData, isLoading, isError, isFetching, refetch } = useGetPDFDataQuery();
  const [generatePDF, { isLoading: isPDFLoading }] = useGeneratePDFMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [pdfSuccess, setPdfSuccess] = useState(null);

  const data = useMemo(() => (Array.isArray(apiData) ? apiData : []), [apiData]);
  const uniqueProjects = useMemo(() => [...new Set(data.map(d => d.projectName).filter(Boolean))].sort(), [data]);
  const hasActiveFilters = searchTerm || selectedProject;

  const filteredData = useMemo(() => data.filter(item => {
    const s = searchTerm.toLowerCase();
    const matchSearch = !s || [item.uid, item.projectName, item.Labouar_Contractor_Name_3, item.projectEngineer, item.workDescription, item.workType].some(v => (v || '').toLowerCase().includes(s));
    return matchSearch && (!selectedProject || item.projectName === selectedProject);
  }), [data, searchTerm, selectedProject]);

  const clearFilters = () => { setSearchTerm(''); setSelectedProject(''); };
  const toggleItem = (item) => setSelectedItems(prev => prev.some(s => s.uid === item.uid) ? prev.filter(s => s.uid !== item.uid) : [...prev, item]);
  const toggleAll = () => setSelectedItems(selectedItems.length === filteredData.length ? [] : [...filteredData]);
  const allSelected = filteredData.length > 0 && selectedItems.length === filteredData.length;

  const totalSelCompany = selectedItems.reduce((s, r) => s + (parseFloat(String(r.Revised_Company_Head_Amount_4 || '0').replace(/[^0-9.-]/g, '')) || 0), 0);
  const totalSelContractor = selectedItems.reduce((s, r) => s + (parseFloat(String(r.Revised_Contractor_Head_Amount_4 || '0').replace(/[^0-9.-]/g, '')) || 0), 0);

  const handleGenerate = async (paidName, billNo) => {
    try {
      const result = await generatePDF({ uids: selectedItems.map(i => i.uid), paidName });
      setSelectedItems([]); setShowModal(false); refetch();
      setPdfSuccess({ billNo: result.billNo, pdfUrl: result.pdfUrl });
    } catch (e) { setToast({ type: 'error', msg: `❌ ${e.message || 'Failed'}` }); }
  };

  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 7000); return () => clearTimeout(t); } }, [toast]);

  const columns = [
    { key: 'dateRequired', label: 'Deployed Date', icon: Clock },
    { key: 'uid', label: 'UID', icon: Hash, isUid: true },
    { key: 'projectName', label: 'Project', icon: Building },
    { key: 'projectEngineer', label: 'Engineer', icon: User },
    { key: 'workType', label: 'Work Type', icon: Wrench },
    { key: 'workDescription', label: 'Description', icon: FileText },
    { key: 'Labouar_Contractor_Name_3', label: 'Contractor', icon: HardHat },
    { key: 'Labour_Category_1_3', label: 'Cat 1', icon: Users },
    { key: 'Number_Of_Labour_1_3', label: 'No.1', isNum: true },
    { key: 'Labour_Category_2_3', label: 'Cat 2', icon: Users },
    { key: 'Number_Of_Labour_2_3', label: 'No.2', isNum: true },
    { key: 'totalLabour', label: 'Total', isNum: true },
    { key: 'Deployed_Category_1_Labour_No_4', label: 'Dep.1', isNum: true },
    { key: 'Deployed_Category_2_Labour_No_4', label: 'Dep.2', isNum: true },
    { key: 'Revised_Company_Head_Amount_4', label: 'Company Amt', isAmt: true, amtColor: T.purple },
    { key: 'Revised_Contractor_Head_Amount_4', label: 'Contractor Amt', isAmt: true, amtColor: T.success },
  ];

  if (isLoading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px' }}>
      <div style={{ width: 56, height: 56, borderRadius: 14, background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, boxShadow: `0 0 0 3px ${T.gold}30` }}>
        <Loader2 size={28} color={T.gold} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
      <p style={{ fontSize: 15, fontWeight: 600, color: T.navy }}>Loading Data...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (isError) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px' }}>
      <AlertCircle size={40} color={T.danger} style={{ marginBottom: 12 }} />
      <p style={{ fontSize: 15, fontWeight: 600, color: T.danger }}>Error Loading Data</p>
      <button onClick={refetch} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 8, border: 'none', background: T.danger, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 12 }}>
        <RotateCcw size={14} /> Retry
      </button>
    </div>
  );

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 8px' }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 200, maxWidth: 360, padding: '12px 16px', borderRadius: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', border: `1px solid ${toast.type === 'success' ? T.successBorder : T.dangerBorder}`, background: toast.type === 'success' ? T.successBg : T.dangerBg }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: toast.type === 'success' ? '#065f46' : T.danger }}>{toast.msg}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ background: T.card, borderRadius: 10, border: `1px solid ${T.border}`, padding: '14px 18px', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={18} color={T.gold} />
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: T.navy, margin: 0 }}>Labour PDF Generator</h2>
            <p style={{ fontSize: 12, color: T.textMuted, margin: 0 }}>{data.length} records</p>
          </div>
        </div>
        <button onClick={refetch} disabled={isFetching} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: `1.5px solid ${T.border}`, background: T.card, color: T.textLight, fontSize: 13, cursor: isFetching ? 'not-allowed' : 'pointer' }}>
          <RotateCcw size={14} style={isFetching ? { animation: 'spin 0.8s linear infinite' } : {}} /> Refresh
        </button>
      </div>

      {/* Selection Banner */}
      {selectedItems.length > 0 && (
        <div style={{ background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`, borderRadius: 10, padding: 14, marginBottom: 12, color: 'white', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}><ListChecks size={16} /> {selectedItems.length} Selected</span>
            <span style={{ background: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: 6, fontSize: 12 }}>🏢 ₹{formatAmount(totalSelCompany)}</span>
            <span style={{ background: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: 6, fontSize: 12 }}>👷 ₹{formatAmount(totalSelContractor)}</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setSelectedItems([])} style={{ padding: '6px 14px', borderRadius: 6, border: 'none', background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Clear</button>
            <button onClick={() => setShowModal(true)} style={{ padding: '6px 16px', borderRadius: 6, border: 'none', background: T.gold, color: T.navyDark, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileText size={13} /> Generate PDF
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ background: T.card, borderRadius: 10, border: `1px solid ${T.border}`, padding: '14px 16px', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${T.border}` }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: T.navy, display: 'flex', alignItems: 'center', gap: 6 }}><Filter size={14} color={T.gold} /> Filters</span>
          {hasActiveFilters && <button onClick={clearFilters} style={{ fontSize: 12, color: T.gold, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><X size={14} /> Clear</button>}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}><Search size={14} /> Search</label>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.textMuted }} />
              <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search UID, engineer..."
                style={{ ...inputBase, paddingLeft: 34 }} onFocus={focusGold} onBlur={blurNormal} />
            </div>
          </div>
          <SearchableDropdown label="Project" icon={Building} options={uniqueProjects} value={selectedProject} onChange={setSelectedProject} placeholder="Select project..." />
        </div>
      </div>

      {/* Count + Select All */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: T.textLight }}>Showing: <strong style={{ color: T.gold }}>{filteredData.length}</strong> of {data.length}</span>
          {selectedItems.length > 0 && <span style={{ fontSize: 12, color: T.gold, fontWeight: 600 }}>{selectedItems.length} selected</span>}
        </div>
        <button onClick={toggleAll} disabled={filteredData.length === 0}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: allSelected ? 'none' : `1.5px solid ${T.border}`, background: allSelected ? T.navy : T.card, color: allSelected ? T.gold : T.text, fontSize: 13, fontWeight: 600, cursor: filteredData.length === 0 ? 'not-allowed' : 'pointer', opacity: filteredData.length === 0 ? 0.4 : 1 }}>
          {allSelected ? <CheckSquare size={14} /> : <Square size={14} />}
          {allSelected ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      {/* Table */}
      <div style={{ background: T.card, borderRadius: 10, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
        {filteredData.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px' }}>
            <Package size={40} color={T.border} style={{ marginBottom: 12 }} />
            <p style={{ fontSize: 15, color: T.textLight }}>No records found</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', maxHeight: '65vh', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                <tr style={{ background: T.navy }}>
                  <th style={{ padding: '12px 14px', borderBottom: `2px solid ${T.gold}`, width: 40 }}>
                    <div onClick={toggleAll} style={{ width: 20, height: 20, borderRadius: 4, border: `2px solid ${allSelected ? T.gold : 'rgba(255,255,255,0.4)'}`, background: allSelected ? T.gold : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', margin: '0 auto' }}>
                      {allSelected && <Check size={12} color={T.navyDark} />}
                    </div>
                  </th>
                  {columns.map(col => (
                    <th key={col.key} style={{ padding: '12px 14px', textAlign: 'left', color: T.goldLight, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap', borderBottom: `2px solid ${T.gold}` }}>
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, i) => {
                  const isSel = selectedItems.some(s => s.uid === row.uid);
                  return (
                    <tr key={row.uid || i} onClick={() => toggleItem(row)}
                      style={{ background: isSel ? `${T.gold}10` : i % 2 === 0 ? T.card : T.borderLight, cursor: 'pointer', borderBottom: `1px solid ${T.border}` }}
                      onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = `${T.gold}08`; }}
                      onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = i % 2 === 0 ? T.card : T.borderLight; }}>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ width: 20, height: 20, borderRadius: 4, border: `2px solid ${isSel ? T.gold : T.border}`, background: isSel ? T.gold : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                          {isSel && <Check size={12} color={T.navyDark} />}
                        </div>
                      </td>
                      {columns.map(col => (
                        <td key={col.key} style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                          {col.isUid ? (
                            <span style={{ background: `${T.navy}15`, color: T.navy, padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>{row[col.key] || '—'}</span>
                          ) : col.isAmt ? (
                            <span style={{ fontWeight: 700, color: col.amtColor }}>{row[col.key] ? `₹${formatAmount(row[col.key])}` : '—'}</span>
                          ) : col.isNum ? (
                            <span style={{ fontWeight: 700, color: row[col.key] ? T.text : T.textMuted }}>{row[col.key] || '—'}</span>
                          ) : (
                            <span style={{ display: 'block', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', color: row[col.key] ? T.text : T.textMuted }} title={row[col.key] || ''}>
                              {row[col.key] || '—'}
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
              {selectedItems.length > 0 && (
                <tfoot>
                  <tr style={{ background: T.navy, color: 'white', fontSize: 12, fontWeight: 700 }}>
                    <td colSpan={columns.length - 1} style={{ padding: '10px 14px', textAlign: 'right' }}>
                      {selectedItems.length} selected — Total:
                    </td>
                    <td style={{ padding: '10px 14px', color: T.goldLight }}>₹{formatAmount(totalSelCompany)}</td>
                    <td style={{ padding: '10px 14px', color: T.successBorder }}>₹{formatAmount(totalSelContractor)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>

      <PDFModal open={showModal} onClose={() => setShowModal(false)} onConfirm={handleGenerate} isLoading={isPDFLoading} selectedItems={selectedItems} />
      <PDFSuccessModal open={!!pdfSuccess} billNo={pdfSuccess?.billNo} pdfUrl={pdfSuccess?.pdfUrl} onClose={() => setPdfSuccess(null)} />

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default LabourPDF;