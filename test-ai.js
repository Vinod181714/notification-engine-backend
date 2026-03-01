require('dotenv').config();
(async () => {
  const ai = require('./src/services/ai.service');
  try {
    const r = await ai.callAI({ event_type: 'test', message: 'hello world', priority_hint: 'low', channel: 'email', user_id: 'x' });
    console.log('AI result', r);
  } catch (e) {
    console.error('AI error', e);
  }
  process.exit(0);
})();