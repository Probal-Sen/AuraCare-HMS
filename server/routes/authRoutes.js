const express = require('express');
const router = express.Router();
const { login, register, getMe, uploadAvatar } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/login', login);
router.post('/register', register);
router.get('/me', protect, getMe);
router.post('/upload-avatar', protect, upload.single('avatar'), uploadAvatar);

module.exports = router;
