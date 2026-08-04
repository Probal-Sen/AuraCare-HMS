const express = require('express');
const router = express.Router();
const { getBills, createBill, processPayment, downloadInvoicePDF } = require('../controllers/billingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getBills);
router.post('/', authorize('Cashier', 'Admin', 'Receptionist'), createBill);
router.post('/:id/pay', authorize('Cashier', 'Admin', 'Patient'), processPayment);
router.get('/:id/pdf', downloadInvoicePDF);

module.exports = router;
