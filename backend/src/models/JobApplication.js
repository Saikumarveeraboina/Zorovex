import mongoose from 'mongoose';

const jobApplicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    status: {
      type: String,
      enum: ['applied', 'viewed', 'shortlisted', 'rejected'],
      default: 'applied',
    },
  },
  { timestamps: true }
);

// One application per user per job
jobApplicationSchema.index({ userId: 1, jobId: 1 }, { unique: true });

const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);
export default JobApplication;
