// --- routes/auth.js ---
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.createUser); 
router.post('/login', authController.login);
router.post('/verify-otp', authController.verifyOtp);
router.post('/resend-otp', authController.resendOtp);

module.exports = router;