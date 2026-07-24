// import React, { useState, useEffect, useRef } from 'react';
// import {
//   Loader2, AlertCircle, CheckCircle, X, ChevronDown,
//   RotateCcw, Package, FileText, Edit3,
//   Camera, Trash2, Filter, MapPin, User, Search, ArrowRight,
//   Calendar
// } from 'lucide-react';

// const T = {
//   navy: '#1e293b', navyLight: '#334155', navyDark: '#0f172a',
//   gold: '#f59e0b', goldLight: '#fbbf24', goldDark: '#d97706',
//   card: '#ffffff', text: '#1e293b',
//   textLight: '#64748b', textMuted: '#94a3b8',
//   border: '#e2e8f0', borderLight: '#f1f5f9',
//   success: '#10b981', successBg: '#ecfdf5', successBorder: '#a7f3d0',
//   danger: '#ef4444', dangerBg: '#fef2f2', dangerBorder: '#fecaca',
//   purple: '#7c3aed',
//   warning: '#f59e0b',
// };

// const labelStyle = {
//   display: 'block', fontSize: 12, fontWeight: 600,
//   color: T.navyLight, marginBottom: 6,
// };
// const inputBase = {
//   width: '100%', padding: '10px 12px', fontSize: 14,
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

// const Material_Received = () => {
//   // Dropdowns
//   const [siteNames, setSiteNames] = useState([]);
//   const [siteSupervisorMap, setSiteSupervisorMap] = useState({});
//   const [availableSupervisors, setAvailableSupervisors] = useState([]);
//   const [selectedSiteName, setSelectedSiteName] = useState('');
//   const [selectedSupervisorName, setSelectedSupervisorName] = useState('');

//   // Data
//   const [allRequests, setAllRequests] = useState([]);
//   const [requests, setRequests] = useState([]);

//   // Vendor + PO independent filters
//   const [selectedVendor, setSelectedVendor] = useState('');
//   const [selectedPO, setSelectedPO] = useState('');
//   const [vendorOptions, setVendorOptions] = useState([]);
//   const [poOptions, setPoOptions] = useState([]);

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // UID Modal
//   const [isUIDModalOpen, setIsUIDModalOpen] = useState(false);
//   const [uidModalItems, setUidModalItems] = useState([]);
//   const [selectedUIDs, setSelectedUIDs] = useState([]);
//   const [currentPOForModal, setCurrentPOForModal] = useState('');

//   // Receipt Form
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedRequest, setSelectedRequest] = useState(null);
//   const [receivedQuantities, setReceivedQuantities] = useState({});
//   const [materialStatus, setMaterialStatus] = useState('');
//   const [qualityCheck, setQualityCheck] = useState('');
//   const [challanNo, setChallanNo] = useState('');
//   const [truckDelivery, setTruckDelivery] = useState('');
//   const [googleFormCompleted, setGoogleFormCompleted] = useState('');
//   const [receivedDate, setReceivedDate] = useState('');  // ✅ NEW
//   const [photoData, setPhotoData] = useState(null);
//   const [isSaving, setIsSaving] = useState(false);
//   const [showSuccess, setShowSuccess] = useState(false);
//   const [isCameraReady, setIsCameraReady] = useState(false);

//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const streamRef = useRef(null);

//   // Fetch Dropdowns
//   useEffect(() => {
//     const fetchDropdowns = async () => {
//       try {
//         const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/dropdowns`);
//         if (!response.ok) throw new Error(`HTTP ${response.status}`);
//         const data = await response.json();
//         setSiteNames(data.siteNames || []);
//         setSiteSupervisorMap(data.siteSupervisorMap || {});
//         const all = Object.values(data.siteSupervisorMap || {}).flat().filter(Boolean).sort();
//         setAvailableSupervisors(all);
//       } catch (err) { console.error(err); }
//     };
//     fetchDropdowns();
//   }, []);

//   useEffect(() => {
//     if (!selectedSiteName) {
//       setAvailableSupervisors(Object.values(siteSupervisorMap).flat().filter(Boolean).sort());
//       return;
//     }
//     setAvailableSupervisors(siteSupervisorMap[selectedSiteName.trim().toLowerCase()] || []);
//     setSelectedSupervisorName('');
//   }, [selectedSiteName, siteSupervisorMap]);

//   // ── Main Filter ────────────────────────────────────────
//   const handleFilter = async () => {
//     try {
//       setLoading(true); setError(null);
//       setSelectedVendor(''); setSelectedPO('');

//       const url = new URL(`${import.meta.env.VITE_BACKEND_URL}/api/get-material-received-filter-data`);
//       if (selectedSiteName) url.searchParams.append('siteName', selectedSiteName);
//       if (selectedSupervisorName) url.searchParams.append('supervisorName', selectedSupervisorName);

//       const response = await fetch(url.toString());
//       if (!response.ok) throw new Error(`HTTP ${response.status}`);
//       const data = await response.json();

//       if (data.success && Array.isArray(data.data)) {
//         setAllRequests(data.data);
//         setRequests(data.data);
//         setVendorOptions([...new Set(data.data.map(r => r.vendorName).filter(Boolean))].sort());
//         setPoOptions([...new Set(data.data.map(r => r.poNumber).filter(Boolean))].sort());
//       } else {
//         setAllRequests([]); setRequests([]);
//         setVendorOptions([]); setPoOptions([]);
//       }
//     } catch (err) {
//       console.error(err); setError('Failed to load data');
//       setAllRequests([]); setRequests([]);
//     } finally { setLoading(false); }
//   };

//   // ── Apply Vendor + PO filter ────────────
//   const applySubFilter = (vendor, po) => {
//     let filtered = [...allRequests];
//     if (vendor) filtered = filtered.filter(r => r.vendorName === vendor);
//     if (po) filtered = filtered.filter(r => r.poNumber === po);
//     setRequests(filtered);

//     const poSource = vendor ? allRequests.filter(r => r.vendorName === vendor) : allRequests;
//     setPoOptions([...new Set(poSource.map(r => r.poNumber).filter(Boolean))].sort());

//     const vendorSource = po ? allRequests.filter(r => r.poNumber === po) : allRequests;
//     setVendorOptions([...new Set(vendorSource.map(r => r.vendorName).filter(Boolean))].sort());
//   };

//   const handleVendorChange = (vendor) => {
//     setSelectedVendor(vendor);
//     applySubFilter(vendor, selectedPO);
//   };

//   const handlePOChange = (po) => {
//     setSelectedPO(po);
//     applySubFilter(selectedVendor, po);
//   };

//   const clearSubFilters = () => {
//     setSelectedVendor(''); setSelectedPO('');
//     setRequests(allRequests);
//     setVendorOptions([...new Set(allRequests.map(r => r.vendorName).filter(Boolean))].sort());
//     setPoOptions([...new Set(allRequests.map(r => r.poNumber).filter(Boolean))].sort());
//   };

//   // ── UID Modal ──────────────────────────────────────────
//   const openUIDModal = (req) => {
//     if (!req.poNumber) return;
//     const poItems = requests.filter(r => r.poNumber === req.poNumber && r.vendorName === req.vendorName);
//     setUidModalItems(poItems);
//     setSelectedUIDs(poItems.map(i => i.uid));
//     setCurrentPOForModal(req.poNumber);
//     setIsUIDModalOpen(true);
//     setError(null);
//   };

//   const handleSelectAllUIDs = (e) => {
//     setSelectedUIDs(e.target.checked ? uidModalItems.map(i => i.uid) : []);
//   };

//   const handleUIDToggle = (uid) => {
//     setSelectedUIDs(prev => prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]);
//   };

//   // ── Receipt Form ───────────────────────────────────────
//   const goToReceiptForm = () => {
//     if (selectedUIDs.length === 0) return;
//     const firstUID = uidModalItems.find(i => i.uid === selectedUIDs[0]);
//     setSelectedRequest({ ...firstUID, selectedUIDs, uidModalItems });
//     setIsUIDModalOpen(false);

//     const qtyMap = {};
//     selectedUIDs.forEach(uid => { qtyMap[uid] = ''; });
//     setReceivedQuantities(qtyMap);

//     setMaterialStatus(''); setQualityCheck(''); setChallanNo('');
//     setTruckDelivery(''); setGoogleFormCompleted('');
//     setReceivedDate('');  // ✅ Reset date
//     setPhotoData(null); setIsModalOpen(true);
//     setShowSuccess(false); setError(null); setIsCameraReady(false);
//   };

//   const closeModal = () => {
//     if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
//     setIsModalOpen(false); setSelectedRequest(null);
//     setIsSaving(false); setShowSuccess(false);
//   };

//   // Camera
//   const startCamera = async (facingMode) => {
//     try {
//       if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
//       const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { exact: facingMode } } });
//       streamRef.current = stream;
//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//         videoRef.current.addEventListener('loadeddata', () => setIsCameraReady(true), { once: true });
//         await videoRef.current.play();
//       }
//     } catch (err) {
//       console.error(err); setError('Camera access failed.'); setIsCameraReady(false);
//     }
//   };

//   const capturePhoto = () => {
//     if (videoRef.current && canvasRef.current && streamRef.current && isCameraReady) {
//       const ctx = canvasRef.current.getContext('2d');
//       if (ctx && videoRef.current.videoWidth > 0) {
//         canvasRef.current.width = videoRef.current.videoWidth;
//         canvasRef.current.height = videoRef.current.videoHeight;
//         ctx.drawImage(videoRef.current, 0, 0);
//         setPhotoData(canvasRef.current.toDataURL('image/jpeg'));
//         streamRef.current.getTracks().forEach(t => t.stop());
//         streamRef.current = null; videoRef.current.srcObject = null;
//         setIsCameraReady(false);
//       }
//     }
//   };

//   // ✅ Validate - receivedDate bhi check
//   const validate = () => {
//     if (!materialStatus || !qualityCheck || !challanNo || !truckDelivery || !photoData || !receivedDate) return false;
//     if (truckDelivery === 'Yes' && !googleFormCompleted) return false;
//     const uids = selectedRequest?.selectedUIDs || [];
//     return uids.every(uid => receivedQuantities[uid] && parseFloat(receivedQuantities[uid]) > 0);
//   };

//   // ✅ Save - receivedDate payload me
//  // Save
// const handleSave = async () => {
//   if (!validate()) { setError('Fill all fields, date & qty for each UID.'); return; }
//   const uids = selectedRequest.selectedUIDs || [selectedRequest.uid];

