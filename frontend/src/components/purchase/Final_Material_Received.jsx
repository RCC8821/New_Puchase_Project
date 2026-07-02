
// import React, { useState, useEffect } from 'react';
// import {
//   Loader2, AlertCircle, CheckCircle, X, ChevronDown,
//   RotateCcw, Package, FileText, Check, ArrowLeft, ArrowRight, Camera, Filter, Edit3
// } from 'lucide-react';

// const T = {
//   navy: '#1e293b', navyLight: '#334155', navyDark: '#0f172a',
//   gold: '#f59e0b', goldLight: '#fbbf24', goldDark: '#d97706',
//   card: '#ffffff', text: '#1e293b',
//   textLight: '#64748b', textMuted: '#94a3b8',
//   border: '#e2e8f0', borderLight: '#f1f5f9',
//   success: '#10b981', successBg: '#ecfdf5', successBorder: '#a7f3d0',
//   danger: '#ef4444', dangerBg: '#fef2f2', dangerBorder: '#fecaca',
//   purple: '#7c3aed', warning: '#f59e0b',
// };

// const labelStyle = {
//   display: 'block', fontSize: 12, fontWeight: 600,
//   color: T.navyLight, marginBottom: 6,
// };
// const inputBase = {
//   width: '100%', padding: '10px 12px', fontSize: 13,
//   border: `1.5px solid ${T.border}`, borderRadius: 8,
//   outline: 'none', color: T.text, background: T.borderLight,
//   transition: 'all 0.2s', boxSizing: 'border-box',
// };
// const focusGold = (e) => {
//   e.target.style.borderColor = T.gold;
//   e.target.style.boxShadow = `0 0 0 3px ${T.gold}15`;
//   e.target.style.background = T.card;
// };
// const blurNormal = (e) => {
//   e.target.style.borderColor = T.border;
//   e.target.style.boxShadow = 'none';
//   e.target.style.background = T.borderLight;
// };

// const Td = ({ children, right, maxW, center, bold }) => (
//   <td style={{
//     padding: '10px 14px', fontSize: 13, color: T.text,
//     borderBottom: `1px solid ${T.border}`, whiteSpace: 'nowrap',
//     textAlign: right ? 'right' : center ? 'center' : 'left',
//     fontWeight: bold ? 600 : 400,
//   }}>
//     {maxW ? (
//       <span title={typeof children === 'string' ? children : ''} style={{
//         display: 'block', maxWidth: maxW, overflow: 'hidden', textOverflow: 'ellipsis',
//       }}>{children || <span style={{ color: T.textMuted }}>—</span>}</span>
//     ) : (children || <span style={{ color: T.textMuted }}>—</span>)}
//   </td>
// );

// const Final_Material_Received = () => {
//   // Data states
//   const [allData, setAllData] = useState([]);
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // Filter states
//   const [selectedVendor, setSelectedVendor] = useState('');
//   const [selectedPO, setSelectedPO] = useState('');
//   const [vendorOptions, setVendorOptions] = useState([]);
//   const [poOptions, setPoOptions] = useState([]);

//   // ✅ Modal states - PO directly select hoga row click pe
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedPOForModal, setSelectedPOForModal] = useState('');
//   const [poItems, setPoItems] = useState([]);
//   const [selectedUIDs, setSelectedUIDs] = useState([]);

//   const [isSaving, setIsSaving] = useState(false);
//   const [saveSuccess, setSaveSuccess] = useState(false);
//   const [saveError, setSaveError] = useState('');

//   // ── Fetch ──
//   const fetchRequests = async () => {
//     try {
//       setLoading(true); setError(null);
//       const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/get-Final-material-received`);
//       if (!response.ok) throw new Error(`HTTP ${response.status}`);
//       const data = await response.json();
//       const items = Array.isArray(data.data) ? data.data : [];

//       setAllData(items);
//       setRequests(items);

//       setVendorOptions([...new Set(items.map(r => r.vendorName).filter(Boolean))].sort());
//       setPoOptions([...new Set(items.map(r => r.poNumber).filter(Boolean))].sort());
//     } catch (err) {
//       console.error(err); setError('Data not available');
//       setAllData([]); setRequests([]);
//     } finally { setLoading(false); }
//   };

//   useEffect(() => { fetchRequests(); }, []);

//   // ── Apply Filters ──
//   const applyFilters = (vendor, po) => {
//     let filtered = [...allData];
//     if (vendor) filtered = filtered.filter(r => r.vendorName === vendor);
//     if (po) filtered = filtered.filter(r => r.poNumber === po);
//     setRequests(filtered);

//     const poSource = vendor ? allData.filter(r => r.vendorName === vendor) : allData;
//     setPoOptions([...new Set(poSource.map(r => r.poNumber).filter(Boolean))].sort());

//     const vendorSource = po ? allData.filter(r => r.poNumber === po) : allData;
//     setVendorOptions([...new Set(vendorSource.map(r => r.vendorName).filter(Boolean))].sort());
//   };

//   const handleVendorChange = (v) => {
//     setSelectedVendor(v);
//     applyFilters(v, selectedPO);
//   };

//   const handlePOChange = (p) => {
//     setSelectedPO(p);
//     applyFilters(selectedVendor, p);
//   };

//   const clearFilters = () => {
//     setSelectedVendor(''); setSelectedPO('');
//     setRequests(allData);
//     setVendorOptions([...new Set(allData.map(r => r.vendorName).filter(Boolean))].sort());
//     setPoOptions([...new Set(allData.map(r => r.poNumber).filter(Boolean))].sort());
//   };

