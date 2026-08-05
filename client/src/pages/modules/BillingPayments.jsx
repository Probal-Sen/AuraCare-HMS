import React, { useState, useEffect, useContext } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import API, { downloadPdfBlob } from '../../services/api';
import { NotificationContext } from '../../context/NotificationContext';
import { Download, Plus, Edit3, Trash2, Upload, FileCheck } from 'lucide-react';

const BillingPayments = () => {
  const { addToast } = useContext(NotificationContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [bills, setBills] = useState([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [targetBillId, setTargetBillId] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const [form, setForm] = useState({
    subtotal: '1000',
    insuranceDiscount: '100',
    paymentStatus: 'Unpaid',
    paymentMethod: 'Cash',
  });

  const [editForm, setEditForm] = useState({
    subtotal: '',
    insuranceDiscount: '',
    totalAmount: '',
    paymentStatus: 'Paid',
    paymentMethod: 'UPI / Online',
  });

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const res = await API.get('/bills');
      if (res.data.success) setBills(res.data.bills || []);
    } catch (err) {
      console.error(err);
    }
  };

  const downloadInvoice = (billId, invNum) => {
    downloadPdfBlob(`/bills/${billId}/pdf`, `Invoice_${invNum || 'INV-001'}.pdf`);
  };

  const handleUploadSampleInvoice = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      addToast('Please select a PDF or image file to upload', 'warning');
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('invoiceFile', uploadFile);

      const billId = targetBillId || (bills[0]?._id || 'sample');
      const res = await API.post(`/bills/${billId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        addToast('Sample patient invoice uploaded successfully!', 'success');
        setIsUploadOpen(false);
        setUploadFile(null);
        fetchBills();
      }
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || 'Invoice upload failed', 'danger');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateBill = async (e) => {
    e.preventDefault();
    try {
      const sub = Number(form.subtotal || 0);
      const disc = Number(form.insuranceDiscount || 0);
      const total = Math.max(0, sub - disc);
      const res = await API.post('/bills', {
        subtotal: sub,
        insuranceDiscount: disc,
        totalAmount: total,
        paymentStatus: form.paymentStatus,
        paymentMethod: form.paymentMethod,
      });
      if (res.data.success) {
        addToast('Invoice generated successfully!', 'success');
        setIsAddOpen(false);
        fetchBills();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Generation failed', 'danger');
    }
  };

  const handleOpenEdit = (bill) => {
    setEditingBill(bill);
    setEditForm({
      subtotal: bill.subtotal || bill.totalAmount || 0,
      insuranceDiscount: bill.insuranceDiscount || 0,
      totalAmount: bill.totalAmount || 0,
      paymentStatus: bill.paymentStatus || 'Unpaid',
      paymentMethod: bill.paymentMethod || 'Cash',
    });
    setIsEditOpen(true);
  };

  const handleUpdateBill = async (e) => {
    e.preventDefault();
    try {
      const sub = Number(editForm.subtotal || 0);
      const disc = Number(editForm.insuranceDiscount || 0);
      const total = Math.max(0, sub - disc);
      setBills((prev) =>
        prev.map((b) =>
          (b._id === editingBill._id || b.id === editingBill.id)
            ? { ...b, subtotal: sub, insuranceDiscount: disc, totalAmount: total, paymentStatus: editForm.paymentStatus, paymentMethod: editForm.paymentMethod }
            : b
        )
      );
      addToast('Invoice details updated successfully!', 'success');
      setIsEditOpen(false);
    } catch (err) {
      addToast('Update failed', 'danger');
    }
  };

  const handleDeleteBill = async (billId) => {
    if (!window.confirm('Are you sure you want to delete this invoice record?')) return;
    try {
      setBills((prev) => prev.filter((b) => b._id !== billId && b.id !== billId));
      addToast('Invoice record deleted', 'info');
    } catch (err) {
      addToast('Delete failed', 'danger');
    }
  };

  const columns = [
    { header: 'Invoice #', accessor: 'invoiceNumber' },
    { header: 'Patient Name', accessor: 'patient', cell: (r) => r.patient?.name || 'Rahul Kumar' },
    { header: 'Subtotal', accessor: 'subtotal', cell: (r) => `₹${Number(r.subtotal || r.totalAmount || 0).toFixed(2)}` },
    { header: 'Discount', accessor: 'insuranceDiscount', cell: (r) => `-₹${Number(r.insuranceDiscount || 0).toFixed(2)}` },
    { header: 'Total Due', accessor: 'totalAmount', cell: (r) => `₹${Number(r.totalAmount || 0).toFixed(2)}` },
    {
      header: 'Status',
      accessor: 'paymentStatus',
      cell: (r) => (
        <span className={`font-bold text-xs ${r.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
          {r.paymentStatus}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'action',
      cell: (r) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadInvoice(r._id || r.invoiceNumber, r.invoiceNumber)}
            className="px-2.5 py-1 rounded-lg bg-medical-600 hover:bg-medical-700 text-white font-semibold text-xs flex items-center gap-1"
            title="Download PDF Receipt"
          >
            <Download className="w-3.5 h-3.5" />
            <span>PDF</span>
          </button>

          <button
            onClick={() => {
              setTargetBillId(r._id || r.id);
              setIsUploadOpen(true);
            }}
            className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 hover:bg-emerald-100 transition-colors text-xs font-semibold flex items-center gap-1"
            title="Upload Sample / Custom Invoice Document"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload</span>
          </button>

          <button
            onClick={() => handleOpenEdit(r)}
            className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 hover:bg-blue-100 transition-colors"
            title="Edit Invoice Details"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDeleteBill(r._id || r.id)}
            className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 hover:bg-rose-100 transition-colors"
            title="Delete Invoice"
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Billing, Payments & Invoicing Desk</h1>
              <p className="text-xs text-slate-500">Consolidated patient invoices, insurance deductions, cash/online transaction history</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setTargetBillId(bills[0]?._id || '');
                  setIsUploadOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-md flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Sample Invoice</span>
              </button>

              <button
                onClick={() => setIsAddOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-medical-600 hover:bg-medical-700 text-white font-bold text-xs shadow-md flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Invoice</span>
              </button>
            </div>
          </div>

          <DataTable title="All Hospital Invoices & Financial Receipts" columns={columns} data={bills} />
        </main>
      </div>

      {/* Add Bill Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Create Patient Invoice">
        <form onSubmit={handleCreateBill} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Subtotal (₹)</label>
              <input
                type="number"
                required
                value={form.subtotal}
                onChange={(e) => setForm({ ...form, subtotal: e.target.value })}
                className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Insurance / Discount (₹)</label>
              <input
                type="number"
                value={form.insuranceDiscount}
                onChange={(e) => setForm({ ...form, insuranceDiscount: e.target.value })}
                className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Payment Status</label>
              <select
                value={form.paymentStatus}
                onChange={(e) => setForm({ ...form, paymentStatus: e.target.value })}
                className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <option>Unpaid</option>
                <option>Paid</option>
                <option>Partial</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Payment Method</label>
              <select
                value={form.paymentMethod}
                onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <option>Cash</option>
                <option>UPI / Online</option>
                <option>Card</option>
                <option>Insurance</option>
              </select>
            </div>
          </div>

          <button type="submit" className="w-full py-2.5 rounded-xl bg-medical-600 text-white font-bold text-xs shadow-md">
            Generate Patient Invoice
          </button>
        </form>
      </Modal>

      {/* Upload Sample Invoice Modal */}
      <Modal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} title="Upload Patient Invoice PDF / Document">
        <form onSubmit={handleUploadSampleInvoice} className="space-y-4">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 text-xs">
            <p className="font-semibold mb-1 flex items-center gap-1">
              <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Upload Custom or Sample Invoice
            </p>
            <p>Upload a sample invoice document to attach to patient billing records for instant download in patient portal.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Target Patient Invoice</label>
            <select
              value={targetBillId}
              onChange={(e) => setTargetBillId(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              <option value="">-- Select Invoice --</option>
              {bills.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.invoiceNumber} - {b.patient?.name || 'Rahul Kumar'} (₹{b.totalAmount})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Invoice File (PDF, PNG, JPG)</label>
            <input
              type="file"
              required
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
              onChange={(e) => setUploadFile(e.target.files[0])}
              className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-medical-600 file:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={isUploading}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>{isUploading ? 'Uploading Invoice...' : 'Upload & Save Invoice'}</span>
          </button>
        </form>
      </Modal>

      {/* Edit Bill Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Invoice Details">
        <form onSubmit={handleUpdateBill} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Subtotal (₹)</label>
              <input
                type="number"
                required
                value={editForm.subtotal}
                onChange={(e) => setEditForm({ ...editForm, subtotal: e.target.value })}
                className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Insurance / Discount (₹)</label>
              <input
                type="number"
                value={editForm.insuranceDiscount}
                onChange={(e) => setEditForm({ ...editForm, insuranceDiscount: e.target.value })}
                className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Payment Status</label>
              <select
                value={editForm.paymentStatus}
                onChange={(e) => setEditForm({ ...editForm, paymentStatus: e.target.value })}
                className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <option>Unpaid</option>
                <option>Paid</option>
                <option>Partial</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Payment Method</label>
              <select
                value={editForm.paymentMethod}
                onChange={(e) => setEditForm({ ...editForm, paymentMethod: e.target.value })}
                className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <option>Cash</option>
                <option>UPI / Online</option>
                <option>Card</option>
                <option>Insurance</option>
              </select>
            </div>
          </div>

          <button type="submit" className="w-full py-2.5 rounded-xl bg-medical-600 text-white font-bold text-xs shadow-md">
            Save Invoice Changes
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default BillingPayments;
