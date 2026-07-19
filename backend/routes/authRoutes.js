const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const { signupLimiter, loginLimiter, resendOtpLimiter, forgotPasswordLimiter } = require('../middleware/rateLimiter');

router.post('/signup', signupLimiter, authController.signup);
router.post('/verify-otp', authController.verifyOtp);
router.post('/resend-otp', resendOtpLimiter, authController.resendOtp);
router.post('/login', loginLimiter, authController.login);
router.post('/forgot-password', forgotPasswordLimiter, authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/me', auth, authController.getMe);

module.exports = router;
