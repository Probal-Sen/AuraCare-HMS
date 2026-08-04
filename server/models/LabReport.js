const mongoose = require('mongoose');

const labReportSchema = new mongoose.Schema(
  {
    reportId: {
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
    },
    testName: {
      type: String,
      required: true,
    },
    testCategory: {
      type: String,
      enum: ['Blood Test', 'X-Ray', 'MRI', 'CT Scan', 'Pathology', 'Urine Analysis', 'ECG', 'Other'],
      default: 'Blood Test',
    },
    cost: {
      type: Number,
      default: 100,
    },
    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    resultSummary: {
      type: String,
      default: '',
    },
    fileUrl: {
      type: String,
      default: '',
    },
    fileType: {
      type: String,
      enum: ['PDF', 'Image', 'Document', 'None'],
      default: 'None',
    },
    uploadedBy: {
      type: String,
      default: 'Lab Assistant',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LabReport', labReportSchema);
