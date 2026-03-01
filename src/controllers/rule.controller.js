const Rule = require('../models/Rule');

exports.listRules = async (req, res) => {
  const rules = await Rule.find({ isActive: true, deletedAt: null }).sort({ priority: 1 });
  res.json(rules);
};

exports.createRule = async (req, res) => {
  const rule = new Rule(req.body);
  await rule.save();
  res.status(201).json(rule);
};

exports.updateRule = async (req, res) => {
  const rule = await Rule.findById(req.params.id);
  if (!rule) return res.status(404).json({ message: 'Not found' });
  Object.assign(rule, req.body);
  await rule.save();
  res.json(rule);
};

exports.deleteRule = async (req, res) => {
  const rule = await Rule.findById(req.params.id);
  if (!rule) return res.status(404).json({ message: 'Not found' });
  rule.deletedAt = new Date();
  rule.isActive = false;
  await rule.save();
  res.status(204).send();
};
