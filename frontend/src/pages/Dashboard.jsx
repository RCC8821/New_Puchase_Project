

// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import {
//   User, FileText, ShoppingCart, DollarSign, Package,
//   Truck, ChevronDown, LogOut, Menu, X, Users
// } from 'lucide-react';
// import { useNavigate, useLocation } from 'react-router-dom';

// import RequirementReceived from '../components/purchase/RequirementReceived';
// import ApproveRequired from '../components/purchase/ApproveRequired';
// import IndentToGetQuotation from '../components/purchase/IndentToGetQuotation';
// import BillingFMS from '../components/BillingFMS';
// import Take_Quotation from '../components/purchase/Take_Quotation';
// import Approval_Quotation from '../components/purchase/Approval_Quotation';
// import PO from '../components/purchase/PO';
// import Vendor_FollowUp_Material from '../components/purchase/Vendor_FollowUp_Material';
// import Material_Received from '../components/purchase/Material_Received';
// import Final_Material_Received from '../components/purchase/Final_Material_Received';
// import MRN from '../components/purchase/MRN';
// import BillCheckedData from '../components/purchase/BillCheckedData';
// import Vendor_followup_billing from '../components/purchase/Vendor_followup_billing';
// import Bill_Processing from '../components/purchase/Bill_Processing';
// import BillTallyData from '../components/purchase/BillTallyData';
// import Payment from '../components/purchase/Payment';
// import Bill_Checked_18Step from '../components/purchase/Bill_Checked_18Step';
// import ContractorPurchseForm from '../components/ContractorPurchase/ContractorPurchseForm';
// import OutStanding from '../components/purchase/OutStanding';
// import Advance_payment from '../components/purchase/Advance_payment';
// import Approvel1 from '../components/Labour/Approvel1';
// import LabourManagment from '../components/Labour/LabourManagment';
// import Approvel2 from '../components/Labour/Approvel2';
// import PaidAmount from '../components/Labour/PaidAmount';
// import LabourPDF from '../components/Labour/LabourPDF';
// import SiteApprovel from '../components/SiteExpenses/SiteApprovel';
// import SitePaidAmount from '../components/SiteExpenses/SitePaidAmount';

// const T = {
//   navy: '#1e293b',
//   navyLight: '#334155',
//   navyDark: '#0f172a',
//   gold: '#f59e0b',
//   goldLight: '#fbbf24',
//   goldDark: '#d97706',
//   bg: '#f8fafc',
//   card: '#ffffff',
//   text: '#1e293b',
//   textLight: '#64748b',
//   textMuted: '#94a3b8',
//   border: '#e2e8f0',
//   borderLight: '#f1f5f9',
//   success: '#10b981',
//   danger: '#ef4444',
// };

// const Dashboard = () => {
//   const [openDropdown, setOpenDropdown] = useState(null);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [userType, setUserType] = useState(null);
//   const [selectedPage, setSelectedPage] = useState('no-access');
//   const [navVisible, setNavVisible] = useState(true);

//   const navigate = useNavigate();
//   const location = useLocation();
//   const lastScrollY = useRef(0);
//   const mainRef = useRef(null);
//   const dropdownRef = useRef(null);

//   // ── All Pages ──
//   const allPurchasePages = [
//     { id: 'requirement-received', name: 'Requirement Received', icon: FileText, component: RequirementReceived, path: '/dashboard/requirement-received', allowedUserTypes: ['admin', 'Site Engineer', 'Material Received'] },
//     { id: 'approve-required', name: 'Approve Required', icon: Package, component: ApproveRequired, path: '/dashboard/approve-required', allowedUserTypes: ['admin', 'Ravindra Singh'] },
//     { id: 'indent-to-get-quotation', name: 'Indent (To Get Quotation)', icon: Truck, component: IndentToGetQuotation, path: '/dashboard/indent-to-get-quotation', allowedUserTypes: ['admin', 'Ravi Rajak'] },
//     { id: 'Take_Quotation', name: 'Take Quotation', icon: Truck, component: Take_Quotation, path: '/dashboard/Take_Quotation', allowedUserTypes: ['admin', 'Anjali Malviya', 'Neha Masani'] },
//     { id: 'Approval_Quotation', name: 'Approval Quotation', icon: Truck, component: Approval_Quotation, path: '/dashboard/Approval_Quotation', allowedUserTypes: ['admin', 'Ravi Rajak'] },
//     { id: 'PO', name: 'PO', icon: Truck, component: PO, path: '/dashboard/PO', allowedUserTypes: ['admin', 'Ravi Rajak'] },
//     { id: 'Vendor_FollowUp_Material', name: 'Vendor Follow Up Material', icon: Truck, component: Vendor_FollowUp_Material, path: '/dashboard/Vendor_FollowUp_Material', allowedUserTypes: ['admin', 'Neha Masani'] },
//     { id: 'Material_Received', name: 'Material Received', icon: Truck, component: Material_Received, path: '/dashboard/Material_Received', allowedUserTypes: ['admin', 'Material Received', 'Neha Masani', 'Site Engineer'] },
//     { id: 'Final_Material_Received', name: 'Final Material Received', icon: Truck, component: Final_Material_Received, path: '/dashboard/Final_Material_Received', allowedUserTypes: ['admin', 'Final Material Received'] },
//     { id: 'MRN', name: 'MRN', icon: Truck, component: MRN, path: '/dashboard/MRN', allowedUserTypes: ['admin', 'Varsha Kahar'] },
//     { id: 'Vendor_followup_billing', name: 'Vendor Followup Billing', icon: Truck, component: Vendor_followup_billing, path: '/dashboard/Vendor_followup_billing', allowedUserTypes: ['admin', 'Neha Masani'] },
//     { id: 'Bill_Processing', name: 'Bill Processing', icon: Truck, component: Bill_Processing, path: '/dashboard/Bill_Processing', allowedUserTypes: ['admin', 'Varsha Kahar'] },
//     { id: 'BillCheckedData', name: 'Bill Checked Data', icon: Truck, component: BillCheckedData, path: '/dashboard/BillCheckedData', allowedUserTypes: ['admin', 'Ravi Rajak'] },
//     { id: 'BillTallyData', name: 'Bill Tally Data', icon: Truck, component: BillTallyData, path: '/dashboard/BillTallyData', allowedUserTypes: ['admin', 'Govind Ram Nagar'] },
//     { id: 'Payment', name: 'Payment', icon: Truck, component: Payment, path: '/dashboard/Payment', allowedUserTypes: ['admin', 'Govind Ram Nagar'] },
//     { id: 'Bill_Checked_18Step', name: 'Bill Checked 18 Step', icon: Truck, component: Bill_Checked_18Step, path: '/dashboard/Bill_Checked_18Step', allowedUserTypes: ['admin', 'Abhishek Sharma'] },
//     { id: 'contractor-purchase-form', name: 'Contractor Purchase Form', icon: FileText, component: ContractorPurchseForm, path: '/dashboard/contractor-purchase-form', allowedUserTypes: ['admin', 'Site Engineer', 'Material Received'] },
//     { id: 'outstanding', name: 'Without System Bill Entry', icon: DollarSign, component: OutStanding, path: '/dashboard/outstanding', allowedUserTypes: ['admin', 'Govind Ram Nagar'] },
//     { id: 'Advance_payment', name: 'Advance Payment', icon: DollarSign, component: Advance_payment, path: '/dashboard/Advance_payment', allowedUserTypes: ['admin', 'Govind Ram Nagar'] },
//   ];

