import nodemailer from 'nodemailer';

// ── Dual-mode email transport ─────────────────────────────────
// Production (Render): Uses Brevo SMTP
// Local dev:           Uses Gmail SMTP

const createTransporter = () => {
  if (process.env.BREVO_SMTP_KEY) {
    return nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.BREVO_SMTP_LOGIN,
        pass: process.env.BREVO_SMTP_KEY,
      },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
    });
  }

  const port = parseInt(process.env.EMAIL_PORT || '587');
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

// ── Welcome Email ─────────────────────────────────────────────

export const sendWelcomeEmail = async (email, name) => {
  try {
    const fromAddress = getFromAddress();
    if (!fromAddress) {
      console.warn('⚠️ [mailer] No FROM address configured, skipping welcome email.');
      return;
    }
    const transporter = createTransporter();
    await transporter.sendMail({
      from: fromAddress,
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
    // Non-blocking — don't throw, registration should still succeed
  }
};
