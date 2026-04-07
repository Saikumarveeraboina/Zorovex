import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Code2, Briefcase, Clock, TrendingUp, ArrowRight, Calendar, CheckCircle2 } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { dsaAPI } from '../services/api';
import { getTrialDaysRemaining, getTrialEndDate, getInitials, formatDate } from '../utils/helpers';
import LoadingSpinner from '../components/common/LoadingSpinner';

const companyColors = { TCS: '#3b82f6', Amazon: '#f59e0b', Google: '#10b981', Microsoft: '#a78bfa', Flipkart: '#f472b6' };

const Dashboard = () => {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);

  const trialRemaining = getTrialDaysRemaining(user?.trialStart);
  const trialEnd = getTrialEndDate(user?.trialStart);
  const trialPct = Math.round(((30 - trialRemaining) / 30) * 100);

  useEffect(() => {
    dsaAPI.getUserProgress()
      .then(r => setProgressData(r.data))
      .catch(() => setProgressData({ byCompany: [], totalCompleted: 0, grandTotal: 0, overallPercentage: 0 }))
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { icon: Code2,      label: 'Problems Solved',   value: loading ? '...' : (progressData?.totalCompleted || 0),           color: '#a78bfa', bg: 'rgba(139,92,246,0.12)', link: '/dsa' },
    { icon: TrendingUp, label: 'Overall Progress',   value: loading ? '...' : `${progressData?.overallPercentage || 0}%`,  color: '#60a5fa', bg: 'rgba(96,165,250,0.12)',  link: '/dsa' },
    { icon: Briefcase,  label: 'Portfolio',          value: 'Build Now',                                  color: '#22d3ee', bg: 'rgba(34,211,238,0.12)',  link: '/portfolio' },
    { icon: Clock,      label: 'Trial Days Left',    value: trialRemaining,                               color: trialRemaining <= 5 ? '#f87171' : '#4ade80', bg: trialRemaining <= 5 ? 'rgba(248,113,113,0.12)' : 'rgba(74,222,128,0.12)' },
  ];

  return (
    <div className="page-wrapper">
      <div className="container py-5">

        {/* Welcome Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="d-flex align-items-center gap-3 mb-4 flex-wrap">
          <div className="user-avatar" style={{ width: 60, height: 60, fontSize: 22, boxShadow: '0 8px 24px rgba(124,58,237,0.4)' }}>
            {getInitials(user?.name)}
          </div>
          <div>
            <h1 className="mb-1" style={{ fontSize: 26, fontWeight: 800 }}>
              Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>! 👋
            </h1>
            <p className="mb-0" style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              Member since {formatDate(user?.createdAt)} · {user?.email}
            </p>
          </div>
        </motion.div>

        {/* Stats Row */}
        <div className="row g-3 mb-4">
          {stats.map(({ icon: Icon, label, value, color, bg, link }, i) => (
            <div key={label} className="col-6 col-lg-3">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className="stat-card">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div className="stat-icon-wrap" style={{ background: bg, border: `1px solid ${color}40` }}>
                    <Icon size={20} color={color} />
                  </div>
                  {link && (
                    <Link to={link} style={{ fontSize: 12, color, fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                      View <ArrowRight size={12} />
                    </Link>
                  )}
                </div>
                <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)' }}>{value}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{label}</div>
              </motion.div>
            </div>
          ))}
        </div>

        {/* Trial Banner */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="trial-banner mb-4">
          <div className="row align-items-center g-3">
            <div className="col-12 col-md-7">
              <div className="d-flex align-items-center gap-3">
                <div className="stat-icon-wrap mb-0" style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)', width: 46, height: 46, borderRadius: 13 }}>
                  <Calendar size={20} color="#a78bfa" />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {trialRemaining > 0 ? `${trialRemaining} days remaining in free trial` : 'Free trial expired'}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    {trialRemaining > 0 ? `Trial ends on ${trialEnd}` : 'Upgrade to continue'}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-5">
              <div className="d-flex justify-content-between mb-1">
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Trial used</span>
                <span style={{ fontSize: 12, color: 'var(--purple-400)', fontWeight: 700 }}>{trialPct}%</span>
              </div>
              <div className="progress-zrv">
                <motion.div className="progress-zrv-fill" initial={{ width: 0 }} animate={{ width: `${trialPct}%` }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  style={{ background: trialRemaining <= 5 ? 'linear-gradient(90deg,#ef4444,#f87171)' : undefined }} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Company Progress */}
        {progressData?.byCompany?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="glass-card p-4 mb-4">
            <h5 className="mb-4" style={{ fontWeight: 700 }}>Company Progress</h5>
            <div className="d-flex flex-column gap-3">
              {progressData.byCompany.map(({ company, completed, total, percentage }) => (
                <div key={company}>
                  <div className="d-flex justify-content-between mb-1">
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{company}</span>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{completed}/{total} ({percentage}%)</span>
                  </div>
                  <div className="progress-zrv">
                    <motion.div className="progress-zrv-fill" initial={{ width: 0 }} animate={{ width: `${percentage}%` }}
                      transition={{ delay: 0.5, duration: 0.8 }}
                      style={{ background: `linear-gradient(90deg,${companyColors[company] || '#8b5cf6'},${companyColors[company] || '#3b82f6'})` }} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h5 className="mb-3" style={{ fontWeight: 700 }}>Quick Actions</h5>
          <div className="row g-3">
            {[
              { to: '/dsa',       icon: Code2,     iconColor: '#a78bfa', iconBg: 'rgba(139,92,246,0.15)', title: 'Practice DSA',    sub: 'Continue your streak' },
              { to: '/portfolio', icon: Briefcase, iconColor: '#22d3ee', iconBg: 'rgba(34,211,238,0.12)', title: 'Build Portfolio',  sub: 'Get a live URL' },
            ].map(({ to, icon: Icon, iconColor, iconBg, title, sub }) => (
              <div key={to} className="col-12 col-md-6">
                <Link to={to} className="glass-card d-flex align-items-center gap-3 p-3 text-decoration-none">
                  <div className="stat-icon-wrap mb-0" style={{ background: iconBg, width: 44, height: 44, borderRadius: 12 }}>
                    <Icon size={20} color={iconColor} />
                  </div>
                  <div className="flex-grow-1">
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{sub}</div>
                  </div>
                  <ArrowRight size={18} color="var(--text-muted)" />
                </Link>
              </div>
            ))}
            {progressData?.totalCompleted === 0 && (
              <div className="col-12">
                <div className="glass-card d-flex align-items-center gap-3 p-3">
                  <div className="stat-icon-wrap mb-0" style={{ background: 'rgba(74,222,128,0.12)', width: 44, height: 44, borderRadius: 12 }}>
                    <CheckCircle2 size={20} color="#4ade80" />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>Complete your first problem!</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Solve a DSA problem to start tracking progress</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Dashboard;
