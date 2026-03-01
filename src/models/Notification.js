const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event_type: String,
  message: String,
  title: String,
  source: String,
  priority_hint: String,
  channel: String,
  metadata: mongoose.Schema.Types.Mixed,
  dedupe_key: String,
  expires_at: Date,
  content_hash: String,
  classification: { type: String, enum: ['NOW', 'LATER', 'NEVER'] },
  ai_classification: String,
  ai_confidence: Number,
  ai_reason: String,
  ai_model: String,
  ai_is_fallback: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
