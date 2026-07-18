import React, { useState, useMemo, useEffect } from "react";
import {
  Plus, Trash2, Send, RotateCcw, Loader2, AlertCircle,
  CheckCircle, ChevronDown, Search,
} from "lucide-react";
import {
  useGetSignatureProjectDataQuery,
  useSubmitSignatureRequirementMutation,
} from "../../redux/Signature/SignatureSlice";

// ─── THEME ───────────────────────────────────────────────
const T = {
  navy: '#1e293b', navyLight: '#334155', navyDark: '#0f172a',
  gold: '#f59e0b', goldLight: '#fbbf24', goldDark: '#d97706',
  bg: '#f8fafc', card: '#ffffff', text: '#1e293b',
  textLight: '#64748b', textMuted: '#94a3b8',
  border: '#e2e8f0', borderLight: '#f1f5f9',
  success: '#10b981', successBg: '#ecfdf5', successBorder: '#a7f3d0',
  danger: '#ef4444', dangerBg: '#fef2f2', dangerBorder: '#fecaca',
};

const S = {
  label: {
    display: 'block', fontSize: 12, fontWeight: 600,
    color: T.navyLight, marginBottom: 6, letterSpacing: 0.3,
  },
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
  goldBar: {
    width: 3, height: 18, background: T.gold,
    borderRadius: 3, flexShrink: 0,
  },
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

// ─── SEARCHABLE SELECT (Type + Filter) ───────────────────
const SearchableSelect = ({
  value, onChange, options = [], placeholder,
  required, label, disabled, allowCustom = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const typedValue = search || value || "";
  const filtered = options.filter(opt =>
    opt.toLowerCase().includes(typedValue.toLowerCase())
  );

  const MAX = 100;
  const display = filtered.slice(0, MAX);

  const isExactMatch = options.some(
    opt => opt.toLowerCase() === typedValue.toLowerCase()
  );

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <label style={S.label}>
        {label} {required && <span style={S.req}>*</span>}
        {allowCustom && (
          <span style={{
            marginLeft: 8, fontSize: 9, color: T.goldDark,
            background: `${T.gold}15`, padding: '2px 6px',
            borderRadius: 8, fontWeight: 500,
          }}>
            ✍️ Type or Select
          </span>
        )}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={isOpen ? search : value || ""}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
            if (allowCustom) {
              onChange(e.target.value);
            }
          }}
          onFocus={() => {
            setIsOpen(true);
            setSearch(value || "");
          }}
          onBlur={() => setTimeout(() => {
            setIsOpen(false);
            setSearch("");
          }, 200)}
          disabled={disabled}
          placeholder={placeholder}
          style={{
            ...S.input, paddingRight: 32,
            ...(disabled
              ? { background: '#f1f5f9', cursor: 'not-allowed', opacity: 0.7 }
              : {}),
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
          transform: 'translateY(-50%)',
          color: T.textMuted, pointerEvents: 'none',
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

          {/* ✅ Add New option if custom + typed value */}
          {allowCustom && typedValue && !isExactMatch && (
            <li
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(typedValue);
                setSearch("");
                setIsOpen(false);
              }}
              style={{
                padding: '10px 14px', fontSize: 13,
                color: T.goldDark, fontWeight: 600,
                cursor: 'pointer', background: `${T.gold}12`,
                borderBottom: `1px solid ${T.border}`,
                display: 'flex', alignItems: 'center', gap: 8,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `${T.gold}22`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = `${T.gold}12`;
              }}
            >
              <Plus size={14} />
              Use "<strong>{typedValue}</strong>"
            </li>
          )}

          {/* Existing filtered options */}
          {display.length > 0 ? display.map((opt, idx) => (
            <li key={idx}
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(opt);
                setSearch("");
                setIsOpen(false);
              }}
              style={{
                padding: '9px 14px', fontSize: 13, color: T.text,
                cursor: 'pointer', transition: 'background 0.1s',
                borderBottom: idx < display.length - 1
                  ? `1px solid ${T.borderLight}` : 'none',
                background: value === opt ? `${T.gold}08` : 'transparent',
                fontWeight: value === opt ? 600 : 400,
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `${T.gold}15`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  value === opt ? `${T.gold}08` : 'transparent';
              }}
            >
              <span>{opt}</span>
              {value === opt && (
                <CheckCircle size={12} style={{ color: T.success }} />
              )}
            </li>
          )) : (
            !typedValue && (
              <li style={{
                padding: '12px 14px', color: T.textMuted,
                fontSize: 13, fontStyle: 'italic',
              }}>
                {allowCustom
                  ? 'Type to add new or select existing'
                  : 'No options available'}
              </li>
            )
          )}
        </ul>
      )}
    </div>
  );
};

