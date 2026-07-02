// import React, { useState, useEffect } from "react";

// const Vendor_followup_billing = () => {
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [detailsModalOpen, setDetailsModalOpen] = useState(false);
//   const [selectedPONumber, setSelectedPONumber] = useState("");
//   const [poDetails, setPoDetails] = useState(null);
//   const [poNumbers, setPoNumbers] = useState([]);
//   const [status, setStatus] = useState("");
//   const [remark, setRemark] = useState("");

//   const fetchRequests = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const url = `${
//         import.meta.env.VITE_BACKEND_URL
//       }/api/vendor-FollowUp-Billing`;
//       const response = await fetch(url, {
//         method: "GET",
//         headers: { Accept: "application/json" },
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(`HTTP ${response.status}: ${errorText}`);
//       }

//       const data = await response.json();
//       if (data.success && Array.isArray(data.data)) {
//         setRequests(data.data);
//         const uniquePOs = [...new Set(data.data.map((r) => r.poNumber))].filter(
//           Boolean
//         );
//         setPoNumbers(uniquePOs);
//       } else {
//         throw new Error("Invalid API response format");
//       }
//     } catch (err) {
//       setError(`Failed to load data: ${err.message}`);
//       setRequests([]);
//       setPoNumbers([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const setPoDetailsFromRequests = () => {
//     if (!selectedPONumber) return;
//     const details = requests.filter((r) => r.poNumber === selectedPONumber);
//     if (details.length > 0) {
//       setPoDetails(details);
//       setIsModalOpen(false);
//       setDetailsModalOpen(true);
//     } else {
//       setError("No items found for this PO");
//     }
//   };

//   const handleSubmitFollowUp = async () => {
//     if (!status || !remark) {
//       setError("Status and Remark are required");
//       return;
//     }

//     try {
//       setLoading(true);
//       setError(null);

//       const updateData = poDetails
//         .filter((item) => item.UID)
//         .map((item) => ({
//           UID: item.UID,
//           status12: status,
//           remark12: remark,
//         }));

//       if (updateData.length === 0) throw new Error("No valid items to update");

//       const response = await fetch(
//         `${import.meta.env.VITE_BACKEND_URL}/api/update-followup-Billing`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(updateData),
//         }
//       );

//       const result = await response.json();

//       if (!response.ok) {
//         throw new Error(result.error || "Update failed");
//       }

//       alert(
//         `Successfully updated ${
//           result.updatedRows || updateData.length
//         } item(s)`
//       );
//       resetModals();
//       fetchRequests();
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetModals = () => {
//     setDetailsModalOpen(false);
//     setIsModalOpen(false);
//     setSelectedPONumber("");
//     setPoDetails(null);
//     setStatus("");
//     setRemark("");
//   };

//   useEffect(() => {
//     fetchRequests();
//   }, []);

//   return (
//     <div className="p-4 bg-gray-50 min-h-screen">
//       {/* <h2 className="text-xl font-bold text-gray-800 mb-4">Vendor Follow-Up Billing Data</h2> */}

//       <button
//         onClick={() => setIsModalOpen(true)}
//         className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
//       >
//         Bill Follow Up
//       </button>

//       {/* PO Selection Modal - FIXED AT TOP */}
//       {isModalOpen && (
//         <div
//           className="fixed inset-0 z-50 bg-black bg-opacity-50 overflow-y-auto"
//           onClick={() => setIsModalOpen(false)}
//         >
//           <div className="min-h-screen flex items-start justify-center pt-10 pb-10 px-4">
//             <div
//               className="bg-white rounded-lg shadow-xl w-80"
//               onClick={(e) => e.stopPropagation()}
//             >
//               <div className="px-4 py-3 border-b border-gray-200">
//                 <h3 className="text-base font-semibold text-gray-800">
//                   Select PO Number
//                 </h3>
//               </div>

//               <div className="p-4">
//                 <select
//                   value={selectedPONumber}
//                   onChange={(e) => setSelectedPONumber(e.target.value)}
//                   className="w-full px-2 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
//                 >
//                   <option value="">-- Select PO Number --</option>
//                   {poNumbers.map((po) => (
//                     <option key={po} value={po}>
//                       {po}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-end gap-2 rounded-b-lg">
//                 <button
//                   onClick={() => setIsModalOpen(false)}
//                   className="px-3 py-1.5 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={setPoDetailsFromRequests}
//                   disabled={!selectedPONumber}
//                   className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
//                 >
//                   Fetch Details
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Follow-up Details Modal - FIXED AT TOP */}
//       {detailsModalOpen && poDetails && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto"
//           onClick={resetModals}
//         >
//           <div className="min-h-screen flex items-start justify-center pt-10 pb-10 px-4">
//             <div
//               className="bg-white rounded-lg shadow-2xl w-full max-w-2xl"
//               onClick={(e) => e.stopPropagation()}
//             >
//               <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
//                 <h2 className="text-lg font-semibold text-gray-800">
//                   Update Follow-Up (PO: {selectedPONumber})
//                 </h2>
//                 <button
//                   onClick={resetModals}
//                   className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
//                 >
//                   ×
//                 </button>
//               </div>

