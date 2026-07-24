
import React, { useState, useEffect } from 'react';
import {
  useGetLabourManagementQuery,
  usePostLabourManagementMutation
} from '../../redux/Labour/LabourSlice';
import {
  Loader2, RefreshCw, User, Calendar, Users, FileText, Building,
  AlertCircle, Search, Filter, X, Wrench, Clock, Hash, Pencil, Send,
  ChevronDown, IndianRupee, Truck, Wallet, Building2, HardHat,
  ChevronRight, ChevronUp, XCircle, RotateCcw, Package
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
  warning: '#f59e0b', warningBg: '#fffbeb',
};

const inputBase = {
  width: '100%', padding: '10px 12px', fontSize: 13,
  border: `1.5px solid ${T.border}`, borderRadius: 8,
  outline: 'none', color: T.text, background: T.borderLight,
  transition: 'all 0.2s', boxSizing: 'border-box',
};
const focusGold = (e) => { e.target.style.borderColor = T.gold; e.target.style.boxShadow = `0 0 0 3px ${T.gold}15`; e.target.style.background = T.card; };
const blurNormal = (e) => { e.target.style.borderColor = T.border; e.target.style.boxShadow = 'none'; e.target.style.background = T.borderLight; };

const Td = ({ children, right, maxW, center, bold }) => (
  <td style={{ padding: '10px 14px', fontSize: 13, color: T.text, borderBottom: `1px solid ${T.border}`, whiteSpace: 'nowrap', textAlign: right ? 'right' : center ? 'center' : 'left', fontWeight: bold ? 600 : 400 }}>
    {maxW ? <span title={typeof children === 'string' ? children : ''} style={{ display: 'block', maxWidth: maxW, overflow: 'hidden', textOverflow: 'ellipsis' }}>{children || <span style={{ color: T.textMuted }}>—</span>}</span>
      : (children || <span style={{ color: T.textMuted }}>—</span>)}
  </td>
);

