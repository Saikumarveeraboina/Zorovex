import nodemailer from 'nodemailer';
import { Resend } from 'resend';

// ── Dual-mode email transport ─────────────────────────────────
// Production (Render): Uses Resend HTTP API (SMTP ports are blocked)
// Local dev:           Uses nodemailer SMTP (Gmail)

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const createTransporter = () => {
  const port = parseInt(process.env.EMAIL_PORT || '587');
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port,
    secure: port === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
};

/**
 * Send an email using Resend (production) or nodemailer (local dev).
 */
const sendEmail = async ({ to, subject, html }) => {
  if (resend) {
    // Production — use Resend HTTP API
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM || 'Zorovex <onboarding@resend.dev>',
      to,
      subject,
      html,
    });
    if (error) throw new Error(error.message);
  } else {
    // Local dev — use nodemailer SMTP
    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
  }
};

// ── Email templates ───────────────────────────────────────────

export const sendOtpEmail = async (email, name, otp) => {
  try {
    await sendEmail({
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
    console.warn(`⚠️ Failed to send OTP email to ${email}: ${err.message}`);
    throw err;
  }
};

export const sendWelcomeEmail = async (email, name) => {
  try {
    await sendEmail({
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
    await sendEmail({
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
    await sendEmail({
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
