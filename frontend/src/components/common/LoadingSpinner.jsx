const LoadingSpinner = ({ fullPage = false, size = 40 }) => {
  const spinner = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          border: '3px solid rgba(139, 92, 246, 0.2)',
          borderTopColor: '#8b5cf6',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Loading...</span>
    </div>
  );

  if (fullPage) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-primary)',
        }}
      >
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
