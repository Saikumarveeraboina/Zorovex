import Job from '../models/Job.js';
import JobApplication from '../models/JobApplication.js';

// ── Admin: Create a new job ────────────────────────────
// @route POST /api/jobs (admin only)
export const createJob = async (req, res) => {
  try {
    const { title, company, type, description, location, salary, experience, skills, applyLink, deadline } = req.body;

    if (!title || !company || !type) {
      return res.status(400).json({ message: 'Title, company, and type are required.' });
    }
    if (!['walkin', 'offcampus'].includes(type)) {
      return res.status(400).json({ message: 'Type must be walkin or offcampus.' });
    }

    const parsedSkills = typeof skills === 'string' ? JSON.parse(skills) : skills || [];

    const job = await Job.create({
      title,
      company,
      type,
      description: description || '',
      location: location || '',
      salary: salary || '',
      experience: experience || 'Fresher',
      skills: parsedSkills,
      applyLink: applyLink || '',
      deadline: deadline || null,
      isActive: true,
      postedBy: req.user._id,
    });

    res.status(201).json({ message: 'Job posted!', job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Admin: Update a job ────────────────────────────────
// @route PUT /api/jobs/:id (admin only)
export const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found.' });

    const fields = ['title', 'company', 'type', 'description', 'location', 'salary', 'experience', 'applyLink', 'deadline', 'isActive'];
    fields.forEach(f => { if (req.body[f] !== undefined) job[f] = req.body[f]; });

    if (req.body.skills) {
      job.skills = typeof req.body.skills === 'string' ? JSON.parse(req.body.skills) : req.body.skills;
    }

    await job.save();
    res.json({ message: 'Job updated!', job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Admin: Delete a job ────────────────────────────────
// @route DELETE /api/jobs/:id (admin only)
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found.' });

    // Also delete all applications for this job
    await JobApplication.deleteMany({ jobId: req.params.id });

    res.json({ message: 'Job deleted.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Admin: Get all jobs with application counts ────────
// @route GET /api/jobs/admin/all (admin only)
export const getAdminJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 }).lean();

    // Attach application count to each job
    const jobIds = jobs.map(j => j._id);
    const appCounts = await JobApplication.aggregate([
      { $match: { jobId: { $in: jobIds } } },
      { $group: { _id: '$jobId', count: { $sum: 1 } } },
    ]);
    const countMap = {};
    appCounts.forEach(a => { countMap[a._id.toString()] = a.count; });

    const enriched = jobs.map(j => ({
      ...j,
      applicationCount: countMap[j._id.toString()] || 0,
    }));

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Public: List active jobs ───────────────────────────
// @route GET /api/jobs
export const getJobs = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = { isActive: true };
    if (type && ['walkin', 'offcampus'].includes(type)) filter.type = type;

    const jobs = await Job.find(filter)
      .sort({ createdAt: -1 })
      .select('-postedBy')
      .lean();

    // If user is authenticated, attach their application status
    if (req.user) {
      const applications = await JobApplication.find({
        userId: req.user._id,
        jobId: { $in: jobs.map(j => j._id) },
      });
      const appliedMap = {};
      applications.forEach(a => { appliedMap[a.jobId.toString()] = a.status; });

      jobs.forEach(j => {
        j.applicationStatus = appliedMap[j._id.toString()] || null;
      });
    }

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Pro user: Apply for a job ──────────────────────────
// @route POST /api/jobs/:id/apply (pro only, NO trial)
export const applyJob = async (req, res) => {
  try {
    // Only paid Pro users — trial does NOT count
    if (!req.user.isPro) {
      return res.status(403).json({
        message: 'Only Pro members can apply to jobs. Upgrade to Pro to unlock this feature.',
      });
    }

    const job = await Job.findById(req.params.id);
    if (!job || !job.isActive) {
      return res.status(404).json({ message: 'Job not found or no longer active.' });
    }

    // Check if deadline has passed
    if (job.deadline && new Date(job.deadline) < new Date()) {
      return res.status(400).json({ message: 'Application deadline has passed.' });
    }

    // Check if already applied
    const existing = await JobApplication.findOne({ userId: req.user._id, jobId: job._id });
    if (existing) {
      return res.status(400).json({ message: 'You have already applied to this job.' });
    }

    const application = await JobApplication.create({
      userId: req.user._id,
      jobId: job._id,
    });

    res.status(201).json({ message: 'Application submitted!', application });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already applied to this job.' });
    }
    res.status(500).json({ message: error.message });
  }
};

// ── Pro user: Get my applications ──────────────────────
// @route GET /api/jobs/my-applications
export const getMyApplications = async (req, res) => {
  try {
    const applications = await JobApplication.find({ userId: req.user._id })
      .populate('jobId', 'title company type location salary deadline isActive')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
