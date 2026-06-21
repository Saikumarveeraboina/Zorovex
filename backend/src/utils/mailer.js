import nodemailer from 'nodemailer';

// ── Dual-mode email transport ─────────────────────────────────
// Production (Render): Uses Brevo SMTP (allowed through Render's network)
// Local dev:           Uses Gmail SMTP directly

const createTransporter = () => {
  // If Brevo SMTP key is set, use Brevo SMTP (works on Render — not blocked like Gmail SMTP)
  if (process.env.BREVO_SMTP_KEY) {
    console.log('[mailer] Using Brevo SMTP transport');
    return nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.BREVO_SMTP_LOGIN, // your Brevo login email
        pass: process.env.BREVO_SMTP_KEY,   // Brevo SMTP key
      },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
    });
  }

  // Warn if running on Render without Brevo — Gmail SMTP will be blocked
  if (process.env.RENDER || process.env.NODE_ENV === 'production') {
    console.warn('⚠️  [mailer] WARNING: No BREVO_SMTP_KEY set! Gmail SMTP is blocked on Render.');
    console.warn('⚠️  [mailer] Set BREVO_SMTP_KEY and BREVO_SMTP_LOGIN in your Render environment.');
  }

  // Local dev — use Gmail SMTP
  const port = parseInt(process.env.EMAIL_PORT || '587');
  console.log(`[mailer] Using Gmail SMTP transport (${process.env.EMAIL_HOST || 'smtp.gmail.com'}:${port})`);
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port,
    secure: port === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  });
};

const getFromAddress = () =>
  process.env.BREVO_SMTP_KEY
    ? process.env.BREVO_FROM || process.env.EMAIL_FROM
    : process.env.EMAIL_FROM;

// ── Startup config check ─────────────────────────────────────
export const verifyEmailConfig = () => {
  const isProduction = process.env.RENDER || process.env.NODE_ENV === 'production';
  if (isProduction && !process.env.BREVO_SMTP_KEY) {
    console.error('┌──────────────────────────────────────────────────────────┐');
    console.error('│  ❌ CRITICAL: BREVO_SMTP_KEY is NOT set!                │');
    console.error('│  Gmail SMTP is BLOCKED on Render.                       │');
    console.error('│  OTP / Welcome / Login emails will ALL FAIL.            │');
    console.error('│                                                         │');
    console.error('│  Fix: Set these in Render Environment Variables:        │');
    console.error('│    BREVO_SMTP_LOGIN = your-brevo-login@email.com        │');
    console.error('│    BREVO_SMTP_KEY   = your-brevo-smtp-key               │');
    console.error('│    BREVO_FROM       = Zorovex <noreply@yourdomain.com>  │');
    console.error('└──────────────────────────────────────────────────────────┘');
  } else if (isProduction) {
    console.log('✅ [mailer] Brevo SMTP configured for production.');
  } else {
    console.log(`✅ [mailer] Gmail SMTP configured for local dev (${process.env.EMAIL_USER || 'NOT SET'})`);
  }
};

// ── Email templates ───────────────────────────────────────────

