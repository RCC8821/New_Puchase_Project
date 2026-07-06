
// import React, { useState, useEffect, useRef, useMemo } from 'react';
// import {
//   useGetSitePaidStepQuery,
//   usePostSitePaidStepMutation,
// } from '../../redux/SiteExpenses/SiteExpensesSlice';
// import {
//   useGetProjectDropdownQuery,
// } from '../../redux/Labour/LabourSlice';
// import {
//   Loader2,
//   RefreshCw,
//   User,
//   Calendar,
//   FileText,
//   Building,
//   AlertCircle,
//   Search,
//   Filter,
//   X,
//   Wrench,
//   Clock,
//   Hash,
//   ChevronDown,
//   Building2,
//   HardHat,
//   MessageSquare,
//   CreditCard,
//   Banknote,
//   Receipt,
//   BadgeCheck,
//   CircleDollarSign,
//   CheckSquare,
//   Square,
//   ListChecks,
//   Check,
//   ChevronUp,
//   Percent,
//   Minus,
//   ArrowRight
// } from 'lucide-react';

// // ========== Helper Functions ==========
// const formatAmount = (value) => {
//   if (value == null || value === '') return '0';
//   const cleaned = String(value).replace(/[^0-9.-]/g, '');
//   const num = parseFloat(cleaned);
//   if (isNaN(num)) return '0';
//   return num.toLocaleString('en-IN', {
//     maximumFractionDigits: 2,
//     minimumFractionDigits: 0
//   });
// };

// const parseAmount = (value) => {
//   const cleaned = String(value || '0').replace(/[^0-9.-]/g, '');
//   return parseFloat(cleaned) || 0;
// };

// // ========== Searchable Dropdown Component ==========
// const SearchableDropdown = ({
//   label,
//   icon: Icon,
//   options = [],
//   value,
//   onChange,
//   placeholder,
//   color = 'emerald',
//   required = false
// }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const dropdownRef = useRef(null);

