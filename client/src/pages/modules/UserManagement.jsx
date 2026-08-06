import React, { useState, useEffect, useContext } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import API from '../../services/api';
import { NotificationContext } from '../../context/NotificationContext';
import { Users, UserPlus, Edit3, Trash2, Shield, CheckCircle, XCircle } from 'lucide-react';

const UserManagement = () => {
  const { addToast } = useContext(NotificationContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: 'Password123!',
    role: 'Doctor',
    phone: '',
    specialization: 'General Medicine',
  });

  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'Doctor',
    phone: '',
    status: 'Active',
  });

  useEffect(() => {
    fetchUsers();
    const handleSync = () => fetchUsers();
    window.addEventListener('auracare_data_updated', handleSync);
    return () => window.removeEventListener('auracare_data_updated', handleSync);
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get('/users');
      if (res.data.success) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/users', form);
      if (res.data.success) {
        addToast('User account created successfully!', 'success');
        setIsAddUserOpen(false);
        fetchUsers();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Creation failed', 'danger');
    }
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'Doctor',
      phone: user.phone || '',
      status: user.status || 'Active',
    });
    setIsEditUserOpen(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await API.put(`/users/${editingUser._id || editingUser.id}`, editForm);
      if (res.data.success) {
        addToast('User account updated successfully!', 'success');
        setIsEditUserOpen(false);
        fetchUsers();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Update failed', 'danger');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user account?')) return;
    try {
      const res = await API.delete(`/users/${userId}`);
      if (res.data.success) {
        addToast('User account deleted successfully', 'info');
        fetchUsers();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Delete failed', 'danger');
    }
  };

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Role', accessor: 'role', cell: (r) => <span className="font-bold text-xs px-2 py-0.5 rounded-full bg-medical-100 dark:bg-medical-950 text-medical-700">{r.role}</span> },
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
            title="Edit User Details"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDeleteUser(r._id || r.id)}
            className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 hover:bg-rose-100 transition-colors"
            title="Delete User Account"
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
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">User & Staff Role Control</h1>
              <p className="text-xs text-slate-500">Manage all 8 system user roles, staff accounts, and edit permissions</p>
            </div>
            <button
              onClick={() => setIsAddUserOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-medical-600 hover:bg-medical-700 text-white font-bold text-xs shadow-md flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create System User Account</span>
            </button>
          </div>

          <DataTable title="All System User Accounts & Roles" columns={columns} data={users} />
        </main>
      </div>

      {/* Add User Modal */}
      <Modal isOpen={isAddUserOpen} onClose={() => setIsAddUserOpen(false)} title="Create New System User Account">
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Full Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Email Address</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Assigned Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <option>Admin</option>
                <option>Doctor</option>
                <option>Receptionist</option>
                <option>Nurse</option>
                <option>Lab Assistant</option>
                <option>Pharmacist</option>
                <option>Cashier</option>
                <option>Patient</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Phone Number</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <button type="submit" className="w-full py-2.5 rounded-xl bg-medical-600 text-white font-bold text-xs shadow-md">
            Create User Account & Issue Credentials
          </button>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal isOpen={isEditUserOpen} onClose={() => setIsEditUserOpen(false)} title="Edit User Account Details">
        <form onSubmit={handleUpdateUser} className="space-y-4">
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
              <label className="block text-xs font-semibold mb-1">Role</label>
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
                <option>Patient</option>
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
            Save User Changes
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default UserManagement;
