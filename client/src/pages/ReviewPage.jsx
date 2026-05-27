import { useEffect, useState } from 'react';
import RecordTable from '../components/dashboard/RecordTable';
import StatusBadge from '../components/dashboard/StatusBadge';
import { recordsAPI } from '../services/api';

const FILTER_OPTS = {
  status: [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: '⏳ Pending' },
    { value: 'approved', label: '✅ Approved' },
    { value: 'flagged', label: '🚩 Flagged' },
    { value: 'rejected', label: '🚫 Rejected' },
  ],
  sourceType: [
    { value: '', label: 'All Sources' },
    { value: 'sap', label: '⚙️ SAP' },
    { value: 'utility', label: '⚡ Utility' },
    { value: 'travel', label: '✈️ Travel' },
  ],
  scope: [
    { value: '', label: 'All Scopes' },
    { value: '1', label: 'Scope 1' },
    { value: '2', label: 'Scope 2' },
    { value: '3', label: 'Scope 3' },
  ],
};

const DETAIL_FIELDS = [
  ['Source', (r) => r.sourceType?.toUpperCase()],
  ['Scope', (r) => `Scope ${r.scope}`],
  ['Status', (r) => <StatusBadge status={r.status} />],
  ['Description', (r) => r.description],
  ['Date', (r) => r.date ? new Date(r.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'],
  ['Quantity', (r) => `${r.quantity} ${r.unit}`],
  ['CO₂e', (r) => `${r.co2eKg?.toLocaleString()} kg`],
  ['Factor Source', (r) => r.factorSource],
  ['Flag Reason', (r) => r.flagReason || '—'],
];

const ReviewPage = () => {
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState({ status: '', sourceType: '', scope: '' });
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchRecords = (f = filter) => {
    const params = {};
    if (f.status) params.status = f.status;
    if (f.sourceType) params.sourceType = f.sourceType;
    if (f.scope) params.scope = f.scope;
    recordsAPI.list(params)
      .then((r) => { setRecords(r.data.records); setTotal(r.data.total); })
      .catch(console.error);
  };

  useEffect(() => { fetchRecords(); }, []);

  const handleFilter = (key, val) => {
    const next = { ...filter, [key]: val };
    setFilter(next);
    fetchRecords(next);
  };

  const handleAction = async (status, flagReason) => {
    setLoading(true);
    try {
      await recordsAPI.updateStatus(selected._id, { status, flagReason });
      setSelected(null);
      fetchRecords();
    } catch (e) {
      alert(e.response?.data?.message || 'Error updating record');
    } finally {
      setLoading(false);
    }
  };

  const statusCounts = records.reduce((acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc; }, {});

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1200 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px', marginBottom: 4 }}>
          Review Records
        </h2>
        <p style={{ fontSize: 13, color: '#64748b' }}>
          Approve, flag, or reject emission records before they are locked for audit.
        </p>
      </div>

      {/* Status summary chips */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, padding: '5px 14px', fontSize: 12, fontWeight: 700, color: '#374151' }}>
          {total} total records
        </div>
        {[
          { key: 'pending', label: 'Pending', color: '#f59e0b' },
          { key: 'approved', label: 'Approved', color: '#16a34a' },
          { key: 'flagged', label: 'Flagged', color: '#ef4444' },
          { key: 'rejected', label: 'Rejected', color: '#94a3b8' },
        ].map((s) => statusCounts[s.key] ? (
          <div
            key={s.key}
            onClick={() => handleFilter('status', s.key)}
            style={{
              border: `1px solid ${s.color}30`,
              borderRadius: 20, padding: '5px 14px', fontSize: 12, fontWeight: 700,
              color: s.color, cursor: 'pointer',
              background: filter.status === s.key ? `${s.color}15` : '#fff',
            }}
          >
            {statusCounts[s.key]} {s.label}
          </div>
        ) : null)}
      </div>

      {/* Filter bar */}
      <div style={{
        background: '#fff', borderRadius: 12, padding: '14px 20px',
        border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center',
      }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Filter:
        </span>
        {Object.entries(FILTER_OPTS).map(([key, opts]) => (
          <select
            key={key}
            value={filter[key]}
            onChange={(e) => handleFilter(key, e.target.value)}
            style={{
              padding: '7px 12px', border: '1.5px solid #e2e8f0',
              borderRadius: 8, fontSize: 13, color: '#374151',
              background: '#f8fafc', cursor: 'pointer', outline: 'none',
              borderColor: filter[key] ? '#16a34a' : '#e2e8f0',
            }}
          >
            {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ))}
        {(filter.status || filter.sourceType || filter.scope) && (
          <button
            onClick={() => { setFilter({ status: '', sourceType: '', scope: '' }); fetchRecords({ status: '', sourceType: '', scope: '' }); }}
            style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
          >
            × Clear filters
          </button>
        )}
      </div>

      {/* Records table */}
      <div style={{
        background: '#fff', borderRadius: 14,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9',
        overflow: 'hidden',
      }}>
        <RecordTable records={records} onSelect={setSelected} />
      </div>

      {/* Record detail modal */}
      {selected && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(15,23,42,0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 100,
          }}
          onClick={() => setSelected(null)}
        >
          <div
            style={{
              background: '#fff', borderRadius: 16, width: 560,
              maxHeight: '88vh', overflowY: 'auto',
              boxShadow: '0 24px 48px rgba(0,0,0,0.18)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div style={{
              padding: '20px 24px', borderBottom: '1px solid #f1f5f9',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              position: 'sticky', top: 0, background: '#fff', zIndex: 1, borderRadius: '16px 16px 0 0',
            }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 2 }}>Record Detail</h3>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>ID: {selected._id}</div>
              </div>
              <button
                onClick={() => setSelected(null)}
                style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 16, color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >×</button>
            </div>

            {/* Modal body */}
            <div style={{ padding: '20px 24px' }}>
              {/* Flag reason banner */}
              {selected.flagReason && (
                <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '10px 14px', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 16 }}>🚩</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#991b1b', marginBottom: 2 }}>Flag Reason</div>
                    <div style={{ fontSize: 13, color: '#7f1d1d' }}>{selected.flagReason}</div>
                  </div>
                </div>
              )}

              {/* Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                {DETAIL_FIELDS.map(([k, fn]) => (
                  <div key={k} style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 14px' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{k}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{fn(selected)}</div>
                  </div>
                ))}
              </div>

              {/* Raw data */}
              <details style={{ marginBottom: 16 }}>
                <summary style={{ cursor: 'pointer', fontSize: 12, color: '#64748b', fontWeight: 600, padding: '8px 0' }}>
                  🔍 View Raw Data
                </summary>
                <pre style={{
                  fontSize: 11, background: '#f8fafc', padding: 14, borderRadius: 8,
                  marginTop: 8, overflowX: 'auto', color: '#475569', border: '1px solid #e2e8f0',
                  lineHeight: 1.6,
                }}>
                  {JSON.stringify(selected.rawData, null, 2)}
                </pre>
              </details>

              {/* Actions */}
              {selected.status !== 'approved' ? (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleAction('approved')}
                    disabled={loading}
                    style={{
                      flex: 1, padding: '10px',
                      background: 'linear-gradient(135deg, #16a34a, #15803d)',
                      color: '#fff', border: 'none', borderRadius: 10,
                      fontWeight: 700, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer',
                      boxShadow: '0 3px 8px rgba(22,163,74,0.3)',
                    }}
                  >
                    ✅ Approve
                  </button>
                  <button
                    onClick={() => handleAction('flagged', 'Manually flagged by analyst')}
                    disabled={loading}
                    style={{
                      flex: 1, padding: '10px',
                      background: '#fffbeb', color: '#92400e',
                      border: '1px solid #fde68a', borderRadius: 10,
                      fontWeight: 700, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer',
                    }}
                  >
                    🚩 Flag
                  </button>
                  <button
                    onClick={() => handleAction('rejected')}
                    disabled={loading}
                    style={{
                      flex: 1, padding: '10px',
                      background: '#f8fafc', color: '#64748b',
                      border: '1px solid #e2e8f0', borderRadius: 10,
                      fontWeight: 700, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer',
                    }}
                  >
                    🚫 Reject
                  </button>
                </div>
              ) : (
                <div style={{
                  background: '#f0fdf4', border: '1px solid #bbf7d0',
                  borderRadius: 10, padding: '12px 16px',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <span style={{ fontSize: 20 }}>🔒</span>
                  <div>
                    <div style={{ fontWeight: 700, color: '#166534', fontSize: 13 }}>Locked for Audit</div>
                    <div style={{ fontSize: 12, color: '#4ade80' }}>This approved record cannot be modified.</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewPage;