//   const filteredOptions = useMemo(() => {
//     return options.filter(option => {
//       if (typeof option !== 'string') return false;
//       return option.toLowerCase().includes(searchTerm.toLowerCase());
//     });
//   }, [options, searchTerm]);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setIsOpen(false);
//         setSearchTerm('');
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   const handleSelect = (option) => {
//     onChange(option);
//     setSearchTerm('');
//     setIsOpen(false);
//   };

//   const handleClear = (e) => {
//     e.stopPropagation();
//     onChange('');
//     setSearchTerm('');
//   };

//   const colorClasses = {
//     emerald: {
//       bg: 'bg-emerald-50', text: 'text-emerald-700',
//       hover: 'hover:bg-emerald-100', selected: 'bg-emerald-100 text-emerald-800',
//       ring: 'ring-emerald-200', border: 'border-emerald-500'
//     },
//     purple: {
//       bg: 'bg-purple-50', text: 'text-purple-700',
//       hover: 'hover:bg-purple-100', selected: 'bg-purple-100 text-purple-800',
//       ring: 'ring-purple-200', border: 'border-purple-500'
//     },
//     blue: {
//       bg: 'bg-blue-50', text: 'text-blue-700',
//       hover: 'hover:bg-blue-100', selected: 'bg-blue-100 text-blue-800',
//       ring: 'ring-blue-200', border: 'border-blue-500'
//     },
//     orange: {
//       bg: 'bg-orange-50', text: 'text-orange-700',
//       hover: 'hover:bg-orange-100', selected: 'bg-orange-100 text-orange-800',
//       ring: 'ring-orange-200', border: 'border-orange-500'
//     }
//   };

//   const colors = colorClasses[color] || colorClasses.emerald;

//   return (
//     <div ref={dropdownRef} className="relative">
//       {label && (
//         <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
//           {Icon && <Icon className="w-4 h-4" />}
//           {label}
//           {required && <span className="text-red-500">*</span>}
//         </label>
//       )}
//       <div
//         onClick={() => setIsOpen(!isOpen)}
//         className={`relative w-full px-4 py-3 border rounded-xl cursor-pointer transition-all ${
//           isOpen ? `${colors.border} ring-2 ${colors.ring}` : 'border-gray-300'
//         } ${value ? colors.bg : 'bg-white'}`}
//       >
//         <div className="flex items-center justify-between">
//           <div className="flex-1 flex items-center gap-2">
//             {value ? (
//               <span className={`font-medium ${colors.text}`}>{value}</span>
//             ) : (
//               <input
//                 type="text"
//                 value={searchTerm}
//                 onChange={(e) => { setSearchTerm(e.target.value); setIsOpen(true); }}
//                 onClick={(e) => { e.stopPropagation(); setIsOpen(true); }}
//                 placeholder={placeholder}
//                 className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400"
//               />
//             )}
//           </div>
//           <div className="flex items-center gap-2">
//             {value && (
//               <button onClick={handleClear} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
//                 <X className="w-4 h-4 text-gray-500" />
//               </button>
//             )}
//             {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
//           </div>
//         </div>
//       </div>

//       {isOpen && (
//         <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-hidden">
//           {value && (
//             <div className="p-2 border-b border-gray-100">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                 <input
//                   type="text"
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   placeholder="Type to search..."
//                   className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
//                   autoFocus
//                 />
//               </div>
//             </div>
//           )}
//           <div className="max-h-48 overflow-y-auto">
//             <button
//               onClick={() => handleSelect('')}
//               className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
//                 !value ? colors.selected : 'hover:bg-gray-50 text-gray-700'
//               }`}
//             >
//               -- Select --
//             </button>
//             {filteredOptions.length > 0 ? (
//               filteredOptions.map((option, index) => (
//                 <button
//                   key={`${option}-${index}`}
//                   onClick={() => handleSelect(option)}
//                   className={`w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center justify-between ${
//                     value === option ? colors.selected : `${colors.hover} text-gray-700`
//                   }`}
//                 >
//                   <span className="truncate">{option}</span>
//                   {value === option && <Check className="w-4 h-4 flex-shrink-0" />}
//                 </button>
//               ))
//             ) : (
//               <div className="px-4 py-3 text-sm text-gray-500 text-center">No results found</div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // ========== TDS Calculator Card ==========
// const TDSCalculatorCard = ({ totalAmount, tdsAmount, onTdsChange }) => {
//   const tds = parseAmount(tdsAmount);
//   const netAmount = totalAmount - tds;
//   const tdsPercentage = totalAmount > 0 ? ((tds / totalAmount) * 100).toFixed(2) : '0.00';

//   return (
//     <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 space-y-3">
//       <h4 className="text-sm font-bold text-amber-800 flex items-center gap-2">
//         <Percent className="w-4 h-4" />
//         TDS Deduction (Applied on Last Selected Record)
//       </h4>

//       {/* TDS Input */}
//       <div>
//         <label className="block text-xs font-semibold text-gray-600 mb-1">
//           TDS Amount (₹)
//         </label>
//         <div className="relative">
//           <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
//           <input
//             type="number"
//             min="0"
//             step="0.01"
//             value={tdsAmount}
//             onChange={(e) => onTdsChange(e.target.value)}
//             placeholder="Enter TDS amount..."
//             className="w-full pl-8 pr-4 py-2.5 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white text-gray-800 font-medium"
//           />
//         </div>
//       </div>

//       {/* Calculation Display */}
//       <div className="bg-white rounded-lg border border-amber-100 p-3 space-y-2">
//         {/* Total Paid Amount */}
//         <div className="flex items-center justify-between text-sm">
//           <span className="text-gray-500 flex items-center gap-1">
//             <CircleDollarSign className="w-3.5 h-3.5 text-emerald-500" />
//             Total Paid Amount
//           </span>
//           <span className="font-bold text-gray-800">₹{formatAmount(totalAmount)}</span>
//         </div>

//         {/* TDS Deduction */}
//         <div className="flex items-center justify-between text-sm">
//           <span className="text-gray-500 flex items-center gap-1">
//             <Minus className="w-3.5 h-3.5 text-red-500" />
//             TDS Deduction
//             {tds > 0 && (
//               <span className="ml-1 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium">
//                 {tdsPercentage}%
//               </span>
//             )}
//           </span>
//           <span className={`font-bold ${tds > 0 ? 'text-red-600' : 'text-gray-400'}`}>
//             - ₹{formatAmount(tds)}
//           </span>
//         </div>

//         {/* Divider */}
//         <div className="border-t border-dashed border-amber-200" />

//         {/* Net Amount */}
//         <div className="flex items-center justify-between">
//           <span className="text-sm font-bold text-gray-700 flex items-center gap-1">
//             <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
//             Net Payable Amount
//           </span>
//           <span className={`font-bold text-base ${netAmount >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
//             ₹{formatAmount(netAmount)}
//           </span>
//         </div>
//       </div>

//       {/* Warning if TDS > Total */}
//       {tds > totalAmount && (
//         <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
//           <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
//           <p className="text-xs text-red-600 font-medium">
//             TDS amount cannot exceed total paid amount!
//           </p>
//         </div>
//       )}

//       {/* Info */}
//       <p className="text-xs text-amber-700 bg-amber-100 rounded-lg px-3 py-2 flex items-start gap-1.5">
//         <span className="flex-shrink-0 mt-0.5">ℹ️</span>
//         <span>
//           TDS value will be written in <strong>column Z</strong> and Net Amount in{' '}
//           <strong>column AA</strong> of the <strong>last selected record</strong> only.
//         </span>
//       </p>
//     </div>
//   );
// };

// // ========== Main Component ==========
// const SitePaidAmount = () => {
//   const { data = [], isLoading, isError, refetch, isFetching } = useGetSitePaidStepQuery();
//   const [postSitePaidStep, { isLoading: isSubmitting }] = usePostSitePaidStepMutation();

//   const { data: bankList = [], isLoading: isBankLoading } = useGetProjectDropdownQuery();

//   const [searchTerm, setSearchTerm]           = useState('');
//   const [selectedProject, setSelectedProject] = useState('');
//   const [selectedRccBillNo, setSelectedRccBillNo] = useState('');
//   const [selectedItems, setSelectedItems]     = useState([]);
//   const [showModal, setShowModal]             = useState(false);

//   const [formData, setFormData] = useState({
//     STATUS_3:          '',
//     PAYMENT_MODE_3:    '',
//     BANK_DETAILS_3:    '',
//     PAYMENT_DETAILS_3: '',
//     PAYMENT_DATE_3:    new Date().toISOString().split('T')[0],
//     Receiver_Name:     '',
//     Remark:            '',
//     TDS_AMOUNT:        '',   // ✅ NEW
//   });

//   // ── Derived unique lists ────────────────────────────────────
//   const uniqueProjectNames = useMemo(() =>
//     [...new Set(data.map(i => i.projectName).filter(Boolean))].sort(), [data]);

//   const uniqueRccBillNos = useMemo(() =>
//     [...new Set(data.map(i => i.RccBillNo).filter(Boolean))].sort(), [data]);

//   const uniqueBankNames = useMemo(() => {
//     if (!bankList || !Array.isArray(bankList)) return [];
//     const names = bankList
//       .map(i => i.extraField || i.bankName || i.name || i.bank_name || '')
//       .filter(n => n && typeof n === 'string' && n.trim() !== '');
//     return [...new Set(names)].sort();
//   }, [bankList]);

//   const paymentModeOptions = [
//     { value: '',       label: '-- Select Payment Mode --' },
//     { value: 'NEFT',   label: '📱 NEFT' },
//     { value: 'RTGS',   label: '📋 RTGS' },
//     { value: 'Cheque', label: '📄 Cheque' },
//     { value: 'Cash',   label: '💵 Cash' },
//     { value: 'UPI',    label: '📲 UPI' },
//   ];

//   // ── Filtered data ───────────────────────────────────────────
//   const filteredData = useMemo(() => {
//     return data.filter(item => {
//       const sl = searchTerm.toLowerCase();
//       const matchesSearch =
//         (item.payeeName    || '').toLowerCase().includes(sl) ||
//         (item.uid          || '').toLowerCase().includes(sl) ||
//         (item.RccBillNo    || '').toLowerCase().includes(sl) ||
//         (item.ContractorName || '').toLowerCase().includes(sl) ||
//         (item.detailsOfWork || '').toLowerCase().includes(sl);

//       const matchesProject    = !selectedProject    || item.projectName === selectedProject;
//       const matchesRccBillNo  = !selectedRccBillNo  || item.RccBillNo   === selectedRccBillNo;

//       return matchesSearch && matchesProject && matchesRccBillNo;
//     });
//   }, [data, searchTerm, selectedProject, selectedRccBillNo]);

//   const clearAllFilters = () => {
//     setSearchTerm('');
//     setSelectedProject('');
//     setSelectedRccBillNo('');
//   };

//   const hasActiveFilters = searchTerm || selectedProject || selectedRccBillNo;

//   // ── Selection helpers ───────────────────────────────────────
//   const handleCardSelect = (item) => {
//     setSelectedItems(prev =>
//       prev.some(s => s.uid === item.uid)
//         ? prev.filter(s => s.uid !== item.uid)
//         : [...prev, item]
//     );
//   };

//   const handleSelectAll = () => {
//     setSelectedItems(
//       selectedItems.length === filteredData.length ? [] : [...filteredData]
//     );
//   };

//   // ── Amount helpers ──────────────────────────────────────────
//   const getTotalSelectedAmount = () =>
//     selectedItems.reduce((sum, item) => sum + parseAmount(item.costAmount), 0);

//   const tdsValue     = parseAmount(formData.TDS_AMOUNT);
//   const totalAmount  = getTotalSelectedAmount();
//   const netAmount    = totalAmount - tdsValue;
//   const isTdsInvalid = tdsValue > totalAmount;

//   // ── Modal open ──────────────────────────────────────────────
//   const handleBulkPayment = () => {
//     if (selectedItems.length === 0) return alert('Please select at least one record');
//     setFormData({
//       STATUS_3:          '',
//       PAYMENT_MODE_3:    '',
//       BANK_DETAILS_3:    '',
//       PAYMENT_DETAILS_3: '',
//       PAYMENT_DATE_3:    new Date().toISOString().split('T')[0],
//       Receiver_Name:     '',
//       Remark:            '',
//       TDS_AMOUNT:        '',
//     });
//     setShowModal(true);
//   };

//   const handleFormChange = (field, value) => {
//     setFormData(prev => ({ ...prev, [field]: value }));
//   };

//   // ── Submit ──────────────────────────────────────────────────
// const handleSubmit = async () => {
//   if (selectedItems.length === 0) return;
//   if (!formData.STATUS_3)          return alert('Please select Payment Status');
//   if (!formData.PAYMENT_MODE_3)    return alert('Please select Payment Mode');
//   if (!formData.BANK_DETAILS_3)    return alert('Please select Bank');
//   if (!formData.PAYMENT_DETAILS_3) return alert('Please enter Payment Details / Reference');
//   if (!formData.PAYMENT_DATE_3)    return alert('Please select Payment Date');
//   if (!formData.Receiver_Name)     return alert('Please enter Receiver Name');
//   if (isTdsInvalid)                return alert('TDS amount cannot exceed total paid amount!');

//   // ✅ UID bhejo - B column se match hoga
//   const records = selectedItems.map(item => ({
//     UID:        item.uid,
//     costAmount: parseAmount(item.costAmount),
//   }));

//   console.log("📤 Sending records:", records); // debug

//   const payload = {
//     records,
//     TDS_AMOUNT:        tdsValue || 0,
//     STATUS_3:          formData.STATUS_3,
//     PAYMENT_MODE_3:    formData.PAYMENT_MODE_3,
//     BANK_DETAILS_3:    formData.BANK_DETAILS_3,
//     PAYMENT_DETAILS_3: formData.PAYMENT_DETAILS_3,
//     PAYMENT_DATE_3:    formData.PAYMENT_DATE_3,
//     Receiver_Name:     formData.Receiver_Name,
//     Remark:            formData.Remark,
//   };

//   try {
//     const result = await postSitePaidStep(payload).unwrap();

//     if (result?.success) {
//       const msg =
//         `✅ Bulk Payment Successful!\n` +
//         `Records: ${result.totalRecords}\n` +
//         `Total Amount: ₹${formatAmount(totalAmount)}\n` +
//         `TDS Deducted: ₹${formatAmount(tdsValue)}\n` +
//         `Net Amount: ₹${formatAmount(netAmount)}`;
//       alert(msg);
//     } else {
//       alert(`⚠️ ${result?.message || 'Partial or unknown result'}`);
//     }
//   } catch (err) {
//     console.error(err);
//     alert(`❌ Failed: ${err?.data?.message || err?.message || 'Unknown error'}`);
//   }

//   setShowModal(false);
//   setSelectedItems([]);
//   refetch();
// };

//   // ── Loading / Error states ──────────────────────────────────
//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="text-center">
//           <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
//           <p className="text-gray-600 font-medium">Loading Payment Data...</p>
//         </div>
//       </div>
//     );
//   }

//   if (isError) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="text-center bg-red-50 p-6 rounded-xl border border-red-200">
//           <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
//           <p className="text-red-600 font-medium mb-2">Error Loading Data</p>
//           <button onClick={refetch} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 mx-auto">
//             <RefreshCw className="w-4 h-4" /> Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // ── Render ──────────────────────────────────────────────────
//   return (
//     <div className="space-y-6 p-4 bg-gray-50 min-h-screen">

//       {/* ── Header ── */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div>
//           <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
//             <CircleDollarSign className="w-7 h-7 text-emerald-600" />
//             Site Payment Processing
//           </h2>
//           <p className="text-gray-500 mt-1">Select multiple records and process bulk payments</p>
//         </div>
//         <button
//           onClick={refetch}
//           disabled={isFetching}
//           className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
//         >
//           <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
//           Refresh
//         </button>
//       </div>

//       {/* ── Selection Summary Bar ── */}
//       {selectedItems.length > 0 && (
//         <div className="sticky top-0 z-20 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-4 text-white shadow-lg">
//           <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
//             <div className="flex flex-wrap items-center gap-4">
//               <div className="flex items-center gap-2">
//                 <ListChecks className="w-6 h-6" />
//                 <span className="font-bold text-lg">{selectedItems.length} Selected</span>
//               </div>
//               <div className="hidden sm:block h-8 w-px bg-white/30" />
//               <div className="flex flex-wrap gap-3 text-sm">
//                 <div className="bg-white px-4 py-1.5 rounded-lg text-emerald-600">
//                   <span className="font-medium">💰 Total:</span>
//                   <span className="font-bold ml-1">₹{formatAmount(totalAmount)}</span>
//                 </div>
//               </div>
//             </div>
//             <div className="flex gap-2">
//               <button
//                 onClick={() => setSelectedItems([])}
//                 className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors"
//               >
//                 Clear All
//               </button>
//               <button
//                 onClick={handleBulkPayment}
//                 className="px-6 py-2 bg-white text-emerald-600 hover:bg-emerald-50 rounded-lg font-bold transition-colors flex items-center gap-2 shadow-md"
//               >
//                 <Banknote className="w-5 h-5" />
//                 Process Payment
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ── Filters ── */}
//       <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 space-y-4">
//         <div className="flex items-center justify-between">
//           <h3 className="font-semibold text-gray-700 flex items-center gap-2">
//             <Filter className="w-5 h-5 text-emerald-600" />
//             Filters
//           </h3>
//           {hasActiveFilters && (
//             <button
//               onClick={clearAllFilters}
//               className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
//             >
//               <X className="w-4 h-4" /> Clear All Filters
//             </button>
//           )}
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           {/* Search */}
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
//               <Search className="w-4 h-4" /> Search
//             </label>
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Search UID, payee, contractor..."
//                 value={searchTerm}
//                 onChange={e => setSearchTerm(e.target.value)}
//                 className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
//               />
//               {searchTerm && (
//                 <button
//                   onClick={() => setSearchTerm('')}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
//                 >
//                   <X className="w-4 h-4 text-gray-400" />
//                 </button>
//               )}
//             </div>
//           </div>

