const router = require('express').Router();
const { list, updateStatus, getOne } = require('../controllers/records.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/', list);
router.get('/:id', getOne);
router.patch('/:id/status', updateStatus);

module.exports = router;
