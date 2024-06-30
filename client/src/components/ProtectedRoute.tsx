import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();
  const { showNotification } = useNotification();

  useEffect(() => {
    if (isAuthenticated && user && !user.isProfileComplete && location.pathname !== '/complete-profile') {
      showNotification('To use the site, please first complete your profile.', 'success');
    }
  }, [isAuthenticated, user, location.pathname, showNotification]);


  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (!user?.isProfileComplete && location.pathname !== '/complete-profile') {
    return <Navigate to="/complete-profile" state={{ from: location }} replace />;
  }
  return <>{children}</> ;
};

export default ProtectedRoute;