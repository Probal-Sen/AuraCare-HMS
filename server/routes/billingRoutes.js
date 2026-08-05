const express = require('express');
const router = express.Router();
const { getBills, createBill, processPayment, downloadInvoicePDF, uploadInvoiceFile } = require('../controllers/billingController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router.get('/', getBills);
router.post('/', authorize('Cashier', 'Admin', 'Receptionist'), createBill);
router.post('/:id/pay', authorize('Cashier', 'Admin', 'Patient'), processPayment);
router.post('/:id/upload', upload.single('invoiceFile'), uploadInvoiceFile);
router.post('/upload-sample', upload.single('invoiceFile'), uploadInvoiceFile);
router.get('/:id/pdf', downloadInvoicePDF);

module.exports = router;
