import { useEffect, useState } from 'react';
import FileUpload from '../components/ingest/FileUpload';
import { ingestAPI } from '../services/api';

const STATUS_STYLE = {
  completed: { bg: '#f0fdf4', color: '#166534', dot: '#16a34a' },
  failed: { bg: '#fef2f2', color: '#991b1b', dot: '#ef4444' },
  processing: { bg: '#fffbeb', color: '#92400e', dot: '#f59e0b' },
};

const SOURCE_COLORS = { SAP: '#6366f1', UTILITY: '#0ea5e9', TRAVEL: '#f97316' };

const IngestPage = () => {
  const [jobs, setJobs] = useState([]);

  const fetchJobs = () => ingestAPI.listJobs().then((r) => setJobs(r.data)).catch(console.error);

  useEffect(() => { fetchJobs(); }, []);

  const stats = {
    total: jobs.length,
    completed: jobs.filter((j) => j.status === 'completed').length,
    failed: jobs.filter((j) => j.status === 'failed').length,
    rows: jobs.reduce((sum, j) => sum + (j.processedRows || 0), 0),
  };

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px', marginBottom: 4 }}>
          Ingest Data
        </h2>
        <p style={{ fontSize: 13, color: '#64748b' }}>
          Upload CSV files from SAP, utility portals, or corporate travel platforms for automatic processing.
        </p>
      </div>

      {/* Quick stats */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Jobs', value: stats.total, icon: '📦', color: '#6366f1' },
          { label: 'Completed', value: stats.completed, icon: '✅', color: '#16a34a' },
          { label: 'Failed', value: stats.failed, icon: '❌', color: '#ef4444' },
          { label: 'Rows Processed', value: stats.rows.toLocaleString(), icon: '📊', color: '#0ea5e9' },
        ].map((s) => (
          <div key={s.label} style={{
            background: '#fff', borderRadius: 12, padding: '14px 20px',
            border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            display: 'flex', alignItems: 'center', gap: 12, flex: '1 1 160px',
          }}>
            <span style={{ fontSize: 24 }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload panel */}
      <div style={{
        background: '#fff', borderRadius: 14, padding: '24px 28px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', marginBottom: 24,
      }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>Upload New File</div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>Select the source type, then drop or browse your CSV file</div>
        </div>
        <FileUpload onUploaded={() => setTimeout(fetchJobs, 1500)} />
      </div>

      {/* History table */}
      <div style={{
        background: '#fff', borderRadius: 14, padding: '22px 24px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>Ingestion History</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>{jobs.length} job{jobs.length !== 1 ? 's' : ''} total</div>
          </div>
          <button
            onClick={fetchJobs}
            style={{
              background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0',
              borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}
          >
            ↻ Refresh
          </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 13 }}>
          <thead>
            <tr>
              {['File', 'Source', 'Status', 'Processed', 'Failed', 'Uploaded By', 'Date'].map((h) => (
                <th key={h} style={{
                  textAlign: 'left', padding: '9px 12px',
                  background: '#f8fafc', borderBottom: '2px solid #e2e8f0',
                  fontSize: 11, fontWeight: 700, color: '#64748b',
                  textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {jobs.map((j, i) => {
              const st = STATUS_STYLE[j.status] || STATUS_STYLE.processing;
              const srcColor = SOURCE_COLORS[j.sourceType?.toUpperCase()] || '#64748b';
              return (
                <tr key={j._id} style={{ background: i % 2 === 0 ? '#fff' : '#fafbfc' }}>
                  <td style={{ padding: '9px 12px', borderBottom: '1px solid #f1f5f9', fontWeight: 500, color: '#334155', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    📄 {j.filename}
                  </td>
                  <td style={{ padding: '9px 12px', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ fontWeight: 700, color: srcColor, fontSize: 12 }}>{j.sourceType?.toUpperCase()}</span>
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
                  <td style={{ padding: '9px 12px', borderBottom: '1px solid #f1f5f9', fontWeight: 600, color: '#16a34a' }}>{j.processedRows}</td>
                  <td style={{ padding: '9px 12px', borderBottom: '1px solid #f1f5f9', fontWeight: j.failedRows > 0 ? 700 : 400, color: j.failedRows > 0 ? '#dc2626' : '#94a3b8' }}>{j.failedRows}</td>
                  <td style={{ padding: '9px 12px', borderBottom: '1px solid #f1f5f9', color: '#475569' }}>{j.uploadedBy?.name}</td>
                  <td style={{ padding: '9px 12px', borderBottom: '1px solid #f1f5f9', color: '#64748b', whiteSpace: 'nowrap' }}>
                    {new Date(j.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              );
            })}
            {jobs.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: '40px', textAlign: 'center' }}>
                  <div style={{ color: '#94a3b8', fontSize: 14 }}>
                    <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
                    No uploads yet — start by uploading a CSV file above.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IngestPage;
