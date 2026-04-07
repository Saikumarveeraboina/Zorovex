import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

const AdminDashboard = () => {
    const { user, isAuthenticated, loading } = useAuth();
    
    const [price, setPrice] = useState(199);
    const [coupons, setCoupons] = useState([]);
    const [newCoupon, setNewCoupon] = useState({ code: '', discountPercentage: '' });
    const [fetching, setFetching] = useState(true);
    const [sendingMails, setSendingMails] = useState(false);
    
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
            const [settingsRes, couponsRes] = await Promise.all([
                adminAPI.getSettings(),
                adminAPI.getCoupons()
            ]);
            setPrice(settingsRes.data?.proPrice || 199);
            setCoupons(couponsRes.data);
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

    return (
        <div className="page-wrapper py-5">
            <div className="container" style={{ maxWidth: 900 }}>
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
