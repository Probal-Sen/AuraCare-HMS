const mongoose = require('mongoose');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const { mockDb } = require('../utils/seedData');
const { resolveRef, getPatientIdForUser } = require('../utils/idHelper');

// @desc Get all patients with search & filters (Scoped for Patient role)
// @route GET /api/patients
exports.getPatients = async (req, res) => {
  try {
    const { search, admissionType, bloodGroup } = req.query;
    const isPatientRole = req.user && req.user.role === 'Patient';
    let selfPatientId = null;

    if (isPatientRole) {
      selfPatientId = await getPatientIdForUser(req.user, req.isMockDb, mockDb);
    }

    if (req.isMockDb) {
      let filtered = [...mockDb.patients];
      if (isPatientRole && selfPatientId) {
        filtered = filtered.filter((p) => p._id === selfPatientId || p.patientId === selfPatientId || p.email.toLowerCase() === req.user.email.toLowerCase());
      }
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
    if (isPatientRole && selfPatientId) {
      query._id = selfPatientId;
    } else {
      if (admissionType) query.admissionType = admissionType;
      if (bloodGroup) query.bloodGroup = bloodGroup;
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { patientId: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
        ];
      }
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
    if (req.user && req.user.role === 'Patient') {
      return res.status(403).json({ success: false, message: 'Patients are not authorized to create patient records.' });
    }
    const { name, age, gender, bloodGroup, phone, email, address, emergencyContact, admissionType, roomNumber, assignedDoctor, allergies } = req.body;

    if (!name || !age || !gender || !phone) {
      return res.status(400).json({ success: false, message: 'Please provide patient name, age, gender and phone number' });
    }

    const patientId = `PAT-${Math.floor(1000 + Math.random() * 9000)}`;
    const doctorRef = !req.isMockDb ? await resolveRef(Doctor, 'doctorId', assignedDoctor) : assignedDoctor;

    const patientData = {
      patientId,
      name,
      age: Number(age),
      gender: gender || 'Male',
      bloodGroup: bloodGroup || 'Unknown',
      phone,
      email: email || '',
      address: address || '',
      emergencyContact: emergencyContact || { name: '', relationship: '', phone: '' },
      admissionType: admissionType || 'OPD',
      roomNumber: roomNumber || (admissionType === 'IPD' ? 'Room 101' : 'N/A'),
      assignedDoctor: doctorRef,
      allergies: allergies || [],
      createdAt: new Date(),
    };

    if (req.isMockDb) {
      const newPatient = { _id: new mongoose.Types.ObjectId().toString(), ...patientData };
      mockDb.patients.push(newPatient);
      return res.status(201).json({ success: true, patient: newPatient });
    }

    const patient = await Patient.create(patientData);
    res.status(201).json({ success: true, patient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get patient details by ID
// @route GET /api/patients/:id
exports.getPatientById = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.isMockDb) {
      const patient = mockDb.patients.find((p) => p._id === id || p.patientId === id);
      if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
      return res.status(200).json({ success: true, patient });
    }

    let patient;
    if (mongoose.Types.ObjectId.isValid(id)) {
      patient = await Patient.findById(id).populate('assignedDoctor', 'name specialization');
    } else {
      patient = await Patient.findOne({ $or: [{ _id: id }, { patientId: id }] }).populate('assignedDoctor', 'name specialization');
    }

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
    if (req.user && req.user.role === 'Patient') {
      return res.status(403).json({ success: false, message: 'Patients are not permitted to edit patient details.' });
    }
    const { id } = req.params;
    const updateData = { ...req.body };
    delete updateData._id;

    if (req.isMockDb) {
      const idx = mockDb.patients.findIndex((p) => p._id === id || p.patientId === id);
      if (idx !== -1) {
        mockDb.patients[idx] = { ...mockDb.patients[idx], ...updateData };
        return res.status(200).json({ success: true, patient: mockDb.patients[idx] });
      }
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    let patient;
    if (mongoose.Types.ObjectId.isValid(id)) {
      patient = await Patient.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      patient = await Patient.findOneAndUpdate({ $or: [{ _id: id }, { patientId: id }] }, updateData, { new: true });
    }

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

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

    if (mongoose.Types.ObjectId.isValid(id)) {
      await Patient.findByIdAndDelete(id);
    } else {
      await Patient.findOneAndDelete({ $or: [{ _id: id }, { patientId: id }] });
    }

    res.status(200).json({ success: true, message: 'Patient deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
