const express = require('express');
const router = express.Router();
const { getMedicines, addMedicine, updateMedicine, deleteMedicine } = require('../controllers/pharmacyController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/medicines', getMedicines);
router.post('/medicines', authorize('Pharmacist', 'Admin'), addMedicine);
router.put('/medicines/:id', authorize('Pharmacist', 'Admin'), updateMedicine);
router.delete('/medicines/:id', authorize('Pharmacist', 'Admin'), deleteMedicine);

module.exports = router;
