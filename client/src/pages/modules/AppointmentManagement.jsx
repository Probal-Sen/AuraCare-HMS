import React, { useState, useEffect, useContext } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import API from '../../services/api';
import { NotificationContext } from '../../context/NotificationContext';
import { Calendar, Plus, Edit3, Trash2 } from 'lucide-react';

const AppointmentManagement = () => {
  const { addToast } = useContext(NotificationContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingApt, setEditingApt] = useState(null);

  const [form, setForm] = useState({
    patientId: '',
    doctorId: '',
    date: '2026-08-06',
    timeSlot: '10:00 AM',
    reason: 'General Consultation',
  });

  const [editForm, setEditForm] = useState({
    date: '',
    timeSlot: '',
    reason: '',
    status: 'Scheduled',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [aptRes, patRes, docRes] = await Promise.all([
        API.get('/appointments'),
        API.get('/patients'),
        API.get('/doctors'),
      ]);
      if (aptRes.data.success) setAppointments(aptRes.data.appointments || []);
      if (patRes.data.success) setPatients(patRes.data.patients || []);
      if (docRes.data.success) setDoctors(docRes.data.doctors || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/appointments', form);
      if (res.data.success) {
        addToast('Appointment booked successfully!', 'success');
        setIsBookModalOpen(false);
        fetchData();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Booking failed', 'danger');
    }
  };

  const handleOpenEdit = (apt) => {
    setEditingApt(apt);
    setEditForm({
      date: apt.date || '',
      timeSlot: apt.timeSlot || '10:00 AM',
      reason: apt.reason || '',
      status: apt.status || 'Scheduled',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateAppointment = async (e) => {
    e.preventDefault();
    try {
      const res = await API.put(`/appointments/${editingApt._id || editingApt.id}`, editForm);
      if (res.data.success) {
        addToast('Appointment details updated successfully!', 'success');
        setIsEditModalOpen(false);
        fetchData();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Update failed', 'danger');
    }
  };

  const handleDeleteAppointment = async (aptId) => {
    if (!window.confirm('Are you sure you want to cancel and delete this appointment?')) return;
    try {
      const res = await API.delete(`/appointments/${aptId}`);
      if (res.data.success) {
        addToast('Appointment deleted successfully', 'info');
        fetchData();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Delete failed', 'danger');
    }
  };

  const columns = [
    { header: 'Appt ID', accessor: 'appointmentId' },
    { header: 'Patient Name', accessor: 'patient', cell: (r) => r.patient?.name || 'John Doe' },
    { header: 'Doctor Assigned', accessor: 'doctor', cell: (r) => r.doctor?.name || 'Dr. Sarah Jenkins' },
    { header: 'Date', accessor: 'date' },
    { header: 'Time Slot', accessor: 'timeSlot' },
    { header: 'Reason', accessor: 'reason' },
    { header: 'Status', accessor: 'status', cell: (r) => <span className="font-bold text-xs text-medical-600">{r.status}</span> },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (r) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenEdit(r)}
            className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 hover:bg-blue-100 transition-colors"
            title="Edit Appointment Details"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDeleteAppointment(r._id || r.id)}
            className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 hover:bg-rose-100 transition-colors"
            title="Cancel & Delete Appointment"
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
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Appointment Scheduling & OPD Bookings</h1>
              <p className="text-xs text-slate-500">Book new consultations, reschedule dates, edit details, and manage schedule slots</p>
            </div>
            <button
              onClick={() => setIsBookModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-medical-600 text-white font-bold text-xs shadow-md flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>
          </div>

          <DataTable title="All Scheduled Appointments" columns={columns} data={appointments} />
        </main>
      </div>

      {/* Book Appointment Modal */}
      <Modal isOpen={isBookModalOpen} onClose={() => setIsBookModalOpen(false)} title="Book OPD Doctor Appointment">
        <form onSubmit={handleBook} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Select Patient</label>
            <select
              required
              value={form.patientId}
              onChange={(e) => setForm({ ...form, patientId: e.target.value })}
              className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              <option value="">-- Choose Patient --</option>
              {patients.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.patientId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Select Doctor</label>
            <select
              required
              value={form.doctorId}
              onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
              className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              <option value="">-- Choose Doctor --</option>
              {doctors.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} ({d.specialization})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Appointment Date</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Time Slot</label>
              <select
                value={form.timeSlot}
                onChange={(e) => setForm({ ...form, timeSlot: e.target.value })}
                className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <option>09:00 AM</option>
                <option>10:00 AM</option>
                <option>11:30 AM</option>
                <option>02:00 PM</option>
                <option>04:00 PM</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Reason for Visit</label>
            <input
              type="text"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <button type="submit" className="w-full py-2.5 rounded-xl bg-medical-600 text-white font-bold text-xs shadow-md">
            Confirm & Issue Appointment Ticket
          </button>
        </form>
      </Modal>

      {/* Edit Appointment Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Appointment Details">
        <form onSubmit={handleUpdateAppointment} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Appointment Date</label>
              <input
                type="date"
                required
                value={editForm.date}
                onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Time Slot</label>
              <select
                value={editForm.timeSlot}
                onChange={(e) => setEditForm({ ...editForm, timeSlot: e.target.value })}
                className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <option>09:00 AM</option>
                <option>10:00 AM</option>
                <option>11:30 AM</option>
                <option>02:00 PM</option>
                <option>04:00 PM</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Status</label>
            <select
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              <option>Scheduled</option>
              <option>Completed</option>
              <option>Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Reason for Visit</label>
            <input
              type="text"
              value={editForm.reason}
              onChange={(e) => setEditForm({ ...editForm, reason: e.target.value })}
              className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <button type="submit" className="w-full py-2.5 rounded-xl bg-medical-600 text-white font-bold text-xs shadow-md">
            Save Appointment Changes
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default AppointmentManagement;
