
// import React, { useState, useEffect, useMemo, useRef } from 'react';
// import { useGetProjectDropdownQuery } from '../redux/Labour/LabourSlice';
// import {
//   usePostSiteExpenseMutation,
//   usePostLabourRequestMutation,
//   usePostContractorDebitMutation,
//   useGetCompanyLabourDropdownsQuery,
//   usePostCompanyLabourMutation,
// } from '../redux/formSlice';
// import {
//   Loader2, Receipt, Users, CreditCard, Building, User, Hash, FileText,
//   IndianRupee, Calendar, Camera, Briefcase, HardHat, MessageSquare,
//   Send, RefreshCw, X, ChevronDown, Wrench, Calculator, Package, CheckCircle,
//   Sun, Moon, ClipboardCheck, Image,
// } from 'lucide-react';

// // ============================================================
// // HELPER: Browser-side image compress (Canvas)
// // ============================================================
// const compressImageFrontend = (file) => {
//   return new Promise((resolve, reject) => {
//     if (!file.type.startsWith('image/')) {
//       const reader = new FileReader();
//       reader.readAsDataURL(file);
//       reader.onload  = () => resolve(reader.result);
//       reader.onerror = () => reject(new Error('File read failed'));
//       return;
//     }

//     const MAX_PX  = 1200;
//     const QUALITY = 0.72;
//     const url     = URL.createObjectURL(file);
//     const img     = new window.Image();

//     img.onload = () => {
//       let { width, height } = img;

//       if (width > MAX_PX || height > MAX_PX) {
//         if (width >= height) {
//           height = Math.round((height / width) * MAX_PX);
//           width  = MAX_PX;
//         } else {
//           width  = Math.round((width / height) * MAX_PX);
//           height = MAX_PX;
//         }
//       }

//       const canvas = document.createElement('canvas');
//       canvas.width  = width;
//       canvas.height = height;
//       canvas.getContext('2d').drawImage(img, 0, 0, width, height);

//       const base64 = canvas.toDataURL('image/jpeg', QUALITY);
//       URL.revokeObjectURL(url);

//       const origKB  = (file.size / 1024).toFixed(0);
//       const finalKB = ((base64.length * 0.75) / 1024).toFixed(0);
//       console.log(`[COMPRESS] ${origKB}KB → ${finalKB}KB`);

//       resolve(base64);
//     };

//     img.onerror = () => {
//       URL.revokeObjectURL(url);
//       reject(new Error('Image load failed'));
//     };

//     img.src = url;
//   });
// };

// // ============================================================
// // MAIN COMPONENT
// // ============================================================
// const SiteExpensesForm = () => {
//   const [activeTab, setActiveTab] = useState('siteExpenses');

//   // ── Date Helpers ──────────────────────────────────────────
//   const getTodayDate = () => new Date().toISOString().split('T')[0];

//   // ── API hooks ─────────────────────────────────────────────
//   const {
//     data      : dropdownData,
//     isLoading : isDropdownLoading,
//     isError   : isDropdownError,
//   } = useGetProjectDropdownQuery();

//   const safeDropdown = Array.isArray(dropdownData) ? dropdownData : [];

//   const [postSiteExpense,     { isLoading: isSiteLoading   }] = usePostSiteExpenseMutation();
//   const [postLabourRequest,   { isLoading: isLabourLoading }] = usePostLabourRequestMutation();
//   const [postContractorDebit, { isLoading: isDebitLoading  }] = usePostContractorDebitMutation();

//   const {
//     data      : companyLabourDropdowns,
//     isLoading : isCompanyDropdownLoading,
//     isError   : isCompanyDropdownError,
//   } = useGetCompanyLabourDropdownsQuery();

//   const [postCompanyLabour, { isLoading: isCompanyLabourLoading }] = usePostCompanyLabourMutation();

//   // ── Photo States (Site Expense) ──────────────────────────
//   const [billPhotoName,   setBillPhotoName]   = useState('');
//   const [isPhotoLoading,  setIsPhotoLoading]  = useState(false);
//   const [photoError,      setPhotoError]      = useState('');
//   const [photoPreviewUrl, setPhotoPreviewUrl] = useState('');
//   const fileInputRef = useRef(null);

//   // ── Photo States (Company Labour — Gallery & Camera) ─────
//   const [companyPhotoName,       setCompanyPhotoName]       = useState('');
//   const [isCompanyPhotoLoading,  setIsCompanyPhotoLoading]  = useState(false);
//   const [companyPhotoError,      setCompanyPhotoError]      = useState('');
//   const [companyPhotoPreviewUrl, setCompanyPhotoPreviewUrl]  = useState('');
//   const companyGalleryInputRef = useRef(null);
//   const companyCameraInputRef  = useRef(null);

//   // ── Form States ───────────────────────────────────────────
//   const [siteExpensesData, setSiteExpensesData] = useState({
//     Vendor_Payee_Name_1     : '',
//     Project_Name_1          : '',
//     Project_Engineer_Name_1 : '',
//     Head_Type_1             : '',
//     Bill_No_1               : '',
//     Bill_Date_1             : '',
//     Bill_Photo_1            : '',
//     Contractor_Name_1       : '',
//     Contractor_Firm_Name_1  : '',
//     Remark_1                : '',
//   });

//   const [siteExpenseItems, setSiteExpenseItems] = useState([
//     { Exp_Head_1: '', Details_of_Work_1: '', Amount_1: '' }
//   ]);

//   const [labourData, setLabourData] = useState({
//     Project_Name_1               : '',
//     Project_Engineer_1           : '',
//     Work_Type_1                  : '',
//     Work_Description_1           : '',
//     Labour_Category_1            : '',
//     Number_Of_Labour_1           : '',
//     Labour_Category_2            : '',
//     Number_Of_Labour_2           : '',
//     Total_Labour_1               : '',
//     Date_Of_Required_1           : '',
//     Head_Of_Contractor_Company_1 : '',
//     Name_Of_Contractor_1         : '',
//     Contractor_Firm_Name_1       : '',
//     Remark_1                     : '',
//   });

//   const [debitData, setDebitData] = useState({
//     Project_Name_1        : '',
//     Project_Engineer_1    : '',
//     Contractor_Name_1     : '',
//     Contractor_Firm_Name_1: '',
//     Work_Type_1           : '',
//     Work_Date_1           : '',
//     Work_Description_1    : '',
//     Particular_1          : '',
//     Qty_1                 : '',
//     Rate_Wages_1          : '',
//     Amount_1              : '',
//   });

//   const [companyLabourData, setCompanyLabourData] = useState({
//     Work_Date_1                  : getTodayDate(),
//     Project_Name_1               : '',
//     Project_Engineer_1           : '',
//     Labour_Name_1                : '',
//     Day_Night_1                  : '',
//     Day_Attendance_1             : '',
//     Work_Type_1                  : '',
//     Work_Description_1           : '',
//     Head_Of_Contractor_Company_1 : '',
//     Name_Of_Contractor_1         : '',
//     Contractor_Firm_Name_1       : '',
//     Remark_1                     : '',
//     Attendance_Photo_1           : '',
//   });

//   const isLabourContractorHead        = labourData.Head_Of_Contractor_Company_1 === 'Contractor Head';
//   const isSiteContractorHead          = siteExpensesData.Head_Type_1 === 'Contractor Head';
//   const isCompanyLabourContractorHead = companyLabourData.Head_Of_Contractor_Company_1 === 'Contractor Head';

//   // ── Auto Calculations ─────────────────────────────────────
//   useEffect(() => {
//     const l1 = parseInt(labourData.Number_Of_Labour_1) || 0;
//     const l2 = parseInt(labourData.Number_Of_Labour_2) || 0;
//     setLabourData(prev => ({ ...prev, Total_Labour_1: (l1 + l2).toString() }));
//   }, [labourData.Number_Of_Labour_1, labourData.Number_Of_Labour_2]);

//   useEffect(() => {
//     const qty  = parseFloat(debitData.Qty_1)        || 0;
//     const rate = parseFloat(debitData.Rate_Wages_1) || 0;
//     setDebitData(prev => ({ ...prev, Amount_1: (qty * rate).toFixed(2) }));
//   }, [debitData.Qty_1, debitData.Rate_Wages_1]);

//   // ── Dropdown Options (Site/Labour/Debit) ──────────────────
//   const projectOptions = useMemo(() => {
//     const seen = new Set();
//     return safeDropdown
//       .filter(item => {
//         const name = (item.projectName || '').trim();
//         return name && name !== '(No Project Name)';
//       })
//       .reduce((acc, item) => {
//         const name  = item.projectName.trim();
//         const lower = name.toLowerCase();
//         if (!seen.has(lower)) {
//           seen.add(lower);
//           acc.push({ value: name, label: item.label || name, engineer: item.engineer || '' });
//         }
//         return acc;
//       }, [])
//       .sort((a, b) => a.label.localeCompare(b.label));
//   }, [safeDropdown]);

//   const contractorOptions = useMemo(() => {
//     const seen = new Map();
//     safeDropdown.forEach(item => {
//       const cName = (item.contractorName     || '').trim();
//       if (!cName) return;
//       const fName = (item.contractorFirmName || '').trim();
//       const lower = cName.toLowerCase();
//       if (!seen.has(lower)) {
//         seen.set(lower, {
//           value   : cName,
//           firmName: fName,
//           label   : fName ? `${cName} (${fName})` : cName,
//         });
//       }
//     });
//     return Array.from(seen.values()).sort((a, b) => a.label.localeCompare(b.label));
//   }, [safeDropdown]);

//   const expenseWorkTypeOptions = useMemo(() =>
//     [...new Set(safeDropdown.map(i => (i.expenseWorkType || '').trim()).filter(Boolean))].sort()
//   , [safeDropdown]);

//   const labourWorkTypeOptions = useMemo(() =>
//     [...new Set(safeDropdown.map(i => (i.labourWorkType || '').trim()).filter(Boolean))].sort()
//   , [safeDropdown]);

//   // ── Company Labour Dropdown Options ───────────────────────
//   const companyLabourDD = companyLabourDropdowns?.data || {};

//   const companyProjectOptions = useMemo(() => {
//     return (companyLabourDD.projectNames || [])
//       .map(name => ({
//         value   : name,
//         label   : name,
//         engineer: companyLabourDD.projectEngineerMap?.[name] || '',
//       }))
//       .sort((a, b) => a.label.localeCompare(b.label));
//   }, [companyLabourDD]);

//   const companyContractorOptions = useMemo(() => {
//     return (companyLabourDD.contractorNames || [])
//       .map(name => ({
//         value   : name,
//         label   : name,
//         firmName: companyLabourDD.contractorFirmMap?.[name] || '',
//       }))
//       .sort((a, b) => a.label.localeCompare(b.label));
//   }, [companyLabourDD]);

//   const companyLabourNameOptions = useMemo(() =>
//     (companyLabourDD.labourNames || []).slice().sort()
//   , [companyLabourDD]);

//   const companyWorkTypeOptions = useMemo(() =>
//     (companyLabourDD.workTypes || []).slice().sort()
//   , [companyLabourDD]);

