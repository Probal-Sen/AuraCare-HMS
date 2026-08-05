const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Department = require('../models/Department');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const Prescription = require('../models/Prescription');
const Medicine = require('../models/Medicine');
const LabReport = require('../models/LabReport');
const Bill = require('../models/Bill');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');

// Pre-generated Demo Data Set
const demoDepartments = [
  { _id: '66a100000000000000000001', name: 'Cardiology', code: 'CARD', description: 'Heart & Cardiovascular Care', headDoctor: 'Dr. Ananya Sharma', status: 'Active' },
  { _id: '66a100000000000000000002', name: 'Neurology', code: 'NEUR', description: 'Brain & Nervous System', headDoctor: 'Dr. Rajesh Gupta', status: 'Active' },
  { _id: '66a100000000000000000003', name: 'Pediatrics', code: 'PED', description: 'Child Health & Care', headDoctor: 'Dr. Meera Reddy', status: 'Active' },
  { _id: '66a100000000000000000004', name: 'Orthopedics', code: 'ORTH', description: 'Bones & Joint Care', headDoctor: 'Dr. Suresh Iyer', status: 'Active' },
  { _id: '66a100000000000000000005', name: 'General Medicine', code: 'GEN', description: 'Internal & Preventive Care', headDoctor: 'Dr. Vikram Malhotra', status: 'Active' },
];

const demoUsers = [
  {
    _id: '660100000000000000000001',
    name: 'Rajesh Sharma (Admin)',
    email: 'admin@auracare.com',
    password: 'Password123!',
    role: 'Admin',
    phone: '+91 98765 43210',
    status: 'Active',
  },
  {
    _id: '660100000000000000000002',
    name: 'Dr. Ananya Sharma',
    email: 'doctor@auracare.com',
    password: 'Password123!',
    role: 'Doctor',
    phone: '+91 98765 43211',
    status: 'Active',
  },
  {
    _id: '660100000000000000000003',
    name: 'Priya Patel',
    email: 'receptionist@auracare.com',
    password: 'Password123!',
    role: 'Receptionist',
    phone: '+91 98765 43212',
    status: 'Active',
  },
  {
    _id: '660100000000000000000004',
    name: 'Nurse Sunita Verma',
    email: 'nurse@auracare.com',
    password: 'Password123!',
    role: 'Nurse',
    phone: '+91 98765 43213',
    status: 'Active',
  },
  {
    _id: '660100000000000000000005',
    name: 'Ramesh Kumar',
    email: 'lab@auracare.com',
    password: 'Password123!',
    role: 'Lab Assistant',
    phone: '+91 98765 43214',
    status: 'Active',
  },
  {
    _id: '660100000000000000000006',
    name: 'Vikram Singh',
    email: 'pharmacist@auracare.com',
    password: 'Password123!',
    role: 'Pharmacist',
    phone: '+91 98765 43215',
    status: 'Active',
  },
  {
    _id: '660100000000000000000007',
    name: 'Amit Joshi',
    email: 'cashier@auracare.com',
    password: 'Password123!',
    role: 'Cashier',
    phone: '+91 98765 43216',
    status: 'Active',
  },
  {
    _id: '660100000000000000000008',
    name: 'Rahul Kumar',
    email: 'patient@auracare.com',
    password: 'Password123!',
    role: 'Patient',
    phone: '+91 98765 43217',
    status: 'Active',
  },
];

const demoDoctors = [
  {
    _id: '660d00000000000000000001',
    userId: '660100000000000000000002',
    doctorId: 'DOC-1001',
    name: 'Dr. Ananya Sharma',
    specialization: 'Cardiology Specialist',
    department: '66a100000000000000000001',
    qualification: 'MD, DM (Cardiology)',
    experienceYears: 12,
    consultationFee: 800,
    roomNumber: 'Cardio Suite 201',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    availableSlots: ['09:00 AM', '10:30 AM', '02:00 PM', '04:00 PM'],
    status: 'Available',
  },
  {
    _id: '660d00000000000000000002',
    userId: '660100000000000000000002',
    doctorId: 'DOC-1002',
    name: 'Dr. Rajesh Gupta',
    specialization: 'Neurosurgeon',
    department: '66a100000000000000000002',
    qualification: 'MS, MCh (Neurosurgery)',
    experienceYears: 15,
    consultationFee: 1200,
    roomNumber: 'Neuro Suite 305',
    availableDays: ['Monday', 'Wednesday', 'Friday'],
    availableSlots: ['10:00 AM', '01:00 PM', '03:30 PM'],
    status: 'Available',
  },
];

