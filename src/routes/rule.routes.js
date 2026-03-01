const express = require('express');
const router = express.Router();
const ruleCtrl = require('../controllers/rule.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

router.get('/', protect, ruleCtrl.listRules);
router.post('/', protect, restrictTo('admin'), ruleCtrl.createRule);
router.put('/:id', protect, restrictTo('admin'), ruleCtrl.updateRule);
router.delete('/:id', protect, restrictTo('admin'), ruleCtrl.deleteRule);

module.exports = router;