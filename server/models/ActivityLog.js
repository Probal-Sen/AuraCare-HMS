const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    userRole: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      default: '',
    },
    action: {
      type: String,
      required: true, // e.g. "USER_LOGIN", "PATIENT_REGISTERED", "APPOINTMENT_BOOKED"
    },
    details: {
      type: String,
      default: '',
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ActivityLog', activityLogSchema);
