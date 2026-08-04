const express = require('express');
const router = express.Router();
const { getPrescriptions, createPrescription, dispensePrescription, downloadPrescriptionPDF } = require('../controllers/prescriptionController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getPrescriptions);
router.post('/', authorize('Doctor', 'Admin'), createPrescription);
router.put('/:id/dispense', authorize('Pharmacist', 'Admin'), dispensePrescription);
router.get('/:id/pdf', downloadPrescriptionPDF);

module.exports = router;
