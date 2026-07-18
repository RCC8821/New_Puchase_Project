

import React, { useState } from 'react';
import { useGetAdvanceDropdownDataQuery, usePostAdvancePaymentMutation } from '../../redux/advanceSlice';

const Advance_payment = () => {
  // ============================================================
  // RTK Query Hooks
  // ============================================================
  const {
    data: dropdownData,
    isLoading: dropdownLoading,
    isError: dropdownError,
  } = useGetAdvanceDropdownDataQuery();

  const [postAdvancePayment, {
    isLoading: submitLoading,
  }] = usePostAdvancePaymentMutation();

  // ============================================================
  // Form State
  // ============================================================
  const initialState = {
    siteName: '',
    vendorFirmName: '',
    paidAmount: '',
    bankDetails: '',
    paymentMode: '',
    paymentDetails: '',
    paymentDate: '',
    expHead: '',
  };

  const [formData, setFormData]     = useState(initialState);
  const [errors, setErrors]         = useState({});
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg]     = useState('');

  // ── Bank Dropdown State ──────────────────────────────────────
  const [bankSearch, setBankSearch]             = useState('');
  const [showBankDropdown, setShowBankDropdown] = useState(false);

  // ── Dropdown Options from API ────────────────────────────────
  const siteNames   = dropdownData?.data?.siteNames   || [];
  const vendorFirms = dropdownData?.data?.vendorFirms || [];
  const Banks       = dropdownData?.data?.Banks       || [];

  // ============================================================
  // Exp. Head Options
  // ============================================================
  const expHeadOptions = [
    'Purchase',
    'Contractor',
  ];

  // ============================================================
  // Handle Input Change
  // ============================================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // ── Bank Select Handler ──────────────────────────────────────
  const handleBankSelect = (bankName) => {
    setFormData((prev) => ({ ...prev, bankDetails: bankName }));
    setBankSearch(bankName);
    setShowBankDropdown(false);
    setErrors((prev) => ({ ...prev, bankDetails: '' }));
  };

  // ── Bank Clear Handler ───────────────────────────────────────
  const handleBankClear = () => {
    setFormData((prev) => ({ ...prev, bankDetails: '' }));
    setBankSearch('');
  };

  // ── Filtered Banks ───────────────────────────────────────────
  const filteredBanks = Banks.filter((bank) =>
    bank.toLowerCase().includes(bankSearch.toLowerCase())
  );

  // ============================================================
  // Validation
  // ============================================================
  const validateForm = () => {
    const newErrors = {};
    if (!formData.siteName)       newErrors.siteName       = 'Site Name is required';
    if (!formData.vendorFirmName) newErrors.vendorFirmName = 'Vendor Firm Name is required';
    if (!formData.paidAmount)     newErrors.paidAmount     = 'Paid Amount is required';
    if (!formData.bankDetails)    newErrors.bankDetails    = 'Bank Details is required';
    if (!formData.paymentMode)    newErrors.paymentMode    = 'Payment Mode is required';
    if (!formData.paymentDetails) newErrors.paymentDetails = 'Payment Details is required';
    if (!formData.paymentDate)    newErrors.paymentDate    = 'Payment Date is required';
    if (!formData.expHead)        newErrors.expHead        = 'Exp. Head is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================================================
  // Handle Submit
  // ============================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    if (!validateForm()) return;

    try {
      const result = await postAdvancePayment(formData).unwrap();
      setSuccessMsg(`✅ ${result.message} (${result.insertedAt})`);
      setFormData(initialState);
      setBankSearch('');
    } catch (err) {
      setErrorMsg(`❌ Error: ${err?.data?.message || 'Something went wrong'}`);
    }
  };

  // ============================================================
  // Handle Reset
  // ============================================================
  const handleReset = () => {
    setFormData(initialState);
    setBankSearch('');
    setShowBankDropdown(false);
    setErrors({});
    setSuccessMsg('');
    setErrorMsg('');
  };

  // ============================================================
  // Loading / Error State
  // ============================================================
  if (dropdownLoading) {
    return (
      <div style={styles.loaderContainer}>
        <div style={styles.loader}></div>
        <p style={styles.loaderText}>Loading dropdown data...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (dropdownError) {
    return (
      <div style={styles.errorContainer}>
        <p style={styles.errorText}>❌ Failed to load dropdown data. Please refresh the page.</p>
      </div>
    );
  }

  // ============================================================
  // Render
  // ============================================================
  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>

        {/* ── Header ── */}
        <div style={styles.header}>
          <h2 style={styles.headerTitle}>💰 Advance Payment Form</h2>
          <p style={styles.headerSubtitle}>Fill in the details to submit advance payment</p>
        </div>

        {/* ── Success Message ── */}
        {successMsg && (
          <div style={styles.successAlert}>{successMsg}</div>
        )}

        {/* ── Error Message ── */}
        {errorMsg && (
          <div style={styles.errorAlert}>{errorMsg}</div>
        )}

        {/* ============================================================ */}
        {/* FORM */}
        {/* ============================================================ */}
        <form onSubmit={handleSubmit} style={styles.form}>

          {/* ── Row 1: Site Name + Vendor Firm ── */}
          <div style={styles.row}>

            {/* Site Name */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Site Name <span style={styles.required}>*</span>
              </label>
              <select
                name="siteName"
                value={formData.siteName}
                onChange={handleChange}
                style={{
                  ...styles.select,
                  borderColor: errors.siteName ? '#e74c3c' : '#ddd',
                }}
              >
                <option value="">-- Select Site Name --</option>
                {siteNames.map((site, index) => (
                  <option key={index} value={site}>{site}</option>
                ))}
              </select>
              {errors.siteName && (
                <span style={styles.errorMsg}>{errors.siteName}</span>
              )}
            </div>

            {/* Vendor Firm */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Vendor Firm Name <span style={styles.required}>*</span>
              </label>
              <select
                name="vendorFirmName"
                value={formData.vendorFirmName}
                onChange={handleChange}
                style={{
                  ...styles.select,
                  borderColor: errors.vendorFirmName ? '#e74c3c' : '#ddd',
                }}
              >
                <option value="">-- Select Vendor Firm --</option>
                {vendorFirms.map((firm, index) => (
                  <option key={index} value={firm}>{firm}</option>
                ))}
              </select>
              {errors.vendorFirmName && (
                <span style={styles.errorMsg}>{errors.vendorFirmName}</span>
              )}
            </div>

          </div>

          {/* ── Row 2: Paid Amount + Bank Details ── */}
          <div style={styles.row}>

            {/* Paid Amount */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Paid Amount <span style={styles.required}>*</span>
              </label>
              <input
                type="number"
                name="paidAmount"
                value={formData.paidAmount}
                onChange={handleChange}
                placeholder="Enter Paid Amount"
                style={{
                  ...styles.input,
                  borderColor: errors.paidAmount ? '#e74c3c' : '#ddd',
                }}
              />
              {errors.paidAmount && (
                <span style={styles.errorMsg}>{errors.paidAmount}</span>
              )}
            </div>

            {/* ── Bank Details - Searchable Dropdown from API ── */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Bank Details <span style={styles.required}>*</span>
              </label>

              {/* Wrapper for positioning */}
              <div style={{ position: 'relative' }}>

                {/* Search Input */}
                <input
                  type="text"
                  placeholder="Search or Select Bank..."
                  value={bankSearch}
                  onFocus={() => setShowBankDropdown(true)}
                  onBlur={() => setTimeout(() => setShowBankDropdown(false), 180)}
                  onChange={(e) => {
                    setBankSearch(e.target.value);
                    setShowBankDropdown(true);
                    // If user clears, reset bankDetails too
                    if (e.target.value === '') {
                      setFormData((prev) => ({ ...prev, bankDetails: '' }));
                    }
                  }}
                  style={{
                    ...styles.input,
                    borderColor: errors.bankDetails
                      ? '#e74c3c'
                      : formData.bankDetails
                        ? '#27ae60'
                        : '#ddd',
                    paddingRight: '36px',
                    background: formData.bankDetails ? '#f0fdf4' : '#fafafa',
                  }}
                />

                {/* Chevron Icon */}
                <span style={styles.chevron}>
                  {showBankDropdown ? '▲' : '▼'}
                </span>

                {/* Dropdown List */}
                {showBankDropdown && (
                  <ul style={styles.dropdownList}>

                    {/* Count Info */}
                    <li style={styles.dropdownCount}>
                      {filteredBanks.length} bank{filteredBanks.length !== 1 ? 's' : ''} found
                    </li>

                    {/* Bank Options */}
                    {filteredBanks.length > 0 ? (
                      filteredBanks.map((bank, index) => (
                        <li
                          key={index}
                          onMouseDown={() => handleBankSelect(bank)}
                          style={{
                            ...styles.dropdownItem,
                            background: formData.bankDetails === bank
                              ? '#d5f5e3'
                              : 'transparent',
                            fontWeight: formData.bankDetails === bank ? 700 : 400,
                            color: formData.bankDetails === bank ? '#1e8449' : '#2c3e50',
                          }}
                          onMouseOver={(e) => {
                            if (formData.bankDetails !== bank)
                              e.currentTarget.style.background = '#f8f9fa';
                          }}
                          onMouseOut={(e) => {
                            if (formData.bankDetails !== bank)
                              e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          {/* Tick if selected */}
                          {formData.bankDetails === bank && (
                            <span style={{ marginRight: 8, color: '#27ae60' }}>✓</span>
                          )}
                          {bank}
                        </li>
                      ))
                    ) : (
                      <li style={styles.dropdownEmpty}>
                        No bank found for "{bankSearch}"
                      </li>
                    )}
                  </ul>
                )}
              </div>

              {/* Selected Badge */}
              {formData.bankDetails && (
                <div style={styles.selectedBadge}>
                  <span style={styles.badgeText}>✓ {formData.bankDetails}</span>
                  <button
                    type="button"
                    onClick={handleBankClear}
                    style={styles.badgeClear}
                    title="Clear selection"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Error */}
              {errors.bankDetails && (
                <span style={styles.errorMsg}>{errors.bankDetails}</span>
              )}
            </div>

          </div>

          {/* ── Row 3: Payment Mode + Payment Date ── */}
          <div style={styles.row}>

            {/* Payment Mode */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Payment Mode <span style={styles.required}>*</span>
              </label>
              <select
                name="paymentMode"
                value={formData.paymentMode}
                onChange={handleChange}
                style={{
                  ...styles.select,
                  borderColor: errors.paymentMode ? '#e74c3c' : '#ddd',
                }}
              >
                <option value="">-- Select Payment Mode --</option>
                <option value="Cash">CASH</option>
                <option value="NEFT">NEFT</option>
                <option value="RTGS">RTGS</option>
                <option value="Cheque">CHEQUE</option>
              </select>
              {errors.paymentMode && (
                <span style={styles.errorMsg}>{errors.paymentMode}</span>
              )}
            </div>

            {/* Payment Date */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Payment Date <span style={styles.required}>*</span>
              </label>
              <input
                type="date"
                name="paymentDate"
                value={formData.paymentDate}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  borderColor: errors.paymentDate ? '#e74c3c' : '#ddd',
                }}
              />
              {errors.paymentDate && (
                <span style={styles.errorMsg}>{errors.paymentDate}</span>
              )}
            </div>

          </div>

          {/* ── Row 4: Payment Details + Exp Head ── */}
          <div style={styles.row}>

            {/* Payment Details */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Payment Details <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="paymentDetails"
                value={formData.paymentDetails}
                onChange={handleChange}
                placeholder="Enter Payment Details / Reference No."
                style={{
                  ...styles.input,
                  borderColor: errors.paymentDetails ? '#e74c3c' : '#ddd',
                }}
              />
              {errors.paymentDetails && (
                <span style={styles.errorMsg}>{errors.paymentDetails}</span>
              )}
            </div>

            {/* Exp Head */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Exp. Head <span style={styles.required}>*</span>
              </label>
              <select
                name="expHead"
                value={formData.expHead}
                onChange={handleChange}
                style={{
                  ...styles.select,
                  borderColor: errors.expHead ? '#e74c3c' : '#ddd',
                }}
              >
                <option value="">-- Select Exp. Head --</option>
                {expHeadOptions.map((head, index) => (
                  <option key={index} value={head}>{head}</option>
                ))}
              </select>
              {errors.expHead && (
                <span style={styles.errorMsg}>{errors.expHead}</span>
              )}
            </div>

          </div>

          {/* ── Buttons ── */}
          <div style={styles.buttonRow}>
            <button
              type="button"
              onClick={handleReset}
              style={styles.resetButton}
            >
              🔄 Reset
            </button>
            <button
              type="submit"
              disabled={submitLoading}
              style={{
                ...styles.submitButton,
                opacity: submitLoading ? 0.7 : 1,
                cursor: submitLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {submitLoading ? '⏳ Submitting...' : '✅ Submit Payment'}
            </button>
          </div>

        </form>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// ============================================================
// Styles
// ============================================================
const styles = {
  pageWrapper: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '30px 15px',
  },
  container: {
    background: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
    padding: '40px',
    width: '100%',
    maxWidth: '860px',
  },
  header: {
    marginBottom: '30px',
    borderBottom: '2px solid #f0f0f0',
    paddingBottom: '20px',
  },
  headerTitle: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#2c3e50',
    margin: '0 0 6px 0',
  },
  headerSubtitle: {
    fontSize: '14px',
    color: '#7f8c8d',
    margin: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#34495e',
  },
  required: {
    color: '#e74c3c',
    marginLeft: '2px',
  },
  input: {
    padding: '11px 14px',
    borderRadius: '8px',
    border: '1.5px solid #ddd',
    fontSize: '14px',
    color: '#2c3e50',
    outline: 'none',
    transition: 'border-color 0.2s',
    background: '#fafafa',
    boxSizing: 'border-box',
    width: '100%',
  },
  select: {
    padding: '11px 14px',
    borderRadius: '8px',
    border: '1.5px solid #ddd',
    fontSize: '14px',
    color: '#2c3e50',
    outline: 'none',
    background: '#fafafa',
    cursor: 'pointer',
    width: '100%',
  },
  errorMsg: {
    fontSize: '12px',
    color: '#e74c3c',
    marginTop: '2px',
  },

  // ── Bank Dropdown Styles ─────────────────────────────────────
  chevron: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '11px',
    color: '#7f8c8d',
    pointerEvents: 'none',
    userSelect: 'none',
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    background: '#ffffff',
    border: '1.5px solid #ddd',
    borderRadius: '8px',
    marginTop: '4px',
    maxHeight: '220px',
    overflowY: 'auto',
    zIndex: 999,
    listStyle: 'none',
    padding: 0,
    margin: 0,
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
  },
  dropdownCount: {
    padding: '6px 14px',
    fontSize: '11px',
    color: '#7f8c8d',
    borderBottom: '1px solid #f0f0f0',
    background: '#f8f9fa',
    userSelect: 'none',
  },
  dropdownItem: {
    padding: '10px 14px',
    cursor: 'pointer',
    borderBottom: '1px solid #f5f5f5',
    fontSize: '13px',
    transition: 'background 0.15s',
    display: 'flex',
    alignItems: 'center',
  },
  dropdownEmpty: {
    padding: '16px 14px',
    fontSize: '13px',
    color: '#7f8c8d',
    textAlign: 'center',
    userSelect: 'none',
  },
  selectedBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '4px',
    background: '#d5f5e3',
    border: '1px solid #2ecc71',
    borderRadius: '6px',
    padding: '3px 10px',
    maxWidth: '100%',
  },
  badgeText: {
    fontSize: '12px',
    color: '#1e8449',
    fontWeight: '600',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  badgeClear: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#e74c3c',
    fontSize: '12px',
    padding: '0 2px',
    lineHeight: 1,
    fontWeight: '700',
    flexShrink: 0,
  },

  // ── Buttons ─────────────────────────────────────────────────
  buttonRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '14px',
    marginTop: '10px',
  },
  resetButton: {
    padding: '12px 28px',
    borderRadius: '8px',
    border: '1.5px solid #bdc3c7',
    background: '#ecf0f1',
    color: '#2c3e50',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  submitButton: {
    padding: '12px 32px',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(135deg, #2ecc71, #27ae60)',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(46,204,113,0.4)',
  },

  // ── Alerts ──────────────────────────────────────────────────
  successAlert: {
    background: '#d5f5e3',
    border: '1px solid #2ecc71',
    borderRadius: '8px',
    padding: '14px 18px',
    color: '#1e8449',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '10px',
  },
  errorAlert: {
    background: '#fdecea',
    border: '1px solid #e74c3c',
    borderRadius: '8px',
    padding: '14px 18px',
    color: '#c0392b',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '10px',
  },

  // ── Loader ───────────────────────────────────────────────────
  loaderContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: '14px',
  },
  loader: {
    width: '44px',
    height: '44px',
    border: '4px solid #f0f0f0',
    borderTop: '4px solid #2ecc71',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loaderText: {
    color: '#7f8c8d',
    fontSize: '15px',
  },
  errorContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: '16px',
  },
};

export default Advance_payment;




////////////////////////////////////  testing send data to payemnt sheet /////////////////////////////



// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import {
//   Loader2, AlertCircle, CheckCircle, X, ChevronDown,
//   RotateCcw, Package, FileText, ExternalLink,
//   Phone, Search, ArrowDown, Share2
// } from "lucide-react";

// const T = {
//   navy: '#1e293b', navyLight: '#334155', navyDark: '#0f172a',
//   gold: '#f59e0b', goldLight: '#fbbf24', goldDark: '#d97706',
//   card: '#ffffff', text: '#1e293b',
//   textLight: '#64748b', textMuted: '#94a3b8',
//   border: '#e2e8f0', borderLight: '#f1f5f9',
//   success: '#10b981', successBg: '#ecfdf5', successBorder: '#a7f3d0',
//   danger: '#ef4444', dangerBg: '#fef2f2', dangerBorder: '#fecaca',
//   purple: '#7c3aed',
//   warning: '#f59e0b', warningBg: '#fffbeb',
// };

// const inputBase = {
//   width: '100%', padding: '10px 12px', fontSize: 14,
//   border: `1.5px solid ${T.border}`, borderRadius: 8,
//   outline: 'none', color: T.text, background: T.borderLight,
//   transition: 'all 0.2s', boxSizing: 'border-box',
// };

// const blurNormal = (e) => {
//   e.target.style.borderColor = T.border;
//   e.target.style.boxShadow = 'none';
//   e.target.style.background = T.borderLight;
// };

// const Payment15 = () => {
//   const [allData, setAllData] = useState([]);
//   const [filteredData, setFilteredData] = useState([]);
//   const [vendors, setVendors] = useState([]);
//   const [sites, setSites] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showData, setShowData] = useState(false);
//   const [vendorSearch, setVendorSearch] = useState("");
//   const [siteSearch, setSiteSearch] = useState("");
//   const [showVendorList, setShowVendorList] = useState(false);
//   const [showSiteList, setShowSiteList] = useState(false);
//   const [selectedBills, setSelectedBills] = useState([]);
//   const [paidAmounts, setPaidAmounts] = useState({});
//   const [roundups, setRoundups] = useState({});

//   const [accountNames, setAccountNames] = useState([]);
//   const [accountLoading, setAccountLoading] = useState(false);
//   const [bankDetails, setBankDetails] = useState("");
//   const [bankSearch, setBankSearch] = useState("");
//   const [showBankDropdown, setShowBankDropdown] = useState(false);
//   const [paymentMode, setPaymentMode] = useState("");
//   const [paymentDetails, setPaymentDetails] = useState("");
//   const [paymentDate, setPaymentDate] = useState("");
//   const [submitting, setSubmitting] = useState(false);

//   const vendorRef = useRef(null);
//   const siteRef = useRef(null);
//   const bankRef = useRef(null);
//   const paymentSectionRef = useRef(null);
//   const vendorSearchRef = useRef(vendorSearch);
//   const siteSearchRef = useRef(siteSearch);

//   useEffect(() => { vendorSearchRef.current = vendorSearch; }, [vendorSearch]);
//   useEffect(() => { siteSearchRef.current = siteSearch; }, [siteSearch]);

//   useEffect(() => {
//     fetchInitialData();
//     fetchAccountNames();
//     const handleClickOutside = (event) => {
//       if (vendorRef.current && !vendorRef.current.contains(event.target)) setShowVendorList(false);
//       if (siteRef.current && !siteRef.current.contains(event.target)) setShowSiteList(false);
//       if (bankRef.current && !bankRef.current.contains(event.target)) setShowBankDropdown(false);
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const fetchAccountNames = async () => {
//     try {
//       setAccountLoading(true);
//       const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/account-names`);
//       if (response.data.success) setAccountNames(response.data.data);
//     } catch (error) {
//       console.error("Account names fetch failed:", error);
//       setAccountNames([
//         "SVC Main A/C(202)", "SVC VENDOR PAY A/C(328)", "HDFC Kabir Ahuja(341)",
//         "HDFC Rajeev Abott(313)", "HDFC Madhav Gupta (375)", "HDFC Scope Clg(215)",
//         "ICICI RNTU(914)", "HDFC Alka Upadhyay(902)", "SVC Udit Agrawal(696)",
//       ]);
//     } finally {
//       setAccountLoading(false);
//     }
//   };

//   const fetchInitialData = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/Payment_15`);
//       if (response.data.success) {
//         const processedData = response.data.data.map((item) => {
//           const parseAmount = (value) => {
//             if (!value) return 0;
//             const cleaned = value.toString().replace(/,/g, "").trim();
//             return cleaned === "" ? 0 : Number(cleaned);
//           };
//           const netAmount = parseAmount(item.netAmount16 || item.netAmount17 || 0);
//           const latestPaid = parseAmount(item.latestPaidAmount || 0);
//           const advanceAmount = parseAmount(item.advanceAmount || 0);
//           const rawBalance = netAmount - latestPaid - advanceAmount;
//           const safeBalance = rawBalance > 0 ? rawBalance : 0;
//           return {
//             ...item,
//             netAmount16: netAmount,
//             latestPaidAmount: latestPaid,
//             advanceAmount: advanceAmount,
//             latestBalanceAmount: safeBalance,
//           };
//         });
//         setAllData(processedData);
//         setVendors(response.data.uniqueVendors);
//         setSites(response.data.uniqueSites);
//         return processedData;
//       }
//       return null;
//     } catch (error) {
//       console.error(error);
//       alert("Error loading data");
//       return null;
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleFilter = (freshData = null) => {
//     const currentVendor = vendorSearchRef.current?.trim();
//     const currentSite = siteSearchRef.current?.trim();
//     if (!currentVendor) return alert("Please select a vendor");
//     const sourceData = freshData || allData;
//     const results = sourceData.filter((item) => {
//       const vendorMatch = item.vendorFirmName?.trim().toLowerCase() === currentVendor.toLowerCase();
//       const siteMatch = (currentSite && currentSite !== "")
//         ? item.siteName?.trim().toLowerCase() === currentSite.toLowerCase()
//         : true;
//       return vendorMatch && siteMatch;
//     });
//     if (results.length === 0 && currentSite) {
//       const vendorOnlyResults = sourceData.filter(
//         item => item.vendorFirmName?.trim().toLowerCase() === currentVendor.toLowerCase()
//       );
//       if (vendorOnlyResults.length > 0) {
//         const vendorSites = [...new Set(vendorOnlyResults.map(i => i.siteName))];
//         alert(
//           `"${currentVendor}" ka data "${currentSite}" site pe nahi hai.\n\n` +
//           `Ye vendor in sites pe hai:\n${vendorSites.join('\n')}\n\nSab sites ka data dikha raha hu.`
//         );
//         setFilteredData(vendorOnlyResults);
//         setShowData(true);
//         setSelectedBills([]);
//         setPaidAmounts({});
//         setRoundups({});
//         return;
//       }
//     }
//     setFilteredData(results);
//     setShowData(true);
//     setSelectedBills([]);
//     setPaidAmounts({});
//     setRoundups({});
//   };

//   const toggleBillSelection = (uid) => {
//     setSelectedBills((prev) => {
//       if (prev.includes(uid)) {
//         setPaidAmounts((c) => { const n = { ...c }; delete n[uid]; return n; });
//         setRoundups((c) => { const n = { ...c }; delete n[uid]; return n; });
//         return prev.filter((id) => id !== uid);
//       } else {
//         setPaidAmounts((c) => ({ ...c, [uid]: 0 }));
//         setRoundups((c) => ({ ...c, [uid]: 0 }));
//         return [...prev, uid];
//       }
//     });
//   };

//   const calculateCurrentBalance = (bill) => {
//     const net = Number(bill.netAmount16 || 0);
//     const paid = Number(bill.latestPaidAmount || 0);
//     const advance = Number(bill.advanceAmount || 0);
//     const raw = net - paid - advance;
//     return raw > 0 ? raw : 0;
//   };

//   const isFullyPaidByAdvance = (bill) => {
//     const net = Number(bill.netAmount16 || 0);
//     const paid = Number(bill.latestPaidAmount || 0);
//     const advance = Number(bill.advanceAmount || 0);
//     return (paid + advance) >= net;
//   };

//   const getExcessAdvance = (bill) => {
//     const net = Number(bill.netAmount16 || 0);
//     const paid = Number(bill.latestPaidAmount || 0);
//     const advance = Number(bill.advanceAmount || 0);
//     const excess = (paid + advance) - net;
//     return excess > 0 ? excess : 0;
//   };

//   const handlePaidAmountChange = (uid, value) => {
//     let numValue = value === "" ? 0 : Number(value);
//     if (numValue < 0) numValue = 0;
//     const bill = filteredData.find((b) => b.UID === uid);
//     if (!bill) return;
//     const currentBalance = calculateCurrentBalance(bill);
//     if (isFullyPaidByAdvance(bill)) {
//       numValue = 0;
//     } else if (numValue > currentBalance) {
//       alert(`Cannot pay more than balance (Rs.${currentBalance.toLocaleString("en-IN")})`);
//       numValue = currentBalance;
//     }
//     setPaidAmounts((prev) => ({ ...prev, [uid]: numValue }));
//   };

//   const handleRoundupChange = (uid, value) => {
//     let numValue = value === "" ? 0 : parseFloat(value);
//     if (isNaN(numValue)) numValue = 0;
//     if (numValue > 9) numValue = 9;
//     if (numValue < -9) numValue = -9;
//     setRoundups((prev) => ({ ...prev, [uid]: numValue }));
//   };

//   const getPaymentSummary = (bill) => {
//     const netAmount = Number(bill.netAmount16 || 0);
//     const previousPaid = Number(bill.latestPaidAmount || 0);
//     const advanceAmount = Number(bill.advanceAmount || 0);
//     const maxAdvanceUsable = Math.max(netAmount - previousPaid, 0);
//     const effectiveAdvance = Math.min(advanceAmount, maxAdvanceUsable);
//     const excessAdvance = advanceAmount > maxAdvanceUsable ? advanceAmount - maxAdvanceUsable : 0;
//     const currentBalance = Math.max(netAmount - previousPaid - effectiveAdvance, 0);
//     const currentPaid = paidAmounts[bill.UID] || 0;
//     const roundup = roundups[bill.UID] || 0;
//     const effectivePaid = currentPaid + roundup;
//     const totalDeducted = previousPaid + effectiveAdvance + effectivePaid;
//     const newBalance = Math.max(netAmount - totalDeducted, 0);
//     const fullyPaid = isFullyPaidByAdvance(bill);
//     return {
//       netAmount, previousPaid, advanceAmount, effectiveAdvance,
//       excessAdvance, currentBalance, currentPaid, effectivePaid,
//       newBalance, totalPaidAfter: totalDeducted, fullyPaid,
//     };
//   };

//   const grandTotal = selectedBills.reduce(
//     (sum, uid) => sum + (paidAmounts[uid] || 0) + (roundups[uid] || 0), 0
//   );

//   const paymentDetailsLabel = paymentMode === "Cheque" ? "CHEQUE NUMBER" : "PAYMENT DETAILS";

//   // ✅ Check if ALL selected bills are advance-only
//   const allSelectedAreAdvance = selectedBills.length > 0 && selectedBills.every((uid) => {
//     const bill = filteredData.find((b) => b.UID === uid);
//     return bill && isFullyPaidByAdvance(bill);
//   });

//   // ✅ Check if ANY selected bill is advance
//   const hasAnyAdvanceBill = selectedBills.some((uid) => {
//     const bill = filteredData.find((b) => b.UID === uid);
//     return bill && isFullyPaidByAdvance(bill);
//   });

//   // ============================================================
//   // ✅ SUBMIT - Updated for Advance Logic
//   // ============================================================
//   const handleSubmit = async () => {
//     if (selectedBills.length === 0) { alert("Select at least one bill"); return; }

//     // ✅ Check: non-advance bills ke liye payment details required
//     const hasNonAdvanceBills = selectedBills.some((uid) => {
//       const bill = filteredData.find((b) => b.UID === uid);
//       return bill && !isFullyPaidByAdvance(bill);
//     });

//     if (hasNonAdvanceBills) {
//       if (!bankDetails || !paymentMode || !paymentDetails.trim() || !paymentDate) {
//         alert("Fill all payment details (required for non-advance bills)");
//         return;
//       }
//     } else {
//       // ✅ All advance bills - only bank and date needed
//       if (!bankDetails || !paymentDate) {
//         alert("Please select Bank and Payment Date");
//         return;
//       }
//     }

//     // ✅ Validate non-advance bills
//     const emptyPaidBills = selectedBills.filter((uid) => {
//       const bill = filteredData.find((b) => b.UID === uid);
//       if (bill && isFullyPaidByAdvance(bill)) return false;
//       const paid = paidAmounts[uid];
//       const round = roundups[uid];
//       return (
//         paid === undefined || paid === null || paid === "" || isNaN(paid) ||
//         round === undefined || round === null || round === "" || isNaN(round)
//       );
//     });
//     if (emptyPaidBills.length > 0) {
//       alert(`${emptyPaidBills.length} bill(s) mein Paid Amount ya Round Off khali hai.`);
//       return;
//     }

//     const zeroPaidBills = selectedBills.filter((uid) => {
//       const bill = filteredData.find((b) => b.UID === uid);
//       if (bill && isFullyPaidByAdvance(bill)) return false;
//       return Number(paidAmounts[uid] || 0) + Number(roundups[uid] || 0) === 0;
//     });
//     if (zeroPaidBills.length > 0) {
//       if (!window.confirm(`${zeroPaidBills.length} bill(s) mein effective paid 0 hai. Submit?`)) return;
//     }

//     setSubmitting(true);
//     try {
//       const payload = selectedBills.map((uid) => {
//         const bill = filteredData.find((item) => item.UID === uid);
//         const summary = getPaymentSummary(bill);
//         const fullyPaid = isFullyPaidByAdvance(bill);

//         if (fullyPaid) {
//           // ✅ ADVANCE BILL PAYLOAD
//           return {
//             UID: bill.UID,
//             planned15: bill.planned15 || "",
//             siteName: bill.siteName || "",
//             vendorFirmName16: bill.vendorFirmName || "",
//             billNo: bill.invoice13,
//             billDate16: bill.billDate || "",
//             netAmount16: summary.netAmount,
//             // ✅ H column = empty (no paid for advance)
//             currentPaid: "",
//             // ✅ DG = paidAmount17 (previous + advance used)
//             paidAmount17: summary.previousPaid + summary.effectiveAdvance,
//             // ✅ DH = 0 (fully paid)
//             balanceAmount17: 0,
//             bankDetails17: bankDetails,
//             paymentMode17: paymentMode || "",
//             paymentDetails17: paymentDetails || "",
//             paymentDate18: paymentDate,
//             grandTotal: grandTotal,
//             advanceAmount: summary.advanceAmount,
//             // ✅ Flag for backend
//             isAdvanceBill: true,
//           };
//         } else {
//           // ✅ NORMAL BILL PAYLOAD
//           const hColumnValue = summary.effectivePaid;
//           const paidAmount17 = summary.previousPaid + summary.effectivePaid;
//           const totalDeducted = summary.previousPaid + summary.effectiveAdvance + summary.effectivePaid;
//           const balanceAmount17 = Math.max(summary.netAmount - totalDeducted, 0);

//           return {
//             UID: bill.UID,
//             planned15: bill.planned15 || "",
//             siteName: bill.siteName || "",
//             vendorFirmName16: bill.vendorFirmName || "",
//             billNo: bill.invoice13,
//             billDate16: bill.billDate || "",
//             netAmount16: summary.netAmount,
//             currentPaid: hColumnValue,
//             paidAmount17: paidAmount17,
//             balanceAmount17: balanceAmount17,
//             bankDetails17: bankDetails,
//             paymentMode17: paymentMode,
//             paymentDetails17: paymentDetails,
//             paymentDate18: paymentDate,
//             grandTotal: grandTotal,
//             advanceAmount: summary.advanceAmount,
//             isAdvanceBill: false,
//           };
//         }
//       });

//       const response = await axios.post(
//         `${import.meta.env.VITE_BACKEND_URL}/api/Update-Payment-15`,
//         payload
//       );

//       if (response.data.success) {
//         alert(`Success! ${response.data.addedToPaymentSheet} payments recorded.`);
//         setSelectedBills([]);
//         setPaidAmounts({});
//         setRoundups({});
//         setBankDetails("");
//         setBankSearch("");
//         setPaymentMode("");
//         setPaymentDetails("");
//         setPaymentDate("");
//         const freshData = await fetchInitialData();
//         if (freshData) handleFilter(freshData);
//       } else {
//         alert("Error: " + (response.data.error || "Something went wrong"));
//       }
//     } catch (error) {
//       alert("Submit error: " + (error.response?.data?.error || error.message));
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const scrollToPaymentSection = () => {
//     if (paymentSectionRef.current)
//       paymentSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
//   };

//   if (loading) return (
//     <div style={{
//       display: 'flex', flexDirection: 'column',
//       justifyContent: 'center', alignItems: 'center',
//       minHeight: '60vh', fontFamily: 'sans-serif',
//     }}>
//       <div style={{
//         width: 56, height: 56, borderRadius: 14,
//         background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`,
//         display: 'flex', alignItems: 'center', justifyContent: 'center',
//         marginBottom: 20, boxShadow: `0 0 0 3px ${T.gold}30`,
//       }}>
//         <Loader2 size={28} color={T.gold} style={{ animation: 'spin 1s linear infinite' }} />
//       </div>
//       <p style={{ fontSize: 15, fontWeight: 600, color: T.navy, marginBottom: 4 }}>
//         Loading Payment Data...
//       </p>
//       <p style={{ fontSize: 13, color: T.textMuted }}>Fetching latest records</p>
//       <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
//     </div>
//   );

//   return (
//     <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 8px' }}>

//       {/* Header */}
//       <div style={{
//         background: T.card, borderRadius: 10, border: `1px solid ${T.border}`,
//         padding: '14px 18px', marginBottom: 12,
//         display: 'flex', alignItems: 'center',
//         justifyContent: 'space-between', flexWrap: 'wrap', gap: 10,
//       }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//           <div style={{
//             width: 36, height: 36, borderRadius: 8,
//             background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`,
//             display: 'flex', alignItems: 'center', justifyContent: 'center',
//           }}>
//             <Package size={18} color={T.gold} />
//           </div>
//           <div>
//             <h2 style={{ fontSize: 16, fontWeight: 700, color: T.navy, margin: 0 }}>
//               Payment — Step 15
//             </h2>
//             <p style={{ fontSize: 12, color: T.textMuted, margin: 0 }}>
//               {allData.length} pending bills
//             </p>
//           </div>
//         </div>
//         <button onClick={() => fetchInitialData()} style={{
//           display: 'flex', alignItems: 'center', gap: 6,
//           padding: '8px 14px', borderRadius: 8,
//           border: `1.5px solid ${T.border}`, background: T.card,
//           color: T.textLight, fontSize: 13, cursor: 'pointer',
//         }}>
//           <RotateCcw size={14} /> Refresh
//         </button>
//       </div>

//       {/* Filter Card */}
//       <div style={{
//         background: T.card, borderRadius: 10, border: `1px solid ${T.border}`,
//         padding: '16px 18px', marginBottom: 16,
//       }}>
//         <div style={{
//           display: 'flex', alignItems: 'center', gap: 8,
//           marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${T.border}`,
//         }}>
//           <Search size={16} color={T.gold} />
//           <span style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>Filter Bills</span>
//         </div>
//         <div style={{
//           display: 'grid', gridTemplateColumns: '1fr 1fr auto',
//           gap: 12, alignItems: 'end',
//         }}>
//           <div style={{ position: 'relative' }} ref={vendorRef}>
//             <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>Vendor</label>
//             <div style={{ position: 'relative' }}>
//               <input type="text" placeholder="Search Vendor..." value={vendorSearch}
//                 onFocus={() => setShowVendorList(true)}
//                 onChange={(e) => setVendorSearch(e.target.value)}
//                 style={inputBase} onBlur={blurNormal}
//               />
//               <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: T.textMuted, pointerEvents: 'none' }} />
//             </div>
//             {showVendorList && (
//               <ul style={{
//                 position: 'absolute', top: '100%', left: 0, right: 0,
//                 background: T.card, border: `1px solid ${T.border}`,
//                 borderRadius: 8, marginTop: 4, maxHeight: 200, overflowY: 'auto',
//                 zIndex: 100, listStyle: 'none', padding: 0,
//                 boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
//               }}>
//                 {vendors.filter(v => v.vendorFirmName.toLowerCase().includes(vendorSearch.toLowerCase()))
//                   .map((v, i) => (
//                     <li key={i}
//                       onClick={() => { setVendorSearch(v.vendorFirmName); setShowVendorList(false); }}
//                       style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: `1px solid ${T.borderLight}`, fontSize: 13 }}
//                       onMouseOver={e => e.target.style.background = `${T.gold}10`}
//                       onMouseOut={e => e.target.style.background = 'transparent'}
//                     >{v.vendorFirmName}</li>
//                   ))}
//               </ul>
//             )}
//           </div>

//           <div style={{ position: 'relative' }} ref={siteRef}>
//             <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.navyLight, marginBottom: 6 }}>Site Name</label>
//             <div style={{ position: 'relative' }}>
//               <input type="text" placeholder="Search Site..." value={siteSearch}
//                 onFocus={() => setShowSiteList(true)}
//                 onChange={(e) => setSiteSearch(e.target.value)}
//                 style={inputBase} onBlur={blurNormal}
//               />
//               <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: T.textMuted, pointerEvents: 'none' }} />
//             </div>
//             {showSiteList && (
//               <ul style={{
//                 position: 'absolute', top: '100%', left: 0, right: 0,
//                 background: T.card, border: `1px solid ${T.border}`,
//                 borderRadius: 8, marginTop: 4, maxHeight: 200, overflowY: 'auto',
//                 zIndex: 100, listStyle: 'none', padding: 0,
//                 boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
//               }}>
//                 {sites.filter(s => s.siteName.toLowerCase().includes(siteSearch.toLowerCase()))
//                   .map((s, i) => (
//                     <li key={i}
//                       onClick={() => { setSiteSearch(s.siteName); setShowSiteList(false); }}
//                       style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: `1px solid ${T.borderLight}`, fontSize: 13 }}
//                       onMouseOver={e => e.target.style.background = `${T.gold}10`}
//                       onMouseOut={e => e.target.style.background = 'transparent'}
//                     >{s.siteName}</li>
//                   ))}
//               </ul>
//             )}
//           </div>

//           <button onClick={() => handleFilter()} style={{
//             display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
//             padding: '10px 24px', borderRadius: 8, border: 'none',
//             background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
//             color: T.navyDark, fontSize: 13, fontWeight: 700,
//             cursor: 'pointer', height: 42, boxShadow: `0 2px 8px ${T.gold}40`,
//           }}>
//             <Search size={14} /> Filter
//           </button>
//         </div>
//       </div>

//       {/* Bills */}
//       {showData && (
//         <div>
//           <div style={{
//             display: 'flex', justifyContent: 'space-between', alignItems: 'center',
//             marginBottom: 16, padding: '10px 16px',
//             background: T.card, borderRadius: 8, border: `1px solid ${T.border}`,
//           }}>
//             <div style={{ fontSize: 18, fontWeight: 700, color: T.navy }}>
//               {vendorSearch}
//               <span style={{ color: T.textMuted, fontWeight: 400, marginLeft: 8 }}>
//                 | {siteSearch || "All Sites"}
//               </span>
//             </div>
//             <button onClick={() => { setShowData(false); setSelectedBills([]); setPaidAmounts({}); setRoundups({}); }}
//               style={{
//                 display: 'flex', alignItems: 'center', gap: 6,
//                 padding: '6px 14px', borderRadius: 6,
//                 border: `1px solid ${T.danger}40`, background: T.dangerBg,
//                 color: T.danger, fontSize: 12, fontWeight: 600, cursor: 'pointer',
//               }}>
//               <X size={12} /> Change
//             </button>
//           </div>

//           {filteredData.length === 0 && (
//             <div style={{
//               textAlign: 'center', padding: '60px 20px',
//               background: T.card, borderRadius: 10, border: `1px solid ${T.border}`,
//             }}>
//               <Package size={40} color={T.border} style={{ marginBottom: 12 }} />
//               <p style={{ fontSize: 15, color: T.textLight }}>No bills found</p>
//             </div>
//           )}

//           {filteredData.map((item) => {
//             const summary = getPaymentSummary(item);
//             const isSelected = selectedBills.includes(item.UID);
//             const fullyPaid = summary.fullyPaid;
//             const excessAdv = summary.excessAdvance;

//             return (
//               <div key={item.UID} style={{
//                 background: T.card, borderRadius: 10, padding: '20px', marginBottom: 16,
//                 border: `1px solid ${T.border}`,
//                 borderLeft: fullyPaid ? `6px solid ${T.purple}` : isSelected ? `6px solid ${T.success}` : `1px solid ${T.border}`,
//                 boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
//               }}>
//                 <div style={{
//                   display: 'flex', justifyContent: 'space-between',
//                   alignItems: 'flex-start', marginBottom: 16,
//                 }}>
//                   <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
//                     <div onClick={() => toggleBillSelection(item.UID)} style={{
//                       border: `2px solid ${isSelected ? T.success : T.border}`,
//                       borderRadius: 8, padding: '8px 14px', cursor: 'pointer',
//                       display: 'flex', alignItems: 'center', gap: 8,
//                       background: isSelected ? T.successBg : T.card,
//                     }}>
//                       <input type="checkbox" checked={isSelected} readOnly />
//                       <span style={{ fontWeight: 600, fontSize: 13 }}>Select</span>
//                     </div>
//                     <div>
//                       <h3 style={{ margin: 0, color: T.navy, fontSize: 16 }}>{item.siteName}</h3>
//                       <div style={{ fontSize: 13, color: T.textLight, marginTop: 4 }}>
//                         Invoice: <span style={{ background: `${T.navy}10`, color: T.navy, padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>{item.invoice13 || '—'}</span>
//                         {item.UID && <span style={{ marginLeft: 8 }}>UID: <strong>{item.UID}</strong></span>}
//                       </div>
//                     </div>
//                   </div>
//                   <div style={{ textAlign: 'right' }}>
//                     <div style={{ fontSize: 22, fontWeight: 800, color: T.success }}>
//                       Rs.{summary.netAmount.toLocaleString("en-IN")}
//                     </div>
//                     <div style={{ fontSize: 11, color: T.textMuted }}>Planned: {item.planned15}</div>
//                   </div>
//                 </div>

//                 {fullyPaid && (
//                   <div style={{
//                     marginBottom: 14, padding: '12px 16px', background: '#f3e8ff',
//                     borderRadius: 8, borderLeft: `4px solid ${T.purple}`,
//                     display: 'flex', alignItems: 'center', gap: 10,
//                   }}>
//                     <span style={{ fontSize: 20 }}>✅</span>
//                     <div>
//                       <div style={{ color: '#6b21a8', fontWeight: 700, fontSize: 14 }}>
//                         Fully Covered by Advance Payment
//                       </div>
//                       <div style={{ color: '#7c3aed', fontSize: 12, marginTop: 2 }}>
//                         Advance: Rs.{summary.advanceAmount.toLocaleString("en-IN")}
//                         {excessAdv > 0 && (
//                           <span style={{ marginLeft: 8, color: '#059669', fontWeight: 700 }}>
//                             | Excess: +Rs.{excessAdv.toLocaleString("en-IN")}
//                           </span>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 <div style={{
//                   display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
//                   gap: 14, borderTop: `1px solid ${T.border}`, paddingTop: 14,
//                 }}>
//                   <DetailItem label="MATERIAL TYPE" value={item.materialType} />
//                   <DetailItem label="VENDOR" value={item.vendorFirmName} />
//                   <DetailItem label="INVOICE NO" value={item.invoice13} color={T.navy} />
//                   <DetailItem label="BILL DATE" value={item.billDate} color={T.navy} />
//                   <DetailItem label="PO NUMBER" value={item.poNumber} />
//                   <DetailItem label="MRN NO" value={item.mrnNo} />
//                   <DetailItem label="PLANNED 15" value={item.planned15} />
//                   <DetailItem label="NET AMOUNT" value={`Rs.${summary.netAmount.toLocaleString("en-IN")}`} />
//                   <DetailItem label="Previous Paid" value={`Rs.${summary.previousPaid.toLocaleString("en-IN")}`} color={T.success} />
//                   {summary.advanceAmount > 0 && (
//                     <DetailItem label={fullyPaid ? "ADVANCE (FULL COVER)" : "ADVANCE"}
//                       value={`Rs.${summary.advanceAmount.toLocaleString("en-IN")}`}
//                       color={fullyPaid ? T.purple : "#e65100"} />
//                   )}
//                   {summary.advanceAmount > 0 && summary.effectiveAdvance !== summary.advanceAmount && (
//                     <DetailItem label="ADVANCE USED"
//                       value={`Rs.${summary.effectiveAdvance.toLocaleString("en-IN")}`} color={T.success} />
//                   )}
//                   {excessAdv > 0 && (
//                     <DetailItem label="EXCESS ADVANCE"
//                       value={`+Rs.${excessAdv.toLocaleString("en-IN")}`} color="#059669" />
//                   )}
//                   <DetailItem label="Balance"
//                     value={fullyPaid ? "Rs.0 (Fully Paid)" : `Rs.${summary.currentBalance.toLocaleString("en-IN")}`}
//                     color={fullyPaid ? T.purple : summary.currentBalance <= 0 ? T.danger : T.success} />
//                 </div>

//                 {summary.advanceAmount > 0 && !fullyPaid && (
//                   <div style={{
//                     marginTop: 12, padding: '10px 14px', background: T.warningBg,
//                     borderRadius: 8, borderLeft: `3px solid ${T.warning}`,
//                     display: 'flex', alignItems: 'center', gap: 8,
//                   }}>
//                     <span style={{ fontSize: 16 }}>⚡</span>
//                     <span style={{ color: '#92400e', fontWeight: 600, fontSize: 13 }}>
//                       Advance Rs.{summary.effectiveAdvance.toLocaleString("en-IN")} adjusted
//                       (Total: Rs.{summary.advanceAmount.toLocaleString("en-IN")})
//                     </span>
//                   </div>
//                 )}

//                 <div style={{
//                   marginTop: 14, display: 'flex', gap: 10,
//                   borderTop: `1px solid ${T.border}`, paddingTop: 12, flexWrap: 'wrap',
//                 }}>
//                   {item.finalIndentPDF && <DocLink label="Indent" url={item.finalIndentPDF} />}
//                   {item.poPDF && <DocLink label="PO" url={item.poPDF} />}
//                   {item.mrnPDF && <DocLink label="MRN" url={item.mrnPDF} />}
//                   {item.invoicePhoto && <DocLink label="Invoice" url={item.invoicePhoto} />}
//                 </div>

//                 {isSelected && (
//                   <div style={{
//                     marginTop: 20, padding: 16,
//                     background: fullyPaid ? '#f3e8ff' : T.successBg,
//                     borderRadius: 10, border: `1px solid ${fullyPaid ? '#c084fc' : T.successBorder}`,
//                   }}>
//                     <h4 style={{ margin: '0 0 14px', color: fullyPaid ? '#6b21a8' : '#065f46', fontSize: 14 }}>
//                       Payment — <strong>{item.invoice13}</strong> (UID: {item.UID})
//                       {fullyPaid && (
//                         <span style={{
//                           marginLeft: 10, background: T.purple, color: '#fff',
//                           padding: '2px 10px', borderRadius: 12, fontSize: 11,
//                         }}>FULLY PAID BY ADVANCE</span>
//                       )}
//                     </h4>

//                     <div style={{
//                       marginBottom: 14, padding: 12, background: `${T.navy}08`,
//                       borderRadius: 8, borderLeft: `3px solid ${fullyPaid ? T.purple : T.navy}`,
//                     }}>
//                       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, fontSize: 13 }}>
//                         <div><span style={{ color: T.textLight }}>Net Amount:</span> <strong style={{ color: T.navy }}>Rs.{summary.netAmount.toLocaleString("en-IN")}</strong></div>
//                         <div><span style={{ color: T.textLight }}>Previously Paid:</span> <strong style={{ color: T.success }}>Rs.{summary.previousPaid.toLocaleString("en-IN")}</strong></div>
//                         {summary.advanceAmount > 0 && (
//                           <>
//                             <div><span style={{ color: T.textLight }}>Total Advance:</span> <strong style={{ color: '#e65100' }}>Rs.{summary.advanceAmount.toLocaleString("en-IN")}</strong></div>
//                             <div><span style={{ color: T.textLight }}>Advance Used:</span> <strong style={{ color: T.purple }}>Rs.{summary.effectiveAdvance.toLocaleString("en-IN")}</strong></div>
//                             {excessAdv > 0 && (
//                               <div><span style={{ color: T.textLight }}>Excess Advance:</span> <strong style={{ color: '#059669' }}>+Rs.{excessAdv.toLocaleString("en-IN")}</strong></div>
//                             )}
//                           </>
//                         )}
//                         <div><span style={{ color: T.textLight }}>Balance:</span> <strong style={{ color: fullyPaid ? T.purple : T.danger }}>Rs.{summary.currentBalance.toLocaleString("en-IN")}{fullyPaid && " (Fully Covered)"}</strong></div>
//                         <div><span style={{ color: T.textLight }}>New Balance:</span> <strong style={{ color: summary.newBalance === 0 ? T.success : T.danger }}>Rs.{summary.newBalance.toLocaleString("en-IN")}</strong></div>
//                       </div>
//                     </div>

//                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
//                       <div>
//                         <label style={{ fontSize: 12, fontWeight: 600, color: T.navyLight, display: 'block', marginBottom: 4 }}>
//                           PAID AMOUNT {fullyPaid && <span style={{ marginLeft: 6, color: T.purple, fontSize: 10, fontWeight: 700 }}>(DISABLED)</span>}
//                         </label>
//                         <input type="number" step="0.01"
//                           value={paidAmounts[item.UID] || ""}
//                           onChange={(e) => handlePaidAmountChange(item.UID, e.target.value)}
//                           placeholder="0" min="0" max={summary.currentBalance}
//                           disabled={fullyPaid}
//                           style={{
//                             ...inputBase,
//                             border: `1.5px solid ${fullyPaid ? T.purple : T.success}`,
//                             background: fullyPaid ? '#f3e8ff' : T.borderLight,
//                             cursor: fullyPaid ? 'not-allowed' : 'text',
//                             opacity: fullyPaid ? 0.6 : 1,
//                           }} />
//                       </div>
//                       <div>
//                         <label style={{ fontSize: 12, fontWeight: 600, color: T.navyLight, display: 'block', marginBottom: 4 }}>
//                           ROUND OFF (+/-) {fullyPaid && <span style={{ marginLeft: 6, color: T.purple, fontSize: 10, fontWeight: 700 }}>(DISABLED)</span>}
//                         </label>
//                         <input type="number" step="0.01"
//                           value={roundups[item.UID] || ""}
//                           onChange={(e) => handleRoundupChange(item.UID, e.target.value)}
//                           placeholder="0" min="-9" max="9"
//                           disabled={fullyPaid}
//                           style={{
//                             ...inputBase,
//                             border: `1.5px solid ${fullyPaid ? T.purple : T.gold}`,
//                             background: fullyPaid ? '#f3e8ff' : T.borderLight,
//                             cursor: fullyPaid ? 'not-allowed' : 'text',
//                             opacity: fullyPaid ? 0.6 : 1,
//                           }} />
//                       </div>
//                       <div>
//                         <label style={{ fontSize: 12, fontWeight: 600, color: T.navyLight, display: 'block', marginBottom: 4 }}>NEW BALANCE</label>
//                         <input type="number" value={summary.newBalance} readOnly
//                           style={{
//                             ...inputBase,
//                             background: fullyPaid ? '#f3e8ff' : T.dangerBg,
//                             border: `1.5px solid ${fullyPaid ? T.purple : T.danger}`,
//                             fontWeight: 700, cursor: 'not-allowed',
//                           }} />
//                       </div>
//                     </div>

//                     <div style={{ marginTop: 12, height: 6, background: T.border, borderRadius: 3, overflow: 'hidden' }}>
//                       <div style={{
//                         height: '100%',
//                         background: fullyPaid ? `linear-gradient(90deg, ${T.purple}, #a78bfa)` : T.success,
//                         width: `${Math.min((summary.totalPaidAfter / summary.netAmount) * 100, 100)}%`,
//                         transition: 'width 0.3s',
//                       }} />
//                     </div>

//                     {!fullyPaid && (
//                       <button onClick={scrollToPaymentSection} style={{
//                         marginTop: 12, padding: '8px 18px', background: T.navy, color: T.gold,
//                         border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 12,
//                         display: 'flex', alignItems: 'center', gap: 6,
//                       }}>
//                         <ArrowDown size={13} /> Go to Payment Section
//                       </button>
//                     )}
//                   </div>
//                 )}
//               </div>
//             );
//           })}

//           {/* Grand Total */}
//           {selectedBills.length > 0 && (
//             <div style={{
//               background: T.successBg, padding: 16, borderRadius: 10, marginTop: 20,
//               border: `2px solid ${T.success}`,
//               display: 'flex', justifyContent: 'space-between', alignItems: 'center',
//             }}>
//               <h3 style={{ margin: 0, color: '#065f46', fontSize: 16 }}>Grand Total</h3>
//               <span style={{ fontSize: 24, fontWeight: 800, color: T.success }}>
//                 Rs.{grandTotal.toLocaleString("en-IN")}
//               </span>
//             </div>
//           )}

//           {/* Payment Details Section */}
//           {selectedBills.length > 0 && (
//             <div ref={paymentSectionRef} style={{
//               background: T.card, padding: 20, borderRadius: 10,
//               marginTop: 20, border: `1px solid ${T.border}`,
//             }}>
//               <h3 style={{ marginBottom: 16, color: T.navy, fontSize: 16 }}>
//                 Payment Details ({selectedBills.length} Bill{selectedBills.length > 1 ? 's' : ''})
//                 {hasAnyAdvanceBill && (
//                   <span style={{
//                     marginLeft: 10, background: '#f3e8ff', color: T.purple,
//                     padding: '4px 12px', borderRadius: 12, fontSize: 11, fontWeight: 700,
//                   }}>
//                     {allSelectedAreAdvance ? "ALL ADVANCE BILLS" : "MIXED (ADVANCE + NORMAL)"}
//                   </span>
//                 )}
//               </h3>

//               <div style={{
//                 display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
//                 gap: 12, marginBottom: 16,
//               }}>

//                 {/* BANK */}
//                 <div style={{ position: 'relative' }} ref={bankRef}>
//                   <label style={{ fontSize: 12, fontWeight: 600, color: T.navyLight, display: 'block', marginBottom: 4 }}>
//                     BANK <span style={{ color: T.danger }}>*</span>
//                     {accountLoading && (
//                       <Loader2 size={10} color={T.gold} style={{
//                         marginLeft: 6, animation: 'spin 1s linear infinite',
//                         display: 'inline-block', verticalAlign: 'middle',
//                       }} />
//                     )}
//                   </label>
//                   <div style={{ position: 'relative' }}>
//                     <input type="text"
//                       placeholder={accountLoading ? "Loading..." : "Search Bank..."}
//                       value={bankSearch} disabled={accountLoading}
//                       onFocus={() => setShowBankDropdown(true)}
//                       onChange={(e) => {
//                         setBankSearch(e.target.value);
//                         setShowBankDropdown(true);
//                         if (e.target.value === "") setBankDetails("");
//                       }}
//                       style={{
//                         ...inputBase, paddingRight: 36,
//                         cursor: accountLoading ? 'wait' : 'text',
//                         borderColor: bankDetails ? T.gold : T.border,
//                         background: bankDetails ? `${T.gold}08` : T.borderLight,
//                       }} />
//                     <ChevronDown size={14} style={{
//                       position: 'absolute', right: 12, top: '50%',
//                       transform: 'translateY(-50%)', color: T.textMuted, pointerEvents: 'none',
//                     }} />
//                   </div>
//                   {bankDetails && (
//                     <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
//                       <span style={{
//                         fontSize: 11, color: '#fff', background: T.navy,
//                         padding: '2px 8px', borderRadius: 4, fontWeight: 600,
//                       }}>✓ {bankDetails}</span>
//                       <button onClick={() => { setBankDetails(""); setBankSearch(""); }} style={{
//                         background: 'none', border: 'none', cursor: 'pointer',
//                         color: T.danger, fontSize: 11, display: 'flex', alignItems: 'center',
//                       }}><X size={11} /></button>
//                     </div>
//                   )}
//                   {showBankDropdown && !accountLoading && (
//                     <ul style={{
//                       position: 'absolute', top: '100%', left: 0, right: 0,
//                       background: T.card, border: `1px solid ${T.border}`,
//                       borderRadius: 8, marginTop: 4, maxHeight: 220, overflowY: 'auto',
//                       zIndex: 200, listStyle: 'none', padding: 0,
//                       boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
//                     }}>
//                       <li style={{
//                         padding: '6px 14px', fontSize: 11, color: T.textMuted,
//                         borderBottom: `1px solid ${T.borderLight}`, background: T.borderLight,
//                       }}>
//                         {accountNames.filter(n => n.toLowerCase().includes(bankSearch.toLowerCase())).length} accounts
//                       </li>
//                       {accountNames.filter(n => n.toLowerCase().includes(bankSearch.toLowerCase()))
//                         .map((name, i) => (
//                           <li key={i}
//                             onClick={() => { setBankDetails(name); setBankSearch(name); setShowBankDropdown(false); }}
//                             style={{
//                               padding: '10px 14px', cursor: 'pointer',
//                               borderBottom: `1px solid ${T.borderLight}`, fontSize: 13,
//                               background: bankDetails === name ? `${T.gold}15` : 'transparent',
//                               fontWeight: bankDetails === name ? 700 : 400,
//                               display: 'flex', alignItems: 'center', gap: 8,
//                             }}
//                             onMouseOver={e => { if (bankDetails !== name) e.currentTarget.style.background = `${T.gold}10`; }}
//                             onMouseOut={e => { if (bankDetails !== name) e.currentTarget.style.background = 'transparent'; }}
//                           >
//                             {bankDetails === name && <CheckCircle size={12} color={T.gold} />}
//                             {name}
//                           </li>
//                         ))}
//                       {accountNames.filter(n => n.toLowerCase().includes(bankSearch.toLowerCase())).length === 0 && (
//                         <li style={{ padding: '16px 14px', fontSize: 13, color: T.textMuted, textAlign: 'center' }}>No accounts</li>
//                       )}
//                     </ul>
//                   )}
//                 </div>

//                 {/* MODE */}
//                 <div>
//                   <label style={{ fontSize: 12, fontWeight: 600, color: T.navyLight, display: 'block', marginBottom: 4 }}>
//                     MODE {!allSelectedAreAdvance && <span style={{ color: T.danger }}>*</span>}
//                     {allSelectedAreAdvance && <span style={{ color: T.purple, fontSize: 10 }}> (Optional)</span>}
//                   </label>
//                   <select value={paymentMode}
//                     onChange={(e) => setPaymentMode(e.target.value)}
//                     style={{ ...inputBase, appearance: 'none', cursor: 'pointer' }}>
//                     <option value="">-- Select --</option>
//                     <option value="Cheque">Cheque</option>
//                     <option value="NEFT">NEFT</option>
//                     <option value="RTGS">RTGS</option>
//                   </select>
//                 </div>

//                 {/* ✅ PAYMENT DETAILS - Not required for advance bills */}
//                 <div>
//                   <label style={{ fontSize: 12, fontWeight: 600, color: T.navyLight, display: 'block', marginBottom: 4 }}>
//                     {paymentDetailsLabel} {!allSelectedAreAdvance && <span style={{ color: T.danger }}>*</span>}
//                     {allSelectedAreAdvance && <span style={{ color: T.purple, fontSize: 10 }}> (Optional)</span>}
//                   </label>
//                   <input type="text"
//                     placeholder={
//                       allSelectedAreAdvance
//                         ? "Optional for advance bills"
//                         : paymentMode === "Cheque"
//                           ? "Cheque Number"
//                           : "Details"
//                     }
//                     value={paymentDetails}
//                     onChange={(e) => setPaymentDetails(e.target.value)}
//                     style={inputBase} />
//                 </div>

//                 {/* DATE */}
//                 <div>
//                   <label style={{ fontSize: 12, fontWeight: 600, color: T.navyLight, display: 'block', marginBottom: 4 }}>
//                     PAYMENT DATE <span style={{ color: T.danger }}>*</span>
//                   </label>
//                   <input type="date" value={paymentDate}
//                     onChange={(e) => setPaymentDate(e.target.value)}
//                     style={inputBase} />
//                 </div>
//               </div>

//               {/* Note */}
//               <div style={{
//                 padding: 12, background: T.warningBg, borderRadius: 8,
//                 border: `1px solid ${T.gold}40`, marginBottom: 16, fontSize: 12, color: '#92400e',
//               }}>
//                 <strong>⚠️ Note:</strong> H = Current Paid • P = Advance • I = Balance
//                 {hasAnyAdvanceBill && (
//                   <span style={{ marginLeft: 8, color: T.purple, fontWeight: 700 }}>
//                     | Advance bills: G = Net Amount, H = Empty, DH = 0
//                   </span>
//                 )}
//               </div>

//               <button disabled={submitting} onClick={handleSubmit} style={{
//                 display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
//                 padding: '14px 40px', borderRadius: 8, border: 'none',
//                 background: submitting ? T.border : `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
//                 color: submitting ? T.textMuted : T.navyDark,
//                 fontSize: 16, fontWeight: 700,
//                 cursor: submitting ? 'not-allowed' : 'pointer',
//                 boxShadow: submitting ? 'none' : `0 2px 8px ${T.gold}40`,
//               }}>
//                 {submitting ? (
//                   <><Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> Submitting...</>
//                 ) : (
//                   <><CheckCircle size={16} /> SUBMIT ALL PAYMENT DATA</>
//                 )}
//               </button>
//             </div>
//           )}
//         </div>
//       )}

//       <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
//     </div>
//   );
// };

// const DetailItem = ({ label, value, color = '#333' }) => (
//   <div>
//     <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, marginBottom: 3 }}>{label}</div>
//     <div style={{ fontSize: 13, fontWeight: 600, color }}>{value || '—'}</div>
//   </div>
// );

// const DocLink = ({ label, url }) => (
//   <a href={url} target="_blank" rel="noopener noreferrer" style={{
//     display: 'inline-flex', alignItems: 'center', gap: 4,
//     padding: '4px 10px', borderRadius: 5,
//     background: '#1e293b', color: '#fbbf24',
//     fontSize: 11, fontWeight: 700, textDecoration: 'none',
//   }}>
//     <FileText size={11} /> {label}
//   </a>
// );

// export default Payment15;