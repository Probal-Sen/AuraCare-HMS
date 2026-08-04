const LabReport = require('../models/LabReport');
const { mockDb } = require('../utils/seedData');

// @desc Get lab reports
// @route GET /api/lab/reports
exports.getLabReports = async (req, res) => {
  try {
    const { patientId, status, category } = req.query;

    if (req.isMockDb) {
      let filtered = [...mockDb.labReports];
      if (patientId) filtered = filtered.filter((r) => r.patient === patientId);
      if (status) filtered = filtered.filter((r) => r.status === status);
      if (category) filtered = filtered.filter((r) => r.testCategory === category);

      const populated = filtered.map((rep) => {
        const patient = mockDb.patients.find((p) => p._id === rep.patient) || { name: 'John Doe', patientId: 'PAT-8001' };
        return { ...rep, patient };
      });

      return res.status(200).json({ success: true, count: populated.length, reports: populated });
    }

    let query = {};
    if (patientId) query.patient = patientId;
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

    const newReport = {
      _id: `66l1000${Date.now()}`,
      reportId,
      patient: patientId,
      doctor: doctorId || null,
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
      mockDb.labReports.push(newReport);
      return res.status(201).json({ success: true, report: newReport });
    }

    const report = await LabReport.create(newReport);
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
