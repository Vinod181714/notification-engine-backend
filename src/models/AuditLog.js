const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  notification_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Notification' },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  classification: String,
  reason: String,
  rule_triggered: String,
  decision_stage: String,
  ai_classification: String,
  ai_model: String,
  ai_confidence: Number,
  ai_is_fallback: Boolean,
  ai_attempts: Number,
  ai_error: String,
  processing_ms: Number
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
