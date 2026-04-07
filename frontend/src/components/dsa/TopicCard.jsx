import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import ProblemRow from './ProblemRow';

const topicIcons = { Arrays: '📊', Strings: '📝', LinkedList: '🔗', Trees: '🌳', Graphs: '🕸️', 'Dynamic Programming': '📉' };

const TopicCard = ({ topic, problems, stats, onMarkDone, markingId }) => {
  const [expanded, setExpanded] = useState(false);
  const pct = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <motion.div layout className="topic-card">
      <button className="topic-header" onClick={() => setExpanded(!expanded)}>
        <div className="d-flex align-items-center gap-3 flex-grow-1">
          <span style={{ fontSize: 22 }}>{topicIcons[topic] || '⚡'}</span>
          <div className="text-start">
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{topic}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{stats.completed}/{stats.total} completed</div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-3">
          <div style={{ textAlign: 'right', minWidth: 44 }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: pct === 100 ? '#4ade80' : 'var(--purple-400)' }}>{pct}%</span>
          </div>
          <div style={{ width: 80 }}>
            <div className="progress-zrv">
              <div className="progress-zrv-fill"
                style={{ width: `${pct}%`, background: pct === 100 ? 'linear-gradient(90deg,#22c55e,#4ade80)' : undefined }} />
            </div>
          </div>
          <span style={{ color: 'var(--text-secondary)' }}>
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </span>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div key="problems"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden' }}>
            <div style={{ padding: '0 18px 18px', borderTop: '1px solid var(--border)', paddingTop: 14 }}>
              {problems.map(problem => (
                <ProblemRow key={problem.id} problem={problem}
                  onMarkDone={(id) => onMarkDone({ id, topic })}
                  markingId={markingId} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TopicCard;
