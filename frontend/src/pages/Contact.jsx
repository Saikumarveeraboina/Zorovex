import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageCircle, MapPin, Send } from 'lucide-react';

const InstagramIcon = ({ size = 20, color = "currentColor", ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);
import toast from 'react-hot-toast';
import { contactAPI } from '../services/api';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      return toast.error('Please fill all required fields.');
    }
    
    setLoading(true);
    try {
      await contactAPI.sendMessage(form);
      toast.success('Message sent! We will get back to you soon.');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="page-wrapper">
      <div className="container py-5">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-5">
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800 }}>
            Get in <span className="gradient-text">Touch</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, maxWidth: 500, margin: '0 auto' }}>
            Have a question, feedback, or need help with your portfolio? We'd love to hear from you.
          </p>
        </motion.div>

        <div className="row g-4 justify-content-center">
          {/* Contact Info Cards */}
          <div className="col-12 col-lg-4">
            <div className="d-flex flex-column gap-3 h-100">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass-card p-4">
                <div className="stat-icon-wrap" style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)', width: 44, height: 44, borderRadius: 12 }}>
                  <Mail size={20} color="#a78bfa" />
                </div>
                <h5 style={{ fontWeight: 700, marginBottom: 4 }}>Email Us</h5>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 0 }}>support.zorovex@gmail.com</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass-card p-4">
                <div className="stat-icon-wrap" style={{ background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.3)', width: 44, height: 44, borderRadius: 12 }}>
                  <MessageCircle size={20} color="#60a5fa" />
                </div>
                <h5 style={{ fontWeight: 700, marginBottom: 4 }}>Discord Community</h5>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 0 }}>discord.gg/zorovex</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass-card p-4">
                <div className="stat-icon-wrap" style={{ background: 'rgba(34,211,238,0.12)', border: '1px solid rgba(34,211,238,0.3)', width: 44, height: 44, borderRadius: 12 }}>
                  <MapPin size={20} color="#22d3ee" />
                </div>
                <h5 style={{ fontWeight: 700, marginBottom: 4 }}>Office Location</h5>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 0 }}>Hyderabad, India 500039</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="glass-card p-4">
                <div className="stat-icon-wrap" style={{ background: 'rgba(236,72,153,0.12)', border: '1px solid rgba(236,72,153,0.3)', width: 44, height: 44, borderRadius: 12 }}>
                  <InstagramIcon size={20} color="#ec4899" />
                </div>
                <h5 style={{ fontWeight: 700, marginBottom: 4 }}>Instagram</h5>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 0 }}>
                  <a href="https://www.instagram.com/zorovex.in/" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>@zorovex.in</a>
                </p>
              </motion.div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="col-12 col-lg-6">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass-card p-4 p-md-5 h-100">
              <h4 style={{ fontWeight: 700, marginBottom: 24 }}>Send us a message</h4>
              <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                <div className="row g-3">
                  <div className="col-12 col-sm-6">
                    <label className="form-label-zrv">Name *</label>
                    <input className="form-control-zrv" name="name" value={form.name} onChange={handleChange} placeholder="Sai Kumar" required />
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label-zrv">Email *</label>
                    <input className="form-control-zrv" type="email" name="email" value={form.email} onChange={handleChange} placeholder="Saikumar@gmail.com" required />
                  </div>
                </div>

                <div>
                  <label className="form-label-zrv">Subject</label>
                  <input className="form-control-zrv" name="subject" value={form.subject} onChange={handleChange} placeholder="How can we help?" />
                </div>

                <div>
                  <label className="form-label-zrv">Message *</label>
                  <textarea className="form-control-zrv" name="message" value={form.message} onChange={handleChange} placeholder="Tell us more about your inquiry..." rows={5} required />
                </div>

                <button type="submit" disabled={loading} className="btn-primary-zrv w-100 justify-content-center mt-2" style={{ padding: '14px', fontSize: 15 }}>
                  {loading ? (
                    <><span className="zrv-spinner-sm me-2" /> Sending...</>
                  ) : (
                    <>Send Message <Send size={16} /></>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
