
// import React, { useState, useMemo, useEffect } from 'react';
// import {
//   useGetSiteApprovalQuery,
//   usePostSiteApprovalMutation,
// } from '../../redux/SiteExpenses/SiteExpensesSlice';
// import {
//   useGetProjectDropdownQuery
// } from '../../redux/Labour/LabourSlice';
// import {
//   CheckCircle,
//   Loader2,
//   RefreshCw,
//   User,
//   FileText,
//   Building,
//   AlertCircle,
//   Search,
//   Filter,
//   X,
//   Clock,
//   Hash,
//   Pencil,
//   ChevronDown,
//   UserCircle,
//   Building2,
//   IndianRupee,
//   Receipt,
//   Briefcase,
//   ExternalLink
// } from 'lucide-react';

// const SiteApprovel = () => {
//   const { data = [], isLoading, isError, refetch, isFetching } = useGetSiteApprovalQuery();
//   const [postSiteApproval, { isLoading: isSubmitting }] = usePostSiteApprovalMutation();

//   const {
//     data: contractorDropdownData = [],
//     isLoading: isLoadingContractors
//   } = useGetProjectDropdownQuery();

//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterProject, setFilterProject] = useState('');
//   const [selectedRow, setSelectedRow] = useState(null);
//   const [modalOpen, setModalOpen] = useState(false);

//   const [formData, setFormData] = useState({
//     status: '',
//     Approve_Amount: '',
//     Confirm_Head: '',
//     Name_Of_Contractor: '',
//     Contractor_Firm_Name: '',
//     remark: '',
//   });

//   const isContractorHead = formData.Confirm_Head === 'Contractor Head';

//   useEffect(() => {
//     console.log('=== Site Approval Data ===');
//     console.log('Data:', data);
//     console.log('Contractor Dropdown:', contractorDropdownData);
//   }, [data, contractorDropdownData]);

//   const projectNames = useMemo(() => {
//     const names = [...new Set(data.map((item) => item.projectName).filter(Boolean))];
//     return names.sort();
//   }, [data]);

//   const filteredData = useMemo(() => {
//     return data.filter((item) => {
//       const matchesSearch =
//         !searchTerm ||
//         item.payeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         item.uid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         item.RccBillNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         item.ContractorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         item.detailsOfWork?.toLowerCase().includes(searchTerm.toLowerCase());

//       const matchesProject = !filterProject || item.projectName === filterProject;

//       return matchesSearch && matchesProject;
//     });
//   }, [data, searchTerm, filterProject]);

//   const handleOpenModal = (row) => {
//     setSelectedRow(row);
//     setFormData({
//       status: '',
//       Approve_Amount: row.costAmount || '',
//       Confirm_Head: '',
//       Name_Of_Contractor: '',
//       Contractor_Firm_Name: '',
//       remark: '',
//     });
//     setModalOpen(true);
//   };

//   const handleCloseModal = () => {
//     setModalOpen(false);
//     setSelectedRow(null);
//     setFormData({
//       status: '',
//       Approve_Amount: '',
//       Confirm_Head: '',
//       Name_Of_Contractor: '',
//       Contractor_Firm_Name: '',
//       remark: '',
//     });
//   };

//   const handleFormChange = (field, value) => {
//     setFormData(prev => {
//       const newData = {
//         ...prev,
//         [field]: value
//       };

//       if (field === 'Confirm_Head' && value !== 'Contractor Head') {
//         newData.Name_Of_Contractor = '';
//         newData.Contractor_Firm_Name = '';
//       }

//       return newData;
//     });
//   };

//   const handleContractorSelect = (contractorName) => {
//     const selectedContractor = contractorDropdownData.find(
//       item => item.contractorName === contractorName
//     );

//     console.log('Selected Contractor:', selectedContractor);

//     setFormData(prev => ({
//       ...prev,
//       Name_Of_Contractor: contractorName,
//       Contractor_Firm_Name: selectedContractor?.contractorFirmName || ''
//     }));
//   };

//   // ✅ Open URL in New Tab
//   const openInNewTab = (url) => {
//     if (!url) {
//       alert('No image URL available');
//       return;
//     }
//     window.open(url, '_blank', 'noopener,noreferrer');
//   };

//   const handleSubmit = async (statusValue) => {
//     if (!selectedRow) return;

//     const updatedFormData = { ...formData, status: statusValue };
//     setFormData(updatedFormData);

//     if (!updatedFormData.Approve_Amount) {
//       alert('Please enter Approve Amount');
//       return;
//     }

//     if (!updatedFormData.Confirm_Head) {
//       alert('Please select Confirm Head');
//       return;
//     }

//     if (updatedFormData.Confirm_Head === 'Contractor Head') {
//       if (!updatedFormData.Name_Of_Contractor.trim()) {
//         alert('Please select Name of Contractor');
//         return;
//       }
//       if (!updatedFormData.Contractor_Firm_Name.trim()) {
//         alert('Contractor Firm Name is required');
//         return;
//       }
//     }

