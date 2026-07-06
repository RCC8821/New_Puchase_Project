

// import React, { useState, useEffect } from 'react';
// import { 
//   useGetLabourManagementQuery, 
//   usePostLabourManagementMutation 
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
//   Pencil,
//   Send,
//   ChevronDown,
//   IndianRupee,
//   Truck,
//   Wallet,
//   Building2,
//   HardHat,
//   ChevronRight,
//   ChevronUp,
//   XCircle
// } from 'lucide-react';

// // ─── Mobile Card Component ───────────────────────────────────────────────────
// const MobileCard = ({ item, onAction }) => {
//   const [expanded, setExpanded] = useState(false);

//   return (
//     <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-3">
//       <div className="p-4 bg-gradient-to-r from-blue-900 to-blue-800">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-2">
//             <span className="px-2.5 py-1 bg-indigo-200 text-indigo-800 text-xs font-bold rounded-lg">
//               {item.uid || 'N/A'}
//             </span>
//             <span className="px-2.5 py-1 bg-orange-200 text-orange-800 text-xs font-medium rounded-full">
//               {item.workType || 'N/A'}
//             </span>
//           </div>
//           <button
//             onClick={() => onAction(item)}
//             className="p-2 bg-gradient-to-r from-emerald-400 to-teal-400 text-white rounded-xl shadow-md active:scale-95 transition-transform"
//           >
//             <Pencil className="w-4 h-4" />
//           </button>
//         </div>
//         <p className="text-white font-semibold mt-2 text-sm leading-tight">
//           {item.projectName || 'N/A'}
//         </p>
//         <p className="text-blue-200 text-xs mt-0.5">{item.projectEngineer || 'N/A'}</p>
//       </div>

//       <div className="p-4 space-y-3">
//         <div className="grid grid-cols-3 gap-2">
//           <div className="text-center bg-teal-50 rounded-xl p-2">
//             <p className="text-xs text-teal-500 font-medium">Planned</p>
//             <p className="text-xs font-bold text-teal-700 mt-0.5">{item.planned3 || 'N/A'}</p>
//           </div>
//           <div className="text-center bg-amber-50 rounded-xl p-2">
//             <p className="text-xs text-amber-500 font-medium">Date Req.</p>
//             <p className="text-xs font-bold text-amber-700 mt-0.5">{item.dateRequired || 'N/A'}</p>
//           </div>
//           <div className="text-center bg-green-50 rounded-xl p-2">
//             <p className="text-xs text-green-500 font-medium">Labour</p>
//             <p className="text-lg font-bold text-green-600">{item.totalLabour || '0'}</p>
//           </div>
//         </div>

//         <div className="grid grid-cols-2 gap-2">
//           <div className="bg-blue-50 rounded-xl p-2.5">
//             <p className="text-xs text-blue-400 font-medium mb-1">Cat. 1</p>
//             <p className="text-xs font-semibold text-blue-800 capitalize">{item.labourCategory1 || 'N/A'}</p>
//             <div className="flex items-center gap-1 mt-1">
//               <span className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold text-blue-700">
//                 {item.numberOfLabour1 || '0'}
//               </span>
//               <span className="text-xs text-blue-500">workers</span>
//             </div>
//           </div>
//           <div className="bg-cyan-50 rounded-xl p-2.5">
//             <p className="text-xs text-cyan-400 font-medium mb-1">Cat. 2</p>
//             <p className="text-xs font-semibold text-cyan-800 capitalize">{item.labourCategory2 || 'N/A'}</p>
//             <div className="flex items-center gap-1 mt-1">
//               <span className="w-6 h-6 bg-cyan-200 rounded-full flex items-center justify-center text-xs font-bold text-cyan-700">
//                 {item.numberOfLabour2 || '0'}
//               </span>
//               <span className="text-xs text-cyan-500">workers</span>
//             </div>
//           </div>
//         </div>

//         <button
//           onClick={() => setExpanded(!expanded)}
//           className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-gray-400 font-medium border border-dashed border-gray-200 rounded-xl active:bg-gray-50"
//         >
//           {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
//           {expanded ? 'Less details' : 'More details'}
//         </button>

//         {expanded && (
//           <div className="space-y-2 pt-1 border-t border-gray-100">
//             <InfoRow label="Contractor" value={item.Name_Of_Contractor_2 || 'N/A'} />
//             <InfoRow label="Firm" value={item.Contractor_Firm_Name_2 || '-'} />
//             <InfoRow label="Approved Head" value={item.Approved_Head_2 || 'N/A'} highlight />
//             <InfoRow label="Work Desc." value={item.workDescription || 'N/A'} />
//             {item.remark && <InfoRow label="Remark" value={item.remark} italic />}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// const InfoRow = ({ label, value, highlight, italic }) => (
//   <div className="flex items-start justify-between gap-2">
//     <span className="text-xs text-gray-400 flex-shrink-0 w-24">{label}</span>
//     <span className={`text-xs font-medium text-right flex-1 ${
//       highlight ? 'text-purple-600' : italic ? 'text-gray-500 italic' : 'text-gray-700'
//     }`}>{value}</span>
//   </div>
// );

// // ─── Main Component ───────────────────────────────────────────────────────────
// const LabourManagement = () => {
//   const { 
//     data: labourData, 
//     isLoading, 
//     isError, 
//     error, 
//     refetch,
//     isFetching 
//   } = useGetLabourManagementQuery();

//   const [postLabourManagement, { isLoading: isSubmitting }] = usePostLabourManagementMutation();

//   useEffect(() => {
//     console.log('=== Labour Management Data ===');
//     console.log('Data:', labourData);
//     console.log('Is Loading:', isLoading);
//     console.log('Is Error:', isError);
//   }, [labourData, isLoading, isError]);

//   const [searchTerm, setSearchTerm]     = useState('');
//   const [selectedItem, setSelectedItem] = useState(null);
//   const [showModal, setShowModal]       = useState(false);
//   const [formError, setFormError]       = useState('');

//   // ✅ Form Data with Contractor_Commission as SEPARATE field
//   const [formData, setFormData] = useState({
//     Status_3:                  '',
//     Labouar_Contractor_Name_3: '',
//     Labour_Category_1_3:       '',
//     Number_Of_Labour_1_3:      '',
//     Labour_Rate_1_3:           '',
//     Labour_Category_2_3:       '',
//     Number_Of_Labour_2_3:      '',
//     Labour_Rate_2_3:           '',
//     Total_Wages_3:             '',
//     Conveyanance_3:            '',
//     Contractor_Commission:     '',
//     Total_Paid_Amount_3:       '',
//     Company_Head_Amount_3:     '',
//     Contractor_Head_Amount_3:  '',
//     Remark_3:                  ''
//   });

//   const isRejected    = formData.Status_3 === 'Reject';
//   const isCompanyHead = selectedItem?.Approved_Head_2 === 'Company Head';

//   const filteredData = labourData?.filter(item =>
//     item.uid?.toLowerCase().includes(searchTerm.toLowerCase())              ||
//     item.projectName?.toLowerCase().includes(searchTerm.toLowerCase())      ||
//     item.nameOfContractor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     item.projectEngineer?.toLowerCase().includes(searchTerm.toLowerCase())  ||
//     item.workDescription?.toLowerCase().includes(searchTerm.toLowerCase())  ||
//     item.workType?.toLowerCase().includes(searchTerm.toLowerCase())
//   ) || [];

//   // ✅ FIXED Auto Calculate - Commission SEPARATELY tracked
//   useEffect(() => {
//     if (isRejected) return;

//     const num1       = parseFloat(formData.Number_Of_Labour_1_3)  || 0;
//     const rate1      = parseFloat(formData.Labour_Rate_1_3)       || 0;
//     const num2       = parseFloat(formData.Number_Of_Labour_2_3)  || 0;
//     const rate2      = parseFloat(formData.Labour_Rate_2_3)       || 0;
//     const conveyance = parseFloat(formData.Conveyanance_3)        || 0;
//     const commission = parseFloat(formData.Contractor_Commission) || 0;

//     const totalWages = (num1 * rate1) + (num2 * rate2);
//     const totalPaid  = totalWages + conveyance + commission;

