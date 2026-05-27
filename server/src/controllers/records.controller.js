const EmissionRecord = require('../models/EmissionRecord');
const AuditLog = require('../models/AuditLog');
const { RECORD_STATUS } = require('../config/constants');

const list = async (req, res) => {
  try {
    const { status, sourceType, scope, page = 1, limit = 50 } = req.query;
    const filter = { tenantId: req.user.tenantId._id };
    if (status) filter.status = status;
    if (sourceType) filter.sourceType = sourceType;
    if (scope) filter.scope = Number(scope);

    const skip = (page - 1) * limit;
    const [records, total] = await Promise.all([
      EmissionRecord.find(filter).sort('-createdAt').skip(skip).limit(Number(limit)),
      EmissionRecord.countDocuments(filter),
    ]);
    res.json({ records, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { status, flagReason } = req.body;
    if (!Object.values(RECORD_STATUS).includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const record = await EmissionRecord.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId._id,
    });
    if (!record) return res.status(404).json({ message: 'Record not found' });
    if (record.status === RECORD_STATUS.APPROVED) {
      return res.status(400).json({ message: 'Approved records are locked' });
    }

    record.status = status;
    record.flagReason = flagReason || record.flagReason;
    record.reviewedBy = req.user._id;
    record.reviewedAt = new Date();
    await record.save();

    await AuditLog.create({
      tenantId: req.user.tenantId._id,
      userId: req.user._id,
      action: status.toUpperCase(),
      entityType: 'EmissionRecord',
      entityId: record._id,
      metadata: { flagReason },
    });

    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getOne = async (req, res) => {
  try {
    const record = await EmissionRecord.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId._id,
    }).populate('reviewedBy', 'name email');
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { list, updateStatus, getOne };
