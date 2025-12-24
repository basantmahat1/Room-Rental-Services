import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../routes/ProtectedRoute';

// Public Pages
import Home from '../pages/Home';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import AdminLogin from '../pages/Admin/AdminLogin';
import PropertyDetails from '../pages/Properties/PropertyDetails';

// Tenant Pages
import TenantDashboard from '../pages/Tenant/TenantDashboard';
import MyBookings from '../pages/Tenant/MyBookings';
import MyWishlist from '../pages/Tenant/MyWishlist';

// Owner Pages
import OwnerDashboard from '../pages/Owner/OwnerDashboard';
import OwnerProperties from '../pages/Owner/OwnerProperties';
import AddProperty from '../pages/Owner/AddProperty';
import ManageBookings from '../pages/Owner/ManageBookings';

// Admin Pages
import AdminDashboard from '../pages/Admin/AdminDashboard';
import AdminUsers from '../pages/Admin/AdminUsers';
import AdminProperties from '../pages/Admin/AdminProperties';
import AdminSettings from '../pages/Admin/AdminSettings';

const AppRoutes = () => {
  return (
    <Routes>
      {/* ================== PUBLIC ROUTES ================== */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/properties/:id" element={<PropertyDetails />} />

      {/* ================== TENANT ROUTES ================== */}
      <Route element={<ProtectedRoute allowedRoles={['tenant']} />}>
        <Route path="/tenant/dashboard" element={<TenantDashboard />} />
        <Route path="/tenant/bookings" element={<MyBookings />} />
        <Route path="/tenant/wishlist" element={<MyWishlist />} />
        <Route path="/tenant/properties" element={<Home />} />
      </Route>

      {/* ================== OWNER ROUTES ================== */}
      <Route element={<ProtectedRoute allowedRoles={['owner']} />}>
        <Route path="/owner/dashboard" element={<OwnerDashboard />} />
        <Route path="/owner/properties" element={<OwnerProperties />} />
        <Route path="/owner/add-property" element={<AddProperty />} />
        <Route path="/owner/bookings" element={<ManageBookings />} />
      </Route>

      {/* ================== ADMIN ROUTES ================== */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/properties" element={<AdminProperties />} />
        <Route path="/admin/settings" element={<AdminSettings />} />

      </Route>

      {/* ================== FALLBACK ROUTE ================== */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
