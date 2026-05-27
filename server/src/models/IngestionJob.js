const mongoose = require('mongoose');
const { SOURCE_TYPES, JOB_STATUS } = require('../config/constants');

const ingestionJobSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sourceType: { type: String, enum: Object.values(SOURCE_TYPES), required: true },
    filename: { type: String, required: true },
    status: { type: String, enum: Object.values(JOB_STATUS), default: JOB_STATUS.PROCESSING },
    totalRows: { type: Number, default: 0 },
    processedRows: { type: Number, default: 0 },
    failedRows: { type: Number, default: 0 },
    rowErrors: [{ row: Number, message: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('IngestionJob', ingestionJobSchema);
