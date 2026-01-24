import React from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getUser();

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated but no role restrictions - allow access
  if (allowedRoles.length === 0) {
    return children;
  }

  // Check if user has required role
  if (user && allowedRoles.includes(user.role)) {
    return children;
  }

  // User doesn't have required role - redirect based on their role
  if (user) {
    if (user.role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user.role === 'SELLER') {
      return <Navigate to="/seller/dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  // Fallback - redirect to login
  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;
