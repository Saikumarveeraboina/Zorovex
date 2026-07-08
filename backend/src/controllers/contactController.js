import ContactMessage from '../models/ContactMessage.js';
import nodemailer from 'nodemailer';
import axios from 'axios';

const RECEIVER_EMAIL = 'support.zorovex@gmail.com';

// ── Resend HTTP API (works on Render — no SMTP ports needed) ──
const sendViaResend = async ({ from, to, replyTo, subject, html }) => {
  const resendFrom = process.env.RESEND_FROM || 'Zorovex <onboarding@resend.dev>';
  const resendTo = process.env.RESEND_TO || to;

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
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  const info = await transporter.sendMail({ from, to, replyTo, subject, html });
  return { id: info.messageId };
};

// POST /api/contact — save message to database and send email
export const sendContactMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, and message are required' });
    }

    // 1. Save to Database first (100% reliable)
    const contactMsg = await ContactMessage.create({ name, email, subject, message });
    console.log(`[Contact] ✅ Message saved to DB (ID: ${contactMsg._id})`);

    // Respond immediately to the frontend, so it doesn't hang waiting for email
    res.status(200).json({ success: true, message: 'Message sent successfully' });

    // 2. Send email notification in the background
    const toAddress = process.env.RECEIVER_EMAIL || RECEIVER_EMAIL;
    const emailPayload = {
      from: process.env.EMAIL_FROM || `"${name}" <${process.env.EMAIL_USER}>`,
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

    if (process.env.RESEND_API_KEY) {
      try {
        const result = await sendViaResend(emailPayload);
        console.log(`[Contact] ✅ Email sent via Resend. ID: ${result.id}`);
      } catch (err) {
        console.error('[Contact] ❌ Resend failed:', err.response?.data || err.message);
      }
    } else if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const result = await sendViaGmail(emailPayload);
        console.log(`[Contact] ✅ Email sent via Gmail. ID: ${result.id}`);
      } catch (err) {
        console.error('[Contact] ❌ Gmail failed:', err.message);
      }
    } else {
      console.log('[Contact] ⚠️ No email credentials found, message saved to DB only.');
    }

  } catch (error) {
    // Only hit if DB save fails
    if (!res.headersSent) {
      console.error('[Contact] ❌ Error:', error.message);
      res.status(500).json({ success: false, message: 'Failed to send message', error: error.message });
    }
  }
};

// GET /api/contact/messages — admin: get all messages
export const getContactMessages = async (req, res, next) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
};

// PATCH /api/contact/messages/:id/read — admin: mark as read
export const markMessageRead = async (req, res, next) => {
  try {
    const msg = await ContactMessage.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found' });
    res.status(200).json({ success: true, data: msg });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update message' });
  }
};

// DELETE /api/contact/messages/:id — admin: delete message
export const deleteContactMessage = async (req, res, next) => {
  try {
    const msg = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found' });
    res.status(200).json({ success: true, message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete message' });
  }
};
