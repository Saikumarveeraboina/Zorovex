import { motion } from 'framer-motion';
import { ExternalLink, Star, GitBranch, Mail, Phone, MapPin, Award, GraduationCap } from 'lucide-react';

const PortfolioPreview = ({ portfolio, templateId = 1 }) => {
  if (!portfolio) return null;

  if (templateId === 2) return <Template2 p={portfolio} />;
  if (templateId === 3) return <Template3 p={portfolio} />;
  return <Template1 p={portfolio} />;
};

// ── Template 1 — Developer Pro ──────────────
const Template1 = ({ p }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    style={{
      background: 'linear-gradient(135deg, #0d0d1a 0%, #111127 100%)',
      border: '1px solid rgba(139,92,246,0.2)',
      borderRadius: 20,
      overflow: 'hidden',
      fontFamily: 'Inter, sans-serif',
    }}
  >
    {/* Header */}
    <div style={{
      background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(59,130,246,0.2))',
      padding: '40px 36px',
      borderBottom: '1px solid rgba(139,92,246,0.15)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, fontWeight: 800, color: '#fff', flexShrink: 0,
          boxShadow: '0 8px 24px rgba(124,58,237,0.4)',
        }}>
          {p.name?.[0] || '?'}
        </div>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 4 }}>{p.name || 'Your Name'}</h1>
          <p style={{ fontSize: 16, color: '#a78bfa', fontWeight: 600, marginBottom: 10 }}>{p.title || 'Software Developer'}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
            {p.email && <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#94a3b8' }}><Mail size={13} />{p.email}</span>}
            {p.phone && <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#94a3b8' }}><Phone size={13} />{p.phone}</span>}
            {p.location && <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#94a3b8' }}><MapPin size={13} />{p.location}</span>}
          </div>
        </div>
      </div>
      {p.bio && <p style={{ marginTop: 20, color: '#cbd5e1', fontSize: 14, lineHeight: 1.7, maxWidth: 600 }}>{p.bio}</p>}
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
      {/* Left column */}
      <div style={{ padding: '28px 30px', borderRight: '1px solid rgba(139,92,246,0.1)' }}>
        {/* Skills */}
        {p.skills?.length > 0 && (
          <Section title="Skills">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {p.skills.map((s) => (
                <span key={s} style={{ padding: '5px 12px', borderRadius: 999, background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.25)', color: '#a78bfa', fontSize: 12, fontWeight: 600 }}>{s}</span>
              ))}
            </div>
          </Section>
        )}

        {/* Education */}
        {p.education?.length > 0 && (
          <Section title="Education" icon={<GraduationCap size={16} />}>
            {p.education.filter(e => e.institution).map((edu, i) => (
              <div key={i} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: i < p.education.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>{edu.institution}</div>
                <div style={{ fontSize: 13, color: '#a78bfa', marginTop: 2 }}>{edu.degree} {edu.field ? `· ${edu.field}` : ''}</div>
                {(edu.startYear || edu.endYear) && <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{edu.startYear} – {edu.endYear || 'Present'}</div>}
              </div>
            ))}
          </Section>
        )}

        {/* Certificates */}
        {p.certificates?.length > 0 && (
          <Section title="Certificates" icon={<Award size={16} />}>
            {p.certificates.filter(c => c.name).map((cert, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>{cert.name}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{cert.issuer} {cert.year ? `· ${cert.year}` : ''}</div>
                {cert.link && <a href={cert.link} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#a78bfa' }}>View Credential ↗</a>}
              </div>
            ))}
          </Section>
        )}
      </div>

      {/* Right column — GitHub Projects */}
      <div style={{ padding: '28px 30px' }}>
        {p.githubProjects?.length > 0 && (
          <Section title="GitHub Projects" icon={<GitBranch size={16} />}>
            {p.githubProjects.slice(0, 4).map((proj, i) => (
              <a key={i} href={proj.link} target="_blank" rel="noreferrer"
                style={{
                  display: 'block', marginBottom: 12, padding: '14px 16px',
                  borderRadius: 12, background: 'rgba(13,13,26,0.6)',
                  border: '1px solid rgba(139,92,246,0.1)',
                  textDecoration: 'none', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)'; e.currentTarget.style.transform = 'translateX(3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.1)'; e.currentTarget.style.transform = 'none'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#a78bfa' }}>{proj.name}</span>
                  <ExternalLink size={11} color="#64748b" />
                </div>
                {proj.description && <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, lineHeight: 1.5 }}>{proj.description}</p>}
                <div style={{ display: 'flex', gap: 10 }}>
                  {proj.language && <span style={{ fontSize: 11, color: '#64748b' }}>⬤ {proj.language}</span>}
                  {proj.stars > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: '#64748b' }}><Star size={10} />{proj.stars}</span>}
                </div>
              </a>
            ))}
          </Section>
        )}
        {!p.githubProjects?.length && (
          <div style={{ padding: '24px', textAlign: 'center', color: '#475569', borderRadius: 12, border: '1px dashed rgba(139,92,246,0.2)' }}>
            <GitBranch size={28} style={{ marginBottom: 8, opacity: 0.5 }} />
            <p style={{ fontSize: 13 }}>Add your GitHub username to display projects</p>
          </div>
        )}
      </div>
    </div>
  </motion.div>
);