//   try {
//     setIsSaving(true); setError(null);
//     for (const uid of uids) {
//       const item = selectedRequest.uidModalItems?.find(i => i.uid === uid) || selectedRequest;

//       // ✅ DEBUG - Console me check karo
//       console.log('=== Saving UID:', uid, '===');
//       console.log('Item:', item);
//       console.log('SKU Code:', item.skuCode);
//       console.log('Material Size:', item.materialSize);
//       console.log('Material Spec:', item.materialSpecification);

//       // ✅ COMPLETE Payload with ALL fields
//       const payload = {
//         uid: uid,
//         reqNo: item.reqNo || '',
//         siteName: item.siteName || '',
//         supervisorName: item.supervisorName || '',
//         materialType: item.materialType || '',
//         skuCode: item.skuCode || '',                          // ✅ SKU
//         materialName: item.materialName || '',
//         materialSize: item.materialSize || '',                // ✅ Size
//         materialSpecification: item.materialSpecification || '', // ✅ Spec
//         unitName: item.unitName || '',
//         receivedQty: parseFloat(receivedQuantities[uid]),
//         status: materialStatus,
//         challanNo: challanNo,
//         qualityApproved: qualityCheck,
//         truckDelivery: truckDelivery,
//         googleFormCompleted: googleFormCompleted,
//         photo: photoData,
//         vendorName: item.vendorName || '',
//         receivedDate: receivedDate,
//       };

//       console.log('=== Payload being sent ===');
//       console.log(payload);

//       const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/save-material-receipt`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });
//       const data = await response.json();
//       if (!response.ok) throw new Error(data.error || 'Failed');
//     }
//     setShowSuccess(true);
//     if (materialStatus === 'Full Material') {
//       setAllRequests(prev => prev.filter(r => !uids.includes(r.uid)));
//       setRequests(prev => prev.filter(r => !uids.includes(r.uid)));
//     }
//     setTimeout(async () => { closeModal(); await handleFilter(); }, 1500);
//   } catch (err) {
//     setError(err.message || 'Failed to save');
//   } finally { setIsSaving(false); }
// };

//   // ══════════════════════════════════════════════════════
//   return (
//     <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 8px' }}>

//       {/* ── Header ─────────────────────────────────────── */}
//       <div style={{
//         background: T.card, borderRadius: 10, border: `1px solid ${T.border}`,
//         padding: '12px 16px', marginBottom: 12,
//         display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//         flexWrap: 'wrap', gap: 10,
//       }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//           <div style={{ width: 36, height: 36, borderRadius: 8, background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//             <Package size={18} color={T.gold} />
//           </div>
//           <div>
//             <h2 style={{ fontSize: 16, fontWeight: 700, color: T.navy, margin: 0 }}>Material Received</h2>
//             <p style={{ fontSize: 12, color: T.textMuted, margin: 0 }}>
//               {requests.length > 0 ? `${requests.length} pending` : 'Filter to see materials'}
//             </p>
//           </div>
//         </div>
//         {allRequests.length > 0 && (
//           <button onClick={handleFilter} disabled={loading} style={{
//             display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8,
//             border: `1.5px solid ${T.border}`, background: T.card, color: T.textLight, fontSize: 13,
//             cursor: loading ? 'not-allowed' : 'pointer',
//           }}>
//             {loading ? <><Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Refreshing...</> : <><RotateCcw size={14} /> Refresh</>}
//           </button>
//         )}
//       </div>

//       {/* ── Filter Card ────────────────────────────────── */}
//       <div style={{ background: T.card, borderRadius: 10, border: `1px solid ${T.border}`, padding: '14px 16px', marginBottom: 12 }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${T.border}` }}>
//           <Filter size={16} color={T.gold} />
//           <span style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>Filter</span>
//         </div>

//         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 10, alignItems: 'end', marginBottom: 10 }}>
//           <div>
//             <label style={labelStyle}><MapPin size={12} style={{ display: 'inline', marginRight: 4 }} />Site</label>
//             <div style={{ position: 'relative' }}>
//               <select value={selectedSiteName} onChange={e => setSelectedSiteName(e.target.value)}
//                 style={{ ...inputBase, paddingRight: 30, appearance: 'none', cursor: 'pointer' }}
//                 onFocus={focusGold} onBlur={blurNormal}>
//                 <option value="">All Sites</option>
//                 {siteNames.map((s, i) => <option key={i} value={s}>{s}</option>)}
//               </select>
//               <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: T.textMuted, pointerEvents: 'none' }} />
//             </div>
//           </div>
//           <div>
//             <label style={labelStyle}><User size={12} style={{ display: 'inline', marginRight: 4 }} />Supervisor</label>
//             <div style={{ position: 'relative' }}>
//               <select value={selectedSupervisorName} onChange={e => setSelectedSupervisorName(e.target.value)}
//                 disabled={!availableSupervisors.length}
//                 style={{ ...inputBase, paddingRight: 30, appearance: 'none', cursor: 'pointer' }}
//                 onFocus={focusGold} onBlur={blurNormal}>
//                 <option value="">All</option>
//                 {availableSupervisors.map((s, i) => <option key={i} value={s}>{s}</option>)}
//               </select>
//               <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: T.textMuted, pointerEvents: 'none' }} />
//             </div>
//           </div>
//           <button onClick={handleFilter} disabled={loading} style={{
//             display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
//             padding: '10px 20px', borderRadius: 8, border: 'none',
//             background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
//             color: T.navyDark, fontSize: 13, fontWeight: 700,
//             cursor: loading ? 'not-allowed' : 'pointer', height: 42,
//             boxShadow: `0 2px 8px ${T.gold}40`, minWidth: 100,
//           }}>
//             {loading ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : <><Search size={14} /> Filter</>}
//           </button>
//         </div>

//         {allRequests.length > 0 && (
//           <div style={{ borderTop: `1px dashed ${T.border}`, paddingTop: 10 }}>
//             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 8 }}>
//               <div>
//                 <label style={labelStyle}>🏭 Vendor</label>
//                 <div style={{ position: 'relative' }}>
//                   <select value={selectedVendor} onChange={e => handleVendorChange(e.target.value)}
//                     style={{ ...inputBase, paddingRight: 30, appearance: 'none', cursor: 'pointer' }}
//                     onFocus={focusGold} onBlur={blurNormal}>
//                     <option value="">All Vendors</option>
//                     {vendorOptions.map((v, i) => <option key={i} value={v}>{v}</option>)}
//                   </select>
//                   <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: T.textMuted, pointerEvents: 'none' }} />
//                 </div>
//               </div>

//               <div>
//                 <label style={labelStyle}>📋 PO No</label>
//                 <div style={{ position: 'relative' }}>
//                   <select value={selectedPO} onChange={e => handlePOChange(e.target.value)}
//                     style={{ ...inputBase, paddingRight: 30, appearance: 'none', cursor: 'pointer' }}
//                     onFocus={focusGold} onBlur={blurNormal}>
//                     <option value="">All POs</option>
//                     {poOptions.map((p, i) => <option key={i} value={p}>{p}</option>)}
//                   </select>
//                   <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: T.textMuted, pointerEvents: 'none' }} />
//                 </div>
//               </div>
//             </div>

//             {(selectedVendor || selectedPO) && (
//               <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
//                 {selectedVendor && <span style={{ background: `${T.navy}10`, color: T.navy, padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{selectedVendor}</span>}
//                 {selectedPO && <span style={{ background: `${T.gold}20`, color: T.goldDark, padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>PO: {selectedPO}</span>}
//                 <button onClick={clearSubFilters} style={{ padding: '3px 8px', borderRadius: 6, border: `1px solid ${T.border}`, background: T.card, color: T.textLight, fontSize: 11, cursor: 'pointer' }}>✕ Clear</button>
//                 <span style={{ fontSize: 11, color: T.textMuted, marginLeft: 'auto' }}>{requests.length} records</span>
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Error */}
//       {error && !isModalOpen && !isUIDModalOpen && (
//         <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: T.dangerBg, border: `1px solid ${T.dangerBorder}`, borderRadius: 8, marginBottom: 12, fontSize: 13, color: T.danger }}>
//           <AlertCircle size={16} /> {error}
//         </div>
//       )}

//       {/* ── Mobile + Desktop Table ──────────── */}
//       <div style={{ background: T.card, borderRadius: 10, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
//         {requests.length === 0 ? (
//           <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '50px 20px' }}>
//             <Package size={40} color={T.border} style={{ marginBottom: 12 }} />
//             <p style={{ fontSize: 14, color: T.textLight }}>
//               {loading ? 'Loading...' : allRequests.length > 0 ? 'No data for filters' : 'Apply filter to see materials'}
//             </p>
//           </div>
//         ) : (
//           <>
//             {/* ── MOBILE CARD VIEW ──────────── */}
//             <div className="mobile-cards" style={{ display: 'none' }}>
//               {requests.map((req, idx) => (
//                 <div key={req.uid + idx} style={{
//                   padding: '14px 16px', borderBottom: `1px solid ${T.border}`,
//                   background: idx % 2 === 0 ? T.card : T.borderLight,
//                 }}>
//                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
//                     <div style={{ flex: 1 }}>
//                       <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
//                         <span style={{ background: `${T.navy}15`, color: T.navy, padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>{req.uid}</span>
//                         <span style={{ background: `${T.gold}15`, color: T.goldDark, padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{req.reqNo}</span>
//                         {req.poNumber && <span style={{ background: T.navy, color: T.gold, padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700 }}>PO: {req.poNumber}</span>}
//                       </div>
//                       <p style={{ fontSize: 14, fontWeight: 700, color: T.navy, margin: 0 }}>{req.materialName}</p>
//                       <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
//                         {req.materialSize && <span style={{ fontSize: 11, color: T.goldDark, background: `${T.gold}15`, padding: '1px 6px', borderRadius: 4 }}>📏 {req.materialSize}</span>}
//                         {req.materialSpecification && <span style={{ fontSize: 11, color: T.purple, background: `${T.purple}15`, padding: '1px 6px', borderRadius: 4 }}>📋 {req.materialSpecification}</span>}
//                       </div>
//                     </div>
//                     <button onClick={() => openUIDModal(req)} style={{
//                       width: 40, height: 40, borderRadius: 10,
//                       border: `2px solid ${T.gold}`, background: `${T.gold}15`,
//                       color: T.goldDark, cursor: 'pointer',
//                       display: 'flex', alignItems: 'center', justifyContent: 'center',
//                       flexShrink: 0, marginLeft: 10,
//                     }}>
//                       <Edit3 size={18} />
//                     </button>
//                   </div>