export const sendOtpEmail = async (email, name, otp) => {
  try {
    const fromAddress = getFromAddress();
    if (!fromAddress) {
      throw new Error('Email FROM address is not configured. Check EMAIL_FROM or BREVO_FROM env var.');
    }
    const transporter = createTransporter();
    await transporter.sendMail({
      from: fromAddress,
      to: email,
      subject: `${otp} is your Zorovex verification code`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f0f; color: #fff; padding: 40px; border-radius: 12px;">
          <h1 style="color: #a78bfa; margin-bottom: 8px;">Verify your email 🔐</h1>
          <p style="color: #e2e8f0; font-size: 16px;">Hi ${name}, use the code below to complete your Zorovex registration.</p>
          <div style="text-align: center; margin: 32px 0;">
            <span style="font-size: 48px; font-weight: 900; letter-spacing: 16px; color: #a78bfa; background: rgba(139,92,246,0.1); padding: 20px 32px; border-radius: 12px; border: 1px solid rgba(139,92,246,0.3);">
              ${otp}
            </span>
          </div>
          <p style="color: #94a3b8; font-size: 14px; text-align: center;">This code expires in <strong style="color: #e2e8f0;">10 minutes</strong>. Do not share it with anyone.</p>
          <p style="color: #a78bfa; font-size: 13px; margin-top: 32px;">— The Zorovex Team</p>
        </div>
      `,
    });
    console.log(`📧 OTP email sent to ${email}`);
  } catch (err) {
    console.error(`❌ [sendOtpEmail] Failed for ${email}:`, err.message);
    console.error(`❌ [sendOtpEmail] Error code: ${err.code || 'N/A'}, command: ${err.command || 'N/A'}`);

    // Give a user-friendly message instead of raw SMTP error
    const isSmtpBlocked = err.code === 'ESOCKET' || err.code === 'ECONNECTION' || err.code === 'ETIMEDOUT' || err.code === 'ECONNREFUSED';
    const userMessage = isSmtpBlocked
      ? 'Email service is temporarily unavailable. Please try again in a few minutes.'
      : 'Failed to send verification email. Please try again.';

    const error = new Error(userMessage);
    error.statusCode = 503;
    throw error;
  }
};

export const sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: getFromAddress(),
      to: email,
      subject: '🎉 Welcome to Zorovex!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f0f; color: #fff; padding: 40px; border-radius: 12px;">
          <h1 style="color: #a78bfa; margin-bottom: 8px;">Welcome to Zorovex, ${name}! 🚀</h1>
          <p style="color: #e2e8f0; font-size: 16px;">Your 30-day free trial has started. You now have access to:</p>
          <ul style="color: #e2e8f0; font-size: 15px; line-height: 2;">
            <li>✅ DSA structured learning paths for top companies</li>
            <li>✅ Progress tracking across topics</li>
            <li>✅ Portfolio builder with 3 professional templates</li>
          </ul>
          <p style="color: #a78bfa; font-size: 14px; margin-top: 24px;">— The Zorovex Team</p>
        </div>
      `,
    });
    console.log(`📧 Welcome email sent to ${email}`);
  } catch (err) {
    console.warn(`⚠️ Failed to send welcome email to ${email}: ${err.message}`);
  }
};

export const sendLoginEmail = async (email, name) => {
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: getFromAddress(),
      to: email,
      subject: '👋 New Login to Zorovex Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f0f; color: #fff; padding: 40px; border-radius: 12px;">
          <h1 style="color: #a78bfa; margin-bottom: 8px;">Hey ${name}, you just logged in! 👋</h1>
          <p style="color: #e2e8f0; font-size: 16px;">We noticed a new login to your Zorovex account.</p>
          <p style="color: #e2e8f0; font-size: 15px;">If this was you, no action is needed. If you did not log in, please reset your password immediately.</p>
          <p style="color: #a78bfa; font-size: 14px; margin-top: 24px;">— The Zorovex Team</p>
        </div>
      `,
    });
    console.log(`📧 Login notification sent to ${email}`);
  } catch (err) {
    console.warn(`⚠️ Failed to send login email to ${email}: ${err.message}`);
  }
};

export const sendPasswordResetEmail = async (email, name, resetUrl) => {
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: getFromAddress(),
      to: email,
      subject: '🔑 Reset your Zorovex password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f0f; color: #fff; padding: 40px; border-radius: 12px;">
          <h1 style="color: #a78bfa; margin-bottom: 8px;">Password Reset Request 🔑</h1>
          <p style="color: #e2e8f0; font-size: 16px;">Hi ${name}, we received a request to reset your Zorovex password.</p>
          <p style="color: #94a3b8; font-size: 14px;">Click the button below to set a new password. This link expires in <strong style="color: #e2e8f0;">15 minutes</strong>.</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}" style="display: inline-block; padding: 14px 36px; background: linear-gradient(135deg, #7c3aed, #6d28d9); color: #fff; text-decoration: none; border-radius: 10px; font-size: 16px; font-weight: 700;">Reset Password</a>
          </div>
          <p style="color: #64748b; font-size: 13px; text-align: center;">If you didn't request this, you can safely ignore this email. Your password won't change.</p>
          <p style="color: #475569; font-size: 12px; text-align: center; margin-top: 8px; word-break: break-all;">Or copy this link: <a href="${resetUrl}" style="color: #a78bfa;">${resetUrl}</a></p>
          <p style="color: #a78bfa; font-size: 13px; margin-top: 32px;">— The Zorovex Team</p>
        </div>
      `,
    });
    console.log(`📧 Password reset email sent to ${email}`);
  } catch (err) {
    console.warn(`⚠️ Failed to send reset email to ${email}: ${err.message}`);
    throw err;
  }
};
