import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Menu, X, LogOut, LayoutDashboard, Code2, Briefcase } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { getInitials } from '../../utils/helpers';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/'); };

  const navLinks = isAuthenticated
    ? [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/dsa',       label: 'DSA',       icon: Code2 },
        { to: '/portfolio', label: 'Portfolio',  icon: Briefcase },
        { to: '/contact',   label: 'Contact',    icon: null },
      ]
    : [
        { to: '/#features', label: 'Features', icon: null },
        { to: '/#pricing',  label: 'Pricing',  icon: null },
        { to: '/contact',   label: 'Contact',    icon: null },
      ];

  return (
    <>
      <nav className={`zrv-navbar ${scrolled ? 'scrolled' : 'top'}`}>
        <div className="container">
          <div className="d-flex align-items-center justify-content-between w-100">
            {/* Logo */}
            <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none">
              <div className="navbar-brand-logo">
                <Zap size={18} color="#fff" fill="#fff" />
              </div>
              <span style={{ fontSize: 20, fontWeight: 800, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                <span className="gradient-text">Zorovex</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="d-none d-md-flex align-items-center gap-1">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`nav-link-zrv ${location.pathname === to ? 'active' : ''}`}
                >
                  {Icon && <Icon size={15} />}
                  {label}
                </Link>
              ))}
            </div>

            {/* Desktop Auth */}
            <div className="d-none d-md-flex align-items-center gap-2">
              {isAuthenticated ? (
                <>
                  <div className="user-chip">
                    <div className="user-avatar">{getInitials(user?.name)}</div>
                    <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.name?.split(' ')[0]}
                    </span>
                  </div>
                  <button onClick={handleLogout} className="btn-ghost-zrv">
                    <LogOut size={15} /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-ghost-zrv">Sign In</Link>
                  <Link to="/login?tab=register" className="btn-primary-zrv" style={{ padding: '9px 20px', fontSize: 14 }}>
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              className="d-flex d-md-none btn-ghost-zrv"
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{ padding: 8 }}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} className={`mobile-nav-link ${location.pathname === to ? 'active' : ''}`}>
                {Icon && <Icon size={18} />}
                {label}
              </Link>
            ))}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 8 }}>
              {isAuthenticated ? (
                <button onClick={handleLogout} className="mobile-nav-link w-100 text-start"
                  style={{ background: 'none', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit' }}>
                  <LogOut size={17} /> Logout
                </button>
              ) : (
                <div className="d-flex flex-column gap-2">
                  <Link to="/login" className="mobile-nav-link" style={{ border: '1px solid var(--border)', borderRadius: 10 }}>Sign In</Link>
                  <Link to="/login?tab=register" className="btn-primary-zrv w-100 justify-content-center">Get Started Free</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
