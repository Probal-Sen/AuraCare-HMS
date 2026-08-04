const express = require('express');
const router = express.Router();
const { getMedicalRecords, createMedicalRecord } = require('../controllers/medicalRecordController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getMedicalRecords);
router.post('/', authorize('Doctor', 'Admin', 'Nurse'), createMedicalRecord);

module.exports = router;
