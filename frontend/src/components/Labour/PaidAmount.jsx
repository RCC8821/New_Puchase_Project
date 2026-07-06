

// import React, { useState, useEffect, useRef, useMemo } from 'react';
// import { 
//   useGetPaidStepQuery, 
//   usePostLabourPaidMutation,
//   useGetProjectDropdownQuery
// } from '../../redux/Labour/LabourSlice';
// import { 
//   Loader2, 
//   RefreshCw, 
//   User, 
//   Calendar, 
//   Users,
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
//   IndianRupee,
//   Building2,
//   HardHat,
//   MessageSquare,
//   CreditCard,
//   Receipt,
//   BadgeCheck,
//   CircleDollarSign,
//   ListChecks,
//   Check,
//   ChevronUp,
//   XCircle,
//   ExternalLink,
//   Tag,
//   BadgeDollarSign
// } from 'lucide-react';

// // ========== Helper Functions ==========
// const formatAmount = (value) => {
//   if (value == null || value === '') return '0';
//   const cleaned = String(value).replace(/[^0-9.-]/g, '');
//   const num = parseFloat(cleaned);
//   if (isNaN(num)) return '0';
//   return num.toLocaleString('en-IN', {
//     maximumFractionDigits: 0,
//     minimumFractionDigits: 0
//   });
// };

// // ========== Searchable Dropdown ==========
// const SearchableDropdown = ({ 
//   label, 
//   icon: Icon, 
//   options = [], 
//   value, 
//   onChange, 
//   placeholder,
//   color = 'amber',
//   required = false,
//   disabled = false
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
//     amber:  { bg: 'bg-amber-50',  text: 'text-amber-700',  hover: 'hover:bg-amber-100',  selected: 'bg-amber-100 text-amber-800',  ring: 'ring-amber-200',  border: 'border-amber-500'  },
//     purple: { bg: 'bg-purple-50', text: 'text-purple-700', hover: 'hover:bg-purple-100', selected: 'bg-purple-100 text-purple-800', ring: 'ring-purple-200', border: 'border-purple-500' },
//     green:  { bg: 'bg-green-50',  text: 'text-green-700',  hover: 'hover:bg-green-100',  selected: 'bg-green-100 text-green-800',  ring: 'ring-green-200',  border: 'border-green-500'  },
//     blue:   { bg: 'bg-blue-50',   text: 'text-blue-700',   hover: 'hover:bg-blue-100',   selected: 'bg-blue-100 text-blue-800',   ring: 'ring-blue-200',   border: 'border-blue-500'   },
//     rose:   { bg: 'bg-rose-50',   text: 'text-rose-700',   hover: 'hover:bg-rose-100',   selected: 'bg-rose-100 text-rose-800',   ring: 'ring-rose-200',   border: 'border-rose-500'   },
//     indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', hover: 'hover:bg-indigo-100', selected: 'bg-indigo-100 text-indigo-800', ring: 'ring-indigo-200', border: 'border-indigo-500' },
//   };

//   const colors = colorClasses[color] || colorClasses.amber;

//   if (disabled) {
//     return (
//       <div>
//         {label && (
//           <label className="block text-sm font-semibold text-gray-400 mb-2 flex items-center gap-2">
//             {Icon && <Icon className="w-4 h-4" />}
//             {label}
//             {required && <span className="text-red-500">*</span>}
//           </label>
//         )}
//         <div className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-100 text-gray-400 cursor-not-allowed">
//           {placeholder}
//         </div>
//       </div>
//     );
//   }

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
//                   className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
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

// // ========== VIEW MODES ==========
// const VIEW_MODE = {
//   LIST: 'list',
//   BILL: 'bill',
// };

// // ========== Bill Payment Page ==========
// const BillPaymentPage = ({
//   billNo,
//   billItems,
//   onBack,
//   postPaid,
//   isSubmitting,
//   refetch,
//   uniqueBankNames,
//   isBankLoading,
// }) => {
//   const selectedItems = billItems;
//   const [showModal, setShowModal] = useState(true);

//   const [formData, setFormData] = useState({
//     Status_5: '',
//     Paid_Amount_5: '',
//     TDS_Amount_5: '',
//     Net_Amount_5: '',
//     PAYMENT_MODE_5: '',
//     BANK_DETAILS_5: '',
//     PAYMENT_DETAILS_5: '',
//     Payment_Date_5: new Date().toISOString().split('T')[0],
//     Remark_5: ''
//   });

//   const isRejected = formData.Status_5 === 'Reject';
//   const lastItem = selectedItems[selectedItems.length - 1];

//   const paymentModeOptions = [
//     { value: '', label: '-- Select Payment Mode --' },
//     { value: 'Cheque', label: '📄 Cheque' },
//     { value: 'Cash', label: '💵 Cash' },
//     { value: 'NEFT', label: '📱 NEFT' },
//     { value: 'RTGS', label: '📋 RTGS' },
//   ];

//   const getTotalAmount = () =>
//     selectedItems.reduce((sum, item) => {
//       const val = String(item.Revised_Company_Head_Amount_4 || '0').replace(/[^0-9.-]/g, '');
//       return sum + (parseFloat(val) || 0);
//     }, 0);

//   const handleFormChange = (field, value) => {
//     setFormData(prev => {
//       const newData = { ...prev, [field]: value };

//       if (field === 'TDS_Amount_5') {
//         const paidAmt = parseFloat(newData.Paid_Amount_5) || getTotalAmount();
//         const tds = parseFloat(value) || 0;
//         const net = paidAmt - tds;
//         newData.Net_Amount_5 = net >= 0 ? String(net) : '0';
//       }

//       if (field === 'Paid_Amount_5') {
//         const paidAmt = parseFloat(value) || 0;
//         const tds = parseFloat(newData.TDS_Amount_5) || 0;
//         const net = paidAmt - tds;
//         newData.Net_Amount_5 = net >= 0 ? String(net) : '0';
//       }

//       if (field === 'Status_5' && value === 'Reject') {
//         newData.PAYMENT_MODE_5 = '';
//         newData.BANK_DETAILS_5 = '';
//         newData.PAYMENT_DETAILS_5 = '';
//         newData.Paid_Amount_5 = '';
//         newData.TDS_Amount_5 = '';
//         newData.Net_Amount_5 = '';
//         newData.Payment_Date_5 = new Date().toISOString().split('T')[0];
//       }

//       return newData;
//     });
//   };

//   // ✅ UPDATED: Paid_Amount_5 required add kiya
//   const isSubmitDisabled = () => {
//     if (!formData.Status_5) return true;
//     if (formData.Status_5 === 'Reject') return false;
//     if (!formData.Paid_Amount_5) return true;
//     if (!formData.PAYMENT_MODE_5) return true;
//     if (!formData.BANK_DETAILS_5) return true;
//     if (!formData.PAYMENT_DETAILS_5.trim()) return true;
//     if (!formData.Payment_Date_5) return true;
//     return false;
//   };

//   // ✅ UPDATED: Paid_Amount_5 validation add kiya
//   const handleSubmit = async () => {
//     if (!formData.Status_5) return alert('Please select Payment Status');
//     if (formData.Status_5 !== 'Reject') {
//       if (!formData.Paid_Amount_5) return alert('Please enter Paid Amount');
//       if (!formData.PAYMENT_MODE_5) return alert('Please select Payment Mode');
//       if (!formData.BANK_DETAILS_5) return alert('Please select Bank');
//       if (!formData.PAYMENT_DETAILS_5.trim()) return alert('Please enter Payment Details / Reference');
//       if (!formData.Payment_Date_5) return alert('Please select Payment Date');
//     }

//     let success = 0, failed = 0;
//     const errors = [];

//     for (let i = 0; i < selectedItems.length; i++) {
//       const item = selectedItems[i];
//       const isLastItem = i === selectedItems.length - 1;

//       try {
//         let payload = {
//           uid: item.uid,
//           isLastUID: isLastItem,
//           Status_5: isLastItem ? formData.Status_5 : 'Done',
//         };

//         if (isLastItem && formData.Status_5 !== 'Reject') {
//           payload.Paid_Amount_5    = formData.Paid_Amount_5    || '';
//           payload.TDS_Amount_5     = formData.TDS_Amount_5     || '';
//           payload.Net_Amount_5     = formData.Net_Amount_5     || '';
//           payload.PAYMENT_MODE_5   = formData.PAYMENT_MODE_5;
//           payload.BANK_DETAILS_5   = formData.BANK_DETAILS_5;
//           payload.PAYMENT_DETAILS_5 = formData.PAYMENT_DETAILS_5;
//           payload.Payment_Date_5   = formData.Payment_Date_5;
//           payload.Remark_5         = formData.Remark_5 || '';
//         } else if (isLastItem && formData.Status_5 === 'Reject') {
//           payload.Remark_5 = formData.Remark_5 || '';
//         }

//         console.log(`Payload for ${item.uid} (isLast: ${isLastItem}):`, payload);

//         const result = await postPaid(payload).unwrap();
//         if (result?.success) {
//           success++;
//         } else {
//           failed++;
//           errors.push(`${item.uid}: ${result?.message || 'Unknown error'}`);
//         }
//       } catch (err) {
//         console.error(err);
//         if (err?.status === 500 && err?.data?.error?.includes('null')) {
//           success++;
//         } else {
//           failed++;
//           errors.push(`${item.uid}: ${err?.data?.message || err?.message || 'Failed'}`);
//         }
//       }
//     }

//     let message = '';
//     if (success > 0 && failed === 0) {
//       message = formData.Status_5 === 'Reject'
//         ? `✅ Rejection Successful!\nTotal: ${success} records\nLast UID (${lastItem?.uid}) rejected\nOthers marked Done with "-"`
//         : `✅ Payment Successful!\nTotal: ${success} records\nAmount: ₹${formatAmount(getTotalAmount())}${
//             formData.TDS_Amount_5 ? `\nTDS: ₹${formatAmount(formData.TDS_Amount_5)}` : ''
//           }${
//             formData.Net_Amount_5 ? `\nNet: ₹${formatAmount(formData.Net_Amount_5)}` : ''
//           }\nPayment details saved in: ${lastItem?.uid}\nOthers: Done with "-"`;
//     } else if (success > 0) {
//       message = `⚠️ Partial Success\nSuccess: ${success}\nFailed: ${failed}\n\nErrors:\n${errors.join('\n')}`;
//     } else {
//       message = `❌ Failed\n${failed} errors\n\n${errors.join('\n')}`;
//     }

