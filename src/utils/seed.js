const User = require('../models/User');
const Rule = require('../models/Rule');
const logger = require('./logger');

const createUsersAndRules = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@cyepro.com' });
    if (!adminExists) {
      const admin = new User({
        email: 'admin@cyepro.com',
        password: 'admin123',
        name: 'Administrator',
        role: 'admin',
        isActive: true
      });
      await admin.save();
      logger.info('Admin user created');
    }

    const opExists = await User.findOne({ email: 'operator@cyepro.com' });
    if (!opExists) {
      const operator = new User({
        email: 'operator@cyepro.com',
        password: 'operator123',
        name: 'Operator',
        role: 'operator',
        isActive: true
      });
      await operator.save();
      logger.info('Operator user created');
    }

    const rulesCount = await Rule.countDocuments();
    if (rulesCount === 0) {
      const rules = [
        {
          name: 'Critical Security Alerts',
          description: 'Immediate action for critical security events',
          conditions: { event_type: 'security', source: null, priority_hint: 'critical', channel: null },
          action: 'NOW',
          priority: 1,
          isActive: true
        },
        {
          name: 'System Outage',
          description: 'Notify immediately on system outage events',
          conditions: { event_type: 'outage', source: null, priority_hint: 'high', channel: null },
          action: 'NOW',
          priority: 2,
          isActive: true
        },
        {
          name: 'Marketing Emails',
          description: 'Delay classification for marketing messages',
          conditions: { event_type: 'marketing', source: null, priority_hint: 'low', channel: 'email' },
          action: 'LATER',
          priority: 10,
          isActive: true
        },
        {
          name: 'Low Priority Info',
          description: 'Never notify for low-priority informational events',
          conditions: { event_type: 'info', source: null, priority_hint: 'low', channel: null },
          action: 'NEVER',
          priority: 100,
          isActive: true
        }
      ];
      await Rule.insertMany(rules);
      logger.info('Seed rules created');
    }
  } catch (err) {
    logger.error('Seeding error', err);
  }
};

module.exports = { createUsersAndRules };
