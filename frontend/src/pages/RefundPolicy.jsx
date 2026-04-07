import { motion } from 'framer-motion';

const RefundPolicy = () => {
  return (
    <div className="page-wrapper">
      <div className="container py-5">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5 text-center">
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800 }}>
            Refund <span className="gradient-text">Policy</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, margin: '0 auto' }}>
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-4 p-md-5 mx-auto" style={{ maxWidth: 800 }}>
          <div style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            <h4 style={{ color: 'var(--text-primary)', fontWeight: 700, marginTop: '1rem', marginBottom: '1rem' }} className="pt-0 mt-0">1. Pro Subscription Refunds</h4>
            <p>
              We want you to be fully satisfied with our Pro Subscription. If you are not completely satisfied with our premium features, you may request a refund within <strong>7 days</strong> of your initial purchase.
            </p>
            <p>
              To request a refund, please contact our support team at support@zorovex.com with your account details and the reason for your request.
            </p>

            <h4 style={{ color: 'var(--text-primary)', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem' }}>2. Eligibility for Refunds</h4>
            <p>
              Refunds are only available for the first-time purchase of a Zorovex Pro subscription. Renewals or subsequent purchases are non-refundable. We reserve the right to decline refund requests if there is evidence of significant usage of Pro features (such as bulk downloading templates or extensive use of restricted content) during the 7-day period.
            </p>

            <h4 style={{ color: 'var(--text-primary)', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem' }}>3. Processing Time</h4>
            <p>
              Once your refund request is approved, we will initiate a refund to your original method of payment (via Razorpay). You will receive the credit within 5-10 business days, depending on your card issuer's policies.
            </p>

            <h4 style={{ color: 'var(--text-primary)', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem' }}>4. Exceptional Circumstances</h4>
            <p>
              If there are technical issues preventing you from accessing the Pro features that our support team cannot resolve, we may, at our discretion, issue a full or partial refund outside of the standard 7-day window.
            </p>

            <h4 style={{ color: 'var(--text-primary)', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem' }}>5. Contact</h4>
            <p>
              For any questions regarding this Refund Policy or to initiate a refund request, please email us at support@zorovex.com.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RefundPolicy;
