import React, { useState, useEffect, useContext } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import StatCard from '../../components/StatCard';
import DataTable from '../../components/DataTable';
import { AuthContext } from '../../context/AuthContext';
import API, { downloadPdfBlob } from '../../services/api';
import { Calendar, Pill, FileText, CreditCard, Download, Activity, Heart, Clock } from 'lucide-react';

const PatientDashboard = () => {
  const { user } = useContext(AuthContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetchPatientData();
  }, []);

  const fetchPatientData = async () => {
    try {
      const res = await API.get('/dashboard/patient');
      if (res.data.success) {
        setDashboardData(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const downloadPdf = (endpoint, filename) => {
    downloadPdfBlob(`/${endpoint}`, filename);
  };

  const rxColumns = [
    { header: 'Rx ID', accessor: 'prescriptionId' },
    { header: 'Doctor', accessor: 'doctor', cell: (r) => r.doctor?.name || 'Dr. Ananya Sharma' },
    { header: 'Diagnosis Notes', accessor: 'diagnosisNotes' },
    { header: 'Status', accessor: 'status' },
    {
      header: 'Download PDF',
      accessor: 'action',
      cell: (r) => (
        <button
          onClick={() => downloadPdf(`prescriptions/${r._id}/pdf`, `Prescription_${r.prescriptionId}.pdf`)}
          className="px-2.5 py-1 rounded-lg bg-medical-600 hover:bg-medical-700 text-white font-semibold text-xs flex items-center gap-1"
        >
          <Download className="w-3.5 h-3.5" />
          <span>PDF Rx</span>
        </button>
      ),
    },
  ];

  const billColumns = [
    { header: 'Invoice #', accessor: 'invoiceNumber' },
    { header: 'Total Amount', accessor: 'totalAmount', cell: (r) => `₹${r.totalAmount?.toFixed(2)}` },
    { header: 'Status', accessor: 'paymentStatus' },
    {
      header: 'Receipt PDF',
      accessor: 'action',
      cell: (r) => (
        <button
          onClick={() => downloadPdf(`bills/${r._id}/pdf`, `Invoice_${r.invoiceNumber}.pdf`)}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs flex items-center gap-1"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Invoice PDF</span>
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
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Patient Personal Health Portal</h1>
            <p className="text-xs text-slate-500">Welcome, {user?.name}. Access your health records, prescriptions, and invoice receipts.</p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Upcoming Appointment" value="Aug 5, 09:00 AM" icon={Calendar} color="blue" />
            <StatCard title="Active Prescriptions" value={dashboardData?.prescriptions?.length || 1} icon={Pill} color="emerald" />
            <StatCard title="Lab Reports Ready" value={dashboardData?.labReports?.length || 1} icon={Activity} color="purple" />
            <StatCard title="Unpaid Invoices" value="₹0.00" icon={CreditCard} color="amber" />
          </div>

          {/* Tables */}
          <div className="space-y-6">
            <DataTable title="My Medical Prescriptions & Medication Orders" columns={rxColumns} data={dashboardData?.prescriptions || []} />
            <DataTable title="My Billing History & Downloadable Receipts" columns={billColumns} data={dashboardData?.bills || []} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default PatientDashboard;