//     // ✅ Only update calculated fields, NOT Contractor_Commission
//     setFormData(prev => ({
//       ...prev,
//       Total_Wages_3:         totalWages > 0 ? totalWages.toString() : '',
//       Total_Paid_Amount_3:   totalPaid > 0 ? totalPaid.toString() : '',
//       Company_Head_Amount_3: totalPaid > 0 ? totalPaid.toString() : ''
//     }));
//   }, [
//     formData.Number_Of_Labour_1_3,
//     formData.Labour_Rate_1_3,
//     formData.Number_Of_Labour_2_3,
//     formData.Labour_Rate_2_3,
//     formData.Conveyanance_3,
//     formData.Contractor_Commission,
//     isRejected
//   ]);

//   const handleAction = (item) => {
//     setSelectedItem(item);
//     setFormError('');
//     setFormData({
//       Status_3:                  '',
//       Labouar_Contractor_Name_3: '',
//       Labour_Category_1_3:       item.labourCategory1 || '',
//       Number_Of_Labour_1_3:      item.numberOfLabour1 || '',
//       Labour_Rate_1_3:           '',
//       Labour_Category_2_3:       item.labourCategory2 || '',
//       Number_Of_Labour_2_3:      item.numberOfLabour2 || '',
//       Labour_Rate_2_3:           '',
//       Total_Wages_3:             '',
//       Conveyanance_3:            '',
//       Contractor_Commission:     '',
//       Total_Paid_Amount_3:       '',
//       Company_Head_Amount_3:     '',
//       Contractor_Head_Amount_3:  '',
//       Remark_3:                  ''
//     });
//     setShowModal(true);
//   };

//   const handleFormChange = (field, value) => {
//     setFormData(prev => {
//       const newData = { ...prev, [field]: value };

//       if (field === 'Status_3' && value === 'Reject') {
//         newData.Labouar_Contractor_Name_3 = '';
//         newData.Labour_Rate_1_3           = '';
//         newData.Labour_Rate_2_3           = '';
//         newData.Total_Wages_3             = '';
//         newData.Conveyanance_3            = '';
//         newData.Contractor_Commission     = '';
//         newData.Total_Paid_Amount_3       = '';
//         newData.Company_Head_Amount_3     = '';
//         newData.Contractor_Head_Amount_3  = '';
//       }

//       return newData;
//     });
//     if (formError) setFormError('');
//   };

//   const resetForm = () => {
//     setFormData({
//       Status_3:                  '',
//       Labouar_Contractor_Name_3: '',
//       Labour_Category_1_3:       '',
//       Number_Of_Labour_1_3:      '',
//       Labour_Rate_1_3:           '',
//       Labour_Category_2_3:       '',
//       Number_Of_Labour_2_3:      '',
//       Labour_Rate_2_3:           '',
//       Total_Wages_3:             '',
//       Conveyanance_3:            '',
//       Contractor_Commission:     '',
//       Total_Paid_Amount_3:       '',
//       Company_Head_Amount_3:     '',
//       Contractor_Head_Amount_3:  '',
//       Remark_3:                  ''
//     });
//     setFormError('');
//   };

//   const validateForm = () => {
//     if (!formData.Status_3) {
//       setFormError('Please select Status');
//       return false;
//     }
//     if (formData.Status_3 === 'Reject') return true;

//     if (!isCompanyHead && (!formData.Contractor_Head_Amount_3 || formData.Contractor_Head_Amount_3.trim() === '')) {
//       setFormError('Contractor Head Amount is required when Approved Head is "Contractor Head"');
//       return false;
//     }
//     return true;
//   };

//   // ✅ FIXED handleSubmit - Commission and Total Paid are SEPARATE values
//   const handleSubmit = async () => {
//     if (!selectedItem) return;
//     if (!validateForm()) return;

//     try {
//       let payload = {
//         uid:      selectedItem.uid,
//         Status_3: formData.Status_3,
//         Remark_3: formData.Remark_3 || ''
//       };

//       if (formData.Status_3 !== 'Reject') {
//         // ✅ Commission is the RAW input value (e.g. "500")
//         // ✅ Total_Paid_Amount is the CALCULATED value (Wages + Conv + Commission)
//         const commissionValue = formData.Contractor_Commission || '';
//         const totalPaidValue  = formData.Total_Paid_Amount_3   || '';

//         // ✅ DEBUG LOG
//         console.log('=== FRONTEND PAYLOAD DEBUG ===');
//         console.log('Contractor_Commission (AP):', commissionValue);
//         console.log('Total_Paid_Amount_3 (AQ):', totalPaidValue);
//         console.log('==============================');

//         payload = {
//           ...payload,
//           Labouar_Contractor_Name_3: formData.Labouar_Contractor_Name_3,
//           Labour_Category_1_3:       formData.Labour_Category_1_3,
//           Number_Of_Labour_1_3:      formData.Number_Of_Labour_1_3,
//           Labour_Rate_1_3:           formData.Labour_Rate_1_3,
//           Labour_Category_2_3:       formData.Labour_Category_2_3,
//           Number_Of_Labour_2_3:      formData.Number_Of_Labour_2_3,
//           Labour_Rate_2_3:           formData.Labour_Rate_2_3,
//           Total_Wages_3:             formData.Total_Wages_3,
//           Conveyanance_3:            formData.Conveyanance_3,
//           Contractor_Commission:     commissionValue,    // ✅ SIRF Commission value → AP
//           Total_Paid_Amount_3:       totalPaidValue,     // ✅ Calculated total → AQ
//           Company_Head_Amount_3:     formData.Company_Head_Amount_3,
//           Contractor_Head_Amount_3:  formData.Contractor_Head_Amount_3
//         };
//       }

//       // ✅ Final payload log
//       console.log('=== FINAL PAYLOAD ===', JSON.stringify(payload, null, 2));

//       const result = await postLabourManagement(payload).unwrap();

//       if (result.success) {
//         alert(`✅ Successfully Updated!\nRow: ${result.rowNumber}\nUpdated: ${result.updatedColumns?.join(', ')}`);
//         setShowModal(false);
//         setSelectedItem(null);
//         resetForm();
//         refetch();
//       } else {
//         alert(`❌ Error: ${result.message}`);
//       }
//     } catch (err) {
//       const errorMessage = err?.data?.message || err?.error || 'Something went wrong!';
//       alert(`❌ Error: ${errorMessage}`);
//     }
//   };

//   // Loading
//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="text-center">
//           <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
//           <p className="text-gray-600 font-medium">Loading Labour Management Data...</p>
//         </div>
//       </div>
//     );
//   }

//   // Error
//   if (isError) {
//     return (
//       <div className="flex items-center justify-center h-64 p-4">
//         <div className="text-center bg-red-50 p-6 rounded-xl border border-red-200 w-full max-w-sm">
//           <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
//           <p className="text-red-600 font-medium mb-2">Error Loading Data</p>
//           <p className="text-red-500 text-sm mb-4">{error?.data?.message || 'Failed to fetch data'}</p>
//           <button
//             onClick={refetch}
//             className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 mx-auto"
//           >
//             <RefreshCw className="w-4 h-4" /> Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4 p-3 sm:p-4 lg:p-6">

//       {/* Header */}
//       <div className="flex items-center justify-between gap-3">
//         <div>
//           <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Labour Management</h2>
//           <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Manage labour payments and assignments</p>
//         </div>
//         <button
//           onClick={refetch}
//           disabled={isFetching}
//           className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm flex-shrink-0"
//         >
//           <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
//           <span className="hidden sm:inline">Refresh</span>
//         </button>
//       </div>

//       {/* Search & Count */}
//       <div className="flex gap-2">
//         <div className="relative flex-1">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//           <input
//             type="text"
//             placeholder="Search UID, project, contractor..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
//           />
//         </div>
//         <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 rounded-xl flex-shrink-0">
//           <Filter className="w-4 h-4 text-gray-500" />
//           <span className="text-indigo-600 font-bold text-sm">{filteredData.length}</span>
//         </div>
//       </div>

