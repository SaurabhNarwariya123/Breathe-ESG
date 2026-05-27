const IngestionJob = require('../models/IngestionJob');
const AuditLog = require('../models/AuditLog');
const { processIngestionJob } = require('../services/emission.service');
const { SOURCE_TYPES } = require('../config/constants');

const upload = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const { sourceType } = req.body;
    if (!Object.values(SOURCE_TYPES).includes(sourceType)) {
      return res.status(400).json({ message: `Invalid sourceType. Use: ${Object.values(SOURCE_TYPES).join(', ')}` });
    }

    const job = await IngestionJob.create({
      tenantId: req.user.tenantId._id,
      uploadedBy: req.user._id,
      sourceType,
      filename: req.file.originalname,
    });

    await AuditLog.create({
      tenantId: req.user.tenantId._id,
      userId: req.user._id,
      action: 'UPLOADED',
      entityType: 'IngestionJob',
      entityId: job._id,
      metadata: { filename: req.file.originalname, sourceType },
    });

    // Process async (fire-and-forget in prototype; use a queue in production)
    processIngestionJob(job._id, req.file.path, sourceType, req.user.tenantId._id).catch(
      (e) => console.error('Ingestion error:', e)
    );

    res.status(202).json({ message: 'File accepted, processing started', jobId: job._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getJob = async (req, res) => {
  try {
    const job = await IngestionJob.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId._id,
    }).populate('uploadedBy', 'name email');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const listJobs = async (req, res) => {
  try {
    const jobs = await IngestionJob.find({ tenantId: req.user.tenantId._id })
      .sort('-createdAt')
      .limit(50)
      .populate('uploadedBy', 'name email');
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { upload, getJob, listJobs };
