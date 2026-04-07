import Razorpay from 'razorpay';
import crypto from 'crypto';
import User from '../models/User.js';
import Settings from '../models/Settings.js';
import Coupon from '../models/Coupon.js';

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID     || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder',
});

// Template pricing in paise (INR × 100)
const TEMPLATE_PRICES = {
  2: { amount: 4900,  label: 'Minimal Template — ₹49'  },
  3: { amount: 9900,  label: 'Pro Template — ₹99' },
};

// @desc  Create Razorpay order for a template purchase
// @route POST /api/payment/create-order
export const createOrder = async (req, res) => {
  try {
    const { templateId } = req.body;
    const tplId = parseInt(templateId);

    const pricing = TEMPLATE_PRICES[tplId];
    if (!pricing) {
      return res.status(400).json({ message: `Template ${templateId} is free or invalid.` });
    }

    const options = {
      amount:   pricing.amount,
      currency: 'INR',
      receipt:  `receipt_tpl${tplId}_${Date.now()}`,
      notes: {
        templateId: String(tplId),
        userId:     req.user._id.toString(),
      },
    };

    const order = await razorpay.orders.create(options);

    res.json({
      orderId:  order.id,
      amount:   order.amount,
      currency: order.currency,
      keyId:    process.env.RAZORPAY_KEY_ID,
      label:    pricing.label,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Payment order creation failed.' });
  }
};

// @desc  Verify Razorpay payment signature
// @route POST /api/payment/verify
export const verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const body       = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expected   = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(body)
      .digest('hex');

    if (expected !== razorpaySignature) {
      return res.status(400).json({ message: 'Invalid payment signature.' });
    }

    res.json({ message: 'Payment verified!', paymentId: razorpayPaymentId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Create Razorpay order for PRO Upgrade
// @route POST /api/payment/create-pro-order
export const createProOrder = async (req, res) => {
  try {
    const { couponCode } = req.body || {};
    
    let settings = await Settings.findOne();
    let basePrice = settings ? settings.proPrice : 199;
    
    let discount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon) discount = coupon.discountPercentage;
    }
    
    let finalPrice = basePrice * (1 - discount / 100);
    const amountInPaise = Math.round(finalPrice * 100);

    if (amountInPaise < 100) {
      await User.findByIdAndUpdate(req.user._id, { isPro: true });
      return res.json({
        orderId: 'FREE_UPGRADE',
        amount: 0,
        currency: 'INR',
        keyId: process.env.RAZORPAY_KEY_ID,
        label: `Pro Upgrade — ₹0`,
        freeUpgrade: true,
      });
    }

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_pro_${Date.now()}`,
      notes: {
        type: 'pro_upgrade',
        userId: req.user._id.toString(),
      },
    };

    const order = await razorpay.orders.create(options);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      label: `Pro Upgrade — ₹${finalPrice}`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Pro payment order creation failed.' });
  }
};

// @desc  Verify Razorpay payment signature for PRO Upgrade
// @route POST /api/payment/verify-pro
export const verifyProPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(body)
      .digest('hex');

    if (expected !== razorpaySignature) {
      return res.status(400).json({ message: 'Invalid payment signature.' });
    }

    // Mark user as Pro
    await User.findByIdAndUpdate(req.user._id, { isPro: true });

    res.json({ message: 'Pro upgrade successful!', paymentId: razorpayPaymentId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
