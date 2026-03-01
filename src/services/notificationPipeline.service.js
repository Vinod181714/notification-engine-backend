const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const LaterQueue = require('../models/LaterQueue');
const dedup = require('./deduplication.service');
const ruleEngine = require('./ruleEngine.service');
const aiService = require('./ai.service');
const logger = require('../utils/logger');

const alertFatigue = async (event, limit, windowMinutes) => {
  if (!event.user_id || !limit || !windowMinutes) return false;
  const window = windowMinutes * 60 * 1000;
  const cutoff = new Date(Date.now() - window);
  const count = await Notification.countDocuments({ user_id: event.user_id, createdAt: { $gte: cutoff } });
  return count > limit;
};

const processEvent = async (event, socket) => {
  const start = Date.now();
  // step1 dedupe
  if (await dedup.isExactDuplicate(event.dedupe_key)) {
    await AuditLog.create({ user_id: event.user_id, classification: 'NEVER', reason: 'exact_duplicate', decision_stage: 'dedup', processing_ms: Date.now() - start });
    return { classification: 'NEVER', reason: 'exact_duplicate' };
  }

  const contentHash = dedup.getContentHash(event.user_id, event.event_type, event.message || '');
  if (await dedup.isContentHashDuplicate(contentHash)) {
    await AuditLog.create({ user_id: event.user_id, classification: 'NEVER', reason: 'content_hash_dup', decision_stage: 'dedup', processing_ms: Date.now() - start });
    return { classification: 'NEVER', reason: 'content_hash_dup' };
  }

  if (await dedup.isNearDuplicate(event.user_id, event.event_type, event.message || '')) {
    await AuditLog.create({ user_id: event.user_id, classification: 'NEVER', reason: 'near_duplicate', decision_stage: 'dedup', processing_ms: Date.now() - start });
    return { classification: 'NEVER', reason: 'near_duplicate' };
  }

  // step2 rule engine
  const { classification, ruleTriggered, fatigue_limit, fatigue_window_minutes } = await ruleEngine.evaluate(event);

  // step3 alert fatigue
  if (fatigue_limit && fatigue_window_minutes && await alertFatigue(event, fatigue_limit, fatigue_window_minutes)) {
    await AuditLog.create({ user_id: event.user_id, classification: 'NEVER', reason: 'alert_fatigue', decision_stage: 'fatigue', processing_ms: Date.now() - start, rule_triggered: ruleTriggered });
    return { classification: 'NEVER', reason: 'alert_fatigue' };
  }

  // step4 save with preliminary classification
  const notification = new Notification({ ...event, content_hash: contentHash, classification });
  await notification.save();

  // emit socket for processed
  if (socket) {
    socket.emit('notification:processed', { notification });
  }

  // record audit log
  await AuditLog.create({
    notification_id: notification._id,
    user_id: event.user_id,
    classification,
    reason: 'initial',
    rule_triggered: ruleTriggered,
    decision_stage: 'rule',
    processing_ms: Date.now() - start
  });

  // step5 async AI enrichment
  setImmediate(async () => {
    try {
      const aiResult = await aiService.callAI(event);
      notification.ai_classification = aiResult.classification;
      notification.ai_confidence = aiResult.confidence;
      notification.ai_reason = aiResult.reason;
      notification.ai_model = aiResult.ai_model;
      notification.ai_is_fallback = aiResult.ai_is_fallback;
      await notification.save();

      await AuditLog.create({
        notification_id: notification._id,
        user_id: event.user_id,
        classification: aiResult.classification,
        reason: 'ai',
        decision_stage: 'ai',
        ai_classification: aiResult.classification,
        ai_model: aiResult.ai_model,
        ai_confidence: aiResult.confidence,
        ai_is_fallback: aiResult.ai_is_fallback,
        ai_attempts: aiResult.attempts || 1,
        // if the AI service returned an error message include it for diagnostics
        ai_error: aiResult.ai_error,
        processing_ms: Date.now() - start
      });

      if (socket) {
        socket.emit('notification:ai_complete', { notification });
      }
    } catch (err) {
      logger.error('AI async processing error', err);
    }
  });

  // if classification LATER schedule later queue
  if (classification === 'LATER') {
    const later = new LaterQueue({ notification_id: notification._id, user_id: event.user_id, scheduled_for: new Date() });
    await later.save();
  }

  return { classification };
};

module.exports = { processEvent };
