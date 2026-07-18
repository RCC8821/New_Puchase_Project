

// import React, { useState, useEffect } from "react";
// import {
//   Loader2, AlertCircle, CheckCircle, X, ChevronDown,
//   RotateCcw, Package, FileText, ArrowLeft, ArrowRight,
//   Check, Plus, Trash2, ExternalLink, Copy
// } from "lucide-react";

// const T = {
//   navy: '#1e293b', navyLight: '#334155', navyDark: '#0f172a',
//   gold: '#f59e0b', goldLight: '#fbbf24', goldDark: '#d97706',
//   bg: '#f8fafc', card: '#ffffff', text: '#1e293b',
//   textLight: '#64748b', textMuted: '#94a3b8',
//   border: '#e2e8f0', borderLight: '#f1f5f9',
//   success: '#10b981', successBg: '#ecfdf5', successBorder: '#a7f3d0',
//   danger: '#ef4444', dangerBg: '#fef2f2', dangerBorder: '#fecaca',
//   purple: '#7c3aed', purpleBg: '#f5f3ff',
// };

// const labelStyle = {
//   display: 'block', fontSize: 12, fontWeight: 600,
//   color: T.navyLight, marginBottom: 6, letterSpacing: 0.3
// };

// const inputBase = {
//   width: '100%', padding: '9px 12px', fontSize: 13,
//   border: `1.5px solid ${T.border}`, borderRadius: 8,
//   outline: 'none', color: T.text, background: T.borderLight,
//   transition: 'all 0.2s', boxSizing: 'border-box'
// };

// const inputReadonly = {
//   ...inputBase, background: '#eef2f7', color: T.textLight, cursor: 'default'
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

// // ✅ UPDATED Td - wrap prop added
// const Td = ({ children, right, maxW, wrap, center }) => (
//   <td style={{
//     padding: '10px 14px',
//     fontSize: 13,
//     color: T.text,
//     borderBottom: `1px solid ${T.border}`,
//     whiteSpace: wrap ? 'normal' : 'nowrap',
//     textAlign: right ? 'right' : center ? 'center' : 'left',
//     verticalAlign: 'top',
//   }}>
//     {maxW ? (
//       <span
//         title={typeof children === 'string' ? children : ''}
//         style={{
//           display: 'block', maxWidth: maxW,
//           overflow: 'hidden', textOverflow: 'ellipsis'
//         }}
//       >
//         {children || <span style={{ color: T.textMuted }}>—</span>}
//       </span>
//     ) : (
//       children || <span style={{ color: T.textMuted }}>—</span>
//     )}
//   </td>
// );

// const Field = ({ label, required, children }) => (
//   <div>
//     <label style={labelStyle}>
//       {label}
//       {required && <span style={{ color: T.danger, marginLeft: 2 }}>*</span>}
//     </label>
//     {children}
//   </div>
// );

// const Sel = ({ value, onChange, disabled, children, invalid }) => (
//   <div style={{ position: 'relative' }}>
//     <select
//       value={value}
//       onChange={onChange}
//       disabled={disabled}
//       style={{
//         ...inputBase,
//         paddingRight: 32,
//         appearance: 'none',
//         cursor: disabled ? 'not-allowed' : 'pointer',
//         borderColor: invalid ? T.danger : T.border,
//         opacity: disabled ? 0.7 : 1
//       }}
//       onFocus={focusGold}
//       onBlur={blurNormal}
//     >
//       {children}
//     </select>
//     <ChevronDown size={14} style={{
//       position: 'absolute', right: 10, top: '50%',
//       transform: 'translateY(-50%)', color: T.textMuted, pointerEvents: 'none'
//     }} />
//   </div>
// );

// const Take_Quotation = () => {
//   const [requests, setRequests] = useState([]);
//   const [vendorOptions, setVendorOptions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [currentStep, setCurrentStep] = useState(1);
//   const [selectedIndent, setSelectedIndent] = useState(null);
//   const [status4, setStatus4] = useState('Done');
//   const [noOfQuotation4, setNoOfQuotation4] = useState('');
//   const [isSaving, setIsSaving] = useState(false);
//   const [saveSuccess, setSaveSuccess] = useState(false);
//   const [saveError, setSaveError] = useState('');
//   const [selectedVendors, setSelectedVendors] = useState([]);
//   const [addedMaterials, setAddedMaterials] = useState([]);

//   useEffect(() => {
//     setNoOfQuotation4(selectedVendors.length.toString());
//   }, [selectedVendors]);

//   const fetchData = async () => {
//     setLoading(true); setError(null);
//     try {
//       const [reqRes, vendorRes] = await Promise.all([
//         fetch(`${import.meta.env.VITE_BACKEND_URL}/api/get-take-Quotation`),
//         fetch(`${import.meta.env.VITE_BACKEND_URL}/api/vendors`),
//       ]);
//       if (reqRes.ok) {
//         const d = await reqRes.json();
//         setRequests(Array.isArray(d.data) ? d.data : []);
//       } else { setRequests([]); }
//       if (vendorRes.ok) {
//         const v = await vendorRes.json();
//         setVendorOptions(Array.isArray(v) ? v : []);
//       }
//     } catch (err) {
//       console.error(err); setError('Failed to load data.');
//     } finally { setLoading(false); }
//   };

//   useEffect(() => { fetchData(); }, []);

//   const uniqueIndents = [
//     ...new Set(requests.filter(r => r.INDENT_NUMBER_3).map(r => r.INDENT_NUMBER_3))
//   ].sort();

//   const indentItems = selectedIndent
//     ? requests.filter(r => r.INDENT_NUMBER_3 === selectedIndent)
//     : [];

//   const addedUIDs = new Set(addedMaterials.map(m => m.selectedUID));

//   const openModal = () => {
//     setIsModalOpen(true); setCurrentStep(1); setSelectedIndent(null);
//     setSelectedVendors([]); setAddedMaterials([]);
//     setStatus4('Done'); setNoOfQuotation4('');
//     setSaveSuccess(false); setSaveError('');
//   };

//   const closeModal = () => {
//     setIsModalOpen(false); setCurrentStep(1); setSelectedIndent(null);
//     setSelectedVendors([]); setAddedMaterials([]);
//     setIsSaving(false); setSaveSuccess(false); setSaveError('');
//   };

//   const addVendor = () => {
//     setSelectedVendors(prev => [...prev, {
//       firm: '', name: '', gst: '', contact: '', address: '',
//       deliveryDate: '', billType: '', paymentTerms: '', creditInDays: '',
//       transportRequired: '', expectedTransportCharges: '',
//       freightCharges: '', expectedFreightCharges: '',
//     }]);
//     setAddedMaterials(prev => prev.map(mat => ({
//       ...mat,
//       vendorRates: [
//         ...mat.vendorRates,
//         {
//           rate: '',
//           brandName: mat['DECIDED_BRAND/COMPANY_NAME_2'] || '',
//           discount: '',
//         },
//       ],
//     })));
//   };

//   const removeVendor = (vIdx) => {
//     setSelectedVendors(prev => prev.filter((_, i) => i !== vIdx));
//     setAddedMaterials(prev => prev.map(mat => ({
//       ...mat,
//       vendorRates: mat.vendorRates.filter((_, i) => i !== vIdx),
//     })));
//   };

//   const handleVendorChange = (vIdx, field, value) => {
//     const u = [...selectedVendors];
//     u[vIdx][field] = value;
//     if (field === 'firm') {
//       const v = vendorOptions.find(o => o.vendorFirm === value);
//       u[vIdx].gst = v?.gstNumber || '';
//       u[vIdx].contact = v?.contactNo || '';
//       u[vIdx].name = v?.vendorName || '';
//     }
//     if (field === 'paymentTerms' && value !== 'Credit') u[vIdx].creditInDays = '';
//     if (field === 'transportRequired' && value !== 'Yes') u[vIdx].expectedTransportCharges = '';
//     if (field === 'freightCharges' && value !== 'Yes') u[vIdx].expectedFreightCharges = '';
//     setSelectedVendors(u);
//   };

//   const addMaterial = (uid) => {
//     if (!uid || addedUIDs.has(uid)) return;
//     const req = indentItems.find(r => r.UID === uid);
//     if (!req) return;
//     const decidedBrand = req.DECIDED_BRAND_2 || req['DECIDED_BRAND/COMPANY_NAME_2'] || '';
//     setAddedMaterials(prev => [...prev, {
//       selectedUID: uid,
//       Material_Name: req.Material_Name || '',
//       Material_Size: req.Material_Size || '',
//       Material_Specification: req.Specification || '',
//       Revised_Quantity: req.REVISED_QTY_2 || req.REVISED_QUANTITY_2 || '',
//       Unit_Name: req.Unit_Name || '',
//       'DECIDED_BRAND/COMPANY_NAME_2': decidedBrand,
//       cgst: '', sgst: '', igst: '',
//       vendorRates: selectedVendors.map(() => ({
//         rate: '', brandName: decidedBrand, discount: '',
//       })),
//     }]);
//   };

//   const removeMaterial = (mIdx) => {
//     setAddedMaterials(prev => prev.filter((_, i) => i !== mIdx));
//   };

//   const handleMaterialTax = (mIdx, field, value) => {
//     const u = [...addedMaterials];
//     u[mIdx][field] = value;
//     setAddedMaterials(u);
//   };

//   const handleVendorRate = (mIdx, vIdx, field, value) => {
//     const u = [...addedMaterials];
//     u[mIdx].vendorRates[vIdx][field] = value;
//     setAddedMaterials(u);
//   };

//   const calcFinal = (mat, vIdx) => {
//     const rate = parseFloat(mat.vendorRates[vIdx]?.rate) || 0;
//     if (rate <= 0) return { final: '', total: '' };
//     const disc = parseFloat(mat.vendorRates[vIdx]?.discount) || 0;
//     const cgst = parseFloat(mat.cgst) || 0;
//     const sgst = parseFloat(mat.sgst) || 0;
//     const igst = parseFloat(mat.igst) || 0;
//     const base = rate * (1 - disc / 100);
//     const tax = base * ((cgst + sgst + igst) / 100);
//     const final = (base + tax).toFixed(2);
//     const total = ((parseFloat(mat.Revised_Quantity) || 0) * parseFloat(final)).toFixed(2);
//     return { final, total };
//   };

//   const validateStep3 = () => {
//     if (selectedVendors.length === 0) return false;
//     for (const v of selectedVendors) {
//       if (!v.firm || !v.deliveryDate || !v.billType || !v.paymentTerms ||
//         !v.transportRequired || !v.freightCharges) return false;
//       if (v.paymentTerms === 'Credit' && !v.creditInDays) return false;
//       if (v.transportRequired === 'Yes' && !v.expectedTransportCharges) return false;
//       if (v.freightCharges === 'Yes' && !v.expectedFreightCharges) return false;
//     }
//     if (addedMaterials.length === 0) return false;
//     for (const mat of addedMaterials) {
//       for (const vr of mat.vendorRates) { if (!vr.rate) return false; }
//     }
//     return true;
//   };

//   const num = (val) => {
//     if (val === null || val === undefined || val === '') return 0;
//     const n = parseFloat(String(val).replace(/[₹,\s']/g, ''));
//     return isNaN(n) ? 0 : n;
//   };

//   const handleSave = async () => {
//     if (!selectedIndent) { setSaveError('Select indent.'); return; }
//     const entries = [];
//     for (const mat of addedMaterials) {
//       for (let vIdx = 0; vIdx < selectedVendors.length; vIdx++) {
//         const vendor = selectedVendors[vIdx];
//         const vr = mat.vendorRates[vIdx];
//         const { final: finalRate, total: totalValue } = calcFinal(mat, vIdx);
//         if (!finalRate || num(totalValue) <= 0) {
//           setSaveError('Fill Rate for all materials x vendors.');
//           return;
//         }
//         entries.push({
//           Req_No: indentItems[0]?.Req_No || '',
//           UID: String(mat.selectedUID),
//           Project_Name: indentItems[0]?.Project_Name || '',
//           site_name: indentItems[0]?.Project_Name || '',
//           Indent_No: selectedIndent,
//           Material_name: mat.Material_Name,
//           Material_Size: mat.Material_Size || '',
//           Material_Specification: mat.Material_Specification || '',
//           Vendor_Name: vendor.name,
//           Vendor_Firm_Name: vendor.firm,
//           Vendor_Ferm_Name: vendor.firm,
//           Vendor_Address: vendor.address,
//           Contact_Number: vendor.contact,
//           Vendor_GST_No: vendor.gst,
//           RATE: num(vr.rate),
//           Discount: num(vr.discount),
//           CGST: num(mat.cgst),
//           SGST: num(mat.sgst),
//           IGST: num(mat.igst),
//           Final_Rate: num(finalRate),
//           Delivery_Expected_Date: vendor.deliveryDate,
//           Payment_Terms: vendor.paymentTerms,
//           Payment_Terms_Condistion_Advacne_Credit: vendor.paymentTerms,
//           Credit_in_Days: parseInt(vendor.creditInDays) || 0,
//           Bill_Type: vendor.billType,
//           IS_TRANSPORT_REQUIRED: vendor.transportRequired,
//           EXPECTED_TRANSPORT_CHARGES: num(vendor.expectedTransportCharges),
//           FREIGHT_CHARGES: vendor.freightCharges,
//           FRIGHET_CHARGES: vendor.freightCharges,
//           EXPECTED_FREIGHT_CHARGES: num(vendor.expectedFreightCharges),
//           EXPECTED_FRIGHET_CHARGES: num(vendor.expectedFreightCharges),
//           PLANNED_4: status4,
//           NO_OF_QUOTATION_4: noOfQuotation4,
//           REMARK_4: vr.brandName || '',
//           REVISED_QUANTITY_2: num(mat.Revised_Quantity),
//           Total_Value: num(totalValue),
//         });
//       }
//     }
//     setIsSaving(true); setSaveError('');
//     try {
//       const res = await fetch(
//         `${import.meta.env.VITE_BACKEND_URL}/api/save-take-Quotation`,
//         {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ entries })
//         }
//       );
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || 'Save failed');
//       setSaveSuccess(true);
//       setTimeout(() => { closeModal(); fetchData(); }, 1500);
//     } catch (err) {
//       setSaveError(err.message);
//     } finally { setIsSaving(false); }
//   };

