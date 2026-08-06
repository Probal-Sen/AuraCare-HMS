const express = require('express');
const router = express.Router();
const { getLabReports, createLabReport, uploadLabResult, updateLabReport, deleteLabReport } = require('../controllers/labController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router.get('/reports', getLabReports);
router.post('/reports', authorize('Doctor', 'Lab Assistant', 'Admin'), createLabReport);
router.put('/reports/:id/upload', authorize('Lab Assistant', 'Admin'), upload.single('reportFile'), uploadLabResult);
router.put('/reports/:id', authorize('Doctor', 'Lab Assistant', 'Admin'), updateLabReport);
router.delete('/reports/:id', authorize('Doctor', 'Lab Assistant', 'Admin'), deleteLabReport);

module.exports = router;
