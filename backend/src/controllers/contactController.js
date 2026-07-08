import ContactMessage from '../models/ContactMessage.js';

// POST /api/contact — save message to database
export const sendContactMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, and message are required' });
    }

    const contactMsg = await ContactMessage.create({ name, email, subject, message });
    console.log(`[Contact] ✅ Message saved from ${name} <${email}> (ID: ${contactMsg._id})`);

    res.status(200).json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('[Contact] ❌ Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to send message', error: error.message });
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
