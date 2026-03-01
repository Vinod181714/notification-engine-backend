const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/login', authCtrl.login);
router.get('/me', protect, authCtrl.getMe);

module.exports = router;