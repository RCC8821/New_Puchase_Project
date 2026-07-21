// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   ArrowLeft, HardHat, Loader2, AlertCircle,
//   CheckCircle, Save, RotateCcw, Search, Package,
//   Edit3, X, Calendar,
// } from 'lucide-react';
// import axios from 'axios';
// import Swal from 'sweetalert2';

// // ─── THEME (Navy + Gold) ─────────────────────────────────
// const T = {
//   navy: '#1e293b', navyLight: '#334155', navyDark: '#0f172a',
//   gold: '#f59e0b', goldLight: '#fbbf24', goldDark: '#d97706',
//   bg: '#f8fafc', card: '#ffffff',
//   text: '#1e293b', textLight: '#64748b', textMuted: '#94a3b8',
//   border: '#e2e8f0', borderLight: '#f1f5f9',
//   success: '#10b981', successBg: '#ecfdf5', successBorder: '#a7f3d0',
//   danger: '#ef4444', dangerBg: '#fef2f2', dangerBorder: '#fecaca',
//   warning: '#f59e0b', warningBg: '#fffbeb',
// };

// const cellStyle = {
//   padding: '10px',
//   color: T.text,
//   fontSize: 12,
//   verticalAlign: 'middle',
//   borderRight: `1px solid ${T.borderLight}`,
// };

// const SiteEngineer = () => {
//   const navigate = useNavigate();
//   const engineerName = sessionStorage.getItem('engineerName') || 'Admin';

//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [updatingRow, setUpdatingRow] = useState(null);

//   // ✅ Modal State
//   const [modalOpen, setModalOpen] = useState(false);
//   const [selectedRow, setSelectedRow] = useState(null);
//   const [selectedIndex, setSelectedIndex] = useState(null);
//   const [modalData, setModalData] = useState({
//     status: '',
//     quantity: '',
//     remarks: '',
//   });

//   // ─── FETCH DATA ────────────────────────────────────────
//   const fetchData = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const res = await axios.get(
//         `${import.meta.env.VITE_BACKEND_URL}/api/signature/site-engineer-data/${encodeURIComponent(engineerName)}`
//       );
//       setData(res.data.data);
//     } catch (err) {
//       setError(err.response?.data?.error || 'Failed to load data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   // ─── OPEN MODAL ────────────────────────────────────────
//   const openModal = (row, index) => {
//     setSelectedRow(row);
//     setSelectedIndex(index);
//     setModalData({
//       status: row.existingStatus || '',
//       quantity: row.existingQuantity || '',
//       remarks: row.existingRemarks || '',
//     });
//     setModalOpen(true);
//   };

//   // ─── CLOSE MODAL ───────────────────────────────────────
//   const closeModal = () => {
//     setModalOpen(false);
//     setSelectedRow(null);
//     setSelectedIndex(null);
//     setModalData({ status: '', quantity: '', remarks: '' });
//   };

//   // ─── HANDLE SAVE FROM MODAL ────────────────────────────
//   const handleSave = async () => {
//     if (!modalData.status) {
//       Swal.fire({
//         icon: 'warning',
//         title: 'Status Required',
//         text: 'Please select a status.',
//         confirmButtonColor: T.gold,
//       });
//       return;
//     }
//     if (!modalData.quantity) {
//       Swal.fire({
//         icon: 'warning',
//         title: 'Quantity Required',
//         text: 'Please enter quantity.',
//         confirmButtonColor: T.gold,
//       });
//       return;
//     }
//     if (!modalData.remarks) {
//       Swal.fire({
//         icon: 'warning',
//         title: 'Remarks Required',
//         text: 'Please enter remarks.',
//         confirmButtonColor: T.gold,
//       });
//       return;
//     }

//     setUpdatingRow(selectedRow.rowNumber);

//     try {
//       await axios.post(
//         `${import.meta.env.VITE_BACKEND_URL}/api/signature/site-engineer-update`,
//         {
//           rowNumber: selectedRow.rowNumber,
//           status: modalData.status,
//           quantity: modalData.quantity,
//           remarks: modalData.remarks,
//         }
//       );

//       await Swal.fire({
//         icon: 'success',
//         title: 'Saved Successfully! ✅',
//         html: `
//           <div style="text-align: left; padding: 10px 0;">
//             <p style="margin: 4px 0; font-size: 13px;">
//               <strong>UID:</strong>
//               <span style="color: ${T.goldDark}; font-weight: 700;">${selectedRow.uid}</span>
//             </p>
//             <p style="margin: 4px 0; font-size: 13px;">
//               <strong>Status:</strong>
//               <span style="color: ${T.success}; font-weight: 700;">${modalData.status}</span>
//             </p>
//           </div>
//         `,
//         confirmButtonText: 'OK',
//         confirmButtonColor: T.gold,
//         timer: 3000,
//         timerProgressBar: true,
//       });

//       // ✅ Update state
//       const updated = [...data];
//       updated[selectedIndex].existingStatus = modalData.status;
//       updated[selectedIndex].existingQuantity = modalData.quantity;
//       updated[selectedIndex].existingRemarks = modalData.remarks;
//       setData(updated);

//       closeModal();

//     } catch (err) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Save Failed!',
//         text: err.response?.data?.error || 'Something went wrong',
//         confirmButtonColor: T.danger,
//       });
//     } finally {
//       setUpdatingRow(null);
//     }
//   };

//   // ─── FILTERED DATA ─────────────────────────────────────
//   const filteredData = data.filter(item => {
//     if (!searchTerm) return true;
//     const term = searchTerm.toLowerCase();
//     return (
//       item.uid.toLowerCase().includes(term) ||
//       item.reqNo.toLowerCase().includes(term) ||
//       item.materialName.toLowerCase().includes(term) ||
//       item.location.toLowerCase().includes(term) ||
//       item.activity.toLowerCase().includes(term)
//     );
//   });

//   const getStatusColor = (status) => {
//     switch (status?.toLowerCase()) {
//       case 'approved': return { bg: T.successBg, color: T.success, border: T.successBorder };
//       case 'pending': return { bg: T.warningBg, color: T.warning, border: '#fde68a' };
//       case 'received': return { bg: `${T.gold}15`, color: T.goldDark, border: `${T.gold}40` };
//       default: return { bg: T.borderLight, color: T.textMuted, border: T.border };
//     }
//   };