const demoPatients = [
  {
    _id: '660e00000000000000000001',
    userId: '660100000000000000000008',
    patientId: 'PAT-8001',
    name: 'Rahul Kumar',
    age: 38,
    gender: 'Male',
    bloodGroup: 'O+',
    phone: '+91 98765 43217',
    email: 'patient@arogyahms.com',
    address: '742 M.G. Road, Indiranagar, Bengaluru, Karnataka',
    emergencyContact: { name: 'Sunita Kumar', relationship: 'Spouse', phone: '+91 98765 99880' },
    admissionType: 'OPD',
    roomNumber: 'N/A',
    assignedDoctor: '660d00000000000000000001',
    allergies: ['Penicillin', 'Peanuts'],
    medicalHistoryNotes: 'Mild Hypertension diagnosed in 2023. Regular checkups.',
  },
  {
    _id: '660e00000000000000000002',
    patientId: 'PAT-8002',
    name: 'Priya Sharma',
    age: 29,
    gender: 'Female',
    bloodGroup: 'A+',
    phone: '+91 98765 02100',
    email: 'priya.sharma@example.com',
    address: '456 Park Street, Connaught Place, New Delhi',
    emergencyContact: { name: 'Rohan Sharma', relationship: 'Brother', phone: '+91 98765 77110' },
    admissionType: 'IPD',
    roomNumber: 'Room 204-B',
    assignedDoctor: '660d00000000000000000001',
    allergies: ['Sulfa drugs'],
    medicalHistoryNotes: 'Post-operative recovery after appendectomy.',
  },
];

const demoAppointments = [
  {
    _id: '660a00000000000000000001',
    appointmentId: 'APT-9001',
    patient: '660e00000000000000000001',
    doctor: '660d00000000000000000001',
    department: '66a100000000000000000001',
    date: '2026-08-05',
    timeSlot: '09:00 AM',
    type: 'OPD',
    status: 'Scheduled',
    reason: 'Routine Cardiac Follow-up & BP Check',
    vitalsRecorded: {
      bloodPressure: '120/80 mmHg',
      heartRate: '72 bpm',
      temperature: '98.6 °F',
      weight: '75 kg',
      recordedBy: 'Nurse Sunita Verma',
    },
  },
  {
    _id: '660a00000000000000000002',
    appointmentId: 'APT-9002',
    patient: '660e00000000000000000002',
    doctor: '660d00000000000000000002',
    department: '66a100000000000000000002',
    date: '2026-08-06',
    timeSlot: '11:00 AM',
    type: 'IPD',
    status: 'Scheduled',
    reason: 'Post-Op Neurological Review',
    vitalsRecorded: {
      bloodPressure: '115/75 mmHg',
      heartRate: '68 bpm',
      temperature: '98.4 °F',
      weight: '62 kg',
      recordedBy: 'Nurse Sunita Verma',
    },
  },
];

const demoMedicines = [
  {
    _id: '660c00000000000000000001',
    code: 'MED-101',
    name: 'Amoxicillin 500mg',
    category: 'Antibiotic',
    dosageForm: 'Capsule',
    manufacturer: 'Cipla Healthcare',
    unitPrice: 125.0,
    stockQuantity: 450,
    minStockAlert: 50,
    expiryDate: new Date('2027-12-31'),
    locationRack: 'Rack A-04',
  },
  {
    _id: '660c00000000000000000002',
    code: 'MED-102',
    name: 'Atorvastatin 20mg',
    category: 'Cardiovascular',
    dosageForm: 'Tablet',
    manufacturer: 'Sun Pharma',
    unitPrice: 180.0,
    stockQuantity: 18, // Low stock!
    minStockAlert: 30,
    expiryDate: new Date('2026-09-15'), // Expiring soon!
    locationRack: 'Rack B-12',
  },
  {
    _id: '660c00000000000000000003',
    code: 'MED-103',
    name: 'Paracetamol 650mg (Dolo 650)',
    category: 'Analgesic',
    dosageForm: 'Tablet',
    manufacturer: 'Micro Labs',
    unitPrice: 35.0,
    stockQuantity: 800,
    minStockAlert: 100,
    expiryDate: new Date('2028-06-30'),
    locationRack: 'Rack C-01',
  },
];

