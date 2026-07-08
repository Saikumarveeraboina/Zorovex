import express from 'express';
import { sendContactMessage, getContactMessages, markMessageRead, deleteContactMessage } from '../controllers/contactController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public — submit contact form
router.post('/', sendContactMessage);

// Admin — manage messages
router.get('/messages', protect, admin, getContactMessages);
router.patch('/messages/:id/read', protect, admin, markMessageRead);
router.delete('/messages/:id', protect, admin, deleteContactMessage);

export default router;
