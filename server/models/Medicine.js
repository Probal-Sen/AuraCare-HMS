const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['Antibiotic', 'Analgesic', 'Antipyretic', 'Antiseptic', 'Cardiovascular', 'Vitamins', 'Syrup', 'Injection', 'Other'],
      default: 'Other',
    },
    dosageForm: {
      type: String,
      default: 'Tablet', // Tablet, Capsule, Syrup, Injection, Cream
    },
    manufacturer: {
      type: String,
      default: 'Pharma Care',
    },
    unitPrice: {
      type: Number,
      required: true,
    },
    stockQuantity: {
      type: Number,
      required: true,
      default: 0,
    },
    minStockAlert: {
      type: Number,
      default: 20,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    locationRack: {
      type: String,
      default: 'Rack A-1',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Medicine', medicineSchema);