//       {/* Empty */}
//       {filteredData.length === 0 ? (
//         <div className="bg-gray-50 rounded-xl p-10 text-center border-2 border-dashed border-gray-200">
//           <FileText className="w-14 h-14 text-gray-300 mx-auto mb-3" />
//           <p className="text-gray-500 font-medium">No records found</p>
//           <p className="text-gray-400 text-sm mt-1">No labour management data available</p>
//         </div>
//       ) : (
//         <>
//           {/* Mobile */}
//           <div className="block md:hidden">
//             {filteredData.map((item, index) => (
//               <MobileCard
//                 key={item.uid || item.sheetRow || index}
//                 item={item}
//                 onAction={handleAction}
//               />
//             ))}
//             <p className="text-center text-xs text-gray-400 mt-2">
//               Showing {filteredData.length} records
//             </p>
//           </div>

//           {/* Desktop Table */}
//           <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200">
//             <div className="overflow-x-auto">
//               <table className="w-full min-w-[1600px]">
//                 <thead className="bg-blue-900 sticky top-0">
//                   <tr>
//                     {[
//                       { icon: <Clock className="w-4 h-4" />,    label: 'Planned Date' },
//                       { icon: <Hash className="w-4 h-4" />,     label: 'UID' },
//                       { icon: <Building className="w-4 h-4" />, label: 'Project Name' },
//                       { icon: <User className="w-4 h-4" />,     label: 'Project Engineer' },
//                       { icon: <Wrench className="w-4 h-4" />,   label: 'Work Type' },
//                       { icon: null, label: 'Work Description' },
//                       { icon: null, label: 'Labour Cat. 1' },
//                       { icon: null, label: 'No. of Labour 1' },
//                       { icon: null, label: 'Labour Cat. 2' },
//                       { icon: null, label: 'No. of Labour 2' },
//                       { icon: <Users className="w-4 h-4" />,    label: 'Total Labour' },
//                       { icon: <Calendar className="w-4 h-4" />, label: 'Date Required' },
//                       { icon: null, label: 'Name of Contractor' },
//                       { icon: null, label: 'Contractor Firm' },
//                       { icon: null, label: 'Approved Head' },
//                       { icon: null, label: 'Remark' },
//                     ].map((col, i) => (
//                       <th key={i} className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
//                         <div className="flex items-center gap-2">
//                           {col.icon}
//                           {col.label}
//                         </div>
//                       </th>
//                     ))}
//                     <th className="px-4 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap sticky right-0 bg-emerald-700">
//                       Action
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-100">
//                   {filteredData.map((item, index) => (
//                     <tr key={item.uid || item.sheetRow || index} className="hover:bg-emerald-50/50 transition-colors">
//                       <td className="px-4 py-4 whitespace-nowrap">
//                         <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-teal-100 text-teal-700 text-sm font-semibold">
//                           <Clock className="w-3.5 h-3.5 mr-1.5" />{item.planned3 || 'N/A'}
//                         </span>
//                       </td>
//                       <td className="px-4 py-4 whitespace-nowrap">
//                         <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-indigo-100 text-indigo-700 text-sm font-bold">
//                           {item.uid || 'N/A'}
//                         </span>
//                       </td>
//                       <td className="px-4 py-4 whitespace-nowrap">
//                         <span className="text-sm font-medium text-gray-900">{item.projectName || 'N/A'}</span>
//                       </td>
//                       <td className="px-4 py-4 whitespace-nowrap">
//                         <div className="flex items-center gap-2">
//                           <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
//                             <span className="text-white font-semibold text-xs">
//                               {item.projectEngineer?.charAt(0)?.toUpperCase() || 'P'}
//                             </span>
//                           </div>
//                           <span className="text-sm font-medium text-gray-900">{item.projectEngineer || 'N/A'}</span>
//                         </div>
//                       </td>
//                       <td className="px-4 py-4 whitespace-nowrap">
//                         <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-medium">
//                           {item.workType || 'N/A'}
//                         </span>
//                       </td>
//                       <td className="px-4 py-4 min-w-[200px]">
//                         <span className="text-sm text-gray-700">{item.workDescription || 'N/A'}</span>
//                       </td>
//                       <td className="px-4 py-4 whitespace-nowrap">
//                         <span className="text-sm font-medium text-gray-900 capitalize">{item.labourCategory1 || 'N/A'}</span>
//                       </td>
//                       <td className="px-4 py-4 whitespace-nowrap text-center">
//                         <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
//                           {item.numberOfLabour1 || '0'}
//                         </span>
//                       </td>
//                       <td className="px-4 py-4 whitespace-nowrap">
//                         <span className="text-sm font-medium text-gray-900 capitalize">{item.labourCategory2 || 'N/A'}</span>
//                       </td>
//                       <td className="px-4 py-4 whitespace-nowrap text-center">
//                         <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 font-bold text-sm">
//                           {item.numberOfLabour2 || '0'}
//                         </span>
//                       </td>
//                       <td className="px-4 py-4 whitespace-nowrap text-center">
//                         <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-700 font-bold text-lg">
//                           {item.totalLabour || '0'}
//                         </span>
//                       </td>
//                       <td className="px-4 py-4 whitespace-nowrap">
//                         <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700 text-sm font-medium">
//                           <Calendar className="w-3.5 h-3.5 mr-1.5" />{item.dateRequired || 'N/A'}
//                         </span>
//                       </td>
//                       <td className="px-4 py-4 whitespace-nowrap">
//                         <div className="flex items-center gap-2">
//                           <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
//                             <span className="text-white font-semibold text-xs">
//                               {item.nameOfContractor?.charAt(0)?.toUpperCase() || 'C'}
//                             </span>
//                           </div>
//                           <span className="text-sm font-medium text-gray-900">{item.Name_Of_Contractor_2 || 'N/A'}</span>
//                         </div>
//                       </td>
//                       <td className="px-4 py-4 whitespace-nowrap">
//                         <span className="text-sm text-gray-700">{item.Contractor_Firm_Name_2 || '-'}</span>
//                       </td>
//                       <td className="px-4 py-4 whitespace-nowrap">
//                         <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
//                           item.Approved_Head_2 === 'Company Head'
//                             ? 'bg-purple-100 text-purple-700'
//                             : item.Approved_Head_2 === 'Contractor Head'
//                             ? 'bg-blue-100 text-blue-700'
//                             : 'bg-gray-100 text-gray-700'
//                         }`}>
//                           {item.Approved_Head_2 || 'N/A'}
//                         </span>
//                       </td>
//                       <td className="px-4 py-4 min-w-[150px]">
//                         <span className="text-sm text-gray-600 italic">{item.remark || '-'}</span>
//                       </td>
//                       <td className="px-4 py-4 whitespace-nowrap sticky right-0 bg-white shadow-[-4px_0_8px_rgba(0,0,0,0.1)]">
//                         <div className="flex items-center justify-center">
//                           <button
//                             onClick={() => handleAction(item)}
//                             className="p-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all shadow-md hover:shadow-lg"
//                           >
//                             <Pencil className="w-4 h-4" />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//             <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
//               <p className="text-sm text-gray-600">
//                 Showing <span className="font-semibold text-emerald-600">{filteredData.length}</span> records
//               </p>
//               <p className="text-xs text-gray-400">Scroll horizontally to view all columns →</p>
//             </div>
//           </div>
//         </>
//       )}

//       {/* ─── MODAL ─────────────────────────────────────────────────────── */}
//       {showModal && selectedItem && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50">
//           <div className="absolute inset-0" onClick={() => setShowModal(false)} />

//           <div className="relative bg-white w-full sm:w-[95%] sm:max-w-2xl rounded-t-3xl sm:rounded-2xl max-h-[92vh] sm:max-h-[95vh] flex flex-col shadow-2xl animate-slide-up sm:animate-none">

//             <div className="flex-shrink-0 flex justify-center pt-3 pb-1 sm:hidden">
//               <div className="w-10 h-1 bg-gray-300 rounded-full" />
//             </div>

