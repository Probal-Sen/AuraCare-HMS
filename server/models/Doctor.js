const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctorId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    specialization: {
      type: String,
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },
    qualification: {
      type: String,
      default: 'MD / MBBS',
    },
    experienceYears: {
      type: Number,
      default: 5,
    },
    consultationFee: {
      type: Number,
      default: 50,
    },
    roomNumber: {
      type: String,
      default: '101',
    },
    availableDays: [{ type: String }], // e.g. ['Monday', 'Wednesday', 'Friday']
    availableSlots: [{ type: String }], // e.g. ['09:00 AM', '10:00 AM']
    status: {
      type: String,
      enum: ['Available', 'On Leave', 'Busy'],
      default: 'Available',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema);
