

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── API ────────────────────────────────────────────────
const loginAPI = async (email, password) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      }
    );
    const result = await response.json();
    if (!response.ok) {
      return { success: false, error: result.error || 'Login failed' };
    }
    return { success: true, token: result.token, userType: result.userType };
  } catch {
    throw new Error('Network error. Please try again.');
  }
};

// ─── STATIC USER TYPE MAP ────────────────────────────────
const STATIC_USER_TYPE_MAP = {
  Admin: 'admin',
  'Site Engineer': 'Site Engineer',
  'Ravindra Singh': 'Ravindra Singh',
  'Ravi Rajak': 'Ravi Rajak',
  'Anjali Malviya': 'Anjali Malviya',
  'Neha Masani': 'Neha Masani',
  'Material Received': 'Material Received',
  'Varsha Kahar': 'Varsha Kahar',
  'Abhishek Sharma': 'Abhishek Sharma',
  'Govind Ram Nagar': 'Govind Ram Nagar',
  'Vinod Gayakwad': 'Vinod Gayakwad',
  'Ashok Pandey': 'Ashok Pandey',
  'Final Material Received': 'Final Material Received',
  'Labour Managment': 'Labour Managment',
  'Signature Requirement': 'Signature Requirement',
};

// ─── THEME COLORS ────────────────────────────────────────
const THEME = {
  navy: '#1e293b',
  navyLight: '#334155',
  navyDark: '#0f172a',
  gold: '#f59e0b',
  goldLight: '#fbbf24',
  goldDark: '#d97706',
  bg: '#f8fafc',
  card: '#ffffff',
  text: '#1e293b',
  textLight: '#64748b',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  success: '#10b981',
  danger: '#ef4444',
  dangerBg: '#fef2f2',
  dangerBorder: '#fecaca',
};

// ─── EYE ICONS ───────────────────────────────────────────
const EyeIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

// ─── SPLASH SCREEN ───────────────────────────────────────
const SplashScreen = () => (
  <div style={{
    position: 'fixed',
    inset: 0,
    background: `linear-gradient(145deg, ${THEME.navyDark} 0%, ${THEME.navy} 50%, ${THEME.navyLight} 100%)`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  }}>
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 3,
      background: `linear-gradient(90deg, transparent, ${THEME.gold}, transparent)`,
    }} />

    <div style={{
      width: 90,
      height: 90,
      borderRadius: 16,
      background: THEME.card,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 28,
      boxShadow: `0 0 0 3px ${THEME.gold}40, 0 20px 50px rgba(0,0,0,0.3)`,
    }}>
      <img
        src="/rcc-logo.png"
        alt="RCC Logo"
        style={{ width: 55, height: 55, objectFit: 'contain' }}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
          e.currentTarget.parentElement.innerHTML =
            `<span style="font-size:28px;font-weight:800;color:${THEME.navy}">RCC</span>`;
        }}
      />
    </div>

    <h1 style={{
      color: THEME.card,
      fontSize: 24,
      fontWeight: 700,
      letterSpacing: 1.5,
      marginBottom: 8,
      textAlign: 'center',
    }}>
      RCC Purchase Management
    </h1>

    <div style={{
      width: 50,
      height: 3,
      background: THEME.gold,
      borderRadius: 3,
      marginBottom: 12,
    }} />

    <p style={{
      color: THEME.textMuted,
      fontSize: 13,
      marginBottom: 36,
      letterSpacing: 0.5,
    }}>
      Preparing your workspace...
    </p>

    <div style={{
      width: 240,
      height: 3,
      borderRadius: 3,
      background: 'rgba(255,255,255,0.1)',
      overflow: 'hidden',
    }}>
      <div style={{
        height: '100%',
        borderRadius: 3,
        background: `linear-gradient(90deg, ${THEME.gold}, ${THEME.goldLight})`,
        animation: 'progressBar 2.5s ease-in-out forwards',
      }} />
    </div>

    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 3,
      background: `linear-gradient(90deg, transparent, ${THEME.gold}, transparent)`,
    }} />

    <style>{`
      @keyframes progressBar {
        0%   { width: 0%; }
        20%  { width: 25%; }
        50%  { width: 55%; }
        80%  { width: 85%; }
        100% { width: 100%; }
      }
    `}</style>
  </div>
);