// ─── LOADING ─────────────────────────────────────────────
const LoadingScreen = () => (
  <div style={{
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: '80px 20px',
  }}>
    <div style={{
      width: 56, height: 56, borderRadius: 14,
      background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: 20, boxShadow: `0 0 0 3px ${T.gold}30`,
    }}>
      <Loader2 size={28} color={T.gold}
        style={{ animation: 'spin 1s linear infinite' }}
      />
    </div>
    <p style={{ fontSize: 15, fontWeight: 600, color: T.navy, marginBottom: 4 }}>
      Loading Data...
    </p>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const ErrorScreen = ({ error, onRetry }) => (
  <div style={{
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: '80px 20px',
  }}>
    <AlertCircle size={40} color={T.danger} style={{ marginBottom: 16 }} />
    <p style={{ fontSize: 15, fontWeight: 600, color: T.navy, marginBottom: 6 }}>
      Failed to Load Data
    </p>
    <p style={{ fontSize: 13, color: T.textMuted, marginBottom: 20 }}>{error}</p>
    <button onClick={onRetry} style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '10px 20px', borderRadius: 8, border: 'none',
      background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
      color: T.navyDark, fontSize: 13, fontWeight: 600, cursor: 'pointer',
    }}>
      <RotateCcw size={15} /> Retry
    </button>
  </div>
);

