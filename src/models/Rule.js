const mongoose = require('mongoose');

const ruleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  conditions: {
    event_type: String,
    source: String,
    priority_hint: String,
    channel: String
  },
  action: { type: String, enum: ['NOW', 'LATER', 'NEVER'], required: true },
  fatigue_limit: Number,
  fatigue_window_minutes: Number,
  priority: { type: Number, default: 100 },
  isActive: { type: Boolean, default: true },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Rule', ruleSchema);
