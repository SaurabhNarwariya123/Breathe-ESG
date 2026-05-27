import { useEffect, useState } from 'react';
import { dashboardAPI } from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, AreaChart, Area, CartesianGrid, Legend,
} from 'recharts';
import useAuthStore from '../store/authStore';

const SCOPE_COLORS = { 1: '#3b82f6', 2: '#16a34a', 3: '#f59e0b' };
const SOURCE_COLORS = { SAP: '#6366f1', UTILITY: '#0ea5e9', TRAVEL: '#f97316' };

const STAT_CARDS = (data, statusMap) => [
  {
    label: 'Total CO₂e',
    value: `${(data.totalCo2eKg / 1000).toFixed(1)} t`,
    sub: 'tonnes CO₂ equivalent',
    icon: '🌍',
    iconBg: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
    iconColor: '#16a34a',
    accent: '#16a34a',
    trend: '+12% vs last month',
    trendUp: true,
  },
  {
    label: 'Pending Review',
    value: statusMap.pending || 0,
    sub: 'awaiting analyst action',
    icon: '⏳',
    iconBg: 'linear-gradient(135deg, #fffbeb, #fde68a)',
    iconColor: '#d97706',
    accent: '#f59e0b',
  },
  {
    label: 'Approved',
    value: statusMap.approved || 0,
    sub: 'locked for audit',
    icon: '✅',
    iconBg: 'linear-gradient(135deg, #f0fdf4, #bbf7d0)',
    iconColor: '#16a34a',
    accent: '#16a34a',
  },
  {
    label: 'Flagged',
    value: statusMap.flagged || 0,
    sub: 'require attention',
    icon: '🚩',
    iconBg: 'linear-gradient(135deg, #fef2f2, #fca5a5)',
    iconColor: '#dc2626',
    accent: '#ef4444',
  },
];

const JOB_STATUS_STYLE = {
  completed: { bg: '#f0fdf4', color: '#166534', dot: '#16a34a' },
  failed: { bg: '#fef2f2', color: '#991b1b', dot: '#ef4444' },
  processing: { bg: '#fffbeb', color: '#92400e', dot: '#f59e0b' },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 12 }}>
      <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color || '#64748b' }}>{p.name}: {p.value?.toLocaleString()} kg</div>
      ))}
    </div>
  );
};

const DashboardPage = () => {
  const [data, setData] = useState(null);
  const { user } = useAuthStore();

  useEffect(() => {
    dashboardAPI.summary().then((r) => setData(r.data)).catch(console.error);
  }, []);

  if (!data) {
    return (
      <div style={{ padding: 40, display: 'flex', alignItems: 'center', gap: 12, color: '#64748b' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" style={{ animation: 'spin 0.8s linear infinite' }}>
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
        </svg>
        Loading dashboard…
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const statusMap = Object.fromEntries(data.statusCounts.map((s) => [s._id, s.count]));
  const cards = STAT_CARDS(data, statusMap);

  const scopeChartData = data.scopeSums.map((r) => ({
    name: `Scope ${r._id}`,
    value: Math.round(r.totalCo2eKg),
    fill: SCOPE_COLORS[r._id] || '#8b5cf6',
  }));

  const sourceChartData = data.sourceSums.map((r) => ({
    name: r._id?.toUpperCase(),
    value: Math.round(r.totalCo2eKg),
    fill: SOURCE_COLORS[r._id?.toUpperCase()] || '#8b5cf6',
  }));

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1200 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px', marginBottom: 4 }}>
          Dashboard
        </h2>
        <p style={{ fontSize: 13, color: '#64748b' }}>
          Welcome back, <strong style={{ color: '#1e293b' }}>{user?.name}</strong> — here's your emissions overview.
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        {cards.map((c) => (
          <div key={c.label} style={{
            background: '#ffffff',
            borderRadius: 14, padding: '20px 22px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            border: '1px solid #f1f5f9',
            transition: 'box-shadow 0.2s, transform 0.2s',
            cursor: 'default',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.09)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 10,
                background: c.iconBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20,
              }}>{c.icon}</div>
              {c.trend && (
                <span style={{ fontSize: 11, fontWeight: 600, color: c.trendUp ? '#16a34a' : '#dc2626', background: c.trendUp ? '#f0fdf4' : '#fef2f2', padding: '2px 8px', borderRadius: 20 }}>
                  {c.trend}
                </span>
              )}
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 4, letterSpacing: '-0.5px' }}>
              {c.value}
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              {c.label}
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{c.sub}</div>
            <div style={{ height: 3, borderRadius: 2, background: c.accent, marginTop: 14, opacity: 0.3 }} />
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        <div style={{ background: '#fff', borderRadius: 14, padding: '22px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>CO₂e by Scope</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>Scope 1, 2 & 3 breakdown</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={scopeChartData} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="CO₂e" radius={[6, 6, 0, 0]}>
                {scopeChartData.map((r, i) => <Cell key={i} fill={r.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: '#fff', borderRadius: 14, padding: '22px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>CO₂e by Source</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>SAP · Utility · Travel</div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={sourceChartData} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="CO₂e" radius={[6, 6, 0, 0]}>
                {sourceChartData.map((r, i) => <Cell key={i} fill={r.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent jobs */}
      <div style={{ background: '#fff', borderRadius: 14, padding: '22px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>Recent Ingestion Jobs</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>Last 10 file uploads</div>
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 13 }}>
          <thead>
            <tr>
              {['File', 'Source', 'Status', 'Rows', 'Uploaded By', 'Date'].map((h) => (
                <th key={h} style={{
                  textAlign: 'left', padding: '8px 12px',
                  background: '#f8fafc', borderBottom: '2px solid #e2e8f0',
                  fontSize: 11, fontWeight: 700, color: '#64748b',
                  textTransform: 'uppercase', letterSpacing: '0.5px',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.recentJobs.map((j, i) => {
              const st = JOB_STATUS_STYLE[j.status] || JOB_STATUS_STYLE.processing;
              return (
                <tr key={j._id} style={{ background: i % 2 === 0 ? '#fff' : '#fafbfc' }}>
                  <td style={{ padding: '9px 12px', borderBottom: '1px solid #f1f5f9', fontWeight: 500, color: '#334155', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    📄 {j.filename}
                  </td>
                  <td style={{ padding: '9px 12px', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ fontWeight: 600, color: SOURCE_COLORS[j.sourceType?.toUpperCase()] || '#64748b' }}>
                      {j.sourceType?.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '9px 12px', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      background: st.bg, color: st.color,
                      borderRadius: 20, padding: '2px 10px',
                      fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px',
                    }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: st.dot }} />
                      {j.status}
                    </span>
                  </td>
                  <td style={{ padding: '9px 12px', borderBottom: '1px solid #f1f5f9', color: '#64748b' }}>
                    <span style={{ color: '#16a34a', fontWeight: 700 }}>{j.processedRows}</span>
                    <span style={{ color: '#94a3b8' }}> / {j.totalRows}</span>
                  </td>
                  <td style={{ padding: '9px 12px', borderBottom: '1px solid #f1f5f9', color: '#475569' }}>{j.uploadedBy?.name}</td>
                  <td style={{ padding: '9px 12px', borderBottom: '1px solid #f1f5f9', color: '#64748b', whiteSpace: 'nowrap' }}>
                    {new Date(j.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              );
            })}
            {data.recentJobs.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>📭</div>
                  No ingestion jobs yet — upload a file to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardPage;
