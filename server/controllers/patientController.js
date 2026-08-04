const Patient = require('../models/Patient');
const { mockDb } = require('../utils/seedData');

// @desc Get all patients with search & filters
// @route GET /api/patients
exports.getPatients = async (req, res) => {
  try {
    const { search, admissionType, bloodGroup } = req.query;

    if (req.isMockDb) {
      let filtered = [...mockDb.patients];
      if (admissionType) filtered = filtered.filter((p) => p.admissionType === admissionType);
      if (bloodGroup) filtered = filtered.filter((p) => p.bloodGroup === bloodGroup);
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.patientId.toLowerCase().includes(q) ||
            p.phone.includes(q)
        );
      }
      return res.status(200).json({ success: true, count: filtered.length, patients: filtered });
    }

    let query = {};
    if (admissionType) query.admissionType = admissionType;
    if (bloodGroup) query.bloodGroup = bloodGroup;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { patientId: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const patients = await Patient.find(query).populate('assignedDoctor', 'name specialization').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: patients.length, patients });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Create new patient (Receptionist or Admin)
// @route POST /api/patients
exports.createPatient = async (req, res) => {
  try {
    const { name, age, gender, bloodGroup, phone, email, address, emergencyContact, admissionType, roomNumber, assignedDoctor, allergies } = req.body;

    if (!name || !age || !gender || !phone) {
      return res.status(400).json({ success: false, message: 'Please provide patient name, age, gender and phone number' });
    }

    const patientId = `PAT-${Math.floor(1000 + Math.random() * 9000)}`;

    const newPatient = {
      _id: `66p1000${Date.now()}`,
      patientId,
      name,
      age: Number(age),
      gender,
      bloodGroup: bloodGroup || 'Unknown',
      phone,
      email: email || '',
      address: address || '',
      emergencyContact: emergencyContact || { name: '', relationship: '', phone: '' },
      admissionType: admissionType || 'OPD',
      roomNumber: roomNumber || (admissionType === 'IPD' ? 'Room 101' : 'N/A'),
      assignedDoctor: assignedDoctor || null,
      allergies: allergies || [],
      createdAt: new Date(),
    };

    if (req.isMockDb) {
      mockDb.patients.push(newPatient);
      return res.status(201).json({ success: true, patient: newPatient });
    }

    const patient = await Patient.create(newPatient);
    res.status(201).json({ success: true, patient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get single patient by ID
// @route GET /api/patients/:id
exports.getPatientById = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.isMockDb) {
      const patient = mockDb.patients.find((p) => p._id === id || p.patientId === id || p.userId === id);
      if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
      return res.status(200).json({ success: true, patient });
    }

    const patient = await Patient.findById(id).populate('assignedDoctor', 'name specialization roomNumber');
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
    res.status(200).json({ success: true, patient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update patient details
// @route PUT /api/patients/:id
exports.updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.isMockDb) {
      const idx = mockDb.patients.findIndex((p) => p._id === id || p.patientId === id);
      if (idx !== -1) {
        mockDb.patients[idx] = { ...mockDb.patients[idx], ...req.body };
        return res.status(200).json({ success: true, patient: mockDb.patients[idx] });
      }
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const patient = await Patient.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({ success: true, patient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete patient
// @route DELETE /api/patients/:id
exports.deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.isMockDb) {
      mockDb.patients = mockDb.patients.filter((p) => p._id !== id && p.patientId !== id);
      return res.status(200).json({ success: true, message: 'Patient deleted successfully' });
    }

    await Patient.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Patient deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
