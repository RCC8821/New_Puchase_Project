



import React, { useState, useEffect } from 'react';
import {
  useGetLabourApproveQuery,
  usePostLabourApproval1Mutation,
  useGetProjectDropdownQuery
} from '../../redux/Labour/LabourSlice';
import {
  CheckCircle, XCircle, Loader2, RefreshCw, User, Calendar, Users,
  FileText, Building, AlertCircle, Search, Filter, Eye, Check, X,
  Wrench, Clock, Hash, Pencil, Send, ChevronDown, UserCircle, Building2,
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

const Approvel1 = () => {
  const {
    data: labourData, isLoading, isError, error, refetch, isFetching
  } = useGetLabourApproveQuery();

  const [postLabourApproval, { isLoading: isApproving }] = usePostLabourApproval1Mutation();

  const {
    data: contractorDropdownData = [], isLoading: isLoadingContractors
  } = useGetProjectDropdownQuery();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState('');

  const [formData, setFormData] = useState({
    Status_2: '', Approved_Head_2: '', Name_Of_Contractor_2: '',
    Contractor_Firm_Name_2: '', Remark_2: ''
  });

  const isRejected = formData.Status_2 === 'Reject';
  const isContractorHead = formData.Approved_Head_2 === 'Contractor Head' && !isRejected;

  const filteredData = labourData?.filter(item =>
    item.uid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.nameOfContractor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.projectEngineer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.workDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.workType?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleAction = (item, action) => {
    setSelectedItem(item);
    setActionType(action);
    setFormData({
      Status_2: '', Approved_Head_2: '', Name_Of_Contractor_2: '',
      Contractor_Firm_Name_2: '', Remark_2: ''
    });
    setShowModal(true);
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      if (field === 'Status_2' && value === 'Reject') {
        newData.Approved_Head_2 = '';
        newData.Name_Of_Contractor_2 = '';
        newData.Contractor_Firm_Name_2 = '';
      }
      if (field === 'Approved_Head_2' && value !== 'Contractor Head') {
        newData.Name_Of_Contractor_2 = '';
        newData.Contractor_Firm_Name_2 = '';
      }
      return newData;
    });
  };

  const handleContractorSelect = (contractorName) => {
    const selectedContractor = contractorDropdownData.find(
      item => item.contractorName === contractorName
    );
    setFormData(prev => ({
      ...prev,
      Name_Of_Contractor_2: contractorName,
      Contractor_Firm_Name_2: selectedContractor?.contractorFirmName || ''
    }));
  };

  const validateForm = () => {
    if (!formData.Status_2) { alert('Please select Status'); return false; }
    if (formData.Status_2 === 'Reject') return true;
    if (!formData.Approved_Head_2) { alert('Please select Approved Head'); return false; }
    if (formData.Approved_Head_2 === 'Contractor Head') {
      if (!formData.Name_Of_Contractor_2.trim()) { alert('Please select Contractor'); return false; }
      if (!formData.Contractor_Firm_Name_2.trim()) { alert('Contractor Firm required'); return false; }
    }
    return true;
  };

  const isSubmitDisabled = () => {
    if (!formData.Status_2) return true;
    if (formData.Status_2 === 'Reject') return false;
    if (!formData.Approved_Head_2) return true;
    if (formData.Approved_Head_2 === 'Contractor Head') {
      if (!formData.Name_Of_Contractor_2.trim() || !formData.Contractor_Firm_Name_2.trim()) return true;
    }
    return false;
  };

  const handleSubmit = async () => {
    if (!selectedItem) return;
    if (!validateForm()) return;

    const payload = {
      uid: selectedItem.uid,
      Status_2: formData.Status_2,
      Remark_2: formData.Remark_2 || '',
    };

    if (formData.Status_2 !== 'Reject') {
      payload.Approved_Head_2 = formData.Approved_Head_2;
      if (formData.Approved_Head_2 === 'Contractor Head') {
        payload.Name_Of_Contractor_2 = formData.Name_Of_Contractor_2;
        payload.Contractor_Firm_Name_2 = formData.Contractor_Firm_Name_2;
      }
    }

    try {
      const result = await postLabourApproval(payload).unwrap();
      if (result.success) {
        alert(`✅ Successfully Updated! Row: ${result.rowNumber}`);
        setShowModal(false);
        refetch();
      } else {
        alert(`Error: ${result.message || 'Unknown error'}`);
      }
    } catch (err) {
      alert(`❌ Error: ${err?.data?.message || err?.error || 'Something went wrong!'}`);
    }
  };

  // ── Loading Screen ──
  if (isLoading) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '80px 20px',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14,
          background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20, boxShadow: `0 0 0 3px ${T.gold}30`,
        }}>
          <Loader2 size={28} color={T.gold} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
        <p style={{ fontSize: 15, fontWeight: 600, color: T.navy }}>Loading Labour Data...</p>
        <p style={{ fontSize: 13, color: T.textMuted }}>Fetching pending approvals</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  // ── Error Screen ──
  if (isError) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '60px 20px',
      }}>
        <AlertCircle size={40} color={T.danger} style={{ marginBottom: 12 }} />
        <p style={{ fontSize: 15, fontWeight: 600, color: T.danger }}>Error Loading Data</p>
        <p style={{ fontSize: 13, color: T.textMuted, marginBottom: 16 }}>{error?.data?.message || 'Failed to fetch'}</p>
        <button onClick={refetch} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 18px', borderRadius: 8, border: 'none',
          background: T.danger, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>
          <RotateCcw size={14} /> Retry
        </button>
      </div>
    );
  }

  // ── Table columns ──
  const tableCols = [
    { label: 'Planned', w: 120 }, { label: 'UID', w: 70 },
    { label: 'Project', w: 150 }, { label: 'Engineer', w: 130 },
    { label: 'Work Type', w: 100 }, { label: 'Description', w: 200 },
    { label: 'Labour Cat 1', w: 110 }, { label: 'No. 1', w: 60 },
    { label: 'Labour Cat 2', w: 110 }, { label: 'No. 2', w: 60 },
    { label: 'Total', w: 60 }, { label: 'Date Required', w: 120 },
    { label: 'Head', w: 120 }, { label: 'Contractor', w: 140 },
    { label: 'Firm', w: 130 }, { label: 'Remark', w: 130 },
    { label: 'Action', w: 80 },
  ];

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 8px' }}>

      {/* ── Header ── */}
      <div style={{
        background: T.card, borderRadius: 10, border: `1px solid ${T.border}`,
        padding: '14px 18px', marginBottom: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Users size={18} color={T.gold} />
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: T.navy, margin: 0 }}>Labour Approval</h2>
            <p style={{ fontSize: 12, color: T.textMuted, margin: 0 }}>
              {filteredData.length} pending approvals
            </p>
          </div>
        </div>
        <button onClick={refetch} disabled={isFetching} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8,
          border: `1.5px solid ${T.border}`, background: T.card,
          color: T.textLight, fontSize: 13, cursor: isFetching ? 'not-allowed' : 'pointer',
        }}>
          <RotateCcw size={14} style={isFetching ? { animation: 'spin 0.8s linear infinite' } : {}} />
          Refresh
        </button>
      </div>

      {/* ── Search ── */}
      <div style={{
        background: T.card, borderRadius: 10, border: `1px solid ${T.border}`,
        padding: '12px 16px', marginBottom: 12,
        display: 'flex', gap: 12, alignItems: 'center',
      }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.textMuted }} />
          <input
            type="text" placeholder="Search by UID, project, contractor, engineer, work..."
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            style={{ ...inputBase, paddingLeft: 36 }}
            onFocus={focusGold} onBlur={blurNormal}
          />
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 14px', background: T.borderLight, borderRadius: 8,
          fontSize: 13, color: T.textLight, fontWeight: 600, whiteSpace: 'nowrap',
        }}>
          <Filter size={14} />
          Total: <span style={{ color: T.gold, fontWeight: 700 }}>{filteredData.length}</span>
        </div>
      </div>

      {/* ── Table ── */}
      <div style={{
        background: T.card, borderRadius: 10,
        border: `1px solid ${T.border}`, overflow: 'hidden',
      }}>
        {filteredData.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px' }}>
            <Package size={40} color={T.border} style={{ marginBottom: 12 }} />
            <p style={{ fontSize: 15, fontWeight: 500, color: T.textLight }}>No pending approvals</p>
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
                      whiteSpace: 'nowrap', minWidth: col.w,
                      borderBottom: `2px solid ${T.gold}`,
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

                    {/* Planned */}
                    <Td>
                      <span style={{ background: `${T.purple}15`, color: T.purple, padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
                        {item.planned2 || 'N/A'}
                      </span>
                    </Td>

                    {/* UID */}
                    <Td>
                      <span style={{ background: `${T.navy}15`, color: T.navy, padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
                        {item.uid || 'N/A'}
                      </span>
                    </Td>

                    {/* Project */}
                    <Td maxW={150} bold>{item.projectName}</Td>

                    {/* Engineer */}
                    <Td maxW={130}>{item.projectEngineer}</Td>

                    {/* Work Type */}
                    <Td>
                      <span style={{ background: `${T.gold}15`, color: T.goldDark, padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
                        {item.workType || 'N/A'}
                      </span>
                    </Td>

                    {/* Description */}
                    <Td maxW={200}>{item.workDescription}</Td>

                    {/* Labour Cat 1 */}
                    <Td>{item.labourCategory1}</Td>

                    {/* No 1 */}
                    <Td center>
                      <span style={{ background: `${T.navy}10`, color: T.navy, padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
                        {item.numberOfLabour1 || '0'}
                      </span>
                    </Td>

                    {/* Labour Cat 2 */}
                    <Td>{item.labourCategory2}</Td>

                    {/* No 2 */}
                    <Td center>
                      <span style={{ background: `${T.navy}10`, color: T.navy, padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
                        {item.numberOfLabour2 || '0'}
                      </span>
                    </Td>

                    {/* Total */}
                    <Td center>
                      <span style={{
                        background: `${T.success}15`, color: T.success,
                        padding: '3px 10px', borderRadius: 6, fontSize: 13, fontWeight: 800,
                      }}>
                        {item.totalLabour || '0'}
                      </span>
                    </Td>

                    {/* Date Required */}
                    <Td>
                      <span style={{ background: `${T.gold}15`, color: T.goldDark, padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
                        {item.dateRequired || 'N/A'}
                      </span>
                    </Td>

                    {/* Head */}
                    <Td>{item.headOfContractor}</Td>

                    {/* Contractor */}
                    <Td maxW={130} bold>{item.nameOfContractor}</Td>

                    {/* Firm */}
                    <Td maxW={120}>{item.contractorFirmName}</Td>

                    {/* Remark */}
                    <Td maxW={120}>{item.remark}</Td>

                    {/* Action */}
                    <td style={{ padding: '10px 14px', textAlign: 'center', borderBottom: `1px solid ${T.border}` }}>
                      <button onClick={() => handleAction(item, 'edit')} title="Take Action"
                        style={{
                          width: 34, height: 34, borderRadius: 8,
                          border: `1.5px solid ${T.gold}40`, background: `${T.gold}10`,
                          color: T.goldDark, cursor: 'pointer',
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.2s',
                        }}
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
      {showModal && selectedItem && actionType === 'edit' && (
        <>
          <div onClick={() => setShowModal(false)} style={{
            position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)',
            backdropFilter: 'blur(2px)', zIndex: 100,
          }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '95%', maxWidth: 500,
            background: T.card, borderRadius: 14,
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            zIndex: 101, display: 'flex', flexDirection: 'column',
            maxHeight: '90vh',
          }}>
            {/* Modal Header */}
            <div style={{
              background: T.navy, padding: '14px 20px',
              borderBottom: `2px solid ${T.gold}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderRadius: '14px 14px 0 0',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: `${T.gold}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Pencil size={16} color={T.gold} />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: 'white', margin: 0 }}>Labour Approval</h3>
                  <p style={{ fontSize: 11, color: T.textMuted, margin: 0 }}>
                    UID: <span style={{ color: T.gold }}>{selectedItem.uid}</span>
                  </p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} style={{
                width: 30, height: 30, borderRadius: 6, border: 'none',
                background: 'rgba(255,255,255,0.1)', color: 'white',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><X size={16} /></button>
            </div>

            {/* Modal Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Quick Info */}
              <div style={{ background: T.borderLight, borderRadius: 10, padding: '12px 14px', border: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.navy, marginBottom: 8, textTransform: 'uppercase' }}>Request Details</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', fontSize: 12 }}>
                  <div><span style={{ color: T.textMuted }}>Project:</span> <strong style={{ color: T.navy }}>{selectedItem.projectName}</strong></div>
                  <div><span style={{ color: T.textMuted }}>Engineer:</span> <strong>{selectedItem.projectEngineer}</strong></div>
                  <div><span style={{ color: T.textMuted }}>Contractor:</span> <strong>{selectedItem.nameOfContractor}</strong></div>
                  <div><span style={{ color: T.textMuted }}>Total Labour:</span> <strong style={{ color: T.success }}>{selectedItem.totalLabour}</strong></div>
                  <div><span style={{ color: T.textMuted }}>Work Type:</span> <strong>{selectedItem.workType}</strong></div>
                  <div><span style={{ color: T.textMuted }}>Date Required:</span> <strong>{selectedItem.dateRequired}</strong></div>
                </div>
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${T.border}` }}>
                  <span style={{ color: T.textMuted, fontSize: 11 }}>Work Description:</span>
                  <p style={{ fontSize: 12, color: T.text, marginTop: 2 }}>{selectedItem.workDescription || 'N/A'}</p>
                </div>
              </div>

              {/* Status */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>
                  Status <span style={{ color: T.danger }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <select value={formData.Status_2} onChange={(e) => handleFormChange('Status_2', e.target.value)}
                    style={{ ...inputBase, paddingRight: 32, appearance: 'none', cursor: 'pointer' }}
                    onFocus={focusGold} onBlur={blurNormal}>
                    <option value="">-- Select Status --</option>
                    <option value="Approved">✅ Approved</option>
                    <option value="Reject">❌ Reject</option>
                  </select>
                  <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: T.textMuted, pointerEvents: 'none' }} />
                </div>
              </div>

              {/* Reject Info */}
              {isRejected && (
                <div style={{
                  padding: '12px 14px', background: T.dangerBg,
                  border: `1px solid ${T.dangerBorder}`, borderRadius: 10,
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <XCircle size={18} color={T.danger} />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: T.danger, margin: 0 }}>Rejection Mode</p>
                    <p style={{ fontSize: 11, color: T.danger, margin: '2px 0 0' }}>Add optional remark and submit.</p>
                  </div>
                </div>
              )}

              {/* Approved fields */}
              {!isRejected && (
                <>
                  {/* Approved Head */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>
                      Approved Head <span style={{ color: T.danger }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <select value={formData.Approved_Head_2}
                        onChange={(e) => handleFormChange('Approved_Head_2', e.target.value)}
                        style={{ ...inputBase, paddingRight: 32, appearance: 'none', cursor: 'pointer' }}
                        onFocus={focusGold} onBlur={blurNormal}>
                        <option value="">-- Select Head --</option>
                        <option value="Company Head">🏢 Company Head</option>
                        <option value="Contractor Head">👷 Contractor Head</option>
                      </select>
                      <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: T.textMuted, pointerEvents: 'none' }} />
                    </div>
                  </div>

                  {/* Contractor Details */}
                  {isContractorHead && (
                    <div style={{
                      padding: '14px', background: `${T.gold}08`, borderRadius: 10,
                      border: `1px dashed ${T.gold}50`,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                        <UserCircle size={16} color={T.goldDark} />
                        <span style={{ fontSize: 12, fontWeight: 700, color: T.goldDark }}>Contractor Details</span>
                      </div>

                      {/* Contractor Name */}
                      <div style={{ marginBottom: 12 }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>
                          Contractor Name <span style={{ color: T.danger }}>*</span>
                        </label>
                        <div style={{ position: 'relative' }}>
                          <select value={formData.Name_Of_Contractor_2}
                            onChange={(e) => handleContractorSelect(e.target.value)}
                            disabled={isLoadingContractors}
                            style={{ ...inputBase, paddingRight: 32, appearance: 'none', cursor: isLoadingContractors ? 'not-allowed' : 'pointer' }}
                            onFocus={focusGold} onBlur={blurNormal}>
                            <option value="">
                              {isLoadingContractors ? 'Loading...' : '-- Select Contractor --'}
                            </option>
                            {contractorDropdownData.map((c, i) => (
                              <option key={i} value={c.contractorName}>{c.contractorName}</option>
                            ))}
                          </select>
                          <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: T.textMuted, pointerEvents: 'none' }} />
                        </div>
                      </div>

                      {/* Contractor Firm */}
                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>
                          Firm Name <span style={{ color: T.danger }}>*</span>
                          <span style={{ marginLeft: 8, fontSize: 10, color: T.success }}>Auto-filled</span>
                        </label>
                        <input type="text" value={formData.Contractor_Firm_Name_2} readOnly
                          placeholder="Select contractor..."
                          style={{ ...inputBase, background: T.borderLight, cursor: 'not-allowed' }} />
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Remark */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>
                  Remark <span style={{ fontSize: 10, color: T.textMuted }}>(Optional)</span>
                </label>
                <textarea value={formData.Remark_2}
                  onChange={(e) => handleFormChange('Remark_2', e.target.value)}
                  rows={3}
                  placeholder={isRejected ? "Reason for rejection..." : "Enter remarks..."}
                  style={{ ...inputBase, resize: 'vertical', minHeight: 70 }}
                  onFocus={focusGold} onBlur={blurNormal} />
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '14px 20px', borderTop: `1px solid ${T.border}`,
              background: T.borderLight,
              display: 'flex', justifyContent: 'flex-end', gap: 10,
              borderRadius: '0 0 14px 14px',
            }}>
              <button onClick={() => setShowModal(false)} style={{
                padding: '10px 20px', borderRadius: 8,
                border: `1.5px solid ${T.border}`, background: T.card,
                color: T.textLight, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>Cancel</button>

              <button onClick={handleSubmit}
                disabled={isApproving || isSubmitDisabled()}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '10px 24px', borderRadius: 8, border: 'none',
                  background: isApproving || isSubmitDisabled()
                    ? T.border
                    : isRejected
                      ? `linear-gradient(135deg, ${T.danger}, #dc2626)`
                      : `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
                  color: isApproving || isSubmitDisabled()
                    ? T.textMuted
                    : isRejected ? 'white' : T.navyDark,
                  fontSize: 13, fontWeight: 700,
                  cursor: isApproving || isSubmitDisabled() ? 'not-allowed' : 'pointer',
                  boxShadow: isApproving || isSubmitDisabled() ? 'none'
                    : isRejected ? `0 2px 8px ${T.danger}40` : `0 2px 8px ${T.gold}40`,
                }}>
                {isApproving ? (
                  <><Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> Submitting...</>
                ) : isRejected ? (
                  <><XCircle size={15} /> Reject</>
                ) : (
                  <><Send size={15} /> Submit</>
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

export default Approvel1;