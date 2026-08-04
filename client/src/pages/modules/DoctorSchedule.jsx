import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import DataTable from '../../components/DataTable';
import API from '../../services/api';

const DoctorSchedule = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await API.get('/doctors');
      if (res.data.success) setDoctors(res.data.doctors || []);
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
    { header: 'Doctor ID', accessor: 'doctorId' },
    { header: 'Doctor Name', accessor: 'name' },
    { header: 'Specialization', accessor: 'specialization' },
    { header: 'OPD Room', accessor: 'roomNumber' },
    { header: 'Available Days', accessor: 'availableDays', cell: (r) => r.availableDays?.join(', ') || 'Mon-Fri' },
    { header: 'Available Slots', accessor: 'availableSlots', cell: (r) => r.availableSlots?.join(', ') || '09:00 AM - 05:00 PM' },
    { header: 'Consult Fee (₹)', accessor: 'consultationFee', cell: (r) => `₹${r.consultationFee}` },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />
      <div className="flex-1 flex">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className="flex-1 lg:ml-64 p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Doctor Daily Duty Schedule & OPD Rooms</h1>
            <p className="text-xs text-slate-500">Consultation hours, available time slots, room assignments, and doctor availability</p>
          </div>
          <DataTable title="Physician Roster & Time Slot Availability" columns={columns} data={doctors} />
        </main>
      </div>
    </div>
  );
};

export default DoctorSchedule;
