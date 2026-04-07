import express from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { protect } from '../middlewares/authMiddleware.js';
import {
  createPortfolio,
  getPortfolio,
  getPortfolioBySlug,
  parseResume,
  unlockTemplate,
} from '../controllers/portfolioController.js';

const router = express.Router();

// ── Multer setup ─────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `resume-${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only PDF and Word documents are supported.'));
  },
});

// ── Routes ───────────────────────────────────────────────
// Parse resume to extract data (returns JSON, does not save portfolio yet)
router.post('/parse-resume', protect, upload.single('resume'), parseResume);

// Create / update portfolio
router.post('/create', protect, upload.single('resume'), createPortfolio);

// Unlock a paid template after payment verification
router.post('/unlock', protect, unlockTemplate);

// Get portfolio by userId (protected)
router.get('/:userId', protect, getPortfolio);

// Get portfolio by public slug (public)
router.get('/public/:slug', getPortfolioBySlug);

export default router;
