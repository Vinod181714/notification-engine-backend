const express = require('express');
const router = express.Router();
const metricsCtrl = require('../controllers/metrics.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, metricsCtrl.getMetrics);

module.exports = router;