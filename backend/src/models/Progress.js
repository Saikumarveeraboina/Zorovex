import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    company: {
      type: String,
      required: true,
      enum: ['TCS', 'Amazon', 'Google', 'Microsoft', 'Flipkart'],
    },
    topic: {
      type: String,
      required: true,
    },
    problemId: {
      type: String,
      required: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound unique index — one user can mark a problem done only once
progressSchema.index({ userId: 1, problemId: 1 }, { unique: true });

const Progress = mongoose.model('Progress', progressSchema);
export default Progress;