//   const allLabourPages = [
//     { id: 'Approvel1', name: 'Labour Approval', icon: FileText, component: Approvel1, path: '/dashboard/Approvel1', allowedUserTypes: ['admin', 'Ravindra Singh'] },
//     { id: 'Labourmanagement', name: 'Labour Management', icon: FileText, component: LabourManagment, path: '/dashboard/Labourmanagement', allowedUserTypes: ['admin', 'Labour Managment'] },
//     { id: 'Deployed', name: 'Labour Deployed', icon: FileText, component: Approvel2, path: '/dashboard/Approvel2', allowedUserTypes: ['admin', 'Ashok Pandey'] },
//     { id: 'PaidAmount', name: 'Labour Payment', icon: FileText, component: PaidAmount, path: '/dashboard/PaidAmount', allowedUserTypes: ['admin', 'Govind Ram Nagar', 'Varsha Kahar'] },
//     { id: 'LabourPDF', name: 'Labour PDF', icon: FileText, component: LabourPDF, path: '/dashboard/LabourPDF', allowedUserTypes: ['admin', 'Varsha Kahar'] },
//   ];

//   const allSiteExpensesPages = [
//     { id: 'SiteApprovel', name: 'Site Approval', icon: FileText, component: SiteApprovel, path: '/dashboard/SiteApprovel', allowedUserTypes: ['admin', 'Ravindra Singh'] },
//     { id: 'SitePaidAmount', name: 'Site Paid Amount', icon: DollarSign, component: SitePaidAmount, path: '/dashboard/SitePaidAmount', allowedUserTypes: ['admin', 'Govind Ram Nagar', 'Varsha Kahar', 'Final Material Received'] },
//   ];

//   const getPurchasePages = () => allPurchasePages.filter(p => p.allowedUserTypes.includes(userType));
//   const getLabourPages = () => allLabourPages.filter(p => p.allowedUserTypes.includes(userType));
//   const getSiteExpensesPages = () => allSiteExpensesPages.filter(p => p.allowedUserTypes.includes(userType));
//   const getAllowedPages = () => [...getPurchasePages(), ...getLabourPages(), ...getSiteExpensesPages()];

//   const menuItems = [
//     { id: 'purchase', name: 'Purchase FMS', icon: ShoppingCart, pages: getPurchasePages() },
//     { id: 'labour', name: 'Labour', icon: Users, pages: getLabourPages() },
//     { id: 'siteExpenses', name: 'Site Expenses', icon: DollarSign, pages: getSiteExpensesPages() },
//     { id: 'sheet', name: 'Sheet Link', icon: FileText, url: 'https://docs.google.com/spreadsheets/d/18bmeQLqAOqleKS9628izEnirrRwOqkC0G_pEYGOsO-Y/edit?gid=0#gid=0', pages: [] },
//   ];

//   const pageContent = {
//     'requirement-received': 'Requirement Form',
//     'approve-required': 'Approve Required',
//     'indent-to-get-quotation': 'Indent (To Get Quotation)',
//     'Take_Quotation': 'Take Quotation',
//     'Approval_Quotation': 'Approval Quotation',
//     'PO': 'PO',
//     'Vendor_FollowUp_Material': 'Vendor Follow Up Material',
//     'Material_Received': 'Material Received',
//     'Final_Material_Received': 'Final Material Received',
//     'MRN': 'MRN',
//     'Vendor_followup_billing': 'Vendor Followup Billing',
//     'Bill_Processing': 'Bill Processing',
//     'BillCheckedData': 'Bill Checked Data',
//     'BillTallyData': 'Bill Tally Data',
//     'Payment': 'Payment',
//     'Bill_Checked_18Step': 'Bill Checked 18 Step',
//     'contractor-purchase-form': 'Contractor Purchase Form',
//     'outstanding': 'Without System Bill Entry',
//     'Advance_payment': 'Advance Payment',
//     'Approvel1': 'Labour Approval',
//     'Labourmanagement': 'Labour Management',
//     'Deployed': 'Labour Deployed',
//     'PaidAmount': 'Labour Payment',
//     'LabourPDF': 'Labour PDF',
//     'SiteApprovel': 'Site Approval',
//     'SitePaidAmount': 'Site Paid Amount',
//     'no-access': 'No Access',
//   };

//   // Scroll hide/show navbar
//   const handleScroll = useCallback(() => {
//     const el = mainRef.current;
//     if (!el) return;
//     const currentY = el.scrollTop;
//     if (currentY > lastScrollY.current && currentY > 60) {
//       setNavVisible(false);
//       setOpenDropdown(null);
//     } else {
//       setNavVisible(true);
//     }
//     lastScrollY.current = currentY;
//   }, []);

//   // Close dropdown on outside click
//   useEffect(() => {
//     const handleClick = (e) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
//         setOpenDropdown(null);
//       }
//     };
//     document.addEventListener('mousedown', handleClick);
//     return () => document.removeEventListener('mousedown', handleClick);
//   }, []);

