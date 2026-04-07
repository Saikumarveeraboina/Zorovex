import mongoose from 'mongoose';

const portfolioSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    templateId: {
      type: Number,
      required: true,
      enum: [1, 2, 3],
      default: 1,
    },
    // Payment status per template
    unlockedTemplates: {
      type: [Number],
      default: [1], // Template 1 is always free
    },
    name:     { type: String, default: '' },
    title:    { type: String, default: '' },
    bio:      { type: String, default: '' },
    email:    { type: String, default: '' },
    phone:    { type: String, default: '' },
    location: { type: String, default: '' },
    skills:   [{ type: String }],
    education: [{
      institution: String,
      degree:      String,
      field:       String,
      startYear:   String,
      endYear:     String,
    }],
    certificates: [{
      name:   String,
      issuer: String,
      year:   String,
      link:   String,
    }],
    githubProjects: [{
      name:        String,
      description: String,
      link:        String,
      stars:       Number,
      language:    String,
    }],
    githubUsername: { type: String, default: '' },
    resumeUrl:      { type: String, default: '' },
    isPublished:    { type: Boolean, default: false },
    // Unique slug — set ONCE at creation, never overwritten
    publicSlug: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

const Portfolio = mongoose.model('Portfolio', portfolioSchema);
export default Portfolio;