const demoLabReports = [
  {
    _id: '660f00000000000000000001',
    reportId: 'LAB-5001',
    patient: '660e00000000000000000001',
    doctor: '660d00000000000000000001',
    testName: 'Complete Lipid Profile & ECG',
    testCategory: 'Blood Test',
    cost: 850,
    status: 'Completed',
    resultSummary: 'Total Cholesterol: 185 mg/dL (Normal). ECG shows normal sinus rhythm.',
    fileUrl: '/uploads/reports/sample_lipid_report.pdf',
    fileType: 'PDF',
    uploadedBy: 'Ramesh Kumar (Lab Assistant)',
    createdAt: new Date('2026-08-04'),
  },
  {
    _id: '660f00000000000000000002',
    reportId: 'LAB-5002',
    patient: '660e00000000000000000002',
    doctor: '660d00000000000000000002',
    testName: 'Brain MRI Scan (Contrast)',
    testCategory: 'MRI',
    cost: 3500,
    status: 'Pending',
    resultSummary: 'Awaiting radiologist review and image compilation.',
    fileUrl: '',
    fileType: 'None',
    uploadedBy: 'Ramesh Kumar',
    createdAt: new Date('2026-08-04'),
  },
];

const demoPrescriptions = [
  {
    _id: '660b00000000000000000001',
    prescriptionId: 'RX-7001',
    patient: '660e00000000000000000001',
    doctor: '660d00000000000000000001',
    appointment: '660a00000000000000000001',
    medicines: [
      { medicineName: 'Atorvastatin 20mg', dosage: '20mg', frequency: '0-0-1', duration: '30 Days', instructions: 'Take at bedtime' },
      { medicineName: 'Dolo 650mg', dosage: '650mg', frequency: '1-0-1', duration: '5 Days', instructions: 'As needed for discomfort' },
    ],
    diagnosisNotes: 'Stage 1 Hypertension & mild Hyperlipidemia.',
    status: 'Pending',
  },
];

const demoBills = [
  {
    _id: '660000000000000000000001',
    invoiceNumber: 'INV-2026-001',
    patient: '660e00000000000000000001',
    appointment: '660a00000000000000000001',
    items: [
      { description: 'Cardiology Specialist Consultation Fee', category: 'Consultation', quantity: 1, unitPrice: 800, amount: 800 },
      { description: 'Complete Lipid Profile & ECG Test', category: 'Lab', quantity: 1, unitPrice: 850, amount: 850 },
      { description: 'Atorvastatin 20mg (30 Tablets)', category: 'Pharmacy', quantity: 1, unitPrice: 180, amount: 180 },
    ],
    subtotal: 1830,
    discountPercent: 10,
    insuranceDiscount: 183,
    taxAmount: 0,
    totalAmount: 1647,
    paidAmount: 1647,
    paymentStatus: 'Paid',
    paymentMethod: 'Credit Card',
    notes: 'Covered partly under Star Health Insurance.',
    fileUrl: '/uploads/invoices/sample_patient_invoice.pdf',
    createdAt: new Date(),
  },
];

const demoNotifications = [
  {
    _id: '660400000000000000000001',
    userRole: 'All',
    title: 'Welcome to AuraCare',
    message: 'System upgrade completed. All 8 role dashboards are live.',
    type: 'info',
    isRead: false,
    createdAt: new Date(),
  },
  {
    _id: '660400000000000000000002',
    userRole: 'Pharmacist',
    title: 'Low Stock Alert',
    message: 'Atorvastatin 20mg quantity is down to 18 units (Minimum: 30).',
    type: 'warning',
    isRead: false,
    createdAt: new Date(),
  },
];

