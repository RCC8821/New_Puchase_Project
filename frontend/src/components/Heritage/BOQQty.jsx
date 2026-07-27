import React, { useState, useMemo } from 'react';
import {
  Loader2, AlertCircle, Search, Filter, X, Package,
  ClipboardList, TrendingDown, CheckCircle, XCircle,
  RotateCcw, Layers, Archive, MapPin, Wrench, Boxes
} from 'lucide-react';
import { useGetBOQQtyQuery } from '../../redux/Signature/SignatureSlice';

const T = {
  navy: '#1e293b', navyLight: '#334155', navyDark: '#0f172a',
  gold: '#f59e0b', goldLight: '#fbbf24', goldDark: '#d97706',
  card: '#ffffff', text: '#1e293b',
  textLight: '#64748b', textMuted: '#94a3b8',
  border: '#e2e8f0', borderLight: '#f1f5f9',
  success: '#10b981', successBg: '#ecfdf5', successBorder: '#a7f3d0',
  danger: '#ef4444', dangerBg: '#fef2f2', dangerBorder: '#fecaca',
  purple: '#7c3aed', purpleBg: '#faf5ff',
  blue: '#3b82f6', blueBg: '#eff6ff',
  warning: '#f59e0b', warningBg: '#fffbeb',
};

const inputBase = {
  width: '100%', padding: '10px 12px', fontSize: 13,
  border: `1.5px solid ${T.border}`, borderRadius: 8,
  outline: 'none', color: T.text, background: T.borderLight,
  transition: 'all 0.2s', boxSizing: 'border-box',
};

const focusGold = (e) => {
  e.target.style.borderColor = T.gold;
  e.target.style.boxShadow = `0 0 0 3px ${T.gold}15`;
  e.target.style.background = T.card;
};
const blurNormal = (e) => {
  e.target.style.borderColor = T.border;
  e.target.style.boxShadow = 'none';
  e.target.style.background = T.borderLight;
};