//           {/* Project Name */}
//           <SearchableDropdown
//             label="Project Name"
//             icon={Building}
//             options={uniqueProjectNames}
//             value={selectedProject}
//             onChange={setSelectedProject}
//             placeholder="Search & select project..."
//             color="purple"
//           />

//           {/* RCC Bill No */}
//           <SearchableDropdown
//             label="RCC Bill No"
//             icon={FileText}
//             options={uniqueRccBillNos}
//             value={selectedRccBillNo}
//             onChange={setSelectedRccBillNo}
//             placeholder="Search & select RCC bill..."
//             color="orange"
//           />
//         </div>

//         {/* Active filter tags */}
//         {hasActiveFilters && (
//           <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
//             <span className="text-xs text-gray-500">Active:</span>
//             {searchTerm && (
//               <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
//                 Search: "{searchTerm}"
//                 <button onClick={() => setSearchTerm('')}><X className="w-3 h-3" /></button>
//               </span>
//             )}
//             {selectedProject && (
//               <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
//                 <Building className="w-3 h-3" /> {selectedProject}
//                 <button onClick={() => setSelectedProject('')}><X className="w-3 h-3" /></button>
//               </span>
//             )}
//             {selectedRccBillNo && (
//               <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
//                 <FileText className="w-3 h-3" /> {selectedRccBillNo}
//                 <button onClick={() => setSelectedRccBillNo('')}><X className="w-3 h-3" /></button>
//               </span>
//             )}
//           </div>
//         )}
//       </div>

//       {/* ── Results count & select all ── */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div className="flex items-center gap-4">
//           <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200">
//             <FileText className="w-5 h-5 text-gray-500" />
//             <span className="text-gray-600 font-medium">
//               Showing: <span className="text-emerald-600 font-bold">{filteredData.length}</span> of {data?.length || 0}
//             </span>
//           </div>
//           {selectedItems.length > 0 && (
//             <span className="text-sm text-emerald-600 font-medium">
//               {selectedItems.length} selected
//             </span>
//           )}
//         </div>
//         <button
//           onClick={handleSelectAll}
//           disabled={filteredData.length === 0}
//           className={`px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50 ${
//             selectedItems.length === filteredData.length && filteredData.length > 0
//               ? 'bg-emerald-500 text-white'
//               : 'bg-white border border-gray-200 text-gray-700 hover:bg-emerald-50 hover:border-emerald-300'
//           }`}
//         >
//           {selectedItems.length === filteredData.length && filteredData.length > 0
//             ? <CheckSquare className="w-5 h-5" />
//             : <Square className="w-5 h-5" />}
//           {selectedItems.length === filteredData.length && filteredData.length > 0
//             ? 'Deselect All' : 'Select All'}
//         </button>
//       </div>

//       {/* ── Cards ── */}
//       {filteredData.length === 0 ? (
//         <div className="bg-white rounded-xl p-12 text-center border-2 border-dashed border-gray-200">
//           <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//           <p className="text-gray-500 text-lg font-medium">No records found</p>
//           <p className="text-gray-400 mt-1">
//             {hasActiveFilters ? 'Try adjusting your filters' : 'No payment data available'}
//           </p>
//           {hasActiveFilters && (
//             <button
//               onClick={clearAllFilters}
//               className="mt-4 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors font-medium"
//             >
//               Clear Filters
//             </button>
//           )}
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
//           {filteredData.map((item, index) => {
//             const isSelected = selectedItems.some(s => s.uid === item.uid);
//             return (
//               <div
//                 key={item.uid || index}
//                 onClick={() => handleCardSelect(item)}
//                 className={`relative bg-white rounded-2xl shadow-sm border-2 transition-all cursor-pointer hover:shadow-lg ${
//                   isSelected ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-gray-100 hover:border-emerald-300'
//                 }`}
//               >
//                 {/* Selection badge */}
//                 <div className={`absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
//                   isSelected ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'
//                 }`}>
//                   {isSelected ? <Check className="w-4 h-4" /> : <span className="text-xs">{index + 1}</span>}
//                 </div>

//                 {/* Card Header */}
//                 <div className={`p-4 rounded-t-2xl ${isSelected ? 'bg-emerald-50' : 'bg-gray-50'}`}>
//                   <div className="flex items-start gap-3">
//                     <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
//                       <span className="text-white font-bold text-lg">
//                         {item.projectName?.charAt(0)?.toUpperCase() || 'P'}
//                       </span>
//                     </div>
//                     <div className="flex-1 min-w-0 pr-8">
//                       <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold mb-1">
//                         <Hash className="w-3 h-3 mr-1" />{item.uid || 'N/A'}
//                       </span>
//                       <h3 className="font-bold text-gray-800 truncate text-sm">{item.projectName || 'N/A'}</h3>
//                       <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
//                         <Clock className="w-3 h-3" />
//                         <span>Bill Date: {item.BillDate || 'N/A'}</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Card Body */}
//                 <div className="p-4 space-y-3">
//                   {/* Cost Amount */}
//                   <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 flex items-center justify-between">
//                     <div className="flex items-center gap-2">
//                       <CircleDollarSign className="w-4 h-4 text-emerald-600" />
//                       <span className="text-xs font-semibold text-emerald-700">Cost Amount</span>
//                     </div>
//                     <span className="font-bold text-emerald-800 text-base">₹{formatAmount(item.costAmount)}</span>
//                   </div>

//                   <div className="grid grid-cols-2 gap-2 text-xs">
//                     <div className="bg-blue-50 rounded-lg p-2">
//                       <p className="text-gray-400 flex items-center gap-1 mb-0.5"><User className="w-3 h-3" /> Payee</p>
//                       <p className="font-semibold text-gray-700 truncate">{item.payeeName || 'N/A'}</p>
//                     </div>
//                     <div className="bg-green-50 rounded-lg p-2">
//                       <p className="text-gray-400 flex items-center gap-1 mb-0.5"><HardHat className="w-3 h-3" /> Contractor</p>
//                       <p className="font-semibold text-gray-700 truncate">{item.ContractorName || 'N/A'}</p>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-2 gap-2 text-xs">
//                     <div className="bg-orange-50 rounded-lg p-2">
//                       <p className="text-gray-400 flex items-center gap-1 mb-0.5"><Wrench className="w-3 h-3" /> Head Type</p>
//                       <p className="font-semibold text-gray-700 truncate">{item.headType || 'N/A'}</p>
//                     </div>
//                     <div className="bg-yellow-50 rounded-lg p-2">
//                       <p className="text-gray-400 flex items-center gap-1 mb-0.5"><Receipt className="w-3 h-3" /> EXP Head</p>
//                       <p className="font-semibold text-gray-700 truncate">{item.EXPHead || 'N/A'}</p>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-2 gap-2 text-xs">
//                     <div className="bg-purple-50 rounded-lg p-2">
//                       <p className="text-gray-400 flex items-center gap-1 mb-0.5"><FileText className="w-3 h-3" /> RCC Bill No</p>
//                       <p className="font-semibold text-gray-700">{item.RccBillNo || 'N/A'}</p>
//                     </div>
//                     <div className="bg-pink-50 rounded-lg p-2">
//                       <p className="text-gray-400 flex items-center gap-1 mb-0.5"><Hash className="w-3 h-3" /> Bill No</p>
//                       <p className="font-semibold text-gray-700">{item.BillNO || 'N/A'}</p>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-2 gap-2 text-xs">
//                     <div className="bg-teal-50 rounded-lg p-2">
//                       <p className="text-gray-400 flex items-center gap-1 mb-0.5"><Building2 className="w-3 h-3" /> Firm Name</p>
//                       <p className="font-semibold text-gray-700 truncate">{item.ContractorFirmName || 'N/A'}</p>
//                     </div>
//                     <div className="bg-cyan-50 rounded-lg p-2">
//                       <p className="text-gray-400 flex items-center gap-1 mb-0.5"><User className="w-3 h-3" /> Project Engineer</p>
//                       <p className="font-semibold text-gray-700 truncate">{item.projectEngineerName || 'N/A'}</p>
//                     </div>
//                   </div>

