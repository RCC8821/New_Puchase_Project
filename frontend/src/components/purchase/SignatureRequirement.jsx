

import React, { useMemo, useState } from "react";
import {
  Plus, Trash2, Send, RotateCcw, Loader2, AlertCircle,
  CheckCircle, Search,
} from "lucide-react";
import Swal from "sweetalert2";
import {
  useGetSignatureProjectDataQuery,
  useSubmitSignatureRequirementMutation,
} from "../../redux/Signature/SignatureSlice";

const T = {
  navy: "#1e293b", navyLight: "#334155", navyDark: "#0f172a",
  gold: "#f59e0b", goldLight: "#fbbf24", goldDark: "#d97706",
  bg: "#f8fafc", card: "#ffffff", text: "#1e293b",
  textLight: "#64748b", textMuted: "#94a3b8",
  border: "#e2e8f0", borderLight: "#f1f5f9",
  success: "#10b981", successBg: "#ecfdf5", successBorder: "#a7f3d0",
  danger: "#ef4444", dangerBg: "#fef2f2", dangerBorder: "#fecaca",
};

const S = {
  label: { display: "block", fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6, letterSpacing: 0.3 },
  req: { color: T.danger, marginLeft: 2 },
  input: {
    width: "100%", padding: "10px 12px", fontSize: 13,
    border: `1.5px solid ${T.border}`, borderRadius: 8,
    outline: "none", color: T.text, background: T.borderLight,
    transition: "all 0.2s", boxSizing: "border-box",
  },
  inputReadonly: {
    width: "100%", padding: "10px 12px", fontSize: 13,
    border: `1.5px solid ${T.border}`, borderRadius: 8,
    color: T.textLight, background: "#eef2f7",
    boxSizing: "border-box", cursor: "default", fontWeight: 600,
  },
  sectionTitle: {
    fontSize: 15, fontWeight: 700, color: T.navy,
    marginBottom: 16, paddingBottom: 10,
    borderBottom: `2px solid ${T.border}`,
    display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
  },
  goldBar: { width: 3, height: 18, background: T.gold, borderRadius: 3, flexShrink: 0 },
  card: {
    background: T.card, borderRadius: 10, border: `1px solid ${T.border}`,
    padding: "clamp(14px, 3vw, 22px)", marginBottom: 16,
    boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
  },
};

const focusStyle = (e) => {
  e.target.style.borderColor = T.gold;
  e.target.style.boxShadow = `0 0 0 3px ${T.gold}15`;
  e.target.style.background = T.card;
};
const blurStyle = (e) => {
  e.target.style.borderColor = T.border;
  e.target.style.boxShadow = "none";
  e.target.style.background = T.borderLight;
};

