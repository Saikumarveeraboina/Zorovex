import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import { portfolioAPI, paymentAPI } from '../services/api';
import TemplateCard from '../components/portfolio/TemplateCard';
import PortfolioForm from '../components/portfolio/PortfolioForm';
import PortfolioPreview from '../components/portfolio/PortfolioPreview';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Portfolio = () => {
  const { user } = useAuth();
  const [templateId, setTemplateId] = useState(1);
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeView, setActiveView] = useState('form');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    portfolioAPI.getByUserId(user.id)
      .then(res => { setPortfolio(res.data.portfolio); setTemplateId(res.data.portfolio.templateId || 1); setActiveView('preview'); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user.id]);

  const unlockedTemplates = user?.isPro ? [1, 2, 3] : (portfolio?.unlockedTemplates || [1]);

  const handleSave = async (formData) => {
    // Check if selected template is locked
    if (!unlockedTemplates.includes(templateId)) {
      setSaving(true);
      try {
        // Create order
        const { data: orderData } = await paymentAPI.createOrder({ templateId });
        
        // Setup Razorpay options
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'Zorovex',
          description: orderData.label,
          order_id: orderData.orderId,
          handler: async function (response) {
            try {
              // Verify payment
              await paymentAPI.verifyPayment({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              
              // Unlock template
              await portfolioAPI.unlockTemplate({ 
                templateId, 
                razorpayPaymentId: response.razorpay_payment_id 
              });
              
              toast.success(`🎉 ${orderData.label} unlocked!`);
              
              // Now proceed to actually save portfolio
              await finalizeSave(formData);
            } catch (err) {
              toast.error('Payment verification failed.');
              setSaving(false);
            }
          },
          prefill: { name: user?.name, email: user?.email },
          theme: { color: '#8b5cf6' },
          modal: { ondismiss: () => setSaving(false) }
        };
        
        const rzp = new window.Razorpay(options);
        rzp.open();
        return; // wait for handler
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to initiate payment.');
        setSaving(false);
        return;
      }
    }
    
    // If already unlocked, just save
    await finalizeSave(formData);
  };

  const finalizeSave = async (formData) => {
    setSaving(true);
    formData.append('templateId', templateId);
    try {
      const res = await portfolioAPI.create(formData);
      setPortfolio(res.data.portfolio);
      setActiveView('preview');
      toast.success('🎉 Portfolio saved! Your live URL is ready.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save portfolio.');
    } finally {
      setSaving(false);
    }
  };

  const portfolioUrl = portfolio?.publicSlug
    ? `${window.location.origin}/portfolio/view/${portfolio.publicSlug}`
    : null;

  const handleCopyUrl = () => {
    if (portfolioUrl) {
      navigator.clipboard.writeText(portfolioUrl);
      setCopied(true);
      toast.success('Portfolio URL copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="page-wrapper">
      <div className="container py-4 py-md-5">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <h1 style={{ fontSize: 30, fontWeight: 800 }}>
            Portfolio <span className="gradient-text">Builder</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 0 }}>
            Fill in your details, pick a template, and get a live shareable URL.
          </p>
        </motion.div>

        {/* Live URL Banner */}
        {portfolioUrl && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="url-banner mb-4">
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ExternalLink size={18} color="#4ade80" />
            </div>
            <div className="flex-grow-1" style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#4ade80', marginBottom: 2 }}>🎉 Your Portfolio is Live!</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{portfolioUrl}</div>
            </div>
            <div className="d-flex gap-2 flex-shrink-0">
              <button onClick={handleCopyUrl} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>
                {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied!' : 'Copy'}
              </button>
              <a href={portfolioUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                <ExternalLink size={14} /> View
              </a>
            </div>
          </motion.div>
        )}

        {/* Template Selector */}
        <div className="glass-card p-4 mb-4">
          <TemplateCard selected={templateId} onSelect={setTemplateId} unlockedTemplates={unlockedTemplates} />
        </div>

        {/* View Toggle */}
        <div className="auth-tab-bar mb-4" style={{ maxWidth: 300 }}>
          {[['form', '✏️ Edit Details'], ['preview', '👁️ Preview']].map(([view, label]) => (
            <button key={view} className={`auth-tab-btn ${activeView === view ? 'active' : ''}`}
              onClick={() => setActiveView(view)}>
              {label}
            </button>
          ))}
        </div>

        {/* Form View */}
        {activeView === 'form' && (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-4">
            <h5 className="mb-4" style={{ fontWeight: 700 }}>Your Information</h5>
            <PortfolioForm
              initialData={portfolio || { name: user?.name, email: user?.email }}
              onSubmit={handleSave}
              loading={saving}
            />
          </motion.div>
        )}

        {/* Preview View */}
        {activeView === 'preview' && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
            {portfolio ? (
              <PortfolioPreview portfolio={portfolio} templateId={templateId} />
            ) : (
              <div className="glass-card p-5 text-center">
                <div style={{ fontSize: 48, marginBottom: 16 }}>🎨</div>
                <h5 style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>No portfolio yet</h5>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
                  Fill in the Edit Details form and save to generate your portfolio preview.
                </p>
                <button onClick={() => setActiveView('form')} className="btn-primary-zrv">
                  Fill in your details
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Portfolio;
