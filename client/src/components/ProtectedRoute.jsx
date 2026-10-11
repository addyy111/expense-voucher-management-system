import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: 12 }}>
        <div className="spinner" style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#1e3a8a', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span>Loading session...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their respective default home dashboard
    if (user.role === 'employee') return <Navigate to="/employee/dashboard" replace />;
    if (user.role === 'director') return <Navigate to="/director/dashboard" replace />;
    if (user.role === 'accounts') return <Navigate to="/accounts/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
}
