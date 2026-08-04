import React, { useState, useEffect, useContext } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import StatCard from '../../components/StatCard';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import { AuthContext } from '../../context/AuthContext';
import { NotificationContext } from '../../context/NotificationContext';
import API from '../../services/api';
import { Users, Calendar, FileText, Stethoscope, Plus, Pill, TestTube, CheckCircle } from 'lucide-react';

const DoctorDashboard = () => {
  const { user } = useContext(AuthContext);
  const { addToast } = useContext(NotificationContext);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [isRxModalOpen, setIsRxModalOpen] = useState(false);
  const [selectedApt, setSelectedApt] = useState(null);

  // Prescription Form State
  const [rxData, setRxData] = useState({
    medicineName: 'Amoxicillin 500mg',
    dosage: '500mg',
    frequency: '1-0-1',
    duration: '5 Days',
    instructions: 'Take after meals with warm water',
    diagnosisNotes: 'Acute Respiratory Tract Infection',
  });

  useEffect(() => {
    fetchDoctorData();
  }, []);

  const fetchDoctorData = async () => {
    try {
      const res = await API.get('/appointments');
      if (res.data.success) {
        setAppointments(res.data.appointments || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/prescriptions', {
        patientId: selectedApt?.patient?._id || selectedApt?.patient,
        doctorId: user?.id,
        appointmentId: selectedApt?._id,
        medicines: [
          {
            medicineName: rxData.medicineName,
            dosage: rxData.dosage,
            frequency: rxData.frequency,
            duration: rxData.duration,
            instructions: rxData.instructions,
          },
        ],
        diagnosisNotes: rxData.diagnosisNotes,
      });

      if (res.data.success) {
        addToast('Prescription issued successfully!', 'success');
        setIsRxModalOpen(false);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to issue prescription', 'danger');
    }
  };

  const columns = [
    { header: 'Appt ID', accessor: 'appointmentId' },
    {
      header: 'Patient Name',
      accessor: 'patientName',
      cell: (row) => row.patient?.name || row.patientName || 'Rahul Kumar',
    },
    { header: 'Time Slot', accessor: 'timeSlot' },
    { header: 'Type', accessor: 'type' },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => (
        <span className="px-2.5 py-0.5 rounded-full bg-medical-100 dark:bg-medical-950 text-medical-700 dark:text-medical-300 font-semibold text-xs">
          {row.status}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedApt(row);
              setIsRxModalOpen(true);
            }}
            className="px-2.5 py-1 rounded-lg bg-medical-600 hover:bg-medical-700 text-white font-semibold text-xs flex items-center gap-1"
          >
            <Pill className="w-3.5 h-3.5" />
            <span>Write Rx</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />

      <div className="flex-1 flex">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main className="flex-1 lg:ml-64 p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Doctor Clinical Suite</h1>
            <p className="text-xs text-slate-500">Welcome back, {user?.name}. Manage consultations, diagnosis, and digital prescriptions.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Today's Patients" value={appointments.length || 8} icon={Users} color="blue" />
            <StatCard title="Upcoming Appointments" value="5" icon={Calendar} color="emerald" />
            <StatCard title="Pending Lab Reports" value="2" icon={TestTube} color="amber" />
            <StatCard title="Consultations Done" value="24" icon={CheckCircle} color="purple" />
          </div>

          <DataTable title="Today's Appointment Queue & OPD Consultations" columns={columns} data={appointments} />
        </main>
      </div>

      {/* Prescription Issue Modal */}
      <Modal isOpen={isRxModalOpen} onClose={() => setIsRxModalOpen(false)} title={`Write Prescription for ${selectedApt?.patient?.name || 'Patient'}`}>
        <form onSubmit={handleCreatePrescription} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Diagnosis & Clinical Notes</label>
            <textarea
              required
              rows="2"
              value={rxData.diagnosisNotes}
              onChange={(e) => setRxData({ ...rxData, diagnosisNotes: e.target.value })}
              className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Medicine Name</label>
              <input
                type="text"
                required
                value={rxData.medicineName}
                onChange={(e) => setRxData({ ...rxData, medicineName: e.target.value })}
                className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Dosage</label>
              <input
                type="text"
                required
                value={rxData.dosage}
                onChange={(e) => setRxData({ ...rxData, dosage: e.target.value })}
                className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Frequency (e.g. 1-0-1)</label>
              <input
                type="text"
                required
                value={rxData.frequency}
                onChange={(e) => setRxData({ ...rxData, frequency: e.target.value })}
                className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Duration</label>
              <input
                type="text"
                required
                value={rxData.duration}
                onChange={(e) => setRxData({ ...rxData, duration: e.target.value })}
                className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <button type="submit" className="w-full py-2.5 rounded-xl bg-medical-600 text-white font-bold text-xs shadow-md">
            Issue Digital Prescription & Sign
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default DoctorDashboard;