//   // ─── LOADING / ERROR ──────────────────────────────────
//   if (loading) {
//     return (
//       <div style={{ padding: 60, textAlign: 'center' }}>
//         <div style={{
//           width: 56, height: 56, borderRadius: 14,
//           background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`,
//           display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
//           marginBottom: 20, boxShadow: `0 0 0 3px ${T.gold}30`,
//         }}>
//           <Loader2 size={28} color={T.gold} style={{ animation: 'spin 1s linear infinite' }} />
//         </div>
//         <p style={{ fontSize: 15, fontWeight: 600, color: T.navy, marginBottom: 4 }}>
//           Loading your data...
//         </p>
//         <p style={{ fontSize: 13, color: T.textMuted }}>
//           Fetching tasks for {engineerName}
//         </p>
//         <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div style={{ padding: 60, textAlign: 'center' }}>
//         <AlertCircle size={40} color={T.danger} />
//         <p style={{ marginTop: 12, color: T.danger, fontWeight: 600 }}>{error}</p>
//         <button onClick={fetchData} style={{
//           marginTop: 16, padding: '10px 20px', borderRadius: 8,
//           border: 'none',
//           background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
//           color: T.navyDark, fontWeight: 600, cursor: 'pointer',
//         }}>
//           <RotateCcw size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
//           Retry
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div style={{ maxWidth: '100%', margin: '0 auto', padding: '0 8px' }}>

//       {/* Back Button */}
//       <button
//         onClick={() => navigate('/dashboard/heritage')}
//         style={{
//           display: 'flex', alignItems: 'center', gap: 6,
//           padding: '8px 14px', borderRadius: 8,
//           border: `1px solid ${T.border}`, background: T.card,
//           color: T.textLight, fontSize: 13, fontWeight: 500,
//           cursor: 'pointer', marginBottom: 16,
//         }}
//         onMouseEnter={(e) => {
//           e.currentTarget.style.borderColor = T.gold;
//           e.currentTarget.style.color = T.goldDark;
//           e.currentTarget.style.background = `${T.gold}08`;
//         }}
//         onMouseLeave={(e) => {
//           e.currentTarget.style.borderColor = T.border;
//           e.currentTarget.style.color = T.textLight;
//           e.currentTarget.style.background = T.card;
//         }}
//       >
//         <ArrowLeft size={14} /> Back to Heritage
//       </button>

//       {/* Header Card */}
//       <div style={{
//         background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`,
//         borderRadius: 14,
//         padding: 'clamp(16px, 3vw, 24px)',
//         marginBottom: 16,
//         color: 'white',
//         boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
//         position: 'relative',
//         overflow: 'hidden',
//       }}>
//         <div style={{
//           position: 'absolute',
//           top: 0, left: 0, right: 0, height: 3,
//           background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)`,
//         }} />

//         <div style={{
//           display: 'flex', alignItems: 'center',
//           justifyContent: 'space-between',
//           flexWrap: 'wrap', gap: 12,
//         }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
//             <div style={{
//               width: 52, height: 52, borderRadius: 12,
//               background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
//               display: 'flex', alignItems: 'center', justifyContent: 'center',
//               boxShadow: `0 0 0 3px ${T.gold}30`,
//             }}>
//               <HardHat size={26} color={T.navyDark} />
//             </div>
//             <div>
//               <span style={{
//                 fontSize: 10, fontWeight: 700, color: T.gold,
//                 background: `${T.gold}20`,
//                 padding: '3px 10px', borderRadius: 12,
//                 letterSpacing: 1, marginBottom: 4, display: 'inline-block',
//               }}>
//                 SITE ENGINEER
//               </span>
//               <h1 style={{
//                 fontSize: 'clamp(18px, 3vw, 22px)',
//                 fontWeight: 700, margin: 0,
//                 letterSpacing: 0.5,
//               }}>
//                 {engineerName}
//               </h1>
//               <p style={{
//                 fontSize: 12, color: '#cbd5e1',
//                 margin: '4px 0 0',
//               }}>
//                 Manage your assigned tasks
//               </p>
//             </div>
//           </div>

//           <div style={{
//             padding: '10px 16px',
//             background: 'rgba(255,255,255,0.1)',
//             borderRadius: 10,
//             border: `1px solid ${T.gold}30`,
//             display: 'flex', alignItems: 'center', gap: 8,
//           }}>
//             <span style={{
//               width: 32, height: 32, borderRadius: 8,
//               background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
//               display: 'flex', alignItems: 'center', justifyContent: 'center',
//               color: T.navyDark, fontSize: 14, fontWeight: 700,
//             }}>
//               {filteredData.length}
//             </span>
//             <div>
//               <div style={{ fontSize: 11, color: '#94a3b8' }}>Total</div>
//               <div style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>
//                 Task{filteredData.length !== 1 ? 's' : ''}
//               </div>
//             </div>
//           </div>
//         </div>

//         <div style={{
//           position: 'absolute',
//           bottom: 0, left: 0, right: 0, height: 3,
//           background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)`,
//         }} />
//       </div>

//       {/* Search Bar */}
//       <div style={{ marginBottom: 16, position: 'relative' }}>
//         <Search size={16} style={{
//           position: 'absolute', left: 14, top: '50%',
//           transform: 'translateY(-50%)', color: T.textMuted,
//         }} />
//         <input
//           type="text"
//           placeholder="Search by UID, Req No, Material, Location, Activity..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           style={{
//             width: '100%', padding: '12px 12px 12px 42px',
//             border: `1.5px solid ${T.border}`, borderRadius: 10,
//             fontSize: 13, outline: 'none',
//             background: T.card, boxSizing: 'border-box',
//           }}
//           onFocus={(e) => {
//             e.target.style.borderColor = T.gold;
//             e.target.style.boxShadow = `0 0 0 3px ${T.gold}15`;
//           }}
//           onBlur={(e) => {
//             e.target.style.borderColor = T.border;
//             e.target.style.boxShadow = 'none';
//           }}
//         />
//       </div>

