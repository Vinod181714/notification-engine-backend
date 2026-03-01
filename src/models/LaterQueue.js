const mongoose = require('mongoose');

const laterQueueSchema = new mongoose.Schema({
  notification_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Notification', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['PENDING', 'PROCESSING', 'DONE', 'FAILED'], default: 'PENDING' },
  scheduled_for: { type: Date, required: true },
  retry_count: { type: Number, default: 0 },
  max_retries: { type: Number, default: 3 },
  last_error: String
}, { timestamps: true });

module.exports = mongoose.model('LaterQueue', laterQueueSchema);
