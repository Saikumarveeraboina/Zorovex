import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import ScrollHandler from './components/common/ScrollHandler';
import LoadingSpinner from './components/common/LoadingSpinner';

// Eagerly loaded (common entry points)
import Home from './pages/Home';
import Login from './pages/Login';

// Lazy-loaded (code-split for performance)
const Dashboard = lazy(() => import('./pages/Dashboard'));
const DSA = lazy(() => import('./pages/DSA'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const PublicPortfolio = lazy(() => import('./pages/PublicPortfolio'));
const Contact = lazy(() => import('./pages/Contact'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const RefundPolicy = lazy(() => import('./pages/RefundPolicy'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Jobs = lazy(() => import('./pages/Jobs'));

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollHandler />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#111127',
              color: '#f1f5f9',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '12px',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
            },
            success: {
              iconTheme: { primary: '#4ade80', secondary: '#111127' },
            },
            error: {
              iconTheme: { primary: '#f87171', secondary: '#111127' },
            },
          }}
        />

        <Suspense fallback={<LoadingSpinner fullPage />}>
          <Routes>
            <Route element={<MainLayout />}>
              {/* Public */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/refund-policy" element={<RefundPolicy />} />
              <Route path="/p/:slug" element={<PublicPortfolio />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Protected */}
              <Route path="/dashboard" element={
                <ProtectedRoute><Dashboard /></ProtectedRoute>
              } />
              <Route path="/dsa" element={
                <ProtectedRoute><DSA /></ProtectedRoute>
              } />
              <Route path="/portfolio" element={
                <ProtectedRoute><Portfolio /></ProtectedRoute>
              } />
              <Route path="/jobs" element={
                <ProtectedRoute><Jobs /></ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute><AdminDashboard /></ProtectedRoute>
              } />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
