import React, { useState, useEffect, useContext } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import API from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { NotificationContext } from '../../context/NotificationContext';
import { Plus, Edit3, Trash2 } from 'lucide-react';

const LabManagement = () => {
  const { user } = useContext(AuthContext);
  const { addToast } = useContext(NotificationContext);
  const isPatientRole = user?.role === 'Patient';

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [reports, setReports] = useState([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingReport, setEditingReport] = useState(null);

  const [form, setForm] = useState({
    testName: '',
    testCategory: 'Blood Test',
    cost: '500',
    status: 'Pending',
    resultSummary: 'Awaiting lab findings',
  });

  const [editForm, setEditForm] = useState({
    testName: '',
    testCategory: 'Blood Test',
    cost: '',
    status: 'Completed',
    resultSummary: '',
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await API.get('/lab/reports');
      if (res.data.success) setReports(res.data.reports || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateReport = async (e) => {
    e.preventDefault();
    if (isPatientRole) return;
    try {
      const res = await API.post('/lab/reports', form);
      if (res.data.success) {
        addToast('Lab test order created successfully!', 'success');
        setIsAddOpen(false);
        fetchReports();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Creation failed', 'danger');
    }
  };

  const handleOpenEdit = (r) => {
    if (isPatientRole) return;
    setEditingReport(r);
    setEditForm({
      testName: r.testName || '',
      testCategory: r.testCategory || 'Blood Test',
      cost: r.cost || '',
      status: r.status || 'Completed',
      resultSummary: r.resultSummary || '',
    });
    setIsEditOpen(true);
  };

  const handleUpdateReport = async (e) => {
    e.preventDefault();
    if (isPatientRole) return;
    try {
      const reportId = editingReport._id || editingReport.id;
      const res = await API.put(`/lab/reports/${reportId}`, editForm);
      if (res.data.success) {
        addToast('Lab report updated successfully!', 'success');
        setIsEditOpen(false);
        fetchReports();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Update failed', 'danger');
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (isPatientRole) return;
    if (!window.confirm('Are you sure you want to delete this lab report?')) return;
    try {
      const res = await API.delete(`/lab/reports/${reportId}`);
      if (res.data.success) {
        addToast('Lab report deleted successfully', 'info');
        fetchReports();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Delete failed', 'danger');
    }
  };

  const baseColumns = [
    { header: 'Order ID', accessor: 'reportId' },
    { header: 'Patient Name', accessor: 'patient', cell: (r) => r.patient?.name || 'John Doe' },
    { header: 'Test Name', accessor: 'testName' },
    { header: 'Category', accessor: 'testCategory' },
    { header: 'Cost (₹)', accessor: 'cost' },
    { header: 'Status', accessor: 'status', cell: (r) => <span className="font-bold text-xs text-blue-600">{r.status}</span> },
    { header: 'Findings / Summary', accessor: 'resultSummary' },
  ];

  const actionColumn = {
    header: 'Actions',
    accessor: 'actions',
    cell: (r) => (
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleOpenEdit(r)}
          className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 hover:bg-blue-100 transition-colors"
          title="Edit Lab Report"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => handleDeleteReport(r._id || r.id)}
          className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 hover:bg-rose-100 transition-colors"
          title="Delete Lab Report"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    ),
  };

  const columns = isPatientRole ? baseColumns : [...baseColumns, actionColumn];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />
      <div className="flex-1 flex">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className="flex-1 lg:ml-64 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Laboratory & Radiology Diagnostics Management</h1>
              <p className="text-xs text-slate-500">Pathology tests, blood reports, X-rays, MRI scans, CT scans, and test pricing catalog</p>
            </div>
            {!isPatientRole && (
              <button
                onClick={() => setIsAddOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-medical-600 text-white font-bold text-xs shadow-md flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Order New Diagnostic Test</span>
              </button>
            )}
          </div>

          <DataTable title="Diagnostic Reports & Imaging Inventory" columns={columns} data={reports} />
        </main>
      </div>

      {/* Add Lab Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Order Diagnostic Test">
        <form onSubmit={handleCreateReport} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Test Name</label>
              <input
                type="text"
                required
                value={form.testName}
                onChange={(e) => setForm({ ...form, testName: e.target.value })}
                className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Test Category</label>
              <select
                value={form.testCategory}
                onChange={(e) => setForm({ ...form, testCategory: e.target.value })}
                className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <option>Blood Test</option>
                <option>Pathology</option>
                <option>X-Ray Imaging</option>
                <option>MRI Scan</option>
                <option>CT Scan</option>
                <option>Ultrasound</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Cost (₹)</label>
              <input
                type="number"
                required
                value={form.cost}
                onChange={(e) => setForm({ ...form, cost: e.target.value })}
                className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <option>Pending</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
            </div>
          </div>

          <button type="submit" className="w-full py-2.5 rounded-xl bg-medical-600 text-white font-bold text-xs shadow-md">
            Issue Lab Test Order
          </button>
        </form>
      </Modal>

      {/* Edit Lab Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Diagnostic Test Details">
        <form onSubmit={handleUpdateReport} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Test Name</label>
              <input
                type="text"
                required
                value={editForm.testName}
                onChange={(e) => setEditForm({ ...editForm, testName: e.target.value })}
                className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Test Category</label>
              <select
                value={editForm.testCategory}
                onChange={(e) => setEditForm({ ...editForm, testCategory: e.target.value })}
                className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <option>Blood Test</option>
                <option>Pathology</option>
                <option>X-Ray Imaging</option>
                <option>MRI Scan</option>
                <option>CT Scan</option>
                <option>Ultrasound</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Cost (₹)</label>
              <input
                type="number"
                required
                value={editForm.cost}
                onChange={(e) => setEditForm({ ...editForm, cost: e.target.value })}
                className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Status</label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <option>Pending</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Result Summary / Diagnostic Findings</label>
            <textarea
              rows="2"
              value={editForm.resultSummary}
              onChange={(e) => setEditForm({ ...editForm, resultSummary: e.target.value })}
              className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <button type="submit" className="w-full py-2.5 rounded-xl bg-medical-600 text-white font-bold text-xs shadow-md">
            Save Diagnostic Report Changes
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default LabManagement;
