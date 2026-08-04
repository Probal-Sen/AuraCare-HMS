const ActivityLog = require('../models/ActivityLog');
const { mockDb } = require('../utils/seedData');

// @desc Get audit activity logs
// @route GET /api/activity-logs
exports.getActivityLogs = async (req, res) => {
  try {
    if (req.isMockDb) {
      return res.status(200).json({ success: true, count: mockDb.activityLogs.length, logs: mockDb.activityLogs });
    }

    const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(100);
    res.status(200).json({ success: true, count: logs.length, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