//             {/* Modal Header */}
//             <div className="flex-shrink-0 px-4 sm:px-6 py-3 sm:py-4 border-b bg-gradient-to-r from-emerald-50 to-teal-50 sm:rounded-t-2xl">
//               <div className="flex items-center justify-between">
//                 <div className="min-w-0">
//                   <h3 className="text-base sm:text-xl font-bold text-gray-800 flex items-center gap-2">
//                     <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 flex-shrink-0" />
//                     Labour Management
//                   </h3>
//                   <div className="flex flex-wrap gap-x-2 mt-1">
//                     <span className="text-xs text-gray-500">
//                       UID: <span className="font-semibold text-indigo-600">{selectedItem.uid}</span>
//                     </span>
//                     <span className="text-xs text-gray-400 hidden sm:inline">|</span>
//                     <span className="text-xs text-gray-500 truncate max-w-[160px] sm:max-w-none">
//                       <span className="font-semibold text-emerald-600">{selectedItem.projectName}</span>
//                     </span>
//                   </div>
//                 </div>
//                 <button
//                   onClick={() => { setShowModal(false); resetForm(); }}
//                   className="p-2 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0 ml-2"
//                 >
//                   <X className="w-5 h-5 text-gray-500" />
//                 </button>
//               </div>
//             </div>

//             {/* Modal Body */}
//             <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">

//               {/* Quick Info */}
//               <div className="bg-gray-50 p-3 sm:p-4 rounded-xl">
//                 <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Request Info</h4>
//                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-sm">
//                   <InfoCell label="Work Type"     value={selectedItem.workType     || 'N/A'} />
//                   <InfoCell label="Total Labour"  value={selectedItem.totalLabour  || '0'}   valueClass="font-bold text-green-600 text-base" />
//                   <InfoCell label="Approved Head" value={selectedItem.Approved_Head_2 || 'N/A'} valueClass="text-purple-600 font-medium" />
//                   <InfoCell label="Date Required" value={selectedItem.dateRequired  || 'N/A'} valueClass="text-amber-600 font-medium" />
//                   <div className="col-span-2">
//                     <span className="text-xs text-gray-400 flex items-center gap-1">
//                       <User className="w-3 h-3" /> Contractor Name
//                     </span>
//                     <p className="font-semibold text-emerald-700 text-sm mt-0.5">{selectedItem.Name_Of_Contractor_2 || 'N/A'}</p>
//                   </div>
//                   <div className="col-span-2">
//                     <span className="text-xs text-gray-400 flex items-center gap-1">
//                       <Building2 className="w-3 h-3" /> Contractor Firm
//                     </span>
//                     <p className="font-semibold text-blue-700 text-sm mt-0.5">{selectedItem.Contractor_Firm_Name_2 || 'N/A'}</p>
//                   </div>
//                 </div>
//               </div>

//               {/* Status */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Status <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <select
//                     value={formData.Status_3}
//                     onChange={(e) => handleFormChange('Status_3', e.target.value)}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none bg-white cursor-pointer text-sm"
//                   >
//                     <option value="">-- Select Status --</option>
//                     <option value="Done">✅ Done</option>
//                     <option value="Reject">❌ Reject</option>
//                   </select>
//                   <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
//                 </div>
//               </div>

//               {/* Reject Message */}
//               {isRejected && (
//                 <div className="p-4 bg-red-50 rounded-xl border border-red-200 animate-fadeIn">
//                   <div className="flex items-center gap-2 text-red-700">
//                     <XCircle className="w-5 h-5" />
//                     <span className="text-sm font-semibold">Rejection Mode</span>
//                   </div>
//                   <p className="text-xs text-red-600 mt-2">
//                     You can add an optional remark and submit. Other fields are not required for rejection.
//                   </p>
//                 </div>
//               )}

//               {/* Fields when NOT rejected */}
//               {!isRejected && (
//                 <>
//                   {/* Labour Contractor Name */}
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 mb-2">
//                       <HardHat className="w-4 h-4 inline mr-1" />
//                       Labour Contractor Name
//                       <span className="text-gray-400 font-normal text-xs ml-1">(Enter manually)</span>
//                     </label>
//                     <input
//                       type="text"
//                       value={formData.Labouar_Contractor_Name_3}
//                       onChange={(e) => handleFormChange('Labouar_Contractor_Name_3', e.target.value)}
//                       placeholder="Enter labour contractor name..."
//                       className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
//                     />
//                     <p className="text-xs text-gray-400 mt-1">
//                       💡 Reference: {selectedItem.nameOfContractor || 'N/A'} ({selectedItem.contractorFirmName || 'No Firm'})
//                     </p>
//                   </div>

//                   {/* Labour Category 1 */}
//                   <div className="bg-blue-50 p-3 sm:p-4 rounded-xl space-y-3">
//                     <h4 className="text-sm font-semibold text-blue-800 flex items-center gap-2">
//                       <Users className="w-4 h-4" /> Labour Category 1
//                     </h4>
//                     <div className="grid grid-cols-3 gap-2">
//                       <div>
//                         <label className="block text-xs text-gray-600 mb-1">Category</label>
//                         <input disabled type="text" value={formData.Labour_Category_1_3}
//                           className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm bg-gray-50"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-xs text-gray-600 mb-1">No. of Labour</label>
//                         <input type="number" value={formData.Number_Of_Labour_1_3}
//                           onChange={(e) => handleFormChange('Number_Of_Labour_1_3', e.target.value)}
//                           className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-xs text-gray-600 mb-1">Rate (₹)</label>
//                         <input type="number" value={formData.Labour_Rate_1_3}
//                           onChange={(e) => handleFormChange('Labour_Rate_1_3', e.target.value)}
//                           className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
//                         />
//                       </div>
//                     </div>
//                   </div>

//                   {/* Labour Category 2 */}
//                   <div className="bg-cyan-50 p-3 sm:p-4 rounded-xl space-y-3">
//                     <h4 className="text-sm font-semibold text-cyan-800 flex items-center gap-2">
//                       <Users className="w-4 h-4" /> Labour Category 2
//                     </h4>
//                     <div className="grid grid-cols-3 gap-2">
//                       <div>
//                         <label className="block text-xs text-gray-600 mb-1">Category</label>
//                         <input disabled type="text" value={formData.Labour_Category_2_3}
//                           className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm bg-gray-50"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-xs text-gray-600 mb-1">No. of Labour</label>
//                         <input type="number" value={formData.Number_Of_Labour_2_3}
//                           onChange={(e) => handleFormChange('Number_Of_Labour_2_3', e.target.value)}
//                           className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs sm:text-sm"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-xs text-gray-600 mb-1">Rate (₹)</label>
//                         <input type="number" value={formData.Labour_Rate_2_3}
//                           onChange={(e) => handleFormChange('Labour_Rate_2_3', e.target.value)}
//                           className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs sm:text-sm"
//                         />
//                       </div>
//                     </div>
//                   </div>

//                   {/* ✅ Payment Details with Commission */}
//                   <div className="bg-green-50 p-3 sm:p-4 rounded-xl space-y-3">
//                     <h4 className="text-sm font-semibold text-green-800 flex items-center gap-2">
//                       <IndianRupee className="w-4 h-4" /> Payment Details
//                     </h4>
//                     <div className="grid grid-cols-2 gap-3">

//                       {/* Total Wages - Auto */}
//                       <div>
//                         <label className="block text-xs text-gray-600 mb-1">
//                           Total Wages <span className="text-green-500">(Auto)</span>
//                         </label>
//                         <div className="px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-bold text-green-600">
//                           ₹ {formData.Total_Wages_3 || '0'}
//                         </div>
//                       </div>

//                       {/* Conveyance */}
//                       <div>
//                         <label className="block text-xs text-gray-600 mb-1">
//                           <Truck className="w-3 h-3 inline mr-1" />Conveyance (₹)
//                         </label>
//                         <input
//                           type="number"
//                           value={formData.Conveyanance_3}
//                           onChange={(e) => handleFormChange('Conveyanance_3', e.target.value)}
//                           placeholder="0"
//                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
//                         />
//                       </div>

//                       {/* ✅ Commission - SEPARATE input, value goes to AP column ONLY */}
//                       <div className="col-span-2">
//                         <label className="block text-xs text-gray-600 mb-1">
//                           <IndianRupee className="w-3 h-3 inline mr-1" />
//                           Commission (₹)
//                           <span className="text-orange-500 text-xs ml-1 font-medium">
//                             → Goes to AP column | Added to Total Paid
//                           </span>
//                         </label>
//                         <input
//                           type="number"
//                           value={formData.Contractor_Commission}
//                           onChange={(e) => handleFormChange('Contractor_Commission', e.target.value)}
//                           placeholder="Enter commission amount..."
//                           className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm bg-orange-50"
//                         />
//                         {parseFloat(formData.Contractor_Commission) > 0 && (
//                           <div className="flex items-center gap-1.5 mt-1.5 text-xs text-orange-600 font-medium animate-fadeIn">
//                             <IndianRupee className="w-3 h-3" />
//                             <span>
//                               AP → ₹{formData.Contractor_Commission} (Commission only) | 
//                               AQ → ₹{formData.Total_Paid_Amount_3} (Total with Commission)
//                             </span>
//                           </div>
//                         )}
//                       </div>

