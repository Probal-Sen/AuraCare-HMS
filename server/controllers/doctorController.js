const Doctor = require('../models/Doctor');
const { mockDb } = require('../utils/seedData');

// @desc Get all doctors
// @route GET /api/doctors
exports.getDoctors = async (req, res) => {
  try {
    const { department, specialization, status } = req.query;

    if (req.isMockDb) {
      let filtered = [...mockDb.doctors];
      if (department) filtered = filtered.filter((d) => d.department === department);
      if (specialization) filtered = filtered.filter((d) => d.specialization.includes(specialization));
      if (status) filtered = filtered.filter((d) => d.status === status);
      return res.status(200).json({ success: true, count: filtered.length, doctors: filtered });
    }

    let query = {};
    if (department) query.department = department;
    if (specialization) query.specialization = { $regex: specialization, $options: 'i' };
    if (status) query.status = status;

    const doctors = await Doctor.find(query).populate('department', 'name code').sort({ name: 1 });
    res.status(200).json({ success: true, count: doctors.length, doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get doctor details by ID
// @route GET /api/doctors/:id
exports.getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.isMockDb) {
      const doc = mockDb.doctors.find((d) => d._id === id || d.doctorId === id || d.userId === id);
      if (!doc) return res.status(404).json({ success: false, message: 'Doctor not found' });
      return res.status(200).json({ success: true, doctor: doc });
    }

    const doctor = await Doctor.findById(id).populate('department', 'name code');
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.status(200).json({ success: true, doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update doctor schedule or profile
// @route PUT /api/doctors/:id
exports.updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.isMockDb) {
      const idx = mockDb.doctors.findIndex((d) => d._id === id || d.doctorId === id);
      if (idx !== -1) {
        mockDb.doctors[idx] = { ...mockDb.doctors[idx], ...req.body };
        return res.status(200).json({ success: true, doctor: mockDb.doctors[idx] });
      }
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const doctor = await Doctor.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({ success: true, doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