//     try {
//       const payload = {
//         uid: selectedRow.uid,
//         status: statusValue,
//         Approve_Amount: updatedFormData.Approve_Amount,
//         Confirm_Head: updatedFormData.Confirm_Head,
//         remark: updatedFormData.remark,
//       };

//       if (updatedFormData.Confirm_Head === 'Contractor Head') {
//         payload.Name_Of_Contractor = updatedFormData.Name_Of_Contractor;
//         payload.Contractor_Firm_Name = updatedFormData.Contractor_Firm_Name;
//       }

//       console.log('Submitting payload:', payload);

//       await postSiteApproval(payload).unwrap();

//       alert(`✅ Successfully ${statusValue === 'Approved' ? 'Approved' : 'Rejected'}!`);
//       handleCloseModal();
//       refetch();
//     } catch (err) {
//       console.error('Error:', err);
//       alert('❌ Error: ' + (err?.data?.message || 'Something went wrong'));
//     }
//   };

//   const formatCurrency = (val) => {
//     if (!val) return '—';
//     const num = parseFloat(val);
//     if (isNaN(num)) return val;
//     return '₹' + num.toLocaleString('en-IN');
//   };

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="flex flex-col items-center gap-3">
//           <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
//           <p className="text-gray-500 text-sm font-medium">Loading site approvals...</p>
//         </div>
//       </div>
//     );
//   }

//   if (isError) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="text-center bg-red-50 border border-red-200 rounded-xl p-6 max-w-md">
//           <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
//           <p className="text-red-600 font-semibold text-lg mb-2">Failed to load data</p>
//           <p className="text-red-400 text-sm mb-4">Please check your connection and try again.</p>
//           <button
//             onClick={refetch}
//             className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium flex items-center gap-2 mx-auto"
//           >
//             <RefreshCw className="w-4 h-4" />
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4 p-4">
//       {/* Header Stats */}
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
//         <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-md">
//           <p className="text-blue-100 text-xs font-medium uppercase tracking-wide">Total Pending</p>
//           <p className="text-2xl font-bold mt-1">{data.length}</p>
//         </div>
//         <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-4 text-white shadow-md">
//           <p className="text-amber-100 text-xs font-medium uppercase tracking-wide">Filtered</p>
//           <p className="text-2xl font-bold mt-1">{filteredData.length}</p>
//         </div>
//         <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 text-white shadow-md">
//           <p className="text-green-100 text-xs font-medium uppercase tracking-wide">Total Amount</p>
//           <p className="text-2xl font-bold mt-1">
//             {formatCurrency(
//               filteredData.reduce((sum, item) => sum + (parseFloat(item.costAmount) || 0), 0)
//             )}
//           </p>
//         </div>
//       </div>

//       {/* Search & Filter Bar */}
//       <div className="flex flex-col sm:flex-row gap-3 bg-white rounded-xl p-3 shadow-sm border border-gray-100">
//         <div className="flex-1 relative">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//           <input
//             type="text"
//             placeholder="Search by name, UID, bill no, contractor..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//           />
//         </div>
//         <select
//           value={filterProject}
//           onChange={(e) => setFilterProject(e.target.value)}
//           className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white min-w-[180px]"
//         >
//           <option value="">All Projects</option>
//           {projectNames.map((name) => (
//             <option key={name} value={name}>{name}</option>
//           ))}
//         </select>
//         <button
//           onClick={refetch}
//           disabled={isFetching}
//           className="px-4 py-2.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition text-sm font-medium flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
//         >
//           <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
//           Refresh
//         </button>
//       </div>

//       {/* Results Count */}
//       <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl w-fit">
//         <Filter className="w-5 h-5 text-gray-500" />
//         <span className="text-gray-600 font-medium">
//           Total: <span className="text-indigo-600 font-bold">{filteredData.length}</span> Records
//         </span>
//       </div>