//   const companyContractorFirmOptions = useMemo(() =>
//     (companyLabourDD.contractorFirmNames || []).slice().sort()
//   , [companyLabourDD]);

//   // ── Handlers ──────────────────────────────────────────────
//   const handleProjectChange = (tab, value) => {
//     if (tab === 'companyLabour') {
//       const engineer = companyProjectOptions.find(o => o.value === value)?.engineer || '';
//       setCompanyLabourData(prev => ({
//         ...prev,
//         Project_Name_1     : value,
//         Project_Engineer_1 : engineer,
//       }));
//       return;
//     }

//     const engineer = projectOptions.find(o => o.value === value)?.engineer || '';
//     if (tab === 'siteExpenses') {
//       setSiteExpensesData(prev => ({ ...prev, Project_Name_1: value, Project_Engineer_Name_1: engineer }));
//     } else if (tab === 'labour') {
//       setLabourData(prev => ({ ...prev, Project_Name_1: value, Project_Engineer_1: engineer }));
//     } else {
//       setDebitData(prev => ({ ...prev, Project_Name_1: value, Project_Engineer_1: engineer }));
//     }
//   };

//   const handleContractorChange = (tab, value) => {
//     if (tab === 'companyLabour') {
//       const firmName = companyContractorOptions.find(o => o.value === value)?.firmName || '';
//       setCompanyLabourData(prev => ({
//         ...prev,
//         Name_Of_Contractor_1  : value,
//         Contractor_Firm_Name_1: firmName,
//       }));
//       return;
//     }

//     const firmName = contractorOptions.find(o => o.value === value)?.firmName || '';
//     if (tab === 'siteExpenses') {
//       setSiteExpensesData(prev => ({ ...prev, Contractor_Name_1: value, Contractor_Firm_Name_1: firmName }));
//     } else if (tab === 'labour') {
//       setLabourData(prev => ({ ...prev, Name_Of_Contractor_1: value, Contractor_Firm_Name_1: firmName }));
//     } else {
//       setDebitData(prev => ({ ...prev, Contractor_Name_1: value, Contractor_Firm_Name_1: firmName }));
//     }
//   };

//   const handleSiteExpenseChange = (field, value) =>
//     setSiteExpensesData(prev => ({ ...prev, [field]: value }));
//   const handleDebitChange = (field, value) =>
//     setDebitData(prev => ({ ...prev, [field]: value }));
//   const handleCompanyLabourChange = (field, value) =>
//     setCompanyLabourData(prev => ({ ...prev, [field]: value }));

//   // ── Photo Handler (Site Expense) ─────────────────────────
//   const handlePhotoChange = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     if (file.size > 20 * 1024 * 1024) {
//       setPhotoError('File 20MB se bada hai. Chota file choose karo.');
//       e.target.value = '';
//       return;
//     }

//     setPhotoError('');
//     setIsPhotoLoading(true);
//     setBillPhotoName(file.name);

//     const preview = URL.createObjectURL(file);
//     setPhotoPreviewUrl(preview);

//     try {
//       const compressed = await compressImageFrontend(file);
//       handleSiteExpenseChange('Bill_Photo_1', compressed);
//     } catch (err) {
//       console.error('[PHOTO ERROR]', err);
//       setPhotoError('Photo process karne mein error aaya. Dobara try karo.');
//       setBillPhotoName('');
//       setPhotoPreviewUrl('');
//       handleSiteExpenseChange('Bill_Photo_1', '');
//       if (fileInputRef.current) fileInputRef.current.value = '';
//     } finally {
//       setIsPhotoLoading(false);
//     }
//   };

//   // ── Photo Handler (Company Labour — Gallery & Camera) ─────
//   const handleCompanyPhotoChange = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     if (file.size > 20 * 1024 * 1024) {
//       setCompanyPhotoError('File 20MB se bada hai. Chota file choose karo.');
//       e.target.value = '';
//       return;
//     }

//     setCompanyPhotoError('');
//     setIsCompanyPhotoLoading(true);
//     setCompanyPhotoName(file.name);

//     const preview = URL.createObjectURL(file);
//     setCompanyPhotoPreviewUrl(preview);

//     try {
//       const compressed = await compressImageFrontend(file);
//       handleCompanyLabourChange('Attendance_Photo_1', compressed);
//     } catch (err) {
//       console.error('[COMPANY PHOTO ERROR]', err);
//       setCompanyPhotoError('Photo process karne mein error aaya. Dobara try karo.');
//       setCompanyPhotoName('');
//       setCompanyPhotoPreviewUrl('');
//       handleCompanyLabourChange('Attendance_Photo_1', '');
//       if (companyGalleryInputRef.current) companyGalleryInputRef.current.value = '';
//       if (companyCameraInputRef.current)  companyCameraInputRef.current.value = '';
//     } finally {
//       setIsCompanyPhotoLoading(false);
//     }
//   };

//   const handleItemChange = (index, field, value) => {
//     setSiteExpenseItems(prev => {
//       const updated  = [...prev];
//       updated[index] = { ...updated[index], [field]: value };
//       return updated;
//     });
//   };

//   const addItem    = () => setSiteExpenseItems(prev => [
//     ...prev, { Exp_Head_1: '', Details_of_Work_1: '', Amount_1: '' }
//   ]);
//   const removeItem = (index) =>
//     setSiteExpenseItems(prev => prev.filter((_, i) => i !== index));

//   const showAlert = (type, message) =>
//     alert(`${type === 'success' ? '✅' : '❌'} ${message}`);

//   // ── Submit: Site Expenses ─────────────────────────────────
//   const handleSubmitSiteExpenses = async (e) => {
//     e.preventDefault();

//     if (!siteExpensesData.Vendor_Payee_Name_1.trim())
//       return showAlert('error', 'Vendor/Payee Name required hai');
//     if (!siteExpensesData.Project_Name_1)
//       return showAlert('error', 'Project Name required hai');
//     if (!siteExpensesData.Head_Type_1)
//       return showAlert('error', 'Head Type required hai');
//     if (!siteExpensesData.Bill_Date_1)
//       return showAlert('error', 'Bill Date required hai');
//     if (!siteExpensesData.Bill_Photo_1)
//       return showAlert('error', 'Bill Photo required hai');
//     if (isPhotoLoading)
//       return showAlert('error', 'Photo abhi process ho rahi hai. Thoda wait karo.');
//     if (isSiteContractorHead && !siteExpensesData.Contractor_Name_1)
//       return showAlert('error', 'Contractor Name required hai');

//     const validItems = siteExpenseItems.filter(
//       item => item.Exp_Head_1 && item.Amount_1 && item.Details_of_Work_1.trim()
//     );
//     if (validItems.length === 0)
//       return showAlert('error', 'Kam se kam ek item mein Expense Head, Amount aur Details fill karo');

//     const incomplete = siteExpenseItems.find(item =>
//       (item.Exp_Head_1 || item.Amount_1 || item.Details_of_Work_1.trim()) &&
//       (!item.Exp_Head_1 || !item.Amount_1 || !item.Details_of_Work_1.trim())
//     );
//     if (incomplete)
//       return showAlert('error', 'Har item mein Expense Head, Amount aur Details teeno required hain');

//     try {
//       const result = await postSiteExpense({
//         Vendor_Payee_Name_1    : siteExpensesData.Vendor_Payee_Name_1,
//         Project_Name_1         : siteExpensesData.Project_Name_1,
//         Project_Engineer_Name_1: siteExpensesData.Project_Engineer_Name_1,
//         Head_Type_1            : siteExpensesData.Head_Type_1,
//         Bill_No_1              : siteExpensesData.Bill_No_1,
//         Bill_Date_1            : siteExpensesData.Bill_Date_1,
//         Bill_Photo_1           : siteExpensesData.Bill_Photo_1,
//         Contractor_Name_1      : siteExpensesData.Contractor_Name_1,
//         Contractor_Firm_Name_1 : siteExpensesData.Contractor_Firm_Name_1,
//         Remark_1               : siteExpensesData.Remark_1,
//         items                  : validItems,
//       }).unwrap();

//       showAlert('success', `${result.message} | Bill: ${result.billNo}`);
//       resetSiteExpensesForm();
//     } catch (err) {
//       showAlert('error', err?.data?.message || 'Submit karne mein error aaya');
//     }
//   };

//   // ── Submit: Debit ─────────────────────────────────────────
//   const handleSubmitDebit = async (e) => {
//     e.preventDefault();
//     if (!debitData.Project_Name_1 || !debitData.Contractor_Name_1)
//       return showAlert('error', 'Project Name aur Contractor Name required hain');

//     try {
//       const result = await postContractorDebit({ ...debitData }).unwrap();
//       showAlert('success', `${result.message} | UID: ${result.uid}`);
//       resetDebitForm();
//     } catch (err) {
//       showAlert('error', err?.data?.message || 'Contractor Debit submit karne mein error aaya');
//     }
//   };

//   // ── Submit: Company Labour Attendance ─────────────────────
//   const handleSubmitCompanyLabour = async (e) => {
//     e.preventDefault();

//     if (!companyLabourData.Work_Date_1)
//       return showAlert('error', 'Work Date required hai');
//     if (!companyLabourData.Project_Name_1)
//       return showAlert('error', 'Project Name required hai');
//     if (!companyLabourData.Labour_Name_1)
//       return showAlert('error', 'Labour Name required hai');
//     if (!companyLabourData.Day_Night_1)
//       return showAlert('error', 'Day / Night required hai');
//     if (!companyLabourData.Day_Attendance_1)
//       return showAlert('error', 'Day Attendance required hai');
//     if (!companyLabourData.Work_Type_1)
//       return showAlert('error', 'Work Type required hai');
//     if (!companyLabourData.Work_Description_1.trim())
//       return showAlert('error', 'Work Description required hai');
//     if (!companyLabourData.Head_Of_Contractor_Company_1)
//       return showAlert('error', 'Head Of Contractor/Company required hai');

//     if (isCompanyPhotoLoading)
//       return showAlert('error', 'Photo abhi process ho rahi hai. Thoda wait karo.');

//     if (isCompanyLabourContractorHead) {
//       if (!companyLabourData.Name_Of_Contractor_1)
//         return showAlert('error', 'Name of Contractor required hai (Contractor Head select kiya hai)');
//       if (!companyLabourData.Contractor_Firm_Name_1)
//         return showAlert('error', 'Contractor Firm Name required hai (Contractor Head select kiya hai)');
//     }

//     const payload = { ...companyLabourData };
//     if (!isCompanyLabourContractorHead) {
//       payload.Name_Of_Contractor_1 = '';
//       payload.Contractor_Firm_Name_1 = '';
//     }

//     try {
//       const result = await postCompanyLabour(payload).unwrap();
//       showAlert('success', `${result.message} | UID: ${result.uid}`);
//       resetCompanyLabourForm();
//     } catch (err) {
//       showAlert('error', err?.data?.message || 'Company Labour submit karne mein error aaya');
//     }
//   };

