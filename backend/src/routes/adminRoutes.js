import express from 'express';
import { protect, admin } from '../middlewares/authMiddleware.js';
import { getSettings, updateProPrice, getCoupons, createCoupon, deleteCoupon, validateCoupon, sendBulkWelcomeMails } from '../controllers/adminController.js';

const router = express.Router();

// Public / Protected non-admin reading routes
router.get('/settings', getSettings);
router.post('/validate-coupon', protect, validateCoupon);

// Admin only routes
router.put('/settings/price', protect, admin, updateProPrice);
router.get('/coupons', protect, admin, getCoupons);
router.post('/coupons', protect, admin, createCoupon);
router.delete('/coupons/:id', protect, admin, deleteCoupon);

// Bulk email
router.post('/send-welcome-mails', protect, admin, sendBulkWelcomeMails);

export default router;
