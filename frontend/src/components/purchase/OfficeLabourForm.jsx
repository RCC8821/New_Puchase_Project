import React, { useState, useEffect, useMemo } from 'react';
import { useGetProjectDropdownQuery } from '../../redux/Labour/LabourSlice';
import {
  usePostOfficeLabourRequestMutation,
  useGetLabourRequirementsQuery,
  useUpdateLabourRequirementMutation,
  useSubmitToLabourFmsMutation,
} from '../../redux/formSlice';
import {
  Loader2, Users, Building, User, FileText, Calendar,
  Briefcase, HardHat, MessageSquare, Send, RefreshCw,
  ChevronDown, Wrench, Calculator, Lock, Table, Plus,
  Pencil, CheckCircle, X, AlertCircle, RotateCcw, Search,
} from 'lucide-react';

// ── THEME (Navy + Gold - Dashboard jaisa) ──
const T = {
  navy: '#1e293b', navyLight: '#334155', navyDark: '#0f172a',
  gold: '#f59e0b', goldLight: '#fbbf24', goldDark: '#d97706',
  bg: '#f8fafc', card: '#ffffff', text: '#1e293b',
  textLight: '#64748b', textMuted: '#94a3b8',
  border: '#e2e8f0', borderLight: '#f1f5f9',
  success: '#10b981', successBg: '#ecfdf5',
  danger: '#ef4444', dangerBg: '#fef2f2',
};

