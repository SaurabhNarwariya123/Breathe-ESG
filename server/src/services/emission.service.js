const fs = require('fs');
const EmissionRecord = require('../models/EmissionRecord');
const IngestionJob = require('../models/IngestionJob');
const { RECORD_STATUS, JOB_STATUS } = require('../config/constants');
const { parseSap } = require('./parsers/sap.parser');
const { parseUtility } = require('./parsers/utility.parser');
const { parseTravel } = require('./parsers/travel.parser');

const PARSERS = {
  sap: parseSap,
  utility: parseUtility,
  travel: parseTravel,
};

const processIngestionJob = async (jobId, filePath, sourceType, tenantId) => {
  const job = await IngestionJob.findById(jobId);
  try {
    const buffer = fs.readFileSync(filePath);
    const parser = PARSERS[sourceType];
    if (!parser) throw new Error(`No parser for source type: ${sourceType}`);

    const { results, errors } = parser(buffer);

    const docs = results.map((r) => ({
      ...r,
      tenantId,
      jobId,
      status: r.flagReason ? RECORD_STATUS.FLAGGED : RECORD_STATUS.PENDING,
    }));

    if (docs.length > 0) await EmissionRecord.insertMany(docs);

    job.status = JOB_STATUS.COMPLETED;
    job.totalRows = results.length + errors.length;
    job.processedRows = results.length;
    job.failedRows = errors.length;
    job.rowErrors = errors;
    await job.save();
  } catch (err) {
    job.status = JOB_STATUS.FAILED;
    job.rowErrors = [{ row: 0, message: err.message }];
    await job.save();
  } finally {
    fs.unlink(filePath, () => {});
  }
};

module.exports = { processIngestionJob };
