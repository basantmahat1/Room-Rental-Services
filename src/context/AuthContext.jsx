// ========================================
// context/AuthContext.jsx (COMPLETE VERSION)
// ========================================
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
        
        // Verify token is still valid
        try {
          const response = await authAPI.getProfile();
          setUser(response.data.user);
        } catch (error) {
          // Token expired, clear auth
          if (error.response?.status === 401) {
            handleLogout();
          }
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  // User/Owner Signup
  const signup = async (userData) => {
    try {
      const response = await authAPI.signup(userData);
      
      return {
        success: true,
        message: 'Registration successful! Please login.'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  // User/Owner Login
  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      
      const { user, accessToken, refreshToken } = response.data;

      // Save to localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      // Update state
      setUser(user);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed'
      };
    }
  };

const adminLogin = async (email, password) => {
  try {
    console.log("1. Admin Login Start:", { email }); // Check input
    
    const res = await fetch('http://localhost:5000/api/auth/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    console.log("2. Backend Response Data:", data); // Check response

    if (res.ok && data.user?.role === 'admin') {
      console.log("3. Login Success! Saving to LocalStorage...");
      
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      setUser(data.user);
      setIsAuthenticated(true);
      return { success: true };
    } else {
      console.error("3. Login Failed logic:", data.message);
      return { success: false, error: data.message || 'Access Denied' };
    }
  } catch (err) {
    console.error("1. Fetch/Network Error:", err);
    return { success: false, error: 'Server connection failed' };
  }
};
  // Logout
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      handleLogout();
    }
  };

  // Clear auth data
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      const response = await authAPI.updateProfile(userData);
      const updatedUser = response.data.user;
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Profile update failed'
      };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    signup,
    login,
    adminLogin,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;