//       {/* Table */}
//       {filteredData.length === 0 ? (
//         <div style={{
//           background: T.card, borderRadius: 12,
//           border: `1px solid ${T.border}`, padding: 60,
//           textAlign: 'center', color: T.textMuted,
//         }}>
//           <Package size={48} style={{ marginBottom: 12, opacity: 0.4 }} />
//           <p style={{ fontSize: 14, fontWeight: 500, color: T.textLight }}>
//             {searchTerm ? 'No matching records found' : 'No pending tasks for you'}
//           </p>
//         </div>
//       ) : (
//         <div style={{
//           background: T.card, borderRadius: 12,
//           border: `1px solid ${T.border}`,
//           overflow: 'hidden',
//           boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
//         }}>
//           <div style={{ overflowX: 'auto', maxHeight: '70vh' }}>
//             <table style={{
//               width: '100%',
//               borderCollapse: 'collapse',
//               fontSize: 12,
//             }}>
//               <thead style={{
//                 position: 'sticky', top: 0, zIndex: 10,
//                 background: T.navy,
//               }}>
//                 <tr>
//                   {[
//                     'Planned Date','UID', 'Req No' , 'Project', 'Cluster',
//                     'Location', 'Activity', 'Material Type', 'Material Name',
//                     'Size', 'Spec', 'SKU', 'Qty', 'Unit', 'Description',
//                     'Remark', 'Status', 'Action',
//                   ].map((header, idx) => (
//                     <th key={idx} style={{
//                       padding: '12px 10px',
//                       color: 'white',
//                       fontWeight: 600,
//                       textAlign: 'left',
//                       whiteSpace: 'nowrap',
//                       borderRight: idx < 17 ? `1px solid rgba(255,255,255,0.1)` : 'none',
//                       borderBottom: `2px solid ${T.gold}`,
//                       fontSize: 11,
//                       letterSpacing: 0.3,
//                     }}>
//                       {header}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredData.map((row, index) => {
//                   const statusColor = getStatusColor(row.existingStatus);
//                   const isUpdating = updatingRow === row.rowNumber;
//                   const isSaved = row.existingStatus;

//                   return (
//                     <tr key={row.rowNumber} style={{
//                       borderBottom: `1px solid ${T.borderLight}`,
//                       background: index % 2 === 0 ? T.card : T.bg,
//                     }}
//                       onMouseEnter={(e) => {
//                         e.currentTarget.style.background = `${T.gold}05`;
//                       }}
//                       onMouseLeave={(e) => {
//                         e.currentTarget.style.background =
//                           index % 2 === 0 ? T.card : T.bg;
//                       }}
//                     >

//                       <td style={cellStyle}>
//                         {row.plannedDate ? (
//                           <span style={{
//                             padding: '3px 8px',
//                             background: T.blueBg || '#eff6ff',
//                             color: '#2563eb',
//                             borderRadius: 6,
//                             fontSize: 11,
//                             fontWeight: 600,
//                             display: 'inline-flex',
//                             alignItems: 'center',
//                             gap: 4,
//                           }}>
//                             <Calendar size={11} />
//                             {row.plannedDate}
//                           </span>
//                         ) : (
//                           <span style={{ color: T.textMuted }}>-</span>
//                         )}
//                       </td>
//                       <td style={cellStyle}>
//                         <span style={{
//                           padding: '3px 8px',
//                           background: `${T.gold}15`,
//                           color: T.goldDark,
//                           borderRadius: 6,
//                           fontWeight: 700,
//                           fontSize: 11,
//                           border: `1px solid ${T.gold}30`,
//                         }}>
//                           {row.uid}
//                         </span>
//                       </td>

//                       <td style={cellStyle}>
//                         <span style={{ color: T.navy, fontWeight: 600 }}>
//                           {row.reqNo}
//                         </span>
//                       </td>

//                       {/* ✅ Planned Date */}
                      

//                       <td style={cellStyle}>{row.projectName}</td>
//                       <td style={cellStyle}>{row.cluster}</td>
//                       <td style={cellStyle}>{row.location}</td>
//                       <td style={cellStyle}>{row.activity}</td>
//                       <td style={cellStyle}>{row.materialType}</td>
//                       <td style={{ ...cellStyle, fontWeight: 600, color: T.navy }}>
//                         {row.materialName}
//                       </td>
//                       <td style={cellStyle}>{row.materialSize}</td>
//                       <td style={cellStyle}>{row.specification}</td>

//                       <td style={cellStyle}>
//                         <span style={{
//                           padding: '2px 6px',
//                           background: T.borderLight,
//                           borderRadius: 4,
//                           fontSize: 10,
//                           fontFamily: 'monospace',
//                           color: T.navy,
//                         }}>
//                           {row.skuCode}
//                         </span>
//                       </td>

//                       <td style={{ ...cellStyle, fontWeight: 600 }}>{row.qty}</td>
//                       <td style={cellStyle}>{row.unit}</td>
//                       <td style={{ ...cellStyle, maxWidth: 200 }}>{row.description}</td>
//                       <td style={{ ...cellStyle, maxWidth: 150 }}>{row.remark || '-'}</td>

//                       {/* ✅ Status Display */}
//                       <td style={cellStyle}>
//                         {isSaved ? (
//                           <span style={{
//                             padding: '4px 10px',
//                             background: statusColor.bg,
//                             color: statusColor.color,
//                             borderRadius: 6,
//                             fontSize: 11,
//                             fontWeight: 700,
//                             border: `1px solid ${statusColor.border}`,
//                             display: 'inline-flex',
//                             alignItems: 'center',
//                             gap: 4,
//                           }}>
//                             <CheckCircle size={11} />
//                             {row.existingStatus}
//                           </span>
//                         ) : (
//                           <span style={{
//                             padding: '4px 10px',
//                             background: T.borderLight,
//                             color: T.textMuted,
//                             borderRadius: 6,
//                             fontSize: 11,
//                             fontWeight: 600,
//                           }}>
//                             Not Set
//                           </span>
//                         )}
//                       </td>

