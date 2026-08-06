const mongoose = require('mongoose');
const LabReport = require('../models/LabReport');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const { mockDb } = require('../utils/seedData');
const { resolveRef, getPatientIdForUser } = require('../utils/idHelper');

// @desc Get lab reports (Scoped for Patient role)
// @route GET /api/lab/reports
exports.getLabReports = async (req, res) => {
  try {
    const { patientId, status, category } = req.query;
    const isPatientRole = req.user && req.user.role === 'Patient';
    let selfPatientId = null;

    if (isPatientRole) {
      selfPatientId = await getPatientIdForUser(req.user, req.isMockDb, mockDb);
    }

    if (req.isMockDb) {
      let filtered = [...mockDb.labReports];
      if (isPatientRole && selfPatientId) {
        filtered = filtered.filter((r) => r.patient === selfPatientId || r.patient._id === selfPatientId);
      } else {
        if (patientId) filtered = filtered.filter((r) => r.patient === patientId);
      }
      if (status) filtered = filtered.filter((r) => r.status === status);
      if (category) filtered = filtered.filter((r) => r.testCategory === category);

      const populated = filtered.map((rep) => {
        const patient = mockDb.patients.find((p) => p._id === rep.patient) || { name: 'John Doe', patientId: 'PAT-8001' };
        return { ...rep, patient };
      });

      return res.status(200).json({ success: true, count: populated.length, reports: populated });
    }

    let query = {};
    if (isPatientRole && selfPatientId) {
      query.patient = selfPatientId;
    } else {
      if (patientId) query.patient = patientId;
    }
    if (status) query.status = status;
    if (category) query.testCategory = category;

    const reports = await LabReport.find(query)
      .populate('patient', 'name patientId age gender')
      .populate('doctor', 'name specialization')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reports.length, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Create pending lab test order
// @route POST /api/lab/reports
exports.createLabReport = async (req, res) => {
  try {
    const { patientId, doctorId, testName, testCategory, cost } = req.body;

    if (!patientId || !testName) {
      return res.status(400).json({ success: false, message: 'Patient and test name are required' });
    }

    const reportId = `LAB-${Math.floor(1000 + Math.random() * 9000)}`;

    const patientRef = !req.isMockDb ? await resolveRef(Patient, 'patientId', patientId) : patientId;
    const doctorRef = !req.isMockDb ? await resolveRef(Doctor, 'doctorId', doctorId) : doctorId;

    const reportData = {
      reportId,
      patient: patientRef,
      doctor: doctorRef,
      testName,
      testCategory: testCategory || 'Blood Test',
      cost: cost || 100,
      status: 'Pending',
      resultSummary: 'Awaiting lab assistant examination.',
      fileUrl: '',
      fileType: 'None',
      uploadedBy: 'Lab Assistant',
      createdAt: new Date(),
    };

    if (req.isMockDb) {
      const newReport = { _id: new mongoose.Types.ObjectId().toString(), ...reportData };
      mockDb.labReports.push(newReport);
      return res.status(201).json({ success: true, report: newReport });
    }

    const report = await LabReport.create(reportData);
    res.status(201).json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Upload completed lab report or scan file (X-Ray / MRI / CT)
// @route PUT /api/lab/reports/:id/upload
exports.uploadLabResult = async (req, res) => {
  try {
    const { id } = req.params;
    const { resultSummary } = req.body;

    let fileUrl = '';
    let fileType = 'None';

    if (req.file) {
      fileUrl = `/uploads/reports/${req.file.filename}`;
      fileType = req.file.mimetype.includes('pdf') ? 'PDF' : 'Image';
    }

    if (req.isMockDb) {
      const idx = mockDb.labReports.findIndex((r) => r._id === id || r.reportId === id);
      if (idx !== -1) {
        mockDb.labReports[idx].status = 'Completed';
        if (resultSummary) mockDb.labReports[idx].resultSummary = resultSummary;
        if (fileUrl) mockDb.labReports[idx].fileUrl = fileUrl;
        if (fileType !== 'None') mockDb.labReports[idx].fileType = fileType;
        return res.status(200).json({ success: true, report: mockDb.labReports[idx] });
      }
      return res.status(404).json({ success: false, message: 'Lab report order not found' });
    }

    const updateObj = { status: 'Completed' };
    if (resultSummary) updateObj.resultSummary = resultSummary;
    if (fileUrl) updateObj.fileUrl = fileUrl;
    if (fileType !== 'None') updateObj.fileType = fileType;

    const report = await LabReport.findByIdAndUpdate(id, updateObj, { new: true });
    res.status(200).json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update lab report details
// @route PUT /api/lab/reports/:id
exports.updateLabReport = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    delete updateData._id;

    if (req.isMockDb) {
      const idx = mockDb.labReports.findIndex((r) => r._id === id || r.reportId === id);
      if (idx !== -1) {
        mockDb.labReports[idx] = { ...mockDb.labReports[idx], ...updateData };
        return res.status(200).json({ success: true, report: mockDb.labReports[idx] });
      }
      return res.status(404).json({ success: false, message: 'Lab report order not found' });
    }

    let report;
    if (mongoose.Types.ObjectId.isValid(id)) {
      report = await LabReport.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      report = await LabReport.findOneAndUpdate({ $or: [{ _id: id }, { reportId: id }] }, updateData, { new: true });
    }

    if (!report) {
      return res.status(404).json({ success: false, message: 'Lab report order not found' });
    }

    res.status(200).json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete lab report
// @route DELETE /api/lab/reports/:id
exports.deleteLabReport = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.isMockDb) {
      mockDb.labReports = mockDb.labReports.filter((r) => r._id !== id && r.reportId !== id);
      return res.status(200).json({ success: true, message: 'Lab report deleted successfully' });
    }

    if (mongoose.Types.ObjectId.isValid(id)) {
      await LabReport.findByIdAndDelete(id);
    } else {
      await LabReport.findOneAndDelete({ $or: [{ _id: id }, { reportId: id }] });
    }

    res.status(200).json({ success: true, message: 'Lab report deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