//                       {/* Total Paid Amount - Auto */}
//                       <div className="col-span-2">
//                         <label className="block text-xs text-gray-600 mb-1">
//                           Total Paid Amount
//                           <span className="text-green-500 ml-1 text-xs">(Wages + Conveyance + Commission)</span>
//                         </label>
//                         <div className="px-3 py-3 bg-gradient-to-r from-green-100 to-emerald-100 border border-green-300 rounded-lg text-xl font-bold text-green-700 text-center">
//                           ₹ {formData.Total_Paid_Amount_3 || '0'}
//                         </div>
//                         <div className="flex items-center justify-center gap-2 mt-1.5 text-xs text-gray-500 flex-wrap">
//                           <span>₹{formData.Total_Wages_3 || '0'} Wages</span>
//                           <span className="text-gray-300">+</span>
//                           <span>₹{formData.Conveyanance_3 || '0'} Conv.</span>
//                           <span className="text-gray-300">+</span>
//                           <span className="text-orange-500 font-medium">
//                             ₹{formData.Contractor_Commission || '0'} Commission
//                           </span>
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Amount Distribution */}
//                   <div className="bg-purple-50 p-3 sm:p-4 rounded-xl space-y-3">
//                     <h4 className="text-sm font-semibold text-purple-800 flex items-center gap-2">
//                       <Building2 className="w-4 h-4" /> Amount Distribution
//                     </h4>
//                     <div className="grid grid-cols-2 gap-3">
//                       <div>
//                         <label className="block text-xs text-gray-600 mb-1">
//                           🏢 Company Head Amount <span className="text-purple-500">(Auto)</span>
//                         </label>
//                         <input
//                           type="number"
//                           value={formData.Company_Head_Amount_3}
//                           disabled
//                           className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-purple-100 text-purple-700 font-bold cursor-not-allowed"
//                         />
//                         <p className="text-xs text-purple-500 mt-1">= Total Paid Amount</p>
//                       </div>
//                       <div>
//                         <label className="block text-xs text-gray-600 mb-1">
//                           👷 Contractor Head Amount (₹)
//                           {!isCompanyHead && <span className="text-red-500 ml-1">*</span>}
//                         </label>
//                         <input
//                           type="number"
//                           value={formData.Contractor_Head_Amount_3}
//                           onChange={(e) => handleFormChange('Contractor_Head_Amount_3', e.target.value)}
//                           placeholder={isCompanyHead ? 'N/A – Company Head' : '0'}
//                           disabled={isCompanyHead}
//                           className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors ${
//                             isCompanyHead
//                               ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
//                               : 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-800'
//                           }`}
//                         />
//                         {!isCompanyHead && (
//                           <p className="text-xs text-blue-600 mt-1">This field is required</p>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </>
//               )}

//               {/* Remark */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Remark <span className="text-gray-400 font-normal">(Optional)</span>
//                 </label>
//                 <textarea
//                   value={formData.Remark_3}
//                   onChange={(e) => handleFormChange('Remark_3', e.target.value)}
//                   rows={3}
//                   placeholder={isRejected ? 'Enter reason for rejection...' : 'Enter any remarks...'}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none text-sm"
//                 />
//               </div>

//               {formError && (
//                 <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start gap-2">
//                   <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
//                   <p className="text-sm">{formError}</p>
//                 </div>
//               )}

//               <div className="h-2" />
//             </div>

//             {/* Modal Footer */}
//             <div className="flex-shrink-0 px-4 sm:px-6 py-3 sm:py-4 border-t bg-gray-50 flex gap-3 justify-end sm:rounded-b-2xl">
//               <button
//                 onClick={() => { setShowModal(false); resetForm(); }}
//                 className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-medium text-sm"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSubmit}
//                 disabled={isSubmitting || !formData.Status_3}
//                 className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg text-sm ${
//                   isRejected
//                     ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600'
//                     : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600'
//                 }`}
//               >
//                 {isSubmitting ? (
//                   <><Loader2 className="w-4 h-4 animate-spin" /><span>Submitting...</span></>
//                 ) : (
//                   <>
//                     {isRejected ? <XCircle className="w-4 h-4" /> : <Send className="w-4 h-4" />}
//                     <span>{isRejected ? 'Reject' : 'Submit'}</span>
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <style>{`
//         @keyframes slideUp {
//           from { transform: translateY(100%); }
//           to   { transform: translateY(0);    }
//         }
//         .animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1); }

//         @keyframes fadeIn {
//           from { opacity: 0; transform: translateY(-10px); }
//           to   { opacity: 1; transform: translateY(0);     }
//         }
//         .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
//       `}</style>
//     </div>
//   );
// };

// const InfoCell = ({ label, value, valueClass = 'text-gray-800 font-medium' }) => (
//   <div>
//     <span className="text-xs text-gray-400">{label}</span>
//     <p className={`text-sm mt-0.5 ${valueClass}`}>{value}</p>
//   </div>
// );

// export default LabourManagement;









