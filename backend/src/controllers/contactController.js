import { createTransporter } from '../utils/mailer.js';

const RECEIVER_EMAIL = 'support.zorovex@gmail.com';

export const sendContactMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, and message are required' });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('[Contact] ❌ EMAIL_USER or EMAIL_PASS not set in environment');
      return res.status(500).json({ 
        success: false, 
        message: 'Email service is not configured on the server.' 
      });
    }

    // Use the shared transporter (handles Gmail / Brevo based on env)
    const transporter = createTransporter();

    // Verify SMTP connection before sending
    try {
      await transporter.verify();
      console.log('[Contact] ✅ SMTP connection verified successfully');
    } catch (verifyErr) {
      console.error('[Contact] ❌ SMTP verification failed:', verifyErr.message);
      return res.status(500).json({ 
        success: false, 
        message: 'Email server connection failed. Please try again later.',
        error: verifyErr.message,
      });
    }

    const toAddress = process.env.RECEIVER_EMAIL || RECEIVER_EMAIL;

    // Email options
    const mailOptions = {
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

    console.log(`[Contact] 📧 Sending contact email from "${name}" <${email}> to ${toAddress}`);

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Contact] ✅ Email sent successfully. MessageId: ${info.messageId}`);

    res.status(200).json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('[Contact] ❌ Email sending error:', error.message);
    console.error('[Contact] Full error:', error);
    res.status(500).json({ success: false, message: 'Failed to send message', error: error.message });
  }
};
