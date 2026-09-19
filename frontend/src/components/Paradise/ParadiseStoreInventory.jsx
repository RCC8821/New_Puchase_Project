// frontend/src/components/Paradise/ParadiseStoreInventory.jsx
import React, { useState, useMemo } from 'react';
import {
  Loader2, AlertCircle, Search, Filter, X, Package, CheckCircle, XCircle, RotateCcw, Archive, Layers
} from 'lucide-react';
import { useGetParadiseStoreInventoryQuery } from '../../redux/Paradise/ParadiseSlice';

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

const ParadiseStoreInventory = () => {
  const { data: response, isLoading, isError, error, refetch, isFetching } = useGetParadiseStoreInventoryQuery();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMaterialType, setSelectedMaterialType] = useState('');
  const [stockFilter, setStockFilter] = useState('');

  const inventory = response?.data || [];
  const uv = response?.uniqueValues || {};
  const stats = response?.stats || {};

  const filteredData = useMemo(() => {
    return inventory.filter(item => {
      const search = searchTerm.toLowerCase().trim();
      const matchesSearch = !search || (
        item.skuCode?.toLowerCase().includes(search) ||
        item.materialType?.toLowerCase().includes(search) ||
        item.materialName?.toLowerCase().includes(search) ||
        item.materialSize?.toLowerCase().includes(search) ||
        item.materialSpecification?.toLowerCase().includes(search) ||
        item.unit?.toLowerCase().includes(search)
      );
      if (!matchesSearch) return false;
      if (selectedMaterialType && item.materialType !== selectedMaterialType) return false;
      if (stockFilter === 'in-stock' && item.stockBalance <= 0) return false;
      if (stockFilter === 'out-of-stock' && item.stockBalance > 0) return false;
      return true;
    });
  }, [inventory, searchTerm, selectedMaterialType, stockFilter]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px' }}>
        <Loader2 size={28} color={T.gold} style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ fontSize: 15, fontWeight: 600, color: T.navy, marginTop: 10 }}>Loading Paradise Inventory...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px' }}>
        <AlertCircle size={40} color={T.danger} />
        <p style={{ fontSize: 15, color: T.danger }}>Failed to Load Paradise Inventory</p>
        <button onClick={refetch} style={{ marginTop: 12, padding: '8px 18px', background: T.danger, color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}><RotateCcw size={14} /> Retry</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 8px' }}>
      {/* Header */}
      <div style={{ background: T.card, borderRadius: 10, border: `1px solid ${T.border}`, padding: '14px 18px', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: T.navy, margin: 0 }}>Store Inventory</h2>
          <p style={{ fontSize: 12, color: T.textMuted, margin: 0 }}>Signature Paradise — Stock Balance</p>
        </div>
        <button onClick={refetch} disabled={isFetching} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 8, border: `1.5px solid ${T.border}`, background: T.card, color: T.textLight, cursor: 'pointer' }}>
          <RotateCcw size={14} style={isFetching ? { animation: 'spin 0.8s linear infinite' } : {}} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 14 }}>
        <StatCard icon={Layers} label="Total Items" value={stats.total || 0} color={T.navy} bg={`${T.navy}10`} />
        <StatCard icon={CheckCircle} label="In Stock" value={stats.inStock || 0} color={T.success} bg={T.successBg} />
        <StatCard icon={XCircle} label="Out of Stock" value={stats.outOfStock || 0} color={T.danger} bg={T.dangerBg} />
        <StatCard icon={Archive} label="Total Balance" value={(stats.totalStockBalance || 0).toLocaleString('en-IN')} color={T.purple} bg={T.purpleBg} />
      </div>

      {/* Filter panel */}
      <div style={{ background: T.card, borderRadius: 10, border: `1px solid ${T.border}`, padding: '12px 16px', marginBottom: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto auto', gap: 10, alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: T.navyLight, marginBottom: 4 }}>Search Inventory</label>
            <input type="text" placeholder="SKU, Material Type, Name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={inputBase} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: T.navyLight, marginBottom: 4 }}>Material Type</label>
            <select value={selectedMaterialType} onChange={(e) => setSelectedMaterialType(e.target.value)} style={inputBase}>
              <option value="">All Types</option>
              {(uv.materialTypes || []).map((type, i) => <option key={i} value={type}>{type}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: T.navyLight, marginBottom: 4 }}>Stock Status</label>
            <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)} style={inputBase}>
              <option value="">All Stock</option>
              <option value="in-stock">In Stock Only</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </div>
          {(searchTerm || selectedMaterialType || stockFilter) && (
            <button onClick={() => { setSearchTerm(''); setSelectedMaterialType(''); setStockFilter(''); }} style={{ padding: '10px 14px', borderRadius: 8, border: `1.5px solid ${T.dangerBorder}`, background: T.dangerBg, color: T.danger, cursor: 'pointer', height: 40 }}><X size={14} /> Clear</button>
          )}
          <div style={{ padding: '10px 14px', background: T.borderLight, borderRadius: 8, fontSize: 13, color: T.textLight, height: 40, display: 'flex', alignItems: 'center' }}>
            Count: <span style={{ color: T.gold, fontWeight: 700, marginLeft: 4 }}>{filteredData.length}</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: T.card, borderRadius: 10, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', maxHeight: '70vh' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: T.navy, color: '#fff' }}>
                <th style={{ padding: '12px 14px', borderBottom: `2px solid ${T.gold}` }}>#</th>
                <th style={{ padding: '12px 14px', borderBottom: `2px solid ${T.gold}`, textAlign: 'left' }}>SKU Code</th>
                <th style={{ padding: '12px 14px', borderBottom: `2px solid ${T.gold}`, textAlign: 'left' }}>Material Type</th>
                <th style={{ padding: '12px 14px', borderBottom: `2px solid ${T.gold}`, textAlign: 'left' }}>Material Name</th>
                <th style={{ padding: '12px 14px', borderBottom: `2px solid ${T.gold}`, textAlign: 'left' }}>Size</th>
                <th style={{ padding: '12px 14px', borderBottom: `2px solid ${T.gold}`, textAlign: 'left' }}>Specification</th>
                <th style={{ padding: '12px 14px', borderBottom: `2px solid ${T.gold}` }}>Unit</th>
                <th style={{ padding: '12px 14px', borderBottom: `2px solid ${T.gold}` }}>Opening</th>
                <th style={{ padding: '12px 14px', borderBottom: `2px solid ${T.gold}` }}>Out</th>
                <th style={{ padding: '12px 14px', borderBottom: `2px solid ${T.gold}` }}>Balance</th>
                <th style={{ padding: '12px 14px', borderBottom: `2px solid ${T.gold}` }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, idx) => (
                <tr key={item.id} style={{ background: idx % 2 === 0 ? T.card : T.borderLight, borderBottom: `1px solid ${T.border}` }}>
                  <td style={{ padding: '10px 14px', textAlign: 'center' }}>{idx + 1}</td>
                  <td style={{ padding: '10px 14px', fontFamily: 'monospace' }}>{item.skuCode}</td>
                  <td style={{ padding: '10px 14px' }}>{item.materialType}</td>
                  <td style={{ padding: '10px 14px', fontWeight: 600 }}>{item.materialName}</td>
                  <td style={{ padding: '10px 14px' }}>{item.materialSize}</td>
                  <td style={{ padding: '10px 14px' }}>{item.materialSpecification}</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center' }}>{item.unit}</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center' }}>{item.openingStock}</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center' }}>{item.outData}</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700, color: item.stockBalance > 0 ? T.success : T.danger }}>{item.stockBalance}</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                    <span style={{ padding: '4px 8px', borderRadius: 12, background: item.stockBalance > 0 ? T.successBg : T.dangerBg, color: item.stockBalance > 0 ? T.success : T.danger, fontSize: 11, fontWeight: 700 }}>
                      {item.stockBalance > 0 ? 'In Stock' : 'Empty'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ParadiseStoreInventory;