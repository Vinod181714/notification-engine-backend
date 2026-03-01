const express = require('express');
const router = express.Router();
const eventCtrl = require('../controllers/event.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/', protect, eventCtrl.createEvent);
router.get('/', protect, eventCtrl.listEvents);

module.exports = router;