//   // ── Reset Handlers ────────────────────────────────────────
//   const resetSiteExpensesForm = () => {
//     setSiteExpensesData({
//       Vendor_Payee_Name_1: '', Project_Name_1: '', Project_Engineer_Name_1: '',
//       Head_Type_1: '', Bill_No_1: '', Bill_Date_1: '', Bill_Photo_1: '',
//       Contractor_Name_1: '', Contractor_Firm_Name_1: '', Remark_1: '',
//     });
//     setSiteExpenseItems([{ Exp_Head_1: '', Details_of_Work_1: '', Amount_1: '' }]);
//     setBillPhotoName('');
//     setPhotoError('');
//     setIsPhotoLoading(false);
//     setPhotoPreviewUrl('');
//     if (fileInputRef.current) fileInputRef.current.value = '';
//   };

//   const resetDebitForm = () => setDebitData({
//     Project_Name_1: '', Project_Engineer_1: '', Contractor_Name_1: '',
//     Contractor_Firm_Name_1: '', Work_Type_1: '', Work_Date_1: '',
//     Work_Description_1: '', Particular_1: '', Qty_1: '', Rate_Wages_1: '', Amount_1: '',
//   });

//   const resetCompanyLabourForm = () => {
//     setCompanyLabourData({
//       Work_Date_1: getTodayDate(), Project_Name_1: '', Project_Engineer_1: '',
//       Labour_Name_1: '', Day_Night_1: '', Day_Attendance_1: '',
//       Work_Type_1: '', Work_Description_1: '', Head_Of_Contractor_Company_1: '',
//       Name_Of_Contractor_1: '', Contractor_Firm_Name_1: '', Remark_1: '',
//       Attendance_Photo_1: '',
//     });
//     setCompanyPhotoName('');
//     setCompanyPhotoError('');
//     setIsCompanyPhotoLoading(false);
//     setCompanyPhotoPreviewUrl('');
//     if (companyGalleryInputRef.current) companyGalleryInputRef.current.value = '';
//     if (companyCameraInputRef.current)  companyCameraInputRef.current.value = '';
//   };

//   // ── Reusable Components ───────────────────────────────────
//   const SelectField = ({
//     label, icon: Icon, value, onChange, options,
//     required, colorClass = 'blue', disabled = false
//   }) => (
//     <div>
//       <label className="block text-sm font-semibold text-gray-700 mb-2">
//         {Icon && <Icon className="w-4 h-4 inline mr-1" />}
//         {label} {required && <span className="text-red-500">*</span>}
//         {disabled && (isDropdownLoading || isCompanyDropdownLoading) && (
//           <span className="text-xs text-gray-500 ml-2">(loading...)</span>
//         )}
//       </label>
//       <div className="relative">
//         <select
//           value={value} onChange={onChange} disabled={disabled}
//           className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none
//             focus:ring-2 focus:ring-${colorClass}-500 appearance-none bg-white
//             ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
//         >
//           <option value="">-- Select {label} --</option>
//           {options.map((opt, idx) => (
//             <option key={idx} value={opt.value}>{opt.label}</option>
//           ))}
//         </select>
//         <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
//       </div>
//     </div>
//   );

//   const tabs = [
//     { id: 'siteExpenses',  label: 'Site Expenses',   icon: Receipt,         gradient: 'from-blue-600 to-indigo-600'   },
//     { id: 'debit',         label: 'Debit',           icon: CreditCard,      gradient: 'from-purple-600 to-indigo-600' },
//     { id: 'companyLabour', label: 'Company Labour',  icon: ClipboardCheck,  gradient: 'from-orange-600 to-red-600'    },
//   ];
//   const activeTabConfig = tabs.find(t => t.id === activeTab);

//   // ── JSX ───────────────────────────────────────────────────
//   return (
//     <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
//       <div className="max-w-4xl mx-auto">

//         {/* Tabs */}
//         <div className="flex flex-wrap gap-2 mb-6">
//           {tabs.map((tab) => {
//             const Icon     = tab.icon;
//             const isActive = activeTab === tab.id;
//             return (
//               <button key={tab.id} onClick={() => setActiveTab(tab.id)}
//                 className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
//                   isActive
//                     ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg scale-105`
//                     : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
//                 }`}
//               >
//                 <Icon className="w-5 h-5" /> {tab.label}
//               </button>
//             );
//           })}
//         </div>

//         {isDropdownError && activeTab !== 'companyLabour' && (
//           <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
//             ⚠️ Dropdown data load nahi ho paya. Page refresh karo.
//           </div>
//         )}

//         {isCompanyDropdownError && activeTab === 'companyLabour' && (
//           <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
//             ⚠️ Company Labour dropdown load nahi ho paya. Page refresh karo.
//           </div>
//         )}

//         <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

//           {/* Header */}
//           <div className={`bg-gradient-to-r ${activeTabConfig?.gradient} p-6 text-white`}>
//             <div className="flex items-center gap-3">
//               <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
//                 {activeTabConfig && <activeTabConfig.icon className="w-6 h-6" />}
//               </div>
//               <div>
//                 <h1 className="text-2xl font-bold">{activeTabConfig?.label} Form</h1>
//                 <p className="text-white/80 text-sm mt-1">
//                   {activeTab === 'siteExpenses'  && 'Enter site expense details'}
//                   {activeTab === 'debit'         && 'Create debit entries for contractors'}
//                   {activeTab === 'companyLabour' && 'Mark daily labour attendance'}
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* ════ SITE EXPENSES FORM ════ */}
//           {activeTab === 'siteExpenses' && (
//             <form onSubmit={handleSubmitSiteExpenses} className="p-6 space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     <User className="w-4 h-4 inline mr-1" />
//                     Vendor/Payee Name <span className="text-red-500">*</span>
//                   </label>
//                   <input type="text"
//                     value={siteExpensesData.Vendor_Payee_Name_1}
//                     onChange={(e) => handleSiteExpenseChange('Vendor_Payee_Name_1', e.target.value)}
//                     placeholder="Enter Vendor/Payee Name"
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>
//                 <SelectField label="Project Name" icon={Building} required
//                   value={siteExpensesData.Project_Name_1}
//                   onChange={(e) => handleProjectChange('siteExpenses', e.target.value)}
//                   options={projectOptions} colorClass="blue" disabled={isDropdownLoading}
//                 />
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     <User className="w-4 h-4 inline mr-1" />Project Engineer
//                     <span className="text-xs text-gray-400 ml-1">(auto)</span>
//                   </label>
//                   <input type="text" readOnly value={siteExpensesData.Project_Engineer_Name_1}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 cursor-not-allowed text-gray-600"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     <Hash className="w-4 h-4 inline mr-1" />Bill No.
//                   </label>
//                   <input type="text" value={siteExpensesData.Bill_No_1}
//                     onChange={(e) => handleSiteExpenseChange('Bill_No_1', e.target.value)}
//                     placeholder="Enter Bill Number"
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     <Calendar className="w-4 h-4 inline mr-1" />Bill Date <span className="text-red-500">*</span>
//                   </label>
//                   <input type="date" value={siteExpensesData.Bill_Date_1}
//                     onChange={(e) => handleSiteExpenseChange('Bill_Date_1', e.target.value)}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   <Briefcase className="w-4 h-4 inline mr-1" />Head Type <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <select value={siteExpensesData.Head_Type_1}
//                     onChange={(e) => {
//                       const val = e.target.value;
//                       setSiteExpensesData(prev => ({
//                         ...prev, Head_Type_1: val,
//                         ...(val !== 'Contractor Head' && { Contractor_Name_1: '', Contractor_Firm_Name_1: '' })
//                       }));
//                     }}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
//                   >
//                     <option value="">-- Select Head Type --</option>
//                     {['Company Head', 'Contractor Head'].map((opt, i) => (
//                       <option key={i} value={opt}>{opt}</option>
//                     ))}
//                   </select>
//                   <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   <Camera className="w-4 h-4 inline mr-1" />Bill Photo <span className="text-red-500">*</span>
//                   <span className="text-xs text-gray-400 ml-2 font-normal">(max 20MB — auto compressed)</span>
//                 </label>
//                 <input ref={fileInputRef} type="file" accept="image/*,application/pdf"
//                   onChange={handlePhotoChange} disabled={isPhotoLoading}
//                   className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500
//                     file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0
//                     file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100
//                     ${isPhotoLoading ? 'opacity-60 cursor-not-allowed border-yellow-300 bg-yellow-50'
//                       : photoError ? 'border-red-300'
//                       : siteExpensesData.Bill_Photo_1 ? 'border-green-300' : 'border-gray-300'}`}
//                 />
//                 {isPhotoLoading && (
//                   <div className="mt-2 flex items-center gap-2 text-yellow-700 text-sm bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
//                     <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
//                     <span>Photo compress ho rahi hai... ek second rukho</span>
//                   </div>
//                 )}
//                 {photoError && (
//                   <div className="mt-2 flex items-center gap-2 text-red-700 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
//                     <X className="w-4 h-4 flex-shrink-0" /><span>{photoError}</span>
//                   </div>
//                 )}
//                 {siteExpensesData.Bill_Photo_1 && !isPhotoLoading && !photoError && (
//                   <div className="mt-2 flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
//                     <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
//                     <span className="text-green-700 text-sm font-medium flex-1 truncate">{billPhotoName} — Ready</span>
//                     {photoPreviewUrl && (
//                       <img src={photoPreviewUrl} alt="preview" className="w-12 h-12 object-cover rounded-lg border border-green-300" />
//                     )}
//                   </div>
//                 )}
//               </div>

//               {isSiteContractorHead && (
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 mb-2">
//                       <HardHat className="w-4 h-4 inline mr-1" />Contractor Name <span className="text-red-500">*</span>
//                     </label>
//                     <div className="relative">
//                       <select value={siteExpensesData.Contractor_Name_1}
//                         onChange={(e) => handleContractorChange('siteExpenses', e.target.value)}
//                         className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
//                       >
//                         <option value="">-- Select Contractor --</option>
//                         {contractorOptions.map((opt, i) => (<option key={i} value={opt.value}>{opt.label}</option>))}
//                       </select>
//                       <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
//                     </div>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 mb-2">
//                       <Building className="w-4 h-4 inline mr-1" />Contractor Firm
//                       <span className="text-xs text-gray-400 ml-1">(auto)</span>
//                     </label>
//                     <input type="text" readOnly value={siteExpensesData.Contractor_Firm_Name_1}
//                       className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 cursor-not-allowed text-gray-600"
//                     />
//                   </div>
//                 </div>
//               )}

