// import React, { useState, useEffect, useMemo } from 'react';
// import { useGetProjectDropdownQuery } from '../../redux/Labour/LabourSlice';
// import {
//   usePostLabourRequestMutation,          
//   useGetLabourRequirementsQuery,         
//   useUpdateLabourReqManagementMutation,  
// } from '../../redux/formSlice';
// import {
//   Loader2, Users, Building, User, FileText, Calendar,
//   Briefcase, HardHat, MessageSquare, Send, RefreshCw,
//   ChevronDown, Wrench, Calculator, Lock, Table, Plus,
//   Pencil, X, AlertCircle, RotateCcw, Search,
//   IndianRupee, Wallet, XCircle
// } from 'lucide-react';

// // ── THEME (Navy + Gold) ──
// const T = {
//   navy: '#1e293b', navyLight: '#334155', navyDark: '#0f172a',
//   gold: '#f59e0b', goldLight: '#fbbf24', goldDark: '#d97706',
//   bg: '#f8fafc', card: '#ffffff', text: '#1e293b',
//   textLight: '#64748b', textMuted: '#94a3b8',
//   border: '#e2e8f0', borderLight: '#f1f5f9',
//   success: '#10b981', successBg: '#ecfdf5', successBorder: '#a7f3d0',
//   danger: '#ef4444', dangerBg: '#fef2f2', dangerBorder: '#fecaca',
//   purple: '#7c3aed',
// };

// const inputBase = {
//   width: '100%', padding: '10px 12px', fontSize: 13,
//   border: `1.5px solid ${T.border}`, borderRadius: 8,
//   outline: 'none', color: T.text, background: T.borderLight,
//   transition: 'all 0.2s', boxSizing: 'border-box',
// };
// const focusGold = (e) => { e.target.style.borderColor = T.gold; e.target.style.boxShadow = `0 0 0 3px ${T.gold}15`; e.target.style.background = T.card; };
// const blurNormal = (e) => { e.target.style.borderColor = T.border; e.target.style.boxShadow = 'none'; e.target.style.background = T.borderLight; };

// const LabourRequirementManagement = () => {
//   const [activeTab, setActiveTab] = useState('new'); 
//   const [searchTerm, setSearchTerm] = useState('');

//   const getYesterdayDate = () => {
//     const d = new Date(); d.setDate(d.getDate() - 1);
//     return d.toISOString().split('T')[0];
//   };

//   // ── API Hooks ──
//   const { data: dropdownData, isLoading: isDropdownLoading } = useGetProjectDropdownQuery();
//   const safeDropdown = Array.isArray(dropdownData) ? dropdownData : [];
  
//   const [postLabourRequest, { isLoading: isSubmittingNew }] = usePostLabourRequestMutation();

//   const {
//     data: requirementsData,
//     isLoading: isReqLoading,
//     isFetching: isReqFetching,
//     refetch: refetchRequirements,
//   } = useGetLabourRequirementsQuery(undefined, { skip: activeTab !== 'view' });

//   const [updateLabourReqManagement, { isLoading: isUpdatingModal }] = useUpdateLabourReqManagementMutation();

//   // ── State: New Request Form ──
//   const initialFormData = {
//     Project_Name_1: '', Project_Engineer_1: '', Work_Type_1: '',
//     Work_Description_1: '', Labour_Category_1: '', Number_Of_Labour_1: '',
//     Labour_Category_2: '', Number_Of_Labour_2: '', Total_Labour_1: '',
//     Date_Of_Required_1: '', Head_Of_Contractor_Company_1: '',
//     Name_Of_Contractor_1: '', Contractor_Firm_Name_1: '', Remark_1: '',
//   };
//   const [labourData, setLabourData] = useState(initialFormData);

//   // ── State: Edit Modal ──
//   const [showModal, setShowModal] = useState(false);
//   const [selectedItem, setSelectedItem] = useState(null);
//   const [modalForm, setModalForm] = useState({
//     Status_3: '', Labouar_Contractor_Name_3: '', Labour_Category_1_3: '', Number_Of_Labour_1_3: '',
//     Labour_Rate_1_3: '', Labour_Category_2_3: '', Number_Of_Labour_2_3: '', Labour_Rate_2_3: '',
//     Total_Wages_3: '', Conveyanance_3: '', Contractor_Commission: '', Total_Paid_Amount_3: '',
//     Company_Head_Amount_3: '', Contractor_Head_Amount_3: '', Remark_3: ''
//   });
//   const [formError, setFormError] = useState('');

//   const isContractorHead = labourData.Head_Of_Contractor_Company_1 === 'Contractor Head';
//   const isRejected = modalForm.Status_3 === 'Reject';
//   const isCompanyHeadModal = selectedItem?.Head_Of_Contractor_Company_1 === 'Company Head';

//   // ── Auto Total (New Form) ──
//   useEffect(() => {
//     const l1 = parseInt(labourData.Number_Of_Labour_1) || 0;
//     const l2 = parseInt(labourData.Number_Of_Labour_2) || 0;
//     setLabourData(prev => ({ ...prev, Total_Labour_1: (l1 + l2).toString() }));
//   }, [labourData.Number_Of_Labour_1, labourData.Number_Of_Labour_2]);

//   // ── Auto Calculate (Modal Form) ──
//   useEffect(() => {
//     if (isRejected) return;
//     const num1 = parseFloat(modalForm.Number_Of_Labour_1_3) || 0;
//     const rate1 = parseFloat(modalForm.Labour_Rate_1_3) || 0;
//     const num2 = parseFloat(modalForm.Number_Of_Labour_2_3) || 0;
//     const rate2 = parseFloat(modalForm.Labour_Rate_2_3) || 0;
//     const conv = parseFloat(modalForm.Conveyanance_3) || 0;
//     const comm = parseFloat(modalForm.Contractor_Commission) || 0;
    
//     const totalWages = (num1 * rate1) + (num2 * rate2);
//     const totalPaid = totalWages + conv + comm;
    
//     const totalPaidStr = totalPaid > 0 ? totalPaid.toString() : '';

//     setModalForm(prev => ({
//       ...prev,
//       Total_Wages_3: totalWages > 0 ? totalWages.toString() : '',
//       Total_Paid_Amount_3: totalPaidStr,
//       Company_Head_Amount_3: isCompanyHeadModal ? totalPaidStr : '',
//       Contractor_Head_Amount_3: !isCompanyHeadModal ? totalPaidStr : ''
//     }));
//   }, [modalForm.Number_Of_Labour_1_3, modalForm.Labour_Rate_1_3, modalForm.Number_Of_Labour_2_3, modalForm.Labour_Rate_2_3, modalForm.Conveyanance_3, modalForm.Contractor_Commission, isRejected, isCompanyHeadModal]);

//   // ── Dropdown Options ──
//   const projectOptions = useMemo(() => {
//     const seen = new Set();
//     return safeDropdown.filter(item => (item.projectName || '').trim() && (item.projectName || '').trim() !== '(No Project Name)')
//       .reduce((acc, item) => {
//         const name = item.projectName.trim();
//         if (!seen.has(name.toLowerCase())) {
//           seen.add(name.toLowerCase());
//           acc.push({ value: name, label: item.label || name, engineer: item.engineer || '' });
//         }
//         return acc;
//       }, []).sort((a, b) => a.label.localeCompare(b.label));
//   }, [safeDropdown]);

//   const contractorOptions = useMemo(() => {
//     const seen = new Map();
//     safeDropdown.forEach(item => {
//       const cName = (item.contractorName || '').trim();
//       if (!cName) return;
//       const fName = (item.contractorFirmName || '').trim();
//       if (!seen.has(cName.toLowerCase())) {
//         seen.set(cName.toLowerCase(), { value: cName, firmName: fName, label: fName ? `${cName} (${fName})` : cName });
//       }
//     });
//     return Array.from(seen.values()).sort((a, b) => a.label.localeCompare(b.label));
//   }, [safeDropdown]);