//                   <div className="bg-gray-50 rounded-lg p-2 text-xs">
//                     <p className="text-gray-400 flex items-center gap-1 mb-0.5"><Wrench className="w-3 h-3" /> Details of Work</p>
//                     <p className="font-semibold text-gray-700 line-clamp-2">{item.detailsOfWork || 'N/A'}</p>
//                   </div>

//                   <div className="grid grid-cols-2 gap-2 text-xs">
//                     <div className="bg-slate-50 rounded-lg p-2">
//                       <p className="text-gray-400 flex items-center gap-1 mb-0.5"><MessageSquare className="w-3 h-3" /> Remark</p>
//                       <p className="font-semibold text-gray-700 truncate">{item.remark || 'N/A'}</p>
//                     </div>
//                     <div className="bg-indigo-50 rounded-lg p-2">
//                       <p className="text-gray-400 flex items-center gap-1 mb-0.5"><Calendar className="w-3 h-3" /> Planned</p>
//                       <p className="font-semibold text-gray-700 truncate">{item.planned2 || 'N/A'}</p>
//                     </div>
//                   </div>

//                   {item.billPhoto && (
//                     <a
//                       href={item.billPhoto}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       onClick={e => e.stopPropagation()}
//                       className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg px-3 py-2 transition-colors font-medium"
//                     >
//                       <FileText className="w-3 h-3" /> View Bill Photo
//                     </a>
//                   )}
//                 </div>

//                 {isSelected && (
//                   <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-b-2xl" />
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       )}

//       {/* ── Footer stats ── */}
//       <div className="bg-white rounded-xl p-4 border border-gray-200">
//         <div className="flex flex-wrap items-center justify-between gap-4">
//           <p className="text-sm text-gray-600">
//             Showing <span className="font-semibold text-emerald-600">{filteredData.length}</span> records
//             {selectedItems.length > 0 && (
//               <span className="ml-2">
//                 • <span className="font-semibold text-emerald-600">{selectedItems.length}</span> selected
//               </span>
//             )}
//           </p>
//           <p className="text-xs text-gray-400">
//             Click on cards to select • Use filters to narrow down results
//           </p>
//         </div>
//       </div>

//       {/* ══════════════════════════════════════════════════════
//           Bulk Payment Modal
//       ══════════════════════════════════════════════════════ */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] flex flex-col">

//             {/* Modal Header */}
//             <div className="flex-shrink-0 p-4 sm:p-6 border-b bg-gradient-to-r from-emerald-50 to-teal-50 rounded-t-2xl">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
//                     <CircleDollarSign className="w-5 h-5 text-emerald-600" />
//                     Bulk Payment Processing
//                   </h3>
//                   <p className="text-xs sm:text-sm text-gray-500 mt-1">
//                     Processing <span className="font-semibold text-emerald-600">{selectedItems.length}</span> payments
//                   </p>
//                 </div>
//                 <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
//                   <X className="w-5 h-5 text-gray-500" />
//                 </button>
//               </div>
//             </div>

//             {/* Modal Body */}
//             <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">

//               {/* Selected Records Summary */}
//               <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
//                 <h4 className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-3 flex items-center gap-2">
//                   <ListChecks className="w-4 h-4" /> Selected Records Summary
//                 </h4>
//                 <div className="max-h-24 overflow-y-auto mb-3 bg-white rounded-lg p-2 border border-emerald-100">
//                   <div className="flex flex-wrap gap-2">
//                     {selectedItems.map((item, i) => (
//                       <span key={item.uid || i} className="inline-flex items-center px-2 py-1 bg-emerald-100 text-emerald-800 rounded text-xs font-medium">
//                         {item.uid}
//                       </span>
//                     ))}
//                   </div>
//                 </div>
//                 <div className="bg-white p-3 rounded-lg border border-emerald-100 text-center">
//                   <span className="text-xs text-gray-500 block">Total Amount (Selected Records)</span>
//                   <p className="font-bold text-emerald-800 text-xl mt-1">
//                     ₹{formatAmount(totalAmount)}
//                   </p>
//                 </div>
//               </div>

//               {/* ✅ TDS Calculator */}
//               <TDSCalculatorCard
//                 totalAmount={totalAmount}
//                 tdsAmount={formData.TDS_AMOUNT}
//                 onTdsChange={(val) => handleFormChange('TDS_AMOUNT', val)}
//               />

//               {/* Status */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Payment Status <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <select
//                     value={formData.STATUS_3}
//                     onChange={e => handleFormChange('STATUS_3', e.target.value)}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none bg-white cursor-pointer"
//                   >
//                     <option value="">-- Select Status --</option>
//                     <option value="Done">💰 Done</option>
//                     <option value="Rejected">❌ Rejected</option>
//                   </select>
//                   <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
//                 </div>
//               </div>

//               {/* Payment Mode */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   <CreditCard className="w-4 h-4 inline mr-1" />
//                   Payment Mode <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <select
//                     value={formData.PAYMENT_MODE_3}
//                     onChange={e => handleFormChange('PAYMENT_MODE_3', e.target.value)}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none bg-white cursor-pointer"
//                   >
//                     {paymentModeOptions.map(opt => (
//                       <option key={opt.value} value={opt.value}>{opt.label}</option>
//                     ))}
//                   </select>
//                   <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
//                 </div>
//               </div>

//               {/* Bank Details */}
//               <SearchableDropdown
//                 label="Bank Details"
//                 icon={Building2}
//                 options={uniqueBankNames}
//                 value={formData.BANK_DETAILS_3}
//                 onChange={val => handleFormChange('BANK_DETAILS_3', val)}
//                 placeholder={isBankLoading ? 'Loading banks...' : 'Search & select bank...'}
//                 color="blue"
//                 required={true}
//               />
//               {uniqueBankNames.length === 0 && !isBankLoading && (
//                 <p className="text-xs text-amber-600 -mt-2">⚠️ No banks found. Check API extraField.</p>
//               )}

//               {/* Payment Details & Date */}
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     <Receipt className="w-4 h-4 inline mr-1" />
//                     Payment Ref / UTR <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.PAYMENT_DETAILS_3}
//                     onChange={e => handleFormChange('PAYMENT_DETAILS_3', e.target.value)}
//                     placeholder="Enter reference / UTR no..."
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     <Calendar className="w-4 h-4 inline mr-1" />
//                     Payment Date <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="date"
//                     value={formData.PAYMENT_DATE_3}
//                     onChange={e => handleFormChange('PAYMENT_DATE_3', e.target.value)}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
//                   />
//                 </div>
//               </div>

//               {/* Receiver Name */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   <User className="w-4 h-4 inline mr-1" />
//                   Receiver Name <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.Receiver_Name}
//                   onChange={e => handleFormChange('Receiver_Name', e.target.value)}
//                   placeholder="Enter receiver name..."
//                   className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
//                 />
//               </div>

//               {/* Remark */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   <MessageSquare className="w-4 h-4 inline mr-1" />
//                   Remark <span className="text-gray-400 font-normal">(Optional)</span>
//                 </label>
//                 <textarea
//                   value={formData.Remark}
//                   onChange={e => handleFormChange('Remark', e.target.value)}
//                   rows={3}
//                   placeholder="Enter any payment remarks..."
//                   className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
//                 />
//               </div>

//               {/* Info note */}
//               <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
//                 <p className="text-xs text-blue-700">
//                   ℹ️ <strong>Note:</strong> Same payment details applied to all{' '}
//                   {selectedItems.length} records. TDS & Net Amount written only on the{' '}
//                   <strong>last selected record</strong>.
//                 </p>
//               </div>
//             </div>

//             {/* Modal Footer */}
//             <div className="flex-shrink-0 p-4 sm:p-6 border-t bg-gray-50 flex gap-3 justify-end rounded-b-2xl">
//               <button
//                 onClick={() => setShowModal(false)}
//                 className="px-4 sm:px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-medium"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSubmit}
//                 disabled={
//                   isSubmitting ||
//                   isTdsInvalid ||
//                   !formData.STATUS_3 ||
//                   !formData.PAYMENT_MODE_3 ||
//                   !formData.BANK_DETAILS_3 ||
//                   !formData.PAYMENT_DETAILS_3 ||
//                   !formData.PAYMENT_DATE_3 ||
//                   !formData.Receiver_Name
//                 }
//                 className="px-4 sm:px-6 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 shadow-md hover:shadow-lg"
//               >
//                 {isSubmitting ? (
//                   <>
//                     <Loader2 className="w-4 h-4 animate-spin" />
//                     <span>Processing {selectedItems.length}...</span>
//                   </>
//                 ) : (
//                   <>
//                     <BadgeCheck className="w-4 h-4" />
//                     Confirm Payment ({selectedItems.length})
//                     {tdsValue > 0 && (
//                       <span className="ml-1 text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
//                         Net ₹{formatAmount(netAmount)}
//                       </span>
//                     )}
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SitePaidAmount;






import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  useGetSitePaidStepQuery,
  usePostSitePaidStepMutation,
} from '../../redux/SiteExpenses/SiteExpensesSlice';
import {
  useGetProjectDropdownQuery,
} from '../../redux/Labour/LabourSlice';
import {
  Loader2, RefreshCw, User, Calendar, FileText, Building, AlertCircle,
  Search, Filter, X, Wrench, Clock, Hash, ChevronDown, Building2, HardHat,
  MessageSquare, CreditCard, Banknote, Receipt, BadgeCheck, CircleDollarSign,
  CheckSquare, Square, ListChecks, Check, ChevronUp, Percent, Minus, ArrowRight,
  RotateCcw, Package
} from 'lucide-react';