//     alert(message);
//     setShowModal(false);
//     refetch();
//     onBack();
//   };

//   const handleModalClose = () => {
//     setShowModal(false);
//     onBack();
//   };

//   const paidNames = [...new Set(billItems.map(i => i.Paid_Name).filter(Boolean))];
//   const billUrl = billItems.find(i => i.Bill_Url)?.Bill_Url || '';

//   return (
//     <div className="space-y-6 p-4 bg-gray-50 min-h-screen">

//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div className="flex items-center gap-3">
//           <button onClick={onBack} className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
//             <ChevronDown className="w-5 h-5 text-gray-600 rotate-90" />
//           </button>
//           <div>
//             <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
//               <Receipt className="w-7 h-7 text-amber-600" />
//               Bill Payment — <span className="text-amber-600">{billNo}</span>
//             </h2>
//             <p className="text-gray-500 mt-1">
//               {billItems.length} record(s) under this bill
//               {paidNames.length > 0 && (
//                 <span className="ml-2 text-indigo-600 font-medium">• Paid To: {paidNames.join(', ')}</span>
//               )}
//             </p>
//           </div>
//         </div>
//         {billUrl && (
//           <a href={billUrl} target="_blank" rel="noopener noreferrer"
//             className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors">
//             <ExternalLink className="w-4 h-4" /> View Bill
//           </a>
//         )}
//       </div>

//       {/* Bill Info Banner */}
//       <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-4">
//         <div className="flex flex-wrap gap-6">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
//               <Tag className="w-5 h-5 text-indigo-600" />
//             </div>
//             <div>
//               <p className="text-xs text-gray-500">Bill Number</p>
//               <p className="font-bold text-indigo-700 text-lg">{billNo}</p>
//             </div>
//           </div>
//           {paidNames.length > 0 && (
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
//                 <User className="w-5 h-5 text-purple-600" />
//               </div>
//               <div>
//                 <p className="text-xs text-gray-500">Paid Name(s)</p>
//                 <p className="font-bold text-purple-700">{paidNames.join(', ')}</p>
//               </div>
//             </div>
//           )}
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
//               <FileText className="w-5 h-5 text-amber-600" />
//             </div>
//             <div>
//               <p className="text-xs text-gray-500">Total Records</p>
//               <p className="font-bold text-amber-700">{billItems.length}</p>
//             </div>
//           </div>
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
//               <IndianRupee className="w-5 h-5 text-green-600" />
//             </div>
//             <div>
//               <p className="text-xs text-gray-500">Total Bill Amount</p>
//               <p className="font-bold text-green-700 text-lg">₹{formatAmount(getTotalAmount())}</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Cards */}
//       <div>
//         <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
//           <ListChecks className="w-4 h-4 text-amber-600" />
//           All {billItems.length} records — Last UID gets payment details, others get "Done" + "-"
//         </h3>
//         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
//           {billItems.map((item, index) => {
//             const isLast = index === billItems.length - 1;
//             return (
//               <div key={item.uid || index}
//                 className={`relative bg-white rounded-2xl shadow-sm border-2 ring-2 ${
//                   isLast ? 'border-green-400 ring-green-100' : 'border-amber-400 ring-amber-100'
//                 }`}>
//                 <div className="absolute top-4 right-4 flex items-center gap-1">
//                   {isLast ? (
//                     <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-medium">
//                       📌 Payment Here
//                     </span>
//                   ) : (
//                     <span className="text-xs bg-gray-400 text-white px-2 py-0.5 rounded-full font-medium">
//                       Done + "-"
//                     </span>
//                   )}
//                   <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
//                     isLast ? 'bg-green-500' : 'bg-amber-500'
//                   } text-white`}>
//                     <Check className="w-4 h-4" />
//                   </div>
//                 </div>

//                 <div className={`p-4 rounded-t-2xl ${isLast ? 'bg-green-50' : 'bg-amber-50'}`}>
//                   <div className="flex items-start gap-3">
//                     <div className={`w-12 h-12 bg-gradient-to-br ${
//                       isLast ? 'from-green-400 to-emerald-500' : 'from-amber-400 to-orange-500'
//                     } rounded-xl flex items-center justify-center flex-shrink-0`}>
//                       <span className="text-white font-bold text-lg">
//                         {item.projectName?.charAt(0)?.toUpperCase() || 'P'}
//                       </span>
//                     </div>
//                     <div className="flex-1 min-w-0 pr-28">
//                       <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold mb-1">
//                         <Hash className="w-3 h-3 mr-1" />{item.uid}
//                       </span>
//                       <h3 className="font-semibold text-gray-800 truncate">{item.projectName || 'N/A'}</h3>
//                       <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
//                         <Clock className="w-3 h-3" />
//                         <span>Planned: {item.planned5 || 'N/A'}</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="p-4 space-y-3">
//                   <div className="grid grid-cols-2 gap-3 text-sm">
//                     <div className="flex items-center gap-2">
//                       <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
//                         <User className="w-4 h-4 text-blue-600" />
//                       </div>
//                       <div className="min-w-0">
//                         <p className="text-xs text-gray-400">Engineer</p>
//                         <p className="font-medium text-gray-700 truncate">{item.projectEngineer || 'N/A'}</p>
//                       </div>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
//                         <HardHat className="w-4 h-4 text-green-600" />
//                       </div>
//                       <div className="min-w-0">
//                         <p className="text-xs text-gray-400">Contractor</p>
//                         <p className="font-medium text-gray-700 truncate">{item.Labouar_Contractor_Name_3 || 'N/A'}</p>
//                       </div>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
//                         <Wrench className="w-4 h-4 text-orange-600" />
//                       </div>
//                       <div className="min-w-0">
//                         <p className="text-xs text-gray-400">Work Type</p>
//                         <p className="font-medium text-gray-700 truncate">{item.workType || 'N/A'}</p>
//                       </div>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
//                         <Users className="w-4 h-4 text-purple-600" />
//                       </div>
//                       <div className="min-w-0">
//                         <p className="text-xs text-gray-400">Total Labour</p>
//                         <p className="font-medium text-gray-700">{item.totalLabour || '0'}</p>
//                       </div>
//                     </div>
//                   </div>

//                   {item.Paid_Name && (
//                     <div className="flex items-center gap-2 bg-indigo-50 rounded-lg px-3 py-2">
//                       <User className="w-4 h-4 text-indigo-500 flex-shrink-0" />
//                       <div className="min-w-0">
//                         <p className="text-xs text-indigo-500">Paid Name</p>
//                         <p className="font-semibold text-indigo-700 truncate">{item.Paid_Name}</p>
//                       </div>
//                     </div>
//                   )}

//                   {(item.Bill_No || item.Bill_Url) && (
//                     <div className="grid grid-cols-2 gap-2">
//                       {item.Bill_No && (
//                         <div className="flex items-center gap-2 bg-rose-50 rounded-lg px-3 py-2">
//                           <Receipt className="w-4 h-4 text-rose-500 flex-shrink-0" />
//                           <div className="min-w-0">
//                             <p className="text-xs text-rose-500">Bill No</p>
//                             <p className="font-semibold text-rose-700 truncate text-sm">{item.Bill_No}</p>
//                           </div>
//                         </div>
//                       )}
//                       {item.Bill_Url && (
//                         <a href={item.Bill_Url} target="_blank" rel="noopener noreferrer"
//                           className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 rounded-lg px-3 py-2 transition-colors">
//                           <ExternalLink className="w-4 h-4 text-blue-500 flex-shrink-0" />
//                           <div className="min-w-0">
//                             <p className="text-xs text-blue-500">Bill URL</p>
//                             <p className="font-semibold text-blue-700 text-xs">View Bill</p>
//                           </div>
//                         </a>
//                       )}
//                     </div>
//                   )}

//                   <div className="border-t border-gray-100 pt-3">
//                     <div className="bg-purple-50 rounded-lg p-2">
//                       <p className="text-xs text-purple-600">🏢 Paid Amount</p>
//                       <p className="font-bold text-purple-700">₹{formatAmount(item.Revised_Company_Head_Amount_4)}</p>
//                     </div>
//                   </div>

//                   <div className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-3 py-2">
//                     <span className="text-gray-500">Cat1 - {item.Deployed_Category_1_Labour_No_4 || '0'}</span>
//                     <span className="text-gray-400">|</span>
//                     <span className="text-gray-500">Cat2 - {item.Deployed_Category_2_Labour_No_4 || '0'}</span>
//                   </div>

//                   {isLast ? (
//                     <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
//                       <p className="text-xs text-green-600 font-medium">
//                         📌 All payment details will be saved in this record
//                       </p>
//                     </div>
//                   ) : (
//                     <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-center">
//                       <p className="text-xs text-gray-500 font-medium">
//                         ✅ Status = Done | BP→BW = "-"
//                       </p>
//                     </div>
//                   )}
//                 </div>

//                 <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${
//                   isLast ? 'from-green-400 to-emerald-500' : 'from-amber-400 to-orange-500'
//                 } rounded-b-2xl`} />
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       {/* ========== Payment Modal ========== */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] flex flex-col">

//             {/* Modal Header */}
//             <div className="flex-shrink-0 p-4 sm:p-6 border-b bg-gradient-to-r from-amber-50 to-orange-50 rounded-t-2xl">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
//                     <CircleDollarSign className="w-5 h-5 text-amber-600" />
//                     Bulk Payment Processing
//                   </h3>
//                   <p className="text-xs sm:text-sm text-gray-500 mt-1">
//                     Bill: <span className="font-semibold text-indigo-600">{billNo}</span>
//                     {' '}• <span className="font-semibold text-amber-600">{selectedItems.length}</span> records
//                     {' '}• Payment saves in: <span className="font-semibold text-green-600">{lastItem?.uid}</span>
//                   </p>
//                 </div>
//                 <button onClick={handleModalClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
//                   <X className="w-5 h-5 text-gray-500" />
//                 </button>
//               </div>
//             </div>

//             {/* Modal Body */}
//             <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">

