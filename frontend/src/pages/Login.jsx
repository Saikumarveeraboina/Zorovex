import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Zap, ArrowRight, Mail, Lock, User } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import { authAPI } from '../services/api';

const Login = () => {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get('tab') === 'register' ? 'register' : 'login');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { if (isAuthenticated) navigate('/dashboard', { replace: true }); }, [isAuthenticated, navigate]);

  const switchTab = (t) => {
    setTab(t);
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

  // ── REGISTER submit ───────────────────────────────────────
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await authAPI.register({ name: form.name, email: form.email, password: form.password });
      login(res.data.user, res.data.token);
      toast.success('🎉 Account created! Welcome to Zorovex!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

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
            {tab === 'login' ? 'Welcome back! Sign in to continue.' : 'Join developers. Start free today.'}
          </p>
        </div>

        {/* Card */}
        <div className="auth-card">
          <AnimatePresence mode="wait">
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

              <form onSubmit={tab === 'login' ? handleLoginSubmit : handleRegisterSubmit}>
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
                  </div>

                  {tab === 'register' && (
                    <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', fontSize: 13, color: 'var(--text-secondary)' }}>
                      🎁 <strong style={{ color: 'var(--purple-400)' }}>30-day free trial</strong> starts when you register. No credit card needed.
                    </div>
                  )}

                  <button id={tab === 'login' ? 'btn-login' : 'btn-register'} type="submit" disabled={loading}
                    className="btn-primary-zrv w-100 justify-content-center mt-1"
                    style={{ padding: '14px', fontSize: 15 }}>
                    {loading ? (
                      <><span className="zrv-spinner-sm me-2" />{tab === 'login' ? 'Signing in…' : 'Creating account…'}</>
                    ) : (
                      <>{tab === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight size={17} /></>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </AnimatePresence>
        </div>

        <p className="text-center mt-3 mb-0" style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => switchTab(tab === 'login' ? 'register' : 'login')}
            style={{ background: 'none', border: 'none', color: 'var(--purple-400)', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', padding: 0 }}>
            {tab === 'login' ? 'Sign up free' : 'Sign in'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