//   // Auth + default page
//   useEffect(() => {
//     const stored = sessionStorage.getItem('userType');
//     if (stored) {
//       setUserType(stored);
//     } else {
//       navigate('/');
//     }
//   }, [navigate]);

//   useEffect(() => {
//     if (!userType) return;
//     const allowed = getAllowedPages();
//     if (allowed.length > 0) {
//       const current = allowed.find(p => location.pathname === p.path);
//       if (current) {
//         setSelectedPage(current.id);
//       } else {
//         setSelectedPage(allowed[0].id);
//         navigate(allowed[0].path);
//       }
//     } else {
//       setSelectedPage('no-access');
//     }
//   }, [userType, location.pathname]);

//   // Handlers
//   const selectPage = (page) => {
//     setSelectedPage(page.id);
//     setOpenDropdown(null);
//     setIsMobileMenuOpen(false);
//     navigate(page.path);
//   };

//   const handleLogout = () => {
//     sessionStorage.clear();
//     navigate('/');
//   };

//   const getCurrentComponent = () => {
//     const all = getAllowedPages();
//     const found = all.find(p => p.id === selectedPage);
//     return found?.component || null;
//   };

//   const CurrentComponent = getCurrentComponent();

//   return (
//     <div style={{
//       minHeight: '100vh',
//       background: T.bg,
//       fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
//     }}>

//       {/* ══════════ NAVBAR ══════════ */}
//       <nav
//         ref={dropdownRef}
//         style={{
//           position: 'fixed',
//           top: 0, left: 0, right: 0,
//           zIndex: 100,
//           background: T.navy,
//           borderBottom: `2px solid ${T.gold}`,
//           transform: navVisible ? 'translateY(0)' : 'translateY(-100%)',
//           transition: 'transform 0.3s ease',
//         }}
//       >
//         <div style={{
//           width: '100%',
//           padding: '0 16px',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'space-between',
//           height: 56,
//         }}>

//           {/* Logo */}
//           <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//             <div style={{
//               width: 34, height: 34, borderRadius: 8,
//               background: 'white', display: 'flex',
//               alignItems: 'center', justifyContent: 'center',
//               boxShadow: `0 0 0 2px ${T.gold}40`,
//             }}>
//               <img src="/rcc-logo.png" alt="RCC"
//                 style={{ width: 22, height: 22, objectFit: 'contain' }}
//                 onError={(e) => {
//                   e.currentTarget.style.display = 'none';
//                   e.currentTarget.parentElement.innerHTML =
//                     `<span style="font-size:12px;font-weight:800;color:${T.navy}">RCC</span>`;
//                 }}
//               />
//             </div>
//             <span style={{ color: 'white', fontSize: 15, fontWeight: 700, letterSpacing: 0.5 }}>
//               RCC <span style={{ color: T.gold }}>SYSTEMS</span>
//             </span>
//           </div>

//           {/* Desktop Menu */}
//           <div className="desktop-menu" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
//             {menuItems.map((menu) => {
//               if (menu.url) {
//                 return (
//                   <a key={menu.id} href={menu.url} target="_blank" rel="noopener noreferrer"
//                     style={{
//                       display: 'flex', alignItems: 'center', gap: 5,
//                       padding: '6px 12px', borderRadius: 6,
//                       color: '#cbd5e1', fontSize: 12, fontWeight: 500,
//                       textDecoration: 'none', transition: 'all 0.2s',
//                     }}
//                     onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'white'; }}
//                     onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#cbd5e1'; }}
//                   >
//                     <menu.icon size={14} />{menu.name}
//                   </a>
//                 );
//               }
//               if (menu.pages.length === 0) return null;
//               const isActive = menu.pages.some(p => p.id === selectedPage);
//               const isOpen = openDropdown === menu.id;

//               return (
//                 <div key={menu.id} style={{ position: 'relative' }}>
//                   <button
//                     onClick={() => setOpenDropdown(isOpen ? null : menu.id)}
//                     style={{
//                       display: 'flex', alignItems: 'center', gap: 5,
//                       padding: '6px 12px', borderRadius: 6,
//                       border: isActive ? `1px solid ${T.gold}50` : '1px solid transparent',
//                       background: isActive ? `${T.gold}15` : 'transparent',
//                       color: isActive ? T.goldLight : '#cbd5e1',
//                       fontSize: 12, fontWeight: isActive ? 600 : 500,
//                       cursor: 'pointer', transition: 'all 0.2s',
//                     }}
//                     onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'white'; } }}
//                     onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#cbd5e1'; } }}
//                   >
//                     <menu.icon size={14} />{menu.name}
//                     <ChevronDown size={12} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
//                   </button>

//                   {isOpen && (
//                     <div style={{
//                       position: 'absolute', top: '100%', left: 0, marginTop: 6,
//                       minWidth: 220, maxHeight: 400, overflowY: 'auto',
//                       background: 'white', borderRadius: 8,
//                       border: `1px solid ${T.border}`,
//                       boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
//                       padding: '4px 0', zIndex: 200,
//                     }}>
//                       {menu.pages.map((page) => {
//                         const isPageActive = selectedPage === page.id;
//                         return (
//                           <button key={page.id}
//                             onClick={() => selectPage(page)}
//                             style={{
//                               width: '100%', display: 'flex', alignItems: 'center',
//                               gap: 8, padding: '8px 14px', border: 'none',
//                               background: isPageActive ? `${T.gold}12` : 'transparent',
//                               color: isPageActive ? T.goldDark : T.text,
//                               fontSize: 12, fontWeight: isPageActive ? 600 : 400,
//                               cursor: 'pointer', transition: 'all 0.15s',
//                               borderLeft: isPageActive ? `3px solid ${T.gold}` : '3px solid transparent',
//                               textAlign: 'left',
//                             }}
//                             onMouseEnter={(e) => { if (!isPageActive) e.currentTarget.style.background = '#f8fafc'; }}
//                             onMouseLeave={(e) => { if (!isPageActive) e.currentTarget.style.background = 'transparent'; }}
//                           >
//                             <page.icon size={13} style={{ color: isPageActive ? T.gold : T.textMuted }} />
//                             {page.name}
//                           </button>
//                         );
//                       })}
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </div>

