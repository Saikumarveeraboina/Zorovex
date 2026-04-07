import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Mail, ArrowRight, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.match(/^\S+@\S+\.\S+$/)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await authAPI.forgotPassword({ email });
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 16px 40px', position: 'relative' }}>
      <div className="orb orb-purple" style={{ opacity: 0.5 }} />
      <div className="orb orb-blue" style={{ opacity: 0.3 }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        style={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 1 }}
      >
        {/* Logo */}
        <div className="text-center mb-4">
          <Link to="/" className="d-inline-flex align-items-center gap-2 text-decoration-none mb-2">
            <div className="navbar-brand-logo" style={{ width: 44, height: 44, borderRadius: 13 }}>
              <Zap size={22} color="#fff" fill="#fff" />
            </div>
            <span style={{ fontSize: 24, fontWeight: 800, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              <span className="gradient-text">Zorovex</span>
            </span>
          </Link>
          <p className="mb-0" style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            {sent ? 'Check your inbox!' : 'Reset your password in seconds.'}
          </p>
        </div>

        {/* Card */}
        <div className="auth-card">
          {sent ? (
            /* Success State */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'rgba(74,222,128,0.1)', border: '2px solid rgba(74,222,128,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <CheckCircle size={36} color="#4ade80" />
              </div>
              <h5 style={{ fontWeight: 700, marginBottom: 10 }}>Reset link sent!</h5>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 8 }}>
                We sent a password reset link to
              </p>
              <p style={{ color: 'var(--purple-400)', fontWeight: 700, fontSize: 15, marginBottom: 20 }}>
                {email}
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 28 }}>
                The link expires in <strong style={{ color: 'var(--text-secondary)' }}>15 minutes</strong>.
                Check your spam folder if you don't see it.
              </p>
              <button
                onClick={() => { setSent(false); setEmail(''); }}
                style={{
                  background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)',
                  color: 'var(--purple-400)', borderRadius: 10, padding: '10px 24px',
                  cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(139,92,246,0.2)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(139,92,246,0.1)'}
              >
                Try a different email
              </button>
            </motion.div>
          ) : (
            /* Form State */
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
              {/* Header */}
              <div className="text-center mb-4">
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'rgba(139,92,246,0.12)', border: '2px solid rgba(139,92,246,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px',
                }}>
                  <Mail size={24} color="#a78bfa" />
                </div>
                <h5 style={{ fontWeight: 700, marginBottom: 6 }}>Forgot your password?</h5>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 0 }}>
                  Enter your email and we'll send you a secure reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="d-flex flex-column gap-3">
                  <div>
                    <label className="form-label-zrv">Email Address</label>
                    <div className="input-icon-wrap">
                      <span className="input-icon"><Mail size={16} /></span>
                      <input
                        id="forgot-email"
                        className="form-control-zrv"
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(''); }}
                        placeholder="you@example.com"
                        autoComplete="email"
                        autoFocus
                      />
                    </div>
                    {error && <p style={{ fontSize: 12, color: '#f87171', marginTop: 5, marginBottom: 0 }}>{error}</p>}
                  </div>

                  <button
                    id="btn-forgot-submit"
                    type="submit"
                    disabled={loading}
                    className="btn-primary-zrv w-100 justify-content-center"
                    style={{ padding: '14px', fontSize: 15 }}
                  >
                    {loading ? (
                      <><span className="zrv-spinner-sm me-2" />Sending link…</>
                    ) : (
                      <>Send Reset Link <ArrowRight size={17} /></>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </div>

        {/* Footer link */}
        <p className="text-center mt-3 mb-0" style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Remember your password?{' '}
          <Link to="/login" style={{ color: 'var(--purple-400)', fontWeight: 600, textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
