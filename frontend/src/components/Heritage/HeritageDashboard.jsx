import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Package, HardHat, ArrowRight,
  Briefcase, Building2, ChevronRight
} from 'lucide-react';

const T = {
  navy: '#1e293b', navyLight: '#334155', navyDark: '#0f172a',
  gold: '#f59e0b', goldLight: '#fbbf24', goldDark: '#d97706',
  bg: '#f8fafc', card: '#ffffff', text: '#1e293b',
  textLight: '#64748b', textMuted: '#94a3b8',
  border: '#e2e8f0', borderLight: '#f1f5f9',
  success: '#10b981', successBg: '#ecfdf5',
  blue: '#3b82f6', blueBg: '#eff6ff',
  purple: '#8b5cf6', purpleBg: '#faf5ff',
};

const HeritageDashboard = () => {
  const navigate = useNavigate();
  const userType = sessionStorage.getItem('userType');
  const engineerName = sessionStorage.getItem('engineerName');

  // ✅ Check if user is Site Engineer
  const isSiteEngineer = userType?.startsWith('SE_');

  // ✅ Buttons Config with Access Control
  const buttons = [
    {
      id: 'signature-form',
      title: 'Signature Requirement',
      subtitle: 'Create material requirement form',
      icon: FileText,
      path: '/dashboard/heritage/signature-form',
      color: T.gold,
      bg: `linear-gradient(135deg, ${T.gold}15, ${T.goldDark}20)`,
      iconBg: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
      iconColor: T.navyDark,
      badge: 'FORM',
      // ✅ Sirf admin aur Signature Requirement (Site Engineer NAHI)
      allowedCheck: (userType) =>
        ['admin', 'Signature Requirement'].includes(userType),
    },
    {
      id: 'store-inventory',
      title: 'Store Inventory',
      subtitle: 'Manage store & inventory data',
      icon: Package,
      path: '/dashboard/heritage/store-inventory',
      color: T.blue,
      bg: `linear-gradient(135deg, ${T.blue}15, ${T.blue}25)`,
      iconBg: `linear-gradient(135deg, ${T.blue}, #2563eb)`,
      iconColor: '#fff',
      badge: 'STORE',
      // ✅ Sirf admin aur Signature Requirement (Site Engineer NAHI)
      allowedCheck: (userType) =>
        ['admin', 'Signature Requirement'].includes(userType),
    },
    {
      id: 'site-engineer',
      title: 'Site Engineer',
      subtitle: isSiteEngineer
        ? `Your data - ${engineerName}`
        : 'Site engineer data & reports',
      icon: HardHat,
      path: '/dashboard/heritage/site-engineer',
      color: T.purple,
      bg: `linear-gradient(135deg, ${T.purple}15, ${T.purple}25)`,
      iconBg: `linear-gradient(135deg, ${T.purple}, #7c3aed)`,
      iconColor: '#fff',
      badge: 'SITE',
      // ✅ Admin + Site Engineers (SE_ prefix)
      allowedCheck: (userType) =>
        userType === 'admin' || userType?.startsWith('SE_'),
    },
  ];

  // ✅ Filter buttons based on user access (SIRF EK BAAR)
  const allowedButtons = buttons.filter(btn => btn.allowedCheck(userType));

  // ✅ Display name
  const displayName = isSiteEngineer
    ? engineerName
    : userType;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 8px' }}>

      {/* ═══ Header Card ═══ */}
      <div style={{
        background: `linear-gradient(135deg, ${T.navy}, ${T.navyLight})`,
        borderRadius: 14,
        padding: 'clamp(20px, 4vw, 32px)',
        marginBottom: 20,
        color: 'white',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Gold accent */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, height: 3,
          background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)`,
        }} />

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
        }}>
          <div style={{
            width: 60, height: 60, borderRadius: 14,
            background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            boxShadow: `0 0 0 3px ${T.gold}30`,
          }}>
            <Building2 size={30} color={T.navyDark} />
          </div>

          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 4,
            }}>
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                color: T.gold,
                background: `${T.gold}20`,
                padding: '3px 10px',
                borderRadius: 12,
                letterSpacing: 1,
              }}>
                JV PROJECT
              </span>
            </div>
            <h1 style={{
              fontSize: 'clamp(20px, 4vw, 26px)',
              fontWeight: 700,
              margin: 0,
              letterSpacing: 0.5,
            }}>
              Signature Heritage
            </h1>
            <p style={{
              fontSize: 13,
              color: '#cbd5e1',
              margin: '4px 0 0',
            }}>
              {isSiteEngineer
                ? `Welcome, ${engineerName}`
                : 'Select an option below to continue'}
            </p>
          </div>

          <div style={{
            padding: '8px 14px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 8,
            fontSize: 12,
            color: '#e2e8f0',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            {isSiteEngineer ? '👷' : '👤'} {displayName}
            {isSiteEngineer && (
              <span style={{
                fontSize: 9,
                background: T.gold,
                color: T.navyDark,
                padding: '2px 6px',
                borderRadius: 8,
                fontWeight: 700,
              }}>
                ENGINEER
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ═══ Section Title ═══ */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
        paddingLeft: 4,
      }}>
        <div style={{
          width: 4, height: 20, background: T.gold, borderRadius: 3,
        }} />
        <h2 style={{
          fontSize: 15,
          fontWeight: 700,
          color: T.navy,
          margin: 0,
        }}>
          Available Modules ({allowedButtons.length})
        </h2>
      </div>

      {/* ═══ Buttons Grid ═══ */}
      {allowedButtons.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
        }}>
          {allowedButtons.map((btn) => {
            const Icon = btn.icon;
            return (
              <button
                key={btn.id}
                onClick={() => navigate(btn.path)}
                style={{
                  background: T.card,
                  border: `1px solid ${T.border}`,
                  borderRadius: 12,
                  padding: 20,
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  textAlign: 'left',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `0 12px 30px ${btn.color}25`;
                  e.currentTarget.style.borderColor = btn.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                  e.currentTarget.style.borderColor = T.border;
                }}
              >
                {/* Background gradient */}
                <div style={{
                  position: 'absolute',
                  top: 0, right: 0,
                  width: 100, height: 100,
                  background: btn.bg,
                  borderRadius: '0 12px 0 100%',
                  opacity: 0.4,
                }} />

                {/* Badge */}
                <span style={{
                  position: 'absolute',
                  top: 14,
                  right: 14,
                  fontSize: 9,
                  fontWeight: 700,
                  color: btn.color,
                  background: `${btn.color}15`,
                  padding: '3px 8px',
                  borderRadius: 10,
                  letterSpacing: 0.5,
                }}>
                  {btn.badge}
                </span>

                {/* Icon */}
                <div style={{
                  width: 52, height: 52, borderRadius: 12,
                  background: btn.iconBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 14,
                  position: 'relative',
                  zIndex: 1,
                  boxShadow: `0 4px 14px ${btn.color}30`,
                }}>
                  <Icon size={26} color={btn.iconColor} />
                </div>

                {/* Title */}
                <h3 style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: T.navy,
                  margin: '0 0 6px 0',
                  position: 'relative',
                  zIndex: 1,
                }}>
                  {btn.title}
                </h3>

                {/* Subtitle */}
                <p style={{
                  fontSize: 12,
                  color: T.textLight,
                  margin: '0 0 16px 0',
                  position: 'relative',
                  zIndex: 1,
                }}>
                  {btn.subtitle}
                </p>

                {/* Action */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  background: `${btn.color}08`,
                  borderRadius: 8,
                  border: `1px solid ${btn.color}20`,
                  position: 'relative',
                  zIndex: 1,
                }}>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: btn.color,
                  }}>
                    Open Module
                  </span>
                  <ChevronRight size={16} color={btn.color} />
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div style={{
          background: T.card,
          borderRadius: 12,
          border: `1px solid ${T.border}`,
          padding: 40,
          textAlign: 'center',
          color: T.textMuted,
        }}>
          <Briefcase size={48} style={{ marginBottom: 12, opacity: 0.4 }} />
          <p style={{ fontSize: 14, fontWeight: 500, color: T.textLight }}>
            No modules available for your access level.
          </p>
        </div>
      )}
    </div>
  );
};

export default HeritageDashboard;