//   // ✅ Row click → modal open with PO auto-selected
//   const handleRowClick = (req) => {
//     if (!req.poNumber) {
//       setSaveError('This row has no PO Number');
//       return;
//     }

//     // Find all UIDs with same PO
//     const items = requests.filter(r => r.poNumber === req.poNumber);
//     setSelectedPOForModal(req.poNumber);
//     setPoItems(items);
//     setSelectedUIDs(items.map(i => i.uid)); // Select all by default
//     setIsModalOpen(true);
//     setSaveSuccess(false);
//     setSaveError('');
//   };

//   // ── UID Selection ──
//   const handleSelectAllUIDs = (e) => {
//     setSelectedUIDs(e.target.checked ? poItems.map(i => i.uid) : []);
//   };

//   const handleUIDToggle = (uid) => {
//     setSelectedUIDs(prev =>
//       prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]
//     );
//   };

//   // ── Save - har UID alag-alag ──
//   const handleSave = async () => {
//     if (selectedUIDs.length === 0) {
//       setSaveError('Select at least one UID');
//       return;
//     }

//     setIsSaving(true); setSaveError('');
//     try {
//       let successCount = 0;
//       let failCount = 0;

//       for (const uid of selectedUIDs) {
//         const item = poItems.find(i => i.uid === uid);
//         if (!item) continue;

//         const dataToSend = {
//           uid: uid,
//           totalReceivedQuantity: parseFloat(item.totalReceivedQuantity) || 0,
//           status: 'Done',
//           challan_urls: item.Challan_url ? [item.Challan_url] : [],
//           challanNo: item.challanNo || '',
//           qualityApproved: item.qualityApproved || 'Final Done',
//         };

//         try {
//           const response = await fetch(
//             `${import.meta.env.VITE_BACKEND_URL}/api/save-final-receipt`,
//             {
//               method: 'POST',
//               headers: { 'Content-Type': 'application/json' },
//               body: JSON.stringify(dataToSend),
//             }
//           );
//           const result = await response.json();
//           if (!response.ok) throw new Error(result.message || 'Failed');
//           successCount++;
//         } catch (err) {
//           console.error(`Failed UID ${uid}:`, err);
//           failCount++;
//         }
//       }

//       if (successCount > 0) {
//         setSaveSuccess(true);
//         if (failCount > 0) {
//           setSaveError(`${successCount} saved, ${failCount} failed`);
//         }
//         setTimeout(() => { closeModal(); fetchRequests(); }, 1500);
//       } else {
//         setSaveError('All updates failed');
//       }
//     } catch (err) {
//       setSaveError(err.message || 'Error saving');
//     } finally { setIsSaving(false); }
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//     setSelectedPOForModal(''); setPoItems([]); setSelectedUIDs([]);
//     setSaveSuccess(false); setSaveError('');
//   };

//   if (loading) {
//     return (
//       <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 80 }}>
//         <Loader2 size={32} color={T.gold} style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} />
//         <p style={{ color: T.textMuted }}>Loading...</p>
//         <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
//       </div>
//     );
//   }

//   return (
//     <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 8px' }}>

//       {/* ── Header (button hata diya) ─────────────────── */}
//       <div style={{
//         background: T.card, borderRadius: 10, border: `1px solid ${T.border}`,
//         padding: '14px 18px', marginBottom: 12,
//         display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//         flexWrap: 'wrap', gap: 10,
//       }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//           <div style={{ width: 36, height: 36, borderRadius: 8, background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//             <Check size={18} color={T.gold} />
//           </div>
//           <div>
//             <h2 style={{ fontSize: 16, fontWeight: 700, color: T.navy, margin: 0 }}>Final Material Received</h2>
//             <p style={{ fontSize: 12, color: T.textMuted, margin: 0 }}>{requests.length} pending • Click any row to mark done</p>
//           </div>
//         </div>
//         <button onClick={fetchRequests} style={{
//           display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8,
//           border: `1.5px solid ${T.border}`, background: T.card, color: T.textLight, fontSize: 13, cursor: 'pointer',
//         }}>
//           <RotateCcw size={14} /> Refresh
//         </button>
//       </div>

//       {/* ── Filter Card ── */}
//       {allData.length > 0 && (
//         <div style={{ background: T.card, borderRadius: 10, border: `1px solid ${T.border}`, padding: '14px 16px', marginBottom: 12 }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${T.border}` }}>
//             <Filter size={16} color={T.gold} />
//             <span style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>Filter</span>
//           </div>

//           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 8 }}>
//             <div>
//               <label style={labelStyle}>🏭 Vendor</label>
//               <div style={{ position: 'relative' }}>
//                 <select value={selectedVendor} onChange={e => handleVendorChange(e.target.value)}
//                   style={{ ...inputBase, paddingRight: 30, appearance: 'none', cursor: 'pointer' }}
//                   onFocus={focusGold} onBlur={blurNormal}>
//                   <option value="">All Vendors</option>
//                   {vendorOptions.map((v, i) => <option key={i} value={v}>{v}</option>)}
//                 </select>
//                 <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: T.textMuted, pointerEvents: 'none' }} />
//               </div>
//             </div>

//             <div>
//               <label style={labelStyle}>📋 PO Number</label>
//               <div style={{ position: 'relative' }}>
//                 <select value={selectedPO} onChange={e => handlePOChange(e.target.value)}
//                   style={{ ...inputBase, paddingRight: 30, appearance: 'none', cursor: 'pointer' }}
//                   onFocus={focusGold} onBlur={blurNormal}>
//                   <option value="">All POs</option>
//                   {poOptions.map((p, i) => <option key={i} value={p}>{p}</option>)}
//                 </select>
//                 <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: T.textMuted, pointerEvents: 'none' }} />
//               </div>
//             </div>
//           </div>

