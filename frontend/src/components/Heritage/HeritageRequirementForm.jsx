// import React, { useState, useMemo, useEffect } from "react";
// import {
//   Plus, Trash2, Send, RotateCcw, Loader2, AlertCircle,
//   CheckCircle, ChevronDown, Search, Lock
// } from "lucide-react";
// import Swal from 'sweetalert2';

// // ✅ REDUX HOOKS
// import {
//   useGetHeritageProjectDataQuery,
//   useSubmitHeritageRequirementMutation,
// } from '../../redux/heritageRequirementSlice';

// // ─── THEME ───────────────────────────────────────────────
// const T = {
//   navy: '#1e293b', navyLight: '#334155', navyDark: '#0f172a',
//   gold: '#f59e0b', goldLight: '#fbbf24', goldDark: '#d97706',
//   bg: '#f8fafc', card: '#ffffff', text: '#1e293b',
//   textLight: '#64748b', textMuted: '#94a3b8',
//   border: '#e2e8f0', borderLight: '#f1f5f9',
//   success: '#10b981', successBg: '#ecfdf5', successBorder: '#a7f3d0',
//   danger: '#ef4444', dangerBg: '#fef2f2', dangerBorder: '#fecaca',
//   warningBg: '#fffbeb', warningBorder: '#fde68a', warningText: '#92400e',
// };

// const S = {
//   label: { display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6, letterSpacing: 0.3 },
//   req: { color: T.danger, marginLeft: 2 },
//   input: {
//     width: '100%', padding: '10px 12px', fontSize: 13,
//     border: `1.5px solid ${T.border}`, borderRadius: 8,
//     outline: 'none', color: T.text, background: T.borderLight,
//     transition: 'all 0.2s', boxSizing: 'border-box',
//   },
//   inputReadonly: {
//     width: '100%', padding: '10px 12px', fontSize: 13,
//     border: `1.5px solid ${T.border}`, borderRadius: 8,
//     color: T.textLight, background: '#eef2f7',
//     boxSizing: 'border-box', cursor: 'default', fontWeight: 500,
//   },
//   select: {
//     width: '100%', padding: '10px 12px', fontSize: 13,
//     border: `1.5px solid ${T.border}`, borderRadius: 8,
//     outline: 'none', color: T.text, background: T.borderLight,
//     transition: 'all 0.2s', boxSizing: 'border-box',
//     cursor: 'pointer', appearance: 'none',
//   },
//   sectionTitle: {
//     fontSize: 15, fontWeight: 700, color: T.navy,
//     marginBottom: 16, paddingBottom: 10,
//     borderBottom: `2px solid ${T.border}`,
//     display: 'flex', alignItems: 'center', gap: 8,
//     flexWrap: 'wrap',
//   },
//   goldBar: { width: 3, height: 18, background: T.gold, borderRadius: 3, flexShrink: 0 },
//   card: {
//     background: T.card, borderRadius: 10,
//     border: `1px solid ${T.border}`,
//     padding: 'clamp(14px, 3vw, 22px)',
//     marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
//   },
// };

// const focusStyle = (e) => {
//   e.target.style.borderColor = T.gold;
//   e.target.style.boxShadow = `0 0 0 3px ${T.gold}15`;
//   e.target.style.background = T.card;
// };
// const blurStyle = (e) => {
//   e.target.style.borderColor = T.border;
//   e.target.style.boxShadow = 'none';
//   e.target.style.background = T.borderLight;
// };

// // ─── SEARCHABLE SELECT ───────────────────────────────────
// const SearchableSelect = ({ value, onChange, options, placeholder, required, label, disabled }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [search, setSearch] = useState("");
//   const filtered = options.filter(opt => opt.toLowerCase().includes(search.toLowerCase()));
//   const MAX = 100;
//   const display = search ? filtered : filtered.slice(0, MAX);

//   return (
//     <div style={{ position: 'relative', width: '100%' }}>
//       <label style={S.label}>
//         {label} {required && <span style={S.req}>*</span>}
//       </label>
//       <div style={{ position: 'relative' }}>
//         <input
//           type="text"
//           value={isOpen ? search : value || ""}
//           onChange={(e) => { setSearch(e.target.value); setIsOpen(true); }}
//           onFocus={() => { setIsOpen(true); setSearch(""); }}
//           onBlur={() => setTimeout(() => { setIsOpen(false); setSearch(""); }, 200)}
//           disabled={disabled}
//           placeholder={placeholder}
//           style={{
//             ...S.input, paddingRight: 32,
//             ...(disabled ? { background: '#f1f5f9', cursor: 'not-allowed', opacity: 0.7 } : {}),
//           }}
//           onFocusCapture={(e) => { if (!disabled) focusStyle(e); }}
//           onBlurCapture={(e) => {
//             e.target.style.borderColor = T.border;
//             e.target.style.boxShadow = 'none';
//             e.target.style.background = disabled ? '#f1f5f9' : T.borderLight;
//           }}
//         />
//         <Search size={14} style={{
//           position: 'absolute', right: 10, top: '50%',
//           transform: 'translateY(-50%)', color: T.textMuted, pointerEvents: 'none',
//         }} />
//       </div>
//       {isOpen && !disabled && (
//         <ul style={{
//           position: 'absolute', zIndex: 50, width: '100%',
//           background: 'white', border: `1px solid ${T.border}`,
//           borderRadius: 8, marginTop: 4, maxHeight: 220,
//           overflowY: 'auto', boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
//           padding: 0, listStyle: 'none',
//         }}>
//           {display.length > 0 ? display.map((opt, idx) => (
//             <li key={idx}
//               onMouseDown={(e) => { e.preventDefault(); onChange(opt); setSearch(""); setIsOpen(false); }}
//               style={{
//                 padding: '9px 14px', fontSize: 13, color: T.text,
//                 cursor: 'pointer', transition: 'background 0.1s',
//                 borderBottom: idx < display.length - 1 ? `1px solid ${T.borderLight}` : 'none',
//               }}
//               onMouseEnter={(e) => { e.currentTarget.style.background = `${T.gold}10`; }}
//               onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
//             >{opt}</li>
//           )) : (
//             <li style={{ padding: '12px 14px', color: T.textMuted, fontSize: 13, fontStyle: 'italic' }}>
//               No matching options
//             </li>
//           )}
//           {!search && filtered.length > MAX && (
//             <li style={{ padding: '8px', fontSize: 11, color: T.textMuted, textAlign: 'center', borderTop: `1px solid ${T.border}` }}>
//               Type to see {filtered.length - MAX} more...
//             </li>
//           )}
//         </ul>
//       )}
//     </div>
//   );
// };

// // ─── LOADING ─────────────────────────────────────────────
// const LoadingScreen = () => (
//   <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px' }}>
//     <div style={{
//       width: 56, height: 56, borderRadius: 14,
//       background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`,
//       display: 'flex', alignItems: 'center', justifyContent: 'center',
//       marginBottom: 20, boxShadow: `0 0 0 3px ${T.gold}30`,
//     }}>
//       <Loader2 size={28} color={T.gold} style={{ animation: 'spin 1s linear infinite' }} />
//     </div>
//     <p style={{ fontSize: 15, fontWeight: 600, color: T.navy, marginBottom: 4 }}>Loading Data...</p>
//     <p style={{ fontSize: 13, color: T.textMuted }}>Fetching options from server</p>
//     <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
//   </div>
// );

