import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCcw, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { dsaAPI } from '../services/api';
import CompanySelector from '../components/dsa/CompanySelector';
import TopicCard from '../components/dsa/TopicCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const DSA = () => {
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [overallProgress, setOverallProgress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [markingId, setMarkingId] = useState(null);

  useEffect(() => {
    dsaAPI.getUserProgress()
      .then(res => {
        const map = {};
        res.data.byCompany.forEach(({ company, percentage }) => { map[company] = { percentage }; });
        setOverallProgress(map);
      })
      .catch(() => {});
  }, []);

  const handleCompanySelect = async (company) => {
    setSelectedCompany(company);
    setLoading(true);
    setCompanyData(null);
    try {
      const res = await dsaAPI.getCompanyProblems(company);
      setCompanyData(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load problems.');
      setSelectedCompany(null);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDone = async ({ id, topic }) => {
    setMarkingId(id);
    try {
      await dsaAPI.markDone({ company: selectedCompany, topic, problemId: id });
      setCompanyData(prev => {
        if (!prev) return prev;
        const topics = { ...prev.topics };
        topics[topic] = topics[topic].map(p => p.id === id ? { ...p, completed: true } : p);
        const stats = { ...prev.stats };
        stats.completed += 1;
        stats.percentage = Math.round((stats.completed / stats.total) * 100);
        
        const topicStats = { ...stats.topicStats };
        topicStats[topic] = { ...topicStats[topic] };
        topicStats[topic].completed += 1;
        topicStats[topic].percentage = Math.round((topicStats[topic].completed / topicStats[topic].total) * 100);
        stats.topicStats = topicStats;
        
        return { ...prev, topics, stats };
      });
      toast.success('✅ Problem marked as done!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark problem.');
    } finally {
      setMarkingId(null);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container py-4 py-md-5">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <h1 style={{ fontSize: 30, fontWeight: 800 }}>
            DSA <span className="gradient-text">Practice</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 0 }}>
            Curated problem sets for top tech companies. Select your target below.
          </p>
        </motion.div>

        {/* Company Selector */}
        <CompanySelector selected={selectedCompany} onSelect={handleCompanySelect} progressByCompany={overallProgress} />

        {/* Problem List */}
        {selectedCompany && (
          <div className="mt-4">
            {/* Sub-header */}
            <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
              <button onClick={() => { setSelectedCompany(null); setCompanyData(null); }}
                className="btn-ghost-zrv" style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '7px 14px' }}>
                <ChevronLeft size={15} /> Back
              </button>
              <h2 className="mb-0 flex-grow-1" style={{ fontSize: 20, fontWeight: 700 }}>
                {selectedCompany} Problems
              </h2>
              {companyData && (
                <>
                  <span style={{ padding: '7px 14px', borderRadius: 8, background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', fontSize: 13, color: 'var(--purple-400)', fontWeight: 700 }}>
                    {companyData.stats.completed}/{companyData.stats.total} ({companyData.stats.percentage}%)
                  </span>
                  <button onClick={() => handleCompanySelect(selectedCompany)}
                    style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: 8, cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
                    <RefreshCcw size={15} />
                  </button>
                </>
              )}
            </div>

            {/* Overall progress bar */}
            {companyData && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-3 mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Overall completion</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: companyData.stats.percentage === 100 ? '#4ade80' : 'var(--purple-400)' }}>
                    {companyData.stats.percentage}%
                  </span>
                </div>
                <div className="progress-zrv" style={{ height: 10 }}>
                  <motion.div className="progress-zrv-fill" initial={{ width: 0 }}
                    animate={{ width: `${companyData.stats.percentage}%` }} transition={{ duration: 0.8 }} />
                </div>
              </motion.div>
            )}

            {loading && (
              <div className="d-flex justify-content-center py-5">
                <LoadingSpinner />
              </div>
            )}

            {!loading && companyData && Object.entries(companyData.topics).map(([topic, problems]) => (
              <TopicCard key={topic} topic={topic} problems={problems}
                stats={companyData.stats.topicStats[topic]}
                onMarkDone={handleMarkDone} markingId={markingId} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!selectedCompany && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="text-center py-5 mt-3">
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
            <h5 style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>Select a company above to begin</h5>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 0 }}>
              Pick your target company and we'll show you the curated problem set with your progress.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DSA;
