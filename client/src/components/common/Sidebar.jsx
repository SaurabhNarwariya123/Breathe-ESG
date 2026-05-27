import { NavLink, useLocation } from 'react-router-dom';

const LINKS = [
  {
    to: '/', label: 'Dashboard', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/>
        <rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>
      </svg>
    ),
  },
  {
    to: '/ingest', label: 'Ingest Data', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/>
        <line x1="12" y1="3" x2="12" y2="15"/>
      </svg>
    ),
  },
  {
    to: '/review', label: 'Review Records', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4"/>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
  },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside style={{
      width: 220,
      minHeight: 'calc(100vh - 60px)',
      background: '#ffffff',
      borderRight: '1px solid #e2e8f0',
      padding: '20px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
    }}>
      <div style={{ padding: '0 8px 16px', borderBottom: '1px solid #f1f5f9', marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          Navigation
        </span>
      </div>

      {LINKS.map(({ to, label, icon }) => {
        const isActive = to === '/'
          ? location.pathname === '/'
          : location.pathname.startsWith(to);

        return (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '9px 12px',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: isActive ? 600 : 500,
              color: isActive ? '#16a34a' : '#64748b',
              background: isActive ? '#f0fdf4' : 'transparent',
              border: isActive ? '1px solid #bbf7d0' : '1px solid transparent',
              transition: 'all 0.15s',
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = '#f8fafc';
                e.currentTarget.style.color = '#1e293b';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#64748b';
              }
            }}
          >
            <span style={{ color: isActive ? '#16a34a' : '#94a3b8', display: 'flex', alignItems: 'center' }}>
              {icon}
            </span>
            {label}
          </NavLink>
        );
      })}

      <div style={{ marginTop: 'auto', padding: '16px 8px 0', borderTop: '1px solid #f1f5f9' }}>
        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4, #eff6ff)',
          borderRadius: 10, padding: '12px 14px',
          border: '1px solid #bbf7d0',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', marginBottom: 4 }}>DEFRA 2023</div>
          <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.5 }}>
            Emission factors updated for UK grid & travel
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
