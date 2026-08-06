const mongoose = require('mongoose');
const Medicine = require('../models/Medicine');
const { mockDb } = require('../utils/seedData');

// @desc Get medicines & inventory status
// @route GET /api/pharmacy/medicines
exports.getMedicines = async (req, res) => {
  try {
    const { category, search, alertType } = req.query;

    if (req.isMockDb) {
      let filtered = [...mockDb.medicines];
      if (category) filtered = filtered.filter((m) => m.category === category);
      if (alertType === 'lowStock') filtered = filtered.filter((m) => m.stockQuantity <= m.minStockAlert);
      if (alertType === 'expiry') {
        const soon = new Date();
        soon.setMonth(soon.getMonth() + 3);
        filtered = filtered.filter((m) => new Date(m.expiryDate) <= soon);
      }
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter((m) => m.name.toLowerCase().includes(q) || m.code.toLowerCase().includes(q));
      }

      return res.status(200).json({ success: true, count: filtered.length, medicines: filtered });
    }

    let query = {};
    if (category) query.category = category;
    if (alertType === 'lowStock') query.$expr = { $lte: ['$stockQuantity', '$minStockAlert'] };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }

    const medicines = await Medicine.find(query).sort({ name: 1 });
    res.status(200).json({ success: true, count: medicines.length, medicines });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Add medicine to inventory
// @route POST /api/pharmacy/medicines
exports.addMedicine = async (req, res) => {
  try {
    const { name, code, category, dosageForm, manufacturer, unitPrice, stockQuantity, minStockAlert, expiryDate, locationRack } = req.body;

    if (!name || !unitPrice || stockQuantity === undefined) {
      return res.status(400).json({ success: false, message: 'Name, unit price and stock quantity are required' });
    }

    const medCode = code || `MED-${Math.floor(100 + Math.random() * 900)}`;

    const medData = {
      code: medCode,
      name,
      category: category || 'Other',
      dosageForm: dosageForm || 'Tablet',
      manufacturer: manufacturer || 'Pharma Supplier',
      unitPrice: Number(unitPrice),
      stockQuantity: Number(stockQuantity),
      minStockAlert: Number(minStockAlert || 20),
      expiryDate: expiryDate ? new Date(expiryDate) : new Date('2027-12-31'),
      locationRack: locationRack || 'Rack A-01',
      createdAt: new Date(),
    };

    if (req.isMockDb) {
      const newMed = { _id: new mongoose.Types.ObjectId().toString(), ...medData };
      mockDb.medicines.push(newMed);
      return res.status(201).json({ success: true, medicine: newMed });
    }

    const medicine = await Medicine.create(medData);
    res.status(201).json({ success: true, medicine });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update stock quantity
// @route PUT /api/pharmacy/medicines/:id
exports.updateMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    delete updateData._id;

    if (req.isMockDb) {
      const idx = mockDb.medicines.findIndex((m) => m._id === id || m.code === id);
      if (idx !== -1) {
        mockDb.medicines[idx] = { ...mockDb.medicines[idx], ...updateData };
        return res.status(200).json({ success: true, medicine: mockDb.medicines[idx] });
      }
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }

    let medicine;
    if (mongoose.Types.ObjectId.isValid(id)) {
      medicine = await Medicine.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      medicine = await Medicine.findOneAndUpdate({ $or: [{ _id: id }, { code: id }] }, updateData, { new: true });
    }

    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }

    res.status(200).json({ success: true, medicine });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete medicine
// @route DELETE /api/pharmacy/medicines/:id
exports.deleteMedicine = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.isMockDb) {
      mockDb.medicines = mockDb.medicines.filter((m) => m._id !== id && m.code !== id);
      return res.status(200).json({ success: true, message: 'Medicine removed from inventory' });
    }

    if (mongoose.Types.ObjectId.isValid(id)) {
      await Medicine.findByIdAndDelete(id);
    } else {
      await Medicine.findOneAndDelete({ $or: [{ _id: id }, { code: id }] });
    }

    res.status(200).json({ success: true, message: 'Medicine removed from inventory' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
