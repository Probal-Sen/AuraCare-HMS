import React, { useState, useEffect, useContext } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import API from '../../services/api';
import { NotificationContext } from '../../context/NotificationContext';
import { Pill, Plus, AlertTriangle, Edit3, Trash2 } from 'lucide-react';

const PharmacyInventory = () => {
  const { addToast } = useContext(NotificationContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [isAddMedOpen, setIsAddMedOpen] = useState(false);
  const [isEditMedOpen, setIsEditMedOpen] = useState(false);
  const [editingMed, setEditingMed] = useState(null);

  const [form, setForm] = useState({
    name: '',
    code: '',
    category: 'Antibiotic',
    unitPrice: '15.00',
    stockQuantity: '100',
    minStockAlert: '20',
    locationRack: 'Rack A-1',
  });

  const [editForm, setEditForm] = useState({
    name: '',
    category: 'Antibiotic',
    unitPrice: '',
    stockQuantity: '',
    minStockAlert: '',
    locationRack: '',
  });

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const res = await API.get('/pharmacy/medicines');
      if (res.data.success) setMedicines(res.data.medicines || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/pharmacy/medicines', form);
      if (res.data.success) {
        addToast('Medicine added to inventory!', 'success');
        setIsAddMedOpen(false);
        fetchMedicines();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Addition failed', 'danger');
    }
  };

  const handleOpenEdit = (med) => {
    setEditingMed(med);
    setEditForm({
      name: med.name || '',
      category: med.category || 'Antibiotic',
      unitPrice: med.unitPrice || '',
      stockQuantity: med.stockQuantity || '',
      minStockAlert: med.minStockAlert || '',
      locationRack: med.locationRack || 'Rack A-1',
    });
    setIsEditMedOpen(true);
  };

  const handleUpdateMedicine = async (e) => {
    e.preventDefault();
    try {
      const res = await API.put(`/pharmacy/medicines/${editingMed._id || editingMed.id}`, editForm);
      if (res.data.success) {
        addToast('Medicine stock details updated!', 'success');
        setIsEditMedOpen(false);
        fetchMedicines();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Update failed', 'danger');
    }
  };

  const handleDeleteMedicine = async (medId) => {
    if (!window.confirm('Are you sure you want to delete this medicine from inventory?')) return;
    try {
      const res = await API.delete(`/pharmacy/medicines/${medId}`);
      if (res.data.success) {
        addToast('Medicine deleted from stock', 'info');
        fetchMedicines();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Delete failed', 'danger');
    }
  };

  const columns = [
    { header: 'Item Code', accessor: 'code' },
    { header: 'Medicine Name', accessor: 'name' },
    { header: 'Category', accessor: 'category' },
    { header: 'Unit Price (₹)', accessor: 'unitPrice', cell: (r) => `₹${Number(r.unitPrice || 0).toFixed(2)}` },
    {
      header: 'Stock Level',
      accessor: 'stockQuantity',
      cell: (r) => (
        <span className={`font-bold text-xs ${r.stockQuantity <= r.minStockAlert ? 'text-rose-600 font-extrabold' : 'text-emerald-600'}`}>
          {r.stockQuantity} units {r.stockQuantity <= r.minStockAlert && '(Low!)'}
        </span>
      ),
    },
    { header: 'Rack Location', accessor: 'locationRack' },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (r) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenEdit(r)}
            className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 hover:bg-blue-100 transition-colors"
            title="Edit Medicine Details"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDeleteMedicine(r._id || r.id)}
            className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 hover:bg-rose-100 transition-colors"
            title="Delete Medicine Stock Item"
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
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Pharmacy Stock & Medicine Inventory</h1>
              <p className="text-xs text-slate-500">Pharmaceutical inventory control, unit pricing, rack location, and stock threshold alerts</p>
            </div>
            <button
              onClick={() => setIsAddMedOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-medical-600 text-white font-bold text-xs shadow-md flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Medicine Stock</span>
            </button>
          </div>

          <DataTable title="Pharmaceutical Stock Inventory" columns={columns} data={medicines} />
        </main>
      </div>

      {/* Add Medicine Modal */}
      <Modal isOpen={isAddMedOpen} onClose={() => setIsAddMedOpen(false)} title="Add Medicine to Stock Inventory">
        <form onSubmit={handleAddMedicine} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Medicine Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <option>Antibiotic</option>
                <option>Analgesic</option>
                <option>Cardiovascular</option>
                <option>Vitamins</option>
                <option>Syrup</option>
                <option>Injection</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Unit Price (₹)</label>
              <input
                type="number"
                step="0.01"
                required
                value={form.unitPrice}
                onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
                className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Stock Quantity</label>
              <input
                type="number"
                required
                value={form.stockQuantity}
                onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
                className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Min Alert Qty</label>
              <input
                type="number"
                value={form.minStockAlert}
                onChange={(e) => setForm({ ...form, minStockAlert: e.target.value })}
                className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <button type="submit" className="w-full py-2.5 rounded-xl bg-medical-600 text-white font-bold text-xs shadow-md">
            Save Medicine Stock Item
          </button>
        </form>
      </Modal>

      {/* Edit Medicine Modal */}
      <Modal isOpen={isEditMedOpen} onClose={() => setIsEditMedOpen(false)} title="Edit Medicine Details">
        <form onSubmit={handleUpdateMedicine} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Medicine Name</label>
              <input
                type="text"
                required
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Category</label>
              <select
                value={editForm.category}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <option>Antibiotic</option>
                <option>Analgesic</option>
                <option>Cardiovascular</option>
                <option>Vitamins</option>
                <option>Syrup</option>
                <option>Injection</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Unit Price (₹)</label>
              <input
                type="number"
                step="0.01"
                required
                value={editForm.unitPrice}
                onChange={(e) => setEditForm({ ...editForm, unitPrice: e.target.value })}
                className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Stock Quantity</label>
              <input
                type="number"
                required
                value={editForm.stockQuantity}
                onChange={(e) => setEditForm({ ...editForm, stockQuantity: e.target.value })}
                className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Min Alert Qty</label>
              <input
                type="number"
                value={editForm.minStockAlert}
                onChange={(e) => setEditForm({ ...editForm, minStockAlert: e.target.value })}
                className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Rack Location</label>
            <input
              type="text"
              value={editForm.locationRack}
              onChange={(e) => setEditForm({ ...editForm, locationRack: e.target.value })}
              className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <button type="submit" className="w-full py-2.5 rounded-xl bg-medical-600 text-white font-bold text-xs shadow-md">
            Save Medicine Changes
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default PharmacyInventory;
