import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const ROLE_COLOR = { admin: '#6366f1', analyst: '#16a34a' };

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <nav style={{
      background: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      height: 60,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'linear-gradient(135deg, #16a34a 0%, #059669 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 3C7.5 3 4 6.5 4 11c0 3.5 2 6.5 5 8l1-2c-2-1.2-3-3.4-3-6 0-2.8 2.2-5 5-5s5 2.2 5 5c0 2.6-1 4.8-3 6l1 2c3-1.5 5-4.5 5-8 0-4.5-3.5-8-8-8z" fill="white"/>
            <path d="M12 8c-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3-1.3-3-3-3z" fill="white" opacity="0.6"/>
          </svg>
        </div>
        <div>
          <span style={{ fontWeight: 800, fontSize: 16, color: '#0f172a', letterSpacing: '-0.3px' }}>Breathe ESG</span>
          <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 8, fontWeight: 500 }}>Data Platform</span>
        </div>
      </div>

      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'linear-gradient(135deg, #16a34a, #6366f1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, color: '#fff',
            }}>
              {initials}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', lineHeight: 1.2 }}>{user.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px',
                  background: ROLE_COLOR[user.role] || '#6366f1',
                  color: '#fff', borderRadius: 4, padding: '1px 6px',
                }}>
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#f8fafc', border: '1px solid #e2e8f0',
              color: '#64748b', borderRadius: 8, padding: '6px 14px',
              cursor: 'pointer', fontSize: 13, fontWeight: 500,
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#dc2626'; e.currentTarget.style.borderColor = '#fca5a5'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