//           {(selectedVendor || selectedPO) && (
//             <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
//               {selectedVendor && <span style={{ background: `${T.navy}10`, color: T.navy, padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{selectedVendor}</span>}
//               {selectedPO && <span style={{ background: `${T.gold}20`, color: T.goldDark, padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>PO: {selectedPO}</span>}
//               <button onClick={clearFilters} style={{ padding: '3px 8px', borderRadius: 6, border: `1px solid ${T.border}`, background: T.card, color: T.textLight, fontSize: 11, cursor: 'pointer' }}>✕ Clear</button>
//               <span style={{ fontSize: 11, color: T.textMuted, marginLeft: 'auto' }}>{requests.length} records</span>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Error */}
//       {error && (
//         <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: T.dangerBg, border: `1px solid ${T.dangerBorder}`, borderRadius: 10, marginBottom: 16, fontSize: 13, color: T.danger }}>
//           <AlertCircle size={16} /> {error}
//         </div>
//       )}

//       {/* ── Table with Action Column ── */}
//       <div style={{ background: T.card, borderRadius: 10, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
//         {requests.length === 0 ? (
//           <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px' }}>
//             <Package size={40} color={T.border} style={{ marginBottom: 12 }} />
//             <p style={{ fontSize: 15, color: T.textLight }}>No pending materials</p>
//           </div>
//         ) : (
//           <div style={{ overflowX: 'auto', maxHeight: '65vh', overflowY: 'auto' }}>
//             <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
//               <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
//                 <tr style={{ background: T.navy }}>
//                   {['#', 'UID', 'Timestamp', 'Req No', 'Site', 'Supervisor', 'Material', 'Size', 'SKU', 'Brand', 'Order Qty', 'Received', 'Unit', 'Status', 'Challan', 'Vendor', 'PO No', 'PO PDF', 'Action'].map(h => (
//                     <th key={h} style={{
//                       padding: '12px 14px',
//                       textAlign: h === 'Order Qty' || h === 'Received' ? 'right' : h === 'Action' ? 'center' : 'left',
//                       color: T.goldLight, fontSize: 11, fontWeight: 700,
//                       textTransform: 'uppercase', letterSpacing: 0.5,
//                       whiteSpace: 'nowrap', borderBottom: `2px solid ${T.gold}`,
//                     }}>{h}</th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {requests.map((req, idx) => (
//                   <tr key={`${req.uid}-${idx}`}
//                     style={{ background: idx % 2 === 0 ? T.card : T.borderLight, cursor: 'pointer' }}
//                     onMouseEnter={e => { e.currentTarget.style.background = `${T.gold}08`; }}
//                     onMouseLeave={e => { e.currentTarget.style.background = idx % 2 === 0 ? T.card : T.borderLight; }}>
//                     <Td>
//                       <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: 6, background: T.borderLight, fontSize: 12, fontWeight: 600, color: T.textLight }}>{idx + 1}</span>
//                     </Td>
//                     <Td><span style={{ background: `${T.navy}15`, color: T.navy, padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>{req.uid}</span></Td>
//                     <Td maxW={120}>{req.Timestamp}</Td>
//                     <Td><span style={{ background: `${T.gold}15`, color: T.goldDark, padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>{req.reqNo}</span></Td>
//                     <Td maxW={130}>{req.siteName}</Td>
//                     <Td maxW={110}>{req.supervisorName}</Td>
//                     <Td maxW={150} bold>{req.materialName}</Td>
//                     <Td>{req.materialSize && <span style={{ background: `${T.gold}15`, color: T.goldDark, padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>📏 {req.materialSize}</span>}</Td>
//                     <Td>{req.skuCode && <span style={{ fontFamily: 'monospace', fontSize: 11, background: T.borderLight, padding: '2px 6px', borderRadius: 4, color: T.textLight }}>{req.skuCode}</span>}</Td>
//                     <Td maxW={110}>{req.brandName && <span style={{ background: `${T.purple}15`, color: T.purple, padding: '3px 8px', borderRadius: 5, fontSize: 11, fontWeight: 600 }}>{req.brandName}</span>}</Td>
//                     <Td right>{req.revisedQuantity || req.orderQty}</Td>
//                     <Td right>
//                       <span style={{ background: parseFloat(req.totalReceivedQuantity) > 0 ? `${T.success}15` : T.borderLight, color: parseFloat(req.totalReceivedQuantity) > 0 ? T.success : T.textMuted, padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>{req.totalReceivedQuantity || 0}</span>
//                     </Td>
//                     <Td>{req.unitName}</Td>
//                     <Td>
//                       {req.status && <span style={{
//                         background: req.status === 'Full Material' ? `${T.success}15` : req.status === 'Partition' ? `${T.warning}20` : `${T.purple}15`,
//                         color: req.status === 'Full Material' ? T.success : req.status === 'Partition' ? '#92400e' : T.purple,
//                         padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
//                       }}>{req.status}</span>}
//                     </Td>
//                     <td style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}`, textAlign: 'center' }}>
//                       {req.Challan_url ? <a href={req.Challan_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '4px 8px', borderRadius: 5, background: `${T.gold}15`, color: T.goldDark, fontSize: 11, fontWeight: 600, textDecoration: 'none' }}><Camera size={11} /> View</a> : '—'}
//                     </td>
//                     <Td maxW={130}>{req.vendorName}</Td>
//                     <Td>{req.poNumber && <span style={{ background: T.navy, color: T.gold, padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>{req.poNumber}</span>}</Td>
//                     <td style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}`, textAlign: 'center' }}>
//                       {req.pdfUrl6 ? <a href={req.pdfUrl6} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '4px 8px', borderRadius: 5, background: T.navy, color: T.gold, fontSize: 11, fontWeight: 700, textDecoration: 'none' }}><FileText size={11} /> PDF</a> : '—'}
//                     </td>

