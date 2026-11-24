


import React, { useState } from 'react';
import { useGetAdvanceDropdownDataQuery, usePostAdvancePaymentMutation } from '../../redux/advanceSlice';
import AdvanceSalaryLedger from './AdvanceSalaryLedger'; // <-- Imported Ledger Component

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
  // Form & View State
  // ============================================================
  const initialState = {
    expHead: '', // Exp Head State
    siteName: '',
    vendorFirmName: '', // Holds Vendor name OR Employee name depending on expHead
    paidAmount: '',
    bankDetails: '',
    paymentMode: '',
    paymentDetails: '',
    paymentDate: '',
  };

  const [formData, setFormData]     = useState(initialState);
  const [errors, setErrors]         = useState({});
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg]     = useState('');
  const [showLedger, setShowLedger] = useState(false); // <-- Toggle State for Ledger Modal

  // ── Bank Dropdown State ──────────────────────────────────────
  const [bankSearch, setBankSearch]             = useState('');
  const [showBankDropdown, setShowBankDropdown] = useState(false);

  // ── Dropdown Options from API ────────────────────────────────
  const siteNames   = dropdownData?.data?.siteNames   || [];
  const vendorFirms = dropdownData?.data?.vendorFirms || [];
  const Banks       = dropdownData?.data?.Banks       || [];
  const employees   = dropdownData?.data?.employees   || []; // Fetched Column D Employees

  // ============================================================
  // Exp. Head Options
  // ============================================================
  const expHeadOptions = [
    'Purchase',
    'Contractor',
    'Advnce Salary',
    'Advance Petty Cash'
  ];

  // ============================================================
  // Handle Input Change
  // ============================================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear Vendor/Employee field if Exp Head changes
    if (name === 'expHead') {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        vendorFirmName: '', // Exp Head badalne par dropdown clear ho jayega
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

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
    if (!formData.expHead)        newErrors.expHead        = 'Exp. Head is required';
    if (!formData.siteName)       newErrors.siteName       = 'Site Name is required';
    if (!formData.paidAmount)     newErrors.paidAmount     = 'Paid Amount is required';
    if (!formData.bankDetails)    newErrors.bankDetails    = 'Bank Details is required';
    if (!formData.paymentMode)    newErrors.paymentMode    = 'Payment Mode is required';
    if (!formData.paymentDetails) newErrors.paymentDetails = 'Payment Details is required';
    if (!formData.paymentDate)    newErrors.paymentDate    = 'Payment Date is required';

    if (!formData.vendorFirmName) {
      newErrors.vendorFirmName = formData.expHead === 'Advnce Salary'
        ? 'Employee Name is required'
        : 'Vendor Firm Name is required';
    }

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
  // Dynamic Configuration based on Exp. Head
  // ============================================================
  const isAdvanceSalary = formData.expHead === 'Advnce Salary';
  const secondDropdownLabel = isAdvanceSalary ? 'Employee Name' : 'Vendor Firm Name';
  const secondDropdownPlaceholder = isAdvanceSalary ? '-- Select Employee --' : '-- Select Vendor Firm --';
  const secondDropdownOptions = isAdvanceSalary ? employees : vendorFirms;

  // ============================================================
  // Render
  // ============================================================
  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>

        {/* ── Header ── */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.headerTitle}>💰 Advance Payment Form</h2>
            <p style={styles.headerSubtitle}>Fill in the details to submit advance payment</p>
          </div>

          {/* 📊 Ledger Button in Header Row for perfect alignment */}
          <button
            type="button"
            onClick={() => setShowLedger(true)}
            style={styles.ledgerButton}
          >
            📊 View Salary Ledger
          </button>
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

          {/* ── Row 1: EXPENSE HEAD (Placed at the very top, full width) ── */}
          <div style={styles.topRow}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Expense Head (Exp. Head) <span style={styles.required}>*</span>
              </label>
              <select
                name="expHead"
                value={formData.expHead}
                onChange={handleChange}
                style={{
                  ...styles.select,
                  borderColor: errors.expHead ? '#e74c3c' : '#bdc3c7',
                  background: '#fcfcfc',
                  fontWeight: '600',
                }}
              >
                <option value="">-- Select Expense Head --</option>
                {expHeadOptions.map((head, index) => (
                  <option key={index} value={head}>{head}</option>
                ))}
              </select>
              {errors.expHead && (
                <span style={styles.errorMsg}>{errors.expHead}</span>
              )}
            </div>
          </div>

          {/* ── Row 2: Site Name + Dynamic Second Dropdown (Vendor / Employee) ── */}
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

            {/* Dynamic Second Dropdown (Vendor Firm Name OR Employee Name) */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                {secondDropdownLabel} <span style={styles.required}>*</span>
              </label>
              <select
                name="vendorFirmName"
                value={formData.vendorFirmName}
                onChange={handleChange}
                disabled={!formData.expHead}
                style={{
                  ...styles.select,
                  borderColor: errors.vendorFirmName ? '#e74c3c' : '#ddd',
                  background: !formData.expHead ? '#f3f4f6' : '#fafafa',
                  cursor: !formData.expHead ? 'not-allowed' : 'pointer',
                }}
              >
                <option value="">{formData.expHead ? secondDropdownPlaceholder : '-- Choose Exp Head First --'}</option>
                {secondDropdownOptions.map((item, index) => (
                  <option key={index} value={item}>{item}</option>
                ))}
              </select>
              {errors.vendorFirmName && (
                <span style={styles.errorMsg}>{errors.vendorFirmName}</span>
              )}
            </div>

          </div>

          {/* ── Row 3: Paid Amount + Bank Details ── */}
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

            {/* Bank Details Search Dropdown */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Bank Details <span style={styles.required}>*</span>
              </label>

              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Search or Select Bank..."
                  value={bankSearch}
                  onFocus={() => setShowBankDropdown(true)}
                  onBlur={() => setTimeout(() => setShowBankDropdown(false), 180)}
                  onChange={(e) => {
                    setBankSearch(e.target.value);
                    setShowBankDropdown(true);
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

                <span style={styles.chevron}>
                  {showBankDropdown ? '▲' : '▼'}
                </span>

                {showBankDropdown && (
                  <ul style={styles.dropdownList}>
                    <li style={styles.dropdownCount}>
                      {filteredBanks.length} bank{filteredBanks.length !== 1 ? 's' : ''} found
                    </li>

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

              {errors.bankDetails && (
                <span style={styles.errorMsg}>{errors.bankDetails}</span>
              )}
            </div>

          </div>

          {/* ── Row 4: Payment Mode + Payment Date ── */}
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

          {/* ── Row 5: Payment Details ── */}
          <div style={styles.rowSingle}>
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
          </div>

          {/* ── Action Buttons ── */}
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

      {/* ── Conditionally Rendered Ledger Modal ── */}
      {showLedger && (
        <AdvanceSalaryLedger onClose={() => setShowLedger(false)} />
      )}

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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '15px',
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
  ledgerButton: {
    padding: '10px 18px',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    color: '#ffffff',
    fontWeight: '700',
    fontSize: '13px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
    transition: 'all 0.2s ease',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  topRow: {
    width: '100%',
    background: '#f8fafc',
    padding: '16px',
    borderRadius: '10px',
    border: '1px dashed #cbd5e1',
    boxSizing: 'border-box',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  rowSingle: {
    display: 'block',
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
    transition: 'all 0.2s ease',
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