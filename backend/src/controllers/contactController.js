import nodemailer from 'nodemailer';
import axios from 'axios';

const RECEIVER_EMAIL = 'support.zorovex@gmail.com';

// ── Resend HTTP API (works on Render — no SMTP ports needed) ──
const sendViaResend = async ({ from, to, replyTo, subject, html }) => {
  // Resend requires a verified domain for custom 'from' addresses.
  // Without domain verification, use onboarding@resend.dev
  const resendFrom = process.env.RESEND_FROM || 'Zorovex <onboarding@resend.dev>';
  // Without verified domain, Resend only allows sending to account owner email
  const resendTo = process.env.RESEND_TO || to;

  console.log(`[Contact] Resend payload: from=${resendFrom}, to=${resendTo}`);

  const res = await axios.post(
    'https://api.resend.com/emails',
    { from: resendFrom, to: [resendTo], reply_to: [replyTo], subject, html },
    {
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    }
  );
  return res.data;
};

// ── Gmail SMTP (works locally) ────────────────────────────────
const sendViaGmail = async ({ from, to, replyTo, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  const info = await transporter.sendMail({ from, to, replyTo, subject, html });
  return { id: info.messageId };
};

// ── Contact form handler ──────────────────────────────────────
export const sendContactMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, and message are required' });
    }

    // Log available providers (no secrets)
    console.log('[Contact] Environment check:', {
      hasResendKey: !!process.env.RESEND_API_KEY,
      hasResendFrom: !!process.env.RESEND_FROM,
      hasEmailUser: !!process.env.EMAIL_USER,
      hasEmailPass: !!process.env.EMAIL_PASS,
      hasReceiverEmail: !!process.env.RECEIVER_EMAIL,
    });

    const toAddress = process.env.RECEIVER_EMAIL || RECEIVER_EMAIL;
    const emailPayload = {
      from: process.env.RESEND_FROM || process.env.EMAIL_FROM || `"${name}" <${process.env.EMAIL_USER}>`,
      to: toAddress,
      replyTo: email,
      subject: `New Contact Request: ${subject || 'No Subject'} - ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #333; border-bottom: 2px solid #a78bfa; padding-bottom: 10px;">New Contact Request</h2>
          <p>You have received a new contact message from Zorovex.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; width: 100px;">Name</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Email</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Subject</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${subject || 'N/A'}</td>
            </tr>
          </table>

          <div style="margin-top: 20px;">
            <p style="font-weight: bold; margin-bottom: 5px;">Message:</p>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; border-left: 4px solid #a78bfa;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
        </div>
      `,
    };

    let result;
    const errors = [];

    // Strategy 1: Resend API (best for production — HTTP-based, no SMTP port issues)
    if (process.env.RESEND_API_KEY) {
      console.log(`[Contact] 📧 Using Resend API → sending to ${toAddress}`);
      try {
        result = await sendViaResend(emailPayload);
        console.log(`[Contact] ✅ Resend success. ID: ${result.id}`);
        return res.status(200).json({ success: true, message: 'Message sent successfully' });
      } catch (resendErr) {
        const resendError = resendErr.response?.data || resendErr.message;
        console.error('[Contact] ❌ Resend failed:', resendError);
        errors.push({ provider: 'Resend', error: resendError });
        // Fall through to Gmail
      }
    }

    // Strategy 2: Gmail SMTP (fallback / local dev)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      console.log(`[Contact] 📧 Using Gmail SMTP → sending to ${toAddress}`);
      // For Gmail SMTP, from must be the authenticated user
      emailPayload.from = process.env.EMAIL_FROM || `"${name}" <${process.env.EMAIL_USER}>`;
      try {
        result = await sendViaGmail(emailPayload);
        console.log(`[Contact] ✅ Gmail success. MessageId: ${result.id}`);
        return res.status(200).json({ success: true, message: 'Message sent successfully' });
      } catch (gmailErr) {
        console.error('[Contact] ❌ Gmail SMTP failed:', gmailErr.message);
        errors.push({ provider: 'Gmail', error: gmailErr.message });
      }
    }

    // Both methods failed or no credentials
    console.error('[Contact] ❌ All email methods failed. Errors:', errors);
    return res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.',
      debug: errors,
    });
  } catch (error) {
    console.error('[Contact] ❌ Unexpected error:', error.message);
    console.error('[Contact] Stack:', error.stack);
    res.status(500).json({ success: false, message: 'Failed to send message', error: error.message });
  }
};
