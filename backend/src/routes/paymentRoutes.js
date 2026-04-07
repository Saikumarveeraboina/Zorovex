import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { createOrder, verifyPayment, createProOrder, verifyProPayment } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/create-order', protect, createOrder);
router.post('/verify',       protect, verifyPayment);

router.post('/create-pro-order', protect, createProOrder);
router.post('/verify-pro',       protect, verifyProPayment);

export default router;
