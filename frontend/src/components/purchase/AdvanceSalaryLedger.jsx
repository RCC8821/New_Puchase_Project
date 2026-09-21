import React, { useState, useMemo } from 'react';
import {
  useGetAdvanceSalaryListQuery,
  useDeductSalaryMutation,
} from '../../redux/advanceSlice';

const AdvanceSalaryLedger = ({ onClose }) => {
  const {
    data: ledgerData,
    isLoading,
    isError,
    refetch,
  } = useGetAdvanceSalaryListQuery();

  const [deductSalary, { isLoading: deducting }] = useDeductSalaryMutation();

  // ── Filter States ────────────────────────────────
  const [searchSite, setSearchSite] = useState('');
  const [searchEmployee, setSearchEmployee] = useState('');

  // ── Deduct Modal State ───────────────────────────
  const [showDeductModal, setShowDeductModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [deductForm, setDeductForm] = useState({
    deductAmount: '',
    month: '',
    remark: '',
  });
  const [deductErrors, setDeductErrors] = useState({});
  const [deductMsg, setDeductMsg] = useState('');

  const records = ledgerData?.data || [];

  // ── Month Dropdown Options ───────────────────────
  const monthOptions = [
    'January-2025', 'February-2025', 'March-2025', 'April-2025',
    'May-2025', 'June-2025', 'July-2025', 'August-2025',
    'September-2025', 'October-2025', 'November-2025', 'December-2025',
    'January-2026', 'February-2026', 'March-2026', 'April-2026',
    'May-2026', 'June-2026', 'July-2026', 'August-2026',
    'September-2026', 'October-2026', 'November-2026', 'December-2026',
  ];

  // ── Universal Number Cleaner & INR Formatter ─────
  const cleanNumber = (val) => {
    if (val === null || val === undefined || val === '') return 0;
    const str = String(val).replace(/[^0-9.-]/g, '').trim();
    const num = parseFloat(str);
    return isNaN(num) ? 0 : num;
  };

  const fmt = (n) => {
    const num = cleanNumber(n);
    return `₹${num.toLocaleString('en-IN')}`;
  };

  // ── Filter Records ───────────────────────────────
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      if (
        rec.uid?.toLowerCase() === 'uid' ||
        rec.employeeName?.toLowerCase() === 'employee_name' ||
        rec.siteName?.toLowerCase() === 'site name'
      ) {
        return false;
      }

      const siteMatch = rec.siteName?.toLowerCase().includes(searchSite.toLowerCase());
      const empMatch = rec.employeeName?.toLowerCase().includes(searchEmployee.toLowerCase());
      return siteMatch && empMatch;
    });
  }, [records, searchSite, searchEmployee]);

  // ── Open Deduct Modal ────────────────────────────
  const handleOpenDeduct = (record) => {
    setSelectedRecord(record);
    setDeductForm({ deductAmount: '', month: '', remark: '' });
    setDeductErrors({});
    setDeductMsg('');
    setShowDeductModal(true);
  };

  // ── Deduct Input Change ──────────────────────────
  const handleDeductChange = (e) => {
    const { name, value } = e.target;
    setDeductForm((prev) => ({ ...prev, [name]: value }));
    setDeductErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // ── Submit Deduction ─────────────────────────────
  const handleDeductSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!deductForm.deductAmount) errs.deductAmount = 'Amount required';
    if (!deductForm.month)        errs.month = 'Month required';

    const amt = cleanNumber(deductForm.deductAmount);
    if (amt <= 0) {
      errs.deductAmount = 'Please enter a valid amount';
    } else if (amt > selectedRecord.balanceAmount) {
      errs.deductAmount = `Cannot deduct more than balance ${fmt(selectedRecord.balanceAmount)}`;
    }

    if (Object.keys(errs).length > 0) {
      setDeductErrors(errs);
      return;
    }

    try {
      const payload = {
        uid: selectedRecord.uid,
        siteName: selectedRecord.siteName,
        employeeName: selectedRecord.employeeName,
        deductAmount: amt,
        month: deductForm.month,
        remark: deductForm.remark,
      };
      const result = await deductSalary(payload).unwrap();
      setDeductMsg(`✅ ${result.message}`);
      setTimeout(() => {
        setShowDeductModal(false);
        refetch();
      }, 1200);
    } catch (err) {
      setDeductMsg(`❌ ${err?.data?.message || 'Error saving deduction'}`);
    }
  };

  // ============================================================
  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>📊 Advance Salary Ledger</h2>
            <p style={styles.subtitle}>
              {filteredRecords.length} record{filteredRecords.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>✕ Close</button>
        </div>

        {/* Filters */}
        <div style={styles.filterRow}>
          <input
            type="text"
            placeholder="🔍 Filter by Site Name..."
            value={searchSite}
            onChange={(e) => setSearchSite(e.target.value)}
            style={styles.filterInput}
          />
          <input
            type="text"
            placeholder="🔍 Filter by Employee Name..."
            value={searchEmployee}
            onChange={(e) => setSearchEmployee(e.target.value)}
            style={styles.filterInput}
          />
          <button onClick={() => refetch()} style={styles.refreshBtn}>
            🔄 Refresh
          </button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div style={styles.loaderBox}>
            <div style={styles.loader}></div>
            <p>Loading ledger data...</p>
          </div>
        )}

        {/* Error */}
        {isError && (
          <div style={styles.errorBox}>
            ❌ Failed to load data
          </div>
        )}

        {/* Table */}
        {!isLoading && !isError && (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thRow}>
                  <th style={styles.th}>UID</th>
                  <th style={styles.th}>Timestamp</th>
                  <th style={styles.th}>Site</th>
                  <th style={styles.th}>Employee</th>
                  <th style={styles.th}>Advance</th>
                  <th style={styles.th}>Deducted</th>
                  <th style={styles.th}>Balance</th>
                  <th style={styles.th}>Bank</th>
                  <th style={styles.th}>Mode</th>
                  <th style={styles.th}>Pay Date</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan="11" style={styles.emptyRow}>
                      No records found
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((rec, i) => (
                    <tr key={i} style={styles.tr}>
                      <td style={styles.tdBold}>{rec.uid || '—'}</td>
                      <td style={styles.tdSmall}>{rec.timestamp}</td>
                      <td style={styles.td}>{rec.siteName}</td>
                      <td style={{...styles.td, fontWeight: 700}}>{rec.employeeName}</td>
                      
                      {/* ✅ FULL ADVANCE AMOUNT */}
                      <td style={{...styles.tdAmount, color: '#2563eb'}}>
                        {fmt(rec.advanceAmount)}
                      </td>
                      
                      {/* ✅ FULL DEDUCTED AMOUNT */}
                      <td style={{...styles.tdAmount, color: '#dc2626'}}>
                        {fmt(rec.totalDeducted)}
                      </td>

                      {/* ✅ FULL BALANCE AMOUNT */}
                      <td style={{
                        ...styles.tdAmount,
                        color: rec.balanceAmount <= 0 ? '#059669' : '#d97706',
                        background: rec.balanceAmount <= 0 ? '#ecfdf5' : '#fffbeb',
                      }}>
                        {fmt(rec.balanceAmount)}
                        {rec.balanceAmount <= 0 && ' ✓'}
                      </td>

                      <td style={styles.tdSmall}>{rec.bankDetails}</td>
                      <td style={styles.tdSmall}>{rec.paymentMode}</td>
                      <td style={styles.tdSmall}>{rec.paymentDate}</td>
                      <td style={styles.td}>
                        <button
                          onClick={() => handleOpenDeduct(rec)}
                          disabled={rec.balanceAmount <= 0}
                          style={{
                            ...styles.deductBtn,
                            opacity: rec.balanceAmount <= 0 ? 0.4 : 1,
                            cursor: rec.balanceAmount <= 0 ? 'not-allowed' : 'pointer',
                          }}
                        >
                          💸 Deduct
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* DEDUCT MODAL */}
      {/* ============================================================ */}
      {showDeductModal && selectedRecord && (
        <div style={styles.overlay2}>
          <div style={styles.deductModal}>
            <div style={styles.header}>
              <div>
                <h3 style={{margin: 0, color: '#1e293b'}}>💸 Deduct Salary</h3>
                <p style={{margin: '4px 0 0', fontSize: 13, color: '#64748b'}}>
                  {selectedRecord.employeeName} | {selectedRecord.siteName}
                </p>
              </div>
              <button onClick={() => setShowDeductModal(false)} style={styles.closeBtn}>✕</button>
            </div>

            {/* Info Box */}
            <div style={styles.infoBox}>
              <div style={styles.infoRow}>
                <span>Total Advance:</span>
                <strong style={{color: '#2563eb'}}>{fmt(selectedRecord.advanceAmount)}</strong>
              </div>
              <div style={styles.infoRow}>
                <span>Already Deducted:</span>
                <strong style={{color: '#dc2626'}}>{fmt(selectedRecord.totalDeducted)}</strong>
              </div>
              <div style={{...styles.infoRow, borderTop: '1px dashed #cbd5e1', paddingTop: 8}}>
                <span>Balance Due:</span>
                <strong style={{color: '#d97706', fontSize: 18}}>
                  {fmt(selectedRecord.balanceAmount)}
                </strong>
              </div>
            </div>

            <form onSubmit={handleDeductSubmit} style={{display: 'flex', flexDirection: 'column', gap: 14}}>

              {/* Auto-fill Fields */}
              <div style={styles.row2}>
                <div>
                  <label style={styles.lbl}>UID</label>
                  <input value={selectedRecord.uid} readOnly style={{...styles.inp, background: '#f1f5f9'}} />
                </div>
                <div>
                  <label style={styles.lbl}>Site</label>
                  <input value={selectedRecord.siteName} readOnly style={{...styles.inp, background: '#f1f5f9'}} />
                </div>
              </div>

              <div>
                <label style={styles.lbl}>Employee</label>
                <input value={selectedRecord.employeeName} readOnly style={{...styles.inp, background: '#f1f5f9'}} />
              </div>

              {/* Deduct Amount */}
              <div>
                <label style={styles.lbl}>
                  Deduct Amount <span style={{color: '#dc2626'}}>*</span>
                </label>
                <input
                  type="number"
                  name="deductAmount"
                  value={deductForm.deductAmount}
                  onChange={handleDeductChange}
                  placeholder="Enter amount to deduct"
                  style={{
                    ...styles.inp,
                    borderColor: deductErrors.deductAmount ? '#dc2626' : '#cbd5e1',
                  }}
                />
                {deductErrors.deductAmount && (
                  <span style={styles.err}>{deductErrors.deductAmount}</span>
                )}
              </div>

              {/* Month Dropdown */}
              <div>
                <label style={styles.lbl}>
                  Salary Month <span style={{color: '#dc2626'}}>*</span>
                </label>
                <select
                  name="month"
                  value={deductForm.month}
                  onChange={handleDeductChange}
                  style={{
                    ...styles.inp,
                    borderColor: deductErrors.month ? '#dc2626' : '#cbd5e1',
                  }}
                >
                  <option value="">-- Select Month --</option>
                  {monthOptions.map((m, i) => (
                    <option key={i} value={m}>{m}</option>
                  ))}
                </select>
                {deductErrors.month && (
                  <span style={styles.err}>{deductErrors.month}</span>
                )}
              </div>

              {/* Remark */}
              <div>
                <label style={styles.lbl}>Remark (Optional)</label>
                <textarea
                  name="remark"
                  value={deductForm.remark}
                  onChange={handleDeductChange}
                  rows="2"
                  placeholder="Any note..."
                  style={{...styles.inp, resize: 'vertical'}}
                />
              </div>

              {/* Message */}
              {deductMsg && (
                <div style={{
                  padding: 10, borderRadius: 8, fontSize: 13, fontWeight: 600,
                  background: deductMsg.startsWith('✅') ? '#ecfdf5' : '#fef2f2',
                  color: deductMsg.startsWith('✅') ? '#059669' : '#dc2626',
                }}>
                  {deductMsg}
                </div>
              )}

              {/* Buttons */}
              <div style={{display: 'flex', gap: 10, justifyContent: 'flex-end'}}>
                <button
                  type="button"
                  onClick={() => setShowDeductModal(false)}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deducting}
                  style={{
                    ...styles.saveBtn,
                    opacity: deducting ? 0.6 : 1,
                    cursor: deducting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {deducting ? '⏳ Saving...' : '💾 Save Deduction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// ==================== Styles ====================
const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(15, 23, 42, 0.75)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 9999, padding: 20,
  },
  overlay2: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(15, 23, 42, 0.7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 10000, padding: 20,
  },
  modal: {
    background: '#fff', borderRadius: 16, padding: 24,
    width: '100%', maxWidth: 1250, maxHeight: '90vh',
    overflow: 'hidden', display: 'flex', flexDirection: 'column',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  deductModal: {
    background: '#fff', borderRadius: 12, padding: 20,
    width: '100%', maxWidth: 550,
    boxShadow: '0 10px 40px rgba(0,0,0,0.25)',
    maxHeight: '90vh', overflowY: 'auto',
  },
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16,
    paddingBottom: 12, borderBottom: '2px solid #f1f5f9',
  },
  title: { margin: 0, fontSize: 22, fontWeight: 700, color: '#1e293b' },
  subtitle: { margin: '4px 0 0', fontSize: 13, color: '#64748b' },
  closeBtn: {
    background: '#fef2f2', border: '1px solid #fecaca',
    color: '#dc2626', padding: '6px 14px', borderRadius: 8,
    cursor: 'pointer', fontWeight: 600, fontSize: 13,
  },
  filterRow: {
    display: 'grid', gridTemplateColumns: '1fr 1fr auto',
    gap: 10, marginBottom: 14,
  },
  filterInput: {
    padding: '10px 14px', borderRadius: 8,
    border: '1.5px solid #cbd5e1', fontSize: 13, outline: 'none',
  },
  refreshBtn: {
    padding: '10px 18px', background: '#1e293b', color: '#fbbf24',
    border: 'none', borderRadius: 8, cursor: 'pointer',
    fontWeight: 600, fontSize: 13,
  },
  loaderBox: { textAlign: 'center', padding: 40 },
  loader: {
    width: 40, height: 40, border: '4px solid #f1f5f9',
    borderTop: '4px solid #2563eb', borderRadius: '50%',
    margin: '0 auto 12px', animation: 'spin 0.8s linear infinite',
  },
  errorBox: {
    padding: 16, background: '#fef2f2', color: '#dc2626',
    borderRadius: 8, textAlign: 'center', fontWeight: 600,
  },
  tableWrap: {
    overflowX: 'auto', overflowY: 'auto',
    border: '1px solid #e2e8f0', borderRadius: 8, flex: 1,
  },
  table: {
    width: '100%', borderCollapse: 'collapse', fontSize: 12,
    minWidth: 1100,
  },
  thRow: {
    background: 'linear-gradient(135deg, #1e293b, #334155)',
    color: '#fbbf24',
  },
  th: {
    padding: '12px 10px', textAlign: 'left', fontWeight: 700,
    fontSize: 11, textTransform: 'uppercase', position: 'sticky',
    top: 0, background: 'inherit',
  },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '10px 10px', fontSize: 12, color: '#1e293b' },
  tdBold: { padding: '10px 10px', fontSize: 12, color: '#1e293b', fontWeight: 700 },
  tdAmount: {
    padding: '10px 10px', fontSize: 13, fontWeight: 800,
    whiteSpace: 'nowrap', // Keeps large numbers on single line
  },
  tdSmall: { padding: '10px 10px', fontSize: 11, color: '#64748b' },
  emptyRow: { textAlign: 'center', padding: 30, color: '#94a3b8' },
  deductBtn: {
    padding: '6px 12px', background: '#f59e0b', color: '#1e293b',
    border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 11,
  },
  infoBox: {
    background: '#f8fafc', padding: 12, borderRadius: 8,
    border: '1px solid #e2e8f0', marginBottom: 16,
    display: 'flex', flexDirection: 'column', gap: 6,
  },
  infoRow: {
    display: 'flex', justifyContent: 'space-between',
    fontSize: 13, color: '#334155',
  },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  lbl: { fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 },
  inp: {
    width: '100%', padding: '10px 12px', borderRadius: 8,
    border: '1.5px solid #cbd5e1', fontSize: 13, outline: 'none',
    boxSizing: 'border-box', background: '#fafafa',
  },
  err: { fontSize: 11, color: '#dc2626', marginTop: 3 },
  cancelBtn: {
    padding: '10px 20px', background: '#f1f5f9', color: '#475569',
    border: '1px solid #cbd5e1', borderRadius: 8, cursor: 'pointer', fontWeight: 600,
  },
  saveBtn: {
    padding: '10px 24px', background: 'linear-gradient(135deg, #2ecc71, #27ae60)',
    color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700,
  },
};

export default AdvanceSalaryLedger;