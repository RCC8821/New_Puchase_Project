import React, { useState, useEffect } from 'react';
import {
  Search, RefreshCw, Package, AlertTriangle, Loader2,
  Play, X, CheckCircle
} from 'lucide-react';

const T = {
  navy: '#1e293b', navyLight: '#334155', navyDark: '#0f172a',
  gold: '#f59e0b', goldLight: '#fbbf24', goldDark: '#d97706',
  bg: '#f8fafc', card: '#ffffff',
  text: '#1e293b', textLight: '#64748b', textMuted: '#94a3b8',
  border: '#e2e8f0', borderLight: '#f1f5f9',
  success: '#10b981', danger: '#ef4444', info: '#3b82f6',
};

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

const No_Indent = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  // ── Modal State ──
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    status5: '',
    deliveryByVendor: '',
    vendorFirmName5: '',
    siteEngineerInform: '',
    actionRemark: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/get-no-indent`);
      const json = await res.json();
      if (json.success) {
        setData(json.data || []);
      } else {
        setError(json.message || 'Failed to fetch data');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ── Open Modal ──
  const openActionModal = (item) => {
    setSelectedItem(item);
    setFormData({
      status5: item.status5 || '',
      deliveryByVendor: item.deliveryByVendor || '',
      vendorFirmName5: item.vendorFirmName5 || '',
      siteEngineerInform: item.siteEngineerInform || '',
      actionRemark: item.actionRemark || '',
    });
    setFormErrors({});
    setSaveSuccess(false);
    setShowModal(true);
  };

  // ── Close Modal ──
  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setSaveSuccess(false);
  };

  // ── Validate Form ──
  const validateForm = () => {
    const errors = {};
    if (!formData.status5) errors.status5 = 'Status is required';
    if (!formData.deliveryByVendor) errors.deliveryByVendor = 'Delivery option is required';

    if (formData.deliveryByVendor === 'Yes' && !formData.vendorFirmName5.trim()) {
      errors.vendorFirmName5 = 'Vendor Firm Name is required';
    }
    if (formData.deliveryByVendor === 'No' && !formData.siteEngineerInform.trim()) {
      errors.siteEngineerInform = 'Site Engineer Inform is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Submit ──
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/save-no-indent-action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: selectedItem.uid,
          status5: formData.status5,
          deliveryByVendor: formData.deliveryByVendor,
          vendorFirmName5: formData.vendorFirmName5,
          siteEngineerInform: formData.siteEngineerInform,
          actionRemark: formData.actionRemark,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSaveSuccess(true);
        setTimeout(() => {
          closeModal();
          fetchData();
        }, 1500);
      } else {
        setFormErrors({ submit: json.message || 'Save failed' });
      }
    } catch (err) {
      setFormErrors({ submit: 'Network error' });
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // ── Filtered Data ──
  const filtered = data.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (item.reqNo || '').toLowerCase().includes(q) ||
      (item.projectName || '').toLowerCase().includes(q) ||
      (item.materialName || '').toLowerCase().includes(q) ||
      (item.materialType || '').toLowerCase().includes(q) ||
      (item.contractorFirm || '').toLowerCase().includes(q) ||
      (item.projectEngineer || '').toLowerCase().includes(q) ||
      (item.skuCode || '').toLowerCase().includes(q)
    );
  });

  const columns = [
    { key: 'planned5', label: 'Planned 5', width: 100 },
    { key: 'reqNo', label: 'Req No', width: 80 },
    { key: 'projectName', label: 'Project Name', width: 140 },
    { key: 'projectEngineer', label: 'Engineer', width: 120 },
    { key: 'materialType', label: 'Material Type', width: 120 },
    { key: 'materialName', label: 'Material Name', width: 150 },
    { key: 'materialSize', label: 'Size', width: 90 },
    { key: 'materialSpecification', label: 'Specification', width: 130 },
    { key: 'materialBrand', label: 'Brand', width: 100 },
    { key: 'skuCode', label: 'SKU Code', width: 90 },
    { key: 'quantity', label: 'Qty', width: 60 },
    { key: 'unitName', label: 'Unit', width: 60 },
    { key: 'descriptionOfWork', label: 'Description', width: 160 },
    { key: 'requireDays', label: 'Req Days', width: 70 },
    { key: 'contractorFirm', label: 'Contractor/Firm', width: 140 },
    { key: 'remark', label: 'Remark', width: 140 },
  ];

  // ── Input Style Helper ──
  const inputStyle = (hasError) => ({
    width: '100%', padding: '10px 12px', borderRadius: 8,
    border: `1.5px solid ${hasError ? T.danger : T.border}`,
    fontSize: 13, color: T.text, outline: 'none',
    background: T.bg, transition: 'border 0.2s',
    boxSizing: 'border-box',
  });

  const labelStyle = {
    fontSize: 12, fontWeight: 600, color: T.navy,
    marginBottom: 4, display: 'block',
  };

  return (
    <div style={{ width: '100%' }}>
      {/* ── Header Bar ── */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', alignItems: 'center',
        justifyContent: 'space-between', gap: 12, marginBottom: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Package size={18} color={T.navy} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: T.navy }}>
              No Indent Data
            </h2>
            <p style={{ margin: 0, fontSize: 11, color: T.textMuted }}>
              {filtered.length} of {data.length} records
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: T.card, border: `1px solid ${T.border}`,
            borderRadius: 8, padding: '6px 10px', minWidth: 200,
          }}>
            <Search size={14} color={T.textMuted} />
            <input
              type="text" placeholder="Search..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              style={{
                border: 'none', outline: 'none', background: 'transparent',
                fontSize: 12, color: T.text, width: '100%',
              }}
            />
          </div>
          <button onClick={fetchData} disabled={loading} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '7px 12px', borderRadius: 8,
            border: `1px solid ${T.border}`, background: T.card,
            color: T.textLight, fontSize: 12, fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}>
            <RefreshCw size={13} className={loading ? 'spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', height: 250, background: T.card,
          borderRadius: 10, border: `1px solid ${T.border}`,
        }}>
          <Loader2 size={32} color={T.gold} className="spin" />
          <p style={{ marginTop: 12, fontSize: 13, color: T.textMuted }}>Loading...</p>
        </div>
      )}

      {/* ── Error ── */}
      {error && !loading && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: 16, background: '#fef2f2', borderRadius: 10,
          border: '1px solid #fecaca',
        }}>
          <AlertTriangle size={20} color={T.danger} />
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: T.danger }}>{error}</p>
            <button onClick={fetchData} style={{
              marginTop: 6, padding: '4px 10px', borderRadius: 6,
              border: `1px solid ${T.danger}`, background: 'transparent',
              color: T.danger, fontSize: 11, cursor: 'pointer',
            }}>Retry</button>
          </div>
        </div>
      )}

      {/* ── Table ── */}
      {!loading && !error && (
        <div style={{
          background: T.card, borderRadius: 10,
          border: `1px solid ${T.border}`, overflow: 'hidden',
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%', borderCollapse: 'collapse',
              fontSize: 12, minWidth: 1500,
            }}>
              <thead>
                <tr style={{ background: T.navy }}>
                  <th style={{
                    padding: '10px 8px', color: T.goldLight,
                    fontWeight: 600, textAlign: 'left',
                    borderBottom: `2px solid ${T.gold}`,
                    position: 'sticky', left: 0, background: T.navy, zIndex: 2, width: 40,
                  }}>#</th>
                  {columns.map((col) => (
                    <th key={col.key} style={{
                      padding: '10px 8px', color: T.goldLight,
                      fontWeight: 600, textAlign: 'left',
                      borderBottom: `2px solid ${T.gold}`,
                      whiteSpace: 'nowrap', minWidth: col.width,
                    }}>{col.label}</th>
                  ))}
                  <th style={{
                    padding: '10px 8px', color: T.goldLight,
                    fontWeight: 600, textAlign: 'center',
                    borderBottom: `2px solid ${T.gold}`,
                    position: 'sticky', right: 0, background: T.navy, zIndex: 2, width: 80,
                  }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 2} style={{
                      padding: 40, textAlign: 'center', color: T.textMuted,
                    }}>
                      <Package size={32} style={{ marginBottom: 8, color: T.border }} />
                      <p style={{ margin: 0, fontSize: 13 }}>
                        {search ? 'No matching records' : 'No data available'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((item, idx) => (
                    <tr key={idx} style={{
                      background: idx % 2 === 0 ? T.card : T.borderLight,
                    }}
                      onMouseEnter={(e) => e.currentTarget.style.background = `${T.gold}08`}
                      onMouseLeave={(e) => e.currentTarget.style.background = idx % 2 === 0 ? T.card : T.borderLight}
                    >
                      <td style={{
                        padding: '8px', color: T.textMuted, fontWeight: 600,
                        borderBottom: `1px solid ${T.border}`,
                        position: 'sticky', left: 0,
                        background: idx % 2 === 0 ? T.card : T.borderLight, zIndex: 1,
                      }}>{idx + 1}</td>
                      {columns.map((col) => (
                        <td key={col.key} style={{
                          padding: '8px', color: T.text,
                          borderBottom: `1px solid ${T.border}`,
                          whiteSpace: 'nowrap', maxWidth: 200,
                          overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>
                          {col.key === 'planned5' ? (
                            <span style={{
                              display: 'inline-block', padding: '2px 8px',
                              borderRadius: 6, fontSize: 11, fontWeight: 600,
                              background: `${T.success}15`, color: T.success,
                              border: `1px solid ${T.success}30`,
                            }}>{item[col.key]}</span>
                          ) : (
                            item[col.key] || '—'
                          )}
                        </td>
                      ))}
                      {/* ── ACTION BUTTON ── */}
                      <td style={{
                        padding: '8px', textAlign: 'center',
                        borderBottom: `1px solid ${T.border}`,
                        position: 'sticky', right: 0,
                        background: idx % 2 === 0 ? T.card : T.borderLight, zIndex: 1,
                      }}>
                        <button
                          onClick={() => openActionModal(item)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            padding: '5px 10px', borderRadius: 6,
                            border: 'none',
                            background: item.status5
                              ? `linear-gradient(135deg, ${T.success}, #059669)`
                              : `linear-gradient(135deg, ${T.info}, #2563eb)`,
                            color: 'white', fontSize: 11, fontWeight: 600,
                            cursor: 'pointer', whiteSpace: 'nowrap',
                          }}
                        >
                          <Play size={10} />
                          {item.status5 ? 'Done' : 'Action'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══════════════════ ACTION MODAL ═══════════════════ */}
      {showModal && selectedItem && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: T.card, borderRadius: 14,
            width: '90%', maxWidth: 480,
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            overflow: 'hidden',
          }}>
            {/* Modal Header */}
            <div style={{
              background: T.navy, padding: '16px 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderBottom: `2px solid ${T.gold}`,
            }}>
              <div>
                <h3 style={{ margin: 0, color: 'white', fontSize: 15, fontWeight: 700 }}>
                  ⚡ Action — No Indent
                </h3>
                <p style={{ margin: '4px 0 0', color: T.goldLight, fontSize: 11 }}>
                  Req: {selectedItem.reqNo} • {selectedItem.materialName}
                </p>
              </div>
              <button onClick={closeModal} style={{
                background: 'rgba(255,255,255,0.1)', border: 'none',
                borderRadius: 6, padding: 6, cursor: 'pointer', color: 'white',
              }}>
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: 20 }}>
              {saveSuccess ? (
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '30px 0', gap: 10,
                }}>
                  <CheckCircle size={48} color={T.success} />
                  <p style={{ fontSize: 15, fontWeight: 600, color: T.success, margin: 0 }}>
                    Saved Successfully!
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                  {/* 1. STATUS 5 */}
                  <div>
                    <label style={labelStyle}>
                      STATUS 5 <span style={{ color: T.danger }}>*</span>
                    </label>
                    <select
                      value={formData.status5}
                      onChange={(e) => setFormData({ ...formData, status5: e.target.value })}
                      style={inputStyle(formErrors.status5)}
                    >
                      <option value="">-- Select Status --</option>
                      <option value="Yes">Done</option>
                      <option value="No">Reject</option>
                    </select>
                    {formErrors.status5 && (
                      <p style={{ color: T.danger, fontSize: 11, margin: '3px 0 0' }}>
                        {formErrors.status5}
                      </p>
                    )}
                  </div>

                  {/* 2. DELIVERY BY VENDOR */}
                  <div>
                    <label style={labelStyle}>
                      Delivery By Vendor <span style={{ color: T.danger }}>*</span>
                    </label>
                    <select
                      value={formData.deliveryByVendor}
                      onChange={(e) => setFormData({
                        ...formData,
                        deliveryByVendor: e.target.value,
                        vendorFirmName5: '',
                        siteEngineerInform: '',
                      })}
                      style={inputStyle(formErrors.deliveryByVendor)}
                    >
                      <option value="">-- Select --</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                    {formErrors.deliveryByVendor && (
                      <p style={{ color: T.danger, fontSize: 11, margin: '3px 0 0' }}>
                        {formErrors.deliveryByVendor}
                      </p>
                    )}
                  </div>

                  {/* 3a. VENDOR FIRM NAME (only if Delivery = Yes) */}
                  {formData.deliveryByVendor === 'Yes' && (
                    <div style={{
                      padding: 12, borderRadius: 8,
                      background: `${T.info}08`, border: `1px solid ${T.info}20`,
                    }}>
                      <label style={labelStyle}>
                        Vendor Firm Name 5 <span style={{ color: T.danger }}>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter Vendor Firm Name..."
                        value={formData.vendorFirmName5}
                        onChange={(e) => setFormData({ ...formData, vendorFirmName5: e.target.value })}
                        style={inputStyle(formErrors.vendorFirmName5)}
                      />
                      {formErrors.vendorFirmName5 && (
                        <p style={{ color: T.danger, fontSize: 11, margin: '3px 0 0' }}>
                          {formErrors.vendorFirmName5}
                        </p>
                      )}
                    </div>
                  )}

                  {/* 3b. SITE ENGINEER INFORM (only if Delivery = No) */}
                  {formData.deliveryByVendor === 'No' && (
                    <div style={{
                      padding: 12, borderRadius: 8,
                      background: `${T.gold}08`, border: `1px solid ${T.gold}20`,
                    }}>
                      <label style={labelStyle}>
                        Site Engineer Inform <span style={{ color: T.danger }}>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter Site Engineer Info..."
                        value={formData.siteEngineerInform}
                        onChange={(e) => setFormData({ ...formData, siteEngineerInform: e.target.value })}
                        style={inputStyle(formErrors.siteEngineerInform)}
                      />
                      {formErrors.siteEngineerInform && (
                        <p style={{ color: T.danger, fontSize: 11, margin: '3px 0 0' }}>
                          {formErrors.siteEngineerInform}
                        </p>
                      )}
                    </div>
                  )}

                  {/* 4. REMARK (Optional) */}
                  <div>
                    <label style={labelStyle}>
                      Remark <span style={{ color: T.textMuted, fontWeight: 400 }}>(Optional)</span>
                    </label>
                    <textarea
                      placeholder="Any remark..."
                      rows={2}
                      value={formData.actionRemark}
                      onChange={(e) => setFormData({ ...formData, actionRemark: e.target.value })}
                      style={{
                        ...inputStyle(false),
                        resize: 'vertical', minHeight: 60, fontFamily: 'inherit',
                      }}
                    />
                  </div>

                  {/* Submit Error */}
                  {formErrors.submit && (
                    <div style={{
                      padding: 10, borderRadius: 8,
                      background: '#fef2f2', border: '1px solid #fecaca',
                      color: T.danger, fontSize: 12, fontWeight: 500,
                    }}>
                      {formErrors.submit}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmit}
                    disabled={saving}
                    style={{
                      width: '100%', padding: '12px 0', borderRadius: 8,
                      border: 'none', fontSize: 14, fontWeight: 700,
                      color: 'white', cursor: saving ? 'not-allowed' : 'pointer',
                      background: saving
                        ? T.textMuted
                        : `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    }}
                  >
                    {saving ? (
                      <>
                        <Loader2 size={16} className="spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} /> Save Action
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
};

export default No_Indent;