




import React, { useState, useMemo, useEffect } from 'react';
import {
  useGetSiteApprovalQuery, usePostSiteApprovalMutation
} from '../../redux/SiteExpenses/SiteExpensesSlice';
import { useGetProjectDropdownQuery } from '../../redux/Labour/LabourSlice';
import {
  CheckCircle, Loader2, RefreshCw, User, FileText, Building, AlertCircle,
  Search, Filter, X, Clock, Hash, Pencil, ChevronDown, UserCircle, Building2,
  IndianRupee, Receipt, Briefcase, ExternalLink, RotateCcw, Package
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

const Td = ({ children, right, maxW, center, bold }) => (
  <td style={{ padding: '10px 14px', fontSize: 13, color: T.text, borderBottom: `1px solid ${T.border}`, whiteSpace: 'nowrap', textAlign: right ? 'right' : center ? 'center' : 'left', fontWeight: bold ? 600 : 400 }}>
    {maxW ? <span title={typeof children === 'string' ? children : ''} style={{ display: 'block', maxWidth: maxW, overflow: 'hidden', textOverflow: 'ellipsis' }}>{children || <span style={{ color: T.textMuted }}>—</span>}</span>
      : (children || <span style={{ color: T.textMuted }}>—</span>)}
  </td>
);

const SiteApprovel = () => {
  const { data = [], isLoading, isError, refetch, isFetching } = useGetSiteApprovalQuery();
  const [postSiteApproval, { isLoading: isSubmitting }] = usePostSiteApprovalMutation();
  const { data: contractorDropdownData = [], isLoading: isLoadingContractors } = useGetProjectDropdownQuery();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [selectedRow, setSelectedRow] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    status: '', Approve_Amount: '', Confirm_Head: '',
    Name_Of_Contractor: '', Contractor_Firm_Name: '', remark: '',
  });

  const isContractorHead = formData.Confirm_Head === 'Contractor Head';

  const projectNames = useMemo(() => [...new Set(data.map(i => i.projectName).filter(Boolean))].sort(), [data]);

  const filteredData = useMemo(() => data.filter(item => {
    const s = searchTerm.toLowerCase();
    const match = !s || [item.payeeName, item.uid, item.RccBillNo, item.ContractorName, item.detailsOfWork].some(v => (v || '').toLowerCase().includes(s));
    return match && (!filterProject || item.projectName === filterProject);
  }), [data, searchTerm, filterProject]);

  const handleOpenModal = (row) => {
    setSelectedRow(row);
    setFormData({ status: '', Approve_Amount: row.costAmount || '', Confirm_Head: '', Name_Of_Contractor: '', Contractor_Firm_Name: '', remark: '' });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false); setSelectedRow(null);
    setFormData({ status: '', Approve_Amount: '', Confirm_Head: '', Name_Of_Contractor: '', Contractor_Firm_Name: '', remark: '' });
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => {
      const n = { ...prev, [field]: value };
      if (field === 'Confirm_Head' && value !== 'Contractor Head') { n.Name_Of_Contractor = ''; n.Contractor_Firm_Name = ''; }
      return n;
    });
  };

  const handleContractorSelect = (name) => {
    const c = contractorDropdownData.find(i => i.contractorName === name);
    setFormData(prev => ({ ...prev, Name_Of_Contractor: name, Contractor_Firm_Name: c?.contractorFirmName || '' }));
  };

  const openInNewTab = (url) => { if (!url) return alert('No URL'); window.open(url, '_blank', 'noopener,noreferrer'); };

  const handleSubmit = async (statusValue) => {
    if (!selectedRow) return;
    const fd = { ...formData, status: statusValue };
    if (!fd.Approve_Amount) return alert('Enter Approve Amount');
    if (!fd.Confirm_Head) return alert('Select Confirm Head');
    if (fd.Confirm_Head === 'Contractor Head' && (!fd.Name_Of_Contractor.trim() || !fd.Contractor_Firm_Name.trim())) return alert('Contractor details required');

    try {
      const payload = { uid: selectedRow.uid, status: statusValue, Approve_Amount: fd.Approve_Amount, Confirm_Head: fd.Confirm_Head, remark: fd.remark };
      if (fd.Confirm_Head === 'Contractor Head') { payload.Name_Of_Contractor = fd.Name_Of_Contractor; payload.Contractor_Firm_Name = fd.Contractor_Firm_Name; }
      await postSiteApproval(payload).unwrap();
      alert(`✅ ${statusValue}!`); handleCloseModal(); refetch();
    } catch (err) { alert('❌ Error: ' + (err?.data?.message || 'Failed')); }
  };

  const formatCurrency = (val) => { if (!val) return '—'; const n = parseFloat(val); return isNaN(n) ? val : '₹' + n.toLocaleString('en-IN'); };

  if (isLoading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px' }}>
      <div style={{ width: 56, height: 56, borderRadius: 14, background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, boxShadow: `0 0 0 3px ${T.gold}30` }}>
        <Loader2 size={28} color={T.gold} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
      <p style={{ fontSize: 15, fontWeight: 600, color: T.navy }}>Loading Site Approvals...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (isError) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px' }}>
      <AlertCircle size={40} color={T.danger} style={{ marginBottom: 12 }} />
      <p style={{ fontSize: 15, fontWeight: 600, color: T.danger }}>Failed to load data</p>
      <button onClick={refetch} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 8, border: 'none', background: T.danger, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 12 }}><RotateCcw size={14} /> Retry</button>
    </div>
  );

  const tableCols = [
    { label: '#', w: 40 }, { label: 'RCC Bill No', w: 100 }, { label: 'Payee', w: 140 },
    { label: 'Project', w: 150 }, { label: 'Engineer', w: 130 }, { label: 'Head Type', w: 110 },
    { label: 'Details', w: 200 }, { label: 'Amount', w: 100 }, { label: 'Bill No', w: 90 },
    { label: 'Bill Date', w: 100 }, { label: 'Exp Head', w: 100 }, { label: 'Contractor', w: 140 },
    { label: 'Firm', w: 130 }, { label: 'Photo', w: 80 }, { label: 'Action', w: 80 },
  ];

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 8px' }}>

      {/* Header */}
      <div style={{ background: T.card, borderRadius: 10, border: `1px solid ${T.border}`, padding: '14px 18px', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Receipt size={18} color={T.gold} />
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: T.navy, margin: 0 }}>Site Approval</h2>
            <p style={{ fontSize: 12, color: T.textMuted, margin: 0 }}>{filteredData.length} pending approvals</p>
          </div>
        </div>
        <button onClick={refetch} disabled={isFetching} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: `1.5px solid ${T.border}`, background: T.card, color: T.textLight, fontSize: 13, cursor: isFetching ? 'not-allowed' : 'pointer' }}>
          <RotateCcw size={14} style={isFetching ? { animation: 'spin 0.8s linear infinite' } : {}} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 12 }}>
        <div style={{ background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`, borderRadius: 10, padding: 14, color: 'white' }}>
          <p style={{ fontSize: 10, color: T.textMuted, textTransform: 'uppercase', margin: 0 }}>Total Pending</p>
          <p style={{ fontSize: 22, fontWeight: 800, margin: '4px 0 0', color: T.gold }}>{data.length}</p>
        </div>
        <div style={{ background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`, borderRadius: 10, padding: 14, color: T.navyDark }}>
          <p style={{ fontSize: 10, textTransform: 'uppercase', margin: 0, opacity: 0.7 }}>Filtered</p>
          <p style={{ fontSize: 22, fontWeight: 800, margin: '4px 0 0' }}>{filteredData.length}</p>
        </div>
        <div style={{ background: `linear-gradient(135deg, ${T.success}, #059669)`, borderRadius: 10, padding: 14, color: 'white' }}>
          <p style={{ fontSize: 10, textTransform: 'uppercase', margin: 0, opacity: 0.7 }}>Total Amount</p>
          <p style={{ fontSize: 22, fontWeight: 800, margin: '4px 0 0' }}>{formatCurrency(filteredData.reduce((s, i) => s + (parseFloat(i.costAmount) || 0), 0))}</p>
        </div>
      </div>

      {/* Search */}
      <div style={{ background: T.card, borderRadius: 10, border: `1px solid ${T.border}`, padding: '12px 16px', marginBottom: 12, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.textMuted }} />
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search..."
            style={{ ...inputBase, paddingLeft: 36 }} onFocus={focusGold} onBlur={blurNormal} />
        </div>
        <div style={{ position: 'relative', minWidth: 180 }}>
          <select value={filterProject} onChange={e => setFilterProject(e.target.value)}
            style={{ ...inputBase, paddingRight: 32, appearance: 'none', cursor: 'pointer' }} onFocus={focusGold} onBlur={blurNormal}>
            <option value="">All Projects</option>
            {projectNames.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: T.textMuted, pointerEvents: 'none' }} />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: T.card, borderRadius: 10, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
        {filteredData.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px' }}>
            <Package size={40} color={T.border} style={{ marginBottom: 12 }} />
            <p style={{ fontSize: 15, color: T.textLight }}>No pending approvals</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', maxHeight: '65vh', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                <tr style={{ background: T.navy }}>
                  {tableCols.map((col, i) => (
                    <th key={i} style={{ padding: '12px 14px', textAlign: col.label === 'Amount' ? 'right' : col.label === 'Photo' || col.label === 'Action' ? 'center' : 'left', color: T.goldLight, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap', minWidth: col.w, borderBottom: `2px solid ${T.gold}` }}>{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, idx) => (
                  <tr key={row.uid || idx}
                    style={{ background: idx % 2 === 0 ? T.card : T.borderLight }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${T.gold}08`; }}
                    onMouseLeave={e => { e.currentTarget.style.background = idx % 2 === 0 ? T.card : T.borderLight; }}>
                    <Td><span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: 6, background: T.borderLight, fontSize: 12, fontWeight: 600, color: T.textLight }}>{idx + 1}</span></Td>
                    <Td><span style={{ background: `${T.navy}15`, color: T.navy, padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>{row.RccBillNo || '—'}</span></Td>
                    <Td maxW={130} bold>{row.payeeName}</Td>
                    <Td><span style={{ background: `${T.gold}15`, color: T.goldDark, padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>{row.projectName || '—'}</span></Td>
                    <Td maxW={120}>{row.projectEngineerName}</Td>
                    <Td><span style={{ background: `${T.purple}15`, color: T.purple, padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>{row.headType || '—'}</span></Td>
                    <Td maxW={200}>{row.detailsOfWork}</Td>
                    <Td right bold><span style={{ color: T.success, fontWeight: 700 }}>{row.costAmount}</span></Td>
                    <Td>{row.BillNO}</Td>
                    <Td>{row.BillDate}</Td>
                    <Td>{row.EXPHead}</Td>
                    <Td maxW={130}>{row.ContractorName}</Td>
                    <Td maxW={120}>{row.ContractorFirmName}</Td>
                    <td style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}`, textAlign: 'center' }}>
                      {row.billPhoto ? (
                        <button onClick={() => openInNewTab(row.billPhoto)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, background: T.navy, color: T.gold, fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer', textDecoration: 'none' }}>
                          <ExternalLink size={12} /> View
                        </button>
                      ) : <span style={{ color: T.textMuted }}>—</span>}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', borderBottom: `1px solid ${T.border}` }}>
                      <button onClick={() => handleOpenModal(row)} title="Review"
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
      {modalOpen && selectedRow && (
        <>
          <div onClick={handleCloseModal} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(2px)', zIndex: 100 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '95%', maxWidth: 500, background: T.card, borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', zIndex: 101, display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>

            {/* Header */}
            <div style={{ background: T.navy, padding: '14px 20px', borderBottom: `2px solid ${T.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '14px 14px 0 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: `${T.gold}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Pencil size={16} color={T.gold} />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: 'white', margin: 0 }}>Review Approval</h3>
                  <p style={{ fontSize: 11, color: T.textMuted, margin: 0 }}>UID: <span style={{ color: T.gold }}>{selectedRow.uid}</span></p>
                </div>
              </div>
              <button onClick={handleCloseModal} style={{ width: 30, height: 30, borderRadius: 6, border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Info */}
              <div style={{ background: T.borderLight, borderRadius: 10, padding: '12px 14px', border: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.navy, marginBottom: 8, textTransform: 'uppercase' }}>Request Details</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px', fontSize: 12 }}>
                  <div><span style={{ color: T.textMuted }}>Payee:</span> <strong>{selectedRow.payeeName}</strong></div>
                  <div><span style={{ color: T.textMuted }}>Project:</span> <strong>{selectedRow.projectName}</strong></div>
                  <div><span style={{ color: T.textMuted }}>Head:</span> <strong>{selectedRow.headType}</strong></div>
                  <div><span style={{ color: T.textMuted }}>Contractor:</span> <strong>{selectedRow.ContractorName}</strong></div>
                  <div><span style={{ color: T.textMuted }}>Bill No:</span> <strong>{selectedRow.BillNO}</strong></div>
                  <div><span style={{ color: T.textMuted }}>Amount:</span> <strong style={{ color: T.success }}>{selectedRow.costAmount}</strong></div>
                </div>
                {selectedRow.billPhoto && (
                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: T.textMuted }}>Bill Photo</span>
                    <button onClick={() => openInNewTab(selectedRow.billPhoto)} style={{ fontSize: 11, color: T.navy, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><ExternalLink size={12} /> View</button>
                  </div>
                )}
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${T.border}` }}>
                  <span style={{ fontSize: 11, color: T.textMuted }}>Details:</span>
                  <p style={{ fontSize: 12, color: T.text, margin: '2px 0 0' }}>{selectedRow.detailsOfWork || 'N/A'}</p>
                </div>
              </div>

              {/* Approve Amount */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>
                  <IndianRupee size={14} /> Approve Amount <span style={{ color: T.danger }}>*</span>
                </label>
                <input type="number" value={formData.Approve_Amount} onChange={e => handleFormChange('Approve_Amount', e.target.value)}
                  placeholder="Enter amount" style={inputBase} onFocus={focusGold} onBlur={blurNormal} />
              </div>

              {/* Confirm Head */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>
                  <Briefcase size={14} /> Confirm Head <span style={{ color: T.danger }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <select value={formData.Confirm_Head} onChange={e => handleFormChange('Confirm_Head', e.target.value)}
                    style={{ ...inputBase, paddingRight: 32, appearance: 'none', cursor: 'pointer' }} onFocus={focusGold} onBlur={blurNormal}>
                    <option value="">-- Select --</option>
                    <option value="Company Head">🏢 Company Head</option>
                    <option value="Contractor Head">👷 Contractor Head</option>
                  </select>
                  <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: T.textMuted, pointerEvents: 'none' }} />
                </div>
              </div>

              {/* Contractor */}
              {isContractorHead && (
                <div style={{ padding: 14, background: `${T.gold}08`, borderRadius: 10, border: `1px dashed ${T.gold}50` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                    <UserCircle size={16} color={T.goldDark} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: T.goldDark }}>Contractor Details</span>
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>
                      Contractor Name <span style={{ color: T.danger }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <select value={formData.Name_Of_Contractor} onChange={e => handleContractorSelect(e.target.value)}
                        disabled={isLoadingContractors}
                        style={{ ...inputBase, paddingRight: 32, appearance: 'none', cursor: isLoadingContractors ? 'not-allowed' : 'pointer' }}
                        onFocus={focusGold} onBlur={blurNormal}>
                        <option value="">{isLoadingContractors ? 'Loading...' : '-- Select --'}</option>
                        {contractorDropdownData.map((c, i) => <option key={i} value={c.contractorName}>{c.contractorName}</option>)}
                      </select>
                      <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: T.textMuted, pointerEvents: 'none' }} />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>
                      Firm Name <span style={{ color: T.danger }}>*</span> <span style={{ fontSize: 10, color: T.success, marginLeft: 6 }}>Auto-filled</span>
                    </label>
                    <input type="text" value={formData.Contractor_Firm_Name} readOnly placeholder="Select contractor..."
                      style={{ ...inputBase, background: T.borderLight, cursor: 'not-allowed' }} />
                  </div>
                </div>
              )}

              {/* Remark */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>
                  Remark <span style={{ fontSize: 10, color: T.textMuted }}>(Optional)</span>
                </label>
                <textarea value={formData.remark} onChange={e => handleFormChange('remark', e.target.value)}
                  rows={3} placeholder="Enter remark..."
                  style={{ ...inputBase, resize: 'vertical', minHeight: 70 }} onFocus={focusGold} onBlur={blurNormal} />
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '14px 20px', borderTop: `1px solid ${T.border}`, background: T.borderLight, display: 'flex', gap: 10, borderRadius: '0 0 14px 14px' }}>
              <button onClick={handleCloseModal} disabled={isSubmitting} style={{
                flex: 1, padding: '10px', borderRadius: 8, border: `1.5px solid ${T.border}`,
                background: T.card, color: T.textLight, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>Cancel</button>

              <button onClick={() => handleSubmit('Rejected')}
                disabled={isSubmitting || !formData.Approve_Amount || !formData.Confirm_Head || (isContractorHead && (!formData.Name_Of_Contractor || !formData.Contractor_Firm_Name))}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '10px', borderRadius: 8, border: 'none',
                  background: isSubmitting ? T.border : `linear-gradient(135deg, ${T.danger}, #dc2626)`,
                  color: isSubmitting ? T.textMuted : 'white',
                  fontSize: 13, fontWeight: 700, cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: (!formData.Approve_Amount || !formData.Confirm_Head) ? 0.5 : 1,
                }}>
                {isSubmitting ? <Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> : <X size={15} />} Reject
              </button>

              <button onClick={() => handleSubmit('Approved')}
                disabled={isSubmitting || !formData.Approve_Amount || !formData.Confirm_Head || (isContractorHead && (!formData.Name_Of_Contractor || !formData.Contractor_Firm_Name))}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '10px', borderRadius: 8, border: 'none',
                  background: isSubmitting ? T.border : `linear-gradient(135deg, ${T.success}, #059669)`,
                  color: isSubmitting ? T.textMuted : 'white',
                  fontSize: 13, fontWeight: 700, cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: (!formData.Approve_Amount || !formData.Confirm_Head) ? 0.5 : 1,
                }}>
                {isSubmitting ? <Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> : <CheckCircle size={15} />} Approve
              </button>
            </div>
          </div>
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default SiteApprovel;