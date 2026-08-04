const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema(
  {
    prescriptionId: {
      type: String,
      required: true,
      unique: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    medicines: [
      {
        medicineName: { type: String, required: true },
        dosage: { type: String, required: true }, // e.g. "500mg"
        frequency: { type: String, required: true }, // e.g. "1-0-1"
        duration: { type: String, required: true }, // e.g. "5 Days"
        instructions: { type: String, default: 'After meals' },
      },
    ],
    diagnosisNotes: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Pending', 'Dispensed', 'Cancelled'],
      default: 'Pending',
    },
    dispensedBy: { type: String, default: '' },
    dispensedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Prescription', prescriptionSchema);
