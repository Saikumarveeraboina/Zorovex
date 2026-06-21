import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendWelcomeEmail } from '../utils/mailer.js';

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// @desc  Register new user
// @route POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    const user = await User.create({ name, email, password });

    // Send welcome email (non-blocking — won't fail registration)
    sendWelcomeEmail(email, name);

    res.status(201).json({
      message: 'Registration successful!',
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        trialStart: user.trialStart,
        isPro: user.isPro,
        proTrialEnd: user.proTrialEnd,
        role: user.role || 'user',
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Login user
// @route POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    res.json({
      message: 'Login successful!',
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        trialStart: user.trialStart,
        isPro: user.isPro,
        proTrialEnd: user.proTrialEnd,
        role: user.role || 'user',
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get user profile
// @route GET /api/auth/profile
export const getProfile = async (req, res) => {
  const user = req.user;
  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    trialStart: user.trialStart,
    isPro: user.isPro,
    proTrialEnd: user.proTrialEnd,
    role: user.role || 'user',
    createdAt: user.createdAt,
  });
};
