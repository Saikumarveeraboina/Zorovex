import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Code2, Briefcase, TrendingUp, CheckCircle2, Zap, Clock, Star, LockOpen, Tag } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { paymentAPI, adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import { useState , useEffect} from 'react';

const features = [
  { icon: Code2,       title: 'DSA Practice Paths',  desc: 'Structured problem sets curated for TCS, Amazon, Google, Microsoft, and Flipkart interviews.',        color: '#a78bfa', bg: 'rgba(139,92,246,0.1)' },
  { icon: TrendingUp,  title: 'Progress Tracking',    desc: 'Track completion per topic and company. See your % progress and stay motivated.',                     color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
  { icon: Briefcase,   title: 'Portfolio Builder',    desc: '3 stunning templates to showcase your skills, projects, education, and certificates — with a live URL.', color: '#22d3ee', bg: 'rgba(34,211,238,0.1)' },
  { icon: Clock,       title: '30-Day Free Trial',    desc: 'Get full access to all features for 30 days. No credit card required. Upgrade anytime.',              color: '#f472b6', bg: 'rgba(244,114,182,0.1)' },
];

const companies = [
  { name: 'TCS', emoji: '🏢' }, { name: 'Amazon', emoji: '📦' }, { name: 'Google', emoji: '🔍' },
  { name: 'Microsoft', emoji: '🪟' }, { name: 'Flipkart', emoji: '🛒' },
];

const stats = [
  { value: '5+',   label: 'Target Companies' },
  { value: '600+', label: 'Curated Problems' },
  { value: '3',    label: 'Portfolio Templates' },
  { value: '30',   label: 'Days Free Trial' },
];

const freeItems = [
  'Access to 50+ Easy DSA problems',
  'Basic progress tracking',
  'Base Portfolio Template (FREE)',
  'Resume Auto-Extraction',
  'Unique Live Portfolio URL',
  '30-day trial period',
];

const proItems = [
  'Access to all 600+ DSA problems (incl. Medium/Hard)',
  'Advanced progress analytics',
  'All Premium Templates unlocked',
  'Resume Auto-Extraction',
  'Unique Live Portfolio URL',
  'Priority Email Support',
];

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [upgrading, setUpgrading] = useState(false);
  
  const [basePrice, setBasePrice] = useState(199);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [couponSuccess, setCouponSuccess] = useState(false);

  useEffect(() => {
    adminAPI.getSettings()
      .then(res => res.data?.proPrice && setBasePrice(res.data.proPrice))
      .catch(console.error);
  }, []);

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setValidatingCoupon(true);
    setCouponSuccess(false);
    try {
      const res = await adminAPI.validateCoupon(couponCode);
      setDiscount(res.data.discountPercentage);
      setCouponSuccess(true);
      toast.success(`Coupon applied! ${res.data.discountPercentage}% off`);
    } catch (err) {
      toast.error('Invalid or expired coupon code');
      setDiscount(0);
      setCouponCode('');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleUpgrade = async () => {
    if (!isAuthenticated) return navigate('/login?tab=register');
    setUpgrading(true);
    try {
      const { data: orderData } = await paymentAPI.createProOrder({ couponCode: couponSuccess ? couponCode : undefined });
      
      if (orderData.freeUpgrade) {
        toast.success('🎉 Successfully upgraded to Pro via Coupon!');
        setTimeout(() => window.location.reload(), 1500);
        return;
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Zorovex',
        description: orderData.label,
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            await paymentAPI.verifyProPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            toast.success('🎉 Successfully upgraded to Pro!');
            setTimeout(() => window.location.reload(), 1500);
          } catch (err) {
            toast.error('Payment verification failed.');
          }
        },
        prefill: { name: user?.name, email: user?.email },
        theme: { color: '#8b5cf6' },
        modal: { ondismiss: () => setUpgrading(false) }
      };
      
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate payment.');
      setUpgrading(false);
    }
  };

  return (
    <div className="page-wrapper">

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="hero-section">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            {/* Pill */}
            <div className="hero-pill">
              <span className="pulse-dot" />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--purple-400)' }}>
                🚀 30-Day Free Trial — No Credit Card Required
              </span>
            </div>

            <h1 style={{ fontSize: 'clamp(34px, 5.5vw, 70px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 20 }}>
              Crack Interviews.<br />
              <span className="gradient-text">Build Portfolios.</span>
            </h1>

            <p className="mx-auto mb-4" style={{ fontSize: 'clamp(15px, 2vw, 19px)', color: 'var(--text-secondary)', maxWidth: 580, lineHeight: 1.7 }}>
              Zorovex gives you structured DSA paths for top companies and a professional portfolio builder — everything you need to land your dream tech job.
            </p>

            <div className="d-flex gap-3 justify-content-center flex-wrap">
              {isAuthenticated ? (
                <>
                  <Link to="/dsa" className="btn-primary-zrv" style={{ padding: '14px 34px', fontSize: 16 }}>
                    Start Practicing <ArrowRight size={18} />
                  </Link>
                  <Link to="/dashboard" className="btn-secondary-zrv" style={{ padding: '14px 34px', fontSize: 16 }}>
                    My Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login?tab=register" className="btn-primary-zrv" style={{ padding: '14px 34px', fontSize: 16 }}>
                    Get Started Free <ArrowRight size={18} />
                  </Link>
                  <Link to="/login" className="btn-secondary-zrv" style={{ padding: '14px 34px', fontSize: 16 }}>
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <div className="row g-3 justify-content-center mt-5" style={{ maxWidth: 700, margin: '3rem auto 0' }}>
              {stats.map(({ value, label }) => (
                <div key={label} className="col-6 col-md-3">
                  <div className="glass-card p-3 text-center">
                    <div style={{ fontSize: 30, fontWeight: 900 }}>
                      <span className="gradient-text">{value}</span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Companies ────────────────────────────────────── */}
      <section className="py-4">
        <div className="container text-center">
          <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 18 }}>
            Problems curated for
          </p>
          <div className="d-flex gap-2 justify-content-center flex-wrap">
            {companies.map(c => (
              <motion.div key={c.name} className="glass-card d-inline-flex align-items-center gap-2 px-3 py-2"
                whileHover={{ scale: 1.06, translateY: -2 }} style={{ cursor: 'default' }}>
                <span style={{ fontSize: 18 }}>{c.emoji}</span>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{c.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section id="features" className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              style={{ fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 800, marginBottom: 12 }}>
              Everything you need to <span className="gradient-text">succeed</span>
            </motion.h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 16, maxWidth: 480, margin: '0 auto' }}>
              One platform. All the tools to crack interviews and showcase your talent.
            </p>
          </div>
          <div className="row g-4">
            {features.map(({ icon: Icon, title, desc, color, bg }, i) => (
              <div key={title} className="col-12 col-sm-6 col-lg-3">
                <motion.div className="feature-card" initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <div className="feature-icon-wrap" style={{ background: bg, border: `1px solid ${color}40` }}>
                    <Icon size={24} color={color} />
                  </div>
                  <h5 style={{ fontWeight: 700, marginBottom: 10, fontSize: 17 }}>{title}</h5>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>{desc}</p>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────── */}
      <section id="pricing" className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              style={{ fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 800 }}>
              Simple <span className="gradient-text">Pricing</span>
            </motion.h2>
          </div>
          <div className="row justify-content-center g-4 container-fluid" style={{ maxWidth: 1000, margin: '0 auto' }}>
            {/* Free Trial */}
            <div className="col-12 col-md-6 col-lg-5">
              <motion.div className="pricing-card" style={{ padding: '40px 30px', height: '100%', position: 'relative' }}
                initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
                  Beginner Plan
                </div>
                <div className="mb-4">
                  <span style={{ fontSize: 44, fontWeight: 900, color: '#f1f5f9' }}>Free Trial</span>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>Basic features to get started.</div>
                </div>
                <ul className="list-unstyled text-start mb-4 flex-grow-1" style={{ minHeight: 250 }}>
                  {freeItems.map(item => (
                    <li key={item} className="d-flex align-items-center gap-3 mb-3" style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                      <CheckCircle2 size={16} color="#94a3b8" style={{ flexShrink: 0 }} />
                      {item}
                    </li>
                  ))}
                </ul>
                {isAuthenticated && !user.isPro ? (
                  <button className="btn-secondary-zrv w-100 justify-content-center" style={{ padding: '14px', fontSize: 15 }} disabled>
                    Current Plan
                  </button>
                ) : (
                  <Link to="/login?tab=register" className="btn-secondary-zrv w-100 justify-content-center" style={{ padding: '14px', fontSize: 15, display: isAuthenticated ? 'none' : 'flex' }}>
                    Start Free Trial
                  </Link>
                )}
              </motion.div>
            </div>

            {/* Pro Plan */}
            <div className="col-12 col-md-6 col-lg-5">
              <motion.div className="pricing-card" style={{ padding: '40px 30px', height: '100%', position: 'relative', border: '1px solid rgba(167,139,250,0.5)', background: 'rgba(139,92,246,0.05)', boxShadow: '0 0 40px rgba(139,92,246,0.1)' }}
                initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
                
                {(!isAuthenticated || !user.isPro) && (
                  <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#7c3aed,#3b82f6)', padding: '5px 16px', borderRadius: 999, fontSize: 11, fontWeight: 800, color: '#fff', letterSpacing: '0.05em' }}>
                    RECOMMENDED
                  </div>
                )}
                
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--purple-400)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Star size={14} fill="var(--purple-400)" /> Pro Upgrade
                </div>
                <div className="mb-4 d-flex align-items-baseline gap-2">
                  <span style={{ fontSize: 44, fontWeight: 900, color: '#4ade80' }}>₹{Math.round(basePrice * (1 - discount / 100))}</span>
                  <span style={{ fontSize: 16, color: 'var(--text-secondary)', textDecoration: 'line-through' }}>₹999</span>
                  <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>/ lifetime</span>
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: -15, marginBottom: 20 }}>One-time payment for full access.</div>
                
                <ul className="list-unstyled text-start mb-4 flex-grow-1" style={{ minHeight: 180 }}>
                  {proItems.map(item => (
                    <li key={item} className="d-flex align-items-center gap-3 mb-3" style={{ fontSize: 14, color: '#e2e8f0', fontWeight: item.includes('Premium Templates') || item.includes('All 600+') ? 600 : 400 }}>
                      <CheckCircle2 size={16} color="#4ade80" style={{ flexShrink: 0 }} />
                      {item}
                    </li>
                  ))}
                </ul>
                
                {isAuthenticated && !user?.isPro && (
                  <div className="mb-4">
                    <div className="d-flex gap-2">
                       <input 
                         type="text" 
                         placeholder="Coupon code" 
                         className="form-control-zrv" 
                         style={{ padding: '8px 12px', fontSize: 13, textTransform: 'uppercase' }}
                         value={couponCode}
                         onChange={(e) => {
                            setCouponCode(e.target.value.toUpperCase());
                            setCouponSuccess(false);
                            setDiscount(0);
                         }}
                         disabled={couponSuccess}
                       />
                       {!couponSuccess ? (
                         <button 
                             onClick={handleApplyCoupon} 
                             className="btn-secondary-zrv px-3 py-1" 
                             style={{ fontSize: 13, padding: '8px' }}
                             disabled={validatingCoupon || !couponCode}
                          >
                            {validatingCoupon ? 'Wait' : 'Apply'}
                         </button>
                       ) : (
                         <button 
                             onClick={() => { setCouponCode(''); setCouponSuccess(false); setDiscount(0); }} 
                             className="btn-secondary-zrv px-3 py-1" 
                             style={{ fontSize: 13, padding: '8px', color: '#f87171' }}
                          >
                            Remove
                         </button>
                       )}
                    </div>
                  </div>
                )}
                
                {isAuthenticated && user?.isPro ? (
                  <button className="btn-secondary-zrv w-100 justify-content-center" style={{ padding: '14px', fontSize: 15, background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)' }} disabled>
                    <CheckCircle2 size={16} /> Pro Active
                  </button>
                ) : (
                  <button onClick={handleUpgrade} disabled={upgrading} className="btn-primary-zrv w-100 justify-content-center" style={{ padding: '14px', fontSize: 15, fontWeight: 700 }}>
                    {upgrading ? 'Connecting to payment...' : <><LockOpen size={16} /> Upgrade to Pro</>}
                  </button>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