//               <div className="border border-blue-200 rounded-xl overflow-hidden">
//                 <div className="bg-blue-50 px-4 py-3 flex items-center justify-between border-b border-blue-200">
//                   <h3 className="font-semibold text-blue-800 flex items-center gap-2">
//                     <FileText className="w-5 h-5" />Expense Items <span className="text-red-500">*</span>
//                     <span className="text-xs text-blue-600 font-normal">(har item alag row)</span>
//                   </h3>
//                   <button type="button" onClick={addItem}
//                     className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium"
//                   >+ Add Item</button>
//                 </div>
//                 <div className="p-4 space-y-4">
//                   {siteExpenseItems.map((item, index) => (
//                     <div key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-200 relative">
//                       {siteExpenseItems.length > 1 && (
//                         <button type="button" onClick={() => removeItem(index)}
//                           className="absolute top-3 right-3 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
//                         ><X className="w-4 h-4" /></button>
//                       )}
//                       <p className="text-sm font-semibold text-gray-600 mb-3">Item {index + 1}</p>
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                         <div>
//                           <label className="block text-xs font-medium text-gray-600 mb-1">Expense Head <span className="text-red-500">*</span></label>
//                           <div className="relative">
//                             <select value={item.Exp_Head_1}
//                               onChange={(e) => handleItemChange(index, 'Exp_Head_1', e.target.value)}
//                               className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
//                             >
//                               <option value="">-- Select --</option>
//                               {expenseWorkTypeOptions.map((opt, i) => (<option key={i} value={opt}>{opt}</option>))}
//                             </select>
//                             <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
//                           </div>
//                         </div>
//                         <div>
//                           <label className="block text-xs font-medium text-gray-600 mb-1">Amount (₹) <span className="text-red-500">*</span></label>
//                           <input type="number" value={item.Amount_1}
//                             onChange={(e) => handleItemChange(index, 'Amount_1', e.target.value)}
//                             placeholder="0.00"
//                             className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                           />
//                         </div>
//                         <div className="md:col-span-2">
//                           <label className="block text-xs font-medium text-gray-600 mb-1">Details of Work <span className="text-red-500">*</span></label>
//                           <input type="text" value={item.Details_of_Work_1}
//                             onChange={(e) => handleItemChange(index, 'Details_of_Work_1', e.target.value)}
//                             placeholder="Work details..."
//                             className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                           />
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//                 <div className="bg-blue-50 px-4 py-3 border-t border-blue-200 flex items-center justify-between">
//                   <span className="text-sm font-semibold text-blue-800">
//                     Valid Items: {siteExpenseItems.filter(i => i.Exp_Head_1 && i.Amount_1 && i.Details_of_Work_1.trim()).length}
//                   </span>
//                   <span className="text-lg font-bold text-blue-700">
//                     ₹{siteExpenseItems.reduce((sum, i) => sum + (parseFloat(i.Amount_1) || 0), 0).toFixed(2)}
//                   </span>
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   <MessageSquare className="w-4 h-4 inline mr-1" />Remark
//                 </label>
//                 <textarea rows={2} value={siteExpensesData.Remark_1}
//                   onChange={(e) => handleSiteExpenseChange('Remark_1', e.target.value)}
//                   placeholder="Enter any remarks..."
//                   className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
//                 />
//               </div>

//               <div className="flex gap-4 pt-4 border-t">
//                 <button type="button" onClick={resetSiteExpensesForm}
//                   className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
//                 ><RefreshCw className="w-4 h-4" /> Reset</button>
//                 <button type="submit" disabled={isSiteLoading || isDropdownLoading || isPhotoLoading}
//                   className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   {isSiteLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
//                     : isPhotoLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Photo Processing...</>
//                     : <><Send className="w-4 h-4" /> Submit Site Expense</>}
//                 </button>
//               </div>
//             </form>
//           )}

//           {/* ════ DEBIT FORM ════ */}
//           {activeTab === 'debit' && (
//             <form onSubmit={handleSubmitDebit} className="p-6 space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <SelectField label="Project Name" icon={Building} required
//                   value={debitData.Project_Name_1}
//                   onChange={(e) => handleProjectChange('debit', e.target.value)}
//                   options={projectOptions} colorClass="purple" disabled={isDropdownLoading}
//                 />
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     <User className="w-4 h-4 inline mr-1" />Project Engineer
//                     <span className="text-xs text-gray-400 ml-1">(auto)</span>
//                   </label>
//                   <input type="text" readOnly value={debitData.Project_Engineer_1}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 cursor-not-allowed text-gray-600"
//                   />
//                 </div>
//               </div>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     <HardHat className="w-4 h-4 inline mr-1" />Contractor Name <span className="text-red-500">*</span>
//                   </label>
//                   <div className="relative">
//                     <select value={debitData.Contractor_Name_1}
//                       onChange={(e) => handleContractorChange('debit', e.target.value)}
//                       className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none bg-white"
//                     >
//                       <option value="">-- Select Contractor --</option>
//                       {contractorOptions.map((opt, i) => (<option key={i} value={opt.value}>{opt.label}</option>))}
//                     </select>
//                     <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
//                   </div>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     <Building className="w-4 h-4 inline mr-1" />Contractor Firm
//                     <span className="text-xs text-gray-400 ml-1">(auto)</span>
//                   </label>
//                   <input type="text" readOnly value={debitData.Contractor_Firm_Name_1}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 cursor-not-allowed text-gray-600"
//                   />
//                 </div>
//               </div>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     <Wrench className="w-4 h-4 inline mr-1" />Work Type
//                   </label>
//                   <div className="relative">
//                     <select value={debitData.Work_Type_1}
//                       onChange={(e) => handleDebitChange('Work_Type_1', e.target.value)}
//                       className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none bg-white"
//                     >
//                       <option value="">-- Select --</option>
//                       {labourWorkTypeOptions.map((opt, i) => (<option key={i} value={opt}>{opt}</option>))}
//                     </select>
//                     <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
//                   </div>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     <Calendar className="w-4 h-4 inline mr-1" />Work Date
//                   </label>
//                   <input type="date" value={debitData.Work_Date_1}
//                     onChange={(e) => handleDebitChange('Work_Date_1', e.target.value)}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
//                   />
//                 </div>
//               </div>
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   <FileText className="w-4 h-4 inline mr-1" />Work Description
//                 </label>
//                 <textarea rows={3} value={debitData.Work_Description_1}
//                   onChange={(e) => handleDebitChange('Work_Description_1', e.target.value)}
//                   placeholder="Describe the work..."
//                   className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
//                 />
//               </div>
//               <div className="bg-purple-50 p-4 rounded-xl border border-purple-200 space-y-4">
//                 <h3 className="font-semibold text-purple-800 flex items-center gap-2">
//                   <Calculator className="w-5 h-5" />Amount Calculation
//                 </h3>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     <Package className="w-4 h-4 inline mr-1" />Particular
//                   </label>
//                   <div className="relative">
//                     <select value={debitData.Particular_1}
//                       onChange={(e) => handleDebitChange('Particular_1', e.target.value)}
//                       className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none bg-white"
//                     >
//                       <option value="">-- Select Particular --</option>
//                       {['Labour Work', 'Material Supply', 'Transportation', 'Equipment Rent', 'Advance', 'Other'].map((opt, i) => (
//                         <option key={i} value={opt}>{opt}</option>
//                       ))}
//                     </select>
//                     <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       <Hash className="w-4 h-4 inline mr-1" />Quantity
//                     </label>
//                     <input type="number" min="0" step="0.01" placeholder="0" value={debitData.Qty_1}
//                       onChange={(e) => handleDebitChange('Qty_1', e.target.value)}
//                       className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       <IndianRupee className="w-4 h-4 inline mr-1" />Rate / Wages (₹)
//                     </label>
//                     <input type="number" min="0" step="0.01" placeholder="0" value={debitData.Rate_Wages_1}
//                       onChange={(e) => handleDebitChange('Rate_Wages_1', e.target.value)}
//                       className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
//                     />
//                   </div>
//                 </div>
//                 <div className="bg-white p-4 rounded-xl border border-purple-300 flex items-center justify-between">
//                   <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
//                     <IndianRupee className="w-4 h-4" />Total Amount (Auto)
//                   </span>
//                   <span className="text-2xl font-bold text-purple-600">₹{debitData.Amount_1 || '0.00'}</span>
//                 </div>
//               </div>
//               <div className="flex gap-4 pt-4 border-t">
//                 <button type="button" onClick={resetDebitForm}
//                   className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
//                 ><RefreshCw className="w-4 h-4" /> Reset</button>
//                 <button type="submit" disabled={isDebitLoading || isDropdownLoading}
//                   className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   {isDebitLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
//                     : <><Send className="w-4 h-4" /> Submit Debit Entry</>}
//                 </button>
//               </div>
//             </form>
//           )}

//           {/* ════ ✅ COMPANY LABOUR ATTENDANCE FORM ════ */}
//           {activeTab === 'companyLabour' && (
//             <form onSubmit={handleSubmitCompanyLabour} className="p-6 space-y-6">

//               {/* Work Date + Project */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     <Calendar className="w-4 h-4 inline mr-1" />Work Date <span className="text-red-500">*</span>
//                   </label>
//                   <input type="date" value={companyLabourData.Work_Date_1}
//                     onChange={(e) => handleCompanyLabourChange('Work_Date_1', e.target.value)}
//                     max={getTodayDate()}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     <Building className="w-4 h-4 inline mr-1" />Project Name <span className="text-red-500">*</span>
//                     {isCompanyDropdownLoading && <span className="text-xs text-gray-500 ml-2">(loading...)</span>}
//                   </label>
//                   <div className="relative">
//                     <select value={companyLabourData.Project_Name_1}
//                       onChange={(e) => handleProjectChange('companyLabour', e.target.value)}
//                       disabled={isCompanyDropdownLoading}
//                       className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
//                     >
//                       <option value="">-- Select Project --</option>
//                       {companyProjectOptions.map((opt, i) => (<option key={i} value={opt.value}>{opt.label}</option>))}
//                     </select>
//                     <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
//                   </div>
//                 </div>
//               </div>

//               {/* Engineer + Labour Name */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     <User className="w-4 h-4 inline mr-1" />Project Engineer
//                     <span className="text-xs text-gray-400 ml-1">(auto)</span>
//                   </label>
//                   <input type="text" readOnly value={companyLabourData.Project_Engineer_1}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 cursor-not-allowed text-gray-600"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     <HardHat className="w-4 h-4 inline mr-1" />Labour Name <span className="text-red-500">*</span>
//                   </label>
//                   <div className="relative">
//                     <select value={companyLabourData.Labour_Name_1}
//                       onChange={(e) => handleCompanyLabourChange('Labour_Name_1', e.target.value)}
//                       disabled={isCompanyDropdownLoading}
//                       className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
//                     >
//                       <option value="">-- Select Labour --</option>
//                       {companyLabourNameOptions.map((opt, i) => (<option key={i} value={opt}>{opt}</option>))}
//                     </select>
//                     <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
//                   </div>
//                 </div>
//               </div>

