import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { sendWelcomeEmail, sendLoginEmail, sendOtpEmail, sendPasswordResetEmail } from '../utils/mailer.js';
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
    console.log(`[send-otp] Generated OTP for ${email}, attempting to send email...`);
    await sendOtpEmail(email, name, otp);
    console.log(`[send-otp] ✅ OTP email sent successfully to ${email}`);

    res.json({ message: `OTP sent to ${email}. Please check your inbox.` });
  } catch (error) {
    console.error(`[send-otp] ❌ Failed:`, error.message);
    console.error(`[send-otp] Error code:`, error.code);
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

// @desc  Forgot password — send reset link
// @route POST /api/auth/forgot-password
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    const user = await User.findOne({ email });
    // Always return success to avoid email enumeration
    if (!user) {
      return res.json({ message: 'If that email exists, a reset link has been sent.' });
    }

    // Generate secure random token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 min
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;
    await sendPasswordResetEmail(email, user.name, resetUrl);

    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (error) {
    next(error);
  }
};

// @desc  Reset password — verify token & update
// @route POST /api/auth/reset-password
export const resetPassword = async (req, res, next) => {
  try {
    const { email, token, password } = req.body;
    if (!email || !token || !password) {
      return res.status(400).json({ message: 'Email, token and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      email,
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Reset link is invalid or has expired.' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful! You can now sign in.' });
  } catch (error) {
    next(error);
  }
};
