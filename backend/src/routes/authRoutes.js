import express from 'express';
import { sendOtp, verifyOtpAndRegister, login, getProfile } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/send-otp', sendOtp);           // Step 1: validate & send OTP
router.post('/verify-otp', verifyOtpAndRegister); // Step 2: verify OTP & create account
router.post('/login', login);
router.get('/profile', protect, getProfile);

export default router;
