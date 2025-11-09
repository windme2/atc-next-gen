const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authController = require('../controllers/auth.controller');

// Public routes (ไม่ต้อง JWT)
router.post('/login', authController.login);
router.post('/register', authController.register);

// Protected routes (ต้องมี JWT)
router.get('/profile', auth, authController.profile);

module.exports = router;