// Stat Card
const StatCard = ({ icon: Icon, label, value, color, bg, subtitle }) => (
  <div style={{
    background: T.card, borderRadius: 12, padding: '16px 18px',
    border: `1px solid ${T.border}`, borderLeft: `4px solid ${color}`,
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    display: 'flex', alignItems: 'center', gap: 14,
  }}>
    <div style={{
      width: 44, height: 44, borderRadius: 10, background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <Icon size={22} color={color} />
    </div>
    <div style={{ flex: 1 }}>
      <p style={{ fontSize: 11, color: T.textMuted, margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </p>
      <p style={{ fontSize: 20, fontWeight: 800, color: T.navy, margin: '2px 0 0' }}>
        {value}
      </p>
      {subtitle && (
        <p style={{ fontSize: 10, color: T.textMuted, margin: '2px 0 0' }}>
          {subtitle}
        </p>
      )}
    </div>
  </div>
);

const BOQQty = () => {
  const { data: response, isLoading, isError, error, refetch, isFetching } =
    useGetBOQQtyQuery();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCluster, setSelectedCluster] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedActivity, setSelectedActivity] = useState('');
  const [selectedMaterialType, setSelectedMaterialType] = useState('');
  const [balanceFilter, setBalanceFilter] = useState('');

  const boqData = response?.data || [];
  const uv = response?.uniqueValues || {};
  const stats = response?.stats || {};

  // Filtered locations by cluster
  const availableLocations = useMemo(() => {
    if (!selectedCluster) return uv.locations || [];
    const filtered = boqData
      .filter(d => d.cluster === selectedCluster)
      .map(d => d.location)
      .filter(Boolean);
    return [...new Set(filtered)].sort();
  }, [selectedCluster, boqData, uv.locations]);

  // Filtered Data
  const filteredData = useMemo(() => {
    return boqData.filter(item => {
      // Search
      const search = searchTerm.toLowerCase().trim();
      const matchesSearch = !search || (
        item.cluster?.toLowerCase().includes(search) ||
        item.location?.toLowerCase().includes(search) ||
        item.activity?.toLowerCase().includes(search) ||
        item.materialType?.toLowerCase().includes(search) ||
        item.materialName?.toLowerCase().includes(search) ||
        item.materialSize?.toLowerCase().includes(search) ||
        item.materialSpecification?.toLowerCase().includes(search) ||
        item.skuCode?.toLowerCase().includes(search)
      );

      if (!matchesSearch) return false;

      // Cluster filter
      if (selectedCluster && item.cluster !== selectedCluster) return false;

      // Location filter
      if (selectedLocation && item.location !== selectedLocation) return false;

      // Activity filter
      if (selectedActivity && item.activity !== selectedActivity) return false;

      // Material Type filter
      if (selectedMaterialType && item.materialType !== selectedMaterialType) return false;

      // Balance filter
      if (balanceFilter === 'available' && item.balance <= 0) return false;
      if (balanceFilter === 'exhausted' && item.balance > 0) return false;

      return true;
    });
  }, [boqData, searchTerm, selectedCluster, selectedLocation, selectedActivity, selectedMaterialType, balanceFilter]);

  // Filtered stats
  const filteredStats = useMemo(() => ({
    total: filteredData.length,
    totalBalance: filteredData.reduce((sum, d) => sum + d.balance, 0),
    totalOutQty: filteredData.reduce((sum, d) => sum + d.outQty, 0),
  }), [filteredData]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCluster('');
    setSelectedLocation('');
    setSelectedActivity('');
    setSelectedMaterialType('');
    setBalanceFilter('');
  };

  const hasFilters = searchTerm || selectedCluster || selectedLocation ||
                     selectedActivity || selectedMaterialType || balanceFilter;

  // Loading
  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px' }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14,
          background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20, boxShadow: `0 0 0 3px ${T.gold}30`,
        }}>
          <Loader2 size={28} color={T.gold} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
        <p style={{ fontSize: 15, fontWeight: 600, color: T.navy }}>Loading BOQ Data...</p>
        <p style={{ fontSize: 13, color: T.textMuted }}>Fetching quantity records</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Error
  if (isError) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px' }}>
        <AlertCircle size={40} color={T.danger} style={{ marginBottom: 12 }} />
        <p style={{ fontSize: 15, fontWeight: 600, color: T.danger }}>Failed to Load BOQ</p>
        <p style={{ fontSize: 13, color: T.textMuted, marginBottom: 16 }}>
          {error?.data?.error || 'Something went wrong'}
        </p>
        <button onClick={refetch} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 18px', borderRadius: 8, border: 'none',
          background: T.danger, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>
          <RotateCcw size={14} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 8px' }}>

      {/* HEADER */}
      <div style={{
        background: T.card, borderRadius: 10, border: `1px solid ${T.border}`,
        padding: '14px 18px', marginBottom: 14,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ClipboardList size={20} color={T.gold} />
          </div>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: T.navy, margin: 0 }}>
              BOQ Quantity
            </h2>
            <p style={{ fontSize: 12, color: T.textMuted, margin: 0 }}>
              Signature Heritage — Bill of Quantities
            </p>
          </div>
        </div>
        <button onClick={refetch} disabled={isFetching}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '9px 16px', borderRadius: 8,
            border: `1.5px solid ${T.border}`, background: T.card,
            color: T.textLight, fontSize: 13, fontWeight: 600,
            cursor: isFetching ? 'not-allowed' : 'pointer',
          }}>
          <RotateCcw size={14} style={isFetching ? { animation: 'spin 0.8s linear infinite' } : {}} />
          Refresh
        </button>
      </div>

      {/* STATS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 12, marginBottom: 14,
      }}>
        <StatCard
          icon={Layers}
          label="Total BOQ Items"
          value={stats.total || 0}
          color={T.navy}
          bg={`${T.navy}10`}
          subtitle="All records"
        />
        <StatCard
          icon={CheckCircle}
          label="Available"
          value={stats.available || 0}
          color={T.success}
          bg={T.successBg}
          subtitle={`${stats.total > 0 ? ((stats.available / stats.total) * 100).toFixed(0) : 0}% with balance`}
        />
        <StatCard
          icon={XCircle}
          label="Exhausted"
          value={stats.exhausted || 0}
          color={T.danger}
          bg={T.dangerBg}
          subtitle={`${stats.total > 0 ? ((stats.exhausted / stats.total) * 100).toFixed(0) : 0}% zero balance`}
        />
        <StatCard
          icon={Archive}
          label="Total Balance"
          value={(stats.totalBalance || 0).toLocaleString('en-IN')}
          color={T.purple}
          bg={T.purpleBg}
          subtitle="Remaining quantity"
        />
      </div>

      {/* FILTERS */}
      <div style={{
        background: T.card, borderRadius: 10, border: `1px solid ${T.border}`,
        padding: '12px 16px', marginBottom: 12,
      }}>
        {/* Row 1: Search + Count */}
        <div
          className="filter-grid-1"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto auto',
            gap: 10, alignItems: 'end', marginBottom: 10,
          }}
        >
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: T.navyLight, marginBottom: 4 }}>
              <Search size={11} style={{ display: 'inline', marginRight: 4 }} />
              Search BOQ
            </label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.textMuted }} />
              <input type="text"
                placeholder="Cluster, Location, Activity, Material, SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ ...inputBase, paddingLeft: 36 }}
                onFocus={focusGold} onBlur={blurNormal} />
            </div>
          </div>

          {hasFilters && (
            <button onClick={clearFilters}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '10px 14px', borderRadius: 8,
                border: `1.5px solid ${T.dangerBorder}`,
                background: T.dangerBg, color: T.danger,
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                height: 40,
              }}>
              <X size={14} /> Clear All
            </button>
          )}

          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '10px 14px', background: T.borderLight, borderRadius: 8,
            fontSize: 13, color: T.textLight, fontWeight: 600,
            height: 40,
          }}>
            <Filter size={14} />
            <span style={{ color: T.gold, fontWeight: 700 }}>{filteredData.length}</span>
            <span style={{ color: T.textMuted, fontSize: 11 }}>items</span>
          </div>
        </div>

        {/* Row 2: Dropdown Filters */}
        <div
          className="filter-grid-2"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 10,
          }}
        >
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: T.navyLight, marginBottom: 4 }}>
              <MapPin size={11} style={{ display: 'inline', marginRight: 4 }} />
              Cluster
            </label>
            <select value={selectedCluster}
              onChange={(e) => {
                setSelectedCluster(e.target.value);
                setSelectedLocation('');
              }}
              style={{ ...inputBase, cursor: 'pointer', appearance: 'none' }}
              onFocus={focusGold} onBlur={blurNormal}>
              <option value="">All Clusters</option>
              {(uv.clusters || []).map((c, i) => (
                <option key={i} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: T.navyLight, marginBottom: 4 }}>
              <MapPin size={11} style={{ display: 'inline', marginRight: 4 }} />
              Location
            </label>
            <select value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              disabled={availableLocations.length === 0}
              style={{ ...inputBase, cursor: 'pointer', appearance: 'none' }}
              onFocus={focusGold} onBlur={blurNormal}>
              <option value="">All Locations</option>
              {availableLocations.map((l, i) => (
                <option key={i} value={l}>{l}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: T.navyLight, marginBottom: 4 }}>
              <Wrench size={11} style={{ display: 'inline', marginRight: 4 }} />
              Activity
            </label>
            <select value={selectedActivity}
              onChange={(e) => setSelectedActivity(e.target.value)}
              style={{ ...inputBase, cursor: 'pointer', appearance: 'none' }}
              onFocus={focusGold} onBlur={blurNormal}>
              <option value="">All Activities</option>
              {(uv.activities || []).map((a, i) => (
                <option key={i} value={a}>{a}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: T.navyLight, marginBottom: 4 }}>
              <Package size={11} style={{ display: 'inline', marginRight: 4 }} />
              Material Type
            </label>
            <select value={selectedMaterialType}
              onChange={(e) => setSelectedMaterialType(e.target.value)}
              style={{ ...inputBase, cursor: 'pointer', appearance: 'none' }}
              onFocus={focusGold} onBlur={blurNormal}>
              <option value="">All Types</option>
              {(uv.materialTypes || []).map((t, i) => (
                <option key={i} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: T.navyLight, marginBottom: 4 }}>
              <Boxes size={11} style={{ display: 'inline', marginRight: 4 }} />
              Balance Status
            </label>
            <select value={balanceFilter}
              onChange={(e) => setBalanceFilter(e.target.value)}
              style={{ ...inputBase, cursor: 'pointer', appearance: 'none' }}
              onFocus={focusGold} onBlur={blurNormal}>
              <option value="">All Balance</option>
              <option value="available">✅ Available</option>
              <option value="exhausted">❌ Exhausted</option>
            </select>
          </div>
        </div>

        {/* Active Filter Chips */}
        {(selectedCluster || selectedLocation || selectedActivity || selectedMaterialType || balanceFilter) && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            marginTop: 10, paddingTop: 10,
            borderTop: `1px dashed ${T.border}`,
            flexWrap: 'wrap',
          }}>
            <span style={{ fontSize: 11, color: T.textMuted, fontWeight: 600 }}>
              🔍 Active:
            </span>
            {selectedCluster && (
              <span style={{
                background: `${T.gold}15`, color: T.goldDark,
                padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                display: 'inline-flex', alignItems: 'center', gap: 4,
              }}>
                {selectedCluster}
                <button onClick={() => { setSelectedCluster(''); setSelectedLocation(''); }} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: T.goldDark, padding: 0, display: 'flex',
                }}><X size={11} /></button>
              </span>
            )}
            {selectedLocation && (
              <span style={{
                background: `${T.blue}15`, color: T.blue,
                padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                display: 'inline-flex', alignItems: 'center', gap: 4,
              }}>
                {selectedLocation}
                <button onClick={() => setSelectedLocation('')} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: T.blue, padding: 0, display: 'flex',
                }}><X size={11} /></button>
              </span>
            )}
            {selectedActivity && (
              <span style={{
                background: `${T.purple}15`, color: T.purple,
                padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                display: 'inline-flex', alignItems: 'center', gap: 4,
              }}>
                {selectedActivity}
                <button onClick={() => setSelectedActivity('')} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: T.purple, padding: 0, display: 'flex',
                }}><X size={11} /></button>
              </span>
            )}
            {selectedMaterialType && (
              <span style={{
                background: `${T.success}15`, color: T.success,
                padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                display: 'inline-flex', alignItems: 'center', gap: 4,
              }}>
                {selectedMaterialType}
                <button onClick={() => setSelectedMaterialType('')} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: T.success, padding: 0, display: 'flex',
                }}><X size={11} /></button>
              </span>
            )}
            {balanceFilter && (
              <span style={{
                background: balanceFilter === 'available' ? `${T.success}15` : `${T.danger}15`,
                color: balanceFilter === 'available' ? T.success : T.danger,
                padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                display: 'inline-flex', alignItems: 'center', gap: 4,
              }}>
                {balanceFilter === 'available' ? '✅ Available' : '❌ Exhausted'}
                <button onClick={() => setBalanceFilter('')} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: balanceFilter === 'available' ? T.success : T.danger,
                  padding: 0, display: 'flex',
                }}><X size={11} /></button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* TABLE */}
      <div style={{
        background: T.card, borderRadius: 10,
        border: `1px solid ${T.border}`, overflow: 'hidden',
      }}>
        {filteredData.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px' }}>
            <Package size={40} color={T.border} style={{ marginBottom: 12 }} />
            <p style={{ fontSize: 15, fontWeight: 500, color: T.textLight }}>No records found</p>
            {hasFilters && (
              <button onClick={clearFilters}
                style={{
                  marginTop: 12, padding: '8px 18px', borderRadius: 8,
                  border: `1.5px solid ${T.gold}`, background: `${T.gold}10`,
                  color: T.goldDark, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                <X size={14} /> Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto', maxHeight: '70vh', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                <tr style={{ background: T.navy }}>
                  {[
                    { l: '#', w: 50, c: true },
                    { l: 'Cluster', w: 100 },
                    { l: 'Location', w: 120 },
                    { l: 'Activity', w: 120 },
                    { l: 'Material Type', w: 130 },
                    { l: 'Material Name', w: 160 },
                    { l: 'Size', w: 110 },
                    { l: 'Specification', w: 130 },
                    { l: 'SKU', w: 100 },
                    { l: 'Out Qty', w: 90, c: true },
                    { l: 'Revise BOQ', w: 100, c: true },
                    { l: 'Balance', w: 110, c: true },
                    { l: 'Status', w: 110, c: true },
                  ].map((col, i) => (
                    <th key={i} style={{
                      padding: '12px 14px',
                      textAlign: col.c ? 'center' : 'left',
                      color: T.goldLight, fontSize: 11, fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: 0.5,
                      whiteSpace: 'nowrap', minWidth: col.w,
                      borderBottom: `2px solid ${T.gold}`,
                    }}>{col.l}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, idx) => {
                  const isAvailable = item.balance > 0;
                  return (
                    <tr key={item.id} style={{
                      background: idx % 2 === 0 ? T.card : T.borderLight,
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = `${T.gold}08`; }}
                      onMouseLeave={e => { e.currentTarget.style.background = idx % 2 === 0 ? T.card : T.borderLight; }}>
                      <td style={{ padding: '10px 14px', textAlign: 'center', borderBottom: `1px solid ${T.border}`, fontSize: 12, color: T.textMuted, fontWeight: 600 }}>
                        {idx + 1}
                      </td>
                      <td style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}` }}>
                        <span style={{
                          background: `${T.gold}15`, color: T.goldDark,
                          padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700,
                        }}>
                          {item.cluster || '—'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}`, fontWeight: 600 }}>
                        {item.location || '—'}
                      </td>
                      <td style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}` }}>
                        {item.activity ? (
                          <span style={{
                            background: `${T.purple}15`, color: T.purple,
                            padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                          }}>{item.activity}</span>
                        ) : '—'}
                      </td>
                      <td style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}`, fontWeight: 600 }}>
                        {item.materialType || '—'}
                      </td>
                      <td style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}`, fontWeight: 600 }}>
                        {item.materialName || '—'}
                      </td>
                      <td style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}` }}>
                        {item.materialSize || '—'}
                      </td>
                      <td style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}` }}>
                        {item.materialSpecification && item.materialSpecification !== '-'
                          ? <span style={{
                              background: `${T.blue}15`, color: T.blue,
                              padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                            }}>{item.materialSpecification}</span>
                          : <span style={{ color: T.textMuted }}>—</span>}
                      </td>
                      <td style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}` }}>
                        <span style={{
                          background: `${T.navy}15`, color: T.navy,
                          padding: '3px 8px', borderRadius: 6,
                          fontSize: 11, fontWeight: 700, fontFamily: 'monospace',
                        }}>
                          {item.skuCode || 'N/A'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center', borderBottom: `1px solid ${T.border}` }}>
                        <span style={{
                          background: `${T.blue}15`, color: T.blue,
                          padding: '3px 10px', borderRadius: 6,
                          fontSize: 12, fontWeight: 700,
                        }}>
                          {item.outQty.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center', borderBottom: `1px solid ${T.border}` }}>
                        {item.reviseBOQ > 0 ? (
                          <span style={{
                            background: `${T.warning}15`, color: '#92400e',
                            padding: '3px 10px', borderRadius: 6,
                            fontSize: 12, fontWeight: 700,
                          }}>
                            {item.reviseBOQ.toLocaleString('en-IN')}
                          </span>
                        ) : <span style={{ color: T.textMuted }}>—</span>}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center', borderBottom: `1px solid ${T.border}` }}>
                        <span style={{
                          background: isAvailable ? `${T.success}15` : `${T.danger}15`,
                          color: isAvailable ? T.success : T.danger,
                          padding: '4px 12px', borderRadius: 6,
                          fontSize: 13, fontWeight: 800,
                        }}>
                          {item.balance.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center', borderBottom: `1px solid ${T.border}` }}>
                        {isAvailable ? (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            background: T.successBg, color: T.success,
                            padding: '4px 10px', borderRadius: 12,
                            fontSize: 11, fontWeight: 700,
                            border: `1px solid ${T.successBorder}`,
                          }}>
                            <CheckCircle size={11} /> Available
                          </span>
                        ) : (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            background: T.dangerBg, color: T.danger,
                            padding: '4px 10px', borderRadius: 12,
                            fontSize: 11, fontWeight: 700,
                            border: `1px solid ${T.dangerBorder}`,
                          }}>
                            <XCircle size={11} /> Exhausted
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 900px) {
          .filter-grid-2 {
            grid-template-columns: 1fr 1fr !important;
          }
        }

        @media (max-width: 600px) {
          .filter-grid-1 {
            grid-template-columns: 1fr !important;
          }
          .filter-grid-2 {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default BOQQty;