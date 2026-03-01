const AuditLog = require('../models/AuditLog');

exports.listLogs = async (req, res) => {
  const { user_id, classification, decision_stage, dateFrom, dateTo, startDate, endDate, page = 1, limit = 50 } = req.query;
  const filter = {};
  
  if (user_id) filter.user_id = user_id;
  if (classification) filter.classification = classification;
  if (decision_stage) filter.decision_stage = decision_stage;
  
  // Support both dateFrom/dateTo and startDate/endDate
  const fromDate = dateFrom || startDate;
  const toDate = dateTo || endDate;
  
  if (fromDate || toDate) {
    filter.createdAt = {};
    if (fromDate) filter.createdAt.$gte = new Date(fromDate);
    if (toDate) {
      const toDateObj = new Date(toDate);
      toDateObj.setHours(23, 59, 59, 999); // Include entire day
      filter.createdAt.$lte = toDateObj;
    }
  }

  const skip = (page - 1) * limit;
  const total = await AuditLog.countDocuments(filter);
  const items = await AuditLog.find(filter)
    .populate('notification_id', 'event_type message priority_hint channel')
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });
  res.json({ total, page, limit, items });
};
