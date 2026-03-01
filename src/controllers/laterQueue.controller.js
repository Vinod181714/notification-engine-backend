const LaterQueue = require('../models/LaterQueue');

exports.listQueue = async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  const skip = (page - 1) * limit;
  const total = await LaterQueue.countDocuments(filter);
  const items = await LaterQueue.find(filter).skip(skip).limit(Number(limit)).sort({ scheduled_for: 1 });
  res.json({ total, page, limit, items });
};
