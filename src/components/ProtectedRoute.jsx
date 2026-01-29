import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading, user } = useAuth();
  const location = useLocation();

  // Debug logging
  console.log('ProtectedRoute Debug:', {
    isAuthenticated,
    isAdmin,
    loading,
    user,
    requireAdmin,
    path: location.pathname
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('Redirecting to login: /auth');
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    console.log('User authenticated but not admin, redirecting to /my-applications');
    return <Navigate to="/my-applications" replace />;
  }

  return children;
};

export default ProtectedRoute;