//                       {/* ✅ Action Icon Button */}
//                       <td style={{ ...cellStyle, borderRight: 'none' }}>
//                         <button
//                           onClick={() => openModal(row, index)}
//                           disabled={isUpdating}
//                           title="Edit / Update"
//                           style={{
//                             display: 'flex', alignItems: 'center',
//                             justifyContent: 'center',
//                             width: 36, height: 36, borderRadius: 8,
//                             border: 'none',
//                             background: isUpdating
//                               ? T.border
//                               : `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
//                             color: isUpdating ? T.textMuted : T.navyDark,
//                             cursor: isUpdating ? 'not-allowed' : 'pointer',
//                             boxShadow: isUpdating ? 'none' : `0 2px 6px ${T.gold}40`,
//                             transition: 'all 0.2s',
//                           }}
//                           onMouseEnter={(e) => {
//                             if (!isUpdating) {
//                               e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
//                               e.currentTarget.style.boxShadow = `0 6px 14px ${T.gold}60`;
//                             }
//                           }}
//                           onMouseLeave={(e) => {
//                             e.currentTarget.style.transform = 'translateY(0) scale(1)';
//                             if (!isUpdating) {
//                               e.currentTarget.style.boxShadow = `0 2px 6px ${T.gold}40`;
//                             }
//                           }}
//                         >
//                           {isUpdating ? (
//                             <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} />
//                           ) : (
//                             <Edit3 size={16} />
//                           )}
//                         </button>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       {/* ═══ MODAL BOX ═══ */}
//       {modalOpen && selectedRow && (
//         <div
//           onClick={closeModal}
//           style={{
//             position: 'fixed',
//             inset: 0,
//             background: 'rgba(15, 23, 42, 0.7)',
//             backdropFilter: 'blur(4px)',
//             zIndex: 1000,
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             padding: 20,
//             animation: 'fadeIn 0.2s ease',
//           }}
//         >
//           <div
//             onClick={(e) => e.stopPropagation()}
//             style={{
//               background: T.card,
//               borderRadius: 14,
//               maxWidth: 500,
//               width: '100%',
//               maxHeight: '90vh',
//               overflowY: 'auto',
//               boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
//               animation: 'slideUp 0.3s ease',
//             }}
//           >
//             {/* Modal Header */}
//             <div style={{
//               background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`,
//               padding: '20px 24px',
//               borderRadius: '14px 14px 0 0',
//               color: 'white',
//               position: 'relative',
//             }}>
//               <div style={{
//                 position: 'absolute',
//                 top: 0, left: 0, right: 0, height: 3,
//                 background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)`,
//               }} />

//               <div style={{
//                 display: 'flex',
//                 justifyContent: 'space-between',
//                 alignItems: 'center',
//               }}>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
//                   <div style={{
//                     width: 40, height: 40, borderRadius: 10,
//                     background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
//                     display: 'flex', alignItems: 'center', justifyContent: 'center',
//                   }}>
//                     <Edit3 size={20} color={T.navyDark} />
//                   </div>
//                   <div>
//                     <h2 style={{
//                       fontSize: 16, fontWeight: 700, margin: 0,
//                     }}>
//                       Update Task
//                     </h2>
//                     <p style={{
//                       fontSize: 11, color: '#cbd5e1', margin: '2px 0 0',
//                     }}>
//                       UID: {selectedRow.uid} • {selectedRow.reqNo}
//                     </p>
//                   </div>
//                 </div>

//                 <button
//                   onClick={closeModal}
//                   style={{
//                     background: 'rgba(255,255,255,0.1)',
//                     border: 'none',
//                     color: 'white',
//                     width: 32, height: 32, borderRadius: 8,
//                     display: 'flex', alignItems: 'center', justifyContent: 'center',
//                     cursor: 'pointer',
//                   }}
//                   onMouseEnter={(e) => {
//                     e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
//                   }}
//                   onMouseLeave={(e) => {
//                     e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
//                   }}
//                 >
//                   <X size={18} />
//                 </button>
//               </div>
//             </div>

//             {/* Modal Body */}
//             <div style={{ padding: '24px' }}>

//               {/* Info Card */}
//               <div style={{
//                 padding: 12,
//                 background: `${T.gold}08`,
//                 border: `1px solid ${T.gold}30`,
//                 borderRadius: 8,
//                 marginBottom: 20,
//                 fontSize: 12,
//               }}>
//                 <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
//                   <div>
//                     <div style={{ color: T.textMuted, fontSize: 10 }}>Material</div>
//                     <div style={{ color: T.navy, fontWeight: 600 }}>
//                       {selectedRow.materialName}
//                     </div>
//                   </div>
//                   <div>
//                     <div style={{ color: T.textMuted, fontSize: 10 }}>Qty</div>
//                     <div style={{ color: T.navy, fontWeight: 600 }}>
//                       {selectedRow.qty} {selectedRow.unit}
//                     </div>
//                   </div>
//                   <div>
//                     <div style={{ color: T.textMuted, fontSize: 10 }}>Location</div>
//                     <div style={{ color: T.navy, fontWeight: 600 }}>
//                       {selectedRow.location}
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Status Dropdown */}
//               <div style={{ marginBottom: 16 }}>
//                 <label style={{
//                   display: 'block',
//                   fontSize: 12,
//                   fontWeight: 600,
//                   color: T.navyLight,
//                   marginBottom: 6,
//                 }}>
//                   Status <span style={{ color: T.danger }}>*</span>
//                 </label>
//                 <select
//                   value={modalData.status}
//                   onChange={(e) => setModalData({ ...modalData, status: e.target.value })}
//                   style={{
//                     width: '100%',
//                     padding: '10px 12px',
//                     fontSize: 13,
//                     border: `1.5px solid ${modalData.status ? T.gold : T.border}`,
//                     borderRadius: 8,
//                     outline: 'none',
//                     background: modalData.status ? `${T.gold}08` : T.card,
//                     cursor: 'pointer',
//                     fontWeight: modalData.status ? 600 : 400,
//                     color: modalData.status ? T.goldDark : T.text,
//                   }}
//                 >
//                   <option value="">Select Status</option>
//                   <option value="Approved">✅ Approved</option>
//                   <option value="Pending">⏳ Pending</option>
//                   <option value="Received">📦 Received</option>
//                 </select>
//               </div>

//               {/* Quantity Input */}
//               <div style={{ marginBottom: 16 }}>
//                 <label style={{
//                   display: 'block',
//                   fontSize: 12,
//                   fontWeight: 600,
//                   color: T.navyLight,
//                   marginBottom: 6,
//                 }}>
//                   Quantity <span style={{ color: T.danger }}>*</span>
//                 </label>
//                 <input
//                   type="number"
//                   min="0"
//                   value={modalData.quantity}
//                   onChange={(e) => setModalData({ ...modalData, quantity: e.target.value })}
//                   placeholder="Enter quantity"
//                   style={{
//                     width: '100%',
//                     padding: '10px 12px',
//                     fontSize: 13,
//                     border: `1.5px solid ${modalData.quantity ? T.gold : T.border}`,
//                     borderRadius: 8,
//                     outline: 'none',
//                     background: modalData.quantity ? `${T.gold}08` : T.card,
//                     fontWeight: modalData.quantity ? 600 : 400,
//                     boxSizing: 'border-box',
//                   }}
//                 />
//               </div>