//                     {/* ✅ ACTION button - row click pe modal open */}
//                     <td style={{ padding: '10px 14px', textAlign: 'center', borderBottom: `1px solid ${T.border}` }}>
//                       <button onClick={() => handleRowClick(req)} title={`Mark PO ${req.poNumber} Done`}
//                         style={{
//                           width: 34, height: 34, borderRadius: 8,
//                           border: `1.5px solid ${T.gold}40`, background: `${T.gold}10`,
//                           color: T.goldDark, cursor: 'pointer',
//                           display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
//                         }}
//                         onMouseEnter={e => { e.currentTarget.style.background = T.gold; e.currentTarget.style.color = T.navyDark; }}
//                         onMouseLeave={e => { e.currentTarget.style.background = `${T.gold}10`; e.currentTarget.style.color = T.goldDark; }}>
//                         <Edit3 size={15} />
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {/* ════ MODAL - Direct UID Selection (no Step 1) ════ */}
//       {isModalOpen && (
//         <>
//           <div onClick={closeModal} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(2px)', zIndex: 100 }} />
//           <div style={{
//             position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
//             width: '95%', maxWidth: 750, background: T.card, borderRadius: 14,
//             boxShadow: '0 20px 60px rgba(0,0,0,0.2)', zIndex: 101,
//             display: 'flex', flexDirection: 'column', maxHeight: '90vh',
//           }}>
//             {/* Header */}
//             <div style={{ background: T.navy, padding: '14px 18px', borderBottom: `2px solid ${T.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, borderRadius: '14px 14px 0 0' }}>
//               <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//                 <div style={{ width: 32, height: 32, borderRadius: 8, background: `${T.gold}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//                   <Check size={16} color={T.gold} />
//                 </div>
//                 <div>
//                   <h3 style={{ fontSize: 15, fontWeight: 700, color: 'white', margin: 0 }}>
//                     Mark Final Done — PO: <span style={{ color: T.gold }}>{selectedPOForModal}</span>
//                   </h3>
//                   <p style={{ fontSize: 11, color: T.textMuted, margin: 0 }}>
//                     {selectedUIDs.length} / {poItems.length} UIDs selected
//                   </p>
//                 </div>
//               </div>
//               <button onClick={closeModal} disabled={isSaving} style={{ width: 30, height: 30, borderRadius: 6, border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//                 <X size={16} />
//               </button>
//             </div>

//             {/* Body */}
//             <div style={{ flex: 1, overflowY: 'auto', padding: '18px' }}>

//               {saveSuccess && (
//                 <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: T.successBg, border: `1px solid ${T.successBorder}`, borderRadius: 8, marginBottom: 16, fontSize: 13, color: '#065f46' }}>
//                   <CheckCircle size={16} color={T.success} /> All {selectedUIDs.length} UIDs saved! Refreshing...
//                 </div>
//               )}
//               {saveError && (
//                 <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: T.dangerBg, border: `1px solid ${T.dangerBorder}`, borderRadius: 8, marginBottom: 16, fontSize: 13, color: T.danger }}>
//                   <AlertCircle size={16} /> {saveError}
//                 </div>
//               )}

//               <div style={{ background: T.successBg, border: `1px solid ${T.successBorder}`, borderRadius: 10, padding: '12px 16px', marginBottom: 16, borderLeft: `3px solid ${T.success}` }}>
//                 <p style={{ fontSize: 14, fontWeight: 600, color: '#065f46', margin: '0 0 4px' }}>
//                   Select UIDs to Mark Done
//                 </p>
//                 <p style={{ fontSize: 12, color: T.textLight, margin: 0 }}>
//                   Uncheck UIDs jo abhi nahi aayi - sirf received wale select karo
//                 </p>
//               </div>

//               {/* Select All */}
//               <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, padding: '10px 12px', background: T.borderLight, borderRadius: 8 }}>
//                 <input type="checkbox" onChange={handleSelectAllUIDs}
//                   checked={selectedUIDs.length === poItems.length && poItems.length > 0}
//                   style={{ width: 18, height: 18 }} />
//                 <span style={{ fontSize: 13, fontWeight: 600, color: T.navy }}>
//                   Select All ({poItems.length})
//                 </span>
//                 <span style={{ marginLeft: 'auto', fontSize: 12, color: T.gold, fontWeight: 700 }}>
//                   {selectedUIDs.length} selected
//                 </span>
//               </div>

