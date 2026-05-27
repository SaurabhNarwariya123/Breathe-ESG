const SOURCE_TYPES = {
  SAP: 'sap',
  UTILITY: 'utility',
  TRAVEL: 'travel',
};

const SCOPES = {
  SCOPE_1: 1, // Direct emissions (fuel combustion)
  SCOPE_2: 2, // Indirect energy (electricity)
  SCOPE_3: 3, // Other indirect (travel, supply chain)
};

const RECORD_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  FLAGGED: 'flagged',
  REJECTED: 'rejected',
};

const JOB_STATUS = {
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

const ROLES = {
  ANALYST: 'analyst',
  ADMIN: 'admin',
};

module.exports = { SOURCE_TYPES, SCOPES, RECORD_STATUS, JOB_STATUS, ROLES };
