const router = require('express').Router();
const { summary } = require('../controllers/dashboard.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/summary', summary);

module.exports = router;
