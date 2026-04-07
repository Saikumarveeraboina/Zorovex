import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { portfolioAPI } from '../services/api';
import PortfolioPreview from '../components/portfolio/PortfolioPreview';
import LoadingSpinner from '../components/common/LoadingSpinner';

const PublicPortfolio = () => {
  const { slug } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    portfolioAPI.getBySlug(slug)
      .then(res => {
        setPortfolio(res.data.portfolio);
      })
      .catch((err) => {
        console.error(err);
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <LoadingSpinner fullPage />;

  if (error || !portfolio) {
    return (
      <div className="page-wrapper d-flex align-items-center justify-content-center">
        <div className="text-center">
          <h1 style={{ fontSize: 60, marginBottom: 20 }}>😕</h1>
          <h2>Portfolio Not Found</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
            The portfolio you're looking for doesn't exist or is not public.
          </p>
          <Link to="/" className="btn-primary-zrv">Go Home</Link>
        </div>
      </div>
    );
  }

  // Render the portfolio preview filling the exact screen
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <PortfolioPreview portfolio={portfolio} templateId={portfolio.templateId || 1} />
    </div>
  );
};

export default PublicPortfolio;