//   const labourWorkTypeOptions = useMemo(() => [...new Set(safeDropdown.map(i => (i.labourWorkType || '').trim()).filter(Boolean))].sort(), [safeDropdown]);
//   const labourCategoryOptions = useMemo(() => [...new Set(safeDropdown.map(i => (i.labourCategory || '').trim()).filter(Boolean))].sort(), [safeDropdown]);

//   // ── Handlers (New Form) ──
//   const handleProjectChange = (value) => {
//     const engineer = projectOptions.find(o => o.value === value)?.engineer || '';
//     setLabourData(prev => ({ ...prev, Project_Name_1: value, Project_Engineer_1: engineer }));
//   };
//   const handleContractorChange = (value) => {
//     const firmName = contractorOptions.find(o => o.value === value)?.firmName || '';
//     setLabourData(prev => ({ ...prev, Name_Of_Contractor_1: value, Contractor_Firm_Name_1: firmName }));
//   };
//   const handleLabourChange = (field, value) => setLabourData(prev => ({ ...prev, [field]: value }));
//   const showAlert = (type, msg) => alert(`${type === 'success' ? '✅' : '❌'} ${msg}`);

//   const handleSubmitNew = async (e) => {
//     e.preventDefault();
//     if (!labourData.Project_Name_1 || !labourData.Work_Type_1 || !labourData.Work_Description_1.trim()) 
//       return showAlert('error', 'Please fill all required fields');
    
//     try {
//       const result = await postLabourRequest({ ...labourData }).unwrap();
//       showAlert('success', `${result.message} | UID: ${result.uid}`);
//       setLabourData(initialFormData);
//     } catch (err) {
//       showAlert('error', err?.data?.message || 'Submit failed');
//     }
//   };

//   // ── Table Filtering ──
//   const filteredRequirements = useMemo(() => {
//     if (!requirementsData) return [];
//     if (!searchTerm) return requirementsData;
//     const s = searchTerm.toLowerCase();
//     return requirementsData.filter(item => item.uid?.toLowerCase().includes(s) || item.Project_Name_1?.toLowerCase().includes(s));
//   }, [requirementsData, searchTerm]);

//   // ── Modal Actions ──
//   const openModal = (item) => {
//     setSelectedItem(item);
//     setFormError('');
//     setModalForm({
//       Status_3: '', Labouar_Contractor_Name_3: '',
//       Labour_Category_1_3: item.Labour_Category_1 || '', Number_Of_Labour_1_3: item.Number_Of_Labour_1 || '', Labour_Rate_1_3: '',
//       Labour_Category_2_3: item.Labour_Category_2 || '', Number_Of_Labour_2_3: item.Number_Of_Labour_2 || '', Labour_Rate_2_3: '',
//       Total_Wages_3: '', Conveyanance_3: '', Contractor_Commission: '', Total_Paid_Amount_3: '',
//       Company_Head_Amount_3: '', Contractor_Head_Amount_3: '', Remark_3: ''
//     });
//     setShowModal(true);
//   };

//   const handleModalChange = (field, value) => {
//     setModalForm(prev => {
//       const newData = { ...prev, [field]: value };
//       if (field === 'Status_3' && value === 'Reject') {
//         newData.Labouar_Contractor_Name_3 = ''; newData.Labour_Rate_1_3 = ''; newData.Labour_Rate_2_3 = '';
//         newData.Total_Wages_3 = ''; newData.Conveyanance_3 = ''; newData.Contractor_Commission = '';
//         newData.Total_Paid_Amount_3 = ''; newData.Company_Head_Amount_3 = ''; newData.Contractor_Head_Amount_3 = '';
//       }
//       return newData;
//     });
//     if (formError) setFormError('');
//   };

// const validateModal = () => {
//   if (!modalForm.Status_3) {
//     setFormError('Select Status');
//     return false;
//   }
//   if (modalForm.Status_3 === 'Reject') return true;

//   // ✅ Labour Contractor Name required (Done mode me)
//   if (!modalForm.Labouar_Contractor_Name_3 || !String(modalForm.Labouar_Contractor_Name_3).trim()) {
//     setFormError('Labour Contractor Name required hai');
//     return false;
//   }

//   if (!isCompanyHeadModal && (!modalForm.Contractor_Head_Amount_3 || !String(modalForm.Contractor_Head_Amount_3).trim())) {
//     setFormError('Contractor Head Amount required');
//     return false;
//   }
//   return true;
// };

//   const handleModalSubmit = async () => {
//     if (!selectedItem || !validateModal()) return;
//     try {
//       let payload = { uid: selectedItem.uid, Status_3: modalForm.Status_3, Remark_3: modalForm.Remark_3 || '' };
//       if (modalForm.Status_3 !== 'Reject') {
//         payload = { ...payload, ...modalForm };
//       }
//       const result = await updateLabourReqManagement(payload).unwrap();
//       showAlert('success', result.message);
//       setShowModal(false);
//       setSelectedItem(null);
//       refetchRequirements(); // Refresh table
//     } catch (err) {
//       showAlert('error', err?.data?.message || 'Update failed');
//     }
//   };

//   return (
//     <div style={{ minHeight: '100vh', background: T.bg, padding: '16px', fontFamily: "'Segoe UI', sans-serif" }}>
//       <div style={{ maxWidth: 1400, margin: '0 auto' }}>

//         <div style={{ background: `${T.gold}15`, border: `1px solid ${T.gold}50`, borderRadius: 12, padding: '10px 14px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
//           <Lock size={16} color={T.goldDark} />
//           <span style={{ fontSize: 13, color: T.goldDark, fontWeight: 600 }}>🔒 Labour Management Access</span>
//         </div>

//         {/* TABS */}
//         <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
//           <button onClick={() => setActiveTab('new')} style={{
//               display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 700,
//               background: activeTab === 'new' ? `linear-gradient(135deg, ${T.navy}, ${T.navyLight})` : T.card,
//               color: activeTab === 'new' ? T.gold : T.textLight, border: activeTab === 'new' ? 'none' : `1px solid ${T.border}`
//             }}><Plus size={16} /> New Request</button>
//           <button onClick={() => setActiveTab('view')} style={{
//               display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 700,
//               background: activeTab === 'view' ? `linear-gradient(135deg, ${T.navy}, ${T.navyLight})` : T.card,
//               color: activeTab === 'view' ? T.gold : T.textLight, border: activeTab === 'view' ? 'none' : `1px solid ${T.border}`
//             }}><Table size={16} /> View Requirements</button>
//         </div>

//         {/* TAB 1: NEW REQUEST */}
//         {activeTab === 'new' && (
//           <div style={{ background: T.card, borderRadius: 14, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
//             <div style={{ background: `linear-gradient(135deg, ${T.navy}, ${T.navyDark})`, padding: '20px 24px', borderBottom: `3px solid ${T.gold}` }}>
//               <h1 style={{ fontSize: 20, fontWeight: 800, color: 'white', margin: 0 }}>Create Labour Request</h1>
//             </div>
//             <form onSubmit={handleSubmitNew} style={{ padding: 24 }}>
//               <FormFields data={labourData} onProjectChange={handleProjectChange} onContractorChange={handleContractorChange} onChange={handleLabourChange} onHeadChange={(val) => setLabourData(prev => ({ ...prev, Head_Of_Contractor_Company_1: val, ...(val !== 'Contractor Head' && { Name_Of_Contractor_1: '', Contractor_Firm_Name_1: '' }) }))} projectOptions={projectOptions} contractorOptions={contractorOptions} labourWorkTypeOptions={labourWorkTypeOptions} labourCategoryOptions={labourCategoryOptions} isContractorHead={isContractorHead} isDropdownLoading={isDropdownLoading} getYesterdayDate={getYesterdayDate} />
//               <div style={{ display: 'flex', gap: 12, paddingTop: 20, borderTop: `1px solid ${T.border}`, marginTop: 20 }}>
//                 <button type="submit" disabled={isSubmittingNew} style={{ flex: 1, padding: '12px 20px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`, color: T.navyDark, fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
//                   {isSubmittingNew ? 'Submitting...' : 'Submit Request'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         )}