//               {/* UID List */}
//               {poItems.map((item) => (
//                 <div key={item.uid} onClick={() => handleUIDToggle(item.uid)}
//                   style={{
//                     padding: '10px 12px', marginBottom: 6, borderRadius: 8, cursor: 'pointer',
//                     border: `2px solid ${selectedUIDs.includes(item.uid) ? T.success : T.border}`,
//                     background: selectedUIDs.includes(item.uid) ? `${T.success}08` : T.card,
//                     transition: 'all 0.2s',
//                   }}>
//                   <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//                     <input type="checkbox" checked={selectedUIDs.includes(item.uid)} readOnly
//                       style={{ width: 18, height: 18, flexShrink: 0 }} />
//                     <div style={{ flex: 1 }}>
//                       <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
//                         <span style={{ background: `${T.navy}15`, color: T.navy, padding: '2px 7px', borderRadius: 5, fontWeight: 700, fontSize: 12 }}>{item.uid}</span>
//                         <span style={{ fontWeight: 600, fontSize: 13 }}>{item.materialName}</span>
//                       </div>
//                       <div style={{ display: 'flex', gap: 12, fontSize: 11, color: T.textLight, flexWrap: 'wrap' }}>
//                         {item.materialSize && <span>📏 {item.materialSize}</span>}
//                         <span>Order: <strong>{item.revisedQuantity || item.orderQty} {item.unitName}</strong></span>
//                         <span>Received: <strong style={{ color: T.success }}>{item.totalReceivedQuantity || 0}</strong></span>
//                         {item.status && (
//                           <span style={{
//                             background: item.status === 'Full Material' ? `${T.success}15` : `${T.warning}20`,
//                             color: item.status === 'Full Material' ? T.success : '#92400e',
//                             padding: '1px 6px', borderRadius: 4, fontWeight: 600,
//                           }}>{item.status}</span>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Footer */}
//             <div style={{ padding: '12px 18px', borderTop: `1px solid ${T.border}`, background: T.borderLight, flexShrink: 0, display: 'flex', justifyContent: 'space-between', borderRadius: '0 0 14px 14px' }}>
//               <button onClick={closeModal} disabled={isSaving} style={{
//                 padding: '10px 18px', borderRadius: 8, border: `1.5px solid ${T.border}`,
//                 background: T.card, color: T.textLight, fontSize: 13, fontWeight: 600, cursor: 'pointer',
//               }}>Cancel</button>

//               <button onClick={handleSave} disabled={isSaving || saveSuccess || selectedUIDs.length === 0}
//                 style={{
//                   display: 'flex', alignItems: 'center', gap: 6, padding: '10px 22px', borderRadius: 8, border: 'none',
//                   background: saveSuccess ? T.success
//                     : (selectedUIDs.length > 0 && !isSaving) ? `linear-gradient(135deg, ${T.gold}, ${T.goldDark})` : T.border,
//                   color: saveSuccess ? 'white' : (selectedUIDs.length > 0 && !isSaving) ? T.navyDark : T.textMuted,
//                   fontSize: 13, fontWeight: 700,
//                   cursor: (selectedUIDs.length > 0 && !isSaving && !saveSuccess) ? 'pointer' : 'not-allowed',
//                 }}>
//                 {isSaving ? <><Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> Saving {selectedUIDs.length}...</>
//                   : saveSuccess ? <><CheckCircle size={15} /> Saved!</>
//                   : <><Check size={15} /> Save ({selectedUIDs.length} UIDs)</>}
//               </button>
//             </div>
//           </div>
//         </>
//       )}

//       <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
//     </div>
//   );
// };

// export default Final_Material_Received;






import React, { useState, useEffect } from 'react';
import {
  Loader2, AlertCircle, CheckCircle, X, ChevronDown,
  RotateCcw, Package, FileText, Check, ArrowLeft, ArrowRight, Camera, Filter, Edit3
} from 'lucide-react';

const T = {
  navy: '#1e293b', navyLight: '#334155', navyDark: '#0f172a',
  gold: '#f59e0b', goldLight: '#fbbf24', goldDark: '#d97706',
  card: '#ffffff', text: '#1e293b',
  textLight: '#64748b', textMuted: '#94a3b8',
  border: '#e2e8f0', borderLight: '#f1f5f9',
  success: '#10b981', successBg: '#ecfdf5', successBorder: '#a7f3d0',
  danger: '#ef4444', dangerBg: '#fef2f2', dangerBorder: '#fecaca',
  purple: '#7c3aed', warning: '#f59e0b',
};

