

import React, { useEffect, useState, useMemo } from "react";
import {
  Plus, Trash2, Send, RotateCcw, Loader2, AlertCircle,
  CheckCircle, ChevronDown, Search
} from "lucide-react";
import axios from "axios";

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
  },
  goldBar: { width: 3, height: 18, background: T.gold, borderRadius: 3, flexShrink: 0 },
  card: {
    background: T.card, borderRadius: 10,
    border: `1px solid ${T.border}`, padding: '20px 24px',
    marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
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
    <div style={{ width: 180, height: 3, borderRadius: 3, background: T.border, marginTop: 20, overflow: 'hidden' }}>
      <div style={{
        width: '40%', height: '100%', borderRadius: 3,
        background: `linear-gradient(90deg, ${T.gold}, ${T.goldLight})`,
        animation: 'loadingBar 1.5s ease-in-out infinite',
      }} />
    </div>
    <style>{`
      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes loadingBar { 0%{transform:translateX(-100%)}50%{transform:translateX(150%)}100%{transform:translateX(350%)} }
    `}</style>
  </div>
);

const ErrorScreen = ({ error, onRetry }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px' }}>
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
const RequirementReceived = () => {
  const [formData, setFormData] = useState({
    projectName: '', engineerName: '', contractor: '', remark: '',
  });

  const [items, setItems] = useState([{
    materialType: '', materialName: '', materialSize: '',
    specification: '', skuCode: '',
    quantity: '', unit: '', description: '', reqDays: '',
  }]);

  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/project-data`);
      setApiData(res.data);
    } catch (err) {
      setError("Failed to load data. Check your connection.");
    } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const uv = apiData?.uniqueValues || {};
  const maps = apiData?.maps || {};

  const handleProjectChange = (val) => {
    const engineer = maps.projectToEngineer?.[val.toLowerCase()] || '';
    setFormData(prev => ({
      ...prev,
      projectName: val,
      engineerName: engineer,
      contractor: '',
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

  // ✅ ALL FIELDS REQUIRED
  const isFormValid = useMemo(() => {
    if (!formData.projectName.trim()) return false;
    if (!formData.engineerName.trim()) return false;
    if (!formData.contractor.trim()) return false;
    if (!formData.remark.trim()) return false;

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
    if (!isFormValid) return;
    setSubmitting(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/submit-requirement`,
        { ...formData, items }
      );
      setSuccessMsg(`${res.data.message} (${res.data.reqNo} - ${res.data.itemCount} items)`);
      resetForm();
      setTimeout(() => setSuccessMsg(""), 6000);
    } catch (err) {
      alert(err.response?.data?.error || "Submission failed");
    } finally { setSubmitting(false); }
  };

  const resetForm = () => {
    setFormData({ projectName: '', engineerName: '', contractor: '', remark: '' });
    setItems([{
      materialType: '', materialName: '', materialSize: '',
      specification: '', skuCode: '',
      quantity: '', unit: '', description: '', reqDays: '',
    }]);
  };

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} onRetry={fetchData} />;

  // ── Progress count ──
  const totalRequired = 4 + (items.length * 9);
  const filledCount = (() => {
    let count = 0;
    if (formData.projectName.trim()) count++;
    if (formData.engineerName.trim()) count++;
    if (formData.contractor.trim()) count++;
    if (formData.remark.trim()) count++;
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
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>

      {/* Success */}
      {successMsg && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px', background: T.successBg,
          border: `1px solid ${T.successBorder}`, borderRadius: 10,
          marginBottom: 20, fontSize: 13, fontWeight: 500, color: '#065f46',
        }}>
          <CheckCircle size={18} color={T.success} /> {successMsg}
        </div>
      )}

      {/* ═══ SECTION 1: Project Info (only Project + Engineer) ═══ */}
      <div style={S.card}>
        <div style={S.sectionTitle}>
          <div style={S.goldBar} /> Project Information
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 16,
        }}>
          <SearchableSelect
            label="Project Name" required
            value={formData.projectName}
            onChange={handleProjectChange}
            options={uv.projectNames || []}
            placeholder="Search or select project..."
          />

          <div>
            <label style={S.label}>
              Engineer Name <span style={S.req}>*</span>
              {formData.engineerName && (
                <span style={{
                  marginLeft: 8, fontSize: 10, color: T.success,
                  background: T.successBg, padding: '2px 8px',
                  borderRadius: 10, fontWeight: 500,
                }}>Auto-filled</span>
              )}
            </label>
            <input
              type="text"
              value={formData.engineerName}
              readOnly
              style={{
                ...S.inputReadonly,
                borderLeft: formData.engineerName
                  ? `3px solid ${T.success}`
                  : `3px solid ${T.danger}`,
              }}
              placeholder="Select project to auto-fill"
            />
          </div>

          {/* ✅ Contractor REMOVED from here */}
        </div>
      </div>

      {/* ═══ SECTION 2: Material Items ═══ */}
      <div style={S.card}>
        <div style={S.sectionTitle}>
          <div style={S.goldBar} /> Material Items
          <span style={{
            marginLeft: 'auto', fontSize: 12, fontWeight: 500,
            color: T.textMuted, background: T.borderLight,
            padding: '3px 10px', borderRadius: 20,
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
              padding: 18, marginBottom: 14, background: T.bg,
            }}>

              {/* Header */}
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: 14,
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

              {/* Row 1: Type → Name → Size */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 14, marginBottom: 14,
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

              {/* Row 2: Spec + SKU */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 14, marginBottom: 14,
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

              {/* Row 3: Qty, Unit, Days, Desc */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 14,
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

              {/* Add Item Button */}
              {idx === items.length - 1 && (
                <button onClick={addItem} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  marginTop: 14, padding: '8px 16px', borderRadius: 8,
                  border: `1.5px dashed ${T.gold}`, background: `${T.gold}08`,
                  color: T.goldDark, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = `${T.gold}15`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = `${T.gold}08`; }}
                >
                  <Plus size={15} /> Add Another Item
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* ═══ SECTION 3: Contractor + Remark (TOGETHER) ═══ */}
      <div style={S.card}>
        <div style={S.sectionTitle}>
          <div style={S.goldBar} /> Additional Information
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 16,
        }}>
          {/* ✅ Contractor MOVED here */}
          <SearchableSelect
            label="Contractor / Firm Name" required
            value={formData.contractor}
            onChange={(val) => setFormData(prev => ({ ...prev, contractor: val }))}
            options={uv.contractors || []}
            placeholder="Search or select contractor..."
          />

          <div>
            <label style={S.label}>
              Remark <span style={S.req}>*</span>
            </label>
            <input
              type="text"
              value={formData.remark}
              onChange={(e) => setFormData(prev => ({ ...prev, remark: e.target.value }))}
              style={S.input}
              placeholder="Enter remark"
              onFocus={focusStyle} onBlur={blurStyle}
            />
          </div>
        </div>
      </div>

      {/* ═══ SECTION 4: Actions ═══ */}
      <div style={{
        ...S.card,
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
      }}>
        {!isFormValid ? (
          <div style={{ margin: 0 }}>
            <p style={{
              fontSize: 12, color: T.danger,
              display: 'flex', alignItems: 'center', gap: 4, margin: 0,
            }}>
              <AlertCircle size={14} />
              All fields are required ({filledCount}/{totalRequired} filled)
            </p>
            <div style={{
              width: 200, height: 4, borderRadius: 4,
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
          }}>
            <CheckCircle size={14} /> All fields filled — ready to submit ✓
          </p>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={resetForm} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '10px 20px', borderRadius: 8,
            border: `1.5px solid ${T.border}`, background: T.card,
            color: T.textLight, fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = T.navy;
              e.currentTarget.style.color = T.navy;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = T.border;
              e.currentTarget.style.color = T.textLight;
            }}
          >
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
              transition: 'all 0.2s',
              opacity: isFormValid && !submitting ? 1 : 0.6,
            }}
            onMouseEnter={(e) => {
              if (isFormValid && !submitting) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = `0 4px 14px ${T.gold}50`;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              if (isFormValid && !submitting)
                e.currentTarget.style.boxShadow = `0 2px 8px ${T.gold}40`;
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

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default RequirementReceived;