//         {/* TAB 2: VIEW REQUIREMENTS (TABLE) */}
//         {activeTab === 'view' && (
//           <div style={{ background: T.card, borderRadius: 14, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
//             <div style={{ background: `linear-gradient(135deg, ${T.navy}, ${T.navyDark})`, padding: '20px 24px', borderBottom: `3px solid ${T.gold}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//               <h1 style={{ fontSize: 20, fontWeight: 800, color: 'white', margin: 0 }}>Manage Labour Requirements</h1>
//               <button onClick={refetchRequirements} style={{ padding: '8px 16px', borderRadius: 8, background: `${T.gold}20`, color: T.gold, border: `1px solid ${T.gold}60`, cursor: 'pointer' }}>Refresh</button>
//             </div>
            
//             <div style={{ padding: '16px 24px' }}>
//               <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', maxWidth: 400, padding: '10px 12px', borderRadius: 8, border: `1.5px solid ${T.border}`, outline: 'none' }} />
//             </div>

//             {isReqLoading ? (
//               <div style={{ padding: 60, textAlign: 'center' }}><Loader2 size={40} color={T.gold} style={{ animation: 'spin 1s linear infinite' }} /></div>
//             ) : filteredRequirements.length === 0 ? (
//               <div style={{ padding: 60, textAlign: 'center' }}><p>No records found.</p></div>
//             ) : (
//               <div style={{ overflowX: 'auto', maxHeight: '65vh' }}>
//                 <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
//                   <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
//                     <tr style={{ background: T.navy }}>
//                       {['Timestamp','UID','Project','Engineer','Work Type','Work Desc', 'Cat 1','No.1','Cat 2','No.2','Total','Date Req','Head', 'Contractor','Firm','Remark','Action'].map((h, i) => (
//                         <th key={i} style={{ padding: '12px 10px', textAlign: 'left', color: T.goldLight, borderBottom: `2px solid ${T.gold}` }}>{h}</th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {filteredRequirements.map((row, idx) => (
//                       <tr key={row.uid || idx} style={{ background: idx % 2 === 0 ? T.card : T.borderLight }}>
//                         <td style={{ padding: '10px' }}>{row.timestamp}</td>
//                         <td style={{ padding: '10px', fontWeight: 'bold' }}>{row.uid}</td>
//                         <td style={{ padding: '10px' }}>{row.Project_Name_1}</td>
//                         <td style={{ padding: '10px' }}>{row.Project_Engineer_1}</td>
//                         <td style={{ padding: '10px' }}>{row.Work_Type_1}</td>
//                         <td style={{ padding: '10px', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.Work_Description_1}</td>
//                         <td style={{ padding: '10px' }}>{row.Labour_Category_1}</td>
//                         <td style={{ padding: '10px', textAlign: 'center' }}>{row.Number_Of_Labour_1}</td>
//                         <td style={{ padding: '10px' }}>{row.Labour_Category_2}</td>
//                         <td style={{ padding: '10px', textAlign: 'center' }}>{row.Number_Of_Labour_2}</td>
//                         <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold', color: T.success }}>{row.Total_Labour_1}</td>
//                         <td style={{ padding: '10px' }}>{row.Date_Of_Required_1}</td>
//                         <td style={{ padding: '10px' }}>{row.Head_Of_Contractor_Company_1}</td>
//                         <td style={{ padding: '10px' }}>{row.Name_Of_Contractor_1}</td>
//                         <td style={{ padding: '10px' }}>{row.Contractor_Firm_Name_1}</td>
//                         <td style={{ padding: '10px', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.Remark_1}</td>
//                         <td style={{ padding: '10px', textAlign: 'center' }}>
//                           <button onClick={() => openModal(row)} style={{ width: 34, height: 34, borderRadius: 8, border: `1.5px solid ${T.gold}40`, background: `${T.gold}10`, color: T.goldDark, cursor: 'pointer' }}>
//                             <Pencil size={15} />
//                           </button>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>
//         )}

//         {/* ═════ MODAL (LABOUR MANAGEMENT STEP) ═════ */}
//         {showModal && selectedItem && (
//           <>
//             <div onClick={() => setShowModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 100 }} />
//             <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '95%', maxWidth: 600, background: T.card, borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', zIndex: 101, display: 'flex', flexDirection: 'column', maxHeight: '92vh' }}>
              
//               <div style={{ background: T.navy, padding: '14px 20px', borderBottom: `2px solid ${T.gold}`, display: 'flex', justifyContent: 'space-between', borderRadius: '14px 14px 0 0' }}>
//                 <div>
//                   <h3 style={{ fontSize: 15, fontWeight: 700, color: 'white', margin: 0 }}>Labour Management Action</h3>
//                   <p style={{ fontSize: 11, color: T.textMuted, margin: 0 }}>UID: <span style={{ color: T.gold }}>{selectedItem.uid}</span> | {selectedItem.Project_Name_1}</p>
//                 </div>
//                 <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><X size={20} /></button>
//               </div>

//               <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
//                 {/* Status */}
//                 <div>
//                   <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>Status <span style={{ color: T.danger }}>*</span></label>
//                   <select value={modalForm.Status_3} onChange={(e) => handleModalChange('Status_3', e.target.value)} style={{ ...inputBase, cursor: 'pointer' }}>
//                     <option value="">-- Select --</option>
//                     <option value="Done">✅ Done</option>
//                     <option value="Reject">❌ Reject</option>
//                   </select>
//                 </div>

//                 {!isRejected && (
//                   <>
//                     <div>
//                       <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>
//   Labour Contractor Name <span style={{ color: T.danger }}>*</span>
// </label>
// <input
//   type="text"
//   value={modalForm.Labouar_Contractor_Name_3}
//   onChange={(e) => handleModalChange('Labouar_Contractor_Name_3', e.target.value)}
//   placeholder="Enter name..."
//   style={inputBase}
// />
//                     </div>

//                     <div style={{ padding: 14, background: `${T.gold}08`, borderRadius: 10, border: `1px dashed ${T.gold}50` }}>
//                       <div style={{ fontSize: 12, fontWeight: 700, color: T.goldDark, marginBottom: 10 }}>Labour Category 1</div>
//                       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
//                         <div><label style={{ display: 'block', fontSize: 11, color: T.navyLight, marginBottom: 4 }}>Category</label><input type="text" value={modalForm.Labour_Category_1_3} disabled style={{ ...inputBase, background: T.borderLight }} /></div>
//                         <div><label style={{ display: 'block', fontSize: 11, color: T.navyLight, marginBottom: 4 }}>No. of Labour</label><input type="number" value={modalForm.Number_Of_Labour_1_3} onChange={(e) => handleModalChange('Number_Of_Labour_1_3', e.target.value)} style={inputBase} /></div>
//                         <div><label style={{ display: 'block', fontSize: 11, color: T.navyLight, marginBottom: 4 }}>Rate (₹)</label><input type="number" value={modalForm.Labour_Rate_1_3} onChange={(e) => handleModalChange('Labour_Rate_1_3', e.target.value)} style={inputBase} /></div>
//                       </div>
//                     </div>

