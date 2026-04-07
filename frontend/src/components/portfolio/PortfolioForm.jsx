import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Upload, Plus, Trash2, GitBranch, X, FileText, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { parseCSV } from '../../utils/helpers';
import { portfolioAPI } from '../../services/api';

const emptyEducation = { institution: '', degree: '', field: '', startYear: '', endYear: '' };
const emptyCert = { name: '', issuer: '', year: '', link: '' };

const PortfolioForm = ({ initialData = {}, onSubmit, loading }) => {
  const [form, setForm] = useState({
    name: initialData.name || '',
    title: initialData.title || '',
    bio: initialData.bio || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
    location: initialData.location || '',
    skills: Array.isArray(initialData.skills) ? initialData.skills.join(', ') : '',
    education: initialData.education?.length ? initialData.education : [{ ...emptyEducation }],
    certificates: initialData.certificates?.length ? initialData.certificates : [],
    githubUsername: initialData.githubUsername || '',
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [activeSection, setActiveSection] = useState('basic');
  const [extracting, setExtracting] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles[0]) setResumeFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  const handleExtract = async () => {
    if (!resumeFile) return;
    setExtracting(true);
    const fd = new FormData();
    fd.append('resume', resumeFile);
    try {
      const { data } = await portfolioAPI.parseResume(fd);
      const extracted = data.data;
      setForm(prev => ({
        ...prev,
        name: extracted.name || prev.name,
        title: extracted.title || prev.title,
        bio: extracted.bio || prev.bio,
        email: extracted.email || prev.email,
        phone: extracted.phone || prev.phone,
        githubUsername: extracted.githubUsername || prev.githubUsername,
        skills: extracted.skills?.length > 0 ? extracted.skills.join(', ') : prev.skills,
        education: extracted.education?.length > 0 ? extracted.education : prev.education,
      }));
      toast.success('Resume extracted! Review your details.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to extract resume data.');
    } finally {
      setExtracting(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleEducationChange = (index, field, value) => {
    const updated = [...form.education];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, education: updated });
  };

  const handleCertChange = (index, field, value) => {
    const updated = [...form.certificates];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, certificates: updated });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    const skills = parseCSV(form.skills);
    fd.append('name', form.name);
    fd.append('title', form.title);
    fd.append('bio', form.bio);
    fd.append('email', form.email);
    fd.append('phone', form.phone);
    fd.append('location', form.location);
    fd.append('skills', JSON.stringify(skills));
    fd.append('education', JSON.stringify(form.education));
    fd.append('certificates', JSON.stringify(form.certificates));
    fd.append('githubUsername', form.githubUsername);
    fd.append('githubProjects', JSON.stringify([]));
    if (resumeFile) fd.append('resume', resumeFile);
    onSubmit(fd);
  };

  const sections = ['basic', 'education', 'skills', 'certificates', 'resume'];

  return (
    <form onSubmit={handleSubmit}>
      {/* Section Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
        {sections.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setActiveSection(s)}
            style={{
              padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              background: activeSection === s ? 'rgba(139,92,246,0.2)' : 'rgba(13,13,26,0.6)',
              border: `1px solid ${activeSection === s ? 'var(--purple-500)' : 'var(--border)'}`,
              color: activeSection === s ? 'var(--purple-400)' : 'var(--text-secondary)',
              cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize',
              transition: 'all 0.2s',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Basic Info */}
      {activeSection === 'basic' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label className="form-label">Full Name *</label>
              <input className="form-input" name="name" value={form.name} onChange={handleChange} placeholder="John Doe" required />
            </div>
            <div>
              <label className="form-label">Job Title</label>
              <input className="form-input" name="title" value={form.title} onChange={handleChange} placeholder="Full Stack Developer" />
            </div>
          </div>
          <div>
            <label className="form-label">Bio / Summary</label>
            <textarea className="form-input" name="bio" value={form.bio} onChange={handleChange} placeholder="A passionate developer with 2 years of experience..." rows={3} style={{ resize: 'vertical' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label className="form-label">Email</label>
              <input className="form-input" type="email" name="email" value={form.email} onChange={handleChange} placeholder="john@example.com" />
            </div>
            <div>
              <label className="form-label">Phone</label>
              <input className="form-input" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 9876543210" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label className="form-label">Location</label>
              <input className="form-input" name="location" value={form.location} onChange={handleChange} placeholder="Bangalore, India" />
            </div>
            <div>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <GitBranch size={13} /> GitHub Username
              </label>
              <input className="form-input" name="githubUsername" value={form.githubUsername} onChange={handleChange} placeholder="octocat" />
            </div>
          </div>
        </motion.div>
      )}

      {/* Education */}
      {activeSection === 'education' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {form.education.map((edu, idx) => (
            <div key={idx} style={{ padding: 16, borderRadius: 12, border: '1px solid var(--border)', background: 'rgba(13,13,26,0.4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>Education {idx + 1}</span>
                {form.education.length > 1 && (
                  <button type="button" onClick={() => setForm({ ...form, education: form.education.filter((_, i) => i !== idx) })}
                    style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}>
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <input className="form-input" placeholder="Institution *" value={edu.institution} onChange={e => handleEducationChange(idx, 'institution', e.target.value)} />
                <input className="form-input" placeholder="Degree (B.Tech, MCA...)" value={edu.degree} onChange={e => handleEducationChange(idx, 'degree', e.target.value)} />
                <input className="form-input" placeholder="Field of Study" value={edu.field} onChange={e => handleEducationChange(idx, 'field', e.target.value)} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <input className="form-input" placeholder="Start Year" value={edu.startYear} onChange={e => handleEducationChange(idx, 'startYear', e.target.value)} />
                  <input className="form-input" placeholder="End Year" value={edu.endYear} onChange={e => handleEducationChange(idx, 'endYear', e.target.value)} />
                </div>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => setForm({ ...form, education: [...form.education, { ...emptyEducation }] })}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 10, background: 'rgba(139,92,246,0.08)', border: '1px dashed rgba(139,92,246,0.3)', color: 'var(--purple-400)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 600 }}>
            <Plus size={16} /> Add Education
          </button>
        </motion.div>
      )}

      {/* Skills */}
      {activeSection === 'skills' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="form-label">Skills (comma-separated)</label>
            <textarea className="form-input" name="skills" value={form.skills} onChange={handleChange}
              placeholder="React, Node.js, MongoDB, Python, AWS, Docker..." rows={4} style={{ resize: 'vertical' }} />
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
              These will be displayed as tags on your portfolio.
            </p>
          </div>
          {form.skills && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {parseCSV(form.skills).map((skill) => (
                <span key={skill} style={{ padding: '5px 12px', borderRadius: 999, background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: 'var(--purple-400)', fontSize: 13, fontWeight: 500 }}>
                  {skill}
                </span>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Certificates */}
      {activeSection === 'certificates' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {form.certificates.map((cert, idx) => (
            <div key={idx} style={{ padding: 16, borderRadius: 12, border: '1px solid var(--border)', background: 'rgba(13,13,26,0.4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>Certificate {idx + 1}</span>
                <button type="button" onClick={() => setForm({ ...form, certificates: form.certificates.filter((_, i) => i !== idx) })}
                  style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}>
                  <Trash2 size={15} />
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <input className="form-input" placeholder="Certificate Name *" value={cert.name} onChange={e => handleCertChange(idx, 'name', e.target.value)} />
                <input className="form-input" placeholder="Issuer (Coursera, etc)" value={cert.issuer} onChange={e => handleCertChange(idx, 'issuer', e.target.value)} />
                <input className="form-input" placeholder="Year" value={cert.year} onChange={e => handleCertChange(idx, 'year', e.target.value)} />
                <input className="form-input" placeholder="Credential URL" value={cert.link} onChange={e => handleCertChange(idx, 'link', e.target.value)} />
              </div>
            </div>
          ))}
          <button type="button" onClick={() => setForm({ ...form, certificates: [...form.certificates, { ...emptyCert }] })}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 10, background: 'rgba(139,92,246,0.08)', border: '1px dashed rgba(139,92,246,0.3)', color: 'var(--purple-400)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 600 }}>
            <Plus size={16} /> Add Certificate
          </button>
        </motion.div>
      )}

      {/* Resume Upload */}
      {activeSection === 'resume' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div
            {...getRootProps()}
            style={{
              border: `2px dashed ${isDragActive ? 'var(--purple-500)' : 'rgba(139,92,246,0.3)'}`,
              borderRadius: 16,
              padding: '40px 24px',
              textAlign: 'center',
              background: isDragActive ? 'rgba(139,92,246,0.08)' : 'rgba(13,13,26,0.4)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <input {...getInputProps()} />
            <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
            <p style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: 6 }}>
              {isDragActive ? 'Drop your resume here!' : 'Upload Resume (PDF)'}
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Drag & drop or click to browse · Max 5MB</p>
            {resumeFile && (
              <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span style={{ padding: '6px 14px', borderRadius: 999, background: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)', fontSize: 13, fontWeight: 600 }}>
                  ✅ {resumeFile.name}
                </span>
                <button type="button" onClick={(e) => { e.stopPropagation(); setResumeFile(null); }}
                  style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}>
                  <X size={16} />
                </button>
              </div>
            )}
            {initialData.resumeUrl && !resumeFile && (
              <p style={{ marginTop: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
                Current: <a href={initialData.resumeUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--purple-400)' }}>View Resume</a>
              </p>
            )}
          </div>

          {resumeFile && (
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
              <button type="button" onClick={handleExtract} disabled={extracting}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', borderRadius: 10, background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa', fontWeight: 600, cursor: extracting ? 'not-allowed' : 'pointer' }}>
                {extracting ? <><span className="zrv-spinner-sm" /> Extracting...</> : <><FileText size={16} /> Auto-fill from Resume</>}
              </button>
            </div>
          )}

          <div style={{ marginTop: 16, padding: 16, borderRadius: 12, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
            <p style={{ fontSize: 13, color: 'var(--blue-400)' }}>
              💡 <strong>Tip:</strong> Upload your resume to let us extract your skills and experience automatically. Your portfolio will be generated from the form data above.
            </p>
          </div>
        </motion.div>
      )}

      {/* Submit */}
      <div style={{ marginTop: 28, display: 'flex', gap: 12 }}>
        <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 1, justifyContent: 'center', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Saving…' : '🚀 Save & Generate Portfolio'}
        </button>
      </div>
    </form>
  );
};

export default PortfolioForm;