//       {/* Table */}
//       {filteredData.length === 0 ? (
//         <div className="flex items-center justify-center h-40 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
//           <div className="text-center">
//             <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
//             <p className="text-gray-400 font-medium">No pending approvals found</p>
//           </div>
//         </div>
//       ) : (
//         <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm min-w-[1600px]">
//               <thead>
//                 <tr className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
//                   <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide">#</th>
//                   <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide">
//                     <div className="flex items-center gap-1">
//                       <Hash className="w-3 h-3" />
//                       RCC Bill No
//                     </div>
//                   </th>
//                   <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide">
//                     <div className="flex items-center gap-1">
//                       <User className="w-3 h-3" />
//                       Payee Name
//                     </div>
//                   </th>
//                   <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide">
//                     <div className="flex items-center gap-1">
//                       <Building className="w-3 h-3" />
//                       Project
//                     </div>
//                   </th>
//                   <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide">Engineer</th>
//                   <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide">Head Type</th>
//                   <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide">Details</th>
//                   <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wide">
//                     <div className="flex items-center gap-1 justify-end">
//                       <IndianRupee className="w-3 h-3" />
//                       Amount
//                     </div>
//                   </th>
//                   <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide">Bill No</th>
//                   <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide">
//                     <div className="flex items-center gap-1">
//                       <Clock className="w-3 h-3" />
//                       Bill Date
//                     </div>
//                   </th>
//                   <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide">Exp Head</th>
//                   <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide">Contractor</th>
//                   <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide">Firm</th>
//                   <th className="text-center px-4 py-3 font-semibold text-xs uppercase tracking-wide">Bill Photo</th>
//                   <th className="text-center px-4 py-3 font-semibold text-xs uppercase tracking-wide sticky right-0 bg-indigo-600">Action</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-50">
//                 {filteredData.map((row, index) => (
//                   <tr key={row.uid || index} className="hover:bg-indigo-50/30 transition-colors">
//                     <td className="px-4 py-3 text-gray-500 font-medium">{index + 1}</td>
//                     <td className="px-4 py-3">
//                       <span className="inline-flex items-center px-2 py-1 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-bold">
//                         {row.RccBillNo || '—'}
//                       </span>
//                     </td>
//                     <td className="px-4 py-3 text-gray-700 font-medium">{row.payeeName || '—'}</td>
//                     <td className="px-4 py-3">
//                       <span className="inline-block bg-blue-50 text-blue-700 text-xs font-medium px-2 py-1 rounded-md">
//                         {row.projectName || '—'}
//                       </span>
//                     </td>
//                     <td className="px-4 py-3 text-gray-600">{row.projectEngineerName || '—'}</td>
//                     <td className="px-4 py-3">
//                       <span className="inline-flex items-center px-2 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">
//                         {row.headType || '—'}
//                       </span>
//                     </td>
//                     <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate" title={row.detailsOfWork}>
//                       {row.detailsOfWork || '—'}
//                     </td>
//                     <td className="px-4 py-3 text-right">
//                       <span className="font-bold text-green-700">{row.costAmount}</span>
//                     </td>
//                     <td className="px-4 py-3 text-gray-600">{row.BillNO || '—'}</td>
//                     <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{row.BillDate || '—'}</td>
//                     <td className="px-4 py-3 text-gray-600">{row.EXPHead || '—'}</td>
//                     <td className="px-4 py-3">
//                       <div className="flex items-center gap-2">
//                         <div className="w-7 h-7 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
//                           <span className="text-white font-semibold text-xs">
//                             {row.ContractorName?.charAt(0)?.toUpperCase() || 'C'}
//                           </span>
//                         </div>
//                         <span className="text-gray-700 text-sm">{row.ContractorName || '—'}</span>
//                       </div>
//                     </td>
//                     <td className="px-4 py-3 text-gray-600">{row.ContractorFirmName || '—'}</td>
                    
//                     {/* ✅ FIXED: Single Button - Open in New Tab */}
//                     <td className="px-4 py-3 text-center">
//                       {row.billPhoto ? (
//                         <button
//                           onClick={() => openInNewTab(row.billPhoto)}
//                           className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition text-xs font-medium"
//                           title="Open in New Tab"
//                         >
//                           <ExternalLink className="w-3.5 h-3.5" />
//                           View
//                         </button>
//                       ) : (
//                         <span className="text-gray-300">—</span>
//                       )}
//                     </td>
                    
//                     <td className="px-4 py-3 text-center sticky right-0 bg-white shadow-[-4px_0_8px_rgba(0,0,0,0.1)]">
//                       <button
//                         onClick={() => handleOpenModal(row)}
//                         className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-md"
//                         title="Review"
//                       >
//                         <Pencil className="w-4 h-4" />
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
//             <div className="flex items-center justify-between">
//               <p className="text-sm text-gray-600">
//                 Showing <span className="font-semibold text-indigo-600">{filteredData.length}</span> records
//               </p>
//               <p className="text-xs text-gray-400">
//                 Scroll horizontally to view all columns →
//               </p>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Approval Modal */}
//       {modalOpen && selectedRow && (
//         <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
//             {/* Modal Header */}
//             <div className="flex-shrink-0 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 rounded-t-2xl flex items-center justify-between">
//               <div>
//                 <h3 className="text-white font-bold text-lg flex items-center gap-2">
//                   <Pencil className="w-5 h-5" />
//                   Review Approval
//                 </h3>
//                 <p className="text-indigo-200 text-xs mt-0.5">UID: {selectedRow.uid}</p>
//               </div>
//               <button onClick={handleCloseModal} className="text-white/80 hover:text-white transition p-1">
//                 <X className="w-6 h-6" />
//               </button>
//             </div>

