const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const { mockDb } = require('../utils/seedData');

// @desc Get notifications
// @route GET /api/notifications
exports.getNotifications = async (req, res) => {
  try {
    const role = req.user ? req.user.role : 'All';

    if (req.isMockDb) {
      const filtered = mockDb.notifications.filter((n) => n.userRole === 'All' || n.userRole === role);
      return res.status(200).json({ success: true, notifications: filtered });
    }

    const notifications = await Notification.find({
      $or: [{ userRole: 'All' }, { userRole: role }],
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Mark notification as read
// @route PUT /api/notifications/:id/read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.isMockDb) {
      const idx = mockDb.notifications.findIndex((n) => n._id === id);
      if (idx !== -1) mockDb.notifications[idx].isRead = true;
      return res.status(200).json({ success: true, message: 'Notification marked as read' });
    }

    if (mongoose.Types.ObjectId.isValid(id)) {
      await Notification.findByIdAndUpdate(id, { isRead: true });
    } else {
      await Notification.findOneAndUpdate({ _id: id }, { isRead: true });
    }

    res.status(200).json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