//   // ✅ UPDATED - Material w:200, Brand w:180
//   const tableCols = [
//     { label: '#', w: 50 },
//     { label: 'Planned', w: 100 },
//     { label: 'UID', w: 60 },
//     { label: 'Req No', w: 90 },
//     { label: 'Project', w: 140 },
//     { label: 'Material', w: 200 },  // ✅ wider
//     { label: 'Size', w: 80 },
//     { label: 'Rev Qty', w: 80 },
//     { label: 'Unit', w: 60 },
//     { label: 'Brand', w: 180 },     // ✅ wider
//     { label: 'Indent', w: 100 },
//     { label: 'PDF', w: 70 },
//   ];

//   const stepLabels = ['Select Indent', 'Review', 'Add Vendors & Rates', 'Review', 'Final'];

//   if (loading) return (
//     <div style={{
//       display: 'flex', flexDirection: 'column',
//       alignItems: 'center', justifyContent: 'center', padding: '80px 20px'
//     }}>
//       <Loader2 size={28} color={T.gold}
//         style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} />
//       <p style={{ color: T.navy, fontWeight: 600 }}>Loading...</p>
//       <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
//     </div>
//   );

//   return (
//     <div style={{ width: '100%' }}>

//       {/* ── HEADER ── */}
//       <div style={{
//         background: T.card, borderRadius: 10, border: `1px solid ${T.border}`,
//         padding: '16px 20px', marginBottom: 16,
//         display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//         flexWrap: 'wrap', gap: 12
//       }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//           <div style={{
//             width: 36, height: 36, borderRadius: 8,
//             background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`,
//             display: 'flex', alignItems: 'center', justifyContent: 'center'
//           }}>
//             <FileText size={18} color={T.gold} />
//           </div>
//           <div>
//             <h2 style={{ fontSize: 16, fontWeight: 700, color: T.navy, margin: 0 }}>
//               Take Quotation
//             </h2>
//             <p style={{ fontSize: 12, color: T.textMuted, margin: 0 }}>
//               {requests.length} pending
//             </p>
//           </div>
//         </div>
//         <div style={{ display: 'flex', gap: 10 }}>
//           <button onClick={fetchData} style={{
//             display: 'flex', alignItems: 'center', gap: 6,
//             padding: '8px 14px', borderRadius: 8,
//             border: `1.5px solid ${T.border}`, background: T.card,
//             color: T.textLight, fontSize: 13, cursor: 'pointer'
//           }}>
//             <RotateCcw size={14} /> Refresh
//           </button>
//           <button onClick={openModal} style={{
//             display: 'flex', alignItems: 'center', gap: 6,
//             padding: '8px 18px', borderRadius: 8, border: 'none',
//             background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
//             color: T.navyDark, fontSize: 13, fontWeight: 700,
//             cursor: 'pointer', boxShadow: `0 2px 8px ${T.gold}40`
//           }}>
//             <Plus size={15} /> Create Quotation
//           </button>
//         </div>
//       </div>

//       {error && (
//         <div style={{
//           display: 'flex', alignItems: 'center', gap: 10,
//           padding: '12px 16px', background: T.dangerBg,
//           border: `1px solid ${T.dangerBorder}`, borderRadius: 10,
//           marginBottom: 16, fontSize: 13, color: T.danger
//         }}>
//           <AlertCircle size={16} /> {error}
//         </div>
//       )}

//       {/* ── TABLE ── */}
//       <div style={{
//         background: T.card, borderRadius: 10,
//         border: `1px solid ${T.border}`, overflow: 'hidden'
//       }}>
//         {requests.length === 0 ? (
//           <div style={{ padding: '60px 20px', textAlign: 'center' }}>
//             <Package size={40} color={T.border} style={{ marginBottom: 12 }} />
//             <p style={{ color: T.textLight }}>No pending</p>
//           </div>
//         ) : (
//           <div style={{ overflowX: 'auto', maxHeight: '65vh', overflowY: 'auto' }}>
//             <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
//               <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
//                 <tr style={{ background: T.navy }}>
//                   {tableCols.map((c, i) => (
//                     <th key={i} style={{
//                       padding: '12px 14px', textAlign: 'left',
//                       color: T.goldLight, fontSize: 11, fontWeight: 700,
//                       textTransform: 'uppercase', whiteSpace: 'nowrap',
//                       minWidth: c.w, borderBottom: `2px solid ${T.gold}`
//                     }}>
//                       {c.label}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {requests.map((req, idx) => (
//                   <tr
//                     key={req.UID + idx}
//                     style={{ background: idx % 2 === 0 ? T.card : T.borderLight }}
//                     onMouseEnter={(e) => { e.currentTarget.style.background = `${T.gold}08`; }}
//                     onMouseLeave={(e) => { e.currentTarget.style.background = idx % 2 === 0 ? T.card : T.borderLight; }}
//                   >
//                     {/* # */}
//                     <Td>
//                       <span style={{
//                         display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
//                         width: 26, height: 26, borderRadius: 6,
//                         background: T.borderLight, fontSize: 12, fontWeight: 600, color: T.textLight
//                       }}>
//                         {idx + 1}
//                       </span>
//                     </Td>

//                     {/* Planned */}
//                     <Td>{req.PLANNED_4}</Td>

//                     {/* UID */}
//                     <Td>
//                       <span style={{
//                         background: `${T.navy}15`, color: T.navy,
//                         padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600
//                       }}>
//                         {req.UID}
//                       </span>
//                     </Td>

//                     {/* Req No */}
//                     <Td>
//                       <span style={{
//                         background: `${T.gold}15`, color: T.goldDark,
//                         padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600
//                       }}>
//                         {req.Req_No}
//                       </span>
//                     </Td>

//                     {/* Project */}
//                     <Td maxW={140}>{req.Project_Name}</Td>

//                     {/* ✅ Material - pura text, wrap */}
//                     <Td wrap>
//                       <span style={{
//                         display: 'block',
//                         fontSize: 13,
//                         fontWeight: 500,
//                         color: T.text,
//                         lineHeight: 1.5,
//                         minWidth: 150,
//                         maxWidth: 250,
//                         wordBreak: 'break-word',
//                       }}>
//                         {req.Material_Name || <span style={{ color: T.textMuted }}>—</span>}
//                       </span>
//                     </Td>

//                     {/* Size */}
//                     <Td>
//                       {req.Material_Size && (
//                         <span style={{
//                           background: `${T.gold}15`, color: T.goldDark,
//                           padding: '2px 7px', borderRadius: 4, fontSize: 11, fontWeight: 600
//                         }}>
//                           {req.Material_Size}
//                         </span>
//                       )}
//                     </Td>

//                     {/* Rev Qty */}
//                     <td style={{
//                       padding: '10px 14px', fontSize: 13, color: T.text,
//                       borderBottom: `1px solid ${T.border}`,
//                       whiteSpace: 'nowrap', textAlign: 'right', verticalAlign: 'top'
//                     }}>
//                       {req.REVISED_QTY_2 || req.REVISED_QUANTITY_2 ||
//                         <span style={{ color: T.textMuted }}>—</span>}
//                     </td>

//                     {/* Unit */}
//                     <Td>{req.Unit_Name}</Td>

//                     {/* ✅ Brand - pura text, wrap */}
//                     <Td wrap>
//                       <span style={{
//                         display: 'block',
//                         fontSize: 13,
//                         fontWeight: 500,
//                         color: T.text,
//                         lineHeight: 1.5,
//                         minWidth: 120,
//                         maxWidth: 200,
//                         wordBreak: 'break-word',
//                       }}>
//                         {req.DECIDED_BRAND_2 || req['DECIDED_BRAND/COMPANY_NAME_2'] ||
//                           <span style={{ color: T.textMuted }}>—</span>}
//                       </span>
//                     </Td>

//                     {/* Indent */}
//                     <Td>
//                       <span style={{
//                         background: `${T.purple}15`, color: T.purple,
//                         padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600
//                       }}>
//                         {req.INDENT_NUMBER_3}
//                       </span>
//                     </Td>

//                     {/* PDF */}
//                     <td style={{
//                       padding: '10px 14px', borderBottom: `1px solid ${T.border}`,
//                       verticalAlign: 'top'
//                     }}>
//                       {req.PDF_URL_3 ? (
//                         <a
//                           href={req.PDF_URL_3} target="_blank" rel="noopener noreferrer"
//                           style={{ color: T.gold, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}
//                         >
//                           <ExternalLink size={12} />
//                         </a>
//                       ) : '—'}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {/* ═══════════════════════════════════════
//           MODAL - Full Screen
//       ═══════════════════════════════════════ */}
//       {isModalOpen && (
//         <div style={{
//           position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
//           width: '100%', height: '100vh',
//           background: T.card, zIndex: 200,
//           display: 'flex', flexDirection: 'column'
//         }}>

//           {/* Modal Header */}
//           <div style={{
//             background: T.navy, padding: '12px 24px',
//             borderBottom: `2px solid ${T.gold}`,
//             display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//             flexShrink: 0
//           }}>
//             <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//               <FileText size={18} color={T.gold} />
//               <h3 style={{ fontSize: 15, fontWeight: 700, color: 'white', margin: 0 }}>
//                 Create Quotation — Step {currentStep}/5
//               </h3>
//             </div>
//             <button
//               onClick={closeModal}
//               disabled={isSaving}
//               style={{
//                 width: 32, height: 32, borderRadius: 8, border: 'none',
//                 background: 'rgba(255,255,255,0.1)', color: 'white',
//                 cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
//               }}
//             >
//               <X size={16} />
//             </button>
//           </div>

//           {/* Step Indicator */}
//           <div style={{
//             padding: '10px 24px', background: T.borderLight,
//             borderBottom: `1px solid ${T.border}`, flexShrink: 0
//           }}>
//             <div style={{ display: 'flex', alignItems: 'center', gap: 6, maxWidth: 800 }}>
//               {stepLabels.map((label, i) => {
//                 const step = i + 1;
//                 return (
//                   <React.Fragment key={step}>
//                     <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
//                       <div style={{
//                         width: 24, height: 24, borderRadius: '50%',
//                         background: currentStep >= step
//                           ? `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`
//                           : T.border,
//                         color: currentStep >= step ? T.navyDark : T.textMuted,
//                         display: 'flex', alignItems: 'center', justifyContent: 'center',
//                         fontSize: 11, fontWeight: 700
//                       }}>
//                         {currentStep > step ? <Check size={12} /> : step}
//                       </div>
//                       <span style={{
//                         fontSize: 11,
//                         fontWeight: currentStep === step ? 600 : 400,
//                         color: currentStep === step ? T.navy : T.textMuted,
//                         whiteSpace: 'nowrap'
//                       }}>
//                         {label}
//                       </span>
//                     </div>
//                     {step < 5 && (
//                       <div style={{
//                         flex: 1, height: 2,
//                         background: currentStep > step ? T.gold : T.border,
//                         borderRadius: 2
//                       }} />
//                     )}
//                   </React.Fragment>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Modal Body */}
//           <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', background: T.bg }}>

//             {saveSuccess && (
//               <div style={{
//                 display: 'flex', alignItems: 'center', gap: 8,
//                 padding: '10px 14px', background: T.successBg,
//                 border: `1px solid ${T.successBorder}`, borderRadius: 8,
//                 marginBottom: 16, fontSize: 13, color: '#065f46', maxWidth: 500
//               }}>
//                 <CheckCircle size={16} color={T.success} /> Created!
//               </div>
//             )}

//             {saveError && (
//               <div style={{
//                 display: 'flex', alignItems: 'center', gap: 8,
//                 padding: '10px 14px', background: T.dangerBg,
//                 border: `1px solid ${T.dangerBorder}`, borderRadius: 8,
//                 marginBottom: 16, fontSize: 13, color: T.danger, maxWidth: 500
//               }}>
//                 <AlertCircle size={16} /> {saveError}
//               </div>
//             )}

//             {/* ── STEP 1: Select Indent ── */}
//             {currentStep === 1 && (
//               <div style={{ maxWidth: 500 }}>
//                 <div style={{
//                   background: `${T.gold}10`, border: `1px solid ${T.gold}30`,
//                   borderRadius: 10, padding: '12px 16px', marginBottom: 20,
//                   borderLeft: `3px solid ${T.gold}`
//                 }}>
//                   <p style={{ fontSize: 13, fontWeight: 600, color: T.goldDark, margin: 0 }}>
//                     Select Indent Number
//                   </p>
//                 </div>
//                 <Field label="Indent" required>
//                   <Sel
//                     value={selectedIndent || ''}
//                     onChange={(e) => setSelectedIndent(e.target.value)}
//                     invalid={!selectedIndent}
//                   >
//                     <option value="">-- Select --</option>
//                     {uniqueIndents.map((n, i) => (
//                       <option key={i} value={n}>{n}</option>
//                     ))}
//                   </Sel>
//                 </Field>
//               </div>
//             )}