//             {/* Modal Body */}
//             <div className="flex-1 overflow-y-auto p-6 space-y-4">
//               {/* Info Summary */}
//               <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
//                 <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Request Details</h4>
//                 <div className="grid grid-cols-2 gap-3">
//                   <div>
//                     <span className="text-xs text-gray-400">Payee Name</span>
//                     <p className="font-medium text-gray-800 truncate">{selectedRow.payeeName}</p>
//                   </div>
//                   <div>
//                     <span className="text-xs text-gray-400">Project</span>
//                     <p className="font-medium text-gray-800 truncate">{selectedRow.projectName}</p>
//                   </div>
//                   <div>
//                     <span className="text-xs text-gray-400">Head Type</span>
//                     <p className="font-medium text-gray-800">{selectedRow.headType}</p>
//                   </div>
//                   <div>
//                     <span className="text-xs text-gray-400">Contractor</span>
//                     <p className="font-medium text-gray-800 truncate">{selectedRow.ContractorName}</p>
//                   </div>
//                   <div>
//                     <span className="text-xs text-gray-400">Bill No</span>
//                     <p className="font-medium text-gray-800">{selectedRow.BillNO}</p>
//                   </div>
//                   <div>
//                     <span className="text-xs text-gray-400">Requested Amount</span>
//                     <p className="font-bold text-green-700">{(selectedRow.costAmount)}</p>
//                   </div>
//                 </div>
                
//                 {/* Bill Photo Link in Modal */}
//                 {selectedRow.billPhoto && (
//                   <div className="pt-3 border-t border-gray-200 mt-3">
//                     <div className="flex items-center justify-between">
//                       <span className="text-xs text-gray-400">Bill Photo</span>
//                       <button
//                         onClick={() => openInNewTab(selectedRow.billPhoto)}
//                         className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium"
//                       >
//                         <ExternalLink className="w-3 h-3" />
//                         View Bill Photo
//                       </button>
//                     </div>
//                   </div>
//                 )}
                
//                 <div className="pt-2 border-t border-gray-200 mt-2">
//                   <span className="text-xs text-gray-400">Details of Work</span>
//                   <p className="text-sm text-gray-700 mt-1">{selectedRow.detailsOfWork || 'N/A'}</p>
//                 </div>
//               </div>

//               {/* Form Fields */}
//               <div className="space-y-4">
//                 {/* Approve Amount */}
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     <IndianRupee className="w-4 h-4 inline mr-1" />
//                     Approve Amount <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="number"
//                     value={formData.Approve_Amount}
//                     onChange={(e) => handleFormChange('Approve_Amount', e.target.value)}
//                     className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//                     placeholder="Enter approved amount"
//                   />
//                 </div>

//                 {/* Confirm Head Dropdown */}
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     <Briefcase className="w-4 h-4 inline mr-1" />
//                     Confirm Head <span className="text-red-500">*</span>
//                   </label>
//                   <div className="relative">
//                     <select
//                       value={formData.Confirm_Head}
//                       onChange={(e) => handleFormChange('Confirm_Head', e.target.value)}
//                       className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white cursor-pointer"
//                     >
//                       <option value="">-- Select Confirm Head --</option>
//                       <option value="Company Head">🏢 Company Head</option>
//                       <option value="Contractor Head">👷 Contractor Head</option>
//                     </select>
//                     <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
//                   </div>
//                 </div>

//                 {/* Contractor Fields */}
//                 {isContractorHead && (
//                   <div className="space-y-4 p-4 bg-blue-50 rounded-xl border border-blue-200 animate-fadeIn">
//                     <div className="flex items-center gap-2 text-blue-700 mb-2">
//                       <UserCircle className="w-5 h-5" />
//                       <span className="text-sm font-semibold">Contractor Details</span>
//                     </div>

//                     {/* Name of Contractor */}
//                     <div>
//                       <label className="block text-sm font-semibold text-gray-700 mb-2">
//                         Name of Contractor <span className="text-red-500">*</span>
//                       </label>
//                       <div className="relative">
//                         <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                         <select
//                           value={formData.Name_Of_Contractor}
//                           onChange={(e) => handleContractorSelect(e.target.value)}
//                           disabled={isLoadingContractors}
//                           className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed"
//                         >
//                           <option value="">
//                             {isLoadingContractors ? 'Loading contractors...' : '-- Select Contractor --'}
//                           </option>
//                           {contractorDropdownData.map((contractor, index) => (
//                             <option key={index} value={contractor.contractorName}>
//                               {contractor.contractorName}
//                             </option>
//                           ))}
//                         </select>
//                         <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
//                       </div>
//                       <p className="text-xs text-gray-400 mt-1">
//                         {contractorDropdownData.length || 0} contractors available
//                       </p>
//                     </div>