// ════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ════════════════════════════════════════════════════════
const SignatureRequirement = () => {
  const FIXED_PROJECT = "Signature Heritage PRJ024";

  const {
    data: apiData,
    isLoading, isError,
    error: fetchError,
    refetch,
  } = useGetSignatureProjectDataQuery();

  const [submitRequirement, { isLoading: isSubmitting }] =
    useSubmitSignatureRequirementMutation();

  const [formData, setFormData] = useState({
    projectName: FIXED_PROJECT,
    engineerName: '',
    location: '',
    activity: '',
    remark: '',
  });

  const [items, setItems] = useState([{
    materialType: '', materialName: '', materialSize: '',
    specification: '', skuCode: '',
    quantity: '', unit: '', description: '', reqDays: '',
  }]);

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

    const uv = apiData?.uniqueValues || {};
  const maps = apiData?.maps || {};
  const projectKey = FIXED_PROJECT.toLowerCase();

  // ✅ Engineer - Project-wise (row-wise)
  const projectEngineers = maps?.projectToEngineers?.[projectKey] || [];

  // ✅ Location - ALL unique locations (Column-wise, duplicate removed)
  const projectLocations = uv?.locations || [];

  // ✅ Activity - Filter by Location (cascading)
  const projectActivities = useMemo(() => {
    if (formData.location) {
      // Location selected → filter activities by location
      const activitiesForLocation = new Set();
      apiData?.data?.forEach(row => {
        if (row.location?.toLowerCase() === formData.location.toLowerCase()
            && row.activity) {
          activitiesForLocation.add(row.activity);
        }
      });
      return [...activitiesForLocation].sort();
    }
    // No location → show all activities
    return uv?.activities || [];
  }, [formData.location, apiData, uv]);

  // ─── AUTO CLEAR SUCCESS ───────────────────────────────
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(""), 6000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  // ─── FORM HANDLERS ────────────────────────────────────
  const handleFormChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };

      // ✅ Location change → reset activity (cascading)
      if (field === 'location') {
        updated.activity = '';
      }
      return updated;
    });
  };

  // ─── ITEM HANDLERS ────────────────────────────────────
  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index] };

    if (field === 'materialType') {
      updated[index] = {
        ...updated[index],
        materialType: value,
        materialName: '', materialSize: '',
        specification: '', skuCode: '',
      };
    } else if (field === 'materialName') {
      updated[index] = {
        ...updated[index],
        materialName: value,
        materialSize: '', specification: '', skuCode: '',
      };
    } else if (field === 'materialSize') {
      updated[index][field] = value;
      const nameKey = updated[index].materialName.toLowerCase();
      const sizeKey = value.toLowerCase();
      const comboKey = `${nameKey}|||${sizeKey}`;
      updated[index].skuCode = maps?.nameAndSizeToSKU?.[comboKey] || '';
    } else {
      updated[index][field] = value;
    }

    setItems(updated);
  };

  const getSizesForName = (name) =>
    name ? maps?.nameToSizes?.[name.toLowerCase()] || [] : [];

  const getSpecsForName = (name) =>
    name ? maps?.nameToSpecs?.[name.toLowerCase()] || [] : [];

  const handleAddItem = () => {
    setItems([...items, {
      materialType: '', materialName: '', materialSize: '',
      specification: '', skuCode: '',
      quantity: '', unit: '', description: '', reqDays: '',
    }]);
  };

  const handleRemoveItem = (i) => {
    if (items.length > 1) setItems(items.filter((_, idx) => idx !== i));
  };

  // ─── VALIDATION ────────────────────────────────────────
  const isFormValid = useMemo(() => {
    if (!formData.projectName?.trim()) return false;
    if (!formData.engineerName?.trim()) return false;
    if (!formData.location?.trim()) return false;
    if (!formData.activity?.trim()) return false;
    if (!formData.remark?.trim()) return false;

    for (const item of items) {
      if (!item.materialType?.trim()) return false;
      if (!item.materialName?.trim()) return false;
      if (!item.materialSize?.trim()) return false;
      if (!item.specification?.trim()) return false;
      if (!item.skuCode?.trim()) return false;
      if (!item.quantity?.toString().trim()) return false;
      if (!item.unit?.trim()) return false;
      if (!item.description?.trim()) return false;
      if (item.reqDays === '' || item.reqDays === undefined
        || item.reqDays === null) return false;
    }
    return true;
  }, [formData, items]);

  // ─── SUBMIT ────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    setErrorMsg("");

    try {
      const result = await submitRequirement({
        ...formData,
        items,
      }).unwrap();

      setSuccessMsg(
        `${result.message} (${result.reqNo} - ${result.itemCount} items)`
      );
      handleReset();
    } catch (err) {
      setErrorMsg(err?.data?.error || "Submission failed");
    }
  };

  const handleReset = () => {
    setFormData({
      projectName: FIXED_PROJECT,
      engineerName: '',
      location: '',
      activity: '',
      remark: '',
    });
    setItems([{
      materialType: '', materialName: '', materialSize: '',
      specification: '', skuCode: '',
      quantity: '', unit: '', description: '', reqDays: '',
    }]);
    setErrorMsg("");
  };

  // ─── PROGRESS ──────────────────────────────────────────
  const totalRequired = 5 + (items.length * 9);
  const filledCount = (() => {
    let count = 0;
    if (formData.projectName?.trim()) count++;
    if (formData.engineerName?.trim()) count++;
    if (formData.location?.trim()) count++;
    if (formData.activity?.trim()) count++;
    if (formData.remark?.trim()) count++;
    items.forEach(item => {
      if (item.materialType?.trim()) count++;
      if (item.materialName?.trim()) count++;
      if (item.materialSize?.trim()) count++;
      if (item.specification?.trim()) count++;
      if (item.skuCode?.trim()) count++;
      if (item.quantity?.toString().trim()) count++;
      if (item.unit?.trim()) count++;
      if (item.description?.trim()) count++;
      if (item.reqDays !== '' && item.reqDays !== undefined
        && item.reqDays !== null) count++;
    });
    return count;
  })();

  if (isLoading) return <LoadingScreen />;
  if (isError) {
    return <ErrorScreen
      error={fetchError?.data?.error || "Failed to load data"}
      onRetry={refetch}
    />;
  }

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

      {/* Error */}
      {errorMsg && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px', background: T.dangerBg,
          border: `1px solid ${T.dangerBorder}`, borderRadius: 10,
          marginBottom: 20, fontSize: 13, fontWeight: 500, color: T.danger,
        }}>
          <AlertCircle size={18} /> {errorMsg}
          <button onClick={() => setErrorMsg("")} style={{
            marginLeft: 'auto', background: 'none', border: 'none',
            color: T.danger, cursor: 'pointer', fontSize: 18,
          }}>×</button>
        </div>
      )}

      {/* ═══ SECTION 1: Project Info ═══ */}
      <div style={S.card}>
        <div style={S.sectionTitle}>
          <div style={S.goldBar} /> Project Information
          <span style={{
            marginLeft: 'auto', fontSize: 11, fontWeight: 500,
            color: T.success, background: T.successBg,
            padding: '3px 10px', borderRadius: 20,
            border: `1px solid ${T.successBorder}`,
          }}>
            🔒 Signature Heritage PRJ024
          </span>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 16,
        }}>
          {/* Project Name - FIXED */}
          <div>
            <label style={S.label}>
              Project Name <span style={S.req}>*</span>
              <span style={{
                marginLeft: 8, fontSize: 10, color: T.success,
                background: T.successBg, padding: '2px 8px',
                borderRadius: 10, fontWeight: 500,
              }}>Fixed</span>
            </label>
            <input
              type="text"
              value={formData.projectName}
              readOnly
              style={{
                ...S.inputReadonly,
                borderLeft: `3px solid ${T.success}`,
                fontWeight: 600,
              }}
            />
          </div>

          {/* ✅ Engineer Name - Type + Filter */}
          <SearchableSelect
            label="Engineer Name" required
            value={formData.engineerName}
            onChange={(val) => handleFormChange('engineerName', val)}
            options={projectEngineers}
            placeholder="Type or select engineer"
            allowCustom={true}
          />

          {/* ✅ Location - Type + Filter */}
          <SearchableSelect
            label="Location" required
            value={formData.location}
            onChange={(val) => handleFormChange('location', val)}
            options={projectLocations}
            placeholder="Type or select location"
            allowCustom={true}
          />

          {/* ✅ Activity - Filter by Location (Cascading) */}
          <SearchableSelect
            label="Activity" required
            value={formData.activity}
            onChange={(val) => handleFormChange('activity', val)}
            options={projectActivities}
            placeholder={
              formData.location
                ? `Type or select activity (${projectActivities.length})`
                : "Select location first"
            }
            allowCustom={true}
            disabled={!formData.location}
          />
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
          const matNames = maps?.typeToNames?.[typeKey] || [];
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
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, color: T.navyDark,
                  }}>{idx + 1}</span>
                  Item {idx + 1}
                </span>
                {items.length > 1 && (
                  <button onClick={() => handleRemoveItem(idx)} style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '6px 12px', borderRadius: 6,
                    border: `1px solid ${T.dangerBorder}`,
                    background: T.dangerBg, color: T.danger,
                    fontSize: 12, fontWeight: 500, cursor: 'pointer',
                  }}>
                    <Trash2 size={13} /> Remove
                  </button>
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
                  options={uv?.materialTypes || []}
                  placeholder="Select Type"
                  allowCustom={true}
                />
                <SearchableSelect
                  label="Material Name" required
                  value={item.materialName}
                  onChange={(val) => handleItemChange(idx, 'materialName', val)}
                  options={matNames}
                  placeholder={typeKey ? "Select Material" : "Select type first"}
                  disabled={!typeKey}
                  allowCustom={true}
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
                  disabled={!item.materialName}
                  allowCustom={true}
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
                        : "Type spec"
                      : "Select material name first"
                  }
                  disabled={!item.materialName}
                  allowCustom={true}
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
                    value={item.skuCode}
                    onChange={(e) =>
                      handleItemChange(idx, 'skuCode', e.target.value)
                    }
                    style={{
                      ...S.input,
                      borderLeft: item.skuCode
                        ? `3px solid ${T.success}`
                        : `3px solid ${T.danger}`,
                    }}
                    placeholder="Auto-filled or type"
                    onFocus={focusStyle} onBlur={blurStyle}
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
                    onChange={(e) =>
                      handleItemChange(idx, 'quantity', e.target.value)
                    }
                    style={S.input}
                    placeholder="Enter qty"
                    onFocus={focusStyle} onBlur={blurStyle}
                  />
                </div>

                <SearchableSelect
                  label="Unit Name" required
                  value={item.unit}
                  onChange={(val) => handleItemChange(idx, 'unit', val)}
                  options={uv?.unitNames || []}
                  placeholder="Select Unit"
                  allowCustom={true}
                />

                <div>
                  <label style={S.label}>
                    Require Days <span style={S.req}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={item.reqDays}
                      onChange={(e) =>
                        handleItemChange(idx, 'reqDays', e.target.value)
                      }
                      style={S.select}
                      onFocus={focusStyle} onBlur={blurStyle}
                    >
                      <option value="">Select Days</option>
                      {[...Array(11)].map((_, i) => (
                        <option key={i} value={i}>
                          {i === 0
                            ? "0 - Urgent"
                            : `${i} Day${i > 1 ? 's' : ''}`}
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
                    onChange={(e) =>
                      handleItemChange(idx, 'description', e.target.value)
                    }
                    style={S.input}
                    placeholder="Enter description"
                    onFocus={focusStyle} onBlur={blurStyle}
                  />
                </div>
              </div>

              {/* Add Item */}
              {idx === items.length - 1 && (
                <button onClick={handleAddItem} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  marginTop: 14, padding: '8px 16px', borderRadius: 8,
                  border: `1.5px dashed ${T.gold}`, background: `${T.gold}08`,
                  color: T.goldDark, fontSize: 13, fontWeight: 600,
                  cursor: 'pointer',
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${T.gold}15`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = `${T.gold}08`;
                  }}
                >
                  <Plus size={15} /> Add Another Item
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* ═══ SECTION 3: Remark ═══ */}
      <div style={S.card}>
        <div style={S.sectionTitle}>
          <div style={S.goldBar} /> Additional Information
        </div>
        <div>
          <label style={S.label}>
            Remark <span style={S.req}>*</span>
          </label>
          <input
            type="text"
            value={formData.remark}
            onChange={(e) => handleFormChange('remark', e.target.value)}
            style={S.input}
            placeholder="Enter remark"
            onFocus={focusStyle} onBlur={blurStyle}
          />
        </div>
      </div>

      {/* ═══ SECTION 4: Actions ═══ */}
      <div style={{
        ...S.card,
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12,
      }}>
        {!isFormValid ? (
          <div style={{ margin: 0 }}>
            <p style={{
              fontSize: 12, color: T.danger,
              display: 'flex', alignItems: 'center',
              gap: 4, margin: 0,
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
                background: `linear-gradient(90deg, ${T.gold}, ${T.goldDark})`,
                transition: 'width 0.3s ease',
              }} />
            </div>
          </div>
        ) : (
          <p style={{
            fontSize: 12, color: T.success,
            display: 'flex', alignItems: 'center',
            gap: 4, margin: 0,
          }}>
            <CheckCircle size={14} /> All fields filled — ready to submit ✓
          </p>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleReset} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '10px 20px', borderRadius: 8,
            border: `1.5px solid ${T.border}`, background: T.card,
            color: T.textLight, fontSize: 13, fontWeight: 600,
            cursor: 'pointer',
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
            disabled={!isFormValid || isSubmitting}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 24px', borderRadius: 8,
              border: 'none',
              background: isFormValid && !isSubmitting
                ? `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`
                : T.border,
              color: isFormValid && !isSubmitting
                ? T.navyDark : T.textMuted,
              fontSize: 13, fontWeight: 700,
              cursor: isFormValid && !isSubmitting
                ? 'pointer' : 'not-allowed',
              boxShadow: isFormValid && !isSubmitting
                ? `0 2px 8px ${T.gold}40` : 'none',
              transition: 'all 0.2s',
              opacity: isFormValid && !isSubmitting ? 1 : 0.6,
            }}
            onMouseEnter={(e) => {
              if (isFormValid && !isSubmitting) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = `0 4px 14px ${T.gold}50`;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              if (isFormValid && !isSubmitting)
                e.currentTarget.style.boxShadow = `0 2px 8px ${T.gold}40`;
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={15}
                  style={{ animation: 'spin 0.8s linear infinite' }}
                />
                Submitting...
              </>
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

export default SignatureRequirement;