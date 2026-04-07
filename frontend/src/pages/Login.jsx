import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Zap, ArrowRight, Mail, Lock, User, RotateCcw, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import { authAPI } from '../services/api';

const OTP_LENGTH = 6;

const Login = () => {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get('tab') === 'register' ? 'register' : 'login');

  // Registration steps: 'form' | 'otp'
  const [registerStep, setRegisterStep] = useState('form');
  const [pendingEmail, setPendingEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState(Array(OTP_LENGTH).fill(''));
  const otpRefs = useRef([]);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { if (isAuthenticated) navigate('/dashboard', { replace: true }); }, [isAuthenticated, navigate]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const switchTab = (t) => {
    setTab(t);
    setRegisterStep('form');
    setOtpDigits(Array(OTP_LENGTH).fill(''));
    setPendingEmail('');
    setErrors({});
  };

  const validate = () => {
    const e = {};
    if (tab === 'register' && !form.name.trim()) e.name = 'Name is required';
    if (!form.email.match(/^\S+@\S+\.\S+$/)) e.email = 'Valid email required';
    if (form.password.length < 6) e.password = 'Min 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  // ── LOGIN submit ──────────────────────────────────────────
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await authAPI.login({ email: form.email, password: form.password });
      login(res.data.user, res.data.token);
      toast.success('Welcome back! 👋');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  // ── REGISTER Step 1: Send OTP ─────────────────────────────
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await authAPI.sendOtp({ name: form.name, email: form.email, password: form.password });
      setPendingEmail(form.email);
      setRegisterStep('otp');
      setOtpDigits(Array(OTP_LENGTH).fill(''));
      setResendCooldown(60);
      toast.success(`OTP sent to ${form.email}!`);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  // ── OTP input handlers ────────────────────────────────────
  const handleOtpChange = (idx, value) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otpDigits];
    next[idx] = value.slice(-1); // only last digit
    setOtpDigits(next);
    if (value && idx < OTP_LENGTH - 1) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otpDigits[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && idx > 0) otpRefs.current[idx - 1]?.focus();
    if (e.key === 'ArrowRight' && idx < OTP_LENGTH - 1) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = [...Array(OTP_LENGTH).fill('')];
    [...pasted].forEach((ch, i) => { next[i] = ch; });
    setOtpDigits(next);
    const nextFocus = Math.min(pasted.length, OTP_LENGTH - 1);
    otpRefs.current[nextFocus]?.focus();
  };

  // ── REGISTER Step 2: Verify OTP ───────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otp = otpDigits.join('');
    if (otp.length < OTP_LENGTH) {
      toast.error('Please enter the complete 6-digit OTP.');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.verifyOtp({ email: pendingEmail, otp });
      login(res.data.user, res.data.token);
      toast.success('🎉 Account created! Welcome to Zorovex!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP.');
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ────────────────────────────────────────────
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    try {
      await authAPI.sendOtp({ name: form.name, email: pendingEmail, password: form.password });
      setOtpDigits(Array(OTP_LENGTH).fill(''));
      setResendCooldown(60);
      toast.success('New OTP sent!');
      otpRefs.current[0]?.focus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  const otpFilled = otpDigits.every((d) => d !== '');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 16px 40px', position: 'relative' }}>
      <div className="orb orb-purple" style={{ opacity: 0.5 }} />
      <div className="orb orb-blue" style={{ opacity: 0.3 }} />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
        style={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 1 }}>

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
            {tab === 'login' ? 'Welcome back! Sign in to continue.' : registerStep === 'otp' ? 'Check your email for the OTP.' : 'Join developers. Start free today.'}
          </p>
        </div>

        {/* Card */}
        <div className="auth-card">

          {/* ── OTP Verification Step ── */}
          <AnimatePresence mode="wait">
            {tab === 'register' && registerStep === 'otp' ? (
              <motion.div key="otp-step"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}>

                {/* Header */}
                <div className="text-center mb-4">
                  <div style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: 'rgba(139,92,246,0.15)', border: '2px solid rgba(139,92,246,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
                  }}>
                    <ShieldCheck size={28} color="#a78bfa" />
                  </div>
                  <h5 style={{ fontWeight: 700, marginBottom: 6 }}>Verify your email</h5>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 0 }}>
                    We sent a 6-digit code to <strong style={{ color: 'var(--text-primary)' }}>{pendingEmail}</strong>
                  </p>
                </div>

                {/* OTP Boxes */}
                <form onSubmit={handleVerifyOtp}>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 24 }}>
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`otp-box-${idx}`}
                        ref={(el) => (otpRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        onPaste={idx === 0 ? handleOtpPaste : undefined}
                        style={{
                          width: 52, height: 58,
                          textAlign: 'center',
                          fontSize: 24, fontWeight: 700,
                          background: 'rgba(255,255,255,0.04)',
                          border: `2px solid ${digit ? 'rgba(139,92,246,0.7)' : 'var(--border)'}`,
                          borderRadius: 12,
                          color: 'var(--text-primary)',
                          outline: 'none',
                          transition: 'border-color 0.2s',
                          caretColor: '#a78bfa',
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#a78bfa'}
                        onBlur={(e) => e.target.style.borderColor = digit ? 'rgba(139,92,246,0.7)' : 'var(--border)'}
                      />
                    ))}
                  </div>

                  <button
                    id="btn-verify-otp"
                    type="submit"
                    disabled={loading || !otpFilled}
                    className="btn-primary-zrv w-100 justify-content-center mb-3"
                    style={{ padding: '14px', fontSize: 15 }}
                  >
                    {loading ? (
                      <><span className="zrv-spinner-sm me-2" />Verifying…</>
                    ) : (
                      <>Verify & Create Account <ArrowRight size={17} /></>
                    )}
                  </button>
                </form>

                {/* Resend + Back */}
                <div className="text-center d-flex flex-column gap-2">
                  <button
                    onClick={handleResend}
                    disabled={resendCooldown > 0 || loading}
                    style={{
                      background: 'none', border: 'none', cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                      color: resendCooldown > 0 ? 'var(--text-muted)' : 'var(--purple-400)',
                      fontSize: 13, fontWeight: 600, fontFamily: 'inherit', display: 'inline-flex',
                      alignItems: 'center', gap: 6, justifyContent: 'center', padding: 0
                    }}
                  >
                    <RotateCcw size={13} />
                    {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
                  </button>

                  <button
                    onClick={() => setRegisterStep('form')}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-muted)', fontSize: 12, fontFamily: 'inherit', padding: 0
                    }}
                  >
                    ← Change email or go back
                  </button>
                </div>
              </motion.div>

            ) : (
              /* ── Login / Register Form ── */
              <motion.div key="form-step" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                {/* Tabs */}
                <div className="auth-tab-bar">
                  {['login', 'register'].map((t) => (
                    <button key={t} className={`auth-tab-btn ${tab === t ? 'active' : ''}`}
                      onClick={() => switchTab(t)}>
                      {t === 'login' ? 'Sign In' : 'Create Account'}
                    </button>
                  ))}
                </div>

                <form onSubmit={tab === 'login' ? handleLoginSubmit : handleSendOtp}>
                  <div className="d-flex flex-column gap-3">
                    {tab === 'register' && (
                      <div>
                        <label className="form-label-zrv">Full Name</label>
                        <div className="input-icon-wrap">
                          <span className="input-icon"><User size={16} /></span>
                          <input id="register-name" className="form-control-zrv" name="name"
                            value={form.name} onChange={handleChange} placeholder="John Doe" autoComplete="name" />
                        </div>
                        {errors.name && <p style={{ fontSize: 12, color: '#f87171', marginTop: 5, marginBottom: 0 }}>{errors.name}</p>}
                      </div>
                    )}

                    <div>
                      <label className="form-label-zrv">Email Address</label>
                      <div className="input-icon-wrap">
                        <span className="input-icon"><Mail size={16} /></span>
                        <input id={tab === 'login' ? 'login-email' : 'register-email'} className="form-control-zrv"
                          type="email" name="email" value={form.email} onChange={handleChange}
                          placeholder="you@example.com" autoComplete="email" />
                      </div>
                      {errors.email && <p style={{ fontSize: 12, color: '#f87171', marginTop: 5, marginBottom: 0 }}>{errors.email}</p>}
                    </div>

                    <div>
                      <label className="form-label-zrv">Password</label>
                      <div className="input-icon-wrap">
                        <span className="input-icon"><Lock size={16} /></span>
                        <input id={tab === 'login' ? 'login-password' : 'register-password'}
                          className="form-control-zrv has-right"
                          type={showPassword ? 'text' : 'password'} name="password"
                          value={form.password} onChange={handleChange}
                          placeholder={tab === 'register' ? 'Min 6 characters' : 'Your password'}
                          autoComplete={tab === 'login' ? 'current-password' : 'new-password'} />
                        <button type="button" className="input-icon-right" onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {errors.password && <p style={{ fontSize: 12, color: '#f87171', marginTop: 5, marginBottom: 0 }}>{errors.password}</p>}
                      {tab === 'login' && (
                        <div style={{ textAlign: 'right', marginTop: 6 }}>
                          <Link
                            to="/forgot-password"
                            style={{ fontSize: 12, color: 'var(--purple-400)', fontWeight: 600, textDecoration: 'none' }}
                          >
                            Forgot password?
                          </Link>
                        </div>
                      )}
                    </div>

                    {tab === 'register' && (
                      <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', fontSize: 13, color: 'var(--text-secondary)' }}>
                        🎁 <strong style={{ color: 'var(--purple-400)' }}>30-day free trial</strong> starts when you register. No credit card needed.
                      </div>
                    )}

                    <button id={tab === 'login' ? 'btn-login' : 'btn-send-otp'} type="submit" disabled={loading}
                      className="btn-primary-zrv w-100 justify-content-center mt-1"
                      style={{ padding: '14px', fontSize: 15 }}>
                      {loading ? (
                        <><span className="zrv-spinner-sm me-2" />{tab === 'login' ? 'Signing in…' : 'Sending OTP…'}</>
                      ) : (
                        <>{tab === 'login' ? 'Sign In' : 'Send Verification Code'} <ArrowRight size={17} /></>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {tab !== 'register' || registerStep !== 'otp' ? (
          <p className="text-center mt-3 mb-0" style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => switchTab(tab === 'login' ? 'register' : 'login')}
              style={{ background: 'none', border: 'none', color: 'var(--purple-400)', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', padding: 0 }}>
              {tab === 'login' ? 'Sign up free' : 'Sign in'}
            </button>
          </p>
        ) : null}
      </motion.div>
    </div>
  );
};

export default Login;