//             {/* ── STEP 2: Review Materials ── */}
//             {currentStep === 2 && (
//               <div>
//                 <div style={{
//                   background: T.successBg, border: `1px solid ${T.successBorder}`,
//                   borderRadius: 10, padding: '12px 16px', marginBottom: 20,
//                   borderLeft: `3px solid ${T.success}`
//                 }}>
//                   <p style={{ fontSize: 13, fontWeight: 600, color: '#065f46', margin: '0 0 4px' }}>
//                     Review {indentItems.length} Materials
//                   </p>
//                 </div>
//                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 10 }}>
//                   {indentItems.map((req, i) => (
//                     <div key={i} style={{
//                       background: T.card, borderRadius: 8,
//                       border: `1px solid ${T.border}`, padding: '12px'
//                     }}>
//                       <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
//                         <span style={{
//                           background: `${T.navy}15`, color: T.navy,
//                           padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700
//                         }}>
//                           UID: {req.UID}
//                         </span>
//                         <span style={{ fontSize: 12, fontWeight: 600, color: T.navy }}>
//                           {req.Material_Name}
//                         </span>
//                       </div>
//                       {(req.Material_Size || req.Specification) && (
//                         <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
//                           {req.Material_Size && (
//                             <span style={{
//                               background: `${T.gold}15`, color: T.goldDark,
//                               padding: '1px 6px', borderRadius: 3, fontSize: 10, fontWeight: 600
//                             }}>
//                               📏 {req.Material_Size}
//                             </span>
//                           )}
//                           {req.Specification && (
//                             <span style={{
//                               background: `${T.purple}15`, color: T.purple,
//                               padding: '1px 6px', borderRadius: 3, fontSize: 10, fontWeight: 600
//                             }}>
//                               ⚙️ {req.Specification}
//                             </span>
//                           )}
//                         </div>
//                       )}
//                       <div style={{ fontSize: 11, color: T.textLight }}>
//                         Qty: <strong>{req.REVISED_QTY_2 || req.REVISED_QUANTITY_2}</strong> {req.Unit_Name}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* ── STEP 3: Add Vendors & Rates ── */}
//             {currentStep === 3 && (
//               <div>
//                 {/* VENDORS */}
//                 <div style={{
//                   background: T.card, borderRadius: 12,
//                   border: `1px solid ${T.border}`, padding: '16px', marginBottom: 20
//                 }}>
//                   <div style={{
//                     display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//                     marginBottom: 14, paddingBottom: 10, borderBottom: `2px solid ${T.border}`
//                   }}>
//                     <span style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>
//                       Vendors ({selectedVendors.length})
//                     </span>
//                     <button onClick={addVendor} style={{
//                       display: 'flex', alignItems: 'center', gap: 5,
//                       padding: '7px 14px', borderRadius: 8, border: 'none',
//                       background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
//                       color: T.navyDark, fontSize: 12, fontWeight: 700, cursor: 'pointer'
//                     }}>
//                       <Plus size={13} /> Add Vendor
//                     </button>
//                   </div>

//                   {selectedVendors.length === 0 && (
//                     <div style={{ textAlign: 'center', padding: '30px', color: T.textMuted }}>
//                       <p>Add vendors first</p>
//                       <button onClick={addVendor} style={{
//                         display: 'inline-flex', alignItems: 'center', gap: 5,
//                         padding: '8px 16px', borderRadius: 8, border: 'none',
//                         background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
//                         color: T.navyDark, fontSize: 13, fontWeight: 700,
//                         cursor: 'pointer', marginTop: 10
//                       }}>
//                         <Plus size={14} /> Add First Vendor
//                       </button>
//                     </div>
//                   )}

//                   {selectedVendors.map((vendor, vIdx) => (
//                     <div key={vIdx} style={{
//                       background: T.borderLight, borderRadius: 10,
//                       border: `1px solid ${T.border}`, padding: '14px', marginBottom: 10
//                     }}>
//                       <div style={{
//                         display: 'flex', justifyContent: 'space-between',
//                         alignItems: 'center', marginBottom: 12
//                       }}>
//                         <span style={{
//                           fontSize: 13, fontWeight: 700, color: T.navy,
//                           display: 'flex', alignItems: 'center', gap: 6
//                         }}>
//                           <span style={{
//                             width: 24, height: 24, borderRadius: 6,
//                             background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
//                             display: 'flex', alignItems: 'center', justifyContent: 'center',
//                             fontSize: 11, fontWeight: 700, color: T.navyDark
//                           }}>
//                             {vIdx + 1}
//                           </span>
//                           {vendor.firm || 'New Vendor'}
//                         </span>
//                         <button onClick={() => removeVendor(vIdx)} style={{
//                           display: 'flex', alignItems: 'center', gap: 3,
//                           padding: '4px 10px', borderRadius: 6,
//                           border: `1px solid ${T.dangerBorder}`,
//                           background: T.dangerBg, color: T.danger, fontSize: 11, cursor: 'pointer'
//                         }}>
//                           <Trash2 size={11} /> Remove
//                         </button>
//                       </div>

//                       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
//                         <Field label="Vendor Firm" required>
//                           <Sel
//                             value={vendor.firm}
//                             onChange={(e) => handleVendorChange(vIdx, 'firm', e.target.value)}
//                             invalid={!vendor.firm}
//                           >
//                             <option value="">-- Select --</option>
//                             {vendorOptions.map((v, i) => (
//                               <option key={i} value={v.vendorFirm}>{v.vendorFirm}</option>
//                             ))}
//                           </Sel>
//                         </Field>
//                         <Field label="Name">
//                           <input value={vendor.name} readOnly style={inputReadonly} />
//                         </Field>
//                         <Field label="GST">
//                           <input value={vendor.gst} readOnly style={inputReadonly} />
//                         </Field>
//                         <Field label="Contact">
//                           <input value={vendor.contact} readOnly style={inputReadonly} />
//                         </Field>
//                         <Field label="Delivery Date" required>
//                           <input
//                             type="date" value={vendor.deliveryDate}
//                             onChange={(e) => handleVendorChange(vIdx, 'deliveryDate', e.target.value)}
//                             style={{ ...inputBase, borderColor: !vendor.deliveryDate ? T.danger : T.border }}
//                             onFocus={focusGold} onBlur={blurNormal}
//                           />
//                         </Field>
//                         <Field label="Bill Type" required>
//                           <Sel
//                             value={vendor.billType}
//                             onChange={(e) => handleVendorChange(vIdx, 'billType', e.target.value)}
//                             invalid={!vendor.billType}
//                           >
//                             <option value="">Select</option>
//                             <option>Tax Invoice</option>
//                             <option>Proforma Invoice</option>
//                             <option>Cash Bill</option>
//                           </Sel>
//                         </Field>
//                         <Field label="Payment" required>
//                           <Sel
//                             value={vendor.paymentTerms}
//                             onChange={(e) => handleVendorChange(vIdx, 'paymentTerms', e.target.value)}
//                             invalid={!vendor.paymentTerms}
//                           >
//                             <option value="">Select</option>
//                             <option>Credit</option>
//                             <option>Advance</option>
//                           </Sel>
//                         </Field>
//                         {vendor.paymentTerms === 'Credit' && (
//                           <Field label="Credit Days" required>
//                             <input
//                               type="number" value={vendor.creditInDays}
//                               onChange={(e) => handleVendorChange(vIdx, 'creditInDays', e.target.value)}
//                               style={{ ...inputBase, borderColor: !vendor.creditInDays ? T.danger : T.border }}
//                               placeholder="30" onFocus={focusGold} onBlur={blurNormal}
//                             />
//                           </Field>
//                         )}
//                         <Field label="Transport" required>
//                           <Sel
//                             value={vendor.transportRequired}
//                             onChange={(e) => handleVendorChange(vIdx, 'transportRequired', e.target.value)}
//                             invalid={!vendor.transportRequired}
//                           >
//                             <option value="">Select</option>
//                             <option>Yes</option>
//                             <option>No</option>
//                           </Sel>
//                         </Field>
//                         {vendor.transportRequired === 'Yes' && (
//                           <Field label="Transport ₹" required>
//                             <input
//                               type="number" value={vendor.expectedTransportCharges}
//                               onChange={(e) => handleVendorChange(vIdx, 'expectedTransportCharges', e.target.value)}
//                               style={{ ...inputBase, borderColor: !vendor.expectedTransportCharges ? T.danger : T.border }}
//                               onFocus={focusGold} onBlur={blurNormal}
//                             />
//                           </Field>
//                         )}
//                         <Field label="Freight" required>
//                           <Sel
//                             value={vendor.freightCharges}
//                             onChange={(e) => handleVendorChange(vIdx, 'freightCharges', e.target.value)}
//                             invalid={!vendor.freightCharges}
//                           >
//                             <option value="">Select</option>
//                             <option>Yes</option>
//                             <option>No</option>
//                           </Sel>
//                         </Field>
//                         {vendor.freightCharges === 'Yes' && (
//                           <Field label="Freight ₹" required>
//                             <input
//                               type="number" value={vendor.expectedFreightCharges}
//                               onChange={(e) => handleVendorChange(vIdx, 'expectedFreightCharges', e.target.value)}
//                               style={{ ...inputBase, borderColor: !vendor.expectedFreightCharges ? T.danger : T.border }}
//                               onFocus={focusGold} onBlur={blurNormal}
//                             />
//                           </Field>
//                         )}
//                       </div>
//                       <div style={{ marginTop: 10 }}>
//                         <Field label="Address">
//                           <textarea
//                             value={vendor.address}
//                             onChange={(e) => handleVendorChange(vIdx, 'address', e.target.value)}
//                             rows={2} style={{ ...inputBase, resize: 'vertical' }}
//                             onFocus={focusGold} onBlur={blurNormal}
//                           />
//                         </Field>
//                       </div>
//                     </div>
//                   ))}
//                 </div>

//                 {/* MATERIALS */}
//                 {selectedVendors.length > 0 && (
//                   <div style={{
//                     background: T.card, borderRadius: 12,
//                     border: `1px solid ${T.border}`, padding: '16px'
//                   }}>
//                     <div style={{
//                       display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//                       marginBottom: 14, paddingBottom: 10, borderBottom: `2px solid ${T.border}`
//                     }}>
//                       <span style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>
//                         Materials ({addedMaterials.length}/{indentItems.length})
//                       </span>
//                     </div>

//                     {addedMaterials.map((mat, mIdx) => (
//                       <div key={mIdx} style={{
//                         background: T.borderLight, borderRadius: 10,
//                         border: `1px solid ${T.border}`, padding: '14px', marginBottom: 14
//                       }}>
//                         <div style={{
//                           display: 'flex', justifyContent: 'space-between',
//                           alignItems: 'flex-start', marginBottom: 10
//                         }}>
//                           <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
//                             <span style={{
//                               background: T.navy, color: T.gold,
//                               padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700
//                             }}>
//                               {mIdx + 1}. {mat.Material_Name}
//                             </span>
//                             {mat.Material_Size && (
//                               <span style={{
//                                 background: `${T.gold}15`, color: T.goldDark,
//                                 padding: '2px 7px', borderRadius: 4, fontSize: 10, fontWeight: 600
//                               }}>
//                                 📏 {mat.Material_Size}
//                               </span>
//                             )}
//                             {mat.Material_Specification && (
//                               <span style={{
//                                 background: `${T.purple}15`, color: T.purple,
//                                 padding: '2px 7px', borderRadius: 4, fontSize: 10, fontWeight: 600
//                               }}>
//                                 ⚙️ {mat.Material_Specification}
//                               </span>
//                             )}
//                             <span style={{ fontSize: 11, color: T.textMuted }}>
//                               Qty: <strong>{mat.Revised_Quantity}</strong> {mat.Unit_Name} | UID: {mat.selectedUID}
//                             </span>
//                           </div>
//                           <button onClick={() => removeMaterial(mIdx)} style={{
//                             display: 'flex', alignItems: 'center', gap: 3,
//                             padding: '4px 10px', borderRadius: 6,
//                             border: `1px solid ${T.dangerBorder}`,
//                             background: T.dangerBg, color: T.danger, fontSize: 11, cursor: 'pointer',
//                             flexShrink: 0
//                           }}>
//                             <Trash2 size={11} /> Remove
//                           </button>
//                         </div>

