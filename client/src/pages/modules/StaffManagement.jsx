import React, { useState, useEffect, useContext } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import API from '../../services/api';
import { NotificationContext } from '../../context/NotificationContext';
import { UserCheck, Edit3, Trash2 } from 'lucide-react';

const StaffManagement = () => {
  const { addToast } = useContext(NotificationContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [staff, setStaff] = useState([]);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'Doctor',
    phone: '',
    status: 'Active',
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await API.get('/users');
      if (res.data.success) {
        setStaff((res.data.users || []).filter((u) => u.role !== 'Patient'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenEdit = (member) => {
    setEditingStaff(member);
    setEditForm({
      name: member.name || '',
      email: member.email || '',
      role: member.role || 'Doctor',
      phone: member.phone || '',
      status: member.status || 'Active',
    });
    setIsEditOpen(true);
  };

  const handleUpdateStaff = async (e) => {
    e.preventDefault();
    try {
      const res = await API.put(`/users/${editingStaff._id || editingStaff.id}`, editForm);
      if (res.data.success) {
        addToast('Staff details updated successfully!', 'success');
        setIsEditOpen(false);
        fetchStaff();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Update failed', 'danger');
    }
  };

  const handleDeleteStaff = async (staffId) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) return;
    try {
      const res = await API.delete(`/users/${staffId}`);
      if (res.data.success) {
        addToast('Staff member deleted successfully', 'info');
        fetchStaff();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Delete failed', 'danger');
    }
  };

  const columns = [
    { header: 'Staff Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Department / Role', accessor: 'role', cell: (r) => <span className="font-bold text-xs px-2.5 py-0.5 rounded-full bg-medical-100 text-medical-800">{r.role}</span> },
    { header: 'Phone', accessor: 'phone' },
    { header: 'Status', accessor: 'status', cell: (r) => <span className="text-emerald-600 font-semibold text-xs">{r.status || 'Active'}</span> },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (r) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenEdit(r)}
            className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 hover:bg-blue-100 transition-colors"
            title="Edit Staff Member"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDeleteStaff(r._id || r.id)}
            className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 hover:bg-rose-100 transition-colors"
            title="Delete Staff Member"
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
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Hospital Staff Directory</h1>
            <p className="text-xs text-slate-500">Overview of doctors, nurses, pharmacists, lab assistants, cashiers and administrative personnel</p>
          </div>

          <DataTable title="Active Medical & Operational Staff Directory" columns={columns} data={staff} />
        </main>
      </div>

      {/* Edit Staff Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Staff Member Details">
        <form onSubmit={handleUpdateStaff} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Full Name</label>
            <input
              type="text"
              required
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Email Address</label>
            <input
              type="email"
              required
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Role / Specialization</label>
              <select
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <option>Admin</option>
                <option>Doctor</option>
                <option>Receptionist</option>
                <option>Nurse</option>
                <option>Lab Assistant</option>
                <option>Pharmacist</option>
                <option>Cashier</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Phone</label>
              <input
                type="text"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
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
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>

          <button type="submit" className="w-full py-2.5 rounded-xl bg-medical-600 text-white font-bold text-xs shadow-md">
            Save Staff Member Changes
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default StaffManagement;
