const mongoose = require('mongoose');
const MedicalRecord = require('../models/MedicalRecord');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const { mockDb } = require('../utils/seedData');
const { resolveRef, getPatientIdForUser } = require('../utils/idHelper');

// @desc Get medical records for a patient (Scoped for Patient role)
// @route GET /api/medical-records
exports.getMedicalRecords = async (req, res) => {
  try {
    const { patientId, doctorId } = req.query;
    const isPatientRole = req.user && req.user.role === 'Patient';
    let selfPatientId = null;

    if (isPatientRole) {
      selfPatientId = await getPatientIdForUser(req.user, req.isMockDb, mockDb);
    }

    if (req.isMockDb) {
      let records = [...(mockDb.medicalRecords || [])];
      if (records.length === 0) {
        records = [
          {
            _id: '66rec0001',
            patient: selfPatientId || patientId || '660e00000000000000000001',
            doctor: doctorId || '660d00000000000000000001',
            diagnosis: 'Mild Essential Hypertension',
            symptoms: 'Headache, Fatigue, Elevated Blood Pressure (140/90)',
            notes: 'Advised low salt diet, daily 30-min cardio walking, and regular BP monitor.',
            vitals: { bloodPressure: '138/88 mmHg', heartRate: '78 bpm', temperature: '98.6 °F', weight: '76 kg' },
            createdAt: new Date('2026-08-01'),
          },
        ];
      }
      if (isPatientRole && selfPatientId) {
        records = records.filter((r) => r.patient === selfPatientId || r.patient._id === selfPatientId);
      }
      return res.status(200).json({ success: true, count: records.length, records });
    }

    let query = {};
    if (isPatientRole && selfPatientId) {
      query.patient = selfPatientId;
    } else {
      if (patientId) query.patient = patientId;
      if (doctorId) query.doctor = doctorId;
    }

    const records = await MedicalRecord.find(query)
      .populate('patient', 'name patientId')
      .populate('doctor', 'name specialization')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: records.length, records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Add new medical record / diagnosis
// @route POST /api/medical-records
exports.createMedicalRecord = async (req, res) => {
  try {
    const { patientId, doctorId, appointmentId, diagnosis, symptoms, notes, vitals } = req.body;

    if (!patientId || !diagnosis) {
      return res.status(400).json({ success: false, message: 'Patient and diagnosis are required' });
    }

    const patientRef = !req.isMockDb ? await resolveRef(Patient, 'patientId', patientId) : patientId;
    const doctorRef = !req.isMockDb ? await resolveRef(Doctor, 'doctorId', doctorId) : doctorId;
    const aptRef = !req.isMockDb ? await resolveRef(Appointment, 'appointmentId', appointmentId) : appointmentId;

    const recordData = {
      patient: patientRef,
      doctor: doctorRef,
      appointment: aptRef,
      diagnosis,
      symptoms: symptoms || '',
      notes: notes || '',
      vitals: vitals || {},
      createdAt: new Date(),
    };

    if (req.isMockDb) {
      const newRecord = { _id: new mongoose.Types.ObjectId().toString(), ...recordData };
      return res.status(201).json({ success: true, record: newRecord });
    }

    const record = await MedicalRecord.create(recordData);
    res.status(201).json({ success: true, record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