//                     {/* Contractor Firm Name */}
//                     <div>
//                       <label className="block text-sm font-semibold text-gray-700 mb-2">
//                         Contractor Firm Name <span className="text-red-500">*</span>
//                         <span className="text-xs text-green-600 ml-2">(Auto-filled)</span>
//                       </label>
//                       <div className="relative">
//                         <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                         <input
//                           type="text"
//                           value={formData.Contractor_Firm_Name}
//                           readOnly
//                           placeholder="Select contractor to auto-fill..."
//                           className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl bg-gray-100 cursor-not-allowed text-sm text-gray-700"
//                         />
//                         {formData.Contractor_Firm_Name && (
//                           <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* Remark */}
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     <Receipt className="w-4 h-4 inline mr-1" />
//                     Remark <span className="text-gray-400 font-normal">(Optional)</span>
//                   </label>
//                   <textarea
//                     value={formData.remark}
//                     onChange={(e) => handleFormChange('remark', e.target.value)}
//                     rows={3}
//                     className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
//                     placeholder="Enter remark (optional)"
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Modal Footer */}
//             <div className="flex-shrink-0 bg-gray-50 border-t border-gray-100 px-6 py-4 rounded-b-2xl flex gap-3">
//               <button
//                 onClick={handleCloseModal}
//                 className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition text-sm font-medium"
//                 disabled={isSubmitting}
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={() => handleSubmit('Rejected')}
//                 disabled={isSubmitting || !formData.Approve_Amount || !formData.Confirm_Head || (isContractorHead && (!formData.Name_Of_Contractor || !formData.Contractor_Firm_Name))}
//                 className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2"
//               >
//                 {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
//                 Reject
//               </button>
//               <button
//                 onClick={() => handleSubmit('Approved')}
//                 disabled={isSubmitting || !formData.Approve_Amount || !formData.Confirm_Head || (isContractorHead && (!formData.Name_Of_Contractor || !formData.Contractor_Firm_Name))}
//                 className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2"
//               >
//                 {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
//                 Approve
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* CSS for animation */}
//       <style jsx>{`
//         @keyframes fadeIn {
//           from {
//             opacity: 0;
//             transform: translateY(-10px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
//         .animate-fadeIn {
//           animation: fadeIn 0.3s ease-out;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default SiteApprovel;




