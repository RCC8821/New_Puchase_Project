// frontend/src/components/Paradise/ParadiseOutForm.jsx
import React, { useMemo, useState } from "react";
import { Plus, Trash2, Send, RotateCcw, Loader2, AlertCircle, CheckCircle, Search } from "lucide-react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import {
  useGetParadiseProjectDataQuery,
  useSubmitParadiseRequirementMutation,
} from "../../redux/Paradise/ParadiseSlice";

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

const ParadiseOutForm = () => {
  const FIXED_PROJECT = "Signature Paradise PRJ025";
  const navigate = useNavigate();
  const userType = sessionStorage.getItem("userType");
  const isAdmin = userType === "admin";

  const { data: apiData, isLoading, isError, error: fetchError, refetch } =
    useGetParadiseProjectDataQuery();

  const [submitRequirement, { isLoading: isSubmitting }] =
    useSubmitParadiseRequirementMutation();

  const [formData, setFormData] = useState({
    projectName: isAdmin ? "" : FIXED_PROJECT,
    engineerName: "",
    cluster: "",
    activity: "",
    remark: "",            
    contractorName: "",    
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
  const contractorOptions = uv?.contractors || []; 

  const locationOptions = formData.cluster
    ? (maps?.clusterToLocations?.[formData.cluster.toLowerCase()] || [])
    : (uv?.locations || []);

  const setField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "cluster") {
      setItems((prev) => prev.map(item => ({ ...item, location: "" })));
    }
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index] };
    updated[index][field] = value;

    if (field === "materialType") {
      updated[index] = {
        ...updated[index],
        materialType: value,
        materialName: "",
        materialSize: "",
        specification: "",
        skuCode: "",
        unit: "",  
      };
    }

    if (field === "materialName") {
      updated[index] = {
        ...updated[index],
        materialName: value,
        materialSize: "",
        specification: "",
        skuCode: "",
        unit: "",  
      };
    }

    if (field === "materialSize") {
      const nameKey = (updated[index].materialName || "").toLowerCase();
      const sizeKey = String(value || "").toLowerCase();
      const comboKey = `${nameKey}|||${sizeKey}`;
      const foundSKU = maps?.nameAndSizeToSKU?.[comboKey] || "";
      updated[index].skuCode = foundSKU;

      if (foundSKU) {
        const foundUnit = maps?.skuCodeToUnit?.[foundSKU.toLowerCase()] || "";
        updated[index].unit = foundUnit;
      } else {
        updated[index].unit = "";
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
    if (!formData.contractorName?.trim()) return false; 

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
      });
      return;
    }

    try {
      const result = await submitRequirement({ ...formData, items }).unwrap();

      await Swal.fire({
        icon: "success",
        title: "Paradise Submitted Successfully!",
        html: `
          <div style="text-align:left;padding:12px 0;">
            <div style="background:#f8fafc;padding:12px;border-radius:8px;border-left:4px solid ${T.gold};margin-bottom:10px;">
              <p style="margin:6px 0;font-size:14px;"><strong>Req No:</strong> <span style="color:${T.goldDark};font-weight:700;">${result.reqNo}</span></p>
              <p style="margin:6px 0;font-size:14px;"><strong>Total Items:</strong> <span style="color:${T.success};font-weight:700;">${result.itemCount}</span></p>
            </div>
          </div>
        `,
        confirmButtonColor: T.gold,
      });

      setFormData({
        projectName: isAdmin ? "" : FIXED_PROJECT,
        engineerName: "", cluster: "", activity: "", remark: "", contractorName: "",
      });
      setItems([{ ...emptyItem }]);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Submission Failed!",
        text: err?.data?.error || "Something went wrong.",
        confirmButtonColor: T.danger,
      });
    }
  };

  if (isLoading) return <div style={{ display: "flex", justifyContent: "center", padding: 80 }}><Loader2 className="animate-spin" color={T.gold} /></div>;

  const totalRequired = 6 + items.length * 9;
  const filledCount = (() => {
    let c = 0;
    if (formData.projectName?.trim()) c++;
    if (formData.engineerName?.trim()) c++;
    if (formData.cluster?.trim()) c++;
    if (formData.activity?.trim()) c++;
    if (formData.remark?.trim()) c++;
    if (formData.contractorName?.trim()) c++; 
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
      <button onClick={() => navigate('/dashboard/paradise')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: `1px solid ${T.border}`, background: T.card, cursor: 'pointer', marginBottom: 16 }}>
         Back to Paradise Dashboard
      </button>

      {/* SECTION 1 */}
      <div style={S.card}>
        <div style={S.sectionTitle}>
          <div style={S.goldBar} />
          <span>Paradise Project Information</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          {isAdmin ? (
            <SearchableSelect
              label="Project Name" required
              value={formData.projectName}
              onChange={(v) => { setField("projectName", v); setField("engineerName", ""); }}
              options={uv?.projectNames || []}
              placeholder="Select Paradise Project"
              allowCustom
            />
          ) : (
            <div>
              <label style={S.label}>Project Name <span style={S.req}>*</span></label>
              <input value={formData.projectName} readOnly style={S.inputReadonly} />
            </div>
          )}

          <SearchableSelect
            label="Engineer Name" required
            value={formData.engineerName}
            onChange={(v) => setField("engineerName", v)}
            options={engineerOptions}
            placeholder="Select engineer"
            allowCustom
          />

          <SearchableSelect
            label="Cluster" required
            value={formData.cluster}
            onChange={(v) => setField("cluster", v)}
            options={clusterOptions}
            placeholder="Select cluster"
            allowCustom
          />

          <SearchableSelect
            label="Activity" required
            value={formData.activity}
            onChange={(v) => setField("activity", v)}
            options={activityOptions}
            placeholder="Select activity"
            allowCustom
          />
        </div>
      </div>

      {/* SECTION 2 - Material Items */}
      <div style={S.card}>
        <div style={S.sectionTitle}>
          <div style={S.goldBar} />
          <span>Material Items ({items.length})</span>
        </div>

        {items.map((item, idx) => {
          const typeKey = (item.materialType || "").trim().toLowerCase();
          const matNames = maps?.typeToNames?.[typeKey] || [];
          const sizes = getSizesForName(item.materialName);
          const specs = getSpecsForName(item.materialName);

          return (
            <div key={idx} style={{ border: `1px solid ${T.border}`, borderRadius: 10, padding: 16, marginBottom: 12, background: T.bg }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                <span style={{ fontWeight: 600 }}>Item #{idx + 1}</span>
                {items.length > 1 && (
                  <button onClick={() => removeItem(idx)} style={{ color: T.danger, background: "none", border: "none", cursor: "pointer" }}>Remove</button>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                <SearchableSelect
                  label="Location" required
                  value={item.location}
                  onChange={(val) => handleItemChange(idx, "location", val)}
                  options={locationOptions}
                  placeholder="Select location"
                  disabled={!formData.cluster}
                  allowCustom
                />
                <SearchableSelect
                  label="Material Type" required
                  value={item.materialType}
                  onChange={(val) => handleItemChange(idx, "materialType", val)}
                  options={uv?.materialTypes || []}
                  placeholder="Select type" allowCustom
                />
                <SearchableSelect
                  label="Material Name" required
                  value={item.materialName}
                  onChange={(val) => handleItemChange(idx, "materialName", val)}
                  options={matNames}
                  placeholder="Select Name"
                  disabled={!typeKey} allowCustom
                />
                <SearchableSelect
                  label="Material Size" required
                  value={item.materialSize}
                  onChange={(val) => handleItemChange(idx, "materialSize", val)}
                  options={sizes}
                  placeholder="Select Size"
                  disabled={!item.materialName} allowCustom
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginTop: 12 }}>
                <SearchableSelect
                  label="Specification" required
                  value={item.specification}
                  onChange={(val) => handleItemChange(idx, "specification", val)}
                  options={specs}
                  placeholder="Select Spec"
                  disabled={!item.materialName} allowCustom
                />
                <div>
                  <label style={S.label}>SKU Code <span style={S.req}>*</span></label>
                  <input value={item.skuCode} readOnly style={S.inputReadonly} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginTop: 12 }}>
                <div>
                  <label style={S.label}>Quantity <span style={S.req}>*</span></label>
                  <input type="number" value={item.quantity} onChange={(e) => handleItemChange(idx, "quantity", e.target.value)} style={S.input} placeholder="Qty" />
                </div>
                <div>
                  <label style={S.label}>Unit Name <span style={S.req}>*</span></label>
                  <input type="text" readOnly value={item.unit} style={S.inputReadonly} placeholder="Unit" />
                </div>
                <div>
                  <label style={S.label}>Description <span style={S.req}>*</span></label>
                  <input value={item.description} onChange={(e) => handleItemChange(idx, "description", e.target.value)} style={S.input} placeholder="Description" />
                </div>
              </div>

              {idx === items.length - 1 && (
                <button onClick={addItem} style={{ marginTop: 12, padding: "8px 16px", border: `1.5px dashed ${T.gold}`, background: "none", color: T.goldDark, cursor: "pointer", borderRadius: 8 }}>+ Add Another Item</button>
              )}
            </div>
          );
        })}
      </div>

      {/* ADDITIONAL INFO */}
      <div style={S.card}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <label style={S.label}>Slip No <span style={S.req}>*</span></label>
            <input value={formData.remark} onChange={(e) => setField("remark", e.target.value)} style={S.input} placeholder="Slip No" />
          </div>
          <SearchableSelect
            label="Contractor Name" required
            value={formData.contractorName}
            onChange={(v) => setField("contractorName", v)}
            options={contractorOptions}
            placeholder="Select contractor"
            allowCustom
          />
        </div>
      </div>

      {/* ACTIONS */}
      <div style={{ ...S.card, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>Required ({filledCount}/{totalRequired})</span>
        <button onClick={handleSubmit} disabled={!isFormValid || isSubmitting} style={{ padding: "10px 24px", background: isFormValid ? T.gold : T.border, color: "#fff", border: "none", borderRadius: 8, cursor: isFormValid ? "pointer" : "not-allowed" }}>
          {isSubmitting ? "Submitting..." : "Submit Requirement"}
        </button>
      </div>
    </div>
  );
};

export default ParadiseOutForm;