//               {/* Day/Night + Attendance */}
//               <div className="bg-orange-50 p-4 rounded-xl border border-orange-200 space-y-4">
//                 <h3 className="font-semibold text-orange-800 flex items-center gap-2">
//                   <ClipboardCheck className="w-5 h-5" />Attendance Details
//                 </h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Day / Night <span className="text-red-500">*</span></label>
//                     <div className="flex gap-2">
//                       {[
//                         { val: 'Day',   icon: Sun,  activeClass: 'bg-orange-500 border-orange-500 text-white shadow-md' },
//                         { val: 'Night', icon: Moon, activeClass: 'bg-indigo-700 border-indigo-700 text-white shadow-md' }
//                       ].map(({ val, icon: I, activeClass }) => {
//                         const active = companyLabourData.Day_Night_1 === val;
//                         return (
//                           <button key={val} type="button"
//                             onClick={() => handleCompanyLabourChange('Day_Night_1', val)}
//                             className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 font-semibold transition-all
//                               ${active ? activeClass : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400 hover:bg-gray-50'}`}
//                           ><I className="w-4 h-4" /> {val}</button>
//                         );
//                       })}
//                     </div>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Day Attendance <span className="text-red-500">*</span></label>
//                     <div className="relative">
//                       <select value={companyLabourData.Day_Attendance_1}
//                         onChange={(e) => handleCompanyLabourChange('Day_Attendance_1', e.target.value)}
//                         className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none bg-white"
//                       >
//                         <option value="">-- Select --</option>
//                         {['Full Day', 'Half Day'].map((opt, i) => (<option key={i} value={opt}>{opt}</option>))}
//                       </select>
//                       <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Work Type */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   <Wrench className="w-4 h-4 inline mr-1" />Work Type <span className="text-red-500">*</span>
//                   {isCompanyDropdownLoading && <span className="text-xs text-gray-500 ml-2">(loading...)</span>}
//                 </label>
//                 <div className="relative">
//                   <select value={companyLabourData.Work_Type_1}
//                     onChange={(e) => handleCompanyLabourChange('Work_Type_1', e.target.value)}
//                     disabled={isCompanyDropdownLoading}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
//                   >
//                     <option value="">-- Select Work Type --</option>
//                     {companyWorkTypeOptions.map((opt, i) => (<option key={i} value={opt}>{opt}</option>))}
//                   </select>
//                   <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
//                 </div>
//               </div>

//               {/* Work Description */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   <FileText className="w-4 h-4 inline mr-1" />Work Description <span className="text-red-500">*</span>
//                 </label>
//                 <textarea rows={3} value={companyLabourData.Work_Description_1}
//                   onChange={(e) => handleCompanyLabourChange('Work_Description_1', e.target.value)}
//                   placeholder="Describe the work performed..."
//                   className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
//                 />
//               </div>

//               {/* Head Of Contractor/Company */}
//               <div className={`grid grid-cols-1 gap-4 ${isCompanyLabourContractorHead ? 'md:grid-cols-3' : ''}`}>
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     <Briefcase className="w-4 h-4 inline mr-1" />Head Of Contractor/Company <span className="text-red-500">*</span>
//                   </label>
//                   <div className="relative">
//                     <select value={companyLabourData.Head_Of_Contractor_Company_1}
//                       onChange={(e) => {
//                         const val = e.target.value;
//                         setCompanyLabourData(prev => ({
//                           ...prev, Head_Of_Contractor_Company_1: val,
//                           ...(val !== 'Contractor Head' && { Name_Of_Contractor_1: '', Contractor_Firm_Name_1: '' })
//                         }));
//                       }}
//                       className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none bg-white"
//                     >
//                       <option value="">-- Select --</option>
//                       {['Company Head', 'Contractor Head'].map((opt, i) => (<option key={i} value={opt}>{opt}</option>))}
//                     </select>
//                     <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
//                   </div>
//                 </div>

//                 {isCompanyLabourContractorHead && (
//                   <>
//                     <div>
//                       <label className="block text-sm font-semibold text-gray-700 mb-2">
//                         <HardHat className="w-4 h-4 inline mr-1" />Name of Contractor <span className="text-red-500">*</span>
//                       </label>
//                       <div className="relative">
//                         <select value={companyLabourData.Name_Of_Contractor_1}
//                           onChange={(e) => handleContractorChange('companyLabour', e.target.value)}
//                           disabled={isCompanyDropdownLoading}
//                           className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
//                         >
//                           <option value="">-- Select Contractor --</option>
//                           {companyContractorOptions.map((opt, i) => (<option key={i} value={opt.value}>{opt.label}</option>))}
//                         </select>
//                         <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
//                       </div>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-semibold text-gray-700 mb-2">
//                         <Building className="w-4 h-4 inline mr-1" />Contractor Firm Name <span className="text-red-500">*</span>
//                         <span className="text-xs text-gray-400 ml-1">(auto)</span>
//                       </label>
//                       <div className="relative">
//                         <select value={companyLabourData.Contractor_Firm_Name_1}
//                           onChange={(e) => handleCompanyLabourChange('Contractor_Firm_Name_1', e.target.value)}
//                           disabled={isCompanyDropdownLoading}
//                           className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
//                         >
//                           <option value="">-- Select Firm --</option>
//                           {companyContractorFirmOptions.map((opt, i) => (<option key={i} value={opt}>{opt}</option>))}
//                         </select>
//                         <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
//                       </div>
//                     </div>
//                   </>
//                 )}
//               </div>

//               {/* ════════════════════════════════════════════════════ */}
//               {/* 📷 ATTENDANCE PHOTO (Gallery & Camera Buttons)     */}
//               {/* ════════════════════════════════════════════════════ */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   <Camera className="w-4 h-4 inline mr-1" />Attendance Photo
//                   <span className="text-xs text-gray-400 ml-2 font-normal">(optional — max 20MB)</span>
//                 </label>

//                 {/* Hidden File Inputs */}
//                 <input
//                   ref={companyGalleryInputRef}
//                   type="file"
//                   accept="image/*"
//                   onChange={handleCompanyPhotoChange}
//                   className="hidden"
//                 />
//                 <input
//                   ref={companyCameraInputRef}
//                   type="file"
//                   accept="image/*"
//                   capture="environment"
//                   onChange={handleCompanyPhotoChange}
//                   className="hidden"
//                 />

//                 {/* 2 Buttons: Gallery & Camera */}
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                   <button
//                     type="button"
//                     onClick={() => companyGalleryInputRef.current?.click()}
//                     disabled={isCompanyPhotoLoading}
//                     className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-orange-200 bg-orange-50 text-orange-700 rounded-xl font-semibold hover:bg-orange-100 transition-all disabled:opacity-50"
//                   >
//                     <Image className="w-5 h-5 text-orange-600" /> Choose from Gallery
//                   </button>

//                   <button
//                     type="button"
//                     onClick={() => companyCameraInputRef.current?.click()}
//                     disabled={isCompanyPhotoLoading}
//                     className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-red-200 bg-red-50 text-red-700 rounded-xl font-semibold hover:bg-red-100 transition-all disabled:opacity-50"
//                   >
//                     <Camera className="w-5 h-5 text-red-600" /> Capture Camera
//                   </button>
//                 </div>

//                 {/* Loading State */}
//                 {isCompanyPhotoLoading && (
//                   <div className="mt-2 flex items-center gap-2 text-yellow-700 text-sm bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
//                     <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
//                     <span>Photo compress ho rahi hai... ek second rukho</span>
//                   </div>
//                 )}

//                 {/* Error State */}
//                 {companyPhotoError && (
//                   <div className="mt-2 flex items-center gap-2 text-red-700 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
//                     <X className="w-4 h-4 flex-shrink-0" />
//                     <span>{companyPhotoError}</span>
//                   </div>
//                 )}

//                 {/* Success Preview */}
//                 {companyLabourData.Attendance_Photo_1 && !isCompanyPhotoLoading && !companyPhotoError && (
//                   <div className="mt-2 flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
//                     <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
//                     <span className="text-green-700 text-sm font-medium flex-1 truncate">
//                       {companyPhotoName || 'Photo Selected'} — Ready
//                     </span>
//                     {companyPhotoPreviewUrl && (
//                       <img
//                         src={companyPhotoPreviewUrl}
//                         alt="preview"
//                         className="w-12 h-12 object-cover rounded-lg border border-green-300"
//                       />
//                     )}
//                   </div>
//                 )}
//               </div>

//               {/* Remark */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   <MessageSquare className="w-4 h-4 inline mr-1" />Remark
//                 </label>
//                 <textarea rows={2} value={companyLabourData.Remark_1}
//                   onChange={(e) => handleCompanyLabourChange('Remark_1', e.target.value)}
//                   placeholder="Enter any remarks..."
//                   className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
//                 />
//               </div>

//               {/* Action Buttons */}
//               <div className="flex gap-4 pt-4 border-t">
//                 <button type="button" onClick={resetCompanyLabourForm}
//                   className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
//                 >
//                   <RefreshCw className="w-4 h-4" /> Reset
//                 </button>
//                 <button type="submit"
//                   disabled={isCompanyLabourLoading || isCompanyDropdownLoading || isCompanyPhotoLoading}
//                   className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-700 hover:to-red-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   {isCompanyLabourLoading
//                     ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
//                     : isCompanyPhotoLoading
//                     ? <><Loader2 className="w-4 h-4 animate-spin" /> Photo Processing...</>
//                     : <><Send className="w-4 h-4" /> Submit Attendance</>
//                   }
//                 </button>
//               </div>

//             </form>
//           )}

//         </div>
//       </div>
//     </div>
//   );
// };

// export default SiteExpensesForm;






import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useGetProjectDropdownQuery } from '../redux/Labour/LabourSlice';
import {
  usePostSiteExpenseMutation,
  usePostLabourRequestMutation,
  usePostContractorDebitMutation,
  useGetCompanyLabourDropdownsQuery,
  usePostCompanyLabourMutation,
} from '../redux/formSlice';
import {
  Loader2, Receipt, Users, CreditCard, Building, User, Hash, FileText,
  IndianRupee, Calendar, Camera, Briefcase, HardHat, MessageSquare,
  Send, RefreshCw, X, ChevronDown, Wrench, Calculator, Package, CheckCircle,
  Sun, Moon, ClipboardCheck,
} from 'lucide-react';

// ============================================================
// HELPER: Browser-side image compress + Watermark (Canvas)
// ============================================================
const compressImageFrontend = (file, projectName = '') => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload  = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('File read failed'));
      return;
    }

    const MAX_PX  = 1200;
    const QUALITY = 0.72;
    const url     = URL.createObjectURL(file);
    const img     = new window.Image();

    img.onload = () => {
      let { width, height } = img;

      // Resize logic
      if (width > MAX_PX || height > MAX_PX) {
        if (width >= height) {
          height = Math.round((height / width) * MAX_PX);
          width  = MAX_PX;
        } else {
          width  = Math.round((width / height) * MAX_PX);
          height = MAX_PX;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width  = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      // Draw original image
      ctx.drawImage(img, 0, 0, width, height);

      // --- WATERMARK LOGIC (Timestamp + Project Name) ---
      if (projectName) {
        const now = new Date();
        const timestamp = now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true });
        
        const text1 = `Project: ${projectName}`;
        const text2 = `Time: ${timestamp}`;

        // Responsive font size based on image width
        const fontSize = Math.max(18, Math.floor(width / 35));
        ctx.font = `bold ${fontSize}px Arial, sans-serif`;

        // Measure text for background box
        const w1 = ctx.measureText(text1).width;
        const w2 = ctx.measureText(text2).width;
        const boxWidth = Math.max(w1, w2) + 30;
        const boxHeight = (fontSize * 2.5) + 20;

        // Position: Bottom Left
        const paddingX = 15;
        const paddingY = height - boxHeight - 15;

        // Draw semi-transparent black background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.roundRect ? ctx.roundRect(paddingX, paddingY, boxWidth, boxHeight, 8) : ctx.fillRect(paddingX, paddingY, boxWidth, boxHeight);
        if (ctx.roundRect) ctx.fill();

        // Draw text
        ctx.fillStyle = 'white';
        ctx.textBaseline = 'top';
        ctx.fillText(text1, paddingX + 15, paddingY + 10);
        ctx.fillText(text2, paddingX + 15, paddingY + 10 + fontSize + 5);
      }

      const base64 = canvas.toDataURL('image/jpeg', QUALITY);
      URL.revokeObjectURL(url);
      resolve(base64);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Image load failed'));
    };

    img.src = url;
  });
};

