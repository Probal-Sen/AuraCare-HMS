const { mockDb } = require('../utils/seedData');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Bill = require('../models/Bill');
const Medicine = require('../models/Medicine');
const LabReport = require('../models/LabReport');
const Prescription = require('../models/Prescription');

// @desc Admin Dashboard Statistics
// @route GET /api/dashboard/admin
exports.getAdminDashboard = async (req, res) => {
  try {
    if (req.isMockDb) {
      const totalPatients = mockDb.patients.length;
      const totalDoctors = mockDb.doctors.length;
      const totalUsers = mockDb.users.length;
      const totalAppointments = mockDb.appointments.length;
      const totalRevenue = mockDb.bills.reduce((acc, b) => acc + (b.paidAmount || 0), 0);
      const lowStockCount = mockDb.medicines.filter((m) => m.stockQuantity <= m.minStockAlert).length;
      const pendingLabCount = mockDb.labReports.filter((l) => l.status === 'Pending').length;

      return res.status(200).json({
        success: true,
        stats: {
          totalPatients,
          totalDoctors,
          totalUsers,
          totalAppointments,
          totalRevenue,
          lowStockCount,
          pendingLabCount,
          occupancyRate: '78%',
        },
        revenueChart: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
          data: [12000, 15000, 18000, 14000, 22000, 26000, 24000, 31000],
        },
        appointmentChart: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          data: [42, 58, 65, 50, 72, 35, 20],
        },
        recentActivities: mockDb.activityLogs.slice(0, 5),
      });
    }

    const totalPatients = await Patient.countDocuments();
    const totalDoctors = await Doctor.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalAppointments = await Appointment.countDocuments();

    const bills = await Bill.find();
    const totalRevenue = bills.reduce((acc, b) => acc + (b.paidAmount || 0), 0);

    const lowStockCount = await Medicine.countDocuments({ $expr: { $lte: ['$stockQuantity', '$minStockAlert'] } });
    const pendingLabCount = await LabReport.countDocuments({ status: 'Pending' });

    res.status(200).json({
      success: true,
      stats: {
        totalPatients,
        totalDoctors,
        totalUsers,
        totalAppointments,
        totalRevenue,
        lowStockCount,
        pendingLabCount,
        occupancyRate: '78%',
      },
      revenueChart: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
        data: [12000, 15000, 18000, 14000, 22000, 26000, 24000, 31000],
      },
      appointmentChart: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        data: [42, 58, 65, 50, 72, 35, 20],
      },
      recentActivities: [],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Doctor Dashboard Statistics
// @route GET /api/dashboard/doctor
exports.getDoctorDashboard = async (req, res) => {
  try {
    if (req.isMockDb) {
      return res.status(200).json({
        success: true,
        stats: {
          todayPatients: 8,
          upcomingAppointments: 4,
          pendingReports: 2,
          completedConsultations: 24,
        },
        todaySchedule: mockDb.appointments,
      });
    }

    const todayAppointments = await Appointment.find().populate('patient', 'name patientId age gender phone').limit(5);

    res.status(200).json({
      success: true,
      stats: {
        todayPatients: todayAppointments.length,
        upcomingAppointments: 4,
        pendingReports: 2,
        completedConsultations: 24,
      },
      todaySchedule: todayAppointments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Patient Dashboard Statistics
// @route GET /api/dashboard/patient
exports.getPatientDashboard = async (req, res) => {
  try {
    if (req.isMockDb) {
      return res.status(200).json({
        success: true,
        upcomingAppointment: mockDb.appointments[0] || null,
        prescriptions: mockDb.prescriptions,
        bills: mockDb.bills,
        labReports: mockDb.labReports,
      });
    }

    res.status(200).json({
      success: true,
      upcomingAppointment: null,
      prescriptions: [],
      bills: [],
      labReports: [],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Generic Role Dashboard Statistics (Receptionist, Nurse, Lab, Pharmacist, Cashier)
exports.getGenericRoleDashboard = async (req, res) => {
  try {
    if (req.isMockDb) {
      return res.status(200).json({
        success: true,
        stats: {
          patientsCount: mockDb.patients.length,
          appointmentsCount: mockDb.appointments.length,
          labCount: mockDb.labReports.length,
          medicinesCount: mockDb.medicines.length,
          billsCount: mockDb.bills.length,
        },
        data: {
          patients: mockDb.patients,
          appointments: mockDb.appointments,
          medicines: mockDb.medicines,
          labReports: mockDb.labReports,
          bills: mockDb.bills,
        },
      });
    }

    const patientsCount = await Patient.countDocuments();
    const appointmentsCount = await Appointment.countDocuments();
    const labCount = await LabReport.countDocuments();
    const medicinesCount = await Medicine.countDocuments();
    const billsCount = await Bill.countDocuments();

    res.status(200).json({
      success: true,
      stats: {
        patientsCount,
        appointmentsCount,
        labCount,
        medicinesCount,
        billsCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
