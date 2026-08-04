const express = require('express');
const router = express.Router();
const { getAdminDashboard, getDoctorDashboard, getPatientDashboard, getGenericRoleDashboard } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/admin', authorize('Admin'), getAdminDashboard);
router.get('/doctor', authorize('Doctor', 'Admin'), getDoctorDashboard);
router.get('/patient', getPatientDashboard);

// Additional role dashboards
router.get('/receptionist', getGenericRoleDashboard);
router.get('/nurse', getGenericRoleDashboard);
router.get('/lab', getGenericRoleDashboard);
router.get('/pharmacist', getGenericRoleDashboard);
router.get('/cashier', getGenericRoleDashboard);

module.exports = router;
