// frontend/src/components/Paradise/ParadiseBOQQty.jsx
import React, { useState, useMemo } from 'react';
import { Loader2, AlertCircle, Search, Filter, X, Package, CheckCircle, XCircle, RotateCcw, Layers, Archive, MapPin, Wrench } from 'lucide-react';
import { useGetParadiseBOQQtyQuery } from '../../redux/Paradise/ParadiseSlice';

const T = {
  navy: '#1e293b', navyLight: '#334155', navyDark: '#0f172a', gold: '#f59e0b', goldLight: '#fbbf24', goldDark: '#d97706',
  card: '#ffffff', text: '#1e293b', textLight: '#64748b', textMuted: '#94a3b8', border: '#e2e8f0', borderLight: '#f1f5f9',
  success: '#10b981', successBg: '#ecfdf5', successBorder: '#a7f3d0', danger: '#ef4444', dangerBg: '#fef2f2', dangerBorder: '#fecaca',
  purple: '#7c3aed', purpleBg: '#faf5ff', blue: '#3b82f6', blueBg: '#eff6ff', warning: '#f59e0b', warningBg: '#fffbeb',
};

const inputBase = {
  width: '100%', padding: '10px 12px', fontSize: 13, border: `1.5px solid ${T.border}`, borderRadius: 8, outline: 'none', color: T.text, background: T.borderLight, boxSizing: 'border-box',
};

