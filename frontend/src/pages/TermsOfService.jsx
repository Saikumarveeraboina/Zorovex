import { motion } from 'framer-motion';

const TermsOfService = () => {
  return (
    <div className="page-wrapper">
      <div className="container py-5">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5 text-center">
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800 }}>
            Terms of <span className="gradient-text">Service</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, margin: '0 auto' }}>
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-4 p-md-5 mx-auto" style={{ maxWidth: 800 }}>
          <div style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            <h4 style={{ color: 'var(--text-primary)', fontWeight: 700, marginTop: '1rem', marginBottom: '1rem' }} className="pt-0 mt-0">1. Acceptance of Terms</h4>
            <p>
              By accessing and using Zorovex, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access our services.
            </p>

            <h4 style={{ color: 'var(--text-primary)', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem' }}>2. User Accounts</h4>
            <p>
              When you create an account with us, you must provide accurate and complete information. You are solely responsible for safeguarding the password that you use to access the service and for any activities or actions under your password.
            </p>

            <h4 style={{ color: 'var(--text-primary)', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem' }}>3. Acceptable Use</h4>
            <p>
              You agree not to use the service for any unlawful purpose or to violate any laws in your jurisdiction. You must not transmit any worms or viruses or any code of a destructive nature.
            </p>

            <h4 style={{ color: 'var(--text-primary)', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem' }}>4. Intellectual Property</h4>
            <p>
              The service and its original content, features, and functionality are and will remain the exclusive property of Zorovex and its licensors. User-generated content remains your property, but by uploading it, you grant us a license to use and display it in connection with our services.
            </p>

            <h4 style={{ color: 'var(--text-primary)', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem' }}>5. Termination</h4>
            <p>
              We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms in Conditions or Terms of Service.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsOfService;
