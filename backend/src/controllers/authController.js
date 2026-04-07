import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendWelcomeEmail, sendLoginEmail, sendOtpEmail } from '../utils/mailer.js';
import {
  createPendingRegistration,
  getPendingRegistration,
  deletePendingRegistration,
} from '../utils/otpStore.js';

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// @desc  Step 1 — Validate registration data & send OTP
// @route POST /api/auth/send-otp
export const sendOtp = async (req, res, next) => {
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

    const otp = createPendingRegistration(email, { name, password });
    await sendOtpEmail(email, name, otp);

    res.json({ message: `OTP sent to ${email}. Please check your inbox.` });
  } catch (error) {
    next(error);
  }
};

// @desc  Step 2 — Verify OTP and create user account
// @route POST /api/auth/verify-otp
export const verifyOtpAndRegister = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required.' });
    }

    const record = getPendingRegistration(email);
    if (!record) {
      return res.status(400).json({ message: 'OTP expired or not requested. Please register again.' });
    }
    if (Date.now() > record.expiresAt) {
      deletePendingRegistration(email);
      return res.status(400).json({ message: 'OTP has expired. Please register again.' });
    }
    if (record.otp !== otp.trim()) {
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }

    // OTP valid — clean up and create user
    deletePendingRegistration(email);

    const user = await User.create({ name: record.name, email, password: record.password });

    // Send welcome email (non-blocking)
    sendWelcomeEmail(email, record.name);

    res.status(201).json({
      message: 'Email verified! Registration successful.',
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        trialStart: user.trialStart,
        isPro: user.isPro,
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

    // Send login notification email (non-blocking)
    sendLoginEmail(email, user.name);

    res.json({
      message: 'Login successful!',
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        trialStart: user.trialStart,
        isPro: user.isPro,
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
    role: user.role || 'user',
    createdAt: user.createdAt,
  });
};
