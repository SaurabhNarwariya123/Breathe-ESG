const EmissionRecord = require('../models/EmissionRecord');
const IngestionJob = require('../models/IngestionJob');

const summary = async (req, res) => {
  try {
    const tenantId = req.user.tenantId._id;

    const [statusCounts, scopeSums, sourceSums, recentJobs] = await Promise.all([
      EmissionRecord.aggregate([
        { $match: { tenantId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      EmissionRecord.aggregate([
        { $match: { tenantId } },
        { $group: { _id: '$scope', totalCo2eKg: { $sum: '$co2eKg' }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      EmissionRecord.aggregate([
        { $match: { tenantId } },
        { $group: { _id: '$sourceType', totalCo2eKg: { $sum: '$co2eKg' }, count: { $sum: 1 } } },
      ]),
      IngestionJob.find({ tenantId }).sort('-createdAt').limit(5).populate('uploadedBy', 'name'),
    ]);

    const totalCo2eKg = scopeSums.reduce((s, r) => s + r.totalCo2eKg, 0);

    res.json({ statusCounts, scopeSums, sourceSums, totalCo2eKg, recentJobs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { summary };
