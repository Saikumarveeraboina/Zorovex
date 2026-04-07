import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Progress from '../models/Progress.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dsaData = JSON.parse(
  readFileSync(join(__dirname, '../data/dsaProblems.json'), 'utf-8')
);

// @desc  Get problems for a company
// @route GET /api/dsa/:company
export const getCompanyProblems = async (req, res) => {
  try {
    const { company } = req.params;
    const formattedCompany =
      company.charAt(0).toUpperCase() + company.slice(1).toLowerCase();

    // Handle special names
    const companyMap = {
      tcs: 'TCS',
      amazon: 'Amazon',
      google: 'Google',
      microsoft: 'Microsoft',
      flipkart: 'Flipkart',
    };

    const key = companyMap[company.toLowerCase()];
    if (!key || !dsaData[key]) {
      return res.status(404).json({ message: `No problems found for company: ${company}` });
    }

    // Get user's completed problems
    const userProgress = await Progress.find({ userId: req.user._id, company: key });
    const completedIds = new Set(userProgress.map((p) => p.problemId));

    // Attach completed status to each problem
    const enriched = {};
    for (const [topic, problems] of Object.entries(dsaData[key])) {
      enriched[topic] = problems.map((p, index) => ({
        ...p,
        completed: completedIds.has(p.id),
        isLocked: !req.user.isPro && index >= 2,
      }));
    }

    // Calculate stats
    let totalProblems = 0;
    let completedCount = 0;
    const topicStats = {};

    for (const [topic, problems] of Object.entries(enriched)) {
      const done = problems.filter((p) => p.completed).length;
      topicStats[topic] = { total: problems.length, completed: done };
      totalProblems += problems.length;
      completedCount += done;
    }

    res.json({
      company: key,
      topics: enriched,
      stats: {
        total: totalProblems,
        completed: completedCount,
        percentage: totalProblems ? Math.round((completedCount / totalProblems) * 100) : 0,
        topicStats,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Mark a problem as done
// @route POST /api/dsa/progress/mark
export const markProblemDone = async (req, res) => {
  try {
    const { company, topic, problemId } = req.body;

    if (!company || !topic || !problemId) {
      return res.status(400).json({ message: 'company, topic and problemId are required.' });
    }

    // Upsert the progress entry
    const progress = await Progress.findOneAndUpdate(
      { userId: req.user._id, problemId },
      { userId: req.user._id, company, topic, problemId, completedAt: new Date() },
      { upsert: true, new: true }
    );

    res.json({ message: 'Problem marked as done!', progress });
  } catch (error) {
    if (error.code === 11000) {
      return res.json({ message: 'Already marked as done.' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get overall user progress across all companies
// @route GET /api/dsa/progress
export const getUserProgress = async (req, res) => {
  try {
    const progress = await Progress.find({ userId: req.user._id });

    const byCompany = {};
    for (const p of progress) {
      if (!byCompany[p.company]) byCompany[p.company] = 0;
      byCompany[p.company]++;
    }

    // Calculate totals per company
    const totals = {};
    for (const [company, topics] of Object.entries(dsaData)) {
      totals[company] = Object.values(topics).reduce((sum, arr) => sum + arr.length, 0);
    }

    const result = Object.entries(byCompany).map(([company, completed]) => ({
      company,
      completed,
      total: totals[company] || 0,
      percentage: totals[company] ? Math.round((completed / totals[company]) * 100) : 0,
    }));

    const totalCompleted = progress.length;
    const grandTotal = Object.values(totals).reduce((a, b) => a + b, 0);

    res.json({
      byCompany: result,
      totalCompleted,
      grandTotal,
      overallPercentage: grandTotal ? Math.round((totalCompleted / grandTotal) * 100) : 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