//               <div className="px-6 py-4">
//                 <p className="text-sm text-gray-600 mb-3">
//                   Updating <strong>{poDetails.length}</strong> item(s):
//                 </p>

//                 <div className="bg-gray-50 p-3 rounded border mb-4 max-h-32 overflow-y-auto">
//                   <ul className="text-sm space-y-1">
//                     {/* Header - justify-between रखते हुए */}
//                     <div className="flex justify-between font-bold mb-1 px-1">
//                       <div className="w-1/3 text-center">Material Name</div>
//                       <div className="w-1/3 text-center">Vendor Firm</div>
//                       <div className="w-1/3 text-center">UID</div>
//                     </div>

//                     {/* Data rows - same width & center alignment */}
//                     {poDetails.map((item, i) => (
//                       <li
//                         key={i}
//                         className="flex justify-between text-gray-700"
//                       >
//                         <div className="w-1/3 text-center">
//                           {item.materialName}
//                         </div>
//                         <div className="w-1/3 text-center">
//                           {item.vendorFirmName}
//                         </div>
//                         <div className="w-1/3 text-center text-gray-500 text-xs">
//                           UID: {item.UID}
//                         </div>
//                       </li>
//                     ))}
//                   </ul>
//                 </div>

//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Status 12 <span className="text-red-500">*</span>
//                     </label>
//                     <select
//                       value={status}
//                       onChange={(e) => setStatus(e.target.value)}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
//                     >
//                       <option value="">-- Select Status --</option>
//                       <option value="Received">Received</option>
//                       <option value="Hold">Hold</option>
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Remark 12 <span className="text-red-500">*</span>
//                     </label>
//                     <textarea
//                       value={remark}
//                       onChange={(e) => setRemark(e.target.value)}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
//                       rows="3"
//                       placeholder="Enter your remark..."
//                     />
//                   </div>

//                   {error && (
//                     <div className="p-3 bg-red-50 border border-red-200 rounded-md">
//                       <p className="text-red-600 text-sm">{error}</p>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 rounded-b-lg">
//                 <button
//                   onClick={resetModals}
//                   className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleSubmitFollowUp}
//                   disabled={loading || !status || !remark}
//                   className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
//                 >
//                   {loading ? "Updating..." : "Update All"}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Main Table */}
//       <div className="bg-white rounded-lg shadow overflow-hidden mt-6">
//         {loading && !requests.length ? (
//           <div className="p-8 text-center text-gray-500">Loading data...</div>
//         ) : error && !requests.length ? (
//           <div className="p-8 text-center text-red-500">{error}</div>
//         ) : requests.length === 0 ? (
//           <div className="p-8 text-center text-gray-500">
//             No pending follow-ups.
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y ">
//               <thead className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
//                 <tr>
//                   {[
//                     "Planned 12",
//                     "UID",
//                     "Site Name",
//                     "Supervisor",
//                     "Material Name",
//                     "Revised Qty",
//                     "Received Qty",
//                     "Unit",
//                     "Vendor Firm",
//                     "PO Number",
//                     "Status 12",
//                     "Follow-Up Count 12",
//                     "Remark 12",
//                     "Vendor Contact",
//                   ].map((header) => (
//                     <th
//                       key={header}
//                       className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
//                     >
//                       {header}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {requests.map((r, i) => (
//                   <tr
//                     key={`${r.UID}-${i}`}
//                     className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
//                   >
//                     <td className="px-4 py-2 text-sm">{r.planned12}</td>
//                     <td className="px-4 py-2 text-sm font-mono">{r.UID}</td>
//                     <td className="px-4 py-2 text-sm">{r.siteName}</td>
//                     <td className="px-4 py-2 text-sm">{r.supervisorName}</td>
//                     <td className="px-4 py-2 text-sm">{r.materialName}</td>
//                     <td className="px-4 py-2 text-sm text-right">
//                       {r.revisedQuantity}
//                     </td>
//                     <td className="px-4 py-2 text-sm text-right">
//                       {r.finalReceivedQuantity}
//                     </td>
//                     <td className="px-4 py-2 text-sm">{r.unitName}</td>
//                     <td className="px-4 py-2 text-sm">{r.vendorFirmName}</td>
//                     <td className="px-4 py-2 text-sm font-semibold">
//                       {r.poNumber}
//                     </td>
//                     <td
//                       className={`px-4 py-2 text-sm font-medium ${
//                         r.status12 === "Hold"
//                           ? "text-red-600"
//                           : r.status12 === "Received"
//                           ? "text-green-600"
//                           : "text-gray-700"
//                       }`}
//                     >
//                       {r.status12 || "-"}
//                     </td>
//                     <td className="px-4 py-2 text-sm text-center">
//                       {r.followUpCount12}
//                     </td>
//                     <td className="px-4 py-2 text-sm italic">
//                       {r.remark12 || "-"}
//                     </td>
//                     <td className="px-4 py-2 text-sm">{r.vendorContact}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Vendor_followup_billing;