const StatCard = ({ icon: Icon, label, value, color, bg, subtitle }) => (
  <div style={{ background: T.card, borderRadius: 12, padding: '16px 18px', border: `1px solid ${T.border}`, borderLeft: `4px solid ${color}`, display: 'flex', alignItems: 'center', gap: 14 }}>
    <div style={{ width: 44, height: 44, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon size={22} color={color} /></div>
    <div style={{ flex: 1 }}>
      <p style={{ fontSize: 11, color: T.textMuted, margin: 0, fontWeight: 600 }}>{label}</p>
      <p style={{ fontSize: 20, fontWeight: 800, color: T.navy, margin: '2px 0 0' }}>{value}</p>
      {subtitle && <p style={{ fontSize: 10, color: T.textMuted, margin: '2px 0 0' }}>{subtitle}</p>}
    </div>
  </div>
);

const ParadiseBOQQty = () => {
  const { data: response, isLoading, isError, error, refetch, isFetching } = useGetParadiseBOQQtyQuery();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCluster, setSelectedCluster] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [balanceFilter, setBalanceFilter] = useState('');

  const boqData = response?.data || [];
  const uv = response?.uniqueValues || {};
  const stats = response?.stats || {};

  const filteredData = useMemo(() => {
    return boqData.filter(item => {
      const search = searchTerm.toLowerCase().trim();
      const matchesSearch = !search || (
        item.cluster?.toLowerCase().includes(search) ||
        item.location?.toLowerCase().includes(search) ||
        item.activity?.toLowerCase().includes(search) ||
        item.materialName?.toLowerCase().includes(search) ||
        item.skuCode?.toLowerCase().includes(search)
      );
      if (!matchesSearch) return false;
      if (selectedCluster && item.cluster !== selectedCluster) return false;
      if (selectedLocation && item.location !== selectedLocation) return false;
      if (balanceFilter === 'available' && item.balance <= 0) return false;
      if (balanceFilter === 'exhausted' && item.balance > 0) return false;
      return true;
    });
  }, [boqData, searchTerm, selectedCluster, selectedLocation, balanceFilter]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px' }}>
        <Loader2 size={28} color={T.gold} style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ fontSize: 15, fontWeight: 600, color: T.navy, marginTop: 10 }}>Loading Paradise BOQ Quantity...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 8px' }}>
      {/* Header */}
      <div style={{ background: T.card, borderRadius: 10, border: `1px solid ${T.border}`, padding: '14px 18px', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: T.navy, margin: 0 }}>BOQ Quantity</h2>
          <p style={{ fontSize: 12, color: T.textMuted, margin: 0 }}>Signature Paradise — Bill of Quantities</p>
        </div>
        <button onClick={refetch} disabled={isFetching} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 8, border: `1.5px solid ${T.border}`, background: T.card, color: T.textLight, cursor: 'pointer' }}>
          <RotateCcw size={14} style={isFetching ? { animation: 'spin 0.8s linear infinite' } : {}} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 14 }}>
        <StatCard icon={Layers} label="Total BOQ Items" value={stats.total || 0} color={T.navy} bg={`${T.navy}10`} />
        <StatCard icon={CheckCircle} label="Available" value={stats.available || 0} color={T.success} bg={T.successBg} />
        <StatCard icon={XCircle} label="Exhausted" value={stats.exhausted || 0} color={T.danger} bg={T.dangerBg} />
        <StatCard icon={Archive} label="Total Balance" value={(stats.totalBalance || 0).toLocaleString('en-IN')} color={T.purple} bg={T.purpleBg} />
      </div>

      {/* Filters */}
      <div style={{ background: T.card, borderRadius: 10, border: `1px solid ${T.border}`, padding: '12px 16px', marginBottom: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: 10, alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: T.navyLight, marginBottom: 4 }}>Search BOQ</label>
            <input type="text" placeholder="Cluster, Location, Activity..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={inputBase} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: T.navyLight, marginBottom: 4 }}>Cluster</label>
            <select value={selectedCluster} onChange={(e) => setSelectedCluster(e.target.value)} style={inputBase}>
              <option value="">All Clusters</option>
              {(uv.clusters || []).map((c, i) => <option key={i} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: T.navyLight, marginBottom: 4 }}>Location</label>
            <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} style={inputBase}>
              <option value="">All Locations</option>
              {(uv.locations || []).map((l, i) => <option key={i} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: T.navyLight, marginBottom: 4 }}>Balance Status</label>
            <select value={balanceFilter} onChange={(e) => setBalanceFilter(e.target.value)} style={inputBase}>
              <option value="">All Balance</option>
              <option value="available">Available</option>
              <option value="exhausted">Exhausted</option>
            </select>
          </div>
          <div style={{ padding: '10px 14px', background: T.borderLight, borderRadius: 8, fontSize: 13, color: T.textLight, height: 40, display: 'flex', alignItems: 'center' }}>
            Count: <span style={{ color: T.gold, fontWeight: 700, marginLeft: 4 }}>{filteredData.length}</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: T.card, borderRadius: 10, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: T.navy, color: '#fff' }}>
                <th style={{ padding: '12px 14px', borderBottom: `2px solid ${T.gold}` }}>#</th>
                <th style={{ padding: '12px 14px', borderBottom: `2px solid ${T.gold}`, textAlign: 'left' }}>Cluster</th>
                <th style={{ padding: '12px 14px', borderBottom: `2px solid ${T.gold}`, textAlign: 'left' }}>Location</th>
                <th style={{ padding: '12px 14px', borderBottom: `2px solid ${T.gold}`, textAlign: 'left' }}>Activity</th>
                <th style={{ padding: '12px 14px', borderBottom: `2px solid ${T.gold}`, textAlign: 'left' }}>Material Name</th>
                <th style={{ padding: '12px 14px', borderBottom: `2px solid ${T.gold}`, textAlign: 'left' }}>Size</th>
                <th style={{ padding: '12px 14px', borderBottom: `2px solid ${T.gold}` }}>Out Qty</th>
                <th style={{ padding: '12px 14px', borderBottom: `2px solid ${T.gold}` }}>Revise BOQ</th>
                <th style={{ padding: '12px 14px', borderBottom: `2px solid ${T.gold}` }}>Balance</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, idx) => (
                <tr key={item.id} style={{ background: idx % 2 === 0 ? T.card : T.borderLight, borderBottom: `1px solid ${T.border}` }}>
                  <td style={{ padding: '10px 14px', textAlign: 'center' }}>{idx + 1}</td>
                  <td style={{ padding: '10px 14px' }}>{item.cluster}</td>
                  <td style={{ padding: '10px 14px', fontWeight: 600 }}>{item.location}</td>
                  <td style={{ padding: '10px 14px' }}>{item.activity}</td>
                  <td style={{ padding: '10px 14px', fontWeight: 600 }}>{item.materialName}</td>
                  <td style={{ padding: '10px 14px' }}>{item.materialSize}</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center' }}>{item.outQty}</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center' }}>{item.reviseBOQ || '—'}</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700, color: item.balance > 0 ? T.success : T.danger }}>{item.balance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ParadiseBOQQty;