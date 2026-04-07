import { motion } from 'framer-motion';

const PrivacyPolicy = () => {
  return (
    <div className="page-wrapper">
      <div className="container py-5">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5 text-center">
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800 }}>
            Privacy <span className="gradient-text">Policy</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, margin: '0 auto' }}>
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-4 p-md-5 mx-auto" style={{ maxWidth: 800 }}>
          <div style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            <h4 style={{ color: 'var(--text-primary)', fontWeight: 700, marginTop: '1rem', marginBottom: '1rem' }} className="pt-0 mt-0">1. Information We Collect</h4>
            <p>
              We collect information you provide directly to us when you create an account, update your profile, or use our services. This may include your name, email address, password, and any portfolio or DSA progress data you generate on our platform.
            </p>

            <h4 style={{ color: 'var(--text-primary)', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem' }}>2. How We Use Your Information</h4>
            <p>
              We use the collected information to:
            </p>
            <ul>
              <li>Provide, maintain, and improve our services.</li>
              <li>Process transactions and send related information.</li>
              <li>Send technical notices, updates, security alerts, and support messages.</li>
              <li>Personalize your experience through portoflio builder and DSA tracker.</li>
            </ul>

            <h4 style={{ color: 'var(--text-primary)', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem' }}>3. Data Security</h4>
            <p>
              We implement appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure.
            </p>

            <h4 style={{ color: 'var(--text-primary)', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem' }}>4. Changes to This Privacy Policy</h4>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>

            <h4 style={{ color: 'var(--text-primary)', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem' }}>5. Contact Us</h4>
            <p>
              If you have any questions about this Privacy Policy, please contact us at support@zorovex.com.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
