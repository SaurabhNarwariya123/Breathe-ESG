const mongoose = require('mongoose');
const { SOURCE_TYPES, SCOPES, RECORD_STATUS } = require('../config/constants');

const emissionRecordSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'IngestionJob', required: true },
    sourceType: { type: String, enum: Object.values(SOURCE_TYPES), required: true },
    scope: { type: Number, enum: Object.values(SCOPES), required: true },

    // Raw data as ingested (preserved for traceability)
    rawData: { type: mongoose.Schema.Types.Mixed, required: true },

    // Normalized fields
    description: { type: String },
    date: { type: Date },
    quantity: { type: Number },
    unit: { type: String },
    kgEq: { type: Number },
    factorSource: { type: String },
    co2eKg: { type: Number },

    status: { type: String, enum: Object.values(RECORD_STATUS), default: RECORD_STATUS.PENDING },
    flagReason: { type: String },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    isEdited: { type: Boolean, default: false },
    editHistory: [
      {
        editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        editedAt: { type: Date },
        changes: { type: mongoose.Schema.Types.Mixed },
      },
    ],
  },
  { timestamps: true }
);

emissionRecordSchema.index({ tenantId: 1, status: 1 });
emissionRecordSchema.index({ tenantId: 1, sourceType: 1 });
emissionRecordSchema.index({ tenantId: 1, scope: 1 });

module.exports = mongoose.model('EmissionRecord', emissionRecordSchema);