// ============================================================
// MAIN COMPONENT
// ============================================================
const SiteExpensesForm = () => {
  const [activeTab, setActiveTab] = useState('siteExpenses');

  const getTodayDate = () => new Date().toISOString().split('T')[0];

  const {
    data      : dropdownData,
    isLoading : isDropdownLoading,
    isError   : isDropdownError,
  } = useGetProjectDropdownQuery();

  const safeDropdown = Array.isArray(dropdownData) ? dropdownData : [];

  const [postSiteExpense,     { isLoading: isSiteLoading   }] = usePostSiteExpenseMutation();
  const [postLabourRequest,   { isLoading: isLabourLoading }] = usePostLabourRequestMutation();
  const [postContractorDebit, { isLoading: isDebitLoading  }] = usePostContractorDebitMutation();

  const {
    data      : companyLabourDropdowns,
    isLoading : isCompanyDropdownLoading,
    isError   : isCompanyDropdownError,
  } = useGetCompanyLabourDropdownsQuery();

  const [postCompanyLabour, { isLoading: isCompanyLabourLoading }] = usePostCompanyLabourMutation();

  // ── Photo States (Site Expense)
  const [billPhotoName,   setBillPhotoName]   = useState('');
  const [isPhotoLoading,  setIsPhotoLoading]  = useState(false);
  const [photoError,      setPhotoError]      = useState('');
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState('');
  const fileInputRef = useRef(null);

  // ── Photo States (Company Labour - ONLY CAMERA NOW)
  const [companyPhotoName,       setCompanyPhotoName]       = useState('');
  const [isCompanyPhotoLoading,  setIsCompanyPhotoLoading]  = useState(false);
  const [companyPhotoError,      setCompanyPhotoError]      = useState('');
  const [companyPhotoPreviewUrl, setCompanyPhotoPreviewUrl]  = useState('');
  const companyCameraInputRef  = useRef(null);

  const [siteExpensesData, setSiteExpensesData] = useState({
    Vendor_Payee_Name_1     : '', Project_Name_1: '', Project_Engineer_Name_1 : '',
    Head_Type_1: '', Bill_No_1: '', Bill_Date_1: '', Bill_Photo_1: '',
    Contractor_Name_1: '', Contractor_Firm_Name_1: '', Remark_1: '',
  });

  const [siteExpenseItems, setSiteExpenseItems] = useState([
    { Exp_Head_1: '', Details_of_Work_1: '', Amount_1: '' }
  ]);

  const [labourData, setLabourData] = useState({
    Project_Name_1: '', Project_Engineer_1: '', Work_Type_1: '', Work_Description_1: '',
    Labour_Category_1: '', Number_Of_Labour_1: '', Labour_Category_2: '', Number_Of_Labour_2: '',
    Total_Labour_1: '', Date_Of_Required_1: '', Head_Of_Contractor_Company_1: '',
    Name_Of_Contractor_1: '', Contractor_Firm_Name_1: '', Remark_1: '',
  });

  const [debitData, setDebitData] = useState({
    Project_Name_1: '', Project_Engineer_1: '', Contractor_Name_1: '', Contractor_Firm_Name_1: '',
    Work_Type_1: '', Work_Date_1: '', Work_Description_1: '', Particular_1: '', Qty_1: '', Rate_Wages_1: '', Amount_1: '',
  });

  const [companyLabourData, setCompanyLabourData] = useState({
    Work_Date_1: getTodayDate(), Project_Name_1: '', Project_Engineer_1: '', Labour_Name_1: '',
    Day_Night_1: '', Day_Attendance_1: '', Work_Type_1: '', Work_Description_1: '',
    Head_Of_Contractor_Company_1: '', Name_Of_Contractor_1: '', Contractor_Firm_Name_1: '', Remark_1: '',
    Attendance_Photo_1: '',
  });

  const isLabourContractorHead        = labourData.Head_Of_Contractor_Company_1 === 'Contractor Head';
  const isSiteContractorHead          = siteExpensesData.Head_Type_1 === 'Contractor Head';
  const isCompanyLabourContractorHead = companyLabourData.Head_Of_Contractor_Company_1 === 'Contractor Head';

  useEffect(() => {
    const l1 = parseInt(labourData.Number_Of_Labour_1) || 0;
    const l2 = parseInt(labourData.Number_Of_Labour_2) || 0;
    setLabourData(prev => ({ ...prev, Total_Labour_1: (l1 + l2).toString() }));
  }, [labourData.Number_Of_Labour_1, labourData.Number_Of_Labour_2]);

  useEffect(() => {
    const qty  = parseFloat(debitData.Qty_1) || 0;
    const rate = parseFloat(debitData.Rate_Wages_1) || 0;
    setDebitData(prev => ({ ...prev, Amount_1: (qty * rate).toFixed(2) }));
  }, [debitData.Qty_1, debitData.Rate_Wages_1]);

  const projectOptions = useMemo(() => {
    const seen = new Set();
    return safeDropdown
      .filter(item => { const name = (item.projectName || '').trim(); return name && name !== '(No Project Name)'; })
      .reduce((acc, item) => {
        const name  = item.projectName.trim();
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

  const expenseWorkTypeOptions = useMemo(() => [...new Set(safeDropdown.map(i => (i.expenseWorkType || '').trim()).filter(Boolean))].sort(), [safeDropdown]);
  const labourWorkTypeOptions = useMemo(() => [...new Set(safeDropdown.map(i => (i.labourWorkType || '').trim()).filter(Boolean))].sort(), [safeDropdown]);

  const companyLabourDD = companyLabourDropdowns?.data || {};

  const companyProjectOptions = useMemo(() => {
    return (companyLabourDD.projectNames || [])
      .map(name => ({ value: name, label: name, engineer: companyLabourDD.projectEngineerMap?.[name] || '' }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [companyLabourDD]);

  const companyContractorOptions = useMemo(() => {
    return (companyLabourDD.contractorNames || [])
      .map(name => ({ value: name, label: name, firmName: companyLabourDD.contractorFirmMap?.[name] || '' }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [companyLabourDD]);

  const companyLabourNameOptions = useMemo(() => (companyLabourDD.labourNames || []).slice().sort(), [companyLabourDD]);
  const companyWorkTypeOptions = useMemo(() => (companyLabourDD.workTypes || []).slice().sort(), [companyLabourDD]);
  const companyContractorFirmOptions = useMemo(() => (companyLabourDD.contractorFirmNames || []).slice().sort(), [companyLabourDD]);

  const handleProjectChange = (tab, value) => {
    if (tab === 'companyLabour') {
      const engineer = companyProjectOptions.find(o => o.value === value)?.engineer || '';
      setCompanyLabourData(prev => ({ ...prev, Project_Name_1: value, Project_Engineer_1: engineer }));
      return;
    }
    const engineer = projectOptions.find(o => o.value === value)?.engineer || '';
    if (tab === 'siteExpenses') setSiteExpensesData(prev => ({ ...prev, Project_Name_1: value, Project_Engineer_Name_1: engineer }));
    else if (tab === 'labour') setLabourData(prev => ({ ...prev, Project_Name_1: value, Project_Engineer_1: engineer }));
    else setDebitData(prev => ({ ...prev, Project_Name_1: value, Project_Engineer_1: engineer }));
  };

  const handleContractorChange = (tab, value) => {
    if (tab === 'companyLabour') {
      const firmName = companyContractorOptions.find(o => o.value === value)?.firmName || '';
      setCompanyLabourData(prev => ({ ...prev, Name_Of_Contractor_1: value, Contractor_Firm_Name_1: firmName }));
      return;
    }
    const firmName = contractorOptions.find(o => o.value === value)?.firmName || '';
    if (tab === 'siteExpenses') setSiteExpensesData(prev => ({ ...prev, Contractor_Name_1: value, Contractor_Firm_Name_1: firmName }));
    else if (tab === 'labour') setLabourData(prev => ({ ...prev, Name_Of_Contractor_1: value, Contractor_Firm_Name_1: firmName }));
    else setDebitData(prev => ({ ...prev, Contractor_Name_1: value, Contractor_Firm_Name_1: firmName }));
  };

  const handleSiteExpenseChange = (field, value) => setSiteExpensesData(prev => ({ ...prev, [field]: value }));
  const handleDebitChange = (field, value) => setDebitData(prev => ({ ...prev, [field]: value }));
  const handleCompanyLabourChange = (field, value) => setCompanyLabourData(prev => ({ ...prev, [field]: value }));

  // ── Photo Handler (Site Expense) 
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) return setPhotoError('File 20MB se bada hai.'), e.target.value = '';

    setPhotoError(''); setIsPhotoLoading(true); setBillPhotoName(file.name);
    setPhotoPreviewUrl(URL.createObjectURL(file));

    try {
      // Pass Project Name so watermark applies here too (if selected)
      const compressed = await compressImageFrontend(file, siteExpensesData.Project_Name_1);
      handleSiteExpenseChange('Bill_Photo_1', compressed);
    } catch (err) {
      setPhotoError('Photo process karne mein error aaya.');
      setBillPhotoName(''); setPhotoPreviewUrl(''); handleSiteExpenseChange('Bill_Photo_1', '');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } finally { setIsPhotoLoading(false); }
  };

  // ── Photo Handler (Company Labour — ONLY CAMERA)
  const handleCompanyPhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) return setCompanyPhotoError('File 20MB se bada hai.'), e.target.value = '';

    setCompanyPhotoError(''); setIsCompanyPhotoLoading(true); setCompanyPhotoName(file.name);
    setCompanyPhotoPreviewUrl(URL.createObjectURL(file));

    try {
      // Pass Project Name for Watermark
      const compressed = await compressImageFrontend(file, companyLabourData.Project_Name_1);
      handleCompanyLabourChange('Attendance_Photo_1', compressed);
    } catch (err) {
      setCompanyPhotoError('Photo process karne mein error aaya.');
      setCompanyPhotoName(''); setCompanyPhotoPreviewUrl(''); handleCompanyLabourChange('Attendance_Photo_1', '');
      if (companyCameraInputRef.current) companyCameraInputRef.current.value = '';
    } finally { setIsCompanyPhotoLoading(false); }
  };

  const handleItemChange = (index, field, value) => {
    setSiteExpenseItems(prev => { const updated = [...prev]; updated[index] = { ...updated[index], [field]: value }; return updated; });
  };
  const addItem = () => setSiteExpenseItems(prev => [...prev, { Exp_Head_1: '', Details_of_Work_1: '', Amount_1: '' }]);
  const removeItem = (index) => setSiteExpenseItems(prev => prev.filter((_, i) => i !== index));
  const showAlert = (type, message) => alert(`${type === 'success' ? '✅' : '❌'} ${message}`);

  const handleSubmitSiteExpenses = async (e) => {
    e.preventDefault();
    if (!siteExpensesData.Vendor_Payee_Name_1.trim()) return showAlert('error', 'Vendor/Payee Name required hai');
    if (!siteExpensesData.Project_Name_1) return showAlert('error', 'Project Name required hai');
    if (!siteExpensesData.Head_Type_1) return showAlert('error', 'Head Type required hai');
    if (!siteExpensesData.Bill_Date_1) return showAlert('error', 'Bill Date required hai');
    if (!siteExpensesData.Bill_Photo_1) return showAlert('error', 'Bill Photo required hai');
    if (isPhotoLoading) return showAlert('error', 'Photo abhi process ho rahi hai. Thoda wait karo.');
    if (isSiteContractorHead && !siteExpensesData.Contractor_Name_1) return showAlert('error', 'Contractor Name required hai');

    const validItems = siteExpenseItems.filter(item => item.Exp_Head_1 && item.Amount_1 && item.Details_of_Work_1.trim());
    if (validItems.length === 0) return showAlert('error', 'Kam se kam ek item fill karo');
    if (siteExpenseItems.find(i => (i.Exp_Head_1 || i.Amount_1 || i.Details_of_Work_1.trim()) && (!i.Exp_Head_1 || !i.Amount_1 || !i.Details_of_Work_1.trim()))) return showAlert('error', 'Item fields missing');

    try {
      const result = await postSiteExpense({ ...siteExpensesData, items: validItems }).unwrap();
      showAlert('success', `${result.message} | Bill: ${result.billNo}`);
      resetSiteExpensesForm();
    } catch (err) { showAlert('error', err?.data?.message || 'Error aaya'); }
  };

  const handleSubmitDebit = async (e) => {
    e.preventDefault();
    if (!debitData.Project_Name_1 || !debitData.Contractor_Name_1) return showAlert('error', 'Project Name aur Contractor Name required hain');
    try {
      const result = await postContractorDebit({ ...debitData }).unwrap();
      showAlert('success', `${result.message} | UID: ${result.uid}`); resetDebitForm();
    } catch (err) { showAlert('error', err?.data?.message || 'Error aaya'); }
  };

  const handleSubmitCompanyLabour = async (e) => {
    e.preventDefault();
    if (!companyLabourData.Work_Date_1) return showAlert('error', 'Work Date required hai');
    if (!companyLabourData.Project_Name_1) return showAlert('error', 'Project Name required hai');
    if (!companyLabourData.Labour_Name_1) return showAlert('error', 'Labour Name required hai');
    if (!companyLabourData.Day_Night_1) return showAlert('error', 'Day / Night required hai');
    if (!companyLabourData.Day_Attendance_1) return showAlert('error', 'Day Attendance required hai');
    if (!companyLabourData.Work_Type_1) return showAlert('error', 'Work Type required hai');
    if (!companyLabourData.Work_Description_1.trim()) return showAlert('error', 'Work Description required hai');
    if (!companyLabourData.Head_Of_Contractor_Company_1) return showAlert('error', 'Head Of Contractor/Company required hai');
    if (isCompanyPhotoLoading) return showAlert('error', 'Photo abhi process ho rahi hai.');

    if (isCompanyLabourContractorHead) {
      if (!companyLabourData.Name_Of_Contractor_1 || !companyLabourData.Contractor_Firm_Name_1) return showAlert('error', 'Contractor Name/Firm required hai');
    }
    const payload = { ...companyLabourData };
    if (!isCompanyLabourContractorHead) { payload.Name_Of_Contractor_1 = ''; payload.Contractor_Firm_Name_1 = ''; }

    try {
      const result = await postCompanyLabour(payload).unwrap();
      showAlert('success', `${result.message} | UID: ${result.uid}`); resetCompanyLabourForm();
    } catch (err) { showAlert('error', err?.data?.message || 'Error aaya'); }
  };

  const resetSiteExpensesForm = () => {
    setSiteExpensesData({ Vendor_Payee_Name_1: '', Project_Name_1: '', Project_Engineer_Name_1: '', Head_Type_1: '', Bill_No_1: '', Bill_Date_1: '', Bill_Photo_1: '', Contractor_Name_1: '', Contractor_Firm_Name_1: '', Remark_1: '' });
    setSiteExpenseItems([{ Exp_Head_1: '', Details_of_Work_1: '', Amount_1: '' }]);
    setBillPhotoName(''); setPhotoError(''); setIsPhotoLoading(false); setPhotoPreviewUrl(''); if (fileInputRef.current) fileInputRef.current.value = '';
  };
  const resetDebitForm = () => setDebitData({ Project_Name_1: '', Project_Engineer_1: '', Contractor_Name_1: '', Contractor_Firm_Name_1: '', Work_Type_1: '', Work_Date_1: '', Work_Description_1: '', Particular_1: '', Qty_1: '', Rate_Wages_1: '', Amount_1: '' });
  const resetCompanyLabourForm = () => {
    setCompanyLabourData({ Work_Date_1: getTodayDate(), Project_Name_1: '', Project_Engineer_1: '', Labour_Name_1: '', Day_Night_1: '', Day_Attendance_1: '', Work_Type_1: '', Work_Description_1: '', Head_Of_Contractor_Company_1: '', Name_Of_Contractor_1: '', Contractor_Firm_Name_1: '', Remark_1: '', Attendance_Photo_1: '' });
    setCompanyPhotoName(''); setCompanyPhotoError(''); setIsCompanyPhotoLoading(false); setCompanyPhotoPreviewUrl(''); if (companyCameraInputRef.current) companyCameraInputRef.current.value = '';
  };

  const SelectField = ({ label, icon: Icon, value, onChange, options, required, colorClass = 'blue', disabled = false }) => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {Icon && <Icon className="w-4 h-4 inline mr-1" />} {label} {required && <span className="text-red-500">*</span>}
        {disabled && <span className="text-xs text-gray-500 ml-2">(loading...)</span>}
      </label>
      <div className="relative">
        <select value={value} onChange={onChange} disabled={disabled}
          className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-${colorClass}-500 appearance-none bg-white ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
        >
          <option value="">-- Select {label} --</option>
          {options.map((opt, idx) => (<option key={idx} value={opt.value}>{opt.label}</option>))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );

  const tabs = [
    { id: 'siteExpenses',  label: 'Site Expenses',   icon: Receipt,         gradient: 'from-blue-600 to-indigo-600'   },
    { id: 'debit',         label: 'Debit',           icon: CreditCard,      gradient: 'from-purple-600 to-indigo-600' },
    { id: 'companyLabour', label: 'Company Labour',  icon: ClipboardCheck,  gradient: 'from-orange-600 to-red-600'    },
  ];
  const activeTabConfig = tabs.find(t => t.id === activeTab);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon; const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${isActive ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg scale-105` : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
              ><Icon className="w-5 h-5" /> {tab.label}</button>
            );
          })}
        </div>

        {isDropdownError && activeTab !== 'companyLabour' && <div className="mb-4 p-3 bg-red-50 border text-red-700 text-sm">⚠️ Dropdown load fail</div>}
        {isCompanyDropdownError && activeTab === 'companyLabour' && <div className="mb-4 p-3 bg-red-50 border text-red-700 text-sm">⚠️ Company Labour dropdown load fail</div>}

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className={`bg-gradient-to-r ${activeTabConfig?.gradient} p-6 text-white`}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center"><activeTabConfig.icon className="w-6 h-6" /></div>
              <div>
                <h1 className="text-2xl font-bold">{activeTabConfig?.label} Form</h1>
                <p className="text-white/80 text-sm mt-1">Fill out the details below.</p>
              </div>
            </div>
          </div>

          {/* ════ SITE EXPENSES FORM ════ */}
          {activeTab === 'siteExpenses' && (
            <form onSubmit={handleSubmitSiteExpenses} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2"><User className="w-4 h-4 inline mr-1" />Vendor/Payee Name <span className="text-red-500">*</span></label>
                  <input type="text" value={siteExpensesData.Vendor_Payee_Name_1} onChange={(e) => handleSiteExpenseChange('Vendor_Payee_Name_1', e.target.value)} placeholder="Name" className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500" />
                </div>
                <SelectField label="Project Name" icon={Building} required value={siteExpensesData.Project_Name_1} onChange={(e) => handleProjectChange('siteExpenses', e.target.value)} options={projectOptions} colorClass="blue" disabled={isDropdownLoading} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><label className="block text-sm font-semibold text-gray-700 mb-2">Project Engineer <span className="text-xs text-gray-400 ml-1">(auto)</span></label><input type="text" readOnly value={siteExpensesData.Project_Engineer_Name_1} className="w-full px-4 py-3 border bg-gray-50 rounded-xl" /></div>
                <div><label className="block text-sm font-semibold text-gray-700 mb-2">Bill No.</label><input type="text" value={siteExpensesData.Bill_No_1} onChange={(e) => handleSiteExpenseChange('Bill_No_1', e.target.value)} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm font-semibold text-gray-700 mb-2">Bill Date <span className="text-red-500">*</span></label><input type="date" value={siteExpensesData.Bill_Date_1} onChange={(e) => handleSiteExpenseChange('Bill_Date_1', e.target.value)} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500" /></div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Head Type <span className="text-red-500">*</span></label>
                <select value={siteExpensesData.Head_Type_1} onChange={(e) => setSiteExpensesData(prev => ({ ...prev, Head_Type_1: e.target.value, ...(e.target.value !== 'Contractor Head' && { Contractor_Name_1: '', Contractor_Firm_Name_1: '' }) }))} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="">-- Select --</option><option value="Company Head">Company Head</option><option value="Contractor Head">Contractor Head</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2"><Camera className="w-4 h-4 inline mr-1" />Bill Photo <span className="text-red-500">*</span></label>
                <input ref={fileInputRef} type="file" accept="image/*,application/pdf" capture="environment"
                  onClick={(e) => { if (!siteExpensesData.Project_Name_1) { e.preventDefault(); alert("Photo lene se pehle Project Name select karein taki watermark print ho sake."); } }}
                  onChange={handlePhotoChange} disabled={isPhotoLoading}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 file:bg-blue-50" />
                {siteExpensesData.Bill_Photo_1 && !isPhotoLoading && (
                  <div className="mt-2 flex items-center gap-3 bg-green-50 border p-2 rounded-lg"><CheckCircle className="text-green-600 w-4 h-4" /> <span className="text-green-700 text-sm">{billPhotoName} Ready</span> {photoPreviewUrl && <img src={photoPreviewUrl} className="w-12 h-12 rounded-lg" />}</div>
                )}
              </div>

              {isSiteContractorHead && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SelectField label="Contractor Name" required value={siteExpensesData.Contractor_Name_1} onChange={(e) => handleContractorChange('siteExpenses', e.target.value)} options={contractorOptions} />
                  <div><label className="block text-sm font-semibold text-gray-700 mb-2">Firm Name</label><input type="text" readOnly value={siteExpensesData.Contractor_Firm_Name_1} className="w-full px-4 py-3 border bg-gray-50 rounded-xl" /></div>
                </div>
              )}

              <div className="border border-blue-200 rounded-xl overflow-hidden">
                <div className="bg-blue-50 px-4 py-3 flex justify-between border-b">
                  <h3 className="font-semibold text-blue-800 flex gap-2"><FileText className="w-5 h-5" />Expense Items</h3>
                  <button type="button" onClick={addItem} className="px-3 py-1 bg-blue-600 text-white rounded-lg">+ Add</button>
                </div>
                <div className="p-4 space-y-4">
                  {siteExpenseItems.map((item, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-xl border relative">
                      {siteExpenseItems.length > 1 && <button type="button" onClick={() => removeItem(index)} className="absolute top-2 right-2 text-red-500"><X /></button>}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                        <SelectField label="Expense Head" required value={item.Exp_Head_1} onChange={(e) => handleItemChange(index, 'Exp_Head_1', e.target.value)} options={expenseWorkTypeOptions.map(o => ({ value: o, label: o }))} />
                        <div><label className="block text-xs font-medium text-gray-600 mb-1">Amount <span className="text-red-500">*</span></label><input type="number" value={item.Amount_1} onChange={(e) => handleItemChange(index, 'Amount_1', e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2" /></div>
                        <div className="md:col-span-2"><label className="block text-xs font-medium text-gray-600 mb-1">Details <span className="text-red-500">*</span></label><input type="text" value={item.Details_of_Work_1} onChange={(e) => handleItemChange(index, 'Details_of_Work_1', e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2" /></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-4 pt-4 border-t">
                <button type="button" onClick={resetSiteExpensesForm} className="flex-1 py-3 border rounded-xl font-medium flex justify-center gap-2"><RefreshCw className="w-4 h-4" /> Reset</button>
                <button type="submit" disabled={isSiteLoading || isPhotoLoading} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium flex justify-center gap-2"><Send className="w-4 h-4" /> Submit</button>
              </div>
            </form>
          )}

          {/* ════ DEBIT FORM ════ */}
          {activeTab === 'debit' && (
            <form onSubmit={handleSubmitDebit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectField label="Project Name" icon={Building} required value={debitData.Project_Name_1} onChange={(e) => handleProjectChange('debit', e.target.value)} options={projectOptions} colorClass="purple" disabled={isDropdownLoading} />
                <div><label className="block text-sm font-semibold text-gray-700 mb-2">Project Engineer</label><input type="text" readOnly value={debitData.Project_Engineer_1} className="w-full px-4 py-3 border bg-gray-50 rounded-xl" /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectField label="Contractor Name" required value={debitData.Contractor_Name_1} onChange={(e) => handleContractorChange('debit', e.target.value)} options={contractorOptions} />
                <div><label className="block text-sm font-semibold text-gray-700 mb-2">Firm Name</label><input type="text" readOnly value={debitData.Contractor_Firm_Name_1} className="w-full px-4 py-3 border bg-gray-50 rounded-xl" /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectField label="Work Type" value={debitData.Work_Type_1} onChange={(e) => handleDebitChange('Work_Type_1', e.target.value)} options={labourWorkTypeOptions.map(o => ({ value: o, label: o }))} />
                <div><label className="block text-sm font-semibold text-gray-700 mb-2">Work Date</label><input type="date" value={debitData.Work_Date_1} onChange={(e) => handleDebitChange('Work_Date_1', e.target.value)} className="w-full px-4 py-3 border rounded-xl" /></div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Work Description</label>
                <textarea rows={2} value={debitData.Work_Description_1} onChange={(e) => handleDebitChange('Work_Description_1', e.target.value)} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500" />
              </div>
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                <SelectField label="Particular" value={debitData.Particular_1} onChange={(e) => handleDebitChange('Particular_1', e.target.value)} options={['Labour Work', 'Material Supply', 'Transportation'].map(o => ({ value: o, label: o }))} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div><label className="block text-sm font-medium mb-1">Quantity</label><input type="number" value={debitData.Qty_1} onChange={(e) => handleDebitChange('Qty_1', e.target.value)} className="w-full p-3 border rounded-xl focus:ring-2" /></div>
                  <div><label className="block text-sm font-medium mb-1">Rate / Wages</label><input type="number" value={debitData.Rate_Wages_1} onChange={(e) => handleDebitChange('Rate_Wages_1', e.target.value)} className="w-full p-3 border rounded-xl focus:ring-2" /></div>
                </div>
                <div className="mt-4 bg-white p-3 rounded-xl flex justify-between font-bold"><span>Total</span><span className="text-purple-600">₹{debitData.Amount_1}</span></div>
              </div>
              <div className="flex gap-4 pt-4 border-t">
                <button type="button" onClick={resetDebitForm} className="flex-1 py-3 border rounded-xl font-medium flex justify-center gap-2">Reset</button>
                <button type="submit" disabled={isDebitLoading} className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-medium flex justify-center gap-2">Submit</button>
              </div>
            </form>
          )}

          {/* ════ COMPANY LABOUR ATTENDANCE FORM ════ */}
          {activeTab === 'companyLabour' && (
            <form onSubmit={handleSubmitCompanyLabour} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold text-gray-700 mb-2">Work Date <span className="text-red-500">*</span></label><input type="date" value={companyLabourData.Work_Date_1} onChange={(e) => handleCompanyLabourChange('Work_Date_1', e.target.value)} max={getTodayDate()} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500" /></div>
                <SelectField label="Project Name" required value={companyLabourData.Project_Name_1} onChange={(e) => handleProjectChange('companyLabour', e.target.value)} options={companyProjectOptions} colorClass="orange" disabled={isCompanyDropdownLoading} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold text-gray-700 mb-2">Project Engineer</label><input type="text" readOnly value={companyLabourData.Project_Engineer_1} className="w-full px-4 py-3 border bg-gray-50 rounded-xl" /></div>
                <SelectField label="Labour Name" required value={companyLabourData.Labour_Name_1} onChange={(e) => handleCompanyLabourChange('Labour_Name_1', e.target.value)} options={companyLabourNameOptions.map(o => ({ value: o, label: o }))} disabled={isCompanyDropdownLoading} />
              </div>

              <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Day / Night <span className="text-red-500">*</span></label>
                    <div className="flex gap-2">
                      {['Day', 'Night'].map(val => (
                        <button key={val} type="button" onClick={() => handleCompanyLabourChange('Day_Night_1', val)} className={`flex-1 py-3 rounded-xl border-2 font-semibold ${companyLabourData.Day_Night_1 === val ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600'}`}>{val}</button>
                      ))}
                    </div>
                  </div>
                  <SelectField label="Day Attendance" required value={companyLabourData.Day_Attendance_1} onChange={(e) => handleCompanyLabourChange('Day_Attendance_1', e.target.value)} options={[{value:'Full Day', label:'Full Day'},{value:'Half Day', label:'Half Day'}]} />
                </div>
              </div>

              <SelectField label="Work Type" required value={companyLabourData.Work_Type_1} onChange={(e) => handleCompanyLabourChange('Work_Type_1', e.target.value)} options={companyWorkTypeOptions.map(o => ({ value: o, label: o }))} disabled={isCompanyDropdownLoading} />
              <div><label className="block text-sm font-semibold text-gray-700 mb-2">Work Description <span className="text-red-500">*</span></label><textarea rows={2} value={companyLabourData.Work_Description_1} onChange={(e) => handleCompanyLabourChange('Work_Description_1', e.target.value)} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500" /></div>

              <div className={`grid grid-cols-1 gap-4 ${isCompanyLabourContractorHead ? 'md:grid-cols-3' : ''}`}>
                <SelectField label="Head Of Contractor" required value={companyLabourData.Head_Of_Contractor_Company_1} onChange={(e) => { const val = e.target.value; setCompanyLabourData(p => ({ ...p, Head_Of_Contractor_Company_1: val, ...(val !== 'Contractor Head' && { Name_Of_Contractor_1: '', Contractor_Firm_Name_1: '' }) }))}} options={[{value:'Company Head',label:'Company Head'},{value:'Contractor Head',label:'Contractor Head'}]} />
                {isCompanyLabourContractorHead && (
                  <>
                    <SelectField label="Contractor Name" required value={companyLabourData.Name_Of_Contractor_1} onChange={(e) => handleContractorChange('companyLabour', e.target.value)} options={companyContractorOptions} />
                    <div><label className="block text-sm font-semibold mb-2">Firm Name</label><input type="text" readOnly value={companyLabourData.Contractor_Firm_Name_1} className="w-full px-4 py-3 border bg-gray-50 rounded-xl" /></div>
                  </>
                )}
              </div>

              {/* ONLY CAPTURE CAMERA BUTTON */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2"><Camera className="w-4 h-4 inline mr-1" />Attendance Photo <span className="text-xs text-gray-400 ml-2 font-normal">(Watermark added auto)</span></label>
                
                <input ref={companyCameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleCompanyPhotoChange} className="hidden" />

                <button type="button" 
                  onClick={(e) => { 
                    if (!companyLabourData.Project_Name_1) { 
                      alert("Please select Project Name first to apply the watermark on the photo."); 
                      return; 
                    } 
                    companyCameraInputRef.current?.click(); 
                  }}
                  disabled={isCompanyPhotoLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-4 border-2 border-red-200 bg-red-50 text-red-700 rounded-xl font-bold text-lg hover:bg-red-100 transition-all shadow-sm"
                >
                  <Camera className="w-6 h-6 text-red-600" /> CAPTURE PHOTO
                </button>

                {isCompanyPhotoLoading && <div className="mt-2 text-yellow-700 text-sm bg-yellow-50 border p-2 rounded-lg">Photo Process ho rahi hai...</div>}
                {companyPhotoError && <div className="mt-2 text-red-700 text-sm bg-red-50 border p-2 rounded-lg">{companyPhotoError}</div>}
                
                {companyLabourData.Attendance_Photo_1 && !isCompanyPhotoLoading && !companyPhotoError && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-300 rounded-xl flex items-center gap-4">
                    <CheckCircle className="text-green-600 w-6 h-6" />
                    <span className="text-green-800 font-semibold flex-1">Photo Captured Successfully!</span>
                    {companyPhotoPreviewUrl && <img src={companyPhotoPreviewUrl} className="w-16 h-16 object-cover rounded-lg border-2 border-green-400 shadow-sm" alt="Preview"/>}
                  </div>
                )}
              </div>

              <div><label className="block text-sm font-semibold text-gray-700 mb-2">Remark</label><input type="text" value={companyLabourData.Remark_1} onChange={(e) => handleCompanyLabourChange('Remark_1', e.target.value)} className="w-full px-4 py-3 border rounded-xl" /></div>

              <div className="flex gap-4 pt-4 border-t">
                <button type="button" onClick={resetCompanyLabourForm} className="flex-1 py-3 border rounded-xl font-medium flex justify-center gap-2">Reset</button>
                <button type="submit" disabled={isCompanyLabourLoading || isCompanyPhotoLoading} className="flex-1 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-medium flex justify-center gap-2"><Send className="w-4 h-4" /> Submit</button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default SiteExpensesForm;