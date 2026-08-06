const mongoose = require('mongoose');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Department = require('../models/Department');
const { mockDb } = require('../utils/seedData');
const { resolveRef } = require('../utils/idHelper');

// @desc Get all users with filters, search, pagination
// @route GET /api/users
exports.getUsers = async (req, res) => {
  try {
    const { search, role, status } = req.query;

    if (req.isMockDb) {
      let filtered = [...mockDb.users];
      if (role) filtered = filtered.filter((u) => u.role === role);
      if (status) filtered = filtered.filter((u) => u.status === status);
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
      }
      return res.status(200).json({ success: true, count: filtered.length, users: filtered });
    }

    let query = {};
    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Create new User / Staff member
// @route POST /api/users
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, specialization, department } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const userData = {
      name,
      email,
      password: password || 'Password123!',
      role,
      phone: phone || '',
      status: 'Active',
      avatar: '/uploads/avatars/default.png',
      createdAt: new Date(),
    };

    if (req.isMockDb) {
      const userObj = { _id: new mongoose.Types.ObjectId().toString(), ...userData };
      mockDb.users.push(userObj);
      if (role === 'Doctor') {
        mockDb.doctors.push({
          _id: new mongoose.Types.ObjectId().toString(),
          userId: userObj._id,
          doctorId: `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
          name,
          specialization: specialization || 'General Medicine',
          department: department || 'General Medicine',
          consultationFee: 100,
          roomNumber: '102',
          status: 'Available',
        });
      }
      return res.status(201).json({ success: true, user: userObj });
    }

    const user = await User.create({ name, email, password, role, phone });
    if (role === 'Doctor') {
      const deptRef = await resolveRef(Department, ['code', 'name'], department);
      await Doctor.create({
        userId: user._id,
        doctorId: `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
        name,
        specialization: specialization || 'General Medicine',
        department: deptRef,
        consultationFee: 100,
      });
    }

    res.status(201).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update user
// @route PUT /api/users/:id
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, role, status, email } = req.body;
    const updateFields = {};
    if (name) updateFields.name = name;
    if (phone !== undefined) updateFields.phone = phone;
    if (role) updateFields.role = role;
    if (status) updateFields.status = status;
    if (email) updateFields.email = email;

    if (req.isMockDb) {
      const idx = mockDb.users.findIndex((u) => u._id === id || u.id === id);
      if (idx !== -1) {
        mockDb.users[idx] = { ...mockDb.users[idx], ...updateFields };
        return res.status(200).json({ success: true, user: mockDb.users[idx] });
      }
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let user;
    if (mongoose.Types.ObjectId.isValid(id)) {
      user = await User.findByIdAndUpdate(id, updateFields, { new: true }).select('-password');
    } else {
      user = await User.findOneAndUpdate({ _id: id }, updateFields, { new: true }).select('-password');
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete user
// @route DELETE /api/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.isMockDb) {
      mockDb.users = mockDb.users.filter((u) => u._id !== id && u.id !== id);
      return res.status(200).json({ success: true, message: 'User deleted successfully' });
    }

    if (mongoose.Types.ObjectId.isValid(id)) {
      await User.findByIdAndDelete(id);
    } else {
      await User.findOneAndDelete({ _id: id });
    }

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
