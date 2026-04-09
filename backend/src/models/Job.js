import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['walkin', 'offcampus'],
      required: [true, 'Job type is required'],
    },
    description: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: '',
    },
    salary: {
      type: String,
      default: '',
    },
    experience: {
      type: String,
      default: 'Fresher',
    },
    skills: [{ type: String }],
    applyLink: {
      type: String,
      default: '',
    },
    deadline: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Index for fast queries
jobSchema.index({ type: 1, isActive: 1, createdAt: -1 });

const Job = mongoose.model('Job', jobSchema);
export default Job;