//               {/* Summary */}
//               <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
//                 <h4 className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-3 flex items-center gap-2">
//                   <ListChecks className="w-4 h-4" />
//                   Records Summary
//                 </h4>
//                 <div className="max-h-24 overflow-y-auto mb-3 bg-white rounded-lg p-2 border border-amber-100">
//                   <div className="flex flex-wrap gap-2">
//                     {selectedItems.map((item, i) => {
//                       const isLast = i === selectedItems.length - 1;
//                       return (
//                         <span key={item.uid || i}
//                           className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
//                             isLast ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-gray-100 text-gray-600'
//                           }`}>
//                           {item.uid}
//                           {isLast && <span className="ml-1 font-bold" title="Payment saves here">📌</span>}
//                           {!isLast && <span className="ml-1 text-gray-400">→ Done + "-"</span>}
//                         </span>
//                       );
//                     })}
//                   </div>
//                 </div>
//                 <div className="bg-white p-3 rounded-lg border border-amber-100 text-center">
//                   <span className="text-xs text-gray-500 block">Total Amount</span>
//                   <p className="font-bold text-amber-800 text-xl mt-1">₹{formatAmount(getTotalAmount())}</p>
//                 </div>
//               </div>

//               {/* Column Mapping Info */}
//               {/* <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
//                 <p className="text-xs font-semibold text-blue-700 mb-2">📋 Sheet Column Mapping</p>
//                 <div className="grid grid-cols-3 gap-1 text-xs text-blue-600">
//                   <span>BN → Status</span>
//                   <span>BP → Paid Amt</span>
//                   <span>BQ → TDS</span>
//                   <span>BR → Net Amt</span>
//                   <span>BS → Pay Mode</span>
//                   <span>BT → Bank</span>
//                   <span>BU → Pay Details</span>
//                   <span>BV → Pay Date</span>
//                   <span>BW → Remark</span>
//                 </div>
//                 <p className="text-xs text-blue-500 mt-1">⚠️ BO (Time_Delay) skipped — not updated</p>
//               </div> */}

//               {/* Status */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Payment Status <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <select value={formData.Status_5}
//                     onChange={e => handleFormChange('Status_5', e.target.value)}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 appearance-none bg-white cursor-pointer">
//                     <option value="">-- Select Status --</option>
//                     <option value="Done">✅ Done</option>
//                     <option value="Reject">❌ Reject</option>
//                   </select>
//                   <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
//                 </div>
//               </div>

//               {/* Rejection Banner */}
//               {isRejected && (
//                 <div className="p-4 bg-red-50 rounded-xl border border-red-200 animate-fadeIn">
//                   <div className="flex items-center gap-2 text-red-700">
//                     <XCircle className="w-5 h-5" />
//                     <span className="text-sm font-semibold">Rejection Mode</span>
//                   </div>
//                   <p className="text-xs text-red-600 mt-2">
//                     Last UID ({lastItem?.uid}) → BN=Reject, BP→BW="-", BW=Remark<br/>
//                     Other UIDs → BN=Done, BP→BW="-"
//                   </p>
//                 </div>
//               )}

//               {/* Payment Fields — only when NOT rejected */}
//               {!isRejected && (
//                 <>
//                   {/* Payment Mode */}
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 mb-2">
//                       <CreditCard className="w-4 h-4 inline mr-1" />
//                       Payment Mode <span className="text-red-500">*</span>
//                       <span className="text-xs text-gray-400 ml-1 font-normal">(BS)</span>
//                     </label>
//                     <div className="relative">
//                       <select value={formData.PAYMENT_MODE_5}
//                         onChange={e => handleFormChange('PAYMENT_MODE_5', e.target.value)}
//                         className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 appearance-none bg-white cursor-pointer">
//                         {paymentModeOptions.map(opt => (
//                           <option key={opt.value} value={opt.value}>{opt.label}</option>
//                         ))}
//                       </select>
//                       <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
//                     </div>
//                   </div>

//                   {/* Bank — BT */}
//                   <SearchableDropdown
//                     label="Bank Details (BT)"
//                     icon={Building2}
//                     options={uniqueBankNames}
//                     value={formData.BANK_DETAILS_5}
//                     onChange={val => handleFormChange('BANK_DETAILS_5', val)}
//                     placeholder={isBankLoading ? "Loading banks..." : "Search & select bank..."}
//                     color="blue"
//                     required={true}
//                   />

//                   {/* Payment Details (BU) & Date (BV) */}
//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-semibold text-gray-700 mb-2">
//                         <Receipt className="w-4 h-4 inline mr-1" />
//                         Payment Details <span className="text-red-500">*</span>
//                         <span className="text-xs text-gray-400 ml-1 font-normal">(BU)</span>
//                       </label>
//                       <input type="text" value={formData.PAYMENT_DETAILS_5}
//                         onChange={e => handleFormChange('PAYMENT_DETAILS_5', e.target.value)}
//                         placeholder="Transaction/Reference no..."
//                         className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 ${
//                           !formData.PAYMENT_DETAILS_5.trim() ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
//                         }`} />
//                       {!formData.PAYMENT_DETAILS_5.trim() && (
//                         <p className="text-xs text-red-500 mt-1">⚠️ Required</p>
//                       )}
//                     </div>
//                     <div>
//                       <label className="block text-sm font-semibold text-gray-700 mb-2">
//                         <Calendar className="w-4 h-4 inline mr-1" />
//                         Payment Date <span className="text-red-500">*</span>
//                         <span className="text-xs text-gray-400 ml-1 font-normal">(BV)</span>
//                       </label>
//                       <input type="date" value={formData.Payment_Date_5}
//                         onChange={e => handleFormChange('Payment_Date_5', e.target.value)}
//                         className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 ${
//                           !formData.Payment_Date_5 ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
//                         }`} />
//                       {!formData.Payment_Date_5 && (
//                         <p className="text-xs text-red-500 mt-1">⚠️ Required</p>
//                       )}
//                     </div>
//                   </div>

//                   {/* ✅ Amount Details — BP (Required), BQ, BR */}
//                   <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
//                     <div className="flex items-center gap-2 mb-1">
//                       <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
//                         <IndianRupee className="w-3 h-3 text-white" />
//                       </div>
//                       <h4 className="text-sm font-semibold text-green-800">Amount Details</h4>
//                       <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
//                         📌 Saves in: <span className="font-bold">{lastItem?.uid}</span>
//                       </span>
//                     </div>

//                     <div className="grid grid-cols-3 gap-3">

//                       {/* ✅ Paid Amount — BP — REQUIRED */}
//                       <div>
//                         <label className="block text-sm font-semibold text-gray-700 mb-2">
//                           <IndianRupee className="w-4 h-4 inline mr-1 text-green-600" />
//                           Paid Amt <span className="text-red-500">*</span>
//                           <span className="text-xs text-gray-400 ml-1">(BP)</span>
//                         </label>
//                         <div className="relative">
//                           <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
//                           <input
//                             type="number"
//                             min="0"
//                             value={formData.Paid_Amount_5}
//                             onChange={e => handleFormChange('Paid_Amount_5', e.target.value)}
//                             placeholder={formatAmount(getTotalAmount())}
//                             className={`w-full pl-7 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors ${
//                               !formData.Paid_Amount_5
//                                 ? 'border-red-300 bg-red-50'
//                                 : 'border-green-300 bg-white'
//                             }`}
//                           />
//                         </div>
//                         {/* ✅ Error message */}
//                         {!formData.Paid_Amount_5 && (
//                           <p className="text-xs text-red-500 mt-1">⚠️ Required</p>
//                         )}
//                       </div>

//                       {/* TDS Amount — BQ */}
//                       <div>
//                         <label className="block text-sm font-semibold text-gray-700 mb-2">
//                           <BadgeDollarSign className="w-4 h-4 inline mr-1 text-green-600" />
//                           TDS Amt <span className="text-xs text-gray-400">(BQ)</span>
//                         </label>
//                         <div className="relative">
//                           <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
//                           <input
//                             type="number"
//                             min="0"
//                             value={formData.TDS_Amount_5}
//                             onChange={e => handleFormChange('TDS_Amount_5', e.target.value)}
//                             placeholder="0"
//                             className="w-full pl-7 pr-4 py-3 border border-green-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
//                           />
//                         </div>
//                         {formData.TDS_Amount_5 && (
//                           <p className="text-xs text-green-600 mt-1">BP - BQ = BR</p>
//                         )}
//                       </div>

//                       {/* Net Amount — BR (Auto) */}
//                       <div>
//                         <label className="block text-sm font-semibold text-gray-700 mb-2">
//                           <IndianRupee className="w-4 h-4 inline mr-1 text-green-600" />
//                           Net Amt <span className="text-xs text-green-600">(BR • Auto)</span>
//                         </label>
//                         <div className="relative">
//                           <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
//                           <input
//                             type="number"
//                             min="0"
//                             value={formData.Net_Amount_5}
//                             onChange={e => handleFormChange('Net_Amount_5', e.target.value)}
//                             placeholder={formatAmount(getTotalAmount())}
//                             className="w-full pl-7 pr-4 py-3 border border-green-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 bg-green-50"
//                           />
//                         </div>
//                         <p className="text-xs text-gray-400 mt-1">Auto = BP - BQ</p>
//                       </div>
//                     </div>
//                   </div>
//                 </>
//               )}

//               {/* Remark — BW */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   <MessageSquare className="w-4 h-4 inline mr-1" />
//                   Remark <span className="text-gray-400 font-normal">(Optional • BW)</span>
//                 </label>
//                 <textarea value={formData.Remark_5}
//                   onChange={e => handleFormChange('Remark_5', e.target.value)}
//                   rows={3}
//                   placeholder={isRejected ? "Enter reason for rejection..." : "Enter any payment remarks..."}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none" />
//               </div>