//           {/* User + Logout */}
//           <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//             <div className="desktop-menu" style={{
//               display: 'flex', alignItems: 'center', gap: 6,
//               padding: '5px 10px', borderRadius: 6,
//               background: 'rgba(255,255,255,0.08)',
//             }}>
//               <div style={{
//                 width: 26, height: 26, borderRadius: 6,
//                 background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
//                 display: 'flex', alignItems: 'center', justifyContent: 'center',
//               }}>
//                 <User size={13} color={T.navyDark} />
//               </div>
//               <span style={{ color: '#e2e8f0', fontSize: 12, fontWeight: 500 }}>
//                 {userType || 'Guest'}
//               </span>
//             </div>

//             <button onClick={handleLogout} style={{
//               display: 'flex', alignItems: 'center', gap: 5,
//               padding: '6px 12px', borderRadius: 6,
//               border: '1px solid rgba(239,68,68,0.3)',
//               background: 'rgba(239,68,68,0.1)',
//               color: '#fca5a5', fontSize: 12, fontWeight: 500,
//               cursor: 'pointer', transition: 'all 0.2s',
//             }}
//               onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; }}
//               onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
//             >
//               <LogOut size={13} />
//               <span className="desktop-menu">Logout</span>
//             </button>

//             <button className="mobile-menu-btn"
//               onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//               style={{
//                 display: 'none', padding: 6, borderRadius: 6,
//                 border: 'none', background: 'rgba(255,255,255,0.1)',
//                 color: 'white', cursor: 'pointer',
//               }}
//             >
//               {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
//             </button>
//           </div>
//         </div>

//         {/* Mobile Menu */}
//         {isMobileMenuOpen && (
//           <div style={{
//             background: T.navyDark, borderTop: `1px solid ${T.navyLight}`,
//             padding: '12px 16px 16px', maxHeight: '70vh', overflowY: 'auto',
//           }}>
//             <div style={{
//               display: 'flex', alignItems: 'center', gap: 10,
//               padding: '10px 12px', borderRadius: 8,
//               background: 'rgba(255,255,255,0.05)', marginBottom: 12,
//             }}>
//               <div style={{
//                 width: 32, height: 32, borderRadius: 8,
//                 background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
//                 display: 'flex', alignItems: 'center', justifyContent: 'center',
//               }}>
//                 <User size={16} color={T.navyDark} />
//               </div>
//               <span style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 500 }}>
//                 {userType || 'Guest'}
//               </span>
//             </div>

//             {menuItems.map((menu) => {
//               if (menu.url) {
//                 return (
//                   <a key={menu.id} href={menu.url} target="_blank" rel="noopener noreferrer"
//                     onClick={() => setIsMobileMenuOpen(false)}
//                     style={{
//                       display: 'flex', alignItems: 'center', gap: 10,
//                       padding: '10px 12px', borderRadius: 8,
//                       color: '#cbd5e1', fontSize: 14, textDecoration: 'none', marginBottom: 2,
//                     }}
//                   >
//                     <menu.icon size={18} />{menu.name}
//                   </a>
//                 );
//               }
//               if (menu.pages.length === 0) return null;
//               const isOpen = openDropdown === menu.id;
//               const isActive = menu.pages.some(p => p.id === selectedPage);

//               return (
//                 <div key={menu.id} style={{ marginBottom: 4 }}>
//                   <button
//                     onClick={() => setOpenDropdown(isOpen ? null : menu.id)}
//                     style={{
//                       width: '100%', display: 'flex', alignItems: 'center',
//                       gap: 10, padding: '10px 12px', borderRadius: 8,
//                       border: 'none', background: isActive ? `${T.gold}15` : 'transparent',
//                       color: isActive ? T.goldLight : '#cbd5e1',
//                       fontSize: 14, fontWeight: isActive ? 600 : 400,
//                       cursor: 'pointer', textAlign: 'left',
//                     }}
//                   >
//                     <menu.icon size={18} />
//                     <span style={{ flex: 1 }}>{menu.name}</span>
//                     <ChevronDown size={16} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
//                   </button>
//                   {isOpen && (
//                     <div style={{ marginLeft: 16, marginTop: 4, borderLeft: `2px solid ${T.navyLight}`, paddingLeft: 12 }}>
//                       {menu.pages.map((page) => {
//                         const isPageActive = selectedPage === page.id;
//                         return (
//                           <button key={page.id}
//                             onClick={() => selectPage(page)}
//                             style={{
//                               width: '100%', display: 'flex', alignItems: 'center',
//                               gap: 8, padding: '8px 10px', borderRadius: 6,
//                               border: 'none', background: isPageActive ? `${T.gold}20` : 'transparent',
//                               color: isPageActive ? T.goldLight : '#94a3b8',
//                               fontSize: 13, fontWeight: isPageActive ? 600 : 400,
//                               cursor: 'pointer', textAlign: 'left', marginBottom: 2,
//                             }}
//                           >
//                             <page.icon size={14} />{page.name}
//                           </button>
//                         );
//                       })}
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </nav>

//       {/* ══════════ MAIN CONTENT - FULL WIDTH ══════════ */}
//       <div
//         ref={mainRef}
//         onScroll={handleScroll}
//         style={{
//           paddingTop: 56,
//           height: '100vh',
//           overflowY: 'auto',
//         }}
//       >
//         <div style={{
//           width: '100%',
//           padding: '12px 12px 40px',
//         }}>

//           {/* Page Header */}
//           <div style={{
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'space-between',
//             marginBottom: 12,
//           }}>
//             <div>
//               <h1 style={{
//                 fontSize: 18,
//                 fontWeight: 700,
//                 color: T.navy,
//                 margin: 0,
//               }}>
//                 {pageContent[selectedPage] || 'Page Not Found'}
//               </h1>
//               <div style={{
//                 width: 36,
//                 height: 3,
//                 background: T.gold,
//                 borderRadius: 3,
//                 marginTop: 6,
//               }} />
//             </div>
//           </div>

