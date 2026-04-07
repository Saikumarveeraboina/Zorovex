import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Lock, Eye, EyeOff, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  // Redirect to login if token/email are missing
  useEffect(() => {
    if (!token || !email) {
      toast.error('Invalid reset link. Please request a new one.');
      navigate('/forgot-password', { replace: true });
    }
  }, [token, email, navigate]);

  const validate = () => {
    const e = {};
    if (password.length < 6) e.password = 'Password must be at least 6 characters.';
    if (password !== confirmPassword) e.confirm = 'Passwords do not match.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await authAPI.resetPassword({ email, token, password });
      setSuccess(true);
      toast.success('Password reset! You can now sign in.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset link is invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  const strengthScore = (() => {
    let s = 0;
    if (password.length >= 6) s++;
    if (password.length >= 10) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][strengthScore];
  const strengthColor = ['', '#f87171', '#fb923c', '#facc15', '#4ade80', '#34d399'][strengthScore];

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
            {success ? 'Your password has been updated.' : 'Create a new secure password.'}
          </p>
        </div>

        {/* Card */}
        <div className="auth-card">
          {success ? (
            /* ── Success State ── */
            <motion.div
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
              <h5 style={{ fontWeight: 700, marginBottom: 10 }}>Password Updated! 🎉</h5>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>
                Your password has been reset successfully. You can now sign in with your new password.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="btn-primary-zrv w-100 justify-content-center"
                style={{ padding: '14px', fontSize: 15 }}
              >
                Go to Sign In <ArrowRight size={17} />
              </button>
            </motion.div>
          ) : (
            /* ── Form State ── */
            <motion.div key="reset-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
              {/* Header */}
              <div className="text-center mb-4">
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'rgba(139,92,246,0.12)', border: '2px solid rgba(139,92,246,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px',
                }}>
                  <Lock size={24} color="#a78bfa" />
                </div>
                <h5 style={{ fontWeight: 700, marginBottom: 6 }}>Set new password</h5>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 0 }}>
                  Resetting for <strong style={{ color: 'var(--purple-400)' }}>{email}</strong>
                </p>
              </div>

              {/* Token warning if expiry concern */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 14px', borderRadius: 10,
                background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.2)',
                fontSize: 13, color: '#fb923c', marginBottom: 20,
              }}>
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                This link expires in 15 minutes. Please set your password now.
              </div>

              <form onSubmit={handleSubmit}>
                <div className="d-flex flex-column gap-3">
                  {/* New Password */}
                  <div>
                    <label className="form-label-zrv">New Password</label>
                    <div className="input-icon-wrap">
                      <span className="input-icon"><Lock size={16} /></span>
                      <input
                        id="reset-password"
                        className="form-control-zrv has-right"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setErrors({ ...errors, password: '' }); }}
                        placeholder="Min 6 characters"
                        autoComplete="new-password"
                        autoFocus
                      />
                      <button type="button" className="input-icon-right" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {/* Strength bar */}
                    {password.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                          {[1,2,3,4,5].map((i) => (
                            <div key={i} style={{
                              flex: 1, height: 4, borderRadius: 2,
                              background: i <= strengthScore ? strengthColor : 'rgba(255,255,255,0.08)',
                              transition: 'background 0.3s',
                            }} />
                          ))}
                        </div>
                        <span style={{ fontSize: 11, color: strengthColor, fontWeight: 600 }}>{strengthLabel}</span>
                      </div>
                    )}
                    {errors.password && <p style={{ fontSize: 12, color: '#f87171', marginTop: 5, marginBottom: 0 }}>{errors.password}</p>}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="form-label-zrv">Confirm Password</label>
                    <div className="input-icon-wrap">
                      <span className="input-icon"><Lock size={16} /></span>
                      <input
                        id="reset-confirm-password"
                        className="form-control-zrv has-right"
                        type={showConfirm ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); setErrors({ ...errors, confirm: '' }); }}
                        placeholder="Repeat your password"
                        autoComplete="new-password"
                      />
                      <button type="button" className="input-icon-right" onClick={() => setShowConfirm(!showConfirm)}>
                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.confirm && <p style={{ fontSize: 12, color: '#f87171', marginTop: 5, marginBottom: 0 }}>{errors.confirm}</p>}
                  </div>

                  <button
                    id="btn-reset-submit"
                    type="submit"
                    disabled={loading}
                    className="btn-primary-zrv w-100 justify-content-center mt-1"
                    style={{ padding: '14px', fontSize: 15 }}
                  >
                    {loading ? (
                      <><span className="zrv-spinner-sm me-2" />Resetting password…</>
                    ) : (
                      <>Reset Password <ArrowRight size={17} /></>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </div>

        <p className="text-center mt-3 mb-0" style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          <Link to="/forgot-password" style={{ color: 'var(--purple-400)', fontWeight: 600, textDecoration: 'none' }}>
            Request a new link
          </Link>
          {' '}·{' '}
          <Link to="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
            Back to Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
