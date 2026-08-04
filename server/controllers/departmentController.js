const Department = require('../models/Department');
const { mockDb } = require('../utils/seedData');

// @desc Get departments
// @route GET /api/departments
exports.getDepartments = async (req, res) => {
  try {
    if (req.isMockDb) {
      return res.status(200).json({ success: true, count: mockDb.departments.length, departments: mockDb.departments });
    }
    const departments = await Department.find().sort({ name: 1 });
    res.status(200).json({ success: true, count: departments.length, departments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Create department
// @route POST /api/departments
exports.createDepartment = async (req, res) => {
  try {
    const { name, code, description, headDoctor } = req.body;
    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'Department name and code are required' });
    }

    const deptObj = {
      _id: `66a1000${Date.now()}`,
      name,
      code,
      description: description || '',
      headDoctor: headDoctor || 'Unassigned',
      status: 'Active',
    };

    if (req.isMockDb) {
      mockDb.departments.push(deptObj);
      return res.status(201).json({ success: true, department: deptObj });
    }

    const department = await Department.create(deptObj);
    res.status(201).json({ success: true, department });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update department
// @route PUT /api/departments/:id
exports.updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.isMockDb) {
      const idx = mockDb.departments.findIndex((d) => d._id === id);
      if (idx !== -1) {
        mockDb.departments[idx] = { ...mockDb.departments[idx], ...req.body };
        return res.status(200).json({ success: true, department: mockDb.departments[idx] });
      }
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    const department = await Department.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({ success: true, department });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete department
// @route DELETE /api/departments/:id
exports.deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.isMockDb) {
      mockDb.departments = mockDb.departments.filter((d) => d._id !== id);
      return res.status(200).json({ success: true, message: 'Department deleted' });
    }

    await Department.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Department deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
