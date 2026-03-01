require('dotenv').config();

(async () => {
  await require('./src/config/database')();
  const { processEvent } = require('./src/services/notificationPipeline.service');
  const User = require('./src/models/User');

  const user = await User.findOne({ email: 'admin@cyepro.com' });

  const ts = Date.now();
  const events = [
    { event_type: 'user.signup', message: `New user registered from USA at ${ts}`, priority_hint: 'high', channel: 'email', user_id: user._id },
    { event_type: 'payment.failed', message: `Payment failed for order #${ts}`, priority_hint: 'critical', channel: 'sms', user_id: user._id },
    { event_type: 'login.attempt', message: `Failed login attempt detected at ${ts}`, priority_hint: 'medium', channel: 'push', user_id: user._id }
  ];

  for (const evt of events) {
    // process through normal pipeline (this schedules AI enrichment asynchronously)
    await processEvent(evt);
    console.log(`Created event: ${evt.event_type}`);

    // since the pipeline uses setImmediate for AI enrichment, the script may exit
    // before it runs.  For testing we will replicate the AI step here so that
    // audit log entries appear immediately and we can inspect them.
    try {
      const Notification = require('./src/models/Notification');
      const AuditLog = require('./src/models/AuditLog');
      const aiService = require('./src/services/ai.service');

      // find the notification we just created (messages include the timestamp so
      // they are unique)
      // try to locate the record we just inserted; match on type and user and
      // grab the most recent entry since messages could vary slightly when
      // deduplication or sanitization takes place
      const notification = await Notification.findOne({
        event_type: evt.event_type,
        user_id: evt.user_id
      }).sort({ createdAt: -1 }).exec();
      console.log('manual AI step, found notification:', !!notification, notification ? notification.message : '');
      if (notification) {
        const aiResult = await aiService.callAI(evt);
        notification.ai_classification = aiResult.classification;
        notification.ai_confidence = aiResult.confidence;
        notification.ai_reason = aiResult.reason;
        notification.ai_model = aiResult.ai_model;
        notification.ai_is_fallback = aiResult.ai_is_fallback;
        await notification.save();

        await AuditLog.create({
          notification_id: notification._id,
          user_id: evt.user_id,
          classification: aiResult.classification,
          reason: 'ai',
          decision_stage: 'ai',
          ai_classification: aiResult.classification,
          ai_model: aiResult.ai_model,
          ai_confidence: aiResult.confidence,
          ai_is_fallback: aiResult.ai_is_fallback,
          ai_attempts: aiResult.attempts || 1,
          ai_error: aiResult.ai_error,
          processing_ms: 0
        });
        console.log('manual AI audit log created');
      }
    } catch (err) {
      console.error('manual AI step failed', err);
    }
  }

  console.log('Created 3 test events');

  // give the async AI enrichment tasks a moment to complete (in case any still
  // pending) before exiting
  await new Promise(r => setTimeout(r, 2000));
  console.log('Waiting a moment before exit...');
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