//                     <div style={{ padding: 14, background: `${T.navy}08`, borderRadius: 10, border: `1px dashed ${T.navy}30` }}>
//                       <div style={{ fontSize: 12, fontWeight: 700, color: T.navy, marginBottom: 10 }}>Labour Category 2</div>
//                       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
//                         <div><label style={{ display: 'block', fontSize: 11, color: T.navyLight, marginBottom: 4 }}>Category</label><input type="text" value={modalForm.Labour_Category_2_3} disabled style={{ ...inputBase, background: T.borderLight }} /></div>
//                         <div><label style={{ display: 'block', fontSize: 11, color: T.navyLight, marginBottom: 4 }}>No. of Labour</label><input type="number" value={modalForm.Number_Of_Labour_2_3} onChange={(e) => handleModalChange('Number_Of_Labour_2_3', e.target.value)} style={inputBase} /></div>
//                         <div><label style={{ display: 'block', fontSize: 11, color: T.navyLight, marginBottom: 4 }}>Rate (₹)</label><input type="number" value={modalForm.Labour_Rate_2_3} onChange={(e) => handleModalChange('Labour_Rate_2_3', e.target.value)} style={inputBase} /></div>
//                       </div>
//                     </div>

//                     <div style={{ padding: 14, background: T.successBg, borderRadius: 10, border: `1px solid ${T.successBorder}` }}>
//                       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
//                         <div><label style={{ display: 'block', fontSize: 11, color: T.navyLight, marginBottom: 4 }}>Total Wages (Auto)</label><div style={{ padding: '8px 12px', background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 13, fontWeight: 700, color: T.success }}>₹ {modalForm.Total_Wages_3 || '0'}</div></div>
//                         <div><label style={{ display: 'block', fontSize: 11, color: T.navyLight, marginBottom: 4 }}>Conveyance (₹)</label><input type="number" value={modalForm.Conveyanance_3} onChange={(e) => handleModalChange('Conveyanance_3', e.target.value)} style={inputBase} /></div>
//                         <div style={{ gridColumn: '1 / -1' }}><label style={{ display: 'block', fontSize: 11, color: T.navyLight, marginBottom: 4 }}>Commission (₹)</label><input type="number" value={modalForm.Contractor_Commission} onChange={(e) => handleModalChange('Contractor_Commission', e.target.value)} style={{ ...inputBase, border: `1.5px solid ${T.gold}` }} /></div>
//                         <div style={{ gridColumn: '1 / -1' }}>
//                           <label style={{ display: 'block', fontSize: 11, color: T.navyLight, marginBottom: 4 }}>Total Paid (Auto)</label>
//                           <div style={{ padding: '12px', background: `${T.success}15`, border: `2px solid ${T.success}40`, borderRadius: 8, fontSize: 18, fontWeight: 800, color: T.success, textAlign: 'center' }}>₹ {modalForm.Total_Paid_Amount_3 || '0'}</div>
//                         </div>
//                       </div>
//                     </div>

//                     {/* ✅ FIXED AMOUNT DISTRIBUTION UI */}
//                     <div style={{ padding: 14, background: `${T.purple}08`, borderRadius: 10, border: `1px dashed ${T.purple}40` }}>
//                       <div style={{ fontSize: 12, fontWeight: 700, color: T.purple, marginBottom: 10 }}>Amount Distribution</div>
//                       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
//                         <div>
//                           <label style={{ display: 'block', fontSize: 11, color: T.navyLight, marginBottom: 4 }}>
//                             🏢 Company Head {isCompanyHeadModal && <span style={{ color: T.success }}>(Auto)</span>}
//                           </label>
//                           <input type="number" value={modalForm.Company_Head_Amount_3} disabled style={{ ...inputBase, background: isCompanyHeadModal ? `${T.purple}10` : T.borderLight, fontWeight: 700, color: isCompanyHeadModal ? T.purple : T.textMuted, cursor: 'not-allowed' }} />
//                         </div>
//                         <div>
//                           <label style={{ display: 'block', fontSize: 11, color: T.navyLight, marginBottom: 4 }}>
//                             👷 Contractor Head {!isCompanyHeadModal && <span style={{ color: T.danger }}>*</span>}
//                           </label>
//                           <input type="number" value={isCompanyHeadModal ? '' : modalForm.Contractor_Head_Amount_3} onChange={(e) => handleModalChange('Contractor_Head_Amount_3', e.target.value)} disabled={isCompanyHeadModal} placeholder={isCompanyHeadModal ? 'N/A' : '0'} style={{ ...inputBase, background: isCompanyHeadModal ? T.borderLight : T.card, fontWeight: 700, color: !isCompanyHeadModal ? T.purple : T.textMuted, cursor: isCompanyHeadModal ? 'not-allowed' : 'text' }} />
//                         </div>
//                       </div>
//                     </div>
//                   </>
//                 )}
//                 <div><label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>Remark</label><textarea value={modalForm.Remark_3} onChange={(e) => handleModalChange('Remark_3', e.target.value)} rows={3} style={{ ...inputBase, resize: 'vertical' }} /></div>
//                 {formError && <div style={{ padding: '10px', background: T.dangerBg, color: T.danger, borderRadius: 8, fontSize: 13 }}>{formError}</div>}
//               </div>

//               <div style={{ padding: '14px 20px', borderTop: `1px solid ${T.border}`, background: T.borderLight, borderRadius: '0 0 14px 14px', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
//                 <button onClick={() => setShowModal(false)} style={{ padding: '10px 20px', borderRadius: 8, border: `1.5px solid ${T.border}`, background: T.card, cursor: 'pointer' }}>Cancel</button>
//                 <button onClick={handleModalSubmit} disabled={isUpdatingModal || !modalForm.Status_3} style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`, color: T.navyDark, fontWeight: 700, cursor: 'pointer' }}>
//                   {isUpdatingModal ? 'Submitting...' : 'Submit'}
//                 </button>
//               </div>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// // ── Reusable Form Fields (New Form Ke Liye) ──
// const FormFields = ({ data, onProjectChange, onContractorChange, onChange, onHeadChange, projectOptions, contractorOptions, labourWorkTypeOptions, labourCategoryOptions, isContractorHead, isDropdownLoading, getYesterdayDate }) => {
//   const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: T.navy, marginBottom: 6 };
//   const disabledInput = { ...inputBase, background: T.borderLight, cursor: 'not-allowed', color: T.textLight };

