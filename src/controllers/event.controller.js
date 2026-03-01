const Notification = require('../models/Notification');
const notificationPipeline = require('../services/notificationPipeline.service');

exports.createEvent = async (req, res) => {
  const event = { ...req.body, user_id: req.body.user_id || req.user._id };
  const result = await notificationPipeline.processEvent(event, req.app.get('socketio'));
  res.status(201).json(result);
};

exports.listEvents = async (req, res) => {
  const { user_id, event_type, classification, page = 1, limit = 20 } = req.query;
  const filter = { deletedAt: null };
  if (user_id) filter.user_id = user_id;
  if (event_type) filter.event_type = event_type;
  if (classification) filter.classification = classification;
  const skip = (page - 1) * limit;
  const total = await Notification.countDocuments(filter);
  const items = await Notification.find(filter).skip(skip).limit(Number(limit)).sort({ createdAt: -1 });
  res.json({ total, page, limit, items });
};
