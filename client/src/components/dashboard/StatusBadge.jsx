const CONFIG = {
  pending:  { bg: '#fffbeb', color: '#92400e', border: '#fde68a', dot: '#f59e0b' },
  approved: { bg: '#f0fdf4', color: '#166534', border: '#bbf7d0', dot: '#16a34a' },
  flagged:  { bg: '#fef2f2', color: '#991b1b', border: '#fca5a5', dot: '#ef4444' },
  rejected: { bg: '#f8fafc', color: '#475569', border: '#e2e8f0', dot: '#94a3b8' },
};

const StatusBadge = ({ status }) => {
  const c = CONFIG[status] || CONFIG.pending;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: c.bg, color: c.color,
      border: `1px solid ${c.border}`,
      borderRadius: 20, padding: '2px 10px',
      fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
};

export default StatusBadge;