// ════════════════════════════════════════════════════════
//  LOGIN COMPONENT
// ════════════════════════════════════════════════════════
const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSplash, setShowSplash] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (token) { navigate('/dashboard'); return; }
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  }, []);

  const isFormValid = useMemo(
    () => formData.email.trim() && formData.password.trim(),
    [formData]
  );

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (!isFormValid) { setError('Please fill in all fields'); return; }
  //   setIsLoading(true);
  //   setError('');
  //   try {
  //     const result = await loginAPI(formData.email.trim(), formData.password.trim());
  //     if (result.success) {
  //       // ✅ Check for dynamic Site Engineer type (SE_ prefix)
  //       let frontendUserType;

  //       if (result.userType?.startsWith('SE_')) {
  //         // Site Engineer - keep as-is (e.g., "SE_Rahul Sharma")
  //         frontendUserType = result.userType;

  //         // ✅ Store engineer name separately (for dashboard filtering)
  //         const engineerName = result.userType.replace('SE_', '');
  //         sessionStorage.setItem('engineerName', engineerName);
  //       } else {
  //         // Static user type
  //         frontendUserType = STATIC_USER_TYPE_MAP[result.userType] || 'user';
  //         // Clear engineer name if not a site engineer
  //         sessionStorage.removeItem('engineerName');
  //       }

  //       sessionStorage.setItem('token', result.token);
  //       sessionStorage.setItem('userType', frontendUserType);

  //       navigate('/dashboard');
  //     } else {
  //       setError(result.error || 'Login failed');
  //     }
  //   } catch (err) {
  //     setError(err.message || 'Something went wrong');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!isFormValid) { setError('Please fill in all fields'); return; }
  setIsLoading(true);
  setError('');
  try {
    const result = await loginAPI(formData.email.trim(), formData.password.trim());
    if (result.success) {
      let frontendUserType;

      if (result.userType?.startsWith('SE_')) {
        // Site Engineer
        frontendUserType = result.userType;
        const engineerName = result.userType.replace('SE_', '');
        sessionStorage.setItem('engineerName', engineerName);
        sessionStorage.removeItem('projectLockedName');
      }
      // ✅ UPDATED - Project-Locked User (Flexible Pattern)
      // Matches: "Signature Heritage PRJ024", "Signature Peradise PRJ028", etc.
      else if (/^signature\s+.+\s+prj\d+/i.test(result.userType || '')) {
        frontendUserType = result.userType; // e.g., "Signature Peradise PRJ028"

        // ✅ Save project name for auto-fill in form
        sessionStorage.setItem('projectLockedName', result.userType);
        sessionStorage.removeItem('engineerName');
      }
      else {
        // Static user type
        frontendUserType = STATIC_USER_TYPE_MAP[result.userType] || 'user';
        sessionStorage.removeItem('engineerName');
        sessionStorage.removeItem('projectLockedName');
      }

      sessionStorage.setItem('token', result.token);
      sessionStorage.setItem('userType', frontendUserType);

      navigate('/dashboard');
    } else {
      setError(result.error || 'Login failed');
    }
  } catch (err) {
    setError(err.message || 'Something went wrong');
  } finally {
    setIsLoading(false);
  }
};

  
  if (showSplash) return <SplashScreen />;

  const inputBase = {
    width: '100%',
    padding: '12px 14px',
    fontSize: 14,
    border: `1.5px solid ${THEME.border}`,
    borderRadius: 8,
    outline: 'none',
    color: THEME.text,
    background: THEME.borderLight,
    transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
    boxSizing: 'border-box',
  };

  const handleFocus = (e) => {
    e.target.style.borderColor = THEME.gold;
    e.target.style.boxShadow = `0 0 0 3px ${THEME.gold}15`;
    e.target.style.background = THEME.card;
  };

  const handleBlur = (e) => {
    e.target.style.borderColor = THEME.border;
    e.target.style.boxShadow = 'none';
    e.target.style.background = THEME.borderLight;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: THEME.bg,
      display: 'flex',
      fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
    }}>

      {/* ── LEFT SIDE - Navy Branding Panel ── */}
      <div style={{
        width: 420,
        minHeight: '100vh',
        background: `linear-gradient(170deg, ${THEME.navyDark} 0%, ${THEME.navy} 60%, ${THEME.navyLight} 100%)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 32px',
        position: 'relative',
        overflow: 'hidden',
      }}
        className="hidden-mobile"
      >
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, transparent, ${THEME.gold}, transparent)`,
        }} />

        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.03,
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: 14,
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 28px',
            boxShadow: `0 0 0 3px ${THEME.gold}50, 0 10px 30px rgba(0,0,0,0.2)`,
          }}>
            <img
              src="/rcc-logo.png"
              alt="RCC"
              style={{ width: 48, height: 48, objectFit: 'contain' }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement.innerHTML =
                  `<span style="font-size:26px;font-weight:800;color:${THEME.navy}">RCC</span>`;
              }}
            />
          </div>

          <h2 style={{
            color: 'white',
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 8,
            letterSpacing: 0.5,
          }}>
            Purchase Management
          </h2>

          <div style={{
            width: 40,
            height: 3,
            background: THEME.gold,
            borderRadius: 3,
            margin: '0 auto 16px',
          }} />

          <p style={{
            color: '#94a3b8',
            fontSize: 13,
            lineHeight: 1.7,
            maxWidth: 280,
          }}>
            Streamline your procurement process with our comprehensive purchase management system
          </p>

          <div style={{ marginTop: 36, textAlign: 'left' }}>
            {[
              'Purchase Order Management',
              'Vendor & Material Tracking',
              'Billing & Payment Processing',
              'Real-time Reports & Analytics',
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 0',
                color: '#cbd5e1',
                fontSize: 13,
              }}>
                <span style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: THEME.gold,
                  flexShrink: 0,
                }} />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, transparent, ${THEME.gold}, transparent)`,
        }} />
      </div>

      {/* ── RIGHT SIDE - Login Form ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 24px',
      }}>
        <div style={{ width: '100%', maxWidth: 380 }}>

          <div className="show-mobile" style={{
            display: 'none',
            textAlign: 'center',
            marginBottom: 24,
          }}>
            <div style={{
              width: 60,
              height: 60,
              borderRadius: 12,
              background: THEME.navy,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}>
              <img
                src="/rcc-logo.png"
                alt="RCC"
                style={{ width: 36, height: 36, objectFit: 'contain' }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement.innerHTML =
                    '<span style="font-size:18px;font-weight:800;color:white">RCC</span>';
                }}
              />
            </div>
          </div>

          <div style={{
            background: THEME.card,
            borderRadius: 14,
            padding: '36px 28px 28px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 20px rgba(0,0,0,0.06)',
            border: `1px solid ${THEME.border}`,
          }}>

            <div style={{ marginBottom: 28 }}>
              <h1 style={{
                fontSize: 22,
                fontWeight: 700,
                color: THEME.navy,
                marginBottom: 6,
              }}>
                Welcome Back
              </h1>
              <p style={{
                fontSize: 13,
                color: THEME.textLight,
                margin: 0,
              }}>
                Sign in to your account to continue
              </p>
            </div>

            <form onSubmit={handleSubmit}>

              <div style={{ marginBottom: 18 }}>
                <label style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 600,
                  color: THEME.navyLight,
                  marginBottom: 6,
                  letterSpacing: 0.3,
                }}>
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="you@company.com"
                  disabled={isLoading}
                  autoComplete="email"
                  style={inputBase}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 600,
                  color: THEME.navyLight,
                  marginBottom: 6,
                  letterSpacing: 0.3,
                }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    disabled={isLoading}
                    autoComplete="current-password"
                    style={{ ...inputBase, paddingRight: 44 }}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    tabIndex={-1}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: THEME.textMuted,
                      padding: 0,
                      display: 'flex',
                    }}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              {error && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 14px',
                  background: THEME.dangerBg,
                  border: `1px solid ${THEME.dangerBorder}`,
                  borderRadius: 8,
                  marginBottom: 18,
                  fontSize: 13,
                  color: THEME.danger,
                }}>
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !isFormValid}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: 14,
                  fontWeight: 600,
                  color: isLoading || !isFormValid ? THEME.textMuted : THEME.navyDark,
                  background: isLoading || !isFormValid
                    ? THEME.border
                    : `linear-gradient(135deg, ${THEME.gold}, ${THEME.goldLight})`,
                  border: 'none',
                  borderRadius: 8,
                  cursor: isLoading || !isFormValid ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: isLoading || !isFormValid
                    ? 'none'
                    : `0 2px 8px ${THEME.gold}40`,
                  letterSpacing: 0.3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
                onMouseEnter={(e) => {
                  if (!isLoading && isFormValid) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = `0 4px 14px ${THEME.gold}50`;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  if (!isLoading && isFormValid) {
                    e.currentTarget.style.boxShadow = `0 2px 8px ${THEME.gold}40`;
                  }
                }}
              >
                {isLoading ? (
                  <>
                    <span style={{
                      width: 16, height: 16,
                      border: `2px solid ${THEME.textMuted}`,
                      borderTopColor: THEME.navy,
                      borderRadius: '50%',
                      display: 'inline-block',
                      animation: 'spin 0.8s linear infinite',
                    }} />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                margin: '20px 0',
              }}>
                <div style={{ flex: 1, height: 1, background: THEME.border }} />
                <span style={{ fontSize: 11, color: THEME.textMuted }}>OR</span>
                <div style={{ flex: 1, height: 1, background: THEME.border }} />
              </div>

              <button
                type="button"
                onClick={() => navigate('/SiteExpensesform')}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: 13,
                  fontWeight: 600,
                  color: THEME.navyLight,
                  background: THEME.bg,
                  border: `1.5px solid ${THEME.border}`,
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  letterSpacing: 0.3,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = THEME.gold;
                  e.currentTarget.style.background = `${THEME.gold}08`;
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = THEME.border;
                  e.currentTarget.style.background = THEME.bg;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                🏗️ Site Expenses Form
              </button>
            </form>
          </div>

          <p style={{
            textAlign: 'center',
            fontSize: 11,
            color: THEME.textMuted,
            marginTop: 20,
            letterSpacing: 0.3,
          }}>
            © {new Date().getFullYear()} RCC — Purchase Management System
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: block !important; }
        }
      `}</style>
    </div>
  );
};

export default Login;