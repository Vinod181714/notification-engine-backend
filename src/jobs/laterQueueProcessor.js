const cron = require('node-cron');
const LaterQueue = require('../models/LaterQueue');
const Notification = require('../models/Notification');
const ruleEngine = require('../services/ruleEngine.service');
const logger = require('../utils/logger');

const processQueue = async () => {
  try {
    const items = await LaterQueue.find({ status: 'PENDING', scheduled_for: { $lte: new Date() } });
    for (const item of items) {
      try {
        item.status = 'PROCESSING';
        await item.save();

        const notification = await Notification.findById(item.notification_id);
        if (!notification) {
          item.status = 'FAILED';
          item.last_error = 'notification_missing';
          await item.save();
          continue;
        }
        const { classification, ruleTriggered } = await ruleEngine.evaluate(notification);
        notification.classification = classification;
        await notification.save();

        item.status = 'DONE';
        await item.save();
      } catch (err) {
        item.retry_count += 1;
        item.last_error = err.message;
        if (item.retry_count >= item.max_retries) {
          item.status = 'FAILED';
        } else {
          item.status = 'PENDING';
          item.scheduled_for = new Date(Date.now() + Math.pow(2, item.retry_count) * 60000);
        }
        await item.save();
        logger.error('later queue item processing failed', err);
      }
    }
  } catch (err) {
    logger.error('later queue processor error', err);
  }
};

const start = () => {
  cron.schedule('*/5 * * * *', processQueue, { timezone: 'UTC' });
};

module.exports = { start };
