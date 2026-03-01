const express = require('express');
const router = express.Router();
const laterCtrl = require('../controllers/laterQueue.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, laterCtrl.listQueue);

module.exports = router;