const Rule = require('../models/Rule');

const getRules = async () => {
  return Rule.find({ isActive: true, deletedAt: null }).sort({ priority: 1 });
};

const matches = (conditions, event) => {
  if (conditions.event_type && conditions.event_type !== event.event_type) return false;
  if (conditions.source && conditions.source !== event.source) return false;
  if (conditions.priority_hint && conditions.priority_hint !== event.priority_hint) return false;
  if (conditions.channel && conditions.channel !== event.channel) return false;
  return true;
};

const evaluate = async (event) => {
  const rules = await getRules();
  let classification = null;
  let ruleTriggered = null;
  let fatigue_limit = null;
  let fatigue_window_minutes = null;
  for (const rule of rules) {
    if (matches(rule.conditions, event)) {
      classification = rule.action;
      ruleTriggered = rule.name;
      fatigue_limit = rule.fatigue_limit;
      fatigue_window_minutes = rule.fatigue_window_minutes;
      break;
    }
  }

  if (!classification) {
    // fallback based on priority_hint
    if (['critical', 'high'].includes(event.priority_hint)) classification = 'NOW';
    else if (['medium', 'low'].includes(event.priority_hint)) classification = 'LATER';
    else classification = 'LATER';
  }

  return { classification, ruleTriggered, fatigue_limit, fatigue_window_minutes };
};

module.exports = { evaluate };