//               {/* Remarks Input */}
//               <div style={{ marginBottom: 20 }}>
//                 <label style={{
//                   display: 'block',
//                   fontSize: 12,
//                   fontWeight: 600,
//                   color: T.navyLight,
//                   marginBottom: 6,
//                 }}>
//                   Remarks <span style={{ color: T.danger }}>*</span>
//                 </label>
//                 <textarea
//                   value={modalData.remarks}
//                   onChange={(e) => setModalData({ ...modalData, remarks: e.target.value })}
//                   placeholder="Enter your remarks..."
//                   rows={3}
//                   style={{
//                     width: '100%',
//                     padding: '10px 12px',
//                     fontSize: 13,
//                     border: `1.5px solid ${modalData.remarks ? T.gold : T.border}`,
//                     borderRadius: 8,
//                     outline: 'none',
//                     background: modalData.remarks ? `${T.gold}08` : T.card,
//                     resize: 'vertical',
//                     boxSizing: 'border-box',
//                     fontFamily: 'inherit',
//                   }}
//                 />
//               </div>

//               {/* Buttons */}
//               <div style={{
//                 display: 'flex',
//                 gap: 10,
//                 justifyContent: 'flex-end',
//               }}>
//                 <button
//                   onClick={closeModal}
//                   style={{
//                     padding: '10px 18px',
//                     borderRadius: 8,
//                     border: `1.5px solid ${T.border}`,
//                     background: T.card,
//                     color: T.textLight,
//                     fontSize: 13,
//                     fontWeight: 600,
//                     cursor: 'pointer',
//                   }}
//                   onMouseEnter={(e) => {
//                     e.currentTarget.style.borderColor = T.navy;
//                     e.currentTarget.style.color = T.navy;
//                   }}
//                   onMouseLeave={(e) => {
//                     e.currentTarget.style.borderColor = T.border;
//                     e.currentTarget.style.color = T.textLight;
//                   }}
//                 >
//                   Cancel
//                 </button>

//                 <button
//                   onClick={handleSave}
//                   disabled={updatingRow === selectedRow.rowNumber}
//                   style={{
//                     display: 'flex', alignItems: 'center', gap: 6,
//                     padding: '10px 20px',
//                     borderRadius: 8,
//                     border: 'none',
//                     background: updatingRow === selectedRow.rowNumber
//                       ? T.border
//                       : `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
//                     color: updatingRow === selectedRow.rowNumber
//                       ? T.textMuted
//                       : T.navyDark,
//                     fontSize: 13,
//                     fontWeight: 700,
//                     cursor: updatingRow === selectedRow.rowNumber
//                       ? 'not-allowed' : 'pointer',
//                     boxShadow: updatingRow === selectedRow.rowNumber
//                       ? 'none' : `0 2px 8px ${T.gold}40`,
//                   }}
//                 >
//                   {updatingRow === selectedRow.rowNumber ? (
//                     <>
//                       <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} />
//                       Saving...
//                     </>
//                   ) : (
//                     <>
//                       <Save size={14} /> Save Changes
//                     </>
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       <style>{`
//         @keyframes spin { to { transform: rotate(360deg); } }
//         @keyframes fadeIn {
//           from { opacity: 0; }
//           to { opacity: 1; }
//         }
//         @keyframes slideUp {
//           from { transform: translateY(20px); opacity: 0; }
//           to { transform: translateY(0); opacity: 1; }
//         }
//         @media (max-width: 768px) {
//           input, select, textarea { font-size: 16px !important; }
//         }
//         ::-webkit-scrollbar { width: 8px; height: 8px; }
//         ::-webkit-scrollbar-track { background: ${T.bg}; }
//         ::-webkit-scrollbar-thumb {
//           background: ${T.border};
//           border-radius: 6px;
//         }
//         ::-webkit-scrollbar-thumb:hover { background: ${T.textMuted}; }
//       `}</style>
//     </div>
//   );
// };

// export default SiteEngineer;




import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, HardHat, Loader2, AlertCircle,
  CheckCircle, Save, RotateCcw, Search, Package,
  Edit3, X, Calendar,
} from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';

// ─── THEME (Navy + Gold) ─────────────────────────────────
const T = {
  navy: '#1e293b', navyLight: '#334155', navyDark: '#0f172a',
  gold: '#f59e0b', goldLight: '#fbbf24', goldDark: '#d97706',
  bg: '#f8fafc', card: '#ffffff',
  text: '#1e293b', textLight: '#64748b', textMuted: '#94a3b8',
  border: '#e2e8f0', borderLight: '#f1f5f9',
  success: '#10b981', successBg: '#ecfdf5', successBorder: '#a7f3d0',
  danger: '#ef4444', dangerBg: '#fef2f2', dangerBorder: '#fecaca',
  warning: '#f59e0b', warningBg: '#fffbeb',
  blueBg: '#eff6ff', blue: '#3b82f6',
};

const cellStyle = {
  padding: '10px',
  color: T.text,
  fontSize: 12,
  verticalAlign: 'middle',
  borderRight: `1px solid ${T.borderLight}`,
};

