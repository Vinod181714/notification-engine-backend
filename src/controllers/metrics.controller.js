const Notification = require('../models/Notification');

exports.getMetrics = async (req, res) => {
  const todayStart = new Date();
  todayStart.setHours(0,0,0,0);
  const tomorrow = new Date(todayStart.getTime() + 24*60*60*1000);

  const totalToday = await Notification.countDocuments({ createdAt: { $gte: todayStart, $lt: tomorrow } });
  const breakdownAgg = await Notification.aggregate([
    { $match: { createdAt: { $gte: todayStart, $lt: tomorrow } } },
    { $group: { _id: '$classification', count: { $sum: 1 } } }
  ]);
  const classificationBreakdown = {};
  breakdownAgg.forEach(b => classificationBreakdown[b._id] = b.count);

  const aiStatsAgg = await Notification.aggregate([
    { $match: { ai_model: { $exists: true } } },
    { $group: { _id: '$ai_model', avgConfidence: { $avg: '$ai_confidence' }, count: { $sum: 1 } } }
  ]);

  const hourlyTrendAgg = await Notification.aggregate([
    { $match: { createdAt: { $gte: todayStart, $lt: tomorrow } } },
    { $group: { _id: { hour: { $hour: '$createdAt' } }, count: { $sum: 1 } } },
    { $sort: { '_id.hour': 1 } }
  ]);

  res.json({ totalToday, classificationBreakdown, aiStats: aiStatsAgg, hourlyTrend: hourlyTrendAgg });
};
