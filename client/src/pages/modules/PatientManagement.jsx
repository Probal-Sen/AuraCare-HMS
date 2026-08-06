import React, { useState, useEffect, useContext } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import API from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { NotificationContext } from '../../context/NotificationContext';
import { UserPlus, Edit3, Trash2 } from 'lucide-react';

const PatientManagement = () => {
  const { user } = useContext(AuthContext);
  const { addToast } = useContext(NotificationContext);
  const isPatientRole = user?.role === 'Patient';

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [patients, setPatients] = useState([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);

  const [form, setForm] = useState({
    name: '',
    age: '35',
    gender: 'Male',
    bloodGroup: 'O+',
    phone: '',
    email: '',
    address: '',
    admissionType: 'OPD',
    roomNumber: 'N/A',
  });

  const [editForm, setEditForm] = useState({
    name: '',
    age: '',
    gender: '',
    bloodGroup: '',
    phone: '',
    email: '',
    address: '',
    admissionType: '',
    roomNumber: '',
  });

  useEffect(() => {
    fetchPatients();
    const handleSync = () => fetchPatients();
    window.addEventListener('auracare_data_updated', handleSync);
    return () => window.removeEventListener('auracare_data_updated', handleSync);
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await API.get('/patients');
      if (res.data.success) setPatients(res.data.patients || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    if (isPatientRole) return;
    try {
      const res = await API.post('/patients', form);
      if (res.data.success) {
        addToast('Patient registered successfully!', 'success');
        setIsAddOpen(false);
        setForm({
          name: '',
          age: '35',
          gender: 'Male',
          bloodGroup: 'O+',
          phone: '',
          email: '',
          address: '',
          admissionType: 'OPD',
          roomNumber: 'N/A',
        });
        fetchPatients();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Registration failed', 'danger');
    }
  };

  const handleOpenEdit = (p) => {
    if (isPatientRole) return;
    setEditingPatient(p);
    setEditForm({
      name: p.name || '',
      age: p.age || '',
      gender: p.gender || 'Male',
      bloodGroup: p.bloodGroup || 'O+',
      phone: p.phone || '',
      email: p.email || '',
      address: p.address || '',
      admissionType: p.admissionType || 'OPD',
      roomNumber: p.roomNumber || 'N/A',
    });
    setIsEditOpen(true);
  };

  const handleUpdatePatient = async (e) => {
    e.preventDefault();
    if (isPatientRole) return;
    try {
      const res = await API.put(`/patients/${editingPatient._id || editingPatient.id}`, editForm);
      if (res.data.success) {
        addToast('Patient record updated successfully!', 'success');
        setIsEditOpen(false);
        fetchPatients();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Update failed', 'danger');
    }
  };

  const handleDeletePatient = async (patientId) => {
    if (isPatientRole) return;
    if (!window.confirm('Are you sure you want to delete this patient record?')) return;
    try {
      const res = await API.delete(`/patients/${patientId}`);
      if (res.data.success) {
        addToast('Patient record deleted', 'info');
        fetchPatients();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Delete failed', 'danger');
    }
  };

  const baseColumns = [
    { header: 'Patient ID', accessor: 'patientId' },
    { header: 'Name', accessor: 'name' },
    { header: 'Age / Gender', accessor: 'age', cell: (r) => `${r.age} yrs / ${r.gender}` },
    { header: 'Blood Group', accessor: 'bloodGroup' },
    { header: 'Phone', accessor: 'phone' },
    { header: 'Admission Type', accessor: 'admissionType' },
    { header: 'Room Number', accessor: 'roomNumber' },
  ];

  const actionColumn = {
    header: 'Actions',
    accessor: 'actions',
    cell: (r) => (
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleOpenEdit(r)}
          className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 hover:bg-blue-100 transition-colors"
          title="Edit Patient Details"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => handleDeletePatient(r._id || r.id)}
          className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 hover:bg-rose-100 transition-colors"
          title="Delete Patient Record"
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
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Patient Records & Admission Control</h1>
              <p className="text-xs text-slate-500">Centralized patient database, demographics, emergency contact info, and admission tracking</p>
            </div>
            {!isPatientRole && (
              <button
                onClick={() => setIsAddOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-medical-600 hover:bg-medical-700 text-white font-bold text-xs shadow-md flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register New Patient</span>
              </button>
            )}
          </div>

          <DataTable title="All Registered Patients" columns={columns} data={patients} />
        </main>
      </div>

      {/* Add Patient Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Register New Patient">
        <form onSubmit={handleCreatePatient} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
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
              <label className="block text-xs font-semibold mb-1">Phone</label>
              <input
                type="text"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Age</label>
              <input
                type="number"
                required
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
                className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Gender</label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Blood Group</label>
              <select
                value={form.bloodGroup}
                onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
                <option>AB+</option><option>AB-</option><option>O+</option><option>O-</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Admission Type</label>
              <select
                value={form.admissionType}
                onChange={(e) => setForm({ ...form, admissionType: e.target.value })}
                className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <option>OPD</option>
                <option>IPD</option>
                <option>Emergency</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Room Number</label>
              <input
                type="text"
                value={form.roomNumber}
                onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
                className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <button type="submit" className="w-full py-2.5 rounded-xl bg-medical-600 text-white font-bold text-xs shadow-md">
            Register Patient & Save Record
          </button>
        </form>
      </Modal>

      {/* Edit Patient Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Patient Details">
        <form onSubmit={handleUpdatePatient} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
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
              <label className="block text-xs font-semibold mb-1">Phone</label>
              <input
                type="text"
                required
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Age</label>
              <input
                type="number"
                required
                value={editForm.age}
                onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Gender</label>
              <select
                value={editForm.gender}
                onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Blood Group</label>
              <select
                value={editForm.bloodGroup}
                onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })}
                className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
                <option>AB+</option><option>AB-</option><option>O+</option><option>O-</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Admission Type</label>
              <select
                value={editForm.admissionType}
                onChange={(e) => setEditForm({ ...editForm, admissionType: e.target.value })}
                className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <option>OPD</option>
                <option>IPD</option>
                <option>Emergency</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Room Number</label>
              <input
                type="text"
                value={editForm.roomNumber}
                onChange={(e) => setEditForm({ ...editForm, roomNumber: e.target.value })}
                className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Address</label>
            <input
              type="text"
              value={editForm.address}
              onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <button type="submit" className="w-full py-2.5 rounded-xl bg-medical-600 text-white font-bold text-xs shadow-md">
            Save Patient Details
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default PatientManagement;
