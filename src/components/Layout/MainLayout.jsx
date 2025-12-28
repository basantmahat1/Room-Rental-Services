import { Outlet } from 'react-router-dom';
import Navbar from '../Layout/Navbar';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <Navbar />
      <Outlet />
    </div>
  );
};

export default MainLayout;
