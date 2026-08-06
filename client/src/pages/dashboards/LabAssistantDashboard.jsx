import React, { useState, useEffect, useContext } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import StatCard from '../../components/StatCard';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import API from '../../services/api';
import { NotificationContext } from '../../context/NotificationContext';
import { TestTube, Upload, FileText, CheckCircle, Clock } from 'lucide-react';

const LabAssistantDashboard = () => {
  const { addToast } = useContext(NotificationContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [reports, setReports] = useState([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const [summary, setSummary] = useState('');
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchLabReports();
    const interval = setInterval(fetchLabReports, 8000);
    const handleSync = () => fetchLabReports();
    window.addEventListener('auracare_data_updated', handleSync);
    return () => {
      clearInterval(interval);
      window.removeEventListener('auracare_data_updated', handleSync);
    };
  }, []);

  const fetchLabReports = async () => {
    try {
      const res = await API.get('/lab/reports');
      if (res.data.success) {
        setReports(res.data.reports || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadResult = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('resultSummary', summary);
      if (file) formData.append('reportFile', file);

      const res = await API.put(`/lab/reports/${selectedReport._id}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        addToast('Lab report / imaging scan uploaded successfully!', 'success');
        setIsUploadModalOpen(false);
        fetchLabReports();
      }
    } catch (err) {
      addToast('Upload failed', 'danger');
    }
  };

  const columns = [
    { header: 'Report ID', accessor: 'reportId' },
    { header: 'Patient Name', accessor: 'patient', cell: (r) => r.patient?.name || 'Rahul Kumar' },
    { header: 'Test Name', accessor: 'testName' },
    { header: 'Category', accessor: 'testCategory' },
    { header: 'Cost (₹)', accessor: 'cost', cell: (r) => `₹${r.cost}` },
    {
      header: 'Status',
      accessor: 'status',
      cell: (r) => (
        <span className={`px-2 py-0.5 rounded-full font-bold text-xs ${r.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
          {r.status}
        </span>
      ),
    },
    {
      header: 'Upload Scan / PDF',
      accessor: 'action',
      cell: (r) => (
        <button
          onClick={() => {
            setSelectedReport(r);
            setIsUploadModalOpen(true);
          }}
          className="px-2.5 py-1 rounded-lg bg-medical-600 hover:bg-medical-700 text-white font-semibold text-xs flex items-center gap-1"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload File</span>
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
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Laboratory & Radiology Diagnostics Desk</h1>
            <p className="text-xs text-slate-500">Manage pending pathology, blood tests, X-rays, MRI, and CT scan report uploads</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Pending Lab Orders" value={reports.filter((r) => r.status === 'Pending').length || 2} icon={Clock} color="amber" />
            <StatCard title="Completed Diagnostics" value={reports.filter((r) => r.status === 'Completed').length || 5} icon={CheckCircle} color="emerald" />
            <StatCard title="X-Ray / MRI Scans" value="4" icon={FileText} color="blue" />
            <StatCard title="Pathology Samples" value="9" icon={TestTube} color="purple" />
          </div>

          <DataTable title="Diagnostic Orders Queue & Upload Management" columns={columns} data={reports} />
        </main>
      </div>

      <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title={`Upload Test Results for ${selectedReport?.testName}`}>
        <form onSubmit={handleUploadResult} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Diagnostic Summary / Radiologist Findings</label>
            <textarea
              required
              rows="3"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              placeholder="Enter lab test findings, blood counts, or radiological observation..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Upload Report PDF / Scan Attachment (X-Ray, MRI, CT)</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-medical-50 file:text-medical-700 hover:file:bg-medical-100"
            />
          </div>

          <button type="submit" className="w-full py-2.5 rounded-xl bg-medical-600 text-white font-bold text-xs shadow-md">
            Complete & Publish Diagnostic Report
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default LabAssistantDashboard;
