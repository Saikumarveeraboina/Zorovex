import express from 'express';
import {
  getCompanyProblems,
  markProblemDone,
  getUserProgress,
} from '../controllers/dsaController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/progress', getUserProgress);
router.get('/:company', getCompanyProblems);
router.post('/progress/mark', markProblemDone);

export default router;
