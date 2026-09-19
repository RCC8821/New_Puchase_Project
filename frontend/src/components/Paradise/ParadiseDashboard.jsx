// frontend/src/components/Paradise/ParadiseDashboard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Package, HardHat, Briefcase, Building2, ChevronRight, ClipboardList } from 'lucide-react';

const T = {
  navy: '#1e293b', navyLight: '#334155', navyDark: '#0f172a',
  gold: '#f59e0b', goldLight: '#fbbf24', goldDark: '#d97706',
  card: '#ffffff', text: '#1e293b', textLight: '#64748b',
  border: '#e2e8f0', blue: '#3b82f6', purple: '#8b5cf6'
};

const ParadiseDashboard = () => {
  const navigate = useNavigate();
  const userType = sessionStorage.getItem('userType');
  const engineerName = sessionStorage.getItem('engineerName');
  const isSiteEngineer = userType?.startsWith('SE_');

  const buttons = [
    // ✅ Store Item Out Form (Mapped to paradiseOutForm)
    {
      id: 'paradise-out-form',
      title: 'Store Item Out Form',
      subtitle: 'Create material requirement form',
      icon: FileText,
      path: '/dashboard/paradise/out-form', // 👈 Route updated
      color: T.gold,
      bg: `linear-gradient(135deg, ${T.gold}15, ${T.gold}20)`,
      iconBg: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
      iconColor: T.navyDark,
      badge: 'FORM',
      allowedCheck: (role) => ['admin', 'Signature Requirement'].includes(role),
    },
    {
      id: 'store-inventory',
      title: 'Store Inventory',
      subtitle: 'Manage store & inventory data',
      icon: Package,
      path: '/dashboard/paradise/store-inventory',
      color: T.blue,
      bg: `linear-gradient(135deg, ${T.blue}15, ${T.blue}25)`,
      iconBg: `linear-gradient(135deg, ${T.blue}, #2563eb)`,
      iconColor: '#fff',
      badge: 'STORE',
      allowedCheck: (role) => ['admin', 'Signature Requirement', 'Store Inventory'].includes(role),
    },
    {
      id: 'site-engineer',
      title: 'Site Engineer',
      subtitle: isSiteEngineer ? `Your data - ${engineerName}` : 'Site engineer data & reports',
      icon: HardHat,
      path: '/dashboard/paradise/site-engineer',
      color: T.purple,
      bg: `linear-gradient(135deg, ${T.purple}15, ${T.purple}25)`,
      iconBg: `linear-gradient(135deg, ${T.purple}, #7c3aed)`,
      iconColor: '#fff',
      badge: 'SITE',
      allowedCheck: (role) => role === 'admin' || role?.startsWith('SE_'),
    },
    {
      id: 'boq-qty',
      title: 'BOQ Qty',
      subtitle: 'View Bill of Quantities & Balance',
      icon: ClipboardList,
      path: '/dashboard/paradise/boq-qty',
      color: '#f59e0b',
      bg: `linear-gradient(135deg, #f59e0b15, #f59e0b25)`,
      iconBg: `linear-gradient(135deg, #f59e0b, ${T.goldDark})`,
      iconColor: '#fff',
      badge: 'BOQ',
      allowedCheck: (role) => role === 'admin' || role === 'Signature Requirement' || role?.startsWith('SE_'),
    },
  ];

  const allowedButtons = buttons.filter(btn => btn.allowedCheck(userType));
  const displayName = isSiteEngineer ? engineerName : userType;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 8px' }}>
      {/* Header Card */}
      <div style={{
        background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`,
        borderRadius: 14, padding: '30px', marginBottom: 20, color: 'white',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)` }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ width: 60, height: 60, borderRadius: 14, background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={30} color={T.navyDark} />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: T.gold, background: `${T.gold}20`, padding: '3px 10px', borderRadius: 12 }}>JV PROJECT</span>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: '4px 0 0' }}>Signature Paradise</h1>
            <p style={{ fontSize: 13, color: '#cbd5e1', margin: '4px 0 0' }}>Select an option below to manage Paradise records</p>
          </div>
          <div style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12, color: '#e2e8f0' }}>
            👤 {displayName}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <div style={{ width: 4, height: 20, background: T.gold, borderRadius: 3 }} />
        <h2 style={{ fontSize: 15, fontWeight: 700, color: T.navy, margin: 0 }}>Available Modules ({allowedButtons.length})</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {allowedButtons.map((btn) => {
          const Icon = btn.icon;
          return (
            <button key={btn.id} onClick={() => navigate(btn.path)} style={{
              background: 'white', border: `1px solid ${T.border}`, borderRadius: 12, padding: 20, cursor: 'pointer',
              transition: 'all 0.25s ease', textAlign: 'left', position: 'relative', overflow: 'hidden'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 30px ${btn.color}25`; e.currentTarget.style.borderColor = btn.color; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = T.border; }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: T.navy, margin: '0 0 6px 0' }}>{btn.title}</h3>
              <p style={{ fontSize: 12, color: T.textLight, margin: '0 0 16px 0' }}>{btn.subtitle}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: `${btn.color}08`, borderRadius: 8, border: `1px solid ${btn.color}20` }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: btn.color }}>Open Module</span>
                <ChevronRight size={16} color={btn.color} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ParadiseDashboard;