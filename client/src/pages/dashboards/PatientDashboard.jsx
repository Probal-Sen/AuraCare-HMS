import React, { useState, useEffect, useContext } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import StatCard from '../../components/StatCard';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import VitalsAnalyticalChart from '../../components/VitalsAnalyticalChart';
import { AuthContext } from '../../context/AuthContext';
import { NotificationContext } from '../../context/NotificationContext';
import API, { downloadPdfBlob } from '../../services/api';
import { Calendar, Pill, FileText, CreditCard, Download, Upload, Activity, Heart, Clock, FileCheck } from 'lucide-react';

const PatientDashboard = () => {
  const { user } = useContext(AuthContext);
  const { addToast } = useContext(NotificationContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedBillId, setSelectedBillId] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPatientData();
    const interval = setInterval(fetchPatientData, 8000);
    const handleSync = () => fetchPatientData();
    window.addEventListener('auracare_data_updated', handleSync);
    return () => {
      clearInterval(interval);
      window.removeEventListener('auracare_data_updated', handleSync);
    };
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

  const handleUploadInvoice = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      addToast('Please select an invoice file to upload', 'warning');
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('invoiceFile', selectedFile);

      const billId = selectedBillId || (dashboardData?.bills?.[0]?._id || 'sample');
      const res = await API.post(`/bills/${billId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        addToast('Sample patient invoice uploaded successfully!', 'success');
        setIsUploadModalOpen(false);
        setSelectedFile(null);
        fetchPatientData();
      }
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || 'Invoice upload failed', 'danger');
    } finally {
      setIsSubmitting(false);
    }
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
      header: 'Invoice Actions',
      accessor: 'action',
      cell: (r) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadPdf(`bills/${r._id || r.invoiceNumber}/pdf`, `Invoice_${r.invoiceNumber}.pdf`)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs flex items-center gap-1 shadow-sm"
            title="Download PDF Invoice Receipt"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Invoice</span>
          </button>

          <button
            onClick={() => {
              setSelectedBillId(r._id || r.id);
              setIsUploadModalOpen(true);
            }}
            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1 shadow-sm"
            title="Upload Sample / Insurance Invoice File"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Invoice</span>
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Patient Personal Health Portal</h1>
              <p className="text-xs text-slate-500">Welcome, {user?.name}. Access your health records, prescriptions, and invoice receipts.</p>
            </div>
            <button
              onClick={() => {
                setSelectedBillId(dashboardData?.bills?.[0]?._id || '');
                setIsUploadModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-medical-600 hover:bg-medical-700 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Sample Invoice</span>
            </button>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Upcoming Appointment" value="Aug 5, 09:00 AM" icon={Calendar} color="blue" />
            <StatCard title="Active Prescriptions" value={dashboardData?.prescriptions?.length || 1} icon={Pill} color="emerald" />
            <StatCard title="Lab Reports Ready" value={dashboardData?.labReports?.length || 1} icon={Activity} color="purple" />
            <StatCard title="Unpaid Invoices" value="₹0.00" icon={CreditCard} color="amber" />
          </div>

          {/* Vitals Analytical Chart recorded by Nurse */}
          <VitalsAnalyticalChart vitalsData={dashboardData?.vitalsHistory} />

          {/* Tables */}
          <div className="space-y-6">
            <DataTable title="My Medical Prescriptions & Medication Orders" columns={rxColumns} data={dashboardData?.prescriptions || []} />
            <DataTable title="My Billing History & Downloadable Receipts" columns={billColumns} data={dashboardData?.bills || []} />
          </div>
        </main>
      </div>

      {/* Upload Sample Invoice Modal */}
      <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Upload Patient Invoice Document">
        <form onSubmit={handleUploadInvoice} className="space-y-4">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200 text-xs">
            <p className="font-semibold mb-1 flex items-center gap-1">
              <FileCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Upload Sample / Insurance Invoice
            </p>
            <p>Upload a custom invoice file (PDF, PNG, JPG, or DOCX up to 10MB) to attach to your patient account billing records.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">Select Patient Bill / Invoice Number</label>
            <select
              value={selectedBillId}
              onChange={(e) => setSelectedBillId(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="">-- Select Invoice (Default: INV-2026-001) --</option>
              {dashboardData?.bills?.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.invoiceNumber} - ₹{b.totalAmount?.toFixed(2)} ({b.paymentStatus})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">Choose Invoice File (PDF / Image)</label>
            <input
              type="file"
              required
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-medical-600 file:text-white hover:file:bg-medical-700"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl bg-medical-600 hover:bg-medical-700 text-white font-bold text-xs shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>{isSubmitting ? 'Uploading Document...' : 'Submit & Save Invoice File'}</span>
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default PatientDashboard;
