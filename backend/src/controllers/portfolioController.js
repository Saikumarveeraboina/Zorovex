import Portfolio from '../models/Portfolio.js';
import { fetchGitHubRepos } from '../services/githubService.js';
import { v4 as uuidv4 } from 'uuid';
import { readFileSync, existsSync } from 'fs';
import path from 'path';

// ── Inline PDF text extractor (avoids ESM/CJS mismatch) ────
async function extractPDFText(filePath) {
  try {
    const { createRequire } = await import('module');
    const require = createRequire(import.meta.url);
    const pdfParse = require('pdf-parse');
    const buffer = readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text || '';
  } catch (err) {
    console.warn('PDF extraction error:', err.message);
    return '';
  }
}

// ── Parse extracted text for profile fields ─────────────────
function parseResumeText(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // Skills extraction — common tech keywords
  const techSkills = [
    'JavaScript','TypeScript','Python','Java','C++','C#','Go','Rust','Swift','Kotlin','PHP','Ruby',
    'React','Next.js','Vue','Angular','Node.js','Express','FastAPI','Django','Spring','Laravel',
    'MongoDB','MySQL','PostgreSQL','Redis','Firebase','Supabase','DynamoDB','SQLite',
    'AWS','GCP','Azure','Docker','Kubernetes','Terraform','CI/CD','Jenkins','GitHub Actions',
    'HTML','CSS','Tailwind','Bootstrap','SASS',
    'REST API','GraphQL','WebSocket','gRPC','Microservices',
    'Machine Learning','Deep Learning','TensorFlow','PyTorch','scikit-learn','Pandas','NumPy',
    'Git','Linux','Bash','PowerShell',
  ];
  const foundSkills = techSkills.filter(s =>
    text.toLowerCase().includes(s.toLowerCase())
  );

  // Email extraction
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : '';

  // Phone extraction
  const phoneMatch = text.match(/(\+?\d[\d\s\-().]{8,17}\d)/);
  const phone = phoneMatch ? phoneMatch[0].trim() : '';

  // GitHub username extraction
  const githubMatch = text.match(/github\.com\/([a-zA-Z0-9_-]+)/i);
  const githubUsername = githubMatch ? githubMatch[1] : '';

  // Name — first non-empty line is often the name
  const name = lines[0] || '';

  // Title/role — look for common titles
  const titleKeywords = ['Developer','Engineer','Designer','Analyst','Manager','Architect','Lead','Intern','Consultant','Scientist'];
  const titleLine = lines.find(l => titleKeywords.some(k => l.includes(k)));
  const title = titleLine || '';

  // Bio — look for summary/about section
  const summaryIdx = lines.findIndex(l => /^(summary|about|profile|objective)/i.test(l));
  let bio = '';
  if (summaryIdx !== -1 && lines[summaryIdx + 1]) {
    bio = lines.slice(summaryIdx + 1, summaryIdx + 4).join(' ');
  }

  // Education extraction
  const eduIdx = lines.findIndex(l => /^education/i.test(l));
  const education = [];
  if (eduIdx !== -1) {
    for (let i = eduIdx + 1; i < Math.min(eduIdx + 8, lines.length); i++) {
      const l = lines[i];
      if (/\b(b\.?tech|m\.?tech|b\.?sc|m\.?sc|mca|bca|bachelor|master|phd|diploma)\b/i.test(l)) {
        education.push({
          institution: lines[i + 1] || '',
          degree: l,
          field: '',
          startYear: '',
          endYear: '',
        });
      }
    }
  }

  return { name, title, bio, email, phone, githubUsername, skills: foundSkills, education };
}

// @desc  Parse resume and return extracted data
// @route POST /api/portfolio/parse-resume
export const parseResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No resume file uploaded.' });
    }

    const text = await extractPDFText(req.file.path);
    if (!text) {
      return res.status(422).json({ message: 'Could not extract text from PDF. Try a text-based PDF.' });
    }

    const parsed = parseResumeText(text);
    const resumeUrl = `/uploads/${req.file.filename}`;

    res.json({ 
      message: 'Resume parsed successfully!',
      data: parsed,
      resumeUrl,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Create or update portfolio
// @route POST /api/portfolio/create
export const createPortfolio = async (req, res) => {
  try {
    const {
      templateId, name, title, bio, email, phone, location,
      skills, education, certificates, githubProjects, githubUsername,
    } = req.body;

    const userId = req.user._id;

    const parsedTemplateId = parseInt(templateId) || 1;
    const parsedSkills       = typeof skills       === 'string' ? JSON.parse(skills)       : skills       || [];
    const parsedEducation    = typeof education    === 'string' ? JSON.parse(education)    : education    || [];
    const parsedCertificates = typeof certificates === 'string' ? JSON.parse(certificates) : certificates || [];
    let   parsedProjects     = typeof githubProjects === 'string' ? JSON.parse(githubProjects) : githubProjects || [];

    // Auto-fetch GitHub repos if username provided and no manual projects
    if (githubUsername && parsedProjects.length === 0) {
      try { parsedProjects = await fetchGitHubRepos(githubUsername); } catch {}
    }

    let resumeUrl = '';
    if (req.file) resumeUrl = `/uploads/${req.file.filename}`;

    // Check if portfolio already exists
    const existing = await Portfolio.findOne({ userId });

    // Generate slug ONLY for new portfolios — never regenerate for existing ones
    const publicSlug = existing?.publicSlug || `${userId.toString().slice(-6)}-${uuidv4().split('-')[0]}`;

    // Build the update payload
    const updateData = {
      userId,
      templateId: parsedTemplateId,
      name, title, bio, email, phone, location,
      skills: parsedSkills,
      education: parsedEducation,
      certificates: parsedCertificates,
      githubProjects: parsedProjects,
      githubUsername,
      isPublished: true,
      publicSlug,           // safe — only truly new if no existing
    };

    if (resumeUrl) updateData.resumeUrl = resumeUrl;

    // Unlock the template if it's template 1 (free)
    if (parsedTemplateId === 1) {
      updateData.$addToSet = { unlockedTemplates: 1 };
    }

    const portfolio = await Portfolio.findOneAndUpdate(
      { userId },
      updateData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({
      message: 'Portfolio saved!',
      portfolio,
      publicUrl: `/p/${portfolio.publicSlug}`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Unlock a template after payment
// @route POST /api/portfolio/unlock
export const unlockTemplate = async (req, res) => {
  try {
    const { templateId, razorpayPaymentId, razorpayOrderId } = req.body;
    const userId = req.user._id;

    if (!templateId || !razorpayPaymentId) {
      return res.status(400).json({ message: 'templateId and razorpayPaymentId required.' });
    }

    const portfolio = await Portfolio.findOneAndUpdate(
      { userId },
      { $addToSet: { unlockedTemplates: parseInt(templateId) } },
      { upsert: true, new: true }
    );

    res.json({ message: `Template ${templateId} unlocked!`, portfolio });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get portfolio by userId
// @route GET /api/portfolio/:userId
export const getPortfolio = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden.' });
    }

    const portfolio = await Portfolio.findOne({ userId });
    if (!portfolio) return res.status(404).json({ message: 'Portfolio not found.' });

    res.json({ portfolio });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get portfolio by slug (public)
// @route GET /api/portfolio/public/:slug
export const getPortfolioBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const portfolio = await Portfolio.findOne({ publicSlug: slug, isPublished: true });
    if (!portfolio) return res.status(404).json({ message: 'Portfolio not found.' });
    res.json({ portfolio });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
