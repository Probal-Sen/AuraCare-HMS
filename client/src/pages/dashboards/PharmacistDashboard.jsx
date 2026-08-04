import React, { useState, useEffect, useContext } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import StatCard from '../../components/StatCard';
import DataTable from '../../components/DataTable';
import API from '../../services/api';
import { NotificationContext } from '../../context/NotificationContext';
import { Pill, AlertTriangle, CheckCircle, Package, Clock } from 'lucide-react';

const PharmacistDashboard = () => {
  const { addToast } = useContext(NotificationContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [prescriptions, setPrescriptions] = useState([]);
  const [medicines, setMedicines] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rxRes, medRes] = await Promise.all([
        API.get('/prescriptions'),
        API.get('/pharmacy/medicines'),
      ]);
      if (rxRes.data.success) setPrescriptions(rxRes.data.prescriptions || []);
      if (medRes.data.success) setMedicines(medRes.data.medicines || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDispense = async (rxId) => {
    try {
      const res = await API.put(`/prescriptions/${rxId}/dispense`);
      if (res.data.success) {
        addToast('Medication dispensed & inventory updated!', 'success');
        fetchData();
      }
    } catch (err) {
      addToast('Dispense failed', 'danger');
    }
  };

  const rxColumns = [
    { header: 'Rx ID', accessor: 'prescriptionId' },
    { header: 'Patient', accessor: 'patient', cell: (r) => r.patient?.name || 'John Doe' },
    { header: 'Doctor', accessor: 'doctor', cell: (r) => r.doctor?.name || 'Dr. Sarah' },
    {
      header: 'Prescribed Medicines',
      accessor: 'medicines',
      cell: (r) =>
        r.medicines?.map((m) => `${m.medicineName} (${m.dosage})`).join(', ') || 'N/A',
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (r) => (
        <span className={`px-2 py-0.5 rounded-full font-bold text-xs ${r.status === 'Dispensed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
          {r.status}
        </span>
      ),
    },
    {
      header: 'Action',
      accessor: 'action',
      cell: (r) =>
        r.status === 'Pending' ? (
          <button
            onClick={() => handleDispense(r._id)}
            className="px-2.5 py-1 rounded-lg bg-medical-600 hover:bg-medical-700 text-white font-semibold text-xs flex items-center gap-1"
          >
            <Pill className="w-3.5 h-3.5" />
            <span>Dispense</span>
          </button>
        ) : (
          <span className="text-xs text-slate-400">Fulfilled</span>
        ),
    },
  ];

  const lowStockMeds = medicines.filter((m) => m.stockQuantity <= m.minStockAlert);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />

      <div className="flex-1 flex">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main className="flex-1 lg:ml-64 p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Pharmacy Dispensing & Inventory Station</h1>
            <p className="text-xs text-slate-500">Fulfil doctor prescriptions, manage pharmaceutical stock, and monitor expiry alerts</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Pending Rx Orders" value={prescriptions.filter((r) => r.status === 'Pending').length} icon={Clock} color="amber" />
            <StatCard title="Total Medicines Stocked" value={medicines.length} icon={Package} color="blue" />
            <StatCard title="Low Stock Alerts" value={lowStockMeds.length} icon={AlertTriangle} color="rose" />
            <StatCard title="Dispensed Today" value="14" icon={CheckCircle} color="emerald" />
          </div>

          {lowStockMeds.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 flex items-center gap-3 text-amber-800 dark:text-amber-300 text-xs">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="font-bold">Attention Needed: Low Medicine Stock Identified</p>
                <p>{lowStockMeds.map((m) => `${m.name} (${m.stockQuantity} units left)`).join(', ')}</p>
              </div>
            </div>
          )}

          <DataTable title="Active Doctor Prescriptions Queue" columns={rxColumns} data={prescriptions} />
        </main>
      </div>
    </div>
  );
};

export default PharmacistDashboard;