//               {/* Flow Note */}
//               <div className={`p-3 rounded-lg border ${isRejected ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
//                 <p className={`text-xs ${isRejected ? 'text-red-700' : 'text-blue-700'}`}>
//                   {isRejected ? (
//                     <>
//                       <strong>⚠️ Reject Flow:</strong><br/>
//                       • All other UIDs → BN=Done, BP→BW="-"<br/>
//                       • Last UID ({lastItem?.uid}) → BN=Reject, BP→BV="-", BW=Remark
//                     </>
//                   ) : (
//                     <>
//                       <strong>ℹ️ Payment Flow:</strong><br/>
//                       {/* • All other UIDs → BN=Done, BP→BW="-"<br/>
//                       • Last UID ({lastItem?.uid}) → BN=Done, BP=Paid, BQ=TDS, BR=Net, BS=Mode, BT=Bank, BU=Details, BV=Date, BW=Remark */}
//                     </>
//                   )}
//                 </p>
//               </div>
//             </div>

//             {/* Modal Footer */}
//             <div className="flex-shrink-0 p-4 sm:p-6 border-t bg-gray-50 flex gap-3 justify-end rounded-b-2xl">
//               <button onClick={handleModalClose}
//                 className="px-4 sm:px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-medium">
//                 Cancel
//               </button>
//               <button onClick={handleSubmit}
//                 disabled={isSubmitting || isSubmitDisabled()}
//                 className={`px-4 sm:px-6 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 
//                   disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg ${
//                   isRejected
//                     ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600'
//                     : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600'
//                 }`}>
//                 {isSubmitting ? (
//                   <><Loader2 className="w-4 h-4 animate-spin" /><span>Processing {selectedItems.length}...</span></>
//                 ) : (
//                   <>
//                     {isRejected ? <XCircle className="w-4 h-4" /> : <BadgeCheck className="w-4 h-4" />}
//                     <span>{isRejected ? `Reject (${selectedItems.length})` : `Confirm Payment (${selectedItems.length})`}</span>
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <style>{`
//         @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
//         .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
//       `}</style>
//     </div>
//   );
// };


// // ========== Main Component ==========
// const PaidAmount = () => {
//   const { data: rawPaidData, isLoading, isError, error, refetch, isFetching } = useGetPaidStepQuery();

//   const paidData = useMemo(() => {
//     if (!rawPaidData) return [];
//     if (Array.isArray(rawPaidData)) return rawPaidData;
//     if (Array.isArray(rawPaidData?.data)) return rawPaidData.data;
//     return [];
//   }, [rawPaidData]);

//   const [postPaid, { isLoading: isSubmitting }] = usePostLabourPaidMutation();
//   const { data: bankList = [], isLoading: isBankLoading } = useGetProjectDropdownQuery();

//   const [viewMode, setViewMode] = useState(VIEW_MODE.LIST);
//   const [activeBillNo, setActiveBillNo] = useState('');

//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedProject, setSelectedProject] = useState('');
//   const [selectedContractor, setSelectedContractor] = useState('');
//   const [selectedBillNo, setSelectedBillNo] = useState('');
//   const [selectedPaidName, setSelectedPaidName] = useState('');

//   const uniqueProjectNames = useMemo(() => {
//     if (!paidData.length) return [];
//     return [...new Set(paidData.map(i => i.projectName).filter(Boolean))].sort();
//   }, [paidData]);

//   const uniqueContractorNames = useMemo(() => {
//     if (!paidData.length) return [];
//     return [...new Set(paidData.map(i => i.Labouar_Contractor_Name_3).filter(Boolean))].sort();
//   }, [paidData]);

//   const uniqueBillNumbers = useMemo(() => {
//     if (!paidData.length) return [];
//     return [...new Set(paidData.map(i => i.Bill_No).filter(Boolean))].sort();
//   }, [paidData]);

//   const uniquePaidNames = useMemo(() => {
//     if (!paidData.length) return [];
//     return [...new Set(paidData.map(i => i.Paid_Name).filter(Boolean))].sort();
//   }, [paidData]);

//   const uniqueBankNames = useMemo(() => {
//     if (!bankList || !Array.isArray(bankList)) return [];
//     const names = bankList
//       .map(item => item['extraField'] || item.bankName || item.name || item.bank_name || '')
//       .filter(name => name && typeof name === 'string' && name.trim() !== '');
//     return [...new Set(names)].sort();
//   }, [bankList]);

//   const filteredData = useMemo(() => {
//     if (!paidData.length) return [];
//     return paidData.filter(item => {
//       const searchLower = searchTerm.toLowerCase();
//       const matchesSearch = !searchTerm || (
//         (item.uid || '').toLowerCase().includes(searchLower) ||
//         (item.projectName || '').toLowerCase().includes(searchLower) ||
//         (item.Labouar_Contractor_Name_3 || '').toLowerCase().includes(searchLower) ||
//         (item.projectEngineer || '').toLowerCase().includes(searchLower) ||
//         (item.workDescription || '').toLowerCase().includes(searchLower) ||
//         (item.workType || '').toLowerCase().includes(searchLower) ||
//         (item.Bill_No || '').toLowerCase().includes(searchLower) ||
//         (item.Paid_Name || '').toLowerCase().includes(searchLower)
//       );
//       const matchesProject    = !selectedProject    || item.projectName === selectedProject;
//       const matchesContractor = !selectedContractor || item.Labouar_Contractor_Name_3 === selectedContractor;
//       const matchesBillNo     = !selectedBillNo     || item.Bill_No === selectedBillNo;
//       const matchesPaidName   = !selectedPaidName   || item.Paid_Name === selectedPaidName;
//       return matchesSearch && matchesProject && matchesContractor && matchesBillNo && matchesPaidName;
//     });
//   }, [paidData, searchTerm, selectedProject, selectedContractor, selectedBillNo, selectedPaidName]);

//   const clearAllFilters = () => {
//     setSearchTerm('');
//     setSelectedProject('');
//     setSelectedContractor('');
//     setSelectedBillNo('');
//     setSelectedPaidName('');
//   };

//   const hasActiveFilters = searchTerm || selectedProject || selectedContractor || selectedBillNo || selectedPaidName;

//   const handleBillNoSelect = (billNo) => {
//     setSelectedBillNo(billNo);
//     if (billNo) {
//       setActiveBillNo(billNo);
//       setViewMode(VIEW_MODE.BILL);
//     }
//   };

//   const handleBackToList = () => {
//     setViewMode(VIEW_MODE.LIST);
//     setActiveBillNo('');
//     setSelectedBillNo('');
//   };

//   const billItems = useMemo(() => {
//     if (!activeBillNo) return [];
//     return paidData.filter(i => i.Bill_No === activeBillNo);
//   }, [paidData, activeBillNo]);

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="text-center">
//           <Loader2 className="w-12 h-12 animate-spin text-amber-600 mx-auto mb-4" />
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
//           <p className="text-red-500 text-sm mb-4">{error?.data?.message || 'Failed to fetch data'}</p>
//           <button onClick={refetch}
//             className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 mx-auto">
//             <RefreshCw className="w-4 h-4" /> Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (viewMode === VIEW_MODE.BILL && activeBillNo) {
//     return (
//       <BillPaymentPage
//         billNo={activeBillNo}
//         billItems={billItems}
//         onBack={handleBackToList}
//         postPaid={postPaid}
//         isSubmitting={isSubmitting}
//         refetch={refetch}
//         uniqueBankNames={uniqueBankNames}
//         isBankLoading={isBankLoading}
//       />
//     );
//   }

//   return (
//     <div className="space-y-6 p-4 bg-gray-50 min-h-screen">

//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div>
//           <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
//             <CircleDollarSign className="w-7 h-7 text-amber-600" />
//             Payment Processing
//           </h2>
//           <p className="text-gray-500 mt-1">
//             Use filters to find records • Select Bill No to process payment
//           </p>
//         </div>
//         <button onClick={refetch} disabled={isFetching}
//           className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors disabled:opacity-50">
//           <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} /> Refresh
//         </button>
//       </div>

//       {/* Filters */}
//       <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 space-y-4">
//         <div className="flex items-center justify-between">
//           <h3 className="font-semibold text-gray-700 flex items-center gap-2">
//             <Filter className="w-5 h-5 text-amber-600" /> Filters
//             <span className="text-xs text-gray-400 font-normal">(All work together)</span>
//           </h3>
//           {hasActiveFilters && (
//             <button onClick={clearAllFilters}
//               className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1">
//               <X className="w-4 h-4" /> Clear All
//             </button>
//           )}
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
//               <Search className="w-4 h-4" /> Search
//             </label>
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//               <input type="text" placeholder="Search UID, project, engineer..."
//                 value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
//                 className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white" />
//               {searchTerm && (
//                 <button onClick={() => setSearchTerm('')}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full">
//                   <X className="w-4 h-4 text-gray-400" />
//                 </button>
//               )}
//             </div>
//           </div>

//           <SearchableDropdown label="Project Name" icon={Building} options={uniqueProjectNames}
//             value={selectedProject} onChange={setSelectedProject} placeholder="Select project..." color="purple" />

//           <SearchableDropdown label="Labour Contractor" icon={HardHat} options={uniqueContractorNames}
//             value={selectedContractor} onChange={setSelectedContractor} placeholder="Select contractor..." color="green" />
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
//               <Receipt className="w-4 h-4 text-rose-500" /> Bill Number
//               <span className="text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full font-normal">Click to process</span>
//             </label>
//             <SearchableDropdown icon={Receipt} options={uniqueBillNumbers}
//               value={selectedBillNo} onChange={handleBillNoSelect}
//               placeholder="Select bill number to process..." color="rose" />
//           </div>

//           <SearchableDropdown label="Paid Name" icon={User} options={uniquePaidNames}
//             value={selectedPaidName} onChange={setSelectedPaidName} placeholder="Select paid name..." color="indigo" />
//         </div>