//           {/* Content - NO CARD WRAPPER, FULL WIDTH */}
//           <div style={{
//             width: '100%',
//             minHeight: 'calc(100vh - 120px)',
//           }}>
//             {CurrentComponent ? (
//               <CurrentComponent selectedPage={selectedPage} />
//             ) : (
//               <div style={{
//                 display: 'flex',
//                 flexDirection: 'column',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 height: 300,
//                 background: T.card,
//                 borderRadius: 10,
//                 border: `1px solid ${T.border}`,
//                 color: T.textMuted,
//               }}>
//                 <Package size={48} style={{ marginBottom: 16, color: T.border }} />
//                 <p style={{ fontSize: 16, fontWeight: 500, color: T.textLight }}>
//                   {selectedPage === 'no-access'
//                     ? 'You do not have access to any pages.'
//                     : 'Page not found'}
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Mobile overlay */}
//       {isMobileMenuOpen && (
//         <div onClick={() => setIsMobileMenuOpen(false)}
//           style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 50 }}
//         />
//       )}

//       {/* Responsive CSS */}
//       <style>{`
//         @media (max-width: 900px) {
//           .desktop-menu { display: none !important; }
//           .mobile-menu-btn { display: flex !important; }
//         }
//         @media (min-width: 901px) {
//           .mobile-menu-btn { display: none !important; }
//         }
//         ::-webkit-scrollbar { width: 6px; }
//         ::-webkit-scrollbar-track { background: ${T.bg}; }
//         ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 6px; }
//         ::-webkit-scrollbar-thumb:hover { background: ${T.textMuted}; }
//       `}</style>
//     </div>
//   );
// };

// export default Dashboard;














///////////////////////////////////////////////////////////







// Dashboard.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  User, FileText, ShoppingCart, DollarSign, Package,
  Truck, ChevronDown, LogOut, Menu, X, Users
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

import RequirementReceived from '../components/purchase/RequirementReceived';
import ApproveRequired from '../components/purchase/ApproveRequired';
import IndentToGetQuotation from '../components/purchase/IndentToGetQuotation';
import BillingFMS from '../components/BillingFMS';
import Take_Quotation from '../components/purchase/Take_Quotation';
import Approval_Quotation from '../components/purchase/Approval_Quotation';
import PO from '../components/purchase/PO';
import Vendor_FollowUp_Material from '../components/purchase/Vendor_FollowUp_Material';
import Material_Received from '../components/purchase/Material_Received';
import Final_Material_Received from '../components/purchase/Final_Material_Received';
import MRN from '../components/purchase/MRN';
import BillCheckedData from '../components/purchase/BillCheckedData';
import Vendor_followup_billing from '../components/purchase/Vendor_followup_billing';
import Bill_Processing from '../components/purchase/Bill_Processing';
import BillTallyData from '../components/purchase/BillTallyData';
import Payment from '../components/purchase/Payment';
import Bill_Checked_18Step from '../components/purchase/Bill_Checked_18Step';
import ContractorPurchseForm from '../components/ContractorPurchase/ContractorPurchseForm';
import OutStanding from '../components/purchase/OutStanding';
import Advance_payment from '../components/purchase/Advance_payment';
import Approvel1 from '../components/Labour/Approvel1';
import LabourManagment from '../components/Labour/LabourManagment';
import Approvel2 from '../components/Labour/Approvel2';
import PaidAmount from '../components/Labour/PaidAmount';
import LabourPDF from '../components/Labour/LabourPDF';
import SiteApprovel from '../components/SiteExpenses/SiteApprovel';
import SitePaidAmount from '../components/SiteExpenses/SitePaidAmount';

// ✅ NEW IMPORT
import SignatureRequirement from '../components/purchase/SignatureRequirement';

const T = {
  navy: '#1e293b',
  navyLight: '#334155',
  navyDark: '#0f172a',
  gold: '#f59e0b',
  goldLight: '#fbbf24',
  goldDark: '#d97706',
  bg: '#f8fafc',
  card: '#ffffff',
  text: '#1e293b',
  textLight: '#64748b',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  success: '#10b981',
  danger: '#ef4444',
};

