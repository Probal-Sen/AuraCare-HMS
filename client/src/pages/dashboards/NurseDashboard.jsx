import React, { useState, useEffect, useContext } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import StatCard from '../../components/StatCard';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import API from '../../services/api';
import { NotificationContext } from '../../context/NotificationContext';
import { HeartPulse, Activity, TestTube, CheckCircle, Plus } from 'lucide-react';

const NurseDashboard = () => {
  const { addToast } = useContext(NotificationContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const [selectedApt, setSelectedApt] = useState(null);

  const [vitals, setVitals] = useState({
    bloodPressure: '120/80 mmHg',
    heartRate: '72 bpm',
    temperature: '98.6 °F',
    weight: '70 kg',
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await API.get('/appointments');
      if (res.data.success) {
        setAppointments(res.data.appointments || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveVitals = async (e) => {
    e.preventDefault();
    try {
      const res = await API.put(`/appointments/${selectedApt._id}`, {
        vitalsRecorded: { ...vitals, recordedBy: 'Nurse Sunita Verma' },
      });
      if (res.data.success) {
        addToast('Vitals recorded successfully!', 'success');
        setIsVitalsModalOpen(false);
        fetchAppointments();
      }
    } catch (err) {
      addToast('Failed to update vitals', 'danger');
    }
  };

  const columns = [
    { header: 'Appt ID', accessor: 'appointmentId' },
    { header: 'Patient Name', accessor: 'patient', cell: (r) => r.patient?.name || 'Rahul Kumar' },
    { header: 'Doctor', accessor: 'doctor', cell: (r) => r.doctor?.name || 'Dr. Ananya Sharma' },
    { header: 'BP Vitals', accessor: 'vitalsRecorded', cell: (r) => r.vitalsRecorded?.bloodPressure || 'Pending' },
    { header: 'Heart Rate', accessor: 'vitalsRecorded', cell: (r) => r.vitalsRecorded?.heartRate || 'Pending' },
    {
      header: 'Record Vitals',
      accessor: 'action',
      cell: (r) => (
        <button
          onClick={() => {
            setSelectedApt(r);
            setIsVitalsModalOpen(true);
          }}
          className="px-2.5 py-1 rounded-lg bg-medical-600 hover:bg-medical-700 text-white font-semibold text-xs flex items-center gap-1"
        >
          <HeartPulse className="w-3.5 h-3.5" />
          <span>Vitals</span>
        </button>
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
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Nurse Ward & Vitals Management Station</h1>
            <p className="text-xs text-slate-500">Record pre-assessment vitals, manage ward beds, and organize specimen collection</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Ward Patients" value="12" icon={HeartPulse} color="blue" />
            <StatCard title="Vitals Pending" value="3" icon={Activity} color="amber" />
            <StatCard title="Specimens Collected" value="8" icon={TestTube} color="emerald" />
            <StatCard title="Tasks Completed" value="15" icon={CheckCircle} color="purple" />
          </div>

          <DataTable title="Active OPD & Ward Patient Vitals Checklist" columns={columns} data={appointments} />
        </main>
      </div>

      <Modal isOpen={isVitalsModalOpen} onClose={() => setIsVitalsModalOpen(false)} title={`Record Vitals for ${selectedApt?.patient?.name || 'Patient'}`}>
        <form onSubmit={handleSaveVitals} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Blood Pressure (mmHg)</label>
              <input
                type="text"
                required
                value={vitals.bloodPressure}
                onChange={(e) => setVitals({ ...vitals, bloodPressure: e.target.value })}
                className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Heart Rate (bpm)</label>
              <input
                type="text"
                required
                value={vitals.heartRate}
                onChange={(e) => setVitals({ ...vitals, heartRate: e.target.value })}
                className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Body Temperature (°F)</label>
              <input
                type="text"
                required
                value={vitals.temperature}
                onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
                className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Weight (kg)</label>
              <input
                type="text"
                required
                value={vitals.weight}
                onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
                className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <button type="submit" className="w-full py-2.5 rounded-xl bg-medical-600 text-white font-bold text-xs shadow-md">
            Save Patient Vitals to Chart
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default NurseDashboard;
