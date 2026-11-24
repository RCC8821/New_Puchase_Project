import React, { useMemo, useState } from 'react';
import {
  useGetPettyCashPersonsQuery,
  useGetPettyCashLedgerQuery,
  usePostPettyCashBillMutation,
} from '../../redux/advanceSlice';
import { formatINR, compressImage, StatusBadge, PhotoLink } from './pettyCashUtils';

const emptyBill = {
  siteName: '',
  billNo: '',
  billDate: '',
  netAmount: '',
  workDescription: '',
  remarks: '',
  materialPhoto: '', // base64
  billPhoto: '',     // base64
};

const AdvancePettyCash = () => {
  // ── Login User ───────────────────────────────────────────────
  const userType = (sessionStorage.getItem('userType') || '').trim();
  const isAdmin = userType.toLowerCase() === 'admin';

  // Admin kisi ko bhi select kar sakta hai, baaki user = apna login naam (lock)
  const [adminSelected, setAdminSelected] = useState('');
  const selectedPerson = isAdmin ? adminSelected : userType;

  const [tab, setTab] = useState('entry');
  const [bill, setBill] = useState(emptyBill);
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [compressing, setCompressing] = useState('');

  // ── RTK Query ────────────────────────────────────────────────
  const { data: personsRes, isLoading: personsLoading } =
    useGetPettyCashPersonsQuery(undefined, { skip: !isAdmin });

  const { data: ledgerRes, isFetching: ledgerLoading, isError: ledgerError } =
    useGetPettyCashLedgerQuery(selectedPerson, { skip: !selectedPerson });

  const [postPettyCashBill, { isLoading: submitting }] = usePostPettyCashBillMutation();

  const persons = personsRes?.data || [];
  const ledger = selectedPerson ? ledgerRes?.data : null;
  const balance = ledger?.balance ?? 0;
  const hasAdvance = (ledger?.advances?.length || 0) > 0;

  // ── Advance wali sites (lock ke liye) ────────────────────────
  const advanceSites = useMemo(
    () => [...new Set((ledger?.advances || []).map((a) => String(a.siteName || '').trim()).filter(Boolean))],
    [ledger]
  );
  const siteLocked = advanceSites.length === 1;
  const effectiveSite = siteLocked ? advanceSites[0] : bill.siteName;

  const willExceed = ledger && bill.netAmount && Number(bill.netAmount) > balance;

  // ── Handlers ─────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setBill((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handlePhoto = async (e, key) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      setCompressing(key);
      const dataUrl = await compressImage(file);
      setBill((prev) => ({ ...prev, [key]: dataUrl }));
      setErrors((prev) => ({ ...prev, [key]: '' }));
    } catch (err) {
      setErrors((prev) => ({ ...prev, [key]: err.message }));
    } finally {
      setCompressing('');
    }
  };

  const validate = () => {
    const er = {};
    if (!effectiveSite) er.siteName = 'Site Name is required';
    if (!bill.billNo) er.billNo = 'Bill No. is required';
    if (!bill.billDate) er.billDate = 'Bill Date is required';
    if (!bill.netAmount || Number(bill.netAmount) <= 0) er.netAmount = 'Valid Net Amount is required';
    if (!bill.workDescription) er.workDescription = 'Work Description is required';
    if (!bill.billPhoto) er.billPhoto = 'Bill Photo is required';
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    if (!selectedPerson) {
      setMsg({ type: 'error', text: '❌ Pehle Person select karo' });
      return;
    }
    if (!validate()) {
      setMsg({ type: 'error', text: '❌ Laal wale fields bharo' });
      return;
    }

    try {
      const result = await postPettyCashBill({
        ...bill,
        siteName: effectiveSite,
        personName: selectedPerson,
      }).unwrap();
      setMsg({ type: 'success', text: `✅ ${result.message}` });
      setBill(emptyBill);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setMsg({ type: 'error', text: `❌ Error: ${err?.data?.message || 'Something went wrong'}` });
    }
  };

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="pc-page">
      <div className="pc-container">

        {/* Header */}
        <div className="pc-header">
          <div>
            <h2 className="pc-title">🧾 Advance Petty Cash</h2>
            <p className="pc-subtitle">Jahan kharch karo uska bill bharo — advance me se apne aap adjust hoga</p>
          </div>
          {!isAdmin && selectedPerson && <span className="pc-user-badge">👤 {selectedPerson}</span>}
        </div>

        {/* Person select — sirf Admin ke liye */}
        {isAdmin && (
          <div className="pc-person-box">
            <label className="pc-label">Person (jisko advance diya) <span className="pc-req">*</span></label>
            <select
              className="pc-input"
              value={adminSelected}
              onChange={(e) => { setAdminSelected(e.target.value); setMsg({ type: '', text: '' }); setBill(emptyBill); setErrors({}); }}
              disabled={personsLoading}
            >
              <option value="">{personsLoading ? 'Loading...' : '-- Select Person --'}</option>
              {persons.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        )}

        {msg.text && <div className={msg.type === 'success' ? 'pc-alert pc-alert-success' : 'pc-alert pc-alert-error'}>{msg.text}</div>}
        {selectedPerson && ledgerError && <div className="pc-alert pc-alert-error">❌ Data load nahi hua. Page refresh karo.</div>}

        {selectedPerson && ledgerLoading && !ledger && <p className="pc-empty">⏳ Loading...</p>}

        {selectedPerson && ledger && (
          <>
            {/* Summary */}
            <div className="pc-cards">
              <Card label="Advance Mila" value={formatINR(ledger.totalAdvance)} color="#1d4ed8" border="#93c5fd" />
              <Card label="Kharch" value={formatINR(ledger.totalBills)} color="#c2410c" border="#fdba74" />
              <Card
                label="Balance"
                value={formatINR(balance)}
                color={balance < 0 ? '#b91c1c' : '#15803d'}
                border={balance < 0 ? '#fca5a5' : '#86efac'}
                note={balance < 0 ? 'Advance se zyada kharch' : ''}
              />
              <Card label="Check Pending" value={`${ledger.pendingCount || 0} bill`} color="#a16207" border="#fde047" />
            </div>

            {/* Tabs */}
            <div className="pc-tabs">
              {[
                ['entry', '➕ Bill Entry'],
                ['bills', `📄 Bills (${ledger.bills?.length || 0})`],
                ['advances', `💰 Advance (${ledger.advances?.length || 0})`],
              ].map(([key, label]) => (
                <button key={key} type="button" onClick={() => setTab(key)} className={`pc-tab ${tab === key ? 'pc-tab-active' : ''}`}>
                  {label}
                </button>
              ))}
            </div>

            {/* ── Bill Entry ── */}
            {tab === 'entry' && (
              !hasAdvance ? (
                <div className="pc-alert pc-alert-warn">
                  ⚠️ Aapko abhi tak koi Advance Petty Cash nahi mila hai. Advance milne ke baad yahan bill bhar paoge.
                </div>
              ) : (
                               <form onSubmit={handleSubmit} className="pc-form">
                  <div className="pc-row">
                    <Field label={siteLocked ? 'Site Name 🔒' : 'Site Name'} error={errors.siteName}>
                      {siteLocked ? (
                        <input className="pc-input pc-locked" value={advanceSites[0]} disabled />
                      ) : (
                        <select name="siteName" value={bill.siteName} onChange={handleChange} className={`pc-input ${errors.siteName ? 'pc-input-error' : ''}`}>
                          <option value="">-- Select Site --</option>
                          {advanceSites.map((site) => <option key={site} value={site}>{site}</option>)}
                        </select>
                      )}
                    </Field>
                    <Field label="Vendor Firm Name 🔒" optional>
                      <input className="pc-input pc-locked" value={selectedPerson} disabled />
                    </Field>
                  </div>

                  <div className="pc-row">
                    <Field label="Bill No." error={errors.billNo}>
                      <input name="billNo" value={bill.billNo} onChange={handleChange} placeholder="Bill No." className={`pc-input ${errors.billNo ? 'pc-input-error' : ''}`} />
                    </Field>
                    <Field label="Bill Date" error={errors.billDate}>
                      <input type="date" name="billDate" value={bill.billDate} onChange={handleChange} className={`pc-input ${errors.billDate ? 'pc-input-error' : ''}`} />
                    </Field>
                  </div>

                  <Field label="Net Amount (₹)" error={errors.netAmount}>
                    <input type="number" inputMode="decimal" min="0" step="0.01" name="netAmount" value={bill.netAmount} onChange={handleChange} placeholder="0" className={`pc-input ${errors.netAmount ? 'pc-input-error' : ''}`} />
                    {willExceed && <span className="pc-warn">⚠️ Yeh amount balance ({formatINR(balance)}) se zyada hai</span>}
                  </Field>

                  <Field label="Work Description" error={errors.workDescription}>
                    <textarea name="workDescription" value={bill.workDescription} onChange={handleChange} rows={3} placeholder="Kya kaam / kya kharida" className={`pc-input pc-textarea ${errors.workDescription ? 'pc-input-error' : ''}`} />
                  </Field>

                  <div className="pc-row">
                    <PhotoPicker
                      label="Bill Photo"
                      value={bill.billPhoto}
                      error={errors.billPhoto}
                      loading={compressing === 'billPhoto'}
                      onPick={(e) => handlePhoto(e, 'billPhoto')}
                      onClear={() => setBill((p) => ({ ...p, billPhoto: '' }))}
                    />
                    <PhotoPicker
                      label="Material Photo"
                      optional
                      value={bill.materialPhoto}
                      error={errors.materialPhoto}
                      loading={compressing === 'materialPhoto'}
                      onPick={(e) => handlePhoto(e, 'materialPhoto')}
                      onClear={() => setBill((p) => ({ ...p, materialPhoto: '' }))}
                    />
                  </div>

                  {/* ✅ Remarks — sabse last */}
                  <Field label="Remarks" optional>
                    <textarea name="remarks" value={bill.remarks} onChange={handleChange} rows={2} placeholder="Remarks (optional)" className="pc-input pc-textarea" />
                  </Field>

                  <div className="pc-btn-row">
                    <button type="button" onClick={() => { setBill(emptyBill); setErrors({}); }} className="pc-btn pc-btn-reset">🔄 Reset</button>
                    <button type="submit" disabled={submitting || !!compressing} className="pc-btn pc-btn-submit">
                      {submitting ? '⏳ Upload ho raha hai...' : '✅ Save Bill'}
                    </button>
                  </div>
                </form>
              )
            )}

            {/* ── Bills List ── */}
            {tab === 'bills' && (
              (ledger.bills || []).length === 0 ? (
                <p className="pc-empty">Abhi tak koi bill nahi bhara gaya</p>
              ) : (
                <div className="pc-list">
                  {ledger.bills.map((b) => (
                    <div key={`${b.uid}-${b.rowNumber}`} className="pc-item">
                      <div className="pc-item-top">
                        <span className="pc-item-uid">{b.uid}</span>
                        <StatusBadge status={b.status} />
                      </div>
                      <div className="pc-item-amount">{formatINR(b.netAmount)}</div>
                      <div className="pc-item-desc">{b.workDescription}</div>
                      <div className="pc-item-grid">
                        <Info label="Site" value={b.siteName} />
                        <Info label="Bill No." value={b.billNo} />
                        <Info label="Bill Date" value={b.billDate} />
                        <Info label="Entry" value={b.timestamp} />
                      </div>
                      {b.remarks && <div className="pc-item-remark">💬 {b.remarks}</div>}
                      <div className="pc-item-photos">
                        <PhotoLink url={b.billPhoto} label="Bill Photo" />
                        <PhotoLink url={b.materialPhoto} label="Material Photo" />
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* ── Advances List ── */}
            {tab === 'advances' && (
              (ledger.advances || []).length === 0 ? (
                <p className="pc-empty">Abhi tak koi advance nahi mila</p>
              ) : (
                <div className="pc-list">
                  {ledger.advances.map((a) => (
                    <div key={a.rowNumber} className="pc-item">
                      <div className="pc-item-top">
                        <span className="pc-item-uid">{a.paymentDate || a.timestamp}</span>
                        <span className="pc-mode">{a.paymentMode}</span>
                      </div>
                      <div className="pc-item-amount" style={{ color: '#1d4ed8' }}>{formatINR(a.amount)}</div>
                      <div className="pc-item-grid">
                        <Info label="Site" value={a.siteName} />
                        <Info label="Bank" value={a.bankDetails} />
                        <Info label="Details" value={a.paymentDetails} />
                        <Info label="Entry" value={a.timestamp} />
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </>
        )}
      </div>

      <style>{css}</style>
    </div>
  );
};

// ── Helper Components ──────────────────────────────────────────
const Card = ({ label, value, color, border, note }) => (
  <div className="pc-card" style={{ borderColor: border }}>
    <span className="pc-card-label">{label}</span>
    <span className="pc-card-value" style={{ color }}>{value}</span>
    {note && <span className="pc-card-note">{note}</span>}
  </div>
);

const Field = ({ label, error, optional, children }) => (
  <div className="pc-field">
    <label className="pc-label">{label} {!optional && <span className="pc-req">*</span>}</label>
    {children}
    {error && <span className="pc-err">{error}</span>}
  </div>
);

const Info = ({ label, value }) => (
  <div className="pc-info">
    <span className="pc-info-label">{label}</span>
    <span className="pc-info-value">{value || '—'}</span>
  </div>
);

const PhotoPicker = ({ label, value, onPick, onClear, error, loading, optional }) => (
  <Field label={label} error={error} optional={optional}>
    {value ? (
      <div className="pc-preview">
        <img src={value} alt={label} />
        <button type="button" onClick={onClear} className="pc-preview-clear">✕ Hatao</button>
      </div>
    ) : (
      <label className={`pc-upload ${error ? 'pc-upload-error' : ''}`}>
        <input type="file" accept="image/*" onChange={onPick} style={{ display: 'none' }} />
        <span style={{ fontSize: 28 }}>📷</span>
        <span>{loading ? 'Photo ready ho rahi hai...' : 'Photo lo / choose karo'}</span>
      </label>
    )}
  </Field>
);

// ── Styles (Mobile friendly) ───────────────────────────────────
const css = `
  .pc-page { width: 100%; display: flex; justify-content: center; }
  .pc-container { background: #fff; border-radius: 14px; width: 100%; max-width: 1150px; padding: 24px; box-shadow: 0 6px 24px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; box-sizing: border-box; }
  .pc-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; border-bottom: 2px solid #f0f0f0; padding-bottom: 14px; margin-bottom: 16px; }
  .pc-title { margin: 0 0 4px; font-size: 22px; font-weight: 700; color: #2c3e50; }
  .pc-subtitle { margin: 0; font-size: 13px; color: #7f8c8d; }
  .pc-user-badge { background: #fff7ed; border: 1px solid #fdba74; color: #c2410c; font-weight: 700; font-size: 13px; padding: 6px 12px; border-radius: 20px; }
  .pc-person-box { display: flex; flex-direction: column; gap: 6px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 10px; padding: 14px; margin-bottom: 16px; }

  .pc-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 18px; }
  .pc-card { border: 1.5px solid; border-radius: 12px; padding: 12px 14px; display: flex; flex-direction: column; gap: 4px; min-width: 0; }
  .pc-card-label { font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; }
  .pc-card-value { font-size: 21px; font-weight: 800; word-break: break-word; }
  .pc-card-note { font-size: 11px; color: #b91c1c; font-weight: 600; }

  .pc-tabs { display: flex; gap: 6px; border-bottom: 2px solid #f0f0f0; margin-bottom: 16px; overflow-x: auto; }
  .pc-tab { border: none; background: transparent; padding: 10px 14px; font-size: 14px; font-weight: 600; color: #64748b; cursor: pointer; border-bottom: 3px solid transparent; margin-bottom: -2px; white-space: nowrap; }
  .pc-tab-active { color: #ea580c; border-bottom-color: #ea580c; }

  .pc-form { display: flex; flex-direction: column; gap: 14px; }
  .pc-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .pc-field { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
  .pc-label { font-size: 14px; font-weight: 600; color: #34495e; }
  .pc-req { color: #e74c3c; }
  .pc-input { padding: 12px 14px; border-radius: 8px; border: 1.5px solid #ddd; font-size: 16px; color: #2c3e50; outline: none; background: #fafafa; box-sizing: border-box; width: 100%; font-family: inherit; min-height: 48px; }
  .pc-input:focus { border-color: #f97316; background: #fff; }
  .pc-input-error { border-color: #e74c3c; }
  .pc-locked { background: #f1f5f9 !important; color: #334155; font-weight: 600; cursor: not-allowed; }
  .pc-textarea { resize: vertical; min-height: 90px; }
  .pc-err { font-size: 12px; color: #e74c3c; }
  .pc-warn { font-size: 12px; color: #c2410c; font-weight: 600; }

  .pc-upload { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; min-height: 120px; border: 2px dashed #cbd5e1; border-radius: 10px; background: #f8fafc; color: #475569; font-size: 14px; font-weight: 600; cursor: pointer; text-align: center; padding: 12px; }
  .pc-upload-error { border-color: #e74c3c; }
  .pc-preview { border: 1.5px solid #86efac; border-radius: 10px; padding: 8px; background: #f0fdf4; display: flex; flex-direction: column; align-items: center; gap: 8px; }
  .pc-preview img { max-width: 100%; max-height: 200px; border-radius: 6px; object-fit: contain; }
  .pc-preview-clear { border: none; background: #fee2e2; color: #b91c1c; font-weight: 700; font-size: 13px; padding: 8px 14px; border-radius: 6px; cursor: pointer; }

  .pc-btn-row { display: flex; justify-content: flex-end; gap: 12px; margin-top: 4px; }
  .pc-btn { padding: 13px 26px; border-radius: 8px; font-size: 15px; font-weight: 700; cursor: pointer; min-height: 48px; }
  .pc-btn-reset { border: 1.5px solid #bdc3c7; background: #ecf0f1; color: #2c3e50; }
  .pc-btn-submit { border: none; background: linear-gradient(135deg, #f97316, #ea580c); color: #fff; box-shadow: 0 4px 14px rgba(234,88,12,0.35); }
  .pc-btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }

  .pc-alert { border-radius: 8px; padding: 12px 14px; font-size: 14px; margin-bottom: 14px; }
  .pc-alert-success { background: #d5f5e3; border: 1px solid #2ecc71; color: #1e8449; }
  .pc-alert-error { background: #fdecea; border: 1px solid #e74c3c; color: #c0392b; }
  .pc-alert-warn { background: #fffbeb; border: 1px solid #fcd34d; color: #92400e; }
  .pc-empty { text-align: center; color: #94a3b8; padding: 30px 0; font-size: 14px; }

  .pc-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 12px; }
  .pc-item { border: 1px solid #e5e7eb; border-radius: 12px; padding: 14px; background: #fff; display: flex; flex-direction: column; gap: 8px; min-width: 0; }
  .pc-item-top { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
  .pc-item-uid { font-size: 13px; font-weight: 700; color: #475569; }
  .pc-item-amount { font-size: 22px; font-weight: 800; color: #c2410c; }
  .pc-item-desc { font-size: 14px; color: #1e293b; word-break: break-word; }
  .pc-item-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .pc-info { display: flex; flex-direction: column; background: #f8fafc; border-radius: 6px; padding: 6px 8px; min-width: 0; }
  .pc-info-label { font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase; }
  .pc-info-value { font-size: 13px; color: #1e293b; font-weight: 600; word-break: break-word; }
  .pc-item-remark { font-size: 13px; color: #475569; background: #f8fafc; border-radius: 6px; padding: 6px 8px; }
  .pc-item-photos { display: flex; gap: 16px; flex-wrap: wrap; font-size: 13px; padding-top: 4px; border-top: 1px dashed #e5e7eb; }
  .pc-mode { font-size: 12px; font-weight: 700; color: #1d4ed8; background: #eff6ff; border: 1px solid #bfdbfe; padding: 2px 8px; border-radius: 10px; }

  /* ── Tablet ── */
  @media (max-width: 900px) {
    .pc-cards { grid-template-columns: repeat(2, 1fr); }
  }

  /* ── Mobile ── */
  @media (max-width: 640px) {
    .pc-container { padding: 14px; border-radius: 10px; box-shadow: none; }
    .pc-title { font-size: 19px; }
    .pc-subtitle { font-size: 12px; }
    .pc-header { padding-bottom: 10px; margin-bottom: 12px; }
    .pc-cards { gap: 8px; margin-bottom: 14px; }
    .pc-card { padding: 10px; }
    .pc-card-label { font-size: 10px; }
    .pc-card-value { font-size: 17px; }
    .pc-row { grid-template-columns: 1fr; gap: 14px; }
    .pc-tab { flex: 1; padding: 10px 6px; font-size: 13px; }
    .pc-btn-row { flex-direction: column-reverse; }
    .pc-btn { width: 100%; }
    .pc-list { grid-template-columns: 1fr; }
  }
`;

export default AdvancePettyCash;