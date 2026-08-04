const express = require('express');
const router = express.Router();
const { getPatients, createPatient, getPatientById, updatePatient, deletePatient } = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getPatients);
router.get('/:id', getPatientById);
router.post('/', authorize('Admin', 'Receptionist', 'Doctor', 'Nurse'), createPatient);
router.put('/:id', authorize('Admin', 'Receptionist', 'Doctor', 'Nurse', 'Patient'), updatePatient);
router.delete('/:id', authorize('Admin'), deletePatient);

module.exports = router;