const SiteEngineer = () => {
  const navigate = useNavigate();

  // ✅ Get user info
  const userType = sessionStorage.getItem('userType');
  const engineerName = sessionStorage.getItem('engineerName') || '';

  // ✅ Check user role
  const isAdmin = userType === 'admin';
  const displayName = isAdmin ? 'Admin' : engineerName;
  const apiName = isAdmin ? 'admin' : engineerName;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingRow, setUpdatingRow] = useState(null);

  // ✅ Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [modalData, setModalData] = useState({
    status: '',
    quantity: '',
    remarks: '',
  });

  // ─── FETCH DATA ────────────────────────────────────────
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/signature/site-engineer-data/${encodeURIComponent(apiName)}`
      );
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ─── OPEN MODAL ────────────────────────────────────────
  const openModal = (row, index) => {
    setSelectedRow(row);
    setSelectedIndex(index);
    setModalData({
      status: row.existingStatus || '',
      quantity: row.existingQuantity || '',
      remarks: row.existingRemarks || '',
    });
    setModalOpen(true);
  };

  // ─── CLOSE MODAL ───────────────────────────────────────
  const closeModal = () => {
    setModalOpen(false);
    setSelectedRow(null);
    setSelectedIndex(null);
    setModalData({ status: '', quantity: '', remarks: '' });
  };

  // ─── HANDLE SAVE ───────────────────────────────────────
  const handleSave = async () => {
    if (!modalData.status) {
      Swal.fire({
        icon: 'warning',
        title: 'Status Required',
        text: 'Please select a status.',
        confirmButtonColor: T.gold,
      });
      return;
    }
    if (!modalData.quantity) {
      Swal.fire({
        icon: 'warning',
        title: 'Quantity Required',
        text: 'Please enter quantity.',
        confirmButtonColor: T.gold,
      });
      return;
    }
    if (!modalData.remarks) {
      Swal.fire({
        icon: 'warning',
        title: 'Remarks Required',
        text: 'Please enter remarks.',
        confirmButtonColor: T.gold,
      });
      return;
    }

    setUpdatingRow(selectedRow.rowNumber);

    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/signature/site-engineer-update`,
        {
          rowNumber: selectedRow.rowNumber,
          status: modalData.status,
          quantity: modalData.quantity,
          remarks: modalData.remarks,
        }
      );

      await Swal.fire({
        icon: 'success',
        title: 'Saved Successfully! ✅',
        html: `
          <div style="text-align: left; padding: 10px 0;">
            <p style="margin: 4px 0; font-size: 13px;">
              <strong>UID:</strong>
              <span style="color: ${T.goldDark}; font-weight: 700;">${selectedRow.uid}</span>
            </p>
            <p style="margin: 4px 0; font-size: 13px;">
              <strong>Status:</strong>
              <span style="color: ${T.success}; font-weight: 700;">${modalData.status}</span>
            </p>
          </div>
        `,
        confirmButtonText: 'OK',
        confirmButtonColor: T.gold,
        timer: 3000,
        timerProgressBar: true,
      });

      // ✅ Update state
      const updated = [...data];
      updated[selectedIndex].existingStatus = modalData.status;
      updated[selectedIndex].existingQuantity = modalData.quantity;
      updated[selectedIndex].existingRemarks = modalData.remarks;
      setData(updated);

      closeModal();

    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Save Failed!',
        text: err.response?.data?.error || 'Something went wrong',
        confirmButtonColor: T.danger,
      });
    } finally {
      setUpdatingRow(null);
    }
  };

  // ─── FILTERED DATA (with Project & Cluster) ────────────
  const filteredData = data.filter(item => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.uid.toLowerCase().includes(term) ||
      item.reqNo.toLowerCase().includes(term) ||
      item.projectName.toLowerCase().includes(term) ||       // ✅ NEW
      item.cluster.toLowerCase().includes(term) ||           // ✅ NEW
      item.materialName.toLowerCase().includes(term) ||
      item.location.toLowerCase().includes(term) ||
      item.activity.toLowerCase().includes(term) ||
      (item.engineerName && item.engineerName.toLowerCase().includes(term))
    );
  });

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return { bg: T.successBg, color: T.success, border: T.successBorder };
      case 'pending': return { bg: T.warningBg, color: T.warning, border: '#fde68a' };
      case 'received': return { bg: `${T.gold}15`, color: T.goldDark, border: `${T.gold}40` };
      default: return { bg: T.borderLight, color: T.textMuted, border: T.border };
    }
  };

  // ─── LOADING ───────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ padding: 60, textAlign: 'center' }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14,
          background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20, boxShadow: `0 0 0 3px ${T.gold}30`,
        }}>
          <Loader2 size={28} color={T.gold} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
        <p style={{ fontSize: 15, fontWeight: 600, color: T.navy, marginBottom: 4 }}>
          Loading data...
        </p>
        <p style={{ fontSize: 13, color: T.textMuted }}>
          {isAdmin ? 'Fetching all engineers data' : `Fetching tasks for ${engineerName}`}
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ─── ERROR ─────────────────────────────────────────────
  if (error) {
    return (
      <div style={{ padding: 60, textAlign: 'center' }}>
        <AlertCircle size={40} color={T.danger} />
        <p style={{ marginTop: 12, color: T.danger, fontWeight: 600 }}>{error}</p>
        <button onClick={fetchData} style={{
          marginTop: 16, padding: '10px 20px', borderRadius: 8,
          border: 'none',
          background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
          color: T.navyDark, fontWeight: 600, cursor: 'pointer',
        }}>
          <RotateCcw size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto', padding: '0 8px' }}>

      {/* Back Button */}
      <button
        onClick={() => navigate('/dashboard/heritage')}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 14px', borderRadius: 8,
          border: `1px solid ${T.border}`, background: T.card,
          color: T.textLight, fontSize: 13, fontWeight: 500,
          cursor: 'pointer', marginBottom: 16,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = T.gold;
          e.currentTarget.style.color = T.goldDark;
          e.currentTarget.style.background = `${T.gold}08`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = T.border;
          e.currentTarget.style.color = T.textLight;
          e.currentTarget.style.background = T.card;
        }}
      >
        <ArrowLeft size={14} /> Back to Heritage
      </button>

      {/* ═══ Header Card ═══ */}
      <div style={{
        background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`,
        borderRadius: 14,
        padding: 'clamp(16px, 3vw, 24px)',
        marginBottom: 16,
        color: 'white',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, height: 3,
          background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)`,
        }} />

        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 12,
              background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 0 3px ${T.gold}30`,
            }}>
              <HardHat size={26} color={T.navyDark} />
            </div>
            <div>
              <span style={{
                fontSize: 10, fontWeight: 700, color: T.gold,
                background: `${T.gold}20`,
                padding: '3px 10px', borderRadius: 12,
                letterSpacing: 1, marginBottom: 4, display: 'inline-block',
              }}>
                {isAdmin ? '👑 ADMIN ACCESS' : 'SITE ENGINEER'}
              </span>
              <h1 style={{
                fontSize: 'clamp(18px, 3vw, 22px)',
                fontWeight: 700, margin: 0,
                letterSpacing: 0.5,
              }}>
                {displayName}
              </h1>
              <p style={{
                fontSize: 12, color: '#cbd5e1',
                margin: '4px 0 0',
              }}>
                {isAdmin
                  ? `Viewing all engineers' data (${data.length} total)`
                  : 'Manage your assigned tasks'}
              </p>
            </div>
          </div>

          <div style={{
            padding: '10px 16px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 10,
            border: `1px solid ${T.gold}30`,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{
              width: 32, height: 32, borderRadius: 8,
              background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: T.navyDark, fontSize: 14, fontWeight: 700,
            }}>
              {filteredData.length}
            </span>
            <div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>Total</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>
                Task{filteredData.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>

        <div style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0, height: 3,
          background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)`,
        }} />
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: 16, position: 'relative' }}>
        <Search size={16} style={{
          position: 'absolute', left: 14, top: '50%',
          transform: 'translateY(-50%)', color: T.textMuted,
        }} />
        <input
          type="text"
          placeholder={isAdmin
            ? "Search by UID, Req No, Project, Cluster, Material, Engineer, Location, Activity..."
            : "Search by UID, Req No, Project, Cluster, Material, Location, Activity..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%', padding: '12px 12px 12px 42px',
            border: `1.5px solid ${T.border}`, borderRadius: 10,
            fontSize: 13, outline: 'none',
            background: T.card, boxSizing: 'border-box',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = T.gold;
            e.target.style.boxShadow = `0 0 0 3px ${T.gold}15`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = T.border;
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>

      {/* Table */}
      {filteredData.length === 0 ? (
        <div style={{
          background: T.card, borderRadius: 12,
          border: `1px solid ${T.border}`, padding: 60,
          textAlign: 'center', color: T.textMuted,
        }}>
          <Package size={48} style={{ marginBottom: 12, opacity: 0.4 }} />
          <p style={{ fontSize: 14, fontWeight: 500, color: T.textLight }}>
            {searchTerm ? 'No matching records found' : 'No pending tasks'}
          </p>
        </div>
      ) : (
        <div style={{
          background: T.card, borderRadius: 12,
          border: `1px solid ${T.border}`,
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{ overflowX: 'auto', maxHeight: '70vh' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 12,
            }}>
              <thead style={{
                position: 'sticky', top: 0, zIndex: 10,
                background: T.navy,
              }}>
                <tr>
                  {[
                    'Planned Date','UID', 'Req No',
                    ...(isAdmin ? ['Engineer'] : []),
                     'Project', 'Cluster',
                    'Location', 'Activity', 'Material Type', 'Material Name',
                    'Size', 'Spec', 'SKU', 'Qty', 'Unit', 'Description',
                    'Remark',  'Action',
                  ].map((header, idx, arr) => (
                    <th key={idx} style={{
                      padding: '12px 10px',
                      color: 'white',
                      fontWeight: 600,
                      textAlign: 'left',
                      whiteSpace: 'nowrap',
                      borderRight: idx < arr.length - 1 ? `1px solid rgba(255,255,255,0.1)` : 'none',
                      borderBottom: `2px solid ${T.gold}`,
                      fontSize: 11,
                      letterSpacing: 0.3,
                    }}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, index) => {
                  const statusColor = getStatusColor(row.existingStatus);
                  const isUpdating = updatingRow === row.rowNumber;
                  const isSaved = row.existingStatus;

                  return (
                    <tr key={row.rowNumber} style={{
                      borderBottom: `1px solid ${T.borderLight}`,
                      background: index % 2 === 0 ? T.card : T.bg,
                    }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = `${T.gold}05`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          index % 2 === 0 ? T.card : T.bg;
                      }}
                    >
                      {/* Planned Date */}
                      <td style={cellStyle}>
                        {row.plannedDate ? (
                          <span style={{
                            padding: '3px 8px',
                            background: T.blueBg,
                            color: T.blue,
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}>
                            <Calendar size={11} />
                            {row.plannedDate}
                          </span>
                        ) : (
                          <span style={{ color: T.textMuted }}>-</span>
                        )}
                      </td>
                      {/* UID */}
                      <td style={cellStyle}>
                        <span style={{
                          padding: '3px 8px',
                          background: `${T.gold}15`,
                          color: T.goldDark,
                          borderRadius: 6,
                          fontWeight: 700,
                          fontSize: 11,
                          border: `1px solid ${T.gold}30`,
                        }}>
                          {row.uid}
                        </span>
                      </td>

                      {/* Req No */}
                      <td style={cellStyle}>
                        <span style={{ color: T.navy, fontWeight: 600 }}>
                          {row.reqNo}
                        </span>
                      </td>

                      {/* Engineer (Admin only) */}
                      {isAdmin && (
                        <td style={cellStyle}>
                          <span style={{
                            padding: '3px 10px',
                            background: `${T.gold}12`,
                            color: T.goldDark,
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 600,
                            border: `1px solid ${T.gold}30`,
                            whiteSpace: 'nowrap',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}>
                            <HardHat size={11} />
                            {row.engineerName || 'N/A'}
                          </span>
                        </td>
                      )}

                      

                      <td style={cellStyle}>{row.projectName}</td>
                      <td style={cellStyle}>{row.cluster}</td>
                      <td style={cellStyle}>{row.location}</td>
                      <td style={cellStyle}>{row.activity}</td>
                      <td style={cellStyle}>{row.materialType}</td>
                      <td style={{ ...cellStyle, fontWeight: 600, color: T.navy }}>
                        {row.materialName}
                      </td>
                      <td style={cellStyle}>{row.materialSize}</td>
                      <td style={cellStyle}>{row.specification}</td>

                      <td style={cellStyle}>
                        <span style={{
                          padding: '2px 6px',
                          background: T.borderLight,
                          borderRadius: 4,
                          fontSize: 10,
                          fontFamily: 'monospace',
                          color: T.navy,
                        }}>
                          {row.skuCode}
                        </span>
                      </td>

                      <td style={{ ...cellStyle, fontWeight: 600 }}>{row.qty}</td>
                      <td style={cellStyle}>{row.unit}</td>
                      <td style={{ ...cellStyle, maxWidth: 200 }}>{row.description}</td>
                      <td style={{ ...cellStyle, maxWidth: 150 }}>{row.remark || '-'}</td>

                      {/* Status */}
                      {/* <td style={cellStyle}>
                        {isSaved ? (
                          <span style={{
                            padding: '4px 10px',
                            background: statusColor.bg,
                            color: statusColor.color,
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 700,
                            border: `1px solid ${statusColor.border}`,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}>
                            <CheckCircle size={11} />
                            {row.existingStatus}
                          </span>
                        ) : (
                          <span style={{
                            padding: '4px 10px',
                            background: T.borderLight,
                            color: T.textMuted,
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 600,
                          }}>
                            Not Set
                          </span>
                        )}
                      </td> */}

                      {/* Action Icon */}
                      <td style={{ ...cellStyle, borderRight: 'none' }}>
                        <button
                          onClick={() => openModal(row, index)}
                          disabled={isUpdating}
                          title="Edit / Update"
                          style={{
                            display: 'flex', alignItems: 'center',
                            justifyContent: 'center',
                            width: 36, height: 36, borderRadius: 8,
                            border: 'none',
                            background: isUpdating
                              ? T.border
                              : `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
                            color: isUpdating ? T.textMuted : T.navyDark,
                            cursor: isUpdating ? 'not-allowed' : 'pointer',
                            boxShadow: isUpdating ? 'none' : `0 2px 6px ${T.gold}40`,
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            if (!isUpdating) {
                              e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                              e.currentTarget.style.boxShadow = `0 6px 14px ${T.gold}60`;
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                            if (!isUpdating) {
                              e.currentTarget.style.boxShadow = `0 2px 6px ${T.gold}40`;
                            }
                          }}
                        >
                          {isUpdating ? (
                            <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} />
                          ) : (
                            <Edit3 size={16} />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ MODAL BOX ═══ */}
      {modalOpen && selectedRow && (
        <div
          onClick={closeModal}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: T.card,
              borderRadius: 14,
              maxWidth: 500,
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              animation: 'slideUp 0.3s ease',
            }}
          >
            {/* Modal Header */}
            <div style={{
              background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`,
              padding: '20px 24px',
              borderRadius: '14px 14px 0 0',
              color: 'white',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, height: 3,
                background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)`,
              }} />

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Edit3 size={20} color={T.navyDark} />
                  </div>
                  <div>
                    <h2 style={{
                      fontSize: 16, fontWeight: 700, margin: 0,
                    }}>
                      Update Task
                    </h2>
                    <p style={{
                      fontSize: 11, color: '#cbd5e1', margin: '2px 0 0',
                    }}>
                      UID: {selectedRow.uid} • {selectedRow.reqNo}
                    </p>
                  </div>
                </div>

                <button
                  onClick={closeModal}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    color: 'white',
                    width: 32, height: 32, borderRadius: 8,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>

              {/* Info Card */}
              <div style={{
                padding: 12,
                background: `${T.gold}08`,
                border: `1px solid ${T.gold}30`,
                borderRadius: 8,
                marginBottom: 20,
                fontSize: 12,
              }}>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ color: T.textMuted, fontSize: 10 }}>Material</div>
                    <div style={{ color: T.navy, fontWeight: 600 }}>
                      {selectedRow.materialName}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: T.textMuted, fontSize: 10 }}>Qty</div>
                    <div style={{ color: T.navy, fontWeight: 600 }}>
                      {selectedRow.qty} {selectedRow.unit}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: T.textMuted, fontSize: 10 }}>Location</div>
                    <div style={{ color: T.navy, fontWeight: 600 }}>
                      {selectedRow.location}
                    </div>
                  </div>
                  {isAdmin && (
                    <div>
                      <div style={{ color: T.textMuted, fontSize: 10 }}>Engineer</div>
                      <div style={{ color: T.navy, fontWeight: 600 }}>
                        {selectedRow.engineerName || 'N/A'}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Dropdown */}
              <div style={{ marginBottom: 16 }}>
                <label style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 600,
                  color: T.navyLight,
                  marginBottom: 6,
                }}>
                  Status <span style={{ color: T.danger }}>*</span>
                </label>
                <select
                  value={modalData.status}
                  onChange={(e) => setModalData({ ...modalData, status: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: 13,
                    border: `1.5px solid ${modalData.status ? T.gold : T.border}`,
                    borderRadius: 8,
                    outline: 'none',
                    background: modalData.status ? `${T.gold}08` : T.card,
                    cursor: 'pointer',
                    fontWeight: modalData.status ? 600 : 400,
                    color: modalData.status ? T.goldDark : T.text,
                  }}
                >
                  <option value="">Select Status</option>
                  <option value="Approved">✅ Approved</option>
                  <option value="Pending">⏳ Pending</option>
                  <option value="Received">📦 Received</option>
                </select>
              </div>

              {/* Quantity Input */}
              <div style={{ marginBottom: 16 }}>
                <label style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 600,
                  color: T.navyLight,
                  marginBottom: 6,
                }}>
                  Quantity <span style={{ color: T.danger }}>*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={modalData.quantity}
                  onChange={(e) => setModalData({ ...modalData, quantity: e.target.value })}
                  placeholder="Enter quantity"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: 13,
                    border: `1.5px solid ${modalData.quantity ? T.gold : T.border}`,
                    borderRadius: 8,
                    outline: 'none',
                    background: modalData.quantity ? `${T.gold}08` : T.card,
                    fontWeight: modalData.quantity ? 600 : 400,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Remarks Input */}
              <div style={{ marginBottom: 20 }}>
                <label style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 600,
                  color: T.navyLight,
                  marginBottom: 6,
                }}>
                  Remarks <span style={{ color: T.danger }}>*</span>
                </label>
                <textarea
                  value={modalData.remarks}
                  onChange={(e) => setModalData({ ...modalData, remarks: e.target.value })}
                  placeholder="Enter your remarks..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: 13,
                    border: `1.5px solid ${modalData.remarks ? T.gold : T.border}`,
                    borderRadius: 8,
                    outline: 'none',
                    background: modalData.remarks ? `${T.gold}08` : T.card,
                    resize: 'vertical',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              {/* Buttons */}
              <div style={{
                display: 'flex',
                gap: 10,
                justifyContent: 'flex-end',
              }}>
                <button
                  onClick={closeModal}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 8,
                    border: `1.5px solid ${T.border}`,
                    background: T.card,
                    color: T.textLight,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = T.navy;
                    e.currentTarget.style.color = T.navy;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = T.border;
                    e.currentTarget.style.color = T.textLight;
                  }}
                >
                  Cancel
                </button>

                <button
                  onClick={handleSave}
                  disabled={updatingRow === selectedRow.rowNumber}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '10px 20px',
                    borderRadius: 8,
                    border: 'none',
                    background: updatingRow === selectedRow.rowNumber
                      ? T.border
                      : `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
                    color: updatingRow === selectedRow.rowNumber
                      ? T.textMuted
                      : T.navyDark,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: updatingRow === selectedRow.rowNumber
                      ? 'not-allowed' : 'pointer',
                    boxShadow: updatingRow === selectedRow.rowNumber
                      ? 'none' : `0 2px 8px ${T.gold}40`,
                  }}
                >
                  {updatingRow === selectedRow.rowNumber ? (
                    <>
                      <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={14} /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @media (max-width: 768px) {
          input, select, textarea { font-size: 16px !important; }
        }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: ${T.bg}; }
        ::-webkit-scrollbar-thumb {
          background: ${T.border};
          border-radius: 6px;
        }
        ::-webkit-scrollbar-thumb:hover { background: ${T.textMuted}; }
      `}</style>
    </div>
  );
};

export default SiteEngineer;