const SearchableSelect = ({
  value, onChange, options = [], placeholder,
  required, label, disabled, allowCustom = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const typedValue = search || value || "";
  const filtered = options.filter((opt) =>
    String(opt).toLowerCase().includes(typedValue.toLowerCase())
  );
  const isExactMatch = options.some(
    (opt) => String(opt).toLowerCase() === typedValue.toLowerCase()
  );

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <label style={S.label}>
        {label} {required && <span style={S.req}>*</span>}
      </label>
      <div style={{ position: "relative" }}>
        <input
          type="text"
          value={isOpen ? search : value || ""}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
            if (allowCustom) onChange(e.target.value);
          }}
          onFocus={() => { setIsOpen(true); setSearch(value || ""); }}
          onBlur={() => setTimeout(() => { setIsOpen(false); setSearch(""); }, 200)}
          disabled={disabled}
          placeholder={placeholder}
          style={{
            ...S.input, paddingRight: 32,
            ...(disabled ? { opacity: 0.7, cursor: "not-allowed" } : {}),
          }}
          onFocusCapture={(e) => { if (!disabled) focusStyle(e); }}
          onBlurCapture={(e) => {
            e.target.style.borderColor = T.border;
            e.target.style.boxShadow = "none";
            e.target.style.background = disabled ? "#f1f5f9" : T.borderLight;
          }}
        />
        <Search size={14} style={{
          position: "absolute", right: 10, top: "50%",
          transform: "translateY(-50%)", color: T.textMuted, pointerEvents: "none",
        }} />
      </div>

      {isOpen && !disabled && (
        <ul style={{
          position: "absolute", zIndex: 50, width: "100%",
          background: "white", border: `1px solid ${T.border}`,
          borderRadius: 8, marginTop: 4, maxHeight: 220,
          overflowY: "auto", boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
          padding: 0, listStyle: "none",
        }}>
          {allowCustom && typedValue && !isExactMatch && (
            <li
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(typedValue);
                setSearch(""); setIsOpen(false);
              }}
              style={{
                padding: "10px 14px", fontSize: 13, fontWeight: 600,
                cursor: "pointer", background: `${T.gold}12`,
                borderBottom: `1px solid ${T.border}`,
                display: "flex", alignItems: "center", gap: 8, color: T.goldDark,
              }}
            >
              <Plus size={14} />
              Use "<strong>{typedValue}</strong>"
            </li>
          )}

          {filtered.length > 0 ? filtered.map((opt, idx) => (
            <li key={idx}
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(opt);
                setSearch(""); setIsOpen(false);
              }}
              style={{
                padding: "9px 14px", fontSize: 13, cursor: "pointer",
                borderBottom: idx < filtered.length - 1 ? `1px solid ${T.borderLight}` : "none",
                background: value === opt ? `${T.gold}08` : "transparent",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}
            >
              <span>{opt}</span>
              {value === opt && <CheckCircle size={12} style={{ color: T.success }} />}
            </li>
          )) : (
            <li style={{ padding: "12px 14px", color: T.textMuted, fontSize: 13, fontStyle: "italic" }}>
              No matching options
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

const LoadingScreen = () => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 20px" }}>
    <div style={{
      width: 56, height: 56, borderRadius: 14,
      background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      marginBottom: 20, boxShadow: `0 0 0 3px ${T.gold}30`,
    }}>
      <Loader2 size={28} color={T.gold} style={{ animation: "spin 1s linear infinite" }} />
    </div>
    <p style={{ fontSize: 15, fontWeight: 600, color: T.navy, marginBottom: 4 }}>Loading Data...</p>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const ErrorScreen = ({ error, onRetry }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 20px", textAlign: "center" }}>
    <AlertCircle size={40} color={T.danger} style={{ marginBottom: 16 }} />
    <p style={{ fontSize: 15, fontWeight: 600, color: T.navy, marginBottom: 6 }}>Failed to Load Data</p>
    <p style={{ fontSize: 13, color: T.textMuted, marginBottom: 20 }}>{error}</p>
    <button onClick={onRetry} style={{
      display: "flex", alignItems: "center", gap: 6, padding: "10px 20px",
      borderRadius: 8, border: "none",
      background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
      color: T.navyDark, fontSize: 13, fontWeight: 600, cursor: "pointer",
    }}>
      <RotateCcw size={15} /> Retry
    </button>
  </div>
);

const SignatureRequirement = () => {
  const FIXED_PROJECT = "Signature Heritage PRJ024";

  const userType = sessionStorage.getItem("userType");
  const isAdmin = userType === "admin";

  const { data: apiData, isLoading, isError, error: fetchError, refetch } =
    useGetSignatureProjectDataQuery();

  const [submitRequirement, { isLoading: isSubmitting }] =
    useSubmitSignatureRequirementMutation();

  const [formData, setFormData] = useState({
    projectName: isAdmin ? "" : FIXED_PROJECT,
    engineerName: "",
    cluster: "",
    activity: "",
    remark: "",
  });

  const emptyItem = {
    location: "",
    materialType: "",
    materialName: "",
    materialSize: "",
    specification: "",
    skuCode: "",
    quantity: "",
    unit: "",
    description: "",
  };

  const [items, setItems] = useState([{ ...emptyItem }]);

  const uv = apiData?.uniqueValues || {};
  const maps = apiData?.maps || {};
  const projectKey = (formData.projectName || "").toLowerCase();
  const engineerOptions = maps?.projectToEngineers?.[projectKey] || [];

const clusterOptions = uv?.clusters || [];
const activityOptions = uv?.activities || [];

// ✅ Locations filtered by selected Cluster
const locationOptions = formData.cluster
  ? (maps?.clusterToLocations?.[formData.cluster.toLowerCase()] || [])
  : (uv?.locations || []);

const setField = (field, value) => {
  setFormData((prev) => ({ ...prev, [field]: value }));

  // ✅ Cluster change → Clear all items' location
  if (field === "cluster") {
    setItems((prev) => prev.map(item => ({ ...item, location: "" })));
  }
};

  // ═══════════════════════════════════════════════
  // ✅ UPDATED - handleItemChange with Auto-Fill Unit
  // ═══════════════════════════════════════════════
  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index] };
    updated[index][field] = value;

    // ✅ Material Type change → Reset everything below
    if (field === "materialType") {
      updated[index] = {
        ...updated[index],
        materialType: value,
        materialName: "",
        materialSize: "",
        specification: "",
        skuCode: "",
        unit: "",  // ✅ Clear unit too
      };
    }

    // ✅ Material Name change → Reset size, spec, sku, unit
    if (field === "materialName") {
      updated[index] = {
        ...updated[index],
        materialName: value,
        materialSize: "",
        specification: "",
        skuCode: "",
        unit: "",  // ✅ Clear unit too
      };
    }

    // ✅ Material Size change → Auto-fill SKU + Unit
    if (field === "materialSize") {
      const nameKey = (updated[index].materialName || "").toLowerCase();
      const sizeKey = String(value || "").toLowerCase();
      const comboKey = `${nameKey}|||${sizeKey}`;
      const foundSKU = maps?.nameAndSizeToSKU?.[comboKey] || "";
      updated[index].skuCode = foundSKU;

      // ✅ Auto-fill Unit from SKU Code
      if (foundSKU) {
        const foundUnit = maps?.skuCodeToUnit?.[foundSKU.toLowerCase()] || "";
        updated[index].unit = foundUnit;
      } else {
        updated[index].unit = "";
      }
    }

    // ✅ SKU Code manually change → Auto-update Unit
    if (field === "skuCode") {
      const foundUnit = maps?.skuCodeToUnit?.[String(value || "").toLowerCase()] || "";
      if (foundUnit) {
        updated[index].unit = foundUnit;
      }
    }

    setItems(updated);
  };

  const getSizesForName = (name) =>
    name ? maps?.nameToSizes?.[name.toLowerCase()] || [] : [];
  const getSpecsForName = (name) =>
    name ? maps?.nameToSpecs?.[name.toLowerCase()] || [] : [];

  const addItem = () => setItems((prev) => [...prev, { ...emptyItem }]);
  const removeItem = (i) => {
    if (items.length > 1) setItems((prev) => prev.filter((_, idx) => idx !== i));
  };

  const isFormValid = useMemo(() => {
    if (!formData.projectName?.trim()) return false;
    if (!formData.engineerName?.trim()) return false;
    if (!formData.cluster?.trim()) return false;
    if (!formData.activity?.trim()) return false;
    if (!formData.remark?.trim()) return false;

    for (const it of items) {
      if (!it.location?.trim()) return false;
      if (!it.materialType?.trim()) return false;
      if (!it.materialName?.trim()) return false;
      if (!it.materialSize?.trim()) return false;
      if (!it.specification?.trim()) return false;
      if (!it.skuCode?.trim()) return false;
      if (!it.quantity?.toString().trim()) return false;
      if (!it.unit?.trim()) return false;
      if (!it.description?.trim()) return false;
    }
    return true;
  }, [formData, items]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      Swal.fire({
        icon: "warning",
        title: "Form Incomplete",
        text: "Please fill all required fields before submitting.",
        confirmButtonColor: T.gold,
        width: window.innerWidth < 500 ? "90%" : "450px",
      });
      return;
    }

    try {
      const result = await submitRequirement({ ...formData, items }).unwrap();

      await Swal.fire({
        icon: "success",
        title: "Submitted Successfully!",
        html: `
          <div style="text-align:left;padding:12px 0;">
            <div style="background:#f8fafc;padding:12px;border-radius:8px;border-left:4px solid ${T.gold};margin-bottom:10px;">
              <p style="margin:6px 0;font-size:14px;">
                <strong>Req No:</strong>
                <span style="color:${T.goldDark};font-weight:700;margin-left:8px;">${result.reqNo}</span>
              </p>
              <p style="margin:6px 0;font-size:14px;">
                <strong>Total Items:</strong>
                <span style="color:${T.success};font-weight:700;margin-left:8px;">${result.itemCount}</span>
              </p>
            </div>
            <p style="margin:6px 0;font-size:12px;color:#64748b;text-align:center;">
              ${result.message}
            </p>
          </div>
        `,
        confirmButtonText: "OK",
        confirmButtonColor: T.gold,
        timer: 5000,
        timerProgressBar: true,
        allowOutsideClick: false,
        width: window.innerWidth < 500 ? "90%" : "450px",
      });

      setFormData({
        projectName: isAdmin ? "" : FIXED_PROJECT,
        engineerName: "", cluster: "", activity: "", remark: "",
      });
      setItems([{ ...emptyItem }]);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Submission Failed!",
        text: err?.data?.error || "Something went wrong. Please try again.",
        confirmButtonText: "Try Again",
        confirmButtonColor: T.danger,
        width: window.innerWidth < 500 ? "90%" : "450px",
      });
    }
  };

  if (isLoading) return <LoadingScreen />;
  if (isError) return (
    <ErrorScreen
      error={fetchError?.data?.error || "Failed to load data"}
      onRetry={refetch}
    />
  );

  // Progress: 5 formData + 9 per item
  const totalRequired = 5 + items.length * 9;
  const filledCount = (() => {
    let c = 0;
    if (formData.projectName?.trim()) c++;
    if (formData.engineerName?.trim()) c++;
    if (formData.cluster?.trim()) c++;
    if (formData.activity?.trim()) c++;
    if (formData.remark?.trim()) c++;
    items.forEach((it) => {
      if (it.location?.trim()) c++;
      if (it.materialType?.trim()) c++;
      if (it.materialName?.trim()) c++;
      if (it.materialSize?.trim()) c++;
      if (it.specification?.trim()) c++;
      if (it.skuCode?.trim()) c++;
      if (it.quantity?.toString().trim()) c++;
      if (it.unit?.trim()) c++;
      if (it.description?.trim()) c++;
    });
    return c;
  })();

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 8px" }}>
      {/* SECTION 1 */}
      <div style={S.card}>
        <div style={S.sectionTitle}>
          <div style={S.goldBar} />
          <span>Project Information</span>
          {!isAdmin ? (
            <span style={{
              marginLeft: "auto", fontSize: 10, fontWeight: 500,
              color: T.success, background: T.successBg,
              padding: "3px 10px", borderRadius: 20,
              border: `1px solid ${T.successBorder}`,
              whiteSpace: "nowrap",
            }}>🔒 Signature Heritage PRJ024</span>
          ) : (
            <span style={{
              marginLeft: "auto", fontSize: 10, fontWeight: 500,
              color: T.goldDark, background: `${T.gold}15`,
              padding: "3px 10px", borderRadius: 20,
              border: `1px solid ${T.gold}40`, whiteSpace: "nowrap",
            }}>👤 Admin Access</span>
          )}
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
        }}>
          {isAdmin ? (
            <SearchableSelect
              label="Project Name" required
              value={formData.projectName}
              onChange={(v) => {
                setField("projectName", v);
                setField("engineerName", "");
              }}
              options={uv?.projectNames || []}
              placeholder="Type/select project"
              allowCustom
            />
          ) : (
            <div>
              <label style={S.label}>
                Project Name <span style={S.req}>*</span>
                <span style={{
                  marginLeft: 8, fontSize: 10, color: T.success,
                  background: T.successBg, padding: "2px 8px",
                  borderRadius: 10, fontWeight: 500,
                }}>Fixed</span>
              </label>
              <input
                value={formData.projectName}
                readOnly
                style={{ ...S.inputReadonly, borderLeft: `3px solid ${T.success}` }}
              />
            </div>
          )}

          <SearchableSelect
            label="Engineer Name" required
            value={formData.engineerName}
            onChange={(v) => setField("engineerName", v)}
            options={engineerOptions}
            placeholder={formData.projectName ? "Type/select engineer" : "Select project first"}
            allowCustom
            disabled={isAdmin && !formData.projectName}
          />

          <SearchableSelect
            label="Cluster" required
            value={formData.cluster}
            onChange={(v) => setField("cluster", v)}
            options={clusterOptions}
            placeholder="Type/select cluster"
            allowCustom
          />

          <SearchableSelect
            label="Activity" required
            value={formData.activity}
            onChange={(v) => setField("activity", v)}
            options={activityOptions}
            placeholder="Type/select activity"
            allowCustom
          />
        </div>
      </div>

      {/* SECTION 2 - Material Items */}
      <div style={S.card}>
        <div style={S.sectionTitle}>
          <div style={S.goldBar} />
          <span>Material Items</span>
          <span style={{
            marginLeft: "auto", fontSize: 11, fontWeight: 500,
            color: T.textMuted, background: T.borderLight,
            padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap",
          }}>
            {items.length} item{items.length > 1 ? "s" : ""}
          </span>
        </div>

        {items.map((item, idx) => {
          const typeKey = (item.materialType || "").trim().toLowerCase();
          const matNames = maps?.typeToNames?.[typeKey] || [];
          const sizes = getSizesForName(item.materialName);
          const specs = getSpecsForName(item.materialName);

          return (
            <div key={idx} style={{
              border: `1px solid ${T.border}`, borderRadius: 10,
              padding: "clamp(12px, 2.5vw, 18px)",
              marginBottom: 12, background: T.bg,
            }}>
              <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", marginBottom: 14,
                flexWrap: "wrap", gap: 8,
              }}>
                <span style={{
                  fontSize: 13, fontWeight: 600, color: T.navy,
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  <span style={{
                    width: 24, height: 24, borderRadius: 6,
                    background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700, color: T.navyDark,
                  }}>{idx + 1}</span>
                  Item {idx + 1}
                </span>

                {items.length > 1 && (
                  <button onClick={() => removeItem(idx)} style={{
                    display: "flex", alignItems: "center", gap: 4,
                    padding: "6px 12px", borderRadius: 6,
                    border: `1px solid ${T.dangerBorder}`,
                    background: T.dangerBg, color: T.danger,
                    fontSize: 12, fontWeight: 500, cursor: "pointer",
                  }}>
                    <Trash2 size={13} /> Remove
                  </button>
                )}
              </div>

              {/* Row 1 */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 12, marginBottom: 12,
              }}>
               <SearchableSelect
  label="Location" required
  value={item.location}
  onChange={(val) => handleItemChange(idx, "location", val)}
  options={locationOptions}
  placeholder={
    formData.cluster
      ? locationOptions.length > 0
        ? `Select from ${locationOptions.length} location(s)`
        : "No locations for this cluster"
      : "Select cluster first"
  }
  disabled={!formData.cluster}
  allowCustom
/>
                <SearchableSelect
                  label="Material Type" required
                  value={item.materialType}
                  onChange={(val) => handleItemChange(idx, "materialType", val)}
                  options={uv?.materialTypes || []}
                  placeholder="Type/select type" allowCustom
                />
                <SearchableSelect
                  label="Material Name" required
                  value={item.materialName}
                  onChange={(val) => handleItemChange(idx, "materialName", val)}
                  options={matNames}
                  placeholder={typeKey ? "Type/select material" : "Select type first"}
                  disabled={!typeKey} allowCustom
                />
                <SearchableSelect
                  label="Material Size" required
                  value={item.materialSize}
                  onChange={(val) => handleItemChange(idx, "materialSize", val)}
                  options={sizes}
                  placeholder={item.materialName ? "Type/select size" : "Select material first"}
                  disabled={!item.materialName} allowCustom
                />
              </div>

              {/* Row 2 */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 12, marginBottom: 12,
              }}>
                <SearchableSelect
                  label="Specification" required
                  value={item.specification}
                  onChange={(val) => handleItemChange(idx, "specification", val)}
                  options={specs}
                  placeholder={item.materialName ? "Type/select spec" : "Select material first"}
                  disabled={!item.materialName} allowCustom
                />
                <div>
                  <label style={S.label}>
                    SKU Code <span style={S.req}>*</span>
                    {item.skuCode && (
                      <span style={{
                        marginLeft: 8, fontSize: 10, color: T.success,
                        background: T.successBg, padding: "2px 8px",
                        borderRadius: 10, fontWeight: 500,
                      }}>Auto-filled</span>
                    )}
                  </label>
                  <input
                    value={item.skuCode}
                    onChange={(e) => handleItemChange(idx, "skuCode", e.target.value)}
                    style={S.input}
                    placeholder="Auto-filled or type SKU"
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                </div>
              </div>

              {/* Row 3 */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 12,
              }}>
                <div>
                  <label style={S.label}>Quantity <span style={S.req}>*</span></label>
                  <input
                    type="number" min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                    style={S.input}
                    placeholder="Enter qty"
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                </div>

                {/* ✅ UPDATED - Unit as Read-Only Auto-filled Field */}
                <div>
                  <label style={S.label}>
                    Unit Name <span style={S.req}>*</span>
                    {item.unit && (
                      <span style={{
                        marginLeft: 8, fontSize: 10, color: T.success,
                        background: T.successBg, padding: "2px 8px",
                        borderRadius: 10, fontWeight: 500,
                      }}>Auto-filled</span>
                    )}
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={item.unit}
                    style={{
                      ...S.inputReadonly,
                      borderLeft: item.unit
                        ? `3px solid ${T.success}`
                        : `3px solid ${T.danger}`,
                    }}
                    placeholder="Auto-filled from SKU"
                  />
                </div>

                <div>
                  <label style={S.label}>Description <span style={S.req}>*</span></label>
                  <input
                    value={item.description}
                    onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                    style={S.input}
                    placeholder="Enter description"
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                </div>
              </div>

              {idx === items.length - 1 && (
                <button onClick={addItem} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  marginTop: 14, padding: "8px 16px", borderRadius: 8,
                  border: `1.5px dashed ${T.gold}`, background: `${T.gold}08`,
                  color: T.goldDark, fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}>
                  <Plus size={15} /> Add Another Item
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* SECTION 3 */}
      <div style={S.card}>
        <div style={S.sectionTitle}>
          <div style={S.goldBar} />
          <span>Additional Information</span>
        </div>
        <div>
          <label style={S.label}>Remark <span style={S.req}>*</span></label>
          <input
            value={formData.remark}
            onChange={(e) => setField("remark", e.target.value)}
            style={S.input}
            placeholder="Enter remark"
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
        </div>
      </div>

      {/* ACTIONS */}
      <div style={{ ...S.card, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        {!isFormValid ? (
          <div style={{ flex: "1 1 220px" }}>
            <p style={{ fontSize: 12, color: T.danger, display: "flex", alignItems: "center", gap: 6, margin: 0 }}>
              <AlertCircle size={14} />
              Required ({filledCount}/{totalRequired})
            </p>
          </div>
        ) : (
          <p style={{ fontSize: 12, color: T.success, display: "flex", alignItems: "center", gap: 6, margin: 0, flex: "1 1 220px" }}>
            <CheckCircle size={14} /> Ready to submit ✓
          </p>
        )}

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={() => {
              setFormData({
                projectName: isAdmin ? "" : FIXED_PROJECT,
                engineerName: "", cluster: "", activity: "", remark: "",
              });
              setItems([{ ...emptyItem }]);
            }}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "10px 18px", borderRadius: 8,
              border: `1.5px solid ${T.border}`,
              background: T.card, color: T.textLight,
              fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}
          >
            <RotateCcw size={14} /> Reset
          </button>

          <button
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "10px 22px", borderRadius: 8,
              border: "none",
              background: isFormValid && !isSubmitting
                ? `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`
                : T.border,
              color: isFormValid && !isSubmitting ? T.navyDark : T.textMuted,
              fontSize: 13, fontWeight: 700,
              cursor: isFormValid && !isSubmitting ? "pointer" : "not-allowed",
              opacity: isFormValid && !isSubmitting ? 1 : 0.6,
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={15} style={{ animation: "spin 0.8s linear infinite" }} />
                Submitting...
              </>
            ) : (
              <>
                <Send size={14} /> Submit Requirement
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 640px) { input, select, textarea { font-size: 16px !important; } }
      `}</style>
    </div>
  );
};

export default SignatureRequirement;