import { motion } from 'framer-motion';
import { CheckCircle2, Zap, Crown, Sparkles, Lock } from 'lucide-react';

const TEMPLATES = [
  {
    id: 1,
    name: 'Basic',
    price: 0,
    priceLabel: 'FREE',
    desc: 'Clean, minimal layout for software engineers',
    accent: '#8b5cf6',
    gradient: 'linear-gradient(135deg,#7c3aed,#3b82f6)',
    preview: '💻',
    icon: Sparkles,
    features: ['GitHub Projects', 'Skills Matrix', 'Timeline Education'],
    locked: false,
  },
  {
    id: 2,
    name: 'Minimal',
    price: 49,
    priceLabel: '₹49',
    desc: 'Bold, colorful design for creative & design roles',
    accent: '#f472b6',
    gradient: 'linear-gradient(135deg,#ec4899,#8b5cf6)',
    preview: '🎨',
    icon: Zap,
    features: ['Visual Skills Bar', 'Certificate Showcase', 'Project Gallery'],
    locked: true,
  },
  {
    id: 3,
    name: 'Pro',
    price: 99,
    priceLabel: '₹99',
    desc: 'Executive-grade professional resume layout',
    accent: '#22d3ee',
    gradient: 'linear-gradient(135deg,#06b6d4,#3b82f6)',
    preview: '🏆',
    icon: Crown,
    features: ['Achievement Metrics', 'Work Timeline', 'Summary Headline'],
    locked: true,
  },
];

const TemplateCard = ({ selected, onSelect, unlockedTemplates = [1] }) => (
  <div>
    <p className="form-label-zrv mb-3">Choose Template</p>
    <div className="row g-3">
      {TEMPLATES.map((tpl, i) => {
        const isSelected  = selected === tpl.id;
        const isUnlocked  = !tpl.locked || unlockedTemplates.includes(tpl.id);
        const Icon        = tpl.icon;

        return (
          <div key={tpl.id} className="col-12 col-md-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => onSelect(tpl.id)}
              className={`template-card ${isSelected ? 'selected' : ''}`}
              style={{ borderColor: isSelected ? tpl.accent : undefined, cursor: 'pointer' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Preview Banner */}
              <div style={{ height: 90, background: tpl.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, position: 'relative' }}>
                {tpl.preview}

                {/* Selected check */}
                {isSelected && (
                  <div style={{ position: 'absolute', top: 8, right: 8, background: '#fff', borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle2 size={15} color={tpl.accent} />
                  </div>
                )}

                {/* Lock icon for paid templates */}
                {!isUnlocked && (
                  <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.6)', borderRadius: 8, padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Lock size={11} color="#facc15" />
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#facc15' }}>PAID</span>
                  </div>
                )}

                {isUnlocked && tpl.price === 0 && (
                  <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.5)', borderRadius: 8, padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Sparkles size={10} color="#4ade80" />
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#4ade80' }}>FREE</span>
                  </div>
                )}

                {isUnlocked && tpl.price > 0 && (
                  <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.5)', borderRadius: 8, padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle2 size={10} color="#4ade80" />
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#4ade80' }}>UNLOCKED</span>
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="p-3">
                <div className="d-flex align-items-center justify-content-between mb-1">
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{tpl.name}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                    <span style={{ fontSize: 17, fontWeight: 900, color: tpl.price === 0 ? '#4ade80' : tpl.accent }}>
                      {tpl.priceLabel}
                    </span>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10, lineHeight: 1.5 }}>{tpl.desc}</div>
                <ul className="list-unstyled mb-0">
                  {tpl.features.map(f => (
                    <li key={f} className="d-flex align-items-center gap-2 mb-1" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: tpl.accent, flexShrink: 0 }} />
                      {f}
                    </li>
                  ))}
                </ul>

                {!isUnlocked && (
                  <div style={{ marginTop: 10, padding: '6px 12px', borderRadius: 8, background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.25)', fontSize: 12, color: '#facc15', textAlign: 'center', fontWeight: 600 }}>
                    🔒 Click to unlock with Razorpay
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        );
      })}
    </div>
  </div>
);

export default TemplateCard;
