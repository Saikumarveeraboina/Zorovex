import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { getDifficultyClass } from '../../utils/helpers';

const companies = [
  { id: 'TCS',       name: 'TCS',       logo: '🏢', color: '#3b82f6', desc: 'Entry-level focused',  problems: '120+ problems' },
  { id: 'Amazon',    name: 'Amazon',    logo: '📦', color: '#f59e0b', desc: 'SDE-1 & SDE-2',         problems: '120+ problems' },
  { id: 'Google',    name: 'Google',    logo: '🔍', color: '#10b981', desc: 'L3 & L4 level',          problems: '120+ problems' },
  { id: 'Microsoft', name: 'Microsoft', logo: '🪟', color: '#a78bfa', desc: 'SDE-1 & SDE-2',         problems: '120+ problems' },
  { id: 'Flipkart',  name: 'Flipkart',  logo: '🛒', color: '#f472b6', desc: 'SDE-1 focused',         problems: '120+ problems' },
];

const CompanySelector = ({ selected, onSelect, progressByCompany = {} }) => (
  <div>
    <p className="form-label-zrv mb-3">Select Target Company</p>
    <div className="row g-3">
      {companies.map((company, i) => {
        const isSelected = selected === company.id;
        const progress = progressByCompany?.[company.id];

        return (
          <div key={company.id} className="col-6 col-sm-4 col-lg">
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              onClick={() => onSelect(company.id)}
              className={`company-card ${isSelected ? 'selected' : ''}`}
              style={{
                borderColor: isSelected ? company.color : undefined,
                background: isSelected ? `rgba(${hexToRgb(company.color)}, 0.1)` : undefined,
                position: 'relative',
              }}
              whileHover={{ scale: 1.03, translateY: -3 }}
              whileTap={{ scale: 0.97 }}
            >
              {isSelected && (
                <span style={{ position: 'absolute', top: 9, right: 9, width: 20, height: 20, borderRadius: '50%', background: company.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={12} color="#fff" />
                </span>
              )}
              <div style={{ fontSize: 26, marginBottom: 8 }}>{company.logo}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: isSelected ? company.color : 'var(--text-primary)', marginBottom: 3 }}>
                {company.name}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>{company.desc}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{company.problems}</div>

              {progress && (
                <div className="mt-2">
                  <div className="progress-zrv" style={{ height: 4 }}>
                    <div className="progress-zrv-fill"
                      style={{ width: `${progress.percentage}%`, background: `linear-gradient(90deg, ${company.color}, ${company.color}aa)` }} />
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>{progress.percentage}% done</div>
                </div>
              )}
            </motion.button>
          </div>
        );
      })}
    </div>
  </div>
);

function hexToRgb(hex) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? `${parseInt(r[1],16)}, ${parseInt(r[2],16)}, ${parseInt(r[3],16)}` : '139, 92, 246';
}

export default CompanySelector;