//                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px', fontSize: 12 }}>
//                     <div><span style={{ color: T.textMuted }}>Site:</span> <strong>{req.siteName}</strong></div>
//                     <div><span style={{ color: T.textMuted }}>Supervisor:</span> <strong>{req.supervisorName}</strong></div>
//                     <div><span style={{ color: T.textMuted }}>Vendor:</span> <strong>{req.vendorName}</strong></div>
//                     <div><span style={{ color: T.textMuted }}>Type:</span> {req.materialType}</div>
//                     <div>
//                       <span style={{ color: T.textMuted }}>Order Qty:</span>
//                       <strong> {req.revisedQty || req.orderQty} {req.unitName}</strong>
//                     </div>
//                     <div>
//                       <span style={{ color: T.textMuted }}>Received:</span>
//                       <strong style={{ color: parseFloat(req.receivedQty) > 0 ? T.success : T.textMuted }}>
//                         {' '}{req.receivedQty || 0}
//                       </strong>
//                     </div>
//                     {req.brandName && <div><span style={{ color: T.textMuted }}>Brand:</span> <span style={{ color: T.purple, fontWeight: 600 }}>{req.brandName}</span></div>}
//                     {req.skuCode && <div><span style={{ color: T.textMuted }}>SKU:</span> <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{req.skuCode}</span></div>}
//                   </div>

//                   {req.pdfPO && (
//                     <a href={req.pdfPO} target="_blank" rel="noopener noreferrer"
//                       style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 8, padding: '4px 10px', borderRadius: 6, background: T.navy, color: T.gold, fontSize: 11, fontWeight: 700, textDecoration: 'none' }}>
//                       <FileText size={11} /> View PO PDF
//                     </a>
//                   )}
//                 </div>
//               ))}
//             </div>

//             {/* ── DESKTOP TABLE ────────────── */}
//             <div className="desktop-table" style={{ overflowX: 'auto', maxHeight: '65vh', overflowY: 'auto' }}>
//               <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
//                 <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
//                   <tr style={{ background: T.navy }}>
//                     {['#', 'UID', 'Req No', 'Site', 'Supervisor', 'Type', 'Material', 'Size', 'Specification', 'SKU', 'Brand', 'Order Qty', 'Received', 'Unit', 'Vendor', 'PO No', 'PO PDF', 'Action'].map(h => (
//                       <th key={h} style={{
//                         padding: '12px 14px', textAlign: h === 'Action' ? 'center' : h.includes('Qty') || h === 'Received' ? 'right' : 'left',
//                         color: T.goldLight, fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
//                         letterSpacing: 0.5, whiteSpace: 'nowrap', borderBottom: `2px solid ${T.gold}`,
//                       }}>{h}</th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {requests.map((req, idx) => (
//                     <tr key={req.uid + idx}
//                       style={{ background: idx % 2 === 0 ? T.card : T.borderLight }}
//                       onMouseEnter={e => { e.currentTarget.style.background = `${T.gold}08`; }}
//                       onMouseLeave={e => { e.currentTarget.style.background = idx % 2 === 0 ? T.card : T.borderLight; }}>
//                       <td style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}` }}>
//                         <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: 6, background: T.borderLight, fontSize: 12, fontWeight: 600, color: T.textLight }}>{idx + 1}</span>
//                       </td>
//                       <td style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}` }}>
//                         <span style={{ background: `${T.navy}15`, color: T.navy, padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>{req.uid}</span>
//                       </td>
//                       <td style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}` }}>
//                         <span style={{ background: `${T.gold}15`, color: T.goldDark, padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>{req.reqNo}</span>
//                       </td>
//                       <td style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}`, maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.siteName || '—'}</td>
//                       <td style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}`, maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.supervisorName || '—'}</td>
//                       <td style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}` }}>{req.materialType || '—'}</td>
//                       <td style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}`, fontWeight: 600, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.materialName || '—'}</td>
//                       <td style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}` }}>
//                         {req.materialSize ? <span style={{ background: `${T.gold}15`, color: T.goldDark, padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>📏 {req.materialSize}</span> : '—'}
//                       </td>
//                       <td style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}`, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
//                         {req.materialSpecification ? (
//                           <span style={{ background: `${T.purple}15`, color: T.purple, padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
//                             📋 {req.materialSpecification}
//                           </span>
//                         ) : '—'}
//                       </td>
//                       <td style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}` }}>
//                         {req.skuCode ? <span style={{ fontFamily: 'monospace', fontSize: 11, background: T.borderLight, padding: '2px 6px', borderRadius: 4, color: T.textLight }}>{req.skuCode}</span> : '—'}
//                       </td>
//                       <td style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}` }}>
//                         {req.brandName ? <span style={{ background: `${T.purple}15`, color: T.purple, padding: '3px 8px', borderRadius: 5, fontSize: 11, fontWeight: 600 }}>{req.brandName}</span> : '—'}
//                       </td>
//                       <td style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}`, textAlign: 'right', fontWeight: 600 }}>{req.revisedQty || req.orderQty || '—'}</td>
//                       <td style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}`, textAlign: 'right' }}>
//                         <span style={{ background: parseFloat(req.receivedQty) > 0 ? `${T.success}15` : T.borderLight, color: parseFloat(req.receivedQty) > 0 ? T.success : T.textMuted, padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>{req.receivedQty || 0}</span>
//                       </td>
//                       <td style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}` }}>{req.unitName || '—'}</td>
//                       <td style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}`, maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.vendorName || '—'}</td>
//                       <td style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}` }}>
//                         {req.poNumber ? <span style={{ background: T.navy, color: T.gold, padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>{req.poNumber}</span> : '—'}
//                       </td>
//                       <td style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}`, textAlign: 'center' }}>
//                         {req.pdfPO ? <a href={req.pdfPO} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '4px 8px', borderRadius: 5, background: T.navy, color: T.gold, fontSize: 11, fontWeight: 700, textDecoration: 'none' }}><FileText size={11} /> PDF</a> : '—'}
//                       </td>
//                       <td style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}`, textAlign: 'center' }}>
//                         <button onClick={() => openUIDModal(req)} style={{
//                           width: 34, height: 34, borderRadius: 8, border: `1.5px solid ${T.gold}40`,
//                           background: `${T.gold}10`, color: T.goldDark, cursor: 'pointer',
//                           display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
//                         }}
//                           onMouseEnter={e => { e.currentTarget.style.background = T.gold; e.currentTarget.style.color = T.navyDark; }}
//                           onMouseLeave={e => { e.currentTarget.style.background = `${T.gold}10`; e.currentTarget.style.color = T.goldDark; }}>
//                           <Edit3 size={15} />
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </>
//         )}
//       </div>

//       {/* ════ MODAL 1: UID Selection ════════════════════════ */}
//       {isUIDModalOpen && (
//         <>
//           <div onClick={() => setIsUIDModalOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(2px)', zIndex: 100 }} />
//           <div style={{
//             position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
//             width: '95%', maxWidth: 700, background: T.card, borderRadius: 14,
//             boxShadow: '0 20px 60px rgba(0,0,0,0.2)', zIndex: 101,
//             display: 'flex', flexDirection: 'column', maxHeight: '85vh',
//           }}>
//             <div style={{ background: T.navy, padding: '14px 16px', borderBottom: `2px solid ${T.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '14px 14px 0 0' }}>
//               <div>
//                 <h3 style={{ fontSize: 15, fontWeight: 700, color: 'white', margin: 0 }}>
//                   PO: <span style={{ color: T.gold }}>{currentPOForModal}</span>
//                 </h3>
//                 <p style={{ fontSize: 11, color: T.textMuted, margin: 0 }}>{selectedUIDs.length}/{uidModalItems.length} selected</p>
//               </div>
//               <button onClick={() => setIsUIDModalOpen(false)} style={{ width: 30, height: 30, borderRadius: 6, border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
//             </div>

//             <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
//               <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, padding: '8px 10px', background: T.borderLight, borderRadius: 8 }}>
//                 <input type="checkbox" onChange={handleSelectAllUIDs}
//                   checked={selectedUIDs.length === uidModalItems.length && uidModalItems.length > 0}
//                   style={{ width: 18, height: 18 }} />
//                 <span style={{ fontSize: 13, fontWeight: 600, color: T.navy }}>Select All ({uidModalItems.length})</span>
//               </div>

//               {uidModalItems.map((item) => (
//                 <div key={item.uid} onClick={() => handleUIDToggle(item.uid)}
//                   style={{
//                     padding: '12px 14px', marginBottom: 8, borderRadius: 8, cursor: 'pointer',
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
//                         {item.materialSpecification && (
//                           <span style={{ background: `${T.purple}15`, color: T.purple, padding: '2px 7px', borderRadius: 5, fontSize: 11, fontWeight: 600 }}>
//                             📋 {item.materialSpecification}
//                           </span>
//                         )}
//                       </div>
//                       <div style={{ display: 'flex', gap: 12, fontSize: 11, color: T.textLight, flexWrap: 'wrap' }}>
//                         {item.materialSize && <span>📏 {item.materialSize}</span>}
//                         <span>Qty: <strong>{item.revisedQty || item.orderQty} {item.unitName}</strong></span>
//                         <span>Rec: <strong style={{ color: parseFloat(item.receivedQty) > 0 ? T.success : T.textMuted }}>{item.receivedQty || 0}</strong></span>
//                         {item.status8 && <span style={{
//                           background: item.status8 === 'Full Material' ? `${T.success}15` : `${T.warning}20`,
//                           color: item.status8 === 'Full Material' ? T.success : '#92400e',
//                           padding: '1px 6px', borderRadius: 4, fontWeight: 600,
//                         }}>{item.status8}</span>}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             <div style={{ padding: '12px 16px', borderTop: `1px solid ${T.border}`, background: T.borderLight, display: 'flex', justifyContent: 'space-between', borderRadius: '0 0 14px 14px' }}>
//               <button onClick={() => setIsUIDModalOpen(false)} style={{ padding: '10px 20px', borderRadius: 8, border: `1.5px solid ${T.border}`, background: T.card, color: T.textLight, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
//               <button onClick={goToReceiptForm} disabled={selectedUIDs.length === 0}
//                 style={{
//                   display: 'flex', alignItems: 'center', gap: 5, padding: '10px 20px', borderRadius: 8, border: 'none',
//                   background: selectedUIDs.length > 0 ? `linear-gradient(135deg, ${T.gold}, ${T.goldDark})` : T.border,
//                   color: selectedUIDs.length > 0 ? T.navyDark : T.textMuted,
//                   fontSize: 13, fontWeight: 700, cursor: selectedUIDs.length > 0 ? 'pointer' : 'not-allowed',
//                 }}>
//                 Next ({selectedUIDs.length}) <ArrowRight size={14} />
//               </button>
//             </div>
//           </div>
//         </>
//       )}

