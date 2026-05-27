const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true }, // e.g. "APPROVED", "REJECTED", "FLAGGED", "UPLOADED"
    entityType: { type: String },             // "EmissionRecord" | "IngestionJob"
    entityId: { type: mongoose.Schema.Types.ObjectId },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
