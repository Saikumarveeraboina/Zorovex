import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const MainLayout = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
      {/* Background Orbs */}
      <div className="orb orb-purple" />
      <div className="orb orb-blue" />
      <div className="orb orb-pink" />

      <Navbar />

      <main style={{ flex: 1, paddingTop: 68 }}>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;
