const router = require('express').Router();
const { upload, getJob, listJobs } = require('../controllers/ingest.controller');
const { protect } = require('../middleware/auth.middleware');
const uploadMiddleware = require('../middleware/upload.middleware');

router.use(protect);
router.post('/', uploadMiddleware.single('file'), upload);
router.get('/', listJobs);
router.get('/:id', getJob);

module.exports = router;