import React, { useState, useEffect } from "react";
import {
  Loader2, AlertCircle, CheckCircle, X, ChevronDown,
  RotateCcw, Package, FileText, Edit3, ExternalLink,
  MessageCircle, Phone, ArrowRight
} from "lucide-react";

const T = {
  navy: '#1e293b', navyLight: '#334155', navyDark: '#0f172a',
  gold: '#f59e0b', goldLight: '#fbbf24', goldDark: '#d97706',
  bg: '#f8fafc', card: '#ffffff', text: '#1e293b',
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
const focusGold = (e) => { e.target.style.borderColor = T.gold; e.target.style.boxShadow = `0 0 0 3px ${T.gold}15`; e.target.style.background = T.card; };
const blurNormal = (e) => { e.target.style.borderColor = T.border; e.target.style.boxShadow = 'none'; e.target.style.background = T.borderLight; };

const Td = ({ children, right, maxW, center, bold }) => (
  <td style={{
    padding: '10px 14px', fontSize: 13, color: T.text,
    borderBottom: `1px solid ${T.border}`, whiteSpace: 'nowrap',
    textAlign: right ? 'right' : center ? 'center' : 'left',
    fontWeight: bold ? 600 : 400,
  }}>
    {maxW ? (<span title={typeof children === 'string' ? children : ''} style={{ display: 'block', maxWidth: maxW, overflow: 'hidden', textOverflow: 'ellipsis' }}>{children || <span style={{ color: T.textMuted }}>—</span>}</span>) : (children || <span style={{ color: T.textMuted }}>—</span>)}
  </td>
);

const Vendor_followup_billing = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedPONumber, setSelectedPONumber] = useState('');
  const [poDetails, setPoDetails] = useState(null);
  const [poNumbers, setPoNumbers] = useState([]);
  const [status, setStatus] = useState('');
  const [remark, setRemark] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true); setError(null);
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/vendor-FollowUp-Billing`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setRequests(data.data);
        setPoNumbers([...new Set(data.data.map(r => r.poNumber).filter(Boolean))]);
      }
    } catch (err) {
      setError(err.message); setRequests([]); setPoNumbers([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleFetchDetails = () => {
    if (!selectedPONumber) return;
    const details = requests.filter(r => r.poNumber === selectedPONumber);
    if (details.length > 0) {
      setPoDetails(details);
      setIsModalOpen(false);
      setDetailsModalOpen(true);
    }
  };

  const handleSubmit = async () => {
    if (!status || !remark) { setError('Status and Remark required'); return; }

    setIsSaving(true); setError(null);
    try {
      const updateData = poDetails.filter(i => i.UID).map(i => ({
        UID: i.UID,
        status10: status,
        remark10: remark,
      }));

      if (!updateData.length) throw new Error('No valid items');

      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/update-followup-Billing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed');

      setSaveSuccess(true);
      setTimeout(() => {
        resetModals();
        fetchRequests();
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally { setIsSaving(false); }
  };

  const resetModals = () => {
    setDetailsModalOpen(false); setIsModalOpen(false);
    setSelectedPONumber(''); setPoDetails(null);
    setStatus(''); setRemark('');
    setSaveSuccess(false); setError(null);
  };

  const tableCols = [
    { label: '#', w: 50 }, { label: 'Planned', w: 100 },
    { label: 'UID', w: 60 }, { label: 'Project', w: 130 },
    { label: 'Material', w: 160 }, { label: 'Size', w: 80 },
    { label: 'Rev Qty', w: 80 }, { label: 'Received', w: 80 },
    { label: 'Unit', w: 60 }, { label: 'Vendor', w: 140 },
    { label: 'Contact', w: 110 }, { label: 'PO No', w: 90 },
    { label: 'MRN No', w: 90 }, { label: 'Status', w: 100 },
    { label: 'Follow-ups', w: 90 }, { label: 'Remark', w: 130 },
  ];

  return (
    <div style={{ width: '100%' }}>
      {/* Header */}
      <div style={{
        background: T.card, borderRadius: 10, border: `1px solid ${T.border}`,
        padding: '16px 20px', marginBottom: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <MessageCircle size={18} color={T.gold} />
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: T.navy, margin: 0 }}>Vendor Follow-Up Billing</h2>
            <p style={{ fontSize: 12, color: T.textMuted, margin: 0 }}>{requests.length} pending</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={fetchRequests} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 8,
            border: `1.5px solid ${T.border}`, background: T.card,
            color: T.textLight, fontSize: 13, cursor: 'pointer',
          }}><RotateCcw size={14} /> Refresh</button>
          <button onClick={() => setIsModalOpen(true)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 18px', borderRadius: 8, border: 'none',
            background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
            color: T.navyDark, fontSize: 13, fontWeight: 700, cursor: 'pointer',
            boxShadow: `0 2px 8px ${T.gold}40`,
          }}>
            <Edit3 size={15} /> Bill Follow Up
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{
        background: T.card, borderRadius: 10, border: `1px solid ${T.border}`,
        overflow: 'hidden',
      }}>
        {loading && !requests.length ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <Loader2 size={28} color={T.gold} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ color: T.textMuted }}>Loading...</p>
          </div>
        ) : requests.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <Package size={40} color={T.border} style={{ marginBottom: 12 }} />
            <p style={{ color: T.textLight }}>No pending follow-ups</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', maxHeight: '65vh', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                <tr style={{ background: T.navy }}>
                  {tableCols.map((col, i) => (
                    <th key={i} style={{
                      padding: '12px 14px', textAlign: 'left',
                      color: T.goldLight, fontSize: 11, fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: 0.5,
                      whiteSpace: 'nowrap', minWidth: col.w,
                      borderBottom: `2px solid ${T.gold}`,
                    }}>{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {requests.map((r, idx) => (
                  <tr key={r.UID + idx}
                    style={{ background: idx % 2 === 0 ? T.card : T.borderLight }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = `${T.gold}08`; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = idx % 2 === 0 ? T.card : T.borderLight; }}
                  >
                    <Td><span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: 6, background: T.borderLight, fontSize: 12, fontWeight: 600, color: T.textLight }}>{idx + 1}</span></Td>
                    <Td>{r.planned10}</Td>
                    <Td><span style={{ background: `${T.navy}15`, color: T.navy, padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>{r.UID}</span></Td>
                    <Td maxW={130}>{r.projectName}</Td>
                    <Td maxW={150} bold>{r.materialName}</Td>
                    <Td>{r.materialSize && <span style={{ background: `${T.gold}15`, color: T.goldDark, padding: '2px 7px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>{r.materialSize}</span>}</Td>
                    <Td right>{r.revisedQuantity}</Td>
                    <Td right>
                      <span style={{
                        background: r.finalReceivedQty ? `${T.success}15` : T.borderLight,
                        color: r.finalReceivedQty ? T.success : T.textMuted,
                        padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700,
                      }}>{r.finalReceivedQty || '—'}</span>
                    </Td>
                    <Td>{r.unitName}</Td>
                    <Td maxW={130} bold>{r.vendorFirmName}</Td>
                    <Td>
                      {r.vendorContact && (
                        <a href={`tel:${r.vendorContact}`} style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          color: T.navy, fontSize: 12, fontWeight: 600, textDecoration: 'none',
                        }}><Phone size={11} /> {r.vendorContact}</a>
                      )}
                    </Td>
                    <Td>
                      {r.poNumber && <span style={{ background: T.navy, color: T.gold, padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>{r.poNumber}</span>}
                    </Td>
                    <Td>
                      {r.mrnNo && <span style={{ background: `${T.purple}15`, color: T.purple, padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{r.mrnNo}</span>}
                    </Td>
                    <Td>
                      {r.status10 ? (
                        <span style={{
                          background: r.status10 === 'Received' ? `${T.success}15`
                            : r.status10 === 'Hold' ? `${T.danger}15` : T.borderLight,
                          color: r.status10 === 'Received' ? T.success
                            : r.status10 === 'Hold' ? T.danger : T.text,
                          padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                        }}>{r.status10}</span>
                      ) : <span style={{ color: T.textMuted }}>Pending</span>}
                    </Td>
                    <Td center>
                      <span style={{
                        background: parseInt(r.followUpCount10 || 0) > 3 ? `${T.danger}15` : `${T.gold}15`,
                        color: parseInt(r.followUpCount10 || 0) > 3 ? T.danger : T.goldDark,
                        padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700,
                      }}>{r.followUpCount10 || '0'}</span>
                    </Td>
                    <Td maxW={120}>{r.remark10}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ═══ PO Selection Modal ═══ */}
      {isModalOpen && (
        <>
          <div onClick={() => setIsModalOpen(false)} style={{
            position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)',
            backdropFilter: 'blur(2px)', zIndex: 100,
          }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '95%', maxWidth: 400,
            background: T.card, borderRadius: 14,
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            zIndex: 101, overflow: 'hidden',
          }}>
            <div style={{
              background: T.navy, padding: '14px 20px',
              borderBottom: `2px solid ${T.gold}`,
            }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'white', margin: 0 }}>Select PO Number</h3>
            </div>
            <div style={{ padding: '20px' }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>
                PO Number <span style={{ color: T.danger }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <select value={selectedPONumber}
                  onChange={(e) => setSelectedPONumber(e.target.value)}
                  style={{ ...inputBase, paddingRight: 32, appearance: 'none', cursor: 'pointer' }}
                  onFocus={focusGold} onBlur={blurNormal}>
                  <option value="">-- Select PO --</option>
                  {poNumbers.map(po => (<option key={po} value={po}>{po}</option>))}
                </select>
                <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: T.textMuted, pointerEvents: 'none' }} />
              </div>
            </div>
            <div style={{ padding: '14px 20px', borderTop: `1px solid ${T.border}`, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => setIsModalOpen(false)} style={{
                padding: '8px 16px', borderRadius: 8,
                border: `1.5px solid ${T.border}`, background: T.card,
                color: T.textLight, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>Cancel</button>
              <button onClick={handleFetchDetails} disabled={!selectedPONumber} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '8px 20px', borderRadius: 8, border: 'none',
                background: selectedPONumber ? `linear-gradient(135deg, ${T.gold}, ${T.goldDark})` : T.border,
                color: selectedPONumber ? T.navyDark : T.textMuted,
                fontSize: 13, fontWeight: 700, cursor: selectedPONumber ? 'pointer' : 'not-allowed',
              }}>Fetch <ArrowRight size={14} /></button>
            </div>
          </div>
        </>
      )}

      {/* ═══ Update Modal ═══ */}
      {detailsModalOpen && poDetails && (
        <>
          <div onClick={resetModals} style={{
            position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)',
            backdropFilter: 'blur(2px)', zIndex: 100,
          }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '95%', maxWidth: 650,
            background: T.card, borderRadius: 14,
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            zIndex: 101, display: 'flex', flexDirection: 'column',
            maxHeight: '85vh',
          }}>
            <div style={{
              background: T.navy, padding: '14px 20px',
              borderBottom: `2px solid ${T.gold}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderRadius: '14px 14px 0 0',
            }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'white', margin: 0 }}>
                  Update Follow-Up — PO: <span style={{ color: T.gold }}>{selectedPONumber}</span>
                </h3>
                <p style={{ fontSize: 11, color: T.textMuted, margin: 0 }}>{poDetails.length} items</p>
              </div>
              <button onClick={resetModals} style={{
                width: 30, height: 30, borderRadius: 6, border: 'none',
                background: 'rgba(255,255,255,0.1)', color: 'white',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><X size={16} /></button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
              {/* Success */}
              {saveSuccess && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 14px', background: T.successBg,
                  border: `1px solid ${T.successBorder}`, borderRadius: 8,
                  marginBottom: 14, fontSize: 13, color: '#065f46',
                }}>
                  <CheckCircle size={16} color={T.success} /> Updated successfully!
                </div>
              )}
              {error && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 14px', background: T.dangerBg,
                  border: `1px solid ${T.dangerBorder}`, borderRadius: 8,
                  marginBottom: 14, fontSize: 13, color: T.danger,
                }}>
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              {/* Items Summary */}
              <div style={{
                background: T.borderLight, borderRadius: 8,
                border: `1px solid ${T.border}`, padding: '10px 14px',
                marginBottom: 16, maxHeight: 180, overflowY: 'auto',
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.navy, marginBottom: 8 }}>
                  Materials ({poDetails.length})
                </div>
                {poDetails.map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', padding: '6px 0',
                    borderBottom: i < poDetails.length - 1 ? `1px dashed ${T.border}` : 'none',
                    fontSize: 12,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ background: `${T.navy}15`, color: T.navy, padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700 }}>{item.UID}</span>
                      <span style={{ fontWeight: 600, color: T.navy }}>{item.materialName}</span>
                      {item.materialSize && <span style={{ fontSize: 10, color: T.goldDark }}>({item.materialSize})</span>}
                    </div>
                    <span style={{ color: T.textMuted, fontSize: 11 }}>{item.vendorFirmName}</span>
                  </div>
                ))}
              </div>

              {/* Form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>
                    Status <span style={{ color: T.danger }}>*</span>
                    <span style={{ marginLeft: 8, fontSize: 10, color: T.textMuted, background: T.borderLight, padding: '2px 6px', borderRadius: 4 }}>→ Column AY</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select value={status} onChange={(e) => setStatus(e.target.value)}
                      disabled={isSaving}
                      style={{ ...inputBase, paddingRight: 32, appearance: 'none', cursor: 'pointer' }}
                      onFocus={focusGold} onBlur={blurNormal}>
                      <option value="">-- Select --</option>
                      <option value="Received">✅ Received</option>
                      <option value="Hold">⏸️ Hold</option>
                    </select>
                    <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: T.textMuted, pointerEvents: 'none' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>
                    Remark <span style={{ color: T.danger }}>*</span>
                    <span style={{ marginLeft: 8, fontSize: 10, color: T.textMuted, background: T.borderLight, padding: '2px 6px', borderRadius: 4 }}>→ Column BB</span>
                  </label>
                  <textarea value={remark} onChange={(e) => setRemark(e.target.value)}
                    disabled={isSaving}
                    placeholder="Enter remark..."
                    rows={3}
                    style={{ ...inputBase, resize: 'vertical', minHeight: 70 }}
                    onFocus={focusGold} onBlur={blurNormal}
                  />
                </div>
              </div>
            </div>

            <div style={{
              padding: '14px 20px', borderTop: `1px solid ${T.border}`,
              background: T.borderLight,
              display: 'flex', justifyContent: 'flex-end', gap: 10,
              borderRadius: '0 0 14px 14px',
            }}>
              <button onClick={resetModals} disabled={isSaving} style={{
                padding: '10px 20px', borderRadius: 8,
                border: `1.5px solid ${T.border}`, background: T.card,
                color: T.textLight, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>Cancel</button>
              <button onClick={handleSubmit}
                disabled={isSaving || !status || !remark || saveSuccess}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '10px 24px', borderRadius: 8, border: 'none',
                  background: saveSuccess ? T.success
                    : (status && remark && !isSaving)
                      ? `linear-gradient(135deg, ${T.gold}, ${T.goldDark})` : T.border,
                  color: saveSuccess ? 'white'
                    : (status && remark && !isSaving) ? T.navyDark : T.textMuted,
                  fontSize: 13, fontWeight: 700,
                  cursor: (status && remark && !isSaving) ? 'pointer' : 'not-allowed',
                }}>
                {isSaving ? (
                  <><Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> Updating...</>
                ) : saveSuccess ? (
                  <><CheckCircle size={15} /> Done!</>
                ) : (
                  <><CheckCircle size={15} /> Update All</>
                )}
              </button>
            </div>
          </div>
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Vendor_followup_billing;