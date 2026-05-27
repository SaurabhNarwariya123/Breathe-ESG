import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import useAuthStore from '../store/authStore';

const DEMO_EMAIL = import.meta.env.VITE_DEMO_EMAIL;
const DEMO_PASSWORD = import.meta.env.VITE_DEMO_PASSWORD;

const FEATURES = [
  { icon: '📊', text: 'Multi-source emissions ingestion' },
  { icon: '🔍', text: 'Automated CO₂e calculation' },
  { icon: '✅', text: 'Analyst review & audit trail' },
  { icon: '🌿', text: 'DEFRA 2023 emission factors' },
];

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authAPI.login(form);
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Left panel */}
      <div style={{
        flex: '0 0 52%',
        background: 'linear-gradient(145deg, #052e16 0%, #14532d 40%, #166534 70%, #15803d 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px 64px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* decorative circles */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -40, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', top: '40%', right: '10%', width: 120, height: 120, borderRadius: '50%', background: 'rgba(99,102,241,0.15)' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22,
            }}>🌿</div>
            <span style={{ color: '#ffffff', fontWeight: 800, fontSize: 20, letterSpacing: '-0.5px' }}>Breathe ESG</span>
          </div>

          <h1 style={{ fontSize: 38, fontWeight: 800, color: '#ffffff', lineHeight: 1.15, marginBottom: 16, letterSpacing: '-1px' }}>
            Emissions Data<br />
            <span style={{ color: '#86efac' }}>Ingestion Platform</span>
          </h1>
          <p style={{ color: '#bbf7d0', fontSize: 15, lineHeight: 1.7, marginBottom: 40, maxWidth: 380 }}>
            Ingest, normalize, and review carbon emissions data from SAP, utility portals, and corporate travel — all in one place.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {FEATURES.map((f) => (
              <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 18 }}>{f.icon}</span>
                <span style={{ color: '#d1fae5', fontSize: 14, fontWeight: 500 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{
        flex: 1,
        background: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 48px',
      }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <div style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', marginBottom: 6, letterSpacing: '-0.5px' }}>
              Welcome back
            </h2>
            <p style={{ color: '#64748b', fontSize: 14 }}>Sign in to your analyst account</p>
          </div>

          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10,
              padding: '10px 14px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span style={{ color: '#dc2626', fontSize: 13 }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Email address
              </label>
              <input
                name="email" type="email" value={form.email} onChange={handleChange}
                placeholder={DEMO_EMAIL || 'email@example.com'} required
                style={{
                  width: '100%', padding: '11px 14px',
                  border: '1.5px solid #e2e8f0', borderRadius: 10,
                  fontSize: 14, color: '#1e293b', background: '#f8fafc',
                  outline: 'none', transition: 'border-color 0.15s',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#16a34a'; e.target.style.background = '#fff'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Password
              </label>
              <input
                name="password" type="password" value={form.password} onChange={handleChange}
                placeholder="••••••••" required
                style={{
                  width: '100%', padding: '11px 14px',
                  border: '1.5px solid #e2e8f0', borderRadius: 10,
                  fontSize: 14, color: '#1e293b', background: '#f8fafc',
                  outline: 'none', transition: 'border-color 0.15s',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#16a34a'; e.target.style.background = '#fff'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; }}
              />
            </div>

            <button
              type="submit" disabled={loading}
              style={{
                width: '100%', padding: '12px',
                background: loading ? '#86efac' : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                color: '#fff', border: 'none', borderRadius: 10,
                fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 12px rgba(22,163,74,0.35)',
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {loading ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }}>
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
                  </svg>
                  Signing in…
                </>
              ) : 'Sign In →'}
            </button>
          </form>

          <div style={{
            marginTop: 28, padding: '14px 16px',
            background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0',
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
              Demo Credentials
            </div>
            <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.8 }}>
              {DEMO_EMAIL && <div>{DEMO_EMAIL} / {DEMO_PASSWORD}</div>}
              <div>admin@acme.com / {DEMO_PASSWORD}</div>
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default LoginPage;