// const ErrorScreen = ({ error, onRetry }) => (
//   <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', textAlign: 'center' }}>
//     <div style={{ width: 56, height: 56, borderRadius: '50%', background: T.dangerBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
//       <AlertCircle size={28} color={T.danger} />
//     </div>
//     <p style={{ fontSize: 15, fontWeight: 600, color: T.navy, marginBottom: 6 }}>Failed to Load Data</p>
//     <p style={{ fontSize: 13, color: T.textMuted, marginBottom: 20 }}>{error}</p>
//     <button onClick={onRetry} style={{
//       display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px',
//       borderRadius: 8, border: 'none', background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
//       color: T.navyDark, fontSize: 13, fontWeight: 600, cursor: 'pointer',
//     }}><RotateCcw size={15} /> Retry</button>
//   </div>
// );

// // ════════════════════════════════════════════════════════
// //  MAIN COMPONENT
// // ════════════════════════════════════════════════════════
// const HeritageRequirementForm = () => {
//   // ✅ REDUX HOOKS
//   const {
//     data: apiData,
//     isLoading: loading,
//     isError,
//     error: fetchError,
//     refetch,
//   } = useGetHeritageProjectDataQuery();

//   const [submitRequirement, { isLoading: submitting }] =
//     useSubmitHeritageRequirementMutation();

//   // ✅ NEW - Project Lock Detection
//   const projectLockedName = sessionStorage.getItem('projectLockedName');
//   const isProjectLocked = !!projectLockedName;

//   // ✅ Form State
//   const [formData, setFormData] = useState({
//     projectName: '',
//     engineerName: '',
//     contractor: '',
//     remark: '',
//   });

//   const [items, setItems] = useState([{
//     materialType: '', materialName: '', materialSize: '',
//     specification: '', skuCode: '',
//     quantity: '', unit: '', description: '', reqDays: '',
//   }]);

//   const uv = apiData?.uniqueValues || {};
//   const maps = apiData?.maps || {};

//   // ✅ NEW - Auto-lock project for project-locked users
//   useEffect(() => {
//     if (isProjectLocked && projectLockedName && apiData) {
//       const engineer = maps.projectToEngineer?.[projectLockedName.toLowerCase()] || '';
//       setFormData(prev => ({
//         ...prev,
//         projectName: projectLockedName,
//         engineerName: engineer,
//       }));
//     }
//   }, [isProjectLocked, projectLockedName, apiData]);

//   const handleProjectChange = (val) => {
//     const engineer = maps.projectToEngineer?.[val.toLowerCase()] || '';
//     setFormData(prev => ({
//       ...prev,
//       projectName: val,
//       engineerName: engineer,
//     }));
//   };

//   const handleItemChange = (index, field, value) => {
//     const updated = [...items];
//     updated[index][field] = value;

//     if (field === 'materialType') {
//       updated[index] = {
//         ...updated[index],
//         materialType: value,
//         materialName: '', materialSize: '',
//         specification: '', skuCode: '',
//       };
//     }

//     if (field === 'materialName') {
//       updated[index] = {
//         ...updated[index],
//         materialName: value,
//         materialSize: '',
//         specification: '',
//         skuCode: '',
//       };
//     }

//     if (field === 'materialSize') {
//       const nameKey = updated[index].materialName.toLowerCase();
//       const sizeKey = value.toLowerCase();
//       const comboKey = `${nameKey}|||${sizeKey}`;
//       updated[index].skuCode = maps.nameAndSizeToSKU?.[comboKey] || '';
//     }

//     setItems(updated);
//   };

//   const getSizesForName = (materialName) => {
//     if (!materialName) return [];
//     return maps.nameToSizes?.[materialName.toLowerCase()] || [];
//   };

//   const getSpecsForName = (materialName) => {
//     if (!materialName) return [];
//     return maps.nameToSpecs?.[materialName.toLowerCase()] || [];
//   };

//   const addItem = () => {
//     setItems([...items, {
//       materialType: '', materialName: '', materialSize: '',
//       specification: '', skuCode: '',
//       quantity: '', unit: '', description: '', reqDays: '',
//     }]);
//   };

//   const removeItem = (i) => {
//     if (items.length > 1) setItems(items.filter((_, idx) => idx !== i));
//   };

//   // ✅ Validation - Contractor aur Remark OPTIONAL
//   const isFormValid = useMemo(() => {
//     if (!formData.projectName.trim()) return false;
//     if (!formData.engineerName.trim()) return false;

//     for (const item of items) {
//       if (!item.materialType.trim()) return false;
//       if (!item.materialName.trim()) return false;
//       if (!item.materialSize.trim()) return false;
//       if (!item.specification.trim()) return false;
//       if (!item.skuCode.trim()) return false;
//       if (!item.quantity.toString().trim()) return false;
//       if (!item.unit.trim()) return false;
//       if (!item.description.trim()) return false;
//       if (item.reqDays === '' || item.reqDays === undefined || item.reqDays === null) return false;
//     }
//     return true;
//   }, [formData, items]);