//                         {/* Vendor Rates Table */}
//                         <div style={{ overflowX: 'auto', marginBottom: 10 }}>
//                           <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
//                             <thead>
//                               <tr style={{ background: T.navy }}>
//                                 <th style={{ padding: '8px 10px', color: T.gold, fontSize: 10, fontWeight: 700, textAlign: 'left' }}>Vendor</th>
//                                 <th style={{ padding: '8px 10px', color: T.gold, fontSize: 10, fontWeight: 700, textAlign: 'center' }}>Rate ₹ *</th>
//                                 <th style={{ padding: '8px 10px', color: T.gold, fontSize: 10, fontWeight: 700, textAlign: 'left' }}>
//                                   Brand
//                                   <span style={{ fontSize: 9, color: `${T.gold}99`, marginLeft: 4, fontWeight: 400 }}>
//                                     (pre-filled, editable)
//                                   </span>
//                                 </th>
//                                 <th style={{ padding: '8px 10px', color: T.gold, fontSize: 10, fontWeight: 700, textAlign: 'center' }}>Discount %</th>
//                                 <th style={{ padding: '8px 10px', color: T.gold, fontSize: 10, fontWeight: 700, textAlign: 'center' }}>Final Rate</th>
//                                 <th style={{ padding: '8px 10px', color: T.gold, fontSize: 10, fontWeight: 700, textAlign: 'center' }}>Total Value</th>
//                               </tr>
//                             </thead>
//                             <tbody>
//                               {selectedVendors.map((vendor, vIdx) => {
//                                 const { final, total } = calcFinal(mat, vIdx);
//                                 return (
//                                   <tr key={vIdx} style={{ background: vIdx % 2 === 0 ? T.card : T.borderLight }}>
//                                     <td style={{ padding: '8px 10px', fontWeight: 600, color: T.navy }}>
//                                       {vendor.firm || `Vendor ${vIdx + 1}`}
//                                     </td>
//                                     <td style={{ padding: '6px 8px', textAlign: 'center' }}>
//                                       <input
//                                         type="number"
//                                         value={mat.vendorRates[vIdx]?.rate || ''}
//                                         onChange={(e) => handleVendorRate(mIdx, vIdx, 'rate', e.target.value)}
//                                         placeholder="₹"
//                                         style={{
//                                           width: 80, padding: '5px 6px', fontSize: 12,
//                                           border: `1.5px solid ${!mat.vendorRates[vIdx]?.rate ? T.danger : T.border}`,
//                                           borderRadius: 5, outline: 'none', textAlign: 'center',
//                                           fontWeight: 600, boxSizing: 'border-box'
//                                         }}
//                                         onFocus={focusGold} onBlur={blurNormal}
//                                       />
//                                     </td>
//                                     <td style={{ padding: '6px 8px' }}>
//                                       <input
//                                         type="text"
//                                         value={mat.vendorRates[vIdx]?.brandName || ''}
//                                         onChange={(e) => handleVendorRate(mIdx, vIdx, 'brandName', e.target.value)}
//                                         placeholder="Brand name"
//                                         style={{
//                                           width: 120, padding: '5px 6px', fontSize: 11,
//                                           border: `1.5px solid ${T.border}`, borderRadius: 5,
//                                           outline: 'none', boxSizing: 'border-box',
//                                           background: mat.vendorRates[vIdx]?.brandName ? `${T.gold}12` : T.borderLight,
//                                           color: T.text,
//                                         }}
//                                         onFocus={focusGold} onBlur={blurNormal}
//                                       />
//                                     </td>
//                                     <td style={{ padding: '6px 8px', textAlign: 'center' }}>
//                                       <input
//                                         type="number"
//                                         value={mat.vendorRates[vIdx]?.discount || ''}
//                                         onChange={(e) => handleVendorRate(mIdx, vIdx, 'discount', e.target.value)}
//                                         placeholder="0"
//                                         style={{
//                                           width: 60, padding: '5px 6px', fontSize: 12,
//                                           border: `1.5px solid ${T.border}`, borderRadius: 5,
//                                           outline: 'none', textAlign: 'center', boxSizing: 'border-box'
//                                         }}
//                                         onFocus={focusGold} onBlur={blurNormal}
//                                       />
//                                     </td>
//                                     <td style={{
//                                       padding: '8px 10px', textAlign: 'center',
//                                       fontWeight: 700, color: final ? T.success : T.textMuted
//                                     }}>
//                                       {final ? `₹${final}` : '—'}
//                                     </td>
//                                     <td style={{
//                                       padding: '8px 10px', textAlign: 'center',
//                                       fontWeight: 700, color: total ? T.navy : T.textMuted
//                                     }}>
//                                       {total
//                                         ? `₹${parseFloat(total).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
//                                         : '—'}
//                                     </td>
//                                   </tr>
//                                 );
//                               })}
//                             </tbody>
//                           </table>
//                         </div>

//                         {/* GST */}
//                         <div style={{
//                           background: `${T.gold}08`, borderRadius: 8,
//                           border: `1px solid ${T.gold}30`, padding: '10px 12px'
//                         }}>
//                           <div style={{
//                             fontSize: 11, fontWeight: 700, color: T.goldDark,
//                             marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5
//                           }}>
//                             <Copy size={12} /> GST for this material (same for all vendors)
//                           </div>
//                           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
//                             <Field label="CGST %">
//                               <input type="number" value={mat.cgst}
//                                 onChange={(e) => handleMaterialTax(mIdx, 'cgst', e.target.value)}
//                                 style={inputBase} placeholder="0" onFocus={focusGold} onBlur={blurNormal} />
//                             </Field>
//                             <Field label="SGST %">
//                               <input type="number" value={mat.sgst}
//                                 onChange={(e) => handleMaterialTax(mIdx, 'sgst', e.target.value)}
//                                 style={inputBase} placeholder="0" onFocus={focusGold} onBlur={blurNormal} />
//                             </Field>
//                             <Field label="IGST %">
//                               <input type="number" value={mat.igst}
//                                 onChange={(e) => handleMaterialTax(mIdx, 'igst', e.target.value)}
//                                 style={inputBase} placeholder="0" onFocus={focusGold} onBlur={blurNormal} />
//                             </Field>
//                           </div>
//                         </div>
//                       </div>
//                     ))}

//                     {/* Add Material Dropdown */}
//                     <div style={{ marginTop: 10 }}>
//                       <label style={labelStyle}>Add Material</label>
//                       <div style={{ position: 'relative' }}>
//                         <select
//                           value=""
//                           onChange={(e) => { if (e.target.value) addMaterial(e.target.value); }}
//                           style={{ ...inputBase, paddingRight: 32, appearance: 'none', cursor: 'pointer' }}
//                           onFocus={focusGold} onBlur={blurNormal}
//                         >
//                           <option value="">-- Select Material to Add --</option>
//                           {indentItems.map(item => {
//                             const isAdded = addedUIDs.has(item.UID);
//                             return (
//                               <option
//                                 key={item.UID} value={item.UID} disabled={isAdded}
//                                 style={{ color: isAdded ? T.textMuted : T.text }}
//                               >
//                                 {isAdded ? '✓ ' : ''}
//                                 {item.Material_Name}
//                                 {item.Material_Size ? ` | ${item.Material_Size}` : ''}
//                                 {' | Qty: '}{item.REVISED_QTY_2 || item.REVISED_QUANTITY_2}
//                                 {' | UID: '}{item.UID}
//                                 {isAdded ? ' (Added)' : ''}
//                               </option>
//                             );
//                           })}
//                         </select>
//                         <ChevronDown size={14} style={{
//                           position: 'absolute', right: 10, top: '50%',
//                           transform: 'translateY(-50%)', color: T.textMuted, pointerEvents: 'none'
//                         }} />
//                       </div>
//                       <div style={{ marginTop: 8, fontSize: 11, color: T.textMuted }}>
//                         {addedMaterials.length} of {indentItems.length} added
//                         {addedMaterials.length < indentItems.length && (
//                           <span style={{ color: T.danger, marginLeft: 8 }}>
//                             ({indentItems.length - addedMaterials.length} remaining)
//                           </span>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* ── STEP 4: Review ── */}
//             {currentStep === 4 && (
//               <div>
//                 <div style={{
//                   background: T.successBg, border: `1px solid ${T.successBorder}`,
//                   borderRadius: 10, padding: '12px 16px', marginBottom: 20,
//                   borderLeft: `3px solid ${T.success}`
//                 }}>
//                   <p style={{ fontSize: 13, fontWeight: 600, color: '#065f46', margin: 0 }}>
//                     Indent: <strong>{selectedIndent}</strong> |
//                     Vendors: <strong>{selectedVendors.length}</strong> |
//                     Materials: <strong>{addedMaterials.length}</strong>
//                   </p>
//                 </div>

//                 <div style={{ marginBottom: 16 }}>
//                   <h4 style={{ fontSize: 13, fontWeight: 700, color: T.navy, marginBottom: 8 }}>Vendors</h4>
//                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 10 }}>
//                     {selectedVendors.map((v, vIdx) => (
//                       <div key={vIdx} style={{
//                         background: T.card, borderRadius: 8,
//                         border: `1px solid ${T.border}`, padding: '10px 12px', fontSize: 11
//                       }}>
//                         <div style={{ fontWeight: 700, color: T.navy, marginBottom: 6 }}>
//                           Vendor {vIdx + 1}: {v.firm}
//                         </div>
//                         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 10px' }}>
//                           {[['Name', v.name], ['GST', v.gst], ['Delivery', v.deliveryDate], ['Payment', v.paymentTerms]].map(([l, val]) => (
//                             <div key={l}>
//                               <span style={{ color: T.textMuted }}>{l}: </span>
//                               <strong>{val || '—'}</strong>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 {addedMaterials.map((mat, mIdx) => (
//                   <div key={mIdx} style={{
//                     background: T.card, borderRadius: 8,
//                     border: `1px solid ${T.border}`, padding: '12px', marginBottom: 10
//                   }}>
//                     <div style={{ fontWeight: 700, color: T.navy, fontSize: 13, marginBottom: 8 }}>
//                       {mat.Material_Name} {mat.Material_Size && `(${mat.Material_Size})`} | Qty: {mat.Revised_Quantity}
//                     </div>
//                     <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 6 }}>
//                       GST: CGST {mat.cgst || 0}% | SGST {mat.sgst || 0}% | IGST {mat.igst || 0}%
//                     </div>
//                     {selectedVendors.map((vendor, vIdx) => {
//                       const { final, total } = calcFinal(mat, vIdx);
//                       const vr = mat.vendorRates[vIdx] || {};
//                       return (
//                         <div key={vIdx} style={{
//                           display: 'flex', justifyContent: 'space-between',
//                           padding: '4px 0', borderBottom: `1px dashed ${T.border}`, fontSize: 11
//                         }}>
//                           <span>{vendor.firm}</span>
//                           <span>
//                             Rate: <strong>₹{vr.rate || '—'}</strong> |
//                             Brand: <strong>{vr.brandName || '—'}</strong> |
//                             Disc: {vr.discount || 0}% |
//                             Final: <strong style={{ color: T.success }}>₹{final || '—'}</strong> |
//                             Total: <strong>₹{total || '—'}</strong>
//                           </span>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 ))}
//               </div>
//             )}

//             {/* ── STEP 5: Final ── */}
//             {currentStep === 5 && (
//               <div style={{ maxWidth: 500 }}>
//                 <Field label="Status" required>
//                   <Sel value={status4} onChange={(e) => setStatus4(e.target.value)}>
//                     <option value="Done">✅ Done</option>
//                     <option value="PENDING">⏳ PENDING</option>
//                   </Sel>
//                 </Field>
//                 <div style={{ marginTop: 14 }}>
//                   <Field label="No. of Quotations">
//                     <input
//                       value={noOfQuotation4} readOnly
//                       style={{ ...inputReadonly, fontWeight: 700, fontSize: 15, textAlign: 'center' }}
//                     />
//                   </Field>
//                 </div>
//                 <div style={{
//                   marginTop: 14, background: T.borderLight, borderRadius: 10,
//                   border: `1px solid ${T.border}`, padding: '14px'
//                 }}>
//                   <div style={{ fontSize: 13, fontWeight: 700, color: T.navy, marginBottom: 10 }}>Summary</div>
//                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
//                     {[
//                       ['Indent', selectedIndent],
//                       ['Vendors', selectedVendors.length],
//                       ['Materials', addedMaterials.length],
//                       ['Entries', addedMaterials.length * selectedVendors.length]
//                     ].map(([l, val]) => (
//                       <div key={l} style={{
//                         padding: '8px 12px', background: T.card,
//                         borderRadius: 6, border: `1px solid ${T.border}`
//                       }}>
//                         <div style={{ color: T.textMuted, fontSize: 10, marginBottom: 3 }}>{l}</div>
//                         <div style={{ fontWeight: 700, color: T.navy, fontSize: 14 }}>{val}</div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Modal Footer */}
//           <div style={{
//             padding: '12px 24px', borderTop: `1px solid ${T.border}`,
//             background: T.card, flexShrink: 0,
//             display: 'flex', alignItems: 'center', justifyContent: 'space-between'
//           }}>
//             <div>
//               {currentStep === 3 && selectedVendors.length > 0 && !validateStep3() && (
//                 <p style={{ fontSize: 11, color: T.danger, display: 'flex', alignItems: 'center', gap: 4, margin: 0 }}>
//                   <AlertCircle size={12} /> Fill all fields + Rate
//                 </p>
//               )}
//               {currentStep === 3 && validateStep3() && (
//                 <p style={{ fontSize: 11, color: T.success, display: 'flex', alignItems: 'center', gap: 4, margin: 0 }}>
//                   <CheckCircle size={12} /> All valid ✓
//                 </p>
//               )}
//             </div>

//             <div style={{ display: 'flex', gap: 8 }}>
//               {currentStep > 1 && (
//                 <button
//                   onClick={() => setCurrentStep(s => s - 1)}
//                   disabled={isSaving}
//                   style={{
//                     display: 'flex', alignItems: 'center', gap: 4,
//                     padding: '8px 16px', borderRadius: 8,
//                     border: `1.5px solid ${T.border}`, background: T.card,
//                     color: T.textLight, fontSize: 12, fontWeight: 600, cursor: 'pointer'
//                   }}
//                 >
//                   <ArrowLeft size={13} /> Back
//                 </button>
//               )}
//               <button
//                 onClick={closeModal}
//                 disabled={isSaving}
//                 style={{
//                   padding: '8px 16px', borderRadius: 8,
//                   border: `1.5px solid ${T.border}`, background: T.card,
//                   color: T.textLight, fontSize: 12, fontWeight: 600, cursor: 'pointer'
//                 }}
//               >
//                 Cancel
//               </button>

