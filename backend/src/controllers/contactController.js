import nodemailer from 'nodemailer';

const RECEIVER_EMAIL = 'support.zorovex@gmail.com';

export const sendContactMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, and message are required' });
    }

    // Log which env vars are available (without values) for debugging
    console.log('[Contact] Environment check:', {
      hasEmailUser: !!process.env.EMAIL_USER,
      hasEmailPass: !!process.env.EMAIL_PASS,
      hasBrevoKey: !!process.env.BREVO_SMTP_KEY,
      hasBrevoLogin: !!process.env.BREVO_SMTP_LOGIN,
      hasReceiverEmail: !!process.env.RECEIVER_EMAIL,
    });

    // Build transporter — always use Gmail SMTP for contact form
    // Gmail App Passwords work reliably from any server
    let transporter;

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      // Primary: Gmail SMTP (works in both local dev and production)
      console.log('[Contact] Using Gmail SMTP');
      transporter = nodemailer.createTransport({
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
    } else if (process.env.BREVO_SMTP_KEY && process.env.BREVO_SMTP_LOGIN) {
      // Fallback: Brevo SMTP
      console.log('[Contact] Using Brevo SMTP');
      transporter = nodemailer.createTransport({
        host: 'smtp-relay.brevo.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.BREVO_SMTP_LOGIN,
          pass: process.env.BREVO_SMTP_KEY,
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
      });
    } else {
      console.error('[Contact] ❌ No email credentials configured');
      return res.status(500).json({
        success: false,
        message: 'Email service is not configured on the server.',
      });
    }

    // Verify SMTP connection before sending
    try {
      await transporter.verify();
      console.log('[Contact] ✅ SMTP connection verified');
    } catch (verifyErr) {
      console.error('[Contact] ❌ SMTP verification failed:', verifyErr.message);
      return res.status(500).json({
        success: false,
        message: 'Email server connection failed. Please try again later.',
        error: verifyErr.message,
      });
    }

    const toAddress = process.env.RECEIVER_EMAIL || RECEIVER_EMAIL;
    const fromAddress = process.env.EMAIL_FROM || `"${name}" <${process.env.EMAIL_USER || process.env.BREVO_SMTP_LOGIN}>`;

    const mailOptions = {
      from: fromAddress,
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

    console.log(`[Contact] 📧 Sending to ${toAddress} from ${fromAddress}`);

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Contact] ✅ Email sent. MessageId: ${info.messageId}`);

    res.status(200).json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('[Contact] ❌ Email error:', error.message);
    console.error('[Contact] Stack:', error.stack);
    res.status(500).json({ success: false, message: 'Failed to send message', error: error.message });
  }
};