import React, { useState, useMemo, useEffect } from 'react';
import {
  useGetSiteApprovalQuery, usePostSiteApprovalMutation
} from '../../redux/SiteExpenses/SiteExpensesSlice';
import { useGetProjectDropdownQuery } from '../../redux/Labour/LabourSlice';
import {
  CheckCircle, Loader2, RefreshCw, User, FileText, Building, AlertCircle,
  Search, Filter, X, Clock, Hash, Pencil, ChevronDown, UserCircle, Building2,
  IndianRupee, Receipt, Briefcase, ExternalLink, RotateCcw, Package
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

const Td = ({ children, right, maxW, center, bold }) => (
  <td style={{ padding: '10px 14px', fontSize: 13, color: T.text, borderBottom: `1px solid ${T.border}`, whiteSpace: 'nowrap', textAlign: right ? 'right' : center ? 'center' : 'left', fontWeight: bold ? 600 : 400 }}>
    {maxW ? <span title={typeof children === 'string' ? children : ''} style={{ display: 'block', maxWidth: maxW, overflow: 'hidden', textOverflow: 'ellipsis' }}>{children || <span style={{ color: T.textMuted }}>—</span>}</span>
      : (children || <span style={{ color: T.textMuted }}>—</span>)}
  </td>
);

const SiteApprovel = () => {
  const { data = [], isLoading, isError, refetch, isFetching } = useGetSiteApprovalQuery();
  const [postSiteApproval, { isLoading: isSubmitting }] = usePostSiteApprovalMutation();
  const { data: contractorDropdownData = [], isLoading: isLoadingContractors } = useGetProjectDropdownQuery();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [selectedRow, setSelectedRow] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    status: '', Approve_Amount: '', Confirm_Head: '',
    Name_Of_Contractor: '', Contractor_Firm_Name: '', remark: '',
  });

  const isContractorHead = formData.Confirm_Head === 'Contractor Head';

  const projectNames = useMemo(() => [...new Set(data.map(i => i.projectName).filter(Boolean))].sort(), [data]);

  const filteredData = useMemo(() => data.filter(item => {
    const s = searchTerm.toLowerCase();
    const match = !s || [item.payeeName, item.uid, item.RccBillNo, item.ContractorName, item.detailsOfWork].some(v => (v || '').toLowerCase().includes(s));
    return match && (!filterProject || item.projectName === filterProject);
  }), [data, searchTerm, filterProject]);

  const handleOpenModal = (row) => {
    setSelectedRow(row);
    setFormData({ status: '', Approve_Amount: row.costAmount || '', Confirm_Head: '', Name_Of_Contractor: '', Contractor_Firm_Name: '', remark: '' });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false); setSelectedRow(null);
    setFormData({ status: '', Approve_Amount: '', Confirm_Head: '', Name_Of_Contractor: '', Contractor_Firm_Name: '', remark: '' });
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => {
      const n = { ...prev, [field]: value };
      if (field === 'Confirm_Head' && value !== 'Contractor Head') { n.Name_Of_Contractor = ''; n.Contractor_Firm_Name = ''; }
      return n;
    });
  };

  const handleContractorSelect = (name) => {
    const c = contractorDropdownData.find(i => i.contractorName === name);
    setFormData(prev => ({ ...prev, Name_Of_Contractor: name, Contractor_Firm_Name: c?.contractorFirmName || '' }));
  };

  const openInNewTab = (url) => { if (!url) return alert('No URL'); window.open(url, '_blank', 'noopener,noreferrer'); };

  const handleSubmit = async (statusValue) => {
    if (!selectedRow) return;
    const fd = { ...formData, status: statusValue };
    if (!fd.Approve_Amount) return alert('Enter Approve Amount');
    if (!fd.Confirm_Head) return alert('Select Confirm Head');
    if (fd.Confirm_Head === 'Contractor Head' && (!fd.Name_Of_Contractor.trim() || !fd.Contractor_Firm_Name.trim())) return alert('Contractor details required');

    try {
      const payload = { uid: selectedRow.uid, status: statusValue, Approve_Amount: fd.Approve_Amount, Confirm_Head: fd.Confirm_Head, remark: fd.remark };
      if (fd.Confirm_Head === 'Contractor Head') { payload.Name_Of_Contractor = fd.Name_Of_Contractor; payload.Contractor_Firm_Name = fd.Contractor_Firm_Name; }
      await postSiteApproval(payload).unwrap();
      alert(`✅ ${statusValue}!`); handleCloseModal(); refetch();
    } catch (err) { alert('❌ Error: ' + (err?.data?.message || 'Failed')); }
  };

  const formatCurrency = (val) => { if (!val) return '—'; const n = parseFloat(val); return isNaN(n) ? val : '₹' + n.toLocaleString('en-IN'); };

  if (isLoading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px' }}>
      <div style={{ width: 56, height: 56, borderRadius: 14, background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, boxShadow: `0 0 0 3px ${T.gold}30` }}>
        <Loader2 size={28} color={T.gold} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
      <p style={{ fontSize: 15, fontWeight: 600, color: T.navy }}>Loading Site Approvals...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (isError) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px' }}>
      <AlertCircle size={40} color={T.danger} style={{ marginBottom: 12 }} />
      <p style={{ fontSize: 15, fontWeight: 600, color: T.danger }}>Failed to load data</p>
      <button onClick={refetch} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 8, border: 'none', background: T.danger, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 12 }}><RotateCcw size={14} /> Retry</button>
    </div>
  );

  const tableCols = [
    { label: '#', w: 40 }, { label: 'RCC Bill No', w: 100 }, { label: 'Payee', w: 140 },
    { label: 'Project', w: 150 }, { label: 'Engineer', w: 130 }, { label: 'Head Type', w: 110 },
    { label: 'Details', w: 200 }, { label: 'Amount', w: 100 }, { label: 'Bill No', w: 90 },
    { label: 'Bill Date', w: 100 }, { label: 'Exp Head', w: 100 }, { label: 'Contractor', w: 140 },
    { label: 'Firm', w: 130 }, { label: 'Photo', w: 80 }, { label: 'Action', w: 80 },
  ];

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 8px' }}>

      {/* Header */}
      <div style={{ background: T.card, borderRadius: 10, border: `1px solid ${T.border}`, padding: '14px 18px', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Receipt size={18} color={T.gold} />
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: T.navy, margin: 0 }}>Site Approval</h2>
            <p style={{ fontSize: 12, color: T.textMuted, margin: 0 }}>{filteredData.length} pending approvals</p>
          </div>
        </div>
        <button onClick={refetch} disabled={isFetching} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: `1.5px solid ${T.border}`, background: T.card, color: T.textLight, fontSize: 13, cursor: isFetching ? 'not-allowed' : 'pointer' }}>
          <RotateCcw size={14} style={isFetching ? { animation: 'spin 0.8s linear infinite' } : {}} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 12 }}>
        <div style={{ background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`, borderRadius: 10, padding: 14, color: 'white' }}>
          <p style={{ fontSize: 10, color: T.textMuted, textTransform: 'uppercase', margin: 0 }}>Total Pending</p>
          <p style={{ fontSize: 22, fontWeight: 800, margin: '4px 0 0', color: T.gold }}>{data.length}</p>
        </div>
        <div style={{ background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`, borderRadius: 10, padding: 14, color: T.navyDark }}>
          <p style={{ fontSize: 10, textTransform: 'uppercase', margin: 0, opacity: 0.7 }}>Filtered</p>
          <p style={{ fontSize: 22, fontWeight: 800, margin: '4px 0 0' }}>{filteredData.length}</p>
        </div>
        <div style={{ background: `linear-gradient(135deg, ${T.success}, #059669)`, borderRadius: 10, padding: 14, color: 'white' }}>
          <p style={{ fontSize: 10, textTransform: 'uppercase', margin: 0, opacity: 0.7 }}>Total Amount</p>
          <p style={{ fontSize: 22, fontWeight: 800, margin: '4px 0 0' }}>{formatCurrency(filteredData.reduce((s, i) => s + (parseFloat(i.costAmount) || 0), 0))}</p>
        </div>
      </div>

      {/* Search */}
      <div style={{ background: T.card, borderRadius: 10, border: `1px solid ${T.border}`, padding: '12px 16px', marginBottom: 12, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.textMuted }} />
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search..."
            style={{ ...inputBase, paddingLeft: 36 }} onFocus={focusGold} onBlur={blurNormal} />
        </div>
        <div style={{ position: 'relative', minWidth: 180 }}>
          <select value={filterProject} onChange={e => setFilterProject(e.target.value)}
            style={{ ...inputBase, paddingRight: 32, appearance: 'none', cursor: 'pointer' }} onFocus={focusGold} onBlur={blurNormal}>
            <option value="">All Projects</option>
            {projectNames.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: T.textMuted, pointerEvents: 'none' }} />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: T.card, borderRadius: 10, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
        {filteredData.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px' }}>
            <Package size={40} color={T.border} style={{ marginBottom: 12 }} />
            <p style={{ fontSize: 15, color: T.textLight }}>No pending approvals</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', maxHeight: '65vh', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                <tr style={{ background: T.navy }}>
                  {tableCols.map((col, i) => (
                    <th key={i} style={{ padding: '12px 14px', textAlign: col.label === 'Amount' ? 'right' : col.label === 'Photo' || col.label === 'Action' ? 'center' : 'left', color: T.goldLight, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap', minWidth: col.w, borderBottom: `2px solid ${T.gold}` }}>{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, idx) => (
                  <tr key={row.uid || idx}
                    style={{ background: idx % 2 === 0 ? T.card : T.borderLight }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${T.gold}08`; }}
                    onMouseLeave={e => { e.currentTarget.style.background = idx % 2 === 0 ? T.card : T.borderLight; }}>
                    <Td><span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: 6, background: T.borderLight, fontSize: 12, fontWeight: 600, color: T.textLight }}>{idx + 1}</span></Td>
                    <Td><span style={{ background: `${T.navy}15`, color: T.navy, padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>{row.RccBillNo || '—'}</span></Td>
                    <Td maxW={130} bold>{row.payeeName}</Td>
                    <Td><span style={{ background: `${T.gold}15`, color: T.goldDark, padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>{row.projectName || '—'}</span></Td>
                    <Td maxW={120}>{row.projectEngineerName}</Td>
                    <Td><span style={{ background: `${T.purple}15`, color: T.purple, padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>{row.headType || '—'}</span></Td>
                    <Td maxW={200}>{row.detailsOfWork}</Td>
                    <Td right bold><span style={{ color: T.success, fontWeight: 700 }}>{row.costAmount}</span></Td>
                    <Td>{row.BillNO}</Td>
                    <Td>{row.BillDate}</Td>
                    <Td>{row.EXPHead}</Td>
                    <Td maxW={130}>{row.ContractorName}</Td>
                    <Td maxW={120}>{row.ContractorFirmName}</Td>
                    <td style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}`, textAlign: 'center' }}>
                      {row.billPhoto ? (
                        <button onClick={() => openInNewTab(row.billPhoto)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, background: T.navy, color: T.gold, fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer', textDecoration: 'none' }}>
                          <ExternalLink size={12} /> View
                        </button>
                      ) : <span style={{ color: T.textMuted }}>—</span>}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', borderBottom: `1px solid ${T.border}` }}>
                      <button onClick={() => handleOpenModal(row)} title="Review"
                        style={{ width: 34, height: 34, borderRadius: 8, border: `1.5px solid ${T.gold}40`, background: `${T.gold}10`, color: T.goldDark, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
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
        )}
      </div>

      {/* ════ MODAL ════ */}
      {modalOpen && selectedRow && (
        <>
          <div onClick={handleCloseModal} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(2px)', zIndex: 100 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '95%', maxWidth: 500, background: T.card, borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', zIndex: 101, display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>

            {/* Header */}
            <div style={{ background: T.navy, padding: '14px 20px', borderBottom: `2px solid ${T.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '14px 14px 0 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: `${T.gold}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Pencil size={16} color={T.gold} />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: 'white', margin: 0 }}>Review Approval</h3>
                  <p style={{ fontSize: 11, color: T.textMuted, margin: 0 }}>UID: <span style={{ color: T.gold }}>{selectedRow.uid}</span></p>
                </div>
              </div>
              <button onClick={handleCloseModal} style={{ width: 30, height: 30, borderRadius: 6, border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Info */}
              <div style={{ background: T.borderLight, borderRadius: 10, padding: '12px 14px', border: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.navy, marginBottom: 8, textTransform: 'uppercase' }}>Request Details</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px', fontSize: 12 }}>
                  <div><span style={{ color: T.textMuted }}>Payee:</span> <strong>{selectedRow.payeeName}</strong></div>
                  <div><span style={{ color: T.textMuted }}>Project:</span> <strong>{selectedRow.projectName}</strong></div>
                  <div><span style={{ color: T.textMuted }}>Head:</span> <strong>{selectedRow.headType}</strong></div>
                  <div><span style={{ color: T.textMuted }}>Contractor:</span> <strong>{selectedRow.ContractorName}</strong></div>
                  <div><span style={{ color: T.textMuted }}>Bill No:</span> <strong>{selectedRow.BillNO}</strong></div>
                  <div><span style={{ color: T.textMuted }}>Amount:</span> <strong style={{ color: T.success }}>{selectedRow.costAmount}</strong></div>
                </div>
                {selectedRow.billPhoto && (
                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: T.textMuted }}>Bill Photo</span>
                    <button onClick={() => openInNewTab(selectedRow.billPhoto)} style={{ fontSize: 11, color: T.navy, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><ExternalLink size={12} /> View</button>
                  </div>
                )}
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${T.border}` }}>
                  <span style={{ fontSize: 11, color: T.textMuted }}>Details:</span>
                  <p style={{ fontSize: 12, color: T.text, margin: '2px 0 0' }}>{selectedRow.detailsOfWork || 'N/A'}</p>
                </div>
              </div>

              {/* Approve Amount */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>
                  <IndianRupee size={14} /> Approve Amount <span style={{ color: T.danger }}>*</span>
                </label>
                <input type="number" value={formData.Approve_Amount} onChange={e => handleFormChange('Approve_Amount', e.target.value)}
                  placeholder="Enter amount" style={inputBase} onFocus={focusGold} onBlur={blurNormal} />
              </div>

              {/* Confirm Head */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>
                  <Briefcase size={14} /> Confirm Head <span style={{ color: T.danger }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <select value={formData.Confirm_Head} onChange={e => handleFormChange('Confirm_Head', e.target.value)}
                    style={{ ...inputBase, paddingRight: 32, appearance: 'none', cursor: 'pointer' }} onFocus={focusGold} onBlur={blurNormal}>
                    <option value="">-- Select --</option>
                    <option value="Company Head">🏢 Company Head</option>
                    <option value="Contractor Head">👷 Contractor Head</option>
                  </select>
                  <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: T.textMuted, pointerEvents: 'none' }} />
                </div>
              </div>

              {/* Contractor */}
              {isContractorHead && (
                <div style={{ padding: 14, background: `${T.gold}08`, borderRadius: 10, border: `1px dashed ${T.gold}50` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                    <UserCircle size={16} color={T.goldDark} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: T.goldDark }}>Contractor Details</span>
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>
                      Contractor Name <span style={{ color: T.danger }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <select value={formData.Name_Of_Contractor} onChange={e => handleContractorSelect(e.target.value)}
                        disabled={isLoadingContractors}
                        style={{ ...inputBase, paddingRight: 32, appearance: 'none', cursor: isLoadingContractors ? 'not-allowed' : 'pointer' }}
                        onFocus={focusGold} onBlur={blurNormal}>
                        <option value="">{isLoadingContractors ? 'Loading...' : '-- Select --'}</option>
                        {contractorDropdownData.map((c, i) => <option key={i} value={c.contractorName}>{c.contractorName}</option>)}
                      </select>
                      <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: T.textMuted, pointerEvents: 'none' }} />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>
                      Firm Name <span style={{ color: T.danger }}>*</span> <span style={{ fontSize: 10, color: T.success, marginLeft: 6 }}>Auto-filled</span>
                    </label>
                    <input type="text" value={formData.Contractor_Firm_Name} readOnly placeholder="Select contractor..."
                      style={{ ...inputBase, background: T.borderLight, cursor: 'not-allowed' }} />
                  </div>
                </div>
              )}

              {/* Remark */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>
                  Remark <span style={{ fontSize: 10, color: T.textMuted }}>(Optional)</span>
                </label>
                <textarea value={formData.remark} onChange={e => handleFormChange('remark', e.target.value)}
                  rows={3} placeholder="Enter remark..."
                  style={{ ...inputBase, resize: 'vertical', minHeight: 70 }} onFocus={focusGold} onBlur={blurNormal} />
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '14px 20px', borderTop: `1px solid ${T.border}`, background: T.borderLight, display: 'flex', gap: 10, borderRadius: '0 0 14px 14px' }}>
              <button onClick={handleCloseModal} disabled={isSubmitting} style={{
                flex: 1, padding: '10px', borderRadius: 8, border: `1.5px solid ${T.border}`,
                background: T.card, color: T.textLight, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>Cancel</button>

              <button onClick={() => handleSubmit('Rejected')}
                disabled={isSubmitting || !formData.Approve_Amount || !formData.Confirm_Head || (isContractorHead && (!formData.Name_Of_Contractor || !formData.Contractor_Firm_Name))}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '10px', borderRadius: 8, border: 'none',
                  background: isSubmitting ? T.border : `linear-gradient(135deg, ${T.danger}, #dc2626)`,
                  color: isSubmitting ? T.textMuted : 'white',
                  fontSize: 13, fontWeight: 700, cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: (!formData.Approve_Amount || !formData.Confirm_Head) ? 0.5 : 1,
                }}>
                {isSubmitting ? <Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> : <X size={15} />} Reject
              </button>

              <button onClick={() => handleSubmit('Approved')}
                disabled={isSubmitting || !formData.Approve_Amount || !formData.Confirm_Head || (isContractorHead && (!formData.Name_Of_Contractor || !formData.Contractor_Firm_Name))}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '10px', borderRadius: 8, border: 'none',
                  background: isSubmitting ? T.border : `linear-gradient(135deg, ${T.success}, #059669)`,
                  color: isSubmitting ? T.textMuted : 'white',
                  fontSize: 13, fontWeight: 700, cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: (!formData.Approve_Amount || !formData.Confirm_Head) ? 0.5 : 1,
                }}>
                {isSubmitting ? <Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> : <CheckCircle size={15} />} Approve
              </button>
            </div>
          </div>
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default SiteApprovel;