//   // ─── SUBMIT ────────────────────────────────────────────
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!isFormValid) {
//       Swal.fire({
//         icon: 'warning',
//         title: 'Form Incomplete',
//         text: 'Please fill all required fields before submitting.',
//         confirmButtonColor: T.gold,
//         width: window.innerWidth < 500 ? '90%' : '450px',
//       });
//       return;
//     }

//     try {
//       const res = await submitRequirement({ ...formData, items }).unwrap();

//       await Swal.fire({
//         icon: 'success',
//         title: 'Submitted Successfully! 🎉',
//         html: `
//           <div style="text-align: left; padding: 12px 0;">
//             <div style="background: #f8fafc; padding: 12px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid ${T.gold};">
//               <p style="margin: 6px 0; font-size: 14px; color: #334155;">
//                 <strong>Req No:</strong>
//                 <span style="color: ${T.goldDark}; font-weight: 700; margin-left: 8px;">${res.reqNo}</span>
//               </p>
//               <p style="margin: 6px 0; font-size: 14px; color: #334155;">
//                 <strong>Total Items:</strong>
//                 <span style="color: ${T.success}; font-weight: 700; margin-left: 8px;">${res.itemCount}</span>
//               </p>
//             </div>
//             <p style="margin: 6px 0; font-size: 12px; color: #64748b; text-align: center;">
//               ${res.message}
//             </p>
//           </div>
//         `,
//         confirmButtonText: 'OK',
//         confirmButtonColor: T.gold,
//         timer: 5000,
//         timerProgressBar: true,
//         allowOutsideClick: false,
//         width: window.innerWidth < 500 ? '90%' : '450px',
//       });

//       resetForm();
//     } catch (err) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Submission Failed!',
//         text: err?.data?.error || "Something went wrong. Please try again.",
//         confirmButtonText: 'Try Again',
//         confirmButtonColor: T.danger,
//         width: window.innerWidth < 500 ? '90%' : '450px',
//       });
//     }
//   };

//   // ✅ UPDATED - Reset form (keep locked project)
//   const resetForm = () => {
//     setFormData({
//       projectName: isProjectLocked ? projectLockedName : '',
//       engineerName: isProjectLocked
//         ? (maps.projectToEngineer?.[projectLockedName.toLowerCase()] || '')
//         : '',
//       contractor: '',
//       remark: '',
//     });
//     setItems([{
//       materialType: '', materialName: '', materialSize: '',
//       specification: '', skuCode: '',
//       quantity: '', unit: '', description: '', reqDays: '',
//     }]);
//   };

//   // ✅ Loading State
//   if (loading) return <LoadingScreen />;

//   // ✅ Error State
//   if (isError) {
//     return (
//       <ErrorScreen
//         error={fetchError?.data?.error || "Failed to load data. Check your connection."}
//         onRetry={refetch}
//       />
//     );
//   }

//   // ✅ Progress Counter
//   const totalRequired = 2 + (items.length * 9);
//   const filledCount = (() => {
//     let count = 0;
//     if (formData.projectName.trim()) count++;
//     if (formData.engineerName.trim()) count++;
//     items.forEach(item => {
//       if (item.materialType.trim()) count++;
//       if (item.materialName.trim()) count++;
//       if (item.materialSize.trim()) count++;
//       if (item.specification.trim()) count++;
//       if (item.skuCode.trim()) count++;
//       if (item.quantity.toString().trim()) count++;
//       if (item.unit.trim()) count++;
//       if (item.description.trim()) count++;
//       if (item.reqDays !== '' && item.reqDays !== undefined && item.reqDays !== null) count++;
//     });
//     return count;
//   })();

//   return (
//     <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 8px' }}>

//       {/* ✅ Project Locked Banner */}
//       {isProjectLocked && (
//         <div style={{
//           background: `linear-gradient(135deg, ${T.gold}15, ${T.goldDark}25)`,
//           borderRadius: 10,
//           padding: '14px 18px',
//           marginBottom: 16,
//           border: `1.5px solid ${T.gold}50`,
//           display: 'flex',
//           alignItems: 'center',
//           gap: 12,
//         }}>
//           <div style={{
//             width: 40, height: 40, borderRadius: 10,
//             background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
//             display: 'flex', alignItems: 'center', justifyContent: 'center',
//             flexShrink: 0,
//           }}>
//             <Lock size={20} color={T.navyDark} />
//           </div>
//           <div style={{ flex: 1 }}>
//             <div style={{
//               fontSize: 13, fontWeight: 700, color: T.navyDark,
//               marginBottom: 2,
//             }}>
//               Project Locked
//             </div>
//             <div style={{
//               fontSize: 12, color: T.textLight,
//             }}>
//               You can only submit requirements for{' '}
//               <strong style={{ color: T.goldDark }}>{projectLockedName}</strong>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* SECTION 1: Project Info */}
//       <div style={S.card}>
//         <div style={S.sectionTitle}>
//           <div style={S.goldBar} /> Heritage Project Information
//         </div>
//         <div style={{
//           display: 'grid',
//           gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
//           gap: 14,
//         }}>
//           {/* ✅ CONDITIONAL - Locked or Searchable */}
//           {isProjectLocked ? (
//             <div>
//               <label style={S.label}>
//                 Project Name <span style={S.req}>*</span>
//                 <span style={{
//                   marginLeft: 8, fontSize: 10, color: T.gold,
//                   background: `${T.gold}15`, padding: '2px 8px',
//                   borderRadius: 10, fontWeight: 600,
//                   display: 'inline-flex', alignItems: 'center', gap: 3,
//                 }}>
//                   🔒 LOCKED
//                 </span>
//               </label>
//               <input
//                 type="text"
//                 value={formData.projectName}
//                 readOnly
//                 style={{
//                   ...S.inputReadonly,
//                   borderLeft: `3px solid ${T.gold}`,
//                   background: `${T.gold}08`,
//                   color: T.navy,
//                   fontWeight: 600,
//                   cursor: 'not-allowed',
//                 }}
//               />
//             </div>
//           ) : (
//             <SearchableSelect
//               label="Project Name" required
//               value={formData.projectName}
//               onChange={handleProjectChange}
//               options={uv.projectNames || []}
//               placeholder="Search or select project..."
//             />
//           )}

//           <div>
//             <label style={S.label}>
//               Engineer Name <span style={S.req}>*</span>
//               {formData.engineerName && (
//                 <span style={{
//                   marginLeft: 8, fontSize: 10, color: T.success,
//                   background: T.successBg, padding: '2px 8px',
//                   borderRadius: 10, fontWeight: 500,
//                 }}>Auto-filled</span>
//               )}
//             </label>
//             <input
//               type="text"
//               value={formData.engineerName}
//               readOnly
//               style={{
//                 ...S.inputReadonly,
//                 borderLeft: formData.engineerName
//                   ? `3px solid ${T.success}`
//                   : `3px solid ${T.danger}`,
//               }}
//               placeholder="Select project to auto-fill"
//             />
//           </div>
//         </div>
//       </div>

//       {/* SECTION 2: Material Items */}
//       <div style={S.card}>
//         <div style={S.sectionTitle}>
//           <div style={S.goldBar} /> Material Items
//           <span style={{
//             marginLeft: 'auto', fontSize: 11, fontWeight: 500,
//             color: T.textMuted, background: T.borderLight,
//             padding: '3px 10px', borderRadius: 20,
//             whiteSpace: 'nowrap',
//           }}>
//             {items.length} item{items.length > 1 ? 's' : ''}
//           </span>
//         </div>

//         {items.map((item, idx) => {
//           const typeKey = (item.materialType || '').trim().toLowerCase();
//           const matNames = maps.typeToNames?.[typeKey] || [];
//           const sizes = getSizesForName(item.materialName);
//           const specs = getSpecsForName(item.materialName);

//           return (
//             <div key={idx} style={{
//               border: `1px solid ${T.border}`, borderRadius: 10,
//               padding: 'clamp(12px, 2.5vw, 18px)',
//               marginBottom: 12, background: T.bg,
//             }}>

//               <div style={{
//                 display: 'flex', justifyContent: 'space-between',
//                 alignItems: 'center', marginBottom: 14,
//                 flexWrap: 'wrap', gap: 8,
//               }}>
//                 <span style={{
//                   fontSize: 13, fontWeight: 600, color: T.navy,
//                   display: 'flex', alignItems: 'center', gap: 6,
//                 }}>
//                   <span style={{
//                     width: 24, height: 24, borderRadius: 6,
//                     background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
//                     display: 'flex', alignItems: 'center', justifyContent: 'center',
//                     fontSize: 12, fontWeight: 700, color: T.navyDark,
//                   }}>{idx + 1}</span>
//                   Item {idx + 1}
//                 </span>
//                 {items.length > 1 && (
//                   <button onClick={() => removeItem(idx)} style={{
//                     display: 'flex', alignItems: 'center', gap: 4,
//                     padding: '6px 12px', borderRadius: 6,
//                     border: `1px solid ${T.dangerBorder}`, background: T.dangerBg,
//                     color: T.danger, fontSize: 12, fontWeight: 500, cursor: 'pointer',
//                   }}><Trash2 size={13} /> Remove</button>
//                 )}
//               </div>

//               {/* Row 1 */}
//               <div style={{
//                 display: 'grid',
//                 gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
//                 gap: 12, marginBottom: 12,
//               }}>
//                 <SearchableSelect
//                   label="Material Type" required
//                   value={item.materialType}
//                   onChange={(val) => handleItemChange(idx, 'materialType', val)}
//                   options={uv.materialTypes || []}
//                   placeholder="Select Type"
//                 />

//                 <SearchableSelect
//                   label="Material Name" required
//                   value={item.materialName}
//                   onChange={(val) => handleItemChange(idx, 'materialName', val)}
//                   options={matNames}
//                   placeholder={typeKey ? "Select Material" : "Select type first"}
//                   disabled={!typeKey}
//                 />

//                 <SearchableSelect
//                   label="Material Size" required
//                   value={item.materialSize}
//                   onChange={(val) => handleItemChange(idx, 'materialSize', val)}
//                   options={sizes}
//                   placeholder={
//                     item.materialName
//                       ? `Select Size (${sizes.length})`
//                       : "Select material first"
//                   }
//                   disabled={!item.materialName || sizes.length === 0}
//                 />
//               </div>

//               {/* Row 2 */}
//               <div style={{
//                 display: 'grid',
//                 gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
//                 gap: 12, marginBottom: 12,
//               }}>
//                 <SearchableSelect
//                   label="Specification" required
//                   value={item.specification}
//                   onChange={(val) => handleItemChange(idx, 'specification', val)}
//                   options={specs}
//                   placeholder={
//                     item.materialName
//                       ? specs.length > 0
//                         ? `Select Spec (${specs.length})`
//                         : "No specs available"
//                       : "Select material name first"
//                   }
//                   disabled={!item.materialName || specs.length === 0}
//                 />

//                 <div>
//                   <label style={S.label}>
//                     SKU Code <span style={S.req}>*</span>
//                     {item.skuCode && (
//                       <span style={{
//                         marginLeft: 8, fontSize: 10, color: T.success,
//                         background: T.successBg, padding: '2px 8px',
//                         borderRadius: 10, fontWeight: 500,
//                       }}>Auto-filled</span>
//                     )}
//                   </label>
//                   <input
//                     type="text"
//                     readOnly
//                     value={item.skuCode}
//                     style={{
//                       ...S.inputReadonly,
//                       borderLeft: item.skuCode
//                         ? `3px solid ${T.success}`
//                         : `3px solid ${T.danger}`,
//                     }}
//                     placeholder="Auto-filled from Name + Size"
//                   />
//                 </div>
//               </div>

//               {/* Row 3 */}
//               <div style={{
//                 display: 'grid',
//                 gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
//                 gap: 12,
//               }}>
//                 <div>
//                   <label style={S.label}>
//                     Quantity <span style={S.req}>*</span>
//                   </label>
//                   <input
//                     type="number" min="1"
//                     value={item.quantity}
//                     onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
//                     style={S.input}
//                     placeholder="Enter qty"
//                     onFocus={focusStyle} onBlur={blurStyle}
//                   />
//                 </div>

//                 <SearchableSelect
//                   label="Unit Name" required
//                   value={item.unit}
//                   onChange={(val) => handleItemChange(idx, 'unit', val)}
//                   options={uv.unitNames || []}
//                   placeholder="Select Unit"
//                 />

//                 <div>
//                   <label style={S.label}>
//                     Require Days <span style={S.req}>*</span>
//                   </label>
//                   <div style={{ position: 'relative' }}>
//                     <select
//                       value={item.reqDays}
//                       onChange={(e) => handleItemChange(idx, 'reqDays', e.target.value)}
//                       style={S.select}
//                       onFocus={focusStyle} onBlur={blurStyle}
//                     >
//                       <option value="">Select Days</option>
//                       {[...Array(11)].map((_, i) => (
//                         <option key={i} value={i}>
//                           {i === 0 ? "0 - Urgent" : `${i} Day${i > 1 ? 's' : ''}`}
//                         </option>
//                       ))}
//                     </select>
//                     <ChevronDown size={14} style={{
//                       position: 'absolute', right: 10, top: '50%',
//                       transform: 'translateY(-50%)',
//                       color: T.textMuted, pointerEvents: 'none',
//                     }} />
//                   </div>
//                 </div>

//                 <div>
//                   <label style={S.label}>
//                     Description of Work <span style={S.req}>*</span>
//                   </label>
//                   <input
//                     type="text"
//                     value={item.description}
//                     onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
//                     style={S.input}
//                     placeholder="Enter description"
//                     onFocus={focusStyle} onBlur={blurStyle}
//                   />
//                 </div>
//               </div>

//               {idx === items.length - 1 && (
//                 <button onClick={addItem} style={{
//                   display: 'flex', alignItems: 'center', gap: 6,
//                   marginTop: 14, padding: '8px 16px', borderRadius: 8,
//                   border: `1.5px dashed ${T.gold}`, background: `${T.gold}08`,
//                   color: T.goldDark, fontSize: 13, fontWeight: 600, cursor: 'pointer',
//                 }}>
//                   <Plus size={15} /> Add Another Item
//                 </button>
//               )}
//             </div>
//           );
//         })}
//       </div>

//       {/* SECTION 3: Contractor + Remark (BOTH OPTIONAL) */}
//       <div style={S.card}>
//         <div style={S.sectionTitle}>
//           <div style={S.goldBar} /> Additional Information
//           <span style={{
//             marginLeft: 'auto', fontSize: 11, fontWeight: 500,
//             color: T.textMuted, background: T.borderLight,
//             padding: '3px 10px', borderRadius: 20,
//           }}>
//             Optional
//           </span>
//         </div>
//         <div style={{
//           display: 'grid',
//           gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
//           gap: 14,
//         }}>
//           <div>
//             <label style={S.label}>
//               Contractor / Firm Name
//               <span style={{
//                 marginLeft: 8, fontSize: 10, color: T.textMuted,
//                 background: T.borderLight, padding: '2px 8px',
//                 borderRadius: 10, fontWeight: 500,
//               }}>Optional</span>
//             </label>
//             <input
//               type="text"
//               value={formData.contractor}
//               onChange={(e) => setFormData(prev => ({ ...prev, contractor: e.target.value }))}
//               style={S.input}
//               placeholder="Enter contractor / firm name (optional)"
//               onFocus={focusStyle} onBlur={blurStyle}
//             />
//           </div>

//           <div>
//             <label style={S.label}>
//               Remark
//               <span style={{
//                 marginLeft: 8, fontSize: 10, color: T.textMuted,
//                 background: T.borderLight, padding: '2px 8px',
//                 borderRadius: 10, fontWeight: 500,
//               }}>Optional</span>
//             </label>
//             <input
//               type="text"
//               value={formData.remark}
//               onChange={(e) => setFormData(prev => ({ ...prev, remark: e.target.value }))}
//               style={S.input}
//               placeholder="Enter remark (optional)"
//               onFocus={focusStyle} onBlur={blurStyle}
//             />
//           </div>
//         </div>
//       </div>

//       {/* SECTION 4: Actions */}
//       <div style={{
//         ...S.card,
//         display: 'flex', alignItems: 'center',
//         justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
//       }}>
//         {!isFormValid ? (
//           <div style={{ margin: 0, flex: '1 1 200px' }}>
//             <p style={{
//               fontSize: 12, color: T.danger,
//               display: 'flex', alignItems: 'center', gap: 4, margin: 0,
//             }}>
//               <AlertCircle size={14} />
//               <span>Required ({filledCount}/{totalRequired})</span>
//             </p>
//             <div style={{
//               width: '100%', maxWidth: 200, height: 4, borderRadius: 4,
//               background: T.border, marginTop: 6, overflow: 'hidden',
//             }}>
//               <div style={{
//                 width: `${(filledCount / totalRequired) * 100}%`,
//                 height: '100%', borderRadius: 4,
//                 background: filledCount === totalRequired
//                   ? T.success
//                   : `linear-gradient(90deg, ${T.gold}, ${T.goldDark})`,
//                 transition: 'width 0.3s ease',
//               }} />
//             </div>
//           </div>
//         ) : (
//           <p style={{
//             fontSize: 12, color: T.success,
//             display: 'flex', alignItems: 'center', gap: 4, margin: 0,
//             flex: '1 1 200px',
//           }}>
//             <CheckCircle size={14} /> Ready to submit ✓
//           </p>
//         )}

//         <div style={{
//           display: 'flex', gap: 10,
//           flex: '0 1 auto', flexWrap: 'wrap',
//         }}>
//           <button onClick={resetForm} style={{
//             display: 'flex', alignItems: 'center', gap: 6,
//             padding: '10px 20px', borderRadius: 8,
//             border: `1.5px solid ${T.border}`, background: T.card,
//             color: T.textLight, fontSize: 13, fontWeight: 600, cursor: 'pointer',
//             flex: '1 1 auto', justifyContent: 'center',
//           }}>
//             <RotateCcw size={14} /> Reset
//           </button>

//           <button
//             onClick={handleSubmit}
//             disabled={!isFormValid || submitting}
//             style={{
//               display: 'flex', alignItems: 'center', gap: 6,
//               padding: '10px 24px', borderRadius: 8, border: 'none',
//               background: isFormValid && !submitting
//                 ? `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`
//                 : T.border,
//               color: isFormValid && !submitting ? T.navyDark : T.textMuted,
//               fontSize: 13, fontWeight: 700,
//               cursor: isFormValid && !submitting ? 'pointer' : 'not-allowed',
//               boxShadow: isFormValid && !submitting
//                 ? `0 2px 8px ${T.gold}40` : 'none',
//               flex: '1 1 auto', justifyContent: 'center',
//             }}
//           >
//             {submitting ? (
//               <><Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> Submitting...</>
//             ) : (
//               <><Send size={14} /> Submit Requirement</>
//             )}
//           </button>
//         </div>
//       </div>

//       <style>{`
//         @keyframes spin { to { transform: rotate(360deg); } }
//         @media (max-width: 640px) {
//           input, select, textarea {
//             font-size: 16px !important;
//           }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default HeritageRequirementForm;





import React, { useState, useMemo, useEffect } from "react";
import {
  Plus, Trash2, Send, RotateCcw, Loader2, AlertCircle,
  CheckCircle, ChevronDown, Search, Lock
} from "lucide-react";
import Swal from 'sweetalert2';

import {
  useGetHeritageProjectDataQuery,
  useSubmitHeritageRequirementMutation,
} from '../../redux/heritageRequirementSlice';

// ─── THEME ───────────────────────────────────────────────
const T = {
  navy: '#1e293b', navyLight: '#334155', navyDark: '#0f172a',
  gold: '#f59e0b', goldLight: '#fbbf24', goldDark: '#d97706',
  bg: '#f8fafc', card: '#ffffff', text: '#1e293b',
  textLight: '#64748b', textMuted: '#94a3b8',
  border: '#e2e8f0', borderLight: '#f1f5f9',
  success: '#10b981', successBg: '#ecfdf5', successBorder: '#a7f3d0',
  danger: '#ef4444', dangerBg: '#fef2f2', dangerBorder: '#fecaca',
  warningBg: '#fffbeb', warningBorder: '#fde68a', warningText: '#92400e',
};

const S = {
  label: { display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6, letterSpacing: 0.3 },
  req: { color: T.danger, marginLeft: 2 },
  input: {
    width: '100%', padding: '10px 12px', fontSize: 13,
    border: `1.5px solid ${T.border}`, borderRadius: 8,
    outline: 'none', color: T.text, background: T.borderLight,
    transition: 'all 0.2s', boxSizing: 'border-box',
  },
  inputReadonly: {
    width: '100%', padding: '10px 12px', fontSize: 13,
    border: `1.5px solid ${T.border}`, borderRadius: 8,
    color: T.textLight, background: '#eef2f7',
    boxSizing: 'border-box', cursor: 'default', fontWeight: 500,
  },
  select: {
    width: '100%', padding: '10px 12px', fontSize: 13,
    border: `1.5px solid ${T.border}`, borderRadius: 8,
    outline: 'none', color: T.text, background: T.borderLight,
    transition: 'all 0.2s', boxSizing: 'border-box',
    cursor: 'pointer', appearance: 'none',
  },
  sectionTitle: {
    fontSize: 15, fontWeight: 700, color: T.navy,
    marginBottom: 16, paddingBottom: 10,
    borderBottom: `2px solid ${T.border}`,
    display: 'flex', alignItems: 'center', gap: 8,
    flexWrap: 'wrap',
  },
  goldBar: { width: 3, height: 18, background: T.gold, borderRadius: 3, flexShrink: 0 },
  card: {
    background: T.card, borderRadius: 10,
    border: `1px solid ${T.border}`,
    padding: 'clamp(14px, 3vw, 22px)',
    marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
  },
};

const focusStyle = (e) => {
  e.target.style.borderColor = T.gold;
  e.target.style.boxShadow = `0 0 0 3px ${T.gold}15`;
  e.target.style.background = T.card;
};
const blurStyle = (e) => {
  e.target.style.borderColor = T.border;
  e.target.style.boxShadow = 'none';
  e.target.style.background = T.borderLight;
};

// ─── SEARCHABLE SELECT ───────────────────────────────────
const SearchableSelect = ({ value, onChange, options, placeholder, required, label, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const filtered = options.filter(opt => opt.toLowerCase().includes(search.toLowerCase()));
  const MAX = 100;
  const display = search ? filtered : filtered.slice(0, MAX);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <label style={S.label}>
        {label} {required && <span style={S.req}>*</span>}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={isOpen ? search : value || ""}
          onChange={(e) => { setSearch(e.target.value); setIsOpen(true); }}
          onFocus={() => { setIsOpen(true); setSearch(""); }}
          onBlur={() => setTimeout(() => { setIsOpen(false); setSearch(""); }, 200)}
          disabled={disabled}
          placeholder={placeholder}
          style={{
            ...S.input, paddingRight: 32,
            ...(disabled ? { background: '#f1f5f9', cursor: 'not-allowed', opacity: 0.7 } : {}),
          }}
          onFocusCapture={(e) => { if (!disabled) focusStyle(e); }}
          onBlurCapture={(e) => {
            e.target.style.borderColor = T.border;
            e.target.style.boxShadow = 'none';
            e.target.style.background = disabled ? '#f1f5f9' : T.borderLight;
          }}
        />
        <Search size={14} style={{
          position: 'absolute', right: 10, top: '50%',
          transform: 'translateY(-50%)', color: T.textMuted, pointerEvents: 'none',
        }} />
      </div>
      {isOpen && !disabled && (
        <ul style={{
          position: 'absolute', zIndex: 50, width: '100%',
          background: 'white', border: `1px solid ${T.border}`,
          borderRadius: 8, marginTop: 4, maxHeight: 220,
          overflowY: 'auto', boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
          padding: 0, listStyle: 'none',
        }}>
          {display.length > 0 ? display.map((opt, idx) => (
            <li key={idx}
              onMouseDown={(e) => { e.preventDefault(); onChange(opt); setSearch(""); setIsOpen(false); }}
              style={{
                padding: '9px 14px', fontSize: 13, color: T.text,
                cursor: 'pointer', transition: 'background 0.1s',
                borderBottom: idx < display.length - 1 ? `1px solid ${T.borderLight}` : 'none',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = `${T.gold}10`; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >{opt}</li>
          )) : (
            <li style={{ padding: '12px 14px', color: T.textMuted, fontSize: 13, fontStyle: 'italic' }}>
              No matching options
            </li>
          )}
          {!search && filtered.length > MAX && (
            <li style={{ padding: '8px', fontSize: 11, color: T.textMuted, textAlign: 'center', borderTop: `1px solid ${T.border}` }}>
              Type to see {filtered.length - MAX} more...
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

// ─── LOADING ─────────────────────────────────────────────
const LoadingScreen = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px' }}>
    <div style={{
      width: 56, height: 56, borderRadius: 14,
      background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: 20, boxShadow: `0 0 0 3px ${T.gold}30`,
    }}>
      <Loader2 size={28} color={T.gold} style={{ animation: 'spin 1s linear infinite' }} />
    </div>
    <p style={{ fontSize: 15, fontWeight: 600, color: T.navy, marginBottom: 4 }}>Loading Data...</p>
    <p style={{ fontSize: 13, color: T.textMuted }}>Fetching options from server</p>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const ErrorScreen = ({ error, onRetry }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', textAlign: 'center' }}>
    <div style={{ width: 56, height: 56, borderRadius: '50%', background: T.dangerBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
      <AlertCircle size={28} color={T.danger} />
    </div>
    <p style={{ fontSize: 15, fontWeight: 600, color: T.navy, marginBottom: 6 }}>Failed to Load Data</p>
    <p style={{ fontSize: 13, color: T.textMuted, marginBottom: 20 }}>{error}</p>
    <button onClick={onRetry} style={{
      display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px',
      borderRadius: 8, border: 'none', background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
      color: T.navyDark, fontSize: 13, fontWeight: 600, cursor: 'pointer',
    }}><RotateCcw size={15} /> Retry</button>
  </div>
);

// ════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ════════════════════════════════════════════════════════
const HeritageRequirementForm = () => {
  const {
    data: apiData,
    isLoading: loading,
    isError,
    error: fetchError,
    refetch,
  } = useGetHeritageProjectDataQuery();

  const [submitRequirement, { isLoading: submitting }] =
    useSubmitHeritageRequirementMutation();

  const projectLockedName = sessionStorage.getItem('projectLockedName');
  const isProjectLocked = !!projectLockedName;

  const [formData, setFormData] = useState({
    projectName: '',
    engineerName: '',
    contractor: '',
    remark: '',
  });

  const [items, setItems] = useState([{
    materialType: '', materialName: '', materialSize: '',
    specification: '', skuCode: '',
    quantity: '', unit: '', description: '', reqDays: '',
  }]);

  const uv = apiData?.uniqueValues || {};
  const maps = apiData?.maps || {};

  // ✅ Get engineers list for current project
  const availableEngineers = useMemo(() => {
    if (!formData.projectName) return [];
    return maps.projectToEngineers?.[formData.projectName.toLowerCase()] || [];
  }, [formData.projectName, maps.projectToEngineers]);

  // ✅ Auto-lock project for project-locked users (but DON'T auto-select engineer)
  useEffect(() => {
    if (isProjectLocked && projectLockedName && apiData) {
      setFormData(prev => ({
        ...prev,
        projectName: projectLockedName,
        // ✅ Engineer NOT auto-filled - user chooses from dropdown
      }));
    }
  }, [isProjectLocked, projectLockedName, apiData]);

  // ✅ Project change - clear engineer (user must select from dropdown)
  const handleProjectChange = (val) => {
    setFormData(prev => ({
      ...prev,
      projectName: val,
      engineerName: '', // ✅ Clear engineer when project changes
    }));
  };

  // ✅ Engineer change
  const handleEngineerChange = (val) => {
    setFormData(prev => ({
      ...prev,
      engineerName: val,
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;

    if (field === 'materialType') {
      updated[index] = {
        ...updated[index],
        materialType: value,
        materialName: '', materialSize: '',
        specification: '', skuCode: '',
      };
    }

    if (field === 'materialName') {
      updated[index] = {
        ...updated[index],
        materialName: value,
        materialSize: '',
        specification: '',
        skuCode: '',
      };
    }

    if (field === 'materialSize') {
      const nameKey = updated[index].materialName.toLowerCase();
      const sizeKey = value.toLowerCase();
      const comboKey = `${nameKey}|||${sizeKey}`;
      updated[index].skuCode = maps.nameAndSizeToSKU?.[comboKey] || '';
    }

    setItems(updated);
  };

  const getSizesForName = (materialName) => {
    if (!materialName) return [];
    return maps.nameToSizes?.[materialName.toLowerCase()] || [];
  };

  const getSpecsForName = (materialName) => {
    if (!materialName) return [];
    return maps.nameToSpecs?.[materialName.toLowerCase()] || [];
  };

  const addItem = () => {
    setItems([...items, {
      materialType: '', materialName: '', materialSize: '',
      specification: '', skuCode: '',
      quantity: '', unit: '', description: '', reqDays: '',
    }]);
  };

  const removeItem = (i) => {
    if (items.length > 1) setItems(items.filter((_, idx) => idx !== i));
  };

  const isFormValid = useMemo(() => {
    if (!formData.projectName.trim()) return false;
    if (!formData.engineerName.trim()) return false;

    for (const item of items) {
      if (!item.materialType.trim()) return false;
      if (!item.materialName.trim()) return false;
      if (!item.materialSize.trim()) return false;
      if (!item.specification.trim()) return false;
      if (!item.skuCode.trim()) return false;
      if (!item.quantity.toString().trim()) return false;
      if (!item.unit.trim()) return false;
      if (!item.description.trim()) return false;
      if (item.reqDays === '' || item.reqDays === undefined || item.reqDays === null) return false;
    }
    return true;
  }, [formData, items]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) {
      Swal.fire({
        icon: 'warning',
        title: 'Form Incomplete',
        text: 'Please fill all required fields before submitting.',
        confirmButtonColor: T.gold,
        width: window.innerWidth < 500 ? '90%' : '450px',
      });
      return;
    }

    try {
      const res = await submitRequirement({ ...formData, items }).unwrap();

      await Swal.fire({
        icon: 'success',
        title: 'Submitted Successfully! 🎉',
        html: `
          <div style="text-align: left; padding: 12px 0;">
            <div style="background: #f8fafc; padding: 12px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid ${T.gold};">
              <p style="margin: 6px 0; font-size: 14px; color: #334155;">
                <strong>Req No:</strong>
                <span style="color: ${T.goldDark}; font-weight: 700; margin-left: 8px;">${res.reqNo}</span>
              </p>
              <p style="margin: 6px 0; font-size: 14px; color: #334155;">
                <strong>Total Items:</strong>
                <span style="color: ${T.success}; font-weight: 700; margin-left: 8px;">${res.itemCount}</span>
              </p>
            </div>
            <p style="margin: 6px 0; font-size: 12px; color: #64748b; text-align: center;">
              ${res.message}
            </p>
          </div>
        `,
        confirmButtonText: 'OK',
        confirmButtonColor: T.gold,
        timer: 5000,
        timerProgressBar: true,
        allowOutsideClick: false,
        width: window.innerWidth < 500 ? '90%' : '450px',
      });

      resetForm();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed!',
        text: err?.data?.error || "Something went wrong. Please try again.",
        confirmButtonText: 'Try Again',
        confirmButtonColor: T.danger,
        width: window.innerWidth < 500 ? '90%' : '450px',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      projectName: isProjectLocked ? projectLockedName : '',
      engineerName: '', // ✅ Always clear engineer
      contractor: '',
      remark: '',
    });
    setItems([{
      materialType: '', materialName: '', materialSize: '',
      specification: '', skuCode: '',
      quantity: '', unit: '', description: '', reqDays: '',
    }]);
  };

  if (loading) return <LoadingScreen />;

  if (isError) {
    return (
      <ErrorScreen
        error={fetchError?.data?.error || "Failed to load data. Check your connection."}
        onRetry={refetch}
      />
    );
  }

  const totalRequired = 2 + (items.length * 9);
  const filledCount = (() => {
    let count = 0;
    if (formData.projectName.trim()) count++;
    if (formData.engineerName.trim()) count++;
    items.forEach(item => {
      if (item.materialType.trim()) count++;
      if (item.materialName.trim()) count++;
      if (item.materialSize.trim()) count++;
      if (item.specification.trim()) count++;
      if (item.skuCode.trim()) count++;
      if (item.quantity.toString().trim()) count++;
      if (item.unit.trim()) count++;
      if (item.description.trim()) count++;
      if (item.reqDays !== '' && item.reqDays !== undefined && item.reqDays !== null) count++;
    });
    return count;
  })();

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 8px' }}>

      {/* Project Locked Banner */}
      {isProjectLocked && (
        <div style={{
          background: `linear-gradient(135deg, ${T.gold}15, ${T.goldDark}25)`,
          borderRadius: 10,
          padding: '14px 18px',
          marginBottom: 16,
          border: `1.5px solid ${T.gold}50`,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Lock size={20} color={T.navyDark} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 13, fontWeight: 700, color: T.navyDark,
              marginBottom: 2,
            }}>
              Project Locked
            </div>
            <div style={{
              fontSize: 12, color: T.textLight,
            }}>
              You can only submit requirements for{' '}
              <strong style={{ color: T.goldDark }}>{projectLockedName}</strong>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 1: Project Info */}
      <div style={S.card}>
        <div style={S.sectionTitle}>
          <div style={S.goldBar} /> 
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 14,
        }}>
          {/* Project Name - Locked or Searchable */}
          {isProjectLocked ? (
            <div>
              <label style={S.label}>
                Project Name <span style={S.req}>*</span>
                <span style={{
                  marginLeft: 8, fontSize: 10, color: T.gold,
                  background: `${T.gold}15`, padding: '2px 8px',
                  borderRadius: 10, fontWeight: 600,
                  display: 'inline-flex', alignItems: 'center', gap: 3,
                }}>
                  🔒 LOCKED
                </span>
              </label>
              <input
                type="text"
                value={formData.projectName}
                readOnly
                style={{
                  ...S.inputReadonly,
                  borderLeft: `3px solid ${T.gold}`,
                  background: `${T.gold}08`,
                  color: T.navy,
                  fontWeight: 600,
                  cursor: 'not-allowed',
                }}
              />
            </div>
          ) : (
            <SearchableSelect
              label="Project Name" required
              value={formData.projectName}
              onChange={handleProjectChange}
              options={uv.projectNames || []}
              placeholder="Search or select project..."
            />
          )}

          {/* ✅ Engineer Name - DROPDOWN (multiple engineers per project) */}
          <div>
            <label style={S.label}>
              Engineer Name <span style={S.req}>*</span>
              {formData.projectName && availableEngineers.length > 0 && (
                <span style={{
                  marginLeft: 8, fontSize: 10, color: T.success,
                  background: T.successBg, padding: '2px 8px',
                  borderRadius: 10, fontWeight: 500,
                }}>
                  {availableEngineers.length} available
                </span>
              )}
            </label>
            <SearchableSelect
              value={formData.engineerName}
              onChange={handleEngineerChange}
              options={availableEngineers}
              placeholder={
                !formData.projectName
                  ? "Select project first"
                  : availableEngineers.length === 0
                    ? "No engineers found for this project"
                    : `Select from ${availableEngineers.length} engineer(s)...`
              }
              disabled={!formData.projectName || availableEngineers.length === 0}
              label=""
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: Material Items */}
      <div style={S.card}>
        <div style={S.sectionTitle}>
          <div style={S.goldBar} /> Material Items
          <span style={{
            marginLeft: 'auto', fontSize: 11, fontWeight: 500,
            color: T.textMuted, background: T.borderLight,
            padding: '3px 10px', borderRadius: 20,
            whiteSpace: 'nowrap',
          }}>
            {items.length} item{items.length > 1 ? 's' : ''}
          </span>
        </div>

        {items.map((item, idx) => {
          const typeKey = (item.materialType || '').trim().toLowerCase();
          const matNames = maps.typeToNames?.[typeKey] || [];
          const sizes = getSizesForName(item.materialName);
          const specs = getSpecsForName(item.materialName);

          return (
            <div key={idx} style={{
              border: `1px solid ${T.border}`, borderRadius: 10,
              padding: 'clamp(12px, 2.5vw, 18px)',
              marginBottom: 12, background: T.bg,
            }}>

              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: 14,
                flexWrap: 'wrap', gap: 8,
              }}>
                <span style={{
                  fontSize: 13, fontWeight: 600, color: T.navy,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <span style={{
                    width: 24, height: 24, borderRadius: 6,
                    background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, color: T.navyDark,
                  }}>{idx + 1}</span>
                  Item {idx + 1}
                </span>
                {items.length > 1 && (
                  <button onClick={() => removeItem(idx)} style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '6px 12px', borderRadius: 6,
                    border: `1px solid ${T.dangerBorder}`, background: T.dangerBg,
                    color: T.danger, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                  }}><Trash2 size={13} /> Remove</button>
                )}
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 12, marginBottom: 12,
              }}>
                <SearchableSelect
                  label="Material Type" required
                  value={item.materialType}
                  onChange={(val) => handleItemChange(idx, 'materialType', val)}
                  options={uv.materialTypes || []}
                  placeholder="Select Type"
                />

                <SearchableSelect
                  label="Material Name" required
                  value={item.materialName}
                  onChange={(val) => handleItemChange(idx, 'materialName', val)}
                  options={matNames}
                  placeholder={typeKey ? "Select Material" : "Select type first"}
                  disabled={!typeKey}
                />

                <SearchableSelect
                  label="Material Size" required
                  value={item.materialSize}
                  onChange={(val) => handleItemChange(idx, 'materialSize', val)}
                  options={sizes}
                  placeholder={
                    item.materialName
                      ? `Select Size (${sizes.length})`
                      : "Select material first"
                  }
                  disabled={!item.materialName || sizes.length === 0}
                />
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 12, marginBottom: 12,
              }}>
                <SearchableSelect
                  label="Specification" required
                  value={item.specification}
                  onChange={(val) => handleItemChange(idx, 'specification', val)}
                  options={specs}
                  placeholder={
                    item.materialName
                      ? specs.length > 0
                        ? `Select Spec (${specs.length})`
                        : "No specs available"
                      : "Select material name first"
                  }
                  disabled={!item.materialName || specs.length === 0}
                />

                <div>
                  <label style={S.label}>
                    SKU Code <span style={S.req}>*</span>
                    {item.skuCode && (
                      <span style={{
                        marginLeft: 8, fontSize: 10, color: T.success,
                        background: T.successBg, padding: '2px 8px',
                        borderRadius: 10, fontWeight: 500,
                      }}>Auto-filled</span>
                    )}
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={item.skuCode}
                    style={{
                      ...S.inputReadonly,
                      borderLeft: item.skuCode
                        ? `3px solid ${T.success}`
                        : `3px solid ${T.danger}`,
                    }}
                    placeholder="Auto-filled from Name + Size"
                  />
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 12,
              }}>
                <div>
                  <label style={S.label}>
                    Quantity <span style={S.req}>*</span>
                  </label>
                  <input
                    type="number" min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                    style={S.input}
                    placeholder="Enter qty"
                    onFocus={focusStyle} onBlur={blurStyle}
                  />
                </div>

                <SearchableSelect
                  label="Unit Name" required
                  value={item.unit}
                  onChange={(val) => handleItemChange(idx, 'unit', val)}
                  options={uv.unitNames || []}
                  placeholder="Select Unit"
                />

                <div>
                  <label style={S.label}>
                    Require Days <span style={S.req}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={item.reqDays}
                      onChange={(e) => handleItemChange(idx, 'reqDays', e.target.value)}
                      style={S.select}
                      onFocus={focusStyle} onBlur={blurStyle}
                    >
                      <option value="">Select Days</option>
                      {[...Array(11)].map((_, i) => (
                        <option key={i} value={i}>
                          {i === 0 ? "0 - Urgent" : `${i} Day${i > 1 ? 's' : ''}`}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} style={{
                      position: 'absolute', right: 10, top: '50%',
                      transform: 'translateY(-50%)',
                      color: T.textMuted, pointerEvents: 'none',
                    }} />
                  </div>
                </div>

                <div>
                  <label style={S.label}>
                    Description of Work <span style={S.req}>*</span>
                  </label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                    style={S.input}
                    placeholder="Enter description"
                    onFocus={focusStyle} onBlur={blurStyle}
                  />
                </div>
              </div>

              {idx === items.length - 1 && (
                <button onClick={addItem} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  marginTop: 14, padding: '8px 16px', borderRadius: 8,
                  border: `1.5px dashed ${T.gold}`, background: `${T.gold}08`,
                  color: T.goldDark, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}>
                  <Plus size={15} /> Add Another Item
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* SECTION 3: Contractor + Remark (Optional) */}
      <div style={S.card}>
        <div style={S.sectionTitle}>
          <div style={S.goldBar} /> Additional Information
          <span style={{
            marginLeft: 'auto', fontSize: 11, fontWeight: 500,
            color: T.textMuted, background: T.borderLight,
            padding: '3px 10px', borderRadius: 20,
          }}>
            Optional
          </span>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 14,
        }}>
          <div>
            <label style={S.label}>
              Contractor / Firm Name
              <span style={{
                marginLeft: 8, fontSize: 10, color: T.textMuted,
                background: T.borderLight, padding: '2px 8px',
                borderRadius: 10, fontWeight: 500,
              }}>Optional</span>
            </label>
            <input
              type="text"
              value={formData.contractor}
              onChange={(e) => setFormData(prev => ({ ...prev, contractor: e.target.value }))}
              style={S.input}
              placeholder="Enter contractor / firm name (optional)"
              onFocus={focusStyle} onBlur={blurStyle}
            />
          </div>

          <div>
            <label style={S.label}>
              Remark
              <span style={{
                marginLeft: 8, fontSize: 10, color: T.textMuted,
                background: T.borderLight, padding: '2px 8px',
                borderRadius: 10, fontWeight: 500,
              }}>Optional</span>
            </label>
            <input
              type="text"
              value={formData.remark}
              onChange={(e) => setFormData(prev => ({ ...prev, remark: e.target.value }))}
              style={S.input}
              placeholder="Enter remark (optional)"
              onFocus={focusStyle} onBlur={blurStyle}
            />
          </div>
        </div>
      </div>

      {/* SECTION 4: Actions */}
      <div style={{
        ...S.card,
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
      }}>
        {!isFormValid ? (
          <div style={{ margin: 0, flex: '1 1 200px' }}>
            <p style={{
              fontSize: 12, color: T.danger,
              display: 'flex', alignItems: 'center', gap: 4, margin: 0,
            }}>
              <AlertCircle size={14} />
              <span>Required ({filledCount}/{totalRequired})</span>
            </p>
            <div style={{
              width: '100%', maxWidth: 200, height: 4, borderRadius: 4,
              background: T.border, marginTop: 6, overflow: 'hidden',
            }}>
              <div style={{
                width: `${(filledCount / totalRequired) * 100}%`,
                height: '100%', borderRadius: 4,
                background: filledCount === totalRequired
                  ? T.success
                  : `linear-gradient(90deg, ${T.gold}, ${T.goldDark})`,
                transition: 'width 0.3s ease',
              }} />
            </div>
          </div>
        ) : (
          <p style={{
            fontSize: 12, color: T.success,
            display: 'flex', alignItems: 'center', gap: 4, margin: 0,
            flex: '1 1 200px',
          }}>
            <CheckCircle size={14} /> Ready to submit ✓
          </p>
        )}

        <div style={{
          display: 'flex', gap: 10,
          flex: '0 1 auto', flexWrap: 'wrap',
        }}>
          <button onClick={resetForm} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '10px 20px', borderRadius: 8,
            border: `1.5px solid ${T.border}`, background: T.card,
            color: T.textLight, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            flex: '1 1 auto', justifyContent: 'center',
          }}>
            <RotateCcw size={14} /> Reset
          </button>

          <button
            onClick={handleSubmit}
            disabled={!isFormValid || submitting}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 24px', borderRadius: 8, border: 'none',
              background: isFormValid && !submitting
                ? `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`
                : T.border,
              color: isFormValid && !submitting ? T.navyDark : T.textMuted,
              fontSize: 13, fontWeight: 700,
              cursor: isFormValid && !submitting ? 'pointer' : 'not-allowed',
              boxShadow: isFormValid && !submitting
                ? `0 2px 8px ${T.gold}40` : 'none',
              flex: '1 1 auto', justifyContent: 'center',
            }}
          >
            {submitting ? (
              <><Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> Submitting...</>
            ) : (
              <><Send size={14} /> Submit Requirement</>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 640px) {
          input, select, textarea {
            font-size: 16px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default HeritageRequirementForm;