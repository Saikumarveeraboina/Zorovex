import { motion } from 'framer-motion';
import { CheckCircle2, ExternalLink, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getDifficultyClass } from '../../utils/helpers';

const ProblemRow = ({ problem, onMarkDone, markingId }) => {
  const isMarking = markingId === problem.id;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className={`problem-row ${problem.completed ? 'done' : ''} ${problem.isLocked ? 'locked' : ''}`}
      style={{ opacity: problem.isLocked ? 0.6 : 1 }}
    >
      {/* Left: status + title + badge */}
      <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ minWidth: 0 }}>
        <div style={{
          width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: problem.completed ? 'rgba(34,197,94,0.15)' : 'rgba(139,92,246,0.1)',
          border: `1px solid ${problem.completed ? 'rgba(34,197,94,0.3)' : 'rgba(139,92,246,0.2)'}`,
        }}>
          {problem.completed
            ? <CheckCircle2 size={14} color="#4ade80" />
            : <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--purple-400)' }} />
          }
        </div>

        <span style={{
          fontSize: 14, fontWeight: 500,
          color: problem.completed ? 'var(--text-secondary)' : 'var(--text-primary)',
          textDecoration: problem.completed ? 'line-through' : 'none',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {problem.title}
        </span>

        <span className={`badge-${(problem.difficulty || 'medium').toLowerCase()}`} style={{ flexShrink: 0 }}>
          {problem.difficulty}
        </span>
      </div>

      {/* Right: action buttons */}
      <div className="d-flex gap-2 flex-shrink-0">
        {problem.isLocked ? (
          <Link to="/#pricing" className="btn-locked" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '6px 12px', borderRadius: 6, fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
            <Lock size={12} /> Pro Only
          </Link>
        ) : (
          <>
            <a href={problem.link} target="_blank" rel="noopener noreferrer" className="btn-solve">
              <ExternalLink size={12} /> Solve
            </a>

            {!problem.completed ? (
              <button className="btn-mark" onClick={() => onMarkDone(problem.id)} disabled={isMarking}>
                <CheckCircle2 size={12} />
                {isMarking ? 'Saving…' : 'Mark Done'}
              </button>
            ) : (
              <span className="btn-done-badge">
                <CheckCircle2 size={12} /> Done
              </span>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default ProblemRow;
