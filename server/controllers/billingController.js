const Bill = require('../models/Bill');
const Payment = require('../models/Payment');
const Patient = require('../models/Patient');
const { generateInvoicePDF } = require('../utils/pdfGenerator');
const { mockDb } = require('../utils/seedData');

// @desc Get bills with status & patient filter
// @route GET /api/bills
exports.getBills = async (req, res) => {
  try {
    const { patientId, paymentStatus } = req.query;

    if (req.isMockDb) {
      let filtered = [...mockDb.bills];
      if (patientId) filtered = filtered.filter((b) => b.patient === patientId);
      if (paymentStatus) filtered = filtered.filter((b) => b.paymentStatus === paymentStatus);

      const populated = filtered.map((b) => {
        const patient = mockDb.patients.find((p) => p._id === b.patient) || { name: 'John Doe', patientId: 'PAT-8001' };
        return { ...b, patient };
      });

      return res.status(200).json({ success: true, count: populated.length, bills: populated });
    }

    let query = {};
    if (patientId) query.patient = patientId;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const bills = await Bill.find(query)
      .populate('patient', 'name patientId phone email age gender address')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: bills.length, bills });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Generate new consolidated bill
// @route POST /api/bills
exports.createBill = async (req, res) => {
  try {
    const { patientId, appointmentId, items, discountPercent, insuranceDiscount, notes } = req.body;

    if (!patientId || !items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Patient and bill items are required' });
    }

    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const subtotal = items.reduce((acc, item) => acc + (Number(item.amount) || Number(item.quantity) * Number(item.unitPrice)), 0);
    const disc = Number(insuranceDiscount || 0) + (subtotal * (Number(discountPercent || 0) / 100));
    const totalAmount = Math.max(0, subtotal - disc);

    const newBill = {
      _id: `66b1000${Date.now()}`,
      invoiceNumber,
      patient: patientId,
      appointment: appointmentId || null,
      items,
      subtotal,
      discountPercent: Number(discountPercent || 0),
      insuranceDiscount: Number(insuranceDiscount || 0),
      totalAmount,
      paidAmount: 0,
      paymentStatus: 'Unpaid',
      paymentMethod: 'Pending',
      notes: notes || '',
      createdAt: new Date(),
    };

    if (req.isMockDb) {
      mockDb.bills.push(newBill);
      return res.status(201).json({ success: true, bill: newBill });
    }

    const bill = await Bill.create(newBill);
    res.status(201).json({ success: true, bill });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Process Payment for a bill (Cash / Card / UPI / Online)
// @route POST /api/bills/:id/pay
exports.processPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amountPaid, paymentMethod, notes } = req.body;

    if (!amountPaid || !paymentMethod) {
      return res.status(400).json({ success: false, message: 'Payment amount and method are required' });
    }

    const transactionId = `TXN-${Date.now()}`;

    if (req.isMockDb) {
      const idx = mockDb.bills.findIndex((b) => b._id === id || b.invoiceNumber === id);
      if (idx !== -1) {
        mockDb.bills[idx].paidAmount = (mockDb.bills[idx].paidAmount || 0) + Number(amountPaid);
        mockDb.bills[idx].paymentMethod = paymentMethod;
        if (mockDb.bills[idx].paidAmount >= mockDb.bills[idx].totalAmount) {
          mockDb.bills[idx].paymentStatus = 'Paid';
        } else {
          mockDb.bills[idx].paymentStatus = 'Partially Paid';
        }

        return res.status(200).json({
          success: true,
          message: 'Payment processed successfully',
          bill: mockDb.bills[idx],
          transactionId,
        });
      }
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    const bill = await Bill.findById(id);
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });

    bill.paidAmount = (bill.paidAmount || 0) + Number(amountPaid);
    bill.paymentMethod = paymentMethod;
    if (bill.paidAmount >= bill.totalAmount) {
      bill.paymentStatus = 'Paid';
    } else {
      bill.paymentStatus = 'Partially Paid';
    }
    await bill.save();

    await Payment.create({
      transactionId,
      bill: bill._id,
      patient: bill.patient,
      amountPaid: Number(amountPaid),
      paymentMethod,
      receivedBy: req.user ? req.user.name : 'Cashier',
      notes: notes || '',
    });

    res.status(200).json({ success: true, message: 'Payment processed successfully', bill, transactionId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Download PDF Invoice
// @route GET /api/bills/:id/pdf
exports.downloadInvoicePDF = async (req, res) => {
  try {
    const { id } = req.params;

    let bill, patient;

    if (req.isMockDb) {
      bill = mockDb.bills.find((b) => b._id === id || b.invoiceNumber === id) || mockDb.bills[0];
      const patientIdStr = bill && typeof bill.patient === 'object' ? bill.patient._id : bill?.patient;
      patient = mockDb.patients.find((p) => p._id === patientIdStr || p.patientId === patientIdStr) || { name: 'John Doe', patientId: 'PAT-8001', age: 38, gender: 'Male', phone: '+1 555-0108' };
    } else {
      bill = await Bill.findById(id).populate('patient');
      if (!bill) return res.status(404).json({ success: false, message: 'Bill invoice not found' });
      patient = bill.patient || { name: 'John Doe', patientId: 'PAT-8001' };
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Invoice_${bill?.invoiceNumber || 'INV-001'}.pdf`);

    generateInvoicePDF(bill || {}, patient || {}, res);
  } catch (error) {
    console.error('Download invoice PDF error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
