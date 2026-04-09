import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminAPI, jobAPI } from '../services/api';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Trash2, Plus, Briefcase } from 'lucide-react';

const AdminDashboard = () => {
    const { user, isAuthenticated, loading } = useAuth();
    
    const [price, setPrice] = useState(199);
    const [coupons, setCoupons] = useState([]);
    const [newCoupon, setNewCoupon] = useState({ code: '', discountPercentage: '' });
    const [fetching, setFetching] = useState(true);
    const [sendingMails, setSendingMails] = useState(false);

    // Jobs state
    const [jobs, setJobs] = useState([]);
    const [showJobForm, setShowJobForm] = useState(false);
    const [jobForm, setJobForm] = useState({
        title: '', company: '', type: 'offcampus', description: '',
        location: '', salary: '', experience: 'Fresher', skills: '', applyLink: '', deadline: '',
    });
    const [savingJob, setSavingJob] = useState(false);
    
    useEffect(() => {
        if (!loading && isAuthenticated && user?.role?.toLowerCase() === 'admin') {
            loadData();
        } else if (!loading) {
            setFetching(false);
        }
    }, [loading, isAuthenticated, user]);
    
    const loadData = async () => {
        setFetching(true);
        try {
            const [settingsRes, couponsRes, jobsRes] = await Promise.all([
                adminAPI.getSettings(),
                adminAPI.getCoupons(),
                jobAPI.adminGetAll(),
            ]);
            setPrice(settingsRes.data?.proPrice || 199);
            setCoupons(couponsRes.data);
            setJobs(jobsRes.data);
        } catch (err) {
            toast.error('Failed to load admin data');
        } finally {
            setFetching(false);
        }
    };
    
    const handleUpdatePrice = async (e) => {
        e.preventDefault();
        try {
            await adminAPI.updatePrice(Number(price));
            toast.success('Price updated successfully');
        } catch (err) {
            toast.error('Failed to update price');
        }
    };
    
    const handleCreateCoupon = async (e) => {
        e.preventDefault();
        if (!newCoupon.code || !newCoupon.discountPercentage) return;
        try {
            await adminAPI.createCoupon({
                code: newCoupon.code,
                discountPercentage: Number(newCoupon.discountPercentage)
            });
            toast.success('Coupon created');
            setNewCoupon({ code: '', discountPercentage: '' });
            loadData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create coupon');
        }
    };
    
    const handleDeleteCoupon = async (id) => {
        if (!window.confirm('Delete this coupon?')) return;
        try {
            await adminAPI.deleteCoupon(id);
            toast.success('Coupon deleted');
            loadData();
        } catch (err) {
            toast.error('Failed to delete coupon');
        }
    };

    const handleSendWelcomeMails = async () => {
        if (!window.confirm('Send welcome emails to ALL registered users? This cannot be undone.')) return;
        setSendingMails(true);
        try {
            const res = await adminAPI.sendWelcomeMails();
            toast.success(res.data.message || 'Emails sent!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send emails');
        } finally {
            setSendingMails(false);
        }
    };

    // ── Job Handlers ──────────────────────────
    const handleCreateJob = async (e) => {
        e.preventDefault();
        if (!jobForm.title || !jobForm.company) {
            toast.error('Title and Company are required');
            return;
        }
        setSavingJob(true);
        try {
            const payload = {
                ...jobForm,
                skills: jobForm.skills ? jobForm.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
                deadline: jobForm.deadline || undefined,
            };
            await jobAPI.create(payload);
            toast.success('Job posted!');
            setJobForm({ title: '', company: '', type: 'offcampus', description: '', location: '', salary: '', experience: 'Fresher', skills: '', applyLink: '', deadline: '' });
            setShowJobForm(false);
            loadData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create job');
        } finally {
            setSavingJob(false);
        }
    };

    const handleToggleJob = async (job) => {
        try {
            await jobAPI.update(job._id, { isActive: !job.isActive });
            toast.success(job.isActive ? 'Job deactivated' : 'Job activated');
            loadData();
        } catch (err) {
            toast.error('Failed to update job');
        }
    };

    const handleDeleteJob = async (id) => {
        if (!window.confirm('Delete this job and all its applications?')) return;
        try {
            await jobAPI.delete(id);
            toast.success('Job deleted');
            loadData();
        } catch (err) {
            toast.error('Failed to delete job');
        }
    };
    
    if (loading || fetching) return <div className="text-center py-5" style={{ color: 'var(--text-secondary)' }}>Loading...</div>;
    
    if (!isAuthenticated || user?.role?.toLowerCase() !== 'admin') {
        return (
            <div className="container py-5 text-center">
                <h2>Unauthorized Access</h2>
                <p>We see your user object as:</p>
                <pre className="text-start d-inline-block mx-auto p-4 bg-dark text-light rounded">{JSON.stringify(user, null, 2)}</pre>
            </div>
        );
    }

    const inputStyle = { marginBottom: 0 };

    return (
        <div className="page-wrapper py-5">
            <div className="container" style={{ maxWidth: 1000 }}>
                <h1 className="mb-4 text-center" style={{ fontWeight: 800 }}>Admin <span className="gradient-text">Dashboard</span></h1>
                
                <div className="row g-4">
                    {/* Settings Form */}
                    <div className="col-12 col-md-6">
                        <motion.div className="glass-card p-4 h-100" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <h4 style={{ fontWeight: 700, marginBottom: 20 }}>Global Settings</h4>
                            <form onSubmit={handleUpdatePrice} className="d-flex flex-column gap-3">
                                <div>
                                    <label className="form-label-zrv">Base Pro Price (₹)</label>
                                    <input 
                                        type="number" 
                                        className="form-control-zrv" 
                                        value={price} 
                                        onChange={(e) => setPrice(e.target.value)} 
                                        required 
                                        min="0"
                                    />
                                    <small style={{ color: 'var(--text-muted)' }}>This changes the regular price on the pricing table.</small>
                                </div>
                                <button type="submit" className="btn-primary-zrv w-100 justify-content-center mt-auto py-2">Update Price</button>
                            </form>
                        </motion.div>
                    </div>
                    
                    {/* Create Coupon Form */}
                    <div className="col-12 col-md-6">
                        <motion.div className="glass-card p-4 h-100" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                            <h4 style={{ fontWeight: 700, marginBottom: 20 }}>Create Coupon</h4>
                            <form onSubmit={handleCreateCoupon} className="d-flex flex-column gap-3">
                                <div>
                                    <label className="form-label-zrv">Coupon Code</label>
                                    <input 
                                        type="text" 
                                        className="form-control-zrv" 
                                        value={newCoupon.code} 
                                        onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})} 
                                        placeholder="e.g. EARLYBIRD"
                                        required 
                                    />
                                </div>
                                <div>
                                    <label className="form-label-zrv">Discount Percentage (%)</label>
                                    <input 
                                        type="number" 
                                        className="form-control-zrv" 
                                        value={newCoupon.discountPercentage} 
                                        onChange={(e) => setNewCoupon({...newCoupon, discountPercentage: e.target.value})} 
                                        placeholder="e.g. 20"
                                        required 
                                        min="1" max="100"
                                    />
                                </div>
                                <button type="submit" className="btn-primary-zrv w-100 justify-content-center mt-auto py-2">Add Coupon</button>
                            </form>
                        </motion.div>
                    </div>
                    
                    {/* Coupons List */}
                    <div className="col-12">
                        <motion.div className="glass-card p-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                            <h4 style={{ fontWeight: 700, marginBottom: 20 }}>Active Coupons</h4>
                            {coupons.length === 0 ? (
                                <p style={{ color: 'var(--text-secondary)' }}>No coupons available.</p>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table text-start align-middle mb-0" style={{ color: 'var(--text-primary)' }}>
                                        <thead style={{ borderBottom: '1px solid var(--border)' }}>
                                            <tr style={{ color: 'var(--text-secondary)' }}>
                                                <th className="py-3">Code</th>
                                                <th className="py-3">Discount (%)</th>
                                                <th className="py-3">Status</th>
                                                <th className="py-3 text-end">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {coupons.map(coupon => (
                                                <tr key={coupon._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                    <td className="py-3" style={{ fontWeight: 700, color: 'var(--purple-400)' }}>{coupon.code}</td>
                                                    <td className="py-3">{coupon.discountPercentage}%</td>
                                                    <td className="py-3">
                                                        <span className="badge" style={{ background: coupon.isActive ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)', color: coupon.isActive ? '#4ade80' : '#f87171' }}>
                                                            {coupon.isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 text-end">
                                                        <button 
                                                            className="btn-sm px-3 py-1 bg-transparent" 
                                                            style={{ border: '1px solid var(--border)', color: '#f87171', borderRadius: 8 }}
                                                            onClick={() => handleDeleteCoupon(coupon._id)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* ── Job Management ───────────────────── */}
                    <div className="col-12">
                        <motion.div className="glass-card p-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                            <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                                <h4 style={{ fontWeight: 700, marginBottom: 0 }}>
                                    <Briefcase size={20} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />
                                    Job Management
                                </h4>
                                <button
                                    className="btn-primary-zrv"
                                    style={{ padding: '8px 18px', fontSize: 13, fontWeight: 700 }}
                                    onClick={() => setShowJobForm(!showJobForm)}
                                >
                                    <Plus size={15} /> {showJobForm ? 'Cancel' : 'Post New Job'}
                                </button>
                            </div>

                            {/* Create Job Form */}
                            {showJobForm && (
                                <motion.form
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    onSubmit={handleCreateJob}
                                    className="mb-4 p-3"
                                    style={{ background: 'rgba(139,92,246,0.05)', borderRadius: 14, border: '1px solid rgba(139,92,246,0.15)' }}
                                >
                                    <div className="row g-3">
                                        <div className="col-12 col-md-6">
                                            <label className="form-label-zrv">Job Title *</label>
                                            <input className="form-control-zrv" style={inputStyle} value={jobForm.title} onChange={e => setJobForm({...jobForm, title: e.target.value})} placeholder="e.g. Software Engineer" required />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="form-label-zrv">Company *</label>
                                            <input className="form-control-zrv" style={inputStyle} value={jobForm.company} onChange={e => setJobForm({...jobForm, company: e.target.value})} placeholder="e.g. TCS" required />
                                        </div>
                                        <div className="col-12 col-md-4">
                                            <label className="form-label-zrv">Type *</label>
                                            <select className="form-control-zrv" style={inputStyle} value={jobForm.type} onChange={e => setJobForm({...jobForm, type: e.target.value})}>
                                                <option value="offcampus">Off Campus</option>
                                                <option value="walkin">Walk-In</option>
                                            </select>
                                        </div>
                                        <div className="col-12 col-md-4">
                                            <label className="form-label-zrv">Location</label>
                                            <input className="form-control-zrv" style={inputStyle} value={jobForm.location} onChange={e => setJobForm({...jobForm, location: e.target.value})} placeholder="e.g. Hyderabad" />
                                        </div>
                                        <div className="col-12 col-md-4">
                                            <label className="form-label-zrv">Salary</label>
                                            <input className="form-control-zrv" style={inputStyle} value={jobForm.salary} onChange={e => setJobForm({...jobForm, salary: e.target.value})} placeholder="e.g. ₹3.5 - 6 LPA" />
                                        </div>
                                        <div className="col-12 col-md-4">
                                            <label className="form-label-zrv">Experience</label>
                                            <input className="form-control-zrv" style={inputStyle} value={jobForm.experience} onChange={e => setJobForm({...jobForm, experience: e.target.value})} placeholder="e.g. Fresher / 0-2 yrs" />
                                        </div>
                                        <div className="col-12 col-md-4">
                                            <label className="form-label-zrv">Skills (comma-separated)</label>
                                            <input className="form-control-zrv" style={inputStyle} value={jobForm.skills} onChange={e => setJobForm({...jobForm, skills: e.target.value})} placeholder="e.g. Java, React, SQL" />
                                        </div>
                                        <div className="col-12 col-md-4">
                                            <label className="form-label-zrv">Deadline</label>
                                            <input type="date" className="form-control-zrv" style={inputStyle} value={jobForm.deadline} onChange={e => setJobForm({...jobForm, deadline: e.target.value})} />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label-zrv">Apply Link (optional)</label>
                                            <input className="form-control-zrv" style={inputStyle} value={jobForm.applyLink} onChange={e => setJobForm({...jobForm, applyLink: e.target.value})} placeholder="https://..." />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label-zrv">Description</label>
                                            <textarea className="form-control-zrv" style={{ ...inputStyle, minHeight: 80 }} value={jobForm.description} onChange={e => setJobForm({...jobForm, description: e.target.value})} placeholder="Job description, requirements, etc." />
                                        </div>
                                        <div className="col-12">
                                            <button type="submit" disabled={savingJob} className="btn-primary-zrv w-100 justify-content-center py-2" style={{ fontSize: 14, fontWeight: 700 }}>
                                                {savingJob ? 'Posting...' : '🚀 Post Job'}
                                            </button>
                                        </div>
                                    </div>
                                </motion.form>
                            )}

                            {/* Jobs Table */}
                            {jobs.length === 0 ? (
                                <p style={{ color: 'var(--text-secondary)' }}>No jobs posted yet.</p>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table text-start align-middle mb-0" style={{ color: 'var(--text-primary)' }}>
                                        <thead style={{ borderBottom: '1px solid var(--border)' }}>
                                            <tr style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                                                <th className="py-3">Title</th>
                                                <th className="py-3">Company</th>
                                                <th className="py-3">Type</th>
                                                <th className="py-3">Applicants</th>
                                                <th className="py-3">Status</th>
                                                <th className="py-3 text-end">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {jobs.map(job => (
                                                <tr key={job._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                    <td className="py-3" style={{ fontWeight: 600, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.title}</td>
                                                    <td className="py-3" style={{ fontSize: 13 }}>{job.company}</td>
                                                    <td className="py-3">
                                                        <span style={{
                                                            padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                                                            background: job.type === 'walkin' ? 'rgba(251,191,36,0.12)' : 'rgba(96,165,250,0.12)',
                                                            color: job.type === 'walkin' ? '#fbbf24' : '#60a5fa',
                                                            border: `1px solid ${job.type === 'walkin' ? 'rgba(251,191,36,0.3)' : 'rgba(96,165,250,0.3)'}`,
                                                        }}>
                                                            {job.type === 'walkin' ? 'Walk-In' : 'Off Campus'}
                                                        </span>
                                                    </td>
                                                    <td className="py-3">
                                                        <span style={{
                                                            padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                                                            background: 'rgba(139,92,246,0.1)', color: '#a78bfa',
                                                        }}>
                                                            {job.applicationCount || 0}
                                                        </span>
                                                    </td>
                                                    <td className="py-3">
                                                        <button
                                                            onClick={() => handleToggleJob(job)}
                                                            className="badge"
                                                            style={{
                                                                background: job.isActive ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
                                                                color: job.isActive ? '#4ade80' : '#f87171',
                                                                cursor: 'pointer', border: 'none', fontFamily: 'inherit', fontSize: 12,
                                                            }}
                                                        >
                                                            {job.isActive ? 'Active' : 'Inactive'}
                                                        </button>
                                                    </td>
                                                    <td className="py-3 text-end">
                                                        <button
                                                            className="bg-transparent"
                                                            style={{ border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', borderRadius: 8, padding: '4px 10px', cursor: 'pointer' }}
                                                            onClick={() => handleDeleteJob(job._id)}
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Bulk Welcome Email */}
                    <div className="col-12">
                        <motion.div className="glass-card p-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                            <h4 style={{ fontWeight: 700, marginBottom: 8 }}>📧 Send Welcome Emails</h4>
                            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>
                                Send a Zorovex welcome email to every registered user in the database at once.
                            </p>
                            <button
                                id="btn-send-welcome-mails"
                                className="btn-primary-zrv py-2 px-4"
                                onClick={handleSendWelcomeMails}
                                disabled={sendingMails}
                                style={{ minWidth: 240, justifyContent: 'center' }}
                            >
                                {sendingMails ? (
                                    <><span className="zrv-spinner-sm me-2" />Sending Emails…</>
                                ) : (
                                    <>📨 Send Welcome Mail to All Users</>
                                )}
                            </button>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