const OfficeLabourForm = () => {
  const [activeTab, setActiveTab] = useState('new'); // 'new' | 'view'
  const [editModal, setEditModal] = useState({ show: false, data: null });
  const [searchTerm, setSearchTerm] = useState('');

  // ── Date Helpers ──
  const getYesterdayDate = () => {
    const d = new Date(); d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  };

  // ── API Hooks ──
  const { data: dropdownData, isLoading: isDropdownLoading } = useGetProjectDropdownQuery();
  const safeDropdown = Array.isArray(dropdownData) ? dropdownData : [];

  const [postOfficeLabourRequest, { isLoading: isSubmitting }] = usePostOfficeLabourRequestMutation();

  const {
    data: requirementsData,
    isLoading: isReqLoading,
    isFetching: isReqFetching,
    refetch: refetchRequirements,
  } = useGetLabourRequirementsQuery(undefined, {
    skip: activeTab !== 'view',
  });

  const [updateLabourRequirement, { isLoading: isUpdating }] = useUpdateLabourRequirementMutation();
  const [submitToLabourFms, { isLoading: isSubmittingFms }] = useSubmitToLabourFmsMutation();

  // ── Form State (New Entry) ──
  const initialFormData = {
    Project_Name_1: '', Project_Engineer_1: '', Work_Type_1: '',
    Work_Description_1: '', Labour_Category_1: '', Number_Of_Labour_1: '',
    Labour_Category_2: '', Number_Of_Labour_2: '', Total_Labour_1: '',
    Date_Of_Required_1: '', Head_Of_Contractor_Company_1: '',
    Name_Of_Contractor_1: '', Contractor_Firm_Name_1: '', Remark_1: '',
  };
  const [labourData, setLabourData] = useState(initialFormData);

  // ── Edit Modal State ──
  const [editData, setEditData] = useState(initialFormData);

  const isContractorHead = labourData.Head_Of_Contractor_Company_1 === 'Contractor Head';
  const isEditContractorHead = editData.Head_Of_Contractor_Company_1 === 'Contractor Head';

  // ── Auto Total (New Form) ──
  useEffect(() => {
    const l1 = parseInt(labourData.Number_Of_Labour_1) || 0;
    const l2 = parseInt(labourData.Number_Of_Labour_2) || 0;
    setLabourData(prev => ({ ...prev, Total_Labour_1: (l1 + l2).toString() }));
  }, [labourData.Number_Of_Labour_1, labourData.Number_Of_Labour_2]);

  // ── Auto Total (Edit Form) ──
  useEffect(() => {
    const l1 = parseInt(editData.Number_Of_Labour_1) || 0;
    const l2 = parseInt(editData.Number_Of_Labour_2) || 0;
    setEditData(prev => ({ ...prev, Total_Labour_1: (l1 + l2).toString() }));
  }, [editData.Number_Of_Labour_1, editData.Number_Of_Labour_2]);

  // ── Dropdown Options ──
  const projectOptions = useMemo(() => {
    const seen = new Set();
    return safeDropdown
      .filter(item => (item.projectName || '').trim() && (item.projectName || '').trim() !== '(No Project Name)')
      .reduce((acc, item) => {
        const name = item.projectName.trim();
        if (!seen.has(name.toLowerCase())) {
          seen.add(name.toLowerCase());
          acc.push({ value: name, label: item.label || name, engineer: item.engineer || '' });
        }
        return acc;
      }, [])
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [safeDropdown]);

  const contractorOptions = useMemo(() => {
    const seen = new Map();
    safeDropdown.forEach(item => {
      const cName = (item.contractorName || '').trim();
      if (!cName) return;
      const fName = (item.contractorFirmName || '').trim();
      if (!seen.has(cName.toLowerCase())) {
        seen.set(cName.toLowerCase(), { value: cName, firmName: fName, label: fName ? `${cName} (${fName})` : cName });
      }
    });
    return Array.from(seen.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [safeDropdown]);

  const labourWorkTypeOptions = useMemo(() =>
    [...new Set(safeDropdown.map(i => (i.labourWorkType || '').trim()).filter(Boolean))].sort()
  , [safeDropdown]);

  const labourCategoryOptions = useMemo(() =>
    [...new Set(safeDropdown.map(i => (i.labourCategory || '').trim()).filter(Boolean))].sort()
  , [safeDropdown]);

  // ── Filter Table Data ──
  const filteredRequirements = useMemo(() => {
    if (!requirementsData) return [];
    if (!searchTerm) return requirementsData;
    const s = searchTerm.toLowerCase();
    return requirementsData.filter(item =>
      item.uid?.toLowerCase().includes(s) ||
      item.Project_Name_1?.toLowerCase().includes(s) ||
      item.Project_Engineer_1?.toLowerCase().includes(s) ||
      item.Work_Type_1?.toLowerCase().includes(s)
    );
  }, [requirementsData, searchTerm]);

  // ── Handlers (New Form) ──
  const handleProjectChange = (value) => {
    const engineer = projectOptions.find(o => o.value === value)?.engineer || '';
    setLabourData(prev => ({ ...prev, Project_Name_1: value, Project_Engineer_1: engineer }));
  };
  const handleContractorChange = (value) => {
    const firmName = contractorOptions.find(o => o.value === value)?.firmName || '';
    setLabourData(prev => ({ ...prev, Name_Of_Contractor_1: value, Contractor_Firm_Name_1: firmName }));
  };
  const handleLabourChange = (field, value) => setLabourData(prev => ({ ...prev, [field]: value }));

  // ── Handlers (Edit Form) ──
  const handleEditProjectChange = (value) => {
    const engineer = projectOptions.find(o => o.value === value)?.engineer || '';
    setEditData(prev => ({ ...prev, Project_Name_1: value, Project_Engineer_1: engineer }));
  };
  const handleEditContractorChange = (value) => {
    const firmName = contractorOptions.find(o => o.value === value)?.firmName || '';
    setEditData(prev => ({ ...prev, Name_Of_Contractor_1: value, Contractor_Firm_Name_1: firmName }));
  };
  const handleEditChange = (field, value) => setEditData(prev => ({ ...prev, [field]: value }));

  const showAlert = (type, msg) => alert(`${type === 'success' ? '✅' : '❌'} ${msg}`);

  // ── Submit New Form ──
  const handleSubmitNew = async (e) => {
    e.preventDefault();
    if (!labourData.Project_Name_1) return showAlert('error', 'Project Name required hai');
    if (!labourData.Work_Type_1) return showAlert('error', 'Work Type required hai');
    if (!labourData.Work_Description_1.trim()) return showAlert('error', 'Work Description required hai');
    if (!labourData.Labour_Category_1) return showAlert('error', 'Labour Category 1 required hai');
    if (!labourData.Number_Of_Labour_1 || parseInt(labourData.Number_Of_Labour_1) <= 0)
      return showAlert('error', 'Number of Labour (Cat 1) 0 se zyada hona chahiye');
    if (!labourData.Date_Of_Required_1) return showAlert('error', 'Date of Required required hai');
    if (!labourData.Head_Of_Contractor_Company_1) return showAlert('error', 'Head Of Contractor/Company required hai');
    if (isContractorHead && !labourData.Name_Of_Contractor_1)
      return showAlert('error', 'Name of Contractor required hai');

    try {
      const result = await postOfficeLabourRequest({ ...labourData }).unwrap();
      showAlert('success', `${result.message} | UID: ${result.uid}`);
      setLabourData(initialFormData);
    } catch (err) {
      showAlert('error', err?.data?.message || 'Submit karne mein error aaya');
    }
  };

  // ── Open Edit Modal ──
  const openEditModal = (row) => {
    setEditData({
      Project_Name_1              : row.Project_Name_1              || '',
      Project_Engineer_1          : row.Project_Engineer_1          || '',
      Work_Type_1                 : row.Work_Type_1                 || '',
      Work_Description_1          : row.Work_Description_1          || '',
      Labour_Category_1           : row.Labour_Category_1           || '',
      Number_Of_Labour_1          : row.Number_Of_Labour_1          || '',
      Labour_Category_2           : row.Labour_Category_2           || '',
      Number_Of_Labour_2          : row.Number_Of_Labour_2          || '',
      Total_Labour_1              : row.Total_Labour_1              || '',
      Date_Of_Required_1          : row.Date_Of_Required_1          || '',
      Head_Of_Contractor_Company_1: row.Head_Of_Contractor_Company_1|| '',
      Name_Of_Contractor_1        : row.Name_Of_Contractor_1        || '',
      Contractor_Firm_Name_1      : row.Contractor_Firm_Name_1      || '',
      Remark_1                    : row.Remark_1                    || '',
    });
    setEditModal({ show: true, data: row });
  };

  // ── Save Edit ──
  const handleSaveEdit = async () => {
    if (!editModal.data?.uid) return;
    try {
      const result = await updateLabourRequirement({
        uid: editModal.data.uid,
        ...editData,
      }).unwrap();
      showAlert('success', result.message);
      setEditModal({ show: false, data: null });
      refetchRequirements();
    } catch (err) {
      showAlert('error', err?.data?.message || 'Update failed');
    }
  };

  // ── Submit to Labour_FMS ──
  const handleSubmitToFms = async (row) => {
    if (!window.confirm(`UID ${row.uid} ko Labour_FMS me bhejna hai?\n\nStatus "Done" mark ho jayega aur table se hide ho jayega.`)) return;
    try {
      const result = await submitToLabourFms({ uid: row.uid }).unwrap();
      showAlert('success', `${result.message} | Row: ${result.labourFmsRow}`);
      refetchRequirements();
    } catch (err) {
      showAlert('error', err?.data?.message || 'Submit failed');
    }
  };

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  return (
    <div style={{
      minHeight: '100vh', background: T.bg, padding: '16px',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>

        {/* ── OFFICE ACCESS BADGE ── */}
        <div style={{
          background: `${T.gold}15`, border: `1px solid ${T.gold}50`,
          borderRadius: 12, padding: '10px 14px', marginBottom: 12,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <Lock size={16} color={T.goldDark} />
          <span style={{ fontSize: 13, color: T.goldDark, fontWeight: 600 }}>
            🔒 Office Access Only — Restricted Form
          </span>
        </div>

        {/* ── TABS ── */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button
            onClick={() => setActiveTab('new')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '12px 24px', borderRadius: 10, border: 'none',
              cursor: 'pointer', fontSize: 14, fontWeight: 700,
              transition: 'all 0.2s',
              background: activeTab === 'new'
                ? `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`
                : T.card,
              color: activeTab === 'new' ? T.gold : T.textLight,
              border: activeTab === 'new' ? 'none' : `1px solid ${T.border}`,
              boxShadow: activeTab === 'new' ? `0 4px 12px ${T.navy}40` : 'none',
            }}
          >
            <Plus size={16} /> New Request
          </button>

          <button
            onClick={() => setActiveTab('view')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '12px 24px', borderRadius: 10, border: 'none',
              cursor: 'pointer', fontSize: 14, fontWeight: 700,
              transition: 'all 0.2s',
              background: activeTab === 'view'
                ? `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`
                : T.card,
              color: activeTab === 'view' ? T.gold : T.textLight,
              border: activeTab === 'view' ? 'none' : `1px solid ${T.border}`,
              boxShadow: activeTab === 'view' ? `0 4px 12px ${T.navy}40` : 'none',
            }}
          >
            <Table size={16} /> View Requirements
            {requirementsData && requirementsData.length > 0 && (
              <span style={{
                background: T.gold, color: T.navyDark,
                padding: '2px 8px', borderRadius: 10,
                fontSize: 11, fontWeight: 800,
              }}>
                {requirementsData.length}
              </span>
            )}
          </button>
        </div>

        {/* ══════════════════════════════════════════════════ */}
        {/* NEW FORM TAB                                       */}
        {/* ══════════════════════════════════════════════════ */}
        {activeTab === 'new' && (
          <div style={{
            background: T.card, borderRadius: 14,
            border: `1px solid ${T.border}`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)', overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{
              background: `linear-gradient(135deg, ${T.navy}, ${T.navyDark})`,
              padding: '20px 24px', borderBottom: `3px solid ${T.gold}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: `${T.gold}25`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Users size={22} color={T.gold} />
                </div>
                <div>
                  <h1 style={{ fontSize: 20, fontWeight: 800, color: 'white', margin: 0 }}>
                    Office Labour Form
                  </h1>
                  <p style={{ fontSize: 12, color: '#cbd5e1', margin: '2px 0 0' }}>
                    New labour requirement request
                  </p>
                </div>
              </div>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmitNew} style={{ padding: 24 }}>
              <FormFields
                data={labourData}
                onProjectChange={handleProjectChange}
                onContractorChange={handleContractorChange}
                onChange={handleLabourChange}
                onHeadChange={(val) => setLabourData(prev => ({
                  ...prev, Head_Of_Contractor_Company_1: val,
                  ...(val !== 'Contractor Head' && { Name_Of_Contractor_1: '', Contractor_Firm_Name_1: '' })
                }))}
                projectOptions={projectOptions}
                contractorOptions={contractorOptions}
                labourWorkTypeOptions={labourWorkTypeOptions}
                labourCategoryOptions={labourCategoryOptions}
                isContractorHead={isContractorHead}
                isDropdownLoading={isDropdownLoading}
                getYesterdayDate={getYesterdayDate}
              />

              {/* Buttons */}
              <div style={{
                display: 'flex', gap: 12, paddingTop: 20,
                borderTop: `1px solid ${T.border}`, marginTop: 20,
              }}>
                <button type="button" onClick={() => setLabourData(initialFormData)}
                  style={{
                    flex: 1, padding: '12px 20px', borderRadius: 10,
                    border: `1.5px solid ${T.border}`, background: T.card,
                    color: T.textLight, fontSize: 14, fontWeight: 600,
                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: 8,
                  }}
                >
                  <RefreshCw size={16} /> Reset
                </button>
                <button type="submit" disabled={isSubmitting || isDropdownLoading}
                  style={{
                    flex: 1, padding: '12px 20px', borderRadius: 10, border: 'none',
                    background: isSubmitting || isDropdownLoading
                      ? T.border
                      : `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
                    color: isSubmitting ? T.textMuted : T.navyDark,
                    fontSize: 14, fontWeight: 700,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: isSubmitting ? 'none' : `0 4px 12px ${T.gold}40`,
                  }}
                >
                  {isSubmitting
                    ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Submitting...</>
                    : <><Send size={16} /> Submit Request</>
                  }
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ══════════════════════════════════════════════════ */}
        {/* VIEW TAB — TABLE                                   */}
        {/* ══════════════════════════════════════════════════ */}
        {activeTab === 'view' && (
          <div style={{
            background: T.card, borderRadius: 14,
            border: `1px solid ${T.border}`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)', overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{
              background: `linear-gradient(135deg, ${T.navy}, ${T.navyDark})`,
              padding: '20px 24px', borderBottom: `3px solid ${T.gold}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: `${T.gold}25`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Table size={22} color={T.gold} />
                </div>
                <div>
                  <h1 style={{ fontSize: 20, fontWeight: 800, color: 'white', margin: 0 }}>
                    Labour Requirements
                  </h1>
                  <p style={{ fontSize: 12, color: '#cbd5e1', margin: '2px 0 0' }}>
                    {filteredRequirements.length} pending record(s)
                  </p>
                </div>
              </div>

              <button onClick={refetchRequirements} disabled={isReqFetching}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px', borderRadius: 8,
                  border: `1px solid ${T.gold}60`,
                  background: `${T.gold}20`, color: T.gold,
                  fontSize: 13, fontWeight: 600,
                  cursor: isReqFetching ? 'not-allowed' : 'pointer',
                }}
              >
                <RotateCcw size={14} style={isReqFetching ? { animation: 'spin 0.8s linear infinite' } : {}} />
                Refresh
              </button>
            </div>

            {/* Search Bar */}
            <div style={{ padding: '16px 24px', borderBottom: `1px solid ${T.border}` }}>
              <div style={{ position: 'relative', maxWidth: 400 }}>
                <Search size={16} style={{
                  position: 'absolute', left: 12, top: '50%',
                  transform: 'translateY(-50%)', color: T.textMuted,
                }} />
                <input
                  type="text"
                  placeholder="Search UID, project, engineer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px 10px 38px',
                    borderRadius: 8, border: `1.5px solid ${T.border}`,
                    fontSize: 13, outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Table Body */}
            {isReqLoading ? (
              <div style={{
                padding: 60, display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 12,
              }}>
                <Loader2 size={40} color={T.gold} style={{ animation: 'spin 1s linear infinite' }} />
                <p style={{ color: T.textLight, fontSize: 14, fontWeight: 600 }}>
                  Loading requirements...
                </p>
              </div>
            ) : filteredRequirements.length === 0 ? (
              <div style={{
                padding: 60, display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 12,
              }}>
                <CheckCircle size={40} color={T.success} />
                <p style={{ color: T.textLight, fontSize: 14, fontWeight: 600 }}>
                  {requirementsData && requirementsData.length === 0
                    ? 'No pending requirements'
                    : 'No records match your search'}
                </p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto', maxHeight: '65vh' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                    <tr style={{ background: T.navy }}>
                      {['Timestamp','UID','Project','Engineer','Work Type','Work Desc',
                        'Cat 1','No.1','Cat 2','No.2','Total','Date Req','Head',
                        'Contractor','Firm','Remark','Actions'
                      ].map((h, i) => (
                        <th key={i} style={{
                          padding: '12px 10px', textAlign: 'left',
                          color: T.goldLight, fontSize: 11, fontWeight: 700,
                          textTransform: 'uppercase', letterSpacing: 0.5,
                          whiteSpace: 'nowrap', borderBottom: `2px solid ${T.gold}`,
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequirements.map((row, idx) => (
                      <tr key={row.uid || idx}
                        style={{ background: idx % 2 === 0 ? T.card : T.borderLight }}
                        onMouseEnter={e => { e.currentTarget.style.background = `${T.gold}10`; }}
                        onMouseLeave={e => { e.currentTarget.style.background = idx % 2 === 0 ? T.card : T.borderLight; }}
                      >
                        <Td>{row.timestamp}</Td>
                        <Td><span style={badgeStyle(T.navy)}>{row.uid}</span></Td>
                        <Td bold>{row.Project_Name_1}</Td>
                        <Td>{row.Project_Engineer_1}</Td>
                        <Td><span style={badgeStyle(T.gold, T.goldDark)}>{row.Work_Type_1}</span></Td>
                        <Td maxW={180}>{row.Work_Description_1}</Td>
                        <Td>{row.Labour_Category_1}</Td>
                        <Td center><span style={numberBadge(T.navy)}>{row.Number_Of_Labour_1 || '0'}</span></Td>
                        <Td>{row.Labour_Category_2}</Td>
                        <Td center><span style={numberBadge(T.navy)}>{row.Number_Of_Labour_2 || '0'}</span></Td>
                        <Td center><span style={numberBadge(T.success)}>{row.Total_Labour_1 || '0'}</span></Td>
                        <Td>{row.Date_Of_Required_1}</Td>
                        <Td>{row.Head_Of_Contractor_Company_1}</Td>
                        <Td>{row.Name_Of_Contractor_1}</Td>
                        <Td>{row.Contractor_Firm_Name_1}</Td>
                        <Td maxW={120}>{row.Remark_1}</Td>
                        <td style={{ padding: '10px', borderBottom: `1px solid ${T.border}` }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => openEditModal(row)}
                              title="Edit"
                              style={{
                                width: 32, height: 32, borderRadius: 6, border: 'none',
                                background: `${T.gold}20`, color: T.goldDark,
                                cursor: 'pointer', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = T.gold; e.currentTarget.style.color = T.navyDark; }}
                              onMouseLeave={e => { e.currentTarget.style.background = `${T.gold}20`; e.currentTarget.style.color = T.goldDark; }}
                            >
                              <Pencil size={14} />
                            </button>
                            <button onClick={() => handleSubmitToFms(row)}
                              disabled={isSubmittingFms}
                              title="Submit to Labour_FMS"
                              style={{
                                width: 32, height: 32, borderRadius: 6, border: 'none',
                                background: `${T.success}20`, color: T.success,
                                cursor: isSubmittingFms ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}
                              onMouseEnter={e => { if (!isSubmittingFms) { e.currentTarget.style.background = T.success; e.currentTarget.style.color = 'white'; } }}
                              onMouseLeave={e => { e.currentTarget.style.background = `${T.success}20`; e.currentTarget.style.color = T.success; }}
                            >
                              <Send size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════ */}
        {/* EDIT MODAL                                         */}
        {/* ══════════════════════════════════════════════════ */}
        {editModal.show && (
          <>
            <div onClick={() => setEditModal({ show: false, data: null })}
              style={{
                position: 'fixed', inset: 0,
                background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(3px)',
                zIndex: 100,
              }}
            />
            <div style={{
              position: 'fixed', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '95%', maxWidth: 720, background: T.card,
              borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              zIndex: 101, display: 'flex', flexDirection: 'column',
              maxHeight: '92vh',
            }}>
              {/* Modal Header */}
              <div style={{
                background: `linear-gradient(135deg, ${T.navy}, ${T.navyDark})`,
                padding: '16px 20px', borderBottom: `3px solid ${T.gold}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderRadius: '14px 14px 0 0',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: `${T.gold}25`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Pencil size={16} color={T.gold} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: 'white', margin: 0 }}>
                      Edit Requirement
                    </h3>
                    <p style={{ fontSize: 11, color: '#cbd5e1', margin: '2px 0 0' }}>
                      UID: <span style={{ color: T.gold, fontWeight: 700 }}>{editModal.data?.uid}</span>
                    </p>
                  </div>
                </div>
                <button onClick={() => setEditModal({ show: false, data: null })}
                  style={{
                    width: 32, height: 32, borderRadius: 6, border: 'none',
                    background: 'rgba(255,255,255,0.1)', color: 'white',
                    cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Body (Scrollable) */}
              <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
                <FormFields
                  data={editData}
                  onProjectChange={handleEditProjectChange}
                  onContractorChange={handleEditContractorChange}
                  onChange={handleEditChange}
                  onHeadChange={(val) => setEditData(prev => ({
                    ...prev, Head_Of_Contractor_Company_1: val,
                    ...(val !== 'Contractor Head' && { Name_Of_Contractor_1: '', Contractor_Firm_Name_1: '' })
                  }))}
                  projectOptions={projectOptions}
                  contractorOptions={contractorOptions}
                  labourWorkTypeOptions={labourWorkTypeOptions}
                  labourCategoryOptions={labourCategoryOptions}
                  isContractorHead={isEditContractorHead}
                  isDropdownLoading={isDropdownLoading}
                  getYesterdayDate={getYesterdayDate}
                  compact
                />
              </div>

              {/* Modal Footer */}
              <div style={{
                padding: '14px 20px', borderTop: `1px solid ${T.border}`,
                background: T.borderLight, borderRadius: '0 0 14px 14px',
                display: 'flex', gap: 10, justifyContent: 'flex-end',
              }}>
                <button onClick={() => setEditModal({ show: false, data: null })}
                  style={{
                    padding: '10px 20px', borderRadius: 8,
                    border: `1.5px solid ${T.border}`, background: T.card,
                    color: T.textLight, fontSize: 13, fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button onClick={handleSaveEdit} disabled={isUpdating}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '10px 24px', borderRadius: 8, border: 'none',
                    background: isUpdating
                      ? T.border
                      : `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
                    color: isUpdating ? T.textMuted : T.navyDark,
                    fontSize: 13, fontWeight: 700,
                    cursor: isUpdating ? 'not-allowed' : 'pointer',
                    boxShadow: isUpdating ? 'none' : `0 4px 12px ${T.gold}40`,
                  }}
                >
                  {isUpdating
                    ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Updating...</>
                    : <><CheckCircle size={14} /> Update</>
                  }
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// REUSABLE COMPONENTS
// ═══════════════════════════════════════════════════════════

// Table Cell
const Td = ({ children, bold, center, maxW }) => (
  <td style={{
    padding: '10px', fontSize: 12, color: T.text,
    borderBottom: `1px solid ${T.border}`, whiteSpace: 'nowrap',
    textAlign: center ? 'center' : 'left', fontWeight: bold ? 600 : 400,
  }}>
    {maxW ? (
      <span title={typeof children === 'string' ? children : ''}
        style={{ display: 'block', maxWidth: maxW, overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {children || <span style={{ color: T.textMuted }}>—</span>}
      </span>
    ) : (children || <span style={{ color: T.textMuted }}>—</span>)}
  </td>
);

const badgeStyle = (color, textColor) => ({
  background: `${color}15`, color: textColor || color,
  padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700,
});

const numberBadge = (color) => ({
  background: `${color}15`, color: color,
  padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700,
});

// ── Form Fields (Reusable — used in both New Form + Edit Modal) ──
const FormFields = ({
  data, onProjectChange, onContractorChange, onChange, onHeadChange,
  projectOptions, contractorOptions, labourWorkTypeOptions, labourCategoryOptions,
  isContractorHead, isDropdownLoading, getYesterdayDate, compact = false,
}) => {
  const gap = compact ? 12 : 16;
  const pad = compact ? '10px 12px' : '12px 14px';
  const inputStyle = {
    width: '100%', padding: pad, fontSize: 13,
    border: `1.5px solid ${T.border}`, borderRadius: 8,
    outline: 'none', background: T.card, boxSizing: 'border-box',
  };
  const labelStyle = {
    display: 'block', fontSize: 12, fontWeight: 600,
    color: T.navy, marginBottom: 6,
  };
  const disabledInput = { ...inputStyle, background: T.borderLight, cursor: 'not-allowed', color: T.textLight };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap }}>
      {/* Project + Engineer */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap }}>
        <div>
          <label style={labelStyle}>
            <Building size={12} style={{ display: 'inline', marginRight: 4 }} />
            Project Name <span style={{ color: T.danger }}>*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <select value={data.Project_Name_1} onChange={(e) => onProjectChange(e.target.value)}
              disabled={isDropdownLoading}
              style={{ ...inputStyle, appearance: 'none', paddingRight: 32 }}
            >
              <option value="">-- Select Project --</option>
              {projectOptions.map((opt, i) => (
                <option key={i} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: T.textMuted, pointerEvents: 'none' }} />
          </div>
        </div>
        <div>
          <label style={labelStyle}>
            <User size={12} style={{ display: 'inline', marginRight: 4 }} />
            Project Engineer <span style={{ fontSize: 10, color: T.textMuted }}>(auto)</span>
          </label>
          <input type="text" readOnly value={data.Project_Engineer_1} style={disabledInput} />
        </div>
      </div>

      {/* Work Type */}
      <div>
        <label style={labelStyle}>
          <Wrench size={12} style={{ display: 'inline', marginRight: 4 }} />
          Work Type <span style={{ color: T.danger }}>*</span>
        </label>
        <div style={{ position: 'relative' }}>
          <select value={data.Work_Type_1} onChange={(e) => onChange('Work_Type_1', e.target.value)}
            style={{ ...inputStyle, appearance: 'none', paddingRight: 32 }}
          >
            <option value="">-- Select Work Type --</option>
            {labourWorkTypeOptions.map((opt, i) => (
              <option key={i} value={opt}>{opt}</option>
            ))}
          </select>
          <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: T.textMuted, pointerEvents: 'none' }} />
        </div>
      </div>

      {/* Work Description */}
      <div>
        <label style={labelStyle}>
          <FileText size={12} style={{ display: 'inline', marginRight: 4 }} />
          Work Description <span style={{ color: T.danger }}>*</span>
        </label>
        <textarea rows={3} value={data.Work_Description_1}
          onChange={(e) => onChange('Work_Description_1', e.target.value)}
          placeholder="Describe the work..."
          style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
        />
      </div>

      {/* Labour Details Section */}
      <div style={{
        padding: 14, background: `${T.gold}08`, borderRadius: 10,
        border: `1px dashed ${T.gold}60`,
      }}>
        <div style={{
          fontSize: 12, fontWeight: 700, color: T.goldDark, marginBottom: 12,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <Users size={14} /> Labour Details
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={labelStyle}>Labour Category 1 <span style={{ color: T.danger }}>*</span></label>
            <div style={{ position: 'relative' }}>
              <select value={data.Labour_Category_1}
                onChange={(e) => onChange('Labour_Category_1', e.target.value)}
                style={{ ...inputStyle, appearance: 'none', paddingRight: 32 }}
              >
                <option value="">-- Select --</option>
                {labourCategoryOptions.map((opt, i) => (
                  <option key={i} value={opt}>{opt}</option>
                ))}
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: T.textMuted, pointerEvents: 'none' }} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Number of Labour (Cat 1) <span style={{ color: T.danger }}>*</span></label>
            <input type="number" min="0" placeholder="0" value={data.Number_Of_Labour_1}
              onChange={(e) => onChange('Number_Of_Labour_1', e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Labour Category 2</label>
            <div style={{ position: 'relative' }}>
              <select value={data.Labour_Category_2}
                onChange={(e) => onChange('Labour_Category_2', e.target.value)}
                style={{ ...inputStyle, appearance: 'none', paddingRight: 32 }}
              >
                <option value="">-- Select --</option>
                {labourCategoryOptions.map((opt, i) => (
                  <option key={i} value={opt}>{opt}</option>
                ))}
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: T.textMuted, pointerEvents: 'none' }} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Number of Labour (Cat 2)</label>
            <input type="number" min="0" placeholder="0" value={data.Number_Of_Labour_2}
              onChange={(e) => onChange('Number_Of_Labour_2', e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{
          marginTop: 12, padding: 12, background: T.card,
          borderRadius: 8, border: `1px solid ${T.gold}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{
            fontSize: 12, fontWeight: 700, color: T.navy,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <Calculator size={14} /> Total Labour (Auto)
          </span>
          <span style={{ fontSize: 22, fontWeight: 800, color: T.goldDark }}>
            {data.Total_Labour_1 || '0'}
          </span>
        </div>
      </div>

      {/* Date */}
      <div>
        <label style={labelStyle}>
          <Calendar size={12} style={{ display: 'inline', marginRight: 4 }} />
          Date of Required <span style={{ color: T.danger }}>*</span>
        </label>
        <input type="date" value={data.Date_Of_Required_1}
          onChange={(e) => onChange('Date_Of_Required_1', e.target.value)}
          min={getYesterdayDate()}
          style={inputStyle}
        />
      </div>

      {/* Head + Contractor */}
      <div style={{ display: 'grid', gridTemplateColumns: isContractorHead ? '1fr 1fr 1fr' : '1fr', gap }}>
        <div>
          <label style={labelStyle}>
            <Briefcase size={12} style={{ display: 'inline', marginRight: 4 }} />
            Head Of Contractor/Company <span style={{ color: T.danger }}>*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <select value={data.Head_Of_Contractor_Company_1}
              onChange={(e) => onHeadChange(e.target.value)}
              style={{ ...inputStyle, appearance: 'none', paddingRight: 32 }}
            >
              <option value="">-- Select --</option>
              <option value="Company Head">Company Head</option>
              <option value="Contractor Head">Contractor Head</option>
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: T.textMuted, pointerEvents: 'none' }} />
          </div>
        </div>

        {isContractorHead && (
          <>
            <div>
              <label style={labelStyle}>
                <HardHat size={12} style={{ display: 'inline', marginRight: 4 }} />
                Name of Contractor <span style={{ color: T.danger }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <select value={data.Name_Of_Contractor_1}
                  onChange={(e) => onContractorChange(e.target.value)}
                  style={{ ...inputStyle, appearance: 'none', paddingRight: 32 }}
                >
                  <option value="">-- Select --</option>
                  {contractorOptions.map((opt, i) => (
                    <option key={i} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: T.textMuted, pointerEvents: 'none' }} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>
                <Building size={12} style={{ display: 'inline', marginRight: 4 }} />
                Contractor Firm <span style={{ fontSize: 10, color: T.textMuted }}>(auto)</span>
              </label>
              <input type="text" readOnly value={data.Contractor_Firm_Name_1} style={disabledInput} />
            </div>
          </>
        )}
      </div>

      {/* Remark */}
      <div>
        <label style={labelStyle}>
          <MessageSquare size={12} style={{ display: 'inline', marginRight: 4 }} />
          Remark
        </label>
        <textarea rows={2} value={data.Remark_1}
          onChange={(e) => onChange('Remark_1', e.target.value)}
          placeholder="Enter any remarks..."
          style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
        />
      </div>
    </div>
  );
};

export default OfficeLabourForm;