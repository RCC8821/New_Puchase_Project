// frontend/src/components/Paradise/ParadiseSiteEngineer.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, HardHat, Loader2, AlertCircle, Save, RotateCcw, Search, Package, Edit3, X, Calendar } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';

const T = {
  navy: '#1e293b', navyLight: '#334155', navyDark: '#0f172a', gold: '#f59e0b', goldLight: '#fbbf24', goldDark: '#d97706',
  bg: '#f8fafc', card: '#ffffff', text: '#1e293b', textLight: '#64748b', textMuted: '#94a3b8', border: '#e2e8f0', borderLight: '#f1f5f9',
  success: '#10b981', successBg: '#ecfdf5', successBorder: '#a7f3d0', danger: '#ef4444', dangerBg: '#fef2f2', dangerBorder: '#fecaca',
  warning: '#f59e0b', warningBg: '#fffbeb', blueBg: '#eff6ff', blue: '#3b82f6',
};

const cellStyle = { padding: '10px', color: T.text, fontSize: 12, verticalAlign: 'middle', borderRight: `1px solid ${T.borderLight}` };

const ParadiseSiteEngineer = () => {
  const navigate = useNavigate();
  const userType = sessionStorage.getItem('userType');
  const engineerName = sessionStorage.getItem('engineerName') || '';

  const isAdmin = userType === 'admin';
  const displayName = isAdmin ? 'Admin' : engineerName;
  const apiName = isAdmin ? 'admin' : engineerName;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingRow, setUpdatingRow] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [modalData, setModalData] = useState({ status: '', quantity: '', remarks: '' });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/paradise/site-engineer-data/${encodeURIComponent(apiName)}`
      );
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openModal = (row, index) => {
    setSelectedRow(row);
    setSelectedIndex(index);
    setModalData({
      status: row.existingStatus || '',
      quantity: row.existingQuantity || '',
      remarks: row.existingRemarks || '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedRow(null);
    setSelectedIndex(null);
  };

  const handleSave = async () => {
    if (!modalData.status || !modalData.quantity || !modalData.remarks) {
      Swal.fire({ icon: 'warning', title: 'Incomplete Field', text: 'Please fill all required fields.', confirmButtonColor: T.gold });
      return;
    }
    setUpdatingRow(selectedRow.rowNumber);
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/paradise/site-engineer-update`,
        {
          rowNumber: selectedRow.rowNumber,
          status: modalData.status,
          quantity: modalData.quantity,
          remarks: modalData.remarks,
        }
      );
      Swal.fire({ icon: 'success', title: 'Saved successfully!', confirmButtonColor: T.gold });
      const updated = [...data];
      updated[selectedIndex].existingStatus = modalData.status;
      updated[selectedIndex].existingQuantity = modalData.quantity;
      updated[selectedIndex].existingRemarks = modalData.remarks;
      setData(updated);
      closeModal();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.error || 'Failed to update', confirmButtonColor: T.danger });
    } finally {
      setUpdatingRow(null);
    }
  };

  const filteredData = data.filter(item => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.uid.toLowerCase().includes(term) ||
      item.reqNo.toLowerCase().includes(term) ||
      item.projectName.toLowerCase().includes(term) ||
      item.materialName.toLowerCase().includes(term) ||
      item.location.toLowerCase().includes(term) ||
      item.activity.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return (
      <div style={{ padding: 60, textAlign: 'center' }}>
        <Loader2 size={28} color={T.gold} style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: 10, fontSize: 14, color: T.textLight }}>Loading Site Engineer Data...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto', padding: '0 8px' }}>
      <button onClick={() => navigate('/dashboard/paradise')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: `1px solid ${T.border}`, background: T.card, cursor: 'pointer', marginBottom: 16 }}>
        <ArrowLeft size={14} /> Back to Paradise Dashboard
      </button>

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`, borderRadius: 14, padding: '24px', marginBottom: 16, color: 'white', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: 12, background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HardHat size={26} color={T.navyDark} />
            </div>
            <div>
              <span style={{ fontSize: 10, fontWeight: 700, color: T.gold, background: `${T.gold}20`, padding: '3px 10px', borderRadius: 12 }}>PARADISE SITE ENGINEER</span>
              <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{displayName}</h1>
            </div>
          </div>
          <div style={{ padding: '10px 16px', background: 'rgba(255,255,255,0.1)', borderRadius: 10, border: `1px solid ${T.gold}30` }}>
            Count: <span style={{ color: T.gold, fontWeight: 700 }}>{filteredData.length}</span>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 16, position: 'relative' }}>
        <input type="text" placeholder="Search tasks..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '12px', border: `1.5px solid ${T.border}`, borderRadius: 10, boxSizing: 'border-box' }} />
      </div>

      {filteredData.length === 0 ? (
        <div style={{ background: T.card, borderRadius: 12, border: `1px solid ${T.border}`, padding: 40, textAlign: 'center', color: T.textMuted }}>
          <Package size={48} style={{ marginBottom: 12, opacity: 0.4 }} />
          <p>No records found</p>
        </div>
      ) : (
        <div style={{ background: T.card, borderRadius: 12, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead style={{ background: T.navy, color: '#fff' }}>
                <tr>
                  {['Planned Date','UID', 'Req No', 'Project', 'Cluster', 'Location', 'Activity', 'Material Name', 'Size', 'Qty', 'Unit', 'Action'].map((h, i) => (
                    <th key={i} style={{ padding: '12px 10px', textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, idx) => (
                  <tr key={row.rowNumber} style={{ borderBottom: `1px solid ${T.borderLight}`, background: idx % 2 === 0 ? T.card : T.bg }}>
                    <td style={cellStyle}>{row.plannedDate || '-'}</td>
                    <td style={cellStyle}><span style={{ padding: '3px 8px', background: `${T.gold}15`, color: T.goldDark, borderRadius: 6, fontWeight: 700 }}>{row.uid}</span></td>
                    <td style={cellStyle}>{row.reqNo}</td>
                    <td style={cellStyle}>{row.projectName}</td>
                    <td style={cellStyle}>{row.cluster}</td>
                    <td style={cellStyle}>{row.location}</td>
                    <td style={cellStyle}>{row.activity}</td>
                    <td style={{ ...cellStyle, fontWeight: 600 }}>{row.materialName}</td>
                    <td style={cellStyle}>{row.materialSize}</td>
                    <td style={{ ...cellStyle, fontWeight: 600 }}>{row.qty}</td>
                    <td style={cellStyle}>{row.unit}</td>
                    <td style={cellStyle}>
                      <button onClick={() => openModal(row, idx)} style={{ border: 'none', background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`, color: T.navyDark, padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
                        <Edit3 size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalOpen && selectedRow && (
        <div onClick={closeModal} style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: T.card, borderRadius: 14, maxWidth: 500, width: '100%', padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <h3 style={{ margin: '0 0 16px 0', color: T.navy }}>Update Task: {selectedRow.uid}</h3>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Status</label>
              <select value={modalData.status} onChange={(e) => setModalData({ ...modalData, status: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: 8, border: `1.5px solid ${T.border}` }}>
                <option value="">Select Status</option>
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Received">Received</option>
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Quantity</label>
              <input type="number" value={modalData.quantity} onChange={(e) => setModalData({ ...modalData, quantity: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: 8, border: `1.5px solid ${T.border}`, boxSizing: 'border-box' }} />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Remarks</label>
              <textarea value={modalData.remarks} onChange={(e) => setModalData({ ...modalData, remarks: e.target.value })} rows={3} style={{ width: '100%', padding: '10px', borderRadius: 8, border: `1.5px solid ${T.border}`, boxSizing: 'border-box' }} />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={closeModal} style={{ padding: '10px 18px', borderRadius: 8, border: `1.5px solid ${T.border}`, background: T.card, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSave} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`, color: T.navyDark, cursor: 'pointer', fontWeight: 700 }}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParadiseSiteEngineer;