import nodemailer from 'nodemailer';

const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

export const sendOtpEmail = async (email, name, otp) => {
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
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
    throw err; // Re-throw so the controller can respond with an error
  }
};

export const sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
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
      from: process.env.EMAIL_FROM,
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
