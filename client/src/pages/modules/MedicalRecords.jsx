import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import DataTable from '../../components/DataTable';
import API from '../../services/api';

const MedicalRecords = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const res = await API.get('/medical-records');
      if (res.data.success) setRecords(res.data.records || []);
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
    { header: 'Date', accessor: 'createdAt', cell: (r) => new Date(r.createdAt).toLocaleDateString() },
    { header: 'Diagnosis', accessor: 'diagnosis' },
    { header: 'Symptoms', accessor: 'symptoms' },
    { header: 'Clinical Notes', accessor: 'notes' },
    { header: 'Vitals Recorded', accessor: 'vitals', cell: (r) => (r.vitals ? `BP: ${r.vitals.bloodPressure || 'N/A'}` : 'N/A') },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />
      <div className="flex-1 flex">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className="flex-1 lg:ml-64 p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Electronic Medical Records (EMR) History</h1>
            <p className="text-xs text-slate-500">Comprehensive patient clinical histories, diagnoses, symptoms, and vital signs history</p>
          </div>
          <DataTable title="Patient Diagnosis & Medical History Log" columns={columns} data={records} />
        </main>
      </div>
    </div>
  );
};

export default MedicalRecords;
