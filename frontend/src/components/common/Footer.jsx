import { Zap, GitBranch, MessageCircle, Globe, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const InstagramIcon = ({ size = 20, color = "currentColor", ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const Footer = () => (
  <footer className="zrv-footer">
    <div className="container">
      <div className="row g-4 mb-4">
        {/* Brand */}
        <div className="col-12 col-md-4">
          <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none mb-3">
            <div className="navbar-brand-logo" style={{ width: 34, height: 34 }}>
              <Zap size={16} color="#fff" fill="#fff" />
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              <span className="gradient-text">Zorovex</span>
            </span>
          </Link>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7, maxWidth: 240 }}>
            Crack top company interviews with structured DSA paths and a stunning portfolio builder.
          </p>
          <div className="d-flex gap-2 mt-3">
            {[
              { icon: InstagramIcon, href: 'https://www.instagram.com/zorovex.in' },
              { icon: MessageCircle, href: '#' },
              { icon: Globe, href: '#' },
              { icon: Mail, href: '/contact' }
            ].map(({ icon: Icon, href }, i) => (
              <a key={i} href={href} target={href !== '#' && href !== '/contact' ? "_blank" : "_self"} rel="noreferrer" className="footer-social-btn">
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        {/* Product */}
        <div className="col-6 col-md-2 offset-md-2">
          <h6 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Product</h6>
          <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
            {[['DSA Practice', '/dsa'], ['Portfolio Builder', '/portfolio'], ['Dashboard', '/dashboard']].map(([label, to]) => (
              <li key={label}>
                <Link to={to} style={{ color: 'var(--text-secondary)', fontSize: 14, textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--purple-400)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                >{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Companies */}
        <div className="col-6 col-md-2">
          <h6 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Companies</h6>
          <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
            {['Amazon', 'Google', 'Microsoft', 'TCS', 'Flipkart'].map(c => (
              <li key={c}>
                <Link to="/dsa" style={{ color: 'var(--text-secondary)', fontSize: 14, textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--purple-400)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                >{c}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal */}
        <div className="col-6 col-md-2">
          <h6 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Legal</h6>
          <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
            {[['Privacy Policy', '/privacy-policy'], ['Terms of Service', '/terms-of-service'], ['Refund Policy', '/refund-policy'], ['Contact Us', '/contact']].map(([item, to]) => (
              <li key={item}>
                <Link to={to} style={{ color: 'var(--text-secondary)', fontSize: 14, textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--purple-400)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                >{item}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2" style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
        <p className="mb-0" style={{ color: 'var(--text-muted)', fontSize: 13 }}>
          © {new Date().getFullYear()} Zorovex. All rights reserved.
        </p>
        <p className="mb-0" style={{ color: 'var(--text-muted)', fontSize: 13 }}>
          Built with ❤️ for Indian developers
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
