const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Patient = require('../models/Patient');
const { mockDb } = require('../utils/seedData');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id || user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET || 'arogya_hms_jwt_super_secret_key_2026_production',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// @desc Login user
// @route POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const searchEmail = email.toLowerCase();
    const altEmail = searchEmail.includes('@auracare.com')
      ? searchEmail.replace('@auracare.com', '@arogyahms.com')
      : searchEmail.replace('@arogyahms.com', '@auracare.com');

    let user;
    if (req.isMockDb) {
      user = mockDb.users.find(
        (u) => u.email.toLowerCase() === searchEmail || u.email.toLowerCase() === altEmail
      );
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
      const isMatch = password === user.password || (await bcrypt.compare(password, user.password));
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
    } else {
      user = await User.findOne({ $or: [{ email: searchEmail }, { email: altEmail }] }).select('+password');
      if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
    }

    const token = generateToken(user);
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        avatar: user.avatar || '/uploads/avatars/default.png',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Register new Patient account
// @route POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, age, gender, bloodGroup, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide required fields' });
    }

    let userExists;
    if (req.isMockDb) {
      userExists = mockDb.users.some((u) => u.email.toLowerCase() === email.toLowerCase());
    } else {
      userExists = await User.findOne({ email });
    }

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    let createdUser;

    if (req.isMockDb) {
      const mockUserObj = {
        _id: new mongoose.Types.ObjectId().toString(),
        name,
        email,
        password,
        role: 'Patient',
        phone: phone || '',
        avatar: '/uploads/avatars/default.png',
        status: 'Active',
      };

      const mockPatientObj = {
        _id: new mongoose.Types.ObjectId().toString(),
        userId: mockUserObj._id,
        patientId: `PAT-${Math.floor(1000 + Math.random() * 9000)}`,
        name,
        age: age || 30,
        gender: gender || 'Male',
        bloodGroup: bloodGroup || 'O+',
        phone: phone || 'N/A',
        email,
        address: address || '',
        admissionType: 'OPD',
      };

      mockDb.users.push(mockUserObj);
      mockDb.patients.push(mockPatientObj);
      createdUser = mockUserObj;
    } else {
      const dbUser = await User.create({ name, email, password, role: 'Patient', phone });
      const dbPatient = await Patient.create({
        userId: dbUser._id,
        patientId: `PAT-${Math.floor(1000 + Math.random() * 9000)}`,
        name,
        age: age || 30,
        gender: gender || 'Male',
        bloodGroup: bloodGroup || 'O+',
        phone: phone || 'N/A',
        email,
        address: address || '',
      });

      createdUser = {
        _id: dbUser._id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
        phone: dbUser.phone || '',
        avatar: dbUser.avatar || '/uploads/avatars/default.png',
      };

      mockDb.users.push({ ...createdUser, password });
      mockDb.patients.push({
        _id: dbPatient._id,
        userId: dbUser._id,
        patientId: dbPatient.patientId,
        name,
        age: age || 30,
        gender: gender || 'Male',
        bloodGroup: bloodGroup || 'O+',
        phone: phone || 'N/A',
        email,
        address: address || '',
      });
    }

    const token = generateToken(createdUser);
    res.status(201).json({
      success: true,
      token,
      user: {
        id: createdUser._id,
        name: createdUser.name,
        email: createdUser.email,
        role: createdUser.role,
        phone: createdUser.phone,
        avatar: createdUser.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get current logged in user profile
// @route GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    let user;
    if (req.isMockDb) {
      user = mockDb.users.find((u) => u._id === req.user.id || u.id === req.user.id) || req.user;
    } else {
      user = await User.findById(req.user.id);
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        avatar: user.avatar || '/uploads/avatars/default.png',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update user profile details
// @route PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const userId = req.user.id || req.user._id;

    if (req.isMockDb) {
      const idx = mockDb.users.findIndex((u) => u._id === userId || u.id === userId);
      if (idx !== -1) {
        if (name) mockDb.users[idx].name = name;
        if (phone) mockDb.users[idx].phone = phone;
        return res.status(200).json({
          success: true,
          message: 'Profile updated successfully',
          user: {
            id: mockDb.users[idx]._id || mockDb.users[idx].id,
            name: mockDb.users[idx].name,
            email: mockDb.users[idx].email,
            role: mockDb.users[idx].role,
            phone: mockDb.users[idx].phone || '',
            avatar: mockDb.users[idx].avatar || '/uploads/avatars/default.png',
          },
        });
      }
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { ...(name && { name }), ...(phone !== undefined && { phone }) },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        avatar: user.avatar || '/uploads/avatars/default.png',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Upload Avatar
// @route POST /api/auth/upload-avatar
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file' });
    }
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const userId = req.user.id || req.user._id;

    if (req.isMockDb) {
      const idx = mockDb.users.findIndex((u) => u._id === userId || u.id === userId);
      if (idx !== -1) {
        mockDb.users[idx].avatar = avatarUrl;
      }
    } else {
      await User.findByIdAndUpdate(userId, { avatar: avatarUrl });
    }

    res.status(200).json({
      success: true,
      avatar: avatarUrl,
      message: 'Profile photo updated successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
