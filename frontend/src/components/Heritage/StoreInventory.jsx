import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Construction } from 'lucide-react';

const T = {
  navy: '#1e293b', gold: '#f59e0b', goldDark: '#d97706',
  card: '#ffffff', border: '#e2e8f0',
  text: '#1e293b', textLight: '#64748b', textMuted: '#94a3b8',
  blue: '#3b82f6', blueBg: '#eff6ff',
};

const StoreInventory = () => {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 8px' }}>

      {/* Back Button */}
      <button
        onClick={() => navigate('/dashboard/heritage')}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 14px', borderRadius: 8,
          border: `1px solid ${T.border}`, background: T.card,
          color: T.textLight, fontSize: 13, fontWeight: 500,
          cursor: 'pointer', marginBottom: 16,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = T.navy;
          e.currentTarget.style.color = T.navy;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = T.border;
          e.currentTarget.style.color = T.textLight;
        }}
      >
        <ArrowLeft size={14} /> Back to Heritage
      </button>

      {/* Content Card */}
      <div style={{
        background: T.card,
        borderRadius: 12,
        border: `1px solid ${T.border}`,
        padding: 'clamp(30px, 5vw, 50px)',
        textAlign: 'center',
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: 20,
          background: T.blueBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <Package size={40} color={T.blue} />
        </div>

        <h1 style={{
          fontSize: 22, fontWeight: 700,
          color: T.navy, margin: '0 0 8px',
        }}>
          Store Inventory
        </h1>

        <p style={{
          fontSize: 13, color: T.textLight,
          margin: '0 0 24px', maxWidth: 400,
          marginLeft: 'auto', marginRight: 'auto',
        }}>
          This module is under construction. Store inventory management form will be available here soon.
        </p>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '10px 18px', borderRadius: 10,
          background: `${T.gold}10`, color: T.goldDark,
          fontSize: 12, fontWeight: 600,
          border: `1px dashed ${T.gold}`,
        }}>
          <Construction size={14} />
          Coming Soon
        </div>
      </div>
    </div>
  );
};

export default StoreInventory;