//       {/* ════ MODAL 2: Receipt Form ══════════════════════════ */}
//       {isModalOpen && selectedRequest && (
//         <>
//           <div onClick={closeModal} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(2px)', zIndex: 100 }} />
//           <div style={{
//             position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
//             width: '95%', maxWidth: 650, background: T.card, borderRadius: 14,
//             boxShadow: '0 20px 60px rgba(0,0,0,0.2)', zIndex: 101,
//             display: 'flex', flexDirection: 'column', maxHeight: '92vh',
//           }}>
//             <div style={{ background: T.navy, padding: '14px 16px', borderBottom: `2px solid ${T.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, borderRadius: '14px 14px 0 0' }}>
//               <div>
//                 <h3 style={{ fontSize: 15, fontWeight: 700, color: 'white', margin: 0 }}>Material Receipt</h3>
//                 <p style={{ fontSize: 11, color: T.textMuted, margin: 0 }}>
//                   {(selectedRequest.selectedUIDs?.length || 1)} UIDs | PO: {selectedRequest.poNumber}
//                 </p>
//               </div>
//               <button onClick={closeModal} disabled={isSaving} style={{ width: 30, height: 30, borderRadius: 6, border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
//             </div>

//             <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
//               {showSuccess && <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px', background: T.successBg, border: `1px solid ${T.successBorder}`, borderRadius: 8, fontSize: 13, color: '#065f46' }}><CheckCircle size={16} color={T.success} /> All saved! Refreshing...</div>}
//               {error && <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px', background: T.dangerBg, border: `1px solid ${T.dangerBorder}`, borderRadius: 8, fontSize: 13, color: T.danger }}><AlertCircle size={16} /> {error}</div>}

//               {/* ── Per-UID Quantity ────────────────────── */}
//               <div>
//                 <label style={{ ...labelStyle, fontSize: 13 }}>
//                   📦 Qty Per Material <span style={{ color: T.danger }}>*</span>
//                 </label>

//                 {(selectedRequest.selectedUIDs || []).map((uid) => {
//                   const item = selectedRequest.uidModalItems?.find(it => it.uid === uid) || selectedRequest;
//                   const qty = receivedQuantities[uid];
//                   const isFilled = qty && parseFloat(qty) > 0;
//                   return (
//                     <div key={uid} style={{
//                       padding: '10px 12px', marginBottom: 8, borderRadius: 8,
//                       border: `1.5px solid ${isFilled ? T.success : T.danger}20`,
//                       background: isFilled ? `${T.success}05` : T.card,
//                     }}>
//                       <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
//                         <span style={{ background: `${T.navy}15`, color: T.navy, padding: '2px 7px', borderRadius: 5, fontWeight: 700, fontSize: 12 }}>{uid}</span>
//                         <span style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>{item.materialName}</span>
//                         {item.materialSpecification && (
//                           <span style={{ background: `${T.purple}15`, color: T.purple, padding: '2px 7px', borderRadius: 5, fontSize: 11, fontWeight: 600 }}>
//                             📋 {item.materialSpecification}
//                           </span>
//                         )}
//                       </div>
//                       <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
//                         <div style={{ display: 'flex', gap: 8, fontSize: 11, color: T.textLight }}>
//                           {item.materialSize && <span>📏 {item.materialSize}</span>}
//                           <span>Order: <strong>{item.revisedQty || item.orderQty}</strong></span>
//                           <span>Rec: <strong style={{ color: T.success }}>{item.receivedQty || 0}</strong></span>
//                         </div>
//                         <input
//                           type="number"
//                           value={receivedQuantities[uid] || ''}
//                           onChange={e => setReceivedQuantities(prev => ({ ...prev, [uid]: e.target.value }))}
//                           disabled={isSaving}
//                           placeholder="Enter Qty"
//                           min="0" step="0.01"
//                           style={{
//                             width: 120, textAlign: 'center', padding: '8px 10px',
//                             fontSize: 14, fontWeight: 700,
//                             border: `2px solid ${isFilled ? T.success : T.danger}`,
//                             borderRadius: 8, outline: 'none', background: T.card,
//                             marginLeft: 'auto',
//                           }}
//                           onFocus={e => { e.target.style.borderColor = T.gold; e.target.style.boxShadow = `0 0 0 3px ${T.gold}20`; }}
//                           onBlur={e => { e.target.style.borderColor = isFilled ? T.success : T.danger; e.target.style.boxShadow = 'none'; }}
//                         />
//                       </div>
//                     </div>
//                   );
//                 })}

//                 <div style={{ padding: '6px 12px', background: T.borderLight, borderRadius: 8, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
//                   <span style={{ color: T.textMuted }}>
//                     ✅ {Object.values(receivedQuantities).filter(v => v && parseFloat(v) > 0).length}/{(selectedRequest.selectedUIDs || []).length} filled
//                   </span>
//                   <span style={{ fontWeight: 700, color: T.navy }}>
//                     Total: {Object.values(receivedQuantities).reduce((s, v) => s + (parseFloat(v) || 0), 0).toFixed(2)}
//                   </span>
//                 </div>
//               </div>

//               {/* ── Common Fields ──────────────────────── */}
//               <div style={{ padding: '14px', background: `${T.gold}08`, borderRadius: 10, border: `1px dashed ${T.gold}50` }}>
//                 <p style={{ fontSize: 12, fontWeight: 700, color: T.goldDark, margin: '0 0 12px 0' }}>
//                   ⚡ Common Fields — All {(selectedRequest.selectedUIDs || []).length} UIDs
//                 </p>

//                 <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
//                   <div>
//                     <label style={labelStyle}>Status <span style={{ color: T.danger }}>*</span></label>
//                     <select value={materialStatus} onChange={e => setMaterialStatus(e.target.value)}
//                       disabled={isSaving} style={{ ...inputBase, appearance: 'none', cursor: 'pointer' }} onFocus={focusGold} onBlur={blurNormal}>
//                       <option value="">-- Select --</option>
//                       <option value="Partition">⚠️ Partition</option>
//                       <option value="Full Material">✅ Full Material</option>
//                     </select>
//                     {materialStatus === 'Full Material' && <p style={{ fontSize: 11, color: T.success, marginTop: 4, fontWeight: 600 }}>✅ UIDs removed after save</p>}
//                     {materialStatus === 'Partition' && <p style={{ fontSize: 11, color: '#92400e', marginTop: 4, fontWeight: 600 }}>⚠️ UIDs stay for next delivery</p>}
//                   </div>

//                   {/* ✅ NEW - Received Date */}
//                   <div>
//                     <label style={labelStyle}>
//                       <Calendar size={12} style={{ display: 'inline', marginRight: 4 }} />
//                       Received Date <span style={{ color: T.danger }}>*</span>
//                       <span style={{ marginLeft: 8, fontSize: 10, color: T.textMuted, background: T.borderLight, padding: '2px 6px', borderRadius: 4 }}>
//                         → Column R
//                       </span>
//                     </label>
//                     <input type="date" value={receivedDate}
//                       onChange={e => setReceivedDate(e.target.value)}
//                       disabled={isSaving}
//                       style={{ ...inputBase, borderColor: !receivedDate ? T.danger : T.border }}
//                       onFocus={focusGold} onBlur={blurNormal} />
//                   </div>

//                   <div>
//                     <label style={labelStyle}>Quality <span style={{ color: T.danger }}>*</span></label>
//                     <select value={qualityCheck} onChange={e => setQualityCheck(e.target.value)}
//                       disabled={isSaving} style={{ ...inputBase, appearance: 'none', cursor: 'pointer' }} onFocus={focusGold} onBlur={blurNormal}>
//                       <option value="">-- Select --</option>
//                       <option value="Approved">✅ Approved</option>
//                       <option value="Reject">❌ Reject</option>
//                     </select>
//                   </div>

//                   <div>
//                     <label style={labelStyle}>Challan No <span style={{ color: T.danger }}>*</span></label>
//                     <input type="text" value={challanNo} onChange={e => setChallanNo(e.target.value)}
//                       disabled={isSaving} placeholder="Challan number" style={inputBase} onFocus={focusGold} onBlur={blurNormal} />
//                   </div>

//                   <div>
//                     <label style={labelStyle}>Truck Delivery <span style={{ color: T.danger }}>*</span></label>
//                     <select value={truckDelivery} onChange={e => setTruckDelivery(e.target.value)}
//                       disabled={isSaving} style={{ ...inputBase, appearance: 'none', cursor: 'pointer' }} onFocus={focusGold} onBlur={blurNormal}>
//                       <option value="">-- Select --</option>
//                       <option value="Yes">Yes</option>
//                       <option value="No">No</option>
//                     </select>
//                   </div>