//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
//       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
//         <div>
//           <label style={labelStyle}>Project Name *</label>
//           <select value={data.Project_Name_1} onChange={(e) => onProjectChange(e.target.value)} disabled={isDropdownLoading} style={inputBase}>
//             <option value="">-- Select Project --</option>
//             {projectOptions.map((opt, i) => <option key={i} value={opt.value}>{opt.label}</option>)}
//           </select>
//         </div>
//         <div>
//           <label style={labelStyle}>Project Engineer (auto)</label>
//           <input type="text" readOnly value={data.Project_Engineer_1} style={disabledInput} />
//         </div>
//       </div>
//       <div>
//         <label style={labelStyle}>Work Type *</label>
//         <select value={data.Work_Type_1} onChange={(e) => onChange('Work_Type_1', e.target.value)} style={inputBase}>
//           <option value="">-- Select Work Type --</option>
//           {labourWorkTypeOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
//         </select>
//       </div>
//       <div>
//         <label style={labelStyle}>Work Description *</label>
//         <textarea rows={3} value={data.Work_Description_1} onChange={(e) => onChange('Work_Description_1', e.target.value)} style={{ ...inputBase, resize: 'vertical' }} />
//       </div>
//       <div style={{ padding: 14, background: `${T.gold}08`, borderRadius: 10, border: `1px dashed ${T.gold}60` }}>
//         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
//           <div><label style={labelStyle}>Category 1 *</label><select value={data.Labour_Category_1} onChange={(e) => onChange('Labour_Category_1', e.target.value)} style={inputBase}><option value="">-- Select --</option>{labourCategoryOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}</select></div>
//           <div><label style={labelStyle}>Number 1 *</label><input type="number" min="0" value={data.Number_Of_Labour_1} onChange={(e) => onChange('Number_Of_Labour_1', e.target.value)} style={inputBase} /></div>
//           <div><label style={labelStyle}>Category 2</label><select value={data.Labour_Category_2} onChange={(e) => onChange('Labour_Category_2', e.target.value)} style={inputBase}><option value="">-- Select --</option>{labourCategoryOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}</select></div>
//           <div><label style={labelStyle}>Number 2</label><input type="number" min="0" value={data.Number_Of_Labour_2} onChange={(e) => onChange('Number_Of_Labour_2', e.target.value)} style={inputBase} /></div>
//         </div>
//         <div style={{ marginTop: 12, padding: 12, background: T.card, borderRadius: 8, border: `1px solid ${T.gold}40`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//           <span style={{ fontSize: 12, fontWeight: 700, color: T.navy }}>Total Labour (Auto)</span>
//           <span style={{ fontSize: 22, fontWeight: 800, color: T.goldDark }}>{data.Total_Labour_1 || '0'}</span>
//         </div>
//       </div>
//       <div>
//         <label style={labelStyle}>Date of Required *</label>
//         <input type="date" value={data.Date_Of_Required_1} onChange={(e) => onChange('Date_Of_Required_1', e.target.value)} min={getYesterdayDate()} style={inputBase} />
//       </div>
//       <div style={{ display: 'grid', gridTemplateColumns: isContractorHead ? '1fr 1fr 1fr' : '1fr', gap: 16 }}>
//         <div><label style={labelStyle}>Head *</label><select value={data.Head_Of_Contractor_Company_1} onChange={(e) => onHeadChange(e.target.value)} style={inputBase}><option value="">-- Select --</option><option value="Company Head">Company Head</option><option value="Contractor Head">Contractor Head</option></select></div>
//         {isContractorHead && (
//           <>
//             <div><label style={labelStyle}>Contractor *</label><select value={data.Name_Of_Contractor_1} onChange={(e) => onContractorChange(e.target.value)} style={inputBase}><option value="">-- Select --</option>{contractorOptions.map((opt, i) => <option key={i} value={opt.value}>{opt.label}</option>)}</select></div>
//             <div><label style={labelStyle}>Firm (auto)</label><input type="text" readOnly value={data.Contractor_Firm_Name_1} style={disabledInput} /></div>
//           </>
//         )}
//       </div>
//       <div><label style={labelStyle}>Remark</label><textarea rows={2} value={data.Remark_1} onChange={(e) => onChange('Remark_1', e.target.value)} style={{ ...inputBase, resize: 'vertical' }} /></div>
//     </div>
//   );
// };

// export default LabourRequirementManagement;








import React, { useState, useEffect, useMemo } from 'react';
import { useGetProjectDropdownQuery } from '../../redux/Labour/LabourSlice';
import {
  usePostLabourRequestMutation,          
  useGetLabourRequirementsQuery,         
  useUpdateLabourReqManagementMutation,  
} from '../../redux/formSlice';
import {
  Loader2, Users, Building, User, FileText, Calendar,
  Briefcase, HardHat, MessageSquare, Send, RefreshCw,
  ChevronDown, Wrench, Calculator, Lock, Table, Plus,
  Pencil, X, AlertCircle, RotateCcw, Search,
  IndianRupee, Wallet, XCircle
} from 'lucide-react';

// ── THEME (Navy + Gold) ──
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
const focusGold = (e) => { e.target.style.borderColor = T.gold; e.target.style.boxShadow = `0 0 0 3px ${T.gold}15`; e.target.style.background = T.card; };
const blurNormal = (e) => { e.target.style.borderColor = T.border; e.target.style.boxShadow = 'none'; e.target.style.background = T.borderLight; };