// ═══════════════════════════════════════════════
// THEME - Same as SiteApprovel
// ═══════════════════════════════════════════════
const T = {
  navy: '#1e293b', navyLight: '#334155', navyDark: '#0f172a',
  gold: '#f59e0b', goldLight: '#fbbf24', goldDark: '#d97706',
  card: '#ffffff',
  text: '#1e293b', textLight: '#64748b', textMuted: '#94a3b8',
  border: '#e2e8f0', borderLight: '#f1f5f9',
  success: '#10b981', successBg: '#ecfdf5', successBorder: '#a7f3d0',
  danger: '#ef4444', dangerBg: '#fef2f2', dangerBorder: '#fecaca',
  purple: '#7c3aed', purpleBg: '#f5f3ff',
  blue: '#3b82f6', blueBg: '#eff6ff',
  orange: '#f97316', orangeBg: '#fff7ed',
  amber: '#f59e0b', amberBg: '#fffbeb',
};

const inputBase = {
  width: '100%', padding: '10px 12px', fontSize: 13,
  border: `1.5px solid ${T.border}`, borderRadius: 8,
  outline: 'none', color: T.text, background: T.borderLight,
  transition: 'all 0.2s', boxSizing: 'border-box',
};

const focusGold = e => {
  e.target.style.borderColor = T.gold;
  e.target.style.boxShadow = `0 0 0 3px ${T.gold}22`;
  e.target.style.background = T.card;
};
const blurNormal = e => {
  e.target.style.borderColor = T.border;
  e.target.style.boxShadow = 'none';
  e.target.style.background = T.borderLight;
};

// ═══════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════
const formatAmount = (value) => {
  if (value == null || value === '') return '0';
  const cleaned = String(value).replace(/[^0-9.-]/g, '');
  const num = parseFloat(cleaned);
  if (isNaN(num)) return '0';
  return num.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 0 });
};

const parseAmount = (value) => {
  const cleaned = String(value || '0').replace(/[^0-9.-]/g, '');
  return parseFloat(cleaned) || 0;
};

// ═══════════════════════════════════════════════
// Searchable Dropdown
// ═══════════════════════════════════════════════
const SearchableDropdown = ({ label, icon: Icon, options = [], value, onChange, placeholder, accentColor = T.gold, required = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const filteredOptions = useMemo(() =>
    options.filter(o => typeof o === 'string' && o.toLowerCase().includes(searchTerm.toLowerCase())),
    [options, searchTerm]
  );

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false); setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (opt) => { onChange(opt); setSearchTerm(''); setIsOpen(false); };
  const handleClear = (e) => { e.stopPropagation(); onChange(''); setSearchTerm(''); };

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      {label && (
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: T.navyLight, marginBottom: 6 }}>
          {Icon && <Icon size={14} />}
          {label}
          {required && <span style={{ color: T.danger }}>*</span>}
        </label>
      )}

      {/* Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
          border: `1.5px solid ${isOpen ? accentColor : T.border}`,
          background: value ? `${accentColor}10` : T.borderLight,
          boxShadow: isOpen ? `0 0 0 3px ${accentColor}22` : 'none',
          transition: 'all 0.2s', fontSize: 13,
        }}
      >
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
          {value ? (
            <span style={{ fontWeight: 600, color: T.navy }}>{value}</span>
          ) : (
            <input
              type="text" value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setIsOpen(true); }}
              onClick={e => { e.stopPropagation(); setIsOpen(true); }}
              placeholder={placeholder}
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: T.textLight, width: '100%' }}
            />
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {value && (
            <button onClick={handleClear}
              style={{ width: 20, height: 20, borderRadius: '50%', border: 'none', background: `${T.textMuted}30`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={11} color={T.textMuted} />
            </button>
          )}
          {isOpen ? <ChevronUp size={14} color={T.textMuted} /> : <ChevronDown size={14} color={T.textMuted} />}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div style={{
          position: 'absolute', zIndex: 999, width: '100%', marginTop: 4,
          background: T.card, border: `1.5px solid ${T.border}`, borderRadius: 8,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)', overflow: 'hidden',
        }}>
          {value && (
            <div style={{ padding: '8px 8px 4px', borderBottom: `1px solid ${T.border}` }}>
              <div style={{ position: 'relative' }}>
                <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: T.textMuted }} />
                <input
                  type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Type to search..." autoFocus
                  style={{ ...inputBase, paddingLeft: 28, padding: '7px 10px 7px 28px', fontSize: 12 }}
                  onFocus={focusGold} onBlur={blurNormal}
                />
              </div>
            </div>
          )}
          <div style={{ maxHeight: 180, overflowY: 'auto' }}>
            <button onClick={() => handleSelect('')}
              style={{ width: '100%', padding: '9px 12px', textAlign: 'left', fontSize: 12, border: 'none', background: !value ? `${accentColor}15` : 'transparent', color: T.textLight, cursor: 'pointer' }}>
              -- Select --
            </button>
            {filteredOptions.length > 0 ? filteredOptions.map((opt, i) => (
              <button key={i} onClick={() => handleSelect(opt)}
                style={{
                  width: '100%', padding: '9px 12px', textAlign: 'left', fontSize: 12,
                  border: 'none', background: value === opt ? `${accentColor}15` : 'transparent',
                  color: value === opt ? T.navy : T.textLight,
                  fontWeight: value === opt ? 700 : 400, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}
                onMouseEnter={e => { if (value !== opt) e.currentTarget.style.background = T.borderLight; }}
                onMouseLeave={e => { if (value !== opt) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{opt}</span>
                {value === opt && <Check size={12} color={accentColor} />}
              </button>
            )) : (
              <div style={{ padding: '12px', textAlign: 'center', fontSize: 12, color: T.textMuted }}>No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════
// TDS Calculator Card
// ═══════════════════════════════════════════════
const TDSCalculatorCard = ({ totalAmount, tdsAmount, onTdsChange }) => {
  const tds = parseAmount(tdsAmount);
  const netAmount = totalAmount - tds;
  const tdsPercentage = totalAmount > 0 ? ((tds / totalAmount) * 100).toFixed(2) : '0.00';

  return (
    <div style={{ background: `${T.gold}08`, border: `1.5px solid ${T.gold}40`, borderRadius: 10, padding: 14 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: `${T.gold}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Percent size={14} color={T.goldDark} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: T.navyLight }}>TDS Deduction</span>
        <span style={{ fontSize: 10, color: T.textMuted, marginLeft: 'auto' }}>(Last selected record)</span>
      </div>

      {/* TDS Input */}
      <div style={{ marginBottom: 10 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: T.textLight, marginBottom: 5 }}>TDS Amount (₹)</label>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 13, fontWeight: 700, color: T.textMuted }}>₹</span>
          <input
            type="number" min="0" step="0.01" value={tdsAmount}
            onChange={e => onTdsChange(e.target.value)}
            placeholder="Enter TDS amount..."
            style={{ ...inputBase, paddingLeft: 26 }}
            onFocus={focusGold} onBlur={blurNormal}
          />
        </div>
      </div>

      {/* Calculation Box */}
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: 12 }}>
        {/* Total */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: T.textLight, display: 'flex', alignItems: 'center', gap: 5 }}>
            <CircleDollarSign size={13} color={T.success} /> Total Paid
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: T.navy }}>₹{formatAmount(totalAmount)}</span>
        </div>

        {/* TDS */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: T.textLight, display: 'flex', alignItems: 'center', gap: 5 }}>
            <Minus size={13} color={T.danger} /> TDS Deduction
            {tds > 0 && (
              <span style={{ fontSize: 10, background: `${T.danger}15`, color: T.danger, padding: '2px 6px', borderRadius: 20, fontWeight: 700 }}>
                {tdsPercentage}%
              </span>
            )}
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: tds > 0 ? T.danger : T.textMuted }}>- ₹{formatAmount(tds)}</span>
        </div>

        {/* Divider */}
        <div style={{ borderTop: `1.5px dashed ${T.gold}50`, margin: '8px 0' }} />

        {/* Net */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: T.navyLight, display: 'flex', alignItems: 'center', gap: 5 }}>
            <ArrowRight size={13} color={T.success} /> Net Payable
          </span>
          <span style={{ fontSize: 15, fontWeight: 800, color: netAmount >= 0 ? T.success : T.danger }}>₹{formatAmount(netAmount)}</span>
        </div>
      </div>

      {/* Warning */}
      {tds > totalAmount && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: T.dangerBg, border: `1px solid ${T.dangerBorder}`, borderRadius: 7, padding: '8px 10px', marginTop: 8 }}>
          <AlertCircle size={14} color={T.danger} />
          <span style={{ fontSize: 11, color: T.danger, fontWeight: 600 }}>TDS cannot exceed total paid amount!</span>
        </div>
      )}

      {/* Info */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, background: `${T.gold}12`, borderRadius: 7, padding: '8px 10px', marginTop: 8 }}>
        <span style={{ fontSize: 11 }}>ℹ️</span>
        <span style={{ fontSize: 11, color: T.goldDark }}>
          TDS → <strong>column Z</strong> | Net Amount → <strong>column AA</strong> (last selected record only)
        </span>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════
