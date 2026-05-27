import { useState, useRef } from 'react';
import { ingestAPI } from '../../services/api';

const SOURCE_OPTIONS = [
  { value: 'sap', label: 'SAP — Fuel / Procurement', icon: '⚙️', desc: 'IDoc-style CSV with BWART, MENGE, MEINS fields' },
  { value: 'utility', label: 'Utility — Electricity', icon: '⚡', desc: 'Meter readings with kWh consumption data' },
  { value: 'travel', label: 'Corporate Travel', icon: '✈️', desc: 'Concur-style export with flight, hotel, taxi records' },
];

const FileUpload = ({ onUploaded }) => {
  const [sourceType, setSourceType] = useState('sap');
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = (f) => {
    if (f && f.name.endsWith('.csv')) {
      setFile(f);
      setStatus('');
    } else if (f) {
      setStatus('Only CSV files are supported.');
      setStatusType('error');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { setStatus('Please select a CSV file.'); setStatusType('error'); return; }
    setLoading(true);
    setStatus('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('sourceType', sourceType);
      const res = await ingestAPI.upload(fd);
      setStatus(`File accepted! Job ID: ${res.data.jobId}`);
      setStatusType('success');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (onUploaded) onUploaded(res.data.jobId);
    } catch (err) {
      setStatus(err.response?.data?.message || 'Upload failed');
      setStatusType('error');
    } finally {
      setLoading(false);
    }
  };

  const selected = SOURCE_OPTIONS.find((o) => o.value === sourceType);

  return (
    <form onSubmit={handleSubmit}>
      {/* Source type selector */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {SOURCE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setSourceType(opt.value)}
            style={{
              flex: 1, padding: '12px 14px', borderRadius: 12, cursor: 'pointer',
              border: sourceType === opt.value ? '2px solid #16a34a' : '2px solid #e2e8f0',
              background: sourceType === opt.value ? '#f0fdf4' : '#ffffff',
              textAlign: 'left', transition: 'all 0.15s',
            }}
          >
            <div style={{ fontSize: 20, marginBottom: 4 }}>{opt.icon}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: sourceType === opt.value ? '#16a34a' : '#374151' }}>
              {opt.value.toUpperCase()}
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{opt.desc}</div>
          </button>
        ))}
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? '#16a34a' : file ? '#bbf7d0' : '#cbd5e1'}`,
          borderRadius: 14,
          padding: '36px 24px',
          textAlign: 'center',
          background: dragOver ? '#f0fdf4' : file ? '#f0fdf4' : '#f8fafc',
          cursor: 'pointer',
          transition: 'all 0.2s',
          marginBottom: 16,
        }}
      >
        <input
          ref={fileInputRef}
          type="file" accept=".csv"
          onChange={(e) => handleFile(e.target.files[0])}
          style={{ display: 'none' }}
        />

        {file ? (
          <div>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
            <div style={{ fontWeight: 700, color: '#166534', fontSize: 14 }}>{file.name}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{(file.size / 1024).toFixed(1)} KB — Ready to upload</div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
              style={{ marginTop: 8, background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 12 }}
            >
              Remove file ×
            </button>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 40, marginBottom: 12 }}>☁️</div>
            <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 15, marginBottom: 6 }}>
              Drop your CSV here or click to browse
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>
              {selected?.label} format • Max 10 MB
            </div>
          </div>
        )}
      </div>

      {status && (
        <div style={{
          padding: '10px 14px', borderRadius: 10, marginBottom: 14,
          background: statusType === 'success' ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${statusType === 'success' ? '#bbf7d0' : '#fca5a5'}`,
          color: statusType === 'success' ? '#166534' : '#dc2626',
          fontSize: 13, fontWeight: 500,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span>{statusType === 'success' ? '✅' : '⚠️'}</span>
          {status}
        </div>
      )}

      <button
        type="submit" disabled={loading || !file}
        style={{
          width: '100%', padding: '12px',
          background: loading || !file
            ? '#e2e8f0'
            : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
          color: loading || !file ? '#94a3b8' : '#fff',
          border: 'none', borderRadius: 10,
          fontSize: 14, fontWeight: 700,
          cursor: loading || !file ? 'not-allowed' : 'pointer',
          boxShadow: loading || !file ? 'none' : '0 4px 12px rgba(22,163,74,0.3)',
          transition: 'all 0.2s',
        }}
      >
        {loading ? 'Uploading…' : `Upload ${selected?.icon || ''} ${sourceType.toUpperCase()} File`}
      </button>
    </form>
  );
};

export default FileUpload;
