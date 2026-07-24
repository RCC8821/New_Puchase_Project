
import React, { useState, useEffect } from 'react';
import {
  useGetApprovelAshokSirQuery,
  usePostLabourApprovalAshokSirMutation
} from '../../redux/Labour/LabourSlice';
import {
  Loader2, RefreshCw, User, Calendar, Users, FileText, Building,
  AlertCircle, Search, Filter, X, Wrench, Clock, Hash, Pencil, Send,
  ChevronDown, IndianRupee, Truck, Wallet, Building2, HardHat,
  UserCheck, CheckCircle2, MessageSquare, XCircle, RotateCcw, Package
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

const Approvel2 = () => {
  const { data: approvalData, isLoading, isError, error, refetch, isFetching } = useGetApprovelAshokSirQuery();
  const [postApproval, { isLoading: isSubmitting }] = usePostLabourApprovalAshokSirMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('');   // ✅ NEW
  const [toDate, setToDate] = useState('');       // ✅ NEW
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    status: '', Deployed_Category_1_Labour_No_4: '', Deployed_Category_2_Labour_No_4: '',
    Revised_Company_Head_Amount_4: '', Revised_Contractor_Head_Amount_4: '', remark4: ''
  });

  const isNotDeployed = formData.status === 'Not Deployed';

  // ═══════════════════════════════════════════════════════════
  // ✅ UNIVERSAL DATE PARSER
  // Handles both formats:
  //   - "2026-07-23" (YYYY-MM-DD)
  //   - "23/07/2026" (DD/MM/YYYY)
  //   - "23-07-2026" (DD-MM-YYYY)
  // ═══════════════════════════════════════════════════════════
  const parseDMY = (str) => {
    if (!str) return null;
    const clean = str.toString().trim();
    if (!clean) return null;

    // Split by both / and -
    const parts = clean.split(/[/-]/);
    if (parts.length !== 3) return null;

    const [p1, p2, p3] = parts.map(p => parseInt(p, 10));
    if (isNaN(p1) || isNaN(p2) || isNaN(p3)) return null;

    let d, m, y;

    // ✅ YYYY-MM-DD format (e.g., "2026-07-23")
    if (p1 > 1900) {
      y = p1;
      m = p2 - 1;
      d = p3;
    }
    // ✅ DD/MM/YYYY or DD-MM-YYYY format (e.g., "23/07/2026")
    else {
      d = p1;
      m = p2 - 1;
      y = p3;
    }

    const date = new Date(y, m, d);
    return isNaN(date.getTime()) ? null : date;
  };

  // ✅ Combined Filter (Search + Date Range)
  const filteredData = approvalData?.filter(item => {
    // Search filter
    const search = searchTerm.toLowerCase();
    const matchesSearch = !search || (
      item.uid?.toLowerCase().includes(search) ||
      item.projectName?.toLowerCase().includes(search) ||
      item.nameOfContractor?.toLowerCase().includes(search) ||
      item.projectEngineer?.toLowerCase().includes(search) ||
      item.workDescription?.toLowerCase().includes(search) ||
      item.workType?.toLowerCase().includes(search) ||
      item.Labouar_Contractor_Name_3?.toLowerCase().includes(search)
    );

    if (!matchesSearch) return false;

    // ✅ Date filter (on dateRequired field)
    if (fromDate || toDate) {
      const itemDate = parseDMY(item.dateRequired);
      if (!itemDate) return false;

      if (fromDate) {
        const from = new Date(fromDate);
        from.setHours(0, 0, 0, 0);
        if (itemDate < from) return false;
      }

      if (toDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        if (itemDate > to) return false;
      }
    }

    return true;
  }) || [];

  const handleAction = (item) => {
    setSelectedItem(item);
    setFormData({
      status: item.Status_4 || '',
      Deployed_Category_1_Labour_No_4: item.Deployed_Category_1_Labour_No_4 || item.Number_Of_Labour_1_3 || '',
      Deployed_Category_2_Labour_No_4: item.Deployed_Category_2_Labour_No_4 || item.Number_Of_Labour_2_3 || '',
      Revised_Company_Head_Amount_4: item.Revised_Company_Head_Amount_4 || item.Company_Head_Amount_3 || '',
      Revised_Contractor_Head_Amount_4: item.Revised_Contractor_Head_Amount_4 || item.Contractor_Head_Amount_3 || '',
      remark4: item.remark4 || ''
    });
    setShowModal(true);
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      if (field === 'status' && value === 'Not Deployed') {
        newData.Deployed_Category_1_Labour_No_4 = '';
        newData.Deployed_Category_2_Labour_No_4 = '';
        newData.Revised_Company_Head_Amount_4 = '';
        newData.Revised_Contractor_Head_Amount_4 = '';
      }
      if (field === 'status' && value === 'Deployed' && selectedItem) {
        newData.Deployed_Category_1_Labour_No_4 = selectedItem.Number_Of_Labour_1_3 || '';
        newData.Deployed_Category_2_Labour_No_4 = selectedItem.Number_Of_Labour_2_3 || '';
        newData.Revised_Company_Head_Amount_4 = selectedItem.Company_Head_Amount_3 || '';
        newData.Revised_Contractor_Head_Amount_4 = selectedItem.Contractor_Head_Amount_3 || '';
      }
      return newData;
    });
  };

  const resetForm = () => {
    setFormData({
      status: '', Deployed_Category_1_Labour_No_4: '', Deployed_Category_2_Labour_No_4: '',
      Revised_Company_Head_Amount_4: '', Revised_Contractor_Head_Amount_4: '', remark4: ''
    });
  };

  const handleSubmit = async () => {
    if (!selectedItem || !formData.status) { alert('Please select Status'); return; }

    let payload = { uid: selectedItem.uid, status: formData.status, remark4: formData.remark4 || '' };
    if (formData.status !== 'Not Deployed') {
      payload = {
        ...payload,
        Deployed_Category_1_Labour_No_4: formData.Deployed_Category_1_Labour_No_4,
        Deployed_Category_2_Labour_No_4: formData.Deployed_Category_2_Labour_No_4,
        Revised_Company_Head_Amount_4: formData.Revised_Company_Head_Amount_4,
        Revised_Contractor_Head_Amount_4: formData.Revised_Contractor_Head_Amount_4
      };
    }

    try {
      const result = await postApproval(payload).unwrap();
      if (result.success) {
        alert(`✅ Updated! Row: ${result.rowNumber}`);
        setShowModal(false); setSelectedItem(null); resetForm(); refetch();
      } else {
        alert(`❌ Error: ${result.message}`);
      }
    } catch (err) {
      alert(`❌ Error: ${err?.data?.message || err?.error || 'Something went wrong!'}`);
    }
  };

  // ── Loading ──
  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px' }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, boxShadow: `0 0 0 3px ${T.gold}30` }}>
          <Loader2 size={28} color={T.gold} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
        <p style={{ fontSize: 15, fontWeight: 600, color: T.navy }}>Loading Approval Data...</p>
        <p style={{ fontSize: 13, color: T.textMuted }}>Fetching pending records</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  // ── Error ──
  if (isError) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px' }}>
        <AlertCircle size={40} color={T.danger} style={{ marginBottom: 12 }} />
        <p style={{ fontSize: 15, fontWeight: 600, color: T.danger }}>Error Loading Data</p>
        <p style={{ fontSize: 13, color: T.textMuted, marginBottom: 16 }}>{error?.data?.message || 'Failed'}</p>
        <button onClick={refetch} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 8, border: 'none', background: T.danger, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <RotateCcw size={14} /> Retry
        </button>
      </div>
    );
  }

  const tableCols = [
    { label: 'Planned 4', w: 120 }, { label: 'UID', w: 70 }, { label: 'Project', w: 150 },
    { label: 'Engineer', w: 130 }, { label: 'Work Type', w: 100 }, { label: 'Description', w: 200 },
    { label: 'Date Required', w: 120 }, { label: 'Contractor', w: 140 }, { label: 'Firm', w: 130 },
    { label: 'Approved Head', w: 130 }, { label: 'Labour Contr. 3', w: 140 },
    { label: 'Cat 1 (3)', w: 100 }, { label: 'No.1 (3)', w: 60 }, { label: 'Rate 1', w: 70 },
    { label: 'Cat 2 (3)', w: 100 }, { label: 'No.2 (3)', w: 60 }, { label: 'Rate 2', w: 70 },
    { label: 'Total Wages', w: 100 }, { label: 'Conveyance', w: 90 }, { label: 'Commission', w: 90 },
    { label: 'Total Paid', w: 100 }, { label: 'Company Amt', w: 100 }, { label: 'Contractor Amt', w: 110 },
    { label: 'Remark 3', w: 130 }, { label: 'Action', w: 80 },
  ];

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 8px' }}>

      {/* ── Header ── */}
      <div style={{ background: T.card, borderRadius: 10, border: `1px solid ${T.border}`, padding: '14px 18px', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserCheck size={18} color={T.gold} />
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: T.navy, margin: 0 }}>Approval Step 2</h2>
            <p style={{ fontSize: 12, color: T.textMuted, margin: 0 }}>{filteredData.length} pending</p>
          </div>
        </div>
        <button onClick={refetch} disabled={isFetching} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: `1.5px solid ${T.border}`, background: T.card, color: T.textLight, fontSize: 13, cursor: isFetching ? 'not-allowed' : 'pointer' }}>
          <RotateCcw size={14} style={isFetching ? { animation: 'spin 0.8s linear infinite' } : {}} /> Refresh
        </button>
      </div>

      {/* ✅ Search + Date Filters */}
      <div style={{ background: T.card, borderRadius: 10, border: `1px solid ${T.border}`, padding: '12px 16px', marginBottom: 12 }}>
        <div
          className="filter-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr auto auto',
            gap: 10,
            alignItems: 'end',
          }}
        >
          {/* Search */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: T.navyLight, marginBottom: 4 }}>
              <Search size={11} style={{ display: 'inline', marginRight: 4 }} />
              Search
            </label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.textMuted }} />
              <input type="text" placeholder="UID, Project, Contractor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ ...inputBase, paddingLeft: 36 }}
                onFocus={focusGold} onBlur={blurNormal} />
            </div>
          </div>

          {/* From Date */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: T.navyLight, marginBottom: 4 }}>
              <Calendar size={11} style={{ display: 'inline', marginRight: 4 }} />
              From Date
            </label>
            <input type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              max={toDate || undefined}
              style={inputBase}
              onFocus={focusGold} onBlur={blurNormal} />
          </div>

          {/* To Date */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: T.navyLight, marginBottom: 4 }}>
              <Calendar size={11} style={{ display: 'inline', marginRight: 4 }} />
              To Date
            </label>
            <input type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              min={fromDate || undefined}
              style={inputBase}
              onFocus={focusGold} onBlur={blurNormal} />
          </div>

          {/* Clear Filters */}
          {(fromDate || toDate || searchTerm) && (
            <button
              onClick={() => { setSearchTerm(''); setFromDate(''); setToDate(''); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '10px 14px', borderRadius: 8,
                border: `1.5px solid ${T.dangerBorder}`,
                background: T.dangerBg, color: T.danger,
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                height: 40,
              }}
            >
              <X size={14} /> Clear
            </button>
          )}

          {/* Count Badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '10px 14px', background: T.borderLight, borderRadius: 8,
            fontSize: 13, color: T.textLight, fontWeight: 600, whiteSpace: 'nowrap',
            height: 40,
          }}>
            <Filter size={14} />
            <span style={{ color: T.gold, fontWeight: 700 }}>{filteredData.length}</span>
            <span style={{ color: T.textMuted, fontSize: 11 }}>records</span>
          </div>
        </div>

        {/* ✅ Active Filter Chips */}
        {(fromDate || toDate) && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            marginTop: 10, paddingTop: 10,
            borderTop: `1px dashed ${T.border}`,
            flexWrap: 'wrap',
          }}>
            <span style={{ fontSize: 11, color: T.textMuted, fontWeight: 600 }}>
              📅 Date Filter Active:
            </span>
            {fromDate && (
              <span style={{
                background: `${T.gold}15`, color: T.goldDark,
                padding: '3px 10px', borderRadius: 6,
                fontSize: 11, fontWeight: 600,
                display: 'inline-flex', alignItems: 'center', gap: 4,
              }}>
                From: {new Date(fromDate).toLocaleDateString('en-GB')}
                <button onClick={() => setFromDate('')} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: T.goldDark, padding: 0, display: 'flex',
                }}>
                  <X size={11} />
                </button>
              </span>
            )}
            {toDate && (
              <span style={{
                background: `${T.gold}15`, color: T.goldDark,
                padding: '3px 10px', borderRadius: 6,
                fontSize: 11, fontWeight: 600,
                display: 'inline-flex', alignItems: 'center', gap: 4,
              }}>
                To: {new Date(toDate).toLocaleDateString('en-GB')}
                <button onClick={() => setToDate('')} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: T.goldDark, padding: 0, display: 'flex',
                }}>
                  <X size={11} />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Table ── */}
      <div style={{ background: T.card, borderRadius: 10, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
        {filteredData.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px' }}>
            <Package size={40} color={T.border} style={{ marginBottom: 12 }} />
            <p style={{ fontSize: 15, fontWeight: 500, color: T.textLight }}>No records found</p>
            {(fromDate || toDate || searchTerm) && (
              <button
                onClick={() => { setSearchTerm(''); setFromDate(''); setToDate(''); }}
                style={{
                  marginTop: 12, padding: '8px 18px', borderRadius: 8,
                  border: `1.5px solid ${T.gold}`, background: `${T.gold}10`,
                  color: T.goldDark, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <X size={14} /> Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto', maxHeight: '65vh', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                <tr style={{ background: T.navy }}>
                  {tableCols.map((col, i) => (
                    <th key={i} style={{
                      padding: '12px 14px', textAlign: col.label === 'Action' ? 'center' : 'left',
                      color: T.goldLight, fontSize: 11, fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: 0.5,
                      whiteSpace: 'nowrap', minWidth: col.w, borderBottom: `2px solid ${T.gold}`,
                    }}>{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, idx) => (
                  <tr key={item.uid || idx}
                    style={{ background: idx % 2 === 0 ? T.card : T.borderLight }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${T.gold}08`; }}
                    onMouseLeave={e => { e.currentTarget.style.background = idx % 2 === 0 ? T.card : T.borderLight; }}>
                    <Td><span style={{ background: `${T.purple}15`, color: T.purple, padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>{item.planned4 || 'N/A'}</span></Td>
                    <Td><span style={{ background: `${T.navy}15`, color: T.navy, padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>{item.uid}</span></Td>
                    <Td maxW={150} bold>{item.projectName}</Td>
                    <Td maxW={130}>{item.projectEngineer}</Td>
                    <Td><span style={{ background: `${T.gold}15`, color: T.goldDark, padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>{item.workType || 'N/A'}</span></Td>
                    <Td maxW={200}>{item.workDescription}</Td>
                    <Td><span style={{ background: `${T.gold}15`, color: T.goldDark, padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>{item.dateRequired || 'N/A'}</span></Td>
                    <Td maxW={130} bold>{item.nameOfContractor}</Td>
                    <Td maxW={120}>{item.contractorFirmName}</Td>
                    <Td><span style={{ background: `${T.purple}15`, color: T.purple, padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>{item.Approved_Head_2 || 'N/A'}</span></Td>
                    <Td maxW={130} bold>{item.Labouar_Contractor_Name_3}</Td>
                    <Td>{item.Labour_Category_1_3}</Td>
                    <Td center><span style={{ background: `${T.success}15`, color: T.success, padding: '3px 8px', borderRadius: 6, fontWeight: 700 }}>{item.Number_Of_Labour_1_3 || '0'}</span></Td>
                    <Td right>₹{item.Labour_Rate_1_3 || '0'}</Td>
                    <Td>{item.Labour_Category_2_3}</Td>
                    <Td center><span style={{ background: `${T.success}15`, color: T.success, padding: '3px 8px', borderRadius: 6, fontWeight: 700 }}>{item.Number_Of_Labour_2_3 || '0'}</span></Td>
                    <Td right>₹{item.Labour_Rate_2_3 || '0'}</Td>
                    <Td right><span style={{ background: `${T.success}15`, color: T.success, padding: '3px 8px', borderRadius: 6, fontWeight: 700 }}>₹{item.Total_Wages_3 || '0'}</span></Td>
                    <Td right>₹{item.Conveyanance_3 || '0'}</Td>
                    <Td right>₹{item.Contractor_Commission_3 || '0'}</Td>
                    <Td right><span style={{ background: `${T.navy}10`, color: T.navy, padding: '3px 8px', borderRadius: 6, fontWeight: 700 }}>₹{item.Total_Paid_Amount_3 || '0'}</span></Td>
                    <Td right><span style={{ color: T.purple, fontWeight: 700 }}>₹{item.Company_Head_Amount_3 || '0'}</span></Td>
                    <Td right><span style={{ color: T.navy, fontWeight: 700 }}>₹{item.Contractor_Head_Amount_3 || '0'}</span></Td>
                    <Td maxW={120}>{item.remark3}</Td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', borderBottom: `1px solid ${T.border}` }}>
                      <button onClick={() => handleAction(item)} title="Approve"
                        style={{ width: 34, height: 34, borderRadius: 8, border: `1.5px solid ${T.gold}40`, background: `${T.gold}10`, color: T.goldDark, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
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
        )}
      </div>

      {/* ════ MODAL ════ */}
      {showModal && selectedItem && (
        <>
          <div onClick={() => { setShowModal(false); resetForm(); }} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(2px)', zIndex: 100 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '95%', maxWidth: 600, background: T.card, borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', zIndex: 101, display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>

            {/* Header */}
            <div style={{ background: T.navy, padding: '14px 20px', borderBottom: `2px solid ${T.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '14px 14px 0 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: `${T.gold}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserCheck size={16} color={T.gold} />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: 'white', margin: 0 }}>Approval Step 2</h3>
                  <p style={{ fontSize: 11, color: T.textMuted, margin: 0 }}>
                    UID: <span style={{ color: T.gold }}>{selectedItem.uid}</span> | {selectedItem.projectName}
                  </p>
                </div>
              </div>
              <button onClick={() => { setShowModal(false); resetForm(); }} style={{ width: 30, height: 30, borderRadius: 6, border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Step 3 Summary */}
              <div style={{ background: T.successBg, borderRadius: 10, padding: '12px 14px', border: `1px solid ${T.successBorder}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#065f46', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={14} /> Step 3 Summary
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px 12px', fontSize: 12 }}>
                  <div><span style={{ color: T.textMuted }}>Cat 1:</span> <strong>{selectedItem.Labour_Category_1_3 || 'N/A'}</strong></div>
                  <div><span style={{ color: T.textMuted }}>Labour 1:</span> <strong style={{ color: T.success }}>{selectedItem.Number_Of_Labour_1_3 || '0'}</strong></div>
                  <div><span style={{ color: T.textMuted }}>Rate 1:</span> <strong>₹{selectedItem.Labour_Rate_1_3 || '0'}</strong></div>
                  <div><span style={{ color: T.textMuted }}>Cat 2:</span> <strong>{selectedItem.Labour_Category_2_3 || 'N/A'}</strong></div>
                  <div><span style={{ color: T.textMuted }}>Labour 2:</span> <strong style={{ color: T.success }}>{selectedItem.Number_Of_Labour_2_3 || '0'}</strong></div>
                  <div><span style={{ color: T.textMuted }}>Rate 2:</span> <strong>₹{selectedItem.Labour_Rate_2_3 || '0'}</strong></div>
                  <div><span style={{ color: T.textMuted }}>Total Wages:</span> <strong style={{ color: T.success }}>₹{selectedItem.Total_Wages_3 || '0'}</strong></div>
                  <div><span style={{ color: T.textMuted }}>Total Paid:</span> <strong style={{ color: T.navy }}>₹{selectedItem.Total_Paid_Amount_3 || '0'}</strong></div>
                  <div><span style={{ color: T.textMuted }}>Contractor:</span> <strong>{selectedItem.Labouar_Contractor_Name_3 || 'N/A'}</strong></div>
                </div>
              </div>

              {/* Amount Reference */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ background: `${T.purple}10`, padding: 12, borderRadius: 8, border: `1px solid ${T.purple}30` }}>
                  <span style={{ fontSize: 11, color: T.purple }}>🏢 Company Head Amount</span>
                  <p style={{ fontSize: 18, fontWeight: 800, color: T.purple, margin: '4px 0 0' }}>₹{selectedItem.Company_Head_Amount_3 || '0'}</p>
                </div>
                <div style={{ background: `${T.navy}10`, padding: 12, borderRadius: 8, border: `1px solid ${T.navy}30` }}>
                  <span style={{ fontSize: 11, color: T.navy }}>👷 Contractor Head Amount</span>
                  <p style={{ fontSize: 18, fontWeight: 800, color: T.navy, margin: '4px 0 0' }}>₹{selectedItem.Contractor_Head_Amount_3 || '0'}</p>
                </div>
              </div>

              {/* Status */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>
                  Status <span style={{ color: T.danger }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <select value={formData.status} onChange={(e) => handleFormChange('status', e.target.value)}
                    style={{ ...inputBase, paddingRight: 32, appearance: 'none', cursor: 'pointer' }}
                    onFocus={focusGold} onBlur={blurNormal}>
                    <option value="">-- Select --</option>
                    <option value="Deployed">✅ Deployed</option>
                    <option value="Not Deployed">❌ Not Deployed</option>
                  </select>
                  <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: T.textMuted, pointerEvents: 'none' }} />
                </div>
              </div>

              {/* Not Deployed Info */}
              {isNotDeployed && (
                <div style={{ padding: '12px 14px', background: T.dangerBg, border: `1px solid ${T.dangerBorder}`, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <XCircle size={18} color={T.danger} />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: T.danger, margin: 0 }}>Not Deployed</p>
                    <p style={{ fontSize: 11, color: T.danger, margin: '2px 0 0' }}>Add optional remark and submit.</p>
                  </div>
                </div>
              )}

              {/* Deployed Fields */}
              {!isNotDeployed && (
                <>
                  {/* Labour Numbers */}
                  <div style={{ padding: '14px', background: `${T.gold}08`, borderRadius: 10, border: `1px dashed ${T.gold}50` }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: T.goldDark, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Users size={14} /> Deployed Labour (Editable)
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, color: T.navyLight, marginBottom: 4 }}>Category 1 Labour No.</label>
                        <input type="number" value={formData.Deployed_Category_1_Labour_No_4}
                          onChange={(e) => handleFormChange('Deployed_Category_1_Labour_No_4', e.target.value)}
                          placeholder="0" style={inputBase} onFocus={focusGold} onBlur={blurNormal} />
                        <p style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>Original: {selectedItem.Number_Of_Labour_1_3 || '0'}</p>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, color: T.navyLight, marginBottom: 4 }}>Category 2 Labour No.</label>
                        <input type="number" value={formData.Deployed_Category_2_Labour_No_4}
                          onChange={(e) => handleFormChange('Deployed_Category_2_Labour_No_4', e.target.value)}
                          placeholder="0" style={inputBase} onFocus={focusGold} onBlur={blurNormal} />
                        <p style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>Original: {selectedItem.Number_Of_Labour_2_3 || '0'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Revised Amounts */}
                  <div style={{ padding: '14px', background: `${T.purple}08`, borderRadius: 10, border: `1px dashed ${T.purple}40` }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: T.purple, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <IndianRupee size={14} /> Revised Amounts (Editable)
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, color: T.navyLight, marginBottom: 4 }}>🏢 Company Head (₹)</label>
                        <input type="number" value={formData.Revised_Company_Head_Amount_4}
                          onChange={(e) => handleFormChange('Revised_Company_Head_Amount_4', e.target.value)}
                          placeholder="0" style={inputBase} onFocus={focusGold} onBlur={blurNormal} />
                        <p style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>Original: ₹{selectedItem.Company_Head_Amount_3 || '0'}</p>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, color: T.navyLight, marginBottom: 4 }}>👷 Contractor Head (₹)</label>
                        <input type="number" value={formData.Revised_Contractor_Head_Amount_4}
                          onChange={(e) => handleFormChange('Revised_Contractor_Head_Amount_4', e.target.value)}
                          placeholder="0" style={inputBase} onFocus={focusGold} onBlur={blurNormal} />
                        <p style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>Original: ₹{selectedItem.Contractor_Head_Amount_3 || '0'}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Remark */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>
                  Remark <span style={{ fontSize: 10, color: T.textMuted }}>(Optional)</span>
                </label>
                <textarea value={formData.remark4} onChange={(e) => handleFormChange('remark4', e.target.value)}
                  rows={3} placeholder={isNotDeployed ? "Reason for not deploying..." : "Enter remarks..."}
                  style={{ ...inputBase, resize: 'vertical', minHeight: 70 }}
                  onFocus={focusGold} onBlur={blurNormal} />
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '14px 20px', borderTop: `1px solid ${T.border}`, background: T.borderLight, display: 'flex', justifyContent: 'flex-end', gap: 10, borderRadius: '0 0 14px 14px' }}>
              <button onClick={() => { setShowModal(false); resetForm(); }} style={{
                padding: '10px 20px', borderRadius: 8, border: `1.5px solid ${T.border}`,
                background: T.card, color: T.textLight, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>Cancel</button>

              <button onClick={handleSubmit} disabled={isSubmitting || !formData.status}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '10px 24px', borderRadius: 8, border: 'none',
                  background: isSubmitting || !formData.status ? T.border
                    : isNotDeployed ? `linear-gradient(135deg, ${T.danger}, #dc2626)`
                    : `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
                  color: isSubmitting || !formData.status ? T.textMuted
                    : isNotDeployed ? 'white' : T.navyDark,
                  fontSize: 13, fontWeight: 700,
                  cursor: isSubmitting || !formData.status ? 'not-allowed' : 'pointer',
                  boxShadow: isSubmitting || !formData.status ? 'none'
                    : isNotDeployed ? `0 2px 8px ${T.danger}40` : `0 2px 8px ${T.gold}40`,
                }}>
                {isSubmitting ? (
                  <><Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> Submitting...</>
                ) : isNotDeployed ? (
                  <><XCircle size={15} /> Not Deployed</>
                ) : (
                  <><Send size={15} /> Submit</>
                )}
              </button>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 900px) {
          .filter-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }

        @media (max-width: 600px) {
          .filter-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Approvel2;