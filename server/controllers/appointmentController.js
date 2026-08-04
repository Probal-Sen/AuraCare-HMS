const Appointment = require('../models/Appointment');
const { mockDb } = require('../utils/seedData');

// @desc Get appointments with search & status filter
// @route GET /api/appointments
exports.getAppointments = async (req, res) => {
  try {
    const { doctorId, patientId, date, status, type } = req.query;

    if (req.isMockDb) {
      let filtered = [...mockDb.appointments];
      if (doctorId) filtered = filtered.filter((a) => a.doctor === doctorId || a.doctor._id === doctorId);
      if (patientId) filtered = filtered.filter((a) => a.patient === patientId || a.patient._id === patientId);
      if (date) filtered = filtered.filter((a) => a.date === date);
      if (status) filtered = filtered.filter((a) => a.status === status);
      if (type) filtered = filtered.filter((a) => a.type === type);

      // Populate mock titles/names
      const populated = filtered.map((apt) => {
        const patient = mockDb.patients.find((p) => p._id === apt.patient) || { name: 'John Doe', patientId: 'PAT-8001' };
        const doctor = mockDb.doctors.find((d) => d._id === apt.doctor) || { name: 'Dr. Sarah Jenkins', roomNumber: '201' };
        return { ...apt, patient, doctor };
      });

      return res.status(200).json({ success: true, count: populated.length, appointments: populated });
    }

    let query = {};
    if (doctorId) query.doctor = doctorId;
    if (patientId) query.patient = patientId;
    if (date) query.date = date;
    if (status) query.status = status;
    if (type) query.type = type;

    const appointments = await Appointment.find(query)
      .populate('patient', 'name patientId age gender phone')
      .populate('doctor', 'name specialization roomNumber consultationFee')
      .populate('department', 'name code')
      .sort({ date: 1, timeSlot: 1 });

    res.status(200).json({ success: true, count: appointments.length, appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Book new appointment
// @route POST /api/appointments
exports.createAppointment = async (req, res) => {
  try {
    const { patientId, doctorId, departmentId, date, timeSlot, type, reason } = req.body;

    if (!patientId || !doctorId || !date || !timeSlot) {
      return res.status(400).json({ success: false, message: 'Please provide patient, doctor, date and time slot' });
    }

    const appointmentId = `APT-${Math.floor(1000 + Math.random() * 9000)}`;

    const newApt = {
      _id: `66ap100${Date.now()}`,
      appointmentId,
      patient: patientId,
      doctor: doctorId,
      department: departmentId || '66a100000000000000000001',
      date,
      timeSlot,
      type: type || 'OPD',
      status: 'Scheduled',
      reason: reason || 'General Checkup',
      vitalsRecorded: { bloodPressure: '', heartRate: '', temperature: '', weight: '', recordedBy: '' },
      createdAt: new Date(),
    };

    if (req.isMockDb) {
      mockDb.appointments.push(newApt);
      const patient = mockDb.patients.find((p) => p._id === patientId) || { name: 'Patient' };
      const doctor = mockDb.doctors.find((d) => d._id === doctorId) || { name: 'Doctor' };
      return res.status(201).json({ success: true, appointment: { ...newApt, patient, doctor } });
    }

    const appointment = await Appointment.create(newApt);
    res.status(201).json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update appointment status or vitals
// @route PUT /api/appointments/:id
exports.updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.isMockDb) {
      const idx = mockDb.appointments.findIndex((a) => a._id === id || a.appointmentId === id);
      if (idx !== -1) {
        mockDb.appointments[idx] = { ...mockDb.appointments[idx], ...req.body };
        return res.status(200).json({ success: true, appointment: mockDb.appointments[idx] });
      }
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const appointment = await Appointment.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Cancel appointment
// @route DELETE /api/appointments/:id
exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.isMockDb) {
      const idx = mockDb.appointments.findIndex((a) => a._id === id || a.appointmentId === id);
      if (idx !== -1) {
        mockDb.appointments[idx].status = 'Cancelled';
        return res.status(200).json({ success: true, message: 'Appointment cancelled successfully' });
      }
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    await Appointment.findByIdAndUpdate(id, { status: 'Cancelled' });
    res.status(200).json({ success: true, message: 'Appointment cancelled successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
