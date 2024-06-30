import React, { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  useEffect(() => {
    if (isAuthenticated && user && !user.isProfileComplete && location.pathname !== '/complete-profile') {
      showNotification(
        'To use this page, please complete your profile.',
        'error',
        [
          {
            label: 'Complete Profile',
            onClick: () => navigate('/complete-profile'),
            variant: 'primary'
          }
        ]
      );
    }
  }, [isAuthenticated, user, location.pathname, showNotification, navigate]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (!user?.isProfileComplete && location.pathname !== '/complete-profile') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;