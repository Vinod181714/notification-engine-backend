const express = require('express');
const router = express.Router();
const auditCtrl = require('../controllers/audit.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, auditCtrl.listLogs);

module.exports = router;