const labelStyle = {
  display: 'block', fontSize: 12, fontWeight: 600,
  color: T.navyLight, marginBottom: 6,
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

const Final_Material_Received = () => {
  const [allData, setAllData] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedVendor, setSelectedVendor] = useState('');
  const [selectedPO, setSelectedPO] = useState('');
  const [vendorOptions, setVendorOptions] = useState([]);
  const [poOptions, setPoOptions] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPOForModal, setSelectedPOForModal] = useState('');
  const [poItems, setPoItems] = useState([]);
  const [selectedUIDs, setSelectedUIDs] = useState([]);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  const fetchRequests = async () => {
    try {
      setLoading(true); setError(null);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/get-Final-material-received`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const items = Array.isArray(data.data) ? data.data : [];

      setAllData(items);
      setRequests(items);

      setVendorOptions([...new Set(items.map(r => r.vendorName).filter(Boolean))].sort());
      setPoOptions([...new Set(items.map(r => r.poNumber).filter(Boolean))].sort());
    } catch (err) {
      console.error(err); setError('Data not available');
      setAllData([]); setRequests([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchRequests(); }, []);

  const applyFilters = (vendor, po) => {
    let filtered = [...allData];
    if (vendor) filtered = filtered.filter(r => r.vendorName === vendor);
    if (po) filtered = filtered.filter(r => r.poNumber === po);
    setRequests(filtered);

    const poSource = vendor ? allData.filter(r => r.vendorName === vendor) : allData;
    setPoOptions([...new Set(poSource.map(r => r.poNumber).filter(Boolean))].sort());

    const vendorSource = po ? allData.filter(r => r.poNumber === po) : allData;
    setVendorOptions([...new Set(vendorSource.map(r => r.vendorName).filter(Boolean))].sort());
  };

  const handleVendorChange = (v) => {
    setSelectedVendor(v);
    applyFilters(v, selectedPO);
  };

  const handlePOChange = (p) => {
    setSelectedPO(p);
    applyFilters(selectedVendor, p);
  };

  const clearFilters = () => {
    setSelectedVendor(''); setSelectedPO('');
    setRequests(allData);
    setVendorOptions([...new Set(allData.map(r => r.vendorName).filter(Boolean))].sort());
    setPoOptions([...new Set(allData.map(r => r.poNumber).filter(Boolean))].sort());
  };

  const handleRowClick = (req) => {
    if (!req.poNumber) {
      setSaveError('This row has no PO Number');
      return;
    }

    const items = requests.filter(r => r.poNumber === req.poNumber);
    setSelectedPOForModal(req.poNumber);
    setPoItems(items);
    setSelectedUIDs(items.map(i => i.uid));
    setIsModalOpen(true);
    setSaveSuccess(false);
    setSaveError('');
  };

  const handleSelectAllUIDs = (e) => {
    setSelectedUIDs(e.target.checked ? poItems.map(i => i.uid) : []);
  };

  const handleUIDToggle = (uid) => {
    setSelectedUIDs(prev =>
      prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]
    );
  };

  const handleSave = async () => {
    if (selectedUIDs.length === 0) {
      setSaveError('Select at least one UID');
      return;
    }

    setIsSaving(true); setSaveError('');
    try {
      let successCount = 0;
      let failCount = 0;

      for (const uid of selectedUIDs) {
        const item = poItems.find(i => i.uid === uid);
        if (!item) continue;

        const dataToSend = {
          uid: uid,
          totalReceivedQuantity: parseFloat(item.totalReceivedQuantity) || 0,
          status: 'Done',
          challan_urls: item.Challan_url ? [item.Challan_url] : [],
          challanNo: item.challanNo || '',
          qualityApproved: item.qualityApproved || 'Final Done',
        };

        try {
          const response = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/save-final-receipt`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(dataToSend),
            }
          );
          const result = await response.json();
          if (!response.ok) throw new Error(result.message || 'Failed');
          successCount++;
        } catch (err) {
          console.error(`Failed UID ${uid}:`, err);
          failCount++;
        }
      }

      if (successCount > 0) {
        setSaveSuccess(true);
        if (failCount > 0) {
          setSaveError(`${successCount} saved, ${failCount} failed`);
        }
        setTimeout(() => { closeModal(); fetchRequests(); }, 1500);
      } else {
        setSaveError('All updates failed');
      }
    } catch (err) {
      setSaveError(err.message || 'Error saving');
    } finally { setIsSaving(false); }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPOForModal(''); setPoItems([]); setSelectedUIDs([]);
    setSaveSuccess(false); setSaveError('');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 80 }}>
        <Loader2 size={32} color={T.gold} style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} />
        <p style={{ color: T.textMuted }}>Loading...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 8px' }}>

      {/* ── Header ─────────────────── */}
      <div style={{
        background: T.card, borderRadius: 10, border: `1px solid ${T.border}`,
        padding: '14px 18px', marginBottom: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Check size={18} color={T.gold} />
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: T.navy, margin: 0 }}>Final Material Received</h2>
            <p style={{ fontSize: 12, color: T.textMuted, margin: 0 }}>{requests.length} pending • Click any row to mark done</p>
          </div>
        </div>
        <button onClick={fetchRequests} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8,
          border: `1.5px solid ${T.border}`, background: T.card, color: T.textLight, fontSize: 13, cursor: 'pointer',
        }}>
          <RotateCcw size={14} /> Refresh
        </button>
      </div>

      {/* ── Filter Card ── */}
      {allData.length > 0 && (
        <div style={{ background: T.card, borderRadius: 10, border: `1px solid ${T.border}`, padding: '14px 16px', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${T.border}` }}>
            <Filter size={16} color={T.gold} />
            <span style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>Filter</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 8 }}>
            <div>
              <label style={labelStyle}>🏭 Vendor</label>
              <div style={{ position: 'relative' }}>
                <select value={selectedVendor} onChange={e => handleVendorChange(e.target.value)}
                  style={{ ...inputBase, paddingRight: 30, appearance: 'none', cursor: 'pointer' }}
                  onFocus={focusGold} onBlur={blurNormal}>
                  <option value="">All Vendors</option>
                  {vendorOptions.map((v, i) => <option key={i} value={v}>{v}</option>)}
                </select>
                <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: T.textMuted, pointerEvents: 'none' }} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>📋 PO Number</label>
              <div style={{ position: 'relative' }}>
                <select value={selectedPO} onChange={e => handlePOChange(e.target.value)}
                  style={{ ...inputBase, paddingRight: 30, appearance: 'none', cursor: 'pointer' }}
                  onFocus={focusGold} onBlur={blurNormal}>
                  <option value="">All POs</option>
                  {poOptions.map((p, i) => <option key={i} value={p}>{p}</option>)}
                </select>
                <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: T.textMuted, pointerEvents: 'none' }} />
              </div>
            </div>
          </div>

          {(selectedVendor || selectedPO) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              {selectedVendor && <span style={{ background: `${T.navy}10`, color: T.navy, padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{selectedVendor}</span>}
              {selectedPO && <span style={{ background: `${T.gold}20`, color: T.goldDark, padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>PO: {selectedPO}</span>}
              <button onClick={clearFilters} style={{ padding: '3px 8px', borderRadius: 6, border: `1px solid ${T.border}`, background: T.card, color: T.textLight, fontSize: 11, cursor: 'pointer' }}>✕ Clear</button>
              <span style={{ fontSize: 11, color: T.textMuted, marginLeft: 'auto' }}>{requests.length} records</span>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: T.dangerBg, border: `1px solid ${T.dangerBorder}`, borderRadius: 10, marginBottom: 16, fontSize: 13, color: T.danger }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* ── Table with Action Column ── */}
      <div style={{ background: T.card, borderRadius: 10, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
        {requests.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px' }}>
            <Package size={40} color={T.border} style={{ marginBottom: 12 }} />
            <p style={{ fontSize: 15, color: T.textLight }}>No pending materials</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', maxHeight: '65vh', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                <tr style={{ background: T.navy }}>
                  {/* ✅ Size ke baad Specification add kiya */}
                  {['#', 'UID', 'Timestamp', 'Req No', 'Site', 'Supervisor', 'Material', 'Size', 'Specification', 'SKU', 'Brand', 'Order Qty', 'Received', 'Unit', 'Status', 'Challan', 'Vendor', 'PO No', 'PO PDF', 'Action'].map(h => (
                    <th key={h} style={{
                      padding: '12px 14px',
                      textAlign: h === 'Order Qty' || h === 'Received' ? 'right' : h === 'Action' ? 'center' : 'left',
                      color: T.goldLight, fontSize: 11, fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: 0.5,
                      whiteSpace: 'nowrap', borderBottom: `2px solid ${T.gold}`,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {requests.map((req, idx) => (
                  <tr key={`${req.uid}-${idx}`}
                    style={{ background: idx % 2 === 0 ? T.card : T.borderLight, cursor: 'pointer' }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${T.gold}08`; }}
                    onMouseLeave={e => { e.currentTarget.style.background = idx % 2 === 0 ? T.card : T.borderLight; }}>
                    <Td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: 6, background: T.borderLight, fontSize: 12, fontWeight: 600, color: T.textLight }}>{idx + 1}</span>
                    </Td>
                    <Td><span style={{ background: `${T.navy}15`, color: T.navy, padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>{req.uid}</span></Td>
                    <Td maxW={120}>{req.Timestamp}</Td>
                    <Td><span style={{ background: `${T.gold}15`, color: T.goldDark, padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>{req.reqNo}</span></Td>
                    <Td maxW={130}>{req.siteName}</Td>
                    <Td maxW={110}>{req.supervisorName}</Td>
                    <Td maxW={150} bold>{req.materialName}</Td>
                    <Td>{req.materialSize && <span style={{ background: `${T.gold}15`, color: T.goldDark, padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>📏 {req.materialSize}</span>}</Td>
                    {/* ✅ NEW Specification column */}
                    <Td maxW={140}>
                      {req.materialSpecification ? (
                        <span style={{ background: `${T.purple}15`, color: T.purple, padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
                          📋 {req.materialSpecification}
                        </span>
                      ) : '—'}
                    </Td>
                    <Td>{req.skuCode && <span style={{ fontFamily: 'monospace', fontSize: 11, background: T.borderLight, padding: '2px 6px', borderRadius: 4, color: T.textLight }}>{req.skuCode}</span>}</Td>
                    <Td maxW={110}>{req.brandName && <span style={{ background: `${T.purple}15`, color: T.purple, padding: '3px 8px', borderRadius: 5, fontSize: 11, fontWeight: 600 }}>{req.brandName}</span>}</Td>
                    <Td right>{req.revisedQuantity || req.orderQty}</Td>
                    <Td right>
                      <span style={{ background: parseFloat(req.totalReceivedQuantity) > 0 ? `${T.success}15` : T.borderLight, color: parseFloat(req.totalReceivedQuantity) > 0 ? T.success : T.textMuted, padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>{req.totalReceivedQuantity || 0}</span>
                    </Td>
                    <Td>{req.unitName}</Td>
                    <Td>
                      {req.status && <span style={{
                        background: req.status === 'Full Material' ? `${T.success}15` : req.status === 'Partition' ? `${T.warning}20` : `${T.purple}15`,
                        color: req.status === 'Full Material' ? T.success : req.status === 'Partition' ? '#92400e' : T.purple,
                        padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                      }}>{req.status}</span>}
                    </Td>
                    <td style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}`, textAlign: 'center' }}>
                      {req.Challan_url ? <a href={req.Challan_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '4px 8px', borderRadius: 5, background: `${T.gold}15`, color: T.goldDark, fontSize: 11, fontWeight: 600, textDecoration: 'none' }}><Camera size={11} /> View</a> : '—'}
                    </td>
                    <Td maxW={130}>{req.vendorName}</Td>
                    <Td>{req.poNumber && <span style={{ background: T.navy, color: T.gold, padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>{req.poNumber}</span>}</Td>
                    <td style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}`, textAlign: 'center' }}>
                      {req.pdfUrl6 ? <a href={req.pdfUrl6} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '4px 8px', borderRadius: 5, background: T.navy, color: T.gold, fontSize: 11, fontWeight: 700, textDecoration: 'none' }}><FileText size={11} /> PDF</a> : '—'}
                    </td>

                    <td style={{ padding: '10px 14px', textAlign: 'center', borderBottom: `1px solid ${T.border}` }}>
                      <button onClick={() => handleRowClick(req)} title={`Mark PO ${req.poNumber} Done`}
                        style={{
                          width: 34, height: 34, borderRadius: 8,
                          border: `1.5px solid ${T.gold}40`, background: `${T.gold}10`,
                          color: T.goldDark, cursor: 'pointer',
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = T.gold; e.currentTarget.style.color = T.navyDark; }}
                        onMouseLeave={e => { e.currentTarget.style.background = `${T.gold}10`; e.currentTarget.style.color = T.goldDark; }}>
                        <Edit3 size={15} />
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
      {isModalOpen && (
        <>
          <div onClick={closeModal} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(2px)', zIndex: 100 }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '95%', maxWidth: 750, background: T.card, borderRadius: 14,
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)', zIndex: 101,
            display: 'flex', flexDirection: 'column', maxHeight: '90vh',
          }}>
            <div style={{ background: T.navy, padding: '14px 18px', borderBottom: `2px solid ${T.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, borderRadius: '14px 14px 0 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: `${T.gold}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={16} color={T.gold} />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: 'white', margin: 0 }}>
                    Mark Final Done — PO: <span style={{ color: T.gold }}>{selectedPOForModal}</span>
                  </h3>
                  <p style={{ fontSize: 11, color: T.textMuted, margin: 0 }}>
                    {selectedUIDs.length} / {poItems.length} UIDs selected
                  </p>
                </div>
              </div>
              <button onClick={closeModal} disabled={isSaving} style={{ width: 30, height: 30, borderRadius: 6, border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '18px' }}>

              {saveSuccess && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: T.successBg, border: `1px solid ${T.successBorder}`, borderRadius: 8, marginBottom: 16, fontSize: 13, color: '#065f46' }}>
                  <CheckCircle size={16} color={T.success} /> All {selectedUIDs.length} UIDs saved! Refreshing...
                </div>
              )}
              {saveError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: T.dangerBg, border: `1px solid ${T.dangerBorder}`, borderRadius: 8, marginBottom: 16, fontSize: 13, color: T.danger }}>
                  <AlertCircle size={16} /> {saveError}
                </div>
              )}

              <div style={{ background: T.successBg, border: `1px solid ${T.successBorder}`, borderRadius: 10, padding: '12px 16px', marginBottom: 16, borderLeft: `3px solid ${T.success}` }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#065f46', margin: '0 0 4px' }}>
                  Select UIDs to Mark Done
                </p>
                <p style={{ fontSize: 12, color: T.textLight, margin: 0 }}>
                  Uncheck UIDs jo abhi nahi aayi - sirf received wale select karo
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, padding: '10px 12px', background: T.borderLight, borderRadius: 8 }}>
                <input type="checkbox" onChange={handleSelectAllUIDs}
                  checked={selectedUIDs.length === poItems.length && poItems.length > 0}
                  style={{ width: 18, height: 18 }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: T.navy }}>
                  Select All ({poItems.length})
                </span>
                <span style={{ marginLeft: 'auto', fontSize: 12, color: T.gold, fontWeight: 700 }}>
                  {selectedUIDs.length} selected
                </span>
              </div>

              {poItems.map((item) => (
                <div key={item.uid} onClick={() => handleUIDToggle(item.uid)}
                  style={{
                    padding: '10px 12px', marginBottom: 6, borderRadius: 8, cursor: 'pointer',
                    border: `2px solid ${selectedUIDs.includes(item.uid) ? T.success : T.border}`,
                    background: selectedUIDs.includes(item.uid) ? `${T.success}08` : T.card,
                    transition: 'all 0.2s',
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input type="checkbox" checked={selectedUIDs.includes(item.uid)} readOnly
                      style={{ width: 18, height: 18, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
                        <span style={{ background: `${T.navy}15`, color: T.navy, padding: '2px 7px', borderRadius: 5, fontWeight: 700, fontSize: 12 }}>{item.uid}</span>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{item.materialName}</span>
                        {/* ✅ Specification badge */}
                        {item.materialSpecification && (
                          <span style={{ background: `${T.purple}15`, color: T.purple, padding: '2px 7px', borderRadius: 5, fontSize: 11, fontWeight: 600 }}>
                            📋 {item.materialSpecification}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 12, fontSize: 11, color: T.textLight, flexWrap: 'wrap' }}>
                        {item.materialSize && <span>📏 {item.materialSize}</span>}
                        <span>Order: <strong>{item.revisedQuantity || item.orderQty} {item.unitName}</strong></span>
                        <span>Received: <strong style={{ color: T.success }}>{item.totalReceivedQuantity || 0}</strong></span>
                        {item.status && (
                          <span style={{
                            background: item.status === 'Full Material' ? `${T.success}15` : `${T.warning}20`,
                            color: item.status === 'Full Material' ? T.success : '#92400e',
                            padding: '1px 6px', borderRadius: 4, fontWeight: 600,
                          }}>{item.status}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: '12px 18px', borderTop: `1px solid ${T.border}`, background: T.borderLight, flexShrink: 0, display: 'flex', justifyContent: 'space-between', borderRadius: '0 0 14px 14px' }}>
              <button onClick={closeModal} disabled={isSaving} style={{
                padding: '10px 18px', borderRadius: 8, border: `1.5px solid ${T.border}`,
                background: T.card, color: T.textLight, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>Cancel</button>

              <button onClick={handleSave} disabled={isSaving || saveSuccess || selectedUIDs.length === 0}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '10px 22px', borderRadius: 8, border: 'none',
                  background: saveSuccess ? T.success
                    : (selectedUIDs.length > 0 && !isSaving) ? `linear-gradient(135deg, ${T.gold}, ${T.goldDark})` : T.border,
                  color: saveSuccess ? 'white' : (selectedUIDs.length > 0 && !isSaving) ? T.navyDark : T.textMuted,
                  fontSize: 13, fontWeight: 700,
                  cursor: (selectedUIDs.length > 0 && !isSaving && !saveSuccess) ? 'pointer' : 'not-allowed',
                }}>
                {isSaving ? <><Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> Saving {selectedUIDs.length}...</>
                  : saveSuccess ? <><CheckCircle size={15} /> Saved!</>
                  : <><Check size={15} /> Save ({selectedUIDs.length} UIDs)</>}
              </button>
            </div>
          </div>
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Final_Material_Received;