//         {hasActiveFilters && (
//           <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
//             <span className="text-xs text-gray-400 self-center">Active:</span>
//             {searchTerm && (
//               <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
//                 🔍 "{searchTerm}"
//                 <button onClick={() => setSearchTerm('')} className="ml-1"><X className="w-3 h-3" /></button>
//               </span>
//             )}
//             {selectedProject && (
//               <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
//                 <Building className="w-3 h-3" />{selectedProject}
//                 <button onClick={() => setSelectedProject('')} className="ml-1"><X className="w-3 h-3" /></button>
//               </span>
//             )}
//             {selectedContractor && (
//               <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
//                 <HardHat className="w-3 h-3" />{selectedContractor}
//                 <button onClick={() => setSelectedContractor('')} className="ml-1"><X className="w-3 h-3" /></button>
//               </span>
//             )}
//             {selectedBillNo && (
//               <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-medium">
//                 <Receipt className="w-3 h-3" />Bill: {selectedBillNo}
//                 <button onClick={() => setSelectedBillNo('')} className="ml-1"><X className="w-3 h-3" /></button>
//               </span>
//             )}
//             {selectedPaidName && (
//               <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
//                 <User className="w-3 h-3" />{selectedPaidName}
//                 <button onClick={() => setSelectedPaidName('')} className="ml-1"><X className="w-3 h-3" /></button>
//               </span>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Results count */}
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200">
//           <FileText className="w-5 h-5 text-gray-500" />
//           <span className="text-gray-600 font-medium">
//             Showing: <span className="text-amber-600 font-bold">{filteredData.length}</span>
//             <span className="text-gray-400"> of {paidData?.length || 0}</span>
//           </span>
//         </div>
//         <div className="text-xs text-gray-400 bg-white px-4 py-2 rounded-xl border border-gray-200">
//           💡 Select <span className="text-rose-500 font-semibold">Bill Number</span> to process payment
//         </div>
//       </div>

//       {/* Cards */}
//       {filteredData.length === 0 ? (
//         <div className="bg-white rounded-xl p-12 text-center border-2 border-dashed border-gray-200">
//           <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//           <p className="text-gray-500 text-lg font-medium">No records found</p>
//           <p className="text-gray-400 mt-1">{hasActiveFilters ? 'Try adjusting filters' : 'No data available'}</p>
//           {hasActiveFilters && (
//             <button onClick={clearAllFilters}
//               className="mt-4 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 font-medium">
//               Clear Filters
//             </button>
//           )}
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
//           {filteredData.map((item, index) => (
//             <div key={item.uid || index}
//               className="relative bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all">
//               <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
//                 <span className="text-xs text-gray-500 font-medium">{index + 1}</span>
//               </div>

//               <div className="p-4 rounded-t-2xl bg-gray-50">
//                 <div className="flex items-start gap-3">
//                   <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
//                     <span className="text-white font-bold text-lg">{item.projectName?.charAt(0)?.toUpperCase() || 'P'}</span>
//                   </div>
//                   <div className="flex-1 min-w-0 pr-8">
//                     <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold mb-1">
//                       <Hash className="w-3 h-3 mr-1" />{item.uid}
//                     </span>
//                     <h3 className="font-semibold text-gray-800 truncate">{item.projectName || 'N/A'}</h3>
//                     <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
//                       <Clock className="w-3 h-3" /><span>Planned: {item.planned5 || 'N/A'}</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="p-4 space-y-3">
//                 <div className="grid grid-cols-2 gap-3 text-sm">
//                   <div className="flex items-center gap-2">
//                     <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
//                       <User className="w-4 h-4 text-blue-600" />
//                     </div>
//                     <div className="min-w-0">
//                       <p className="text-xs text-gray-400">Engineer</p>
//                       <p className="font-medium text-gray-700 truncate">{item.projectEngineer || 'N/A'}</p>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
//                       <HardHat className="w-4 h-4 text-green-600" />
//                     </div>
//                     <div className="min-w-0">
//                       <p className="text-xs text-gray-400">Contractor</p>
//                       <p className="font-medium text-gray-700 truncate">{item.Labouar_Contractor_Name_3 || 'N/A'}</p>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
//                       <Wrench className="w-4 h-4 text-orange-600" />
//                     </div>
//                     <div className="min-w-0">
//                       <p className="text-xs text-gray-400">Work Type</p>
//                       <p className="font-medium text-gray-700 truncate">{item.workType || 'N/A'}</p>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
//                       <Users className="w-4 h-4 text-purple-600" />
//                     </div>
//                     <div className="min-w-0">
//                       <p className="text-xs text-gray-400">Total Labour</p>
//                       <p className="font-medium text-gray-700">{item.totalLabour || '0'}</p>
//                     </div>
//                   </div>
//                 </div>

//                 {item.Paid_Name && (
//                   <div className="flex items-center gap-2 bg-indigo-50 rounded-lg px-3 py-2">
//                     <User className="w-4 h-4 text-indigo-500 flex-shrink-0" />
//                     <div className="min-w-0">
//                       <p className="text-xs text-indigo-500">Paid Name</p>
//                       <p className="font-semibold text-indigo-700 truncate">{item.Paid_Name}</p>
//                     </div>
//                   </div>
//                 )}

//                 {(item.Bill_No || item.Bill_Url) && (
//                   <div className="grid grid-cols-2 gap-2">
//                     {item.Bill_No && (
//                       <button onClick={() => handleBillNoSelect(item.Bill_No)}
//                         className="flex items-center gap-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg px-3 py-2 transition-colors text-left">
//                         <Receipt className="w-4 h-4 text-rose-500 flex-shrink-0" />
//                         <div className="min-w-0">
//                           <p className="text-xs text-rose-500">Bill No</p>
//                           <p className="font-semibold text-rose-700 truncate text-sm">{item.Bill_No}</p>
//                         </div>
//                       </button>
//                     )}
//                     {item.Bill_Url && (
//                       <a href={item.Bill_Url} target="_blank" rel="noopener noreferrer"
//                         className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 rounded-lg px-3 py-2 transition-colors">
//                         <ExternalLink className="w-4 h-4 text-blue-500 flex-shrink-0" />
//                         <div className="min-w-0">
//                           <p className="text-xs text-blue-500">Bill URL</p>
//                           <p className="font-semibold text-blue-700 text-xs">View Bill</p>
//                         </div>
//                       </a>
//                     )}
//                   </div>
//                 )}

//                 <div className="border-t border-gray-100 pt-3">
//                   <div className="bg-purple-50 rounded-lg p-2">
//                     <p className="text-xs text-purple-600">🏢 Paid Amount</p>
//                     <p className="font-bold text-purple-700">₹{formatAmount(item.Revised_Company_Head_Amount_4)}</p>
//                   </div>
//                 </div>

//                 <div className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-3 py-2">
//                   <span className="text-gray-500">Cat1 - {item.Deployed_Category_1_Labour_No_4 || '0'}</span>
//                   <span className="text-gray-400">|</span>
//                   <span className="text-gray-500">Cat2 - {item.Deployed_Category_2_Labour_No_4 || '0'}</span>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Footer */}
//       <div className="bg-white rounded-xl p-4 border border-gray-200">
//         <div className="flex flex-wrap items-center justify-between gap-4">
//           <p className="text-sm text-gray-600">
//             Total <span className="font-semibold text-amber-600">{filteredData.length}</span> records
//           </p>
//           <p className="text-xs text-gray-400">
//             💡 Click <span className="text-rose-500 font-medium">Bill No</span> to process payment
//           </p>
//         </div>
//       </div>

//       <style>{`
//         @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
//         .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
//       `}</style>
//     </div>
//   );
// };

// export default PaidAmount;





import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  useGetPaidStepQuery, usePostLabourPaidMutation, useGetProjectDropdownQuery
} from '../../redux/Labour/LabourSlice';
import {
  Loader2, RefreshCw, User, Calendar, Users, FileText, Building, AlertCircle,
  Search, Filter, X, Wrench, Clock, Hash, ChevronDown, IndianRupee, Building2,
  HardHat, MessageSquare, CreditCard, Receipt, BadgeCheck, CircleDollarSign,
  ListChecks, Check, ChevronUp, XCircle, ExternalLink, Tag, BadgeDollarSign,
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
};

const inputBase = {
  width: '100%', padding: '10px 12px', fontSize: 13,
  border: `1.5px solid ${T.border}`, borderRadius: 8,
  outline: 'none', color: T.text, background: T.borderLight,
  transition: 'all 0.2s', boxSizing: 'border-box',
};
const focusGold = e => { e.target.style.borderColor = T.gold; e.target.style.boxShadow = `0 0 0 3px ${T.gold}15`; e.target.style.background = T.card; };
const blurNormal = e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = 'none'; e.target.style.background = T.borderLight; };

const formatAmount = (value) => {
  if (value == null || value === '') return '0';
  const num = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
  return isNaN(num) ? '0' : num.toLocaleString('en-IN', { maximumFractionDigits: 0 });
};

