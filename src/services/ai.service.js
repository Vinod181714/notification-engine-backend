const OpenAI = require('openai');
const circuitBreaker = require('./circuitBreaker.service');
const logger = require('../utils/logger');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const promptTemplate = (event) => {
  return `Classify the following event into NOW, LATER or NEVER. Respond only with valid JSON.
{
  "event_type": "${event.event_type}",
  "message": "${event.message}",
  "title": "${event.title}",
  "source": "${event.source}",
  "priority_hint": "${event.priority_hint}",
  "channel": "${event.channel}"
}

Return JSON like {"classification":"NOW","confidence":0.9,"reason":"explanation"}`;
};

const callAI = async (event) => {
  if (circuitBreaker.getStatus() === 'OPEN') {
    logger.warn('Circuit breaker open, skipping AI');
    return { classification: null, confidence: 0, reason: null, ai_model: null, ai_is_fallback: true };
  }

  let attempt = 0;
  const maxAttempts = 3;
  let delay = 1000;
  while (attempt < maxAttempts) {
    try {
      const response = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [{ role: 'user', content: promptTemplate(event) }],
        max_tokens: 200
      });
      const text = response.choices[0].message.content.trim();
      const obj = JSON.parse(text);
      circuitBreaker.reportSuccess();
      // return the number of attempts so caller can log it
      return { ...obj, ai_model: process.env.OPENAI_MODEL || 'gpt-4o-mini', ai_is_fallback: false, attempts: attempt + 1 };
    } catch (err) {
      attempt += 1;
      circuitBreaker.reportFailure();
      if (attempt >= maxAttempts) {
        logger.error('AI service failed after retries', err);
        // include attempts and optionally error info
        return { classification: null, confidence: 0, reason: null, ai_model: process.env.OPENAI_MODEL || 'gpt-4o-mini', ai_is_fallback: true, attempts, ai_error: err.message };
      }
      await new Promise(r => setTimeout(r, delay));
      delay *= 2;
    }
  }
};

module.exports = { callAI };