const SitePaidAmount = () => {
  const { data = [], isLoading, isError, refetch, isFetching } = useGetSitePaidStepQuery();
  const [postSitePaidStep, { isLoading: isSubmitting }] = usePostSitePaidStepMutation();
  const { data: bankList = [], isLoading: isBankLoading } = useGetProjectDropdownQuery();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedRccBillNo, setSelectedRccBillNo] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    STATUS_3: '', PAYMENT_MODE_3: '', BANK_DETAILS_3: '',
    PAYMENT_DETAILS_3: '', PAYMENT_DATE_3: new Date().toISOString().split('T')[0],
    Receiver_Name: '', Remark: '', TDS_AMOUNT: '',
  });

  // Derived lists
  const uniqueProjectNames = useMemo(() =>
    [...new Set(data.map(i => i.projectName).filter(Boolean))].sort(), [data]);
  const uniqueRccBillNos = useMemo(() =>
    [...new Set(data.map(i => i.RccBillNo).filter(Boolean))].sort(), [data]);
  const uniqueBankNames = useMemo(() => {
    if (!Array.isArray(bankList)) return [];
    return [...new Set(bankList.map(i => i.extraField || i.bankName || i.name || '').filter(n => n?.trim()))].sort();
  }, [bankList]);

  const paymentModeOptions = [
    { value: '', label: '-- Select --' }, { value: 'NEFT', label: '📱 NEFT' },
    { value: 'RTGS', label: '📋 RTGS' }, { value: 'Cheque', label: '📄 Cheque' },
    { value: 'Cash', label: '💵 Cash' }, { value: 'UPI', label: '📲 UPI' },
  ];

  // Filter
  const filteredData = useMemo(() => data.filter(item => {
    const sl = searchTerm.toLowerCase();
    const match = !sl || [item.payeeName, item.uid, item.RccBillNo, item.ContractorName, item.detailsOfWork]
      .some(v => (v || '').toLowerCase().includes(sl));
    return match && (!selectedProject || item.projectName === selectedProject)
      && (!selectedRccBillNo || item.RccBillNo === selectedRccBillNo);
  }), [data, searchTerm, selectedProject, selectedRccBillNo]);

  const hasActiveFilters = searchTerm || selectedProject || selectedRccBillNo;
  const clearAllFilters = () => { setSearchTerm(''); setSelectedProject(''); setSelectedRccBillNo(''); };

  // Selection
  const handleCardSelect = (item) => setSelectedItems(prev =>
    prev.some(s => s.uid === item.uid) ? prev.filter(s => s.uid !== item.uid) : [...prev, item]);
  const handleSelectAll = () => setSelectedItems(
    selectedItems.length === filteredData.length ? [] : [...filteredData]);

  // Amounts
  const totalAmount = selectedItems.reduce((s, i) => s + parseAmount(i.costAmount), 0);
  const tdsValue = parseAmount(formData.TDS_AMOUNT);
  const netAmount = totalAmount - tdsValue;
  const isTdsInvalid = tdsValue > totalAmount;

  const handleFormChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleBulkPayment = () => {
    if (!selectedItems.length) return alert('Select at least one record');
    setFormData({
      STATUS_3: '', PAYMENT_MODE_3: '', BANK_DETAILS_3: '', PAYMENT_DETAILS_3: '',
      PAYMENT_DATE_3: new Date().toISOString().split('T')[0], Receiver_Name: '', Remark: '', TDS_AMOUNT: '',
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!selectedItems.length) return;
    if (!formData.STATUS_3) return alert('Select Payment Status');
    if (!formData.PAYMENT_MODE_3) return alert('Select Payment Mode');
    if (!formData.BANK_DETAILS_3) return alert('Select Bank');
    if (!formData.PAYMENT_DETAILS_3) return alert('Enter Payment Reference');
    if (!formData.PAYMENT_DATE_3) return alert('Select Payment Date');
    if (!formData.Receiver_Name) return alert('Enter Receiver Name');
    if (isTdsInvalid) return alert('TDS cannot exceed total!');

    const payload = {
      records: selectedItems.map(i => ({ UID: i.uid, costAmount: parseAmount(i.costAmount) })),
      TDS_AMOUNT: tdsValue || 0,
      STATUS_3: formData.STATUS_3, PAYMENT_MODE_3: formData.PAYMENT_MODE_3,
      BANK_DETAILS_3: formData.BANK_DETAILS_3, PAYMENT_DETAILS_3: formData.PAYMENT_DETAILS_3,
      PAYMENT_DATE_3: formData.PAYMENT_DATE_3, Receiver_Name: formData.Receiver_Name, Remark: formData.Remark,
    };

    try {
      const result = await postSitePaidStep(payload).unwrap();
      if (result?.success) {
        alert(`✅ Bulk Payment Done!\nRecords: ${result.totalRecords}\nTotal: ₹${formatAmount(totalAmount)}\nTDS: ₹${formatAmount(tdsValue)}\nNet: ₹${formatAmount(netAmount)}`);
      } else alert(`⚠️ ${result?.message || 'Unknown result'}`);
    } catch (err) {
      alert(`❌ Failed: ${err?.data?.message || 'Error'}`);
    }
    setShowModal(false); setSelectedItems([]); refetch();
  };

  // Loading / Error
  if (isLoading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 80 }}>
      <div style={{ width: 56, height: 56, borderRadius: 14, background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, boxShadow: `0 0 0 4px ${T.gold}30` }}>
        <Loader2 size={28} color={T.gold} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
      <p style={{ fontSize: 15, fontWeight: 600, color: T.navy }}>Loading Payment Data...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (isError) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 60 }}>
      <AlertCircle size={40} color={T.danger} style={{ marginBottom: 12 }} />
      <p style={{ fontSize: 15, fontWeight: 600, color: T.danger, marginBottom: 12 }}>Failed to load data</p>
      <button onClick={refetch} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 8, border: 'none', background: T.danger, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
        <RotateCcw size={14} /> Retry
      </button>
    </div>
  );

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 8px' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* ── Header ── */}
      <div style={{ background: T.card, borderRadius: 10, border: `1px solid ${T.border}`, padding: '14px 18px', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircleDollarSign size={18} color={T.gold} />
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: T.navy, margin: 0 }}>Site Payment Processing</h2>
            <p style={{ fontSize: 12, color: T.textMuted, margin: 0 }}>Select records & process bulk payments</p>
          </div>
        </div>
        <button onClick={refetch} disabled={isFetching}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: `1.5px solid ${T.border}`, background: T.card, color: T.textLight, fontSize: 13, cursor: 'pointer', opacity: isFetching ? 0.6 : 1 }}>
          <RotateCcw size={14} style={isFetching ? { animation: 'spin 0.8s linear infinite' } : {}} /> Refresh
        </button>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 12 }}>
        <div style={{ background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`, borderRadius: 10, padding: 14, color: 'white' }}>
          <p style={{ fontSize: 10, color: T.textMuted, textTransform: 'uppercase', margin: 0 }}>Total Records</p>
          <p style={{ fontSize: 22, fontWeight: 800, margin: '4px 0 0', color: T.gold }}>{data.length}</p>
        </div>
        <div style={{ background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`, borderRadius: 10, padding: 14 }}>
          <p style={{ fontSize: 10, textTransform: 'uppercase', margin: 0, color: T.navyDark, opacity: 0.7 }}>Filtered</p>
          <p style={{ fontSize: 22, fontWeight: 800, margin: '4px 0 0', color: T.navyDark }}>{filteredData.length}</p>
        </div>
        <div style={{ background: `linear-gradient(135deg, ${T.success}, #059669)`, borderRadius: 10, padding: 14 }}>
          <p style={{ fontSize: 10, textTransform: 'uppercase', margin: 0, color: 'white', opacity: 0.8 }}>Selected Amount</p>
          <p style={{ fontSize: 18, fontWeight: 800, margin: '4px 0 0', color: 'white' }}>₹{formatAmount(totalAmount)}</p>
        </div>
      </div>

      {/* ── Sticky Selection Bar ── */}
      {selectedItems.length > 0 && (
        <div style={{
          position: 'sticky', top: 0, zIndex: 20, marginBottom: 12,
          background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`,
          borderRadius: 10, padding: '12px 16px',
          border: `2px solid ${T.gold}50`,
          boxShadow: `0 4px 20px ${T.navy}40`,
          animation: 'fadeIn 0.3s ease-out',
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ListChecks size={18} color={T.gold} />
              <span style={{ fontWeight: 700, fontSize: 15, color: T.gold }}>{selectedItems.length} Selected</span>
            </div>
            <div style={{ width: 1, height: 24, background: `${T.gold}40` }} />
            <div style={{ background: `${T.gold}20`, borderRadius: 8, padding: '5px 12px', border: `1px solid ${T.gold}40` }}>
              <span style={{ fontSize: 12, color: T.goldLight }}>💰 Total: </span>
              <span style={{ fontSize: 13, fontWeight: 800, color: T.gold }}>₹{formatAmount(totalAmount)}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setSelectedItems([])}
              style={{ padding: '7px 14px', borderRadius: 7, border: `1px solid ${T.gold}40`, background: 'transparent', color: T.goldLight, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              Clear All
            </button>
            <button onClick={handleBulkPayment}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 7, border: 'none', background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`, color: T.navyDark, fontSize: 13, fontWeight: 800, cursor: 'pointer', boxShadow: `0 2px 8px ${T.gold}50` }}>
              <Banknote size={16} /> Process Payment
            </button>
          </div>
        </div>
      )}

      {/* ── Filters ── */}
      <div style={{ background: T.card, borderRadius: 10, border: `1px solid ${T.border}`, padding: '14px 16px', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Filter size={16} color={T.gold} />
            <span style={{ fontSize: 13, fontWeight: 700, color: T.navy }}>Filters</span>
          </div>
          {hasActiveFilters && (
            <button onClick={clearAllFilters}
              style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: T.gold, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              <X size={13} /> Clear All
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {/* Search */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: T.navyLight, marginBottom: 6 }}>
              <Search size={14} /> Search
            </label>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: T.textMuted }} />
              <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                placeholder="UID, payee, contractor..."
                style={{ ...inputBase, paddingLeft: 32 }} onFocus={focusGold} onBlur={blurNormal} />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')}
                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', padding: 2 }}>
                  <X size={13} color={T.textMuted} />
                </button>
              )}
            </div>
          </div>

          <SearchableDropdown label="Project Name" icon={Building} options={uniqueProjectNames}
            value={selectedProject} onChange={setSelectedProject} placeholder="Select project..."
            accentColor={T.purple} />

          <SearchableDropdown label="RCC Bill No" icon={FileText} options={uniqueRccBillNos}
            value={selectedRccBillNo} onChange={setSelectedRccBillNo} placeholder="Select RCC bill..."
            accentColor={T.orange} />
        </div>

        {/* Active Tags */}
        {hasActiveFilters && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.border}` }}>
            <span style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>Active:</span>
            {searchTerm && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', background: `${T.gold}15`, color: T.goldDark, borderRadius: 20, fontSize: 11, fontWeight: 600, border: `1px solid ${T.gold}30` }}>
                "{searchTerm}" <button onClick={() => setSearchTerm('')} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}><X size={10} color={T.goldDark} /></button>
              </span>
            )}
            {selectedProject && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', background: `${T.purple}15`, color: T.purple, borderRadius: 20, fontSize: 11, fontWeight: 600, border: `1px solid ${T.purple}30` }}>
                <Building size={10} /> {selectedProject} <button onClick={() => setSelectedProject('')} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}><X size={10} color={T.purple} /></button>
              </span>
            )}
            {selectedRccBillNo && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', background: `${T.orange}15`, color: T.orange, borderRadius: 20, fontSize: 11, fontWeight: 600, border: `1px solid ${T.orange}30` }}>
                <FileText size={10} /> {selectedRccBillNo} <button onClick={() => setSelectedRccBillNo('')} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}><X size={10} color={T.orange} /></button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Results & Select All ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', background: T.card, borderRadius: 8, border: `1px solid ${T.border}` }}>
            <FileText size={14} color={T.textMuted} />
            <span style={{ fontSize: 13, color: T.textLight }}>
              Showing: <strong style={{ color: T.gold }}>{filteredData.length}</strong> of {data.length}
            </span>
          </div>
          {selectedItems.length > 0 && (
            <span style={{ fontSize: 12, color: T.success, fontWeight: 600 }}>• {selectedItems.length} selected</span>
          )}
        </div>

        <button onClick={handleSelectAll} disabled={!filteredData.length}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8,
            border: `1.5px solid ${selectedItems.length === filteredData.length && filteredData.length > 0 ? T.navy : T.border}`,
            background: selectedItems.length === filteredData.length && filteredData.length > 0
              ? `linear-gradient(135deg, ${T.navy}, ${T.navyLight})` : T.card,
            color: selectedItems.length === filteredData.length && filteredData.length > 0 ? T.gold : T.textLight,
            fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}>
          {selectedItems.length === filteredData.length && filteredData.length > 0
            ? <><CheckSquare size={15} /> Deselect All</>
            : <><Square size={15} /> Select All</>}
        </button>
      </div>

      {/* ── Cards Grid ── */}
      {filteredData.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px', background: T.card, borderRadius: 10, border: `2px dashed ${T.border}` }}>
          <Package size={40} color={T.border} style={{ marginBottom: 12 }} />
          <p style={{ fontSize: 15, color: T.textLight, fontWeight: 500 }}>No records found</p>
          <p style={{ fontSize: 12, color: T.textMuted }}>{hasActiveFilters ? 'Try adjusting filters' : 'No payment data available'}</p>
          {hasActiveFilters && (
            <button onClick={clearAllFilters}
              style={{ marginTop: 12, padding: '8px 16px', borderRadius: 8, border: 'none', background: `${T.gold}20`, color: T.goldDark, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
          {filteredData.map((item, index) => {
            const isSelected = selectedItems.some(s => s.uid === item.uid);
            return (
              <div key={item.uid || index} onClick={() => handleCardSelect(item)}
                style={{
                  background: T.card, borderRadius: 10, cursor: 'pointer',
                  border: `2px solid ${isSelected ? T.gold : T.border}`,
                  boxShadow: isSelected ? `0 4px 16px ${T.gold}30` : '0 1px 4px rgba(0,0,0,0.06)',
                  transition: 'all 0.2s', position: 'relative', overflow: 'hidden',
                }}
                onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.borderColor = `${T.gold}60`; e.currentTarget.style.boxShadow = `0 4px 12px ${T.gold}20`; } }}
                onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; } }}
              >
                {/* Gold top bar when selected */}
                {isSelected && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${T.gold}, ${T.goldDark})` }} />}

                {/* Card Header */}
                <div style={{ padding: '12px 14px 10px', background: isSelected ? `${T.gold}08` : T.borderLight, borderBottom: `1px solid ${T.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    {/* Avatar */}
                    <div style={{ width: 40, height: 40, borderRadius: 9, background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `2px solid ${T.gold}30` }}>
                      <span style={{ color: T.gold, fontWeight: 800, fontSize: 16 }}>
                        {item.projectName?.charAt(0)?.toUpperCase() || 'P'}
                      </span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0, paddingRight: 32 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: `${T.navy}10`, color: T.navy, fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 5, marginBottom: 4 }}>
                        <Hash size={9} /> {item.uid || 'N/A'}
                      </span>
                      <p style={{ fontSize: 13, fontWeight: 700, color: T.navy, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.projectName || 'N/A'}</p>
                      <p style={{ fontSize: 11, color: T.textMuted, margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={10} /> Bill Date: {item.BillDate || 'N/A'}
                      </p>
                    </div>
                    {/* Selection circle */}
                    <div style={{
                      position: 'absolute', top: 12, right: 12, width: 26, height: 26, borderRadius: '50%',
                      background: isSelected ? `linear-gradient(135deg, ${T.gold}, ${T.goldDark})` : T.borderLight,
                      border: `2px solid ${isSelected ? T.gold : T.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      {isSelected ? <Check size={13} color={T.navyDark} strokeWidth={3} /> : <span style={{ fontSize: 10, fontWeight: 700, color: T.textMuted }}>{index + 1}</span>}
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {/* Amount */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: `${T.success}10`, border: `1px solid ${T.success}30`, borderRadius: 8, padding: '8px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CircleDollarSign size={14} color={T.success} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: T.success }}>Cost Amount</span>
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 800, color: T.success }}>₹{formatAmount(item.costAmount)}</span>
                  </div>

                  {/* Info Grid */}
                  {[
                    [{ icon: User, label: 'Payee', val: item.payeeName, bg: T.blueBg },
                    { icon: HardHat, label: 'Contractor', val: item.ContractorName, bg: T.successBg }],
                    [{ icon: Wrench, label: 'Head Type', val: item.headType, bg: T.orangeBg },
                    { icon: Receipt, label: 'EXP Head', val: item.EXPHead, bg: T.amberBg }],
                    [{ icon: FileText, label: 'RCC Bill No', val: item.RccBillNo, bg: T.purpleBg },
                    { icon: Hash, label: 'Bill No', val: item.BillNO, bg: `#fdf2f8` }],
                    [{ icon: Building2, label: 'Firm Name', val: item.ContractorFirmName, bg: `${T.success}08` },
                    { icon: User, label: 'Engineer', val: item.projectEngineerName, bg: `#ecfeff` }],
                  ].map((row, ri) => (
                    <div key={ri} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                      {row.map(({ icon: Ic, label, val, bg }, ci) => (
                        <div key={ci} style={{ background: bg, borderRadius: 7, padding: '7px 9px', border: `1px solid ${T.border}` }}>
                          <p style={{ fontSize: 10, color: T.textMuted, margin: '0 0 2px', display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Ic size={10} /> {label}
                          </p>
                          <p style={{ fontSize: 11, fontWeight: 700, color: T.navy, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{val || 'N/A'}</p>
                        </div>
                      ))}
                    </div>
                  ))}

                  {/* Details of Work */}
                  <div style={{ background: T.borderLight, borderRadius: 7, padding: '7px 9px', border: `1px solid ${T.border}` }}>
                    <p style={{ fontSize: 10, color: T.textMuted, margin: '0 0 2px', display: 'flex', alignItems: 'center', gap: 3 }}><Wrench size={10} /> Details of Work</p>
                    <p style={{ fontSize: 11, fontWeight: 600, color: T.navy, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.detailsOfWork || 'N/A'}</p>
                  </div>

                  {/* Bill Photo */}
                  {item.billPhoto && (
                    <a href={item.billPhoto} target="_blank" rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: T.navy, background: `${T.navy}08`, border: `1px solid ${T.navy}20`, borderRadius: 7, padding: '7px 10px', textDecoration: 'none', fontWeight: 600 }}>
                      <FileText size={12} color={T.gold} /> View Bill Photo
                    </a>
                  )}
                </div>

                {/* Gold bottom bar when selected */}
                {isSelected && <div style={{ height: 3, background: `linear-gradient(90deg, ${T.gold}, ${T.goldDark})` }} />}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Footer ── */}
      <div style={{ background: T.card, borderRadius: 10, border: `1px solid ${T.border}`, padding: '12px 16px', marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <p style={{ fontSize: 12, color: T.textLight, margin: 0 }}>
          Showing <strong style={{ color: T.gold }}>{filteredData.length}</strong> records
          {selectedItems.length > 0 && <> • <strong style={{ color: T.success }}>{selectedItems.length}</strong> selected</>}
        </p>
        <p style={{ fontSize: 11, color: T.textMuted, margin: 0 }}>Click cards to select • Use filters to narrow results</p>
      </div>

      {/* ══════════════════════════════════════
          MODAL
      ══════════════════════════════════════ */}
      {showModal && (
        <>
          <div onClick={() => setShowModal(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(2px)', zIndex: 100 }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            width: '95%', maxWidth: 560, maxHeight: '92vh',
            background: T.card, borderRadius: 14, zIndex: 101,
            boxShadow: `0 24px 60px rgba(0,0,0,0.25)`,
            display: 'flex', flexDirection: 'column',
            border: `2px solid ${T.gold}30`,
          }}>
            {/* Modal Header */}
            <div style={{ background: T.navy, padding: '14px 20px', borderRadius: '12px 12px 0 0', borderBottom: `2px solid ${T.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: `${T.gold}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Banknote size={16} color={T.gold} />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: 'white', margin: 0 }}>Bulk Payment Processing</h3>
                  <p style={{ fontSize: 11, color: T.textMuted, margin: 0 }}>
                    Processing <span style={{ color: T.gold, fontWeight: 700 }}>{selectedItems.length}</span> payments
                  </p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)}
                style={{ width: 30, height: 30, borderRadius: 6, border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Selected Summary */}
              <div style={{ background: `${T.navy}06`, border: `1.5px solid ${T.border}`, borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.navy, textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ListChecks size={13} color={T.gold} /> Selected Records
                </div>
                <div style={{ maxHeight: 80, overflowY: 'auto', marginBottom: 8, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {selectedItems.map((item, i) => (
                    <span key={i} style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 8px', background: `${T.navy}10`, color: T.navy, borderRadius: 5, fontSize: 11, fontWeight: 700, border: `1px solid ${T.navy}20` }}>
                      {item.uid}
                    </span>
                  ))}
                </div>
                <div style={{ textAlign: 'center', padding: '10px', background: `${T.success}10`, borderRadius: 8, border: `1px solid ${T.success}30` }}>
                  <span style={{ fontSize: 11, color: T.textMuted, display: 'block' }}>Total Amount</span>
                  <span style={{ fontSize: 20, fontWeight: 800, color: T.success }}>₹{formatAmount(totalAmount)}</span>
                </div>
              </div>

              {/* TDS Calculator */}
              <TDSCalculatorCard totalAmount={totalAmount} tdsAmount={formData.TDS_AMOUNT}
                onTdsChange={val => handleFormChange('TDS_AMOUNT', val)} />

              {/* Payment Status */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: T.navyLight, marginBottom: 6 }}>
                  Payment Status <span style={{ color: T.danger }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <select value={formData.STATUS_3} onChange={e => handleFormChange('STATUS_3', e.target.value)}
                    style={{ ...inputBase, paddingRight: 32, appearance: 'none', cursor: 'pointer' }}
                    onFocus={focusGold} onBlur={blurNormal}>
                    <option value="">-- Select Status --</option>
                    <option value="Done">💰 Done</option>
                    <option value="Rejected">❌ Rejected</option>
                  </select>
                  <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: T.textMuted, pointerEvents: 'none' }} />
                </div>
              </div>

              {/* Payment Mode */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: T.navyLight, marginBottom: 6 }}>
                  <CreditCard size={13} /> Payment Mode <span style={{ color: T.danger }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <select value={formData.PAYMENT_MODE_3} onChange={e => handleFormChange('PAYMENT_MODE_3', e.target.value)}
                    style={{ ...inputBase, paddingRight: 32, appearance: 'none', cursor: 'pointer' }}
                    onFocus={focusGold} onBlur={blurNormal}>
                    {paymentModeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: T.textMuted, pointerEvents: 'none' }} />
                </div>
              </div>

              {/* Bank */}
              <SearchableDropdown label="Bank Details" icon={Building2} options={uniqueBankNames}
                value={formData.BANK_DETAILS_3} onChange={v => handleFormChange('BANK_DETAILS_3', v)}
                placeholder={isBankLoading ? 'Loading...' : 'Search & select bank...'} accentColor={T.blue} required />
              {!uniqueBankNames.length && !isBankLoading && (
                <p style={{ fontSize: 11, color: T.orange, marginTop: -8 }}>⚠️ No banks found. Check API.</p>
              )}

              {/* Payment Ref & Date */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: T.navyLight, marginBottom: 6 }}>
                    <Receipt size={13} /> Payment Ref <span style={{ color: T.danger }}>*</span>
                  </label>
                  <input type="text" value={formData.PAYMENT_DETAILS_3}
                    onChange={e => handleFormChange('PAYMENT_DETAILS_3', e.target.value)}
                    placeholder="UTR / Reference no..."
                    style={inputBase} onFocus={focusGold} onBlur={blurNormal} />
                </div>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: T.navyLight, marginBottom: 6 }}>
                    <Calendar size={13} /> Payment Date <span style={{ color: T.danger }}>*</span>
                  </label>
                  <input type="date" value={formData.PAYMENT_DATE_3}
                    onChange={e => handleFormChange('PAYMENT_DATE_3', e.target.value)}
                    style={inputBase} onFocus={focusGold} onBlur={blurNormal} />
                </div>
              </div>

              {/* Receiver Name */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: T.navyLight, marginBottom: 6 }}>
                  <User size={13} /> Receiver Name <span style={{ color: T.danger }}>*</span>
                </label>
                <input type="text" value={formData.Receiver_Name}
                  onChange={e => handleFormChange('Receiver_Name', e.target.value)}
                  placeholder="Enter receiver name..."
                  style={inputBase} onFocus={focusGold} onBlur={blurNormal} />
              </div>

              {/* Remark */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: T.navyLight, marginBottom: 6 }}>
                  <MessageSquare size={13} /> Remark <span style={{ fontSize: 11, color: T.textMuted, fontWeight: 400 }}>(Optional)</span>
                </label>
                <textarea value={formData.Remark} onChange={e => handleFormChange('Remark', e.target.value)}
                  rows={3} placeholder="Enter payment remarks..."
                  style={{ ...inputBase, resize: 'vertical', minHeight: 70 }}
                  onFocus={focusGold} onBlur={blurNormal} />
              </div>

              {/* Info Note */}
              <div style={{ background: `${T.navy}06`, border: `1px solid ${T.navy}15`, borderRadius: 8, padding: '10px 12px', display: 'flex', gap: 8 }}>
                <span style={{ fontSize: 12 }}>ℹ️</span>
                <p style={{ fontSize: 11, color: T.navyLight, margin: 0 }}>
                  Same details applied to all <strong>{selectedItems.length}</strong> records. TDS & Net Amount on <strong>last selected</strong> only.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '14px 20px', borderTop: `1px solid ${T.border}`, background: T.borderLight, display: 'flex', gap: 10, borderRadius: '0 0 12px 12px' }}>
              <button onClick={() => setShowModal(false)}
                style={{ flex: 1, padding: '10px', borderRadius: 8, border: `1.5px solid ${T.border}`, background: T.card, color: T.textLight, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleSubmit}
                disabled={isSubmitting || isTdsInvalid || !formData.STATUS_3 || !formData.PAYMENT_MODE_3 || !formData.BANK_DETAILS_3 || !formData.PAYMENT_DETAILS_3 || !formData.PAYMENT_DATE_3 || !formData.Receiver_Name}
                style={{
                  flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '10px', borderRadius: 8, border: 'none',
                  background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`,
                  color: T.gold, fontSize: 13, fontWeight: 800, cursor: 'pointer',
                  boxShadow: `0 2px 10px ${T.navy}40`,
                  opacity: (isSubmitting || isTdsInvalid || !formData.STATUS_3 || !formData.PAYMENT_MODE_3 || !formData.BANK_DETAILS_3 || !formData.PAYMENT_DETAILS_3 || !formData.PAYMENT_DATE_3 || !formData.Receiver_Name) ? 0.5 : 1,
                }}>
                {isSubmitting
                  ? <><Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> Processing {selectedItems.length}...</>
                  : <>
                    <BadgeCheck size={15} />
                    Confirm Payment ({selectedItems.length})
                    {tdsValue > 0 && (
                      <span style={{ fontSize: 10, background: `${T.gold}25`, padding: '2px 7px', borderRadius: 20, color: T.goldLight }}>
                        Net ₹{formatAmount(netAmount)}
                      </span>
                    )}
                  </>
                }
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SitePaidAmount;