const LabourRequirementManagement = () => {
  const [activeTab, setActiveTab] = useState('new'); 
  const [searchTerm, setSearchTerm] = useState('');

  const getYesterdayDate = () => {
    const d = new Date(); d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  };

  // ── API Hooks ──
  const { data: dropdownData, isLoading: isDropdownLoading } = useGetProjectDropdownQuery();
  const safeDropdown = Array.isArray(dropdownData) ? dropdownData : [];
  
  const [postLabourRequest, { isLoading: isSubmittingNew }] = usePostLabourRequestMutation();

  const {
    data: requirementsData,
    isLoading: isReqLoading,
    isFetching: isReqFetching,
    refetch: refetchRequirements,
  } = useGetLabourRequirementsQuery(undefined, { skip: activeTab !== 'view' });

  const [updateLabourReqManagement, { isLoading: isUpdatingModal }] = useUpdateLabourReqManagementMutation();

  // ── State: New Request Form ──
  const initialFormData = {
    Project_Name_1: '', Project_Engineer_1: '', Work_Type_1: '',
    Work_Description_1: '', Labour_Category_1: '', Number_Of_Labour_1: '',
    Labour_Category_2: '', Number_Of_Labour_2: '', Total_Labour_1: '',
    Date_Of_Required_1: '', Head_Of_Contractor_Company_1: '',
    Name_Of_Contractor_1: '', Contractor_Firm_Name_1: '', Remark_1: '',
  };
  const [labourData, setLabourData] = useState(initialFormData);

  // ── State: Edit Modal ──
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalForm, setModalForm] = useState({
    Status_3: '', Labouar_Contractor_Name_3: '', Labour_Category_1_3: '', Number_Of_Labour_1_3: '',
    Labour_Rate_1_3: '', Labour_Category_2_3: '', Number_Of_Labour_2_3: '', Labour_Rate_2_3: '',
    Total_Wages_3: '', Conveyanance_3: '', Contractor_Commission: '', Total_Paid_Amount_3: '',
    Company_Head_Amount_3: '', Contractor_Head_Amount_3: '', Remark_3: ''
  });
  const [formError, setFormError] = useState('');

  const isContractorHead = labourData.Head_Of_Contractor_Company_1 === 'Contractor Head';
  const isRejected = modalForm.Status_3 === 'Reject';
  const isCompanyHeadModal = selectedItem?.Head_Of_Contractor_Company_1 === 'Company Head';

  // ── Auto Total (New Form) ──
  useEffect(() => {
    const l1 = parseInt(labourData.Number_Of_Labour_1) || 0;
    const l2 = parseInt(labourData.Number_Of_Labour_2) || 0;
    setLabourData(prev => ({ ...prev, Total_Labour_1: (l1 + l2).toString() }));
  }, [labourData.Number_Of_Labour_1, labourData.Number_Of_Labour_2]);

  // ── Auto Calculate (Modal Form) ──
  useEffect(() => {
    if (isRejected) return;
    const num1 = parseFloat(modalForm.Number_Of_Labour_1_3) || 0;
    const rate1 = parseFloat(modalForm.Labour_Rate_1_3) || 0;
    const num2 = parseFloat(modalForm.Number_Of_Labour_2_3) || 0;
    const rate2 = parseFloat(modalForm.Labour_Rate_2_3) || 0;
    const conv = parseFloat(modalForm.Conveyanance_3) || 0;
    const comm = parseFloat(modalForm.Contractor_Commission) || 0;
    
    const totalWages = (num1 * rate1) + (num2 * rate2);
    const totalPaid = totalWages + conv + comm;
    
    const totalPaidStr = totalPaid > 0 ? totalPaid.toString() : '';

    setModalForm(prev => ({
      ...prev,
      Total_Wages_3: totalWages > 0 ? totalWages.toString() : '',
      Total_Paid_Amount_3: totalPaidStr,
      Company_Head_Amount_3: isCompanyHeadModal ? totalPaidStr : '',
      Contractor_Head_Amount_3: !isCompanyHeadModal ? totalPaidStr : ''
    }));
  }, [modalForm.Number_Of_Labour_1_3, modalForm.Labour_Rate_1_3, modalForm.Number_Of_Labour_2_3, modalForm.Labour_Rate_2_3, modalForm.Conveyanance_3, modalForm.Contractor_Commission, isRejected, isCompanyHeadModal]);

  // ── Dropdown Options ──
  const projectOptions = useMemo(() => {
    const seen = new Set();
    return safeDropdown.filter(item => (item.projectName || '').trim() && (item.projectName || '').trim() !== '(No Project Name)')
      .reduce((acc, item) => {
        const name = item.projectName.trim();
        if (!seen.has(name.toLowerCase())) {
          seen.add(name.toLowerCase());
          acc.push({ value: name, label: item.label || name, engineer: item.engineer || '' });
        }
        return acc;
      }, []).sort((a, b) => a.label.localeCompare(b.label));
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

  const labourWorkTypeOptions = useMemo(() => [...new Set(safeDropdown.map(i => (i.labourWorkType || '').trim()).filter(Boolean))].sort(), [safeDropdown]);
  const labourCategoryOptions = useMemo(() => [...new Set(safeDropdown.map(i => (i.labourCategory || '').trim()).filter(Boolean))].sort(), [safeDropdown]);

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
  const showAlert = (type, msg) => alert(`${type === 'success' ? '✅' : '❌'} ${msg}`);

  const handleSubmitNew = async (e) => {
    e.preventDefault();
    if (!labourData.Project_Name_1 || !labourData.Work_Type_1 || !labourData.Work_Description_1.trim()) 
      return showAlert('error', 'Please fill all required fields');
    
    try {
      const result = await postLabourRequest({ ...labourData }).unwrap();
      showAlert('success', `${result.message} | UID: ${result.uid}`);
      setLabourData(initialFormData);
    } catch (err) {
      showAlert('error', err?.data?.message || 'Submit failed');
    }
  };

  // ── Table Filtering (✅ FILTERS ON W COLUMN: 'Status_3') ──
  const filteredRequirements = useMemo(() => {
    if (!requirementsData) return [];
    
    // 1. Hide rows where Column W ('Status_3') is 'done' or 'reject'
    let data = requirementsData.filter(item => {
      const statusW = (item.Status_3 || '').toString().trim().toLowerCase();
      return statusW !== 'done' && statusW !== 'reject';
    });

    // 2. Search box filter
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      data = data.filter(item => 
        item.uid?.toLowerCase().includes(s) || 
        item.Project_Name_1?.toLowerCase().includes(s)
      );
    }
    return data;
  }, [requirementsData, searchTerm]);

  // ── Modal Actions ──
  const openModal = (item) => {
    setSelectedItem(item);
    setFormError('');
    setModalForm({
      Status_3: '', Labouar_Contractor_Name_3: '',
      Labour_Category_1_3: item.Labour_Category_1 || '', Number_Of_Labour_1_3: item.Number_Of_Labour_1 || '', Labour_Rate_1_3: '',
      Labour_Category_2_3: item.Labour_Category_2 || '', Number_Of_Labour_2_3: item.Number_Of_Labour_2 || '', Labour_Rate_2_3: '',
      Total_Wages_3: '', Conveyanance_3: '', Contractor_Commission: '', Total_Paid_Amount_3: '',
      Company_Head_Amount_3: '', Contractor_Head_Amount_3: '', Remark_3: ''
    });
    setShowModal(true);
  };

  const handleModalChange = (field, value) => {
    setModalForm(prev => {
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

  // ✅ VALIDATION: Labour Contractor Name is REQUIRED
  const validateModal = () => {
    if (!modalForm.Status_3) { 
      setFormError('Status select karna zaroori hai'); 
      return false; 
    }
    
    if (modalForm.Status_3 === 'Reject') return true; // Skip baaki checks if Reject
    
    if (!modalForm.Labouar_Contractor_Name_3 || !String(modalForm.Labouar_Contractor_Name_3).trim()) {
      setFormError('Labour Contractor Name is Required'); 
      return false;
    }

    if (!isCompanyHeadModal && (!modalForm.Contractor_Head_Amount_3 || !String(modalForm.Contractor_Head_Amount_3).trim())) {
      setFormError('Contractor Head Amount is Required'); 
      return false;
    }
    return true;
  };

  const handleModalSubmit = async () => {
    if (!selectedItem || !validateModal()) return;
    try {
      let payload = { uid: selectedItem.uid, Status_3: modalForm.Status_3, Remark_3: modalForm.Remark_3 || '' };
      if (modalForm.Status_3 !== 'Reject') {
        payload = { ...payload, ...modalForm };
      }
      const result = await updateLabourReqManagement(payload).unwrap();
      showAlert('success', result.message);
      setShowModal(false);
      setSelectedItem(null);
      refetchRequirements(); // Refresh table automatically
    } catch (err) {
      showAlert('error', err?.data?.message || 'Update failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: T.bg, padding: '16px', fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>

        <div style={{ background: `${T.gold}15`, border: `1px solid ${T.gold}50`, borderRadius: 12, padding: '10px 14px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Lock size={16} color={T.goldDark} />
          <span style={{ fontSize: 13, color: T.goldDark, fontWeight: 600 }}>🔒 Labour Management Access</span>
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button onClick={() => setActiveTab('new')} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 700,
              background: activeTab === 'new' ? `linear-gradient(135deg, ${T.navy}, ${T.navyLight})` : T.card,
              color: activeTab === 'new' ? T.gold : T.textLight, border: activeTab === 'new' ? 'none' : `1px solid ${T.border}`
            }}><Plus size={16} /> New Request</button>
          <button onClick={() => setActiveTab('view')} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 700,
              background: activeTab === 'view' ? `linear-gradient(135deg, ${T.navy}, ${T.navyLight})` : T.card,
              color: activeTab === 'view' ? T.gold : T.textLight, border: activeTab === 'view' ? 'none' : `1px solid ${T.border}`
            }}><Table size={16} /> View Requirements</button>
        </div>

        {/* TAB 1: NEW REQUEST */}
        {activeTab === 'new' && (
          <div style={{ background: T.card, borderRadius: 14, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
            <div style={{ background: `linear-gradient(135deg, ${T.navy}, ${T.navyDark})`, padding: '20px 24px', borderBottom: `3px solid ${T.gold}` }}>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: 'white', margin: 0 }}>Create Labour Request</h1>
            </div>
            <form onSubmit={handleSubmitNew} style={{ padding: 24 }}>
              <FormFields data={labourData} onProjectChange={handleProjectChange} onContractorChange={handleContractorChange} onChange={handleLabourChange} onHeadChange={(val) => setLabourData(prev => ({ ...prev, Head_Of_Contractor_Company_1: val, ...(val !== 'Contractor Head' && { Name_Of_Contractor_1: '', Contractor_Firm_Name_1: '' }) }))} projectOptions={projectOptions} contractorOptions={contractorOptions} labourWorkTypeOptions={labourWorkTypeOptions} labourCategoryOptions={labourCategoryOptions} isContractorHead={isContractorHead} isDropdownLoading={isDropdownLoading} getYesterdayDate={getYesterdayDate} />
              <div style={{ display: 'flex', gap: 12, paddingTop: 20, borderTop: `1px solid ${T.border}`, marginTop: 20 }}>
                <button type="submit" disabled={isSubmittingNew} style={{ flex: 1, padding: '12px 20px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`, color: T.navyDark, fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {isSubmittingNew ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: VIEW REQUIREMENTS (TABLE) */}
        {activeTab === 'view' && (
          <div style={{ background: T.card, borderRadius: 14, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
            <div style={{ background: `linear-gradient(135deg, ${T.navy}, ${T.navyDark})`, padding: '20px 24px', borderBottom: `3px solid ${T.gold}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: 'white', margin: 0 }}>Manage Labour Requirements</h1>
              <button onClick={refetchRequirements} style={{ padding: '8px 16px', borderRadius: 8, background: `${T.gold}20`, color: T.gold, border: `1px solid ${T.gold}60`, cursor: 'pointer' }}>Refresh</button>
            </div>
            
            <div style={{ padding: '16px 24px' }}>
              <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', maxWidth: 400, padding: '10px 12px', borderRadius: 8, border: `1.5px solid ${T.border}`, outline: 'none' }} />
            </div>

            {isReqLoading ? (
              <div style={{ padding: 60, textAlign: 'center' }}><Loader2 size={40} color={T.gold} style={{ animation: 'spin 1s linear infinite' }} /></div>
            ) : filteredRequirements.length === 0 ? (
              <div style={{ padding: 60, textAlign: 'center' }}><p>No pending requirements.</p></div>
            ) : (
              <div style={{ overflowX: 'auto', maxHeight: '65vh' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                    <tr style={{ background: T.navy }}>
                      {['Timestamp','UID','Project','Engineer','Work Type','Work Desc', 'Cat 1','No.1','Cat 2','No.2','Total','Date Req','Head', 'Contractor','Firm','Remark','Action'].map((h, i) => (
                        <th key={i} style={{ padding: '12px 10px', textAlign: 'left', color: T.goldLight, borderBottom: `2px solid ${T.gold}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequirements.map((row, idx) => (
                      <tr key={row.uid || idx} style={{ background: idx % 2 === 0 ? T.card : T.borderLight }}>
                        <td style={{ padding: '10px' }}>{row.timestamp}</td>
                        <td style={{ padding: '10px', fontWeight: 'bold' }}>{row.uid}</td>
                        <td style={{ padding: '10px' }}>{row.Project_Name_1}</td>
                        <td style={{ padding: '10px' }}>{row.Project_Engineer_1}</td>
                        <td style={{ padding: '10px' }}>{row.Work_Type_1}</td>
                        <td style={{ padding: '10px', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.Work_Description_1}</td>
                        <td style={{ padding: '10px' }}>{row.Labour_Category_1}</td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>{row.Number_Of_Labour_1}</td>
                        <td style={{ padding: '10px' }}>{row.Labour_Category_2}</td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>{row.Number_Of_Labour_2}</td>
                        <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold', color: T.success }}>{row.Total_Labour_1}</td>
                        <td style={{ padding: '10px' }}>{row.Date_Of_Required_1}</td>
                        <td style={{ padding: '10px' }}>{row.Head_Of_Contractor_Company_1}</td>
                        <td style={{ padding: '10px' }}>{row.Name_Of_Contractor_1}</td>
                        <td style={{ padding: '10px' }}>{row.Contractor_Firm_Name_1}</td>
                        <td style={{ padding: '10px', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.Remark_1}</td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          <button onClick={() => openModal(row)} style={{ width: 34, height: 34, borderRadius: 8, border: `1.5px solid ${T.gold}40`, background: `${T.gold}10`, color: T.goldDark, cursor: 'pointer' }}>
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
        )}

        {/* ═════ MODAL (LABOUR MANAGEMENT STEP) ═════ */}
        {showModal && selectedItem && (
          <>
            <div onClick={() => setShowModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 100 }} />
            <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '95%', maxWidth: 600, background: T.card, borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', zIndex: 101, display: 'flex', flexDirection: 'column', maxHeight: '92vh' }}>
              
              <div style={{ background: T.navy, padding: '14px 20px', borderBottom: `2px solid ${T.gold}`, display: 'flex', justifyContent: 'space-between', borderRadius: '14px 14px 0 0' }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: 'white', margin: 0 }}>Labour Management Action</h3>
                  <p style={{ fontSize: 11, color: T.textMuted, margin: 0 }}>UID: <span style={{ color: T.gold }}>{selectedItem.uid}</span> | {selectedItem.Project_Name_1}</p>
                </div>
                <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><X size={20} /></button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Status */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>Status <span style={{ color: T.danger }}>*</span></label>
                  <select value={modalForm.Status_3} onChange={(e) => handleModalChange('Status_3', e.target.value)} style={{ ...inputBase, cursor: 'pointer' }}>
                    <option value="">-- Select --</option>
                    <option value="Done">✅ Done</option>
                    <option value="Reject">❌ Reject</option>
                  </select>
                </div>

                {!isRejected && (
                  <>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>
                        Labour Contractor Name <span style={{ color: T.danger }}>*</span>
                      </label>
                      <input type="text" value={modalForm.Labouar_Contractor_Name_3} onChange={(e) => handleModalChange('Labouar_Contractor_Name_3', e.target.value)} placeholder="Enter name..." style={inputBase} />
                    </div>

                    <div style={{ padding: 14, background: `${T.gold}08`, borderRadius: 10, border: `1px dashed ${T.gold}50` }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: T.goldDark, marginBottom: 10 }}>Labour Category 1</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                        <div><label style={{ display: 'block', fontSize: 11, color: T.navyLight, marginBottom: 4 }}>Category</label><input type="text" value={modalForm.Labour_Category_1_3} disabled style={{ ...inputBase, background: T.borderLight }} /></div>
                        <div><label style={{ display: 'block', fontSize: 11, color: T.navyLight, marginBottom: 4 }}>No. of Labour</label><input type="number" value={modalForm.Number_Of_Labour_1_3} onChange={(e) => handleModalChange('Number_Of_Labour_1_3', e.target.value)} style={inputBase} /></div>
                        <div><label style={{ display: 'block', fontSize: 11, color: T.navyLight, marginBottom: 4 }}>Rate (₹)</label><input type="number" value={modalForm.Labour_Rate_1_3} onChange={(e) => handleModalChange('Labour_Rate_1_3', e.target.value)} style={inputBase} /></div>
                      </div>
                    </div>

                    <div style={{ padding: 14, background: `${T.navy}08`, borderRadius: 10, border: `1px dashed ${T.navy}30` }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: T.navy, marginBottom: 10 }}>Labour Category 2</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                        <div><label style={{ display: 'block', fontSize: 11, color: T.navyLight, marginBottom: 4 }}>Category</label><input type="text" value={modalForm.Labour_Category_2_3} disabled style={{ ...inputBase, background: T.borderLight }} /></div>
                        <div><label style={{ display: 'block', fontSize: 11, color: T.navyLight, marginBottom: 4 }}>No. of Labour</label><input type="number" value={modalForm.Number_Of_Labour_2_3} onChange={(e) => handleModalChange('Number_Of_Labour_2_3', e.target.value)} style={inputBase} /></div>
                        <div><label style={{ display: 'block', fontSize: 11, color: T.navyLight, marginBottom: 4 }}>Rate (₹)</label><input type="number" value={modalForm.Labour_Rate_2_3} onChange={(e) => handleModalChange('Labour_Rate_2_3', e.target.value)} style={inputBase} /></div>
                      </div>
                    </div>

                    <div style={{ padding: 14, background: T.successBg, borderRadius: 10, border: `1px solid ${T.successBorder}` }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div><label style={{ display: 'block', fontSize: 11, color: T.navyLight, marginBottom: 4 }}>Total Wages (Auto)</label><div style={{ padding: '8px 12px', background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 13, fontWeight: 700, color: T.success }}>₹ {modalForm.Total_Wages_3 || '0'}</div></div>
                        <div><label style={{ display: 'block', fontSize: 11, color: T.navyLight, marginBottom: 4 }}>Conveyance (₹)</label><input type="number" value={modalForm.Conveyanance_3} onChange={(e) => handleModalChange('Conveyanance_3', e.target.value)} style={inputBase} /></div>
                        <div style={{ gridColumn: '1 / -1' }}><label style={{ display: 'block', fontSize: 11, color: T.navyLight, marginBottom: 4 }}>Commission (₹)</label><input type="number" value={modalForm.Contractor_Commission} onChange={(e) => handleModalChange('Contractor_Commission', e.target.value)} style={{ ...inputBase, border: `1.5px solid ${T.gold}` }} /></div>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ display: 'block', fontSize: 11, color: T.navyLight, marginBottom: 4 }}>Total Paid (Auto)</label>
                          <div style={{ padding: '12px', background: `${T.success}15`, border: `2px solid ${T.success}40`, borderRadius: 8, fontSize: 18, fontWeight: 800, color: T.success, textAlign: 'center' }}>₹ {modalForm.Total_Paid_Amount_3 || '0'}</div>
                        </div>
                      </div>
                    </div>

                    {/* Amount Distribution UI */}
                    <div style={{ padding: 14, background: `${T.purple}08`, borderRadius: 10, border: `1px dashed ${T.purple}40` }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: T.purple, marginBottom: 10 }}>Amount Distribution</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: 11, color: T.navyLight, marginBottom: 4 }}>
                            🏢 Company Head {isCompanyHeadModal && <span style={{ color: T.success }}>(Auto)</span>}
                          </label>
                          <input type="number" value={modalForm.Company_Head_Amount_3} disabled style={{ ...inputBase, background: isCompanyHeadModal ? `${T.purple}10` : T.borderLight, fontWeight: 700, color: isCompanyHeadModal ? T.purple : T.textMuted, cursor: 'not-allowed' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: 11, color: T.navyLight, marginBottom: 4 }}>
                            👷 Contractor Head {!isCompanyHeadModal && <span style={{ color: T.danger }}>*</span>}
                          </label>
                          <input type="number" value={isCompanyHeadModal ? '' : modalForm.Contractor_Head_Amount_3} onChange={(e) => handleModalChange('Contractor_Head_Amount_3', e.target.value)} disabled={isCompanyHeadModal} placeholder={isCompanyHeadModal ? 'N/A' : '0'} style={{ ...inputBase, background: isCompanyHeadModal ? T.borderLight : T.card, fontWeight: 700, color: !isCompanyHeadModal ? T.purple : T.textMuted, cursor: isCompanyHeadModal ? 'not-allowed' : 'text' }} />
                        </div>
                      </div>
                    </div>
                  </>
                )}
                <div><label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>Remark</label><textarea value={modalForm.Remark_3} onChange={(e) => handleModalChange('Remark_3', e.target.value)} rows={3} style={{ ...inputBase, resize: 'vertical' }} /></div>
                
                {/* 🔴 VALIDATION ERROR MESSAGE */}
                {formError && <div style={{ padding: '10px', background: T.dangerBg, color: T.danger, borderRadius: 8, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}><AlertCircle size={16} /> {formError}</div>}
              </div>

              <div style={{ padding: '14px 20px', borderTop: `1px solid ${T.border}`, background: T.borderLight, borderRadius: '0 0 14px 14px', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button onClick={() => setShowModal(false)} style={{ padding: '10px 20px', borderRadius: 8, border: `1.5px solid ${T.border}`, background: T.card, cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleModalSubmit} disabled={isUpdatingModal || !modalForm.Status_3} style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`, color: T.navyDark, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {isUpdatingModal ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Submitting...</> : <><Send size={15} /> Submit</>}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ── Reusable Form Fields (New Form Ke Liye) ──
const FormFields = ({ data, onProjectChange, onContractorChange, onChange, onHeadChange, projectOptions, contractorOptions, labourWorkTypeOptions, labourCategoryOptions, isContractorHead, isDropdownLoading, getYesterdayDate }) => {
  const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: T.navy, marginBottom: 6 };
  const disabledInput = { ...inputBase, background: T.borderLight, cursor: 'not-allowed', color: T.textLight };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label style={labelStyle}>Project Name *</label>
          <select value={data.Project_Name_1} onChange={(e) => onProjectChange(e.target.value)} disabled={isDropdownLoading} style={inputBase}>
            <option value="">-- Select Project --</option>
            {projectOptions.map((opt, i) => <option key={i} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Project Engineer (auto)</label>
          <input type="text" readOnly value={data.Project_Engineer_1} style={disabledInput} />
        </div>
      </div>
      <div>
        <label style={labelStyle}>Work Type *</label>
        <select value={data.Work_Type_1} onChange={(e) => onChange('Work_Type_1', e.target.value)} style={inputBase}>
          <option value="">-- Select Work Type --</option>
          {labourWorkTypeOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
        </select>
      </div>
      <div>
        <label style={labelStyle}>Work Description *</label>
        <textarea rows={3} value={data.Work_Description_1} onChange={(e) => onChange('Work_Description_1', e.target.value)} style={{ ...inputBase, resize: 'vertical' }} />
      </div>
      <div style={{ padding: 14, background: `${T.gold}08`, borderRadius: 10, border: `1px dashed ${T.gold}60` }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div><label style={labelStyle}>Category 1 *</label><select value={data.Labour_Category_1} onChange={(e) => onChange('Labour_Category_1', e.target.value)} style={inputBase}><option value="">-- Select --</option>{labourCategoryOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}</select></div>
          <div><label style={labelStyle}>Number 1 *</label><input type="number" min="0" value={data.Number_Of_Labour_1} onChange={(e) => onChange('Number_Of_Labour_1', e.target.value)} style={inputBase} /></div>
          <div><label style={labelStyle}>Category 2</label><select value={data.Labour_Category_2} onChange={(e) => onChange('Labour_Category_2', e.target.value)} style={inputBase}><option value="">-- Select --</option>{labourCategoryOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}</select></div>
          <div><label style={labelStyle}>Number 2</label><input type="number" min="0" value={data.Number_Of_Labour_2} onChange={(e) => onChange('Number_Of_Labour_2', e.target.value)} style={inputBase} /></div>
        </div>
        <div style={{ marginTop: 12, padding: 12, background: T.card, borderRadius: 8, border: `1px solid ${T.gold}40`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: T.navy }}>Total Labour (Auto)</span>
          <span style={{ fontSize: 22, fontWeight: 800, color: T.goldDark }}>{data.Total_Labour_1 || '0'}</span>
        </div>
      </div>
      <div>
        <label style={labelStyle}>Date of Required *</label>
        <input type="date" value={data.Date_Of_Required_1} onChange={(e) => onChange('Date_Of_Required_1', e.target.value)} min={getYesterdayDate()} style={inputBase} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: isContractorHead ? '1fr 1fr 1fr' : '1fr', gap: 16 }}>
        <div><label style={labelStyle}>Head *</label><select value={data.Head_Of_Contractor_Company_1} onChange={(e) => onHeadChange(e.target.value)} style={inputBase}><option value="">-- Select --</option><option value="Company Head">Company Head</option><option value="Contractor Head">Contractor Head</option></select></div>
        {isContractorHead && (
          <>
            <div><label style={labelStyle}>Contractor *</label><select value={data.Name_Of_Contractor_1} onChange={(e) => onContractorChange(e.target.value)} style={inputBase}><option value="">-- Select --</option>{contractorOptions.map((opt, i) => <option key={i} value={opt.value}>{opt.label}</option>)}</select></div>
            <div><label style={labelStyle}>Firm (auto)</label><input type="text" readOnly value={data.Contractor_Firm_Name_1} style={disabledInput} /></div>
          </>
        )}
      </div>
      <div><label style={labelStyle}>Remark</label><textarea rows={2} value={data.Remark_1} onChange={(e) => onChange('Remark_1', e.target.value)} style={{ ...inputBase, resize: 'vertical' }} /></div>
    </div>
  );
};

export default LabourRequirementManagement;