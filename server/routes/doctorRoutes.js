const express = require('express');
const router = express.Router();
const { getDoctors, getDoctorById, updateDoctor } = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.put('/:id', protect, authorize('Admin', 'Doctor'), updateDoctor);

module.exports = router;