//               {currentStep < 5 ? (
//                 <button
//                   onClick={() => {
//                     if (currentStep === 1 && !selectedIndent) return;
//                     if (currentStep === 3 && !validateStep3()) return;
//                     setCurrentStep(s => s + 1);
//                   }}
//                   disabled={
//                     (currentStep === 1 && !selectedIndent) ||
//                     (currentStep === 3 && !validateStep3()) ||
//                     isSaving
//                   }
//                   style={{
//                     display: 'flex', alignItems: 'center', gap: 4,
//                     padding: '8px 20px', borderRadius: 8, border: 'none',
//                     background: (
//                       (currentStep === 1 && !selectedIndent) ||
//                       (currentStep === 3 && !validateStep3())
//                     ) ? T.border : `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
//                     color: (
//                       (currentStep === 1 && !selectedIndent) ||
//                       (currentStep === 3 && !validateStep3())
//                     ) ? T.textMuted : T.navyDark,
//                     fontSize: 12, fontWeight: 700,
//                     cursor: (
//                       (currentStep === 1 && !selectedIndent) ||
//                       (currentStep === 3 && !validateStep3())
//                     ) ? 'not-allowed' : 'pointer',
//                     opacity: (
//                       (currentStep === 1 && !selectedIndent) ||
//                       (currentStep === 3 && !validateStep3())
//                     ) ? 0.6 : 1,
//                   }}
//                 >
//                   Next <ArrowRight size={13} />
//                 </button>
//               ) : (
//                 <button
//                   onClick={handleSave}
//                   disabled={isSaving || saveSuccess}
//                   style={{
//                     display: 'flex', alignItems: 'center', gap: 5,
//                     padding: '8px 24px', borderRadius: 8, border: 'none',
//                     background: saveSuccess
//                       ? T.success
//                       : `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
//                     color: saveSuccess ? 'white' : T.navyDark,
//                     fontSize: 12, fontWeight: 700,
//                     cursor: isSaving || saveSuccess ? 'not-allowed' : 'pointer',
//                   }}
//                 >
//                   {isSaving
//                     ? <><Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Saving...</>
//                     : saveSuccess
//                       ? <><CheckCircle size={14} /> Saved!</>
//                       : <><Check size={14} /> Save Quotation</>
//                   }
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
//     </div>
//   );
// };

// export default Take_Quotation;










import React, { useState, useEffect } from "react";
import {
  Loader2, AlertCircle, CheckCircle, X, ChevronDown,
  RotateCcw, Package, FileText, ArrowLeft, ArrowRight,
  Check, Plus, Trash2, ExternalLink, Copy
} from "lucide-react";

const T = {
  navy: '#1e293b', navyLight: '#334155', navyDark: '#0f172a',
  gold: '#f59e0b', goldLight: '#fbbf24', goldDark: '#d97706',
  bg: '#f8fafc', card: '#ffffff', text: '#1e293b',
  textLight: '#64748b', textMuted: '#94a3b8',
  border: '#e2e8f0', borderLight: '#f1f5f9',
  success: '#10b981', successBg: '#ecfdf5', successBorder: '#a7f3d0',
  danger: '#ef4444', dangerBg: '#fef2f2', dangerBorder: '#fecaca',
  purple: '#7c3aed', purpleBg: '#f5f3ff',
};

const labelStyle = {
  display: 'block', fontSize: 12, fontWeight: 600,
  color: T.navyLight, marginBottom: 6, letterSpacing: 0.3
};

const inputBase = {
  width: '100%', padding: '9px 12px', fontSize: 13,
  border: `1.5px solid ${T.border}`, borderRadius: 8,
  outline: 'none', color: T.text, background: T.borderLight,
  transition: 'all 0.2s', boxSizing: 'border-box'
};

