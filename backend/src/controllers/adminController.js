import Settings from '../models/Settings.js';
import Coupon from '../models/Coupon.js';
import User from '../models/User.js';
import { sendWelcomeEmail } from '../utils/mailer.js';

export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({ proPrice: 199 });
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProPrice = async (req, res) => {
  try {
    const { price } = req.body;
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({ proPrice: price });
    else {
      settings.proPrice = price;
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCoupon = async (req, res) => {
  try {
    const { code, discountPercentage } = req.body;
    const coupon = await Coupon.create({ code, discountPercentage });
    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: 'Coupon deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: 'Coupon code required' });
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) return res.status(404).json({ message: 'Invalid or inactive coupon code' });
    res.json({ discountPercentage: coupon.discountPercentage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendBulkWelcomeMails = async (req, res) => {
  try {
    const users = await User.find({}, 'name email');
    if (!users.length) {
      return res.json({ message: 'No users found in database.', sent: 0 });
    }

    // Send emails concurrently (non-blocking per user, but wait for all)
    await Promise.all(users.map((u) => sendWelcomeEmail(u.email, u.name)));

    console.log(`📢 Bulk welcome emails sent to ${users.length} users.`);
    res.json({ message: `Welcome emails sent to ${users.length} user(s)!`, sent: users.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