// ── Mobile Card ──
const MobileCard = ({ item, onAction }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{ background: T.card, borderRadius: 12, border: `1px solid ${T.border}`, marginBottom: 10, overflow: 'hidden' }}>
      <div style={{ padding: '12px 14px', background: T.navy, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
            <span style={{ background: `${T.gold}30`, color: T.goldLight, padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>{item.uid}</span>
            <span style={{ background: `${T.gold}20`, color: T.goldDark, padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{item.workType || 'N/A'}</span>
          </div>
          <p style={{ color: 'white', fontSize: 14, fontWeight: 600, margin: 0 }}>{item.projectName || 'N/A'}</p>
          <p style={{ color: T.textMuted, fontSize: 12, margin: '2px 0 0' }}>{item.projectEngineer || 'N/A'}</p>
        </div>
        <button onClick={() => onAction(item)} style={{ width: 36, height: 36, borderRadius: 8, border: 'none', background: T.gold, color: T.navyDark, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Pencil size={16} />
        </button>
      </div>
      <div style={{ padding: '12px 14px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
          <div style={{ textAlign: 'center', background: T.borderLight, borderRadius: 8, padding: 8 }}>
            <p style={{ fontSize: 10, color: T.textMuted }}>Planned</p>
            <p style={{ fontSize: 12, fontWeight: 700, color: T.navy }}>{item.planned3 || 'N/A'}</p>
          </div>
          <div style={{ textAlign: 'center', background: `${T.gold}10`, borderRadius: 8, padding: 8 }}>
            <p style={{ fontSize: 10, color: T.goldDark }}>Date Req.</p>
            <p style={{ fontSize: 12, fontWeight: 700, color: T.goldDark }}>{item.dateRequired || 'N/A'}</p>
          </div>
          <div style={{ textAlign: 'center', background: T.successBg, borderRadius: 8, padding: 8 }}>
            <p style={{ fontSize: 10, color: T.success }}>Labour</p>
            <p style={{ fontSize: 16, fontWeight: 800, color: T.success }}>{item.totalLabour || '0'}</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
          <div style={{ background: `${T.navy}08`, borderRadius: 8, padding: 10 }}>
            <p style={{ fontSize: 10, color: T.textMuted }}>Cat. 1</p>
            <p style={{ fontSize: 12, fontWeight: 600, color: T.navy }}>{item.labourCategory1 || 'N/A'}</p>
            <span style={{ background: `${T.navy}15`, color: T.navy, padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700, marginTop: 4, display: 'inline-block' }}>{item.numberOfLabour1 || '0'}</span>
          </div>
          <div style={{ background: `${T.gold}08`, borderRadius: 8, padding: 10 }}>
            <p style={{ fontSize: 10, color: T.goldDark }}>Cat. 2</p>
            <p style={{ fontSize: 12, fontWeight: 600, color: T.goldDark }}>{item.labourCategory2 || 'N/A'}</p>
            <span style={{ background: `${T.gold}15`, color: T.goldDark, padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700, marginTop: 4, display: 'inline-block' }}>{item.numberOfLabour2 || '0'}</span>
          </div>
        </div>
        <button onClick={() => setExpanded(!expanded)} style={{ width: '100%', padding: '8px 0', border: `1px dashed ${T.border}`, borderRadius: 8, background: 'transparent', color: T.textMuted, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {expanded ? 'Less' : 'More'}
        </button>
        {expanded && (
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: T.textMuted }}>Contractor</span><strong>{item.Name_Of_Contractor_2 || 'N/A'}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: T.textMuted }}>Firm</span><strong>{item.Contractor_Firm_Name_2 || '-'}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: T.textMuted }}>Head</span><strong style={{ color: T.purple }}>{item.Approved_Head_2 || 'N/A'}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: T.textMuted }}>Description</span><strong>{item.workDescription || 'N/A'}</strong></div>
          </div>
        )}
      </div>
    </div>
  );
};

const LabourManagement = () => {
  const { data: labourData, isLoading, isError, error, refetch, isFetching } = useGetLabourManagementQuery();
  const [postLabourManagement, { isLoading: isSubmitting }] = usePostLabourManagementMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    Status_3: '', Labouar_Contractor_Name_3: '', Labour_Category_1_3: '', Number_Of_Labour_1_3: '',
    Labour_Rate_1_3: '', Labour_Category_2_3: '', Number_Of_Labour_2_3: '', Labour_Rate_2_3: '',
    Total_Wages_3: '', Conveyanance_3: '', Contractor_Commission: '', Total_Paid_Amount_3: '',
    Company_Head_Amount_3: '', Contractor_Head_Amount_3: '', Remark_3: ''
  });

  const isRejected = formData.Status_3 === 'Reject';
  const isCompanyHead = selectedItem?.Approved_Head_2 === 'Company Head';

  const filteredData = labourData?.filter(item =>
    item.uid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.nameOfContractor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.projectEngineer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.workType?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Auto Calculate
  useEffect(() => {
    if (isRejected) return;
    const num1 = parseFloat(formData.Number_Of_Labour_1_3) || 0;
    const rate1 = parseFloat(formData.Labour_Rate_1_3) || 0;
    const num2 = parseFloat(formData.Number_Of_Labour_2_3) || 0;
    const rate2 = parseFloat(formData.Labour_Rate_2_3) || 0;
    const conv = parseFloat(formData.Conveyanance_3) || 0;
    const comm = parseFloat(formData.Contractor_Commission) || 0;
    const totalWages = (num1 * rate1) + (num2 * rate2);
    const totalPaid = totalWages + conv + comm;
    setFormData(prev => ({
      ...prev,
      Total_Wages_3: totalWages > 0 ? totalWages.toString() : '',
      Total_Paid_Amount_3: totalPaid > 0 ? totalPaid.toString() : '',
      Company_Head_Amount_3: totalPaid > 0 ? totalPaid.toString() : ''
    }));
  }, [formData.Number_Of_Labour_1_3, formData.Labour_Rate_1_3, formData.Number_Of_Labour_2_3, formData.Labour_Rate_2_3, formData.Conveyanance_3, formData.Contractor_Commission, isRejected]);

  const handleAction = (item) => {
    setSelectedItem(item); setFormError('');
    setFormData({
      Status_3: '', Labouar_Contractor_Name_3: '',
      Labour_Category_1_3: item.labourCategory1 || '', Number_Of_Labour_1_3: item.numberOfLabour1 || '', Labour_Rate_1_3: '',
      Labour_Category_2_3: item.labourCategory2 || '', Number_Of_Labour_2_3: item.numberOfLabour2 || '', Labour_Rate_2_3: '',
      Total_Wages_3: '', Conveyanance_3: '', Contractor_Commission: '', Total_Paid_Amount_3: '',
      Company_Head_Amount_3: '', Contractor_Head_Amount_3: '', Remark_3: ''
    });
    setShowModal(true);
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      if (field === 'Status_3' && value === 'Reject') {
        newData.Labouar_Contractor_Name_3 = ''; newData.Labour_Rate_1_3 = ''; newData.Labour_Rate_2_3 = '';
        newData.Total_Wages_3 = ''; newData.Conveyanance_3 = ''; newData.Contractor_Commission = '';
        newData.Total_Paid_Amount_3 = ''; newData.Company_Head_Amount_3 = ''; newData.Contractor_Head_Amount_3 = '';
      }
      return newData;
    });
    if (formError) setFormError('');
  };

  const resetForm = () => {
    setFormData({ Status_3: '', Labouar_Contractor_Name_3: '', Labour_Category_1_3: '', Number_Of_Labour_1_3: '', Labour_Rate_1_3: '', Labour_Category_2_3: '', Number_Of_Labour_2_3: '', Labour_Rate_2_3: '', Total_Wages_3: '', Conveyanance_3: '', Contractor_Commission: '', Total_Paid_Amount_3: '', Company_Head_Amount_3: '', Contractor_Head_Amount_3: '', Remark_3: '' });
    setFormError('');
  };

  const validateForm = () => {
    if (!formData.Status_3) { setFormError('Select Status'); return false; }
    if (formData.Status_3 === 'Reject') return true;
    if (!isCompanyHead && (!formData.Contractor_Head_Amount_3 || !formData.Contractor_Head_Amount_3.trim())) {
      setFormError('Contractor Head Amount required'); return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!selectedItem || !validateForm()) return;
    try {
      let payload = { uid: selectedItem.uid, Status_3: formData.Status_3, Remark_3: formData.Remark_3 || '' };
      if (formData.Status_3 !== 'Reject') {
        payload = { ...payload, Labouar_Contractor_Name_3: formData.Labouar_Contractor_Name_3, Labour_Category_1_3: formData.Labour_Category_1_3, Number_Of_Labour_1_3: formData.Number_Of_Labour_1_3, Labour_Rate_1_3: formData.Labour_Rate_1_3, Labour_Category_2_3: formData.Labour_Category_2_3, Number_Of_Labour_2_3: formData.Number_Of_Labour_2_3, Labour_Rate_2_3: formData.Labour_Rate_2_3, Total_Wages_3: formData.Total_Wages_3, Conveyanance_3: formData.Conveyanance_3, Contractor_Commission: formData.Contractor_Commission, Total_Paid_Amount_3: formData.Total_Paid_Amount_3, Company_Head_Amount_3: formData.Company_Head_Amount_3, Contractor_Head_Amount_3: formData.Contractor_Head_Amount_3 };
      }
      const result = await postLabourManagement(payload).unwrap();
      if (result.success) { alert(`✅ Updated! Row: ${result.rowNumber}`); setShowModal(false); setSelectedItem(null); resetForm(); refetch(); }
      else alert(`❌ Error: ${result.message}`);
    } catch (err) { alert(`❌ Error: ${err?.data?.message || err?.error || 'Failed'}`); }
  };

  if (isLoading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px' }}>
      <div style={{ width: 56, height: 56, borderRadius: 14, background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, boxShadow: `0 0 0 3px ${T.gold}30` }}>
        <Loader2 size={28} color={T.gold} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
      <p style={{ fontSize: 15, fontWeight: 600, color: T.navy }}>Loading Labour Data...</p>
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

  const tableCols = [
    { label: 'Planned', w: 120 }, { label: 'UID', w: 70 }, { label: 'Project', w: 150 },
    { label: 'Engineer', w: 130 }, { label: 'Work Type', w: 100 }, { label: 'Description', w: 200 },
    { label: 'Cat 1', w: 100 }, { label: 'No.1', w: 60 }, { label: 'Cat 2', w: 100 }, { label: 'No.2', w: 60 },
    { label: 'Total', w: 60 }, { label: 'Date Req.', w: 120 }, { label: 'Contractor', w: 140 },
    { label: 'Firm', w: 130 }, { label: 'Head', w: 120 }, { label: 'Remark', w: 130 }, { label: 'Action', w: 80 },
  ];

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 8px' }}>

      {/* Header */}
      <div style={{ background: T.card, borderRadius: 10, border: `1px solid ${T.border}`, padding: '14px 18px', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wallet size={18} color={T.gold} />
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: T.navy, margin: 0 }}>Labour Management</h2>
            <p style={{ fontSize: 12, color: T.textMuted, margin: 0 }}>{filteredData.length} records</p>
          </div>
        </div>
        <button onClick={refetch} disabled={isFetching} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: `1.5px solid ${T.border}`, background: T.card, color: T.textLight, fontSize: 13, cursor: isFetching ? 'not-allowed' : 'pointer' }}>
          <RotateCcw size={14} style={isFetching ? { animation: 'spin 0.8s linear infinite' } : {}} /> Refresh
        </button>
      </div>

      {/* Search */}
      <div style={{ background: T.card, borderRadius: 10, border: `1px solid ${T.border}`, padding: '12px 16px', marginBottom: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.textMuted }} />
          <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            style={{ ...inputBase, paddingLeft: 36 }} onFocus={focusGold} onBlur={blurNormal} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: T.borderLight, borderRadius: 8, fontSize: 13, color: T.textLight, fontWeight: 600, whiteSpace: 'nowrap' }}>
          <Filter size={14} /> <span style={{ color: T.gold, fontWeight: 700 }}>{filteredData.length}</span>
        </div>
      </div>

      {filteredData.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px', background: T.card, borderRadius: 10, border: `1px solid ${T.border}` }}>
          <Package size={40} color={T.border} style={{ marginBottom: 12 }} />
          <p style={{ fontSize: 15, color: T.textLight }}>No records found</p>
        </div>
      ) : (
        <>
          {/* Mobile */}
          <div className="mobile-cards" style={{ display: 'none' }}>
            {filteredData.map((item, idx) => <MobileCard key={item.uid || idx} item={item} onAction={handleAction} />)}
          </div>

          {/* Desktop */}
          <div className="desktop-table" style={{ background: T.card, borderRadius: 10, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto', maxHeight: '65vh', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                  <tr style={{ background: T.navy }}>
                    {tableCols.map((col, i) => (
                      <th key={i} style={{ padding: '12px 14px', textAlign: col.label === 'Action' ? 'center' : 'left', color: T.goldLight, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap', minWidth: col.w, borderBottom: `2px solid ${T.gold}` }}>{col.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item, idx) => (
                    <tr key={item.uid || idx} style={{ background: idx % 2 === 0 ? T.card : T.borderLight }}
                      onMouseEnter={e => { e.currentTarget.style.background = `${T.gold}08`; }}
                      onMouseLeave={e => { e.currentTarget.style.background = idx % 2 === 0 ? T.card : T.borderLight; }}>
                      <Td><span style={{ background: `${T.purple}15`, color: T.purple, padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>{item.planned3 || 'N/A'}</span></Td>
                      <Td><span style={{ background: `${T.navy}15`, color: T.navy, padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>{item.uid}</span></Td>
                      <Td maxW={150} bold>{item.projectName}</Td>
                      <Td maxW={130}>{item.projectEngineer}</Td>
                      <Td><span style={{ background: `${T.gold}15`, color: T.goldDark, padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>{item.workType || 'N/A'}</span></Td>
                      <Td maxW={200}>{item.workDescription}</Td>
                      <Td>{item.labourCategory1}</Td>
                      <Td center><span style={{ background: `${T.navy}10`, color: T.navy, padding: '3px 8px', borderRadius: 6, fontWeight: 700 }}>{item.numberOfLabour1 || '0'}</span></Td>
                      <Td>{item.labourCategory2}</Td>
                      <Td center><span style={{ background: `${T.navy}10`, color: T.navy, padding: '3px 8px', borderRadius: 6, fontWeight: 700 }}>{item.numberOfLabour2 || '0'}</span></Td>
                      <Td center><span style={{ background: `${T.success}15`, color: T.success, padding: '3px 10px', borderRadius: 6, fontWeight: 800 }}>{item.totalLabour || '0'}</span></Td>
                      <Td><span style={{ background: `${T.gold}15`, color: T.goldDark, padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>{item.dateRequired || 'N/A'}</span></Td>
                      <Td maxW={130} bold>{item.Name_Of_Contractor_2}</Td>
                      <Td maxW={120}>{item.Contractor_Firm_Name_2}</Td>
                      <Td><span style={{ background: `${T.purple}15`, color: T.purple, padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>{item.Approved_Head_2 || 'N/A'}</span></Td>
                      <Td maxW={120}>{item.remark}</Td>
                      <td style={{ padding: '10px 14px', textAlign: 'center', borderBottom: `1px solid ${T.border}` }}>
                        <button onClick={() => handleAction(item)} style={{ width: 34, height: 34, borderRadius: 8, border: `1.5px solid ${T.gold}40`, background: `${T.gold}10`, color: T.goldDark, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = T.gold; e.currentTarget.style.color = T.navyDark; }}
                          onMouseLeave={e => { e.currentTarget.style.background = `${T.gold}10`; e.currentTarget.style.color = T.goldDark; }}>
                          <Pencil size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ════ MODAL ════ */}
      {showModal && selectedItem && (
        <>
          <div onClick={() => { setShowModal(false); resetForm(); }} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(2px)', zIndex: 100 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '95%', maxWidth: 600, background: T.card, borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', zIndex: 101, display: 'flex', flexDirection: 'column', maxHeight: '92vh' }}>

            {/* Header */}
            <div style={{ background: T.navy, padding: '14px 20px', borderBottom: `2px solid ${T.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '14px 14px 0 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: `${T.gold}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Wallet size={16} color={T.gold} />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: 'white', margin: 0 }}>Labour Management</h3>
                  <p style={{ fontSize: 11, color: T.textMuted, margin: 0 }}>UID: <span style={{ color: T.gold }}>{selectedItem.uid}</span> | {selectedItem.projectName}</p>
                </div>
              </div>
              <button onClick={() => { setShowModal(false); resetForm(); }} style={{ width: 30, height: 30, borderRadius: 6, border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Quick Info */}
              <div style={{ background: T.borderLight, borderRadius: 10, padding: '12px 14px', border: `1px solid ${T.border}` }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px', fontSize: 12 }}>
                  <div><span style={{ color: T.textMuted }}>Work Type:</span> <strong>{selectedItem.workType}</strong></div>
                  <div><span style={{ color: T.textMuted }}>Total Labour:</span> <strong style={{ color: T.success }}>{selectedItem.totalLabour}</strong></div>
                  <div><span style={{ color: T.textMuted }}>Head:</span> <strong style={{ color: T.purple }}>{selectedItem.Approved_Head_2}</strong></div>
                  <div><span style={{ color: T.textMuted }}>Date:</span> <strong>{selectedItem.dateRequired}</strong></div>
                  <div><span style={{ color: T.textMuted }}>Contractor:</span> <strong>{selectedItem.Name_Of_Contractor_2}</strong></div>
                  <div><span style={{ color: T.textMuted }}>Firm:</span> <strong>{selectedItem.Contractor_Firm_Name_2}</strong></div>
                </div>
              </div>

              {/* Status */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>Status <span style={{ color: T.danger }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <select value={formData.Status_3} onChange={(e) => handleFormChange('Status_3', e.target.value)}
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
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: T.danger, margin: 0 }}>Rejection Mode</p>
                    <p style={{ fontSize: 11, color: T.danger, margin: '2px 0 0' }}>Add optional remark and submit.</p>
                  </div>
                </div>
              )}

              {!isRejected && (
                <>
                  {/* Labour Contractor */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>
                      <HardHat size={12} style={{ display: 'inline', marginRight: 4 }} />Labour Contractor Name
                    </label>
                    <input type="text" value={formData.Labouar_Contractor_Name_3}
                      onChange={(e) => handleFormChange('Labouar_Contractor_Name_3', e.target.value)}
                      placeholder="Enter name..." style={inputBase} onFocus={focusGold} onBlur={blurNormal} />
                  </div>

                  {/* Cat 1 */}
                  <div style={{ padding: 14, background: `${T.gold}08`, borderRadius: 10, border: `1px dashed ${T.gold}50` }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: T.goldDark, marginBottom: 10 }}>Labour Category 1</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, color: T.navyLight, marginBottom: 4 }}>Category</label>
                        <input type="text" value={formData.Labour_Category_1_3} disabled style={{ ...inputBase, background: T.borderLight, cursor: 'not-allowed' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, color: T.navyLight, marginBottom: 4 }}>No. of Labour</label>
                        <input type="number" value={formData.Number_Of_Labour_1_3} onChange={(e) => handleFormChange('Number_Of_Labour_1_3', e.target.value)} style={inputBase} onFocus={focusGold} onBlur={blurNormal} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, color: T.navyLight, marginBottom: 4 }}>Rate (₹)</label>
                        <input type="number" value={formData.Labour_Rate_1_3} onChange={(e) => handleFormChange('Labour_Rate_1_3', e.target.value)} style={inputBase} onFocus={focusGold} onBlur={blurNormal} />
                      </div>
                    </div>
                  </div>

                  {/* Cat 2 */}
                  <div style={{ padding: 14, background: `${T.navy}08`, borderRadius: 10, border: `1px dashed ${T.navy}30` }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: T.navy, marginBottom: 10 }}>Labour Category 2</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, color: T.navyLight, marginBottom: 4 }}>Category</label>
                        <input type="text" value={formData.Labour_Category_2_3} disabled style={{ ...inputBase, background: T.borderLight, cursor: 'not-allowed' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, color: T.navyLight, marginBottom: 4 }}>No. of Labour</label>
                        <input type="number" value={formData.Number_Of_Labour_2_3} onChange={(e) => handleFormChange('Number_Of_Labour_2_3', e.target.value)} style={inputBase} onFocus={focusGold} onBlur={blurNormal} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, color: T.navyLight, marginBottom: 4 }}>Rate (₹)</label>
                        <input type="number" value={formData.Labour_Rate_2_3} onChange={(e) => handleFormChange('Labour_Rate_2_3', e.target.value)} style={inputBase} onFocus={focusGold} onBlur={blurNormal} />
                      </div>
                    </div>
                  </div>

                  {/* Payment */}
                  <div style={{ padding: 14, background: T.successBg, borderRadius: 10, border: `1px solid ${T.successBorder}` }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#065f46', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <IndianRupee size={14} /> Payment Details
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, color: T.navyLight, marginBottom: 4 }}>Total Wages <span style={{ color: T.success }}>(Auto)</span></label>
                        <div style={{ padding: '8px 12px', background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 13, fontWeight: 700, color: T.success }}>₹ {formData.Total_Wages_3 || '0'}</div>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, color: T.navyLight, marginBottom: 4 }}>Conveyance (₹)</label>
                        <input type="number" value={formData.Conveyanance_3} onChange={(e) => handleFormChange('Conveyanance_3', e.target.value)} placeholder="0" style={inputBase} onFocus={focusGold} onBlur={blurNormal} />
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', fontSize: 11, color: T.navyLight, marginBottom: 4 }}>Commission (₹) <span style={{ color: T.goldDark }}>→ AP column</span></label>
                        <input type="number" value={formData.Contractor_Commission} onChange={(e) => handleFormChange('Contractor_Commission', e.target.value)} placeholder="0" style={{ ...inputBase, border: `1.5px solid ${T.gold}` }} onFocus={focusGold} onBlur={blurNormal} />
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', fontSize: 11, color: T.navyLight, marginBottom: 4 }}>Total Paid <span style={{ color: T.success }}>(Auto)</span></label>
                        <div style={{ padding: '12px', background: `${T.success}15`, border: `2px solid ${T.success}40`, borderRadius: 8, fontSize: 18, fontWeight: 800, color: T.success, textAlign: 'center' }}>₹ {formData.Total_Paid_Amount_3 || '0'}</div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 6, fontSize: 11, color: T.textMuted }}>
                          <span>₹{formData.Total_Wages_3 || '0'} Wages</span>
                          <span>+</span>
                          <span>₹{formData.Conveyanance_3 || '0'} Conv.</span>
                          <span>+</span>
                          <span style={{ color: T.goldDark, fontWeight: 600 }}>₹{formData.Contractor_Commission || '0'} Comm.</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Amount Distribution */}
                  <div style={{ padding: 14, background: `${T.purple}08`, borderRadius: 10, border: `1px dashed ${T.purple}40` }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: T.purple, marginBottom: 10 }}>Amount Distribution</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, color: T.navyLight, marginBottom: 4 }}>🏢 Company Head <span style={{ color: T.success }}>(Auto)</span></label>
                        <input type="number" value={formData.Company_Head_Amount_3} disabled style={{ ...inputBase, background: `${T.purple}10`, fontWeight: 700, color: T.purple, cursor: 'not-allowed' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, color: T.navyLight, marginBottom: 4 }}>
                          👷 Contractor Head {!isCompanyHead && <span style={{ color: T.danger }}>*</span>}
                        </label>
                        <input type="number" value={formData.Contractor_Head_Amount_3}
                          onChange={(e) => handleFormChange('Contractor_Head_Amount_3', e.target.value)}
                          placeholder={isCompanyHead ? 'N/A' : '0'}
                          disabled={isCompanyHead}
                          style={{ ...inputBase, background: isCompanyHead ? T.borderLight : T.card, cursor: isCompanyHead ? 'not-allowed' : 'text' }}
                          onFocus={!isCompanyHead ? focusGold : undefined}
                          onBlur={!isCompanyHead ? blurNormal : undefined} />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Remark */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>Remark <span style={{ fontSize: 10, color: T.textMuted }}>(Optional)</span></label>
                <textarea value={formData.Remark_3} onChange={(e) => handleFormChange('Remark_3', e.target.value)}
                  rows={3} placeholder={isRejected ? "Reason for rejection..." : "Remarks..."}
                  style={{ ...inputBase, resize: 'vertical', minHeight: 70 }} onFocus={focusGold} onBlur={blurNormal} />
              </div>

              {formError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: T.dangerBg, border: `1px solid ${T.dangerBorder}`, borderRadius: 8, fontSize: 13, color: T.danger }}>
                  <AlertCircle size={16} /> {formError}
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '14px 20px', borderTop: `1px solid ${T.border}`, background: T.borderLight, display: 'flex', justifyContent: 'flex-end', gap: 10, borderRadius: '0 0 14px 14px' }}>
              <button onClick={() => { setShowModal(false); resetForm(); }} style={{ padding: '10px 20px', borderRadius: 8, border: `1.5px solid ${T.border}`, background: T.card, color: T.textLight, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSubmit} disabled={isSubmitting || !formData.Status_3}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '10px 24px', borderRadius: 8, border: 'none',
                  background: isSubmitting || !formData.Status_3 ? T.border : isRejected ? `linear-gradient(135deg, ${T.danger}, #dc2626)` : `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
                  color: isSubmitting || !formData.Status_3 ? T.textMuted : isRejected ? 'white' : T.navyDark,
                  fontSize: 13, fontWeight: 700, cursor: isSubmitting || !formData.Status_3 ? 'not-allowed' : 'pointer',
                }}>
                {isSubmitting ? <><Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> Submitting...</>
                  : isRejected ? <><XCircle size={15} /> Reject</>
                  : <><Send size={15} /> Submit</>}
              </button>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .mobile-cards { display: none !important; }
        .desktop-table { display: block !important; }
        @media (max-width: 768px) {
          .mobile-cards { display: block !important; }
          .desktop-table { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default LabourManagement;