const inputReadonly = {
  ...inputBase, background: '#eef2f7', color: T.textLight, cursor: 'default'
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

const Td = ({ children, right, maxW, wrap, center }) => (
  <td style={{
    padding: '10px 14px',
    fontSize: 13,
    color: T.text,
    borderBottom: `1px solid ${T.border}`,
    whiteSpace: wrap ? 'normal' : 'nowrap',
    textAlign: right ? 'right' : center ? 'center' : 'left',
    verticalAlign: 'top',
  }}>
    {maxW ? (
      <span
        title={typeof children === 'string' ? children : ''}
        style={{
          display: 'block', maxWidth: maxW,
          overflow: 'hidden', textOverflow: 'ellipsis'
        }}
      >
        {children || <span style={{ color: T.textMuted }}>—</span>}
      </span>
    ) : (
      children || <span style={{ color: T.textMuted }}>—</span>
    )}
  </td>
);

const Field = ({ label, required, children }) => (
  <div>
    <label style={labelStyle}>
      {label}
      {required && <span style={{ color: T.danger, marginLeft: 2 }}>*</span>}
    </label>
    {children}
  </div>
);

const Sel = ({ value, onChange, disabled, children, invalid }) => (
  <div style={{ position: 'relative' }}>
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      style={{
        ...inputBase,
        paddingRight: 32,
        appearance: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        borderColor: invalid ? T.danger : T.border,
        opacity: disabled ? 0.7 : 1
      }}
      onFocus={focusGold}
      onBlur={blurNormal}
    >
      {children}
    </select>
    <ChevronDown size={14} style={{
      position: 'absolute', right: 10, top: '50%',
      transform: 'translateY(-50%)', color: T.textMuted, pointerEvents: 'none'
    }} />
  </div>
);

const Take_Quotation = () => {
  const [requests, setRequests] = useState([]);
  const [vendorOptions, setVendorOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedIndent, setSelectedIndent] = useState(null);
  const [status4, setStatus4] = useState('Done');
  const [noOfQuotation4, setNoOfQuotation4] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [addedMaterials, setAddedMaterials] = useState([]);

  useEffect(() => {
    setNoOfQuotation4(selectedVendors.length.toString());
  }, [selectedVendors]);

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const [reqRes, vendorRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/get-take-Quotation`),
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/vendors`),
      ]);
      if (reqRes.ok) {
        const d = await reqRes.json();
        setRequests(Array.isArray(d.data) ? d.data : []);
      } else { setRequests([]); }
      if (vendorRes.ok) {
        const v = await vendorRes.json();
        setVendorOptions(Array.isArray(v) ? v : []);
      }
    } catch (err) {
      console.error(err); setError('Failed to load data.');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const uniqueIndents = [
    ...new Set(requests.filter(r => r.INDENT_NUMBER_3).map(r => r.INDENT_NUMBER_3))
  ].sort();

  const indentItems = selectedIndent
    ? requests.filter(r => r.INDENT_NUMBER_3 === selectedIndent)
    : [];

  const addedUIDs = new Set(addedMaterials.map(m => m.selectedUID));

  const openModal = () => {
    setIsModalOpen(true); setCurrentStep(1); setSelectedIndent(null);
    setSelectedVendors([]); setAddedMaterials([]);
    setStatus4('Done'); setNoOfQuotation4('');
    setSaveSuccess(false); setSaveError('');
  };

  const closeModal = () => {
    setIsModalOpen(false); setCurrentStep(1); setSelectedIndent(null);
    setSelectedVendors([]); setAddedMaterials([]);
    setIsSaving(false); setSaveSuccess(false); setSaveError('');
  };

  const addVendor = () => {
    setSelectedVendors(prev => [...prev, {
      firm: '', name: '', gst: '', contact: '', address: '',
      deliveryDate: '', billType: '', paymentTerms: '', creditInDays: '',
      transportRequired: '', expectedTransportCharges: '',
      freightCharges: '', expectedFreightCharges: '',
    }]);
    setAddedMaterials(prev => prev.map(mat => ({
      ...mat,
      vendorRates: [
        ...mat.vendorRates,
        {
          rate: '',
          brandName: mat['DECIDED_BRAND/COMPANY_NAME_2'] || '',
          discount: '',
        },
      ],
    })));
  };

  const removeVendor = (vIdx) => {
    setSelectedVendors(prev => prev.filter((_, i) => i !== vIdx));
    setAddedMaterials(prev => prev.map(mat => ({
      ...mat,
      vendorRates: mat.vendorRates.filter((_, i) => i !== vIdx),
    })));
  };

  const handleVendorChange = (vIdx, field, value) => {
    const u = [...selectedVendors];
    u[vIdx][field] = value;
    if (field === 'firm') {
      const v = vendorOptions.find(o => o.vendorFirm === value);
      u[vIdx].gst = v?.gstNumber || '';
      u[vIdx].contact = v?.contactNo || '';
      u[vIdx].name = v?.vendorName || '';
    }
    if (field === 'paymentTerms' && value !== 'Credit') u[vIdx].creditInDays = '';
    if (field === 'transportRequired' && value !== 'Yes') u[vIdx].expectedTransportCharges = '';
    if (field === 'freightCharges' && value !== 'Yes') u[vIdx].expectedFreightCharges = '';
    setSelectedVendors(u);
  };

  const addMaterial = (uid) => {
    if (!uid || addedUIDs.has(uid)) return;
    const req = indentItems.find(r => r.UID === uid);
    if (!req) return;
    const decidedBrand = req.DECIDED_BRAND_2 || req['DECIDED_BRAND/COMPANY_NAME_2'] || '';
    setAddedMaterials(prev => [...prev, {
      selectedUID: uid,
      Material_Name: req.Material_Name || '',
      Material_Size: req.Material_Size || '',
      Material_Specification: req.Specification || '',
      Revised_Quantity: req.REVISED_QTY_2 || req.REVISED_QUANTITY_2 || '',
      Unit_Name: req.Unit_Name || '',
      'DECIDED_BRAND/COMPANY_NAME_2': decidedBrand,
      cgst: '', sgst: '', igst: '',
      vendorRates: selectedVendors.map(() => ({
        rate: '', brandName: decidedBrand, discount: '',
      })),
    }]);
  };

  const removeMaterial = (mIdx) => {
    setAddedMaterials(prev => prev.filter((_, i) => i !== mIdx));
  };

  const handleMaterialTax = (mIdx, field, value) => {
    const u = [...addedMaterials];
    u[mIdx][field] = value;
    setAddedMaterials(u);
  };

  const handleVendorRate = (mIdx, vIdx, field, value) => {
    const u = [...addedMaterials];
    u[mIdx].vendorRates[vIdx][field] = value;
    setAddedMaterials(u);
  };

  const calcFinal = (mat, vIdx) => {
    const rate = parseFloat(mat.vendorRates[vIdx]?.rate) || 0;
    if (rate <= 0) return { final: '', total: '' };
    const disc = parseFloat(mat.vendorRates[vIdx]?.discount) || 0;
    const cgst = parseFloat(mat.cgst) || 0;
    const sgst = parseFloat(mat.sgst) || 0;
    const igst = parseFloat(mat.igst) || 0;
    const base = rate * (1 - disc / 100);
    const tax = base * ((cgst + sgst + igst) / 100);
    const final = (base + tax).toFixed(2);
    const total = ((parseFloat(mat.Revised_Quantity) || 0) * parseFloat(final)).toFixed(2);
    return { final, total };
  };

  // ✅ NEW - Step 4 ke liye vendor-wise grand total calculate karna
  const calcVendorGrandTotal = (vIdx) => {
    let grand = 0;
    addedMaterials.forEach(mat => {
      const { total } = calcFinal(mat, vIdx);
      grand += parseFloat(total) || 0;
    });
    return grand;
  };

  // ✅ NEW - Sabse sasta vendor dhundhna
  const findCheapestVendor = () => {
    if (selectedVendors.length === 0 || addedMaterials.length === 0) return -1;
    let minTotal = Infinity;
    let minIdx = -1;
    selectedVendors.forEach((_, vIdx) => {
      const total = calcVendorGrandTotal(vIdx);
      if (total > 0 && total < minTotal) {
        minTotal = total;
        minIdx = vIdx;
      }
    });
    return minIdx;
  };

  const validateStep3 = () => {
    if (selectedVendors.length === 0) return false;
    for (const v of selectedVendors) {
      if (!v.firm || !v.deliveryDate || !v.billType || !v.paymentTerms ||
        !v.transportRequired || !v.freightCharges) return false;
      if (v.paymentTerms === 'Credit' && !v.creditInDays) return false;
      if (v.transportRequired === 'Yes' && !v.expectedTransportCharges) return false;
      if (v.freightCharges === 'Yes' && !v.expectedFreightCharges) return false;
    }
    if (addedMaterials.length === 0) return false;
    for (const mat of addedMaterials) {
      for (const vr of mat.vendorRates) { if (!vr.rate) return false; }
    }
    return true;
  };

  const num = (val) => {
    if (val === null || val === undefined || val === '') return 0;
    const n = parseFloat(String(val).replace(/[₹,\s']/g, ''));
    return isNaN(n) ? 0 : n;
  };

  const handleSave = async () => {
    if (!selectedIndent) { setSaveError('Select indent.'); return; }
    const entries = [];
    for (const mat of addedMaterials) {
      for (let vIdx = 0; vIdx < selectedVendors.length; vIdx++) {
        const vendor = selectedVendors[vIdx];
        const vr = mat.vendorRates[vIdx];
        const { final: finalRate, total: totalValue } = calcFinal(mat, vIdx);
        if (!finalRate || num(totalValue) <= 0) {
          setSaveError('Fill Rate for all materials x vendors.');
          return;
        }
        entries.push({
          Req_No: indentItems[0]?.Req_No || '',
          UID: String(mat.selectedUID),
          Project_Name: indentItems[0]?.Project_Name || '',
          site_name: indentItems[0]?.Project_Name || '',
          Indent_No: selectedIndent,
          Material_name: mat.Material_Name,
          Material_Size: mat.Material_Size || '',
          Material_Specification: mat.Material_Specification || '',
          Vendor_Name: vendor.name,
          Vendor_Firm_Name: vendor.firm,
          Vendor_Ferm_Name: vendor.firm,
          Vendor_Address: vendor.address,
          Contact_Number: vendor.contact,
          Vendor_GST_No: vendor.gst,
          RATE: num(vr.rate),
          Discount: num(vr.discount),
          CGST: num(mat.cgst),
          SGST: num(mat.sgst),
          IGST: num(mat.igst),
          Final_Rate: num(finalRate),
          Delivery_Expected_Date: vendor.deliveryDate,
          Payment_Terms: vendor.paymentTerms,
          Payment_Terms_Condistion_Advacne_Credit: vendor.paymentTerms,
          Credit_in_Days: parseInt(vendor.creditInDays) || 0,
          Bill_Type: vendor.billType,
          IS_TRANSPORT_REQUIRED: vendor.transportRequired,
          EXPECTED_TRANSPORT_CHARGES: num(vendor.expectedTransportCharges),
          FREIGHT_CHARGES: vendor.freightCharges,
          FRIGHET_CHARGES: vendor.freightCharges,
          EXPECTED_FREIGHT_CHARGES: num(vendor.expectedFreightCharges),
          EXPECTED_FRIGHET_CHARGES: num(vendor.expectedFreightCharges),
          PLANNED_4: status4,
          NO_OF_QUOTATION_4: noOfQuotation4,
          REMARK_4: vr.brandName || '',
          REVISED_QUANTITY_2: num(mat.Revised_Quantity),
          Total_Value: num(totalValue),
        });
      }
    }
    setIsSaving(true); setSaveError('');
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/save-take-Quotation`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ entries })
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setSaveSuccess(true);
      setTimeout(() => { closeModal(); fetchData(); }, 1500);
    } catch (err) {
      setSaveError(err.message);
    } finally { setIsSaving(false); }
  };

  const tableCols = [
    { label: '#', w: 50 },
    { label: 'Planned', w: 100 },
    { label: 'UID', w: 60 },
    { label: 'Req No', w: 90 },
    { label: 'Project', w: 140 },
    { label: 'Material', w: 200 },
    { label: 'Size', w: 80 },
    { label: 'Rev Qty', w: 80 },
    { label: 'Unit', w: 60 },
    { label: 'Brand', w: 180 },
    { label: 'Indent', w: 100 },
    { label: 'PDF', w: 70 },
  ];

  const stepLabels = ['Select Indent', 'Review', 'Add Vendors & Rates', 'Review', 'Final'];

  if (loading) return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '80px 20px'
    }}>
      <Loader2 size={28} color={T.gold}
        style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} />
      <p style={{ color: T.navy, fontWeight: 600 }}>Loading...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ width: '100%' }}>

      {/* ── HEADER ── */}
      <div style={{
        background: T.card, borderRadius: 10, border: `1px solid ${T.border}`,
        padding: '16px 20px', marginBottom: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <FileText size={18} color={T.gold} />
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: T.navy, margin: 0 }}>
              Take Quotation
            </h2>
            <p style={{ fontSize: 12, color: T.textMuted, margin: 0 }}>
              {requests.length} pending
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={fetchData} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 8,
            border: `1.5px solid ${T.border}`, background: T.card,
            color: T.textLight, fontSize: 13, cursor: 'pointer'
          }}>
            <RotateCcw size={14} /> Refresh
          </button>
          <button onClick={openModal} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 18px', borderRadius: 8, border: 'none',
            background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
            color: T.navyDark, fontSize: 13, fontWeight: 700,
            cursor: 'pointer', boxShadow: `0 2px 8px ${T.gold}40`
          }}>
            <Plus size={15} /> Create Quotation
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px', background: T.dangerBg,
          border: `1px solid ${T.dangerBorder}`, borderRadius: 10,
          marginBottom: 16, fontSize: 13, color: T.danger
        }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* ── TABLE ── */}
      <div style={{
        background: T.card, borderRadius: 10,
        border: `1px solid ${T.border}`, overflow: 'hidden'
      }}>
        {requests.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <Package size={40} color={T.border} style={{ marginBottom: 12 }} />
            <p style={{ color: T.textLight }}>No pending</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', maxHeight: '65vh', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                <tr style={{ background: T.navy }}>
                  {tableCols.map((c, i) => (
                    <th key={i} style={{
                      padding: '12px 14px', textAlign: 'left',
                      color: T.goldLight, fontSize: 11, fontWeight: 700,
                      textTransform: 'uppercase', whiteSpace: 'nowrap',
                      minWidth: c.w, borderBottom: `2px solid ${T.gold}`
                    }}>
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {requests.map((req, idx) => (
                  <tr
                    key={req.UID + idx}
                    style={{ background: idx % 2 === 0 ? T.card : T.borderLight }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = `${T.gold}08`; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = idx % 2 === 0 ? T.card : T.borderLight; }}
                  >
                    <Td>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 26, height: 26, borderRadius: 6,
                        background: T.borderLight, fontSize: 12, fontWeight: 600, color: T.textLight
                      }}>
                        {idx + 1}
                      </span>
                    </Td>
                    <Td>{req.PLANNED_4}</Td>
                    <Td>
                      <span style={{
                        background: `${T.navy}15`, color: T.navy,
                        padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600
                      }}>
                        {req.UID}
                      </span>
                    </Td>
                    <Td>
                      <span style={{
                        background: `${T.gold}15`, color: T.goldDark,
                        padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600
                      }}>
                        {req.Req_No}
                      </span>
                    </Td>
                    <Td maxW={140}>{req.Project_Name}</Td>
                    <Td wrap>
                      <span style={{
                        display: 'block', fontSize: 13, fontWeight: 500,
                        color: T.text, lineHeight: 1.5,
                        minWidth: 150, maxWidth: 250, wordBreak: 'break-word',
                      }}>
                        {req.Material_Name || <span style={{ color: T.textMuted }}>—</span>}
                      </span>
                    </Td>
                    <Td>
                      {req.Material_Size && (
                        <span style={{
                          background: `${T.gold}15`, color: T.goldDark,
                          padding: '2px 7px', borderRadius: 4, fontSize: 11, fontWeight: 600
                        }}>
                          {req.Material_Size}
                        </span>
                      )}
                    </Td>
                    <td style={{
                      padding: '10px 14px', fontSize: 13, color: T.text,
                      borderBottom: `1px solid ${T.border}`,
                      whiteSpace: 'nowrap', textAlign: 'right', verticalAlign: 'top'
                    }}>
                      {req.REVISED_QTY_2 || req.REVISED_QUANTITY_2 ||
                        <span style={{ color: T.textMuted }}>—</span>}
                    </td>
                    <Td>{req.Unit_Name}</Td>
                    <Td wrap>
                      <span style={{
                        display: 'block', fontSize: 13, fontWeight: 500,
                        color: T.text, lineHeight: 1.5,
                        minWidth: 120, maxWidth: 200, wordBreak: 'break-word',
                      }}>
                        {req.DECIDED_BRAND_2 || req['DECIDED_BRAND/COMPANY_NAME_2'] ||
                          <span style={{ color: T.textMuted }}>—</span>}
                      </span>
                    </Td>
                    <Td>
                      <span style={{
                        background: `${T.purple}15`, color: T.purple,
                        padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600
                      }}>
                        {req.INDENT_NUMBER_3}
                      </span>
                    </Td>
                    <td style={{
                      padding: '10px 14px', borderBottom: `1px solid ${T.border}`,
                      verticalAlign: 'top'
                    }}>
                      {req.PDF_URL_3 ? (
                        <a
                          href={req.PDF_URL_3} target="_blank" rel="noopener noreferrer"
                          style={{ color: T.gold, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}
                        >
                          <ExternalLink size={12} />
                        </a>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ═══════════════ MODAL ═══════════════ */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          width: '100%', height: '100vh',
          background: T.card, zIndex: 200,
          display: 'flex', flexDirection: 'column'
        }}>

          {/* Modal Header */}
          <div style={{
            background: T.navy, padding: '12px 24px',
            borderBottom: `2px solid ${T.gold}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <FileText size={18} color={T.gold} />
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'white', margin: 0 }}>
                Create Quotation — Step {currentStep}/5
              </h3>
            </div>
            <button
              onClick={closeModal}
              disabled={isSaving}
              style={{
                width: 32, height: 32, borderRadius: 8, border: 'none',
                background: 'rgba(255,255,255,0.1)', color: 'white',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Step Indicator */}
          <div style={{
            padding: '10px 24px', background: T.borderLight,
            borderBottom: `1px solid ${T.border}`, flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, maxWidth: 800 }}>
              {stepLabels.map((label, i) => {
                const step = i + 1;
                return (
                  <React.Fragment key={step}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: '50%',
                        background: currentStep >= step
                          ? `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`
                          : T.border,
                        color: currentStep >= step ? T.navyDark : T.textMuted,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700
                      }}>
                        {currentStep > step ? <Check size={12} /> : step}
                      </div>
                      <span style={{
                        fontSize: 11,
                        fontWeight: currentStep === step ? 600 : 400,
                        color: currentStep === step ? T.navy : T.textMuted,
                        whiteSpace: 'nowrap'
                      }}>
                        {label}
                      </span>
                    </div>
                    {step < 5 && (
                      <div style={{
                        flex: 1, height: 2,
                        background: currentStep > step ? T.gold : T.border,
                        borderRadius: 2
                      }} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Modal Body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', background: T.bg }}>

            {saveSuccess && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 14px', background: T.successBg,
                border: `1px solid ${T.successBorder}`, borderRadius: 8,
                marginBottom: 16, fontSize: 13, color: '#065f46', maxWidth: 500
              }}>
                <CheckCircle size={16} color={T.success} /> Created!
              </div>
            )}

            {saveError && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 14px', background: T.dangerBg,
                border: `1px solid ${T.dangerBorder}`, borderRadius: 8,
                marginBottom: 16, fontSize: 13, color: T.danger, maxWidth: 500
              }}>
                <AlertCircle size={16} /> {saveError}
              </div>
            )}

            {/* ── STEP 1 ── */}
            {currentStep === 1 && (
              <div style={{ maxWidth: 500 }}>
                <div style={{
                  background: `${T.gold}10`, border: `1px solid ${T.gold}30`,
                  borderRadius: 10, padding: '12px 16px', marginBottom: 20,
                  borderLeft: `3px solid ${T.gold}`
                }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: T.goldDark, margin: 0 }}>
                    Select Indent Number
                  </p>
                </div>
                <Field label="Indent" required>
                  <Sel
                    value={selectedIndent || ''}
                    onChange={(e) => setSelectedIndent(e.target.value)}
                    invalid={!selectedIndent}
                  >
                    <option value="">-- Select --</option>
                    {uniqueIndents.map((n, i) => (
                      <option key={i} value={n}>{n}</option>
                    ))}
                  </Sel>
                </Field>
              </div>
            )}

            {/* ── STEP 2 ── */}
            {currentStep === 2 && (
              <div>
                <div style={{
                  background: T.successBg, border: `1px solid ${T.successBorder}`,
                  borderRadius: 10, padding: '12px 16px', marginBottom: 20,
                  borderLeft: `3px solid ${T.success}`
                }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#065f46', margin: '0 0 4px' }}>
                    Review {indentItems.length} Materials
                  </p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 10 }}>
                  {indentItems.map((req, i) => (
                    <div key={i} style={{
                      background: T.card, borderRadius: 8,
                      border: `1px solid ${T.border}`, padding: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <span style={{
                          background: `${T.navy}15`, color: T.navy,
                          padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700
                        }}>
                          UID: {req.UID}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: T.navy }}>
                          {req.Material_Name}
                        </span>
                      </div>
                      {(req.Material_Size || req.Specification) && (
                        <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                          {req.Material_Size && (
                            <span style={{
                              background: `${T.gold}15`, color: T.goldDark,
                              padding: '1px 6px', borderRadius: 3, fontSize: 10, fontWeight: 600
                            }}>
                              📏 {req.Material_Size}
                            </span>
                          )}
                          {req.Specification && (
                            <span style={{
                              background: `${T.purple}15`, color: T.purple,
                              padding: '1px 6px', borderRadius: 3, fontSize: 10, fontWeight: 600
                            }}>
                              ⚙️ {req.Specification}
                            </span>
                          )}
                        </div>
                      )}
                      <div style={{ fontSize: 11, color: T.textLight }}>
                        Qty: <strong>{req.REVISED_QTY_2 || req.REVISED_QUANTITY_2}</strong> {req.Unit_Name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── STEP 3 ── */}
            {currentStep === 3 && (
              <div>
                {/* VENDORS */}
                <div style={{
                  background: T.card, borderRadius: 12,
                  border: `1px solid ${T.border}`, padding: '16px', marginBottom: 20
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: 14, paddingBottom: 10, borderBottom: `2px solid ${T.border}`
                  }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>
                      Vendors ({selectedVendors.length})
                    </span>
                    <button onClick={addVendor} style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '7px 14px', borderRadius: 8, border: 'none',
                      background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
                      color: T.navyDark, fontSize: 12, fontWeight: 700, cursor: 'pointer'
                    }}>
                      <Plus size={13} /> Add Vendor
                    </button>
                  </div>

                  {selectedVendors.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '30px', color: T.textMuted }}>
                      <p>Add vendors first</p>
                      <button onClick={addVendor} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        padding: '8px 16px', borderRadius: 8, border: 'none',
                        background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
                        color: T.navyDark, fontSize: 13, fontWeight: 700,
                        cursor: 'pointer', marginTop: 10
                      }}>
                        <Plus size={14} /> Add First Vendor
                      </button>
                    </div>
                  )}

                  {selectedVendors.map((vendor, vIdx) => (
                    <div key={vIdx} style={{
                      background: T.borderLight, borderRadius: 10,
                      border: `1px solid ${T.border}`, padding: '14px', marginBottom: 10
                    }}>
                      <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', marginBottom: 12
                      }}>
                        <span style={{
                          fontSize: 13, fontWeight: 700, color: T.navy,
                          display: 'flex', alignItems: 'center', gap: 6
                        }}>
                          <span style={{
                            width: 24, height: 24, borderRadius: 6,
                            background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 11, fontWeight: 700, color: T.navyDark
                          }}>
                            {vIdx + 1}
                          </span>
                          {vendor.firm || 'New Vendor'}
                        </span>
                        <button onClick={() => removeVendor(vIdx)} style={{
                          display: 'flex', alignItems: 'center', gap: 3,
                          padding: '4px 10px', borderRadius: 6,
                          border: `1px solid ${T.dangerBorder}`,
                          background: T.dangerBg, color: T.danger, fontSize: 11, cursor: 'pointer'
                        }}>
                          <Trash2 size={11} /> Remove
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                        <Field label="Vendor Firm" required>
                          <Sel
                            value={vendor.firm}
                            onChange={(e) => handleVendorChange(vIdx, 'firm', e.target.value)}
                            invalid={!vendor.firm}
                          >
                            <option value="">-- Select --</option>
                            {vendorOptions.map((v, i) => (
                              <option key={i} value={v.vendorFirm}>{v.vendorFirm}</option>
                            ))}
                          </Sel>
                        </Field>
                        <Field label="Name">
                          <input value={vendor.name} readOnly style={inputReadonly} />
                        </Field>
                        <Field label="GST">
                          <input value={vendor.gst} readOnly style={inputReadonly} />
                        </Field>
                        <Field label="Contact">
                          <input value={vendor.contact} readOnly style={inputReadonly} />
                        </Field>
                        <Field label="Delivery Date" required>
                          <input
                            type="date" value={vendor.deliveryDate}
                            onChange={(e) => handleVendorChange(vIdx, 'deliveryDate', e.target.value)}
                            style={{ ...inputBase, borderColor: !vendor.deliveryDate ? T.danger : T.border }}
                            onFocus={focusGold} onBlur={blurNormal}
                          />
                        </Field>
                        <Field label="Bill Type" required>
                          <Sel
                            value={vendor.billType}
                            onChange={(e) => handleVendorChange(vIdx, 'billType', e.target.value)}
                            invalid={!vendor.billType}
                          >
                            <option value="">Select</option>
                            <option>Tax Invoice</option>
                            <option>Proforma Invoice</option>
                            <option>Cash Bill</option>
                          </Sel>
                        </Field>
                        <Field label="Payment" required>
                          <Sel
                            value={vendor.paymentTerms}
                            onChange={(e) => handleVendorChange(vIdx, 'paymentTerms', e.target.value)}
                            invalid={!vendor.paymentTerms}
                          >
                            <option value="">Select</option>
                            <option>Credit</option>
                            <option>Advance</option>
                          </Sel>
                        </Field>
                        {vendor.paymentTerms === 'Credit' && (
                          <Field label="Credit Days" required>
                            <input
                              type="number" value={vendor.creditInDays}
                              onChange={(e) => handleVendorChange(vIdx, 'creditInDays', e.target.value)}
                              style={{ ...inputBase, borderColor: !vendor.creditInDays ? T.danger : T.border }}
                              placeholder="30" onFocus={focusGold} onBlur={blurNormal}
                            />
                          </Field>
                        )}
                        <Field label="Transport" required>
                          <Sel
                            value={vendor.transportRequired}
                            onChange={(e) => handleVendorChange(vIdx, 'transportRequired', e.target.value)}
                            invalid={!vendor.transportRequired}
                          >
                            <option value="">Select</option>
                            <option>Yes</option>
                            <option>No</option>
                          </Sel>
                        </Field>
                        {vendor.transportRequired === 'Yes' && (
                          <Field label="Transport ₹" required>
                            <input
                              type="number" value={vendor.expectedTransportCharges}
                              onChange={(e) => handleVendorChange(vIdx, 'expectedTransportCharges', e.target.value)}
                              style={{ ...inputBase, borderColor: !vendor.expectedTransportCharges ? T.danger : T.border }}
                              onFocus={focusGold} onBlur={blurNormal}
                            />
                          </Field>
                        )}
                        <Field label="Freight" required>
                          <Sel
                            value={vendor.freightCharges}
                            onChange={(e) => handleVendorChange(vIdx, 'freightCharges', e.target.value)}
                            invalid={!vendor.freightCharges}
                          >
                            <option value="">Select</option>
                            <option>Yes</option>
                            <option>No</option>
                          </Sel>
                        </Field>
                        {vendor.freightCharges === 'Yes' && (
                          <Field label="Freight ₹" required>
                            <input
                              type="number" value={vendor.expectedFreightCharges}
                              onChange={(e) => handleVendorChange(vIdx, 'expectedFreightCharges', e.target.value)}
                              style={{ ...inputBase, borderColor: !vendor.expectedFreightCharges ? T.danger : T.border }}
                              onFocus={focusGold} onBlur={blurNormal}
                            />
                          </Field>
                        )}
                      </div>
                      <div style={{ marginTop: 10 }}>
                        <Field label="Address">
                          <textarea
                            value={vendor.address}
                            onChange={(e) => handleVendorChange(vIdx, 'address', e.target.value)}
                            rows={2} style={{ ...inputBase, resize: 'vertical' }}
                            onFocus={focusGold} onBlur={blurNormal}
                          />
                        </Field>
                      </div>
                    </div>
                  ))}
                </div>

                {/* MATERIALS */}
                {selectedVendors.length > 0 && (
                  <div style={{
                    background: T.card, borderRadius: 12,
                    border: `1px solid ${T.border}`, padding: '16px'
                  }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      marginBottom: 14, paddingBottom: 10, borderBottom: `2px solid ${T.border}`
                    }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>
                        Materials ({addedMaterials.length}/{indentItems.length})
                      </span>
                    </div>

                    {addedMaterials.map((mat, mIdx) => (
                      <div key={mIdx} style={{
                        background: T.borderLight, borderRadius: 10,
                        border: `1px solid ${T.border}`, padding: '14px', marginBottom: 14
                      }}>
                        <div style={{
                          display: 'flex', justifyContent: 'space-between',
                          alignItems: 'flex-start', marginBottom: 10
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <span style={{
                              background: T.navy, color: T.gold,
                              padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700
                            }}>
                              {mIdx + 1}. {mat.Material_Name}
                            </span>
                            {mat.Material_Size && (
                              <span style={{
                                background: `${T.gold}15`, color: T.goldDark,
                                padding: '2px 7px', borderRadius: 4, fontSize: 10, fontWeight: 600
                              }}>
                                📏 {mat.Material_Size}
                              </span>
                            )}
                            {mat.Material_Specification && (
                              <span style={{
                                background: `${T.purple}15`, color: T.purple,
                                padding: '2px 7px', borderRadius: 4, fontSize: 10, fontWeight: 600
                              }}>
                                ⚙️ {mat.Material_Specification}
                              </span>
                            )}
                            <span style={{ fontSize: 11, color: T.textMuted }}>
                              Qty: <strong>{mat.Revised_Quantity}</strong> {mat.Unit_Name} | UID: {mat.selectedUID}
                            </span>
                          </div>
                          <button onClick={() => removeMaterial(mIdx)} style={{
                            display: 'flex', alignItems: 'center', gap: 3,
                            padding: '4px 10px', borderRadius: 6,
                            border: `1px solid ${T.dangerBorder}`,
                            background: T.dangerBg, color: T.danger, fontSize: 11, cursor: 'pointer',
                            flexShrink: 0
                          }}>
                            <Trash2 size={11} /> Remove
                          </button>
                        </div>

                        <div style={{ overflowX: 'auto', marginBottom: 10 }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                            <thead>
                              <tr style={{ background: T.navy }}>
                                <th style={{ padding: '8px 10px', color: T.gold, fontSize: 10, fontWeight: 700, textAlign: 'left' }}>Vendor</th>
                                <th style={{ padding: '8px 10px', color: T.gold, fontSize: 10, fontWeight: 700, textAlign: 'center' }}>Rate ₹ *</th>
                                <th style={{ padding: '8px 10px', color: T.gold, fontSize: 10, fontWeight: 700, textAlign: 'left' }}>
                                  Brand
                                  <span style={{ fontSize: 9, color: `${T.gold}99`, marginLeft: 4, fontWeight: 400 }}>
                                    (pre-filled, editable)
                                  </span>
                                </th>
                                <th style={{ padding: '8px 10px', color: T.gold, fontSize: 10, fontWeight: 700, textAlign: 'center' }}>Discount %</th>
                                <th style={{ padding: '8px 10px', color: T.gold, fontSize: 10, fontWeight: 700, textAlign: 'center' }}>Final Rate</th>
                                <th style={{ padding: '8px 10px', color: T.gold, fontSize: 10, fontWeight: 700, textAlign: 'center' }}>Total Value</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedVendors.map((vendor, vIdx) => {
                                const { final, total } = calcFinal(mat, vIdx);
                                return (
                                  <tr key={vIdx} style={{ background: vIdx % 2 === 0 ? T.card : T.borderLight }}>
                                    <td style={{ padding: '8px 10px', fontWeight: 600, color: T.navy }}>
                                      {vendor.firm || `Vendor ${vIdx + 1}`}
                                    </td>
                                    <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                                      <input
                                        type="number"
                                        value={mat.vendorRates[vIdx]?.rate || ''}
                                        onChange={(e) => handleVendorRate(mIdx, vIdx, 'rate', e.target.value)}
                                        placeholder="₹"
                                        style={{
                                          width: 80, padding: '5px 6px', fontSize: 12,
                                          border: `1.5px solid ${!mat.vendorRates[vIdx]?.rate ? T.danger : T.border}`,
                                          borderRadius: 5, outline: 'none', textAlign: 'center',
                                          fontWeight: 600, boxSizing: 'border-box'
                                        }}
                                        onFocus={focusGold} onBlur={blurNormal}
                                      />
                                    </td>
                                    <td style={{ padding: '6px 8px' }}>
                                      <input
                                        type="text"
                                        value={mat.vendorRates[vIdx]?.brandName || ''}
                                        onChange={(e) => handleVendorRate(mIdx, vIdx, 'brandName', e.target.value)}
                                        placeholder="Brand name"
                                        style={{
                                          width: 120, padding: '5px 6px', fontSize: 11,
                                          border: `1.5px solid ${T.border}`, borderRadius: 5,
                                          outline: 'none', boxSizing: 'border-box',
                                          background: mat.vendorRates[vIdx]?.brandName ? `${T.gold}12` : T.borderLight,
                                          color: T.text,
                                        }}
                                        onFocus={focusGold} onBlur={blurNormal}
                                      />
                                    </td>
                                    <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                                      <input
                                        type="number"
                                        value={mat.vendorRates[vIdx]?.discount || ''}
                                        onChange={(e) => handleVendorRate(mIdx, vIdx, 'discount', e.target.value)}
                                        placeholder="0"
                                        style={{
                                          width: 60, padding: '5px 6px', fontSize: 12,
                                          border: `1.5px solid ${T.border}`, borderRadius: 5,
                                          outline: 'none', textAlign: 'center', boxSizing: 'border-box'
                                        }}
                                        onFocus={focusGold} onBlur={blurNormal}
                                      />
                                    </td>
                                    <td style={{
                                      padding: '8px 10px', textAlign: 'center',
                                      fontWeight: 700, color: final ? T.success : T.textMuted
                                    }}>
                                      {final ? `₹${final}` : '—'}
                                    </td>
                                    <td style={{
                                      padding: '8px 10px', textAlign: 'center',
                                      fontWeight: 700, color: total ? T.navy : T.textMuted
                                    }}>
                                      {total
                                        ? `₹${parseFloat(total).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
                                        : '—'}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        <div style={{
                          background: `${T.gold}08`, borderRadius: 8,
                          border: `1px solid ${T.gold}30`, padding: '10px 12px'
                        }}>
                          <div style={{
                            fontSize: 11, fontWeight: 700, color: T.goldDark,
                            marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5
                          }}>
                            <Copy size={12} /> GST for this material (same for all vendors)
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                            <Field label="CGST %">
                              <input type="number" value={mat.cgst}
                                onChange={(e) => handleMaterialTax(mIdx, 'cgst', e.target.value)}
                                style={inputBase} placeholder="0" onFocus={focusGold} onBlur={blurNormal} />
                            </Field>
                            <Field label="SGST %">
                              <input type="number" value={mat.sgst}
                                onChange={(e) => handleMaterialTax(mIdx, 'sgst', e.target.value)}
                                style={inputBase} placeholder="0" onFocus={focusGold} onBlur={blurNormal} />
                            </Field>
                            <Field label="IGST %">
                              <input type="number" value={mat.igst}
                                onChange={(e) => handleMaterialTax(mIdx, 'igst', e.target.value)}
                                style={inputBase} placeholder="0" onFocus={focusGold} onBlur={blurNormal} />
                            </Field>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div style={{ marginTop: 10 }}>
                      <label style={labelStyle}>Add Material</label>
                      <div style={{ position: 'relative' }}>
                        <select
                          value=""
                          onChange={(e) => { if (e.target.value) addMaterial(e.target.value); }}
                          style={{ ...inputBase, paddingRight: 32, appearance: 'none', cursor: 'pointer' }}
                          onFocus={focusGold} onBlur={blurNormal}
                        >
                          <option value="">-- Select Material to Add --</option>
                          {indentItems.map(item => {
                            const isAdded = addedUIDs.has(item.UID);
                            return (
                              <option
                                key={item.UID} value={item.UID} disabled={isAdded}
                                style={{ color: isAdded ? T.textMuted : T.text }}
                              >
                                {isAdded ? '✓ ' : ''}
                                {item.Material_Name}
                                {item.Material_Size ? ` | ${item.Material_Size}` : ''}
                                {' | Qty: '}{item.REVISED_QTY_2 || item.REVISED_QUANTITY_2}
                                {' | UID: '}{item.UID}
                                {isAdded ? ' (Added)' : ''}
                              </option>
                            );
                          })}
                        </select>
                        <ChevronDown size={14} style={{
                          position: 'absolute', right: 10, top: '50%',
                          transform: 'translateY(-50%)', color: T.textMuted, pointerEvents: 'none'
                        }} />
                      </div>
                      <div style={{ marginTop: 8, fontSize: 11, color: T.textMuted }}>
                        {addedMaterials.length} of {indentItems.length} added
                        {addedMaterials.length < indentItems.length && (
                          <span style={{ color: T.danger, marginLeft: 8 }}>
                            ({indentItems.length - addedMaterials.length} remaining)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── STEP 4: Review ── */}
            {currentStep === 4 && (() => {
              const cheapestIdx = findCheapestVendor();

              // ✅ Vendor-wise grand totals
              const vendorGrandTotals = selectedVendors.map((_, vIdx) => calcVendorGrandTotal(vIdx));

              // ✅ Overall grand total (sabhi vendors ka sum)
              const overallGrandTotal = vendorGrandTotals.reduce((a, b) => a + b, 0);

              return (
                <div>
                  {/* ✅ Summary Banner */}
                  <div style={{
                    background: T.successBg, border: `1px solid ${T.successBorder}`,
                    borderRadius: 10, padding: '12px 16px', marginBottom: 20,
                    borderLeft: `3px solid ${T.success}`
                  }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#065f46', margin: 0 }}>
                      Indent: <strong>{selectedIndent}</strong> &nbsp;|&nbsp;
                      Vendors: <strong>{selectedVendors.length}</strong> &nbsp;|&nbsp;
                      Materials: <strong>{addedMaterials.length}</strong>
                    </p>
                  </div>

                  {/* ✅ NEW - Vendor-wise Grand Total Cards */}
                  <div style={{ marginBottom: 20 }}>
                    <h4 style={{
                      fontSize: 13, fontWeight: 700, color: T.navy,
                      marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6
                    }}>
                      💰 Vendor-wise Grand Total
                    </h4>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                      gap: 10,
                      marginBottom: 12
                    }}>
                      {selectedVendors.map((vendor, vIdx) => {
                        const grand = vendorGrandTotals[vIdx];
                        const isCheapest = vIdx === cheapestIdx;
                        return (
                          <div key={vIdx} style={{
                            background: isCheapest
                              ? `linear-gradient(135deg, ${T.successBg}, #d1fae5)`
                              : T.card,
                            borderRadius: 10,
                            border: `2px solid ${isCheapest ? T.success : T.border}`,
                            padding: '14px 16px',
                            position: 'relative',
                            boxShadow: isCheapest ? `0 4px 12px ${T.success}25` : 'none',
                          }}>
                            {isCheapest && (
                              <div style={{
                                position: 'absolute', top: -10, right: 10,
                                background: T.success, color: 'white',
                                fontSize: 10, fontWeight: 700, padding: '2px 8px',
                                borderRadius: 20, letterSpacing: 0.5
                              }}>
                                ✓ LOWEST
                              </div>
                            )}
                            <div style={{
                              fontSize: 11, color: T.textMuted,
                              marginBottom: 4, fontWeight: 600
                            }}>
                              Vendor {vIdx + 1}
                            </div>
                            <div style={{
                              fontSize: 13, fontWeight: 700,
                              color: T.navy, marginBottom: 6
                            }}>
                              {vendor.firm || '—'}
                            </div>
                            <div style={{
                              fontSize: 20, fontWeight: 800,
                              color: isCheapest ? T.success : T.navy,
                            }}>
                              ₹{grand > 0
                                ? grand.toLocaleString('en-IN', { maximumFractionDigits: 2 })
                                : '—'}
                            </div>
                            <div style={{
                              fontSize: 10, color: T.textMuted, marginTop: 4
                            }}>
                              {addedMaterials.length} item{addedMaterials.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* ✅ Overall Grand Total Bar */}
                    {selectedVendors.length > 1 && (
                      <div style={{
                        background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`,
                        borderRadius: 10, padding: '14px 20px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        flexWrap: 'wrap', gap: 10
                      }}>
                        <div style={{ color: T.goldLight, fontSize: 13, fontWeight: 600 }}>
                          📊 Combined Total (All Vendors)
                        </div>
                        <div style={{ color: T.gold, fontSize: 22, fontWeight: 800 }}>
                          ₹{overallGrandTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Vendors Detail */}
                  <div style={{ marginBottom: 16 }}>
                    <h4 style={{ fontSize: 13, fontWeight: 700, color: T.navy, marginBottom: 8 }}>
                      Vendors Detail
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 10 }}>
                      {selectedVendors.map((v, vIdx) => (
                        <div key={vIdx} style={{
                          background: T.card, borderRadius: 8,
                          border: `1px solid ${T.border}`, padding: '10px 12px', fontSize: 11
                        }}>
                          <div style={{ fontWeight: 700, color: T.navy, marginBottom: 6 }}>
                            Vendor {vIdx + 1}: {v.firm}
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 10px' }}>
                            {[['Name', v.name], ['GST', v.gst], ['Delivery', v.deliveryDate], ['Payment', v.paymentTerms]].map(([l, val]) => (
                              <div key={l}>
                                <span style={{ color: T.textMuted }}>{l}: </span>
                                <strong>{val || '—'}</strong>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Materials Detail */}
                  {addedMaterials.map((mat, mIdx) => (
                    <div key={mIdx} style={{
                      background: T.card, borderRadius: 8,
                      border: `1px solid ${T.border}`, padding: '12px', marginBottom: 10
                    }}>
                      <div style={{ fontWeight: 700, color: T.navy, fontSize: 13, marginBottom: 8 }}>
                        {mat.Material_Name}
                        {mat.Material_Size && ` (${mat.Material_Size})`} | Qty: {mat.Revised_Quantity}
                      </div>
                      <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 6 }}>
                        GST: CGST {mat.cgst || 0}% | SGST {mat.sgst || 0}% | IGST {mat.igst || 0}%
                      </div>
                      {selectedVendors.map((vendor, vIdx) => {
                        const { final, total } = calcFinal(mat, vIdx);
                        const vr = mat.vendorRates[vIdx] || {};
                        const isCheapestVendor = vIdx === cheapestIdx;
                        return (
                          <div key={vIdx} style={{
                            display: 'flex', justifyContent: 'space-between',
                            padding: '5px 8px', borderBottom: `1px dashed ${T.border}`,
                            fontSize: 11,
                            background: isCheapestVendor ? `${T.success}08` : 'transparent',
                            borderRadius: 4
                          }}>
                            <span style={{
                              fontWeight: isCheapestVendor ? 700 : 400,
                              color: isCheapestVendor ? T.success : T.text
                            }}>
                              {isCheapestVendor ? '✓ ' : ''}{vendor.firm}
                            </span>
                            <span>
                              Rate: <strong>₹{vr.rate || '—'}</strong> |
                              Brand: <strong>{vr.brandName || '—'}</strong> |
                              Disc: {vr.discount || 0}% |
                              Final: <strong style={{ color: T.success }}>₹{final || '—'}</strong> |
                              Total: <strong style={{ color: isCheapestVendor ? T.success : T.navy }}>
                                ₹{total || '—'}
                              </strong>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* ── STEP 5 ── */}
            {currentStep === 5 && (
              <div style={{ maxWidth: 500 }}>
                <Field label="Status" required>
                  <Sel value={status4} onChange={(e) => setStatus4(e.target.value)}>
                    <option value="Done">✅ Done</option>
                    <option value="PENDING">⏳ PENDING</option>
                  </Sel>
                </Field>
                <div style={{ marginTop: 14 }}>
                  <Field label="No. of Quotations">
                    <input
                      value={noOfQuotation4} readOnly
                      style={{ ...inputReadonly, fontWeight: 700, fontSize: 15, textAlign: 'center' }}
                    />
                  </Field>
                </div>
                <div style={{
                  marginTop: 14, background: T.borderLight, borderRadius: 10,
                  border: `1px solid ${T.border}`, padding: '14px'
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.navy, marginBottom: 10 }}>Summary</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[
                      ['Indent', selectedIndent],
                      ['Vendors', selectedVendors.length],
                      ['Materials', addedMaterials.length],
                      ['Entries', addedMaterials.length * selectedVendors.length]
                    ].map(([l, val]) => (
                      <div key={l} style={{
                        padding: '8px 12px', background: T.card,
                        borderRadius: 6, border: `1px solid ${T.border}`
                      }}>
                        <div style={{ color: T.textMuted, fontSize: 10, marginBottom: 3 }}>{l}</div>
                        <div style={{ fontWeight: 700, color: T.navy, fontSize: 14 }}>{val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div style={{
            padding: '12px 24px', borderTop: `1px solid ${T.border}`,
            background: T.card, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div>
              {currentStep === 3 && selectedVendors.length > 0 && !validateStep3() && (
                <p style={{ fontSize: 11, color: T.danger, display: 'flex', alignItems: 'center', gap: 4, margin: 0 }}>
                  <AlertCircle size={12} /> Fill all fields + Rate
                </p>
              )}
              {currentStep === 3 && validateStep3() && (
                <p style={{ fontSize: 11, color: T.success, display: 'flex', alignItems: 'center', gap: 4, margin: 0 }}>
                  <CheckCircle size={12} /> All valid ✓
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              {currentStep > 1 && (
                <button
                  onClick={() => setCurrentStep(s => s - 1)}
                  disabled={isSaving}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '8px 16px', borderRadius: 8,
                    border: `1.5px solid ${T.border}`, background: T.card,
                    color: T.textLight, fontSize: 12, fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  <ArrowLeft size={13} /> Back
                </button>
              )}
              <button
                onClick={closeModal}
                disabled={isSaving}
                style={{
                  padding: '8px 16px', borderRadius: 8,
                  border: `1.5px solid ${T.border}`, background: T.card,
                  color: T.textLight, fontSize: 12, fontWeight: 600, cursor: 'pointer'
                }}
              >
                Cancel
              </button>

              {currentStep < 5 ? (
                <button
                  onClick={() => {
                    if (currentStep === 1 && !selectedIndent) return;
                    if (currentStep === 3 && !validateStep3()) return;
                    setCurrentStep(s => s + 1);
                  }}
                  disabled={
                    (currentStep === 1 && !selectedIndent) ||
                    (currentStep === 3 && !validateStep3()) ||
                    isSaving
                  }
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '8px 20px', borderRadius: 8, border: 'none',
                    background: (
                      (currentStep === 1 && !selectedIndent) ||
                      (currentStep === 3 && !validateStep3())
                    ) ? T.border : `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
                    color: (
                      (currentStep === 1 && !selectedIndent) ||
                      (currentStep === 3 && !validateStep3())
                    ) ? T.textMuted : T.navyDark,
                    fontSize: 12, fontWeight: 700,
                    cursor: (
                      (currentStep === 1 && !selectedIndent) ||
                      (currentStep === 3 && !validateStep3())
                    ) ? 'not-allowed' : 'pointer',
                    opacity: (
                      (currentStep === 1 && !selectedIndent) ||
                      (currentStep === 3 && !validateStep3())
                    ) ? 0.6 : 1,
                  }}
                >
                  Next <ArrowRight size={13} />
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={isSaving || saveSuccess}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '8px 24px', borderRadius: 8, border: 'none',
                    background: saveSuccess
                      ? T.success
                      : `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
                    color: saveSuccess ? 'white' : T.navyDark,
                    fontSize: 12, fontWeight: 700,
                    cursor: isSaving || saveSuccess ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isSaving
                    ? <><Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Saving...</>
                    : saveSuccess
                      ? <><CheckCircle size={14} /> Saved!</>
                      : <><Check size={14} /> Save Quotation</>
                  }
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

export default Take_Quotation;