// ── Searchable Dropdown ──
const SearchableDropdown = ({ label, icon: Icon, options = [], value, onChange, placeholder, required, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearch] = useState('');
  const ref = useRef(null);
  const filtered = useMemo(() => options.filter(o => typeof o === 'string' && o.toLowerCase().includes(searchTerm.toLowerCase())), [options, searchTerm]);

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) { setIsOpen(false); setSearch(''); } };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  if (disabled) return (
    <div>
      {label && <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.textMuted, marginBottom: 6 }}>{Icon && <Icon size={14} style={{ display: 'inline', marginRight: 6 }} />}{label}</label>}
      <div style={{ ...inputBase, background: T.borderLight, color: T.textMuted, cursor: 'not-allowed' }}>{placeholder}</div>
    </div>
  );

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {label && <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
        {Icon && <Icon size={14} />}{label}{required && <span style={{ color: T.danger }}>*</span>}
      </label>}
      <div onClick={() => !disabled && setIsOpen(o => !o)} style={{
        ...inputBase, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
        borderColor: isOpen ? T.gold : T.border, background: value ? `${T.gold}10` : T.borderLight,
      }}>
        {value ? <span style={{ fontSize: 13, fontWeight: 600, color: T.goldDark, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
          : <input value={searchTerm} onChange={e => { setSearch(e.target.value); setIsOpen(true); }}
              onClick={e => { e.stopPropagation(); setIsOpen(true); }} placeholder={placeholder}
              style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: T.text }} />}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          {value && <button onClick={e => { e.stopPropagation(); onChange(''); setSearch(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}><X size={14} color={T.textMuted} /></button>}
          {isOpen ? <ChevronUp size={14} color={T.textMuted} /> : <ChevronDown size={14} color={T.textMuted} />}
        </div>
      </div>
      {isOpen && (
        <div style={{ position: 'absolute', zIndex: 50, width: '100%', marginTop: 4, background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          {value && <div style={{ padding: 8, borderBottom: `1px solid ${T.border}` }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: T.textMuted }} />
              <input autoFocus value={searchTerm} onChange={e => setSearch(e.target.value)} placeholder="Search..."
                style={{ ...inputBase, paddingLeft: 30, fontSize: 12 }} />
            </div>
          </div>}
          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
            <button onClick={() => { onChange(''); setIsOpen(false); setSearch(''); }}
              style={{ width: '100%', padding: '10px 14px', textAlign: 'left', fontSize: 13, border: 'none', background: !value ? `${T.gold}15` : 'transparent', cursor: 'pointer', color: T.textMuted }}>-- Select --</button>
            {filtered.length > 0 ? filtered.map((opt, i) => (
              <button key={`${opt}-${i}`} onClick={() => { onChange(opt); setIsOpen(false); setSearch(''); }}
                style={{ width: '100%', padding: '10px 14px', textAlign: 'left', fontSize: 13, border: 'none', background: value === opt ? `${T.gold}15` : 'transparent', cursor: 'pointer', color: T.text, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                onMouseEnter={e => { if (value !== opt) e.currentTarget.style.background = `${T.gold}08`; }}
                onMouseLeave={e => { if (value !== opt) e.currentTarget.style.background = 'transparent'; }}>
                <span>{opt}</span>{value === opt && <Check size={14} color={T.goldDark} />}
              </button>
            )) : <div style={{ padding: '12px 14px', fontSize: 13, color: T.textMuted, textAlign: 'center' }}>No results</div>}
          </div>
        </div>
      )}
    </div>
  );
};

const VIEW_MODE = { LIST: 'list', BILL: 'bill' };

// ── Item Card ──
const ItemCard = ({ item, index, isLast, onClick }) => (
  <div style={{
    position: 'relative', background: T.card, borderRadius: 14, border: `2px solid ${isLast ? T.success : T.gold}40`,
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)', overflow: 'hidden',
  }} onClick={onClick}>
    {/* Badge */}
    <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
      {isLast ? (
        <span style={{ fontSize: 10, background: T.success, color: 'white', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>📌 Payment Here</span>
      ) : (
        <span style={{ fontSize: 10, background: T.textMuted, color: 'white', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>Done + "-"</span>
      )}
    </div>

    {/* Header */}
    <div style={{ padding: '12px 14px', background: isLast ? T.successBg : `${T.gold}10` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap', paddingRight: 100 }}>
        <span style={{ background: `${T.navy}15`, color: T.navy, padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>{item.uid}</span>
      </div>
      <p style={{ fontSize: 14, fontWeight: 600, color: T.navy, margin: 0 }}>{item.projectName || 'N/A'}</p>
      <p style={{ fontSize: 11, color: T.textMuted, margin: '2px 0 0' }}>Planned: {item.planned5 || 'N/A'}</p>
    </div>

    {/* Body */}
    <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12 }}>
        <div><span style={{ color: T.textMuted }}>Engineer:</span> <strong>{item.projectEngineer || 'N/A'}</strong></div>
        <div><span style={{ color: T.textMuted }}>Contractor:</span> <strong>{item.Labouar_Contractor_Name_3 || 'N/A'}</strong></div>
        <div><span style={{ color: T.textMuted }}>Work:</span> <strong>{item.workType || 'N/A'}</strong></div>
        <div><span style={{ color: T.textMuted }}>Labour:</span> <strong>{item.totalLabour || '0'}</strong></div>
      </div>

      {item.Paid_Name && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: `${T.navy}08`, borderRadius: 6, padding: '6px 10px', fontSize: 12 }}>
          <User size={12} color={T.navy} /><span style={{ color: T.textMuted }}>Paid:</span> <strong style={{ color: T.navy }}>{item.Paid_Name}</strong>
        </div>
      )}

      {item.Bill_No && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: `${T.gold}10`, borderRadius: 6, padding: '6px 10px', fontSize: 12 }}>
          <Receipt size={12} color={T.goldDark} /><span style={{ color: T.textMuted }}>Bill:</span> <strong style={{ color: T.goldDark }}>{item.Bill_No}</strong>
        </div>
      )}

      <div style={{ background: `${T.purple}10`, borderRadius: 6, padding: '6px 10px' }}>
        <p style={{ fontSize: 10, color: T.purple }}>🏢 Paid Amount</p>
        <p style={{ fontSize: 14, fontWeight: 800, color: T.purple, margin: 0 }}>₹{formatAmount(item.Revised_Company_Head_Amount_4)}</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: T.textMuted, background: T.borderLight, borderRadius: 6, padding: '4px 10px' }}>
        <span>Cat1: {item.Deployed_Category_1_Labour_No_4 || '0'}</span>
        <span>Cat2: {item.Deployed_Category_2_Labour_No_4 || '0'}</span>
      </div>
    </div>

    <div style={{ height: 3, background: isLast ? T.success : T.gold }} />
  </div>
);

