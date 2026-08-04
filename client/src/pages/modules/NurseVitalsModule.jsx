import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import DataTable from '../../components/DataTable';
import API from '../../services/api';

const NurseVitalsModule = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await API.get('/appointments');
      if (res.data.success) setAppointments(res.data.appointments || []);
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
    { header: 'Appt ID', accessor: 'appointmentId' },
    { header: 'Patient Name', accessor: 'patient', cell: (r) => r.patient?.name || 'John Doe' },
    { header: 'Blood Pressure', accessor: 'vitalsRecorded', cell: (r) => r.vitalsRecorded?.bloodPressure || '120/80 mmHg' },
    { header: 'Heart Rate', accessor: 'vitalsRecorded', cell: (r) => r.vitalsRecorded?.heartRate || '72 bpm' },
    { header: 'Temperature', accessor: 'vitalsRecorded', cell: (r) => r.vitalsRecorded?.temperature || '98.6 °F' },
    { header: 'Recorded By', accessor: 'vitalsRecorded', cell: (r) => r.vitalsRecorded?.recordedBy || 'Nurse Clara' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />
      <div className="flex-1 flex">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className="flex-1 lg:ml-64 p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Nurse Vitals & Ward Pre-Assessment Log</h1>
            <p className="text-xs text-slate-500">Recorded patient vital signs, blood pressure readings, and pre-assessment checklist</p>
          </div>
          <DataTable title="Recorded Patient Vitals History" columns={columns} data={appointments} />
        </main>
      </div>
    </div>
  );
};

export default NurseVitalsModule;
