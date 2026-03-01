require('dotenv').config();

(async () => {
  await require('./src/config/database')();
  const { processEvent } = require('./src/services/notificationPipeline.service');
  const User = require('./src/models/User');

  const user = await User.findOne({ email: 'admin@cyepro.com' });

  // Create events with low priority_hint to trigger LATER classification
  const events = [
    { event_type: 'user.activity', message: 'User viewed product page', priority_hint: 'low', channel: 'email', user_id: user._id },
    { event_type: 'newsletter.pending', message: 'Weekly newsletter ready to send', priority_hint: 'low', channel: 'email', user_id: user._id },
    { event_type: 'report.generate', message: 'Monthly report generation queued', priority_hint: 'low', channel: 'internal', user_id: user._id }
  ];

  for (const evt of events) {
    await processEvent(evt);
    console.log(`Created LATER event: ${evt.event_type}`);
  }

  console.log('Created 3 LATER queue items');
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