// ── Bill Payment Page ──
const BillPaymentPage = ({ billNo, billItems, onBack, postPaid, isSubmitting, refetch, uniqueBankNames, isBankLoading }) => {
  const [showModal, setShowModal] = useState(true);
  const lastItem = billItems[billItems.length - 1];

  const [formData, setFormData] = useState({
    Status_5: '', Paid_Amount_5: '', TDS_Amount_5: '', Net_Amount_5: '',
    PAYMENT_MODE_5: '', BANK_DETAILS_5: '', PAYMENT_DETAILS_5: '',
    Payment_Date_5: new Date().toISOString().split('T')[0], Remark_5: ''
  });

  const isRejected = formData.Status_5 === 'Reject';

  const getTotalAmount = () => billItems.reduce((s, i) => s + (parseFloat(String(i.Revised_Company_Head_Amount_4 || '0').replace(/[^0-9.-]/g, '')) || 0), 0);

  const handleFormChange = (field, value) => {
    setFormData(prev => {
      const n = { ...prev, [field]: value };
      if (field === 'TDS_Amount_5' || field === 'Paid_Amount_5') {
        const paid = parseFloat(field === 'Paid_Amount_5' ? value : n.Paid_Amount_5) || getTotalAmount();
        const tds = parseFloat(field === 'TDS_Amount_5' ? value : n.TDS_Amount_5) || 0;
        n.Net_Amount_5 = String(Math.max(0, paid - tds));
      }
      if (field === 'Status_5' && value === 'Reject') {
        n.PAYMENT_MODE_5 = ''; n.BANK_DETAILS_5 = ''; n.PAYMENT_DETAILS_5 = '';
        n.Paid_Amount_5 = ''; n.TDS_Amount_5 = ''; n.Net_Amount_5 = '';
        n.Payment_Date_5 = new Date().toISOString().split('T')[0];
      }
      return n;
    });
  };

  const isSubmitDisabled = () => {
    if (!formData.Status_5) return true;
    if (formData.Status_5 === 'Reject') return false;
    return !formData.Paid_Amount_5 || !formData.PAYMENT_MODE_5 || !formData.BANK_DETAILS_5 || !formData.PAYMENT_DETAILS_5.trim() || !formData.Payment_Date_5;
  };

  const handleSubmit = async () => {
    if (!formData.Status_5) return alert('Select Status');
    if (formData.Status_5 !== 'Reject' && (!formData.Paid_Amount_5 || !formData.PAYMENT_MODE_5 || !formData.BANK_DETAILS_5 || !formData.PAYMENT_DETAILS_5.trim() || !formData.Payment_Date_5)) return alert('Fill all required fields');

    let success = 0, failed = 0;
    for (let i = 0; i < billItems.length; i++) {
      const item = billItems[i]; const isLast = i === billItems.length - 1;
      try {
        let payload = { uid: item.uid, isLastUID: isLast, Status_5: isLast ? formData.Status_5 : 'Done' };
        if (isLast && formData.Status_5 !== 'Reject') {
          Object.assign(payload, {
            Paid_Amount_5: formData.Paid_Amount_5, TDS_Amount_5: formData.TDS_Amount_5,
            Net_Amount_5: formData.Net_Amount_5, PAYMENT_MODE_5: formData.PAYMENT_MODE_5,
            BANK_DETAILS_5: formData.BANK_DETAILS_5, PAYMENT_DETAILS_5: formData.PAYMENT_DETAILS_5,
            Payment_Date_5: formData.Payment_Date_5, Remark_5: formData.Remark_5 || ''
          });
        } else if (isLast) { payload.Remark_5 = formData.Remark_5 || ''; }
        const result = await postPaid(payload).unwrap();
        if (result?.success) success++; else failed++;
      } catch (err) {
        if (err?.status === 500 && err?.data?.error?.includes('null')) success++; else failed++;
      }
    }
    alert(success > 0 && failed === 0 ? `✅ Payment Successful! ${success} records` : `⚠️ ${success} success, ${failed} failed`);
    setShowModal(false); refetch(); onBack();
  };

  const paidNames = [...new Set(billItems.map(i => i.Paid_Name).filter(Boolean))];
  const billUrl = billItems.find(i => i.Bill_Url)?.Bill_Url || '';

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 8px' }}>

      {/* Header */}
      <div style={{ background: T.card, borderRadius: 10, border: `1px solid ${T.border}`, padding: '14px 18px', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${T.border}`, background: T.card, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronDown size={16} color={T.textLight} style={{ transform: 'rotate(90deg)' }} />
          </button>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: T.navy, margin: 0 }}>Bill Payment — <span style={{ color: T.gold }}>{billNo}</span></h2>
            <p style={{ fontSize: 12, color: T.textMuted, margin: 0 }}>{billItems.length} records{paidNames.length > 0 && ` • Paid To: ${paidNames.join(', ')}`}</p>
          </div>
        </div>
        {billUrl && <a href={billUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, background: T.navy, color: T.gold, fontSize: 12, fontWeight: 700, textDecoration: 'none' }}><ExternalLink size={14} /> View Bill</a>}
      </div>

      {/* Bill Info */}
      <div style={{ background: `${T.gold}08`, border: `1px solid ${T.gold}30`, borderRadius: 10, padding: 14, marginBottom: 12, display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        <div><p style={{ fontSize: 10, color: T.textMuted }}>Bill No</p><p style={{ fontSize: 16, fontWeight: 800, color: T.goldDark, margin: 0 }}>{billNo}</p></div>
        {paidNames.length > 0 && <div><p style={{ fontSize: 10, color: T.textMuted }}>Paid To</p><p style={{ fontSize: 13, fontWeight: 700, color: T.purple, margin: 0 }}>{paidNames.join(', ')}</p></div>}
        <div><p style={{ fontSize: 10, color: T.textMuted }}>Records</p><p style={{ fontSize: 13, fontWeight: 700, color: T.navy, margin: 0 }}>{billItems.length}</p></div>
        <div><p style={{ fontSize: 10, color: T.textMuted }}>Total Amount</p><p style={{ fontSize: 16, fontWeight: 800, color: T.success, margin: 0 }}>₹{formatAmount(getTotalAmount())}</p></div>
      </div>

      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12, marginBottom: 12 }}>
        {billItems.map((item, i) => <ItemCard key={item.uid || i} item={item} index={i} isLast={i === billItems.length - 1} />)}
      </div>

      {/* ── Payment Modal ── */}
      {showModal && (
        <>
          <div onClick={() => { setShowModal(false); onBack(); }} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(2px)', zIndex: 100 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '95%', maxWidth: 620, background: T.card, borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', zIndex: 101, display: 'flex', flexDirection: 'column', maxHeight: '92vh' }}>

            {/* Header */}
            <div style={{ background: T.navy, padding: '14px 20px', borderBottom: `2px solid ${T.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '14px 14px 0 0' }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}><CircleDollarSign size={16} color={T.gold} /> Payment Processing</h3>
                <p style={{ fontSize: 11, color: T.textMuted, margin: '2px 0 0' }}>Bill: <span style={{ color: T.gold }}>{billNo}</span> • {billItems.length} records • Last: <span style={{ color: T.success }}>{lastItem?.uid}</span></p>
              </div>
              <button onClick={() => { setShowModal(false); onBack(); }} style={{ width: 30, height: 30, borderRadius: 6, border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Summary */}
              <div style={{ background: T.borderLight, borderRadius: 10, padding: '12px 14px', border: `1px solid ${T.border}` }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxHeight: 50, overflowY: 'auto', marginBottom: 8 }}>
                  {billItems.map((item, i) => (
                    <span key={item.uid || i} style={{ padding: '2px 8px', background: i === billItems.length - 1 ? T.successBg : `${T.navy}10`, border: `1px solid ${i === billItems.length - 1 ? T.successBorder : T.border}`, color: i === billItems.length - 1 ? '#065f46' : T.navy, borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                      {item.uid}{i === billItems.length - 1 && ' 📌'}
                    </span>
                  ))}
                </div>
                <div style={{ textAlign: 'center', padding: 10, background: T.card, borderRadius: 8, border: `1px solid ${T.border}` }}>
                  <p style={{ fontSize: 10, color: T.textMuted }}>Total</p>
                  <p style={{ fontSize: 20, fontWeight: 800, color: T.gold, margin: '2px 0 0' }}>₹{formatAmount(getTotalAmount())}</p>
                </div>
              </div>

              {/* Status */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>Status <span style={{ color: T.danger }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <select value={formData.Status_5} onChange={e => handleFormChange('Status_5', e.target.value)}
                    style={{ ...inputBase, paddingRight: 32, appearance: 'none', cursor: 'pointer' }} onFocus={focusGold} onBlur={blurNormal}>
                    <option value="">-- Select --</option>
                    <option value="Done">✅ Done</option>
                    <option value="Reject">❌ Reject</option>
                  </select>
                  <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: T.textMuted, pointerEvents: 'none' }} />
                </div>
              </div>

              {isRejected && (
                <div style={{ padding: '12px 14px', background: T.dangerBg, border: `1px solid ${T.dangerBorder}`, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <XCircle size={18} color={T.danger} />
                  <div><p style={{ fontSize: 13, fontWeight: 600, color: T.danger, margin: 0 }}>Rejection Mode</p><p style={{ fontSize: 11, color: T.danger, margin: '2px 0 0' }}>Add remark and submit.</p></div>
                </div>
              )}

              {!isRejected && (
                <>
                  {/* Payment Mode */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>Payment Mode <span style={{ color: T.danger }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <select value={formData.PAYMENT_MODE_5} onChange={e => handleFormChange('PAYMENT_MODE_5', e.target.value)}
                        style={{ ...inputBase, paddingRight: 32, appearance: 'none', cursor: 'pointer' }} onFocus={focusGold} onBlur={blurNormal}>
                        <option value="">-- Select --</option>
                        <option value="Cheque">📄 Cheque</option>
                        <option value="Cash">💵 Cash</option>
                        <option value="NEFT">📱 NEFT</option>
                        <option value="RTGS">📋 RTGS</option>
                      </select>
                      <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: T.textMuted, pointerEvents: 'none' }} />
                    </div>
                  </div>

                  {/* Bank */}
                  <SearchableDropdown label="Bank Details" icon={Building2} options={uniqueBankNames}
                    value={formData.BANK_DETAILS_5} onChange={val => handleFormChange('BANK_DETAILS_5', val)}
                    placeholder={isBankLoading ? "Loading..." : "Select bank..."} required />

                  {/* Details + Date */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>Payment Details <span style={{ color: T.danger }}>*</span></label>
                      <input type="text" value={formData.PAYMENT_DETAILS_5} onChange={e => handleFormChange('PAYMENT_DETAILS_5', e.target.value)}
                        placeholder="Reference no..." style={{ ...inputBase, borderColor: !formData.PAYMENT_DETAILS_5.trim() ? T.danger : T.border }}
                        onFocus={focusGold} onBlur={blurNormal} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>Date <span style={{ color: T.danger }}>*</span></label>
                      <input type="date" value={formData.Payment_Date_5} onChange={e => handleFormChange('Payment_Date_5', e.target.value)}
                        style={inputBase} onFocus={focusGold} onBlur={blurNormal} />
                    </div>
                  </div>

                  {/* Amounts */}
                  <div style={{ padding: 14, background: T.successBg, borderRadius: 10, border: `1px solid ${T.successBorder}` }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#065f46', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}><IndianRupee size={14} /> Amount Details</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, color: T.navyLight, marginBottom: 4 }}>Paid Amt <span style={{ color: T.danger }}>*</span></label>
                        <input type="number" min="0" value={formData.Paid_Amount_5} onChange={e => handleFormChange('Paid_Amount_5', e.target.value)}
                          placeholder={formatAmount(getTotalAmount())}
                          style={{ ...inputBase, borderColor: !formData.Paid_Amount_5 ? T.danger : T.success }} onFocus={focusGold} onBlur={blurNormal} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, color: T.navyLight, marginBottom: 4 }}>TDS Amt</label>
                        <input type="number" min="0" value={formData.TDS_Amount_5} onChange={e => handleFormChange('TDS_Amount_5', e.target.value)}
                          placeholder="0" style={inputBase} onFocus={focusGold} onBlur={blurNormal} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, color: T.navyLight, marginBottom: 4 }}>Net Amt <span style={{ color: T.success }}>(Auto)</span></label>
                        <input type="number" value={formData.Net_Amount_5} onChange={e => handleFormChange('Net_Amount_5', e.target.value)}
                          style={{ ...inputBase, background: T.successBg }} onFocus={focusGold} onBlur={blurNormal} />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Remark */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>Remark <span style={{ fontSize: 10, color: T.textMuted }}>(Optional)</span></label>
                <textarea value={formData.Remark_5} onChange={e => handleFormChange('Remark_5', e.target.value)}
                  rows={3} placeholder={isRejected ? "Rejection reason..." : "Remarks..."}
                  style={{ ...inputBase, resize: 'vertical', minHeight: 70 }} onFocus={focusGold} onBlur={blurNormal} />
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '14px 20px', borderTop: `1px solid ${T.border}`, background: T.borderLight, display: 'flex', justifyContent: 'flex-end', gap: 10, borderRadius: '0 0 14px 14px' }}>
              <button onClick={() => { setShowModal(false); onBack(); }} style={{ padding: '10px 20px', borderRadius: 8, border: `1.5px solid ${T.border}`, background: T.card, color: T.textLight, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSubmit} disabled={isSubmitting || isSubmitDisabled()}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '10px 24px', borderRadius: 8, border: 'none',
                  background: isSubmitting || isSubmitDisabled() ? T.border : isRejected ? `linear-gradient(135deg, ${T.danger}, #dc2626)` : `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
                  color: isSubmitting || isSubmitDisabled() ? T.textMuted : isRejected ? 'white' : T.navyDark,
                  fontSize: 13, fontWeight: 700, cursor: isSubmitting || isSubmitDisabled() ? 'not-allowed' : 'pointer',
                }}>
                {isSubmitting ? <><Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> Processing...</>
                  : isRejected ? <><XCircle size={15} /> Reject ({billItems.length})</>
                  : <><BadgeCheck size={15} /> Confirm ({billItems.length})</>}
              </button>
            </div>
          </div>
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// ── Main Component ──
const PaidAmount = () => {
  const { data: rawPaidData, isLoading, isError, error, refetch, isFetching } = useGetPaidStepQuery();
  const paidData = useMemo(() => { if (!rawPaidData) return []; if (Array.isArray(rawPaidData)) return rawPaidData; if (Array.isArray(rawPaidData?.data)) return rawPaidData.data; return []; }, [rawPaidData]);
  const [postPaid, { isLoading: isSubmitting }] = usePostLabourPaidMutation();
  const { data: bankList = [], isLoading: isBankLoading } = useGetProjectDropdownQuery();

  const [viewMode, setViewMode] = useState(VIEW_MODE.LIST);
  const [activeBillNo, setActiveBillNo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedContractor, setSelectedContractor] = useState('');
  const [selectedBillNo, setSelectedBillNo] = useState('');
  const [selectedPaidName, setSelectedPaidName] = useState('');

  const uniqueProjectNames = useMemo(() => [...new Set(paidData.map(i => i.projectName).filter(Boolean))].sort(), [paidData]);
  const uniqueContractorNames = useMemo(() => [...new Set(paidData.map(i => i.Labouar_Contractor_Name_3).filter(Boolean))].sort(), [paidData]);
  const uniqueBillNumbers = useMemo(() => [...new Set(paidData.map(i => i.Bill_No).filter(Boolean))].sort(), [paidData]);
  const uniquePaidNames = useMemo(() => [...new Set(paidData.map(i => i.Paid_Name).filter(Boolean))].sort(), [paidData]);
  const uniqueBankNames = useMemo(() => {
    if (!bankList || !Array.isArray(bankList)) return [];
    return [...new Set(bankList.map(i => i.extraField || i.bankName || i.name || '').filter(Boolean))].sort();
  }, [bankList]);

  const filteredData = useMemo(() => paidData.filter(item => {
    const s = searchTerm.toLowerCase();
    const match = !s || [item.uid, item.projectName, item.Labouar_Contractor_Name_3, item.projectEngineer, item.workType, item.Bill_No, item.Paid_Name].some(v => (v || '').toLowerCase().includes(s));
    return match && (!selectedProject || item.projectName === selectedProject) && (!selectedContractor || item.Labouar_Contractor_Name_3 === selectedContractor) && (!selectedBillNo || item.Bill_No === selectedBillNo) && (!selectedPaidName || item.Paid_Name === selectedPaidName);
  }), [paidData, searchTerm, selectedProject, selectedContractor, selectedBillNo, selectedPaidName]);

  const clearAll = () => { setSearchTerm(''); setSelectedProject(''); setSelectedContractor(''); setSelectedBillNo(''); setSelectedPaidName(''); };
  const hasFilters = searchTerm || selectedProject || selectedContractor || selectedBillNo || selectedPaidName;

  const handleBillSelect = (billNo) => { setSelectedBillNo(billNo); if (billNo) { setActiveBillNo(billNo); setViewMode(VIEW_MODE.BILL); } };
  const handleBack = () => { setViewMode(VIEW_MODE.LIST); setActiveBillNo(''); setSelectedBillNo(''); };
  const billItems = useMemo(() => activeBillNo ? paidData.filter(i => i.Bill_No === activeBillNo) : [], [paidData, activeBillNo]);

  if (isLoading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px' }}>
      <div style={{ width: 56, height: 56, borderRadius: 14, background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, boxShadow: `0 0 0 3px ${T.gold}30` }}>
        <Loader2 size={28} color={T.gold} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
      <p style={{ fontSize: 15, fontWeight: 600, color: T.navy }}>Loading Payment Data...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (isError) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px' }}>
      <AlertCircle size={40} color={T.danger} style={{ marginBottom: 12 }} />
      <p style={{ fontSize: 15, fontWeight: 600, color: T.danger }}>Error Loading Data</p>
      <button onClick={refetch} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 8, border: 'none', background: T.danger, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 12 }}><RotateCcw size={14} /> Retry</button>
    </div>
  );

  if (viewMode === VIEW_MODE.BILL && activeBillNo) {
    return <BillPaymentPage billNo={activeBillNo} billItems={billItems} onBack={handleBack} postPaid={postPaid} isSubmitting={isSubmitting} refetch={refetch} uniqueBankNames={uniqueBankNames} isBankLoading={isBankLoading} />;
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 8px' }}>

      {/* Header */}
      <div style={{ background: T.card, borderRadius: 10, border: `1px solid ${T.border}`, padding: '14px 18px', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircleDollarSign size={18} color={T.gold} />
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: T.navy, margin: 0 }}>Payment Processing</h2>
            <p style={{ fontSize: 12, color: T.textMuted, margin: 0 }}>{paidData.length} records • Select Bill No to pay</p>
          </div>
        </div>
        <button onClick={refetch} disabled={isFetching} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: `1.5px solid ${T.border}`, background: T.card, color: T.textLight, fontSize: 13, cursor: isFetching ? 'not-allowed' : 'pointer' }}>
          <RotateCcw size={14} style={isFetching ? { animation: 'spin 0.8s linear infinite' } : {}} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div style={{ background: T.card, borderRadius: 10, border: `1px solid ${T.border}`, padding: '14px 16px', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${T.border}` }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: T.navy, display: 'flex', alignItems: 'center', gap: 6 }}><Filter size={14} color={T.gold} /> Filters</span>
          {hasFilters && <button onClick={clearAll} style={{ fontSize: 12, color: T.gold, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><X size={14} /> Clear</button>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}><Search size={14} /> Search</label>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.textMuted }} />
              <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search..."
                style={{ ...inputBase, paddingLeft: 34 }} onFocus={focusGold} onBlur={blurNormal} />
            </div>
          </div>
          <SearchableDropdown label="Project" icon={Building} options={uniqueProjectNames} value={selectedProject} onChange={setSelectedProject} placeholder="Select..." />
          <SearchableDropdown label="Contractor" icon={HardHat} options={uniqueContractorNames} value={selectedContractor} onChange={setSelectedContractor} placeholder="Select..." />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Receipt size={14} color={T.danger} /> Bill Number <span style={{ fontSize: 10, background: T.dangerBg, color: T.danger, padding: '2px 6px', borderRadius: 4 }}>Click to pay</span>
            </label>
            <SearchableDropdown icon={Receipt} options={uniqueBillNumbers} value={selectedBillNo} onChange={handleBillSelect} placeholder="Select bill to process..." />
          </div>
          <SearchableDropdown label="Paid Name" icon={User} options={uniquePaidNames} value={selectedPaidName} onChange={setSelectedPaidName} placeholder="Select..." />
        </div>

        {hasFilters && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.border}`, alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: T.textMuted }}>Active:</span>
            {searchTerm && <span style={{ background: `${T.gold}15`, color: T.goldDark, padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>🔍 "{searchTerm}" <button onClick={() => setSearchTerm('')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={10} /></button></span>}
            {selectedProject && <span style={{ background: `${T.purple}15`, color: T.purple, padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{selectedProject} <button onClick={() => setSelectedProject('')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={10} /></button></span>}
            {selectedContractor && <span style={{ background: `${T.success}15`, color: T.success, padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{selectedContractor} <button onClick={() => setSelectedContractor('')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={10} /></button></span>}
            {selectedBillNo && <span style={{ background: T.dangerBg, color: T.danger, padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>Bill: {selectedBillNo} <button onClick={() => setSelectedBillNo('')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={10} /></button></span>}
            {selectedPaidName && <span style={{ background: `${T.navy}10`, color: T.navy, padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{selectedPaidName} <button onClick={() => setSelectedPaidName('')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={10} /></button></span>}
          </div>
        )}
      </div>

      {/* Count */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 13, color: T.textLight }}>Showing: <strong style={{ color: T.gold }}>{filteredData.length}</strong> of {paidData.length}</span>
        <span style={{ fontSize: 11, color: T.textMuted }}>💡 Click <span style={{ color: T.danger, fontWeight: 600 }}>Bill No</span> to process</span>
      </div>

      {/* Cards */}
      {filteredData.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px', background: T.card, borderRadius: 10, border: `1px solid ${T.border}` }}>
          <Package size={40} color={T.border} style={{ marginBottom: 12 }} />
          <p style={{ fontSize: 15, color: T.textLight }}>No records found</p>
          {hasFilters && <button onClick={clearAll} style={{ marginTop: 12, padding: '8px 16px', background: `${T.gold}15`, color: T.goldDark, borderRadius: 8, border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Clear Filters</button>}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
          {filteredData.map((item, i) => (
            <div key={item.uid || i} style={{ background: T.card, borderRadius: 14, border: `1px solid ${T.border}`, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              {/* Card Header */}
              <div style={{ padding: '12px 14px', background: T.borderLight }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                  <span style={{ background: `${T.navy}15`, color: T.navy, padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>{item.uid}</span>
                  <span style={{ fontSize: 11, color: T.textMuted }}>Planned: {item.planned5 || 'N/A'}</span>
                </div>
                <p style={{ fontSize: 14, fontWeight: 600, color: T.navy, margin: 0 }}>{item.projectName || 'N/A'}</p>
              </div>

              {/* Card Body */}
              <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 12 }}>
                  <div><span style={{ color: T.textMuted }}>Engineer:</span> <strong>{item.projectEngineer || 'N/A'}</strong></div>
                  <div><span style={{ color: T.textMuted }}>Contractor:</span> <strong>{item.Labouar_Contractor_Name_3 || 'N/A'}</strong></div>
                  <div><span style={{ color: T.textMuted }}>Work:</span> <strong>{item.workType || 'N/A'}</strong></div>
                  <div><span style={{ color: T.textMuted }}>Labour:</span> <strong>{item.totalLabour || '0'}</strong></div>
                </div>

                {item.Paid_Name && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: `${T.navy}08`, borderRadius: 6, padding: '6px 10px', fontSize: 12 }}>
                    <User size={12} color={T.navy} /><strong style={{ color: T.navy }}>{item.Paid_Name}</strong>
                  </div>
                )}

                {item.Bill_No && (
                  <button onClick={() => handleBillSelect(item.Bill_No)} style={{
                    display: 'flex', alignItems: 'center', gap: 6, background: `${T.gold}10`, border: `1px solid ${T.gold}30`,
                    borderRadius: 6, padding: '6px 10px', fontSize: 12, cursor: 'pointer', width: '100%', textAlign: 'left',
                  }}>
                    <Receipt size={12} color={T.goldDark} /><strong style={{ color: T.goldDark }}>{item.Bill_No}</strong>
                  </button>
                )}

                {item.Bill_Url && (
                  <a href={item.Bill_Url} target="_blank" rel="noopener noreferrer" style={{
                    display: 'flex', alignItems: 'center', gap: 6, background: `${T.navy}08`, borderRadius: 6,
                    padding: '6px 10px', fontSize: 11, textDecoration: 'none', color: T.navy, fontWeight: 600,
                  }}><ExternalLink size={12} /> View Bill</a>
                )}

                <div style={{ background: `${T.purple}10`, borderRadius: 6, padding: '6px 10px' }}>
                  <p style={{ fontSize: 10, color: T.purple }}>🏢 Paid Amount</p>
                  <p style={{ fontSize: 14, fontWeight: 800, color: T.purple, margin: 0 }}>₹{formatAmount(item.Revised_Company_Head_Amount_4)}</p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: T.textMuted, background: T.borderLight, borderRadius: 6, padding: '4px 10px' }}>
                  <span>Cat1: {item.Deployed_Category_1_Labour_No_4 || '0'}</span>
                  <span>Cat2: {item.Deployed_Category_2_Labour_No_4 || '0'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default PaidAmount;