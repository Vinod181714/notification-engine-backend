const crypto = require('crypto');
const levenshtein = require('fast-levenshtein');
const Notification = require('../models/Notification');

const getContentHash = (user_id, event_type, message) => {
  const hash = crypto.createHash('sha256');
  hash.update(`${user_id}|${event_type}|${message}`);
  return hash.digest('hex');
};

const isExactDuplicate = async (dedupe_key) => {
  if (!dedupe_key) return false;
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const found = await Notification.findOne({ dedupe_key, createdAt: { $gte: cutoff } });
  return !!found;
};

const isContentHashDuplicate = async (hash) => {
  if (!hash) return false;
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const found = await Notification.findOne({ content_hash: hash, createdAt: { $gte: cutoff } });
  return !!found;
};

const isNearDuplicate = async (user_id, event_type, message) => {
  const cutoff = new Date(Date.now() - 60 * 60 * 1000);
  const recent = await Notification.find({
    user_id,
    event_type,
    createdAt: { $gte: cutoff }
  }).select('message');

  for (const n of recent) {
    const dist = levenshtein.get(message, n.message || '');
    const maxLen = Math.max(message.length, (n.message || '').length);
    if (maxLen > 0 && (1 - dist / maxLen) >= 0.85) {
      return true;
    }
  }
  return false;
};

module.exports = {
  getContentHash,
  isExactDuplicate,
  isContentHashDuplicate,
  isNearDuplicate
};