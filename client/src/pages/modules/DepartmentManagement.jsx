import React, { useState, useEffect, useContext } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import API from '../../services/api';
import { NotificationContext } from '../../context/NotificationContext';
import { Building2, Plus, Edit3, Trash2 } from 'lucide-react';

const DepartmentManagement = () => {
  const { addToast } = useContext(NotificationContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [isAddDeptOpen, setIsAddDeptOpen] = useState(false);
  const [isEditDeptOpen, setIsEditDeptOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);

  const [form, setForm] = useState({ name: '', code: '', description: '', headDoctor: '' });
  const [editForm, setEditForm] = useState({ name: '', code: '', description: '', headDoctor: '', status: 'Active' });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await API.get('/departments');
      if (res.data.success) setDepartments(res.data.departments || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/departments', form);
      if (res.data.success) {
        addToast('Department created successfully!', 'success');
        setIsAddDeptOpen(false);
        fetchDepartments();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Creation failed', 'danger');
    }
  };

  const handleOpenEdit = (dept) => {
    setEditingDept(dept);
    setEditForm({
      name: dept.name || '',
      code: dept.code || '',
      description: dept.description || '',
      headDoctor: dept.headDoctor || '',
      status: dept.status || 'Active',
    });
    setIsEditDeptOpen(true);
  };

  const handleUpdateDepartment = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/departments', editForm);
      if (res.data.success) {
        addToast('Department updated successfully!', 'success');
        setIsEditDeptOpen(false);
        fetchDepartments();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Update failed', 'danger');
    }
  };

  const handleDeleteDepartment = async (deptId) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;
    try {
      setDepartments(departments.filter((d) => d._id !== deptId && d.id !== deptId));
      addToast('Department deleted successfully', 'info');
    } catch (err) {
      addToast('Delete failed', 'danger');
    }
  };

  const columns = [
    { header: 'Code', accessor: 'code' },
    { header: 'Department Name', accessor: 'name' },
    { header: 'Head Doctor', accessor: 'headDoctor' },
    { header: 'Description', accessor: 'description' },
    { header: 'Status', accessor: 'status', cell: (r) => <span className="font-bold text-xs text-emerald-600">{r.status}</span> },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (r) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenEdit(r)}
            className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 hover:bg-blue-100 transition-colors"
            title="Edit Department Details"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDeleteDepartment(r._id || r.id)}
            className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 hover:bg-rose-100 transition-colors"
            title="Delete Department"
          >
            <Trash2 className="w-3.5 h-3.5" />
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Hospital Departments Management</h1>
              <p className="text-xs text-slate-500">Configure medical specialties, department heads, and clinical units</p>
            </div>
            <button
              onClick={() => setIsAddDeptOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-medical-600 text-white font-bold text-xs shadow-md flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Department</span>
            </button>
          </div>

          <DataTable title="Hospital Clinical Departments" columns={columns} data={departments} />
        </main>
      </div>

      {/* Add Department Modal */}
      <Modal isOpen={isAddDeptOpen} onClose={() => setIsAddDeptOpen(false)} title="Create Hospital Department">
        <form onSubmit={handleCreateDepartment} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Department Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Department Code</label>
              <input
                type="text"
                required
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Head Doctor Name</label>
            <input
              type="text"
              value={form.headDoctor}
              onChange={(e) => setForm({ ...form, headDoctor: e.target.value })}
              className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Description</label>
            <textarea
              rows="2"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <button type="submit" className="w-full py-2.5 rounded-xl bg-medical-600 text-white font-bold text-xs shadow-md">
            Save Department
          </button>
        </form>
      </Modal>

      {/* Edit Department Modal */}
      <Modal isOpen={isEditDeptOpen} onClose={() => setIsEditDeptOpen(false)} title="Edit Department Details">
        <form onSubmit={handleUpdateDepartment} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Department Name</label>
              <input
                type="text"
                required
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Department Code</label>
              <input
                type="text"
                required
                value={editForm.code}
                onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Head Doctor Name</label>
            <input
              type="text"
              value={editForm.headDoctor}
              onChange={(e) => setEditForm({ ...editForm, headDoctor: e.target.value })}
              className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Description</label>
            <textarea
              rows="2"
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <button type="submit" className="w-full py-2.5 rounded-xl bg-medical-600 text-white font-bold text-xs shadow-md">
            Save Department Changes
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default DepartmentManagement;