// ── Template 2 — Creative Spark ──────────────
const Template2 = ({ p }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    style={{ background: '#0d0d1a', border: '1px solid rgba(244,114,182,0.2)', borderRadius: 20, overflow: 'hidden' }}
  >
    <div style={{ background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', padding: '40px 36px', textAlign: 'center' }}>
      <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 800, color: '#fff', margin: '0 auto 16px', border: '3px solid rgba(255,255,255,0.4)' }}>
        {p.name?.[0] || '?'}
      </div>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 6 }}>{p.name || 'Your Name'}</h1>
      <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15, marginBottom: 14, fontWeight: 500 }}>{p.title}</p>
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 16 }}>
        {p.email && <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 5 }}><Mail size={13} />{p.email}</span>}
        {p.location && <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 5 }}><MapPin size={13} />{p.location}</span>}
      </div>
    </div>
    <div style={{ padding: '32px 36px' }}>
      {p.bio && <p style={{ color: '#cbd5e1', marginBottom: 28, lineHeight: 1.7, borderLeft: '3px solid #ec4899', paddingLeft: 16 }}>{p.bio}</p>}
      {p.skills?.length > 0 && (
        <Section title="Skills" accent="#f472b6">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {p.skills.map(s => <span key={s} style={{ padding: '5px 14px', borderRadius: 999, background: 'rgba(244,114,182,0.12)', border: '1px solid rgba(244,114,182,0.3)', color: '#f472b6', fontSize: 13, fontWeight: 600 }}>{s}</span>)}
          </div>
        </Section>
      )}
      {p.githubProjects?.length > 0 && (
        <Section title="Projects" accent="#f472b6">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {p.githubProjects.slice(0, 4).map((proj, i) => (
              <a key={i} href={proj.link} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', display: 'block', padding: '14px', borderRadius: 12, background: 'rgba(244,114,182,0.06)', border: '1px solid rgba(244,114,182,0.15)', transition: 'all 0.2s' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#f472b6', marginBottom: 4 }}>{proj.name}</div>
                <p style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.5 }}>{proj.description?.slice(0, 60)}...</p>
              </a>
            ))}
          </div>
        </Section>
      )}
      {p.certificates?.length > 0 && (
        <Section title="Certificates" accent="#f472b6">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {p.certificates.filter(c => c.name).map((c, i) => (
              <div key={i} style={{ padding: '8px 16px', borderRadius: 10, background: 'rgba(244,114,182,0.1)', border: '1px solid rgba(244,114,182,0.2)', fontSize: 13, color: '#f1f5f9', fontWeight: 500 }}>
                🏅 {c.name}
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  </motion.div>
);

// ── Template 3 — Executive Edge ──────────────
const Template3 = ({ p }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    style={{ background: '#070711', border: '1px solid rgba(34,211,238,0.2)', borderRadius: 20, overflow: 'hidden' }}
  >
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr' }}>
      {/* Sidebar */}
      <div style={{ background: 'linear-gradient(180deg, rgba(6,182,212,0.15), rgba(59,130,246,0.08))', padding: '36px 24px', borderRight: '1px solid rgba(34,211,238,0.15)', minHeight: 500 }}>
        <div style={{ width: 70, height: 70, borderRadius: 16, background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 900, color: '#fff', marginBottom: 16 }}>{p.name?.[0]}</div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif', lineHeight: 1.2, marginBottom: 4 }}>{p.name}</h2>
        <p style={{ color: '#22d3ee', fontSize: 13, fontWeight: 600, marginBottom: 20 }}>{p.title}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {p.email && <a href={`mailto:${p.email}`} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#94a3b8', textDecoration: 'none' }}><Mail size={12} />{p.email}</a>}
          {p.phone && <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#94a3b8' }}><Phone size={12} />{p.phone}</span>}
          {p.location && <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#94a3b8' }}><MapPin size={12} />{p.location}</span>}
        </div>
        {p.skills?.length > 0 && (
          <>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#22d3ee', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Core Skills</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {p.skills.slice(0, 8).map(s => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#22d3ee', flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: '#e2e8f0', fontWeight: 500 }}>{s}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      {/* Main */}
      <div style={{ padding: '36px 30px' }}>
        {p.bio && <p style={{ color: '#94a3b8', marginBottom: 28, lineHeight: 1.7, fontSize: 14 }}>{p.bio}</p>}
        {p.education?.length > 0 && (
          <Section title="Education" accent="#22d3ee">
            {p.education.filter(e => e.institution).map((e, i) => (
              <div key={i} style={{ marginBottom: 14, paddingLeft: 14, borderLeft: '2px solid rgba(34,211,238,0.3)' }}>
                <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: 14 }}>{e.institution}</div>
                <div style={{ color: '#22d3ee', fontSize: 13, marginTop: 2 }}>{e.degree} {e.field ? `— ${e.field}` : ''}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{e.startYear} – {e.endYear || 'Present'}</div>
              </div>
            ))}
          </Section>
        )}
        {p.githubProjects?.length > 0 && (
          <Section title="Projects" accent="#22d3ee">
            {p.githubProjects.slice(0, 3).map((proj, i) => (
              <div key={i} style={{ marginBottom: 12, padding: '12px 16px', borderRadius: 10, background: 'rgba(34,211,238,0.05)', border: '1px solid rgba(34,211,238,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#22d3ee' }}>{proj.name}</span>
                  {proj.link && <a href={proj.link} target="_blank" rel="noreferrer"><ExternalLink size={11} color="#64748b" /></a>}
                </div>
                <p style={{ fontSize: 12, color: '#94a3b8' }}>{proj.description}</p>
              </div>
            ))}
          </Section>
        )}
        {p.certificates?.length > 0 && (
          <Section title="Certifications" accent="#22d3ee">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
              {p.certificates.filter(c => c.name).map((c, i) => (
                <div key={i} style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.15)', fontSize: 12 }}>
                  <div style={{ color: '#f1f5f9', fontWeight: 600 }}>{c.name}</div>
                  <div style={{ color: '#64748b', marginTop: 2 }}>{c.issuer} {c.year ? `· ${c.year}` : ''}</div>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  </motion.div>
);

const Section = ({ title, children, accent = '#a78bfa', icon }) => (
  <div style={{ marginBottom: 28 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
      {icon && <span style={{ color: accent }}>{icon}</span>}
      <h3 style={{ fontSize: 12, fontWeight: 800, color: accent, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{title}</h3>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, rgba(${accent === '#a78bfa' ? '167,139,250' : accent === '#f472b6' ? '244,114,182' : '34,211,238'}, 0.3), transparent)` }} />
    </div>
    {children}
  </div>
);

export default PortfolioPreview;
