import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageCircle, MapPin, Send, Phone } from 'lucide-react';

const InstagramIcon = ({ size = 20, color = "currentColor", ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const WhatsAppIcon = ({ size = 20, color = "currentColor", ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color} {...props}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

import toast from 'react-hot-toast';
import { contactAPI } from '../services/api';

const WHATSAPP_NUMBER = '917780601401';
const SUPPORT_EMAIL = 'support.zorovex@gmail.com';

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

  const openWhatsApp = () => {
    const text = encodeURIComponent('Hi Zorovex! I have a question.');
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank');
  };

  const openEmail = () => {
    window.open(`mailto:${SUPPORT_EMAIL}?subject=Contact from Zorovex`, '_blank');
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
              {/* Email — clickable */}
              <motion.div
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                className="glass-card p-4"
                onClick={openEmail}
                style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="stat-icon-wrap" style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)', width: 44, height: 44, borderRadius: 12 }}>
                  <Mail size={20} color="#a78bfa" />
                </div>
                <h5 style={{ fontWeight: 700, marginBottom: 4 }}>Email Us</h5>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 0 }}>{SUPPORT_EMAIL}</p>
              </motion.div>

              {/* WhatsApp — clickable */}
              <motion.div
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
                className="glass-card p-4"
                onClick={openWhatsApp}
                style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="stat-icon-wrap" style={{ background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.3)', width: 44, height: 44, borderRadius: 12 }}>
                  <WhatsAppIcon size={20} color="#25d366" />
                </div>
                <h5 style={{ fontWeight: 700, marginBottom: 4 }}>WhatsApp</h5>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 0 }}>Chat with us instantly</p>
              </motion.div>

              {/* Phone */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass-card p-4">
                <div className="stat-icon-wrap" style={{ background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.3)', width: 44, height: 44, borderRadius: 12 }}>
                  <Phone size={20} color="#60a5fa" />
                </div>
                <h5 style={{ fontWeight: 700, marginBottom: 4 }}>Call Us</h5>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 0 }}>
                  <a href="tel:+917780601401" style={{ color: 'inherit', textDecoration: 'none' }}>+91 77806 01401</a>
                </p>
              </motion.div>

              {/* Office Location */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }} className="glass-card p-4">
                <div className="stat-icon-wrap" style={{ background: 'rgba(34,211,238,0.12)', border: '1px solid rgba(34,211,238,0.3)', width: 44, height: 44, borderRadius: 12 }}>
                  <MapPin size={20} color="#22d3ee" />
                </div>
                <h5 style={{ fontWeight: 700, marginBottom: 4 }}>Office Location</h5>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 0 }}>Hyderabad, India 500039</p>
              </motion.div>

              {/* Instagram */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass-card p-4">
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

              {/* Quick contact buttons */}
              <div className="d-flex gap-2 mt-3">
                <button
                  onClick={openWhatsApp}
                  className="btn-primary-zrv justify-content-center"
                  style={{ padding: '12px', fontSize: 14, flex: 1, background: 'linear-gradient(135deg, #25d366, #128c7e)', border: 'none' }}
                >
                  <WhatsAppIcon size={16} color="#fff" /> WhatsApp Us
                </button>
                <button
                  onClick={openEmail}
                  className="btn-primary-zrv justify-content-center"
                  style={{ padding: '12px', fontSize: 14, flex: 1, background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', border: 'none' }}
                >
                  <Mail size={16} /> Email Directly
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
