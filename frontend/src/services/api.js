import axios from 'axios';

// In production (Vercel), VITE_API_URL = 'https://zorovex.onrender.com/api'
// In local dev, VITE_API_URL is not set, so '/api' is used (Vite proxy handles it)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('zorovex_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('zorovex_token');
      localStorage.removeItem('zorovex_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────
export const authAPI = {
  sendOtp: (data) => api.post('/auth/send-otp', data),       // Step 1
  verifyOtp: (data) => api.post('/auth/verify-otp', data),   // Step 2
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
};

// ── DSA ───────────────────────────────
export const dsaAPI = {
  getCompanyProblems: (company) => api.get(`/dsa/${company}`),
  markDone: (data) => api.post('/dsa/progress/mark', data),
  getUserProgress: () => api.get('/dsa/progress'),
};

// ── Portfolio ─────────────────────────
export const portfolioAPI = {
  create: (formData) =>
    api.post('/portfolio/create', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  parseResume: (formData) =>
    api.post('/portfolio/parse-resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getByUserId: (userId) => api.get(`/portfolio/${userId}`),
  getBySlug: (slug) => api.get(`/portfolio/public/${slug}`),
  unlockTemplate: (data) => api.post('/portfolio/unlock', data),
};

// ── Payment ───────────────────────────
export const paymentAPI = {
  createOrder: (data) => api.post('/payment/create-order', data),
  verifyPayment: (data) => api.post('/payment/verify', data),
  createProOrder: (data) => api.post('/payment/create-pro-order', data),
  verifyProPayment: (data) => api.post('/payment/verify-pro', data),
};

// ── Contact ───────────────────────────
export const contactAPI = {
  sendMessage: (data) => api.post('/contact', data),
};

// ── Admin ─────────────────────────────
export const adminAPI = {
  getSettings: () => api.get('/admin/settings'),
  updatePrice: (price) => api.put('/admin/settings/price', { price }),
  getCoupons: () => api.get('/admin/coupons'),
  createCoupon: (data) => api.post('/admin/coupons', data),
  deleteCoupon: (id) => api.delete(`/admin/coupons/${id}`),
  validateCoupon: (code) => api.post('/admin/validate-coupon', { code }),
  sendWelcomeMails: () => api.post('/admin/send-welcome-mails'),
};

export default api;
