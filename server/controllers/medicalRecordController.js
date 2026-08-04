const MedicalRecord = require('../models/MedicalRecord');
const { mockDb } = require('../utils/seedData');

// @desc Get medical records for a patient
// @route GET /api/medical-records
exports.getMedicalRecords = async (req, res) => {
  try {
    const { patientId, doctorId } = req.query;

    if (req.isMockDb) {
      let records = [
        {
          _id: '66rec0001',
          patient: patientId || '66p100000000000000000001',
          doctor: doctorId || '66d100000000000000000001',
          diagnosis: 'Mild Essential Hypertension',
          symptoms: 'Headache, Fatigue, Elevated Blood Pressure (140/90)',
          notes: 'Advised low salt diet, daily 30-min cardio walking, and regular BP monitor.',
          vitals: { bloodPressure: '138/88 mmHg', heartRate: '78 bpm', temperature: '98.6 °F', weight: '76 kg' },
          createdAt: new Date('2026-08-01'),
        },
      ];
      return res.status(200).json({ success: true, count: records.length, records });
    }

    let query = {};
    if (patientId) query.patient = patientId;
    if (doctorId) query.doctor = doctorId;

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

    const newRecord = {
      _id: `66rec${Date.now()}`,
      patient: patientId,
      doctor: doctorId || '66d100000000000000000001',
      appointment: appointmentId,
      diagnosis,
      symptoms: symptoms || '',
      notes: notes || '',
      vitals: vitals || {},
      createdAt: new Date(),
    };

    if (req.isMockDb) {
      return res.status(201).json({ success: true, record: newRecord });
    }

    const record = await MedicalRecord.create(newRecord);
    res.status(201).json({ success: true, record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