//                   {truckDelivery === 'Yes' && (
//                     <div>
//                       <label style={labelStyle}>Google Form? <span style={{ color: T.danger }}>*</span></label>
//                       <select value={googleFormCompleted} onChange={e => setGoogleFormCompleted(e.target.value)}
//                         disabled={isSaving} style={{ ...inputBase, appearance: 'none', cursor: 'pointer' }} onFocus={focusGold} onBlur={blurNormal}>
//                         <option value="">-- Select --</option>
//                         <option value="Yes">✅ Yes</option>
//                         <option value="No">❌ No</option>
//                       </select>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* ── Camera ─────────────────────────────── */}
//               <div>
//                 <label style={labelStyle}><Camera size={12} style={{ display: 'inline', marginRight: 4 }} />Challan Photo <span style={{ color: T.danger }}>*</span></label>
//                 {!photoData && !streamRef.current && (
//                   <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
//                     <button onClick={() => startCamera('environment')} disabled={isSaving}
//                       style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '12px', borderRadius: 8, border: 'none', background: T.navy, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
//                       <Camera size={16} /> Back Camera
//                     </button>
//                     <button onClick={() => startCamera('user')} disabled={isSaving}
//                       style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '12px', borderRadius: 8, border: 'none', background: T.navyLight, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
//                       <Camera size={16} /> Front
//                     </button>
//                   </div>
//                 )}
//                 <video ref={videoRef} style={{ width: '100%', borderRadius: 8, display: photoData ? 'none' : (isCameraReady ? 'block' : 'none') }} autoPlay playsInline />
//                 <canvas ref={canvasRef} style={{ display: 'none' }} />
//                 {isCameraReady && !photoData && (
//                   <button onClick={capturePhoto} style={{
//                     width: '100%', marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
//                     padding: '12px', borderRadius: 8, border: 'none',
//                     background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
//                     color: T.navyDark, fontSize: 14, fontWeight: 700, cursor: 'pointer',
//                   }}><Camera size={16} /> Capture</button>
//                 )}
//                 {photoData && (
//                   <div>
//                     <img src={photoData} alt="Challan" style={{ width: '100%', borderRadius: 8, marginBottom: 8, border: `2px solid ${T.successBorder}` }} />
//                     <button onClick={() => setPhotoData(null)} style={{
//                       display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
//                       padding: '8px 16px', borderRadius: 8, border: 'none',
//                       background: T.dangerBg, color: T.danger, fontSize: 13, fontWeight: 600, cursor: 'pointer',
//                     }}><Trash2 size={14} /> Retake</button>
//                   </div>
//                 )}
//               </div>
//             </div>

//             <div style={{ padding: '12px 16px', borderTop: `1px solid ${T.border}`, background: T.borderLight, flexShrink: 0, display: 'flex', justifyContent: 'space-between', gap: 10, borderRadius: '0 0 14px 14px' }}>
//               <button onClick={() => { closeModal(); setIsUIDModalOpen(true); }} disabled={isSaving}
//                 style={{ padding: '10px 18px', borderRadius: 8, border: `1.5px solid ${T.border}`, background: T.card, color: T.textLight, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
//                 ← Back
//               </button>
//               <button onClick={handleSave} disabled={isSaving || !validate()}
//                 style={{
//                   display: 'flex', alignItems: 'center', gap: 6,
//                   padding: '10px 22px', borderRadius: 8, border: 'none',
//                   background: validate() && !isSaving ? `linear-gradient(135deg, ${T.gold}, ${T.goldDark})` : T.border,
//                   color: validate() && !isSaving ? T.navyDark : T.textMuted,
//                   fontSize: 13, fontWeight: 700, cursor: validate() && !isSaving ? 'pointer' : 'not-allowed',
//                 }}>
//                 {isSaving
//                   ? <><Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> Saving...</>
//                   : <><CheckCircle size={15} /> Save ({(selectedRequest.selectedUIDs || []).length})</>}
//               </button>
//             </div>
//           </div>
//         </>
//       )}

//       <style>{`
//         @keyframes spin { to { transform: rotate(360deg); } }
//         .mobile-cards { display: none !important; }
//         .desktop-table { display: block !important; }
//         @media (max-width: 768px) {
//           .mobile-cards { display: block !important; }
//           .desktop-table { display: none !important; }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default Material_Received;









import React, { useState, useEffect, useRef } from 'react';
import {
  Loader2, AlertCircle, CheckCircle, X, ChevronDown,
  RotateCcw, Package, FileText, Edit3,
  Camera, Trash2, Filter, MapPin, User, Search, ArrowRight,
  Calendar, Lock
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
  warning: '#f59e0b',
};

