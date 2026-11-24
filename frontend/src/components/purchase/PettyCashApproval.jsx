import React, { useMemo, useState } from 'react';
import { useGetPettyCashAllQuery, useUpdatePettyCashStatusMutation } from '../../redux/advanceSlice';
import { formatINR, driveThumb, StatusBadge, PhotoLink } from './pettyCashUtils';

// ✅ Ye users sirf Cards + Person-wise Summary dekh sakte hain
//    (Bills section aur Action nahi dikhega)
const VIEW_ONLY_USERS = ['Govind Ram Nagar'];

const PettyCashApproval = () => {
  // ── Login User ───────────────────────────────────────────────
  const userType = (sessionStorage.getItem('userType') || '').trim();
  const canAction = !VIEW_ONLY_USERS.some((u) => u.toLowerCase() === userType.toLowerCase());

  const { data, isLoading, isFetching, isError, refetch } = useGetPettyCashAllQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [updateStatus, { isLoading: updating }] = useUpdatePettyCashStatusMutation();

  // ── Person Summary Filters ───────────────────────────────────
  const [personSearch, setPersonSearch] = useState('');
  const [personType, setPersonType] = useState('All');
  const [personSort, setPersonSort] = useState('name');

  // ── Person Summary open / minimize (yaad rahega) ─────────────
  const [showSummary, setShowSummary] = useState(() => {
    try { return localStorage.getItem('pca_showSummary') !== 'false'; } catch { return true; }
  });
  const toggleSummary = () => {
    setShowSummary((prev) => {
      try { localStorage.setItem('pca_showSummary', String(!prev)); } catch { /* ignore */ }
      return !prev;
    });
  };

  // ── Bills Tabs + Filters ─────────────────────────────────────
  const [billTab, setBillTab] = useState('pending'); // pending | all
  const [personFilter, setPersonFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  // ── Action Modal ─────────────────────────────────────────────
  const [selectedBill, setSelectedBill] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [modalError, setModalError] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });

  const overall = data?.data?.overall;
  const persons = data?.data?.persons || [];
  const bills = data?.data?.bills || [];

  const pendingBills = useMemo(() => bills.filter((b) => b.status === 'Pending'), [bills]);

  // ── Filtered Persons ─────────────────────────────────────────
  const filteredPersons = useMemo(() => {
    const q = personSearch.trim().toLowerCase();

    const list = persons.filter((p) => {
      if (q && !p.personName.toLowerCase().includes(q)) return false;
      if (personType === 'Pending' && !(p.pendingCount > 0)) return false;
      if (personType === 'Balance' && !(p.balance > 0)) return false;
      if (personType === 'Minus' && !(p.balance < 0)) return false;
      if (personType === 'Zero' && p.balance !== 0) return false;
      return true;
    });

    const sorted = [...list];
    if (personSort === 'name') sorted.sort((a, b) => a.personName.localeCompare(b.personName));
    if (personSort === 'balanceHigh') sorted.sort((a, b) => b.balance - a.balance);
    if (personSort === 'balanceLow') sorted.sort((a, b) => a.balance - b.balance);
    if (personSort === 'advanceHigh') sorted.sort((a, b) => b.totalAdvance - a.totalAdvance);
    if (personSort === 'pendingHigh') sorted.sort((a, b) => b.pendingCount - a.pendingCount);
    return sorted;
  }, [persons, personSearch, personType, personSort]);

  const personFiltersActive = personSearch || personType !== 'All' || personSort !== 'name';

  // ── Filtered Bills (Tab ke hisaab se) ────────────────────────
  const filteredBills = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = billTab === 'pending' ? pendingBills : bills;

    return base.filter((b) => {
      if (personFilter && b.personName.toLowerCase() !== personFilter.toLowerCase()) return false;
      if (billTab === 'all' && statusFilter !== 'All' && b.status !== statusFilter) return false;
      if (q) {
        const hay = `${b.uid} ${b.billNo} ${b.siteName} ${b.workDescription} ${b.remarks}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [bills, pendingBills, billTab, personFilter, statusFilter, search]);

  // ── Action Handlers ──────────────────────────────────────────
  const openAction = (bill) => {
    if (!canAction) return;
    setSelectedBill(bill);
    setNewStatus(bill.status === 'Done' || bill.status === 'Reject' ? bill.status : '');
    setModalError('');
  };

  const closeAction = () => {
    if (updating) return;
    setSelectedBill(null);
    setNewStatus('');
    setModalError('');
  };

  const handleStatusSubmit = async () => {
    if (!newStatus) {
      setModalError('Status select karo');
      return;
    }
    try {
      const res = await updateStatus({
        rowNumber: selectedBill.rowNumber,
        uid: selectedBill.uid,
        status: newStatus,
      }).unwrap();
      setMsg({ type: 'success', text: `✅ ${res.message}` });
      setSelectedBill(null);
      setNewStatus('');
    } catch (err) {
      setModalError(err?.data?.message || 'Status update nahi hua');
    }
  };

  const showBillsOf = (name) => {
    setPersonFilter((prev) => (prev.toLowerCase() === name.toLowerCase() ? '' : name));
    setTimeout(() => {
      document.getElementById('pca-bills')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  if (isLoading) return <Loader title="Loading Approval Data..." subtitle="Fetching pending records" />;
  if (isError) {
    return (
      <div style={s.center}>
        ❌ Data load nahi hua.&nbsp;
        <button onClick={refetch} style={s.linkBtn}>Dobara try karo</button>
      </div>
    );
  }

  const billHeaders = [
    'UID', 'Entry Date', 'Person', 'Site', 'Bill No.', 'Bill Date', 'Net Amount',
    'Work Description', 'Bill Photo', 'Material Photo', 'Remarks', 'Status', 'Action',
  ];

  const personHeaders = ['Person', 'Advance Mila', 'Kharch', 'Balance', 'Total Bills', 'Pending', ...(canAction ? [''] : [])];

  return (
    <div style={s.page}>
      <div style={s.container}>

        {/* Header */}
        <div style={s.header}>
          <div>
            <h2 style={s.title}>🧾 Petty Cash — Check & Approval</h2>
            <p style={s.subtitle}>
              
              {!canAction && <span style={s.viewOnly}>👁️ View Mode</span>}
            </p>
          </div>
          <button onClick={refetch} disabled={isFetching} style={s.refreshBtn}>
            {isFetching ? '⏳ Refreshing...' : '🔄 Refresh'}
          </button>
        </div>

        {msg.text && <div style={msg.type === 'success' ? s.successAlert : s.errorAlert}>{msg.text}</div>}

        {/* Overall Cards */}
        <div style={s.cards}>
          <Card label="Total Advance Diya" value={formatINR(overall?.totalAdvance)} color="#1d4ed8" border="#93c5fd" />
          <Card label="Total Kharch" value={formatINR(overall?.totalBills)} color="#c2410c" border="#fdba74" note="" />
          <Card label="Total Balance" value={formatINR(overall?.balance)} color={(overall?.balance || 0) < 0 ? '#b91c1c' : '#15803d'} border="#86efac" />
          <Card label="Check Pending" value={`${overall?.pendingCount || 0} bill`} color="#a16207" border="#fde047" />
        </div>

        {/* ═══════════ Person-wise Summary (Minimize ho sakta hai) ═══════════ */}
        <div onClick={toggleSummary} style={{ ...s.collapseBar, marginBottom: showSummary ? 12 : 0 }}>
          <h3 style={{ ...s.sectionTitle, margin: 0 }}>
            👥 Person-wise Summary ({filteredPersons.length}/{persons.length})
          </h3>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); toggleSummary(); }}
            style={s.collapseBtn}
          >
            {showSummary ? '▲ Minimize' : '▼ Kholo'}
          </button>
        </div>

        {showSummary && (
          <>
            <div style={s.filters}>
              <input
                value={personSearch}
                onChange={(e) => setPersonSearch(e.target.value)}
                placeholder="🔍 Person ka naam search karo..."
                style={{ ...s.filterInput, flex: 2 }}
              />
              <select value={personType} onChange={(e) => setPersonType(e.target.value)} style={s.filterInput}>
                <option value="All">All Types</option>
                <option value="Pending">⏳ Jinke bills Pending hain</option>
                <option value="Balance">🟢 Jinka Balance bacha hai</option>
                <option value="Minus">🔴 Balance Minus (zyada kharch)</option>
                <option value="Zero">⚪ Balance Zero</option>
              </select>
              <select value={personSort} onChange={(e) => setPersonSort(e.target.value)} style={s.filterInput}>
                <option value="name">Sort: Naam (A-Z)</option>
                <option value="balanceHigh">Sort: Balance (zyada → kam)</option>
                <option value="balanceLow">Sort: Balance (kam → zyada)</option>
                <option value="advanceHigh">Sort: Advance (zyada → kam)</option>
                <option value="pendingHigh">Sort: Pending (zyada → kam)</option>
              </select>
              {personFiltersActive && (
                <button
                  onClick={() => { setPersonSearch(''); setPersonType('All'); setPersonSort('name'); }}
                  style={s.clearBtn}
                >
                  ✕ Clear
                </button>
              )}
            </div>

            {persons.length === 0 ? (
              <p style={s.emptyText}>Abhi tak koi Petty Cash advance nahi diya gaya</p>
            ) : filteredPersons.length === 0 ? (
              <p style={s.emptyText}>Is filter me koi person nahi mila</p>
            ) : (
              <div style={{ ...s.tableWrap, maxHeight: 420, overflowY: 'auto' }}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      {personHeaders.map((h, idx) => (
                        <th key={`${h}-${idx}`} style={{ ...s.th, position: 'sticky', top: 0, zIndex: 1 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPersons.map((p, i) => {
                      const active = personFilter.toLowerCase() === p.personName.toLowerCase();
                      return (
                        <tr key={p.personName} style={{ background: active ? '#fff7ed' : i % 2 ? '#f9fafb' : '#fff' }}>
                          <td style={{ ...s.td, fontWeight: 700 }}>{p.personName}</td>
                          <td style={s.td}>{formatINR(p.totalAdvance)}</td>
                          <td style={s.td}>{formatINR(p.totalBills)}</td>
                          <td style={{ ...s.td, fontWeight: 700, color: p.balance < 0 ? '#b91c1c' : '#15803d' }}>{formatINR(p.balance)}</td>
                          <td style={s.td}>{p.billCount}</td>
                          <td style={s.td}>
                            {p.pendingCount > 0 ? (
                              <>
                                <StatusBadge status="Pending" />
                                <b style={{ marginLeft: 6 }}>{p.pendingCount}</b>
                              </>
                            ) : '—'}
                          </td>
                          {canAction && (
                            <td style={s.td}>
                              <button onClick={() => showBillsOf(p.personName)} style={s.smallBtn}>
                                {active ? '✕ Clear' : '📄 Bills dekho'}
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ═══════════ Bills (2 Tabs) — VIEW_ONLY users ko nahi dikhega ═══════════ */}
        {canAction && (
          <>
            <h3 id="pca-bills" style={{ ...s.sectionTitle, marginTop: 26 }}>📄 Bills</h3>

            <div style={s.tabs}>
              <button
                onClick={() => setBillTab('pending')}
                style={{ ...s.tab, ...(billTab === 'pending' ? s.tabActivePending : {}) }}
              >
                ⏳ Pending <span style={s.tabCount}>{pendingBills.length}</span>
              </button>
              <button
                onClick={() => setBillTab('all')}
                style={{ ...s.tab, ...(billTab === 'all' ? s.tabActiveAll : {}) }}
              >
                📋 All Entry <span style={s.tabCount}>{bills.length}</span>
              </button>
            </div>

            <div style={s.filters}>
              <select value={personFilter} onChange={(e) => setPersonFilter(e.target.value)} style={s.filterInput}>
                <option value="">Sabhi Persons</option>
                {persons.map((p) => <option key={p.personName} value={p.personName}>{p.personName}</option>)}
              </select>
              {billTab === 'all' && (
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={s.filterInput}>
                  <option value="All">Sabhi Status</option>
                  <option value="Pending">⏳ Pending</option>
                  <option value="Done">✓ Done</option>
                  <option value="Reject">✕ Reject</option>
                </select>
              )}
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="🔍 UID / Bill No / Site / Work search..."
                style={{ ...s.filterInput, flex: 2 }}
              />
            </div>

            <p style={s.resultInfo}>
              {billTab === 'pending' ? '⏳ Check hona baaki' : '📋 Saari entries'} — {filteredBills.length} bill
            </p>

            {filteredBills.length === 0 ? (
              <p style={s.emptyText}>
                {billTab === 'pending' ? '🎉 Koi pending bill nahi — sab check ho gaye' : 'Koi bill nahi mila'}
              </p>
            ) : (
              <div style={s.tableWrap}>
                <table style={s.table}>
                  <thead>
                    <tr>{billHeaders.map((h) => <th key={h} style={s.th}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {filteredBills.map((b, i) => (
                      <tr key={`${b.uid}-${b.rowNumber}`} style={{ background: i % 2 ? '#f9fafb' : '#fff' }}>
                        <td style={s.td}>{b.uid}</td>
                        <td style={s.td}>{b.timestamp}</td>
                        <td style={{ ...s.td, fontWeight: 600 }}>{b.personName}</td>
                        <td style={s.td}>{b.siteName}</td>
                        <td style={s.td}>{b.billNo}</td>
                        <td style={s.td}>{b.billDate}</td>
                        <td style={{ ...s.td, fontWeight: 700 }}>{formatINR(b.netAmount)}</td>
                        <td style={{ ...s.td, whiteSpace: 'normal', minWidth: 180 }}>{b.workDescription}</td>
                        <td style={s.td}><PhotoLink url={b.billPhoto} /></td>
                        <td style={s.td}><PhotoLink url={b.materialPhoto} /></td>
                        <td style={s.td}>{b.remarks || '—'}</td>
                        <td style={s.td}><StatusBadge status={b.status} /></td>
                        <td style={s.td}>
                          <button onClick={() => openAction(b)} style={s.actionBtn}>⚡ Action</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Action Modal ── */}
      {canAction && selectedBill && (
        <div style={s.overlay} onClick={closeAction}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, color: '#2c3e50' }}>Bill Check — {selectedBill.uid}</h3>
                <div style={{ marginTop: 6 }}><StatusBadge status={selectedBill.status} /></div>
              </div>
              <button onClick={closeAction} style={s.closeBtn}>✕</button>
            </div>

            <div style={s.detailGrid}>
              <Detail label="Person" value={selectedBill.personName} />
              <Detail label="Site Name" value={selectedBill.siteName} />
              <Detail label="Bill No." value={selectedBill.billNo} />
              <Detail label="Bill Date" value={selectedBill.billDate} />
              <Detail label="Net Amount" value={formatINR(selectedBill.netAmount)} highlight />
              <Detail label="Entry Time" value={selectedBill.timestamp} />
            </div>
            <Detail label="Work Description" value={selectedBill.workDescription} full />
            {selectedBill.remarks && <Detail label="Remarks" value={selectedBill.remarks} full />}

            <div style={s.photoRow}>
              <PhotoThumb label="Bill Photo" url={selectedBill.billPhoto} />
              <PhotoThumb label="Material Photo" url={selectedBill.materialPhoto} />
            </div>

            <div style={s.statusBox}>
              <label style={s.label}>Status <span style={{ color: '#e74c3c' }}>*</span></label>
              <select
                value={newStatus}
                onChange={(e) => { setNewStatus(e.target.value); setModalError(''); }}
                style={{ ...s.filterInput, width: '100%', borderColor: modalError ? '#e74c3c' : '#ddd' }}
              >
                <option value="">-- Select Status --</option>
                <option value="Done">✓ Done</option>
                <option value="Reject">✕ Reject</option>
              </select>
              {modalError && <span style={{ fontSize: 12, color: '#e74c3c' }}>{modalError}</span>}
            </div>

            <div style={s.modalBtns}>
              <button onClick={closeAction} disabled={updating} style={s.cancelBtn}>Cancel</button>
              <button
                onClick={handleStatusSubmit}
                disabled={updating}
                style={{ ...s.submitBtn, opacity: updating ? 0.7 : 1, cursor: updating ? 'not-allowed' : 'pointer' }}
              >
                {updating ? '⏳ Saving...' : '✅ Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Helper Components ──────────────────────────────────────────
const Loader = ({ title = 'Loading...', subtitle = '' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px' }}>
    <div style={{
      width: 64, height: 64, borderRadius: 14,
      background: 'linear-gradient(135deg, #1e293b, #334155)',
      boxShadow: '0 0 0 4px rgba(245,158,11,0.18)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: 26, height: 26, borderRadius: '50%',
        border: '3px solid #f59e0b', borderTopColor: 'transparent',
        animation: 'pcaSpin 0.8s linear infinite',
      }} />
    </div>
    <div style={{ marginTop: 18, fontSize: 17, fontWeight: 700, color: '#1e293b' }}>{title}</div>
    {subtitle && <div style={{ marginTop: 6, fontSize: 14, color: '#94a3b8' }}>{subtitle}</div>}
    <style>{`@keyframes pcaSpin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const Card = ({ label, value, color, border, note }) => (
  <div style={{ ...s.card, borderColor: border }}>
    <span style={s.cardLabel}>{label}</span>
    <span style={{ ...s.cardValue, color }}>{value}</span>
    {note && <span style={s.cardNote}>{note}</span>}
  </div>
);

const Detail = ({ label, value, highlight, full }) => (
  <div style={{ ...s.detail, ...(full ? { marginTop: 10 } : {}) }}>
    <span style={s.detailLabel}>{label}</span>
    <span style={{ ...s.detailValue, ...(highlight ? { color: '#c2410c', fontSize: 18 } : {}) }}>{value || '—'}</span>
  </div>
);

const PhotoThumb = ({ label, url }) => {
  const [failed, setFailed] = useState(false);
  const thumb = driveThumb(url);
  return (
    <div style={s.thumbBox}>
      <span style={s.detailLabel}>{label}</span>
      {!url ? (
        <div style={s.thumbEmpty}>Photo nahi hai</div>
      ) : (
        <a href={url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
          {thumb && !failed ? (
            <img src={thumb} alt={label} style={s.thumbImg} onError={() => setFailed(true)} />
          ) : (
            <div style={s.thumbEmpty}>📷 Photo kholo</div>
          )}
          <div style={{ fontSize: 12, color: '#2563eb', fontWeight: 600, marginTop: 4 }}>Badi photo dekho ↗</div>
        </a>
      )}
    </div>
  );
};

// ── Styles ─────────────────────────────────────────────────────
const s = {
  page: { width: '100%', display: 'flex', justifyContent: 'center' },
  container: { background: '#fff', borderRadius: 14, width: '100%', maxWidth: 1300, padding: 24, boxShadow: '0 6px 24px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0', boxSizing: 'border-box' },
  center: { padding: 40, textAlign: 'center', color: '#64748b', fontSize: 15 },
  linkBtn: { border: 'none', background: 'none', color: '#2563eb', fontWeight: 700, cursor: 'pointer', fontSize: 15 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, borderBottom: '2px solid #f0f0f0', paddingBottom: 16, marginBottom: 18 },
  title: { margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: '#2c3e50' },
  subtitle: { margin: 0, fontSize: 13, color: '#7f8c8d', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  viewOnly: { background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', fontWeight: 700, fontSize: 11, padding: '2px 8px', borderRadius: 10 },
  refreshBtn: { padding: '9px 16px', borderRadius: 8, border: '1.5px solid #cbd5e1', background: '#f8fafc', fontWeight: 600, fontSize: 13, cursor: 'pointer' },
  sectionTitle: { fontSize: 16, fontWeight: 700, color: '#334155', margin: '0 0 12px' },
  collapseBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '10px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, cursor: 'pointer', userSelect: 'none' },
  collapseBtn: { display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', fontSize: 13, fontWeight: 700, color: '#334155', cursor: 'pointer' },
  cards: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14, marginBottom: 22 },
  card: { border: '1.5px solid', borderRadius: 12, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 4 },
  cardLabel: { fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 },
  cardValue: { fontSize: 21, fontWeight: 800 },
  cardNote: { fontSize: 11, color: '#64748b', fontWeight: 600 },
  tabs: { display: 'flex', gap: 8, borderBottom: '2px solid #f0f0f0', marginBottom: 14, flexWrap: 'wrap' },
  tab: { display: 'flex', alignItems: 'center', gap: 8, border: 'none', background: 'transparent', padding: '10px 16px', fontSize: 14, fontWeight: 700, color: '#64748b', cursor: 'pointer', borderBottom: '3px solid transparent', marginBottom: -2 },
  tabActivePending: { color: '#a16207', borderBottom: '3px solid #eab308', background: '#fefce8', borderRadius: '8px 8px 0 0' },
  tabActiveAll: { color: '#1d4ed8', borderBottom: '3px solid #3b82f6', background: '#eff6ff', borderRadius: '8px 8px 0 0' },
  tabCount: { background: '#e2e8f0', color: '#334155', fontSize: 12, fontWeight: 800, padding: '1px 8px', borderRadius: 10 },
  resultInfo: { fontSize: 13, color: '#64748b', fontWeight: 600, margin: '0 0 10px' },
  filters: { display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 },
  filterInput: { flex: 1, minWidth: 170, padding: '10px 12px', borderRadius: 8, border: '1.5px solid #ddd', fontSize: 14, background: '#fafafa', boxSizing: 'border-box', fontFamily: 'inherit' },
  clearBtn: { padding: '10px 14px', borderRadius: 8, border: '1px solid #fca5a5', background: '#fef2f2', color: '#b91c1c', fontWeight: 700, fontSize: 13, cursor: 'pointer' },
  emptyText: { textAlign: 'center', color: '#94a3b8', padding: '24px 0', fontSize: 14 },
  tableWrap: { overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: 10 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { background: '#f1f5f9', color: '#334155', textAlign: 'left', padding: '10px 12px', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid #e5e7eb' },
  td: { padding: '10px 12px', borderBottom: '1px solid #f1f5f9', color: '#2c3e50', whiteSpace: 'nowrap', verticalAlign: 'middle' },
  smallBtn: { padding: '5px 10px', borderRadius: 6, border: '1px solid #fdba74', background: '#fff7ed', color: '#c2410c', fontWeight: 600, fontSize: 12, cursor: 'pointer' },
  actionBtn: { padding: '6px 12px', borderRadius: 6, border: 'none', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 12px', zIndex: 1000, overflowY: 'auto' },
  modal: { background: '#fff', borderRadius: 14, width: '100%', maxWidth: 620, padding: 22, boxShadow: '0 20px 60px rgba(0,0,0,0.25)', boxSizing: 'border-box' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f0f0f0', paddingBottom: 12, marginBottom: 14 },
  closeBtn: { border: 'none', background: '#f3f4f6', borderRadius: 8, width: 34, height: 34, fontSize: 15, cursor: 'pointer', fontWeight: 700 },
  detailGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10 },
  detail: { display: 'flex', flexDirection: 'column', gap: 2, background: '#f8fafc', borderRadius: 8, padding: '8px 10px' },
  detailLabel: { fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.3 },
  detailValue: { fontSize: 14, color: '#1e293b', fontWeight: 600, wordBreak: 'break-word' },
  photoRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginTop: 14 },
  thumbBox: { display: 'flex', flexDirection: 'column', gap: 6, border: '1px solid #e5e7eb', borderRadius: 10, padding: 10 },
  thumbImg: { width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 6, background: '#f1f5f9' },
  thumbEmpty: { height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', borderRadius: 6, color: '#94a3b8', fontSize: 13, fontWeight: 600 },
  statusBox: { display: 'flex', flexDirection: 'column', gap: 6, marginTop: 16, padding: 14, background: '#fff7ed', border: '1px dashed #fdba74', borderRadius: 10 },
  label: { fontSize: 14, fontWeight: 600, color: '#34495e' },
  modalBtns: { display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 },
  cancelBtn: { padding: '10px 20px', borderRadius: 8, border: '1.5px solid #bdc3c7', background: '#ecf0f1', fontWeight: 600, fontSize: 14, cursor: 'pointer' },
  submitBtn: { padding: '10px 26px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #2ecc71, #27ae60)', color: '#fff', fontWeight: 600, fontSize: 14, boxShadow: '0 4px 14px rgba(46,204,113,0.35)' },
  successAlert: { background: '#d5f5e3', border: '1px solid #2ecc71', borderRadius: 8, padding: '12px 16px', color: '#1e8449', fontSize: 14, marginBottom: 14 },
  errorAlert: { background: '#fdecea', border: '1px solid #e74c3c', borderRadius: 8, padding: '12px 16px', color: '#c0392b', fontSize: 14, marginBottom: 14 },
};

export default PettyCashApproval;