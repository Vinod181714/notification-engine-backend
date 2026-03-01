const express = require('express');
const router = express.Router();
const healthCtrl = require('../controllers/health.controller');

router.get('/', healthCtrl.health);

module.exports = router;