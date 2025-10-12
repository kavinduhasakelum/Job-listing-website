import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Loading spinner component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
  </div>
);

// Protected Route component
const ProtectedRoute = ({ 
  children, 
  requiredRole = null, 
  requiredRoles = [], 
  redirectTo = '/register',
  fallback = null 
}) => {
  const { isAuthenticated, loading, hasRole, hasAnyRole, user } = useAuth();
  const location = useLocation();

  // Show loading spinner while auth is being verified
  if (loading) {
    return <LoadingSpinner />;
  }

  // Redirect to login/register if not authenticated
  if (!isAuthenticated) {
    // Save the attempted location for redirecting after login
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check for specific role requirement
  if (requiredRole && !hasRole(requiredRole)) {
    // Show fallback component or redirect based on user role
    if (fallback) {
      return fallback;
    }
    
    // Redirect based on user role
    const roleRedirects = {
      admin: '/admin',
      employer: '/employer-dashboard',
      jobseeker: '/',
    };
    
    const redirectPath = roleRedirects[user?.role?.toLowerCase()] || '/';
    return <Navigate to={redirectPath} replace />;
  }

  // Check for multiple role requirements (user needs at least one)
  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    if (fallback) {
      return fallback;
    }
    
    const roleRedirects = {
      admin: '/admin',
      employer: '/employer-dashboard', 
      jobseeker: '/',
    };
    
    const redirectPath = roleRedirects[user?.role?.toLowerCase()] || '/';
    return <Navigate to={redirectPath} replace />;
  }

  // User is authenticated and has required permissions
  return children;
};

// Higher-order component version for class components (if needed)
// Moved to withAuth.js to support Fast Refresh.

// Specific role-based route components for convenience
export const AdminRoute = ({ children, fallback, redirectTo = '/register' }) => (
  <ProtectedRoute requiredRole="admin" fallback={fallback} redirectTo={redirectTo}>
    {children}
  </ProtectedRoute>
);

export const EmployerRoute = ({ children, fallback, redirectTo = '/register' }) => (
  <ProtectedRoute requiredRole="employer" fallback={fallback} redirectTo={redirectTo}>
    {children}
  </ProtectedRoute>
);

export const JobSeekerRoute = ({ children, fallback, redirectTo = '/register' }) => (
  <ProtectedRoute requiredRole="jobseeker" fallback={fallback} redirectTo={redirectTo}>
    {children}
  </ProtectedRoute>
);

// Component to show different content based on roles
export const RoleBasedRender = ({ 
  adminContent = null, 
  employerContent = null, 
  jobSeekerContent = null, 
  defaultContent = null,
  children 
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return defaultContent;
  }

  const userRole = user?.role?.toLowerCase();

  switch (userRole) {
    case 'admin':
      return adminContent || children;
    case 'employer':
      return employerContent || children;
    case 'jobseeker':
      return jobSeekerContent || children;
    default:
      return defaultContent || children;
  }
};

// Component to conditionally render content based on authentication
export const AuthGuard = ({ 
  authenticated = null, 
  unauthenticated = null, 
  loading = null,
  children 
}) => {
  const { isAuthenticated, loading: authLoading } = useAuth();

  if (authLoading) {
    return loading || <LoadingSpinner />;
  }

  if (isAuthenticated) {
    return authenticated || children;
  }

  return unauthenticated || children;
};

export default ProtectedRoute;