import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, MapPin, Clock, DollarSign, ExternalLink, Lock, CheckCircle2, Filter, Building2, Sparkles, Calendar, ChevronDown, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import { jobAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';

const typeLabels = { walkin: '🚶 Walk-In', offcampus: '🌐 Off Campus' };
const typeBadgeColors = {
  walkin:    { bg: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: 'rgba(251,191,36,0.3)' },
  offcampus: { bg: 'rgba(96,165,250,0.12)', color: '#60a5fa', border: 'rgba(96,165,250,0.3)' },
};

const Jobs = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | walkin | offcampus
  const [applyingId, setApplyingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    loadJobs();
  }, [filter]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const type = filter === 'all' ? undefined : filter;
      const res = await jobAPI.getAll(type);
      setJobs(res.data);
    } catch {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId) => {
    if (!isAuthenticated) {
      navigate('/login?tab=register');
      return;
    }
    if (!user?.isPro) {
      toast.error('Only Pro members can apply. Upgrade to Pro!');
      return;
    }

    setApplyingId(jobId);
    try {
      await jobAPI.apply(jobId);
      toast.success('🎉 Application submitted!');
      // Update local state
      setJobs(prev => prev.map(j =>
        j._id === jobId ? { ...j, applicationStatus: 'applied' } : j
      ));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply.');
    } finally {
      setApplyingId(null);
    }
  };

  const isDeadlinePassed = (deadline) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  const formatDeadline = (d) => {
    if (!d) return null;
    const date = new Date(d);
    const now = new Date();
    const diff = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    const formatted = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    if (diff < 0) return { text: `Expired ${formatted}`, urgent: true };
    if (diff <= 3) return { text: `${diff}d left — ${formatted}`, urgent: true };
    return { text: formatted, urgent: false };
  };

  return (
    <div className="page-wrapper">
      <div className="container py-4 py-md-5">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <h1 style={{ fontSize: 30, fontWeight: 800 }}>
            Job <span className="gradient-text">Portal</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 0 }}>
            Walk-in drives and off-campus opportunities curated for you.
            {!user?.isPro && (
              <span style={{ color: '#f472b6', fontWeight: 600 }}> Pro members only — upgrade to apply.</span>
            )}
          </p>
        </motion.div>

        {/* Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="d-flex gap-2 mb-4 flex-wrap align-items-center"
        >
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 14px', borderRadius: 10,
            background: 'rgba(139,92,246,0.08)',
            border: '1px solid rgba(139,92,246,0.15)',
            color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600,
          }}>
            <Filter size={14} /> Filter:
          </div>
          {[
            { key: 'all', label: '📋 All Jobs' },
            { key: 'walkin', label: '🚶 Walk-In' },
            { key: 'offcampus', label: '🌐 Off Campus' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={{
                padding: '8px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                border: filter === key ? '1px solid rgba(139,92,246,0.5)' : '1px solid var(--border)',
                background: filter === key ? 'rgba(139,92,246,0.15)' : 'transparent',
                color: filter === key ? '#a78bfa' : 'var(--text-secondary)',
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
              }}
            >
              {label}
            </button>
          ))}
          <div className="ms-auto" style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {jobs.length} job{jobs.length !== 1 ? 's' : ''} found
          </div>
        </motion.div>

        {/* Pro Upgrade Banner (for non-pro users) */}
        {isAuthenticated && !user?.isPro && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-4"
            style={{
              padding: '16px 20px', borderRadius: 14,
              background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(59,130,246,0.08))',
              border: '1px solid rgba(139,92,246,0.25)',
              display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Lock size={18} color="#a78bfa" />
            </div>
            <div className="flex-grow-1">
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                🔒 Pro Membership Required
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                You can browse jobs, but only paid Pro members can apply. Trial access does not include job applications.
              </div>
            </div>
            <button
              onClick={() => navigate('/#pricing')}
              className="btn-primary-zrv"
              style={{ padding: '10px 20px', fontSize: 13, fontWeight: 700, flexShrink: 0 }}
            >
              <Sparkles size={14} /> Upgrade to Pro
            </button>
          </motion.div>
        )}

        {/* Loading */}
        {loading && (
          <div className="d-flex justify-content-center py-5">
            <LoadingSpinner />
          </div>
        )}

        {/* Empty State */}
        {!loading && jobs.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-5">
            <div style={{ fontSize: 48, marginBottom: 12 }}>💼</div>
            <h5 style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>No jobs posted yet</h5>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              Check back soon — new walk-in and off-campus opportunities are updated regularly.
            </p>
          </motion.div>
        )}

        {/* Job Cards */}
        {!loading && (
          <div className="d-flex flex-column gap-3">
            {jobs.map((job, i) => {
              const deadlineInfo = formatDeadline(job.deadline);
              const expired = isDeadlinePassed(job.deadline);
              const applied = job.applicationStatus === 'applied';
              const isExpanded = expandedId === job._id;
              const tBadge = typeBadgeColors[job.type] || typeBadgeColors.offcampus;

              return (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="glass-card"
                  style={{
                    padding: '20px 24px',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s',
                    borderColor: isExpanded ? 'rgba(139,92,246,0.3)' : undefined,
                  }}
                  onClick={() => setExpandedId(isExpanded ? null : job._id)}
                >
                  {/* Top Row */}
                  <div className="d-flex align-items-start gap-3" style={{ flexWrap: 'wrap' }}>
                    {/* Company Icon */}
                    <div style={{
                      width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                      background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(59,130,246,0.1))',
                      border: '1px solid rgba(139,92,246,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 20, fontWeight: 800, color: '#a78bfa',
                    }}>
                      {job.company?.[0] || '?'}
                    </div>

                    {/* Title & Meta */}
                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                      <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                        <h5 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 0 }}>
                          {job.title}
                        </h5>
                        <span style={{
                          padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                          background: tBadge.bg, color: tBadge.color, border: `1px solid ${tBadge.border}`,
                          whiteSpace: 'nowrap',
                        }}>
                          {typeLabels[job.type]}
                        </span>
                      </div>
                      <div className="d-flex flex-wrap gap-3" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Building2 size={13} /> {job.company}
                        </span>
                        {job.location && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <MapPin size={13} /> {job.location}
                          </span>
                        )}
                        {job.salary && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <DollarSign size={13} /> {job.salary}
                          </span>
                        )}
                        {job.experience && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Clock size={13} /> {job.experience}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: Deadline + Apply */}
                    <div className="d-flex flex-column align-items-end gap-2" style={{ flexShrink: 0 }}>
                      {deadlineInfo && (
                        <span style={{
                          fontSize: 12, fontWeight: 600,
                          color: deadlineInfo.urgent ? '#f87171' : 'var(--text-muted)',
                          display: 'flex', alignItems: 'center', gap: 4,
                        }}>
                          <Calendar size={12} /> {deadlineInfo.text}
                        </span>
                      )}
                      {applied ? (
                        <span style={{
                          padding: '8px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                          background: 'rgba(74,222,128,0.1)', color: '#4ade80',
                          border: '1px solid rgba(74,222,128,0.3)',
                          display: 'flex', alignItems: 'center', gap: 6,
                        }}>
                          <CheckCircle2 size={14} /> Applied
                        </span>
                      ) : expired ? (
                        <span style={{
                          padding: '8px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                          background: 'rgba(248,113,113,0.08)', color: '#f87171',
                          border: '1px solid rgba(248,113,113,0.2)',
                        }}>
                          Expired
                        </span>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleApply(job._id); }}
                          disabled={applyingId === job._id}
                          className="btn-primary-zrv"
                          style={{ padding: '8px 20px', fontSize: 13, fontWeight: 700 }}
                        >
                          {applyingId === job._id ? 'Applying...' : (
                            !isAuthenticated || !user?.isPro ? (
                              <><Lock size={13} /> Pro Only</>
                            ) : (
                              <><Send size={13} /> Apply Now</>
                            )
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                          {/* Skills */}
                          {job.skills?.length > 0 && (
                            <div className="mb-3">
                              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Skills Required</div>
                              <div className="d-flex flex-wrap gap-2">
                                {job.skills.map(s => (
                                  <span key={s} style={{
                                    padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                                    background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', color: '#a78bfa',
                                  }}>
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Description */}
                          {job.description && (
                            <div className="mb-3">
                              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Description</div>
                              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 0, whiteSpace: 'pre-wrap' }}>
                                {job.description}
                              </p>
                            </div>
                          )}

                          {/* Apply Link */}
                          {job.applyLink && (
                            <a
                              href={job.applyLink}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                                background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.3)',
                                color: '#60a5fa', textDecoration: 'none', transition: 'all 0.2s',
                              }}
                            >
                              <ExternalLink size={13} /> Company Apply Page
                            </a>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Expand indicator */}
                  <div className="text-center mt-2">
                    <ChevronDown
                      size={16}
                      color="var(--text-muted)"
                      style={{
                        transition: 'transform 0.2s',
                        transform: isExpanded ? 'rotate(180deg)' : 'none',
                        opacity: 0.5,
                      }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;
