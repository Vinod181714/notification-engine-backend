require('dotenv').config();

(async () => {
  await require('./src/config/database')();
  const ruleEngine = require('./src/services/ruleEngine.service');

  const testEvent = {
    event_type: 'user.activity',
    message: 'User viewed product page',
    priority_hint: 'low',
    channel: 'email',
    source: null
  };

  const result = await ruleEngine.evaluate(testEvent);
  console.log('Rule Engine Result:', JSON.stringify(result, null, 2));
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
