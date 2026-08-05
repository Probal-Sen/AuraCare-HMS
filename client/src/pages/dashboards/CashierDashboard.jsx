import React, { useState, useEffect, useContext } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import StatCard from '../../components/StatCard';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import API, { downloadPdfBlob } from '../../services/api';
import { NotificationContext } from '../../context/NotificationContext';
import { CreditCard, DollarSign, Download, Plus, CheckCircle, ShieldCheck, Upload, FileCheck } from 'lucide-react';

const CashierDashboard = () => {
  const { addToast } = useContext(NotificationContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [bills, setBills] = useState([]);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState('Credit Card');

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const res = await API.get('/bills');
      if (res.data.success) {
        setBills(res.data.bills || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post(`/bills/${selectedBill._id}/pay`, {
        amountPaid: selectedBill.totalAmount,
        paymentMethod,
        notes: 'Payment settled at Cashier counter',
      });

      if (res.data.success) {
        addToast('Payment collected & PDF Invoice updated!', 'success');
        setIsPayModalOpen(false);
        fetchBills();
      }
    } catch (err) {
      addToast('Payment processing failed', 'danger');
    }
  };

  const handleUploadInvoice = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      addToast('Please select a file to upload', 'warning');
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('invoiceFile', uploadFile);

      const billId = selectedBill?._id || (bills[0]?._id || 'sample');
      const res = await API.post(`/bills/${billId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        addToast('Sample invoice file uploaded successfully!', 'success');
        setIsUploadModalOpen(false);
        setUploadFile(null);
        fetchBills();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Invoice upload failed', 'danger');
    } finally {
      setIsUploading(false);
    }
  };

  const downloadInvoice = (billId, invNum) => {
    downloadPdfBlob(`/bills/${billId}/pdf`, `Invoice_${invNum || 'INV-001'}.pdf`);
  };

  const columns = [
    { header: 'Invoice #', accessor: 'invoiceNumber' },
    { header: 'Patient', accessor: 'patient', cell: (r) => r.patient?.name || 'Rahul Kumar' },
    { header: 'Total (₹)', accessor: 'totalAmount', cell: (r) => `₹${r.totalAmount?.toFixed(2)}` },
    { header: 'Paid (₹)', accessor: 'paidAmount', cell: (r) => `₹${r.paidAmount?.toFixed(2)}` },
    {
      header: 'Status',
      accessor: 'paymentStatus',
      cell: (r) => (
        <span className={`px-2 py-0.5 rounded-full font-bold text-xs ${r.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
          {r.paymentStatus}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'action',
      cell: (r) => (
        <div className="flex items-center gap-2">
          {r.paymentStatus !== 'Paid' && (
            <button
              onClick={() => {
                setSelectedBill(r);
                setIsPayModalOpen(true);
              }}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Collect Pay</span>
            </button>
          )}

          <button
            onClick={() => downloadInvoice(r._id || r.invoiceNumber, r.invoiceNumber)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs flex items-center gap-1"
            title="Download PDF Invoice Receipt"
          >
            <Download className="w-3.5 h-3.5" />
            <span>PDF</span>
          </button>

          <button
            onClick={() => {
              setSelectedBill(r);
              setIsUploadModalOpen(true);
            }}
            className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 hover:bg-blue-100 transition-colors"
            title="Upload Custom / Sample Invoice PDF"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  const totalCollected = bills.reduce((acc, b) => acc + (b.paidAmount || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />

      <div className="flex-1 flex">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main className="flex-1 lg:ml-64 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Cashier & Billing Department</h1>
              <p className="text-xs text-slate-500">Itemized billing, insurance discounts, payment terminal, and PDF invoice receipts</p>
            </div>
            <button
              onClick={() => {
                setSelectedBill(bills[0] || null);
                setIsUploadModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-medical-600 hover:bg-medical-700 text-white font-bold text-xs shadow-md flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Sample Invoice</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Cash Collected" value={`₹${totalCollected.toFixed(2)}`} icon={DollarSign} color="emerald" />
            <StatCard title="Unpaid Invoices" value={bills.filter((b) => b.paymentStatus !== 'Paid').length} icon={CreditCard} color="rose" />
            <StatCard title="Insurance Claims" value="3" icon={ShieldCheck} color="purple" />
            <StatCard title="Total Invoices" value={bills.length} icon={CheckCircle} color="blue" />
          </div>

          <DataTable title="Consolidated Patient Invoices & Receipts" columns={columns} data={bills} />
        </main>
      </div>

      {/* Pay Modal */}
      <Modal isOpen={isPayModalOpen} onClose={() => setIsPayModalOpen(false)} title={`Collect Payment for Invoice ${selectedBill?.invoiceNumber}`}>
        <form onSubmit={handleProcessPayment} className="space-y-4">
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs space-y-1">
            <p><strong>Patient Name:</strong> {selectedBill?.patient?.name}</p>
            <p><strong>Total Amount Due:</strong> <span className="text-emerald-600 font-bold">₹{selectedBill?.totalAmount?.toFixed(2)}</span></p>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Select Payment Terminal Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full p-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              <option>Credit Card</option>
              <option>Debit Card</option>
              <option>Cash</option>
              <option>UPI / Online Transfer</option>
              <option>Insurance Direct Claim</option>
            </select>
          </div>

          <button type="submit" className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md">
            Confirm & Print PDF Invoice Receipt
          </button>
        </form>
      </Modal>

      {/* Upload Modal */}
      <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Upload Patient Invoice Document">
        <form onSubmit={handleUploadInvoice} className="space-y-4">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200 text-xs">
            <p className="font-semibold mb-1 flex items-center gap-1">
              <FileCheck className="w-4 h-4 text-blue-600" />
              Attach Custom / Sample Invoice
            </p>
            <p>Upload a sample invoice document for invoice #{selectedBill?.invoiceNumber || bills[0]?.invoiceNumber || 'INV-2026-001'}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Choose Invoice File (PDF / Image)</label>
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
            className="w-full py-2.5 rounded-xl bg-medical-600 hover:bg-medical-700 text-white font-bold text-xs shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>{isUploading ? 'Uploading...' : 'Upload Sample Invoice'}</span>
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default CashierDashboard;
