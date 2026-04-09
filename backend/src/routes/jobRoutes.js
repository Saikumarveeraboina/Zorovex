import express from 'express';
import { protect, admin } from '../middlewares/authMiddleware.js';
import {
  createJob,
  updateJob,
  deleteJob,
  getAdminJobs,
  getJobs,
  applyJob,
  getMyApplications,
} from '../controllers/jobController.js';

const router = express.Router();

// ── Static paths FIRST (before :id params) ────────────

// Admin: list all jobs with application counts
router.get('/admin/all', protect, admin, getAdminJobs);

// User: get my applications
router.get('/my-applications', protect, getMyApplications);

// Public (optionally authenticated for application status)
router.get('/', (req, res, next) => {
  // Try to authenticate but don't fail if no token
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer')) {
    return protect(req, res, () => getJobs(req, res));
  }
  getJobs(req, res);
});

// Admin: Create job
router.post('/', protect, admin, createJob);

// ── Dynamic :id paths LAST ────────────────────────────
router.post('/:id/apply', protect, applyJob);
router.put('/:id', protect, admin, updateJob);
router.delete('/:id', protect, admin, deleteJob);

export default router;