const Dashboard = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userType, setUserType] = useState(null);
  const [selectedPage, setSelectedPage] = useState('no-access');
  const [navVisible, setNavVisible] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();
  const lastScrollY = useRef(0);
  const mainRef = useRef(null);
  const dropdownRef = useRef(null);

  // ── All Purchase Pages ──
  const allPurchasePages = [
    {
      id: 'requirement-received',
      name: 'Requirement Received',
      icon: FileText,
      component: RequirementReceived,
      path: '/dashboard/requirement-received',
      allowedUserTypes: ['admin', 'Site Engineer', 'Material Received'],
    },
    {
      id: 'approve-required',
      name: 'Approve Required',
      icon: Package,
      component: ApproveRequired,
      path: '/dashboard/approve-required',
      allowedUserTypes: ['admin', 'Ravindra Singh'],
    },
    {
      id: 'indent-to-get-quotation',
      name: 'Indent (To Get Quotation)',
      icon: Truck,
      component: IndentToGetQuotation,
      path: '/dashboard/indent-to-get-quotation',
      allowedUserTypes: ['admin', 'Ravi Rajak'],
    },
    {
      id: 'Take_Quotation',
      name: 'Take Quotation',
      icon: Truck,
      component: Take_Quotation,
      path: '/dashboard/Take_Quotation',
      allowedUserTypes: ['admin', 'Anjali Malviya', 'Neha Masani'],
    },
    {
      id: 'Approval_Quotation',
      name: 'Approval Quotation',
      icon: Truck,
      component: Approval_Quotation,
      path: '/dashboard/Approval_Quotation',
      allowedUserTypes: ['admin', 'Ravi Rajak'],
    },
    {
      id: 'PO',
      name: 'PO',
      icon: Truck,
      component: PO,
      path: '/dashboard/PO',
      allowedUserTypes: ['admin', 'Ravi Rajak'],
    },
    {
      id: 'Vendor_FollowUp_Material',
      name: 'Vendor Follow Up Material',
      icon: Truck,
      component: Vendor_FollowUp_Material,
      path: '/dashboard/Vendor_FollowUp_Material',
      allowedUserTypes: ['admin', 'Neha Masani'],
    },
    {
      id: 'Material_Received',
      name: 'Material Received',
      icon: Truck,
      component: Material_Received,
      path: '/dashboard/Material_Received',
      allowedUserTypes: ['admin', 'Material Received', 'Neha Masani', 'Site Engineer'],
    },
    {
      id: 'Final_Material_Received',
      name: 'Final Material Received',
      icon: Truck,
      component: Final_Material_Received,
      path: '/dashboard/Final_Material_Received',
      allowedUserTypes: ['admin', 'Final Material Received'],
    },
    {
      id: 'MRN',
      name: 'MRN',
      icon: Truck,
      component: MRN,
      path: '/dashboard/MRN',
      allowedUserTypes: ['admin', 'Varsha Kahar'],
    },
    {
      id: 'Vendor_followup_billing',
      name: 'Vendor Followup Billing',
      icon: Truck,
      component: Vendor_followup_billing,
      path: '/dashboard/Vendor_followup_billing',
      allowedUserTypes: ['admin', 'Neha Masani'],
    },
    {
      id: 'Bill_Processing',
      name: 'Bill Processing',
      icon: Truck,
      component: Bill_Processing,
      path: '/dashboard/Bill_Processing',
      allowedUserTypes: ['admin', 'Varsha Kahar'],
    },
    {
      id: 'BillCheckedData',
      name: 'Bill Checked Data',
      icon: Truck,
      component: BillCheckedData,
      path: '/dashboard/BillCheckedData',
      allowedUserTypes: ['admin', 'Ravi Rajak'],
    },
    {
      id: 'BillTallyData',
      name: 'Bill Tally Data',
      icon: Truck,
      component: BillTallyData,
      path: '/dashboard/BillTallyData',
      allowedUserTypes: ['admin', 'Govind Ram Nagar'],
    },
    {
      id: 'Payment',
      name: 'Payment',
      icon: Truck,
      component: Payment,
      path: '/dashboard/Payment',
      allowedUserTypes: ['admin', 'Govind Ram Nagar'],
    },
    {
      id: 'Bill_Checked_18Step',
      name: 'Bill Checked 18 Step',
      icon: Truck,
      component: Bill_Checked_18Step,
      path: '/dashboard/Bill_Checked_18Step',
      allowedUserTypes: ['admin', 'Abhishek Sharma'],
    },
    {
      id: 'contractor-purchase-form',
      name: 'Contractor Purchase Form',
      icon: FileText,
      component: ContractorPurchseForm,
      path: '/dashboard/contractor-purchase-form',
      allowedUserTypes: ['admin', 'Site Engineer', 'Material Received'],
    },
    {
      id: 'outstanding',
      name: 'Without System Bill Entry',
      icon: DollarSign,
      component: OutStanding,
      path: '/dashboard/outstanding',
      allowedUserTypes: ['admin', 'Govind Ram Nagar'],
    },
    {
      id: 'Advance_payment',
      name: 'Advance Payment',
      icon: DollarSign,
      component: Advance_payment,
      path: '/dashboard/Advance_payment',
      allowedUserTypes: ['admin', 'Govind Ram Nagar'],
    },

    // ✅ NEW - Signature Requirement
    {
      id: 'signature-requirement',
      name: 'Signature Requirement',
      icon: FileText,
      component: SignatureRequirement,
      path: '/dashboard/signature-requirement',
      allowedUserTypes: ['admin', 'Signature Requirement'], // ← sirf yahi user
    },
  ];

  const allLabourPages = [
    {
      id: 'Approvel1',
      name: 'Labour Approval',
      icon: FileText,
      component: Approvel1,
      path: '/dashboard/Approvel1',
      allowedUserTypes: ['admin', 'Ravindra Singh'],
    },
    {
      id: 'Labourmanagement',
      name: 'Labour Management',
      icon: FileText,
      component: LabourManagment,
      path: '/dashboard/Labourmanagement',
      allowedUserTypes: ['admin', 'Labour Managment'],
    },
    {
      id: 'Deployed',
      name: 'Labour Deployed',
      icon: FileText,
      component: Approvel2,
      path: '/dashboard/Approvel2',
      allowedUserTypes: ['admin', 'Ashok Pandey'],
    },
    {
      id: 'PaidAmount',
      name: 'Labour Payment',
      icon: FileText,
      component: PaidAmount,
      path: '/dashboard/PaidAmount',
      allowedUserTypes: ['admin', 'Govind Ram Nagar', 'Varsha Kahar'],
    },
    {
      id: 'LabourPDF',
      name: 'Labour PDF',
      icon: FileText,
      component: LabourPDF,
      path: '/dashboard/LabourPDF',
      allowedUserTypes: ['admin', 'Varsha Kahar'],
    },
  ];

  const allSiteExpensesPages = [
    {
      id: 'SiteApprovel',
      name: 'Site Approval',
      icon: FileText,
      component: SiteApprovel,
      path: '/dashboard/SiteApprovel',
      allowedUserTypes: ['admin', 'Ravindra Singh'],
    },
    {
      id: 'SitePaidAmount',
      name: 'Site Paid Amount',
      icon: DollarSign,
      component: SitePaidAmount,
      path: '/dashboard/SitePaidAmount',
      allowedUserTypes: ['admin', 'Govind Ram Nagar', 'Varsha Kahar', 'Final Material Received'],
    },
  ];

  const getPurchasePages = () =>
    allPurchasePages.filter((p) => p.allowedUserTypes.includes(userType));
  const getLabourPages = () =>
    allLabourPages.filter((p) => p.allowedUserTypes.includes(userType));
  const getSiteExpensesPages = () =>
    allSiteExpensesPages.filter((p) => p.allowedUserTypes.includes(userType));
  const getAllowedPages = () => [
    ...getPurchasePages(),
    ...getLabourPages(),
    ...getSiteExpensesPages(),
  ];

  const menuItems = [
    {
      id: 'purchase',
      name: 'Purchase FMS',
      icon: ShoppingCart,
      pages: getPurchasePages(),
    },
    {
      id: 'labour',
      name: 'Labour',
      icon: Users,
      pages: getLabourPages(),
    },
    {
      id: 'siteExpenses',
      name: 'Site Expenses',
      icon: DollarSign,
      pages: getSiteExpensesPages(),
    },
    {
      id: 'sheet',
      name: 'Sheet Link',
      icon: FileText,
      url: 'https://docs.google.com/spreadsheets/d/18bmeQLqAOqleKS9628izEnirrRwOqkC0G_pEYGOsO-Y/edit?gid=0#gid=0',
      pages: [],
    },
  ];

  const pageContent = {
    'requirement-received': 'Requirement Form',
    'approve-required': 'Approve Required',
    'indent-to-get-quotation': 'Indent (To Get Quotation)',
    Take_Quotation: 'Take Quotation',
    Approval_Quotation: 'Approval Quotation',
    PO: 'PO',
    Vendor_FollowUp_Material: 'Vendor Follow Up Material',
    Material_Received: 'Material Received',
    Final_Material_Received: 'Final Material Received',
    MRN: 'MRN',
    Vendor_followup_billing: 'Vendor Followup Billing',
    Bill_Processing: 'Bill Processing',
    BillCheckedData: 'Bill Checked Data',
    BillTallyData: 'Bill Tally Data',
    Payment: 'Payment',
    Bill_Checked_18Step: 'Bill Checked 18 Step',
    'contractor-purchase-form': 'Contractor Purchase Form',
    outstanding: 'Without System Bill Entry',
    Advance_payment: 'Advance Payment',
    Approvel1: 'Labour Approval',
    Labourmanagement: 'Labour Management',
    Deployed: 'Labour Deployed',
    PaidAmount: 'Labour Payment',
    LabourPDF: 'Labour PDF',
    SiteApprovel: 'Site Approval',
    SitePaidAmount: 'Site Paid Amount',
    'no-access': 'No Access',

    // ✅ NEW
    'signature-requirement': 'Signature Requirement',
  };

  // Scroll hide/show navbar
  const handleScroll = useCallback(() => {
    const el = mainRef.current;
    if (!el) return;
    const currentY = el.scrollTop;
    if (currentY > lastScrollY.current && currentY > 60) {
      setNavVisible(false);
      setOpenDropdown(null);
    } else {
      setNavVisible(true);
    }
    lastScrollY.current = currentY;
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Auth + default page
  useEffect(() => {
    const stored = sessionStorage.getItem('userType');
    if (stored) {
      setUserType(stored);
    } else {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    if (!userType) return;
    const allowed = getAllowedPages();
    if (allowed.length > 0) {
      const current = allowed.find((p) => location.pathname === p.path);
      if (current) {
        setSelectedPage(current.id);
      } else {
        setSelectedPage(allowed[0].id);
        navigate(allowed[0].path);
      }
    } else {
      setSelectedPage('no-access');
    }
  }, [userType, location.pathname]);

  const selectPage = (page) => {
    setSelectedPage(page.id);
    setOpenDropdown(null);
    setIsMobileMenuOpen(false);
    navigate(page.path);
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/');
  };

  const getCurrentComponent = () => {
    const all = getAllowedPages();
    const found = all.find((p) => p.id === selectedPage);
    return found?.component || null;
  };

  const CurrentComponent = getCurrentComponent();

  return (
    <div style={{
      minHeight: '100vh',
      background: T.bg,
      fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
    }}>

      {/* ══════════ NAVBAR ══════════ */}
      <nav
        ref={dropdownRef}
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          zIndex: 100,
          background: T.navy,
          borderBottom: `2px solid ${T.gold}`,
          transform: navVisible ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 0.3s ease',
        }}
      >
        <div style={{
          width: '100%',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 56,
        }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8,
              background: 'white', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 0 2px ${T.gold}40`,
            }}>
              <img src="/rcc-logo.png" alt="RCC"
                style={{ width: 22, height: 22, objectFit: 'contain' }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement.innerHTML =
                    `<span style="font-size:12px;font-weight:800;color:${T.navy}">RCC</span>`;
                }}
              />
            </div>
            <span style={{ color: 'white', fontSize: 15, fontWeight: 700, letterSpacing: 0.5 }}>
              RCC <span style={{ color: T.gold }}>SYSTEMS</span>
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="desktop-menu" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {menuItems.map((menu) => {
              if (menu.url) {
                return (
                  <a key={menu.id} href={menu.url} target="_blank" rel="noopener noreferrer"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '6px 12px', borderRadius: 6,
                      color: '#cbd5e1', fontSize: 12, fontWeight: 500,
                      textDecoration: 'none', transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#cbd5e1';
                    }}
                  >
                    <menu.icon size={14} />{menu.name}
                  </a>
                );
              }
              if (menu.pages.length === 0) return null;
              const isActive = menu.pages.some((p) => p.id === selectedPage);
              const isOpen = openDropdown === menu.id;

              return (
                <div key={menu.id} style={{ position: 'relative' }}>
                  <button
                    onClick={() => setOpenDropdown(isOpen ? null : menu.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '6px 12px', borderRadius: 6,
                      border: isActive ? `1px solid ${T.gold}50` : '1px solid transparent',
                      background: isActive ? `${T.gold}15` : 'transparent',
                      color: isActive ? T.goldLight : '#cbd5e1',
                      fontSize: 12, fontWeight: isActive ? 600 : 500,
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                        e.currentTarget.style.color = 'white';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#cbd5e1';
                      }
                    }}
                  >
                    <menu.icon size={14} />{menu.name}
                    <ChevronDown size={12} style={{
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
                      transition: 'transform 0.2s',
                    }} />
                  </button>

                  {isOpen && (
                    <div style={{
                      position: 'absolute', top: '100%', left: 0, marginTop: 6,
                      minWidth: 220, maxHeight: 400, overflowY: 'auto',
                      background: 'white', borderRadius: 8,
                      border: `1px solid ${T.border}`,
                      boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                      padding: '4px 0', zIndex: 200,
                    }}>
                      {menu.pages.map((page) => {
                        const isPageActive = selectedPage === page.id;
                        return (
                          <button key={page.id}
                            onClick={() => selectPage(page)}
                            style={{
                              width: '100%', display: 'flex', alignItems: 'center',
                              gap: 8, padding: '8px 14px', border: 'none',
                              background: isPageActive ? `${T.gold}12` : 'transparent',
                              color: isPageActive ? T.goldDark : T.text,
                              fontSize: 12, fontWeight: isPageActive ? 600 : 400,
                              cursor: 'pointer', transition: 'all 0.15s',
                              borderLeft: isPageActive
                                ? `3px solid ${T.gold}`
                                : '3px solid transparent',
                              textAlign: 'left',
                            }}
                            onMouseEnter={(e) => {
                              if (!isPageActive) e.currentTarget.style.background = '#f8fafc';
                            }}
                            onMouseLeave={(e) => {
                              if (!isPageActive) e.currentTarget.style.background = 'transparent';
                            }}
                          >
                            <page.icon size={13} style={{ color: isPageActive ? T.gold : T.textMuted }} />
                            {page.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* User + Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="desktop-menu" style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 10px', borderRadius: 6,
              background: 'rgba(255,255,255,0.08)',
            }}>
              <div style={{
                width: 26, height: 26, borderRadius: 6,
                background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <User size={13} color={T.navyDark} />
              </div>
              <span style={{ color: '#e2e8f0', fontSize: 12, fontWeight: 500 }}>
                {userType || 'Guest'}
              </span>
            </div>

            <button onClick={handleLogout} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '6px 12px', borderRadius: 6,
              border: '1px solid rgba(239,68,68,0.3)',
              background: 'rgba(239,68,68,0.1)',
              color: '#fca5a5', fontSize: 12, fontWeight: 500,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239,68,68,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
              }}
            >
              <LogOut size={13} />
              <span className="desktop-menu">Logout</span>
            </button>

            <button className="mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{
                display: 'none', padding: 6, borderRadius: 6,
                border: 'none', background: 'rgba(255,255,255,0.1)',
                color: 'white', cursor: 'pointer',
              }}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div style={{
            background: T.navyDark,
            borderTop: `1px solid ${T.navyLight}`,
            padding: '12px 16px 16px',
            maxHeight: '70vh',
            overflowY: 'auto',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 8,
              background: 'rgba(255,255,255,0.05)', marginBottom: 12,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <User size={16} color={T.navyDark} />
              </div>
              <span style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 500 }}>
                {userType || 'Guest'}
              </span>
            </div>

            {menuItems.map((menu) => {
              if (menu.url) {
                return (
                  <a key={menu.id} href={menu.url} target="_blank" rel="noopener noreferrer"
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 12px', borderRadius: 8,
                      color: '#cbd5e1', fontSize: 14,
                      textDecoration: 'none', marginBottom: 2,
                    }}
                  >
                    <menu.icon size={18} />{menu.name}
                  </a>
                );
              }
              if (menu.pages.length === 0) return null;
              const isOpen = openDropdown === menu.id;
              const isActive = menu.pages.some((p) => p.id === selectedPage);

              return (
                <div key={menu.id} style={{ marginBottom: 4 }}>
                  <button
                    onClick={() => setOpenDropdown(isOpen ? null : menu.id)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center',
                      gap: 10, padding: '10px 12px', borderRadius: 8,
                      border: 'none',
                      background: isActive ? `${T.gold}15` : 'transparent',
                      color: isActive ? T.goldLight : '#cbd5e1',
                      fontSize: 14, fontWeight: isActive ? 600 : 400,
                      cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <menu.icon size={18} />
                    <span style={{ flex: 1 }}>{menu.name}</span>
                    <ChevronDown size={16} style={{
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
                      transition: 'transform 0.2s',
                    }} />
                  </button>

                  {isOpen && (
                    <div style={{
                      marginLeft: 16, marginTop: 4,
                      borderLeft: `2px solid ${T.navyLight}`,
                      paddingLeft: 12,
                    }}>
                      {menu.pages.map((page) => {
                        const isPageActive = selectedPage === page.id;
                        return (
                          <button key={page.id}
                            onClick={() => selectPage(page)}
                            style={{
                              width: '100%', display: 'flex', alignItems: 'center',
                              gap: 8, padding: '8px 10px', borderRadius: 6,
                              border: 'none',
                              background: isPageActive ? `${T.gold}20` : 'transparent',
                              color: isPageActive ? T.goldLight : '#94a3b8',
                              fontSize: 13, fontWeight: isPageActive ? 600 : 400,
                              cursor: 'pointer', textAlign: 'left', marginBottom: 2,
                            }}
                          >
                            <page.icon size={14} />{page.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </nav>

      {/* ══════════ MAIN CONTENT ══════════ */}
      <div
        ref={mainRef}
        onScroll={handleScroll}
        style={{
          paddingTop: 56,
          height: '100vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ width: '100%', padding: '12px 12px 40px' }}>

          {/* Page Header */}
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', marginBottom: 12,
          }}>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 700, color: T.navy, margin: 0 }}>
                {pageContent[selectedPage] || 'Page Not Found'}
              </h1>
              <div style={{
                width: 36, height: 3,
                background: T.gold, borderRadius: 3, marginTop: 6,
              }} />
            </div>
          </div>

          {/* Content */}
          <div style={{ width: '100%', minHeight: 'calc(100vh - 120px)' }}>
            {CurrentComponent ? (
              <CurrentComponent selectedPage={selectedPage} />
            ) : (
              <div style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                height: 300, background: T.card,
                borderRadius: 10, border: `1px solid ${T.border}`,
                color: T.textMuted,
              }}>
                <Package size={48} style={{ marginBottom: 16, color: T.border }} />
                <p style={{ fontSize: 16, fontWeight: 500, color: T.textLight }}>
                  {selectedPage === 'no-access'
                    ? 'You do not have access to any pages.'
                    : 'Page not found'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.3)', zIndex: 50,
          }}
        />
      )}

      {/* Responsive CSS */}
      <style>{`
        @media (max-width: 900px) {
          .desktop-menu { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
        @media (min-width: 901px) {
          .mobile-menu-btn { display: none !important; }
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${T.bg}; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 6px; }
        ::-webkit-scrollbar-thumb:hover { background: ${T.textMuted}; }
      `}</style>
    </div>
  );
};

export default Dashboard;