const demoActivityLogs = [
  {
    _id: '660500000000000000000001',
    userName: 'Rajesh Sharma (Admin)',
    userRole: 'Admin',
    userEmail: 'admin@arogyahms.com',
    action: 'SYSTEM_INITIALIZATION',
    details: 'Database seeded with Indian demo records for all 8 roles.',
    ipAddress: '127.0.0.1',
    createdAt: new Date(),
  },
];

// In-Memory Global Mock Cache for Fallback
const mockDb = {
  users: [...demoUsers],
  patients: [...demoPatients],
  doctors: [...demoDoctors],
  departments: [...demoDepartments],
  appointments: [...demoAppointments],
  medicines: [...demoMedicines],
  labReports: [...demoLabReports],
  prescriptions: [...demoPrescriptions],
  bills: [...demoBills],
  notifications: [...demoNotifications],
  activityLogs: [...demoActivityLogs],
};

const autoSeedIfEmpty = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Auto-Seed]: MongoDB is empty. Seeding initial 8 demo role accounts & default hospital data...');
      const hashedUsers = await Promise.all(
        demoUsers.map(async (u) => {
          const salt = await bcrypt.genSalt(10);
          const passwordHash = await bcrypt.hash(u.password, salt);
          return { ...u, password: passwordHash };
        })
      );

      await User.insertMany(hashedUsers);
      await Department.insertMany(demoDepartments);
      await Doctor.insertMany(demoDoctors);
      await Patient.insertMany(demoPatients);
      await Appointment.insertMany(demoAppointments);
      await Medicine.insertMany(demoMedicines);
      await LabReport.insertMany(demoLabReports);
      await Prescription.insertMany(demoPrescriptions);
      await Bill.insertMany(demoBills);
      await Notification.insertMany(demoNotifications);
      await ActivityLog.insertMany(demoActivityLogs);
      console.log('[Auto-Seed]: MongoDB auto-seeding completed successfully! All 8 demo accounts created.');
    } else {
      console.log(`[MongoDB Ready]: Database connected with ${userCount} existing user accounts.`);
      const billCount = await Bill.countDocuments();
      if (billCount === 0) {
        await Bill.insertMany(demoBills);
        console.log('[Auto-Seed]: Seeded default patient bills into MongoDB.');
      }
    }
  } catch (err) {
    console.warn(`[Auto-Seed Warning]: Auto-seeding skipped: ${err.message}`);
  }
};

const seedDatabase = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/arogya_hms');
    console.log(`Connected to MongoDB: ${conn.connection.host}`);

    // Clear collections
    await User.deleteMany({});
    await Patient.deleteMany({});
    await Doctor.deleteMany({});
    await Department.deleteMany({});
    await Appointment.deleteMany({});
    await Medicine.deleteMany({});
    await LabReport.deleteMany({});
    await Prescription.deleteMany({});
    await Bill.deleteMany({});
    await Notification.deleteMany({});
    await ActivityLog.deleteMany({});

    // Hash passwords and save users
    const hashedUsers = await Promise.all(
      demoUsers.map(async (u) => {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(u.password, salt);
        return { ...u, password: passwordHash };
      })
    );

    await User.insertMany(hashedUsers);
    await Department.insertMany(demoDepartments);
    await Doctor.insertMany(demoDoctors);
    await Patient.insertMany(demoPatients);
    await Appointment.insertMany(demoAppointments);
    await Medicine.insertMany(demoMedicines);
    await LabReport.insertMany(demoLabReports);
    await Prescription.insertMany(demoPrescriptions);
    await Bill.insertMany(demoBills);
    await Notification.insertMany(demoNotifications);
    await ActivityLog.insertMany(demoActivityLogs);

    console.log('Database successfully seeded with production demo data!');
    process.exit();
  } catch (error) {
    console.error(`Seeding error: ${error.message}`);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = { mockDb, seedDatabase, autoSeedIfEmpty };
