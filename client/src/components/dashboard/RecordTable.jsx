import StatusBadge from './StatusBadge';

const SCOPE_CONFIG = {
  1: { label: 'Scope 1', bg: '#eff6ff', color: '#1d4ed8' },
  2: { label: 'Scope 2', bg: '#f0fdf4', color: '#166534' },
  3: { label: 'Scope 3', bg: '#faf5ff', color: '#7c3aed' },
};

const SOURCE_ICON = { SAP: '⚙️', UTILITY: '⚡', TRAVEL: '✈️' };

const RecordTable = ({ records, onSelect }) => (
  <div style={{ overflowX: 'auto' }}>
    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 13 }}>
      <thead>
        <tr>
          {['Date', 'Source', 'Scope', 'Description', 'CO₂e (kg)', 'Status', 'Action'].map((h) => (
            <th key={h} style={{
              textAlign: 'left', padding: '10px 14px',
              background: '#f8fafc', borderBottom: '2px solid #e2e8f0',
              fontWeight: 700, fontSize: 11, color: '#64748b',
              textTransform: 'uppercase', letterSpacing: '0.5px',
              whiteSpace: 'nowrap',
            }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {records.map((r, i) => {
          const sc = SCOPE_CONFIG[r.scope] || { label: `Scope ${r.scope}`, bg: '#f8fafc', color: '#64748b' };
          const src = r.sourceType?.toUpperCase();
          return (
            <tr key={r._id} style={{ background: i % 2 === 0 ? '#ffffff' : '#fafbfc' }}>
              <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', color: '#475569', whiteSpace: 'nowrap' }}>
                {r.date ? new Date(r.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
              </td>
              <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <span>{SOURCE_ICON[src] || '📄'}</span>
                  <span style={{ fontWeight: 600, color: '#334155' }}>{src}</span>
                </span>
              </td>
              <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{
                  background: sc.bg, color: sc.color,
                  borderRadius: 6, padding: '2px 8px',
                  fontSize: 11, fontWeight: 700,
                }}>{sc.label}</span>
              </td>
              <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', color: '#475569', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {r.description}
              </td>
              <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', fontWeight: 600, color: '#1e293b', fontVariantNumeric: 'tabular-nums' }}>
                {r.co2eKg?.toLocaleString()}
              </td>
              <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9' }}>
                <StatusBadge status={r.status} />
              </td>
              <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9' }}>
                <button
                  onClick={() => onSelect(r)}
                  style={{
                    background: '#f0fdf4', color: '#16a34a',
                    border: '1px solid #bbf7d0', borderRadius: 6,
                    padding: '4px 12px', fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#16a34a'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#f0fdf4'; e.currentTarget.style.color = '#16a34a'; }}
                >
                  Review
                </button>
              </td>
            </tr>
          );
        })}
        {records.length === 0 && (
          <tr>
            <td colSpan={7} style={{ padding: '40px 24px', textAlign: 'center' }}>
              <div style={{ color: '#94a3b8', fontSize: 14 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
                No records found
              </div>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

export default RecordTable;