import React, { useState, useEffect } from 'react';
import {
  useGetLabourManagementQuery,
  usePostLabourManagementMutation
} from '../../redux/Labour/LabourSlice';
import {
  Loader2, RefreshCw, User, Calendar, Users, FileText, Building,
  AlertCircle, Search, Filter, X, Wrench, Clock, Hash, Pencil, Send,
  ChevronDown, IndianRupee, Truck, Wallet, Building2, HardHat,
  ChevronRight, ChevronUp, XCircle, RotateCcw, Package
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
const focusGold = (e) => { e.target.style.borderColor = T.gold; e.target.style.boxShadow = `0 0 0 3px ${T.gold}15`; e.target.style.background = T.card; };
const blurNormal = (e) => { e.target.style.borderColor = T.border; e.target.style.boxShadow = 'none'; e.target.style.background = T.borderLight; };

const Td = ({ children, right, maxW, center, bold }) => (
  <td style={{ padding: '10px 14px', fontSize: 13, color: T.text, borderBottom: `1px solid ${T.border}`, whiteSpace: 'nowrap', textAlign: right ? 'right' : center ? 'center' : 'left', fontWeight: bold ? 600 : 400 }}>
    {maxW ? <span title={typeof children === 'string' ? children : ''} style={{ display: 'block', maxWidth: maxW, overflow: 'hidden', textOverflow: 'ellipsis' }}>{children || <span style={{ color: T.textMuted }}>—</span>}</span>
      : (children || <span style={{ color: T.textMuted }}>—</span>)}
  </td>
);

// ── Mobile Card ──
const MobileCard = ({ item, onAction }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{ background: T.card, borderRadius: 12, border: `1px solid ${T.border}`, marginBottom: 10, overflow: 'hidden' }}>
      <div style={{ padding: '12px 14px', background: T.navy, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
            <span style={{ background: `${T.gold}30`, color: T.goldLight, padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>{item.uid}</span>
            <span style={{ background: `${T.gold}20`, color: T.goldDark, padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{item.workType || 'N/A'}</span>
          </div>
          <p style={{ color: 'white', fontSize: 14, fontWeight: 600, margin: 0 }}>{item.projectName || 'N/A'}</p>
          <p style={{ color: T.textMuted, fontSize: 12, margin: '2px 0 0' }}>{item.projectEngineer || 'N/A'}</p>
        </div>
        <button onClick={() => onAction(item)} style={{ width: 36, height: 36, borderRadius: 8, border: 'none', background: T.gold, color: T.navyDark, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Pencil size={16} />
        </button>
      </div>
      <div style={{ padding: '12px 14px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
          <div style={{ textAlign: 'center', background: T.borderLight, borderRadius: 8, padding: 8 }}>
            <p style={{ fontSize: 10, color: T.textMuted }}>Planned</p>
            <p style={{ fontSize: 12, fontWeight: 700, color: T.navy }}>{item.planned3 || 'N/A'}</p>
          </div>
          <div style={{ textAlign: 'center', background: `${T.gold}10`, borderRadius: 8, padding: 8 }}>
            <p style={{ fontSize: 10, color: T.goldDark }}>Date Req.</p>
            <p style={{ fontSize: 12, fontWeight: 700, color: T.goldDark }}>{item.dateRequired || 'N/A'}</p>
          </div>
          <div style={{ textAlign: 'center', background: T.successBg, borderRadius: 8, padding: 8 }}>
            <p style={{ fontSize: 10, color: T.success }}>Labour</p>
            <p style={{ fontSize: 16, fontWeight: 800, color: T.success }}>{item.totalLabour || '0'}</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
          <div style={{ background: `${T.navy}08`, borderRadius: 8, padding: 10 }}>
            <p style={{ fontSize: 10, color: T.textMuted }}>Cat. 1</p>
            <p style={{ fontSize: 12, fontWeight: 600, color: T.navy }}>{item.labourCategory1 || 'N/A'}</p>
            <span style={{ background: `${T.navy}15`, color: T.navy, padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700, marginTop: 4, display: 'inline-block' }}>{item.numberOfLabour1 || '0'}</span>
          </div>
          <div style={{ background: `${T.gold}08`, borderRadius: 8, padding: 10 }}>
            <p style={{ fontSize: 10, color: T.goldDark }}>Cat. 2</p>
            <p style={{ fontSize: 12, fontWeight: 600, color: T.goldDark }}>{item.labourCategory2 || 'N/A'}</p>
            <span style={{ background: `${T.gold}15`, color: T.goldDark, padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700, marginTop: 4, display: 'inline-block' }}>{item.numberOfLabour2 || '0'}</span>
          </div>
        </div>
        <button onClick={() => setExpanded(!expanded)} style={{ width: '100%', padding: '8px 0', border: `1px dashed ${T.border}`, borderRadius: 8, background: 'transparent', color: T.textMuted, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {expanded ? 'Less' : 'More'}
        </button>
        {expanded && (
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: T.textMuted }}>Contractor</span><strong>{item.Name_Of_Contractor_2 || 'N/A'}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: T.textMuted }}>Firm</span><strong>{item.Contractor_Firm_Name_2 || '-'}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: T.textMuted }}>Head</span><strong style={{ color: T.purple }}>{item.Approved_Head_2 || 'N/A'}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: T.textMuted }}>Description</span><strong>{item.workDescription || 'N/A'}</strong></div>
          </div>
        )}
      </div>
    </div>
  );
};

const LabourManagement = () => {
  const { data: labourData, isLoading, isError, error, refetch, isFetching } = useGetLabourManagementQuery();
  const [postLabourManagement, { isLoading: isSubmitting }] = usePostLabourManagementMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    Status_3: '', Labouar_Contractor_Name_3: '', Labour_Category_1_3: '', Number_Of_Labour_1_3: '',
    Labour_Rate_1_3: '', Labour_Category_2_3: '', Number_Of_Labour_2_3: '', Labour_Rate_2_3: '',
    Total_Wages_3: '', Conveyanance_3: '', Contractor_Commission: '', Total_Paid_Amount_3: '',
    Company_Head_Amount_3: '', Contractor_Head_Amount_3: '', Remark_3: ''
  });

  const isRejected = formData.Status_3 === 'Reject';
  const isCompanyHead = selectedItem?.Approved_Head_2 === 'Company Head';

  const filteredData = labourData?.filter(item =>
    item.uid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.nameOfContractor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.projectEngineer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.workType?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Auto Calculate
  useEffect(() => {
    if (isRejected) return;
    const num1 = parseFloat(formData.Number_Of_Labour_1_3) || 0;
    const rate1 = parseFloat(formData.Labour_Rate_1_3) || 0;
    const num2 = parseFloat(formData.Number_Of_Labour_2_3) || 0;
    const rate2 = parseFloat(formData.Labour_Rate_2_3) || 0;
    const conv = parseFloat(formData.Conveyanance_3) || 0;
    const comm = parseFloat(formData.Contractor_Commission) || 0;
    const totalWages = (num1 * rate1) + (num2 * rate2);
    const totalPaid = totalWages + conv + comm;
    setFormData(prev => ({
      ...prev,
      Total_Wages_3: totalWages > 0 ? totalWages.toString() : '',
      Total_Paid_Amount_3: totalPaid > 0 ? totalPaid.toString() : '',
      Company_Head_Amount_3: totalPaid > 0 ? totalPaid.toString() : ''
    }));
  }, [formData.Number_Of_Labour_1_3, formData.Labour_Rate_1_3, formData.Number_Of_Labour_2_3, formData.Labour_Rate_2_3, formData.Conveyanance_3, formData.Contractor_Commission, isRejected]);

  const handleAction = (item) => {
    setSelectedItem(item); setFormError('');
    setFormData({
      Status_3: '', Labouar_Contractor_Name_3: '',
      Labour_Category_1_3: item.labourCategory1 || '', Number_Of_Labour_1_3: item.numberOfLabour1 || '', Labour_Rate_1_3: '',
      Labour_Category_2_3: item.labourCategory2 || '', Number_Of_Labour_2_3: item.numberOfLabour2 || '', Labour_Rate_2_3: '',
      Total_Wages_3: '', Conveyanance_3: '', Contractor_Commission: '', Total_Paid_Amount_3: '',
      Company_Head_Amount_3: '', Contractor_Head_Amount_3: '', Remark_3: ''
    });
    setShowModal(true);
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => {
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

  const resetForm = () => {
    setFormData({ Status_3: '', Labouar_Contractor_Name_3: '', Labour_Category_1_3: '', Number_Of_Labour_1_3: '', Labour_Rate_1_3: '', Labour_Category_2_3: '', Number_Of_Labour_2_3: '', Labour_Rate_2_3: '', Total_Wages_3: '', Conveyanance_3: '', Contractor_Commission: '', Total_Paid_Amount_3: '', Company_Head_Amount_3: '', Contractor_Head_Amount_3: '', Remark_3: '' });
    setFormError('');
  };

  const validateForm = () => {
    if (!formData.Status_3) { setFormError('Select Status'); return false; }
    if (formData.Status_3 === 'Reject') return true;
    if (!isCompanyHead && (!formData.Contractor_Head_Amount_3 || !formData.Contractor_Head_Amount_3.trim())) {
      setFormError('Contractor Head Amount required'); return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!selectedItem || !validateForm()) return;
    try {
      let payload = { uid: selectedItem.uid, Status_3: formData.Status_3, Remark_3: formData.Remark_3 || '' };
      if (formData.Status_3 !== 'Reject') {
        payload = { ...payload, Labouar_Contractor_Name_3: formData.Labouar_Contractor_Name_3, Labour_Category_1_3: formData.Labour_Category_1_3, Number_Of_Labour_1_3: formData.Number_Of_Labour_1_3, Labour_Rate_1_3: formData.Labour_Rate_1_3, Labour_Category_2_3: formData.Labour_Category_2_3, Number_Of_Labour_2_3: formData.Number_Of_Labour_2_3, Labour_Rate_2_3: formData.Labour_Rate_2_3, Total_Wages_3: formData.Total_Wages_3, Conveyanance_3: formData.Conveyanance_3, Contractor_Commission: formData.Contractor_Commission, Total_Paid_Amount_3: formData.Total_Paid_Amount_3, Company_Head_Amount_3: formData.Company_Head_Amount_3, Contractor_Head_Amount_3: formData.Contractor_Head_Amount_3 };
      }
      const result = await postLabourManagement(payload).unwrap();
      if (result.success) { alert(`✅ Updated! Row: ${result.rowNumber}`); setShowModal(false); setSelectedItem(null); resetForm(); refetch(); }
      else alert(`❌ Error: ${result.message}`);
    } catch (err) { alert(`❌ Error: ${err?.data?.message || err?.error || 'Failed'}`); }
  };

  if (isLoading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px' }}>
      <div style={{ width: 56, height: 56, borderRadius: 14, background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, boxShadow: `0 0 0 3px ${T.gold}30` }}>
        <Loader2 size={28} color={T.gold} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
      <p style={{ fontSize: 15, fontWeight: 600, color: T.navy }}>Loading Labour Data...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (isError) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px' }}>
      <AlertCircle size={40} color={T.danger} style={{ marginBottom: 12 }} />
      <p style={{ fontSize: 15, fontWeight: 600, color: T.danger }}>Error Loading Data</p>
      <button onClick={refetch} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 8, border: 'none', background: T.danger, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 12 }}>
        <RotateCcw size={14} /> Retry
      </button>
    </div>
  );

  const tableCols = [
    { label: 'Planned', w: 120 }, { label: 'UID', w: 70 }, { label: 'Project', w: 150 },
    { label: 'Engineer', w: 130 }, { label: 'Work Type', w: 100 }, { label: 'Description', w: 200 },
    { label: 'Cat 1', w: 100 }, { label: 'No.1', w: 60 }, { label: 'Cat 2', w: 100 }, { label: 'No.2', w: 60 },
    { label: 'Total', w: 60 }, { label: 'Date Req.', w: 120 }, { label: 'Contractor', w: 140 },
    { label: 'Firm', w: 130 }, { label: 'Head', w: 120 }, { label: 'Remark', w: 130 }, { label: 'Action', w: 80 },
  ];

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 8px' }}>

      {/* Header */}
      <div style={{ background: T.card, borderRadius: 10, border: `1px solid ${T.border}`, padding: '14px 18px', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wallet size={18} color={T.gold} />
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: T.navy, margin: 0 }}>Labour Management</h2>
            <p style={{ fontSize: 12, color: T.textMuted, margin: 0 }}>{filteredData.length} records</p>
          </div>
        </div>
        <button onClick={refetch} disabled={isFetching} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: `1.5px solid ${T.border}`, background: T.card, color: T.textLight, fontSize: 13, cursor: isFetching ? 'not-allowed' : 'pointer' }}>
          <RotateCcw size={14} style={isFetching ? { animation: 'spin 0.8s linear infinite' } : {}} /> Refresh
        </button>
      </div>

      {/* Search */}
      <div style={{ background: T.card, borderRadius: 10, border: `1px solid ${T.border}`, padding: '12px 16px', marginBottom: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.textMuted }} />
          <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            style={{ ...inputBase, paddingLeft: 36 }} onFocus={focusGold} onBlur={blurNormal} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: T.borderLight, borderRadius: 8, fontSize: 13, color: T.textLight, fontWeight: 600, whiteSpace: 'nowrap' }}>
          <Filter size={14} /> <span style={{ color: T.gold, fontWeight: 700 }}>{filteredData.length}</span>
        </div>
      </div>

      {filteredData.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px', background: T.card, borderRadius: 10, border: `1px solid ${T.border}` }}>
          <Package size={40} color={T.border} style={{ marginBottom: 12 }} />
          <p style={{ fontSize: 15, color: T.textLight }}>No records found</p>
        </div>
      ) : (
        <>
          {/* Mobile */}
          <div className="mobile-cards" style={{ display: 'none' }}>
            {filteredData.map((item, idx) => <MobileCard key={item.uid || idx} item={item} onAction={handleAction} />)}
          </div>

          {/* Desktop */}
          <div className="desktop-table" style={{ background: T.card, borderRadius: 10, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto', maxHeight: '65vh', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                  <tr style={{ background: T.navy }}>
                    {tableCols.map((col, i) => (
                      <th key={i} style={{ padding: '12px 14px', textAlign: col.label === 'Action' ? 'center' : 'left', color: T.goldLight, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap', minWidth: col.w, borderBottom: `2px solid ${T.gold}` }}>{col.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item, idx) => (
                    <tr key={item.uid || idx} style={{ background: idx % 2 === 0 ? T.card : T.borderLight }}
                      onMouseEnter={e => { e.currentTarget.style.background = `${T.gold}08`; }}
                      onMouseLeave={e => { e.currentTarget.style.background = idx % 2 === 0 ? T.card : T.borderLight; }}>
                      <Td><span style={{ background: `${T.purple}15`, color: T.purple, padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>{item.planned3 || 'N/A'}</span></Td>
                      <Td><span style={{ background: `${T.navy}15`, color: T.navy, padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>{item.uid}</span></Td>
                      <Td maxW={150} bold>{item.projectName}</Td>
                      <Td maxW={130}>{item.projectEngineer}</Td>
                      <Td><span style={{ background: `${T.gold}15`, color: T.goldDark, padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>{item.workType || 'N/A'}</span></Td>
                      <Td maxW={200}>{item.workDescription}</Td>
                      <Td>{item.labourCategory1}</Td>
                      <Td center><span style={{ background: `${T.navy}10`, color: T.navy, padding: '3px 8px', borderRadius: 6, fontWeight: 700 }}>{item.numberOfLabour1 || '0'}</span></Td>
                      <Td>{item.labourCategory2}</Td>
                      <Td center><span style={{ background: `${T.navy}10`, color: T.navy, padding: '3px 8px', borderRadius: 6, fontWeight: 700 }}>{item.numberOfLabour2 || '0'}</span></Td>
                      <Td center><span style={{ background: `${T.success}15`, color: T.success, padding: '3px 10px', borderRadius: 6, fontWeight: 800 }}>{item.totalLabour || '0'}</span></Td>
                      <Td><span style={{ background: `${T.gold}15`, color: T.goldDark, padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>{item.dateRequired || 'N/A'}</span></Td>
                      <Td maxW={130} bold>{item.Name_Of_Contractor_2}</Td>
                      <Td maxW={120}>{item.Contractor_Firm_Name_2}</Td>
                      <Td><span style={{ background: `${T.purple}15`, color: T.purple, padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>{item.Approved_Head_2 || 'N/A'}</span></Td>
                      <Td maxW={120}>{item.remark}</Td>
                      <td style={{ padding: '10px 14px', textAlign: 'center', borderBottom: `1px solid ${T.border}` }}>
                        <button onClick={() => handleAction(item)} style={{ width: 34, height: 34, borderRadius: 8, border: `1.5px solid ${T.gold}40`, background: `${T.gold}10`, color: T.goldDark, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
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
          </div>
        </>
      )}

      {/* ════ MODAL ════ */}
      {showModal && selectedItem && (
        <>
          <div onClick={() => { setShowModal(false); resetForm(); }} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(2px)', zIndex: 100 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '95%', maxWidth: 600, background: T.card, borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', zIndex: 101, display: 'flex', flexDirection: 'column', maxHeight: '92vh' }}>

            {/* Header */}
            <div style={{ background: T.navy, padding: '14px 20px', borderBottom: `2px solid ${T.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '14px 14px 0 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: `${T.gold}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Wallet size={16} color={T.gold} />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: 'white', margin: 0 }}>Labour Management</h3>
                  <p style={{ fontSize: 11, color: T.textMuted, margin: 0 }}>UID: <span style={{ color: T.gold }}>{selectedItem.uid}</span> | {selectedItem.projectName}</p>
                </div>
              </div>
              <button onClick={() => { setShowModal(false); resetForm(); }} style={{ width: 30, height: 30, borderRadius: 6, border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Quick Info */}
              <div style={{ background: T.borderLight, borderRadius: 10, padding: '12px 14px', border: `1px solid ${T.border}` }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px', fontSize: 12 }}>
                  <div><span style={{ color: T.textMuted }}>Work Type:</span> <strong>{selectedItem.workType}</strong></div>
                  <div><span style={{ color: T.textMuted }}>Total Labour:</span> <strong style={{ color: T.success }}>{selectedItem.totalLabour}</strong></div>
                  <div><span style={{ color: T.textMuted }}>Head:</span> <strong style={{ color: T.purple }}>{selectedItem.Approved_Head_2}</strong></div>
                  <div><span style={{ color: T.textMuted }}>Date:</span> <strong>{selectedItem.dateRequired}</strong></div>
                  <div><span style={{ color: T.textMuted }}>Contractor:</span> <strong>{selectedItem.Name_Of_Contractor_2}</strong></div>
                  <div><span style={{ color: T.textMuted }}>Firm:</span> <strong>{selectedItem.Contractor_Firm_Name_2}</strong></div>
                </div>
              </div>

              {/* Status */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>Status <span style={{ color: T.danger }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <select value={formData.Status_3} onChange={(e) => handleFormChange('Status_3', e.target.value)}
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
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: T.danger, margin: 0 }}>Rejection Mode</p>
                    <p style={{ fontSize: 11, color: T.danger, margin: '2px 0 0' }}>Add optional remark and submit.</p>
                  </div>
                </div>
              )}

              {!isRejected && (
                <>
                  {/* Labour Contractor */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>
                      <HardHat size={12} style={{ display: 'inline', marginRight: 4 }} />Labour Contractor Name
                    </label>
                    <input type="text" value={formData.Labouar_Contractor_Name_3}
                      onChange={(e) => handleFormChange('Labouar_Contractor_Name_3', e.target.value)}
                      placeholder="Enter name..." style={inputBase} onFocus={focusGold} onBlur={blurNormal} />
                  </div>

                  {/* Cat 1 */}
                  <div style={{ padding: 14, background: `${T.gold}08`, borderRadius: 10, border: `1px dashed ${T.gold}50` }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: T.goldDark, marginBottom: 10 }}>Labour Category 1</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, color: T.navyLight, marginBottom: 4 }}>Category</label>
                        <input type="text" value={formData.Labour_Category_1_3} disabled style={{ ...inputBase, background: T.borderLight, cursor: 'not-allowed' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, color: T.navyLight, marginBottom: 4 }}>No. of Labour</label>
                        <input type="number" value={formData.Number_Of_Labour_1_3} onChange={(e) => handleFormChange('Number_Of_Labour_1_3', e.target.value)} style={inputBase} onFocus={focusGold} onBlur={blurNormal} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, color: T.navyLight, marginBottom: 4 }}>Rate (₹)</label>
                        <input type="number" value={formData.Labour_Rate_1_3} onChange={(e) => handleFormChange('Labour_Rate_1_3', e.target.value)} style={inputBase} onFocus={focusGold} onBlur={blurNormal} />
                      </div>
                    </div>
                  </div>

                  {/* Cat 2 */}
                  <div style={{ padding: 14, background: `${T.navy}08`, borderRadius: 10, border: `1px dashed ${T.navy}30` }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: T.navy, marginBottom: 10 }}>Labour Category 2</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, color: T.navyLight, marginBottom: 4 }}>Category</label>
                        <input type="text" value={formData.Labour_Category_2_3} disabled style={{ ...inputBase, background: T.borderLight, cursor: 'not-allowed' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, color: T.navyLight, marginBottom: 4 }}>No. of Labour</label>
                        <input type="number" value={formData.Number_Of_Labour_2_3} onChange={(e) => handleFormChange('Number_Of_Labour_2_3', e.target.value)} style={inputBase} onFocus={focusGold} onBlur={blurNormal} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, color: T.navyLight, marginBottom: 4 }}>Rate (₹)</label>
                        <input type="number" value={formData.Labour_Rate_2_3} onChange={(e) => handleFormChange('Labour_Rate_2_3', e.target.value)} style={inputBase} onFocus={focusGold} onBlur={blurNormal} />
                      </div>
                    </div>
                  </div>

                  {/* Payment */}
                  <div style={{ padding: 14, background: T.successBg, borderRadius: 10, border: `1px solid ${T.successBorder}` }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#065f46', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <IndianRupee size={14} /> Payment Details
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, color: T.navyLight, marginBottom: 4 }}>Total Wages <span style={{ color: T.success }}>(Auto)</span></label>
                        <div style={{ padding: '8px 12px', background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 13, fontWeight: 700, color: T.success }}>₹ {formData.Total_Wages_3 || '0'}</div>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, color: T.navyLight, marginBottom: 4 }}>Conveyance (₹)</label>
                        <input type="number" value={formData.Conveyanance_3} onChange={(e) => handleFormChange('Conveyanance_3', e.target.value)} placeholder="0" style={inputBase} onFocus={focusGold} onBlur={blurNormal} />
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', fontSize: 11, color: T.navyLight, marginBottom: 4 }}>Commission (₹) <span style={{ color: T.goldDark }}>→ AP column</span></label>
                        <input type="number" value={formData.Contractor_Commission} onChange={(e) => handleFormChange('Contractor_Commission', e.target.value)} placeholder="0" style={{ ...inputBase, border: `1.5px solid ${T.gold}` }} onFocus={focusGold} onBlur={blurNormal} />
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', fontSize: 11, color: T.navyLight, marginBottom: 4 }}>Total Paid <span style={{ color: T.success }}>(Auto)</span></label>
                        <div style={{ padding: '12px', background: `${T.success}15`, border: `2px solid ${T.success}40`, borderRadius: 8, fontSize: 18, fontWeight: 800, color: T.success, textAlign: 'center' }}>₹ {formData.Total_Paid_Amount_3 || '0'}</div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 6, fontSize: 11, color: T.textMuted }}>
                          <span>₹{formData.Total_Wages_3 || '0'} Wages</span>
                          <span>+</span>
                          <span>₹{formData.Conveyanance_3 || '0'} Conv.</span>
                          <span>+</span>
                          <span style={{ color: T.goldDark, fontWeight: 600 }}>₹{formData.Contractor_Commission || '0'} Comm.</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Amount Distribution */}
                  <div style={{ padding: 14, background: `${T.purple}08`, borderRadius: 10, border: `1px dashed ${T.purple}40` }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: T.purple, marginBottom: 10 }}>Amount Distribution</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, color: T.navyLight, marginBottom: 4 }}>🏢 Company Head <span style={{ color: T.success }}>(Auto)</span></label>
                        <input type="number" value={formData.Company_Head_Amount_3} disabled style={{ ...inputBase, background: `${T.purple}10`, fontWeight: 700, color: T.purple, cursor: 'not-allowed' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, color: T.navyLight, marginBottom: 4 }}>
                          👷 Contractor Head {!isCompanyHead && <span style={{ color: T.danger }}>*</span>}
                        </label>
                        <input type="number" value={formData.Contractor_Head_Amount_3}
                          onChange={(e) => handleFormChange('Contractor_Head_Amount_3', e.target.value)}
                          placeholder={isCompanyHead ? 'N/A' : '0'}
                          disabled={isCompanyHead}
                          style={{ ...inputBase, background: isCompanyHead ? T.borderLight : T.card, cursor: isCompanyHead ? 'not-allowed' : 'text' }}
                          onFocus={!isCompanyHead ? focusGold : undefined}
                          onBlur={!isCompanyHead ? blurNormal : undefined} />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Remark */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>Remark <span style={{ fontSize: 10, color: T.textMuted }}>(Optional)</span></label>
                <textarea value={formData.Remark_3} onChange={(e) => handleFormChange('Remark_3', e.target.value)}
                  rows={3} placeholder={isRejected ? "Reason for rejection..." : "Remarks..."}
                  style={{ ...inputBase, resize: 'vertical', minHeight: 70 }} onFocus={focusGold} onBlur={blurNormal} />
              </div>

              {formError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: T.dangerBg, border: `1px solid ${T.dangerBorder}`, borderRadius: 8, fontSize: 13, color: T.danger }}>
                  <AlertCircle size={16} /> {formError}
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '14px 20px', borderTop: `1px solid ${T.border}`, background: T.borderLight, display: 'flex', justifyContent: 'flex-end', gap: 10, borderRadius: '0 0 14px 14px' }}>
              <button onClick={() => { setShowModal(false); resetForm(); }} style={{ padding: '10px 20px', borderRadius: 8, border: `1.5px solid ${T.border}`, background: T.card, color: T.textLight, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSubmit} disabled={isSubmitting || !formData.Status_3}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '10px 24px', borderRadius: 8, border: 'none',
                  background: isSubmitting || !formData.Status_3 ? T.border : isRejected ? `linear-gradient(135deg, ${T.danger}, #dc2626)` : `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
                  color: isSubmitting || !formData.Status_3 ? T.textMuted : isRejected ? 'white' : T.navyDark,
                  fontSize: 13, fontWeight: 700, cursor: isSubmitting || !formData.Status_3 ? 'not-allowed' : 'pointer',
                }}>
                {isSubmitting ? <><Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> Submitting...</>
                  : isRejected ? <><XCircle size={15} /> Reject</>
                  : <><Send size={15} /> Submit</>}
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

export default LabourManagement;