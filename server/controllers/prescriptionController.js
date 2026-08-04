const Prescription = require('../models/Prescription');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const { generatePrescriptionPDF } = require('../utils/pdfGenerator');
const { mockDb } = require('../utils/seedData');

// @desc Get prescriptions
// @route GET /api/prescriptions
exports.getPrescriptions = async (req, res) => {
  try {
    const { patientId, doctorId, status } = req.query;

    if (req.isMockDb) {
      let filtered = [...mockDb.prescriptions];
      if (patientId) filtered = filtered.filter((p) => p.patient === patientId);
      if (doctorId) filtered = filtered.filter((p) => p.doctor === doctorId);
      if (status) filtered = filtered.filter((p) => p.status === status);

      const populated = filtered.map((rx) => {
        const patient = mockDb.patients.find((p) => p._id === rx.patient) || { name: 'John Doe', patientId: 'PAT-8001' };
        const doctor = mockDb.doctors.find((d) => d._id === rx.doctor) || { name: 'Dr. Sarah Jenkins' };
        return { ...rx, patient, doctor };
      });

      return res.status(200).json({ success: true, count: populated.length, prescriptions: populated });
    }

    let query = {};
    if (patientId) query.patient = patientId;
    if (doctorId) query.doctor = doctorId;
    if (status) query.status = status;

    const prescriptions = await Prescription.find(query)
      .populate('patient', 'name patientId age gender')
      .populate('doctor', 'name specialization roomNumber')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: prescriptions.length, prescriptions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Create prescription (Doctor)
// @route POST /api/prescriptions
exports.createPrescription = async (req, res) => {
  try {
    const { patientId, doctorId, appointmentId, medicines, diagnosisNotes } = req.body;

    if (!patientId || !medicines || medicines.length === 0) {
      return res.status(400).json({ success: false, message: 'Patient and at least one medicine required' });
    }

    const prescriptionId = `RX-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRx = {
      _id: `66pr100${Date.now()}`,
      prescriptionId,
      patient: patientId,
      doctor: doctorId || '66d100000000000000000001',
      appointment: appointmentId,
      medicines,
      diagnosisNotes: diagnosisNotes || '',
      status: 'Pending',
      createdAt: new Date(),
    };

    if (req.isMockDb) {
      mockDb.prescriptions.push(newRx);
      return res.status(201).json({ success: true, prescription: newRx });
    }

    const prescription = await Prescription.create(newRx);
    res.status(201).json({ success: true, prescription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Dispense prescription (Pharmacist)
// @route PUT /api/prescriptions/:id/dispense
exports.dispensePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const pharmacistName = req.user ? req.user.name : 'Pharmacist';

    if (req.isMockDb) {
      const idx = mockDb.prescriptions.findIndex((p) => p._id === id || p.prescriptionId === id);
      if (idx !== -1) {
        mockDb.prescriptions[idx].status = 'Dispensed';
        mockDb.prescriptions[idx].dispensedBy = pharmacistName;
        mockDb.prescriptions[idx].dispensedAt = new Date();
        return res.status(200).json({ success: true, prescription: mockDb.prescriptions[idx] });
      }
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    const prescription = await Prescription.findByIdAndUpdate(
      id,
      { status: 'Dispensed', dispensedBy: pharmacistName, dispensedAt: new Date() },
      { new: true }
    );

    res.status(200).json({ success: true, prescription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Download Prescription PDF
// @route GET /api/prescriptions/:id/pdf
exports.downloadPrescriptionPDF = async (req, res) => {
  try {
    const { id } = req.params;

    let rx, patient, doctor;

    if (req.isMockDb) {
      rx = mockDb.prescriptions.find((p) => p._id === id || p.prescriptionId === id) || mockDb.prescriptions[0];
      const patientIdStr = rx && typeof rx.patient === 'object' ? rx.patient._id : rx?.patient;
      const doctorIdStr = rx && typeof rx.doctor === 'object' ? rx.doctor._id : rx?.doctor;

      patient = mockDb.patients.find((p) => p._id === patientIdStr || p.patientId === patientIdStr) || { name: 'John Doe', patientId: 'PAT-8001', age: 38, gender: 'Male' };
      doctor = mockDb.doctors.find((d) => d._id === doctorIdStr || d.doctorId === doctorIdStr) || { name: 'Dr. Sarah Jenkins', specialization: 'Cardiologist', roomNumber: '201' };
    } else {
      rx = await Prescription.findById(id).populate('patient').populate('doctor');
      if (!rx) return res.status(404).json({ success: false, message: 'Prescription not found' });
      patient = rx.patient || { name: 'John Doe', patientId: 'PAT-8001' };
      doctor = rx.doctor || { name: 'Dr. Sarah Jenkins', specialization: 'Cardiologist' };
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Prescription_${rx?.prescriptionId || 'RX-001'}.pdf`);

    generatePrescriptionPDF(rx || {}, patient || {}, doctor || {}, res);
  } catch (error) {
    console.error('Download prescription PDF error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
