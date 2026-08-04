import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import StatCard from '../../components/StatCard';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import API from '../../services/api';
import { Users, Calendar, Plus, UserPlus, Search, Building2, CheckCircle } from 'lucide-react';

const ReceptionistDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [patients, setPatients] = useState([]);
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [patientForm, setPatientForm] = useState({
    name: '',
    age: '35',
    gender: 'Male',
    bloodGroup: 'O+',
    phone: '',
    admissionType: 'OPD',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await API.get('/patients');
      if (res.data.success) {
        setPatients(res.data.patients || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegisterPatient = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/patients', patientForm);
      if (res.data.success) {
        setIsAddPatientOpen(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
    { header: 'Patient ID', accessor: 'patientId' },
    { header: 'Name', accessor: 'name' },
    { header: 'Age/Gender', accessor: 'age', cell: (r) => `${r.age} yrs / ${r.gender}` },
    { header: 'Blood Group', accessor: 'bloodGroup' },
    { header: 'Phone', accessor: 'phone' },
    {
      header: 'Admission Status',
      accessor: 'admissionType',
      cell: (r) => (
        <span className={`px-2.5 py-0.5 rounded-full font-bold text-xs ${r.admissionType === 'IPD' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
          {r.admissionType}
        </span>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />

      <div className="flex-1 flex">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main className="flex-1 lg:ml-64 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Reception & OPD/IPD Admissions Desk</h1>
              <p className="text-xs text-slate-500">Patient check-in, appointment scheduling, and bed assignment control</p>
            </div>
            <button
              onClick={() => setIsAddPatientOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-medical-600 hover:bg-medical-700 text-white font-bold text-xs shadow-md flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register Walk-in Patient</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Today's OPD Admissions" value="18" icon={Users} color="blue" />
            <StatCard title="IPD Ward Admissions" value="4" icon={Building2} color="emerald" />
            <StatCard title="Appointments Booked" value="28" icon={Calendar} color="purple" />
            <StatCard title="Doctors Available" value="6" icon={CheckCircle} color="amber" />
          </div>

          <DataTable title="Hospital Patient Directory" columns={columns} data={patients} />
        </main>
      </div>

      <Modal isOpen={isAddPatientOpen} onClose={() => setIsAddPatientOpen(false)} title="Register Walk-in OPD/IPD Patient">
        <form onSubmit={handleRegisterPatient} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Full Patient Name</label>
            <input
              type="text"
              required
              value={patientForm.name}
              onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })}
              className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Age</label>
              <input
                type="number"
                value={patientForm.age}
                onChange={(e) => setPatientForm({ ...patientForm, age: e.target.value })}
                className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Gender</label>
              <select
                value={patientForm.gender}
                onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })}
                className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Blood Group</label>
              <select
                value={patientForm.bloodGroup}
                onChange={(e) => setPatientForm({ ...patientForm, bloodGroup: e.target.value })}
                className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <option>A+</option>
                <option>B+</option>
                <option>O+</option>
                <option>AB+</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Phone Number</label>
            <input
              type="text"
              required
              value={patientForm.phone}
              onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
              className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Admission Type</label>
            <select
              value={patientForm.admissionType}
              onChange={(e) => setPatientForm({ ...patientForm, admissionType: e.target.value })}
              className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              <option value="OPD">OPD Checkup</option>
              <option value="IPD">IPD Ward Admission</option>
              <option value="Emergency">Emergency Room</option>
            </select>
          </div>

          <button type="submit" className="w-full py-2.5 rounded-xl bg-medical-600 text-white font-bold text-xs shadow-md">
            Register & Assign Patient ID
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default ReceptionistDashboard;
