import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import DataTable from '../../components/DataTable';
import API, { downloadPdfBlob } from '../../services/api';
import { Download } from 'lucide-react';

const PrescriptionModule = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [prescriptions, setPrescriptions] = useState([]);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const res = await API.get('/prescriptions');
      if (res.data.success) setPrescriptions(res.data.prescriptions || []);
    } catch (err) {
      console.error(err);
    }
  };

  const downloadPdf = (rxId, rxNum) => {
    downloadPdfBlob(`/prescriptions/${rxId}/pdf`, `Prescription_${rxNum || 'RX-001'}.pdf`);
  };

  const columns = [
    { header: 'Rx ID', accessor: 'prescriptionId' },
    { header: 'Patient Name', accessor: 'patient', cell: (r) => r.patient?.name || 'John Doe' },
    { header: 'Doctor', accessor: 'doctor', cell: (r) => r.doctor?.name || 'Dr. Sarah' },
    { header: 'Diagnosis Notes', accessor: 'diagnosisNotes' },
    { header: 'Status', accessor: 'status' },
    {
      header: 'Actions',
      accessor: 'action',
      cell: (r) => (
        <button
          onClick={() => downloadPdf(r._id, r.prescriptionId)}
          className="px-2.5 py-1 rounded-lg bg-medical-600 hover:bg-medical-700 text-white font-semibold text-xs flex items-center gap-1"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download PDF</span>
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
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Medical Prescriptions & Medication Orders</h1>
            <p className="text-xs text-slate-500">Issued doctor prescriptions, pharmacy dispensing status, and downloadable PDF Rx documents</p>
          </div>
          <DataTable title="All Issued Prescriptions" columns={columns} data={prescriptions} />
        </main>
      </div>
    </div>
  );
};

export default PrescriptionModule;