const labelStyle = {
  display: 'block', fontSize: 12, fontWeight: 600,
  color: T.navyLight, marginBottom: 6,
};
const inputBase = {
  width: '100%', padding: '10px 12px', fontSize: 14,
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

const Material_Received = () => {
  // ═══════════════════════════════════════════════
  // ✅ USER TYPE DETECTION
  // ═══════════════════════════════════════════════
  const userType = sessionStorage.getItem('userType');
  const isSignatureReqUser = userType === 'Signature Requirement';
  const LOCKED_SITE = 'Signature Heritage PRJ024';

  // Dropdowns
  const [siteNames, setSiteNames] = useState([]);
  const [siteSupervisorMap, setSiteSupervisorMap] = useState({});
  const [availableSupervisors, setAvailableSupervisors] = useState([]);
  const [selectedSiteName, setSelectedSiteName] = useState('');
  const [selectedSupervisorName, setSelectedSupervisorName] = useState('');

  // Data
  const [allRequests, setAllRequests] = useState([]);
  const [requests, setRequests] = useState([]);

  const [selectedVendor, setSelectedVendor] = useState('');
  const [selectedPO, setSelectedPO] = useState('');
  const [vendorOptions, setVendorOptions] = useState([]);
  const [poOptions, setPoOptions] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // UID Modal
  const [isUIDModalOpen, setIsUIDModalOpen] = useState(false);
  const [uidModalItems, setUidModalItems] = useState([]);
  const [selectedUIDs, setSelectedUIDs] = useState([]);
  const [currentPOForModal, setCurrentPOForModal] = useState('');

  // Receipt Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [receivedQuantities, setReceivedQuantities] = useState({});
  const [materialStatus, setMaterialStatus] = useState('');
  const [qualityCheck, setQualityCheck] = useState('');
  const [challanNo, setChallanNo] = useState('');
  const [truckDelivery, setTruckDelivery] = useState('');
  const [googleFormCompleted, setGoogleFormCompleted] = useState('');
  const [receivedDate, setReceivedDate] = useState('');
  const [photoData, setPhotoData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // ═══════════════════════════════════════════════
  // Fetch Dropdowns + Auto-Set for Signature User
  // ═══════════════════════════════════════════════
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/dropdowns`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        setSiteNames(data.siteNames || []);
        setSiteSupervisorMap(data.siteSupervisorMap || {});
        const all = Object.values(data.siteSupervisorMap || {}).flat().filter(Boolean).sort();
        setAvailableSupervisors(all);

        // ✅ Auto-set for Signature Requirement user
        if (isSignatureReqUser) {
          setSelectedSiteName(LOCKED_SITE);
          const supervisors = data.siteSupervisorMap?.[LOCKED_SITE.trim().toLowerCase()] || [];
          if (supervisors.length > 0) {
            setSelectedSupervisorName(supervisors[0]);
          }
        }
      } catch (err) { console.error(err); }
    };
    fetchDropdowns();
  }, []);

  // ✅ Auto-trigger filter for Signature Requirement user
  useEffect(() => {
    if (isSignatureReqUser && selectedSiteName && selectedSupervisorName) {
      handleFilter();
    }
    // eslint-disable-next-line
  }, [isSignatureReqUser, selectedSiteName, selectedSupervisorName]);

  useEffect(() => {
    // ✅ Skip for signature user (already locked)
    if (isSignatureReqUser) return;

    if (!selectedSiteName) {
      setAvailableSupervisors(Object.values(siteSupervisorMap).flat().filter(Boolean).sort());
      return;
    }
    setAvailableSupervisors(siteSupervisorMap[selectedSiteName.trim().toLowerCase()] || []);
    setSelectedSupervisorName('');
  }, [selectedSiteName, siteSupervisorMap, isSignatureReqUser]);

  // Main Filter
  const handleFilter = async () => {
    try {
      setLoading(true); setError(null);
      setSelectedVendor(''); setSelectedPO('');

      const url = new URL(`${import.meta.env.VITE_BACKEND_URL}/api/get-material-received-filter-data`);
      if (selectedSiteName) url.searchParams.append('siteName', selectedSiteName);
      if (selectedSupervisorName) url.searchParams.append('supervisorName', selectedSupervisorName);

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        setAllRequests(data.data);
        setRequests(data.data);
        setVendorOptions([...new Set(data.data.map(r => r.vendorName).filter(Boolean))].sort());
        setPoOptions([...new Set(data.data.map(r => r.poNumber).filter(Boolean))].sort());
      } else {
        setAllRequests([]); setRequests([]);
        setVendorOptions([]); setPoOptions([]);
      }
    } catch (err) {
      console.error(err); setError('Failed to load data');
      setAllRequests([]); setRequests([]);
    } finally { setLoading(false); }
  };

  const applySubFilter = (vendor, po) => {
    let filtered = [...allRequests];
    if (vendor) filtered = filtered.filter(r => r.vendorName === vendor);
    if (po) filtered = filtered.filter(r => r.poNumber === po);
    setRequests(filtered);

    const poSource = vendor ? allRequests.filter(r => r.vendorName === vendor) : allRequests;
    setPoOptions([...new Set(poSource.map(r => r.poNumber).filter(Boolean))].sort());

    const vendorSource = po ? allRequests.filter(r => r.poNumber === po) : allRequests;
    setVendorOptions([...new Set(vendorSource.map(r => r.vendorName).filter(Boolean))].sort());
  };

  const handleVendorChange = (vendor) => {
    setSelectedVendor(vendor);
    applySubFilter(vendor, selectedPO);
  };

  const handlePOChange = (po) => {
    setSelectedPO(po);
    applySubFilter(selectedVendor, po);
  };

  const clearSubFilters = () => {
    setSelectedVendor(''); setSelectedPO('');
    setRequests(allRequests);
    setVendorOptions([...new Set(allRequests.map(r => r.vendorName).filter(Boolean))].sort());
    setPoOptions([...new Set(allRequests.map(r => r.poNumber).filter(Boolean))].sort());
  };

  const openUIDModal = (req) => {
    if (!req.poNumber) return;
    const poItems = requests.filter(r => r.poNumber === req.poNumber && r.vendorName === req.vendorName);
    setUidModalItems(poItems);
    setSelectedUIDs(poItems.map(i => i.uid));
    setCurrentPOForModal(req.poNumber);
    setIsUIDModalOpen(true);
    setError(null);
  };

  const handleSelectAllUIDs = (e) => {
    setSelectedUIDs(e.target.checked ? uidModalItems.map(i => i.uid) : []);
  };

  const handleUIDToggle = (uid) => {
    setSelectedUIDs(prev => prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]);
  };

  const goToReceiptForm = () => {
    if (selectedUIDs.length === 0) return;
    const firstUID = uidModalItems.find(i => i.uid === selectedUIDs[0]);
    setSelectedRequest({ ...firstUID, selectedUIDs, uidModalItems });
    setIsUIDModalOpen(false);

    const qtyMap = {};
    selectedUIDs.forEach(uid => { qtyMap[uid] = ''; });
    setReceivedQuantities(qtyMap);

    setMaterialStatus(''); setQualityCheck(''); setChallanNo('');
    setTruckDelivery(''); setGoogleFormCompleted('');
    setReceivedDate('');
    setPhotoData(null); setIsModalOpen(true);
    setShowSuccess(false); setError(null); setIsCameraReady(false);
  };

  const closeModal = () => {
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    setIsModalOpen(false); setSelectedRequest(null);
    setIsSaving(false); setShowSuccess(false);
  };

  const startCamera = async (facingMode) => {
    try {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { exact: facingMode } } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener('loadeddata', () => setIsCameraReady(true), { once: true });
        await videoRef.current.play();
      }
    } catch (err) {
      console.error(err); setError('Camera access failed.'); setIsCameraReady(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current && streamRef.current && isCameraReady) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx && videoRef.current.videoWidth > 0) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);
        setPhotoData(canvasRef.current.toDataURL('image/jpeg'));
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null; videoRef.current.srcObject = null;
        setIsCameraReady(false);
      }
    }
  };

  const validate = () => {
    if (!materialStatus || !qualityCheck || !challanNo || !truckDelivery || !photoData || !receivedDate) return false;
    if (truckDelivery === 'Yes' && !googleFormCompleted) return false;
    const uids = selectedRequest?.selectedUIDs || [];
    return uids.every(uid => receivedQuantities[uid] && parseFloat(receivedQuantities[uid]) > 0);
  };

  const handleSave = async () => {
    if (!validate()) { setError('Fill all fields, date & qty for each UID.'); return; }
    const uids = selectedRequest.selectedUIDs || [selectedRequest.uid];

    try {
      setIsSaving(true); setError(null);
      for (const uid of uids) {
        const item = selectedRequest.uidModalItems?.find(i => i.uid === uid) || selectedRequest;

        const payload = {
          uid: uid,
          reqNo: item.reqNo || '',
          siteName: item.siteName || '',
          supervisorName: item.supervisorName || '',
          materialType: item.materialType || '',
          skuCode: item.skuCode || '',
          materialName: item.materialName || '',
          materialSize: item.materialSize || '',
          materialSpecification: item.materialSpecification || '',
          unitName: item.unitName || '',
          receivedQty: parseFloat(receivedQuantities[uid]),
          status: materialStatus,
          challanNo: challanNo,
          qualityApproved: qualityCheck,
          truckDelivery: truckDelivery,
          googleFormCompleted: googleFormCompleted,
          photo: photoData,
          vendorName: item.vendorName || '',
          receivedDate: receivedDate,
        };

        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/save-material-receipt`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed');
      }
      setShowSuccess(true);
      if (materialStatus === 'Full Material') {
        setAllRequests(prev => prev.filter(r => !uids.includes(r.uid)));
        setRequests(prev => prev.filter(r => !uids.includes(r.uid)));
      }
      setTimeout(async () => { closeModal(); await handleFilter(); }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to save');
    } finally { setIsSaving(false); }
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 8px' }}>

      {/* Header */}
      <div style={{
        background: T.card, borderRadius: 10, border: `1px solid ${T.border}`,
        padding: '12px 16px', marginBottom: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package size={18} color={T.gold} />
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: T.navy, margin: 0 }}>Material Received</h2>
            <p style={{ fontSize: 12, color: T.textMuted, margin: 0 }}>
              {requests.length > 0 ? `${requests.length} pending` : 'Filter to see materials'}
            </p>
          </div>
        </div>
        {allRequests.length > 0 && (
          <button onClick={handleFilter} disabled={loading} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8,
            border: `1.5px solid ${T.border}`, background: T.card, color: T.textLight, fontSize: 13,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}>
            {loading ? <><Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Refreshing...</> : <><RotateCcw size={14} /> Refresh</>}
          </button>
        )}
      </div>

      {/* Filter Card */}
      <div style={{ background: T.card, borderRadius: 10, border: `1px solid ${T.border}`, padding: '14px 16px', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${T.border}` }}>
          <Filter size={16} color={T.gold} />
          <span style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>Filter</span>

          {/* ✅ Locked User Badge */}
          {isSignatureReqUser && (
            <span style={{
              marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 11, fontWeight: 600, color: T.goldDark,
              background: `${T.gold}15`, padding: '4px 10px', borderRadius: 12,
              border: `1px solid ${T.gold}40`,
            }}>
              <Lock size={12} /> Signature Requirement User
            </span>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 10, alignItems: 'end', marginBottom: 10 }}>

          {/* ═══════════════════════════════════════════════ */}
          {/* ✅ SITE - Locked for Signature Requirement User */}
          {/* ═══════════════════════════════════════════════ */}
          <div>
            <label style={labelStyle}>
              <MapPin size={12} style={{ display: 'inline', marginRight: 4 }} />
              Site
              {isSignatureReqUser && (
                <span style={{
                  marginLeft: 6, fontSize: 9, color: T.gold,
                  background: `${T.gold}15`, padding: '2px 6px',
                  borderRadius: 6, fontWeight: 700,
                }}>🔒 LOCKED</span>
              )}
            </label>

            {isSignatureReqUser ? (
              // ✅ Locked - Read-only input
              <input
                type="text"
                value={selectedSiteName}
                readOnly
                style={{
                  ...inputBase,
                  borderLeft: `3px solid ${T.gold}`,
                  background: `${T.gold}08`,
                  color: T.navy,
                  fontWeight: 600,
                  cursor: 'not-allowed',
                }}
              />
            ) : (
              // Normal - Dropdown
              <div style={{ position: 'relative' }}>
                <select value={selectedSiteName} onChange={e => setSelectedSiteName(e.target.value)}
                  style={{ ...inputBase, paddingRight: 30, appearance: 'none', cursor: 'pointer' }}
                  onFocus={focusGold} onBlur={blurNormal}>
                  <option value="">All Sites</option>
                  {siteNames.map((s, i) => <option key={i} value={s}>{s}</option>)}
                </select>
                <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: T.textMuted, pointerEvents: 'none' }} />
              </div>
            )}
          </div>

          {/* ═══════════════════════════════════════════════ */}
          {/* ✅ SUPERVISOR - Locked for Signature Requirement User */}
          {/* ═══════════════════════════════════════════════ */}
          <div>
            <label style={labelStyle}>
              <User size={12} style={{ display: 'inline', marginRight: 4 }} />
              Supervisor
              {isSignatureReqUser && (
                <span style={{
                  marginLeft: 6, fontSize: 9, color: T.gold,
                  background: `${T.gold}15`, padding: '2px 6px',
                  borderRadius: 6, fontWeight: 700,
                }}>🔒 LOCKED</span>
              )}
            </label>

            {isSignatureReqUser ? (
              // ✅ Locked - Read-only input
              <input
                type="text"
                value={selectedSupervisorName || 'Loading...'}
                readOnly
                style={{
                  ...inputBase,
                  borderLeft: `3px solid ${T.gold}`,
                  background: `${T.gold}08`,
                  color: T.navy,
                  fontWeight: 600,
                  cursor: 'not-allowed',
                }}
              />
            ) : (
              // Normal - Dropdown
              <div style={{ position: 'relative' }}>
                <select value={selectedSupervisorName} onChange={e => setSelectedSupervisorName(e.target.value)}
                  disabled={!availableSupervisors.length}
                  style={{ ...inputBase, paddingRight: 30, appearance: 'none', cursor: 'pointer' }}
                  onFocus={focusGold} onBlur={blurNormal}>
                  <option value="">All</option>
                  {availableSupervisors.map((s, i) => <option key={i} value={s}>{s}</option>)}
                </select>
                <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: T.textMuted, pointerEvents: 'none' }} />
              </div>
            )}
          </div>

          <button onClick={handleFilter} disabled={loading} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '10px 20px', borderRadius: 8, border: 'none',
            background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
            color: T.navyDark, fontSize: 13, fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer', height: 42,
            boxShadow: `0 2px 8px ${T.gold}40`, minWidth: 100,
          }}>
            {loading ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : <><Search size={14} /> Filter</>}
          </button>
        </div>

        {allRequests.length > 0 && (
          <div style={{ borderTop: `1px dashed ${T.border}`, paddingTop: 10 }}>
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
                <label style={labelStyle}>📋 PO No</label>
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
                <button onClick={clearSubFilters} style={{ padding: '3px 8px', borderRadius: 6, border: `1px solid ${T.border}`, background: T.card, color: T.textLight, fontSize: 11, cursor: 'pointer' }}>✕ Clear</button>
                <span style={{ fontSize: 11, color: T.textMuted, marginLeft: 'auto' }}>{requests.length} records</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error */}
      {error && !isModalOpen && !isUIDModalOpen && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: T.dangerBg, border: `1px solid ${T.dangerBorder}`, borderRadius: 8, marginBottom: 12, fontSize: 13, color: T.danger }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Table & rest same as before */}
      <div style={{ background: T.card, borderRadius: 10, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
        {requests.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '50px 20px' }}>
            <Package size={40} color={T.border} style={{ marginBottom: 12 }} />
            <p style={{ fontSize: 14, color: T.textLight }}>
              {loading ? 'Loading...' : allRequests.length > 0 ? 'No data for filters' : 'Apply filter to see materials'}
            </p>
          </div>
        ) : (
          <>
            {/* MOBILE CARDS */}
            <div className="mobile-cards" style={{ display: 'none' }}>
              {requests.map((req, idx) => (
                <div key={req.uid + idx} style={{
                  padding: '14px 16px', borderBottom: `1px solid ${T.border}`,
                  background: idx % 2 === 0 ? T.card : T.borderLight,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
                        <span style={{ background: `${T.navy}15`, color: T.navy, padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>{req.uid}</span>
                        <span style={{ background: `${T.gold}15`, color: T.goldDark, padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{req.reqNo}</span>
                        {req.poNumber && <span style={{ background: T.navy, color: T.gold, padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700 }}>PO: {req.poNumber}</span>}
                      </div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: T.navy, margin: 0 }}>{req.materialName}</p>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                        {req.materialSize && <span style={{ fontSize: 11, color: T.goldDark, background: `${T.gold}15`, padding: '1px 6px', borderRadius: 4 }}>📏 {req.materialSize}</span>}
                        {req.materialSpecification && <span style={{ fontSize: 11, color: T.purple, background: `${T.purple}15`, padding: '1px 6px', borderRadius: 4 }}>📋 {req.materialSpecification}</span>}
                      </div>
                    </div>
                    <button onClick={() => openUIDModal(req)} style={{
                      width: 40, height: 40, borderRadius: 10,
                      border: `2px solid ${T.gold}`, background: `${T.gold}15`,
                      color: T.goldDark, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, marginLeft: 10,
                    }}>
                      <Edit3 size={18} />
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px', fontSize: 12 }}>
                    <div><span style={{ color: T.textMuted }}>Site:</span> <strong>{req.siteName}</strong></div>
                    <div><span style={{ color: T.textMuted }}>Supervisor:</span> <strong>{req.supervisorName}</strong></div>
                    <div><span style={{ color: T.textMuted }}>Vendor:</span> <strong>{req.vendorName}</strong></div>
                    <div><span style={{ color: T.textMuted }}>Type:</span> {req.materialType}</div>
                    <div>
                      <span style={{ color: T.textMuted }}>Order Qty:</span>
                      <strong> {req.revisedQty || req.orderQty} {req.unitName}</strong>
                    </div>
                    <div>
                      <span style={{ color: T.textMuted }}>Received:</span>
                      <strong style={{ color: parseFloat(req.receivedQty) > 0 ? T.success : T.textMuted }}>
                        {' '}{req.receivedQty || 0}
                      </strong>
                    </div>
                    {req.brandName && <div><span style={{ color: T.textMuted }}>Brand:</span> <span style={{ color: T.purple, fontWeight: 600 }}>{req.brandName}</span></div>}
                    {req.skuCode && <div><span style={{ color: T.textMuted }}>SKU:</span> <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{req.skuCode}</span></div>}
                  </div>

                  {req.pdfPO && (
                    <a href={req.pdfPO} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 8, padding: '4px 10px', borderRadius: 6, background: T.navy, color: T.gold, fontSize: 11, fontWeight: 700, textDecoration: 'none' }}>
                      <FileText size={11} /> View PO PDF
                    </a>
                  )}
                </div>
              ))}
            </div>

            {/* DESKTOP TABLE */}
            <div className="desktop-table" style={{ overflowX: 'auto', maxHeight: '65vh', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                  <tr style={{ background: T.navy }}>
                    {['#', 'UID', 'Req No', 'Site', 'Supervisor', 'Type', 'Material', 'Size', 'Specification', 'SKU', 'Brand', 'Order Qty', 'Received', 'Unit', 'Vendor', 'PO No', 'PO PDF', 'Action'].map(h => (
                      <th key={h} style={{
                        padding: '12px 14px', textAlign: h === 'Action' ? 'center' : h.includes('Qty') || h === 'Received' ? 'right' : 'left',
                        color: T.goldLight, fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                        letterSpacing: 0.5, whiteSpace: 'nowrap', borderBottom: `2px solid ${T.gold}`,
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req, idx) => (
                    <tr key={req.uid + idx}
                      style={{ background: idx % 2 === 0 ? T.card : T.borderLight }}
                      onMouseEnter={e => { e.currentTarget.style.background = `${T.gold}08`; }}
                      onMouseLeave={e => { e.currentTarget.style.background = idx % 2 === 0 ? T.card : T.borderLight; }}>
                      <td style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}` }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: 6, background: T.borderLight, fontSize: 12, fontWeight: 600, color: T.textLight }}>{idx + 1}</span>
                      </td>
                      <td style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}` }}>
                        <span style={{ background: `${T.navy}15`, color: T.navy, padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>{req.uid}</span>
                      </td>
                      <td style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}` }}>
                        <span style={{ background: `${T.gold}15`, color: T.goldDark, padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>{req.reqNo}</span>
                      </td>
                      <td style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}`, maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.siteName || '—'}</td>
                      <td style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}`, maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.supervisorName || '—'}</td>
                      <td style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}` }}>{req.materialType || '—'}</td>
                      <td style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}`, fontWeight: 600, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.materialName || '—'}</td>
                      <td style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}` }}>
                        {req.materialSize ? <span style={{ background: `${T.gold}15`, color: T.goldDark, padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>📏 {req.materialSize}</span> : '—'}
                      </td>
                      <td style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}`, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {req.materialSpecification ? (
                          <span style={{ background: `${T.purple}15`, color: T.purple, padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
                            📋 {req.materialSpecification}
                          </span>
                        ) : '—'}
                      </td>
                      <td style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}` }}>
                        {req.skuCode ? <span style={{ fontFamily: 'monospace', fontSize: 11, background: T.borderLight, padding: '2px 6px', borderRadius: 4, color: T.textLight }}>{req.skuCode}</span> : '—'}
                      </td>
                      <td style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}` }}>
                        {req.brandName ? <span style={{ background: `${T.purple}15`, color: T.purple, padding: '3px 8px', borderRadius: 5, fontSize: 11, fontWeight: 600 }}>{req.brandName}</span> : '—'}
                      </td>
                      <td style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}`, textAlign: 'right', fontWeight: 600 }}>{req.revisedQty || req.orderQty || '—'}</td>
                      <td style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}`, textAlign: 'right' }}>
                        <span style={{ background: parseFloat(req.receivedQty) > 0 ? `${T.success}15` : T.borderLight, color: parseFloat(req.receivedQty) > 0 ? T.success : T.textMuted, padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>{req.receivedQty || 0}</span>
                      </td>
                      <td style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}` }}>{req.unitName || '—'}</td>
                      <td style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}`, maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.vendorName || '—'}</td>
                      <td style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}` }}>
                        {req.poNumber ? <span style={{ background: T.navy, color: T.gold, padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>{req.poNumber}</span> : '—'}
                      </td>
                      <td style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}`, textAlign: 'center' }}>
                        {req.pdfPO ? <a href={req.pdfPO} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '4px 8px', borderRadius: 5, background: T.navy, color: T.gold, fontSize: 11, fontWeight: 700, textDecoration: 'none' }}><FileText size={11} /> PDF</a> : '—'}
                      </td>
                      <td style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}`, textAlign: 'center' }}>
                        <button onClick={() => openUIDModal(req)} style={{
                          width: 34, height: 34, borderRadius: 8, border: `1.5px solid ${T.gold}40`,
                          background: `${T.gold}10`, color: T.goldDark, cursor: 'pointer',
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
          </>
        )}
      </div>

      {/* MODAL 1: UID Selection - Same as before */}
      {isUIDModalOpen && (
        <>
          <div onClick={() => setIsUIDModalOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(2px)', zIndex: 100 }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '95%', maxWidth: 700, background: T.card, borderRadius: 14,
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)', zIndex: 101,
            display: 'flex', flexDirection: 'column', maxHeight: '85vh',
          }}>
            <div style={{ background: T.navy, padding: '14px 16px', borderBottom: `2px solid ${T.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '14px 14px 0 0' }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'white', margin: 0 }}>
                  PO: <span style={{ color: T.gold }}>{currentPOForModal}</span>
                </h3>
                <p style={{ fontSize: 11, color: T.textMuted, margin: 0 }}>{selectedUIDs.length}/{uidModalItems.length} selected</p>
              </div>
              <button onClick={() => setIsUIDModalOpen(false)} style={{ width: 30, height: 30, borderRadius: 6, border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, padding: '8px 10px', background: T.borderLight, borderRadius: 8 }}>
                <input type="checkbox" onChange={handleSelectAllUIDs}
                  checked={selectedUIDs.length === uidModalItems.length && uidModalItems.length > 0}
                  style={{ width: 18, height: 18 }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: T.navy }}>Select All ({uidModalItems.length})</span>
              </div>

              {uidModalItems.map((item) => (
                <div key={item.uid} onClick={() => handleUIDToggle(item.uid)}
                  style={{
                    padding: '12px 14px', marginBottom: 8, borderRadius: 8, cursor: 'pointer',
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
                        {item.materialSpecification && (
                          <span style={{ background: `${T.purple}15`, color: T.purple, padding: '2px 7px', borderRadius: 5, fontSize: 11, fontWeight: 600 }}>
                            📋 {item.materialSpecification}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 12, fontSize: 11, color: T.textLight, flexWrap: 'wrap' }}>
                        {item.materialSize && <span>📏 {item.materialSize}</span>}
                        <span>Qty: <strong>{item.revisedQty || item.orderQty} {item.unitName}</strong></span>
                        <span>Rec: <strong style={{ color: parseFloat(item.receivedQty) > 0 ? T.success : T.textMuted }}>{item.receivedQty || 0}</strong></span>
                        {item.status8 && <span style={{
                          background: item.status8 === 'Full Material' ? `${T.success}15` : `${T.warning}20`,
                          color: item.status8 === 'Full Material' ? T.success : '#92400e',
                          padding: '1px 6px', borderRadius: 4, fontWeight: 600,
                        }}>{item.status8}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: '12px 16px', borderTop: `1px solid ${T.border}`, background: T.borderLight, display: 'flex', justifyContent: 'space-between', borderRadius: '0 0 14px 14px' }}>
              <button onClick={() => setIsUIDModalOpen(false)} style={{ padding: '10px 20px', borderRadius: 8, border: `1.5px solid ${T.border}`, background: T.card, color: T.textLight, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={goToReceiptForm} disabled={selectedUIDs.length === 0}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5, padding: '10px 20px', borderRadius: 8, border: 'none',
                  background: selectedUIDs.length > 0 ? `linear-gradient(135deg, ${T.gold}, ${T.goldDark})` : T.border,
                  color: selectedUIDs.length > 0 ? T.navyDark : T.textMuted,
                  fontSize: 13, fontWeight: 700, cursor: selectedUIDs.length > 0 ? 'pointer' : 'not-allowed',
                }}>
                Next ({selectedUIDs.length}) <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </>
      )}

      {/* MODAL 2: Receipt Form - Same as before */}
      {isModalOpen && selectedRequest && (
        <>
          <div onClick={closeModal} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(2px)', zIndex: 100 }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '95%', maxWidth: 650, background: T.card, borderRadius: 14,
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)', zIndex: 101,
            display: 'flex', flexDirection: 'column', maxHeight: '92vh',
          }}>
            <div style={{ background: T.navy, padding: '14px 16px', borderBottom: `2px solid ${T.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, borderRadius: '14px 14px 0 0' }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'white', margin: 0 }}>Material Receipt</h3>
                <p style={{ fontSize: 11, color: T.textMuted, margin: 0 }}>
                  {(selectedRequest.selectedUIDs?.length || 1)} UIDs | PO: {selectedRequest.poNumber}
                </p>
              </div>
              <button onClick={closeModal} disabled={isSaving} style={{ width: 30, height: 30, borderRadius: 6, border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {showSuccess && <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px', background: T.successBg, border: `1px solid ${T.successBorder}`, borderRadius: 8, fontSize: 13, color: '#065f46' }}><CheckCircle size={16} color={T.success} /> All saved! Refreshing...</div>}
              {error && <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px', background: T.dangerBg, border: `1px solid ${T.dangerBorder}`, borderRadius: 8, fontSize: 13, color: T.danger }}><AlertCircle size={16} /> {error}</div>}

              <div>
                <label style={{ ...labelStyle, fontSize: 13 }}>
                  📦 Qty Per Material <span style={{ color: T.danger }}>*</span>
                </label>

                {(selectedRequest.selectedUIDs || []).map((uid) => {
                  const item = selectedRequest.uidModalItems?.find(it => it.uid === uid) || selectedRequest;
                  const qty = receivedQuantities[uid];
                  const isFilled = qty && parseFloat(qty) > 0;
                  return (
                    <div key={uid} style={{
                      padding: '10px 12px', marginBottom: 8, borderRadius: 8,
                      border: `1.5px solid ${isFilled ? T.success : T.danger}20`,
                      background: isFilled ? `${T.success}05` : T.card,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                        <span style={{ background: `${T.navy}15`, color: T.navy, padding: '2px 7px', borderRadius: 5, fontWeight: 700, fontSize: 12 }}>{uid}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>{item.materialName}</span>
                        {item.materialSpecification && (
                          <span style={{ background: `${T.purple}15`, color: T.purple, padding: '2px 7px', borderRadius: 5, fontSize: 11, fontWeight: 600 }}>
                            📋 {item.materialSpecification}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', gap: 8, fontSize: 11, color: T.textLight }}>
                          {item.materialSize && <span>📏 {item.materialSize}</span>}
                          <span>Order: <strong>{item.revisedQty || item.orderQty}</strong></span>
                          <span>Rec: <strong style={{ color: T.success }}>{item.receivedQty || 0}</strong></span>
                        </div>
                        <input
                          type="number"
                          value={receivedQuantities[uid] || ''}
                          onChange={e => setReceivedQuantities(prev => ({ ...prev, [uid]: e.target.value }))}
                          disabled={isSaving}
                          placeholder="Enter Qty"
                          min="0" step="0.01"
                          style={{
                            width: 120, textAlign: 'center', padding: '8px 10px',
                            fontSize: 14, fontWeight: 700,
                            border: `2px solid ${isFilled ? T.success : T.danger}`,
                            borderRadius: 8, outline: 'none', background: T.card,
                            marginLeft: 'auto',
                          }}
                          onFocus={e => { e.target.style.borderColor = T.gold; e.target.style.boxShadow = `0 0 0 3px ${T.gold}20`; }}
                          onBlur={e => { e.target.style.borderColor = isFilled ? T.success : T.danger; e.target.style.boxShadow = 'none'; }}
                        />
                      </div>
                    </div>
                  );
                })}

                <div style={{ padding: '6px 12px', background: T.borderLight, borderRadius: 8, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: T.textMuted }}>
                    ✅ {Object.values(receivedQuantities).filter(v => v && parseFloat(v) > 0).length}/{(selectedRequest.selectedUIDs || []).length} filled
                  </span>
                  <span style={{ fontWeight: 700, color: T.navy }}>
                    Total: {Object.values(receivedQuantities).reduce((s, v) => s + (parseFloat(v) || 0), 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div style={{ padding: '14px', background: `${T.gold}08`, borderRadius: 10, border: `1px dashed ${T.gold}50` }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: T.goldDark, margin: '0 0 12px 0' }}>
                  ⚡ Common Fields — All {(selectedRequest.selectedUIDs || []).length} UIDs
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Status <span style={{ color: T.danger }}>*</span></label>
                    <select value={materialStatus} onChange={e => setMaterialStatus(e.target.value)}
                      disabled={isSaving} style={{ ...inputBase, appearance: 'none', cursor: 'pointer' }} onFocus={focusGold} onBlur={blurNormal}>
                      <option value="">-- Select --</option>
                      <option value="Partition">⚠️ Partition</option>
                      <option value="Full Material">✅ Full Material</option>
                    </select>
                    {materialStatus === 'Full Material' && <p style={{ fontSize: 11, color: T.success, marginTop: 4, fontWeight: 600 }}>✅ UIDs removed after save</p>}
                    {materialStatus === 'Partition' && <p style={{ fontSize: 11, color: '#92400e', marginTop: 4, fontWeight: 600 }}>⚠️ UIDs stay for next delivery</p>}
                  </div>

                  <div>
                    <label style={labelStyle}>
                      <Calendar size={12} style={{ display: 'inline', marginRight: 4 }} />
                      Received Date <span style={{ color: T.danger }}>*</span>
                      <span style={{ marginLeft: 8, fontSize: 10, color: T.textMuted, background: T.borderLight, padding: '2px 6px', borderRadius: 4 }}>
                        → Column R
                      </span>
                    </label>
                    <input type="date" value={receivedDate}
                      onChange={e => setReceivedDate(e.target.value)}
                      disabled={isSaving}
                      style={{ ...inputBase, borderColor: !receivedDate ? T.danger : T.border }}
                      onFocus={focusGold} onBlur={blurNormal} />
                  </div>

                  <div>
                    <label style={labelStyle}>Quality <span style={{ color: T.danger }}>*</span></label>
                    <select value={qualityCheck} onChange={e => setQualityCheck(e.target.value)}
                      disabled={isSaving} style={{ ...inputBase, appearance: 'none', cursor: 'pointer' }} onFocus={focusGold} onBlur={blurNormal}>
                      <option value="">-- Select --</option>
                      <option value="Approved">✅ Approved</option>
                      <option value="Reject">❌ Reject</option>
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>Challan No <span style={{ color: T.danger }}>*</span></label>
                    <input type="text" value={challanNo} onChange={e => setChallanNo(e.target.value)}
                      disabled={isSaving} placeholder="Challan number" style={inputBase} onFocus={focusGold} onBlur={blurNormal} />
                  </div>

                  <div>
                    <label style={labelStyle}>Truck Delivery <span style={{ color: T.danger }}>*</span></label>
                    <select value={truckDelivery} onChange={e => setTruckDelivery(e.target.value)}
                      disabled={isSaving} style={{ ...inputBase, appearance: 'none', cursor: 'pointer' }} onFocus={focusGold} onBlur={blurNormal}>
                      <option value="">-- Select --</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>

                  {truckDelivery === 'Yes' && (
                    <div>
                      <label style={labelStyle}>Google Form? <span style={{ color: T.danger }}>*</span></label>
                      <select value={googleFormCompleted} onChange={e => setGoogleFormCompleted(e.target.value)}
                        disabled={isSaving} style={{ ...inputBase, appearance: 'none', cursor: 'pointer' }} onFocus={focusGold} onBlur={blurNormal}>
                        <option value="">-- Select --</option>
                        <option value="Yes">✅ Yes</option>
                        <option value="No">❌ No</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label style={labelStyle}><Camera size={12} style={{ display: 'inline', marginRight: 4 }} />Challan Photo <span style={{ color: T.danger }}>*</span></label>
                {!photoData && !streamRef.current && (
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <button onClick={() => startCamera('environment')} disabled={isSaving}
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '12px', borderRadius: 8, border: 'none', background: T.navy, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                      <Camera size={16} /> Back Camera
                    </button>
                    <button onClick={() => startCamera('user')} disabled={isSaving}
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '12px', borderRadius: 8, border: 'none', background: T.navyLight, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                      <Camera size={16} /> Front
                    </button>
                  </div>
                )}
                <video ref={videoRef} style={{ width: '100%', borderRadius: 8, display: photoData ? 'none' : (isCameraReady ? 'block' : 'none') }} autoPlay playsInline />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                {isCameraReady && !photoData && (
                  <button onClick={capturePhoto} style={{
                    width: '100%', marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '12px', borderRadius: 8, border: 'none',
                    background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
                    color: T.navyDark, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  }}><Camera size={16} /> Capture</button>
                )}
                {photoData && (
                  <div>
                    <img src={photoData} alt="Challan" style={{ width: '100%', borderRadius: 8, marginBottom: 8, border: `2px solid ${T.successBorder}` }} />
                    <button onClick={() => setPhotoData(null)} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      padding: '8px 16px', borderRadius: 8, border: 'none',
                      background: T.dangerBg, color: T.danger, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    }}><Trash2 size={14} /> Retake</button>
                  </div>
                )}
              </div>
            </div>

            <div style={{ padding: '12px 16px', borderTop: `1px solid ${T.border}`, background: T.borderLight, flexShrink: 0, display: 'flex', justifyContent: 'space-between', gap: 10, borderRadius: '0 0 14px 14px' }}>
              <button onClick={() => { closeModal(); setIsUIDModalOpen(true); }} disabled={isSaving}
                style={{ padding: '10px 18px', borderRadius: 8, border: `1.5px solid ${T.border}`, background: T.card, color: T.textLight, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                ← Back
              </button>
              <button onClick={handleSave} disabled={isSaving || !validate()}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '10px 22px', borderRadius: 8, border: 'none',
                  background: validate() && !isSaving ? `linear-gradient(135deg, ${T.gold}, ${T.goldDark})` : T.border,
                  color: validate() && !isSaving ? T.navyDark : T.textMuted,
                  fontSize: 13, fontWeight: 700, cursor: validate() && !isSaving ? 'pointer' : 'not-allowed',
                }}>
                {isSaving
                  ? <><Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> Saving...</>
                  : <><CheckCircle size={15} /> Save ({(selectedRequest.selectedUIDs || []).length})</>}
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

export default Material_Received;