import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-[var(--color-primary)] text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-24 flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 text-2xl font-bold tracking-tight"
        >
          {/* Logo Image */}
          <img
            src="/logo.png"
            alt="LivoRent Logo"
            className="w-24 h-24 object-contain"
          />

          {/* Brand Text */}
          <span>
            Livo
            <span className="text-[var(--color-secondary)]">Rent</span>
          </span>
        </Link>


        {/* Navigation Links */}
        <div className="flex items-center gap-8 text-sm font-medium">
          <Link to="/" className="hover:text-[var(--color-secondary)] transition">Find a Room</Link>
          <Link to="/allProperties" className="hover:text-[var(--color-secondary)] transition">All Properrties</Link>
          <Link to="/faq" className="hover:text-[var(--color-secondary)] transition">FAQ</Link>



          {!isAuthenticated ? (
            <div className="flex items-center gap-6">
              <Link to="/login" className="hover:text-[var(--color-secondary)] transition">Login</Link>
              <Link to="/signup" className="btn-primary py-2 px-8">Join Now</Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <span className="text-gray-300">Welcome, {user?.name}</span>
              <button onClick={handleLogout} className="btn-outline text-xs py-1.5 px-4">Logout</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;